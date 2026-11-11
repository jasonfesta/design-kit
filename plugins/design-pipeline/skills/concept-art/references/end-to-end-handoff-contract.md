# end-to-end output folder schema, `4 x 3` matrix & moodboard contract (`concept-art`)

Every `jason-design-agent` run writes a slim, self-contained lowercase folder (`<study-slug>/`) containing the 5 standout benchmark dossiers + screenshots, the named style range (`style-range.md`) and non-copied direction, the **`4 x 3 = 12` anchored prompts and `2k` concept plates** (or multi-direction landing plates), and the optional **single `Design | Development` rounded-corner mosaic moodboard (`index.html`)**.

---

## 1. canonical output folder tree

```text
<study-slug>/
├── index.html                            # single human moodboard (Design | Development toggle, filters, 👍/👎)
├── selections.json                       # persisted 👍/👎 curation gating what enters jason-dev-agent
│                                         #   { "source": "jason-design-agent|imported", "updated_at": ISO-8601,
│                                         #     "items": [ { "slug", "pillar", "plate", "selected": true|false } ] }
├── prompt.md                             # user_prompt, design_agent_turns & 3-round nano banana cap
├── inspiration/                          # (url-list intake / nanofy) the inspiration folder that ships with the study
│   ├── manifest.json                     # one row per url: status, desktop px, files, analysis status, style codename
│   ├── README.md                         # human table of every url -> entire-page png / contact sheet / callouts / dossier
│   └── <NN>-<slug>-desktop-fullpage.png  # browsable copy of the ENTIRE long desktop page (captured first)
├── research/
│   ├── sources.json                      # (url-list intake) [{ slug, url }] — stable slugs, re-runs append
│   ├── benchmarks.md                     # 5-benchmark synthesis + avoid_fonts & avoid_palettes blocklists
│   ├── style-range.md                    # 5-10 named non-beige directions + squint-test matrix
│   ├── analysis-report.json              # analyzer/synthesizer/verifier results
│   ├── properties/
│   │   └── 01-<slug>.md .. 05-<slug>.md  # url, captures, observed, takeaway, adaptation
│   ├── prompts/
│   │   ├── README.md                     # index of prompt seeds -> ref-base slices
│   │   └── <NN>-<slug>-inspiration-prompt.md  # tri-voice Nano Banana seed per url (ref-base / material / designer / developer / do-not-copy)
│   └── screenshots/
│       └── 01-<slug>/ .. 05-<slug>/      # desktop-fullpage.png, contact sheet, 2K base slices, callouts json, mobile
├── style-direction/
│   ├── direction.md                      # benchmark range -> non-copied direction & style-range.md linkage
│   ├── typography-and-color.md           # non-copied Google Fonts + 8 semantic tokens + contrast audit
│   ├── canon.md                          # shared fictional brand/world, people, IDs, metrics & states
│   ├── coverage.md                       # maps every nav link, footer link, tab & experience to 01..12
│   └── content-tables.md                 # ranked copy & mechanics tables for web, app, component, experience
├── prompts/
│   ├── 01-anchor.md                      # [locked style constitution] + [slot 01/12 web-01 composition]
│   ├── 02-web-02.md .. 03-web-03.md      # remaining web prompts (desktop + mobile-web responsive rules)
│   ├── 04-app-01.md .. 06-app-03.md      # 3 cohesive mobile app screen prompts
│   ├── 07-component-01.md .. 09-component-03.md   # 3 separate, distinct component prompts
│   ├── 10-experience-01.md .. 12-experience-03.md # 3 unique interactive experience prompts
│   └── polish/
│       └── <slot>-round-<2|3>.md         # surgical edit prompts for failing slots in rounds 2-3 only
├── concepts/
│   ├── web/
│   │   ├── 01-web-01-<slug>.png          # golden anchor 2k plate (page 1 · desktop + mobile-web system)
│   │   ├── 02-web-02-<slug>.png          # page 2 (nav #2 + complete footer)
│   │   └── 03-web-03-<slug>.png          # page 3 (nav #3 + complete footer)
│   ├── app/
│   │   ├── 04-app-01-<slug>.png          # tab/screen 1
│   │   ├── 05-app-02-<slug>.png          # tab/screen 2
│   │   └── 06-app-03-<slug>.png          # tab/screen 3
│   ├── component/
│   │   ├── 07-component-01-<slug>.png    # distinct component 1
│   │   ├── 08-component-02-<slug>.png    # distinct component 2
│   └── │   └── 09-component-03-<slug>.png # distinct component 3
│   └── experience/
│       ├── 10-experience-01-<slug>.png   # unique interactive experience 1 (e.g., 3d / spatial / canvas)
│       ├── 11-experience-02-<slug>.png   # unique interactive experience 2 (e.g., game / playable / sandbox)
│       └── 12-experience-03-<slug>.png   # unique interactive experience 3 (e.g., bespoke interactive tool)
├── eval/
│   └── concept-eval.md                   # 6-gate scorecard + nano banana round ledger (<= 3 rounds)
├── projects/                             # empty until jason-dev-agent runs on 👍 selections
│   ├── dev-turns.json                    # { total_dev_turns, per_stage_turns, per_item_turns, items[] } rendered in index.html
│   └── <item-slug>/dist/index.html       # full standalone React HTML page opened on click-out (↗)
└── critique/
    ├── design-critique.md                # upfront sign-off + mid-build jason-dev-agent talk-backs
    └── final-design-signoff.md           # mandatory final post-dev-agent jason-design-agent output
```

