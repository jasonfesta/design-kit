#!/usr/bin/env python3
"""
Stage 2: Reusable PBR Texture Map & Alpha-Cutout Extractor for photo-to-3d-environment.

Extracts seamless de-lit PBR Albedo + packed Tangent-Space Normal/Roughness (NR:
R=Nx, G=Ny, B=Roughness, reconstructing Nz in-shader) from surface texture sheets,
plus defringed RGBA botanical/prop alpha cutouts from white-background studio images.

Usage:
  # Auto-discover *_albedo.* and *_sprig.* / *_cutout.* files in a directory:
  python3 extract_pbr_maps.py --input-dir ./textures --output-json ./pbr_bundle.json

  # Or pass an explicit JSON manifest + optional reference photo:
  python3 extract_pbr_maps.py --config ./manifest.json --ref-photo ./ref.jpg --output-json ./pbr_bundle.json
"""
import argparse
import base64
import io
import json
import os
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}

DEFAULT_MATERIAL_SPECS = {
    "travertine": {"size": 512, "strength": 3.2, "base_rough": 0.84, "rough_span": 0.26},
    "flagstone":  {"size": 512, "strength": 3.8, "base_rough": 0.82, "rough_span": 0.30},
    "terracotta": {"size": 384, "strength": 2.2, "base_rough": 0.58, "rough_span": 0.22},
    "wood":       {"size": 384, "strength": 2.8, "base_rough": 0.78, "rough_span": 0.24},
}


