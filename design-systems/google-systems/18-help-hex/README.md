# 18. Google Help Design System (hex — Help Center & Support)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/hex/versions/v0_626/mss_vars/_hex-sys-color-baseline.scss`
  - `//depot/google3/ux/tokens/design_systems/hex/versions/v0_626/mss_vars/_hex-comp-bubble.scss`
  - `//depot/google3/ux/tokens/design_systems/hex/versions/v0_626/mss_vars/`
  - `//depot/google3/ux/tokens/design_systems/hex/config.textproto`
- **Carbon Design System**: `designSystems/243a2341ef087f29` · version `0.626`
- **Internal Documentation**: go/carbon-service-docs · go/carbon-service-code-gen-mwtc
- **Frameworks**: Material Sass MSS vars (support.google.com), Product contexts: ads-guide, youtube
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!NOTE]
> Values in `tokens.css` are copied from the generated token files above. Any value not present in the google3 output (usually some dark-mode roles or shape tokens) is marked `/* inferred */`.

---

## 1. Visual & Structural DNA

**Help Design System (`hex` v0.626)** — Dual (Light #FAFAFA canvas + Dark #1A1A1A) with per-product context toggles; Reading & Troubleshooting (article column + support chat bubbles).

1. **Soft #FAFAFA Reading Canvas**: Unlike GM3's pure white, Help uses `surface` `#FAFAFA` with `surface-bright` `#FFFFFF` cards and `surface-container` `#F0F4F9` wells, giving long troubleshooting articles a softer page.
2. **Pale Tonal Containers**: Containers are lighter than GM3 baseline: `primary-container` `#ECF3FE`, `secondary-container` `#DFF3FF`, `tertiary-container` `#E7F8ED`, `error-container` `#FCEEEE` — used for tips, notes, success and warnings inside articles.
3. **Support Conversation Bubbles**: `hex-comp-bubble` defines inset `20/16/12/16px`, `8px` stack spacing and zero outlines for user, agent and AI bubbles — the support-chat surface across Google products (with `ads-guide` and `youtube` context toggles).

**Core palette**: `surface_light` `#FAFAFA` · `surface_bright` `#FFFFFF` · `surface_dark` `#1A1A1A` · `primary` `#0B57D0` · `primary_container` `#ECF3FE` · `secondary_container` `#DFF3FF` · `tertiary_container` `#E7F8ED` · `error` `#B3261E`

**Type**: `Google Sans`, `Google Sans Text`, `Roboto` · **Token prefix**: `--hex-sys-color-baseline--*`

---

## 2. Token Reference (`0.626`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--hex-sys-color-baseline--surface` | `hex.sys.color.baseline.surface` | `#FAFAFA` | `#1A1A1A` | Help Center canvas |
| `--hex-sys-color-baseline--surface-bright` | `hex.sys.color.baseline.surface-bright` | `#FFFFFF` | `#32373E` | Article & topic cards |
| `--hex-sys-color-baseline--surface-container` | `hex.sys.color.baseline.surface-container` | `#F0F4F9` | `#1F1F1F` | Search well / agent bubble |
| `--hex-sys-color-baseline--primary` | `hex.sys.color.baseline.primary` | `#0B57D0` | `#D3E3FD` | Links, CTAs |
| `--hex-sys-color-baseline--primary-container` | `hex.sys.color.baseline.primary-container` | `#ECF3FE` | `#0842A0 (inferred)` | Tip callouts / user bubble |
| `--hex-sys-color-baseline--secondary-container` | `hex.sys.color.baseline.secondary-container` | `#DFF3FF` | `#004A77 (inferred)` | Selected selector tab |
| `--hex-sys-color-baseline--tertiary-container` | `hex.sys.color.baseline.tertiary-container` | `#E7F8ED` | `#0F5223 (inferred)` | Resolved / success |
| `--hex-sys-color-baseline--error-container` | `hex.sys.color.baseline.error-container` | `#FCEEEE` | `#8C1D18` | Warning notes |

---

## 3. Signature Components

- Help Center Search Hero & Topic Cards (hex-comp-card)
- Step-by-Step Article with Selector Tabs (Android / iPhone / Computer — hex-comp-selector)
- Support Chat Bubbles: User / Agent / AI (hex-comp-bubble)
- Global Banner & 'Was this helpful?' Chips (hex-global-comp-banner, hex-comp-chip)

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#20` / `#21` / `#22` legal, GRC & clinical knowledge** and **`#30` education**: long-form step articles with platform selector tabs and tonal callouts.
- **`#25` support / RAG assistants**: user / agent / AI bubble trio with escalation to a human agent.
- Pick `08-search-sds` for result lists; Help is the article + support-chat destination.

Recommended archetypes: `#20`, `#21`, `#22`, `#25`, `#30`
