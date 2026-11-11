---
name: car-studio-scrims-and-env-lighting
description: >-
  Light Three.js vehicles as 3D curved mirrors across studio cycloramas and outdoor
  plates: full-length feathered silk-scrim ribbons, negative-fill horizon flags,
  role-split chassis contact shadows, ground-coupled CubeCamera probes, 3-zone wet
  asphalt, and rolling-rig shutter blur.
---

# Automotive Studio Scrims, Ground Reflections & Rig Lighting (`automotive-threejs`)

A glossy car does not read via Lambertian diffuse (`N·L`)—it is a **curved 3D mirror** whose body lines exist only where feathered studio scrims, sky gradients, and dark horizon negative-fill flags meet across its clearcoat.

## [LOCKED] First-Principles Axioms
<!-- BEGIN LOCKED AXIOMS -->
1. **Role-Split Targeted IBL (`scene.environment = null`) & `PMREM` Scissor Reset (`r187+`):** Never set global `scene.environment` (which in Three.js `r155+` overwrites `envMapIntensity = 0` on matte floors and washes out under-chassis shadows), and never reference `THREE.CubeUVReflectionMapping` (removed in `r187` in favor of cube render targets). Keep `scene.environment = null`, bind `mat.envMap = pmremTex` strictly onto `paint`, `glass`, `chrome`, `alloy`, and `wet_puddle` materials, and immediately reset `renderer.setRenderTarget(null); renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.setScissorTest(false);` after `pmrem.fromScene(...)`.
2. **Asymmetric Gradient Silk-Scrims + Negative-Fill Horizon Flags (`car_studio_and_env.js`):** In studio scenes, ban bare point lights and uniform cosine blobs. Author `HalfFloatType` rectangular overhead/side silk-scrims (`6.5–8.5 m` long, crisp inner edge + smooth Gaussian outer gradient) paired with camera-side **`0.015×` black-velvet negative-fill flags** along the beltline reflection horizon so fender crowns snap from liquid highlight into deep body pigment.
3. **Dual-Scale Under-Chassis & Tire Contact Shadow Lock:** Combine a tightly fitted (`±3.2 m`) `4096²` shadow-casting key light with analytical floorpan occlusion (`chassisShadowAO(x, z)` scaled inversely with `groundClearance` plus `4–12 cm` dark tire-patch collars) and dual-scale automotive `HBAO` (`0.055 m` shutline/lug micro + `0.45 m` wheelhouse/undercarriage macro)—eliminating floating tires and glowing wheel wells.
4. **Outdoor Horizon Dark-Band & Local `CubeCamera` Reflection Coupling:** On outdoor plates, lower doors and rocker panels (`R.y <= 0.08`) must reflect dark asphalt, curbs, and horizon silhouettes—never an unoccluded bright sky lower hemisphere. Capture a car-centered `256²` `HalfFloatType` mipmapped `CubeCamera` probe (with `carGroup.visible = false`) or bake true road/horizon geometry into the PMREM scene.
5. **Shift-Safe Trilinear Planar Mirrors (`Showroom Floors & Wet Puddles`):** On polished showroom floors or standing street puddles, render a `2048²` `HalfFloatType` reflection target (`minFilter: LinearMipmapLinearFilter, generateMipmaps: true, anisotropy: 8`). Call `mirrorCam.near = Math.max(0.15, distToFloor + 0.05); mirrorCam.clearViewOffset(); mirrorCam.updateProjectionMatrix();` **first**, then copy `elements[8] = -cam.projectionMatrix.elements[8]` and `elements[9] = cam.projectionMatrix.elements[9]`.
<!-- END LOCKED AXIOMS -->

