# Atlassian Design System (`atlassian.design` · `@atlaskit/tokens`)

- **Primary URLs**: [atlassian.design](https://atlassian.design) · [Design tokens](https://atlassian.design/components/tokens/all-tokens) · [@atlaskit/tokens](https://www.npmjs.com/package/@atlaskit/tokens)
- **Token Source**: `@atlaskit/tokens@20.11.0`
- **License**: Apache-2.0 (Atlassian Sans/Charlie are proprietary; Inter used as preview fallback)
- **Archetype**: Team Collaboration & Work Management — semantic surface/background/text/border tokens, #1868DB refreshed blue, sunken boards, 4–8px radii, Atlassian Sans 653-weight headings
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #03 (Quartz VSM Studio)** — board/backlog columns on `--ds-surface-sunken`, lozenges for WIP states.
  - **Prompt #09 (FP&A Business Digital Twin)** — planning tables, inline edit, and cross-team status lozenges.

---

## 1. Design Philosophy & Structural DNA

1. **Semantic-first naming**: tokens describe purpose (`--ds-background-brand-bold`, `--ds-text-subtlest`, `--ds-surface-sunken`), with hover/pressed variants baked in (`-hovered`, `-pressed`).
2. **Elevation by surface + shadow pair**: `--ds-surface` / `--ds-surface-raised` / `--ds-surface-overlay` each pair with a matching `--ds-shadow-*`, so dark mode lifts surfaces instead of darkening shadows.
3. **Refreshed brand (2024+)**: bolder `#1868DB` blue, neutral `#292A2E` text, Atlassian Sans with 653-weight headings and 0.875rem/1.25rem body via `--ds-font-body`.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--ads-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--ads-canvas` | `--ds-surface` | Page canvas / app background | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#1F1F21` | `oklch(0.240 0.004 286.1)` |
| `--ads-surface` | `--ds-surface-raised` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#242528` | `oklch(0.265 0.006 271.2)` |
| `--ads-surface-2` | `--ds-surface-sunken` | Sunken well, table header, hover fill | `#F8F8F8` | `oklch(0.979 0.000 0)` | `#18191A` | `oklch(0.213 0.003 247.9)` |
| `--ads-border` | `--ds-border` | Default hairline border / divider | `#0B120E24` | `oklch(0.173 0.014 159.5 / 0.14)` | `#E3E4F21F` | `oklch(0.922 0.019 282.8 / 0.12)` |
| `--ads-border-strong` | `--ds-border-input` | Input & emphasis border | `#8C8F97` | `oklch(0.650 0.012 269.5)` | `#7E8188` | `oklch(0.603 0.011 267.3)` |
| `--ads-ink` | `--ds-text` | Primary text & icon ink | `#292A2E` | `oklch(0.286 0.007 274.7)` | `#CECFD2` | `oklch(0.855 0.004 271.4)` |
| `--ads-ink-2` | `--ds-text-subtle` | Secondary text | `#505258` | `oklch(0.439 0.010 271.2)` | `#A9ABAF` | `oklch(0.741 0.006 264.5)` |
| `--ads-ink-3` | `--ds-text-subtlest` | Tertiary / helper / placeholder text | `#6B6E76` | `oklch(0.538 0.013 269.4)` | `#96999E` | `oklch(0.682 0.008 260.7)` |
| `--ads-accent` | `--ds-background-brand-bold` | Primary action fill | `#1868DB` | `oklch(0.541 0.191 259.0)` | `#669DF1` | `oklch(0.695 0.137 258.6)` |
| `--ads-accent-hover` | `--ds-background-brand-bold-hovered` | Primary action hover fill | `#1558BC` | `oklch(0.482 0.171 259.3)` | `#8FB8F6` | `oklch(0.777 0.100 258.5)` |
| `--ads-on-accent` | `--ds-text-inverse` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#1F1F21` | `oklch(0.240 0.004 286.1)` |
| `--ads-accent-subtle` | `--ds-background-selected` | Selected row / subtle brand fill | `#E9F2FE` | `oklch(0.958 0.019 255.5)` | `#1C2B42` | `oklch(0.288 0.047 258.7)` |
| `--ads-accent-ink` | `--ds-link` | Link & brand text | `#1868DB` | `oklch(0.541 0.191 259.0)` | `#669DF1` | `oklch(0.695 0.137 258.6)` |
| `--ads-success` | `--ds-background-success-bold` | Success / positive | `#5B7F24` | `oklch(0.550 0.125 128.7)` | `#94C748` | `oklch(0.769 0.165 128.4)` |
| `--ads-warning` | `--ds-background-warning-bold` | Warning / caution | `#FBC828` | `oklch(0.854 0.166 88.9)` | `#FBC828` | `oklch(0.854 0.166 88.9)` |
| `--ads-danger` | `--ds-background-danger-bold` | Critical / destructive | `#C9372C` | `oklch(0.557 0.185 28.8)` | `#F87168` | `oklch(0.709 0.167 26.0)` |
| `--ads-info` | `--ds-background-information-bold` | Informative | `#1868DB` | `oklch(0.541 0.191 259.0)` | `#669DF1` | `oklch(0.695 0.137 258.6)` |
| `--ads-focus` | `--ds-border-focused` | Keyboard focus ring | `#4688EC` | `oklch(0.633 0.165 258.6)` | `#8FB8F6` | `oklch(0.777 0.100 258.5)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Blue** | `ads-palette-blue-100` #E9F2FE · `ads-palette-blue-200` #CFE1FD · `ads-palette-blue-300` #8FB8F6 · `ads-palette-blue-400` #669DF1 · `ads-palette-blue-500` #4688EC · `ads-palette-blue-600` #357DE8 · `ads-palette-blue-700` #1868DB · `ads-palette-blue-800` #1558BC · `ads-palette-blue-900` #123263 · `ads-palette-blue-1000` #1C2B42 |
| **Neutral** | `ads-palette-neutral-0` #FFFFFF · `ads-palette-neutral-100` #F8F8F8 · `ads-palette-neutral-200` #F0F1F2 · `ads-palette-neutral-300` #DDDEE1 · `ads-palette-neutral-400` #B7B9BE · `ads-palette-neutral-500` #8C8F97 · `ads-palette-neutral-600` #7D818A · `ads-palette-neutral-700` #6B6E76 · `ads-palette-neutral-800` #505258 · `ads-palette-neutral-1000` #292A2E |
| **Status (bold)** | `ds-background-success-bold` #5B7F24 · `ds-background-warning-bold` #FBC828 · `ds-background-danger-bold` #C9372C · `ds-background-discovery-bold` #964AC0 · `ds-background-information-bold` #1868DB · `ds-background-accent-teal-bolder` #227D9B · `ds-background-accent-orange-bolder` #BD5B00 · `ds-background-accent-magenta-bolder` #AE4787 · `ds-background-accent-lime-bolder` #5B7F24 · `ds-background-neutral-bold` #292A2E |
| **Status (subtle)** | `ds-background-success` #EFFFD6 · `ds-background-warning` #FFF5DB · `ds-background-danger` #FFECEB · `ds-background-discovery` #F8EEFE · `ds-background-information` #E9F2FE · `ds-background-accent-teal-subtler` #C6EDFB · `ds-background-accent-orange-subtler` #FCE4A6 · `ds-background-accent-magenta-subtler` #FDD0EC · `ds-background-accent-lime-subtler` #D3F1A7 · `ds-background-neutral` #0515240F |

---

## 3. Typography

- **Sans**: `"Atlassian Sans", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, "Helvetica Neue", sans-serif`
- **Mono**: `"Atlassian Mono", ui-monospace, Menlo, "Segoe UI Mono", "Ubuntu Mono", monospace`
- **Specimen preview face**: Atlassian Sans is proprietary; the specimen previews with Inter (its closest open relative) ahead of the official stack.

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Heading xxlarge | `--ds-font-heading-xxlarge` | 2rem | 2.25rem | 653 |
| Heading large | `--ds-font-heading-large` | 1.5rem | 1.75rem | 653 |
| Heading medium | `--ds-font-heading-medium` | 1.25rem | 1.5rem | 653 |
| Heading xsmall | `--ds-font-heading-xsmall` | 0.875rem | 1.25rem | 653 |
| Body large | `--ds-font-body-large` | 1rem | 1.5rem | 400 |
| Body | `--ds-font-body` | 0.875rem | 1.25rem | 400 |
| Body small | `--ds-font-body-small` | 0.75rem | 1rem | 400 |
| Metric large | `--ds-font-metric-large` | 1.75rem | 2rem | 653 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--ds-radius-xsmall` = 0.125rem (xsmall) · `--ds-radius-small` = 0.25rem (small) · `--ds-radius-medium` = 0.375rem (medium) · `--ds-radius-large` = 0.5rem (large) · `--ds-radius-xlarge` = 0.75rem (xlarge) · `--ds-radius-full` = 624.9375rem (full)
- **Spacing**: `--ds-space-050` = 0.25rem · `--ds-space-100` = 0.5rem · `--ds-space-150` = 0.75rem · `--ds-space-200` = 1rem · `--ds-space-300` = 1.5rem · `--ds-space-400` = 2rem · `--ds-space-600` = 3rem
- **Control height**: Buttons & text fields 32px (compact 24px); board cards min 40px; `--ds-border-width` 1px, `--ds-border-width-focused` 2px.
- **Elevation**:
- `--ds-shadow-raised` (shadow-raised): `0px 1px 1px #1E1F2140, 0px 0px 1px #1E1F214F`
- `--ds-shadow-overflow` (shadow-overflow): `0px 0px 8px #1E1F2129, 0px 0px 1px #1E1F211F`
- `--ds-shadow-overlay` (shadow-overlay): `0px 8px 12px #1E1F2126, 0px 0px 1px #1E1F214F`
- **Motion**: Atlassian motion tokens favor 100–350ms durations with ease-out `cubic-bezier(0.15, 1, 0.3, 1)` for entrances.

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: 32px, `--ds-radius-small`/medium, bold brand fill; subtle variant uses `--ds-background-neutral-subtle` with hover `--ds-background-neutral-subtle-hovered`.
2. **Lozenge**: uppercase 11px status label with subtle/bold appearances (`--ds-background-success`, `--ds-background-discovery`…).
3. **Board & card**: columns on `--ds-surface-sunken`, cards on `--ds-surface-raised` + `--ds-shadow-raised`.
4. **Dynamic table**: sortable header, `--ds-border` row dividers, `--ds-background-selected` rows.
5. **Flag / Section message**: toast & inline messages with icon tone tokens (`--ds-icon-warning`, `--ds-icon-danger`).

---

## 6. When to Use / When Not to Use

**Reach for Atlassian when:**
- Work management, issue tracking, wikis, planning and team collaboration tools.
- Products needing robust semantic light/dark tokens with interaction states included.

**Avoid when:**
- Marketing or editorial brand sites (use Atlassian brand guidelines instead).
- Ultra-minimal monochrome aesthetics; the token set is rich in accent hues.

---

## 7. Provenance

- Light/dark color tokens parsed from the generated CSS strings in `@atlaskit/tokens/dist/cjs/artifacts/themes/atlassian-light.js` and `atlassian-dark.js`; shape, spacing, typography from the matching artifacts.
- Raw palette steps (`--ads-palette-*`) come from `artifacts/palettes-raw/palette-brand-refresh.js` (not shipped as CSS vars upstream).
- Docs: https://atlassian.design/foundations/color-new · https://atlassian.design/foundations/typography-beta
- Extracted 2026-11-11 into `design-systems/external-systems/atlassian/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
