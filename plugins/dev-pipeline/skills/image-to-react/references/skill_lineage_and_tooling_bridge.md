# Image-to-React Skill Lineage & Local Tooling Architecture

This document summarizes the visual decomposition, computer-vision scoring, and DOM micro-measurement methodologies unified inside [`skills/image-to-react/`](../SKILL.md).

---

## 1. Sub-Skill Methodologies Unified in `image-to-react`

| Sub-Skill / Module | Capabilities Unified into `skills/image-to-react/` |
| :--- | :--- |
| **`replicate-mock`** | 8 Core Pixel-Perfection Directives: Zero Hallucination, Zero Omission, Exact Visual Match (hex codes, typography scale/weight/line-height, padding/margins/radii), No Generic Placeholders, Asset Recreation, Bit-for-Bit Asset Extraction, Perfect Text Reconstruction, and Vector-to-Vector SVG Match. |
| **`screenshot-to-html`** | sRGB + Retina `@2x` mockup normalization, CV candidate discovery & `layout_metrics.json`, 70% area-floor non-widget asset cropping (`_PROHIBITED_WIDGET_KEYWORDS` guard + `contact_sheet.png`), and headless 1:1 screenshot + DOM collision probing. |
| **`visual-matcher` (`AutoRaterV1`)** | 64x64 cell loss map & heatmap overlay (`diff_mask.png`), DOM selector localization (`container_deviations`), and DOM integrity penalties (`collision_count`, `horizontal_overflow_px`, `clipped_text_count`). |
| **3-Tier Component Synthesis** | Tier 0 typed domain data (`src/data/*Data.ts`), Tier 1 brand & primitives, Tier 2 composed view modules, and Tier 3 `App.tsx` orchestrator; full-canvas Top/Middle/Bottom scan; equal-height card row architecture (`items-stretch` + `mt-auto`). |
| **DOM Micro-Measurement Verifier** | Symmetrical button/pill padding checks (`padding-inline`, `padding-block`, top/bottom card clearance) and horizontal multi-tile grid equality verification (`<= 2px` baseline delta). |
| **Multi-Panel Visual Diffing** | Labeled 3-panel composite (`side_by_side.png`) comparing Reference Comp vs. Rendered React Output vs. 64x64 Diff Heatmap. |

---

## 2. Standalone Scripts in `skills/image-to-react/scripts/`

1. **[`scripts/prepare-and-extract-image.py`](../../replicate-mock/scripts/prepare-and-extract-image.py)** — Normalizes Retina `@2x` screenshots to sRGB `mockup.png`, computes `layout_metrics.json`, and extracts non-widget media crops (`assets.json` + `contact_sheet.png`).
2. **[`scripts/eval-image-to-react.mjs`](../scripts/eval-image-to-react.mjs)** & **[`scripts/eval-multi-screen-project.mjs`](../scripts/eval-multi-screen-project.mjs)** — Compiles the Golden Template React project, renders `dist/index.html` in headless WebKit2GTK / Chromium at exact reference dimensions, probes live DOM geometry, and emits `rendered_overlay.png`, `diff_mask.png`, `side_by_side.png`, and `visual_match_audit.json`.
3. **[`scripts/lint-golden-template.mjs`](../../golden-template/scripts/lint-golden-template.mjs)** — Enforces the canonical Golden Template file tree, dependencies, nomenclature rules, and `tsc --noEmit`.
4. **[`scripts/build-all-projects.mjs`](../../golden-template/scripts/build-all-projects.mjs)** & **[`scripts/verify-html-bundle.mjs`](../../golden-template/scripts/verify-html-bundle.mjs)** — Compiles single-file React deliverables and verifies zero runtime/syntax/CORS errors.
