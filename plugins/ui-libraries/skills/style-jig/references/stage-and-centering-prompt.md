# Design Kit Jig & Centered Stage Environment — Master Prompt

> **Canonical Working Example**: `~/design-kit/plugins/ui-libraries/skills/style-jig/examples/jig-harness/`
> **Instant Right-Pane Artifact Launcher**:
> ```bash
> python3 /usr/local/google/home/jfesta/design-kit/plugins/ui-libraries/skills/style-jig/scripts/launch_jig_artifact.py \
>   --artifact="<artifact_dir>/design-kit-jig-harness.html"
> ```
> Follow immediately with `edit_file` (`READY_FOR_SNAPSHOT` → `LOCAL_SINGLEFILE_ACTIVE`, `ArtifactMetadata: { "UserFacing": true, "RequestFeedback": false, "Summary": "..." }`) to open the live Jig in Jetski's right-hand Artifact Pane.

---

## 1. Master Prompt (Copy & Paste)

Use this prompt whenever you want an agent to build **the canonical Slides-matched (`11-13-26`) Matte Backplate Design Kit Jig harness and its centered zero-halo stage corridor** (ready to host centered components, full-view workspaces, 3D/WebGL/Shader stages, or 9:16 mobile app frames):

```markdown
Build a standalone Slides-matched Matte Backplate Design Kit Jig harness and its centered zero-halo stage environment (`100vw × 100vh`) in React 19 + Vite 7 + Tailwind v4 (`vite-plugin-singlefile`).

### 1. Theme Tokens, `@layer base` Discipline & Zero-Halo Stage Corridor
- **Outer Stage Canvas & Matte Backplate Tokens**:
  - **Dark Mode (`html[data-jig-theme="dark"]`, `body[data-theme="dark"]`)**: `--bg: #000000`, `--plate: #151514`, `--g2: #1b1b19`, `--g3: #232320`, `--fg: #ededec`, `--muted: #a3a29d`, `--faint: #868580`, `--pill-bg: rgba(255, 255, 255, 0.085)`.
  - **Light Mode (`html[data-jig-theme="light"]`, `body[data-theme="light"]`)**: `--bg: #faf9f6`, `--plate: #e7e5df`, `--g2: #dcd9d0`, `--g3: #d0cdc3`, `--fg: #18181b`, `--muted: #575652`, `--faint: #87857e`, `--pill-bg: rgba(24, 24, 27, 0.085)`.
- **Tailwind v4 `@layer base` Rule (Critical)**:
  - Place `*, *::before, *::after { box-sizing: border-box; }` and `html, body, #root` defaults inside `@layer base`. NEVER write unlayered `* { padding: 0; margin: 0; border: none; }`, which overrides Tailwind v4 `@layer utilities` (`px-*`, `py-*`, `p-*`, `border`, `gap-*`) inside mounted React views. Scope explicit `border: none` and button paddings to `.toc-*`, `.jig-*`, `.floating-*`, `.rvn-*`, and `.dk-*`.
- **2-Column Layout & Zero-Halo Stage Corridor (`[data-jig-stage-viewport]`)**:
  - `.layout` uses `display: grid; grid-template-columns: clamp(132px, 14vw, 188px) minmax(0, 1fr); width: 100vw; height: 100vh; overflow: hidden;`.
  - `.stage`, `[data-jig-stage-viewport]`, `.slides-viewport`, and `.jig-stage-mount` MUST keep `background: transparent !important; border: none !important; box-shadow: none !important;` so centered components sit directly on pure `#000000` or `#FAF9F6` with zero rectangular grey halo.
  - Measure `.top-jig-wrap`'s `getBoundingClientRect().bottom` via `ResizeObserver` + `resize` and set `--jig-top-safe: ${Math.max(66, Math.ceil(rect.bottom + 14))}px` on `document.documentElement`.
  - Style `[data-jig-stage-viewport]` with `width: 100%; height: 100vh; padding: var(--jig-top-safe, 66px) 46px 62px 12px; display: flex; align-items: center; justify-content: center; overflow: hidden;` so both `Component` and `Full View` stages center cleanly at `(50%, 50%)` of the safe corridor with zero overlap against Top Jig, Bottom `motion-craft ▶`, Left `.toc`, or Right `16×16` Variant Notches at both `1440×900` and `860×880` split-pane widths.

