# Locked Prompt Protocol & Self-Analysis Probe

Warmup is a controlled pre-bench experiment. To compare **Grok**, **Claude**, **Astra**, **GPT**, and **Argon** fairly on raw image-to-React translation and hidden-instruction discovery, the prompt must remain **simple, zero-drift, and identical** across every model trial.

## Why Prompt Simplicity & Invariance Matter

If a prompt contains detailed layout hints, component breakdowns, or CSS coaching, the test measures the prompt engineer rather than the model's visual comprehension. By sending a short, unadorned zero-drift prompt with the image attached, Warmup exposes which model naturally:

-   Reads every quadrant and tile of a single screenshot or 4K multi-layout grid
-   Notices subtle or hidden visual instructions inside the image itself
-   Preserves optical button padding, typography hierarchy, and color tokens
-   Produces a clean, runnable React application folder without hallucinating new features

--------------------------------------------------------------------------------

## Pass 1: The Locked Image-to-React Translation Prompt

Send the exact user prompt below to every model along with the source image (`image_url` / base64 data URI). Do not add layout spoilers or image-specific hints to the user prompt.

### User Prompt (Verbatim)

```text
Take this image as is. Do not drift and do not invent anything new. Translate the image exactly as you see it into a complete, working React screen, application, or website (if the image is a grid containing multiple layouts, translate every layout in the grid accurately). Do not invent any new items, sections, copy, or images. Make sure all images and visual assets are high resolution; if you need to recreate an image or graphic asset so it renders crisply at high resolution, recreate it faithfully without changing its subject, palette, or composition. Produce a complete, workable project folder with all necessary files to build and run the HTML.
```

### System Output Contract (Structured File Extraction)

When calling model APIs via `scripts/run_warmup.py`, wrap the system instruction so the model returns a deterministic JSON map of project files that can be written directly into `{output_dir}/trials/{model_slug}/project/` without altering the user prompt:

```text
You are translating an input image directly into a complete, runnable React + TypeScript + Tailwind CSS (Vite) project folder. Follow the user's prompt strictly. Return a JSON object with:
1. "files": an object mapping relative file paths ("index.html", "src/index.css", "src/App.tsx", "src/data/warmupData.ts", "src/components/<Brand>BrandLogo.tsx", and modular "src/components/<Component>.tsx" files) to their complete UTF-8 source strings.
2. "notes": a short summary of the translated layout(s) and high-resolution asset recreations.
```

The runner automatically layers the canonical bootstrap files (`package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/utils/cn.ts`) into `{output_dir}/trials/{model_slug}/project/` if the model omits unchanged boilerplate, while preserving every file the model explicitly outputs.

--------------------------------------------------------------------------------

## Pass 2: Post-Translation Difference & Hidden-Instruction Self-Analysis Prompt

Immediately after Pass 1 completes, send Pass 2 in the **same conversation turn history** (with the original source image and the model's generated React code in context).

### User Prompt (Verbatim)

```text
Compare your generated React application against the original source image and provide a structured self-analysis covering:
1. Visual & Layout Differences: List every difference between the source image and your React translation (layout proportions, spacing, colors, typography, missing or approximated elements, and recreated high-res imagery).
2. Hidden or Implicit Instructions Detected: Identify any hidden instructions, subtle UI cues, micro-copy directives, grid relationships, or implied interactive behaviors present in the source image, and explain whether and how your React code implemented them.
3. Self-Identified Drift: Note anywhere you drifted from the exact image or had to infer details not explicitly visible.
```

### How Pass 2 Feeds Pass 3 (Design Eval)

During Pass 3, the Design Evaluator compares the model's Pass 2 claims against reality:

-   **True Positive Detection**: The model spotted a hidden instruction or subtle layout rule in the image *and* implemented it in React.
-   **Aware Approximation**: The model could not extract a raster photo directly, recreated it as high-res SVG/canvas/CSS artwork, and accurately documented the recreation in Pass 2.
-   **Blind Spot / Unacknowledged Drift**: The model missed a grid tile, used cramped button padding, substituted a generic font, or hallucinated a new nav item, *and* failed to report the discrepancy in Pass 2 (heavily penalized under Dimension 2).
