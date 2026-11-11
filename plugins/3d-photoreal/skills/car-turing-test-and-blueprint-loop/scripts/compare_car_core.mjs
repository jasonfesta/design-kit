#!/usr/bin/env node
/**
 * compare_car_core.mjs — Full-Resolution (`1200xH`) Automotive Turing + 4-View Blueprint IoU Evaluator
 *
 * Combines:
 *   1. Native-resolution (`1200xH`) Hero photo parity (`3x3` + `8x6` exposure, `300w` body + `600w`
 *      shutline/spoke edge polarity cosine, OKLab chroma balance, `48`-tile clearcoat/tread texture parity,
 *      `chromaClipPct <= 0.25%`, `sharpnessRatioPct` in `90%..124%`).
 *   2. 2-Tier Automotive Turing Strip (`iter_XX_turing_strip.png`) with 4 semantic `200%` pixel loupes:
 *      [0] Greenhouse & Ceramic Frit, [1] Lamp & Shutline Optics, [2] Worst Tile, [3] Wheel/Caliper/Contact Patch.
 *   3. Optional 4-View Orthographic Blueprint Verification (`--blueprint-dir` + `--ortho-dir`):
 *      Extracts visual-hull vehicle envelopes from thin-line technical drawings AND rendered 3D orthographic
 *      views (`side`, `front`, `rear`, `top`), measures dimensional ratio error (`%`) + shape IoU, and writes
 *      `iter_XX_blueprint_overlay.png` (`Green = Aligned`, `Amber = Missing 3D Mass`, `Cyan = Excess 3D Mass`).
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';

function probeDims(imgPath) {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', imgPath],
    { encoding: 'utf8' },
  ).trim();
  const [w, h] = out.split('\n')[0].split('x').map((n) => parseInt(n, 10));
  return { width: w, height: h };
}

function decodeRGB(imgPath, targetW, targetH) {
  const proc = spawnSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      imgPath,
      '-vf',
      `scale=${targetW}:${targetH}:flags=lanczos`,
      '-frames:v',
      '1',
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgb24',
      '-',
    ],
    { maxBuffer: 120 * 1024 * 1024 },
  );
  if (proc.status !== 0) {
    throw new Error(`ffmpeg decode failed for ${imgPath}: ${proc.stderr.toString()}`);
  }
  return proc.stdout;
}

function srgbByteToLinear(b) {
  const c = b / 255.0;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

const SRGB_TO_LIN = new Float64Array(256);
for (let i = 0; i < 256; i++) SRGB_TO_LIN[i] = srgbByteToLinear(i);

function rgbBytesToOKLab(rB, gB, bB, out) {
  const r = SRGB_TO_LIN[rB];
  const g = SRGB_TO_LIN[gB];
  const b = SRGB_TO_LIN[bB];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  out[0] = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  out[1] = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  out[2] = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
}

function boxDownsampleRGB(src, srcW, srcH, dstW, dstH) {
  const dst = new Float64Array(dstW * dstH * 3);
  for (let dy = 0; dy < dstH; dy++) {
    const y0 = Math.floor((dy * srcH) / dstH);
    const y1 = Math.max(y0 + 1, Math.floor(((dy + 1) * srcH) / dstH));
    for (let dx = 0; dx < dstW; dx++) {
      const x0 = Math.floor((dx * srcW) / dstW);
      const x1 = Math.max(x0 + 1, Math.floor(((dx + 1) * srcW) / dstW));
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let cnt = 0;
      for (let y = y0; y < y1; y++) {
        let idx = (y * srcW + x0) * 3;
        for (let x = x0; x < x1; x++) {
          sr += src[idx];
          sg += src[idx + 1];
          sb += src[idx + 2];
          idx += 3;
          cnt++;
        }
      }
      const o = (dy * dstW + dx) * 3;
      dst[o] = sr / cnt;
      dst[o + 1] = sg / cnt;
      dst[o + 2] = sb / cnt;
    }
  }
  return dst;
}

function edgeCosineOnRGBFloat(aRGB, bRGB, w, h) {
  const aLum = new Float64Array(w * h);
  const bLum = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * 3;
    aLum[i] = (0.2126 * aRGB[o] + 0.7152 * aRGB[o + 1] + 0.0722 * aRGB[o + 2]) / 255.0;
    bLum[i] = (0.2126 * bRGB[o] + 0.7152 * bRGB[o + 1] + 0.0722 * bRGB[o + 2]) / 255.0;
  }
  let dotMag = 0;
  let dotSigned = 0;
  let normA = 0;
  let normB = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const ax = aLum[i + 1] - aLum[i - 1];
      const ay = aLum[i + w] - aLum[i - w];
      const bx = bLum[i + 1] - bLum[i - 1];
      const by = bLum[i + w] - bLum[i - w];
      const am = Math.hypot(ax, ay);
      const bm = Math.hypot(bx, by);
      dotMag += am * bm;
      dotSigned += ax * bx + ay * by;
      normA += am * am;
      normB += bm * bm;
    }
  }
  const denom = Math.max(Math.sqrt(normA * normB), 1e-8);
  return 0.75 * (dotMag / denom) + 0.25 * Math.max(0.0, dotSigned / denom);
}

function heatRGB(e) {
  const t = Math.min(1.0, Math.max(0.0, e));
  return [
    Math.round(255 * Math.min(1.0, Math.max(0.0, t * 2.0 - 0.2))),
    Math.round(255 * Math.max(0.0, 1.0 - Math.abs(t - 0.5) * 2.0)),
    Math.round(255 * Math.max(0.0, 1.0 - t * 2.2)),
  ];
}

function drawBorder(buf, outW, outH, x0, y0, w, h, color, thick = 2) {
  for (let t = 0; t < thick; t++) {
    for (let x = x0; x < x0 + w; x++) {
      if (x < 0 || x >= outW) continue;
      for (const yy of [y0 + t, y0 + h - 1 - t]) {
        if (yy < 0 || yy >= outH) continue;
        const o = (yy * outW + x) * 3;
        buf[o] = color[0];
        buf[o + 1] = color[1];
        buf[o + 2] = color[2];
      }
    }
    for (let y = y0; y < y0 + h; y++) {
      if (y < 0 || y >= outH) continue;
      for (const xx of [x0 + t, x0 + w - 1 - t]) {
        if (xx < 0 || xx >= outW) continue;
        const o = (y * outW + xx) * 3;
        buf[o] = color[0];
        buf[o + 1] = color[1];
        buf[o + 2] = color[2];
      }
    }
  }
}

/**
 * Extracts a normalized `[normW x normH]` filled vehicle visual-hull envelope AND raw ink mask
 * from either a thin-line technical drawing OR a solid orthographic render over a uniform background.
 */
