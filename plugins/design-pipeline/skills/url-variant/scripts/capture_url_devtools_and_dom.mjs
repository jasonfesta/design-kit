#!/usr/bin/env node
/**
 * Chrome DevTools Protocol (CDP) Full-Length Desktop & Mobile Screenshot + DOM Text Extractor
 * for `url-variant`.
 *
 * Given a URL, uses headless Google Chrome + raw CDP over WebSocket to capture:
 *  1. Desktop full-length screenshot (`captures/desktop-fullpage.png`, @2x 1440x900 -> 2880px wide)
 *     + 2K viewport band tiles (`captures/tiles/desktop-band-01.png` .. `desktop-band-NN.png`)
 *     + `captures/desktop-base-hero-2k.png` (2752x1536).
 *  2. Mobile full-length screenshot (`captures/mobile-fullpage.png`, @3x 390x844 -> 1170px wide)
 *     + 2K viewport band tiles (`captures/tiles/mobile-band-01.png` .. `mobile-band-NN.png`)
 *     + `captures/mobile-base-hero-2k.png` (1536x2752).
 *  3. Desktop DOM as text (`dom/desktop-dom.txt` structured text + layout dump & `dom/desktop-dom.html` outerHTML,
 *     including shadow DOM and Flutter `flt-semantics` / `flt-glass-pane` trees).
 *  4. Mobile DOM as text (`dom/mobile-dom.txt` structured text + layout dump & `dom/mobile-dom.html` outerHTML).
 *  5. Unified `dom/dom-audit.json` cataloguing every original text string, brand token, font family,
 *     computed hex color, section geometry, and framework/UI artifact (Flutter glass panes, canvas traps,
 *     debug ribbons, cookie banners, sticky overlap) so Nano Banana 2.1 replaces 100% of them.
 *
 * Usage:
 *   node capture_url_devtools_and_dom.mjs --url="https://example.com" --out-dir="/path/to/study" [--max-viewports=8]
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
      const t = setTimeout(() => reject(new Error('CDP WebSocket connect timeout')), 12000);
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

  waitForEvent(method, sessionId, timeoutMs = 15000) {
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

const HYDRATE_AND_ENABLE_FLUTTER_SEMANTICS_JS = `
(() => {
  try {
    // 1. Trigger Flutter Web semantics placeholder if present so ARIA nodes populate in the DOM
    const fltPlaceholder = document.querySelector('flt-semantics-placeholder, [aria-label="Enable accessibility"]');
    if (fltPlaceholder) {
      try { fltPlaceholder.click(); } catch {}
    }

    // 2. Dismiss cookie banners (buttons only, never navigation links)
    for (const btn of Array.from(document.querySelectorAll('button'))) {
      const t = (btn.innerText || '').trim().toLowerCase();
      if (['reject all', 'accept all', 'accept cookies', 'decline cookies', 'allow all cookies', 'got it'].includes(t)) {
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
    \`;
    (document.head || document.documentElement).appendChild(style);

    for (const img of Array.from(document.querySelectorAll('img[loading="lazy"]'))) {
      img.setAttribute('loading', 'eager');
    }

    // Check if a Flutter or inner scroll container owns the document scroll height
    let maxScrollH = Math.max(
      document.body?.scrollHeight || 0,
      document.documentElement?.scrollHeight || 0,
      window.innerHeight
    );
    for (const el of Array.from(document.querySelectorAll('div, main, section, flt-glass-pane, flutter-view'))) {
      if (el.scrollHeight > maxScrollH && el.clientHeight >= window.innerHeight * 0.7) {
        maxScrollH = el.scrollHeight;
      }
    }

    return { scrollHeight: Math.ceil(maxScrollH), title: document.title, url: location.href };
  } catch (e) {
    return { scrollHeight: window.innerHeight * 3, error: String(e) };
  }
})()
`;

const EXTRACT_DOM_AND_ARTIFACTS_JS = `
(() => {
  const clean = (s, max = 320) => (s || '').replace(/\\s+/g, ' ').trim().slice(0, max);
  const rgbToHex = (rgb) => {
    if (!rgb) return null;
    const m = rgb.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
    if (!m) return null;
    if (m[4] !== undefined && parseFloat(m[4]) < 0.08) return null;
    const hex = [m[1], m[2], m[3]].map((x) => parseInt(x, 10).toString(16).padStart(2, '0')).join('');
    return '#' + hex.toUpperCase();
  };

  // Walk regular DOM + open Shadow DOM roots (critical for Flutter Web flt-glass-pane & Web Components)
  const allElements = [];
  const walk = (root) => {
    if (!root) return;
    const children = root.children ? Array.from(root.children) : [];
    for (const el of children) {
      allElements.push(el);
      if (el.shadowRoot) walk(el.shadowRoot);
      walk(el);
    }
  };
  walk(document.documentElement);

  // Detect Flutter & rendering artifacts
  const artifacts = [];
  const hasFlutterGlassPane = Boolean(
    document.querySelector('flt-glass-pane, flutter-view, flt-scene-host, flt-semantics-host') ||
    allElements.some((el) => el.tagName && el.tagName.toLowerCase().startsWith('flt-'))
  );
  if (hasFlutterGlassPane) {
    artifacts.push({
      type: 'flutter_web_canvas',
      description: 'Flutter Web glass-pane / canvas rendering detected (non-native DOM text, canvas anti-aliasing, custom scrollbar/focus artifacts).',
    });
  }

  const canvases = allElements.filter((el) => el.tagName?.toLowerCase() === 'canvas');
  if (canvases.length > 0) {
    artifacts.push({
      type: 'canvas_surfaces',
      count: canvases.length,
      description: 'Canvas elements present; replace any blurry canvas-baked text or debug HUDs with crisp vector UI.',
    });
  }

  // Detect framework debug badges / watermarks (e.g., Flutter DEBUG banner, Made in Framer/Webflow badges)
  for (const el of allElements) {
    const txt = clean(el.innerText || el.getAttribute?.('aria-label') || '', 80).toLowerCase();
    if (
      txt === 'debug' ||
      txt.includes('made in webflow') ||
      txt.includes('made in framer') ||
      txt.includes('built with flutter') ||
      txt.includes('created with figma')
    ) {
      artifacts.push({
        type: 'watermark_or_debug_badge',
        text: txt,
        description: 'Framework watermark or debug badge that must be completely removed in the variant.',
      });
    }
  }

  // Extract fonts & colors
  const fontCounts = new Map();
  const bgColors = new Map();
  const textColors = new Map();

  for (const el of allElements.slice(0, 3500)) {
    let cs;
    try { cs = getComputedStyle(el); } catch { continue; }
    const fam = clean(cs.fontFamily, 100);
    if (fam) {
      const primaryFam = fam.split(',')[0].replace(/['"]/g, '').trim();
      if (primaryFam && !['inherit', 'initial', 'sans-serif', 'serif', 'monospace'].includes(primaryFam.toLowerCase())) {
        fontCounts.set(primaryFam, (fontCounts.get(primaryFam) || 0) + 1);
      }
    }
    const bgHex = rgbToHex(cs.backgroundColor);
    if (bgHex) bgColors.set(bgHex, (bgColors.get(bgHex) || 0) + 1);
    const fgHex = rgbToHex(cs.color);
    if (fgHex) textColors.set(fgHex, (textColors.get(fgHex) || 0) + 1);
  }

  // Collect all visible text strings & ARIA semantics (including Flutter flt-semantics nodes)
  const textNodes = [];
  const seenTexts = new Set();
  for (const el of allElements) {
    const tag = (el.tagName || '').toLowerCase();
    if (['script', 'style', 'noscript', 'svg', 'path'].includes(tag)) continue;
    const aria = clean(el.getAttribute?.('aria-label') || '', 240);
    const directText = clean(
      Array.from(el.childNodes || [])
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join(' '),
      240
    );
    const val = directText || aria;
    if (!val || val.length < 2 || seenTexts.has(val.toLowerCase())) continue;
    let r = { top: 0, left: 0, width: 0, height: 0 };
    try { r = el.getBoundingClientRect(); } catch {}
    if (r.width === 0 && r.height === 0 && !tag.startsWith('flt-')) continue;
    seenTexts.add(val.toLowerCase());
    let cs = {};
    try { cs = getComputedStyle(el); } catch {}
    textNodes.push({
      tag,
      role: el.getAttribute?.('role') || '',
      y: Math.round(r.top + window.scrollY),
      x: Math.round(r.left + window.scrollX),
      w: Math.round(r.width),
      h: Math.round(r.height),
      fontSize: cs.fontSize || '',
      fontWeight: cs.fontWeight || '',
      color: rgbToHex(cs.color) || cs.color || '',
      text: val,
    });
  }
  textNodes.sort((a, b) => a.y - b.y || a.x - b.x);

  // Extract structured layout bands
  let sectionEls = Array.from(document.querySelectorAll('header, nav, main > section, main > div, body > section, article, footer'));
  if (sectionEls.length < 3) {
    sectionEls = Array.from(document.querySelectorAll('section, article, [class*="section" i], [class*="hero" i], footer'));
  }
  const sections = [];
  const seenSec = new Set();
  for (const el of sectionEls) {
    const r = el.getBoundingClientRect();
    const y = Math.round(r.top + window.scrollY);
    const h = Math.round(r.height);
    if (h < 60 || r.width < window.innerWidth * 0.4) continue;
    const key = Math.round(y / 50) + ':' + Math.round(h / 50);
    if (seenSec.has(key)) continue;
    seenSec.add(key);
    const cs = getComputedStyle(el);
    const headings = Array.from(el.querySelectorAll('h1, h2, h3, h4, [role="heading"]'))
      .map((hd) => clean(hd.innerText || hd.getAttribute('aria-label') || '', 140))
      .filter(Boolean)
      .slice(0, 6);
    const ctas = Array.from(el.querySelectorAll('a, button, [role="button"]'))
      .map((b) => clean(b.innerText || b.getAttribute('aria-label') || '', 60))
      .filter(Boolean)
      .slice(0, 8);
    const paragraphs = Array.from(el.querySelectorAll('p'))
      .map((p) => clean(p.innerText || '', 180))
      .filter((t) => t.length > 16)
      .slice(0, 6);
    const codeSamples = Array.from(el.querySelectorAll('pre, code'))
      .map((c) => clean(c.innerText || '', 180))
      .filter((t) => t.length > 10)
      .slice(0, 4);
    const interactiveSignals = {
      tabs: el.querySelectorAll('[role="tab"], [data-state="active"], [aria-selected]').length,
      inputs: el.querySelectorAll('input, textarea, select').length,
      canvases: el.querySelectorAll('canvas').length,
      svgs: el.querySelectorAll('svg').length,
      tables: el.querySelectorAll('table, [role="grid"], [role="table"]').length,
      images: el.querySelectorAll('img, picture, video').length,
      cards: el.querySelectorAll('article, [class*="card" i], [class*="bento" i], [class*="tile" i]').length,
    };
    sections.push({
      tag: el.tagName.toLowerCase(),
      className: clean(typeof el.className === 'string' ? el.className : '', 100),
      y,
      height: h,
      bgHex: rgbToHex(cs.backgroundColor) || cs.backgroundColor,
      colorHex: rgbToHex(cs.color) || cs.color,
      display: cs.display,
      gridTemplateColumns: clean(cs.gridTemplateColumns || '', 80),
      headings,
      paragraphs,
      ctas,
      codeSamples,
      interactiveSignals,
    });
  }
  sections.sort((a, b) => a.y - b.y);

  // Build readable text DOM tree for desktop-dom.txt / mobile-dom.txt
  const domTextLines = [];
  domTextLines.push('=== PAGE METADATA ===');
  domTextLines.push('Title: ' + document.title);
  domTextLines.push('URL: ' + location.href);
  domTextLines.push('Viewport: ' + window.innerWidth + 'x' + window.innerHeight);
  domTextLines.push('ScrollHeight: ' + Math.ceil(Math.max(document.body?.scrollHeight || 0, document.documentElement?.scrollHeight || 0)));
  domTextLines.push('Flutter Detected: ' + hasFlutterGlassPane);
  domTextLines.push('');
  domTextLines.push('=== OBSERVED FONTS (AVOID IN VARIANT) ===');
  for (const [f, c] of Array.from(fontCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    domTextLines.push('  - ' + f + ' (' + c + ' nodes)');
  }
  domTextLines.push('');
  domTextLines.push('=== OBSERVED SURFACE & TEXT HEX COLORS (SHIFT IN VARIANT) ===');
  for (const [hex, c] of Array.from(bgColors.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    domTextLines.push('  - bg ' + hex + ' (' + c + ' nodes)');
  }
  for (const [hex, c] of Array.from(textColors.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    domTextLines.push('  - fg ' + hex + ' (' + c + ' nodes)');
  }
  domTextLines.push('');
  domTextLines.push('=== ARTIFACTS TO PURGE / REPLACE ===');
  if (artifacts.length === 0) {
    domTextLines.push('  - Standard DOM (replace all original brand marks, copy, fonts, and colors).');
  } else {
    for (const a of artifacts) {
      domTextLines.push('  - [' + a.type + '] ' + a.description);
    }
  }
  domTextLines.push('');
  domTextLines.push('=== STRUCTURAL SECTIONS (TOP TO BOTTOM) ===');
  for (const s of sections) {
    domTextLines.push(
      '  [' + s.tag + ' y=' + s.y + ' h=' + s.height + ' bg=' + s.bgHex + '] headings=' +
      JSON.stringify(s.headings) + ' ctas=' + JSON.stringify(s.ctas)
    );
  }
  domTextLines.push('');
  domTextLines.push('=== VISIBLE TEXT & SEMANTIC NODES (TOP TO BOTTOM) ===');
  for (const tn of textNodes.slice(0, 450)) {
    domTextLines.push(
      '  [y=' + tn.y + ' x=' + tn.x + ' ' + tn.tag + (tn.role ? ':' + tn.role : '') +
      ' fs=' + tn.fontSize + ' fw=' + tn.fontWeight + ' fg=' + tn.color + '] ' + tn.text
    );
  }

  return {
    title: document.title,
    url: location.href,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    scrollHeight: Math.ceil(Math.max(document.body?.scrollHeight || 0, document.documentElement?.scrollHeight || 0)),
    hasFlutter: hasFlutterGlassPane,
    artifacts,
    fontsObserved: Array.from(fontCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([family, count]) => ({ family, count })),
    bgColorsObserved: Array.from(bgColors.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([hex, count]) => ({ hex, count })),
    textColorsObserved: Array.from(textColors.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([hex, count]) => ({ hex, count })),
    sections,
    textNodes: textNodes.slice(0, 500),
    domTextReport: domTextLines.join('\\n'),
    outerHTML: document.documentElement.outerHTML,
  };
})()
`;

const HIDE_FIXED_TOPBAR_JS = `
(() => {
  window.__hiddenTopbars = [];
  for (const el of Array.from(document.querySelectorAll('header, nav, div'))) {
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'sticky') {
      const r = el.getBoundingClientRect();
      if (r.top <= 56 && r.height > 0 && r.height <= 130 && r.width >= window.innerWidth * 0.45) {
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
  // NOTE: never override requestAnimationFrame or pause CSS animations here — scroll-driven WebGL / GSAP /
  // Lenis sites (e.g. three.js hero canvases) render each scroll position via rAF, and freezing it locks
  // preloaders or the first frame over every band. Only pause videos so frames are deterministic.
  try {
    for (const v of Array.from(document.querySelectorAll('video'))) {
      try { v.pause(); } catch {}
    }
  } catch {}
  return true;
})()
`;

const PRELOADER_STATE_JS = `
(() => {
  const vw = window.innerWidth, vh = window.innerHeight;
  const isVisible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
  };
  const blockers = [];
  for (const el of Array.from(document.querySelectorAll('[class*="preload" i], [id*="preload" i], [class*="loader" i], [id*="loader" i], [class*="loading" i], [class*="splash" i]'))) {
    if (!isVisible(el)) continue;
    const r = el.getBoundingClientRect();
    if ((r.width * r.height) / (vw * vh) >= 0.5) blockers.push((el.id || el.className || el.tagName).toString().slice(0, 60));
  }
  const pctTexts = [];
  for (const el of Array.from(document.querySelectorAll('div, span, p'))) {
    const t = (el.childElementCount === 0 ? (el.textContent || '') : '').trim();
    if (/^\\d{1,3}\\s?%$/.test(t) && isVisible(el)) pctTexts.push(t);
  }
  return { blockers, pctTexts };
})()
`;

async function waitForPreloaderToClear(cdp, sessionId, label, maxWaitMs = 45000) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < maxWaitMs) {
    const res = await cdp
      .send('Runtime.evaluate', { expression: PRELOADER_STATE_JS, returnByValue: true }, sessionId, 6000)
      .catch(() => null);
    last = res?.result?.value || null;
    if (last && last.blockers.length === 0 && last.pctTexts.length === 0) {
      console.log(`  ${label} preloader cleared after ${Math.round((Date.now() - start) / 1000)}s`);
      await sleep(1500);
      return true;
    }
    await sleep(700);
  }
  console.log(`  ${label} WARNING preloader still visible after ${maxWaitMs / 1000}s: ${JSON.stringify(last)}`);
  return false;
}

const MAGICK_MAX_HEIGHT = 31500;

/**
 * Serializes a self-contained, re-renderable HTML snapshot of the live (hydrated + fully scrolled) page:
 *  - all same-origin AND cross-origin stylesheets inlined into <style> (url() rewritten to absolute),
 *  - <base href> pinned to the final URL so every remaining relative asset resolves,
 *  - img/source srcset + src made absolute and lazy-loading disabled,
 *  - scripts removed so the saved file renders the captured visual state without re-running JS.
 */
