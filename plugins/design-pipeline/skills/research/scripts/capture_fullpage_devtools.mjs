#!/usr/bin/env node
/**
 * Canonical Chrome DevTools Protocol (CDP) Full-Webpage Pixel-Perfect Reference Capture
 * for jason-design-agent / research.
 *
 * Uses headless Google Chrome + raw CDP over Node 22 native WebSocket (zero npm deps):
 *  1. Renders live URLs at @2x Desktop (1440px CSS -> 2880px physical) and @3x Mobile (390px CSS -> 1170px physical).
 *  2. Auto-scrolls the entire document to hydrate lazy-loaded images, WebGL/canvas scenes, SVGs, and scroll reveals.
 *  3. Dismisses/hides cookie banners & floating chat widgets cleanly, then returns to y=0.
 *  4. Extracts `fullpage-callouts.json` mapping EVERY section, callout card, badge, code block, CTA, and footer column.
 *  5. Captures seamless tiled `captureBeyondViewport` PNGs stitched via ImageMagick (`desktop-fullpage.png`,
 *     `mobile-fullpage.png`), 4-column `desktop-fullpage-contact.jpg`, and 2K `ImagePaths`-ready base slices
 *     (`desktop-base-hero-2k.png`, `desktop-base-mid-2k.png`, `desktop-base-lower-2k.png`, `desktop-base-footer-2k.png`,
 *     `mobile-base-2k.png`).
 *  6. URL-list intake (`--urls=` / `--urls-file=` / `--manifest=`): auto-slugs every URL (`NN-<host>[-<path>]`),
 *     writes `research/sources.json`, and runs DESKTOP-FIRST: the entire long desktop page of every URL is captured
 *     and recorded in `inspiration/manifest.json` + `inspiration/README.md` BEFORE any mobile pass, so the
 *     multi-agent analysis stage (`analyze_inspiration_workflow.py`) can start as soon as the desktop pass lands.
 *
 * Usage:
 *   node capture_fullpage_devtools.mjs --study-dir=<study> --urls="https://a.com, https://b.com/pricing" [--phase=desktop|mobile|all]
 *   node capture_fullpage_devtools.mjs --study-dir=<study> --urls-file=<urls.txt>  (one URL per line, `#` comments allowed)
 *   node capture_fullpage_devtools.mjs --manifest=<sites.json> --out-dir=<screenshots-dir> [--inspiration-dir=<dir>]
 */

import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME_CANDIDATES = [
  '/opt/google/chrome/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`No Chrome/Chromium binary found in: ${CHROME_CANDIDATES.join(', ')}`);
}

const MAGICK_BIN = fs.existsSync('/usr/bin/magick') ? '/usr/bin/magick' : 'magick';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CDPConnection {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();

    ws.addEventListener('message', (ev) => {
      let msg;
      try {
        msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
      } catch {
        return;
      }
      if (msg.id) {
        const entry = this.pending.get(msg.id);
        if (entry) {
          this.pending.delete(msg.id);
          clearTimeout(entry.timer);
          if (msg.error) {
            entry.reject(new Error(`${entry.method}: ${msg.error.message || JSON.stringify(msg.error)}`));
          } else {
            entry.resolve(msg.result);
          }
        }
      } else if (msg.method) {
        const list = this.listeners.get(msg.method);
        if (list) {
          for (const fn of [...list]) fn(msg.params || {}, msg.sessionId);
        }
      }
    });

    ws.addEventListener('close', () => {
      for (const [, entry] of this.pending) {
        clearTimeout(entry.timer);
        entry.reject(new Error(`WebSocket closed during ${entry.method}`));
      }
      this.pending.clear();
    });
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('CDP WebSocket connect timeout')), 10000);
      ws.addEventListener('open', () => {
        clearTimeout(t);
        resolve();
      }, { once: true });
      ws.addEventListener('error', (err) => {
        clearTimeout(t);
        reject(err);
      }, { once: true });
    });
    return new CDPConnection(ws);
  }

  send(method, params = {}, sessionId = undefined, timeoutMs = 45000) {
    const id = this.nextId++;
    const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout (${timeoutMs}ms) on ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer, method });
      this.ws.send(JSON.stringify(payload));
    });
  }

  waitForEvent(method, sessionId, timeoutMs = 14000) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        off();
        resolve(null);
      }, timeoutMs);
      const handler = (params, sid) => {
        if (!sessionId || sid === sessionId) {
          clearTimeout(timer);
          off();
          resolve(params);
        }
      };
      const off = () => {
        const arr = this.listeners.get(method) || [];
        const idx = arr.indexOf(handler);
        if (idx >= 0) arr.splice(idx, 1);
      };
      if (!this.listeners.has(method)) this.listeners.set(method, []);
      this.listeners.get(method).push(handler);
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function launchChrome(profileDir) {
  const chromeBin = findChrome();
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    '';

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
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
    '--ignore-certificate-errors',
    '--font-render-hinting=none',
    '--window-size=1440,900',
    ...(proxyUrl
      ? [`--proxy-server=${proxyUrl}`, '--proxy-bypass-list=127.0.0.1;localhost;<-loopback>']
      : []),
    `--user-data-dir=${profileDir}`,
    '--remote-debugging-port=0',
    'about:blank',
  ];

  const proc = spawn(chromeBin, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: '/dev/null' },
  });
  const wsUrl = await new Promise((resolve, reject) => {
    let stderrBuf = '';
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for Chrome DevTools WS URL. Stderr:\n${stderrBuf}`));
    }, 15000);
    proc.stderr.on('data', (chunk) => {
      stderrBuf += chunk.toString();
      const m = stderrBuf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited early (${code}): ${stderrBuf}`));
    });
  });

  const cdp = await CDPConnection.connect(wsUrl);
  return { proc, cdp };
}

