# Design Kit Jig (`style-jig`) — Designer's Guide, Install & Self-Setup

The **Design Kit Jig** (`style-jig`) is an install-once Jetski skill (and standalone Jetski plugin) that wraps any UI prototype — component, landing page, dashboard, 3D/WebGL stage, shader, or 9:16 mobile app — in borderless matte backplates over a pure `#000000` (Dark) or `#FAF9F6` (Light) stage.

It includes everything from the latest round of slides: customizable style taxonomy + donor variant notches, customizable UI/motion library toggles, expandable accordion Left TOC, right-side `.dk-panel` drag-scrub inspector, interactive **Playback** autopilot cursor, strokeless **Red Record** MP4 walkthroughs, **Trace `.md`** viewer, live rendered **Prompt** HTML+CSS clipboard copy, and **100% × 100% Open** standalone launches.

> **Zero rigid assumptions:** The sample harness defaults to `full stack / immersive / app`, `clone` through `retro`, and `shadcn / ease / fluid`, **but your project can use any domains/types, any style names (with or without `clone`), and any UI/motion library stack** via a single `jig.config.json` file.

---

## 1. Quick Install (Once, Then Reuse Forever)

For full installation options and an annotated `jig.config.json` walkthrough, see **[INSTALL.md](INSTALL.md)**.

### Install as a Jetski Skill (Global — All Projects)
```bash
# Direct install on a Google workstation:
bash /google/data/ro/users/jf/jfesta/www/style-jig/install.sh

# Or unzip style-jig.zip / style-jig.skill manually:
mkdir -p ~/.gemini/config/skills
unzip -o style-jig.zip -d ~/.gemini/config/skills/
```

### Install as a Standalone Jetski Plugin (`design-kit-jig`)
Bundles the `style-jig` skill together with the `jig-agent` and `jig-recorder` subagents:
```bash
bash /google/data/ro/users/jf/jfesta/www/style-jig/install.sh --plugin

# Or unzip manually into ~/.gemini/config/plugins/:
mkdir -p ~/.gemini/config/plugins
unzip -o design-kit-jig-plugin.zip -d ~/.gemini/config/plugins/
```

### Install Into One Repository (Team Shared)
```bash
mkdir -p .agents/skills && unzip -o style-jig.zip -d .agents/skills/
# (Use _agents/skills/ inside Piper/CitC workspaces.)
```

---

## 2. How It Sets Itself Up After Install

Once installed, open a Jetski chat in any project and say:

> **"Set up `style-jig` for my project."**

Jetski automatically inspects your repo (`package.json`, existing files, `styles/`) and configures **`jig.config.json`** around **your** stack instead of assuming defaults:

1. **Choose Your Types / Domains (`--domains`)**
   - Pick any mix of presets (`component`, `landing`, `dashboard`, `fullstack`, `immersive`, `3d`, `mobile`/`app`) or invent your own section names (e.g., `marketing,onboarding,checkout`).
   - Each domain declares its `chromeMode`: `"standard"` (desktop web), `"immersive"` (full-bleed 3D/shader + `.dk-panel` inspector + auto-dimmed UI lib buttons), or `"app"` (9:16 mobile frame + `.dk-panel` inspector).
   - Static HTML projects with no React build step automatically use `--vanilla`.
2. **Choose Your Libraries (`--libs` / `--ui` + `--motion`)**
   - Declare the actual libraries in your project — e.g. `shadcn,motion`, `mui,gsap`, `radix,tailwind`, `konsta`, `three,r3f`, or `none` (renders only the Dark/Light toggle).
   - Clicking any library button in the top bar updates `data-active-lib` and dispatches `jig:lib-change` so your components react live.
3. **Choose Your Style Slots (`--styles` / `--no-clone`)**
   - Keep the 9 built-in styles (`clone`, `clean`, `grid`, `editorial`, `cinematic`, `product`, `brutal`, `playful`, `retro`), trim to a subset, or supply completely custom style names (e.g., `--styles=warm-paper,swiss-grid,dark-studio`).
   - Pass `--no-clone` for greenfield explorations that don't start from a cloned baseline.
   - Drop 1–5 reference screenshots into any `styles/<slot>/` folder to populate the right-edge `16×16` donor notches (`Alt+1..5`).
