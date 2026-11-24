# Installing & Setting Up Design Kit Jig (`style-jig`)

Install **`style-jig`** once — either as a standalone **Jetski Skill** or as a full **Jetski Plugin** (`design-kit-jig`) — then let Jetski configure your own slide types, style slots, UI/motion libraries, and optional `clone` source automatically.

> **No rigid defaults required:** Out of the box the demo ships with `full stack / immersive / app`, `clone` through `retro`, and `shadcn / ease / fluid`, **but your project does not have to use any of those**. Everything is driven by one declarative `jig.config.json` file that `style-jig` generates for you on first setup.

---

## 1. Install Once (Pick One Method)

### Option A — Standalone Jetski Skill (Lightest)
Makes `style-jig` available across every Jetski conversation on your machine:

```bash
# On a Google workstation (direct x20 read mount):
mkdir -p ~/.gemini/config/skills
unzip -o /google/data/ro/users/jf/jfesta/www/style-jig/style-jig.zip -d ~/.gemini/config/skills/

# Or if you downloaded style-jig.zip / style-jig.skill from x20:
mkdir -p ~/.gemini/config/skills
unzip -o ~/Downloads/style-jig.zip -d ~/.gemini/config/skills/
```

Or run the bundled installer script:
```bash
bash /google/data/ro/users/jf/jfesta/www/style-jig/install.sh
```

### Option B — Full Jetski Plugin (`design-kit-jig`)
Installs the `style-jig` skill **plus** the `jig-agent` and `jig-recorder` subagents as a single Jetski plugin bundle (kept local in `~/.gemini/config/plugins/`):

```bash
# One-line plugin install via script:
bash /google/data/ro/users/jf/jfesta/www/style-jig/install.sh --plugin

# Or unzip manually:
mkdir -p ~/.gemini/config/plugins
unzip -o /google/data/ro/users/jf/jfesta/www/style-jig/design-kit-jig-plugin.zip -d ~/.gemini/config/plugins/
```

*(The `design-kit-jig/` directory also carries a valid `plugin.json` manifest if you ever want to place it inside a shared team repo or Piper plugin folder later.)*

### Option C — Single-Repository Install (Share With a Team)
Commit the unpacked skill into one repository so teammates get it automatically when they open that workspace:

```bash
# Git / Cog repo:
mkdir -p .agents/skills
unzip -o style-jig.zip -d .agents/skills/

# Piper / CitC workspace:
mkdir -p _agents/skills
unzip -o style-jig.zip -d _agents/skills/
```

---

## 2. How `style-jig` Sets Itself Up After Install

Open a new Jetski chat in any folder (brand-new or existing) and say:

> **"Set up `style-jig` for my project."**

Here is exactly what Jetski does automatically:

1. **Inspects your workspace** — Checks for `package.json`, installed UI/motion/3D packages, existing `src/` or static HTML files, and any screenshots already sitting in `styles/`.
2. **Walks you through 4 quick choices** (or you can answer them up front in one sentence):
   - **Your Slide Types & Domains** (Left TOC + Stage Mode + optional `.dk-panel` inspector)
   - **Your Libraries** (Top library plate buttons + React vs. Vanilla mode)
   - **Your Style Slots** (Top style taxonomy plate + `styles/<slot>/` donor folders)
   - **Your Optional `clone` Baseline Source** (Greenfield, manual screenshot/HTML, or an external clone service)
3. **Writes `jig.config.json`** at your project root and runs `scripts/init_style_jig.py` with your exact choices.
4. **Compiles and opens the live Jig** in Jetski's right-hand Artifact Pane so you can test styles, donor notches, Playback, Trace, Prompt, and Open immediately.

---

## 3. Setting Up Your Different Slide Types (`domains`)

You are **not** locked to `full stack / immersive / app`. Pick one preset, mix several, or invent your own section names:

| What you are designing | Pass to `--domains` (or tell Jetski) | Stage Mode & Chrome Behavior |
| :--- | :--- | :--- |
| **Isolated UI component / design system** | `component` | Centered stage (`stageMode: "component"`), pure `#000000` / `#FAF9F6` canvas |
| **Marketing / landing page** | `landing` | `hero` (`component`) + `full page` (`view` scrollable with auto-travel playback) |
| **SaaS app / analytics dashboard** | `dashboard` | `widget` (`component`) + `full view` (`view`) |
| **Full-stack default bundle** | `fullstack,immersive,app` | Full Stack + 3D/Parallax/Shader + Mobile 9:16 |
| **3D / WebGL / Parallax / Shader** | `immersive` or `3d` | Full-bleed stage + `.dk-panel` drag-scrub inspector; auto-dims UI library buttons while keeping Moon/Sun & Playback live (`chromeMode: "immersive"`) |
| **Mobile app (iOS / Android 9:16)** | `app` or `mobile` | Centered 9:16 frame + `.dk-panel` inspector (`menu`, `cards`, `bg`); locks desktop UI lib buttons (`chromeMode: "app"`) |
| **Custom product flows** | `onboarding,pricing,checkout` | Any custom names automatically create accordion groups in the Left TOC (`component` + `full view` per group, or edit `items` in `jig.config.json`) |
| **Static HTML page (no React)** | Add `--vanilla` | Copies `jig/style-jig.css`, `jig/style-jig-runtime.js`, and `jig/variant-notches.*` without touching React |

---

## 4. Setting Up Your Library Stack (`libraries`)

You are **not** locked to `shadcn / ease / fluid`. Set `--libs` (or `--ui` + `--motion`) to match the libraries your project actually uses:

