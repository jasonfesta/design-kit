# 16. NotebookLM Design System (nlm)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/notebooklm/versions/v0_0_5/sass/`
  - `//depot/google3/ux/tokens/design_systems/notebooklm/versions/v0_0_5/flutter/`
  - `//depot/google3/ux/tokens/design_systems/notebooklm/sass_vars_config.textproto`
- **Carbon Design System**: `designSystems/227421e97a36bc18` · version `0.0.5`
- **Internal Documentation**: go/carbon-service-docs · go/carbon-service-code-gen-mwtc
- **Frameworks**: Angular web (notebooklm.google.com), Flutter mobile (static_light / static_dark)
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!NOTE]
> Values in `tokens.css` are copied from the generated token files above. Any value not present in the google3 output (usually some dark-mode roles or shape tokens) is marked `/* inferred */`.

---

## 1. Visual & Structural DNA

**NotebookLM (`nlm` v0.0.5)** — Dual (Light #EDEFFA page / #FFFFFF panels + Dark #1A1D22 / #22262B); Three-Panel Research Workspace (Sources | Chat | Studio, 16px corners).

1. **Lavender-Blue Page, White Panels**: The app canvas `surface-page` is `nlm-light-blue` `#EDEFFA`; the three working panels sit on `surface-panel` `#FFFFFF` with `default-stroke` `#DDE1EB` hairlines and a global `rounded-corners` value of `16`.
2. **Blue + Black Button Pair**: `primary-button-fill` is `nlm-primary-blue` `#4259FF` (hover `#3D52EB`, focus `#3B50E5`); `secondary-button-fill` is pure black `#000000` in light and white in dark — a distinctive editorial contrast.
3. **Colored Artifact Tiles**: Studio outputs are tinted tiles with matched glyph colors: `blue-tile` `#EDEFFA` / `#224484`, `green-tile` `#E1F1E5` / `#0F5223`, `cyan-tile` `#DEF1F7` / `#056A95`, `orange-tile` `#F7EDEB` / `#8C2E2A`, `yellow-tile` `#F2F2E8` / `#796731`.

**Core palette**: `surface_page` `#EDEFFA` · `surface_panel` `#FFFFFF` · `surface_page_dark` `#1A1D22` · `primary_button` `#4259FF` · `secondary_button` `#000000` · `blue_tile` `#EDEFFA` · `green_tile` `#E1F1E5` · `cyan_tile` `#DEF1F7` · `orange_tile` `#F7EDEB`

**Type**: `Google Sans`, `Google Sans Text`, `Google Sans Flex` · **Token prefix**: `--nlm-*`

---

## 2. Token Reference (`0.0.5`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--nlm-surface-page` | `nlm.color.static.surface-page` | `#EDEFFA` | `#1A1D22` | App background behind panels |
| `--nlm-surface-panel` | `nlm.color.static.surface-panel` | `#FFFFFF` | `#22262B` | Sources / Chat / Studio panels |
| `--nlm-titles-and-labels` | `nlm.color.static.titles-and-labels` | `#1B1B1C` | `#F2F2F2` | Headings & labels |
| `--nlm-body-text` | `nlm.color.static.body-text` | `#303030` | `#C6C6C6 (grey-80, inferred hex)` | Chat & note body |
| `--nlm-primary-button-fill` | `nlm.color.static.primary-button-fill` | `#4259FF` | `#4259FF` | Primary CTA |
| `--nlm-secondary-button-fill` | `nlm.color.static.secondary-button-fill` | `#000000` | `#FFFFFF` | Secondary CTA |
| `--nlm-default-stroke` | `nlm.color.static.default-stroke` | `#DDE1EB` | `#37383B` | Panel & row dividers |
| `--nlm-green-tile` | `nlm.color.static.green-tile` | `#E1F1E5` | `#303632` | Study-guide tile |

---

## 3. Signature Components

- Sources Panel with Checkable Source Rows & Add-Source Button
- Grounded Chat with Numbered Citation Chips & Suggested Questions
- Studio Panel: Audio Overview Player + Colored Note Tiles (blue/green/cyan/orange/yellow)
- Black Secondary / Blue Primary Pill Buttons (primary-button-fill / secondary-button-fill)

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#25` cited RAG / knowledge base** and **`#20` archival research**: sources-chat-studio tri-pane with citation chips.
- **`#30` education** and **`#31` media/podcast**: audio overview player, study guides, FAQ and briefing-doc tiles.
- `nlm-primary-blue` `#4259FF` sits at hue ≈232° (blue, not purple); keep the `pink-*` tile family secondary to respect the purple guardrail.

Recommended archetypes: `#20`, `#25`, `#30`, `#31`
