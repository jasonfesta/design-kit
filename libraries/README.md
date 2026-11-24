# Libraries

npm packages install **per project**, so the kit doesn't share `node_modules`. This folder is the guidance layer.

| File | What |
| :--- | :--- |
| [WDA_COMPONENT_AND_MOTION_LIBRARIES.md](WDA_COMPONENT_AND_MOTION_LIBRARIES.md) | Full matrix of every npm, chart, 3D, UI primitive and motion package found across WDA, plus pairing rubric |
| [LOCAL_DESIGN_SYSTEMS_AND_NPM.md](LOCAL_DESIGN_SYSTEMS_AND_NPM.md) | Design systems + toolchain readiness audit |
| [SKILLS_AND_MCPS.md](SKILLS_AND_MCPS.md) | Skills, MCPs, registries, reference-only libraries (Bencho, Libraries.dev, ReactDrops, Kinetics) |
| [GOOGLE_DESIGN_SYSTEMS_CATALOG.md](GOOGLE_DESIGN_SYSTEMS_CATALOG.md) | The 10 Google systems |
| [SAAS_77F5DC6_HERO_SYSTEMS_STUDY.md](SAAS_77F5DC6_HERO_SYSTEMS_STUDY.md) | SaaS hero-system study |
| [components.shadcn.json](components.shadcn.json) | shadcn config with 12 live registries: `@kokonutui`, `@react-bits`, `@spectrumui`, `@fluid`, `@easeui`, `@magicui`, `@aceternity`, `@coss`, `@kibo-ui`, `@tactile`, `@plush`, `@designme` |
| [stacks/](stacks/) | Installed library stacks with a playground: [palermo](stacks/palermo/README.md) (the open libraries behind Profound's Palermo) · [apps](stacks/apps/README.md) (**App Stack**: MUI, Radix Primitives + Themes, Konsta UI for iOS. Use for application builds) |
| [sources/](sources/) | Local copies of component libraries: [plush-ui](sources/plush-ui/README.md) (23 soft shadcn components, MIT) · [designme](sources/designme/README.md) (125 agent-UI components, MIT, React-only) · [bencho](sources/bencho/README.md) (47 MIT micro-interaction blocks + sounds + 158-item index) · [preline](sources/preline/README.md) (200+ Tailwind v4 blocks + 29 framework-agnostic JS plugins, MIT) · [tactile-ui](sources/tactile-ui/README.md) (hardware-style UI registry index + 6 free MIT offline JSONs) · [ui-sdk](sources/ui-sdk/README.md) · [glimm](sources/glimm/README.md) (WebGL sweep transitions v0.4.1 + `llms-full.txt`, MIT) · [torph](sources/torph/README.md) (dependency-free text & number morphing v0.1.4 + demos & framework examples, MIT) |
| [starters/golden-template/package.json](starters/golden-template/package.json) | Canonical Golden Template dependencies |

## Catalogs (browse beyond what's installed)

Each catalog is a markdown table: name · package/URL · license · purpose · maturity/stars · when to pick · install snippet, plus a decision rubric at the bottom.

| Catalog | Entries | Summary |
| :--- | ---: | :--- |
| [ui-primitives.md](ui-primitives.md) | 115 | Headless primitives (Radix, Base UI, UI SDK, React Aria, Ark/Zag, Headless UI, Ariakit, Kobalte, Melt, Floating UI), styled kits (shadcn, HeroUI, Park UI, Untitled UI React, Mantine…), 33 shadcn-compatible registries (Origin/coss, Magic UI, Aceternity, Kokonut, React Bits, Animate UI, AI Elements, affectUI…), and best-of-breed single-purpose pieces (cmdk, vaul, sonner, input-otp, react-day-picker, embla, react-resizable-panels, TanStack Table/Virtual/Form, dnd kit, editors) |
| [motion.md](motion.md) | 72 | Motion, GSAP (all plugins free), glimm, React Spring, anime.js v4, AutoAnimate, Popmotion, Theatre.js, dotLottie/Rive, NumberFlow, Torph, Lenis, View Transitions / scroll-driven CSS, motion-primitives, DialKit/Leva tuning, shader backgrounds |
| [3d.md](3d.md) | 81 | three.js (WebGPU/TSL), R3F + drei + postprocessing + rapier, Babylon, PlayCanvas, OGL, TypeGPU, Spline, Threlte, model-viewer, cobe; helpers (three-mesh-bvh, troika text, maath, lamina); physics; **3D asset encoding** (glTF-Transform, meshopt/gltfpack, Draco, KTX2/Basis, gltfjsx, Gaussian splats/SPZ, 3D Tiles) and CC0 asset sources |
| [icons.md](icons.md) | 45 | Lucide (default), Phosphor, Tabler, Heroicons, Radix, Material Symbols, Iconoir, Remix, Hugeicons, Central, Streamline, brand logos (Simple Icons, SVGL); Iconify (200k+ via one API), unplugin-icons, react-icons; animated icons (lucide-animated, itshover, Animate UI, useAnimations, Lordicon) |
| [fonts.md](fonts.md) | 73 | Google Fonts (CSS2 + Developer API + tags repo), Fontsource, Bunny, Fontshare (API), libre foundries (Velvetyne, Collletttivo, uncut.wtf, Atipo), Geist/Inter/Plex, commercial foundries (Pangram Pangram, Displaay, Dinamo, Klim, Grilli…), tooling (fontTools, glyphhanger, subfont, Capsize, Fontaine, next/font), pairing resources — with API/MCP flags |

Design-engineering inspiration (experiments, craft writing, galleries) lives in [../references/inspiration/](../references/inspiration/README.md).

## Quick reference (versions as installed in `~/wda`)

<a id="motion"></a>
**Motion:** `motion` 14.9 (import `motion/react`) · `gsap` 3.12 · `dialkit` (tuning panels) · `torph` (text morph) · `@tweenjs/tween.js` (three) · `tw-animate-css` · Motion AI Kit (CSS `linear()` springs, MotionScore) · `@fluid` springs (`spring.fast`/`moderate`/`slow`)

**UI primitives:** `radix-ui`, `@base-ui/react`, `cmdk`, `vaul`, `input-otp`, `sonner`, `next-themes`, `class-variance-authority`, `clsx`, `tailwind-merge`

**Data and charts:** `recharts`, `liveline`, `@number-flow/react`, `react-virtuoso`, `@dnd-kit/*`, `zustand`, `date-fns`

**3D and code:** `three`, `cobe`, `shiki`, plus in subprojects `@dimforge/rapier3d-compat`, `meshoptimizer`

**Icons:** `lucide-react` (default), plus `@phosphor-icons/react` and `@tabler/icons-react` in subprojects

**Fonts (`@fontsource`):** Archivo, Bricolage Grotesque, Fraunces, Instrument Sans, JetBrains Mono, Manrope, Newsreader, Onest, Outfit, Plus Jakarta Sans, Schibsted Grotesk, Source Serif 4, Space Grotesk, Syne, Geist, Geist Mono, IBM Plex Mono, Space Mono

**Local component sources (in `~/wda`):** `fluid-functionalism/` (`@fluid`), `easeui-registry/` (`@easeui`), `motion-ai-kit/`

To choose between libraries, use the `pick-ui-library` skill.
