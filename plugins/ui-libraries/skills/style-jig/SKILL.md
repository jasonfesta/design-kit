---
name: style-jig
description: >-
  Installs, scaffolds, launches, and operates the canonical Slides-matched
  Design Kit Jig control harness with matte backplates, 9 folder-backed styles
  (clone through retro), 5 donor variant notches per style, UI library and
  dark/light theme switching, expandable accordion Left TOC, tactile
  right-hand drag-scrub inspector, interactive Playback autopilot cursor,
  strokeless Red Record MP4 walkthrough capture, unified Trace markdown
  viewer, live rendered Prompt HTML+CSS clipboard copy, and 100% standalone
  Open window launching. Use when a designer asks to wrap a component, app,
  landing page, 3D scene, shader, or slide deck in the Design Kit Jig, launch
  the Jig harness in the right-hand Artifact Pane, scaffold a fresh Golden
  Template Jig project, run playback/recording/trace/prompt/open flows, or
  reuse the Jig repeatedly across projects. Don't use for pure 3D photoreal
  reconstruction without a UI harness (use 3d-photoreal) or standalone font
  selection alone (use google-font-selection).
metadata:
  icon: ✨
---

# Design Kit Jig (`style-jig`) — Reusable Control Harness, Playback, Trace, Prompt & Open Skill

**`style-jig`** is the canonical Slides-matched matte backplate control harness, interactive **Playback** engine, **MP4 walkthrough recorder**, **Trace `.md`** inspector, live rendered **Prompt** exporter, and **100% × 100% Open** standalone launcher.

