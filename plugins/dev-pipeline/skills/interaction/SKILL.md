---
name: interaction
description: >-
  Audits, upgrades, and evaluates Golden Template React builds so every page
  element has live stateful interaction while keeping the initial t=0 render
  visually locked. Explores and grades rich pattern upgrades grounded in
  original inspiration—sliders, carousels, pagination, live filters, swatches,
  scroll navigation, and story progression—in a multi-turn dev self-eval loop,
  then hands the same stage back to jason-design-agent via design-critique
  until approved. Use whenever adding, checking, or critiquing interactive
  elements, sliders, pagination, scrolling, or storytelling in an
  image-to-React build. Don't use for static pixel extraction alone (use
  replicate-mock) or motion timing tuning alone (use feel).
metadata:
  icon: 🕹️
---

# interaction

```text
jason-dev-agent / interaction
────────────────────────────────────────────────────────────────────
stage         3 of 4 in the image-to-react loop
dev eval      0 dead controls + sliders/pagination + scroll points
              + animation triggers + t=0 lock
paired gate   interaction design critique in jason-design-agent
```

`interaction` turns a visually accurate, responsive React page into a living product. `jason-dev-agent` works across multiple turns, stopping after each turn to judge itself against the **interaction dev eval**, and once passed, immediately sends the **same interaction stage back into `jason-design-agent`** (via `design-critique`) to critique against the original inspiration.

---

## workflow checklist

- [ ] **testing prompt (`design_agent_turns`)**: if not already set for this run, ask the user **"how many turns do you want out of the design agent?"** before starting the critique loop.
- [ ] **turn 0 — inventory elements & consult original inspiration**: list every visible UI control on the page alongside `jason-design-agent`'s original inspiration and category benchmarks; decide what must respond and what rich interactions can elevate the experience without changing the `t=0` initial frame.
- [ ] **turn 1..n — wire state & stop to run the interaction dev eval**: connect React state (`useState`, `useMemo`, `useRef`) backed by complete domain records in `src/data/*Data.ts`, then stop and audit every element and state transition against the dev eval gates below.
- [ ] **verify `t=0` visual lock**: confirm index `0` / default state still matches the reference image (`s_total >= 0.85`, `0` collisions, `0` overflow).
- [ ] **paired designer critique (`jason-design-agent`)**: once the interaction dev eval passes, hand the live state captures and interaction map back into `jason-design-agent` (`stage: interaction`) and iterate back and forth until `jason-design-agent` approves how the page invites exploration and tells its story.

---

## 1. the five questions of the interaction loop

Every turn in `interaction` answers five concrete questions in order:

### 1.1 does the page have interaction for all of its elements?
Walk top-to-bottom through the rendered DOM. **Zero dead elements are allowed**:
- **buttons & ctas**: every primary, secondary, icon, and inline CTA opens a contextual drawer/modal, toggles state, submits a validated flow, or scrolls smoothly to its target section with stable button width and calm inline feedback.
- **navigation & footer links**: header nav items, breadcrumbs, and footer links either switch active views, scroll to real section anchors, or open contextual detail sheets (never dead `href="#"` no-ops).
- **inputs, toggles, tabs & accordions**: search bars filter live items, newsletter/contact inputs validate and confirm inline, tabs switch real content panels, and accordions expand/collapse smoothly.
- **cards, thumbnails & swatches**: cards open detail drawers or switch active stage previews; color/material swatches swap variant imagery and metadata without triggering accidental parent-card navigation.

### 1.2 is there a slider or gallery we should wire or add?
Check multi-card strips, lookbooks, product photos, and testimonial rows:
- Wire thumbnail rails and lookbook strips so users can step across `4-6+` rich entries (`prev` / `next`, indicator pills or `01 / 05` counters, keyboard `ArrowLeft` / `ArrowRight`, touch `scroll-snap`), keeping slide `0` identical to the reference image.

### 1.3 is there pagination, filtering, or stepping?
Check product collections, comparison tables, journals, and directories:
- Support category filter pills (`All` active at `t=0`), page/batch pagination (`1`, `2`, `3` / `Next`), or quantity steppers (`- 1 +`) with `tabular-nums` counts and subtotals.

### 1.4 are scroll points & section waypoints wired cleanly?
- Ensure full-document vertical scrolling is unlocked whenever no modal is open (`scrollHeight > innerHeight` on multi-section pages) with `0px` horizontal page overflow.
- Replace vague "story" hand-waving with explicit **scroll points**: semantic `<section id="...">` targets (`scroll-margin-top`), `IntersectionObserver` threshold sentinels (`[data-scroll-point]`, active TOC/header state updates, sticky chapter indicators), and step-by-step section reveals that keep the user oriented down the page.

