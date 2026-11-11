---
name: jason-design-agent
description: >-
  Runs the complete taste-first concept design pipeline and hyper-critique
  authority from a prompt or imported plate folder. Researches 5+ distinct
  non-beige examples, runs live google-font-selection with web-safe headline
  and accessible companion body pairings, locks 4-surface Nano Banana
  CSS-to-2K font scales (desktop web, mobile, desktop app, component) and WCAG
  2.2 AA contrast before Round 1, enforces optical padding and a 10-pass
  pre-Nano critique loop, executes tri-perspective brutal critique with
  10-to-15 critique agents and 10-dimension auto-correction, runs strict
  image-to-image 2K Nano Banana PNGs capped at 3 rounds, pauses at a
  Pre-Moodboard Designer Image Checkpoint, and builds the #0c0c0b lowercase
  moodboard. Don't use for React code (use jason-dev-agent).
metadata:
  icon: 🎯
---

# jason-design-agent

```text
jason-design-agent (master concept design skill & designer critique authority)
------------------------------------------------------------------------------
input          user prompt OR list of urls (url-list intake) OR folder/zip of plates + prompt MDs (nanofy)
url intake     entire long desktop page of EVERY url captured first -> inspiration/ -> 1 analyzer agent per url
research lock  5 distinct real-world examples -> 5 visibly different results
anti-beige     HARD BAN on warm beige/cream/oat defaults or fading white into beige
fonts          live google-font-selection headline + web-safe accessible companion body (0 AI cliches)
4-surf scale   per-surface CSS -> 2K canvas % height + char/line lock (desktop, mobile, app, component)
padding        >= 38-45% negative space · 2:1 pill optical padding · 22% stage
pre-nano gate  10-iteration critique + font_scale_and_pairing.py audit BEFORE round 1 (0 font redos)
critique swarm 10-15 agent hyper-critique swarm (run_critique_swarm.py)
tri-persp      1. judge like designer  2. judge back to research  3. judge itself
anti-inching   10-dimension auto-correction matrix (0 micro-inching)
wcag & scale   body >= 16px · floor >= 12px · >= 4.5:1 AA contrast · 44pt mobile targets (0 poster bloat)
de-ai realism  0 middle dots ("·") between nav/footer links · 0 "FIG 0.1"/"Figure 1-3" labels
               0 ALL-CAPS eyebrows · continuous top-to-bottom grid · 100% real web SaaS UI
nano quality   100% IMAGE-TO-IMAGE (ImagePaths/--input_image) · TRUE 2K crystal-clear PNGs
checkpoint     MANDATORY pre-moodboard image checkpoint -> designer reviews first
rounds         default moodboard view to latest round (--latest-only when requested)
moodboard      #0c0c0b lowercase · quoted prompt top-left · 0 default approvals
               0 preview adjustments · clean rollover · no card descriptions
```

`jason-design-agent` transforms a prompt into **5+ genuinely distinct, non-beige researched examples**, channels **direct structural, chromatic, and material inspiration** from those standout benchmarks (never averaging research into safe warm-beige mush), runs live `google-font-selection`, executes **tri-perspective brutal hyper-critiques swarming 10 to 15 specialized critique agents** with **10-dimension auto-correction** (banning lazy 1-change micro-inching), generates **crystal-clear `>= 1K` / `2K` lossless PNG plates strictly via image-to-image Nano Banana conditioning** (with quota-safe `<= 2` subagent reuse and **head-to-head multi-round competition** when `design_agent_turns >= 2`), pauses at a **mandatory Pre-Moodboard Designer Image Checkpoint** to show all images to the designer before piecing together the build, and publishes a deterministic `#0c0c0b` lowercase mosaic moodboard via [build_moodboard.py](scripts/build_moodboard.py).

---

## workflow checklist

