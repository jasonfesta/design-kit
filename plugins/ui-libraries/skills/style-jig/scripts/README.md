# `scripts/` — Portable Design Kit Jig CLIs, Plugin Bundler & Installer

All utilities in this folder work both inside `~/design-kit` and when installed standalone from `style-jig.skill`, `style-jig.zip`, or `design-kit-jig-plugin.zip`.

---

## 1. `init_style_jig.py`

Config-driven initializer that writes `<project>/jig.config.json`, scaffolds a React 19 + Vite 7 + Tailwind v4 harness (or Vanilla HTML/CSS/JS runtime with `--vanilla`), creates matching `styles/<slot>/` donor folders (`default.md` + `styles-manifest.json`), or syncs Jig shell upgrades back upstream (`--save-back-from`).

```bash
# Custom self-setup (your own slide domains, style slots, libraries, and optional clone source):
python3 scripts/init_style_jig.py ./my-app \
  --domains=landing,checkout \
  --styles=warm-paper,swiss-grid,dark-studio \
  --no-clone \
  --libs=mui,gsap \
  --theme=light

# Default full scaffold (fullstack/immersive/app, clone..retro, shadcn/ease/fluid):
python3 scripts/init_style_jig.py ./my-new-project

# External clone service hook + declarative config file:
python3 scripts/init_style_jig.py ./my-new-project \
  --config=./jig.config.json \
  --clone-provider=external-service \
  --clone-service-name="clone-svc" \
  --clone-endpoint="https://..."

# Standalone HTML / Vanilla JS overlay:
python3 scripts/init_style_jig.py ./my-static-site --vanilla --overwrite

# Bidirectional write-back of Jig shell upgrades from a master project:
python3 scripts/init_style_jig.py --save-back-from ./my-master-project
```

---

## 2. `launch_jig_artifact.py`

Compiles `../examples/jig-harness/` (or any custom scaffolded project passed via `--project`) into a self-contained single-file HTML bundle (`vite-plugin-singlefile`) staged onto `--artifact` with `READY_FOR_SNAPSHOT` for Jetski's right-hand Artifact Pane.

```bash
python3 scripts/launch_jig_artifact.py \
  --project=./my-app \
  --artifact="/path/to/artifact_dir/design-kit-jig-harness.html"
```

---

## 3. `record_and_eval_jig.py`

Launches headless Chromium via Playwright, clicks the lower-plate strokeless Red Record button (`[data-jig-record-toggle="true"]`), lets the 12-second showcase and post-take output banner run organically, encodes a `1440×900` H.264 `yuv420p` `.mp4`, extracts 6 PNG keyframes, and writes `telemetry-audit.json`.

```bash
python3 scripts/record_and_eval_jig.py \
  --html ./my-app/dist/index.html \
  --mp4-out ./walkthrough.mp4 \
  --keyframes-dir ./keyframes \
  --duration 12
```

---

## 4. `match_and_map_styles.py`

Scans configured `styles/<slot>/` folders in a project, extracts palette and polarity tokens from dropped `.png`/`.jpg`/`.webp` donor images (or falls back to `styles/<slot>/default.md`), and writes `styles/styles-manifest.json`.

```bash
python3 scripts/match_and_map_styles.py ./my-app --prompt "Optional domain context"
```

---

## 5. `build_plugin_bundle.py` & `install.sh`

- **`build_plugin_bundle.py`**: Assembles a standalone, Jetski-compliant `design-kit-jig/` plugin folder (`plugin.json`, `README.md`, `INSTALL.md`, `skills/style-jig/`, `agents/jig-agent.md`, `agents/jig-recorder.md`) and packs `design-kit-jig-plugin.zip`.
- **`install.sh`**: One-command installer supporting `--skill` (`~/.gemini/config/skills/`), `--plugin` (`~/.gemini/config/plugins/`), and `--project <repo>` (`.agents/skills/` or `_agents/skills/`).

```bash
python3 scripts/build_plugin_bundle.py --out-dir=./dist
bash scripts/install.sh --plugin
```
