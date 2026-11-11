# 05. Google Glue Marketing Web Standards (`glue`)

- **Google3 Depot Provenance**:
  - `//depot/google3/marketing/glue/` (`index.ts`, `glue_classes.ts`, `VERSION`, `README.md`)
  - `//depot/google3/marketing/glue/lib/` (`colors/_variables.scss`, `typography/_variables.scss`, `grids/`, `spacers/`, `buttons/`, `cards/`, `jumplinks/`, `tables/`, `mwc3/`)
  - `//depot/google3/marketing/glue/g3doc/index.md`
- **Internal & Standards Documentation**: go/glue · [Marketing Web Standards](https://standards.google/guidelines/marketing-web-standards/)
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**Google Glue (`marketing/glue`)** is Google's canonical TypeScript + SCSS marketing, editorial, and brand storytelling design system powering `about.google`, `cloud.google.com` landing pages, `workspace.google.com`, `blog.google`, and `thinkwithgoogle.com`.

1. **12-Column Responsive Editorial Grid (`glue-grid`)**: Built on a `12-column` Desktop / `8-column` Tablet / `4-column` Mobile grid (`max-width: 1280px`) with generous `spacers` (`24px` → `48px` → `72px`) so display headlines and framed product visuals breathe effortlessly.
2. **Display Typography + Global Multi-Script Stacks**: `typography/_variables.scss` pairs `Google Sans Display` / `Google Sans` (`44px–56px` tight hero headlines, `24px–48px` pull-quotes) with `16px/24px` `Google Sans Text` body copy and built-in localized font stacks for Arabic (`Google Sans Arabic`), Japanese, Korean, and Simplified/Traditional Chinese.
3. **Chapter Jump-Links (`glue-jumplinks`) & Tonal Feature Lockups**: Uses sticky horizontal jump-link bars beneath a crisp `64px` white `glue-header`, alternating `#FFFFFF` (`$grey-0`) and `#F8F9FA` (`$grey-50`) chapter bands with `1px` `#DADCE0` (`$grey-300`) hairline cards (`0% purple`).

---

## 2. Verbatim Google3 Token Reference (`lib/colors/_variables.scss`)

| CSS Custom Property | Glue SCSS Variable | Light Hex | Dark Stage Hex | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--glue-surface` | `$grey-0` | `#FFFFFF` | `#202124` | Primary editorial page & card canvas |
| `--glue-surface-tonal` | `$grey-50` | `#F8F9FA` | `#292A2D` | Alternating chapter band & feature card fill |
| `--glue-ink-primary` | `$grey-900` | `#202124` | `#FFFFFF` | Display headlines, lockups & primary copy |
| `--glue-ink-secondary` | `$grey-700` | `#5F6368` | `#BDC1C6` | Lead paragraphs, captions & table metadata |
| `--glue-border` | `$grey-300` | `#DADCE0` | `#3C4043` | `1px` card, jump-link bar & comparison rules |
| `--glue-accent` | `$blue-600` | `#1A73E8` | `#8AB4F8` | Primary pill CTA, eyebrows & active jump-link |
| `--glue-green-600` | `$green-600` | `#1E8E3E` | `#81C995` | Verified benchmark / positive comparison check |
| `--glue-yellow-600` | `$yellow-600` | `#F9AB00` | `#FDD663` | Editorial highlight / tier accent |

---

## 3. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **Google Glue** for editorial landing pages, bilingual marketplaces, institutional portals, publishing showcases, and academic/archival presentation layers:
- **`#35` Flagit Off-Market Property Marketplace (EN `UK` ⇄ ES `Spain`)**: 12-column hero, bilingual header toggle, tier comparison cards (`10€–100€`), and investor trust proof.
- **`#33` Four Rivers Multi-Imprint Publishing Studio** & **`#20` Kuwaiti Archival Monograph**: High-craft editorial typography, Arabic/RTL font-stack support (`$font-family-ar`), and structured imprint chapters.
- **`#10` Crystal Capital Advisory Portal** & **`#31` Academic Testing Portal**: Institutional credibility, clean specification tables, and distraction-free reading hierarchy.
