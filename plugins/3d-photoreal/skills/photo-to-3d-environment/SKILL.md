---
name: photo-to-3d-environment
description: >-
  Convert a single reference photograph into a camera-locked, 360-degree
  interactive, linear-HDR photoreal WebGL2 3D environment with modular toggleable
  pieces, packed de-lit PBR textures, automated Playwright split-wipe alignment
  evaluation, ray-AABB interior orbit clamping, and a stroke-free dark-mode
  Design Kit Jig featuring a ground-up Play build-out sequencer.
metadata:
  icon: 🏛️
---

# Photo to 3D Photoreal Environment (WebGL2 + Linear HDR + Design Kit Jig)

Use this skill whenever the user provides a **single photograph** (architecture, courtyard, interior, terrace, garden, or still-life setting) and wants a **true 360° interactive, dynamically relightable, modular 3D WebGL2 environment** that aligns 1:1 with the reference photograph in Split Wipe and Side-by-Side comparison—without external CDN dependencies, FBO bloom whiteout, or wall-clipping orbit bugs.

---

## Stage 1: Photo Intake, Splat-Wipe Baseline & Modular Scene Decomposition

### Decision Gate: 2.5D/Splat Wipe vs. Modular PBR 3D
| Requirement | Approach |
| :--- | :--- |
| Quick ±15° parallax or static baked lighting | Start with a 2.5D depth/splat wipe (`3d-gaussian-splatting-webgl`) to validate framing |
| **True 360° orbit, piece-by-piece toggles, live sun relighting, ground-up Play build-out** | **Decompose into 6+ semantic UV-mapped 3D pieces** in self-contained WebGL2 (`#version 300 es`) |

### Decomposition Contract
1. Lock the reference photo to exact viewport `object-fit: cover` framing (e.g., `1280×800`, 16:10).
2. Identify 4–6 structural landmarks directly from the photo before writing geometry:
   - Solar azimuth & elevation (shadow diagonal across floor/walls/table)
   - Back wall roofline `y%` and floor horizon `y%`
   - Primary architectural cadence (colonnade/arcade start `x%`, pier spacing, doorway position)
   - Foreground hero anchor (tabletop rim crossing `x = 50%`, hero props, foliage silhouettes)
3. Split the scene into **6 independently toggleable `pieceId` groups** ordered bottom-to-top for ground-up build-out:
   1. `floor` (ground/pavers/plaza)
   2. `walls` (enclosing walls, trim, recessed doors/windows)
   3. `colonnade` (arches, loggia, beams, structural accents)
   4. `table` (foreground hero architectural furniture)
   5. `props` (vessels, ceramics, planters, tabletop objects)
   6. `botanicals` (trunks, fanned alpha-cutout sprigs, climbing foliage)

---

## Stage 2: De-Lit PBR Texture Sheet Generation & Map Extraction

1. **Generate flat, shadowless ("de-lit") material sheets** (stone, pavers, clay/terracotta, weathered wood) plus isolated **white-background studio photographs** for botanical sprigs.
   - **429 Throttling Rule:** Throttle parallel image-generation calls (max 2–3 concurrent, staggered with exponential backoff on HTTP 429) so asset generation never stalls.
2. **Pack Albedo + Tangent-Space Normal + Roughness + Defringed Alpha** via the bundled script:
   ```bash
   python3 scripts/extract_pbr_maps.py \
     --input-dir ./raw-textures \
     --output-json ./pbr_bundle.json \
     --ref-photo ./reference.jpg
   ```
   - **Seamless cross-fade:** `make_seamless()` applies a half-shift smoothstep border blend so walls and floors tile invisibly.
   - **Half-bandwidth `NR` packing:** Multi-scale Sobel gradients + cavity-aware roughness packed into `R=Nx, G=Ny, B=Roughness` (reconstruct `Nz = sqrt(max(0.05, 1.0 - dot(nXY, nXY)))` in the fragment shader).
   - **Defringed botanical alpha cutouts:** `extract_cutout_alpha()` removes white studio backgrounds and bleeds mean leaf color into semi-transparent boundary pixels so zero white halo appears against dark stone.
