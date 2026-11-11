#!/usr/bin/env python3
"""Measures screenshot pixels: ink runs and pitch on a line, colors in a box.

Supports both PIL (Pillow) and PyCairo (cairo.ImageSurface) so it runs natively
inside the standard sandbox without external pip dependencies.

Usage:
  python3 measure_px.py --image=ref.png --col=300 --span=100:500 --threshold=8
  python3 measure_px.py --image=ref.png --row=25 --span=0:1000 --threshold=16
  python3 measure_px.py --image=ref.png --box=0,548,1000,812 --threshold=20
"""

import argparse
import collections
from collections.abc import Sequence
import os
import sys

Rgb = tuple[int, int, int]
EDGE_PX = 3


class SimpleRgbImage:
  """Minimal RGB image wrapper supporting PIL or PyCairo."""

  def __init__(self, width: int, height: int, rgb_rows: list[list[Rgb]]):
    self.width = width
    self.height = height
    self._rows = rgb_rows

  @classmethod
  def open(cls, path: str) -> 'SimpleRgbImage':
    try:
      from PIL import Image  # type: ignore
      with Image.open(path) as im:
        rgb = im.convert('RGB')
        w, h = rgb.size
        raw = rgb.tobytes()
        pixels = list(zip(raw[0::3], raw[1::3], raw[2::3]))
        rows = [pixels[y * w : (y + 1) * w] for y in range(h)]
        return cls(w, h, rows)
    except ImportError:
      import cairo  # type: ignore
      surf = cairo.ImageSurface.create_from_png(path)
      w, h = surf.get_width(), surf.get_height()
      stride = surf.get_stride()
      buf = surf.get_data()
      rows: list[list[Rgb]] = []
      for y in range(h):
        row: list[Rgb] = []
        off = y * stride
        for x in range(w):
          p = off + x * 4
          b, g, r = buf[p], buf[p + 1], buf[p + 2]
          row.append((r, g, b))
        rows.append(row)
      return cls(w, h, rows)

  def pixels(self, box: tuple[int, int, int, int]) -> list[Rgb]:
    left, top, right, bottom = box
    if not (0 <= left < right <= self.width and 0 <= top < bottom <= self.height):
      raise ValueError(f'box {box} is outside the {self.width}x{self.height} image')
    out: list[Rgb] = []
    for y in range(top, bottom):
      out.extend(self._rows[y][left:right])
    return out


def to_hex(rgb: Rgb) -> str:
  return '#{:02x}{:02x}{:02x}'.format(*rgb)


def parse_color(value: str) -> Rgb:
  r, g, b = bytes.fromhex(value.lstrip('#'))
  return r, g, b


def _diff(a: Rgb, b: Rgb) -> int:
  return max(abs(a[0] - b[0]), abs(a[1] - b[1]), abs(a[2] - b[2]))


def ink_levels(line: Sequence[Rgb], bg: Rgb) -> list[int]:
  return [_diff(p, bg) for p in line]