const SERIALIZE_RECREATABLE_HTML_JS = `
(async () => {
  const abs = (u, baseHref) => { try { return new URL(u, baseHref).href; } catch { return u; } };
  const rewriteCssUrls = (css, baseHref) =>
    css.replace(/url\\(\\s*(['"]?)([^'")]+)\\1\\s*\\)/g, (m, q, u) =>
      /^(data:|blob:|#)/i.test(u) ? m : 'url("' + abs(u, baseHref) + '")');

  const cssChunks = [];
  let inlinedSheets = 0, fetchedSheets = 0, failedSheets = 0;
  for (const sheet of Array.from(document.styleSheets)) {
    const owner = sheet.ownerNode;
    const baseHref = sheet.href || location.href;
    let text = '';
    try {
      text = Array.from(sheet.cssRules).map((r) => r.cssText).join('\\n');
      inlinedSheets++;
    } catch {
      if (sheet.href) {
        try {
          const resp = await fetch(sheet.href, { credentials: 'omit' });
          text = await resp.text();
          fetchedSheets++;
        } catch { failedSheets++; }
      }
    }
    if (text) {
      const media = sheet.media && sheet.media.mediaText ? sheet.media.mediaText : '';
      const body = rewriteCssUrls(text, baseHref);
      cssChunks.push(media && media !== 'all' ? '@media ' + media + ' {\\n' + body + '\\n}' : body);
    }
    if (owner && owner.setAttribute) owner.setAttribute('data-url-variant-inlined', '1');
  }

  const clone = document.documentElement.cloneNode(true);
  // Mirror live properties the clone would otherwise lose
  const liveImgs = Array.from(document.querySelectorAll('img'));
  const cloneImgs = Array.from(clone.querySelectorAll('img'));
  cloneImgs.forEach((ci, i) => {
    const li = liveImgs[i];
    if (!li) return;
    if (li.currentSrc || li.src) ci.setAttribute('src', li.currentSrc || li.src);
    ci.removeAttribute('loading');
    ci.removeAttribute('srcset');
    ci.removeAttribute('sizes');
  });
  for (const s of Array.from(clone.querySelectorAll('source[srcset]'))) {
    s.setAttribute('srcset', s.getAttribute('srcset').split(',').map((part) => {
      const [u, d] = part.trim().split(/\\s+/);
      return abs(u, location.href) + (d ? ' ' + d : '');
    }).join(', '));
  }
  for (const el of Array.from(clone.querySelectorAll('[style*="url("]'))) {
    el.setAttribute('style', rewriteCssUrls(el.getAttribute('style'), location.href));
  }
  // Live canvases -> static <img> snapshots (best effort; tainted canvases are skipped)
  const liveCanvases = Array.from(document.querySelectorAll('canvas'));
  const cloneCanvases = Array.from(clone.querySelectorAll('canvas'));
  cloneCanvases.forEach((cc, i) => {
    try {
      const url = liveCanvases[i].toDataURL('image/png');
      if (url && url.length > 64) {
        const img = document.createElement('img');
        img.setAttribute('src', url);
        img.setAttribute('style', cc.getAttribute('style') || '');
        img.className = cc.className;
        cc.replaceWith(img);
      }
    } catch {}
  });
  // Strip scripts, stylesheet links (now inlined), preloads, and our own capture helpers
  for (const el of Array.from(clone.querySelectorAll('script, noscript, link[rel="stylesheet"], link[rel="preload"], link[rel="modulepreload"], style#__cdp_clean_capture__'))) {
    el.remove();
  }
  for (const el of Array.from(clone.querySelectorAll('style[data-url-variant-inlined]'))) el.remove();

  const head = clone.querySelector('head') || clone.insertBefore(document.createElement('head'), clone.firstChild);
  const base = document.createElement('base');
  base.setAttribute('href', location.href);
  head.insertBefore(base, head.firstChild);
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'url-variant-snapshot');
  meta.setAttribute('content', JSON.stringify({ source: location.href, viewport: window.innerWidth + 'x' + window.innerHeight, captured: new Date().toISOString() }));
  head.insertBefore(meta, base.nextSibling);
  const style = document.createElement('style');
  style.setAttribute('data-url-variant', 'inlined-stylesheets');
  style.textContent = cssChunks.join('\\n\\n');
  head.appendChild(style);

  const html = '<!DOCTYPE html>\\n' + clone.outerHTML;
  return { html, inlinedSheets, fetchedSheets, failedSheets, bytes: html.length };
})()
`;

