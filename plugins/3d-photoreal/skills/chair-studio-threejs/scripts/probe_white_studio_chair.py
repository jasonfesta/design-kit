#!/usr/bin/env python3
"""probe_white_studio_chair.py -- Studio white-cyclorama & optical camera probe for single-chair reference images.

Delegates base perspective/radiometric probing to:
  ~/.gemini/config/skills/arch-camera-matching-and-perspective/scripts/probe_reference_plate.py
and adds studio-furniture-specific checks:
  1. Outer border ring white purity (`white_border_purity`, `border_mean_srgb`, `border_std_luma`).
  2. Connected-component foreground silhouette analysis (`connected_fg_components`, `largest_component_share`)
     to verify a single isolated chair rather than a multi-object room or grid collage.
  3. Exact chair bounding box `[u0, v0, u1, v1]`, `ground_contact_v_norm`, and soft-shadow floor band metrics.
  4. Foreground chair dominant sRGB palette (excluding the white cyclorama and floor shadow).
"""

import argparse
from collections import deque
import importlib.util
import json
import math
import os
from pathlib import Path
import subprocess
import sys
from typing import Any


def _load_arch_probe():
  candidates = [
      Path.home()
      / "skills/arch-camera-matching-and-perspective/scripts/probe_reference_plate.py",
      Path.home()
      / ".gemini/config/skills/arch-camera-matching-and-perspective/scripts/probe_reference_plate.py",
  ]
  for cand in candidates:
    if cand.exists():
      spec = importlib.util.spec_from_file_location("probe_reference_plate", str(cand))
      if spec and spec.loader:
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod.probe
  return None


