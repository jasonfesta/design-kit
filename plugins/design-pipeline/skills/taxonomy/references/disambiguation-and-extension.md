# Disambiguation Decision Tree & Extension Protocol

Companion to [taxonomy-catalog.md](taxonomy-catalog.md) and [`assets/taxonomy.json`](../assets/taxonomy.json). Part A resolves ambiguous items into exactly one `(category_id, subcategory_id)`. Part B is the step-by-step protocol for adding categories and subcategories without breaking existing IDs.

---

## Part A: Disambiguation decision tree

### A0. Principles (apply in this order)

1. **Intent over treatment.** Classify by what the primary user is trying to do in the finished product, never by palette, density, darkness, or motion.
2. **Core loop over feature list.** Identify the single screen or action the product would be useless without. That screen picks the subcategory.
3. **One primary label.** Record runners-up as secondaries with confidence scores; never multi-label the primary.
4. **Audience tiebreak.** When two Enterprise subcategories tie, the primary user's role decides (developer, finance operator, analyst or executive, everyone else).
5. **Never force-fit.** Items with no active home are `unclassified` with a `nearest_candidate` and go to Part B.

### A1. Top-level routing

```text
Is the surface public and scroll-to-convert (no login wall, hero + sections)?
├── yes -> LANDING PAGE (A2)
└── no  -> Is the logged-in user doing work for an organization (operate, analyze, build, manage)?
           ├── yes -> ENTERPRISE (A3)
           └── no  -> Is the logged-in user living personal life (connect, learn, watch, be well, travel, read)?
                      ├── yes -> CONSUMER APPS (A4)
                      └── no  -> UNCLASSIFIED (record nearest candidate; see Part B)
```

Edge: a **course landing page with the lessons inside** is Consumer Apps / Education (teaching intent wins). A **school's marketing homepage with no learning content** is Landing Page / General Website Landing Page.

### A2. Inside Landing Page

```text
Would the page collapse if the real-time 3D canvas were removed?
├── yes -> advanced-3d-website-landing-page
└── no  -> Is the primary action browsing and buying products (grid + cart + checkout)?
           ├── yes -> ecommerce
           └── no  -> Is the content one person's or one studio's body of work?
                      ├── yes -> portfolio
                      └── no  -> Does art direction, campaign story, and identity carry the page
                                 (manifesto, lookbook, cinematic chapters, "our story")?
                                 ├── yes -> marketing-brand-sites
                                 └── no  -> general-website-landing-page   (default)
```

Worked cases:

| Prompt fragment | Pick | Why |
| :-- | :-- | :-- |
| "WebGL hero with a spinning logo, then features and pricing" | `general-website-landing-page` | 3D is a hero accent; page survives without it. |
| "Product explodes into parts as you scroll, camera flies through" | `advanced-3d-website-landing-page` | 3D is the structure. |
| "Fashion label campaign site with lookbook and a single Shop link" | `marketing-brand-sites` | Buying is secondary; story carries it. |
| "Fashion label store with collections, PDP, and cart" | `ecommerce` | Buying is the core loop. |
| "Agency site: manifesto, services, selected clients, studio" | `marketing-brand-sites` | Brand identity over work grid. |
| "Designer site: 6 case studies, about, contact" | `portfolio` | Body of work is the content. |
| "AI note-taker homepage: hero, features, testimonials, pricing" | `general-website-landing-page` | Conventional conversion stack. |

### A3. Inside Enterprise

```text
Is money the domain (balances, transactions, invoices, payments, trading, budgets)?
├── yes -> finance
└── no  -> Is the primary user a developer working with code, APIs, builds, logs, or infra?
           ├── yes -> dev-tools
           └── no  -> Is the primary verb monitor / analyze / report (KPIs, charts, drill-down)?
                      ├── yes -> data-and-analytics-dashboard
                      └── no  -> Is the primary verb organize / write / plan / communicate?
                                 ├── yes -> productivity-apps
                                 └── no  -> data-and-analytics-dashboard if data-first, else productivity-apps
```

Worked cases:

