---
name: game-concept-and-toy-first
description: >-
  Turn a real-world observation or physical mechanism into a clear 10-second
  playable browser toy with real stakes, spatial depth, and batch genre
  diversity before building menus, economies, or progression.
metadata:
  icon: ✨
---

# Game concept and toy first

## What it is

This skill guides the earliest stage of making a browser game: finding an original premise, proving its core interaction as a live 10-second toy at boot, and ensuring the loop has genuine stakes and visual depth before writing surrounding scaffolding.

Models default to two opposite failure modes—either wrapping a lifeless action in title screens, inventory grids, and currency counters, or misreading "toy first" as a flat, unloseable vector diagram where dragging a slider fills a progress bar. This skill breaks both habits by pushing off stock genre clichés, anchoring mechanics in physical tension, choosing a rendering medium with real spatial presence, and pairing immediately with the sibling simulation, 3D, balance, and audio skills.

## When to use it

- Starting a new browser game, action prototype, tactical skirmish, puzzle, or physical simulation from an open brief.
- Spawning parallel sub-agents to build a diverse batch of distinct games without collapsing onto a single visual or mechanical template.
- Rescuing a prototype that has menus, lore, or resource tables before its primary action feels exciting to touch.

## When not to use it

- Extending an existing game whose core loop already plays well.
- Porting a fixed ruleset (such as chess, solitaire, or a published board game) where fidelity to known rules is the requirement.
- Stopping after a gentle 10-second demo when the user asked for a full game; once the boot loop works, pull in the sibling skills below in the same session.

## Why models produce lifeless prototypes

1. Genre-shell gravity. Training corpora associate "game" with boilerplate chrome—start modals, settings drawers, health bars, XP meters, and shop tabs—so models build the wrapper before the stage.
2. Adjective drift. Prompts like "cozy", "tactical", or "retro" steer toward stock visual clichés rather than a specific mechanical tension.
3. Polite calibration-widget collapse. Models confuse "10-second toy first" with an unloseable museum kiosk—dragging one dial, spotlight, or specimen until a threshold hits 100% with zero opposition, failure risk, or replayable depth.
4. Flat vector and SVG fallback. Because single-file static hosting discourages external asset fetches, models lazily draw flat `<svg>` paths or unlit `Canvas2D` primitives instead of bundling a real 3D engine, GPU shaders, or lit spatial layers.
5. Delayed spreadsheet loops. Complex resource calendars and multi-step crafting chains hide cause and effect behind minutes of opaque waiting.
6. Batch clone collapse. When asked for multiple games, a coordinator or model repeats one safe camera angle, tempo, and flat rendering style across every slot.

## The method

### 1. Name and refuse the genre default

Write down the obvious template your prompt would normally trigger in one sentence—its stock camera, stock verb, and stock UI chrome—and explicitly reject both that cliché and the passive "drag-to-calibrate" widget trap.

### 2. Anchor in a concrete physical or tactical tension

Replace abstract genre labels with a specific real-world force, mechanism, or contested situation: how a crane load whips past its tether on a sudden stop, how billiard spin hooks off a cushion into a cluster, how tugboats pivot a heavy hull in cross-current, how wind shifts jump a firebreak, or how sound waves focus along curved walls. Translate three physical qualities from that world directly into input feel, risk-reward timing, and spatial camera framing.

### 3. Sketch three to five structural verb ideas before writing code

Write three to five one-line game structures that differ in how the player acts and how the world pushes back—not how the screen is decorated. Vary the input relationship (momentum launch, rhythmic parry, spatial herding, contested placement, chain-reaction trigger, asymmetric vehicle control), drop both the most conventional genre clone and any unloseable slider toy, and commit to the sharpest playable conflict.

### 4. Give the core verb real pushback, risk, and escalation

"Toy first" means **zero pre-game chrome**, never **zero game stakes**. Unless the user explicitly asks for a meditative sandbox, every game needs active counter-pressure from the first screen:

- Immediate pushback: hazards, rival agents, momentum overshoot, collapsing terrain, or tight turn/space budgets where careless or passive play visibly loses.
- High-ceiling skill expression: grazing danger, chaining ricochets, timing releases, or reading terrain geometry should reward skilled hands far above random tapping.
- Structural escalation: each subsequent wave, room, or board must introduce new spatial layouts, hazard interactions, or opponent behaviours—never just repeat the opening calibration check with slightly tighter numbers.

### 5. Choose a rendering medium with real spatial depth and materiality

Never default to flat `<svg>` elements or unlit 2D vector diagrams out of bundling convenience unless the user specifically asks for an abstract board or diagram style. Match the rendering medium to the physical world of the game:

- Procedural 3D stages (`Three.js` or raw `WebGL2` / `WebGPU`): ideal for vehicles, physics arenas, tactical skirmishes, architectural cutaways, and destructible mechanisms; bundle cleanly as a single classic IIFE script via `esbuild` so static sandboxes never force you back to 2D.
- Custom GPU fragment and particle shaders: ideal for fluid, optical, magnetic, acoustic, or high-density arcade fields where thousands of elements react with real specular lighting and shadows.
- Lit layered 2.5D or crisp pixel/sprite canvases: when 2D fits best, establish foreground/midground/background depth, directional lighting, contact shadows, and multi-frame impact deformation rather than flat geometric primitives.

### 6. Prove the 10-second loop at boot across pointer, keyboard, and touch

Boot directly into the live interactive world with at most one short line of contextual guidance. Within the first 15 seconds, a new player must:

1. Touch, click, drag, or press an obvious affordance (`>= 44 x 44 CSS px`, unified `pointerdown`/`pointermove`/`pointerup`, `touch-action: none` on the stage) without reading a tutorial wall.
2. See and hear an unmistakable physical or tactical response within 150 ms across both desktop landscape and mobile portrait viewports.
3. Experience one complete beat of risk and resolution—landing a shot, surviving an exchange, triggering a chain clear, or crashing and instantly resetting (`< 300 ms` restart) with an immediate urge to try again.

