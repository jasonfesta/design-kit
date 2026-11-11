---
name: responsive-dual-eval
description: Evaluates a single unified responsive Golden Template React website back-and-forth against BOTH its Desktop (desktop.png) and Mobile (mobile.png) reference images plus a 6-viewport fluid responsive continuum sweep (320px, 375px, mobile @2x CSS width, 768px, 1024px, desktop CSS width). Renders full-document WebKit2GTK snapshots without vertical squashing, outputs side-by-side comparison slices, pixel/edge/chroma similarity (s_total), section height delta, padding/margin error heatmaps, button optical padding audits, CSS grid equality checks, and anti-bifurcation DOM checks (blocking duplicate hidden-desktop/hidden-mobile page trees). Use whenever building, tuning, or verifying a responsive React page from paired desktop and mobile mockups.
---

# Responsive Dual-Breakpoint & Continuum Evaluator (`responsive-dual-eval`)

Use this skill whenever translating **paired Desktop + Mobile design mockups** (`desktop.png` + `mobile.png`) into **one unified, genuinely responsive Golden Template React 19 + Vite 7 + Tailwind v4 application** (`index.html`).

Unlike single-viewport evaluators that either test only one width or squash vertical heights to match a reference canvas, `responsive-dual-eval` enforces **true responsive craftsmanship** across three simultaneous axes:

1. **Dual Visual & Spacing Fidelity (`desktop.png` + `mobile.png`)**:
   - Renders `dist/index.html` in headless `WebKit2GTK` (`FULL_DOCUMENT`) at both the Desktop CSS width (`1440px` or `1536px`) and the Mobile `@2x`-adjusted CSS width (`round(mobile_ref_w / 2)`, typically `390px`–`432px`).
   - Uniformly scales width (`-resize <ref_w>x`, **zero vertical squashing**) so any padding, chapter pause, font-size, or aspect-ratio drift shows up immediately in `height_delta_pct` and `side_by_side_slice_*.png`.
2. **6-Viewport Fluid Responsive Continuum (`320px` → `1536px`)**:
   - Probes the live DOM at **`320px`, `375px`, `mobile_css_w`, `768px`, `1024px`, and `desktop_css_w`**.
   - Requires `0` horizontal overflow, `0` leaf text/button collisions, `0` clipped text, `0` asymmetric CTA button padding, and `0` uneven equal-column CSS grids at **every** tested width.
3. **Single Unified Responsive DOM Gate (Anti-Bifurcation)**:
   - Verifies that `h1`/`h2` headings inside `<main>` remain mounted and visible across both desktop and mobile viewports (`visible_ratio >= 0.65`), automatically failing implementations that cheat by duplicating the page into separate `hidden md:block` and `md:hidden` trees or branching content on `window.innerWidth`.

---

## 1. Pre-Build Research First (Before Reaching for Browser / Web Search)

Before writing code or searching the web:
1. **Read all local extracted research in `<brand>/references/research/` first** — especially `GITHUB_RESEARCH_INDEX.md`, `cleanup-sheet-prompt.md`, `homepage-study-desktop-spec.md`, `homepage-study-mobile-spec.md`, `warm-moodboard-hero-reference.md`, and `shared/react-mobile-contract.md`. These files contain canonical product names, prices, dimensions (`30 × 22 × 10 cm`, `200 ml · 8% ALC/VOL`, etc.), copy fixes, font pairings, and pre-cleaned Retina plates (`assets/*-clean-hero-plate.png`).
2. **Inspect both `references/desktop.png` and `references/mobile.png`** directly with `read_file` to map how every section, headline, image crop, and CTA reflows between mobile (`< 768px`) and desktop (`>= 768px`).
3. Reach out to `search_web` only if supplementary category interaction context is still needed after reading `references/research/`.

---

## 2. Photographic Asset Extraction (`crop-and-clean-plate.py`)

Never fabricate substitute photography or leave ghosted raster UI text underneath live HTML text:
- If `<brand>/references/research/assets/` provides a pre-cleaned Retina hero plate (e.g., `oriel-clean-hero-plate.png`, `sundrop-clean-hero-plate.png`), inspect it and use it where it matches `desktop.png`.
- For all other photographs in `desktop.png` and `mobile.png`, extract clean bit-for-bit crops (and optionally erase overlaid baked text boxes via harmonic Laplace boundary inpainting) using [`scripts/crop-and-clean-plate.py`](./scripts/crop-and-clean-plate.py):

