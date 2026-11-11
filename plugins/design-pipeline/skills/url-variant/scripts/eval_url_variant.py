#!/usr/bin/env python3
"""Diagnostic Uniqueness, Quality & Regression Scorer + Designer Review Checkpoint Generator.

Workflow Role:
  1. All variation prompt architecture happens AHEAD OF TIME (`plan_and_run_variant.py plan` +
     `audit-prompts`) because the variation is executed while passing in the captured screenshot.
  2. Once Pass 1 (Desktop) and Pass 2 (Mobile) finish, this script computes three `0-100`
     diagnostic scores per surface (without triggering blind auto-retries):
       - `uniqueness_score` (0-100): Palette Delta E, 16x16 RGB MAE, and 0% copy overlap.
       - `quality_score`    (0-100): Standalone 2K acutance, grid orthogonality, and contrast.
       - `regression_score` (0-100, 100 = Zero Regression): Complexity retention ratio,
         sharpness parity, grid alignment parity, and vertical section rhythm vs. the original.
  3. Emits `variants/eval-report.json`, `variants/designer-review-checkpoint.md`, and
     `<study-dir>/index.html` so the output and scores are handed directly to the Designer
     for review and dial calibration.
"""

from __future__ import annotations

import argparse
import html
import json
import math
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
from typing import Any

MAGICK = "/usr/bin/magick" if pathlib.Path("/usr/bin/magick").exists() else "magick"
TESSERACT = shutil.which("tesseract")


def run_magick(args: list[str]) -> str:
  return subprocess.check_output([MAGICK] + args, text=True, stderr=subprocess.STDOUT).strip()


def identify_dims(path: pathlib.Path) -> tuple[int, int, str]:
  out = run_magick(["identify", "-format", "%w %h %m", f"{path}[0]"]).splitlines()[-1].split()
  return int(out[0]), int(out[1]), out[2].upper()


def hex_to_rgb(h: str) -> tuple[int, int, int] | None:
  s = (h or "").strip().lstrip("#")
  if len(s) == 6:
    try:
      return int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16)
    except ValueError:
      return None
  return None


def rgb_to_lab(rgb: tuple[int, int, int]) -> tuple[float, float, float]:
  def lin(c: int) -> float:
    v = c / 255.0
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

  r, g, b = lin(rgb[0]), lin(rgb[1]), lin(rgb[2])
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  def f(t: float) -> float:
    return t ** (1 / 3) if t > 0.008856 else (7.787 * t) + (16 / 116)

  fx, fy, fz = f(x), f(y), f(z)
  return (116 * fy - 16), 500 * (fx - fy), 200 * (fy - fz)


def delta_e_lab(hex_a: str, hex_b: str) -> float:
  ra, rb = hex_to_rgb(hex_a), hex_to_rgb(hex_b)
  if not ra or not rb:
    return 0.0
  la, aa, ba = rgb_to_lab(ra)
  lb, ab, bb = rgb_to_lab(rb)
  return math.sqrt((la - lb) ** 2 + (aa - ab) ** 2 + (ba - bb) ** 2)


def extract_dominant_hexes(path: pathlib.Path, k: int = 6) -> list[tuple[str, float]]:
  out = run_magick([
      f"{path}[0]",
      "-colorspace",
      "sRGB",
      "-alpha",
      "remove",
      "-resize",
      "160x160!",
      "-colors",
      str(k),
      "-format",
      "%c",
      "histogram:info:",
  ])
  rows: list[tuple[str, int]] = []
  total = 0
  for line in out.splitlines():
    m_cnt = re.search(r"^\s*(\d+):", line)
    m_hex = re.search(r"#([0-9A-Fa-f]{6})", line)
    if m_cnt and m_hex:
      cnt = int(m_cnt.group(1))
      hx = "#" + m_hex.group(1).upper()
      rows.append((hx, cnt))
      total += cnt
  rows.sort(key=lambda x: x[1], reverse=True)
  if total == 0:
    return [("#000000", 1.0)]
  return [(hx, round(cnt / total, 4)) for hx, cnt in rows]


