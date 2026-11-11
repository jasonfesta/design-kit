# Libraries

npm packages install **per project**, so the kit doesn't share `node_modules`. This folder is the guidance layer.

| File | What |
| :--- | :--- |
| [WDA_COMPONENT_AND_MOTION_LIBRARIES.md](WDA_COMPONENT_AND_MOTION_LIBRARIES.md) | Full matrix of every npm, chart, 3D, UI primitive and motion package found across WDA, plus pairing rubric |
| [LOCAL_DESIGN_SYSTEMS_AND_NPM.md](LOCAL_DESIGN_SYSTEMS_AND_NPM.md) | Design systems + toolchain readiness audit |
| [SKILLS_AND_MCPS.md](SKILLS_AND_MCPS.md) | Skills, MCPs, registries, reference-only libraries (Bencho, Libraries.dev, ReactDrops, Kinetics) |
| [GOOGLE_DESIGN_SYSTEMS_CATALOG.md](GOOGLE_DESIGN_SYSTEMS_CATALOG.md) | The 10 Google systems |
| [SAAS_77F5DC6_HERO_SYSTEMS_STUDY.md](SAAS_77F5DC6_HERO_SYSTEMS_STUDY.md) | SaaS hero-system study |
| [components.shadcn.json](components.shadcn.json) | shadcn config with registries `@kokonutui`, `@react-bits`, `@spectrumui`, `@fluid`, `@easeui` |
| [starters/golden-template/package.json](starters/golden-template/package.json) | Canonical Golden Template dependencies |

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
