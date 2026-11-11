---
name: design-critique
description: >-
  Runs the hyper-critique designer authority inside jason-design-agent.
  Enforces tri-perspective brutal judgment on every round (judge like a
  designer, judge back to research, and judge itself via harsh self-audit),
  anti-inching auto-correction across 10 dimensions simultaneously before
  generating the next turn, and orchestrates a 10-to-15 agent critique swarm
  via run_critique_swarm.py across all moments from pre-Nano prompt critique,
  Round 1 vs. 5-Benchmark head-to-head, pre-moodboard image checkpoint, to
  final sign-off. Use inside jason-design-agent whenever critiquing or
  steering.
metadata:
  icon: 🎯
---

# design critique

```text
jason-design-agent <-> jason-dev-agent / design critique (5 critique moments)
────────────────────────────────────────────────────────────────────
moment 0      PRE-NANO 10-ITERATION CRITIQUE (10 rewrites BEFORE Round 1)
moment 0.5    ROUND 1 vs. 5 BENCHMARKS CRITIQUE -> drives competing Round 2
moment 1      post-render concept sign-off (zero beige · direct research DNA)
moment 2      mid-build talk-backs (passed jason-dev-agent stage -> critique)
moment 3      FINAL jason-design-agent output AFTER jason-dev-agent finishes
tri-persp     1. judge like a designer  2. judge back to research  3. judge itself
anti-inching  10-dimension auto-correction matrix (NEVER inch 1 change at a time)
swarm         10-15 agent critique swarm orchestrated via scripts/run_critique_swarm.py
```

`design-critique` is **`jason-design-agent`'s brutal hyper-critique and designer judgment authority**:
- **tri-perspective brutal judgment on every round**:
  1. *Judge like a Designer*: evaluate pure aesthetic power, typographic hierarchy, optical padding, negative space, and material depth. Is it high-end and commanding, or generic AI template output?
  2. *Judge back to Research*: relentlessly cross-reference against the 5 standout research benchmarks. Did we honor their layout mechanisms, contrast, and avoid lists—or average them into safe mush?
  3. *Judge Itself (Self-Audit)*: brutal retrospective on prior decisions and compromises. Where did the agent get lazy? Where did it take the easiest path?
