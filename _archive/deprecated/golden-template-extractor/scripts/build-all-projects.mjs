#!/usr/bin/env node
/**
 * Golden Template Full Linter, Standalone Component Builder & Minimal Dev Inspector Generator
 *
 * 1. Runs `lint-golden-template.mjs --fix` across all projects in `projects/` to verify
 *    100% compliance with the canonical `dating` folder structure and coding notations.
 * 2. Builds each standalone Golden Template React app (`projects/<slug>/`) via Vite + viteSingleFile().
 * 3. Injects a tiny, minimal, dev-centric floating control bar (`#gt-inspector-host` in Shadow DOM,
 *    introducing zero styles to the page or component itself) in the bottom-right with 3 small dev actions:
 *      - `Skills` (workspace SKILL.md files + download)
 *      - `Files` (Golden Template file tree + full source code for every file)
 *      - `Prompts` (exact component reconstruction brief + Nano Banana multi-screen/state prompt + master prompt)
 *    plus a `←` back link to the moodboard index.
 * 4. Copies raw source files to `dist/projects/<slug>/source/`, prompts to `dist/projects/<slug>/prompts/`,
 *    workspace skills to `dist/skills/` & `public/skills/`, syncs `screenshots/` to `public/screenshots/` &
 *    `dist/screenshots/`, and writes `src/golden-projects.json` + `src/golden-skills.json`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirArg = process.argv.find((a) => a.startsWith('--dir='))?.slice('--dir='.length);
const MOODBOARD_ROOT = dirArg
  ? path.resolve(dirArg)
  : fs.existsSync(path.join(path.resolve(__dirname, '..'), 'projects'))
    ? path.resolve(__dirname, '..')
    : process.cwd();
const WORKSPACE_ROOT = path.resolve(MOODBOARD_ROOT, '..');
const SKILLS_ROOT = path.join(WORKSPACE_ROOT, 'skills');
const NANO_BANANA_ROOT = path.join(WORKSPACE_ROOT, 'nano-banana-2-cleanup');
const BRIEFS_DIR = path.join(MOODBOARD_ROOT, 'briefs');
const PROJECTS_DIR = path.join(MOODBOARD_ROOT, 'projects');
const DIST_PROJECTS_DIR = path.join(MOODBOARD_ROOT, 'dist', 'projects');
const PUBLIC_PROJECTS_DIR = path.join(MOODBOARD_ROOT, 'public', 'projects');
const NODE_BIN = 'node';
const VITE_BIN = path.join(MOODBOARD_ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const LINTER_SCRIPT = path.join(__dirname, 'lint-golden-template.mjs');

export const REF_TO_SLUG = {
  'REF-001': '01-website-leather-goods',
  'REF-002': '02-website-bakery',
  'REF-003': '03-website-interiors',
  'REF-004': '04-website-architecture',
  'REF-005': '05-website-aperitif',
  'REF-006': '06-website-skincare',
  'REF-007': '07-ui-weather-card',
  'REF-008': '08-ui-team-picker',
  'REF-009': '09-ui-palette-picker',
  'REF-010': '10-ui-membership-panel',
  'REF-011': '11-ui-usage-dashboard',
  'REF-012': '12-ui-navigation-dock',
  'REF-013': '13-mobile-app-onboarding',
  'REF-014': '14-mobile-app-bedtime',
  'REF-015': '15-mobile-app-waitlist',
  'REF-016': '16-mobile-app-puzzle',
  'REF-017': '17-mobile-app-forecast',
  'REF-018': '18-mobile-app-planner',
  'REF-043': '19-chat-ui-conversation',
  'REF-044': '20-chat-ui-canvas',
  'REF-045': '21-chat-ui-composer',
  'REF-046': '22-chat-ui-reasoning',
  'REF-047': '23-chat-ui-sidebar',
};

const SLUG_TO_REF = Object.fromEntries(
  Object.entries(REF_TO_SLUG).map(([ref, slug]) => [slug, ref]),
);

const SLUG_TO_NANO_PROMPT = {
  '01-website-leather-goods': 'websites/avela/prompt.md',
  '02-website-bakery': 'websites/mellore/prompt.md',
  '03-website-interiors': 'websites/stillhaven/prompt.md',
  '04-website-architecture': 'websites/oriel/prompt.md',
  '05-website-aperitif': 'websites/sundrop/prompt.md',
  '06-website-skincare': 'websites/serein/prompt.md',
  '07-ui-weather-card': 'components/weather/prompt.md',
  '08-ui-team-picker': 'components/people/prompt.md',
  '09-ui-palette-picker': 'components/palette/prompt.md',
  '10-ui-membership-panel': 'components/membership/prompt.md',
  '11-ui-usage-dashboard': 'components/usage/prompt.md',
  '12-ui-navigation-dock': 'components/dock/prompt.md',
  '13-mobile-app-onboarding': 'mobile/kindrednote/prompt.md',
  '14-mobile-app-bedtime': 'mobile/emberrest/prompt.md',
  '15-mobile-app-waitlist': 'mobile/spriglet/prompt.md',
  '16-mobile-app-puzzle': 'mobile/florivo/prompt.md',
  '17-mobile-app-forecast': 'mobile/dayglint/prompt.md',
  '18-mobile-app-planner': 'mobile/evenfall/prompt.md',
};

const CHAT_UI_PROMPTS = {
  '19-chat-ui-conversation': `# Chat UI — Conversation View (19-chat-ui-conversation)

## Component Reconstruction & Interaction Prompt
Build a full-viewport Warm Editorial Chat UI Conversation View in React 19 + Vite 7 + Tailwind v4:
- **Layout**: Collapsible left conversation history sidebar (260px) + full-height main conversation column (\`100vh\`) with top model selector bar, centered thread stream, and bottom floating composer pill.
- **Palette & Tokens**: Warm ivory paper surface (\`#f8f1e5\`), raised warm card (\`#fffaf1\`), deep espresso ink (\`#241c16\`), terracotta accent (\`#b55233\`), subtle hairline border (\`#e5dac9\`).
- **Interactive Controls**:
  - Switch between 4 authored warm design threads (*Warm Editorial Tokens*, *Courtyard Travertine*, *Serein Apothecary*, *Oriel Timber Acoustics*).
  - Inline user prompt editor with live branch regeneration (\`1/2\` / \`2/2\`).
  - Expandable reasoning summary, syntax-highlighted token output block with copy action, citation drawer, and working bottom composer with attachment & tool pills (*Search*, *Reason*, *Voice*).`,
  '20-chat-ui-canvas': `# Chat UI — Split Canvas View (20-chat-ui-canvas)

## Component Reconstruction & Interaction Prompt
Build a full-viewport Warm Editorial Chat UI Split Canvas View in React 19 + Vite 7 + Tailwind v4:
- **Layout**: Left chat prompt/response column + right interactive live artifact Canvas split pane (\`100vh\` edge-to-edge).
- **Palette & Tokens**: Orchard parchment (\`#f6ecdc\`), raised cream (\`#fffdf8\`), deep umber ink (\`#2b2119\`), orchard terracotta accent (\`#b0442a\`), sage secondary (\`#5d6b47\`).
- **Interactive Controls**:
  - Switch artifact tabs between **Live Preview**, **Source Code**, and **Token Diff**.
  - Interactive revision switcher (\`v1\`, \`v2\`, \`v3\`), viewport width toggle, live token editor, and inline prompt refinement bar.`,
  '21-chat-ui-composer': `# Chat UI — Zero-State Composer (21-chat-ui-composer)

## Component Reconstruction & Interaction Prompt
Build a full-viewport Warm Editorial Chat UI Zero-State Composer in React 19 + Vite 7 + Tailwind v4:
- **Layout**: Full-viewport warm editorial zero-state workspace with model/tone selector header, centered greeting & multi-modal composer box, attachment tray, and 4 interactive starter prompt cards.
- **Palette & Tokens**: Sunlit honey cream (\`#fbf3e4\`), raised card (\`#fffdf9\`), espresso ink (\`#261c15\`), amber accent (\`#c67d3b\`).
- **Interactive Controls**:
  - Toggle multi-modal attachments, tool pills (*Search*, *Reason*, *Canvas*, *Voice*), and click any starter card or submit custom prompts to transition into a live response turn.`,
  '22-chat-ui-reasoning': `# Chat UI — Reasoning Turn View (22-chat-ui-reasoning)

## Component Reconstruction & Interaction Prompt
Build a full-viewport Warm Editorial Chat UI Reasoning Turn View in React 19 + Vite 7 + Tailwind v4:
- **Layout**: Full-viewport reasoning inspection workspace with expandable multi-step chain-of-thought accordion, latency/token badges, verified synthesis response, and interactive follow-up composer.
- **Palette & Tokens**: Moss stone parchment (\`#f4efe6\`), raised card (\`#fcf9f2\`), deep forest-umber ink (\`#21241d\`), moss olive accent (\`#5a6b47\`).
- **Interactive Controls**:
  - Expand/collapse individual reasoning steps (*01 Parse Chromatic Constraints*, *02 Compute OKLCH Contrast*, *03 Synthesize Component Tokens*, *04 Verify WCAG AA/AAA*), switch reasoning depth presets, and inspect cited sources.`,
  '23-chat-ui-sidebar': `# Chat UI — Projects Sidebar Workspace (23-chat-ui-sidebar)

## Component Reconstruction & Interaction Prompt
Build a full-viewport Warm Editorial Chat UI Projects & Knowledge Workspace in React 19 + Vite 7 + Tailwind v4:
- **Layout**: Left project directory & pinned thread sidebar + main project overview workspace with knowledge base files, system instructions editor, and active thread launcher.
- **Palette & Tokens**: Rosette clay paper (\`#f9efe8\`), raised card (\`#fffaf6\`), espresso ink (\`#2a1c19\`), terra-rose accent (\`#b85d4b\`).
- **Interactive Controls**:
  - Switch between project folders (*Warm Editorial Tokens*, *Courtyard Architecture*, *Botanical Packaging*), filter threads by search query, pin/unpin conversations, and edit project instructions.`,
};

const WORKSPACE_SKILLS_SPEC = [
  {
    id: 'image-to-react',
    name: 'image-to-react',
    role: 'High-Res Screenshot-to-React Synthesis & Closed-Loop Visual Eval (s_total >= 0.85)',
    cliExample: (slug) =>
      `node ../skills/image-to-react/scripts/eval-image-to-react.mjs --project=./projects/${slug} --ref=./screenshots/${slug}.png`,
  },
  {
    id: 'react-extractor',
    name: 'react-extractor',
    role: 'Dual-Mode Image-to-React & Website-to-React Golden Template Extractor',
    cliExample: (slug) =>
      `node ../skills/react-extractor/scripts/build-all-projects.mjs --only=${slug}`,
  },
  {
    id: 'golden-template-extractor',
    name: 'golden-template-extractor',
    role: 'Canonical dating Golden Template Blueprint, Nomenclature & Strict tsc Linter',
    cliExample: () =>
      `node ../golden-template/scripts/lint-golden-template.mjs --dir=. --fix`,
  },
];

function sanitizeVendorNeutralText(text, slug) {
  return text
    .replace(/\bREF-\d{3}\b/g, slug.toUpperCase())
    .replace(/\bJetski\b/gi, 'Chat UI')
    .replace(/\bChatGPT\b/gi, 'Chat UI')
    .replace(/\bgemini-4-argon\b/gi, 'warm-editorial')
    .replace(/\bArgon\b/gi, 'Warm Studio');
}

function extractRefSectionFromBrief(briefPath, refId, slug) {
  if (!fs.existsSync(briefPath) || !refId) return null;
  const raw = fs.readFileSync(briefPath, 'utf8');
  const escapedRef = refId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^##\\s+${escapedRef}\\b[\\s\\S]*?)(?=^##\\s+REF-|^##\\s+Image-Layer|$)`, 'm');
  const match = raw.match(regex);
  if (!match) return null;
  return sanitizeVendorNeutralText(match[1].trim(), slug);
}

function collectProjectPrompts(slug) {
  const refId = SLUG_TO_REF[slug] || '';
  const prompts = [];

  // 1. Nano Banana 2 Multi-Screen / Multi-State Generation Prompt (if available)
  const nanoRel = SLUG_TO_NANO_PROMPT[slug];
  if (nanoRel) {
    const nanoPath = path.join(NANO_BANANA_ROOT, nanoRel);
    if (fs.existsSync(nanoPath)) {
      const content = sanitizeVendorNeutralText(fs.readFileSync(nanoPath, 'utf8'), slug);
      prompts.push({
        id: 'multi-screen-prompt',
        name: 'Multi-Screen / State Generation Prompt',
        role: `Full specification & screen-by-screen prompt (${nanoRel})`,
        localPath: nanoPath,
        fileUri: `file://${nanoPath}`,
        rawUrl: `./prompts/multi-screen-prompt.md`,
        lines: content.split('\n').length,
        bytes: Buffer.byteLength(content, 'utf8'),
        content,
      });
    }
  } else if (CHAT_UI_PROMPTS[slug]) {
    const content = CHAT_UI_PROMPTS[slug];
    const briefPath = path.join(BRIEFS_DIR, 'below-the-fold-and-app-views-proposal.md');
    prompts.push({
      id: 'chat-ui-prompt',
      name: 'Component Reconstruction Prompt',
      role: 'Warm Editorial Chat UI specification & interaction prompt',
      localPath: briefPath,
      fileUri: `file://${briefPath}`,
      rawUrl: `./prompts/chat-ui-prompt.md`,
      lines: content.split('\n').length,
      bytes: Buffer.byteLength(content, 'utf8'),
      content,
    });
  }

  // 2. Moodboard Reconstruction Brief (briefs/websites.md or briefs/interfaces.md)
  const websitesBriefPath = path.join(BRIEFS_DIR, 'websites.md');
  const interfacesBriefPath = path.join(BRIEFS_DIR, 'interfaces.md');
  const websiteSection = extractRefSectionFromBrief(websitesBriefPath, refId, slug);
  if (websiteSection) {
    prompts.push({
      id: 'reconstruction-brief',
      name: 'Website Reconstruction Brief',
      role: 'Observed composition, typography, palette tokens & DOM layer brief (briefs/websites.md)',
      localPath: websitesBriefPath,
      fileUri: `file://${websitesBriefPath}`,
      rawUrl: `./prompts/reconstruction-brief.md`,
      lines: websiteSection.split('\n').length,
      bytes: Buffer.byteLength(websiteSection, 'utf8'),
      content: websiteSection,
    });
  }

  const interfaceSection = extractRefSectionFromBrief(interfacesBriefPath, refId, slug);
  if (interfaceSection) {
    prompts.push({
      id: 'reconstruction-brief',
      name: 'Interface Reconstruction Brief',
      role: 'Observed composition, stateful controls, palette tokens & verification brief (briefs/interfaces.md)',
      localPath: interfacesBriefPath,
      fileUri: `file://${interfacesBriefPath}`,
      rawUrl: `./prompts/reconstruction-brief.md`,
      lines: interfaceSection.split('\n').length,
      bytes: Buffer.byteLength(interfaceSection, 'utf8'),
      content: interfaceSection,
    });
  }

  // 3. Shared Master Moodboard Prompt (briefs/original-image-prompt.md)
  const masterPromptPath = path.join(BRIEFS_DIR, 'original-image-prompt.md');
  if (fs.existsSync(masterPromptPath)) {
    const masterContent = sanitizeVendorNeutralText(
      fs.readFileSync(masterPromptPath, 'utf8'),
      slug,
    );
    prompts.push({
      id: 'moodboard-master-prompt',
      name: 'Warm Moodboard Master Prompt',
      role: 'Shared 10-direction warm moodboard & image-to-React synthesis prompt (briefs/original-image-prompt.md)',
      localPath: masterPromptPath,
      fileUri: `file://${masterPromptPath}`,
      rawUrl: `./prompts/moodboard-master-prompt.md`,
      lines: masterContent.split('\n').length,
      bytes: Buffer.byteLength(masterContent, 'utf8'),
      content: masterContent,
    });
  }

  return prompts;
}

function collectWorkspaceSkills() {
  const skills = [];
  for (const spec of WORKSPACE_SKILLS_SPEC) {
    const skillDir = path.join(SKILLS_ROOT, spec.id);
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, 'utf8');
      skills.push({
        id: spec.id,
        name: spec.name,
        role: spec.role,
        localDir: skillDir,
        localPath: skillMdPath,
        fileUri: `file://${skillMdPath}`,
        dirUri: `file://${skillDir}`,
        rawUrl: `./skills/${spec.id}/SKILL.md`,
        lines: content.split('\n').length,
        bytes: Buffer.byteLength(content, 'utf8'),
        content,
      });
    }
  }
  return skills;
}

function describeFileRole(relPath) {
  if (relPath === 'package.json') return 'React 19 + Vite 7 + Tailwind v4 + SingleFile manifest';
  if (relPath === 'tsconfig.json') return 'Strict TypeScript bundler config (@/* alias)';
  if (relPath === 'vite.config.ts') return 'Vite bundler config (react, tailwindcss, viteSingleFile)';
  if (relPath === 'index.html') return 'HTML5 entry point & Google Fonts mount (#root)';
  if (relPath === 'src/main.tsx') return 'StrictMode root mount importing ./index.css';
  if (relPath === 'src/index.css') return 'Tailwind v4 @import + @layer base semantic tokens';
  if (relPath === 'src/App.tsx') return 'Top-level interactive component shell & state orchestrator';
  if (relPath === 'src/utils/cn.ts') return 'Canonical clsx + tailwind-merge class utility';
  if (relPath.startsWith('src/data/')) return 'Typed domain interfaces, constants & seed data';
  if (relPath.endsWith('BrandLogo.tsx')) return 'Custom SVG brand emblem component';
  if (relPath.startsWith('src/components/')) return 'Modular interactive UI subcomponent';
  return 'Source file';
}

function buildAsciiTree(slug, files) {
  const compFiles = files.filter((f) => f.path.startsWith('src/components/'));
  const dataFiles = files.filter((f) => f.path.startsWith('src/data/'));
  const lines = [
    `${slug}/`,
    `├── index.html`,
    `├── package.json`,
    `├── tsconfig.json`,
    `├── vite.config.ts`,
    `└── src/`,
    `    ├── main.tsx`,
    `    ├── index.css`,
    `    ├── App.tsx`,
    `    ├── components/`,
  ];
  compFiles.forEach((f, i) => {
    const branch = i === compFiles.length - 1 ? '└──' : '├──';
    lines.push(`    │   ${branch} ${path.basename(f.path)} (${f.lines}L)`);
  });
  lines.push(`    ├── data/`);
  dataFiles.forEach((f, i) => {
    const branch = i === dataFiles.length - 1 ? '└──' : '├──';
    lines.push(`    │   ${branch} ${path.basename(f.path)} (${f.lines}L)`);
  });
  lines.push(`    └── utils/`);
  lines.push(`        └── cn.ts`);
  return lines.join('\n');
}

function collectProjectFiles(projectDir) {
  const orderedRelPaths = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'index.html',
    'src/main.tsx',
    'src/index.css',
    'src/App.tsx',
  ];

  const dataDir = path.join(projectDir, 'src', 'data');
  if (fs.existsSync(dataDir)) {
    for (const f of fs.readdirSync(dataDir).sort()) {
      if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        orderedRelPaths.push(`src/data/${f}`);
      }
    }
  }

  const compDir = path.join(projectDir, 'src', 'components');
  if (fs.existsSync(compDir)) {
    const compFiles = fs.readdirSync(compDir).sort((a, b) => {
      const aLogo = a.endsWith('BrandLogo.tsx') ? -1 : 0;
      const bLogo = b.endsWith('BrandLogo.tsx') ? -1 : 0;
      if (aLogo !== bLogo) return aLogo - bLogo;
      return a.localeCompare(b);
    });
    for (const f of compFiles) {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        orderedRelPaths.push(`src/components/${f}`);
      }
    }
  }

  orderedRelPaths.push('src/utils/cn.ts');

  const files = [];
  for (const relPath of orderedRelPaths) {
    const absPath = path.join(projectDir, relPath);
    if (fs.existsSync(absPath)) {
      const content = fs.readFileSync(absPath, 'utf8');
      files.push({
        path: relPath,
        role: describeFileRole(relPath),
        localPath: absPath,
        fileUri: `file://${absPath}`,
        lines: content.split('\n').length,
        bytes: Buffer.byteLength(content, 'utf8'),
        content,
      });
    }
  }
  return files;
}

function createInspectorSnippet(slug, projectDir, files, skills, prompts) {
  const asciiTree = buildAsciiTree(slug, files);
  const projectSkills = skills.map((s) => {
    const spec = WORKSPACE_SKILLS_SPEC.find((sp) => sp.id === s.id);
    return {
      ...s,
      cliCommand: spec ? spec.cliExample(slug) : '',
      relSkillUrl: `../../skills/${s.id}/SKILL.md`,
    };
  });

  const payload = JSON.stringify({
    slug,
    projectDir,
    projectFileUri: `file://${projectDir}`,
    asciiTree,
    files,
    skills: projectSkills,
    prompts,
  }).replace(/<\//g, '<\\/');

  return `
<!-- Golden Template Minimal Dev Overlay (Skills · Files · Prompts) -->
<script id="golden-template-inspector-data" type="application/json">${payload}</script>
<script>
(function() {
  try {
    var dataEl = document.getElementById('golden-template-inspector-data');
    if (!dataEl) return;
    var info = JSON.parse(dataEl.textContent);
    var activeFileIdx = 0;
    for (var i = 0; i < info.files.length; i++) {
      if (info.files[i].path === 'src/App.tsx') { activeFileIdx = i; break; }
    }
    var activeSkillIdx = 0;
    var activePromptIdx = 0;
    var activeTab = 'files'; // 'skills' | 'files' | 'prompts'

    var host = document.createElement('div');
    host.id = 'gt-inspector-host';
    host.style.cssText = 'position:fixed;z-index:2147483640;bottom:10px;right:10px;font-family:ui-monospace,"JetBrains Mono",SFMono-Regular,Menlo,Consolas,monospace;';
    document.body.appendChild(host);
    var shadow = host.attachShadow({ mode: 'open' });

    var style = document.createElement('style');
    style.textContent = [
      '* { box-sizing: border-box; }',
      '.gt-pill { display:inline-flex; align-items:center; gap:3px; background:rgba(15,15,18,0.92); color:#E4E4E7; padding:3px 5px; border-radius:6px; border:1px solid rgba(255,255,255,0.14); box-shadow:0 6px 20px rgba(0,0,0,0.32); backdrop-filter:blur(8px); font-size:11px; line-height:1; }',
      '.gt-mini-link, .gt-mini-btn { appearance:none; border:1px solid transparent; background:transparent; color:#D4D4D8; font:inherit; font-size:11px; padding:4px 7px; border-radius:4px; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:4px; white-space:nowrap; transition:background 0.12s, color 0.12s, border-color 0.12s; }',
      '.gt-mini-link:hover, .gt-mini-btn:hover { background:rgba(255,255,255,0.12); color:#FFFFFF; }',
      '.gt-mini-btn.primary { background:rgba(255,255,255,0.07); border-color:rgba(255,255,255,0.12); color:#F4F4F5; }',
      '.gt-mini-btn.primary:hover { background:rgba(255,255,255,0.16); }',
      '.gt-sep { width:1px; height:12px; background:rgba(255,255,255,0.14); margin:0 1px; }',
      '.gt-overlay { position:fixed; inset:0; z-index:2147483645; background:rgba(0,0,0,0.64); display:none; align-items:center; justify-content:center; padding:16px; }',
      '.gt-overlay.open { display:flex; }',
      '.gt-modal { width:100%; max-width:1360px; height:calc(100vh - 32px); background:#0D0D10; color:#E4E4E7; border:1px solid #27272A; border-radius:8px; box-shadow:0 24px 64px rgba(0,0,0,0.65); display:flex; flex-direction:column; overflow:hidden; font-size:12px; }',
      '.gt-top { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 12px; background:#141418; border-bottom:1px solid #27272A; flex-wrap:wrap; }',
      '.gt-top-left { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }',
      '.gt-slug { font-weight:600; color:#FAFAFA; font-size:12px; }',
      '.gt-tabs { display:inline-flex; align-items:center; gap:4px; background:#09090B; padding:3px; border-radius:6px; border:1px solid #27272A; }',
      '.gt-tab { appearance:none; border:0; background:transparent; color:#A1A1AA; font:inherit; font-size:11px; padding:4px 10px; border-radius:4px; cursor:pointer; }',
      '.gt-tab:hover { color:#F4F4F5; }',
      '.gt-tab.active { background:#27272A; color:#FAFAFA; font-weight:600; }',
      '.gt-top-right { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }',
      '.gt-act { appearance:none; border:1px solid #3F3F46; background:#18181B; color:#E4E4E7; font:inherit; font-size:11px; padding:4px 9px; border-radius:4px; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:4px; }',
      '.gt-act:hover { background:#27272A; color:#FFF; }',
      '.gt-pane { display:none; flex:1; min-height:0; }',
      '.gt-pane.active { display:grid; grid-template-columns:280px 1fr; }',
      '.gt-sidebar { border-right:1px solid #27272A; background:#111115; padding:8px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; }',
      '.gt-side-label { font-size:10px; text-transform:uppercase; letter-spacing:0.06em; color:#71717A; padding:6px 8px 4px; font-weight:600; }',
      '.gt-tree-box { margin:0 4px 8px; padding:8px; background:#09090C; border:1px solid #222228; border-radius:5px; font:inherit; font-size:10.5px; line-height:1.48; color:#A1A1AA; overflow-x:auto; white-space:pre; }',
      '.gt-item { appearance:none; border:0; background:transparent; color:#A1A1AA; font:inherit; font-size:11.5px; text-align:left; padding:6px 8px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:6px; }',
      '.gt-item:hover { background:#1F1F25; color:#F4F4F5; }',
      '.gt-item.active { background:#27272A; color:#FAFAFA; font-weight:600; }',
      '.gt-main { display:flex; flex-direction:column; min-width:0; min-height:0; background:#0A0A0D; }',
      '.gt-subbar { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 12px; background:#111115; border-bottom:1px solid #222226; flex-wrap:wrap; font-size:11px; color:#A1A1AA; }',
      '.gt-subbar-actions { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }',
      '.gt-pre { margin:0; padding:14px 16px; overflow:auto; flex:1; font:inherit; font-size:12px; line-height:1.55; color:#E4E4E7; tab-size:2; white-space:pre-wrap; word-break:break-word; }',
      '@media (max-width: 760px) { .gt-pane.active { grid-template-columns:1fr; } .gt-sidebar { max-height:160px; border-right:0; border-bottom:1px solid #27272A; } }'
    ].join('\\n');
    shadow.appendChild(style);

    function downloadText(filename, text) {
      var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 150);
    }

    function buildAllSkillsBundle() {
      return info.skills.map(function(s) {
        return '# ============================================================================\\n' +
               '# SKILL: ' + s.name + ' (' + s.localPath + ')\\n' +
               '# CLI:   ' + s.cliCommand + '\\n' +
               '# ============================================================================\\n\\n' +
               s.content;
      }).join('\\n\\n\\n');
    }

    function buildAllPromptsBundle() {
      return (info.prompts || []).map(function(p) {
        return '# ============================================================================\\n' +
               '# PROMPT: ' + p.name + ' (' + info.slug + ')\\n' +
               '# ROLE:   ' + p.role + '\\n' +
               '# SOURCE: ' + p.localPath + '\\n' +
               '# ============================================================================\\n\\n' +
               p.content;
      }).join('\\n\\n\\n');
    }

    var wrap = document.createElement('div');
    wrap.innerHTML = [
      '<div class="gt-pill" role="region" aria-label="Developer inspect actions">',
      '  <a class="gt-mini-link" href="../../index.html" title="Back to Moodboard Index">←</a>',
      '  <span class="gt-sep"></span>',
      '  <button type="button" class="gt-mini-btn primary" id="gt-btn-skills">Skills</button>',
      '  <button type="button" class="gt-mini-btn primary" id="gt-btn-files">Files</button>',
      '  <button type="button" class="gt-mini-btn primary" id="gt-btn-prompts">Prompts</button>',
      '</div>',
      '<div class="gt-overlay" id="gt-overlay" role="dialog" aria-modal="true" aria-label="Developer Inspector">',
      '  <div class="gt-modal" id="gt-modal">',
      '    <div class="gt-top">',
      '      <div class="gt-top-left">',
      '        <span class="gt-slug">projects/' + info.slug + '</span>',
      '        <div class="gt-tabs" role="tablist">',
      '          <button type="button" class="gt-tab" data-tab="skills" id="gt-tab-skills">Skills (' + info.skills.length + ')</button>',
      '          <button type="button" class="gt-tab active" data-tab="files" id="gt-tab-files">Files (' + info.files.length + ')</button>',
      '          <button type="button" class="gt-tab" data-tab="prompts" id="gt-tab-prompts">Prompts (' + (info.prompts ? info.prompts.length : 0) + ')</button>',
      '        </div>',
      '      </div>',
      '      <div class="gt-top-right">',
      '        <a class="gt-act" href="' + info.projectFileUri + '" title="Open local folder">file:// Folder</a>',
      '        <button type="button" class="gt-act" id="gt-dl-all-skills-btn">↓ Skills (.md)</button>',
      '        <button type="button" class="gt-act" id="gt-dl-all-prompts-btn">↓ Prompts (.md)</button>',
      '        <button type="button" class="gt-act" id="gt-close-btn">Close [Esc]</button>',
      '      </div>',
      '    </div>',
      '    <!-- SKILLS PANE -->',
      '    <div class="gt-pane" id="gt-pane-skills">',
      '      <div class="gt-sidebar">',
      '        <div class="gt-side-label">Workspace Skills (' + info.skills.length + ')</div>',
      '        <div id="gt-skill-list" style="display:flex;flex-direction:column;gap:2px;"></div>',
      '        <div style="margin-top:auto;padding-top:10px;border-top:1px solid #27272A;display:flex;flex-direction:column;gap:6px;">',
      '          <button type="button" class="gt-act" id="gt-dl-one-skill-btn" style="justify-content:center;">Download Selected SKILL.md</button>',
      '          <button type="button" class="gt-act" id="gt-dl-bundle-skill-btn" style="justify-content:center;">Download All 3 Skills (.md)</button>',
      '        </div>',
      '      </div>',
      '      <div class="gt-main">',
      '        <div class="gt-subbar">',
      '          <span id="gt-skill-meta"></span>',
      '          <div class="gt-subbar-actions">',
      '            <a class="gt-act" id="gt-skill-file-uri" href="#" target="_blank" rel="noreferrer">file:// SKILL.md</a>',
      '            <a class="gt-act" id="gt-skill-raw-url" href="#" target="_blank" rel="noreferrer">Raw SKILL.md ↗</a>',
      '            <button type="button" class="gt-act" id="gt-copy-skill-cli-btn">Copy CLI Cmd</button>',
      '            <button type="button" class="gt-act" id="gt-copy-skill-btn">Copy SKILL.md</button>',
      '          </div>',
      '        </div>',
      '        <pre class="gt-pre"><code id="gt-skill-box"></code></pre>',
      '      </div>',
      '    </div>',
      '    <!-- FILES PANE -->',
      '    <div class="gt-pane active" id="gt-pane-files">',
      '      <div class="gt-sidebar">',
      '        <div class="gt-side-label">Source Files (' + info.files.length + ')</div>',
      '        <div id="gt-file-list" style="display:flex;flex-direction:column;gap:2px;"></div>',
      '        <div class="gt-side-label" style="margin-top:10px;">Golden Template Tree</div>',
      '        <pre class="gt-tree-box" id="gt-tree-ascii"></pre>',
      '        <button type="button" class="gt-act" id="gt-copy-tree-btn" style="justify-content:center;">Copy ASCII Tree</button>',
      '      </div>',
      '      <div class="gt-main">',
      '        <div class="gt-subbar">',
      '          <span id="gt-code-meta"></span>',
      '          <div class="gt-subbar-actions">',
      '            <a class="gt-act" id="gt-code-file-uri" href="#" target="_blank" rel="noreferrer">file://</a>',
      '            <a class="gt-act" id="gt-code-raw-url" href="#" target="_blank" rel="noreferrer">Raw ↗</a>',
      '            <button type="button" class="gt-act" id="gt-dl-file-btn">Download File</button>',
      '            <button type="button" class="gt-act" id="gt-copy-code-btn">Copy Code</button>',
      '          </div>',
      '        </div>',
      '        <pre class="gt-pre" style="white-space:pre;"><code id="gt-code-box"></code></pre>',
      '      </div>',
      '    </div>',
      '    <!-- PROMPTS PANE -->',
      '    <div class="gt-pane" id="gt-pane-prompts">',
      '      <div class="gt-sidebar">',
      '        <div class="gt-side-label">Component Prompts (' + (info.prompts ? info.prompts.length : 0) + ')</div>',
      '        <div id="gt-prompt-list" style="display:flex;flex-direction:column;gap:2px;"></div>',
      '        <div style="margin-top:auto;padding-top:10px;border-top:1px solid #27272A;display:flex;flex-direction:column;gap:6px;">',
      '          <button type="button" class="gt-act" id="gt-dl-one-prompt-btn" style="justify-content:center;">Download Selected Prompt (.md)</button>',
      '          <button type="button" class="gt-act" id="gt-dl-bundle-prompt-btn" style="justify-content:center;">Download All Prompts (.md)</button>',
      '        </div>',
      '      </div>',
      '      <div class="gt-main">',
      '        <div class="gt-subbar">',
      '          <span id="gt-prompt-meta"></span>',
      '          <div class="gt-subbar-actions">',
      '            <a class="gt-act" id="gt-prompt-file-uri" href="#" target="_blank" rel="noreferrer">file:// Prompt</a>',
      '            <a class="gt-act" id="gt-prompt-raw-url" href="#" target="_blank" rel="noreferrer">Raw Prompt ↗</a>',
      '            <button type="button" class="gt-act" id="gt-copy-prompt-btn">Copy Prompt</button>',
      '          </div>',
      '        </div>',
      '        <pre class="gt-pre"><code id="gt-prompt-box"></code></pre>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
    shadow.appendChild(wrap);

    var overlay = shadow.getElementById('gt-overlay');
    var fileListEl = shadow.getElementById('gt-file-list');
    var codeBox = shadow.getElementById('gt-code-box');
    var codeMeta = shadow.getElementById('gt-code-meta');
    var codeFileUri = shadow.getElementById('gt-code-file-uri');
    var codeRawUrl = shadow.getElementById('gt-code-raw-url');

    var skillListEl = shadow.getElementById('gt-skill-list');
    var skillBox = shadow.getElementById('gt-skill-box');
    var skillMeta = shadow.getElementById('gt-skill-meta');
    var skillFileUri = shadow.getElementById('gt-skill-file-uri');
    var skillRawUrl = shadow.getElementById('gt-skill-raw-url');

    var promptListEl = shadow.getElementById('gt-prompt-list');
    var promptBox = shadow.getElementById('gt-prompt-box');
    var promptMeta = shadow.getElementById('gt-prompt-meta');
    var promptFileUri = shadow.getElementById('gt-prompt-file-uri');
    var promptRawUrl = shadow.getElementById('gt-prompt-raw-url');

    shadow.getElementById('gt-tree-ascii').textContent = info.asciiTree;

    function selectTab(tab) {
      activeTab = tab;
      ['skills', 'files', 'prompts'].forEach(function(t) {
        shadow.getElementById('gt-tab-' + t).classList.toggle('active', t === tab);
        shadow.getElementById('gt-pane-' + t).classList.toggle('active', t === tab);
      });
    }

    function openOverlay(tab) {
      selectTab(tab || 'files');
      overlay.classList.add('open');
    }

    function closeOverlay() {
      overlay.classList.remove('open');
      if (['#skills', '#skill', '#files', '#code', '#structure', '#prompts', '#prompt'].indexOf(location.hash.toLowerCase()) !== -1) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    }

    function renderFile(idx) {
      activeFileIdx = idx;
      var f = info.files[idx];
      if (!f) return;
      codeBox.textContent = f.content;
      codeMeta.textContent = f.path + ' — ' + f.role + ' (' + f.lines + 'L · ' + f.bytes + 'B)';
      codeFileUri.href = f.fileUri;
      codeRawUrl.href = './source/' + f.path;
      var btns = fileListEl.querySelectorAll('.gt-item');
      for (var j = 0; j < btns.length; j++) {
        btns[j].classList.toggle('active', j === idx);
      }
    }

    function renderSkill(idx) {
      activeSkillIdx = idx;
      var s = info.skills[idx];
      if (!s) return;
      skillBox.textContent = '# CLI FOR THIS COMPONENT:\\n# ' + s.cliCommand + '\\n\\n' + s.content;
      skillMeta.textContent = 'skills/' + s.id + '/SKILL.md — ' + s.role + ' (' + s.lines + 'L)';
      skillFileUri.href = s.fileUri;
      skillRawUrl.href = s.relSkillUrl;
      var btns = skillListEl.querySelectorAll('.gt-item');
      for (var j = 0; j < btns.length; j++) {
        btns[j].classList.toggle('active', j === idx);
      }
    }

    function renderPrompt(idx) {
      activePromptIdx = idx;
      var p = (info.prompts || [])[idx];
      if (!p) return;
      promptBox.textContent = p.content;
      promptMeta.textContent = p.name + ' — ' + p.role + ' (' + p.lines + 'L)';
      promptFileUri.href = p.fileUri;
      promptRawUrl.href = p.rawUrl;
      var btns = promptListEl.querySelectorAll('.gt-item');
      for (var j = 0; j < btns.length; j++) {
        btns[j].classList.toggle('active', j === idx);
      }
    }

    info.files.forEach(function(f, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gt-item' + (idx === activeFileIdx ? ' active' : '');
      btn.innerHTML = '<span>' + f.path + '</span><span style="opacity:0.55;font-size:10px;">' + f.lines + 'L</span>';
      btn.addEventListener('click', function() { renderFile(idx); });
      fileListEl.appendChild(btn);
    });

    info.skills.forEach(function(s, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gt-item' + (idx === activeSkillIdx ? ' active' : '');
      btn.innerHTML = '<span>' + s.name + '</span><span style="opacity:0.55;font-size:10px;">SKILL.md</span>';
      btn.addEventListener('click', function() { renderSkill(idx); });
      skillListEl.appendChild(btn);
    });

    (info.prompts || []).forEach(function(p, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gt-item' + (idx === activePromptIdx ? ' active' : '');
      btn.innerHTML = '<span>' + p.name + '</span><span style="opacity:0.55;font-size:10px;">' + p.lines + 'L</span>';
      btn.addEventListener('click', function() { renderPrompt(idx); });
      promptListEl.appendChild(btn);
    });

    renderFile(activeFileIdx);
    if (info.skills.length > 0) renderSkill(0);
    if (info.prompts && info.prompts.length > 0) renderPrompt(0);

    shadow.getElementById('gt-btn-skills').addEventListener('click', function() { openOverlay('skills'); });
    shadow.getElementById('gt-btn-files').addEventListener('click', function() { openOverlay('files'); });
    shadow.getElementById('gt-btn-prompts').addEventListener('click', function() { openOverlay('prompts'); });

    ['skills', 'files', 'prompts'].forEach(function(t) {
      shadow.getElementById('gt-tab-' + t).addEventListener('click', function() { selectTab(t); });
    });

    shadow.getElementById('gt-close-btn').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeOverlay();
    });
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
    });

    shadow.getElementById('gt-copy-code-btn').addEventListener('click', function() {
      var f = info.files[activeFileIdx];
      if (f && navigator.clipboard) navigator.clipboard.writeText(f.content);
    });
    shadow.getElementById('gt-dl-file-btn').addEventListener('click', function() {
      var f = info.files[activeFileIdx];
      if (f) downloadText(f.path.replace(/\\//g, '_'), f.content);
    });
    shadow.getElementById('gt-copy-skill-btn').addEventListener('click', function() {
      var s = info.skills[activeSkillIdx];
      if (s && navigator.clipboard) navigator.clipboard.writeText(s.content);
    });
    shadow.getElementById('gt-copy-skill-cli-btn').addEventListener('click', function() {
      var s = info.skills[activeSkillIdx];
      if (s && navigator.clipboard) navigator.clipboard.writeText(s.cliCommand);
    });
    shadow.getElementById('gt-dl-one-skill-btn').addEventListener('click', function() {
      var s = info.skills[activeSkillIdx];
      if (s) downloadText(s.id + '-SKILL.md', s.content);
    });
    shadow.getElementById('gt-dl-bundle-skill-btn').addEventListener('click', function() {
      downloadText(info.slug + '-skills.md', buildAllSkillsBundle());
    });
    shadow.getElementById('gt-dl-all-skills-btn').addEventListener('click', function() {
      downloadText(info.slug + '-skills.md', buildAllSkillsBundle());
    });
    shadow.getElementById('gt-copy-prompt-btn').addEventListener('click', function() {
      var p = (info.prompts || [])[activePromptIdx];
      if (p && navigator.clipboard) navigator.clipboard.writeText(p.content);
    });
    shadow.getElementById('gt-dl-one-prompt-btn').addEventListener('click', function() {
      var p = (info.prompts || [])[activePromptIdx];
      if (p) downloadText(info.slug + '-' + p.id + '.md', p.content);
    });
    shadow.getElementById('gt-dl-bundle-prompt-btn').addEventListener('click', function() {
      downloadText(info.slug + '-prompts.md', buildAllPromptsBundle());
    });
    shadow.getElementById('gt-dl-all-prompts-btn').addEventListener('click', function() {
      downloadText(info.slug + '-prompts.md', buildAllPromptsBundle());
    });
    shadow.getElementById('gt-copy-tree-btn').addEventListener('click', function() {
      if (navigator.clipboard) navigator.clipboard.writeText(info.asciiTree);
    });

    function checkUrlTrigger() {
      var h = location.hash.toLowerCase();
      var q = location.search.toLowerCase();
      if (h === '#skills' || h === '#skill' || q.indexOf('skill=1') !== -1 || q.indexOf('tab=skills') !== -1) {
        openOverlay('skills');
      } else if (h === '#files' || h === '#code' || h === '#structure' || q.indexOf('code=1') !== -1 || q.indexOf('files=1') !== -1 || q.indexOf('tab=files') !== -1) {
        openOverlay('files');
      } else if (h === '#prompts' || h === '#prompt' || q.indexOf('prompt=1') !== -1 || q.indexOf('tab=prompts') !== -1) {
        openOverlay('prompts');
      }
    }
    checkUrlTrigger();
    window.addEventListener('hashchange', checkUrlTrigger);
  } catch (e) {
    console.error('Golden Template Inspector init failed:', e);
  }
})();
</script>
`;
}

function syncStaticDirsToTargets() {
  const publicAssetsDir = path.join(MOODBOARD_ROOT, 'public', 'assets');
  const distAssetsDir = path.join(MOODBOARD_ROOT, 'dist', 'assets');
  if (fs.existsSync(publicAssetsDir)) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
    fs.cpSync(publicAssetsDir, distAssetsDir, { recursive: true });
  }

  const screenshotsDir = path.join(MOODBOARD_ROOT, 'screenshots');
  if (fs.existsSync(screenshotsDir)) {
    for (const target of [
      path.join(MOODBOARD_ROOT, 'public', 'screenshots'),
      path.join(MOODBOARD_ROOT, 'dist', 'screenshots'),
    ]) {
      fs.mkdirSync(target, { recursive: true });
      fs.cpSync(screenshotsDir, target, { recursive: true });
    }
  }
}

function syncSkillsToTargets(skills) {
  for (const s of skills) {
    for (const rootDir of [
      path.join(MOODBOARD_ROOT, 'public', 'skills', s.id),
      path.join(MOODBOARD_ROOT, 'dist', 'skills', s.id),
    ]) {
      fs.mkdirSync(rootDir, { recursive: true });
      fs.writeFileSync(path.join(rootDir, 'SKILL.md'), s.content, 'utf8');
    }
  }
  const skillsJsonPath = path.join(MOODBOARD_ROOT, 'src', 'golden-skills.json');
  fs.writeFileSync(skillsJsonPath, JSON.stringify(skills, null, 2), 'utf8');
  console.log(`✓ Wrote workspace skills manifest (${skills.length} skills) to ${skillsJsonPath}`);
}

async function main() {
  if (!process.argv.includes('--skip-lint')) {
    console.log('=== Step 1: Running Golden Template Linter across all projects ===');
    execFileSync(NODE_BIN, [LINTER_SCRIPT, '--fix'], {
      cwd: MOODBOARD_ROOT,
      stdio: 'inherit',
    });
  }

  const skills = collectWorkspaceSkills();
  syncSkillsToTargets(skills);

  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const onlySet = onlyArg ? new Set(onlyArg.slice('--only='.length).split(',')) : null;

  const slugs = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && (!onlySet || onlySet.has(d.name)))
    .map((d) => d.name)
    .sort();

  console.log(`\n=== Step 2: Building ${slugs.length} Golden Template projects (4x parallel) ===`);
  fs.mkdirSync(DIST_PROJECTS_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_PROJECTS_DIR, { recursive: true });

  const slugMetadataMap = {};
  const concurrency = 4;
  let cursor = 0;

  async function worker() {
    while (cursor < slugs.length) {
      const idx = cursor++;
      const slug = slugs[idx];
      const projectDir = path.join(PROJECTS_DIR, slug);
      console.log(`→ [${idx + 1}/${slugs.length}] Building ${slug}...`);
      await execFileAsync(NODE_BIN, [VITE_BIN, 'build'], {
        cwd: projectDir,
        maxBuffer: 10 * 1024 * 1024,
      });

      const builtHtmlPath = path.join(projectDir, 'dist', 'index.html');
      if (!fs.existsSync(builtHtmlPath)) {
        throw new Error(`Expected single-file output missing: ${builtHtmlPath}`);
      }

      const files = collectProjectFiles(projectDir);
      const prompts = collectProjectPrompts(slug);
      const rawHtml = fs.readFileSync(builtHtmlPath, 'utf8');
      const inspectorHtml = createInspectorSnippet(slug, projectDir, files, skills, prompts);
      const finalHtml = rawHtml.includes('</body>')
        ? rawHtml.replace('</body>', () => `${inspectorHtml}\n</body>`)
        : `${rawHtml}\n${inspectorHtml}`;

      for (const targetRoot of [DIST_PROJECTS_DIR, PUBLIC_PROJECTS_DIR]) {
        const outDir = path.join(targetRoot, slug);
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, 'index.html'), finalHtml, 'utf8');

        for (const f of files) {
          const rawOutPath = path.join(outDir, 'source', f.path);
          fs.mkdirSync(path.dirname(rawOutPath), { recursive: true });
          fs.writeFileSync(rawOutPath, f.content, 'utf8');
        }

        for (const p of prompts) {
          const promptOutPath = path.join(outDir, 'prompts', `${p.id}.md`);
          fs.mkdirSync(path.dirname(promptOutPath), { recursive: true });
          fs.writeFileSync(promptOutPath, p.content, 'utf8');
        }
      }

      fs.writeFileSync(builtHtmlPath, finalHtml, 'utf8');

      slugMetadataMap[slug] = {
        slug,
        screenshotUrl: `./screenshots/${slug}.png`,
        standaloneUrl: `./projects/${slug}/index.html`,
        standaloneSkillsUrl: `./projects/${slug}/index.html#skills`,
        standaloneFilesUrl: `./projects/${slug}/index.html#files`,
        standalonePromptsUrl: `./projects/${slug}/index.html#prompts`,
        standaloneCodeUrl: `./projects/${slug}/index.html#files`,
        standaloneSkillUrl: `./projects/${slug}/index.html#skills`,
        standaloneStructureUrl: `./projects/${slug}/index.html#files`,
        localDir: projectDir,
        localDirUri: `file://${projectDir}`,
        asciiTree: buildAsciiTree(slug, files),
        files: files.map((f) => ({
          path: f.path,
          role: f.role,
          localPath: f.localPath,
          fileUri: f.fileUri,
          rawUrl: `./projects/${slug}/source/${f.path}`,
          lines: f.lines,
          bytes: f.bytes,
          content: f.content,
        })),
        prompts: prompts.map((p) => ({
          id: p.id,
          name: p.name,
          role: p.role,
          localPath: p.localPath,
          fileUri: p.fileUri,
          rawUrl: `./projects/${slug}/prompts/${p.id}.md`,
          lines: p.lines,
          bytes: p.bytes,
          content: p.content,
        })),
      };
      console.log(`✓ [${idx + 1}/${slugs.length}] Built ${slug}`);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  syncStaticDirsToTargets();

  const outJsonPath = path.join(MOODBOARD_ROOT, 'src', 'golden-projects.json');
  let goldenRegistry = {};
  if (onlySet && fs.existsSync(outJsonPath)) {
    try {
      goldenRegistry = JSON.parse(fs.readFileSync(outJsonPath, 'utf8'));
    } catch {
      goldenRegistry = {};
    }
  }
  for (const [refId, slug] of Object.entries(REF_TO_SLUG)) {
    if (slugMetadataMap[slug]) {
      goldenRegistry[refId] = slugMetadataMap[slug];
    }
  }

  fs.writeFileSync(outJsonPath, JSON.stringify(goldenRegistry, null, 2), 'utf8');
  console.log(`\n✓ Wrote Golden Template manifest to ${outJsonPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