def palette_divergence(orig_path: pathlib.Path, var_path: pathlib.Path) -> dict[str, Any]:
  orig_pal = extract_dominant_hexes(orig_path, k=6)
  var_pal = extract_dominant_hexes(var_path, k=6)
  orig_hexes = [h for h, _ in orig_pal]
  weighted_min_de = 0.0
  chrom_shift = []
  for vh, vw in var_pal:
    min_de = min(delta_e_lab(vh, oh) for oh in orig_hexes)
    weighted_min_de += min_de * vw
    chrom_shift.append({"variant_hex": vh, "weight": vw, "min_delta_e_vs_orig": round(min_de, 2)})
  return {
      "original_dominant_palette": orig_pal,
      "variant_dominant_palette": var_pal,
      "weighted_mean_delta_e": round(weighted_min_de, 2),
      "clusters": chrom_shift,
  }


def compute_grid_mae(orig_path: pathlib.Path, var_path: pathlib.Path, grid: int = 16) -> float:
  with tempfile.TemporaryDirectory(prefix="url_var_mae_") as tmp:
    pa = pathlib.Path(tmp) / "a.png"
    pb = pathlib.Path(tmp) / "b.png"
    for src, dst in ((orig_path, pa), (var_path, pb)):
      subprocess.run(
          [
              MAGICK,
              f"{src}[0]",
              "-colorspace",
              "sRGB",
              "-alpha",
              "remove",
              "-filter",
              "box",
              "-resize",
              f"{grid}x{grid}!",
              "-depth",
              "8",
              str(dst),
          ],
          check=True,
          capture_output=True,
      )
    p = subprocess.run(
        [MAGICK, "compare", "-metric", "MAE", str(pa), str(pb), "null:"],
        capture_output=True,
        text=True,
    )
    txt = (p.stderr or p.stdout).strip()
    if "(" in txt:
      norm = float(txt.split("(")[1].rstrip(")").split()[0])
      return round(norm * 255.0, 2)
    val = float(txt.split()[0])
    return round(val / 65535.0 * 255.0, 2) if val > 1.0 else round(val * 255.0, 2)


def measure_acutance_and_grid_quality(path: pathlib.Path) -> dict[str, float]:
  hf_std = float(
      run_magick([
          f"{path}[0]",
          "-alpha",
          "remove",
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
      ]).splitlines()[-1]
  )
  mf_std = float(
      run_magick([
          f"{path}[0]",
          "-alpha",
          "remove",
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
      ]).splitlines()[-1]
  )
  lum_std = float(
      run_magick([
          f"{path}[0]",
          "-alpha",
          "remove",
          "-colorspace",
          "Gray",
          "-format",
          "%[fx:standard_deviation*255]",
          "info:",
      ]).splitlines()[-1]
  )
  h_edge = float(
      run_magick([
          f"{path}[0]",
          "-alpha",
          "remove",
          "-colorspace",
          "Gray",
          "-resize",
          "512x512!",
          "-morphology",
          "Convolve",
          "Sobel:0",
          "-format",
          "%[fx:mean*255]",
          "info:",
      ]).splitlines()[-1]
  )
  v_edge = float(
      run_magick([
          f"{path}[0]",
          "-alpha",
          "remove",
          "-colorspace",
          "Gray",
          "-resize",
          "512x512!",
          "-morphology",
          "Convolve",
          "Sobel:90",
          "-format",
          "%[fx:mean*255]",
          "info:",
      ]).splitlines()[-1]
  )
  hv_ratio = (h_edge + v_edge) / max(h_edge + v_edge + 4.0, 1e-5)

  return {
      "hf_detail_std": round(hf_std, 2),
      "mf_detail_std": round(mf_std, 2),
      "sharpness_ratio": round(hf_std / max(mf_std, 0.01), 3),
      "luminance_std": round(lum_std, 2),
      "hv_edge_ratio": round(hv_ratio, 3),
  }


def measure_vibe_rhythm_correlation(orig_path: pathlib.Path, var_path: pathlib.Path, bands: int = 24) -> float:
  def profile(p: pathlib.Path) -> list[float]:
    out = run_magick([
        f"{p}[0]",
        "-alpha",
        "remove",
        "-colorspace",
        "Gray",
        "-resize",
        "256x1024!",
        "-edge",
        "1",
        "-filter",
        "box",
        "-resize",
        f"1x{bands}!",
        "-depth",
        "8",
        "txt:",
    ])
    vals: list[float] = []
    for line in out.splitlines():
      if line.startswith("#"):
        continue
      m = re.search(r"\((\d+(?:\.\d+)?)", line)
      if m:
        vals.append(float(m.group(1)))
    return vals if len(vals) == bands else [1.0] * bands

  a = profile(orig_path)
  b = profile(var_path)
  ma = sum(a) / len(a)
  mb = sum(b) / len(b)
  num = sum((x - ma) * (y - mb) for x, y in zip(a, b))
  den = math.sqrt(sum((x - ma) ** 2 for x in a) * sum((y - mb) ** 2 for y in b))
  if den < 1e-6:
    return 0.5
  return round(max(-1.0, min(1.0, num / den)), 3)


