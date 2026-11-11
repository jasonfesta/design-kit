---
name: taxonomy
description: >-
  Classifies user prompts, UI screenshots, design briefs, benchmark slices,
  and React deliverables into the canonical two-level WDA Silvers Prompt {-}
  Template Match taxonomy of 3 locked top-level categories (Landing Page 202,
  Enterprise 154, Consumer Apps 201 = 557 target prompts across 1,530 battles)
  and 15 subcategories with immutable kebab-case IDs, coverage metrics, 257
  accepted/golden template archetypes, 77 missing-template gap archetypes, and
  auxiliary dimensions (surface, complexity, 3D slot role, template page type,
  adaptation flags, loss tags, and WDA V5 16-category mapping). Resolves
  boundary cases by primary user intent and core loop, recommends matching
  templates and gap archetypes, audits JSONL slices, and extends the registry
  append-only without breaking IDs. Use when labeling a prompt or build,
  querying templates or missing-template gaps, auditing a benchmark dataset,
  or proposing new taxonomy categories. Don't use for choosing fonts (use
  google-font-selection), researching benchmarks...
metadata:
  icon: 🗂️
---

# taxonomy: canonical WDA Silvers Prompt ↔ Template Match classification & gap registry

`taxonomy` is the single source of truth for **what kind of thing** a prompt, screenshot, brief, benchmark item, template, or React deliverable is, synchronized with the live **WDA Silvers · Prompt ↔ Template Match** dataset (`https://my-chirpy-chipmunk.corp.google.com/prompt_template_match`).

It locks the canonical two-level taxonomy (`v1.1`): **3 top-level categories** and **15 subcategories** covering all **557 classified target prompts** (`109` curated `v6_report` + `448` LLM-classified out of `1,384` unique prompts across `1,530` battles), **257 accepted/golden templates** across `10` review-ready collections (`7,133` total cards across `29` gallery collections), **77 missing-template gap archetypes**, and all auxiliary Prompt ↔ Template Match dimensions.

```text
skill / taxonomy
---------------------------------------------------------------------------
input      prompt text, design brief, UI screenshot, JSONL slice, or built React app
registries assets/taxonomy.json            (3 categories, 15 subcategories, 557 prompts, 77 gaps, auxiliary taxonomies)
           assets/templates_and_gaps.json  (257 accepted/golden templates + 77 missing-template gap briefs)
           assets/prompts_index.json       (all 557 classified target prompts with 3D roles, widgets & top candidates)
output     primary (category_id, subcategory_id) + confidence + inferred dimensions + templates + gap archetypes
tools      scripts/classify_taxonomy.py  --tree | --list | --validate | --query | --gaps | --templates | --prompts | --dimensions | --check-slice | --add-*
```

## The locked `v1.1` taxonomy (`557` target prompts · `257` templates · `77` gaps)

| # | Category (`id`, total / V6 / LLM) | Subcategories (`id`, total · usable % · 3D · gaps) |
| :-- | :-- | :-- |
| 1 | **Landing Page** (`landing-page`, **202** = 34 V6 + 168 LLM · 48.5% usable · 22 gaps) | Advanced 3D Website Landing Page (`advanced-3d-website-landing-page`, **21** · 38.1% · 20 3D · 4 gaps) · Portfolio (`portfolio`, **19** · 36.8% · 3 3D · 3 gaps) · General Website Landing Page (`general-website-landing-page`, **91** · 61.5% · 8 3D · 8 gaps) · Marketing / Brand Sites (`marketing-brand-sites`, **24** · 66.7% · 2 3D · 2 gaps) · Ecommerce (`ecommerce`, **47** · 23.4% · 2 3D · 5 gaps) |
| 2 | **Enterprise** (`enterprise`, **154** = 28 V6 + 126 LLM · 50.6% usable · 23 gaps) | Data and Analytics Dashboard (`data-and-analytics-dashboard`, **36** · 69.4% · 3 3D · 4 gaps) · Finance (`finance`, **24** · 50.0% · 0 3D · 4 gaps) · Productivity Apps (`productivity-apps`, **63** · 38.1% · 2 3D · 11 gaps) · Dev Tools (`dev-tools`, **31** · 54.8% · 1 3D · 4 gaps) |
| 3 | **Consumer Apps** (`consumer-apps`, **201** = 47 V6 + 154 LLM · 42.3% usable · 32 gaps) | Social Site (`social-site`, **18** · 33.3% · 0 3D · 3 gaps) · Education (`education`, **61** · 36.1% · 6 3D · 9 gaps) · Media Apps (`media-apps`, **42** · 54.8% · 5 3D · 5 gaps) · Health/Lifestyle (`health-lifestyle`, **30** · 40.0% · 2 3D · 6 gaps) · Travel (`travel`, **11** · 45.5% · 2 3D · 3 gaps) · Content and Publishing (`content-and-publishing`, **39** · 43.6% · 0 3D · 6 gaps) |

