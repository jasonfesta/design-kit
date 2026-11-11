# design-kit INDEX: "I need X" → where it lives

## Plugins (installable; toggle in Customizations)

| Plugin | Use it for | Skills | Subagents | MCP |
| :--- | :--- | :--- | :--- | :--- |
| **design-pipeline** | Concepts, research, fonts, Nano Banana plates, critique, design systems | jason-design-agent, research, style-direction, concept-art, image-gen, polish, eval, design-critique, design-flywheel, nanofy, google-font-selection, taxonomy, url-variant, design-system-creation, product-design-system | jason-design-agent + 12 stage agents, inspiration-watcher | – |
| **dev-pipeline** | Image → Golden Template React, evals, packaging | jason-dev-agent, replicate-mock, image-to-react, nano-banana, font-pairing, accessibility, responsiveness, interaction, feel, golden-template, clean-up, local-build-preview, responsive-dual-eval, benchmark-interaction-planner, warmup | jason-dev-agent + 10 stage agents | – |
| **motion-craft** | Any animation decision, review or performance issue | motion, animate, animate-expo, animation-performance, animation-vocabulary, animations-dev, choreograph, gestures, review-animations, improve-animations, remove-animations, find-animation-opportunities, emil-design-eng, apple-design | motion-reviewer | motion |
| **ui-libraries** | Choosing libraries and pulling components | pick-ui-library, ask-sonner, stageshow, prototype, break-ui, mobile-native, clone-to-prompt-reskin | – | 21st, shadcn, spectrumui, originkit |
| **3d-photoreal** | Three.js architecture, cars, worlds, image → 3D | arch-* (5), car-* (5), chair-studio-threejs, declarative-photoreal-threejs-worlds, image-to-working-model, photoreal-game-turing-loop | 3d-research, daily-chair | – |
| **games** | Browser games | game-* (6) | game-research | – |
| **kit-meta** | Kit housekeeping | design-kit (router), skill-maker, write-swift | skill-maker | – |

## Quick lookups

| I need… | Go to |
| :--- | :--- |
| **Which library for X** (charts, OTP, toasts, command menu, drag and drop, virtualization) | `pick-ui-library` skill · [libraries/WDA_COMPONENT_AND_MOTION_LIBRARIES.md](libraries/WDA_COMPONENT_AND_MOTION_LIBRARIES.md) |
| **Golden reference screenshot pair** (desktop + mobile) | [references/hero-grabs/](references/hero-grabs/) (14 sets) · [references/saas-goldens/examples/](references/saas-goldens/examples/) (20 SaaS dashboards) |
| **A design system to borrow structure or tokens from** | [design-systems/](design-systems/README.md): WDA six (Switchyard, Ledgermark, Civicgate, Fieldrig, Folio Archive, Wardline), `external-systems/` (Twenty, Midday, Plane, Shadcnblocks, Geist, Liveblocks), `google-systems/` (10) |
| **Design tokens CSS** | [design-systems/tokens/](design-systems/tokens/) (12 product and marketing sheets) |
| **Self-hosted fonts** | [design-systems/fonts/](design-systems/fonts/) · `@fontsource` list in [libraries/README.md](libraries/README.md) |
| **Motion library or spring choice** | `motion-craft` plugin · [libraries/README.md#motion](libraries/README.md) |
| **Component registries (shadcn)** | [libraries/components.shadcn.json](libraries/components.shadcn.json): `@fluid`, `@easeui`, `@kokonutui`, `@react-bits`, `@spectrumui` |
| **Reference-only sites** (Bencho, Libraries.dev, ReactDrops, Kinetics) | [libraries/SKILLS_AND_MCPS.md](libraries/SKILLS_AND_MCPS.md) Part 4 |
| **Start a new Golden Template project** | [libraries/starters/golden-template/package.json](libraries/starters/golden-template/package.json) + `golden-template` skill |
| **MCP servers** | [mcp/README.md](mcp/README.md) |
| **Google design systems catalog** | [libraries/GOOGLE_DESIGN_SYSTEMS_CATALOG.md](libraries/GOOGLE_DESIGN_SYSTEMS_CATALOG.md) |

## Not in the kit (still in `~/wda`, referenced here)
- `fluid-functionalism/` (`@fluid` source, 83 items), `easeui-registry/` (54 components), `motion-ai-kit/`: these are WDA projects with their own `node_modules`.
- `~/wda/skills/`: an older, git-tracked copy in the WDA repo. **The kit is canonical.**
- `~/moodboards/skills/`: a legacy copy, left untouched.
