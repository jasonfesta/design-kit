# responsive dual-authority & 6-viewport continuum rules (`responsiveness`)

This reference codifies the responsive layout, viewport math, single-DOM, and designer-handoff rules enforced by [`scripts/eval-responsive-pair.mjs`](../scripts/eval-responsive-pair.mjs).

---

## 1. dual reference viewport math (`desktop.png` + `mobile.png`)

Across paired desktop + mobile design studies, reference plates fall into two common raster geometries:

1. **opening + first-scroll pairs** (e.g., `mellore`, `rill-and-rye`, `terreno`, `virel`):
   - **desktop (`desktop.png`)**: `1536 x 1024` (`1:1` CSS pixels at `1536px` viewport width).
   - **mobile (`mobile.png`)**: `809-864 x 1821-1942` (`@2x` Retina capture of a `405px-432px` CSS phone viewport, ~`910px-971px` CSS scroll height).
2. **full-homepage pairs** (e.g., `oriel`, `room-and-ritual`, `serein`, `sundrop`, `vellune`):
   - **desktop (`desktop.png`)**: `806-819 x 1920-1951` (downsampled full-page proof representing a `1440px`-wide CSS desktop layout whose expected CSS scroll height is `round(ref_h * (1440 / ref_w))` ≈ `3,376px-3,485px`).
   - **mobile (`mobile.png`)**: `809-828 x 6647-7768` (`@2x` Retina capture of a `405px-414px` CSS phone viewport whose expected CSS scroll height is `round(ref_h / 2)` ≈ `3,324px-3,884px`).

Because `eval-responsive-pair.mjs` scales only horizontally (`-resize {ref_w}x`) and **never** stretches or squashes vertically:
- Every pixel of vertical padding, margin, image aspect ratio, or line-height error accumulates down the page.
- Always compare `dimensions.css_expected_height` vs. `dimensions.css_scroll_height` in `dual_eval_report.json` on **both** `desktop` and `mobile` after every turn.

---

## 2. true fluid responsiveness (zero duplicate trees)

1. **one shared semantic dom**:
   - Render `<header>`, `<main>`, every `<section>`, and `<footer>` **once** from a single shared TypeScript data model (`src/data/<brand>Data.ts`).
   - Never branch page content on `window.innerWidth`, and never create `<div className="hidden md:block">...</div><div className="md:hidden">...</div>` duplicate page wrappers.
   - `eval-responsive-pair.mjs` audits `#root h1, #root h2` visibility ratios on both desktop and mobile (`anti_bifurcation.passed`) and fails any build where `< 65%` of structural headings are visible at either breakpoint.
2. **fluid spacing, typography & breakpoint choreography**:
   - **gutters**: `px-5` (`20px`) at `320px`, `sm:px-6` (`24px`) on phone (`375px-639px`), and proportional `md:px-10 lg:px-[6%]` on tablet/desktop.
   - **fluid type**: use `clamp(min, preferred-vw, max)` (e.g., `text-[clamp(2rem,4.4vw,3.75rem)]`) so `320px`, `375px`, `410px`, `768px`, `1024px`, and `1440px` never wrap awkwardly or overflow horizontally.
   - **art-directed crops**: use `<picture><source media="(min-width: 768px)" srcSet={desktopPlate} /><img src={mobilePlate} alt="..." className="w-full h-full object-cover" /></picture>` when `mobile.png` uses a portrait crop of a landscape desktop scene.
   - **tablet safety (`768px` & `1024px`)**: avoid negative editorial offsets (`lg:-mt-16`) below `1024px`, and step dense 3- or 4-column desktop rows through `sm:grid-cols-2 lg:grid-cols-3` so `768px` never clips text or collides buttons.
3. **touch targets, hover gating & accessibility**:
   - Interactive mobile buttons, menu triggers, and disclosure rows must target `min-h-[44px]` with `16px+` form inputs (preventing iOS Safari auto-zoom) and visible `:focus-visible` outlines.
   - Gate pointer hover styles behind `@media (hover: hover) and (pointer: fine)`—never hide product names, prices, or primary CTAs behind hover.
   - Mobile hamburger menus must open an accessible `role="dialog"` `aria-modal="true"` drawer/sheet with `Escape` dismissal and focus restoration.
   - FAQ / care disclosures should use native `<details>` / `<summary>` elements so opening a row expands height naturally without layout collision.

---

## 3. what `jason-design-agent` checks after the dev eval passes

Once `overall_passed === true` on the dev side, `jason-design-agent` reviews the responsive slices against the original inspiration:
- **visual hierarchy continuity**: does the first mobile fold still communicate the same hero mood, brand mark, and primary invitation as the desktop inspiration?
- **editorial rhythm**: are asymmetric desktop splits (`7/5`, `8/4`) translated into purposeful mobile vertical cadence (lead visual -> quiet caption -> headline -> action) rather than monotonous uniform blocks?
- **crop focal points**: `object-position` (`object-center`, `object-[50%_25%]`) keeps faces, hands, architectural lines, and product silhouettes framed cleanly at every width.
