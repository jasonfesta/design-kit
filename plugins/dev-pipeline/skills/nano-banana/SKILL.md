---
name: nano-banana
description: >-
  Converts low-resolution source mockups, compressed screenshots, and soft or
  dithered cropped photographic assets into crisp 2x Retina and 4K
  high-resolution plates using Nano Banana with zero semantic drift. Handles
  faithful 1-to-1 super-resolution, diffusion grain and JPEG de-dithering,
  ultra-wide banner aspect padding, and clean removal of baked-in raster text
  overlays behind live HTML typography, stopping for a deterministic dev eval
  followed by a paired material and visual critique in jason-design-agent. Use
  whenever a reference image or extracted photo crop in jason-dev-agent is
  low-resolution, blurry, dithered, or below 2x CSS Retina dimensions. Don't
  use for UI buttons, icons, or typography that belong as native HTML, CSS,
  and inline SVG (use replicate-mock and image-to-react).
metadata:
  icon: 🍌
---

# nano banana

```text
jason-dev-agent / nano banana
────────────────────────────────────────────────────────────────────
stage         1b in image-to-react (targeted upscale-queue upgrade)
input         ONLY mounted <img> buckets failing eval-image-readiness.py
dev eval      eval-image-readiness.py (ready + >=2x dpr + sharp_ok)
paired gate   material & visual fidelity critique in jason-design-agent
```

`nano-banana` is `jason-dev-agent`'s targeted low-res to high-res image restoration skill. Rather than blindly upscaling everything up front, `jason-dev-agent` builds the Stage 1a React DOM first (`image-to-react` + `replicate-mock`), keeps `native-code` (`html/css/svg`) and `crisp-media` (`>= 2x`) untouched, and passes **only `upscale-queue` `<img>` slots** (those failing [`scripts/eval-image-readiness.py`](scripts/eval-image-readiness.py) at their actual rendered `clientWidth x clientHeight`, showing blur/dithering, or carrying baked-in raster text behind live HTML) through Nano Banana.

---

## workflow checklist

- [ ] **testing prompt (`design_agent_turns`)**: if not already set for this run, ask the user **"how many turns do you want out of the design agent?"** before starting the critique loop.
- [ ] **turn 0 — audit resolution & separate vector UI from raster plates**: check every input screenshot and extracted crop (`crop_w x crop_h` vs. target CSS box `css_w x css_h`). Keep buttons, icons, borders, and UI text as native React + CSS + SVG; route only low-res photographic/illustration plates (or a blurry master mockup prior to cropping) into `nano-banana`.
- [ ] **pre-flight user confirmation gate *(mandatory before running Nano Banana)***: before invoking Nano Banana (`gempix`, `image-generator`, or API), present the exact request summary—total call count, target resolution (`2k` / `4k`), crop list, and prompt preview—and **ask the user to confirm** (via `ask_question` or direct prompt: `Confirm & run Nano Banana (<N> calls)` / `Edit prompts or selection first` / `Skip Nano Banana`). Never fire Nano Banana calls without confirmation unless the user explicitly selected `Auto-confirm all Nano Banana calls for this run`.
- [ ] **turn 1..n — run `nano-banana` high-res restoration**: upscale to `2k` / `4k` and resize to exact `2 * css_w x 2 * css_h` using strict zero-drift prompts, applying the ultra-wide `3:1` pad-and-crop guard whenever `W / H > 3.8` and clean-plate text removal whenever live HTML text sits over the image.
- [ ] **stop & judge (`nano-banana` dev eval)**: verify `>= 2x` pixel dimensions, `<= 0.5%` aspect drift, `8x8` color/structure lock to the low-res source, sharpness gain, and `0` edge seams before embedding into React.
- [ ] **paired designer critique (`jason-design-agent`)**: send side-by-side `low_res -> high_res_2x` plates into `jason-design-agent` (`stage: nano-banana`, up to `design_agent_turns` turns) to verify authentic grain, skin/fabric/leather/stoneware realism, and zero plastic AI sheen against the original inspiration.

---

## 1. when `jason-dev-agent` triggers `nano-banana`

> Whole-plate refreshes of imported folders (start-from-folder) are **not** this skill: `jason-design-agent` does that upstream with `nanofy` (`../nanofy/SKILL.md`). `nano-banana` only upgrades `upscale-queue` buckets inside a build.