Once installed in Jetski, a designer can invoke `style-jig` repeatedly across any number of projects simply by asking in plain language (see [INSTALL.md](INSTALL.md) and [the Designer's Guide & Reusable Prompts](README.md)).

---

## 0A. First-Run Self-Setup Workflow (Never Assume Default Types, Styles, or Libraries)

Whenever a user says **"Set up `style-jig`"** or wraps a project for the first time, **do NOT assume** they want `fullstack / immersive / app`, `clean` through `retro`, or `shadcn / ease / fluid`. Run this short self-setup flow:

1. **Inspect the workspace first**: Check `package.json` (if present), existing `src/` vs. static HTML files, and any existing `jig.config.json` or `styles/` folders.
2. **Confirm 4 choices** (use `ask_question` if not already specified in the user's prompt):
   - **Slide Types / Domains (`--domains`)**: Presets (`component`, `landing`, `dashboard`, `fullstack`, `immersive`, `3d`, `mobile`/`app`) or custom domain names (e.g., `marketing,checkout`). Set `chromeMode` per domain (`"standard"`, `"immersive"`, or `"app"`). For static HTML with no React build, use `--vanilla`.
   - **UI & Motion Libraries (`--libs` / `--ui` + `--motion`)**: Match the user's real stack (`shadcn`, `tailwind`, `mui`, `radix`, `konsta`, `motion`, `gsap`, `three`, `r3f`, or `none` for theme-toggle-only).
   - **Style Slots (`--styles` / `--no-clone`)**: Keep the 9 built-in styles (`clone..retro`), pick a subset, or name custom styles (e.g., `warm-paper,swiss-grid,dark-studio`). Use `--no-clone` for greenfield builds with no clone baseline.
   - **Optional `clone` Source (`--clone-provider`)**: `"none"`, `"manual"`, `"screenshot"`, `"html-file"`, or `"external-service"` (`--clone-service-name`, `--clone-endpoint`, `--clone-command`) so an external clone service plugs cleanly into `jig.config.json` -> `cloneSource`.
3. **Scaffold & write `jig.config.json`**:
   ```bash
   python3 scripts/init_style_jig.py ./my-project \
     --domains=landing,checkout \
     --styles=warm-paper,swiss-grid,editorial \
     --no-clone \
     --libs=mui,gsap \
     --theme=light
   ```
4. **Compile & preview in the right-hand Artifact Pane**:
   ```bash
   python3 scripts/launch_jig_artifact.py \
     --project=./my-project \
     --artifact="/path/to/artifact_dir/design-kit-jig-harness.html"
   ```

---

## 0B. Immediate Right-Pane Working Example Launch & Default Scaffolding

Whenever asked to launch, preview, or start from the canonical Design Kit Jig harness immediately, compile and surface `examples/jig-harness/` directly in Jetski's right-hand Artifact Pane:

1. **Compile and stage the single-file bundle onto `<artifact_dir>/design-kit-jig-harness.html`**:
   ```bash
   python3 scripts/launch_jig_artifact.py \
     --artifact="/path/to/artifact_dir/design-kit-jig-harness.html"
   ```
   *(Run from the installed `style-jig` skill directory, or pass the full path to `scripts/launch_jig_artifact.py`. Works both inside `design-kit` and standalone from `style-jig.skill`, `style-jig.zip`, or `design-kit-jig-plugin.zip`.)*
2. **Activate the right-hand Artifact Pane via `edit_file`**:
   Replace `READY_FOR_SNAPSHOT` with `LOCAL_SINGLEFILE_ACTIVE` and set `ArtifactMetadata: { "UserFacing": true, "RequestFeedback": false, "Summary": "Design Kit Jig -- Canonical Slides-matched matte backplate stage harness (Playback, Record, Trace, Prompt, Open)" }`.

Common `init_style_jig.py` & plugin packaging commands:

```bash
# Default full scaffold (fullstack/immersive/app, clone..retro, shadcn/ease/fluid):
python3 scripts/init_style_jig.py ./my-new-project

# Custom project from a declarative jig.config.json:
python3 scripts/init_style_jig.py ./my-new-project --config=./jig.config.json --overwrite

# Vanilla HTML / CSS / JS runtime into <project>/jig/:
python3 scripts/init_style_jig.py ./my-static-site --vanilla --overwrite

# Bidirectional Jig Write-Back from a master project into examples/jig-harness/src/components/:
python3 scripts/init_style_jig.py --save-back-from ./my-master-project

# Assemble standalone Jetski Plugin bundle (design-kit-jig-plugin.zip):
python3 scripts/build_plugin_bundle.py --out-dir=./dist
```

---

## 1. Hard Layering, `@layer base` Rule & Zero-Halo Stage Corridor

1. **Jig Plates Always On Top (`z-index: 9999` / `2147483640`)**:
   - Full-width wrappers (`.top-jig-wrap`, `.bottom-motion-wrap`) use `pointer-events: none` while each matte backplate (`.floating-style-plate`, `.floating-lib-plate`, `.floating-motion-plate`, `.jig-action-plate`, `.right-variant-notches`, `.dk-panel`) sets `pointer-events: auto`.
   - The stage stays isolated underneath (`.stage { position: relative; z-index: 1; isolation: isolate; background: transparent !important; }`).
2. **Zero-Halo Pure Stage Canvas (`#000000` Dark / `#FAF9F6` Light)**:
   - `[data-jig-stage-viewport]`, `.slides-viewport`, `.jig-stage-mount`, and `.component-host` MUST keep `background: transparent !important; border: none !important; box-shadow: none !important;`.
   - Never place an opaque grey intermediate wrapper behind a centered component.
3. **Dynamic Safe Corridor (`--jig-top-safe`)**:
   - Measure `.top-jig-wrap`'s `getBoundingClientRect().bottom` via `ResizeObserver` and write `--jig-top-safe: ${Math.max(66, Math.ceil(rect.bottom + 14))}px` onto `document.documentElement` so stage views never collide with top, bottom, left, or right Jig plates.
4. **Tailwind v4 `@layer base` Discipline (Critical)**:
   - Always place `*, *::before, *::after { box-sizing: border-box; }` inside `@layer base`. Never write unlayered `* { margin: 0; padding: 0; border: none; }`, which strips Tailwind v4 `@layer utilities` (`px-*`, `py-*`, `border`, `gap-*`) inside mounted stage components.
   - Apply a zero-specificity 180ms soft theme/style settle via `:where(#root :is(...))` so style and polarity transitions glide cleanly without fighting explicit component animations.

See [Layering & Stage Isolation](references/layering-and-stage-isolation.md) for the complete stacking contract.

---

## 2. Canonical Matte Backplate Surfaces & Controls (Latest Slides Spec)

All Jig surfaces use lowercase **`Instrument Sans`** (`13.5px`, `font-weight: 500`, `-0.01em` tracking, `tabular-nums`), borderless matte `--plate` pills (`#151514` Dark / `#e7e5df` Light), zero Material fonts, zero purple/violet hues (`OKLCH 270-330 deg`), zero native `<select>` controls, and **`-2px` optical vertical button centering** (`padding-top > padding-bottom`, e.g. `5px 10px 1px 10px` on `.jig-word`, `2px 0 0 0` on icon buttons and `.jig-action-label`).

### Top, Left & Right Perimeter Controls
1. **Top Style Plate (`.floating-style-plate`, 9 Folder-Backed Slots)**:
   - Smooth sliding `.jig-active-pill` across `clone`, `clean`, `grid`, `editorial`, `cinematic`, `product`, `brutal`, `playful`, `retro` (plus horizontal auto-centering on narrow/mobile screens).
2. **Top UI Libraries + Theme Plate (`.floating-lib-plate`)**:
   - Smooth sliding `.jig-active-pill` across `shadcn`, `ease`, `fluid` + Moon/Sun (`☾` / `☀`) toggle switching `#000000` Dark ↔ `#FAF9F6` Light.
   - Supports **Immersive Dimming** (`data-imm-libs-disabled="true"`) on `3d`, `parallax`, `shader` stages and **Mobile App Lock** (`data-app-libs-disabled="true"`) on 9:16 mobile frames.
3. **Left Expandable / Collapsible Accordion TOC (`.toc`)**:
   - Lists lowercase domain headers (`.toc-group-btn`). Only the active domain expands its `.toc-sub-list`; tapping the active header again collapses all sub-items. Collapses into a scrollable horizontal bar below `768px`.
4. **Right-Edge `16×16` Donor Variant Notches (`.right-variant-notches`)**:
   - Renders `16×16` donor thumbnails (up to 5 per non-clone style = 40 skins + `clone`), drag-scrub selection, `176×124` hover preview card, and `Alt+1..5` shortcuts (`window.VariantNotches`).
5. **Right-Side Tactile Drag-Scrub Inspector (`.dk-panel`)**:
   - `256px` matte `--plate` drawer with `34px` pointer-capture horizontal scrubbers, word strips, segmented tab menus, color swatches, custom stylized **Jig Backplate Dropdowns**, `copy`, `reset`, and `hide`/`show` collapse pill across 6 built-in schemas (`3d`, `parallax`, `shader`, `menu`, `cards`, `bg`). See [Immersive & Auto-Travel Spec](references/immersive-and-auto-travel-spec.md).

### Bottom Centered Row: Playback, Record, Trace, Prompt & Open (`.jig-bottom-controls-row`)
1. **`motion-craft` + `▶` Playback Autopilot (`[data-jig-play-toggle="true"]`)**:
   - Activates `startStageAutopilot()` (`examples/jig-harness/src/utils/autopilot.ts`), spawning the animated emerald cursor (`.ap-cursor` with `apTapRing` pulse) that glides across `[data-ap]` waypoints or auto-discovered stage controls, scrolls full views smoothly, and sweeps pointer events into 3D/shader iframes.
   - Yields immediately on any genuine manual user input (`event.isTrusted`) or `Escape`.
2. **Strokeless Red Record Button (`●`, `[data-jig-record-toggle="true"]`)**:
   - Pure `13.5×13.5` `#EF4444` pulsing circle with zero stroke. Runs a 12-second choreographed multi-view/multi-style/multi-theme showcase, measures live safe-zone overlaps, and surfaces `.jig-record-output-plate` (`replay`, `export json`, `close`).
   - Pairs with `scripts/record_and_eval_jig.py` to record a `1440×900` H.264 `yuv420p` `.mp4`, 6 PNG keyframes, and `telemetry-audit.json`.
3. **`trace` Action Plate (`[data-jig-action="trace"]`)**:
   - Opens unified section trace Markdown (`.md`) covering full view + all component views, active style/notch/library/theme tokens, and standalone URL in a new tab — automatically falling back to an in-app Trace Modal (`Copy .md`, `Download .md`, `Close`) inside embedded/sandboxed frames.
4. **`prompt` Action Plate (`.jig-prompt-anchor` + `[data-jig-action="prompt"]`)**:
   - Captures the **exact live rendered DOM + matched CSS rules** of the active stage via `captureRenderedStage.ts` (stripping Jig chrome selectors, mirroring live `<input>`/`<textarea>`/`<select>` states, snapshotting `<canvas>` elements to inline PNG, preserving `@layer`/`@property`/`@media`/`@keyframes`).
   - Copies clean `text/plain` + rich `text/html` (embedding the active donor thumbnail) to the clipboard, populates `window.__LAST_COPIED_JIG_PROMPT__` and `window.__LAST_COPIED_JIG_PROMPT_BUNDLE__`, and flips to `copied to clipboard` for `1.8s` with **0px horizontal shift** via `.jig-prompt-sizer`.
5. **`open` Action Plate (`a[data-jig-action="open"]`)**:
   - Opens a **100% × 100% chromeless standalone window** (`target="_blank"`) for the active domain, slide, style, donor variant notch, library, and theme using `?app=<domain>&slide=<slideId>&style=<style>&variant=<1..5>&theme=<dark|light>&lib=<lib>` (also supports `?nojig=1` for clean captures).

Full behavioral contract and DOM selectors: [Playback, Prompt, Trace & Open Spec](references/playback-prompt-open-spec.md).

---

## 3. Recording MP4 Walkthroughs & Telemetry Audits

Run `scripts/record_and_eval_jig.py` against any compiled single-file Jig bundle or local URL:

```bash
python3 scripts/record_and_eval_jig.py \
  --html ./my-project/dist/index.html \
  --mp4-out ./walkthrough.mp4 \
  --keyframes-dir ./keyframes \
  --duration 12
```

Verify `0` safe-zone overlaps, `0` console/page errors, `>= 12px` minimum font size, and `-2px` optical button centering across all extracted keyframes.

---

## 4. Mandatory Bidirectional Jig Write-Back

Whenever any Jig shell improvement (TOC accordion, variant notches, bottom `playback`/`record`/`trace`/`prompt`/`open` row, or `.dk-panel` controls) is refined inside a downstream project, sync those shell improvements back into `examples/jig-harness/src/components/` via `scripts/init_style_jig.py --save-back-from <project-dir>` without copying domain-specific app code so every brand-new project inherits the latest Jig automatically.

---

## 5. Package Map & References

- [Designer's Guide & Reusable Jetski Prompts](README.md)
- [Complete Architecture Master Spec](DESIGN-KIT-JIG.md)
- [Playback, Prompt, Trace & Open Contract](references/playback-prompt-open-spec.md)
- [Layering & Stage Isolation Spec](references/layering-and-stage-isolation.md)
- [Immersive Inspector & Auto-Travel Spec](references/immersive-and-auto-travel-spec.md)
- [Stage & Centering Master Prompt](references/stage-and-centering-prompt.md)
- [3D Formations + Jig Master Prompt](references/3d-formations-and-jig-prompt.md)
- [Kinetic Scroll Parallax + Jig Master Prompt](references/parallax-and-jig-prompt.md)
- [CLI Scripts Reference](scripts/README.md)
- [Working Harness Example Guide](examples/README.md)
- [Templates & Style Defaults Guide](templates/README.md)

--------------------------------------------------------------------------------

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