- [ ] **step 0 — prompt for `jason-design-agent` turns**: if not already specified, ask **"how many turns do you want out of the design agent?"** (`design_agent_turns`) and lock `max_nano_rounds = min(design_agent_turns, 3)`. *(If started from an external folder/zip of plates + prompt MDs instead of a prompt, run `../nanofy/SKILL.md` as design turn `1` and jump to step 5.)*
- [ ] **step 1 — `research` (Chrome DevTools / Playwright full-webpage pixel-perfect capture, full section-callout extraction & `5-10` named style range)**:
  - **url-list intake (when the user gives urls)**: run `node ../research/scripts/capture_fullpage_devtools.mjs --study-dir=<study> --urls="<pasted list>"` outside the sandbox. It slugs every url (`research/sources.json`), captures the **entire long desktop page of every url first** and saves it as inspiration (`inspiration/manifest.json`, `inspiration/README.md`, `inspiration/<slug>-desktop-fullpage.png`), then runs the mobile pass. Immediately fan the analysis out across agents: `run_workflow(ScriptPath="../research/scripts/analyze_inspiration_workflow.py", Args={"study_dir": ..., "user_prompt": ..., "max_concurrency": 4})` → **one analyzer agent per url in parallel** (`research/properties/<slug>.md` + `research/prompts/<slug>-inspiration-prompt.md` with `## ref-base` ImagePaths), one synthesizer (`research/benchmarks.md` + `research/style-range.md`), one adversarial verifier (`research/analysis-report.json`). Protocol: `../research/references/url-intake-and-multi-agent-analysis.md`. Skip open-web discovery; continue below with the synthesized style range.
  - Run `../research/scripts/capture_fullpage_devtools.mjs` (Chrome DevTools Protocol / Playwright) to screenshot the **entire full webpage pixel-perfectly** at `@2x` Desktop (`desktop-fullpage.png` + 4-column `desktop-fullpage-contact.jpg` + `2K` hero/mid/lower/footer base slices) and `@3x` Mobile (`mobile-fullpage.png` + `mobile-base-2k.png`), plus `fullpage-callouts.json` mapping **every callout across every section of the full webpage**. Visually inspect every capture via `read_file` (rejecting any bot-challenge or empty scroll container, and falling back to viewport-scrolled WebKit/CDP slices on sticky-scroll-pinned pages).
  - Break down **every header, every navigation system, every tout & callout across all sections, every interaction, and every footer** across all researched sites so prompt art direction carries over real benchmark richness and micro-detail.
  - Synthesize and explicitly **name the Style Range (`5-10` distinct non-beige styles)** emerging from the research—each occupying a **radically different chromatic polarity, layout grid, and material world**.
  - **Hard anti-beige & continuous-grid rule**: NEVER default to warm beige, cream, oat, parchment, unbleached cotton, or sand (`#F4EFE6`, `#F6F2EA`, `#FAF6F0`, `#EFE9DF`), and NEVER let a crisp `#FFFFFF` white background drift or fade into off-white beige down the scroll. When a page uses a structural `1px` architectural grid, keep that exact grid continuous and uniform from the top hero all the way through the footer.
