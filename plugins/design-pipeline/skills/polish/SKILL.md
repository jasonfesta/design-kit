---
name: polish
description: >-
  Executes research-enriched, surgical Nano Banana 2 refinement passes in
  Rounds 2 and 3 on 2K concept plates that fail eval or return weak design.
  Whenever a slot comes back with bad or uninspired design, runs a targeted
  micro-research pass (2-3 fresh competitor or inner-design examples for that
  exact pattern) and feeds richer textural, designer, and frontend-developer
  steering into the prompt while enforcing the hard 3-round Nano Banana
  ceiling. Use when eval flags design, hierarchy, palette, framing, or
  canon.md defects and rounds used is less than 3. Don't use for initial
  12-slot generation (use image-gen) or when a slot has already reached 3
  rounds.
metadata:
  icon: 🪄
---

# polish

```text
jason-design-agent / polish (stage 4 · micro-research + progressive enrichment)
────────────────────────────────────────────────────────────────────
input         failing / weak-design 2k plate + eval critique
              + targeted micro-research (2-3 fresh steering examples)
method        bad design -> add targeted research examples -> enrich
              textural + designer + frontend-developer prompt steering
hard cap      rounds 2 and 3 ONLY (total nano banana rounds <= 3;
              passing slots freeze at round 1 with 0 polish calls)
```

`polish` is Stage 4 of **`jason-design-agent`**. When `eval` inspects the `4 x 3 = 12` `2k` plates from Round 1, two kinds of failures can occur:
1. **localized technical defects** (e.g., an off-palette pill, a typo, or a clipped footer on an otherwise tasteful screen) -> fixed via surgical in-place image-to-image edit.
2. **bad or uninspired design** (flat materiality, generic SaaS layout, weak hierarchy, lifeless component/experience mechanic) -> **re-prompting on the same thin context repeats the mistake**. Instead, **every `polish` run for bad design first injects a targeted slice of fresh `research`** (2–3 specific competitor or inner-design examples that solve *that exact element* tastefully) and translates their **textural, designer, and frontend-developer** lessons into the Round 2 / Round 3 prompt to steer the model in the right direction.

---

## workflow checklist

- [ ] **step 1 — enforce the hard 3-round ceiling**: check the slot's round counter in `eval/concept-eval.md`. Passing slots stay **`FROZEN` (`1` call)**. If `rounds_used == 3` or `== design_agent_turns`, **stop immediately** and log remaining notes for `jason-dev-agent`.
- [ ] **step 2 — run targeted micro-research when design is weak (`research/polish-notes/`)**: whenever `eval` flags weak composition, flat taste, or generic UX on a slot, pull **2–3 fresh, ultra-specific references** (from curated inner-design MDs, the 19 specialist directories in `../research/references/design-directory-sources.md` such as `footer.design`, `godly.website`, `landdding.com`, `mobbin.com`, `60fps.design`, `beui.dev`, `backgrounds.supply`, and `paperanimation.ai`, or live `search_web` + screenshots) showing category-bar execution of *that exact screen/component/experience*, logging their fonts/colors into `avoid_fonts` / `avoid_palettes` so we steer without copying.
- [ ] **step 3 — enrich prompt in all 3 voices (`prompts/polish/<NN>-<slug>-round-<2|3>.md`)**: translate the new research examples into concrete **textural** (grain, surface depth, lighting), **designer** (hierarchy, negative space, proportion), and **frontend-developer** (grid tracks, `1px` borders, optical padding, `tabular-nums`, control states) steering anchored to `01-anchor`.
- [ ] **step 4 — confirm Nano Banana request with user, execute strict image-to-image `>= 1K` / `2K` PNG pass & re-verify in `eval`**: unless the user already selected auto-confirm for the run, present the planned `polish` Nano Banana call count, failing slot list, micro-research steering summary, and prompt diff via `ask_question` for user confirmation before running; always pass the failing Round 1/2 plate + `01-anchor.png` in `ImagePaths` / `--input_image` (reusing `1-2` sequential `image-generator` subagents), lock the output to crystal-clear `2K` lossless PNG via `../jason-design-agent/scripts/lock_and_verify_plates.py lock` (`min(w, h) >= 1024`, `sharpness_ratio >= 0.28`), increment the slot's round counter (`2/3` or `3/3`), and re-check all 6 gates in `eval` before the Pre-Moodboard Designer Image Checkpoint.

---

## 1. the two `polish` modes (surgical fix vs. research-steered redesign)

| failure type from `eval` | micro-research added? | how `polish` steers Nano Banana 2 (`<= 3` rounds total) |
| :--- | :--- | :--- |
| **mode a — localized defect on strong design** *(typo, rogue hue, missing footer, `canon.md` mismatch)* | Optional (`0` if layout & taste already sing) | Passes current `2k` plate as `Image 1 (edit target)` + preserves `95%` of geometry while fixing only the exact defect. |
| **mode b — bad / uninspired / rudimentary design** *(junior 2-3 box wireframe, flat texture, missing full-page callout depth, or negligible delta vs. prior round)* | **Mandatory (re-extract from full-webpage `desktop-fullpage.png` + `2-3` targeted examples)** | Slices pixel-perfect `2K` callout crops (`lock_and_verify_plates.py ref-base`) from the full-webpage Chrome DevTools / Playwright reference, rewrites the prompt around senior art direction (carrying over real multi-section callouts, coordinate rails, lighting physics, and interactive micro-chrome), and runs a 1-2 hop base-to-original image-to-image progression so the next round shows a **dramatic leap** over the prior round. |

---

## references

- [research-steered & surgical edit prompt templates](references/surgical-edit-patterns.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
