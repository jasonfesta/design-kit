# the `4 x 3 = 12` `2k` matrix & deep hub-and-spoke prompt template (`image-gen`)

---

## 1. complete `4 x 3 = 12` allocation & reference conditioning graph

Every slot `02..12` attaches **`01-web-01.png` (Anchor #1)** so global art direction, typography, palette, corner radii, and material tone never drift:

| slot | pillar | file path (`concepts/...`) | purpose & research grounding | reference image(s) | mandatory framing check |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`01`** | `web` | `web/01-web-01-<slug>.png` | **Web 1 (Primary Entry / Home)** — desktop + mobile-web design system anchor | benchmark layout crop OR `lock_and_verify_plates.py seed` canvas *(100% image-to-image)* | widescreen `2752x1536` `2K` lossless PNG (`min_edge >= 1024`), crisp header + hero + core proof |
| **`02`** | `web` | `web/02-web-02-<slug>.png` | **Web 2 (Navigation Order #2)** — primary catalog / product / roster + complete footer | `01` | `Nav #2` active, matches `01` gutters, **complete footer visible** |
| **`03`** | `web` | `web/03-web-03-<slug>.png` | **Web 3 (Navigation Order #3)** — booking / workflow / pricing / story + complete footer *(optional `+3` `390px` mobile-web companion plates when expanded web pack is requested)* | `01` | `Nav #3` active, matches `01` gutters, **complete footer visible** |
| **`04`** | `app` | `app/04-app-01-<slug>.png` | **App 1 (Tab / Flow 1 — Primary)** — locks mobile app header & persistent bottom tab bar | `01` | flat portrait/app `2k` capture (`0` phone bezel); `Tab 1` active |
| **`05`** | `app` | `app/05-app-02-<slug>.png` | **App 2 (Tab / Flow 2 — Secondary)** — core action, booking, or detail flow in same app | `01` + `04` (mobile shell lock) | identical tab bar geometry as `04` with `Tab 2` active |
| **`06`** | `app` | `app/06-app-03-<slug>.png` | **App 3 (Tab / Flow 3 — Tertiary)** — tracker, log, or live status flow in same app | `01` + `04` (mobile shell lock) | identical tab bar geometry as `04` with `Tab 3` active |
| **`07`** | `component` | `component/07-component-01-<slug>.png` | **Component 1** — distinct system UI widget #1 isolated on clean system ground | `01` | isolated component (`0` full app shell), generous studio margin |
| **`08`** | `component` | `component/08-component-02-<slug>.png` | **Component 2** — distinct system UI widget #2 (completely different job from `07`) | `01` + `07` | distinct component #2, shared border/token grammar |
| **`09`** | `component` | `component/09-component-03-<slug>.png` | **Component 3** — distinct system UI widget #3 (completely different job from `07, 08`) | `01` + `07` | **3 separate components total** (never 1 component 3 ways) |
| **`10`** | `experience` | `experience/10-experience-01-<slug>.png` | **Experience 1 (Unique Interactive Experience #1)** — e.g., spatial / 3D interactive previewer or studio canvas | `01` | bespoke interactive surface grounded in prompt + research |
| **`11`** | `experience` | `experience/11-experience-02-<slug>.png` | **Experience 2 (Unique Interactive Experience #2)** — e.g., playable micro-game, tactile physics sandbox, or interactive simulation | `01` | completely distinct interactive mechanic from `10` |
| **`12`** | `experience` | `experience/12-experience-03-<slug>.png` | **Experience 3 (Unique Interactive Experience #3)** — e.g., bespoke configurator, live mixer, or guided interactive story | `01` | **3 unique experiences total**, unified by `01-anchor` & `canon.md` |

---

## 2. deep 7-layer prompt template (`prompts/<NN>-<slug>.md`)

```markdown
# slot <NN>/12 · <pillar> · <slug>

- **pillar**: `<web | app | component | experience>`
- **target 2k dimensions**: `<W>x<H>` (`--image_size=2k`)
- **reference inputs**:
  - `image 1`: `<path to 01-web-01.png>` (locked visual-system & art-direction authority)
  - `image 2` *(optional)*: `<path to 04-app-01.png or 07-component-01.png>` (<shell/framing role>)
- **mapped flow destination (`coverage.md`)**: `<page, tab, component, or experience>`
- **nano banana round ledger**: `round 1 of max 3`

## exact nano banana 2 prompt

[LOCKED STYLE CONSTITUTION — COPIED VERBATIM FROM 01-ANCHOR]
Use case: ui-mockup. Create one complete, studio-grade 2K raster design plate for the original fictional <domain> <BrandName>. Flat orthographic screen capture with zero device bezel, zero browser window chrome, zero angled 3D perspective desk, and zero external captions.
1. ART DIRECTION & MATERIAL WORLD: <physical surface metaphor, lighting warmth/direction, photographic lens/grain discipline, and anti-cliché rules synthesized from 10-benchmark research>.
2. TYPOGRAPHY & SURFACE-CALIBRATED ACCESSIBLE SCALE (MAX 2 WEB-SAFE GOOGLE FONTS — ZERO FONT-ROUND REDO):
   - Simulated Viewport -> 2K Canvas: <logical viewport e.g. 1440x810 CSS @ 1.91x = 2752x1536 | 390x844 pt @ 3.94x = 1536x2752 | 1440x900 CSS @ 1.82x = 2752x1536 | 720x540 stage @ 3.33x = 2400x1792>.
   - Primary Headline Voice (H1-H3): <physical stroke/aperture/terminal anatomy from font_scale_and_pairing.py pair for PrimaryFont; weight 600-700, -0.02em tracking>.
   - Companion Body & UI Voice (body, nav, controls, tables, footer): <physical anatomy from font_scale_and_pairing.py pair for Easy-Reading SecondaryFont; weight 400 body / 500 UI, 1.5 line height, tabular-nums>.
   - Scale & Copy-Measure Lock: <output of font_scale_and_pairing.py prompt-block --surface=... giving exact CSS px/pt + % of canvas height + max words/lines + chars/line measure + >= 16px body + >= 12px WCAG floor; NEVER print font names or pixel numbers on screen>.
3. CHROMATIC SYSTEM (8 TOKENS): primary ground <hex>, elevated surface <hex>, primary ink <hex>, muted ink <hex>, primary accent <hex> with <on-accent hex> label ink, secondary accent <hex>, crisp 1px hairline borders <hex> (<radius>px corners).
4. CANONICAL WORLD STATE: <exact wordmark rule + shared entities, IDs, people, prices, and statuses from canon.md>.

[SLOT COMPOSITION — <NN>/12 · <PILLAR> · <TITLE>]
Input image 1 is the approved <BrandName> visual-system reference; preserve its exact art direction, typography, palette, and border precision while creating ONLY the <pillar purpose> specified below.
Canvas: <W>x<H> (<orientation>).
5. RESEARCH-BACKED CADENCE & LAYOUT GEOMETRY: <column proportions, whitespace rhythm, and hierarchy adapted from research>.
6. ORDERED VISIBLE REGIONS & VERBATIM COPY:
   - Region A: <exact header/nav/HUD state + verbatim headings & controls>
   - Region B: <exact focal composition, interactive mechanics, cards/canvas/playfield & verbatim canon.md data>
   - Region C: <supporting controls + complete footer / persistent bottom tab bar / tactile interactive controls>
7. EXCLUSIONS: <zero copied benchmark logos/fonts/colors; zero missing footers on web 02-03; zero repeated single-component variants>.
```
