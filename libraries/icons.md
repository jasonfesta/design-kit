# Icon libraries

Static icon sets, meta-libraries (Iconify), build-time loaders, and **animated icons**. House rule: **one primary set per product** (default `lucide-react`), match stroke width to the type weight (1.5 for light UIs, 2 for default), size icons to the text's cap height (16/20/24).

- `★★★` industry standard · `★★` solid · `★` young/design-forward. Counts and stars approximate (late 2026).

**Count: 45 entries.**

---

## 1. Primary icon sets (React packages)

| Name | Package | License | Icons / styles | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Lucide** | `lucide-react` (also `lucide`, `lucide-vue-next`, `lucide-svelte`, `lucide-react-native`) | ISC | ~1,650 · outline, adjustable stroke | Community fork of Feather; shadcn default | ★★★ ~15k★ | **Golden Template default** | `npm i lucide-react` |
| **Phosphor** | `@phosphor-icons/react` | MIT | ~1,500 × 6 weights (thin, light, regular, bold, fill, duotone) | Flexible weight system | ★★★ ~6k★ | Need weight/duotone variants, friendly tone | `npm i @phosphor-icons/react` |
| **Tabler Icons** | `@tabler/icons-react` | MIT | ~5,900 outline + filled | Largest free consistent 24px set | ★★★ ~19k★ | Dense dashboards needing obscure glyphs | `npm i @tabler/icons-react` |
| **Heroicons** | `@heroicons/react` | MIT | ~320 × outline/solid/mini/micro | Tailwind Labs | ★★★ ~22k★ | Tailwind/Catalyst projects | `npm i @heroicons/react` |
| **Radix Icons** | `@radix-ui/react-icons` | MIT | ~320 crisp 15×15 | Pixel-precise small UI icons | ★★ ~2.5k★ | Tiny 15px controls (Radix Themes) | `npm i @radix-ui/react-icons` |
| **Material Symbols** | `@material-symbols/svg-400` · `material-symbols` font · fonts.google.com/icons | Apache-2.0 | ~3,800 variable (FILL, wght, GRAD, opsz) × outlined/rounded/sharp | Google's variable icon font | ★★★ | Google / M3 surfaces; animate weight/fill via font axes | `npm i material-symbols` |
| **Iconoir** | `iconoir-react` | MIT | ~1,600 outline | Elegant, thin, editorial | ★★ ~6k★ | Calm/editorial UIs | `npm i iconoir-react` |
| **Remix Icon** | `@remixicon/react` | Remix Icon License 1.0 (free incl. commercial; no resale as icon set) | ~3,000 line + fill | Neutral system icons + brands | ★★★ ~8k★ | Line/fill pairs | `npm i @remixicon/react` |
| **Hugeicons** | `@hugeicons/react` + `@hugeicons/core-free-icons` | MIT (free) / Pro commercial | 4,600 free stroke-rounded; 46k+ Pro (9 styles) | Very large modern set | ★★ | Huge coverage with consistent style | `npm i @hugeicons/react @hugeicons/core-free-icons` |
| **Central Icons** | iconists.co/central · `@central-icons-react/*` | Commercial | 1,600+ × many styles (round/square, stroke weights, filled) | Premium design-engineer set (used by Linear-ish UIs) | ★★ | Premium product polish | via license (npm private) |
| **Streamline** | streamlinehq.com · `@streamlinehq/*` | Free tier (CC-BY) / Pro | 300k+ icons across 40+ families + illustrations; Figma plugin | Massive commercial library | ★★★ | Matching illustration + icon families | Figma/SVG download, API |
| **Feather** | `react-feather` | MIT | 287 | Lucide's ancestor | ★★★ (unmaintained) | Legacy only; use Lucide | `npm i react-feather` |
| **Geist Icons** | vercel.com/geist/icons | MIT-like (Vercel) | ~500 | Vercel's icon set | ★★ | Geist-styled UIs | copy SVG |
| **Akar Icons** | `akar-icons` | MIT | ~450 rounded | Friendly rounded line | ★ | Soft UIs | `npm i akar-icons` |
| **Mynaui** | `@mynaui/icons-react` | MIT | 1,200+ outline/solid | Clean shadcn-friendly | ★ | Lucide alternative | `npm i @mynaui/icons-react` |
| **Huge/Basil/Solar/Mage** | via Iconify (`solar:*`, `basil:*`, `mage:*`) | CC-BY/MIT | Solar 7k+ in 6 styles (bold-duotone, linear…) | Expressive duotones | ★★ | Duotone illustrations-as-icons | via Iconify |
| **Carbon Icons** | `@carbon/icons-react` | Apache-2.0 | 2,000+ | IBM Carbon | ★★★ | Enterprise / IBM-aligned | `npm i @carbon/icons-react` |
| **Fluent UI System Icons** | `@fluentui/react-icons` | MIT | 2,000+ regular/filled/color | Microsoft | ★★★ | Fluent/Windows UIs | `npm i @fluentui/react-icons` |
| **Octicons** | `@primer/octicons-react` | MIT | ~350 | GitHub | ★★★ | Dev tools / GitHub-like | `npm i @primer/octicons-react` |
| **Simple Icons** | `simple-icons` · `@icons-pack/react-simple-icons` | CC0 | 3,300+ brand logos | Brand marks | ★★★ ~23k★ | Logo walls, integrations lists | `npm i @icons-pack/react-simple-icons` |
| **SVGL** | svgl.app (API) | MIT (logos ™) | 500+ brand SVGs incl. wordmarks, light/dark | Modern brand logos w/ API + shadcn registry | ★★ ~4k★ | Tech logos with dark variants | `npx shadcn add @svgl/<logo>` |
| **Font Awesome 7** | `@fortawesome/react-fontawesome` | Free (CC-BY/OFL/MIT) / Pro | 2,000 free / 30k+ pro | Classic | ★★★ | Legacy/enterprise | `npm i @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons` |
| **Pixelarticons / Pixel Icon Library** | `pixelarticons` · hackernoon pixel-icon-library | MIT / CC-BY | 480+ pixel | Retro/8-bit | ★★ | Retro/game UIs | `npm i pixelarticons` |
| **Health Icons** | healthicons.org | CC0 | 1,500+ medical | Health domain | ★★ | Health products | via Iconify |
| **Majesticons / Teenyicons / Eva** | via Iconify | MIT | various | Niche aesthetics | ★ | Browsing alternatives | via Iconify |

