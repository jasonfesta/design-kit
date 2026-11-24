#!/usr/bin/env python3
"""
InfiniSplat Web Baker (v1 Surface-Aligned Supports + v2 Opacity/Disocclusion + v3 GSNorm)

Converts a co-registered (photo, depth, bg_clean) triplet into a compact,
browser-native anisotropic 3D Gaussian Splat binary (.isplat.bin / .isplat.bin.gz)
and optional standard 3DGS .ply file.

Usage:
  PYTHONPATH=~/design-kit/tools/python/site python3 infinisplat_bake.py \
    --photo portrait.png \
    --depth depth.png \
    --bg bg_clean.png \
    --out scene.isplat.bin \
    --gzip \
    --subject-splats 54000 \
    --bg-splats 32000
"""

from __future__ import annotations

import argparse
import gzip
import json
import math
import struct
from pathlib import Path

import numpy as np
from PIL import Image


def load_rgb(path: Path, width: int, height: int) -> np.ndarray:
    img = Image.open(path).convert("RGB")
    if img.size != (width, height):
        img = img.resize((width, height), Image.Resampling.LANCZOS)
    return np.asarray(img, dtype=np.float32) / 255.0


def load_gray(path: Path, width: int, height: int) -> np.ndarray:
    img = Image.open(path).convert("L")
    if img.size != (width, height):
        img = img.resize((width, height), Image.Resampling.LANCZOS)
    return np.asarray(img, dtype=np.float32) / 255.0


def box_blur(arr: np.ndarray, radius: int) -> np.ndarray:
    if radius <= 0:
        return arr.copy()
    k = 2 * radius + 1
    # Horizontal
    pad = np.pad(arr, ((0, 0), (radius, radius)), mode="edge")
    cs = np.cumsum(pad, axis=1)
    cs = np.pad(cs, ((0, 0), (1, 0)), mode="constant")
    tmp = (cs[:, k:] - cs[:, :-k]) / float(k)
    # Vertical
    pad = np.pad(tmp, ((radius, radius), (0, 0)), mode="edge")
    cs = np.cumsum(pad, axis=0)
    cs = np.pad(cs, ((1, 0), (0, 0)), mode="constant")
    return (cs[k:, :] - cs[:-k, :]) / float(k)


def joint_bilateral_depth(
    depth: np.ndarray,
    rgb: np.ndarray,
    radius: int = 4,
    sigma_space: float = 2.6,
    sigma_color: float = 0.085,
) -> np.ndarray:
    """RGB-guided joint bilateral filter locking depth boundaries onto photo edges."""
    h, w = depth.shape
    num = np.zeros((h, w), dtype=np.float32)
    den = np.zeros((h, w), dtype=np.float32)
    pad_d = np.pad(depth, radius, mode="edge")
    pad_c = np.pad(rgb, ((radius, radius), (radius, radius), (0, 0)), mode="edge")

    inv_2ss = 1.0 / (2.0 * sigma_space * sigma_space)
    inv_2sc = 1.0 / (2.0 * sigma_color * sigma_color)

    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            ws = math.exp(-(dx * dx + dy * dy) * inv_2ss)
            d_shift = pad_d[radius + dy : radius + dy + h, radius + dx : radius + dx + w]
            c_shift = pad_c[radius + dy : radius + dy + h, radius + dx : radius + dx + w, :]
            diff = c_shift - rgb
            c_dist2 = diff[..., 0] ** 2 + diff[..., 1] ** 2 + diff[..., 2] ** 2
            wt = ws * np.exp(-c_dist2 * inv_2sc)
            num += wt * d_shift
            den += wt
    return num / np.maximum(den, 1e-6)


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / max(edge1 - edge0, 1e-6), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def compute_inward_distance(mask_bool: np.ndarray, max_steps: int = 26) -> np.ndarray:
    """Fast Chamfer-like inward distance transform inside mask_bool (in pixels)."""
    h, w = mask_bool.shape
    dist = np.where(mask_bool, float(max_steps), 0.0).astype(np.float32)
    # Two-pass 4-connected + diagonal chamfer approximation
    for _ in range(2):
        # Forward
        for y in range(1, h):
            row = dist[y]
            prev = dist[y - 1]
            row = np.minimum(row, prev + 1.0)
            row[1:] = np.minimum(row[1:], prev[:-1] + 1.414)
            row[:-1] = np.minimum(row[:-1], prev[1:] + 1.414)
            dist[y] = row
        for x in range(1, w):
            dist[:, x] = np.minimum(dist[:, x], dist[:, x - 1] + 1.0)
        # Backward
        for y in range(h - 2, -1, -1):
            row = dist[y]
            nxt = dist[y + 1]
            row = np.minimum(row, nxt + 1.0)
            row[1:] = np.minimum(row[1:], nxt[:-1] + 1.414)
            row[:-1] = np.minimum(row[:-1], nxt[1:] + 1.414)
            dist[y] = row
        for x in range(w - 2, -1, -1):
            dist[:, x] = np.minimum(dist[:, x], dist[:, x + 1] + 1.0)
    return np.clip(dist, 0.0, float(max_steps))


