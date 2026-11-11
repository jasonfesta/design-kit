# upscale prompts, clean-plate text removal & aspect rules (`nano-banana`)

This reference contains exact prompt templates, aspect-ratio padding formulas, and CLI / subagent / API patterns for converting low-res images and soft crops into crisp `2x` Retina and `4K` assets without semantic drift.

---

## 1. the four canonical `nano-banana` prompt templates

Always pick the template matching the exact asset role rather than writing vague `"make high quality"` instructions (vague prompts cause Nano Banana to re-imagine composition or smooth away real texture).

### template a — 1:1 faithful photo / portrait / macro upscale (default)

Use for standard product cards, editorial portraits, material macros, food photography, architectural shots, and complex illustrations without text overlays:

```text
Upscale and restore this low-resolution image to crisp 2K Retina high resolution with strict 1:1 fidelity and zero semantic drift. Preserve 100% of the exact subject identity, pose, object silhouette, camera angle, focal length, framing, lighting direction, cast shadows, and hex color palette. Remove low-res softness, diffusion dithering, and JPEG compression artifacts while restoring authentic, natural micro-texture (real fabric weave, leather grain, ceramic glaze, skin texture, or foliage detail). Do not add, remove, or reposition any object, and avoid waxy, airbrushed, or oversharpened AI artifacts.
```

### template b — clean-plate hero / banner restoration (removes baked-in raster text)

Use whenever live React HTML headlines, subtitles, badges, or CTA buttons sit over a full-bleed hero or mid-page campaign banner so live HTML text never double-renders over ghosted pixels:

```text
Restore and upscale this low-resolution banner photograph to crisp 2K Retina high resolution while cleanly removing all overlaid text headlines, captions, and UI button graphics so only the pure underlying photograph remains. Inpaint the areas behind the removed text seamlessly using the exact surrounding surface, lighting, and architectural or natural background detail. Preserve 100% of the primary subject, product geometry, camera framing, shadow direction, and exact color temperature with zero added props or composition drift.
```

### template c — unboxed studio silhouette on solid surface (`--surface` lock)

Use when a product (handbag, chair, bottle, ceramic vessel, sneaker, hardware device) sits unboxed directly on a solid studio ground (for example `#FBF6EE`, `#F6F2EC`, or `#FFFFFF`):

```text
Upscale and restore this studio product photograph to crisp 2K Retina high resolution with zero semantic drift. Keep 100% of the exact product silhouette, proportions, stitching/hardware details, contact shadow, and exact uniform solid background color (<HEX_SURFACE>) right out to all four edges with zero vignette, zero gradient border, and zero framing box. Restore crisp, tactile material grain without plastic smoothing.
```

### template d — whole low-res mockup master upscale (pre-extraction)

Use only when the user's entire uploaded UI screenshot is very low-res (`< 1000px` desktop or `< 640px` mobile) and you need a sharper reference plate before running `replicate-mock`:

```text
Perform a faithful 2x super-resolution restoration of this UI design screenshot with zero layout, color, or content changes. Keep every UI container, typographic line break, icon shape, photograph, spacing gap, and hex color in its exact pixel-proportional coordinate. Sharpen blurry edges and remove JPEG compression noise without inventing or altering any UI element.
```

*(Even after Template D, rebuild all UI buttons, cards, icons, and text as native React + Tailwind + SVG—never slice upscaled UI buttons as bitmap `<img>` tags.)*

---

## 2. ultra-wide banner padding math (`W / H > 3.8`)

Nano Banana / `gempix-1` rejects crops wider than `4:1` (`Cannot articulate aspect ratio`). Apply this deterministic 3-step pad -> upscale -> center-crop sequence whenever `src_w / src_h > 3.8`:

1. **pad vertically to `3:1` in sandboxed mode (`BypassSandbox: false`)**:
   - Given low-res crop `src_w x src_h` (for example `960 x 200`, ratio `4.8:1`) targeting `2x` Retina CSS dimensions `out_w = 2 * css_w`, `out_h = 2 * css_h` (`1920 x 400`):
   - Compute padded height `pad_h = ceil(src_w / 3.0)` (`320px`).

```bash
/usr/bin/magick "/tmp/crops/banner_lowres.png" \
  -gravity center -background "#F5F0E8" \
  -extent "960x320" "/tmp/crops/banner_padded_3to1.png"
```

2. **run `nano-banana` (`gempix-1` or `image-generator`) on the `3:1` padded image**:
   - Add to the prompt: `"Keep the subject strictly inside the central horizontal band and leave the top and bottom neutral padding bars untouched."`

3. **crop the center band back to exact `2x` Retina (`out_w x out_h`) in sandboxed mode**:
   - If the `nano-banana` raw output is `raw_w x raw_h` (for example `2400 x 800`), first resize width to `out_w` (`1920 x 640`) and center-crop height to `out_h` (`1920 x 400`):

```bash
/usr/bin/magick "/tmp/crops/banner_nanobanana_raw.png" \
  -colorspace sRGB -strip -filter Lanczos \
  -resize "1920x" -gravity center -crop "1920x400+0+0" +repage \
  "/tmp/crops/banner_2x.png"
```

---

## 3. invocation patterns across environments

### 3.1 google internal cli (`gempix-1`)

- Always split sandboxed prep (`magick` crop/pad, `BypassSandbox: false`) from the unsandboxed `gempix` binary call (`BypassSandbox: true`), then run sandboxed post-resize (`BypassSandbox: false`).
- **Never** pass `-no-thoughts`—reasoning keeps object proportions, clasp hardware, and perspective lines locked to the source crop.
- Use `--image_size=2k` for standard cards/heroes (`<= 2048px` target long edge) and `--image_size=4k` for full-bleed wide desktop heroes (`> 2048px` target long edge).

### 3.2 jetski `image-generator` subagent

```text
invoke_subagent(
  TypeName="image-generator",
  Role="Nano Banana 2x Retina Upscaler",
  Prompt="Load low-res crop /tmp/crops/card_01_lowres.png (420x520) and generate a faithful 2x Retina restoration saved to /tmp/crops/card_01_raw.png using strict 1:1 subject, palette, lighting, and geometry preservation (zero invented elements, zero plastic smoothing). Return the saved output path."
)
```

### 3.3 react `<img>` mounting rule (preventing tailwind v4 shrink)

Tailwind v4 preflight sets `img { max-width: 100%; height: auto; }`. Mount every `2x` Retina plate inside an explicit container with `w-full h-full object-cover max-w-none` and intrinsic `width={cssW}` `height={cssH}` so layout stability (`CLS = 0.00`) and `eval-image-to-react.mjs` framing stay 100% locked.
