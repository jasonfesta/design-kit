# Warmup Baked-In Sub-Skills & Lineage Credits

Warmup (`warmup`) is a Google-wide **Image-to-React Pre-Bench & Post-Bench Design Comparison and Tear-Apart Evaluation Skill** that synthesizes and bakes in the core methodologies, measurement verifiers, and visual evaluation scripts from the following sub-skills. Every generated `WARMUP-REPORT.md`, `index.html`, and `scores.json` explicitly credits these sub-skills.

---

## 1. `image-to-react` (`moodboards-borg-space`)

- **Author & Origin**: Jason Festa (`/usr/local/google/home/jfesta/skills/image-to-react/SKILL.md`)
- **What Warmup Bakes In**:
  - **Image Preprocessing & Semantic Token Extraction (`scripts/prepare_and_extract.py`)**: Bakes in `prepare-and-extract-image.py` and `ingest-nano-banana.py` to analyze single UI screenshots or 4K Nano Banana multi-layout grid sheets (`5504x3072` 5-page website sheets or `4544x3748` 10-screen mobile sheets), auto-detect panel bounding boxes via 1D valley segmentation, slice `panels/panel_01.png`..`panel_K.png`, and extract 8 semantic CSS variables (`--surface`, `--surface-raised`, `--ink`, `--muted`, `--accent`, `--accent-alt`, `--on-accent`, `--border`).
  - **Closed-Loop WebKit2GTK Visual & DOM Evaluation (`scripts/compare_builds.py`)**: Bakes in the closed-loop headless browser evaluation pattern from `eval-image-to-react` and `eval-multi-screen-project`, including deterministic multi-screen navigation via `?screen=<i>` and `window.__setGoldenEvalScreen(index)`.
  - **Sub-Region Pixel Ruler (`measure_px.py` & `crop_regions.py`)**: Bakes in 3-zone vertical luminance and contrast profiling (`Zone A Top 0-25%`, `Zone B Middle 25-75%`, `Zone C Bottom 75-100%`).

---

## 2. `golden-template` (`moodboards-borg-space`)

- **Author & Origin**: Jason Festa (`/usr/local/google/home/jfesta/skills/golden-template/SKILL.md`)
- **What Warmup Bakes In**:
  - **Canonical `golden-template/dating` (`Nocturne`) Architecture**: Every pre-bench model trial produces a complete, runnable React 19 + TypeScript + Vite 7 + Tailwind v4 + `vite-plugin-singlefile` project (`index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/components/*.tsx`, `src/data/*.ts`, `src/utils/cn.ts`, plus standalone `dist/index.html`).
  - **Golden Template AST & Style Linting (`scripts/eval_warmup.py`)**: Audits named `export function App()`, bespoke `<Brand>BrandLogo.tsx` inline SVG components (`aria-hidden="true"`), 3-tier modular decomposition, font family helpers (`.font-serif-display`, `.font-grotesk`, `.font-mono-tech`), and `tabular-nums` discipline.

---

## 3. `replicate-mock` (`google3` & `moodboards-borg-space`)

- **Author & Origin**: Manasa Babu & Jason Festa (`//depot/google3/experimental/users/manasababu/skills/replicate_mock/SKILL.md` & `/usr/local/google/home/jfesta/skills/replicate-mock/SKILL.md`)
- **What Warmup Bakes In**:
  - **8 Core Pixel-Perfection Directives**:
    1. *Zero Hallucination* (no invented components, buttons, nav links, or decorative chrome).
    2. *Zero Omission* (every layout tile, badge, icon, border, and micro-label translated).
    3. *Exact Visual Match* (spatial proportions, colors, typography, and shadows).
    4. *No Generic Placeholders* (automatic penalty for `Lorem ipsum`, `TODO`, or `placehold.co`).
    5. *Asset Recreation* (crisp high-resolution vector/canvas/raster recreation when needed).
    6. *Bit-for-Bit Asset Extraction* (high-DPI source crops preserved without distortion).
    7. *Perfect Text Reconstruction* (verbatim copy, casing, and numeric formatting).
    8. *Vector-to-Vector Match* (crisp inline `<svg>` icons and emblems).

---

## 4. `screenshot-to-html` & `visual-matcher` (`AutoRaterV1`)