3. **Mandatory WebGL2 Texture Upload Rules (`uploadTex`):**
   - **Alpha cutouts (`isCutout === true`):** **Disable mipmaps** (`gl.LINEAR` min/mag, `gl.CLAMP_TO_EDGE`) so foliage edges stay razor-crisp without dark/pale mip fringes.
   - **Opaque PBR maps (`isCutout === false`):** `gl.generateMipmap`, `gl.LINEAR_MIPMAP_LINEAR`, `gl.REPEAT`, and enable `EXT_texture_filter_anisotropic` up to `Math.min(16, maxAniso)`.

---

## Stage 3: Self-Contained WebGL2 (`#version 300 es`) & 360° Orbit Stability

1. **Single-File, Zero-CDN Runtime:** Embed base64 `ASSETS` JSON inline (never mutate or re-encode `ASSETS` during subsequent shader/UI iterations). Use raw WebGL2 (`antialias: true, alpha: false, depth: true, preserveDrawingBuffer: true`) so SwiftShader headless Playwright screenshots always capture live frames cleanly.
2. **Demand-Driven Render Loop:** Gate rendering on `needsRender` and `shadowDirty` so idle scenes consume zero GPU while animations (`cam.anim`, `buildSeq.playing`) run smoothly at 60 fps.
3. **Geometry Primitives (`makeBuilder()`):** Build interleaved `pos3, norm3, uv2` buffers (`stride = 32`) via `quad`, `box`, `lathe`, `tube`, `archBay`, and `sprigCard`.
   - **Outward Face Winding Check:** Verify every custom `quad()` / `archBay()` front face normal points outward toward the sun (e.g., courtyard colonnade spandrel normal `(-1, 0, 0)`) to prevent inverted dark/gray faces.
4. **Ray-AABB Interior Wall Clamping (Zero Clipping on 360° Orbit):**
   Never let horizontal orbit push `eye` inside enclosing walls or under the floor. Keep `PRESETS.ref` pixel-exact (`tEye === 1.0`) and smoothstep-release wall clamping when `rawEye.y` rises above wall height for unrestricted aerial views:
   ```js
   const rdx = rawEye[0] - cam.target[0], rdy = rawEye[1] - cam.target[1], rdz = rawEye[2] - cam.target[2];
   let tWall = 1.0;
   if (rdx < -1e-5) tWall = Math.min(tWall, (X_MIN - cam.target[0]) / rdx);
   if (rdx >  1e-5) tWall = Math.min(tWall, (X_MAX - cam.target[0]) / rdx);
   if (rdz < -1e-5) tWall = Math.min(tWall, (Z_MIN - cam.target[2]) / rdz);
   if (rdz >  1e-5) tWall = Math.min(tWall, (Z_MAX - cam.target[2]) / rdz);
   tWall = Math.max(0.18, Math.min(1.0, tWall));
   const highBlend = Math.max(0.0, Math.min(1.0, (rawEye[1] - WALL_TOP_Y) / 0.70));
   const smoothHigh = highBlend * highBlend * (3.0 - 2.0 * highBlend);
   let tEye = tWall + (1.0 - tWall) * smoothHigh;
   if (cam.target[1] + rdy * tEye < 0.22 && rdy < -1e-5) {
     tEye = Math.min(tEye, Math.max(0.18, (0.22 - cam.target[1]) / rdy));
   }
   const eye = [cam.target[0] + rdx * tEye, Math.max(0.22, cam.target[1] + rdy * tEye), cam.target[2] + rdz * tEye];
   ```

---

## Stage 4: Automated Split-Wipe Alignment Eval & Leveling Loop

Never eyeball Split-Wipe alignment alone. Run the bundled headless Playwright evaluator at `1280×800`:
```bash
python3 scripts/eval_alignment.py \
  --html ./scene-3d.html \
  --out-dir ./scratch
```
It renders `eval-wipe.png`, `eval-ghost.png` (50% photo + 50% 3D), and `eval-3d.png`, and reports:
- **Landmark residuals (`y px` at `x ≈ 50%`):** `wall_top_y`, `floor_y`, `tbl_top_y`
- **Seam `x = W/2` luminance correlation & L1** (target `Seam Corr > 0.50`, roofline delta `≤ ±3 px`)
- **Sobel Edge F1 (`@4px` tolerance)**
- **HDR Luminance Parity:** `mean`, `p05`, `p50`, `p95`, and `clipPct` (target `clipPct == 0.00%`, 3D `mean` within `±0.03` of photo)

