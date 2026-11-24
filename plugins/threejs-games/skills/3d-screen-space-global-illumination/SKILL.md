---
name: 3d-screen-space-global-illumination
description: Add screen-space global illumination (SSGI) to a Three.js WebGPU/TSL, WGSL, or WebGL2 post-processing pipeline by rebuilding world positions from depth, marching cosine-weighted hemisphere rays through the depth buffer, detecting hits by a depth sign change within a thickness tolerance, gathering rendered colour from hit pixels, and smoothing the eight-ray result with jittered temporal accumulation in ping-pong render targets. Use for cheap colour bleeding and bounce light in mostly on-screen scenes, SSGI, screen-space indirect lighting, raymarched GI, temporal accumulation, or when diagnosing noisy, leaking or smearing SSGI. metadata: icon: ✨
---

# 3D Screen-Space Global Illumination

Approximate one bounce of indirect light using only what the camera already rendered. The mechanism: **every pixel marches a few hemisphere rays through the depth buffer and borrows the colour of the first surface the ray slips behind; temporal accumulation turns eight noisy rays into a smooth average.** Remove the depth-crossing test and you have ambient occlusion with no colour; remove accumulation and you have speckle.

Reach for neighbours instead when:

- the camera moves constantly, light comes from off-screen, or you need reflections of hidden faces → `3d-probe-global-illumination` (world-space probes) and `3d-probe-reflections-and-sky-light`;
- you only want contact darkening → an SSAO/GTAO pass is cheaper.

Source: Maxime Heckel, "Lighting That Feels Just Right" (Nov 2026), where SSGI was the first step before he moved to probes because of the off-screen and camera-reset limits. See [REFERENCES.md](REFERENCES.md).

## Disclose the stack

Article: **Three.js · WebGPU · TSL post-processing**. Demo: **Vanilla JavaScript · WebGL2 (MRT) · GLSL ES 3.0**, with analytic primary rays standing in for raster so the file stays dependency-free. The SSGI pass itself reads only the G-buffer textures, exactly as a raster pipeline would.

## 1. Capture a G-buffer

```js
const scenePass = pass(scene, camera, { samples: 0 });   // MSAA off: depth must be single-sampled
scenePass.setMRT(mrt({ output, normal: normalWorld, albedo: materialColor }));
const sceneColor = scenePass.getTextureNode('output');
const depth = scenePass.getTextureNode('depth');
const normals = scenePass.getTextureNode('normal');
const albedo = scenePass.getTextureNode('albedo');
```

Reconstruct per pixel: `viewPosition = getViewPosition(uv(), depth.r, projectionMatrixInverse)`, `worldPosition = camera.matrixWorld × vec4(viewPosition, 1)`. The demo stores positive view depth instead and rebuilds `worldPos = camPos + rayDir × depth / dot(rayDir, camForward)`; both are equivalent.

## 2. Trace eight cosine-weighted rays

- Tangent frame from the normal (helper axis Y when `|n.z| > 0.999`).
- `u1 = (i + rand.x) / 8`, `r = sqrt(u1)`, `φ = 2π·rand.y`, `dir = t·r·cosφ + b·r·sinφ + n·sqrt(1 − u1)`. Stratifying `u1` per ray stops all eight rays clumping near the pole.
- Origin `worldPosition + n × 0.05`. A smaller offset self-intersects on the first step and darkens flat floors.

## 3. March in view space, test by sign change

| Parameter | Demo | Range | Failure if wrong |
| --- | --- | --- | --- |
| steps | 24 | 16–32 | Too few skips thin objects. |
| max distance | 2.5 world units | 1–4 | Too long gathers colour from across the room. |
| thickness | 0.2 | 0.05–0.5 | Too thin: rays tunnel and miss; too thick: light leaks from behind foreground objects. |
| march offset | per-ray blue noise / hash in [0, 1) | — | Without it, banding rings appear at step multiples. |

```wgsl
let distance = (f32(i) + marchOffset) * stepSize;
let rayView = originView + directionView * distance;
if (rayView.z >= -nearPlane) { break; }
// project → sampleUV; break when it leaves [0, 1)
if (sampleDepth >= 1.0) { previousDelta = -1.0; continue; }   // background: no surface
let delta = surfaceViewZ - rayView.z;                          // < 0: ray in front of surface
if (previousDelta < 0.0 && delta >= 0.0 && delta <= thickness) { /* hit */ }
previousDelta = delta;
```