### 1.5 are all animation triggers wired deterministically?
Audit every interactive and viewport-driven transition trigger pushed into the build:
- **click / state triggers**: wire `data-state="open|closed"` or `data-active="true|false"` on drawers, accordions, tabs, and active slide indices so CSS transitions fire predictably on user action without re-mounting the DOM.
- **scroll-point triggers**: wire one-shot `IntersectionObserver` triggers (`data-in-view="true"`, `threshold: 0.15`) on below-the-fold scroll points—never firing above the fold at `t=0` (keeping `t=0` 100% locked to the reference) and never re-triggering jankily on every tiny scroll tick.

---

## 2. stopping to judge: the interaction dev eval

At the end of every dev turn, `jason-dev-agent` stops and grades the build against five hard gates (detailed in [element coverage and audit](references/element-coverage-and-audit.md)):

| gate | requirement to pass on the dev side |
| :--- | :--- |
| **1. zero dead controls** | `100%` of `<button>`, `<a href>`, `<input>`, `<summary>`, and `[role="button"\|"tab"]` elements produce a real state, DOM, ARIA, scroll, or overlay change; `0` no-op `href="#"` links. |
| **2. pattern depth** | All applicable collection/editorial patterns (slider/gallery, pagination/filter/swatches, scroll landmarks, story chapters/drawers) are wired with real secondary data in `src/data/*Data.ts`. |
| **3. accessibility & keyboard** | Native interactive tags used (never bare `<div onClick>`); modals/drawers close on `Escape` and backdrop click; carousels/tabs respond to keyboard focus. |
| **4. post-action layout health** | Clicking tabs, stepping sliders, paginating, or opening drawers produces `0` text/button collisions, `0px` horizontal overflow, and `0` runtime console errors. |
| **5. `t=0` baseline lock** | Re-running `image-to-react` (`eval-image-to-react.mjs`) at default state (`t=0`) still passes (`s_total >= 0.85+`) with zero added visual clutter. |

If any gate fails, `jason-dev-agent` stays in `interaction`, fixes the gap, and re-judges before calling `jason-design-agent`.

### deterministic probe (`scripts/eval-interaction.py`)

Gates 1, 2 (scroll points & animation triggers), and 5 (`t=0` lock) are enforced by a headless WebKit probe that activates every visible control and records observable changes (DOM mutation, `data-state`/ARIA flips, scroll, focus, in-page anchor resolution), then sweeps the page so `IntersectionObserver` scroll points can fire:

```bash
python3 /usr/local/google/home/jfesta/skills/interaction/scripts/eval-interaction.py \
  --project="/path/to/workspace/projects/<project-slug>" --require-scroll-points
# gates: zero_dead_controls_ok · scroll_points_ok · animation_triggers_ok · t0_lock_ok (exit 0 = pass)
```

Dead controls are reported by selector (`button.h-full (\"Blackwork\") -> no_observable_change`, `a (\"Learn more\") -> dead_href`); already-active options in radio-like groups (`data-state="selected|active"`, `aria-selected="true"`) are counted live. Pair it with `eval-image-to-react.mjs --skip-build` for the `t=0` visual lock and `eval-responsive-pair.mjs` for post-action layout health.

---

## 3. paired interaction design critique (`jason-dev-agent` -> `jason-design-agent`)

Once all five dev eval gates pass, `jason-dev-agent` hands the build and before/after state captures into `jason-design-agent` using `design-critique` (`stage: interaction`).

`jason-design-agent` critiques the build against the **original inspiration**:
- *Does every element invite interaction in a way that fits the inspiration's category and mood?*
- *Where interactions already work, what elevates them—a cleaner lookbook slider, smarter pagination, richer scroll-story progression, or removing an interaction that feels noisy or off-brand?*

`jason-dev-agent` and `jason-design-agent` go back and forth over as many turns as needed until `jason-design-agent` marks `interaction` **approved** while all dev eval gates remain green.

--------------------------------------------------------------------------------

## references & examples

- [element-by-element coverage & dev eval audit checklist](references/element-coverage-and-audit.md)
- [blueprints for sliders, pagination, scroll, and story](references/sliders-pagination-scroll-and-story.md)
- [multi-turn interaction dev eval & `jason-design-agent` critique walkthrough](examples/interaction-turn-loop.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
