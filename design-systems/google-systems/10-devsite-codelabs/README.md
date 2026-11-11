# 10. Google DevSite & Codelabs Technical Workbench (`devsite` v0.0.63)

- **Carbon Design System ID**: `designSystems/3b5a4b48a2d95565` (`Version 0.0.63` — `DevSite Design System`)
- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/devsite/versions/v0_0/sass_css_vars/` (`_devsite-ref-palette.scss`, `_devsite-sys-color.scss`, `_devsite-sys-typescale.scss`, `_devsite-comp-search-summary.scss`)
  - `//depot/google3/devtools/codereview/webclient/` & `//depot/google3/devtools/cider/webclient/` (Code diff & multi-pane IDE workbench conventions)
- **Internal Documentation**: go/devsite · go/codelabs
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**Google DevSite & Codelabs (`ux/tokens/design_systems/devsite`)** powers `developers.google.com`, `cloud.google.com/docs`, `ai.google.dev`, and `codelabs.developers.google.com`. It is Google's canonical **split-screen technical documentation, step-by-step tutorial/simulation, API explorer, and live code-execution workbench**:

1. **Dual-Polarity Split Workbench (Light Spec + Dark `#263238` Code Sandbox)**: Combines a high-legibility `#FFFFFF` specification & step-progress pane on the left with a permanent dark Blue-Grey (`blue-grey900` `#263238`) multi-tab code editor, step debugger, and live execution console on the right (`0% purple`).
2. **Numbered Codelab Stepper Rail**: Left `220px` numbered curriculum/procedure rail (`1..6`) with completion badges and time-remaining pills, ideal for educational simulators, API onboarding, and reproducible benchmarks.
3. **Tenant-Aware Semantic Palette**: Ships core `#1A73E8` DevSite Blue alongside AI Blue (`#076EFF`), AI Cyan (`#24C1E0`), Teal (`#00897B`), and Android/Pass Green (`#1E8E3E`).

---

## 2. Verbatim Google3 Token Reference (`v0_0/sass_css_vars`)

| CSS Custom Property | DevSite Source Token | Light Hex | Dark Hex | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--devsite-sys-color--surface` | `devsite-ref-palette.white / dark-grey` | `#FFFFFF` | `#202124` | Primary spec, parameter table & tutorial sheet |
| `--devsite-sys-color--surface-rail` | `grey50 / dark-rail` | `#F8F9FA` | `#17181B` | Left numbered Codelab step rail |
| `--devsite-sys-color--code-terminal` | `blue-grey900` | `#263238` | `#12171C` | Multi-tab code editor & live execution sandbox |
| `--devsite-sys-color--primary` | `blue600 / blue300` | `#1A73E8` | `#8AB4F8` | Active step circle, tab indicator & API Try-It CTA |
| `--devsite-ref-palette--ai-blue` | `ai-blue` | `#076EFF` | `#4FABFF` | AI summary & interactive sandbox accent |
| `--devsite-ref-palette--teal600` | `teal600` | `#00897B` | `#4DB6AC` | Method badge (`GET`/`RUN`), schema type tag |
| `--devsite-ref-palette--green600` | `green600` | `#1E8E3E` | `#81C995` | Passing unit test / 3-star goal completion |

---

## 3. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **Google DevSite & Codelabs** whenever a prompt pairs instructional/specification prose with live code execution, step-by-step simulation, or container/IDE logs:
- **`#30` Kids Coding Platform with Step-by-Step Robot Simulator**: Exact dual-zone harmony (`#F8FAFC`/`#FFFFFF` playful step rail & 2D grid + `#263238` dark step-highlighted Python/block editor with `▶ Step` / `Run` controls).
- **`#27` PyHost Cloud Python IDE & Hosting Platform**: Multi-tab Python code editor, stdout/stderr container console, and zero-purple syntax highlighting (`#4FABFF` cyan-blue, `#81C995` emerald, `#FCAD70` amber).
- **`#25` Enterprise API / RAG Sandbox** & **`#06` Scientific Method / Calibration Benchmark**.
