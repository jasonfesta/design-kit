# GitHub Primer (`primer.style` · `@primer/primitives`)

- **Primary URLs**: [primer.style](https://primer.style) · [Primitives](https://primer.style/primitives) · [primer/primitives](https://github.com/primer/primitives)
- **Token Source**: `@primer/primitives@11.10.0`
- **License**: MIT; Mona Sans: SIL OFL 1.1
- **Archetype**: Developer Collaboration Workbench — functional bg/fg/border token grammar, green primary, 6px radius, 32px controls, Mona Sans, 9 accessibility themes
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) · [`mobile.png`](./mobile.png)
- **Primary WDA Prompt Matches**:
  - **Prompt #08 (Binance Quant Terminal)** — dark-dimmed / dark-high-contrast themes, monospace diffs and status checks.
  - **Prompt #06 (Biometric Resemblance Inspector)** — review/approval flows modeled on pull-request reviews, labels and timeline events.

---

## 1. Design Philosophy & Structural DNA

1. **Functional token grammar**: every color is `{bgColor|fgColor|borderColor}-{role}-{emphasis|muted}` (e.g. `--bgColor-accent-muted`, `--fgColor-danger`), so components never touch the raw scale.
2. **Nine-plus accessible themes**: light, dark, dark-dimmed, high-contrast, and colorblind/tritanopia variants are first-class builds of the same token set.
3. **Quiet chrome, content-first**: 1px `--borderColor-default` boxes, 6px `--borderRadius-medium`, 32px `--control-medium-size` controls; the only loud color is the green `--button-primary-bgColor-rest` CTA.

---

## 2. Extracted Token Reference (Hex + OKLCH)

Official names on the left of each row; `--pr-*` is the local alias layer in [`tokens.css`](./tokens.css). Dark values come from the official dark theme.

| Alias | Official Token | Semantic Role | Light (Hex) | Light (OKLCH) | Dark (Hex) | Dark (OKLCH) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `--pr-canvas` | `--bgColor-default` | Page canvas / app background | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#0D1117` | `oklch(0.176 0.014 258.4)` |
| `--pr-surface` | `--bgColor-default` | Card, panel & table surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#0D1117` | `oklch(0.176 0.014 258.4)` |
| `--pr-surface-2` | `--bgColor-muted` | Sunken well, table header, hover fill | `#F6F8FA` | `oklch(0.978 0.003 247.9)` | `#151B23` | `oklch(0.220 0.018 255.7)` |
| `--pr-border` | `--borderColor-default` | Default hairline border / divider | `#D1D9E0` | `oklch(0.881 0.013 244.3)` | `#3D444D` | `oklch(0.384 0.018 254.7)` |
| `--pr-border-strong` | `--borderColor-emphasis` | Input & emphasis border | `#818B98` | `oklch(0.633 0.023 255.0)` | `#656C76` | `oklch(0.529 0.018 257.2)` |
| `--pr-ink` | `--fgColor-default` | Primary text & icon ink | `#1F2328` | `oklch(0.254 0.011 254.0)` | `#F0F6FC` | `oklch(0.970 0.010 247.9)` |
| `--pr-ink-2` | `--fgColor-muted` | Secondary text | `#59636E` | `oklch(0.495 0.022 250.8)` | `#9198A1` | `oklch(0.677 0.016 254.6)` |
| `--pr-ink-3` | `--fgColor-muted` | Tertiary / helper / placeholder text | `#59636E` | `oklch(0.495 0.022 250.8)` | `#9198A1` | `oklch(0.677 0.016 254.6)` |
| `--pr-accent` | `--button-primary-bgColor-rest` | Primary action fill | `#1F883D` | `oklch(0.552 0.145 148.2)` | `#238636` | `oklch(0.546 0.147 146.3)` |
| `--pr-accent-hover` | `--button-primary-bgColor-hover` | Primary action hover fill | `#1C8139` | `oklch(0.531 0.140 148.2)` | `#29903B` | `oklch(0.576 0.154 146.0)` |
| `--pr-on-accent` | `--button-primary-fgColor-rest` | Text on primary action | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--pr-accent-subtle` | `--bgColor-accent-muted` | Selected row / subtle brand fill | `#DDF4FF` | `oklch(0.954 0.028 228.0)` | `#388BFD1A` | `oklch(0.646 0.188 257.4 / 0.1)` |
| `--pr-accent-ink` | `--fgColor-accent` | Link & brand text | `#0969DA` | `oklch(0.540 0.191 257.5)` | `#4493F8` | `oklch(0.663 0.169 255.9)` |
| `--pr-success` | `--bgColor-success-emphasis` | Success / positive | `#1F883D` | `oklch(0.552 0.145 148.2)` | `#238636` | `oklch(0.546 0.147 146.3)` |
| `--pr-warning` | `--bgColor-attention-emphasis` | Warning / caution | `#9A6700` | `oklch(0.554 0.117 75.0)` | `#9E6A03` | `oklch(0.565 0.118 74.9)` |
| `--pr-danger` | `--bgColor-danger-emphasis` | Critical / destructive | `#CF222E` | `oklch(0.552 0.205 24.5)` | `#DA3633` | `oklch(0.586 0.201 26.8)` |
| `--pr-info` | `--bgColor-accent-emphasis` | Informative | `#0969DA` | `oklch(0.540 0.191 257.5)` | `#1F6FEB` | `oklch(0.569 0.202 259.7)` |
| `--pr-focus` | `--focus-outlineColor` | Keyboard focus ring | `#0969DA` | `oklch(0.540 0.191 257.5)` | `#1F6FEB` | `oklch(0.569 0.202 259.7)` |

### Palette Ramps (light values)

