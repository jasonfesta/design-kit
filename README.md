# design-kit

Jason Festa's single source of truth for design and frontend agent tooling: **installable Jetski plugins** (skills, subagents, MCP servers) plus the **design systems, golden references, and library catalogs** those skills read.

Every Jetski workspace loads it automatically through `~/.gemini/config/plugins.json` → `~/design-kit/plugins`. You can turn each plugin on or off in **Customizations**.

```text
~/design-kit/
├── INDEX.md          ← start here: "I need X" → where it lives
├── plugins/          ← INSTALLABLE (14 Jetski plugins: 501 skills, 29 agents, 16 MCP servers)
├── skills/           ← flat view: one symlink per skill (this is also ~/design-kit/skills)
├── design-systems/   ← WDA six, external six, Google ten, hero grabs (wda/design-systems links here)
├── references/       ← saas-goldens, plus shortcuts to hero-grabs, google-systems, external-systems
├── libraries/        ← npm / component / motion catalogs, shadcn registries, Golden Template starter
├── mcp/              ← MCP server notes (live configs are inside plugins, git-ignored)
├── rules/            ← links to the always-on global rules in ~/.gemini/config/rules
├── dist/             ← .skill / .zip builds (git-ignored)
└── _archive/         ← deprecated skills and legacy config
```

## Rules of the house
- **One real copy.** Edit skills under `plugins/<plugin>/skills/<name>/`. Everywhere else is a symlink.
- **New skill?** Put it in the right plugin's `skills/` folder, then add a flat link: `ln -s ../plugins/<plugin>/skills/<name> skills/<name>`. It goes live on the next reload.
- **Project-only skills** belong in that project's `.agents/skills/`, not here.
- **Secrets:** `plugins/*/mcp_config.json` is git-ignored. Commit `mcp_config.example.json` instead.
- **npm packages are per project.** Use `libraries/` for guidance and the starter `package.json`.

## Migration
Migrated on 2026-11-11 from `~/design-kit/skills`, `~/wda/.agents/skills`, `~/wda/skills` (copied, still git-tracked in WDA), `~/.gemini/config/{skills,agents}` and `~/wda/design-systems`. Backup: `~/design-kit-migration-backup-20261111.tar.gz`.
