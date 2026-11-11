---
name: game-deterministic-sim-core
description: >-
  Decouple game simulation state from rendering and browser globals across
  three determinism levels—frame-rate independence, seeded headless
  replayability, and cross-browser lockstep parity.
metadata:
  icon: ✨
---

# Game deterministic simulation core

## What it is

This skill separates how a game updates its world state from how it draws frames and reads hardware input.

Keeping simulation rules inside a pure, renderer-free module unlocks four practical payoffs: consistent physics across 60 Hz and 120 Hz screens, headless playtests running thousands of times faster than real time, compact replays and undo stacks, and low-bandwidth multiplayer. Not every game needs the strictest tier of determinism, so this skill matches simulation rigour to what the game actually requires.

## When to use it

- Building any realtime or tick-driven game where frame drops or 120 Hz displays must not alter jump heights, cooldowns, or collision outcomes.
- Running automated headless playtesters, solver checks, or balance sweeps without launching a browser.
- Supporting undo, time scrubbing, save states, shareable replays, or peer-to-peer lockstep multiplayer.

## When not to use it

- Purely static, stateless, or single-click DOM trivia experiences with no evolving world state.
- Applying cross-browser custom trigonometry to a solo turn-based game that never shares simulation ticks across engines; choose the lightest tier below that fits your brief.

## Choose the right determinism tier

Lock your simulation tier up front so you neither leak browser globals into game logic nor over-engineer custom floating-point math where standard arithmetic suffices.

| Tier | Target capability | Required rules |
| :--- | :--- | :--- |
| 1. Frame-rate independent | Solo realtime play on any monitor | Fixed simulation step accumulator; clamp frame delta spikes; separate state from view |
| 2. Seeded reproducible | Headless bots, undo, local replays, save/load | Tier 1 plus seeded PRNG, explicit input command queue, zero wall-clock or DOM reads |
| 3. Cross-engine lockstep | Multi-device lockstep or portable action replays | Tier 2 plus engine-invariant math, canonical collection order, periodic state hashes |

## Core architecture rules

### 1. Keep browser and rendering globals out of simulation files

Simulation modules own world state, rules, collisions, AI decisions, and progression. View modules own cameras, sprites, meshes, particles, DOM overlays, audio nodes, and pointer listeners.

Simulation code must never touch `window`, `document`, `localStorage`, `AudioContext`, `requestAnimationFrame`, `Date.now`, `performance.now`, or rendering libraries. If removing the renderer breaks the simulation module in Node, Deno, Bun, or Python, the boundary has leaked.

### 2. Step realtime physics on a fixed tick accumulator

Variable render frame times (`dt`) change integration curves, letting fast monitors jump slightly higher or tunnel through thin walls on slow tabs.

- Accumulate elapsed frame time and advance the simulation in fixed steps (for example 60 Hz for crisp action or 20 to 30 Hz for strategy).
- Clamp accumulated frame time after a backgrounded tab resumes (such as capping at 100 to 250 ms) so the loop never freezes in a catch-up spiral.
- Interpolate visual positions in the renderer between the previous and current simulation states using the accumulator remainder so motion stays smooth on high-refresh screens.
- For strictly turn-based or puzzle games, advance state only on discrete player or agent actions rather than running an idle tick loop.

### 3. Feed all inputs and randomness through explicit boundaries

When targeting Tier 2 or Tier 3:

- Replace unseeded `Math.random()` inside simulation logic with a seeded pseudo-random generator stored as part of world state (or passed explicitly) so advancing or rewinding state advances randomness identically.
- Keep cosmetic particle randomness in its own separate visual RNG so turning graphics effects up or down never shifts gameplay outcomes.
- Apply player clicks, key presses, AI choices, and network packets only at clean tick or turn boundaries as plain serialisable commands rather than mutating entities mid-frame inside event listeners.

### 4. Eliminate cross-engine drift only when crossing runtimes (Tier 3)

Even with identical seeds and fixed ticks, JavaScript engines (V8, JavaScriptCore, SpiderMonkey) permit 1-ULP rounding differences on transcendental functions (`Math.sin`, `Math.cos`, `Math.tan`, `Math.atan2`, `Math.acos`, `Math.asin`). In chaotic continuous physics, that tiny rounding gap compounds into different trajectories within a minute.

When replays or lockstep sessions must match across devices:

- Replace native transcendental calls inside simulation logic with deterministic integer fixed-point arithmetic, lookup tables, or polynomial approximations quantised at each step (such as via `Math.fround`).
- Iterate entities in a canonical deterministic order (sorted numeric IDs or dense arrays) rather than unordered object keys or insertion-dependent sets created from external callbacks.
- Compute a fast rolling hash over canonical world state every N ticks so replay tests and lockstep peers catch divergence on the exact tick it begins rather than minutes later.

### 5. Keep replay payloads portable across static sandboxes

An input command log needs only the simulation version, starting seed, tick rate (if realtime), ordered inputs, and optional terminal state hash. When hosting on sandboxed static origins (`window.origin === "null"`), pass small replays via URL hash fragments, pasteable text, or classic script bundles rather than relative `fetch()` calls.

## CLI verification

`scripts/verify_sim_determinism.py` (PEP 723, zero external dependencies) checks real simulation source files and optional headless replay commands without imposing any naming convention or replay schema:

```bash
python3 ~/.gemini/config/skills/game-deterministic-sim-core/scripts/verify_sim_determinism.py \
  --sim-path ./src/sim \
  --json
```

Pass `--cross-engine` only when targeting Tier 3 lockstep or cross-browser continuous replays, and pass `--check-cmd "<headless command>"` to run a headless simulation twice and verify identical output hashes. Plant one deliberate unseeded random call once to confirm your check catches nondeterminism before trusting a green result.

## Traps

- Visual RNG polluting gameplay RNG. Spawning extra cosmetic sparks on desktop vs mobile consumes shared random numbers and desynchronises the next enemy spawn. Keep simulation and presentation RNGs strictly separate.
- Mutating state inside input listeners. Updating velocity directly inside `keydown` or `pointermove` ties behaviour to browser event delivery timing between frames. Queue inputs and consume them on the tick.
- Unclamped tab-resume spikes. Returning from a 30-second background tab and running 1,800 physics ticks synchronously locks the main thread. Always cap accumulated delta time.
- Premature fixed-point ceremony. Writing custom trigonometry for a single-player grid puzzle wastes effort and hurts readability; reserve Tier 3 rules for cross-runtime continuous sims.

## Self-check

| Check | Pass | Fail symptom |
| :--- | :--- | :--- |
| Headless import | Simulation module runs in a plain CLI runtime with no DOM shims | ReferenceError on `window`, `document`, or renderer globals |
| Refresh-rate parity | Outcomes match across 30 Hz, 60 Hz, and 120 Hz frame pacing | Jump heights, timers, or collisions shift with monitor refresh rate |
| Seed repeatability | Two headless runs with the same seed and inputs end in identical state | Repeated runs drift because of wall clocks or unseeded randomness |
| Cosmetic isolation | Disabling particles, sound, or camera shake leaves world state unchanged | Visual polish consumes simulation RNG calls or alters hitboxes |
| Tier fit | Math complexity matches Tier 1, 2, or 3 requirements | Missing cross-engine safety in lockstep, or unneeded custom trig in solo turn play |

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
