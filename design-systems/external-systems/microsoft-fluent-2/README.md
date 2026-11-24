# Microsoft Fluent 2 (`fluent2.microsoft.design` · `@fluentui/tokens`)

- **Primary URLs**: [fluent2.microsoft.design](https://fluent2.microsoft.design) · [Design tokens](https://fluent2.microsoft.design/design-tokens) · [microsoft/fluentui](https://github.com/microsoft/fluentui)
- **Token Source**: `@fluentui/tokens@1.0.0-alpha.24`
- **License**: MIT (Segoe UI proprietary; Open Sans used as preview fallback)
- **Archetype**: Productivity Suite & OS-Native Apps — brand-ramp blue #0F6CBD, layered neutral backgrounds 1–6, 4px radius, Segoe UI type ramp, soft shadow4–64 depth
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #09 (FP&A Business Digital Twin)** — Office-style grids, command bars and side panes.
  - **Prompt #05 (Horizon CEO Telemetry)** — Teams/Power BI-grade card dashboards with shadow8/16 depth.

---

## 1. Design Philosophy & Structural DNA

1. **Alias tokens over a 16-step brand ramp**: `colorBrandBackground`, `colorBrandForeground1`, `colorBrandStroke1` map into the generated brand ramp (10–160) so a single brand color re-themes everything.
2. **Neutral layering 1–6**: `colorNeutralBackground1..6` and `colorNeutralForeground1..4` create depth in light and dark; strokes `colorNeutralStroke1/2` stay hairline.
3. **Calm, native ergonomics**: 4px `borderRadiusMedium`, 32px controls, Segoe UI 14/20 body (`fontSizeBase300`/`lineHeightBase300`), shadow ramp `shadow2..64` with key + ambient layers.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--fl-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--fl-canvas` | `--colorNeutralBackground2` | Page canvas / app background | `#FAFAFA` | `oklch(0.985 0.000 0)` | `#1F1F1F` | `oklch(0.239 0.000 0)` |
| `--fl-surface` | `--colorNeutralBackground1` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#292929` | `oklch(0.281 0.000 0)` |
| `--fl-surface-2` | `--colorNeutralBackground3` | Sunken well, table header, hover fill | `#F5F5F5` | `oklch(0.970 0.000 0)` | `#141414` | `oklch(0.191 0.000 0)` |
| `--fl-border` | `--colorNeutralStroke2` | Default hairline border / divider | `#E0E0E0` | `oklch(0.907 0.000 0)` | `#525252` | `oklch(0.439 0.000 0)` |
| `--fl-border-strong` | `--colorNeutralStroke1` | Input & emphasis border | `#D1D1D1` | `oklch(0.861 0.000 0)` | `#666666` | `oklch(0.510 0.000 0)` |
| `--fl-ink` | `--colorNeutralForeground1` | Primary text & icon ink | `#242424` | `oklch(0.260 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--fl-ink-2` | `--colorNeutralForeground2` | Secondary text | `#424242` | `oklch(0.379 0.000 0)` | `#D6D6D6` | `oklch(0.876 0.000 0)` |
| `--fl-ink-3` | `--colorNeutralForeground3` | Tertiary / helper / placeholder text | `#616161` | `oklch(0.493 0.000 0)` | `#ADADAD` | `oklch(0.748 0.000 0)` |
| `--fl-accent` | `--colorBrandBackground` | Primary action fill | `#0F6CBD` | `oklch(0.526 0.149 251.6)` | `#115EA3` | `oklch(0.476 0.131 251.4)` |
| `--fl-accent-hover` | `--colorBrandBackgroundHover` | Primary action hover fill | `#115EA3` | `oklch(0.476 0.131 251.4)` | `#0F6CBD` | `oklch(0.526 0.149 251.6)` |
| `--fl-on-accent` | `--colorNeutralForegroundOnBrand` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--fl-accent-subtle` | `--colorBrandBackground2` | Selected row / subtle brand fill | `#EBF3FC` | `oklch(0.961 0.015 251.2)` | `#082338` | `oklch(0.248 0.051 245.6)` |
| `--fl-accent-ink` | `--colorBrandForeground1` | Link & brand text | `#0F6CBD` | `oklch(0.526 0.149 251.6)` | `#479EF5` | `oklch(0.686 0.153 251.1)` |
| `--fl-success` | `--colorStatusSuccessBackground3` | Success / positive | `#107C10` | `oklch(0.510 0.165 142.7)` | `#107C10` | `oklch(0.510 0.165 142.7)` |
| `--fl-warning` | `--colorStatusWarningBackground3` | Warning / caution | `#F7630C` | `oklch(0.680 0.198 43.0)` | `#F7630C` | `oklch(0.680 0.198 43.0)` |
| `--fl-danger` | `--colorStatusDangerBackground3` | Critical / destructive | `#C50F1F` | `oklch(0.523 0.206 25.8)` | `#C50F1F` | `oklch(0.523 0.206 25.8)` |
| `--fl-info` | `--colorBrandBackground` | Informative | `#0F6CBD` | `oklch(0.526 0.149 251.6)` | `#115EA3` | `oklch(0.476 0.131 251.4)` |
| `--fl-focus` | `--colorStrokeFocus2` | Keyboard focus ring | `#000000` | `oklch(0.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Neutral backgrounds** | `colorNeutralBackground1` #FFFFFF · `colorNeutralBackground2` #FAFAFA · `colorNeutralBackground3` #F5F5F5 · `colorNeutralBackground4` #F0F0F0 · `colorNeutralBackground5` #EBEBEB · `colorNeutralBackground6` #E6E6E6 · `colorNeutralStroke2` #E0E0E0 · `colorNeutralStroke1` #D1D1D1 · `colorNeutralForeground3` #616161 · `colorNeutralForeground1` #242424 |
| **Brand (web)** | `colorBrandBackground2` #EBF3FC · `colorBrandStroke2` #B4D6FA · `colorBrandForeground2` #115EA3 · `colorBrandBackground` #0F6CBD · `colorBrandBackgroundHover` #115EA3 · `colorBrandBackgroundPressed` #0C3B5E · `colorBrandForeground1` #0F6CBD · `colorBrandStroke1` #0F6CBD · `colorBrandBackgroundSelected` #0F548C · `colorBrandForegroundLink` #115EA3 |
| **Status** | `colorStatusSuccessBackground1` #F1FAF1 · `colorStatusSuccessBackground3` #107C10 · `colorStatusWarningBackground1` #FFF9F5 · `colorStatusWarningBackground3` #F7630C · `colorStatusDangerBackground1` #FDF3F4 · `colorStatusDangerBackground3` #C50F1F · `colorPaletteBerryBackground3` #C239B3 · `colorPaletteTealBackground2` #9BD9DB · `colorPaletteYellowBackground3` #FDE300 · `colorPaletteDarkOrangeBackground3` #DA3B01 |

---

## 3. Typography

- **Sans**: `'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif`
- **Mono**: `Consolas, 'Courier New', Courier, monospace`
- **Specimen preview face**: Segoe UI is proprietary; where it is not installed the specimen previews with Open Sans (similar humanist proportions) before the official stack.

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Display | `--fontSizeHero1000` | 68px | 92px | 600 |
| Large title | `--fontSizeHero900` | 40px | 52px | 600 |
| Title 2 | `--fontSizeHero700` | 28px | 36px | 600 |
| Subtitle 1 | `--fontSizeBase500` | 20px | 28px | 600 |
| Body 2 | `--fontSizeBase400` | 16px | 22px | 400 |
| Body 1 | `--fontSizeBase300` | 14px | 20px | 400 |
| Caption 1 | `--fontSizeBase200` | 12px | 16px | 400 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--borderRadiusSmall` = 2px (Small) · `--borderRadiusMedium` = 4px (Medium) · `--borderRadiusLarge` = 6px (Large) · `--borderRadiusXLarge` = 8px (XLarge) · `--borderRadius2XLarge` = 12px (2XLarge) · `--borderRadiusCircular` = 10000px (Circular)
- **Spacing**: `--spacingHorizontalXS` = 4px · `--spacingHorizontalS` = 8px · `--spacingHorizontalM` = 12px · `--spacingHorizontalL` = 16px · `--spacingHorizontalXL` = 20px · `--spacingHorizontalXXL` = 24px · `--spacingHorizontalXXXL` = 32px
- **Control height**: Buttons/inputs 24px small · 32px medium · 40px large; `strokeWidthThin` 1px, `strokeWidthThick` 2px.
- **Elevation**:
- `--shadow4` (shadow4): `0 0 2px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.14)`
- `--shadow8` (shadow8): `0 0 2px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.14)`
- `--shadow16` (shadow16): `0 0 2px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.14)`
- `--shadow28` (shadow28): `0 0 8px rgba(0,0,0,0.12), 0 14px 28px rgba(0,0,0,0.14)`
- **Motion**: `durationFaster` 100ms … `durationUltraSlow` 500ms; curves `curveEasyEase` cubic-bezier(0.33,0,0.67,1), `curveDecelerateMid` cubic-bezier(0,0,0,1).

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: 32px medium, 4px radius, appearances primary / secondary (outline neutral) / outline / subtle / transparent; 600 semibold labels.
2. **Input**: 32px, 1px `colorNeutralStroke1` with a 1px `colorNeutralStrokeAccessible` bottom edge that animates to a 2px brand underline on focus.
3. **Card**: `colorNeutralBackground1`, `borderRadiusMedium`–`Large`, `shadow4` resting → `shadow8` hover.
4. **DataGrid / Table**: 44px rows, header in `colorNeutralForeground2` semibold, selection via `colorSubtleBackgroundSelected`.
5. **TabList & Badge**: underline tabs with 3px brand indicator; filled/tint/outline badges.

---

## 6. When to Use / When Not to Use

**Reach for Fluent 2 when:**
- Productivity, enterprise and Microsoft-ecosystem apps (Teams, Office add-ins, Windows).
- Apps needing generated brand ramps and paired light/dark/high-contrast themes.

**Avoid when:**
- Expressive brand marketing sites.
- Products that must look platform-neutral on Apple devices.

---

## 7. Provenance

- Values serialized from `@fluentui/tokens` `webLightTheme` and `webDarkTheme` (colorNeutral*, colorBrand*, colorStatus*, colorPalette{Red,Green,Yellow,DarkOrange,Berry,Teal}*, colorSubtle*, colorCompound*, borderRadius*, fontSize*, lineHeight*, fontFamily*, fontWeight*, spacing*, stroke*, shadow*, duration*, curve*).
- Docs: https://fluent2.microsoft.design/color · /typography · /shapes · /elevation
- Extracted 2026-11-11 into `design-systems/external-systems/microsoft-fluent-2/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
