# IBM Carbon Design System (`carbondesignsystem.com` · `@carbon/themes` · `@carbon/styles`)

- **Primary URLs**: [carbondesignsystem.com](https://carbondesignsystem.com) · [Color tokens](https://carbondesignsystem.com/elements/color/tokens/) · [carbon-design-system/carbon](https://github.com/carbon-design-system/carbon)
- **Token Source**: `@carbon/themes@11.85.0` · `@carbon/colors@11.62.0` · `@carbon/type@11.71.0` · `@carbon/layout@11.63.0`
- **License**: Apache-2.0 (IBM Plex fonts: SIL OFL 1.1)
- **Archetype**: Enterprise Productive Workbench — square-cornered 2x Grid, layered gray themes (White/G10/G90/G100), IBM Plex type, data-dense tables & bottom-border fields
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #01 (Water VVARD GIS & Ops Risk)** — G100 dark operations console, layered `--cds-layer-01..03` panels, support-error outage states.
  - **Prompt #02 (Data Center GIS Site Screener)** — high-density scoring tables, productive `body-compact-01` rows and IBM Plex Mono readouts.
  - **Prompt #05 (Horizon CEO Telemetry)** — enterprise telemetry with Carbon Charts-style 14-color data palette.

---

## 1. Design Philosophy & Structural DNA

1. **Layering model, not shadows**: depth comes from stepping through `--cds-background` → `--cds-layer-01` → `--cds-layer-02` → `--cds-layer-03`, alternating gray steps per theme (White, G10, G90, G100) instead of drop shadows.
2. **Square, grid-locked geometry**: 0px corners on buttons, fields, tiles and modals; everything snaps to the 2x Grid (8px mini-unit, 16-column `lg` breakpoint at 66rem).
3. **Productive vs. expressive type**: IBM Plex Sans with fixed productive sets (`body-compact-01` 14/18, `heading-03` 20/28) for apps and fluid expressive sets for marketing; IBM Plex Mono for code and tabular data.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--cb-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--cb-canvas` | `--cds-background` | Page canvas / app background | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#161616` | `oklch(0.200 0.000 0)` |
| `--cb-surface` | `--cds-layer-01` | Card, panel & table surface | `#F4F4F4` | `oklch(0.967 0.000 0)` | `#262626` | `oklch(0.269 0.000 0)` |
| `--cb-surface-2` | `--cds-layer-accent-01` | Sunken well, table header, hover fill | `#E0E0E0` | `oklch(0.907 0.000 0)` | `#393939` | `oklch(0.345 0.000 0)` |
| `--cb-border` | `--cds-border-subtle-01` | Default hairline border / divider | `#C6C6C6` | `oklch(0.827 0.000 0)` | `#525252` | `oklch(0.439 0.000 0)` |
| `--cb-border-strong` | `--cds-border-strong-01` | Input & emphasis border | `#8D8D8D` | `oklch(0.643 0.000 0)` | `#6F6F6F` | `oklch(0.542 0.000 0)` |
| `--cb-ink` | `--cds-text-primary` | Primary text & icon ink | `#161616` | `oklch(0.200 0.000 0)` | `#F4F4F4` | `oklch(0.967 0.000 0)` |
| `--cb-ink-2` | `--cds-text-secondary` | Secondary text | `#525252` | `oklch(0.439 0.000 0)` | `#C6C6C6` | `oklch(0.827 0.000 0)` |
| `--cb-ink-3` | `--cds-text-helper` | Tertiary / helper / placeholder text | `#6F6F6F` | `oklch(0.542 0.000 0)` | `#A8A8A8` | `oklch(0.732 0.000 0)` |
| `--cb-accent` | `--cds-button-primary` | Primary action fill | `#0F62FE` | `oklch(0.557 0.243 262.0)` | `#0F62FE` | `oklch(0.557 0.243 262.0)` |
| `--cb-accent-hover` | `--cds-button-primary-hover` | Primary action hover fill | `#0050E6` | `oklch(0.500 0.236 262.2)` | `#0050E6` | `oklch(0.500 0.236 262.2)` |
| `--cb-on-accent` | `--cds-text-on-color` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--cb-accent-subtle` | `--cds-highlight` | Selected row / subtle brand fill | `#D0E2FF` | `oklch(0.908 0.044 260.0)` | `#001D6C` | `oklch(0.280 0.140 263.0)` |
| `--cb-accent-ink` | `--cds-link-primary` | Link & brand text | `#0F62FE` | `oklch(0.557 0.243 262.0)` | `#78A9FF` | `oklch(0.736 0.136 261.1)` |
| `--cb-success` | `--cds-support-success` | Success / positive | `#24A148` | `oklch(0.623 0.166 148.1)` | `#42BE65` | `oklch(0.712 0.168 149.3)` |
| `--cb-warning` | `--cds-support-warning` | Warning / caution | `#F1C21B` | `oklch(0.832 0.166 90.4)` | `#F1C21B` | `oklch(0.832 0.166 90.4)` |
| `--cb-danger` | `--cds-support-error` | Critical / destructive | `#DA1E28` | `oklch(0.569 0.217 25.9)` | `#FA4D56` | `oklch(0.666 0.209 22.1)` |
| `--cb-info` | `--cds-support-info` | Informative | `#0043CE` | `oklch(0.454 0.221 262.6)` | `#4589FF` | `oklch(0.647 0.189 260.6)` |
| `--cb-focus` | `--cds-focus` | Keyboard focus ring | `#0F62FE` | `oklch(0.557 0.243 262.0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Blue (interactive)** | `cds-color-blue-10` #EDF5FF · `cds-color-blue-20` #D0E2FF · `cds-color-blue-30` #A6C8FF · `cds-color-blue-40` #78A9FF · `cds-color-blue-50` #4589FF · `cds-color-blue-60` #0F62FE · `cds-color-blue-70` #0043CE · `cds-color-blue-80` #002D9C · `cds-color-blue-90` #001D6C · `cds-color-blue-100` #001141 |
| **Gray (themes)** | `cds-color-gray-10` #F4F4F4 · `cds-color-gray-20` #E0E0E0 · `cds-color-gray-30` #C6C6C6 · `cds-color-gray-40` #A8A8A8 · `cds-color-gray-50` #8D8D8D · `cds-color-gray-60` #6F6F6F · `cds-color-gray-70` #525252 · `cds-color-gray-80` #393939 · `cds-color-gray-90` #262626 · `cds-color-gray-100` #161616 |
| **Support hues** | `cds-color-green-50` #24A148 · `cds-color-green-30` #6FDC8C · `cds-color-yellow-30` #F1C21B · `cds-color-red-60` #DA1E28 · `cds-color-red-40` #FF8389 · `cds-color-purple-60` #8A3FFC · `cds-color-teal-50` #009D9A · `cds-color-cyan-50` #1192E8 · `cds-color-magenta-50` #EE5396 · `cds-color-purple-30` #D4BBFF |
| **Layers (theme)** | `cds-background` #FFFFFF · `cds-layer-01` #F4F4F4 · `cds-layer-02` #FFFFFF · `cds-layer-accent-01` #E0E0E0 · `cds-border-subtle-01` #C6C6C6 · `cds-border-strong-01` #8D8D8D · `cds-text-secondary` #525252 · `cds-text-primary` #161616 · `cds-highlight` #D0E2FF · `cds-background-brand` #0F62FE |

---

## 3. Typography

- **Sans**: `'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, '.SFNSText-Regular', sans-serif`
- **Mono**: `'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace`
- **Specimen preview face**: IBM Plex Sans / IBM Plex Mono are the official open-source faces and load directly from Google Fonts.

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Heading 07 | `--cds-heading-07-*` | 54px | 1.199 | 300 |
| Heading 05 | `--cds-heading-05-*` | 32px | 1.25 | 400 |
| Heading 03 | `--cds-heading-03-*` | 20px | 1.4 | 400 |
| Heading compact 01 | `--cds-heading-compact-01-*` | 14px | 1.28572 | 600 |
| Body 02 | `--cds-body-02-*` | 16px | 1.5 | 400 |
| Body compact 01 | `--cds-body-compact-01-*` | 14px | 1.28572 | 400 |
| Label 01 | `--cds-label-01-*` | 12px | 1.33333 | 400 |
| Code 01 | `--cds-code-01-*` | 12px | 1.33333 | 400 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--cb-radius-md` = 0px (0 · all controls) · `--cb-radius-full` = 1rem (1rem · tag)
- **Spacing**: `--cds-spacing-01` = 0.125rem · `--cds-spacing-03` = 0.5rem · `--cds-spacing-05` = 1rem · `--cds-spacing-06` = 1.5rem · `--cds-spacing-07` = 2rem · `--cds-spacing-09` = 3rem · `--cds-spacing-10` = 4rem
- **Control height**: Fields 40px (md) / 48px (lg); buttons 48px default, 40px md, 32px sm; table rows 48px / 32px compact.
- **Elevation**:
- `--cb-shadow-md` (0 2px 6px var(--cds-shadow) · menus & overlays only): `0 2px 6px rgba(0, 0, 0, 0.3)`
- **Motion**: Productive standard easing `cubic-bezier(0.2, 0, 0.38, 0.9)`, fast-01 70ms / fast-02 110ms / moderate-01 150ms / moderate-02 240ms (@carbon/motion).

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: 48px (lg) / 40px (md) height, text left-aligned with 64px right padding reserved for a trailing 16px icon; primary `#0f62fe`, secondary `#393939`, tertiary outline, ghost, danger.
2. **Text input**: `--cds-field-01` fill, no box border, 1px `--cds-border-strong-01` bottom rule, 2px inset `--cds-focus` outline on focus; helper text in `label-01`.
3. **Data table**: `--cds-layer-accent-01` header, 48px default rows (32px compact), zebra optional, batch-action toolbar slides over header in `--cds-background-brand`.
4. **Tag**: 24px pill (`border-radius: 1rem`) using `--cds-tag-background-*` / `--cds-tag-color-*` pairs per hue.
5. **Tabs**: line tabs with 2px bottom indicator in `--cds-border-interactive`; contained tabs use `--cds-layer-accent` fills.
6. **UI Shell**: 48px G100 header, side-nav rail, switcher panel — the canonical IBM product chrome.

---

## 6. When to Use / When Not to Use

**Reach for Carbon when:**
- Enterprise B2B tools, admin consoles, cloud & infrastructure dashboards that must feel trustworthy and dense.
- Data-heavy tables, forms and multi-step configuration flows.
- Products needing four officially-tuned themes including true dark (G100).

**Avoid when:**
- Consumer, playful or brand-led marketing surfaces (Carbon reads unmistakably “IBM”).
- Designs that depend on soft rounded corners or elevation-heavy card stacks.

---

## 7. Provenance

- Colors resolved from `@carbon/themes` JS theme objects `white` and `g100` (plus `buttonTokens`, `tagTokens`) — the same source Carbon’s SCSS uses to emit `--cds-*` custom properties.
- Type sets from `@carbon/type` (`fontFamilies`, `bodyCompact01`, `heading03`…); spacing from `@carbon/layout` `spacing` scale.
- Docs: https://carbondesignsystem.com/elements/color/tokens/ · https://carbondesignsystem.com/elements/typography/type-sets/ · https://carbondesignsystem.com/elements/spacing/overview/
- Extracted 2026-11-11 into `design-systems/external-systems/ibm-carbon/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
