# 14. Google Merchant Center & Shopping Design System (merchant)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/merchant/versions/v2_0/sass/`
  - `//depot/google3/ux/tokens/design_systems/merchant/versions/v2_0/mss_vars/`
  - `//depot/google3/ux/tokens/design_systems/merchant/sass_vars_config.textproto`
- **Carbon Design System**: `designSystems/564a63edb68006ec` · version `2.0`
- **Internal Documentation**: go/carbon-service-docs · go/carbon-service-code-gen-mwtc
- **Frameworks**: Angular (Merchant Center Next), Material Sass (sass + MSS vars)
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!NOTE]
> Values in `tokens.css` are copied from the generated token files above. Any value not present in the google3 output (usually some dark-mode roles or shape tokens) is marked `/* inferred */`.

---

## 1. Visual & Structural DNA

**Merchant Center (`merchant` v2.0)** — Tri-Mode (Light #FFFFFF + Dark #202124 + High-Contrast variants); Commerce-Ops Dense (4px/8px shape, 48px product rows, filled text fields).

1. **GM2 Commerce Console**: A white `#FFFFFF` workspace with `primary` `#1A73E8`, `on-surface` `#3C4043`, `on-surface-variant` `#5F6368` and `secondary` `#E8F0FE` selected states — the shared Merchant Center / Shopping ads chrome.
2. **Filled Text Fields**: Search/filter inputs use the dedicated textfield token group: `textfield-surface` `#F1F3F4`, `textfield-hairline` `#80868B`, `textfield-primary` `#1967D2` focus and `textfield-error` `#C5221F`.
3. **Tight Shape Scale**: Only three radii — `small` `4px`, `medium` `8px`, `large` `8px` — keep product tables, status chips and cards crisp and data-forward.

**Core palette**: `surface_light` `#FFFFFF` · `textfield_surface` `#F1F3F4` · `surface_dark` `#202124` · `primary` `#1A73E8` · `secondary_container` `#E8F0FE` · `positive` `#188038 (green700)` · `error` `#D93025`

**Type**: `Google Sans`, `Google Sans Display`, `Roboto` · **Token prefix**: `--merchant-sys-color-*`

---

## 2. Token Reference (`2.0`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--merchant-sys-color-surface` | `merchant.sys.color.surface` | `#FFFFFF` | `#202124` | Console canvas & cards |
| `--merchant-sys-color-on-surface` | `merchant.sys.color.on-surface` | `#3C4043` | `#E8EAED` | Body text |
| `--merchant-sys-color-on-surface-variant` | `merchant.sys.color.on-surface-variant` | `#5F6368` | `#9AA0A6 (inferred)` | Secondary metadata |
| `--merchant-sys-color-primary` | `merchant.sys.color.primary` | `#1A73E8` | `#8AB4F8` | Primary buttons & links |
| `--merchant-sys-color-secondary` | `merchant.sys.color.secondary` | `#E8F0FE` | `#394457 (inferred)` | Selected nav / row |
| `--merchant-sys-color-textfield-surface` | `merchant.sys.color.textfield-surface` | `#F1F3F4` | `#303134 (inferred)` | Filled search field |
| `--merchant-sys-color-positive` | `merchant.sys.color.positive` | `green700 #188038` | `#81C995 (inferred)` | Approved products |
| `--merchant-sys-color-error` | `merchant.sys.color.error` | `#D93025` | `#F28B82 (inferred)` | Disapproved / issues |

---

## 3. Signature Components

- Products Overview KPI Cards (Approved / Limited / Not approved)
- Product Feed Table with Status Chips & Thumbnail Column
- Filled Text-Field Filter Bar (textfield-surface / textfield-hairline)
- Diagnostics Issue Panel with Fix CTA (error-state-content)

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#09` / `#12` finance & ops consoles** and **`#13` / `#16` ERP/inventory**: product feed tables, approval status chips, KPI tiles.
- **`#33` commerce admin**: storefront/product catalog management with diagnostics.
- Use `03-acx-ads` instead when the main object is spend/performance charts rather than catalog items.

Recommended archetypes: `#09`, `#12`, `#13`, `#16`, `#33`
