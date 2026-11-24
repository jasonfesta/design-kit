# App Stack (installed)

UI design libraries for **application** builds (dashboards, tools, settings, mobile app screens). Landing pages and marketing sites stay on the plain Golden Template.

These are **design/UI libraries only**. No full app frameworks (Ionic and Framework7 were skipped), no MUI X, no Material Icons, no state management.

| Library | Version | Use it for |
| :--- | :--- | :--- |
| `@mui/material` (+ `@emotion/react`, `@emotion/styled`) | 9.5.0 (11.14.0 / 11.14.1) | Data-dense app UI: forms, inputs, tables, dialogs, menus, snackbars, steppers. https://mui.com |
| `radix-ui` | 1.8.1 | Headless accessible primitives (Dialog, Popover, Tabs, Tooltip, Dropdown…), styled with Tailwind. https://www.radix-ui.com/primitives |
| `@radix-ui/themes` | 3.3.0 | Pre-styled Radix components with theme tokens (accent, gray, radius). https://www.radix-ui.com/themes |
| `konsta` | 5.5.0 | **iOS-styled** (and Material) mobile components built on Tailwind v4: Navbar, List, Toggle, Segmented, Sheet, Tabbar… UI only. https://konstaui.com |

Base: Golden Template locked versions (React 19.2.3, Vite 7.2.4, Tailwind 4.1.17, `lucide-react`, `clsx`, `tailwind-merge`, `vite-plugin-singlefile`).

## Use
```bash
cd ~/design-kit/libraries/stacks/apps
PATH=~/.gemini/jetski/bin:$PATH npm run dev     # playground: MUI panel, Radix panel, Konsta iOS phone
PATH=~/.gemini/jetski/bin:$PATH npm run build   # tsc + single-file dist/index.html
```
To start an app, copy this folder and add the libraries you need on top of the Golden Template `package.json`. Only add what the app actually uses.

## Which one
- **Web app UI (desktop/responsive):** MUI as the component kit. Use Radix primitives only for gaps MUI doesn't cover. Don't build the same widget in both.
- **Quick, clean admin UI with little CSS:** Radix Themes.
- **Custom look, own every pixel:** Radix primitives + Tailwind.
- **iOS-feeling mobile screens or PWA:** Konsta UI with `theme="ios"`.

## Wiring rules (taste rule applies)
- **MUI defaults break the taste rule** (Roboto font, purple `#9c27b0` secondary). Always start from [`src/data/themeData.ts`](src/data/themeData.ts), which swaps in a kit font pairing, a non-purple palette and light mode.
- **MUI with Tailwind v4:** wrap in `<StyledEngineProvider enableCssLayer>` and declare `@layer theme, base, mui, components, utilities;` first in `index.css` (see [`src/main.tsx`](src/main.tsx), [`src/index.css`](src/index.css)).
- **Radix Themes:** use `accentColor` from teal/green/blue/orange/amber/etc. Never `violet`, `purple`, `plum`, `iris` or `indigo`. Set `--default-font-family` to the project font.
- **Konsta:** `@import "konsta/react/theme.css";` after Tailwind, and wrap in `<KonstaProvider theme="ios">`.
- Icons: `lucide-react` (not `@mui/icons-material`).

`node_modules/` and `dist/` are git-ignored. Reinstall with `npm install`.
