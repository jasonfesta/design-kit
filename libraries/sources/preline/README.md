# Preline UI (preline.co)

200+ free Tailwind CSS v4 blocks and 29 interactive JS plugins that work without React (or alongside React/Vite/Astro/Vue). **MIT** (Fair Use / MIT — see `source/LICENSE`).

- Site: https://preline.co · Repo: https://github.com/htmlstreamofficial/preline · npm: `preline`
- Grabbed 2026-11-24

## What's here (`source/`)
| Path | Contents |
| :--- | :--- |
| `src/plugins/` | 29 framework-agnostic interactive JS plugins: `accordion`, `carousel`, `collapse`, `combobox`, `copy-markup`, `datatable`, `datepicker`, `dropdown`, `file-upload`, `input-number`, `layout-splitter`, `overlay`, `pin-input`, `range-slider`, `remove-element`, `scroll-nav`, `scrollspy`, `select`, `stepper`, `strong-password`, `tabs`, `textarea-auto-height`, `theme-switch`, `toggle-count`, `toggle-password`, `tooltip`, `tree-view`, `accessibility-manager`, `base-plugin` |
| `dist/`, `preline.js` | Built UMD/ESM bundles ready to drop into plain HTML or Vite |
| `variants.css`, `theme.css` | Tailwind CSS v4 `@import "preline/variants.css"` & theme tokens |
| `templates/` | Starter HTML/CSS templates |

## Use (Tailwind v4)
```bash
npm i preline
```
In `src/index.css`:
```css
@import "tailwindcss";
@import "preline/variants.css";
@source "../node_modules/preline/dist/*.js";
```
In `src/main.ts` (or `<script src="./preline.js">` for plain HTML):
```ts
import "preline/preline";
// After client-side route changes:
window.HSStaticMethods?.autoInit();
```
Offline: copy `source/dist/preline.js` and `source/variants.css` directly.
