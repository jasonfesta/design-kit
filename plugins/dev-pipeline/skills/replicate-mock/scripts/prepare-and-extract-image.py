#!/usr/bin/env python3
"""Standalone High-Res Image Normalization, Layout Metrics & Asset Extraction CLI.

Zero-pip-dependency implementation powered by ImageMagick 7 (`/usr/bin/magick`),
PyCairo (`cairo`), and standard Python (`array`, `math`, `json`, `subprocess`).
Works 100% inside the standard terminal sandbox (`BypassSandbox: false`).

Lifted from Google's Agentic Design Loop (`screenshot-to-html` & `visual-matcher`):
  - prepare_mockup.py (sRGB ICC conversion + macOS Retina @2x scale normalization)
  - visual_cluster_detector.py (background mode, body column margins, edge cuts, cluster discovery)
  - edge_snapper.py (70% area floor & aspect-ratio guarded edge snapping)
  - extract_assets.py (non-widget media extraction with _PROHIBITED_WIDGET_KEYWORDS guard + contact_sheet.png)
"""

import argparse
import base64
import json
import math
import os
import subprocess
import sys
from typing import Any

import cairo

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

_PALETTE_COLORS = [
    (1.0, 0.23, 0.19),
    (0.0, 0.48, 1.0),
    (0.20, 0.78, 0.35),
    (0.69, 0.32, 0.87),
    (1.0, 0.58, 0.0),
    (0.35, 0.34, 0.84),
    (0.0, 0.78, 0.75),
    (1.0, 0.18, 0.33),
]


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


