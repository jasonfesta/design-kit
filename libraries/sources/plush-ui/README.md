# plush (plush-ui)

Soft React components on shadcn + Radix, by Dominik Martin. **MIT** (font Open Runde: OFL-1.1, icons Hugeicons: MIT).

- Site: https://plush-ui.pages.dev · Repo: https://github.com/dominikmartn/plush-ui
- Registry namespace **`@plush`**, wired into [`../../components.shadcn.json`](../../components.shadcn.json) and the `shadcn` MCP (`mcp/shadcn/components.json`)
- Grabbed 2026-11-11

## What's here
| Path | Contents |
| :--- | :--- |
| `source/` | Full repo (no `.git` / `node_modules`): `components/ui/*.tsx` (23 components), `components/site/` (bento demo + catalog), `registry/tokens/tokens.css`, `scripts/build-registry.mjs`, Next 16 site |
| `r/` | Built registry JSON for all 23 components + `tokens.json` (offline copy of `https://plush-ui.pages.dev/r/<name>.json`) |
| `screens/og.png` | Official preview image |
| `screens/site-snapshot.html` | Saved homepage HTML (the bento of live demos) |

## Components (23)
accordion · avatar · badge · button · calendar · checkbox · counter (rolling digits) · dialog · input · input-otp · progress · progress-ring · radio-group · rating (emoji scale) · select · slider · sonner · steps · switch · tabs · toggle · toggle-group · tooltip

## Look
- **Light only** (dark is a `.dark {}` block with the same names, not shipped yet). Warm off-white surfaces `#fbfbfa` → `#ffffff`, ink `#141414`, **black accent** buttons, soft gradient sheen, generous radii, pillowy press states.
- Type: SF Pro Rounded, with **Open Runde** as the fallback (rounded, non-Material). The demos use a "split the bill with friends" story.
- Every token is prefixed `--plush-*`, so renaming means one search-and-replace.
- Passes the design-kit don'ts linter (no purple, no Material fonts, not dark-default).

## Use
```bash
npx shadcn@latest add @plush/switch          # or the full URL https://plush-ui.pages.dev/r/switch.json
```
Needs React + Tailwind v4 + shadcn. Dependencies pulled in: `radix-ui`, `cn`, `@hugeicons/react`, `@hugeicons/core-free-icons` (+ `react-day-picker`, `date-fns`, `input-otp`, `sonner` for those components).

**Golden Template builds:** those deps aren't in the locked list. Copy the `.tsx` from `source/components/ui/` and the needed vars from `registry/tokens/tokens.css`, swap Hugeicons for `lucide-react` and `cn` for `@/utils/cn`, and replace Radix with native elements (`<dialog>`, `popover`, `<input type="checkbox">`). Use `library-finder` to decide.