const HYDRATE_AND_CLEAN_JS = `
(() => {
  try {
    // Click common dismiss/reject/accept buttons inside cookie/consent dialogs (buttons only, never <a> links)
    for (const btn of Array.from(document.querySelectorAll('button'))) {
      const t = (btn.innerText || '').trim().toLowerCase();
      if (['reject all', 'accept all', 'accept cookies', 'decline cookies', 'allow all cookies'].includes(t)) {
        try { btn.click(); } catch {}
      }
    }
    const style = document.createElement('style');
    style.id = '__cdp_clean_capture__';
    style.textContent = \`
      #onetrust-consent-sdk, .onetrust-pc-dark-filter, #CybotCookiebotDialog,
      [id*="cookie" i][class*="banner" i], [class*="cookie-banner" i], [class*="CookieConsent" i],
      #intercom-container, .intercom-lightweight-app, #crisp-chatbox, [id*="hubspot-messages-iframe"] {
        display: none !important; opacity: 0 !important; pointer-events: none !important;
      }
      *, *::before, *::after {
        scroll-behavior: auto !important;
      }
      section, article, main > div, footer {
        opacity: 1 !important;
      }
    \`;
    (document.head || document.documentElement).appendChild(style);

    for (const img of Array.from(document.querySelectorAll('img[loading="lazy"]'))) {
      img.setAttribute('loading', 'eager');
    }

    const finalHeight = Math.max(
      document.body?.scrollHeight || 0,
      document.documentElement?.scrollHeight || 0,
      window.innerHeight
    );
    return { scrollHeight: Math.ceil(finalHeight), title: document.title, url: location.href };
  } catch (e) {
    return { scrollHeight: window.innerHeight * 4, error: String(e) };
  }
})()
`;

const EXTRACT_FULLPAGE_CALLOUTS_JS = `
(() => {
  const clean = (s, max = 260) => (s || '').replace(/\\s+/g, ' ').trim().slice(0, max);
  const csBody = getComputedStyle(document.body);

  // Header & Nav
  const headerEl = document.querySelector('header, nav, [role="banner"]');
  let headerInfo = null;
  if (headerEl) {
    const r = headerEl.getBoundingClientRect();
    const cs = getComputedStyle(headerEl);
    headerInfo = {
      height: Math.round(r.height),
      position: cs.position,
      bg: cs.backgroundColor,
      backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter || 'none',
      borderBottom: cs.borderBottom,
      navLinks: Array.from(headerEl.querySelectorAll('a, button'))
        .map((el) => clean(el.innerText, 50))
        .filter(Boolean)
        .slice(0, 16),
    };
  }

  // Collect visual top-level bands from y=0 to bottom
  let candidates = Array.from(document.querySelectorAll('main > section, main > div, body > section, body > main > article, footer'));
  if (candidates.length < 3) {
    candidates = Array.from(document.querySelectorAll('section, article, [class*="section" i], footer'));
  }
  const seen = new Set();
  const sections = [];
  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    const absY = Math.round(r.top + window.scrollY);
    const h = Math.round(r.height);
    if (h < 110 || r.width < window.innerWidth * 0.45) continue;
    const key = Math.round(absY / 60) + ':' + Math.round(h / 60);
    if (seen.has(key)) continue;
    seen.add(key);

    const cs = getComputedStyle(el);
    const headings = Array.from(el.querySelectorAll('h1, h2, h3, h4'))
      .map((hd) => {
        const hcs = getComputedStyle(hd);
        return {
          tag: hd.tagName.toLowerCase(),
          text: clean(hd.innerText, 160),
          fontSize: hcs.fontSize,
          fontWeight: hcs.fontWeight,
          fontFamily: clean(hcs.fontFamily, 90),
          letterSpacing: hcs.letterSpacing,
          color: hcs.color,
        };
      })
      .filter((x) => x.text)
      .slice(0, 8);

    const eyebrows = Array.from(el.querySelectorAll('span, div, p'))
      .filter((n) => {
        if (n.children.length > 1) return false;
        const txt = clean(n.innerText, 60);
        if (!txt || txt.length < 3 || txt.length > 44) return false;
        const ncs = getComputedStyle(n);
        const fs = parseFloat(ncs.fontSize || '16');
        return fs <= 13.5 && (ncs.textTransform === 'uppercase' || ncs.fontFamily.toLowerCase().includes('mono'));
      })
      .map((n) => clean(n.innerText, 50))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 8);

    const paragraphs = Array.from(el.querySelectorAll('p'))
      .map((p) => clean(p.innerText, 220))
      .filter((t) => t.length > 18)
      .slice(0, 6);

    const ctas = Array.from(el.querySelectorAll('a, button'))
      .map((b) => {
        const txt = clean(b.innerText, 48);
        const br = b.getBoundingClientRect();
        if (!txt || br.width < 44 || br.height < 24 || br.height > 72) return null;
        const bcs = getComputedStyle(b);
        if (bcs.backgroundColor === 'rgba(0, 0, 0, 0)' && bcs.borderTopWidth === '0px') return null;
        return {
          text: txt,
          bg: bcs.backgroundColor,
          color: bcs.color,
          radius: bcs.borderRadius,
          padding: bcs.padding,
          w: Math.round(br.width),
          h: Math.round(br.height),
        };
      })
      .filter(Boolean)
      .slice(0, 6);

    const codeSamples = Array.from(el.querySelectorAll('pre, code'))
      .map((c) => clean(c.innerText, 240))
      .filter((t) => t.length > 12)
      .slice(0, 4);

    const interactiveSignals = {
      tabs: el.querySelectorAll('[role="tab"], [data-state="active"], [aria-selected]').length,
      inputs: el.querySelectorAll('input, textarea, select').length,
      canvases: el.querySelectorAll('canvas').length,
      svgs: el.querySelectorAll('svg').length,
      videos: el.querySelectorAll('video').length,
      tables: el.querySelectorAll('table, [role="grid"], [role="table"]').length,
    };

    sections.push({
      tag: el.tagName.toLowerCase(),
      y: absY,
      height: h,
      bg: cs.backgroundColor,
      backgroundImage: cs.backgroundImage !== 'none' ? clean(cs.backgroundImage, 140) : 'none',
      color: cs.color,
      borderTop: cs.borderTop,
      borderBottom: cs.borderBottom,
      eyebrows,
      headings,
      paragraphs,
      ctas,
      codeSamples,
      interactiveSignals,
    });
  }

  sections.sort((a, b) => a.y - b.y);

  // Pick richest mid-page section Y for targeted 2K callout crop
  const midCandidates = sections.filter((s) => s.y >= 650 && s.tag !== 'footer');
  let bestMidY = 950;
  let bestLowerY = 2100;
  if (midCandidates.length > 0) {
    const scored = midCandidates.map((s) => ({
      y: s.y,
      score:
        s.headings.length * 2 +
        s.codeSamples.length * 4 +
        s.ctas.length * 2 +
        s.interactiveSignals.tabs * 3 +
        s.interactiveSignals.canvases * 4 +
        Math.min(s.interactiveSignals.svgs, 12),
    }));
    scored.sort((a, b) => b.score - a.score);
    bestMidY = scored[0].y;
    const lower = scored.find((x) => Math.abs(x.y - bestMidY) >= 850);
    if (lower) bestLowerY = lower.y;
    else bestLowerY = bestMidY + 950;
  }

  // Observed typefaces + surface colors across the whole page (feeds avoid_fonts / avoid_palettes blocklists)
  const fontTally = new Map();
  const colorTally = new Map();
  const sampleEls = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, a, button, li, span, nav, footer, section')).slice(0, 2500);
  for (const el of sampleEls) {
    const ecs = getComputedStyle(el);
    const fam = clean(ecs.fontFamily, 90);
    if (fam) fontTally.set(fam, (fontTally.get(fam) || 0) + 1);
    for (const c of [ecs.backgroundColor, ecs.color]) {
      if (c && c !== 'rgba(0, 0, 0, 0)') colorTally.set(c, (colorTally.get(c) || 0) + 1);
    }
  }
  const fontsObserved = Array.from(fontTally.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([family, count]) => ({ family, count }));
  const colorsObserved = Array.from(colorTally.entries()).sort((a, b) => b[1] - a[1]).slice(0, 16).map(([value, count]) => ({ value, count }));

  return {
    title: document.title,
    url: location.href,
    lang: document.documentElement.lang || '',
    bodyBg: csBody.backgroundColor,
    bodyColor: csBody.color,
    bodyFont: clean(csBody.fontFamily, 100),
    fontsObserved,
    colorsObserved,
    scrollHeight: Math.ceil(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)),
    header: headerInfo,
    sectionCount: sections.length,
    bestMidY,
    bestLowerY,
    sections: sections.slice(0, 22),
  };
})()
`;