def extract_ocr_text(path: pathlib.Path) -> str:
  if not TESSERACT:
    return ""
  try:
    p = subprocess.run(
        [TESSERACT, str(path), "stdout", "--oem", "1", "-l", "eng"],
        capture_output=True,
        text=True,
        timeout=25,
    )
    return p.stdout or ""
  except Exception:
    return ""


def compute_text_overlap(orig_phrases: list[str], var_text: str) -> dict[str, Any]:
  def norm_words(s: str) -> list[str]:
    return [w for w in re.findall(r"[a-z0-9]{3,}", s.lower()) if w not in {"the", "and", "for", "with", "from", "that", "this", "your", "you", "are", "our"}]

  orig_corpus = " ".join(orig_phrases)
  orig_words = set(norm_words(orig_corpus))
  orig_trigrams = set()
  ow_list = norm_words(orig_corpus)
  for i in range(len(ow_list) - 2):
    orig_trigrams.add((ow_list[i], ow_list[i + 1], ow_list[i + 2]))

  var_w_list = norm_words(var_text)
  if not var_w_list:
    return {
        "ocr_available": bool(TESSERACT),
        "variant_word_count": 0,
        "word_overlap_ratio": 0.0,
        "trigram_overlap_ratio": 0.0,
        "leaked_trigrams": [],
    }

  var_trigrams = {(var_w_list[i], var_w_list[i + 1], var_w_list[i + 2]) for i in range(len(var_w_list) - 2)}
  shared_words = [w for w in set(var_w_list) if w in orig_words]
  shared_tri = [" ".join(t) for t in (var_trigrams & orig_trigrams)]

  word_ratio = len(shared_words) / max(len(set(var_w_list)), 1)
  tri_ratio = len(shared_tri) / max(len(var_trigrams), 1)
  return {
      "ocr_available": True,
      "variant_word_count": len(var_w_list),
      "word_overlap_ratio": round(word_ratio, 3),
      "trigram_overlap_ratio": round(tri_ratio, 3),
      "leaked_trigrams": shared_tri[:10],
  }


def measure_thumbnail_structural_divergence(orig_path: pathlib.Path, var_path: pathlib.Path, size: int = 64) -> dict[str, float]:
  """Thumbnail-size distinguishability: compares 64px grayscale edge maps (structure) independent of color.

  A pure re-color keeps the edge map nearly identical (high edge correlation -> low divergence), which is
  exactly the 'insignificant' change the reinvention directive forbids.
  """

  def edge_vec(p: pathlib.Path) -> list[float]:
    out = run_magick([
        f"{p}[0]",
        "-alpha",
        "remove",
        "-colorspace",
        "Gray",
        "-resize",
        f"{size}x{size}!",
        "-edge",
        "1",
        "-depth",
        "8",
        "txt:",
    ])
    vals: list[float] = []
    for line in out.splitlines():
      if line.startswith("#"):
        continue
      m = re.search(r"\((\d+(?:\.\d+)?)", line)
      if m:
        vals.append(float(m.group(1)))
    return vals

  a, b = edge_vec(orig_path), edge_vec(var_path)
  n = min(len(a), len(b))
  if n < 16:
    return {"edge_correlation_64": 0.0, "structural_divergence": 0.5}
  a, b = a[:n], b[:n]
  ma, mb = sum(a) / n, sum(b) / n
  num = sum((x - ma) * (y - mb) for x, y in zip(a, b))
  den = math.sqrt(sum((x - ma) ** 2 for x in a) * sum((y - mb) ** 2 for y in b))
  corr = 0.0 if den < 1e-6 else max(-1.0, min(1.0, num / den))
  return {"edge_correlation_64": round(corr, 3), "structural_divergence": round(1.0 - max(0.0, corr), 3)}


