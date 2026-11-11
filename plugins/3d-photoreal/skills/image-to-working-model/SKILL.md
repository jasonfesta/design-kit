---
name: image-to-working-model
description: >-
  Transforms any reference image—a vehicle, architectural structure,
  mechanical weapon or prop, organic human or creature, or full multi-biome
  environment—into a working, articulated, physically grounded AAA Three.js 3D
  model and interactive 60fps simulation. Enforces optical camera probing, C2
  Laplacian and Catmull-Rom lofted geometry with position-hashed normal
  welding, hardware-GPU safe PMREM and NaN guards, 100% vertex-to-physics
  height parity, 1-writer-per-file swarm isolation, 400% macro-crop harsh
  domain critics, and CSPRNG double-blind side-by-side A/B jury verification.
  Use whenever turning an image into a working 3D model or playable Three.js
  scene. Don't use for static 2D HTML/CSS landing pages (use image-to-react or
  jason-dev-agent).
metadata:
  icon: ✨
---

# Universal Image-to-Working-3D-Model & Simulation Skill (`image-to-working-model`)

Accepts **any reference image** (or set of reference images) and constructs a **working, articulated, physically simulated, 60fps Three.js 3D model and interactive scene**—verified by **400% macro-crop harsh critics** and **cryptographically blinded side-by-side A/B juries** until indistinguishable from or superior to the reference plate.

## Bundled References & Deterministic Scripts

| Resource | When to Read / Run |
| :--- | :--- |
| [references/image-to-working-3d-model.md](references/image-to-working-3d-model.md) | Reconstructing any vehicle, building, mechanical prop, organic human/creature, or environment from an image into a working 3D rig |
| [references/human-taste-and-antipatterns.md](references/human-taste-and-antipatterns.md) | Preventing hardware-GPU `PMREM` whiteouts (`alpha=255`), ANGLE `pow(neg,y)` `NaN`s, terrain sinking, obstacle pass-throughs, UV-seam facets, and diagonal UI slop |
| [references/genres/racing-vehicular.md](references/genres/racing-vehicular.md) | Building a car, aircraft, or racing/driving model (`120 Hz` grip-to-drift, $C^2$ widebody loft, `-vCarNorm.z` diffuser, `0.5x` planar road mirror) |
| [references/genres/fps-tactical.md](references/genres/fps-tactical.md) | Building a first-person weapon, operator squad, or tactical arena (Dual-FOV tangent laser `0.000 px`, `46`-ring BDU sleeves, 3-phase `A*` + capsule separation) |
| [references/genres/rts-strategy.md](references/genres/rts-strategy.md) | Building an isometric strategy world, medieval diorama, or articulated crowd (`getHeightExactTriangle`, `weldSmoothNormals`, `InstancedMesh` part batcher) |
| `scripts/make_blind_ab.py` | Generating normalized `JPEG q=94` CSPRNG side-by-side `CANDIDATE A` vs `CANDIDATE B` boards for zero-context `blind-visual-judge` verification |

---

## 1. The 5-Stage Image-to-Working-Model Workflow

### Stage 0 — Optical, Dimensional & Material Probe
1. Run `probe_reference_plate.py` (from `arch-camera-matching-and-perspective`) on every attached reference image to lock native aspect (`[1200, H]`), camera FOV, `2-point_shift_plumb` vs. `3-point_pitched` perspective, and `open_sky_p85_srgb`.
2. Freeze a metric `Object.freeze(SPEC)` dimension contract (`1 unit = 1.0 meter`, `+Y` Up, `y = 0.0` at ground contact, `+Z` Forward, `+X` Left) and deterministic `?shot=ref1|ref2|closeup|night` URL presets on Turn 1.
3. If fanning out a `/swarm`, partition into **Strictly Disjoint 1-Writer-Per-File Classic `<script>` Modules** (zero ES-module `import` or `fetch()`, chunking any file `> 350` lines via `Overwrite: true` then `Append: true`).

### Stage 1 — Zero-Box Procedural 3D Geometry & Material Synthesis
Consult [references/image-to-working-3d-model.md](references/image-to-working-3d-model.md) for the subject class in the image:
- **Hard-Surface Vehicles / Craft**: 22-station Hermite cross-section lofting (`evalHermite1D`) + **3 passes of $C^2$ Laplacian normal smoothing (`smoothLoftNormals(geo, 3, 0.55)`)**; `-vCarNorm.z`-gated diffuser strake bevels; `DoubleSide` tucked tires (`18 mm` arch clearance) with a `512x512` double-pass tire-heel Contact AO plane (`y = 0.024 m`); `260` 3D clearcoat water beads (`1.5-4.5 mm`).
- **Organic Humans, Animals & Creatures**: Monotone centripetal `catmullRomLoft` (`22-28` radial segs, `3` sub-rings/span) + parallel-transport `splineTube` + **`weldSmoothNormals(geom, 68)`** across UV seams; preserve existing vertex colors in `bakePartGeometry`; build garments with `capStart: false` + `buildRecessedGarmentShadow` dark interior plugs.
- **Mechanical Weapons, Tools & CAD Assemblies**: `40-48` radial cylinder segments on foreground barrels/optics; slotted rails/vents; directional brushed anodized roughness (`0.28..0.36`, zero coarse Perlin bump); `46`-ring Nyquist-safe sleeves bridged by a cuff strap, watch/gauge, and glove gauntlet.
- **Architecture, Terrain & Dioramas**: Real reveal thicknesses (`0.25-0.45 m`), 3-octave world-space triplanar FBM shaders, 1-draw-call `WorldContactAO` skirts, `0.5x` Lengyel oblique-clipped planar wet reflections (`uMirrorTex`), and 3-depth-plane silhouette foliage.

