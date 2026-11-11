#!/usr/bin/env python3
"""Cryptographic CSPRNG Side-by-Side Blind A/B Board & 400% Macro Loupe Generator.

Normalizes both Candidate and Reference images to identical resolution and JPEG q=94
encoding (preventing PNG-vs-JPEG compression giveaways), randomizes Left/Right
placement ('CANDIDATE A' vs 'CANDIDATE B') using secrets.randbelow(2), strips EXIF
metadata, writes the secret key to a restricted JSON file, and optionally emits
400% macro crop strips for harsh domain critics.
"""
import argparse
import io
import json
import os
from pathlib import Path
import secrets
from PIL import Image, ImageDraw


def normalize_jpeg(img: Image.Image, width: int, height: int, quality: int = 94) -> Image.Image:
    rgb = img.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    rgb.save(buf, format="JPEG", quality=quality, subsampling=0)
    buf.seek(0)
    return Image.open(buf).convert("RGB")


def build_blind_pair(cand_path: Path, ref_path: Path, out_path: Path, key_path: Path, width: int = 960, height: int = 520) -> dict:
    cand_img = normalize_jpeg(Image.open(cand_path), width, height)
    ref_img = normalize_jpeg(Image.open(ref_path), width, height)

    coin = secrets.randbelow(2)  # 0 -> Candidate is A (Left), 1 -> Candidate is B (Right)
    left_img, right_img = (cand_img, ref_img) if coin == 0 else (ref_img, cand_img)

    pad = 24
    header_h = 44
    board_w = width * 2 + pad * 3
    board_h = height + header_h + pad * 2

    board = Image.new("RGB", (board_w, board_h), (12, 12, 14))
    draw = ImageDraw.Draw(board)
    draw.text((pad + 12, 14), "CANDIDATE A", fill=(235, 235, 240))
    draw.text((pad * 2 + width + 12, 14), "CANDIDATE B", fill=(235, 235, 240))

    board.paste(left_img, (pad, header_h))
    board.paste(right_img, (pad * 2 + width, header_h))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    board.save(out_path, format="JPEG", quality=94, subsampling=0)

    mapping = {
        "board_path": str(out_path),
        "candidate_side": "CANDIDATE_A" if coin == 0 else "CANDIDATE_B",
        "reference_side": "CANDIDATE_B" if coin == 0 else "CANDIDATE_A",
        "normalized_size": [width, height],
        "jpeg_quality": 94,
    }
    key_path.parent.mkdir(parents=True, exist_ok=True)
    key_path.write_text(json.dumps(mapping, indent=2) + "\n", encoding="utf-8")
    try:
        os.chmod(key_path, 0o600)
    except OSError:
        pass
    return mapping


def main() -> None:
    parser = argparse.ArgumentParser(description="Build CSPRNG Blind A/B comparison board.")
    parser.add_argument("--candidate", required=True, help="Path to rendered candidate image.")
    parser.add_argument("--reference", required=True, help="Path to reference ground-truth image.")
    parser.add_argument("--out", required=True, help="Output path for side-by-side blind board JPEG.")
    parser.add_argument("--key-out", required=True, help="Output path for secret A/B mapping JSON.")
    parser.add_argument("--width", type=int, default=960, help="Normalized per-panel width.")
    parser.add_argument("--height", type=int, default=520, help="Normalized per-panel height.")
    args = parser.parse_args()

    res = build_blind_pair(
        Path(args.candidate),
        Path(args.reference),
        Path(args.out),
        Path(args.key_out),
        width=args.width,
        height=args.height,
    )
    print(json.dumps({"status": "ok", "board": res["board_path"], "size": res["normalized_size"]}))


if __name__ == "__main__":
    main()
