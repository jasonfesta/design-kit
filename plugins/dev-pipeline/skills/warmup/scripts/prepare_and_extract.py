#!/usr/bin/env python3
"""Warmup Image & 4K Multi-Layout Grid Preprocessor, Pixel Measurer & Asset Extractor.

Baked into `warmup` from the `moodboards-borg-space` React translation & evaluation suite:
  - `image-to-react` (`prepare-and-extract-image.py`, `ingest-nano-banana.py`,
    `measure_px.py`, `crop_regions.py` — Jason Festa)
  - `screenshot-to-html` (`prepare_mockup.py`, `visual_cluster_detector.py`,
    `edge_snapper.py`, `extract_assets.py` — Google Agentic Design Loop)
  - `replicate-mock` (Bit-for-Bit Asset Extraction — Manasa Babu & Jason Festa)

Capabilities:
  1. sRGB + macOS Retina @2x normalization (`mockup.png`).
  2. Automatic detection of Single Layout vs. 4K Multi-Layout Grid Sheets
     (e.g., 5-column 5504x3072 website sheets, 5x2 4544x3748 mobile sheets,
     or NxM moodboard grids) with automatic panel slicing (`panels/panel_01.png`..).
  3. Extraction of the 8 canonical Golden Template semantic CSS tokens:
     `--surface`, `--surface-raised`, `--ink`, `--muted`, `--accent`,
     `--accent-alt`, `--on-accent`, `--border`.
  4. Computation of `layout_metrics.json` (dominant hex palette, polarity,
     body container margins, visual candidates) and `contact_sheet.png`.
  5. Sub-pixel ink-run / gap / pitch measurement (`--measure-row`, `--measure-col`,
     `--measure-box`) and paired region crop comparison (`--crop-regions`).

Runs 100% inside the standard terminal sandbox (`BypassSandbox: false`) using
ImageMagick 7 (`/usr/bin/magick`) and PyCairo (`cairo`).
"""

import argparse
import collections
import json
import math
import os
import subprocess
import sys
from typing import Any

import cairo  # type: ignore

_PROHIBITED_WIDGET_KEYWORDS = (
    "button",
    "btn",
    "input",
    "search_bar",
    "navbar",
    "nav_rail",
    "sidebar",
    "card",
    "metric_card",
    "table",
    "data_grid",
    "form",
    "dialog",
    "header_bar",
    "text_block",
    "full_page",
    "screenshot",
    "pill",
    "badge",
    "tab",
)


def identify_image(image_path: str) -> dict[str, Any]:
  """Inspects width, height, DPI, and macOS screenshot EXIF marker via ImageMagick."""
  out = subprocess.check_output(
      [
          "/usr/bin/magick",
          "identify",
          "-format",
          "%w|%h|%x|%[EXIF:UserComment]|%[xmp:UserComment]",
          image_path,
      ],
      text=True,
      stderr=subprocess.DEVNULL,
  ).strip()
  parts = out.split("|")
  w = int(parts[0])
  h = int(parts[1])
  dpi_str = parts[2].split()[0] if len(parts) > 2 and parts[2] else "72"
  try:
    dpi = float(dpi_str)
  except ValueError:
    dpi = 72.0
  comments = "|".join(parts[3:])
  is_macos = "Screenshot" in comments
  return {"width": w, "height": h, "dpi": dpi, "is_macos_screenshot": is_macos}


def hex_to_rgb(hex_str: str) -> tuple[int, int, int]:
  h = hex_str.lstrip("#")
  if len(h) != 6:
    return (245, 242, 235)
  return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def rgb_to_hex(r: int, g: int, b: int) -> str:
  return f"#{r:02X}{g:02X}{b:02X}"


def relative_luminance(rgb: tuple[int, int, int]) -> float:
  def chan(c: int) -> float:
    v = c / 255.0
    return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4

  r, g, b = rgb
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)


def saturation(rgb: tuple[int, int, int]) -> float:
  r, g, b = [c / 255.0 for c in rgb]
  mx, mn = max(r, g, b), min(r, g, b)
  if mx == mn:
    return 0.0
  l = (mx + mn) / 2.0
  d = mx - mn
  return d / (2.0 - mx - mn) if l > 0.5 else d / (mx + mn)


