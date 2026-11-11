# cursory design-directory & craft sweep (`research` + `polish`)

In addition to crawling **Track A (Competitor / Domain Benchmarks)** and **Track B (Deep Inner-Design Touchstones)**, every `research` run—and every `polish` micro-research pass when a slot returns weak design—performs a **cursory sweep across the 19 curated design directories, component libraries, and craft portals** below.

Rather than deep-crawling all 19 sites blindly on every prompt, `research` runs a **targeted cursory pass mapped to the `4 x 3` deliverables** (`web`, `app`, `component`, `experience`, `footer`, `textures`, and `typography/icons`) to harvest fresh layout mechanics, footer architectures, animated component patterns, surface substrates, and brand-font blocklists.

---

## 1. the 19 curated design directories & craft sources (grouped by `4 x 3` role)

### a. award websites, landings, templates & full Figma systems (`web 01..03`)

| # | source | url | strength & what to scan during cursory research |
| :--- | :--- | :--- | :--- |
| `08` | **Godly** | https://godly.website | Award-caliber interactive & editorial commercial websites; scan category/style tags for hero composition, scroll pacing, and art direction. |
| `03` | **Landdding** | https://landdding.com | Top-notch production landing pages; scan vertical/industry tags for conversion hierarchy, value-prop rhythm, and section cadence. |
| `11` | **Recent Design** | https://recent.design | Next-level contemporary web & product design launches; scan for fresh layout proportions and anti-cliché visual moves. |
| `10` | **Footer Design** | https://footer.design | Dedicated website footer curation; **always scan for `web 01..03`** so complete footers have bespoke typographic colophons, newsletter modules, and index grids instead of generic link columns. |
| `15` | **Wonderlist Design** | https://wonderlist.design | 127 full Figma design systems & page layouts; scan for multi-page token consistency, grid spacing, and desktop-to-mobile structure. |
| `01` | **Modulify** | https://modulify.ai | Modular prompt-to-site architecture & structured section composition patterns. |
| `02` | **Modulify Templates** | https://modulify.ai/templates | Free modular website & landing page templates; scan for clean structural section blocks and responsive wireframe bones. |
| `17` | **Sent.dm** | https://sent.dm | Sharp developer/messaging micro-SaaS landing craft (pricing clarity, API/metric cards, crisp utility chrome). |
| `18` | **CloseIt.fast** | https://closeit.fast | High-velocity B2B/deal-closing landing craft (action-oriented hero hierarchy, compact proof strips, zero-fluff CTA ergonomics). |

### b. real production app screens & mobile UI motion (`app 04..06`)

| # | source | url | strength & what to scan during cursory research |
| :--- | :--- | :--- | :--- |
| `16` | **Mobbin** | https://mobbin.com | Real shipped iOS/Android app screens & end-to-end flows (`Tab 1 -> Tab 2 -> Tab 3`, onboarding, ordering, checkout, subscription/paywall sheets). |
| `09` | **60fps Design** | https://60fps.design | Smooth 60fps mobile UI animations, sheet detents, gesture transitions, and tactile state choreography. |

### c. animated UI components, motion sections & icon craft (`component 07..09`)

| # | source | url | strength & what to scan during cursory research |
| :--- | :--- | :--- | :--- |
| `14` | **beUI** | https://beui.dev | Open-source animated React / Tailwind / Motion UI components; scan for tactile sliders, tabs, counters, cards, and micro-controls. |
| `04` | **MotionIn Design** | https://motionin.design | Physics-based, cursor-responsive motion web sections (`1 prompt 1 website` / interactive blocks); scan for kinetic section & experience ideas. |
| `05` | **Iconly Design** | https://iconly.design | High-craft icon systems & app icon geometry; scan for consistent stroke weight (`1.5px`), corner optical balance, and custom badge metaphors. |

### d. textural backgrounds, brand typography, editorial systems & tactile motion (`experience 10..12` + tri-voice tokens)

| # | source | url | strength & what to scan during cursory research |
| :--- | :--- | :--- | :--- |
| `12` | **Backgrounds Supply** | https://backgrounds.supply | Curated background substrates, fine paper/film grain, subtle mesh/shader fields, and geometric surface patterns (feeds **Voice 1: Textural & Material**). |
| `06` | **FontInLogo** | https://fontinlogo.com | Identifies exact typefaces behind major brands; **scan competitors here to populate `avoid_fonts`** so our `google-font-selection` picks never copy incumbent brand fonts. |
| `07` | **On Design** | https://on.design | Design community curation & contemporary brand/interface showcases. |
| `13` | **Posts Design** | https://posts.design | Big-brand visual & typographic post systems; scan for tight typographic lockups, badge framing, and graphic ratio discipline. |
| `20` | **PaperAnimation.ai** | https://paperanimation.ai | Tactile paper-cut, newsprint collage, and physical fold motion aesthetics; scan when an editorial/tactile experience (`10..12`) benefits from physical paper craft. |

---

## 2. how to execute the cursory sweep cleanly (`<= 4` fast queries per run)

1. **during initial `research` (Stage 1)**:
   - Run **3–4 grouped cursory searches** (`search_web` with `site:` filters + optional headless capture of standout hits) alongside Competitor Research (`Track A`) and Deep Inner-Design Research (`Track B`):
     - **Web + Footer sweep**: `godly.website`, `landdding.com`, `recent.design`, `footer.design` (+ `wonderlist.design` / `modulify.ai/templates`).
     - **App + Mobile Motion sweep**: `mobbin.com` + `60fps.design` for real `Tab 1..3` flows and tactile mobile ergonomics.
     - **Component + Icon + Motion sweep**: `beui.dev`, `motionin.design`, `iconly.design` for distinct component & interactive experience mechanics.
     - **Texture + Brand Font Blocklist sweep**: `backgrounds.supply`, `paperanimation.ai`, `posts.design`, `on.design`, and `fontinlogo.com` (logging competitor brand fonts straight into `avoid_fonts`).
   - Record a concise **`## cursory directory sweep notes`** table inside `research/benchmarks.md` summarizing which specific patterns (`hero`, `footer`, `mobile flow`, `component`, `texture`, `avoid_fonts`) were harvested and adapted.
2. **during `polish` micro-research (Stage 4, Rounds 2–3 when a plate returns weak design)**:
   - Match the weak plate directly to its specialist directory:
     - Weak `web` layout or missing/generic footer -> check `godly.website`, `landdding.com`, `footer.design`.
     - Weak `app` screen -> check `mobbin.com`, `60fps.design`.
     - Weak `component` -> check `beui.dev`, `iconly.design`.
     - Weak `experience` or flat materiality -> check `motionin.design`, `backgrounds.supply`, `paperanimation.ai` (+ `interactive-3d-examples.md`).