def make_seamless(arr: np.ndarray, border: int = 48) -> np.ndarray:
    """Half-shift smoothstep cross-fade so edges tile invisibly in 3D."""
    h, w, _ = arr.shape
    border = max(8, min(border, min(h, w) // 4))
    shifted = np.roll(np.roll(arr, h // 2, axis=0), w // 2, axis=1)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = np.minimum(xx, w - 1 - xx) / float(border)
    dy = np.minimum(yy, h - 1 - yy) / float(border)
    mask = np.clip(np.minimum(dx, dy), 0.0, 1.0)
    mask = mask * mask * (3.0 - 2.0 * mask)
    return arr * mask[..., None] + shifted * (1.0 - mask[..., None])


def extract_normal_and_rough(
    albedo_rgb: np.ndarray,
    strength: float = 2.8,
    base_rough: float = 0.80,
    rough_span: float = 0.28,
):
    """Derive multi-scale tangent-space normal (R=Nx, G=Ny) + cavity roughness (B)."""
    luma = 0.299 * albedo_rgb[..., 0] + 0.587 * albedo_rgb[..., 1] + 0.114 * albedo_rgb[..., 2]
    img_l = Image.fromarray((np.clip(luma, 0, 1) * 255).astype(np.uint8), mode="L")
    blur_med = np.asarray(img_l.filter(ImageFilter.GaussianBlur(radius=3)), dtype=np.float32) / 255.0
    blur_wide = np.asarray(img_l.filter(ImageFilter.GaussianBlur(radius=10)), dtype=np.float32) / 255.0

    height = luma * 0.55 + blur_med * 0.30 + blur_wide * 0.15
    gx = (np.roll(height, -1, axis=1) - np.roll(height, 1, axis=1)) * 0.5 * strength
    gy = (np.roll(height, -1, axis=0) - np.roll(height, 1, axis=0)) * 0.5 * strength

    nx, ny, nz = -gx, -gy, np.ones_like(gx)
    nlen = np.sqrt(nx * nx + ny * ny + nz * nz) + 1e-6
    nx /= nlen
    ny /= nlen

    cavity = np.clip((blur_wide - luma) * 3.5, 0.0, 1.0)
    rough = np.clip(base_rough + (cavity - 0.35) * rough_span, 0.15, 0.98)
    packed_nr = np.dstack([nx * 0.5 + 0.5, ny * 0.5 + 0.5, rough])
    return packed_nr


def extract_cutout_alpha(img: Image.Image, size: int = 512) -> Image.Image:
    """Extract a defringed RGBA alpha-cutout atlas from a white-background photo."""
    img = img.convert("RGB").resize((size, size), Image.Resampling.LANCZOS)
    arr = np.asarray(img, dtype=np.float32) / 255.0
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

    min_c = np.minimum(r, np.minimum(g, b))
    sat = np.maximum(r, np.maximum(g, b)) - min_c
    dist_white = np.sqrt((1.0 - r) ** 2 + (1.0 - g) ** 2 + (1.0 - b) ** 2)

    alpha = np.clip((dist_white - 0.12) * 5.5 + sat * 2.2, 0.0, 1.0)
    alpha = np.where((min_c > 0.88) & (sat < 0.06), 0.0, alpha)

    fg_mask = alpha > 0.65
    mean_fg = arr[fg_mask].mean(axis=0) if np.any(fg_mask) else np.array([0.34, 0.42, 0.26], dtype=np.float32)
    defringed = np.where(
        (alpha > 0.02)[..., None] & (alpha < 0.75)[..., None],
        arr * 0.55 + mean_fg * 0.45,
        arr,
    )
    rgba = np.dstack([
        (np.clip(defringed, 0, 1) * 255).astype(np.uint8),
        (np.clip(alpha, 0, 1) * 255).astype(np.uint8),
    ])
    return Image.fromarray(rgba, mode="RGBA")


def encode_jpg(arr: np.ndarray, quality: int = 85) -> str:
    img = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), mode="RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def encode_png(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def encode_ref_photo(path: Path, max_w: int = 1280, quality: int = 86) -> str:
    img = Image.open(path).convert("RGB")
    w, h = img.size
    if w > max_w:
        img = img.resize((max_w, int(round(h * max_w / w))), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def discover_inputs(input_dir: Path):
    """Auto-discover *_albedo.* surface sheets and *_sprig.* / *_cutout.* cutouts."""
    surfaces = {}
    cutouts = {}
    for p in sorted(input_dir.iterdir()):
        if not p.is_file() or p.suffix.lower() not in IMAGE_EXTS:
            continue
        stem = p.stem.lower()
        if stem.endswith("_sprig") or stem.endswith("_cutout") or stem.endswith("_alpha"):
            key = stem.rsplit("_", 1)[0]
            cutouts[key] = str(p)
        elif stem.endswith("_albedo") or stem.endswith("_alb"):
            key = stem.rsplit("_", 1)[0]
            surfaces[key] = str(p)
    return surfaces, cutouts


def parse_args():
    ap = argparse.ArgumentParser(description="Extract packed PBR maps & defringed cutouts into a JSON data-URI bundle.")
    ap.add_argument("--input-dir", type=Path, help="Directory containing *_albedo.* and *_sprig.* / *_cutout.* images")
    ap.add_argument("--config", type=Path, help="Optional JSON manifest mapping material keys to file paths or spec dicts")
    ap.add_argument("--ref-photo", type=Path, help="Optional reference photograph to embed as ref_photo")
    ap.add_argument("--output-json", type=Path, required=True, help="Output JSON bundle path")
    ap.add_argument("--preview-dir", type=Path, help="Optional directory to save RGBA cutout preview PNGs")
    ap.add_argument("--default-size", type=int, default=512, help="Default square resolution for surface maps")
    ap.add_argument("--cutout-size", type=int, default=512, help="Square resolution for alpha cutouts")
    return ap.parse_args()


def main():
    args = parse_args()
    surfaces = {}
    cutouts = {}

    if args.input_dir:
        s_auto, c_auto = discover_inputs(args.input_dir)
        surfaces.update(s_auto)
        cutouts.update(c_auto)

    if args.config:
        cfg = json.loads(args.config.read_text(encoding="utf-8"))
        for k, v in cfg.items():
            if isinstance(v, dict):
                if v.get("cutout"):
                    cutouts[k] = v["path"]
                else:
                    surfaces[k] = v
            elif k in ("olive", "foliage", "botanical") or str(k).endswith("_cutout"):
                cutouts[k.replace("_cutout", "")] = v
            else:
                surfaces[k] = v

    if not surfaces and not cutouts:
        print("Error: no input textures found. Pass --input-dir or --config.", file=sys.stderr)
        sys.exit(1)

    bundle = {}
    if args.ref_photo:
        bundle["ref_photo"] = encode_ref_photo(args.ref_photo)
        print(f"Embedded ref_photo: {len(bundle['ref_photo']) // 1024} KB")

    for key, entry in surfaces.items():
        spec = dict(DEFAULT_MATERIAL_SPECS.get(key, {}))
        if isinstance(entry, dict):
            path = entry["path"]
            spec.update(entry)
        else:
            path = entry
        sz = int(spec.get("size", args.default_size))
        n_str = float(spec.get("strength", 2.8))
        b_rough = float(spec.get("base_rough", 0.80))
        r_span = float(spec.get("rough_span", 0.28))

        img = Image.open(path).convert("RGB").resize((sz, sz), Image.Resampling.LANCZOS)
        arr = np.asarray(img, dtype=np.float32) / 255.0
        arr = make_seamless(arr, border=max(24, sz // 10))
        packed_nr = extract_normal_and_rough(arr, strength=n_str, base_rough=b_rough, rough_span=r_span)

        bundle[f"{key}_alb"] = encode_jpg(arr, quality=85)
        bundle[f"{key}_nr"] = encode_jpg(packed_nr, quality=88)
        print(f"Processed surface '{key}' ({sz}px): alb={len(bundle[key+'_alb'])//1024}KB, nr={len(bundle[key+'_nr'])//1024}KB")

    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)

    for key, path in cutouts.items():
        cutout_rgba = extract_cutout_alpha(Image.open(path), size=args.cutout_size)
        if args.preview_dir:
            cutout_rgba.save(args.preview_dir / f"{key}-cutout-preview.png")
        bundle[f"{key}_rgba"] = encode_png(cutout_rgba)
        print(f"Processed cutout '{key}_rgba' ({args.cutout_size}px): {len(bundle[key+'_rgba'])//1024}KB")

    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(bundle), encoding="utf-8")
    print(f"Saved PBR bundle -> {args.output_json} ({len(bundle)} entries)")


if __name__ == "__main__":
    main()
