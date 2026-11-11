---
name: benchmark-interaction-planner
description: Generates a Post-4K-Grid High-Level Interaction Plan (INTERACTION_PLAN.md) mapped directly to 5-10 category-leading Competitor Benchmark URLs after grabbing and inspecting the 5 page layouts from a 4K website/app grid sheet and before running image-to-react synthesis. Verifies true 5:3 4K sheet geometry (catching square 1:1 FAL distortions), inspects every section across all 5 pages (01-homepage through 05-*), and specifies high-level interactive choreography (ambient video transport, swatch/filter selectors, macro detail lightboxes, comparison matrices, 6-angle PDP galleries, synchronized inline + drawer shopping bags, craft steppers, and repair concierge drawers) referenced to production benchmark URLs while locking t=0 geometry for s_total >= 0.93+.
---

# Benchmark Interaction Planner (`benchmark-interaction-planner`)

This skill defines the mandatory **Post-4K-Grid High-Level Interaction Planning Stage** (`Stage 1.5`) that bridges **4K Grid Layout Extraction** and **Image-to-React Golden Template Synthesis** ([`image-to-react`](../image-to-react/SKILL.md) / [`react-extractor`](../react-extractor/SKILL.md)).

> [!IMPORTANT]
> **Why This Skill Exists**:
> If an agent grabs the 5 page layouts from a 4K grid sheet and jumps straight into slicing assets and writing JSX, the resulting React build becomes a static poster with superficial button clicks.
> By running **`benchmark-interaction-planner`** immediately after grabbing and viewing the 5 page layouts from the 4K grid:
> 1. We verify we are starting from the **true 5:3 4K image** (`4096 × 2458` / `5504 × 3072` / `5312 × 3200`, `1:3` per column — never a distorted `1:1` square sheet).
> 2. We inspect every section of all 5 pages (`01-homepage` .. `05-*`) and author a formal **High-Level Interaction Plan (`INTERACTION_PLAN.md`)**.
> 3. Every high-level interaction across all 5 pages explicitly references **5 to 10 production Competitor Benchmark URLs** (e.g., Polène Paris, Bottega Veneta, Loewe, Hereu Studio, Wandler, Manu Atelier, Aesop, Khaite, Jacquemus, Celine) while keeping the `t=0` visual state 1:1 locked to the 4K reference slice (`s_total >= 0.93+`).

---

## 1. Where `benchmark-interaction-planner` Fits in the 4-Pillar 4K Pipeline

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: TRUE 4K GRID VERIFICATION & 5-COLUMN SLICE EXTRACTION                │
│ • Verify true 5:3 4K sheet (`4096×2458`, `5504×3072`, or `5312×3200`)        │
│ • Reject/fix any 1:1 square FAL distortion (`4096×4096`) using the 5:3 4K    │
│ • Slice all 5 columns (`01-homepage` .. `05-*`) at canonical `1000 × 3000`   │
│ • View all 5 page layouts with `read_file`                                   │
└───────────────────────────────────────┬──────────────────────────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 2 (`benchmark-interaction-planner`): HIGH-LEVEL INTERACTION PLAN        │
│ • Load 5–10 category-leading Competitor Benchmark URLs for the vertical      │
│ • Write `websites/<brand>/INTERACTION_PLAN.md` + conversation artifact       │
│ • Map Global Cross-Page Systems + every section on Pages 1–5 to high-level   │
│   interactions explicitly referencing the Competitor Benchmark URLs          │
│ • Define the `t=0` Visual-Lock Rule for each interactive section             │
└───────────────────────────────────────┬──────────────────────────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 3 (`image-to-react` PILLAR 2): 2x RETINA PHOTOS & LOOPING VEO VIDEOS    │
│ • De-dither all photographic crops at `2x` Retina via `gempix-1`             │
│ • Strip baked-in raster text on hero/campaign plates; fix product mismatches │
│ • Generate looping Veo (`omni_1p2`) editorial films for video-poster stages  │
└───────────────────────────────────────┬──────────────────────────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 4 (`image-to-react` PILLARS 3 & 4): SYNTHESIS, EVAL & 6-VIEWPORT AUDIT  │
│ • Implement all planned interactions in `src/App.tsx` & `src/components/*`   │
│ • Embed offline Base64 WOFF2 fonts (`FontFace` guarded for JSDOM)            │
│ • Verify `s_total >= 0.93+`, `0` collisions, `0px` overflow across 5 pages   │
│ • Verify multi-viewport responsiveness (`375px` → `1920px+`) & right-pane    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Skill Directory Structure

```text
./skills/benchmark-interaction-planner/
├── SKILL.md                                           # Core instruction manual & 4-step workflow
├── scripts/
│   └── generate-interaction-plan.mjs                  # CLI auditor & generator: checks 4K geometry, slices 5 pages, validates/scaffolds INTERACTION_PLAN.md
├── references/
│   ├── competitor_benchmark_url_catalog.md            # Curated 5–10 Competitor Benchmark URLs for all 9 4K Websites + UI/Mobile/Chat categories
│   └── high_level_interaction_taxonomy.md             # 10 High-Level Interaction Patterns mapped to benchmark URLs + t=0 Visual-Lock rules
└── examples/
    ├── avela-homepage-interaction-plan.md             # Dual-Authority Responsive Desktop + Mobile Homepage Plan: Avela / Soft Form (01-website-avela)
    └── virel-interaction-plan-example.md              # 5-Column 4K Grid Sheet Plan: Virel (09-website-virel)
```

