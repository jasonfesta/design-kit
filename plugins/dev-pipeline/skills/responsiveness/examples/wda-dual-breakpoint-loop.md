# walkthrough: responsiveness dev eval + `jason-design-agent` critique loop

This example shows how `jason-dev-agent` iterates a responsive Golden Template landing page across multiple turns until passing both its **responsiveness dev eval** and the mirrored **`jason-design-agent` critique**.

---

## turn 1 — initial synthesis & first dev eval (`failed`)

1. **read research & inspiration**:
   - inspect `<brand>/references/research/` and `references/desktop.png` + `references/mobile.png`, plus `jason-design-agent`'s original inspiration notes.
2. **run `eval-responsive-pair.mjs`**:
   ```bash
   /usr/local/google/home/jfesta/.local/bin/node \
     /usr/local/google/home/jfesta/design-kit/skills/responsiveness/scripts/eval-responsive-pair.mjs \
     --brand=mellore
   ```
3. **diagnose turn 1 report**:
   - `desktop`: `s_total: 0.87`, `height_delta_pct: 4.1%` (`passed`)
   - `mobile`: `s_total: 0.81`, `height_delta_pct: 14.8%` (`failed`), plus `768px` reports `1` button padding violation.
   - inspecting `mobile/side_by_side_slice_1.png` shows the mobile hero wrapper used fixed `min-h-[620px]` instead of `aspect-[410/520]`, pushing the first-scroll product trio `140px` too low on phone.

---

## turn 2 — targeted css tuning & dev eval pass (`passed`)

1. **fix responsive classes in the shared dom**:
   - update the hero wrapper to `aspect-[410/520] md:aspect-[1536/820]` so phone and desktop lock to their exact proportions while scaling fluidly at `320px`, `375px`, `768px`, and `1024px`.
   - adjust section rhythm from `py-20 md:py-24` to `py-12 md:py-24` and restore `px-5 py-2.5` on the `768px` CTA button.
2. **re-run `eval-responsive-pair.mjs --brand=mellore`**:
   - `desktop`: `s_total: 0.901`, `height_delta_pct: 2.3%`, `0` violations
   - `mobile`: `s_total: 0.884`, `height_delta_pct: 3.4%`, `0` violations
   - `continuum_320_to_desktop.all_intermediate_widths_passed`: `true`
   - `anti_bifurcation.passed`: `true` (`visibility_ratio: 1.0`)
   - `overall_passed`: **`true`** -> dev eval complete.

---

## turn 3 — paired responsiveness critique in `jason-design-agent`

1. **handoff to `jason-design-agent`**:
   - `jason-dev-agent` sends the desktop & mobile `side_by_side_slice_*.png` strips, `768px` tablet capture, and original Trudon / Loewe Home inspiration notes to `jason-design-agent` via `design-critique`.
2. **`jason-design-agent` critique (`changes_requested`)**:
   - *"Mobile height and `320px` reflow are clean, but at `375px` the 3-card candle grid stacks into 3 consecutive full-width tall cards that feel repetitive compared to the inspiration's lead-plus-pair cadence, and the brass wick crop at `768px` clips the flame tip."*
3. **patch + re-verify + approve**:
   - `jason-dev-agent` switches the mobile/tablet product layout to `1` lead card + `2`-up secondary pair (`grid-cols-2 md:grid-cols-3` with `col-span-2 md:col-span-1` on the lead vessel where matching the reference) and sets `object-[50%_20%]` on the macro plate.
   - re-runs `eval-responsive-pair.mjs` (`overall_passed: true`, zero regressions) and returns to `jason-design-agent` -> **`approved`**.