| Your Stack | Example Setup Command / Prompt | What the Top Library Plate Renders |
| :--- | :--- | :--- |
| **React + Tailwind + shadcn/ui** | `--ui=shadcn --motion=motion` | `shadcn` \| `motion` \| `☾/☀` |
| **MUI + GSAP** | `--ui=mui --motion=gsap` | `mui` \| `gsap` \| `☾/☀` |
| **Radix UI + Tailwind** | `--ui=radix --motion=css` | `radix` \| `css` \| `☾/☀` |
| **Mobile (Konsta UI)** | `--domains=mobile --ui=konsta` | `konsta` \| `☾/☀` (dimmed on locked mobile frames) |
| **Three.js / R3F / Shaders** | `--domains=immersive --libs=three,r3f` | `three` \| `r3f` \| `☾/☀` (auto-dims on immersive slides) |
| **No JS library / CSS only** | `--libs=none` (or `--vanilla`) | Clean theme toggle (`☾/☀`) only — zero extra buttons |

Every library button updates `document.body.dataset.activeLib`, fires `jig:lib-change`, and exposes `window.JigAgent.onLibChange` so your components can swap variants, tokens, or motion curves live.

---

## 5. Setting Up Your Style Slots (`styles`) & Donor References

You are **not** locked to `clean` through `retro`:

- **Keep the 9 built-in styles** (`clone`, `clean`, `grid`, `editorial`, `cinematic`, `product`, `brutal`, `playful`, `retro`) — omit `--styles`.
- **Use a smaller subset** — e.g. `--styles=clone,clean,editorial,brutal`.
- **Define your own custom brand styles** — e.g. `--styles=warm-paper,swiss-grid,dark-studio` (automatically generates starter `styles/<slot>/default.md` files for each custom slot).
- **Greenfield project without a `clone` baseline** — pass `--no-clone` (removes `clone` from the top bar and sets `cloneSource.enabled: false`).
- **Populate right-edge `16×16` donor notches** — drop 1 to 5 reference screenshots (`.png`, `.jpg`, `.webp`) into any `styles/<slot>/` folder and ask Jetski to map them via `scripts/match_and_map_styles.py`.

---

## 6. Plugging In a `clone` Baseline Service (Optional)

The `clone` slot is cleanly decoupled via `cloneSource` inside `jig.config.json`:

```json
"cloneSource": {
  "enabled": true,
  "provider": "external-service",
  "serviceName": "your-clone-service",
  "endpoint": "https://your-service.example/clone",
  "command": "",
  "notes": "Populates the baseline clone view before applying style skins."
}
```

Supported `provider` values:
- `"none"` — Greenfield project (`--no-clone`); no `clone` slot rendered.
- `"manual"` — Default; you build or mount the baseline directly in React/HTML.
- `"screenshot"` — Baseline reconstructed from a reference image in `reference/desktop/` or `reference/mobile/`.
- `"html-file"` — Baseline imported from a captured static HTML file.
- `"external-service"` — Pluggable hook for an external clone generation or capture service (`--clone-provider=external-service --clone-service-name="..." --clone-endpoint="..."`).

Whenever you introduce a clone service, Jetski reads `jig.config.json` -> `cloneSource` (also surfaced in `window.JigAgent.config` and `Trace .md`) to fetch or mount the `clone` baseline cleanly without modifying the Jig shell.

---

## 7. Complete Custom `jig.config.json` Example

```json
{
  "projectName": "checkout-refresh",
  "defaultTheme": "light",
  "styles": ["warm-paper", "swiss-grid", "editorial", "dark-studio"],
  "libraries": [
    { "id": "mui", "label": "mui" },
    { "id": "gsap", "label": "gsap" }
  ],
  "cloneSource": {
    "enabled": false,
    "provider": "none",
    "serviceName": "",
    "endpoint": "",
    "command": "",
    "notes": "Greenfield build without a clone baseline."
  },
  "domains": [
    {
      "domain": "marketing",
      "label": "marketing",
      "defaultSlide": "hero",
      "chromeMode": "standard",
      "items": [
        { "id": "hero", "label": "hero", "stageMode": "component" },
        { "id": "landing-page", "label": "full page", "stageMode": "view" }
      ]
    },
    {
      "domain": "checkout",
      "label": "checkout",
      "defaultSlide": "cart-drawer",
      "chromeMode": "standard",
      "items": [
        { "id": "cart-drawer", "label": "cart drawer", "stageMode": "component" },
        { "id": "checkout-flow", "label": "full flow", "stageMode": "view" }
      ]
    }
  ]
}
```

Scaffold and compile that exact custom project in two commands (or just ask Jetski to do it for you):

```bash
python3 ~/.gemini/config/skills/style-jig/scripts/init_style_jig.py ./checkout-refresh \
  --domains=marketing,checkout \
  --styles=warm-paper,swiss-grid,editorial,dark-studio \
  --no-clone \
  --libs=mui,gsap \
  --theme=light

python3 ~/.gemini/config/skills/style-jig/scripts/launch_jig_artifact.py \
  --project=./checkout-refresh \
  --artifact=./checkout-refresh-jig.html
```

---

## 8. Use It Over and Over Again in Jetski

Once installed, you never need to re-install or memorize commands. Just ask Jetski:
- *"Set up `style-jig` for this project — I'm building a Landing Page and Pricing table with Tailwind + Motion, light mode default, and 3 custom styles: `warm-paper`, `swiss-grid`, `editorial`."*
- *"Add a `mobile` domain to `jig.config.json` with a 9:16 frame and attach the `.dk-panel` inspector."*
- *"Connect our clone service to `jig.config.json` (`cloneSource`) and mount its output in the `clone` slot."*
- *"Run Playback (`motion-craft ▶`), capture a 12-second MP4 walkthrough, and copy a live rendered Prompt snapshot."*
