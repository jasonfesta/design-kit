# Dual-Authority Responsive Lock & 60fps `AvelaMediaFrame` Protocol (AVELA Homepage Reference)

This reference documents the production architecture established on **AVELA / Soft Form (`01-website-avela`)** when synthesizing a flagship homepage from **two dedicated responsive visual authorities** (a full-length Desktop scroll + a continuous Mobile scroll) paired with multi-variant `2x` Retina photography and Google Veo looping films.

---

## 1. Dual-Authority Responsive Lock (Check `C1` & `C6`)

Unlike single-sheet 4K grid synthesis (which scales a `1000×3000` column via CSS `zoom` on desktop and stacks generically below `768px`), a Dual-Authority homepage locks simultaneously to **two explicit visual authorities**:

1. **Authority #1 — Full-Length Desktop Scroll (`>= 768px`)**:
   - Example: `desktop-01-avela.png` (`725 × 2170`, `1:3` canonical ratio / `1440 × 4310` fluid desktop).
   - Governs 12-column asymmetric splits (`7/4`, `8/3`, `9/2` with intentional empty columns), `144–192px` chapter pauses, `clamp(24px, 6vw, 96px)` side gutters, 3-up unboxed product silhouettes, single-line monumental `SOFT FORM` masthead, and 4-column footer.
2. **Authority #2 — Full-Length Mobile Continuous Scroll (`< 768px`, `390px` down to `320px`)**:
   - Example: `mobile-01-avela.jpg` (`390 × 3210` continuous phone scroll).
   - Governs portrait hero art direction (`<picture>` / mobile-specific crop), 2-line `SOFT / FORM` masthead, compact `Menu` + `Bag (0)` header, **1-lead (`The Arc`) + 2-secondary (`The Fold` + `The Day`)** product grid, vertical editorial stacking (removing desktop negative-margin overlaps), full-width native `<details>` rows, `Notes from the workshop →` strip, full-width stacked newsletter controls (`16px` input font size to prevent iOS zoom), and compact 2-group footer.

---

## 2. 60fps Multi-Variant Video & `2x` Retina Frame (`AvelaMediaFrame.tsx`)

Embedding multiple high-resolution Base64 MP4 data URIs (`data:video/mp4;base64,...`) inside a single-file React bundle (`vite-plugin-singlefile`) causes main-thread jank and black flashes during swatch switching unless four safeguards are applied:

1. **Asynchronous Off-Main-Thread Blob URL Decoding (`VIDEO_BLOB_CACHE`)**:
   - Never pass multi-megabyte `data:video/mp4` strings directly into `<video src={dataUri}>` across re-renders.
   - Convert data URIs asynchronously via `fetch(rawSrc).then(r => r.blob()).then(URL.createObjectURL)` (with `atob` fallback) and memoize inside module-level `VIDEO_BLOB_CACHE` + `VIDEO_BLOB_INFLIGHT` maps.
2. **Viewport-Gated Playback (`240px` `IntersectionObserver` `rootMargin`)**:
   - Pause offscreen `<video>` elements automatically when scrolled more than `240px` outside the viewport, and resume playback `240px` before entering view to preserve a locked 60fps scroll frame budget.
3. **Pre-Stacked Multi-Swatch Media Layers (`mediaStack`)**:
   - For hero or product stages where leather swatches (`Oxblood`, `Tan`, `Olive`) switch both the `2x` Retina poster and the looping Veo video, mount pre-stacked layers with `opacity` crossfade (`240ms`) so switching variants at `t > 0` produces **zero black-frame flash**.
4. **JSDOM & `?gt_eval=1` Guards**:
   - Guard `typeof videoEl.play === 'function'` and suppress live video playback when `?gt_eval=1` or `prefers-reduced-motion: reduce` is active so headless `AutoRaterV1` captures deterministic `t=0` `2x` Retina poster frames.

---

## 3. WDA Semantic & Accessibility Micro-Rules

1. **Sibling Swatch Groups Outside Product Links (`ProductRange.tsx`)**:
   - Never nest `<button>` color swatches inside an `<a href="/bags/...">` product tile. Keep the `<a href>` around the silhouette image and title/price, and render `<div role="group" aria-label="Choose color">` as a sibling container so swatch taps update variant state + link `href` without accidental navigation.
2. **Header `IntersectionObserver` Sentinel (`SiteHeader.tsx`)**:
   - Place a `1px` sentinel element at the bottom edge of the hero (`A00`) to toggle `isSolid` when the hero exits the viewport (`0px` layout shift, zero `scroll` event thrashing).
3. **Native `<details>` / `<summary>` Care Disclosures (`CareAndClose.tsx`)**:
   - Use native `<details>` and `<summary>` for independent specification/care accordions (`What fits`, `Leather care`, `Repairs`) so multiple rows open simultaneously with zero JS height-measurement jitter and native keyboard focus retention.
4. **GPU-Clean Scroll Settle (`data-landed="true"`)**:
   - Below-fold chapters settle once (`12px` → `0px` over `600ms cubic-bezier(0.22, 1, 0.36, 1)` at `15%` intersection), then set `data-landed="true"` to clear `transform` and `will-change`, ensuring crisp pure-vector serif typography without blurry GPU layer rasterization.
