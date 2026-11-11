# Human Taste, Critic Blind Spots & Turn-1 Prevention Rules (Vamsi Dossier Synthesis)

Synthesized from `7,300+` model turns and `17,000+` trajectory steps across three AAA procedural Three.js games (**Apex GT Free-Drive**, **Task Force: Zero Hour**, and **Age of Crowns: Definitive**). Every rule below originated from a real human intervention where automated or static critics passed a broken state.

---

## 1. Hardware GPU vs. Headless Software WebGL (`llvmpipe`) Whiteout & `NaN` Traps

### 1.1 The Three.js `r134` `PMREMGenerator` `RGBEEncoding` Exponent Bomb (`2^127`)
- **Symptom**: Scene looks moody and dark in headless Linux `llvmpipe` screenshots, but the lower `65%` of the viewport (road, terrain, props) blows out to solid `RGB(255, 255, 255)` pure white on a real hardware GPU.
- **Root Cause**: `PMREMGenerator.fromScene(envScene)` renders into an `UnsignedByteType` (`RGBA8`) target with `RGBEEncoding` and decodes texels via `rgb * exp2(alpha * 255.0 - 128.0)`. If a custom `THREE.ShaderMaterial` in `envScene` writes `gl_FragColor = vec4(col, 1.0)` **without** `#include <encodings_fragment>`, Three.js never appends `LinearToRGBE`, writing raw `alpha = 255` (`rgb * 2^127 = 1.7014e38`). In `llvmpipe`, `Inf * 0.0` during blur becomes `NaN -> byte 0` (`87.8%` black texels), hiding the bug that saturates hardware `fp16` (`65,504.0`) to pure white.
- **Turn-1 Rule (`T1-GPU-PMREM`)**:
  ```glsl
  vec3 finalSky = min(max(col * uEnvBakeScale, vec3(0.0)), vec3(uEnvMaxHdr)); // uEnvBakeScale=0.16, uEnvMaxHdr=2.2
  gl_FragColor = vec4(finalSky, 1.0);
  #include <encodings_fragment>
  ```
  Always verify `pmremRT` with `renderer.readRenderTargetPixels()` asserting `0` texels with `alpha == 255` and `< 1%` texels with `alpha == 0`.

### 1.2 The ANGLE / Direct3D / Metal `pow(negative, y)` & `float32` `pi` Trap
- **Symptom**: Random black/white bloom fireflies or full-frame `HalfFloatType` `NaN` poisoning on hardware GPUs.
- **Root Cause**: In IEEE-754 `float32`, `3.14159265` rounds to `3.1415927410125732 > pi`, so at `uv.y = 1.0`, `sin(1.0 * 3.14159265) = -8.742e-8` (negative!). ANGLE translates `pow(x, y)` to `exp2(y * log2(x))`, which emits `NaN` for any negative base—even integer squares like `pow(signedVal, 2.0)`.
- **Turn-1 Rule (`T1-GPU-NAN`)**:
  - Replace all `pow(x, 2.0)` with `sqr(x)` (`x * x`).
  - Clamp every fractional `pow(base, exp)` base with `pow(max(1e-5, base), exp)` and clamp `uv` before `sin(uv * PI)` to `clamp(uv, 0.001, 0.999)`.
  - Guard every `atan(y, x)` against `(0.0, 0.0)`.
  - Wrap post-processing blur samples in `safeBlur(c)` clamping channels to `[0.0, 16.0]` and rejecting `!(c.r >= 0.0 && c.r <= 65000.0)`.
  - Never toggle `PointLight.visible` at runtime (causes `400ms+` shader recompiles); pre-allocate dynamic lights with `visible = true, intensity = 0.0`.

---

## 2. Grounding, Elevation Parity & Zero-Penetration Physics Traps

