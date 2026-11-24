---
name: 3d-realism-postprocessing
description: Recreate or integrate the Three.js WebGL2 post-processing and shader-lighting realism stack from Faraz Shaikh (@0beqz) — including shared VelocityDepthNormalPass G-buffers, Screen-Space Reflections (SSR), Hit-Point Temporal Reprojection & TRAA, Poisson Bilateral Denoising, HBAO/GTAO & temporal bent normals, Per-Object Motion Blur, Billboard Planar Reflections, and IBL shader lighting enhancement. Use when building photorealistic Three.js scenes, SSR, TRAA, HBAO, motion blur, or temporal denoisers.
---
# 3D Realism Post-Processing Stack (`@0beqz` Architecture)

A production Three.js WebGL2 (`postprocessing` + `three`) realism pipeline synthesized from `0beqz/realism-effects` (`main`, `v2`, `poisson-recursive`, `hbao-temporal-bent-normal`), `0beqz/screen-space-reflections`, `0beqz/enhance-shader-lighting`, `0beqz/three-billboard-reflection`, and their underlying graphics papers.

For SSGI-specific ray marching and WebGPU/TSL vs. WebGL2 integration, pair with `3d-screen-space-global-illumination`.

## 1. Shared G-Buffer & Velocity Pass (`VelocityDepthNormalPass`)

Render scene geometry once into a shared G-buffer before all temporal/screen-space effects:
- **Targets**: Depth (`depthTexture`), world-space normals, roughness, diffuse/albedo, and 2D screen-space velocity vectors (`prevClipPos - currClipPos` in UV space).
- **Packing**: Pack diffuse + specular `vec4`s into a single RGBA float target via `packTwoVec4`, and pack `rayLength` + `roughness` into a single `float` via `packHalf2x16(vec2(rayLength, roughness))` (`uintBitsToFloat`).
- **Pass ordering**: When `SSGIEffect` is active, it replaces `RenderPass` (`isUsingRenderPass`); place `TRAAEffect` and `MotionBlurEffect` in a **second** `EffectPass` after `SSGIEffect`.

## 2. Screen-Space Reflections (`SSREffect` & `0beqz/screen-space-reflections`)

1. **View-space ray marching + binary search**:
   - Reconstruct `viewPos` from `depthTexture` and transform `worldNormal` to `viewNormal`.
   - Sample microfacet half-vector `H` with **GGX VNDF** (`SampleGGXVNDF(V, roughnessSq, roughnessSq, r1, r2)`) driven by animated **blue noise** (`blueNoise()`), then reflect `l = reflect(-V, H)`.
   - March along `l` in view space for `steps` (default 20), testing `rayDepth` against `depthTexture` within `thickness` (default 10). On hit, refine with `refineSteps` (default 5) binary search iterations.
2. **Environment-map MIS fallback**:
   - On ray miss, sample an equirectangular HDR environment map (`EquirectHdrInfo`) with mip level `envBlur * maxEnvMapMipLevel` (clamping `roughness < 0.15` proportionally to keep mirror reflections sharp).
   - Optionally importance-sample the environment map (`sampleEquirectProbability`) and combine via Multiple Importance Sampling (`misHeuristic`).
   - Support interior parallax via **box-projected env maps** (`BOX_PROJECTED_ENV_MAP`).
3. **Planar Billboard Reflections (`0beqz/three-billboard-reflection`)**:
   - For flat emissive/textured planes (signs, screens, windows) that must reflect accurately on any mesh orientation without full SSR: patch `material.onBeforeCompile` using Guido Schmidt's analytical ray-plane intersection, fading by `rayFalloff` and approximating roughness blur via texture mipmaps (`roughnessMapBlur`).

## 3. Temporal Reprojection & TRAA (`TemporalReprojectPass`, `TRAAEffect`)

Grounded in *Temporal Reprojection Anti-Aliasing in INSIDE* (Pedersen), *High Quality Temporal Supersampling* (Karis, UE4), *Reprojecting Reflections* (Bitsquid), and *Temporally Reliable Motion Vectors* (Zeng et al., Eurographics 2021):

- **Hit-point (virtual) reprojection for specular**: Naive surface-UV reprojection smears view-dependent reflections during camera motion. Store world-space `rayLength` (`distance(cameraPosWS, hitPosWS)`) and reproject the **virtual reflected hit point** using `prevViewMatrix` / `prevProjectionMatrix` rather than only the surface pixel's motion vector.
- **Confidence-weighted EMA**:
  - `accumBlend = 1.0 - 1.0 / (acc.a + 1.0)` scaled by `pow(confidence, confidencePower)` and clamped by `maxBlend` (e.g. `0.9` for TRAA).
  - For low roughness (`roughness < 0.1`), scale down `maxValue` proportionally to `moveFactor` to prevent mirror ghosting.
