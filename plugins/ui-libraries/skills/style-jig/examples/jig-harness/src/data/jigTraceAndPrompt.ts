import {
  CLONE_SOURCE_CONFIG,
  TOC_DOMAIN_GROUPS,
  TOC_ENTRIES,
  getDonorVariantsForStyle,
  getStyleTokenSpec,
  type HarnessDomain,
  type HarnessSlideId,
  type JigTheme,
  type LibSlot,
  type StageMode,
  type StyleSlot,
} from './jigHarnessData';
import { captureLiveRenderedStage } from '../utils/captureRenderedStage';

export interface JigPromptTraceInput {
  domain: HarnessDomain;
  slideId: HarnessSlideId;
  activeStyle: StyleSlot;
  activeVariant: number;
  activeLib: LibSlot;
  jigTheme: JigTheme;
  stageMode: StageMode;
}

export interface JigPromptClipboardPayload {
  key: string;
  promptText: string;
  html: string;
  standaloneHtml: string;
  capturedFromLiveDom: boolean;
  capturedElementCount: number;
  matchedRuleCount: number;
  styleImageDataUri: string;
  styleImagePath: string;
  styleImageLabel: string;
}

export interface TraceBundle {
  key: string;
  fileName: string;
  traceMarkdown: string;
}

export interface TraceOpenResult {
  openedInWindow: boolean;
  fileName: string;
  bundle: TraceBundle;
}

const DEFAULT_GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildStandaloneHref(input: {
  domain: HarnessDomain;
  slideId: HarnessSlideId;
  activeStyle: StyleSlot;
  activeVariant: number;
  activeLib: LibSlot;
  jigTheme: JigTheme;
}): string {
  if (typeof window !== 'undefined' && window.location && window.location.href) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('app', input.domain);
      url.searchParams.set('slide', input.slideId);
      url.searchParams.set('style', input.activeStyle);
      url.searchParams.set('variant', String(input.activeVariant));
      url.searchParams.set('theme', input.jigTheme);
      url.searchParams.set('lib', input.activeLib);
      return url.toString();
    } catch {
      // Fallback to relative query string on opaque origins
    }
  }
  return `?app=${encodeURIComponent(input.domain)}&slide=${encodeURIComponent(input.slideId)}&style=${encodeURIComponent(input.activeStyle)}&variant=${input.activeVariant}&theme=${encodeURIComponent(input.jigTheme)}&lib=${encodeURIComponent(input.activeLib)}`;
}

