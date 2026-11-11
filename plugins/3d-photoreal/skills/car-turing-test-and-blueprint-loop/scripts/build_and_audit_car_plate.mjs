#!/usr/bin/env node
/**
 * build_and_audit_car_plate.mjs — Automotive Three.js Classic-IIFE Bundler + Complete-3D & Blueprint Gate
 *
 * Usage:
 *   node build_and_audit_car_plate.mjs <plate_dir> <ref_jpg> [--blueprint-dir <bp_dir>] [--iter 1] [--strict]
 *   node build_and_audit_car_plate.mjs <plate_dir> --bundle-only
 *
 * Automatically:
 *   1. Bundles `car_nav_rig.js` + `src/main.js` into an x20 opaque-origin-safe classic IIFE (`dist/bundle.js`)
 *      with single-Three.js deduplication and zero-config aliases for all 5 `car-*` helper modules.
 *   2. Renders untouched Frame 0 (`renders/iter_XX_render.png`) at exact `<ref_jpg>` aspect ratio in
 *      Headless Chrome WebGL2 (`SwiftShader`) with strict orphan-Chrome hygiene.
 *   3. Audits 3D automotive volumetric bounds (`window.__CAR_GROUP__` W/L, H/L, ground contact `y ~ 0`).
 *   4. Captures 4-view metric Orthographic silhouettes (`renders/iter_XX_ortho_4view.png`) and evaluates
 *      thin-line or solid technical drawings (`renders/iter_XX_blueprint_overlay.png`) when `--blueprint-dir` is set.
 *   5. Captures 4-panel Class-A Studio Zebra Reflection-Stripe sheet (`renders/iter_XX_zebra_360.jpg`) and
 *      9-panel 360° Photorealistic Turntable (`renders/iter_XX_orbit_360.jpg`) + optional `iter_XX_multiview_sxs.jpg`.
 *   6. Runs `compare_car_core.mjs` (`1200xH` + 4 automotive `200%` loupes) and `~/.local/bin/audit-threejs-hyperrealism`.
 *   7. Locks `dist/latest_render.png` strictly to the highest-ranking hyperrealism-passing checkpoint.
 */

import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';

const home = os.homedir();

function scrubHomePaths(str) {
  return String(str).split(home).join('~');
}

function reapOrphanPuppeteerChromes() {
  try {
    if (!fs.existsSync('/proc')) return;
    for (const entry of fs.readdirSync('/proc')) {
      if (!/^\d+$/.test(entry)) continue;
      const pid = parseInt(entry, 10);
      try {
        const stat = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
        const rparen = stat.lastIndexOf(')');
        if (rparen < 0) continue;
        const fields = stat.slice(rparen + 2).split(' ');
        const ppid = parseInt(fields[1], 10);
        if (ppid !== 1) continue;
        const cmdline = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8');
        if (cmdline.includes('puppeteer_dev_chrome_profile-') || cmdline.includes('car_audit_chrome_')) {
          process.kill(pid, 'SIGKILL');
        }
      } catch {
        // process exited or unowned
      }
    }
  } catch {
    // ignore
  }
}

async function loadModule(relPath, pkgName) {
  const candidates = [
    path.join(home, 'photorealistic_3d_environment_templates/shared_deps/node_modules', relPath),
    path.join('/tmp/threejs_multi_agent_50/node_modules', relPath),
    path.join(home, '.gemini/config/node_modules', relPath),
    pkgName,
  ];
  for (const c of candidates) {
    try {
      return await import(c);
    } catch {
      // continue
    }
  }
  throw new Error(`Could not load ${pkgName}`);
}

function probeImageDims(imgPath) {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', imgPath],
    { encoding: 'utf8' },
  ).trim();
  const [w, h] = out.split('\n')[0].split('x').map((n) => parseInt(n, 10));
  return { width: w || 1200, height: h || 800 };
}

