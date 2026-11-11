# MCP servers

The live configs are inside the plugins. They're git-ignored because they can hold API keys. Each has a committed `mcp_config.example.json` next to it.

| Server | Plugin | Transport | Purpose |
| :--- | :--- | :--- | :--- |
| `21st` | ui-libraries | HTTP `https://21st.dev/api/mcp` (API key header) | 21st.dev component search, themes, video blocks |
| `originkit` | ui-libraries | HTTP `https://mcp.originkit.dev/mcp` | Originkit components |
| `shadcn` | ui-libraries | `npx -y shadcn@latest mcp` | shadcn registries (incl. `@fluid`, `@easeui`, `@kokonutui`, `@react-bits`, `@spectrumui`) |
| `spectrumui` | ui-libraries | `npx -y @spectrumui/mcp` | Spectrum UI components |
| `motion` | motion-craft | HTTP `https://mcp.motion.dev` | Motion docs search and component insertion |

These used to live in `~/wda/.agents/mcp_config.json`, which only applied to WDA. Now they're global whenever their plugin is enabled.

**Restoring on a new machine:** copy each `mcp_config.example.json` to `mcp_config.json` and fill in the keys.
