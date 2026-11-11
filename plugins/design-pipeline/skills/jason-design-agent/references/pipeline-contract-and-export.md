# pipeline contract & export manifest (`jason-design-agent` v2)

This is the **single source of truth** for the `jason-design-agent` design pipeline. Every sub-skill (`concept-art`, `research`, `style-direction`, `google-font-selection`, `image-gen`, `polish`, `eval`, `design-critique`, `nanofy`), both agent definitions, the catalog metadata, and `AGENTS.md` must agree with the vocabulary, counts, stages, scripts, and invariants below. If any file contradicts this contract, the contract wins and the file is stale.

---

## 1. canonical vocabulary (v2 · supersedes the v1 "10 benchmarks -> 1 master direction -> 27 plates" model)

| term | canonical v2 definition | retired v1 wording (do not use) |
| :--- | :--- | :--- |
| **input** | a natural-language `prompt`, **or** a list of urls (url-list intake), **or** a folder/zip of plates + prompt MDs (`nanofy`) | — |
| **`design_agent_turns`** | asked up front in step 0 (`"how many turns do you want out of the design agent?"`); `max_nano_rounds = min(design_agent_turns, 3)` | — |
| **researched examples** | **`5` standout real-world examples** selected because each produces a **visibly different, non-beige** structural, chromatic, and material result (backed by inner-design craft references and a cursory 19-directory sweep) | `10 category-bar benchmarks`, `10 benchmark dossiers`, `research/properties/01..10.md`, `screenshots/01..10/` |
| **style range** | **`5-10` named non-beige style directions** derived from the 5 examples (`research/style-range.md`); each keeps its benchmark's direct structural/chromatic DNA | `1 original master direction`, `averaged synthesis` |
| **fonts** | **Primary** headline font from live `recommend_google_fonts.py` + **Companion Body & UI** font from `font_scale_and_pairing.py pair` (web-safe, `/Purpose/Easy Reading`, `400` + `500/600`, zero AI clichés); max `2` families per direction | `clean Inter 10-12px`, `shrunk by ~50%`, static pairing tables |
| **type scale** | 4-surface CSS -> `2K` canvas scale with `% canvas height` + chars/line copy budgets (`desktop-web`, `mobile`, `desktop-app`, `component`); `>= 16px` body, `>= 12px` floor, WCAG 2.2 AA contrast | `1248x2560`, `2048x1365`, `82-86px icons`, `31-32px labels`, `52-62px` / `56-62px` H1 tables |
| **plate matrix** | **mode a (single brand)**: `4 x 3 = 12` plates (`01-03` web, `04-06` app, `07-09` components, `10-12` experiences) anchored to `01`; **mode b (multi-direction)**: one `web -- home landing page · <direction>` plate per named style (`+` companion `mobile app` / `component` plates) | `27 plates`, `9 web / 9 mobile / 9 components`, `02..27`, `19..27` |
| **rounds** | `round 1` (image-gen) -> `round 2..3` (`polish` on failing slots **or** head-to-head challenger rounds conditioned on the prior round), hard cap `3`; every round must be a dramatic leap (`2%` tweaks banned) | — |
| **critique** | `design-critique` Moments `0` (10 pre-Nano iterations + font/WCAG audit), `0.5` (hyper-critique swarm `10-15` agents, tri-perspective, 10-dimension anti-inching), `1` (pre-moodboard checkpoint), `2` (dev talk-backs), `3` (final sign-off) | — |
| **checkpoint** | mandatory **Pre-Moodboard Designer Image Checkpoint** (`lock_and_verify_plates.py verify` -> `critique/pre-moodboard-image-checkpoint.md`) **before** `build_moodboard.py` | — |
| **moodboard** | `#0c0c0b` lowercase `index.html` via `build_moodboard.py` (`0` default approvals, `0` preview adjustments, quoted prompt top-left, clean rollover, no card descriptions, `open` links, `back_to_back` / `matrix` / `round N` / `2-col` views) | — |

**Plate canvases (lossless sRGB PNG, `min(w, h) >= 1024`)**: `16:9` web/app/experience `2752x1536` · `9:16` mobile `1536x2752` · `4:3` component `2400x1792` · `1:1` `2048x2048` · `1:2` tall web `1536x3072`. Crystal-clear gate: `sharpness_ratio >= 0.28`, `hf_detail_std >= 0.8`, `<= 8%` aspect drift.

