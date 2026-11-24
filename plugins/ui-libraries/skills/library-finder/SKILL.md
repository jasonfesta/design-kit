---
name: library-finder
description: The design kit's library finder. Checks every kit source (catalogs, local kits designme/plush, registries, recipe skills), then searches registries, MCPs and the web when asked, and picks ONE library (or a no-dependency approach, or a registry component to copy in) for a frontend task, checking the project's build constraints first (Golden Template's locked package.json), then Emil Kowalski's curated picks, then the kit's catalogs of UI primitives, motion, 3D and asset encoding, icons, and fonts, then the shadcn/21st/magicui/spectrumui registries and MCPs. Use whenever choosing, recommending, comparing, or installing a UI, motion, chart, 3D, icon, or font library, or when a prompt or build needs "a component for X". Supersedes calling pick-ui-library directly.
---

# library-finder

Answer with **one pick**, how to get it into *this* project, and why, in under 10 lines. Only show alternatives when the user asks or the top two are genuinely tied.

## 1. Read the constraints first
1. Find the project's `package.json` and what's already installed. If something already covers the task, use it.
2. **Golden Template build?** (`vite-plugin-singlefile` + the `dating` layout, or the user says Golden Template / WDA deliverable.) The dependency list is locked to `react`, `react-dom`, `clsx`, `tailwind-merge`, `lucide-react`. Choose in this order:
   1. **Platform first**: CSS (transitions, `@starting-style`, scroll-driven animation, View Transitions, `popover`, `<dialog>`, `:has()`), SVG, Canvas/WebGL by hand.
   2. **Copy source in**: pull a component's source from a registry (step 4) into `src/components/`, rewritten to use only the allowed deps.
   3. **Only then a package**: say plainly that it needs a Golden Template exception and ask.
3. Otherwise, note the framework (React 19? RN/Expo? Vue/Svelte?), styling (Tailwind v4?), SSR, and bundle sensitivity.

## 2. Curated picks first (Emil Kowalski's list)
If the task is on this list, use it unless step 1 rules it out:

| Task | Pick |
| :--- | :--- |
| Accessible primitives (dialog, popover, menu, select) | base-ui |
| Custom headless widget an agent must build or drive (stepper, splitter, transfer list), multi-framework | UI SDK (`@ui-sdk/*`, beta) → `ui-sdk` skill |
| ⌘K command menu | cmdk |
| Toasts | Sonner |
| Drawer / bottom sheet | Vaul |
| OTP input | input-otp |
| Control panel / tuning GUI | Leva (DialKit alt) |
| General animation | motion (`motion/react`) |
| Animated numbers | NumberFlow |
| Animated text | torph |
| 3D globe | Cobe |
| OG images | Satori |
| Syntax highlighting | shiki |
| Streaming charts / static charts | Liveline / recharts |
| Drag and drop | dnd kit |
| Virtualized lists | Virtuoso |
| State / classNames / variants / themes | zustand / clsx / cva / next-themes |

The full reasoning lives in `pick-ui-library` (Emil's upstream skill; don't edit it).

## 3. Everything else: the kit (check all of these before searching)
**Catalogs:** look the task up and use each file's "which to pick" guide.

| Need | Catalog |
| :--- | :--- |
| Headless/styled primitives, forms, tables, dates, carousels, panels, tooltips, 33+ registries | [`libraries/ui-primitives.md`](/usr/local/google/home/jfesta/design-kit/libraries/ui-primitives.md) |
| Animation engines, Lottie/Rive, scroll, View Transitions, text/number effects, shader backgrounds | [`libraries/motion.md`](/usr/local/google/home/jfesta/design-kit/libraries/motion.md) |
| three / R3F / drei, physics, WebGPU, **3D asset encoding** (glTF-Transform, meshopt, Draco, KTX2) | [`libraries/3d.md`](/usr/local/google/home/jfesta/design-kit/libraries/3d.md) |
| Icon sets, Iconify, animated icons | [`libraries/icons.md`](/usr/local/google/home/jfesta/design-kit/libraries/icons.md) |
| Font sources, APIs, tooling | [`libraries/fonts.md`](/usr/local/google/home/jfesta/design-kit/libraries/fonts.md) (to choose typefaces use `font-enricher`) |
| What WDA projects already use | [`libraries/WDA_COMPONENT_AND_MOTION_LIBRARIES.md`](/usr/local/google/home/jfesta/design-kit/libraries/WDA_COMPONENT_AND_MOTION_LIBRARIES.md) |

**Local kits (full source on disk, so they work offline):**

| Kit | Best for | Where | Golden Template |
| :--- | :--- | :--- | :--- |
| **designme.dev** (125, MIT) | Agent/chat UI: status pill, reasoning trail, tool call, permission gate, plan review, run queue, trace view, composer, model picker, plus charts, forms, tables | [`libraries/sources/designme/`](/usr/local/google/home/jfesta/design-kit/libraries/sources/designme/README.md) · `@designme` | **Yes**: React-only, no extra deps |
| **plush** (23, MIT) | Soft, tactile consumer controls: counter, rating, progress-ring, steps, switch, calendar | [`libraries/sources/plush-ui/`](/usr/local/google/home/jfesta/design-kit/libraries/sources/plush-ui/README.md) · `@plush` | Copy and swap Radix/Hugeicons |
| `~/wda/fluid-functionalism/` (83) · `~/wda/easeui-registry/` (54) | Fluid-spring and Ease components already used in WDA | `@fluid` · `@easeui` | Copy |

**Installed stacks:** [`libraries/stacks/palermo/`](/usr/local/google/home/jfesta/design-kit/libraries/stacks/palermo/README.md), a ready `node_modules` with Radix + cmdk + NumberFlow + Video.js 10 + hls.js + Tailwind v4 for Palermo-style analytics/agent consoles (tokens in `design-systems/external-systems/palermo-profound/`).

**Kit skills that are themselves "libraries" (recipes and templates):**

| Need | Skill |
| :--- | :--- |
| Animated bento grid video of UI cards (120 fps) | `bento-ui-motion-grid` (run with `~/design-kit/tools/bin/bento-grid`) |
| Faux product UI, cursor demos, bento scenes | `stageshow` |
| AI loading/status indicators | `thinking-orbs`, `beam-glow-states` |
| Web effects: lasers, dither, glass, grids, marquees, particles, scroll stories, progressive blur, masked reveals | `web-effects` plugin (102 recipe skills; ask the `design-kit` router) |
| 3D materials, sky, seasons, water, game VFX | `threejs-games` plugin (42) |
| Charts as images / infographics | `antv-*` skills |
| GSAP / Framer Motion / Remotion specifics | `gsap-*`, `framer-motion-*`, `remotion-*` |

**Visual references** (for "what should it look like", not code): [`references/inspiration/`](/usr/local/google/home/jfesta/design-kit/references/inspiration/README.md) (affectUI, whitespace, Emil, Rauno, Godly…), design systems in [`design-systems/`](/usr/local/google/home/jfesta/design-kit/design-systems/README.md) (6 WDA + 20 Google + 18 external).

Prefer: maintained in the last 6 months, React 19 compatible, works with Tailwind v4, permissive license (flag GPL, e.g. swapy, typed.js v3), small bundle.

## 3b. Search (whenever the user says "search", or the kit has no strong match)
Search after checking the kit. Don't skip the kit to search instead.
1. **Registries:** `shadcn` MCP `search_items_in_registries` across all 9 (`@designme @plush @fluid @easeui @kokonutui @react-bits @spectrumui @magicui @aceternity`). Then `21st` MCP `search`, `magicui` and `spectrumui`.
2. **Docs and APIs:** `context7` (current library docs), `deepwiki` (a repo's internals).
3. **Web:** `search_web` for newer libraries, e.g. "<task> react component 2026", ui.shadcn.com/docs/directory, registry.directory. Check maintenance, React 19 support, license and bundle size.
4. **Report what you found** alongside the kit's pick ("kit pick vs. search pick"), and recommend one.
5. **Grow the kit:** if a search turns up a strong library that isn't catalogued, add a row to the right `libraries/*.md` file (and register its shadcn namespace in `libraries/components.shadcn.json` + `mcp/shadcn/components.json` if it has one). If the user asks to "grab" it, clone it into `libraries/sources/<name>/` with a README like plush or designme.

## 4. Getting the component: install or copy
| Source | How |
| :--- | :--- |
| shadcn registries (`@designme`, `@plush`, `@fluid`, `@easeui`, `@kokonutui`, `@react-bits`, `@spectrumui`, `@magicui`, `@aceternity`) | `shadcn` MCP (search/view/add command), or `npx shadcn@latest add @reg/item` |
| designme CLI | `npx designme add <name> --react` (or HTML/Astro) |
| 21st.dev | `21st` MCP (`search`, `get_component`) |
| Magic UI | `magicui` MCP |
| Spectrum UI | `spectrumui` MCP |
| Local source (offline) | copy from `libraries/sources/<kit>/source/…` |
| Library docs (current APIs) | `context7` MCP |
| Icons by keyword | `iconify` MCP |

In Golden Template builds, take the source, strip disallowed imports, and inline it. Lint the result with `design-donts`.

## 5. Answer format
```
Pick: <library or approach> — <one sentence on why it fits this task>
Get it: <npm i ... | shadcn add ... | copy from <registry> into src/components/X.tsx | CSS-only>
Notes: <React 19 / license / size / Golden Template exception if any>
```
Then wire it up if the user asked for implementation.

## 5b. Agent / chat UI
For agent surfaces (status, reasoning, tool calls, permission gates, plan review, run queues, traces, composer), start with **designme.dev** (`~/design-kit/libraries/sources/designme/`). Its React components need only React 19, so they're Golden Template-safe. Then AI Elements → Prompt Kit → assistant-ui.

## 6. Mismatches to flag
- A hand-built toast, dropdown, dialog or drawer → Sonner / base-ui / Vaul (or `<dialog>` + `popover` in Golden Template).
- Re-rendering text to animate a number → NumberFlow (or CSS `@property` counters in Golden Template).
- 1,000+ rows rendered directly → Virtuoso / TanStack Virtual.
- Raw `.glb` over 5 MB shipped to the browser → glTF-Transform + meshopt + KTX2.
- Material Symbols or Roboto pulled in by a component → swap them (see `design-donts`).
