# design-kit INDEX: "I need X" → where it lives

[CHANGELOG](CHANGELOG.md) · **508 skills · 30 agents · 14 plugins · 16 live MCP servers · 45 design systems (6 WDA + 20 Google + 18 external + Palermo reference)**

## Always-on rules
| Rule | What |
| :--- | :--- |
| [rules/design-kit-taste.md](rules/design-kit-taste.md) | Standing don'ts: no Material fonts, no purple, no default dark, wide font pool. Machine version: `design-donts` skill (`donts.json` + linter) |
| [rules/golden-template-react.md](rules/golden-template-react.md) | Golden Template layout + locked dependencies |
| `~/wda/.agents/rules/wda-prompt-construction.md` | WDA: every prompt runs donts → color-enricher → font-enricher → reference-mining → library-finder → lint |

## Plugins (installable; toggle in Customizations)

### Jason's own
| Plugin | Use it for | Skills | Subagents | MCP |
| :--- | :--- | :--- | :--- | :--- |
| **design-pipeline** | Concepts, research, fonts, colors, Nano Banana plates, critique, design systems, reference mining | jason-design-agent, research, style-direction, concept-art, image-gen, polish, eval, design-critique, design-flywheel, nanofy, google-font-selection, **font-enricher**, **color-enricher**, **reference-mining**, taxonomy, url-variant, design-system-creation, product-design-system | jason-design-agent + 12 stage agents | – |
| **dev-pipeline** | Image → Golden Template React, evals, packaging | jason-dev-agent, replicate-mock, image-to-react, nano-banana, font-pairing, accessibility, responsiveness, interaction, feel, golden-template, clean-up, local-build-preview, responsive-dual-eval, benchmark-interaction-planner, warmup | jason-dev-agent + 10 stage agents | – |
| **motion-craft** | Any animation decision, review or performance issue; bento motion-grid videos; WebGL sweep transitions; text & number morphing | **bento-ui-motion-grid**, **glimm**, **torph**, motion, animate, animate-expo, animation-performance, animation-vocabulary, animations-dev, choreograph, gestures, review-animations, improve-animations, remove-animations, find-animation-opportunities, emil-design-eng, apple-design | motion-reviewer | motion |
| **ui-libraries** | Choosing libraries, pulling components, active view-detecting Jig Agent & MP4 walkthrough recorder/evaluator | **library-finder**, pick-ui-library, ask-sonner, **ui-sdk**, stageshow, prototype, break-ui, mobile-native, clone-to-prompt-reskin, **style-jig**, **3d-ui-jig** | jig-agent, jig-recorder | 21st, shadcn (9 registries), spectrumui, magicui |
| **3d-photoreal** | Three.js architecture, cars, worlds, 3DGS/WebGL splats, InfiniSplat, photo → 3D, dream-to-live visual loops | arch-* (5), car-* (5), **3d-gaussian-splatting-webgl**, **infinisplat-3dgs**, **photo-to-3d-environment**, **dream-loop**, chair-studio-threejs, declarative-photoreal-threejs-worlds, image-to-working-model, photoreal-game-turing-loop | 3d-research, daily-chair | – |
| **games** | Browser games | game-* (6) | game-research | – |
| **kit-meta** | Kit housekeeping, weekly don'ts | design-kit (router), **design-donts**, skill-maker, write-swift | skill-maker | – |
| **design-mcp** | Fonts, icons, color, docs, diagrams, browser QA via MCP | design-mcp-guide | – | context7, deepwiki, tailwind-docs, threejs-docs, google-fonts-docs, iconify, color, palette, excalidraw, chrome-devtools, playwright |

### Imported packs (see [skills/CREDITS.md](skills/CREDITS.md))
| Plugin | Skills | Highlights |
| :--- | ---: | :--- |
| **design-craft** | 131 | jakubkrehel better-* · color-expert · impeccable · taste-skill · oklch · design-tokens · google-fonts · ui-craft · ui-ux-pro-max · 67 style-* · Meng To illustration-* · **papercraft** |
| **platform-design** | 41 | Apple HIG (hig-*), platform-ios/macos/visionos/…, material-3, liquid-glass, SwiftUI, mobile app design, React Native |
| **design-tooling** | 89 | figma-*, shadcn, tailwind-design-system, gsap-*, framer-motion-*, remotion-*, slidev, antv charts, excalidraw, email, Vercel React, Meng To workflows |
| **ux-content** | 16 | copywriting, ux-writing, humanize-text, wcag-2-2, accessibility, user research, grilling |
| **web-effects** | 102 | Meng To web recipes: lasers, dither, glass, grids, scroll storytelling, particles, marquees, landing/pricing pages |
| **threejs-games** | 42 | Meng To 3D materials/sky/seasons, game dev, combat VFX |

## Quick lookups