---

## 2. stage map (who owns what)

```text
step 0   jason-design-agent   ask design_agent_turns -> max_nano_rounds = min(turns, 3)
step 0b  nanofy               folder/zip intake = design turn 1 (variation 0.5 anchor, invariants locked)
step 0c  research             url-list intake: capture_fullpage_devtools.mjs -> analyze_inspiration_workflow.py
step 1   research             5 distinct non-beige examples · full-webpage @2x/@3x capture · 5-part anatomy
                              -> research/properties/<slug>.md · benchmarks.md · style-range.md · avoid_fonts
step 2   style-direction      direct inspiration per example (0 averaging) · live google-font-selection primary
         google-font-selection  + font_scale_and_pairing.py pair (companion body) · 4-surface scale
                              -> direction.md · typography-and-color.md · canon.md · coverage.md
step 3   design-critique m0   critique/pre-nano-10-iterations.md + font_scale_and_pairing.py audit (0 images)
step 4   image-gen            round 1: ref-base/scale-seed image-to-image, <= 2 workers, lock_and_verify lock
         eval                 6 gates per plate -> FROZEN or NEEDS_POLISH (round R of 3)
         polish               rounds 2-3 surgical micro-research edits on failing slots only
         design-critique m0.5 run_critique_swarm.py audit (10-15 critics) between rounds
step 4.5 design-critique m1   lock_and_verify_plates.py verify -> SHOW ALL IMAGES -> designer approves
step 5   jason-design-agent   build_moodboard.py -> <study>/index.html (#0c0c0b)
act 2    jason-dev-agent      (separate agent) image-to-react chain; design-critique m2 talk-backs
act 3    design-critique m3   critique/final-design-signoff.md
```

---

## 3. study folder schema (`<study-slug>/`)

```text
<study-slug>/
├── research/
│   ├── sources.json · benchmarks.md · style-range.md
│   ├── properties/<slug>.md                  # 5-part anatomy per example (header, nav, touts, interactions, footer)
│   ├── prompts/<slug>-inspiration-prompt.md  # tri-voice seeds with ## ref-base ImagePaths + ## do-not-copy
│   └── screenshots/<slug>/                   # desktop-fullpage.png · desktop-fullpage-contact.jpg · mobile-fullpage.png
│                                             # desktop-base-{hero,mid,lower,footer}-2k.png · mobile-base-2k.png · fullpage-callouts.json
├── inspiration/                              # manifest.json · README.md · <slug>-desktop-fullpage.png (url intake / nanofy)
├── style-direction/                          # direction.md · typography-and-color.md · canon.md · coverage.md
├── prompts/                                  # 01-anchor.md · <NN>-<slug>.md (or r<R>-<NN>.md per round)
├── seeds/                                    # optional font_scale_and_pairing.py scale-seed PNGs per surface
├── concepts/{web,app,component,experience}/  # locked 2K PNGs (<NN>-<pillar>-<slug>.png or r<R>-<NN>-<slug>.png)
├── eval/concept-eval.md
├── critique/                                 # pre-nano-10-iterations.md · hyper-critique-report.md · round-<R>-vs-benchmarks.md
│                                             # pre-moodboard-image-checkpoint.md · final-design-signoff.md
├── projects/design-turns.json                # { design_agent_turns, mode, examples_researched, plates }
├── moodboard-config.json                     # items[], tokens[], default_round, round_notes, typefaces_note, architecture_note
└── index.html                                # #0c0c0b moodboard (build_moodboard.py)
```

---

## 4. scripts & cli surface

