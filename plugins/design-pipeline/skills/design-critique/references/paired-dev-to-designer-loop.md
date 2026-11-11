# paired `jason-dev-agent` <-> `jason-design-agent` turn protocol (`design-critique`)

This reference defines the exact division of responsibilities, turn structure, and stopping conditions between `jason-dev-agent` and `jason-design-agent`.

---

## 1. role boundaries

| agent | owns | never does |
| :--- | :--- | :--- |
| **`jason-dev-agent`** | Golden Template React code (`src/`), Stage 1a DOM + 3-bucket classification (`replicate-mock`), targeted Stage 1b `upscale-queue` restoration (`nano-banana`), deterministic dev evals (`eval-image-readiness.py`, `eval-image-to-react.mjs`, `eval-responsive-pair.mjs`, `interaction`, `eval-feel-and-scroll.py` `60fps`), and `projects/dev-turns.json` turn logging. **Always speaks unmistakably as a developer** (DOM, CSS tracks, DPR, `s_total`, `effective_fps`, scroll points, animation triggers). | Never speaks in vague art-director prose; never upscales non-image CSS/SVG UI; never skips its own dev eval before asking `jason-design-agent`. |
| **`jason-design-agent`** | Upfront concept planning (`research` across 5 standout benchmarks + screenshots, non-copied `style-direction`, 2K concept plates via `image-gen <-> polish/eval`), mid-build designer critiques when `jason-dev-agent` talks back, and the **mandatory final post-build `jason-design-agent` sign-off output**. | Never carries `image-to-react` DOM/CSS/bundler concerns; never copies benchmark fonts or brand palettes; never exceeds 3 Nano Banana rounds per slot. |

---

## 2. the two-loop rhythm per stage

Before Loop B runs for the first time in a session (**testing mode**), `jason-dev-agent` prompts the user: **"how many turns do you want out of the design agent?"** and records `design_agent_turns = N` (`0`, `1..N`, or `until approved`).

Every stage then runs **Loop A (dev self-eval)** followed immediately by **Loop B (paired designer critique for up to `N` turns)**:

```text
[session start -> ask user: "how many turns do you want out of the design agent?" -> N]
      │
      ▼
┌───────────────────────────────────────────────────────────┐
│ loop a: jason-dev-agent self-eval (1..k turns)                  │
│   build / refine -> stop -> run dev eval                  │
│   if fail -> fix p0, then p1, then p2 -> repeat loop a    │
└───────────────────────────┬───────────────────────────────┘
                            │ dev eval = passed (if N == 0, stop here)
                            ▼
┌───────────────────────────────────────────────────────────┐
│ loop b: jason-design-agent critique (turn m = 1..N)             │
│   send passed build + proof renders + inspiration refs    │
│   jason-design-agent critiques against original inspiration     │
│   if changes_requested and m < N ->                       │
│     jason-dev-agent implements fixes                            │
│     jason-dev-agent re-runs loop a (confirm 0 dev regressions!) │
│     re-send to jason-design-agent (m + 1 of N) -> repeat loop b │
└───────────────────────────┬───────────────────────────────┘
                            │ approved or m == N reached
                            ▼
                    [advance to next stage]
```

### convergence & turn discipline
- Always include `turn <m> of <N>` in the handoff header so `jason-design-agent` calibrates depth: on turn `1 of 3`, `jason-design-agent` critiques structure, hierarchy, and missing interaction/story opportunities thoroughly; on turn `3 of 3`, it focuses on final polish and sign-off.
- Keep each critique turn concrete and numbered (`[c1]`, `[c2]`, `[c3]`) with exact section/element location, why it misses the original inspiration, and the specific visual, responsive, interactive, or feel change requested.
- **Anti-regression rule**: if a change requested during stage 3 (`interaction`) or stage 4 (`feel`) alters `t=0` layout geometry or breaks `320px` reflow, `jason-dev-agent` catches and resolves that regression in Loop A *before* sending the turn back to `jason-design-agent`.

---

## 3. plain-text handoff & response templates

Keep handoffs straight, readable lowercase/plain Markdown—no proprietary schemas or extra UI wrappers needed.

### `projects/dev-turns.json` (written by `jason-dev-agent`, read by the moodboard `Development` view)

