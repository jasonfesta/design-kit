# Visual Rubric & Image Screenshot → Output React Screenshot Evaluation Loop

This reference defines the deterministic **Image Screenshot → Output React Screenshot** visual verification rubric and iterative refinement loop lifted from:
- [`//prototypes/projects/agentic_design_loop/skills/screenshot_to_html`](file:///google/src/files/head/depot/google3/prototypes/projects/agentic_design_loop/skills/screenshot_to_html/SKILL.md) (`references/visual_rubric.md`)
- [`//prototypes/projects/agentic_design_loop/skills/visual_matcher`](file:///google/src/files/head/depot/google3/prototypes/projects/agentic_design_loop/skills/visual_matcher/SKILL.md) (`AutoRaterV1`)
- [`//prototypes/projects/cruxy/skills/html_to_search_vibes`](file:///google/src/files/head/depot/google3/prototypes/projects/cruxy/skills/html_to_search_vibes/SKILL.md) (`references/visual_rubric.md` & `references/audit_rules.md`)

---

## 1. Visual Evaluation Artifacts

Every evaluation pass run by [`scripts/eval-image-to-react.mjs`](../scripts/eval-image-to-react.mjs) outputs five artifacts into the target workspace:

| Artifact | Purpose |
| :--- | :--- |
| **`mockup.png`** | Normalized reference comp screenshot at exact evaluation dimensions $(W \times H)$. |
| **`rendered.png`** | Headless Chromium screenshot of the compiled React Golden Template (`dist/index.html`) rendered at identical $(W \times H)$ with `@2x` DPI, fonts settled, and inspector drawer closed. |
| **`rendered_overlay.png`** | 50% opacity alpha-blend of `rendered.png` over `mockup.png`. Reveals 2px–8px margin drift, button padding asymmetry, and card height mismatch immediately. |
| **`diff_mask.png`** | 64×64 structural block heatmap highlighting regions where rendered output diverges from the reference comp (`red` = high structural/chromatic divergence, `amber` = moderate shift, `transparent` = verified match). |
| **`visual_match_audit.json`** | Structured JSON report containing `s_total`, sub-scores, DOM collision metrics, button padding audits, and grid equality checks. |

---

## 2. Composite Visual Fidelity Score (`s_total`)

The evaluator computes a composite score $S_{\text{total}} \in [0.0, 1.0]$ and compares it against the pass threshold (`0.85` default, `0.90` for pixel-locked production comps):

$$S_{\text{total}} = 0.35 \cdot S_{\text{block}} + 0.25 \cdot S_{\text{edge}} + 0.20 \cdot S_{\text{chroma}} + 0.20 \cdot S_{\text{dom}}$$

Where:
1. **$S_{\text{block}}$ (64×64 Block Luminance & Color Correlation — 35%)**: Measures spatial alignment of macro containers, cards, hero imagery, and whitespace blocks across a 64×64 grid.
2. **$S_{\text{edge}}$ (Sobel Structural Edge Alignment — 25%)**: Measures alignment of card borders, 1px hairlines, button pills, and typographic baselines.
3. **$S_{\text{chroma}}$ (LAB Chromatic & Surface Polarity Fidelity — 20%)**: Verifies background canvas warmth/darkness, card surface step, and accent pill/button fills.
4. **$S_{\text{dom}}$ (DOM Geometry, Button Padding & Grid Equality Health — 20%)**: Starts at `1.0` and deducts penalties for any sibling bounding-box collision (`-0.15` each), horizontal overflow (`-0.25`), asymmetric button padding (`-0.05` each), or unequal sibling card widths/heights in a grid row (`-0.10` each).

---

## 3. Mandatory Full-Canvas Scan Protocol (Top / Middle / Bottom)

Never patch the first visible discrepancy and stop. In every iteration, inspect `mockup.png`, `rendered.png`, `rendered_overlay.png`, and `diff_mask.png` across all three vertical zones before editing React code:

### Zone A — Top Canvas (`0% – 25%` Y)
- **Header & Navigation Bar**: Check logo alignment, nav link spacing, right-hand status/CTA pill height, and bottom hairline border (`1px solid`).
- **Hero / Title Block**: Verify display headline line count (must match comp line breaks), eyebrow badge padding, and top margin clearance above the hero block.

### Zone B — Middle Canvas (`25% – 75%` Y)
- **Primary Multi-Column Grid / Bento / Split View**:
  - Verify column count and width ratios (`1fr 1fr`, `7fr 5fr`, `repeat(3, minmax(0, 1fr))`).
  - Verify every row of sibling cards has **identical card widths** ($\Delta w \le 1\text{px}$), **identical card heights** ($\Delta h \le 2\text{px}$), and **identical bottom border Y-coordinates** ($\Delta y \le 2\text{px}$).
  - Verify discontinuous vertical dividers (`w-px`) terminate cleanly at row boundaries instead of slicing through full-width banners.
- **Interactive Controls & Buttons**:
  - Check every `<button>`, pill, filter tab, and badge for symmetrical left/right padding (`paddingLeft === paddingRight`), centered vertical text/icon alignment, and bottom clearance from its container border ($\ge 8\text{px}$).

### Zone C — Bottom Canvas (`75% – 100%` Y)
- **Secondary Modules, Footers & Action Bars**:
  - Check that bottom cards or docked toolbars are neither clipped by `overflow: hidden` on a fixed-height ancestor nor floating with excessive dead space below.
  - Confirm that card footers / CTA rows align horizontally across all columns in the final row.

---

## 4. Prioritized Defect Rubric (P0 → P1 → P2)

Fix defects strictly in priority order. Never tune P2 color shades while P0 layout collisions or P1 button/grid inequalities exist.

### P0 — Structural & Geometric Blockers (Must be `0` to pass)
- **`P0-COLLISION`**: Overlapping sibling DOM bounding boxes (`collision_count > 0`) caused by negative margins, unguarded `position: absolute`, or fixed heights smaller than content.
- **`P0-OVERFLOW`**: Horizontal scrollbar (`documentElement.scrollWidth > innerWidth`) or text/buttons clipped outside their card container (`clipped_text_count > 0`).
- **`P0-TOPOLOGY`**: Wrong macro layout structure (e.g., 1-column stack where the comp shows a 3-column bento grid, or missing sidebar/header region).
- **`P0-EMPTY-MEDIA`**: Broken `<img>` tags, zero-dimension `<svg>` icons, or missing extracted raster crops from `public/assets/`.

### P1 — Component Craft, Button Padding & Grid Equality
- **`P1-BUTTON-ASYMMETRY`**: Left and right horizontal padding on a button/pill differ by $> 2\text{px}$ without a leading/trailing icon optical adjustment, or vertical padding differs by $> 2\text{px}$.
- **`P1-BUTTON-CROWDING`**: Button text wraps onto 2 lines (`white-space: nowrap` missing), icon-to-text gap is $< 6\text{px}$, or button sits $< 8\text{px}$ from the bottom edge of its parent card.
- **`P1-GRID-UNEQUAL-WIDTH`**: Columns in an equal grid row differ in rendered width by $> 2\text{px}$ (caused by `auto` tracks or missing `minmax(0, 1fr)`).
- **`P1-GRID-UNEQUAL-HEIGHT`**: Sibling cards in the same horizontal row have ragged bottom edges ($\Delta y > 2\text{px}$) because `items-stretch`, `h-full flex-col`, or `mt-auto` on the card footer is missing.
- **`P1-GUTTER-DRIFT`**: Horizontal or vertical gaps between adjacent cards in the same grid vary by $> 2\text{px}$.
- **`P1-LINE-COUNT`**: Headline or card title wraps to more lines than the reference comp, pushing downstream vertical coordinates out of alignment in `rendered_overlay.png`.

### P2 — Chromatic, Typographic & Tactile Polish
- **`P2-SURFACE-CONTRAST`**: Card background and border tokens blend into the canvas or reverse the reference polarity.
- **`P2-FONT-CATEGORY`**: Sans-serif used where the comp uses a high-contrast editorial serif or monospace numeric ticker (`tabular-nums`).
- **`P2-RADIUS-SHADOW`**: Border radius differs by more than one Tailwind step (e.g. `rounded-none` vs `rounded-2xl`) or heavy drop shadows obscure clean 1px hairlines.

---

## 5. Iterative Convergence Protocol (Up to 6 Cycles)

```text
Cycle 1: Synthesize Golden Template React files -> Build -> Render -> Audit
Cycle 2: Fix all P0 (collisions, overflow, macro grid tracks, missing assets)
Cycle 3: Fix all P1 (button padding symmetry, equal card widths/heights, line counts)
Cycle 4: Fix all P2 (exact hex tokens, border opacity, font weights, radius)
Cycle 5+: Fine-tune spatial coordinates using rendered_overlay.png until s_total >= 0.85
```

### Anti-Thrashing Guardrail
- Track `s_total` after every cycle.
- If an edit **reduces** `s_total` or increases `collision_count`, revert that specific CSS/JSX change immediately and inspect `rendered_overlay.png` to see which coordinate shifted in the wrong direction.
- Once `s_total >= 0.85` (or `--target-score`) AND `collision_count === 0`, `horizontal_overflow_px === 0`, `button_padding_violations === 0`, and `grid_equality_violations === 0`, lock the source files and run the Golden Template linter (`lint-golden-template.mjs`) and bundle verifier (`verify-html-bundle.mjs`).
