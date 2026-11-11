#!/usr/bin/env node
/**
 * Fast native full-length capture (Chrome DevTools "Capture full size screenshot").
 *
 * One Page.captureScreenshot call per surface with captureBeyondViewport=true and a clip equal to the
 * page's full CSS content size (Page.getLayoutMetrics) — no band scrolling or stitching.
 *
 * Usage:
 *   node capture_fullpage_native.mjs --url="https://www.cortea.ai/" --out-dir="/path/to/study" \
 *     [--desktop-dpr=2] [--mobile-dpr=2] [--derive=1]
 *
 * Outputs (2x masters + scaled-down copies derived from them, never re-captured):
 *   <out-dir>/captures/desktop-fullpage-native.png      (2x master: 1440 CSS wide x full page height)
 *   <out-dir>/captures/desktop-fullpage-native-1x.png   (derived 1x)
 *   <out-dir>/captures/mobile-fullpage-native.png       (2x master: 390 CSS wide x full page height)
 *   <out-dir>/captures/mobile-fullpage-native-1x.png    (derived 1x)
 */

import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const MAGICK = fs.existsSync('/usr/bin/magick') ? '/usr/bin/magick' : 'magick';
// Scaled-down copies derived from each master capture (comma list, e.g. --derive=1,0.5)
const DERIVE_SCALES = (process.argv.find((x) => x.startsWith('--derive=')) || '--derive=1')
  .slice('--derive='.length)
  .split(',')
  .map(Number)
  .filter((n) => n > 0);

const CHROME = ['/opt/google/chrome/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium']
  .find((p) => fs.existsSync(p));
const MAX_PHYS_H = 32000; // keep within ImageMagick / PNG tooling limits downstream
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DESKTOP_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

function arg(name, def) {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : def;
}

async function launch(profileDir) {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || '';
  const proc = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--disable-blink-features=AutomationControlled',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
    '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-background-networking',
    '--disable-extensions', '--disable-sync', '--no-first-run', '--no-default-browser-check',
    '--password-store=basic', '--use-mock-keychain', '--hide-scrollbars', '--mute-audio',
    '--ignore-certificate-errors', '--font-render-hinting=none', '--window-size=1440,900',
    ...(proxy ? [`--proxy-server=${proxy}`, '--proxy-bypass-list=127.0.0.1;localhost;<-loopback>'] : []),
    `--user-data-dir=${profileDir}`, '--remote-debugging-port=0', 'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: '/dev/null' } });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error('Chrome DevTools WS timeout:\n' + buf)), 15000);
    proc.stderr.on('data', (c) => {
      buf += c.toString();
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(t); resolve(m[1]); }
    });
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      for (const e of [...events]) e(msg);
    }
  };
  const send = (method, params = {}, sessionId, timeout = 60000) => new Promise((resolve, reject) => {
    const mid = ++id;
    const timer = setTimeout(() => { pending.delete(mid); reject(new Error(`timeout ${method}`)); }, timeout);
    pending.set(mid, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    ws.send(JSON.stringify(sessionId ? { id: mid, method, params, sessionId } : { id: mid, method, params }));
  });
  const waitEvent = (method, sessionId, timeout) => new Promise((resolve) => {
    const h = (msg) => {
      if (msg.method === method && (!sessionId || msg.sessionId === sessionId)) { done(); resolve(true); }
    };
    const done = () => { const i = events.indexOf(h); if (i >= 0) events.splice(i, 1); clearTimeout(t); };
    const t = setTimeout(() => { done(); resolve(false); }, timeout);
    events.push(h);
  });
  return { proc, ws, send, waitEvent };
}

