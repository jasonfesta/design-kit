---
name: concept-art
description: >-
  Transforms a natural-language user prompt into 5+ distinct non-beige
  researched benchmark examples, live google-font-selection pairings, a
  10-iteration pre-Nano critique, strict image-to-image minimum 1K and 2K
  crystal-clear Nano Banana 2 concept plates (max-2 concurrency, capped at 3
  rounds), a 10-to-15 agent hyper-critique swarm with tri-perspective brutal
  audits and 10-dimension auto-correction, a mandatory Pre-Moodboard Designer
  Image Checkpoint, and one clean #0c0c0b lowercase Design/Development
  moodboard with zero default approvals.
metadata:
  icon: 🧭
---

# concept art

```text
jason-design-agent / concept art (5 distinct examples · zero beige · <=3 rounds)
────────────────────────────────────────────────────────────────────
input         single natural-language prompt (or external folder via nanofy)
step 0        ask: "how many turns do you want out of the design agent?"
research      5 standout real-world examples -> 5 visibly different results
anti-beige    HARD BAN on warm beige/cream/oat defaults (#F4EFE6, #F6F2EA...)
rounds        <= 3 Nano Banana rounds (supports head-to-head round 1 vs round 2)
moodboard     build_moodboard.py -> #0c0c0b, quoted prompt top-left, 0 defaults
```

`concept-art` is the upfront design-planning pipeline owned by **`jason-design-agent`**. Starting from a prompt—for example, *"make me a modern coffee shop"*—it researches **5 standout real-world examples** chosen specifically because they **produce 5 visibly different, non-beige results**, runs live `google-font-selection`, executes the **10-iteration Pre-Nano Design Critique Loop**, generates `2k` Nano Banana 2 concept plates **directly inspired by those 5 researched examples** (including **head-to-head Round 1 vs. Round 2 competition** when running 2 design turns against each other), and builds the `#0c0c0b` lowercase moodboard via `../jason-design-agent/scripts/build_moodboard.py`.

---

## sub-skills coordinated by `concept-art`

1. **`↳ research`** (`../research/SKILL.md`): yields **5 standout real-world examples** across contrasting non-beige chromatic polarities, grids, and material worlds (`research/examples/01..05.md`) + `avoid_fonts`.
2. **`↳ style-direction`** (`../style-direction/SKILL.md`): channels **direct inspiration** from the 5 researched examples (never averaging into warm beige), runs live `google-font-selection`, and records explicit website/app architecture notes in `coverage.md`.
3. **`↳ image-gen`** (`../image-gen/SKILL.md`): writes 10th-iteration tri-voice prompts and generates Round 1 `2k` plates (and competing Round 2 challenger plates in head-to-head multi-round runs), strictly capped at `<= 3` Nano Banana rounds.
4. **`↳ polish`** (`../polish/SKILL.md`): runs targeted micro-research + surgical tri-voice refinement on weak slots within the 3-round ceiling.
5. **`↳ eval`** (`../eval/SKILL.md`): audits `2k` plates for zero-beige chromatic clarity, direct benchmark craft, zero meta-prompt text leakage, optical padding, and complete footers.
6. **`↳ design-critique`** (`../design-critique/SKILL.md`): runs Moment 0 (10 pre-Nano iterations), mid-round 10–15 agent hyper-critique swarm (`critique/run_critique_swarm.py audit`), tri-perspective brutal audit (designer, research, self-audit), anti-inching 10-dimension auto-correction, Moment 1 upfront sign-off, Moment 2 dev talk-backs, and Moment 3 final sign-off (`critique/final-design-signoff.md`).
7. **`↳ nanofy`** (`../nanofy/SKILL.md`): start-from-folder intake (`variation 0.5`), counted as design turn `1`.

---

## workflow checklist

- [ ] **step 0 — prompt for `jason-design-agent` turns**: lock `design_agent_turns` and `max_nano_rounds = min(design_agent_turns, 3)`.
- [ ] **step 1 — run `research` (`5` distinct non-beige examples)**: document 5 real-world examples that produce 5 visibly different structural and chromatic results. **When the user supplies a list of urls**, run the url-list intake instead of open-web discovery: `node ../research/scripts/capture_fullpage_devtools.mjs --study-dir=<study> --urls="..."` (entire long desktop page of every url first → `inspiration/manifest.json`), then `run_workflow(ScriptPath="../research/scripts/analyze_inspiration_workflow.py", Args={"study_dir": ..., "user_prompt": ...})` for one analyzer agent per url + synthesizer + verifier (`../research/references/url-intake-and-multi-agent-analysis.md`).
- [ ] **step 2 — run `style-direction` + live `google-font-selection`**: map direct inspiration from the 5 examples, ban AI-cliché fonts and warm beige, and document architecture notes in `coverage.md`.
- [ ] **step 2.5 — run `design-critique` moment 0 (`critique/pre-nano-10-iterations.md`)**: complete all 10 pre-Nano critique iterations (`>= 9.5/10`).
- [ ] **step 3 — generate Round 1 `>= 1K` / `2K` crystal-clear PNG plates strictly via image-to-image (`ImagePaths`)**: reuse `1–2` sequential `image-generator` subagents (`0` parallel bursts), lock every plate via `../jason-design-agent/scripts/lock_and_verify_plates.py lock` (`min(w, h) >= 1024`, `sharpness_ratio >= 0.28`), and inspect via `read_file`.
- [ ] **step 4 — run Round 2 head-to-head competition (when `turns >= 2`) or surgical `polish` with hyper-critique swarm**: audit Round 1 across the tri-perspective model (designer, research benchmarks, ruthless self-audit) via the 10–15 critic swarm (`python3 ../design-critique/scripts/run_critique_swarm.py audit`), auto-correct across all 10 dimensions simultaneously (anti-inching rule: never 1 small tweak at a time), and generate competing Round 2 challenger `2K` PNG plates conditioned on Round 1 (`ImagePaths=[r1_plate]`).
- [ ] **step 4.5 — mandatory pre-moodboard designer image checkpoint (BEFORE `build_moodboard.py`)**: run `../jason-design-agent/scripts/lock_and_verify_plates.py verify --study-dir=<study-dir>` and **show all verified images to the designer for review and quick changes before building the moodboard**.
- [ ] **step 5 — publish `#0c0c0b` moodboard via `../jason-design-agent/scripts/build_moodboard.py` (after designer checkpoint approval)**: `0` default approvals, `0` preview adjustments, always-visible quoted prompt top-left, clean rollover (`view`, `rounds`, `filter`, `system`, `typefaces`, `palette`), zero card descriptions, and `open` links.

---

## references

- [end-to-end output folder schema & `Design | Development` moodboard contract](references/end-to-end-handoff-contract.md)
- [hyper-critique swarm (15 personas), tri-perspective judgment & 10-dimension auto-correction matrix](../design-critique/references/hyper-critique-swarm-and-auto-correction.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