### 2.1 Visual Mesh vs. Physics Height Query Discrepancies
- **Symptom**: Cars sink `36–45 cm` into sloped asphalt; villagers and cavalry sink ankle- or waist-deep into sloped grass or dry riverbanks; dying units plunge shoulders/lances underground.
- **Root Causes**:
  1. **Regional Flat Overrides Before Main Spline**: Checking a flat paddock/runoff region before checking main road containment (`absLat <= HALF_TRACK`), or passing reversed `smoothstep(130.0, 30.0, dist)` where `e0 > e1` (dividing by `Math.max(1e-6, e1 - e0)` returns `1.0` everywhere!).
  2. **Bilinear Height vs. Triangulated Quad Diagonals**: Terrain quads split into two flat triangles (`a-d` or `b-c`), while `lerp(lerp(h00,h10,fx), lerp(h01,h11,fx), fz)` computes a curved hyperbolic paraboloid up to `0.15 m` below the triangle diagonal on slopes.
  3. **Wide River SDF False Submergence**: Applying `-0.34 m` wading offset based on a wide river SDF alone sinks units walking on dry banks `1.5 m` above water.
  4. **Center-Point-Only Grounding**: Sampling height only at a vehicle's center `(x, z)` lets the `2.31 m` nose clip into concave uphill crests; rotating a dying unit `90 deg` around `hip.y = 0.76 m` plunges downward limbs underground.
- **Turn-1 Rules (`T1-GROUNDING`)**:
  - **Exact Triangle-Barycentric Height (`getHeightExactTriangle`)**: Match the exact quad diagonal split of the terrain index buffer and assert `|world.getHeightAt(x, z) - raycastMeshY(x, z)| <= 1e-4 m` (or `<= 0.03 m` across `100%` of road ribbon vertices). Never test grounding with the tautology `u.y - getHeightAt(u.x, u.z)`.
  - **4-Wheel / 50-Hull-Extrema Floor Clamping**: For vehicles, sample all 4 wheels (`FL, FR, RL, RR`) and hard-clamp `state.y >= Math.max(centerRoadY, 0.25 * (yFL + yFR + yRL + yRR))`. For organic units and corpses (`deathProgress = 0..1`), transform 50 precomputed support hull points (`_hullPts`) into world space and clamp `root.position.y` so `minWorldVertexY - groundY >= +0.015 m`.
  - **Under-Shadow Berm Flatten**: Clamp 3D vertex-displaced gravel ruts to `[-4 mm, +4 mm]` directly beneath the car's `contactShadowMesh` (`y = 0.024 m`) so raised ruts never slice jagged holes in the contact shadow.

### 2.2 Passing Through Obstacles, Guardrails, Houses & Trees
- **Symptom**: Cars drive straight through Armco barriers; FPS enemies walk through shipping containers and stack into a single overlapping mesh (`minPairDist = 0.04 m`); RTS units walk through forest trees and cottage roof eaves.
- **Root Causes**:
  1. **Transposed Function Arguments**: Calling `world.resolveHorizontal(x, z, r, y, h)` when the signature was `resolveHorizontal(x, yFeet, z, r, h)` caused the vertical overlap check to read horizontal `z = -28.5 m` as `yFeet` and skip 100% of obstacles.
  2. **Unexported Decorative Instances**: Placing `894` forest trees/boulders in `InstancedMesh` inside `terrain.js` without exporting them via `world.getObstacles()` to `simulation.js`.
  3. **Inflated Corridor Limits & Center-Only Hulls**: Setting `wallHalfWidth = 20.5..68.0 m` when visual Armco barriers sit at `+-11.8 m`, or testing collision only at `(0, 0)` instead of 3 hull probes (`+1.45 m, 0.0 m, -1.45 m`) or Minkowski-expanded AABBs (`eavesPad = 0.34 m`).
- **Turn-1 Rules (`T1-COLLISION`)**:
  - Freeze exact collider helper signatures in Turn-1 contracts and assert blocking at `(yFeet = 0)` on boot.
  - Export 100% of physical props/trees/barriers in `world.getObstacles()`.
  - Run a **Live Un-Frozen Headless Torture Suite** (`900`-step full-lap + `7` deliberate barrier crashes for Racing; `1,620`-frame 6-agent convergence for FPS; `240`-tick forest/town march for RTS) asserting `0` obstacle penetrations and `minPairDist >= 1.08 m`.

---

## 3. Procedural 3D Modeling, Normal Welding & Shader Craft Laws

