---
name: photoreal-game-turing-loop
description: >-
  End-to-end daily coordinator skill that fuses the ArchDaily
  Reference-Grounded 4x-RGSS Multi-View Three.js Turing Test Swarm, the
  10-Second Toy-First Deterministic 3D Browser Game stack, and the Vamsi AAA
  Living Game Dossier Laws (Racing, FPS, RTS, and Universal
  Image-to-Working-Model) to build a high-fidelity photorealistic 3D game each
  day. Use when creating a daily photoreal 3D web game, racing simulator,
  tactical FPS, medieval RTS, or playable 3D diorama grounded in reference
  photography with multi-camera Turing parity, 400% macro-crop critics, CSPRNG
  double-blind A/B juries, and 60fps instanced WebGL rendering. Don't use for
  static 2D UI mockups (use jason-design-agent or jason-dev-agent).
metadata:
  icon: ✨
---

# Daily High-Fidelity Photoreal 3D Game Turing Loop (`photoreal-game-turing-loop`)

Builds **one shippable, AAA-quality, 60fps playable 3D game each day** by combining three battle-tested autonomous engineering systems:
1. **The Vamsi AAA Living Game Swarm & Turn-1 Laws** ([references/human-taste-and-antipatterns.md](references/human-taste-and-antipatterns.md)) — Strict 1-writer-per-file classic `<script>` module isolation, hardware-GPU `PMREMGenerator` `RGBEEncoding` + ANGLE `pow(neg, y)` `NaN` prevention, 100% vertex-to-physics height parity, 4-wheel / 50-hull-extrema grounding, $C^2$ Laplacian & Catmull-Rom lofted models with position-hashed normal welding, 400% macro-crop harsh domain critics, and CSPRNG double-blind A/B juries (`scripts/make_blind_ab.py`).
2. **The Reference-Grounded 4x-RGSS Multi-View Turing Loop** (`arch-camera-matching-and-perspective`, `arch-daylight-and-interior-glow`, `arch-materials-and-weathering`, `arch-site-foliage-and-atmosphere`, `arch-turing-test-loop`, `declarative-photoreal-threejs-worlds`) — Optical camera matching (`probe_reference_plate.py`), triplanar 3-octave FBM materials, `0.5x` Lengyel oblique planar wet reflections, and 48-tile micro-texture parity.
3. **The Toy-First Deterministic Sim & Bot Fun Ratchet** (`game-concept-and-toy-first`, `game-procedural-3d-and-cutaway`, `game-deterministic-sim-core`, `game-fun-and-balance-ratchet`, `game-text-score-audio-and-juice`, `game-arena-multiplayer-and-quests`) — `120 Hz` sub-stepped physics, 3-archetype headless bot playtesting, and 100% procedural Web Audio synthesis.

## Bundled References & Genre Cartridges

| Reference / Script | When to Load |
| :--- | :--- |
| [references/human-taste-and-antipatterns.md](references/human-taste-and-antipatterns.md) | **Mandatory on Turn 1 of every game**: Hardware-GPU whiteout/`NaN` prevention, grounding/collision laws, normal welding, and anti-slop UI rules |
| [references/image-to-working-3d-model.md](references/image-to-working-3d-model.md) | Reconstructing any reference photo (vehicle, character, weapon, building, terrain) into a working articulated 3D model |
| [references/genres/racing-vehicular.md](references/genres/racing-vehicular.md) | Building a **Racing / Driving** game (*Need for Speed / Apex GT Free-Drive* 15 Laws) |
| [references/genres/fps-tactical.md](references/genres/fps-tactical.md) | Building a **First-Person Shooter / Tactical Action** game (*Call of Duty / Task Force: Zero Hour* 15 Laws) |
| [references/genres/rts-strategy.md](references/genres/rts-strategy.md) | Building a **Real-Time Strategy / Kingdom** game (*Age of Empires / Age of Crowns* 15 Laws) |
| `scripts/make_blind_ab.py` | Building normalized `JPEG q=94` CSPRNG side-by-side `CANDIDATE A` vs `CANDIDATE B` boards for zero-context `blind-visual-judge` rounds |

---

## 1. The 5-Wave Daily AAA Game Swarm Protocol

### Wave 0 — Reference Probe, Frozen Contracts & 1-Writer-Per-File Partition
1. Run `probe_reference_plate.py` on all reference images to extract aspect ratio, horizon/vanishing points, and `open_sky_p85_srgb`.
2. Load [references/human-taste-and-antipatterns.md](references/human-taste-and-antipatterns.md) and the matching genre cartridge (`racing-vehicular.md`, `fps-tactical.md`, or `rts-strategy.md`).
3. Freeze the global namespace (`window.NFS`, `window.COD`, `window.AOC`, or `window.GAME`), exact coordinate frame (`+Y` Up, `1 unit = 1.0 m`), exact collider signatures (e.g., `resolveHorizontal(x, yFeet, z, radius, height)`), deterministic `?shot=ref1|ref2|ref3|closeup|night` URL presets, and `window.GAME_PERF.getReport()`.
4. Partition into **6–11 Strictly Disjoint Classic `<script>` Files** (`0` ES-module `import` or `fetch()` calls). Require every worker writing `> 350` lines to write in incremental chunks (`Overwrite: true` then `Append: true`).