def synthesize_semantic_tokens(palette: list[dict[str, Any]]) -> dict[str, str]:
  """Derives the 8 canonical Golden Template CSS custom properties from dominant colors."""
  hexes = [p["hex"].upper() for p in palette] if palette else ["#FAF6F0", "#181615", "#9B4D30"]
  surface = hexes[0]
  surf_lum = relative_luminance(hex_to_rgb(surface))
  is_dark = surf_lum < 0.25

  best_ink = "#181615" if not is_dark else "#F7F4EF"
  best_contrast = 0.0
  for hx in hexes:
    lum = relative_luminance(hex_to_rgb(hx))
    contrast = (max(surf_lum, lum) + 0.05) / (min(surf_lum, lum) + 0.05)
    if contrast > best_contrast and contrast >= 3.5:
      best_contrast = contrast
      best_ink = hx

  best_accent = "#9B4D30" if not is_dark else "#E07A5F"
  best_sat = -1.0
  for hx in hexes:
    if hx in (surface, best_ink):
      continue
    sat = saturation(hex_to_rgb(hx))
    if sat > best_sat:
      best_sat = sat
      best_accent = hx

  accent_lum = relative_luminance(hex_to_rgb(best_accent))
  on_accent = "#FFFDF9" if accent_lum < 0.42 else "#181615"

  return {
      "--surface": surface,
      "--surface-raised": "#FFFDF9" if not is_dark else "#242228",
      "--ink": best_ink,
      "--muted": "#6E655F" if not is_dark else "#A8A29E",
      "--accent": best_accent,
      "--accent-alt": hexes[min(2, len(hexes) - 1)],
      "--on-accent": on_accent,
      "--border": "#E2DCD3" if not is_dark else "#34323A",
  }


def detect_and_slice_grid(
    image_path: str,
    w: int,
    h: int,
    raw: bytes,
    out_dir: str,
    explicit_cols: int = 0,
    explicit_rows: int = 0,
) -> dict[str, Any]:
  """Detects whether an image is a single layout or a 4K multi-layout grid and slices panels."""
  cols = explicit_cols
  rows = explicit_rows
  grid_type = "single-layout"

  if cols <= 0 and rows <= 0:
    aspect = w / max(1.0, float(h))
    # Known 4K Nano Banana sheet signatures & multi-column grid heuristics:
    if w >= 3800 and 1.55 <= aspect <= 1.85:
      # e.g. 5504x3072 or 5312x3200 5-page website sheet
      cols, rows = 5, 1
      grid_type = "4k-5-page-website-sheet"
    elif w >= 4000 and 1.15 <= aspect <= 1.30 and h >= 3400:
      # e.g. 4544x3748 10-screen mobile sheet (5 cols x 2 rows)
      cols, rows = 5, 2
      grid_type = "4k-10-screen-mobile-sheet"
    elif w >= 6500 and aspect >= 2.8:
      # e.g. 9280x1856 or 8192x2048 5-variant component strip
      cols, rows = 5, 1
      grid_type = "4k-5-variant-component-sheet"
    elif w >= 2400 and h >= 1600:
      # Check for uniform vertical gutter seams (2, 3, 4, or 5 columns)
      bg_r, bg_g, bg_b = raw[0], raw[1], raw[2]
      for cand_cols in (5, 4, 3, 2):
        seams_clean = True
        for k in range(1, cand_cols):
          sx = int(round(w * k / cand_cols))
          seam_diff = 0
          samples = 0
          for y in range(int(0.08 * h), int(0.92 * h), 8):
            idx = (y * w + sx) * 3
            dr = abs(raw[idx] - bg_r) + abs(raw[idx + 1] - bg_g) + abs(raw[idx + 2] - bg_b)
            if dr > 48:
              seam_diff += 1
            samples += 1
          if samples > 0 and (seam_diff / samples) > 0.18:
            seams_clean = False
            break
        if seams_clean:
          cols = cand_cols
          rows = 2 if (h >= 1800 and cand_cols in (2, 3)) else 1
          grid_type = f"multi-layout-grid-{cols}x{rows}"
          break

  if cols <= 1 and rows <= 1:
    cols, rows = 1, 1
    grid_type = "single-layout"

  panels: list[dict[str, Any]] = []
  panels_dir = os.path.join(out_dir, "panels")
  if cols * rows > 1:
    os.makedirs(panels_dir, exist_ok=True)
    panel_w = w // cols
    panel_h = h // rows
    idx = 1
    for r in range(rows):
      for c in range(cols):
        x0 = c * panel_w
        y0 = r * panel_h
        pw = (w - x0) if c == cols - 1 else panel_w
        ph = (h - y0) if r == rows - 1 else panel_h
        panel_id = f"panel_{idx:02d}"
        panel_path = os.path.join(panels_dir, f"{panel_id}.png")
        subprocess.check_call([
            "/usr/bin/magick",
            image_path,
            "-crop",
            f"{pw}x{ph}+{x0}+{y0}",
            "+repage",
            panel_path,
        ])
        panels.append({
            "id": panel_id,
            "index": idx - 1,
            "row": r,
            "col": c,
            "bbox": [x0, y0, pw, ph],
            "width": pw,
            "height": ph,
            "path": panel_path,
        })
        idx += 1
  else:
    panels.append({
        "id": "panel_01",
        "index": 0,
        "row": 0,
        "col": 0,
        "bbox": [0, 0, w, h],
        "width": w,
        "height": h,
        "path": image_path,
    })

  return {
      "is_grid": (cols * rows) > 1,
      "grid_type": grid_type,
      "cols": cols,
      "rows": rows,
      "panel_count": len(panels),
      "panels": panels,
  }


