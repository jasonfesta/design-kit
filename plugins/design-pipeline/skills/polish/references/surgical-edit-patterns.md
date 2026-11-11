# research-steered & surgical edit prompt patterns (`polish`)

---

## 1. mode b — research-steered `polish` template (when a slot returns bad design)

Whenever `eval` flags weak hierarchy, generic UI, or flat taste on a slot:
1. Pull **2–3 targeted examples** (inner-design inspiration MDs + live category benchmarks) for that exact UI/experience pattern and save brief notes in `research/polish-notes/<NN>-<slug>-round-<2|3>.md` (adding any new benchmark fonts/hexes to `avoid_fonts` / `avoid_palettes`).
2. Author `prompts/polish/<NN>-<slug>-round-<2|3>.md` feeding the distilled **textural + designer + frontend-developer** steering while keeping `01-anchor.png` attached so system tokens never drift:

```markdown
# research-steered polish · slot <NN>/12 (<slug>) · round <2|3> of max 3

- **why round <R-1> failed taste/eval**: `<exact compositional, textural, or UX weakness>`
- **micro-research added (`2-3` steering examples)**:
  1. `<example 1>` — *structural/textural lesson adapted (non-copied)*
  2. `<example 2>` — *hierarchy/interaction lesson adapted (non-copied)*
- **style authority (`image 1`)**: `concepts/web/01-web-01.png`

## exact nano banana 2 enriched prompt

[LOCKED STYLE CONSTITUTION — COPIED VERBATIM FROM 01-ANCHOR]
<paste 01-anchor constitution>

[RESEARCH-ENRICHED SLOT COMPOSITION — <NN>/12 · ROUND <2|3>]
Input image 1 is our locked <BrandName> visual-system anchor. Re-compose ONLY this <pillar> screen using the elevated structural and tactile lessons below:
1. TEXTURAL STEERING: <new specific surface grain, depth separation, and lighting detail learned from micro-research>.
2. DESIGNER STEERING: <corrected focal hierarchy, asymmetric column balance, whitespace pauses, and typographic contrast>.
3. FRONTEND DEVELOPER STEERING: <explicit CSS Grid track ratios, 1px hairline seams, corner radii, optical button padding, and tabular-nums alignment>.
4. VERBATIM CONTENT (`canon.md`): <exact copy, metrics, controls, and complete footer/tab bar>.
```

---

## 2. mode a — surgical in-place edit template (when design is strong & defect is local)

```markdown
# surgical polish · slot <NN>/12 (<slug>) · round <2|3> of max 3

- **edit target (`image 1`)**: `concepts/<pillar>/<NN>-<slug>.png`
- **style authority (`image 2`, optional)**: `concepts/web/01-web-01.png`
- **eval defect(s) addressed**: `<exact gate ID + localized defect>`

## exact nano banana 2 edit prompt

Use case: ui-mockup. Image 1 is the edit target. Preserve 100% of its canvas dimensions (<W>x<H>), layout geometry, typography, and unmentioned copy.
Apply ONLY the following targeted correction(s):
1. <Exact localized fix — cite region, old state -> new hex / wording / footer completion>.
Flat orthographic 2K (<W>x<H>) screen capture with zero bezels or browser chrome.
```
