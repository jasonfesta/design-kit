# Salesforce Lightning Design System (SLDS) (`lightningdesignsystem.com` · `@salesforce-ux/design-system` global styling hooks)

- **Primary URLs**: [lightningdesignsystem.com](https://www.lightningdesignsystem.com) · [Global styling hooks](https://www.lightningdesignsystem.com/2e1ef8501/p/58e5d7-global-styling-hooks) · [salesforce-ux/design-system](https://github.com/salesforce-ux/design-system)
- **Token Source**: `@salesforce-ux/design-system@2.264.3`
- **License**: BSD-3-Clause (code) · CC BY-ND 4.0 (icons/fonts)
- **Archetype**: CRM Enterprise Record Pages — brand blue #0176D3, gray #F3F3F3 app canvas, white 0.25rem-radius cards with shadow-1, highlights panels, path steppers & related lists
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #10 (Crystal Capital Deal OS)** — opportunity path stepper, record highlights panel and related lists.
  - **Prompt #07 (Cross-Border E-Commerce AI Bookkeeping)** — approval processes, Einstein-style AI cards and list views.

---

## 1. Design Philosophy & Structural DNA

1. **Global styling hooks**: `--slds-g-*` CSS custom properties (color palettes, spacing, font scale, radius, shadow) are the public theming contract; components expose `--slds-c-*` hooks on top.
2. **Accessible numbered palettes**: 10–100 lightness steps per hue (`--slds-g-color-brand-base-50` = #0176D3) where the number encodes contrast — any 50-step gap meets WCAG AA.
3. **Record-centric density**: system font stack, 13px (0.8125rem) base body, 0.25rem radius, white cards with `--slds-g-shadow-1` on a #F3F3F3 canvas.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--sl-*` is the local alias layer in [`tokens.css`](./tokens.css). This source publishes a light theme only.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--sl-canvas` | `--slds-g-color-neutral-base-95` | Page canvas / app background | `#F3F3F3` | `oklch(0.964 0.000 0)` | — | — |
| `--sl-surface` | `--slds-g-color-neutral-base-100` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | — | — |
| `--sl-surface-2` | `--slds-g-color-neutral-base-95` | Sunken well, table header, hover fill | `#F3F3F3` | `oklch(0.964 0.000 0)` | — | — |
| `--sl-border` | `--slds-g-color-border-base-1` | Default hairline border / divider | `#C9C9C9` | `oklch(0.836 0.000 0)` | — | — |
| `--sl-border-strong` | `--slds-g-color-border-base-4` | Input & emphasis border | `#747474` | `oklch(0.559 0.000 0)` | — | — |
| `--sl-ink` | `--slds-g-color-neutral-base-10` | Primary text & icon ink | `#181818` | `oklch(0.209 0.000 0)` | — | — |
| `--sl-ink-2` | `--slds-g-color-neutral-base-30` | Secondary text | `#444444` | `oklch(0.387 0.000 0)` | — | — |
| `--sl-ink-3` | `--slds-g-color-neutral-base-50` | Tertiary / helper / placeholder text | `#747474` | `oklch(0.559 0.000 0)` | — | — |
| `--sl-accent` | `--slds-g-color-brand-base-50` | Primary action fill | `#0176D3` | `oklch(0.563 0.167 251.9)` | — | — |
| `--sl-accent-hover` | `--slds-g-color-brand-base-40` | Primary action hover fill | `#0B5CAB` | `oklch(0.476 0.145 253.9)` | — | — |
| `--sl-on-accent` | `--slds-g-color-neutral-base-100` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | — | — |
| `--sl-accent-subtle` | `--slds-g-color-brand-base-95` | Selected row / subtle brand fill | `#EEF4FF` | `oklch(0.966 0.016 262.8)` | — | — |
| `--sl-accent-ink` | `--slds-g-link-color` | Link & brand text | `#0B5CAB` | `oklch(0.476 0.145 253.9)` | — | — |
| `--sl-success` | `--slds-g-color-success-base-50` | Success / positive | `#2E844A` | `oklch(0.547 0.121 150.9)` | — | — |
| `--sl-warning` | `--slds-g-color-warning-base-60` | Warning / caution | `#DD7A01` | `oklch(0.676 0.160 59.0)` | — | — |
| `--sl-danger` | `--slds-g-color-error-base-40` | Critical / destructive | `#BA0517` | `oklch(0.498 0.201 26.5)` | — | — |
| `--sl-info` | `--slds-g-color-neutral-base-50` | Informative | `#747474` | `oklch(0.559 0.000 0)` | — | — |
| `--sl-focus` | `--slds-g-color-brand-base-50` | Keyboard focus ring | `#0176D3` | `oklch(0.563 0.167 251.9)` | — | — |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Brand** | `slds-g-color-brand-base-95` #EEF4FF · `slds-g-color-brand-base-90` #D8E6FE · `slds-g-color-brand-base-80` #AACBFF · `slds-g-color-brand-base-70` #78B0FD · `slds-g-color-brand-base-65` #57A3FD · `slds-g-color-brand-base-60` #1B96FF · `slds-g-color-brand-base-50` #0176D3 · `slds-g-color-brand-base-40` #0B5CAB · `slds-g-color-brand-base-30` #014486 · `slds-g-color-brand-base-20` #032D60 |
| **Neutral** | `slds-g-color-neutral-base-100` #FFFFFF · `slds-g-color-neutral-base-95` #F3F3F3 · `slds-g-color-neutral-base-90` #E5E5E5 · `slds-g-color-neutral-base-80` #C9C9C9 · `slds-g-color-neutral-base-70` #AEAEAE · `slds-g-color-neutral-base-60` #939393 · `slds-g-color-neutral-base-50` #747474 · `slds-g-color-neutral-base-40` #5C5C5C · `slds-g-color-neutral-base-30` #444444 · `slds-g-color-neutral-base-10` #181818 |
| **Success** | `slds-g-color-success-base-90` #CDEFC4 · `slds-g-color-success-base-80` #91DB8B · `slds-g-color-success-base-70` #45C65A · `slds-g-color-success-base-60` #3BA755 · `slds-g-color-success-base-50` #2E844A · `slds-g-color-success-base-40` #396547 · `slds-g-color-success-base-30` #194E31 · `slds-g-color-success-base-20` #1C3326 · `slds-g-color-success-base-10` #071B12 · `slds-g-color-success-base-100` #FFFFFF |
| **Warning** | `slds-g-color-warning-base-90` #FEDFD0 · `slds-g-color-warning-base-80` #FFBA90 · `slds-g-color-warning-base-70` #FE9339 · `slds-g-color-warning-base-60` #DD7A01 · `slds-g-color-warning-base-50` #A96404 · `slds-g-color-warning-base-40` #825101 · `slds-g-color-warning-base-30` #5F3E02 · `slds-g-color-warning-base-20` #3E2B02 · `slds-g-color-warning-base-10` #201600 · `slds-g-color-warning-base-100` #FFFFFF |
| **Error** | `slds-g-color-error-base-90` #FEDED8 · `slds-g-color-error-base-80` #FEB8AB · `slds-g-color-error-base-70` #FE8F7D · `slds-g-color-error-base-60` #FE5C4C · `slds-g-color-error-base-50` #EA001E · `slds-g-color-error-base-40` #BA0517 · `slds-g-color-error-base-30` #8E030F · `slds-g-color-error-base-20` #640103 · `slds-g-color-error-base-10` #300C01 · `slds-g-color-error-base-100` #FFFFFF |

---

## 3. Typography

- **Sans**: `system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif`
- **Mono**: `Consolas, Menlo, Monaco, Courier, monospace`
- **Specimen preview face**: SLDS uses the platform system-ui stack (Salesforce Sans is no longer the default); on Linux the specimen previews with Inter ahead of the official stack.

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Font scale 8 | `--slds-g-font-scale-8` | 2.566rem | 1.25 | 300 |
| Font scale 5 | `--slds-g-font-scale-5` | 1.802rem | 1.25 | 400 |
| Font scale 3 | `--slds-g-font-scale-3` | 1.424rem | 1.25 | 700 |
| Font scale 1 | `--slds-g-font-scale-1` | 1.125rem | 1.25 | 700 |
| Base (body) | `--slds-g-font-scale-neg-2` | 0.8125rem | 1.5 | 400 |
| Font scale neg-3 | `--slds-g-font-scale-neg-3` | 0.75rem | 1.5 | 400 |
| Font scale neg-4 | `--slds-g-font-scale-neg-4` | 0.625rem | 1.5 | 700 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--slds-g-radius-border-1` = 0.125rem (border-1) · `--slds-g-radius-border-2` = 0.25rem (border-2) · `--slds-g-radius-border-3` = 0.5rem (border-3) · `--slds-g-radius-border-4` = 1rem (border-4) · `--slds-g-radius-border-circle` = 100% (circle)
- **Spacing**: `--slds-g-spacing-1` = 0.25rem · `--slds-g-spacing-2` = 0.5rem · `--slds-g-spacing-3` = 0.75rem · `--slds-g-spacing-4` = 1rem · `--slds-g-spacing-5` = 1.5rem · `--slds-g-spacing-6` = 2rem · `--slds-g-spacing-8` = 3rem
- **Control height**: Buttons & inputs 32px (2rem); list-view rows 32px; global header 50px; context bar 40px.
- **Elevation**:
- `--slds-g-shadow-1` (shadow-1): `0 0 2px 0 #18181814, 0 2px 4px 1px #18181828`
- `--slds-g-shadow-2` (shadow-2): `0 2px 8px -2px #18181814, 0 8px 12px -2px #18181828`
- `--slds-g-shadow-3` (shadow-3): `0 12px 24px -4px #18181814, 0 16px 32px -4px #18181828`
- `--slds-g-shadow-4` (shadow-4): `0 24px 48px -4px #18181833`
- **Motion**: SLDS durations: instantly 0s, immediately 0.05s, promptly 0.2s, slowly 0.4s; standard easing.

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: 32px, 0.25rem radius, brand (filled #0176D3), neutral (white + #C9C9C9 border, brand text), outline-brand, destructive (#BA0517).
2. **Card**: white, 1px `--slds-g-color-border-base-1`, 0.25rem radius, header with icon tile + title + actions.
3. **Path**: chevron stepper (complete green, current brand, incomplete gray) for opportunity/lead stages.
4. **Data table (list view)**: 32px rows, #F3F3F3 uppercase header, inline edit, row-level actions.
5. **Badge / Pill**: gray pill badges; lightning pills for selected lookup values.
6. **Global header & nav**: app launcher waffle, 40px context bar with brand-colored active tab underline.

---

## 6. When to Use / When Not to Use

**Reach for SLDS when:**
- CRM, sales, service and record-detail enterprise apps; anything living on the Salesforce Platform.
- Teams needing WCAG-encoded palettes and documented styling hooks.

**Avoid when:**
- Consumer or marketing experiences.
- Dark-mode-first products (no official dark hooks in this package).

---

## 7. Provenance

- All `--slds-g-*` values copied from `@salesforce-ux/design-system@2.264.3/design-tokens/dist/hooks.custom-props.scss` and `slds-hooks.custom-props.scss`.
- Docs: https://www.lightningdesignsystem.com/ (Styling Hooks › Global) · https://www.lightningdesignsystem.com/design-tokens/
- Extracted 2026-11-11 into `design-systems/external-systems/salesforce-slds/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
