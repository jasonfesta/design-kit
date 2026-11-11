---
name: feel
description: >-
  Audits, refines, and evaluates how a Golden Template React interface feels
  under pointer, touch, keyboard, and scroll—covering tactile press response,
  capability-gated hover, GPU-composited transform and opacity curves, easing
  and timing discipline, rapid-click interruption, 60fps scroll smoothness,
  zero layout shift, and reduced-motion safety. Runs a multi-turn dev
  self-eval loop until every feel gate passes, then hands the same stage back
  to jason-design-agent via design-critique to judge physical temperament
  against the original inspiration. Use whenever tuning or grading
  micro-interactions, motion curves, responsiveness under input, or interface
  feel. Don't use for adding missing buttons or sliders (use interaction) or
  static pixel cropping (use replicate-mock).
metadata:
  icon: ✨
---

# feel

```text
jason-dev-agent / feel
────────────────────────────────────────────────────────────────────
stage         4 of 4 in the image-to-react loop ("how it feels")
dev eval      eval-feel-and-scroll.py (60fps scroll + 0 transition-all
              + tactile :active/:hover + 0 shift + reduced-motion)
paired gate   feel design critique in jason-design-agent
```

Where `interaction` verifies *what* elements do (buttons, sliders, pagination, scroll, story), `feel` judges **how the interface feels in motion and under the hand**. `jason-dev-agent` runs multiple turns, stopping after each turn to judge itself against the **feel dev eval**, and as soon as the dev eval passes, sends the **same feel stage back into `jason-design-agent`** (via `design-critique`) to critique physical character against the original inspiration.

---

## workflow checklist

- [ ] **testing prompt (`design_agent_turns`)**: if not already set for this run, ask the user **"how many turns do you want out of the design agent?"** before starting the critique loop.
- [ ] **turn 0 — match temperament to original inspiration**: read `jason-design-agent`'s original inspiration notes to establish the target physical character (for example, unhurried architectural calm, crisp developer immediacy, or buoyant tactile spring).
- [ ] **turn 1..n — refine css/state physics & stop for the feel dev eval**: audit every transition, `:active` / `:hover` / `:focus-visible` rule, drawer curve, swatch crossfade, and scroll handler against the six feel dev gates below.
- [ ] **verify zero regression on `t=0` & responsiveness**: confirm feel refinements keep initial `t=0` fidelity (`s_total >= 0.85+`) and 6-viewport layout integrity intact.
- [ ] **paired designer critique (`jason-design-agent`)**: once the feel dev eval passes, send the live build and feel notes into `jason-design-agent` (`stage: feel`) and iterate until `jason-design-agent` approves pacing, weight, and tactile polish against the original inspiration.

---

## 1. the six pillars of interface feel

### 1.1 immediate tactile press & honest affordances
- Every interactive `<button>`, pill, swatch, and clickable card acknowledges input immediately on press (`active:scale-[0.98]` or subtle surface shift) with `cursor: pointer` (`grab` / `grabbing` on draggable surfaces).
- Frequent or keyboard-repeated actions (tabs, pagination, command rows) respond immediately without artificial entrance delays.
- Keyboard navigation shows clean `:focus-visible` outlines (`focus-visible:outline-2 focus-visible:outline-offset-2`), and mobile touch targets maintain comfortable `>= 44px` hit areas.

### 1.2 gpu-composited motion only
- Animate **`transform`** (`translate3d`, `translateX`, `translateY`, `scale`) and **`opacity`** (plus lightweight color/border tokens on compact controls).
- **Never** use `transition-all` (`transition-property: all`) on containers, cards, or layout wrappers, and **never** animate layout-thrashing properties (`width`, `height`, `top`, `left`, `margin`, `padding`).

### 1.3 intentional timing & easing curves
- **micro-controls (buttons, pills, toggles, swatches)**: `120ms - 220ms` crisp ease-out (`cubic-bezier(0.2, 0, 0, 1)`).
- **drawers, sheets, modals & gallery slides**: `240ms - 420ms` smooth deceleration (`cubic-bezier(0.32, 0.72, 0, 1)` or `cubic-bezier(0.16, 1, 0.3, 1)`), with exit animations `20%-30%` faster than entrances.
- **editorial chapter settles**: `<= 550ms` with restrained travel (`8px - 14px` max), clearing `transform` / `will-change` after settle so serif and body text stay razor-sharp.
- Never use robotic `linear` easing on spatial UI movement (reserve `linear` strictly for timecodes, progress bars, or continuous marquees).

### 1.4 zero layout shift & zero flash on state change
- Switching tabs, swatches, thumbnails, or slider frames must preserve container height and aspect ratio (`0px` vertical jump, `0` colliding leaves, zero blank white/black image flash via pre-stacked opacity crossfades).