Total target prompts: `202 + 154 + 201 = 557` (`109` V6 curated + `448` LLM). The complete per-subcategory specification lives in the [taxonomy catalog](references/taxonomy-catalog.md), and the 77 missing-template gap archetypes plus all auxiliary taxonomies live in the [Prompt ↔ Template Match catalog](references/prompt-template-match-catalog.md).

## Auxiliary Prompt ↔ Template Match dimensions (`--dimensions`)

Every prompt and template in `prompt_template_match` also carries secondary taxonomy tags:

| Dimension | Values (`count`) |
| :-- | :-- |
| **Prompt Surface (`surf`)** | `web_app` (255) · `marketing_site` (188) · `dashboard` (47) · `editor_tool` (37) · `mobile_app` (14) · `other` (6) · `animation` (5) · `3d_scene` (4) · `game` (1) |
| **Complexity Tier (`cx`)** | `multi_view_app` (284) · `multi_section` (195) · `single_page` (78) |
| **Platform (`br.platform`)** | `both` (293) · `desktop_web` (247) · `mobile` (17) |
| **3D Slot Role (`r3d`, 56 prompts)** | `hero_centerpiece` (27) · `section_feature` (10) · `product_viewer` (8) · `scroll_scene` (5) · `whole_page_scene` (5) · `background_ambient` (1) |
| **Template Page Type (`pt`, 257 templates)** | `dashboard` (108) · `landing_marketing` (51) · `web_app` (30) · `ecommerce_store` (22) · `mobile_app` (15) · `portfolio` (13) · `content_editorial` (10) · `chat_app` (7) · `widget` (1) |
| **Match Status (`st`)** | `strong` (3) · `adaptable` (258) · `no_match` (268) · `not_templatable` (28) |
| **Gap Reason (`gr`)** | `missing_domain_widgets` (267) · `not_templatable` (28) · `missing_page_type` (1) · `platform_mismatch` · `style_conflict` · `human_invalidated` |
| **Pair Invalidation (`PAIR_REASONS`)** | `style_mismatch` · `missing_features` · `specificity` · `wrong_category` · `not_templatable` · `retrieval_missed` · `prompt_unclear` |
| **Adaptation Flags (`ads`)** | `NEEDS_COLOR_CHANGE` · `NEEDS_FONT_CHANGE` · `NEEDS_LAYOUT_CHANGE` |
| **Template Loss Tags (`loss_tags`)** | `slop_inducing` · `spacing` · `text_density` · `color` · `hero` · `content_density` · `layout` |

> [!IMPORTANT]
> Only the 3 categories and 15 subcategories are **active** primary classification targets. Experimental WDA Silvers collections (`3D Games` 1,001, `Retro 2D Games` 378, `Widgets` 347, `Modern 2D Games` 142, `SWE Agent Game References` 104, `Media Experiences` 37) are tracked in `auxiliary_taxonomies` and Part B4 of the [disambiguation and extension guide](references/disambiguation-and-extension.md). Never emit them as primary labels.

## Workflow checklist

Copy this checklist for every classification or taxonomy task:

- [ ] **Step 1**: Identify the input type and extract the primary user intent and core loop
- [ ] **Step 2**: Run `classify_taxonomy.py --query` (and `--gaps` / `--templates` when matching archetypes)
- [ ] **Step 3**: Resolve ambiguity with the decision tree, never by visual treatment
- [ ] **Step 4**: Emit one primary pair with confidence, inferred dimensions, templates/gaps, and reasoning
- [ ] **Step 5**: For datasets, audit the slice distribution with `--check-slice`
- [ ] **Step 6**: For gaps, follow the append-only extension protocol and re-validate

---

## Step 1: Identify the input and its core loop

Accept any of these inputs and reduce each to one sentence: *"The primary user is X, and the product is useless without screen or action Y."*

| Input | What to read | Where intent hides |
| :-- | :-- | :-- |
| Prompt or brief | Nouns for the product, verbs for the user, audience words | "for a team" (Enterprise), "for me" or "daily" (Consumer), "visitors" or "convert" (Landing Page) |
| UI screenshot | Nav pattern, primary surface, data density | Sidebar plus tables (Enterprise), tab bar plus feed or player (Consumer), hero plus section stack (Landing Page) |
| Benchmark item | Original prompt text first, title second, footer tags last | Existing footer tags are hints, not ground truth |
| React deliverable | `App.tsx` routes, `data/*.ts` entity names, dominant components | A `Cart` drawer, a `NowPlaying` bar, a `KpiCard` grid each name the loop |

## Step 2: Run the classifier & query templates/gaps/prompts