4. **Configure Your Optional `clone` Source (`--clone-provider`)**
   - `jig.config.json` includes a dedicated `cloneSource` hook (`provider`: `"none" | "manual" | "screenshot" | "html-file" | "external-service"`, plus `serviceName`, `endpoint`, and `command`) so you can plug in an external clone service whenever you're ready without modifying the Jig harness.

---

## 3. Ask Jetski to Use It Over and Over Again

After installing once, you never need to copy boilerplate or memorize CLI flags. Reuse prompts like these across every new project and design round:

| What you want to do | Just ask Jetski |
| :--- | :--- |
| **First-time guided setup (your own types & libraries)** | *"Set up `style-jig` for this project — ask me which slide types, UI/motion libraries, styles, and clone source I want."* |
| **Start a custom non-default project in one prompt** | *"Use `style-jig` to set up a light-mode Landing + Checkout workspace using MUI + GSAP with 3 custom styles (`warm-paper`, `swiss-grid`, `dark-studio`) and no clone slot."* |
| **Wrap an existing React or static HTML build** | *"Wrap this project in the Design Kit Jig (`style-jig`) using my existing Tailwind + Motion stack and open it in the right-hand pane."* |
| **Plug in a clone service for the `clone` slot** | *"Configure `cloneSource` in `jig.config.json` to use our external clone service and mount its output on the `clone` slot."* |
| **Add more views or slide types later** | *"Add an `onboarding` section with a centered card component and full-view flow to `jig.config.json` and mount them in the Left TOC."* |
| **Keep using it across every turn automatically** | *"Keep putting every new screen and experiment in this workspace inside `style-jig` so I can switch styles, run playback, copy prompts, and open standalone views."* |
| **Drop your own visual references (5 donor notches)** | *"Map these 5 screenshots in `styles/editorial/` to the right-edge donor notches in `style-jig`."* |
| **Attach a 3D / Parallax / Shader / Mobile inspector** | *"Mount my Three.js canvas on an `immersive` slide in `style-jig` and wire the `.dk-panel` drag-scrub sliders to camera depth and roughness."* |
| **Wire Playback & record a 12s MP4 critique** | *"Add `[data-ap]` playback waypoints, run the red Record button via `style-jig`, capture a 12-second 1440×900 MP4 walkthrough, and critique the keyframes."* |
| **Hand off a view to another chat or engineer** | Click **`prompt`** to copy the live rendered HTML + CSS + context prompt, **`trace`** for the unified section `.md`, or **`open`** for a clean 100% × 100% standalone link. |

> **Pro tip:** Add one line to your workspace's `AGENTS.md` — *"Wrap all UI explorations in the installed `style-jig` harness."* — and Jetski will reach for it automatically on every turn.

---

## 4. Every Control on the Design Kit Jig (Latest Slides Spec)

All Jig plates use borderless matte `--plate` surfaces (`#151514` Dark / `#e7e5df` Light), lowercase **`Instrument Sans`** (`13.5px`, `-0.01em` tracking, `tabular-nums`), smooth sliding `.jig-active-pill` indicators, and **`-2px` optical vertical button centering**.

- **Top Style Plate (`.floating-style-plate`)**: Driven by `jig.config.json` -> `styles` (default `clone` through `retro`, or your own custom style slots).
- **Top Libraries + Theme Plate (`.floating-lib-plate`)**: Driven by `jig.config.json` -> `libraries` plus the Moon/Sun (`☾` / `☀`) Dark ↔ Light toggle (`#000000` ↔ `#FAF9F6`). Automatically dims library buttons on `chromeMode: "immersive"` slides and locks desktop chrome on `chromeMode: "app"` 9:16 slides.
- **Left Accordion TOC (`.toc`)**: Driven by `jig.config.json` -> `domains`. Only the active domain expands; tapping the active domain header again collapses the sub-list; collapses cleanly to a horizontal strip on mobile (`<= 768px`).
- **Right-Edge `16×16` Donor Notches (`.right-variant-notches`)**: Up to 5 donor sub-variants per style with `176×124` hover preview cards, pointer drag-scrubbing, and `Alt+1` .. `Alt+5` shortcuts.
- **Right-Side `.dk-panel` Drag-Scrub Inspector**: Pointer-capture horizontal drag-scrub bars, segmented menus, color swatches, stylized dropdowns, `copy`, `reset`, and `hide` (docks as a compact `show` pill in the top bar).
- **Bottom Control Row (`.jig-bottom-controls-row`)**:
  1. **`motion-craft ▶` Playback Autopilot**: Visible emerald `.ap-cursor` with tap ripples stepping across `[data-ap]` waypoints (or auto-discovered controls); yields immediately on manual click, scroll, touch, or `Escape`.
  2. **Strokeless Red Record (`●`)**: 12-second multi-view/style showcase + post-take output banner (`replay`, `export json`, `close`) + `record_and_eval_jig.py` MP4/keyframe/DOM audit.
  3. **`trace`**: Unified Markdown spec (domain views, style tokens, `cloneSource`, standalone URL) opening in a new tab or in-app Trace Modal (`Copy .md`, `Download .md`, `Close`).
  4. **`prompt`**: Captures live rendered DOM + matched CSS rules (`captureRenderedStage.ts` — zero Jig chrome leak, preserves `<input>` values, `<canvas>` PNGs, Tailwind v4 `@layer`/`@property`/`@keyframes`), copies rich HTML + plain text, and flips to `copied to clipboard` with `0px` horizontal shift.
  5. **`open`**: Launches a `100% × 100%` chromeless standalone window via `?app=&slide=&style=&variant=&theme=&lib=` (or `?nojig=1`).

