---
name: react-extractor
description: >-
  Extract, synthesize, polish, lint, and package standalone Google Golden Template
  React 19 + Vite 7 + Tailwind v4 applications from either an image (screenshot,
  UI mockup, Figma export, design reference photo) OR an existing website / moodboard
  specimen (live URL, HTML/CSS bundle, multi-component repository). Modeled verbatim
  after the canonical `dating` Golden Template (`./golden-template/dating`).
  Use whenever the user asks to extract a React component, landing page, mobile app UI,
  or chat UI from an image or website, port a moodboard study into `projects/<slug>/`,
  enforce normalized Golden Template nomenclature, or build single-file React deliverables.
---

# React Extractor — Image & Website to Golden Template React (`react-extractor`)

This skill provides the end-to-end engineering runbook, architectural specification, and automated verification pipeline for extracting production-grade **Google Golden Template** React applications from **either a visual image (screenshot, mockup, design capture) or an existing website / moodboard study**.

Every deliverable produced by this skill is modeled **verbatim** after the canonical [`dating`](./golden-template/dating) reference package (`Nocturne — Curated Modern Dating`) and verified by the universal Golden Template linter ([`lint-golden-template.mjs`](./golden-template/scripts/lint-golden-template.mjs)).

---

## Authoritative References & Helper Scripts

### Reference Manuals (Progressive Disclosure)
- **[Image-to-React Extraction Pipeline](./references/image-to-react-pipeline.md)**: Visual grid decomposition, perceptual OKLCH/HEX token extraction, typography pairing, interactive state inference, and below-the-fold 4-section editorial synthesis from static images or screenshots.
- **[Website-to-React Extraction Pipeline](./references/website-to-react-pipeline.md)**: DOM/CSS/state extraction from live URLs or moodboard specimens, refactoring monolithic components into modular `src/data/*Data.ts` + `src/components/*.tsx`, and asset/font inlining.
- **[Nomenclature, Vendor-Neutrality & Optical Polish Rules](./references/nomenclature-and-polish-rules.md)**: Mandatory 2-digit category prefixes (`01-website-*`, `07-ui-*`, `13-mobile-app-*`, `19-chat-ui-*`), forbidden internal strings, optical button padding, and WCAG 2.1 contrast gates.
- **[4K Website Upgrade Protocol — 4 Pillars: Competitor Benchmarks, Visual Match & Micro-Layout Score, 2x Retina Photos & Looping Videos, and Multi-Viewport Responsiveness](../image-to-react/references/four_k_upgrade_and_competitor_benchmarks.md)**: Pre-synthesis Competitor Benchmark URLs (5–10 production sites per category), `2x` Retina `gempix-1` photos + looping Veo (`omni_1p2`) videos, `s_total >= 0.93+` visual & micro-layout evaluation, and 6-viewport responsiveness (`375px` → `1920px+`).
- **[Canonical `dating` Blueprint Checklist](./examples/dating-blueprint-checklist.md)**: Line-by-line verification checklist against [`./golden-template/dating`](./golden-template/dating).

### Executable Scripts
- **High-Res Screenshot Preprocessor & Asset Extractor**: [`scripts/prepare-and-extract-image.py`](./skills/image-to-react/scripts/prepare-and-extract-image.py)
- **Screenshot-to-React Visual Matcher & Micro-Layout Evaluator**: [`scripts/eval-image-to-react.mjs`](./skills/image-to-react/scripts/eval-image-to-react.mjs)
- **Batch DOM & Craft Auditor (`23` Projects)**: [`scripts/audit-all-projects.mjs`](./skills/image-to-react/scripts/audit-all-projects.mjs)
- **Universal Linter & Auto-Fixer**: [`scripts/lint-golden-template.mjs`](./skills/react-extractor/scripts/lint-golden-template.mjs)
- **Parallel Standalone Project Builder & Inspector Injector**: [`scripts/build-all-projects.mjs`](./skills/react-extractor/scripts/build-all-projects.mjs)
- **Single-File HTML Bundle & DOM Mount Verifier**: [`scripts/verify-html-bundle.mjs`](./skills/react-extractor/scripts/verify-html-bundle.mjs)

---

## 1. Dual-Source Extraction Modes

The React Extractor operates in two primary modes depending on the input artifact:

