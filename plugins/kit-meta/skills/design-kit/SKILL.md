---
name: design-kit
description: Router for Jason's design kit at ~/design-kit. Answers "what do I have for X" and "where is X" by mapping a need to the right plugin, skill, design system, golden hero-grab or SaaS reference, npm/component/motion library, shadcn registry, or MCP server. Use when the user asks what skills, libraries, design systems, references, fonts or MCPs are available, wants a golden reference screenshot pair, needs design tokens, or asks where something in the kit lives or how to add something to it. Don't use for actually choosing between UI libraries in depth (use pick-ui-library) or building UI (use the dev-pipeline skills).
---

# design-kit router

The kit lives at `/usr/local/google/home/jfesta/design-kit` (`~/design-kit/skills` is a flat symlink view of its skills).

1. Read `/usr/local/google/home/jfesta/design-kit/INDEX.md` first. Its "Quick lookups" table maps needs to paths.
2. Follow the path it gives:
   - **Design systems:** `design-systems/README.md`, `design-systems/registry.json`, `design-systems/google-systems/registry.json`
   - **Golden screenshot pairs:** `references/hero-grabs/<system>/` and `references/saas-goldens/examples/<app>/`. Read both the desktop and mobile images.
   - **Libraries:** `libraries/README.md` (summary), then `libraries/WDA_COMPONENT_AND_MOTION_LIBRARIES.md` (full matrix)
   - **MCP:** `mcp/README.md`
3. Answer with absolute paths and clickable links. When a plugin is relevant, name it, so the user knows which one must be enabled.

## Adding to the kit
- **Skill:** create `plugins/<plugin>/skills/<name>/SKILL.md`, then `ln -s ../plugins/<plugin>/skills/<name> skills/<name>`.
- **Subagent:** create `plugins/<plugin>/agents/<name>.md`.
- **MCP server:** add it to `plugins/<plugin>/mcp_config.json` (git-ignored) and to `mcp_config.example.json` with any secrets replaced by placeholders.
- **Reference assets:** put them under `references/` or `design-systems/`, and add a row to `INDEX.md`.
