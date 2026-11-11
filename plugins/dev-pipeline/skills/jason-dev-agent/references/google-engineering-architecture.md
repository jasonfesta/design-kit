# Google Engineering Architecture & Technical Design Document (TDD)
## `jason-dev-agent`: Autonomous Frontend Engineering & Deterministic Code Synthesis

- **Author**: Principal Software Engineer, Google AI & Frontend Systems
- **Status**: Production-Ready / Export-Grade
- **Scope**: Canonical lowercase skills workspace (`/usr/local/google/home/jfesta/design-kit/skills/`)

---

## 1. Executive Summary

`jason-dev-agent` is the master frontend software engineering coordinator paired with `jason-design-agent`. It transforms curated design studies and 2K concept plates into production-grade, standalone **React 19 + Vite 7 + Tailwind v4** applications built to the canonical Golden Template standard.

Where `jason-design-agent` owns visual taste, benchmark research, and plate generation, `jason-dev-agent` owns code synthesis, DOM architecture, CSS layout geometry, pixel accuracy, asset classification, Retina upscaling, accessibility compliance, responsive continuum flow, tactile physics, 60fps interaction budgets, and strict TypeScript compilation.

The coordinator enforces **8 deterministic developer steps**, executes an **automated 5-turn source check-back loop** (verifying against reference comps, style kits, and screen captures), and pauses at a **Designer Checkpoint** for human/designer review with zero premature automated handoffs.

---

