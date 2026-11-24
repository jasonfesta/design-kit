# `examples/` — Canonical Working Design Kit Jig Harness (`jig-harness/`)

`examples/jig-harness/` is the complete, Golden Template React 19 + Vite 7 + Tailwind v4 (`vite-plugin-singlefile`) working starter for the **Design Kit Jig** (`style-jig`).

## What's Inside `jig-harness/`

- **Top Matte Backplates (`src/components/DesignKitJigBars.tsx`)**: 9 style slots (`clone` through `retro`) + `shadcn / ease / fluid` + Moon/Sun (`#000000` Dark ↔ `#FAF9F6` Light) with smooth sliding `.jig-active-pill`.
- **Left Expandable Accordion TOC (`src/components/StageEnvironment.tsx`)**: `full stack` (`component`, `full view`), `immersive` (`3d`, `parallax`, `shader`), and `app` (`menu`, `cards`, `bg`) with mobile horizontal collapse below `768px`.
- **Right `16×16` Donor Variant Notches (`src/components/VariantNotchesRail.tsx`)**: 40 inline donor thumbnails (`8 styles × 5 notches`), drag-scrubbing, `176×124` hover preview, and `Alt+1..5` shortcuts.
- **Right Tactile Drag-Scrub Inspector (`src/components/ParameterInspectorDrawer.tsx`)**: 6 built-in `.dk-panel` schemas (`3d`, `parallax`, `shader`, `menu`, `cards`, `bg`), `34px` pointer-capture sliders, custom backplate dropdowns, and `hide`/`show` collapse pill.
- **Bottom Control Row (`DesignKitJigBars.tsx` + `src/utils/autopilot.ts` + `src/utils/captureRenderedStage.ts`)**:
  - **`motion-craft ▶`** — visible emerald `.ap-cursor` Playback Autopilot with tap ring, scroll gliding, and instant manual yield.
  - **`●` Red Record** — strokeless `#EF4444` pulsing circle driving a 12s showcase, live overlap checks, and post-take output banner (`replay`, `export json`, `close`).
  - **`trace`** — unified section `.md` viewer in a new tab or in-app Trace Modal (`Copy .md`, `Download .md`, `Close`).
  - **`prompt`** — live rendered DOM + matched CSS snapshot copied to clipboard with `0px` horizontal layout shift (`copied to clipboard`).
  - **`open`** — 100% × 100% chromeless standalone view via `?app=<domain>&slide=<id>&style=<slot>&variant=<1..5>&theme=<dark|light>&lib=<lib>`.

## Quick Launch

```bash
# Compile & open directly in Jetski's right-hand Artifact Pane:
python3 ../scripts/launch_jig_artifact.py --artifact="/path/to/artifact_dir/design-kit-jig-harness.html"

# Or scaffold into a fresh directory and develop locally:
python3 ../scripts/init_style_jig.py ./my-prototype
cd ./my-prototype && npm install && npm run dev
```
