# 17. Google Earth Design System (earth Flutter tokens)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/earth/versions/v0_3_6/flutter/lib/src/sys_color_light_normal_contrast.dart`
  - `//depot/google3/ux/tokens/design_systems/earth/versions/v0_3_6/flutter/lib/src/sys_color_dark_normal_contrast.dart`
  - `//depot/google3/ux/tokens/design_systems/earth/versions/v0_3_6/flutter/lib/src/`
- **Carbon Design System**: `earth (Flutter token package)` · version `0.3.6`
- **Internal Documentation**: go/gmdc-flutter-tokens · go/carbon-service-docs
- **Frameworks**: Flutter (Earth web / mobile), Web: WebAssembly globe + Flutter chrome
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!NOTE]
> Values in `tokens.css` are copied from the generated token files above. Any value not present in the google3 output (usually some dark-mode roles or shape tokens) is marked `/* inferred */`.

---

## 1. Visual & Structural DNA

**Google Earth (`earth` v0.3.6)** — Immersive Constant-Dark Globe (#000000) + Light/Dark Panels (#FFFFFF / #131314), Normal + High Contrast; Spatial Immersive (floating panels, 100vw x 100vh 3D globe).

1. **Constant-Dark Overlay Roles**: Controls floating over imagery use mode-independent tokens: `constant-dark` `#000000`, `on-constant-dark` `#FFFFFF`, `constant-dark-primary` `#A8C7FA`, `constant-dark-selected-container` `#004A77` and `constant-dark-outline` `#5E5E5E` — legible over any terrain.
2. **GM3 Panels Around the Globe**: Side panels (Projects, Voyager stories, place cards) follow GM3 surfaces: `surface` `#FFFFFF` / `#131314`, `surface-container` `#F0F4F9` / `#1E1F20`, `selected-container` `#C2E7FF`.
3. **AI Gradient & Geo Semantics**: AI entry points use `ai-brand-gradient-primary-start` `#3186FF` → `-middle` `#346BF1` → `-end` `#4FA0FF`; data overlays use `positive` `#146C2E`, `caution` `#B16300` (`caution-container` `#FFE07C`) and `negative` `#B3261E`.

**Core palette**: `constant_dark` `#000000` · `constant_dark_primary` `#A8C7FA` · `constant_dark_selected` `#004A77` · `surface_light` `#FFFFFF` · `surface_dark` `#131314` · `primary` `#0B57D0` · `ai_main` `#217BFE` · `positive` `#146C2E` · `caution` `#B16300`

**Type**: `Google Sans (GoogleSans)`, `Google Sans Text (GoogleSansText)` · **Token prefix**: `--earth-sys-color-*`

---

## 2. Token Reference (`0.3.6`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--earth-sys-color-constant-dark` | `earth.sys.color.constant-dark` | `#000000` | `#000000` | Globe stage & toolbar chrome |
| `--earth-sys-color-constant-dark-primary` | `earth.sys.color.constant-dark-primary` | `#A8C7FA` | `#A8C7FA` | Active tool over imagery |
| `--earth-sys-color-constant-dark-selected-container` | `earth.sys.color.constant-dark-selected-container` | `#004A77` | `#004A77` | Selected layer pill |
| `--earth-sys-color-surface` | `earth.sys.color.surface` | `#FFFFFF` | `#131314` | Floating side panel |
| `--earth-sys-color-surface-container` | `earth.sys.color.surface-container` | `#F0F4F9` | `#1E1F20` | Panel sections |
| `--earth-sys-color-primary` | `earth.sys.color.primary` | `#0B57D0` | `#A8C7FA` | Links & primary CTA |
| `--earth-sys-color-ai-main` | `earth.sys.color.ai-main` | `#217BFE` | `#217BFE (inferred)` | AI chip accent |
| `--earth-sys-color-caution-container` | `earth.sys.color.caution-container` | `#FFE07C` | `#4D3808 (inferred)` | Data warnings |

---

## 3. Signature Components

- Full-Bleed 3D Globe Stage with constant-dark Chrome
- Floating Search + Layer/Map-Style Panel (selected-container)
- Voyager / Projects Story Card with Media & Step Pager
- AI Brand-Gradient Ask Earth Chip (ai-brand-gradient-primary-*)

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#01` / `#02` GIS & site screening** and **`#05` global telemetry**: immersive dark globe with floating constant-dark controls.
- **`#35` property discovery** and **`#37` live radar / tracking**: story cards and layer panels over 3D imagery.
- Use `09-geo-terra` for 2D navigation maps; Earth is the 3D storytelling/analysis surface.

Recommended archetypes: `#01`, `#02`, `#05`, `#35`, `#37`
