---
name: clone-to-prompt-reskin
description: Transform a dual-mode Shadcnblocks Admin Clone + WDA Master Prompt application so toggling Clone vs Prompt leaves any parent showcase jig static while completely reskinning the UI (theme, palette, surfaces, accents) and transforming all navigation, copy, KPIs, charts, tables, and workflows inside the iframe via a sandbox-safe postMessage + boot-shim bridge.
---

# Clone-to-Prompt UI Reskin & Context Wrapping

Follow this protocol whenever pairing a literal **Clone** Admin UI (`Clone` mode) with a rich domain **Prompt** application (`Prompt` mode) inside a Master Player or dual-mode harness.

## 1. Keep Parent Chrome Static Above the Frame
- Top showcase bars / experience switchers belong strictly outside the inner app (`window.self !== window.top` hides inner mode toggles using `sr-only` while keeping `[data-mode="clone"]` and `[data-mode="prompt"]` mounted in the DOM).
- Never mutate top-bar experience labels or layout when switching `Clone` ↔ `Prompt`. Everything *below* the top bar changes.

## 2. Sandbox-Safe Iframe Mode Bridge (`postMessage` + Boot Shim)
Because embedded viewers (`<iframe srcdoc>`) frequently run in sandboxed opaque origins where `frame.contentDocument` throws `SecurityError`, always wire BOTH:
1. **Parent Player → Iframe**:
   - Inject `window.__MASTER_MODE__ = currentMode` into the HTML string when loading a slot (`srcdoc`) so `t=0` renders in the target mode with zero flash.
   - Post `{ type: 'SHADCNBLOCKS_SET_MODE', mode }` via `frameEl.contentWindow.postMessage(...)` (and also try same-origin `.click()` on `[data-mode]` as fallback).
2. **React App (`src/App.tsx`)**:
   - Initialize `mode` from `(window as any).__MASTER_MODE__ === 'prompt' ? 'prompt' : 'clone'`.
   - Listen to `window.addEventListener('message', ...)` for `SHADCNBLOCKS_SET_MODE` and call `switchMode(nextMode)`.

## 3. Full Visual Reskin (`[data-skin="prompt"]`)
Switching to `Prompt` must **reskin all of the UI**, not just swap a few words:
- Sync `document.documentElement.setAttribute('data-skin', mode)` and set `data-skin={mode}` on the root app container.
- Keep `Clone` in the reference Admin skin (e.g., Shadcnblocks Neutral Zinc `#09090b` / `#111113`).
- Author a distinct, web-accessible theme for `Prompt` in `src/index.css` (`[data-skin="prompt"]`) + explicit JSX mode styling covering canvas background, sidebar surface, card surfaces, borders, text polarity/contrast, primary CTA accents, active sidebar pills, status chips, and chart palettes.
- **STRICT BAN on Purple / Violet / Indigo / Blue Layout Skins**: NEVER adopt purple, violet, indigo, sky/cyan, navy-slate, or blue-tinted backgrounds, sidebars, cards, borders, or dominant UI accents (`#12081c`, `#06111e`, `#040714`, `#050a18`, `#a855f7`, `#3b82f6`, `#4f46e5`, `#38bdf8`, `purple-*`, `indigo-*`, `blue-*`, `sky-*`, `cyan-*`). Always use either **True Neutral Web-Accessible Dark Mode** (`#09090b` / `#101012` / `#161619`, borders `#27272a`, `#fafafa` / `#a1a1aa` text) or **Crisp Web-Accessible Light Mode** (`#ffffff` / `#fafafa` / `#faf9f6`, borders `#e4e4e7`, `#09090b` / `#52525b` text) paired with grounded accents (Forest/Signal Emerald, Amber/Ochre, Warm Rust/Safety Orange, Pine Green, Crimson, or Monochrome).

## 4. Full Long-Prompt Text & Workflow Wrapping
- Parse every numbered module, role, business rule, formula, compliance gate, KPI, chart series, and action from the full WDA Master Prompt.
- Ensure **zero leaked Clone identifiers/copy** appear in `Prompt` mode and **zero leaked Prompt domain jargon** appears in `Clone` mode across:
  - Sidebar brand header & collapsible nav tree (`<main>`-only navigation; never open modals or hijack right rail)
  - Center `<main>` header, search placeholder, KPI ribbon, charts, data tables, drawers, and sub-pages
  - Contextual right inspector & interactive modals