Iterate `PRESETS.ref` (`pitch`, `target`, `dist`) and piece depth/scale until `eval-ghost.png` and `eval-wipe.png` level off cleanly across the 50% seam (e.g., courtyard benchmark improved `wall_top_y` from `-16px → +1px` and `Seam Corr` from `0.2126 → 0.5144`).

---

## Stage 5: True Linear HDR Lighting & Micro-Texture Crispness

Keep a **single-pass forward WebGL2 + 2048² shadow-map pipeline**—**never** stack low-threshold multi-pass FBO bloom (primary cause of 3D whiteout and MSAA/scissor bugs). Instead, drive true linear HDR radiance through **Khronos PBR Neutral** tone mapping:

1. **Fix Derivative Cotangent Frame:** Always pass **world position `vWPos`**, never normalized `-V`:
   ```glsl
   mat3 TBN = cotangentFrame(Ngeom, vWPos, vUv);
   ```
2. **Tightened Shadow Frustum + Rotated 12-Tap Poisson PCF:**
   - Tightly bound the ortho shadow frustum around visible courtyard/room geometry and drop vertex normal offset to `0.007` (prevents tabletop prop peter-panning).
   - Sample a per-pixel randomly rotated 12-tap Poisson disk (`rad = 1.45 / 2048.0`) with slope-scaled bias `max(0.00095 * (1.0 - ndl), 0.00030)`.
3. **Smooth Architectural + Analytical Contact AO (`computeSceneAO`):**
   - Never use hard binary coordinate cuts (e.g., `if (p.x > 1.15) ao *= 0.48`). Use `smoothstep` transitions for loggia/alcove depth, wall-floor creases, table overhang, and tight radial tabletop/ground contact pools under vessels, cups, and planters.
4. **Nyquist-Clamped World-Space Micro-Detail (`uMatType` dispatch `0..5`):**
   - Compute `fw = length(fwidth(vWPos))` and roll off fine procedural detail via `nyqFine = 1.0 / (1.0 + pow(fw / 0.008, 2.0))` so 360° orbit has zero shimmer.
   - `0/1` stone/pavers: procedural pores + normal perturbation + mortar cavity AO; `2` terracotta: subtle horizontal wheel-thrown ribs; `4` glazed stoneware: smooth `N = Ngeom`, `rough = 0.22`, mineral speckles.
5. **Zero-Fresnel Alpha Botany (`arch-site-foliage-and-atmosphere`):**
   - On `uAlphaCutout > 0.5`: force `spec = 0.0`, `iblSpec = 0.0`, `hdrRim = 0.0` (eliminates milky grazing glare). Use soft normal wrap + warm backlit subsurface translucency + inner-canopy radial AO.
6. **True Linear HDR Radiance + Sky IBL:**
   - **Direct sun:** `vec3(1.0, 0.94, 0.82) * (6.80 * uSunPower)`
   - **HDR Sky + Multi-Bounce Radiosity IBL:** `skyAmb = vec3(0.36, 0.52, 0.76)`, `warmBounce = vec3(0.82, 0.58, 0.33)`, `iblDiff * 0.62`, `iblSpec * 0.38`, plus subtle warm grazing `hdrRim` (`(1.0 - isFol)`) on sunlit stone/clay edges.
   - **Luminous HDR Sky Shader (`skyProg`):** Linear zenith `vec3(0.36, 0.62, 0.96)`, `>1.0` HDR horizon `vec3(1.18, 1.22, 1.28)`, 4-octave soft cumulus wisps, and solar aureole—all routed through the exact same `pbrNeutralToneMapping` + `uExposure` + `pow(..., 1/2.2)` + `±0.003` triangular sensor dither as `pbrProg`.
   - **Exposure defaults:** `exposure = 1.30×` default, drag-scrub slider range `0.60..2.00×`.

---

## Stage 6: Stroke-Free Dark-Mode Design Kit Jig & Ground-Up `▶ Play` Build-Out

Follow `style-jig`, `3d-ui-jig`, and `design-donts.md` strictly:

- **Zero Strokes / Borders / Hairlines:** `border: none; box-shadow: none;` on every button, tab, row, slider, and pill (`getComputedStyle` must read `0px none`). Use pure flat matte tonal layers only:
  - Backplate `--plate: #1c1b18`, tracks/rows `--g2: #262521`, active tab/slider fill `--g3: #34322d`, active ink `--fg: #f5f2eb`, muted ink `--muted: #9a948c`.
  - Keep `html, body { background: #faf9f6; }` (light root canvas + bright daylight 3D stage) so `lint_donts.py` passes `dark=False`.