def inpaint_background_depth(depth_closeness: np.ndarray, fg_mask: np.ndarray) -> np.ndarray:
    """Smoothly diffuse valid park/background depth behind the foreground silhouette."""
    bg_valid = fg_mask < 0.25
    # Fill initial hole with row-wise nearest valid background depth so vertical park depth gradient stays intact
    h, w = depth_closeness.shape
    filled = depth_closeness.copy()
    for y in range(h):
        valid_x = np.where(bg_valid[y])[0]
        if valid_x.size >= 2:
            invalid_x = np.where(~bg_valid[y])[0]
            if invalid_x.size > 0:
                filled[y, invalid_x] = np.interp(invalid_x, valid_x, depth_closeness[y, valid_x])
        elif valid_x.size == 1:
            filled[y, ~bg_valid[y]] = depth_closeness[y, valid_x[0]]
        else:
            filled[y, :] = 0.22

    # Iterative harmonic smoothing only inside the hole + slight seam margin
    hole = fg_mask >= 0.15
    for _ in range(28):
        sm = box_blur(filled, 4)
        filled = np.where(hole, sm, depth_closeness)
    # Keep background strictly behind the subject depth plane
    return box_blur(filled, 2)


def compute_detail_energy(rgb: np.ndarray) -> np.ndarray:
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    gx = np.abs(np.diff(lum, axis=1, prepend=lum[:, :1]))
    gy = np.abs(np.diff(lum, axis=0, prepend=lum[:1, :]))
    grad = np.sqrt(gx * gx + gy * gy)
    return box_blur(grad, 1)