| Prompt fragment | Pick | Why |
| :-- | :-- | :-- |
| "Internal analytics for a fintech ops team: KPIs and cohort charts" | `data-and-analytics-dashboard` | Analyzing, not moving money. |
| "Consumer budgeting app with accounts, transactions, and goals" | `finance` | Money is the domain (v1 keeps all finance under Enterprise). |
| "Issue tracker kanban for an engineering team with PR links" | `dev-tools` | Developer audience tiebreak. |
| "Kanban for a marketing team with calendar and docs" | `productivity-apps` | Organize or plan for non-developers. |
| "Observability dashboard for API latency and error budgets" | `dev-tools` | Developer audience even though chart-heavy. |
| "Executive revenue dashboard with charts and a table" | `data-and-analytics-dashboard` | Reading numbers is the core loop; revenue is analyzed, not transacted. |

### A4. Inside Consumer Apps

```text
Is the core loop pressing play on audio or video?
├── yes -> media-apps
└── no  -> Is the core loop reading articles, issues, posts by publishers?
           ├── yes -> content-and-publishing
           └── no  -> Is the purpose to teach (lessons, quizzes, courses, simulators, tutoring)?
                      ├── yes -> education
                      └── no  -> Is the core loop user-generated posts and person-to-person interaction?
                                 ├── yes -> social-site
                                 └── no  -> Is it about moving a person to a place (search, book, itinerary)?
                                            ├── yes -> travel
                                            └── no  -> Is it personal body, mind, or daily-life wellbeing?
                                                       ├── yes -> health-lifestyle
                                                       └── no  -> UNCLASSIFIED (nearest candidate)
```

Worked cases:

| Prompt fragment | Pick | Why |
| :-- | :-- | :-- |
| "Podcast app with episode notes you can read" | `media-apps` | Play is the loop; notes are secondary. |
| "Magazine with embedded video trailers in articles" | `content-and-publishing` | Reading is the loop. |
| "Video course platform with lessons and quizzes" | `education` | Teaching intent beats video player. |
| "Community for runners: activity feed, kudos, clubs" | `social-site` | UGC and interaction are the product. |
| "Running tracker with routes, pace, and weekly goals" | `health-lifestyle` | Personal fitness is the loop. |
| "Hotel brand homepage, no search or booking" | `marketing-brand-sites` | Landing page, not Travel. |
| "Hotel search with dates, map, and booking flow" | `travel` | Booking is the loop. |

### A5. Scoring and escalation

1. Run `scripts/classify_taxonomy.py --query "..."` for a heuristic shortlist.
2. If `status` is `confident`, accept the primary and record the top-2 as secondaries.
3. If `status` is `ambiguous`, answer the emitted `model_prompt` yourself (or pass it to a model) using the trees above and record `confidence` and one-sentence `reasoning`.
4. If `status` is `unclassified` after reasoning, label `unclassified`, set `nearest_candidate`, and open an extension proposal (Part B).

---

## Part B: Extension protocol

### B0. Invariants (never break these)

- **IDs are immutable and never reused.** Once a slug ships in `taxonomy.json`, it is permanent. Fix a label typo by editing `label` only; the `id` stays.
- **Deprecate, never delete.** Set `"status": "deprecated"` and add `"successor_id"` so historical slices still resolve.
- **Append-only ordering.** New entries take the next `order` number. Never renumber existing entries.
- **Counts must reconcile.** `category.reference_count == sum(active subcategory reference_count)` and `reference_counts.total == sum(active category reference_count)`. `--validate` enforces this.
- **Every subcategory ships complete.** Non-empty `definition`, `positive_signals`, and `disambiguation` naming the nearest sibling and the tiebreak rule; a catalog entry in `taxonomy-catalog.md` with inclusion, exclusion, signature, and 2 example prompts.
- **Two levels only.** No third level; if a subcategory needs splitting, add sibling subcategories.

### B1. When to extend

