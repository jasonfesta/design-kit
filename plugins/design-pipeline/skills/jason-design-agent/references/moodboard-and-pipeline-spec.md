# moodboard, direct research inspiration, anti-beige & critique spec (`jason-design-agent`)

## 1. core design-logic rules (anti-beige + 5 distinct examples + head-to-head rounds)

1. **hard anti-beige default ban & continuous structural grids**:
   - `jason-design-agent` is strictly forbidden from defaulting to warm beige, cream, oat, parchment, sand, unbleached cotton, or linen canvases (`#F4EFE6`, `#F6F2EA`, `#FAF6F0`, `#EFE9DF`) unless the user's prompt explicitly asks for beige/parchment. On light gallery layouts, keep pure `#FFFFFF` optic white top-to-bottom down the entire scroll—never let `#FFFFFF` fade or warm-shift into off-white beige in mid-page sections or footers.
   - Whenever a layout establishes an architectural `1px` grid (`#E6E8EC` hairlines/crosshairs), carry that exact `1px` grid continuously and consistently from the top hero all the way through the footer rather than fading it out partway down.
   - Across any multi-example study, enforce **radically contrasting non-beige chromatic worlds** (e.g., pure `#FFFFFF` optic gallery white + brushed 304 stainless steel; deep `#0B3D26` forest emerald + `#C9F2DA` mint color-blocking; matte `#0A0B0E` nocturnal obsidian + `#FF5A1F` vacuum-tube glow; cool raw `#E3E6EA` concrete + `#E0281E` Swiss grid stamp; stark `#0C0C0E` / `#F7F8FA` pitch-black & platinum monochrome).
1b. **web-safe headline + accessible companion body pairing, 4-surface nano banana scale, zero middle dots (`·`) & real web SaaS UI**:
   - Pair every live-ranked Primary Headline Google Font (`recommend_google_fonts.py`) with a **live-scored Web-Safe Accessible Companion Body & UI Google Font** via `scripts/font_scale_and_pairing.py pair` (`Latn` script, `400` + `500/600` or variable `wght`, high Google `/Purpose/Easy Reading` + `/Quality/*` scores, zero banned AI clichés).
   - **Never pass bare `"16px"` or sub-`12px` (`"10-12px"`) rules to Nano Banana**: anchor every prompt to its exact **logical `1x` viewport -> `2K` canvas DPR**, **`% of canvas height`**, and **verbatim character-per-line & line-count copy budget** (`desktop-web`: `1440x810` `@1.91x`, `H1` `48-60px` / `6.0%-7.4%` H, `Body` `16-18px` / `2.0%-2.2%` H at `55-70` chars/line; `mobile`: `390x844` `@3.94x`, `H1` `28-34pt` / `3.3%-4.0%` H `<= 2` lines, `Body` `16pt` / `4.1%` W at `34-42` chars/line, `>= 44pt` touch targets; `desktop-app`: `1440x900` `@1.82x`, `1`-line `24-30px` view title, `14-16px` rows/prose, `0` `64px` marketing headlines; `component`: `720x540` stage `@3.33x`, `20-24px` card title, `15-16px` body at `32-46` chars/line; **hard `12-13px` WCAG floor everywhere**). See `references/web-safe-typography-and-nano-scale.md`.
   - **Zero middle dots (`·` / `•`)** between navigation items, inline metadata, pills, or footer links—separate links with clean horizontal CSS whitespace (`16px–28px` gap).
   - **Zero `FIG 0.1` / `Figure 1, Figure 2, Figure 3` or `01 / ...` AI figure badges** anywhere on layouts.
   - **100% real web-based SaaS UI components** inside feature touts (structured web tables with headers/flags/sparklines/status pills/inputs—never giant plain text lines pretending to be product UI).
2. **5 standout researched examples -> direct inspiration lock (never average into mush)**:
   - `research` yields **5 standout real-world examples** specifically chosen because they **produce 5 visibly different structural, chromatic, and material results**.
   - Instead of averaging the 5 examples into one generic synthesis, `style-direction` and `image-gen` take **direct structural, chromatic, and material inspiration** from each researched example—carrying forward its exact grid tension, color blocking, architectural materiality, and hero UI mechanism while pairing it with non-copied live `google-font-selection` fonts and original `canon.md` domain copy.
