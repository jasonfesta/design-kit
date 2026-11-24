# Style Jig Runtime Specification — Layering, Safe-Zone, Auto-Detecting Immersive Jig & Unscripted Auto-Traveler

This reference documents the DOM contract, CSS token surface, custom schema hooks, `postMessage` sync protocol, and unscripted `motion-craft` Auto-Traveler built into `templates/TopStyleJig.tsx` (React 19) and `templates/style-jig-runtime.js` + `templates/style-jig.css` (Vanilla HTML/JS).

---

## 1. Hard Layering & Safe-Zone Contract

### Stacking Context Rules
- **Jig Plates (`z-index: 2147483640`)**:
  - `.top-jig-wrap`, `.bottom-motion-wrap`, `[data-style-jig="true"]`, `[data-style-jig-bottom="true"]`, and `.dk-panel` (`[data-immersive-jig="true"]`) all enforce `z-index: 2147483640`.
  - Outer horizontal bar wrappers set `pointer-events: none`; inner `.floating-style-plate`, `.floating-lib-plate`, `.floating-motion-plate`, and `.dk-panel` islands set `pointer-events: auto`.
- **Isolated Back Stage (`z-index: 1`)**:
  - The host stage container (`.stage`, `.slides-viewport`, `.jig-stage-back`, or `<SafeZoneStage>`) enforces:
    ```css
    position: relative;
    z-index: 1;
    isolation: isolate;
    ```
  - Even if an internal component popover or modal uses `z-index: 99999`, `isolation: isolate` traps its stacking context inside `z-index: 1`, guaranteeing it can **never** cover any jig plate.

### Component Safe-Zone Centering (`>= 76px`)
- Component/app stages (`.jig-safe-stage` / `<SafeZoneStage mode="component">`) enforce:
  - Desktop (`>= 980px`): `padding-top: 76px; padding-bottom: 76px; padding-left: 24px; padding-right: 24px;`
  - Narrow / Wrapped Top Bars (`< 980px`): `padding-top: 108px; padding-bottom: 76px;`
- Inside the safe zone, `.fit-target` scales proportionally via `ResizeObserver`:
  ```js
  const scale = Math.min(1, availWidth / naturalWidth, availHeight / naturalHeight);
  target.style.transform = `scale(${scale.toFixed(4)})`;
  ```

---

## 2. Theme Surface & Matte Backplate Tokens (`Dark ↔ Light`)

Toggling the `☾` / `☀` button in the `shadcn · ease · fluid` library bar switches `data-theme="dark" | "light"` on both `document.documentElement` and `document.body`:

```css
:root,
[data-theme="dark"] {
  --bg: #0c0c0b;
  --plate: #151514;
  --g1: #141413;
  --g2: #1d1d1b;
  --g3: #252522;
  --g4: #2c2c29;
  --fg: #ededec;
  --muted: #858481;
  --faint: #52524e;
  --dk-fill: rgba(237, 237, 236, 0.08);
  --dk-fill-drag: rgba(237, 237, 236, 0.15);
  --dk-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
}

[data-theme="light"] {
  --bg: #f5f4f0;
  --plate: #e7e5df;
  --g1: #eceae4;
  --g2: #dcd9d0;
  --g3: #d0cdc3;
  --g4: #c2beb3;
  --fg: #18181b;
  --muted: #575652;
  --faint: #87857e;
  --dk-fill: rgba(24, 24, 27, 0.09);
  --dk-fill-drag: rgba(24, 24, 27, 0.16);
  --dk-shadow: 0 12px 30px rgba(24, 24, 27, 0.10);
}
```

---

## 3. Immersive View Auto-Detection & Right / Lower-Right Drag Jig

### Detection Priority
`detectImmersiveLayer(activeStageEl)` inspects the currently visible slide or stage:
1. `data-hide-immersive-jig="true"` or `data-immersive-layer="assembled" | "none"` → returns `null` (hides inspector cleanly on unified presentation stages).
2. `data-immersive-layer="3d" | "parallax" | "shader"` (or custom registered key) → mounts that inspector.
3. **Zero-Config Heuristics** on visible descendants:
   - **`3d`**: `canvas[data-engine*="three"]`, `[data-r3f-canvas]`, `[data-3d-scene]`, `iframe[name*="cuboid"]:not([name*="overlay"])`, or `window.__JIG_3D__`.
   - **`shader`**: `canvas.imm-shader-canvas`, `canvas[data-shader]`, `[data-shader-uniforms]`, or `.silk-blend-gradient` without a 3D overlay iframe.
   - **`parallax`**: `.kp-scroll-canvas:not(.transparent-over-shader)`, `[data-parallax-stage]`, or `[data-k-section]` + `[data-k-role]`.

