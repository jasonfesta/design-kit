# the iteration loop & definition of done (`image-to-react` · `jason-dev-agent`)

`jason-dev-agent` does not ship a first pass. For **every approved item** in `selections.json` it runs a build → eval → fix loop **per stage**, checking itself against the comp (the `2k` plate) and the deterministic gates until the build matches, then hands the same stage to `jason-design-agent` and keeps iterating until approved. The React build is *complete* only when every condition in §4 holds.

---

## 1. every carried-over skill, and where it fires

| skill | fires at | what it contributes to the loop |
| :--- | :--- | :--- |
| `golden-template` | every build turn | scaffold from `assets/dating`, `lint-golden-template.mjs` (config parity, nomenclature, strict `tsc`) — a build that does not lint does not get evaluated |
| `replicate-mock` | stage 1a | exact hex tokens, px measurements, 3-bucket classification (`native-code` / `crisp-media` / `upscale-queue`) of the comp |
| `image-to-react` | stage 1a, re-run every stage | `eval-image-to-react.mjs`: render at comp dimensions, 50/50 overlay, 64x64 diff heatmap, DOM collisions/overflow/clipping, button padding symmetry, grid equality → `s_total` |
| `nano-banana` | stage 1b | restores only `upscale-queue` `<img>` slots to `2x`; `eval-image-readiness.py` proves `0` blurry / `< 2x` images |
| `font-pairing` | stage 1a, re-run every stage | primary / secondary / tertiary role lock, `<= 3` families, modular scale, `0` fallback leaks (`eval-font-pairing.py`) |
| `google-font-selection` | stage 1a (read-only) | source of the live family choices in `style-direction/typography-and-color.md`; used to confirm weights/axes to load |
| `accessibility` | stage 1a, re-run after stages 2 / 3 / 4 | WCAG 2.2 type sizes, line height, contrast, `24/44px` targets, focus, names, alt, lang (`eval-accessibility.py`) |
| `responsiveness` | stage 2 | one DOM across `320px -> 1536px`, desktop + mobile comps, anti-bifurcation (`eval-responsive-pair.mjs`) |
| `interaction` | stage 3 | `0` dead controls, sliders/pagination, `IntersectionObserver` scroll points, animation triggers, `t=0` lock (`eval-interaction.py`) |
| `feel` | stage 4 | `60fps` scroll, GPU-only transitions, `:active` press, hover gating, reduced motion (`eval-feel-and-scroll.py`) |
| `design-critique` | after every passed stage + final | Loop B talk-backs to `jason-design-agent`, `critique/final-design-signoff.md` |
| `warmup` | stage 5 (optional, post-bench) | `compare_builds.py` scores the finished build against the comp on the 100-point rubric as an independent second opinion before handback |
| `taxonomy` | stage 5 | `classify_taxonomy.py` labels each built item (category / subcategory) for `projects/dev-turns.json` and the moodboard card |

If any of these is skipped for an item, the item is not complete.

---

## 2. the per-item loop (Loop A — dev self-eval)

```text
for item in selections.json where selected == true:
  comp = item.plate (nano/** or concepts/**)            # the thing we must match
  scaffold -> lint                                     # golden-template
  for stage in [1a visuals, 1b images, 2 responsive, 3 interaction, 4 feel]:
    turn = 0
    repeat:
      turn += 1 ; dev-turns.json += 1
      build (vite --configLoader runner)
      run the stage's gates (see §3)                   # every eval exits 0 or names the offender
      read the proof: rendered.png, rendered_overlay.png, diff_mask.png, side_by_side*.png, JSON reports
      scan Top (0-25%) / Middle (25-75%) / Bottom (75-100%) of the diff vs. the comp
      if all gates pass and s_total >= target: break
      fix in priority order:
        p0  wrong structure (missing/extra sections, wrong grid tracks, wrong order)
        p1  geometry (sizes, spacing, radii, alignment, equal cards, button padding)
        p2  surface (hex tokens, type anatomy, shadows, image crops)
      never regress an earlier stage: re-run stage 1a/2 gates after any fix in 3/4
    until passed or turn == max_dev_turns_per_stage (default 8; raise it, never lower it, when close)
    Loop B: talk back to jason-design-agent (stage, turn m of N) -> apply verdict -> re-run Loop A -> repeat until approved
```

Target score: `s_total >= 0.85` is the **minimum to talk back**; `s_total >= 0.93` with `0` craft violations is the **completion** bar ("matches the comp"). Use `--target-score` on `eval-image-to-react.mjs` / `eval-responsive-pair.mjs` so the gate itself enforces the bar you are working toward. Below-the-fold sections count: full-page comps are evaluated full-page (the responsive eval renders the whole document).

---

## 3. gates per stage (all must exit 0)

| stage | gates |
| :--- | :--- |
| 1a visuals & type | `lint-golden-template.mjs` · `eval-font-pairing.py` · `eval-accessibility.py` · `eval-image-to-react.mjs` (`s_total`, `collision_count == 0`, `horizontal_overflow_px == 0`, `clipped_text_count == 0`, `button_padding_violations == 0`, `grid_equality_violations == 0`) |
| 1b images | `eval-image-readiness.py` (`failed_count == 0`: ready, `>= 1.95x` DPR, `sharpness_ratio >= 0.28`) + 1a gates unchanged |
| 2 responsive | `eval-responsive-pair.mjs` (desktop + mobile `s_total`, `320/375/768/1024` continuum `0` overflow/collision/clip, single DOM) + `eval-accessibility.py --viewport-width 390` |
| 3 interaction | `eval-interaction.py --require-scroll-points` (`0` dead controls, scroll points fire, triggers flip, `t=0` lock) + `eval-image-to-react.mjs --skip-build` at `t=0` unchanged + `eval-accessibility.py` (new controls named, sized, focusable) |
| 4 feel | `eval-feel-and-scroll.py` (`effective_fps >= 55`, `jank <= 2`, `0` `transition-all`, `0` layout-property transitions, reduced motion, `:active`) + stage 1a/2 gates unchanged |
| 5 complete | all of the above green on the final `dist/index.html`; optional `warmup` post-bench; `taxonomy` label; `dev-turns.json` written; moodboard `Development` updated |

---

## 4. definition of done (the React build is complete when **all** are true)

1. Every `selected: true` item has a `projects/<slug>/dist/index.html` built from the canonical Golden Template stack (Vite 7.2.4 / Tailwind 4.1.17 / React 19.2.3 / TS 5.9.3) that passes `lint-golden-template.mjs`.
2. Every stage's gates in §3 are green on that final bundle — not on an earlier turn.
3. `s_total >= 0.93` against the comp (desktop) and against the mobile comp when one exists, with `0` craft violations; where a comp detail is intentionally not reproducible (e.g. a photograph the plate only implies), the deviation is named in the talk-back and accepted by `jason-design-agent`.
4. `jason-design-agent` has returned `approved` for stages 1 through 4 (or the user's `design_agent_turns` budget is exhausted with the remaining notes recorded in `critique/design-critique.md`).
5. `projects/dev-turns.json` holds `total_dev_turns`, `per_stage_turns`, `per_item_turns`, and `items[]` with `dist`, `dev_turns`, `evals` (`s_total`, `images_2x_ready`, `effective_fps`, `dead_controls`, `a11y_gates`, `font_roles`), and the moodboard `Development` view shows `jason-dev-agent: <K> turns` and each card's `dev · <n> turns`.
6. Control has been handed back to `jason-design-agent` and `critique/final-design-signoff.md` exists.

Until all six hold, `jason-dev-agent` is still in the loop.