A hit is the **step where the ray crosses from in front to behind** within the tolerance — not "ray is behind the depth buffer". The latter accepts every sample behind a foreground object and paints its colour on the background.

On a hit, read the hit normal and gather only if `dot(hitNormal, −dir) > 0`; back-facing hits add light from surfaces that face away. Accumulate `sceneColor` at the hit, average over all 8 rays (misses count as zero), multiply by the receiver's albedo, and add to the scene colour.

## 4. Accumulate over frames

- Three targets, `HalfFloatType`, `NearestFilter`, no depth: `sampleTarget` (this frame), `histories[0]` (read), `histories[1]` (write). Swap after every frame.
- Average: `previous + (current − previous) / (count + 1)`; when `count == 0` return `current` and ignore stale history.
- Cap the window at 128 frames: `count = min(count + 1, 127)`. Uncapped, late samples stop mattering and the image freezes.
- Advance `frameIndex` every frame and offset the noise lookup (`pixel + frameIndex × (29, 93)`). Repeating samples repeats errors.
- Set `outputColorTransform = false` on the sample and accumulation passes; only the final pass tone-maps.
- **Reset `count` on any camera move, light change or parameter change.** Keeping history while orbiting produces the datamosh smear the demo's *Keep (smears)* mode shows. Reprojection can preserve history but trails at disocclusions.

## Limits to state up front

- Cost scales with pixels × rays × steps; render at 0.5–0.75 scale and upsample if needed.
- Anything off screen or occluded contributes nothing; reflections built on the same march show black where the back of an object should be.
- History is camera-dependent, so a moving camera always shows the noisy first frames.

When these bite, move to `3d-probe-global-illumination`.

## 5. Production WebGL2 `postprocessing` Stack (`0beqz/realism-effects`)

When shipping SSGI + specular reflections in a WebGL2 `postprocessing` (`EffectComposer`) pipeline rather than WebGPU/TSL:

- **Shared `VelocityDepthNormalPass`**: Render depth, world normals, roughness, albedo, and screen-space velocity once; feed it to `SSGIEffect`, `TRAAEffect`, and `MotionBlurEffect` (when `SSGIEffect` is active, omit the separate `RenderPass` and place `TRAAEffect`/`MotionBlurEffect` in a second `EffectPass`).
- **GGX VNDF + Env-Map MIS**: Pair cosine-weighted diffuse rays with `SampleGGXVNDF` specular rays and equirectangular environment-map importance sampling (`misHeuristic`), packing diffuse and specular outputs (`packTwoVec4`) plus `packHalf2x16(vec2(rayLength, roughness))`.
- **Hit-point temporal reprojection**: Reproject specular reflections using world-space `rayLength` (virtual hit position) rather than surface UVs, with roughness-scaled neighborhood clamping and log color-space transforms to suppress fireflies and trailing.
- **Poisson bilateral denoiser**: Run an 8-tap Poisson-disk filter in log-luminance space (`log(color + 1)` / `exp(color) - 1`) edge-stopped by normal, depth, roughness, specular, luminance, and temporal sample age.

See [REFERENCES.md](REFERENCES.md) for the full `@0beqz` repository list and cited graphics papers.

## Gotchas, symptom first

- **Colour halo around foreground silhouettes** → thickness too large, or hit test lacks the previous-sign check.
- **Concentric rings on the floor** → constant march offset; jitter it per ray and frame.
- **Floor darkens uniformly** → origin offset too small, rays hit their own pixel.
- **SSGI frozen after a few seconds** → frame index not advancing, or window uncapped.
- **Depth reads look blocky or wrong** → MSAA left on the scene pass; set `samples: 0`.

## Accessibility and lifecycle

Pause on `document.hidden` and off-screen; reset history on resume. Arrow-key orbit on a focusable canvas. Under reduced motion there is nothing decorative to stop, but avoid auto-orbiting cameras because they keep the image permanently noisy.

## Verify

- [ ] With accumulation off, eight-ray noise is visible; with it on, the image settles within ~30 frames.
- [ ] Orange bleeds onto the floor and teal onto the sphere in *Indirect only*.
- [ ] Orbiting resets the frame counter; *Keep* mode visibly smears.
- [ ] Raising thickness to 1.0 shows leaking; 0.2 does not.
- [ ] Console clean at 390 px and 1440 px.

--------------------------------------------------------------------------------