### Wave 1 — Parallel Specialist Builders + Turn-1 GPU/Geometry Invariants
Spawn 1 builder per file (plus `monitor` if using `/swarm`):
- **3D Models (`car-builder` / `weapons-viewmodel` / `human-sculptor` / `animal-sculptor`)**:
  - Never use raw boxes/cylinders or post-`toNonIndexed()` `computeVertexNormals()`.
  - Use 22-station Hermite cross-section lofts + 3-pass $C^2$ Laplacian normal smoothing (`smoothLoftNormals`) for vehicles, or `catmullRomLoft` (`22-28` segs) + `splineTube` + `weldSmoothNormals(geom, 68)` for organic characters/animals.
  - Gate diffuser strake bevels by `-vCarNorm.z`, cylindrical exhaust plumes by `coreFacing = pow(abs(dot(vViewNormal, vViewDir)), 1.75)`, and dual-FOV viewmodel lasers by `dVm = wDist * (tan(fovMain * 0.5) / tan(fovVm * 0.5))`.
- **World, Terrain & Shaders (`world-builder` / `terrain-world` / `pbr-materials` / `vfx-renderer`)**:
  - End every custom `ShaderMaterial` inside `PMREMGenerator.fromScene()` with `#include <encodings_fragment>` and clamp HDR to `<= 2.2`.
  - Replace all `pow(x, 2.0)` with `sqr(x)`, clamp fractional `pow` bases `>= 1e-5`, wrap bloom taps in `safeBlur(c)`, and enforce `e0 < e1` in `smoothstep(e0, e1, x)`.
  - Render a `0.5x` Lengyel oblique-clipped planar mirror pass (`uMirrorTex`) for wet asphalt/puddles and merge static contact shadow skirts into 1-draw-call `WorldContactAO`.
- **Physics, AI & Procedural Web Audio (`physics-audio` / `enemies-ai` / `sim-ai-physics`)**:
  - Enforce 100% vertex-to-physics height parity (`getHeightExactTriangle` or `<= 2.1 cm` road ribbon parity across all vertices), 4-wheel or 50-point `_hullPts` floor clamping, 3-probe / swept-corridor `A*` + 2-pass hard capsule separation (`minSep >= 1.08 m`), and post-collision displacement gait (`0` foot-skating).
  - Synthesize multi-oscillator engine/gunshot/modal-lute audio + spatial Foley in pure Web Audio API with a `DynamicsCompressorNode` safety limiter.
- **Orthogonal Anti-Slop HUD (`hud-ui`)**:
  - Ban `clip-path: polygon(...)` chamfers, `skewX` slanted bars, `#00ffff` wireframes, and `//` prefixes. Freeze `hud-ui.js` once it scores `>= 9.2/10` so late-stage shader rounds never churn UI.

### Wave 2 — Un-Frozen Live Physics, Grounding & Hardware-GPU `PMREM`/`NaN` Gate
Before any visual jury round, run an automated headless verification script that asserts:
1. `readRenderTargetPixels(pmremRT)`: `0` texels with `alpha == 255` and `< 1%` texels with `alpha == 0`; `0` `NaN`/`Inf` pixels in `sceneRT`.
2. **Mesh-to-Physics Parity**: `0` road/terrain vertices deviate from `getSurfaceAt(vx, vz).y` / `getHeightAt(vx, vz)` by `> 3 cm` (`<= 1e-4 m` for triangle-barycentric terrain).
3. **Un-Frozen Live Torture Simulation** (`activeShotFreeze = false`): `900-1,620` live frames (full-lap cruise + 7 deliberate barrier crashes for Racing; 6-agent convergence + flanking for FPS; 240-tick town/forest march + corpse death sweep for RTS) asserting `maxSink <= 0.01 m`, `obstaclePenetrations == 0`, and `stoppedFootSkating == 0`.

### Wave 3 — Harsh 400%-Crop Domain Critics + Multi-Angle Inspection
1. Capture all `?shot=ref1..N`, `?shot=closeup` (`distance = 12-16`), `?shot=night`, and the Pre-Deploy Menu (`--wait-ms 6500` on software `llvmpipe`).
2. `critic-models-vfx` and `critic-world-hud` inspect both full-frame plates AND `400x400 px` macro crops around tires/boots, diffuser strakes, hands/wrists, gravel seams, and horizons, posting exact file + line-numbered mathematical fixes.

### Wave 4 — Iterative CSPRNG Double-Blind Side-by-Side A/B Jury (`scripts/make_blind_ab.py`)
1. Normalize candidate renders and reference images to identical dimensions and `JPEG q=94` quality (`scripts/make_blind_ab.py`), randomizing `CANDIDATE A` vs `CANDIDATE B` via `secrets.randbelow(2)`.
2. Spawn fresh, read-only, zero-context `blind-visual-judge` subagents (`EnableWriteTools: false`) to compare them blind side-by-side.
3. Translate every subcategory loss into a targeted shader/geometry fix (with a `LOCKED INVARIANTS` block so nothing regresses) and repeat until winning **two consecutive back-to-back `100%` subcategory sweeps**.

### Wave 5 — Post-Game Delta Harvesting (Living Skill Loop)
After shipping the game, extract any new human corrections or shader breakthroughs into the genre cartridge and `references/human-taste-and-antipatterns.md`.

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