const BYPASS_CORP_INTERSTITIAL_JS = `
(() => {
  const bodyTxt = (document.body?.innerText || '').toLowerCase();
  if (bodyTxt.includes('flagged by your organization') || document.querySelector('#proceed-button')) {
    const btn =
      document.querySelector('#proceed-button') ||
      Array.from(document.querySelectorAll('button, a')).find((b) =>
        (b.innerText || '').trim().toLowerCase().includes('continue to site')
      );
    if (btn) {
      btn.click();
      return true;
    }
  }
  return false;
})()
`;

const HIDE_FIXED_TOPBAR_JS = `
(() => {
  window.__hiddenTopbars = [];
  for (const el of Array.from(document.querySelectorAll('header, nav, div'))) {
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'sticky') {
      const r = el.getBoundingClientRect();
      if (r.top <= 48 && r.height > 0 && r.height <= 120 && r.width >= window.innerWidth * 0.5) {
        window.__hiddenTopbars.push([el, el.style.opacity]);
        el.style.setProperty('opacity', '0', 'important');
      }
    }
  }
  return window.__hiddenTopbars.length;
})()
`;

const RESTORE_FIXED_TOPBAR_JS = `
(() => {
  for (const [el, prev] of (window.__hiddenTopbars || [])) {
    if (prev) el.style.opacity = prev;
    else el.style.removeProperty('opacity');
  }
  window.__hiddenTopbars = [];
  window.scrollTo(0, 0);
})()
`;

const FREEZE_FOR_SCREENSHOT_JS = `
(() => {
  try {
    for (const v of Array.from(document.querySelectorAll('video'))) {
      try { v.pause(); } catch {}
    }
    window.requestAnimationFrame = () => 0;
    const st = document.createElement('style');
    st.id = '__cdp_freeze_anim__';
    st.textContent = '*, *::before, *::after { animation-play-state: paused !important; transition: none !important; }';
    (document.head || document.documentElement).appendChild(st);
  } catch {}
  return true;
})()
`;

// ImageMagick's default height ceiling is 32000px; keep a safety margin so the stitched PNG always encodes.
const MAGICK_MAX_HEIGHT = 31500;
const MAX_PARTS = 4; // a page longer than one PNG continues into <name>-part2.png .. -part4.png
let MAX_VIEWPORTS_OVERRIDE = 0; // 0 = derive from MAGICK_MAX_HEIGHT; set via --max-viewports=N