### Placement Options
- **`placement="lower-right"`** (default when top & bottom bars are visible): `position: fixed; right: 20px; bottom: 68px;` — sits cleanly in the lower-right corner above the `motion-craft` bar without colliding with top bars or centered headlines.
- **`placement="right-center"`**: `position: fixed; right: 20px; top: 50%; transform: translateY(-50%);`.
- **Custom Stylized Jig Backplate Dropdown (`BackplateDropdown` / `.dk-dropdown`, zero native `<select>`, zero dot indicators)**:
  - Trigger button: matte recessed pill (`background: var(--g2)`, hover/open `var(--g3)`, `border-radius: 10px`, `height: 32px`, `padding: 0 11px`), `Google Sans Flex` `12.5px` lowercase active label on left + custom SVG chevron rotating `180deg` smoothly when open.
  - Pure floating popover menu (`position: absolute; top: calc(100% + 5px); left: 0; right: 0; z-index: 60;` over `.dk-panel { overflow: visible }` so opening it never shifts sliders or panel height): `background: var(--plate)`, `border: 1px solid var(--dk-menu-border)`, `border-radius: 12px`, `padding: 5px`, soft elevation shadow `var(--dk-menu-shadow)`, where each shader option (`silk blend`, `mesh drift`, `ink ridges`, `gradient mesh`, `ascii art`) is a clean tactile `29px` backplate row (`border-radius: 8px`, `background: var(--g2); color: var(--fg); font-weight: 500;` when active/hovered, zero dot indicators), over the 6 clean scrub controls (`angle`, `wave`, `distortion`, `soften`, `vignette`, `grain` — no color stop swatch rows). Closes on select, outside click, or `Escape`.
- **9 Folder-Backed Style Slots, Dimmed Libraries + `motion-craft` on Immersive Views (`25%` Alpha), and Parallax Reset**:
  - Style Bar is locked strictly to the 9 folder-backed slots `['clone', 'clean', 'grid', 'editorial', 'cinematic', 'product', 'brutal', 'playful', 'retro']` (`styles/<slot>/`), shared by both `full stack` and `immersive` views (defaulting to `clone`).
  - Whenever an immersive view (`3d`, `parallax`, `shader`, `immersive`, or `assembled`) is active (`disableLibraries` / `data-imm-libs-disabled="true"` / `body.imm-exp-active`), BOTH the UI coding library buttons (`shadcn · ease · fluid`) AND the `motion-craft` label button (`[data-motion-pick]`) render uniformly in inactive gray (`var(--muted)`, `font-weight: 400`) at `opacity: 0.25` with `pointer-events: none`, while the Moon/Sun (`☾` / `☀`) theme toggle AND the Play/Stop (`▶` / `■`, `[data-auto-toggle]`) button remain 100% active, full-opacity, and working.
  - **Parallax Jig Reset (`resetImmersiveMode('parallax')` / `JigAgent.resetParallaxJig()`)**: Restores default parallax sliders, resets the active style/font back to **`clone`**, and scrolls all parallax containers (`.kp-scroll-canvas`, `[data-parallax-stage]`) back to **`scrollTop = 0`**.
- **Standalone `immersive` Agent Overview Card (`mode === 'immersive'`)**: Titled simply **`immersive`** (with zero `3d / parallax / shader` sub-words) and 5 clean draggable scrub sliders (`depth`, `motion`, `wave`, `soften`, `grain`) for Jig Agent overview views (`data-immersive-layer="immersive"`).
- **Compact Bottom Motion Plate**: `.floating-motion-plate` uses `padding: 7px 10px 7px 14px; gap: 8px;` with a tight `18×18px` `.jig-play-btn` (`padding: 0; margin: 0;`) so there is zero excess space around `motion-craft ▶`.

### Custom Schema Registration Hook
Any 3D, Parallax, or Shader module can register or override controls dynamically without modifying `style-jig`:

```ts
window.__JIG_IMMERSIVE_SCHEMA__ = {
  '3d': {
    title: '3d',
    words: { key: 'shapeType', options: ['chain', 'helix', 'ring', 'wave', 'arch'] },
    sliders: [
      { key: 'count', label: 'count', min: 3, max: 14, dec: 0 },
      { key: 'gap', label: 'gap', min: 0, max: 0.6, dec: 2 },
      { key: 'scrollSpeed', label: 'scroll', min: 0, max: 2.0, dec: 2 },
      { key: 'rotSpeed', label: 'spin', min: 0, max: 2.0, dec: 2 },
      { key: 'camZ', label: 'depth', min: 4.0, max: 10.0, dec: 1 },
    ],
    swatches: [{ key: 'cuboidColor', label: 'surface' }],
    defaults: {
      shapeType: 'chain',
      count: 8,
      gap: 0.01,
      scrollSpeed: 0.6,
      rotSpeed: 0.57,
      camZ: 6.2,
      cuboidColor: '#242424',
    },
  },
};
```

### Live Sync Bridge (`CustomEvent` + CSS Vars + `postMessage`)
Every drag scrub, word select, toggle, swatch edit, or `reset` broadcasts across three channels:
1. **CSS Custom Properties** on `:root`: `--jig-<mode>-<kebab-key>` (e.g. `--jig-3d-cam-z: 6.2`, `--jig-kp-head-speed: -0.09`, `--jig-shd-angle: 170`).
2. **DOM CustomEvent** on `window`:
   - `style-jig:immersive-change` with `{ detail: { mode, key, value, params, reset } }`
3. **Iframe `postMessage`** to all stage `<iframe>` windows:
   - `3d` mode → `{ type: 'CUBOID_PATCH', ...params, reset }` + `{ type: 'JIG_IMMERSIVE_PATCH', mode: '3d', params }`
   - `shader` mode → `{ type: 'SILK_SYNC', params }` + `{ type: 'JIG_IMMERSIVE_PATCH', mode: 'shader', params }`
   - `parallax` / assembled stage → `{ type: 'IMMERSIVE_SCROLL', smoothY, progress }` and `{ type: 'IMMERSIVE_POINTER', nx, ny, click, leave }`

---

## 4. Unscripted View-Detecting Auto-Traveler (`motion-craft` `▶`)

When `▶` is toggled ON (`data-style-auto="true"`):
1. **Active Root Resolution**: Locates the currently visible stage container (`.slide.active`, `[data-jig-stage-active="true"]`, `main`, or `document.body`), excluding all jig chrome (`[data-style-jig]`, `[data-style-jig-bottom]`, `[data-immersive-jig]`, `.top-jig-wrap`, `.bottom-motion-wrap`, `.dk-panel`, `.toc`, and `[data-auto-ignore]`).
2. **Smooth Scroll Travel**:
   - Finds visible scrollable elements (`el.scrollHeight > el.clientHeight + 20` and `overflowY` in `auto | scroll | overlay`).
   - Glides smoothly downward and upward in a ping-pong wave (`~1.6px–2.4px/frame` at 60fps with soft sine turnaround dwell at top/bottom and brief pauses at `[data-k-section]` / `section` boundaries).
3. **Synthetic Pointer & Safe Control Discovery**:
   - Sweeps normalized pointer coordinates (`pointerenter` + `pointermove` + `IMMERSIVE_POINTER` `postMessage` to 3D iframes) across visible `[data-k-role]`, `.wheel-card`, `<canvas>`, and interactive pills so magnetic hover lifts and 3D card tilts respond live.
   - Every `1600ms`, selects the next visible, safe interactive control inside the active view (`button:not([disabled])`, `[role="tab"]`, `[data-fill-target]`, `[data-tag-box]`, `[data-pop-toggle]`, `[data-cycle-values]`, `[data-c3d-shape]`, non-destructive toggles) and triggers a genuine `.click()` or sample prompt fill — requiring **zero** per-page walkthrough scripts.
4. **User Interrupt Safety**: Clicking `■` or pressing `Escape` immediately halts auto-travel and dispatches `pointerleave` cleanup.

---

## 5. Relationship to `3d-ui-jig`
- Use **`style-jig`** everywhere as the top/bottom/right floating harness across styles, `shadcn · ease · fluid` UI libraries, Dark/Light theme, `motion-craft` auto-travel, and automatic `3d` / `parallax` / `shader` floating parameter scrubbing.
- Pair with **[`3d-ui-jig`](../../3d-ui-jig/SKILL.md)** when scaffolding a dedicated Golden Template Three.js scene (`src/three/rig/` + `src/three/scenes/<id>/`) that needs procedural PMREM studio domes, per-frame shadow-frustum fitting, `CanvasTexture` card editors, and `Copy Prompt` GLSL exporters.