def bilinear_sample_2d(arr: np.ndarray, xs: np.ndarray, ys: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    xs = np.clip(xs, 0.0, w - 1.001)
    ys = np.clip(ys, 0.0, h - 1.001)
    x0 = xs.astype(np.int32)
    y0 = ys.astype(np.int32)
    x1 = np.minimum(x0 + 1, w - 1)
    y1 = np.minimum(y0 + 1, h - 1)
    fx = (xs - x0).astype(np.float32)
    fy = (ys - y0).astype(np.float32)
    if arr.ndim == 3:
        fx = fx[:, None]
        fy = fy[:, None]
    v00 = arr[y0, x0]
    v10 = arr[y0, x1]
    v01 = arr[y1, x0]
    v11 = arr[y1, x1]
    return (v00 * (1 - fx) + v10 * fx) * (1 - fy) + (v01 * (1 - fx) + v11 * fx) * fy


def sample_surface_aligned_layer(
    rgb: np.ndarray,
    z_map: np.ndarray,
    alpha_map: np.ndarray,
    valid_mask: np.ndarray,
    target_count: int,
    fx: float,
    fy: float,
    cx: float,
    cy: float,
    layer_id: int,
    overlap_k: float,
    detail_boost: float,
    slope_boost: float,
    sun_dir: np.ndarray,
    rng: np.random.Generator,
    min_scale_mult: float = 0.85,
    max_scale_mult: float = 3.2,
    allow_oblique_fill: bool = True,
) -> dict[str, np.ndarray]:
    """
    InfiniSplat v1 + v3 surface-aligned sparse sampling:
      1. Anchor scaffold (uniform stratified grid over valid mask — zero holes)
      2. Detail-ranked samples (eyes, lips, hair, edges)
      3. Oblique triangle-interior samples (curved cheeks/jawline/shoulders)
      4. Metric surface tangent frame (u_axis, v_axis) scaled by represented area (GSNorm)
    """
    h, w = z_map.shape
    detail = compute_detail_energy(rgb)

    # Layer-safe finite differences (one-sided across mask boundaries so zero depth-jump stretch)
    z_l = np.pad(z_map[:, :-1], ((0, 0), (1, 0)), mode="edge")
    z_r = np.pad(z_map[:, 1:], ((0, 0), (0, 1)), mode="edge")
    z_u = np.pad(z_map[:-1, :], ((1, 0), (0, 0)), mode="edge")
    z_d = np.pad(z_map[1:, :], ((0, 1), (0, 0)), mode="edge")

    m_l = np.pad(valid_mask[:, :-1], ((0, 0), (1, 0)), mode="edge")
    m_r = np.pad(valid_mask[:, 1:], ((0, 0), (0, 1)), mode="edge")
    m_u = np.pad(valid_mask[:-1, :], ((1, 0), (0, 0)), mode="edge")
    m_d = np.pad(valid_mask[1:, :], ((0, 1), (0, 0)), mode="edge")

    # Reject large depth jumps from contributing to surface tangent slope (v2 opacity/edge safety)
    z_jump = 0.08 * z_map
    ok_l = m_l & (np.abs(z_map - z_l) < z_jump)
    ok_r = m_r & (np.abs(z_r - z_map) < z_jump)
    ok_u = m_u & (np.abs(z_map - z_u) < z_jump)
    ok_d = m_d & (np.abs(z_d - z_map) < z_jump)

    dz_dx = np.where(
        ok_l & ok_r,
        0.5 * (z_r - z_l),
        np.where(ok_r, z_r - z_map, np.where(ok_l, z_map - z_l, 0.0)),
    )
    dz_dy = np.where(
        ok_u & ok_d,
        0.5 * (z_d - z_u),
        np.where(ok_d, z_d - z_map, np.where(ok_u, z_map - z_u, 0.0)),
    )

    # Clamp grazing slope to keep splats physically plausible (never needle-stretched)
    pixel_world_x = z_map / fx
    pixel_world_y = z_map / fy
    dz_dx = np.clip(dz_dx, -2.2 * pixel_world_x, 2.2 * pixel_world_x)
    dz_dy = np.clip(dz_dy, -2.2 * pixel_world_y, 2.2 * pixel_world_y)

    slope_mag = np.sqrt((dz_dx / np.maximum(pixel_world_x, 1e-5)) ** 2 + (dz_dy / np.maximum(pixel_world_y, 1e-5)) ** 2)
    area_factor = np.sqrt(1.0 + slope_mag * slope_mag)

    # 1. Anchor scaffold covering 100% of valid_mask uniformly
    valid_count = int(valid_mask.sum())
    if valid_count == 0 or target_count <= 0:
        empty3 = np.zeros((0, 3), dtype=np.float32)
        empty1 = np.zeros((0,), dtype=np.float32)
        return {
            "pos": empty3,
            "u_axis": empty3,
            "v_axis": empty3,
            "rgb": empty3,
            "alpha": empty1,
            "layer": np.zeros((0,), dtype=np.uint8),
            "rim": empty1,
            "z": empty1,
        }

    anchor_budget = int(target_count * (0.86 if allow_oblique_fill else 0.90))
    stride = max(1.0, math.sqrt(valid_count / max(anchor_budget, 1)))

    gy_vals = np.arange(0.5 * stride, h - 0.5, stride, dtype=np.float32)
    gx_vals = np.arange(0.5 * stride, w - 0.5, stride, dtype=np.float32)
    gxx, gyy = np.meshgrid(gx_vals, gy_vals)
    # Minimal jitter preserves crisp photographic lattice continuity while breaking grid moire
    jx = gxx.ravel() + rng.uniform(-0.18 * stride, 0.18 * stride, size=gxx.size).astype(np.float32)
    jy = gyy.ravel() + rng.uniform(-0.18 * stride, 0.18 * stride, size=gyy.size).astype(np.float32)
    jx = np.clip(jx, 0.0, w - 1.001)
    jy = np.clip(jy, 0.0, h - 1.001)
    keep_anchor = valid_mask[jy.astype(np.int32), jx.astype(np.int32)]
    ax = jx[keep_anchor]
    ay = jy[keep_anchor]
    a_spacing = np.full(ax.shape, stride, dtype=np.float32)
    a_z_bias = np.zeros(ax.shape, dtype=np.float32)

    # 2. Detail + oblique triangle-interior adaptive sampling (remaining budget)
    # Micro-detail splats sit 0.9mm forward on the surface so eyes, eyelashes & glasses frames stay razor sharp!
    rem_budget = max(0, target_count - ax.size)
    if rem_budget > 0:
        weights = np.where(
            valid_mask,
            0.04 + detail_boost * (detail * detail) + (slope_boost * np.minimum(slope_mag, 2.0) if allow_oblique_fill else 0.0),
            0.0,
        ).astype(np.float64)
        w_sum = weights.sum()
        if w_sum > 0:
            probs = (weights / w_sum).ravel()
            idx = rng.choice(h * w, size=rem_budget, replace=True, p=probs)
            ry = (idx // w).astype(np.float32) + rng.uniform(0.15, 0.85, size=rem_budget).astype(np.float32)
            rx = (idx % w).astype(np.float32) + rng.uniform(0.15, 0.85, size=rem_budget).astype(np.float32)
            rx = np.clip(rx, 0.0, w - 1.001)
            ry = np.clip(ry, 0.0, h - 1.001)
            r_spacing = np.full(rx.shape, max(0.68, stride * 0.52), dtype=np.float32)
            r_z_bias = np.full(rx.shape, -0.0012 if allow_oblique_fill else 0.0, dtype=np.float32)
            xs = np.concatenate([ax, rx])
            ys = np.concatenate([ay, ry])
            spacings = np.concatenate([a_spacing, r_spacing])
            z_bias = np.concatenate([a_z_bias, r_z_bias])
        else:
            xs, ys, spacings, z_bias = ax, ay, a_spacing, a_z_bias
    else:
        xs, ys, spacings, z_bias = ax, ay, a_spacing, a_z_bias

    # Sample attributes continuously (InfiniDepth continuous-coordinate style)
    z = bilinear_sample_2d(z_map, xs, ys) + z_bias
    col = bilinear_sample_2d(rgb, xs, ys)
    alp = bilinear_sample_2d(alpha_map, xs, ys)
    dzx = bilinear_sample_2d(dz_dx, xs, ys)
    dzy = bilinear_sample_2d(dz_dy, xs, ys)
    s_area = bilinear_sample_2d(area_factor, xs, ys)

    # Prune very low opacity (InfiniSplat v2 alpha >= 0.01)
    keep_op = alp >= 0.04
    xs, ys, spacings = xs[keep_op], ys[keep_op], spacings[keep_op]
    z, col, alp = z[keep_op], col[keep_op], alp[keep_op]
    dzx, dzy, s_area = dzx[keep_op], dzy[keep_op], s_area[keep_op]

    # Unproject to right-handed camera-centered world coordinates (camera at origin looking down -Z)
    # Wait: using -Z forward (standard WebGL/Three.js convention: camera at (0, 0, 0), scene at z_world = -z)
    x_w = (xs - cx) * z / fx
    y_w = -(ys - cy) * z / fy
    z_w = -z
    pos = np.stack([x_w, y_w, z_w], axis=1).astype(np.float32)

    # Compute exact 3D world surface tangent vectors dP/dpx and dP/dpy
    # x_w(u) = (u - cx) * z(u) / fx => dx_w/du = z/fx + (u - cx)/fx * dz/du
    # y_w(v) = -(v - cy) * z(v) / fy => dy_w/dv = -z/fy - (v - cy)/fy * dz/dv
    # z_w = -z => dz_w/du = -dz/du
    u_ray = (xs - cx) / fx
    v_ray = (ys - cy) / fy

    dP_du = np.stack([z / fx + u_ray * dzx, -v_ray * dzx, -dzx], axis=1)
    dP_dv = np.stack([u_ray * dzy, -(z / fy + v_ray * dzy), -dzy], axis=1)

    # Surface normal n = normalize(dP_du x (-dP_dv)) pointing toward camera (+Z)
    normal = np.cross(dP_du, -dP_dv)
    n_len = np.linalg.norm(normal, axis=1, keepdims=True)
    normal = normal / np.maximum(n_len, 1e-6)
    # Ensure outward camera-facing orientation
    flip = normal[:, 2:3] < 0.0
    normal = np.where(flip, -normal, normal)

    # Orthonormalize tangent directions while preserving anisotropic metric aspect & slope stretch!
    len_u = np.linalg.norm(dP_du, axis=1, keepdims=True)
    len_v = np.linalg.norm(dP_dv, axis=1, keepdims=True)
    t_u = dP_du / np.maximum(len_u, 1e-6)
    t_v = np.cross(normal, t_u)
    t_v = t_v / np.maximum(np.linalg.norm(t_v, axis=1, keepdims=True), 1e-6)

    # Represented metric surface area radius scaling (InfiniSplat v1 + v3 GSNorm)
    # Effective pixel footprint * local spacing * overlap_k
    base_px_u = z / fx
    base_px_v = z / fy
    # Clamp slope stretch ratio smoothly
    stretch_u = np.clip(len_u[:, 0] / np.maximum(base_px_u, 1e-6), 1.0, 1.85)
    stretch_v = np.clip(len_v[:, 0] / np.maximum(base_px_v, 1e-6), 1.0, 1.85)

    # Fine detail shrinks splats slightly; smooth broad areas expand slightly for creamy continuity
    r_u = np.clip(
        spacings * base_px_u * stretch_u * overlap_k * 0.56,
        base_px_u * min_scale_mult,
        base_px_u * spacings * max_scale_mult,
    )
    r_v = np.clip(
        spacings * base_px_v * stretch_v * overlap_k * 0.56,
        base_px_v * min_scale_mult,
        base_px_v * spacings * max_scale_mult,
    )

    # Extra mild surface-area coverage boost on sloped regions so ±25° orbit has zero gaps
    area_boost = np.clip(np.power(s_area, 0.28), 1.0, 1.32)
    u_axis = (t_u * (r_u * area_boost)[:, None]).astype(np.float32)
    v_axis = (t_v * (r_v * area_boost)[:, None]).astype(np.float32)

    # View-dependent warm golden rim/sheen hint (SH1 approximation)
    sun_dot = np.clip(np.sum(normal * sun_dir[None, :], axis=1), 0.0, 1.0)
    grazing = np.clip(1.0 - np.abs(normal[:, 2]), 0.0, 1.0)
    rim = np.clip(0.35 * sun_dot + 0.65 * grazing * (0.4 + 0.6 * sun_dot), 0.0, 1.0).astype(np.float32)

    return {
        "pos": pos,
        "u_axis": u_axis,
        "v_axis": v_axis,
        "rgb": np.clip(col, 0.0, 1.0).astype(np.float32),
        "alpha": np.clip(alp, 0.0, 1.0).astype(np.float32),
        "layer": np.full(pos.shape[0], layer_id, dtype=np.uint8),
        "rim": rim,
        "z": z.astype(np.float32),
    }


def make_atmospheric_bokeh_layer(
    subject_center: np.ndarray,
    fov_rad: float,
    aspect: float,
    count: int,
    rng: np.random.Generator,
) -> dict[str, np.ndarray]:
    """Subtle near-lens sunlit park pollen & dappled bokeh Gaussians around frame edges."""
    if count <= 0:
        empty3 = np.zeros((0, 3), dtype=np.float32)
        empty1 = np.zeros((0,), dtype=np.float32)
        return {
            "pos": empty3,
            "u_axis": empty3,
            "v_axis": empty3,
            "rgb": empty3,
            "alpha": empty1,
            "layer": np.zeros((0,), dtype=np.uint8),
            "rim": empty1,
            "z": empty1,
        }

    # Distribute mostly in outer thirds & upper sunlit canopy so center face stays crystal clear
    zs = rng.uniform(0.58, 2.95, size=count).astype(np.float32)
    half_h = zs * math.tan(0.5 * fov_rad)
    half_w = half_h * aspect

    xs = np.zeros(count, dtype=np.float32)
    ys = np.zeros(count, dtype=np.float32)
    for i in range(count):
        for _ in range(12):
            nx = rng.uniform(-1.05, 1.05)
            ny = rng.uniform(-0.92, 0.98)
            # Keep clear of central face ellipse
            if (nx / 0.42) ** 2 + ((ny - 0.05) / 0.56) ** 2 > 1.0:
                xs[i] = nx * half_w[i]
                ys[i] = ny * half_h[i]
                break
        else:
            xs[i] = rng.choice([-0.85, 0.85]) * half_w[i]
            ys[i] = rng.uniform(-0.6, 0.8) * half_h[i]

    pos = np.stack([xs, ys, -zs], axis=1).astype(np.float32)
    radii = rng.uniform(0.008, 0.042, size=count).astype(np.float32) * (zs / 1.5)
    angles = rng.uniform(0.0, math.pi, size=count).astype(np.float32)
    ecc = rng.uniform(0.82, 1.18, size=count).astype(np.float32)

    u_axis = np.stack([np.cos(angles) * radii, np.sin(angles) * radii, np.zeros(count)], axis=1).astype(np.float32)
    v_axis = np.stack([-np.sin(angles) * radii * ecc, np.cos(angles) * radii * ecc, np.zeros(count)], axis=1).astype(np.float32)

    # Warm sunlit cream-gold and soft botanical leaf highlights (zero purple/blue)
    warm_pick = rng.uniform(0.0, 1.0, size=count)
    col = np.zeros((count, 3), dtype=np.float32)
    col[:, 0] = np.where(warm_pick < 0.72, rng.uniform(0.92, 1.0, count), rng.uniform(0.62, 0.78, count))
    col[:, 1] = np.where(warm_pick < 0.72, rng.uniform(0.84, 0.95, count), rng.uniform(0.74, 0.86, count))
    col[:, 2] = np.where(warm_pick < 0.72, rng.uniform(0.64, 0.80, count), rng.uniform(0.46, 0.62, count))

    alp = rng.uniform(0.06, 0.16, size=count).astype(np.float32)
    return {
        "pos": pos,
        "u_axis": u_axis,
        "v_axis": v_axis,
        "rgb": col,
        "alpha": alp,
        "layer": np.full(count, 2, dtype=np.uint8),
        "rim": np.full(count, 0.9, dtype=np.float32),
        "z": zs,
    }


def pack_isplat_binary(
    merged: dict[str, np.ndarray],
    fov_deg: float,
    aspect: float,
    gs_norm_scale: float,
    subject_center: np.ndarray,
    z_near: float,
    z_far: float,
) -> bytes:
    """
    ISPL v1 binary format (64-byte header + 24 bytes/splat):
      Header:
        4s magic ('ISPL'), I version (1), I count, f fovDeg, f aspect, f gsNormScale,
        3f boundsMin, 3f boundsMax, 3f subjectCenter, f maxAxisLen, f zNear
      Per splat (24 bytes):
        3H pos_q16 (6B)
        3b uDir_i8, B uLen_q8 (4B)
        3b vDir_i8, B vLen_q8 (4B)
        3B rgb (3B), B alpha (1B)
        B layer (1B), B rim (1B), H depthNorm (2B)
    """
    pos = merged["pos"]
    u_axis = merged["u_axis"]
    v_axis = merged["v_axis"]
    rgb = merged["rgb"]
    alpha = merged["alpha"]
    layer = merged["layer"]
    rim = merged["rim"]
    z = merged["z"]

    count = int(pos.shape[0])
    bmin = pos.min(axis=0).astype(np.float32) - 1e-4
    bmax = pos.max(axis=0).astype(np.float32) + 1e-4
    span = np.maximum(bmax - bmin, 1e-5)

    pos_q = np.clip(np.round((pos - bmin[None, :]) / span[None, :] * 65535.0), 0, 65535).astype(np.uint16)

    u_len = np.linalg.norm(u_axis, axis=1)
    v_len = np.linalg.norm(v_axis, axis=1)
    max_axis_len = float(max(u_len.max(initial=0.05), v_len.max(initial=0.05), 1e-4))
    min_axis_len = max_axis_len / 512.0

    u_dir = u_axis / np.maximum(u_len[:, None], 1e-7)
    v_dir = v_axis / np.maximum(v_len[:, None], 1e-7)
    u_dir_q = np.clip(np.round(u_dir * 127.0), -127, 127).astype(np.int8)
    v_dir_q = np.clip(np.round(v_dir * 127.0), -127, 127).astype(np.int8)

    log_min = math.log(min_axis_len)
    log_max = math.log(max_axis_len)
    u_len_q = np.clip(
        np.round((np.log(np.maximum(u_len, min_axis_len)) - log_min) / max(log_max - log_min, 1e-6) * 255.0),
        0,
        255,
    ).astype(np.uint8)
    v_len_q = np.clip(
        np.round((np.log(np.maximum(v_len, min_axis_len)) - log_min) / max(log_max - log_min, 1e-6) * 255.0),
        0,
        255,
    ).astype(np.uint8)

    rgb_q = np.clip(np.round(rgb * 255.0), 0, 255).astype(np.uint8)
    alp_q = np.clip(np.round(alpha * 255.0), 0, 255).astype(np.uint8)
    rim_q = np.clip(np.round(rim * 255.0), 0, 255).astype(np.uint8)
    z_norm = np.clip(np.round((z - z_near) / max(z_far - z_near, 1e-4) * 65535.0), 0, 65535).astype(np.uint16)

    header = struct.pack(
        "<4sIIff3f3f3fff",
        b"ISPL",
        1,
        count,
        float(fov_deg),
        float(gs_norm_scale),
        float(bmin[0]),
        float(bmin[1]),
        float(bmin[2]),
        float(bmax[0]),
        float(bmax[1]),
        float(bmax[2]),
        float(subject_center[0]),
        float(subject_center[1]),
        float(subject_center[2]),
        float(max_axis_len),
        float(z_near),
    )
    assert len(header) == 64

    rec_dtype = np.dtype(
        [
            ("pos", "<u2", (3,)),
            ("udir", "i1", (3,)),
            ("ulen", "u1"),
            ("vdir", "i1", (3,)),
            ("vlen", "u1"),
            ("rgb", "u1", (3,)),
            ("alpha", "u1"),
            ("layer", "u1"),
            ("rim", "u1"),
            ("znorm", "<u2"),
            ("pad", "<u2"),
        ]
    )
    assert rec_dtype.itemsize == 24
    recs = np.empty(count, dtype=rec_dtype)
    recs["pos"] = pos_q
    recs["udir"] = u_dir_q
    recs["ulen"] = u_len_q
    recs["vdir"] = v_dir_q
    recs["vlen"] = v_len_q
    recs["rgb"] = rgb_q
    recs["alpha"] = alp_q
    recs["layer"] = layer
    recs["rim"] = rim_q
    recs["znorm"] = z_norm
    recs["pad"] = 0

    return header + recs.tobytes()


def export_standard_ply(merged: dict[str, np.ndarray], path: Path) -> None:
    """Export standard Inria/InfiniSplat 3DGS binary_little_endian .ply (SH0)."""
    pos = merged["pos"]
    u_axis = merged["u_axis"]
    v_axis = merged["v_axis"]
    rgb = merged["rgb"]
    alpha = np.clip(merged["alpha"], 0.01, 0.995)
    n = pos.shape[0]

    # Build orthonormal frame (u, v, n) -> rotation quaternion + log scales
    s0 = np.maximum(np.linalg.norm(u_axis, axis=1), 1e-5)
    s1 = np.maximum(np.linalg.norm(v_axis, axis=1), 1e-5)
    s2 = np.minimum(s0, s1) * 0.12

    e0 = u_axis / s0[:, None]
    e1 = v_axis / s1[:, None]
    e2 = np.cross(e0, e1)
    e2 = e2 / np.maximum(np.linalg.norm(e2, axis=1, keepdims=True), 1e-6)
    e1 = np.cross(e2, e0)

    # Rotation matrix [e0, e1, e2] -> quaternion (w, x, y, z)
    r00, r10, r20 = e0[:, 0], e0[:, 1], e0[:, 2]
    r01, r11, r21 = e1[:, 0], e1[:, 1], e1[:, 2]
    r02, r12, r22 = e2[:, 0], e2[:, 1], e2[:, 2]
    tr = r00 + r11 + r22
    qw = np.sqrt(np.maximum(1.0 + tr, 1e-6)) * 0.5
    qx = (r21 - r12) / np.maximum(4.0 * qw, 1e-6)
    qy = (r02 - r20) / np.maximum(4.0 * qw, 1e-6)
    qz = (r10 - r01) / np.maximum(4.0 * qw, 1e-6)
    qnorm = np.sqrt(qw * qw + qx * qx + qy * qy + qz * qz)
    qw, qx, qy, qz = qw / qnorm, qx / qnorm, qy / qnorm, qz / qnorm

    c0 = 0.28209479177387814
    f_dc = (rgb - 0.5) / c0
    op_logit = np.log(alpha / (1.0 - alpha))

    header = (
        "ply\n"
        "format binary_little_endian 1.0\n"
        f"element vertex {n}\n"
        "property float x\nproperty float y\nproperty float z\n"
        "property float f_dc_0\nproperty float f_dc_1\nproperty float f_dc_2\n"
        "property float opacity\n"
        "property float scale_0\nproperty float scale_1\nproperty float scale_2\n"
        "property float rot_0\nproperty float rot_1\nproperty float rot_2\nproperty float rot_3\n"
        "end_header\n"
    ).encode("ascii")

    out = np.empty((n, 14), dtype="<f4")
    out[:, 0:3] = pos
    out[:, 3:6] = f_dc
    out[:, 6] = op_logit
    out[:, 7] = np.log(s0)
    out[:, 8] = np.log(s1)
    out[:, 9] = np.log(s2)
    out[:, 10] = qw
    out[:, 11] = qx
    out[:, 12] = qy
    out[:, 13] = qz

    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "wb") as f:
        f.write(header)
        f.write(out.tobytes())


def main() -> None:
    ap = argparse.ArgumentParser(description="Bake InfiniSplat surface-aligned 3DGS for WebGL2")
    ap.add_argument("--photo", required=True, type=Path)
    ap.add_argument("--depth", required=True, type=Path)
    ap.add_argument("--bg", required=True, type=Path)
    ap.add_argument("--mask", type=Path, default=None, help="Optional explicit foreground matte (0..255)")
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--out-ply", type=Path, default=None)
    ap.add_argument("--out-debug-dir", type=Path, default=None)
    ap.add_argument("--gzip", action="store_true", help="Also emit <out>.gz compressed binary")
    ap.add_argument("--width", type=int, default=960)
    ap.add_argument("--height", type=int, default=540)
    ap.add_argument("--fov", type=float, default=38.0, help="Vertical FOV in degrees (50mm ~ 38 deg)")
    ap.add_argument("--depth-near", type=float, default=1.12, help="Subject closest depth in meters")
    ap.add_argument("--depth-far", type=float, default=5.40, help="Far park canopy depth in meters")
    ap.add_argument("--depth-split", type=float, default=0.52, help="Closeness threshold separating subject & park")
    ap.add_argument("--subject-splats", type=int, default=54000)
    ap.add_argument("--bg-splats", type=int, default=32000)
    ap.add_argument("--atmo-splats", type=int, default=140)
    ap.add_argument("--rim-wrap", type=float, default=0.11, help="Subtle volumetric silhouette depth wrap (meters)")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    rng = np.random.default_rng(args.seed)
    w, h = args.width, args.height
    aspect = w / float(h)

    photo = load_rgb(args.photo, w, h)
    bg = load_rgb(args.bg, w, h)
    depth_raw = load_gray(args.depth, w, h)

    # Normalize depth robustly to [0, 1] closeness (1 = nearest nose/shoulders, 0 = far park canopy)
    p2, p98 = np.percentile(depth_raw, [2, 98])
    depth_norm = np.clip((depth_raw - p2) / max(p98 - p2, 1e-4), 0.0, 1.0)

    # RGB-guided joint-bilateral depth lock
    depth_locked = joint_bilateral_depth(depth_norm, photo, radius=4, sigma_space=2.8, sigma_color=0.075)

    # Dual-cue foreground matte (depth + RGB difference from clean park background plate)
    if args.mask is not None and args.mask.exists():
        fg_alpha = load_gray(args.mask, w, h)
    else:
        depth_fg = smoothstep(args.depth_split - 0.055, args.depth_split + 0.055, depth_locked)
        color_diff = np.linalg.norm(photo - bg, axis=2)
        color_fg = smoothstep(0.055, 0.16, box_blur(color_diff, 1))
        # Trust depth interior strongly; use color diff to snap hair/ear/shoulder silhouette cleanly
        core = smoothstep(args.depth_split + 0.06, args.depth_split + 0.14, depth_locked)
        band = smoothstep(args.depth_split - 0.12, args.depth_split + 0.06, depth_locked)
        fg_alpha = np.clip(np.maximum(core, band * (0.45 * depth_fg + 0.55 * color_fg)), 0.0, 1.0)
        fg_alpha = smoothstep(0.22, 0.78, box_blur(fg_alpha, 1))

    fg_bool = fg_alpha > 0.35

    # Convert closeness [0, 1] -> metric depth z (hyperbolic / inverse-depth mapping matches camera geometry)
    inv_near = 1.0 / args.depth_near
    inv_far = 1.0 / args.depth_far

    # Subject depth: preserve crisp facial relief (nose/brow/cheeks/shoulders) + gentle anatomical rim wrap
    # Normalize subject closeness cleanly inside foreground so portrait depth spans realistic 0.45m volume
    fg_depths = depth_locked[fg_bool]
    if fg_depths.size > 100:
        fg_lo, fg_hi = np.percentile(fg_depths, [6, 98])
    else:
        fg_lo, fg_hi = args.depth_split, 1.0
    subj_rel = np.clip((depth_locked - fg_lo) / max(fg_hi - fg_lo, 0.12), 0.0, 1.0)
    # Closest tip of nose/collar ~ depth_near (1.12m); ears/hair back/shoulders ~ depth_near + 0.44m
    z_subject = args.depth_near + (1.0 - subj_rel) * 0.42
    # Gentle volumetric inward wrap near silhouette rim (makes ±25° orbit feel genuinely 3D!)
    inward_d = compute_inward_distance(fg_bool, max_steps=28)
    rim_curve = 1.0 - smoothstep(0.0, 26.0, inward_d)
    z_subject = z_subject + args.rim_wrap * (rim_curve * rim_curve)

    # Background continuous park depth (inpainted right behind subject silhouette!)
    bg_close_raw = inpaint_background_depth(depth_locked, fg_alpha)
    # Map background closeness smoothly into [depth_near + 1.15m .. depth_far]
    bg_valid_vals = bg_close_raw[fg_alpha < 0.2]
    if bg_valid_vals.size > 100:
        bg_lo, bg_hi = np.percentile(bg_valid_vals, [4, 96])
    else:
        bg_lo, bg_hi = 0.0, args.depth_split
    bg_rel = np.clip((bg_close_raw - bg_lo) / max(bg_hi - bg_lo, 0.15), 0.0, 1.0)
    inv_bg_near = 1.0 / (args.depth_near + 1.15)
    z_bg = 1.0 / (inv_far + bg_rel * (inv_bg_near - inv_far))

    # Camera intrinsics
    fov_rad = math.radians(args.fov)
    fy = (0.5 * h) / math.tan(0.5 * fov_rad)
    fx = fy
    cx = 0.5 * w
    cy = 0.5 * h

    # InfiniSplat v3 GSNorm: median per-pixel Gaussian spacing across the scene
    combined_z = np.where(fg_bool, z_subject, z_bg)
    gs_norm_scale = float(np.median(combined_z / fx))

    # Golden afternoon sun direction (upper-left-back rim light)
    sun_dir = np.array([-0.62, 0.58, -0.52], dtype=np.float32)
    sun_dir /= np.linalg.norm(sun_dir)

    # Subject 3D center (centroid of upper-mid subject = face focal pivot for camera orbiting!)
    ys_idx, xs_idx = np.where(fg_bool)
    if xs_idx.size > 0:
        # Bias slightly toward upper-center (face eyes/nose rather than torso bottom)
        y_min, y_max = ys_idx.min(), ys_idx.max()
        face_band = fg_bool & (np.arange(h)[:, None] >= y_min + 0.08 * (y_max - y_min)) & (
            np.arange(h)[:, None] <= y_min + 0.56 * (y_max - y_min)
        )
        fy_idx, fx_idx = np.where(face_band)
        if fx_idx.size > 20:
            pcx = float(np.median(fx_idx))
            pcy = float(np.median(fy_idx))
            pcz = float(np.median(z_subject[face_band]))
        else:
            pcx = float(np.median(xs_idx))
            pcy = float(np.median(ys_idx))
            pcz = float(np.median(z_subject[fg_bool]))
        subject_center = np.array(
            [(pcx - cx) * pcz / fx, -(pcy - cy) * pcz / fy, -pcz], dtype=np.float32
        )
    else:
        subject_center = np.array([0.0, 0.0, -1.35], dtype=np.float32)

    # Sample Layer 1: Subject Surface-Aligned 3DGS (crisp, non-smudged facial & hair acuity!)
    subj_layer = sample_surface_aligned_layer(
        rgb=photo,
        z_map=z_subject,
        alpha_map=np.where(fg_bool, np.clip(fg_alpha * 1.06, 0.0, 0.995), 0.0),
        valid_mask=fg_bool,
        target_count=args.subject_splats,
        fx=fx,
        fy=fy,
        cx=cx,
        cy=cy,
        layer_id=1,
        overlap_k=1.08,
        detail_boost=22.0,
        slope_boost=1.0,
        sun_dir=sun_dir,
        rng=rng,
        min_scale_mult=0.58,
        max_scale_mult=1.95,
        allow_oblique_fill=True,
    )

    # Sample Layer 0: Full-Coverage Disoccluded Park Background 3DGS
    bg_valid_all = np.ones((h, w), dtype=bool)
    bg_alpha_all = np.full((h, w), 0.97, dtype=np.float32)
    bg_layer = sample_surface_aligned_layer(
        rgb=bg,
        z_map=z_bg,
        alpha_map=bg_alpha_all,
        valid_mask=bg_valid_all,
        target_count=args.bg_splats,
        fx=fx,
        fy=fy,
        cx=cx,
        cy=cy,
        layer_id=0,
        overlap_k=1.52,
        detail_boost=2.4,
        slope_boost=0.4,
        sun_dir=sun_dir,
        rng=rng,
        min_scale_mult=1.0,
        max_scale_mult=3.6,
        allow_oblique_fill=False,
    )

    # Sample Layer 2: Subtle Atmospheric Sunlit Bokeh
    atmo_layer = make_atmospheric_bokeh_layer(
        subject_center=subject_center,
        fov_rad=fov_rad,
        aspect=aspect,
        count=args.atmo_splats,
        rng=rng,
    )

    merged: dict[str, np.ndarray] = {}
    for key in ["pos", "u_axis", "v_axis", "rgb", "alpha", "layer", "rim", "z"]:
        merged[key] = np.concatenate([bg_layer[key], subj_layer[key], atmo_layer[key]], axis=0)

    payload = pack_isplat_binary(
        merged=merged,
        fov_deg=args.fov,
        aspect=aspect,
        gs_norm_scale=gs_norm_scale,
        subject_center=subject_center,
        z_near=args.depth_near,
        z_far=args.depth_far,
    )

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_bytes(payload)
    gz_size = None
    if args.gzip:
        gz_path = Path(str(args.out) + ".gz")
        gz_bytes = gzip.compress(payload, compresslevel=9)
        gz_path.write_bytes(gz_bytes)
        gz_size = len(gz_bytes)

    if args.out_ply is not None:
        export_standard_ply(merged, args.out_ply)

    if args.out_debug_dir is not None:
        args.out_debug_dir.mkdir(parents=True, exist_ok=True)
        Image.fromarray((np.clip(fg_alpha, 0, 1) * 255).astype(np.uint8)).save(args.out_debug_dir / "debug_matte.png")
        Image.fromarray((np.clip(depth_locked, 0, 1) * 255).astype(np.uint8)).save(args.out_debug_dir / "debug_depth_locked.png")
        bg_z_vis = np.clip((args.depth_far - z_bg) / max(args.depth_far - args.depth_near, 1e-3), 0, 1)
        Image.fromarray((bg_z_vis * 255).astype(np.uint8)).save(args.out_debug_dir / "debug_bg_depth.png")

    summary = {
        "total_splats": int(merged["pos"].shape[0]),
        "subject_splats": int(subj_layer["pos"].shape[0]),
        "bg_splats": int(bg_layer["pos"].shape[0]),
        "atmo_splats": int(atmo_layer["pos"].shape[0]),
        "gs_norm_scale": round(gs_norm_scale, 6),
        "subject_center": [round(float(v), 4) for v in subject_center],
        "fg_coverage_pct": round(float(fg_bool.mean() * 100.0), 2),
        "raw_bytes": len(payload),
        "gzip_bytes": gz_size,
        "out": str(args.out),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