### 2. Canonical Matte Backplate Jig Surfaces (`z-index: 9999`, `Instrument Sans` `13.5px` Lowercase)
- **Optical Button Centering (`-2px` Down Rule)**: Every `<button>` shifts its optical visual center `-2px` down (`padding: 5px 10px 1px 10px` on `.jig-word`, `padding: 2px 0 0 0` on icon buttons, `padding: 5px 0 1px 14px` on `.toc-item`) so Latin cap-height and icons never float high.
1. **Top Centered Floating Plates (`.top-jig-wrap`, `top: 12px`, `pointer-events: none` wrapper)**:
   - **Style Plate (`.floating-style-plate`, `height: 40px`, `border-radius: 13px`, `padding: 5px`, `background: var(--plate)`)**: Smooth sliding `.jig-active-pill` (`border-radius: 8px`, `background: var(--pill-bg)`) across the 9 folder-backed slots:
     `clone · clean · grid · editorial · cinematic · product · brutal · playful · retro`
   - **UI Libraries + Theme Plate (`.floating-lib-plate`, `height: 40px`, `border-radius: 13px`, `padding: 5px`, `background: var(--plate)`)**: Smooth sliding `.jig-active-pill` across `shadcn · ease · fluid` + `26×26px` Moon/Sun toggle (`.jig-theme-btn`, flipping `#000000` ↔ `#FAF9F6`).
2. **Right-Edge `16×16` Donor Variant Notches + `176×124` Preview (`.right-variant-notches`)**:
   - Fixed right-center matte `--plate` pill (`right: 14px; top: 50%; transform: translateY(-50%); border-radius: 12px; padding: 8px 6px; gap: 7px`) rendering `16×16px` donor thumbnail squares (`.rvn-notch`, `Alt+1..5` shortcuts) + floating `176×124px` preview tooltip (`.rvn-tooltip`) on hover/focus (`window.VariantNotches`).
3. **Right-Side Tactile Drag-Scrub Inspector (`.dk-panel`, when hosting `3d`, `parallax`, `shader`, `menu`, `cards`, `bg`)**:
   - `256px` matte `--plate` card (`border-radius: 14px`, `padding: 16px 18px`, `overflow: visible`) with `34px` horizontal pointer-capture drag-scrub sliders (`.dk-slider-row`), word strips, segmented tab menus, color swatches, and a custom **Jig Backplate Dropdown** (`.dk-backplate-dropdown`, zero native `<select>`).
4. **Bottom Centered Motion-Craft Plate (`.bottom-motion-wrap` / `.floating-motion-plate`, `bottom: 12px`)**:
   - Matte `--plate` pill (`border-radius: 11px`, `padding: 6px 10px 6px 14px`) with `motion-craft` + `24×24px` `▶` / `■` button (`.jig-play-btn`), driving stage walkthroughs / autopilot and auto-pausing on genuine manual user input (`event.isTrusted === true`).
5. **Left Pure Lowercase TOC (`.toc`)**:
   - Borderless vertical navigation column listing lowercase domain headers and `component` / `full view` entries.

Typography: Instrument Sans Variable (500/600 lowercase Jig plates, TOC & UI) + Onest Variable / Schibsted Grotesk Variable (stage UI) + JetBrains Mono Variable (400/500 telemetry & tabular-nums readouts, >= 12px floor)
Color (Dual Stage — Pure #000000 Dark & #FAF9F6 Daylight Paper): dark plate #151514, light plate #E7E5DF, accent Signal Emerald #10B981, accent Warm Amber #F59E0B, dark bg #000000, light bg #FAF9F6, dark text #EDEDEC, light text #18181B
Build: Bundled `@fontsource-variable/*` offline WOFF2 fonts + `@layer base` reset + CSS Grid/Flex transparent stage corridor (`--jig-top-safe`) + `window.JigAgent` & `window.VariantNotches`
Avoid: purple/violet/indigo hues (OKLCH 270°–330°); Material fonts (Roboto, Google Sans, Noto Sans); unlayered `* { padding: 0; border: none; }` resets; non-black wrapper halos behind centered components; native `<select>` dropdowns; visible OS scrollbars
```