function extractOrthoEnvelope(imgPath, normW = 420, normH = 240) {
  const dims = probeDims(imgPath);
  const w = Math.min(720, Math.max(240, dims.width));
  const h = Math.max(140, Math.round((w * dims.height) / Math.max(1, dims.width)));
  const buf = decodeRGB(imgPath, w, h);

  const lums = new Float64Array(w * h);
  const border = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 3;
      const lum = (0.2126 * buf[o] + 0.7152 * buf[o + 1] + 0.0722 * buf[o + 2]) / 255.0;
      lums[y * w + x] = lum;
      if (x < 4 || x >= w - 4 || y < 4 || y >= h - 4) border.push(lum);
    }
  }
  border.sort((a, b) => a - b);
  const bgLum = border[border.length >> 1] ?? 1.0;
  const lightBg = bgLum >= 0.5;

  const mx = Math.max(2, Math.floor(0.02 * w));
  const my = Math.max(2, Math.floor(0.02 * h));
  const fg = new Uint8Array(w * h);
  const xs = [];
  const ys = [];

  for (let y = my; y < h - my; y++) {
    for (let x = mx; x < w - mx; x++) {
      const lum = lums[y * w + x];
      const diff = lightBg ? bgLum - lum : lum - bgLum;
      // Catch both dark lines and colored/shaded 3D car pixels against `#f8fafc` (`bgLum ~ 0.975`)
      const o = (y * w + x) * 3;
      const sat = (Math.max(buf[o], buf[o + 1], buf[o + 2]) - Math.min(buf[o], buf[o + 1], buf[o + 2])) / 255.0;
      if (diff > 0.055 || sat > 0.08) {
        fg[y * w + x] = 1;
        xs.push(x);
        ys.push(y);
      }
    }
  }

  if (xs.length < 30) return null;
  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  const x0 = xs[Math.floor(0.005 * xs.length)];
  const x1 = xs[Math.min(xs.length - 1, Math.floor(0.995 * xs.length))];
  const y0 = ys[Math.floor(0.005 * ys.length)];
  const y1 = ys[Math.min(ys.length - 1, Math.floor(0.995 * ys.length))];

  const bboxW = Math.max(2, x1 - x0 + 1);
  const bboxH = Math.max(2, y1 - y0 + 1);
  const aspectWOverH = (bboxW * (dims.width / w)) / Math.max(1.0, bboxH * (dims.height / h));

  // Sample cropped bbox onto `[normW x normH]` and compute row-span & col-span visual hull
  const ink = new Uint8Array(normW * normH);
  for (let ny = 0; ny < normH; ny++) {
    const sy = Math.min(h - 1, y0 + Math.floor(((ny + 0.5) * bboxH) / normH));
    for (let nx = 0; nx < normW; nx++) {
      const sx = Math.min(w - 1, x0 + Math.floor(((nx + 0.5) * bboxW) / normW));
      ink[ny * normW + nx] = fg[sy * w + sx];
    }
  }

  const rowMin = new Int32Array(normH).fill(normW);
  const rowMax = new Int32Array(normH).fill(-1);
  const colMin = new Int32Array(normW).fill(normH);
  const colMax = new Int32Array(normW).fill(-1);

  for (let ny = 0; ny < normH; ny++) {
    for (let nx = 0; nx < normW; nx++) {
      if (ink[ny * normW + nx]) {
        if (nx < rowMin[ny]) rowMin[ny] = nx;
        if (nx > rowMax[ny]) rowMax[ny] = nx;
        if (ny < colMin[nx]) colMin[nx] = ny;
        if (ny > colMax[nx]) colMax[nx] = ny;
      }
    }
  }

  // Smooth 5-tap median/box envelope on colMin/colMax so thin broken blueprint dashes close cleanly
  const hull = new Uint8Array(normW * normH);
  for (let ny = 0; ny < normH; ny++) {
    let rLo = rowMin[ny];
    let rHi = rowMax[ny];
    if (rHi < rLo) {
      for (let d = 1; d <= 3; d++) {
        if (ny - d >= 0 && rowMax[ny - d] >= rowMin[ny - d]) {
          rLo = Math.min(rLo, rowMin[ny - d]);
          rHi = Math.max(rHi, rowMax[ny - d]);
        }
        if (ny + d < normH && rowMax[ny + d] >= rowMin[ny + d]) {
          rLo = Math.min(rLo, rowMin[ny + d]);
          rHi = Math.max(rHi, rowMax[ny + d]);
        }
      }
    }
    if (rHi < rLo) continue;
    for (let nx = rLo; nx <= rHi; nx++) {
      let cLo = colMin[nx];
      let cHi = colMax[nx];
      if (cHi < cLo) {
        for (let d = 1; d <= 3; d++) {
          if (nx - d >= 0 && colMax[nx - d] >= colMin[nx - d]) {
            cLo = Math.min(cLo, colMin[nx - d]);
            cHi = Math.max(cHi, colMax[nx - d]);
          }
          if (nx + d < normW && colMax[nx + d] >= colMin[nx + d]) {
            cLo = Math.min(cLo, colMin[nx + d]);
            cHi = Math.max(cHi, colMax[nx + d]);
          }
        }
      }
      if (ny >= cLo && ny <= cHi) {
        hull[ny * normW + nx] = 1;
      }
    }
  }

  return { normW, normH, aspectWOverH, ink, hull };
}