async function captureTiledFullpage(cdp, sessionId, outPng, cssWidth, cssViewportH, totalCssHeight, dpr) {
  // Capture the ENTIRE long page. One stitched PNG holds as many viewports as fit under the ImageMagick ceiling
  // (@2x desktop 1440x900 -> 17 viewports = 15,300 CSS px; @3x mobile 390x844 -> 12 viewports = 10,128 CSS px);
  // longer documents continue into -part2.png .. -part4.png so nothing below the fold is lost.
  const physVp = Math.round(cssViewportH * Math.max(dpr, 1));
  const derivedMax = Math.max(1, Math.floor(MAGICK_MAX_HEIGHT / physVp));
  const perPart = MAX_VIEWPORTS_OVERRIDE > 0 ? Math.min(MAX_VIEWPORTS_OVERRIDE, derivedMax) : derivedMax;
  const maxSafeCssH = cssViewportH * perPart * MAX_PARTS;
  const maxCssHeight = Math.min(Math.max(totalCssHeight, cssViewportH), maxSafeCssH);
  const truncated = totalCssHeight > maxSafeCssH;
  const tilePaths = [];
  const tmpDir = path.dirname(outPng);

  try {
    // Hydrate lazy scroll sections once before freezing animations
    for (let sy = 0; sy < maxCssHeight; sy += cssViewportH) {
      await cdp.send('Runtime.evaluate', { expression: `window.scrollTo(0, ${sy});`, returnByValue: true }, sessionId, 8000).catch(() => null);
      await sleep(140);
    }
    await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0);', returnByValue: true }, sessionId, 8000).catch(() => null);
    await sleep(250);
    await cdp.send('Runtime.evaluate', { expression: FREEZE_FOR_SCREENSHOT_JS, returnByValue: true }, sessionId, 8000).catch(() => null);

    let idx = 0;
    for (let y = 0; y < maxCssHeight; y += cssViewportH) {
      const targetScrollY = Math.min(y, Math.max(0, maxCssHeight - cssViewportH));
      await cdp.send(
        'Runtime.evaluate',
        { expression: `window.scrollTo(0, ${targetScrollY});`, returnByValue: true },
        sessionId,
        10000
      );
      await sleep(idx === 0 ? 180 : 220);

      if (idx === 1) {
        await cdp.send('Runtime.evaluate', { expression: HIDE_FIXED_TOPBAR_JS, returnByValue: true }, sessionId, 10000);
      }

      const shot = await cdp.send(
        'Page.captureScreenshot',
        { format: 'png', captureBeyondViewport: false, fromSurface: true },
        sessionId,
        15000
      );
      const rawTile = path.join(tmpDir, `__tile_${path.basename(outPng, '.png')}_${idx}.png`);
      fs.writeFileSync(rawTile, Buffer.from(shot.data, 'base64'));

      // If final partial slice overlapped with previous scroll stop, crop only the newly exposed bottom band
      if (y > 0 && y + cssViewportH > maxCssHeight) {
        const remainCss = maxCssHeight - y;
        if (remainCss >= 40) {
          const physW = Math.round(cssWidth * dpr);
          const physVpH = Math.round(cssViewportH * dpr);
          const physRemH = Math.round(remainCss * dpr);
          const cropTop = Math.max(0, physVpH - physRemH);
          const trimmedTile = path.join(tmpDir, `__tile_trim_${path.basename(outPng, '.png')}_${idx}.png`);
          execFileSync(MAGICK_BIN, [rawTile, '-crop', `${physW}x${physRemH}+0+${cropTop}`, '+repage', trimmedTile]);
          try { fs.unlinkSync(rawTile); } catch {}
          tilePaths.push(trimmedTile);
        } else {
          try { fs.unlinkSync(rawTile); } catch {}
        }
        break;
      } else {
        tilePaths.push(rawTile);
      }
      idx++;
    }
  } finally {
    try {
      await cdp.send('Runtime.evaluate', { expression: RESTORE_FIXED_TOPBAR_JS, returnByValue: true }, sessionId, 10000);
    } catch {}
  }

  // Stitch: part 1 -> outPng; overflow -> <name>-part2.png, -part3.png ... (each under the ImageMagick ceiling)
  const parts = [];
  for (let p = 0; p * perPart < tilePaths.length; p++) {
    const group = tilePaths.slice(p * perPart, (p + 1) * perPart);
    const target = p === 0 ? outPng : outPng.replace(/\.png$/i, `-part${p + 1}.png`);
    if (group.length === 1) {
      fs.renameSync(group[0], target);
    } else {
      execFileSync(MAGICK_BIN, [...group, '-colorspace', 'sRGB', '-append', target]);
      for (const t of group) {
        try { fs.unlinkSync(t); } catch {}
      }
    }
    parts.push(target);
  }
  return {
    truncated,
    capturedCssHeight: maxCssHeight,
    documentCssHeight: totalCssHeight,
    viewports: tilePaths.length,
    parts,
  };
}

function probeDims(imgPath) {
  const out = execFileSync(MAGICK_BIN, ['identify', '-format', '%w %h', `${imgPath}[0]`], { encoding: 'utf8' }).trim();
  const [w, h] = out.split(/\s+/).map(Number);
  return { w, h };
}

function crop2KSlice(fullPng, outPng, physY, targetW, targetH) {
  const { w, h } = probeDims(fullPng);
  const cropH = Math.min(h, Math.round((w * targetH) / targetW));
  const clampedY = Math.max(0, Math.min(Math.round(physY), Math.max(0, h - cropH)));
  execFileSync(MAGICK_BIN, [
    fullPng,
    '-crop',
    `${w}x${cropH}+0+${clampedY}`,
    '+repage',
    '-filter',
    'Lanczos',
    '-resize',
    `${targetW}x${targetH}!`,
    '-colorspace',
    'sRGB',
    '-strip',
    `PNG24:${outPng}`,
  ]);
}

function buildFourColumnContactSheet(fullPng, outJpg) {
  const { w, h } = probeDims(fullPng);
  const cols = 4;
  const sliceH = Math.max(400, Math.ceil(h / cols));
  const sliceFiles = [];
  const dir = path.dirname(outJpg);
  try {
    for (let i = 0; i < cols; i++) {
      const y = Math.min(i * sliceH, Math.max(0, h - 100));
      const ch = Math.min(sliceH, h - y);
      const sf = path.join(dir, `__contact_col_${i}.png`);
      execFileSync(MAGICK_BIN, [
        fullPng,
        '-crop',
        `${w}x${ch}+0+${y}`,
        '+repage',
        '-background',
        '#0c0c0b',
        '-extent',
        `${w}x${sliceH}`,
        '-bordercolor',
        '#242422',
        '-border',
        '4x4',
        sf,
      ]);
      sliceFiles.push(sf);
    }
    execFileSync(MAGICK_BIN, [
      ...sliceFiles,
      '+append',
      '-filter',
      'Lanczos',
      '-resize',
      '3200x3200>',
      '-sampling-factor',
      '4:4:4',
      '-quality',
      '91',
      outJpg,
    ]);
  } finally {
    for (const sf of sliceFiles) {
      try { fs.unlinkSync(sf); } catch {}
    }
  }
}

