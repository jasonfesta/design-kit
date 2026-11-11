#!/usr/bin/env python3
"""Deterministic Exemplar, Directory, Eval & Marketing Gate Checker for design-system-creation.

Serves the site directory locally WITH Google x20's exact opaque-origin CSP header:
    Content-Security-Policy: sandbox allow-scripts allow-forms allow-popups
so `window.origin === "null"` is continuously enforced across every gate:

  1. CSP_ASSET_AND_FONT_HEALTH:
     - window.origin === "null", 0 console errors, 0 pageerrors, 0 failed requests,
       0 HTTP >= 400, 0 external <script src>, 0 local crossorigin attributes.
     - In `--mode directory`: 0 <script> tags and 0 inline `on*=` attributes.
     - 0 computed or rasterized `DejaVu Sans` glyphs (verified via both computed style
       and Chromium CDP `CSS.getPlatformFontsForNode`).
  2. RESPONSIVE_NO_OVERFLOW:
     - scrollWidth <= innerWidth across 1440x900, 1024x768, 768x1024, 390x844, 320x640.
  3. ANTI_SLOP_GEOMETRY_AND_COPY:
     - <= 1 top-level page header/nav bar and <= 6 top-level nav links (no multi-row wrap).
     - 0 asymmetric thick left borders (`borderLeftWidth >= 3 && borderTopWidth < borderLeftWidth`).
     - 0 colored status dots (4..14px circular indicators on elements or ::before/::after).
     - 0 non-control status pill badges / lozenges (`borderRadius >= height * 0.45` with status words;
       generous 8..14px cards and all buttons, links, inputs, selects, switches, sliders, and dialogs
       are cleanly welcomed/exempted).
     - 0 clumsy stretched desktop inline action buttons (1..3 word `<button>` > 380px at 1440x900).
     - <= 38% visible non-code text leaf nodes rendered primarily in `monospace` (`cosplay_monospace_spam`).
     - 0 nested border prisons (elements locked inside >= 4 concentric visible bordered rectangular boxes).
     - 0 banned UI instruction copy and 0 meta-process headings.
     - In `--mode marketing`:
       * Single-row header (`<= 5` top nav links + `[data-theme-toggle]` flipping `"Dark"` <-> `"Light"`).
       * `marketing_component_docs`: >= 5 `<section data-component-doc>` chapters, each with clean `<h2>`
         (no period, no colon, no stacked eyebrow sibling), description `<p>`, `[data-usage-notes]`,
         and multi-state coverage (`>= 2` visible `[data-specimen-state]` or `[role="tablist"][data-state-tabs]`),
         plus a single-column `<ol>` Contents TOC linking to `#section` IDs.
       * `marketing_media_and_no_charts`: >= 2 loaded visible `<img>` with explicit `width`/`height`
         (0 broken `<img>`), >= 1 visible `background-image: url(...)` stage with explicit opaque
         fallback `background-color`, and 0 large synthetic chart `<svg>` elements.
       * `marketing_control_stuffing`: 0 `<input type="range">` sliders and `< 4` interactive
         `<button>`/`<input>`/`<select>` controls inside any hero specimen or `background-image: url(...)`
         stage (keeps heroes and photo banners free of stuffed sliders, steppers, and control toolbars).
       * `marketing_buzzword_slop`: blocks marketese buzzwords, `"not just ... but"` negative
         parallelism, fake `Acme Corp`/`Globex`/`Initech` names, and `★★★` star-rating spam.
  4. OKLCH_TOKEN_SYSTEM (`exemplar`, `eval` & `marketing` modes):
     - `exemplar` & `eval`: >= 8 `oklch(` token declarations on `:root` / theme scopes.
     - `marketing`: >= 24 `oklch(` token declarations across `:root` / theme scopes / shared CSS.
  5. INTERACTIVE_COMPONENT_STATES:
     - `exemplar` & `eval`: theme/density toggle, roving ARIA tabs, inline validation,
       sortable table, cloud sandbox `<dialog>`, drawer `<dialog>` (`exemplar`), and polite toast.
     - `marketing`: theme toggle flipping `"Dark"` <-> `"Light"` across light & dark (`[data-theme-toggle]`)
       and state-variant tablist (`[role="tablist"][data-state-tabs]` click + `ArrowRight`) required;
       optional pricing/tariff cadence switch (`[data-billing-toggle]` / `[data-tier-toggle]`),
       optional standalone estimator (`[data-calc-input]` -> `[data-calc-output]`),
       optional inline lead/conversion form validation (`[data-lead-form]` / `<form>` -> `aria-invalid="true"`),
       and optional cloud sandbox `<dialog>` open + `Escape` close with focus return (`[data-open-modal]`)
       verified whenever present and skipped cleanly when omitted.
  6. FORCED_COLORS_HIGH_CONTRAST:
     - Under `@media (forced-colors: active)`, primary buttons, inputs, and headings keep
       visible borders, outlines, or distinct system-color contrast.
  7. WCAG_TEXT_CONTRAST:
     - Leaf non-disabled text meets WCAG 2.2 AA (>= 4.5:1 normal text, >= 3.0:1 large text)
       evaluated via Chromium's native OKLCH/CSS Color 4 engine in both default and toggled themes.

Usage:
    python3 scripts/verify_design_system.py site/systems/switchyard.html --out-dir /tmp/check-switchyard --mode exemplar
    python3 scripts/verify_design_system.py site/marketing/switchyard.html --out-dir /tmp/check-mkt --mode marketing
    python3 scripts/verify_design_system.py site/index.html --out-dir /tmp/check-dir --mode directory
"""
from __future__ import annotations

import argparse
import functools
import http.server
import json
import os
from pathlib import Path
import re
import socket
import sys
import threading
from typing import Any
from urllib.parse import quote

# Transparent re-exec into local Playwright Python venv if invoked via bare /usr/bin/python3
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    _venv_py = Path.home() / ".venvs" / "sci" / "bin" / "python"
    if (
        _venv_py.exists()
        and Path(sys.executable).resolve() != _venv_py.resolve()
        and not os.environ.get("_VDS_REEXEC")
    ):
        os.environ["_VDS_REEXEC"] = "1"
        os.execv(str(_venv_py), [str(_venv_py), *sys.argv])
    raise


VIEWPORTS = [
    {"name": "1440", "width": 1440, "height": 900, "label": "1440x900"},
    {"name": "1024", "width": 1024, "height": 768, "label": "1024x768"},
    {"name": "768", "width": 768, "height": 1024, "label": "768x1024"},
    {"name": "390", "width": 390, "height": 844, "label": "390x844"},
    {"name": "320", "width": 320, "height": 640, "label": "320x640"},
]

X20_SANDBOX_CSP = "sandbox allow-scripts allow-forms allow-popups"


class X20SandboxHTTPHandler(http.server.SimpleHTTPRequestHandler):
    """Serves static site directory with Google x20's exact opaque-origin CSP header."""

    def end_headers(self) -> None:
        clean_path = self.path.split("?", 1)[0].split("#", 1)[0]
        if clean_path.endswith((".html", ".htm", "/")) or "." not in Path(clean_path).name:
            self.send_header("Content-Security-Policy", X20_SANDBOX_CSP)
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt: str, *args: Any) -> None:
        pass


def resolve_serve_root(html_path: Path) -> tuple[Path, str]:
    """Choose parent site/eval root so `../fonts/*.css` or `../../../fonts/*.css` resolve naturally."""
    parent = html_path.parent
    if not (parent / "fonts").is_dir():
        anc = parent
        for _ in range(4):
            anc = anc.parent
            if anc == anc.parent:
                break
            if anc.is_dir() and (anc / "fonts").is_dir():
                return anc, html_path.relative_to(anc).as_posix()
    grand = parent.parent
    if parent.name in {"systems", "pages", "exemplars", "variants", "marketing", "app"} and grand.is_dir():
        return grand, html_path.relative_to(grand).as_posix()
    return parent, html_path.name


def count_local_stylesheet_oklch(html_path: Path, serve_root: Path, hrefs: list[str]) -> tuple[int, int, int]:
    """Count OKLCH custom property names, declarations & raw values in linked local CSS sheets blocked from CSSOM by origin 'null'."""
    token_names: set[str] = set()
    decl_count = 0
    raw_count = 0
    seen_paths: set[Path] = set()
    root_resolved = serve_root.resolve()
    token_re = re.compile(r"(--[a-zA-Z0-9_-]+)\s*:\s*[^;{}]*oklch\(", re.IGNORECASE)
    raw_re = re.compile(r"oklch\([^)]+\)", re.IGNORECASE)
    import_re = re.compile(r"""@import\s+(?:url\()?\s*['"]([^'"]+\.css)['"]""", re.IGNORECASE)

    queue: list[tuple[Path, str]] = [(html_path.parent, h) for h in hrefs if h]
    while queue:
        base_dir, href = queue.pop(0)
        clean = href.split("?", 1)[0].split("#", 1)[0].strip()
        if not clean or clean.startswith(("http://", "https://", "data:", "//")):
            continue
        cand = (serve_root / clean.lstrip("/")).resolve() if clean.startswith("/") else (base_dir / clean).resolve()
        if cand in seen_paths or not cand.is_file():
            continue
        try:
            cand.relative_to(root_resolved)
        except ValueError:
            continue
        seen_paths.add(cand)
        try:
            css_txt = cand.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for m in token_re.finditer(css_txt):
            token_names.add(m.group(1).strip())
            decl_count += 1
        raw_count += len(raw_re.findall(css_txt))
        for imp in import_re.finditer(css_txt):
            queue.append((cand.parent, imp.group(1)))
    return len(token_names), decl_count, raw_count


def start_sandbox_server(root_dir: Path) -> tuple[http.server.ThreadingHTTPServer, int]:
    handler = functools.partial(X20SandboxHTTPHandler, directory=str(root_dir))
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, port


