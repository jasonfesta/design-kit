# Design Kit Jig (`style-jig`) — Complete Architecture Specification

The **Design Kit Jig** (`style-jig`) is the canonical Slides-matched matte backplate control harness, interactive playback engine, live prompt exporter, and standalone launcher for evaluating and showcasing components, full-stack workspaces, 3D/WebGL scenes, shaders, and mobile app surfaces over a pure `#000000` (Dark) or `#FAF9F6` (Light) zero-halo stage.

---

## 1. Visual & Spatial Contract

| Token | Dark (`[data-jig-theme="dark"]`) | Light (`[data-jig-theme="light"]`) | Role |
| :--- | :--- | :--- | :--- |
| `--bg` | `#000000` | `#faf9f6` | Pure outer stage canvas (zero halo) |
| `--plate` | `#151514` | `#e7e5df` | Matte Jig backplates (top, bottom, notches, `.dk-panel`) |
| `--pill-bg` | `rgba(255, 255, 255, 0.085)` | `rgba(24, 24, 27, 0.085)` | Sliding `.jig-active-pill` fill |
| `--g2` / `--g3` | `#1b1b19` / `#232320` | `#dcd9d0` / `#d0cdc3` | `34px` scrub sliders & custom dropdown hover |
| `--fg` | `#ededec` | `#18181b` | Active word, readout & active notch ring ink |
| `--muted` | `#a3a29d` | `#4a4945` | Hover word, slider label & icon ink |
| `--faint` | `#868580` | `#62605a` | Inactive lowercase word ink |

### Standing Craft Invariants
- **Typography**: Lowercase `Instrument Sans` (`13.5px`, `500`, `-0.01em` tracking, `tabular-nums`) for Jig chrome, `JetBrains Mono` for code/trace views, and expressive non-Material fonts on stage. Zero `Roboto`, `Google Sans`, `Product Sans`, or `Noto Sans`.
- **Color**: Zero purple/violet hues (`OKLCH 270–330°`). Signal Emerald (`#10B981`) for the `.ap-cursor` playback dot and recording completion badge; Signal Crimson (`#EF4444`) strictly for the strokeless Red Record dot.
- **Optical Vertical Button Centering (`-2px` Down)**: Every `<button>` shifts visual content `-2px` down (`padding: 5px 10px 1px 10px` on `.jig-word`, `padding: 2px 0 0 0` on icon buttons and `.jig-action-label`) so cap-height and icons never float high.
- **Tailwind v4 `@layer base` Rule**: Put `box-sizing: border-box` and `html, body, #root` defaults inside `@layer base` so Tailwind utilities inside mounted stage views are never overridden.

---

## 2. Full Perimeter Architecture

1. **Top Centered Floating Plates (`.top-jig-wrap`, `z-index: 9999`)**:
   - `.floating-style-plate`: 9 folder-backed slots (`clone`, `clean`, `grid`, `editorial`, `cinematic`, `product`, `brutal`, `playful`, `retro`) with smooth sliding `.jig-active-pill` and mobile auto-centering scroll.
   - `.floating-lib-plate`: `shadcn`, `ease`, `fluid` + Moon/Sun (`☾` / `☀`) polarity toggle, with `data-imm-libs-disabled="true"` (25% dim on immersive stages) and `data-app-libs-disabled="true"` (mobile app lock).
   - `.dk-collapsed-pill`: compact `show` pill docked into `.top-jig-wrap` whenever `.dk-panel` is collapsed.
2. **Left Expandable Accordion TOC (`.toc`)**:
   - Lowercase domain buttons (`.toc-group-btn`) expanding only the active domain's sub-items (`.toc-sub-list`). Clicking the active domain collapses the sub-list cleanly. Converts to a horizontal scrollable top strip below `768px`.
3. **Right-Edge `16×16` Donor Variant Notches (`.right-variant-notches`)**:
   - Shows up to 5 donor thumbnails per non-clone style (`8 × 5 = 40` skins + `clone`), `176×124` hover preview tooltip, pointer drag-scrubbing, and `Alt+1..5` keyboard shortcuts (`window.VariantNotches`).
4. **Right-Side Tactile Drag-Scrub Inspector (`.dk-panel`)**:
   - `256px` matte `--plate` drawer with `34px` pointer-capture horizontal scrub sliders, word strips, segmented tab menus, color swatches, custom stylized backplate dropdowns (zero native `<select>`), `copy`, `reset`, and `hide`, across 6 schemas (`3d`, `parallax`, `shader`, `menu`, `cards`, `bg`).
