#!/usr/bin/env node
/**
 * build_and_render_plate.mjs — Standard x20-safe Three.js bundler + Headless Chrome renderer + Full-Res Hyperrealism Gate
 *
 * Usage:
 *   node build_and_render_plate.mjs <plate_dir> <ref_jpg> [--iter 1] [--width 1200] [--height 800] [--strict]
 *   node build_and_render_plate.mjs <plate_dir> --bundle-only
 *
 * Automatically:
 *   1. Bundles `arch_nav_rig.js` + `src/main.js` (`single-three` dedupe, classic IIFE x20 opaque-origin safe).
 *   2. Renders Frame 0 at exact native `<ref_jpg>` aspect ratio in Headless Chrome WebGL2 (`SwiftShader`).
 *   3. Runs full-resolution `compare_arch_render.py` (`v2`: `1200xH` multi-scale + `8x6` local micro-texture + `200%` 4-zone loupes).
 *   4. Runs `~/.local/bin/audit-threejs-hyperrealism` (`iter_XX_hyperreal_diag.jpg` + `iter_XX_hyperreal.json`).
 *   5. Locks `dist/latest_render.png` strictly to the best hyperrealism-passing render (`hyperreal_passed === true` beats soft renders!).
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import os from 'os';
import { execFileSync, spawnSync } from 'child_process';

const home = os.homedir();

async function loadModule(relPath, pkgName) {
  const candidates = [
    path.join('/tmp/threejs_multi_agent_50/node_modules', relPath),
    path.join(home, 'photorealistic_3d_environment_templates/shared_deps/node_modules', relPath),
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

function startServer(distDir) {
  return new Promise((resolve) => {
    const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
    const server = http.createServer((req, res) => {
      const reqUrl = (req.url || '/').split('?')[0];
      if (reqUrl === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
      }
      const p = path.join(distDir, reqUrl === '/' ? 'index.html' : reqUrl);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'application/octet-stream' });
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

async function main() {
  const args = process.argv.slice(2);
  const pos = [];
  let refArg = null;
  let iter = 1;
  let width = null;
  let height = null;
  let bundleOnly = false;
  let strictGate = false;
  let minStrictSimilarity = 78.0;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ref') refArg = args[++i];
    else if (args[i] === '--iter') iter = parseInt(args[++i], 10);
    else if (args[i] === '--width') width = parseInt(args[++i], 10);
    else if (args[i] === '--height') height = parseInt(args[++i], 10);
    else if (args[i] === '--min-sim') minStrictSimilarity = parseFloat(args[++i]);
    else if (args[i] === '--bundle-only') bundleOnly = true;
    else if (args[i] === '--strict') strictGate = true;
    else pos.push(args[i]);
  }

  const plateDir = pos[0] ? path.resolve(pos[0]) : null;
  const refJpg = refArg ? path.resolve(refArg) : pos[1] ? path.resolve(pos[1]) : null;
  if (!plateDir || (!refJpg && !bundleOnly)) {
    console.error('Usage: node build_and_render_plate.mjs <plate_dir> <ref_jpg> [--iter N] [--width W] [--height H] [--bundle-only] [--strict]');
    process.exit(1);
  }

  if (!bundleOnly && (!width || !height)) {
    const ident = execFileSync('identify', ['-format', '%w %h', refJpg], { encoding: 'utf8' }).trim().split(/\s+/);
    const nw = parseInt(ident[0], 10) || 1200;
    const nh = parseInt(ident[1], 10) || 800;
    width = width || 1200;
    height = height || Math.round((width * nh) / nw);
  }

  const distDir = path.join(plateDir, 'dist');
  const rendersDir = path.join(plateDir, 'renders');
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(rendersDir, { recursive: true });

  if (refJpg && fs.existsSync(refJpg)) {
    fs.copyFileSync(refJpg, path.join(distDir, 'ref.jpg'));
  }

  const esbuild = await loadModule('esbuild/lib/main.js', 'esbuild');
  const nodePaths = [
    '/tmp/threejs_multi_agent_50/node_modules',
    path.join(home, 'photorealistic_3d_environment_templates/shared_deps/node_modules'),
    path.join(home, '.gemini/config/node_modules'),
  ].filter((p) => fs.existsSync(p));

  const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
  const navRigPath = path.join(scriptsDir, 'arch_nav_rig.js');
  const opticsPath = path.join(scriptsDir, 'arch_hyperreal_optics.js');
  const singleThreePlugin = {
    name: 'single-three',
    setup(build) {
      build.onResolve({ filter: /arch_hyperreal_optics\.js$/ }, () => ({ path: opticsPath }));
      build.onResolve({ filter: /arch_nav_rig\.js$/ }, () => ({ path: navRigPath }));
      build.onResolve({ filter: /^three(\/.*)?$/ }, async (resolveArgs) => {
        if (resolveArgs.pluginData && resolveArgs.pluginData.skipDedupe) return null;
        return build.resolve(resolveArgs.path, {
          resolveDir: plateDir,
          kind: resolveArgs.kind,
          pluginData: { skipDedupe: true },
        });
      });
    },
  };

  await esbuild.build({
    stdin: {
      contents: `import ${JSON.stringify(navRigPath)};\nimport './src/main.js';\n`,
      resolveDir: plateDir,
      sourcefile: '__arch_entry__.js',
    },
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    outfile: path.join(distDir, 'bundle.js'),
    nodePaths,
    plugins: [singleThreePlugin],
  });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="data:," />
  <title>Three.js Architectural Reconstruction</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #111; overflow: hidden; display: grid; place-items: center; }
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
    console.log(`Bundled interactive 3D WebGL scene -> ${path.join(distDir, 'bundle.js')}`);
    return;
  }

  const puppeteer = await loadModule('puppeteer-core/lib/esm/puppeteer/puppeteer-core.js', 'puppeteer-core');
  const { server, url } = await startServer(distDir);
  const browser = await puppeteer.default.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      `--window-size=${width},${height}`,
    ],
  });

  const iterStr = String(iter).padStart(2, '0');
  const renderPng = path.join(rendersDir, `iter_${iterStr}_render.png`);
  const errors = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForFunction(() => window.__RENDER_READY__ === true, { timeout: 35000 });
    await new Promise((r) => setTimeout(r, 120));

    await page.screenshot({ path: renderPng });
  } finally {
    await browser.close();
    server.close();
  }

  if (errors.length > 0) {
    console.error('WebGL/Console Errors:', errors);
    process.exit(1);
  }

  const compareCore = path.join(scriptsDir, 'compare_arch_core.mjs');
  const out = execFileSync('node', [compareCore, refJpg, renderPng, '--out', rendersDir, '--iter', String(iter)], { encoding: 'utf8' });

  // Also emit official `audit-threejs-hyperrealism` 3-row diagnostic plate (`iter_XX_hyperreal_diag.jpg`)
  const auditBin = path.join(home, '.local/bin/audit-threejs-hyperrealism');
  const diagJpg = path.join(rendersDir, `iter_${iterStr}_hyperreal_diag.jpg`);
  const diagJson = path.join(rendersDir, `iter_${iterStr}_hyperreal.json`);
  const auditRes = spawnSync(auditBin, [renderPng, '--ref', refJpg, '--out', diagJpg, '--json', diagJson, '--strict'], { encoding: 'utf8' });
  if (fs.existsSync(diagJson)) {
    const cleaned = fs.readFileSync(diagJson, 'utf8').split(home).join('~');
    fs.writeFileSync(diagJson, cleaned);
  }

  // Sync `dist/latest_render.png`: hyperrealism-passing v2 checkpoints strictly beat legacy v1 or soft renders!
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
    const rank = v2Bonus + passBonus + (data.overall_similarity || 0);
    if (rank >= bestRank) {
      bestRank = rank;
      bestPng = cand;
    }
  }
  fs.copyFileSync(bestPng, path.join(distDir, 'latest_render.png'));
  console.log(out);
  if (auditRes.stdout) console.log(auditRes.stdout.trim());

  const iterMetricsPath = path.join(rendersDir, `iter_${iterStr}_metrics.json`);
  const iterSim = fs.existsSync(iterMetricsPath)
    ? (JSON.parse(fs.readFileSync(iterMetricsPath, 'utf8')).overall_similarity || 0)
    : 0;

  if (strictGate) {
    if (auditRes.status !== 0) {
      process.exit(1);
    }
    if (iterSim < minStrictSimilarity) {
      console.error(`[FAIL] STRICT_PARITY_FLOOR: overall_similarity=${iterSim.toFixed(1)}% < ${minStrictSimilarity.toFixed(1)}% (cannot pass --strict via noise sharpness alone)`);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