- [ ] **step 2 — `style-direction` + named `5-10` style range + web-safe accessible pairing & 4-surface font scale**:
  - Run `../google-font-selection/scripts/recommend_google_fonts.py` live for expressive Primary (`H1-H3`) headlines, then run [font_scale_and_pairing.py](scripts/font_scale_and_pairing.py) `pair` to lock a **live-scored, web-safe accessible Companion Body & UI Google Font** (`Latn` script, `400` + `500/600` or variable `wght`, high Google `/Purpose/Easy Reading` + `/Quality/*` scores, open apertures, `tabular-nums`, zero banned AI clichés). Describe both roles via **physical letterform anatomy** (never printing font names on screen).
  - **4-Surface Nano Banana Font-Scale & Copy-Budget Calibration (Zero Font-Redo Rounds)**: never pass bare CSS px numbers (`"16px"`) or sub-`12px` instructions (`"10-12px"`) without anchoring the logical `1x` viewport, `% of 2K canvas height`, and verbatim character/line-count budget via `python3 scripts/font_scale_and_pairing.py prompt-block --surface=<desktop-web|mobile|desktop-app|component>`:
    - **`desktop-web` (`1440x810` CSS -> `2752x1536` `2K`, `1.91x` DPR)**: `H1` `48-60px` (`6.0%-7.4%` canvas H, `<= 9` words, `2-3` lines max); `Body` `16-18px` (`2.0%-2.2%` H, `55-70` chars/line, `2-3` lines); `Buttons/Nav` `14-16px` inside `42-48px` controls; `Floor` `12-13px` (`1.5%-1.6%` H, NEVER `< 12px`).
    - **`mobile` (`390x844` pt -> `1536x2752` `2K`, `3.94x` DPR)**: `H1` `28-34pt` (`3.3%-4.0%` H, `<= 7` words, `2` lines max); `Body` `16pt` min (`1.9%-2.1%` H, **`4.1%` canvas W**, `34-42` chars/line across full card width—never desktop micro-text); `Touch Controls` `15-16pt` inside **`>= 44-52pt`** targets (`5.2%-6.2%` H); `4-Tab iOS Bar & Pills` `12-13pt` floor (`1.45%-1.55%` H).
    - **`desktop-app` (`1440x900` CSS -> `2752x1536` `2K`, `1.82x` DPR)**: **ban `56-72px` marketing-hero headlines**; `View Title H1` `24-30px` (`2.7%-3.3%` H, `1` line `<= 36` chars); `KPI Numerals` `28-36px` `tabular-nums`; `Prose` `16px`, `Table Cells & 220-240px Sidebar` `14-15px` (`1.6%` H) inside `38-44px` rows (`10-14` visible rows); `Headers/Badges` `12-13px` floor.
    - **`component` (`720x540` CSS stage -> `2400x1792` `2K`, `3.33x` DPR, card `380-520px` w/ `18%-22%` margin)**: `Card Title` `20-24px` (`3.7%-4.4%` H, `1` line); `Body/Inputs` `15-16px` (`2.8%-3.0%` H, `32-46` chars/line, `1-2` lines); `Controls` `14-15px` inside `40-44px` buttons (`7.4%-8.1%` H); `Chips` `12-13px` floor (`2.2%-2.4%` H).
  - **De-AI Typography & Label Hygiene**:
    1. **Zero middle dots (`·` / `•`) between navigation items, inline links, or metadata lists** (separate links cleanly with open horizontal whitespace, never `Product · Pricing · Docs`).
    2. **Zero `FIG 0.1` / `Figure 1, Figure 2, Figure 3` or `01 / ...` AI labels** on cards or sections.
    3. **100% Real Web & `2K` App Surfaces (Web-to-App Font Carryover, 4-Tab iOS, Soft-Gray Desktop Nav)**: carry each brand's Primary + Companion Google Font pair consistently across `desktop-web` (`2752x1536`), `mobile` (`1536x2752`), `desktop-app` (`2752x1536`), and `component` (`2400x1792`) plates. On iOS, enforce **4 distinct tabs (never 3)** inside an `84-88pt` bottom bar with native iOS active states (zero Android stadium pills). On Desktop Apps, enforce **uniform soft-gray (`#7E8590`) inactive left-sidebar icons** and built-up multi-column data tables—never empty 1-line stubs.
    4. **Zero Unprompted Crypto**: never introduce crypto, blockchain, zero-knowledge, or Ethereum-diamond motifs unless the user explicitly asks for a crypto product.
  - **Break down the first moodboard from the named `5-10` Style Range**: never collapse vivid benchmarks into one watered-down compromise palette. Give each of the `5-10` named styles its own codename, benchmark lineage, chromatic polarity, live Google Font pair, and concrete header/nav/tout/interaction/footer grammar (with original `canon.md` copy).
  - **Explicit architecture & naming notes (`coverage.md`)**: for a single unified brand product, all `web` routes form **one website** (`web -- home landing page` on slot 1 + interior routes sharing identical nav/footer) and all `mobile app` tabs form **one app**; when showcasing the **`5-10` named style-range directions** on the first moodboard, each separate website uses `web -- home landing page · <style-name>` with explicit notes in `coverage.md` and the rollover `system` row.
