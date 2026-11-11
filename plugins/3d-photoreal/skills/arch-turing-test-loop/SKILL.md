---
name: arch-turing-test-loop
description: >-
  Adversarial Reference-vs-Three.js Turing Test iteration protocol,
  aspect-locked evaluation, finite-difference double-edge sign checks,
  peak-checkpoint locking, and cumulative cross-batch skill evolution with
  anchor regression gates.
metadata:
  icon: ✨
---

# Adversarial Architectural Turing-Test & Cumulative Skill Evolution (`architecture-threejs`)

Iterate pure-procedural Three.js architectural reconstructions to high geometric, radiometric, and micro-tectonic parity—and compound verified domain laws across **all** historical batches (`Plates 01..N`) without single-run thrashing.

## [LOCKED] First-Principles Axioms

1. **Pure-3D Anti-Cheat & Read-Only Skill Guard:** **NEVER** load, project, draw, base64-encode, or sample `<ref.jpg>` or external URLs onto WebGL meshes, canvases, or CSS backgrounds, and never spray uniform screen-space static noise across smooth skies/walls. Sub-agents treat `~/.gemini/config/skills/arch-*` and shared `scripts/` as **strictly read-only**.
2. **Frontier Model Floor (`Carbon-G` Primary, `>= Gemini 4 Argon` Floor):** Every coordinator and reconstruction sub-agent must run on the latest full-thinking Carbon/frontier Gemini model (`Carbon-G`: `gemini-4-carbon-teamfood` / `gemini-4-carbon` / `le-01-tf`) and **never** fall back to any model older than `Gemini 4 Argon` (`gemini-launch-candidate-high` / `gemini-4-argon-teamfood`). Abort rather than running on `pro` (`snowball`), `gemini-3.*`, or `flash*`.
3. **Joint Parity + Hyperrealism Gate & 3D Walkthrough Integrity:** Passing `build_and_render_plate.mjs --strict` requires **both** `hyperreal_passed === true` (`94-110%` sensor sharpness, `48/48` local texture parity `0 UNDER / 0 OVER`, `chroma_clip_pct <= 0.25%`, `StaticBoil = 0`) **and** `overall_similarity >= 78.0%` (`target 82%+`). Never call `.dispose()` after Frame 0 and give all masses, roofs, and rooms real 3D thickness (`arch_nav_rig.js`).

## [REGIME PLAYBOOK] Iteration & Cumulative Learning Protocol

- **WHEN orchestrating a Complete-3D Multi-View reconstruction (`4-Stage Multi-Agent Architecture`):**
  1. **Stage A — Foundation & 4-Camera Architect (`src/{config,foundation,materials,site_terrain}.js`):** Establish one frozen metric 3D datum (`1 unit = 1 m`, `Object.freeze(BLDG)`), primary structural shell (watertight walls, slabs, roofs, stairs, room partitions with photo-derived thicknesses & deep window/door reveals), multi-ring graded `siteHeight(x, z)` + `sdFootprint(x, z)` exclusion mask, Hero-locked sun/sky lighting, and all calibrated `VIEW 1..N` cameras (`window.__ARCH_CAMERAS__`). Use drawings optionally; when absent, triangulate footprint and heights from shared architectural bays/corners across `VIEW 1..N`. Verify framing across all views at `--iter 1`.
  2. **Stage B — Parallel Per-View Specialists (`1 sub-agent per camera view`, disjoint `src/view1_hero.js .. src/view<N>.js`):** Keep `VIEW 1` Hero parity 100% undisturbed (`8-15` pass `--strict` Turing hill-climb to `>= 78%`, target `82%+`, `94-110%` sharpness, `48/48` tiles) while dedicated Carbon sub-agents simultaneously bring each secondary perspective (`VIEW 2..N`) to hero-grade architectural, complete-interior (millwork, furniture, fixtures, textiles), and site fidelity using isolated `--view-focus <K>` diagnostic loops (`renders/view<K>_iter_<NN>_sxs.jpg`). Lock global weather/sun to `VIEW 1` (evaluate `VIEW 2..N` on lighting-invariant geometry/detail alignment). **Zero per-camera `mesh.visible` toggling**—every added element permanently inhabits the unified 3D world.
  3. **Stage C — Dedicated Final Full-3D Realism & Orbit Sub-Agent (Empowered to Spawn Sub-Agents):** After camera views converge, run a separate **Full-3D Realism & Orbit Sub-Agent** auditing the complete 3D build beyond the camera frustums (`renders/iter_XX_orbit_360.jpg` across all 8 azimuths + `38°` Bird's-Eye/Dollhouse + Reverse-Room/Rear-180°): rear/side elevations, roof junctions/flashings, complete interior shells/ceilings, unseen courtyards, civil roads/embankments, and 360° neighborhood/landscape fabric (zero untextured grey proxy cubes, zero 1D-striped hills, zero floating sky-portal cards). **Whenever substantial multi-area detailing is needed, this agent spawns its own focused Carbon helper sub-agents** (`swarm(action="add", ...)` or `invoke_subagent`) owning disjoint `src/full3d_*.js` modules (e.g., rear/side facades, 360° neighborhood/terrain completion, secondary interior rooms).
  4. **Stage D — Joint Hero + Multi-View + Full-360° Non-Regression Gate:** Defer startup via `requestAnimationFrame(() => setTimeout(init, 0))`, keep `< 250` batched draw calls (`InstancedMesh` / `mergeGeometries`), and run `node ~/projects/archdaily-daily-curator/scripts/build_and_audit_3d_plate.mjs <plate_dir> <ref.jpg> --iter <k> --width <W> --height <H> --strict`. Require `<= 0.2%` Hero parity loss vs. Stage B peak (`>= 78.0%`), `hyperreal_passed === true`, `three_d_complete_passed === true`, and visual inspection via `read_file` of `turing_strip.png`, `multiview_sxs.jpg`, `orbit_360.jpg`, and `hyperreal_diag.jpg` before locking `dist/`.
- **WHEN evolving skills after a batch (`evolve_arch_skills.py` — Zero Direct Prose Thrashing):**
  1. **Append Evidence Ledger & Check Run Health:** Run `python3 ~/projects/archdaily-daily-curator/scripts/evolve_arch_skills.py record-batch --batch batch_<NN> --model-id <model_id> --conversation-id <uuid>`. If model `< 4 Argon` or batch mean `overall_similarity < 78.0%`, skill writes **freeze automatically**.
  2. **Stage Candidate Rules (Scope, Never Delete Proven Rules):** Stage generalizable findings via `evolve_arch_skills.py propose-rule --skill <slug> --id <id> --when "<probe predicate>" --law "<scale-free rule>" --plates <ids>`. Existing rules with `>= 3` historical supporting plates in `data/rule_registry.json` cannot be deleted—refine their `WHEN` regime predicate instead.
  3. **Golden Anchor Replay & Multi-Batch Promotion:** Before shipping any shared script edit or promoting candidates (`>= 2` batches, `>= 3` plates, `0` contradictions) via `evolve_arch_skills.py promote`, run `evolve_arch_skills.py verify-anchors` across the stratified historical anchor plates (`Batches 01..N`) to guarantee zero parity or hyperrealism regression.

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