```bash
# print the canonical tree with coverage/gaps, Markdown summary, and verify registry integrity
python3 {skill_dir}/scripts/classify_taxonomy.py --tree
python3 {skill_dir}/scripts/classify_taxonomy.py --list --format markdown
python3 {skill_dir}/scripts/classify_taxonomy.py --validate

# classify a prompt/brief and return inferred dimensions, recommended templates, and gap archetypes
python3 {skill_dir}/scripts/classify_taxonomy.py --query "3d supercar landing page with camera preset toolbar and material swatches configurator" --top 3

# inspect the 77 missing-template gap archetypes, 257 templates, 557 prompts, or auxiliary dimensions
python3 {skill_dir}/scripts/classify_taxonomy.py --gaps --sub advanced-3d-website-landing-page
python3 {skill_dir}/scripts/classify_taxonomy.py --templates --sub ecommerce --limit 10
python3 {skill_dir}/scripts/classify_taxonomy.py --prompts --sub advanced-3d-website-landing-page --3d --limit 5
python3 {skill_dir}/scripts/classify_taxonomy.py --dimensions
```

The classifier scores every active subcategory on whole-phrase hits against `positive_signals` (`+3`), `dominant_domains` (`+2`), `characteristic_widgets` (`+1.5`), category signals (`+1`), label hits (`+2`), and negative signals (`-2` / `-0.5`). It returns `confident`, `ambiguous` (with a `model_prompt` rubric), or `unclassified`.

## Step 3: Resolve ambiguity by intent, not treatment

Apply the principles in this order, then the per-category trees in the [disambiguation and extension guide](references/disambiguation-and-extension.md):

1. **Intent over treatment.** A dark, chart-heavy fintech app is `finance`; a WebGL-accented SaaS homepage is `general-website-landing-page` unless the page would collapse without the canvas (`advanced-3d-website-landing-page`).
2. **Public vs. logged-in.** Scroll-to-convert pages are Landing Page; logged-in work is Enterprise; logged-in personal life is Consumer Apps.
3. **Audience tiebreak inside Enterprise.** Developer wins `dev-tools`, finance operator wins `finance`, analyst or executive wins `data-and-analytics-dashboard`, everyone else wins `productivity-apps`.
4. **Teaching intent wins** over surface form: a lab simulator or a course page with lessons inside is `education`.
5. **Play/edit media vs. read.** Pressing play or editing audio/video/images is `media-apps`; reading articles, books, lore, or timelines is `content-and-publishing`.

## Step 4: Emit the classification

Return exactly one primary pair plus inferred dimensions and ranked secondaries:

```json
{
  "category_id": "landing-page",
  "subcategory_id": "advanced-3d-website-landing-page",
  "confidence": 0.94,
  "inferred_dimensions": {
    "surface": "marketing_site",
    "complexity": "multi_section",
    "needs_3d": true,
    "r3d_role": "product_viewer"
  },
  "secondary": [{"category_id": "landing-page", "subcategory_id": "marketing-brand-sites", "confidence": 0.25}],
  "reasoning": "Real-time 3D product configurator and camera preset HUD carry the page structure."
}
```

## Step 5: Audit a dataset or benchmark slice

```bash
# each JSONL row carries category_id and subcategory_id (field names configurable; labels or slugs accepted)
python3 {skill_dir}/scripts/classify_taxonomy.py --check-slice ./slice.jsonl --key category_id --subkey subcategory_id
```

## Step 6: Extend without breaking IDs

Follow Part B of the [disambiguation and extension guide](references/disambiguation-and-extension.md):

```bash
python3 {skill_dir}/scripts/classify_taxonomy.py --add-subcategory "Example Label" --parent consumer-apps --definition "..." --dry-run
python3 {skill_dir}/scripts/classify_taxonomy.py --add-category "Example Category" --definition "..." --dry-run
python3 {skill_dir}/scripts/classify_taxonomy.py --validate
```

## References

- [Taxonomy catalog: 3 categories, 15 subcategories, 557 prompt stats, domains, widgets, templates, gaps & examples](references/taxonomy-catalog.md)
- [Prompt ↔ Template Match full catalog: auxiliary taxonomies, 29 collections, loss tags & all 77 gap archetypes](references/prompt-template-match-catalog.md)
- [Disambiguation decision tree and append-only extension protocol](references/disambiguation-and-extension.md)
- [Canonical machine-readable registry (`557` prompts, `77` gaps, auxiliary taxonomies)](assets/taxonomy.json)
- [257 accepted/golden templates and 77 missing-template gap briefs](assets/templates_and_gaps.json)
- [All 557 classified target prompts index](assets/prompts_index.json)
- [Classifier, gap/template/prompt explorer, slice auditor, and extension CLI](scripts/classify_taxonomy.py)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
