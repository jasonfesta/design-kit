# MCP servers

Live configs sit inside the plugins as `plugins/<plugin>/mcp_config.json`.
They're git-ignored because they can hold API keys. Next to each one:

- `mcp_config.example.json` (committed): the same servers with key placeholders.
- `mcp_config.optional.json` (committed, **not loaded by Jetski**): servers
  that need a local app or a credential. Move an entry into
  `mcp_config.json` once you've met its prerequisite.

Jetski registers plugin servers as `<plugin>_<server>` (for example
`design-mcp_context7`). Which server to use for what:
[`design-mcp-guide`](../plugins/design-mcp/skills/design-mcp-guide/SKILL.md).

## Live servers

Status: handshake test (`initialize` → `tools/list`) on 2026-11-11, run
with Jetski's minimal PATH, plus confirmed registered in
`~/.gemini/jetski/mcp/`. Every server below passed.

| Server | Plugin | Transport | Auth | Tools | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `21st` | ui-libraries | HTTP `https://21st.dev/api/mcp` | `x-api-key` header | 51 | 21st.dev components, themes, logos, inspiration, video blocks |
| `shadcn` | ui-libraries | stdio `shadcn@latest mcp`, run from `mcp/shadcn/` | none | 7 | Search and install from 12 shadcn registries: `@shadcn @magicui @aceternity @coss @kibo-ui @tactile @kokonutui @react-bits @spectrumui @fluid @easeui @plush @designme` |
| `spectrumui` | ui-libraries | stdio `@spectrumui/mcp` | none | 5 | Spectrum UI components |
| `magicui` | ui-libraries | stdio `@magicuidesign/mcp@latest` | none | 3 | Magic UI animated components |
| `motion` | motion-craft | HTTP `https://mcp.motion.dev` | none | 2 | Motion docs search and component insertion |
| `context7` | design-mcp | HTTP `https://mcp.context7.com/mcp` | none (optional key raises rate limits) | 2 | Current docs for any library |
| `deepwiki` | design-mcp | HTTP `https://mcp.deepwiki.com/mcp` | none | 3 | Q&A over any public GitHub repo |
| `tailwind-docs` | design-mcp | HTTP `https://gitmcp.io/tailwindlabs/tailwindcss.com` | none | 4 | Tailwind docs |
| `threejs-docs` | design-mcp | HTTP `https://gitmcp.io/mrdoob/three.js` | none | 5 | Three.js docs and examples |
| `google-fonts-docs` | design-mcp | HTTP `https://gitmcp.io/google/fonts` | none | 4 | google/fonts repo: METADATA, axes, licenses |
| `iconify` | design-mcp | stdio `@sohampatwardhan/iconify-mcp` | none | 5 | Search 200k+ Iconify icons, SVG and preview sheets |
| `color` | design-mcp | stdio `@rog0x/mcp-color-tools` | none | 5 | Color conversion, WCAG contrast, harmonies, mixing, gradients |
| `palette` | design-mcp | stdio `color-palette-mcp` | none | 6 | 50–900 scales from a brand color, a11y validation, Tailwind/CSS export |
| `excalidraw` | design-mcp | HTTP `https://mcp.excalidraw.com/mcp` | none | 5 | Diagrams, wireframes, flow sketches |
| `chrome-devtools` | design-mcp | stdio `chrome-devtools-mcp@latest --headless --isolated` | none | 33 | Screenshots, CSS inspection, Lighthouse, perf traces (system Chrome) |
| `playwright` | design-mcp | stdio `@playwright/mcp@latest --headless --browser chrome --isolated` | none | 25 | Scripted flows, responsive checks, a11y snapshots; output in `/tmp/playwright-mcp` |

Added 2026-11-13, **not yet signed in**:

| Server | Plugin | Transport | Auth | Tools | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `appllama` | design-mcp | HTTP `https://mcp.appllama.io/mcp` | OAuth sign-in with an Appllama Pro account (no static key) | unknown until signed in | Screens, flows, onboarding and paywalls from top-grossing iOS apps, with revenue and download context |

Probe result without a session: 401 `invalid_token` "Authentication
required" (endpoint up). If Jetski's plugin sign-in flow can't complete
the OAuth step, move the entry to `mcp_config.optional.json`.

Every stdio server is launched as
`/usr/local/google/home/jfesta/.gemini/jetski/bin/npx -y <pkg>` with
`env.PATH` set to `~/.gemini/jetski/bin:/usr/local/bin:/usr/bin:/bin`.
Those `npx`/`node` entries are symlinks into
`~/design-agents/.tools/node/bin`; if that folder moves, update the paths.

## Optional servers (not loaded)

