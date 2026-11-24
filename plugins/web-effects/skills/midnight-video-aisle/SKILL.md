---
name: midnight-video-aisle
description: Build a first-person Three.js WebGL modular corridor with exponentially damped camera rig, center-raycasted shelf item highlighting, and a two-stage shelf-clearance plus Bezier-spring pull-out and hand-inspection interaction. Use when implementing an interactive 3D aisle, archive wall, record rack, product shelf, or museum vitrine where users glide down a repeating corridor, hover items by reticle, pull them clear of neighbouring geometry, and rotate or flip them in hand.
---

# Midnight Video Aisle

Clear the shelf lip along the item's outward normal first, then arc it into a viewport-fitted hand-inspect pose on an underdamped Bezier spring inside an exponentially-damped corridor rig — remove the two-stage clearance or frame-rate-independent damping and pulled items clip through adjacent spines while camera motion turns framerate-dependent.

**Verified stack:** Vanilla JavaScript · WebGL · Three.js (plus optional GLSL post-processing); DOM / CSS interface.

**Boundary:** Reach for `add-mouse-driven-orbit` when a single hero object floats in empty space and only needs pointer-driven camera orbit. Reach for `build-threejs-scroll-worlds` when scroll progress drives a fixed spline camera across chapters without first-person raycasted item pickup. Reach for `threejs-web` for general Three.js scene setup. Use **Midnight Video Aisle** when the user walks or glides inside a narrow, modular shelf corridor and pulls dense shelf items into an interactive close-up inspection pose.

---

## 1. Frame-Rate-Independent Damping (`damp`)

Drive every camera axis, velocity, eye height, and hover alpha through exponential decay instead of `lerp(a, b, k)`:

```js
export function damp(curr, target, lambda, dt) {
  return curr + (target - curr) * (1 - Math.exp(-lambda * dt));
}
```

- **Failure prevented:** Raw `lerp(a, b, 0.1)` runs twice as fast at 120 Hz as at 60 Hz and stalls at 30 Hz.
- Clamp `dt <= 1 / 30` (`0.0333` s) on every frame so tab switches or GC pauses never teleport the camera through shelf colliders.

## 2. Corridor Rig, Chunk Streaming & Dynamic FOV

Keep the corridor infinite without allocating unbounded geometry by recycling `CHUNKS_AHEAD + CHUNKS_BEHIND + 1` modular aisle segments around the active chunk index `Math.floor(-cameraZ / CHUNK_LENGTH)`.

| Parameter | Value | Purpose / Failure Prevented |
| --- | --- | --- |
| `CHUNK_LENGTH` | `4.8` m | Module length; keeps modulo seam wrapping deterministic |
| `CHUNKS_AHEAD` / `CHUNKS_BEHIND` | `3` / `3` | `7` active chunks; hides pop-in behind distance fog |
| `AISLE_HALF_WIDTH` | `0.85` m | `1.70` m corridor width; clamp player X within `±(0.85 - 0.25)` |
| `PLAYER_RADIUS` | `0.25` m | Prevents near-plane clipping into shelf faces |
| `EYE_HEIGHT` / `CROUCH_EYE_HEIGHT` | `1.62` m / `1.0` m | Standing vs. lower-tier shelf inspection height (`lambda = 7`) |
| `SHELF_HEIGHT` / `CEILING_HEIGHT` | `2.15` m / `2.9` m | Keeps upper signage and ceiling fixtures in frame at 68° FOV |
| Dynamic vertical FOV | `68 + clamp(1.3 - aspect, 0, 0.9) * 26` | Widens from `68°` (desktop 16:9) to `~89°` (portrait 390×844) so both shelves stay visible |
| Look smoothing / pitch clamp | `lambda = 28`, `[-1.35, 1.35]` rad | Smooths pointer-lock and drag deltas without gimbal flip |
| Walk / Run / Sprint / Crouch | `1.4` / `2.8` / `5.6` / `0.75` m/s | Ground accel `lambda = 9`, decel `lambda = 7.5` |
| Jump & Landing spring | `vy = 3.0`, `g = 9.8` | Landing bounce `k = 115`, damping `c = 13` |

## 3. Center-Raycast Hover & Wireframe Highlight

Cast a ray from the camera center `(0, 0)` along world forward `(0, 0, -1)` up to `reach = 1.7 * handScale` m:

- **Wireframe box:** Build an `EdgesGeometry` around `(w + 0.006, h + 0.006, d + 0.006)` with `AdditiveBlending` and `depthWrite: false`.
- **Pulse & fade:** Damp hover `alpha` with `lambda = 14` in and `lambda = 10` out; drive opacity as `alpha * (0.42 + 0.1 * Math.sin(t * 4.2))`.
- **Dwell preload:** Only trigger high-resolution cover/detail hydration when hover dwell reaches `>= 0.25` s. Fast mouse sweeps across 40 spines must not queue 40 texture uploads.