### Stage 2 — Working Articulation, Kinematics, Audio & Telemetry
Turn the reconstructed 3D asset into a **working model** with zero per-frame GC allocations:
- **Vehicles**: `120 Hz` sub-stepped suspension & tire slip physics, 4-wheel footprint grounding (`state.y >= Math.max(centerRoadY, wheelPlaneY)`), 3-probe hull collision (`+1.45 m, 0.0 m, -1.45 m`) with `82%` tangential wall-slide, steering/door articulation, Mach-diamond exhaust plumes (`coreFacing` view-normal falloff), and multi-oscillator Web Audio engine/turbo/tire synthesis.
- **Characters / Creatures**: 2-segment knee/hock limbs (`upperLeg` + `lowerLeg` + 3-phase ankle roll), post-collision arc-length stride phase (`distMoved / fullCycleMeters`, `0` foot-skating when stopped, `cosLeg > 0` swing knee lift), 2-bone arm IK, and 50-direction `_hullPts` floor clamping (`minWorldVertexY - groundY >= +0.015 m`).
- **Weapons / Mechanisms**: Reciprocating bolt/slide, Dual-FOV tangent-convergent laser & collimated reticle (`0.000 px` crosshair error), spinning brass casing pool with delayed (`0.42 s`) ground clatter, and procedural gunshot/mechanical transient audio.
- **Terrain / Obstacles**: Exact triangle-barycentric height (`getHeightExactTriangle` matching the mesh index buffer diagonal split to `<= 1e-4 m` raycast parity) and unified `world.getObstacles()` registry with swept-corridor `A*` + 2-pass hard depenetration.

### Stage 3 — Hardware-GPU Safety & 60 FPS Optimization Audit
Enforce all Turn-1 rules in [references/human-taste-and-antipatterns.md](references/human-taste-and-antipatterns.md):
1. **Mandatory `#include <encodings_fragment>` & HDR Clamp (`<= 2.2`)** on every custom `ShaderMaterial` rendered inside `PMREMGenerator.fromScene()`, verified via `readRenderTargetPixels(pmremRT)` (`0` texels with `alpha == 255`, `< 1%` texels with `alpha == 0`).
2. **Zero Unguarded `pow(negative, y)`**: Replace `pow(x, 2.0)` with `x * x`, clamp fractional `pow` bases `>= 1e-5`, clamp `uv` to `[0.001, 0.999]` before `sin(uv * PI)`, wrap bloom taps in `safeBlur(c)`, and enforce `e0 < e1` in `smoothstep(e0, e1, x)`.
3. **Runtime Budget**: Pre-mount dynamic `PointLight` pools at `intensity = 0` (`0` runtime shader recompiles), batch parts into `InstancedMesh`, and maintain `60 FPS` (`<= 85-165` draw calls, `< 800 ms` cold startup).

### Stage 4 — Harsh 400%-Crop Critic & CSPRNG Double-Blind A/B Jury
1. **Live Un-Frozen Physics & Grounding Gate**: Un-freeze `?shot=` presets and step `350-1,620` live frames asserting `0` ground sinking (`<= 2.1 cm`), `0` obstacle penetrations, and `0` foot-skating.
2. **Harsh Domain Critic (`400%` Macro Crops + Close-Up `distance = 12-16`)**: Inspect full frames AND `400x400 px` zoomed crops of high-frequency regions (diffuser strakes, tire contact patches, hands/wrists, seams, silhouettes) across all camera angles (`ref1..N`, `closeup`, `night`).
3. **CSPRNG Double-Blind Side-by-Side Jury**:
   ```bash
   python3 scripts/make_blind_ab.py \
     --candidate <build_dir>/shot_ref1.png \
     --reference <build_dir>/reference_1.jpg \
     --out <build_dir>/blind_pair_1.jpg \
     --key-out <build_dir>/.secret_blind_key_1.json
   ```
   Spawn a fresh, read-only, zero-context `blind-visual-judge` subagent to grade `CANDIDATE A` vs `CANDIDATE B` blind. Translate every subcategory loss into an exact mathematical/shader fix and iterate until winning **two consecutive back-to-back `100%` subcategory sweeps**.

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
