# Walkthrough: Dual-Breakpoint & Continuum Evaluation Loop (`responsive-dual-eval`)

This example illustrates how an agent iterates a responsive WDA landing page (`index.html`) against both `desktop.png` and `mobile.png` until reaching **Checkpoint 1** (`overall_passed: true`).

---

## Iteration 1 — Initial Synthesis & First Eval Pass

1. **Read Local GitHub Research First**:
   - Inspect `<brand>/references/research/GITHUB_RESEARCH_INDEX.md`, `cleanup-sheet-prompt.md`, and `homepage-study-desktop-spec.md` / `homepage-study-mobile-spec.md`.
   - View `references/desktop.png` and `references/mobile.png` via `read_file`.
2. **Extract Photographic Plates**:
   - Crop clean hero and chapter photographs from `desktop.png` / `mobile.png` (or use `references/research/assets/*-clean-hero-plate.png` where provided) using `crop-and-clean-plate.py`, encoding crisp base64 data URIs in `src/data/<brand>Assets.ts` (re-exported or imported via `src/data/<brand>Data.ts`).
3. **Run `eval-responsive-pair.mjs`**:
   ```bash
   node \
     ./skills/responsive-dual-eval/scripts/eval-responsive-pair.mjs \
     --brand=mellore
   ```
4. **Diagnose Iteration 1 Report**:
   - Suppose `desktop` reports `s_total: 0.87`, `height_delta_pct: 4.1%` (PASS), while `mobile` reports `s_total: 0.81`, `height_delta_pct: 14.8%` (`rendered_scaled_size: [820, 2202]` vs `ref_size: [820, 1918]`), plus `768px` reports `1` button padding violation.
   - Read `scratch/eval/mellore/mobile/side_by_side_slice_1.png` and `side_by_side_slice_2.png` with `read_file`.
   - Visual inspection shows the mobile hero image was `min-h-[620px]` instead of `aspect-[410/520]`, pushing the first-scroll product trio `140px` too low on mobile!

---

## Iteration 2 — Tuning Mobile & Intermediate Padding Without Regressing Desktop

1. **Targeted Responsive CSS Adjustment**:
   - Change the hero wrapper from fixed `min-h-[620px] md:min-h-[760px]` to `aspect-[410/520] md:aspect-[1536/820]` so mobile and desktop both lock to their exact reference proportions while scaling fluidly at `320px`, `375px`, `768px`, and `1024px`.
   - Tighten mobile section padding from `py-20 md:py-24` to `py-12 md:py-24` to match `mobile.png`'s `48px` pause.
   - Fix the unpadded `<button>` at `768px` by adding `px-5 py-2.5`.
2. **Re-run `eval-responsive-pair.mjs --brand=mellore`**:
   - `desktop`: `s_total: 0.901`, `height_delta_pct: 2.3%`, `0` violations.
   - `mobile`: `s_total: 0.884`, `height_delta_pct: 3.4%`, `0` violations.
   - `continuum_320_to_desktop.all_intermediate_widths_passed`: `true` (`320px`, `375px`, `768px`, `1024px` all `0` overflow / `0` collisions).
   - `anti_bifurcation.passed`: `true` (`visibility_ratio: 1.0` on both desktop & mobile).
   - `overall_passed`: **`true`** — ready for Checkpoint 1!
