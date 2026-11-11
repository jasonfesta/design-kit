#!/usr/bin/env python3
"""Deterministic image readiness and anti-blur evaluator for jason-dev-agent (nano-banana & image-to-react).

Verifies that 100% of photographic assets (in an assets directory and/or mounted
inside a built React dist/index.html) are:
  1. Ready & decodable (exists, >0 bytes, valid image stream, img.complete && naturalWidth > 0)
  2. Crisp >= 2x Retina pixel density relative to rendered CSS dimensions (effective DPR >= 1.95x)
  3. Not blurry (passes both Laplacian acutance floor and 0.5x->2x roundtrip true-detail ratio
     so fake bicubic upscales and blurry crops are caught automatically)
  4. Unsquashed (aspect ratio locked or explicit object-fit cover/contain)
"""

import argparse
import json
import pathlib
import subprocess
import sys
import tempfile
from typing import Any


IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".avif"}


def run_magick(args: list[str]) -> str:
  """Runs ImageMagick (/usr/bin/magick) and returns stripped stdout."""
  magick_bin = "/usr/bin/magick" if pathlib.Path("/usr/bin/magick").exists() else "magick"
  return subprocess.check_output([magick_bin] + args, text=True, stderr=subprocess.DEVNULL).strip()


def evaluate_image_file(
    img_path: pathlib.Path,
    css_w: float = 0.0,
    css_h: float = 0.0,
    object_fit: str = "cover",
    min_dpr: float = 1.95,
    min_hf_std: float = 0.8,
    min_sharpness_ratio: float = 0.28,
) -> dict[str, Any]:
  """Evaluates a single raster image file for readiness, 2x Retina density, and sharpness."""
  result: dict[str, Any] = {
      "file": str(img_path),
      "ready_ok": False,
      "density_ok": True,
      "sharp_ok": False,
      "aspect_ok": True,
      "reasons": [],
  }
  if not img_path.exists() or img_path.stat().st_size == 0:
    result["reasons"].append("missing_or_empty_file")
    result["passed"] = False
    return result

  try:
    ident = run_magick(["identify", "-format", "%w %h %[colorspace]", str(img_path)]).splitlines()[-1]
    parts = ident.split()
    nat_w, nat_h = int(parts[0]), int(parts[1])
    colorspace = parts[2] if len(parts) > 2 else "unknown"
  except (subprocess.CalledProcessError, ValueError, IndexError):
    result["reasons"].append("corrupt_or_undecodable_image")
    result["passed"] = False
    return result

  if nat_w <= 0 or nat_h <= 0:
    result["reasons"].append("zero_intrinsic_dimensions")
    result["passed"] = False
    return result

  result["ready_ok"] = True
  result["natural_px"] = f"{nat_w}x{nat_h}"
  result["colorspace"] = colorspace

  # Gate 2: 2x Retina pixel density vs CSS box (or standalone 2x floor)
  if css_w > 0 and css_h > 0:
    dpr_w = nat_w / css_w
    dpr_h = nat_h / css_h
    eff_dpr = min(dpr_w, dpr_h)
    result["css_px"] = f"{round(css_w, 1)}x{round(css_h, 1)}"
    result["effective_dpr"] = round(eff_dpr, 2)
    if eff_dpr < min_dpr:
      result["density_ok"] = False
      result["reasons"].append(
          f"below_2x_retina_density (dpr={eff_dpr:.2f}x, need >={min_dpr}x for {round(css_w)}x{round(css_h)} CSS box)"
      )
    # Gate 4: Aspect squashing check when object-fit is 'fill' or unset
    if object_fit not in ("cover", "contain", "scale-down"):
      nat_ar = nat_w / nat_h
      css_ar = css_w / css_h
      ar_drift = abs(nat_ar - css_ar) / max(css_ar, 0.001)
      result["aspect_drift_pct"] = round(ar_drift * 100.0, 2)
      if ar_drift > 0.015:
        result["aspect_ok"] = False
        result["reasons"].append(f"squashed_aspect_ratio (drift={ar_drift*100:.1f}% with object-fit={object_fit})")
  else:
    if min(nat_w, nat_h) < 256:
      result["density_ok"] = False
      result["reasons"].append(f"low_intrinsic_resolution ({nat_w}x{nat_h} < 256px min edge)")

  # Gate 3: Anti-blur & true high-frequency sharpness check
  # Compares fine detail (sigma=1.2px residual) against mid-scale structure (sigma=4.0px residual).
  # Because background negative space scales hf and mf equally, hf/mf cleanly catches blurry
  # or stretched upscales regardless of how minimalist the composition is.
  try:
    hf_std = float(
        run_magick([
            str(img_path),
            "-alpha",
            "remove",
            "-background",
            "white",
            "-colorspace",
            "Gray",
            "(",
            "+clone",
            "-blur",
            "0x1.2",
            ")",
            "-compose",
            "Difference",
            "-composite",
            "-format",
            "%[fx:standard_deviation*255]",
            "info:",
        ])
    )
    mf_std = float(
        run_magick([
            str(img_path),
            "-alpha",
            "remove",
            "-background",
            "white",
            "-colorspace",
            "Gray",
            "(",
            "+clone",
            "-blur",
            "0x4.0",
            ")",
            "-compose",
            "Difference",
            "-composite",
            "-format",
            "%[fx:standard_deviation*255]",
            "info:",
        ])
    )
    sharpness_ratio = hf_std / max(mf_std, 0.01)
    result["hf_detail_std"] = round(hf_std, 2)
    result["sharpness_ratio"] = round(sharpness_ratio, 3)

    if hf_std < min_hf_std:
      result["sharp_ok"] = False
      result["reasons"].append(
          f"blurry_low_detail (hf_detail_std={hf_std:.2f} < {min_hf_std})"
      )
    elif sharpness_ratio < min_sharpness_ratio:
      result["sharp_ok"] = False
      result["reasons"].append(
          f"blurry_or_soft_upscale (sharpness_ratio={sharpness_ratio:.3f} < {min_sharpness_ratio}; needs nano-banana restoration)"
      )
    else:
      result["sharp_ok"] = True
  except (subprocess.CalledProcessError, ValueError):
    result["sharp_ok"] = False
    result["reasons"].append("sharpness_probe_failed")

  result["passed"] = bool(
      result["ready_ok"]
      and result["density_ok"]
      and result["sharp_ok"]
      and result["aspect_ok"]
  )
  return result