JS_STATIC_AND_ANTI_SLOP_AUDIT = r"""
(mode) => {
  const defects = [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Offscreen 1x1 CSS Color 4 (OKLCH / color-mix / lab / sRGB) -> exact sRGB RGBA resolver
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 1;
  colorCanvas.height = 1;
  const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map();

  function parseCssColor(str) {
    if (!str || str === 'transparent' || str === 'none' || str === 'rgba(0, 0, 0, 0)') {
      return [0, 0, 0, 0];
    }
    const cached = colorCache.get(str);
    if (cached) return cached;
    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillStyle = 'rgba(0,0,0,0)';
    colorCtx.fillStyle = str;
    colorCtx.fillRect(0, 0, 1, 1);
    const d = colorCtx.getImageData(0, 0, 1, 1).data;
    const out = [d[0], d[1], d[2], +(d[3] / 255).toFixed(4)];
    colorCache.set(str, out);
    return out;
  }

  function elDesc(el) {
    if (!el || !el.tagName) return 'unknown';
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    else if (typeof el.className === 'string' && el.className.trim()) {
      s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    }
    return s;
  }

  function isSrOnly(el, st) {
    if (st.clip === 'rect(0px, 0px, 0px, 0px)' || st.clipPath?.includes('inset(50%)')) return true;
    const r = el.getBoundingClientRect();
    if (r.width <= 1.5 && r.height <= 1.5 && (st.overflow === 'hidden' || st.overflowX === 'hidden')) {
      return true;
    }
    return false;
  }

  function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.closest('dialog:not([open]), [hidden], template')) return false;
    const st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) < 0.02) {
      return false;
    }
    if (isSrOnly(el, st)) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0.5 && r.height > 0.5;
  }

  // 1. CSP / Script / Origin / Font computed audit
  const origin = window.origin;
  const scripts = Array.from(document.querySelectorAll('script'));
  const externalScripts = scripts
    .filter(s => s.hasAttribute('src'))
    .map(s => s.getAttribute('src'));
  const moduleOrImportMap = scripts
    .filter(s => s.type === 'module' || s.type === 'importmap')
    .map(s => s.type + (s.src ? ':' + s.src : ''));

  const inlineHandlers = [];
  const localCrossorigin = [];
  for (const el of document.querySelectorAll('*')) {
    for (const attr of el.attributes) {
      if (attr.name.toLowerCase().startsWith('on')) {
        inlineHandlers.push(`${elDesc(el)}[${attr.name}]`);
      }
    }
    if (el.hasAttribute('crossorigin')) {
      const ref = el.getAttribute('href') || el.getAttribute('src') || '';
      if (ref && !/^https?:\/\/fonts\.gstatic\.com/i.test(ref)) {
        localCrossorigin.push(`${elDesc(el)} -> ${ref}`);
      }
    }
  }

  const dejavuComputed = [];
  const allElements = Array.from(document.querySelectorAll('body *'));
  const visibleTextNodeSelectors = [];
  let vIdx = 0;

  for (const el of allElements) {
    if (!isVisible(el)) continue;
    const st = window.getComputedStyle(el);
    if (/dejavu/i.test(st.fontFamily || '')) {
      dejavuComputed.push(`${elDesc(el)} (${st.fontFamily})`);
    }
    // Tag direct non-empty text elements for CDP platform-font check (up to 250 representative nodes)
    const hasDirectText = Array.from(el.childNodes).some(
      n => n.nodeType === 3 && n.nodeValue && n.nodeValue.trim().length > 0
    );
    if (hasDirectText && vIdx < 250) {
      const attrVal = String(++vIdx);
      el.setAttribute('data-vds-fontnode', attrVal);
      visibleTextNodeSelectors.push({
        idx: attrVal,
        desc: elDesc(el),
        textSample: (el.textContent || '').trim().slice(0, 48),
        computedFont: st.fontFamily,
      });
    }
  }

  // FontFaceSet audit
  const fontFaces = Array.from(document.fonts).map(f => ({
    family: f.family.replace(/^['"]|['"]$/g, ''),
    style: f.style,
    weight: f.weight,
    status: f.status,
  }));

  // 2. OKLCH token declaration audit across styleSheets & <style> text
  let oklchRootCount = 0;
  let oklchDeclCount = 0;
  const oklchTokenNames = new Set();
  const localStylesheetHrefs = Array.from(document.querySelectorAll('link[rel~="stylesheet"][href]'))
    .map(l => l.getAttribute('href') || '')
    .filter(Boolean);
  for (const styleEl of document.querySelectorAll('style')) {
    const txt = styleEl.textContent || '';
    const matches = txt.match(/--[a-zA-Z0-9_-]+\s*:\s*[^;{}]*oklch\(/gi) || [];
    oklchDeclCount += matches.length;
    for (const m of matches) {
      const name = m.split(':')[0].trim();
      oklchTokenNames.add(name);
    }
    const rawOklch = txt.match(/oklch\([^)]+\)/gi) || [];
    oklchRootCount += rawOklch.length;
  }
  function scanCssRuleList(ruleList, countDecls) {
    if (!ruleList) return;
    for (const rule of ruleList) {
      if (rule.cssText && /(:root|html|\[data-theme|\.dark)/i.test(rule.selectorText || rule.cssText.slice(0, 120))) {
        const matches = rule.cssText.match(/--[a-zA-Z0-9_-]+\s*:\s*[^;{}]*oklch\(/gi) || [];
        if (countDecls) oklchDeclCount += matches.length;
        for (const m of matches) oklchTokenNames.add(m.split(':')[0].trim());
        const rawM = rule.cssText.match(/oklch\([^)]+\)/gi) || [];
        if (countDecls) oklchRootCount += rawM.length;
      }
      try { if (rule.cssRules) scanCssRuleList(rule.cssRules, countDecls); } catch (_) {}
    }
  }
  try {
    for (const sheet of document.styleSheets) {
      // Inline <style> sheets were already tallied directly above; inspect adopted/non-style sheets only for decl counts
      const isInlineStyle = Boolean(sheet.ownerNode && sheet.ownerNode.tagName && sheet.ownerNode.tagName.toLowerCase() === 'style');
      let rules;
      try { rules = sheet.cssRules; } catch (_) { continue; }
      scanCssRuleList(rules, !isInlineStyle);
    }
  } catch (_) {}

  // 3. Anti-slop geometry checks
  // 3a. Top-level header/nav bar count and link cap
  // Exclude headers inside main specimen/workspace showcases (`main section header`, `article header`, `dialog header`)
  const topBars = Array.from(document.querySelectorAll('body > header, body > nav, body > [role="banner"], .page-shell > header, .site-shell > header'))
    .filter(el => {
      if (!isVisible(el)) return false;
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY < 220 && r.width >= vw * 0.55 && r.height <= 180;
    });
  // Keep only vertically stacked distinct bars (non-nested)
  const distinctTopBars = topBars.filter(
    el => !topBars.some(other => other !== el && other.contains(el))
  );
  if (distinctTopBars.length > 1) {
    // Check if one sits vertically above another
    const sorted = distinctTopBars.map(el => ({ el, r: el.getBoundingClientRect() })).sort((a, b) => a.r.top - b.r.top);
    let stackedPairs = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].r.top >= sorted[i - 1].r.bottom - 2) stackedPairs++;
    }
    if (stackedPairs >= 1) {
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'stacked_header_bars',
        element: sorted.map(s => elDesc(s.el)).join(' + '),
        message: `Found ${distinctTopBars.length} stacked top-level header/nav bars (max 1 allowed).`,
      });
    }
  }
  if (distinctTopBars.length >= 1) {
    const primaryHeader = distinctTopBars[0];
    const headerNavs = Array.from(primaryHeader.querySelectorAll('nav')).filter(isVisible);
    const navContainer = headerNavs[0] || primaryHeader;
    const navLinks = headerNavs.length > 0
      ? headerNavs.flatMap(n => Array.from(n.querySelectorAll('a[href]'))).filter(isVisible)
      : Array.from(primaryHeader.querySelectorAll('a[href]')).filter(isVisible);
    const maxNavLinks = mode === 'marketing' ? 5 : 6;
    if (navLinks.length > maxNavLinks) {
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'too_many_top_nav_links',
        element: elDesc(navContainer),
        message: `Top navigation contains ${navLinks.length} visible links (max ${maxNavLinks} allowed in ${mode} mode).`,
      });
    }
    if (vw >= 1024) {
      const rowItems = mode === 'marketing'
        ? [...navLinks, ...Array.from(primaryHeader.querySelectorAll('[data-theme-toggle]')).filter(isVisible)]
        : navLinks;
      if (rowItems.length >= 2) {
        const rowCenters = [];
        for (const item of rowItems) {
          const r = item.getBoundingClientRect();
          const cy = (r.top + r.bottom) / 2;
          if (!rowCenters.some(y => Math.abs(y - cy) <= Math.max(12, r.height * 0.65))) {
            rowCenters.push(cy);
          }
        }
        if (rowCenters.length > 1) {
          defects.push({
            gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
            kind: 'top_nav_wraps_on_desktop',
            element: elDesc(navContainer),
            message: `Top header navigation wraps across ${rowCenters.length} rows at ${vw}px desktop width.`,
          });
        }
      }
    }
  }

  // 3b. Thick left borders, 3c. Status dots, 3d. Status pill lozenges,
  // 3e. Stretched desktop buttons, 3f. Nested border prisons, 3g. Monospace spam
  const borderedBoxCache = new Map();
  function effectiveSurfaceRgb(startNode) {
    let cur = startNode;
    while (cur && cur.nodeType === 1) {
      const bg = parseCssColor(window.getComputedStyle(cur).backgroundColor);
      if (bg[3] >= 0.85) return bg;
      cur = cur.parentElement;
    }
    const scheme = window.getComputedStyle(document.documentElement).colorScheme || '';
    return scheme.includes('dark') ? [18, 18, 20, 1] : [255, 255, 255, 1];
  }

  function isVisibleBorderedRectBox(node) {
    if (borderedBoxCache.has(node)) return borderedBoxCache.get(node);
    let res = false;
    const t = node && node.tagName ? node.tagName.toLowerCase() : '';
    if (
      node &&
      node.nodeType === 1 &&
      !['html', 'body', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'svg', 'hr'].includes(t) &&
      isVisible(node)
    ) {
      const nr = node.getBoundingClientRect();
      const nst = window.getComputedStyle(node);
      const nbtw = nst.borderTopStyle !== 'none' ? (parseFloat(nst.borderTopWidth) || 0) : 0;
      const nbbw = nst.borderBottomStyle !== 'none' ? (parseFloat(nst.borderBottomWidth) || 0) : 0;
      const nblw = nst.borderLeftStyle !== 'none' ? (parseFloat(nst.borderLeftWidth) || 0) : 0;
      const nbrw = nst.borderRightStyle !== 'none' ? (parseFloat(nst.borderRightWidth) || 0) : 0;
      let nrad = parseFloat(nst.borderTopLeftRadius) || 0;
      if (String(nst.borderTopLeftRadius).endsWith('%')) {
        nrad = (nrad / 100) * Math.min(nr.width, nr.height);
      }
      if (
        nr.width >= 24 && nr.height >= 20 &&
        nbtw >= 1 && nblw >= 1 && nbbw >= 0.9 && nbrw >= 0.9 &&
        nrad < Math.min(nr.width, nr.height) * 0.48
      ) {
        const nbtc = parseCssColor(nst.borderTopColor);
        const nblc = parseCssColor(nst.borderLeftColor);
        if (nbtc[3] >= 0.06 && nblc[3] >= 0.06) {
          const pbg = effectiveSurfaceRgb(node.parentElement || document.body);
          const ownBgRaw = parseCssColor(nst.backgroundColor);
          const ownBg = ownBgRaw[3] >= 0.85 ? ownBgRaw : pbg;
          const blendParent = [
            nbtc[0] * nbtc[3] + pbg[0] * (1 - nbtc[3]),
            nbtc[1] * nbtc[3] + pbg[1] * (1 - nbtc[3]),
            nbtc[2] * nbtc[3] + pbg[2] * (1 - nbtc[3]),
          ];
          const diffParent = Math.abs(blendParent[0] - pbg[0]) + Math.abs(blendParent[1] - pbg[1]) + Math.abs(blendParent[2] - pbg[2]);
          const diffOwn = Math.abs(blendParent[0] - ownBg[0]) + Math.abs(blendParent[1] - ownBg[1]) + Math.abs(blendParent[2] - ownBg[2]);
          if (diffParent >= 10 || diffOwn >= 10) {
            res = true;
          }
        }
      }
    }
    borderedBoxCache.set(node, res);
    return res;
  }

  let nonCodeTextLeafCount = 0;
  let monoTextLeafCount = 0;
  const monoSampleElements = [];
  const seenPrisonKeys = new Set();
  let prisonDefectCount = 0;
  let stretchedBtnCount = 0;
  const monoPrimaryRe = /\b(?:ui-monospace|monospace|[a-z0-9_-]*mono|courier|consolas|menlo|monaco|inconsolata|fira\s*code|source\s*code|cascadia|iosevka)\b/i;

  for (const el of allElements) {
    if (!isVisible(el)) continue;
    const tag = el.tagName.toLowerCase();
    if (['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'use', 'text', 'tspan'].includes(tag)) {
      continue;
    }
    const st = window.getComputedStyle(el);
    const r = el.getBoundingClientRect();

    // Monospace leaf share tracking on non-code visible text leaf elements
    const hasAlphaNumDirectText = Array.from(el.childNodes).some(
      n => n.nodeType === 3 && n.nodeValue && /[A-Za-z0-9]/.test(n.nodeValue)
    );
    if (hasAlphaNumDirectText && !el.closest('code, pre, kbd, samp, var, svg')) {
      nonCodeTextLeafCount++;
      const primaryFam = (st.fontFamily || '').split(',')[0].replace(/['"]/g, '').trim();
      if (monoPrimaryRe.test(primaryFam)) {
        monoTextLeafCount++;
        if (monoSampleElements.length < 5) {
          monoSampleElements.push(`${elDesc(el)} (${primaryFam})`);
        }
      }
    }

    // Nested border prison check (>= 4 concentric visible bordered rectangular boxes)
    if (prisonDefectCount < 6 && isVisibleBorderedRectBox(el)) {
      const hostBtn = el.closest('button, [role="switch"]');
      // Skip internal sub-spans inside a button/switch; evaluate container & leaf-control chains cleanly
      if (!hostBtn || hostBtn === el) {
        const chain = [];
        let cur = el;
        while (cur && cur !== document.body && cur !== document.documentElement) {
          if (isVisibleBorderedRectBox(cur)) {
            const curBtn = cur.closest('button, [role="switch"]');
            if (!curBtn || curBtn === cur) {
              chain.push(cur);
            }
          }
          cur = cur.parentElement;
        }
        if (chain.length >= 4) {
          chain.reverse();
          // Deduplicate on the top 3 outer prison ancestors so sibling cells report once cleanly
          const key = chain.slice(0, 3).map(n => elDesc(n) + '@' + Math.round(n.getBoundingClientRect().top)).join('>');
          if (!seenPrisonKeys.has(key)) {
            seenPrisonKeys.add(key);
            prisonDefectCount++;
            defects.push({
              gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
              kind: 'nested_border_prison',
              element: chain.map(elDesc).join(' > '),
              message: `Nested border prison (${chain.length} concentric visible bordered boxes: ${chain.map(elDesc).join(' > ')}); prefer whitespace, proximity, and subtle tonal shifts.`,
            });
          }
        }
      }
    }

    // Thick left border check
    const blw = parseFloat(st.borderLeftWidth) || 0;
    const btw = parseFloat(st.borderTopWidth) || 0;
    if (blw >= 3 && btw < blw && st.borderLeftStyle !== 'none') {
      const blc = parseCssColor(st.borderLeftColor);
      if (blc[3] > 0.08) {
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'thick_left_border',
          element: elDesc(el),
          message: `Asymmetric thick left border (${blw}px left vs ${btw}px top) detected.`,
        });
      }
    }

    // Interactive & dialog exemptions for dots & pills (generous 8..14px cards and soft controls welcomed)
    const inSwitchOrSlider = Boolean(
      el.closest('[role="switch"], input[type="range"], input[type="radio"], [role="radio"], [role="slider"], [data-allow-control-thumb]')
    );
    const isInteractiveControl = Boolean(
      inSwitchOrSlider ||
      ['button', 'input', 'select', 'textarea', 'summary', 'dialog', 'a'].includes(tag) ||
      el.closest('button, a[href], select, input, textarea, summary, [role="button"], [role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="checkbox"], [role="combobox"], [data-allow-pill]')
    );

    const txt = (el.textContent || '').trim().replace(/\s+/g, ' ');
    const wordCount = txt ? txt.split(/\s+/).length : 0;
    const minDim = Math.min(r.width, r.height);
    let br = parseFloat(st.borderTopLeftRadius) || 0;
    if (String(st.borderTopLeftRadius).endsWith('%')) {
      br = (br / 100) * minDim;
    }

    // Stretched desktop inline button check at 1440x900
    if (vw >= 1200 && tag === 'button' && stretchedBtnCount < 6) {
      const btnRole = (el.getAttribute('role') || '').toLowerCase();
      const isCompositeRole = [
        'tab', 'switch', 'option', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
        'combobox', 'treeitem', 'gridcell', 'row', 'radio', 'checkbox', 'slider',
      ].includes(btnRole);
      const isAccordionOrListbox = el.hasAttribute('aria-expanded') || el.getAttribute('aria-haspopup') === 'listbox';
      const inCompositeParent = Boolean(
        el.closest('table, tr, td, th, summary, [role="tablist"], [role="menu"], [role="listbox"], [role="grid"], [role="tree"], [role="radiogroup"], [data-allow-block-button]')
      );
      const clsAndId = ((typeof el.className === 'string' ? el.className : '') + ' ' + (el.id || '')).toLowerCase();
      const isCardOrMatrixCell = (
        r.height >= 72 ||
        Boolean(el.querySelector('h1, h2, h3, h4, h5, h6, p, dl, article, table')) ||
        /(?:^|[\s_-])(?:card|row|accordion|collapse|disclosure|tile|cell|matrix|item|select|combo|cmdk|search)(?:$|[\s_-])/.test(clsAndId)
      );
      if (
        !isCompositeRole &&
        !isAccordionOrListbox &&
        !inCompositeParent &&
        !isCardOrMatrixCell &&
        wordCount >= 1 &&
        wordCount <= 3 &&
        txt.length >= 2 &&
        txt.length <= 32 &&
        r.width > 380
      ) {
        stretchedBtnCount++;
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'stretched_desktop_button',
          element: elDesc(el),
          message: `Clumsy stretched block button "${txt}" is ${Math.round(r.width)}px wide at ${vw}px desktop (max 380px for 1-3 word inline actions).`,
        });
      }
    }

    // Colored status dot check on real element
    if (
      !isInteractiveControl &&
      txt.length === 0 &&
      el.children.length === 0 &&
      r.width >= 4 && r.width <= 14.5 &&
      r.height >= 4 && r.height <= 14.5 &&
      Math.abs(r.width - r.height) <= 3 &&
      br >= minDim * 0.45
    ) {
      const bg = parseCssColor(st.backgroundColor);
      if (bg[3] > 0.15) {
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'colored_status_dot',
          element: elDesc(el),
          message: `Colored circular status dot (${Math.round(r.width)}x${Math.round(r.height)}px, radius ${st.borderTopLeftRadius}, bg ${st.backgroundColor}) is banned.`,
        });
      }
    }

    // Colored status dot check on ::before and ::after pseudo-elements
    if (!inSwitchOrSlider && !['input', 'button', 'select', 'dialog'].includes(tag)) {
      for (const pseudo of ['::before', '::after']) {
        const pst = window.getComputedStyle(el, pseudo);
        if (!pst || pst.content === 'none' || pst.content === 'normal' || pst.display === 'none') continue;
        const rawContent = pst.content.replace(/^['"]|['"]$/g, '').trim();
        if (rawContent.length > 0) continue;
        const pw = parseFloat(pst.width) || 0;
        const ph = parseFloat(pst.height) || 0;
        let pbr = parseFloat(pst.borderTopLeftRadius) || 0;
        if (String(pst.borderTopLeftRadius).endsWith('%')) {
          pbr = (parseFloat(pst.borderTopLeftRadius) / 100) * Math.min(pw, ph);
        }
        if (pw >= 4 && pw <= 14.5 && ph >= 4 && ph <= 14.5 && Math.abs(pw - ph) <= 3 && pbr >= Math.min(pw, ph) * 0.45) {
          const pbg = parseCssColor(pst.backgroundColor);
          if (pbg[3] > 0.15) {
            defects.push({
              gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
              kind: 'colored_status_dot_pseudo',
              element: `${elDesc(el)}${pseudo}`,
              message: `Pseudo-element colored status dot (${pw}x${ph}px, bg ${pst.backgroundColor}) is banned.`,
            });
          }
        }
      }
    }

    // Pill badge / lozenge check on non-control short-text status tags (exempts pure integer counters & all interactive controls/dialogs/cards)
    const hasOnlyInlineOrNoChildren = Array.from(el.children).every(c =>
      ['svg', 'span', 'strong', 'em', 'b', 'i', 'abbr', 'code'].includes(c.tagName.toLowerCase())
    );
    const isPureNumericCounter = /^\d{1,3}\+?$/.test(txt);
    if (
      !isInteractiveControl &&
      !isPureNumericCounter &&
      /[A-Za-z]{2,}/.test(txt) &&
      hasOnlyInlineOrNoChildren &&
      txt.length >= 2 && txt.length <= 30 &&
      wordCount <= 4 &&
      r.height >= 14 && r.height <= 38 &&
      r.width >= r.height * 1.15 &&
      r.width <= 260 &&
      br >= r.height * 0.45
    ) {
      const bg = parseCssColor(st.backgroundColor);
      const bcol = parseCssColor(st.borderTopColor);
      const hasBox = bg[3] > 0.05 || (btw >= 0.5 && st.borderTopStyle !== 'none' && bcol[3] > 0.08);
      if (hasBox) {
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'pill_badge_lozenge',
          element: elDesc(el),
          message: `Pill badge / lozenge "${txt}" (${Math.round(r.width)}x${Math.round(r.height)}px, border-radius ${st.borderTopLeftRadius}) is banned.`,
        });
      }
    }
  }

  // Monospace spam summary check (> 38% of visible non-code text leaves)
  const monoLeafShare = nonCodeTextLeafCount > 0 ? monoTextLeafCount / nonCodeTextLeafCount : 0;
  if (nonCodeTextLeafCount >= 8 && monoLeafShare > 0.38) {
    defects.push({
      gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
      kind: 'cosplay_monospace_spam',
      element: monoSampleElements.slice(0, 3).join(', ') || 'body',
      message: `Monospace overuse (${monoTextLeafCount}/${nonCodeTextLeafCount} = ${(monoLeafShare * 100).toFixed(1)}% > 38.0% max of visible non-code text nodes); reserve monospace for genuine code, IDs, or tabular figures.`,
    });
  }

  // 3e. Banned UI instruction phrases & meta-process headings
  const bannedInstructionPatterns = [
    /\bclick (?:anywhere |on any (?:card|row|item|tab) )?below\b/i,
    /\bselect any (?:plate|card|item|tab|row|system|module|option) below\b/i,
    /\buse (?:the )?(?:arrow )?keys (?:\d|to (?:switch|step|navigate))\b/i,
    /\bclick (?:on )?(?:a |any |the )?tabs? to switch\b/i,
    /\bpress (?:cmd|ctrl|\u2318)\s*\+?\s*k to\b/i,
    /\bscroll (?:down|horizontally|left or right) to explore\b/i,
    /\bhover over (?:any|the) (?:card|item|row|element)s? to\b/i,
  ];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let tnode;
  const seenCopyHits = new Set();
  while ((tnode = walker.nextNode())) {
    const val = (tnode.nodeValue || '').trim();
    if (!val) continue;
    const p = tnode.parentElement;
    if (!p || !isVisible(p)) continue;
    for (const re of bannedInstructionPatterns) {
      if (re.test(val)) {
        const key = `${re.source}::${val.slice(0, 60)}`;
        if (!seenCopyHits.has(key)) {
          seenCopyHits.add(key);
          defects.push({
            gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
            kind: 'banned_ui_instruction_copy',
            element: elDesc(p),
            message: `Banned UI instruction text detected: "${val.slice(0, 80)}"`,
          });
        }
      }
    }
  }

  const bannedHeadingPatterns = [
    /\bwhat we (?:intentionally )?left out\b/i,
    /\bwhat was left out\b/i,
    /\bour constraints\b/i,
    /\bworking with constraints\b/i,
    /\bintentional omissions\b/i,
  ];
  for (const h of document.querySelectorAll('h1, h2, h3, h4, h5, h6, summary, legend')) {
    if (!isVisible(h)) continue;
    const htxt = (h.textContent || '').trim();
    for (const re of bannedHeadingPatterns) {
      if (re.test(htxt)) {
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'meta_process_heading',
          element: elDesc(h),
          message: `Meta-process heading "${htxt}" must not appear inside a published page.`,
        });
      }
    }
  }

  // 3h. Marketing buzzword, negative-parallelism, fake-corp, and star-rating slop audit (--mode marketing)
  if (mode === 'marketing') {
    const marketeseWordRe = /\b(supercharge|supercharging|empower|empowering|seamless|seamlessly|unlock|unlocking|synergy|synergistic|elevate|elevating|next-gen|next-generation|revolutionary|revolutioni[sz]e|revolutioni[sz]ing|world-class|best-in-class|industry-leading|ai-powered|game-changer|turnkey|delve)\b/gi;
    const negParallelRe = /\bnot\s+just\b[^.!?\n]{1,120}\bbut\b/i;
    const itsNotRe = /\bit(?:'|\u2019)?s\s+not\s+(?:a\s+|an\s+|just\s+)?[a-z0-9][^.!?,\n]{1,60},\s*it(?:'|\u2019)?s\b/i;
    const fakeCorpRe = /\b(acme\s*corp(?:oration)?|acmecorp|globex|initech|hooli|umbrella\s+corp|soylent\s+corp)\b/gi;
    const starSpamRe = /(?:[\u2605\u2606\u2B50\u2729]\s*){3,}/u;

    const seenMktHits = new Set();
    let mktHitCount = 0;
    const recordMktSlop = (el, reason, matchTxt, snippet) => {
      if (mktHitCount >= 14) return;
      const key = `${reason}::${String(matchTxt).toLowerCase()}`;
      if (seenMktHits.has(key)) return;
      seenMktHits.add(key);
      mktHitCount++;
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'marketing_buzzword_slop',
        element: elDesc(el),
        message: `Banned marketing slop (${reason}: "${matchTxt}") in "${snippet.slice(0, 90)}"`,
      });
    };

    const scanMktString = (el, text) => {
      for (const m of text.matchAll(marketeseWordRe)) recordMktSlop(el, 'marketese', m[0], text);
      for (const m of text.matchAll(fakeCorpRe)) recordMktSlop(el, 'fake_company', m[0], text);
      let sm;
      if ((sm = starSpamRe.exec(text))) recordMktSlop(el, 'star_rating_spam', sm[0].trim(), text);
      if ((sm = negParallelRe.exec(text))) recordMktSlop(el, 'negative_parallelism', sm[0], text);
      if ((sm = itsNotRe.exec(text))) recordMktSlop(el, 'negative_parallelism', sm[0], text);
    };

    // Scan visible text nodes for single-phrase buzzwords, fake corps, and star rows
    const mktWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let mNode;
    while ((mNode = mktWalker.nextNode())) {
      if (mktHitCount >= 14) break;
      const raw = (mNode.nodeValue || '').replace(/\s+/g, ' ').trim();
      if (!raw) continue;
      const p = mNode.parentElement;
      if (!p || p.closest('script, style, noscript, template') || !isVisible(p)) continue;
      scanMktString(p, raw);
    }

    // Also scan sentence-level merged text on visible copy blocks so <em>/<span> splits cannot hide "not just ... but"
    const copyBlocks = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, td, th, dt, dd, label, summary, a, button'
    );
    for (const blk of copyBlocks) {
      if (mktHitCount >= 14) break;
      if (!isVisible(blk)) continue;
      const merged = (blk.innerText || blk.textContent || '').replace(/\s+/g, ' ').trim();
      if (!merged) continue;
      for (const sent of merged.split(/[.!?]+(?:\s+|$)/)) {
        const s = sent.trim();
        if (!s) continue;
        scanMktString(blk, s);
      }
    }
  }

  // 3i & 3j. Marketing design-system documentation & real-media / zero-chart audits (--mode marketing)
  let mktDocSummary = null;
  let mktMediaSummary = null;
  if (mode === 'marketing') {
    // 3i. marketing_component_docs
    const docSections = Array.from(document.querySelectorAll('section[data-component-doc]')).filter(isVisible);
    const docIds = new Set();
    let validChapterCount = 0;

    if (docSections.length < 5) {
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'marketing_component_docs',
        element: 'main',
        message: `Expected >= 5 visible <section data-component-doc> component documentation chapters, found ${docSections.length}.`,
      });
    }

    for (const sec of docSections) {
      const secLabel = elDesc(sec);
      let chOk = true;
      if (sec.id && sec.id.trim()) {
        docIds.add(sec.id.trim());
      } else {
        chOk = false;
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'marketing_component_docs',
          element: secLabel,
          message: `Component chapter ${secLabel} is missing an id attribute for single-column <ol> Contents linking.`,
        });
      }

      // Direct documentation <h2> (prefer <h2> outside live rendered specimens)
      const allH2s = Array.from(sec.querySelectorAll('h2')).filter(isVisible);
      const docH2 = allH2s.find(h => !h.closest('[data-specimen-state], [role="tabpanel"], dialog, figure, blockquote')) || allH2s[0] || null;
      if (!docH2) {
        chOk = false;
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'marketing_component_docs',
          element: secLabel,
          message: `Component chapter ${secLabel} is missing a visible <h2> heading.`,
        });
      } else {
        const h2Txt = (docH2.textContent || '').replace(/\s+/g, ' ').trim();
        if (/\.\s*$/.test(h2Txt)) {
          chOk = false;
          defects.push({
            gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
            kind: 'marketing_component_docs',
            element: elDesc(docH2),
            message: `Chapter <h2> "${h2Txt}" must not end with a trailing period.`,
          });
        }
        if (h2Txt.includes(':')) {
          chOk = false;
          defects.push({
            gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
            kind: 'marketing_component_docs',
            element: elDesc(docH2),
            message: `Chapter <h2> "${h2Txt}" must be a short direct heading without a colon.`,
          });
        }
        const prev = docH2.previousElementSibling;
        if (prev && isVisible(prev)) {
          const ptag = prev.tagName.toLowerCase();
          const ptxt = (prev.textContent || '').replace(/\s+/g, ' ').trim();
          if (
            ['p', 'span', 'div', 'small', 'strong', 'em', 'b', 'label', 'h3', 'h4', 'h5', 'h6'].includes(ptag) &&
            ptxt.length >= 1 &&
            ptxt.length <= 80 &&
            !prev.querySelector('a, button, input, select')
          ) {
            chOk = false;
            defects.push({
              gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
              kind: 'marketing_component_docs',
              element: elDesc(prev),
              message: `Stacked eyebrow/kicker "${ptxt}" immediately before <h2> "${h2Txt}" is banned; use one clear heading.`,
            });
          }
        }
      }

      // Component description <p> (outside usage notes and live specimen panels)
      const descPs = Array.from(sec.querySelectorAll('p')).filter(p =>
        isVisible(p) &&
        !p.hasAttribute('data-usage-notes') &&
        !p.closest('[data-usage-notes], [data-specimen-state], [role="tabpanel"], [role="tablist"], dialog, figure, form, table, blockquote') &&
        (p.textContent || '').replace(/\s+/g, ' ').trim().length >= 12
      );
      if (descPs.length === 0) {
        chOk = false;
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'marketing_component_docs',
          element: secLabel,
          message: `Component chapter ${secLabel} is missing a visible component description <p> outside [data-usage-notes] and specimen states.`,
        });
      }

      // Plain-English usage guidance [data-usage-notes]
      const usageEls = Array.from(sec.querySelectorAll('[data-usage-notes]')).filter(u =>
        isVisible(u) &&
        !u.closest('[data-specimen-state], [role="tabpanel"], dialog') &&
        (u.textContent || '').replace(/\s+/g, ' ').trim().length >= 20
      );
      if (usageEls.length === 0) {
        chOk = false;
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'marketing_component_docs',
          element: secLabel,
          message: `Component chapter ${secLabel} is missing visible [data-usage-notes] explaining when and how to use the component.`,
        });
      } else {
        const uTxt = usageEls.map(u => u.textContent || '').join(' ');
        const tokenSpam = uTxt.match(/--[a-z][a-z0-9]*(?:-[a-z0-9]+)+/gi) || [];
        if (tokenSpam.length >= 3) {
          chOk = false;
          defects.push({
            gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
            kind: 'marketing_component_docs',
            element: elDesc(usageEls[0]),
            message: `Usage guidance in ${secLabel} dumps raw CSS token names (${tokenSpam.slice(0, 3).join(', ')}); write plain-English usage rules instead.`,
          });
        }
      }

      // Multi-state coverage: >= 2 visible [data-specimen-state] OR [role="tablist"][data-state-tabs] with >= 2 [role="tab"]
      const visStates = Array.from(sec.querySelectorAll('[data-specimen-state]')).filter(isVisible);
      const stateTablists = Array.from(sec.querySelectorAll('[role="tablist"][data-state-tabs]')).filter(tl => {
        if (!isVisible(tl)) return false;
        const tabs = Array.from(tl.querySelectorAll('[role="tab"]')).filter(t => isVisible(t) && !t.disabled && t.getAttribute('aria-disabled') !== 'true');
        return tabs.length >= 2;
      });
      if (visStates.length < 2 && stateTablists.length === 0) {
        chOk = false;
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'marketing_component_docs',
          element: secLabel,
          message: `Component chapter ${secLabel} shows only ${visStates.length} visible state(s) and 0 [role="tablist"][data-state-tabs]; document >= 2 states or variants.`,
        });
      }
      if (chOk) validChapterCount++;
    }

    // Single-column <ol> Contents TOC linking to #section[data-component-doc] IDs
    const visOls = Array.from(document.querySelectorAll('ol')).filter(ol =>
      isVisible(ol) && !ol.closest('section[data-component-doc] [data-specimen-state], [role="tabpanel"], dialog')
    );
    let bestTocOl = null;
    let bestLinkedIds = new Set();
    for (const ol of visOls) {
      const matched = new Set();
      for (const a of ol.querySelectorAll('a[href^="#"]')) {
        if (!isVisible(a)) continue;
        const targetId = (a.getAttribute('href') || '').slice(1).trim();
        if (targetId && docIds.has(targetId)) matched.add(targetId);
      }
      if (matched.size > bestLinkedIds.size) {
        bestLinkedIds = matched;
        bestTocOl = ol;
      }
    }
    const minTocLinks = Math.max(5, Math.min(docIds.size, 5));
    if (!bestTocOl || bestLinkedIds.size < minTocLinks) {
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'marketing_component_docs',
        element: bestTocOl ? elDesc(bestTocOl) : 'ol',
        message: `Expected a single-column <ol> Contents list linking to >= ${minTocLinks} #section[data-component-doc] IDs (found ${bestLinkedIds.size}).`,
      });
    } else {
      const olSt = window.getComputedStyle(bestTocOl);
      const colCnt = olSt.columnCount === 'auto' ? 1 : (parseInt(olSt.columnCount, 10) || 1);
      const isGrid = olSt.display === 'grid' || olSt.display === 'inline-grid';
      const isRowFlex = (olSt.display === 'flex' || olSt.display === 'inline-flex') && olSt.flexDirection.startsWith('row');
      if (colCnt > 1 || isGrid || isRowFlex) {
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'marketing_component_docs',
          element: elDesc(bestTocOl),
          message: `Contents <ol> must be a single vertical column (columns: 1, non-grid); got display=${olSt.display}, column-count=${olSt.columnCount}, flex-direction=${olSt.flexDirection}.`,
        });
      }
      const tocLis = Array.from(bestTocOl.children).filter(c => c.tagName.toLowerCase() === 'li' && isVisible(c));
      if (vw >= 768 && tocLis.length >= 2) {
        const r0 = tocLis[0].getBoundingClientRect();
        let multiColGeom = false;
        for (let i = 1; i < tocLis.length; i++) {
          const prevR = tocLis[i - 1].getBoundingClientRect();
          const curR = tocLis[i].getBoundingClientRect();
          if (curR.top < prevR.top + 6 || Math.abs(curR.left - r0.left) > 28) {
            multiColGeom = true;
            break;
          }
        }
        if (multiColGeom) {
          defects.push({
            gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
            kind: 'marketing_component_docs',
            element: elDesc(bestTocOl),
            message: `Contents <ol> items split across multiple visual columns; stack Contents vertically in a single column.`,
          });
        }
      }
      for (const li of tocLis) {
        const liSt = window.getComputedStyle(li);
        const liTxt = (li.textContent || '').trim();
        if (liSt.listStyleType !== 'none' && /^\d+\.\s+/.test(liTxt)) {
          defects.push({
            gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
            kind: 'marketing_component_docs',
            element: elDesc(li),
            message: `Duplicate manual number prefix inside <ol><li> ("${liTxt.slice(0, 40)}"); <ol> already numbers items.`,
          });
          break;
        }
      }
      for (const a of bestTocOl.querySelectorAll('a[href^="#"]')) {
        if (!isVisible(a)) continue;
        const tid = (a.getAttribute('href') || '').slice(1).trim();
        if (!tid || !document.getElementById(tid)) {
          defects.push({
            gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
            kind: 'marketing_component_docs',
            element: elDesc(a),
            message: `Broken Contents <ol> anchor href="#${tid}" resolves to no element on page.`,
          });
          break;
        }
      }
    }
    mktDocSummary = {
      chapterCount: docSections.length,
      validChapterCount,
      tocLinkedChapters: bestLinkedIds.size,
    };

    // 3j. marketing_media_and_no_charts
    const visImgs = Array.from(document.querySelectorAll('img')).filter(isVisible);
    let loadedSizedImgs = 0;
    const brokenImgs = [];
    const unsizedImgs = [];
    for (const img of visImgs) {
      const okLoad = Boolean(img.complete && img.naturalWidth > 0);
      const wAttr = img.getAttribute('width');
      const hAttr = img.getAttribute('height');
      const okSize = Boolean(wAttr && hAttr && parseInt(wAttr, 10) > 0 && parseInt(hAttr, 10) > 0);
      if (!okLoad) {
        brokenImgs.push(`${elDesc(img)} (${(img.getAttribute('src') || 'empty').slice(0, 48)})`);
      } else if (!okSize) {
        unsizedImgs.push(elDesc(img));
      } else {
        loadedSizedImgs++;
      }
    }
    if (brokenImgs.length > 0) {
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'marketing_media_and_no_charts',
        element: brokenImgs[0],
        message: `Found ${brokenImgs.length} broken visible <img> element(s) with naturalWidth === 0: ${brokenImgs.slice(0, 3).join(', ')}.`,
      });
    }
    if (unsizedImgs.length > 0) {
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'marketing_media_and_no_charts',
        element: unsizedImgs[0],
        message: `Visible <img> element(s) missing explicit numeric width and height attributes: ${unsizedImgs.slice(0, 3).join(', ')}.`,
      });
    }
    if (loadedSizedImgs < 2) {
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'marketing_media_and_no_charts',
        element: 'img',
        message: `Expected >= 2 visible loaded <img> elements with naturalWidth > 0 and explicit width/height attributes, found ${loadedSizedImgs}.`,
      });
    }

    // Background-image stage(s) + mandatory explicit solid fallback background-color
    let bgUrlStageCount = 0;
    let missingFallbackCount = 0;
    for (const el of allElements) {
      if (!isVisible(el)) continue;
      const t = el.tagName.toLowerCase();
      if (['select', 'input', 'svg', 'path', 'rect', 'circle', 'g'].includes(t)) continue;
      const st = window.getComputedStyle(el);
      const bgImg = st.backgroundImage || '';
      if (!bgImg.includes('url(')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 64) continue;
      bgUrlStageCount++;

      const ownBg = parseCssColor(st.backgroundColor);
      let hasFallbackBg = ownBg[3] >= 0.85;
      if (
        !hasFallbackBg &&
        el.getAttribute('aria-hidden') === 'true' &&
        (el.textContent || '').trim() === '' &&
        st.position === 'absolute' &&
        el.parentElement
      ) {
        const pBg = parseCssColor(window.getComputedStyle(el.parentElement).backgroundColor);
        hasFallbackBg = pBg[3] >= 0.85;
      }
      if (!hasFallbackBg && missingFallbackCount < 4) {
        missingFallbackCount++;
        defects.push({
          gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
          kind: 'marketing_media_and_no_charts',
          element: elDesc(el),
          message: `Background-image stage ${elDesc(el)} lacks an explicit opaque fallback background-color (got ${st.backgroundColor}); declare solid background-color behind every background-image stage.`,
        });
      }
    }
    if (bgUrlStageCount < 1) {
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'marketing_media_and_no_charts',
        element: 'body',
        message: `Expected >= 1 visible background-image stage (>=120x64px) with computed background-image containing url(...), found 0.`,
      });
    }

    // Zero large synthetic chart <svg> elements (width > 120 && height > 60 with polylines, rect bars, lines, or multi-segment chart paths)
    let chartSvgCount = 0;
    for (const svg of document.querySelectorAll('svg')) {
      if (svg.closest('template')) continue;
      let sw = 0;
      let sh = 0;
      if (isVisible(svg)) {
        const sr = svg.getBoundingClientRect();
        sw = sr.width;
        sh = sr.height;
      } else {
        sw = parseFloat(svg.getAttribute('width') || '0') || 0;
        sh = parseFloat(svg.getAttribute('height') || '0') || 0;
      }
      if (!(sw > 120 && sh > 60)) continue;

      const hasPoly = svg.querySelectorAll('polyline, polygon').length > 0;
      const rects = Array.from(svg.querySelectorAll('rect'));
      const hasBarRects = rects.length >= 2;
      const hasGridLines = svg.querySelectorAll('line').length >= 2;
      const hasMultiPath = Array.from(svg.querySelectorAll('path')).some(p => {
        const d = p.getAttribute('d') || '';
        const segs = d.match(/[LCSQTHV]/gi) || [];
        return segs.length >= 4;
      });
      if (hasPoly || hasBarRects || hasGridLines || hasMultiPath) {
        chartSvgCount++;
        if (chartSvgCount <= 4) {
          defects.push({
            gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
            kind: 'marketing_media_and_no_charts',
            element: elDesc(svg),
            message: `Synthetic chart <svg> (${elDesc(svg)}, ${Math.round(sw)}x${Math.round(sh)}px) is banned in marketing components; use real photography, background images, and typographic figures.`,
          });
        }
      }
    }

    // 3k. marketing_control_stuffing: forbid <input type="range"> sliders and >= 4 interactive
    // <button>/<input>/<select> controls inside any hero specimen or background-image: url(...) stage.
    const seenStuffing = new Set();
    let stuffingDefectCount = 0;
    const addStuffingDefect = (key, elNode, msg) => {
      if (stuffingDefectCount >= 10 || seenStuffing.has(key)) return;
      seenStuffing.add(key);
      stuffingDefectCount++;
      defects.push({
        gate: 'ANTI_SLOP_GEOMETRY_AND_COPY',
        kind: 'marketing_control_stuffing',
        element: elDesc(elNode),
        message: msg,
      });
    };
    const isExcludedDocSwitcher = (node) => Boolean(
      node.closest('[role="tablist"][data-state-tabs], nav, dialog:not([open]), [hidden], template')
    );
    const collectVisibleSpecimenControls = (scopeEl) => {
      const sliders = Array.from(
        scopeEl.querySelectorAll('input[type="range"], [role="slider"], [data-calc-step]')
      ).filter(c => isVisible(c) && !isExcludedDocSwitcher(c));
      const interactive = Array.from(
        scopeEl.querySelectorAll('button, input:not([type="hidden"]), select')
      ).filter(c => isVisible(c) && !isExcludedDocSwitcher(c));
      return { sliders, interactive };
    };
    const leafVisibleStatePanels = (rootEl) => {
      const cands = Array.from(rootEl.querySelectorAll('[data-specimen-state], [role="tabpanel"]')).filter(isVisible);
      const leaves = cands.filter(p => !cands.some(other => other !== p && p.contains(other)));
      return leaves.length > 0 ? leaves : [rootEl];
    };

    // Check every hero documentation chapter & hero specimen
    const heroSections = docSections.filter(sec => {
      const allH2s = Array.from(sec.querySelectorAll('h2')).filter(isVisible);
      const docH2 = allH2s.find(h => !h.closest('[data-specimen-state], [role="tabpanel"], dialog, figure, blockquote')) || allH2s[0];
      const hay = [
        sec.id || '',
        sec.getAttribute('data-component-doc') || '',
        sec.getAttribute('data-section') || '',
        docH2 ? (docH2.textContent || '') : '',
      ].join(' ');
      return /\bhero\b/i.test(hay);
    });
    for (const hSec of heroSections) {
      // Catch range sliders / calc steppers even inside inactive hero tabpanels
      const allHeroSliders = Array.from(
        hSec.querySelectorAll('input[type="range"], [role="slider"], [data-calc-step]')
      ).filter(c => !c.closest('dialog, template, [role="tablist"][data-state-tabs]'));
      if (allHeroSliders.length > 0) {
        addStuffingDefect(
          `hero-slider::${elDesc(hSec)}`,
          allHeroSliders[0],
          `Hero chapter ${elDesc(hSec)} contains ${allHeroSliders.length} slider/stepper control(s) (${allHeroSliders.slice(0, 3).map(elDesc).join(', ')}); keep heroes calm and free of sliders and calculator steppers.`
        );
      }
      for (const panel of leafVisibleStatePanels(hSec)) {
        const { interactive } = collectVisibleSpecimenControls(panel);
        if (interactive.length >= 4) {
          addStuffingDefect(
            `panel-count::${elDesc(panel)}@${Math.round(panel.getBoundingClientRect().top)}`,
            panel,
            `Hero specimen state ${elDesc(panel)} stuffs ${interactive.length} interactive <button>/<input>/<select> controls (max 3 allowed: e.g. 1-2 inputs + 1 submit, or 1 primary CTA + text link; found ${interactive.slice(0, 5).map(elDesc).join(', ')}).`
          );
        }
      }
    }

    // Check every visible background-image: url(...) stage
    for (const el of allElements) {
      if (!isVisible(el)) continue;
      const t = el.tagName.toLowerCase();
      if (['select', 'input', 'svg', 'path', 'rect', 'circle', 'g'].includes(t)) continue;
      const st = window.getComputedStyle(el);
      if (!(st.backgroundImage || '').includes('url(')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 64) continue;

      // Resolve absolute empty photo backdrop layers up to their enclosing banner stage
      const stageHost = (
        el.children.length === 0 &&
        (el.textContent || '').trim() === '' &&
        st.position === 'absolute' &&
        el.parentElement
      ) ? el.parentElement : el;

      for (const scope of leafVisibleStatePanels(stageHost)) {
        const { sliders, interactive } = collectVisibleSpecimenControls(scope);
        if (sliders.length > 0) {
          addStuffingDefect(
            `bg-slider::${elDesc(stageHost)}@${Math.round(r.top)}`,
            sliders[0],
            `Background-image stage ${elDesc(stageHost)} embeds ${sliders.length} slider/stepper control(s) (${sliders.slice(0, 3).map(elDesc).join(', ')}); never stuff sliders or steppers over photography banners.`
          );
        }
        if (interactive.length >= 4) {
          addStuffingDefect(
            `panel-count::${elDesc(scope)}@${Math.round(scope.getBoundingClientRect().top)}`,
            scope,
            `Background-image stage ${elDesc(stageHost)} stuffs ${interactive.length} interactive <button>/<input>/<select> controls inside one state panel (max 3 allowed; found ${interactive.slice(0, 5).map(elDesc).join(', ')}).`
          );
        }
      }
    }

    mktMediaSummary = {
      visibleLoadedSizedImgs: loadedSizedImgs,
      brokenImgs: brokenImgs.length,
      bgUrlStages: bgUrlStageCount,
      syntheticChartSvgs: chartSvgCount,
      controlStuffingDefects: stuffingDefectCount,
    };
  }

  // Compute smart scroll anchors for plate 02 and plate 03
  const docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const maxScroll = Math.max(0, docHeight - vh);
  let compEl = null;
  let workEl = null;
  if (mode === 'marketing') {
    const visDocChaps = Array.from(document.querySelectorAll('section[data-component-doc]')).filter(isVisible);
    compEl = document.querySelector(
      '[data-section="calculator"], [data-section="bento"], [data-section="capabilities"], [data-section="components"], #doc-showcase, #showcase, #calculator, #capabilities, #bento, #how-it-works, #features, #interactive'
    ) || (visDocChaps.length >= 3 ? visDocChaps[2] : null);
    if (!compEl) {
      const calcCtrl = Array.from(document.querySelectorAll('[data-calc-input], input[type="range"]'))
        .find(el => isVisible(el) && el.getBoundingClientRect().top + window.scrollY > vh * 0.55);
      if (calcCtrl) compEl = calcCtrl.closest('section, article') || calcCtrl;
    }
    workEl = document.querySelector(
      '[data-section="pricing"], [data-section="plans"], [data-section="editions"], [data-section="fees"], [data-section="tariffs"], [data-section="proof"], [data-section="workspace"], #doc-pricing, #pricing, #plans, #editions, #membership, #tickets, #admissions, #fees, #tariffs, #eligibility'
    );
    if (!workEl) {
      const tierCtrl = document.querySelector('[data-billing-toggle], [data-tier-toggle], [data-price-monthly], [data-price]');
      if (tierCtrl && isVisible(tierCtrl)) workEl = tierCtrl.closest('section, article') || tierCtrl;
      else if (visDocChaps.length >= 5) workEl = visDocChaps[4];
    }
  } else {
    compEl = document.querySelector('[data-section="components"], #components, #specimens, #controls');
    workEl = document.querySelector('[data-section="workspace"], #workspace, #console, #studio, #ledger, #application');
  }
  const compY = compEl ? Math.min(maxScroll, Math.max(0, Math.round(compEl.getBoundingClientRect().top + window.scrollY - 24))) : Math.round(maxScroll * 0.36);
  const workY = workEl ? Math.min(maxScroll, Math.max(0, Math.round(workEl.getBoundingClientRect().top + window.scrollY - 24))) : Math.round(maxScroll * (mode === 'marketing' ? 0.68 : 0.74));

  return {
    origin,
    scriptCount: scripts.length,
    externalScripts,
    moduleOrImportMap,
    inlineHandlers,
    localCrossorigin,
    localStylesheetHrefs,
    dejavuComputed,
    fontFaces,
    visibleTextNodeSelectors,
    oklchTokenCount: oklchTokenNames.size,
    oklchDeclCount,
    oklchRawValueCount: oklchRootCount,
    nonCodeTextLeafCount,
    monoTextLeafCount,
    monoLeafShare: +monoLeafShare.toFixed(4),
    mktDocSummary,
    mktMediaSummary,
    antiSlopDefects: defects,
    scrollTargets: { docHeight, compY, workY },
  };
}
"""