| script | owner | commands |
| :--- | :--- | :--- |
| `research/scripts/capture_fullpage_devtools.mjs` | research | `--study-dir --urls="..."` / `--urls-file` / `--site=<slug>` (Chrome DevTools / Playwright, `@2x` desktop first, `@3x` mobile; run outside the sandbox) |
| `research/scripts/analyze_inspiration_workflow.py` | research | `run_workflow(ScriptPath=..., Args={study_dir, user_prompt, max_concurrency})` -> 1 analyzer per url, 1 synthesizer, 1 verifier |
| `google-font-selection/scripts/recommend_google_fonts.py` | google-font-selection | `--artifact "<brief>"` / `--brief brief.json --format markdown --out-md --out-json --specimen-html --embed-fonts` (live catalog, companion pairing live-scored) |
| `jason-design-agent/scripts/font_scale_and_pairing.py` | jason-design-agent | `pair --primary --surface --avoid` · `prompt-block --surface --primary --secondary` · `audit --surface --primary --secondary --bg-hex --fg-hex --muted-hex --accent-hex --on-accent-hex --prompt-md` · `scale-seed --surface --out` |
| `jason-design-agent/scripts/lock_and_verify_plates.py` | jason-design-agent | `ref-base --fullpage --out --aspect` · `seed --out --aspect` (fallback only) · `lock --raw --out --ref-image [--target-px]` · `verify --study-dir [--config --out-json]` |
| `design-critique/scripts/run_critique_swarm.py` | design-critique | `audit --study-dir --turn=<N> --swarm-count=15` -> `critique/round-<N>-vs-benchmarks.md` + `critique/hyper-critique-report.md` |
| `nanofy/scripts/intake-study-from-folder.py` · `nanofy-plates.py` | nanofy | `intake ... --design-agent-turns=N` · `plan --variation 0.5 / run-anchor / verify-anchor / note / brief / run / verify / switch` |
| `jason-design-agent/scripts/build_moodboard.py` | jason-design-agent | `--config --study-dir [--artifact-html --thumbs-dir --latest-only]` (`default_round`: `back_to_back` / `all` / `h2h_latest` / `<N>`) |

**Runtime requirements**: `python3 >= 3.10`, ImageMagick `magick` (`/usr/bin/magick`), Node + Chrome (`/opt/google/chrome/google-chrome`) for `capture_fullpage_devtools.mjs`, network for live Google Fonts data (6h temp cache; `_agents/hooks.json` auto-allows the font scripts), and an `image-generator` subagent (Nano Banana) with `ImagePaths` support. Quota rule: never more than `2` concurrent image subagents.

---

## 5. non-negotiable invariants (checked by `design-critique`, `eval`, and the scripts)

1. **zero warm beige by default** (`#F4EFE6`, `#F6F2EA`, `#FAF6F0`, `#EFE9DF`...) unless the user asks; pure `#FFFFFF` never fades to off-white down the scroll; structural `1px` grids run continuously hero -> footer.
2. **direct inspiration, never averaging**: each of the 5 examples keeps its own grid, color polarity, materiality, and hero mechanism; squint test yields 5 unmistakable silhouettes.
3. **100% image-to-image**: every Nano Banana call passes `ImagePaths` matched to the target surface (`ref-base` crop or `scale-seed`; `seed` only when zero references exist). Never condition a `9:16` mobile plate on only a `16:9` desktop capture.
4. **`>= 1K` every edge, `2K` lossless PNG, crystal-clear**, verified by `lock_and_verify_plates.py` before any plate is shown or embedded.
5. **web-safe accessible typography**: Primary + Companion (`<= 2` families), physical anatomy in prompts (no font names or px numbers printed on screen), `>= 16px` body, `>= 12px` floor, `>= 4.5:1` / `>= 3:1` contrast, `>= 44pt` mobile targets, 4-tab iOS bars, per-surface scale blocks from `font_scale_and_pairing.py`.
6. **de-AI realism**: zero middle dots between links, zero `FIG 0.1` / `01 / ...` eyebrows, zero unprompted crypto motifs, zero meta-prompt leakage (hex codes, font names, structural nouns as UI text), complete footers on web plates.
7. **optical padding**: `>= 38-45%` negative space, `64-96px` desktop margins, `80-128px` section pauses, `28-36px` card padding, `40-48px` controls with `2:1` L/R padding, `>= 18-22%` margin around isolated components.
8. **tri-perspective + anti-inching**: every round judged (1) like a designer, (2) back to research, (3) against itself; 10 dimensions corrected simultaneously; `10-15` critic swarm between rounds.
9. **checkpoint before moodboard**; moodboard invariants (`#0c0c0b`, lowercase, quoted prompt, `0` approvals, `0` preview adjustments, no descriptions, `open` links, zero arrows/emojis).
10. **quota safety**: `<= 2` persistent `image-generator` subagents reused via `send_message`; `<= 3` Nano Banana rounds per slot; passing slots freeze at round `1`.

---

## 6. export & install

