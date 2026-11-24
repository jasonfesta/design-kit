# 4K Website Upgrade Protocol — 4 Pillars: Competitor Benchmarks, Visual Match & Micro-Layout Score, 2x Retina Photos & Looping Videos, and Multi-Viewport Responsiveness

This reference manual defines the mandatory **4-Pillar 4K Website Upgrade Pipeline** for transforming 5-column 4K website grid sheets (`input.png` / `output.png` → 5 connected pages: `01-homepage` .. `05-*`) into production-grade Google Golden Template (`React 19` + `Vite 7` + `Tailwind v4`) applications.

---

## Overview: The 4 Pillars (In Execution Order)

Before synthesizing or upgrading any 4K 5-page website inside `projects/<NN>-website-<slug>/`, execute these four pillars as a unified pipeline:

1. **Pillar 1 — Original Research & Competitor Benchmark URLs + Post-4K-Grid High-Level Interaction Plan (`INTERACTION_PLAN.md`)**:
   - Gather **5 to 10 category-leading production Competitor Benchmark URLs** matching the exact vertical of the 4K website sheet (e.g., Sculptural Leather & Warm Editorial D2C for **Virel** and **Avela**).
   - **Mandatory Post-4K-Grid Interaction Planning Step**: Immediately after grabbing and visually inspecting the 5 page layouts from the 4K grid (`01-homepage` .. `05-*`), write a formal **High-Level Interaction Plan** (`websites/<brand>/INTERACTION_PLAN.md` and a conversation artifact) *before* writing or updating React code.
   - Every section across all 5 pages must be mapped to a **high-level interaction pattern** that explicitly references one or more of the **Competitor Benchmark URLs** (e.g., Polène Paris, Bottega Veneta, Loewe, Hereu Studio, Wandler, Manu Atelier, Aesop, Khaite, Jacquemus, Celine) — defining how global navigation, video-poster stages, silhouette/leather swatch selectors, macro detail triads, comparison matrices, PDP galleries, craft steppers, and care/repair drawers behave dynamically **without changing the `t=0` 4K reference layout**.
2. **Pillar 2 — 2x Retina Photos (`gempix-1`) & Looping Editorial Videos (`Veo omni_1p2`)**:
   - Extract every photographic bounding box across all 5 pages from the normalized `1000 × 3000` (and/or `1101 × 3072`) 4K column slices.
   - Restore and de-dither every photographic plate at **`2x` Retina resolution** via `gempix-1` (omitting `-no-thoughts`, stripping baked-in raster text on hero/banner plates, applying temporary vertical padding for `> 4:1` ultra-wide banners, and applying any brief-mandated product corrections such as showing the cognac **Cove** bucket on *"Make room for Cove"*).
   - Generate **looping ambient editorial videos** via Veo (`omni_1p2`) for the homepage video-poster stage (paired with live working **Pause/Play** and **Mute/Unmute** controls) and key editorial/campaign plates, backed by `2x` Retina poster frames and JSDOM `.play()` / `.pause()` guards.
3. **Pillar 3 — Visual Match & Micro-Layout Score (`s_total >= 0.93+`, `0` Violations)**:
   - Embed offline Base64 WOFF2 fonts (e.g., `Cormorant Garamond` `400/500/600` normal & italic + `DM Sans` `400/500/700`) with a JSDOM `typeof FontFace === 'undefined'` guard so headless WebKit2GTK and local right-pane rendering have zero typography drift.
   - Lock exact section heights, image bounding boxes (`width`, `height`, `maxWidth: 'none'`), and typographic coordinates to the `1000 × 3000` 4K reference slice.
   - Run `eval-image-to-react.mjs` (or `eval-multi-screen-project.mjs`) across all 5 screens (`?screen=0` .. `?screen=4`) until achieving:
     - `s_total >= 0.93` (minimum hard gate `>= 0.85`, target lab bar `0.93–0.96+`)
     - `collision_count == 0`
     - `horizontal_overflow_px == 0`
     - `clipped_text_count == 0`
     - `button_padding_violations == 0`
     - `grid_equality_violations == 0`
