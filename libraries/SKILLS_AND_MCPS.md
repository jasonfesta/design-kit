# WDA: Skills & MCP Registry

The list of every **skill** and **MCP server** the WDA pipeline uses, plus the outside component and design-system sources we pull from.
Skills and MCPs are kept in separate sections. Add new sources to the right section as they come in.

_Last updated: 2026-11-10 (installed 6 External Design Systems — `Twenty CRM`, `Midday`, `Plane`, `Shadcnblocks`, `Vercel Geist`, `Liveblocks` — plus `Motion AI Kit` in `design-systems/external-systems/` mapped to WDA Prompts `#01`–`#10`, alongside the Six Interactive Design Systems in `design-systems/`)_

---

## Part 1: Skills

### 1A. Workspace skills (`wda/skills/`)

Canonical folder for WDA and moodboard skills. Details are in [`skills/README.md`](./skills/README.md).

| # | Skill | Path | Role |
| :- | :--- | :--- | :--- |
| 1 | `benchmark-interaction-planner` | [`skills/benchmark-interaction-planner/SKILL.md`](./skills/benchmark-interaction-planner/SKILL.md) | Checks the source geometry (5:3 4K sheet, or desktop + mobile scrolls), maps 5–10 competitor benchmark URLs, and writes `INTERACTION_PLAN.md`. |
| 2 | `replicate-mock` | [`skills/replicate-mock/SKILL.md`](./skills/replicate-mock/SKILL.md) | Pixel-perfect mock replication: sampled hex tokens, bit-for-bit image crops, exact copy, vector SVGs. |
| 3 | `image-to-react` | [`skills/image-to-react/SKILL.md`](./skills/image-to-react/SKILL.md) | Turns an image into a Golden Template React app, with 2x Retina plates, a 60fps media frame, and a closed-loop WebKit2GTK visual eval. |
| 4 | `react-extractor` | [`skills/react-extractor/SKILL.md`](./skills/react-extractor/SKILL.md) | Image-to-React or study-to-React: builds the 3-tier React 19 + TS modules (data / components / App). |
| 5 | `golden-template-extractor` | [`skills/golden-template-extractor/SKILL.md`](./skills/golden-template-extractor/SKILL.md) | Keeps root configs matching the `dating` blueprint byte-for-byte, runs strict `tsc`, and lints nomenclature. |
| 6 | `local-build-preview` | [`skills/local-build-preview/SKILL.md`](./skills/local-build-preview/SKILL.md) | Builds a single-file `dist/index.html` locally and shows it in the right-hand Artifact Pane. No x20 unless asked. |
| 7 | `warmup` | [`skills/warmup/SKILL.md`](./skills/warmup/SKILL.md) | Pre-bench / post-bench frontier-model comparison and a 100-point tear-apart eval. |
| 8 | `responsive-dual-eval` | [`skills/responsive-dual-eval/SKILL.md`](./skills/responsive-dual-eval/SKILL.md) | Desktop + mobile reference eval plus a 6-viewport continuum sweep (320 → desktop). |
| 9 | `fluid-functionalism` | [`fluid-functionalism/skills/fluid-functionalism/SKILL.md`](./fluid-functionalism/skills/fluid-functionalism/SKILL.md) | Builds React UIs with the `@fluid` registry and its shared spring motion system. This one ships inside the Fluid repo, not in `skills/`. |
| 10 | `design-system-creation` | [`skills/design-system-creation/SKILL.md`](./skills/design-system-creation/SKILL.md) | Designs and verifies bespoke product, application, and marketing design systems across 6 non-generic archetypes (`Switchyard`, `Ledgermark`, `Civicgate`, `Fieldrig`, `Folio Archive`, `Wardline`) with two-layer OKLCH tokens, light/dark polarity, compact/comfortable density, offline WOFF2 fonts, 27+ interactive product component states, 6 marketing/media component chapters per system, and `verify_design_system.py`. |
| 11 | `product-design-system` | [`skills/product-design-system/SKILL.md`](./skills/product-design-system/SKILL.md) | Focused product workspace, token foundation, and 5-pattern interactive product component specimen builder (`#workspace`, `#tokens`, `#components`). |
| 12 | `motion` | [`skills/motion/SKILL.md`](./skills/motion/SKILL.md) · [`.agents/skills/motion/SKILL.md`](./.agents/skills/motion/SKILL.md) · [`motion-ai-kit/`](./motion-ai-kit/README.md) | Animation skill for Motion (`motion.dev`, `motion/react`) and CSS `linear()` springs: platform-specific best practices, documentation/example search, CSS spring & bounce generation, MotionScore (`S–F`) performance audits (`motion-reviewer` agent), and transition preview. |
| 13 | `stageshow` | [`.agents/skills/stageshow/SKILL.md`](./.agents/skills/stageshow/SKILL.md) · [`stageshow/`](./stageshow/README.md) | Benji Taylor's (`benji.org/stageshow`, `benjitaylor/skills`) faux-product UI, bento grid, and cursor-demo skill + React/CSS kit (`Stage`, `Window`, `Phone`, `Act`, `film.mjs` contact-sheet rehearsal gate, and 72 gold scenes & product studies). |

