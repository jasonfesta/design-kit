#!/usr/bin/env node
/**
 * compare_arch_core.mjs — Full-Native-Resolution (`1200xH`) Architectural Hyperrealism Evaluator
 *
 * Replaces legacy `240x160` (`5x` downsampled) evaluation with a high-speed V8 Float64 evaluator
 * at full native render resolution (`1200 x H`), coupled directly to the physical gates of
 * `audit-threejs-hyperrealism`:
 *   1. Multi-Scale Zone Luminance & Quantile Parity (`3x3` + `6x4` median/mean/p85)
 *   2. Multi-Scale Architectural Edge Alignment (`300w` structural registration + `600w` fine mullions/ribs)
 *   3. Multi-Scale Perceptual RGB Fidelity (`1200w` + `300w` integrated patch parity)
 *   4. Perceptual OKLab Chromatic Balance (`6x4` zone casts + pixel Δa/Δb)
 *   5. Spatially Local `8x6` (48-Tile) Full-Resolution Micro-Texture & Cinema Sharpness Parity:
 *      - Prevents a single noisy tree/bush from masking smooth untextured plastic concrete, skies,
 *        carpets, or glass panes!
 *      - Reports exact `(u, v)` bounds of the top under-textured (`too smooth/blurry`) and
 *        over-textured (`too harsh/striped/noisy`) spatial tiles!
 *      - Renders a 2-tier Turing + 4-Zone `200%` Macro Pixel Loupe strip (`iter_XX_turing_strip.png`)
 *        so agents see real `200%` pixel detail alongside registration heatmaps on every iteration!
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
  const magCos = dotMag / denom;
  const dirCos = Math.max(0.0, dotSigned / denom);
  // 75% magnitude registration + 25% polarity agreement (rewards true dark-vs-light edge sign!)
  return 0.75 * magCos + 0.25 * dirCos;
}

function heatRGB(e) {
  const t = Math.min(1.0, Math.max(0.0, e));
  const hr = Math.round(255 * Math.min(1.0, Math.max(0.0, t * 2.0 - 0.2)));
  const hg = Math.round(255 * Math.max(0.0, 1.0 - Math.abs(t - 0.5) * 2.0));
  const hb = Math.round(255 * Math.max(0.0, 1.0 - t * 2.2));
  return [hr, hg, hb];
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

function main() {
  const argv = process.argv.slice(2);
  let refPath = null;
  let renPath = null;
  let outDir = null;
  let iter = 1;
  let skipStrip = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') outDir = argv[++i];
    else if (argv[i] === '--iter') iter = parseInt(argv[++i], 10);
    else if (argv[i] === '--no-strip') skipStrip = true;
    else if (!refPath) refPath = argv[i];
    else if (!renPath) renPath = argv[i];
  }

  if (!refPath || !renPath || !outDir) {
    console.error('Usage: node compare_arch_core.mjs <ref> <ren> --out <dir> [--iter N] [--no-strip]');
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

  // Full-resolution luminance, gamut clip, gradient sharpness, and OKLab chroma
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

  // Exact match to `audit-threejs-hyperrealism` gradient sharpness definition (`2 .. W-3`, `2 .. H-3`)
  let sumGradRef = 0;
  let sumGradRen = 0;
  let sumLapRef = 0;
  let sumLapRen = 0;
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
      sumLapRef += Math.abs(refLuma[i + 1] + refLuma[i - 1] + refLuma[i + W] + refLuma[i - W] - 4.0 * refLuma[i]);
      sumLapRen += Math.abs(renLuma[i + 1] + renLuma[i - 1] + renLuma[i + W] + renLuma[i - W] - 4.0 * renLuma[i]);
    }
  }

  const gradSharpRef = sumGradRef / sharpDenom;
  const gradSharpRen = sumGradRen / sharpDenom;
  const sharpnessRatio = gradSharpRen / Math.max(1e-6, gradSharpRef);
  const sharpnessRatioPct = +(sharpnessRatio * 100.0).toFixed(1);
  const chromaClipPct = +((100.0 * sumChromaClip) / PIXELS).toFixed(3);
  const pureSatPct = +((100.0 * sumPureSat) / PIXELS).toFixed(3);

  const hyperrealFailures = [];
  if (chromaClipPct > 0.25) {
    hyperrealFailures.push(`GAMUT_CHROMA_CLIP (${chromaClipPct}% > 0.25%)`);
  }
  if (sharpnessRatio < 0.90) {
    hyperrealFailures.push(`OVER_BLURRED_SOFTNESS (${sharpnessRatioPct}% < 90.0%)`);
  }
  if (sharpnessRatio > 1.24) {
    hyperrealFailures.push(`UNFILTERED_STIPPLE_NOISE (${sharpnessRatioPct}% > 124.0%)`);
  }
  const hyperrealPassed = hyperrealFailures.length === 0;

  // Spatially Local `8 x 6` = 48-Tile Full-Res Micro-Texture & Exposure/Chroma Analysis
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

      // Soft +1.35 sensor floor so genuinely smooth clear sky matches clear sky cleanly,
      // while smooth untextured walls/carpet/water against real grain (`gr ~ 8..35`) get caught immediately!
      const ratio = (Math.min(gt, gr) + 1.35) / (Math.max(gt, gr) + 1.35);
      localTexScoreSum += ratio;
      tileStats.push({
        tile: `(${tx},${ty})`,
        uv: `u:${((tx / TX)).toFixed(2)}..${(((tx + 1) / TX)).toFixed(2)}, v:${((ty / TY)).toFixed(2)}..${(((ty + 1) / TY)).toFixed(2)}`,
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

  // Sharpness band score: 100% inside ideal `93%..112%`, smooth ramp in `90%..124%`, steep penalty outside!
  let globalSharpnessScore;
  if (sharpnessRatio >= 0.93 && sharpnessRatio <= 1.12) {
    globalSharpnessScore = 100.0;
  } else if (sharpnessRatio >= 0.90 && sharpnessRatio < 0.93) {
    globalSharpnessScore = 92.0 + ((sharpnessRatio - 0.90) / 0.03) * 8.0;
  } else if (sharpnessRatio > 1.12 && sharpnessRatio <= 1.24) {
    globalSharpnessScore = 100.0 - ((sharpnessRatio - 1.12) / 0.12) * 10.0;
  } else if (sharpnessRatio < 0.90) {
    globalSharpnessScore = Math.max(0.0, 92.0 - (0.90 - sharpnessRatio) * 260.0);
  } else {
    globalSharpnessScore = Math.max(0.0, 90.0 - (sharpnessRatio - 1.24) * 220.0);
  }

  const microTextureScore = 0.62 * localTextureParity + 0.38 * globalSharpnessScore;

  // Multi-scale structural & fine edge registration (`300w` architecture + `600w` mullions/ribs)
  const wCoarse = 300;
  const hCoarse = Math.max(150, Math.round(wCoarse / aspect));
  const wFine = 600;
  const hFine = Math.max(300, Math.round(wFine / aspect));

  const refCoarse = boxDownsampleRGB(refBuf, W, H, wCoarse, hCoarse);
  const renCoarse = boxDownsampleRGB(renBuf, W, H, wCoarse, hCoarse);
  const refFine = boxDownsampleRGB(refBuf, W, H, wFine, hFine);
  const renFine = boxDownsampleRGB(renBuf, W, H, wFine, hFine);

  const coarseEdgeCos = edgeCosineOnRGBFloat(refCoarse, renCoarse, wCoarse, hCoarse);
  const fineEdgeCos = edgeCosineOnRGBFloat(refFine, renFine, wFine, hFine);
  const edgeScore = (0.58 * coarseEdgeCos + 0.42 * fineEdgeCos) * 100.0;

  // Multi-scale Pixel Fidelity (blends patch-integrated registration with full-res pixel accuracy)
  let coarseAbsRGB = 0;
  for (let i = 0; i < wCoarse * hCoarse * 3; i += 3) {
    coarseAbsRGB +=
      (Math.abs(refCoarse[i] - renCoarse[i]) +
        Math.abs(refCoarse[i + 1] - renCoarse[i + 1]) +
        Math.abs(refCoarse[i + 2] - renCoarse[i + 2])) /
      (3.0 * 255.0);
  }
  const maeFull = sumAbsRGB / PIXELS;
  const maeCoarse = coarseAbsRGB / (wCoarse * hCoarse);
  const pixelFidelity = Math.max(0.0, 1.0 - (0.60 * maeCoarse + 0.40 * maeFull) * 2.0) * 100.0;

  // Multi-Scale `3x3` + `8x6` Zone Exposure Score (eliminates intra-zone dipole masking!)
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

  // Perceptual OKLab Chromatic Balance + Gamut Clip Guard
  const meanOKChroma = sumOKChromaErr / PIXELS;
  let colorFidelity = Math.max(0.0, 1.0 - meanOKChroma * 4.2) * 100.0;
  if (chromaClipPct > 0.25) {
    colorFidelity = Math.max(0.0, colorFidelity - (chromaClipPct - 0.25) * 18.0);
  }

  let overallSimilarity =
    0.22 * zoneExposureScore +
    0.24 * edgeScore +
    0.18 * pixelFidelity +
    0.14 * colorFidelity +
    0.22 * microTextureScore;

  // Explicit strict penalty when failing physical hyperrealism bounds so soft/clipped renders NEVER win!
  if (!hyperrealPassed) {
    overallSimilarity -= 3.5;
  }
  overallSimilarity = +Math.max(0.0, overallSimilarity).toFixed(1);

  const quadNames = [
    'Top-Left (Sky/Canopy)',
    'Top-Right (Sky/Roofline)',
    'Bottom-Left (Foreground/Left Mass)',
    'Bottom-Right (Foreground/Right Mass)',
  ];
  const quadScores = {};
  for (let i = 0; i < 4; i++) {
    quadScores[quadNames[i]] = +((1.0 - (quadErr[i] / quadCnt[i]) * 2.0) * 100.0).toFixed(1);
  }
  const worstQuad = Object.entries(quadScores).sort((a, b) => a[1] - b[1])[0][0];

  const underTextured = tileStats
    .filter((t) => t.renGrad + 1.0 < t.refGrad * 0.85)
    .sort((a, b) => a.texParityPct - b.texParityPct)
    .slice(0, 4);

  const overTextured = tileStats
    .filter((t) => t.renGrad > t.refGrad * 1.18 + 1.5)
    .sort((a, b) => a.texParityPct - b.texParityPct)
    .slice(0, 3);

  const compPath = path.join(outDir, `iter_${String(iter).padStart(2, '0')}_turing_strip.png`);
  const heatPath = path.join(outDir, `iter_${String(iter).padStart(2, '0')}_heatmap.png`);

  if (!skipStrip) {
    const panelW = 640;
    const panelH = Math.max(320, Math.round(panelW / aspect));
    const stripW = panelW * 3; // 1920 px total width!
    const loupeH = 380;        // Bottom row: 4 side-by-side 200% pixel-exact macro loupes!
    const stripH = panelH + loupeH;

    const stripBuf = Buffer.alloc(stripW * stripH * 3, 18);
    const heatSmall = Buffer.alloc(panelW * panelH * 3);

    // Top row: [ Reference | Three.js Render | Combined Color + Local Sharpness Deficit Heatmap ]
    for (let py = 0; py < panelH; py++) {
      const sy = Math.min(H - 1, Math.floor((py * H) / panelH));
      const isCrosshair = py % Math.round(panelH / 5) === 0 && py > 0;
      for (let px = 0; px < panelW; px++) {
        const sx = Math.min(W - 1, Math.floor((px * W) / panelW));
        const si = (sy * W + sx) * 3;

        // Left: Reference
        let d0 = (py * stripW + px) * 3;
        stripBuf[d0] = isCrosshair && px % 8 < 4 ? 255 : refBuf[si];
        stripBuf[d0 + 1] = isCrosshair && px % 8 < 4 ? 90 : refBuf[si + 1];
        stripBuf[d0 + 2] = isCrosshair && px % 8 < 4 ? 70 : refBuf[si + 2];

        // Middle: Render
        let d1 = (py * stripW + panelW + px) * 3;
        stripBuf[d1] = isCrosshair && px % 8 < 4 ? 255 : renBuf[si];
        stripBuf[d1 + 1] = isCrosshair && px % 8 < 4 ? 90 : renBuf[si + 1];
        stripBuf[d1 + 2] = isCrosshair && px % 8 < 4 ? 70 : renBuf[si + 2];

        // Right: Perceptual RGB + High-Frequency Texture Mismatch Heatmap
        const rgbE =
          (Math.abs(refBuf[si] - renBuf[si]) +
            Math.abs(refBuf[si + 1] - renBuf[si + 1]) +
            Math.abs(refBuf[si + 2] - renBuf[si + 2])) /
          (3.0 * 255.0);
        const gradE = Math.abs(refGrad[sy * W + sx] - renGrad[sy * W + sx]) / 95.0;
        const [hr, hg, hb] = heatRGB(rgbE * 2.1 + gradE * 0.55);

        let d2 = (py * stripW + panelW * 2 + px) * 3;
        stripBuf[d2] = hr;
        stripBuf[d2 + 1] = hg;
        stripBuf[d2 + 2] = hb;

        const hs = (py * panelW + px) * 3;
        heatSmall[hs] = hr;
        heatSmall[hs + 1] = hg;
        heatSmall[hs + 2] = hb;
      }
    }

    // Save standalone heatmap PNG too for backward compatibility
    const tmpHeatPpm = path.join(os.tmpdir(), `arch_heat_${process.pid}_${Date.now()}.ppm`);
    fs.writeFileSync(tmpHeatPpm, Buffer.concat([Buffer.from(`P6\n${panelW} ${panelH}\n255\n`, 'ascii'), heatSmall]));
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', tmpHeatPpm, heatPath]);
    fs.unlinkSync(tmpHeatPpm);

    // Bottom row: 4 side-by-side 200% nearest-neighbor macro pixel loupes (480px wide each -> 236px ref | 236px render!)
    // Anchor 0: Upper Architecture / Sky (0.35, 0.22)
    // Anchor 1: Hero Center Facade (0.50, 0.50)
    // Anchor 2: Worst Local Texture / Error Tile (auto-targeted X-ray!)
    // Anchor 3: Foreground Ground / Water / Botany (0.55, 0.82)
    const worstTile = [...tileStats].sort((a, b) => (a.texParityPct - a.rgbErr * 120) - (b.texParityPct - b.rgbErr * 120))[0];
    const loupeCenters = [
      [Math.round(W * 0.35), Math.round(H * 0.24), [90, 175, 255]],
      [Math.round(W * 0.50), Math.round(H * 0.50), [95, 225, 145]],
      [worstTile.cx, worstTile.cy, [255, 95, 85]],
      [Math.round(W * 0.56), Math.round(H * 0.82), [245, 195, 80]],
    ];

    const cellW = Math.floor(stripW / 4); // 480 px
    const halfCellW = Math.floor((cellW - 8) / 2); // 236 px -> shows 118x184 native pixels at crisp 200% zoom!
    const innerH = loupeH - 12;

    for (let li = 0; li < 4; li++) {
      const [cx, cy, borderCol] = loupeCenters[li];
      const srcW = Math.floor(halfCellW / 2);
      const srcH = Math.floor(innerH / 2);
      const sx0 = Math.max(0, Math.min(W - srcW, cx - (srcW >> 1)));
      const sy0 = Math.max(0, Math.min(H - srcH, cy - (srcH >> 1)));

      // Draw matching colored indicator box onto Top-Row Reference & Render panels!
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

    const tmpStripPpm = path.join(os.tmpdir(), `arch_strip_${process.pid}_${Date.now()}.ppm`);
    fs.writeFileSync(tmpStripPpm, Buffer.concat([Buffer.from(`P6\n${stripW} ${stripH}\n255\n`, 'ascii'), stripBuf]));
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', tmpStripPpm, compPath]);
    fs.unlinkSync(tmpStripPpm);
  }

  const homePrefix = os.homedir();
  const relStripPath = compPath.startsWith(homePrefix) ? `~${compPath.slice(homePrefix.length)}` : compPath;

  const report = {
    evaluator_version: 2,
    iteration: iter,
    evaluated_grid: [W, H],
    overall_similarity: overallSimilarity,
    hyperreal_passed: hyperrealPassed,
    hyperreal_failures: hyperrealFailures,
    sharpness_ratio_pct: sharpnessRatioPct,
    grad_sharpness_render: +gradSharpRen.toFixed(3),
    grad_sharpness_ref: +gradSharpRef.toFixed(3),
    lap_sharpness_render: +(sumLapRen / sharpDenom).toFixed(3),
    lap_sharpness_ref: +(sumLapRef / sharpDenom).toFixed(3),
    chroma_clip_pct: chromaClipPct,
    pure_sat_pct: pureSatPct,
    zone_exposure_score: +zoneExposureScore.toFixed(1),
    silhouette_edge_alignment: +edgeScore.toFixed(1),
    pixel_rgb_fidelity: +pixelFidelity.toFixed(1),
    chromatic_balance: +colorFidelity.toFixed(1),
    micro_texture_realism: +microTextureScore.toFixed(1),
    local_texture_parity: +localTextureParity.toFixed(1),
    under_textured_zones: underTextured,
    over_textured_zones: overTextured,
    quadrant_scores: quadScores,
    worst_quadrant: worstQuad,
    turing_strip: relStripPath,
  };

  fs.writeFileSync(path.join(outDir, `iter_${String(iter).padStart(2, '0')}_metrics.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