3. **progressive base-to-original multi-round evolution (`round 1` -> `round 2` -> `round 3`, zero identical rounds)**:
   - **full-webpage base first (`ref-base`, never rudimentary wireframe `seed` boxes)**: capture the **entire full webpage** of every researched benchmark in Chrome DevTools / Playwright (`research/scripts/capture_fullpage_devtools.mjs` -> `desktop-fullpage.png`, `desktop-fullpage-contact.jpg`, `fullpage-callouts.json`, and `2K` section base slices). Start image-to-image directly from those pixel-perfect `2K` reference base screenshots (`lock_and_verify_plates.py ref-base`) so Nano Banana inherits real callout density, lighting physics, coordinate rails, and micro-chrome rather than empty 3-box wireframes.
   - **dramatic improvement every round**: consecutive rounds (`round 1` -> `round 2` -> `round 3`) MUST show an unmistakable leap in art direction, callout sophistication, and originality (`2%` surgical copy/border re-renders between rounds are forbidden). Between every round, `design-critique` compares the current plate against **both** the original full-webpage capture (`desktop-fullpage-contact.jpg`) **and** the prior round, extracting missed section callouts and elevating art direction until the final round is both senior in craft and deeply original. On 3-round moodboards, `build_moodboard.py` places `round 1`, `round 2`, and `round 3` side-by-side across the 3-column grid.
4. **mandatory image-to-image conditioning, `>= 1K` (`2K` lossless PNG) crystal-clear gate & quota-safe pacing**:
   - **100% Image-to-Image**: every Nano Banana call out of `jason-design-agent` (`image-gen`, `polish`, `nanofy`, Round 2/3 evolution) MUST pass `ImagePaths` / `--input_image`. Base transfers pass pixel-perfect `2K` Chrome DevTools / Playwright reference crops (`ref-base`); subsequent evolution hops pass the prior hop/round plate + secondary benchmark callout crops (`seed` is strictly a last-resort fallback when zero visual reference URLs exist).
   - **Minimum `1K` every edge & `2K` crystal-clear PNG lock**: `min(width, height) >= 1024` (`768px` short-edge JPEGs are strictly rejected). Every plate is locked via `scripts/lock_and_verify_plates.py lock` to lossless sRGB `.png` (`2752x1536` `16:9`, `1536x2752` `9:16`, `2400x1792` `4:3`, `2048x2048` `1:1`, `1536x3072` `1:2`) with zero aspect-ratio squash (`<= 8%` drift) and verified crystal-clear (`hf_detail_std >= 0.8`, `sharpness_ratio >= 0.28`). Artifact Pane embeds in `build_moodboard.py` use `2560x2560> 4:4:4 q93` (zero `4:2:0` chroma haloing).
   - **Quota-safe concurrency (`<= 2` image subagents max)**: reuse `1–2` persistent `image-generator` subagents sequentially via `send_message`; never launch parallel subagent bursts that hit `429 RESOURCE_EXHAUSTED` or waste quota.
5. **mandatory pre-moodboard designer image checkpoint**:
   - After `scripts/lock_and_verify_plates.py verify --study-dir=<study-dir>` passes and BEFORE calling `scripts/build_moodboard.py`, pause and present all generated images (`critique/pre-moodboard-image-checkpoint.md` + inline clickable image links, exact pixel dimensions, sharpness scores, and reference lineage) to the designer so they can request surgical edits before assembling the full moodboard HTML package.
6. **hyper-critique swarm, tri-perspective judgment & anti-inching auto-correction**:
   - **Tri-Perspective Brutal Judgment**: On every round, evaluate the work from three independent angles: (1) *Judge like a Designer* (pure aesthetic power, visual poise, optical padding, negative space, Google Font anatomy), (2) *Judge back to Research* (benchmark fidelity, layout mechanisms, avoid lists, zero beige), and (3) *Judge Itself* (harsh self-audit of lazy choices and compromises).
   - **Anti-Inching Law**: A turn must NEVER inch one minor change at a time. The turn must change across **10 distinct dimensions simultaneously** (grid architecture, typography pairing, chromatic polarity, optical padding, hero focal mechanism, editorial copy canon, tactile materiality, mobile parity, component modularity, benchmark distinction).
   - **10-to-15 Agent Critique Swarm**: Queue a swarm of 10 to 15 specialized critique agents via `python3 ../design-critique/scripts/run_critique_swarm.py audit` (`lead_taste_critic`, `benchmark_fidelity_auditor`, `typographic_anatomist`, `grid_structuralist`, `chromatic_polarity_critic`, `optical_padding_inspector`, `hero_mechanism_specialist`, `editorial_canon_auditor`, `multi_surface_architect`, `tactile_materialist`, `anti_cliche_killer`, `component_modularist`, `spatial_depth_critic`, `pixel_acutance_inspector`, `brutal_red_team_critic`) to provide unrelenting multi-angle feedback before Round 2 or final sign-off.

---

## 2. non-negotiable moodboard specification (`<study-slug>/index.html` + `plates/*.html`)

Every moodboard published by `jason-design-agent` (via `scripts/build_moodboard.py`) strictly obeys these rules:

