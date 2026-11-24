# Uber Base Web (`baseweb.design` · `baseui`)

- **Primary URLs**: [baseweb.design](https://baseweb.design) · [Theming](https://baseweb.design/guides/theming/) · [uber/baseweb](https://github.com/uber/baseweb)
- **Token Source**: `baseui@16.1.1`
- **License**: MIT (Uber Move fonts proprietary; Inter used as preview fallback)
- **Archetype**: Mobility & Marketplace Utility — monochrome black/white primaries, Uber blue #276EF1 accent, 48px controls, bold UberMove headings, sizing scale0–scale4800
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #01 (Water VVARD GIS & Ops Risk)** — map-first operational views with monochrome chrome and a single blue accent.
  - **Prompt #03 (Quartz VSM Studio)** — high-contrast utility controls and step-based flows.

---

## 1. Design Philosophy & Structural DNA

1. **Monochrome first**: primary actions are pure black (`buttonPrimaryFill` #000000) on white; color is reserved for meaning (accent blue, positive green, warning yellow, negative red).
2. **Primitives → semantic theme**: a primitive palette (`gray50..900`, `blue50..900`…) maps into semantic `background*`, `content*`, `border*` tokens, with a separate dark theme.
3. **Big, legible touch targets**: 48px default controls, `scale` spacing tokens (`scale600` = 16px), bold Uber Move display type (`HeadingXXLarge` 40/52).

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--bw-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--bw-canvas` | `--baseui-color-background-secondary` | Page canvas / app background | `#F3F3F3` | `oklch(0.964 0.000 0)` | `#292929` | `oklch(0.281 0.000 0)` |
| `--bw-surface` | `--baseui-color-background-primary` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#161616` | `oklch(0.200 0.000 0)` |
| `--bw-surface-2` | `--baseui-color-background-secondary` | Sunken well, table header, hover fill | `#F3F3F3` | `oklch(0.964 0.000 0)` | `#292929` | `oklch(0.281 0.000 0)` |
| `--bw-border` | `--baseui-color-border-opaque` | Default hairline border / divider | `#F3F3F3` | `oklch(0.964 0.000 0)` | `#292929` | `oklch(0.281 0.000 0)` |
| `--bw-border-strong` | `--baseui-color-background-tertiary` | Input & emphasis border | `#E8E8E8` | `oklch(0.931 0.000 0)` | `#383838` | `oklch(0.341 0.000 0)` |
| `--bw-ink` | `--baseui-color-content-primary` | Primary text & icon ink | `#000000` | `oklch(0.000 0.000 0)` | `#DEDEDE` | `oklch(0.901 0.000 0)` |
| `--bw-ink-2` | `--baseui-color-content-secondary` | Secondary text | `#4B4B4B` | `oklch(0.413 0.000 0)` | `#C4C4C4` | `oklch(0.820 0.000 0)` |
| `--bw-ink-3` | `--baseui-color-content-tertiary` | Tertiary / helper / placeholder text | `#5E5E5E` | `oklch(0.482 0.000 0)` | `#ABABAB` | `oklch(0.741 0.000 0)` |
| `--bw-accent` | `--baseui-color-button-primary-fill` | Primary action fill | `#000000` | `oklch(0.000 0.000 0)` | `#C4C4C4` | `oklch(0.820 0.000 0)` |
| `--bw-accent-hover` | `--baseui-color-button-primary-hover` | Primary action hover fill | `#282828` | `oklch(0.277 0.000 0)` | `#ABABAB` | `oklch(0.741 0.000 0)` |
| `--bw-on-accent` | `--baseui-color-content-inverse-primary` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#000000` | `oklch(0.000 0.000 0)` |
| `--bw-accent-subtle` | `--baseui-color-background-light-accent` | Selected row / subtle brand fill | `#EFF4FE` | `oklch(0.966 0.014 264.5)` | `#182946` | `oklch(0.282 0.058 260.5)` |
| `--bw-accent-ink` | `--baseui-color-content-accent` | Link & brand text | `#276EF1` | `oklch(0.573 0.210 261.4)` | `#5E8BDB` | `oklch(0.640 0.130 261.2)` |
| `--bw-success` | `--baseui-color-background-positive` | Success / positive | `#0E8345` | `oklch(0.536 0.135 152.7)` | `#306C44` | `oklch(0.480 0.090 152.4)` |
| `--bw-warning` | `--baseui-color-background-warning` | Warning / caution | `#F6BC2F` | `oklch(0.826 0.158 84.1)` | `#7A5616` | `oklch(0.480 0.090 77.0)` |
| `--bw-danger` | `--baseui-color-background-negative` | Critical / destructive | `#DE1135` | `oklch(0.573 0.225 22.0)` | `#A32C34` | `oklch(0.481 0.155 21.7)` |
| `--bw-info` | `--baseui-color-background-accent` | Informative | `#276EF1` | `oklch(0.573 0.210 261.4)` | `#335BA3` | `oklch(0.480 0.125 261.1)` |
| `--bw-focus` | `--baseui-color-border-accent` | Keyboard focus ring | `#276EF1` | `oklch(0.573 0.210 261.4)` | `#3F6EC5` | `oklch(0.550 0.145 261.5)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Gray** | `baseui-color-gray-50` #F3F3F3 · `baseui-color-gray-100` #E8E8E8 · `baseui-color-gray-200` #DDDDDD · `baseui-color-gray-300` #C6C6C6 · `baseui-color-gray-400` #A6A6A6 · `baseui-color-gray-500` #868686 · `baseui-color-gray-600` #727272 · `baseui-color-gray-700` #5E5E5E · `baseui-color-gray-800` #4B4B4B · `baseui-color-gray-900` #282828 |
| **Blue** | `baseui-color-blue-50` #EFF4FE · `baseui-color-blue-100` #DEE9FE · `baseui-color-blue-200` #CDDEFF · `baseui-color-blue-300` #A9C9FF · `baseui-color-blue-400` #6DAAFB · `baseui-color-blue-500` #068BEE · `baseui-color-blue-600` #276EF1 · `baseui-color-blue-700` #175BCC · `baseui-color-blue-800` #1948A3 · `baseui-color-blue-900` #002661 |
| **Green** | `baseui-color-green-50` #EAF6ED · `baseui-color-green-100` #D3EFDA · `baseui-color-green-200` #B1EAC2 · `baseui-color-green-300` #7FD99A · `baseui-color-green-400` #06C167 · `baseui-color-green-500` #009A51 · `baseui-color-green-600` #0E8345 · `baseui-color-green-700` #166C3B · `baseui-color-green-800` #0D572D · `baseui-color-green-900` #002F14 |
| **Red** | `baseui-color-red-50` #FFF0EE · `baseui-color-red-100` #FFE1DE · `baseui-color-red-200` #FFD2CD · `baseui-color-red-300` #FFB2AB · `baseui-color-red-400` #FC7F79 · `baseui-color-red-500` #F83446 · `baseui-color-red-600` #DE1135 · `baseui-color-red-700` #BB032A · `baseui-color-red-800` #950F22 · `baseui-color-red-900` #520810 |
| **Yellow** | `baseui-color-yellow-50` #FDF2DC · `baseui-color-yellow-100` #FBE5B6 · `baseui-color-yellow-200` #FFD688 · `baseui-color-yellow-300` #F6BC2F · `baseui-color-yellow-400` #D79900 · `baseui-color-yellow-500` #B97502 · `baseui-color-yellow-600` #9F6402 · `baseui-color-yellow-700` #845201 · `baseui-color-yellow-800` #6B4100 · `baseui-color-yellow-900` #392300 |

---

## 3. Typography

- **Sans**: `UberMoveText, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif`
- **Mono**: `UberMoveMono, "Lucida Console", Monaco, monospace`
- **Display**: `UberMove, UberMoveText, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif`
- **Specimen preview face**: Uber Move is proprietary; the specimen previews body text with Inter and display headings with Inter Tight ahead of the official stacks.

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Display small | `--baseui-typography-display-small-*` | 44px | 52px | 700 |
| Heading XXLarge | `--baseui-typography-heading-xxlarge-*` | 40px | 52px | 700 |
| Heading small | `--baseui-typography-heading-small-*` | 24px | 32px | 700 |
| Label large | `--baseui-typography-label-large-*` | 18px | 24px | 500 |
| Paragraph medium | `--baseui-typography-paragraph-medium-*` | 16px | 24px | 400 |
| Paragraph small | `--baseui-typography-paragraph-small-*` | 14px | 20px | 400 |
| Mono label medium | `--baseui-typography-mono-label-medium-*` | 16px | 20px | 500 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--baseui-radius-100` = 2px (100) · `--baseui-radius-200` = 4px (200) · `--baseui-radius-300` = 8px (300) · `--baseui-radius-400` = 12px (400) · `--baseui-radius-500` = 16px (500)
- **Spacing**: `--baseui-sizing-scale-100` = 4px · `--baseui-sizing-scale-300` = 8px · `--baseui-sizing-scale-500` = 12px · `--baseui-sizing-scale-600` = 16px · `--baseui-sizing-scale-800` = 24px · `--baseui-sizing-scale-1000` = 40px · `--baseui-sizing-scale-1200` = 48px
- **Control height**: Buttons/inputs: compact 36px · default 48px (`scale1200`) · large 56px.
- **Elevation**:
- `--baseui-lighting-shadow-400` (shadow400): `0 1px 4px hsla(0, 0%, 0%, 0.16)`
- `--baseui-lighting-shadow-600` (shadow600): `0 4px 16px hsla(0, 0%, 0%, 0.16)`
- `--baseui-lighting-shallow-below` (shallowBelow): `0px 4px 16px rgba(0, 0, 0, 0.12)`
- `--baseui-lighting-deep-below` (deepBelow): `0px 16px 48px rgba(0, 0, 0, 0.22)`
- **Motion**: `timing100`–`timing1000`; `easeOutCurve` cubic-bezier(.2, .8, .4, 1), `easeDecelerate` cubic-bezier(0.22, 1, 0.36, 1).

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: 48px default (36 compact, 56 large), 8px radius (`radius300`), primary black, secondary `#F3F3F3`, tertiary transparent; `shape` pill/round/circle options.
2. **Input**: 48px, filled `backgroundSecondary` with 2px transparent border → 2px black border on focus.
3. **Tag / Badge**: light & solid kinds per semantic color.
4. **Table (semantic)**: bold headers, 1px `borderOpaque` dividers.
5. **Map overlays & bottom sheets**: `shallowBelow` / `deepBelow` shadows from `theme.lighting`.

---

## 6. When to Use / When Not to Use

**Reach for Base Web when:**
- Marketplace, logistics, mobility and operations dashboards.
- High-contrast, utilitarian UIs that must work outdoors / on the go.

**Avoid when:**
- Colorful, playful consumer brands.
- Teams that need CSS-var-native theming out of the box (Base Web uses Styletron JS theming).

---

## 7. Provenance

- Serialized from `baseui@16` `LightTheme` and `DarkTheme` objects; names are the theme keys kebab-cased (e.g. `theme.colors.backgroundPrimary` → `--baseui-color-background-primary`).
- Docs: https://baseweb.design/guides/theming/ · https://base.uber.com/
- Extracted 2026-11-11 into `design-systems/external-systems/uber-base-web/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
