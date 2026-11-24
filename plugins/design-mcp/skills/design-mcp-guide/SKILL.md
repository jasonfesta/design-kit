---
name: design-mcp-guide
description: Picks the right MCP server in Jason's design kit for a design or frontend task — component registries (21st, shadcn, Magic UI, Spectrum UI), Motion docs, library docs (Context7, DeepWiki, Tailwind, Three.js, Google Fonts repo), Iconify icons, color/contrast/palette tools, Excalidraw diagrams, and browser QA (Chrome DevTools, Playwright). Use when deciding which MCP tool to call, when an MCP tool you expect is missing, or when enabling an optional server (Figma, Refero, LottieFiles, Framer, Originkit). Don't use for choosing npm libraries (use pick-ui-library) or ranking fonts by mood (use google-font-selection).
---

# Design MCP guide

All servers are configured in plugin `mcp_config.json` files under
`~/design-kit/plugins/`. Full table, test status, and restore steps:
`~/design-kit/mcp/README.md`.

## Which server for what

| Need | Server (plugin) | Start with |
| :--- | :--- | :--- |
| Find a ready-made React component | `shadcn` (ui-libraries) | `search_items_in_registries` across `@shadcn @magicui @aceternity @kokonutui @react-bits @spectrumui @fluid @easeui`, then `get_add_command_for_items` |
| Animated marketing components | `magicui` (ui-libraries) | `searchRegistryItems` → `getRegistryItem` |
| Spectrum UI blocks | `spectrumui` (ui-libraries) | `search_components` |
| 21st.dev components, themes, logos, inspiration | `21st` (ui-libraries) | `search`, `get_inspiration`, `search_logo` |
| Motion (Framer Motion) API and examples | `motion` (motion-craft) | `search-motion-docs` |
| Up-to-date docs for any npm library | `context7` (design-mcp) | `resolve-library-id` → `query-docs` |
| How a GitHub repo works | `deepwiki` (design-mcp) | `ask_wiki_question` with `owner/repo` |
| Tailwind v4 utilities and config | `tailwind-docs` (design-mcp) | `search_tailwindcss_com_docs` |
| Three.js classes, materials, examples | `threejs-docs` (design-mcp) | `search_threejs_documentation` |
| Google Fonts METADATA, axes, licensing | `google-fonts-docs` (design-mcp) | `search_fonts_code` (ranking by mood stays with the `google-font-selection` skill) |
| Icons as SVG / React | `iconify` (design-mcp) | `search_icons` → `get_icon` (check per-collection license) |
| Convert colors, WCAG contrast, harmonies, gradients | `color` (design-mcp) | `contrast_check` (`color1`, `color2`), `palette_generate` |
| 50–900 brand scales, Tailwind/CSS export | `palette` (design-mcp) | `generate_palette` (`brandColor`), `validate_accessibility` |
| Real iOS app screens, flows, onboarding, paywalls (with revenue context) | `appllama` (design-mcp) | Needs an OAuth sign-in with an Appllama Pro account; if its tools are missing, ask the user to sign in |
| Flow diagrams, wireframes, architecture sketches | `excalidraw` (design-mcp) | `read_me` first, then `create_view` |
| Screenshot, CSS inspection, Lighthouse, perf traces | `chrome-devtools` (design-mcp) | `new_page` → `take_screenshot` (pass `pageId`) / `lighthouse_audit` |
| Scripted click-through, responsive checks, a11y snapshot | `playwright` (design-mcp) | `browser_navigate` → `browser_resize` → `browser_take_screenshot` |

Rules of thumb:

- Registry first, hand-build second: search `shadcn` registries before
  writing a component from scratch.
- Docs servers beat memory: use `context7` / `tailwind-docs` /
  `threejs-docs` / `motion` before relying on recalled APIs.
- For design QA on a local build, prefer `chrome-devtools` for one-off
  screenshots and Lighthouse, `playwright` for multi-step flows. Both run
  headless system Chrome with an isolated profile; Playwright writes
  artifacts to `/tmp/playwright-mcp`.

## Optional servers (not loaded)
- **palletism** (needs a free `plt_` key): taste packs for AI image art direction (palette hex, font pairs, exact prompts, dos/don'ts). Use `match_taste` with the project's theme colors + a one-line product description to pick a pack. Reference: `references/inspiration/palletism.md`.

`plugins/design-mcp/mcp_config.optional.json` and
`plugins/ui-libraries/mcp_config.optional.json` hold servers that need a
local app or a credential: `figma-desktop` (Figma desktop app, Dev Mode MCP
toggled on, `http://127.0.0.1:3845/mcp`), `figma`, `refero`, `lottiefiles`,
`framer`, `excalidraw-plus`, `originkit`, and `google-fonts` (needs `uvx`).
To enable one, fill the key, move the entry into that plugin's
`mcp_config.json`, and ask the user to reload.

## If a server is missing

Agents cannot reload MCP servers. Ask the user to toggle the plugin off and
on in **Customizations → Plugins** (or restart Jetski), then check
**… → MCP Servers**. Stdio servers use the absolute
`~/.gemini/jetski/bin/npx` because Jetski's PATH has no Node.