---

## 5. CLI Quickstart (Used Automatically by Jetski)

```bash
# 1. Self-setup a custom React 19 + Vite 7 + Tailwind v4 project with YOUR types, styles & libraries
python3 scripts/init_style_jig.py ./my-app \
  --domains=landing,checkout \
  --styles=warm-paper,swiss-grid,dark-studio \
  --no-clone \
  --libs=mui,gsap \
  --theme=light

# 2. Or scaffold the default full-stack + immersive + app harness (clone..retro)
python3 scripts/init_style_jig.py ./my-prototype

# 3. Compile your project (or the default blank harness) for Jetski's right-hand Artifact Pane
python3 scripts/launch_jig_artifact.py \
  --project=./my-app \
  --artifact="<artifact_dir>/design-kit-jig-harness.html"

# 4. Wire a Vanilla HTML/CSS/JS static page (no React build step)
python3 scripts/init_style_jig.py ./my-static-site --vanilla --overwrite

# 5. Record a 12s 1440x900 H.264 MP4 walkthrough + 6 keyframes + DOM telemetry JSON
python3 scripts/record_and_eval_jig.py \
  --html ./my-app/dist/index.html \
  --mp4-out ./walkthrough.mp4 \
  --keyframes-dir ./keyframes

# 6. Repackage the standalone Jetski plugin bundle (design-kit-jig-plugin.zip)
python3 scripts/build_plugin_bundle.py --out-dir=./dist
```

---

## 6. Package Contents & References

- **[`INSTALL.md`](INSTALL.md)** — Dedicated install & post-install self-setup manual (skill, plugin, types, libraries, custom styles, `cloneSource`).
- **[`SKILL.md`](SKILL.md)** — Agent skill contract & first-run self-setup interview read automatically by Jetski.
- **[`DESIGN-KIT-JIG.md`](DESIGN-KIT-JIG.md)** — Master visual and engineering specification.
- **[`examples/jig-harness/`](examples/jig-harness/)** — Config-driven Golden Template React 19 + Vite 7 + Tailwind v4 harness (`jig.config.json`, `DesignKitJigBars.tsx`, `StageEnvironment.tsx`, `VariantNotchesRail.tsx`, `ParameterInspectorDrawer.tsx`, `captureRenderedStage.ts`, `autopilot.ts`).
- **[`references/playback-prompt-open-spec.md`](references/playback-prompt-open-spec.md)** — Technical spec for Playback `.ap-cursor`, Record MP4 eval, Trace `.md`, Prompt DOM+CSS capture, and Open URLs.
- **[`references/layering-and-stage-isolation.md`](references/layering-and-stage-isolation.md)** — Stacking (`z-index`), zero-halo canvas, and Tailwind v4 `@layer base` rules.
- **[`references/immersive-and-auto-travel-spec.md`](references/immersive-and-auto-travel-spec.md)** — `.dk-panel` inspector schemas and custom schema registration.
- **[`scripts/`](scripts/README.md)** & **[`templates/`](templates/)** — Portable CLI scripts (`init_style_jig.py`, `launch_jig_artifact.py`, `record_and_eval_jig.py`, `match_and_map_styles.py`, `build_plugin_bundle.py`, `install.sh`) and Vanilla runtime templates.
