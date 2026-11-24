# torph: offline package, demos & framework examples snapshot

Dependency-free animated text- and number-morphing library by Lochie Axon — vanilla JS/TS core (`torph`), React (`torph/react`), Vue 3 (`torph/vue`), and Svelte 5 (`torph/svelte`). Zero runtime dependencies, MIT.

- **Site:** https://torph.dev (also https://torph.lochie.me) · examples https://torph.dev/examples · playground https://torph.dev/playground
- **GitHub:** https://github.com/lochie/torph
- **npm package:** `torph@0.1.4` (https://www.npmjs.com/package/torph), unpacked in [`package/`](package/)
- **Agent skill:** [`plugins/motion-craft/skills/torph/SKILL.md`](../../../plugins/motion-craft/skills/torph/SKILL.md) (flat symlink: `skills/torph`)
- **Grabbed:** 2026-11-24

## What's here

| Path | Contents |
| :--- | :--- |
| `package/` | Full unpacked `torph@0.1.4` npm tarball (`dist/index.{mjs,js,d.ts}`, `dist/react/*`, `dist/vue/*`, `dist/svelte/*`, `package.json`, `README.md`, `LICENSE`) |
| `CHANGELOG.md` | Release history through `0.1.4` |
| `demos/` | All 25+ interactive demos from `torph.dev/examples` (`action`, `copy`, `number`, `numbers`, `rewrite`, `ticker`, `slider`, `chart`, `lists`, `elastic`, `gestures`, `resize`, `responsive`, etc.) |
| `examples/` | Minimal starter apps for `react-example`, `vue-example`, `svelte-example`, `svelte-ssr-example`, and `typescript-example` |

## Install in a project

```bash
npm install torph@latest
```

If a project cannot reach public npmjs.org (e.g. behind an internal mirror), reference the local MIT package directly:

```json
"torph": "file:/usr/local/google/home/jfesta/design-kit/libraries/sources/torph/package"
```

## Entry points & exports (`torph@0.1.4`)

| Import path | Exports |
| :--- | :--- |
| `torph` | `TextMorph`, `MorphController`, `DEFAULT_AS`, `DEFAULT_TEXT_MORPH_OPTIONS`, `segmentText`, `diffSegments`, `segmentNumber`, `isNumericWord`, `decimalSeparator` + types (`TextMorphOptions`, `SpringParams`, `Segment`, `NumberSegment`, `DiffOptions`, `DiffResult`) |
| `torph/react` | `TextMorph`, `useTextMorph`, `type TextMorphProps` |
| `torph/vue` | `TextMorph`, `type TextMorphProps` |
| `torph/svelte` | `TextMorph`, `type TextMorphProps` |

## Kit fit (`design-donts` / `design-kit-taste`)

- **Great fit:** Button state labels (`Copy` → `Copied`, `Save` → `Saving` → `Saved`), live KPI/price counters, status badges, tone/filter switchers, inline editable currency/numeric fields (`cursorIndex`), and multi-line text updates where continuity helps users track what changed.
- **Keep optical centering & tabular alignment:** Pair numeric `<TextMorph>` readouts with `tabular-nums` (`font-variant-numeric: tabular-nums`) when columns or neighbors shouldn't jitter, and preserve `-2px` optical vertical centering inside `<button>` elements.
- **Accessibility built in:** `TextMorph` maintains a plain-text screen-reader node (`aria-hidden` on split segments) and respects `prefers-reduced-motion` live by default (`respectReducedMotion: true`). Add `aria-live="polite"` on the parent when status updates should be announced.
- **Golden Template builds:** `torph` is opt-in (zero runtime deps; `react`/`react-dom`/`vue`/`svelte` are optional peer deps).

## Refresh

```bash
curl -sSL https://registry.npmjs.org/torph/-/torph-0.1.4.tgz -o /tmp/torph.tgz
rm -rf libraries/sources/torph/package && tar -xzf /tmp/torph.tgz -C libraries/sources/torph
git clone --depth 1 https://github.com/lochie/torph.git /tmp/torph-repo
cp /tmp/torph-repo/packages/torph/CHANGELOG.md libraries/sources/torph/CHANGELOG.md
rsync -a --delete /tmp/torph-repo/site/src/surfaces/demos/ libraries/sources/torph/demos/
rsync -a --delete /tmp/torph-repo/apps/ libraries/sources/torph/examples/
rm -rf /tmp/torph-repo /tmp/torph.tgz libraries/sources/torph/package/dist/.DS_Store
```