4. **Pillar 4 — Multi-Viewport Responsiveness (`375px` Mobile → `1920px+` Desktop)**:
   - Verify all 5 pages across **6 canonical viewports**:
     - `375 × 812` (Mobile Portrait)
     - `768 × 1024` (Tablet Portrait)
     - `1000 × 3000` (Canonical `1:3` 4K Column Reference Lock)
     - `1101 × 3072` (Native 4K Sheet Slice Viewport)
     - `1440 × 900` (Standard Laptop)
     - `1920 × 1080` (Full HD / 4K Desktop Monitor)
   - Ensure `0px` horizontal overflow (`scrollWidth <= clientWidth`), `100%` loaded images (`brokenImages == 0`), and proportional viewport scaling (`zoom: calc(100vw / 1000px)` below `1000px` + centered `#EAE4DC` warm studio surround above `1000px`).

---

## Pillar 1: Original Research & Competitor Benchmark URLs (5–10 Sites per Category)

### Category A: Sculptural Leather Goods & Warm Editorial Luxury D2C (`09-website-virel` & `01-website-leather-goods` / Avela)

- **Original Provenance**:
  - In `nano-banana-2-cleanup/websites/virel/prompt.md` (historical moodboard, may be archived), **Polène Paris** is explicitly documented as the direct category archetype (*"Keep Virel original, with no Polène branding or borrowed product design"*).
  - Source imagery lineage: [`github.com/jasonfesta/WDA`](https://github.com/jasonfesta/WDA) and [`design-agents/resources/inspiration-websites.md`](file:///usr/local/google/home/jfesta/design-agents/resources/inspiration-websites.md).

#### 10 Competitor Benchmark URLs & Section-Level Engineering Map for Virel (`09-website-virel`)

| # | Competitor Benchmark | Production URL | Virel Section(s) Mapped | Engineering & Interaction Quality to Mirror (Without Changing Virel's Layout) |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Polène Paris** *(Direct Archetype)* | `https://eng.polene-paris.com/` | • **Page 1 (`Home`)**: *Objects in motion* & *Gesture, held close*<br>• **Page 2 (`Collection`)**: *The Virel collection* (`Gesture $480`, `Cove $420`, `Trace $360`) | • Sculptural leather silhouette cards framed on sun-warmed travertine stone plinths.<br>• Live leather finish swatch pills (`Wine Pebbled`, `Cognac Smooth`, `Camel Grain`, `Warm Sand`) that update card accent metadata and selected state.<br>• 3-up macro detail triad (*The silhouette*, *The bronze clasp*, *The suede interior*) with `1px` hairline borders and `scale(1.02)` cubic-bezier hover physics. |
| **2** | **Bottega Veneta** | `https://www.bottegaveneta.com/` | • **Page 1 (`Home`)**: Hero stage (*A gesture, carried forward*) & *A courtyard, a passing hour* video-poster player bar (`0:08` / pause / mute controls) | • Full-bleed editorial video-poster stage powered by a seamless looping Veo (`omni_1p2`) MP4 + `2x` Retina poster fallback.<br>• Live, functional **Play/Pause** toggle, **scrubbing progress bar (`0:08`)**, and **Mute/Unmute** volume controls that actually control the `<video>` element (`videoRef.current.pause()` / `.play()`, `.muted`). |
| **3** | **Loewe** | `https://www.loewe.com/` | • **Page 1 (`Home`)**: *The line under the hand* & *The things that come along*<br>• **Page 4 (`Our story`)**: *Choose by touch* & *Refine the contact points* | • Tactile material macro photography (`2x` Retina `gempix-1` full-grain wine pebbled calfskin & brushed bronze clasp).<br>• Editorial split rows pairing `Cormorant Garamond` display headlines with `DM Sans` body copy and underlined directional CTAs (`Our collection →`, `View specifications →`). |
| **4** | **Hereu Studio** | `https://hereustudio.com/` | • **Page 4 (`Our story`)**: 7-section workshop narrative (*Before the object, a gesture* → *Start with a line* → *Follow the cut* → *Make the join* → *Watch it in motion*)<br>• **Page 5 (`Care`)**: *Hold on to the details* | • Step-by-step artisanal leatherworking chronology with pattern-sketch, cutting-knife, and saddle-stitching macro triptychs.<br>• Practical leather care cadence (*After a day out*, *Give it a place to rest*, *When the weather changes*, *Let the surface tell its story*, *Look after the small parts*). |
| **5** | **Wandler** | `https://wandler.com/` | • **Page 2 (`Collection`)**: *Find your form* filter bar (`All`, `Gesture`, `Cove`, `Trace`) & 3-column product catalog grid | • Interactive pill filter bar (`All`, `Gesture`, `Cove`, `Trace`) that highlights or filters the 3 core silhouettes while keeping the default `All` state 1:1 locked to the 4K reference screenshot.<br>• Interactive 4-dot leather color swatches (`#3D1E22`, `#9E5B36`, `#3A2B26`, `#DECBB7`) per product card. |
| **6** | **Manu Atelier** | `https://www.manuatelier.com/` | • **Page 2 (`Collection`)**: *Compare the everyday details* 3-column specification matrix & *Make room for Cove* / *Go lightly with Trace* | • Side-by-side 3-column comparison table (`Gesture`, `Cove`, `Trace`) with vertical `1px` hairline dividers and `tabular-nums` dimension readouts (`30 × 22 × 10 cm`, `22 × 26 × 14 cm`, `26 × 16 × 9 cm`).<br>• Correct product identity on *Make room for Cove* (cognac tall bucket bag, per `virel/prompt.md`). |
| **7** | **Aesop** | `https://www.aesop.com/` | • **All 5 Pages**: Warm parchment/travertine surface palette (`#F6F2EC`, `#EFE9DF`, `#F3DEC0`, `#3A1F21`, `#241817`) & accordion drawers | • Warm editorial surface layering without muddy beige collapse.<br>• Smooth, zero-layout-shift expandable specification & FAQ drawers (*Before you choose*, *A few useful answers*, *Find the right next step*). |
| **8** | **Khaite** | `https://khaite.com/` | • **Page 1 (`Home`)**: *Ways of wearing the same thought* 3-portrait styling triptych & *Studies in leather and light* journal triad | • 3-portrait editorial lookbook triptych showing `Gesture` worn three ways (over a dark coat shoulder, with a cream linen dress in a courtyard, and tucked under the arm) alongside an editorial text block.<br>• 3-card journal grid (*Studies in leather and light*) with interactive article reader modal/drawer. |
| **9** | **Jacquemus** | `https://www.jacquemus.com/` | • **Page 3 (`Gesture` PDP)**: 6-thumbnail vertical gallery + main stage + finish swatches + quantity stepper + *Open to the everyday*<br>• **Pages 2 & 3**: Inline Shopping Bag card (`1 × Gesture = $480`) | • Interactive 6-thumbnail vertical gallery on the `Gesture` PDP (`Three-quarter studio`, `Front profile`, `Shoulder strap drop`, `Carried in courtyard`, `Brushed bronze clasp`, `Interior smartphone pocket`).<br>• Live quantity stepper (`- 1 +`) and working inline Shopping Bag widget (`1 × Gesture`, subtotal `$480`, plus slide-over bag drawer). |
| **10** | **Celine** | `https://www.celine.com/` | • **Page 3 (`Gesture` PDP)**: *Measured with intention* (`Width 30 cm · Height 22 cm · Depth 10 cm`)<br>• **All 5 Pages**: Header, Testimonial band (*In good company with Virel*), *Virel in the everyday* 4-tile strip, *Letters from Virel* newsletter, and dark espresso footer | • Architectural dimension diagram overlay on the product photograph (`30 cm × 22 cm × 10 cm`, strap drop `24–32 cm`, weight `approx. 380 g`).<br>• Consistent global chrome across all 5 pages: top nav (`Home`, `Collection`, `Gesture`, `Our story`, `Care`, Search, `Bag (1)`), amber testimonial strip, 4-tile community strip, newsletter signup with live confirmation toast, and footer navigation. |

---

### Competitor Benchmark URLs for the Remaining 8 Website 4K Grid Categories

Whenever running the 4K upgrade on any of the other 8 Website 4K Grid sheets in [`warm-landing-page/`](file:///google/data/rw/users/jf/jfesta/moodboards/warm-landing-page) or `nano-banana-2-cleanup/websites/` (historical moodboard, may be archived), load the corresponding 5–8 Competitor Benchmark URLs in Stage 0:

1. **`02-website-interiors` / Stillhaven** (*Architectural Interiors & Tactile Furniture*):
   - **Menu / Audo Copenhagen** (`https://audocph.com/`), **Vitra** (`https://www.vitra.com/` & `https://findmy.vitra.com/en-en/questionnaire/chairs`), **Frama Copenhagen** (`https://framacph.com/`), **Gubi** (`https://gubi.com/`), **TRNK NYC** (`https://trnk-nyc.com/`), **Carl Hansen & Søn** (`https://www.carlhansen.com/`), **Bolia** (`https://www.bolia.com/`).
2. **`03-website-architecture` / Oriel** (*Spatial Architecture & Daylight Monographs*):
   - **CLOU Architects** (`https://www.clouarchitects.com/`), **Norm Architects** (`https://normcph.com/`), **John Pawson** (`https://www.johnpawson.com/`), **Studio Mumbai / Bijoy Jain**, **Chipperfield Architects** (`https://davidchipperfield.com/`), **Olson Kundig** (`https://olsonkundig.com/`), **Snøhetta** (`https://snohetta.com/`).
3. **`04-website-bakery` / Sundrop** (*Artisanal Sourdough & Orchard Bakery*):
   - **Tartine Bakery** (`https://tartinebakery.com/`), **Poilâne Paris** (`https://www.poilane.com/`), **Hart Bageri Copenhagen** (`https://hartbageri.com/`), **Juno the Bakery**, **Balthazar Bakery** (`https://balthazarbakery.com/`), **Levain Bakery** (`https://levainbakery.com/`), **Flamingo Estate** (`https://flamingoestate.com/`).
4. **`05-website-skincare` / Serein** (*Botanical Barrier Skincare & Apothecary*):
   - **Aesop** (`https://www.aesop.com/`), **Susanne Kaufmann** (`https://www.susannekaufmann.com/`), **Grown Alchemist** (`https://grownalchemist.com/`), **corpus naturals** (`https://corpusnaturals.com/`), **Le Labo** (`https://www.lelabofragrances.com/`), **Nécessaire** (`https://necessaire.com/`), **Frama Apothecary** (`https://framacph.com/`).
5. **`06-website-aperitif` / Vellune** (*Botanical Non-Alcoholic & Herbal Aperitif*):
   - **Ghia** (`https://drinkghia.com/`), **De Soi** (`https://drinkdesoi.com/`), **Seedlip** (`https://www.seedlipdrinks.com/`), **Kin Euphorics** (`https://www.kineuphorics.com/`), **Three Spirit** (`https://threespiritdrinks.com/`), **Aplós** (`https://aplos.world/`), **Wilderton** (`https://wildertonfree.com/`).
6. **`07-website-terreno` / Terreno** (*Wheel-Thrown Stoneware & Ceramic Tableware*):
   - **East Fork Pottery** (`https://www.eastfork.com/`), **Heath Ceramics** (`https://www.heathceramics.com/`), **Hasami Porcelain** (`https://hasami-porcelain.com/`), **Kinto** (`https://kinto-usa.com/`), **Jars Céramistes** (`https://www.jarsceramistes.com/`), **khwurtz** (`https://khwurtz.dk/`).
7. **`08-website-mellore` / Mellore** (*Raw Beeswax & Brass Candle Craft*):
   - **Loewe Home Scents** (`https://www.loewe.com/`), **Trudon** (`https://trudon.com/`), **Diptyque** (`https://www.diptyqueparis.com/`), **Flamingo Estate Candles** (`https://flamingoestate.com/`), **Astier de Villatte** (`https://www.astierdevillatte.com/`), **Byredo Home** (`https://www.byredo.com/`).

---

## Pillar 1.5: Mandatory Post-4K-Grid High-Level Interaction Plan (`INTERACTION_PLAN.md`)

Right after grabbing and viewing the 5 column layouts (`01-homepage` .. `05-*`) from the 4K grid — and **before** writing or modifying React components — you MUST create `websites/<brand>/INTERACTION_PLAN.md` (and present it as an artifact).

### Required Structure of `INTERACTION_PLAN.md`
1. **4K Grid Source Verification**:
   - Confirm the true 5:3 4K sheet (`4096 × 2458` / `5504 × 3072` / `5312 × 3200`) and verify that each of the 5 sliced pages (`1000 × 3000` canonical 1:3 lock) has intact proportions before planning interactions.
2. **Global Cross-Page Interactive Architecture (Referenced to Competitor Benchmark URLs)**:
   - Document persistent state shared across all 5 pages: Header navigation (`Home`, `Collection`, `<Hero Product>`, `Our story`, `Care`), Instant Search & Silhouette Spotlight modal, Persistent Shopping Bag state (synced between the top-nav `Bag (N)` pill, inline bag summary cards on Pages 2 & 3, and the slide-over Bag drawer), and deep-linked page/scroll transitions.
   - Cite the exact **Competitor Benchmark URLs** governing each global flow.
3. **Page-by-Page, Section-by-Section High-Level Interaction Matrix (Pages 1 → 5)**:
   - For each of the 5 pages (`01-homepage` .. `05-*`), list every layout block in top-to-bottom visual order:
     - **4K Grid Layout Section & Coordinates (`y`, `height`)**
     - **High-Level User Interaction & State Choreography** (what happens on hover, click, swatch change, filter selection, video transport control, gallery selection, or modal/drawer trigger)
     - **Referenced Competitor Benchmark URL(s)** (e.g., `https://eng.polene-paris.com/`, `https://www.bottegaveneta.com/`, `https://www.loewe.com/`, `https://hereustudio.com/`, `https://wandler.com/`, `https://www.manuatelier.com/`, `https://www.aesop.com/`, `https://khaite.com/`, `https://www.jacquemus.com/`, `https://www.celine.com/`) and what specific behavior from that benchmark is emulated
     - **`t=0` Visual-Lock Rule**: How the default state remains 100% faithful to the 4K reference slice (`s_total >= 0.93+`, `0` collisions) while unlocking rich interaction upon user engagement.

---

## Pillar 2: `2x` Retina De-Dithered Photos (`gempix-1`) & Looping Videos (`Veo omni_1p2`)

### 2.1 Extracting & De-Dithering All Photographic Crops at `2x` Retina (`gempix-1`)
1. **Why De-Dithering is Mandatory**:
   - Individual crops extracted from a 5-column 4K sheet (`819px`–`1000px` per column) exhibit diffusion grain, soft details, or baked-in headline overlays.
   - Every photographic crop must be passed through `/google/bin/releases/gempix/gempix-1/gempix` (`BypassSandbox: true`, **never** pass `-no-thoughts`) at `2x` Retina resolution (`--image_size=2k` or resized strictly to `2×W × 2×H` of its CSS layout box).
2. **Ultra-Wide Banner Padding Rule (`aspect > 4:1`)**:
   - `gempix-1` rejects input crops wider than `4:1` aspect ratio (`Cannot articulate aspect ratio`).
   - For any banner with `W / H > 3.8`, pad the input PNG vertically with neutral parchment (`#F5F0E8`) to `W / H = 3.0`, run `gempix-1`, and crop the center band back to the exact `2×W × 2×H` target dimensions.
3. **Removing Baked-In Text Overlays**:
   - On full-bleed hero or mid-page campaign banners where live React HTML text + buttons sit on top of the photograph, prompt `gempix-1` to cleanly remove the baked-in raster lettering while preserving 100% of the subject, architecture, lighting, and bag geometry so live HTML typography never double-renders over ghosted raster text.

### 2.2 Looping Editorial Videos (`Veo omni_1p2`) & Live Video-Poster Controls
1. **Generating Seamless Editorial Motion**:
   - Use `/google/bin/releases/vr-video-awks/veo_cli/veo_cli` (`-model_name=omni_1p2`, `BypassSandbox: true`) starting from the `2x` Retina `gempix-1` still frame to generate subtle, cinemagraph-grade motion (breeze moving linen and hair in the courtyard, warm sunlight shifting across pebbled wine leather, or an artisan's hand smoothing a hide).
2. **JSDOM-Safe `<VideoPhoto>` / `<VideoPoster>` Component**:
   - Always guard `videoRef.current.play()` and `videoRef.current.pause()` with `typeof videoRef.current?.play === 'function'` so JSDOM smoke tests (`verify-html-bundle.mjs`) pass with `0` runtime errors.
   - Always render the `2x` Retina `gempix-1` PNG as an underlying `<img>` layer so headless WebKit2GTK evaluation (`eval-image-to-react.mjs`) captures the exact pixel-locked frame immediately even before the `<video>` buffers.
   - When the reference layout includes video player controls (such as Virel's homepage *A courtyard, a passing hour* transport bar with pause `||`, `0:08` timecode, progress track, and speaker mute buttons), wire those exact visual controls to toggle live playback and audio mute state on the `<video>` element!

---

## Pillar 3: Visual Match & Micro-Layout Score (`s_total >= 0.93+`, `0` Violations)

1. **Offline Base64 WOFF2 Font Embedding**:
   - Bundle `Cormorant Garamond` (`400`, `500`, `600`, `700` normal & italic) and `DM Sans` (`400`, `500`, `700`) as Base64 WOFF2 data URLs registered via `FontFace` (guarded by `if (typeof FontFace !== 'undefined')`) plus `@font-face` CSS rules so headless evaluation and offline artifact rendering never fall back to system serif/sans.
2. **Explicit Container & Image Sizing (`maxWidth: 'none'`)**:
   - Tailwind v4's preflight sets `img, video { max-width: 100%; height: auto; }`. On fixed-pixel photographic containers (`overflow-hidden`), always give the outer wrapper explicit `width` and `height` and apply `w-full h-full object-cover max-w-none` so images never shrink or leave uncovered background gaps.
3. **Closed-Loop Multi-Page Evaluation (`eval-image-to-react.mjs`)**:
   - Evaluate every single page (`?screen=0` .. `?screen=4`) at `1000 × 3000` (and `1101 × 3072`) and verify:
     - `s_total >= 0.93` across all 5 pages
     - `collision_count == 0`
     - `horizontal_overflow_px == 0`
     - `button_padding_violations == 0`
     - `grid_equality_violations == 0`

---

## Pillar 4: Multi-Viewport Responsiveness (`375px` Mobile → `1920px+` Desktop)

Every 4K 5-page website build must pass headless verification across all 6 canonical viewports:

| Viewport Tier | Dimensions | Expected Layout Behavior & Hard Gates |
| :--- | :--- | :--- |
| **Mobile Portrait** | `375 × 812` | Proportional CSS zoom scaling (`zoom: calc(100vw / 1000px)`) or responsive fluid stack; `0px` horizontal overflow (`scrollWidth == 375`), `100%` touch-accessible controls. |
| **Tablet Portrait** | `768 × 1024` | Proportional CSS zoom scaling (`0.768×`); `0px` horizontal overflow (`scrollWidth == 768`), crisp Retina imagery. |
| **4K Column Reference (`1:3`)** | `1000 × 3000` | **Exact 1:1 Reference Lock** (`1.0×`, `0px` margin, `s_total >= 0.93+`). |
| **Native 4K Slice** | `1101 × 3072` | Proportional `1.101×` lock (`0px` overflow, `s_total >= 0.93+`). |
| **Standard Laptop** | `1440 × 900` | Centered `1000px` editorial sheet on warm `#EAE4DC` studio surround with subtle elevation shadow; `0px` horizontal overflow. |
| **Full HD / 4K Desktop** | `1920 × 1080` | Centered `1000px` editorial sheet on warm `#EAE4DC` studio surround; `0px` horizontal overflow. |
