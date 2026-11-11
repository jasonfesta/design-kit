# Universal Image-to-Working-3D-Model Reconstruction Pipeline

Turns **any reference image** (a photograph or concept plate of a vehicle, building/courtyard, mechanical weapon/prop, organic human/animal, or full multi-biome scene) into a **working, articulated, physically grounded Three.js 3D model and interactive simulation**.

---

## 1. Stage 0 — Optical, Dimensional & Material Probe

Before writing geometry code, extract deterministic ground-truth metrics from the input image using `probe_reference_plate.py`:
1. **Canvas Aspect & Camera Optics**:
   - Lock native aspect `[1200, H]`, vertical FOV (`26–30 deg` telephoto isometric/specimen, `38–55 deg` architectural/chase, `78 deg` FPS world), and perspective mode (`2-point_shift_plumb` via `camera.setViewOffset` vs. `3-point_pitched`).
2. **Metric Bounding Envelope (`1 unit = 1.0 meter`)**:
   - Freeze a single `Object.freeze(SPEC)` dimension table on Turn 1 (`length, width, height, wheelbase/hipHeight, groundClearance, keyProportions`).
   - Establish coordinate conventions: `+Y` is Up (`y = 0.0` at tire/sole/plinth ground contact), `+Z` is Forward, `+X` is Left.
3. **Material & Lighting Decomposition**:
   - Measure `open_sky_p85_srgb`, sun azimuth/elevation from cast shadow angles, key-to-fill contrast ratio, and classify every visible surface into one of 6 procedural shader families:
     1. *Clearcoat Automotive / Anodized Alloy* (`MeshPhysicalMaterial` + flake/droplet `onBeforeCompile`)
     2. *Anisotropic Carbon Fiber / Brushed CNC Metal* (`scalar-luminance` reflection tint + directional micro-roughness)
     3. *Triplanar Architectural Concrete / Ashlar Masonry / Timber* (3-octave world-space FBM + mortar/formwork grooves + contact AO)
     4. *Wet Asphalt / Voronoi Gravel / Splat Terrain* (`1:1` isotropic UV scaling + `0.5x` Lengyel oblique planar mirror `uMirrorTex` + 2-tap rotated Voronoi stones)
     5. *Beer-Lambert Glazing & Warm Interior Emissive Pools* (`ior: 1.52`, `2400K–3000K` interior `RectAreaLight` bounce)
     6. *Organic Skin / Pleated Garments / Foliage Cards* (`catmullRomLoft` + `weldSmoothNormals` + `alphaTest: 0.46` spherical-normal foliage cards)

---

## 2. Stage 1 — Subject-Specific Procedural 3D Geometry Synthesis

### Class A: Vehicles, Aircraft & Hard-Surface Industrial Shells
- **Multi-Station Hermite Cross-Section Lofting**:
  - Sample `20–26` longitudinal stations along `z = -L/2 .. +L/2` using cubic Hermite splines (`evalHermite1D`) for hood/roof/deck height, beltline, fender flare width, and wheel-arch cutouts.
  - Run **3 passes of $C^2$ Laplacian normal smoothing (`smoothLoftNormals(geo, 3, 0.55)`)** across shared vertices while keeping sharp creases strictly at recessed panel gap channels (`4 mm` dark seam strips).
- **Sub-Millimeter Details That Sell AAA Realism**:
  - Recessed multi-strake rear diffuser with trailing-edge bevels gated strictly by `clamp(-vCarNorm.z, 0.0, 1.0)`.
  - `DoubleSide` wide grooved tires tucked tightly into wheel arches (`18 mm` lip clearance, `-2.8 deg` camber) wrapping 10-spoke forged rims, slotted brake rotors, and painted 6-piston calipers.
  - Multi-reflector LED headlights/taillights, perforated honeycomb intake grilles, and `250+` instanced 3D clearcoat water beads (`1.5–4.5 mm`) when wet.

### Class B: Organic Humans, Animals, Creatures & Bipeds/Quadrupeds
- **Monotone Centripetal Catmull-Rom Lofts + Parallel-Transport Spline Tubes**:
  - Build torsos, limbs, necks, muzzles, and garments with `catmullRomLoft(rings, radialSegs=24..28, subStepsPerSpan=3)` and curved horns/antlers/tails/cables with `splineTube(pts, radialSegs=14, subSteps=24)`.
  - Run **`weldSmoothNormals(geom, 68)`** (spatial-hashing 3D positions at `1e-4 m` tolerance) to eliminate UV-seam (`u = 0/1`) lighting creases and polygon facets.
  - Preserve per-vertex color shading in `bakePartGeometry` (`existingCol * rgb * shade`), and build all skirts/coats/tunics with `capStart: false` + `buildRecessedGarmentShadow`.

