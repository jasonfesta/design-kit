# Shopify Polaris (`polaris-react.shopify.com` · `@shopify/polaris-tokens`)

- **Primary URLs**: [polaris-react.shopify.com](https://polaris-react.shopify.com) · [Tokens](https://polaris-react.shopify.com/tokens/color) · [Shopify/polaris](https://github.com/Shopify/polaris)
- **Token Source**: `@shopify/polaris-tokens@9.4.2`
- **License**: MIT (tokens); Inter font: SIL OFL 1.1
- **Archetype**: Merchant Admin Commerce — charcoal-primary bevel buttons, Inter at 450/550/650 weights, 12px-radius cards on #F1F1F1, tactile inset/bevel shadows
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #07 (Cross-Border E-Commerce AI Bookkeeping)** — order/payout index tables, fulfillment badges, merchant-grade forms.
  - **Prompt #10 (Crystal Capital Deal OS)** — calm card-on-gray resource lists and inline index filters.

---

## 1. Design Philosophy & Structural DNA

1. **Charcoal brand, color only for meaning**: the primary action is `--p-color-bg-fill-brand` `#303030`, not a hue; blue (`#005BD3`) is reserved for links/emphasis, and success/critical/caution fills communicate state.
2. **Tactile skeuomorphic depth (Polaris 2023+)**: buttons and cards use multi-layer inset bevel shadows (`--p-shadow-button`, `--p-shadow-bevel-100`) that press in on `:active` (`--p-shadow-button-primary-inset`).
3. **Inter tuned to non-standard weights**: 450 regular / 550 medium / 650 semibold, 13px (`--p-font-size-325`) base body for dense admin screens.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--po-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--po-canvas` | `--p-color-bg` | Page canvas / app background | `#F1F1F1` | `oklch(0.958 0.000 0)` | `#1A1A1A` | `oklch(0.218 0.000 0)` |
| `--po-surface` | `--p-color-bg-surface` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#303030` | `oklch(0.309 0.000 0)` |
| `--po-surface-2` | `--p-color-bg-surface-secondary` | Sunken well, table header, hover fill | `#F7F7F7` | `oklch(0.976 0.000 0)` | `#F7F7F7` | `oklch(0.976 0.000 0)` |
| `--po-border` | `--p-color-border` | Default hairline border / divider | `#E3E3E3` | `oklch(0.916 0.000 0)` | `#E3E3E3` | `oklch(0.916 0.000 0)` |
| `--po-border-strong` | `--p-color-input-border` | Input & emphasis border | `#8A8A8A` | `oklch(0.633 0.000 0)` | `#8A8A8A` | `oklch(0.633 0.000 0)` |
| `--po-ink` | `--p-color-text` | Primary text & icon ink | `#303030` | `oklch(0.309 0.000 0)` | `#E3E3E3` | `oklch(0.916 0.000 0)` |
| `--po-ink-2` | `--p-color-text-secondary` | Secondary text | `#616161` | `oklch(0.493 0.000 0)` | `#B5B5B5` | `oklch(0.773 0.000 0)` |
| `--po-ink-3` | `--p-color-text-disabled` | Tertiary / helper / placeholder text | `#B5B5B5` | `oklch(0.773 0.000 0)` | `#4A4A4A` | `oklch(0.409 0.000 0)` |
| `--po-accent` | `--p-color-bg-fill-brand` | Primary action fill | `#303030` | `oklch(0.309 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--po-accent-hover` | `--p-color-bg-fill-brand-hover` | Primary action hover fill | `#1A1A1A` | `oklch(0.218 0.000 0)` | `#F3F3F3` | `oklch(0.964 0.000 0)` |
| `--po-on-accent` | `--p-color-text-brand-on-bg-fill` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#303030` | `oklch(0.309 0.000 0)` |
| `--po-accent-subtle` | `--p-color-bg-surface-selected` | Selected row / subtle brand fill | `#F1F1F1` | `oklch(0.958 0.000 0)` | `#616161` | `oklch(0.493 0.000 0)` |
| `--po-accent-ink` | `--p-color-text-link` | Link & brand text | `#005BD3` | `oklch(0.504 0.199 259.4)` | `#005BD3` | `oklch(0.504 0.199 259.4)` |
| `--po-success` | `--p-color-bg-fill-success` | Success / positive | `#047B5D` | `oklch(0.518 0.104 168.2)` | `#047B5D` | `oklch(0.518 0.104 168.2)` |
| `--po-warning` | `--p-color-bg-fill-warning` | Warning / caution | `#FFB800` | `oklch(0.827 0.171 80.5)` | `#FFB800` | `oklch(0.827 0.171 80.5)` |
| `--po-danger` | `--p-color-bg-fill-critical` | Critical / destructive | `#C70A24` | `oklch(0.526 0.209 24.5)` | `#C70A24` | `oklch(0.526 0.209 24.5)` |
| `--po-info` | `--p-color-bg-fill-info` | Informative | `#91D0FF` | `oklch(0.832 0.092 241.5)` | `#91D0FF` | `oklch(0.832 0.092 241.5)` |
| `--po-focus` | `--p-color-border-focus` | Keyboard focus ring | `#005BD3` | `oklch(0.504 0.199 259.4)` | `#005BD3` | `oklch(0.504 0.199 259.4)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Surfaces** | `p-color-bg` #F1F1F1 · `p-color-bg-surface` #FFFFFF · `p-color-bg-surface-secondary` #F7F7F7 · `p-color-bg-surface-hover` #F7F7F7 · `p-color-bg-surface-selected` #F1F1F1 · `p-color-border-secondary` #EBEBEB · `p-color-border` #E3E3E3 · `p-color-input-border` #8A8A8A · `p-color-text-secondary` #616161 · `p-color-text` #303030 |
| **Fills (tone)** | `p-color-bg-fill-brand` #303030 · `p-color-bg-fill-emphasis` #005BD3 · `p-color-bg-fill-success` #047B5D · `p-color-bg-fill-critical` #C70A24 · `p-color-bg-fill-warning` #FFB800 · `p-color-bg-fill-caution` #FFE600 · `p-color-bg-fill-info` #91D0FF · `p-color-bg-fill-magic` #8051FF · `p-color-text-link` #005BD3 · `p-color-bg-surface-inverse` #303030 |
| **Secondary fills** | `p-color-bg-fill-success-secondary` #AFFEBF · `p-color-bg-fill-critical-secondary` #FED1D7 · `p-color-bg-fill-warning-secondary` #FFD6A4 · `p-color-bg-fill-caution-secondary` #FFEB78 · `p-color-bg-fill-info-secondary` #D5EBFF · `p-color-bg-fill-magic-secondary` #E9E5FF · `p-color-text-success` #014B40 · `p-color-text-critical` #8E0B21 · `p-color-text-caution` #4F4700 · `p-color-text-magic` #5700D1 |

---

## 3. Typography

- **Sans**: `'Inter', -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif`
- **Mono**: `ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace`
- **Specimen preview face**: Inter (official Polaris face) loads from Google Fonts as a variable font so 450/550/650 weights render exactly.

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Heading 3xl | `--p-font-size-1000` | 40px | 48px | 700 |
| Heading xl | `--p-font-size-600` | 24px | 32px | 700 |
| Heading lg | `--p-font-size-450` | 18px | 24px | 650 |
| Heading md | `--p-font-size-350` | 14px | 20px | 650 |
| Body md | `--p-font-size-325` | 13px | 20px | 450 |
| Body sm | `--p-font-size-300` | 12px | 16px | 450 |
| Body xs | `--p-font-size-275` | 11px | 12px | 450 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--p-border-radius-100` = 0.25rem (100 · 4px) · `--p-border-radius-200` = 0.5rem (200 · 8px) · `--p-border-radius-300` = 0.75rem (300 · 12px) · `--p-border-radius-400` = 1rem (400 · 16px) · `--p-border-radius-full` = 624.9375rem (full)
- **Spacing**: `--p-space-100` = 0.25rem · `--p-space-200` = 0.5rem · `--p-space-300` = 0.75rem · `--p-space-400` = 1rem · `--p-space-600` = 1.5rem · `--p-space-800` = 2rem · `--p-space-1200` = 3rem
- **Control height**: Buttons 28px slim / 32px default / 36px large; text fields 32px; `--p-space-table-cell-padding` 6px.
- **Elevation**:
- `--p-shadow-100` (shadow-100): `0rem 0.0625rem 0rem 0rem rgba(26, 26, 26, 0.07)`
- `--p-shadow-300` (shadow-300): `0rem 0.25rem 0.375rem -0.125rem rgba(26, 26, 26, 0.20)`
- `--p-shadow-500` (shadow-500): `0rem 0.75rem 1.25rem -0.5rem rgba(26, 26, 26, 0.24)`
- `--p-shadow-button` (shadow-button (bevel)): `0rem -0.0625rem 0rem 0rem #b5b5b5 inset, 0rem 0rem 0rem 0.0625rem rgba(0, 0, 0, 0.1) inset, 0rem 0.03125rem 0rem 0.09375rem #FFF inset`
- **Motion**: `--p-motion-ease` cubic-bezier(0.25, 0.1, 0.25, 1), `--p-motion-ease-out` cubic-bezier(0.19, 0.91, 0.38, 1); durations 50–500ms in 50ms steps.

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: 28–32px tall, `--p-border-radius-200` (8px), primary charcoal with white text and `--p-shadow-button-primary` bevel; secondary white with `--p-shadow-button`.
2. **Card / LegacyCard**: white `--p-color-bg-surface`, `--p-border-radius-300` (12px), `--p-shadow-100`/bevel, `--p-space-400` padding on `--p-color-bg` #F1F1F1 canvas.
3. **IndexTable**: sticky header in `--p-color-bg-surface-secondary`, bulk-select checkbox column, tabs + filters + saved views bar.
4. **Badge**: pill with tone fills (`--p-color-bg-fill-success-secondary`, `-critical-secondary`, `-warning-secondary`) and progress dots (incomplete / partially / complete).
5. **Banner**: tone-filled header strip + body, used for page-level status.
6. **Navigation**: 240px left nav on `#EBEBEB`, active item white with bevel.

---

## 6. When to Use / When Not to Use

**Reach for Polaris when:**
- Commerce/admin tools, Shopify apps and anything that should feel native in Shopify Admin.
- Dense CRUD resource management: orders, products, customers, payouts.

**Avoid when:**
- Brand-forward marketing pages (Polaris is an admin system).
- Dark-first products — the dark theme is marked experimental.

---

## 7. Provenance

- All `--p-*` values copied verbatim from `@shopify/polaris-tokens@9.4.2/dist/css/styles.css` (light from `:root,.p-theme-light`, dark from `.p-theme-dark-experimental`).
- Docs: https://polaris-react.shopify.com/tokens/color · /tokens/font · /tokens/space · /tokens/shadow
- Extracted 2026-11-11 into `design-systems/external-systems/shopify-polaris/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