def probe_chair_plate(image_path: str) -> dict[str, Any]:
  path = os.path.abspath(image_path)
  if not os.path.exists(path):
    raise FileNotFoundError(f"Image not found: {path}")

  ident = (
      subprocess.check_output(["identify", "-format", "%w %h", path])
      .decode()
      .strip()
      .split()
  )
  nw, nh = int(ident[0]), int(ident[1])

  arch_probe_fn = _load_arch_probe()
  base_probe = arch_probe_fn(path) if arch_probe_fn else {
      "native_size": [nw, nh],
      "aspect_ratio": round(nw / max(nh, 1), 4),
      "recommended_canvas_size": [1200, round(1200 * nh / max(nw, 1))],
      "perspective_regime_hint": "3-point_pitched",
  }

  w = 240
  h = max(120, round(240 * nh / max(nw, 1)))
  raw = subprocess.check_output(
      ["convert", path, "-resize", f"{w}x{h}!", "-depth", "8", "rgb:-"]
  )

  rgb = [[[0, 0, 0] for _ in range(w)] for _ in range(h)]
  luma = [[0.0] * w for _ in range(h)]
  chroma = [[0] * w for _ in range(h)]
  for y in range(h):
    for x in range(w):
      idx = (y * w + x) * 3
      r, g, b = raw[idx], raw[idx + 1], raw[idx + 2]
      rgb[y][x] = [r, g, b]
      luma[y][x] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0
      chroma[y][x] = max(r, g, b) - min(r, g, b)

  # 1. Outer 6% perimeter border ring (studio cyclorama purity check; exclude bottom floor-shadow strip for std check)
  bx = max(4, round(0.06 * w))
  by = max(4, round(0.06 * h))
  border_pixels: list[tuple[int, int, int, float, int]] = []
  cyc_wall_pixels: list[tuple[int, int, int, float, int]] = []
  for y in range(h):
    for x in range(w):
      if x < bx or x >= w - bx or y < by or y >= h - by:
        r, g, b = rgb[y][x]
        px_t = (r, g, b, luma[y][x], chroma[y][x])
        border_pixels.append(px_t)
        if y < int(0.88 * h):
          cyc_wall_pixels.append(px_t)

  ref_border = cyc_wall_pixels if cyc_wall_pixels else border_pixels
  n_border = max(len(ref_border), 1)
  white_px = [
      p for p in ref_border if p[3] >= 0.82 and p[4] <= 20
  ]
  solid_light_px = [
      p for p in ref_border if p[3] >= 0.76 and p[4] <= 24
  ]
  white_border_purity = round(len(white_px) / n_border, 4)
  solid_light_purity = round(len(solid_light_px) / n_border, 4)

  mean_r = sum(p[0] for p in ref_border) / n_border
  mean_g = sum(p[1] for p in ref_border) / n_border
  mean_b = sum(p[2] for p in ref_border) / n_border
  mean_l = sum(p[3] for p in ref_border) / n_border
  border_std_luma = round(
      math.sqrt(sum((p[3] - mean_l) ** 2 for p in ref_border) / n_border),
      4,
  )
  border_mean_srgb = [round(mean_r), round(mean_g), round(mean_b)]
  border_hex = "#{:02x}{:02x}{:02x}".format(*border_mean_srgb)

  # 2. Foreground mask (chair body vs soft floor shadow vs studio white/light cyclorama)
  bg_luma = mean_l if mean_l >= 0.70 else 0.92
  fg_mask = [[False] * w for _ in range(h)]
  shadow_mask = [[False] * w for _ in range(h)]
  fg_count = 0
  for y in range(h):
    for x in range(w):
      dl = abs(bg_luma - luma[y][x]) if mean_l >= 0.70 else (bg_luma - luma[y][x])
      dc = chroma[y][x]
      # Solid chair pixel: distinct luminance contrast from cyclorama OR saturated pigment
      if (bg_luma - luma[y][x]) > 0.085 or (mean_l >= 0.75 and dl > 0.11) or dc >= 24:
        fg_mask[y][x] = True
        fg_count += 1
      elif 0.020 <= (bg_luma - luma[y][x]) <= 0.085 and dc < 24:
        shadow_mask[y][x] = True

  fg_area_fraction = round(fg_count / max(w * h, 1), 4)

  # 3. Connected components on foreground mask (verify single isolated chair)
  visited = [[False] * w for _ in range(h)]
  components: list[tuple[int, int, int, int, int]] = []
  for y in range(h):
    for x in range(w):
      if fg_mask[y][x] and not visited[y][x]:
        q = deque([(x, y)])
        visited[y][x] = True
        area = 0
        x0, y0, x1, y1 = x, y, x, y
        while q:
          cx, cy = q.popleft()
          area += 1
          x0 = min(x0, cx)
          y0 = min(y0, cy)
          x1 = max(x1, cx)
          y1 = max(y1, cy)
          for nx, ny in (
              (cx - 1, cy),
              (cx + 1, cy),
              (cx, cy - 1),
              (cx, cy + 1),
              (cx - 1, cy - 1),
              (cx + 1, cy - 1),
              (cx - 1, cy + 1),
              (cx + 1, cy + 1),
          ):
            if 0 <= nx < w and 0 <= ny < h and fg_mask[ny][nx] and not visited[ny][nx]:
              visited[ny][nx] = True
              q.append((nx, ny))
        if area >= max(12, round(0.002 * w * h)):
          components.append((area, x0, y0, x1, y1))

  components.sort(reverse=True)
  total_sig_area = sum(c[0] for c in components)
  largest_share = (
      round(components[0][0] / max(total_sig_area, 1), 4) if components else 0.0
  )

  if components:
    _, bx0, by0, bx1, by1 = components[0]
    bbox_norm = [
        round(bx0 / w, 4),
        round(by0 / h, 4),
        round((bx1 + 1) / w, 4),
        round((by1 + 1) / h, 4),
    ]
  else:
    bbox_norm = [0.2, 0.15, 0.8, 0.88]

  # Measure soft shadow band around ground contact (just below / around y1 of chair)
  y_foot = int(bbox_norm[3] * h)
  shadow_near_feet = 0
  band_total = 0
  for y in range(max(0, y_foot - round(0.08 * h)), min(h, y_foot + round(0.06 * h))):
    for x in range(int(bbox_norm[0] * w), min(w, int(bbox_norm[2] * w) + 1)):
      band_total += 1
      if shadow_mask[y][x]:
        shadow_near_feet += 1
  soft_floor_shadow_ratio = round(shadow_near_feet / max(band_total, 1), 4)

  # 4. Dominant chair material colors (quantized 32-step buckets inside largest component)
  buckets: dict[tuple[int, int, int], list[list[int]]] = {}
  if components:
    _, cx0, cy0, cx1, cy1 = components[0]
    for y in range(cy0, cy1 + 1):
      for x in range(cx0, cx1 + 1):
        if fg_mask[y][x]:
          r, g, b = rgb[y][x]
          key = (r // 32, g // 32, b // 32)
          buckets.setdefault(key, []).append([r, g, b])

  sorted_buckets = sorted(buckets.values(), key=len, reverse=True)[:4]
  dominant_palette = []
  for pix_list in sorted_buckets:
    n_p = len(pix_list)
    mr = round(sum(p[0] for p in pix_list) / n_p)
    mg = round(sum(p[1] for p in pix_list) / n_p)
    mb = round(sum(p[2] for p in pix_list) / n_p)
    dominant_palette.append({
        "srgb": [mr, mg, mb],
        "hex": "#{:02x}{:02x}{:02x}".format(mr, mg, mb),
        "share": round(n_p / max(fg_count, 1), 3),
    })

  # Touching-edge check (avoid cropped close-up details cut off on 3+ sides)
  edges_touched = sum([
      bbox_norm[0] <= 0.015,
      bbox_norm[1] <= 0.015,
      bbox_norm[2] >= 0.985,
      bbox_norm[3] >= 0.990,
  ])

  studio_white_passed = bool(
      min(nw, nh) >= 600
      and mean_l >= 0.80
      and (white_border_purity >= 0.75 or (solid_light_purity >= 0.85 and border_std_luma <= 0.055))
      and border_std_luma <= 0.08
      and 0.04 <= fg_area_fraction <= 0.68
      and largest_share >= 0.70
      and edges_touched <= 1
  )

  # Continuous studio suitability score [0..100] for ranking RSS candidates (zero bonus on dark backgrounds!)
  res_score = min(1.0, min(nw, nh) / 1000.0) * 15.0
  uniformity_bonus = (
      max(0.0, 1.0 - border_std_luma * 12.0) * 22.0 if mean_l >= 0.76 else 0.0
  )
  white_score = (
      white_border_purity * 38.0
      + solid_light_purity * 10.0
      + uniformity_bonus
  )
  single_obj_score = (largest_share * 10.0) if (mean_l >= 0.72 and fg_area_fraction <= 0.70) else 0.0
  framing_score = (
      15.0
      if (mean_l >= 0.76 and 0.05 <= fg_area_fraction <= 0.58 and edges_touched <= 1)
      else (-30.0 if edges_touched >= 3 or mean_l < 0.65 else 2.0)
  )
  suitability_score = round(
      max(0.0, res_score + white_score + single_obj_score + framing_score), 2
  )

  result = dict(base_probe)
  result.update({
      "studio_white_passed": studio_white_passed,
      "suitability_score": suitability_score,
      "white_border_purity": white_border_purity,
      "solid_light_border_purity": solid_light_purity,
      "border_mean_srgb": border_mean_srgb,
      "border_hex": border_hex,
      "border_std_luma": border_std_luma,
      "foreground_area_fraction": fg_area_fraction,
      "connected_fg_components": len(components),
      "largest_component_share": largest_share,
      "chair_bbox_norm": bbox_norm,
      "ground_contact_v_norm": bbox_norm[3],
      "edges_touched": edges_touched,
      "soft_floor_shadow_ratio": soft_floor_shadow_ratio,
      "chair_dominant_palette": dominant_palette,
  })
  return result


def main() -> None:
  parser = argparse.ArgumentParser(
      description="Probe a chair reference image for studio white background purity and camera optics."
  )
  parser.add_argument("image", help="Path to local chair reference image (.jpg/.png/.webp)")
  args = parser.parse_args()
  print(json.dumps(probe_chair_plate(args.image), indent=2))


if __name__ == "__main__":
  main()
