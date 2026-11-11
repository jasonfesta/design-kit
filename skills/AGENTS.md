# skills workspace — `jason-design-agent` & `jason-dev-agent` instructions (`AGENTS.md`)

This workspace ([`/usr/local/google/home/jfesta/skills/`](file:///usr/local/google/home/jfesta/skills)) is the **canonical lowercase skills workspace** backing the end-to-end **`jason-design-agent <-> jason-dev-agent`** harness (`jason-design-agent -> jason-dev-agent -> jason-design-agent` final output), and mirrors to `/google/data/rw/users/jf/jfesta/www/skills/` (`x20`) only when explicitly requested.

All skill names, display labels, agent names, and stage nomenclature stay **simple and lowercase**, and every stage in both `concept-art` (`jason-design-agent`) and `image-to-react` (`jason-dev-agent`) is represented by its own well-documented plain-text Markdown skill (`SKILL.md` + `references/*.md`).

---

## 1. canonical lowercase skill hierarchy (twin coordinator skills & agents + 7 core skills + 13 stage sub-skills)

```text
/usr/local/google/home/jfesta/skills/
├── AGENTS.md                        # workspace instructions & end-to-end jason-design-agent <-> jason-dev-agent loop
├── README.md                        # lowercase overview & individual skill links
├── index.html                       # lowercase dark/light catalog portal
├── catalog.json                     # machine-readable registry of all skills
├── _agents/skills.json              # workspace skill auto-discovery manifest
│
├── jason-design-agent/              # 0a. coordinator skill & agent — taste research, 10-iter critique, 2K plates & moodboard
├── jason-dev-agent/                 # 0b. coordinator skill & agent — master frontend dev, stage 1a-4 evals, loop a self-eval, loop b talk-backs
│
├── skill-maker/                     # 1. skill maker — validator, wrapper & catalog builder
├── google-font-selection/           # 2. font selector — live top 5 google fonts + specimen.html
├── golden-template/                 # 3. golden template — dating-judged react 19 + vite 7 + tailwind v4
│
├── concept-art/                     # 4. concept art (OWNED BY jason-design-agent · 0 image-to-react concerns)
│   ├── ↳ research/                  #    4a. research — 5 standout non-beige benchmarks + captures + avoid lists
│   ├── ↳ style-direction/           #    4b. style direction — named 5-10 style range + web-safe & companion fonts + canon
│   ├── ↳ image-gen/                 #    4c. image gen — prompt 01 anchor + 2K plates (4x3=12 or multi-direction, <=3 rounds)
│   ├── ↳ polish/                    #    4d. polish — surgical nano banana edits on failing slots (rounds 2-3 max)
│   ├── ↳ eval/                      #    4e. eval — 6-gate concept & anti-clone rubric vs. 5 standout benchmarks
│   ├── ↳ design-critique/           #    4f. design critique — upfront sign-off, mid-build talk-backs & final output
│   └── ↳ nanofy/                    #    4g. nanofy — start-from-folder intake (plates + prompt mds) -> anchored nano banana
│                                    #        refresh (variation 0.1-0.5, same size/format, invariants locked) -> nano/ -> 👍/👎 -> dev
│
├── image-to-react/                  # 5. image to react (OWNED BY jason-dev-agent · developer voice & all code concerns)
│   ├── ↳ replicate-mock/            #    5a. stage 1a — hex tokens, px ruler & 3-bucket classifier (manasababu)
│   ├── ↳ nano-banana/               #    5b. stage 1b — targeted upscale-queue -> 2x retina + readiness/anti-blur eval
│   ├── ↳ responsiveness/            #    5c. stage 2  — desktop + mobile + 6-viewport single-dom continuum eval
│   ├── ↳ interaction/               #    5d. stage 3  — 0 dead buttons, sliders, pagination, scroll points & anim triggers
│   ├── ↳ feel/                      #    5e. stage 4  — 60fps scroll eval, tactile press/hover, gpu curves & 0 shift
│   ├── ↳ font-pairing/              #    5f. stage 1a — primary (headlines) · secondary (body/ui) · optional tertiary accent + modular scale
│   ├── ↳ accessibility/             #    5g. all stages — wcag 2.2 type sizes, line height, contrast, 24/44px targets, focus, names, alt, lang
│   └── ↳ design-critique/           #    5h. developer <-> designer talk-backs + moodboard dev-turns + final sign-off
│
├── warmup/                          # 6. warmup — multi-model pre-bench & post-bench 100-pt evaluator
│
└── taxonomy/                        # 7. taxonomy — locked wda v1.1 registry (3 categories · 15 subcategories · 557 prompts · 257 templates · 77 gaps)
    ├── assets/                      #    taxonomy.json (202/154/201 = 557, 77 gaps, aux taxonomies) + templates_and_gaps.json + prompts_index.json
    ├── references/                  #    taxonomy-catalog.md + prompt-template-match-catalog.md + disambiguation-and-extension.md
    └── scripts/classify_taxonomy.py #    --tree | --list | --validate | --query | --gaps | --templates | --prompts | --dimensions | --check-slice | --add-*
```

---

## 2. end-to-end `jason-design-agent -> jason-dev-agent -> jason-design-agent` rules

1. **step 0 — prompt for `jason-design-agent` turns up front**: before running the pipeline (unless the user already specified a turn count), ask the user — **"how many turns do you want out of the design agent?"** (via `ask_question` or direct prompt) — and enforce `design_agent_turns` across the run.
2. **hard 3-round Nano Banana ceiling in `jason-design-agent`**: in `concept-art` (`image-gen` + `polish`), cap Nano Banana `2k` generation at **`min(design_agent_turns, 3)` rounds maximum per slot** (`Round 1` = `image-gen` anchored to `01-anchor`; `Rounds 2–3` = surgical `polish` on failing slots only; passing slots freeze immediately at `1` call).
3. **strict separation of `image-to-react` concerns**: **all** `image-to-react`, DOM geometry, Tailwind/CSS, button optical padding, grid card equality, asset cropping (`replicate-mock`), crop upscaling (`nano-banana`), `responsiveness`, `interaction`, and `feel` engineering issues belong exclusively to **`jason-dev-agent`**, never to `jason-design-agent`.
4. **condensed `jason-dev-agent` round with talk-backs + mandatory final `jason-design-agent` output**:
   - **act 1 (`jason-design-agent`)**: runs `research` (5 standout benchmarks + DevTools fullpage screenshots + MDs) -> `style-direction` (named 5-10 style range, web-safe Primary + Easy-Reading companion Google Fonts, 8-token palette, `canon.md`, `coverage.md`, `content-tables.md`) -> `image-gen <-> polish/eval` (`01-anchor` first, 2K plates: Mode A `4x3=12` across web, app, component, experience; or Mode B multi-direction) -> upfront `design-critique`.
   - **act 1 alt — start from a list of urls (`jason-design-agent` · url-list intake inside design turn 1)**: when the user supplies URLs for research, `research` skips open-web discovery and runs `research/scripts/capture_fullpage_devtools.mjs --study-dir=<study> --urls="..."` (outside the sandbox) to capture the **entire long desktop page of every URL first** (Chrome DevTools Protocol / Playwright, `@2x`, tiled to the ImageMagick ceiling) and save it as inspiration (`inspiration/manifest.json` + `README.md` + `<slug>-desktop-fullpage.png`) before the `@3x` mobile pass; then fans the analysis out across agents via `run_workflow(ScriptPath="research/scripts/analyze_inspiration_workflow.py")` — **one analyzer agent per URL in parallel** (`research/properties/<slug>.md` + `research/prompts/<slug>-inspiration-prompt.md` with `## ref-base` ImagePaths), one synthesizer (`research/benchmarks.md` + `research/style-range.md`, `5-10` named non-beige directions), one adversarial verifier with a single fix round. `style-direction` / `image-gen` then consume those prompt seeds as Round 1 image-to-image references. Protocol: `research/references/url-intake-and-multi-agent-analysis.md`.
   - **act 1 alt — start from folder (`jason-design-agent` · `nanofy` = design turn 1)**: when the design agent is started from a **folder/zip of plates + prompt MDs** (a designer's own Nano Banana dump across desktop web, mobile web, application, components, experiences) instead of a prompt, it runs `nanofy` (`intake-study-from-folder.py --design-agent-turns=N` -> `nanofy-plates.py plan --variation 0.5 / run-anchor / verify-anchor / note / brief / run / verify / switch`) to bootstrap the study in place, re-output every plate through Nano Banana (the **desktop web `01` plate first at variation `0.5`**, then the same refinement propagated consistently to all spokes with each plate's imported style-direction MD folded in; same size/format, `>= 1k`, titling/logos/product UI/layout invariant) into `nano/<pillar>/` **plus new nano-based MDs in `nano/prompts/`**, **gap-fill any surface short of `3` plates** with generated plates briefed from the breadth of the set (`brief --slug … --text …`; surplus plates are all nanofied), write **`inspiration/manifest.json` + `README.md`** (the inspiration image folder that ships with the project and traces every plate back to the designer's original file + MD), build the local `Design | Development` moodboard, take `👍/👎`, and only then hand the study to `jason-dev-agent`. **The whole nanofy pass counts as exactly one `jason-design-agent` turn** (`projects/design-turns.json`), standing in for `research -> style-direction -> image-gen`; remaining turns go to `design-critique` talk-backs. **`jason-dev-agent` never intakes folders or runs `nanofy`** — it only ever receives a curated study.
   - **act 2 (`jason-dev-agent` — master frontend software engineer)**:
     - Speaks strictly as a frontend software engineer (DOM selectors, CSS tracks, DPR, `s_total`, `IntersectionObserver` scroll points, animation triggers, `effective_fps` `60fps` scroll budget).
     - Executes **8 simple developer steps + automated dev flywheel**:
       1. **step 1 (`replicate-mock`)**: exact tokens, px ruler & 3-bucket partition (`native-code`, `crisp-media`, `upscale-queue`).
       2. **step 2 (`font-pairing`)**: primary (headlines H1-H3), secondary (body/UI), optional tertiary (`<= 15%`) & modular scale.
       3. **step 3 (`image-to-react`)**: React 19 + Tailwind DOM shell & AutoRaterV1 visual match (`s_total >= 0.85` floor, `0.93` target).
       4. **step 4 (`nano-banana`)**: targeted 2x Retina upscaling of `upscale-queue` slots only (`eval-image-readiness.py`).
       5. **step 5 (`accessibility`)**: WCAG 2.2 AA contrast (`>= 4.5:1`), body floor `>= 16px` at `1.5`, targets `>= 24/44px`, focus rings.
       6. **step 6 (`responsiveness`)**: single unified semantic DOM across 6 viewports (`320px` to `1536px`, `0` overflow).
       7. **step 7 (`interaction & feel`)**: 100% controls live to React state (`0` dead buttons), scroll points, triggers, 60fps frame budget & `:active` press.
       8. **step 7.5 (`dev flywheel`)**: automated 5-turn source check-back loop (`run_dev_flywheel.py` / `run_checkback_loop.py`), continuously checking grid geometry, typography scale, 90/10 chromatic polarity, micro-spacing (stripping AI middle dots `·`), and composite regression until all pass or hitting the **40-minute timeout limit (2400s)**.
       9. **step 8 (`golden-template`)**: strict TypeScript linting (`lint-golden-template.mjs --fix`, `tsc exit 0`) & headless bundle verification (`verify_html_bundle.mjs`).
     - Logs turns in `projects/dev-turns.json` and updates the `Development` tab of `<study-slug>/index.html`.
   - **act 3 (`designer checkpoint`)**:
     - `jason-dev-agent` does **not** execute an automated handoff back to the design agent. Instead, it pauses at the **Designer Checkpoint**:
       1. Displays the built application directly in chat (project slug, relative build path, and working `open build` link).
       2. Displays the consolidated 8-step receipt summary table plus dev flywheel convergence receipts.
       3. Awaits the designer's review and surgical polish instructions.
5. **tri-perspective brutal critique, 10–15 agent swarm & anti-inching auto-correction**: every design turn, `design-critique` judges candidate plates across 3 brutal perspectives (1. designer visual taste & optical craft, 2. benchmark research fidelity & avoid lists, 3. ruthless self-audit of prior agent compromises) and orchestrates a hyper-critique swarm of **10 to 15 specialized critique agents** (`python3 /usr/local/google/home/jfesta/skills/design-critique/scripts/run_critique_swarm.py audit`). A turn must **never inch 1 minor change at a time**—it must aggressively auto-correct across **10 distinct steering dimensions simultaneously** (grid architecture, Google Fonts anatomy, chromatic polarity & 90/10 balance, negative space & optical padding, signature hero visual mechanic, domain vocabulary & canon copy, tactile surface materiality, multi-surface/viewport parity, component modularity, and benchmark cliché purge) before generating another turn.

---

## 3. how to validate, re-wrap & rebuild the catalog

Whenever any skill in `/usr/local/google/home/jfesta/skills/` is added or updated, run `skill-maker`:

```bash
python3 /usr/local/google/home/jfesta/skills/skill-maker/scripts/validate_and_wrap.py \
  --skills-root=/usr/local/google/home/jfesta/skills --fix && \
python3 /usr/local/google/home/jfesta/skills/skill-maker/scripts/build_catalog.py \
  --skills-root=/usr/local/google/home/jfesta/skills && \
python3 /usr/local/google/home/jfesta/skills/skill-maker/scripts/sync_x20.py \
  --skills-root=/usr/local/google/home/jfesta/skills --skip-x20
```

*(Omit `--skip-x20` only when explicitly publishing to `x20`.)*