1. **strict `#0c0c0b` lowercase system (`moodboards/index.html` verbatim)**:
   - `--bg: #0c0c0b`, `--fg: #ededec`, `--muted: #858481`, `--faint: #494946`, `--line: #1e1e1c`.
   - `15px` (`500`, `--fg`) for moodboard title and card titles; `14px` (`--muted`) for the quoted prompt; `13px` (`.actions` `1px solid --line` underline -> `--fg` on hover/active, and `--faint` `.status` for passive round/turn counts).
   - **zero arrows & zero emojis**: never render `↗`, `←`, `→`, `▾`, `👍`, or `👎`.
2. **zero preview adjustments allowed (strictly forbidden)**:
   - Never render hue, warmth, depth, contrast, color-grading checkboxes, or page-font switcher controls anywhere on the moodboard (`index.html`).
3. **zero approvals by default**:
   - Every plate initializes unselected (`selected: false`, `vote: "none"`, `approved (0)`) in both `index.html` and `selections.json`.
4. **compact non-sticky top header (`14px` top padding) with prompt always visible in quotes**:
   - **at rest (always visible)**: prompt-derived moodboard title + **exact user prompt wrapped in quotes** (`"<prompt>"`) on the top left; `<N> design turn(s)` on the top right.
   - **on rollover (`.page-header:hover` or click title to pin `.is-pinned`)**: expands an in-flow `.drawer-grid` aligned on a `92px` left label rail: `view`, `rounds` (when multi-round: `all rounds` · `round 1` · `round 2` · `head to head (2-col)`), `filter` (dynamically showing active pillars + `approved (0)`), `system` (explicit architecture notes), `typefaces`, and `palette`.
5. **architecture-honest `<surface> — <role>` naming, zero card descriptions & `open` links**:
   - **single-brand mode**: all `web` plates belong to one website (`web — home landing page` on slot 1 + interior routes sharing identical header/footer) and all `mobile app` plates belong to one app (`mobile app — <tab>`).
   - **5-example multi-direction mode**: each separate website direction uses `web — home landing page · <direction>` (never pretending interior pages are separate landing pages, and keeping explicit notes in `coverage.md` and `system`).
   - **zero per-card descriptions** and **`open`** link text (`open` · `approve` · `skip` · `round <N>` / `turn <N>`).

---

## 3. mandatory pre-nano 10-iteration design critique loop (`critique/pre-nano-10-iterations.md`)

Before spending a single Nano Banana call (`0` rounds spent), `jason-design-agent` runs 10 explicit critique-and-rewrite iterations:
1. **iter 01 — category cliché & warm-beige kill**: strip generic SaaS/cafe hero tropes and kill any warm beige/cream/oat defaults.
2. **iter 02 — live web-safe headline + companion body pairing, WCAG AA contrast & 4-surface scale audit**: run `recommend_google_fonts.py` + `scripts/font_scale_and_pairing.py pair` & `audit` (`~1,950` families), ban AI-default clichés (`Instrument Serif`, `Playfair Display`, `Cormorant Garamond`, `DM Serif Display`, `Cinzel`, `Inter`, `Roboto`, `Plus Jakarta Sans`, `DM Sans`) + `avoid_fonts`, verify `>= 4.5:1` / `>= 3.0:1` WCAG 2.2 AA contrast and `>= 16px` body / `>= 12px` floor, and embed physical letterform anatomy + per-surface viewport, `% canvas height`, and character/line-count copy locks so `0` image rounds get wasted on font fixes.
3. **iter 03 — 5-example chromatic polarity & material tooth**: verify 5 distinct non-beige color/material worlds grounded directly in the 5 researched benchmarks.
4. **iter 04 — direct benchmark mechanism & product-architecture audit**: verify each prompt channels the concrete layout grid, proportion, and hero mechanism of its researched benchmark, with explicit architecture notes.
5. **iter 05 — macro layout & `>= 38%–45%` negative-space audit**: enforce `64px–96px` outer desktop margins and `80px–128px` vertical section pauses.
6. **iter 06 — optical padding & micro-geometry audit**: enforce `28px–36px` card padding, `40px–48px` pills/buttons with `2:1` L/R to T/B optical padding (`20px–28px` L/R, `8px–10px` icon gap), `>= 18%–22%` margin around isolated components, and `75%` open stage on experiences.
7. **iter 07 — authentic editorial copy & zero meta-leakage audit**: verify realistic domain metrics (`tabular-nums`) and zero literal hex codes or font names printed as UI badges.
8. **iter 08 — cross-example distinctness check**: verify that squint-testing the 5 examples yields 5 unmistakable silhouettes and color worlds.
9. **iter 09 — Nano Banana renderability & complete-footer audit**: verify full top-to-bottom page closure on all web screens.
10. **iter 10 — pre-flight sign-off (`>= 9.5/10`)**: lock prompts before firing Round 1 Nano Banana (`<= 3` image rounds hard cap).
