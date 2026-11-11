---
name: car-turing-test-and-blueprint-loop
description: >-
  Adversarial Photo-vs-Three.js automotive Turing loop, 4-view orthographic blueprint
  silhouette IoU verification, Class-A Zebra reflection-stripe diagnostics, 360-degree
  turntables, and anchor-gated cumulative skill evolution.
---

# Adversarial Automotive Turing-Test, Blueprint IoU & Zebra Loop (`automotive-threejs`)

Drive pure-procedural Three.js vehicle reconstructions to concours-grade dimensional, Class-A curvature, and radiometric parity—combining photographs (`VIEW 1..N`) with optional technical blueprints while compounding verified laws across batches.

## [LOCKED] First-Principles Axioms
<!-- BEGIN LOCKED AXIOMS -->
1. **Pure-3D Anti-Cheat & Read-Only Skill Guard:** **NEVER** load, camera-project, texture-map, base64-encode, or sample `<ref.jpg>`, secondary photos, or orthographic blueprints onto WebGL meshes, canvases, or CSS backgrounds. Sub-agents treat `~/.gemini/config/skills/car-*` and shared `scripts/` as **strictly read-only**.
2. **Frontier Model Floor (`Carbon-G` Primary, `>= Gemini 4 Argon` Floor):** Every coordinator and vehicle-reconstruction sub-agent must run on the latest full-thinking Carbon/frontier Gemini model (`Carbon-G`: `gemini-4-carbon-teamfood` / `gemini-4-carbon` / `le-01-tf`) and **never** fall back below `Gemini 4 Argon`. Abort rather than running on `pro` (`snowball`), `gemini-3.*`, or `flash*`.
3. **Triple Parity Gate (`Hero Hyperrealism + 360° Class-A Zebra + Blueprint Ortho IoU`):** Passing `build_and_audit_car_plate.mjs --strict` requires: (a) `hyperreal_passed === true` (`90–120%` sharpness, `chroma_clip_pct <= 0.25%` with zero electric `[255,0,0]` brake-light clip, `StaticBoil = 0`) and `overall_similarity >= 78.0%` (`target 82%+`), (b) complete 360° + 3D-cockpit volumetric bounds (`window.__CAR_GROUP__` `W/L` and `H/L` within automotive physical bounds, zero `.dispose()` after Frame 0), and (c) `mean_ortho_iou >= 0.88` (`target 0.92+`) whenever `--blueprint-dir` is supplied.
<!-- END LOCKED AXIOMS -->

## [REGIME PLAYBOOK] Iteration & Cumulative Learning Protocol
<!-- BEGIN LEARNED LAWS -->
- **WHEN reconstructing from Photographs + Technical Drawings (`Hybrid Blueprint + Photo Mode`):**
  1. Lock exact outer body dimensions (`L`, `W`, `H`, `L_wb`, `T_f`, `T_r`, `R_tire`, overhangs, roofline, plan-view sweep) from the 4-view orthographic drawings (`side`, `front`, `rear`, `top`) via `probe_car_reference.py --blueprint <dir>`.
  2. Solve Hero camera pose (`position`, `target`, `fov`, `principalPoint`, `rollDeg`), suspension ride settle, front steering lock `δ_f`, OEM paint color/flop, and studio/outdoor lighting strictly from `VIEW 1` (`<ref.jpg>`).
  3. Inspect `renders/iter_0<k>_blueprint_overlay.png` (`Green = Match`, `Amber = Missing 3D Mass`, `Cyan = Excess 3D Mass`) on every pass until nose/tail overhangs, wheel arches, and tumblehome lock to `< 2%` error before micro-polishing shaders.
- **WHEN reconstructing from Multi-View Photographs Only (`VIEW 1..N`, No Blueprints):**
  1. Establish one shared metric vehicle (`1 unit = 1.000 m`, ground `y = 0`, wheelbase midpoint `z = 0`) registered to `window.__CAR_GROUP__`, triangulating overhang lengths, tumblehome, lamp geometry, and cockpit layout across `VIEW 1..N`.
  2. Lock global studio scrims or sun/sky lighting and pixel Turing scoring strictly to `VIEW 1`; evaluate secondary angles (`window.__CAR_CAMERAS__`) in `renders/iter_0<k>_multiview_sxs.jpg` on lighting-invariant edge alignment and Weber micro-sharpness rather than raw exposure deltas.
- **WHEN iterating a vehicle build (`8–15` hill-climbing passes, classic IIFE x20 bundle):**
  1. Resolve the latest npm `three` release before bundling, stamp `window.__BUILD_META__ = { threeRevision: THREE.REVISION, threeVersion }` into the classic-IIFE entry wrapper, defer startup via `requestAnimationFrame(() => setTimeout(init, 0))`, and run:
     `node ~/.gemini/config/skills/car-turing-test-and-blueprint-loop/scripts/build_and_audit_car_plate.mjs <plate_dir> <ref.jpg> [--blueprint-dir <bp_dir>] --iter <k> --strict`
  2. Inspect **all** generated diagnostic plates via `read_file` on every pass:
     - `renders/iter_0<k>_turing_strip.png` (`Ref | Render | Error Heatmap` + `4` `200%` semantic loupes: `Greenhouse/Frit`, `Lamp/Grille`, `Worst Tile`, `Wheel/Caliper/Tire`),
     - `renders/iter_0<k>_zebra_360.jpg` (Class-A reflection-stripe continuity—fix any kinked normals, flat `0 mm` oil-canned roofs, or spline ripples immediately),
     - `renders/iter_0<k>_orbit_360.jpg` (`8` azimuths + `Cockpit/Overhead` 360° check) & `renders/iter_0<k>_ortho_4view.png` (or `iter_0<k>_blueprint_overlay.png`),
     - `renders/iter_0<k>_hyperreal_diag.jpg` (`Thermal/Edge`, `Magenta Gamut Clip Mask`, `200% Loupe`).
- **WHEN auditing visual realism beyond scalar similarity scores (`Zero-Giveaway Visual Sign-Off`):**
  1. Scalar similarity (`overall_similarity`) and blueprint IoU (`>= 0.90`) are necessary floors, **never** sufficient sign-off: always inspect `iter_<k>_multiview_sxs.jpg`, `iter_<k>_hyperreal_diag.jpg` (`200%` loupe), `iter_<k>_orbit_360.jpg`, and `iter_<k>_zebra_360.jpg` directly via `read_file`.
  2. Reject and fix any CG giveaway before completion: coarse-mesh headlamp/NACA tears, internal lamp pods or cabin liners poking outside body skins, glowing neon parked turn strips where unlit clear optics belong, flat black Lexan engine bays, or `sharpness_ratio_pct` drifting outside the crisp `95–110%` optical band.
- **WHEN evolving `car-*` skills across vehicle batches (`SHA-256 Axiom Lock`):**
  1. Never delete or weaken `<!-- BEGIN LOCKED AXIOMS -->` blocks; stage newly discovered failure modes as `WHEN <structural or optical regime>` rules rather than single-model hacks.
  2. Replay stratified golden anchors (`classic curved GT`, `modern aero wedge`, `boxy off-roader`, `dark studio cyclorama`, `sunlit/wet outdoor plate`) to verify zero parity, Zebra smoothness, or hyperrealism regressions before promoting skill updates.
<!-- END LEARNED LAWS -->