- **anti-inching rule (10-dimension auto-correction)**: a turn must **NEVER** inch one minor change at a time. Every turn must execute **10 simultaneous auto-corrections** (grid, fonts, color, padding, hero mechanism, copy canon, materiality, mobile parity, component modularity, and benchmark distinction) before generating another round.
- **hyper-critique swarm (10 to 15 specialized critics)**: orchestrates 10 to 15 dedicated critique agents via [run_critique_swarm.py](scripts/run_critique_swarm.py) (lead taste director, benchmark auditor, typographic anatomist, grid structuralist, chromatic specialist, optical padding inspector, hero specialist, copy auditor, mobile architect, materialist, anti-cliché killer, component modularist, spatial depth critic, acutance inspector, and brutal red-team critic).
- **moment 0 (`critique/pre-nano-10-iterations.md`)**: 10 critique-and-rewrite passes + `python3 ../jason-design-agent/scripts/font_scale_and_pairing.py audit` *before* Nano Banana (`0` calls spent), killing warm-beige defaults, basic AI fonts, `< 12px` font tokens, `< 4.5:1` WCAG contrast, missing surface viewport/char-per-line copy locks, cramped padding, and generic wireframes so **zero Nano Banana rounds get wasted solely on font fixes**.
- **moment 0.5 (`critique/round-1-vs-benchmarks.md` & `critique/hyper-critique-report.md` — base-to-original multi-round driver)**: between every design round (`round 1` -> `round 2` -> `round 3`), runs the hyper-critique swarm against the prior round AND compares directly against the full-webpage Chrome DevTools / Playwright reference (`desktop-fullpage.png` / `desktop-fullpage-contact.jpg` + `fullpage-callouts.json`). Rejects rudimentary junior wireframes and `2%` cosmetic tweaks, extracts missed multi-section callouts and micro-chrome from the full webpage, and executes 10 substantive art-direction auto-corrections so each round delivers a **dramatic visual and originality leap** from the pixel-perfect reference base toward an unmistakably original plate.
- **moment 1 (`pre-moodboard designer image checkpoint & upfront sign-off`)**: verifies all plates meet `>= 1K` every-edge / `2K` crystal-clear PNG standards (`lock_and_verify_plates.py verify`), preserve distinct non-beige worlds, clean live Primary + Companion Google Font anatomy, `2:1` button optical padding, **4-surface accessible CSS-to-`2K` font proportions (`desktop-web`: `48-60px` H1 / `16-18px` body at `55-70` chars/line / `12-13px` floor; `mobile`: `28-34pt` H1 `<= 2` lines / `16pt` body at `34-42` chars/line / `>= 44pt` targets / `4`-tab iOS bar at `12-13pt`; `desktop-app`: `1`-line `24-30px` view title / `14-16px` rows & prose, `0` `64px` hero bloat; `component`: `20-24px` card title / `15-16px` body at `32-46` chars/line), and 100% de-AI product realism (`0` `01 / ...` or `BUILT AROUND YOUR PROCESS` ALL-CAPS eyebrows, `0` middle dots `·` between links, `0` rudimentary wireframe boxes, `0` cropped-off software windows, `0` floating callouts over 3D art, `0` cartoon storybook plants/books)**, and zero meta-prompt text leakage—and **shows all verified images (`critique/pre-moodboard-image-checkpoint.md`) directly to the designer for approval or edits BEFORE `build_moodboard.py` runs**.
- **moment 2 (`mid-build talk-backs`)**: critiques each passed `jason-dev-agent` stage (`nano-banana`, `image-to-react`, `responsiveness`, `interaction`, `feel`) for up to `design_agent_turns` rounds.
- **moment 3 (`critique/final-design-signoff.md`)**: mandatory final `jason-design-agent` output after `jason-dev-agent` completes all engineering gates.

---

## workflow checklist

- [ ] **step 0 — lock `design_agent_turns`**: ask **"how many turns do you want out of the design agent?"** unless already specified by the user.
- [ ] **step 1 — run Moment 0 (`10` pre-Nano iterations) before Round 1**: reject any warm beige/cream/oat default, banned cliché font, or averaged non-specific layout before firing Nano Banana.
- [ ] **step 2 — run Moment 0.5 Hyper-Critique Swarm & Tri-Perspective Audit (`critique/round-1-vs-benchmarks.md` & `critique/hyper-critique-report.md`)**:
  - Run `python3 scripts/run_critique_swarm.py audit --study-dir=<study-dir> --turn=1 --swarm-count=15`.
  - Judge Round 1 across all 3 perspectives: (a) like an elite designer, (b) back to the 5 research benchmarks, and (c) a brutal self-audit of compromises.
  - Enforce the **Anti-Inching Rule**: author the Round 2 prompt diff across all 10 auto-correction dimensions simultaneously so Round 2 makes a massive, decisive leap.
- [ ] **step 3 — run Moment 2 & Moment 3 on `jason-dev-agent` builds**: require passed dev evals first, critique against `research/` + approved concept plates, and emit `critique/final-design-signoff.md` at completion.

---

## references & examples

- [hyper-critique swarm, tri-perspective judgment & 10-dimension auto-correction protocol](references/hyper-critique-swarm-and-auto-correction.md)
- [paired `jason-dev-agent` <-> `jason-design-agent` turn protocol & message format](references/paired-dev-to-designer-loop.md)
- [designer critique lenses & mode-aware uniqueness rules](references/critique-lenses-and-inspiration.md)
- [example multi-stage critique session across visuals, responsiveness, interaction & feel](examples/paired-critique-session.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
