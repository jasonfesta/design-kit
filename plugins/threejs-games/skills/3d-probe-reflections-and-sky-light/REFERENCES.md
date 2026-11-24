# References — Probe Reflections and Sky Light

## Source

- **Maxime Heckel — "Lighting That Feels Just Right" (Nov 17, 2026).** https://blog.maximeheckel.com/posts/lighting-that-feels-just-right/
  Section used: *Reflections, Sky Light, and Final Touches* — material MRT (`roughness`, `materialMetalness`), `traceReflection` with Schlick Fresnel and `(1 − roughness)²` mirror weight, one-bounce reflected radiance lit by `sampleProbes`, `skyTexel` equirectangular bake in its own compute pass, `sampleSky` with the `atan2(0, 0)` pole guard, and sky misses feeding both probes and reflections.
- Maxime Heckel — earlier articles on atmospheric scattering and volumetric lighting (the `atmosphere()` function the sky bake calls).

## Background

- Schlick, *An Inexpensive BRDF Model for Physically-based Rendering* (1994) — the Fresnel approximation.
- Nishita et al. / Scratchapixel *Simulating the Colors of the Sky* — single-scattering Rayleigh + Mie with exponential density, the model used by the demo's sky bake.
- Kasten & Young (1989) — relative optical air mass, used to tint the sun's radiance at low elevations.
- For glossy (rough) reflections beyond a mirror fade: split-sum prefiltered environment probes (Karis 2013) or Cody Bennett's Radiance Cascades glossy GI.