Open a proposal when, over a reviewed slice, **at least 5 items** (or at least 3% of the slice, whichever is larger) land `unclassified` with the same `nearest_candidate`, or when a subcategory grows past roughly 40% of its parent and a stable, intent-distinct split is evident.

### B2. Adding a subcategory

1. Draft: `python3 scripts/classify_taxonomy.py --add-subcategory "Label" --parent <category-id> --definition "..."` (use `--dry-run` first). The entry is appended with `"status": "draft"`.
2. Fill `positive_signals`, `negative_signals`, and `disambiguation` in `assets/taxonomy.json`.
3. Update the **nearest sibling's** `disambiguation` and `negative_signals` so the boundary is stated on both sides.
4. Add the catalog section and summary row to `taxonomy-catalog.md`; add a worked case to the relevant tree in Part A.
5. Set `reference_count` from the slice evidence and bump the parent and total so `--validate` passes.
6. Re-run `--query` on 5 known items for the new slot and 5 for the nearest sibling; all 10 must resolve as expected.
7. Flip `"status": "active"`, bump `taxonomy_version` (`v1` -> `v1.1` for subcategory additions), and run the `skill-maker` pipeline.

### B3. Adding a category

1. Draft: `python3 scripts/classify_taxonomy.py --add-category "Label" --definition "..."`. The entry is appended at the next `order`.
2. Add at least 2 subcategories via B2 before activating (a category with one subcategory is a subcategory in disguise).
3. Add a top-level branch to A1 stating the question that routes into it, and a `cross_category_rules` entry if it introduces a new tiebreak.
4. Bump `taxonomy_version` (`v1` -> `v2` for category additions) and re-run validation and the pipeline.

### B4. Adjacent & Experimental WDA Silvers Collections (NOT active in `3 × 15` target slice)

> [!IMPORTANT]
> The entries below are **observed adjacent WDA V5/V6 categories and experimental WDA Silvers collections outside the locked `3 × 15` target slice (`557` prompts out of `1,384` unique prompts classified; `7,133` total gallery cards)**. They are tracked in `auxiliary_taxonomies` inside [`assets/taxonomy.json`](../assets/taxonomy.json) and [`prompt-template-match-catalog.md`](prompt-template-match-catalog.md) so future proposals start from known evidence, but they are **not** active `categories` in `taxonomy.json` until promoted through B2 and B3.

| Observed WDA Silvers / V6 Label | Observed Count | Likely Future Home | Notes |
| :-- | --: | :-- | :-- |
| **3D Games** (`3d_games_screenshot_only`) | 1,001 cards | Candidate category `games` (`3d-games`) | Playable 3D loops with scores/controls; explicitly excluded from `advanced-3d-website-landing-page`. |
| **Retro 2D Games** (`retro_2d_games_screenshot_only`) | 378 cards | Subcategory `retro-2d-games` under `games` | Arcade, pixel, and retro 2D playable loops. |
| **Widgets** (`widgets_screenshot_only`) | 347 cards | Candidate category `widgets` or component slice | Standalone single-component widgets (`pt = widget`). |
| **Modern 2D Games** (`modern_2d_games_screenshot_only`) | 142 cards | Subcategory `modern-2d-games` under `games` | Casual, puzzle, and board 2D games. |
| **SWE Agent Game References** | 104 cards | Subcategory under `games` | Reference game benchmarks for SWE agents. |
| **Media Experiences** | 37 prompts | Candidate category `media-experiences` (`order: 4`) | Parent of `Animations & Videos` (`24`) and `SVG` (`13`). |
| **3D Scenes / Simulators** (WDA V5 #3) | observed in V5/V6 | Split across `advanced-3d-website-landing-page`, `education`, and candidate `media-experiences` | 3D marketing showcases -> `advanced-3d-website-landing-page`; teaching simulators -> `education`; standalone non-landing 3D scenes -> `unclassified`. |

Until promoted, classify out-of-slice items as `unclassified` with the nearest active candidate (`advanced-3d-website-landing-page` for 3D marketing showcases, `education` for teaching simulators, `media-apps` for playback/studio surfaces, `dev-tools` for developer emulators/utilities).
