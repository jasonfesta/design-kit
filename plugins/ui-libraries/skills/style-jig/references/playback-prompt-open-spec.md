# Playback, Record, Trace, Prompt & Open — Behavioral Specification

This reference documents the complete bottom control row (`.bottom-motion-wrap` -> `.jig-bottom-controls-row`) introduced in the latest slides and standardized across `examples/jig-harness/` and `templates/`.

---

## 1. Bottom Controls Row Layout & Optical Alignment

```text
[ motion-craft  ▶  ● ]   [ trace ]   [ prompt ]   [ open ]
```

- All four plates share `.floating-motion-plate` (`height: 38px`, `border-radius: 11px`, `background: var(--plate)`, `border: none`, `box-shadow: none`, `gap: 10px` between plates).
- Every text label (`motion-craft`, `trace`, `prompt`, `open`) sits on the exact same `-2px` optically centered baseline (`padding: 2px 0 0 0` inside `.jig-action-label` and `.floating-motion-plate .jig-word`).
- **Zero Horizontal Layout Shift on `prompt`**:
  - `.jig-prompt-anchor` wraps an invisible `.jig-prompt-sizer` (fixed to the resting width of `prompt`) with `button.jig-prompt-plate` positioned `absolute; left: 0; top: 0;`.
  - Clicking `prompt` swaps its label to `copied to clipboard` for `1800ms` without moving `motion-craft`, `trace`, or `open` by even `1px`.

---

## 2. Playback Autopilot (`motion-craft ▶`, `[data-jig-play-toggle="true"]`)

Implemented in `examples/jig-harness/src/utils/autopilot.ts` and wired in `App.tsx`:

1. **Visible Animated Cursor (`.ap-cursor`)**:
   - Fixed `18×18px` emerald circle (`rgba(16, 185, 129, 0.92)` with `2px #ffffff` border, `z-index: 10000`, `pointer-events: none`).
   - Glides smoothly between targets (`transform 420ms cubic-bezier(0.22, 1, 0.36, 1)`) and fires a tactile tap compression (`scale: 0.84`) + expanding emerald ring (`@keyframes apTapRing 380ms`) before dispatching pointer enter and `click()`.
2. **Target Discovery Order**:
   - **Priority 1 (`[data-ap]`)**: Any visible interactive element inside the active stage annotated with `data-ap="<waypoint-id>"`. Authors can tag key buttons, tabs, cards, or inputs with `data-ap` to guide playback cleanly through their flow.
   - **Priority 2 (Auto-Discovery Fallback)**: Safe visible `button:not([disabled])`, `[role="tab"]`, `[role="switch"]`, `a[href]`, `input:not([disabled])`, or stage vessels inside `[data-jig-stage-viewport]` (strictly excluding Jig chrome and destructive words such as `delete`, `remove`, `logout`, `reset`).
3. **Scroll & Immersive Sync**:
   - In `view` mode (`stageMode === 'view'`), smoothly oscillates `scrollTop` along a cosine easing curve while forwarding synthetic `IMMERSIVE_POINTER` messages to embedded 3D/shader iframes.
4. **Instant Manual Yield**:
   - Genuine user interactions (`event.isTrusted === true` on `wheel`, `pointerdown`, `touchstart`, `keydown`) or `Escape` immediately stop playback and remove `.ap-cursor`.
   - Clicking `[data-jig-action]` (`trace`, `prompt`, `open`), `[data-jig-play-toggle]`, `[data-jig-record-toggle]`, or `[data-jig-record-output]` does not prematurely interrupt an active recording.

---

## 3. Strokeless Red Record (`●`, `[data-jig-record-toggle="true"]`)

1. **Control Design**:
   - `28×28px` transparent button containing a `13.5×13.5px` pure solid `#ef4444` circle (`.jig-record-dot`) with zero border and zero box-shadow.
   - While recording, `body[data-jig-recording="true"]` is set, `.jig-record-dot` pulses (`jigRecordPulse 0.85s ease-in-out infinite`), and `.jig-play-btn` illuminates as active (`playing`).
