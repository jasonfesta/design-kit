# Design Kit Jig + Standalone 3D Formations (`chain`, `helix`, `ring`, `wave`, `arch`) — Master Prompt

> **Hosted x20 Link (World-Readable for All Googlers)**
> - **Hosted Markdown (`.md`)**: https://x20web.corp.google.com/users/jf/jfesta/www/style-jig-3d-prompt.md

---

## Copy-Pasteable Prompt

```markdown
Build a standalone, full-viewport Three.js 3D sculptural cuboid scene (`chain`, `helix`, `ring`, `wave`, `arch`) with **zero background** connected directly to the borderless **Design Kit Jig** harness. The 3D WebGL canvas owns 100% of the viewport (`100vw × 100vh`) on first load with zero skyboxes, zero backdrop shaders, zero floor grids, and zero crowded panels blocking the frame.

### 1. Stage Environment & No-Background 3D Canvas (`100vw × 100vh`)
- **Zero Background Rule**:
  - Mount the Three.js `<canvas>` at `position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 10;` with `WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })` and `renderer.setClearColor(0x000000, 0)`.
  - Render **no background plane, no silk/mesh/gradient/ink wallpaper, no skybox dome, no fog wall, and no floor grid** (`backdrop.show = false`). Only the floating 3D cuboid formation exists in open space over the pure root stage canvas (`#000000` in Dark Mode or `#FAF9F6` warm architectural paper in Light Mode).
  - Clamp `devicePixelRatio` (`Math.min(window.devicePixelRatio, 2)`), use `NeutralToneMapping`, and **do not add low-threshold bloom** (no bloom whiteout; let clean procedural PMREM softbox reflections catch the beveled cuboid edges).
- **Centered Camera Rig**:
  - `PerspectiveCamera(65, width / height, 0.1, 100)` anchored at `[0, 1.1, camZ]` (default `camZ = 6.2`) looking at `(0, 0, 0)`.
  - Damped pointer-follow camera parallax (`tiltDeg: 15`) keeps the formation optically centered at `(50vw, 50vh)` while responding gently to pointer movement and wheel scroll.

### 2. The 3D Cuboid Geometry, Materials & 5 Formations (`chain`, `helix`, `ring`, `wave`, `arch`)
- **Beveled Rounded Cuboid Geometry**:
  - Procedural rounded-bevel cuboids (`width: 1.65`, `height: 1.65`, `depth: 1.65`, `cornerRadius: 0.11`, `bevelSize: 0.032`, `bevelThickness: 0.04`, `smoothness: 32`).
  - Physically based material (`MeshStandardMaterial` / `MeshPhysicalMaterial`, default `roughness: 0.42`, `metalness: 0.46`, `color: #121316`) lit by 3 directional/hemisphere studio lights (`ambient: 0.38`, `top: 3.1`, `bottom: 2.15`, `key: 5.0`) plus a procedural `PMREMGenerator` studio softbox environment map (key, fill, and rim light panels — zero external HDRI files).
- **5 Live-Switchable Spatial Formations (`shapeType`)**:
  Compute `strideX = width + gap`, `groupWidth = count * strideX`, `centerOffset = (count - 1) * strideX / 2`, `x = tileIndex * groupWidth + itemIndex * strideX - centerOffset`, and `yPos = x + groupOffsetX` (with seamless infinite horizontal conveyor tiling for `chain`, `wave`, and `helix`; default `count = 8`, `gap = 0.01`, `radius = 4.5`, `amplitude = 1.4`):
  1. **`chain`**: Seamless horizontal linear chain (`x`, `y: 0`, `z: 0`, `rotY: 0`, `rotZ: 0`) with staggered X-axis tumble (`rotation.speed = 0.57`, `rotation.stagger = 0.37`).
  2. **`wave`** *(default)*: 3D sinusoidal ribbon (`x`, `y: sin(yPos * 0.55) * amplitude`, `z: cos(yPos * 0.55) * amplitude * 0.35`, `rotZ: cos(yPos * 0.55) * min(0.25, amplitude * 0.08)`).
  3. **`helix`**: Continuous 3D corkscrew helix (`w = yPos * (2π / max(groupWidth, 4)) + scrollOffset * 0.25`; `x`, `y: sin(w) * amplitude`, `z: cos(w) * (radius * 0.4)`).
  4. **`ring`**: Closed orbital figure-8 ring (`w = (itemIndex / count) * 2π + scrollOffset * 0.28`, `M = max(1.5, radius)`; `x: sin(w) * M`, `y: sin(w * 2) * amplitude * 0.15`, `z: cos(w) * M - M * 0.45`, `rotY: w`).
  5. **`arch`**: Parabolic architectural bridge (`w = itemIndex / (count - 1) * 2 - 1`, `M = max(radius * 2, count * strideX * 0.85)`; `x: w * (M * 0.5)`, `y: (1 - w²) * amplitude * 1.35 - amplitude * 0.45 + sin(scrollOffset * 0.35 + itemIndex * 0.35) * amplitude * 0.08`, `z: -|w| * (radius * 0.28)`, `rotY: -w * 0.18`, `rotZ: -w * 0.24`).
