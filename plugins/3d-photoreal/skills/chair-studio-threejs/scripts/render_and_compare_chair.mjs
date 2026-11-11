#!/usr/bin/env node
/**
 * render_and_compare_chair.mjs -- Zero-NPM-Dep Headless Chrome CDP Studio Chair Renderer & Parity Evaluator
 *
 * Uses local `/usr/bin/google-chrome` + Node 22 native WebSocket CDP (zero puppeteer dependency):
 *   1. Serves the compiled `viewer/dist` single-file Golden Template build on ephemeral `127.0.0.1` HTTP.
 *   2. Renders `?renderMode=chairA&day=<dayId>` at exact `<reference.jpg>` native aspect `[1200, H]`.
 *   3. Renders `?renderMode=chairB&day=<dayId>` (Today's Original Chair on identical white cyclorama + soft shadow).
 *   4. Invokes `arch-turing-test-loop/scripts/compare_arch_core.mjs` to score 1:1 parity of Chair A vs Reference.
 *   5. Stitches a crisp 3-panel Studio Triptych (`Reference Photo` | `1:1 Procedural Three.js` | `Original Chair`).
 */

import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const CHROME_CANDIDATES = [
  '/opt/google/chrome/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No Chrome binary found');
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

function startStaticServer(rootDir) {
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.json': 'application/json',
  };
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = (req.url || '/').split('?')[0];
      if (urlPath === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
      }
      const filePath = path.join(rootDir, urlPath === '/' ? 'index.html' : urlPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
        res.end(fs.readFileSync(filePath));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function connectCDP(debugPort) {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((r) => r.json());
      const pageTarget = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) {
        const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
        await new Promise((res, rej) => {
          ws.addEventListener('open', res, { once: true });
          ws.addEventListener('error', rej, { once: true });
        });
        let seq = 1;
        const pending = new Map();
        ws.addEventListener('message', (ev) => {
          const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
          if (msg.id && pending.has(msg.id)) {
            const { resolve, reject } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) reject(new Error(msg.error.message));
            else resolve(msg.result);
          }
        });
        const send = (method, params = {}) =>
          new Promise((resolve, reject) => {
            const id = seq++;
            pending.set(id, { resolve, reject });
            ws.send(JSON.stringify({ id, method, params }));
          });
        return { ws, send };
      }
    } catch {
      // wait for Chrome debug endpoint
    }
    await sleep(150);
  }
  throw new Error('Timed out connecting to Headless Chrome CDP');
}

