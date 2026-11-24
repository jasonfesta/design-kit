# Ant Design 6 (`ant.design` · `antd` · `@ant-design/colors`)

- **Primary URLs**: [ant.design](https://ant.design) · [Design tokens](https://ant.design/docs/react/customize-theme) · [ant-design/ant-design](https://github.com/ant-design/ant-design)
- **Token Source**: `antd@6.7.0` · `@ant-design/colors@8.0.1`
- **License**: MIT
- **Archetype**: Enterprise Admin & Back-Office — seed → map → alias token algorithm, #1677FF daybreak blue, 10-step generated palettes, 32px controls, 6px radius, high-density forms & tables
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #07 (Cross-Border E-Commerce AI Bookkeeping)** — Pro-style admin layouts, steps, descriptions and editable tables.
  - **Prompt #09 (FP&A Business Digital Twin)** — dense form + table back-office with statistic cards.

---

## 1. Design Philosophy & Structural DNA

1. **Seed → Map → Alias algorithm**: a handful of seed tokens (`colorPrimary`, `borderRadius`, `fontSize`, `sizeUnit`) are expanded by algorithms (default, dark, compact) into hundreds of map/alias tokens.
2. **Generated 10-step palettes**: `@ant-design/colors` derives `blue-1..10` (primary at step 6 `#1677FF`) from HSV rules; dark palettes are separately tuned blends.
3. **Certainty & efficiency**: 14px base, `lineHeight` 1.5714, 32px `controlHeight`, 6px `borderRadius`, text colors as alpha black (`rgba(0,0,0,0.88/0.65/0.45)`).

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--an-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--an-canvas` | `--ant-color-bg-layout` | Page canvas / app background | `#F5F5F5` | `oklch(0.970 0.000 0)` | `#000000` | `oklch(0.000 0.000 0)` |
| `--an-surface` | `--ant-color-bg-container` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#141414` | `oklch(0.191 0.000 0)` |
| `--an-surface-2` | `--ant-color-fill-alter` | Sunken well, table header, hover fill | `#00000005` | `oklch(0.000 0.000 0 / 0.02)` | `#FFFFFF0A` | `oklch(1.000 0.000 0 / 0.04)` |
| `--an-border` | `--ant-color-border-secondary` | Default hairline border / divider | `#F0F0F0` | `oklch(0.955 0.000 0)` | `#303030` | `oklch(0.309 0.000 0)` |
| `--an-border-strong` | `--ant-color-border` | Input & emphasis border | `#D9D9D9` | `oklch(0.885 0.000 0)` | `#424242` | `oklch(0.379 0.000 0)` |
| `--an-ink` | `--ant-color-text` | Primary text & icon ink | `#000000E0` | `oklch(0.000 0.000 0 / 0.88)` | `#FFFFFFD9` | `oklch(1.000 0.000 0 / 0.85)` |
| `--an-ink-2` | `--ant-color-text-secondary` | Secondary text | `#000000A6` | `oklch(0.000 0.000 0 / 0.65)` | `#FFFFFFA6` | `oklch(1.000 0.000 0 / 0.65)` |
| `--an-ink-3` | `--ant-color-text-tertiary` | Tertiary / helper / placeholder text | `#00000073` | `oklch(0.000 0.000 0 / 0.45)` | `#FFFFFF73` | `oklch(1.000 0.000 0 / 0.45)` |
| `--an-accent` | `--ant-color-primary` | Primary action fill | `#1677FF` | `oklch(0.599 0.219 259.0)` | `#1668DC` | `oklch(0.541 0.193 258.9)` |
| `--an-accent-hover` | `--ant-color-primary-hover` | Primary action hover fill | `#4096FF` | `oklch(0.673 0.176 255.3)` | `#3C89E8` | `oklch(0.629 0.162 255.4)` |
| `--an-on-accent` | `--ant-color-text-light-solid` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--an-accent-subtle` | `--ant-color-primary-bg` | Selected row / subtle brand fill | `#E6F4FF` | `oklch(0.960 0.021 241.3)` | `#15325B` | `oklch(0.319 0.081 257.5)` |
| `--an-accent-ink` | `--ant-color-link` | Link & brand text | `#1677FF` | `oklch(0.599 0.219 259.0)` | `#1668DC` | `oklch(0.541 0.193 258.9)` |
| `--an-success` | `--ant-color-success` | Success / positive | `#52C41A` | `oklch(0.726 0.218 138.5)` | `#49AA19` | `oklch(0.654 0.194 138.3)` |
| `--an-warning` | `--ant-color-warning` | Warning / caution | `#FAAD14` | `oklch(0.802 0.165 76.0)` | `#D89614` | `oklch(0.720 0.147 76.4)` |
| `--an-danger` | `--ant-color-error` | Critical / destructive | `#FF4D4F` | `oklch(0.673 0.214 24.5)` | `#DC4446` | `oklch(0.606 0.189 24.1)` |
| `--an-info` | `--ant-color-info` | Informative | `#1677FF` | `oklch(0.599 0.219 259.0)` | `#1668DC` | `oklch(0.541 0.193 258.9)` |
| `--an-focus` | `--ant-color-primary-border-hover` | Keyboard focus ring | `#69B1FF` | `oklch(0.746 0.135 251.8)` | `#15417E` | `oklch(0.382 0.114 257.7)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Daybreak blue** | `ant-blue-1` #E6F4FF · `ant-blue-2` #BAE0FF · `ant-blue-3` #91CAFF · `ant-blue-4` #69B1FF · `ant-blue-5` #4096FF · `ant-blue-6` #1677FF · `ant-blue-7` #0958D9 · `ant-blue-8` #003EB3 · `ant-blue-9` #002C8C · `ant-blue-10` #001D66 |
| **Polar green** | `ant-green-1` #F6FFED · `ant-green-2` #D9F7BE · `ant-green-3` #B7EB8F · `ant-green-4` #95DE64 · `ant-green-5` #73D13D · `ant-green-6` #52C41A · `ant-green-7` #389E0D · `ant-green-8` #237804 · `ant-green-9` #135200 · `ant-green-10` #092B00 |
| **Calendula gold** | `ant-gold-1` #FFFBE6 · `ant-gold-2` #FFF1B8 · `ant-gold-3` #FFE58F · `ant-gold-4` #FFD666 · `ant-gold-5` #FFC53D · `ant-gold-6` #FAAD14 · `ant-gold-7` #D48806 · `ant-gold-8` #AD6800 · `ant-gold-9` #874D00 · `ant-gold-10` #613400 |
| **Dust red** | `ant-red-1` #FFF1F0 · `ant-red-2` #FFCCC7 · `ant-red-3` #FFA39E · `ant-red-4` #FF7875 · `ant-red-5` #FF4D4F · `ant-red-6` #F5222D · `ant-red-7` #CF1322 · `ant-red-8` #A8071A · `ant-red-9` #820014 · `ant-red-10` #5C0011 |
| **Geek blue** | `ant-geekblue-1` #F0F5FF · `ant-geekblue-2` #D6E4FF · `ant-geekblue-3` #ADC6FF · `ant-geekblue-4` #85A5FF · `ant-geekblue-5` #597EF7 · `ant-geekblue-6` #2F54EB · `ant-geekblue-7` #1D39C4 · `ant-geekblue-8` #10239E · `ant-geekblue-9` #061178 · `ant-geekblue-10` #030852 |

---

## 3. Typography

- **Sans**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`
- **Mono**: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`
- **Specimen preview face**: antd uses the platform system stack; on Linux the specimen loads Roboto (fourth in the official stack).

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Heading 1 | `--ant-font-size-heading-1` | 38px | 1.2105 | 600 |
| Heading 2 | `--ant-font-size-heading-2` | 30px | 1.2667 | 600 |
| Heading 3 | `--ant-font-size-heading-3` | 24px | 1.3333 | 600 |
| Heading 5 | `--ant-font-size-heading-5` | 16px | 1.5 | 600 |
| Body LG | `--ant-font-size-lg` | 16px | 1.5 | 400 |
| Body (base) | `--ant-font-size` | 14px | 1.5714 | 400 |
| Body SM | `--ant-font-size-sm` | 12px | 1.6667 | 400 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--ant-border-radius-xs` = 2px (XS) · `--ant-border-radius-sm` = 4px (SM) · `--ant-border-radius` = 6px (base) · `--ant-border-radius-lg` = 8px (LG)
- **Spacing**: `--ant-padding-xxs` = 4px · `--ant-padding-xs` = 8px · `--ant-padding-sm` = 12px · `--ant-padding` = 16px · `--ant-padding-lg` = 24px · `--ant-padding-xl` = 32px · `--ant-margin-xxl` = 48px
- **Control height**: `controlHeightSM` 24px · `controlHeight` 32px · `controlHeightLG` 40px (compact algorithm shrinks to 24/28/32).
- **Elevation**:
- `--ant-box-shadow-tertiary` (boxShadowTertiary): `0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 6px -1px rgba(0,0,0,0.03), 0 2px 4px 0 rgba(0,0,0,0.03)`
- `--ant-box-shadow` (boxShadow): `0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)`
- `--ant-box-shadow-secondary` (boxShadowSecondary): `0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)`
- **Motion**: `motionDurationFast` 0.1s · `Mid` 0.2s · `Slow` 0.3s; `motionEaseInOut` cubic-bezier(0.645, 0.045, 0.355, 1), `motionEaseOutCirc` cubic-bezier(0.08, 0.82, 0.17, 1).

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: 32px, 6px radius; primary (filled), default (white + `colorBorder`), dashed, text, link; danger modifier.
2. **Table**: `colorFillAlter` header, 55px middle rows (47 small), sorter/filter icons, row selection with `colorPrimaryBg`.
3. **Form**: vertical/horizontal layouts, required asterisk, `colorError` validation help text.
4. **Tag**: 2px–4px radius tags with preset color variants (`colorSuccessBg` + `colorSuccessBorder`).
5. **Layout**: dark `#001529` sider (classic) or light sider, 64px header, breadcrumb + PageHeader.
6. **Statistic & Card**: 24px numerals, 8px `borderRadiusLG` cards with `boxShadowTertiary`.

---

## 6. When to Use / When Not to Use

**Reach for Ant Design when:**
- Admin dashboards, internal tools, B2B back-office and CRUD-heavy apps.
- Teams wanting algorithmic theming (dark, compact) from a few seeds.

**Avoid when:**
- Distinctive consumer brands — default antd is instantly recognizable.
- Minimal editorial layouts.

---

## 7. Provenance

- Serialized from `antd@6` `theme.getDesignToken()` and `theme.getDesignToken({ algorithm: theme.darkAlgorithm })`; numeric size tokens get `px` like antd cssVar mode.
- Docs: https://ant.design/docs/react/customize-theme · https://ant.design/docs/spec/colors
- Extracted 2026-11-11 into `design-systems/external-systems/ant-design/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
