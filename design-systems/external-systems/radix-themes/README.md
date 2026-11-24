# Radix Themes (`radix-ui.com/themes` · `@radix-ui/themes` · `@radix-ui/colors`)

- **Primary URLs**: [radix-ui.com/themes](https://www.radix-ui.com/themes/docs/overview/getting-started) · [Radix Colors](https://www.radix-ui.com/colors) · [radix-ui/themes](https://github.com/radix-ui/themes)
- **Token Source**: `@radix-ui/themes@3.3.0` · `@radix-ui/colors@3.0.0`
- **License**: MIT
- **Archetype**: Precision Component Foundation — 12-step functional color scales (1–2 bg, 3–5 component, 6–8 border, 9–10 solid, 11–12 text), scaling & radius factors, crisp inset shadows
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #06 (Biometric Resemblance Inspector)** — neutral slate UI with a single indigo accent and APCA-tuned text steps 11/12.
  - **Prompt #02 (Data Center GIS Site Screener)** — clean SaaS controls, segmented controls and data list primitives.

---

## 1. Design Philosophy & Structural DNA

1. **Every scale has a job**: steps 1–2 app/subtle backgrounds, 3–5 interactive component states, 6–8 borders & focus, 9–10 solid fills, 11–12 low/high-contrast text — identical semantics across all 30+ hues and both modes.
2. **Global theme knobs**: `--scaling` (90–110%) multiplies every size and `--radius-factor` (none/small/medium/large/full) multiplies `--radius-1..6` without touching components.
3. **Accent + gray pairing**: one accent (default indigo) is paired with its tuned gray (slate) via `--accent-*` and `--gray-*` aliases; alpha variants (`--gray-a*`) layer cleanly on any background.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--rx-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--rx-canvas` | `--gray-2` | Page canvas / app background | `#F9F9FB` | `oklch(0.983 0.003 286.4)` | `#18191B` | `oklch(0.213 0.004 264.5)` |
| `--rx-surface` | `--color-panel-solid` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#18191B` | `oklch(0.213 0.004 264.5)` |
| `--rx-surface-2` | `--gray-2` | Sunken well, table header, hover fill | `#F9F9FB` | `oklch(0.983 0.003 286.4)` | `#18191B` | `oklch(0.213 0.004 264.5)` |
| `--rx-border` | `--gray-6` | Default hairline border / divider | `#D9D9E0` | `oklch(0.887 0.010 286.2)` | `#363A3F` | `oklch(0.347 0.010 254.0)` |
| `--rx-border-strong` | `--gray-7` | Input & emphasis border | `#CDCED6` | `oklch(0.853 0.011 280.4)` | `#43484E` | `oklch(0.399 0.012 252.9)` |
| `--rx-ink` | `--gray-12` | Primary text & icon ink | `#1C2024` | `oklch(0.241 0.010 248.2)` | `#EDEEF0` | `oklch(0.949 0.003 264.5)` |
| `--rx-ink-2` | `--gray-11` | Secondary text | `#60646C` | `oklch(0.502 0.014 264.4)` | `#B0B4BA` | `oklch(0.769 0.010 258.3)` |
| `--rx-ink-3` | `--gray-10` | Tertiary / helper / placeholder text | `#80838D` | `oklch(0.611 0.015 272.6)` | `#777B84` | `oklch(0.583 0.015 266.6)` |
| `--rx-accent` | `--accent-9` | Primary action fill | `#3E63DD` | `oklch(0.544 0.191 267.0)` | `#3E63DD` | `oklch(0.544 0.191 267.0)` |
| `--rx-accent-hover` | `--accent-10` | Primary action hover fill | `#3358D4` | `oklch(0.511 0.195 266.6)` | `#5472E4` | `oklch(0.589 0.176 269.3)` |
| `--rx-on-accent` | `--accent-contrast` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--rx-accent-subtle` | `--accent-3` | Selected row / subtle brand fill | `#EDF2FE` | `oklch(0.961 0.017 267.8)` | `#182449` | `oklch(0.272 0.071 268.0)` |
| `--rx-accent-ink` | `--accent-11` | Link & brand text | `#3A5BC7` | `oklch(0.509 0.172 267.2)` | `#9EB1FF` | `oklch(0.776 0.114 273.0)` |
| `--rx-success` | `--green-9` | Success / positive | `#30A46C` | `oklch(0.641 0.133 157.7)` | `#30A46C` | `oklch(0.641 0.133 157.7)` |
| `--rx-warning` | `--amber-9` | Warning / caution | `#FFC53D` | `oklch(0.854 0.157 84.1)` | `#FFC53D` | `oklch(0.854 0.157 84.1)` |
| `--rx-danger` | `--red-9` | Critical / destructive | `#E5484D` | `oklch(0.626 0.193 23.0)` | `#E5484D` | `oklch(0.626 0.193 23.0)` |
| `--rx-info` | `--blue-9` | Informative | `#0090FF` | `oklch(0.649 0.193 251.8)` | `#0090FF` | `oklch(0.649 0.193 251.8)` |
| `--rx-focus` | `--focus-8` | Keyboard focus ring | `#8DA4EF` | `oklch(0.731 0.112 270.4)` | `#435DB1` | `oklch(0.502 0.137 268.3)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Slate (gray)** | `slate-1` #FCFCFD · `slate-2` #F9F9FB · `slate-3` #F0F0F3 · `slate-4` #E8E8EC · `slate-5` #E0E1E6 · `slate-6` #D9D9E0 · `slate-7` #CDCED6 · `slate-8` #B9BBC6 · `slate-9` #8B8D98 · `slate-10` #80838D · `slate-11` #60646C · `slate-12` #1C2024 |
| **Indigo (accent)** | `indigo-1` #FDFDFE · `indigo-2` #F7F9FF · `indigo-3` #EDF2FE · `indigo-4` #E1E9FF · `indigo-5` #D2DEFF · `indigo-6` #C1D0FF · `indigo-7` #ABBDF9 · `indigo-8` #8DA4EF · `indigo-9` #3E63DD · `indigo-10` #3358D4 · `indigo-11` #3A5BC7 · `indigo-12` #1F2D5C |
| **Green** | `green-1` #FBFEFC · `green-2` #F4FBF6 · `green-3` #E6F6EB · `green-4` #D6F1DF · `green-5` #C4E8D1 · `green-6` #ADDDC0 · `green-7` #8ECEAA · `green-8` #5BB98B · `green-9` #30A46C · `green-10` #2B9A66 · `green-11` #218358 · `green-12` #193B2D |
| **Amber** | `amber-1` #FEFDFB · `amber-2` #FEFBE9 · `amber-3` #FFF7C2 · `amber-4` #FFEE9C · `amber-5` #FBE577 · `amber-6` #F3D673 · `amber-7` #E9C162 · `amber-8` #E2A336 · `amber-9` #FFC53D · `amber-10` #FFBA18 · `amber-11` #AB6400 · `amber-12` #4F3422 |
| **Red** | `red-1` #FFFCFC · `red-2` #FFF7F7 · `red-3` #FEEBEC · `red-4` #FFDBDC · `red-5` #FFCDCE · `red-6` #FDBDBE · `red-7` #F4A9AA · `red-8` #EB8E90 · `red-9` #E5484D · `red-10` #DC3E42 · `red-11` #CE2C31 · `red-12` #641723 |

---

## 3. Typography

- **Sans**: `-apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)', Roboto, 'Helvetica Neue', 'Open Sans (Custom)', system-ui, sans-serif`
- **Mono**: `'Menlo', 'Consolas (Custom)', 'Bitstream Vera Sans Mono', monospace`
- **Specimen preview face**: Radix Themes ships a system stack (-apple-system → Segoe UI → Roboto); on Linux the specimen loads Roboto, the first web-available family in that stack.

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Size 9 | `--font-size-9` | 60px | 60px | 700 |
| Size 8 | `--font-size-8` | 35px | 40px | 700 |
| Size 6 | `--font-size-6` | 24px | 30px | 700 |
| Size 4 | `--font-size-4` | 18px | 26px | 500 |
| Size 3 | `--font-size-3` | 16px | 24px | 400 |
| Size 2 | `--font-size-2` | 14px | 20px | 400 |
| Size 1 | `--font-size-1` | 12px | 16px | 400 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--radius-1` = calc(3px * 1 * 1) (radius-1) · `--radius-2` = calc(4px * 1 * 1) (radius-2) · `--radius-3` = calc(6px * 1 * 1) (radius-3) · `--radius-4` = calc(8px * 1 * 1) (radius-4) · `--radius-5` = calc(12px * 1 * 1) (radius-5) · `--radius-6` = calc(16px * 1 * 1) (radius-6)
- **Spacing**: `--space-1` = calc(4px * 1) · `--space-2` = calc(8px * 1) · `--space-3` = calc(12px * 1) · `--space-4` = calc(16px * 1) · `--space-5` = calc(24px * 1) · `--space-6` = calc(32px * 1) · `--space-8` = calc(48px * 1)
- **Control height**: Control sizes 1–4 = 24 / 32 / 40 / 48px × `--scaling`; radius values are `calc(Npx * var(--scaling) * var(--radius-factor))`.
- **Elevation**:
- `--rx-shadow-sm` (shadow-1 ring (gray-6)): `0 0 0 1px #d9d9e0`
- `--rx-shadow-md` (shadow-5 overlay): `0 0 0 1px #d9d9e0, 0 12px 32px -16px rgba(0, 0, 0, 0.3), 0 12px 60px 0 rgba(0, 0, 0, 0.15)`
- **Motion**: Radix Themes keeps motion subtle: ~120–200ms state transitions, `cubic-bezier(0.16, 1, 0.3, 1)` for popovers; respects reduced motion.

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: sizes 1–4 (24/32/40/48px), variants solid / soft / surface / outline / ghost / classic; solid uses `--accent-9`, hover `--accent-10`, text `--accent-contrast`.
2. **Card**: `--color-panel-solid` with 1px `--gray-a5` inset ring (`--shadow-2` on hover/elevated).
3. **TextField / Select**: `--color-surface` fill, `--gray-a7` inset border, `--focus-8` 2px ring.
4. **Badge**: soft (`--accent-a3` bg, `--accent-a11` text), solid, surface, outline variants.
5. **Table**: `--gray-a5` dividers, header weight bold, compact row sizes 1–3.
6. **SegmentedControl / Tabs**: indicator uses `--color-panel-solid` lifted with shadow.

---

## 6. When to Use / When Not to Use

**Reach for Radix when:**
- React product UIs that need beautiful defaults with strict accessibility contrast.
- Design-system starters where you want to swap accent/gray/radius/scaling globally.

**Avoid when:**
- Pixel-specific brand systems that conflict with the 12-step model.
- Non-React stacks wanting component parity (colors still usable standalone).

---

## 7. Provenance

- Color scales copied from `@radix-ui/colors@3.0.0` `{slate,indigo,green,amber,red,blue}.css` (light sRGB) and `*-dark.css`.
- Space, font-size, line-height, letter-spacing, radius formulas and `--color-background`/`--color-panel-solid` from `@radix-ui/themes@3.3.0` (`tokens/base.css`, `styles.css`), evaluated at `--scaling: 1` and `--radius-factor: 1` (radius="medium").
- Docs: https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale · https://www.radix-ui.com/themes/docs/theme/overview
- Extracted 2026-11-11 into `design-systems/external-systems/radix-themes/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
