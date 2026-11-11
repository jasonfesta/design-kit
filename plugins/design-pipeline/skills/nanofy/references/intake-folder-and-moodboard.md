# intake folder contract & the `Design | Development` moodboard (`nanofy`)

## what you hand `nanofy`

A zip or local folder — typically a designer's dump from their own Nano Banana session, possibly made away from Jetski — containing, side by side:

- **images** for everything that will eventually be built (`png` / `jpg` / `webp`), one per plate, across the **five surfaces**: desktop web, mobile web, application, components, experiences. The usual shape is one sub-folder per surface:

  ```text
  <dump>/
  ├── desktop-web/   01-hero.png  01-hero.md  02-pricing.png  02-pricing.md …
  ├── mobile-web/    01-hero.png  01-hero.md …
  ├── application/   home.png     home.md …
  ├── components/    pricing-card.png  pricing-card.md …
  ├── experiences/   sandbox.png  sandbox.md …
  ├── style-direction.md          # optional locked constitution (anchor|constitution|style|direction in the name)
  └── research-notes.md           # optional process / research notes
  ```

- **prompt MDs / TXTs** describing the style direction and how the research and the plates were achieved:
  - one per plate (paired **inside the same sub-folder first**, then by same stem → normalized stem → leading slot number; so `desktop-web/01-hero.md` never pairs with `mobile-web/01-hero.png`)
  - optionally one `*anchor*` / `*constitution*` / `*style*` / `*direction*` MD (the locked style constitution) — else slot `01`'s own prompt is the constitution
  - any research / process notes (unpaired MDs)

Flat folders and zips work too; a zip keeps its internal sub-folders for pillar inference.

## what intake produces (in place)

```text
<study>/
├── index.html                # ultra-collapsed #0c0c0b moodboard: title + design turns at rest; rollover reveals Design | Development, filters, controls; 0 approved by default
├── prompt.md                 # source: imported · design_agent_turns: 1 of N (turn 1 = nanofy) · research & prompts: provided by the imported MDs
├── selections.json           # { source, updated_at, items: [ { slug, pillar, plate, prompt, selected: false } ] } (0 approved by default)
├── manifest.json             # items + natural px + below_2k hints + pillars + design_agent_turns + has_prompts / anchor_prompt / research_notes
├── concepts/<pillar>/NN-<pillar>-NN-<slug>.<ext>   # originals (never overwritten)
├── prompts/<slot>.md (+ 01-anchor.md)              # imported constitution + per-slot composition (originals)
├── research/*.md                                   # unpaired process / research notes
├── style-direction/direction.md (+ tokens-from-plates.json with --extract-tokens)
├── nano/                     # written by nanofy-plates.py:
│   ├── <pillar>/<same filename>        # the NEW images (same px, same format, >= 1k)
│   ├── <pillar>/NN-<pillar>-NN-generated-<role>.png   # gap-fill plates for surfaces that arrived with < 3
│   ├── prompts/<slug>.md               # the NEW nano-based MDs (imported MD folded in + refinement note + final nano prompt)
│   ├── nanofy-plan.json · refinement-note.md · nanofy-report.json · README.md
├── inspiration/                # written at switch: manifest.json + README.md — every nano plate traced back to the dump file + MD
├── projects/design-turns.json  # turn 1 = nanofy (status intake -> complete at switch), budget, remaining turns
├── projects/dev-turns.json     # zeroed; jason-dev-agent fills it
└── critique/                   # design critiques + final-design-signoff.md
```

Pillars: `web` (desktop web) · `mobile-web` · `app` · `component` · `experience`. Inference order: the designer's **sub-folder name** (`desktop-web|web`, `mobile-web|m-web|mweb`, `application|app|mobile-app`, `components|component`, `experiences|experience`) → prompt `pillar:` hint → filename tokens (`web|landing|desktop`, `mobile`+`web` → mobile-web, `app|mobile|ios|android`, `component|ui|widget|card`, `experience|3d|game|sandbox`) → aspect ratio (tall → app, wide → web, square → component). `web` sorts first and, within it, the largest `2k` plate leads, so slot `01` is always the strongest **desktop web** plate — the nanofy anchor.

## coverage: gap fill & surplus

`plan --target-per-pillar 3` (default) checks every surface. A surface with fewer than three plates gets `fill` jobs — brand-new plates in the anchor's design system, each **briefed by `jason-design-agent`** (`brief --slug <slug> --text "…"`) from the breadth of everything else that came in: *I have all the components and the application screens — what would this product's three experiences be?* Generated plates take the anchor output + their surface's siblings as reference images, inherit the refinement note, join `selections.json` / the moodboard as approved `generated: true` items, and get their own `nano/prompts/<slug>.md` (with the brief). A surface with more than three plates is nanofied in full — nothing is dropped.

## inspiration trace

`switch` writes `inspiration/manifest.json` + `inspiration/README.md`: one row per plate with `dump_source` → `dump_plate` + `dump_prompt_md` → `concepts/` + `prompts/` → `nano/` + `nano/prompts/` (generated plates: brief + anchor instead of a dump file). This is the inspiration image folder that ships with the project: `jason-dev-agent` links it from every `projects/<slug>/` build and `design-critique` cites it in talk-backs and `critique/final-design-signoff.md`, so a finished build traces all the way back to the designer's original file.

## turn accounting

The nanofy pass (intake → anchored refresh at variation `0.5` → moodboard) is **`jason-design-agent` turn 1**, equivalent to a generated `research -> style-direction -> image-gen -> moodboard` turn. Pass the user's budget with `--design-agent-turns=N`; `projects/design-turns.json` records `total_design_turns: 1`, `remaining_design_turns: N-1`, and the moodboard pill reads `design: nanofy 0.5 · turn 1 of N`. Remaining turns are spent in `design-critique` talk-backs during the `jason-dev-agent` build, exactly like a generated study.

## the moodboard (`index.html`)

- **compact non-sticky top header (`14px` top padding, zero preview adjustments)**: at rest, displays the study title + quoted source/prompt on the top left and `<N> design turn(s)` on the top right directly above the mosaic. Rolling over `.page-header` (or clicking the title to pin `.is-pinned`) smoothly expands a clean aligned `meta-row` drawer (`view`, `filter`, `system`)—with **zero preview-adjustment controls allowed**.
- `Design`: rounded-corner masonry of every plate (reads `nano/` after `switch`), each card showing ONLY the plate, `<h2>` `<surface> — <role>` title (no per-card `<p>` description), **`open`** (never `open plate`), `prompt`, and **`approve` / `skip`** (**zero approvals by default**—every item starts unselected `selected: false` in `selections.json` and `localStorage`).
- `Development`: empty state until `jason-dev-agent` runs; then one card per built item with **`open`** (`projects/<slug>/dist/index.html`)

Open it locally (`file://…/index.html` or a `localhost` server); no `x20` unless asked.

## handoff to `jason-dev-agent`

Only after `nanofy-plates.py switch` has succeeded and the user has thumbed the set: `jason-dev-agent` receives the study folder, reads `selections.json` (`selected: true` items, `plate` paths under `nano/`, `prompt` paths under `nano/prompts/`, `generated: true` flags), `inspiration/manifest.json`, `research/`, and `style-direction/`, and runs its normal chain. It treats the study exactly like a `concept-art` study; the only visible differences are the `research:` line in `prompt.md` (no benchmark captures) and `design-turns.json` showing turn 1 as `nanofy`, which `design-critique` carries into talk-backs and the final sign-off.