async function saveRecreatableHtml(cdp, sessionId, domDir, prefix) {
  const out = {};
  try {
    const res = await cdp.send(
      'Runtime.evaluate',
      { expression: SERIALIZE_RECREATABLE_HTML_JS, returnByValue: true, awaitPromise: true },
      sessionId,
      60000
    );
    const val = res?.result?.value;
    if (val?.html) {
      const htmlPath = path.join(domDir, `${prefix}-page.html`);
      fs.writeFileSync(htmlPath, val.html, 'utf8');
      out.page_html = htmlPath;
      out.page_html_stats = { inlined: val.inlinedSheets, fetched: val.fetchedSheets, failed: val.failedSheets, bytes: val.bytes };
    }
  } catch (e) {
    out.page_html_error = String(e).slice(0, 300);
  }
  try {
    // Full-fidelity archive (HTML + CSS + images + fonts as MIME parts); opens offline in Chrome
    const snap = await cdp.send('Page.captureSnapshot', { format: 'mhtml' }, sessionId, 90000);
    if (snap?.data) {
      const mhtmlPath = path.join(domDir, `${prefix}-page.mhtml`);
      fs.writeFileSync(mhtmlPath, snap.data, 'utf8');
      out.page_mhtml = mhtmlPath;
    }
  } catch (e) {
    out.page_mhtml_error = String(e).slice(0, 300);
  }
  console.log(
    `  [${prefix}] recreatable HTML: ${out.page_html ? path.basename(out.page_html) : 'FAILED'} ` +
      `(${JSON.stringify(out.page_html_stats || out.page_html_error || {})}); MHTML: ${out.page_mhtml ? path.basename(out.page_mhtml) : 'FAILED'}`
  );
  return out;
}