def evaluate_surface(
    surface: str,
    orig_path: pathlib.Path,
    var_path: pathlib.Path,
    forbidden_phrases: list[str],
    stance_dial: float = 0.65,
    ocr_override_text: str = "",
) -> dict[str, Any]:
  ow, oh, _ = identify_dims(orig_path)
  vw, vh, vfmt = identify_dims(var_path)

  pal = palette_divergence(orig_path, var_path)
  mae_16 = compute_grid_mae(orig_path, var_path, grid=16)
  orig_qual = measure_acutance_and_grid_quality(orig_path)
  var_qual = measure_acutance_and_grid_quality(var_path)
  rhythm_corr = measure_vibe_rhythm_correlation(orig_path, var_path)
  thumb = measure_thumbnail_structural_divergence(orig_path, var_path)

  orig_complexity = max(orig_qual["hf_detail_std"] + orig_qual["mf_detail_std"], 0.5)
  var_complexity = var_qual["hf_detail_std"] + var_qual["mf_detail_std"]
  complexity_retention = round(var_complexity / orig_complexity, 3)
  sharpness_parity = round(var_qual["sharpness_ratio"] / max(orig_qual["sharpness_ratio"], 0.15), 3)
  grid_parity = round(var_qual["hv_edge_ratio"] / max(orig_qual["hv_edge_ratio"], 0.35), 3)

  ocr_txt = ocr_override_text or extract_ocr_text(var_path)
  text_div = compute_text_overlap(forbidden_phrases, ocr_txt)

  min_de_req = 15.0 if stance_dial < 0.35 else (22.0 if stance_dial <= 0.62 else 26.0)
  min_mae_req = 16.0 if stance_dial < 0.35 else 22.0

  # 1. Uniqueness Score (0..100) = palette (30) + spatial MAE (25) + thumbnail structural divergence (25) + copy (20)
  de = pal["weighted_mean_delta_e"]
  pal_pts = min(30.0, max(0.0, (de / max(min_de_req, 1.0)) * 26.0))
  if mae_16 < min_mae_req:
    mae_pts = (mae_16 / min_mae_req) * 16.0
  elif mae_16 <= 130.0:
    mae_pts = 25.0
  else:
    mae_pts = max(10.0, 25.0 - (mae_16 - 130.0) * 0.2)
  # Structural divergence target scales with dial: re-color only (~0.05-0.15) earns little; >= target earns full.
  min_struct_req = 0.20 if stance_dial < 0.35 else (0.35 if stance_dial < 0.85 else 0.55)
  sdiv = thumb["structural_divergence"]
  struct_pts = min(25.0, max(0.0, (sdiv / min_struct_req) * 25.0))
  tri_ov = text_div["trigram_overlap_ratio"]
  txt_pts = max(0.0, 20.0 * (1.0 - min(1.0, tri_ov * 10.0)))
  uniqueness_score = round(pal_pts + mae_pts + struct_pts + txt_pts, 1)

  # 2. Standalone Aesthetic Quality Score (0..100)
  sr = var_qual["sharpness_ratio"]
  hf = var_qual["hf_detail_std"]
  sharp_pts = min(40.0, (min(sr / 0.28, 1.2) * 20.0) + (min(hf / 1.2, 1.2) * 16.5))
  hv = var_qual["hv_edge_ratio"]
  grid_pts = min(30.0, (hv / 0.65) * 30.0)
  lstd = var_qual["luminance_std"]
  contrast_pts = min(20.0, max(0.0, (lstd / 30.0) * 20.0))
  min_edge = min(vw, vh)
  res_pts = 10.0 if min_edge >= 1024 else 3.0
  quality_score = round(sharp_pts + grid_pts + contrast_pts + res_pts, 1)

  # 3. Non-Regression Score (0..100, where 100 = Zero Regression vs. Original Screenshot)
  # - Complexity & Visual Detail Retention (40 pts)
  reg_comp_pts = min(40.0, max(0.0, (complexity_retention / 0.90) * 40.0))
  # - Sharpness & Acutance Parity (25 pts)
  reg_sharp_pts = min(25.0, max(0.0, (sharpness_parity / 0.95) * 25.0))
  # - Grid Orthogonality Parity (20 pts)
  reg_grid_pts = min(20.0, max(0.0, (grid_parity / 0.95) * 20.0))
  # - Section Rhythm Preservation (15 pts)
  reg_rhythm_pts = 15.0 if 0.15 <= rhythm_corr <= 0.90 else max(4.0, 15.0 * max(0.0, rhythm_corr))
  regression_score = round(reg_comp_pts + reg_sharp_pts + reg_grid_pts + reg_rhythm_pts, 1)

  diagnostic_flags: list[str] = []
  if de < min_de_req:
    diagnostic_flags.append(f"palette_close_to_original (delta_e={de} vs target >={min_de_req})")
  if mae_16 < min_mae_req:
    diagnostic_flags.append(f"low_spatial_mae (mae_16x16={mae_16} vs target >={min_mae_req})")
  if tri_ov > 0.05:
    diagnostic_flags.append(f"copy_overlap_detected (trigram_overlap={tri_ov:.1%})")
  if sdiv < min_struct_req:
    diagnostic_flags.append(
        f"structure_too_close_at_thumbnail (structural_divergence={sdiv} vs target >={min_struct_req}; likely re-color/minor-layout only)"
    )
  if complexity_retention < 0.78:
    diagnostic_flags.append(f"complexity_regression (retention={complexity_retention}x < 0.78x)")
  if sr < 0.28 or hf < 0.80:
    diagnostic_flags.append(f"soft_acutance (sharpness_ratio={sr}, hf_std={hf})")

  return {
      "surface": surface,
      "uniqueness_score": uniqueness_score,
      "quality_score": quality_score,
      "regression_score": regression_score,
      "regression_detected": regression_score < 78.0 or complexity_retention < 0.78,
      "original_px": f"{ow}x{oh}",
      "variant_px": f"{vw}x{vh}",
      "variant_format": vfmt,
      "metrics": {
          "palette_weighted_delta_e": de,
          "mae_16x16_rgb": mae_16,
          "complexity_retention_ratio": complexity_retention,
          "sharpness_parity_ratio": sharpness_parity,
          "grid_parity_ratio": grid_parity,
          "vibe_edge_rhythm_correlation": rhythm_corr,
          "thumbnail_edge_correlation_64": thumb["edge_correlation_64"],
          "thumbnail_structural_divergence": sdiv,
          "thumbnail_structural_target": min_struct_req,
          "trigram_text_overlap": tri_ov,
          "sharpness_ratio": sr,
          "hf_detail_std": hf,
          "luminance_std": lstd,
          "hv_edge_ratio": hv,
          "original_sharpness_ratio": orig_qual["sharpness_ratio"],
      },
      "palette": pal,
      "text_divergence": text_div,
      "diagnostic_flags": diagnostic_flags,
  }