---

## 2. single human moodboard specification (`<study-slug>/index.html` + `plates/*.html`)

1. **strict `moodboards/index.html` typography, `#0c0c0b` black lowercase system & zero preview adjustments**:
   - **canvas & palette**: `--bg: #0c0c0b`, `--fg: #ededec`, `--muted: #858481`, `--faint: #494946`, `--line: #1e1e1c`; system sans (`Inter` / `Google Sans`), `text-transform: lowercase`, `-webkit-font-smoothing: antialiased`.
   - **exact 3-tier type scale**: `15px` (`font-weight: 500`, `color: var(--fg)`) for moodboard & card titles; `14px` (`color: var(--muted)`, `line-height: 1.6`) for the top-left quoted prompt; `13px` (`.actions` `gap: 18px`, `border-bottom: 1px solid var(--line)` -> `--fg` on hover/active, and `--faint` `.status` for passive turn counts).
   - **zero arrows, zero emojis & zero preview adjustments**: never render `↗`, `←`, `→`, `▾`, `👍`, or `👎` icons/glyphs, and **strictly disallow preview adjustment controls** (no hue, warmth, depth, color-grading checkboxes, or font-switcher dropdowns anywhere on the moodboard).
2. **zero default approvals + always-visible quoted prompt + clean 5-row rollover drawer**:
   - **zero approvals by default**: every plate initializes unselected (`selected: false`, `vote: "none"`, `approved (0)`) in both `index.html` and `selections.json`—never pre-approve slots on load.
   - **compact top bar (`14px` top padding, non-sticky)**: at rest, the **top left always displays the prompt-based moodboard title + the exact user prompt wrapped in quotes (`"<prompt>"`)**, and the **top right displays `<N> design turn(s)`**.
   - **clean, organized rollover drawer**: hovering `.page-header` (or clicking the title to pin `.is-pinned`) smoothly expands an in-flow push-down `.drawer-grid` (`0fr -> 1fr`, never covering the mosaic) aligned on a `92px` quiet `--faint` left label column (`view`, `filter`, `system`, `typefaces`, `palette`).
3. **unified single-website / single-app naming, zero card descriptions & unbroken `open` links**:
   - **one website, one mobile app (keep explicit notes)**: unless the prompt explicitly requests multiple separate websites or apps, all 3 `web` plates form **one single website** (**only slot `01` is `web — home landing page`**, and slots `02–03` are interior pages of that same website) and all 3 `app` plates form **one single mobile app** across 3 tabs—recorded explicitly in `style-direction/coverage.md` and the rollover `system` row.
   - **card naming & zero descriptions**: every card `h2` uses **`<surface> — <plain functional role>`** without `01/02/03` numbering (`web — home landing page`, `web — <interior page>`, `mobile app — <tab>`, `component — <role>`, `experience — <role>`), with **no `<p>` description paragraph** beneath mosaic cards.
   - **unbroken `open` view**: clicking a card opens in-page full view (`comfortable fit` / `full width` / `actual pixels`), and **`open`** (never `open plate`) opens a standalone tab (`plates/<slug>.html` on disk; self-contained `text/html` Blob with inline `data:image/jpeg;base64,...` in embedded panes—**never** nested `blob:null/` URLs).
4. **`development` view**:
   - **before `jason-dev-agent` runs**: minimal `#0c0c0b` prose state confirming `0` React builds and `jason-dev-agent 0 turns`, listing approved slots.
   - **after `jason-dev-agent` runs**: displays `jason-dev-agent <K> turns` (from `projects/dev-turns.json`) and built cards opening standalone `projects/<item-slug>/dist/index.html`, paired with `critique/final-design-signoff.md`.