| Mode | Input Source | Core Extraction Strategy | Guide |
| :--- | :--- | :--- | :--- |
| **Mode A: Image-to-React** | Screenshot, PNG/JPG/WebP mockup, Figma frame export, or moodboard reference image | 1. Inspect the 4K grid slices via `read_file` to map layout grid, spatial hierarchy, and surface/ink/accent palette.<br>2. **Mandatory Post-4K-Grid High-Level Interaction Plan (`INTERACTION_PLAN.md`)**: Right after grabbing and viewing the layouts from the 4K grid — and before writing React code — create `websites/<brand>/INTERACTION_PLAN.md` mapping every section across all 5 pages to high-level interactions referenced directly to the **5–10 Competitor Benchmark URLs** ([4K Upgrade & Competitor Benchmarks](../image-to-react/references/four_k_upgrade_and_competitor_benchmarks.md)).<br>3. Extract semantic CSS variables (`--surface`, `--surface-raised`, `--ink`, `--muted`, `--accent`, `--accent-alt`, `--on-accent`, `--border`) with WCAG 2.1 contrast verification.<br>4. Turn every static pill, tab, card, swatch, video transport bar, gallery, or input visible in the 4K layout into live React state in `src/App.tsx` backed by typed seed data in `src/data/<domain>Data.ts` while keeping the `t=0` layout 1:1 locked to the 4K reference slice. | [Image-to-React Guide](./references/image-to-react-pipeline.md) |
| **Mode B: Website-to-React** | Live URL, HTML/CSS bundle, or moodboard specimen (`src/areas/*.tsx`) | 1. Inspect source DOM, computed styles, CSS custom properties, and event handlers.<br>2. Separate domain types, constants, and seed arrays into `src/data/<domain>Data.ts` (`UPPER_SNAKE_CASE` exports + JSDoc).<br>3. Extract a custom SVG `<Brand>BrandLogo.tsx` and 2–5 single-responsibility subcomponents (`React.FC<*Props>`) into `src/components/`.<br>4. Wire top-level state, modals, drawers, and keyboard/scroll handlers in `src/App.tsx` (`export function App()`). | [Website-to-React Guide](./references/website-to-react-pipeline.md) |

---

## 2. Canonical Golden Template File & Folder Structure (`dating` Spec)

Every extracted React deliverable MUST be placed in `<moodboard>/projects/<project-slug>/` and contain the **exact 4 root configuration files and 4 `src/` entry/subdirectories** of the canonical [`dating`](./golden-template/dating) template:

```text
<project-slug>/
├── index.html                           # Lowercase <!doctype html>, meta description, Google Fonts, #root mount
├── package.json                         # Verbatim from dating (only "name": "<project-slug>" changes)
├── tsconfig.json                        # Verbatim from dating (strict: true, noUnusedLocals, noUnusedParameters, @/* alias)
├── vite.config.ts                       # Verbatim from dating (base: './', react(), tailwindcss(), viteSingleFile())
└── src/
    ├── main.tsx                         # Verbatim from dating: StrictMode + createRoot(document.getElementById('root')!)
    ├── index.css                        # @import "tailwindcss"; @layer base tokens, .font-serif-display, .font-grotesk, .font-mono-tech
    ├── App.tsx                          # Named `export function App()` root orchestrator (tabs, modals, drawers, filters)
    ├── components/                      # 3 to 6 modular React.FC<*Props> UI components (.tsx):
    │   ├── <Brand>BrandLogo.tsx         # Required custom SVG brand mark (`aria-hidden="true"`, JSDoc header)
    │   ├── <PrimaryViewOrHero>.tsx      # Primary interactive stage / hero / workspace
    │   ├── <DetailDrawerOrModal>.tsx    # Interactive detail sheet, modal, or drawer
    │   └── <BelowFoldOrSubwidget>.tsx   # Below-the-fold sections (websites) or interactive sub-widget (UI/mobile/chat)
    ├── data/
    │   └── <domain>Data.ts              # All TypeScript interfaces, types, JSDoc, UPPER_SNAKE_CASE seed arrays, pure helpers
    └── utils/
        └── cn.ts                        # Verbatim from dating: clsx + twMerge class name utility
```

> [!IMPORTANT]
> **Only App Components & Website Landing Pages in `projects/`**: Never package standalone 3D WebGL material objects or static texture specimens as Golden Template apps in `projects/`. Keep 3D objects and textures on the moodboard canvas only.

---

## 3. Mandatory Nomenclature & Vendor-Neutrality Rules

All extracted Golden Template projects across all 5 moodboards must obey these naming constraints (enforced automatically by `lint-golden-template.mjs`):

