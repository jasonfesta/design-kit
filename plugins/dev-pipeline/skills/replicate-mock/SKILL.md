---
name: replicate-mock
description: >-
  Converts UI screenshots and design mockups into pixel-perfect, functioning
  prototypes using native HTML/CSS and interactive frontend rendering.
  Enforces bit-for-bit asset extraction for photographs/complex images,
  perfect text reconstruction, exact typography/hex colors, and
  vector-to-vector matching with zero hallucination and zero omission. Use
  when asked to implement a UI mockup, convert a screenshot to code, replicate
  a design, or build a functioning frontend prototype from an image. Don't use
  for general web scraping without a design mockup or for backend logic
  implementation.
metadata:
  icon: 🔍
---

# replicate mock

```text
jason-dev-agent / replicate mock
────────────────────────────────────────────────────────────────────
stage         1a (pixel, hex & 3-bucket classifier inside image-to-react)
rules         8 pixel-perfection directives (0 hallucination, 0 omission)
buckets       native-code (css/svg) · crisp-media (>=2x) · upscale-queue (<2x)
scripts       prepare-and-extract-image.py · crop_regions.py · measure_px.py
origin        lifted & adapted from manasa babu (manasababu, google3)
```

A skill for converting uploaded UI screenshots and design mocks into pixel-perfect, functioning frontend prototypes and Google Golden Template React applications.

## Why This Skill Exists

When converting UI mocks into prototypes, default code generation often drifts from the visual design: it invents unrequested UI elements, omits subtle dividers or borders, uses generic placeholder icons, approximates colors and typography, or replaces real photographs and complex icons with cartoonish semantic approximations. This skill enforces strict visual fidelity, bit-for-bit asset extraction, and completeness so that prototypes match the design mock exactly while providing a live, interactive frontend experience.

## Core Directives

### 1. Zero Hallucination

Do not invent, add, or assume any new UI elements, text, buttons, navigation bars, or features that are not explicitly visible in the uploaded image.

- **Why:** Adding unrequested features breaks design fidelity and introduces elements that were intentionally excluded from the mock.
- **Rule:** If an element is not visible in the screenshot, do not add it to the DOM.

### 2. Zero Omission

Do not skip, simplify, or remove any elements present in the mock. Every single piece of text, divider, border, badge, and background detail must be accounted for.

- **Why:** Skipping subtle borders, dividers, or secondary text labels causes the prototype to look unfinished or low-fidelity compared to the design.
- **Rule:** Audit every section of the mock from top to bottom and verify that every visual detail has a corresponding element in the code.

### 3. Exact Visual Match (Pixel-Perfect)

Replicate the exact typography scale, font weights, colors (extracting exact hex codes from the image), padding, margins, shadows, and border radii. Proportions must match the original image exactly.

- **Why:** Approximating colors or spacing ruins the visual balance and brand identity of the design.
- **Rule:**
  - Extract and apply exact hexadecimal color codes (e.g., `#1A73E8`, `#F8F9FA`, `#202124`) for backgrounds, borders, and text.
  - Match exact typography hierarchy (font sizes, font weights, line heights, and letter spacing).
  - Reproduce exact padding, margins, border radii, and box shadows.

### 4. No Generic Placeholders

Do NOT use generic placeholder boxes, generic placeholder text (unless explicitly in the mock), or standard icon libraries UNLESS they are a 100% exact match to the mock.

- **Why:** Standard icon libraries or generic placeholder wireframe boxes look like rough sketches rather than finished production UI.
- **Rule:** Do not insert generic `[Placeholder]` boxes or generic lorem ipsum unless the mock literally displays that placeholder text.

### 5. Asset Recreation

For icons, logos, or unique visual assets visible in the screenshot, recreate them visually to match the mock exactly. Never leave a broken image link or a text label like `[User Icon]`.

- **Why:** Broken image links or text labels destroy the visual realism of the prototype.
- **Rule:**
  - Never use `<img>` tags with external or broken URLs.
  - Apply strict asset extraction rules (see Section 6 and 8 below) to ensure every visual asset is rendered with true-to-mock fidelity.

### 6. Bit-for-Bit Asset Extraction (Crucial)

If an element is a complex visual image (photograph, icon, menu item, logo, etc.), extract the exact bitmap pixel data of that region and render it directly (e.g., via embedded base64 image data or precise bitmap slicing). NEVER use semantic reasoning to "infer" what the asset is and replace it with a generated approximation or a simplified shape. Prioritize visual data fidelity over semantic understanding.

- **Why:** Semantic approximations (such as drawing simplified bread buns for a burger photo, cartoon food shapes for a restaurant dish, or simplified circles/chevrons for specific UI badges) destroy visual realism and violate design integrity.
- **Rule:**
  - When rendering photographs, food dishes, complex menu items, or detailed logos, embed exact pixel data (base64 PNG/JPEG data URI) representing the exact region from the mock.
  - **Bucket-First `nano-banana` Handoff:** First mount and classify every visual region inside `image-to-react` (`native-code` CSS/SVG vs. `crisp-media >= 2x` vs. `upscale-queue < 2x`). Only raster `<img>` slots in `upscale-queue`—where `eval-image-readiness.py` reports `< 2x` DPR against the actual rendered CSS box (`clientWidth x clientHeight`), blur, or baked-in text over photography—are sent to `nano-banana` for `2x` Retina restoration. Non-image UI is never upscaled.
  - Never replace a photograph or complex artwork with a simplified SVG or semantic cartoon graphic.

### 7. Perfect Text Reconstruction

Text strings must match the source character-for-character. If text repeats, it must repeat in the exact layout. Font rendering (weight, line height, antialiasing) must align precisely.