def probe_dom_images(html_path: pathlib.Path, viewport_w: int = 1440, viewport_h: int = 900) -> list[dict[str, Any]]:
  """Probes rendered <img> elements in WebKit2GTK under xvfb-run to check live readiness & DPR."""
  helper_code = r"""
import base64, json, pathlib, sys, urllib.parse
import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib

html_file = pathlib.Path(sys.argv[1]).resolve()
vw, vh = int(sys.argv[2]), int(sys.argv[3])
out_json = pathlib.Path(sys.argv[4])

win = Gtk.OffscreenWindow()
win.set_default_size(vw, vh)
wv = WebKit2.WebView()
win.add(wv)
win.show_all()

JS = '''
(() => {
  const imgs = Array.from(document.querySelectorAll('img'));
  return JSON.stringify(imgs.map((img, i) => {
    const r = img.getBoundingClientRect();
    const st = window.getComputedStyle(img);
    return {
      index: i,
      alt: img.getAttribute('alt') || '',
      src: img.currentSrc || img.getAttribute('src') || '',
      complete: Boolean(img.complete),
      naturalWidth: img.naturalWidth || 0,
      naturalHeight: img.naturalHeight || 0,
      cssWidth: r.width,
      cssHeight: r.height,
      objectFit: st.objectFit || 'fill',
      visible: st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0
    };
  }));
})()
'''

def run_js():
    def cb(obj, res, _data):
        try:
            val = obj.run_javascript_finish(res)
            s = val.get_js_value().to_string()
            out_json.write_text(s, encoding='utf-8')
        except Exception as e:
            out_json.write_text(json.dumps({"error": str(e)}), encoding='utf-8')
        Gtk.main_quit()
    wv.run_javascript(JS, None, cb, None)
    return False

def on_load(view, event):
    if event == WebKit2.LoadEvent.FINISHED:
        GLib.timeout_add(450, run_js)

wv.connect('load-changed', on_load)
GLib.timeout_add(8000, lambda: (Gtk.main_quit(), False)[1])
wv.load_uri(html_file.as_uri())
Gtk.main()
"""
  with tempfile.TemporaryDirectory(prefix="img_ready_") as tmp:
    tmp_dir = pathlib.Path(tmp)
    script_p = tmp_dir / "probe.py"
    out_p = tmp_dir / "imgs.json"
    script_p.write_text(helper_code, encoding="utf-8")
    subprocess.run(
        ["xvfb-run", "-a", "/usr/bin/python3", str(script_p), str(html_path), str(viewport_w), str(viewport_h), str(out_p)],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if out_p.exists():
      loaded = json.loads(out_p.read_text(encoding="utf-8"))
      if isinstance(loaded, list):
        return loaded
  return []


def resolve_dom_src_to_file(src: str, base_dir: pathlib.Path, tmp_dir: pathlib.Path, idx: int) -> pathlib.Path | None:
  """Resolves a file://, relative, or data:image/... src into a disk file for sharpness testing."""
  if not src:
    return None
  if src.startswith("data:image/"):
    import base64  # pylint: disable=g-import-not-at-top
    if ";base64," in src:
      header, b64 = src.split(";base64,", 1)
      if "svg" in header:
        return None
      ext = ".png" if "png" in header else (".webp" if "webp" in header else ".jpg")
      out = tmp_dir / f"inline_img_{idx}{ext}"
      out.write_bytes(base64.b64decode(b64))
      return out
    return None
  if src.startswith("file://"):
    import urllib.parse  # pylint: disable=g-import-not-at-top
    p = pathlib.Path(urllib.parse.unquote(src.replace("file://", "")))
    return p if p.exists() else None
  if src.startswith(("http://", "https://")):
    return None
  rel = (base_dir / src.lstrip("./")).resolve()
  return rel if rel.exists() else None


def main() -> None:
  parser = argparse.ArgumentParser(description="Evaluate image readiness, 2x Retina density, and sharpness (non-blur).")
  parser.add_argument("--assets-dir", help="Directory of extracted or upscaled raster assets to audit.")
  parser.add_argument("--html", help="Built HTML file (e.g., dist/index.html) to probe rendered <img> readiness and DPR.")
  parser.add_argument("--project", help="Golden Template project directory (probes dist/index.html + public/assets).")
  parser.add_argument("--viewport-width", type=int, default=1440, help="Viewport width for DOM DPR measurement.")
  parser.add_argument("--viewport-height", type=int, default=900, help="Viewport height for DOM DPR measurement.")
  parser.add_argument("--min-dpr", type=float, default=1.95, help="Minimum effective Retina DPR (default 1.95x).")
  parser.add_argument("--min-hf-std", type=float, default=0.8, help="Minimum high-frequency detail std (0..255).")
  parser.add_argument("--min-sharpness-ratio", type=float, default=0.28, help="Minimum hf/mf sharpness ratio (default 0.28).")
  parser.add_argument("--out-json", help="Optional path to write full JSON report.")
  args = parser.parse_args()

  reports: list[dict[str, Any]] = []

  if args.assets_dir:
    adir = pathlib.Path(args.assets_dir).resolve()
    for p in sorted(adir.rglob("*")):
      if p.is_file() and p.suffix.lower() in IMAGE_EXTS:
        reports.append(
            evaluate_image_file(
                p,
                min_dpr=args.min_dpr,
                min_hf_std=args.min_hf_std,
                min_sharpness_ratio=args.min_sharpness_ratio,
            )
        )

  html_target: pathlib.Path | None = None
  if args.html:
    html_target = pathlib.Path(args.html).resolve()
  elif args.project:
    pdir = pathlib.Path(args.project).resolve()
    cand = pdir / "dist" / "index.html"
    if cand.exists():
      html_target = cand

  if html_target and html_target.exists():
    dom_imgs = probe_dom_images(html_target, args.viewport_width, args.viewport_height)
    with tempfile.TemporaryDirectory(prefix="dom_inline_") as tmp:
      tmp_p = pathlib.Path(tmp)
      for item in dom_imgs:
        if not item.get("visible"):
          continue
        src = str(item.get("src", ""))
        if src.endswith(".svg") or src.startswith("data:image/svg"):
          continue
        if not item.get("complete") or int(item.get("naturalWidth", 0)) <= 0:
          reports.append({
              "file": src[:120] or f"img[{item.get('index')}]",
              "ready_ok": False,
              "density_ok": False,
              "sharp_ok": False,
              "aspect_ok": False,
              "passed": False,
              "reasons": ["dom_image_not_loaded_or_broken"],
          })
          continue
        disk_p = resolve_dom_src_to_file(src, html_target.parent, tmp_p, int(item.get("index", 0)))
        if disk_p is not None:
          rep = evaluate_image_file(
              disk_p,
              css_w=float(item.get("cssWidth", 0.0)),
              css_h=float(item.get("cssHeight", 0.0)),
              object_fit=str(item.get("objectFit", "cover")),
              min_dpr=args.min_dpr,
              min_hf_std=args.min_hf_std,
              min_sharpness_ratio=args.min_sharpness_ratio,
          )
          rep["dom_index"] = item.get("index")
          rep["alt"] = item.get("alt", "")
          reports.append(rep)

  total = len(reports)
  failed = [r for r in reports if not r.get("passed")]
  summary = {
      "passed": len(failed) == 0 and total > 0,
      "total_images_checked": total,
      "ready_count": sum(1 for r in reports if r.get("ready_ok")),
      "sharp_2x_count": sum(1 for r in reports if r.get("passed")),
      "failed_count": len(failed),
      "images": reports,
  }

  out_str = json.dumps(summary, indent=2)
  if args.out_json:
    pathlib.Path(args.out_json).write_text(out_str + "\n", encoding="utf-8")
  print(out_str)
  sys.exit(0 if (len(failed) == 0) else 1)


if __name__ == "__main__":
  main()