Run `nano-banana` automatically in two situations:

1. **low-res cropped photographic assets (`crop_w < 2 * css_w` or dithered)**:
   - Crops extracted by `replicate-mock` from `1x` screenshots or 5-column 4K layout sheets (`800px-1000px` wide columns) frequently measure `0.7x-1.2x` of their desktop CSS box and show diffusion stippling or JPEG softness.
   - `nano-banana` restores every photographic plate to crisp **`2x` Retina (`2 * css_w x 2 * css_h`)** so `<img>` elements stay razor-sharp on HiDPI displays.
2. **low-res master reference mockup (`width < 1000px` desktop or `< 640px` mobile)**:
   - When the user supplies a small, compressed thumbnail or low-res screenshot as the reference itself, run `nano-banana` in **1-to-1 faithful master upscale mode (`2k` / `4k`)** first to recover crisp edges before `replicate-mock` measures coordinates and slices photographic crops.

> **Widget & Typography Purity Rule**: Never pass UI buttons, pills, navbars, standard line icons, or plain text cards through raster upscaling to embed as `<img>` tags. Always rebuild UI chrome and typography natively in React + Tailwind CSS + inline SVG; use `nano-banana` strictly for photographs, portraits, product silhouettes, macro textures, and complex artwork.

---

## 2. how `jason-dev-agent` invokes `nano-banana`

Full copy-pasteable prompts and aspect math live in [upscale prompts and aspect rules](references/upscale-prompts-and-aspect-rules.md). `jason-dev-agent` supports three execution routes (pick the first available in the active environment):

### route a — google internal nano banana cli (`gempix-1`)

Run outside the sandbox (`BypassSandbox: true`) and **never pass `-no-thoughts`** (thinking mode preserves subject geometry and micro-texture):

```bash
/google/bin/releases/gempix/gempix-1/gempix \
  --input_image="/tmp/crops/hero_lowres.png" \
  --output_image="/tmp/crops/hero_nanobanana_raw.png" \
  --image_size=2k \
  --prompt="Upscale and restore this low-resolution photograph to crisp 2K Retina high resolution with zero semantic drift. Preserve 100% of the exact subject, pose, silhouette geometry, camera angle, lighting direction, cast shadows, and hex color palette. Remove compression blocks and diffusion dithering, recovering natural authentic surface texture without plastic smoothing or invented objects."
```

Then lock the output in sandboxed mode (`BypassSandbox: false`) to exact `2x` CSS pixel dimensions (`2*W x 2*H`):

```bash
/usr/bin/magick "/tmp/crops/hero_nanobanana_raw.png" \
  -colorspace sRGB -strip -filter Lanczos \
  -resize "1920x1200!" "/tmp/crops/hero_2x.png"
```

### route b — built-in `image-generator` subagent

When running inside Jetski without direct CLI flags, invoke `image-generator` (`invoke_subagent` with `TypeName: "image-generator"`), passing the absolute path to the low-res source crop, the exact target `2x` pixel dimensions, and the zero-drift restoration prompt from [upscale prompts and aspect rules](references/upscale-prompts-and-aspect-rules.md).

### route c — portable gemini nano banana api

In standalone scripts (`GEMINI_API_KEY`), call `gemini-3-pro-image-preview` or `gemini-2.5-flash-image` with the low-res PNG inline part + the zero-drift restoration prompt (`imageSize: "2K"` or `"4K"`), then Lanczos-resize to `2 * css_w x 2 * css_h`.

---

## 3. mandatory geometric & clean-plate guards

1. **ultra-wide banner padding rule (`W / H > 3.8`)**:
   - Nano Banana / `gempix-1` rejects crops wider than `4:1` (`Cannot articulate aspect ratio`).
   - Whenever `W / H > 3.8`, pad the low-res crop vertically with sampled border/parchment hex (`#F5F0E8` or median edge color) to `W / H = 3.0`, run `nano-banana`, and crop the center band back to exact `2 * css_w x 2 * css_h`.
2. **baked-in raster text removal (hero & banner clean plates)**:
   - Whenever live React HTML headlines or CTA buttons sit on top of a photograph, prompt `nano-banana` to **cleanly remove only the baked-in raster lettering/buttons** while preserving 100% of the underlying subject, architecture, lighting, and product silhouette—preventing ghosted double text.