const DESKTOP_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

/** Opens a fresh CDP target, emulates the device, navigates, bypasses corp interstitials, hydrates & cleans. */
async function openHydratedPage(cdp, url, { width, height, dpr, mobile, ua }) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  await cdp.send('Target.activateTarget', { targetId }).catch(() => null);
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Network.setUserAgentOverride', { userAgent: ua }, sessionId);
  await cdp.send(
    'Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: dpr, mobile },
    sessionId
  );

  const domReady = cdp.waitForEvent('Page.domContentEventFired', sessionId, 18000);
  const loadDone = cdp.waitForEvent('Page.loadEventFired', sessionId, 20000);
  await cdp.send('Page.navigate', { url }, sessionId, 25000).catch(() => null);
  await Promise.race([loadDone, domReady.then(() => sleep(mobile ? 3000 : 3500))]);
  await sleep(mobile ? 1500 : 1800);
  const bypassed = await cdp
    .send('Runtime.evaluate', { expression: BYPASS_CORP_INTERSTITIAL_JS, returnByValue: true }, sessionId, 10000)
    .catch(() => null);
  if (bypassed?.result?.value) await sleep(3500);

  const hydRes = await cdp
    .send('Runtime.evaluate', { expression: HYDRATE_AND_CLEAN_JS, returnByValue: true }, sessionId, 15000)
    .catch(() => null);
  const hydrate = hydRes?.result?.value || {};
  return { targetId, sessionId, hydrate };
}

