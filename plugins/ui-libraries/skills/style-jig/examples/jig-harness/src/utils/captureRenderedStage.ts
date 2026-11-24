import type { JigTheme, LibSlot, StageMode, StyleSlot } from '../data/jigHarnessData';

export interface LiveStageCaptureOptions {
  slideId: string;
  domain: string;
  domainTitle: string;
  viewTitle: string;
  stageMode: StageMode;
  isFullView: boolean;
  activeStyle: StyleSlot;
  activeVariant: number;
  activeLib: LibSlot;
  jigTheme: JigTheme;
  googleFontsHref: string;
  stageBackgroundHex: string;
}

export interface LiveStageCaptureResult {
  standaloneHtml: string;
  markupBytes: number;
  cssBytes: number;
  matchedRuleCount: number;
  capturedElementCount: number;
  capturedFromLiveDom: boolean;
}

const JIG_CHROME_PATTERNS: readonly RegExp[] = [
  /\.top-jig-wrap\b/,
  /\.bottom-motion-wrap\b/,
  /\.floating-style-plate\b/,
  /\.floating-lib-plate\b/,
  /\.floating-motion-plate\b/,
  /\.jig-bottom-controls-row\b/,
  /\.jig-action-plate\b/,
  /\.jig-action-label\b/,
  /\.jig-prompt-anchor\b/,
  /\.jig-prompt-sizer\b/,
  /\.jig-prompt-plate\b/,
  /\.jig-active-pill\b/,
  /\.jig-word\b/,
  /\.jig-theme-btn\b/,
  /\.jig-play-btn\b/,
  /\.jig-record-/,
  /\.jig-output-/,
  /\.right-variant-notches\b/,
  /#jigStyleVariants\b/,
  /\.rvn-/,
  /\.vnotch-btn\b/,
  /\.toc-/,
  /\baside\.toc\b/,
  /^\.toc\b/,
  /\.ap-cursor\b/,
  /\.dk-panel\b/,
  /\.dk-collapsed-pill\b/,
];

const JIG_ONLY_KEYFRAMES = new Set([
  'tocSubReveal',
  'jigOutputReveal',
  'jigRecordPulse',
  'apTapRing',
]);