JS_WCAG_CONTRAST_AUDIT = r"""
(themeLabel) => {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 1;
  colorCanvas.height = 1;
  const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map();

  function parseCssColor(str) {
    if (!str || str === 'transparent' || str === 'none' || str === 'rgba(0, 0, 0, 0)') {
      return [0, 0, 0, 0];
    }
    const cached = colorCache.get(str);
    if (cached) return cached;
    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillStyle = 'rgba(0,0,0,0)';
    colorCtx.fillStyle = str;
    colorCtx.fillRect(0, 0, 1, 1);
    const d = colorCtx.getImageData(0, 0, 1, 1).data;
    const out = [d[0], d[1], d[2], d[3] / 255];
    colorCache.set(str, out);
    return out;
  }

  // Alpha-composite fg [r,g,b,a] over opaque bg [r,g,b]
  function blendOver(fg, bg) {
    const a = fg[3];
    return [
      fg[0] * a + bg[0] * (1 - a),
      fg[1] * a + bg[1] * (1 - a),
      fg[2] * a + bg[2] * (1 - a),
    ];
  }

  function extractGradientColors(bgImg, minAlpha = 0.45) {
    if (!bgImg || bgImg === 'none' || !bgImg.includes('gradient(')) return [];
    const tokens = bgImg.match(/(?:oklch|oklab|rgb|rgba|hsl|hsla|lab|lch|color)\([^()]*(?:\([^()]*\)[^()]*)*\)|#[0-9a-fA-F]{3,8}\b/g) || [];
    return tokens.map(parseCssColor).filter(c => c[3] >= minAlpha);
  }

  function relLum(rgb) {
    const lin = rgb.map(v => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  }

  function contrastRatio(rgb1, rgb2) {
    const l1 = relLum(rgb1);
    const l2 = relLum(rgb2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  function elDesc(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    else if (typeof el.className === 'string' && el.className.trim()) {
      s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    }
    return s;
  }

  function isDisabledOrDecorative(el) {
    if (el.closest(':disabled, [disabled], [aria-disabled="true"], [aria-hidden="true"], dialog:not([open]), [hidden], template')) {
      return true;
    }
    return false;
  }

  function effectiveBackgroundCandidates(el) {
    const chain = [];
    let cur = el;
    while (cur && cur.nodeType === 1) {
      chain.push(cur);
      cur = cur.parentElement;
    }
    chain.reverse();

    const rootScheme = window.getComputedStyle(document.documentElement).colorScheme || '';
    let base = rootScheme.includes('dark') ? [16, 16, 18] : [255, 255, 255];
    let candidates = [base];
    let insideBgUrlStage = false;

    for (const anc of chain) {
      const st = window.getComputedStyle(anc);
      const bgImg = st.backgroundImage || '';
      if (bgImg.includes('url(')) insideBgUrlStage = true;
      const bg = parseCssColor(st.backgroundColor);
      if (bg[3] > 0.01) {
        candidates = candidates.map(c => blendOver(bg, c));
      }
      if (insideBgUrlStage) {
        // Over a background-image url(...) stage, localized scrims fade out to transparent over >=60% of the photo.
        // Evaluate only high-opacity protective anchor stops (>=0.78) layered over the explicit fallback background-color,
        // avoiding false failures against mid-photo fade-out feather stops.
        const protectiveStops = extractGradientColors(bgImg, 0.78);
        if (protectiveStops.length > 0) {
          const bestStop = protectiveStops.reduce((a, b) => (b[3] > a[3] ? b : a), protectiveStops[0]);
          candidates = candidates.slice(0, 2).map(c => blendOver(bestStop, c));
        }
      } else {
        const gradStops = extractGradientColors(bgImg, 0.45);
        if (gradStops.length > 0 && bg[3] < 0.92) {
          const next = [];
          for (const c of candidates.slice(0, 2)) {
            for (const gs of gradStops.slice(0, 4)) {
              next.push(blendOver(gs, c));
            }
          }
          candidates = next;
        }
      }
    }
    return candidates;
  }

  const failures = [];
  let checkedCount = 0;

  for (const el of document.querySelectorAll('body *')) {
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'svg', 'path', 'text', 'tspan', 'noscript', 'option'].includes(tag)) continue;
    if (isDisabledOrDecorative(el)) continue;

    const hasDirectText = Array.from(el.childNodes).some(
      n => n.nodeType === 3 && n.nodeValue && /[A-Za-z0-9£€$¥%−+-]/.test(n.nodeValue)
    );
    if (!hasDirectText) continue;

    const st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) < 0.99) {
      if (parseFloat(st.opacity) === 0 || st.display === 'none' || st.visibility === 'hidden') continue;
    }
    if (st.clip === 'rect(0px, 0px, 0px, 0px)' || st.clipPath?.includes('inset(50%)')) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 1.5 || r.height <= 1.5) continue;
    if (st.webkitTextFillColor && parseCssColor(st.webkitTextFillColor)[3] === 0 && st.backgroundClip === 'text') {
      continue;
    }

    const bgCandidates = effectiveBackgroundCandidates(el);
    const fgRaw = parseCssColor(st.color);
    const op = parseFloat(st.opacity) || 1;
    const fgAlpha = fgRaw[3] * op;
    if (fgAlpha < 0.05) continue;

    const fontSize = parseFloat(st.fontSize) || 16;
    const fontWeight = parseInt(st.fontWeight, 10) || 400;
    // Per WCAG 2.2 AA & spec: >= 24px or >= 18.5px bold (>=600) or >= 18px large threshold
    const isLarge = fontSize >= 18 && (fontSize >= 24 || fontWeight >= 600 || fontSize >= 18);
    const minRatio = fontSize < 18 ? 4.5 : 3.0;
    const tol = 0.05; // 8-bit sRGB 1/255 quantization tolerance

    let worstRatio = Infinity;
    let worstBg = bgCandidates[0];
    for (const bg of bgCandidates) {
      const fgBlended = blendOver([fgRaw[0], fgRaw[1], fgRaw[2], fgAlpha], bg);
      const ratio = contrastRatio(fgBlended, bg);
      if (ratio < worstRatio) {
        worstRatio = ratio;
        worstBg = bg;
      }
    }

    checkedCount++;
    if (worstRatio + tol < minRatio && failures.length < 25) {
      const sample = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      failures.push({
        theme: themeLabel,
        element: elDesc(el),
        text: sample,
        contrast: +worstRatio.toFixed(2),
        required: minRatio,
        fontSizePx: +fontSize.toFixed(1),
        fontWeight,
        fgCss: st.color,
        bgApproxRgb: worstBg.map(v => Math.round(v)),
      });
    }
  }

  return { checkedCount, failureCount: failures.length, failures };
}
"""


