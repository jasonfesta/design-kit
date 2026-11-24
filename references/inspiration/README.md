# Inspiration references — design engineering

Deep-dive notes on the people, labs and galleries that set the bar for **interaction craft, motion, WebGL UI and landing-page taste**. Each file: who/what, full catalog of components or experiments where feasible, techniques & tech stack, and **what to borrow** into kit skills and Golden Template builds.

- Captured **2026-11-11**. Screens in [screens/](screens/) (4.9 MB): `whitespace/` = 30 official experiment posters; `og/` = 24 site social/OG cards. Headless Chrome screenshots were not possible on this host (Chrome launches CRD remoting and never writes the PNG), so posters/OG images are the visual record.
- Library catalogs these sources reference: [../../libraries/](../../libraries/README.md) (`ui-primitives.md`, `motion.md`, `3d.md`, `icons.md`, `fonts.md`).

## Primary deep dives (requested)
| Source | File | Depth | Highlights |
| :--- | :--- | :--- | :--- |
| **experiments.thisiswhitespace.com** (Zsolt Kacso) | [thisiswhitespace.md](thisiswhitespace.md) | **All 30 experiments** w/ author descriptions, tags, posters, technique fingerprint | Shader/WebGL UI controls (glass toggle, liquid progress, burning OTP), HTML-in-Canvas, R3F heroes, DialKit tuning |
| **Emil Kowalski** (emilkowal.ski, animations.dev, aiforui.dev, Sonner, Vaul) | [emil-kowalski.md](emil-kowalski.md) | All 7 articles with section maps + rules cheat sheet; course module map | <300 ms, ease-out, no scale(0), origin-aware, don't animate frequent/keyboard actions; Sonner/Vaul internals |
| **affectUI** | [affectui.md](affectui.md) | **All 178 items** (91 components, 39 screens, 14 blocks, 26 illustrations, 8 motion) w/ Free/Pro tier + "when to use" | Agent-observability UI vocabulary; single-file React-only components; MCP + agent skill |
| **palletism** (taste packs for AI images) | [palletism.md](palletism.md) | 6 public packs + MCP | Palette hex + font pairs + exact prompts + agent-readable dos/don'ts per look; MCP `match_taste` (key needed) |

## Design engineers & labs
| Source | File | Highlights |
| :--- | :--- | :--- |
| Rauno Freiberg + Devouring Details | [rauno-devouring-details.md](rauno-devouring-details.md) | ~80 craft pieces; 8 interaction principles; 23-chapter reference manual |
| Paco Coursey | [paco-coursey.md](paco-coursey.md) | cmdk, next-themes; exclusion tabs, iOS menu, blur, macOS windows |
| Benji Taylor | [benji-taylor.md](benji-taylor.md) | Stageshow (skill), Agentation (visual feedback → agents), Liveline, Drawesome |
| Jhey Tompkins | [jhey-tompkins.md](jhey-tompkins.md) | ~860 prototypes; native CSS (anchor, scroll-driven, view transitions), liquid glass |
| Josh Puckett — Interface Craft | [interfacecraft-josh-puckett.md](interfacecraft-josh-puckett.md) | "Uncommon care" library; DialKit, Pica |
| Mariana Castilho — uilabs | [uilabs.md](uilabs.md) | 56 morph-in-place components w/ rationale |
| ui.land | [ui-land.md](ui-land.md) | Design-engineer interviews (Emil) |
| Josh W. Comeau | [josh-comeau.md](josh-comeau.md) | Interactive CSS/animation tutorials, shadows, `linear()` springs |

## Creative coding & 3D
| Source | File | Highlights |
| :--- | :--- | :--- |
| Codrops | [codrops.md](codrops.md) | GSAP/WebGL/OGL demos with source, case studies |
| WebGL.com / WebGPU.com | [webgpu-com.md](webgpu-com.md) | Real-time rendering showcase (Active Theory, Abeto, Media.Monks) |
| Three.js Journey | [threejs-journey.md](threejs-journey.md) | 87 lessons incl. WebGPU/TSL, baking |
| Motion examples | [motion-examples.md](motion-examples.md) | 300+ copy-paste Motion snippets (+ Motion MCP) |

## Galleries & reference libraries
| Source | File | Best for | Agent access |
| :--- | :--- | :--- | :--- |
| Godly | [godly.md](godly.md) | Motion-forward high-taste sites (video previews) | crawlable |
| Awwwards | [awwwards.md](awwwards.md) | Award-level creative web, tech-stack tags | crawlable |
| landing.love | [landing-love.md](landing-love.md) | Full-scroll landing videos by section | Cloudflare — manual |
| Mobbin | [mobbin.md](mobbin.md) | 600k+ shipped app/web screens & flows | ✅ **Mobbin MCP** (paid) |
| Refero | [refero.md](refero.md) | Web/iOS UI references by page type, font, color | paid |
| 60fps | [60fps.md](60fps.md) | Mobile micro-interaction shots, glossary | crawlable |
| Land-book | [land-book.md](land-book.md) | Landing pages w/ section & page-type filters | crawlable |
| Navbar Gallery | [navbar-gallery.md](navbar-gallery.md) | Navigation patterns | crawlable |
| One Page Love | [one-page-love.md](one-page-love.md) | One-page sites by style tag | crawlable |
| Minimal Gallery | [minimal-gallery.md](minimal-gallery.md) | Restraint, type-foundry sites | crawlable |
| Dark Mode Design | [dark-mode-design.md](dark-mode-design.md) | Dark UIs | crawlable |
| BentoGrids | [bento-grids.md](bento-grids.md) | Bento layouts | crawlable |
| Uiverse | [uiverse.md](uiverse.md) | Open-source CSS micro-elements | crawlable |
| Cosmos | [cosmos.md](cosmos.md) | Moodboarding, color search | app |
| Saaspo · Lapa Ninja · SiteInspire | [saaspo-lapa-siteinspire.md](saaspo-lapa-siteinspire.md) | SaaS/landing galleries | bot-protected — manual |

## How the kit uses these
- `research` / `jason-design-agent` Stage 1: pull the 5 benchmarks from Godly, Awwwards, landing.love, Land-book, Mobbin/Refero (pick visibly different ones).
- `interaction` / `feel` upgrades: Rauno, Paco, Jhey, uilabs, Emil rules.
- `3d-research` / `game-research` subagents: thisiswhitespace, Codrops, WebGPU.com, Awwwards WebGL tag.
- `inspiration-watcher` subagent: add this folder to its sync list.
