# Studio White Cyclorama, Soft Shadow Bottom & Camera Perspective Lock

Digests and adapts the 5 First-Principles Axioms of `arch-camera-matching-and-perspective` and `arch-daylight-and-interior-glow` specifically for **isolated single-chair studio photography against a solid white background**.

---

## 1. Studio Camera Calibration (`Chair A` <-> `<reference.jpg>`)

1. **Exact Native Aspect Lock (`W x H`)**:
   - Run `probe_white_studio_chair.py <reference.jpg>` first.
   - Lock render viewport dimensions to `recommended_canvas_size` (`[1200, round(1200 * nh / nw)]`) during headless parity scoring so silhouettes align pixel-for-pixel without horizontal/vertical letterboxing.
2. **Furniture Telephoto Focal Regime (`24 deg - 36 deg` vFOV)**:
   - Studio product photographers shoot chairs with `70 mm - 120 mm` full-frame portrait/macro lenses (`vFOV = 20 deg - 34 deg`) from `2.4 m - 4.2 m` away so front legs do not cartoonishly balloon relative to rear legs.
   - Solve horizontal focal scale from orthogonal seat-edge / stretcher vanishing points `(u1, u2)` around `uPrincipal`:
     `f_u = Math.sqrt((uPrincipal - u1) * (u2 - uPrincipal))`.
3. **`2-point_shift_plumb` vs. `3-point_pitched` Selection**:
   - **Plumb Studio Elevation (`perspective_regime_hint == "2-point_shift_plumb"`)**: Keep camera pitch at `0 deg` (`camPos.y === lookTarget.y`) so vertical chair legs/stiles stay strictly parallel to canvas edges, and frame vertical height via `camera.setViewOffset(W, H, (0.5 - uPrincipal) * W, (0.5 - vHorizon) * H, W, H)`.
   - **Elevated Studio 3/4 Shot (`perspective_regime_hint == "3-point_pitched"`)**: Solve camera elevation (`camY ~ 0.65 m - 1.35 m`, looking at `targetY ~ 0.38 m - 0.46 m`) and azimuth (`yaw`) so the visible top surface of the seat pan matches the reference ellipse foreshortening ratio `minor_axis / major_axis = sin(elevation_angle)`.
4. **`OrbitControls` Target-Order Invariant**:
   - Always execute:
     ```ts
     controls.target.set(targetX, targetY, targetZ);
     controls.update();
     camera.position.set(camX, camY, camZ);
     camera.lookAt(targetX, targetY, targetZ);
     if (viewOffset) {
       camera.setViewOffset(W, H, viewOffset.dx, viewOffset.dy, W, H);
     }
     camera.updateProjectionMatrix();
     ```
   - Clear `camera.clearViewOffset()` on pointer `start` if the user orbits interactively, and restore it on `Reset Studio Camera`.

---

## 2. Seamless White Studio Cyclorama Calibration (`PBR Neutral` Safe)

A common Three.js failure mode is setting `scene.background = new THREE.Color(0xffffff)` while lighting the chair dimly (turning white wood grey) OR blasting lights until pale upholstery clips to flat `(255, 255, 255)` silhouetteless mush.

Follow this exact studio lighting budget:

1. **Background White Target**:
   - Match `scene.background` to `probe.json`'s `border_mean_srgb` (typically `#fbfbfa` to `#ffffff` in studio photography).
2. **3-Point Studio Softbox PMREM Environment (Role-Split)**:
   - Synthesize a procedural studio cube/equirectangular environment (`PMREMGenerator.fromScene(studioSoftboxScene)`) containing:
     - Overhead large softbox (`y = +3.2 m`, warm-neutral `5400K`, linear intensity `1.55`)
     - Key 45-degree softbox (`5200K`, linear intensity `1.85`)
     - Opposite fill bounce card (`5800K`, linear intensity `0.85`)
     - Subtle studio horizon band (`linear 0.52`) so brushed steel, chrome tubing, and satin lacquer catch realistic studio studio-horizon crisp reflections (`dark-light-dark` cylinder banding!) instead of vanishing into uniform white.
   - Bind `envMap` at `envMapIntensity = 0.85 - 1.25` on metals/lacquers and `0.25 - 0.45` on matte wood/boucle/textiles.
3. **Direct Key + Rim + Floor Bounce**:
   - Primary `DirectionalLight` (`intensity = 2.2 - 3.2`, `2048x2048` `PCFSoftShadowMap` covering `[-0.85m, +0.85m]` tight frustum around the chair so shadow texels equal `~0.8 mm`!).
   - Rim/contour kicker (`intensity = 0.75 - 1.15`) separating pale chair silhouettes from the white cyclorama via subtle grazing Fresnel/rim shading.
   - Upward white-cyclorama floor bounce (`HemisphereLight` ground color `0xf4f3ef`, intensity `0.85`) illuminating the underside of seat pans and stretchers naturally.

---

## 3. Ground-Contact Lock (`y = 0.0`) & Dual-Scale Soft Shadow Bottom

Every chair must sit with undeniable physical weight on `y = 0.0` with a soft, photographic studio floor shadow:

1. **Exact Vertex Ground Clamp**:
   - Measure `minY` across the assembled chair group and translate `-minY` so the lowest foot glide, castor, or sled runner touches `y = 0.000 m` (`0.0 mm` float, `0.0 mm` sink).
2. **Layer 1 -- Real-Time Shadow-Catcher (`ShadowMaterial`)**:
   - Place a horizontal `PlaneGeometry(4.0, 4.0)` at `y = 0.0002 m` using `new THREE.ShadowMaterial({ color: 0x161514, opacity: 0.14 })` with `receiveShadow = true` to capture exact directional leg cast shadows at `0.8 mm` texel resolution.
3. **Layer 2 -- Analytical Dual-Scale Soft Studio Contact AO Plane (`y = 0.0006 m`)**:
   - Real studio overhead softboxes cast **soft area-light penumbras** that standard single-ray shadow maps make too crisp.
   - Place a custom transparent `ShaderMaterial` floor disc (`depthWrite: false`) evaluating exact world-space distances to each foot contact point `foot_i = (x_i, z_i, r_i)` AND the seat-pan footprint ellipse `(cx, cz, rx, rz, seatHeight)`:
     - **Micro Foot-Glide Umbra**: `exp(-d_foot^2 / (2 * sigma_foot^2))` with `sigma_foot = 0.018 - 0.032 m` (`opacity ~ 0.34 - 0.48` directly under each foot tip).
     - **Macro Under-Seat Soft Penumbra**: `exp(-d_ellipse^2 / (2 * sigma_seat^2))` with `sigma_seat = 0.16 - 0.34 m` offset slightly along `-keyLightDir.xz * seatHeight * 0.22` (`opacity ~ 0.11 - 0.22`), seamlessly fading to `0.0` (`100%` pure cyclorama white) beyond `0.85 m`.