JS_OVERFLOW_CHECK = r"""
() => {
  const vw = window.innerWidth;
  const docSw = document.documentElement.scrollWidth;
  // Note: only documentElement.scrollWidth respects html/body overflow-x clipping for actual viewport scrollbars
  const overflows = docSw > vw;
  const culprits = [];
  if (overflows) {
    for (const el of document.querySelectorAll('body *')) {
      const st = window.getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') continue;
      // Skip children comfortably clipped inside an overflow-x: auto/hidden scroll container (e.g. responsive table wrapper)
      const clipAnc = el.parentElement?.closest('*');
      let clipped = false;
      let p = el.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        const pst = window.getComputedStyle(p);
        if (['auto', 'scroll', 'hidden', 'clip'].includes(pst.overflowX)) {
          const pr = p.getBoundingClientRect();
          if (pr.right <= vw + 0.5 && pr.left >= -0.5) {
            clipped = true;
            break;
          }
        }
        p = p.parentElement;
      }
      if (clipped) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && culprits.length < 8) {
        let desc = el.tagName.toLowerCase();
        if (el.id) desc += '#' + el.id;
        else if (typeof el.className === 'string' && el.className.trim()) {
          desc += '.' + el.className.trim().split(/\s+/)[0];
        }
        culprits.push(`${desc} (right=${Math.round(r.right)}px > ${vw}px)`);
      }
    }
  }
  return { vw, vh: window.innerHeight, scrollWidth: docSw, overflows, culprits };
}
"""


JS_FORCED_COLORS_CHECK = r"""
() => {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 1;
  colorCanvas.height = 1;
  const ctx = colorCanvas.getContext('2d', { willReadFrequently: true });
  function rgba(s) {
    if (!s || s === 'transparent' || s === 'none') return [0, 0, 0, 0];
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillStyle = s;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  }
  function dist(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  }
  function elDesc(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    else if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\s+/)[0];
    return s;
  }

  const matchesMedia = window.matchMedia('(forced-colors: active)').matches;
  const canvasBg = rgba(window.getComputedStyle(document.body).backgroundColor);
  const effectiveCanvas = canvasBg[3] > 0.5 ? canvasBg : [255, 255, 255, 1];
  const issues = [];
  let checkedControls = 0;

  const controls = document.querySelectorAll(
    'button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
  );
  for (const el of controls) {
    if (el.closest('dialog:not([open]), [hidden], template')) continue;
    const st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) < 0.05) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) continue;
    checkedControls++;

    const bw = Math.max(
      st.borderTopStyle !== 'none' ? parseFloat(st.borderTopWidth) || 0 : 0,
      st.borderBottomStyle !== 'none' ? parseFloat(st.borderBottomWidth) || 0 : 0
    );
    const bc = rgba(st.borderTopColor || st.borderBottomColor);
    const ow = st.outlineStyle !== 'none' ? parseFloat(st.outlineWidth) || 0 : 0;
    const oc = rgba(st.outlineColor);
    const fg = rgba(st.color);
    const bg = rgba(st.backgroundColor);

    const hasVisibleBorder = bw >= 1 && bc[3] > 0.2 && dist(bc, effectiveCanvas) > 30;
    const hasVisibleOutline = ow >= 1 && oc[3] > 0.2 && dist(oc, effectiveCanvas) > 30;
    const hasDistinctBg = bg[3] > 0.5 && dist(bg, effectiveCanvas) > 30;
    const hasVisibleText = ((el.textContent || el.value || el.placeholder || '').trim().length > 0) && fg[3] > 0.2 && dist(fg, effectiveCanvas) > 30;

    const tag = el.tagName.toLowerCase();
    const isNativeOsWidget = ['range', 'checkbox', 'radio'].includes(el.type) && st.appearance !== 'none';
    if (['input', 'select', 'textarea'].includes(tag)) {
      if (!hasVisibleBorder && !hasVisibleOutline && !hasDistinctBg && !isNativeOsWidget) {
        issues.push(`${elDesc(el)} has no visible border/outline/fill in forced-colors mode`);
      }
    } else if (!hasVisibleBorder && !hasVisibleOutline && !hasDistinctBg && !hasVisibleText) {
      issues.push(`${elDesc(el)} is completely invisible in forced-colors mode`);
    }
  }

  for (const h1 of document.querySelectorAll('h1')) {
    const st = window.getComputedStyle(h1);
    if (st.display === 'none' || st.visibility === 'hidden') continue;
    const fill = rgba(st.webkitTextFillColor || st.color);
    if (fill[3] < 0.2) {
      issues.push(`${elDesc(h1)} keeps transparent text fill under forced-colors: active`);
    }
  }

  return { matchesMedia, checkedControls, issues };
}
"""


