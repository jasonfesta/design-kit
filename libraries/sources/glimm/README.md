# glimm: offline package, docs & skill snapshot

WebGL **sweep transitions** for the web by Noman Ijaz — framework-agnostic core (`glimm`), React adapter (`glimm/react`), Next.js App Router adapter (`glimm/next`), and container-level `GlimmScope` (HTML-in-Canvas bend + fallback sweep). Zero runtime dependencies, ~11 KB, **MIT**.

- **Site:** https://glimm.dev · changelog https://glimm.dev/changelog
- **npm package:** `glimm@0.4.1` (https://www.npmjs.com/package/glimm), unpacked in [`package/`](package/)
- **Skill repo:** https://github.com/nomanjack/glimm-skill (`npx skills add nomanjack/glimm-skill`)
- **Agent skill:** [`plugins/motion-craft/skills/glimm/SKILL.md`](../../../plugins/motion-craft/skills/glimm/SKILL.md) (flat symlink: `skills/glimm`)
- **Grabbed:** 2026-11-24

## What's here

| Path | Contents |
| :--- | :--- |
| `package/` | Full unpacked `glimm@0.4.1` npm tarball (`dist/index.js`, `dist/react.js`, `dist/next.js`, full `.d.ts` definitions, `README.md`, `CHANGELOG.md`, `LICENSE`) |
| `llms.txt` | Official `https://glimm.dev/llms.txt` index |
| `llms-full.txt` | Official `https://glimm.dev/llms-full.txt` complete reference |

## Install in a project

```bash
npm install glimm@latest
```

If a project cannot reach public npmjs.org (e.g. behind an internal mirror that doesn't yet mirror `glimm`), reference the local MIT package directly:

```json
"glimm": "file:/usr/local/google/home/jfesta/design-kit/libraries/sources/glimm/package"
```

## Kit fit (`design-donts` / `design-kit-taste`)

- **Palette rule (no purple):** `glimm`'s built-in `prism` and `azure` presets contain violet/purple stops, and the upstream skill's `accentChain` example uses `#7C3AED`. In design-kit / WDA builds, pick a non-purple preset (`lagoon`, `citrus`, `ember`, `berry`) or pass non-purple brand stops to `accentChain(['#...', '#...'])`.
- **Use with restraint:** Best for marketing sites, portfolios, launches, editorial chapters, or a rare high-signal in-app milestone (`GlimmScope` / `sweep()`). Avoid sweeping every sidebar click in dashboards or data tables; opt out high-frequency links with `data-glimm-skip`.
- **Golden Template builds:** `glimm` is opt-in (zero runtime deps; `react` / `next` are optional peers).

## Refresh

```bash
git clone --depth 1 https://github.com/nomanjack/glimm-skill /tmp/glimm-skill
rsync -a --delete /tmp/glimm-skill/skills/glimm/ plugins/motion-craft/skills/glimm/
cp /tmp/glimm-skill/LICENSE plugins/motion-craft/skills/glimm/LICENSE
curl -sL https://glimm.dev/llms.txt -o libraries/sources/glimm/llms.txt
curl -sL https://glimm.dev/llms-full.txt -o libraries/sources/glimm/llms-full.txt
```
