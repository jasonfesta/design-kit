# Mantine 9 (`mantine.dev` · `@mantine/core`)

- **Primary URLs**: [mantine.dev](https://mantine.dev) · [Theme object](https://mantine.dev/theming/theme-object/) · [mantinedev/mantine](https://github.com/mantinedev/mantine)
- **Token Source**: `@mantine/core@9.8.0`
- **License**: MIT
- **Archetype**: Full-Stack React App Kit — Open Color 10-shade palettes, blue-6 primary, xs–xl size scale shared by radius/spacing/font/shadow, filled/light/outline/subtle variants
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #05 (Horizon CEO Telemetry)** — dashboard grids with Mantine Charts-style stat cards and ring progress.
  - **Prompt #02 (Data Center GIS Site Screener)** — filter sidebars, range sliders, segmented controls.

---

## 1. Design Philosophy & Structural DNA

1. **One xs–xl scale everywhere**: `--mantine-spacing-{xs..xl}`, `--mantine-radius-{xs..xl}`, `--mantine-font-size-{xs..xl}` and `--mantine-shadow-{xs..xl}` share the same vocabulary so components take a single `size`/`radius` prop.
2. **Open Color palettes**: 14 hues × 10 shades (`--mantine-color-blue-0..9`); `primaryShade` 6 (light) / 8 (dark) drives `--mantine-primary-color-filled`.
3. **Variant generator**: every color auto-derives `-filled`, `-filled-hover`, `-light`, `-light-hover`, `-light-color`, `-outline`, `-text` tokens, so badges/buttons/alerts stay consistent across schemes.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--mt-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--mt-canvas` | `--mantine-color-default-hover` | Page canvas / app background | `#F8F9FA` | `oklch(0.982 0.002 247.8)` | `#3B3B3B` | `oklch(0.352 0.000 0)` |
| `--mt-surface` | `--mantine-color-body` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#242424` | `oklch(0.260 0.000 0)` |
| `--mt-surface-2` | `--mantine-color-default-hover` | Sunken well, table header, hover fill | `#F8F9FA` | `oklch(0.982 0.002 247.8)` | `#3B3B3B` | `oklch(0.352 0.000 0)` |
| `--mt-border` | `--mantine-color-default-border` | Default hairline border / divider | `#CED4DA` | `oklch(0.867 0.011 247.9)` | `#424242` | `oklch(0.379 0.000 0)` |
| `--mt-border-strong` | `--mantine-color-default-border` | Input & emphasis border | `#CED4DA` | `oklch(0.867 0.011 247.9)` | `#424242` | `oklch(0.379 0.000 0)` |
| `--mt-ink` | `--mantine-color-text` | Primary text & icon ink | `#000000` | `oklch(0.000 0.000 0)` | `#C9C9C9` | `oklch(0.836 0.000 0)` |
| `--mt-ink-2` | `--mantine-color-dimmed` | Secondary text | `#868E96` | `oklch(0.643 0.015 248.1)` | `#828282` | `oklch(0.607 0.000 0)` |
| `--mt-ink-3` | `--mantine-color-placeholder` | Tertiary / helper / placeholder text | `#ADB5BD` | `oklch(0.769 0.015 248.0)` | `#696969` | `oklch(0.521 0.000 0)` |
| `--mt-accent` | `--mantine-primary-color-filled` | Primary action fill | `#228BE6` | `oklch(0.626 0.164 250.3)` | `#1971C2` | `oklch(0.543 0.149 251.7)` |
| `--mt-accent-hover` | `--mantine-primary-color-filled-hover` | Primary action hover fill | `#1C7ED6` | `oklch(0.586 0.159 251.3)` | `#1864AB` | `oklch(0.497 0.133 251.6)` |
| `--mt-on-accent` | `--mantine-primary-color-contrast` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--mt-accent-subtle` | `--mantine-primary-color-light` | Selected row / subtle brand fill | `#D0EBFF` | `oklch(0.927 0.039 240.0)` | `#0C3256` | `oklch(0.312 0.077 250.9)` |
| `--mt-accent-ink` | `--mantine-primary-color-light-color` | Link & brand text | `#1864AB` | `oklch(0.497 0.133 251.6)` | `#E7F5FF` | `oklch(0.963 0.020 238.7)` |
| `--mt-success` | `--mantine-color-green-filled` | Success / positive | `#40C057` | `oklch(0.715 0.183 146.4)` | `#2F9E44` | `oklch(0.617 0.162 146.4)` |
| `--mt-warning` | `--mantine-color-yellow-filled` | Warning / caution | `#FAB005` | `oklch(0.807 0.167 78.1)` | `#F08C00` | `oklch(0.731 0.167 62.6)` |
| `--mt-danger` | `--mantine-color-red-filled` | Critical / destructive | `#FA5252` | `oklch(0.671 0.204 24.5)` | `#E03131` | `oklch(0.593 0.211 26.5)` |
| `--mt-info` | `--mantine-color-cyan-filled` | Informative | `#15AABF` | `oklch(0.678 0.114 210.6)` | `#0C8599` | `oklch(0.568 0.097 213.4)` |
| `--mt-focus` | `--mantine-primary-color-filled` | Keyboard focus ring | `#228BE6` | `oklch(0.626 0.164 250.3)` | `#1971C2` | `oklch(0.543 0.149 251.7)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Blue (primary)** | `mantine-color-blue-0` #E7F5FF · `mantine-color-blue-1` #D0EBFF · `mantine-color-blue-2` #A5D8FF · `mantine-color-blue-3` #74C0FC · `mantine-color-blue-4` #4DABF7 · `mantine-color-blue-5` #339AF0 · `mantine-color-blue-6` #228BE6 · `mantine-color-blue-7` #1C7ED6 · `mantine-color-blue-8` #1971C2 · `mantine-color-blue-9` #1864AB |
| **Gray** | `mantine-color-gray-0` #F8F9FA · `mantine-color-gray-1` #F1F3F5 · `mantine-color-gray-2` #E9ECEF · `mantine-color-gray-3` #DEE2E6 · `mantine-color-gray-4` #CED4DA · `mantine-color-gray-5` #ADB5BD · `mantine-color-gray-6` #868E96 · `mantine-color-gray-7` #495057 · `mantine-color-gray-8` #343A40 · `mantine-color-gray-9` #212529 |
| **Dark** | `mantine-color-dark-0` #C9C9C9 · `mantine-color-dark-1` #B8B8B8 · `mantine-color-dark-2` #828282 · `mantine-color-dark-3` #696969 · `mantine-color-dark-4` #424242 · `mantine-color-dark-5` #3B3B3B · `mantine-color-dark-6` #2E2E2E · `mantine-color-dark-7` #242424 · `mantine-color-dark-8` #1F1F1F · `mantine-color-dark-9` #141414 |
| **Teal** | `mantine-color-teal-0` #E6FCF5 · `mantine-color-teal-1` #C3FAE8 · `mantine-color-teal-2` #96F2D7 · `mantine-color-teal-3` #63E6BE · `mantine-color-teal-4` #38D9A9 · `mantine-color-teal-5` #20C997 · `mantine-color-teal-6` #12B886 · `mantine-color-teal-7` #0CA678 · `mantine-color-teal-8` #099268 · `mantine-color-teal-9` #087F5B |
| **Grape** | `mantine-color-grape-0` #F8F0FC · `mantine-color-grape-1` #F3D9FA · `mantine-color-grape-2` #EEBEFA · `mantine-color-grape-3` #E599F7 · `mantine-color-grape-4` #DA77F2 · `mantine-color-grape-5` #CC5DE8 · `mantine-color-grape-6` #BE4BDB · `mantine-color-grape-7` #AE3EC9 · `mantine-color-grape-8` #9C36B5 · `mantine-color-grape-9` #862E9C |

---

## 3. Typography

- **Sans**: `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji`
- **Mono**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace`
- **Specimen preview face**: Mantine’s default is the system stack; on Linux the specimen loads Roboto (fourth in the stack).

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| h1 | `--mantine-h1-font-size` | 2.125rem | 1.3 | 700 |
| h2 | `--mantine-h2-font-size` | 1.625rem | 1.35 | 700 |
| h3 | `--mantine-h3-font-size` | 1.375rem | 1.4 | 700 |
| Text lg | `--mantine-font-size-lg` | 1.125rem | 1.6 | 400 |
| Text md | `--mantine-font-size-md` | 1rem | 1.55 | 400 |
| Text sm | `--mantine-font-size-sm` | 0.875rem | 1.45 | 400 |
| Text xs | `--mantine-font-size-xs` | 0.75rem | 1.4 | 400 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--mantine-radius-xs` = calc(0.125rem * 1) (xs) · `--mantine-radius-sm` = calc(0.25rem * 1) (sm (default)) · `--mantine-radius-md` = calc(0.5rem * 1) (md) · `--mantine-radius-lg` = calc(1rem * 1) (lg) · `--mantine-radius-xl` = calc(2rem * 1) (xl)
- **Spacing**: `--mantine-spacing-xs` = calc(0.625rem * 1) · `--mantine-spacing-sm` = calc(0.75rem * 1) · `--mantine-spacing-md` = calc(1rem * 1) · `--mantine-spacing-lg` = calc(1.25rem * 1) · `--mantine-spacing-xl` = calc(2rem * 1)
- **Control height**: Input/button heights xs 30 · sm 36 · md 42 · lg 50 · xl 60px.
- **Elevation**:
- `--mantine-shadow-xs` (xs): `0 calc(0.0625rem * 1) calc(0.1875rem * 1) rgba(0, 0, 0, 0.05), 0 calc(0.0625rem * 1) calc(0.125rem * 1) rgba(0, 0, 0, 0.1)`
- `--mantine-shadow-sm` (sm): `0 calc(0.0625rem * 1) calc(0.1875rem * 1) rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 calc(0.625rem * 1) calc(0.9375rem * 1) calc(-0.3125rem * 1), rgba(0, 0, 0, 0.04) 0 calc(0.4375rem * 1) calc(0.4375rem * 1) calc(-0.3125rem * 1)`
- `--mantine-shadow-md` (md): `0 calc(0.0625rem * 1) calc(0.1875rem * 1) rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 calc(1.25rem * 1) calc(1.5625rem * 1) calc(-0.3125rem * 1), rgba(0, 0, 0, 0.04) 0 calc(0.625rem * 1) calc(0.625rem * 1) calc(-0.3125rem * 1)`
- `--mantine-shadow-xl` (xl): `0 calc(0.0625rem * 1) calc(0.1875rem * 1) rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 calc(2.25rem * 1) calc(1.75rem * 1) calc(-0.4375rem * 1), rgba(0, 0, 0, 0.04) 0 calc(1.0625rem * 1) calc(1.0625rem * 1) calc(-0.4375rem * 1)`
- **Motion**: Mantine transitions default to 150–200ms `ease`; `useReducedMotion` respected by Transition components.

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: 36px (sm), `--mantine-radius-default` (sm, 4px), variants filled / light / outline / subtle / default / gradient; 600 weight.
2. **Card & Paper**: `--mantine-color-body` with `withBorder` using `--mantine-color-default-border`, `--mantine-shadow-sm`.
3. **TextInput / Select**: 36px, 1px default border, focus border `--mantine-primary-color-filled`.
4. **Badge**: uppercase 11px pill, light variant `--mantine-color-{c}-light` + `-light-color`.
5. **AppShell**: header + navbar + aside layout primitives; NavLink with light-variant active state.

---

## 6. When to Use / When Not to Use

**Reach for Mantine when:**
- React dashboards and SaaS apps needing a big, consistent component + hooks library fast.
- Teams that like prop-driven size/radius/variant theming.

**Avoid when:**
- Non-React stacks.
- When you need a strongly opinionated brand voice out of the box.

---

## 7. Provenance

- Copied from `@mantine/core@9.8.0/styles.css` (`:root` and color-scheme blocks).
- Docs: https://mantine.dev/theming/colors/ · https://mantine.dev/styles/css-variables/
- Extracted 2026-11-11 into `design-systems/external-systems/mantine/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
