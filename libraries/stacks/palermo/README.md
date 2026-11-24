# Palermo stack (installed)

The **open-source libraries the Palermo / Profound design system is built on**, installed locally so you can prototype in that style. Palermo itself is private. Its tokens, 46 docs pages and screenshots are in [`design-systems/external-systems/palermo-profound/`](../../../design-systems/external-systems/palermo-profound/README.md).

| Library | Version | Palermo uses it for |
| :--- | :--- | :--- |
| `radix-ui` | 1.8.1 | Primitives behind Tabs, Segmented Tabs, Dialog, Drawer, Popover, Dropdown, Switch, Tooltip, Toggle Group… |
| `cmdk` | 1.1.1 | Commandbar |
| `@number-flow/react` | 0.6.2 | Statistic (rolling digits) |
| `@videojs/react` | 10.3.0 | Video Player / Audio Player (Palermo wraps Video.js 10) |
| `hls.js` | 1.7.4 | `HlsJsVideo` HLS streams |
| `class-variance-authority`, `clsx`, `tailwind-merge` | 0.7.1 / 2.1.1 / 3.7.0 | Variant styling |
| `@fontsource-variable/geist-mono` | 5.3.0 | Mono face |
| `tailwindcss` + `@tailwindcss/vite` | 4.3.5 | Utility CSS (Palermo's tokens are Tailwind utilities: `bg-bg-primary`, `text-body-small-regular`…) |
| `react`, `react-dom` | 19.3.1 | |
| `vite`, `@vitejs/plugin-react`, `typescript` | 8.3.8 / 6.3.0 / 5.9.3 | Dev tooling (Palermo itself runs on Next.js) |

Not installed: "Profound Inter" (proprietary; the playground uses Instrument Sans per the don'ts), Palermo's custom icons, and `@repo/*` internal packages.

## Use
```bash
cd ~/design-kit/libraries/stacks/palermo
PATH=~/.gemini/jetski/bin:$PATH npm run dev      # playground at localhost
PATH=~/.gemini/jetski/bin:$PATH npm run build    # dist/ (verified 2026-11-12: tsc clean, build OK, renders with no console errors)
```
`src/index.css` imports `palermo-profound/tokens.css`, so every `--pal-*` token is available as a CSS variable. `src/main.tsx` demos NumberFlow, Radix Tabs/Switch/Tooltip and a cmdk command bar.

To start a real project in this style, copy this folder, or pick pieces with `library-finder`. `node_modules/` and `dist/` are git-ignored; reinstall with `npm install`.

**Golden Template note:** these deps aren't in the locked list. For Golden Template builds, use the tokens, plus native elements and `designme` components instead.