function probeDims(imgPath) {
  const out = execFileSync(MAGICK_BIN, ['identify', '-format', '%w %h', `${imgPath}[0]`], { encoding: 'utf8' }).trim();
  const [w, h] = out.split(/\s+/).map(Number);
  return { w, h };
}

/**
 * Scrolls the page via both window.scrollTo and mouseWheel CDP events (so Flutter canvas scrollers
 * and custom virtual scrollers also advance), saves each 2K-ready viewport tile in `tilesDir`,
 * and stitches the full-length image into `outPng`.
 */
async function captureFullpageAndBands(cdp, sessionId, outPng, tilesDir, prefix, cssWidth, cssViewportH, totalCssHeight, dpr, maxViewports, hasFlutter) {
  fs.mkdirSync(tilesDir, { recursive: true });
  // maxViewports <= 0 => capture the ENTIRE page (hard safety cap of 60 viewports)
  const perPart = maxViewports > 0 ? maxViewports : 60;
  const maxCssHeight = Math.min(Math.max(totalCssHeight, cssViewportH), cssViewportH * perPart);
  console.log(`  [${prefix}] capturing ${Math.ceil(maxCssHeight / cssViewportH)} bands over ${maxCssHeight}px CSS (page ${totalCssHeight}px)`);

  const stitchTiles = [];
  const bandRecords = [];
  const tmpDir = path.dirname(outPng);

  try {
    // Hydrate scroll reveals across the full page
    for (let sy = 0; sy < maxCssHeight; sy += cssViewportH) {
      await cdp.send('Runtime.evaluate', { expression: `window.scrollTo(0, ${sy});`, returnByValue: true }, sessionId, 8000).catch(() => null);
      await sleep(160);
    }
    await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0);', returnByValue: true }, sessionId, 8000).catch(() => null);
    await sleep(300);
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
      if (hasFlutter && idx > 0) {
        // Dispatch mouseWheel delta for Flutter canvas viewports that ignore window.scrollTo
        await cdp.send(
          'Input.dispatchMouseEvent',
          {
            type: 'mouseWheel',
            x: Math.round(cssWidth / 2),
            y: Math.round(cssViewportH / 2),
            deltaX: 0,
            deltaY: cssViewportH,
          },
          sessionId,
          8000
        ).catch(() => null);
      }
      // Give smooth-scroll (Lenis/GSAP) + WebGL/canvas scenes time to render this scroll position
      await sleep(idx === 0 ? 900 : 1300);

      if (idx === 1) {
        await cdp.send('Runtime.evaluate', { expression: HIDE_FIXED_TOPBAR_JS, returnByValue: true }, sessionId, 10000);
      }

      const shot = await cdp.send(
        'Page.captureScreenshot',
        { format: 'png', captureBeyondViewport: false, fromSurface: true },
        sessionId,
        15000
      );

      const bandNum = String(idx + 1).padStart(2, '0');
      const bandPath = path.join(tilesDir, `${prefix}-band-${bandNum}.png`);
      fs.writeFileSync(bandPath, Buffer.from(shot.data, 'base64'));
      const { w: bw, h: bh } = probeDims(bandPath);

      // Check if final partial slice overlapped with previous scroll stop
      let stitchTilePath = bandPath;
      let effectivePhysH = bh;
      let cropTopPhys = 0;
      if (y > 0 && y + cssViewportH > maxCssHeight) {
        const remainCss = maxCssHeight - y;
        if (remainCss >= 48) {
          const physW = Math.round(cssWidth * dpr);
          const physVpH = Math.round(cssViewportH * dpr);
          const physRemH = Math.round(remainCss * dpr);
          cropTopPhys = Math.max(0, physVpH - physRemH);
          effectivePhysH = physRemH;
          const trimmedTile = path.join(tmpDir, `__trim_${prefix}_${bandNum}.png`);
          execFileSync(MAGICK_BIN, [bandPath, '-crop', `${physW}x${physRemH}+0+${cropTopPhys}`, '+repage', trimmedTile]);
          stitchTilePath = trimmedTile;
        } else {
          try { fs.unlinkSync(bandPath); } catch {}
          break;
        }
      }

      stitchTiles.push(stitchTilePath);
      bandRecords.push({
        index: idx + 1,
        band_id: `${prefix}-band-${bandNum}`,
        file: bandPath,
        scroll_y_css: targetScrollY,
        phys_w: bw,
        phys_h: bh,
        crop_top_phys_for_stitch: cropTopPhys,
        effective_phys_h_for_stitch: effectivePhysH,
      });
      idx++;
    }
  } finally {
    try {
      await cdp.send('Runtime.evaluate', { expression: RESTORE_FIXED_TOPBAR_JS, returnByValue: true }, sessionId, 10000);
    } catch {}
  }

  let stitchScale = 1.0;
  if (stitchTiles.length === 1) {
    fs.copyFileSync(stitchTiles[0], outPng);
  } else if (stitchTiles.length > 1) {
    const totalPhysH = stitchTiles.reduce((acc, t) => acc + probeDims(t).h, 0);
    if (totalPhysH > MAGICK_MAX_HEIGHT) {
      // Keep the FULL length in one image: uniformly downscale tiles so the stitched height fits the IM ceiling.
      // Native-resolution bands remain in tilesDir as the high-res source of truth.
      stitchScale = MAGICK_MAX_HEIGHT / totalPhysH;
      const pct = (stitchScale * 100).toFixed(3);
      const scaled = [];
      for (const t of stitchTiles) {
        const sp = path.join(tmpDir, `__scaled_${path.basename(t)}`);
        execFileSync(MAGICK_BIN, [t, '-filter', 'Lanczos', '-resize', `${pct}%`, sp]);
        scaled.push(sp);
      }
      execFileSync(MAGICK_BIN, ['-limit', 'memory', '2GiB', '-limit', 'disk', '8GiB', ...scaled, '-colorspace', 'sRGB', '-append', outPng]);
      for (const sp of scaled) {
        try { fs.unlinkSync(sp); } catch {}
      }
      console.log(`  [${prefix}] full-length ${totalPhysH}px exceeds ${MAGICK_MAX_HEIGHT}px ceiling; stitched at ${pct}% scale`);
    } else {
      execFileSync(MAGICK_BIN, [...stitchTiles, '-colorspace', 'sRGB', '-append', outPng]);
    }
  }
  for (const t of stitchTiles) {
    if (path.basename(t).startsWith('__trim_')) {
      try { fs.unlinkSync(t); } catch {}
    }
  }

  const { w: fullW, h: fullH } = probeDims(outPng);
  return {
    fullpage_png: outPng,
    phys_w: fullW,
    phys_h: fullH,
    stitch_scale: Number(stitchScale.toFixed(4)),
    page_css_height: totalCssHeight,
    captured_css_height: maxCssHeight,
    bands: bandRecords,
  };
}

