# References — Screen-Space Global Illumination & Real-Time Realism

## Core Sources

1. **Maxime Heckel — "Lighting That Feels Just Right" (Nov 2026)**
   - WebGPU / TSL post-processing SSGI pipeline (G-buffer MRT, 8 cosine-weighted hemisphere rays, view-space depth-crossing test, jittered temporal accumulation) and its handoff to world-space probe GI (`3d-probe-global-illumination`).

2. **Faraz Shaikh (`@0beqz`) — [`0beqz/realism-effects`](https://github.com/0beqz/realism-effects)**
   - Production WebGL2 `postprocessing` suite for Three.js:
     - **`SSGIEffect` / `SSREffect`** (`src/ssgi/SSGIEffect.js`, `src/ssgi/shader/ssgi.frag`): Blue-noise + GGX VNDF (`SampleGGXVNDF`) specular sampling, cosine hemisphere diffuse sampling, equirectangular env-map importance sampling (`EquirectHdrInfo`, `misHeuristic`), box-projected env maps (`BOX_PROJECTED_ENV_MAP`), `packTwoVec4` diffuse/specular packing, and `packHalf2x16(vec2(rayLength, roughness))`.
     - **`VelocityDepthNormalPass` / `GBufferPass`** (`src/gbuffer/GBufferPass.js`): Depth, world normals, roughness, albedo, and screen-space velocity vectors.
     - **`TemporalReprojectPass`** (`src/temporal-reproject/TemporalReprojectPass.js`, `src/temporal-reproject/shader/temporal_reproject.frag`): World-space hit-point reprojection for specular using `rayLength`, confidence-weighted accumulation, roughness-scaled neighborhood clamping (`clampNeighborhood`), and log color-space transforms.
     - **`Denoiser` / `PoissonDenoisePass`** (`src/denoise/Denoiser.js`, `src/denoise/shader/poisson_denoise.frag`): 8-tap Poisson-disk bilateral filter in log-luminance space (`log(color + 1)` / `exp(color) - 1`), edge-stopped by normal, depth, roughness, specular, luminance, and temporal sample age (`1 / pow(t.a + 1, 1.2 * phi)`).
     - **`TRAAEffect`** (`src/traa/TRAAEffect.js`): Sub-pixel camera projection jitter/unjitter over `TemporalReprojectPass`.
     - **`MotionBlurEffect`** (`src/motion-blur/MotionBlurEffect.js`): Velocity-buffer sampling dithered with animated blue noise.
     - **`HBAOEffect` / `SSAOEffect` / `GTAOEffect`**: Ambient occlusion + `PoissonDenoisePass` (crediting [N8python/ssao](https://github.com/N8python/ssao)), depth-derived normals, and temporal bent-normal accumulation (`hbao-temporal-bent-normal`).
   - Active R&D branches: `v2`, `ssgi-v3`, `poisson-recursive`, `clip-space-tracing`, `hbao-v2`, `hbao-temporal-bent-normal`, `spec-diffuse-denoise`, `better-reprojection`, `gdata-in-float32`.

## Related `@0beqz` Three.js Repositories

- [`0beqz/screen-space-reflections`](https://github.com/0beqz/screen-space-reflections) — SSR in Three.js with Halton(2,3) jitter, temporal resolve, and box blur ([demo](https://screen-space-reflections.vercel.app/))
- [`0beqz/enhance-shader-lighting`](https://github.com/0beqz/enhance-shader-lighting) — `onBeforeCompile` patch for `getIBLIrradiance` / `getIBLRadiance` adding AO/lightmap power curves, roughness-weighted smoothing, and hemisphere/sun bounce ([demo](https://enhance-shader-lighting.vercel.app/))
- [`0beqz/three-billboard-reflection`](https://github.com/0beqz/three-billboard-reflection) — Analytical ray-plane reflections for Three.js based on Guido Schmidt's BBR algorithm
- [`0beqz/vanilla-threejs-meshreflectormaterial-example`](https://github.com/0beqz/vanilla-threejs-meshreflectormaterial-example) — Vanilla Three.js port of `drei`'s `MeshReflectorMaterial`
- [`0beqz/lightmap_interior_test`](https://github.com/0beqz/lightmap_interior_test) — Baked lightmap interior ([demo](https://0beqz.github.io/lightmap_interior_test/))
- [`0beqz/three.js-studio-human-demo`](https://github.com/0beqz/three.js-studio-human-demo) — Blender-baked studio scene ([demo](https://0beqz.github.io/three.js-studio-human-demo/))
- [`0beqz/env-map-importance-sampling-tiles`](https://github.com/0beqz/env-map-importance-sampling-tiles) — Environment-map importance-sampling tiles for Monte Carlo ray tracing

## Distilled Graphics Papers & Technical References

### Screen-Space GI, Horizon & Contact Shadows
- **[Screen Space Indirect Lighting with Visibility Bitmask (Therrien et al., arXiv:2301.11376)](https://arxiv.org/pdf/2301.11376.pdf)** · [Shadertoy](https://www.shadertoy.com/view/dsGBzW)
  - *Key takeaway*: Represents hemisphere slice occlusion as a bitmask ($O(1)$ bitwise operations per sector), allowing indirect light to pass behind thin surfaces of constant thickness and supporting multiple visibility cones rather than a single bent normal.
- **[Horizon-Based Indirect Lighting (HBIL)](https://drive.google.com/file/d/1fmceYuM5J2s8puNHZ9o4OF3YjqzIvmRR/view)**
  - *Key takeaway*: Extends HBAO's horizon-angle marching to integrate indirect diffuse bounce from screen-space neighbors along each azimuthal slice.
- **[Pyramid HBAO — Scalable Horizon-based AO (Astapov et al.)](https://ceur-ws.org/Vol-3027/paper5.pdf)**
  - *Key takeaway*: Uses hierarchical depth pyramids to accelerate horizon marching and keep HBAO scalable at large world-space radii.
- **[SSRTGI Toughest Challenge in Real-Time 3D (80.lv)](https://80.lv/articles/ssrtgi-toughest-challenge-in-real-time-3d/)**
  - *Key takeaway*: Practical trade-offs in screen-space raytraced GI—biasing, thin-surface thickness leaks, and bent-normal vs. full-hemisphere sampling.
- **[Inside Bend: Screen Space Shadows (Bend Studio)](https://www.bendstudio.com/blog/inside-bend-screen-space-shadows/)** · [Panos Karabelas](https://panoskarabelas.com/posts/screen_space_shadows/)
  - *Key takeaway*: Short screen-space depth marches toward the light source to add crisp contact shadows on small geometry missed by shadow-map cascades.
- **[N8python/ssao](https://github.com/N8python/ssao)**
  - *Key takeaway*: Source of `PoissonDenoisePass` and depth-derived normal reconstruction (`computeWorldNormal` using minimum of forward/backward finite differences).

### Raytracing & Screen-Space Reflections
- **[Exploring Raytraced Future in Metro Exodus (GTC 2019, 4A Games / NVIDIA)](https://developer.download.nvidia.com/video/gputechconf/gtc/2019/presentation/s9985-exploring-ray-traced-future-in-metro-exodus.pdf)**
  - *Key takeaway*: Real-time GI architecture combining diffuse bounce, temporal accumulation, and spatial-temporal denoising without precomputation.
- **[Stochastic All the Things: Raytracing in Hybrid Real-Time Rendering (Stachowiak, SEED EA)](https://media.contentapi.ea.com/content/dam/ea/seed/presentations/dd18-seed-raytracing-in-hybrid-real-time-rendering.pdf)**
  - *Key takeaway*: Importance-sampled stochastic reflections, parallax-corrected reflection motion vectors, and spatio-temporal variance-guided filtering.
- **[Adventures in Hybrid Rendering (Dihara Wijetunga)](https://diharaw.github.io/post/adventures_in_hybrid_rendering/)**
  - *Key takeaway*: Practical G-buffer layout, BRDF importance sampling, and SVGF-style temporal/atrous denoising for hybrid pipelines.
- **[Real-Time Reflections in Mafia III and Beyond (GDC 2018)](https://ubm-twvideo01.s3.amazonaws.com/o1/vault/gdc2018/presentations/Sobek_Martin_Real-time_Reflections_in_MafiaIII.pdf)** · [Epsilon Engine SSR](https://imanolfotia.com/blog/1) · [kode80 SSR](http://www.kode80.com/blog/2015/03/11/realism-effects-in-unity-5/) · [Screen Space Glossy Reflections](http://roar11.com/2015/07/screen-space-glossy-reflections/) · [Lettier SSR](https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html)
  - *Key takeaway*: View-space vs. screen-space DDA ray marching, binary-search hit refinement, and screen-edge/facing-angle fade heuristics.

### Temporal Reprojection & TAA
- **[Temporal Reprojection Anti-Aliasing in INSIDE (Pedersen, Playdead)](http://s3.amazonaws.com/arena-attachments/655504/c5c71c5507f0f8bf344252958254fb7d.pdf?1468341463)**
  - *Key takeaway*: Sub-pixel jitter + rounded 3×3 neighborhood min/max AABB **clipping** (toward AABB center in YCoCg) instead of clamping to prevent color-space clustering and ghosting.
- **[High Quality Temporal Supersampling (Karis, UE4)](https://de45xmedrsdbp.cloudfront.net/Resources/files/TemporalAA_small-59732822.pdf)**
  - *Key takeaway*: Variance/min-max neighborhood constraints, luminance-weighted blending to tame specular aliasing, and velocity dilation.
- **[Temporally Reliable Motion Vectors for Real-time Ray Tracing (Zeng et al., Eurographics 2021)](https://sites.cs.ucsb.edu/~lingqi/publications/paper_trmv.pdf)**
  - *Key takeaway*: Traditional surface motion vectors fail on shadows, glossy reflections, and occlusions; proposes virtual/stochastic glossy reflection motion vectors and dual motion vectors to cut ghosting and overblur.
- **[Reprojecting Reflections (Bitsquid)](http://bitsquid.blogspot.com/2017/06/reprojecting-reflections_22.html)**
  - *Key takeaway*: Parallax-corrected reflection reprojection using ray-hit depth so reflections track camera motion instead of smudging across the surface.
- **[Temporal AA and the Quest for the Holy Trail (elopezr)](https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/)** · **[Visibility TAA (John Hable)](http://filmicworlds.com/blog/visibility-taa-and-upsampling-with-subsample-history/)** · **[Filmic SMAA (Activision)](https://research.activision.com/publications/archives/filmic-smaasharp-morphological-and-temporal-antialiasing)**
  - *Key takeaway*: Subsample history management, Catmull-Rom history resampling to avoid sharpening/blurring drift, and morphological + temporal hybridization.

### Motion Blur & Lens Distortion
- **[Per-Object Motion Blur (John Chapman)](http://john-chapman-graphics.blogspot.com/2013/01/per-object-motion-blur.html)** · [threejs-sandbox motionBlurPass](https://github.com/gkjohnson/threejs-sandbox/blob/master/motionBlurPass/src/CompositeShader.js)
  - *Key takeaway*: Combines camera and per-object velocity into a screen-space velocity buffer and marches along it with blue-noise jittered offsets.
- **[Radial Lens Undistortion Filtering (Marco Diiga)](https://marcodiiga.github.io/radial-lens-undistortion-filtering)** · [WSCG 2018](http://wscg.zcu.cz/WSCG2018/Poster/P83-full.PDF)
  - *Key takeaway*: Two-coefficient polynomial radial distortion $r_d = r(1 + k_1 r^2 + k_2 r^4)$ for barrel/pincushion lens effects.