Withhold title modals, save-slot pickers, currency shops, and upgrade trees until that core loop already feels hard to put down.

### 7. Keep ambient delight off the critical path

Layer three to five reactive world details—wildlife scattering from shockwaves, weather shifting surface grip, scorch marks persisting across rounds, or subtle acoustic callbacks—while keeping every easter egg strictly non-blocking so missing one never gates progress.

## Multi-game batches and sub-agent delegation

Whenever a prompt asks to spawn sub-agents or build multiple games (`N >= 2`), enforce structural orthogonality before launching builders:

1. Assign distinct **genre, camera, tempo, and renderer slots** across the batch—for example: (a) 3D third-person/chase physics action, (b) 3D angled cutaway tactical skirmish, (c) high-speed WebGL2 shader/arcade reflex arena, (d) turn-based spatial chain-reaction puzzle, and (e) articulated 3D vehicle or mechanism challenge. No two slots may share the same camera projection, primary input gesture, or calm observational tone.
2. Delegate **open structural slots, not pre-baked dioramas**: pass each sub-agent its assigned genre/camera slot, quality gates, and sibling skills, and require the sub-agent itself to run Steps 1–4 so it invents a high-tension mechanic rather than illustrating a coordinator's prose vignette.
3. Require every sub-agent to pair this skill with the sibling suite below rather than stopping at `v0` toy-spec compliance.

## Pairing with the sibling game skills

| Need | Sibling skill | What it adds once the 10-second toy boots |
| :--- | :--- | :--- |
| 3D rigs, sightlines, and static bundling | `game-procedural-3d-and-cutaway` | Procedural Three.js/WebGL actors, isolated `?inspect=1` turntables, roof/wall cutaways, 3-plane blur readability, and `esbuild` classic IIFE bundles (`--forbid-svg-only`) |
| Crisp fixed-step physics and replays | `game-deterministic-sim-core` | Renderer-free simulation state, 60 Hz/120 Hz parity, and seeded headless runner hooks |
| Real depth, pacing, and replay pull | `game-fun-and-balance-ratchet` | Anti-stagnation pressure, comeback arcs, and 50–500 episode headless sweeps proving skilled play beats random/passive play |
| Expressive music and impact juice | `game-text-score-audio-and-juice` | Genre-matched grooves, transient-body-tail impact foley, adaptive tension stems, and WAV acoustic safety checks |
| AI tournaments, multiplayer, or quests | `game-arena-multiplayer-and-quests` | Perspective-fair LLM arenas, URL-seed or stateless lockstep play, and softlock-free progression graphs |

## Decisions across game types

| Game family | 10-second toy target | Pushback & escalation source | Scaffolding to defer |
| :--- | :--- | :--- | :--- |
| Action or physics | One 3D/lit arena with trajectory arc, hazard, and instant `<300 ms` reset | Moving threats, momentum overshoot, destructible cover | Level select, gear shops, skill trees |
| Strategy or tactics | One contested skirmish or terrain choke with instant exchange | Flanking AI policies, shrinking safe zones, scarce high ground | Tech trees, faction lore, diplomacy menus |
| Puzzle or board | One 3-move spatial setup that teaches a surprising chain rule wordlessly | Tight move budgets, coupled blockers, escalating board topologies | Campaign map, hint currency, star ratings |
| Vehicle or mechanism | One articulated craft or rig tackling an immediate physical obstacle | Load instability, crosswinds, structural stress limits | Garage upgrades, fuel timers, career menus |
| Cozy or observational | One tactile specimen or instrument (*only when requested or 1 slot in a batch*) | Expressive combo harmony or precision mastery without timer stress | Day-night calendars, inventory bags, fetch quests |

## Traps

- Mistaking a calibration slider for a game. Dragging one paddle, lens, or droplet until a progress ring fills—with no way to lose and no tactical choice—produces a 10-second kiosk, not a game.
- Defaulting to flat SVG or unlit `Canvas2D` primitives. Bundle `Three.js`, custom `WebGL2` shaders, or lit multi-plane rendering via an IIFE build step instead of settling for flat vector shapes.
- Cloning one mood across a multi-agent batch. Five quiet desk/harbour crafts in a row bore the player immediately; enforce distinct genre, camera, and tempo slots across sub-agents.
- Building menus or tutorial walls before mechanics. If the first 300 lines draw modals, settings tabs, or rule paragraphs, delete them and build the playable world first.
- Blocking easter eggs. Ambient wildlife or visual surprises must never silently gate the main objective.

## Self-check

| Check | Pass | Fail symptom |
| :--- | :--- | :--- |
| Boot to play | Page loads straight into an active playable world | Blocking title overlay, setup cloud sandbox, or multi-paragraph instructions |
| 150 ms response | First input produces immediate physical motion, impact, and sound | Input only highlights UI chrome or ticks a silent number |
| Real stakes & pull | Passive or sloppy play fails; skilled play unlocks combos and escalating rounds | Unloseable dial/slider widget where every round repeats the same check |
| Spatial & visual depth | 3D rigs, GPU shaders, or lit multi-plane visuals give real material depth | Flat `<svg>` elements or unlit vector `Canvas2D` diagram shapes |
| Batch diversity (`N >= 2`) | Every game in a batch differs in genre family, camera projection, and tempo | Multiple games share the same calm top-down/elevation drag loop |
| Unified input & delight | Clean mouse, keyboard, and `>=44 px` touch play; easter eggs stay non-blocking | Hover-only controls, page-scroll drag bugs, or progression-blocking secrets |

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