| Ramp | Steps |
| :--- | :--- |
| **Neutral roles** | `bgColor-default` #FFFFFF · `bgColor-muted` #F6F8FA · `bgColor-neutral-muted` #818B981F · `borderColor-muted` #D1D9E0B3 · `borderColor-default` #D1D9E0 · `borderColor-emphasis` #818B98 · `fgColor-muted` #59636E · `fgColor-default` #1F2328 · `bgColor-emphasis` #25292E · `bgColor-inset` #F6F8FA |
| **Emphasis fills** | `bgColor-accent-emphasis` #0969DA · `bgColor-success-emphasis` #1F883D · `bgColor-attention-emphasis` #9A6700 · `bgColor-severe-emphasis` #BC4C00 · `bgColor-danger-emphasis` #CF222E · `bgColor-done-emphasis` #8250DF · `bgColor-sponsors-emphasis` #BF3989 · `bgColor-closed-emphasis` #CF222E · `bgColor-open-emphasis` #1F883D · `button-primary-bgColor-hover` #1C8139 |
| **Muted fills** | `bgColor-accent-muted` #DDF4FF · `bgColor-success-muted` #DAFBE1 · `bgColor-attention-muted` #FFF8C5 · `bgColor-severe-muted` #FFF1E5 · `bgColor-danger-muted` #FFEBE9 · `bgColor-done-muted` #FBEFFF · `bgColor-sponsors-muted` #FFEFF7 · `fgColor-accent` #0969DA · `fgColor-success` #1A7F37 · `fgColor-danger` #D1242F |

---

## 3. Typography

- **Sans**: `"Mona Sans VF", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`
- **Mono**: `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace`
- **Specimen preview face**: Primer’s stack starts with "Mona Sans VF" (GitHub’s open-source face); the specimen loads Mona Sans from Google Fonts under its public family name.

| Style | Token | Size | Line Height | Weight |
| :--- | :--- | :---: | :---: | :---: |
| Display | `--text-display-*` | 40px | 1.4 | 500 |
| Title large | `--text-title-size-large` | 32px | 1.5 | 600 |
| Title medium | `--text-title-size-medium` | 20px | 1.6 | 600 |
| Body large | `--text-body-size-large` | 16px | 1.5 | 400 |
| Body medium | `--text-body-size-medium` | 14px | 1.4285 | 400 |
| Caption | `--text-caption-size` | 12px | 1.3333 | 400 |
| Code block | `--text-codeBlock-size` | 13px | 1.5385 | 400 |

---

## 4. Radius, Spacing, Elevation & Motion

- **Radius**: `--borderRadius-small` = 0.1875rem (small) · `--borderRadius-medium` = 0.375rem (medium) · `--borderRadius-large` = 0.75rem (large) · `--borderRadius-full` = 624.9375rem (full)
- **Spacing**: `--base-size-4` = 0.25rem · `--base-size-8` = 0.5rem · `--base-size-12` = 0.75rem · `--base-size-16` = 1rem · `--base-size-24` = 1.5rem · `--base-size-32` = 2rem · `--base-size-48` = 3rem
- **Control height**: `--control-xsmall-size` 24px · `--control-small-size` 28px · `--control-medium-size` 32px · `--control-large-size` 40px.
- **Elevation**:
- `--shadow-resting-small` (resting-small): `0 1px 1px 0 #1f23280a, 0 1px 2px 0 #1f232808`
- `--shadow-resting-medium` (resting-medium): `0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f`
- `--shadow-floating-small` (floating-small): `0 0 0 1px #d1d9e040, 0 6px 12px -3px #25292e0a, 0 6px 18px 0 #25292e1f`
- `--shadow-floating-large` (floating-large): `0 0 0 1px #d1d9e000, 0 40px 80px 0 #25292e3d`
- **Motion**: Primer motion favors short 80–200ms transitions with `cubic-bezier(0.33, 1, 0.68, 1)` ease-out; reduced-motion honored.

---

## 5. Core Component Anatomy & Interaction Patterns

1. **Button**: 32px (medium), 6px radius, 1px border; primary green `#1f883d`, default `--button-default-bgColor-rest` gray with border, danger red-text default that fills on hover, invisible variant.
2. **Box / Border box**: header row in `--bgColor-muted`, rows separated by `--borderColor-muted` — the repository file list / issue list pattern.
3. **Label & StateLabel**: pill labels with muted fills; state labels (Open green, Merged purple `--bgColor-done-emphasis`, Closed red).
4. **UnderlineNav**: tabs with 2px coral `--underlineNav-borderColor-active` indicator and count pills.
5. **Timeline & avatar stacks**: event rows with 2px gray rail and octicon badges.

---

## 6. When to Use / When Not to Use

**Reach for Primer when:**
- Developer tools, code review, repository/issue trackers, CI dashboards.
- Products that must ship many accessibility themes from one token set.

**Avoid when:**
- Lifestyle/consumer brands; the vocabulary reads very “GitHub”.
- Highly visual editorial layouts — Primer is optimized for dense information.

---

## 7. Provenance

- `light.css` / `dark.css` from `@primer/primitives@11.10.0/dist/css/functional/themes/` (filtered to bg/fg/border/button/focus/shadow/label/underlineNav families plus every var they reference).
- Size, radius, spacing and typography from `dist/css/functional/{size,typography}` and `dist/css/base/{size,typography}`.
- Docs: https://primer.style/primitives/colors · https://primer.style/foundations/typography
- Extracted 2026-11-11 into `design-systems/external-systems/github-primer/`; screenshots rendered from `specimen.html` with headless Chrome at 1440×900 @2x (desktop) and 390×844 @2x (mobile).