```bash
python3 ./skills/responsive-dual-eval/scripts/crop-and-clean-plate.py \
  --src=./wda/<brand>/references/desktop.png \
  --crop=0,0,1536,860 \
  --erase=48,28,260,64 \
  --quality=88 \
  --out=/tmp/<brand>_hero_desktop.jpg
```

- When desktop and mobile use distinct art-directed crops of a hero or editorial scene (e.g., wide `16:10` landscape on desktop vs. `3:4` portrait on mobile), use responsive `<picture><source media="(min-width: 768px)" srcSet={...} /><img src={...} className="w-full h-full object-cover object-..." /></picture>` inside the **same semantic `<section>`**!

---

## 3. Running the Iterative Back-and-Forth Evaluation Loop

Run [`scripts/eval-responsive-pair.mjs`](./scripts/eval-responsive-pair.mjs) inside the standard sandbox (`BypassSandbox: false`):

```bash
# WDA Brand shortcut (reads wda/<brand>/references/manifest.json automatically):
node \
  ./skills/responsive-dual-eval/scripts/eval-responsive-pair.mjs \
  --brand=<brand-id>

# Or explicit paths for any Golden Template project:
node \
  ./skills/responsive-dual-eval/scripts/eval-responsive-pair.mjs \
  --project-dir=/path/to/projects/01-website-example \
  --desktop-ref=/path/to/references/desktop.png \
  --mobile-ref=/path/to/references/mobile.png \
  --desktop-css-width=1440 \
  --mobile-css-width=410 \
  --out-dir=/tmp/eval-example
```

### Mandatory Back-and-Forth Visual Inspection Cycle

After **every** run of `eval-responsive-pair.mjs`:
1. **Inspect the JSON metrics** (`dual_eval_report.json`):
   - Check `desktop.s_total`, `mobile.s_total`, `desktop.dimensions.height_delta_pct`, `mobile.dimensions.height_delta_pct`, `continuum_320_to_desktop`, and `anti_bifurcation`.
2. **View the generated Side-by-Side Slices with `read_file`**:
   - Read `<outDir>/desktop/side_by_side_slice_1.png` (and `_2.png`..) AND `<outDir>/mobile/side_by_side_slice_1.png` (`_2.png`, `_3.png`..).
   - Compare Panel 1 (`REF`), Panel 2 (`RENDERED`), and Panel 3 (`SPACING & PIXEL DIFF HEATMAP`).
3. **Tune Padding, Spacing & Typography**:
   - Look specifically for vertical cumulative drift: if Section 3 renders `80px` higher or lower than Panel 1 (`REF`), adjust the preceding chapter's `py-*`, image `aspect-[w/h]`, or heading `leading-*` at the affected breakpoint (`py-14 md:py-36`).
   - Check horizontal gutters (`px-5 sm:px-6 md:px-[6%]`), font weights/tracking, button padding (`px-5 py-3`), and card grid gaps.
4. **Repeat** until `overall_passed: true`:
   - `desktop.s_total >= 0.85` AND `mobile.s_total >= 0.85`
   - `desktop.dimensions.height_delta_pct <= 8.0%` AND `mobile.dimensions.height_delta_pct <= 8.0%`
   - `0` collisions, `0` horizontal overflow, `0` clipped text, `0` button padding violations, and `0` grid equality violations across all 6 continuum viewports (`320px`, `375px`, `mobile`, `768px`, `1024px`, `desktop`)
   - `anti_bifurcation.passed === true` (single unified responsive DOM tree)

---

## 4. Bundled References & Examples

- [`references/responsive_dual_authority_rules.md`](./references/responsive_dual_authority_rules.md) — Complete responsive CSS rules (`@2x` mobile viewport math, `clamp()` typography, `<picture>` art direction, `320px` WCAG Reflow, `44px` touch targets, `@media (hover: hover)`, and Golden Template linter compliance).
- [`examples/wda-dual-breakpoint-loop.md`](./examples/wda-dual-breakpoint-loop.md) — Step-by-step walkthrough of diagnosing and fixing desktop + mobile padding/height drift to reach Checkpoint 1.
