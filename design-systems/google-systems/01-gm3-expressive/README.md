# 01. Google Material 3 Expressive (`gm3` v40.2.1 · `@material/web`)

- **Carbon Design System ID**: `designSystems/20543ce18892f7d9` (`Version 40.2.1` — `audience: 1p.baseline`, `motion.scheme: expressive`, `platform: web`)
- **Google3 Depot Provenance**:
  - `//depot/google3/javascript/material/gm3/tokens/v40_2/` (`_md-ref-palette.scss`, `_md-sys-color.scss`, `_md-sys-typescale-emphasized.scss`, `_md-comp-ai-prompt-field.scss`, `_md-comp-button-group-connected-medium.scss`)
  - `//depot/google3/javascript/materialdesign/gm3/wiz/` (1P Wiz components)
  - `//depot/google3/third_party/javascript/material/web/gm3/` (`@material/web` Lit Web Components)
  - `//depot/google3/ux/tokens/design_systems/md/` (Cross-platform Web, Flutter, iOS UIKit, Android Compose)
- **Internal Documentation**: go/gm3 · go/gm3-web-docs · go/carbon-service-docs
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**Google Material 3 (`gm3` v40.2 Expressive)** is Google's flagship cross-product design system powering Workspace (Gmail, Docs, Drive, Meet, Chat), Google Admin, Android, Chrome, and consumer web surfaces. Crucially, **1P internal GM3 replaces open-source Material 3's `#6750A4` purple baseline with Google Blue `#0B57D0` (`Primary 40`), Cyan-Blue `#00639B` (`Secondary 40`), and Google Green `#146C2E` (`Tertiary 40`)**, natively satisfying WDA's `<9.5% purple` constraint (`0% purple`).

1. **Tonal Surface Containment Over Drop Shadows**: Instead of heavy borders or drop shadows, GM3 separates chrome from content using its 5-step tonal surface hierarchy (`surface-container` `#F0F4F9` outer shell framing `24px`-rounded `#FFFFFF` `surface` panes; Dark `#1E1F20` shell framing `#131314` / `#282A2C` panes).
2. **Adaptive Navigation Continuum**: Uses an `80px` vertical **Navigation Rail** with `#C2E7FF` (`secondary-container`) pill active indicators and a prominent Tonal/Primary Extended FAB on Desktop (`>= 960px`), automatically reflowing into a bottom `NavigationBar` + docked Floating Toolbar on Mobile (`390px`).
3. **GM3 Expressive v40.2 Additions**: Introduces **Connected Split Button Groups** (`_md-comp-button-group-connected-*`), **Emphasized Variable Typescales**, and native **AI Workspace Primitives** (`_md-comp-ai-prompt-field.scss`, `_md-comp-ai-chat-bubble.scss`, `_md-comp-ai-suggestions.scss`).

---

## 2. Verbatim Google3 Token Reference

| CSS Custom Property | Google3 Source Token | Light Hex | Dark Hex | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--gm3-sys-color-primary` | `md-ref-palette.primary40 / 80` | `#0B57D0` | `#A8C7FA` | Primary filled CTA, active tab indicator |
| `--gm3-sys-color-primary-container` | `md-ref-palette.primary90 / 30` | `#D3E3FD` | `#0842A0` | Prominent FAB & selected container fill |
| `--gm3-sys-color-secondary-container` | `md-ref-palette.secondary90 / 30` | `#C2E7FF` | `#004A77` | Navigation rail/bar active pill, tonal button |
| `--gm3-sys-color-tertiary` | `md-ref-palette.tertiary40 / 80` | `#146C2E` | `#6DD58C` | Verified/healthy status, positive KPI delta |
| `--gm3-sys-color-surface` | `md-ref-palette.neutral100 / 6` | `#FFFFFF` | `#131314` | Primary content sheet & card canvas |
| `--gm3-sys-color-surface-container-low` | `neutral98 / neutral10` | `#F8FAFD` | `#1B1B1C` | Subtle card fill & inspector well |
| `--gm3-sys-color-surface-container` | `cool-tinted neutral` | `#F0F4F9` | `#1E1F20` | Outer app shell & navigation rail backdrop |
| `--gm3-sys-color-surface-container-high` | `cool-tinted neutral high` | `#E9EEF6` | `#282A2C` | Search bar, prompt field & chip rest fill |
| `--gm3-sys-color-outline-variant` | `neutral-variant80 / 30` | `#C4C7C5` | `#444746` | Subtle `1px` card & divider hairlines |
| `--gm3-sys-color-error` | `md-ref-palette.error40 / 80` | `#B3261E` | `#F2B8B5` | Validation error & critical alert |

---

## 3. Typography, Shape & Density Rules

- **Brand / Headline Family**: `Google Sans` (`Display Large` `57px/64px`, `Headline Medium` `28px/36px`, `Title Large` `22px/28px`, weight `400–500`).
- **Plain / UI Family**: `Google Sans Text` (`Title Medium` `16px/24px` `500`, `Body Medium` `14px/20px` `400`, `Label Large` `14px/20px` `500`, `Label Medium` `12px/16px` `500`) + native `Google Sans Arabic` / `Noto` global script parity.
- **Shape Architecture**: Pill controls (`9999px` buttons, chips, search bar, nav indicators), `24px` (`xl`) primary workspace panes, `16px` (`lg`) cards, and `8px`/`12px` inner connected button group segments.

---

## 4. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **GM3 Expressive** whenever a prompt calls for approachable consumer/prosumer polish, multi-pane productivity, touch-ergonomic POS/field workflows, clinical clarity, or RTL/multi-language typography:
- **`#17` MARCONDES Multi-Channel Restaurant POS & Dispatch Hub**: Pill category chips, `44px+` touch cashier tiles, tonal order ticket drawer, and crisp `tabular-nums` BRL (`R$`) totals.
- **`#19` SolaXs Offline-First Solar Field Sales App (`390px` Mobile-First)**: Native GM3 mobile bottom `NavigationBar`, offline sync banner, step-card survey, and high-sunlight contrast.
- **`#22` Spanish Encrypted Clinical Study & CRF PWA**: Calm `#F0F4F9` / `#FFFFFF` clinical containers, E2EE status pills, and clear form validation (`--gm3-sys-color-error`).
- **`#28` Al-Hinnawi Arabic (`ar`/RTL) 2D/3D Kitchen Configurator**: Native RTL logical layout mirroring, pill dimension controls (`cm` / `JOD`), and sleek workshop-to-showroom polish.
- **`#32` Certivela State-Gated Telehealth Portal** & **`#36` SycaPost Multi-Language Social Feed**: Accessible consumer intake cards, inline AI translation chips, and mobile-first parity.
