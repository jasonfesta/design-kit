#!/usr/bin/env python3
"""Cuts one PNG per region from a UI screenshot, and pairs prototype crops.

Supports both PIL (Pillow) and PyCairo/ImageMagick so it runs natively inside
the standard sandbox without external pip packages.

Usage:
  python3 crop_regions.py --image=<target.png> --regions_json=regions.json --out_dir=/tmp/ref_crops
  python3 crop_regions.py --image=<capture.png> --regions_json=regions.json --out_dir=/tmp/proto_crops --pair_with=/tmp/ref_crops
"""

import argparse
import collections
import json
import os
import pathlib
import subprocess
import sys
from typing import Any

import cairo  # type: ignore

Rgb = tuple[int, int, int]
_INK_THRESHOLD = 24


def load_surface(path: pathlib.Path) -> cairo.ImageSurface:
  return cairo.ImageSurface.create_from_png(str(path))


def crop_surface(
    surf: cairo.ImageSurface, left: int, top: int, right: int, bottom: int
) -> cairo.ImageSurface:
  w, h = right - left, bottom - top
  out = cairo.ImageSurface(cairo.FORMAT_ARGB32, w, h)
  ctx = cairo.Context(out)
  ctx.set_source_surface(surf, -left, -top)
  ctx.paint()
  return out


def surface_pixels(surf: cairo.ImageSurface) -> list[Rgb]:
  w, h = surf.get_width(), surf.get_height()
  stride = surf.get_stride()
  buf = surf.get_data()
  out: list[Rgb] = []
  for y in range(h):
    off = y * stride
    for x in range(w):
      p = off + x * 4
      out.append((buf[p + 2], buf[p + 1], buf[p]))
  return out


def ink_box(surf: cairo.ImageSurface, bg: Rgb) -> tuple[int, int, int, int] | None:
  w, h = surf.get_width(), surf.get_height()
  px = surface_pixels(surf)
  x0, y0, x1, y1 = w, h, -1, -1
  for idx, (r, g, b) in enumerate(px):
    d = max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))
    if d > _INK_THRESHOLD:
      x = idx % w
      y = idx // w
      if x < x0:
        x0 = x
      if y < y0:
        y0 = y
      if x + 1 > x1:
        x1 = x + 1
      if y + 1 > y1:
        y1 = y + 1
  return (x0, y0, x1, y1) if x1 >= 0 else None


def compare_numbers(
    ref_surf: cairo.ImageSurface, proto_surf: cairo.ImageSurface
) -> dict[str, Any]:
  ref_px = surface_pixels(ref_surf)
  proto_px = surface_pixels(proto_surf)
  ref_bg = collections.Counter(ref_px).most_common(1)[0][0]
  proto_bg = collections.Counter(proto_px).most_common(1)[0][0]
  bg_diff = max(abs(a - b) for a, b in zip(ref_bg, proto_bg))
  r_ink = ink_box(ref_surf, ref_bg)
  p_ink = ink_box(proto_surf, proto_bg)
  res: dict[str, Any] = {
      'dx': None,
      'dy': None,
      'dw': None,
      'dh': None,
      'dw_pct': None,
      'dh_pct': None,
      'bg_diff': bg_diff,
  }
  if r_ink and p_ink:
    rw, rh = r_ink[2] - r_ink[0], r_ink[3] - r_ink[1]
    pw, ph = p_ink[2] - p_ink[0], p_ink[3] - p_ink[1]
    dx = p_ink[0] - r_ink[0]
    dy = p_ink[1] - r_ink[1]
    dw = pw - rw
    dh = ph - rh
    res.update(
        dx=dx,
        dy=dy,
        dw=dw,
        dh=dh,
        dw_pct=round(dw / max(rw, 1) * 100, 1),
        dh_pct=round(dh / max(rh, 1) * 100, 1),
    )
  return res