### 6.1 what ships

| artifact | path |
| :--- | :--- |
| coordinator skill | `jason-design-agent/` (`SKILL.md`, `agent.md`, `references/`, `scripts/`, `BUILD`, `EVAL.txtpb`, `TEST.md`, `skill.json`, `index.html`) |
| sub-skills | `concept-art/`, `research/`, `style-direction/`, `google-font-selection/`, `image-gen/`, `polish/`, `eval/`, `design-critique/`, `nanofy/` (same layout each) |
| agent definitions | `jason-design-agent/agent.md` (canonical, used by `agent_config` in `BUILD`) and its byte-identical copy `_agents/agents/jason-design-agent.md` (Jetski discovery via the `design-pipeline` plugin in `~/design-kit/plugins`) |
| bundles | `<skills-root>/<skill>.skill` + `<skill>.zip` per skill (built by `validate_and_wrap.py`) |
| catalog | `README.md`, `catalog.json`, `index.html`, `_agents/skills.json` (built by `build_catalog.py`) |
| hooks | `_agents/hooks.json` (auto-allow `google-font-selection/scripts/*.py`) |

### 6.2 rebuild, validate & bundle (run after every edit)

```bash
python3 /usr/local/google/home/jfesta/design-kit/skills/skill-maker/scripts/validate_and_wrap.py --skills-root=/usr/local/google/home/jfesta/design-kit/skills --fix
python3 /usr/local/google/home/jfesta/design-kit/skills/skill-maker/scripts/build_catalog.py --skills-root=/usr/local/google/home/jfesta/design-kit/skills
python3 /usr/local/google/home/jfesta/design-kit/skills/skill-maker/scripts/sync_x20.py --skills-root=/usr/local/google/home/jfesta/design-kit/skills --skip-x20   # omit --skip-x20 only to publish
python3 /usr/local/google/home/jfesta/design-kit/skills/google-font-selection/scripts/test_google_font_skill.py
python3 /usr/local/google/home/jfesta/design-kit/skills/jason-design-agent/scripts/font_scale_and_pairing.py audit --surface=desktop-web --primary="Imbue" --secondary="Atkinson Hyperlegible Next" --bg-hex="#0B3D26" --fg-hex="#F4FBF7" --offline
cmp /usr/local/google/home/jfesta/design-kit/skills/jason-design-agent/agent.md /usr/local/google/home/jfesta/design-kit/skills/_agents/agents/jason-design-agent.md
```

### 6.3 install targets

- **Jetski (web / cli)**: the workspace `_agents/skills.json` and `_agents/agents.json` discover every skill and both agents; global use via `~/.gemini/config/plugins.json` → `~/design-kit/plugins` (every workspace loads the kit's plugins; no per-skill symlinks needed).
- **YAQS / standalone agent host**: load `jason-design-agent/agent.md` as the system prompt and attach the 10 skill folders listed in its `skills:` frontmatter (absolute paths); provide `run_command`, `read_file`, `write_file`, `edit_file`, `run_workflow`, `invoke_subagent`, `send_message`, `ask_question`, `search_web`, plus an `image-generator` subagent.
- **Google3**: each skill folder carries a `BUILD` with `agent_skill`, `validate_skill_test`, `eval_suite` (`EVAL.txtpb`), and `agent_config` (`agent.md`); scripts are `pytype_strict_binary` targets under `//experimental/users/jfesta/skills/<snake_name>/scripts`.
- **x20 (only when explicitly requested)**: `sync_x20.py` without `--skip-x20` mirrors to `/google/data/rw/users/jf/jfesta/www/skills/`.

### 6.4 stale-term guard (must return zero matches outside this file and the catalog meta history)

```bash
grep -rn -E "27 2k|27 \`2k\`|27-slot|27 slot|02\.\.27|19\.\.27|9 web, 9 mobile|10 category-bar|10 benchmark|10-benchmark|1 original master|10px-12px|shrunk by ~50%|1248x2560|2048x1365" \
  /usr/local/google/home/jfesta/design-kit/skills/{jason-design-agent,concept-art,research,style-direction,google-font-selection,image-gen,polish,eval,design-critique,nanofy,_agents,AGENTS.md,README.md} \
  --include=*.md --include=*.json --include=*.txtpb | grep -v "pipeline-contract-and-export.md"
```