def write_designer_checkpoint_md(study: pathlib.Path, report: dict[str, Any]) -> pathlib.Path:
  md_path = study / "variants" / "designer-review-checkpoint.md"
  desk = report["surfaces"].get("desktop", {})
  mob = report["surfaces"].get("mobile", {})
  const = report.get("variant_constitution", {})
  pal = const.get("palette", {})
  fonts = const.get("fonts", {})
  persona = const.get("brand_persona", {})
  dm = desk.get("metrics", {})
  mm = mob.get("metrics", {})

  lines = [
      f"# Designer Review Checkpoint — `{persona.get('brand_name', 'URL Variant')}`",
      "",
      f"- **Source URL**: `{report.get('source_url')}`",
      f"- **Variation Stance Dial**: `{report.get('stance_dial')}` (`{report.get('style_stance')}` — *{pal.get('label', '')}*)",
      f"- **Live Google Fonts**: `{fonts.get('primary')}` (Headline) + `{fonts.get('secondary')}` (Body/UI) + `{fonts.get('mono')}` (Telemetry)",
      f"- **Cross-Surface Desktop <-> Mobile Palette $\\Delta E^*_{{ab}}$**: `{report.get('cross_surface_palette_delta_e')}`",
      "",
      "## Diagnostic Scorecard (`0-100` Readout for Designer Review)",
      "",
      "| Surface | Uniqueness Score | Quality Score | Non-Regression Score (`100` = Zero Regression) | Palette $\\Delta E$ | `16x16` MAE | Thumbnail Structural Divergence | Complexity Parity | Sharpness Ratio | Diagnostic Notes |",
      "| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |",
      f"| **Desktop** (`{desk.get('variant_px', '-')}`) | **{desk.get('uniqueness_score', 0)}/100** | **{desk.get('quality_score', 0)}/100** | **{desk.get('regression_score', 0)}/100** | `{dm.get('palette_weighted_delta_e', 0)}` | `{dm.get('mae_16x16_rgb', 0)}` | `{dm.get('thumbnail_structural_divergence', 0)}` (target `>= {dm.get('thumbnail_structural_target', 0)}`) | `{dm.get('complexity_retention_ratio', 0)}x` | `{dm.get('sharpness_ratio', 0)}` | {', '.join(desk.get('diagnostic_flags', [])) or 'Clean (0 flags)'} |",
      f"| **Mobile** (`{mob.get('variant_px', '-')}`) | **{mob.get('uniqueness_score', 0)}/100** | **{mob.get('quality_score', 0)}/100** | **{mob.get('regression_score', 0)}/100** | `{mm.get('palette_weighted_delta_e', 0)}` | `{mm.get('mae_16x16_rgb', 0)}` | `{mm.get('thumbnail_structural_divergence', 0)}` (target `>= {mm.get('thumbnail_structural_target', 0)}`) | `{mm.get('complexity_retention_ratio', 0)}x` | `{mm.get('sharpness_ratio', 0)}` | {', '.join(mob.get('diagnostic_flags', [])) or 'Clean (0 flags)'} |",
      "",
      "## Deliverable Files Ready for Designer Inspection",
      "- **Pre-Generation Variation Blueprint**: `variants/variation-blueprint.md`",
      "- **Desktop Original vs. Variant**: `captures/desktop-fullpage.png` vs. `variants/desktop-variant-fullpage.png` (`variants/desktop-variant-2k.png`)",
      "- **Mobile Original vs. Variant**: `captures/mobile-fullpage.png` vs. `variants/mobile-variant-fullpage.png` (`variants/mobile-variant-2k.png`)",
      "- **Side-by-Side Contact Sheet**: `variants/comparison-contact-sheet.jpg`",
      "- **Interactive Comparison Board**: `index.html`",
      "",
  ]
  md_path.write_text("\n".join(lines), encoding="utf-8")
  return md_path