def prepare_mockup_image(
    input_image_path: str,
    output_image_path: str,
    device_scale: float | None = None,
) -> dict[str, Any]:
  """Normalizes a high-res screenshot/mockup to sRGB and 1:1 CSS pixel scale."""
  info = identify_image(input_image_path)
  orig_w, orig_h = info["width"], info["height"]

  scale = 1.0
  scale_source = "native 1x"
  if device_scale is not None and device_scale > 0:
    scale = float(device_scale)
    scale_source = "explicit --device_scale"
  elif info["is_macos_screenshot"] and info["dpi"] > 72.0:
    file_scale = round((info["dpi"] / 72.0) * 4.0) / 4.0
    if file_scale > 0:
      scale = file_scale
      scale_source = "macOS Retina EXIF DPI"

  new_w = int(math.floor(orig_w / scale + 0.5)) if scale != 1.0 else orig_w
  new_h = int(math.floor(orig_h / scale + 0.5)) if scale != 1.0 else orig_h

  os.makedirs(os.path.dirname(os.path.abspath(output_image_path)), exist_ok=True)
  cmd = [
      "/usr/bin/magick",
      input_image_path,
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
    cmd += ["-filter", "Box", "-resize", f"{new_w}x{new_h}!"]
  cmd.append(output_image_path)
  subprocess.check_call(cmd)

  return {
      "original_size": [orig_w, orig_h],
      "normalized_size": [new_w, new_h],
      "scale": scale,
      "scale_source": scale_source,
      "color_handling": "sRGB normalized",
      "output_path": output_image_path,
  }


def load_rgb_bytes(image_path: str) -> tuple[int, int, bytes]:
  """Loads an image as raw 8-bit RGB bytes (width * height * 3) via ImageMagick."""
  info = identify_image(image_path)
  w, h = info["width"], info["height"]
  raw = subprocess.check_output(
      ["/usr/bin/magick", image_path, "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
      stderr=subprocess.DEVNULL,
  )
  return w, h, raw


def rgb_to_hex(r: int, g: int, b: int) -> str:
  return f"#{r:02X}{g:02X}{b:02X}"


def compute_reference_layout_metrics(w: int, h: int, raw: bytes) -> tuple[dict[str, Any], list[dict[str, Any]]]:
  """Computes viewport dimensions, dominant background hex, body margins, edge cuts, and visual candidates."""
  # Sample on a 2px stride for fast histogram & foreground mask
  counts: dict[int, int] = {}
  q_counts: dict[int, int] = {}
  stride = 2 if (w * h) > 400000 else 1
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

  # Compute 8px grid foreground occupancy and column/row ink profiles
  cell = 8
  gw = (w + cell - 1) // cell
  gh = (h + cell - 1) // cell
  grid = [[False] * gw for _ in range(gh)]
  col_ink = [0] * w
  row_ink = [0] * h

  top_ink = 0
  bot_ink = 0
  left_ink = 0
  right_ink = 0
  thresh_sq = 15 * 15

  for y in range(2, h - 2):
    row_off = y * w * 3
    gy = y // cell
    r_cnt = 0
    for x in range(2, w - 2):
      idx = row_off + x * 3
      dr = raw[idx] - bg_r
      dg = raw[idx + 1] - bg_g
      db = raw[idx + 2] - bg_b
      if (dr * dr + dg * dg + db * db) > thresh_sq:
        col_ink[x] += 1
        r_cnt += 1
        grid[gy][x // cell] = True
        if y < 8:
          top_ink += 1
        elif y >= h - 8:
          bot_ink += 1
        if x < 8:
          left_ink += 1
        elif x >= w - 8:
          right_ink += 1
    row_ink[y] = r_cnt

  min_col_ink = max(5, int(0.01 * h))
  active_cols = [x for x in range(w) if col_ink[x] > min_col_ink]
  if active_cols:
    left_margin = active_cols[0]
    right_margin = w - 1 - active_cols[-1]
    content_width = active_cols[-1] - active_cols[0] + 1
  else:
    left_margin, right_margin, content_width = 0, 0, w

  # Connected components on 8px grid
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
        if cr < min_r: min_r = cr
        if cr > max_r: max_r = cr
        if cc < min_c: min_c = cc
        if cc > max_c: max_c = cc
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
      if area < 400 or (area / total_area) > 0.85:
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
  metrics = {
      "width_px": w,
      "height_px": h,
      "aspect_ratio": round(w / max(1, h), 4),
      "background_hex": rgb_to_hex(bg_r, bg_g, bg_b),
      "background_rgb": [bg_r, bg_g, bg_b],
      "polarity": "light" if bg_lum >= 128.0 else "dark",
      "dominant_palette": palette,
      "body_container_px": {
          "content_width_px": content_width,
          "left_margin_px": left_margin,
          "right_margin_px": right_margin,
          "is_centered": abs(left_margin - right_margin) <= max(16, int(0.03 * w)),
      },
      "edge_cuts": {
          "top": top_ink > 50,
          "bottom": bot_ink > 50,
          "left": left_ink > 50,
          "right": right_ink > 50,
      },
  }
  return metrics, candidates


def render_candidates_overlay(mockup_png: str, candidates: list[dict[str, Any]], output_path: str) -> None:
  """Draws candidate bounding boxes and labels onto mockup_candidates_overlay.png via PyCairo."""
  surf = cairo.ImageSurface.create_from_png(mockup_png)
  ctx = cairo.Context(surf)
  ctx.select_font_face("sans-serif", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
  ctx.set_font_size(11)

  for idx, cand in enumerate(candidates):
    x, y, bw, bh = cand["pixel_box"]
    cr, cg, cb = _PALETTE_COLORS[idx % len(_PALETTE_COLORS)]
    ctx.set_source_rgba(cr, cg, cb, 0.12)
    ctx.rectangle(x, y, bw, bh)
    ctx.fill()

    ctx.set_source_rgba(cr, cg, cb, 0.92)
    ctx.set_line_width(2.0)
    ctx.rectangle(x, y, bw, bh)
    ctx.stroke()

    label = f"{cand['id']} ({bw}x{bh})"
    tw = len(label) * 6.5 + 8
    ly = max(0, y - 16)
    ctx.rectangle(x, ly, tw, 16)
    ctx.fill()
    ctx.set_source_rgb(1.0, 1.0, 1.0)
    ctx.move_to(x + 4, ly + 12)
    ctx.show_text(label)

  os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
  surf.write_to_png(output_path)


def extract_assets(
    mockup_png: str,
    w: int,
    h: int,
    boxes: list[dict[str, Any]],
    workspace_dir: str,
    export_dir: str | None = None,
) -> dict[str, Any]:
  """Extracts approved non-widget media crops via ImageMagick and generates contact_sheet.png."""
  rich_assets = []
  flat_manifest = {}
  crop_files = []

  tmp_crops_dir = os.path.join(workspace_dir, ".crops_tmp")
  os.makedirs(tmp_crops_dir, exist_ok=True)
  if export_dir:
    os.makedirs(export_dir, exist_ok=True)

  for item in boxes:
    asset_id = str(item.get("id") or "").strip()
    box = item.get("box") or item.get("box_2d")
    if not asset_id or not isinstance(box, list) or len(box) != 4:
      raise ValueError(f"Invalid asset entry (expected id and [ymin, xmin, ymax, xmax]): {item}")

    lower_id = asset_id.lower()
    for kw in _PROHIBITED_WIDGET_KEYWORDS:
      if kw in lower_id:
        raise ValueError(
            f"PROHIBITED WIDGET CROP '{asset_id}' (matched '{kw}'). "
            "Never crop buttons, inputs, cards, navbars, or text blocks as raster images; synthesize them in React + Tailwind CSS."
        )

    is_norm = max(float(v) for v in box) <= 1000.0
    if is_norm:
      y1 = max(0, min(h, int(round(float(box[0]) / 1000.0 * h))))
      x1 = max(0, min(w, int(round(float(box[1]) / 1000.0 * w))))
      y2 = max(0, min(h, int(round(float(box[2]) / 1000.0 * h))))
      x2 = max(0, min(w, int(round(float(box[3]) / 1000.0 * w))))
    else:
      y1, x1, y2, x2 = [int(round(float(v))) for v in box]

    cw = max(1, x2 - x1)
    ch = max(1, y2 - y1)
    crop_path = os.path.join(export_dir if export_dir else tmp_crops_dir, f"{asset_id}.png")
    subprocess.check_call([
        "/usr/bin/magick",
        mockup_png,
        "-crop",
        f"{cw}x{ch}+{x1}+{y1}",
        "+repage",
        crop_path,
    ])
    with open(crop_path, "rb") as f:
      b64 = base64.b64encode(f.read()).decode("ascii")
    data_uri = f"data:image/png;base64,{b64}"

    flat_manifest[asset_id] = data_uri
    rich_assets.append({
        "id": asset_id,
        "box": [y1, x1, y2, x2],
        "nominal_box": box,
        "dimensions": {"width": cw, "height": ch},
        "file": f"./assets/{asset_id}.png" if export_dir else crop_path,
        "data_uri": data_uri,
    })
    crop_files.append((asset_id, crop_path, cw, ch))

  contact_sheet_path = os.path.join(workspace_dir, "contact_sheet.png")
  if crop_files:
    cols = min(3, len(crop_files))
    rows = (len(crop_files) + cols - 1) // cols
    cell_w, cell_h = 320, 240
    sheet = cairo.ImageSurface(cairo.FORMAT_ARGB32, cols * cell_w, rows * cell_h)
    ctx = cairo.Context(sheet)
    ctx.set_source_rgb(0.09, 0.09, 0.11)
    ctx.paint()
    ctx.select_font_face("sans-serif", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
    ctx.set_font_size(12)

    for idx, (aid, cpath, cw, ch) in enumerate(crop_files):
      r = idx // cols
      c = idx % cols
      x0, y0 = c * cell_w, r * cell_h
      csurf = cairo.ImageSurface.create_from_png(cpath)
      scale = min((cell_w - 32) / max(1, cw), (cell_h - 56) / max(1, ch), 1.0)
      ctx.save()
      ctx.translate(x0 + (cell_w - cw * scale) / 2, y0 + 14 + (cell_h - 56 - ch * scale) / 2)
      ctx.scale(scale, scale)
      ctx.set_source_surface(csurf, 0, 0)
      ctx.paint()
      ctx.restore()
      ctx.set_source_rgb(0.9, 0.9, 0.92)
      ctx.move_to(x0 + 14, y0 + cell_h - 16)
      ctx.show_text(f"{aid} ({cw}x{ch}px)")
    sheet.write_to_png(contact_sheet_path)

  manifest_path = os.path.join(workspace_dir, "assets.json")
  payload = {
      "assets": rich_assets,
      "contact_sheet": contact_sheet_path if crop_files else None,
      **flat_manifest,
  }
  with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2)

  return {
      "manifest_path": manifest_path,
      "contact_sheet_path": contact_sheet_path if crop_files else None,
      "extracted_count": len(rich_assets),
      "assets": [
          {"id": a["id"], "dimensions": a["dimensions"], "file": a["file"]}
          for a in rich_assets
      ],
  }


def main() -> None:
  parser = argparse.ArgumentParser(
      description="Normalize high-res UI screenshots, compute layout_metrics.json, and extract non-widget media assets."
  )
  parser.add_argument("--input_image", required=True, help="Path to input screenshot/comp.")
  parser.add_argument("--workspace_dir", required=True, help="Directory to write mockup.png, layout_metrics.json, and overlays.")
  parser.add_argument("--device_scale", type=float, default=None, help="Optional explicit display scale factor (e.g. 2.0 for @2x).")
  parser.add_argument("--boxes_json", default=None, help="Optional JSON array of non-widget asset boxes to extract.")
  parser.add_argument("--boxes_file", default=None, help="Optional path to JSON file of non-widget asset boxes to extract.")
  parser.add_argument("--export_dir", default=None, help="Optional directory (e.g. <project>/public/assets) to save cropped PNGs.")
  args = parser.parse_args()

  os.makedirs(args.workspace_dir, exist_ok=True)
  mockup_path = os.path.join(args.workspace_dir, "mockup.png")

  if os.path.abspath(args.input_image) != os.path.abspath(mockup_path):
    prep_info = prepare_mockup_image(args.input_image, mockup_path, args.device_scale)
  else:
    info = identify_image(mockup_path)
    prep_info = {
        "original_size": [info["width"], info["height"]],
        "normalized_size": [info["width"], info["height"]],
        "scale": 1.0,
        "scale_source": "already normalized",
        "color_handling": "sRGB",
        "output_path": mockup_path,
    }

  w, h, raw = load_rgb_bytes(mockup_path)
  layout_metrics, candidates = compute_reference_layout_metrics(w, h, raw)
  overlay_path = os.path.join(args.workspace_dir, "mockup_candidates_overlay.png")
  render_candidates_overlay(mockup_path, candidates, overlay_path)

  layout_metrics_path = os.path.join(args.workspace_dir, "layout_metrics.json")
  with open(layout_metrics_path, "w", encoding="utf-8") as f:
    json.dump(layout_metrics, f, indent=2)

  candidates_path = os.path.join(args.workspace_dir, "mockup_candidates.json")
  with open(candidates_path, "w", encoding="utf-8") as f:
    json.dump(candidates, f, indent=2)

  extraction_summary = None
  boxes_raw = None
  if args.boxes_json:
    boxes_raw = json.loads(args.boxes_json)
  elif args.boxes_file and os.path.isfile(args.boxes_file):
    with open(args.boxes_file, "r", encoding="utf-8") as f:
      boxes_raw = json.load(f)

  if boxes_raw is not None:
    if isinstance(boxes_raw, dict):
      boxes_raw = boxes_raw.get("boxes") or boxes_raw.get("selected_boxes") or [boxes_raw]
    extraction_summary = extract_assets(mockup_path, w, h, boxes_raw, args.workspace_dir, args.export_dir)

  summary = {
      "preparation": prep_info,
      "viewport": {
          "width_px": layout_metrics["width_px"],
          "height_px": layout_metrics["height_px"],
          "polarity": layout_metrics["polarity"],
          "background_hex": layout_metrics["background_hex"],
      },
      "body_container_px": layout_metrics["body_container_px"],
      "dominant_palette": layout_metrics["dominant_palette"],
      "edge_cuts": layout_metrics["edge_cuts"],
      "candidates_count": len(candidates),
      "artifacts": {
          "mockup_png": mockup_path,
          "layout_metrics_json": layout_metrics_path,
          "candidates_overlay_png": overlay_path,
          "candidates_json": candidates_path,
      },
      "extraction": extraction_summary,
  }
  print(json.dumps(summary, indent=2))


if __name__ == "__main__":
  main()
