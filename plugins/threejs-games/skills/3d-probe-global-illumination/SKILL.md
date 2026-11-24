---
name: 3d-probe-global-illumination
description: Add real-time, world-space probe-based global illumination (DDGI-style irradiance probes) to a Three.js WebGPU/TSL, WGSL, or WebGL2 scene so bounced light, colour bleeding and emissive fill survive camera moves and adapt smoothly when lights change. Covers the probe grid and bounds, a six-lobe probe atlas, compute or fragment probe updates with cosine-weighted rays, one-bounce sun plus emission gathering, inside-geometry probe rejection, 3×3×3 quadratic B-spline probe blending with visibility traces, n² lobe weighting, temporal accumulation and hysteresis. Use for indirect lighting, bounce light, colour bleeding, light probes, irradiance volumes, DDGI, "lighting that feels just right", soft tinted shadows, or replacing a flat ambient term. metadata: icon: ✨
---

# 3D Probe Global Illumination

Estimate indirect light at fixed world-space probes, store it in a small atlas, and let every visible pixel blend its nearest probes. The mechanism: **light is gathered once per probe in world space and reused by every pixel, so off-screen geometry still bounces light and the history never depends on the camera.** Remove the world-space step and you are back to screen-space GI, which loses everything off-camera and must reset on every orbit.

Reach for neighbouring skills instead when:

- the scene is tiny, mostly on screen, and the camera is locked → `3d-screen-space-global-illumination` is simpler;
- you need mirror reflections or a sky that lights the scene → build this first, then add `3d-probe-reflections-and-sky-light`;
- you only need directional sun and a sky backdrop → `3d-sky-background`, `arch-daylight-and-interior-glow`.

Source: Maxime Heckel, "Lighting That Feels Just Right" (Nov 2026), where probes replaced SSGI in a WebGPU/TSL courtyard of boxes, spheres and arches with near-static sun and emissive props. Read [REFERENCES.md](REFERENCES.md) for papers and links.

## Disclose the stack

The article ships in **Three.js · WebGPU · TSL/WGSL compute**. The demo in `demo/` is a dependency-free port in **Vanilla JavaScript · WebGL2 · GLSL ES 3.0**: a fragment pass replaces the compute dispatch, one fragment per atlas texel. Keep the algorithm identical whichever backend you use; never claim the demo uses Three.js.

## 1. Define the probe volume

| Parameter | Demo value | Rule |
| --- | --- | --- |
| `PROBE_MIN` / `PROBE_MAX` | (−2.85, 0.15, −1.85) / (2.85, 2.75, 2.6) | Wrap only the region where GI matters; probes outside the scene waste rays. |
| `grid` | 9 × 5 × 7 = 315 probes | Spacing ≈ the size of the smallest object whose bounce you want to see. |
| `probeSpacing` | `(max − min) / (grid − 1)` per axis | A vec3; non-uniform spacing is fine. |
| lobes | 6 (±X, ±Y, ±Z) | One cosine hemisphere per axis direction. |
| atlas | `width = grid.x × 6`, `height = grid.y × grid.z`, RGBA16F | Pixel `(cell.x × 6 + lobe, cell.y + cell.z × grid.y)`. |

Allocate **two** atlases and ping-pong: read last frame's estimate, write the new one, swap.

## 2. Update every probe lobe

One invocation per atlas texel (`compute(width × height, [64])` in TSL, or one full-screen fragment draw):

1. Decode `cell` and `lobe` from the texel; compute the probe's world position.
2. If the probe sits **inside solid geometry**, write `alpha = 0` and return. Alpha is the validity flag for the whole lookup. Without it, a probe buried in a wall gathers only back faces and leaks black blotches onto the wall's surface.
3. Build a tangent frame around the lobe axis (swap the helper axis to Y when `|n.z| > 0.999`, otherwise `cross` collapses).
4. Trace `rays` cosine-weighted directions (8 / 16 / 32; demo 16). Stratify with `u1 = (i + rand.x) / rays`, `r = sqrt(u1)`, `φ = 2π·rand.y`, `dir = t·r·cosφ + b·r·sinφ + n·sqrt(1 − u1)`. Vary the seed every frame (`pixel + frame × (29, 93)`); identical samples freeze identical errors into the history.
5. For each hit that faces the probe (`dot(hitNormal, −dir) > 0`):
   - add `emission` (gate it with a night factor if emitters switch on);
   - cast a shadow ray from `hitPos + hitNormal × 0.005` toward the sun; if unblocked add `albedo × (1 − metalness) × sunRadiance × cosθ / π`.
6. `fresh = incoming / rays` — divide by **all** rays, misses included. Dividing by hits only brightens probes that see little geometry and makes open areas glow.

## 3. Blend history with hysteresis

```wgsl
if (frame == 0u) { return vec4f(fresh, 1.0); }
let history = textureLoad(previous, pixel, 0);
let count   = min(history.a + 1.0, PERSISTENT_HISTORY_CAP);          // demo cap 96
let window  = min(1.0 / (1.0 - hysteresis) + f32(stableFrames), PERSISTENT_HISTORY_CAP);
let retention = min(1.0 - 1.0 / window, 1.0 - 1.0 / count);
return vec4f(mix(fresh, history.rgb, retention), count);
```

