# References — Probe Global Illumination

## Source

- **Maxime Heckel — "Lighting That Feels Just Right" (Nov 17, 2026).** https://blog.maximeheckel.com/posts/lighting-that-feels-just-right/
  Sections used: *Estimating Light with Probes* (world-space probes, six-lobe atlas, compute update, `traceWorld`, `sampleProbes` with 3×3×3 quadratic weights and visibility rays) and *Hysteresis* (`PERSISTENT_HISTORY_CAP`, `stableFrames`, retention formula). Implemented there in Three.js WebGPU + TSL/WGSL compute.

## Papers and explainers the article recommends

- Majercik, Guertin, Nowrouzezahrai, McGuire — *Dynamic Diffuse Global Illumination with Ray-Traced Irradiance Fields* (JCGT 2019). The production DDGI design: octahedral irradiance + depth-moment probes, Chebyshev visibility instead of per-pixel visibility rays, probe relocation and classification.
- Bartosz Ciechanowski — *Lights and Shadows*. Intuition for diffuse cosine falloff and indirect light.
- Kyle Halladay — *Ray-Sphere Intersection*.
- Scratchapixel — *Ray-Box Intersection* (slab method).
- *Cosine-weighted hemisphere sampling* (pemathedev note referenced in the article): why sampling proportional to cos θ lowers variance for diffuse gathering.

## Going further

- Three.js ships its own probe-based GI for production use; the article explicitly recommends it over its teaching implementation.
- Tracing against triangle meshes needs a BVH (e.g. `three-mesh-bvh`) instead of the analytic sphere/box `traceWorld`.
- Cody Bennett's Radiance Cascades work (noiseless single-bounce glossy GI) is the next technique the article points to.
