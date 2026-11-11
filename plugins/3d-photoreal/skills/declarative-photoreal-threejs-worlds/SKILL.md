---
name: declarative-photoreal-threejs-worlds
description: >-
  Build ultra-photorealistic, 360° Actor-Ready Three.js 3D worlds and
  environments by combining a fast ( 5 ms) declarative spatial constraint
  solver & sightline auto-repair engine (HeliosDSL SG0–SG4, G8–G9, AABB, and
  Ring-3 horizon closure gates) with Takram-grade volumetric cloud
  raymarching, Chappuis ozone sky, live sun-disk-free PMREM IBL, hybrid
  AI-generated stochastic PBR + analytical 3D erosion/derivative shaders,
  finite-depth dispersive planar-mirror water, and an 8-view 360° VLM realism
  climb.
metadata:
  icon: ✨
---

# Declarative Photorealistic 360° Three.js Worlds (Spatial Compiler + Optical Realism Engine)

Use this skill when building **photorealistic 3D worlds, environments,
architectural sanctuaries, or interactive 360° stages** that require **both**:

1.  **Compile-Time Mathematical Spatial Guarantees (`< 5 ms` CPU Solver)**: Zero
    floating geometry, zero AABB interpenetration, guaranteed foundation
    embedment, 100% unobstructed camera sightlines, and automatic layout repair
    before a single GPU buffer is allocated (inspired by `HeliosDSL`).
2.  **Optical, Atmospheric & Biophysical Photorealism (Three.js + Custom
    GLSL)**: Full 360° concentric horizon continuity (`r = 0m` to `6,000m+`),
    Takram/Nubis volumetric clouds + Chappuis ozone sky, live sun-disk-free
    `PMREMGenerator` IBL, hybrid AI-generated PBR textures + derivative-weighted
    Swiss erosion shaders, `2048×2048` botanical cutout atlases, and dispersive
    planar-mirror water (inspired by `photorealistic-threejs-environments` and
    `photorealistic-threejs-generation`).

--------------------------------------------------------------------------------

## 1. Unified Architecture: Declarative World Compiler -> Photoreal Three.js Stage

