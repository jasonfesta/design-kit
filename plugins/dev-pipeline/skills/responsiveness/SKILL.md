---
name: responsiveness
description: >-
  Reflows and evaluates a single unified Golden Template React build across
  desktop, mobile, and a 6-viewport continuum (320px, 375px, mobile @2x CSS
  width, 768px, 1024px, and desktop CSS width) without vertical squashing or
  duplicate desktop/mobile DOM trees. Runs an iterative self-judging
  responsiveness dev eval loop until all viewport gates pass, then hands the
  same stage back into jason-design-agent via design-critique for a designer
  critique against the original inspiration. Use whenever building, tuning, or
  verifying responsive layouts across viewports. Don't use for single-image
  pixel cropping alone (use replicate-mock) or font ranking (use
  google-font-selection).
metadata:
  icon: 📐
---

# responsiveness

```text
jason-dev-agent / responsiveness
────────────────────────────────────────────────────────────────────
stage         2 of 4 in the image-to-react loop
dev eval      desktop + mobile match + 6-viewport sweep + single dom
paired gate   responsiveness design critique in jason-design-agent
```

`responsiveness` ensures a React build adapts naturally from `320px` handheld screens through `1536px+` desktop monitors using **one shared semantic DOM**. `jason-dev-agent` iterates back and forth over multiple turns, stopping after each turn to judge itself against the **responsiveness dev eval**, and as soon as the dev eval passes, sends the **same responsiveness stage into `jason-design-agent`** (via `design-critique`) to be critiqued as a designer against the original inspiration.

---

## workflow checklist

- [ ] **testing prompt (`design_agent_turns`)**: if not already set for this run, ask the user **"how many turns do you want out of the design agent?"** before starting the critique loop.
- [ ] **turn 0 — inspect inspiration & references**: read the project's research specs and inspect `desktop.png`, `mobile.png` (when paired), and `jason-design-agent`'s original inspiration notes so desktop and handheld art direction are understood before editing layout classes.
- [ ] **turn 1..n — build & stop to run the dev eval**: implement fluid spacing, `clamp()` type, `<picture>` art-directed crops, and accessible mobile drawers in a single semantic DOM, then run [`scripts/eval-responsive-pair.mjs`](scripts/eval-responsive-pair.mjs) (or single-sheet 6-viewport sweep).
- [ ] **inspect slices & fix drift**: inspect `dual_eval_report.json` and `side_by_side_slice_*.png` across both desktop and mobile; fix height drift, overflow, collisions, button padding, or grid inequalities until `overall_passed: true`.
- [ ] **paired designer critique (`jason-design-agent`)**: once the dev eval passes, send the desktop, tablet, and mobile renders + slices into `jason-design-agent` using `design-critique` (`stage: responsiveness`) and iterate until `jason-design-agent` approves handheld composition, pacing, and mood against the original inspiration.

---

## 1. three rules of true responsiveness

1. **dual visual & vertical-rhythm fidelity (zero vertical squashing)**:
   - renders `dist/index.html` in headless `WebKit2GTK` (`FULL_DOCUMENT`) at both desktop CSS width (`1440px` or `1536px`) and mobile `@2x` CSS width (`round(mobile_ref_w / 2)`, typically `390px-432px`).
   - scales width uniformly (`-resize {ref_w}x`) without vertical stretching so any chapter padding, image aspect-ratio, or line-height error surfaces immediately in `height_delta_pct` and `side_by_side_slice_*.png`.
2. **6-viewport fluid continuum (`320px` -> `1536px`)**:
   - probes the live DOM at **`320px`, `375px`, `mobile_css_w`, `768px`, `1024px`, and `desktop_css_w`**.
   - enforces `0` horizontal overflow, `0` leaf text/button collisions, `0` clipped text, `0` asymmetric button padding, and `0` uneven equal-column CSS grids at every width.
3. **single semantic dom (anti-bifurcation)**:
   - verifies structural `h1`/`h2` headings inside `<main>` remain mounted and visible across both desktop and mobile (`visibility_ratio >= 0.65`), blocking shortcuts that duplicate the page into separate `hidden md:block` and `md:hidden` trees or branch content on `window.innerWidth`.

---

## 2. running the responsiveness dev eval loop

### photographic plate cleaning (when needed)

