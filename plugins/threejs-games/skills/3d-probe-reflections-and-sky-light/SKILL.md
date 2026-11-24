---
name: 3d-probe-reflections-and-sky-light
description: Extend a world-space probe GI system with traced mirror reflections and atmospheric sky light in Three.js WebGPU/TSL, WGSL, or WebGL2. Covers material MRT for roughness and metalness, reflect-and-trace against world geometry, lighting the reflected hit with emission, shadowed sun and the probe atlas, Schlick Fresnel and roughness mirror weight, baking a single-scattering Rayleigh and Mie sky into an equirectangular texture only when the sun moves, feeding sky light into probe misses and reflection misses, sun radiance tinted by air mass, and the atan pole NaN guard. Use for reflections of off-screen or hidden faces, polished floors, metal objects, sky-tinted shadows, sunrise and sunset bounce light, or replacing black screen-space reflection holes. metadata: icon: ✨
---

# 3D Probe Reflections and Sky Light

Two additions that reuse an existing probe GI pipeline instead of adding new ones. The mechanism: **reflection rays and probe rays share one world-space tracer and one probe atlas, and the sky is just another light source sampled whenever either kind of ray misses.** Reflections therefore show faces the camera never rendered, and the sky's colour reaches every shadow through the probes.

Prerequisite: `3d-probe-global-illumination` (probe grid, atlas, `traceWorld`, `sampleProbes`, hysteresis). Use `3d-sky-background` when you only need a visible sky without lighting, and `3d-sky-rays` for crepuscular shafts.

Source: Maxime Heckel, "Lighting That Feels Just Right" (Nov 2026), final section, where a reflective wall exposed the black holes of screen-space reflections and his atmospheric-scattering shader became the scene's sky light. See [REFERENCES.md](REFERENCES.md).

## Disclose the stack

Article: **Three.js · WebGPU · TSL/WGSL compute**. Demo: **Vanilla JavaScript · WebGL2 · GLSL ES 3.0**, analytic spheres and boxes, no libraries.

## 1. Store material properties

Add roughness and metalness to the G-buffer, and write a metal-aware albedo:

```js
scenePass.setMRT(mrt({
  output,
  normal: normalWorld,
  albedo: mix(diffuseColor, materialColor, materialMetalness),
  material: vec4(roughness, materialMetalness, 0, 1),
}));
```

## 2. Trace one reflection per pixel

```wgsl
let mirrorWeight = (1.0 - roughness) * (1.0 - roughness);   // fade, NOT a GGX blur
if (mirrorWeight < 0.0001) { return vec3f(0.0); }
let v = normalize(cameraPosition - worldPosition);
let f0 = mix(vec3f(0.04), albedo, metalness);
let fresnel = f0 + (1.0 - f0) * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 5.0);
let direction = reflect(-v, n);
let hit = traceWorld(worldPosition + n * 0.005, direction);
if (hit.id < 0) { return sampleSky(direction) * fresnel * mirrorWeight; }
if (dot(hit.normal, -direction) <= 0.0) { return vec3f(0.0); }
// radiance at the hit = emission + shadowed sun on diffuseAlbedo + sampleProbes(atlas, p, hit.normal, diffuseAlbedo)
return radiance * fresnel * mirrorWeight;
```

- One bounce only: the hit surface contributes emission and diffuse light, never another mirror ray. Recursion multiplies cost per pixel for little visible gain.
- Metals reflect tinted by albedo through F0 and get no diffuse term (`albedo × (1 − metalness)`). Without that, polished brass looks like painted plastic with a glossy coat.
- Combine additively: `final = sceneColor + indirect + reflection`.
- `mirrorWeight` makes rough materials lose their reflection rather than blur it. For glossy blur you need multiple jittered rays plus accumulation, or a split-sum prefiltered probe; say so instead of pretending.

## 3. Bake the sky into a texture

Run atmospheric scattering in its own pass/compute, **only when the sun changes**, into an equirectangular texture (demo 256 × 128 RGBA16F):

```wgsl
let uv = (vec2f(pixel) + 0.5) / vec2f(SKY_WIDTH, SKY_HEIGHT);
let phi = (uv.x - 0.5) * 2.0 * PI;
let theta = uv.y * PI;
let direction = vec3f(sin(theta) * cos(phi), cos(theta), sin(theta) * sin(phi));
return vec4f(atmosphere(direction, sunDirection, intensity, haze), 1.0);
```

Demo atmosphere: single scattering, 16 view samples × 6 light samples, Earth radius 6360 km, atmosphere 6420 km, Rayleigh β = (5.8, 13.5, 33.1) × 10⁻⁶ m⁻¹ with scale height 7994 m, Mie β = 21 × 10⁻⁶ with 1200 m and g = 0.76, intensity 20. Running this per probe ray instead costs `probes × 6 × rays × 96` density samples every frame for an answer that only changes with the sun.

Tint the sun's own radiance by the same extinction (air mass from Kasten–Young) so the direct light turns orange at the same moment the sky does. A white sun under a sunset sky reads as a composite.

## 4. Sample the sky with a pole guard

```wgsl
var longitude = 0.0;
if (abs(d.x) + abs(d.z) > 0.000001) { longitude = atan2(d.z, d.x); }
let uv = vec2f(longitude / (2.0 * PI) + 0.5, acos(clamp(d.y, -1.0, 1.0)) / PI);
// bilinear: wrap x, clamp y
```

Cosine-weighted probe rays on a +Y lobe hit the exact pole regularly. `atan2(0, 0)` is undefined on GPUs; one NaN texel then survives every hysteresis `mix` and spreads black through the atlas.

Feed misses:

- probe update: `if (hit.id < 0) { incoming += sampleSky(dir); }` — no other change, still divide by all rays;
- reflections: return `sampleSky(direction) × fresnel × mirrorWeight` instead of black;
- backdrop: draw `sampleSky(viewDir)` plus a small sun disc so the visible sky and the lighting agree.

## Gotchas, symptom first

- **Atlas slowly fills with black from the top** → missing pole guard.
- **Reflections black where the back of an object should be** → you are still using screen-space reflections; trace against world geometry.
- **Sunset sky but white shadows and white sunlight** → sun radiance not tinted, or sky not feeding probe misses.
- **Frame time spikes while the sun animates** → the sky bake runs every frame; that is acceptable during motion, but it must stop when the sun stops.
- **Rough floor still mirror-sharp** → roughness not in the MRT, or the mirror weight is linear instead of squared.

## Cost

Per pixel: one reflection trace, one shadow trace, and up to 27 probe visibility traces at the hit — roughly doubling the GI composite. Skip it where `mirrorWeight < 0.0001`, and render at 0.6–0.75 scale. Sky bake: 256 × 128 × 96 density samples, only on sun change.

## Accessibility and lifecycle

Animate sun transitions over about 2.4 s with ease-in-out; under reduced motion, jump to the target elevation. Pause when hidden. Keyboard orbit on a labelled, focusable canvas.

## Verify

- [ ] The polished floor reflects the underside and back of the orange sphere.
- [ ] Lowering the sun to 3° turns sky, sunlight and shadow tint warm together; the sky bake counter stops when the sun stops.
- [ ] Turning *Sky light into probes* off leaves shadowed faces lit only by bounce.
- [ ] Floor roughness 1.0 removes its reflection; 0.0 gives a mirror with Fresnel brightening at grazing angles.
- [ ] No NaN/black spread after several minutes; console clean at 390 px and 1440 px.

--------------------------------------------------------------------------------