export function buildSectionUnifiedTraceMarkdown(input: JigPromptTraceInput): string {
  const group =
    TOC_DOMAIN_GROUPS.find((g) => g.domain === input.domain) ?? TOC_DOMAIN_GROUPS[0];
  const entry = TOC_ENTRIES.find((e) => e.id === input.slideId) ?? TOC_ENTRIES[0];
  const styleTokens = getStyleTokenSpec(input.activeStyle);
  const variants = getDonorVariantsForStyle(input.activeStyle);
  const activeVariantObj =
    variants[Math.max(0, Math.min(variants.length - 1, input.activeVariant - 1))];
  const scopeLabel =
    input.stageMode === 'view'
      ? 'Full View (100vw x 100vh)'
      : 'Isolated Component (centered on stage)';
  const accentHex = input.jigTheme === 'dark' ? styleTokens.accentDark : styleTokens.accentLight;
  const bgHex = input.jigTheme === 'dark' ? styleTokens.bgDark : styleTokens.bgLight;
  const standaloneQuery = `?app=${input.domain}&slide=${input.slideId}&style=${input.activeStyle}&variant=${input.activeVariant}&theme=${input.jigTheme}&lib=${input.activeLib}`;

  const cloneSourceLabel = CLONE_SOURCE_CONFIG.enabled
    ? CLONE_SOURCE_CONFIG.serviceName
      ? `${CLONE_SOURCE_CONFIG.provider} (${CLONE_SOURCE_CONFIG.serviceName})`
      : CLONE_SOURCE_CONFIG.provider
    : 'disabled (greenfield)';

  const lines: string[] = [
    `# ${group.label} - ${entry.label} (${input.slideId}::${input.activeStyle}::v${input.activeVariant})`,
    '',
    `- **Domain**: \`${input.domain}\``,
    `- **Active View**: \`${input.slideId}\` (${scopeLabel})`,
    `- **Style**: \`${input.activeStyle}\` - Notch #${input.activeVariant} (${activeVariantObj?.label ?? '1:1 canonical baseline'})`,
    `- **UI Library**: \`${input.activeLib}\``,
    `- **Theme Polarity**: \`${input.jigTheme}\``,
    `- **Clone Source**: \`${cloneSourceLabel}\``,
    `- **Surface Tokens**: bg \`${bgHex}\`, accent \`${accentHex}\`, radius \`${styleTokens.radiusPx}px\`, border \`${styleTokens.borderWidthPx}px ${styleTokens.borderStyle}\``,
    `- **Typography**: ${styleTokens.typography}`,
    '',
    '## Section Views in This Domain',
    '',
    ...group.items.map(
      (item) =>
        `- \`${item.id}\` (${item.stageMode === 'view' ? 'Full View' : 'Component'}) - **${item.label}**${item.id === input.slideId ? ' *(active)*' : ''}`,
    ),
    '',
    '## Standalone 100% x 100% Launch URL',
    '',
    `\`${standaloneQuery}\``,
    '',
    '## Design Kit Guardrails',
    '',
    '- Zero Material fonts (use Instrument Sans, Hanken Grotesk, JetBrains Mono, or paired display fonts).',
    '- Zero purple or violet hues (OKLCH 270-330 deg).',
    '- Optical vertical button centering shifted -2px down (`padding-top > padding-bottom`).',
    '- Pure `#000000` dark / `#FAF9F6` light zero-halo stage canvas with `0` safe-zone overlaps.',
    '',
  ];

  return lines.join('\n');
}

