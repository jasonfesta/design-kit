---
name: game-procedural-3d-and-cutaway
description: >-
  Build legible procedural 3D, WebGL2, and layered 2.5D game worlds with
  isolated asset inspection views, unobstructed camera sightlines and interior
  cutaways, minimal HUD clutter, and esbuild classic-IIFE static web bundles.
metadata:
  icon: ✨
---

# Game procedural worlds, sightlines, and bundles

## What it is

This skill covers the spatial presentation and static delivery layer of a browser game: authoring readable procedural 3D or lit 2.5D actors and environments, inspecting rigs outside live gameplay chaos, keeping the player's view unobstructed indoors or behind tall geometry, and bundling full 3D/WebGL engines (`Three.js`, custom shaders) cleanly into classic scripts for sandboxed static hosts and mobile screens.

## When to use it

- Building a 3D, isometric, 2.5D, or GPU-shaded browser game whose actors, vehicles, props, or terrain are generated in code.
- Adding roofed buildings, caves, dense canopies, or multi-level arenas where walls or roofs could hide the player or active threats.
- Packaging a `Three.js` or `WebGL2`/`WebGPU` game for static hosting, mobile touchscreens, or opaque-origin sandboxes (`window.origin === "null"`) without falling back to flat `<svg>` or unlit vector shapes.

## When not to use it

- Pure text or abstract 2D board games where the user explicitly requested a flat graphic notation.
- Non-interactive architectural walkthroughs or cinematic 360-degree worlds with no gameplay HUD, occlusion dynamics, or actor readability requirements; use the dedicated photorealistic 3D environment skills for those builds.

## Decisions that determine quality

### 1. Bundle real 3D and GPU shaders cleanly instead of falling back to flat SVG

Opaque-origin sandboxes (`window.origin === "null"` on x20) block `<script type="module">` and `<script type="importmap">`, which causes unprepared builders to abandon `Three.js` and settle for flat `<svg>` or unlit `Canvas2D` vector art. Never downgrade visual depth because of module restrictions:

- Install `three` (or your WebGL/math libraries) locally during build and compile the entry point into a single classic IIFE script (`esbuild src/main.ts --bundle --format=iife --target=es2020 --outfile=dist/bundle.js`, or inline the compiled IIFE into `<script>...</script>` inside `dist/index.html`).
- Rewrite or avoid `import.meta.url` during bundling so classic `<script>` execution never throws `SyntaxError: Cannot use 'import.meta' outside a module`.
- Embed lookup tables, procedural noise seeds, or compact binary buffers as inline typed arrays or base64 data URLs rather than calling relative `fetch()`.
- Convert authored palette colours into linear working space (`convertSRGBToLinear()`) before PBR/hemisphere/directional lighting, cast crisp contact or shadow-map shadows so heights and trajectories read immediately, and run a single tone-mapping + sRGB output pass.

### 2. Inspect procedural assets on an isolated sidecar stage

Debugging actor proportions, ground contact, pivot points, facing axes, animation loops, or team palettes inside a live match wastes time and hides defects behind camera motion.

Whenever a game builds multiple procedural actors, vehicles, creatures, tiles, or props:

- Expose a lightweight inspection view (such as a query flag `?inspect=1` or a companion `models.html` turntable page) that mounts each asset on a neutral ground reference.
- Verify four geometric facts before tuning gameplay: base contact sits cleanly on the ground plane (`minY = 0`) without floating or sinking, forward orientation matches movement vectors across every asset, team or state palettes read clearly from gameplay camera distance, and key animation states transition without limb or mesh separation.

### 3. Separate visual planes so gameplay reads at a glance

Busy procedural textures and glowing backgrounds swallow projectiles, hazards, and characters. Structure every frame into three distinct contrast planes:

1. Background and terrain: low local contrast and calm value variation so ground tiles or distant scenery never compete with actors.
2. Interactive world objects: clear geometric silhouettes and distinct material cues for doors, ramps, pickups, destructibles, and cover.
3. Foreground actors and active threats: highest value and chroma contrast against the floor, verified by squinting or applying a 20 px blur to a gameplay screenshot.

### 4. Keep sightlines clear when geometry crosses the camera ray

In angled top-down, isometric, third-person, or multi-storey worlds, roofs, tall facades, pillars, and tree crowns routinely step between the camera and the action. Choose the sightline remedy that fits your projection and art style:

| Camera and world type | Sightline remedy | Key continuity rule |
| :--- | :--- | :--- |
| Angled top-down or isometric interiors | Fade or hide roof and south/front wall groups when an actor enters or crosses behind | Smooth transitions over 80–150 ms; disable `depthWrite` on faded shells |
| Dense 3D props, pillars, or foliage | Screen-space dithered discard or analytic capsule fade along the camera-to-subject segment | Keep a subtle ground footprint or rim cue so obstacle collisions never feel invisible |
| Third-person follow or 6-DoF rig | Spring-arm collision pull-in paired with floor height clamping | Carry velocity and look target continuously when switching camera modes |

### 5. Keep HUD chrome minimal and batch repeated geometry

Internal state names, pixel coordinates, frame counters, and chunk indices belong in developer tools, never on the player's screen.

- Reserve almost the entire viewport (`>= 97%`) for the playable world, anchoring essential status (health, score, wave, or compact minimap) in borderless corner slots rather than wide dashboard bars.
- Communicate cooldowns, telegraphs, recoil, and danger diegetically on the world or actor wherever possible.
- Batch repeated foliage, projectiles, debris, tiles, or crowd props (`THREE.InstancedMesh` in 3D, instanced quads in WebGL2, or offscreen sprite caches in 2.5D) so action stays locked at 60 fps on mobile GPUs.
- Wrap `localStorage`, `sessionStorage`, `navigator.clipboard`, and `history` calls in `try / catch`, and set `touch-action: none` on the active `<canvas>`.

## CLI bundle check

`scripts/audit_web_game_bundle.py` (PEP 723, zero external dependencies) inspects built `.html`, `.css`, and `.js` files for opaque-origin sandbox blockers (`type="module"`, `importmap`, leaked `import.meta`, local `crossorigin`, relative `fetch()`, unguarded storage), mobile viewport/touch rules, and detected rendering surfaces (`webgl_or_3d`, `canvas2d`, `svg`):

```bash
python3 ~/design-kit/skills/game-procedural-3d-and-cutaway/scripts/audit_web_game_bundle.py \
  --dist-dir ./dist \
  --forbid-svg-only \
  --json
```

Pass `--forbid-svg-only` on spatial, action, physics, and 3D game builds to fail fast if a sub-agent skipped `<canvas>`/WebGL rendering and fell back to an SVG-only DOM stage, or `--require-3d` when the slot specifically calls for WebGL / Three.js / WebGPU rendering.

## Traps

- Abandoning 3D for flat SVG/vector shapes because `<script type="module">` is blocked on static hosts. Bundle `Three.js` or WebGL2 shaders into a classic IIFE script with `esbuild` in one build command.
- Leaving `import.meta` inside a classic script bundle. Modern libraries referencing `import.meta.url` crash immediately outside ES modules; replace or define it out at bundle time.
- Invisible solid walls after cutaway. Hiding a wall down to 0% opacity with no floor sill leaves players snagging on invisible collision boxes. Always keep the wall base, sill, or rim outline visible.
- Depth-buffer sorting artefacts on faded roofs. Setting `opacity < 1` on a multi-mesh roof while leaving `depthWrite: true` punches holes through interior actors behind it. Disable `depthWrite` while faded, or use screen-space stipple discard.
- High-frequency procedural noise on floors. Random per-pixel or per-tile contrast hides fast projectiles and strains the eye during motion.

## Self-check

| Check | Pass | Fail symptom |
| :--- | :--- | :--- |
| Rich rendering medium | WebGL/Three.js, custom GPU shaders, or lit multi-plane canvas match the game's physical world | Fallback to flat `<svg>` or unlit vector diagram primitives |
| Asset grounding | Actors and props rest flush on the ground plane (`minY = 0`) and face their velocity | Floating wheels/feet, sunken bases, or sideways movement |
| Squint readability | Player, threats, and pickups stay unmistakable under a 20 px blur | Foreground actors blend into noisy floors or bright backgrounds |
| Interior sightlines | Entering a room or moving behind tall cover cleanly reveals the actor | Camera view blocked by opaque roofs, walls, or tree canopies |
| Clean sandbox bundle | Classic IIFE bundle passes `audit_web_game_bundle.py` with zero `import.meta`, CORS, or storage errors | Module CORS block, `import.meta` SyntaxError, `SecurityError`, or page drag scroll |

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
