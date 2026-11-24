---
name: design-kit
description: Router for Jason's design kit at ~/design-kit. Answers "what do I have for X" and "where is X" by mapping a need to the right plugin, skill, design system (6 WDA, 20 Google, 18 external), golden hero-grab or SaaS reference, inspiration source, library catalog, local component kit (designme, plush), shadcn registry, MCP server, rule, or local runtime. Use when the user asks what skills, libraries, design systems, references, fonts or MCPs are available, wants a golden reference screenshot pair, needs design tokens, or asks where something lives or how to add something to it. Hand off to library-finder to actually choose a library, and to the dev-pipeline skills to build UI.
---

# design-kit router

The kit lives at `/usr/local/google/home/jfesta/design-kit`. `~/design-kit/skills/` is a flat symlink view of all 501 skills across 14 plugins.

1. **Read `/usr/local/google/home/jfesta/design-kit/INDEX.md` first.** Its plugin tables and "Quick lookups" map needs to paths.
2. Follow the path it gives:

| Need | Go to |
| :--- | :--- |
| Choose a library or component | **`library-finder` skill** (checks the catalogs, local kits and registries, then searches) |
| Library catalogs | `libraries/README.md` → `ui-primitives.md`, `motion.md`, `3d.md`, `icons.md`, `fonts.md`, `WDA_COMPONENT_AND_MOTION_LIBRARIES.md` |
| Installed library stacks | `libraries/stacks/palermo/` (Radix, cmdk, NumberFlow, Video.js 10, hls.js, Tailwind v4 + playground) |
| Local component kits (full source) | `libraries/sources/designme/` (125 agent-UI, React-only) · `libraries/sources/plush-ui/` (23 soft controls) |
| shadcn registries | `libraries/components.shadcn.json` (`@designme @plush @fluid @easeui @kokonutui @react-bits @spectrumui`), plus `@magicui @aceternity` in the `shadcn` MCP |
| Design systems | `design-systems/README.md` (WDA six) · `design-systems/google-systems/` (20, registry.json) · `design-systems/external-systems/` (18 + Palermo reference) |
| Golden screenshot pairs | `references/hero-grabs/<system>/` and `references/saas-goldens/examples/<app>/` (read both desktop and mobile) |
| Matched references for a prompt | `reference-mining` skill (Iris + GCC filtering) |
| Inspiration | `references/inspiration/README.md` (30 sources: affectUI, whitespace, Emil, Rauno, Paco, Godly, Mobbin…) |
| Fonts / colors for a prompt or build | `font-enricher` / `color-enricher` skills |
| Don'ts + linter | `design-donts` skill (`donts.json`, `scripts/lint_donts.py`) · rule `rules/design-kit-taste.md` |
| MCP servers | `mcp/README.md` (16 live, how to reload, `probe_all.py`) · `design-mcp-guide` skill |
| Video of animated UI cards | `bento-ui-motion-grid` skill + `tools/bin/bento-grid` |
| Local runtimes (Playwright, Pillow, numpy, headless Chromium) | `tools/README.md` |
| Imported skill packs and credits | `skills/CREDITS.md`; plugins `design-craft`, `platform-design`, `design-tooling`, `ux-content`, `web-effects`, `threejs-games` |

3. Answer with absolute paths and clickable links. When a plugin is relevant, name it, so the user knows which one must be enabled.

## Adding to the kit
- **Skill:** create `plugins/<plugin>/skills/<name>/SKILL.md` (frontmatter `name` = folder), then `ln -s ../plugins/<plugin>/skills/<name> skills/<name>`. Add a row to `INDEX.md`, and to `skills/CREDITS.md` if it's third-party.
- **Subagent:** create `plugins/<plugin>/agents/<name>.md`.
- **MCP server:** add it to `plugins/<plugin>/mcp_config.json` (git-ignored) and to `mcp_config.example.json` with secrets replaced by placeholders. Use absolute `npx` paths (`~/.gemini/jetski/bin/npx`). Test with `mcp/probe.py`.
- **Library:** add a row to the right `libraries/*.md`. If it's a shadcn registry, register the namespace in `libraries/components.shadcn.json` and `mcp/shadcn/components.json`.
- **Whole component kit ("grab it"):** clone into `libraries/sources/<name>/source/` (no `.git`), add a `README.md` (what it is, license, components, use, don'ts check), and link it from `libraries/README.md`, `ui-primitives.md`, `library-finder` and `INDEX.md`.
- **Reference assets:** put them under `references/` or `design-systems/`, and add a row to `INDEX.md`.
- **New don'ts:** use the `design-donts` intake (edit `donts.json`, then log it in `rules/design-kit-taste.md` §5).