function startServer(distDir) {
  return new Promise((resolve) => {
    const mime = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    };
    const server = http.createServer((req, res) => {
      const reqUrl = (req.url || '/').split('?')[0];
      if (reqUrl === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
      }
      const p = path.join(distDir, reqUrl === '/' ? 'index.html' : reqUrl.replace(/^\/+/, ''));
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        res.writeHead(200, { 'Content-Type': mime[path.extname(p).toLowerCase()] || 'application/octet-stream' });
        res.end(fs.readFileSync(p));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, url: `http://127.0.0.1:${server.address().port}/index.html` });
    });
  });
}

function buildLabeledMontage(panels, cols, rows, cellW, cellH, outPath, bgHex = '#121418', fgHex = '#f1f5f9') {
  const mArgs = [];
  for (const p of panels) {
    mArgs.push('-label', p.label, p.path);
  }
  mArgs.push(
    '-tile',
    `${cols}x${rows}`,
    '-geometry',
    `${cellW}x${cellH}+6+6`,
    '-background',
    bgHex,
    '-fill',
    fgHex,
    '-pointsize',
    '14',
  );
  if (outPath.endsWith('.jpg') || outPath.endsWith('.jpeg')) {
    mArgs.push('-quality', '90');
  }
  mArgs.push(outPath);
  execFileSync('montage', mArgs, { stdio: 'ignore' });
}

