# Apple Human Interface Guidelines (Web Approximation) (`developer.apple.com/design/human-interface-guidelines`)

- **Primary URLs**: [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) · [Color](https://developer.apple.com/design/human-interface-guidelines/color) · [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) · [Apple Design Resources](https://developer.apple.com/design/resources/)
- **Token Source**: `Apple HIG — Color & Typography (web transcription)`
- **License**: Reference only — Apple HIG content © Apple Inc.; SF Pro is licensed for Apple-platform UI only (Inter used as preview fallback)
- **Archetype**: Native-Feeling Consumer & Settings UI — system colors with dynamic light/dark variants, grouped inset lists on #F2F2F7, SF Pro Dynamic Type, 44pt targets, continuous rounded corners
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #06 (Biometric Resemblance Inspector)** — calm clinical grouped lists and semantic system colors.
  - **Prompt #05 (Horizon CEO Telemetry)** — iPad-style executive summary cards and segmented controls.

---

## 1. Design Philosophy & Structural DNA

1. **Semantic, dynamic system colors**: `systemBackground`, `label`, `secondaryLabel`, `separator` and the 12 system hues each have tuned light & dark (and increased-contrast) values; UI references roles, never raw hex.
2. **Dynamic Type hierarchy**: 11 text styles from Large Title 34/41 to Caption 2 11/13 scale with the user’s preferred size; SF Pro Text/Display switch optically at 20pt.
3. **Deference & depth**: content-first layouts, grouped inset lists, translucent materials (vibrancy/blur) and continuous-corner (squircle) shapes; minimum 44×44pt hit targets.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--hig-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--hig-canvas` | `--apple-system-grouped-background` | Page canvas / app background | `#F2F2F7` | `oklch(0.963 0.007 286.3)` | `#000000` | `oklch(0.000 0.000 0)` |
| `--hig-surface` | `--apple-secondary-system-grouped-background` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#1C1C1E` | `oklch(0.227 0.004 286.1)` |
| `--hig-surface-2` | `--apple-tertiary-system-fill` | Sunken well, table header, hover fill | `#7676801F` | `oklch(0.569 0.015 285.9 / 0.12)` | `#7676803D` | `oklch(0.569 0.015 285.9 / 0.24)` |
| `--hig-border` | `--apple-separator` | Default hairline border / divider | `#3C3C434A` | `oklch(0.359 0.012 285.8 / 0.29)` | `#54545899` | `oklch(0.447 0.006 286.1 / 0.6)` |
| `--hig-border-strong` | `--apple-opaque-separator` | Input & emphasis border | `#C6C6C8` | `oklch(0.827 0.003 286.3)` | `#38383A` | `oklch(0.341 0.003 286.2)` |
| `--hig-ink` | `--apple-label` | Primary text & icon ink | `#000000` | `oklch(0.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--hig-ink-2` | `--apple-secondary-label` | Secondary text | `#3C3C4399` | `oklch(0.359 0.012 285.8 / 0.6)` | `#EBEBF599` | `oklch(0.943 0.013 286.1 / 0.6)` |
| `--hig-ink-3` | `--apple-tertiary-label` | Tertiary / helper / placeholder text | `#3C3C434D` | `oklch(0.359 0.012 285.8 / 0.3)` | `#EBEBF54D` | `oklch(0.943 0.013 286.1 / 0.3)` |
| `--hig-accent` | `--apple-system-blue` | Primary action fill | `#007AFF` | `oklch(0.603 0.218 257.4)` | `#0A84FF` | `oklch(0.624 0.206 255.5)` |
| `--hig-accent-hover` | `color-mix(in srgb, var(--apple-system-blue) 85%, black)` | Primary action hover fill | `color-mix(in srgb, #007AFF 85%, black)` | `—` | `color-mix(in srgb, #0A84FF 85%, black)` | `—` |
| `--hig-on-accent` | `#FFFFFF` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--hig-accent-subtle` | `color-mix(in srgb, var(--apple-system-blue) 15%, transparent)` | Selected row / subtle brand fill | `color-mix(in srgb, #007AFF 15%, transparent)` | `—` | `color-mix(in srgb, #0A84FF 15%, transparent)` | `—` |
| `--hig-accent-ink` | `--apple-link` | Link & brand text | `#007AFF` | `oklch(0.603 0.218 257.4)` | `#0A84FF` | `oklch(0.624 0.206 255.5)` |
| `--hig-success` | `--apple-system-green` | Success / positive | `#34C759` | `oklch(0.730 0.194 147.4)` | `#30D158` | `oklch(0.756 0.208 147.0)` |
| `--hig-warning` | `--apple-system-orange` | Warning / caution | `#FF9500` | `oklch(0.765 0.175 62.6)` | `#FF9F0A` | `oklch(0.782 0.171 67.2)` |
| `--hig-danger` | `--apple-system-red` | Critical / destructive | `#FF3B30` | `oklch(0.654 0.232 28.7)` | `#FF453A` | `oklch(0.663 0.224 28.3)` |
| `--hig-info` | `--apple-system-teal` | Informative | `#30B0C7` | `oklch(0.700 0.111 212.7)` | `#40C8E0` | `oklch(0.771 0.118 212.0)` |
| `--hig-focus` | `--apple-system-blue` | Keyboard focus ring | `#007AFF` | `oklch(0.603 0.218 257.4)` | `#0A84FF` | `oklch(0.624 0.206 255.5)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **System hues** | `apple-system-red` #FF3B30 · `apple-system-orange` #FF9500 · `apple-system-yellow` #FFCC00 · `apple-system-green` #34C759 · `apple-system-mint` #00C7BE · `apple-system-teal` #30B0C7 · `apple-system-cyan` #32ADE6 · `apple-system-blue` #007AFF · `apple-system-indigo` #5856D6 · `apple-system-purple` #AF52DE · `apple-system-pink` #FF2D55 · `apple-system-brown` #A2845E |
| **System grays** | `apple-system-gray-6` #F2F2F7 · `apple-system-gray-5` #E5E5EA · `apple-system-gray-4` #D1D1D6 · `apple-system-gray-3` #C7C7CC · `apple-system-gray-2` #AEAEB2 · `apple-system-gray` #8E8E93 |
| **Backgrounds & labels** | `apple-system-background` #FFFFFF · `apple-secondary-system-background` #F2F2F7 · `apple-tertiary-system-background` #FFFFFF · `apple-system-grouped-background` #F2F2F7 · `apple-opaque-separator` #C6C6C8 · `apple-tertiary-label` #3C3C434D · `apple-secondary-label` #3C3C4399 · `apple-label` #000000 |

---

## 3. Typography

- **Sans**: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif`
- **Mono**: `ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace`
- **Display**: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro', 'Helvetica Neue', sans-serif`
- **Specimen preview face**: On Apple devices the specimen renders real SF Pro via -apple-system; elsewhere it falls back to Inter (similar neo-grotesque metrics).

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Large Title | `--apple-text-large-title-*` | 34px | 41px | 400 |
| Title 1 | `--apple-text-title-1-*` | 28px | 34px | 400 |
| Title 2 | `--apple-text-title-2-*` | 22px | 28px | 400 |
| Title 3 | `--apple-text-title-3-*` | 20px | 25px | 400 |
| Headline | `--apple-text-headline-*` | 17px | 22px | 600 |
| Body | `--apple-text-body-*` | 17px | 22px | 400 |
| Callout | `--apple-text-callout-*` | 16px | 21px | 400 |
| Subheadline | `--apple-text-subheadline-*` | 15px | 20px | 400 |
| Footnote | `--apple-text-footnote-*` | 13px | 18px | 400 |
| Caption 1 | `--apple-text-caption-1-*` | 12px | 16px | 400 |
| Caption 2 | `--apple-text-caption-2-*` | 11px | 13px | 400 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--hig-radius-sm` = 6px (6) · `--apple-radius-control` = 10px (control 10) · `--apple-radius-card` = 12px (card 12) · `--apple-radius-sheet` = 16px (sheet 16) · `--hig-btn-radius` = 9999px (capsule)
- **Spacing**: `--apple-space-1` = 4px · `--apple-space-2` = 8px · `--apple-space-3` = 12px · `--apple-space-4` = 16px · `--apple-space-5` = 20px · `--apple-space-6` = 24px · `--apple-space-8` = 32px
- **Control height**: Minimum hit target 44×44pt; buttons 50pt large / 34pt medium / 28pt small; list rows 44pt; switch 51×31pt.
- **Elevation**:
- `--apple-shadow-thumb` (switch / segmented thumb): `0 3px 8px rgba(0, 0, 0, 0.12), 0 3px 1px rgba(0, 0, 0, 0.04)`
- `--apple-shadow-card` (floating card): `0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)`
- `--apple-shadow-popover` (popover / menu): `0 10px 40px rgba(0, 0, 0, 0.18)`
- **Motion**: Spring-based, interruptible motion (UIKit default spring ≈ response 0.5s, damping 1.0); web approximation 200ms `cubic-bezier(0.25, 0.1, 0.25, 1)`; honor Reduce Motion.

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Buttons**: filled (tinted systemBlue), tinted (15% fill), gray, plain; 50pt large / 34pt medium / 28pt small, capsule or 10–12pt rounded.
2. **Grouped inset list (UITableView .insetGrouped)**: 10pt-radius sections on `systemGroupedBackground`, 44pt rows, `separator` hairlines inset 16pt, disclosure chevrons.
3. **Segmented control**: 32pt, tertiarySystemFill track, white raised thumb with shadow.
4. **Switch (Toggle)**: 51×31pt capsule, systemGreen on-state.
5. **Navigation bar & tab bar**: large title collapsing on scroll, translucent `.bar` material.

---

## 6. When to Use / When Not to Use

**Reach for Apple HIG when:**
- Companion web apps that should feel at home next to iOS/macOS apps.
- Calm consumer, health, finance or settings-style experiences.

**Avoid when:**
- Shipping SF Pro on the web (licensing).
- Data-dense enterprise grids — HIG favors spacious lists.

---

## 7. Provenance

- System color hex values transcribed from https://developer.apple.com/design/human-interface-guidelines/color (iOS, default contrast, light & dark).
- Text styles transcribed from the HIG Typography “Dynamic Type sizes” table (iOS, Large/default).
- Background/label/separator values match UIKit dynamic system colors (`UIColor.systemBackground`, `.secondaryLabel`, `.separator`).
- Extracted 2026-11-11 into `design-systems/external-systems/apple-hig/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