---

## 3. Step-by-Step Execution Protocol

### Step 3.1: Verify the True 4K Image & Inspect All 5 Sliced Layouts
1. Run `generate-interaction-plan.mjs` (or check image dimensions) on `websites/<brand>/input.png` and `websites/<brand>/output.png`:
   ```bash
   node ./skills/benchmark-interaction-planner/scripts/generate-interaction-plan.mjs \
     --website=./nano-banana-2-cleanup/websites/virel
   ```
2. **4K Geometry Guardrail**:
   - A 5-column 1:3 website sheet has a `5:3` (`1.6667`) aspect ratio (`4096 × 2458`, `5504 × 3072`, or `5312 × 3200`).
   - If `output.png` has `aspect_ratio_difference_percent > 10%` (such as Virel's `4096 × 4096` square FAL output), always use the true 5:3 4K `input.png` (`4096 × 2458`) + `2x` Retina `gempix-1` restored plates so photography and typography are never vertically stretched or double-rendered.
3. View all 5 column slices (`01-homepage.png` .. `05-*.png`) using `read_file` to inventory every visual section from top to bottom.

### Step 3.2: Load the 5–10 Competitor Benchmark URLs for the Archetype
Consult [`references/competitor_benchmark_url_catalog.md`](./references/competitor_benchmark_url_catalog.md) and select **5 to 10 production Competitor Benchmark URLs** for the target brand's vertical:
- **Sculptural Leather Goods & Warm Editorial Luxury D2C (`Virel`, `Avela`, `Vellune`, `Mellore`)**:
  1. **Polène Paris** (`https://eng.polene-paris.com/`)
  2. **Bottega Veneta** (`https://www.bottegaveneta.com/`)
  3. **Loewe** (`https://www.loewe.com/`)
  4. **Hereu Studio** (`https://hereustudio.com/`)
  5. **Wandler** (`https://wandler.com/`)
  6. **Manu Atelier** (`https://www.manuatelier.com/`)
  7. **Aesop** (`https://www.aesop.com/`)
  8. **Khaite** (`https://khaite.com/`)
  9. **Jacquemus** (`https://www.jacquemus.com/`)
  10. **Celine** (`https://www.celine.com/`)
- See [`references/competitor_benchmark_url_catalog.md`](./references/competitor_benchmark_url_catalog.md) for the complete 5–10 URL tables for **Architecture & Interiors (`Stillhaven`, `Oriel`)**, **Artisanal Bakery & Aperitif (`Sundrop`)**, **Botanical Skincare (`Serein`)**, and **Ceramic & Tactile Tableware (`Terreno`)**.

### Step 3.3: Author `websites/<brand>/INTERACTION_PLAN.md` (and Artifact)
Write `websites/<brand>/INTERACTION_PLAN.md` containing four required sections (modeled after [`examples/virel-interaction-plan-example.md`](./examples/virel-interaction-plan-example.md)):
1. **4K Grid Source Verification & Geometry Audit**
2. **The 5–10 Competitor Benchmark URLs Table** (URL + primary interaction domain adopted)
3. **High-Level Global Cross-Page Interactions** (Persistent 5-page header nav, Live Search & Spotlight modal, Synchronized Dual-Mode Shopping Bag across inline cards + slide-over drawer, and Lower-Page Community/Newsletter chrome)
4. **Page-by-Page, Section-by-Section High-Level Interaction Plan (Pages 1 → 5)**:
   - Every visual block on Page 1 (`01-homepage`), Page 2 (`02-collection` / catalog), Page 3 (`03-<pdp>`), Page 4 (`04-studio-craft`), and Page 5 (`05-care-guidance`) must specify:
     - **4K Grid Section & Coordinates (`y`, `H`)**
     - **Visual Layout in 4K Grid**
     - **High-Level Interaction Plan** (what happens on user interaction, state sync, modal/drawer/video/filter choreography)
     - **Competitor Benchmark Reference** (explicit URL + pattern cited)

### Step 3.4: Enforce the `t=0` Visual-Lock Contract During React Implementation
When feeding `INTERACTION_PLAN.md` into [`image-to-react`](../image-to-react/SKILL.md):
- **At `t=0` (initial headless render for `?screen=0` .. `?screen=4`)**: Every section height, image bounding box, active pill (`All`), default swatch (`Wine`), and inline bag state (`1 × Gesture = $480`) matches the 4K reference slice 1:1 (`s_total >= 0.93+`, `0` collisions, `0px` overflow).
- **On User Interaction (`t > 0`)**: Every control executes its high-level benchmark interaction (live `<video>` Play/Pause/Scrub/Mute, live swatch & filter switching, 6-angle PDP gallery switching, `cm / in` dimension unit toggling, macro material/hardware inspection drawers, smooth-scroll care index anchors, and 3-step repair request drawer).