const DESKTOP_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

async function waitForFullDomAndAssetsLoaded(cdp, sessionId, maxWaitMs = 15000) {
  const start = Date.now();
  let stableCount = 0;
  let lastSig = '';
  while (Date.now() - start < maxWaitMs) {
    const res = await cdp
      .send(
        'Runtime.evaluate',
        {
          expression: `(() => {
            const ready = document.readyState === 'complete';
            const imgs = Array.from(document.images || []);
            const unloadedImgs = imgs.filter((im) => !im.complete && im.src).length;
            const nodeCount = document.querySelectorAll('*').length;
            const scrollH = Math.max(document.body?.scrollHeight || 0, document.documentElement?.scrollHeight || 0);
            const fontsReady = document.fonts ? document.fonts.status === 'loaded' : true;
            return { ready, unloadedImgs, nodeCount, scrollH, fontsReady };
          })()`,
          returnByValue: true,
        },
        sessionId,
        6000
      )
      .catch(() => null);
    const val = res?.result?.value;
    if (val) {
      const sig = `${val.ready}:${val.unloadedImgs}:${val.nodeCount}:${val.scrollH}:${val.fontsReady}`;
      if (val.ready && val.unloadedImgs === 0 && val.fontsReady && sig === lastSig && val.nodeCount > 5) {
        stableCount++;
        if (stableCount >= 3) break;
      } else {
        stableCount = 0;
      }
      lastSig = sig;
    }
    await sleep(500);
  }
}