- [ ] **step 3 — mandatory pre-nano 10-iteration critique & font/accessibility gate (`critique/pre-nano-10-iterations.md`)**: run all **10 critique-and-rewrite passes AND `python3 scripts/font_scale_and_pairing.py audit` before calling Nano Banana (`0` image rounds spent)** auditing web-safe Primary + Companion weights (`400/500/600`), WCAG 2.2 AA token contrast (`>= 4.5:1` body/muted/button labels, `>= 3.0:1` large headings & borders), zero `< 12px` font tokens, per-surface viewport/char-per-line locks, `>= 38%-45%` negative space, `2:1` pill optical padding, and complete footers (`>= 9.5/10`).
- [ ] **step 4 — `image-gen <-> design-critique / polish` (hyper-critique swarm, 10-dimension auto-correction, surface-matched image-to-image, `>= 1K` / `2K` crystal-clear PNGs, `<= 3` cap)**:
  - **100% Surface-Matched Image-to-Image Starting from Pixel-Perfect Reference Base Screenshots (`ref-base`, NEVER Cross-Surface Scale Mismatch)**: never run blind text-to-image out of `jason-design-agent`, and whenever researched benchmark screenshots exist, slice pixel-perfect `2K` base transfer plates via [lock_and_verify_plates.py](scripts/lock_and_verify_plates.py) (`ref-base`) matched to the target surface (`desktop-fullpage.png` `@2x` for `desktop-web`; `mobile-fullpage.png` `@3x` for `mobile`; cropped widget/app view or `font_scale_and_pairing.py scale-seed --surface=<mobile|desktop-app|component>` whenever no same-surface capture exists—never pass only a `1440px` `16:9` desktop plate into a `390pt` `9:16` mobile render, which shrinks mobile text `3.7x`).
  - **Quota-safe pacing (`<= 2` concurrent image subagents max)**: reuse `1-2` persistent `image-generator` subagents sequentially via `send_message`—never spawn `> 2` concurrent image subagents (`429 RESOURCE_EXHAUSTED` burn ban).
  - **Minimum `1K` every edge (`min(w, h) >= 1024`) & crystal-clear `2K` PNG lock**: lock every plate via `python3 scripts/lock_and_verify_plates.py lock --raw=<raw> --out=<concepts/.../*.png> --ref-image=<ref>` (`2752x1536` `16:9`, `1536x2752` `9:16`, `2400x1792` `4:3`, `1536x3072` `1:2`, `sharpness_ratio >= 0.28`, `hf_detail_std >= 0.8`, zero aspect-squash ghosting) and inspect via `read_file`.
  - **Hyper-Critique Swarm & Anti-Inching 10-Dimension Steering (when `turns >= 2`)**:
    - When running **competing design rounds**, run `python3 ../design-critique/scripts/run_critique_swarm.py audit --study-dir=<study-dir> --turn=1 --swarm-count=15` (`critique/round-1-vs-benchmarks.md` & `critique/hyper-critique-report.md`).
    - Enforce the **Tri-Perspective Brutal Judgment**: (1) judge like a designer (pure visual taste), (2) judge back to research benchmarks, and (3) judge itself (harsh self-audit of lazy choices).
    - Enforce the **Anti-Inching Law**: do **not** inch 1 minor change. Auto-correct across all **10 dimensions simultaneously** (grid, Google Fonts, chromatic polarity, optical padding, hero mechanism, copy canon, tactile materiality, mobile parity, component modularity, and benchmark distinction) to steer Round 2 into a decisive, high-contrast leap. Condition Round 2 on the Round 1 plates (`ImagePaths=[r1_plate]`) to tune and sharpen the challenger.
- [ ] **step 4.5 — mandatory pre-moodboard designer image checkpoint (STOP & SHOW ALL IMAGES BEFORE `build_moodboard.py`)**:
  - Run `python3 scripts/lock_and_verify_plates.py verify --study-dir=<study-dir>` to emit `critique/pre-moodboard-image-checkpoint.md`.
  - **Present all generated plates directly to the designer in chat** (inline links/previews, pixel dimensions, sharpness metrics, and reference lineage) and **wait for designer approval or surgical edit requests BEFORE building the moodboard**.
- [ ] **step 5 — build deterministic `#0c0c0b` moodboard via [build_moodboard.py](scripts/build_moodboard.py) (after designer checkpoint approval)**:
  - Execute `python3 scripts/build_moodboard.py --config=<config.json> --study-dir=<study-dir>` (enforces `min(w, h) >= 1024`, crystal-clear `2560px 4:4:4 q93` embeds, `0` default approvals, `0` preview adjustments, quoted prompt always top-left, clean rollover with `rounds` + `filter` + `system` + `typefaces` + `palette`, zero card descriptions, `open` links).

---

## non-negotiable moodboard rules (enforced by [build_moodboard.py](scripts/build_moodboard.py))

1. **always-visible top-left title + quoted prompt, top-right design turns**: `14px` top padding; prompt-based title + `"<prompt>"` top-left; `<N> design turns` top-right.
2. **clean aligned rollover drawer (zero preview adjustments)**: `92px` left label rail (`view`, optional `rounds` with `all rounds` / `round 1` / `round 2` / `head to head (2-col)`, `filter`, `system`, `typefaces`, `palette`). Hue, warmth, depth, recolor, and font-switcher controls are **strictly forbidden**.
3. **zero default approvals, `<surface> -- <role>` titles, zero card descriptions & `open` links**: start at `approved (0)` (`selected: false`), render zero `<p>` descriptions under cards, and label links **`open`** (zero arrows, zero emojis).

---

## references

- [moodboard, direct research inspiration, anti-beige & 10-iteration critique specification](references/moodboard-and-pipeline-spec.md)
- [web-safe accessible font pairing & 4-surface nano banana scale](references/web-safe-typography-and-nano-scale.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