When desktop and mobile use distinct art-directed crops of a photograph, extract clean plates with [`scripts/crop-and-clean-plate.py`](scripts/crop-and-clean-plate.py) and mount them inside a single `<picture>` tag:

```bash
python3 /usr/local/google/home/jfesta/skills/responsiveness/scripts/crop-and-clean-plate.py \
  --src=/path/to/references/desktop.png \
  --crop=0,0,1536,860 \
  --quality=88 \
  --out=/tmp/hero_desktop.jpg
```

### self-judging dev eval command

Run [`scripts/eval-responsive-pair.mjs`](scripts/eval-responsive-pair.mjs) after each responsive edit turn:

```bash
/usr/local/google/home/jfesta/.local/bin/node \
  /usr/local/google/home/jfesta/skills/responsiveness/scripts/eval-responsive-pair.mjs \
  --project-dir=/path/to/projects/01-website-example \
  --desktop-ref=/path/to/references/desktop.png \
  --mobile-ref=/path/to/references/mobile.png \
  --desktop-css-width=1440 \
  --mobile-css-width=410 \
  --out-dir=/tmp/responsiveness_eval_example
```

*(When only a single desktop or 4K column reference exists rather than a separate `mobile.png`, `jason-dev-agent` still sweeps all 6 continuum widths—`320px`, `375px`, `410px`, `768px`, `1024px`, `1440px`—requiring `0` overflow, `0` collisions, `>= 44px` mobile tap targets, and clean fluid stacking below `768px` while locking the reference width 1:1.)*

### dev eval pass gates (stop & judge)

`jason-dev-agent` repeats its build -> measure -> inspect loop until every hard gate passes:
- `desktop.s_total >= 0.85` and `mobile.s_total >= 0.85` (when paired references exist)
- `desktop.dimensions.height_delta_pct <= 8.0%` and `mobile.dimensions.height_delta_pct <= 8.0%`
- `0` collisions, `0` horizontal overflow, `0` clipped text, `0` button padding violations, and `0` grid equality violations across all 6 continuum viewports (`320px` -> `desktop`)
- `anti_bifurcation.passed === true`

---

## 3. paired responsiveness design critique (`jason-dev-agent` -> `jason-design-agent`)

Passing the responsiveness dev eval proves geometric and DOM health—it does **not** yet prove the handheld and tablet layouts *feel intentionally designed*. Immediately hand the passed responsiveness stage back to `jason-design-agent` (following `design-critique`) with:
- desktop & mobile `side_by_side_slice_*.png` strips and `375px` / `768px` / `1440px` full-page captures
- the original inspiration references and `taste` / `atlas` notes

`jason-design-agent` critiques responsiveness as a designer:
1. **handheld art direction**: do portrait crops frame the subject intentionally rather than slicing off hands, silhouettes, or focal light?
2. **pacing & breathing room**: do mobile chapter pauses (`py-12` to `py-16`) preserve the calm or energy of the desktop inspiration without endless empty scrolling or cramped stacking?
3. **tablet composure (`768px` & `1024px`)**: do 3- and 4-column rows step cleanly (`sm:grid-cols-2 lg:grid-cols-3`) instead of producing narrow, awkward columns?
4. **thumb & navigation hierarchy**: does compact mobile navigation (`menu` sheet, sticky actions, `16px+` inputs, `44px` tap targets) honor the brand's tone?

If `jason-design-agent` requests changes, `jason-dev-agent` applies them, **re-runs the responsiveness dev eval** to confirm zero regressions, and returns to `jason-design-agent` until approved.

--------------------------------------------------------------------------------

## references & examples

- [responsive dual-authority & 6-viewport continuum rules](references/responsive_dual_authority_rules.md)
- [multi-turn responsiveness dev eval & designer critique walkthrough](examples/wda-dual-breakpoint-loop.md)

## Credits & Lineage

Built by Jason Festa (`jfesta`), incorporating button optical padding and multi-tile grid equality verifiers from **`sds-measurement-verifier`** (Google Search DevAI SDS: `sskhandp`, `str`), `64x64` visual scoring from **`visual-matcher` (`AutoRaterV1`)** (Google Agentic Design Loop: `dfreedm`, `jonathangamble`, `meaplet`, `igormr`), and 3-panel slice comparison from **`screenshot-compare`** (Google Search DevAI Aegis).

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