- **Neighborhood clamping / clipping**:
  - Clamp or clip history toward the 3×3 neighborhood AABB (`clampNeighborhood`, radius 1 for low roughness, 2 for diffuse/rough) in **log** (`log(c + 1)`) or **YCoCg** space to suppress fireflies and disocclusion trails without clustering.
  - Scale `acc.a *= 1.0 - colorDiff` when clamped history diverges from current neighborhood.
- **TRAA (`TRAAEffect`)**:
  - Apply Halton(2, 3) sub-pixel jitter to `camera.projectionMatrix` before scene rendering, unjitter after, and resolve via `TemporalReprojectPass` with `logTransform: true`, `neighborhoodClamp: true`, `confidencePower: 4`.

## 4. Poisson Bilateral Denoiser (`PoissonDenoisePass`)

Grounded in `N8python/ssao` and `0beqz/realism-effects` (`poisson_denoise.frag`):
- **Log-luminance space**: Transform inputs with `log(color + 1.0)` before filtering and `exp(color) - 1.0` after to preserve HDR highlights without firefly bleeding.
- **8-tap Poisson disk** (`POISSON[8]`): Weighted by edge-stopping bilateral terms:
  - Normal: `exp(-(1.0 - dot(n, neighborN)) * normalPhi)`
  - Depth: `exp(-10000.0 * abs(d - neighborD) * depthPhi)`
  - Roughness: `exp(-abs(r - neighborR) * roughnessPhi)`
  - Luminance: `exp(-min(abs(lum - neighborLum), 0.5) * lumaPhi)`
  - **Temporal age**: `age = 1.0 / pow(t.a + 1.0, 1.2 * phi)` — freshly disoccluded pixels (`t.a` small) receive stronger spatial blur, while converged pixels preserve sharp detail.

## 5. Horizon-Based AO, GTAO & Visibility Bitmask GI

- **HBAO (`v2:src/hbao/shader/hbao.frag`)**: Cosine-weighted hemisphere sampling driven by blue noise (`aoDistance * pow(blueNoise.b, distancePower + 1.0)`), projecting samples to screen space and testing horizon elevation `deltaDepth < thickness * 0.01` with distance-based bias.
- **Depth-derived normals (`v2:src/gtao/shader/gtao.frag`)**: When a normal buffer isn't bound, reconstruct smooth world normals from 4-tap finite depth differences (`min(dl, dr)`, `min(db, dt)`) to avoid silhouette normal spikes.
- **Temporal Bent Normals (`hbao-temporal-bent-normal`)**: Accumulate visibility-weighted unoccluded directions across frames via `velocityTexture`, encoding/decoding octahedral normals into RG channels alongside AO in B.
- **Visibility Bitmask GI (Therrien et al., arXiv:2301.11376)**: Divide each hemisphere slice into bitmask sectors ($O(1)$ bitwise OR per sample) so light can pass behind thin surfaces of constant thickness and support multiple visibility cones instead of a single bent normal.

## 6. Per-Object Motion Blur & Lens Distortion

- **Motion Blur (`MotionBlurEffect`)**: Sample `inputTexture` along `velocityTexture` (`samples: 16` default), jittering sample offsets per-pixel/per-frame with animated `blue_noise_rgba.png` (`frame % 4096`) to turn banding into fine grain (John Chapman / `gkjohnson/threejs-sandbox`).
- **Lens Distortion (`LensDistortionEffect`)**: Polynomial radial distortion/undistortion $r_d = r(1 + k_1 r^2 + k_2 r^4)$ (Marco Diiga / WSCG 2018).

## 7. Shader Lighting Enhancement (`0beqz/enhance-shader-lighting`)

For Three.js `MeshStandardMaterial` / `MeshPhysicalMaterial` scenes without full SSGI, patch `getIBLIrradiance` and `getIBLRadiance` via `onBeforeCompile`:
- Derive `aoMapClr` from `aoMap` (or grayscale `lightMap` luminance) with `aoMapGamma` and `aoMapIntensity`.
- Apply roughness-aware power smoothing (`smoothing = 0.3 + smoothingPower + (1 - smoothingPower) * max(0.75 - roughness, 0) - (1 - aoMapClr) * 0.75`) to deepen occluded crevices.
- Mix `hemisphereColor` into deeply occluded areas (`1 - origAoMapClr^2`) and add a `sunIntensity * pow(aoMapClr, 16.0)` highlight term on unoccluded surfaces.

## References

See [3d-screen-space-global-illumination/REFERENCES.md](../3d-screen-space-global-illumination/REFERENCES.md) for the complete list of `@0beqz` repositories and distilled graphics papers.