def run_interactive_checks(page: Any, mode: str, out_dir: Path, console_errors: list[str], page_errors: list[str]) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, str]]:
    """Execute deterministic interactive state transitions for `exemplar` and `eval` modes."""
    results: dict[str, Any] = {}
    defects: list[dict[str, Any]] = []
    extra_shots: dict[str, str] = {}

    def err_count() -> int:
        return len(console_errors) + len(page_errors)

    # 5a. Theme & Density toggle check + toggled contrast & overflow audit
    pre_errs = err_count()
    toggle_info = page.evaluate("""() => {
        const isAct = (el) => {
          if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
          if (el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        };
        const themeBtn = Array.from(document.querySelectorAll('[data-theme-toggle]')).find(isAct)
          || Array.from(document.querySelectorAll('button, [role="switch"], [role="button"]')).find(b => {
               if (!isAct(b)) return false;
               const label = ((b.id || '') + ' ' + (b.className || '') + ' ' + (b.getAttribute('aria-label') || '') + ' ' + (b.textContent || '')).toLowerCase();
               return /\\b(theme|dark|light|night|day|appearance)\\b/.test(label);
             });
        const densityBtn = Array.from(document.querySelectorAll('[data-density-toggle]')).find(b => isAct(b) && b !== themeBtn)
          || Array.from(document.querySelectorAll('button, [role="switch"], [role="radio"], [role="tab"]')).find(b => {
               if (!isAct(b) || b === themeBtn) return false;
               const label = ((b.id || '') + ' ' + (b.getAttribute('aria-label') || '') + ' ' + (b.textContent || '')).toLowerCase();
               return /\\b(density|compact|comfortable)\\b/.test(label);
             });
        if (themeBtn) themeBtn.setAttribute('data-vds-theme-btn', '1');
        if (densityBtn && densityBtn !== themeBtn) densityBtn.setAttribute('data-vds-density-btn', '1');

        const snap = () => {
          const docSt = getComputedStyle(document.documentElement);
          const bodySt = getComputedStyle(document.body);
          const row = document.querySelector('tbody tr, [data-density-sample]');
          const ctrl = document.querySelector('input:not([type="hidden"]), button');
          return {
            htmlBg: docSt.backgroundColor,
            bodyBg: bodySt.backgroundColor,
            bodyColor: bodySt.color,
            htmlAttrs: document.documentElement.className + '|' + (document.documentElement.getAttribute('data-theme') || '') + '|' + (document.documentElement.getAttribute('data-density') || ''),
            bodyAttrs: document.body.className + '|' + (document.body.getAttribute('data-theme') || '') + '|' + (document.body.getAttribute('data-density') || ''),
            rowH: row ? Math.round(row.getBoundingClientRect().height * 10) / 10 : null,
            ctrlH: ctrl ? Math.round(ctrl.getBoundingClientRect().height * 10) / 10 : null,
          };
        };
        return {
          hasTheme: Boolean(themeBtn),
          hasDensity: Boolean(densityBtn && densityBtn !== themeBtn),
          before: snap(),
        };
    }""")

    if not toggle_info["hasTheme"] and not toggle_info["hasDensity"]:
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "missing_theme_or_density_toggle",
            "element": "body",
            "message": "Neither [data-theme-toggle] nor [data-density-toggle] was found.",
        })
        results["theme_or_density_toggle"] = {"status": "FAIL", "reason": "missing trigger"}
    else:
        target_sel = "[data-vds-theme-btn='1']" if toggle_info["hasTheme"] else "[data-vds-density-btn='1']"
        page.locator(target_sel).first.click(timeout=3000)
        page.wait_for_timeout(120)
        after_snap = page.evaluate("""() => {
            const docSt = getComputedStyle(document.documentElement);
            const bodySt = getComputedStyle(document.body);
            const row = document.querySelector('tbody tr, [data-density-sample]');
            const ctrl = document.querySelector('input:not([type="hidden"]), button');
            return {
              htmlBg: docSt.backgroundColor,
              bodyBg: bodySt.backgroundColor,
              bodyColor: bodySt.color,
              rowH: row ? Math.round(row.getBoundingClientRect().height * 10) / 10 : null,
              ctrlH: ctrl ? Math.round(ctrl.getBoundingClientRect().height * 10) / 10 : null,
              scrollWidth: document.documentElement.scrollWidth,
              innerWidth: window.innerWidth,
            };
        }""")
        b = toggle_info["before"]
        mutated = (
            after_snap["htmlBg"] != b["htmlBg"]
            or after_snap["bodyBg"] != b["bodyBg"]
            or after_snap["bodyColor"] != b["bodyColor"]
            or after_snap["rowH"] != b["rowH"]
            or after_snap["ctrlH"] != b["ctrlH"]
        )
        new_errs = err_count() - pre_errs
        overflowed = after_snap["scrollWidth"] > after_snap["innerWidth"]

        # Capture 04_1440_toggled_theme.png at scroll top AND audit WCAG contrast in toggled state!
        page.evaluate("window.scrollTo(0, 0)")
        toggled_shot = out_dir / "04_1440_toggled_theme.png"
        page.screenshot(path=str(toggled_shot), type="png", full_page=False)
        extra_shots["04_1440_toggled_theme"] = str(toggled_shot)

        toggled_contrast = page.evaluate(JS_WCAG_CONTRAST_AUDIT, "toggled")

        # Also exercise density toggle if present alongside theme toggle
        density_mutated = None
        if toggle_info["hasTheme"] and toggle_info["hasDensity"]:
            pre_d_h = after_snap["rowH"]
            page.locator("[data-vds-density-btn='1']").first.click(timeout=3000)
            page.wait_for_timeout(80)
            post_d = page.evaluate("""() => {
                const row = document.querySelector('tbody tr, [data-density-sample]');
                return {
                  rowH: row ? Math.round(row.getBoundingClientRect().height * 10) / 10 : null,
                  sw: document.documentElement.scrollWidth,
                  iw: window.innerWidth,
                };
            }""")
            density_mutated = (post_d["rowH"] != pre_d_h) and (post_d["sw"] <= post_d["iw"])
            # Restore density
            page.locator("[data-vds-density-btn='1']").first.click(timeout=3000)
            page.wait_for_timeout(60)

        # Restore original theme
        page.locator(target_sel).first.click(timeout=3000)
        page.wait_for_timeout(80)

        ok = mutated and new_errs == 0 and not overflowed
        if not mutated:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "toggle_no_visual_mutation",
                "element": target_sel,
                "message": "Clicking theme/density toggle did not change computed root/body surface or row height.",
            })
        if new_errs > 0:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "toggle_runtime_error",
                "element": target_sel,
                "message": f"Clicking theme/density toggle threw {new_errs} console/page error(s) (e.g. unguarded localStorage in origin 'null').",
            })
        if overflowed:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "toggle_horizontal_overflow",
                "element": target_sel,
                "message": f"Toggled theme/density caused horizontal overflow ({after_snap['scrollWidth']}px > {after_snap['innerWidth']}px).",
            })
        results["theme_or_density_toggle"] = {
            "status": "PASS" if ok else "FAIL",
            "mutated": mutated,
            "density_mutated": density_mutated,
            "runtime_errors_during_toggle": new_errs,
            "overflowed": overflowed,
            "toggled_contrast": toggled_contrast,
        }

    # 5b. Tabs: click + ArrowRight
    tabs_setup = page.evaluate("""() => {
        const lists = Array.from(document.querySelectorAll('[role="tablist"]')).filter(el => el.getBoundingClientRect().width > 0);
        for (const list of lists) {
          const tabs = Array.from(list.querySelectorAll('[role="tab"]')).filter(t => !t.disabled && t.getBoundingClientRect().width > 0);
          if (tabs.length >= 2) {
            tabs.forEach((t, i) => t.setAttribute('data-vds-tab', String(i)));
            const activeIdx = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
            const clickIdx = activeIdx === 0 ? 1 : 0;
            const panelState = () => tabs.map(t => {
              const pid = t.getAttribute('aria-controls');
              const p = pid ? document.getElementById(pid) : null;
              const vis = p ? (!p.hidden && getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().height > 0) : null;
              return { sel: t.getAttribute('aria-selected'), panelId: pid, panelVisible: vis };
            });
            return { found: true, count: tabs.length, initialActive: activeIdx, clickIdx, before: panelState() };
          }
        }
        return { found: false };
    }""")
    if not tabs_setup["found"]:
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "missing_tabs",
            "element": "[role='tablist']",
            "message": "No visible [role='tablist'] with >= 2 [role='tab'] buttons found.",
        })
        results["tabs"] = {"status": "FAIL", "reason": "missing tablist"}
    else:
        click_sel = f"[data-vds-tab='{tabs_setup['clickIdx']}']"
        tab_loc = page.locator(click_sel).first
        tab_loc.scroll_into_view_if_needed(timeout=3000)
        tab_loc.click(timeout=3000)
        page.wait_for_timeout(80)
        after_click = page.evaluate("""(idx) => {
            const tabs = Array.from(document.querySelectorAll('[data-vds-tab]'));
            return {
              clickedSelected: tabs[idx]?.getAttribute('aria-selected') === 'true',
              selectedIndex: tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'),
              visiblePanels: tabs.map(t => {
                const p = t.getAttribute('aria-controls') ? document.getElementById(t.getAttribute('aria-controls')) : null;
                return p ? (!p.hidden && getComputedStyle(p).display !== 'none') : null;
              }),
            };
        }""", tabs_setup["clickIdx"])

        tab_loc.focus()
        key_to_press = "ArrowRight" if tabs_setup["clickIdx"] < tabs_setup["count"] - 1 else "ArrowLeft"
        page.keyboard.press(key_to_press)
        page.wait_for_timeout(80)
        after_key = page.evaluate("""() => {
            const tabs = Array.from(document.querySelectorAll('[data-vds-tab]'));
            return {
              selectedIndex: tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'),
              visiblePanels: tabs.map(t => {
                const p = t.getAttribute('aria-controls') ? document.getElementById(t.getAttribute('aria-controls')) : null;
                return p ? (!p.hidden && getComputedStyle(p).display !== 'none') : null;
              }),
            };
        }""")
        click_ok = after_click["clickedSelected"]
        key_ok = after_key["selectedIndex"] != -1 and after_key["selectedIndex"] != after_click["selectedIndex"]
        panel_ok = (
            after_click["visiblePanels"] != after_key["visiblePanels"]
            or all(v is None for v in after_key["visiblePanels"]) is False
        ) and (after_click["visiblePanels"] != [b["panelVisible"] for b in tabs_setup["before"]] or after_click["visiblePanels"] != after_key["visiblePanels"])

        tabs_ok = click_ok and key_ok and panel_ok
        if not tabs_ok:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "tabs_interaction_failed",
                "element": "[role='tablist']",
                "message": f"Tabs failed interactive check (click_ok={click_ok}, {key_to_press}_shifted_selection={key_ok}, tabpanel_updated={panel_ok}).",
            })
        results["tabs"] = {
            "status": "PASS" if tabs_ok else "FAIL",
            "click_selected": click_ok,
            "arrow_key_shifted": key_ok,
            "panel_updated": panel_ok,
        }

    # 5c. Inline Form Validation: trigger -> aria-invalid="true" + visible aria-describedby error
    val_prep = page.evaluate("""() => {
        const inspectInvalid = () => Array.from(document.querySelectorAll('input, select, textarea'))
          .filter(el => el.getAttribute('aria-invalid') === 'true' && !el.disabled && !el.readOnly)
          .map(el => {
            const descIds = (el.getAttribute('aria-describedby') || '').trim().split(/\\s+/).filter(Boolean);
            const errEls = descIds.map(id => document.getElementById(id)).filter(Boolean);
            const visibleErr = errEls.find(e => {
              const st = getComputedStyle(e);
              const r = e.getBoundingClientRect();
              return !e.hidden && st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0 && (e.textContent || '').trim().length > 0;
            });
            return {
              name: el.id || el.name || el.tagName.toLowerCase(),
              describedBy: descIds,
              hasVisibleLinkedError: Boolean(visibleErr),
              errorText: visibleErr ? visibleErr.textContent.trim().slice(0, 80) : null,
            };
          });

        const isAct = (el) => {
          if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
          if (el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        };

        const preInvalidIds = new Set(
          Array.from(document.querySelectorAll('[aria-invalid="true"]')).map((el, i) => {
            if (!el.hasAttribute('data-vds-pre-invalid')) el.setAttribute('data-vds-pre-invalid', String(i));
            return el.getAttribute('data-vds-pre-invalid');
          })
        );

        const trigger = Array.from(document.querySelectorAll('[data-test-validate]')).find(isAct);
        if (trigger) trigger.setAttribute('data-vds-val-btn', '1');

        // Collect up to 5 visible candidate forms, prioritizing explicit [data-test-validate] & [aria-describedby] forms
        const candidateForms = Array.from(document.querySelectorAll('form')).filter(f => {
          if (f.closest('dialog:not([open]), [hidden], template')) return false;
          const r = f.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) return false;
          return Boolean(f.querySelector('input:not([type="hidden"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled])'));
        });
        candidateForms.sort((a, b) => {
          const score = (f) =>
            (trigger && f.contains(trigger) ? 100 : 0)
            + (f.querySelector('[data-test-validate]') ? 50 : 0)
            + f.querySelectorAll('input[aria-describedby], select[aria-describedby], textarea[aria-describedby]').length * 5
            + (f.querySelector('button[type="submit"]:not([disabled]):not([aria-disabled="true"])') ? 2 : 0);
          return score(b) - score(a);
        });
        const pickedForms = candidateForms.slice(0, 5);
        pickedForms.forEach((f, idx) => {
          f.setAttribute('data-vds-form-idx', String(idx));
          const sbtn = Array.from(f.querySelectorAll('[data-test-validate], button[type="submit"], input[type="submit"], button:not([type="button"])')).find(isAct);
          if (sbtn) sbtn.setAttribute('data-vds-form-sbtn', String(idx));
        });
        return {
          hasExplicitTrigger: Boolean(trigger),
          formCount: pickedForms.length,
          preCount: preInvalidIds.size,
          initialInvalid: inspectInvalid(),
        };
    }""")

    def check_newly_invalid() -> dict[str, Any]:
        return page.evaluate("""() => {
            const newly = Array.from(document.querySelectorAll('[aria-invalid="true"]:not([data-vds-pre-invalid])'));
            const allActive = newly.length > 0 ? newly : [];
            const mapped = allActive.map(el => {
              const descIds = (el.getAttribute('aria-describedby') || '').trim().split(/\\s+/).filter(Boolean);
              const errEls = descIds.map(id => document.getElementById(id)).filter(Boolean);
              const visibleErr = errEls.find(e => {
                const st = getComputedStyle(e);
                const r = e.getBoundingClientRect();
                return !e.hidden && st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0 && (e.textContent || '').trim().length > 0;
              });
              return {
                el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
                describedBy: descIds,
                hasVisibleLinkedError: Boolean(visibleErr),
                errorText: visibleErr ? visibleErr.textContent.trim().slice(0, 80) : null,
              };
            });
            return { newlyCount: mapped.length, validLinked: mapped.filter(m => m.hasVisibleLinkedError), mapped };
        }""")

    val_res: dict[str, Any] = {"newlyCount": 0, "validLinked": [], "mapped": []}
    if page.locator("[data-vds-val-btn='1']").count() > 0:
        try:
            btn = page.locator("[data-vds-val-btn='1']").first
            btn.scroll_into_view_if_needed(timeout=2500)
            btn.click(timeout=2500)
            page.wait_for_timeout(100)
            val_res = check_newly_invalid()
        except Exception:
            pass

    for f_idx in range(val_prep["formCount"]):
        if len(val_res["validLinked"]) >= 1:
            break
        # Clear editable inputs inside candidate form f_idx and trigger blur + submit validation
        page.evaluate("""(idx) => {
            const form = document.querySelector(`[data-vds-form-idx="${idx}"]`);
            if (!form) return;
            form.setAttribute('novalidate', '');
            const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'))
              .filter(el => !el.hasAttribute('data-vds-pre-invalid'));
            for (const inp of inputs) {
              inp.value = inp.type === 'email' ? 'invalid-email' : '';
              inp.dispatchEvent(new Event('input', { bubbles: true }));
              inp.dispatchEvent(new Event('change', { bubbles: true }));
              inp.dispatchEvent(new Event('blur', { bubbles: true }));
            }
        }""", f_idx)
        sbtn_sel = f"[data-vds-form-sbtn='{f_idx}']"
        clicked_submit = False
        if page.locator(sbtn_sel).count() > 0:
            try:
                sb = page.locator(sbtn_sel).first
                sb.scroll_into_view_if_needed(timeout=2500)
                sb.click(timeout=2500)
                clicked_submit = True
            except Exception:
                clicked_submit = False
        if not clicked_submit:
            page.evaluate("""(idx) => {
                const f = document.querySelector(`[data-vds-form-idx="${idx}"]`);
                if (f) f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }""", f_idx)
        page.wait_for_timeout(100)
        val_res = check_newly_invalid()

    val_ok = len(val_res["validLinked"]) >= 1
    if not val_ok:
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "form_inline_validation_failed",
            "element": "form / [data-test-validate]",
            "message": "Triggering form validation did not produce a newly invalid field (aria-invalid='true') linked via aria-describedby to a visible error message.",
        })
    results["form_validation"] = {
        "status": "PASS" if val_ok else "FAIL",
        "triggered_fields": val_res["validLinked"],
    }

    # 5d. Sortable Table: click th button / th[aria-sort] -> aria-sort flips & row 0 text changes
    sort_prep = page.evaluate("""() => {
        const ths = Array.from(document.querySelectorAll('table th[aria-sort]')).filter(th => th.getBoundingClientRect().width > 0);
        if (ths.length === 0) return { found: false };
        // Prefer a sortable th whose column has at least 2 distinct values across tbody rows
        for (const th of ths) {
          const tr = th.closest('tr');
          const table = th.closest('table');
          if (!tr || !table) continue;
          const colIdx = Array.from(tr.children).indexOf(th);
          const rows = Array.from(table.querySelectorAll('tbody tr')).filter(r => getComputedStyle(r).display !== 'none');
          const vals = rows.map(r => (r.children[colIdx]?.textContent || '').trim());
          if (new Set(vals).size >= 2) {
            th.setAttribute('data-vds-sort-th', '1');
            const clickTarget = th.querySelector('button, [role="button"]') || th;
            clickTarget.setAttribute('data-vds-sort-btn', '1');
            return { found: true, colIdx, initialSort: th.getAttribute('aria-sort'), initialFirst: vals[0], rowCount: vals.length };
          }
        }
        return { found: false, reason: 'no th[aria-sort] column with >= 2 distinct row values' };
    }""")
    if not sort_prep.get("found"):
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "missing_sortable_table",
            "element": "table th[aria-sort]",
            "message": sort_prep.get("reason", "No visible sortable table header `th[aria-sort]` found."),
        })
        results["sortable_table"] = {"status": "FAIL", "reason": sort_prep.get("reason", "missing")}
    else:
        col_idx = sort_prep["colIdx"]
        sbtn = page.locator("[data-vds-sort-btn='1']").first
        sbtn.scroll_into_view_if_needed(timeout=3000)
        sbtn.click(timeout=3000)
        page.wait_for_timeout(80)
        step1 = page.evaluate("""(colIdx) => {
            const th = document.querySelector('[data-vds-sort-th="1"]');
            const table = th.closest('table');
            const first = table.querySelector('tbody tr')?.children[colIdx]?.textContent.trim() || '';
            return { sort: th.getAttribute('aria-sort'), first };
        }""", col_idx)
        sbtn.click(timeout=3000)
        page.wait_for_timeout(80)
        step2 = page.evaluate("""(colIdx) => {
            const th = document.querySelector('[data-vds-sort-th="1"]');
            const table = th.closest('table');
            const first = table.querySelector('tbody tr')?.children[colIdx]?.textContent.trim() || '';
            return { sort: th.getAttribute('aria-sort'), first };
        }""", col_idx)
        sorts_seen = {step1["sort"], step2["sort"]}
        firsts_seen = {sort_prep["initialFirst"], step1["first"], step2["first"]}
        sort_ok = ("ascending" in sorts_seen and "descending" in sorts_seen) and len(firsts_seen) >= 2
        if not sort_ok:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "sortable_table_failed",
                "element": "th[aria-sort]",
                "message": f"Table sort failed to flip ascending/descending and reorder first row (sorts={sorted(sorts_seen)}, first_cells={sorted(firsts_seen)}).",
            })
        results["sortable_table"] = {
            "status": "PASS" if sort_ok else "FAIL",
            "states": [
                {"aria_sort": sort_prep["initialSort"], "first_cell": sort_prep["initialFirst"]},
                {"aria_sort": step1["sort"], "first_cell": step1["first"]},
                {"aria_sort": step2["sort"], "first_cell": step2["first"]},
            ],
        }

    # 5e. Toast trigger ([data-trigger-toast]) -> visible status inside [aria-live] / [role="status"] / [role="alert"]
    # Run toast BEFORE cloud sandbox so we can clear/settle before cloud sandbox shot or isolate cleanly
    toast_prep = page.evaluate("""() => {
        const isAct = (el) => {
          if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
          if (el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        };
        const btn = Array.from(document.querySelectorAll('[data-trigger-toast]')).find(isAct)
          || Array.from(document.querySelectorAll('button')).find(b => isAct(b) && /\\b(toast|notification|trigger status|test alert)\\b/i.test((b.textContent || '') + ' ' + (b.getAttribute('aria-label') || '')));
        if (!btn) return { found: false };
        btn.setAttribute('data-vds-toast-btn', '1');
        const liveSnap = () => Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"]'))
          .filter(el => {
            const st = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return !el.hidden && st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity) > 0.05 && r.width > 8 && r.height > 8 && (el.textContent || '').trim().length > 0;
          })
          .map(el => el.textContent.trim());
        return { found: true, before: liveSnap() };
    }""")
    if not toast_prep["found"]:
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "missing_toast_trigger",
            "element": "[data-trigger-toast]",
            "message": "No [data-trigger-toast] button found.",
        })
        results["toast"] = {"status": "FAIL", "reason": "missing trigger"}
    else:
        toast_after: list[str] = []
        try:
            tbtn = page.locator("[data-vds-toast-btn='1']").first
            tbtn.scroll_into_view_if_needed(timeout=3000)
            tbtn.click(timeout=3000)
            page.wait_for_timeout(150)
            toast_after = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"]'))
                  .filter(el => {
                    const st = getComputedStyle(el);
                    const r = el.getBoundingClientRect();
                    return !el.hidden && st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity) > 0.05 && r.width > 8 && r.height > 8 && (el.textContent || '').trim().length > 0;
                  })
                  .map(el => el.textContent.trim());
            }""")
        except Exception:
            toast_after = []
        toast_ok = len(toast_after) >= 1 and (toast_after != toast_prep["before"] or len(toast_prep["before"]) == 0)
        if not toast_ok:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "toast_live_region_failed",
                "element": "[data-trigger-toast]",
                "message": f"Clicking [data-trigger-toast] did not produce a new visible status inside [aria-live]/[role='status'] (before={toast_prep['before']}, after={toast_after}).",
            })
        results["toast"] = {
            "status": "PASS" if toast_ok else "FAIL",
            "live_texts": toast_after[:3],
        }

    # 5f. cloud sandbox <dialog>: [data-open-modal] -> open visible + 05_1440_modal_open.png -> Escape closes & returns focus
    modal_prep = page.evaluate("""() => {
        const isAct = (el) => {
          if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
          if (el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        };
        const btn = Array.from(document.querySelectorAll('[data-open-modal]')).find(isAct)
          || Array.from(document.querySelectorAll('button:not([data-open-drawer])')).find(b => {
               if (!isAct(b)) return false;
               const txt = ((b.textContent || '') + ' ' + (b.getAttribute('aria-label') || '')).toLowerCase();
               return b.getAttribute('aria-haspopup') === 'dialog' || /\\b(open cloud sandbox|cloud sandbox|dialog)\\b/.test(txt);
             });
        if (!btn) return { found: false };
        btn.setAttribute('data-vds-modal-btn', '1');
        return { found: true };
    }""")
    if not modal_prep["found"]:
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "missing_modal_trigger",
            "element": "[data-open-modal]",
            "message": "No [data-open-modal] trigger found.",
        })
        results["modal_dialog"] = {"status": "FAIL", "reason": "missing trigger"}
    else:
        try:
            mbtn = page.locator("[data-vds-modal-btn='1']").first
            mbtn.scroll_into_view_if_needed(timeout=3000)
            mbtn.focus()
            mbtn.click(timeout=3000)
            page.wait_for_timeout(150)
            modal_open_state = page.evaluate("""() => {
                const openDialogs = Array.from(document.querySelectorAll('dialog[open]')).filter(d => {
                  const st = getComputedStyle(d);
                  const r = d.getBoundingClientRect();
                  return st.display !== 'none' && st.visibility !== 'hidden' && r.width >= 120 && r.height >= 60;
                });
                return { count: openDialogs.length };
            }""")
            modal_shot = out_dir / "05_1440_modal_open.png"
            page.screenshot(path=str(modal_shot), type="png", full_page=False)
            extra_shots["05_1440_modal_open"] = str(modal_shot)

            page.keyboard.press("Escape")
            page.wait_for_timeout(150)
            modal_closed_state = page.evaluate("""() => {
                const stillOpen = Array.from(document.querySelectorAll('dialog[open]')).filter(d => {
                  const st = getComputedStyle(d);
                  const r = d.getBoundingClientRect();
                  return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
                }).length;
                const active = document.activeElement;
                const btn = document.querySelector('[data-vds-modal-btn="1"]');
                const focusReturned = Boolean(active && btn && (active === btn || btn.contains(active)));
                return { stillOpen, focusReturned, activeTag: active ? active.tagName.toLowerCase() + (active.id ? '#' + active.id : '') : null };
            }""")
            opened_ok = modal_open_state["count"] >= 1
            closed_ok = modal_closed_state["stillOpen"] == 0
            focus_ok = modal_closed_state["focusReturned"]
        except Exception as exc:
            opened_ok = False
            closed_ok = True
            focus_ok = False
            modal_closed_state = {"activeTag": str(exc)[:60]}
        modal_ok = opened_ok and closed_ok and focus_ok
        if not modal_ok:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "modal_dialog_lifecycle_failed",
                "element": "[data-open-modal] / dialog",
                "message": f"cloud sandbox <dialog> failed check (opened={opened_ok}, closed_on_escape={closed_ok}, focus_returned_to_trigger={focus_ok}, active={modal_closed_state['activeTag']}).",
            })
        results["modal_dialog"] = {
            "status": "PASS" if modal_ok else "FAIL",
            "opened": opened_ok,
            "closed_on_escape": closed_ok,
            "focus_returned": focus_ok,
        }
        # Clean up stuck open dialog if negative test left it open so later checks aren't obscured
        if not closed_ok:
            page.evaluate("document.querySelectorAll('dialog[open]').forEach(d => d.close())")

    # 5g. Drawer <dialog>: [data-open-drawer] (required in `exemplar`, tested if present in `eval`)
    drawer_prep = page.evaluate("""() => {
        const isAct = (el) => {
          if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
          if (el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        };
        const btn = Array.from(document.querySelectorAll('[data-open-drawer]')).find(isAct);
        if (!btn) return { found: false };
        btn.setAttribute('data-vds-drawer-btn', '1');
        return { found: true };
    }""")
    if not drawer_prep["found"]:
        if mode == "exemplar":
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "missing_drawer_trigger",
                "element": "[data-open-drawer]",
                "message": "Exemplar mode requires a [data-open-drawer] drawer <dialog> trigger.",
            })
            results["drawer_dialog"] = {"status": "FAIL", "reason": "missing trigger"}
        else:
            results["drawer_dialog"] = {"status": "SKIPPED_NOT_PRESENT"}
    else:
        try:
            dbtn = page.locator("[data-vds-drawer-btn='1']").first
            dbtn.scroll_into_view_if_needed(timeout=3000)
            dbtn.focus()
            dbtn.click(timeout=3000)
            page.wait_for_timeout(150)
            d_open = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('dialog[open]')).filter(d => {
                  const st = getComputedStyle(d);
                  const r = d.getBoundingClientRect();
                  return st.display !== 'none' && st.visibility !== 'hidden' && r.width >= 120 && r.height >= 120;
                }).length >= 1;
            }""")
            page.keyboard.press("Escape")
            page.wait_for_timeout(150)
            d_closed = page.evaluate("""() => {
                const stillOpen = Array.from(document.querySelectorAll('dialog[open]')).filter(d => {
                  const st = getComputedStyle(d);
                  const r = d.getBoundingClientRect();
                  return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
                }).length;
                const active = document.activeElement;
                const btn = document.querySelector('[data-vds-drawer-btn="1"]');
                return { stillOpen, focusReturned: Boolean(active && btn && (active === btn || btn.contains(active))) };
            }""")
        except Exception:
            d_open = False
            d_closed = {"stillOpen": 0, "focusReturned": False}
        drawer_ok = d_open and d_closed["stillOpen"] == 0 and d_closed["focusReturned"]
        if not drawer_ok:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "drawer_dialog_lifecycle_failed",
                "element": "[data-open-drawer] / dialog",
                "message": f"Drawer <dialog> failed check (opened={d_open}, closed_on_escape={d_closed['stillOpen'] == 0}, focus_returned={d_closed['focusReturned']}).",
            })
        if d_closed["stillOpen"] > 0:
            page.evaluate("document.querySelectorAll('dialog[open]').forEach(d => d.close())")
        results["drawer_dialog"] = {
            "status": "PASS" if drawer_ok else "FAIL",
            "opened": d_open,
            "closed_on_escape": d_closed["stillOpen"] == 0,
            "focus_returned": d_closed["focusReturned"],
        }

    return results, defects, extra_shots