3. **unboxed silhouette studio ground lock**:
   - For freestanding product silhouettes on solid studio backgrounds (`#FBF6EE`, `#F6F2EC`, `#FFFFFF`), sample the `2px` outer border ring after upscaling and match it cleanly to `--surface` so the `2x` image sits on the page with zero rectangular box seam.

---

## 4. stopping to judge: the `nano-banana` image readiness & anti-blur dev eval

Before placing any cropped or upscaled asset into `src/` or `public/`—and again once mounted in `dist/index.html`—`jason-dev-agent` stops and runs [`scripts/eval-image-readiness.py`](scripts/eval-image-readiness.py) alongside the five deterministic gates (detailed in [dev eval and zero-drift checks](references/dev-eval-and-zero-drift-checks.md)):

```bash
# Audit an assets directory and/or a built React project for readiness, 2x DPR, and non-blur sharpness
python3 /usr/local/google/home/jfesta/design-kit/skills/nano-banana/scripts/eval-image-readiness.py \
  --assets-dir="/tmp/crops_2x" \
  --project="/path/to/workspace/projects/<project-slug>"
```

| gate | requirement to pass on the dev side |
| :--- | :--- |
| **1. ready & decodable (`ready_ok`)** | `100%` of images exist, decode cleanly in sRGB, and report `img.complete === true && naturalWidth > 0` in the live DOM (`0` broken or unloaded images). |
| **2. `2x` retina density (`density_ok`)** | Output pixel width and height are at least `2 * css_w` by `2 * css_h` (`effective_dpr >= 1.95x`) with `<= 0.5%` aspect-ratio drift (`0` squashing). |
| **3. non-blur sharpness (`sharp_ok`)** | Passes multi-scale high-frequency vs. mid-frequency acutance (`sharpness_ratio >= 0.28`, `hf_detail_std >= 0.8`) and `> 1.15x` sharpness gain over bicubic upscale—automatically catching blurry crops or stretched `1x -> 2x` upscales. |
| **4. color & structure lock** | Downsampled `8x8` mean RGB delta vs. the low-res crop stays `<= 12 / 255` (or `<= 18 / 255` on text-cleaned banners) with `0` ghosted raster lettering behind live HTML text. |
| **5. seam-free React mount** | Mounted with explicit `width`, `height`, and `w-full h-full object-cover max-w-none` (`0.00` CLS; `<= 2` RGB border delta on unboxed studio grounds). |

If any gate fails (for example, shifted palette warmth, hallucinated background object, or leftover ghost letters), `jason-dev-agent` tightens the prompt or re-runs crop/mask alignment until all five gates pass.

---

## 5. paired designer critique (`jason-dev-agent` -> `jason-design-agent`)

Immediately after the `nano-banana` dev eval passes, `jason-dev-agent` hands the side-by-side `low_res` vs. `high_res_2x` contact sheet back into **`jason-design-agent`** via `design-critique` (`stage: nano-banana`, respecting the user's `design_agent_turns` budget):

- `jason-design-agent` critiques the restored plates as a designer against the **original inspiration**:
  - *Do materials read honestly—real pebbled calfskin, raw linen weave, wheel-thrown stoneware, natural skin pores, crisp architectural shadow—or did upscaling make surfaces look waxy, airbrushed, or overly sharpened?*
  - *Did lighting temperature and mood stay faithful to the inspiration's tonal world?*
- On `changes_requested`, `jason-dev-agent` adjusts the `nano-banana` texture/lighting prompt, re-verifies all five dev eval gates, and iterates back and forth until `approved` (or `design_agent_turns` completes).

--------------------------------------------------------------------------------

## references, scripts & examples

- [`scripts/eval-image-readiness.py`](scripts/eval-image-readiness.py) — deterministic image readiness, `2x` Retina DPR, and non-blur sharpness evaluator across asset folders and live built React DOMs.
- [copy-pasteable `nano-banana` prompts, clean-plate text removal & ultra-wide `3:1` aspect padding](references/upscale-prompts-and-aspect-rules.md)
- [deterministic `2x` density, `8x8` drift, sharpness & edge-seam dev eval checks](references/dev-eval-and-zero-drift-checks.md)
- [multi-turn low-res to `2x` Retina walkthrough with `jason-design-agent` material critique](examples/low-res-to-high-res-turn-loop.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
