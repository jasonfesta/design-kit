# Tactile UI (tactileui.dev)

Hardware-inspired, physically behaved UI components (knurled bezels, mechanical drum counters, pull-cord switches, machined plates) in vanilla JS/CSS with React, Vue, and Svelte wrappers. **MIT** (free tier) + Pro.

- Site: https://tactileui.dev
- Registry namespace **`@tactile`** → `https://tactileui.dev/r/{name}.json`, wired into [`../../components.shadcn.json`](../../components.shadcn.json) and the `shadcn` MCP (`mcp/shadcn/components.json`)
- Optional MCP (`https://tactileui.dev/mcp`, requires free OAuth sign-in) listed in `plugins/ui-libraries/mcp_config.optional.json`
- Grabbed 2026-11-24

## What's here
| Path | Contents |
| :--- | :--- |
| `registry.json` | Full 98-item Tactile UI catalog index |
| `free-registry.json` | 6 free MIT-licensed registry items |
| `r/` | Offline shadcn registry JSONs for all 6 free MIT items: `client-plates`, `compass`, `faq-drawer`, `machined-footer`, `odometer`, `pull-cord` |

## Use
```bash
npx shadcn@latest add @tactile/compass
npx shadcn@latest add @tactile/odometer
npx shadcn@latest add @tactile/pull-cord
# or standalone npm package for select objects:
npm install tactile-odometer
```
Offline: extract source files directly from `r/<name>.json`.