async function scrollEntirePageToHydrate(cdp, sessionId, cssWidth, cssViewportH, label = '') {
  // Pass 1: Scroll down step-by-step across the entire dynamically expanding page
  const deadline = Date.now() + 90000;
  let currentY = 0;
  const maxSteps = 40;
  const step = Math.round(cssViewportH * 0.75);
  let lastMaxH = 0;
  for (let i = 0; i < maxSteps && Date.now() < deadline; i++) {
    const res = await cdp
      .send(
        'Runtime.evaluate',
        {
          expression: `(() => {
            const before = window.scrollY;
            window.scrollTo(0, ${currentY});
            for (const im of Array.from(document.querySelectorAll('img[loading="lazy"], iframe[loading="lazy"]'))) {
              im.setAttribute('loading', 'eager');
            }
            let maxH = Math.max(
              document.body?.scrollHeight || 0,
              document.documentElement?.scrollHeight || 0,
              window.innerHeight
            );
            for (const el of Array.from(document.querySelectorAll('div, main, section, flt-glass-pane, flutter-view'))) {
              if (el.scrollHeight > maxH && el.clientHeight >= window.innerHeight * 0.7) {
                maxH = el.scrollHeight;
              }
            }
            return { before, scrollY: window.scrollY, maxH: Math.ceil(maxH) };
          })()`,
          returnByValue: true,
        },
        sessionId,
        6000
      )
      .catch(() => null);
    const val = res?.result?.value;

    // Only dispatch a mouseWheel when window.scrollTo did not move the page (custom/Flutter scrollers)
    if (val && currentY > 0 && Math.abs(val.scrollY - currentY) > 4 && val.scrollY + cssViewportH < val.maxH) {
      await cdp
        .send(
          'Input.dispatchMouseEvent',
          {
            type: 'mouseWheel',
            x: Math.round(cssWidth / 2),
            y: Math.round(cssViewportH / 2),
            deltaX: 0,
            deltaY: step,
          },
          sessionId,
          2000
        )
        .catch(() => null);
    }

    await sleep(350);
    const maxH = val?.maxH || lastMaxH || cssViewportH * 3;
    lastMaxH = maxH;
    if (i % 4 === 0) console.log(`  ${label} scroll-hydrate y=${currentY}/${maxH}`);
    if (currentY + cssViewportH >= maxH) {
      await cdp
        .send('Runtime.evaluate', { expression: `window.scrollTo(0, ${maxH});`, returnByValue: true }, sessionId, 6000)
        .catch(() => null);
      await sleep(600);
      break;
    }
    currentY += step;
  }
  console.log(`  ${label} reached page bottom (scrollHeight ~${lastMaxH}px CSS)`);

  // Wait for any newly triggered lazy images/fonts to finish decoding
  await waitForFullDomAndAssetsLoaded(cdp, sessionId, 6000);

  // Scroll back to top (0, 0) and settle
  await cdp
    .send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0);', returnByValue: true }, sessionId, 8000)
    .catch(() => null);
  await sleep(700);
}

async function openHydratedSurface(cdp, url, { width, height, dpr, mobile, ua }) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  await cdp.send('Target.activateTarget', { targetId }).catch(() => null);
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('DOM.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Network.setUserAgentOverride', { userAgent: ua }, sessionId);
  await cdp.send(
    'Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: dpr, mobile },
    sessionId
  );

  const label = mobile ? '[mobile]' : '[desktop]';
  const domReady = cdp.waitForEvent('Page.domContentEventFired', sessionId, 25000);
  const loadDone = cdp.waitForEvent('Page.loadEventFired', sessionId, 30000);
  await cdp.send('Page.navigate', { url }, sessionId, 35000).catch(() => null);
  await Promise.race([loadDone, domReady.then(() => sleep(mobile ? 4500 : 5000))]);
  await sleep(mobile ? 2200 : 2500);
  console.log(`  ${label} navigation settled`);

  const bypassed = await cdp
    .send('Runtime.evaluate', { expression: BYPASS_CORP_INTERSTITIAL_JS, returnByValue: true }, sessionId, 10000)
    .catch(() => null);
  if (bypassed?.result?.value) await sleep(4000);

  // 1. Wait until initial DOM, web fonts, and above-the-fold images are 100% loaded
  await waitForFullDomAndAssetsLoaded(cdp, sessionId, 12000);
  console.log(`  ${label} DOM + fonts + images loaded (stable)`);

  // 1b. Wait for any full-screen preloader / loading percentage overlay to finish and fade out
  await waitForPreloaderToClear(cdp, sessionId, label, 45000);

  // 2. Enable Flutter semantics & strip cookie/chat overlays
  await cdp
    .send('Runtime.evaluate', { expression: HYDRATE_AND_ENABLE_FLUTTER_SEMANTICS_JS, returnByValue: true }, sessionId, 15000)
    .catch(() => null);

  // 3. Scroll the entire page top-to-bottom-to-top BEFORE extracting the DOM or capturing screenshots
  await scrollEntirePageToHydrate(cdp, sessionId, width, height, label);
  console.log(`  ${label} full-page scroll hydration complete; back at top`);

  // 4. Re-measure hydrated scrollHeight after full-page scroll
  const hydRes = await cdp
    .send('Runtime.evaluate', { expression: HYDRATE_AND_ENABLE_FLUTTER_SEMANTICS_JS, returnByValue: true }, sessionId, 15000)
    .catch(() => null);
  const hydrate = hydRes?.result?.value || {};
  return { targetId, sessionId, hydrate };
}

