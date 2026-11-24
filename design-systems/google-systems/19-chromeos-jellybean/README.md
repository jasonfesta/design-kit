# 19. ChromeOS Jelly / Jellybean Web Components (cros_components)

- **Google3 Depot Provenance**:
  - `//depot/google3/third_party/javascript/cros_components/`
  - `//depot/google3/third_party/javascript/cros_components/g3doc/`
  - `//depot/google3/third_party/javascript/cros_components/button/button.ts`
  - `//depot/google3/third_party/javascript/cros_components/sidenav/`
- **Carbon Design System**: `n/a (Jelly dynamic color — cros.sys.* tokens resolved in Chromium)` · version `google3 HEAD`
- **Internal Documentation**: go/cros-jellybean · go/cros-jellybean-charter · go/g3doc-jellybean · go/jb-bug
- **Frameworks**: Lit Web Components (cros-*), Chromium WebUI (copybara), @material/web underneath
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!WARNING]
> **All hex values in `tokens.css` are inferred.** ChromeOS Jelly resolves `cros.sys.*` from the wallpaper at runtime inside Chromium; google3 only contains the component library and token *names*. Fallbacks use the GM3 baseline-blue scheme.

---

## 1. Visual & Structural DNA

**ChromeOS Jellybean (`cros_components`)** — Dual (Light + Dark) with Jelly dynamic wallpaper-derived color; Desktop App Windows (Settings / Files / Camera SWA), 20px icons.

1. **Lit Component Library Over Material Web**: `cros-button`, `cros-switch`, `cros-slider`, `cros-tab-slider`, `cros-sidenav`, `cros-snackbar`, `cros-dialog` etc. wrap `@material/web` and remap its `--md-*` tokens onto `--cros-sys-*` and the `--cros-button-1/2-font-*` / `--cros-body-0/2-font` typography tokens.
2. **Most-Used System Tokens**: Static analysis of the library shows the hottest tokens: `--cros-sys-on_surface` (99 uses), `--cros-sys-primary` (50), `--cros-sys-hover_on_subtle` (26), `--cros-sys-secondary` (24), `--cros-sys-on_primary` (23), `--cros-sys-ripple_primary` (20), `--cros-sys-focus_ring` (19), `--cros-sys-app_base` (10).
3. **Wallpaper-Driven Dynamic Color**: Jelly derives `cros.sys.*` from the user's wallpaper at runtime in Chromium; google3 holds only token *names*. Hex values below are the GM3 baseline-blue fallback and are **inferred**.

**Core palette**: `app_base` `#F8FAFD (inferred)` · `base_elevated` `#FFFFFF (inferred)` · `app_base_dark` `#1B1B1F (inferred)` · `primary` `#0B57D0 (inferred)` · `primary_container` `#D3E3FD (inferred)` · `separator` `#C4C7C5 (inferred)` · `error` `#B3261E (inferred)`

**Type**: `Google Sans`, `Google Sans Text`, `Roboto` · **Token prefix**: `--cros-sys-*`

---

## 2. Token Reference (`google3 HEAD`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--cros-sys-app_base` | `cros.sys.app_base` | `#F8FAFD (inferred)` | `#1B1B1F (inferred)` | SWA window background |
| `--cros-sys-base_elevated` | `cros.sys.base_elevated` | `#FFFFFF (inferred)` | `#2B2C30 (inferred)` | Cards & dialogs |
| `--cros-sys-on_surface` | `cros.sys.on_surface` | `#1F1F1F (inferred)` | `#E3E3E3 (inferred)` | Primary text (most-used token) |
| `--cros-sys-on_surface_variant` | `cros.sys.on_surface_variant` | `#444746 (inferred)` | `#C4C7C5 (inferred)` | Secondary text & icons |
| `--cros-sys-primary` | `cros.sys.primary` | `#0B57D0 (inferred)` | `#A8C7FA (inferred)` | Switch on, slider, filled button |
| `--cros-sys-primary_container` | `cros.sys.primary_container` | `#D3E3FD (inferred)` | `#0842A0 (inferred)` | Selected sidenav item |
| `--cros-sys-separator` | `cros.sys.separator` | `#C4C7C5 (inferred)` | `#444746 (inferred)` | Row dividers |
| `--cros-sys-focus_ring` | `cros.sys.focus_ring` | `#0B57D0 (inferred)` | `#A8C7FA (inferred)` | Keyboard focus |

---

## 3. Signature Components

- cros-sidenav Settings Navigation (sidenav)
- cros-switch / cros-slider / cros-tab-slider Controls
- cros-dropdown, cros-textfield & cros-card Rows
- cros-snackbar, cros-dialog & cros-button (filled / tonal / text)

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#03` / `#16` / `#18` industrial & ERP desktop apps** and **`#06` / `#29` engineering tools**: settings-style windows with sidenav, toggles, sliders and dropdown rows.
- Use when the deliverable should feel like an installed desktop OS app rather than a website.
- Values are inferred — swap in a wallpaper-derived palette to demonstrate Jelly dynamic color.

Recommended archetypes: `#03`, `#06`, `#16`, `#18`, `#29`