Never place 3D structures, boulders, trees, or cameras blindly with ad-hoc
coordinates, and never rely on textureless procedural grids for surface realism.
Every build follows a **two-layer architecture**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: Declarative WorldSpec + < 5 ms CPU Spatial Solver & Auto-Repair    │
│  • Shared CPU/GPU Analytical Heightfield H(x, z) + Concentric Ring Profiles │
│  • 8 Compile-Time Gates: SG0 (Stage Clear), SG1 (Foundations >= 1.5m),      │
│    SG2 (Water Collar & C2 Shore), SG3 (8-Pt Slope Grounding),               │
│    SG4 (Sub-Part Weld >= 0.04m), G8 (Cam Clearance >= 1.2m),                │
│    G9 (Ray-Slab Sightline Tube), AABB + RING3 (0 Overlap & 360° Horizon)    │
│  • Fast 96×96 Bilinear Height/Slope LUT for 75,000+ Grounded Grass Blades   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Emits Verified CompiledWorld JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: Photorealistic Three.js 360° Renderer & Hybrid Shader Pipeline     │
│  • 4 Concentric 360° Rings (r = 0..18m Stage -> r = 900..6,000m+ Skirt)     │
│  • Takram Spherical Ozone Sky + 20-Step IGN Volumetric Clouds + Cloud Shadow│
│  • Live Sun-Disk-Free PMREM Cubemap IBL + 4096² 9-Tap Poisson PCF Shadows   │
│  • Hybrid Stochastic Hex-Tiled Photo-PBR + Swiss Erosion + Safe Derivatives │
│  • Finite-Depth Dispersive 1024² Planar Mirror Water + Wet Porosity Optics  │
│  • 2048² Botanical Cutout Atlases + Planckian Blackbody Fire + Test Actors  │
└─────────────────────────────────────────────────────────────────────────────┘
```

--------------------------------------------------------------------------------

## 2. Layer 1: Shared Heightfield Contract & Concentric 360° Ring Topology

A world fails if it only looks good from one locked camera angle or ends in an
abrupt `160m × 160m` square patch edge. Drive both the CPU spatial solver and
GPU vertex/fragment shaders from a **single deterministic terrain contract**
across **four concentric 360° spatial rings** around `(0, groundY, 0)`:

1.  **Ring 0 — The Actor Staging Zone (`r = 0m - 18m`)**:
    -   Unobstructed or intentionally framed clearing, plaza, bridge deck, or
        shoal centered at `(0, groundY, 0)` where a test actor
        (`reference_spheres`, `monolith`, `explorer_rover`, `empty_stage`) or
        custom glTF asset can be placed and orbited `360°`.
    -   Expose `window.ENVIRONMENT_API.getGroundAt(x, z) -> { y, normal,
        wetness, materialType }`.
2.  **Ring 1 — Near-Field Framing & Architectural Landmarks (`r = 18m - 140m`,
    full `360°`)**:
    -   Grounded architectural structures (bridges, pavilions, rotundas,
        facades, shrines, lighthouses), hero trees, and river/shoreline boulders
        solved by the CPU constraint engine across all four quadrants (`0° N`,
        `90° E`, `180° S`, `270° W`) with deliberate sightline corridors.
3.  **Ring 2 — Midground Landforms & Instanced Biome Density (`r = 140m - 900m`,
    full `360°`)**:
    -   Continuous Swiss-eroded terrain relief (`evalSwissErosionFBM`) populated
        via `THREE.InstancedMesh` (`5,000-75,000` instances sampled via a
        `96×96` bilinear height/slope LUT in `< 2.5 ms`).
4.  **Ring 3 — Closed 360° Distant Horizon Vista Skirt (`r = 900m - 6,000m+`,
    full `360°`)**:
    -   Continuous 360° mountain massifs, interlocking canyon walls, or ocean
        curvature whose outer skirt vertices sit below the local ground plane
        and whose upper ridges blend into the physical sky via azimuth-coupled
        Rayleigh + Mie aerial perspective. **Never leave an open V-notch or bare
        ground edge terminating in empty sky.**

--------------------------------------------------------------------------------

## 3. Pre-Render Compile-Time Spatial Verification & Auto-Repair (`< 5 ms`)

Before initializing WebGL or launching headless Chrome, pass the declarative
`WorldSpec` through `validateAndRepairWorld(spec)` (reference implementation in
[`references/01_spatial_solver_and_hybrid_shader_pipeline.md`](references/01_spatial_solver_and_hybrid_shader_pipeline.md)).
Every build MUST pass all **8 deterministic spatial gates**:

Gate                 | Invariant                                       | Mathematical Condition & Auto-Repair Action
:------------------- | :---------------------------------------------- | :------------------------------------------
**`SG0`**            | **Actor Stage & Sightline Corridor Clear**      | Zero non-stage props/trees/boulders inside `r < 7.5m` of `(0, groundY, 0)` or inside the primary hero sightline corridor (`\|x\| < 5.5m, z > -2.0m`). Reject or relocate violating instances.
**`SG1`**            | **Foundation Load-Path Embedment**              | Every architectural structure must anchor $\ge 1.50\text{m}$ below the minimum height of its 8-point terrain footprint (`baseY = fp.minH - max(sink, 1.65)`).
**`SG2`**            | **Hydrological Continuity & $C^2$ Shore**       | Water-spanning piers anchor below riverbed (`baseY <= waterLevel - 0.50m`); terrain profiles extend smoothly *below* `waterLevel` ($C^2$ continuity, zero concave shoreline kink); `clarity > 0.2m`.
**`SG3`**            | **8-Point Perimeter Slope Grounding**           | Sample terrain at center + 8 perimeter points (`r * 0.85`). Require `embedDepth > 0` and `slopeDrop = fp.maxH - fp.minH <= maxSlopeDrop` (`11.0m` structures, `3.2m` boulders/trees) so zero bottom edges float in air.
**`SG4`**            | **Compound Prop Weld Continuity**               | Stacked architectural/mechanical sub-parts interpenetrate by $\ge 0.04\text{m}$ (`weldPenetration >= 0.04m`), and any cutaway casing (`thetaLength < 2π`) is capped with solid cross-section face-plates.
**`G8`**             | **Camera Frustum Clearance**                    | Every standard camera preset satisfies `cam.pos.y >= max(terrainY, waterLevel) + 1.20m` (or `+0.60m` for explicit `low_ground_sky` macro preset) and `pointToAABBDistance(cam.pos, solid.aabb) >= 1.20m`.
**`G9`**             | **Ray-Slab Sightline Tube Clearance**           | Along $t \in [0.05, 0.80]$ of `cam.pos -> cam.target`, ray height stays $\ge H(x(t), z(t)) + 0.20\text{m}$ and `segmentIntersectsAABB(cam.pos, cam.target, nonTarget.aabb, 0.0, 0.80)` is `false`. If blocked, auto-search `(angleOffsets × distCandidates × heightLifts)` for an unobstructed vantage.
**`AABB` + `RING3`** | **Zero Sibling Overlap & 360° Horizon Closure** | `aabbIntersects(a, b, -0.02) === false` across all structures and props (auto-nudging colliding structures along spiral candidate rings `dist = 12..42m`), and `Ring 3` closes all 36 azimuth buckets ($10^\circ$ steps).

--------------------------------------------------------------------------------

## 4. Layer 2: Takram Physical Atmosphere, Volumetric Clouds & Live PMREM IBL

Avoid both flat uniform `THREE.FogExp2` and unlit black shadow recesses by
coupling the sky, clouds, aerial perspective, and environment reflections into a
single radiometric pipeline:

1.  **Spherical Earth-Shell Rayleigh + Mie + Chappuis Ozone Sky**:
    -   Model Earth curvature (`R_earth = 6371 km`, `H_top = 80 km`) with scale
        heights $H_R = 8.0\text{ km}$, $H_M = 1.2\text{ km}$, and stratospheric
        **Chappuis ozone absorption** ($\beta_{O_3} = [0.650, 1.881, 0.085]
        \times 10^{-6}\text{ m}^{-1}$) so golden hour and twilight zeniths
        render deep cobalt-indigo rather than muddy grey-green.
2.  **4-Stage Takram/Nubis 3D Volumetric Cloud Raymarching**:
    -   **Ban 4-octave unwarped cotton-ball blobs**. Use:
        1.  **Synoptic Macro Weather Map (`evalSynopticWeatherMap`)** for
            cohesive cloud banks separated by clear sky vistas.
        2.  **6-Octave Curl-Warped Base Hull + 3-Octave High-Frequency
            Worley-Perlin Edge Erosion** modulated by an altitude
            `shapeAlteringFunction` (flat Lifting Condensation Level bases,
            billowing cumulus tops).
        3.  **20+ Step Interleaved-Gradient-Noise (`IGN`) Jittered Raymarching +
            3-Tap Solar Shadow Cone** with **Dual-Lobe Henyey-Greenstein +
            Draine ($d = 10\,\mu\text{m}$) phase**, **Kulla-Conty 3-octave
            multiple scattering**, and the **Schneider-Vos Beer-Powder** term:
            $$\mathcal{E}(\tau) = \text{mix}\!\left(e^{-\tau},\; 2e^{-\tau}(1 -
            e^{-2\tau}),\; 0.55\right)$$
        4.  **Projected World-XZ Cloud Shadows (`evalCloudShadow(worldPos.xz,
            uSunDir)`)** sweeping across terrain, architecture, and water.
3.  **Live Sun-Disk-Free `PMREMGenerator` Environment IBL**:
    -   Regenerate `scene.environment =
        pmremGenerator.fromScene(envScene).texture` whenever solar elevation,
        azimuth, or weather changes, rendering the sky/cloud dome with
        **`uRenderSunDisk = 0.0`** plus bounced ground hemisphere irradiance
        (never reference `THREE.CubeUVReflectionMapping`, which was removed in
        Three.js `r187` in favor of cube render targets).
    -   **Why**: This fills arch undersides, colonnades, and north-facing cliffs
        with natural sky and ground bounce light (solving the "crushed black
        arch underside" defect of raw single-light WebGL pipelines) while
        leaving crisp direct highlights and `4096×4096` 9-tap Poisson PCF cast
        shadows (`evalSunShadowMapPCF`) to the primary `THREE.DirectionalLight`.
4.  **360° Azimuth-Coupled Aerial Perspective**:
    -   Inject directional in-scattered sky radiance
        (`evalSkyHorizonScatter(viewDir, uSunDir, ...)`) into all terrain,
        structure, rock, foliage, and water shaders so distant ridges glow with
        warm golden Mie scatter toward the sun and recede into cool Rayleigh
        blue away from the sun.

--------------------------------------------------------------------------------

## 5. Hybrid Material Pipeline: Photo-PBR + Analytical 3D Erosion & Derivative Shaders

Pure procedural noise grids look like quilted plastic, while raw UV textures
tile or stretch on cliffs. Combine AI-generated textures with continuous 3D
analytical shaders:

1.  **Ground-Truth Reference Photo & Seamless PBR Plates (`generate_image`)**:
    -   First generate `ref_photo.png` (`16:9` ground-level
        architectural/landscape photograph) and 1–2 seamless orthographic
        material plates (`1:1`, e.g., `terrain_albedo.png`,
        `masonry_or_rock.png`).
    -   Embed textures as base64 Data URIs in self-contained builds
        (`SRGBColorSpace`, `RepeatWrapping`, `anisotropy = 8`) so Frame 0
        renders with zero CORS or network stalls.
    -   Optionally run `analyzeReferencePhotoLighting(ref_photo)` to calibrate
        key-light direction and warm-key / cool-fill color balance.
2.  **Stochastic Hex-Tiling (`sampleStochasticTexture`) & 3-Axis Triplanar
    Projection (`evalTriplanarStochastic`)**:
    -   Eliminate texture tiling and vertical cliff UV stretching by blending 3
        orthogonal triangle-grid UV-hashed texture lookups weighted by
        `pow(abs(worldNormal), vec3(6.0))` and modulated by luminance ratio
        `clamp(triLum / meanLum, 0.74, 1.26)` so base material hues never wash
        out.
    -   Blend biome transitions (e.g., `Ring 0` pavers/sand into `Ring 1`
        rock/grass) **pre-lighting** via physical height-threshold blending
        (`computeHeightBlendFactor`).
3.  **Derivative-Weighted Swiss Hydraulic Erosion (`evalSwissErosionFBM`)**:
    -   Accumulate rotated analytical quintic 2D noise derivatives
        (`gnoise2DDeriv`), warp each octave by `-gradSum * 0.16`, and damp by
        `1.0 / (1.0 + dot(gradSum, gradSum) * 1.45)`. Use `ridgeCrest` for
        exposed bedrock arêtes and `gullyChannel` for snow couloirs, moss, or
        talus scree.
4.  **Quad-Oscillation-Attenuated Surface Normals (`evalPerturbNormalDeriv`) &
    Analytical Cavity/Micro-Shadow (`evalMicroCavityAndSelfShadow`)**:
    -   **Ban raw `dFdx(highFreqNoise)` and `dFdx(pertNormal)`**, which evaluate
        on coarse `2×2` pixel quads and create visible `2×2` checkerboard
        stipple blocks.
    -   Attenuate screen-space derivatives by `lowPassWeight = 1.0 / (1.0 +
        (abs(dHdx) + abs(dHdy)) * 42.0)` and layer analytical per-pixel 3D noise
        gradients (`gnoise2DDeriv`) projected onto the tangent plane.
    -   Weather architectural masonry with per-block hash color/roughness
        variance, recessed mortar joint AO, upward-facing moss/lichen deposition
        (`smoothstep(0.55, 0.85, worldNormal.y)`), and a `0.5-1.2m` capillary
        wet band above water.
5.  **Finite-Depth Dispersive Planar-Mirror Water + Wet Porosity Optics**:
    -   Combine **8 Gerstner-Trochoidal wave trains obeying the finite-depth
        dispersion relation** $\omega(k) = \sqrt{g k \tanh(k h)}$ and
        wave-packet group envelopes ($c_g = \frac{1}{2} c_p$) with a
        **`1024×1024` planar mirror `WebGLRenderTarget`**
        (`createPhotorealWaterSystem`, reflecting the camera across `y =
        waterLevel` with an oblique clip plane).
    -   Evaluate Beer-Lambert depth absorption (`evalSeabedHeight(xz)`),
        dual-layer Voronoi caustics, disturbed foam wakes around bridge
        piers/boulders, and **`evalWetPorosityOptics`** on adjacent banks,
        pebbles, and pier bases (darkening porous diffuse albedo via total
        internal reflection, flattening micro-normals toward the macro normal,
        and dropping roughness to `0.035`).
6.  **Botanical Cutout Atlases (`2048×2048`), Fast LUT Grass (`75,000+` Blades)
    & Smooth Boulders**:
    -   **Trees, Shrubs & Ferns**: Ban solid geometric cones/spheres and
        un-textured lollipop cards. Use `2048×2048` procedural botanical cutout
        atlases (`generateBotanicalLeafAtlas`, `generateFrondPinnaeAtlas`) with
        `alphaTest: 0.38`, `alphaToCoverage: true`, spherical canopy bent
        normals, and dual-lobe subsurface scattering (`evalLeafSubsurface`).
        **Critical Three.js Shadow Gotcha**: Always set `shaderMat.map =
        leafAtlas; shaderMat.alphaTest = 0.36;` directly on custom
        `ShaderMaterial` foliage so `WebGLShadowMap` does not overwrite
        `customDepthMaterial.map` with `undefined`.
    -   **Meadow Grass**: Generate `35,000-75,000` curved 5-to-7-segment
        parabolic Bézier grass blades in `< 2.5 ms` using the `96×96` bilinear
        height/slope LUT (`generateGrassInstances`), rejecting blades inside
        structure footprints or below `waterLevel + 0.32m`, with natural
        olive/straw spectral variance and harmonic wind sway.
    -   **Boulders**: Never displace non-indexed low-poly
        `IcosahedronGeometry(r, 2)`. Use `IcosahedronGeometry(r, 4)` (`5,120`
        tris) with spatial-hash vertex normal welding or indexed
        `SphereGeometry(r, 48, 36)` with triplanar rock shaders.
    -   **Buoyant Planckian Blackbody Fire & Lantern Point Lights**: When
        braziers, campfires, or stone lanterns are present, pair analytical
        Planckian blackbody flame sheets + spiraling ember particles (`900K ->
        3800K`) with warm emissive lantern cores and distance-attenuated
        point/fill lights so lanterns visibly illuminate surrounding masonry and
        water.

--------------------------------------------------------------------------------

## 6. Architectural Interior Craft, Narrative Loading Screen & Bespoke Exploration UI

1.  **Richly Crafted, Walkable Building Interiors (Never Hollow Shells or Black
    Doorway Boxes)**:

    -   **Ban fake doorway plugs**: Never block temple, sanctuary, rotunda, or
        pavilion doorways with opaque black boxes or flat glowing planes. Every
        architectural landmark in Ring 1 must be **genuinely hollow,
        open-portaled, and richly modeled on the inside** so users can walk or
        glide through the threshold.
    -   **Interior Structural & Material Depth**: Model complete interior spaces
        with:
        -   **Overhead Structure**: Coffered stone domes with zenith oculi,
            stepped corbel-arch vaults, or exposed timber scissor-trusses
            (`Sakserost`) and arcade braces.
        -   **Columns & Wall Relief**: Interior fluted pilasters, stave mast
            colonnades (`Staver`), or recessed trapezoidal/arched wall niches
            (`aediculae`) holding reliefs, vessels, or inscriptions.
        -   **Sacred / Functional Centerpiece & Floor Craft**: Inlaid `opus
            sectile` marble/star-map floors, sunken ceremonial
            reflection/libation basins (`impluvium`), carved altars, gilded
            shrines, or kinetic astronomical instruments.
        -   **Warm Interior Radiosity & Sunbeams**: Light interiors with buoyant
            Planckian hearth/brazier flames (`createBuoyantFireSystem`), hanging
            wrought-iron chandeliers or bronze oil lamps (`THREE.PointLight`),
            and overhead oculus/cleft sunbeam shafts so interior stonework and
            timber glow with warm depth.
    -   **Dedicated Interior Camera Vantage**: Always include at least one
        camera preset positioned inside the primary architectural interior
        looking across the focal shrine/hearth and out through the open portal.

2.  **Clean, Narrative Loading Screen (Zero Internal or Technical Jargon)**:

    -   The loading screen (`#loading-overlay`), `<title>`, and any gallery
        wrapper must **only describe what the user is about to see and
        experience in the world** (e.g., *"The Aqueduct of the Emerald Gorge —
        Step into a sunlit alpine limestone canyon spanned by a three-arch Roman
        aqueduct, a coffered Doric rotunda sanctuary, and mossy emerald
        rapids"*).
    -   **Strictly forbidden in any user-facing text**: Never display internal
        acronyms, project codes, or rendering/compiler jargon such as `"WDA
        3D"`, `"3D-WDA"`, `"ENV 21"`, `"HeliosDSL"`, `"8/8 Gates PASS"`,
        `"SG0-SG4"`, `"Spatial Solver"`, `"PMREM"`, `"Takram"`, `"Compiling
        Shaders"`, or `"Calibration Rig"`.

3.  **Minimal, Bespoke, Style-Matched Exploration UI (`> 96%` Unobstructed
    Viewport)**:

    -   **Ban cookie-cutter technical HUDs**: Never use the same generic
        developer HUD across different builds, and never clutter the viewport
        with stage actor selectors, solver telemetry badges, or debug drawers.
        Default the scene to a pure, natural world (`setActorMode('none')`).
    -   **World-Matched Aesthetic & Typography**: Design a whisper-quiet (`< 4%`
        screen area) UI tailored to the specific world's material culture and
        historical period:
        -   *Classical Roman*: Engraved travertine ivory & antique gold
            (`Cinzel` / `Cormorant Garamond`) with Roman numeral markers (`I ·
            II · III · IV · V`).
        -   *Nordic Stave & Fjord*: Charred pitch-pine & hearth-amber serif with
            runic diamond dividers (`◆`).
        -   *Nabataean Desert*: Rose-sandstone & burnished desert brass with
            geometric diamond borders (`◇`).
        -   *Khmer Sanctuary*: Weathered laterite & saffron lotus-gold (`❖`).
        -   *Andean Observatory*: Obsidian slate & astronomical bronze astrolabe
            dial with degree tick marks (`☉`).
    -   **Encourage Exploration with Minimal Controls**: Show only a subtle
        title + navigation hint (`"Drag to look · WASD to walk inside · Scroll
        to glide"`), **4–5 evocative place names** (including the building
        interior) that smoothly fly (`~1.4s` cubic ease-in-out camera
        interpolation) the user to each location when clicked, and a tiny
        3-state time-of-day mood pill (*Morning · Golden Hour · Dusk*).
    -   **Headless Harness Compatibility**: Keep `window.ENVIRONMENT_API = {
        setAtmospherePreset, setActorMode, setCameraPreset }` (with instant
        camera snapping when called via `ENVIRONMENT_API`) and
        `window.__ENV_READY = true` wired in JavaScript so automated 8-view
        Playwright verification continues to run deterministically.

--------------------------------------------------------------------------------

## 7. Two-Tier Verification & 8-View 360° VLM Realism Climb

Every build must pass **both** verification tiers before completion:

### Tier 1: Compile-Time Spatial & WebGL Health Gate (`< 5 ms` + Frame 0 Check)

-   Run `validateAndRepairWorld(worldSpec)` and verify **8/8 spatial gates pass
    (`0` errors, `0` floating objects, `0` AABB collisions, `100%` clear
    sightlines, `360°` Ring-3 horizon closure)**.
-   Guard all fragment and bloom shaders against `NaN`/`Inf` (`if (!(col.r >=
    0.0 && col.r <= 65000.0)) col.r = 0.0;`) and use `samples: 4` MSAA on
    `HalfFloatType` `EffectComposer` render targets.

### Tier 2: 8-View 360° Hemisphere Capture & 5-Axis Realism Climb

Capture **8 views** in headless Chromium (`1280×720` or `1440×900`, `0`
console/WebGL errors):

1.  `view_01_stage_hero.png` — Primary hero framing showing Ring 0
    (`reference_spheres` or hero monument) through Ring 3 horizon.
2.  `view_02_azimuth_000_north.png` — `0° North` sightline.
3.  `view_03_azimuth_090_east.png` — `90° East` sightline.
4.  `view_04_azimuth_180_south.png` — `180° South` backstage verification (zero
    empty void).
5.  `view_05_azimuth_270_west.png` — `270° West` sightline.
6.  `view_06_aerial_overview.png` — High-altitude overview (`y = +45m..+90m`)
    verifying all 4 concentric rings and spatial distribution.
7.  `view_07_low_ground_sky.png` — Low grazing macro view (`y = groundY + 0.6m`)
    inspecting foreground micro-relief, wet porosity, and volumetric cloud
    underbellies.
8.  `view_08_alt_weather_monolith.png` — Alternate Time-of-Day/Weather preset
    (e.g., Golden Alpenglow, Twilight, or Overcast Mist) with the `monolith` or
    `explorer_rover` actor.

Inspect all 8 renders alongside `ref_photo.png` using `read_file` and iterate
across **4 review stages**, scoring each iteration out of **100 points across 5
axes (20 pts each)**:

1.  **Lighting, Bounce IBL & Shadow Fidelity (20 pts)**: Natural directional
    shadow falloff, sky/ground PMREM bounce in recessed arches/crevices (shadow
    floor at `8-15%` linear luminance, never crushed `0%` black), zero `[255,
    255, 255]` blown blobs.
2.  **Materials, Hybrid Photo-PBR & Weathering (20 pts)**: Stochastic hex-tiled
    PBR textures + analytical 3D gradients, per-block masonry
    weathering/moss/waterline staining, zero `2×2` pixel-quad derivative
    stippling.
3.  **Landform Topology & Architectural Geometry (20 pts)**: Swiss-eroded cliff
    strata/ledges (never smooth cones or quilted grids), chamfered/moulded
    architectural relief, `8/8` spatial grounding gates passed, closed 360°
    Ring-3 horizon.
4.  **Foliage, Botanical Cutouts & Dispersive Water Optics (20 pts)**:
    `2048×2048` alpha-to-coverage leaf/frond sprays with subsurface scatter,
    dense multi-tone Bézier grass blades, full-res ripple-distorted planar water
    reflections, Beer-Lambert depth absorption, and wet shoreline/pier collars.
5.  **Atmosphere, Volumetric Clouds & 360° Aerial Perspective (20 pts)**:
    Chappuis ozone sky gradient, 3D raymarched cumulus/cirrus with silver
    linings and ground shadows, azimuth-coupled aerial perspective across all 8
    views.

--------------------------------------------------------------------------------

## 8. Reference Library

-   [`references/01_spatial_solver_and_hybrid_shader_pipeline.md`](references/01_spatial_solver_and_hybrid_shader_pipeline.md)
    — Production JS/GLSL implementation of the `< 5 ms` 8-gate spatial
    constraint solver & auto-repair engine (`validateAndRepairWorld`), `96×96`
    LUT instanced grass generator (`generateGrassInstances`), finite-depth
    dispersive planar-mirror water, and Takram cloud/ozone + Swiss erosion
    shader chunks.

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
