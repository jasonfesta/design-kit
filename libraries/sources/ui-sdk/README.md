# UI SDK (Vercel Labs): offline docs snapshot

- **Site:** https://ui-sdk.dev · docs https://ui-sdk.dev/docs · single-file web components docs https://ui-sdk.dev/web.md
- **Repo:** https://github.com/vercel-labs/ui, snapshot of commit `0e71042` (2026-11-16)
- **License:** Apache-2.0 (see [LICENSE](LICENSE)). Upstream README: [UPSTREAM_README.md](UPSTREAM_README.md)
- **Version at snapshot:** `0.1.0-beta.5` for every package. It's beta, so pin exact versions.

## What it is

A library of headless UI **behaviors**: keyboard navigation, focus, selection, dismissal, popups, drag and drop, and the ARIA they need. It also ships unstyled components built from those behaviors. The framework-agnostic core is `@ui-sdk/core`, with adapters for React, Vue, Svelte, Solid and web components. `@ui-sdk/core/web.css` is an optional default look. Interfaces can be made agent-drivable through `createAgent`, agent tools and WebMCP.

| Package | Use |
| :--- | :--- |
| `@ui-sdk/core` | Behaviors (`createPopup`, `createSelection`, `createTypeahead`, …), `web.css` |
| `@ui-sdk/react` | React adapter + components |
| `@ui-sdk/vue` · `@ui-sdk/svelte` · `@ui-sdk/solid` | Other framework adapters |
| `@ui-sdk/web` | Web components. No-build pages can load `https://ui-sdk.dev/web.js` + `web.css` |

```bash
npm i @ui-sdk/core@0.1.0-beta.5 @ui-sdk/react@0.1.0-beta.5
```

## Layout

- [`docs/`](docs/): the site's MDX source (407 pages): `agents/`, `core/`, `guides/`, `react/`, `vue/`, `svelte/`, `solid/`, `web-components/`.
- The agent skill lives in [`plugins/ui-libraries/skills/ui-sdk/`](../../../plugins/ui-libraries/skills/ui-sdk/SKILL.md).

> [!NOTE]
> Once `@ui-sdk/*` is installed in a project, prefer `node_modules/@ui-sdk/<framework>/docs/llms.txt`, which matches the installed version. Use this snapshot when nothing is installed or you're offline.

## Kit fit

- Golden Template default stays `radix-ui` / `@base-ui/react`. UI SDK is opt-in: use it when an agent builds a custom widget, or a build must be agent-drivable.
- `web.css` is a neutral default look. Restyle through `data-slot` / state attributes so builds follow the design-kit taste rule (no purple, no Material fonts, light by default).

## Refresh

```bash
git clone --depth 1 https://github.com/vercel-labs/ui /tmp/vercel-ui
rsync -a --delete /tmp/vercel-ui/apps/docs/content/docs/ libraries/sources/ui-sdk/docs/
rsync -a --delete --exclude LICENSE /tmp/vercel-ui/packages/core/skills/ui-sdk/ plugins/ui-libraries/skills/ui-sdk/
```
Then update the commit and version above.
