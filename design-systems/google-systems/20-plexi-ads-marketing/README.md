# 20. Plexi — Google Ads Marketing Design System (plexi)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/plexi/versions/v0_2/sass_css_vars/`
  - `//depot/google3/ux/tokens/design_systems/plexi/README.md`
  - `//depot/google3/marketing/ads_mto/awmp/`
- **Carbon Design System**: `designSystems/320c302aad4aa959` · version `0.2.16`
- **Internal Documentation**: go/carbon-service-docs · go/carbon-service-code-gen-mwtc
- **Frameworks**: Sass CSS vars (ads.google.com marketing / AWMP), Plexi comp tokens (module-*, card-*, button-*)
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!NOTE]
> Values in `tokens.css` are copied from the generated token files above. Any value not present in the google3 output (usually some dark-mode roles or shape tokens) is marked `/* inferred */`.

---

## 1. Visual & Structural DNA

**Plexi Ads Marketing (`plexi` v0.2.16)** — Light Editorial (#FFFFFF / #F8F9FA / #E8F0FE tiers) + Dark text inversion (grey200); Spacious Marketing Modules (vw-scaled display type, 8-60px radii).

1. **Three Surface Tiers**: Marketing sections alternate `surface-primary` `#FFFFFF`, `surface-secondary-low` `#F8F9FA` / `-high` `#F1F3F4`, and blue-tinted `surface-tertiary-low` `#F3F7FF` / `-high` `#E8F0FE`, with a bright `surface-accent` `#7FCFFF` band and `on-surface-accent` `#001944` text.
2. **Viewport-Scaled Display Typography**: `plexi.ref.typeface` ships both px sizes (`11`–`68`) and vw sizes (`3vw`–`10vw`) with `Google Sans Display` for heroes, `Google Sans` brand and `Google Sans Text` plain — hero headlines scale fluidly.
3. **Generous Radius Ladder**: `plexi.sys.shape` steps `radius-1` `8px` → `radius-8` `32px` on mobile and up to `60px` on large screens, plus `radius-circular` for pill buttons — big soft cards around product imagery.

**Core palette**: `surface_primary` `#FFFFFF` · `surface_secondary_low` `#F8F9FA` · `surface_tertiary_high` `#E8F0FE` · `primary` `#1A73E8` · `surface_accent` `#7FCFFF` · `on_surface_accent` `#001944` · `text_headline` `#202124` · `container_green` `#E6F4EA`

**Type**: `Google Sans Display`, `Google Sans`, `Google Sans Text` · **Token prefix**: `--plexi-sys-color--*`

---

## 2. Token Reference (`0.2.16`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--plexi-sys-color--surface-primary` | `plexi.sys.color.surface-primary` | `#FFFFFF` | `—` | Default section |
| `--plexi-sys-color--surface-secondary-low` | `plexi.sys.color.surface-secondary-low` | `#F8F9FA` | `—` | Alternating section |
| `--plexi-sys-color--surface-tertiary-high` | `plexi.sys.color.surface-tertiary-high` | `#E8F0FE` | `—` | Blue feature band |
| `--plexi-sys-color--surface-accent` | `plexi.sys.color.surface-accent` | `#7FCFFF` | `—` | Accent hero / CTA band |
| `--plexi-sys-color--primary` | `plexi.sys.color.primary` | `#1A73E8` | `—` | High-emphasis button |
| `--plexi-sys-color--text-headline` | `plexi.sys.color.text-headline` | `#202124` | `—` | Headlines |
| `--plexi-sys-color--text-primary` | `plexi.sys.color.text-primary` | `grey800 #3C4043` | `grey200 #E8EAED` | Body copy |
| `--plexi-sys-color--container-green` | `plexi.sys.color.container-green` | `#E6F4EA` | `—` | Positive stat container |

---

## 3. Signature Components

- Feature Hero Module with vw-Scaled Display Type (module-feature-hero)
- 3-Up Staggered / Featured Card Modules (module-3up-*)
- Case-Study Card with Stat Callouts (card-case-study)
- Sticky Jumplink Bar & High/Medium/Tonal Pill Buttons (button-jumplink, button-*-emphasis)

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#10` / `#33` / `#35` product & SaaS marketing**: feature hero, 3-up modules, case-study stats and jumplinks.
- **`#20` / `#31` editorial storytelling**: vw-scaled display type and soft large-radius media cards.
- Pair with `05-glue-marketing` (Glue = cross-Google marketing grid; Plexi = Ads-specific module library).

Recommended archetypes: `#10`, `#20`, `#31`, `#33`, `#35`