### 1B. Global Jetski skills (`~/design-kit/plugins`, loaded via `~/.gemini/config/plugins.json`)

Loaded in every workspace. Grouped by pipeline.

**Design pipeline (`jason-design-agent`)**

| Skill | Role |
| :--- | :--- |
| `jason-design-agent` | Coordinator: research → fonts → pre-Nano critique → Nano Banana plates → moodboard. |
| `research` | 5 standout benchmarks that each give a visibly different, non-beige result. |
| `style-direction` | Turns benchmarks into named art directions, palettes, `canon.md`, and `coverage.md`. |
| `concept-art` | Prompt-to-concept-plate pipeline with the critique swarm and designer checkpoint. |
| `image-gen` | Tri-voice prompts and image-to-image 2K Nano Banana plates (3-round cap). |
| `polish` | Research-driven, targeted refinement in rounds 2–3. |
| `eval` | 6-gate concept-plate audit (coherence, originality, canon, geometry, distinctness, budget). |
| `design-critique` | Brutal critique from 3 perspectives, run by a 10–15 agent swarm. |
| `design-flywheel` | Self-improving loop of up to 5 iterations on type, color, and touts. |
| `nanofy` | Takes in plates from outside the harness and re-outputs them through Nano Banana. |
| `google-font-selection` | Ranks the live Google Fonts catalog for a mood, brief, or image. |
| `taxonomy` | Classifies prompts and builds into the WDA Silvers taxonomy. |

**Dev pipeline (`jason-dev-agent`)**

| Skill | Role |
| :--- | :--- |
| `jason-dev-agent` | 8-step frontend coordinator, paired with the design agent. |
| `replicate-mock` | Blueprint, hex tokens, and the 3-bucket asset split. |
| `font-pairing` | Primary / secondary / tertiary type system and modular scale. |
| `image-to-react` | Builds the Golden Template DOM and checks the visual match. |
| `nano-banana` | 2x Retina upscaling for the upscale-queue bucket only. |
| `accessibility` | WCAG 2.2 contrast, sizing, focus, names, and alt text. |
| `responsiveness` | One DOM, 6-viewport continuum. |
| `interaction` | No dead controls: sliders, pagination, scroll triggers. |
| `feel` | 60fps scroll, tactile press, GPU motion, reduced motion. |
| `golden-template` | `dating` blueprint scaffold, lint, and package. |
| `clean-up` | **Pre-linter before `golden-template`.** One skill, one script: strips any generated artifact to one injectable prompt plus one pure-React `App.tsx` (imports only `react`), enforces Google / React Native safe naming as a hard gate, and builds an esbuild preview, in about 0.15 s. Run: `python3 ~/design-kit/skills/clean-up/scripts/clean_up.py page.html --name slug [--fix]`. |
| `warmup` | Multi-model image-to-React benchmark. |
| `skill-maker` | Validates, wraps, and catalogs skills. |