async function captureSurface(cdp, url, outPng, { width, height, dpr, mobile, ua }) {
  const t0 = Date.now();
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  await cdp.send('Target.activateTarget', { targetId }).catch(() => null);
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Network.setUserAgentOverride', { userAgent: ua }, sessionId);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile }, sessionId);
  const domReady = cdp.waitEvent('Page.domContentEventFired', sessionId, 30000);
  const loaded = cdp.waitEvent('Page.loadEventFired', sessionId, 30000);
  // Page.navigate can hang on long-lived connections; treat it as fire-and-forget and rely on lifecycle events
  cdp.send('Page.navigate', { url }, sessionId, 30000).catch(() => null);
  const gotDom = await domReady;
  const gotLoad = await Promise.race([loaded, sleep(12000).then(() => false)]);
  console.log(`  [${mobile ? 'mobile' : 'desktop'}] domContentLoaded=${gotDom} load=${gotLoad} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  if (!gotDom) {
    // Diagnose: what is actually on screen / which URL committed?
    const hist = await cdp.send('Page.getNavigationHistory', {}, sessionId, 8000).catch(() => null);
    const cur = hist ? hist.entries[hist.currentIndex] : null;
    console.log(`  [diag] committed URL: ${cur ? cur.url : 'unknown'} title: ${cur ? cur.title : ''}`);
    const diag = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId, 15000).catch(() => null);
    if (diag?.data) {
      const p = outPng.replace(/\.png$/, '-diag.png');
      fs.writeFileSync(p, Buffer.from(diag.data, 'base64'));
      console.log(`  [diag] viewport screenshot: ${p}`);
    }
    throw new Error('Page did not load (see diag output)');
  }
  await sleep(1500);

  const ev = (expression, awaitPromise = false) =>
    cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }, sessionId).then((r) => r?.result?.value);

  // Visually hide cookie-consent / chat overlays so they don't cover the captured content (no consent is given)
  await ev(`(() => {
    const st = document.createElement('style');
    st.id = '__native_capture_clean__';
    st.textContent = '#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay, #onetrust-consent-sdk, .onetrust-pc-dark-filter, ' +
      '#usercentrics-root, #truste-consent-track, .cky-consent-container, .cky-overlay, #cookiescript_injected, ' +
      '[id*="cookie-banner" i], [class*="cookie-banner" i], [class*="CookieConsent" i], [aria-label*="cookie" i][role="dialog"], ' +
      '#intercom-container, .intercom-lightweight-app, #crisp-chatbox, [id*="hubspot-messages-iframe"] ' +
      '{ display: none !important; visibility: hidden !important; }';
    (document.head || document.documentElement).appendChild(st);
    document.documentElement.style.overflow = ''; document.body.style.overflow = '';
    return true;
  })()`);

  // Wait for fonts + images, then one fast scroll pass to trigger lazy-loading / reveal animations, back to top
  await ev(`(async () => {
    if (document.fonts) await document.fonts.ready;
    for (const im of document.querySelectorAll('img[loading="lazy"]')) im.loading = 'eager';
    const H = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    for (let y = 0; y < H(); y += Math.round(innerHeight * 0.8)) { scrollTo(0, y); await new Promise(r => setTimeout(r, 180)); }
    scrollTo(0, H()); await new Promise(r => setTimeout(r, 400));
    await Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 5000); })));
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 600));
    return H();
  })()`, true);

  const metrics = await cdp.send('Page.getLayoutMetrics', {}, sessionId);
  const cssW = Math.ceil(metrics.cssContentSize?.width || width);
  const cssH = Math.ceil(metrics.cssContentSize?.height || height);
  // Keep the physical height under the downstream ceiling by lowering the capture scale if needed
  const scale = Math.min(1, MAX_PHYS_H / (cssH * dpr));

  const shot = await cdp.send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: true, fromSurface: true, clip: { x: 0, y: 0, width: Math.min(cssW, width), height: cssH, scale } },
    sessionId,
    120000
  );
  fs.writeFileSync(outPng, Buffer.from(shot.data, 'base64'));
  await cdp.send('Target.closeTarget', { targetId }).catch(() => null);
  const physW = Math.round(Math.min(cssW, width) * dpr * scale);
  const physH = Math.round(cssH * dpr * scale);
  console.log(`  ${path.basename(outPng)}: ${physW}x${physH} px (CSS ${Math.min(cssW, width)}x${cssH}, dpr ${dpr}, scale ${scale.toFixed(3)}) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  // Derive scaled-down copies from the high-DPR master (e.g. 2x master -> 1x), never re-capturing
  const effective = dpr * scale;
  const derived = [];
  for (const target of DERIVE_SCALES) {
    if (target >= effective - 1e-6) continue;
    const pct = ((target / effective) * 100).toFixed(4);
    const dst = outPng.replace(/\.png$/, `-${String(target).replace('.', 'p')}x.png`);
    execFileSync(MAGICK, [outPng, '-filter', 'Lanczos', '-resize', `${pct}%`, '-strip', dst]);
    derived.push(path.basename(dst));
  }
  if (derived.length) console.log(`    derived: ${derived.join(', ')}`);
  return { physW, physH, cssH };
}

async function main() {
  let url = arg('url', '');
  const outDir = path.resolve(arg('out-dir', ''));
  if (!url || !outDir) {
    console.error('Usage: node capture_fullpage_native.mjs --url="https://..." --out-dir="/path/to/study" [--desktop-dpr=2] [--mobile-dpr=2]');
    process.exit(1);
  }
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (!CHROME) throw new Error('No Chrome/Chromium binary found');
  const capDir = path.join(outDir, 'captures');
  fs.mkdirSync(capDir, { recursive: true });

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-native-full-'));
  const cdp = await launch(profileDir);
  try {
    console.log(`[native full-page] ${url}`);
    await captureSurface(cdp, url, path.join(capDir, 'desktop-fullpage-native.png'), {
      width: 1440, height: 900, dpr: Number(arg('desktop-dpr', 2)), mobile: false, ua: DESKTOP_UA,
    });
    await captureSurface(cdp, url, path.join(capDir, 'mobile-fullpage-native.png'), {
      width: 390, height: 844, dpr: Number(arg('mobile-dpr', 2)), mobile: true, ua: MOBILE_UA,
    });
  } finally {
    try { cdp.ws.close(); } catch {}
    try { cdp.proc.kill('SIGKILL'); } catch {}
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