### Class C: Mechanical Weapons, Cockpits, CAD Devices & Articulated Props
- **High-Segment Foreground Machining**:
  - Use `40–48` radial segments on all foreground cylinders/barrels/lenses; carve real 3D M-LOK/Picatinny slots, Cooling fins, and bevels; use brushed anodized roughness (`0.28..0.36`, zero coarse Perlin bump).
  - Bridge sleeve-to-hand joints with a cuff strap, detailed watch/gauge, and flared glove gauntlet (`46` longitudinal sleeve rings with `2–4` low-frequency cloth folds).

### Class D: Architecture, Courtyards & Full Multi-Biome Environments
- **Metric Shell + 3-Depth-Plane Context**:
  - Construct the primary structure with real wall/reveal thicknesses (`0.25–0.45 m`), overhangs (`0.34 m`), and 1-draw-call `WorldContactAO` ground shadow skirts (`y = 0.012 m`).
  - Surround with 3 depth planes of foliage (background canopy, mid-ground multi-crown specimen trees, foreground framing branches) and `800–2,500` instanced ground pebbles/litter snapped to `getHeightExactTriangle(x, z)`.

---

## 3. Stage 2 — Turning the Static Mesh into a Working Model

A model is not complete until its physical mechanisms, articulations, and controls work interactively at `60 FPS`:

| Subject Class | Required Working Mechanisms & Interactive Controls |
| :--- | :--- |
| **Vehicle / Craft** | `120 Hz` sub-stepped suspension & grip-to-drift physics; steering wheel/knuckle pivots (`+-32 deg`); rolling wheels; glowing heated brake rotors; RPM-linked multi-oscillator engine/exhaust audio; Mach-diamond nitrous plumes; working headlights/taillights; gullwing/door open + on-foot walk-around inspection (`F`); live paint/wetness/TOD toggles (`J`, `O`). |
| **Human / Creature** | 18-bone or 2-segment knee/hock hierarchical rig (`upperLeg` + `lowerLeg` + ankle roll); post-collision arc-length walk/run/turn gait (`0` foot-skating); 2-bone arm IK; task/weapon prop swapping; `50`-point `_hullPts` terrain floor clamping across `idle`, `walk`, `run`, `action`, and `die`. |
| **Weapon / Mechanism** | Working bolt-carrier/slide reciprocation; trigger/selector articulation; shell casing ejection with `0.42s` delayed ground clatter; collimated optical reticle (`adsAmount >= 0.78`); Dual-FOV tangent-convergent laser (`0.000 px` error); procedural transient gunshot/mechanical Web Audio synth. |
| **Architecture / Site** | Interactive camera presets (`VIEW 1..4` matching reference plates + `OrbitControls` + WASD first-person walk + Dollhouse/Cutaway toggle); dynamic solar elevation / weather / torchlight cycle (`L` or `O`); opening gates/doors; spatial environmental audio. |

---

## 4. Stage 3 — Automated 4-Gate Verification & Double-Blind A/B Loop

Run these 4 deterministic checks on every iteration before declaring the working model complete:
1. **Gate 1 — WebGL `PMREM` / `NaN` / Perf Audit**:
   - Assert `0` console/shader errors, `0` `PMREM` `alpha == 255` overflow texels, `0` `NaN` pixels in `sceneRT`, `>= 60 FPS`, and draw calls within budget (`<= 85` single-subject / `<= 165` full arena).
2. **Gate 2 — World-Space Vertex Grounding & Live Kinematic Torture Test**:
   - Un-freeze benchmark poses and run `350–1,620` live simulation steps asserting `0` ground sinking (`minWorldVertexY - groundY >= -0.015 m`) and `0` obstacle penetrations.
3. **Gate 3 — Multi-Angle + `400%` Macro Loupe Critic**:
   - Render `?shot=ref1..N`, `?shot=closeup` (`distance = 12–16`), and `?shot=night`, cropping `400x400 px` macro regions around joints, seams, tires/boots, and grazing highlights.
4. **Gate 4 — CSPRNG Double-Blind Side-by-Side A/B Jury (`scripts/make_blind_ab.py`)**:
   - Generate normalized JPEG `q=94` side-by-side boards (`CANDIDATE A` vs `CANDIDATE B`) with cryptographic coin-flip placement and iterate until a fresh zero-context `blind-visual-judge` awards a back-to-back sweep against the reference image.