1. **Never Use Box/Cylinder Primitives or Post-`toNonIndexed()` `computeVertexNormals()` on Organic/Car Meshes**:
   - Calling `geom.toNonIndexed()` before `computeVertexNormals()` splits every triangle into disconnected vertices, creating hard facets; standard `CylinderGeometry`/`SphereGeometry` split normals at UV seam `u = 0/1`.
   - **Fix**: Sculpt cars via 22-station Hermite cross-section lofts + **3 passes of $C^2$ Laplacian normal smoothing (`smoothLoftNormals`)**. Sculpt humans/animals via `catmullRomLoft` (`22–28` radial segs, `3` sub-rings/span) + `splineTube` + **Position-Hashed Area-Weighted Normal Welding (`weldSmoothNormals(geom, 68)`)**.
2. **Preserve Per-Vertex Color Gradients in `bakePartGeometry`**:
   - Always multiply `existingCol * rgb * shade` instead of overwriting `g.attributes.color` with a fresh flat array.
3. **Recessed Garment Shadows (`capStart: false`)**:
   - Never close the bottom of skirts, robes, or coats with a flat cap (`capStart: true`), which flashes bright white/blue discs when a corpse lies supine. Use `capStart: false` + `buildRecessedGarmentShadow` (dark `[0.05, 0.04, 0.04]` matte interior plug recessed at `y = -0.18..-0.24 m`).
4. **View-Normal & Rear-Normal Shader Gating**:
   - **Diffuser Strakes**: Gate bevel highlights strictly by `clamp(-vCarNorm.z, 0.0, 1.0)` (`4 mm` rear edge), never `abs(vCarNorm.x)`, so `52 cm` side walls stay dark carbon at `35 deg` drift angles.
   - **Cylindrical Exhaust/Nitrous Plumes**: Multiply alpha by `coreFacing = pow(abs(dot(normalize(vViewNormal), normalize(vViewDir))), 1.75)` so grazing cylinder walls never project as hollow `"o"` rings.
   - **Dual-FOV Viewmodel Lasers**: Project world raycast distance `wDist` via `dVm = wDist * (tan(fovMain * 0.5) / tan(fovVm * 0.5))` and terminate the beam at `(0, 0, -dVm)` in viewmodel camera space (`0.000 px` crosshair error).
5. **Post-Collision Displacement Gait (`0` Foot-Skating)**:
   - Advance `stridePhase` strictly from post-collision ground travel `distMoved = Math.hypot(x - prevX, z - prevZ)` (`0` leg cycling when blocked against a wall), flex swing knees on `Math.max(0, cosLeg)` (mid-swing lift, never `sinLeg`), and decouple lower-body `hipsYaw` from upper-body aim yaw.

---

## 4. UI / HUD "Anti-Slop" & Swarm Orchestration Laws

1. **Ban "AI Slop" Diagonal CSS**:
   - In grounded racing, military, sports, or historical games, strictly forbid `clip-path: polygon(...)` 45-degree chamfered corners, `transform: skewX(...)` slanted bars, `#00ffff` wireframe corner brackets, `//` hacker prefixes, and centered modals that block `> 35%` of the 3D vista.
2. **Strict 1-Writer-Per-File Classic `<script>` Isolation**:
   - Partition into disjoint files attached to a single global namespace (`window.NFS`, `window.COD`, `window.AOC`) loaded via classic `<script>` tags (`0` ES-module `import` or `fetch()` calls so `file://` and `x20web` CSP work identically).
3. **Chunked File Writing (`<= 350` Lines per `write_file` Call)**:
   - Never emit `> 400` lines in a single `write_file` call (prevents 5.5-minute RPC stream timeouts). Write Chunk 1 with `Overwrite: true` and subsequent chunks with `Append: true`.
4. **Hermetic CSPRNG Blind A/B Judges + `400%` Macro Crops**:
   - Non-blind critics that read source code inflate scores to `97/100` while true pixel parity is `35/100`. Always pair `400%` macro crop critics with a read-only `blind-visual-judge` scoring normalized side-by-side `CANDIDATE A` vs `CANDIDATE B` JPEG `q=94` plates (including the pre-deploy menu and close-up `distance = 12–16` views) until winning **two consecutive `100%` subcategory sweeps**.
