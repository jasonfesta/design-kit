# Responsive Dual-Authority Rules (`responsive-dual-eval`)

This reference codifies the responsive engineering, viewport scaling, and Golden Template rules enforced by [`scripts/eval-responsive-pair.mjs`](../scripts/eval-responsive-pair.mjs).

---

## 1. Understanding Dual Reference Viewport Math (`desktop.png` + `mobile.png`)

Across WDA and multi-device design collections, paired references fall into two raster geometries:

1. **Opening + First-Scroll Pairs** (e.g., `mellore`, `rill-and-rye`, `terreno`, `virel`):
   - **Desktop (`desktop.png`)**: `1536 × 1024` (`1:1` CSS pixels at `1536px` viewport width).
   - **Mobile (`mobile.png`)**: `809–864 × 1821–1942` (`@2x` Retina capture of a `405px`–`432px` CSS phone viewport, ~`910px`–`971px` CSS scroll height).
2. **Full-Homepage Pairs** (e.g., `oriel`, `room-and-ritual`, `serein`, `sundrop`, `vellune`):
   - **Desktop (`desktop.png`)**: `806–819 × 1920–1951` (downsampled full-page proof representing a `1440px`-wide CSS desktop layout whose expected CSS scroll height is `round(ref_h * (1440 / ref_w))` ≈ `3,376px`–`3,485px`).
   - **Mobile (`mobile.png`)**: `809–828 × 6647–7768` (`@2x` Retina capture of a `405px`–`414px` CSS phone viewport whose expected CSS scroll height is `round(ref_h / 2)` ≈ `3,324px`–`3,884px`).

Because `eval-responsive-pair.mjs` scales only horizontally (`-resize <ref_w>x`) and **never** stretches or squashes vertically:
- Every `px` of vertical padding, margin, image aspect ratio, or line-height error accumulates down the page.
- Check `dimensions.css_expected_height` vs. `dimensions.css_scroll_height` in `dual_eval_report.json` on **both** `desktop` and `mobile` after every build!

---

## 2. True Fluid Responsiveness (Zero Duplicate Trees)

1. **One Shared Semantic DOM**:
   - Render `<header>`, `<main>`, every `<section>`, and `<footer>` **once** from a single shared TypeScript data model (`src/data/<brand>Data.ts`).
   - Never branch page content on `window.innerWidth`, and never create `<div className="hidden md:block">...</div><div className="md:hidden">...</div>` duplicate page wrappers.
   - `eval-responsive-pair.mjs` audits `#root h1, #root h2` visibility ratios on both desktop and mobile (`anti_bifurcation.passed`) and fails any build where `< 65%` of structural headings are visible at either breakpoint.
2. **Fluid Spacing, Typography & Breakpoint Choreography**:
   - **Gutters**: `px-5` (`20px`) at `320px`, `sm:px-6` (`24px`) on phone (`375px`–`639px`), and proportional `md:px-10 lg:px-[6%]` on tablet/desktop.
   - **Fluid Type**: Use `clamp(min, preferred-vw, max)` (e.g., `text-[clamp(2rem,4.4vw,3.75rem)]`) so `320px`, `375px`, `410px`, `768px`, `1024px`, and `1440px` never wrap awkwardly or overflow horizontally.
   - **Art-Directed Crops**: Use `<picture><source media="(min-width: 768px)" srcSet={desktopPlate} /><img src={mobilePlate} alt="..." className="w-full h-full object-cover" /></picture>` when `mobile.png` uses a portrait crop of a landscape desktop scene.
   - **Tablet Safety (`768px` & `1024px`)**: Avoid negative editorial offsets (`lg:-mt-16`) below `1024px`, and allow dense 3- or 4-column desktop rows to step through `sm:grid-cols-2 lg:grid-cols-3` so `768px` never clips text or collides buttons.
3. **Touch Targets, Hover Gating & Accessibility**:
   - Interactive mobile buttons, menu triggers, and disclosure rows must target `min-h-[44px]` with visible `:focus-visible` outlines.
   - Gate pointer hover styles behind `@media (hover: hover) and (pointer: fine)` (or Tailwind `hover:` where non-essential) — never hide product names, prices, or primary CTAs behind hover.
   - Mobile hamburger menus must open an accessible `role="dialog"` `aria-modal="true"` drawer/sheet with `Escape` key dismissal and focus restoration.
   - FAQ / Care disclosures should use native `<details>` / `<summary>` elements so opening a row expands height naturally without layout collision.

---

## 3. Golden Template Linter Checklist (`lint-golden-template.mjs`)

Every build automatically runs `lint-golden-template.mjs --fix` first. Ensure:
- `index.html`: Lowercase `<!doctype html>`, `<meta name="description" ... />`, `<title>Website Landing Page — ...</title>`, non-blocking Google Fonts link (`media="print" onload="this.media='all'"` so offline sandbox rendering never stalls!), `<div id="root"></div>`, and `<script type="module" src="/src/main.tsx"></script>`.
- `src/` contains **only**: `App.tsx`, `index.css`, `main.tsx`, `components/`, `data/`, `utils/`.
- `src/index.css`: Starts with `@import "tailwindcss";`, contains `@layer base`, and defines `.font-serif-display`, `.font-grotesk`, and `.font-mono-tech`.
- `src/App.tsx`: Declares `export function App()`, imports at least one icon from `lucide-react`, imports from `./data/<brand>Data`, and imports from `./components/*`.
- `src/data/<brand>Data.ts`: Includes `/** ... */` JSDoc comments, `export interface ...`, and `export const UPPER_SNAKE_CASE = ...`.
- `src/components/*.tsx`: At least **3** `.tsx` files, including `<Brand>BrandLogo.tsx` (with `/** ... */` JSDoc and `<svg ... aria-hidden="true">`), and **every** `<ComponentName>.tsx` declares `interface <ComponentName>Props` and `export const <ComponentName>: React.FC<<ComponentName>Props>`.
- Zero forbidden strings (`Jetski`, `ChatGPT`, `Argon`, `gemini-4-argon`, `REF-0xx`, `index-7.html`).