function evaluateBlueprintOverlays(blueprintDir, orthoDir, outOverlayPng) {
  const views = ['side', 'front', 'rear', 'top'];
  const normW = 460;
  const normH = 260;
  const pad = 16;
  const cellW = normW + pad * 2;
  const cellH = normH + pad * 2;
  const sheetW = cellW * 2;
  const sheetH = cellH * 2;
  const sheetBuf = Buffer.alloc(sheetW * sheetH * 3, 244);

  const perView = {};
  const ious = [];
  const ratioErrs = [];

  views.forEach((v, idx) => {
    let bpFile = null;
    for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
      const cand = path.join(blueprintDir, `${v}${ext}`);
      if (fs.existsSync(cand)) {
        bpFile = cand;
        break;
      }
    }
    const renFile = path.join(orthoDir, `ortho_${v}.png`);
    if (!bpFile || !fs.existsSync(renFile)) return;

    const bpEnv = extractOrthoEnvelope(bpFile, normW, normH);
    const renEnv = extractOrthoEnvelope(renFile, normW, normH);
    if (!bpEnv || !renEnv) return;

    // Evaluate both normal and horizontally mirrored (`side`/`top` nose left vs nose right) and pick true orientation!
    let bestIoU = -1;
    let bestFlip = false;
    for (const flipX of [false, true]) {
      let inter = 0;
      let uni = 0;
      for (let y = 0; y < normH; y++) {
        for (let x = 0; x < normW; x++) {
          const bx = flipX ? normW - 1 - x : x;
          const a = bpEnv.hull[y * normW + bx];
          const b = renEnv.hull[y * normW + x];
          if (a && b) inter++;
          if (a || b) uni++;
        }
      }
      const iou = inter / Math.max(1, uni);
      if (iou > bestIoU) {
        bestIoU = iou;
        bestFlip = flipX;
      }
    }

    const aspectErrPct = (Math.abs(renEnv.aspectWOverH - bpEnv.aspectWOverH) / Math.max(1e-4, bpEnv.aspectWOverH)) * 100.0;
    ious.push(bestIoU);
    ratioErrs.push(aspectErrPct);
    perView[v] = {
      silhouette_iou: +bestIoU.toFixed(4),
      blueprint_aspect_w_over_h: +bpEnv.aspectWOverH.toFixed(4),
      render_aspect_w_over_h: +renEnv.aspectWOverH.toFixed(4),
      aspect_error_pct: +aspectErrPct.toFixed(2),
      auto_mirrored_blueprint: bestFlip,
    };

    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const ox = col * cellW + pad;
    const oy = row * cellH + pad;

    for (let y = 0; y < normH; y++) {
      for (let x = 0; x < normW; x++) {
        const bx = bestFlip ? normW - 1 - x : x;
        const bpH = bpEnv.hull[y * normW + bx];
        const bpInk = bpEnv.ink[y * normW + bx];
        const rnH = renEnv.hull[y * normW + x];

        let r = 248;
        let g = 250;
        let b = 252;
        if (bpH && rnH) {
          // Crisp sage-emerald alignment fill
          r = 165;
          g = 228;
          b = 188;
        } else if (bpH && !rnH) {
          // Warm amber = missing 3D mass relative to blueprint
          r = 252;
          g = 185;
          b = 112;
        } else if (!bpH && rnH) {
          // Cool cyan = excess 3D overhang outside blueprint
          r = 122;
          g = 205;
          b = 248;
        }
        // Superimpose original dark blueprint ink lines for crisp visual engineering inspection
        if (bpInk) {
          r = Math.round(r * 0.28);
          g = Math.round(g * 0.30);
          b = Math.round(b * 0.36);
        }

        const dst = ((oy + y) * sheetW + (ox + x)) * 3;
        sheetBuf[dst] = r;
        sheetBuf[dst + 1] = g;
        sheetBuf[dst + 2] = b;
      }
    }
    drawBorder(sheetBuf, sheetW, sheetH, ox - 2, oy - 2, normW + 4, normH + 4, [55, 65, 81], 2);
  });

  if (ious.length === 0) return null;

  const tmpPpm = path.join(os.tmpdir(), `car_bp_${process.pid}_${Date.now()}.ppm`);
  fs.writeFileSync(tmpPpm, Buffer.concat([Buffer.from(`P6\n${sheetW} ${sheetH}\n255\n`, 'ascii'), sheetBuf]));
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', tmpPpm, outOverlayPng]);
  fs.unlinkSync(tmpPpm);

  const meanIoU = ious.reduce((a, b) => a + b, 0) / ious.length;
  const meanAspectErr = ratioErrs.reduce((a, b) => a + b, 0) / ratioErrs.length;
  return {
    views_evaluated: Object.keys(perView),
    mean_ortho_iou: +meanIoU.toFixed(4),
    mean_aspect_error_pct: +meanAspectErr.toFixed(2),
    per_view: perView,
  };
}