5. **Bottom Centered Control Row (`.bottom-motion-wrap` -> `.jig-bottom-controls-row`)**:
   - **Playback + Record Plate (`.floating-motion-plate`)**: `motion-craft` + `▶ / ■` Playback Autopilot (visible `.ap-cursor` emerald cursor with tap pulse + scroll gliding + instant manual yield) + `13.5×13.5` strokeless Red Record button (12s choreographed showcase + post-take `.jig-record-output-plate` banner + `scripts/record_and_eval_jig.py` MP4 capture).
   - **`trace` Plate (`[data-jig-action="trace"]`)**: Unified domain Trace Markdown (`.md`) in a new tab or in-app Trace Modal (`Copy .md`, `Download .md`, `Close`).
   - **`prompt` Plate (`.jig-prompt-anchor` + `[data-jig-action="prompt"]`)**: Live rendered DOM + matched CSS snapshot (`src/utils/captureRenderedStage.ts`) copied as `text/plain` + rich `text/html` (embedding the active donor thumbnail), with zero-shift `copied to clipboard` feedback via `.jig-prompt-sizer`.
   - **`open` Plate (`a[data-jig-action="open"]`)**: 100% × 100% chromeless standalone launch via `?app=<domain>&slide=<slideId>&style=<style>&variant=<1..5>&theme=<dark|light>&lib=<lib>`.

---

## 3. The 9 Canonical Style Slots (`templates/defaults/`)

| Slot | Jig Word | Default Polarity | Aesthetic & Non-Material Typography |
| :--- | :--- | :--- | :--- |
| `01` | `clone` | Source-locked | 1:1 structural & visual baseline (`Instrument Sans` + `Hanken Grotesk` + `JetBrains Mono`) |
| `02` | `clean` | Light (`#FAF9F6`) | Whisper-quiet luxury, daylight paper, soft elevation (`Schibsted Grotesk` + `Instrument Sans`) |
| `03` | `grid` | Light (`#F4F3EF`) | Exposed Swiss structural grid, hairline coordinates (`Schibsted Grotesk` + `IBM Plex Mono`) |
| `04` | `editorial` | Light (`#FBF9F5`) | High-contrast display serif headlines & magazine rhythm (`Newsreader` / `Fraunces` + `Hanken Grotesk`) |
| `05` | `cinematic` | Dark (`#000000`) | Pure obsidian stage, specular highlights & depth (`Syne` + `Instrument Sans`) |
| `06` | `product` | Light (`#FFFFFF`) | Crisp SaaS product proof, Bento cards, tactile controls (`Bricolage Grotesque` + `Figtree`) |
| `07` | `brutal` | Light (`#F3F5EC`) | Raw industrial structuralism, `2px` solid ink rules, hard offsets (`Archivo` + `Space Mono`) |
| `08` | `playful` | Light (`#FFFDF9`) | Tactile pill geometry, warm daylight, bouncy spring physics (`Outfit` + `Onest`) |
| `09` | `retro` | Mixed (`5` donors) | Win98 Paint, CRT Vector, 8-Bit World 1-1, AIM Messenger & Winamp Rack (`IBM Plex Mono` + `Space Mono`) |

---

## 4. Package File Tree

```text
style-jig/
├── README.md                                  # Designer's guide, install steps & reusable Jetski prompts
├── SKILL.md                                   # Portable Google Skill contract
├── DESIGN-KIT-JIG.md                          # Complete architecture specification
├── agent.md                                   # Subagent definition
├── examples/
│   ├── README.md                              # Working harness launch & customization guide
│   └── jig-harness/                           # Canonical React 19 + Vite 7 + Tailwind v4 starter
│       └── src/
│           ├── App.tsx                        # State, ?app= standalone router, autopilot & window.JigAgent
│           ├── index.css                      # @layer base, matte plates, bottom row, .ap-cursor, mobile TOC
│           ├── components/
│           │   ├── DesignKitJigBars.tsx       # Top plates + bottom playback/record/trace/prompt/open + Trace modal
│           │   ├── StageEnvironment.tsx       # Accordion TOC + isolated stage + standalone 100%x100% host
│           │   ├── EmptyStageBay.tsx          # Clean blank-stage vessel
│           │   ├── VariantNotchesRail.tsx     # Right-edge 16x16 donor notches + 176x124 preview
│           │   ├── ParameterInspectorDrawer.tsx # Tactile .dk-panel scrubbers & backplate dropdown
│           │   └── donors/                    # Portable 45-style donor token & chrome engine
│           ├── data/
│           │   ├── jigHarnessData.ts          # Slots, schemas, TOC types & global APIs
│           │   ├── jigTraceAndPrompt.ts       # Prompt payload builder, Trace .md generator & modal opener
│           │   └── donorThumbnails.ts         # 40 inline donor thumbnails (8 styles x 5 notches)
│           └── utils/
│               ├── captureRenderedStage.ts    # Live DOM + matched CSS snapshotter (strips Jig chrome)
│               ├── autopilot.ts               # Visible .ap-cursor playback driver
│               └── cn.ts                      # clsx + tailwind-merge helper
├── templates/                                 # Standalone Vanilla CSS/JS runtime, TopStyleJig.tsx & defaults/
├── scripts/                                   # Portable launch_jig_artifact.py, init_style_jig.py, record_and_eval_jig.py, match_and_map_styles.py
└── references/                                # playback-prompt-open-spec.md, layering, immersive, master prompts, contributing.md
```
