---
name: eval
description: >-
  Evaluates generated 2K Nano Banana 2 concept images across the 4x3 = 12
  matrix (3 web, 3 app, 3 distinct components, 3 unique interactive
  experiences) against the locked style direction, Prompt 01 constitution,
  canon.md domain state, and the 5 standout benchmark research dossiers and
  screenshots. Audits six gates—Prompt 01 coherence, anti-clone originality
  (zero copied fonts, palettes, or layouts), canon.md data agreement, 2K
  geometry and footer completeness, component and experience distinctness, and
  Nano Banana round budget compliance (max 3 rounds)—emitting surgical polish
  directives until passed or capped. Use inside jason-design-agent after
  image-gen or polish renders any 2K plate. Don't use for frontend code or DOM
  scoring (use jason-dev-agent).
metadata:
  icon: ✅
---

# eval

```text
jason-design-agent / eval (stage 5 · 6-gate concept & originality rubric)
────────────────────────────────────────────────────────────────────
input         concepts/ (01..12 2k pngs across web/app/component/experience)
              + prompts/01-anchor.md + style-direction/ + research/
6 hard gates  1. prompt-01 style lock   4. 2k framing & footers
              2. anti-clone originality 5. 4x3 pillar & experience distinctness
              3. canon.md data match    6. <= 3 nano banana rounds
loop          pass -> freeze slot & advance to design-critique + moodboard
              fail (round < 3) -> emit surgical directive to polish
```

`eval` is Stage 5 of **`jason-design-agent`**—the objective quality and originality gate governing the `image-gen <-> polish` loop across all **12 (`4 x 3`) `2k` plates**. Slots that pass all 6 gates **freeze immediately** at Round 1; slots that fail receive bounded `[P0]` / `[P1]` surgical directives routed to `polish` (up to `min(design_agent_turns, 3)` rounds maximum).

---

## workflow checklist

- [ ] **step 1 — gate `01-anchor` before batch expansion**: inspect `concepts/web/01-web-01-*.png` via `read_file` + dimension check first. Block `02..12` generation until `01-anchor` passes Gates 1–4 and Gate 6.
- [ ] **step 2 — inspect every `2k` image individually (`01..12`)**: inspect each PNG at readable resolution (`read_file`) plus deterministic width/height/sRGB checks.
- [ ] **step 3 — cross-check against `research/benchmarks.md` + 5 screenshot folders**: verify category-bar craft with **zero copied benchmark fonts (`avoid_fonts`), brand hexes (`avoid_palettes`), logos, or layouts**.
- [ ] **step 3.5 — tri-perspective brutal audit & anti-inching check**: audit failing or candidate slots across the 3 perspectives (1. designer visual taste, 2. research benchmarks, 3. ruthless self-audit) and enforce the **10-dimension auto-correction matrix** (`python3 /usr/local/google/home/jfesta/skills/design-critique/scripts/run_critique_swarm.py audit`) so polish never inches one minor change at a time.
- [ ] **step 4 — write `eval/concept-eval.md` scorecard & route failing slots**: mark every slot `FROZEN` or `NEEDS_POLISH (round R of max 3)` with 10-dimension auto-correction instructions.

---

## 1. the 6 concept evaluation gates

| gate | what `eval` verifies | failure action |
| :--- | :--- | :--- |
| **1. `01-anchor` style & 2-font coherence** | Art direction, 8-token hex family, corner radii, `1px` hairlines, and **strict `<= 2` Google Font pairing** (`primary` headline + `secondary` UI/body, or `primary == secondary`—zero scattered 3rd/4th fonts) match `01-anchor` across all 12 plates. | **`[P0]`** -> surgical `polish` referencing `01-anchor`. |
| **2. anti-clone originality** | Cross-checked against `research/screenshots/01..05/`, `avoid_fonts`, and `avoid_palettes`: `0` copied fonts, `0` copied palettes, `0` cloned layouts. | **`[P0]`** -> immediate `polish` / token fix. |
| **3. `canon.md` & `coverage.md` agreement** | Brand wordmark, domain vocabulary, entities, prices/metrics, active web nav (`1/2/3`), and app tab order (`1/2/3`) match `canon.md`. | **`[P1]`** -> surgical `polish` on mismatched label/state. |
| **4. `>= 1K` / `2K` crystal-clear geometry, framing & footers** | Every edge `>= 1024px` (`min(w, h) >= 1024`, canonical `2K` lossless sRGB `.png`), crystal-clear acutance (`sharpness_ratio >= 0.28`, `hf_detail_std >= 0.8` via `lock_and_verify_plates.py verify`), flat orthographic UI capture (`0` bezels or angled desks), legible lettering, and complete footers on web plates. | **`[P0]`** -> re-lock or re-frame via `polish` before Pre-Moodboard Checkpoint. |
| **5. `4 x 3` distinctness (`web · app · component · experience`)** | Web covers 3 distinct pages; App covers 3 distinct screens of 1 app; Components (`07..09`) are **3 separate components**; Experiences (`10..12`) are **3 unique interactive experiences**. | **`[P0]`** -> rewrite slot prompt within round cap. |
| **6. Nano Banana 3-round budget guard** | `rounds_used <= min(design_agent_turns, 3)` (`<= 3` hard ceiling); passing slots freeze at `1` round; zero 4th calls ever. | **Hard Stop** -> log residual notes in `eval/concept-eval.md` for `jason-dev-agent`. |

---

## references

- [deterministic dimension/palette checks & `eval/concept-eval.md` scorecard template](references/concept-eval-gates.md)
- `hyper-critique swarm (15 personas), tri-perspective judgment & 10-dimension auto-correction matrix`

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