async function capturePose(send, targetUrl, width, height, outPng) {
  await send('Runtime.evaluate', {
    expression: 'window.__CHAIR_RENDER_READY__ = false;',
  }).catch(() => {});
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: targetUrl });
  await sleep(320);

  for (let i = 0; i < 80; i++) {
    const evalRes = await send('Runtime.evaluate', {
      expression:
        'Boolean(window.location.href !== "about:blank" && (window.__CHAIR_RENDER_READY__ === true || document.querySelectorAll("canvas").length >= 2))',
      returnByValue: true,
    });
    if (evalRes?.result?.value === true) break;
    await sleep(120);
  }
  await sleep(220);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outPng, Buffer.from(shot.data, 'base64'));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(
      'Usage: node render_and_compare_chair.mjs --viewer-dir <dir> --day-dir <dir> [--day-id <slug>] [--iter 1]'
    );
    return;
  }

  let viewerDir = '/usr/local/google/home/jfesta/chairs/viewer';
  let dayDir = null;
  let dayId = '';
  let iter = 1;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--viewer-dir') viewerDir = path.resolve(args[++i]);
    else if (args[i] === '--day-dir') dayDir = path.resolve(args[++i]);
    else if (args[i] === '--day-id') dayId = args[++i];
    else if (args[i] === '--iter') iter = parseInt(args[++i], 10);
  }

  if (!dayDir) {
    throw new Error('--day-dir is required');
  }
  if (!dayId) {
    dayId = path.basename(dayDir);
  }

  const refJpg = path.join(dayDir, 'reference.jpg');
  const distDir = path.join(viewerDir, 'dist');
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error(`Viewer bundle missing at ${path.join(distDir, 'index.html')}; run vite build first.`);
  }

  const ident = execFileSync('identify', ['-format', '%w %h', refJpg], { encoding: 'utf8' })
    .trim()
    .split(/\s+/);
  const nw = parseInt(ident[0], 10) || 1200;
  const nh = parseInt(ident[1], 10) || 1200;
  const width = 1000;
  const height = Math.round((width * nh) / nw);

  const rendersDir = path.join(dayDir, 'renders');
  fs.mkdirSync(rendersDir, { recursive: true });

  const iterStr = String(iter).padStart(2, '0');
  const chairAPng = path.join(rendersDir, `iter_${iterStr}_chair_a.png`);
  const chairBPng = path.join(rendersDir, `iter_${iterStr}_chair_b.png`);
  const fullUiPng = path.join(rendersDir, `iter_${iterStr}_studio_ui.png`);

  const debugPort = await getFreePort();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chair_cdp_'));
  const { server, baseUrl } = await startStaticServer(distDir);

  const chrome = spawn(
    findChrome(),
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-extensions',
      '--disable-sync',
      '--no-first-run',
      '--no-default-browser-check',
      '--password-store=basic',
      '--use-mock-keychain',
      '--hide-scrollbars',
      '--mute-audio',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--proxy-bypass-list=127.0.0.1;localhost;<-loopback>',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=${width},${height}`,
      'about:blank',
    ],
    {
      stdio: ['ignore', 'ignore', 'pipe'],
      env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: '/dev/null' },
    }
  );

  await new Promise((resolve, reject) => {
    let errBuf = '';
    const t = setTimeout(
      () => reject(new Error(`Chrome startup timeout. Stderr:\n${errBuf}`)),
      15000
    );
    chrome.stderr.on('data', (chunk) => {
      errBuf += chunk.toString();
      if (errBuf.includes('DevTools listening on ws://')) {
        clearTimeout(t);
        resolve();
      }
    });
    chrome.on('exit', (code) => {
      clearTimeout(t);
      reject(new Error(`Chrome exited early (${code}):\n${errBuf}`));
    });
  });

  try {
    const { ws, send } = await connectCDP(debugPort);
    await send('Page.enable');
    await send('Runtime.enable');

    await capturePose(
      send,
      `${baseUrl}/index.html?renderMode=chairA&day=${encodeURIComponent(dayId)}`,
      width,
      height,
      chairAPng
    );
    await capturePose(
      send,
      `${baseUrl}/index.html?renderMode=chairB&day=${encodeURIComponent(dayId)}`,
      width,
      height,
      chairBPng
    );
    await capturePose(
      send,
      `${baseUrl}/index.html?day=${encodeURIComponent(dayId)}`,
      1440,
      900,
      fullUiPng
    );

    ws.close();
  } finally {
    chrome.kill('SIGKILL');
    server.close();
    await sleep(150);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // ignore transient child-process lock cleanup race
    }
  }

  // Run arch-turing-test-loop parity comparator on Chair A vs Reference Photo
  const compareCore = path.join(
    os.homedir(),
    'skills/arch-turing-test-loop/scripts/compare_arch_core.mjs'
  );
  let compareSummary = '';
  if (fs.existsSync(compareCore)) {
    compareSummary = execFileSync(
      process.execPath,
      [compareCore, refJpg, chairAPng, '--out', rendersDir, '--iter', String(iter)],
      { encoding: 'utf8' }
    );
  }

  // Stitch clean 3-panel Side-by-Side Triptych: Reference | 1:1 Three.js | Original Chair
  const triptychJpg = path.join(rendersDir, `iter_${iterStr}_side_by_side_triptych.jpg`);
  const tmpRef = path.join(rendersDir, `_tmp_ref_${iterStr}.png`);
  execFileSync('convert', [refJpg, '-resize', `${width}x${height}!`, tmpRef]);
  execFileSync('convert', [
    tmpRef,
    chairAPng,
    chairBPng,
    '+append',
    '-quality',
    '94',
    triptychJpg,
  ]);
  fs.rmSync(tmpRef, { force: true });

  fs.copyFileSync(chairAPng, path.join(dayDir, 'chair_a_latest.png'));
  fs.copyFileSync(chairBPng, path.join(dayDir, 'chair_b_latest.png'));
  fs.copyFileSync(triptychJpg, path.join(dayDir, 'triptych_latest.jpg'));

  if (compareSummary) console.log(compareSummary.trim());
  console.log(
    JSON.stringify(
      {
        chair_a_png: chairAPng,
        chair_b_png: chairBPng,
        studio_ui_png: fullUiPng,
        triptych_jpg: triptychJpg,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