### 3.1 Folder Slug & Category Prefix Convention
Every folder inside `<moodboard>/projects/` must use a sequential 2-digit number (`01`, `02`, ...) and one of four functional category prefixes:

| Category | Folder Slug Pattern | HTML `<title>` & Registry Title Format |
| :--- | :--- | :--- |
| **Website Landing Page** | `<NN>-website-<descriptor>` (e.g., `01-website-leather-goods`) | `Website Landing Page — <Descriptor Title>` |
| **UI Component** | `<NN>-ui-<descriptor>` (e.g., `07-ui-weather-card`) | `UI Component — <Descriptor Title>` |
| **Mobile App UI** | `<NN>-mobile-app-<descriptor>` (e.g., `13-mobile-app-onboarding`) | `Mobile App UI — <Descriptor Title>` |
| **Chat UI** | `<NN>-chat-ui-<descriptor>` (e.g., `19-chat-ui-conversation`) | `Chat UI — <Descriptor Title>` |

### 3.2 Vendor-Neutral Naming (Zero Internal Codenames)
- **Forbidden Strings**: Never include `Jetski`, `ChatGPT`, `Argon`, `gemini-4-argon`, or internal board IDs (`REF-001`..`REF-099`) anywhere in folder slugs, file names, component names, `index.html`, `package.json`, or `src/**/*.{ts,tsx,css}`.
- **Required Replacements**:
  - Brand logos for assistant/chat components must be named `ChatUIBrandLogo.tsx` (`export const ChatUIBrandLogo: React.FC<ChatUIBrandLogoProps>`).
  - Model selector pills in Chat UIs must use neutral labels: `Assistant Default`, `Assistant Pro`, `Assistant Fast`.
- **Unversioned Entry Points (`index.html` & `main.html` Only)**:
  - Never create versioned HTML bundles such as `index-7.html`. Each project's source entry is `index.html`, its built deliverable is `dist/index.html`, and the parent moodboard's built entry is `main.html` (and `dist/main.html`).

---

## 4. Verbatim Root & Bootstrap Files (`dating` Reference)

When scaffolding a new extracted project in `projects/<project-slug>/`, copy directly from [`./golden-template/dating`](./golden-template/dating) or write the exact files below:

### 4.1 `package.json` (Verbatim Byte-for-Byte Match to `golden-template/dating/package.json`)
`lint-golden-template.mjs` enforces byte-for-byte parity with `golden-template/dating/package.json` (`"name": "react-vite-tailwind"`):

```json
{
  "name": "react-vite-tailwind",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "2.1.1",
    "lucide-react": "^1.43.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "tailwind-merge": "3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.17",
    "@types/node": "^22.0.0",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "5.1.1",
    "tailwindcss": "4.1.17",
    "typescript": "5.9.3",
    "vite": "7.2.4",
    "vite-plugin-singlefile": "2.3.0"
  }
}
```

### 4.2 `tsconfig.json` (Verbatim)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": [
      "node"
    ],
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "src",
    "vite.config.ts"
  ]
}
```

### 4.3 `vite.config.ts` (Verbatim)

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

### 4.4 `src/main.tsx` & `src/utils/cn.ts` (Verbatim)

```tsx
// src/main.tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```ts
// src/utils/cn.ts
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 5. Step-by-Step Extraction Workflow

### Step 1: Analyze Input Source (Image or Website)
1. **If extracting from an Image**:
   - Call `read_file` on the image path to inspect its layout proportions, typography hierarchy, surface warmth/depth, interactive affordances, and imagery.
   - Extract an 8-token semantic color palette (`--surface`, `--surface-raised`, `--ink`, `--muted`, `--accent`, `--accent-alt`, `--on-accent`, `--border`) and verify that `--ink` on `--surface` meets WCAG AA (`>= 4.5:1` for body text, `>= 3.0:1` for large display text).
   - Map every visual control in the image (navigation links, filter pills, tabs, cards, modals, sliders, inputs) to an explicit React state variable and interactive handler.
2. **If extracting from a Website or Moodboard Study**:
   - Read the source component/HTML and CSS rules.
   - Identify all shared state, domain objects, and static copy so nothing remains hardcoded inside JSX render blocks.

### Step 2: Scaffold Project & Symlink Shared `node_modules`
```bash
# Copy canonical dating template to the new normalized project slug
cp -R ./golden-template/dating \
  ./<moodboard>/projects/<project-slug>

# Remove template domain files before writing extracted domain files
rm -f ./<moodboard>/projects/<project-slug>/src/data/* \
      ./<moodboard>/projects/<project-slug>/src/components/*
```