```json
{
  "total_dev_turns": 6,
  "per_stage_turns": { "image-to-react": 2, "nano-banana": 1, "responsiveness": 1, "interaction": 1, "feel": 1 },
  "per_item_turns": { "01-web-01": 4, "07-component-01": 2 },
  "items": [
    { "slug": "01-web-01", "dist": "projects/01-web-01/dist/index.html", "dev_turns": 4,
      "evals": { "s_total": 0.94, "images_2x_ready": true, "effective_fps": 60, "dead_controls": 0 } }
  ],
  "updated_at": "<ISO-8601>"
}
```

`jason-design-agent` renders `jason-dev-agent: <total_dev_turns> turns` in the top bar and `dev · <per_item_turns[slug]> turns` on each built card; `items[].dist` powers the `↗` click-out link.

### folder-started studies (`jason-design-agent` · `nanofy`)

When `jason-design-agent` was started from a folder of plates + prompt MDs instead of a prompt, it ran `nanofy` (`../../nanofy/SKILL.md`): intake, anchored Nano Banana refresh into `nano/`, moodboard curation. `jason-dev-agent` receives that study like any other (`prompt.md` says `source: imported`, `manifest.json` says `plates_root: nano`). In critiques:
- `prompts/<slot>.md` + `prompts/01-anchor.md` are the style constitution and per-slot composition; `research/*.md` are the process notes; `nano/refinement-note.md` records the unique take applied across the set.
- `jason-design-agent` critiques against those MDs, the nanofied plates, and the refinement note. Benchmark screenshots do not exist — never invent or cite them; the `anchor check` line reads `anchor check vs. imported prompts + nanofied plates (no benchmark captures)`.
- `critique/final-design-signoff.md` carries `research: imported prompt MDs (no benchmark captures)`.

### `jason-dev-agent` -> `jason-design-agent` request

```markdown
### critique request · stage: <image-to-react | responsiveness | interaction | feel | holistic> · turn <m> of <N>
- project: `<absolute-path-to-project>`
- mode: `<reconstruct | adapt | explore>`
- dev_agent_turns_so_far: `<D>` (recorded in `projects/dev-turns.json` & shown in moodboard `Development` view)
- design_agent_turns: `<N>` (testing budget chosen by user)
- original inspiration: `<research/benchmarks.md + research/screenshots/01..10/ + concepts/>`
- developer build & eval receipt: `passed` (`<DOM/CSS summary, buckets: native/crisp/upscaled, s_total, effective_fps, 0 collisions, 0 dead controls>`)
- visual proof:
  - `<path-to-rendered-or-slices.png>`
  - `<path-to-state-captures-if-interaction.png>`
- what changed this turn:
  - <1-3 concise bullets>
```

### `jason-design-agent` -> `jason-dev-agent` verdict

```markdown
### critique verdict · stage: <stage> · turn <k>
- status: `<approved | changes_requested>`
- anchor check vs. original inspiration (5 standout benchmark mds + screenshots + 2K plates):
  - what works: <1-3 specific strengths worth preserving>
- requested revisions (if `changes_requested`):
  1. `[visuals | responsiveness | interaction | feel | uniqueness]` <element/section> — <why it falls short of the original inspiration> -> <exact direction>
  2. ...
```

---

## 4. mandatory final `jason-design-agent` sign-off output (`critique/final-design-signoff.md`)

After `jason-dev-agent` finishes its condensed build round, `jason-dev-agent` hands the live build back to `jason-design-agent` so **the end-to-end run always concludes with a `jason-design-agent` output**:

```markdown
# final jason-design-agent sign-off (`critique/final-design-signoff.md`)

- **study / project**: `<slug>`
- **final verdict**: `<APPROVED | APPROVED_WITH_NOTES>`
- **design_agent_turns used**: `<used> / <budget>` (nano banana concept rounds: `<= 3`)
- **originality & freshness vs. 5 standout benchmarks (`research/`)**:
  - fresh point of view: `<pass — 1-2 sentence synthesis>`
  - non-copied typography (`avoid_fonts`): `<pass — exact Google Fonts verified>`
  - non-copied palette (`avoid_palettes`): `<pass — exact 8 semantic tokens verified>`
- **concept-to-live craft audit (concept plates -> live `jason-dev-agent` build)**:
  - visuals & hierarchy: `<summary>`
  - responsiveness (`320px -> desktop`): `<summary>`
  - interaction, controls & story: `<summary>`
  - tactile feel & restraint: `<summary>`
- **remaining notes / next iteration ideas**:
  - `<concise bullet or none>`
```
