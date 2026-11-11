---
name: nanofy
description: >-
  Intakes a zip or local folder of externally rendered plates (desktop web,
  mobile web, application, components, experiences) plus the prompt MDs that
  describe the style direction, research, and how the plates were achieved,
  bootstraps the single Design/Development moodboard study in place, and
  re-outputs every plate through Nano Banana before anything is built: the
  desktop web anchor (slot 01, the very first image) takes a distinct unique
  stance at variation 0.5 by default (dial 0.1 to 0.5), then the same
  refinement is applied consistently to every other plate, always at least 1k,
  in the same format and same pixel size, with titling, logos, product UI, and
  layout held invariant. Outputs are new images in nano/ plus new nano-based
  prompt MDs in nano/prompts/, the moodboard supports thumbs up/down curation,
  the whole pass counts as exactly one jason-design-agent turn, and the
  selections are pushed to jason-dev-agent. Use inside jason-design-agent
  whenever plates arrive from outside the harness. Don't use...
metadata:
  icon: 🍌
---

# nanofy

```text
jason-design-agent / nanofy (intake + anchored nano banana refresh = design turn 1)
──────────────────────────────────────────────────────────────────────────────────
input         zip or folder: plates for everything + prompt MDs (style direction, research & per-plate prompts)
              across the five surfaces: desktop web · mobile web · application · components · experiences
step 1        intake  -> <study>/ in place (concepts/, prompts/, research/, selections.json, index.html)
step 2        nanofy  -> anchor (slot 01 = the DESKTOP WEB plate) reimagined at variation 0.5 (default; dial 0.1..0.5),
              refinement note written, then every spoke gets the SAME refinement; >= 1k, same size, same format,
              invariants locked -> nano/<pillar>/<same file> + nano/prompts/<slug>.md (new nano-based MDs)
              gap fill: any surface under 3 plates gets new briefed plates in the same system; surplus is nanofied too
              -> inspiration/ provenance trace (dump file + md -> concepts/ + prompts/ -> nano/ + nano/prompts/)
step 3        moodboard locally: Design | Development, 👍/👎 -> selections.json  (pill: design: nanofy 0.5 · turn 1)
turn          the whole pass counts as exactly ONE jason-design-agent turn (projects/design-turns.json)
handoff       push 👍 selections to jason-dev-agent (it reads nano/ + nano/prompts/, never concepts/)
```