function main() {
  const argv = process.argv.slice(2);
  let refPath = null;
  let renPath = null;
  let outDir = null;
  let blueprintDir = null;
  let orthoDir = null;
  let iter = 1;
  let skipStrip = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') outDir = argv[++i];
    else if (argv[i] === '--iter') iter = parseInt(argv[++i], 10);
    else if (argv[i] === '--blueprint-dir') blueprintDir = argv[++i];
    else if (argv[i] === '--ortho-dir') orthoDir = argv[++i];
    else if (argv[i] === '--no-strip') skipStrip = true;
    else if (!refPath) refPath = argv[i];
    else if (!renPath) renPath = argv[i];
  }

  if (!refPath || !renPath || !outDir) {
    console.error('Usage: node compare_car_core.mjs <ref> <ren> --out <dir> [--iter N] [--blueprint-dir <dir> --ortho-dir <dir>]');
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const renDims = probeDims(renPath);
  const refDims = probeDims(refPath);
  const aspect = refDims.width / Math.max(1, refDims.height);
  const W = renDims.width || 1200;
  const H = renDims.height || Math.max(200, Math.round(W / aspect));
  const PIXELS = W * H;

  const refBuf = decodeRGB(refPath, W, H);
  const renBuf = decodeRGB(renPath, W, H);

  const refLuma = new Float64Array(PIXELS);
  const renLuma = new Float64Array(PIXELS);
  const refGrad = new Float64Array(PIXELS);
  const renGrad = new Float64Array(PIXELS);

  let sumAbsRGB = 0;
  let sumOKChromaErr = 0;
  let sumChromaClip = 0;
  let sumPureSat = 0;
  const quadErr = [0, 0, 0, 0];
  const quadCnt = [0, 0, 0, 0];
  const labRef = [0, 0, 0];
  const labRen = [0, 0, 0];

  for (let y = 0; y < H; y++) {
    const qy = y >= H >> 1 ? 2 : 0;
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const o = i * 3;
      const rr = refBuf[o];
      const rg = refBuf[o + 1];
      const rb = refBuf[o + 2];
      const tr = renBuf[o];
      const tg = renBuf[o + 1];
      const tb = renBuf[o + 2];

      refLuma[i] = 0.2126 * rr + 0.7152 * rg + 0.0722 * rb;
      renLuma[i] = 0.2126 * tr + 0.7152 * tg + 0.0722 * tb;

      const diff = (Math.abs(rr - tr) + Math.abs(rg - tg) + Math.abs(rb - tb)) / (3.0 * 255.0);
      sumAbsRGB += diff;

      const qi = qy + (x >= W >> 1 ? 1 : 0);
      quadErr[qi] += diff;
      quadCnt[qi]++;

      const maxC = tr > tg ? (tr > tb ? tr : tb) : tg > tb ? tg : tb;
      const minC = tr < tg ? (tr < tb ? tr : tb) : tg < tb ? tg : tb;
      const chr = maxC - minC;
      if (maxC >= 240 && chr >= 145) sumChromaClip++;
      if (maxC >= 110 && chr / (maxC + 1e-5) >= 0.88) sumPureSat++;

      rgbBytesToOKLab(rr, rg, rb, labRef);
      rgbBytesToOKLab(tr, tg, tb, labRen);
      sumOKChromaErr += Math.hypot(labRef[1] - labRen[1], labRef[2] - labRen[2]);
    }
  }

  let sumGradRef = 0;
  let sumGradRen = 0;
  const sharpDenom = Math.max(1, (W - 4) * (H - 4));

  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < W - 2; x++) {
      const i = y * W + x;
      const gRef = Math.hypot(refLuma[i + 1] - refLuma[i - 1], refLuma[i + W] - refLuma[i - W]);
      const gRen = Math.hypot(renLuma[i + 1] - renLuma[i - 1], renLuma[i + W] - renLuma[i - W]);
      refGrad[i] = gRef;
      renGrad[i] = gRen;
      sumGradRef += gRef;
      sumGradRen += gRen;
    }
  }

  const gradSharpRef = sumGradRef / sharpDenom;
  const gradSharpRen = sumGradRen / sharpDenom;
  const sharpnessRatio = gradSharpRen / Math.max(1e-6, gradSharpRef);
  const sharpnessRatioPct = +(sharpnessRatio * 100.0).toFixed(1);
  const chromaClipPct = +((100.0 * sumChromaClip) / PIXELS).toFixed(3);
  const pureSatPct = +((100.0 * sumPureSat) / PIXELS).toFixed(3);

  const hyperrealFailures = [];
  if (chromaClipPct > 0.25) hyperrealFailures.push(`GAMUT_CHROMA_CLIP (${chromaClipPct}% > 0.25%)`);
  if (sharpnessRatio < 0.90) hyperrealFailures.push(`OVER_BLURRED_SOFTNESS (${sharpnessRatioPct}% < 90.0%)`);
  if (sharpnessRatio > 1.24) hyperrealFailures.push(`UNFILTERED_STIPPLE_NOISE (${sharpnessRatioPct}% > 124.0%)`);
  const hyperrealPassed = hyperrealFailures.length === 0;

  const TX = 8;
  const TY = 6;
  const tileStats = [];
  let localTexScoreSum = 0;

  for (let ty = 0; ty < TY; ty++) {
    const y0 = Math.max(2, Math.floor((ty * H) / TY));
    const y1 = Math.min(H - 2, Math.floor(((ty + 1) * H) / TY));
    for (let tx = 0; tx < TX; tx++) {
      const x0 = Math.max(2, Math.floor((tx * W) / TX));
      const x1 = Math.min(W - 2, Math.floor(((tx + 1) * W) / TX));
      let gr = 0;
      let gt = 0;
      let lr = 0;
      let lt = 0;
      let errTile = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = y * W + x;
          gr += refGrad[i];
          gt += renGrad[i];
          lr += refLuma[i] / 255.0;
          lt += renLuma[i] / 255.0;
          const o = i * 3;
          errTile += (Math.abs(refBuf[o] - renBuf[o]) + Math.abs(refBuf[o + 1] - renBuf[o + 1]) + Math.abs(refBuf[o + 2] - renBuf[o + 2])) / (3 * 255.0);
          n++;
        }
      }
      gr /= Math.max(1, n);
      gt /= Math.max(1, n);
      lr /= Math.max(1, n);
      lt /= Math.max(1, n);
      errTile /= Math.max(1, n);

      const ratio = (Math.min(gt, gr) + 1.35) / (Math.max(gt, gr) + 1.35);
      localTexScoreSum += ratio;
      tileStats.push({
        tile: `(${tx},${ty})`,
        tx,
        ty,
        uv: `u:${(tx / TX).toFixed(2)}..${((tx + 1) / TX).toFixed(2)}, v:${(ty / TY).toFixed(2)}..${((ty + 1) / TY).toFixed(2)}`,
        cx: Math.round((x0 + x1) * 0.5),
        cy: Math.round((y0 + y1) * 0.5),
        refGrad: +gr.toFixed(2),
        renGrad: +gt.toFixed(2),
        texParityPct: +(ratio * 100.0).toFixed(1),
        lumaDeltaSRGB: +((lt - lr) * 255.0).toFixed(1),
        rgbErr: +errTile.toFixed(3),
      });
    }
  }

  const localTextureParity = (localTexScoreSum / (TX * TY)) * 100.0;
  let globalSharpnessScore;
  if (sharpnessRatio >= 0.93 && sharpnessRatio <= 1.12) globalSharpnessScore = 100.0;
  else if (sharpnessRatio >= 0.90 && sharpnessRatio < 0.93) globalSharpnessScore = 92.0 + ((sharpnessRatio - 0.90) / 0.03) * 8.0;
  else if (sharpnessRatio > 1.12 && sharpnessRatio <= 1.24) globalSharpnessScore = 100.0 - ((sharpnessRatio - 1.12) / 0.12) * 10.0;
  else if (sharpnessRatio < 0.90) globalSharpnessScore = Math.max(0.0, 92.0 - (0.90 - sharpnessRatio) * 260.0);
  else globalSharpnessScore = Math.max(0.0, 90.0 - (sharpnessRatio - 1.24) * 220.0);

  const microTextureScore = 0.62 * localTextureParity + 0.38 * globalSharpnessScore;

  const wCoarse = 300;
  const hCoarse = Math.max(150, Math.round(wCoarse / aspect));
  const wFine = 600;
  const hFine = Math.max(300, Math.round(wFine / aspect));

  const refCoarse = boxDownsampleRGB(refBuf, W, H, wCoarse, hCoarse);
  const renCoarse = boxDownsampleRGB(renBuf, W, H, wCoarse, hCoarse);
  const refFine = boxDownsampleRGB(refBuf, W, H, wFine, hFine);
  const renFine = boxDownsampleRGB(renBuf, W, H, wFine, hFine);

  const edgeScore = (0.54 * edgeCosineOnRGBFloat(refCoarse, renCoarse, wCoarse, hCoarse) +
    0.46 * edgeCosineOnRGBFloat(refFine, renFine, wFine, hFine)) * 100.0;

  let coarseAbsRGB = 0;
  for (let i = 0; i < wCoarse * hCoarse * 3; i += 3) {
    coarseAbsRGB += (Math.abs(refCoarse[i] - renCoarse[i]) + Math.abs(refCoarse[i + 1] - renCoarse[i + 1]) + Math.abs(refCoarse[i + 2] - renCoarse[i + 2])) / (3.0 * 255.0);
  }
  const pixelFidelity = Math.max(0.0, 1.0 - (0.60 * (coarseAbsRGB / (wCoarse * hCoarse)) + 0.40 * (sumAbsRGB / PIXELS)) * 2.0) * 100.0;

  let zone3Sum = 0;
  for (let zy = 0; zy < 3; zy++) {
    const y0 = Math.floor((zy * hCoarse) / 3);
    const y1 = Math.floor(((zy + 1) * hCoarse) / 3);
    for (let zx = 0; zx < 3; zx++) {
      const x0 = Math.floor((zx * wCoarse) / 3);
      const x1 = Math.floor(((zx + 1) * wCoarse) / 3);
      let mr = 0;
      let mt = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const o = (y * wCoarse + x) * 3;
          mr += (0.2126 * refCoarse[o] + 0.7152 * refCoarse[o + 1] + 0.0722 * refCoarse[o + 2]) / 255.0;
          mt += (0.2126 * renCoarse[o] + 0.7152 * renCoarse[o + 1] + 0.0722 * renCoarse[o + 2]) / 255.0;
          n++;
        }
      }
      zone3Sum += Math.max(0.0, 1.0 - Math.abs(mr / n - mt / n) * 2.2);
    }
  }
  const zone48Sum = tileStats.reduce((acc, t) => acc + Math.max(0.0, 1.0 - (Math.abs(t.lumaDeltaSRGB) / 255.0) * 2.2), 0);
  const zoneExposureScore = (0.45 * (zone3Sum / 9.0) + 0.55 * (zone48Sum / (TX * TY))) * 100.0;

  let colorFidelity = Math.max(0.0, 1.0 - (sumOKChromaErr / PIXELS) * 4.2) * 100.0;
  if (chromaClipPct > 0.25) colorFidelity = Math.max(0.0, colorFidelity - (chromaClipPct - 0.25) * 18.0);

  let overallSimilarity =
    0.20 * zoneExposureScore +
    0.26 * edgeScore +
    0.18 * pixelFidelity +
    0.14 * colorFidelity +
    0.22 * microTextureScore;
  if (!hyperrealPassed) overallSimilarity -= 3.5;
  overallSimilarity = +Math.max(0.0, overallSimilarity).toFixed(1);

  const iterStr = String(iter).padStart(2, '0');
  const compPath = path.join(outDir, `iter_${iterStr}_turing_strip.png`);

  if (!skipStrip) {
    const panelW = 640;
    const panelH = Math.max(320, Math.round(panelW / aspect));
    const stripW = panelW * 3;
    const loupeH = 380;
    const stripH = panelH + loupeH;
    const stripBuf = Buffer.alloc(stripW * stripH * 3, 18);

    for (let py = 0; py < panelH; py++) {
      const sy = Math.min(H - 1, Math.floor((py * H) / panelH));
      const isCrosshair = py % Math.round(panelH / 5) === 0 && py > 0;
      for (let px = 0; px < panelW; px++) {
        const sx = Math.min(W - 1, Math.floor((px * W) / panelW));
        const si = (sy * W + sx) * 3;

        const d0 = (py * stripW + px) * 3;
        stripBuf[d0] = isCrosshair && px % 8 < 4 ? 255 : refBuf[si];
        stripBuf[d0 + 1] = isCrosshair && px % 8 < 4 ? 90 : refBuf[si + 1];
        stripBuf[d0 + 2] = isCrosshair && px % 8 < 4 ? 70 : refBuf[si + 2];

        const d1 = (py * stripW + panelW + px) * 3;
        stripBuf[d1] = isCrosshair && px % 8 < 4 ? 255 : renBuf[si];
        stripBuf[d1 + 1] = isCrosshair && px % 8 < 4 ? 90 : renBuf[si + 1];
        stripBuf[d1 + 2] = isCrosshair && px % 8 < 4 ? 70 : renBuf[si + 2];

        const rgbE = (Math.abs(refBuf[si] - renBuf[si]) + Math.abs(refBuf[si + 1] - renBuf[si + 1]) + Math.abs(refBuf[si + 2] - renBuf[si + 2])) / (3.0 * 255.0);
        const gradE = Math.abs(refGrad[sy * W + sx] - renGrad[sy * W + sx]) / 95.0;
        const [hr, hg, hb] = heatRGB(rgbE * 2.1 + gradE * 0.55);

        const d2 = (py * stripW + panelW * 2 + px) * 3;
        stripBuf[d2] = hr;
        stripBuf[d2 + 1] = hg;
        stripBuf[d2 + 2] = hb;
      }
    }

    // Auto-target Wheel/Caliper/Contact-Patch loupe onto highest detail lower-car tile!
    const wheelTile =
      tileStats
        .filter((t) => t.ty >= 3 && t.ty <= 4 && t.tx >= 1 && t.tx <= 6)
        .sort((a, b) => b.refGrad - a.refGrad)[0] || { cx: Math.round(W * 0.66), cy: Math.round(H * 0.70) };

    const worstTile = [...tileStats].sort((a, b) => (a.texParityPct - a.rgbErr * 120) - (b.texParityPct - b.rgbErr * 120))[0];

    const loupeCenters = [
      [Math.round(W * 0.48), Math.round(H * 0.38), [90, 175, 255]],  // [0] Greenhouse / Ceramic Frit / Roof Crown
      [Math.round(W * 0.34), Math.round(H * 0.56), [95, 225, 145]],  // [1] Headlamp / Grille / Paint Shutlines
      [worstTile.cx, worstTile.cy, [255, 95, 85]],                   // [2] Worst Local Error Tile
      [wheelTile.cx, wheelTile.cy, [245, 195, 80]],                  // [3] Wheel Spokes / Caliper / Tire Contact
    ];

    const cellW = Math.floor(stripW / 4);
    const halfCellW = Math.floor((cellW - 8) / 2);
    const innerH = loupeH - 12;

    for (let li = 0; li < 4; li++) {
      const [cx, cy, borderCol] = loupeCenters[li];
      const srcW = Math.floor(halfCellW / 2);
      const srcH = Math.floor(innerH / 2);
      const sx0 = Math.max(0, Math.min(W - srcW, cx - (srcW >> 1)));
      const sy0 = Math.max(0, Math.min(H - srcH, cy - (srcH >> 1)));

      const boxX = Math.round((sx0 / W) * panelW);
      const boxY = Math.round((sy0 / H) * panelH);
      const boxW = Math.max(8, Math.round((srcW / W) * panelW));
      const boxH = Math.max(8, Math.round((srcH / H) * panelH));
      drawBorder(stripBuf, stripW, stripH, boxX, boxY, boxW, boxH, borderCol, 2);
      drawBorder(stripBuf, stripW, stripH, panelW + boxX, boxY, boxW, boxH, borderCol, 2);

      const baseX = li * cellW + 3;
      const baseY = panelH + 6;
      for (let py = 0; py < innerH; py++) {
        const sy = Math.min(H - 1, sy0 + (py >> 1));
        for (let px = 0; px < halfCellW; px++) {
          const sx = Math.min(W - 1, sx0 + (px >> 1));
          const si = (sy * W + sx) * 3;
          const oL = ((baseY + py) * stripW + baseX + px) * 3;
          stripBuf[oL] = refBuf[si];
          stripBuf[oL + 1] = refBuf[si + 1];
          stripBuf[oL + 2] = refBuf[si + 2];
          const oR = ((baseY + py) * stripW + baseX + halfCellW + 2 + px) * 3;
          stripBuf[oR] = renBuf[si];
          stripBuf[oR + 1] = renBuf[si + 1];
          stripBuf[oR + 2] = renBuf[si + 2];
        }
      }
      drawBorder(stripBuf, stripW, stripH, baseX, baseY, halfCellW * 2 + 2, innerH, borderCol, 2);
    }

    const tmpStripPpm = path.join(os.tmpdir(), `car_strip_${process.pid}_${Date.now()}.ppm`);
    fs.writeFileSync(tmpStripPpm, Buffer.concat([Buffer.from(`P6\n${stripW} ${stripH}\n255\n`, 'ascii'), stripBuf]));
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', tmpStripPpm, compPath]);
    fs.unlinkSync(tmpStripPpm);
  }

  let blueprintReport = null;
  if (blueprintDir && orthoDir && fs.existsSync(blueprintDir) && fs.existsSync(orthoDir)) {
    const bpOverlayPng = path.join(outDir, `iter_${iterStr}_blueprint_overlay.png`);
    blueprintReport = evaluateBlueprintOverlays(blueprintDir, orthoDir, bpOverlayPng);
  }

  const homePrefix = os.homedir();
  const relStripPath = compPath.startsWith(homePrefix) ? `~${compPath.slice(homePrefix.length)}` : compPath;

  const report = {
    evaluator_version: 2,
    domain: 'automotive-threejs',
    iteration: iter,
    evaluated_grid: [W, H],
    overall_similarity: overallSimilarity,
    hyperreal_passed: hyperrealPassed,
    hyperreal_failures: hyperrealFailures,
    sharpness_ratio_pct: sharpnessRatioPct,
    chroma_clip_pct: chromaClipPct,
    pure_sat_pct: pureSatPct,
    zone_exposure_score: +zoneExposureScore.toFixed(1),
    silhouette_edge_alignment: +edgeScore.toFixed(1),
    pixel_rgb_fidelity: +pixelFidelity.toFixed(1),
    chromatic_balance: +colorFidelity.toFixed(1),
    micro_texture_realism: +microTextureScore.toFixed(1),
    local_texture_parity: +localTextureParity.toFixed(1),
    under_textured_zones: tileStats.filter((t) => t.renGrad + 1.0 < t.refGrad * 0.85).sort((a, b) => a.texParityPct - b.texParityPct).slice(0, 4),
    over_textured_zones: tileStats.filter((t) => t.renGrad > t.refGrad * 1.18 + 1.5).sort((a, b) => a.texParityPct - b.texParityPct).slice(0, 3),
    blueprint_verification: blueprintReport,
    turing_strip: relStripPath,
  };

  fs.writeFileSync(path.join(outDir, `iter_${iterStr}_metrics.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