- **Typography & `-2px` Optical Centering:** Load `Instrument Sans` (`400;500;600`), lowercase labels, `tabular-nums` on readouts, and `display: inline-flex; align-items: center; justify-content: center; line-height: 1; padding-top` shifted `+2px` over `padding-bottom` on every button, tab, row, and pill.
- **Top-Left 3-Button Action Bar (`top: 16px; left: 16px`):**
  - Single matte dark backplate (`padding: 6px 8px; border-radius: 13px`) containing **only** `split wipe`, `side by side`, and `▶ play`.
  - **No vertical divider** and **no active background box / sliding thumb**—active state is differentiated purely by text brightness (`#f5f2eb` vs `#9a948c`).
- **Bottom-Center 4-Stage Progression Strip (`bottom: 16px; left: 50%; transform: translateX(-50%)`):**
  - Uses the exact same stroke-free, dividerless, boxless dark matte backplate (`#1c1b18`, `padding: 6px 10px; gap: 6px`) as the top-left bar, with 4 short, optically balanced clickable stages: `photo`, `splat`, `3d`, `hdr` (active stage indicated purely by `#f5f2eb` vs `#9a948c` text brightness, `padding: 0 11px 2px 11px` for dead-center vertical optical alignment on lowercase descenders; tucked below top bar on mobile `<= 768px` so zero overlap with the bottom-docked inspector).
  - `splat` renders a live, 360°-orbitable ~28k-point depth-projected 3D Gaussian Splat cloud sampled directly from the 6 modular pieces and colored from the reference photograph at boot.
  - `3d` shows the de-lit modular PBR geometry (`uSunPower = 0.08`, `exposure = 0.80`) before the linear-HDR pass; `hdr` is the default full linear-HDR render.
- **Full 4-Stage `▶ Play` Build-Out Sequencer:**
  - Clicking `play` toggles to `pause` and walks cleanly through all 4 stages end to end: `photo` (`1.2s`) → `splat` (`1.6s`) → `3d` ground-up assembly (`floor → walls → colonnade → table → props → botanicals`, `0.85s` per step) → `hdr` (`1.6s` cubic ease-out `uSunPower 0.08 → 1.00`, `exposure 0.72 → 1.30`), syncing the bottom stage strip, `pieces` toggles, and `exposure` readout live in both `split wipe` and `side by side`.
- **Top-Right Inspector (`top: 16px; right: 16px`, `256px` wide):**
  - Open by default on desktop (bottom-docked on mobile `<= 768px`), collapsing cleanly to a top-right pill (`height: 44px`) on `hide`.
  - Two tabs only: `pieces` (6 toggle rows showing `on`/`off`) and `lighting` (4 pointer-capture drag-scrub sliders with keyboard `ArrowLeft/Right`, `Shift` 5×, `Home/End` support), plus `reset` and `hide`.
  - **Zero clutter:** No corner attribution pills, no camera-preset bar, no `Ghost`/`Full 3D` extra buttons, no self-referential status copy.

---

## Stage 7: Multi-Gate Automated QA & Local Artifact Snapshot

Before presenting any build, pass all 4 verification gates:
1. **Design Don'ts Lint:** `python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py <file.html>` → **`0 error(s), 0 warning(s)`** (`primary_font=Instrument Sans`, `dark=False`).
2. **Playwright Visual & Alignment Eval (`scripts/eval_alignment.py`):**
   - `ERRORS: 0` (zero console/page/WebGL errors).
   - Desktop `1280×800` Split Wipe, Side by Side, `play` mid-buildout, and Mobile `390×844` (single-row non-wrapping top bar + bottom-docked panel).
   - Tight **2× Retina crops** of the top-left bar and top-right panel verifying zero strokes (`0px none`) and dead-center optical text alignment.
3. **360° Orbit & HDR Safety:**
   - Drag left & right (`±200px`) to confirm zero wall clipping and zero floor clipping.
   - Verify HDR luminance parity against the reference photo with **`clipPct == 0.00%`** (zero whiteout).
4. **Local-First Artifact Delivery (`No x20` default):** Render directly in Jetski's right-hand Artifact Pane (`local-build-preview`) unless the user explicitly requests `x20`.
