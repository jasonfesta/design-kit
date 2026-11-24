# Layering, Transparent Viewport Isolation, Control Locking & Iframe Bridge

This document captures the critical structural rules learned and verified across multi-stage Design Kit Jig deployments so that floating Jig bars, right-hand `.dk-panel` inspectors, multi-donor variant notches, and shared `<iframe>` / WebGL stages never occlude or conflict with one another.

---

## 1. The Transparent Viewport & Shared Stage Host Rule

When a showcase or multi-view application mounts a persistent shared stage host (such as a 3D WebGL `<canvas>` host or a 9:16 mobile app `<iframe>` host like `#mappSharedHost` at `z-index: 4`) while elevating `.slides-viewport` (e.g., to `z-index: 12`) so right-hand `.dk-panel` controls inside the active slide remain clickable:

1. **Root Backdrop Owns the Solid Color (`#000000` or `var(--bg)`)**:
   ```css
   :root,
   html,
   body,
   .layout,
   .toc,
   .stage {
     background: #000000 !important;
     background-color: #000000 !important;
   }
   ```
2. **Viewport & Slide Wrappers MUST Be Transparent (`rgba(0, 0, 0, 0)`)**:
   ```css
   .slides-viewport,
   [data-jig-stage-viewport],
   .slide,
   .fit-stage,
   .fit-target {
     background: transparent !important;
     background-color: transparent !important;
   }
   ```
   - **Why**: If `.slides-viewport` is given an opaque background (`background: #000000 !important`) and its `z-index` rises above a shared stage host (`z-index: 12` > `z-index: 4`), `.slides-viewport` becomes an opaque black curtain that completely hides the shared stage host underneath it. Keeping `.slides-viewport` transparent ensures the root `#000000` backdrop shows through cleanly while shared stage hosts at `z-index: 4` remain 100% visible and interactive.

---

## 2. Top Library & Theme Toggle Lock Modes

The Top UI Library plate (`.floating-lib-plate`) supports three distinct operational states depending on what kind of stage is active:

| Mode | Trigger Attribute / Class | `shadcn · ease · fluid` | `☾` / `☀` Theme Toggle | Bottom `motion-craft` Label | Bottom `▶` Play Button |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard (Full-Stack / UI)** | Default | `100%` active | `100%` active | `100%` active | `100%` active |
| **Immersive (`3d`, `parallax`, `shader`)** | `body.imm-exp-active` or `data-imm-libs-disabled="true"` | Dimmed (`opacity: 0.25`, `pointer-events: none`) | `100%` active | Dimmed (`opacity: 0.25`, `pointer-events: none`) | `100%` active |
| **App Exploration (`menu`, `cards`, `bg`, `app`)** | `body.mapp-stage-active` or `data-app-libs-disabled="true"` | Dimmed & locked (`opacity: 0.28`, `pointer-events: none`) | Dimmed & locked (`opacity: 0.28`, `pointer-events: none`) | Dimmed (`opacity: 0.25`, `pointer-events: none`) | `100%` active |

---

## 3. Cross-Iframe `postMessage` & CustomEvent Bridge

Every interaction on the Jig broadcasts both a DOM `CustomEvent` on `window` and a structured `postMessage` payload to all child `<iframe>` elements:

### Style & Multi-Donor Variant Selection
- **Top Style Bar Click (`clone .. retro`)**:
  - Sets `data-jig="<slot>"` and `data-style="<slot>"` on `<html>` and `<body>`.
  - Posts `{ type: 'SET_STYLE', style: '<slot>' }` to child iframes.
- **Right-Side Variant Notch Click (`1/N .. N/N`)**:
  - Sets `data-style-variant="0..4"` on `<html>` and `<body>`.
  - Dispatches `window.dispatchEvent(new CustomEvent('jig-style-variant', { detail: { style, variant, label, file, formation } }))`.
  - Posts `{ type: 'SET_STYLE_VARIANT', style, variant, label, file, formation }` to child iframes.

### Right-Hand `.dk-panel` Scrubbing & Presets
- Updates `:root` CSS variables (`--jig-3d-*`, `--jig-kp-*`, `--jig-shd-*`).
- Dispatches `window.dispatchEvent(new CustomEvent('style-jig:immersive-change', { detail: { mode, key, params, reset } }))`.
- Posts `{ type: 'JIG_IMMERSIVE_PATCH', mode, params, reset }` (plus `{ type: 'CUBOID_PATCH', ...params }` for `3d` and `{ type: 'SILK_SYNC', params }` for `shader`).

---

## 4. Zero-Scrollbar Enforcement Across Host & Iframes

Neither the host stage nor any embedded child `<iframe>` may render visible browser scrollbars:
- Include `.no-scrollbar` or call `window.JigAgent.injectNoScrollbarStyles(iframe)` when mounting `srcdoc` or same-origin `<iframe>` stages.