def write_comparison_html(study: pathlib.Path, report: dict[str, Any]) -> pathlib.Path:
  html_path = study / "index.html"
  desk = report["surfaces"].get("desktop", {})
  mob = report["surfaces"].get("mobile", {})
  const = report.get("variant_constitution", {})
  pal = const.get("palette", {})
  fonts = const.get("fonts", {})
  persona = const.get("brand_persona", {})

  swatches = "".join(
      f'<div class="swatch"><span class="chip" style="background:{html.escape(str(pal.get(k, "#000")))}"></span>'
      f'<div><div class="k">{html.escape(k)}</div><div class="v">{html.escape(str(pal.get(k, "")))}</div></div></div>'
      for k in ("bg_primary", "bg_elevated", "text_primary", "accent_primary", "accent_secondary", "border_hairline")
      if pal.get(k)
  )

  content = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>url-variant · {html.escape(str(persona.get("brand_name", "Variant Study")))}</title>
  <style>
    :root {{
      --bg: #0c0c0b;
      --card: #141413;
      --line: #262624;
      --fg: #f4f4f0;
      --muted: #9a9a92;
      --pass: #10e88a;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      padding: 32px 40px 80px;
      background: var(--bg);
      color: var(--fg);
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.5;
    }}
    header {{
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--line);
      margin-bottom: 28px;
    }}
    h1 {{ margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }}
    .sub {{ color: var(--muted); font-size: 14px; margin-top: 4px; }}
    .badges {{ display: flex; gap: 12px; flex-wrap: wrap; }}
    .badge {{
      padding: 8px 14px;
      border-radius: 999px;
      background: var(--card);
      border: 1px solid var(--line);
      font-size: 13px;
      font-variant-numeric: tabular-nums;
    }}
    .badge strong {{ color: var(--pass); }}
    .grid-meta {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }}
    .panel {{
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 18px 20px;
    }}
    .panel h2 {{ margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }}
    .swatches {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }}
    .swatch {{ display: flex; align-items: center; gap: 10px; font-size: 12px; }}
    .chip {{ width: 24px; height: 24px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.18); flex-shrink: 0; }}
    .k {{ color: var(--muted); }}
    .v {{ font-family: monospace; }}
    .compare-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 40px;
    }}
    .shot-card {{
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
    }}
    .shot-head {{
      padding: 12px 16px;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }}
    .shot-card img {{ width: 100%; height: auto; display: block; }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>url-variant · {html.escape(str(persona.get("brand_name", "Unique Variant")))}</h1>
      <div class="sub">Source URL: {html.escape(str(report.get("source_url", "")))} · Stance Dial: {report.get("stance_dial", 0.65)} ({html.escape(str(report.get("style_stance", "")))}) · Flutter Remediated: {html.escape(str(report.get("has_flutter", False)))}</div>
    </div>
    <div class="badges">
      <div class="badge">Desktop Uniqueness: <strong>{desk.get("uniqueness_score", 0)}/100</strong></div>
      <div class="badge">Desktop Quality: <strong>{desk.get("quality_score", 0)}/100</strong></div>
      <div class="badge">Desktop Non-Regression: <strong>{desk.get("regression_score", 0)}/100</strong></div>
      <div class="badge">Mobile Uniqueness: <strong>{mob.get("uniqueness_score", 0)}/100</strong></div>
      <div class="badge">Mobile Quality: <strong>{mob.get("quality_score", 0)}/100</strong></div>
      <div class="badge">Mobile Non-Regression: <strong>{mob.get("regression_score", 0)}/100</strong></div>
      <div class="badge">Cross-Surface ΔE: <strong>{report.get("cross_surface_palette_delta_e", 0)}</strong></div>
    </div>
  </header>

  <section class="grid-meta">
    <div class="panel">
      <h2>Style Stance & Palette ({html.escape(str(pal.get("label", "")))})</h2>
      <div class="swatches">{swatches}</div>
    </div>
    <div class="panel">
      <h2>Live Google Fonts & Pre-Architected Blueprint</h2>
      <p style="margin:0 0 8px"><strong>Headline Font:</strong> {html.escape(str(fonts.get("primary", "")))}</p>
      <p style="margin:0 0 8px"><strong>Companion Body / UI Font:</strong> {html.escape(str(fonts.get("secondary", "")))} ({html.escape(str(fonts.get("mono", "")))})</p>
      <p style="margin:0 0 8px"><strong>Hero Headline:</strong> {html.escape(str(persona.get("hero_h1", "")))}</p>
      <p style="margin:0;color:var(--muted);font-size:13px">Artifacts: <a style="color:var(--pass)" href="variants/variation-blueprint.md">variation-blueprint.md</a> · <a style="color:var(--pass)" href="dom/desktop-dom.txt">desktop-dom.txt</a> · <a style="color:var(--pass)" href="dom/mobile-dom.txt">mobile-dom.txt</a></p>
    </div>
  </section>

  <h2>Pass 1: Desktop Full-Length Comparison (Original vs. Nano Banana 2.1 Unique Variant)</h2>
  <section class="compare-grid">
    <div class="shot-card">
      <div class="shot-head"><span>Original Desktop ({html.escape(str(desk.get("original_px", "")))})</span><span>Chrome DevTools @2x</span></div>
      <img src="captures/desktop-fullpage.png" alt="Original Desktop Fullpage" />
    </div>
    <div class="shot-card">
      <div class="shot-head"><span>Variant Desktop ({html.escape(str(desk.get("variant_px", "")))})</span><span>Uniqueness {desk.get("uniqueness_score", 0)} · Quality {desk.get("quality_score", 0)} · Non-Regression {desk.get("regression_score", 0)}</span></div>
      <img src="variants/desktop-variant-fullpage.png" alt="Variant Desktop Fullpage" />
    </div>
  </section>

  <h2>Pass 2: Mobile Full-Length Comparison (Conditioned on Mobile Capture + Desktop Variant)</h2>
  <section class="compare-grid">
    <div class="shot-card">
      <div class="shot-head"><span>Original Mobile ({html.escape(str(mob.get("original_px", "")))})</span><span>Chrome DevTools @3x</span></div>
      <img src="captures/mobile-fullpage.png" alt="Original Mobile Fullpage" />
    </div>
    <div class="shot-card">
      <div class="shot-head"><span>Variant Mobile ({html.escape(str(mob.get("variant_px", "")))})</span><span>Uniqueness {mob.get("uniqueness_score", 0)} · Quality {mob.get("quality_score", 0)} · Non-Regression {mob.get("regression_score", 0)}</span></div>
      <img src="variants/mobile-variant-fullpage.png" alt="Variant Mobile Fullpage" />
    </div>
  </section>
</body>
</html>
"""
  html_path.write_text(content, encoding="utf-8")
  return html_path


def main() -> int:
  ap = argparse.ArgumentParser(description="Compute diagnostic Uniqueness, Quality & Regression scores for Designer Review.")
  ap.add_argument("--study-dir", required=True)
  ap.add_argument("--stance-dial", type=float, default=0.0, help="Override stance dial (defaults to variant-plan.json)")
  ap.add_argument("--desktop-ocr-text", default="", help="Optional VLM-transcribed text from desktop variant")
  ap.add_argument("--mobile-ocr-text", default="", help="Optional VLM-transcribed text from mobile variant")
  ap.add_argument("--strict-gate", action="store_true", help="Exit non-zero if a score is below threshold (default: false, pure diagnostic readout for designer review)")
  args = ap.parse_args()

  study = pathlib.Path(args.study_dir).expanduser().resolve()
  audit_path = study / "dom" / "dom-audit.json"
  plan_path = study / "variants" / "variant-plan.json"
  if not audit_path.exists():
    print(json.dumps({"passed": False, "error": f"Missing {audit_path}"}, indent=2))
    return 1

  audit = json.loads(audit_path.read_text(encoding="utf-8"))
  plan = json.loads(plan_path.read_text(encoding="utf-8")) if plan_path.exists() else {}
  forbidden = audit.get("forbidden_copy_phrases", [])
  stance_dial = float(args.stance_dial) if args.stance_dial > 0 else float(plan.get("stance_dial", 0.65))

  desk_orig = study / "captures" / "desktop-fullpage.png"
  desk_var = study / "variants" / "desktop-variant-fullpage.png"
  mob_orig = study / "captures" / "mobile-fullpage.png"
  mob_var = study / "variants" / "mobile-variant-fullpage.png"

  # Single-variant mode (1 Desktop + 1 Mobile hero plate): compare like-for-like against the 2K hero crops
  # that were actually used as the conditioning images, not the 1:6 full-length captures.
  single_variant = bool(plan.get("jobs")) and all(int(j.get("total_bands", 0)) == 1 for j in plan["jobs"])
  if single_variant:
    for name, var in (("desktop", "desk"), ("mobile", "mob")):
      hero = study / "captures" / f"{name}-base-hero-2k.png"
      if hero.exists():
        if var == "desk":
          desk_orig = hero
        else:
          mob_orig = hero

  surfaces: dict[str, Any] = {}
  for surf, op, vp, ocr_txt in (
      ("desktop", desk_orig, desk_var, args.desktop_ocr_text),
      ("mobile", mob_orig, mob_var, args.mobile_ocr_text),
  ):
    if not op.exists() or not vp.exists():
      surfaces[surf] = {"surface": surf, "error": f"Missing {op} or {vp}"}
    else:
      surfaces[surf] = evaluate_surface(surf, op, vp, forbidden, stance_dial, ocr_txt)

  cross_de = 0.0
  if desk_var.exists() and mob_var.exists():
    cross_pal = palette_divergence(desk_var, mob_var)
    cross_de = cross_pal["weighted_mean_delta_e"]

  report = {
      "mode": "designer_review_diagnostic",
      "study_dir": str(study),
      "source_url": audit.get("url"),
      "stance_dial": stance_dial,
      "style_stance": plan.get("style_stance", "auto"),
      "has_flutter": bool(audit.get("has_flutter")),
      "cross_surface_palette_delta_e": cross_de,
      "variant_constitution": plan.get("variant_constitution", {}),
      "surfaces": surfaces,
  }

  out_json = study / "variants" / "eval-report.json"
  out_json.parent.mkdir(parents=True, exist_ok=True)
  out_json.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
  checkpoint_md = write_designer_checkpoint_md(study, report)
  html_viewer = write_comparison_html(study, report)
  report["designer_review_checkpoint_md"] = str(checkpoint_md)
  report["comparison_html"] = str(html_viewer)

  print(json.dumps(report, indent=2))
  if args.strict_gate:
    any_reg = any(s.get("regression_detected", True) for s in surfaces.values())
    return 1 if any_reg else 0
  return 0


if __name__ == "__main__":
  sys.exit(main())