**3D / game / photoreal**

`image-to-working-model`, `photoreal-game-turing-loop`, `declarative-photoreal-threejs-worlds`,
`arch-camera-matching-and-perspective`, `arch-daylight-and-interior-glow`, `arch-materials-and-weathering`, `arch-site-foliage-and-atmosphere`, `arch-turing-test-loop`,
`car-camera-matching-and-blueprints`, `car-class-a-surfacing-and-proportions`, `car-paint-glazing-and-lamp-optics`, `car-studio-scrims-and-env-lighting`, `car-turing-test-and-blueprint-loop`,
`game-concept-and-toy-first`, `game-deterministic-sim-core`, `game-fun-and-balance-ratchet`, `game-procedural-3d-and-cutaway`, `game-text-score-audio-and-juice`, `game-arena-multiplayer-and-quests`.

**Shared tools** (`~/.gemini/shared/`): `generate_video_veo`.

### 1C. Outside skill sources

| Source | What it is | How we use it |
| :--- | :--- | :--- |
| **Libraries.dev agent skill** ([libraries.dev/skill](https://libraries.dev/skill)) | Agent skill that teaches all 7 Libraries.dev AI-effect packages and where each one fits. It includes placement rules, for example no effect for waits under 2 s and Thinking Orbs for waits of 2 s or more. | Install with `npx libraries-dev skill` or `npx skills add Jakubantalik/Libraries.dev`. **Not installed yet.** Reference docs: https://libraries.dev/llms-full.txt |
| **TypeUI** ([typeui.sh](https://www.typeui.sh)) | Open-source CLI (`npx typeui.sh`, npm `typeui.sh@0.7.1`) that generates design-system specs and style guides as **skill files** for AI coding agents. It also has a registry of curated design systems and brand kits. | Generates or pulls design-system skill files so agents keep to the locked tokens, type, and spacing. **It is a skill generator, not an MCP server.** Not installed yet. The site sits behind a Vercel security checkpoint, so read it in the browser. |

---

## Part 2: MCP servers

Config: [`.agents/mcp_config.json`](./.agents/mcp_config.json). This file is **gitignored** because it holds API keys. Never commit it.

| Server | Transport / endpoint | Status | What it gives us |
| :--- | :--- | :--- | :--- |
| `21st` | HTTP `https://21st.dev/api/mcp` (header `x-api-key`) | ✅ Active, 52 tools | 21st.dev component search, `get_component`, themes, inspiration, logo search, bookmarks and lists, generations/takes, video-block ops. |
| `originkit` | HTTP `https://mcp.originkit.dev/mcp` | ⚙️ Configured | Originkit animated components (text effects, particles, carousels) as drop-in React/Vite/Tailwind source. A free API key may be needed (originkit.dev → Settings → API Integration). |
| `shadcn` | stdio `npx -y shadcn@latest mcp` | ✅ **Added 2026-11-04, handshake verified** | Browses, searches, views, and installs items from every registry in [`components.json`](./components.json), including **Kokonut UI** (`@kokonutui`). Tools: `get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist`. |
| `spectrumui` | stdio `npx -y @spectrumui/mcp` (npm `@spectrumui/mcp@0.1.1`) | ✅ **Added 2026-11-04, handshake verified** | Spectrum UI's own MCP. Tools: `list_components`, `search_components`, `get_component`, `list_categories`, `install_component`. The same catalog is also reachable through `shadcn` → `@spectrumui`. |
| `motion` | HTTP `https://mcp.motion.dev` | ✅ **Added 2026-11-11, handshake verified** | Official Motion AI Kit MCP server (no API key required). Tools: `search-motion-docs` (`js`, `react`, `vue`), `insert-motion-component` (plus MCP App `ui://motion/insert-panel`), and `resources/read` for `motion://docs/{platform}/{id}`, `motion://examples/{platform}/{id}`, and `motion://ui/react/{id}`. (`https://mcp.motion.dev/plus` available with OAuth sign-in for Motion+ members: `search-motion-source`, `insert-motion-plus-component`, `generate-css-easing`, `open-transition-editor`, `open-performance-report`, `motion://skills/performance-audit`.) |
| `podi` (podi.dev / "podi.mcp") | — | ❓ **Unresolved** | `podi.dev` and `mcp.podi.dev` only serve a default Apache page and `/mcp` returns 404. No public MCP was found. Needs the exact URL or install command. |

> [!NOTE]
> Restart Jetski or reload MCP servers to pick up the new `shadcn` server. Run it from the WDA root so it reads `components.json`.

---

## Part 3: Component registries (MCP-backed)

### ⭐ Full local access: shadcn/ui + Fluid Functionalism + Six Interactive Design Systems

We have the **complete source** for all of these in WDA, not just a registry link.

| Library | Where it lives locally | Registry / Index | Notes |
| :--- | :--- | :--- | :--- |
| **shadcn/ui** ([ui.shadcn.com](https://ui.shadcn.com)) | Root [`components.json`](./components.json) (`new-york`, lucide); `shadcn` CLI `2.10.0` in `node_modules` | `@shadcn` (built in) | The base layer for every registry here. The `shadcn` MCP lists, searches, views, and installs from it. |
| **Fluid Functionalism** ([fluidfunctionalism.com](https://www.fluidfunctionalism.com)) | [`fluid-functionalism/`](./fluid-functionalism/): a full clone of `mickadesign/fluid-functionalism` (as of 2026-11-02) with `registry/` (base, radix, default, standard, blocks) | `"@fluid": "https://www.fluidfunctionalism.com/r/{name}.json"`, now in the root `components.json` | 83 registry items: 49 UI, 17 lib, 7 blocks, 5 hooks, 3 items, 2 themes. Springs instead of durations, satisfying hover. |
| **Six Interactive Design Systems** (`Switchyard`, `Ledgermark`, `Civicgate`, `Fieldrig`, `Folio Archive`, `Wardline`) | [`design-systems/`](./design-systems/): full offline installation of `index.html`, `marketing.html`, `systems/*.html`, `marketing/*.html`, `components/product/*`, `components/marketing/*`, `tokens/*.css`, `fonts/*.css`, `images/*`, `SKILL.md`, `references/`, `scripts/` | [`design-systems/registry.json`](./design-systems/registry.json) · [`design-systems/README.md`](./design-systems/README.md) | 6 complete design systems spanning 6 distinct archetypes: **6 product workspaces**, **6 token & typography foundations**, **26 interactive product component specimens**, **13 product modal dialogs & slide-over drawers**, **36 marketing & media component chapters** (6 per system), **6 marketing dialogs**, **12 OKLCH token CSS sheets**, **7 self-hosted base64 WOFF2 font bundles**, and **42 photography/media assets**. |
| **External Design Systems Catalog** (`Twenty CRM`, `Midday`, `Plane`, `Shadcnblocks`, `Vercel Geist`, `Liveblocks`, `Motion`) | [`design-systems/external-systems/`](./design-systems/external-systems/): local token sheets (`tokens.css`), architecture specs (`README.md`), and interactive HTML specimens (`specimen.html`) for all 6 external systems + master Prompt `#01`–`#10` association matrix | [`design-systems/external-systems/index.html`](./design-systems/external-systems/index.html) · [`design-systems/external-systems/README.md`](./design-systems/external-systems/README.md) | Extracted two-layer OKLCH + Hex tokens, typography scales (`tabular-nums`), spacing/radii, shadow-as-border elevations, and interactive product component specimens mapped to WDA Prompts `#01`–`#10`. |
| **Motion AI Kit** ([motion.dev](https://motion.dev)) | [`motion-ai-kit/`](./motion-ai-kit/) & [`.agents/skills/motion/SKILL.md`](./.agents/skills/motion/SKILL.md) | `motion/react` · CSS `linear()` springs | Official Motion AI Kit repository + agent skill for 60fps spring physics, layout projections, and MotionScore (`S–F`) GPU compositing audits. |

### External Design Systems (`design-systems/external-systems/`)

Installed locally with extracted two-layer OKLCH + Hex CSS custom properties (`tokens.css`), component anatomy & interaction docs (`README.md`), and self-contained live interactive specimens (`specimen.html`):

| System | Upstream Source | Local Directory & Specimen | Token Prefix & Core DNA | Primary WDA Prompt Matches (`#01`–`#10`) |
| :--- | :--- | :--- | :--- | :--- |
| **Twenty CRM** (`twenty-ui`) | [twenty.com](https://twenty.com) · [`twentyhq/twenty`](https://github.com/twentyhq/twenty) | [`design-systems/external-systems/twenty-crm/`](./design-systems/external-systems/twenty-crm/README.md) · [`specimen.html`](./design-systems/external-systems/twenty-crm/specimen.html) | `--t-*` (`#FFFFFF` / `#FCFCFC` light, `#141414` dark, `#171717` ink, `#1961ED` cobalt, `#0D7A5F` forest, `36px` record rows) | **Prompt #10** (`10-crystal-capital-deal-os` — 11-Stage Deal Machine, Investor Rolodex & Mandate Matcher) |
| **Midday** (`midday-ui`) | [midday.ai](https://midday.ai) · [`midday-ai/midday`](https://github.com/midday-ai/midday) | [`design-systems/external-systems/midday/`](./design-systems/external-systems/midday/README.md) · [`specimen.html`](./design-systems/external-systems/midday/specimen.html) | `--md-*` (`#F7F7F5` architectural stone, `#FFFFFF` sheet, `#111111` ink, `1px` `#E6E6E2` border, `#059669` reconciled, `#DC2626` red-line block) | **Prompt #04** (`04-solarig-pv-commissioning`), **Prompt #07** (`07-crossborder-ai-bookkeeping`), **Prompt #09** (`09-fpa-business-digital-twin`) |
| **Plane** (`@makeplane/propel`) | [plane.so](https://plane.so) · [`makeplane/plane`](https://github.com/makeplane/plane) | [`design-systems/external-systems/plane/`](./design-systems/external-systems/plane/README.md) · [`specimen.html`](./design-systems/external-systems/plane/specimen.html) | `--pl-*` (`#F8FAFC` / `#FFFFFF` slate, `#0F172A` ink, `#0284C7` cobalt, `#0D9488` Quartz teal, `#DC2626` WIP breach, locked-100vh split-pane) | **Prompt #02** (`02-datacenter-gis-screener`), **Prompt #03** (`03-quartz-vsm-studio`), **Prompt #09** (`09-fpa-business-digital-twin`) |
| **Shadcnblocks** (`@shadcnblocks`) | [shadcnblocks.com](https://www.shadcnblocks.com) | [`design-systems/external-systems/shadcnblocks/`](./design-systems/external-systems/shadcnblocks/README.md) · [`specimen.html`](./design-systems/external-systems/shadcnblocks/specimen.html) | `--sb-*` (`#FFFFFF` / `#F8FAFC` surface, `#09090B` ink, `#E4E4E7` 1px bento divider, 12-col asymmetric `span-8` + `span-4` scorecards) | **Prompt #02** (`02-datacenter-gis-screener`), **Prompt #04** (`04-solarig-pv-commissioning`), **Prompt #05** (`05-horizon-ceo-telemetry`) |
| **Vercel Templates & Geist** (`Geist UI`) | [vercel.com/design](https://vercel.com/design) · [vercel.com/templates](https://vercel.com/templates) | [`design-systems/external-systems/vercel-geist/`](./design-systems/external-systems/vercel-geist/README.md) · [`specimen.html`](./design-systems/external-systems/vercel-geist/specimen.html) | `--ds-*` (`#0A0A0A` / `#111111` dark canvas, 10-step `--ds-gray-100..1000`, shadow-as-border `0 0 0 1px`, `#06B6D4` cyan, `#10B981` green glow, `#EF4444` outage glow) | **Prompt #01** (`01-water-vvard-gis`), **Prompt #05** (`05-horizon-ceo-telemetry`), **Prompt #06** (`06-biometric-resemblance-inspector`), **Prompt #08** (`08-binance-quant-terminal`) |
| **Liveblocks** (`@liveblocks/react-ui`) | [liveblocks.io](https://liveblocks.io) | [`design-systems/external-systems/liveblocks/`](./design-systems/external-systems/liveblocks/README.md) · [`specimen.html`](./design-systems/external-systems/liveblocks/specimen.html) | `--lb-*` (`.lb-root`, `#F8FAFC` / `#FFFFFF` surface, `#0284C7` pin cobalt, `#0F766E` biometric teal, `--lb-user-1..4` rater rings, `<FloatingThreads />`) | **Prompt #06** (`06-biometric-resemblance-inspector`), **Prompt #01** (`01-water-vvard-gis`), **Prompt #07** (`07-crossborder-ai-bookkeeping`), **Prompt #09** (`09-fpa-business-digital-twin`) |

**Fluid Functionalism resources in the repo:**
- **Skill:** [`fluid-functionalism/skills/fluid-functionalism/SKILL.md`](./fluid-functionalism/skills/fluid-functionalism/SKILL.md) covers the `@fluid` motion system (3 spring speeds and shared tokens).
- **Guidelines:** [`motion-guidelines.md`](./fluid-functionalism/motion-guidelines.md), [`tone-of-voice.md`](./fluid-functionalism/tone-of-voice.md), [`preset-guidelines.md`](./fluid-functionalism/preset-guidelines.md), [`component-documentation-guidelines.md`](./fluid-functionalism/component-documentation-guidelines.md)
- **Starters already in use:** [`fluid-functionalism-starter/`](./fluid-functionalism-starter/) (`base-nova` + `@fluid`, with a showcase build) and [`fluid-chatgpt-clone/`](./fluid-chatgpt-clone/) (`@fluid`, with an artifact build)
- **New app with everything wired:** `npx shadcn@latest create -n my-app -t next https://www.fluidfunctionalism.com/r/starter/default.json`. Swap `default` for a dash-joined preset such as `radix-pill-compact-phosphor-dark`.
- **Existing project:** `npx shadcn@latest registry add @fluid`, then `npx shadcn@latest add @fluid/<name>`

### Kokonut UI ([kokonutui.com](https://kokonutui.com))

Free, open-source React components built on Tailwind CSS, Motion, and shadcn/ui. There is also a paid **Kokonut UI Pro** tier ([kokonutui.pro](https://kokonutui.pro)) with full templates and sections.

- **Registry:** added to [`components.json`](./components.json) as `"@kokonutui": "https://kokonutui.com/r/{name}.json"`
- **Index:** https://kokonutui.com/r/registry.json · **LLM docs:** https://kokonutui.com/llms.txt · **Agent setup:** https://kokonutui.com/docs/agents.md
- **Install:** `npx shadcn@latest add @kokonutui/<name>` (for example `@kokonutui/hold-button`), or ask the `shadcn` MCP.
- **Catalog (about 120 components):**

| Category | Count | Highlights |
| :--- | :-: | :--- |
| Backgrounds | 13 | Dot Field, Background Paths, Shape Hero, Wind, Topo, Drape, Halftone, Ink, Caustics, Rain Glass, Rhythm Hero (Pro), Dither Reveal Hero (Pro) |
| Cards | 19 | Flick Card, Throw Deck, Now Playing, Apple Activity, Widget Grid, Liquid Gauge, Activity Terrain, Page Flip, Receipt Printer, Metric, Uptime, Boarding Pass |
| Navigation | 11 | Split Nav, Tool Dock, Swipe Tabs, Account Menu, Command Palette, Smooth Drawer, Marking Menu, Scroll Index, Status Island, Stack Panel |
| Inputs | 19 | File Upload, Avatar Picker, Detent Dial, Wheel Picker, Liquid Slider, Signature Pad, Time Zone Planner, Amount Pad, Seat Map, Card Field, Stay/Slot/Location Picker, Swatch Fan, Price Range |
| AI | 21 | AI Input Search, AI Voice, AI Tool Approval, AI Context Meter, AI Inline Citations, AI Diff Review, AI Model Selector, AI Conversation Branches, AI Agent Lanes, AI Memory, Slash Command Menu, Image Generation Card |
| Media | 7 | Clip Trimmer, Synced Transcript, Focal Point Picker, Photo Straighten, Contact Sheet, Audio Player Card |
| Texts | 12 | Typing, Dynamic, Glitch, Extruded, Plucked, Cradle, Spoiler, Marker, Shadow, Split Flap Text, Kinetic Type Hero |
| Buttons | 18 | Particle, Gradient, Magnet, Hold, Command, Switch, Pull Cord, Tear, Bell, Undo, Slide to Confirm, Save, Cart, Pay, Morph Popover, V0 |

### React Bits ([reactbits.dev](https://reactbits.dev))

Free, open-source animated React components. Each one comes in 4 versions: JS + CSS, JS + Tailwind, TS + CSS, and TS + Tailwind. There is also a paid **React Bits Pro** tier with 230 components, 300 blocks, 300 app-UI screens, 15 templates, and a 20-item agent kit.

- **Registry:** `"@react-bits": "https://reactbits.dev/r/{name}.json"` (1,274 items, which is about 217 components × 4 versions plus a few extras). ✅ Verified through the `shadcn` MCP.
- **Item naming:** `<Component>-<JS|TS>-<CSS|TW>`. For Golden Template builds use the **`-TS-TW`** version, for example `npx shadcn@latest add @react-bits/SplitText-TS-TW`. jsrepo also works: `npx jsrepo@latest add https://reactbits.dev/r/SplitText-TS-TW`.
- **Docs:** https://reactbits.dev/llms.txt · MCP setup: https://reactbits.dev/get-started/mcp (uses the shadcn MCP)
- **Dependencies vary** (gsap, motion, three, ogl). Check each item's dependencies before installing.

| Category | Count |
| :--- | :-: |
| Text Animations | 33 |
| Animations | 38 |
| Components | 48 |
| Micro (switches, buttons, loaders) | 35 |
| Backgrounds | 63 |

### Spectrum UI ([ui.spectrumhq.in](https://ui.spectrumhq.in))

An open-source (Apache-2.0) set of 250+ animated components and blocks built on Tailwind, Motion, Radix, and shadcn/ui. **Not related to Adobe Spectrum.** New components ship every Thursday. Source: https://github.com/arihantcodes/spectrum-ui

- **Registry:** `"@spectrumui": "https://ui.spectrumhq.in/r/{name}.json"` (315 items). ✅ Verified through the `shadcn` MCP. It also has its own `spectrumui` MCP (Part 2).
- **Install:** `npx shadcn@latest add @spectrumui/<name>`, for example `@spectrumui/kanbanboard`.
- **Strongest areas:** AI-assistant blocks (27: agent plan/steps, approval card, citation sources, diff view, conversation list), Empty States (25), Charts (19), Footers (18), Tables (15), Pricing (7), 50 card blocks, and 53 button variants.
- **Docs:** https://ui.spectrumhq.in/llms.txt · https://ui.spectrumhq.in/docs/mcp

### EaseUI ([easeui.dev](https://easeui.dev))

Open-source library of 54 motion-first React components (42 Motion Components + 12 AI Agent Components) built with Tailwind CSS, Framer Motion / Motion spring physics, and shadcn/ui.

- **Registry:** `"@easeui": "https://easeui.dev/r/{name}.json"` — added to root [`components.json`](./components.json) for workspace-wide access.
- **Install:** `bunx --bun shadcn add @easeui/<name>` or `npx shadcn@latest add @easeui/<name>` (e.g., `bunx --bun shadcn add @easeui/toast`, `@easeui/insight-card`, `@easeui/number-ticker`, `@easeui/notification-stack`, `@easeui/theme-toggle`, `@easeui/command-palette`, `@easeui/table`, `@easeui/card`, `@easeui/select`).
- **Catalog (54 components):**
  - **Motion Components (42):** `accordion`, `alert`, `avatar`, `badge`, `button`, `card`, `checkbox`, `command-palette`, `copy-button`, `diff-view`, `drawer`, `dropdown-menu`, `dynamic-island`, `expandable-tabs`, `file-upload`, `gradient-text`, `hold-to-confirm`, `input`, `insight-card`, `modal`, `morphing-search`, `notification-stack`, `number-ticker`, `otp-input`, `popover`, `progress`, `pull-to-refresh`, `range-slider`, `rating`, `select`, `selection-actions`, `skeleton`, `stepper`, `switch`, `table`, `tabs`, `tag-input`, `text-animation`, `textarea`, `theme-toggle`, `toast`, `tooltip`.
  - **AI Agents (12):** `agent-loading-states`, `code-block`, `flowchart`, `message-bubble`, `pixel-loader`, `prompt-input`, `reasoning-disclosure`, `streaming-response`, `streaming-text`, `todo-list`, `tool-approval`, `tool-chip`.

---

## Part 4: Reference libraries (no MCP or shadcn registry)

Use these for browsing, copying source, and steering plates. None of them has an installable registry.

| Library | What it is | How to pull from it |
| :--- | :--- | :--- |
| **Bencho** ([bencho.dev](https://bencho.dev)) | 158 live, tunable, MIT-licensed React + framer-motion micro-interaction blocks (odds card, progress tracker, …). Also includes **Finds** (curated interactions credited to their makers), **Sounds** (synthesized UI sounds), and **Bench** (a canvas for tuning blocks side by side). By Lorenzo Cabra. | Copy source from each block page. Index: https://bencho.dev/llms.txt |
| **Libraries.dev** ([libraries.dev](https://libraries.dev)) | 7 MIT npm packages, one effect each, for AI interfaces: `border-beam`, `thinking-orbs`, `liquid-gooey`, `voice-glow`, `bot-avatars`, `metal-fx` (WebGL liquid metal), and `img-fx` (WebGL image-generation reveal). Pro/Business tiers add Studio and a team MCP. | `npm install <package>`. Read the reference at `https://libraries.dev/llms/<package>.md` before writing code, and never guess a prop. The agent skill is in 1C. |
| **ReactDrops** ([reactdrops.dev](https://reactdrops.dev)) | Creative React components, animations, and effects with live previews and a customizer. Each one ships with an AI-ready integration brief. | Copy source and the integration brief from the site. There is no llms.txt or registry, and the site needs JavaScript, so browse it in the browser panel. |
| **Kinetics by Colorion** ([kinetics.colorion.co](https://kinetics.colorion.co)) | 162 animated UI examples with CSS snippets, 99 React Spring examples, and 153 AI prompts, plus Physics and Generator tools. Part of the Colorion suite (palettes, gradients, font combinations, CSS loaders and toggles). | Copy CSS, React code, and **AI prompts**. The prompts are useful for steering Nano Banana plates. |
| **ScrollTie** (scrolltie.co) | ❓ **Unresolved.** The domain has no DNS record, and `www.scrolltie.co` and `scrolltie.com` don't resolve either. | Needs the correct URL. |

> [!IMPORTANT]
> The `frontend-*` and `fullstack-*` folder sets are **no-code**. There, Kokonut, React Bits, Spectrum, 21st, Originkit, Bencho, Libraries.dev, ReactDrops, and Kinetics components are **visual references only** for steering Nano Banana Pro plates, logged in `STEERING.md`. Install them only in Golden Template build folders.

---

## Adding a new source

1. Decide whether it is a **skill** (Part 1), an **MCP server** (Part 2), or a **component registry** (Part 3).
2. MCP: add it to `.agents/mcp_config.json`, run a handshake test (`initialize` → `tools/list`), and record its status here.
3. Registry: add it to `components.json` → `registries` so the `shadcn` MCP can see it.
4. Skill: put it in `skills/<name>/` (workspace) or `~/design-kit/skills/<name>/` (global), and add a row here.