### Step 3: Author `src/data/<domain>Data.ts`
- Define explicit `export interface` and `export type` contracts with `/** ... */` JSDoc comments.
- Export `UPPER_SNAKE_CASE` typed seed data arrays (`export const INITIAL_ITEMS: Item[] = [...]`) with realistic, domain-authentic copy, metrics, and image paths.
- Export pure helper/lookup functions (`export function getItemById(...)`).

### Step 4: Author Modular Components in `src/components/`
- **`<Brand>BrandLogo.tsx`**: Required custom SVG brand mark with `interface <Brand>BrandLogoProps { size?: number; className?: string; }`, JSDoc header comment, and `<svg ... aria-hidden="true">`.
- **2 to 5 Feature Subcomponents**: Each component file `<ComponentName>.tsx` must declare `interface <ComponentName>Props` and `export const <ComponentName>: React.FC<<ComponentName>Props> = (...) => { ... }`.
- **Website Landing Pages (`01-website-*`)**: Include a dedicated `<Brand>BelowFoldSections.tsx` component implementing 4 full-bleed interactive below-the-fold sections (Collection/Catalog Grid, Interactive Process/Feature Split, Timeline/Comparison Interactive Panel, and Editorial Footer with interactive selectors) using the exact same CSS custom properties and typography as the hero.

### Step 5: Author `src/App.tsx`, `src/index.css`, and `index.html`
- `src/App.tsx` must export `export function App()` (named export, matching `src/main.tsx`).
- `src/index.css` must start with `@import "tailwindcss";`, declare `@layer base` tokens, and define `.font-serif-display`, `.font-grotesk`, `.font-mono-tech`, and `.tabular-nums`.
- `index.html` must start with lowercase `<!doctype html>`, include a `<meta name="description" ... />`, load Google Fonts (`Instrument Serif`, `Plus Jakarta Sans`, `JetBrains Mono`, plus any theme-specific display font), and title the page with its normalized category prefix (`Website Landing Page — ...`, `UI Component — ...`, `Mobile App UI — ...`, `Chat UI — ...`).

### Step 6: Optical Padding & Craft Polish Gate
Before linting and building, audit every interactive element against these craft rules:
- **Balanced Button & Pill Padding**: Minimum `px-3.5 py-1.5` (`padding: 0.5rem 1.05rem`) on pills/tabs and `px-5 py-2.5` (`padding: 0.7rem 1.35rem`) on primary CTA buttons; `gap-1.5` to `gap-2` between icons and labels.
- **Numeric Discipline**: Apply `tabular-nums` (`font-variant-numeric: tabular-nums`) to all prices, metrics, timestamps, counters, and slider readouts.
- **Tactile Feedback**: Include `:hover`, `:focus-visible`, and `:active` (`active:scale-[0.985]`) states on all interactive controls.
- **Zero Forbidden Tropes**: No neon-purple-on-dark-slate AI clichés, no untracked giant headlines, no icon-stuffed bento walls, and no unstyled browser-default inputs.

---

## 6. Automated Linting, Building & Cloudtop Verification

Always run the 3 verification steps below after extracting or updating any Golden Template project:

```bash
# 1. Lint & auto-fix structure, nomenclature, and strict TypeScript (tsc --noEmit)
node \
  ./golden-template/scripts/lint-golden-template.mjs \
  --dir=./<moodboard> --fix

# 2. Build all standalone Golden Template projects & generate src/golden-projects.json
node \
  ./<moodboard>/scripts/build-all-projects.mjs

# 3. Verify compiled single-file HTML bundles (0 syntax/leak/CORS errors, mounted #root)
node \
  ./<moodboard>/scripts/verify-html-bundle.mjs \
  ./<moodboard>/main.html \
  ./<moodboard>/dist/main.html \
  ./<moodboard>/dist/projects/*/index.html
```

### Serving Locally from Cloudtop (`jfesta.c.googlers.com`)
When previewing a built moodboard or extracted project from a Cloudtop workstation in a laptop browser:
1. Bind Vite preview to `--host 0.0.0.0` with `allowedHosts: true` in `vite.config.ts` (running outside the sandbox so it binds to the Cloudtop's external network interface).
2. Share `http://jfesta.c.googlers.com:<port>/main.html` (rather than `http://127.0.0.1:<port>`, which points to the user's laptop loopback unless SSH port forwarding is active).
