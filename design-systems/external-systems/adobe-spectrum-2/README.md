# Adobe Spectrum 2 (`s2.spectrum.adobe.com` · `@adobe/spectrum-tokens`)

- **Primary URLs**: [s2.spectrum.adobe.com](https://s2.spectrum.adobe.com) · [spectrum.adobe.com](https://spectrum.adobe.com) · [adobe/spectrum-tokens](https://github.com/adobe/spectrum-design-data)
- **Token Source**: `@adobe/spectrum-tokens@15.7.0`
- **License**: Apache-2.0 (Adobe Clean is proprietary; Source Sans 3 used as preview fallback)
- **Archetype**: Creative Pro Tools — Spectrum 2 bluer accent #3B63FB, pill-shaped controls, 8–16px rounded containers, desktop/mobile scale sets, extra-bold Adobe Clean headings
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #06 (Biometric Resemblance Inspector)** — canvas-centric pro tool with panels, sliders and calibrated color controls.
  - **Prompt #04 (Solarig PV Commissioning)** — calm data surfaces with informative/notice/negative semantic tones.

---

## 1. Design Philosophy & Structural DNA

1. **Rounder, friendlier S2 geometry**: buttons and fields are fully rounded (`corner-radius-full` = 0.5 × height), containers use `corner-radius-medium/large/extra-large-default` (8/10/16px).
2. **Two scale sets, one token**: every size token carries `desktop` and `mobile` values (e.g. `font-size-100` 14px desktop / 17px mobile) so touch density is a theme switch, not a fork.
3. **Layered neutral backgrounds + semantic tones**: `background-base` → `background-layer-1` → `background-layer-2`, with accent, informative, positive, notice and negative color families each offering background/content/visual roles.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--sp-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--sp-canvas` | `--spectrum-background-layer-1-color` | Page canvas / app background | `#F8F8F8` | `oklch(0.979 0.000 0)` | `#1B1B1B` | `oklch(0.222 0.000 0)` |
| `--sp-surface` | `--spectrum-background-layer-2-color` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#222222` | `oklch(0.252 0.000 0)` |
| `--sp-surface-2` | `--spectrum-gray-100` | Sunken well, table header, hover fill | `#E9E9E9` | `oklch(0.934 0.000 0)` | `#2C2C2C` | `oklch(0.293 0.000 0)` |
| `--sp-border` | `--spectrum-gray-200` | Default hairline border / divider | `#E1E1E1` | `oklch(0.910 0.000 0)` | `#323232` | `oklch(0.317 0.000 0)` |
| `--sp-border-strong` | `--spectrum-gray-400` | Input & emphasis border | `#C6C6C6` | `oklch(0.827 0.000 0)` | `#444444` | `oklch(0.387 0.000 0)` |
| `--sp-ink` | `--spectrum-neutral-content-color-default` | Primary text & icon ink | `#292929` | `oklch(0.281 0.000 0)` | `#DBDBDB` | `oklch(0.891 0.000 0)` |
| `--sp-ink-2` | `--spectrum-neutral-subdued-content-color-default` | Secondary text | `#505050` | `oklch(0.431 0.000 0)` | `#AFAFAF` | `oklch(0.754 0.000 0)` |
| `--sp-ink-3` | `--spectrum-gray-600` | Tertiary / helper / placeholder text | `#717171` | `oklch(0.549 0.000 0)` | `#8A8A8A` | `oklch(0.633 0.000 0)` |
| `--sp-accent` | `--spectrum-accent-background-color-default` | Primary action fill | `#3B63FB` | `oklch(0.567 0.230 267.1)` | `#4069FD` | `oklch(0.581 0.225 267.1)` |
| `--sp-accent-hover` | `--spectrum-accent-background-color-hover` | Primary action hover fill | `#274DEA` | `oklch(0.506 0.238 266.3)` | `#345BF8` | `oklch(0.547 0.237 266.9)` |
| `--sp-on-accent` | `--spectrum-white` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--sp-accent-subtle` | `--spectrum-accent-color-100` | Selected row / subtle brand fill | `#F5F9FF` | `oklch(0.981 0.009 258.3)` | `#0E173F` | `oklch(0.225 0.077 269.6)` |
| `--sp-accent-ink` | `--spectrum-accent-content-color-default` | Link & brand text | `#3B63FB` | `oklch(0.567 0.230 267.1)` | `#5681FF` | `oklch(0.638 0.193 266.7)` |
| `--sp-success` | `--spectrum-positive-background-color-default` | Success / positive | `#05834E` | `oklch(0.537 0.128 156.6)` | `#068850` | `oklch(0.552 0.132 156.1)` |
| `--sp-warning` | `--spectrum-notice-background-color-default` | Warning / caution | `#FC7D00` | `oklch(0.723 0.185 52.4)` | `#E06400` | `oklch(0.646 0.176 47.8)` |
| `--sp-danger` | `--spectrum-negative-background-color-default` | Critical / destructive | `#D73220` | `oklch(0.576 0.204 30.4)` | `#DF3422` | `oklch(0.592 0.209 30.3)` |
| `--sp-info` | `--spectrum-informative-background-color-default` | Informative | `#3B63FB` | `oklch(0.567 0.230 267.1)` | `#4069FD` | `oklch(0.581 0.225 267.1)` |
| `--sp-focus` | `--spectrum-focus-indicator-color` | Keyboard focus ring | `#4B75FF` | `oklch(0.610 0.210 267.1)` | `#4069FD` | `oklch(0.581 0.225 267.1)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Gray** | `spectrum-gray-25` #FFFFFF · `spectrum-gray-50` #F8F8F8 · `spectrum-gray-75` #F3F3F3 · `spectrum-gray-100` #E9E9E9 · `spectrum-gray-200` #E1E1E1 · `spectrum-gray-300` #DADADA · `spectrum-gray-400` #C6C6C6 · `spectrum-gray-600` #717171 · `spectrum-gray-800` #292929 · `spectrum-gray-900` #131313 |
| **Blue (accent)** | `spectrum-blue-100` #F5F9FF · `spectrum-blue-200` #E5F0FE · `spectrum-blue-300` #CBE2FE · `spectrum-blue-400` #ACCFFD · `spectrum-blue-500` #8EB9FC · `spectrum-blue-700` #5D89FF · `spectrum-blue-800` #4B75FF · `spectrum-blue-900` #3B63FB · `spectrum-blue-1100` #1D3ECF · `spectrum-blue-1300` #10288C |
| **Semantic fills** | `spectrum-accent-background-color-default` #3B63FB · `spectrum-informative-background-color-default` #3B63FB · `spectrum-positive-background-color-default` #05834E · `spectrum-notice-background-color-default` #FC7D00 · `spectrum-negative-background-color-default` #D73220 · `spectrum-seafoam-900` #07816D · `spectrum-indigo-900` #7155FA · `spectrum-purple-900` #9A47E2 · `spectrum-magenta-900` #D92361 · `spectrum-celery-900` #408111 |

---

## 3. Typography

- **Sans**: `'Adobe Clean Spectrum VF', 'Adobe Clean', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Mono**: `'Source Code Pro', Monaco, monospace`
- **Specimen preview face**: Adobe Clean Spectrum VF is proprietary; the specimen previews with Source Sans 3 (Adobe’s open-source sans) ahead of the official stack.

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Heading XXL | `--spectrum-font-size-900` | 36px | 1.3 | 800 |
| Heading L | `--spectrum-font-size-700` | 28px | 1.3 | 800 |
| Heading S | `--spectrum-font-size-300` | 18px | 1.3 | 800 |
| Body L | `--spectrum-font-size-200` | 16px | 1.5 | 400 |
| Body M | `--spectrum-font-size-100` | 14px | 1.5 | 400 |
| Detail S | `--spectrum-font-size-75` | 12px | 1.3 | 700 |
| Code M | `--spectrum-font-size-100` | 14px | 1.5 | 400 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--spectrum-corner-radius-small-default` = 4px (small 4) · `--spectrum-corner-radius-medium-default` = 8px (medium 8) · `--spectrum-corner-radius-large-default` = 10px (large 10) · `--spectrum-corner-radius-extra-large-default` = 16px (xl 16) · `--sp-btn-radius` = 9999px (full (pill))
- **Spacing**: `--spectrum-spacing-50` = 2px · `--spectrum-spacing-100` = 8px · `--spectrum-spacing-200` = 12px · `--spectrum-spacing-300` = 16px · `--spectrum-spacing-400` = 24px · `--spectrum-spacing-600` = 40px · `--spectrum-spacing-800` = 64px
- **Control height**: `component-height-75` 24px · `component-height-100` 32px · `component-height-200` 40px · `component-height-300` 48px (desktop scale; mobile scale is larger).
- **Elevation**:
- `--sp-shadow-sm` (ambient): `0 1px 4px rgba(0, 0, 0, 0.08)`
- `--sp-shadow-md` (drop-shadow-elevated (3 layers)): `0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.12)`
- **Motion**: Spectrum animation tokens: 130ms short, 160–250ms medium; `cubic-bezier(0.45, 0, 0.4, 1)` ease-in-out.

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: pill (`corner-radius-full`), 32px (`component-height-100`); accent fill, primary (neutral dark fill), secondary (gray-100 fill), outline styles; bold 14px labels.
2. **Text field / Picker**: 32px, 2px gray border, rounded 8px (S2 fields use medium radius), focus indicator 2px `focus-indicator-color` with 2px gap.
3. **Card / Panel**: `background-layer-2` on `background-layer-1`, 16px radius, `drop-shadow-elevated` on hover.
4. **Badge / Status light**: subtle & bold semantic badges in 30+ hues; status light dot + label.
5. **Action bar & tabs**: quiet tabs with 2px indicator, action buttons in gray-100 groups.

---

## 6. When to Use / When Not to Use

**Reach for Spectrum 2 when:**
- Creative or media tooling, editors, canvas apps and Adobe add-ons (UXP / Express).
- Products needing desktop and touch density from one token set.

**Avoid when:**
- Ultra-dense data grids where pill buttons waste space.
- Brands needing square or sharp-cornered personalities.

---

## 7. Provenance

- Every value resolved from `@adobe/spectrum-tokens@15.7.0/dist/json/variables.json` by following alias refs into the `light` / `dark` color sets and the `desktop` scale set.
- Docs: https://s2.spectrum.adobe.com/page/color-palette/ · https://spectrum.adobe.com/page/design-tokens/
- Extracted 2026-11-11 into `design-systems/external-systems/adobe-spectrum-2/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