## 4. Two-Stage Pull-Out & Hand-Inspect State Machine

Never arc an item straight from its shelf slot to the camera. Split pickup into two ordered stages and return in reverse:

| Stage | Timing / Formula | Rule & Failure Prevented |
| --- | --- | --- |
| **1. Normal clearance** | `0 <= t < 0.24` s, `easeInOutSine` `-(cos(PI * u) - 1) / 2` | Slide along shelf outward normal by `min(0.2, extent + 0.022)` m plus `+0.004` m up. Skipping this clips the item through neighbouring spines and shelf lips. |
| **2. Bezier + spring** | `0.24 <= t <= 0.70` s, quadratic Bezier `ctrl = outPos + outward * 0.11 + up * 0.07` | Drive position with an underdamped spring (`omega = 11.5`, `zeta = 0.68`) toward `handPos`. |
| **Leading rotation** | `t_rot = max(0, t - 0.03)` (`omega = 10.58`, `zeta = 0.612`) | Slerp toward `handQuat * restQuat` (`Euler(0.03, 0.13, -0.015, 'YXZ')`). Delaying rotation by `30` ms prevents mechanical lock-step with translation. |
| **Viewport fit distance** | `max(0.26 * bs, fitHeight, fitWidth)` at `fill = 0.86`, min zoom `0.13 * bs` | Keeps the inspected item at 86% of the limiting viewport dimension across 1440×900 and 390×844. |
| **Inspect orbit & flip** | Drag `delta * 0.0065` rad/px, vel smooth `lambda = 25`, coast `exp(-3.2 * dt)` | Flip tween rotates `PI` rad around local Y in `0.55` s (`easeInOutCubic`); wheel zoom `distTarget += delta * 0.00035 * bs` damped at `lambda = 10`. |
| **Return to slot** | `0.46` s Bezier (`easeInOutCubic`) -> `0.20` s slide (`easeOutCubic` `1 - (1 - u)^3`) | Reverses Stage 2 then Stage 1 so the item seats cleanly back between its neighbours. |

## 5. Expensive Gotchas (Symptom-First)

- **Pulled item slices through adjacent spines or shelf rail on pickup:** You interpolated directly from `slotPos` to `handPos`. Execute Stage 1 (`0.24` s outward normal slide) to `outPos` before starting the Stage 2 Bezier arc.
- **Inspect lighting or procedural cover textures look washed-out or crushed:** Procedural `CanvasTexture` assets default to linear unless marked `texture.colorSpace = THREE.SRGBColorSpace` under `ACESFilmicToneMapping`.
- **Pointer lock throws `SecurityError` / `pointerlockerror` in embedded frames or after Escape:** Always attach a drag-to-look fallback on `pointerdown` / `pointermove` so navigation works identically when pointer lock is unavailable or declined.
- **Canvas initializes at `0x0` or stretches after mobile orientation change:** Size the renderer inside a `ResizeObserver` and early-return when `width === 0 || height === 0`; recalculate the dynamic vertical FOV on every resize.
- **Chunk recycling pops visible shelves at `z % 4.8`:** Position chunks using `Math.floor(-cameraZ / CHUNK_LENGTH)` and keep fog end inside `CHUNKS_AHEAD * CHUNK_LENGTH` (`14.4` m).

## 6. Accessibility, Lifecycle & Performance Budgets

- **Reduced motion (`prefers-reduced-motion: reduce`):** Render a **designed still frame** of the lit corridor and featured shelf item; keep all inspect, flip, crouch, and step controls live, snapping transitions directly to their resting poses with zero camera bob, light flicker, or spring oscillation.
- **Visibility & viewport pause:** Pause the `requestAnimationFrame` loop on `document.hidden` and when an `IntersectionObserver` reports the canvas off-screen; reset `lastTime = performance.now()` on resume.
- **DPR & fill-rate budget:** Cap DPR at `min(dpr, 1.5)` on desktop and `min(dpr, w * h > 5e5 ? 1 : 1.25)` on coarse-pointer mobile.
- **Measured cost lever:** Per-frame `BoxGeometry` / texture allocation during chunk streaming stalls frames far more than triangle count. Pre-build a shared unit `BoxGeometry` and a fixed procedural texture atlas (`<= 16` cached `CanvasTexture` variants) and reuse mesh pools across recycled chunks.
- **Controls:** Expose crouch, light/inspect, flip, and reduced-motion as real `<button>` elements with visible `:focus-visible` outlines, optical vertical centering (`padding-top` `+2px` over `padding-bottom`), and an `aria-live="polite"` status region announcing hovered/inspected items.

## 7. Provenance

Extracted from **Midnight Video** (`midnightvideo.cuchillo.rocks`) by Cuchillo / Javier Corrales, a WebGL2/Three.js liminal VHS rental store where visitors walk an endless procedural aisle and pull/inspect ~10,000 cataloged tapes.