- **Tactile Hover Rollover & Click-to-Focus Physics**:
  - **Hover**: Raycasted pointer hover kicks the hovered cuboid's rotational target by `+1.25π` plus continuous `+1.85 rad/s` spin via a damped spring (`stiffness: 38`, `damping: 10.5`), pops it forward `+0.24` on `+Z`, scales it `+3.5%`, and smoothly slows conveyor travel to `35%`.
  - **Click-to-Focus**: Clicking a cuboid smoothly zooms it to center-front (`featuredZ: -1.05`, `cameraZ: 4`), flies neighboring cuboids cleanly out to the sides (`flyOutExtra: 8`), and maps pointer movement to interactive inspection tilt (`cuboidTiltDeg: 33.5`). Clicking empty space smoothly returns to the active formation.

### 3. Connecting the Design Kit Jig Directly to the 3D Scene (`z-index: 9999`)
Float the borderless Jig word bars directly over the 3D viewport (`font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1; background: transparent; border: none;`). Separate words cleanly without eyebrow descriptors or fake status/FPS/demo labels. Optically center every `<button>` vertically `-2px` down (`padding-top: calc(var(--btn-py, 5px) + 2px); padding-bottom: calc(var(--btn-py, 5px) - 2px)`).
1. **Top-Left Style Bar (`clone`, `clean`, `grid`, `editorial`, `cinematic`, `product`, `brutal`, `playful`, `retro`)**:
   - Connected live to the 3D scene (`CUBOID_PATCH` / direct reactive state): switching a style updates the cuboid PBR material finish, `cuboidColor`, roughness/metalness, and procedural PMREM studio softbox reflection palette (`clone` satin graphite, `clean` crystal glass reflection, `grid` architectural matte, `editorial` warm stone + amber rim, `cinematic` high-contrast specular carbon + ember rim, `product` crisp ceramic + emerald/lime, `brutal` industrial charcoal + volt rim, `playful` glossy daylight ceramic, `retro` CRT emerald/amber edge light) without adding any background wallpaper.
2. **Top-Right UI Libraries + Theme Toggle (`mui`, `radix`, `shadcn`, `base-ui`, `☼ / ☾`)**:
   - Switches Jig control styling and toggles `lightMode` between pure `#000000` dark void and `#FAF9F6` daylight void (keeping the WebGL canvas transparent with zero background objects in both themes).
3. **Top-Right Collapsible 3D Inspector (`inspector` button + `#c3dDesignKitPanel` — MUST start collapsed on load)**:
   - Opens on demand as a slim floating drawer (`width: 268px; backdrop-filter: blur(20px)`) wired directly to `c3dParams`:
     - **Shape Word Strip**: `chain`, `helix`, `ring`, `wave`, `arch` (live formation morphing).
     - **5 Scrub Sliders**: `count` (`3–14`, default `8`), `gap` (`0.00–0.60`, default `0.01`), `scroll` (`0.00–2.00`, default `0.60`), `spin` (`0.00–2.00`, default `0.57`), `depth` (`camZ`, `4.0–10.0`, default `6.2`).
     - **Surface Color Swatch (`surface`)**: Live `<input type="color">` updating `cuboidColor`.
     - **Footer Controls**: `copy` (copies current `c3dParams` JSON) and `reset` (resets only the 3D formation/sliders while preserving active style and theme).
4. **Right-Edge Variant Notches Rail (`1`, `2`, `3`, `4`, `5`)**:
   - Vertical stack of 5 compact numbered notches (`Alt+1..5`) that cycles material sub-variants and optional per-variant formation presets (`wave`, `chain`, `ring`, `arch`, `helix`) inside the active style.
5. **Bottom-Left Motion-Craft Bar (`gsap`, `framer`, `lenis`, `spring`, `play`)**:
   - Selects the active motion/easing curve profile for formation transitions and hover springs.
   - Clicking `play` starts a continuous `requestAnimationFrame` auto-travel pointer sweep (`nx = sin(t) * 0.62`, `ny = cos(t * 0.78) * 0.34`) and steady formation motion; any manual pointer move, click, wheel scroll, or slider interaction immediately pauses `play` and hands control back to the user.

Typography: Instrument Sans (600/500 UI labels) + Hanken Grotesk (400/500 controls) + JetBrains Mono (400/500/600 Jig bars & numeric readouts, tabular-nums, >= 12px)
Color (Dark #000000 default for 3D sculptural edge contrast, with #FAF9F6 Light Toggle): brand Signal Emerald #10B981 (oklch(0.70 0.17 162)), accent Ember Amber #F59E0B (oklch(0.77 0.16 70)), bg #000000 / #FAF9F6, cuboid #121316, text #F4F4F6 / #121214
Build: Three.js WebGLRenderer (`alpha: true`, transparent clear, procedural PMREM studio softboxes, rounded beveled cuboids) + React 19 / Vanilla JS Design Kit Jig state bridge (`CUBOID_PATCH` + `IMMERSIVE_POINTER`) + `lucide-react` icons
Avoid: purple/violet/blue skins; Material fonts; backgrounds, skyboxes, or floor grids; inspector open on load; bloom whiteout; eyebrow labels or fake telemetry; uncentered buttons (shift labels -2px down)
```
