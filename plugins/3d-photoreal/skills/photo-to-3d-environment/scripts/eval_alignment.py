#!/usr/bin/env python3
"""
Stage 4 & 7: Automated Placement, Split-Wipe Alignment & Linear HDR Luminance Eval.

Renders a self-contained WebGL2 photo-to-3D HTML file in headless Chromium (Playwright)
and compares `#glCanvas` against `#refImg` (or `--ref` image, cropped via exact CSS
`object-fit: cover` math). Reports:
  - Console / page error count
  - Sobel Edge F1 (@4px tolerance)
  - Split-wipe seam continuity at x=W/2 (luminance correlation & L1)
  - Global luminance correlation & RGB L1
  - Vertical landmark deltas at x~50% (wall_top_y, floor_y, tbl_top_y)
  - Linear HDR luminance parity (mean, p05, p50, p95, highlight clipPct)
  - Saves eval-wipe.png, eval-ghost.png (50/50 overlay), and eval-3d.png.

Usage:
  python3 eval_alignment.py --html ./scene.html --out-dir ./eval-out
"""
import argparse
import base64
import json
import os
import sys
from pathlib import Path

# Auto-wire Design Kit local Playwright runtime when available
KIT_SITE = "/usr/local/google/home/jfesta/design-kit/tools/python/site"
KIT_BROWSERS = "/usr/local/google/home/jfesta/design-kit/tools/ms-playwright"
if os.path.isdir(KIT_SITE) and KIT_SITE not in sys.path:
    sys.path.insert(0, KIT_SITE)
if os.path.isdir(KIT_BROWSERS) and "PLAYWRIGHT_BROWSERS_PATH" not in os.environ:
    os.environ["PLAYWRIGHT_BROWSERS_PATH"] = KIT_BROWSERS

from playwright.sync_api import sync_playwright