- **Why:** Transcription errors, stuttered/duplicated words (e.g., `"See see more"`), or mismatched font weight/line-height degrade typography hierarchy and look unpolished.
- **Rule:**
  - Read every text label character-for-character.
  - Verify that repeated links or labels (e.g., `"See more | See more"`) match the exact spacing, wording, and column alignment of the source.
  - Apply precise CSS font smoothing (`antialiased`), exact font weights (`font-normal`, `font-medium`, `font-semibold`), and exact line heights (`leading-tight`, `leading-snug`, `leading-normal`).

### 8. Vector-to-Vector Match (if possible)

If an asset appears to be vector-based (e.g., standard icons), prioritize recreating it with high-fidelity vector logic (inline SVG, precise CSS shapes) to prevent pixelation, but only if the match is perfect. If the match is not perfect, fallback to directive #6 (exact bitmap data).

- **Why:** High-fidelity vector rendering prevents pixelation at different scales, but an imperfect SVG vector approximation is worse than exact bitmap data.
- **Rule:**
  - For clean vector icons (arrows, pins, speech bubbles, QR codes), create an inline SVG that is a 100% exact geometric match to the mock icon.
  - If any icon or graphic cannot be matched 100% perfectly with SVG paths, immediately fallback to bit-for-bit bitmap extraction (base64 image data).

---

## Execution Workflow

1. **Analyze the Screenshot:**
   - Carefully inspect the uploaded image from top to bottom, left to right.
   - Catalog all visible UI components: headers, navigation bars, cards, buttons, text labels, dividers, inputs, and icons.
   - Extract exact hex color codes for every text element, background, border, and shadow.

2. **Plan the Prototype Hierarchy:**
   - Map the visual structure to a semantic HTML DOM hierarchy or React 19 component tree.
   - Verify that layout proportions (aspect ratios, grid columns, flex alignment, padding, and gap spacing) match the screenshot exactly.

3. **Handle Visual Assets (Bit-for-Bit vs. Vector):**
   - For complex photographs, food images, menu item thumbnails, or detailed illustrations: extract exact bitmap data and embed as a base64 data URI image (`<img src="data:image/jpeg;base64,..." />`) or optimized WebP.
   - For clean vector icons: recreate with 100% geometric SVG precision. If an exact SVG match cannot be guaranteed, fallback to base64 bitmap extraction.

4. **Reconstruct Typography & Text:**
   - Transcribe every text string character-for-character.
   - Audit line wrapping, line height, font weight, and repeated text blocks to ensure zero duplication or omission.

5. **Generate the React Application / Prototype:**
   - When building a standalone deliverable, structure as a Google Golden Template React 19 + Vite 7 + Tailwind v4 project adhering to the canonical `dating` architecture (`package.json`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx`, `src/components/`, `src/data/`, `src/utils/cn.ts`).
   - Use Tailwind CSS utility classes supplemented by arbitrary values for exact hex codes (`text-[#231514]`, `bg-[#FAF5F2]`) and pixel-perfect measurements.

6. **Verify Against Core Directives:**
   - Audit against the Pre-Delivery Audit Checklist before delivery.

---

## Pre-Delivery Audit Checklist

- [ ] **Zero Hallucination:** Are all rendered elements explicitly visible in the uploaded image?
- [ ] **Zero Omission:** Are all dividers, labels, timestamps, badges, and subtle borders from the image present in the code?
- [ ] **Exact Visual Match:** Do all background colors, font sizes, font weights, padding, border radii, and text hex codes match the mock exactly?
- [ ] **No Generic Placeholders:** Are there zero wireframe placeholder boxes or generic text labels?
- [ ] **Asset Recreation:** Are all visual assets rendered cleanly without broken links or placeholder labels?
- [ ] **Bit-for-Bit Asset Extraction:** Are all photographs, food dishes, complex menu thumbnails, and intricate logos rendered using exact bitmap data rather than semantic approximations?
- [ ] **Perfect Text Reconstruction:** Are all text strings character-for-character identical without duplicated words, with exact line height and font weight?
- [ ] **Vector-to-Vector Match:** Are vector icons 100% geometrically identical to the source mock, with bitmap fallback used whenever an exact SVG match cannot be achieved?

---

## Bundled Scripts, References & Examples

- **Scripts**:
  - [`scripts/prepare-and-extract-image.py`](scripts/prepare-and-extract-image.py) — sRGB + Retina `@2x` normalization, `layout_metrics.json`, and non-widget media extraction.
  - [`scripts/crop_regions.py`](scripts/crop_regions.py) — Bit-accurate bounding-box cropping for photographic plates.
  - [`scripts/measure_px.py`](scripts/measure_px.py) — Pixel ruler & 3-zone color/luminance profiler.
- **References & Examples**:
  - [`references/avela_pixel_purity_and_token_rules.md`](references/avela_pixel_purity_and_token_rules.md) — Unboxed silhouette grounding on `#FBF6EE`, exact sampled hex tokens, and Check `C8` anti-hallucination rules.
  - [`examples/avela-homepage-mock-audit.md`](examples/avela-homepage-mock-audit.md) — Complete 8-directive audit on `01-website-avela`.

## Credits & Lineage

- **`replicate-mock` (Core 8 Directives & Audit Checklist)**: Created by **Manasa Babu** (`manasababu`, `//depot/google3/experimental/users/manasababu/skills/replicate_mock/`), adapted for `jason-dev-agent`'s Golden Template React 19 + Tailwind v4 bucket pipeline by Jason Festa (`jfesta`).
- **Preprocessor & Non-Widget Cropping Scripts**: Adapted from **`screenshot-to-html`** by the **Google Agentic Design Loop** team (`dfreedm`, `jonathangamble`, `meaplet`, `igormr`, `//depot/google3/prototypes/projects/agentic_design_loop/skills/screenshot_to_html/`).

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