def make_compare_sheet(
    ref_path: pathlib.Path, proto_path: pathlib.Path, out_path: pathlib.Path
) -> None:
  ref = load_surface(ref_path)
  proto = load_surface(proto_path)
  w1, h1 = ref.get_width(), ref.get_height()
  w2, h2 = proto.get_width(), proto.get_height()
  gap = 8
  if w1 <= 2 * h1:
    out = cairo.ImageSurface(
        cairo.FORMAT_ARGB32, w1 + w2 + gap * 3, max(h1, h2) + gap * 2
    )
    ctx = cairo.Context(out)
    ctx.set_source_rgb(0.82, 0.82, 0.82)
    ctx.paint()
    ctx.set_source_surface(ref, gap, gap)
    ctx.paint()
    ctx.set_source_surface(proto, w1 + gap * 2, gap)
    ctx.paint()
  else:
    out = cairo.ImageSurface(
        cairo.FORMAT_ARGB32, max(w1, w2) + gap * 2, h1 + h2 + gap * 3
    )
    ctx = cairo.Context(out)
    ctx.set_source_rgb(0.82, 0.82, 0.82)
    ctx.paint()
    ctx.set_source_surface(ref, gap, gap)
    ctx.paint()
    ctx.set_source_surface(proto, gap, h1 + gap * 2)
    ctx.paint()
  out.write_to_png(str(out_path))


def main(argv: list[str]) -> int:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument('--image', required=True)
  parser.add_argument('--regions_json', required=True)
  parser.add_argument('--out_dir', required=True)
  parser.add_argument('--pair_with')
  args = parser.parse_args(argv)

  img_path = pathlib.Path(os.path.expanduser(args.image))
  out_dir = pathlib.Path(os.path.expanduser(args.out_dir))
  out_dir.mkdir(parents=True, exist_ok=True)
  pair_dir = pathlib.Path(os.path.expanduser(args.pair_with)) if args.pair_with else None

  surf = load_surface(img_path)
  w, h = surf.get_width(), surf.get_height()
  raw_regions = json.loads(pathlib.Path(os.path.expanduser(args.regions_json)).read_text())

  boxes: dict[str, list[int]] = {}
  if isinstance(raw_regions, list):
    for item in raw_regions:
      name = str(item['id'])
      ymin, xmin, ymax, xmax = item['box']
      boxes[name] = [
          int(round(xmin * w / 1000)),
          int(round(ymin * h / 1000)),
          int(round(xmax * w / 1000)),
          int(round(ymax * h / 1000)),
      ]
  elif isinstance(raw_regions, dict):
    for name, box in raw_regions.items():
      if not str(name).startswith('_'):
        boxes[str(name)] = [int(round(v)) for v in box]

  written: dict[str, list[int]] = {}
  numbers_all: dict[str, Any] = {}
  for name, (l, t, r, b) in boxes.items():
    l, t = max(0, l), max(0, t)
    r, b = min(w, r), min(h, b)
    cropped = crop_surface(surf, l, t, r, b)
    out_png = out_dir / f'{name}.png'
    cropped.write_to_png(str(out_png))
    written[name] = [l, t, r, b]
    if pair_dir and (pair_dir / f'{name}.png').exists():
      ref_surf = load_surface(pair_dir / f'{name}.png')
      nums = compare_numbers(ref_surf, cropped)
      numbers_all[name] = nums
      make_compare_sheet(
          pair_dir / f'{name}.png', out_png, out_dir / f'{name}_compare.png'
      )
      print(
          f'  {name}: {r - l}x{b - t} at ({l},{t}); '
          f'dx={nums["dx"]} dy={nums["dy"]} dw={nums["dw"]} ({nums["dw_pct"]}%) '
          f'dh={nums["dh"]} ({nums["dh_pct"]}%) bg_diff={nums["bg_diff"]}'
      )
    else:
      print(f'  {name}: {r - l}x{b - t} at ({l},{t})')

  (out_dir / 'regions_px.json').write_text(
      json.dumps({'_image_size': [w, h], '_numbers': numbers_all, **written}, indent=2) + '\n'
  )
  return 0


if __name__ == '__main__':
  sys.exit(main(sys.argv[1:]))
