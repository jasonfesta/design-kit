# `references/` — Technical Specifications & Master Prompts

This directory contains the architecture contracts, master prompts, and contribution guardrails for the **Design Kit Jig** (`style-jig`):

1. **[`playback-prompt-open-spec.md`](playback-prompt-open-spec.md)**
   - Complete specification for the latest bottom control row: `.ap-cursor` Playback Autopilot, strokeless Red Record (`●`) + 12s showcase + MP4 capture, unified `trace` `.md` modal/tab, live rendered `prompt` DOM+CSS snapshotter (`captureRenderedStage.ts`) with zero-shift feedback, and `open` 100% × 100% standalone URL contract.
2. **[`layering-and-stage-isolation.md`](layering-and-stage-isolation.md)**
   - Stacking contract (`z-index: 9999` / `2147483640` vs isolated stage `z-index: 1`), zero-halo `#000000` / `#FAF9F6` transparent stage corridor, Tailwind v4 `@layer base` discipline, library dimming/locks, and cross-iframe `postMessage` bridges.
3. **[`immersive-and-auto-travel-spec.md`](immersive-and-auto-travel-spec.md)**
   - Right-hand `.dk-panel` drag-scrub inspector schemas (`3d`, `parallax`, `shader`, `menu`, `cards`, `bg`), custom stylized Jig Backplate Dropdowns, `window.__JIG_IMMERSIVE_SCHEMA__` registration, and auto-traveler rules.
4. **[`stage-and-centering-prompt.md`](stage-and-centering-prompt.md)**
   - Copy-pasteable master prompt for building the canonical Slides-matched matte backplate Jig harness and centered zero-halo stage.
5. **[`3d-formations-and-jig-prompt.md`](3d-formations-and-jig-prompt.md)**
   - Master prompt for standalone Three.js 3D sculptural formations (`chain`, `helix`, `ring`, `wave`, `arch`) connected directly to the Jig.
6. **[`parallax-and-jig-prompt.md`](parallax-and-jig-prompt.md)**
   - Master prompt for the kinetic scroll parallax typography engine connected directly to the Jig.
7. **[`contributing.md`](contributing.md)**
   - Core taste guardrails, portability invariants, bidirectional write-back rule, and validation commands.