`nanofy` is the **intake path of `jason-design-agent`** for anything that arrives from outside the harness: a zip or folder of plates rendered elsewhere (a designer's own Nano Banana session, possibly away from Jetski) together with the prompt MDs that explain the style direction, research, and how those plates were achieved. It makes sure **everything that comes in gets nanofied** — fresh, safe, most-recently generated imagery with one consistent, slightly unique take — and that the user curates it on the same `Design | Development` moodboard before anything is pushed to `jason-dev-agent`.

**It is treated exactly as if `jason-design-agent` had gone through its design turns**: intake + anchored refresh + moodboard **= design turn 1** (standing in for `research -> style-direction -> image-gen -> moodboard`). Any remaining `design_agent_turns` go to `design-critique` talk-backs during the `jason-dev-agent` build. You end up with **new images** (`nano/<pillar>/`) **and new nano-based MDs** (`nano/prompts/<slug>.md`, one per plate: the imported prompt MD folded in + the anchor refinement note + the final Nano Banana prompt); the originals stay untouched in `concepts/` + `prompts/`.

**Never run `nanofy` on a study `jason-design-agent` produced itself** (`concept-art` plates are already fresh Nano Banana 2 `2k` output). `jason-dev-agent` never runs it either: it only ever receives a curated study.

---

## workflow checklist

- [ ] **step 0 — turn budget**: if the user has not given `design_agent_turns`, ask **"how many turns do you want out of the design agent?"**; pass it as `--design-agent-turns=N`. nanofy consumes turn `1`.
- [ ] **step 1 — intake the folder / zip (`scripts/intake-study-from-folder.py`)**: pair every prompt MD to its plate (same sub-folder first, then same stem → normalized stem → leading slot number), promote an `anchor|constitution|style` MD to `prompts/01-anchor.md` (else slot `01`'s own prompt), file unpaired MDs into `research/`, sort plates into `concepts/<web|mobile-web|app|component|experience>/NN-…` (pillar from the designer's **sub-folder name** first — `desktop-web/`, `mobile-web/`, `application/`, `components/`, `experiences/` — then the prompt's `pillar:` hint → filename tokens → aspect ratio; the largest `2k` desktop web plate becomes slot `01`), and write `prompt.md` (`design_agent_turns: 1 of N`), `selections.json` (all `👍`), `style-direction/direction.md`, `manifest.json`, `projects/design-turns.json` (turn 1 = nanofy), zeroed `projects/dev-turns.json`, and the moodboard `index.html`. The folder is then treated **as if `jason-design-agent` had produced it** — the only thing that never exists is benchmark screenshots (never invent them).
- [ ] **step 2 — choose the variation dial, check coverage & confirm calls**: default `--variation 0.5` (a distinct-but-faithful take); `0.0` is a pure mirror, `0.1-0.4` progressively subtler (see [variation dial and invariants](references/variation-dial-and-invariants.md)). `plan` prints the exact call count (`1` anchor + `N` spokes + `K` generated), the per-surface **coverage** (`have / target 3 / fill`), and writes a draft `nano/prompts/<slug>.md` per plate; show the count and get the normal Nano Banana confirmation. **Gap fill**: any surface with fewer than `3` plates (`--target-per-pillar`, default `3`) gets its missing slots as `role: fill` jobs — brand-new plates in the anchor's design system (e.g. the folder has web, mobile web, app, and components but no experiences → three experiences are generated). **Surplus**: a surface with more than `3` plates is simply nanofied in full; nothing is dropped.
- [ ] **step 3 — desktop anchor first (`run-anchor` → `verify-anchor`)**: slot `01` — **always the desktop web plate, the very first image** — is re-output with the variation prompt, which already carries that plate's imported style-direction MD. Verify same size, same format, `>= 1k`, fresh, sharp, and drift **inside the band** for that variation (too little = no take, too much = redesign). Eyeball the hard invariants: titling/copy verbatim, logos, product UI, layout.
- [ ] **step 4 — write the refinement note (`note --text "…"`)**: one paragraph stating exactly what the anchor refinement changed (materials, light, grain, color temperature, photographic grade). It is injected verbatim into every spoke prompt, every generated-plate prompt, and every `nano/prompts/<slug>.md` so the whole set reads as one system.
- [ ] **step 4b — brief every generated plate (`brief --slug <slug> --text "…"`)**: for each `needs_brief` slot, read the breadth of what came in (every other surface's plates + MDs, `prompts/01-anchor.md`, `research/`) and author the concept in one paragraph — *given all the components and application screens, what would this product's second and third experiences be?* — naming the screen, its job, its key modules, and the copy voice. `run` refuses to start until every fill has a brief.
- [ ] **step 5 — spokes + generated plates (`run` → `verify` → `switch`)**: every other plate (mobile web, app, components, experiences) is re-output with the same refinement (before/after anchor attached as reference images on routes that support it), each keeping its own layout, copy, and its own imported prompt MD; generated plates render from the anchor output + their surface's siblings as references. `switch` repoints `selections.json`, `manifest.json`, and `index.html` to `nano/` + `nano/prompts/`, adds the generated plates as first-class items and cards (approved, `generated: true`), writes **`inspiration/manifest.json` + `inspiration/README.md`** (the provenance trace: designer dump file + MD → `concepts/` + `prompts/` → `nano/` + `nano/prompts/`), and closes design turn `1` in `projects/design-turns.json` — downstream `image-to-react`, `replicate-mock`, `responsiveness`, `interaction`, and `feel` peer into `nano/`; `concepts/` + `prompts/` stay as the untouched originals.
- [ ] **step 6 — curate locally, then push**: open `<study>/index.html`, review in `Design` (pill reads `design: nanofy 0.5 · turn 1 of N`), `👍/👎` what should be built, and hand the study to `jason-dev-agent`. Its `Development` view fills in from `projects/dev-turns.json` as `jason-dev-agent` works.

---

## 1. the rules nanofy enforces on every plate

| rule | value |
| :--- | :--- |
| surfaces | five pillars: `web` (desktop web) · `mobile-web` · `app` · `component` · `experience` |
| anchor | slot `01` (the desktop web plate) is reimagined first by `--variation` (default `0.5`; `0.1`–`0.5`); everything else inherits that exact refinement |
| style direction | each plate's imported prompt MD is folded into its nano prompt (`STYLE DIRECTION OF THIS PLATE …`) so fonts, palette, materials, and canon are honoured, never re-interpreted |
| invariants | all titling/copy verbatim · logos & wordmarks · product UI (nav, buttons, pills, cards, prices, inputs, tabs, icons) · layout grid, spacing, aspect, framing · nothing added or removed |
| quality | crystal-clear (`sharpness_ratio >= 0.28`, `hf_detail_std >= 0.8`), **every edge `>= 1k` (`min(w, h) >= 1024px`)** (plates with either edge under `1024px` are lifted proportionally so `min(w, h) >= 1024` and flagged), strict image-to-image conditioning |
| size & format | **same exact pixel size** and **same format** (`png`→`png`, `jpg`→`jpg`, `webp`→`webp`) as the plate arrived |
| coverage | every surface reaches `>= 3` plates (`--target-per-pillar`): missing slots are **generated** in the anchor's design system after a `jason-design-agent` brief; surplus plates are all nanofied, never dropped |
| speed | one call per plate, no polish rounds; a drifted spoke is re-run with the **same** prompt, never a new one |
| drift gate | `8x8` mean abs RGB delta vs. source must sit inside the variation band (`0.0`: `<= 14` · `0.2`: `2-24` · `0.5`: `6-42`) |
| turn accounting | the whole pass = `jason-design-agent` turn `1` (`projects/design-turns.json`, `prompt.md`, moodboard pill) |
| output | `<study>/nano/<pillar>/<same filename>` (+ `…-generated-<role>.png` for fills) + `nano/prompts/<slug>.md` + `nano/nanofy-plan.json`, `nano/refinement-note.md`, `nano/nanofy-report.json`, `nano/README.md` + **`inspiration/manifest.json` + `inspiration/README.md`** (trace back to the designer's dump) |

---

## 2. commands

```bash
N=/usr/local/google/home/jfesta/design-kit/skills/nanofy/scripts
python3 $N/intake-study-from-folder.py --source=<folder | plates.zip> [--study-dir=…] [--design-agent-turns=N] [--extract-tokens] [--select=all|none]
python3 $N/nanofy-plates.py plan          --study=<study> --variation 0.5 [--target-per-pillar 3]   # 1 anchor + N spokes + K generated, coverage, draft nano/prompts/*.md, no model calls
python3 $N/nanofy-plates.py run-anchor    --study=<study> --route=gempix      # desktop web 01 only; gempix outside the sandbox, or --route=manual
python3 $N/nanofy-plates.py verify-anchor --study=<study>
python3 $N/nanofy-plates.py note          --study=<study> --text "<what the anchor refinement changed>"
python3 $N/nanofy-plates.py brief         --study=<study> --slug <generated-slug> --text "<concept from the rest of the set>"   # once per needs_brief
python3 $N/nanofy-plates.py run           --study=<study> --route=gempix      # spokes inherit the note (+ their own style-direction MD); generated plates render from the anchor
python3 $N/nanofy-plates.py verify        --study=<study>
python3 $N/nanofy-plates.py switch        --study=<study>                      # downstream now reads nano/ + nano/prompts/; inspiration/ trace written; design turn 1 closed
```

Routes follow `nano-banana` (`gempix-1` CLI outside the sandbox → `image-generator` subagent → Gemini image API, then `--route=manual`). `verify` must pass before `switch`; `switch` refuses otherwise.

---

## references

- [variation dial, invariants, prompts & drift bands](references/variation-dial-and-invariants.md)
- [intake folder contract & the Design | Development moodboard](references/intake-folder-and-moodboard.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