EVAL_JS = """(opts) => {
  const W = opts.w, H = opts.h;
  const glCanvas = document.getElementById('glCanvas');
  const refImg = document.getElementById('refImg');
  if (!glCanvas || !refImg) throw new Error('Expected #glCanvas and #refImg in DOM');

  const cRef = document.createElement('canvas');
  cRef.width = W; cRef.height = H;
  const xRef = cRef.getContext('2d');
  const sw = refImg.naturalWidth, sh = refImg.naturalHeight;
  const scale = Math.max(W / sw, H / sh);
  const dw = sw * scale, dh = sh * scale;
  xRef.drawImage(refImg, (W - dw) * 0.5, (H - dh) * 0.5, dw, dh);
  const refData = xRef.getImageData(0, 0, W, H).data;

  const cRen = document.createElement('canvas');
  cRen.width = W; cRen.height = H;
  const xRen = cRen.getContext('2d');
  xRen.drawImage(glCanvas, 0, 0, W, H);
  const renData = xRen.getImageData(0, 0, W, H).data;

  const refLum = new Float32Array(W * H);
  const renLum = new Float32Array(W * H);
  let rgbL1 = 0;
  for (let i = 0, p = 0; i < W * H; i++, p += 4) {
    const r0 = refData[p]/255, g0 = refData[p+1]/255, b0 = refData[p+2]/255;
    const r1 = renData[p]/255, g1 = renData[p+1]/255, b1 = renData[p+2]/255;
    refLum[i] = 0.299*r0 + 0.587*g0 + 0.114*b0;
    renLum[i] = 0.299*r1 + 0.587*g1 + 0.114*b1;
    rgbL1 += Math.abs(r0 - r1) + Math.abs(g0 - g1) + Math.abs(b0 - b1);
  }
  rgbL1 /= (W * H * 3);

  function corr(a, b) {
    let ma = 0, mb = 0;
    for (let i = 0; i < a.length; i++) { ma += a[i]; mb += b[i]; }
    ma /= a.length; mb /= a.length;
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < a.length; i++) {
      const xa = a[i] - ma, xb = b[i] - mb;
      num += xa * xb; da += xa * xa; db += xb * xb;
    }
    return num / (Math.sqrt(da * db) + 1e-9);
  }

  function lumStats(lum, x0, x1) {
    const vals = [];
    let sum = 0, clipped = 0;
    for (let y = 0; y < H; y += 2) {
      for (let x = x0; x < x1; x += 2) {
        const l = lum[y * W + x];
        vals.push(l); sum += l;
        if (l > 0.992) clipped++;
      }
    }
    vals.sort((a, b) => a - b);
    return {
      mean: +(sum / vals.length).toFixed(4),
      p05: +vals[Math.floor(vals.length * 0.05)].toFixed(4),
      p50: +vals[Math.floor(vals.length * 0.50)].toFixed(4),
      p95: +vals[Math.floor(vals.length * 0.95)].toFixed(4),
      clipPct: +(clipped / vals.length * 100).toFixed(2),
    };
  }

  const mid = W >> 1;
  const seamRef = new Float32Array(H), seamRen = new Float32Array(H);
  let seamL1 = 0;
  for (let y = 0; y < H; y++) {
    let s0 = 0, s1 = 0;
    for (let dx = 0; dx < 8; dx++) {
      s0 += refLum[y * W + (mid - 8 + dx)];
      s1 += renLum[y * W + (mid + dx)];
    }
    seamRef[y] = s0 / 8;
    seamRen[y] = s1 / 8;
    seamL1 += Math.abs(seamRef[y] - seamRen[y]);
  }
  seamL1 /= H;

  const sw2 = W >> 1, sh2 = H >> 1;
  function edges2x(lum) {
    const mag = new Float32Array(sw2 * sh2);
    let mx = 1e-6;
    for (let y = 1; y < sh2 - 1; y++) {
      for (let x = 1; x < sw2 - 1; x++) {
        const y0 = (y*2-2)*W, y1 = (y*2)*W, y2 = (y*2+2)*W, xc = x*2;
        const gx = -lum[y0+xc-2] + lum[y0+xc+2] - 2*lum[y1+xc-2] + 2*lum[y1+xc+2] - lum[y2+xc-2] + lum[y2+xc+2];
        const gy = -lum[y0+xc-2] - 2*lum[y0+xc] - lum[y0+xc+2] + lum[y2+xc-2] + 2*lum[y2+xc] + lum[y2+xc+2];
        const m = Math.hypot(gx, gy);
        mag[y * sw2 + x] = m;
        if (m > mx) mx = m;
      }
    }
    const bin = new Uint8Array(sw2 * sh2);
    for (let i = 0; i < mag.length; i++) if (mag[i] / mx > 0.14) bin[i] = 1;
    return bin;
  }
  function dilate(bin, r) {
    const out = new Uint8Array(sw2 * sh2);
    for (let y = r; y < sh2 - r; y++) {
      for (let x = r; x < sw2 - r; x++) {
        if (!bin[y * sw2 + x]) continue;
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) out[(y+dy)*sw2 + (x+dx)] = 1;
      }
    }
    return out;
  }
  const eRef = edges2x(refLum), eRen = edges2x(renLum);
  const dRef = dilate(eRef, 2), dRen = dilate(eRen, 2);
  let tpP = 0, nRen = 0, tpR = 0, nRef = 0;
  for (let i = 0; i < eRef.length; i++) {
    if (eRen[i]) { nRen++; if (dRef[i]) tpP++; }
    if (eRef[i]) { nRef++; if (dRen[i]) tpR++; }
  }
  const prec = tpP / Math.max(1, nRen), rec = tpR / Math.max(1, nRef);
  const edgeF1 = (2 * prec * rec) / Math.max(1e-6, prec + rec);

  function landmarks(lum) {
    const col50 = new Float32Array(H), col48 = new Float32Array(H);
    const x50a = Math.round(W * 0.484), x50b = Math.round(W * 0.508);
    const x48a = Math.round(W * 0.453), x48b = Math.round(W * 0.484);
    for (let y = 0; y < H; y++) {
      let s50 = 0, s48 = 0;
      for (let x = x50a; x < x50b; x++) s50 += lum[y * W + x];
      for (let x = x48a; x < x48b; x++) s48 += lum[y * W + x];
      col50[y] = s50 / Math.max(1, x50b - x50a);
      col48[y] = s48 / Math.max(1, x48b - x48a);
    }
    const argMinDiff = (arr, y0, y1) => {
      let best = y0, bv = 1e9;
      for (let y = y0; y < y1; y++) { const d = arr[y+1] - arr[y]; if (d < bv) { bv = d; best = y; } }
      return best;
    };
    const argMaxDiff = (arr, y0, y1) => {
      let best = y0, bv = -1e9;
      for (let y = y0; y < y1; y++) { const d = arr[y+1] - arr[y]; if (d > bv) { bv = d; best = y; } }
      return best;
    };
    return {
      wall_top_y: argMinDiff(col50, Math.round(H * 0.20), Math.round(H * 0.36)),
      floor_y:    argMinDiff(col48, Math.round(H * 0.52), Math.round(H * 0.70)),
      tbl_top_y:  argMaxDiff(col50, Math.round(H * 0.60), Math.round(H * 0.78)),
    };
  }

  return {
    edge_f1: edgeF1, prec, rec,
    seam_corr: corr(seamRef, seamRen), seam_l1: seamL1,
    lum_corr: corr(refLum, renLum), rgb_l1: rgbL1,
    lm_ref: landmarks(refLum),
    lm_ren: landmarks(renLum),
    hdr: {
      photo_all: lumStats(refLum, 0, W),
      ren_all: lumStats(renLum, 0, W),
      photo_right: lumStats(refLum, mid, W),
      ren_right: lumStats(renLum, mid, W),
    },
  };
}"""