def run_marketing_interactive_checks(
    page: Any,
    out_dir: Path,
    console_errors: list[str],
    page_errors: list[str],
) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, str]]:
    """Execute deterministic interactive checks for `--mode marketing`."""
    results: dict[str, Any] = {}
    defects: list[dict[str, Any]] = []
    extra_shots: dict[str, str] = {}

    def err_count() -> int:
        return len(console_errors) + len(page_errors)

    # M1. Theme toggle ([data-theme-toggle]) across light & dark + WCAG AA contrast in both themes
    pre_errs = err_count()
    theme_info = page.evaluate("""() => {
        const isAct = (el) => {
          if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
          if (el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        };
        let themeBtn = null;
        const explicit = Array.from(document.querySelectorAll('[data-theme-toggle]')).filter(isAct);
        if (explicit.length > 0) {
          const host = explicit[0];
          if (['button', 'input', 'select'].includes(host.tagName.toLowerCase()) || host.hasAttribute('role')) {
            // If multiple [data-theme-toggle] buttons (e.g. Light / Dark segmented), pick inactive one
            if (explicit.length >= 2) {
              themeBtn = explicit.find(b =>
                b.getAttribute('aria-pressed') === 'false' ||
                b.getAttribute('aria-selected') === 'false' ||
                b.getAttribute('aria-checked') === 'false'
              ) || explicit[1];
            } else {
              themeBtn = host;
            }
          } else {
            const kids = Array.from(host.querySelectorAll('button, [role="radio"], [role="tab"], [role="switch"], input')).filter(isAct);
            themeBtn = kids.find(b =>
              b.getAttribute('aria-pressed') === 'false' ||
              b.getAttribute('aria-selected') === 'false' ||
              b.getAttribute('aria-checked') === 'false'
            ) || kids[0] || host;
          }
        }
        if (!themeBtn) {
          themeBtn = Array.from(document.querySelectorAll('button, [role="switch"], [role="button"]')).find(b => {
            if (!isAct(b)) return false;
            const label = ((b.id || '') + ' ' + (b.className || '') + ' ' + (b.getAttribute('aria-label') || '') + ' ' + (b.textContent || '')).toLowerCase();
            return /\\b(theme|dark|light|night|day|appearance)\\b/.test(label);
          });
        }
        if (themeBtn) themeBtn.setAttribute('data-vds-mkt-theme', '1');
        const readToggleLabel = () => {
          const allT = Array.from(document.querySelectorAll('[data-theme-toggle]')).filter(isAct);
          if (allT.length >= 2) {
            const act = allT.find(b =>
              b.getAttribute('aria-pressed') === 'true' ||
              b.getAttribute('aria-selected') === 'true' ||
              b.getAttribute('aria-checked') === 'true'
            );
            return act ? (act.textContent || '').replace(/\\s+/g, ' ').trim() : (themeBtn ? (themeBtn.textContent || '').replace(/\\s+/g, ' ').trim() : '');
          }
          return themeBtn ? (themeBtn.textContent || '').replace(/\\s+/g, ' ').trim() : '';
        };
        const snap = () => {
          const docSt = getComputedStyle(document.documentElement);
          const bodySt = getComputedStyle(document.body);
          return {
            htmlBg: docSt.backgroundColor,
            bodyBg: bodySt.backgroundColor,
            bodyColor: bodySt.color,
            htmlTheme: document.documentElement.getAttribute('data-theme') || document.documentElement.className || '',
            btnLabel: readToggleLabel(),
          };
        };
        return { found: Boolean(themeBtn), isExplicit: explicit.length > 0, before: snap() };
    }""")

    if not theme_info["found"] or not theme_info.get("isExplicit"):
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "missing_theme_toggle",
            "element": "[data-theme-toggle]",
            "message": "Marketing mode requires a visible [data-theme-toggle] control switching light and dark themes.",
        })
        results["theme_toggle"] = {"status": "FAIL", "reason": "missing [data-theme-toggle] trigger"}
    else:
        page.locator("[data-vds-mkt-theme='1']").first.click(timeout=3000)
        page.wait_for_timeout(140)
        after_snap = page.evaluate("""() => {
            const isAct = (el) => {
              if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
              if (el.closest('dialog:not([open]), [hidden], template')) return false;
              const st = getComputedStyle(el);
              const r = el.getBoundingClientRect();
              return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
            };
            const allT = Array.from(document.querySelectorAll('[data-theme-toggle]')).filter(isAct);
            let btnLabel = '';
            if (allT.length >= 2) {
              const act = allT.find(b =>
                b.getAttribute('aria-pressed') === 'true' ||
                b.getAttribute('aria-selected') === 'true' ||
                b.getAttribute('aria-checked') === 'true'
              );
              btnLabel = act ? (act.textContent || '').replace(/\\s+/g, ' ').trim() : '';
            } else {
              const tb = document.querySelector('[data-vds-mkt-theme="1"]');
              btnLabel = tb ? (tb.textContent || '').replace(/\\s+/g, ' ').trim() : '';
            }
            const docSt = getComputedStyle(document.documentElement);
            const bodySt = getComputedStyle(document.body);
            return {
              htmlBg: docSt.backgroundColor,
              bodyBg: bodySt.backgroundColor,
              bodyColor: bodySt.color,
              btnLabel,
              scrollWidth: document.documentElement.scrollWidth,
              innerWidth: window.innerWidth,
            };
        }""")
        b = theme_info["before"]
        mutated = (
            after_snap["htmlBg"] != b["htmlBg"]
            or after_snap["bodyBg"] != b["bodyBg"]
            or after_snap["bodyColor"] != b["bodyColor"]
        )
        b_lbl = (b.get("btnLabel") or "").lower()
        a_lbl = (after_snap.get("btnLabel") or "").lower()
        b_dark = bool(re.search(r"\bdark\b", b_lbl))
        b_light = bool(re.search(r"\blight\b", b_lbl))
        a_dark = bool(re.search(r"\bdark\b", a_lbl))
        a_light = bool(re.search(r"\blight\b", a_lbl))
        label_flipped = (b_dark and not b_light and a_light and not a_dark) or (
            b_light and not b_dark and a_dark and not a_light
        )
        new_errs = err_count() - pre_errs
        overflowed = after_snap["scrollWidth"] > after_snap["innerWidth"]

        page.evaluate("window.scrollTo(0, 0)")
        toggled_shot = out_dir / "04_1440_toggled_theme.png"
        page.screenshot(path=str(toggled_shot), type="png", full_page=False)
        extra_shots["04_1440_toggled_theme"] = str(toggled_shot)

        toggled_contrast = page.evaluate(JS_WCAG_CONTRAST_AUDIT, "toggled")
        contrast_clean = toggled_contrast["failureCount"] == 0

        # Restore initial theme cleanly (handle both single switch & segmented Light/Dark pair)
        restore_sel = page.evaluate("""(origTheme) => {
            const cur = document.documentElement.getAttribute('data-theme') || document.documentElement.className || '';
            if (cur === origTheme) return null;
            const group = Array.from(document.querySelectorAll('[data-theme-toggle]'));
            if (group.length >= 2) {
              const other = group.find(el => !el.hasAttribute('data-vds-mkt-theme'));
              if (other) { other.setAttribute('data-vds-mkt-theme-restore', '1'); return "[data-vds-mkt-theme-restore='1']"; }
            }
            return "[data-vds-mkt-theme='1']";
        }""", b["htmlTheme"])
        if restore_sel:
            try:
                page.locator(restore_sel).first.click(timeout=3000)
                page.wait_for_timeout(100)
            except Exception:
                pass

        if not mutated:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "theme_toggle_no_visual_mutation",
                "element": "[data-theme-toggle]",
                "message": "Clicking [data-theme-toggle] did not change computed html/body surface or ink colors.",
            })
        if not label_flipped:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "theme_toggle_label_not_flipped",
                "element": "[data-theme-toggle]",
                "message": f"[data-theme-toggle] must flip visible label between 'Dark' and 'Light' (before={b.get('btnLabel')!r}, after={after_snap.get('btnLabel')!r}).",
            })
        if new_errs > 0:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "theme_toggle_runtime_error",
                "element": "[data-theme-toggle]",
                "message": f"Clicking [data-theme-toggle] threw {new_errs} runtime error(s) under origin 'null'.",
            })
        if overflowed:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "theme_toggle_horizontal_overflow",
                "element": "[data-theme-toggle]",
                "message": f"Toggled theme overflowed horizontally ({after_snap['scrollWidth']}px > {after_snap['innerWidth']}px).",
            })
        theme_ok = mutated and label_flipped and new_errs == 0 and not overflowed and contrast_clean
        results["theme_toggle"] = {
            "status": "PASS" if theme_ok else "FAIL",
            "mutated": mutated,
            "label_flipped": label_flipped,
            "label_before": b.get("btnLabel"),
            "label_after": after_snap.get("btnLabel"),
            "runtime_errors_during_toggle": new_errs,
            "overflowed": overflowed,
            "toggled_wcag_failures": toggled_contrast["failureCount"],
            "toggled_contrast": toggled_contrast,
        }

    # M1b. State variant tabs ([role="tablist"][data-state-tabs]) click + ArrowRight switching
    st_tabs_pre_errs = err_count()
    st_tabs_setup = page.evaluate("""() => {
        const lists = Array.from(document.querySelectorAll('[role="tablist"][data-state-tabs]'))
          .filter(el => !el.closest('dialog:not([open]), [hidden], template') && el.getBoundingClientRect().width > 0);
        for (const list of lists) {
          const tabs = Array.from(list.querySelectorAll('[role="tab"]'))
            .filter(t => !t.disabled && t.getAttribute('aria-disabled') !== 'true' && t.getBoundingClientRect().width > 0);
          if (tabs.length >= 2) {
            list.setAttribute('data-vds-mkt-stlist', '1');
            tabs.forEach((t, i) => t.setAttribute('data-vds-mkt-stab', String(i)));
            const activeIdx = Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'));
            const clickIdx = activeIdx === 0 ? 1 : 0;
            const snapPanels = () => {
              const controlled = tabs.map(t => {
                const pid = t.getAttribute('aria-controls');
                const p = pid ? document.getElementById(pid) : null;
                if (!p) return null;
                const st = getComputedStyle(p);
                return !p.hidden && st.display !== 'none' && st.visibility !== 'hidden' && p.getBoundingClientRect().height > 0;
              });
              const sec = list.closest('section[data-component-doc], section, article') || list.parentElement;
              const visSpec = sec
                ? Array.from(sec.querySelectorAll('[data-specimen-state]'))
                    .filter(s => !s.hidden && getComputedStyle(s).display !== 'none' && s.getBoundingClientRect().height > 0)
                    .map(s => (s.getAttribute('data-specimen-state') || '') + ':' + (s.id || '') + ':' + (s.textContent || '').trim().slice(0, 40))
                : [];
              return { controlled, visSpec };
            };
            return { found: true, count: tabs.length, initialActive: activeIdx, clickIdx, before: snapPanels() };
          }
        }
        return { found: false };
    }""")
    if not st_tabs_setup["found"]:
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "missing_state_variant_tabs",
            "element": "[role='tablist'][data-state-tabs]",
            "message": "Marketing mode requires at least one visible [role='tablist'][data-state-tabs] with >= 2 [role='tab'] buttons switching component states.",
        })
        results["state_variant_tabs"] = {"status": "FAIL", "reason": "missing [role='tablist'][data-state-tabs]"}
    else:
        click_idx = st_tabs_setup["clickIdx"]
        tloc = page.locator(f"[data-vds-mkt-stab='{click_idx}']").first
        tloc.scroll_into_view_if_needed(timeout=3000)
        tloc.click(timeout=3000)
        page.wait_for_timeout(90)
        after_click = page.evaluate("""(idx) => {
            const list = document.querySelector('[data-vds-mkt-stlist="1"]');
            const tabs = Array.from(document.querySelectorAll('[data-vds-mkt-stab]'));
            const sec = list ? (list.closest('section[data-component-doc], section, article') || list.parentElement) : null;
            return {
              clickedSelected: tabs[idx]?.getAttribute('aria-selected') === 'true',
              selectedIdx: tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'),
              controlled: tabs.map(t => {
                const pid = t.getAttribute('aria-controls');
                const p = pid ? document.getElementById(pid) : null;
                if (!p) return null;
                const st = getComputedStyle(p);
                return !p.hidden && st.display !== 'none' && st.visibility !== 'hidden' && p.getBoundingClientRect().height > 0;
              }),
              visSpec: sec
                ? Array.from(sec.querySelectorAll('[data-specimen-state]'))
                    .filter(s => !s.hidden && getComputedStyle(s).display !== 'none' && s.getBoundingClientRect().height > 0)
                    .map(s => (s.getAttribute('data-specimen-state') || '') + ':' + (s.id || '') + ':' + (s.textContent || '').trim().slice(0, 40))
                : [],
            };
        }""", click_idx)

        # Position on a non-final tab if needed so ArrowRight works deterministically for both wrapping and non-wrapping tablists
        arrow_from_idx = click_idx
        if arrow_from_idx >= st_tabs_setup["count"] - 1:
            arrow_from_idx = 0
            t0_loc = page.locator("[data-vds-mkt-stab='0']").first
            t0_loc.click(timeout=3000)
            page.wait_for_timeout(60)
        pre_arrow = page.evaluate("""() => {
            const list = document.querySelector('[data-vds-mkt-stlist="1"]');
            const tabs = Array.from(document.querySelectorAll('[data-vds-mkt-stab]'));
            const sec = list ? (list.closest('section[data-component-doc], section, article') || list.parentElement) : null;
            return {
              selectedIdx: tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'),
              controlled: tabs.map(t => {
                const pid = t.getAttribute('aria-controls');
                const p = pid ? document.getElementById(pid) : null;
                if (!p) return null;
                const st = getComputedStyle(p);
                return !p.hidden && st.display !== 'none' && st.visibility !== 'hidden' && p.getBoundingClientRect().height > 0;
              }),
              visSpec: sec
                ? Array.from(sec.querySelectorAll('[data-specimen-state]'))
                    .filter(s => !s.hidden && getComputedStyle(s).display !== 'none' && s.getBoundingClientRect().height > 0)
                    .map(s => (s.getAttribute('data-specimen-state') || '') + ':' + (s.id || '') + ':' + (s.textContent || '').trim().slice(0, 40))
                : [],
            };
        }""")
        page.locator(f"[data-vds-mkt-stab='{arrow_from_idx}']").first.focus()
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(90)
        after_arrow = page.evaluate("""() => {
            const list = document.querySelector('[data-vds-mkt-stlist="1"]');
            const tabs = Array.from(document.querySelectorAll('[data-vds-mkt-stab]'));
            const sec = list ? (list.closest('section[data-component-doc], section, article') || list.parentElement) : null;
            return {
              selectedIdx: tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'),
              controlled: tabs.map(t => {
                const pid = t.getAttribute('aria-controls');
                const p = pid ? document.getElementById(pid) : null;
                if (!p) return null;
                const st = getComputedStyle(p);
                return !p.hidden && st.display !== 'none' && st.visibility !== 'hidden' && p.getBoundingClientRect().height > 0;
              }),
              visSpec: sec
                ? Array.from(sec.querySelectorAll('[data-specimen-state]'))
                    .filter(s => !s.hidden && getComputedStyle(s).display !== 'none' && s.getBoundingClientRect().height > 0)
                    .map(s => (s.getAttribute('data-specimen-state') || '') + ':' + (s.id || '') + ':' + (s.textContent || '').trim().slice(0, 40))
                : [],
            };
        }""")

        # Restore initial active tab so default specimens inside panel 0 stay mounted for subsequent checks
        init_idx = st_tabs_setup["initialActive"]
        if after_arrow["selectedIdx"] != init_idx:
            try:
                page.locator(f"[data-vds-mkt-stab='{init_idx}']").first.click(timeout=2500)
                page.wait_for_timeout(60)
            except Exception:
                pass

        click_ok = bool(after_click["clickedSelected"]) and (
            after_click["controlled"] != st_tabs_setup["before"]["controlled"]
            or after_click["visSpec"] != st_tabs_setup["before"]["visSpec"]
        )
        arrow_ok = (
            after_arrow["selectedIdx"] != -1
            and after_arrow["selectedIdx"] != pre_arrow["selectedIdx"]
            and (
                after_arrow["controlled"] != pre_arrow["controlled"]
                or after_arrow["visSpec"] != pre_arrow["visSpec"]
            )
        )
        st_errs = err_count() - st_tabs_pre_errs
        st_tabs_ok = click_ok and arrow_ok and st_errs == 0
        if not st_tabs_ok:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "state_variant_tabs_failed",
                "element": "[role='tablist'][data-state-tabs]",
                "message": f"[data-state-tabs] failed live variant check (click_switched={click_ok}, ArrowRight_switched={arrow_ok}, errs={st_errs}).",
            })
        results["state_variant_tabs"] = {
            "status": "PASS" if st_tabs_ok else "FAIL",
            "click_switched": click_ok,
            "arrow_right_switched": arrow_ok,
            "runtime_errors": st_errs,
        }

    # M2. Optional standalone estimator ([data-calc-input] -> [data-calc-output])
    # Verified cleanly when present; skipped cleanly on calm editorial, museum, banking, or healthcare pages without calculators.
    calc_pre_errs = err_count()
    calc_prep = page.evaluate("""() => {
        const isVis = (el) => {
          if (!el || el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity) > 0.02 && r.width > 0 && r.height > 0;
        };
        const isAct = (el) => isVis(el) && !el.disabled && el.getAttribute('aria-disabled') !== 'true';

        // Gather live output candidates
        const explicitOuts = Array.from(document.querySelectorAll('[data-calc-output], [data-demo-output], [data-live-output]')).filter(isVis);
        const semanticOuts = Array.from(document.querySelectorAll('output')).filter(isVis);
        const outPool = explicitOuts.length > 0 ? explicitOuts : semanticOuts;

        // Gather explicit calculator controls vs fallback range inputs paired with <output>
        const explicitCtrls = [];
        for (const node of Array.from(document.querySelectorAll('[data-calc-input], [data-demo-toggle], [data-calc-step]'))) {
          if (!isVis(node)) continue;
          const tag = node.tagName.toLowerCase();
          if (['input', 'select', 'button'].includes(tag) || node.hasAttribute('role')) {
            if (isAct(node)) explicitCtrls.push(node);
          } else {
            for (const child of node.querySelectorAll('input, select, button, [role="radio"], [role="tab"], [role="switch"]')) {
              if (isAct(child)) explicitCtrls.push(child);
            }
          }
        }
        const rangeCtrls = Array.from(document.querySelectorAll('input[type="range"]')).filter(isAct);
        const fallbackCalcCtrls = Array.from(document.querySelectorAll('input[type="range"], input[type="number"]')).filter(isAct);

        // Calculator is considered present only if explicitly declared via data-calc-* OR range slider + <output> coexist
        const isCalculatorPresent = (
          explicitCtrls.length > 0 ||
          explicitOuts.length > 0 ||
          (rangeCtrls.length > 0 && outPool.length > 0)
        );
        if (!isCalculatorPresent) {
          return { present: false, ctrlCount: 0, outCount: 0, beforeOuts: [], ctrlKinds: [] };
        }

        outPool.forEach((o, i) => o.setAttribute('data-vds-calc-out', String(i)));
        const ctrls = explicitCtrls.length > 0 ? explicitCtrls : fallbackCalcCtrls;

        // Deduplicate & order so inactive buttons come ahead of already-selected buttons in segmented demo switches
        const uniq = [];
        for (const c of ctrls) {
          if (!uniq.includes(c)) uniq.push(c);
        }
        uniq.sort((a, b) => {
          const score = (el) => {
            const t = el.tagName.toLowerCase();
            if (t === 'input' && el.type === 'range') return 10;
            if (t === 'input' || t === 'select') return 8;
            if (el.hasAttribute('data-calc-step')) return 7;
            const inactive = (
              el.getAttribute('aria-pressed') === 'false' ||
              el.getAttribute('aria-selected') === 'false' ||
              el.getAttribute('aria-checked') === 'false'
            );
            return inactive ? 6 : 2;
          };
          return score(b) - score(a);
        });
        const picked = uniq.slice(0, 4);
        picked.forEach((c, i) => c.setAttribute('data-vds-calc-ctrl', String(i)));

        const readOuts = () => Array.from(document.querySelectorAll('[data-vds-calc-out]')).map(el => ({
          id: el.id || el.tagName.toLowerCase(),
          text: (el.textContent || el.value || '').replace(/\\s+/g, ' ').trim(),
        }));

        return {
          present: true,
          ctrlCount: picked.length,
          outCount: outPool.length,
          hasExplicitOut: explicitOuts.length > 0,
          beforeOuts: readOuts(),
          ctrlKinds: picked.map(c => ({
            tag: c.tagName.toLowerCase(),
            type: (c.getAttribute('type') || '').toLowerCase(),
          })),
        };
    }""")

    if not calc_prep.get("present"):
        results["interactive_calculator"] = {"status": "SKIPPED_NOT_PRESENT"}
    elif calc_prep["ctrlCount"] == 0 or calc_prep["outCount"] == 0:
        reason = (
            "calculator readout present without active [data-calc-input] control"
            if calc_prep["ctrlCount"] == 0
            else "[data-calc-input] control present without visible [data-calc-output] / <output> readout"
        )
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "incomplete_interactive_calculator",
            "element": "[data-calc-input] / [data-calc-output]",
            "message": f"Declared marketing calculator check failed: {reason}.",
        })
        results["interactive_calculator"] = {"status": "FAIL", "reason": reason}
    else:
        mutated_pairs: list[dict[str, str]] = []
        before_map = {idx: item["text"] for idx, item in enumerate(calc_prep["beforeOuts"])}
        for c_idx, cinfo in enumerate(calc_prep["ctrlKinds"]):
            sel = f"[data-vds-calc-ctrl='{c_idx}']"
            if cinfo["tag"] == "input" and cinfo["type"] in {"range", "number", "text"}:
                page.evaluate("""(idx) => {
                    const el = document.querySelector(`[data-vds-calc-ctrl="${idx}"]`);
                    if (!el) return;
                    const cur = parseFloat(el.value);
                    const hasMin = el.min !== '' && !Number.isNaN(parseFloat(el.min));
                    const hasMax = el.max !== '' && !Number.isNaN(parseFloat(el.max));
                    const min = hasMin ? parseFloat(el.min) : 0;
                    const max = hasMax ? parseFloat(el.max) : (Number.isFinite(cur) && cur > 0 ? cur * 2 : 100);
                    const stepRaw = parseFloat(el.step);
                    const step = (!Number.isNaN(stepRaw) && stepRaw > 0) ? stepRaw : 1;
                    let next = min + Math.round(((max - min) * 0.78) / step) * step;
                    next = Math.min(max, Math.max(min, next));
                    if (!Number.isNaN(cur) && Math.abs(next - cur) < step * 0.5) {
                      next = Math.abs(max - cur) >= Math.abs(cur - min) ? max : min;
                    }
                    const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
                    if (proto && proto.set) proto.set.call(el, String(next));
                    else el.value = String(next);
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }""", c_idx)
            elif cinfo["tag"] == "select":
                page.evaluate("""(idx) => {
                    const el = document.querySelector(`[data-vds-calc-ctrl="${idx}"]`);
                    if (!el || el.options.length < 2) return;
                    el.selectedIndex = el.selectedIndex === 0 ? 1 : 0;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }""", c_idx)
            else:
                try:
                    loc = page.locator(sel).first
                    loc.scroll_into_view_if_needed(timeout=2500)
                    loc.click(timeout=2500)
                except Exception:
                    pass

            # Allow up to 240ms for smooth requestAnimationFrame number interpolation to settle
            page.wait_for_timeout(240)
            after_outs = page.evaluate("""() => Array.from(document.querySelectorAll('[data-vds-calc-out]')).map(el => ({
                id: el.id || el.tagName.toLowerCase(),
                text: (el.textContent || el.value || '').replace(/\\s+/g, ' ').trim(),
            }))""")
            for o_idx, item in enumerate(after_outs):
                prev_txt = before_map.get(o_idx, "")
                if item["text"] and item["text"] != prev_txt:
                    mutated_pairs.append({"output": item["id"], "before": prev_txt, "after": item["text"]})
            if mutated_pairs:
                break

        calc_errs = err_count() - calc_pre_errs
        calc_ok = len(mutated_pairs) >= 1 and calc_errs == 0
        if not mutated_pairs:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "calculator_output_static",
                "element": "[data-calc-input] -> [data-calc-output]",
                "message": "Interacting with calculator/demo input did not change any visible [data-calc-output] or <output> figure.",
            })
        if calc_errs > 0:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "calculator_runtime_error",
                "element": "[data-calc-input]",
                "message": f"Calculator interaction threw {calc_errs} console/page error(s).",
            })
        results["interactive_calculator"] = {
            "status": "PASS" if calc_ok else "FAIL",
            "mutations": mutated_pairs[:4],
            "runtime_errors": calc_errs,
        }

    # M3. Optional pricing / tier / billing cadence toggle ([data-billing-toggle] / [data-tier-toggle])
    # Verified cleanly when explicitly declared; skipped cleanly on fixed-price ledgers or single-plan pages.
    tier_pre_errs = err_count()
    tier_prep = page.evaluate("""() => {
        const isVis = (el) => {
          if (!el || el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity) > 0.02 && r.width > 0 && r.height > 0;
        };
        const isAct = (el) => isVis(el) && !el.disabled && el.getAttribute('aria-disabled') !== 'true';

        const explicitSel = '[data-billing-toggle], [data-tier-toggle], [data-cadence-toggle], [data-plan-toggle], [data-band-toggle], [data-edition-toggle], [data-tariff-toggle], [data-currency-toggle], [data-finish-toggle]';
        const explicitNodes = Array.from(document.querySelectorAll(explicitSel)).filter(isVis);
        if (explicitNodes.length === 0) {
          return { present: false, targetCount: 0, targetTag: null, beforeFigures: [] };
        }

        let clickTargets = [];
        let toggleContainer = null;

        const pickInactiveFromGroup = (btns) => {
          if (btns.length === 0) return [];
          if (btns.length === 1) return [btns[0]];
          const explicitInactive = btns.filter(b =>
            b.getAttribute('aria-selected') === 'false' ||
            b.getAttribute('aria-pressed') === 'false' ||
            b.getAttribute('aria-checked') === 'false' ||
            (b.type === 'radio' && !b.checked)
          );
          if (explicitInactive.length > 0) return explicitInactive;
          const nonActiveClass = btns.filter(b => !/\\b(is-active|active|selected|current)\\b/i.test(b.className || ''));
          return nonActiveClass.length > 0 ? nonActiveClass : [btns[1]];
        };

        const leafBtns = [];
        for (const n of explicitNodes) {
          const tag = n.tagName.toLowerCase();
          if (['button', 'input', 'select'].includes(tag) || ['tab', 'radio', 'switch', 'button'].includes((n.getAttribute('role') || '').toLowerCase())) {
            if (isAct(n)) leafBtns.push(n);
          } else {
            toggleContainer = toggleContainer || n;
            const inner = Array.from(n.querySelectorAll('button, input, select, [role="tab"], [role="radio"], [role="switch"]')).filter(isAct);
            leafBtns.push(...inner);
          }
        }
        if (!toggleContainer && leafBtns.length >= 2) {
          toggleContainer = leafBtns[0].parentElement;
        } else if (!toggleContainer && leafBtns.length === 1) {
          toggleContainer = leafBtns[0];
        }
        clickTargets = pickInactiveFromGroup(leafBtns);

        if (toggleContainer) toggleContainer.setAttribute('data-vds-tier-ctrl-root', '1');
        clickTargets.slice(0, 2).forEach((t, i) => t.setAttribute('data-vds-tier-target', String(i)));

        const snapshotTierFigures = () => {
          const rootCtrl = document.querySelector('[data-vds-tier-ctrl-root="1"]');
          const insideToggle = (el) => Boolean(rootCtrl && (el === rootCtrl || rootCtrl.contains(el)));
          const vals = [];

          // 1. Explicit price/band/tier attributes outside the toggle button itself
          const expEls = document.querySelectorAll(
            '[data-price], [data-tier-price], [data-price-monthly], [data-price-annual], [data-billing-note], [data-tier-output], [data-fee-output], [data-band-output], [data-edition-price]'
          );
          for (const el of expEls) {
            if (!isVis(el) || insideToggle(el)) continue;
            vals.push('exp:' + (el.textContent || '').replace(/\\s+/g, ' ').trim());
          }

          // 2. Visible tabpanels controlled by tier tabs (excluding code-only install panels)
          for (const tp of document.querySelectorAll('[role="tabpanel"]')) {
            if (!isVis(tp) || insideToggle(tp)) continue;
            const txt = (tp.textContent || '').replace(/\\s+/g, ' ').trim();
            if (/[£€$¥]|\\b(?:chf|sek|dkk|nok|usd|eur|gbp|free|included|mo|month|year|yr|day|pass|fee|kit|edition)\\b|\\d/i.test(txt)) {
              vals.push('panel:' + (tp.id || '') + ':' + txt.slice(0, 140));
            }
          }

          // 3. Price/numeric leaf nodes inside the enclosing section (excluding calculator output, nav, footer, code, and toggle itself)
          const hostSec = rootCtrl ? (rootCtrl.closest('section, main') || document.body) : document.body;
          for (const el of hostSec.querySelectorAll('*')) {
            if (!isVis(el) || insideToggle(el)) continue;
            if (el.closest('nav, footer, code, pre, [data-vds-calc-out], [data-calc-output]')) continue;
            const hasDirectNum = Array.from(el.childNodes).some(
              n => n.nodeType === 3 && n.nodeValue && /(?:[£€$¥]\\s*\\d|\\d+\\s*(?:%|\\/|per\\b|a\\s+(?:month|year)|mo\\b|yr\\b|chf|eur|usd|gbp)|\\bfree\\b)/i.test(n.nodeValue)
            );
            if (hasDirectNum) {
              vals.push('num:' + (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80));
            }
          }
          return vals;
        };

        return {
          present: true,
          targetCount: Math.min(2, clickTargets.length),
          targetTag: clickTargets[0] ? clickTargets[0].tagName.toLowerCase() : null,
          beforeFigures: snapshotTierFigures(),
        };
    }""")

    if not tier_prep.get("present"):
        results["pricing_or_tier_toggle"] = {"status": "SKIPPED_NOT_PRESENT"}
    elif tier_prep["targetCount"] == 0:
        defects.append({
            "gate": "INTERACTIVE_COMPONENT_STATES",
            "kind": "empty_pricing_or_tier_toggle",
            "element": "[data-billing-toggle] / [data-tier-toggle]",
            "message": "[data-billing-toggle] / [data-tier-toggle] container has no active interactive button, input, or select.",
        })
        results["pricing_or_tier_toggle"] = {"status": "FAIL", "reason": "no active toggle button inside container"}
    else:
        tier_changed_samples: list[str] = []
        before_set = tier_prep["beforeFigures"]
        for t_idx in range(tier_prep["targetCount"]):
            tsel = f"[data-vds-tier-target='{t_idx}']"
            try:
                loc = page.locator(tsel).first
                tag_name = loc.evaluate("el => el.tagName.toLowerCase()")
                if tag_name == "select":
                    loc.evaluate("""el => {
                        if (el.options.length >= 2) {
                          el.selectedIndex = el.selectedIndex === 0 ? 1 : 0;
                          el.dispatchEvent(new Event('input', { bubbles: true }));
                          el.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }""")
                else:
                    loc.scroll_into_view_if_needed(timeout=2500)
                    loc.click(timeout=2500)
            except Exception:
                pass
            page.wait_for_timeout(180)
            after_figs = page.evaluate("""() => {
                const isVis = (el) => {
                  if (!el || el.closest('dialog:not([open]), [hidden], template')) return false;
                  const st = getComputedStyle(el);
                  const r = el.getBoundingClientRect();
                  return st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity) > 0.02 && r.width > 0 && r.height > 0;
                };
                const rootCtrl = document.querySelector('[data-vds-tier-ctrl-root="1"]');
                const insideToggle = (el) => Boolean(rootCtrl && (el === rootCtrl || rootCtrl.contains(el)));
                const vals = [];
                const expEls = document.querySelectorAll(
                  '[data-price], [data-tier-price], [data-price-monthly], [data-price-annual], [data-billing-note], [data-tier-output], [data-fee-output], [data-band-output], [data-edition-price]'
                );
                for (const el of expEls) {
                  if (!isVis(el) || insideToggle(el)) continue;
                  vals.push('exp:' + (el.textContent || '').replace(/\\s+/g, ' ').trim());
                }
                for (const tp of document.querySelectorAll('[role="tabpanel"]')) {
                  if (!isVis(tp) || insideToggle(tp)) continue;
                  const txt = (tp.textContent || '').replace(/\\s+/g, ' ').trim();
                  if (/[£€$¥]|\\b(?:chf|sek|dkk|nok|usd|eur|gbp|free|included|mo|month|year|yr|day|pass|fee|kit|edition)\\b|\\d/i.test(txt)) {
                    vals.push('panel:' + (tp.id || '') + ':' + txt.slice(0, 140));
                  }
                }
                const hostSec = rootCtrl ? (rootCtrl.closest('section, main') || document.body) : document.body;
                for (const el of hostSec.querySelectorAll('*')) {
                  if (!isVis(el) || insideToggle(el)) continue;
                  if (el.closest('nav, footer, code, pre, [data-vds-calc-out], [data-calc-output]')) continue;
                  const hasDirectNum = Array.from(el.childNodes).some(
                    n => n.nodeType === 3 && n.nodeValue && /(?:[£€$¥]\\s*\\d|\\d+\\s*(?:%|\\/|per\\b|a\\s+(?:month|year)|mo\\b|yr\\b|chf|eur|usd|gbp)|\\bfree\\b)/i.test(n.nodeValue)
                  );
                  if (hasDirectNum) {
                    vals.push('num:' + (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80));
                  }
                }
                return vals;
            }""")
            if after_figs != before_set:
                old_s = set(before_set)
                tier_changed_samples = [v for v in after_figs if v not in old_s][:4] or ["panel_visibility_changed"]
                break

        tier_errs = err_count() - tier_pre_errs
        tier_ok = len(tier_changed_samples) >= 1 and tier_errs == 0
        if not tier_changed_samples:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "pricing_or_tier_toggle_static",
                "element": "[data-billing-toggle] / [data-tier-toggle]",
                "message": "Clicking pricing/tier/edition/tariff toggle did not dynamically update any visible prices, fee figures, or tier panels.",
            })
        if tier_errs > 0:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "pricing_toggle_runtime_error",
                "element": "[data-billing-toggle]",
                "message": f"Clicking pricing/tier toggle threw {tier_errs} console/page error(s).",
            })
        results["pricing_or_tier_toggle"] = {
            "status": "PASS" if tier_ok else "FAIL",
            "updated_figures": tier_changed_samples,
            "runtime_errors": tier_errs,
        }

    # M4. Optional interactive conversion form ([data-lead-form] / <form> / [data-test-validate]) -> aria-invalid="true" + visible aria-describedby error
    val_pre_errs = err_count()
    val_prep = page.evaluate("""() => {
        const isAct = (el) => {
          if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
          if (el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        };
        Array.from(document.querySelectorAll('[aria-invalid="true"]')).forEach((el, i) => {
          el.setAttribute('data-vds-mkt-pre-inv', String(i));
        });
        const trigger = Array.from(document.querySelectorAll('[data-test-validate]')).find(isAct);
        if (trigger) trigger.setAttribute('data-vds-mkt-val-btn', '1');

        const forms = Array.from(document.querySelectorAll('form')).filter(f => {
          if (f.closest('dialog:not([open]), [hidden], template')) return false;
          const r = f.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) return false;
          return Boolean(f.querySelector('input:not([type="hidden"]):not([type="range"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'));
        });
        forms.sort((a, b) => {
          const freshInputs = (f) =>
            Array.from(f.querySelectorAll('input:not([type="hidden"]):not([type="range"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'))
              .filter(inp => !inp.hasAttribute('data-vds-mkt-pre-inv')).length;
          const sc = (f) =>
            (f.hasAttribute('data-lead-form') ? 200 : 0)
            + (freshInputs(f) > 0 ? 60 : -100)
            + (trigger && f.contains(trigger) ? 100 : 0)
            + (f.querySelector('[data-test-validate]') ? 50 : 0)
            + f.querySelectorAll('[aria-describedby]').length * 5
            + (f.querySelector('button[type="submit"], input[type="submit"]') ? 2 : 0);
          return sc(b) - sc(a);
        });
        // Skip forms whose ONLY editable fields were already static [aria-invalid="true"] error-state specimens unless tagged [data-lead-form]
        const testableForms = forms.filter(f =>
          f.hasAttribute('data-lead-form') ||
          Boolean(f.querySelector('[data-test-validate]')) ||
          Array.from(f.querySelectorAll('input:not([type="hidden"]):not([type="range"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'))
            .some(inp => !inp.hasAttribute('data-vds-mkt-pre-inv'))
        );
        const picked = testableForms.slice(0, 4);
        picked.forEach((f, i) => {
          f.setAttribute('data-vds-mkt-form', String(i));
          const sb = Array.from(f.querySelectorAll('[data-test-validate], button[type="submit"], input[type="submit"], button:not([type="button"])')).find(isAct);
          if (sb) sb.setAttribute('data-vds-mkt-sbtn', String(i));
        });
        return { hasTrigger: Boolean(trigger), formCount: picked.length };
    }""")

    def inspect_mkt_invalid() -> dict[str, Any]:
        return page.evaluate("""() => {
            const newly = Array.from(document.querySelectorAll('[aria-invalid="true"]:not([data-vds-mkt-pre-inv])'));
            const mapped = newly.map(el => {
              const descIds = (el.getAttribute('aria-describedby') || '').trim().split(/\\s+/).filter(Boolean);
              const errEls = descIds.map(id => document.getElementById(id)).filter(Boolean);
              const visibleErr = errEls.find(e => {
                const st = getComputedStyle(e);
                const r = e.getBoundingClientRect();
                const t = (e.textContent || '').trim();
                return !e.hidden && st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0 && t.length >= 4;
              });
              return {
                el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
                describedBy: descIds,
                hasVisibleLinkedError: Boolean(visibleErr),
                errorText: visibleErr ? visibleErr.textContent.trim().slice(0, 90) : null,
              };
            });
            return { validLinked: mapped.filter(m => m.hasVisibleLinkedError), mapped };
        }""")

    if val_prep["formCount"] == 0 and not val_prep["hasTrigger"]:
        results["conversion_form_validation"] = {"status": "SKIPPED_NOT_PRESENT"}
    else:
        mkt_val: dict[str, Any] = {"validLinked": [], "mapped": []}
        for f_idx in range(val_prep["formCount"]):
            for attempt_mode in ("email_bad_others_empty", "all_empty", "bad_token"):
                page.evaluate("""([idx, mode]) => {
                    const form = document.querySelector(`[data-vds-mkt-form="${idx}"]`);
                    if (!form) return;
                    form.setAttribute('novalidate', '');
                    const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'))
                      .filter(el => !el.hasAttribute('data-vds-mkt-pre-inv'));
                    for (const inp of inputs) {
                      let v = '';
                      if (mode === 'email_bad_others_empty') v = inp.type === 'email' ? 'invalid-email' : '';
                      else if (mode === 'bad_token') v = '!!!';
                      const proto = Object.getOwnPropertyDescriptor(
                        inp.tagName.toLowerCase() === 'textarea' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
                        'value'
                      );
                      if (proto && proto.set) proto.set.call(inp, v);
                      else inp.value = v;
                      inp.dispatchEvent(new Event('input', { bubbles: true }));
                      inp.dispatchEvent(new Event('change', { bubbles: true }));
                      inp.dispatchEvent(new Event('blur', { bubbles: true }));
                    }
                }""", [f_idx, attempt_mode])
                sbtn_sel = f"[data-vds-mkt-sbtn='{f_idx}']"
                clicked_sb = False
                if page.locator(sbtn_sel).count() > 0:
                    try:
                        sb = page.locator(sbtn_sel).first
                        sb.scroll_into_view_if_needed(timeout=2500)
                        sb.click(timeout=2500)
                        clicked_sb = True
                    except Exception:
                        clicked_sb = False
                if not clicked_sb:
                    page.evaluate("""(idx) => {
                        const f = document.querySelector(`[data-vds-mkt-form="${idx}"]`);
                        if (f) f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                    }""", f_idx)
                page.wait_for_timeout(110)
                mkt_val = inspect_mkt_invalid()
                if len(mkt_val["validLinked"]) >= 1:
                    break
            if len(mkt_val["validLinked"]) >= 1:
                break

        if len(mkt_val["validLinked"]) == 0 and page.locator("[data-vds-mkt-val-btn='1']").count() > 0:
            try:
                vb = page.locator("[data-vds-mkt-val-btn='1']").first
                vb.scroll_into_view_if_needed(timeout=2500)
                vb.click(timeout=2500)
                page.wait_for_timeout(110)
                mkt_val = inspect_mkt_invalid()
            except Exception:
                pass

        val_errs = err_count() - val_pre_errs
        val_ok = len(mkt_val["validLinked"]) >= 1 and val_errs == 0
        if len(mkt_val["validLinked"]) == 0:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "conversion_form_validation_failed",
                "element": "form / [data-test-validate]",
                "message": "Submitting empty/invalid conversion form did not set aria-invalid='true' linked via aria-describedby to a visible helpful error message.",
            })
        if val_errs > 0:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "conversion_form_runtime_error",
                "element": "form",
                "message": f"Conversion form validation threw {val_errs} console/page error(s).",
            })
        results["conversion_form_validation"] = {
            "status": "PASS" if val_ok else "FAIL",
            "triggered_fields": mkt_val["validLinked"],
            "runtime_errors": val_errs,
        }

    # M5. Optional cloud sandbox <dialog> ([data-open-modal]): verified cleanly when present, skipped when inline states suffice
    modal_pre_errs = err_count()
    modal_prep = page.evaluate("""() => {
        const isAct = (el) => {
          if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
          if (el.closest('dialog:not([open]), [hidden], template')) return false;
          const st = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        };
        const hasDialogEl = Boolean(document.querySelector('dialog'));
        const btn = Array.from(document.querySelectorAll('[data-open-modal]')).find(isAct)
          || (hasDialogEl
              ? Array.from(document.querySelectorAll('button[aria-haspopup="dialog"]:not([data-open-drawer])')).find(isAct)
              : null);
        if (!btn) return { found: false };
        btn.setAttribute('data-vds-mkt-modal-btn', '1');
        return { found: true };
    }""")
    if not modal_prep["found"]:
        results["modal_dialog"] = {"status": "SKIPPED_NOT_PRESENT"}
    else:
        try:
            mbtn = page.locator("[data-vds-mkt-modal-btn='1']").first
            mbtn.scroll_into_view_if_needed(timeout=3000)
            mbtn.focus()
            mbtn.click(timeout=3000)
            page.wait_for_timeout(160)
            modal_open_state = page.evaluate("""() => {
                const openDialogs = Array.from(document.querySelectorAll('dialog[open]')).filter(d => {
                  const st = getComputedStyle(d);
                  const r = d.getBoundingClientRect();
                  return st.display !== 'none' && st.visibility !== 'hidden' && r.width >= 120 && r.height >= 60;
                });
                return { count: openDialogs.length };
            }""")
            modal_shot = out_dir / "05_1440_modal_open.png"
            page.screenshot(path=str(modal_shot), type="png", full_page=False)
            extra_shots["05_1440_modal_open"] = str(modal_shot)

            page.keyboard.press("Escape")
            page.wait_for_timeout(160)
            modal_closed_state = page.evaluate("""() => {
                const stillOpen = Array.from(document.querySelectorAll('dialog[open]')).filter(d => {
                  const st = getComputedStyle(d);
                  const r = d.getBoundingClientRect();
                  return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
                }).length;
                const active = document.activeElement;
                const btn = document.querySelector('[data-vds-mkt-modal-btn="1"]');
                const focusReturned = Boolean(active && btn && (active === btn || btn.contains(active)));
                return { stillOpen, focusReturned, activeTag: active ? active.tagName.toLowerCase() + (active.id ? '#' + active.id : '') : null };
            }""")
            opened_ok = modal_open_state["count"] >= 1
            closed_ok = modal_closed_state["stillOpen"] == 0
            focus_ok = modal_closed_state["focusReturned"]
        except Exception as exc:
            opened_ok = False
            closed_ok = True
            focus_ok = False
            modal_closed_state = {"activeTag": str(exc)[:60]}
        modal_errs = err_count() - modal_pre_errs
        modal_ok = opened_ok and closed_ok and focus_ok and modal_errs == 0
        if not modal_ok:
            defects.append({
                "gate": "INTERACTIVE_COMPONENT_STATES",
                "kind": "modal_dialog_lifecycle_failed",
                "element": "[data-open-modal] / dialog",
                "message": f"cloud sandbox <dialog> failed check (opened={opened_ok}, closed_on_escape={closed_ok}, focus_returned_to_trigger={focus_ok}, errs={modal_errs}, active={modal_closed_state['activeTag']}).",
            })
        results["modal_dialog"] = {
            "status": "PASS" if modal_ok else "FAIL",
            "opened": opened_ok,
            "closed_on_escape": closed_ok,
            "focus_returned": focus_ok,
            "runtime_errors": modal_errs,
        }
        if not closed_ok:
            page.evaluate("document.querySelectorAll('dialog[open]').forEach(d => d.close())")

    return results, defects, extra_shots