def edge_levels(ink: Sequence[int], start: int, end: int) -> tuple[int, int]:
  if end - start < EDGE_PX:
    full = max(ink[start:end])
    return full, full
  return (
      sorted(ink[start : start + EDGE_PX])[EDGE_PX // 2],
      sorted(ink[end - EDGE_PX : end])[EDGE_PX // 2],
  )


def _coverage(ink: Sequence[int], i: int, full: int) -> float:
  return min(1.0, ink[i] / max(full, 1)) if 0 <= i < len(ink) else 0.0


def subpixel_edges(
    ink: Sequence[int], start: int, end: int
) -> tuple[float, float]:
  left_full, right_full = edge_levels(ink, start, end)
  left = start + 1 - _coverage(ink, start - 1, left_full)
  left -= _coverage(ink, start, left_full)
  right = end - 1 + _coverage(ink, end - 1, right_full)
  right += _coverage(ink, end, right_full)
  return left, right


def ink_runs(
    line: Sequence[Rgb], bg: Rgb, threshold: int
) -> list[tuple[int, int, float, float]]:
  ink = ink_levels(line, bg)
  runs, begin = [], None
  for i, d in enumerate(ink + [0]):
    if d > threshold and begin is None:
      begin = i
    elif d <= threshold and begin is not None:
      left, right = subpixel_edges(ink, begin, i)
      runs.append((begin, i, left, right))
      begin = None
  return runs


def scan(img: SimpleRgbImage, args: argparse.Namespace) -> None:
  on_row = args.row is not None
  fixed, limit = (args.row, img.width) if on_row else (args.col, img.height)
  lo, hi = [int(v) for v in args.span.split(':')] if args.span else [0, limit]
  box = (lo, fixed, hi, fixed + 1) if on_row else (fixed, lo, fixed + 1, hi)
  line = img.pixels(box)
  bg = args.bg or collections.Counter(line).most_common(1)[0][0]
  runs = ink_runs(line, bg, args.threshold)
  print(
      f'{"row" if on_row else "col"} {fixed} {lo}..{hi}: {len(runs)} ink '
      f'runs on {to_hex(bg)} (threshold {args.threshold})'
  )
  for start, end, left, right in runs:
    print(
        f'  {lo + start}..{lo + end} len {end - start} edges '
        f'{lo + left:.1f}..{lo + right:.1f} darkest '
        f'{to_hex(min(line[start:end], key=sum))}'
    )
  starts = [run[0] for run in runs]
  for label, values in (
      ('gaps', [b[0] - a[1] for a, b in zip(runs, runs[1:])]),
      ('pitch', [b - a for a, b in zip(starts, starts[1:])]),
  ):
    mode = collections.Counter(values).most_common(1)[0][0] if values else '-'
    print(f'{label}: {values} (mode {mode})')
  edge_gaps = [round(b[2] - a[3], 1) for a, b in zip(runs, runs[1:])]
  print(f'edge gaps: {edge_gaps} (sub-pixel, left edge - previous right edge)')
  if runs:
    outer_left, outer_right = runs[0][2], runs[-1][3]
    print(
        f'outer: {lo + outer_left:.1f}..{lo + outer_right:.1f} width '
        f'{outer_right - outer_left:.1f} (first ink edge to last ink edge)'
    )


def colors_in_box(img: SimpleRgbImage, args: argparse.Namespace) -> None:
  left, top, right, bottom = [int(v) for v in args.box.split(',')]
  flat = img.pixels((left, top, right, bottom))
  counts = collections.Counter(flat)
  bg = args.bg or counts.most_common(1)[0][0]
  shares = ', '.join(
      f'{to_hex(c)} {n * 100 / len(flat):.1f}%'
      for c, n in counts.most_common(5)
  )
  darkest = to_hex(min(counts, key=sum))
  print(f'box {left},{top},{right},{bottom}: {shares}; darkest {darkest}')
  w = right - left
  h = bottom - top
  x0, y0, x1, y1 = w, h, -1, -1
  for idx, p in enumerate(flat):
    if _diff(p, bg) > args.threshold:
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
  if x1 < 0:
    print(f'no ink above threshold {args.threshold} on {to_hex(bg)}')
    return
  ax0, ay0, ax1, ay1 = x0 + left, y0 + top, x1 + left, y1 + top
  print(f'ink on {to_hex(bg)}: {ax0},{ay0},{ax1},{ay1} ({ax1 - ax0}x{ay1 - ay0})')


def main(argv: list[str]) -> int:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument('--image', required=True, help='PNG to measure.')
  mode = parser.add_mutually_exclusive_group(required=True)
  mode.add_argument('--row', type=int, help='Scan this row (y).')
  mode.add_argument('--col', type=int, help='Scan this column (x).')
  mode.add_argument('--box', help='L,T,R,B box: colors and ink bounds.')
  parser.add_argument('--span', help='A:B range along the row or column.')
  parser.add_argument('--threshold', type=int, default=24, help='0-255.')
  parser.add_argument('--bg', type=parse_color, help='Background #rrggbb.')
  args = parser.parse_args(argv)
  try:
    img = SimpleRgbImage.open(os.path.expanduser(args.image))
    print(f'image {img.width}x{img.height}')
    (colors_in_box if args.box else scan)(img, args)
  except Exception as e:  # pylint: disable=broad-except
    print(f'ERROR: {e}', file=sys.stderr)
    return 2
  return 0


if __name__ == '__main__':
  sys.exit(main(sys.argv[1:]))