function crop2KHero(fullPng, outPng, targetW, targetH) {
  const { w, h } = probeDims(fullPng);
  const cropH = Math.min(h, Math.round((w * targetH) / targetW));
  execFileSync(MAGICK_BIN, [
    fullPng,
    '-crop',
    `${w}x${cropH}+0+0`,
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

async function main() {
  const args = process.argv.slice(2);
  let url = '';
  let outDir = '';
  let maxViewports = 0; // 0 = capture the entire page length
  let htmlOnly = false;

  for (const a of args) {
    if (a.startsWith('--url=')) url = a.slice('--url='.length).trim();
    else if (a.startsWith('--out-dir=')) outDir = a.slice('--out-dir='.length).trim();
    else if (a.startsWith('--max-viewports=')) maxViewports = Math.max(0, Number(a.slice('--max-viewports='.length)) || 0);
    else if (a === '--html-only') htmlOnly = true;
  }

  if (!url || !outDir) {
    console.error('Usage: node capture_url_devtools_and_dom.mjs --url="https://..." --out-dir="/path/to/study" [--max-viewports=0] [--html-only]');
    process.exit(1);
  }
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  outDir = path.resolve(outDir);
  const capturesDir = path.join(outDir, 'captures');
  const tilesDir = path.join(capturesDir, 'tiles');
  const domDir = path.join(outDir, 'dom');
  fs.mkdirSync(capturesDir, { recursive: true });
  fs.mkdirSync(tilesDir, { recursive: true });
  fs.mkdirSync(domDir, { recursive: true });

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-url-variant-'));
  const { proc, cdp } = await launchChrome(profileDir);

  if (htmlOnly) {
    // Re-save only the recreatable page HTML + MHTML for both surfaces (no screenshots, audit untouched except paths)
    try {
      const results = {};
      for (const [surface, opts] of [
        ['desktop', { width: 1440, height: 900, dpr: 2, mobile: false, ua: DESKTOP_UA }],
        ['mobile', { width: 390, height: 844, dpr: 3, mobile: true, ua: MOBILE_UA }],
      ]) {
        console.log(`[html-only] ${surface}: hydrating ${url} ...`);
        const pg = await openHydratedSurface(cdp, url, opts);
        try {
          results[surface] = await saveRecreatableHtml(cdp, pg.sessionId, domDir, surface);
        } finally {
          try { await cdp.send('Target.closeTarget', { targetId: pg.targetId }); } catch {}
        }
      }
      const auditPath = path.join(domDir, 'dom-audit.json');
      if (fs.existsSync(auditPath)) {
        const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
        for (const s of ['desktop', 'mobile']) {
          audit[s] = audit[s] || {};
          if (results[s]?.page_html) audit[s].page_html = path.relative(outDir, results[s].page_html);
          if (results[s]?.page_mhtml) audit[s].page_mhtml = path.relative(outDir, results[s].page_mhtml);
        }
        fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n', 'utf8');
      }
      console.log('[DONE] html-only snapshot saved.');
    } finally {
      cdp.close();
      try { proc.kill('SIGKILL'); } catch {}
      try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
    }
    return;
  }

  try {
    // 1. DESKTOP PASS (@2x 1440x900 -> 2880px wide)
    console.log(`[1/2] Capturing Desktop full-length screenshot & DOM (${url}) ...`);
    const deskPage = await openHydratedSurface(cdp, url, {
      width: 1440,
      height: 900,
      dpr: 2,
      mobile: false,
      ua: DESKTOP_UA,
    });
    let deskDom = {};
    let deskShot = {};
    try {
      const domRes = await cdp.send(
        'Runtime.evaluate',
        { expression: EXTRACT_DOM_AND_ARTIFACTS_JS, returnByValue: true },
        deskPage.sessionId,
        30000
      );
      deskDom = domRes?.result?.value || {};
      console.log(`  [desktop] DOM extracted (${(deskDom.textNodes || []).length} text nodes); capturing bands ...`);
      fs.writeFileSync(path.join(domDir, 'desktop-dom.txt'), (deskDom.domTextReport || '') + '\n', 'utf8');
      fs.writeFileSync(path.join(domDir, 'desktop-dom.html'), (deskDom.outerHTML || '') + '\n', 'utf8');
      deskDom.recreatable = await saveRecreatableHtml(cdp, deskPage.sessionId, domDir, 'desktop');

      const scrollH = deskDom.scrollHeight || deskPage.hydrate.scrollHeight || 2700;
      const deskFullPng = path.join(capturesDir, 'desktop-fullpage.png');
      deskShot = await captureFullpageAndBands(
        cdp,
        deskPage.sessionId,
        deskFullPng,
        tilesDir,
        'desktop',
        1440,
        900,
        scrollH,
        2,
        maxViewports,
        Boolean(deskDom.hasFlutter)
      );
      crop2KHero(deskFullPng, path.join(capturesDir, 'desktop-base-hero-2k.png'), 2752, 1536);
      console.log(`  -> Desktop PNG: ${deskShot.phys_w}x${deskShot.phys_h} (${deskShot.bands.length} bands)`);
      console.log(`  -> Desktop DOM text: dom/desktop-dom.txt (${(deskDom.textNodes || []).length} text nodes)`);
    } finally {
      try { await cdp.send('Target.closeTarget', { targetId: deskPage.targetId }); } catch {}
    }

    // 2. MOBILE PASS (@3x 390x844 -> 1170px wide)
    console.log(`[2/2] Capturing Mobile full-length screenshot & DOM (${url}) ...`);
    const mobPage = await openHydratedSurface(cdp, url, {
      width: 390,
      height: 844,
      dpr: 3,
      mobile: true,
      ua: MOBILE_UA,
    });
    let mobDom = {};
    let mobShot = {};
    try {
      const domRes = await cdp.send(
        'Runtime.evaluate',
        { expression: EXTRACT_DOM_AND_ARTIFACTS_JS, returnByValue: true },
        mobPage.sessionId,
        30000
      );
      mobDom = domRes?.result?.value || {};
      fs.writeFileSync(path.join(domDir, 'mobile-dom.txt'), (mobDom.domTextReport || '') + '\n', 'utf8');
      fs.writeFileSync(path.join(domDir, 'mobile-dom.html'), (mobDom.outerHTML || '') + '\n', 'utf8');
      mobDom.recreatable = await saveRecreatableHtml(cdp, mobPage.sessionId, domDir, 'mobile');

      const scrollH = mobDom.scrollHeight || mobPage.hydrate.scrollHeight || 2532;
      const mobFullPng = path.join(capturesDir, 'mobile-fullpage.png');
      mobShot = await captureFullpageAndBands(
        cdp,
        mobPage.sessionId,
        mobFullPng,
        tilesDir,
        'mobile',
        390,
        844,
        scrollH,
        3,
        maxViewports,
        Boolean(mobDom.hasFlutter)
      );
      crop2KHero(mobFullPng, path.join(capturesDir, 'mobile-base-hero-2k.png'), 1536, 2752);
      console.log(`  -> Mobile PNG: ${mobShot.phys_w}x${mobShot.phys_h} (${mobShot.bands.length} bands)`);
      console.log(`  -> Mobile DOM text: dom/mobile-dom.txt (${(mobDom.textNodes || []).length} text nodes)`);
    } finally {
      try { await cdp.send('Target.closeTarget', { targetId: mobPage.targetId }); } catch {}
    }

    // 3. BUILD UNIFIED DOM & ARTIFACT AUDIT (dom/dom-audit.json)
    const allFonts = Array.from(
      new Set([
        ...(deskDom.fontsObserved || []).map((f) => f.family),
        ...(mobDom.fontsObserved || []).map((f) => f.family),
      ])
    );
    const allBgColors = Array.from(
      new Set([
        ...(deskDom.bgColorsObserved || []).map((c) => c.hex),
        ...(mobDom.bgColorsObserved || []).map((c) => c.hex),
      ])
    );
    const allTextColors = Array.from(
      new Set([
        ...(deskDom.textColorsObserved || []).map((c) => c.hex),
        ...(mobDom.textColorsObserved || []).map((c) => c.hex),
      ])
    );
    const allPhrases = Array.from(
      new Set([
        ...(deskDom.textNodes || []).map((t) => t.text),
        ...(mobDom.textNodes || []).map((t) => t.text),
      ])
    ).slice(0, 300);

    const audit = {
      captured_at: new Date().toISOString(),
      url,
      final_url: deskDom.url || url,
      title: deskDom.title || mobDom.title || '',
      has_flutter: Boolean(deskDom.hasFlutter || mobDom.hasFlutter),
      artifacts_detected: [
        ...(deskDom.artifacts || []),
        ...(mobDom.artifacts || []).filter(
          (ma) => !(deskDom.artifacts || []).some((da) => da.type === ma.type)
        ),
      ],
      avoid_fonts: allFonts,
      avoid_bg_colors: allBgColors,
      avoid_text_colors: allTextColors,
      forbidden_copy_phrases: allPhrases,
      desktop: {
        fullpage_png: 'captures/desktop-fullpage.png',
        hero_2k_png: 'captures/desktop-base-hero-2k.png',
        dom_txt: 'dom/desktop-dom.txt',
        dom_html: 'dom/desktop-dom.html',
        page_html: deskDom.recreatable?.page_html ? path.relative(outDir, deskDom.recreatable.page_html) : null,
        page_mhtml: deskDom.recreatable?.page_mhtml ? path.relative(outDir, deskDom.recreatable.page_mhtml) : null,
        phys_w: deskShot.phys_w,
        phys_h: deskShot.phys_h,
        stitch_scale: deskShot.stitch_scale,
        page_css_height: deskShot.page_css_height,
        captured_css_height: deskShot.captured_css_height,
        bands: (deskShot.bands || []).map((b) => ({
          ...b,
          file: path.relative(outDir, b.file),
        })),
        sections: deskDom.sections || [],
      },
      mobile: {
        fullpage_png: 'captures/mobile-fullpage.png',
        hero_2k_png: 'captures/mobile-base-hero-2k.png',
        dom_txt: 'dom/mobile-dom.txt',
        dom_html: 'dom/mobile-dom.html',
        page_html: mobDom.recreatable?.page_html ? path.relative(outDir, mobDom.recreatable.page_html) : null,
        page_mhtml: mobDom.recreatable?.page_mhtml ? path.relative(outDir, mobDom.recreatable.page_mhtml) : null,
        phys_w: mobShot.phys_w,
        phys_h: mobShot.phys_h,
        stitch_scale: mobShot.stitch_scale,
        page_css_height: mobShot.page_css_height,
        captured_css_height: mobShot.captured_css_height,
        bands: (mobShot.bands || []).map((b) => ({
          ...b,
          file: path.relative(outDir, b.file),
        })),
        sections: mobDom.sections || [],
      },
    };

    const auditPath = path.join(domDir, 'dom-audit.json');
    fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n', 'utf8');
    console.log(`\n[DONE] Capture & DOM Audit written to: ${auditPath}`);
  } finally {
    cdp.close();
    try { proc.kill('SIGKILL'); } catch {}
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