### 1.5 interruption & capability-gated hover
- Rapid consecutive clicks on tabs, swatches, or slider arrows retarget cleanly mid-flight without locking controls or stacking duplicate overlays.
- Pointer hover effects (`scale`, subtle underline/surface shifts) are gated behind `@media (hover: hover) and (pointer: fine)` so touch taps never get stuck in a hover state.

### 1.6 verified `60fps` scroll performance & reduced-motion safety
- Scrolling across the entire document and crossing `interaction` scroll points must hold **`60fps` (`<= 16.67ms` frame budget, `effective_fps >= 55-60`, `0` jank spikes `> 34ms`)**, verified deterministically via [`scripts/eval-feel-and-scroll.py`](scripts/eval-feel-and-scroll.py).
- Never mutate React state on raw `window.scroll` ticks (use `{ passive: true }` listeners or `IntersectionObserver`), avoid large non-fixed `filter: blur()` / `backdrop-filter` repaints on scrolling containers, pause offscreen `<video>` elements, and always include `@media (prefers-reduced-motion: reduce)` in `src/index.css`.

---

## 2. stopping to judge: the feel & `60fps` scroll dev eval

At the end of each feel turn, `jason-dev-agent` runs [`scripts/eval-feel-and-scroll.py`](scripts/eval-feel-and-scroll.py) and checks six deterministic pass gates (detailed in [tactile motion and timing](references/tactile-motion-and-timing.md) and [scroll, interruption, and reduced motion](references/scroll-interruption-and-reduced-motion.md)):

```bash
python3 /usr/local/google/home/jfesta/skills/feel/scripts/eval-feel-and-scroll.py \
  --project="/path/to/workspace/projects/<project-slug>"
```

| gate | requirement to pass on the dev side |
| :--- | :--- |
| **1. tactile press & cursor** | `button:not(:disabled)` and interactive controls define pointer cursor, `:active` press response, and `:focus-visible` rings. |
| **2. zero `transition-all` / layout anim** | `0` instances of `transition-all` on layout/card containers and `0` transitions on `width`, `height`, `top`, `left`, or `margin`. |
| **3. calibrated durations & curves** | Control transitions stay within `120ms-260ms`, drawers/modals within `220ms-450ms`, and spatial transitions use non-linear easing curves. |
| **4. zero state-change shift** | Toggling swatches, tabs, accordions, or sliders produces `0px` unexpected container jump, `0` media flash, and `0` collisions. |
| **5. hover & reduced-motion safety** | Hover transforms respect `@media (hover: hover)` and `src/index.css` includes `@media (prefers-reduced-motion: reduce)`. |
| **6. `60fps` scroll & interruption** | `eval-feel-and-scroll.py` reports `effective_fps >= 55-60` (`jank_frames_over_34ms <= 2`), rapid clicks on sliders/tabs/drawers never wedge UI state, and `Escape` dismisses overlays cleanly. |

If any gate fails, `jason-dev-agent` fixes the CSS/JSX physics and re-runs the feel dev eval before handing off.

---

## 3. paired feel design critique (`jason-dev-agent` -> `jason-design-agent`)

Once all six feel dev gates pass, `jason-dev-agent` sends the build back into `jason-design-agent` using `design-critique` (`stage: feel`).

`jason-design-agent` critiques how the build *feels* against the **original inspiration**:
- *Does the motion temperament match the inspiration's world—quiet, weighted, and architectural for warm editorial craft, or crisp and immediate for a precision tool?*
- *Is any animation unnecessary, showy, or distracting where stillness would feel more confident?*
- *Do drawers, sliders, swatches, and scroll transitions feel cohesive as one family of physical materials?*

`jason-dev-agent` and `jason-design-agent` iterate until `jason-design-agent` marks `feel` **approved** with zero dev eval regressions.

--------------------------------------------------------------------------------

## references, scripts & examples

- [`scripts/eval-feel-and-scroll.py`](scripts/eval-feel-and-scroll.py) — headless WebKit2GTK `60fps` `requestAnimationFrame` scroll benchmark + `transition-all` / layout-transition / `prefers-reduced-motion` auditor.
- [tactile physics, gpu properties, curves & timing table](references/tactile-motion-and-timing.md)
- [60fps scroll, rapid-click interruption & reduced-motion rules](references/scroll-interruption-and-reduced-motion.md)
- [multi-turn feel dev eval & `jason-design-agent` critique walkthrough](examples/feel-turn-loop.md)

## Credits & Lineage

Motion curve, press scale, interruptibility, and tactile restraint guidelines in `feel` credit **Emil Kowalski** (`emil-design-eng`, `make-interfaces-feel-better`, `break-ui`), adapted into deterministic Tailwind v4 + WebKit2GTK `60fps` scroll gates by Jason Festa (`jfesta`).

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