- `hysteresis = 0.95` → 95 % history, 5 % fresh once warm. Range 0.85–0.98. Too low is noisy; too high lags visibly behind a moving sun.
- `stableFrames` increments every frame the lighting is unchanged and **resets to 0 when a light moves; the atlas is never cleared.** Resetting the atlas instead (`frame = 0`) is the failure the demo's *Reset atlas* mode shows: every slider nudge drops back to a noisy first frame.
- Store `count` in alpha so `alpha ≥ 1` also means "valid".
- Expect mild ghosting after abrupt light jumps. That is the price; this method suits static or slowly changing lights.

## 4. Shade visible pixels from the atlas

In the post-processing (or forward) pass, rebuild world position and normal (depth + inverse projection + camera world matrix, or MRT outputs), then:

```wgsl
let p = worldPosition + n * 0.005;
let coordinate = clamp((p - probeMin) / probeSpacing, vec3f(0.0), vec3f(gridSize - vec3i(1)));
let base = vec3i(floor(coordinate + 0.5)) - vec3i(1);       // 3×3×3 neighbourhood
// for each cell: skip out-of-grid, skip alpha < 0.5,
// skip if traceWorld(p, dirToProbe).distance < distanceToProbe − 0.01  (probe behind a wall)
let d = abs(vec3f(cell) - coordinate);
let w = select(0.5 * (1.5 - d) * (1.5 - d), 0.75 - d * d, d < vec3f(0.5));   // quadratic B-spline
let weight = w.x * w.y * w.z;
// lobe per axis: axis * 2 + (n[axis] < 0 ? 1 : 0); diffuse += lobeRGB * n[axis] * n[axis]
return albedo * incoming / max(totalWeight, 1e-5);
```

- Weighting lobes by `n²` sums to 1 for any unit normal. Weighting by `|n|` over-brightens diagonal surfaces by up to √3.
- The visibility trace is what stops light leaking through thin walls. It costs up to 27 rays per pixel; on large scenes replace it with DDGI's per-probe depth moments (see references) or a 2×2×2 trilinear neighbourhood.
- Add the result to the direct lighting before tone mapping: `final = direct + indirect`. Use the metal-weighted diffuse albedo (`albedo × (1 − metalness)`).

## 5. Wire TSL / Three.js

- Probe storage: `new THREE.StorageTexture(width, height)` × 2; write with `textureStore(histories[1 − index], pixel, updateLighting(pixel, texture(previous)))` inside `Fn(() => …)().compute(width * height, [64])`, then `renderer.compute(updates[readIndex])`.
- G-buffer: `pass(scene, camera, { samples: 0 })` with `setMRT(mrt({ output, normal: normalWorld, albedo: materialColor }))`. `samples: 0` keeps the depth texture single-sampled and readable.
- Mark intermediate passes `outputColorTransform = false`; only the final pass tone-maps and converts to sRGB.
- `traceWorld` here is analytic (ray–sphere, slab ray–box). For meshes, trace against a BVH or use Three.js's built-in probe GI rather than inventing one.

## Gotchas, symptom first

- **Black splotches on walls near probes** → probes inside geometry were not rejected (step 2) or the lookup ignores alpha.
- **Light bleeding through a wall into a dark room** → visibility trace skipped, or the `0.01` bias is larger than the wall thickness.
- **Whole volume flashes noisy whenever anything changes** → you reset the atlas instead of `stableFrames`.
- **Box edges flicker in the atlas** → ray direction components of exactly 0 produce `inf/NaN` in the slab test; clamp `|rd|` to ≥ 1e-6 before inverting.
- **NaN spreads across frames** → one bad texel survives every `mix`. Guard `atan`, `normalize(0)` and divisions before they reach the history.
- **Atlas brightness wrong after switching to half floats** → you rendered with an sRGB output transform on an intermediate pass.

## Cost

Probe cost is `probes × 6 × rays` traces per frame, independent of resolution (315 × 6 × 16 ≈ 30k rays: trivial). Pixel cost is dominated by the 27 visibility traces in the lookup, so render the GI composite at 0.6–0.75 scale with DPR ≤ 2 before you cut probes. Doubling grid density costs 8× update work and storage; double rays first.

## Accessibility and lifecycle

Pause on `document.hidden` and when the canvas leaves the viewport; clamp `dt` to 1/30 s. Under `prefers-reduced-motion`, keep the probe accumulation (it converges, it does not animate) but replace sun sweeps with discrete steps. Orbit must work with arrow keys on a focusable canvas with an `aria-label`.

## Verify

- [ ] Orbiting does not reset or visibly change the indirect light.
- [ ] Moving the sun drifts the bounce light over ~1 s with hysteresis 0.95; reset mode visibly re-noises.
- [ ] Night/emissive toggle tints nearby surfaces with no extra tracing code.
- [ ] *Indirect only* view shows colour bleeding (orange on the floor, teal on the sphere) and no black blotches.
- [ ] No light leaks through the thinnest wall at the chosen probe spacing.
- [ ] Console clean at 390 px and 1440 px; DPR capped at 2.

--------------------------------------------------------------------------------