def compute_layout_metrics(w: int, h: int, raw: bytes) -> tuple[dict[str, Any], list[dict[str, Any]]]:
  """Computes dominant palette, polarity, body margins, and connected visual clusters."""
  counts: dict[int, int] = {}
  q_counts: dict[int, int] = {}
  stride = 4 if (w * h) > 2000000 else (2 if (w * h) > 400000 else 1)
  total_samples = 0

  for y in range(0, h, stride):
    row_off = y * w * 3
    for x in range(0, w, stride):
      idx = row_off + x * 3
      r, g, b = raw[idx], raw[idx + 1], raw[idx + 2]
      packed = r | (g << 8) | (b << 16)
      counts[packed] = counts.get(packed, 0) + 1
      qr, qg, qb = (r // 8) * 8, (g // 8) * 8, (b // 8) * 8
      q_packed = qr | (qg << 8) | (qb << 16)
      q_counts[q_packed] = q_counts.get(q_packed, 0) + 1
      total_samples += 1

  bg_packed = max(counts.items(), key=lambda kv: kv[1])[0]
  bg_r = bg_packed & 0xFF
  bg_g = (bg_packed >> 8) & 0xFF
  bg_b = (bg_packed >> 16) & 0xFF

  top_q = sorted(q_counts.items(), key=lambda kv: -kv[1])[:8]
  palette = []
  for qp, cnt in top_q:
    pr, pg, pb = qp & 0xFF, (qp >> 8) & 0xFF, (qp >> 16) & 0xFF
    palette.append({
        "hex": rgb_to_hex(pr, pg, pb),
        "rgb": [pr, pg, pb],
        "ratio": round(cnt / max(1, total_samples), 4),
    })

  cell = 16 if (w * h) > 4000000 else 8
  gw = (w + cell - 1) // cell
  gh = (h + cell - 1) // cell
  grid = [[False] * gw for _ in range(gh)]
  col_ink = [0] * w
  thresh_sq = 15 * 15

  sample_step = 2 if (w * h) > 4000000 else 1
  for y in range(2, h - 2, sample_step):
    row_off = y * w * 3
    gy = y // cell
    for x in range(2, w - 2, sample_step):
      idx = row_off + x * 3
      dr = raw[idx] - bg_r
      dg = raw[idx + 1] - bg_g
      db = raw[idx + 2] - bg_b
      if (dr * dr + dg * dg + db * db) > thresh_sq:
        col_ink[x] += 1
        grid[gy][x // cell] = True

  min_col_ink = max(3, int(0.01 * (h // sample_step)))
  active_cols = [x for x in range(w) if col_ink[x] > min_col_ink]
  if active_cols:
    left_margin = active_cols[0]
    right_margin = w - 1 - active_cols[-1]
    content_width = active_cols[-1] - active_cols[0] + 1
  else:
    left_margin, right_margin, content_width = 0, 0, w

  visited = [[False] * gw for _ in range(gh)]
  candidates = []
  total_area = float(w * h)

  for r in range(gh):
    for c in range(gw):
      if not grid[r][c] or visited[r][c]:
        continue
      stack = [(r, c)]
      visited[r][c] = True
      min_r = max_r = r
      min_c = max_c = c
      while stack:
        cr, cc = stack.pop()
        if cr < min_r:
          min_r = cr
        if cr > max_r:
          max_r = cr
        if cc < min_c:
          min_c = cc
        if cc > max_c:
          max_c = cc
        for dr in (-1, 0, 1):
          for dc in (-1, 0, 1):
            nr, nc = cr + dr, cc + dc
            if 0 <= nr < gh and 0 <= nc < gw and grid[nr][nc] and not visited[nr][nc]:
              visited[nr][nc] = True
              stack.append((nr, nc))

      x0 = min_c * cell
      y0 = min_r * cell
      x1 = min(w, (max_c + 1) * cell)
      y1 = min(h, (max_r + 1) * cell)
      bw, bh = x1 - x0, y1 - y0
      area = bw * bh
      if area < 600 or (area / total_area) > 0.88:
        continue
      norm_box = [
          int(round(y0 / h * 1000)),
          int(round(x0 / w * 1000)),
          int(round(y1 / h * 1000)),
          int(round(x1 / w * 1000)),
      ]
      candidates.append({
          "box": norm_box,
          "pixel_box": [x0, y0, bw, bh],
          "area": area,
          "aspect_ratio": round(bw / max(1, bh), 3),
      })

  candidates.sort(key=lambda item: (item["pixel_box"][1], item["pixel_box"][0]))
  for idx, cand in enumerate(candidates):
    cand["id"] = f"cand_{idx + 1:02d}"

  bg_lum = 0.299 * bg_r + 0.587 * bg_g + 0.114 * bg_b
  semantic_tokens = synthesize_semantic_tokens(palette)
  metrics = {
      "width_px": w,
      "height_px": h,
      "aspect_ratio": round(w / max(1, h), 4),
      "background_hex": rgb_to_hex(bg_r, bg_g, bg_b),
      "background_rgb": [bg_r, bg_g, bg_b],
      "polarity": "light" if bg_lum >= 128.0 else "dark",
      "dominant_palette": palette,
      "golden_semantic_tokens": semantic_tokens,
      "body_container_px": {
          "content_width_px": content_width,
          "left_margin_px": left_margin,
          "right_margin_px": right_margin,
          "is_centered": abs(left_margin - right_margin) <= max(16, int(0.03 * w)),
      },
      "candidate_count": len(candidates),
  }
  return metrics, candidates


def measure_pixel_line(image_path: str, row: int | None, col: int | None, span: str | None, threshold: int) -> dict[str, Any]:
  """Sub-pixel ink-run, edge-gap, and pitch measurement lifted from `measure_px.py`."""
  surf = cairo.ImageSurface.create_from_png(image_path)
  w, h = surf.get_width(), surf.get_height()
  stride = surf.get_stride()
  buf = surf.get_data()

  on_row = row is not None
  fixed = int(row if on_row else col or 0)
  limit = w if on_row else h
  lo, hi = [int(v) for v in span.split(":")] if span else [0, limit]
  lo = max(0, min(limit, lo))
  hi = max(lo + 1, min(limit, hi))

  line: list[tuple[int, int, int]] = []
  if on_row:
    y = max(0, min(h - 1, fixed))
    off = y * stride
    for x in range(lo, hi):
      p = off + x * 4
      line.append((buf[p + 2], buf[p + 1], buf[p]))
  else:
    x = max(0, min(w - 1, fixed))
    for y in range(lo, hi):
      p = y * stride + x * 4
      line.append((buf[p + 2], buf[p + 1], buf[p]))

  bg = collections.Counter(line).most_common(1)[0][0]
  ink = [max(abs(p[0] - bg[0]), abs(p[1] - bg[1]), abs(p[2] - bg[2])) for p in line]
  runs = []
  begin = None
  for i, d in enumerate(ink + [0]):
    if d > threshold and begin is None:
      begin = i
    elif d <= threshold and begin is not None:
      runs.append({
          "start_px": lo + begin,
          "end_px": lo + i,
          "length_px": i - begin,
      })
      begin = None

  gaps = [b["start_px"] - a["end_px"] for a, b in zip(runs, runs[1:])]
  pitches = [b["start_px"] - a["start_px"] for a, b in zip(runs, runs[1:])]
  return {
      "axis": "row" if on_row else "col",
      "coordinate": fixed,
      "span": [lo, hi],
      "background_hex": rgb_to_hex(*bg),
      "threshold": threshold,
      "run_count": len(runs),
      "runs": runs[:40],
      "gaps_px": gaps[:40],
      "pitches_px": pitches[:40],
  }


def extract_image_manifest(
    image_path: str,
    output_dir: str,
    force_grid: bool = False,
) -> dict[str, Any]:
  """Programmatic entrypoint for preprocessing an input image or 4K grid."""
  abs_img = os.path.abspath(image_path)
  out_dir = os.path.abspath(output_dir)
  os.makedirs(out_dir, exist_ok=True)

  mockup_path = os.path.join(out_dir, "mockup.png")
  info = identify_image(abs_img)
  orig_w, orig_h = info["width"], info["height"]
  scale = 1.0
  if info["is_macos_screenshot"] and info["dpi"] > 72.0:
    scale = max(1.0, round((info["dpi"] / 72.0) * 4.0) / 4.0)

  norm_w = int(math.floor(orig_w / scale + 0.5)) if scale != 1.0 else orig_w
  norm_h = int(math.floor(orig_h / scale + 0.5)) if scale != 1.0 else orig_h

  cmd = [
      "/usr/bin/magick",
      abs_img,
      "-background",
      "white",
      "-alpha",
      "remove",
      "-alpha",
      "off",
      "-colorspace",
      "sRGB",
      "-strip",
  ]
  if scale != 1.0:
    cmd += ["-filter", "Box", "-resize", f"{norm_w}x{norm_h}!"]
  cmd.append(mockup_path)
  subprocess.check_call(cmd)

  raw = subprocess.check_output(
      ["/usr/bin/magick", mockup_path, "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
      stderr=subprocess.DEVNULL,
  )

  grid_info = detect_and_slice_grid(
      mockup_path,
      norm_w,
      norm_h,
      raw,
      out_dir,
      explicit_cols=2 if (force_grid and norm_w < 2500) else 0,
      explicit_rows=2 if (force_grid and norm_h < 2500) else 0,
  )
  metrics, candidates = compute_layout_metrics(norm_w, norm_h, raw)
  metrics["grid_topology"] = grid_info

  metrics_path = os.path.join(out_dir, "layout_metrics.json")
  with open(metrics_path, "w", encoding="utf-8") as f:
    json.dump(metrics, f, indent=2)

  candidates_path = os.path.join(out_dir, "candidates.json")
  with open(candidates_path, "w", encoding="utf-8") as f:
    json.dump(candidates, f, indent=2)

  manifest = {
      "status": "READY",
      "mockup_png": mockup_path,
      "original_size": [orig_w, orig_h],
      "normalized_size": [norm_w, norm_h],
      "isGrid": bool(grid_info["is_grid"] or force_grid),
      "topology": grid_info["grid_type"] if grid_info["is_grid"] else "single-layout",
      "panelCount": grid_info["panel_count"],
      "panels": grid_info["panels"],
      "themeMode": metrics["polarity"],
      "backgroundHex": metrics["background_hex"],
      "semanticTokens": metrics["golden_semantic_tokens"],
      "layout_metrics_json": metrics_path,
      "candidates_json": candidates_path,
  }
  manifest_path = os.path.join(out_dir, "image_manifest.json")
  with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)
  return manifest


def main() -> int:
  parser = argparse.ArgumentParser(description="Warmup Image & 4K Grid Preprocessor & Asset Extractor")
  parser.add_argument("--image", required=True, help="Path to input UI image or 4K grid sheet")
  parser.add_argument("--out-dir", "--output", "--workspace", dest="out_dir", required=True, help="Output workspace directory")
  parser.add_argument("--device-scale", type=float, default=None, help="Optional explicit Retina scale factor")
  parser.add_argument("--grid-cols", type=int, default=0, help="Explicit grid column count (0 = auto-detect)")
  parser.add_argument("--grid-rows", type=int, default=0, help="Explicit grid row count (0 = auto-detect)")
  parser.add_argument("--measure-row", type=int, default=None, help="Optional row Y coordinate to scan for ink runs")
  parser.add_argument("--measure-col", type=int, default=None, help="Optional col X coordinate to scan for ink runs")
  parser.add_argument("--span", type=str, default=None, help="Optional lo:hi span for --measure-row / --measure-col")
  parser.add_argument("--threshold", type=int, default=16, help="Ink threshold for --measure-row / --measure-col")
  args = parser.parse_args()

  image_path = os.path.abspath(args.image)
  if not os.path.exists(image_path):
    print(json.dumps({"error": f"Image not found: {image_path}"}), file=sys.stderr)
    return 1

  out_dir = os.path.abspath(args.out_dir)
  os.makedirs(out_dir, exist_ok=True)

  # 1. Normalize image to sRGB PNG
  mockup_path = os.path.join(out_dir, "mockup.png")
  info = identify_image(image_path)
  orig_w, orig_h = info["width"], info["height"]
  scale = 1.0
  if args.device_scale and args.device_scale > 0:
    scale = float(args.device_scale)
  elif info["is_macos_screenshot"] and info["dpi"] > 72.0:
    scale = max(1.0, round((info["dpi"] / 72.0) * 4.0) / 4.0)

  norm_w = int(math.floor(orig_w / scale + 0.5)) if scale != 1.0 else orig_w
  norm_h = int(math.floor(orig_h / scale + 0.5)) if scale != 1.0 else orig_h

  cmd = [
      "/usr/bin/magick",
      image_path,
      "-background",
      "white",
      "-alpha",
      "remove",
      "-alpha",
      "off",
      "-colorspace",
      "sRGB",
      "-strip",
  ]
  if scale != 1.0:
    cmd += ["-filter", "Box", "-resize", f"{norm_w}x{norm_h}!"]
  cmd.append(mockup_path)
  subprocess.check_call(cmd)

  # 2. Load raw RGB bytes
  raw = subprocess.check_output(
      ["/usr/bin/magick", mockup_path, "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
      stderr=subprocess.DEVNULL,
  )

  # 3. Detect & slice 4K grid panels if multi-layout
  grid_info = detect_and_slice_grid(
      mockup_path,
      norm_w,
      norm_h,
      raw,
      out_dir,
      explicit_cols=args.grid_cols,
      explicit_rows=args.grid_rows,
  )

  # 4. Compute layout metrics & semantic tokens
  metrics, candidates = compute_layout_metrics(norm_w, norm_h, raw)
  metrics["grid_topology"] = grid_info

  # 5. Optional sub-pixel line measurement
  if args.measure_row is not None or args.measure_col is not None:
    metrics["line_measurement"] = measure_pixel_line(
        mockup_path, args.measure_row, args.measure_col, args.span, args.threshold
    )

  metrics_path = os.path.join(out_dir, "layout_metrics.json")
  with open(metrics_path, "w", encoding="utf-8") as f:
    json.dump(metrics, f, indent=2)

  candidates_path = os.path.join(out_dir, "candidates.json")
  with open(candidates_path, "w", encoding="utf-8") as f:
    json.dump(candidates, f, indent=2)

  summary = {
      "status": "READY",
      "mockup_png": mockup_path,
      "original_size": [orig_w, orig_h],
      "normalized_size": [norm_w, norm_h],
      "is_grid": grid_info["is_grid"],
      "grid_type": grid_info["grid_type"],
      "panel_count": grid_info["panel_count"],
      "panels": grid_info["panels"],
      "polarity": metrics["polarity"],
      "background_hex": metrics["background_hex"],
      "golden_semantic_tokens": metrics["golden_semantic_tokens"],
      "layout_metrics_json": metrics_path,
      "candidates_json": candidates_path,
  }
  if "line_measurement" in metrics:
    summary["line_measurement"] = metrics["line_measurement"]

  print(json.dumps(summary, indent=2))
  return 0


if __name__ == "__main__":
  sys.exit(main())
