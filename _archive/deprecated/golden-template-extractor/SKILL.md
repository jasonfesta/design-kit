---
name: golden-template-extractor
description: >-
  Extract, polish, lint, and package React components, landing pages, mobile screens,
  and chat UIs from moodboards or multi-component repositories into standalone
  Google Golden Template React + Vite + Tailwind v4 deliverables (modeled verbatim
  after the canonical `dating` template at `./golden-template/dating`).
  Use when porting moodboard studies or UI components into isolated Golden Template
  folders, running optical padding and design polish, linting for canonical `dating`
  code notations and normalized nomenclature, or building standalone single-file React
  packages for delivery.
---

# Golden Template Extractor (`golden-template-extractor`)

This skill is the complete architectural blueprint and extraction runbook for turning React components, website landing pages, mobile app UIs, and chat UIs into standalone **Google Golden Template** deliverables modeled verbatim after the canonical [`dating`](./golden-template/dating) reference project (`Nocturne — Curated Modern Dating`).

> [!TIP]
> **Related Skills**: When synthesizing directly from a **high-resolution UI screenshot, mockup image, or Figma frame** with the closed-loop visual evaluation harness (`s_total >= 0.85`), use [`image-to-react`](../image-to-react/SKILL.md). For dual-mode **Image-to-React** and **Website-to-React** extraction pipelines, also see [`react-extractor`](../react-extractor/SKILL.md).

---

## 1. Canonical File & Folder Structure (`dating` Blueprint)

Every extracted component or landing page lives in its own isolated directory (`<moodboard>/projects/<project-slug>/`) with the **exact same 4 root files and 4 `src/` entry/subdirectories (`components/`, `data/`, `utils/`)** as [`golden-template/dating`](./golden-template/dating):

```text
<project-slug>/
├── index.html                           # Lowercase <!doctype html>, meta description, Google Fonts, #root
├── package.json                         # Verbatim from dating ("name": "<project-slug>", react 19.2.3, vite 7.2.4, @tailwindcss/vite 4.1.17, vite-plugin-singlefile 2.3.0)
├── tsconfig.json                        # Verbatim from dating (strict: true, noUnusedLocals: true, noUnusedParameters: true)
├── vite.config.ts                       # Verbatim from dating (base: './', react(), tailwindcss(), viteSingleFile(), '@' alias)
└── src/
    ├── App.tsx                          # Named `export function App()` root orchestrator (tabs, modals, drawers, toasts)
    ├── index.css                        # `@import "tailwindcss";`, @layer base, .font-serif-display, .font-grotesk, .font-mono-tech
    ├── main.tsx                         # Verbatim from dating: StrictMode + createRoot(document.getElementById('root')!)
    ├── components/                      # 3 to 6 modular React.FC<*Props> components:
    │   ├── <Brand>BrandLogo.tsx         # Required bespoke SVG brand mark (`aria-hidden="true"`, JSDoc header)
    │   ├── <PrimaryCardOrStage>.tsx     # Primary interactive stage / card / hero
    │   ├── <DetailSheetOrDrawer>.tsx    # Expandable detail sheet / modal / drawer
    │   ├── <FilterModalOrControls>.tsx  # Interactive filter / preferences modal
    │   └── <BelowFoldOrSubwidget>.tsx   # Below-the-fold sections (websites) or interactive sub-widget
    ├── data/
    │   └── <domain>Data.ts              # Typed interfaces, /** ... */ JSDoc, UPPER_SNAKE_CASE seed arrays, filter helpers
    └── utils/
        └── cn.ts                        # Verbatim from dating: clsx + twMerge class name combiner
```

---

## 2. Mandatory Nomenclature & Packaging Rules

1. **Four Allowed Functional Category Prefixes Only**:
   - `<NN>-website-<descriptor>` → `<title>Website Landing Page — <Descriptor Title></title>`
   - `<NN>-ui-<descriptor>` → `<title>UI Component — <Descriptor Title></title>`
   - `<NN>-mobile-app-<descriptor>` → `<title>Mobile App UI — <Descriptor Title></title>`
   - `<NN>-chat-ui-<descriptor>` → `<title>Chat UI — <Descriptor Title></title>`
2. **No Standalone 3D Objects or Static Textures in `projects/`**:
   - Standalone 3D WebGL material objects and static painting/texture tiles remain on the moodboard canvas only and are never packaged in `projects/`.
3. **Vendor-Neutral Naming**:
   - Never use `Jetski`, `ChatGPT`, `Argon`, `gemini-4-argon`, or `REF-0xx` in folder slugs, file names, component names, or UI text.
   - Use `ChatUIBrandLogo.tsx` and neutral model labels (`Assistant Default`, `Assistant Pro`, `Assistant Fast`).
4. **Unversioned HTML Entry Points Only**:
   - Use `index.html` (and `dist/index.html`) for projects and `main.html` (and `dist/main.html`) for moodboards. Never create versioned files like `index-7.html`.

---

## 3. Verbatim Configuration & Bootstrap Files (`dating` Reference)

The root configuration and bootstrap files (`package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/utils/cn.ts`) must match [`./golden-template/dating`](./golden-template/dating) byte-for-byte (enforced automatically by `lint-golden-template.mjs --fix`).

### 3.1 `package.json` (Verbatim Byte-for-Byte)

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

### 3.2 `tsconfig.json`

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

### 3.3 `vite.config.ts`

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

### 3.4 `src/main.tsx` & `src/utils/cn.ts`

```tsx
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
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 4. TypeScript & React Code Structure (`dating` Signatures)

1. **`src/data/<domain>Data.ts`**:
   - Explicit `export interface ...` and `export type ...` declarations
   - `/** ... */` JSDoc comments on interfaces and seed datasets
   - `export const UPPER_SNAKE_CASE` seed arrays (`INITIAL_PROFILES`, `INITIAL_MATCHES`, `DEFAULT_PREFERENCES`, etc.)
2. **`src/components/<Brand>BrandLogo.tsx`**:
   - `interface <Brand>BrandLogoProps { size?: number; className?: string; }`
   - `/** ... */` JSDoc header comment
   - `export const <Brand>BrandLogo: React.FC<<Brand>BrandLogoProps>` rendering an `<svg ... aria-hidden="true">`
3. **`src/components/*.tsx`**:
   - 3 to 6 modular subcomponents per project
   - Every file `<Name>.tsx` declares `interface <Name>Props` and `export const <Name>: React.FC<<Name>Props> = ...`
4. **`src/App.tsx`**:
   - Named function export `export function App()`
   - Imports icons from `'lucide-react'`, domain data from `'./data/*Data'`, and modular components from `'./components/*'`

---

## 5. Linter, Builder & Bundle Verification Commands

```bash
# 1. Lint & auto-fix all projects in a moodboard against golden-template/dating
node \
  ./golden-template/scripts/lint-golden-template.mjs \
  --dir=./<moodboard> --fix

# 2. Build all standalone single-file React bundles and moodboard manifests
node \
  ./<moodboard>/scripts/build-all-projects.mjs

# 3. Verify compiled HTML bundles
node \
  ./<moodboard>/scripts/verify-html-bundle.mjs \
  ./<moodboard>/main.html \
  ./<moodboard>/dist/projects/*/index.html
```