## 2. Meta-libraries, loaders & search

| Name | Package / URL | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Iconify** | `@iconify/react` · api.iconify.design · icon-sets.iconify.design | MIT (framework); each set keeps its license | **200k+ icons from 150+ open sets via one API/component**, on-demand fetch or offline JSON | ★★★ ~5k★ | Mixing sets, prototyping, any icon by name `set:name` | `npm i @iconify/react` |
| **@iconify/json / @iconify-json/*** | `@iconify-json/lucide` etc. | per set | Offline icon data for build-time usage | ★★★ | Bundled, no network | `npm i -D @iconify-json/lucide` |
| **unplugin-icons** | `unplugin-icons` | MIT | Build-time import any Iconify icon as a component (`import IconX from '~icons/lucide/x'`) for Vite/webpack/Rollup | ★★★ ~4k★ | Tree-shaken Iconify in Vite builds | `npm i -D unplugin-icons @iconify/json` |
| **Tailwind Iconify plugin** | `@iconify/tailwind4` | MIT | CSS-only icons via classes (`icon-[lucide--x]`) | ★★ | Icons in pure CSS/Tailwind | `npm i -D @iconify/tailwind4` |
| **react-icons** | `react-icons` | MIT (sets vary) | 40+ popular sets bundled as ESM components | ★★★ ~12k★ | Quick multi-set access in React (heavier install) | `npm i react-icons` |
| **Icones** | icones.js.org | MIT | Fast Iconify browser (copy as JSX/SVG/Unocss) | ★★★ | Finding the right glyph | web |
| **SVGR** | `@svgr/cli` · `vite-plugin-svgr` | MIT | Turn SVGs into React components | ★★★ | Custom brand icons | `npm i -D vite-plugin-svgr` |
| **SVGO** | `svgo` | MIT | Optimize SVG | ★★★ ~22k★ | Every exported SVG | `npm i -D svgo` |
| **Lucide Lab** | `@lucide/lab` | ISC | Experimental Lucide icons | ★★ | Missing Lucide glyphs | `npm i @lucide/lab` |
| **Icon MCPs** | 21st Magic MCP (`search_logo`), Iconify API | — | Agents can fetch icons/logos by name | ★★ | Agent-driven icon lookup | installed MCP: `21st` |

## 3. Animated icons

| Name | Package / URL | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **lucide-animated** | lucide-animated.com (pqoqubbw/icons) | MIT | 350+ Lucide icons with Motion hover animations, shadcn registry | ★★★ ~4k★ | Animated version of the default set | `npx shadcn@latest add "https://lucide-animated.com/r/<icon>.json"` |
| **itshover** | itshover.com | MIT | Motion-first hand-crafted animated icons (React + `motion/react`), shadcn registry | ★★ | Expressive hover icons | `npx shadcn@latest add https://itshover.com/r/<icon>.json` |
| **Animate UI icons** | animate-ui.com/docs/icons | MIT | Animated Lucide-style icons with triggers (hover/tap/loop) | ★★ | Programmable animated icons | `npx shadcn add @animate-ui/icons-<name>` |
| **useAnimations** | `react-useanimations` · useanimations.com | MIT | Lottie micro-interaction icons (menu↔close, heart, loading) | ★★ ~1k★ | Stateful toggle icons | `npm i react-useanimations` |
| **Lordicon** | lordicon.com · `@lordicon/react` | Free (attribution) / Pro | 40k+ Lottie animated icons, multiple styles | ★★★ | Rich animated illustrations-icons | `npm i @lordicon/react lottie-web` |
| **Morphicons** | morphicons (search: "morphing icons spring") | MIT | Spring-morphing line icons compatible with Lucide/Tabler/Heroicons | ★ | Icon→icon morph | copy |
| **Material Symbols variable axes** | font | Apache-2.0 | Animate `FILL`/`wght` axes with CSS transitions | ★★★ | Toggle fill on select (Google style) | font |
| **Rive icon packs** | rive.app/community | various | Interactive state-machine icons | ★★ | Complex stateful icons | `npm i @rive-app/react-canvas` |
| **Phosphor animated / Hugeicons animated** | hugeicons.com/animated | Pro | Animated variants of big sets | ★ | Large consistent animated set | via license |
| **SVG stroke-draw (DIY)** | CSS `stroke-dasharray` / Motion `pathLength` | — | Draw-on effect for any outline icon | ★★★ | Lightweight custom icon animations | — |

---

## Decision rubric
1. Default: **Lucide** (shadcn, Golden Template). Animated variants: lucide-animated / Animate UI.
2. Need weights or duotone: **Phosphor**. Need breadth: **Tabler** or **Hugeicons**. Premium polish: **Central Icons**.
3. Google surfaces: **Material Symbols** (variable font axes).
4. Brand logos: **Simple Icons** (mono) or **SVGL** (color + dark).
5. Mixing many sets or prototyping: **Iconify** at dev time → **unplugin-icons** at build time.