## 2. System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     CURATED INPUT FROM DESIGN AGENT                     │
│  <study-slug>/selections.json (👍 picks) + concepts/** or nano/**       │
│  + style-direction/*.md + canon.md + research/captures/ / inspiration/   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                   STEP 1: REPLICATE-MOCK (BLUEPRINT)                  │
 │  • Extract exact sRGB hex tokens & measure pixel geometries           │
 │  • Partition regions into 3 developer buckets:                        │
 │    1. native-code (HTML/Tailwind/SVG -> 0 upscaling)                  │
 │    2. crisp-media (plates >= 2x CSS dimensions -> 0 upscaling)        │
 │    3. upscale-queue (blurry / < 2x crops queued for Step 4)           │
 └───────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                   STEP 2: FONT-PAIRING (TYPE SYSTEM)                  │
 │  • Map Google Fonts to Primary (H1-H3), Secondary (body/UI), and     │
 │    optional Tertiary accent (<= 15% text budget)                      │
 │  • Wire --font-* tokens with monotonic modular type scale             │
 │  • Pass eval-font-pairing.py (0 fallback leaks, >= 90% role lock)     │
 └───────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                  STEP 3: IMAGE-TO-REACT (DOM MATCH)                   │
 │  • Synthesize modular React 19 architecture:                          │
 │    src/data/<domain>Data.ts, src/components/, src/App.tsx             │
 │  • Pass AutoRaterV1 eval-image-to-react.mjs (s_total >= 0.85/0.93)    │
 └───────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                   STEP 4: NANO-BANANA (RETINA UPSCALE)                │
 │  • Upgrade ONLY upscale-queue photo slots to exact 2x Retina CSS dims │
 │  • Zero hallucinated UI text; pass eval-image-readiness.py            │
 └───────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                   STEP 5: ACCESSIBILITY (WCAG 2.2)                    │
 │  • WCAG 2.2 AA contrast (>= 4.5:1 text, >= 3:1 large display)        │
 │  • Body font floor >= 16px at 1.5 line height (14px secondary floor)  │
 │  • Interactive control targets >= 24x24px (44x44px touch)             │
 │  • Visible focus rings & alt attributes; pass eval-accessibility.py   │
 └───────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                  STEP 6: RESPONSIVENESS (CONTINUUM)                   │
 │  • Single unified semantic DOM across 6 viewports:                    │
 │    320px, 375px, 768px, 1024px, 1440px, 1536px                       │
 │  • Zero horizontal overflow; pass eval-responsive-pair.mjs            │
 └───────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │              STEP 7: INTERACTION & FEEL (TACTILE & 60FPS)             │
 │  • 100% controls wired to React state (0 dead buttons)                │
 │  • Explicit [data-scroll-point] anchors & animation triggers          │
 │  • 60fps frame budget (<= 16.67ms), GPU transforms, :active press     │
 │  • Pass eval-interaction.py & eval-feel-and-scroll.py                 │
 └───────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │        STEP 7.5: 5-TURN AUTOMATED SOURCE CHECK-BACK LOOP              │
 │  • Turn 1: Grid Geometry vs. Reference Comp Plate                     │
 │  • Turn 2: Typography Anatomy & Scale vs. Style Kit                   │
 │  • Turn 3: Chromatic Polarity & Materiality vs. Style Kit             │
 │  • Turn 4: Micro-Spacing & Tout Architecture vs. Screen Captures      │
 │  • Turn 5: Full Regression Audit & Convergence Verification           │
 └───────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │              STEP 8: GOLDEN-TEMPLATE (LINT & PACKAGING)               │
 │  • Verify 4 root configs & 3-tier src/ layout (lint-golden-template)  │
 │  • Strict TypeScript compilation (tsc --noEmit exits 0)               │
 │  • Live headless DOM mount audit (verify_html_bundle.mjs)             │
 └───────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                          DESIGNER CHECKPOINT                          │
 │  • Present live build, receipt summary & open links in chat           │
 │  • PAUSE FOR HUMAN DESIGNER REVIEW (Zero automated handoff)           │
 └───────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Engineering Subsystems

### 3.1 Replicate-Mock & Asset Classification (`replicate-mock`)
- **Pixel & Token Blueprinting**: Samples exact sRGB hex values and CSS geometry before writing markup.
- **3-Bucket Asset Partitioning**:
  1. `native-code`: HTML5 tags, Tailwind utilities, and inline SVGs. Strictly forbids raster upscaling on buttons, badges, navbars, cards, and icons.
  2. `crisp-media`: Photographic plates and illustrations whose intrinsic pixel dimensions already satisfy $\ge 2 \times$ mounted CSS dimensions.
  3. `upscale-queue`: Low-resolution, blurry, or dithered crops requiring super-resolution in Step 4.

### 3.2 Typography System (`font-pairing`)
- **Role-Based Family Allocation**:
  - **Primary**: Display headings (H1–H3) carrying the brand voice.
  - **Secondary**: High-legibility body, navigation links, table cells, form inputs, and UI text.
  - **Tertiary (Optional, $\le 15\%$)**: Eyebrow tags, monospace code/metrics readouts, or tabular numeral counters.
- **Modular Type Scale**: Configured strictly in `src/index.css` via custom CSS properties (`--font-primary`, `--font-secondary`, `--font-tertiary`), preventing hardcoded font overrides or generic fallback leaks.

### 3.3 DOM Synthesis & AutoRaterV1 Match (`image-to-react`)
- **Canonical Architecture**:
  - `src/data/<domain>Data.ts`: Fully typed TypeScript interfaces and domain seed data.
  - `src/components/`: Modular, single-responsibility components (`<BrandLogo>.tsx`, `<FeatureCard>.tsx`, `<NavHeader>.tsx`).
  - `src/App.tsx`: Layout shell and interactive state container.
- **Visual Match Floor**: Evaluated via AutoRaterV1 64x64 cell loss scoring (`eval-image-to-react.mjs`) requiring $s_{total} \ge 0.85$ floor and $0.93$ target.

### 3.4 Targeted Retina Upscaling (`nano-banana`)
- **Surgical Super-Resolution**: Upgrades only members of `upscale-queue` to exact $2 \times \text{clientWidth} \times 2 \times \text{clientHeight}$ Retina dimensions using Nano Banana.
- **Anti-Hallucination Gate**: Eliminates baked-in raster text behind live HTML typography. Pass condition: `eval-image-readiness.py` reports zero blurry images.

### 3.5 Accessibility & Ergonomics (`accessibility`)
- **WCAG 2.2 AA Compliance**:
  - Contrast: $\ge 4.5:1$ for standard text, $\ge 3:1$ for large headings and essential UI boundaries.
  - Sizing Floor: Body text $\ge 16\text{px}$ with $\ge 1.5$ line height; secondary metadata floor $\ge 14\text{px}$; absolute zero sub-$12\text{px}$ text.
  - Control Targets: Minimum $24 \times 24\text{px}$ clickable area, recommended $44 \times 44\text{px}$ on mobile/touch viewports.
  - Focus & Semantics: Keyboard-navigable `:focus-visible` rings, descriptive `alt` tags on `<img>` elements, and valid document language attributes.

### 3.6 Responsive Continuum (`responsiveness`)
- **Single Semantic DOM**: Enforces responsive reflow across 6 canonical viewports (`320px`, `375px`, `768px`, `1024px`, `1440px`, `1536px`) from a single React DOM tree.
- **Forbidden Patterns**: Prohibits duplicate desktop/mobile trees (`hidden md:block` full-tree duplication) and CSS squashing.

### 3.7 Interaction, Feel & Frame Budget (`interaction` & `feel`)
- **Zero Dead Controls**: 100% of rendered buttons, tabs, sliders, toggles, and dropdowns must respond meaningfully to pointer and keyboard events.
- **Scroll Points & Triggers**: Explicit `[data-scroll-point]` IntersectionObserver anchors and `data-state="open|closed"` animation triggers while keeping initial $t=0$ render visually locked.
- **Tactile Physics**: Subtle `:active` scale (`scale-[0.98]`), capability-gated `@media (hover: hover)`, and GPU-composited transform/opacity transitions (`0 transition-all`).
- **Frame Budget**: Verified via `eval-feel-and-scroll.py` ensuring effective scroll frame rate $\ge 55\text{--}60\text{fps}$ with $\le 2$ dropped frames over $34\text{ms}$.

---

## 4. The Dev Flywheel: Automated 5-Turn Source Check-Back Loop (40-Minute Timeout)

Positioned immediately after Step 7, the **Dev Flywheel** (`run_dev_flywheel.py` / `run_checkback_loop.py`) executes an automated, continuous verification loop across 5 canonical check-back targets. It loops and self-patches until all 5 targets pass or until hitting the **40-minute wall-clock timeout ceiling (2400 seconds)**:

1. **Turn 1: Grid Geometry & Scale** $\rightarrow$ Checks container widths, flex/grid tracks, and visual cell alignment against the **Reference Comp Plate**.
2. **Turn 2: Typography & Scale** $\rightarrow$ Audits family roles, line heights, letter-spacing, and tabular numerals against the **Style Kit & Google Fonts**.
3. **Turn 3: Chromatic Polarity** $\rightarrow$ Verifies 90/10 color polarity, background-to-surface contrast, and border opacities against the **Style Kit & Comp Plate**.
4. **Turn 4: Micro-Spacing & Touts** $\rightarrow$ Enforces button optical padding ($2:1$ ratio), badge pills, and avatar stacks against **Screen Captures & Inspiration** (auto-strips banned middle dots $\cdot$).
5. **Turn 5: Full Regression Audit** $\rightarrow$ Validates composite convergence ($s_{total} \ge 0.93$, zero collisions, zero dead controls, valid bundle mount).

---

## 5. Golden Template Linting & Bundle Verification

- **Config Parity**: Validates the canonical 4 root files (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`) using `lint-golden-template.mjs --fix`.
- **Strict Compilation**: Invokes `tsc --noEmit` ensuring zero type errors, zero unassigned parameters, and zero implicit `any`.
- **Headless Mount Audit**: Executes `verify_html_bundle.mjs` against `dist/index.html` inside a sandboxed VM to ensure:
  - Zero unescaped JavaScript/CSS string leakage.
  - Zero runtime syntax errors.
  - Successful mounting of `#root` with non-empty DOM child nodes.

---

## 6. Designer Checkpoint Protocol

`jason-dev-agent` does **not** perform an automated handoff back to `jason-design-agent`. Instead, upon passing all 8 steps and the 5-turn check-back loop, the agent pauses at the **Designer Checkpoint**:
1. Prints the project slug, build path, and working `open build` link directly in chat.
2. Displays the verified receipt summary table from `run_dev_loop.py`.
3. Waits for human/designer review and surgical design requests.