| I need… | Go to |
| :--- | :--- |
| **Which library for X** | `library-finder` skill → [libraries/](libraries/README.md): [ui-primitives](libraries/ui-primitives.md) (115) · [motion](libraries/motion.md) (72) · [3d + asset encoding](libraries/3d.md) (81) · [icons](libraries/icons.md) (45) · [fonts](libraries/fonts.md) (73) |
| **Fonts for a prompt or build** | `font-enricher` skill · pool in [rules/design-kit-taste.md](rules/design-kit-taste.md) · [libraries/fonts.md](libraries/fonts.md) |
| **Colors for a prompt or build** | `color-enricher` skill · `color` / `palette` MCPs |
| **Check work against the don'ts** | `python3 skills/design-donts/scripts/lint_donts.py <project or variants…>` |
| **Matching reference screenshots for a prompt** | `reference-mining` skill (Iris + GCC filtering) |
| **Golden reference screenshot pair** (desktop + mobile) | [references/hero-grabs/](references/hero-grabs/) (14 sets) · [references/saas-goldens/examples/](references/saas-goldens/examples/) (20 SaaS dashboards) |
| **Design-engineering inspiration** | [references/inspiration/](references/inspiration/README.md): whitespace experiments, Emil Kowalski, affectUI (178 items), Rauno, Paco, Benji, Jhey, Codrops, Godly, Mobbin, Refero, palletism taste packs + more (31) |
| **A design system to borrow structure or tokens from** | [design-systems/](design-systems/README.md): WDA six · [google-systems/](design-systems/google-systems/README.md) (20: GM3, Cloud, Ads, Angular, Glue, SecOps, YouTube, Search, Geo, DevSite, Gemini, Home, Travel, Merchant, GPay, NotebookLM, Earth, Help, ChromeOS, Plexi) · [external-systems/](design-systems/external-systems/README.md) (18: Twenty, Midday, Plane, Shadcnblocks, Geist, Liveblocks, Carbon, Polaris, Primer, Atlassian, Fluent 2, Radix, Spectrum 2, SLDS, Ant, Mantine, Base Web, Apple HIG) · reference-only: [Palermo / Profound](design-systems/external-systems/palermo-profound/README.md) |
| **Design tokens CSS** | [design-systems/tokens/](design-systems/tokens/) (WDA) · each `google-systems/*/tokens.css` and `external-systems/*/tokens.css` |
| **Self-hosted fonts** | [design-systems/fonts/](design-systems/fonts/) · [libraries/fonts.md](libraries/fonts.md) |
| **Motion library or spring choice** | `motion-craft` plugin · [libraries/motion.md](libraries/motion.md) |
| **Component registries (shadcn)** | [libraries/components.shadcn.json](libraries/components.shadcn.json): `@fluid`, `@easeui`, `@kokonutui`, `@react-bits`, `@spectrumui`, `@plush`, `@designme` (+ `@magicui`, `@aceternity` in the shadcn MCP) |
| **Installed library stacks** | [libraries/stacks/palermo/](libraries/stacks/palermo/README.md) (Radix, cmdk, NumberFlow, Video.js 10, hls.js, Tailwind v4 + playground) |
| **Local component library copies** | [libraries/sources/](libraries/sources/): [plush-ui](libraries/sources/plush-ui/README.md) · [designme](libraries/sources/designme/README.md) (125 agent-UI components) · [glimm](libraries/sources/glimm/README.md) (`glimm@0.4.1` + `llms-full.txt`) · [torph](libraries/sources/torph/README.md) (`torph@0.1.4` + demos & framework examples) |
| **Reference-only sites** (Bencho, Libraries.dev, ReactDrops, Kinetics) | [libraries/SKILLS_AND_MCPS.md](libraries/SKILLS_AND_MCPS.md) Part 4 |
| **Start a new Golden Template project** | [libraries/starters/golden-template/package.json](libraries/starters/golden-template/package.json) + `golden-template` skill |
| **Jig Agent & Recorder: style/library/motion-craft bars, expandable TOC, Red Record MP4 walkthrough + design eval, & fresh-project sync** | `style-jig` skill / `jig-agent` / `jig-recorder` (`python3 skills/style-jig/scripts/init_style_jig.py <project>` · `launch_jig_artifact.py` · `record_and_eval_jig.py`) · `3d-ui-jig` for full Three.js scene rigs |
| **MCP servers** (status, reload, re-test) | [mcp/README.md](mcp/README.md) · `python3 mcp/probe_all.py` |
| **Bento motion-grid video** (24 animated UI cards, 120 fps) | `bento-ui-motion-grid` skill · run with `tools/bin/bento-grid` |
| **Local runtimes** (Playwright, Pillow, numpy, headless Chromium) | [tools/README.md](tools/README.md) |
| **Google design systems catalog** | [libraries/GOOGLE_DESIGN_SYSTEMS_CATALOG.md](libraries/GOOGLE_DESIGN_SYSTEMS_CATALOG.md) |

## Not in the kit (referenced only)
- `~/wda/fluid-functionalism/` (`@fluid` source, 83 items), `~/wda/easeui-registry/` (54 components), `~/wda/motion-ai-kit/`: WDA projects with their own `node_modules`.
- `~/wda/skills/`: an older, git-tracked copy in the WDA repo. **Retired: nothing in the kit reads it. The kit is canonical.**
- `~/design-agents/.agents/skills/`: imported into the kit's design-craft, platform-design, design-tooling and ux-content plugins (2026-11-11). Superseded.
- `~/moodboards/skills/`: a legacy copy, left untouched.
- Skill `demo/` folders are on disk but git-ignored (≈100 MB of media).