def parse_args():
    ap = argparse.ArgumentParser(description="Evaluate 3D split-wipe alignment & HDR luminance parity.")
    ap.add_argument("--html", type=Path, required=True, help="Path to standalone WebGL2 HTML file")
    ap.add_argument("--ref", type=Path, help="Optional external reference photo to override #refImg")
    ap.add_argument("--out-dir", type=Path, required=True, help="Output directory for eval screenshots & JSON")
    ap.add_argument("--width", type=int, default=1280, help="Viewport width (default: 1280)")
    ap.add_argument("--height", type=int, default=800, help="Viewport height (default: 800)")
    ap.add_argument("--wait-ms", type=int, default=1300, help="Initial settle delay in ms")
    return ap.parse_args()


def main():
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    html_url = args.html.resolve().as_uri()
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
        )
        page = browser.new_page(viewport={"width": args.width, "height": args.height})
        page.on("pageerror", lambda e: errors.append(f"PAGEERROR: {e}"))
        page.on("console", lambda m: errors.append(f"CONSOLE {m.type}: {m.text}") if m.type == "error" else None)

        page.goto(html_url, wait_until="domcontentloaded")
        if args.ref:
            ext = args.ref.suffix.lower().lstrip(".")
            mime = "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}"
            b64 = base64.b64encode(args.ref.read_bytes()).decode("ascii")
            page.evaluate(
                "(uri) => { const el = document.getElementById('refImg'); if (el) el.src = uri; }",
                f"data:{mime};base64,{b64}",
            )
        page.wait_for_timeout(args.wait_ms)
        page.screenshot(path=str(args.out_dir / "eval-wipe.png"))

        metrics = page.evaluate(EVAL_JS, {"w": args.width, "h": args.height})

        page.evaluate("""() => {
            ['#wipeHandle', 'header', 'aside', '#dkCollapsedPill'].forEach(sel => {
                document.querySelectorAll(sel).forEach(el => el.style.display = 'none');
            });
            const r = document.getElementById('refLayer');
            if (r) { r.style.display = 'block'; r.style.clipPath = 'none'; r.style.opacity = '0.5'; }
        }""")
        page.wait_for_timeout(200)
        page.screenshot(path=str(args.out_dir / "eval-ghost.png"))

        page.evaluate("() => { const r = document.getElementById('refLayer'); if (r) r.style.display = 'none'; }")
        page.wait_for_timeout(150)
        page.screenshot(path=str(args.out_dir / "eval-3d.png"))
        browser.close()

    report = {"errors": errors, "metrics": metrics}
    (args.out_dir / "eval-metrics.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"=== ALIGNMENT & HDR EVAL ({args.width}x{args.height}) ===")
    print(f"Errors:             {len(errors)}")
    print(f"Edge F1 (@4px):     {metrics['edge_f1']:.4f}  (prec={metrics['prec']:.3f}, rec={metrics['rec']:.3f})")
    print(f"Seam x=W/2 Corr:    {metrics['seam_corr']:.4f}  (L1={metrics['seam_l1']:.4f})")
    print(f"Global Lum Corr:    {metrics['lum_corr']:.4f}  (RGB L1={metrics['rgb_l1']:.4f})")
    print("Landmarks (y px at x~50%):")
    for k in ("wall_top_y", "floor_y", "tbl_top_y"):
        r0, r1 = metrics["lm_ref"][k], metrics["lm_ren"][k]
        print(f"  {k:12s}: photo={r0:4d}px  3d={r1:4d}px  delta={r1-r0:+4d}px")
    print("HDR Luminance Parity:")
    for k, v in metrics["hdr"].items():
        print(f"  {k:12s}: mean={v['mean']:.4f}  p05={v['p05']:.4f}  p50={v['p50']:.4f}  p95={v['p95']:.4f}  clip={v['clipPct']:.2f}%")


if __name__ == "__main__":
    main()
