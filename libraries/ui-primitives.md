# UI primitives, component kits and registries

The catalog for **behavior + accessibility layers** (headless primitives), **styled kits**, **copy-paste registries** (shadcn ecosystem), and **single-purpose components** (command menus, drawers, toasts, OTP, dates, carousels, tables, virtualization, forms, DnD, editors).

- **Golden Template default:** `radix-ui` (or `@base-ui/react`) + Tailwind v4 + `clsx`/`tailwind-merge` + `lucide-react`. Everything below is opt-in per project.
- **Stars / maturity** are approximate GitHub stars at last check (late 2026). `★★★` = industry standard, `★★` = solid and maintained, `★` = young / niche / design-forward.
- To pick between them, run the `pick-ui-library` skill. For motion libraries see [motion.md](motion.md); icons → [icons.md](icons.md).

**Count: 115 entries** (20 headless, 16 styled kits, 33 registries/blocks, 46 single-purpose).

---

## 1. Headless / unstyled primitives (behavior + a11y, you own the styles)

| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Radix Primitives** | `radix-ui` (mono) or `@radix-ui/react-*` | MIT | ~30 accessible primitives (Dialog, Popover, Dropdown, Tabs, Slider, Toast, NavigationMenu…) | ★★★ ~17k★, WorkOS | Default for Golden Template and shadcn/ui; widest ecosystem | `npm i radix-ui` |
| **Base UI** | `@base-ui/react` | MIT | Successor primitives from Radix + Floating UI + MUI authors; Combobox, Menu, Select, NumberField, Toast, Meter | ★★★ ~6k★, v1 stable | New builds wanting a cleaner API than Radix, better Combobox/Autocomplete; `@fluid/base/*` flavor | `npm i @base-ui/react` |
| **React Aria Components** | `react-aria-components` | Apache-2.0 | Adobe's 50+ fully accessible components incl. DatePicker, ColorPicker, Table, Tree, DnD, virtualization | ★★★ ~14k★ (react-spectrum) | Best-in-class a11y, i18n (30+ locales), complex widgets (calendars, grids) | `npm i react-aria-components` |
| **React Aria (hooks)** | `react-aria` / `react-stately` | Apache-2.0 | Lower-level hooks behind RAC (`useButton`, `useComboBox`…) | ★★★ | When you need custom DOM structure but Adobe-grade behavior | `npm i react-aria react-stately` |
| **Ark UI** | `@ark-ui/react` | MIT | 45+ state-machine headless components (React, Vue, Solid, Svelte), built on Zag | ★★ ~4.5k★, Chakra team | Multi-framework design systems, unusual widgets (ColorPicker, SignaturePad, QR, FileUpload, Tour) | `npm i @ark-ui/react` |
| **Zag.js** | `@zag-js/*` | MIT | Framework-agnostic finite state machines powering Ark | ★★ ~4.5k★ | Building your own component layer for any framework | `npm i @zag-js/react @zag-js/dialog` |
| **Headless UI** | `@headlessui/react` | MIT | Tailwind Labs primitives (Menu, Listbox, Combobox, Dialog, Disclosure, Popover, Tabs) | ★★★ ~27k★ | Small Tailwind-first projects, Catalyst / Tailwind Plus users | `npm i @headlessui/react` |
| **Ariakit** | `@ariakit/react` | MIT | Low-level WAI-ARIA primitives with composable stores (Composite, Combobox, Toolbar, Menubar) | ★★ ~8k★ | Unusual composite widgets, strict ARIA patterns | `npm i @ariakit/react` |
| **Kobalte** | `@kobalte/core` | MIT | Radix-equivalent for **SolidJS** | ★★ ~1.5k★ | SolidJS projects (shadcn-solid) | `npm i @kobalte/core` |
| **Melt UI** | `@melt-ui/svelte` / `melt` | MIT | Headless builders for **Svelte** (Svelte 5 `melt` next-gen) | ★★ ~3.5k★ | Svelte projects | `npm i melt` |
| **Bits UI** | `bits-ui` | MIT | Svelte headless components (base of shadcn-svelte) | ★★ ~2.5k★ | Svelte + shadcn-svelte | `npm i bits-ui` |
| **Reka UI** | `reka-ui` | MIT | Vue port of Radix (formerly Radix Vue) | ★★ ~5k★ | Vue / Nuxt (shadcn-vue) | `npm i reka-ui` |
| **Floating UI** | `@floating-ui/react` | MIT | Positioning engine for tooltips/popovers/menus (flip, shift, size, arrow, inner) | ★★★ ~31k★ | Custom popovers, anchored menus, macOS-style select (`inner`) | `npm i @floating-ui/react` |
| **CSS Anchor Positioning** | native CSS (`anchor-name`, `position-anchor`) | web std | Zero-JS anchored popovers + `popover` attribute | Chrome/Edge stable, Safari 26 | Lightweight tooltips with `[popover]` + `@position-try` | — |
| **React Hook Popover / Popover API** | native `popover`, `<dialog>`, `command`/`commandfor` | web std | Top-layer dialogs and popovers without portals | Baseline 2025 | Simple modals without a library | — |
| **Downshift** | `downshift` | MIT | Hooks for combobox / select / multiple selection | ★★★ ~12k★ | Custom autocompletes with full render control | `npm i downshift` |
| **react-focus-lock / FocusScope** | `react-focus-lock` | MIT | Focus trapping | ★★ | Hand-rolled modals | `npm i react-focus-lock` |
| **UI SDK** ([ui-sdk.dev](https://ui-sdk.dev/)) | `@ui-sdk/core` + `@ui-sdk/react` (also Vue, Svelte, Solid, Web Components adapters) | Apache-2.0 | Vercel Labs' 50+ agent-oriented headless **behaviors** (`createPopup`, `createSelection`, `createTypeahead`, `createRovingFocus`, `createReorder`, `createFocusRecovery`) composed into parts via `createParts`; built-in agent bridge (`agent.snapshot()` / `subscribe()` / `act()`) | ★ beta `0.1.0-beta.5`, Vercel Labs (2026) | Agent-built custom widgets that need correct ARIA, keyboard and focus without adopting a component set; agent-drivable UIs; multi-framework. Beta, so pin versions | `npm i @ui-sdk/core @ui-sdk/react` · **in kit:** `ui-sdk` skill + offline docs at [sources/ui-sdk](sources/ui-sdk/README.md) |
| **Tabbable / focus-trap** | `focus-trap` | MIT | Vanilla focus trapping | ★★ | Non-React or vanilla widgets | `npm i focus-trap` |
| **Corvu** | `corvu` | MIT | SolidJS primitives incl. Drawer, Resizable, OTP | ★ | SolidJS drawers/resizable | `npm i corvu` |

## 2. Styled component kits / full systems

| Name | Package / URL | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **shadcn/ui** | `npx shadcn@latest` · ui.shadcn.com | MIT | Copy-paste Radix/Base UI + Tailwind components you own; CLI, MCP, registries | ★★★ ~100k★ | Default component source for Golden Template | `npx shadcn@latest init` |
| **HeroUI** (ex-NextUI) | `@heroui/react` | Apache-2.0 | Polished Tailwind + React Aria kit, v3 Tailwind v4 | ★★★ ~25k★ | Fast, beautiful app UIs with good a11y out of the box | `npm i @heroui/react` |
| **Park UI** | park-ui.com | MIT | Styled Ark UI recipes for Panda CSS or Tailwind | ★★ ~2k★ | Ark UI users who want shadcn-style starting styles | `npx @park-ui/cli add button` |
| **Untitled UI React** | `npx untitledui@latest` · untitledui.com/react | MIT (free) / commercial PRO | Huge React Aria + Tailwind v4 kit matching the Untitled UI Figma system | ★★ ~3k★ | Product UIs that must match the Untitled UI Figma file | `npx untitledui@latest init` |
| **Catalyst / Tailwind Plus** | tailwindcss.com/plus | Commercial | Tailwind Labs' app kit + 500+ marketing/app blocks (Headless UI) | ★★★ | Premium Tailwind marketing/app sections | download |
| **Mantine** | `@mantine/core` | MIT | 120+ components + hooks, dates, charts, forms, spotlight | ★★★ ~28k★ | Dashboards and internal tools quickly, CSS modules | `npm i @mantine/core @mantine/hooks` |
| **Chakra UI v3** | `@chakra-ui/react` | MIT | Ark-based styled system with recipes & tokens | ★★★ ~39k★ | Token-driven theming, Panda-style recipes | `npm i @chakra-ui/react @emotion/react` |
| **MUI / Joy** | `@mui/material` | MIT | Material Design kit; MUI X data grid/pickers | ★★★ ~95k★ | Enterprise / Material-aligned products | `npm i @mui/material @emotion/react @emotion/styled` |
| **Material Web** | `@material/web` | Apache-2.0 | Google's M3 web components | ★★ (maintenance mode) | Google M3 parity in web components | `npm i @material/web` |
| **Radix Themes** | `@radix-ui/themes` | MIT | Styled Radix with theme tokens (accent, gray, radius, scaling) | ★★ ~6k★ | Clean pre-styled admin UIs with almost no CSS | `npm i @radix-ui/themes` |
| **Geist (Vercel)** | vercel.com/geist | Proprietary design system | Vercel's system; fonts/icons open | reference | Borrow tokens/patterns (see `references/external-systems/vercel-geist`) | — |
| **Ant Design** | `antd` | MIT | Enterprise-dense kit (tables, forms, trees) | ★★★ ~95k★ | Data-dense admin in CJK markets | `npm i antd` |
| **daisyUI** | `daisyui` | MIT | Tailwind plugin of semantic component classes + themes | ★★★ ~37k★ | No-JS class-based components, fast theming | `npm i -D daisyui` |
| **Fluent UI React v9** | `@fluentui/react-components` | MIT | Microsoft's design system | ★★★ | Microsoft-style enterprise UIs | `npm i @fluentui/react-components` |
| **Tamagui** | `tamagui` | MIT | Universal React + React Native styled kit with optimizing compiler | ★★ ~12k★ | Shared web + native UI | `npm i tamagui` |
| **Gluestack UI** | `@gluestack-ui/*` | MIT | NativeWind (Tailwind) components for React Native + web | ★★ | Expo apps wanting shadcn-like DX | `npx gluestack-ui init` |

## 3. Copy-paste registries, block libraries, design-engineering kits (shadcn-compatible)

> Wire any of these into `components.json` → `registries` (see [components.shadcn.json](components.shadcn.json) and `mcp/shadcn/components.json`; 12 live registries: `@kokonutui`, `@react-bits`, `@spectrumui`, `@fluid`, `@easeui`, `@magicui`, `@aceternity`, `@coss`, `@kibo-ui`, `@tactile`, `@plush`, `@designme`). Directory of every registry: **ui.shadcn.com/docs/directory** and **registry.directory**.

| Name | URL / registry | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **shadcn Registry Directory** | ui.shadcn.com/docs/directory · registry.directory | — | Index of 100+ community registries usable with `npx shadcn add @ns/item` | ★★★ | Discover a namespaced registry before building | `npx shadcn@latest add @ns/name` |
| **coss ui (formerly Origin UI)** | coss.com/ui (`@coss`) | MIT | Cal.com's open-source design system built on Base UI; 608 components & particles (inputs, selects, tables, timelines) | ★★★ ~8k★ | Production app inputs, steppers, data tables, file uploads (wired: `@coss`) | `npx shadcn@latest add @coss/<name>` |
| **Magic UI** | magicui.design (`@magicui`) | MIT (+Pro) | 260 animated marketing components (marquee, globe, beams, number ticker, bento); dedicated `magicui` MCP also live | ★★★ ~19k★ | SaaS landing sections with motion (wired: `@magicui`) | `npx shadcn@latest add @magicui/<name>` |
| **Aceternity UI** | ui.aceternity.com (`@aceternity`) | MIT (+Pro) | Flashy motion/3D-ish sections (spotlight, lamp, 3D card, aurora, wavy background) | ★★★ huge usage | Hero wow-moments; use sparingly (wired: `@aceternity`) | `npx shadcn@latest add @aceternity/<name>` |
| **Kokonut UI** | kokonutui.com | MIT | 100+ animated components + AI chat inputs | ★★ ~1.5k★ | Polished AI inputs, cards, buttons (already wired: `@kokonutui`) | `npx shadcn@latest add @kokonutui/<name>` |
| **plush** | plush-ui.pages.dev | MIT | 23 soft, pillowy shadcn + Radix components (counter, rating, progress-ring, steps…); light, black accent, Open Runde. Local copy: [sources/plush-ui](sources/plush-ui/README.md) | ★ new (2026) | Friendly consumer apps, soft tactile controls (already wired: `@plush`) | `npx shadcn@latest add @plush/<name>` |
| **React Bits** | reactbits.dev | MIT + Commons Clause | 110+ animated text, backgrounds (shaders), components; JS/TS × CSS/Tailwind variants | ★★★ ~30k★ | Text animations, WebGL backgrounds (already wired: `@react-bits`) | `npx shadcn@latest add @react-bits/<Name>-TS-TW` |
| **Animate UI** | animate-ui.com | MIT | Motion-powered primitives (animated Radix/Base), animated icons, backgrounds | ★★ ~3k★ | Animated versions of shadcn primitives | `npx shadcn@latest add @animate-ui/<name>` |
| **Motion Primitives** | motion-primitives.com | MIT | Motion (framer) building blocks by Ibelick: text effect, morphing dialog, dock, magnetic | ★★ ~5k★ | Tasteful motion blocks; morphing dialog | `npx motion-primitives@latest add <name>` |
| **designme.dev** | designme.dev | MIT | 125 agent-UI + app components (status pill, reasoning trail, tool call, permission gate, plan review, run queue, trace view, context meter, model compare, charts, forms) as HTML/CSS/JS, **React 19 with zero extra deps**, or Astro; Soft + Blueprint styles, light/dark. Local copy: [sources/designme](sources/designme/README.md) | ★★ new (2026) | **Agent/chat UI, especially Golden Template builds** (no dependency exception needed) (wired: `@designme`) | `npx designme add <name> --react` · `npx shadcn@latest add @designme/<name>` |
| **Prompt Kit** | prompt-kit.com | MIT | AI chat UI blocks (prompt input, message, markdown, reasoning) by Ibelick | ★★ | Chat/agent UIs on shadcn | `npx shadcn@latest add prompt-kit/prompt-input` |
| **AI Elements (Vercel)** | ai-sdk.dev/elements | Apache-2.0 | Official AI SDK UI components (conversation, tool, reasoning, artifact, sources) | ★★ | Agent/chat UIs with Vercel AI SDK | `npx ai-elements@latest` |
| **assistant-ui** | assistant-ui.com | MIT | Composable chat primitives (Thread, Composer, ToolUI) | ★★ ~7k★ | Full chat apps, any LLM backend | `npx assistant-ui init` |
| **affectUI** | affectui.com | Free + Pro | 91 single-file AI-agent + SaaS components, MCP server (see [references/inspiration/affectui.md](../references/inspiration/affectui.md)) | ★ new | Agent dashboards: traces, tool calls, approvals | shadcn CLI / MCP |
| **Cult UI** | cult-ui.com | MIT | Design-engineer components (dynamic island, shift card, texture buttons) | ★★ ~3k★ | Tactile/skeuo-modern pieces | `npx shadcn@latest add @cult-ui/<name>` |
| **Skiper UI** | skiper-ui.com | Free + Pro | Award-style creative components (skiper series) | ★ | Awwwards-style interactions | registry |
| **Eldora UI** | eldoraui.site | MIT | Animated marketing components | ★ | Alternative to Magic UI | registry |
| **Hover.dev** | hover.dev | Commercial + free | Animated Tailwind + Motion components by Tom Is Loading | ★★ | Playful animated buttons/cards | copy |
| **Spectrum UI** | ui.spectrumhq.in | MIT | shadcn add-on components (wired as `@spectrumui`) | ★ | Extra app widgets | `npx shadcn add @spectrumui/<name>` |
| **Fluid Functionalism** | fluidfunctionalism.com | MIT | Spring-first Radix/Base flavors (local in `~/wda`, `@fluid`) | ★ local | Kit default motion feel | `npx shadcn add @fluid/<name>` |
| **EaseUI** | local `easeui-registry/` (`@easeui`) | local | House registry | local | WDA builds | `npx shadcn add @easeui/<name>` |
| **Tremor** | tremor.so | Apache-2.0 | Copy-paste dashboard charts + blocks (Recharts-based) | ★★★ ~16k★ | KPI dashboards | copy / `npm i @tremor/react` |
| **shadcn Charts** | ui.shadcn.com/charts | MIT | Recharts wrappers in shadcn style | ★★★ | Charts that match shadcn tokens | `npx shadcn add chart` |
| **Shadcnblocks** | shadcnblocks.com | Commercial + free | 1000+ marketing/app blocks (local ref `references/external-systems/shadcnblocks`) | ★★ | Full page sections | registry |
| **Tailark** | tailark.com | MIT (+Pro) | Marketing blocks by Méschac Irung | ★★ | Clean SaaS landing sections | `npx shadcn add @tailark/<name>` |
| **Launch UI** | launchui.com | MIT | Landing page template components | ★★ | Fast SaaS landers | copy |
| **21st.dev** | 21st.dev | per-component | Community component marketplace + Magic MCP (installed MCP: `21st`) | ★★★ | Find any component by search | `npx shadcn add "https://21st.dev/r/<user>/<name>"` |
| **Uiverse** | uiverse.io | MIT | 5k+ community CSS/Tailwind elements (buttons, loaders, toggles) | ★★★ | Single CSS micro-elements | copy |
| **Kibo UI** | kibo-ui.com (`@kibo-ui`) | MIT | 41 advanced shadcn components (tables, dropzones, AI inputs, Gantt, Kanban, color picker, editor, code block) | ★★ ~3k★ | Complex app widgets shadcn skips (wired: `@kibo-ui`) | `npx shadcn@latest add @kibo-ui/<name>` |
| **Tactile UI** | tactileui.dev (`@tactile`) | MIT (+Pro) | 98 hardware-inspired physical components (mechanical odometer, liquid-damped compass, pull-cord switch, engraved plates) in vanilla JS/CSS + React/Vue/Svelte wrappers. Local free copies: [sources/tactile-ui](sources/tactile-ui/README.md) | ★ new (2026) | Hardware-feel tactile controls & physical micro-objects (wired: `@tactile`) | `npx shadcn@latest add @tactile/<name>` |
| **Bencho** | bencho.dev | MIT (+Pro) | 150+ micro-interactions sorted by press, hover, and drag + synthesized UI sounds. Local MIT copy (47 blocks + `llms.txt`): [sources/bencho](sources/bencho/README.md) | ★ new (2026) | Tunable React + Motion micro-interaction blocks | copy from `libraries/sources/bencho/source/blocks/` |
| **Preline UI** | preline.co · `preline` | MIT | 200+ free Tailwind v4 blocks + 29 interactive JS plugins (accordion, datatable, datepicker, combobox, overlay…) that work without React. Local copy: [sources/preline](sources/preline/README.md) | ★★★ ~6k★ | Framework-agnostic Tailwind v4 HTML/JS blocks or non-React pages | `npm i preline` (or copy from `libraries/sources/preline/source/`) |
| **Dice UI** | diceui.com | MIT | Accessible advanced shadcn components (sortable, mention, data-table, tags input) | ★★ | Data tables + sortable with good a11y | `npx shadcn add @diceui/<name>` |
| **Reui** | reui.io | MIT | Extended shadcn components and data grids | ★ | Data grid + filters | registry |
| **Shadcn Studio / ShadcnUI Kit** | shadcnstudio.com | MIT + Pro | Theme generator + blocks | ★ | Theming shadcn quickly | registry |
| **tweakcn** | tweakcn.com | Apache-2.0 | Visual theme editor for shadcn tokens (OKLCH) | ★★ ~7k★ | Generating `index.css` theme tokens | web |
| **Smooth UI / Syntax UI / Lukacho UI** | smoothui.dev · syntaxui.com · ui.lukacho.com | MIT | Motion-polished small components | ★ | Extra polish sources | copy |
| **Watermelon UI / Hextaui / Animata** | ui.watermelon.sh · hextaui.com · animata.design | MIT | More animated shadcn-compatible packs | ★ | Browse for niche animated widgets | copy |

## 4. Single-purpose components (best-of-breed)

### Overlays, command menus, notifications
| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **cmdk** | `cmdk` | MIT | ⌘K command menu (fuzzy filter, groups, keyboard) | ★★★ ~11k★ | Any command palette | `npm i cmdk` |
| **kbar** | `kbar` | MIT | Alternative command bar with nested actions | ★★ ~5k★ | Action-registration style palettes | `npm i kbar` |
| **Vaul** | `vaul` | MIT | Drag-to-dismiss drawer w/ snap points, background scale (Emil) | ★★★ ~8k★ | Mobile sheets/drawers | `npm i vaul` |
| **Sonner** | `sonner` | MIT | Opinionated toast stack (Emil) | ★★★ ~11k★ | Default toast; see `ask-sonner` skill | `npm i sonner` |
| **react-hot-toast** | `react-hot-toast` | MIT | Lightweight toasts | ★★★ ~10k★ | Very small bundles | `npm i react-hot-toast` |
| **Shepherd / Driver.js / Onborda / NextStep** | `shepherd.js` · `driver.js` · `onborda` | MIT | Product tours & highlights | ★★ | Onboarding walkthroughs | `npm i driver.js` |
| **react-modal-sheet** | `react-modal-sheet` | MIT | iOS-style bottom sheet with Motion | ★★ | Alternative to Vaul with motion values | `npm i react-modal-sheet` |

### Inputs and forms
| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **input-otp** | `input-otp` | MIT | Accessible one-time-code input (Guilherme Rodz) | ★★★ ~3k★ | OTP / 2FA fields | `npm i input-otp` |
| **react-day-picker** | `react-day-picker` | MIT | Date picker / calendar (shadcn Calendar base, v9) | ★★★ ~6k★ | Date ranges and calendars | `npm i react-day-picker date-fns` |
| **@internationalized/date + RAC DatePicker** | `react-aria-components` | Apache-2.0 | Segmented date/time fields, time zones | ★★★ | i18n-correct dates | see §1 |
| **TanStack Form** | `@tanstack/react-form` | MIT | Type-safe headless forms, field-level validation | ★★ ~5k★ | Complex typed forms | `npm i @tanstack/react-form` |
| **React Hook Form** | `react-hook-form` + `@hookform/resolvers` | MIT | Performant uncontrolled forms (shadcn Form) | ★★★ ~43k★ | Default forms with zod | `npm i react-hook-form @hookform/resolvers zod` |
| **Conform** | `@conform-to/react` | MIT | Progressive-enhancement forms for server actions | ★★ | Next/Remix server-action forms | `npm i @conform-to/react @conform-to/zod` |
| **Zod / Valibot** | `zod` · `valibot` | MIT | Schema validation (Valibot is tree-shakable) | ★★★ | Validation | `npm i zod` |
| **react-number-format** | `react-number-format` | MIT | Masked numeric/currency inputs | ★★★ | Money & phone fields | `npm i react-number-format` |
| **react-phone-number-input** | `react-phone-number-input` | MIT | International phone input | ★★ | Phone fields | `npm i react-phone-number-input` |
| **react-colorful** | `react-colorful` | MIT | 2.8 kB color picker | ★★★ ~3k★ | Color pickers | `npm i react-colorful` |
| **Uppy / react-dropzone** | `@uppy/react` · `react-dropzone` | MIT | File upload (resumable) / drop zones | ★★★ | Uploads | `npm i react-dropzone` |
| **use-mask-input / maska** | `use-mask-input` | MIT | Input masks | ★ | Masks | `npm i use-mask-input` |

### Layout, scrolling, carousels
| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Embla Carousel** | `embla-carousel-react` | MIT | Lightweight, fluid, plugin-based carousel (shadcn Carousel) | ★★★ ~7k★ | Default carousel | `npm i embla-carousel-react` |
| **Swiper** | `swiper` | MIT | Feature-rich slider (effects, 3D, virtual) | ★★★ ~40k★ | Heavy-effect sliders | `npm i swiper` |
| **Keen Slider** | `keen-slider` | MIT | Touch slider, no deps | ★★ | Small bundle sliders | `npm i keen-slider` |
| **react-resizable-panels** | `react-resizable-panels` | MIT | Resizable split panes (shadcn Resizable) by Brian Vaughn | ★★★ ~5k★ | IDE / editor layouts | `npm i react-resizable-panels` |
| **Allotment** | `allotment` | MIT | VS Code–style split views | ★★ | Code-editor panes | `npm i allotment` |
| **Lenis** | `lenis` | MIT | Smooth scroll (darkroom.engineering) | ★★★ ~10k★ | Awwwards-style smooth scroll + GSAP | `npm i lenis` |
| **OverlayScrollbars** | `overlayscrollbars-react` | MIT | Custom native-feeling scrollbars | ★★ | Styled scroll areas | `npm i overlayscrollbars-react` |
| **react-grid-layout / gridstack** | `react-grid-layout` | MIT | Draggable/resizable dashboard grids | ★★★ ~21k★ | Widget dashboards | `npm i react-grid-layout` |

### Data, tables, virtualization, DnD
| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TanStack Table** | `@tanstack/react-table` | MIT | Headless tables (sorting, filtering, grouping, pinning) | ★★★ ~27k★ | Any custom data table | `npm i @tanstack/react-table` |
| **TanStack Virtual** | `@tanstack/react-virtual` | MIT | Headless virtualization (rows, columns, grids, masonry) | ★★★ ~6k★ | Long lists in custom DOM | `npm i @tanstack/react-virtual` |
| **React Virtuoso** | `react-virtuoso` | MIT | Batteries-included virtual lists (variable height, chat reverse) | ★★★ ~6k★ | Chat logs, feeds | `npm i react-virtuoso` |
| **AG Grid** | `ag-grid-react` | MIT (Community) / Commercial | Spreadsheet-grade grid | ★★★ ~14k★ | Excel-like enterprise grids | `npm i ag-grid-react` |
| **Glide Data Grid** | `@glideapps/glide-data-grid` | MIT | Canvas grid, millions of rows | ★★ ~4k★ | Massive datasets | `npm i @glideapps/glide-data-grid` |
| **dnd kit** | `@dnd-kit/core` `@dnd-kit/sortable` (or `@dnd-kit/react`) | MIT | Modular drag & drop, sortable, accessible | ★★★ ~15k★ | Sortable lists, kanban | `npm i @dnd-kit/core @dnd-kit/sortable` |
| **Pragmatic drag and drop** | `@atlaskit/pragmatic-drag-and-drop` | Apache-2.0 | Atlassian's tiny native-DnD-based library | ★★ ~11k★ | Trello/Jira-scale boards, cross-window DnD | `npm i @atlaskit/pragmatic-drag-and-drop` |
| **Swapy** | `swapy` | GPL-3.0 (check before commercial use) | Drop-in slot swapping layouts | ★★ ~8k★ | Bento layouts users can rearrange | `npm i swapy` |
| **React Flow / xyflow** | `@xyflow/react` | MIT | Node-based editors & diagrams | ★★★ ~30k★ | Workflow/agent graphs | `npm i @xyflow/react` |
| **NumberFlow** | `@number-flow/react` | MIT | Animated number transitions (Max Barvian) | ★★★ ~6k★ | KPI counters, prices | `npm i @number-flow/react` |

### Rich text, code, media
| Name | Package | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tiptap** | `@tiptap/react` | MIT (+Pro) | ProseMirror editor framework | ★★★ ~31k★ | Notion-like editing | `npm i @tiptap/react @tiptap/starter-kit` |
| **Lexical** | `lexical` `@lexical/react` | MIT | Meta's extensible editor | ★★★ ~21k★ | High-perf editors | `npm i lexical @lexical/react` |
| **Plate** | `platejs` | MIT | Slate-based editor + shadcn UI | ★★ ~13k★ | shadcn-styled rich editors | `npx shadcn add @plate/editor` |
| **BlockNote** | `@blocknote/react` | MPL-2.0 | Block-based Notion-style editor | ★★ ~8k★ | Notion blocks out of the box | `npm i @blocknote/react @blocknote/mantine` |
| **Shiki** | `shiki` | MIT | VS Code–grade syntax highlighting | ★★★ ~11k★ | Code blocks (installed in WDA) | `npm i shiki` |
| **Sandpack** | `@codesandbox/sandpack-react` | Apache-2.0 | Live in-browser code playgrounds | ★★★ | Docs playgrounds | `npm i @codesandbox/sandpack-react` |
| **Monaco / CodeMirror 6** | `@monaco-editor/react` · `@uiw/react-codemirror` | MIT | Code editors | ★★★ | IDE-like editing | `npm i @uiw/react-codemirror` |
| **Media Chrome / Vidstack** | `media-chrome` · `@vidstack/react` | MIT | Customizable video/audio players | ★★ | Branded media players | `npm i @vidstack/react` |
| **Streamdown** | `streamdown` | Apache-2.0 | Streaming-safe Markdown renderer for AI output (Vercel) | ★★ | LLM response rendering | `npm i streamdown` |

---

## Quick decision rubric
1. **Need accessible behavior, own the look?** Radix (default) → Base UI (better combobox/select) → React Aria (complex widgets, i18n).
2. **Need a pretty component today?** shadcn registry search (`npx shadcn search`) → Origin/coss UI (app inputs) → Magic UI / Kokonut / React Bits (marketing motion).
3. **Agent / chat UI?** designme.dev (React-only, Golden Template-safe) → AI Elements → prompt-kit → assistant-ui → affectUI patterns.
4. **Non-React?** Svelte: Bits/Melt; Vue: Reka; Solid: Kobalte/Corvu; any: Zag/Ark.
5. Keep **one** primitive family per app — never mix Radix and Base UI flavors (see `@fluid` rule in [WDA_COMPONENT_AND_MOTION_LIBRARIES.md](WDA_COMPONENT_AND_MOTION_LIBRARIES.md)).