function isJigChromeSelector(selectorText: string): boolean {
  return JIG_CHROME_PATTERNS.some((re) => re.test(selectorText));
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeSelectorForMatch(singleSel: string): string {
  let s = singleSel.trim();
  if (!s) return '';

  // Remove pseudo-elements
  s = s.replace(/::[a-zA-Z0-9_-]+(\([^)]*\))?/g, '');
  // Remove dynamic / interactive pseudo-classes so hover/focus/active rules are preserved
  s = s.replace(
    /:(hover|focus|focus-visible|focus-within|active|visited|disabled|enabled|checked|indeterminate|placeholder-shown|empty|open|invalid|valid|required|optional|read-only|read-write|target|autofill)\b/g,
    '',
  );
  // Strip document root ancestor qualifiers because cloneRoot is detached from html/body/#root
  s = s
    .replace(/^(?:html|body|:root|:host|#root)(?:\[[^\]]*\])*(?:\.[a-zA-Z0-9_-]+)*\s*[>+~]?\s*/g, '')
    .trim();

  return s;
}

function isAlwaysKeepSelector(singleSel: string): boolean {
  const s = singleSel.trim();
  if (!s) return false;
  if (
    s === '*' ||
    s === ':root' ||
    s === ':host' ||
    s === 'html' ||
    s === 'body' ||
    /^:root\b/.test(s) ||
    /^:host\b/.test(s) ||
    /^html(?:\[|$|\s*,)/.test(s) ||
    /^body(?:\[|$|\s*,)/.test(s) ||
    /^\*\s*,/.test(s) ||
    /^::backdrop/.test(s) ||
    /^::before/.test(s) ||
    /^::after/.test(s)
  ) {
    return true;
  }
  return false;
}

function splitTopLevelSelectors(selectorText: string): string[] {
  const parts: string[] = [];
  let current = '';
  let parenDepth = 0;
  let bracketDepth = 0;

  for (let i = 0; i < selectorText.length; i += 1) {
    const ch = selectorText[i];
    if (ch === '(') parenDepth += 1;
    else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
    else if (ch === '[') bracketDepth += 1;
    else if (ch === ']') bracketDepth = Math.max(0, bracketDepth - 1);

    if (ch === ',' && parenDepth === 0 && bracketDepth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function selectorMatchesClone(selectorText: string, cloneRoot: HTMLElement): boolean {
  if (isJigChromeSelector(selectorText)) return false;

  const selectors = splitTopLevelSelectors(selectorText);
  for (const rawSel of selectors) {
    if (isJigChromeSelector(rawSel)) continue;
    if (isAlwaysKeepSelector(rawSel)) return true;

    const normalized = normalizeSelectorForMatch(rawSel);
    if (!normalized || normalized === '*') return true;

    try {
      if (cloneRoot.matches(normalized) || cloneRoot.querySelector(normalized) !== null) {
        return true;
      }
    } catch {
      return true;
    }
  }
  return false;
}

function filterCssRules(
  rules: CSSRuleList,
  cloneRoot: HTMLElement,
  stats: { matched: number },
): string {
  const chunks: string[] = [];

  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i];
    if (!rule) continue;

    if (rule.type === CSSRule.FONT_FACE_RULE) {
      const txt = rule.cssText;
      if (/data:(?:font|application)\//i.test(txt)) {
        continue;
      }
      chunks.push(txt);
      stats.matched += 1;
      continue;
    }

    if (rule.type === CSSRule.KEYFRAMES_RULE) {
      const kf = rule as CSSKeyframesRule;
      if (JIG_ONLY_KEYFRAMES.has(kf.name)) continue;
      chunks.push(kf.cssText);
      stats.matched += 1;
      continue;
    }

    if (rule.type === CSSRule.STYLE_RULE) {
      const styleRule = rule as CSSStyleRule;
      if (selectorMatchesClone(styleRule.selectorText, cloneRoot)) {
        chunks.push(styleRule.cssText);
        stats.matched += 1;
      }
      continue;
    }

    const grouping = rule as CSSGroupingRule & {
      conditionText?: string;
      name?: string;
    };
    if (grouping.cssRules && grouping.cssRules.length > 0) {
      const inner = filterCssRules(grouping.cssRules, cloneRoot, stats);
      if (!inner.trim()) continue;

      const ctorName = rule.constructor?.name ?? '';
      if (rule.type === CSSRule.MEDIA_RULE) {
        const mediaRule = rule as CSSMediaRule;
        chunks.push(`@media ${mediaRule.conditionText || mediaRule.media.mediaText} {\n${inner}\n}`);
      } else if (rule.type === CSSRule.SUPPORTS_RULE) {
        const supportsRule = rule as CSSSupportsRule;
        chunks.push(`@supports ${supportsRule.conditionText} {\n${inner}\n}`);
      } else if (ctorName === 'CSSLayerBlockRule') {
        const layerName = grouping.name ? ` ${grouping.name}` : '';
        chunks.push(`@layer${layerName} {\n${inner}\n}`);
      } else if (ctorName === 'CSSContainerRule') {
        chunks.push(`@container ${grouping.conditionText || ''} {\n${inner}\n}`);
      } else {
        const prefixMatch = rule.cssText.match(/^([^{]+)\{/);
        if (prefixMatch) {
          chunks.push(`${prefixMatch[1].trim()} {\n${inner}\n}`);
        } else {
          chunks.push(inner);
        }
      }
      continue;
    }

    const rawText = rule.cssText.trim();
    if (rawText.startsWith('@property') || rawText.startsWith('@layer ')) {
      chunks.push(rawText);
      stats.matched += 1;
    }
  }

  return chunks.join('\n');
}

function mirrorInteractiveDomState(origRoot: HTMLElement, cloneRoot: HTMLElement): void {
  const origInputs = origRoot.querySelectorAll('input');
  const cloneInputs = cloneRoot.querySelectorAll('input');
  for (let i = 0; i < Math.min(origInputs.length, cloneInputs.length); i += 1) {
    const o = origInputs[i];
    const c = cloneInputs[i];
    if (o.type === 'checkbox' || o.type === 'radio') {
      if (o.checked) c.setAttribute('checked', '');
      else c.removeAttribute('checked');
    } else {
      c.setAttribute('value', o.value);
    }
  }

  const origTextareas = origRoot.querySelectorAll('textarea');
  const cloneTextareas = cloneRoot.querySelectorAll('textarea');
  for (let i = 0; i < Math.min(origTextareas.length, cloneTextareas.length); i += 1) {
    cloneTextareas[i].textContent = origTextareas[i].value;
  }

  const origSelects = origRoot.querySelectorAll('select');
  const cloneSelects = cloneRoot.querySelectorAll('select');
  for (let i = 0; i < Math.min(origSelects.length, cloneSelects.length); i += 1) {
    const oOpts = origSelects[i].options;
    const cOpts = cloneSelects[i].options;
    for (let j = 0; j < Math.min(oOpts.length, cOpts.length); j += 1) {
      if (oOpts[j].selected) cOpts[j].setAttribute('selected', '');
      else cOpts[j].removeAttribute('selected');
    }
  }

  const origCanvases = origRoot.querySelectorAll('canvas');
  const cloneCanvases = cloneRoot.querySelectorAll('canvas');
  for (let i = 0; i < Math.min(origCanvases.length, cloneCanvases.length); i += 1) {
    const o = origCanvases[i];
    const c = cloneCanvases[i];
    try {
      const dataUrl = o.toDataURL('image/png');
      if (dataUrl && dataUrl.length > 64) {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = o.getAttribute('aria-label') || 'Rendered canvas view';
        if (c.className) img.className = c.className;
        const rect = o.getBoundingClientRect();
        const existingStyle = c.getAttribute('style') || '';
        const dimStyle =
          rect.width > 0 && rect.height > 0
            ? `width:${Math.round(rect.width)}px;height:${Math.round(rect.height)}px;object-fit:contain;display:block;`
            : 'display:block;max-width:100%;height:auto;';
        img.setAttribute('style', `${dimStyle}${existingStyle}`);
        img.setAttribute('data-captured-canvas', 'true');
        c.replaceWith(img);
      }
    } catch {
      // Keep original <canvas> tag if tainted
    }
  }

  const onloadNodes = cloneRoot.querySelectorAll<HTMLElement>(
    '[data-onload-item], [data-onload-root] > *',
  );
  onloadNodes.forEach((el) => {
    if (el.style.opacity === '0') {
      el.style.opacity = '1';
    }
  });
}

function collectRootCssVars(docEl: HTMLElement, bodyEl: HTMLElement): string {
  const computedHtml = window.getComputedStyle(docEl);
  const computedBody = window.getComputedStyle(bodyEl);
  const keys = [
    '--bg',
    '--plate',
    '--g1',
    '--g2',
    '--g3',
    '--g4',
    '--fg',
    '--muted',
    '--faint',
    '--pill-bg',
    '--stage-vessel-bg',
    '--stage-vessel-border',
    '--tab-menu-bg',
    '--tab-menu-border',
    '--tab-active-bg',
    '--tab-active-shadow',
    '--style-radius',
    '--style-border-w',
    '--style-border-style',
    '--style-accent',
    '--font-sans',
    '--font-mono',
  ];

  const lines: string[] = [];
  for (const key of keys) {
    const val = (computedBody.getPropertyValue(key) || computedHtml.getPropertyValue(key)).trim();
    if (val) {
      lines.push(`  ${key}: ${val};`);
    }
  }
  return `:root {\n${lines.join('\n')}\n}`;
}

export function captureLiveRenderedStage(opts: LiveStageCaptureOptions): LiveStageCaptureResult {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return {
      standaloneHtml: '',
      markupBytes: 0,
      cssBytes: 0,
      matchedRuleCount: 0,
      capturedElementCount: 0,
      capturedFromLiveDom: false,
    };
  }

  const mountEl =
    document.querySelector<HTMLElement>('[data-jig-stage-viewport] .jig-stage-mount') ??
    document.querySelector<HTMLElement>('[data-jig-stage-viewport] .imm-view-frame') ??
    document.querySelector<HTMLElement>('[data-jig-stage-viewport] .jig-view-shell') ??
    document.querySelector<HTMLElement>('[data-standalone="true"]') ??
    document.querySelector<HTMLElement>('[data-jig-stage-viewport]');

  if (!mountEl) {
    return {
      standaloneHtml: '',
      markupBytes: 0,
      cssBytes: 0,
      matchedRuleCount: 0,
      capturedElementCount: 0,
      capturedFromLiveDom: false,
    };
  }

  const cloneRoot = mountEl.cloneNode(true) as HTMLElement;
  mirrorInteractiveDomState(mountEl, cloneRoot);

  const embeddedStyleNodes = new Set<Node>(Array.from(mountEl.querySelectorAll('style')));

  const stats = { matched: 0 };
  const extractedSheets: string[] = [];

  for (let i = 0; i < document.styleSheets.length; i += 1) {
    const sheet = document.styleSheets[i];
    if (!sheet) continue;
    if (sheet.ownerNode && embeddedStyleNodes.has(sheet.ownerNode)) {
      continue;
    }
    try {
      const rules = sheet.cssRules;
      if (!rules || rules.length === 0) continue;
      const filtered = filterCssRules(rules, cloneRoot, stats);
      if (filtered.trim()) {
        extractedSheets.push(filtered);
      }
    } catch {
      // Ignore cross-origin sheets cleanly
    }
  }

  const rootVarsBlock = collectRootCssVars(document.documentElement, document.body);
  const framingCss = opts.isFullView
    ? `
html, body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: ${opts.stageBackgroundHex};
}
.jig-stage-mount,
.imm-view-frame,
.jig-view-shell {
  width: 100vw !important;
  height: 100vh !important;
  min-width: 0;
  min-height: 0;
  padding: 0 !important;
  max-width: none !important;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}
.jig-stage-mount > div,
.imm-view-frame > div,
.jig-view-shell > div {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
}`
    : `
html, body {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${opts.stageBackgroundHex};
  overflow: auto;
}
.jig-stage-mount {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}`;

  const combinedCss = [rootVarsBlock, ...extractedSheets, framingCss].join('\n\n');
  const renderedMarkup = cloneRoot.outerHTML;
  const capturedElementCount = cloneRoot.querySelectorAll('*').length + 1;

  const docTitle = `${opts.domainTitle} - ${opts.viewTitle} (${opts.activeStyle} v${opts.activeVariant} ${opts.jigTheme})`;
  const safeFontsHref = escapeHtmlAttr(opts.googleFontsHref);

  const standaloneHtml = [
    '<!DOCTYPE html>',
    `<html lang="en" data-jig-theme="${escapeHtmlAttr(opts.jigTheme)}" data-theme="${escapeHtmlAttr(opts.jigTheme)}" data-active-style="${escapeHtmlAttr(opts.activeStyle)}" data-active-variant="${opts.activeVariant}" data-active-lib="${escapeHtmlAttr(opts.activeLib)}" data-stage-mode="${escapeHtmlAttr(opts.stageMode)}">`,
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `  <title>${escapeHtmlAttr(docTitle)}</title>`,
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    `  <link rel="stylesheet" href="${safeFontsHref}" />`,
    '  <style>',
    combinedCss,
    '  </style>',
    '</head>',
    `<body data-theme="${escapeHtmlAttr(opts.jigTheme)}" data-jig-theme="${escapeHtmlAttr(opts.jigTheme)}" data-slide="${escapeHtmlAttr(opts.slideId)}" data-domain="${escapeHtmlAttr(opts.domain)}" data-stage-mode="${escapeHtmlAttr(opts.stageMode)}" data-active-style="${escapeHtmlAttr(opts.activeStyle)}" data-active-variant="${opts.activeVariant}" data-active-lib="${escapeHtmlAttr(opts.activeLib)}">`,
    renderedMarkup,
    '</body>',
    '</html>',
  ].join('\n');

  return {
    standaloneHtml,
    markupBytes: renderedMarkup.length,
    cssBytes: combinedCss.length,
    matchedRuleCount: stats.matched,
    capturedElementCount,
    capturedFromLiveDom: true,
  };
}