def verify_page(html_path: Path, out_dir: Path, mode: str) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)
    serve_root, rel_url = resolve_serve_root(html_path)
    server, port = start_sandbox_server(serve_root)
    target_url = f"http://127.0.0.1:{port}/{quote(rel_url)}"

    console_errors: list[str] = []
    page_errors: list[str] = []
    failed_requests: list[str] = []
    bad_http_responses: list[str] = []
    blocked_external_requests: list[str] = []

    defects: list[dict[str, Any]] = []
    screenshots: dict[str, str] = {}

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--disable-dev-shm-usage"])
            try:
                context = browser.new_context(
                    viewport={"width": 1440, "height": 900},
                    device_scale_factor=2,
                )

                def route_guard(route: Any) -> None:
                    url = route.request.url
                    if url.startswith((f"http://127.0.0.1:{port}/", "data:", "blob:")):
                        route.continue_()
                    else:
                        blocked_external_requests.append(url)
                        route.abort()

                context.route("**/*", route_guard)
                page = context.new_page()

                page.on(
                    "console",
                    lambda msg: console_errors.append(msg.text) if msg.type == "error" else None,
                )
                page.on("pageerror", lambda err: page_errors.append(str(err)))
                page.on(
                    "requestfailed",
                    lambda req: failed_requests.append(
                        f"{req.url} ({req.failure})"
                    ),
                )
                page.on(
                    "response",
                    lambda resp: bad_http_responses.append(f"{resp.status} {resp.url}")
                    if resp.status >= 400
                    else None,
                )

                page.goto(target_url, wait_until="load", timeout=15000)
                page.evaluate("() => document.fonts.ready")
                page.wait_for_timeout(80)

                # Static, anti-slop, token, and DOM font audit at 1440x900
                static_audit = page.evaluate(JS_STATIC_AND_ANTI_SLOP_AUDIT, mode)

                # CDP CSS.getPlatformFontsForNode check for actual rasterized DejaVu Sans fallback!
                cdp = context.new_cdp_session(page)
                cdp.send("DOM.enable")
                cdp.send("CSS.enable")
                doc_node_id = cdp.send("DOM.getDocument", {"depth": -1})["root"]["nodeId"]
                dejavu_platform_hits: list[dict[str, Any]] = []
                rendered_families: set[str] = set()
                for item in static_audit["visibleTextNodeSelectors"]:
                    q = cdp.send(
                        "DOM.querySelector",
                        {"nodeId": doc_node_id, "selector": f"[data-vds-fontnode='{item['idx']}']"},
                    )
                    if not q.get("nodeId"):
                        continue
                    pfonts = cdp.send("CSS.getPlatformFontsForNode", {"nodeId": q["nodeId"]}).get("fonts", [])
                    for pf in pfonts:
                        rendered_families.add(f"{pf['familyName']} ({'custom' if pf['isCustomFont'] else 'system'})")
                        if "dejavu" in pf["familyName"].lower():
                            dejavu_platform_hits.append({
                                "element": item["desc"],
                                "text": item["textSample"],
                                "family": pf["familyName"],
                                "glyphCount": pf["glyphCount"],
                            })
                # Remove temporary fontnode marker attributes before screenshots
                page.evaluate(
                    "document.querySelectorAll('[data-vds-fontnode]').forEach(e => e.removeAttribute('data-vds-fontnode'))"
                )

                # Capture clean 2x lossless PNG plates at 1440x900 BEFORE mutating interactive widgets
                top_key, comp_key, work_key = (
                    ("01_1440_hero", "02_1440_calculator_bento", "03_1440_pricing_proof")
                    if mode == "marketing"
                    else ("01_1440_top", "02_1440_components", "03_1440_workspace")
                )
                page.evaluate("window.scrollTo(0, 0)")
                shot_top = out_dir / f"{top_key}.png"
                page.screenshot(path=str(shot_top), type="png", full_page=False)
                screenshots[top_key] = str(shot_top)

                comp_y = static_audit["scrollTargets"]["compY"]
                page.evaluate(f"window.scrollTo(0, {comp_y})")
                shot_comp = out_dir / f"{comp_key}.png"
                page.screenshot(path=str(shot_comp), type="png", full_page=False)
                screenshots[comp_key] = str(shot_comp)

                work_y = static_audit["scrollTargets"]["workY"]
                page.evaluate(f"window.scrollTo(0, {work_y})")
                shot_work = out_dir / f"{work_key}.png"
                page.screenshot(path=str(shot_work), type="png", full_page=False)
                screenshots[work_key] = str(shot_work)

                page.evaluate("window.scrollTo(0, 0)")
                shot_full = out_dir / "full_1440.png"
                page.screenshot(path=str(shot_full), type="png", full_page=True)
                screenshots["full_1440"] = str(shot_full)

                # WCAG text contrast in default theme at 1440x900
                default_contrast = page.evaluate(JS_WCAG_CONTRAST_AUDIT, "default")

                # Forced-colors High Contrast verification + 2x lossless PNG
                page.emulate_media(forced_colors="active")
                page.wait_for_timeout(60)
                forced_colors_audit = page.evaluate(JS_FORCED_COLORS_CHECK)
                page.evaluate("window.scrollTo(0, 0)")
                shot_fc = out_dir / "1440x900_forced_colors.png"
                page.screenshot(path=str(shot_fc), type="png", full_page=False)
                screenshots["1440x900_forced_colors"] = str(shot_fc)
                page.emulate_media(forced_colors="none")
                page.wait_for_timeout(40)

                # Responsive overflow sweep across all 5 required viewports + 06_390_mobile.png
                overflow_by_viewport: dict[str, Any] = {}
                for vp in VIEWPORTS:
                    page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
                    page.wait_for_timeout(40)
                    ov = page.evaluate(JS_OVERFLOW_CHECK)
                    overflow_by_viewport[vp["label"]] = ov
                    if ov["overflows"]:
                        defects.append({
                            "gate": "RESPONSIVE_NO_OVERFLOW",
                            "kind": "horizontal_overflow",
                            "viewport": vp["label"],
                            "element": ", ".join(ov["culprits"][:4]) or "documentElement",
                            "message": f"Horizontal overflow at {vp['label']}: scrollWidth={ov['scrollWidth']}px > innerWidth={ov['vw']}px ({'; '.join(ov['culprits'][:3])}).",
                        })
                    if vp["name"] == "390":
                        page.evaluate("window.scrollTo(0, 0)")
                        shot_mob = out_dir / "06_390_mobile.png"
                        page.screenshot(path=str(shot_mob), type="png", full_page=False)
                        screenshots["06_390_mobile"] = str(shot_mob)

                # Restore 1440x900 for interactive component state testing
                page.set_viewport_size({"width": 1440, "height": 900})
                page.wait_for_timeout(40)

                interactive_summary: dict[str, Any] = {}
                toggled_contrast: dict[str, Any] | None = None
                if mode in {"exemplar", "eval"}:
                    interactive_summary, inter_defects, inter_shots = run_interactive_checks(
                        page, mode, out_dir, console_errors, page_errors
                    )
                    defects.extend(inter_defects)
                    screenshots.update(inter_shots)
                    toggled_contrast = (
                        interactive_summary.get("theme_or_density_toggle", {}).get("toggled_contrast")
                    )
                elif mode == "marketing":
                    interactive_summary, inter_defects, inter_shots = run_marketing_interactive_checks(
                        page, out_dir, console_errors, page_errors
                    )
                    defects.extend(inter_defects)
                    screenshots.update(inter_shots)
                    toggled_contrast = (
                        interactive_summary.get("theme_toggle", {}).get("toggled_contrast")
                    )

                context.close()
            finally:
                browser.close()
    finally:
        server.shutdown()

    # Consolidate Gate 1: CSP / Asset / Font health defects
    if static_audit["origin"] != "null":
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "sandbox_origin_not_null",
            "element": "window",
            "message": f"Expected opaque sandbox window.origin === 'null', got {static_audit['origin']!r}.",
        })
    for err in console_errors:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "console_error",
            "element": "console",
            "message": f"Console error: {err[:220]}",
        })
    for perr in page_errors:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "pageerror",
            "element": "window",
            "message": f"Uncaught pageerror: {perr[:220]}",
        })
    for reqf in failed_requests:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "request_failed",
            "element": "network",
            "message": f"Failed asset request: {reqf}",
        })
    for badr in bad_http_responses:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "http_error_status",
            "element": "network",
            "message": f"HTTP >= 400 asset response: {badr}",
        })
    for ext in static_audit["externalScripts"]:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "external_script_src",
            "element": "script[src]",
            "message": f"External <script src='{ext}'> is prohibited on x20 (inline classic JS only).",
        })
    for mod in static_audit["moduleOrImportMap"]:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "module_script_forbidden",
            "element": "script",
            "message": f"ES module / importmap script ({mod}) fails x20 opaque-origin CORS.",
        })
    for lco in static_audit["localCrossorigin"]:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "local_crossorigin_attr",
            "element": lco,
            "message": f"crossorigin attribute on local asset forces CORS failure in origin 'null': {lco}",
        })
    if mode == "directory":
        if static_audit["scriptCount"] > 0:
            defects.append({
                "gate": "CSP_ASSET_AND_FONT_HEALTH",
                "kind": "script_tag_on_directory_page",
                "element": "script",
                "message": f"Directory mode requires zero <script> tags; found {static_audit['scriptCount']}.",
            })
        if static_audit["inlineHandlers"]:
            defects.append({
                "gate": "CSP_ASSET_AND_FONT_HEALTH",
                "kind": "inline_handler_on_directory_page",
                "element": static_audit["inlineHandlers"][0],
                "message": f"Directory mode requires zero inline on*= handlers; found {len(static_audit['inlineHandlers'])} ({', '.join(static_audit['inlineHandlers'][:4])}).",
            })
    for dj in static_audit["dejavuComputed"][:6]:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "dejavu_sans_computed",
            "element": dj,
            "message": f"Banned DejaVu Sans in computed font-family: {dj}",
        })
    for dj_pf in dejavu_platform_hits[:6]:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "dejavu_sans_rendered_glyphs",
            "element": dj_pf["element"],
            "message": f"Text rendered {dj_pf['glyphCount']} glyph(s) using banned system fallback {dj_pf['family']} on '{dj_pf['text']}'.",
        })
    errored_faces = [f for f in static_audit["fontFaces"] if f["status"] == "error"]
    for ef in errored_faces:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "fontface_load_error",
            "element": ef["family"],
            "message": f"@font-face {ef['family']} ({ef['style']} {ef['weight']}) failed to load.",
        })
    if mode in {"directory", "exemplar", "marketing"} and len(static_audit["fontFaces"]) == 0:
        defects.append({
            "gate": "CSP_ASSET_AND_FONT_HEALTH",
            "kind": "no_self_hosted_webfonts",
            "element": "document.fonts",
            "message": "Zero @font-face definitions loaded; link the curated self-hosted base64 WOFF2 stylesheet.",
        })

    # Consolidate Gate 3: Anti-slop
    defects.extend(static_audit["antiSlopDefects"])

    # Consolidate Gate 4: OKLCH tokens (merge inline <style> + linked local stylesheet scan under origin 'null')
    linked_oklch_names, linked_oklch_decls, linked_oklch_raw = count_local_stylesheet_oklch(
        html_path, serve_root, static_audit.get("localStylesheetHrefs", [])
    )
    total_oklch_tokens = static_audit["oklchTokenCount"] + linked_oklch_names
    total_oklch_decls = static_audit["oklchDeclCount"] + linked_oklch_decls
    total_oklch_raw = static_audit["oklchRawValueCount"] + linked_oklch_raw
    if mode == "marketing":
        if total_oklch_decls < 24:
            defects.append({
                "gate": "OKLCH_TOKEN_SYSTEM",
                "kind": "insufficient_oklch_tokens",
                "element": ":root",
                "message": f"Expected >= 24 semantic OKLCH token declarations across :root / theme scopes / shared CSS, found {total_oklch_decls}.",
            })
    elif mode in {"exemplar", "eval"}:
        eff_oklch = max(total_oklch_tokens, total_oklch_raw)
        if eff_oklch < 8:
            defects.append({
                "gate": "OKLCH_TOKEN_SYSTEM",
                "kind": "insufficient_oklch_tokens",
                "element": ":root",
                "message": f"Expected >= 8 semantic OKLCH token declarations on :root / shared CSS, found {eff_oklch}.",
            })

    # Consolidate Gate 6: Forced colors
    if mode in {"exemplar", "eval", "marketing"}:
        if not forced_colors_audit["matchesMedia"]:
            defects.append({
                "gate": "FORCED_COLORS_HIGH_CONTRAST",
                "kind": "emulation_failed",
                "element": "window",
                "message": "forced-colors: active media emulation did not activate.",
            })
        for fc_issue in forced_colors_audit["issues"][:8]:
            defects.append({
                "gate": "FORCED_COLORS_HIGH_CONTRAST",
                "kind": "invisible_high_contrast_control",
                "element": fc_issue.split()[0],
                "message": fc_issue,
            })

    # Consolidate Gate 7: WCAG contrast (default + toggled theme)
    for cf in default_contrast["failures"][:8]:
        defects.append({
            "gate": "WCAG_TEXT_CONTRAST",
            "kind": "low_text_contrast",
            "element": cf["element"],
            "message": f"[{cf['theme']}] Contrast {cf['contrast']}:1 < {cf['required']}:1 on '{cf['text']}' ({cf['fontSizePx']}px w{cf['fontWeight']}, fg={cf['fgCss']}, bg=rgb({cf['bgApproxRgb'][0]},{cf['bgApproxRgb'][1]},{cf['bgApproxRgb'][2]})).",
        })
    if toggled_contrast:
        for cf in toggled_contrast["failures"][:8]:
            defects.append({
                "gate": "WCAG_TEXT_CONTRAST",
                "kind": "low_text_contrast_toggled_theme",
                "element": cf["element"],
                "message": f"[{cf['theme']}] Contrast {cf['contrast']}:1 < {cf['required']}:1 on '{cf['text']}' ({cf['fontSizePx']}px w{cf['fontWeight']}, fg={cf['fgCss']}, bg=rgb({cf['bgApproxRgb'][0]},{cf['bgApproxRgb'][1]},{cf['bgApproxRgb'][2]})).",
            })

    applicable_gates = [
        "CSP_ASSET_AND_FONT_HEALTH",
        "RESPONSIVE_NO_OVERFLOW",
        "ANTI_SLOP_GEOMETRY_AND_COPY",
    ]
    if mode in {"exemplar", "eval", "marketing"}:
        applicable_gates.extend([
            "OKLCH_TOKEN_SYSTEM",
            "INTERACTIVE_COMPONENT_STATES",
            "FORCED_COLORS_HIGH_CONTRAST",
        ])
    applicable_gates.append("WCAG_TEXT_CONTRAST")

    gates_report = {
        g: {
            "status": "FAIL" if any(d["gate"] == g for d in defects) else "PASS",
            "defect_count": sum(1 for d in defects if d["gate"] == g),
        }
        for g in applicable_gates
    }

    report = {
        "target": str(html_path),
        "mode": mode,
        "csp_header_enforced": X20_SANDBOX_CSP,
        "verified_window_origin": static_audit["origin"],
        "status": "PASS" if len(defects) == 0 else "FAIL",
        "defect_count": len(defects),
        "gates": gates_report,
        "metrics": {
            "script_tags": static_audit["scriptCount"],
            "external_scripts": len(static_audit["externalScripts"]),
            "console_errors": len(console_errors),
            "page_errors": len(page_errors),
            "failed_requests": len(failed_requests),
            "blocked_external_requests": len(blocked_external_requests),
            "font_faces_declared": len(static_audit["fontFaces"]),
            "rendered_platform_fonts": sorted(rendered_families),
            "dejavu_glyph_fallbacks": sum(h["glyphCount"] for h in dejavu_platform_hits),
            "oklch_token_declarations": total_oklch_decls if mode == "marketing" else total_oklch_tokens,
            "oklch_unique_token_names": total_oklch_tokens,
            "oklch_custom_prop_declarations": total_oklch_decls,
            "oklch_raw_occurrences": total_oklch_raw,
            "non_code_text_leaf_nodes": static_audit["nonCodeTextLeafCount"],
            "monospace_text_leaf_nodes": static_audit["monoTextLeafCount"],
            "monospace_leaf_share": static_audit["monoLeafShare"],
            "marketing_component_docs": static_audit.get("mktDocSummary"),
            "marketing_media": static_audit.get("mktMediaSummary"),
            "wcag_default_nodes_checked": default_contrast["checkedCount"],
            "wcag_default_failures": default_contrast["failureCount"],
            "wcag_toggled_failures": toggled_contrast["failureCount"] if toggled_contrast else None,
            "forced_colors_controls_checked": forced_colors_audit["checkedControls"],
        },
        "responsive_viewports": overflow_by_viewport,
        "interactive": interactive_summary,
        "defects": defects,
        "screenshots": screenshots,
    }

    report_path = out_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify a design-system HTML page under x20 CSP sandbox (origin === 'null') and emit report.json + 2x lossless PNG plates."
    )
    parser.add_argument("html_path", help="Path to HTML file to verify.")
    parser.add_argument(
        "--out-dir",
        required=True,
        help="Output directory for report.json and 2x lossless PNG plates.",
    )
    parser.add_argument(
        "--mode",
        choices=["exemplar", "directory", "eval", "marketing"],
        default="exemplar",
        help="Verification profile: exemplar (6 showcase systems), directory (pure HTML/CSS index.html), eval (generated task outputs), or marketing (design-system marketing & imagery component guides).",
    )
    parser.add_argument("--json", action="store_true", help="Print full report.json to stdout.")
    args = parser.parse_args()

    html_path = Path(args.html_path).expanduser().resolve()
    if not html_path.is_file():
        print(f"ERROR: HTML file not found: {html_path}", file=sys.stderr)
        return 2

    out_dir = Path(args.out_dir).expanduser().resolve()
    report = verify_page(html_path, out_dir, args.mode)

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(
            f"=== verify_design_system ({args.mode}): {report['status']} "
            f"| {report['defect_count']} defect(s) | origin={report['verified_window_origin']!r} ==="
        )
        print(f"Target: {report['target']}")
        for gate, info in report["gates"].items():
            tag = "PASS" if info["status"] == "PASS" else f"FAIL ({info['defect_count']})"
            print(f"  [{tag:8s}] {gate}")
        m = report["metrics"]
        print(
            f"Metrics: fonts={m['rendered_platform_fonts']} | oklch_tokens={m['oklch_token_declarations']} "
            f"| wcag_checked={m['wcag_default_nodes_checked']} | console_errs={m['console_errors']} | page_errs={m['page_errors']}"
        )
        if report["defects"]:
            print("\nDefects:")
            for idx, d in enumerate(report["defects"], start=1):
                vp = f" @ {d['viewport']}" if d.get("viewport") else ""
                print(f"  {idx}. [{d['gate']}:{d['kind']}{vp}] ({d['element']}) {d['message']}")
        print(f"\nReport: {out_dir / 'report.json'}")
        for name, spath in report["screenshots"].items():
            print(f"  - {name}: {spath}")

    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