export function buildPromptClipboardPayload(
  input: JigPromptTraceInput,
): JigPromptClipboardPayload {
  const group =
    TOC_DOMAIN_GROUPS.find((g) => g.domain === input.domain) ?? TOC_DOMAIN_GROUPS[0];
  const entry = TOC_ENTRIES.find((e) => e.id === input.slideId) ?? TOC_ENTRIES[0];
  const isFullView = input.stageMode === 'view';
  const scopeLabel = isFullView
    ? 'Full View (100vw x 100vh)'
    : 'Isolated Component (centered on stage)';
  const styleTokens = getStyleTokenSpec(input.activeStyle);
  const variants = getDonorVariantsForStyle(input.activeStyle);
  const activeVariantObj =
    variants[Math.max(0, Math.min(variants.length - 1, input.activeVariant - 1))];
  const donorLabel = activeVariantObj?.label ?? '1:1 canonical baseline';
  const styleImageDataUri = activeVariantObj?.thumb ?? '';
  const styleImagePath = activeVariantObj?.file ? `styles/${input.activeStyle}/${activeVariantObj.file}` : '';
  const styleSummary =
    input.activeStyle === 'clone'
      ? `clone (1:1 canonical baseline) | lib: ${input.activeLib} | theme: ${input.jigTheme}`
      : `${input.activeStyle} - notch #${input.activeVariant} (${donorLabel}) | lib: ${input.activeLib} | theme: ${input.jigTheme}`;

  const stageBg = input.jigTheme === 'dark' ? '#000000' : '#FAF9F6';
  const capture = captureLiveRenderedStage({
    slideId: input.slideId,
    domain: input.domain,
    domainTitle: group.label,
    viewTitle: entry.label,
    stageMode: input.stageMode,
    isFullView,
    activeStyle: input.activeStyle,
    activeVariant: input.activeVariant,
    activeLib: input.activeLib,
    jigTheme: input.jigTheme,
    googleFontsHref: DEFAULT_GOOGLE_FONTS_HREF,
    stageBackgroundHex: stageBg,
  });

  const key = `${input.slideId}::${input.activeStyle}::v${input.activeVariant}::${input.activeLib}::${input.jigTheme}`;

  const lines: string[] = [
    `Build and render the EXACT ${isFullView ? 'full application view' : 'isolated component'} shown in the complete HTML + CSS below -- zero omissions, zero re-simplification, preserving every layout proportion, color token, font, SVG, image, shadow, hover/active state, and interactive control.`,
    '',
    'ACTIVE CONTEXT:',
    `- Section / Domain: ${group.label} (${input.domain})`,
    `- Active View: ${entry.label} (${input.slideId} - ${scopeLabel})`,
    `- Active Style: ${styleSummary}`,
    `- Surface Tokens: bg ${input.jigTheme === 'dark' ? styleTokens.bgDark : styleTokens.bgLight}, accent ${input.jigTheme === 'dark' ? styleTokens.accentDark : styleTokens.accentLight}, radius ${styleTokens.radiusPx}px`,
    `- Typography: ${styleTokens.typography}`,
    `- Output Rule: ${isFullView ? 'Full-bleed 100vw x 100vh viewport with zero outer jig chrome or rounded window borders.' : 'Render ONLY the isolated component centered cleanly in the viewport with nothing else on screen.'}`,
  ];

  if (capture.capturedFromLiveDom && capture.standaloneHtml) {
    lines.push('', 'STANDALONE HTML + CSS SNAPSHOT:', '```html', capture.standaloneHtml, '```');
  }

  const promptText = lines.join('\n');
  const donorImgTag = styleImageDataUri
    ? `<p><img src="${escapeHtml(styleImageDataUri)}" alt="${escapeHtml(donorLabel)}" style="max-width:320px;border-radius:10px;display:block;margin-bottom:12px;" /></p>`
    : '';
  const html = `${donorImgTag}<pre style="font-family:monospace;white-space:pre-wrap;">${escapeHtml(promptText)}</pre>`;

  return {
    key,
    promptText,
    html,
    standaloneHtml: capture.standaloneHtml,
    capturedFromLiveDom: capture.capturedFromLiveDom,
    capturedElementCount: capture.capturedElementCount,
    matchedRuleCount: capture.matchedRuleCount,
    styleImageDataUri,
    styleImagePath,
    styleImageLabel: donorLabel,
  };
}

export function openTraceMarkdownWindow(input: JigPromptTraceInput): TraceOpenResult {
  const entry = TOC_ENTRIES.find((e) => e.id === input.slideId) ?? TOC_ENTRIES[0];
  const traceMarkdown = buildSectionUnifiedTraceMarkdown(input);
  const key = `${input.slideId}::${input.activeStyle}::v${input.activeVariant}`;
  const fileName = `${input.domain}-${input.slideId}-${input.activeStyle}-v${input.activeVariant}-trace.md`;
  const bundle: TraceBundle = { key, fileName, traceMarkdown };

  if (typeof window === 'undefined') {
    return { openedInWindow: false, fileName, bundle };
  }

  const title = `${entry.label} (${key}) - Trace .md`;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 32px 24px; background: #111110; color: #ededec; font-family: 'Instrument Sans', system-ui, sans-serif; line-height: 1.6; }
    main { max-width: 820px; margin: 0 auto; background: #191918; border: 1px solid #2b2b29; border-radius: 14px; padding: 24px 28px; }
    pre { white-space: pre-wrap; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; color: #dcdcd8; }
  </style>
</head>
<body>
  <main>
    <pre>${escapeHtml(traceMarkdown)}</pre>
  </main>
</body>
</html>`;

  // In sandboxed iframes (such as Artifact Panes), prefer the crisp in-app modal directly
  const isEmbedded = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  if (isEmbedded) {
    return { openedInWindow: false, fileName, bundle };
  }

  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      URL.revokeObjectURL(url);
      return { openedInWindow: false, fileName, bundle };
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return { openedInWindow: true, fileName, bundle };
  } catch {
    return { openedInWindow: false, fileName, bundle };
  }
}
