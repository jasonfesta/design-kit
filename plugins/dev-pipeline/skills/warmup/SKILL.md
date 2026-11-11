---
name: warmup
description: >-
  Runs a pre-benchmark ("pre-bench") or post-benchmark ("post-bench")
  image-to-React translation, head-to-head build comparison, and tear-apart
  design evaluation across frontier models (Grok, Claude, Astra, GPT, and
  Argon) or existing React builds using a locked, minimal zero-drift prompt.
  Supports single UI images or 4K multi-layout grid sheets, API key discovery
  with interactive host assistant model offering, headless WebKit2GTK DOM
  geometry and AutoRaterV1 64x64 cell visual diffing, post-build model
  self-analysis of image differences and hidden instructions, runnable Golden
  Template React project generation, and comparative design grading. Use when
  running a pre-bench warmup from an image or 4K layout grid to React,
  comparing multiple React builds against a reference design image, or grading
  image-to-React translations on visual fidelity, CSS integrity, button
  optical padding, typography, and interactivity. Don't use for incremental
  post-Dial layout change benchmarking without an image reference (use...
metadata:
  icon: 🔥
---

# Warmup: Image-to-React Pre-Bench, Post-Bench Build Comparator & Tear-Apart Design Eval

Warmup (`warmup`) is a Google-wide shareable design evaluation skill that tests and compares how accurately frontier models (**Grok**, **Claude**, **Astra**, **GPT**, and **Argon**) or existing React builds translate a source image—either a single UI screenshot/mockup or a 4K multi-layout grid sheet—into a complete, runnable React application.

Warmup operates in two modes:

1.  **Pre-Bench Mode (`--mode pre-bench`)**: Runs *before* full product building using a single, locked, zero-drift prompt across **Grok**, **Claude**, **Astra**, **GPT**, and **Argon** to see which model best moonshots hidden visual instructions, preserves optical button padding and typography, and produces a working React folder.
2.  **Post-Bench Build Comparison Mode (`--mode post-bench` / `compare_builds.py`)**: Takes 1 to $N$ existing or newly generated React builds (`project/` folders or `dist/index.html` bundles), renders them in headless WebKit2GTK (`xvfb-run -a`), and compares every build against the reference image and head-to-head against each other.

## Workflow Checklist

Copy this checklist to track progress across a Warmup run:

- [ ] **Step 1**: Check API keys & offer available host assistant models (`scripts/check_models.py`)
- [ ] **Step 2**: Preprocess the source image, extract semantic tokens & slice 4K grid panels (`scripts/prepare_and_extract.py`)
- [ ] **Step 3**: Execute Pass 1 (Locked Simple Zero-Drift Prompt) or stage Post-Bench builds (`scripts/run_warmup.py`)
- [ ] **Step 4**: Execute Pass 2 (Post-Translation Difference & Hidden-Instruction Self-Analysis)
- [ ] **Step 5**: Run Headless WebKit2GTK DOM & `AutoRaterV1` Visual Comparison across all builds (`scripts/compare_builds.py`)
- [ ] **Step 6**: Run Pass 3 (Tear-Apart Design Eval) and generate `WARMUP-REPORT.md`, `index.html`, and `scores.json` (`scripts/eval_warmup.py`)

--------------------------------------------------------------------------------

## Step 1: Check API Keys & Offer Available Host Assistant Models

Warmup evaluates five default frontier model slots: **Grok** (`grok`), **Claude** (`claude`), **Astra** (`astra`), **GPT** (`gpt`), and **Argon** (`argon`).

Before running trials, check which model slots have external API keys configured and which host assistant models are available as fallbacks:

```bash
python3 {skill_dir}/scripts/check_models.py --env-file=.env --format=all
```

Each model slot resolves its execution route in three tiers so a Warmup run never blocks when an external API key is absent:

1.  **Direct Provider API Key**: Uses `XAI_API_KEY` (Grok), `ANTHROPIC_API_KEY` (Claude), `ASTRA_API_KEY` or `GEMINI_API_KEY` (Astra), `OPENAI_API_KEY` (GPT), and `ARGON_API_KEY` (Argon) from the environment or `.env`.
2.  **Unified Gateway Key**: Routes through `PORTKEY_API_KEY` or `OPENROUTER_API_KEY` when configured.
3.  **Interactive Host Assistant Model Offer & Fallback**: When any slot lacks an API key, query live host models via `swarm(action="models", all=True)`, pass the catalog to `check_models.py`, and present the interactive `ask_question` payload to the user so they can accept the recommended host model mapping (with live remaining quota percentages) or provide a `.env` path.

Never ask for raw API keys in chat or write credentials into generated React folders or reports. See the [model routing and fallback configuration guide](references/model-routing.md).

## Step 2: Preprocess the Input Image (Single Screen vs. 4K Multi-Layout Grid)

Run `prepare_and_extract.py` (automatically invoked by `run_warmup.py` or runnable standalone) to establish the ground-truth visual baseline:

```bash
python3 {skill_dir}/scripts/prepare_and_extract.py --image={image_path} --output={output_dir}/preprocessing
```

This step bakes in `prepare-and-extract-image.py`, `ingest-nano-banana.py`, and `measure_px.py` from `image-to-react`:

1.  **Topology & 4K Grid Panel Slicing**: Detects whether the input is a **Single UI Layout** or a **4K Multi-Layout Grid Sheet** (such as a `5504x3072` 5-page website sheet or `4544x3748` 10-screen mobile sheet) and slices individual panels into `preprocessing/panels/panel_01.png`..`panel_K.png`.
2.  **8-Token Semantic CSS Palette Extraction**: Extracts `--surface`, `--surface-raised`, `--ink`, `--muted`, `--accent`, `--accent-alt`, `--on-accent`, and `--border` directly from pixel histogram clusters.
3.  **3-Zone Vertical Profile**: Measures luminance and contrast across **Zone A (Top `0-25%`)**, **Zone B (Middle `25-75%`)**, and **Zone C (Bottom `75-100%`)**.

## Step 3: Pass 1 — Run the Locked Simple Prompt (Pre-Bench) or Stage Existing Builds (Post-Bench)

In **Pre-Bench Mode**, every model receives the **exact same minimal prompt**. Keeping the prompt simple and invariant tests which model naturally respects visual boundaries and uncovers implicit design instructions without drifting:

```text
Take this image as is. Do not drift and do not invent anything new. Translate the image exactly as you see it into a complete, working React screen, application, or website (if the image is a grid containing multiple layouts, translate every layout in the grid accurately). Do not invent any new items, sections, copy, or images. Make sure all images and visual assets are high resolution; if you need to recreate an image or graphic asset so it renders crisply at high resolution, recreate it faithfully without changing its subject, palette, or composition. Produce a complete, workable project folder with all necessary files to build and run the HTML.
```

Run `run_warmup.py` in **Pre-Bench Mode**:

```bash
python3 {skill_dir}/scripts/run_warmup.py --mode=pre-bench --image={image_path} --output={output_dir} --models=grok,claude,astra,gpt,argon
```

Or run `run_warmup.py` in **Post-Bench Mode** to compare existing React project directories or built HTML bundles against the reference image:

```bash
python3 {skill_dir}/scripts/run_warmup.py --mode=post-bench --image={image_path} --output={output_dir} --builds=build_a={path_to_build_a},build_b={path_to_build_b}
```

Each trial materializes a complete, runnable Golden Template React project in `{output_dir}/trials/{model_slug}/project/` (with `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx`, `src/components/*.tsx`, `src/data/*.ts`, and a self-contained `dist/index.html` bundle).

## Step 4: Pass 2 — Post-Translation Difference & Hidden-Instruction Self-Analysis

Immediately after a model produces its Pass 1 React translation, prompt that **same model context** to audit its own work against the source image using the locked Pass 2 probe (see [references/prompt-protocol.md](references/prompt-protocol.md)):

```text
Compare your generated React application against the original source image and provide a structured self-analysis covering:
1. Visual & Layout Differences: List every difference between the source image and your React translation (layout proportions, spacing, colors, typography, missing or approximated elements, and recreated high-res imagery).
2. Hidden or Implicit Instructions Detected: Identify any hidden instructions, subtle UI cues, micro-copy directives, grid relationships, or implied interactive behaviors present in the source image, and explain whether and how your React code implemented them.
3. Self-Identified Drift: Note anywhere you drifted from the exact image or had to infer details not explicitly visible.
```

Each model's self-analysis is saved to `{output_dir}/trials/{model_slug}/self-analysis.md`.

## Step 5: Headless WebKit2GTK DOM & `AutoRaterV1` Multi-Build Visual Comparison

Run `compare_builds.py` (automatically invoked by `eval_warmup.py` or runnable standalone) to render every build in headless WebKit2GTK and compute pixel + DOM geometry comparisons:

```bash
xvfb-run -a python3 {skill_dir}/scripts/compare_builds.py --run-dir={output_dir}
```

For every build, `compare_builds.py` produces:

-   **Rendered Screenshot & 64x64 Cell Loss Map (`AutoRaterV1`)**: Computes `s_total`, `s_block` (luminance structure), `s_edge` (Sobel edge structure), `s_chroma` (RGB color fidelity), `s_dom` (live DOM geometry health), and per-zone scores (`Zone A Top 0-25%`, `Zone B Middle 25-75%`, `Zone C Bottom 75-100%`).
-   **Visual Diff Artifacts**: Writes `rendered.png`, `rendered_overlay.png` (50/50 semi-transparent blend), `diff_mask.png` (64x64 cell error heatmap), and `side_by_side.png` (labeled 3-panel strip: Target Reference | Rendered Build | Diff Heatmap) into `{output_dir}/trials/{model_slug}/comparison/`.
-   **Live DOM Optical Padding & Glyph-Geometry Audit**: Measures every button, pill, card, and grid row via `getBoundingClientRect()` and `getComputedStyle()` for horizontal padding symmetry (`|padLeft - padRight| <= 3px`), border crowding (`< 12px`), bottom card clearance (`>= 14px`), equal-height sibling cards (`<= 2px` delta), plumbline alignment, and `DejaVu Sans` font fallback detection.
-   **Pairwise Build-vs-Build Matrix**: Writes `{output_dir}/comparison/pairwise_build_matrix.json` and `{output_dir}/comparison/all_builds_comparison.png` comparing every pair of builds $(M_i, M_j)$ against each other and against the reference image.

## Step 6: Pass 3 — Tear-Apart Design Eval & Comparative Reports

Run `eval_warmup.py` to grade every trial across the 100-point rubric and generate the comparative reports:

```bash
python3 {skill_dir}/scripts/eval_warmup.py --run-dir={output_dir} --verify
```

### Scoring Rubric (100 Points Total)

Dimension | Max Points | What to Tear Apart
:--- | :--- | :---
**1. Image-to-React Visual Fidelity & Zero Drift** | **25** | `AutoRaterV1` `s_total` (`s_block`, `s_edge`, `s_chroma`), 3-zone fidelity (Top/Middle/Bottom), 4K grid panel completeness, zero hallucinated items/copy, high-res asset preservation or crisp vector SVG recreation.
**2. Hidden Instructions & Self-Analysis Honesty** | **15** | Detection and execution of implicit/hidden visual instructions in the source image, plus accuracy and honesty of the Pass 2 difference self-analysis.
**3. Typography & Font Translation** | **15** | Font family matching (`.font-serif-display`, `.font-grotesk`, `.font-mono-tech`), Google Fonts loaded in `index.html`, zero `DejaVu Sans` fallback, letter-spacing, descender clearance, and `tabular-nums` on numbers.
**4. Optical Padding, Button Craft & CSS Integrity** | **20** | Symmetrical horizontal (`>= 12px`) and vertical (`>= 6px`) padding on all buttons/pills (`px-3.5` to `px-5`, `py-1.5` to `py-2.5`), card bottom clearance (`>= 14px`), icon-to-label gaps (`gap-1.5` to `gap-2`), equal-height sibling grid cards (`<= 2px`), and zero collisions/overflow.
**5. Interactive Completeness & Stateful Behavior** | **15** | Working React state (`useState`, `useMemo`) on tabs, filters, modals, drawers, toggles, and multi-screen navigation (`?screen=<i>` / `window.__setGoldenEvalScreen`); tactile `:active` states.
**6. Code Quality & Runnable Folder Integrity** | **10** | Canonical Golden Template folder structure, named `export function App()`, bespoke `<Brand>BrandLogo.tsx` SVG component, modular `src/components/` + `src/data/`, and runnable `dist/index.html`.

### Mandatory Determinations in Every Report

Every generated report (`{output_dir}/WARMUP-REPORT.md`, `{output_dir}/index.html`, `{output_dir}/scores.json`, and `{output_dir}/trials/{model_slug}/MODEL-EVAL-REPORT.md`) explicitly determines:

1.  **What Each Model Did Right** (exact visual, structural, typographic, padding, and interactive matches vs. the actual image).
2.  **What Each Model Did Wrong** (`[P0] / [P1] / [P2]` defects, drift, cramped buttons, or omissions vs. the actual image).
3.  **Differences Compared to the Actual Image** (Zone A Top `0-25%`, Zone B Middle `25-75%`, Zone C Bottom `75-100%`, plus localized DOM `container_deviations`).
4.  **Differences Between Models Relative to Each Other and the Actual Image** (cross-model delta table + pairwise build divergence matrix showing which build won each zone and why).

--------------------------------------------------------------------------------

## Baked-In Sub-Skills & Lineage Credits

Warmup bakes in and explicitly credits the following Google and `moodboards-borg-space` sub-skills (see [references/sub-skills-and-credits.md](references/sub-skills-and-credits.md) for full details):

-   **`image-to-react`** (Jason Festa, `moodboards-borg-space`): High-res screenshot & 4K Nano Banana grid preprocessing (`prepare-and-extract-image.py`, `ingest-nano-banana.py`), closed-loop WebKit2GTK evaluation (`eval-image-to-react`), and pixel ruler (`measure_px.py`).
-   **`golden-template`** (Jason Festa, `moodboards-borg-space`): Canonical `golden-template/dating` (`Nocturne`) React 19 + Vite 7 + Tailwind v4 architecture, 8-token semantic CSS palette, and Golden Template linter.
-   **`replicate-mock`** (Manasa Babu & Jason Festa): 8 Core Pixel-Perfection Directives (Zero Hallucination, Zero Omission, Exact Visual Match, No Generic Placeholders, High-Res Asset Recreation, Bit-for-Bit Asset Extraction, Perfect Text Reconstruction, Vector-to-Vector SVG Match).
-   **`screenshot-to-html` & `visual-matcher` (`AutoRaterV1`)** (Google Agentic Design Loop): 64x64 cell loss map (`s_total`, `s_block`, `s_edge`, `s_chroma`, `s_dom`), `rendered_overlay.png`, `diff_mask.png`, and localized DOM `container_deviations`.
-   **`sds-measurement-verifier`** (Google Search DevAI SDS): Universal Interactive Element & Button Padding Rule and Horizontal Multi-Tile Grid Equality Verification (`<= 2px` delta).
-   **`html-to-search-vibes` & `screenshot-to-search-vibes`** (Google Cruxy): Full-Canvas 3-Zone Scan Protocol (`Zone A Top 0-25%`, `Zone B Middle 25-75%`, `Zone C Bottom 75-100%`) and Equal-Height Card Row Architecture (`items-stretch` + `h-full flex-col justify-between` + `mt-auto`).
-   **`web-design-check` & `web-design-review`** (`fofr`, `go/fofr-agent-skills`): 7 Generic Glyph-Geometry Gates (`BORDER_AND_DIVIDER_CROWDING < 12px`, `ROW_WRAP_AND_ORPHAN_ITEM`, `PLUMBLINE_AXIS_DRIFT`, `LIST_AND_CARD_CONSISTENCY`, `TYPOGRAPHY_MEASURE_AND_ORPHAN_WORDS`, `OVERFLOW_CLIPPING_AND_COLLISION`, `FONT_AND_ASSET_HEALTH`) and x20 opaque-origin static HTML report safety.
-   **`screenshot-compare`** (Google Search DevAI Aegis): Labeled 3-panel composite (`side_by_side.png`) and multi-build comparison board (`all_builds_comparison.png`).

--------------------------------------------------------------------------------

## References

-   [Baked-in sub-skills and lineage credits](references/sub-skills-and-credits.md)
-   [Locked prompt protocol and self-audit probe](references/prompt-protocol.md)
-   [Model routing, API keys, and assistant fallback configuration](references/model-routing.md)
-   [Tear-apart design evaluation rubric and scorecard template](references/design-eval-rubric.md)
-   [Example: Post-bench comparison across AVELA homepage builds](examples/avela-post-bench-comparison-walkthrough.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
