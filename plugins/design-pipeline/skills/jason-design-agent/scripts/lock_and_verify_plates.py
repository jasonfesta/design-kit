#!/usr/bin/env python3
"""Image-to-image conditioning seed, >=1K/2K lossless lock, and crystal-clear gate.

Guarantees that every Nano Banana image produced out of jason-design-agent:
1. Uses explicit image-to-image conditioning (--ref-image verified non-empty; `ref-base`
   slices pixel-perfect 2K base plates directly from Chrome DevTools / Playwright
   full-webpage screenshots so Round 1 transfers rich callouts and micro-details instead
   of starting from empty wireframes; `seed` is strictly a zero-reference fallback).
2. Meets a strict >= 1K floor on EVERY edge (min(width, height) >= 1024px) and locks
   to canonical 2K lossless sRGB PNG dimensions by default:
   - 16:9 widescreen web / experience: 2752x1536
   - 9:16 mobile app / mobile web:     1536x2752
   - 4:3 isolated component:           2400x1792
   - 1:1 square specimen:              2048x2048
   - 1:2 tall full-scroll web:         1536x3072
3. Rejects aspect-ratio squash (> 8% aspect mismatch between raw render and target)
   so 9:16 outputs are never stretched onto 1:2 plates with vertical ghosting.
4. Passes crystal-clear acutance verification (hf_detail_std >= 0.8 and
   sharpness_ratio >= 0.28, matching nano-banana/scripts/eval-image-readiness.py)
   and emits the Pre-Moodboard Designer Image Checkpoint manifest before
   build_moodboard.py runs.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import subprocess
import sys
from typing import Any

MIN_SHORT_EDGE = 1024
DEFAULT_2K_BY_ASPECT: dict[str, tuple[int, int]] = {
    "16:9": (2752, 1536),
    "9:16": (1536, 2752),
    "4:3": (2400, 1792),
    "3:4": (1792, 2400),
    "1:1": (2048, 2048),
    "1:2": (1536, 3072),
}
WARM_BEIGE_BANNED = {
    "#f4efe6",
    "#f6f2ea",
    "#faf6f0",
    "#efe9df",
    "#f5f0e6",
    "#f3ede2",
}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def magick_bin() -> str:
  return "/usr/bin/magick" if pathlib.Path("/usr/bin/magick").exists() else "magick"


def run_magick(args: list[str]) -> str:
  return subprocess.check_output(
      [magick_bin()] + args, text=True, stderr=subprocess.PIPE
  ).strip()


def identify_image(path: pathlib.Path) -> tuple[int, int, str, str]:
  out = run_magick(
      ["identify", "-format", "%w %h %m %[colorspace]", str(path) + "[0]"]
  ).splitlines()[-1]
  parts = out.split()
  return int(parts[0]), int(parts[1]), parts[2].upper(), parts[3] if len(parts) > 3 else "sRGB"


def measure_sharpness(path: pathlib.Path) -> tuple[float, float]:
  hf_std = float(
      run_magick([
          str(path) + "[0]",
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
          str(path) + "[0]",
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
  ratio = hf_std / max(mf_std, 0.01)
  return round(hf_std, 2), round(ratio, 3)


def infer_2k_target(raw_w: int, raw_h: int) -> tuple[int, int]:
  ar = raw_w / max(raw_h, 1)
  best_dims = (2752, 1536)
  best_diff = 999.0
  for dims in DEFAULT_2K_BY_ASPECT.values():
    cand_ar = dims[0] / dims[1]
    diff = abs(ar - cand_ar) / cand_ar
    if diff < best_diff:
      best_diff = diff
      best_dims = dims
  if best_diff <= 0.08:
    return best_dims
  scale = max(MIN_SHORT_EDGE / max(min(raw_w, raw_h), 1), 1.0)
  return round(raw_w * scale), round(raw_h * scale)


def parse_dims(spec: str) -> tuple[int, int]:
  if spec in DEFAULT_2K_BY_ASPECT:
    return DEFAULT_2K_BY_ASPECT[spec]
  parts = spec.lower().split("x")
  if len(parts) != 2:
    raise ValueError(f"Expected WxH or aspect key (16:9, 9:16, 4:3, 1:1), got: {spec}")
  return int(parts[0]), int(parts[1])


def cmd_seed(args: argparse.Namespace) -> int:
  bg = args.bg_hex.strip()
  surface = args.surface_hex.strip()
  accent = args.accent_hex.strip()
  line = args.line_hex.strip()
  if not args.allow_beige and bg.lower() in WARM_BEIGE_BANNED:
    print(
        json.dumps(
            {"passed": False, "error": f"Warm beige default {bg} is banned without --allow-beige."},
            indent=2,
        )
    )
    return 1

  w, h = parse_dims(args.aspect)
  out_path = pathlib.Path(args.out).expanduser().resolve()
  out_path.parent.mkdir(parents=True, exist_ok=True)

  pad_x = round(w * 0.055)
  nav_h = round(h * 0.065)
  hero_top = nav_h + round(h * 0.05)
  hero_bot = round(h * 0.58)
  card_top = hero_bot + round(h * 0.045)
  card_bot = h - round(h * 0.09)
  mid_x = round(w * 0.52)

  draw_ops = [
      f"fill {surface} stroke {line} stroke-width 2 roundrectangle {pad_x},{hero_top} {mid_x - 24},{hero_bot} 16,16",
      f"fill {surface} stroke {line} stroke-width 2 roundrectangle {mid_x + 24},{hero_top} {w - pad_x},{hero_bot} 16,16",
      f"fill {surface} stroke {line} stroke-width 2 roundrectangle {pad_x},{card_top} {w - pad_x},{card_bot} 16,16",
      f"fill {accent} stroke none roundrectangle {pad_x + 36},{hero_bot - 84} {pad_x + 260},{hero_bot - 32} 26,26",
      f"stroke {line} stroke-width 2 line 0,{nav_h} {w},{nav_h}",
  ]
  cmd = [
      magick_bin(),
      "-size",
      f"{w}x{h}",
      f"xc:{bg}",
      "-colorspace",
      "sRGB",
  ]
  for op in draw_ops:
    cmd.extend(["-draw", op])
  cmd.append(str(out_path))
  subprocess.run(cmd, check=True)
  print(
      json.dumps(
          {
              "passed": True,
              "seed_image": str(out_path),
              "px": f"{w}x{h}",
              "note": (
                  "Fallback seed only when zero live benchmark screenshots exist. "
                  "Whenever benchmark URLs exist, prefer `ref-base` cut from Chrome DevTools / Playwright full-webpage PNGs."
              ),
          },
          indent=2,
      )
  )
  return 0


def cmd_ref_base(args: argparse.Namespace) -> int:
  src_path = pathlib.Path(args.fullpage).expanduser().resolve()
  if not src_path.exists():
    print(json.dumps({"passed": False, "error": f"Full-webpage screenshot missing: {src_path}"}, indent=2))
    return 1

  tw, th = parse_dims(args.aspect)
  src_w, src_h, _, _ = identify_image(src_path)
  crop_h = min(src_h, max(1, round((src_w * th) / tw)))
  clamped_y = max(0, min(int(args.offset_y), max(0, src_h - crop_h)))

  out_path = pathlib.Path(args.out).expanduser().resolve()
  out_path.parent.mkdir(parents=True, exist_ok=True)
  subprocess.run(
      [
          magick_bin(),
          str(src_path) + "[0]",
          "-crop",
          f"{src_w}x{crop_h}+0+{clamped_y}",
          "+repage",
          "-colorspace",
          "sRGB",
          "-strip",
          "-filter",
          "Lanczos",
          "-resize",
          f"{tw}x{th}!",
          "-define",
          "png:compression-level=9",
          str(out_path),
      ],
      check=True,
  )
  audit = audit_single_plate(out_path, min_short_edge=MIN_SHORT_EDGE)
  audit["source_fullpage"] = str(src_path)
  audit["crop_offset_y"] = clamped_y
  print(json.dumps(audit, indent=2))
  return 0 if audit["passed"] else 1


def audit_single_plate(
    path: pathlib.Path,
    min_short_edge: int = MIN_SHORT_EDGE,
    min_hf_std: float = 0.8,
    min_sharpness_ratio: float = 0.28,
) -> dict[str, Any]:
  row: dict[str, Any] = {"file": str(path), "passed": False, "reasons": []}
  if not path.exists() or path.stat().st_size == 0:
    row["reasons"].append("missing_or_empty")
    return row
  try:
    w, h, fmt, cs = identify_image(path)
  except (subprocess.CalledProcessError, ValueError, IndexError):
    row["reasons"].append("corrupt_or_undecodable")
    return row

  row["px"] = f"{w}x{h}"
  row["width"] = w
  row["height"] = h
  row["format"] = fmt
  row["colorspace"] = cs

  if min(w, h) < min_short_edge:
    row["reasons"].append(
        f"below_1k_short_edge (min_edge={min(w, h)}px < {min_short_edge}px)"
    )

  try:
    hf_std, sharp_ratio = measure_sharpness(path)
    row["hf_detail_std"] = hf_std
    row["sharpness_ratio"] = sharp_ratio
    if hf_std < min_hf_std:
      row["reasons"].append(f"low_detail_blur (hf_detail_std={hf_std} < {min_hf_std})")
    elif sharp_ratio < min_sharpness_ratio:
      row["reasons"].append(
          f"soft_or_blurry (sharpness_ratio={sharp_ratio} < {min_sharpness_ratio})"
      )
  except (subprocess.CalledProcessError, ValueError):
    row["reasons"].append("sharpness_probe_failed")

  row["passed"] = len(row["reasons"]) == 0
  return row


def cmd_lock(args: argparse.Namespace) -> int:
  raw_path = pathlib.Path(args.raw).expanduser().resolve()
  out_path = pathlib.Path(args.out).expanduser().resolve()
  if not raw_path.exists():
    print(json.dumps({"passed": False, "error": f"Raw image missing: {raw_path}"}, indent=2))
    return 1

  refs = [pathlib.Path(r).expanduser().resolve() for r in (args.ref_image or [])]
  if not refs:
    print(
        json.dumps(
            {
                "passed": False,
                "error": (
                    "Image-to-image reference required: pass at least one --ref-image "
                    "(anchor plate, Round 1 plate, benchmark crop, or `seed` canvas) that was "
                    "supplied in ImagePaths / --input_image."
                ),
            },
            indent=2,
        )
    )
    return 1
  missing_refs = [str(r) for r in refs if not r.exists()]
  if missing_refs:
    print(
        json.dumps(
            {"passed": False, "error": f"Reference image(s) not found: {missing_refs}"},
            indent=2,
        )
    )
    return 1

  if out_path.suffix.lower() != ".png" and not args.keep_format:
    out_path = out_path.with_suffix(".png")
  out_path.parent.mkdir(parents=True, exist_ok=True)

  raw_w, raw_h, _, _ = identify_image(raw_path)
  if args.target_px:
    tw, th = parse_dims(args.target_px)
  else:
    tw, th = infer_2k_target(raw_w, raw_h)

  if min(tw, th) < MIN_SHORT_EDGE:
    scale = MIN_SHORT_EDGE / max(min(tw, th), 1)
    tw, th = round(tw * scale), round(th * scale)

  raw_ar = raw_w / max(raw_h, 1)
  tgt_ar = tw / max(th, 1)
  ar_drift = abs(raw_ar - tgt_ar) / tgt_ar
  if ar_drift > 0.08 and not args.allow_aspect_crop:
    print(
        json.dumps(
            {
                "passed": False,
                "error": (
                    f"Aspect-ratio mismatch ({raw_w}x{raw_h} raw vs {tw}x{th} target, "
                    f"drift={ar_drift*100:.1f}% > 8%). Refusing vertical/horizontal squash "
                    "to prevent blurry ghosted text; re-generate at matching aspect or pass "
                    "--allow-aspect-crop to center-crop cleanly."
                ),
            },
            indent=2,
        )
    )
    return 1

  cmd = [
      magick_bin(),
      str(raw_path) + "[0]",
      "-colorspace",
      "sRGB",
      "-strip",
      "-filter",
      "Lanczos",
  ]
  if ar_drift > 0.015 and args.allow_aspect_crop:
    cmd.extend(["-resize", f"{tw}x{th}^", "-gravity", "north", "-extent", f"{tw}x{th}"])
  else:
    cmd.extend(["-resize", f"{tw}x{th}!"])
  cmd.extend([
      "-unsharp",
      "0x0.65+0.55+0.008",
      "-define",
      "png:compression-level=9",
      str(out_path),
  ])
  subprocess.run(cmd, check=True)

  audit = audit_single_plate(
      out_path,
      min_short_edge=MIN_SHORT_EDGE,
      min_hf_std=args.min_hf_std,
      min_sharpness_ratio=args.min_sharpness_ratio,
  )
  audit["raw_px"] = f"{raw_w}x{raw_h}"
  audit["reference_images"] = [str(r) for r in refs]
  print(json.dumps(audit, indent=2))
  return 0 if audit["passed"] else 1


def cmd_verify(args: argparse.Namespace) -> int:
  study_dir = pathlib.Path(args.study_dir).expanduser().resolve()
  plate_paths: list[tuple[str, str, pathlib.Path]] = []

  if args.config:
    cfg_path = pathlib.Path(args.config).expanduser().resolve()
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    for it in cfg.get("items", []):
      rel = str(it.get("relPng") or it.get("plate") or "")
      if rel:
        plate_paths.append(
            (str(it.get("id", "")), str(it.get("title", "")), study_dir / rel.lstrip("./"))
        )
  else:
    root = study_dir / ("nano" if (study_dir / "nano").exists() else "concepts")
    for p in sorted(root.rglob("*")):
      if p.is_file() and p.suffix.lower() in IMAGE_EXTS and p.parent.name != "_imported":
        plate_paths.append((p.stem, f"{p.parent.name} — {p.stem}", p))

  if not plate_paths:
    print(json.dumps({"passed": False, "error": f"No plates found in {study_dir}"}, indent=2))
    return 1

  rows: list[dict[str, Any]] = []
  for pid, title, path in plate_paths:
    audit = audit_single_plate(
        path,
        min_short_edge=args.min_short_edge,
        min_hf_std=args.min_hf_std,
        min_sharpness_ratio=args.min_sharpness_ratio,
    )
    audit["id"] = pid
    audit["title"] = title
    rows.append(audit)

  failed = [r for r in rows if not r["passed"]]
  passed_all = len(failed) == 0

  checkpoint_md_lines = [
      "# pre-moodboard designer image checkpoint",
      "",
      f"- **study**: `{study_dir.name}`",
      f"- **plates verified**: `{len(rows) - len(failed)} / {len(rows)}` (`min_short_edge >= {args.min_short_edge}px`, `sharpness_ratio >= {args.min_sharpness_ratio}`)",
      f"- **gate status**: `{'READY_FOR_DESIGNER_CHECKPOINT' if passed_all else 'BLOCKED_FIX_PLATES_FIRST'}`",
      "",
      "| id | title | px | format | sharpness_ratio | hf_std | status | file |",
      "| :-- | :-- | :-- | :-- | :--: | :--: | :-- | :-- |",
  ]
  for r in rows:
    status_str = "pass" if r["passed"] else ("fail: " + ", ".join(r["reasons"]))
    fname = pathlib.Path(r["file"]).name
    checkpoint_md_lines.append(
        f"| `{r['id']}` | {r['title']} | `{r.get('px', 'n/a')}` | `{r.get('format', 'n/a')}` | "
        f"`{r.get('sharpness_ratio', 'n/a')}` | `{r.get('hf_detail_std', 'n/a')}` | "
        f"{status_str} | [{fname}](file://{r['file']}) |"
    )

  ckpt_dir = study_dir / "critique"
  ckpt_dir.mkdir(parents=True, exist_ok=True)
  ckpt_md = ckpt_dir / "pre-moodboard-image-checkpoint.md"
  ckpt_md.write_text("\n".join(checkpoint_md_lines) + "\n", encoding="utf-8")

  report = {
      "passed": passed_all,
      "study_dir": str(study_dir),
      "total_plates": len(rows),
      "passed_count": len(rows) - len(failed),
      "failed_count": len(failed),
      "checkpoint_markdown": str(ckpt_md),
      "next_step": (
          "Show all verified plates + pre-moodboard-image-checkpoint.md to the designer "
          "and wait for sign-off BEFORE running build_moodboard.py."
          if passed_all
          else "Re-generate or re-lock failing plates before showing checkpoint or building moodboard."
      ),
      "plates": rows,
  }
  if args.out_json:
    pathlib.Path(args.out_json).expanduser().resolve().write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
  print(json.dumps(report, indent=2))
  return 0 if passed_all else 1


def main() -> int:
  parser = argparse.ArgumentParser(
      description="Enforce image-to-image reference conditioning, >=1K/2K lossless PNG lock, and crystal-clear sharpness."
  )
  sub = parser.add_subparsers(dest="command", required=True)

  p_seed = sub.add_parser(
      "seed",
      help="Generate a non-beige structural/chromatic seed PNG so Round 1 anchors run image-to-image.",
  )
  p_seed.add_argument("--out", required=True, help="Output seed PNG path.")
  p_seed.add_argument("--aspect", default="16:9", help="Aspect key (16:9, 9:16, 4:3, 1:1) or WxH.")
  p_seed.add_argument("--bg-hex", default="#FFFFFF", help="Primary non-beige background hex.")
  p_seed.add_argument("--surface-hex", default="#F5F7FA", help="Elevated surface hex.")
  p_seed.add_argument("--accent-hex", default="#0B3D26", help="Primary accent hex.")
  p_seed.add_argument("--line-hex", default="#DCE1E8", help="1px hairline border hex.")
  p_seed.add_argument("--allow-beige", action="store_true", help="Allow warm beige only when user requested it.")

  p_ref_base = sub.add_parser(
      "ref-base",
      help="Slice a pixel-perfect 2K base transfer plate directly from a Chrome DevTools / Playwright full-webpage PNG.",
  )
  p_ref_base.add_argument("--fullpage", required=True, help="Path to desktop-fullpage.png or mobile-fullpage.png.")
  p_ref_base.add_argument("--out", required=True, help="Output 2K base PNG path.")
  p_ref_base.add_argument("--aspect", default="16:9", help="Aspect key (16:9, 9:16, 4:3, 1:1) or WxH.")
  p_ref_base.add_argument("--offset-y", type=int, default=0, help="Vertical physical pixel offset into fullpage PNG.")

  p_lock = sub.add_parser(
      "lock",
      help="Lock a raw Nano Banana image to >=1K/2K lossless sRGB PNG with sharpness & aspect-squash verification.",
  )
  p_lock.add_argument("--raw", required=True, help="Raw generated image path.")
  p_lock.add_argument("--out", required=True, help="Locked output plate path (.png).")
  p_lock.add_argument(
      "--ref-image",
      action="append",
      required=True,
      help="Reference image path(s) passed in ImagePaths / --input_image (at least 1 required).",
  )
  p_lock.add_argument("--target-px", help="Target WxH or aspect key (default: canonical 2K for aspect).")
  p_lock.add_argument("--keep-format", action="store_true", help="Keep non-PNG extension if explicitly needed.")
  p_lock.add_argument("--allow-aspect-crop", action="store_true", help="Top-crop instead of failing on >8% aspect mismatch.")
  p_lock.add_argument("--min-hf-std", type=float, default=0.8)
  p_lock.add_argument("--min-sharpness-ratio", type=float, default=0.28)

  p_verify = sub.add_parser(
      "verify",
      help="Audit all study plates for >=1K short edge & crystal-clear sharpness and emit pre-moodboard checkpoint.",
  )
  p_verify.add_argument("--study-dir", required=True, help="Study directory.")
  p_verify.add_argument("--config", help="Optional moodboard-config.json path.")
  p_verify.add_argument("--min-short-edge", type=int, default=MIN_SHORT_EDGE)
  p_verify.add_argument("--min-hf-std", type=float, default=0.8)
  p_verify.add_argument("--min-sharpness-ratio", type=float, default=0.28)
  p_verify.add_argument("--out-json", help="Optional JSON report path.")

  args = parser.parse_args()
  if args.command == "seed":
    return cmd_seed(args)
  if args.command == "ref-base":
    return cmd_ref_base(args)
  if args.command == "lock":
    return cmd_lock(args)
  return cmd_verify(args)


if __name__ == "__main__":
  sys.exit(main())