/** Pass 1 — the ENTIRE long desktop page (@2x 1440px -> 2880px wide) + callouts + contact sheet + 2K base slices. */
async function captureDesktop(cdp, site, outRoot) {
  const siteDir = path.join(outRoot, site.slug);
  fs.mkdirSync(siteDir, { recursive: true });
  const page = await openHydratedPage(cdp, site.url, {
    width: 1440,
    height: 900,
    dpr: 2,
    mobile: false,
    ua: DESKTOP_UA,
  });
  try {
    const scrollHeight = page.hydrate.scrollHeight || 3600;
    const calloutRes = await cdp.send(
      'Runtime.evaluate',
      { expression: EXTRACT_FULLPAGE_CALLOUTS_JS, returnByValue: true },
      page.sessionId,
      30000
    );
    const callouts = calloutRes?.result?.value || { scrollHeight };
    callouts.capturedAt = new Date().toISOString();
    callouts.requestedUrl = site.url;
    fs.writeFileSync(path.join(siteDir, 'fullpage-callouts.json'), JSON.stringify(callouts, null, 2));

    const deskFullPng = path.join(siteDir, 'desktop-fullpage.png');
    const tiling = await captureTiledFullpage(cdp, page.sessionId, deskFullPng, 1440, 900, scrollHeight, 2);

    const { w: dw, h: dh } = probeDims(deskFullPng);
    buildFourColumnContactSheet(deskFullPng, path.join(siteDir, 'desktop-fullpage-contact.jpg'));
    crop2KSlice(deskFullPng, path.join(siteDir, 'desktop-base-hero-2k.png'), 0, 2752, 1536);
    crop2KSlice(
      deskFullPng,
      path.join(siteDir, 'desktop-base-mid-2k.png'),
      Math.max(1200, (callouts.bestMidY || 900) * 2 - 120),
      2752,
      1536
    );
    crop2KSlice(
      deskFullPng,
      path.join(siteDir, 'desktop-base-lower-2k.png'),
      Math.max(2400, (callouts.bestLowerY || 2000) * 2 - 120),
      2752,
      1536
    );
    crop2KSlice(deskFullPng, path.join(siteDir, 'desktop-base-footer-2k.png'), Math.max(0, dh - 1620), 2752, 1536);

    const row = {
      slug: site.slug,
      url: site.url,
      finalUrl: callouts.url || site.url,
      title: callouts.title || page.hydrate.title || '',
      ok: true,
      desktopFullPx: `${dw}x${dh}`,
      desktopViewports: tiling.viewports,
      desktopTruncated: tiling.truncated,
      desktopParts: tiling.parts.map((p) => path.basename(p)),
      documentCssHeight: tiling.documentCssHeight,
      sectionsExtracted: callouts.sectionCount || 0,
      bodyBg: callouts.bodyBg,
      bodyFont: callouts.bodyFont,
      fontsObserved: (callouts.fontsObserved || []).slice(0, 5).map((f) => f.family),
      capturedAt: callouts.capturedAt,
    };
    console.log(
      `[OK desktop] ${site.slug}: ${row.desktopFullPx} (${row.desktopViewports} viewports, ${row.sectionsExtracted} sections${tiling.parts.length > 1 ? `, ${tiling.parts.length} parts` : ''}${row.desktopTruncated ? ', TRUNCATED beyond part cap' : ''})`
    );
    return row;
  } finally {
    try { await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch {}
  }
}

/** Pass 2 — mobile full page (@3x 390px -> 1170px wide) + 2K base slice. Runs only after every desktop capture landed. */
async function captureMobile(cdp, site, outRoot) {
  const siteDir = path.join(outRoot, site.slug);
  fs.mkdirSync(siteDir, { recursive: true });
  const page = await openHydratedPage(cdp, site.url, {
    width: 390,
    height: 844,
    dpr: 3,
    mobile: true,
    ua: MOBILE_UA,
  });
  try {
    const mobScrollH = page.hydrate.scrollHeight || 3200;
    const mobFullPng = path.join(siteDir, 'mobile-fullpage.png');
    const tiling = await captureTiledFullpage(cdp, page.sessionId, mobFullPng, 390, 844, mobScrollH, 3);
    const { w: mw, h: mh } = probeDims(mobFullPng);
    crop2KSlice(mobFullPng, path.join(siteDir, 'mobile-base-2k.png'), 0, 1536, 2752);
    console.log(`[OK mobile] ${site.slug}: ${mw}x${mh} (${tiling.viewports} viewports${tiling.parts.length > 1 ? `, ${tiling.parts.length} parts` : ''})`);
    return {
      slug: site.slug,
      url: site.url,
      ok: true,
      mobileFullPx: `${mw}x${mh}`,
      mobileTruncated: tiling.truncated,
      mobileParts: tiling.parts.map((p) => path.basename(p)),
    };
  } finally {
    try { await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch {}
  }
}

// ---------------------------------------------------------------------------------------------
// URL-list intake, slugging & inspiration manifest
// ---------------------------------------------------------------------------------------------

function normalizeUrl(raw) {
  let u = (raw || '').trim().replace(/^[<"'`(]+|[>"'`),.;]+$/g, '');
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    const parsed = new URL(u);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function slugForUrl(url, index) {
  const parsed = new URL(url);
  const host = parsed.hostname.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-');
  const pathPart = parsed.pathname
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)
    .slice(0, 2)
    .join('-')
    .replace(/[^a-z0-9]+/gi, '-');
  const base = [host, pathPart].filter(Boolean).join('-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  return `${String(index + 1).padStart(2, '0')}-${base.slice(0, 60)}`;
}

/** Accepts a comma/whitespace/newline separated URL blob (pasted chat text works) or a one-per-line file. */
function parseUrlList(blob) {
  const seen = new Set();
  const urls = [];
  for (const line of blob.split(/\r?\n/)) {
    const stripped = line.replace(/#.*$/, '');
    for (const tok of stripped.split(/[\s,]+/)) {
      const u = normalizeUrl(tok);
      if (u && !seen.has(u)) {
        seen.add(u);
        urls.push(u);
      }
    }
  }
  return urls;
}

function buildSitesFromUrls(urls, existingManifestPath) {
  // Keep stable slugs for URLs that already appear in a previous sources.json (re-runs append, never renumber)
  let existing = [];
  if (existingManifestPath && fs.existsSync(existingManifestPath)) {
    try { existing = JSON.parse(fs.readFileSync(existingManifestPath, 'utf8')); } catch {}
  }
  const byUrl = new Map(existing.map((s) => [s.url, s]));
  const sites = [];
  let nextIndex = existing.length;
  for (const url of urls) {
    if (byUrl.has(url)) {
      sites.push(byUrl.get(url));
    } else {
      const site = { slug: slugForUrl(url, nextIndex), url };
      byUrl.set(url, site);
      sites.push(site);
      nextIndex++;
    }
  }
  return { sites, merged: Array.from(byUrl.values()) };
}

function relToInspiration(inspirationDir, absPath) {
  return path.relative(inspirationDir, absPath).split(path.sep).join('/');
}

/** Writes inspiration/manifest.json + README.md: the inspiration image folder that ships with the study. */
function writeInspirationManifest(inspirationDir, outDir, sites, desktopRows, mobileRows) {
  fs.mkdirSync(inspirationDir, { recursive: true });
  const manifestPath = path.join(inspirationDir, 'manifest.json');
  let previous = { items: [] };
  if (fs.existsSync(manifestPath)) {
    try { previous = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch {}
  }
  const prevBySlug = new Map((previous.items || []).map((it) => [it.slug, it]));
  const deskBySlug = new Map((desktopRows || []).filter(Boolean).map((r) => [r.slug, r]));
  const mobBySlug = new Map((mobileRows || []).filter(Boolean).map((r) => [r.slug, r]));

  const items = [];
  for (const site of sites) {
    const siteDir = path.join(outDir, site.slug);
    const desk = deskBySlug.get(site.slug);
    const mob = mobBySlug.get(site.slug);
    const prev = prevBySlug.get(site.slug) || {};
    const fullPng = path.join(siteDir, 'desktop-fullpage.png');
    const hasDesktop = fs.existsSync(fullPng);
    const partFiles = (prefix) =>
      fs.existsSync(siteDir)
        ? fs
            .readdirSync(siteDir)
            .filter((f) => new RegExp(`^${prefix}-part\\d+\\.png$`).test(f))
            .sort()
            .map((f) => relToInspiration(inspirationDir, path.join(siteDir, f)))
        : [];
    const files = {
      desktop_fullpage: hasDesktop ? relToInspiration(inspirationDir, fullPng) : null,
      desktop_fullpage_parts: partFiles('desktop-fullpage'),
      desktop_contact: fs.existsSync(path.join(siteDir, 'desktop-fullpage-contact.jpg'))
        ? relToInspiration(inspirationDir, path.join(siteDir, 'desktop-fullpage-contact.jpg'))
        : null,
      desktop_base_2k: ['hero', 'mid', 'lower', 'footer']
        .map((k) => path.join(siteDir, `desktop-base-${k}-2k.png`))
        .filter((p) => fs.existsSync(p))
        .map((p) => relToInspiration(inspirationDir, p)),
      callouts_json: fs.existsSync(path.join(siteDir, 'fullpage-callouts.json'))
        ? relToInspiration(inspirationDir, path.join(siteDir, 'fullpage-callouts.json'))
        : null,
      mobile_fullpage: fs.existsSync(path.join(siteDir, 'mobile-fullpage.png'))
        ? relToInspiration(inspirationDir, path.join(siteDir, 'mobile-fullpage.png'))
        : null,
      mobile_fullpage_parts: partFiles('mobile-fullpage'),
      mobile_base_2k: fs.existsSync(path.join(siteDir, 'mobile-base-2k.png'))
        ? relToInspiration(inspirationDir, path.join(siteDir, 'mobile-base-2k.png'))
        : null,
    };
    // A browsable copy of the entire long desktop page lives directly inside inspiration/ (the ship-with-project folder)
    let inspirationCopy = prev.inspiration_copy || null;
    if (hasDesktop) {
      const copyName = `${site.slug}-desktop-fullpage.png`;
      const copyPath = path.join(inspirationDir, copyName);
      try {
        if (!fs.existsSync(copyPath) || fs.statSync(copyPath).mtimeMs < fs.statSync(fullPng).mtimeMs) {
          fs.copyFileSync(fullPng, copyPath);
        }
        inspirationCopy = copyName;
      } catch {}
    }
    const status = desk ? (desk.ok ? 'captured' : 'failed') : hasDesktop ? prev.status || 'captured' : 'pending';
    items.push({
      index: items.length + 1,
      slug: site.slug,
      url: site.url,
      final_url: desk?.finalUrl || prev.final_url || site.url,
      title: desk?.title || prev.title || '',
      status,
      error: desk && !desk.ok ? desk.error : null,
      desktop_px: desk?.desktopFullPx || prev.desktop_px || null,
      desktop_truncated: desk?.desktopTruncated ?? prev.desktop_truncated ?? false,
      mobile_px: mob?.mobileFullPx || prev.mobile_px || null,
      sections_extracted: desk?.sectionsExtracted ?? prev.sections_extracted ?? 0,
      body_bg: desk?.bodyBg || prev.body_bg || null,
      fonts_observed: desk?.fontsObserved || prev.fonts_observed || [],
      captured_at: desk?.capturedAt || prev.captured_at || null,
      inspiration_copy: inspirationCopy,
      files,
      analysis: prev.analysis || {
        property_md: `../research/properties/${site.slug}.md`,
        prompt_md: `../research/prompts/${site.slug}-inspiration-prompt.md`,
        status: 'pending',
      },
    });
  }

  const manifest = {
    source: 'urls',
    generated_at: new Date().toISOString(),
    capture_method: 'chrome-devtools-protocol headless fullpage (desktop @2x 1440 css, mobile @3x 390 css)',
    screenshots_dir: relToInspiration(inspirationDir, outDir),
    desktop_first: true,
    items,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const lines = [
    '# inspiration',
    '',
    'full-length desktop captures of every research url, taken first (before any mobile pass) and kept as the inspiration record that ships with this study. every plate, prompt and build downstream traces back to one of these rows.',
    '',
    '| # | slug | url | status | desktop px | sections | entire page | contact sheet | callouts | analysis |',
    '| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |',
  ];
  for (const it of items) {
    lines.push(
      `| ${String(it.index).padStart(2, '0')} | \`${it.slug}\` | ${it.url} | ${it.status}${it.desktop_truncated ? ' (truncated)' : ''} | ${it.desktop_px || '-'} | ${it.sections_extracted} | ${it.inspiration_copy ? `[png](${it.inspiration_copy})` : '-'} | ${it.files.desktop_contact ? `[jpg](${it.files.desktop_contact})` : '-'} | ${it.files.callouts_json ? `[json](${it.files.callouts_json})` : '-'} | [md](${it.analysis.property_md}) |`
    );
  }
  lines.push('', `generated ${manifest.generated_at} · ${manifest.capture_method}`, '');
  fs.writeFileSync(path.join(inspirationDir, 'README.md'), lines.join('\n'));
  return manifestPath;
}

function mergeSummary(summaryFile, rows, key) {
  let prev = { results: [] };
  if (fs.existsSync(summaryFile)) {
    try { prev = JSON.parse(fs.readFileSync(summaryFile, 'utf8')); } catch {}
  }
  const bySlug = new Map((prev.results || []).map((r) => [r.slug, r]));
  for (const r of rows) {
    if (!r?.slug) continue;
    const merged = { ...(bySlug.get(r.slug) || {}), ...r };
    if (key === 'mobile' && bySlug.get(r.slug)?.ok === false && r.ok) merged.ok = false; // desktop failure wins
    bySlug.set(r.slug, merged);
  }
  const results = Array.from(bySlug.values()).sort((a, b) => a.slug.localeCompare(b.slug));
  fs.writeFileSync(summaryFile, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  return results;
}

async function runPass(cdp, sites, outDir, concurrency, fn, label) {
  const results = [];
  let cursor = 0;
  async function worker() {
    while (cursor < sites.length) {
      const idx = cursor++;
      const site = sites[idx];
      try {
        results[idx] = await fn(cdp, site, outDir);
      } catch (err) {
        console.error(`[ERR ${label}] ${site.slug}: ${err.message}`);
        results[idx] = { slug: site.slug, url: site.url, ok: false, error: err.message };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, sites.length) }, () => worker()));
  return results;
}

function usage() {
  console.error(
    [
      'Usage:',
      '  node capture_fullpage_devtools.mjs --study-dir=<study> --urls="https://a.com, https://b.com" [--phase=all|desktop|mobile]',
      '  node capture_fullpage_devtools.mjs --study-dir=<study> --urls-file=<urls.txt>',
      '  node capture_fullpage_devtools.mjs --manifest=<sites.json> --out-dir=<screenshots-dir> [--inspiration-dir=<dir>]',
      '',
      'Options:',
      '  --study-dir=<dir>        sets --out-dir=<dir>/research/screenshots, --inspiration-dir=<dir>/inspiration,',
      '                           and writes/merges <dir>/research/sources.json from --urls / --urls-file',
      '  --phase=all|desktop|mobile   all (default) = desktop pass for EVERY url first, then mobile pass',
      '  --concurrency=N          parallel tabs per pass (1-4, default 3)',
      '  --site=slug[,slug]       restrict to matching slugs (re-capture)',
      '  --max-viewports=N        cap viewports per page (default: as many as fit under the 31.5k px ImageMagick ceiling)',
    ].join('\n')
  );
}

async function main() {
  const args = process.argv.slice(2);
  let manifestPath = '';
  let outDir = '';
  let studyDir = '';
  let inspirationDir = '';
  let urlsBlob = '';
  let urlsFile = '';
  let phase = 'all';
  let concurrency = 3;
  let onlySite = '';

  for (const a of args) {
    if (a.startsWith('--manifest=')) manifestPath = a.slice('--manifest='.length);
    else if (a.startsWith('--out-dir=')) outDir = a.slice('--out-dir='.length);
    else if (a.startsWith('--study-dir=')) studyDir = a.slice('--study-dir='.length);
    else if (a.startsWith('--inspiration-dir=')) inspirationDir = a.slice('--inspiration-dir='.length);
    else if (a.startsWith('--urls=')) urlsBlob += `\n${a.slice('--urls='.length)}`;
    else if (a.startsWith('--urls-file=')) urlsFile = a.slice('--urls-file='.length);
    else if (a.startsWith('--phase=')) phase = a.slice('--phase='.length).toLowerCase();
    else if (a.startsWith('--concurrency=')) concurrency = Math.max(1, Math.min(4, Number(a.slice('--concurrency='.length)) || 3));
    else if (a.startsWith('--site=')) onlySite = a.slice('--site='.length);
    else if (a.startsWith('--max-viewports=')) MAX_VIEWPORTS_OVERRIDE = Math.max(1, Number(a.slice('--max-viewports='.length)) || 0);
    else if (a === '--help' || a === '-h') {
      usage();
      process.exit(0);
    }
  }
  if (!['all', 'desktop', 'mobile'].includes(phase)) {
    console.error(`Unknown --phase=${phase}`);
    usage();
    process.exit(1);
  }

  if (studyDir) {
    studyDir = path.resolve(studyDir);
    if (!outDir) outDir = path.join(studyDir, 'research', 'screenshots');
    if (!inspirationDir) inspirationDir = path.join(studyDir, 'inspiration');
    if (!manifestPath) manifestPath = path.join(studyDir, 'research', 'sources.json');
  }
  if (urlsFile) urlsBlob += `\n${fs.readFileSync(urlsFile, 'utf8')}`;

  let allSites = [];
  const urls = parseUrlList(urlsBlob);
  if (urls.length > 0) {
    if (!manifestPath) {
      console.error('--urls / --urls-file requires --study-dir (or --manifest=<path to write sources.json>)');
      process.exit(1);
    }
    const { sites, merged } = buildSitesFromUrls(urls, manifestPath);
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(merged, null, 2));
    allSites = sites;
    console.log(`Intake: ${urls.length} url(s) -> ${manifestPath}`);
    for (const s of sites) console.log(`  ${s.slug}  ${s.url}`);
  } else if (manifestPath && fs.existsSync(manifestPath)) {
    allSites = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }

  if (!outDir || allSites.length === 0) {
    usage();
    process.exit(1);
  }

  const wanted = onlySite ? onlySite.split(',').map((x) => x.trim()).filter(Boolean) : [];
  const sites = wanted.length > 0 ? allSites.filter((s) => wanted.some((w) => s.slug.includes(w))) : allSites;
  fs.mkdirSync(outDir, { recursive: true });
  const summaryFile = path.join(outDir, 'fullpage_devtools_summary.json');
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-fullpage-'));
  const { proc, cdp } = await launchChrome(profileDir);

  let desktopRows = [];
  let mobileRows = [];
  try {
    if (phase === 'all' || phase === 'desktop') {
      console.log(`\n== pass 1/2 · entire long desktop page (${sites.length} url(s), concurrency ${concurrency}) ==`);
      desktopRows = await runPass(cdp, sites, outDir, concurrency, captureDesktop, 'desktop');
      mergeSummary(summaryFile, desktopRows, 'desktop');
      if (inspirationDir) {
        const mp = writeInspirationManifest(inspirationDir, outDir, allSites, desktopRows, []);
        console.log(`Inspiration manifest -> ${mp}`);
      }
    }
    if (phase === 'all' || phase === 'mobile') {
      const mobileSites = phase === 'mobile' ? sites : sites.filter((s, i) => desktopRows[i]?.ok !== false);
      console.log(`\n== pass 2/2 · mobile full page (${mobileSites.length} url(s)) ==`);
      mobileRows = await runPass(cdp, mobileSites, outDir, concurrency, captureMobile, 'mobile');
      mergeSummary(summaryFile, mobileRows, 'mobile');
      if (inspirationDir) writeInspirationManifest(inspirationDir, outDir, allSites, desktopRows, mobileRows);
    }
  } finally {
    cdp.close();
    try { proc.kill('SIGKILL'); } catch {}
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  }

  const failed = [...desktopRows, ...mobileRows].filter((r) => r && !r.ok);
  const okDesktop = desktopRows.filter((r) => r?.ok).length;
  const okMobile = mobileRows.filter((r) => r?.ok).length;
  const doneParts = [];
  if (phase !== 'mobile') doneParts.push(`${okDesktop}/${sites.length} desktop pages`);
  if (phase !== 'desktop') doneParts.push(`${okMobile}/${phase === 'mobile' ? sites.length : mobileRows.length} mobile pages`);
  console.log(`\nDone: ${doneParts.join(', ')} captured -> ${summaryFile}`);
  if (inspirationDir) {
    console.log(`Next: run_workflow(ScriptPath=".../research/scripts/analyze_inspiration_workflow.py", Args={"study_dir": "${studyDir || path.dirname(path.dirname(outDir))}"})`);
  }
  if (failed.length > 0) {
    console.log(`Failed: ${failed.map((f) => `${f.slug}`).join(', ')} (re-run with --site=<slug> or --phase=desktop)`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