- **Author & Origin**: Google Agentic Design Loop (`//depot/google3/prototypes/projects/agentic_design_loop/skills/screenshot_to_html/SKILL.md` & `visual_matcher/SKILL.md`)
- **What Warmup Bakes In**:
  - **64x64 Cell Loss Map (`scripts/compare_builds.py`)**: Computes `s_block` (luminance structure similarity), `s_edge` (Sobel/gradient edge similarity), `s_chroma` (RGB color similarity), `s_dom` (DOM geometry & optical padding compliance), and composite `s_total`.
  - **Visual Diff Artifacts**: Generates `rendered_overlay.png` (50/50 semi-transparent blend of target image and rendered React build), `diff_mask.png` (per-cell red/amber/green error heatmap), and localized DOM `container_deviations`.

---

## 5. `sds-measurement-verifier`

- **Author & Origin**: Google Search DevAI SDS (`//depot/google3/search/devai/agentic/labs/skills/sds/sds_measurement_verifier/SKILL.md`)
- **What Warmup Bakes In**:
  - **Universal Interactive Element & Button Padding Rule**: Measures every rendered `<button>`, `[role="tab"]`, and badge pill via `getBoundingClientRect()` and `getComputedStyle()` to verify horizontal padding symmetry (`|padLeft - padRight| <= 3px`), minimum horizontal clearance (`>= 10-12px`), and zero text-to-border crowding.
  - **Horizontal Multi-Tile Grid Equality**: Verifies that sibling cards sharing a multi-column row have matching heights and bottom baselines within `<= 2px`.

---

## 6. `html-to-search-vibes` & `screenshot-to-search-vibes`

- **Author & Origin**: Google Cruxy (`//depot/google3/prototypes/projects/cruxy/skills/html_to_search_vibes/SKILL.md` & `screenshot_to_search_vibes/SKILL.md`)
- **What Warmup Bakes In**:
  - **Full-Canvas 3-Zone Scan Protocol**: Evaluates every build separately across **Zone A (Top `0-25%`)**, **Zone B (Middle `25-75%`)**, and **Zone C (Bottom `75-100%`)** so bottom-of-canvas drift is caught and scored.
  - **Equal-Height Card Row Architecture**: Checks for `items-stretch` on grid containers, `h-full flex flex-col justify-between` on cards, and `mt-auto` on card footers.

---

## 7. `web-design-check` & `web-design-review` (`go/fofr-agent-skills`)

- **Author & Origin**: `fofr` (`https://fofr.users.x20web.corp.google.com/skills/index.html` / `/google/data/ro/users/fo/fofr/www/skills/`)
- **What Warmup Bakes In**:
  - **7 Generic Glyph-Geometry Gates**:
    1. `BORDER_AND_DIVIDER_CROWDING` (`< 12px` text-to-border clearance)
    2. `ROW_WRAP_AND_ORPHAN_ITEM` (ragged multi-line pill/button wrapping)
    3. `PLUMBLINE_AXIS_DRIFT` (`1-8px` unintended left-axis drift across stacked headings/cards)
    4. `LIST_AND_CARD_CONSISTENCY` (sibling card height/bottom mismatch)
    5. `TYPOGRAPHY_MEASURE_AND_ORPHAN_WORDS` (descender clipping & measure discipline)
    6. `OVERFLOW_CLIPPING_AND_COLLISION` (`scrollWidth > clientWidth` or overlapping bounding boxes)
    7. `FONT_AND_ASSET_HEALTH` (detection of `DejaVu Sans` system fallback or broken `<img>` loads)
  - **x20 Opaque-Origin Static HTML Dashboard Safety**: Self-contained `index.html` report with zero `fetch()` calls or `localStorage` dependencies so reports can be hosted directly on `x20web.corp.google.com`.

---

## 8. `screenshot-compare`

- **Author & Origin**: Google Search DevAI Aegis (`//depot/google3/search/devai/aegis/skills/screenshot_compare/SKILL.md`)
- **What Warmup Bakes In**:
  - **Labeled 3-Panel Composite (`side_by_side.png`)**: Combines Target Reference Image, Rendered React Build, and `AutoRaterV1` 64x64 Diff Heatmap into a single labeled strip per build, plus `all_builds_comparison.png` stacking all evaluated builds together.