function computeLightingInvariantEdgeAlignment(refPath, renPath) {
  try {
    const gw = 240;
    const gh = 160;
    const decodeGray = (p) =>
      spawnSync(
        'ffmpeg',
        ['-v', 'error', '-i', p, '-vf', `scale=${gw}:${gh}:flags=area`, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
        { maxBuffer: 8 * 1024 * 1024 },
      ).stdout;
    const a = decodeGray(refPath);
    const b = decodeGray(renPath);
    if (!a || !b || a.length < gw * gh || b.length < gw * gh) return null;
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let y = 1; y < gh - 1; y++) {
      for (let x = 1; x < gw - 1; x++) {
        const i = y * gw + x;
        const am = Math.hypot(a[i + 1] - a[i - 1], a[i + gw] - a[i - gw]);
        const bm = Math.hypot(b[i + 1] - b[i - 1], b[i + gw] - b[i - gw]);
        dot += am * bm;
        na += am * am;
        nb += bm * bm;
      }
    }
    return +((dot / Math.max(1e-6, Math.sqrt(na * nb))) * 100.0).toFixed(1);
  } catch {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const pos = [];
  let refArg = null;
  let blueprintDir = null;
  let iter = 1;
  let width = null;
  let height = null;
  let bundleOnly = false;
  let strictGate = false;
  let minStrictSimilarity = 78.0;
  let minStrictOrthoIoU = 0.88;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ref') refArg = args[++i];
    else if (args[i] === '--blueprint-dir') blueprintDir = path.resolve(args[++i]);
    else if (args[i] === '--iter') iter = parseInt(args[++i], 10);
    else if (args[i] === '--width') width = parseInt(args[++i], 10);
    else if (args[i] === '--height') height = parseInt(args[++i], 10);
    else if (args[i] === '--min-sim') minStrictSimilarity = parseFloat(args[++i]);
    else if (args[i] === '--min-iou') minStrictOrthoIoU = parseFloat(args[++i]);
    else if (args[i] === '--bundle-only') bundleOnly = true;
    else if (args[i] === '--strict') strictGate = true;
    else pos.push(args[i]);
  }

  const plateDir = pos[0] ? path.resolve(pos[0]) : null;
  const refJpg = refArg ? path.resolve(refArg) : pos[1] ? path.resolve(pos[1]) : null;
  if (!plateDir || (!refJpg && !bundleOnly)) {
    console.error(
      'Usage: node build_and_audit_car_plate.mjs <plate_dir> <ref_jpg> [--blueprint-dir <bp_dir>] [--iter N] [--width W] [--height H] [--bundle-only] [--strict]',
    );
    process.exit(1);
  }

  if (!bundleOnly && (!width || !height)) {
    const dims = probeImageDims(refJpg);
    width = width || 1200;
    height = height || Math.max(240, Math.round((width * dims.height) / Math.max(1, dims.width)));
  }

  const distDir = path.join(plateDir, 'dist');
  const rendersDir = path.join(plateDir, 'renders');
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(rendersDir, { recursive: true });

  if (refJpg && fs.existsSync(refJpg)) {
    fs.copyFileSync(refJpg, path.join(distDir, 'ref.jpg'));
  }

  const esbuild = await loadModule('esbuild/lib/main.js', 'esbuild');
  const candidateNodePaths = [
    path.join(plateDir, 'node_modules'),
    path.resolve(plateDir, '..', 'node_modules'),
    path.resolve(plateDir, '..', '..', 'node_modules'),
    path.join(home, 'photorealistic_3d_environment_templates/shared_deps/node_modules'),
    '/tmp/threejs_multi_agent_50/node_modules',
    path.join(home, '.gemini/config/node_modules'),
  ];
  const nodePaths = candidateNodePaths.filter((p, idx) => candidateNodePaths.indexOf(p) === idx && fs.existsSync(p));
  const threeNodeDir = nodePaths.find((p) => fs.existsSync(path.join(p, 'three', 'package.json')));
  const threeResolveDir = threeNodeDir ? path.dirname(threeNodeDir) : plateDir;
  const threePkgVer = threeNodeDir
    ? JSON.parse(fs.readFileSync(path.join(threeNodeDir, 'three', 'package.json'), 'utf8')).version
    : 'unknown';

  const skillsRoot = path.join(home, '.gemini/config/skills');
  const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
  const helperMap = [
    [/car_surface_kernel\.js$/, path.join(skillsRoot, 'car-class-a-surfacing-and-proportions/scripts/car_surface_kernel.js')],
    [/car_materials_and_optics\.js$/, path.join(skillsRoot, 'car-paint-glazing-and-lamp-optics/scripts/car_materials_and_optics.js')],
    [/car_studio_and_env\.js$/, path.join(skillsRoot, 'car-studio-scrims-and-env-lighting/scripts/car_studio_and_env.js')],
    [/car_hyperreal_optics\.js$/, path.join(scriptsDir, 'car_hyperreal_optics.js')],
    [/car_nav_rig\.js$/, path.join(scriptsDir, 'car_nav_rig.js')],
  ];
  const navRigPath = path.join(scriptsDir, 'car_nav_rig.js');

  const singleThreeAndHelpersPlugin = {
    name: 'car-single-three-and-helpers',
    setup(build) {
      for (const [regex, targetPath] of helperMap) {
        build.onResolve({ filter: regex }, () => ({ path: targetPath }));
      }
      build.onResolve({ filter: /^three(\/.*)?$/ }, async (resolveArgs) => {
        if (resolveArgs.pluginData && resolveArgs.pluginData.skipDedupe) return null;
        return build.resolve(resolveArgs.path, {
          resolveDir: threeResolveDir,
          kind: resolveArgs.kind,
          pluginData: { skipDedupe: true },
        });
      });
    },
  };

  await esbuild.build({
    stdin: {
      contents: `import * as __THREE_META__ from 'three';\nif (typeof window !== 'undefined') {\n  window.__BUILD_META__ = Object.assign(window.__BUILD_META__ || {}, { threeRevision: __THREE_META__.REVISION, threeVersion: ${JSON.stringify(threePkgVer)} });\n}\nimport ${JSON.stringify(navRigPath)};\nimport './src/main.js';\n`,
      resolveDir: plateDir,
      sourcefile: '__car_3d_entry__.js',
    },
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    outfile: path.join(distDir, 'bundle.js'),
    nodePaths,
    plugins: [singleThreeAndHelpersPlugin],
  });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="data:," />
  <title>3D Automotive Reconstruction</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #101216; overflow: hidden; display: grid; place-items: center; }
    canvas { grid-area: 1 / 1; display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="stage"></canvas>
  <script>
    new MutationObserver(() => {
      const cs = document.querySelectorAll('canvas');
      if (cs.length > 1) {
        const s = document.getElementById('stage');
        if (s && cs[cs.length - 1] !== s) s.style.display = 'none';
      }
    }).observe(document.body, { childList: true });
  </script>
  <script defer src="bundle.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(distDir, 'index.html'), html);

  if (bundleOnly) {
    console.log(`Bundled x20-safe 3D automotive scene -> ${scrubHomePaths(path.join(distDir, 'bundle.js'))}`);
    return;
  }

  reapOrphanPuppeteerChromes();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'car_audit_chrome_'));
  const tmpOrthoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'car_ortho_views_'));

  const puppeteer = await loadModule('puppeteer-core/lib/esm/puppeteer/puppeteer-core.js', 'puppeteer-core');
  const { server, url } = await startServer(distDir);

  const iterStr = String(iter).padStart(2, '0');
  const renderPng = path.join(rendersDir, `iter_${iterStr}_render.png`);
  const orthoSheetPng = path.join(rendersDir, `iter_${iterStr}_ortho_4view.png`);
  const zebraSheetJpg = path.join(rendersDir, `iter_${iterStr}_zebra_360.jpg`);
  const orbitSheetJpg = path.join(rendersDir, `iter_${iterStr}_orbit_360.jpg`);
  const multiviewSheetJpg = path.join(rendersDir, `iter_${iterStr}_multiview_sxs.jpg`);
  const carAuditJsonPath = path.join(rendersDir, `iter_${iterStr}_car_3d_audit.json`);

  const errors = [];
  let vehicleMetrics = null;
  const orthoMeta = {};
  const secondaryDiagnostics = [];
  const tmpCleanupFiles = [];

  const ORTHO_VIEWS = [
    { key: 'side', label: 'ORTHO SIDE (+X -> -X)' },
    { key: 'front', label: 'ORTHO FRONT (+Z -> -Z)' },
    { key: 'rear', label: 'ORTHO REAR (-Z -> +Z)' },
    { key: 'top', label: 'ORTHO TOP (+Y PLAN)' },
  ];

  const ZEBRA_VIEWS = [
    { key: 'zb_f34', label: 'ZEBRA 35 deg FRONT 3/4', az: 35, el: 15, dist: 1.0 },
    { key: 'zb_side', label: 'ZEBRA 90 deg PROFILE', az: 90, el: 10, dist: 1.04 },
    { key: 'zb_r34', label: 'ZEBRA 145 deg REAR 3/4', az: 145, el: 16, dist: 1.0 },
    { key: 'zb_crown', label: 'ZEBRA 25 deg ROOF/HOOD CROWN', az: 25, el: 44, dist: 1.05 },
  ];

  const TURNTABLE_VIEWS = [
    { key: 'az_000', label: '0 deg FRONT ELEVATION', az: 0, el: 12, dist: 0.92 },
    { key: 'az_040', label: '40 deg FRONT-LEFT 3/4', az: 40, el: 14, dist: 1.0 },
    { key: 'az_090', label: '90 deg LEFT PROFILE', az: 90, el: 10, dist: 1.05 },
    { key: 'az_140', label: '140 deg REAR-LEFT 3/4', az: 140, el: 15, dist: 1.0 },
    { key: 'az_180', label: '180 deg REAR ELEVATION', az: 180, el: 12, dist: 0.92 },
    { key: 'az_220', label: '220 deg REAR-RIGHT 3/4', az: 220, el: 15, dist: 1.0 },
    { key: 'az_270', label: '270 deg RIGHT PROFILE', az: 270, el: 10, dist: 1.05 },
    { key: 'az_320', label: '320 deg FRONT-RIGHT 3/4', az: 320, el: 14, dist: 1.0 },
    { key: 'overhead', label: '38 deg COCKPIT / OVERHEAD 3D', az: 35, el: 38, dist: 1.04 },
  ];

  let browser = null;
  try {
    browser = await puppeteer.default.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: 'new',
      userDataDir,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-component-update',
        '--disable-background-networking',
        '--disable-features=OptimizationGuideModelDownloading,OptimizationHintsFetching',
        '--enable-webgl',
        '--ignore-gpu-blocklist',
        '--use-gl=angle',
        '--use-angle=swiftshader',
        `--window-size=${width},${height}`,
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
      window.addEventListener('error', (ev) => {
        window.__RENDER_FAILED__ = ev.message || String(ev.error || 'Runtime error');
      });
      window.addEventListener('unhandledrejection', (ev) => {
        window.__RENDER_FAILED__ = String(ev.reason || 'Unhandled rejection');
      });
    });
    page.on('console', (m) => {
      if (m.type() === 'error') {
        const msg = m.text();
        errors.push(msg);
        console.error('[Browser Console Error]', msg);
      }
    });
    page.on('pageerror', (e) => {
      const msg = e.stack || e.message || String(e);
      errors.push(msg);
      console.error('[Browser Page Error]', msg);
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForFunction(
      () => window.__RENDER_READY__ === true || Boolean(window.__RENDER_FAILED__),
      { timeout: 60000 },
    );
    const renderFailed = await page.evaluate(() => window.__RENDER_FAILED__ || null);
    if (renderFailed) {
      throw new Error(`Browser scene initialization failed: ${renderFailed}`);
    }
    await new Promise((r) => setTimeout(r, 120));

    // 1. Capture bit-exact Frame-0 Hero render
    await page.screenshot({ path: renderPng });

    // 2. Wait for `car_nav_rig.js` installation & query 3D vehicle dimensional metrics
    await page.waitForFunction(() => Boolean(window.__CAR_RIG__ && window.__CAR_RIG__.getVehicleMetrics), {
      timeout: 8000,
    });
    vehicleMetrics = await page.evaluate(() => window.__CAR_RIG__.getVehicleMetrics());

    // 3. Switch to fast 640x400 panel viewport for 4-view Ortho, 4-view Zebra, and 9-view 360° Turntable
    const pw = 640;
    const ph = 400;
    await page.setViewport({ width: pw, height: ph, deviceScaleFactor: 1 });
    await page.evaluate((w, h) => window.__CAR_RIG__.setViewportSize(w, h), pw, ph);

    const orthoPanels = [];
    for (const ov of ORTHO_VIEWS) {
      const meta = await page.evaluate((vKey) => window.__CAR_RIG__.renderOrthographicView(vKey), ov.key);
      orthoMeta[ov.key] = meta;
      const pFile = path.join(tmpOrthoDir, `ortho_${ov.key}.png`);
      await page.screenshot({ path: pFile });
      orthoPanels.push({ path: pFile, label: ov.label });
    }
    buildLabeledMontage(orthoPanels, 2, 2, pw, ph, orthoSheetPng, '#e2e8f0', '#0f172a');

    const zebraPanels = [];
    for (const zv of ZEBRA_VIEWS) {
      await page.evaluate(
        (az, el, dist) => window.__CAR_RIG__.renderTurntableAzimuth(az, el, dist, true),
        zv.az,
        zv.el,
        zv.dist,
      );
      const zFile = path.join(rendersDir, `_tmp_iter_${iterStr}_${zv.key}.png`);
      tmpCleanupFiles.push(zFile);
      await page.screenshot({ path: zFile });
      zebraPanels.push({ path: zFile, label: zv.label });
    }
    buildLabeledMontage(zebraPanels, 2, 2, pw, ph, zebraSheetJpg);

    const orbitPanels = [];
    for (const tv of TURNTABLE_VIEWS) {
      await page.evaluate(
        (az, el, dist) => window.__CAR_RIG__.renderTurntableAzimuth(az, el, dist, false),
        tv.az,
        tv.el,
        tv.dist,
      );
      const tFile = path.join(rendersDir, `_tmp_iter_${iterStr}_${tv.key}.png`);
      tmpCleanupFiles.push(tFile);
      await page.screenshot({ path: tFile });
      orbitPanels.push({ path: tFile, label: tv.label });
    }
    buildLabeledMontage(orbitPanels, 3, 3, pw, ph, orbitSheetJpg);

    // 4. Optional Secondary Reference Perspectives (`window.__CAR_CAMERAS__`)
    const secSpecs = await page.evaluate(() =>
      ((window.__CAR_CAMERAS__ && Array.isArray(window.__CAR_CAMERAS__)) ? window.__CAR_CAMERAS__ : []).map((c, idx) => ({
        idx,
        name: c.name || `VIEW ${idx + 2}`,
        refPhoto: c.refPhoto || `angle_0${idx + 2}.jpg`,
      })),
    );

    if (secSpecs.length > 0) {
      const sxsPanels = [
        { path: refJpg, label: 'VIEW 1 REF (HERO)' },
        { path: renderPng, label: 'VIEW 1 3D RENDER' },
      ];
      for (const sp of secSpecs) {
        const candRef = path.isAbsolute(sp.refPhoto)
          ? sp.refPhoto
          : fs.existsSync(path.join(plateDir, sp.refPhoto))
            ? path.join(plateDir, sp.refPhoto)
            : path.join(distDir, sp.refPhoto);
        let vw = 960;
        let vh = 640;
        if (fs.existsSync(candRef)) {
          const d = probeImageDims(candRef);
          vw = 960;
          vh = Math.max(240, Math.round((vw * d.height) / Math.max(1, d.width)));
        }
        await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1 });
        await page.evaluate((w, h, i) => {
          window.__CAR_RIG__.setViewportSize(w, h);
          window.__CAR_RIG__.renderSecondaryCamera(i);
        }, vw, vh, sp.idx);
        const secPng = path.join(rendersDir, `iter_${iterStr}_view_0${sp.idx + 2}_render.png`);
        await page.screenshot({ path: secPng });
        const edgePct = fs.existsSync(candRef) ? computeLightingInvariantEdgeAlignment(candRef, secPng) : null;
        secondaryDiagnostics.push({
          view: sp.idx + 2,
          name: sp.name,
          resolution: [vw, vh],
          lighting_invariant_edge_alignment_pct: edgePct,
        });
        if (fs.existsSync(candRef)) {
          sxsPanels.push({ path: candRef, label: `${sp.name} REF` });
          sxsPanels.push({ path: secPng, label: `${sp.name} 3D RENDER` });
        }
      }
      if (sxsPanels.length >= 4) {
        buildLabeledMontage(sxsPanels, 2, Math.ceil(sxsPanels.length / 2), 640, 420, multiviewSheetJpg);
      }
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
    server.close();
    for (const f of tmpCleanupFiles) {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      } catch {
        // ignore
      }
    }
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  if (errors.length > 0) {
    try {
      fs.rmSync(tmpOrthoDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
    console.error('WebGL / Console Errors:', errors);
    process.exit(1);
  }

  // Evaluate Hero Turing Parity + Optional 4-View Blueprint Silhouette IoU
  const compareCore = path.join(scriptsDir, 'compare_car_core.mjs');
  const compareArgs = [compareCore, refJpg, renderPng, '--out', rendersDir, '--iter', String(iter)];
  if (blueprintDir && fs.existsSync(blueprintDir)) {
    compareArgs.push('--blueprint-dir', blueprintDir, '--ortho-dir', tmpOrthoDir);
  }
  let compareStdout = '';
  try {
    compareStdout = execFileSync('node', compareArgs, { encoding: 'utf8' });
  } finally {
    try {
      fs.rmSync(tmpOrthoDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  // Run official Spatio-Temporal Hyperrealism Verifier (`iter_XX_hyperreal_diag.jpg`)
  const auditBin = path.join(home, '.local/bin/audit-threejs-hyperrealism');
  const diagJpg = path.join(rendersDir, `iter_${iterStr}_hyperreal_diag.jpg`);
  const diagJson = path.join(rendersDir, `iter_${iterStr}_hyperreal.json`);
  const auditRes = spawnSync(
    auditBin,
    [renderPng, '--ref', refJpg, '--out', diagJpg, '--json', diagJson, '--strict'],
    { encoding: 'utf8' },
  );
  if (fs.existsSync(diagJson)) {
    fs.writeFileSync(diagJson, scrubHomePaths(fs.readFileSync(diagJson, 'utf8')));
  }

  // Volumetric, Anatomical Closure & Dielectric Glazing Sanity Gate
  const volFailures = [];
  if (!vehicleMetrics || !vehicleMetrics.valid) {
    volFailures.push('EMPTY_CAR_BOUNDS: window.__CAR_GROUP__ / scene produced zero vehicle meshes');
  } else {
    if (!vehicleMetrics.hasExplicitCarGroup) {
      volFailures.push('MISSING_CAR_GROUP_HANDLE: register root vehicle Group on window.__CAR_GROUP__');
    }
    if (vehicleMetrics.widthToLength < 0.30 || vehicleMetrics.widthToLength > 0.62) {
      volFailures.push(`NON_AUTOMOTIVE_WIDTH_RATIO: W/L=${vehicleMetrics.widthToLength} outside [0.30, 0.62]`);
    }
    if (vehicleMetrics.heightToLength < 0.19 || vehicleMetrics.heightToLength > 0.58) {
      volFailures.push(`NON_AUTOMOTIVE_HEIGHT_RATIO: H/L=${vehicleMetrics.heightToLength} outside [0.19, 0.58]`);
    }
    if (Math.abs(vehicleMetrics.groundContactMinY) > 0.045) {
      volFailures.push(
        `UNGROUNDED_TIRES: minY=${vehicleMetrics.groundContactMinY}m deviates > 45mm from y=0 contact datum`,
      );
    }
    if ((vehicleMetrics.glassMeshCount ?? 0) < 2) {
      volFailures.push('MISSING_GLAZING: vehicle must include separate dielectric glass panes (carRole="glass")');
    }
    if ((vehicleMetrics.chalkyGlassCount ?? 0) > 0) {
      volFailures.push(
        `CHALKY_LAMBERTIAN_GLASS: ${vehicleMetrics.chalkyGlassCount} glass material(s) have non-black diffuse color (set color=0x000000 on dielectric glass)`,
      );
    }
    if ((vehicleMetrics.cabinMeshCount ?? 0) < 2) {
      volFailures.push('EMPTY_GREENHOUSE_CABIN: model 3D seats, dashboard, and steering wheel inside cabin');
    }
    if ((vehicleMetrics.frontClosureRatio ?? 1.0) < 0.72) {
      volFailures.push(
        `OPEN_FRONT_FASCIA: front raycast closure=${vehicleMetrics.frontClosureRatio} < 0.72 (missing front bumper/grille closure)`,
      );
    }
    if ((vehicleMetrics.rearClosureRatio ?? 1.0) < 0.72) {
      volFailures.push(
        `OPEN_REAR_FASCIA: rear raycast closure=${vehicleMetrics.rearClosureRatio} < 0.72 (hollow rear cave / missing rear bumper & valence)`,
      );
    }
    if ((vehicleMetrics.sideDloGlassHits ?? 0) < 2) {
      volFailures.push(
        `OPAQUE_SIDE_DLO: transverse side-window raycasts hit ${vehicleMetrics.sideDloGlassHits} glass panes (do not pinch opaque body skin into side window troughs)`,
      );
    }
  }
  const volumetricPassed = volFailures.length === 0;

  const carAuditSummary = {
    iteration: iter,
    volumetric_passed: volumetricPassed,
    volumetric_failures: volFailures,
    vehicle_metrics: vehicleMetrics,
    orthographic_views: orthoMeta,
    secondary_views: secondaryDiagnostics,
    artifacts: {
      hero_render: scrubHomePaths(renderPng),
      ortho_4view: scrubHomePaths(orthoSheetPng),
      zebra_360: scrubHomePaths(zebraSheetJpg),
      orbit_360: scrubHomePaths(orbitSheetJpg),
      hyperreal_diag: scrubHomePaths(diagJpg),
    },
  };
  fs.writeFileSync(carAuditJsonPath, JSON.stringify(carAuditSummary, null, 2));

  // Lock `dist/latest_render.png` strictly to best hyperrealism-passing checkpoint
  let bestRank = -Infinity;
  let bestPng = renderPng;
  for (const fn of fs.readdirSync(rendersDir).sort()) {
    const m = fn.match(/^iter_(\d+)_metrics\.json$/);
    if (!m) continue;
    const data = JSON.parse(fs.readFileSync(path.join(rendersDir, fn), 'utf8'));
    const cand = path.join(rendersDir, `iter_${m[1]}_render.png`);
    if (!fs.existsSync(cand)) continue;
    const v2Bonus = (data.evaluator_version || 1) >= 2 ? 2000.0 : 0.0;
    const passBonus = data.hyperreal_passed === true ? 1000.0 : 0.0;
    const bpBonus =
      data.blueprint_verification && typeof data.blueprint_verification.mean_ortho_iou === 'number'
        ? data.blueprint_verification.mean_ortho_iou * 50.0
        : 0.0;
    const rank = v2Bonus + passBonus + bpBonus + (data.overall_similarity || 0);
    if (rank >= bestRank) {
      bestRank = rank;
      bestPng = cand;
    }
  }
  fs.copyFileSync(bestPng, path.join(distDir, 'latest_render.png'));

  console.log(compareStdout.trim());
  if (auditRes.stdout) console.log(scrubHomePaths(auditRes.stdout.trim()));
  console.log(
    `[${volumetricPassed ? 'PASS' : 'FAIL'}] 3D Vehicle Bounds: L=${vehicleMetrics?.lengthMeters}m W=${vehicleMetrics?.widthMeters}m H=${vehicleMetrics?.heightMeters}m (minY=${vehicleMetrics?.groundContactMinY}m)`,
  );
  if (volFailures.length > 0) {
    for (const vf of volFailures) console.error(`  -> ${vf}`);
  }

  const iterMetricsPath = path.join(rendersDir, `iter_${iterStr}_metrics.json`);
  const iterData = fs.existsSync(iterMetricsPath)
    ? JSON.parse(fs.readFileSync(iterMetricsPath, 'utf8'))
    : {};
  const iterSim = iterData.overall_similarity || 0;
  const meanOrthoIoU = iterData.blueprint_verification?.mean_ortho_iou ?? null;

  if (strictGate) {
    if (auditRes.status !== 0 || !volumetricPassed) {
      process.exit(1);
    }
    if (iterSim < minStrictSimilarity) {
      console.error(
        `[FAIL] STRICT_PARITY_FLOOR: overall_similarity=${iterSim.toFixed(1)}% < ${minStrictSimilarity.toFixed(1)}%`,
      );
      process.exit(1);
    }
    if (meanOrthoIoU !== null && meanOrthoIoU < minStrictOrthoIoU) {
      console.error(
        `[FAIL] STRICT_BLUEPRINT_IOU_FLOOR: mean_ortho_iou=${meanOrthoIoU.toFixed(4)} < ${minStrictOrthoIoU.toFixed(2)}`,
      );
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
