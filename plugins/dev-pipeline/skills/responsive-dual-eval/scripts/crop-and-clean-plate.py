#!/usr/bin/env python3
"""Sandbox-native photographic cropper & optional text-box harmonic inpainter.

Extracts bit-for-bit photographic regions from `desktop.png` / `mobile.png`
using PyCairo + ImageMagick (`/usr/bin/magick`) so photographs match the
reference artwork 1:1. Optionally smoothly inpaints specified `[x0,y0,x1,y1]`
overlaid-text boxes (in source image pixel coordinates) via multi-grid Laplace
boundary diffusion so live HTML/CSS vector typography never double-renders
over ghosted raster text.
"""

import argparse
import array
import base64
import pathlib
import subprocess
import tempfile
import cairo  # type: ignore


def parse_box(val: str) -> tuple[int, int, int, int]:
  parts = [int(x.strip()) for x in val.split(",")]
  if len(parts) != 4:
    raise ValueError(f"Expected x0,y0,x1,y1, got: {val}")
  return parts[0], parts[1], parts[2], parts[3]


def inpaint_box_bgra(buf: memoryview, stride: int, img_w: int, img_h: int,
                     bx0: int, by0: int, bx1: int, by1: int, iters: int = 85) -> None:
  x0 = max(1, min(img_w - 2, bx0))
  y0 = max(1, min(img_h - 2, by0))
  x1 = max(x0 + 1, min(img_w - 1, bx1))
  y1 = max(y0 + 1, min(img_h - 1, by1))
  bw = x1 - x0
  bh = y1 - y0
  gw = bw + 2
  gh = bh + 2

  b_grid = array.array("f", [0.0] * (gw * gh))
  g_grid = array.array("f", [0.0] * (gw * gh))
  r_grid = array.array("f", [0.0] * (gw * gh))

  for gy in range(gh):
    sy = y0 - 1 + gy
    off = sy * stride
    for gx in range(gw):
      if gx == 0 or gx == gw - 1 or gy == 0 or gy == gh - 1:
        sx = x0 - 1 + gx
        p = off + sx * 4
        idx = gy * gw + gx
        b_grid[idx] = float(buf[p])
        g_grid[idx] = float(buf[p + 1])
        r_grid[idx] = float(buf[p + 2])

  for gy in range(1, gh - 1):
    ty = gy / float(gh - 1)
    top_row = 0 * gw
    bot_row = (gh - 1) * gw
    row = gy * gw
    lb, lg, lr = b_grid[row], g_grid[row], r_grid[row]
    rb, rg, rr = b_grid[row + gw - 1], g_grid[row + gw - 1], r_grid[row + gw - 1]
    for gx in range(1, gw - 1):
      tx = gx / float(gw - 1)
      tb = (1.0 - ty) * b_grid[top_row + gx] + ty * b_grid[bot_row + gx]
      tg = (1.0 - ty) * g_grid[top_row + gx] + ty * g_grid[bot_row + gx]
      tr = (1.0 - ty) * r_grid[top_row + gx] + ty * r_grid[bot_row + gx]
      hb = (1.0 - tx) * lb + tx * rb
      hg = (1.0 - tx) * lg + tx * rg
      hr = (1.0 - tx) * lr + tx * rr
      wv = gw / float(gw + gh)
      wh = 1.0 - wv
      idx = row + gx
      b_grid[idx] = wv * tb + wh * hb
      g_grid[idx] = wv * tg + wh * hg
      r_grid[idx] = wv * tr + wh * hr

  for _ in range(iters):
    for gy in range(1, gh - 1):
      row = gy * gw
      up = (gy - 1) * gw
      dn = (gy + 1) * gw
      for gx in range(1, gw - 1):
        idx = row + gx
        b_grid[idx] = 0.25 * (b_grid[idx - 1] + b_grid[idx + 1] + b_grid[up + gx] + b_grid[dn + gx])
        g_grid[idx] = 0.25 * (g_grid[idx - 1] + g_grid[idx + 1] + g_grid[up + gx] + g_grid[dn + gx])
        r_grid[idx] = 0.25 * (r_grid[idx - 1] + r_grid[idx + 1] + r_grid[up + gx] + r_grid[dn + gx])

  for gy in range(1, gh - 1):
    sy = y0 - 1 + gy
    off = sy * stride
    row = gy * gw
    for gx in range(1, gw - 1):
      sx = x0 - 1 + gx
      p = off + sx * 4
      idx = row + gx
      buf[p] = max(0, min(255, int(round(b_grid[idx]))))
      buf[p + 1] = max(0, min(255, int(round(g_grid[idx]))))
      buf[p + 2] = max(0, min(255, int(round(r_grid[idx]))))
      buf[p + 3] = 255


def main() -> None:
  ap = argparse.ArgumentParser()
  ap.add_argument("--src", required=True, help="Source PNG/JPG path")
  ap.add_argument("--crop", default="", help="Crop box x0,y0,x1,y1 in source coords (omit for full image)")
  ap.add_argument("--erase", action="append", default=[], help="Erase box x0,y0,x1,y1 in source coords (repeatable)")
  ap.add_argument("--out", required=True, help="Output file path (.jpg, .webp, or .png)")
  ap.add_argument("--quality", type=int, default=88, help="JPEG/WebP quality (default 88)")
  ap.add_argument("--print-data-uri", action="store_true", help="Print data URI string to stdout")
  args = ap.parse_args()

  src_path = pathlib.Path(args.src)
  with tempfile.TemporaryDirectory() as tmpdir:
    png_in = pathlib.Path(tmpdir) / "in.png"
    if src_path.suffix.lower() == ".png":
      png_in = src_path
    else:
      subprocess.check_call(["/usr/bin/magick", str(src_path), str(png_in)])

    surf = cairo.ImageSurface.create_from_png(str(png_in))
    surf.flush()
    w, h = surf.get_width(), surf.get_height()
    stride = surf.get_stride()
    buf = surf.get_data()

    for erase_str in args.erase:
      ex0, ey0, ex1, ey1 = parse_box(erase_str)
      inpaint_box_bgra(buf, stride, w, h, ex0, ey0, ex1, ey1)
    surf.mark_dirty()

    if args.crop:
      cx0, cy0, cx1, cy1 = parse_box(args.crop)
      cw, ch = cx1 - cx0, cy1 - cy0
      out_surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, cw, ch)
      ctx = cairo.Context(out_surf)
      ctx.set_source_surface(surf, -cx0, -cy0)
      ctx.paint()
    else:
      out_surf = surf

    tmp_png = pathlib.Path(tmpdir) / "cropped.png"
    out_surf.write_to_png(str(tmp_png))

    out_path = pathlib.Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    ext = out_path.suffix.lower()
    if ext in (".jpg", ".jpeg"):
      subprocess.check_call([
          "/usr/bin/magick", str(tmp_png),
          "-strip", "-sampling-factor", "4:2:0", "-quality", str(args.quality),
          str(out_path),
      ])
      mime = "image/jpeg"
    elif ext == ".webp":
      subprocess.check_call([
          "/usr/bin/magick", str(tmp_png),
          "-strip", "-quality", str(args.quality),
          str(out_path),
      ])
      mime = "image/webp"
    else:
      subprocess.check_call(["/usr/bin/magick", str(tmp_png), "-strip", str(out_path)])
      mime = "image/png"

    if args.print_data_uri:
      b64 = base64.b64encode(out_path.read_bytes()).decode("ascii")
      print(f"data:{mime};base64,{b64}")


if __name__ == "__main__":
  main()