2. **Built-In 12-Second Choreography & Output Banner**:
   - Steps smoothly across TOC views, style slots, and dark/light polarity while counting live safe-zone overlaps (`countLiveSafeZoneOverlaps()`).
   - On completion (or manual stop), mounts `.jig-record-output-plate` (`[data-jig-record-output="true"]`) above the bottom row with summary telemetry plus `replay`, `export json`, and `close` actions.
3. **Headless MP4 Capture & Eval**:
   - `scripts/record_and_eval_jig.py` clicks `[data-jig-record-toggle="true"]`, records a `1440×900` `libx264` `yuv420p` `.mp4` (`-crf 18 -movflags +faststart`), extracts 6 PNG keyframes, and outputs `telemetry-audit.json`.

---

## 4. Unified Section Trace (`trace`, `[data-jig-action="trace"]`)

Implemented in `examples/jig-harness/src/data/jigTraceAndPrompt.ts`:

- Generates a structured Markdown dossier covering:
  - Active domain, active view (`component` vs `full view`), active style & donor variant notch, UI library, theme polarity, resolved surface tokens & typography.
  - Full inventory of all views in the active domain (marking the active view).
  - Exact standalone `?app=...` launch URL.
  - Standing Design Kit guardrails.
- **Window + Sandboxed Modal Fallback**:
  - When running top-level in a browser, opens a clean formatted `.md` preview tab via `Blob` URL (`noopener,noreferrer`).
  - When embedded inside an iframe (such as Jetski's right-hand Artifact Pane) or when popups are blocked, automatically opens an accessible in-app Trace Modal (`[data-jig-trace-modal="true"]`) with **`Copy .md`**, **`Download .md`**, and **`Close`** (plus `Escape` and backdrop dismiss).

---

## 5. Live Rendered Prompt Copy (`prompt`, `[data-jig-action="prompt"]`)

Implemented in `examples/jig-harness/src/utils/captureRenderedStage.ts` and `src/data/jigTraceAndPrompt.ts`:

1. **Exact Live DOM & Matched CSS Extraction (`captureLiveRenderedStage`)**:
   - Clones the active mounted stage (`.jig-stage-mount`, `.imm-view-frame`, or `.jig-view-shell`).
   - Mirrors live interactive form states (`<input>` value/checked, `<textarea>` text, `<select>` selected options) and snapshots live `<canvas>` elements (WebGL/charts) into inline PNG `<img>` tags.
   - Walks `document.styleSheets`, filtering out all Jig-chrome selectors (`.top-jig-wrap`, `.bottom-motion-wrap`, `.floating-*`, `.jig-*`, `.toc`, `.right-variant-notches`, `.dk-panel`, `.ap-cursor`) while preserving matched stage rules, `:root` CSS custom properties, `@keyframes`, `@media`, `@supports`, `@container`, `@property`, and Tailwind v4 `@layer` blocks.
   - Wraps the captured markup + CSS into a self-contained standalone HTML5 document framed appropriately for `full view` (`100vw × 100vh`) or `component` (centered on stage).
2. **Dual Clipboard Write + Test Telemetry**:
   - Writes both clean `text/plain` and rich `text/html` (embedding the active donor variant `<img src="data:...">` above the prompt) via `navigator.clipboard.write([new ClipboardItem(...)])`, falling back gracefully to `writeText` and `execCommand('copy')`.
   - Stores the last copied payload on `window.__LAST_COPIED_JIG_PROMPT__` and `window.__LAST_COPIED_JIG_PROMPT_BUNDLE__` for deterministic inspection and Playwright verification.

---

## 6. Standalone 100% × 100% Launch (`open`, `a[data-jig-action="open"]`)

1. **Live Query-Parameter Href**:
   - Continuously reflects the current Jig state:
     `?app=<domain>&slide=<slideId>&style=<style>&variant=<1..5>&theme=<dark|light>&lib=<shadcn|ease|fluid>`
2. **Chromeless Full-Bleed Rendering**:
   - On load, `resolveStandaloneLaunchParams()` in `App.tsx` checks `?app=...` (or `?nojig=1` or `window.__STANDALONE_DOMAIN__`).
   - When active, `App.tsx` bypasses all Jig plates, TOC, inspector, and notches, rendering `<StageEnvironment standalone ... />` (`[data-standalone="true"]`, `fixed inset-0 w-screen h-[100dvh]`) with the requested slide, style, donor variant notch, library, and dark/light polarity pre-applied.
