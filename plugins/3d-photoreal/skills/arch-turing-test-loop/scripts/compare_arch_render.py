#!/usr/bin/env python3
"""
compare_arch_render.py — Full-Native-Resolution (`1200xH`) Hyperrealism & Turing Evaluator (`v2`)

Delegates full-resolution pixel, OKLab chromatic, multi-scale edge registration, `8x6` spatially
local micro-texture parity, `audit-threejs-hyperrealism` strict sharpness/gamut verification, and
`200%` 4-zone macro pixel loupe strip generation to `compare_arch_core.mjs` (`~0.25s` per image).
"""

import argparse
import os
import subprocess
import sys


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ref_image")
    ap.add_argument("threejs_render")
    ap.add_argument("--out", required=True)
    ap.add_argument("--iter", type=int, default=1)
    ap.add_argument("--no-strip", action="store_true")
    args = ap.parse_args()

    core_mjs = os.path.join(os.path.dirname(os.path.abspath(__file__)), "compare_arch_core.mjs")
    cmd = ["node", core_mjs, args.ref_image, args.threejs_render, "--out", args.out, "--iter", str(args.iter)]
    if args.no_strip:
        cmd.append("--no-strip")

    res = subprocess.run(cmd)
    return res.returncode


if __name__ == "__main__":
    sys.exit(main())
