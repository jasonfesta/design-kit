# Canonical `golden-template/dating` Architecture & Standalone Inspector Spec

Every project synthesized by [`skills/image-to-react/`](../SKILL.md) MUST be structured as a first-class Google Golden Template package modeled verbatim after [`/usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating/`](file:///usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating) (`Kismet`) and live inside `<moodboard>/projects/<NN>-<category>-<descriptor>/`.

---

## 1. Folder Slug & Title Nomenclature

Every output directory inside `<moodboard>/projects/` must use a sequential 2-digit prefix (`01`..`99`) and one of the four canonical functional category prefixes:

| Category Prefix | Required Folder Pattern | Required HTML `<title>` & Inspector Header Format |
| :--- | :--- | :--- |
| **`website`** | `<NN>-website-<descriptor>` | `Website Landing Page — <Descriptive Title>` |
| **`ui`** | `<NN>-ui-<descriptor>` | `UI Component — <Descriptive Title>` |
| **`mobile-app`** | `<NN>-mobile-app-<descriptor>` | `Mobile App UI — <Descriptive Title>` |
| **`chat-ui`** | `<NN>-chat-ui-<descriptor>` | `Chat UI — <Descriptive Title>` |

### Strict Hygiene Rules
- **Forbidden Terms**: Never use `Jetski`, `ChatGPT`, `Argon`, `gemini-4-argon`, or `REF-001`..`REF-047` anywhere in directory names, `package.json`, `index.html`, or `src/`.
- **Single Unversioned Entry Point**: Always use `index.html` and `dist/index.html`. Never create `index-2.html` or `index-7.html`.

---

## 2. File-by-File Blueprint (Modeled on `golden-template/dating`)

```text
<NN>-<category>-<descriptor>/
├── index.html                  # Root HTML5 document with Google Fonts & #root mount
├── package.json                # React 19.2.3 + Vite 7.2.4 + Tailwind v4.1.17 + vite-plugin-singlefile 2.3.0
├── tsconfig.json               # Strict bundler TypeScript config with "@/*": ["./src/*"]
├── vite.config.ts              # plugins: [react(), tailwindcss(), viteSingleFile()], base: './'
└── src/
    ├── main.tsx                # StrictMode entry mounting <App /> and importing ./index.css
    ├── index.css               # @import "tailwindcss"; @layer base tokens, font helpers, custom scrollbars
    ├── App.tsx                 # Exported function App() — top-level interactive state, layout shell, modals/drawers
    ├── components/             # Modular, single-responsibility React UI components (.tsx)
    │   ├── <Brand>BrandLogo.tsx# Custom SVG brand mark / header emblem component
    │   └── <Feature>.tsx       # Interactive cards, drawers, modals, filter panels, sub-views
    ├── data/
    │   └── <domain>Data.ts     # All TypeScript interfaces, typed seed data arrays, constants, and pure helpers
    └── utils/
        └── cn.ts               # Canonical clsx + tailwind-merge class name utility
```

### 2.1 `src/utils/cn.ts`
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2.2 `src/data/<domain>Data.ts`
Just like [`golden-template/assets/dating/src/data/datingData.ts`](file:///usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating/src/data/datingData.ts), all TypeScript interfaces (`export interface ...`), union types, filter constants, and rich domain fixtures MUST reside in `src/data/<domain>Data.ts` — never inline inside `App.tsx`.
- Every visible card, metric, table row, badge, and image in the reference screenshot must be represented in `src/data/<domain>Data.ts` with complete, realistic copy (zero `"Lorem ipsum"`, `"Card 1"`, or `"TODO"` placeholders).

### 2.3 `src/components/<Brand>BrandLogo.tsx`
Just like [`golden-template/dating/src/components/KismetBrandLogo.tsx`](file:///usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating/src/components/KismetBrandLogo.tsx), extract the brand mark or header emblem into a clean, reusable SVG React component accepting `size?: number` and `className?: string`.

### 2.4 `src/components/*.tsx`
Decompose distinct UI regions into focused components (e.g., `HeaderBar.tsx`, `FeatureCard.tsx`, `FilterDrawer.tsx`, `DetailModal.tsx`, `ActionToast.tsx`) with explicit props interfaces (`interface FeatureCardProps { ... }`) and `lucide-react` icons.

### 2.5 `src/App.tsx`
Just like [`golden-template/dating/src/App.tsx`](file:///usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating/src/App.tsx):
- Exports `export function App()` (and/or `export default App`).
- Owns top-level interactive `useState` / `useMemo` hooks (active navigation tab, filter state, search/sort query, selected item modal/drawer, interactive form state, toast feedback) while keeping the **initial default render state 100% faithful to the target reference screenshot** so automated visual evaluation matches on initial load.

---

## 3. Standalone Code Inspector & Local Project Packager (`#gt-inspector-host`)

When built via [`scripts/build-all-projects.mjs`](../../golden-template/scripts/build-all-projects.mjs), every Golden Template inside page (`dist/projects/<slug>/index.html`) is compiled into a self-contained single-file React bundle (`vite-plugin-singlefile`) and automatically receives the **Golden Template Code & Local File Inspector** (`#gt-inspector-host`, modeled on the `inspector-dating` experience):

1. **Floating `</> Code & Files` Pill (`bottom: 18px; right: 18px`)**:
   - Displays the project's normalized category and title, interactive **Download Project (.zip)** button (powered by an embedded deterministic CRC32 ZIP generator that packages `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, and all `src/**/*` files on the client), **Copy All Files** button, and a slide-over file tree + source viewer for every file in the Golden Template project.
2. **Zero Interference with Visual Evaluation**:
   - During headless screenshot rendering in [`scripts/eval-image-to-react.mjs`](../scripts/eval-image-to-react.mjs), `#gt-inspector-host` is automatically hidden via CSS injection before capturing `rendered.png` so the floating pill never pollutes the pixel-diff score against `mockup.png`.
