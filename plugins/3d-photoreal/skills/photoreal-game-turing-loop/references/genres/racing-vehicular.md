# Genre Cartridge: Racing & Vehicular Free-Drive (`Apex GT Free-Drive` Dossier)

Enforce these **15 Non-Negotiable Genre Laws** and **Top 10 Turn-1 Invariants** whenever building a 3D Racing, Driving, or Vehicular game in Three.js.

---

## 1. The 15 Non-Negotiable Racing Laws

1. **120 Hz Sub-Stepped Grip-to-Drift Tire Model**: Run vehicle physics at `FIXED_DT = 1/120` (`MAX_SUBSTEPS = 12`) with explicit slip angle `alpha = wrapAngle(heading - velocityAngle)`, smooth counter-steer stabilization, and surface grip multipliers (`asphalt: 1.0`, `kerb: 0.92`, `gravel: 0.72`, `grass: 0.65`).
2. **Close-Ratio Sequential Gearbox with Speed-Matched RPM**: Map each gear's max speed (`1st: 68 .. 7th: 355 KM/H`) and wheel thrust (`10.35 .. 5.38 m/s^2`) against quadratic aero drag (`0.00058 * v^2`) so upshifts drop RPM into the `5,200–5,800 RPM` powerband and redline (`7,000–8,000 RPM`) matches HUD telemetry.
3. **4-Wheel Footprint Grounding + Hard Floor Clamp**: Sample `getSurfaceAt` at all 4 wheel world positions (`FL, FR, RL, RR`) plus the car center; compute `terrainPitch` and `terrainBank` from wheel height differentials, and hard-clamp `state.y >= Math.max(centerRoadY, 0.25 * (yFL + yFR + yRL + yRR))` so the nose splitter never clips into uphill crests.
4. **3-Probe Vehicle Hull + Tangential Wall-Slide Resolution**: Test front (`+1.45 m`), center (`0.0 m`), and rear (`-1.45 m`) spheres against track corridor walls (`10.60 m` matching `+-11.8 m` Armco minus `1.2 m` car half-width) and explicit obstacle planes; on impact, project out along the wall normal and preserve `82%` tangential velocity so the car scrapes along guardrails with titanium sparks rather than stopping dead or tunneling through.
5. **100% Vertex-Verified Spline Ribbon Grounding (`<= 3 cm`)**: Every vertex `(vx, vy, vz)` of `roadMesh` must match `world.getSurfaceAt(vx, vz).y` within `3 cm`. Always check main-track spline containment (`|lateralOffset| <= HALF_TRACK`) *before* any regional paddock or runoff elevation overrides, and include slab thickness (`+0.015 m`) + banking (`lat * sin(bank)`).
6. **Lofted Widebody Car Shell with $C^2$ Laplacian Normal Smoothing**: Sculpt exotic/GT3 bodywork via 22-station Hermite cross-section lofting (`z = -2.31..+2.31 m`, width `2.04 m`) + 3 passes of $C^2$ Laplacian normal smoothing (`smoothLoftNormals(geo, 3, 0.55)`), never primitive boxes or unsmoothed extrusions.
7. **Zero-Gap Wheel Arch Tuck & Double-Sided Wide Slicks**: Tuck `398 mm` wide grooved slick tires tightly into flared fenders (`18 mm` arch clearance, `-2.8 deg` rear / `-3.2 deg` front camber) with `DoubleSide` inner drum geometry and a `512x512` double-pass tire-heel + diffuser-strake Contact AO shadow plane (`y = 0.024 m`, `opacity = 0.98`).
8. **Rear-Normal Gated (`-vCarNorm.z`) Diffuser & Scalar-Luminance Carbon**: Gate bevel highlights on rear diffuser strakes strictly by `clamp(-vCarNorm.z, 0.0, 1.0)` (`4 mm` trailing edge) and tint carbon reflections via scalar luminance (`dot(refl, vec3(0.2126, 0.7152, 0.0722))`) so 3/4 drift angles never turn diffuser fins into bright khaki slabs.
9. **3D Clearcoat Water Droplets + Dual-Specular Wet Paint**: Combine `onBeforeCompile` procedural micro-droplet normal/sparkle maps on `MeshPhysicalMaterial` (`clearcoat: 1.0, clearcoatRoughness: 0.03`) with `260` physical 3D hemisphere beads (`1.5–4.5 mm`) scattered on horizontal body panels.
10. **Half-Resolution Planar Wet-Road Mirror Pass (`uMirrorTex`)**: Render a `0.5x` flipped `mirrorCamera` pass across `y = currentRoadY` (`projectionMatrix.elements[5] *= -1`, `gl.frontFace(gl.CW)`) to reflect the car's own crimson LED taillights, purple nitrous flames, and overhead floodlights in wet asphalt and rainwater puddles.
11. **Isotropic Tarmac (`2.20 repeats/m`) + De-Tiled 3D Voronoi Gravel with Monotonic 1D Seams**: Keep wet asphalt macro albedo variation `< 2.5%`, sample gravel in world-space `vGrvWorldPos.xz` with a 2-tap rotated matrix (`mat2(0.8, -0.6, 0.6, 0.8)`), displace `28 cm` 3D tire ruts (clamped to `<= 4 mm` directly beneath the car's Contact AO footprint, `3.8 cm` outside), scatter `380` `InstancedMesh` 3D pebbles across seams, and define road-edge seams as a single-valued 1D function of `z` only (`0` detached ink-blot islands).
12. **View-Normal Falloff (`coreFacing`) Mach-Diamond Exhaust Plumes**: Multiply 3D cylindrical nitrous/exhaust plumes by `pow(abs(dot(normalize(vViewNormal), normalize(vViewDir))), 1.75)` with `4–5` Prandtl-Meyer shock diamonds (`machFreq = 20.0`) and a recessed radial plasma core disc (`z = +0.04 m`) so tailpipes never project as hollow `"o"` rings.
13. **Speed-Scaled FOV (`56 deg -> 82 deg`) + 72-Tap IGN Rotary-Shutter Blur & 16-Tap God-Rays**: Pair dynamic FOV widening, drift yaw lag, and `-1.8 deg` horizon banking with a 72-tap Interleaved Gradient Noise radial velocity blur (`<= 2.5 px` step spacing, `0.24` center deadzone keeping the car razor-sharp) and 16 screen-space sun occlusion taps for real crepuscular shadow lanes behind gantry trusses and trees.
14. **Vector `0–8` SVG Tachometer + Rotating GPS Minimap**: Anchor the HUD with a bottom-right `264 deg` sweep SVG tachometer (`7–8` redline in `#ef4444`, central gear medallion, italic `KM/H`, `TCS/ABS/ESC` pills), bottom-left heading-up rotating minimap, top-left `x1–x5` drift multiplier ring, and `H`-toggleable compact/full controls dock.
15. **Multi-Oscillator Flat-Plane V8 Web Audio Synthesizer**: Synthesize RPM-linked sawtooth/sub/harmonic engine layers (`f0 = (rpm/60)*4`), non-linear waveshaper distortion, twin-turbo whine (`1,850..5,400 Hz`) + blow-off flutter chirp, high-RPM backfire crackles (`650 Hz` bandpass + `110 Hz` thump), dual-peak tire squeal (`920 Hz` & `1,680 Hz`), and wet road spray hiss in pure Web Audio API.

---

## 2. Canonical 6-File Single-Writer Module Map (`window.NFS`)

| File | Owner Role | Exported Contract on `window.NFS` |
| :--- | :--- | :--- |
| `js/car-model.js` | `car-builder` | `NFS.CarModel.createCar()` -> `{ root, bodyGroup, chassisPitchGroup, wheels, frontSteerPivots, exhaustAnchors, setPaint, setUnderglow, setWetness, setEnvMap, update }` |
| `js/world-track.js` | `world-builder` | `NFS.World.createWorld()` -> `{ sampleTrack, getSurfaceAt, setTimeOfDay, cycleTimeOfDay, getMinimapData, getSunScreenPos, update, roadMaterial, gravelMaterial, envMap }` |
| `js/vfx-post.js` | `vfx-renderer` | `NFS.VFX.createVFX()` -> `{ update, render, triggerBackfire, triggerSparks, resetParticles, setQuality, resize }` |
| `js/physics-audio.js` | `physics-audio` | `NFS.PhysicsAudio.createSimulation()` -> `{ update(dt) -> telemetry, setShotState(shotSpec) }` |
| `js/hud-ui.js` | `hud-ui` | `NFS.HUD.createHUD()` -> `{ update(dt, telemetry), setCompactControls(bool) }` (Freeze after scoring `>= 9.2/10`) |
| `index.html` + `style.css` | `integrator-perf` | `?shot=ref1|ref2|ref3|drift|night|garage|thumb` harness + `window.NFS_PERF.getReport()` (`>= 60 FPS`, `<= 85` draw calls, `<= 250k` tris) |