## [REGIME PLAYBOOK] Conditional Rules
<!-- BEGIN LEARNED LAWS -->
- **WHEN `lighting_regime` is `"studio_cyclorama_dark"` or `"studio_cyclorama_light"`:** Stage the car on an infinite **$G^2$-curved cyclorama cove** (`R_cove ≈ 3.0–4.5 m`, zero sharp `90°` back-wall horizon crease), light the background cove with a dedicated soft pool falloff decoupled from key scrim reflections, and position main overhead scrims `2.4–3.6 m` above the roof aligned parallel to the vehicle's longitudinal `Z` axis.
- **WHEN `lighting_regime` is `"outdoor_sunlit"`, `"outdoor_overcast"`, or `"urban_night_practical"`:** Calibrate sky radiance to `open_sky_or_scrim_p85_srgb`, solve solar `(azimuth, elevation)` from cast mirror-stalk and bumper-corner shadow vectors, and reconstruct **only** the exact road, curbs, barriers, architecture, or vegetation evidenced across `VIEW 1..N` (locking any alpha botany to `envMapIntensity: 0.0, roughness: 0.90`).
- **WHEN shading grazing asphalt, concrete track aprons, or rain-slicked streets:** Rotate procedural `2–4 mm` aggregate octaves by an irrational orthogonal matrix (`mat2(0.80, 0.60, -0.60, 0.80)`), mip-filter via `fwidth(vWorldPos.xz)`, and enforce the **3-zone wet porosity transition** (`dry substrate -> 50%-darkened wet porous collar -> 3 mm capillary meniscus glint -> planar mirror puddle`, plus feathered `95–110 nm` Airy thin-film oil slicks where present).
- **WHEN `is_rolling_rig_shot == true` (Dynamic Tracking-Boom Panning Plates):** Keep the camera rigid in the vehicle's reference frame (`0.0 px` chassis blur) while integrating road UV/world translation `Δz = -v * t_sub` and wheel hub spin `Δθ = (v * t_sub) / R_tire` across `4–8` linear `RGBA16F` shutter sub-frames (`150°–180°` rotary shutter), yielding authentic radial spoke blur and streaked asphalt with razor-sharp coachwork.
- **WHEN hot exhausts, glowing carbon-ceramic rotors, or foggy headlight beams appear:** Balance daytime thermal cues via `60%` shadowed tailpipe/caliper Planck blackbody cavity glow (`950–1300 K`) + `30%` depth-gated Gladstone–Dale heat shimmer, and render misty night headlamp halos via polydisperse Mie diffraction (`r_eff ≈ 6–12 µm`) rather than flat additive cones.
- **WHEN staging dark-ceiling motor-show / exhibition pavilions (`mode: 'showroom_hall'`):**
  1. Render smooth satin-white or graphic-livery show plinths without invented checkerboard seams unless explicitly present across `VIEW 1..N`, using Nyquist-clamped (`1 / (1 + dot(fw, fw))`) micro-stipple and directional chassis + tire contact shadows.
  2. Synthesize out-of-focus background pavilion lights with filled Gaussian PSF lobes (`exp(-r^2 * k)`)—**never** ring-boosted circles (`smoothstep` annulus), which read as soap bubbles—and light mid-engine V8 bays beneath slotted Lexan covers with quilted aluminum heat-pan geometry plus soft local overhead fill.
  3. Calibrate post-tonemap 8-neighbor optical lens acutance (`microClarity` in `car_hyperreal_optics.js`) so `audit-threejs-hyperrealism` lands cleanly inside **`95–110%` sharpness** (`zero sandy sensor grain`, `StaticBoil = 0`).
  4. **Mip-0 Zero-Sigma `PMREM` Law (`pmrem.fromScene(envScene, 0)`):** Always pass `sigma = 0` to `PMREMGenerator.fromScene(...)`; any `sigma > 0` (`even 0.008`) pre-blurs Mip-0 of the cube-UV render target and smears sharp overhead softbox edges and paired rectangular hall ceiling fixtures into blurry pancakes across `clearcoatRoughness <= 0.012` car paint.
- **WHEN reconciling Hero (`VIEW 1`) lighting with multi-angle or interior cockpit views (`VIEW 2..N`):** Lock global sun/scrim environment to `VIEW 1`, use camera-local `exposureBias` in `window.__CAR_CAMERAS__` (especially for split-zone shaded cockpit views looking out into sunlit exteriors), and never float 2D emissive white cards in 3D space where secondary cameras will see them.
<!-- END LEARNED LAWS -->