| Server | File | Needs | Test result |
| :--- | :--- | :--- | :--- |
| `originkit` | ui-libraries `mcp_config.optional.json` | Originkit API key as `Authorization: Bearer` (or OAuth) | 401 "Authentication required" |
| `tactile` | ui-libraries `mcp_config.optional.json` | Free Tactile UI OAuth sign-in (`https://tactileui.dev/mcp`) | 401 "Sign in to use the Tactile UI MCP" (free MIT items already work via `@tactile` shadcn registry) |
| `palletism` | design-mcp `mcp_config.optional.json` | Free key (`plt_…`) from https://palletism.art/profile/mcp (sign in) as `Authorization: Bearer`; 200 counted calls/day free | 401 without key (endpoint up, streamable HTTP, 8 tools + 1 prompt per docs) |
| `figma-desktop` | design-mcp `mcp_config.optional.json` | Figma desktop app running on the same machine with Dev Mode MCP server on (`http://127.0.0.1:3845/mcp`). Doesn't work on a cloudtop | connection refused (no local Figma) |
| `figma` | design-mcp | Figma OAuth (remote `https://mcp.figma.com/mcp`) | 401 |
| `refero` | design-mcp | Refero Pro token / OAuth | 401 |
| `lottiefiles` | design-mcp | LottieFiles bearer token | 401 |
| `framer` | design-mcp | Framer bearer token | 401 |
| `excalidraw-plus` | design-mcp | Excalidraw+ API key | not tested (needs key) |
| `google-fonts` | design-mcp | `uvx` (from uv), PyPI `google-fonts-mcp` (sliday) | not tested: no `uv`, and `python3 -m venv` lacks ensurepip here |

Considered and skipped: npm `google-fonts-mcp` (published from an unrelated
"awesome-servers" repo and hung on start), Aceternity MCP (covered by the
`@aceternity` shadcn registry), Storybook MCP (needs a running Storybook
per project), Spline, Mobbin, Fontsource, Rive (no usable public MCP).

## Why originkit, shadcn and spectrumui used to fail

- **shadcn, spectrumui:** the hub log
  (`/usr/local/google/tmp/jetski-hub-server.*`) showed
  `exec: "npx": executable file not found in $PATH`. Jetski's PATH is
  `/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`, and Node
  only exists at `~/.gemini/jetski/bin`. Fixed with an absolute `command`
  and an `env.PATH`.
- **shadcn registries:** `shadcn mcp` reads `components.json` from its
  working directory, and Jetski starts plugin servers in the plugin folder,
  which has no `components.json`. It now runs through
  `/bin/sh -c "cd ~/design-kit/mcp/shadcn && exec npx -y shadcn@latest mcp"`.
  [`mcp/shadcn/components.json`](shadcn/components.json) is
  `libraries/components.shadcn.json` plus `@magicui` and `@aceternity`.
- **originkit:** the endpoint is up but returns 401. It needs an API key
  or OAuth, so it's moved to `mcp_config.optional.json`.
- The config schema was fine: `url` (or `serverUrl`) for HTTP, and
  `command`/`args`/`env` for stdio. No `type` field is needed.

## Reloading (you have to do this, not an agent)

Agents can't restart MCP servers. After you edit any `mcp_config.json`:

1. Open **Customizations → Plugins** and toggle the plugin (`ui-libraries`,
   `motion-craft` or `design-mcp`) off, then on. Takes effect live. If
   servers still don't show up, restart Jetski.
2. Check **… (Additional options) → MCP Servers**, or
   `ls ~/.gemini/jetski/mcp/`. You should see one folder per server
   (`design-mcp_context7`, `ui-libraries_shadcn`, and so on).
3. New stdio servers run `npx -y` on first start, so the first load can
   take 10–60 seconds.

## Testing

```bash
python3 ~/design-kit/mcp/probe_all.py      # every live server, parallel
python3 ~/design-kit/mcp/probe.py http https://mcp.context7.com/mcp
PROBE_PATH=/usr/bin:/bin python3 ~/design-kit/mcp/probe.py stdio / \
  ~/.gemini/jetski/bin/npx -y @spectrumui/mcp
```

`probe.py` sends a `User-Agent`, because Cloudflare-fronted servers like
motion and originkit return 403 (error 1010) to Python's default one. Set
`PROBE_CALLS='[{"name":"tool","arguments":{}}]'` to also call tools over
stdio.

## Restoring on a new machine

1. Install Node so that `~/.gemini/jetski/bin/npx` exists, or change the
   `command` paths.
2. For each plugin, copy `mcp_config.example.json` to `mcp_config.json`
   and fill in the keys (only `21st` needs one today).
3. Install Google Chrome (`/usr/bin/google-chrome`) for `chrome-devtools`
   and `playwright`.
4. Make sure `~/.gemini/config/plugins.json` lists
   `~/design-kit/plugins`, then reload as described above.

These servers used to live in `~/wda/.agents/mcp_config.json`, which only
applied to WDA. Now they're global whenever their plugin is enabled.

> Note: `~/.gemini/config/mcp_config.json` (global, outside this repo) also
> defines `21st` and `originkit`. That duplicates `ui-libraries_21st`, and
> originkit fails there with the same 401. Remove both entries there to
> avoid duplicate tools.
