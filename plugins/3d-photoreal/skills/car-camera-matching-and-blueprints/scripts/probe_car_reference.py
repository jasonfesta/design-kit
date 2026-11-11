#!/usr/bin/env python3
"""
probe_car_reference.py — Extract optical, perspective, paint, lighting & blueprint anchors for 3D car reconstruction.

Usage:
  python3 probe_car_reference.py <ref.jpg> [--blueprint <sheet_or_dir>]
"""

from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
from pathlib import Path
from typing import Any


def decode_resized_rgb(path: str, w: int, h: int) -> bytes:
    return subprocess.check_output(
        ["convert", path, "-resize", f"{w}x{h}!", "-depth", "8", "rgb:-"]
    )


def get_image_dims(path: str) -> tuple[int, int]:
    ident = (
        subprocess.check_output(["identify", "-format", "%w %h", path])
        .decode("utf-8")
        .strip()
        .split()
    )
    return int(ident[0]), int(ident[1])


def probe_blueprint_file(path: Path) -> dict[str, Any]:
    """Measure tight ink/silhouette bounding box and wheel-arch centers in a single orthographic view."""
    nw, nh = get_image_dims(str(path))
    W = min(640, max(240, nw))
    H = max(120, round(W * nh / max(1, nw)))
    raw = decode_resized_rgb(str(path), W, H)

    lums = [0.0] * (W * H)
    border_vals: list[float] = []
    for y in range(H):
        for x in range(W):
            i = (y * W + x) * 3
            lum = (0.2126 * raw[i] + 0.7152 * raw[i + 1] + 0.0722 * raw[i + 2]) / 255.0
            lums[y * W + x] = lum
            if x < 4 or x >= W - 4 or y < 4 or y >= H - 4:
                border_vals.append(lum)

    border_vals.sort()
    bg_lum = border_vals[len(border_vals) // 2] if border_vals else 1.0
    light_bg = bg_lum >= 0.5

    # Foreground ink mask (reject thin outer page borders within 2% margin)
    mx, my = max(2, int(0.02 * W)), max(2, int(0.02 * H))
    xs_hit: list[int] = []
    ys_hit: list[int] = []
    col_counts = [0] * W
    row_counts = [0] * H

    for y in range(my, H - my):
        for x in range(mx, W - mx):
            lum = lums[y * W + x]
            is_fg = (bg_lum - lum) > 0.16 if light_bg else (lum - bg_lum) > 0.16
            if is_fg:
                xs_hit.append(x)
                ys_hit.append(y)
                col_counts[x] += 1
                row_counts[y] += 1

    if len(xs_hit) < 40:
        return {"file": path.name, "native_size": [nw, nh], "detected_bbox_norm": [0.0, 0.0, 1.0, 1.0]}

    # Use P1..P99 quantiles to trim stray outer dimension callout lines/text
    xs_hit.sort()
    ys_hit.sort()
    x0 = xs_hit[max(0, int(0.01 * len(xs_hit)))]
    x1 = xs_hit[min(len(xs_hit) - 1, int(0.99 * len(xs_hit)))]
    y0 = ys_hit[max(0, int(0.01 * len(ys_hit)))]
    y1 = ys_hit[min(len(ys_hit) - 1, int(0.99 * len(ys_hit)))]

    span_w_px = max(1, (x1 - x0) * (nw / W))
    span_h_px = max(1, (y1 - y0) * (nh / H))

    # Estimate wheel centers on side-profile drawings (span_w / span_h > 2.1)
    wheel_arch_hint: dict[str, Any] = {}
    aspect_span = span_w_px / max(1.0, span_h_px)
    if aspect_span >= 2.05:
        # Scan lower 42% of vehicle bbox for dense circular wheel ink concentrations
        wy0 = int(y0 + 0.56 * (y1 - y0))
        wy1 = y1
        band_scores: list[tuple[float, int]] = []
        win = max(4, int(0.07 * (x1 - x0)))
        for cx in range(x0 + win, x1 - win):
            s = 0.0
            for yy in range(wy0, wy1 + 1):
                for xx in range(cx - win, cx + win + 1):
                    lum = lums[yy * W + xx]
                    s += (bg_lum - lum) if light_bg else (lum - bg_lum)
            band_scores.append((s, cx))
        mid_x = (x0 + x1) // 2
        left_cands = [t for t in band_scores if t[1] < mid_x - win]
        right_cands = [t for t in band_scores if t[1] > mid_x + win]
        if left_cands and right_cands:
            lx = max(left_cands, key=lambda t: t[0])[1]
            rx = max(right_cands, key=lambda t: t[0])[1]
            wb_ratio = (rx - lx) / max(1.0, float(x1 - x0))
            if 0.48 <= wb_ratio <= 0.78:
                wheel_arch_hint = {
                    "wheelbase_to_length_est": round(wb_ratio, 4),
                    "left_axle_u_in_bbox": round((lx - x0) / max(1.0, float(x1 - x0)), 4),
                    "right_axle_u_in_bbox": round((rx - x0) / max(1.0, float(x1 - x0)), 4),
                }

    return {
        "file": path.name,
        "native_size": [nw, nh],
        "detected_bbox_norm": [round(x0 / W, 4), round(y0 / H, 4), round(x1 / W, 4), round(y1 / H, 4)],
        "ink_span_px": [round(span_w_px, 1), round(span_h_px, 1)],
        "span_aspect_w_over_h": round(aspect_span, 4),
        **wheel_arch_hint,
    }


def analyze_blueprints(bp_path_str: str) -> dict[str, Any]:
    bp_path = Path(bp_path_str).expanduser().resolve()
    if bp_path.is_file():
        info = probe_blueprint_file(bp_path)
        return {"mode": "single_sheet", "sheet": info}

    views: dict[str, Any] = {}
    if bp_path.is_dir():
        for key in ("side", "front", "rear", "top"):
            for ext in (".png", ".jpg", ".jpeg", ".webp"):
                cand = bp_path / f"{key}{ext}"
                if cand.exists():
                    views[key] = probe_blueprint_file(cand)
                    break

    ratios: dict[str, Any] = {}
    if "side" in views:
        lw, lh = views["side"]["ink_span_px"]
        ratios["height_to_length"] = round(lh / max(1.0, lw), 4)
        if "wheelbase_to_length_est" in views["side"]:
            ratios["wheelbase_to_length"] = views["side"]["wheelbase_to_length_est"]
    if "top" in views:
        tw, th = views["top"]["ink_span_px"]
        long_axis = max(tw, th)
        short_axis = min(tw, th)
        ratios["width_to_length_from_top"] = round(short_axis / max(1.0, long_axis), 4)
        if "side" in views:
            lw = views["side"]["ink_span_px"][0]
            ratios["top_vs_side_length_scale_ratio"] = round(long_axis / max(1.0, lw), 4)
    if "front" in views and "side" in views:
        fw, fh = views["front"]["ink_span_px"]
        lw, lh = views["side"]["ink_span_px"]
        # Normalize front width against side length via shared roof height!
        norm_w_over_l = (fw / max(1.0, fh)) * (lh / max(1.0, lw))
        ratios["width_to_length_height_locked"] = round(norm_w_over_l, 4)
        ratios["width_to_height_from_front"] = round(fw / max(1.0, fh), 4)
        ratios["front_vs_side_height_scale_ratio"] = round(fh / max(1.0, lh), 4)
    if "front" in views and "rear" in views:
        fw, fh = views["front"]["ink_span_px"]
        rw, rh = views["rear"]["ink_span_px"]
        ratios["rear_vs_front_width_scale_ratio"] = round(rw / max(1.0, fw), 4)

    return {"mode": "multi_view_dir", "views": views, "derived_orthographic_ratios": ratios}


def probe_car_photo(path: str, blueprint: str | None = None) -> dict[str, Any]:
    nw, nh = get_image_dims(path)
    W = 240
    H = max(120, round(240 * nh / max(1, nw)))
    raw = decode_resized_rgb(path, W, H)

    lums = [[0.0] * W for _ in range(H)]
    rgb_grid = [[[0.0, 0.0, 0.0] for _ in range(W)] for _ in range(H)]
    for y in range(H):
        for x in range(W):
            i = (y * W + x) * 3
            r, g, b = raw[i] / 255.0, raw[i + 1] / 255.0, raw[i + 2] / 255.0
            rgb_grid[y][x] = [r, g, b]
            lums[y][x] = 0.2126 * r + 0.7152 * g + 0.0722 * b

    def zone_rgb(x0f: float, x1f: float, y0f: float, y1f: float) -> list[int]:
        rs = gs = bs = 0.0
        n = 0
        for y in range(int(y0f * H), int(y1f * H)):
            for x in range(int(x0f * W), int(x1f * W)):
                r, g, b = rgb_grid[y][x]
                rs += r * 255.0
                gs += g * 255.0
                bs += b * 255.0
                n += 1
        return [round(rs / max(n, 1)), round(gs / max(n, 1)), round(bs / max(n, 1))]

    # 1. Background / Scrim / Sky Radiometry & Studio Cyclorama Detection
    upper_samples: list[tuple[float, float, float, float, float]] = []
    bg_gx_sum = 0.0
    bg_gy_sum = 0.0
    bg_cnt = 0
    for y in range(1, max(2, int(0.24 * H))):
        for x in range(2, W - 2):
            r, g, b = rgb_grid[y][x]
            lum = lums[y][x]
            gx = abs(lums[y][x + 1] - lums[y][x - 1])
            gy = abs(lums[min(H - 1, y + 1)][x] - lums[max(0, y - 1)][x])
            upper_samples.append((lum, r, g, b, math.hypot(gx, gy)))
            bg_gx_sum += gx
            bg_gy_sum += gy
            bg_cnt += 1

    # Also include lower road strip in motion-streak anisotropy
    road_gx_sum = 0.0
    road_gy_sum = 0.0
    road_cnt = 0
    for y in range(int(0.82 * H), H - 1):
        for x in range(2, W - 2):
            road_gx_sum += abs(lums[y][x + 1] - lums[y][x - 1])
            road_gy_sum += abs(lums[y][x] - lums[y - 1][x])
            road_cnt += 1

    upper_samples.sort(key=lambda t: t[0])
    p75 = int(0.75 * len(upper_samples))
    p95 = max(p75 + 1, int(0.95 * len(upper_samples)))
    top_band = upper_samples[p75:p95]
    open_sky_or_scrim_p85_srgb = [
        round(255.0 * sum(t[1] for t in top_band) / len(top_band)),
        round(255.0 * sum(t[2] for t in top_band) / len(top_band)),
        round(255.0 * sum(t[3] for t in top_band) / len(top_band)),
    ]
    upper_mean_luma = sum(t[0] for t in upper_samples) / max(1, len(upper_samples))
    upper_smooth_grad = sorted(t[4] for t in upper_samples)[int(0.75 * len(upper_samples))]
    upper_chroma_b_minus_r = open_sky_or_scrim_p85_srgb[2] - open_sky_or_scrim_p85_srgb[0]

    # Subject center gradient vs background streak anisotropy (detects panning/rolling rig shots)
    car_gx_sum = 0.0
    car_gy_sum = 0.0
    car_cnt = 0
    for y in range(int(0.35 * H), int(0.75 * H)):
        for x in range(int(0.22 * W), int(0.78 * W)):
            car_gx_sum += abs(lums[y][x + 1] - lums[y][x - 1])
            car_gy_sum += abs(lums[y + 1][x] - lums[y - 1][x])
            car_cnt += 1

    bg_aniso = ((bg_gy_sum / max(1, bg_cnt)) + (road_gy_sum / max(1, road_cnt))) / max(
        1e-5, (bg_gx_sum / max(1, bg_cnt)) + (road_gx_sum / max(1, road_cnt))
    )
    car_aniso = (car_gy_sum / max(1, car_cnt)) / max(1e-5, car_gx_sum / max(1, car_cnt))
    is_rolling_rig_shot = (bg_aniso >= 1.72) and (bg_aniso > car_aniso * 1.28) and (upper_smooth_grad > 0.012)

    is_low_chroma_cove = abs(open_sky_or_scrim_p85_srgb[0] - open_sky_or_scrim_p85_srgb[2]) <= 18
    is_smooth_cove = upper_smooth_grad <= 0.024

    if is_smooth_cove and is_low_chroma_cove and upper_mean_luma < 0.28:
        lighting_regime = "studio_cyclorama_dark"
    elif is_smooth_cove and is_low_chroma_cove and upper_mean_luma >= 0.56:
        lighting_regime = "studio_cyclorama_light"
    elif upper_mean_luma < 0.16 and not is_smooth_cove:
        lighting_regime = "urban_night_practical"
    elif upper_chroma_b_minus_r >= 24:
        lighting_regime = "outdoor_sunlit"
    elif upper_mean_luma >= 0.52 and is_low_chroma_cove:
        lighting_regime = "outdoor_overcast"
    else:
        lighting_regime = "outdoor_or_architectural_plate"

    # 2. Undercarriage Contact Shadow Line & P10 Shadow Darkness
    under_samples: list[float] = []
    row_dark_scores: list[tuple[float, float]] = []
    for y in range(int(0.55 * H), int(0.93 * H)):
        band = [lums[y][x] for x in range(int(0.24 * W), int(0.76 * W))]
        under_samples.extend(band)
        mean_b = sum(band) / max(1, len(band))
        row_dark_scores.append((mean_b, round(y / H, 3)))
    under_samples.sort()
    p10_under_srgb = round(255.0 * under_samples[max(0, int(0.10 * len(under_samples)))])
    undercarriage_contact_y_norm = min(row_dark_scores, key=lambda t: t[0])[1] if row_dark_scores else 0.78

    # 3. Dominant Car Body Paint sRGB (filtering out glass, black rubber/shadow, and white glints)
    paint_cands_chroma: list[tuple[float, float, float, float]] = []
    paint_cands_neutral: list[tuple[float, float, float, float]] = []
    for y in range(int(0.42 * H), int(0.72 * H)):
        for x in range(int(0.24 * W), int(0.76 * W)):
            r, g, b = rgb_grid[y][x]
            lum = lums[y][x]
            mx = max(r, g, b)
            mn = min(r, g, b)
            chr_v = mx - mn
            if lum < 0.09 or (lum > 0.88 and chr_v < 0.12):
                continue
            if chr_v >= 0.14:
                paint_cands_chroma.append((chr_v, r, g, b))
            else:
                paint_cands_neutral.append((lum, r, g, b))

    paint_is_chromatic = len(paint_cands_chroma) >= int(0.18 * max(1, len(paint_cands_chroma) + len(paint_cands_neutral)))
    if paint_is_chromatic and paint_cands_chroma:
        paint_cands_chroma.sort(key=lambda t: t[0], reverse=True)
        top_p = paint_cands_chroma[: max(8, len(paint_cands_chroma) // 3)]
        dominant_body_paint_srgb = [
            round(255.0 * sum(t[1] for t in top_p) / len(top_p)),
            round(255.0 * sum(t[2] for t in top_p) / len(top_p)),
            round(255.0 * sum(t[3] for t in top_p) / len(top_p)),
        ]
    elif paint_cands_neutral:
        paint_cands_neutral.sort(key=lambda t: t[0])
        mid_lo = int(0.30 * len(paint_cands_neutral))
        mid_hi = max(mid_lo + 1, int(0.70 * len(paint_cands_neutral)))
        mid_p = paint_cands_neutral[mid_lo:mid_hi]
        dominant_body_paint_srgb = [
            round(255.0 * sum(t[1] for t in mid_p) / len(mid_p)),
            round(255.0 * sum(t[2] for t in mid_p) / len(mid_p)),
            round(255.0 * sum(t[3] for t in mid_p) / len(mid_p)),
        ]
    else:
        dominant_body_paint_srgb = zone_rgb(0.32, 0.68, 0.48, 0.68)

    # 4. Emissive Headlamp (bright cool/warm white core) & Taillamp (saturated HDR red) Spots
    headlamp_spots: list[tuple[float, float]] = []
    taillamp_spots: list[tuple[float, float]] = []
    ring_offsets = [(-5, 0), (5, 0), (0, -5), (0, 5), (-4, -4), (4, -4), (-4, 4), (4, 4)]
    for y in range(int(0.32 * H), int(0.78 * H)):
        for x in range(int(0.08 * W), int(0.92 * W)):
            r, g, b = rgb_grid[y][x]
            lum = lums[y][x]
            surround = sum(lums[y + dy][x + dx] for dx, dy in ring_offsets) / len(ring_offsets)
            if r > 0.72 and (r - g) > 0.34 and (r - b) > 0.34 and r > surround * 1.35:
                taillamp_spots.append((round(x / W, 2), round(y / H, 2)))
            elif lum > 0.86 and lum > max(0.55, surround * 1.55) and min(r, g, b) > 0.68:
                headlamp_spots.append((round(x / W, 2), round(y / H, 2)))

    # 5. Bilateral Symmetry Score & Wheel-Well Scale / Perspective Focal Regime
    sym_diff = 0.0
    sym_cnt = 0
    for y in range(int(0.30 * H), int(0.84 * H)):
        for x in range(int(0.12 * W), W // 2):
            mx = W - 1 - x
            sym_diff += abs(lums[y][x] - lums[y][mx])
            sym_cnt += 1
    bilateral_symmetry_score = round(max(0.0, 1.0 - (sym_diff / max(1, sym_cnt)) * 3.2), 3)

    # Estimate wheel hub candidates via dark tire arch surrounding brighter metallic rim center
    wheel_cands: list[tuple[float, int, int, int]] = []
    y_lo, y_hi = int(0.46 * H), int(0.88 * H)
    for rad in range(max(6, int(0.045 * W)), max(9, int(0.135 * W)), 2):
        for cy in range(y_lo + rad, min(H - rad - 2, y_hi)):
            for cx in range(rad + 6, W - rad - 6, 3):
                # Rim core vs dark tire ring at r = rad
                hub_lum = (lums[cy][cx] + lums[cy][cx - 2] + lums[cy][cx + 2]) / 3.0
                tire_pts = [
                    lums[cy - rad][cx],
                    lums[cy + min(rad, H - 1 - cy)][cx],
                    lums[cy][cx - rad],
                    lums[cy][cx + rad],
                ]
                tire_mean = sum(tire_pts) / 4.0
                tire_var = sum((v - tire_mean) ** 2 for v in tire_pts) / 4.0
                score = (hub_lum - tire_mean) - math.sqrt(tire_var) * 0.85
                if tire_mean < 0.28 and score > 0.10:
                    wheel_cands.append((score, cx, cy, rad))

    wheel_cands.sort(key=lambda t: t[0], reverse=True)
    picked_wheels: list[dict[str, Any]] = []
    for sc, cx, cy, rad in wheel_cands:
        if all(abs(cx - w["u"] * W) > 0.18 * W for w in picked_wheels):
            picked_wheels.append(
                {
                    "u": round(cx / W, 3),
                    "v": round(cy / H, 3),
                    "radius_norm_w": round(rad / W, 3),
                    "contrast_score": round(sc, 3),
                }
            )
        if len(picked_wheels) >= 2:
            break
    picked_wheels.sort(key=lambda w: w["u"])

    # Dutch roll / axle chord slope & wheel scale ratio
    far_to_near_wheel_scale = None
    axle_chord_slope_deg = 0.0
    if len(picked_wheels) == 2:
        r0, r1 = picked_wheels[0]["radius_norm_w"], picked_wheels[1]["radius_norm_w"]
        far_to_near_wheel_scale = round(min(r0, r1) / max(1e-5, max(r0, r1)), 3)
        dx = (picked_wheels[1]["u"] - picked_wheels[0]["u"]) * W
        dy = (picked_wheels[1]["v"] - picked_wheels[0]["v"]) * H
        axle_chord_slope_deg = round(math.degrees(math.atan2(dy, max(1.0, dx))), 2)

    # Estimate global horizon/road tilt via structure tensor in background upper/lower bands
    s_xy = 0.0
    s_xx_yy = 0.0
    for y in list(range(4, int(0.24 * H))) + list(range(int(0.82 * H), H - 4)):
        for x in range(6, W - 6):
            gx = 0.5 * (lums[y][x + 1] - lums[y][x - 1])
            gy = 0.5 * (lums[y + 1][x] - lums[y - 1][x])
            if abs(gy) > abs(gx) * 1.4 and abs(gy) > 0.025:
                # Near-horizontal edge normal points ~vertical; tangent tilt = -gx / gy
                s_xy += -gx * gy
                s_xx_yy += gy * gy
    dutch_roll_hint_deg = round(math.degrees(math.atan(s_xy / max(1e-6, s_xx_yy))), 2) if s_xx_yy > 0.02 else 0.0

    if bilateral_symmetry_score >= 0.78 and len(picked_wheels) < 2:
        view_regime = "front_or_rear_axial"
    elif far_to_near_wheel_scale is not None and far_to_near_wheel_scale >= 0.92 and abs(axle_chord_slope_deg) <= 2.2:
        view_regime = "side_profile"
    else:
        view_regime = "three_quarter_hero"

    if is_rolling_rig_shot or abs(dutch_roll_hint_deg) >= 3.0 or (far_to_near_wheel_scale is not None and far_to_near_wheel_scale < 0.68):
        focal_regime = "wide_dynamic_rig_20_32mm"
    elif lighting_regime.startswith("studio_") or (far_to_near_wheel_scale is not None and far_to_near_wheel_scale >= 0.78):
        focal_regime = "telephoto_studio_85_200mm"
    else:
        focal_regime = "normal_35_70mm"

    result: dict[str, Any] = {
        "native_size": [nw, nh],
        "aspect_ratio": round(nw / max(1, nh), 4),
        "recommended_canvas_size": [1200, round(1200 * nh / max(1, nw))],
        "lighting_regime": lighting_regime,
        "view_regime_hint": view_regime,
        "perspective_focal_regime": focal_regime,
        "is_rolling_rig_shot": is_rolling_rig_shot,
        "bg_motion_streak_anisotropy": round(bg_aniso, 3),
        "dutch_roll_hint_deg": dutch_roll_hint_deg,
        "bilateral_symmetry_score": bilateral_symmetry_score,
        "wheel_candidates": picked_wheels,
        "far_to_near_wheel_scale": far_to_near_wheel_scale,
        "axle_chord_slope_deg": axle_chord_slope_deg,
        "undercarriage_contact_y_norm": undercarriage_contact_y_norm,
        "undercarriage_shadow_p10_srgb": p10_under_srgb,
        "open_sky_or_scrim_p85_srgb": open_sky_or_scrim_p85_srgb,
        "dominant_body_paint_srgb": dominant_body_paint_srgb,
        "paint_is_chromatic": paint_is_chromatic,
        "foreground_ground_srgb": zone_rgb(0.12, 0.88, 0.80, 0.98),
        "emissive_headlamp_spot_count": len(headlamp_spots),
        "emissive_taillamp_spot_count": len(taillamp_spots),
    }

    if blueprint:
        result["blueprint_analysis"] = analyze_blueprints(blueprint)

    return result


def project_point_threejs(
    pt3d: list[float],
    cam_pos: list[float],
    target: list[float],
    fov_deg: float,
    aspect: float,
    u_p: float = 0.5,
    v_p: float = 0.5,
    roll_deg: float = 0.0,
) -> tuple[float, float] | None:
    """Exact projection matching Three.js PerspectiveCamera + setViewOffset(W, H, (0.5-uP)*W, (0.5-vP)*H, W, H)."""
    fx = target[0] - cam_pos[0]
    fy = target[1] - cam_pos[1]
    fz = target[2] - cam_pos[2]
    fl = math.sqrt(fx * fx + fy * fy + fz * fz)
    if fl < 1e-7:
        return None
    # zAxis = -forward
    zx, zy, zz = -fx / fl, -fy / fl, -fz / fl
    r_rad = math.radians(roll_deg)
    upx, upy, upz = math.sin(r_rad), math.cos(r_rad), 0.0
    # xAxis = normalize(cross(up, zAxis))
    xx = upy * zz - upz * zy
    xy = upz * zx - upx * zz
    xz = upx * zy - upy * zx
    xl = math.sqrt(xx * xx + xy * xy + xz * xz)
    if xl < 1e-7:
        return None
    xx, xy, xz = xx / xl, xy / xl, xz / xl
    # yAxis = cross(zAxis, xAxis)
    yx = zy * xz - zz * xy
    yy = zz * xx - zx * xz
    yz = zx * xy - zy * xx

    vx_w = pt3d[0] - cam_pos[0]
    vy_w = pt3d[1] - cam_pos[1]
    vz_w = pt3d[2] - cam_pos[2]

    vx = vx_w * xx + vy_w * xy + vz_w * xz
    vy = vx_w * yx + vy_w * yy + vz_w * yz
    vz = vx_w * zx + vy_w * zy + vz_w * zz
    depth = -vz
    if depth <= 0.15:
        return None

    tan_half_y = math.tan(math.radians(fov_deg) * 0.5)
    tan_half_x = tan_half_y * aspect
    u = u_p + (vx / depth) / (2.0 * tan_half_x)
    v = v_p - (vy / depth) / (2.0 * tan_half_y)
    return (u, v)


def solve_camera_pnp(pnp_spec: dict[str, Any], aspect: float) -> dict[str, Any]:
    """
    Fits exact Three.js camera parameters (position, target, fov, principalPoint, rollDeg)
    from >= 6 3D-to-2D correspondences: [{"name": ..., "xyz": [x,y,z], "uv": [u,v]}, ...].
    """
    pts = pnp_spec.get("points", [])
    init_pos = list(pnp_spec.get("init_position", [3.5, 1.25, 4.2]))
    init_tgt = list(pnp_spec.get("init_target", [0.0, 0.55, 0.0]))
    init_fov = float(pnp_spec.get("init_fov", 28.0))
    lock_pp = bool(pnp_spec.get("lock_principal_point", False))

    # Parameter vector: [cx, cy, cz, tx, ty, tz, fov, uP, vP, rollDeg]
    params = [
        init_pos[0], init_pos[1], init_pos[2],
        init_tgt[0], init_tgt[1], init_tgt[2],
        init_fov, 0.50, 0.50, 0.0,
    ]
    steps = [0.45, 0.25, 0.45, 0.20, 0.15, 0.20, 4.0, 0.04, 0.04, 2.0]

    def loss(p: list[float]) -> float:
        cx, cy, cz, tx, ty, tz, fov, up, vp, roll = p
        if fov < 9.0 or fov > 68.0 or cy < 0.08 or cy > 8.5:
            return 1e9
        if abs(up - 0.5) > 0.22 or abs(vp - 0.5) > 0.22 or abs(roll) > 14.0:
            return 1e9
        dist = math.sqrt((cx - tx) ** 2 + (cy - ty) ** 2 + (cz - tz) ** 2)
        if dist < 1.6 or dist > 28.0:
            return 1e9
        err = 0.0
        for item in pts:
            pr = project_point_threejs(item["xyz"], [cx, cy, cz], [tx, ty, tz], fov, aspect, up, vp, roll)
            if pr is None:
                return 1e9
            du = (pr[0] - item["uv"][0]) * aspect
            dv = pr[1] - item["uv"][1]
            w = float(item.get("weight", 1.0))
            err += w * (du * du + dv * dv)
        # Gentle regularization on principal point & roll to break focal/distance degeneracy cleanly
        err += 0.0008 * ((up - 0.5) ** 2 + (vp - 0.5) ** 2) + 0.000015 * (roll ** 2)
        err += 0.0002 * (tx ** 2 + (ty - 0.52) ** 2 + tz ** 2)
        return err

    # Multi-start over azimuth quadrants if user didn't give a tight init_position
    best_p = params[:]
    best_l = loss(best_p)
    if "init_position" not in pnp_spec:
        for az_deg in range(20, 360, 35):
            for dist0 in (4.2, 6.8, 10.5):
                for fov0 in (18.0, 28.0, 40.0):
                    rad = math.radians(az_deg)
                    cand = [
                        dist0 * math.sin(rad), 1.35, dist0 * math.cos(rad),
                        0.0, 0.52, 0.0, fov0, 0.5, 0.5, 0.0,
                    ]
                    cl = loss(cand)
                    if cl < best_l:
                        best_l = cl
                        best_p = cand

    cur_s = steps[:]
    active_indices = list(range(len(best_p)))
    if lock_pp:
        active_indices = [i for i in active_indices if i not in (7, 8)]

    for _round in range(260):
        improved = False
        for i in active_indices:
            for direction in (1.0, -1.0):
                cand = best_p[:]
                cand[i] += direction * cur_s[i]
                cl = loss(cand)
                if cl < best_l - 1e-12:
                    best_l = cl
                    best_p = cand
                    improved = True
                    break
        # Coupled dolly-zoom move along (distance * tan(fov/2) = const) to break focal-distance ridge!
        for zoom_dir in (1.0, -1.0):
            scale = 1.0 + zoom_dir * (cur_s[6] * 0.025)
            if scale <= 0.5:
                continue
            cand = best_p[:]
            for k in (0, 1, 2):
                cand[k] = cand[k + 3] + (cand[k] - cand[k + 3]) * scale
            new_tan = math.tan(math.radians(cand[6]) * 0.5) / scale
            cand[6] = math.degrees(2.0 * math.atan(max(1e-4, new_tan)))
            cl = loss(cand)
            if cl < best_l - 1e-12:
                best_l = cl
                best_p = cand
                improved = True
                break
        if not improved:
            cur_s = [s * 0.62 for s in cur_s]
            if max(cur_s) < 1e-5:
                break

    cx, cy, cz, tx, ty, tz, fov, up, vp, roll = best_p
    per_pt = []
    sq_px = 0.0
    for item in pts:
        pr = project_point_threejs(item["xyz"], [cx, cy, cz], [tx, ty, tz], fov, aspect, up, vp, roll) or (0.0, 0.0)
        dx_px = (pr[0] - item["uv"][0]) * 1200.0
        dy_px = (pr[1] - item["uv"][1]) * (1200.0 / aspect)
        err_px = math.hypot(dx_px, dy_px)
        sq_px += err_px * err_px
        per_pt.append({
            "name": item.get("name", ""),
            "target_uv": item["uv"],
            "pred_uv": [round(pr[0], 4), round(pr[1], 4)],
            "error_px_at_1200w": round(err_px, 2),
        })

    rms_px = math.sqrt(sq_px / max(1, len(pts)))
    return {
        "position": [round(cx, 4), round(cy, 4), round(cz, 4)],
        "target": [round(tx, 4), round(ty, 4), round(tz, 4)],
        "fov": round(fov, 3),
        "principalPoint": [round(up, 4), round(vp, 4)],
        "rollDeg": round(roll, 3),
        "rms_reprojection_error_px_1200w": round(rms_px, 2),
        "landmarks": per_pt,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Probe automotive reference photo, blueprints, and 3D-to-2D PnP pose.")
    parser.add_argument("ref_photo", help="Path to hero reference photograph")
    parser.add_argument("--blueprint", default=None, help="Optional path to 4-view blueprint sheet or directory")
    parser.add_argument("--pnp", default=None, help="Optional JSON file with 3D-to-2D landmark correspondences")
    parser.add_argument("--out", default=None, help="Optional output path for JSON probe report")
    args = parser.parse_args()
    res = probe_car_photo(args.ref_photo, args.blueprint)
    if args.pnp:
        pnp_data = json.loads(Path(args.pnp).read_text(encoding="utf-8"))
        res["pnp_camera_solution"] = solve_camera_pnp(pnp_data, res["aspect_ratio"])
    payload = json.dumps(res, indent=2)
    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(payload + "\n", encoding="utf-8")
    print(payload)


if __name__ == "__main__":
    main()
