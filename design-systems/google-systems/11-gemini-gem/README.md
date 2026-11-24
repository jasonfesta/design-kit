# 11. Google Gemini App Design System (gem / GemSys)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/gemini/versions/latest/sass/`
  - `//depot/google3/ux/tokens/design_systems/gemini/versions/v33_7/android_compose/`
  - `//depot/google3/ux/tokens/design_systems/gemini_chrome/`
  - `//depot/google3/ux/tokens/design_systems/gemini/config.textproto`
- **Carbon Design System**: `designSystems/3f0fcc618b7f3e7b` · version `39.0.0`
- **Internal Documentation**: go/carbon-service-docs · go/carbon-service-code-gen-mwtc
- **Frameworks**: Angular / Boq (bard_web chatui), Jetpack Compose (GemSys*), SwiftUI / UIKit
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!NOTE]
> Values in `tokens.css` are copied from the generated token files above. Any value not present in the google3 output (usually some dark-mode roles or shape tokens) is marked `/* inferred */`.

---

## 1. Visual & Structural DNA

**Gemini App (`gem` v39.0.0)** — Dual (Light #FFFFFF default + Dark #131314); Conversational / Comfortable (16px-28px corners, 1.5 line-height reading).

1. **Pill Prompt Field as the Primary Object**: A `28px`-radius (`corner-extra-large`) prompt container on `surface-container` `#F0F4F9` sits pinned to the bottom of a centered `760px` reading column, framed by the brand-spectrum gradient stops `brand-transition-blue-1` `#346BF1` → `brand-transition-blue-2` `#4FA0FF`.
2. **Tonal Drawer + Borderless Response Canvas**: Navigation lives in a collapsible drawer on `surface-container-low` `#F8FAFD`; model responses render without cards directly on `surface` `#FFFFFF`, using the separate `markdown-type-scale` token set for headings, lists and code.
3. **Gems Tonal Pairs**: Each custom Gem gets a `*-low` container and `*-high` glyph color (`gems-blue-low` `#BEDCFF` / `gems-blue-high` `#00629E`, `gems-teal-low` `#93E7EB` / `#00696D`, `gems-orange-low` `#FFCFB4` / `#96490A`).

**Core palette**: `surface_light` `#FFFFFF` · `surface_container_light` `#F0F4F9` · `surface_dark` `#131314` · `primary` `#0B57D0` · `brand_blue` `#3186FF` · `brand_transition_blue` `#346BF1` · `secondary_container` `#C2E7FF` · `tertiary` `#146C2E` · `error` `#B3261E`

**Type**: `Google Sans`, `Google Sans Text`, `Google Sans Flex (rounded variants)` · **Token prefix**: `--gem-sys-color-*`

---

## 2. Token Reference (`39.0.0`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--gem-sys-color-surface` | `gem.sys.color.surface` | `#FFFFFF` | `#131314` | Conversation canvas |
| `--gem-sys-color-surface-container` | `gem.sys.color.surface-container` | `#F0F4F9` | `#1E1F20` | Prompt field & drawer active item |
| `--gem-sys-color-surface-container-high` | `gem.sys.color.surface-container-high` | `#E9EEF6` | `#282A2C` | Chips, hover & code blocks |
| `--gem-sys-color-on-surface` | `gem.sys.color.on-surface` | `#1F1F1F` | `#E3E3E3` | Response body text |
| `--gem-sys-color-on-surface-variant` | `gem.sys.color.on-surface-variant` | `#444746` | `#C4C7C5` | Metadata & icons |
| `--gem-sys-color-primary` | `gem.sys.color.primary` | `#0B57D0` | `#A8C7FA` | Links, send button, focus |
| `--gem-sys-color-brand-blue` | `gem.sys.color.brand-blue` | `#3186FF` | `#3186FF` | Brand spectrum / sparkle |
| `--gem-sys-color-secondary-container` | `gem.sys.color.secondary-container` | `#C2E7FF` | `#004A77 (inferred)` | Selected drawer item |

---

## 3. Signature Components

- Pill Prompt Input with Brand-Blue Gradient Outline (outline-gradient / input-drop-shadow)
- Collapsible Conversation Drawer with Gems & Recent Chats
- Markdown Response Stack (markdown-type-scale) with Draft Chips & Action Row
- Gems Color Tiles (gems-*-high / gems-*-low tonal pairs)

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#25` Cited RAG / Knowledge Assistant** and **`#26` Browser-Agent HITL**: borderless response stack + prompt pill + draft chips.
- **`#28` / `#32` / `#36` consumer AI copilots**: the canonical Google conversational shell (drawer → mobile top bar + bottom prompt).
- Avoid for dense tables/dashboards (use `03-acx-ads` / `02-pantheon-cloud-matter`). Keep `primary-emphasis-*` Aurora purples out of large fills to stay under the `<9.5%` purple guardrail.

Recommended archetypes: `#25`, `#26`, `#28`, `#32`, `#36`
