# WDA Silvers · Prompt ↔ Template Match Full Taxonomy & Gap Catalog

Canonical reference for all secondary classification dimensions, template collections, loss tags, and the **77 missing-template gap archetypes** from `https://my-chirpy-chipmunk.corp.google.com/prompt_template_match` (`autorater v5.4-general-template-archetype`).

---

## 1. Auxiliary Prompt & Template Taxonomies

### 1.1 Prompt Surface Taxonomy (`surf`)

| Surface ID | Label | Target Prompts (`557`) | Description |
| :-- | :-- | --: | :-- |
| `web_app` | **Web App** | 255 | Interactive logged-in or stateful web application workspace. |
| `marketing_site` | **Marketing Site** | 188 | Public scroll-to-convert landing page, brand site, portfolio, or storefront. |
| `dashboard` | **Dashboard** | 47 | KPI tile, chart, telemetry, and data-table monitoring surface. |
| `editor_tool` | **Editor / Tool** | 37 | Canvas, studio, media editor, code/query playground, or utility tool. |
| `mobile_app` | **Mobile App** | 14 | Handheld mobile-first app screen with bottom tab bar or mobile navigation. |
| `other` | **Other Surface** | 6 | Specialized standalone reference or multi-surface hybrid. |
| `animation` | **Animation / Motion Showcase** | 5 | Motion-driven interactive explainer, choreography showcase, or visual sequence. |
| `3d_scene` | **3D Scene / Showcase** | 4 | Full-bleed real-time 3D WebGL/Three.js stage or interactive spatial showcase. |
| `game` | **Game / Emulator** | 1 | Playable game loop or interactive emulator surface. |

### 1.2 Prompt Complexity Tiers (`cx`)

| Complexity ID | Label | Target Prompts (`557`) | Description |
| :-- | :-- | --: | :-- |
| `multi_view_app` | **Multi-View Application** | 284 | Multiple views, tabs, drawers, modals, or routed workspaces. |
| `multi_section` | **Multi-Section Page** | 195 | Vertical narrative stack of distinct content sections on a single page. |
| `single_page` | **Single-View / Single-Stage** | 78 | Focused single-viewport stage, canvas, calculator, or utility. |

### 1.3 3D Element Slot Roles (`r3d` when `n3d = true`)

56 of the 557 target prompts require an agent-generated 3D element (`n3d: true`). A matching template must provide a compatible slot for the prompt's `r3d` role:

| 3D Role ID | UI Badge | Count | Description |
| :-- | :-- | --: | :-- |
| `hero_centerpiece` | **3D Hero** | 27 | Primary hero stage centerpiece hosting an interactive 3D model or shader. |
| `section_feature` | **3D Section** | 10 | Dedicated embedded 3D section or interactive diagram mid-page. |
| `product_viewer` | **3D Product Viewer** | 8 | Interactive 3D product configurator or turntable inspector with camera/material controls. |
| `scroll_scene` | **Scroll-Driven 3D Scene** | 5 | Camera path or object transformation driven continuously by page scroll. |
| `whole_page_scene` | **Whole-Page 3D Scene** | 5 | Persistent full-viewport 3D world with HUD overlay navigation. |
| `background_ambient` | **3D Background** | 1 | Ambient shader, particle field, or WebGL backdrop behind foreground UI. |

### 1.4 Template Page Types (`pt` across 257 Review-Ready / Golden Templates)

| Template Page Type ID | Label | Templates (`257`) |
| :-- | :-- | --: |
| `dashboard` | **Dashboard** | 108 |
| `landing_marketing` | **Landing / Marketing** | 51 |
| `web_app` | **Web App** | 30 |
| `ecommerce_store` | **E-Commerce Store** | 22 |
| `mobile_app` | **Mobile App** | 15 |
| `portfolio` | **Portfolio** | 13 |
| `content_editorial` | **Content & Editorial** | 10 |
| `chat_app` | **Chat & Messaging App** | 7 |
| `widget` | **Widget** | 1 |

### 1.5 Active Review-Ready Template Collections (`257` Templates)

| Collection | Accepted / Golden Templates |
| :-- | --: |
| **Dashboard Apps** | 77 |
| **LA Landing** | 59 |
| **Productivity Apps** | 32 |
| **Finance Apps** | 30 |
| **LA Store** | 21 |
| **LA Portfolio** | 13 |
| **Android V1 (Screenshot Only)** | 12 |
| **Chatbot & Messaging** | 6 |
| **Content & Publishing** | 4 |
| **Android V0 (Screenshot Only)** | 3 |

### 1.6 Full WDA Silvers Screenshot Rating Gallery Collections (`7,133` Cards)

| Collection ID | Label | Group | Cards | Description |
| :-- | :-- | :-- | --: | :-- |
| `productivity_screenshot_only` | **Productivity Apps** | `prod_scrape` | 2,135 | WDA Silvers Screenshot-Only Productivity Reviews (2,135 cards / 36 accepted) |
| `finance_screenshot_only` | **Finance Apps** | `prod_scrape` | 1,497 | WDA Silvers Screenshot-Only Finance App Reviews (1,497 cards) |
| `3d_games_screenshot_only` | **3D Games** | `exp_scrape` | 1,001 | WDA Silvers Screenshot-Only 3D Games Reviews (1,001 cards / 7,545+ screenshots) |
| `retro_2d_games_screenshot_only` | **Retro 2D Games** | `exp_scrape` | 378 | WDA Silvers Screenshot-Only Retro 2D Games Reviews (378 cards / 1,944+ screenshots) |
| `widgets_screenshot_only` | **Widgets** | `exp_scrape` | 347 | WDA Silvers Screenshot-Only Widgets Reviews (347 cards / 361+ screenshots) |
| `dashboard_screenshot_only` | **Dashboard Apps** | `prod_scrape` | 316 | WDA Silvers Screenshot-Only Dashboard Reviews (316 cards) |
| `gempix_designer_screenshots_auto_filtered_screenshot_only` | **GemPix Designer (Auto-Filtered 315)** | `prod_scrape` | 315 | WDA Silvers Screenshot-Only GemPix 3 Designer Templates — 315 Automated-Filter Survivors (wda_v11_3band_gp3_1000@v11_3band_elo_sorted, strict Elo order #001-#315, pre-manual designer pick) |
| `la_landing_screenshot_only` | **LA Landing** | `prod_scrape` | 295 | LA Studio landing pages (studio-stills 2026-10-27 + 2026-10-28 coverage, gcc-passed) — Desktop + Mobile Fullpage (295) |
| `modern_2d_games_screenshot_only` | **Modern 2D Games** | `exp_scrape` | 142 | WDA Silvers Screenshot-Only Modern 2D Games Reviews (142 cards / 471+ screenshots) |
| `swe_agent_game_references_screenshot_only` | **SWE Agent Game References** | `exp_scrape` | 104 | WDA Silvers Screenshot-Only SWE Agent Game References Reviews (104 cards / 4,904+ screenshots) |
| `la_store_screenshot_only` | **LA Store** | `prod_scrape` | 80 | LA Studio store pages (studio-stills 2026-10-27 + 2026-10-28 coverage, gcc-passed) — Desktop + Mobile Fullpage (80) |
| `la_portfolio_screenshot_only` | **LA Portfolio** | `prod_scrape` | 68 | LA Studio portfolio pages (studio-stills 2026-10-27, gcc-passed) — Desktop Fullpage (68) |
| `education_and_learning_screenshot_only` | **Education & Learning** | `exp_scrape` | 49 | WDA Silvers Screenshot-Only Education & Learning Reviews (49 cards / 140+ screenshots) |
| `media_and_streaming_screenshot_only` | **Media & Streaming** | `exp_scrape` | 48 | WDA Silvers Screenshot-Only Media & Streaming Reviews (48 cards / 139+ screenshots) |
| `health_fitness_lifestyle_screenshot_only` | **Health, Fitness & Lifestyle** | `exp_scrape` | 46 | WDA Silvers Screenshot-Only Health, Fitness & Lifestyle Reviews (46 cards / 129+ screenshots) |
| `content_publishing_screenshot_only` | **Content & Publishing** | `prod_scrape` | 42 | WDA Silvers Screenshot-Only Content & Publishing Reviews (42 cards / 113+ screenshots) |
| `social_and_community_screenshot_only` | **Social & Community** | `exp_scrape` | 42 | WDA Silvers Screenshot-Only Social & Community Reviews (42 cards / 122+ screenshots) |
| `ecommerce_and_marketplace_screenshot_only` | **E-Commerce & Marketplace** | `exp_scrape` | 41 | WDA Silvers Screenshot-Only E-Commerce & Marketplace Reviews (41 cards / 139+ screenshots) |
| `travel_maps_realestate_screenshot_only` | **Travel, Maps & Real Estate** | `exp_scrape` | 37 | WDA Silvers Screenshot-Only Travel, Maps & Real Estate Reviews (37 cards / 89+ screenshots) |
| `android_v0_screenshot_only` | **Android V0 (Screenshot Only)** | `prod_scrape` | 31 | WDA Silvers Screenshot-Only Android V0 (Screenshot Only) Reviews (31 cards / 52+ screenshots) |
| `finance_and_ledgers_screenshot_only` | **Finance & Ledgers** | `prod_scrape` | 27 | WDA Silvers Screenshot-Only Finance & Ledgers Reviews (27 cards / 59+ screenshots) |
| `chatbot_screenshot_only` | **Chatbot & Messaging** | `prod_scrape` | 25 | WDA Silvers Screenshot-Only Chatbot & Messaging Reviews (25 cards / 59+ screenshots) |
| `debranded_productivity_screenshot_only` | **🧼 Debranded Productivity & Specs** | `exp_scrape` | 25 | Debranded & Cropped Golden Productivity Templates with Reusable <DESIGN.md> & <INTERACTIVITY_FEATURES> TDD Specs (25 golden templates) |
| `debranded_android_v1_screenshot_only` | **🧼 Debranded Android Templates & Specs** | `exp_scrape` | 24 | Debranded & UGC-Replaced Golden Android Templates (24 Apps / 219 Screens) with <DESIGN.md>, <MULTIPAGE_INSTRUCTIONS>, & <INTERACTIVITY_FEATURES> TDD Specs |
| `android_v1_screenshot_only` | **Android V1 (Screenshot Only)** | `prod_scrape` | 12 | WDA Silvers Screenshot-Only Android V1 (Screenshot Only) Reviews (12 cards / 12 accepted / 121+ screenshots) |
| `debranded_android_v0_screenshot_only` | **🧼 Debranded Android V0 & Specs** | `exp_scrape` | 3 | Debranded & Cropped Golden Android V0 Templates (3 Apps) with <DESIGN.md>, <MULTIPAGE_INSTRUCTIONS>, & <INTERACTIVITY_FEATURES> TDD Specs |
| `android_facebook_screenshot_only` | **Android Facebook** | `prod_scrape` | 1 | WDA Silvers Screenshot-Only Android Facebook Reviews (1 card / 12+ screenshots) |
| `debranded_android_facebook_screenshot_only` | **🧼 Debranded Android Facebook & Specs** | `exp_scrape` | 1 | Debranded & Cropped Golden Android Facebook Template (Vaeloris) with 12 Screens, <DESIGN.md>, <MULTIPAGE_INSTRUCTIONS>, & <INTERACTIVITY_FEATURES> TDD Specs |
| `trial_runs` | **🧪 Trial Runs (Zipline)** | `exp_scrape` | 1 | Golden Debranded Template Trial Runs — Interactive Zipline Showcases comparing 3 Conditioned Rollouts (Short, Medium, Long) vs. NO_REFERENCE Baselines |

---

## 2. Matcher Verdict, Gap Reason, Adaptation & Loss Tag Taxonomies

### 2.1 Prompt ↔ Template Match Statuses (`st`)

| Status ID | Label | Prompts (`557`) | Definition |
| :-- | :-- | --: | :-- |
| `strong` | **Perfect match** | 3 | Score >= 8/10 or reviewer-confirmed direct fit with all core requirements present. |
| `adaptable` | **Adaptable** | 258 | Score 7/10; usable template when adapted via color, font, or section layout tweaks. |
| `no_match` | **No match** | 268 | No template in the review-ready pool satisfies the prompt's page type or domain widgets. |
| `not_templatable` | **Not templatable** | 28 | Requires bespoke interactive canvas/game/simulator logic that should not use a static template. |

### 2.2 Prompt-Level Gap Reasons (`gr`)

| Gap Reason ID | Label | Prompts |
| :-- | :-- | --: |
| `missing_domain_widgets` | **Missing features / components** | 267 |
| `not_templatable` | **Not templatable** | 28 |
| `missing_page_type` | **Missing page type** | 1 |
| `platform_mismatch` | **Platform mismatch** | 0 |
| `style_conflict` | **Style conflict** | 0 |
| `human_invalidated` | **All matches invalidated by reviewers** | 0 |

### 2.3 Reviewer Pair Invalidation Reasons (`PAIR_REASONS`)

| Reason Key | Label | Meaning |
| :-- | :-- | :-- |
| `style_mismatch` | **Style Mismatch** | The template's visual style doesn't fit what the prompt asked for (e.g. dark neon / playful vs. pastel editorial). |
| `missing_features` | **Missing Features** | The prompt wants features or components the template doesn't have (e.g. booking calendar, map with listings, configurator) and they'd have to be built from scratch. |
| `specificity` | **Specificity** | The template is too specific to its own domain or content to work for this prompt (bespoke imagery, data, or widgets that do not transfer when re-skinned). |
| `wrong_category` | **Wrong Category** | The prompt or template is classified in the wrong category or subcategory. |
| `not_templatable` | **Should Be Not-Templatable** | This prompt requires bespoke interactive logic or canvas work and should not use a static template. |
| `retrieval_missed` | **Retrieval Missed a Template** | A better-fitting template exists in the gallery, but retrieval failed to shortlist it. |
| `prompt_unclear` | **Prompt Unclear** | The prompt is too vague, underspecified, or ambiguous to match confidently. |

### 2.4 Template Adaptation Flags (`ads`)

| Flag ID | Label | Meaning |
| :-- | :-- | :-- |
| `NEEDS_COLOR_CHANGE` | **Color** | Palette must change to fit the prompt. |
| `NEEDS_FONT_CHANGE` | **Font** | Typography must change to fit the prompt. |
| `NEEDS_LAYOUT_CHANGE` | **Layout** | Sections must be added, removed, or rearranged. |

### 2.5 Template Screenshot Rating Loss Tags (`loss_tags`)

| Loss Tag ID | Label | Description |
| :-- | :-- | :-- |
| `slop_inducing` | **Slop Inducing** | Likely to pull the generation toward AI-slop patterns (e.g. huge over-used stock photos, bento-box grids, cyberpunk / neon gradients, glassmorphism). |
| `spacing` | **Spacing** | Awkward spacing the model is unlikely to get right, or that leads to low-quality generations (cramped sections, giant empty gaps, uneven padding). |
| `text_density` | **Text Density** | Too much text compared with images and media (walls of copy, long link lists, text-only sections). |
| `color` | **Color** | Bad color palette or poor contrast (clashing or muddy colors, unreadable text on color). |
| `hero` | **Hero** | Problematic hero section (text over a busy hero image, hero too big or small, awkward placement). |
| `content_density` | **Content Density** | The design feels busy: too much going on (many competing modules, visual noise, no focal point). |
| `layout` | **Layout** | Structural or compositional problems (broken grid, misalignment, confusing section order). |

### 2.6 WDA V5 Classic 16-Category Schema → Canonical `3 × 15` Mapping

| V5 # | WDA V5 Classic Category | V5 Subtypes | Canonical Category ID | Canonical Subcategory IDs |
| --: | :-- | :-- | :-- | :-- |
| 1 | **Website Landing Page** | Marketing / Brand Sites, SaaS & Product Showcase, Hospitality & Showcase, Event & Launch Page | `landing-page` | `general-website-landing-page`, `marketing-brand-sites` |
| 2 | **Portfolios** | General, Minimalist & Typographic, Media-Heavy & Immersive, Eclectic & Neo-Brutalist | `landing-page` | `portfolio` |
| 3 | **3D Scenes / Simulators** | — | `landing-page` | `advanced-3d-website-landing-page`, `education` |
| 4 | **Data & Analytics Dashboards** | General, Financial & Business Analytics, User Activity & CRM, System & Server Monitoring | `enterprise` | `data-and-analytics-dashboard` |
| 5 | **3D and 2D Games** | General, RPG, Simulation, Action | `unclassified` | *(unclassified / out-of-slice)* |
| 6 | **Ecommerce & Marketplaces** | — | `landing-page` | `ecommerce` |
| 7 | **Content & Publishing** | — | `consumer-apps` | `content-and-publishing` |
| 8 | **Social** | — | `consumer-apps` | `social-site` |
| 9 | **Dev Tools** | — | `enterprise` | `dev-tools` |
| 10 | **Productivity** | — | `enterprise` | `productivity-apps` |
| 11 | **Finance** | — | `enterprise` | `finance` |
| 12 | **Education** | — | `consumer-apps` | `education` |
| 13 | **Media / Entertainment** | — | `consumer-apps` | `media-apps` |
| 14 | **Health, Fitness & Lifestyle** | — | `consumer-apps` | `health-lifestyle` |
| 15 | **Travel** | — | `consumer-apps` | `travel` |
| 16 | **Undetermined** | General / Unspecified | `unclassified` | *(unclassified / out-of-slice)* |

---

## 3. All 77 Missing-Template Gap Archetypes by Subcategory

Every `no_match` cluster in `prompt_template_match` is distilled into a concrete template archetype brief:

### 1. Landing Page (`landing-page`)

#### 1.1 Advanced 3D Website Landing Page (`advanced-3d-website-landing-page` — 4 gaps)
- **`Landing Page|Advanced 3D Website Landing Page|0` · Full-bleed 3D product configurator landing page** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t1583`, `t10151`, `t3420`, `t3217`)
  - **Why existing templates miss**: Users need an interactive, full-viewport 3D single-product showcase with real-time camera controls and customization drawers. Existing catalog templates lack integrated WebGL product viewports paired with floating material swatches and hotspot HUD popovers.
  - **Required template brief**: Full-bleed 3D hero canvas template featuring camera angle preset toggles, a side-docked color and material swatches customizer, floating detail HUD callouts, and explode/view control toggles.
- **`Landing Page|Advanced 3D Website Landing Page|1` · 3D interactive canvas and HUD landing page** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t10151`, `t10159`, `t3217`, `t10070`)
  - **Why existing templates miss**: Users need full-viewport 3D dynamic scene stages with sci-fi inspired floating overlay UI, metric indicators, and embedded interaction nodes. Existing templates lack dedicated full-screen WebGL viewport stages integrated with auto-hiding overlay headers and interactive node drawers.
  - **Required template brief**: Full-screen WebGL canvas template featuring a floating telemetry HUD header, interactive 3D viewport markers, auto-hiding overlay navigation, and a slide-out showcase drawer for detailed project node views.
- **`Landing Page|Advanced 3D Website Landing Page|2` · 3D scroll-driven storytelling landing page** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t10070`, `t3420`, `t10151`, `t10123`)
  - **Why existing templates miss**: Users need interactive visual presentation templates with central 3D scene stages, dynamic material controls, and expandable card stages. Existing templates lack scroll-synchronized 3D canvas stages combined with floating render tweak sliders and modal expansion popovers.
  - **Required template brief**: Interactive storytelling template with a full-height central 3D stage, scroll-triggered narrative section cards, a floating material control drawer, and interactive card expansion modals.
- **`Landing Page|Advanced 3D Website Landing Page|3` · 3D visual catalog and marketplace landing page** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t5634`, `t5763`, `t1583`, `t3223`)
  - **Why existing templates miss**: Users need landing pages that pair dynamic 3D hero stages with structured card grids and transactional/calculator widgets. Existing templates lack 3D visual item cards integrated with modular cart drawers or interactive calculation engines.
  - **Required template brief**: Commercial showcase template featuring a 3D viewport hero, a multi-column grid of interactive 3D item cards, a side-docked cart/summary drawer, and an embedded ROI/metrics calculator widget.

#### 1.2 Portfolio (`portfolio` — 3 gaps)
- **`Landing Page|Portfolio|0` · Filterable project gallery & case study portfolio** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t10158`, `t10169`, `t10184`, `t10066`)
  - **Why existing templates miss**: General-purpose portfolio landing page for visual creators, architects, and agencies requiring rich project showcases, filterable work galleries, modal project detail viewers, and interactive service estimator widgets.
  - **Required template brief**: Editorial visual portfolio layout featuring an impactful hero section, filterable project thumbnail grid with modal detail cards, skills/services breakdown, and an interactive budget or project scope estimator widget.
- **`Landing Page|Portfolio|1` · Interactive technical & developer portfolio** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t10163`, `t10159`, `t10070`, `t10151`)
  - **Why existing templates miss**: High-interactivity developer and technical creator portfolio page supporting live code previews, interactive sandbox widgets, command palette navigation, visual workflow pipelines, and a 3D hero showcase canvas.
  - **Required template brief**: Technical developer portfolio template featuring a full-width 3D hero canvas stage, interactive code console panel, integrated command palette bar, asset pipeline timeline, and interactive sandbox playground drawer.
- **`Landing Page|Portfolio|2` · Personal bio-link & media portal** (`sev 3`, `1` prompts, `missing_domain_widgets`, closest: `t10036`, `t10028`)
  - **Why existing templates miss**: Compact personal portal navigation and link-in-bio template featuring persistent media controls, profile header avatar, and structured link navigation cards.
  - **Required template brief**: Sleek personal bio-link landing page with centered profile card header, sticky audio player bar, and a responsive multi-column link navigation grid for services and social channels.

#### 1.3 General Website Landing Page (`general-website-landing-page` — 8 gaps)
- **`Landing Page|General Website Landing Page|2` · Interactive financial and B2B calculator page** (`sev 1`, `5` prompts, `missing_domain_widgets`, closest: `t10115`, `t10123`, `t10113`, `t10070`)
  - **Why existing templates miss**: Financial institutions, enterprise vendors, and commercial service providers require interactive loan/ROI calculation sliders, financial estimator widgets, and tier comparison matrices directly on the landing page.
  - **Required template brief**: Conversion-focused enterprise landing page featuring an interactive calculation slider widget, parameter control panel, feature comparison matrix grid, and lead capture form.
- **`Landing Page|General Website Landing Page|1` · Local service business and appointment funnel** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t10083`, `t10113`, `t10095`, `t10110`)
  - **Why existing templates miss**: Appointment-driven local services require integrated multi-step booking funnels, weekly schedule grids, and pricing tier cards that conventional marketing templates do not provide.
  - **Required template brief**: Service business landing page featuring a hero appointment booking widget, interactive weekly schedule grid, service pricing menu cards, multi-step booking modal, and customer reviews carousel.
- **`Landing Page|General Website Landing Page|3` · Filterable content catalog and portfolio portal** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t10083`, `t10123`, `t10151`, `t10095`)
  - **Why existing templates miss**: Visual-heavy businesses, travel operators, and media archives require search and category filter bars, asymmetrical image galleries, before-and-after comparison sliders, and detail callout cards.
  - **Required template brief**: Discovery landing page featuring a hero search and filter panel, asymmetrical portfolio gallery with an interactive before-and-after slider, filterable item grid, and detailed action cards.
- **`Landing Page|General Website Landing Page|6` · SaaS software product and application showcase** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t10070`, `t10113`, `t10123`, `t10115`)
  - **Why existing templates miss**: Software platforms and digital products require realistic app mockup frames, live device previews, preloader screen containers, and tiered pricing configurators.
  - **Required template brief**: High-conversion SaaS landing page template featuring an app showcase hero viewport with live device preview toggle, preloader container, tabbed feature selector, and tiered plan configurator grid.
- **`Landing Page|General Website Landing Page|7` · Minimalist display hero and bento landing page** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t1256`, `t3436`, `t10094`, `t10132`)
  - **Why existing templates miss**: Minimal splash pages, modern bento-style layouts, and event announcements require structured grid tiles, centered display display headlines, floating nav headers, and countdown badges.
  - **Required template brief**: Modular landing page template featuring a centered bento tile grid, countdown banner header, large statement display hero, floating navigation bar, and primary action buttons.
- **`Landing Page|General Website Landing Page|4` · Direct response page with interactive assessment quiz** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t10075`, `t10095`, `t10070`, `t10113`)
  - **Why existing templates miss**: Lead generation, personal evaluation, and targeted invitation campaigns require embedded self-assessment quiz widgets, dual-choice decision buttons, and value-stack offer cards.
  - **Required template brief**: Direct-response marketing template featuring a media hero stage, interactive multi-step self-assessment quiz widget, value-stack offer cards, dual-action decision buttons, and response overlay modals.
- **`Landing Page|General Website Landing Page|0` · 3D physical product and hardware showcase** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t10137`, `t10191`, `t10096`)
  - **Why existing templates miss**: High-impact physical product and hardware marketing landing pages require dynamic 3D WebGL viewports, interactive parameter control panels, and custom specification cards that standard static visual templates lack.
  - **Required template brief**: Hardware marketing landing page featuring a central 3D WebGL hero viewport stage, an interactive parameter and sizing configurator panel, hotspot feature callouts, and a technical specification table.
- **`Landing Page|General Website Landing Page|5` · Service storefront with integrated admin dashboard** (`sev 2`, `2` prompts, `missing_page_type`, closest: `t10094`, `t10115`, `t10226`, `t10125`)
  - **Why existing templates miss**: Full-service web apps require both a public customer-facing storefront landing page and a built-in administrative management dashboard with data tables for backend control.
  - **Required template brief**: Hybrid web application template featuring a public service storefront with slide-out cart drawer, appointment scheduler, and a toggleable admin management dashboard with catalog data tables.

#### 1.4 Marketing / Brand Sites (`marketing-brand-sites` — 2 gaps)
- **`Landing Page|Marketing / Brand Sites|0` · Interactive Showcase & Media Gallery Landing Page** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t10163`, `t10158`, `t10140`, `t10159`)
  - **Why existing templates miss**: Existing catalog templates lack a comprehensive visual showcase layout that combines filterable card grids, interactive preview modal stages, and feature inspection matrices for presenting projects, components, or products.
  - **Required template brief**: Modular showcase landing page featuring a hero header with value badges, category-filterable visual content grid, interactive modal viewer stage, and structured service/spec matrices.
- **`Landing Page|Marketing / Brand Sites|1` · Promotional Campaign & Feature Matrix Landing Page** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t10113`, `t10125`, `t3505`, `t10081`)
  - **Why existing templates miss**: Existing landing page templates lack conversion-focused promotional layouts that combine promotional banner modules, tier pricing cards, and comprehensive multi-row feature comparison matrix tables.
  - **Required template brief**: Conversion-focused marketing landing page template featuring a sticky navigation bar, promotional countdown banner, multi-tier pricing cards, categorized feature comparison matrix table, and contact inquiry form.

#### 1.5 Ecommerce (`ecommerce` — 5 gaps)
- **`Landing Page|Ecommerce|0` · Modular E-Commerce Storefront with Cart Drawer** (`sev 1`, `18` prompts, `missing_domain_widgets`, closest: `t10199`, `t10226`, `t10215`, `t10222`)
  - **Why existing templates miss**: Existing catalog templates lack multi-view e-commerce flows that combine filterable product grids, quick-view detail overlays, slide-out shopping cart drawers, and streamlined checkout views.
  - **Required template brief**: Fully responsive e-commerce storefront layout featuring a filterable product catalog grid, quick-view detail modal, slide-out shopping cart drawer, and integrated multi-step checkout workflow.
- **`Landing Page|Ecommerce|3` · Editorial Product Showcase and Brand Landing Page** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t10151`, `t10217`, `t10207`, `t10170`)
  - **Why existing templates miss**: Existing templates lack rich editorial brand storytelling layouts equipped with age verification overlays, interactive hover tooltips, product variant selectors, and feature breakdown widgets.
  - **Required template brief**: High-end editorial storefront landing page featuring hero product storytelling sections, interactive hover popover cards, variant selection modules, and age-gate modal overlays.
- **`Landing Page|Ecommerce|4` · Interactive Product Configurator and Custom Ordering Storefront** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t10226`, `t10190`, `t10037`, `t10199`)
  - **Why existing templates miss**: Existing storefront templates lack specialized customization tools like visual canvas builders, item customization modals, dynamic style switchers, and sticky media preview player bars.
  - **Required template brief**: Interactive commerce template featuring a visual product layout canvas, item customization pop-up modals, sticky media player bars, and dynamic live style switcher bars.
- **`Landing Page|Ecommerce|1` · E-Commerce Storefront with Integrated Admin Management Portal** (`sev 2`, `3` prompts, `missing_page_type`, closest: `t10199`, `t10194`, `t3410`, `t3434`)
  - **Why existing templates miss**: Existing storefront templates do not support dual-mode web applications that pair consumer-facing product catalog pages with administrative inventory and service management dashboards.
  - **Required template brief**: Dual-mode e-commerce web application template featuring a storefront view and a togglable admin management dashboard with inventory data tables, variant swatches, and booking controls.
- **`Landing Page|Ecommerce|2` · Multi-Seller Marketplace and Discovery Platform** (`sev 2`, `3` prompts, `missing_page_type`, closest: `t10199`, `t3446`, `t10219`, `t10192`)
  - **Why existing templates miss**: Catalog templates lack multi-tenant marketplace infrastructure such as seller storefront profile views, location-radius map containers, and listing publication workflows.
  - **Required template brief**: Multi-seller marketplace layout featuring a prominent 3D visual hero canvas slot, interactive location map container, vendor profile storefront views, and item publication modal interfaces.

### 2. Enterprise (`enterprise`)

#### 2.1 Data and Analytics Dashboard (`data-and-analytics-dashboard` — 4 gaps)
- **`Enterprise|Data and Analytics Dashboard|0` · 3D Spatial Telemetry and Digital Twin Dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3403`, `t3404`, `t3436`, `t3252`)
  - **Why existing templates miss**: Dark high-tech telemetry dashboard layout centered around a prominent interactive 3D viewport canvas, flanked by real-time instrument readouts, status cards, and node graph controls.
  - **Required template brief**: Dark telemetry dashboard layout featuring a central interactive 3D viewport canvas slot, floating instrument readout gauges, real-time KPI scorecards, and a collapsible node graph sidebar.
- **`Enterprise|Data and Analytics Dashboard|1` · Three-Pane Media and Asset Inspector Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3561`, `t3442`, `t3217`, `t3252`)
  - **Why existing templates miss**: Multi-column analytical workspace designed for detailed asset investigation, combining a filterable sidebar directory, a primary canvas display, and a detailed inspector panel.
  - **Required template brief**: Three-panel workspace template featuring a left search and filter panel, a large central interactive display canvas, and a right detail inspector panel with similarity score breakdowns and dynamic lists.
- **`Enterprise|Data and Analytics Dashboard|2` · High-Density Operations and Live Status Dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3403`, `t3401`, `t6515`)
  - **Why existing templates miss**: Real-time monitoring interface optimized for high-density status tracking, featuring hero status indicators, live data grids, and multi-column event boards.
  - **Required template brief**: High-density monitoring dashboard template featuring a prominent top hero status indicator banner, dynamic multi-column board, live event ticker, and modular status card grid.
- **`Enterprise|Data and Analytics Dashboard|3` · Multi-Tab Performance and Audit Analytics Dashboard** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t3097`, `t3441`, `t3450`, `t2109`)
  - **Why existing templates miss**: Enterprise performance auditing dashboard featuring executive summary scorecards, score gauges, operational tables, and resource utilization heatmaps.
  - **Required template brief**: Multi-tab analytics dashboard layout with top metric summary cards, circular performance score gauges, expandable data tables with status badges, and visual utilization heatmaps.

#### 2.2 Finance (`finance` — 4 gaps)
- **`Enterprise|Finance|0` · Financial trading terminal and analytics workstation** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t5591`, `t5786`, `t5645`, `t3458`)
  - **Why existing templates miss**: High-density trading and analytics platforms requiring live chart canvases, technical indicator toolbars, order book data docks, and signal filter controls. Standard dashboard templates lack specialized multi-dock layouts for real-time financial chart inspection.
  - **Required template brief**: High-density financial workstation template featuring a central interactive charting canvas, top toolbar with overlay toggles, order book side panel, filter control dock, and data matrix table.
- **`Enterprise|Finance|1` · Split-pane quote calculator and document generator** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t3461`, `t5598`, `t3450`, `t3427`)
  - **Why existing templates miss**: Interactive invoicing, estimation, and cost-calculation tools needing split-pane input panels, editable line-item tables, auto-calculation summaries, and printable document preview containers. Generic form or table templates lack integrated side-by-side calculation and live document preview workflows.
  - **Required template brief**: Split-pane application template with file upload/parameter input sidebar, interactive itemized pricing ledger, real-time formula summary cards, and printable document preview pane.
- **`Enterprise|Finance|2` · Mobile financial account and budget tracker** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t1252`, `t10038`, `t1353`, `t3439`)
  - **Why existing templates miss**: Compact personal and business finance interfaces designed specifically for mobile screens with bottom navigation docks, animated balance summaries, interactive savings cards, and detail drawers. Desktop dashboards do not adapt cleanly to mobile-first financial tracking UI patterns.
  - **Required template brief**: Mobile-first financial application template with a fixed bottom navigation dock, progress card summary carousel, animated balance indicator widgets, and expandable transaction drawers.
- **`Enterprise|Finance|3` · Retail POS and multi-view commerce portal** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t3432`, `t5585`, `t1353`, `t5579`)
  - **Why existing templates miss**: Multi-role commerce and financial transparency hubs requiring point-of-sale checkout terminals, public project or product catalog grids, transaction ledgers, and milestone tracking timelines. Existing enterprise templates lack integrated point-of-sale UI paired with public transparency viewports.
  - **Required template brief**: Multi-view enterprise portal template featuring a point-of-sale checkout interface, catalog grid viewport, detail inventory ledger table, and milestone progress timeline widget.

#### 2.3 Productivity Apps (`productivity-apps` — 11 gaps)
- **`Enterprise|Productivity Apps|4` · Interactive node canvas and layout builder** (`sev 1`, `6` prompts, `missing_domain_widgets`, closest: `t3978`, `t1353`, `t3410`, `t3426`)
  - **Why existing templates miss**: A visual canvas workspace for building node-based pipelines, approval workflows, and visual page layouts. Existing templates lack connected node diagram canvases paired with inspector side drawers and live layout previews.
  - **Required template brief**: Visual editor template featuring a main interactive node/layout canvas, drag-and-drop step toolbar, inspector side panel, and live preview stage.
- **`Enterprise|Productivity Apps|0` · Interactive focus timer and task suite** (`sev 1`, `5` prompts, `missing_domain_widgets`, closest: `t10029`, `t10028`, `t7127`, `t3431`)
  - **Why existing templates miss**: A productivity workspace built around a central circular countdown gauge and structured task management lists. Existing catalog templates lack high-prominence circular countdown gauges paired with modular task feeds.
  - **Required template brief**: Minimalist productivity web app featuring a central circular countdown gauge, segmented mode switcher for work and break intervals, playback controls, and an adjacent task management feed.
- **`Enterprise|Productivity Apps|5` · Enterprise operations and logistics dashboard** (`sev 1`, `5` prompts, `missing_domain_widgets`, closest: `t1353`, `t3414`, `t2109`, `t3450`)
  - **Why existing templates miss**: A high-density operational admin dashboard for tracking logistics, employee scheduling, resource dispatching, and field metrics. Existing templates lack integrated dispatch tracking widgets, multi-section entry forms, and real-time status mapping views.
  - **Required template brief**: Enterprise operations template featuring top KPI metric cards, filterable management data tables, multi-section data entry forms, and operational status mapping containers.
- **`Enterprise|Productivity Apps|6` · Media curation and presentation workspace** (`sev 1`, `5` prompts, `missing_domain_widgets`, closest: `t3230`, `t8123`, `t5776`, `t3978`)
  - **Why existing templates miss**: A content presentation hub combining thumbnail card grids, slide deck viewers, and structured content summary panels. Existing templates lack interactive slide viewports paired with searchable media item grids.
  - **Required template brief**: Interactive content curation template featuring a sticky search header, thumbnail card grid, slide presentation reader viewport, and slide-over inspector drawer.
- **`Enterprise|Productivity Apps|3` · Document authoring and publishing platform** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t3746`, `t1297`, `t3450`, `t3434`)
  - **Why existing templates miss**: A document management workspace focused on content editing, live previewing, automated export, and public archive searching. Existing templates lack side-by-side rich-text editing with live document preview panes and searchable publishing portals.
  - **Required template brief**: Document publishing web application featuring a rich-text content editor, split-pane live document previewer, metadata configuration panel, and public search portal.
- **`Enterprise|Productivity Apps|7` · 3D canvas visualizer and conversational AI interface** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t8012`, `t3416`, `t3217`, `t1537`)
  - **Why existing templates miss**: An interactive AI interface featuring a prominent 3D canvas stage alongside conversation streams. Existing templates lack dedicated hero 3D graphic viewport stages paired with dynamic prompt controls and chat feeds.
  - **Required template brief**: Interactive web application template featuring a central 3D hero canvas viewport stage for agent-generated 3D models or avatars, dynamic control floating drawer, and thread chat history sidebar.
- **`Enterprise|Productivity Apps|1` · Grid keypad utility calculator interface** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t3458`, `t3456`, `t5598`)
  - **Why existing templates miss**: A compact web tool interface structured around high-density display screens and interactive keypads. Existing templates lack dedicated multi-row keypad grid controls and digital expression displays.
  - **Required template brief**: Compact utility tool layout featuring a digital display screen for expressions and results, standard and expanded function keypad button grids, and a calculation history panel.
- **`Enterprise|Productivity Apps|8` · Visual inspection and analytical canvas dashboard** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t3404`, `t3978`, `t3401`)
  - **Why existing templates miss**: A specialized analytical workspace featuring image mark-up viewports, biometric rankings, and diagnostic inspector drawers. Existing dashboard templates lack interactive canvas viewports with image annotation tools and proximity ranking list feeds.
  - **Required template brief**: Analytical inspection template featuring an interactive visual canvas viewport with annotation tools, upload sidebar, diagnostic metric cards, and ranked proximity list drawer.
- **`Enterprise|Productivity Apps|9` · Split-screen enterprise authentication portal** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t10113`, `t3461`, `t5598`)
  - **Why existing templates miss**: An enterprise portal layout featuring side-by-side informational media panels and multi-flow authentication forms. Existing templates lack dedicated multi-step login and security verification flows paired with informational side branding panels.
  - **Required template brief**: Split-screen authentication portal layout featuring an informational visual media panel on one side and a multi-flow auth form container supporting sign-in, multi-factor verification, and recovery on the other.
- **`Enterprise|Productivity Apps|10` · Mobile daily task and activity tracker** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t10032`, `t1252`, `t10028`, `t10033`)
  - **Why existing templates miss**: A mobile-first productivity web app structured around hand-held task management, activity logging, and quick note capture. Existing desktop-focused templates lack mobile navigation bars with tag-linked note editors.
  - **Required template brief**: Mobile-first utility app template featuring top filter pill badges, activity progress cards, quick item input bar, note detail card drawer, and bottom navigation bar.
- **`Enterprise|Productivity Apps|2` · Desktop operating system environment simulator** (`sev 3`, `1` prompts, `missing_page_type`, closest: `t3230`, `t3217`)
  - **Why existing templates miss**: A full-screen web simulator replicating a desktop operating system layout with floating windows and taskbar navigation. Existing templates lack dynamic window container frames, taskbar system trays, and start menu overlays.
  - **Required template brief**: Desktop operating system workspace template featuring a desktop icon canvas grid, dynamic taskbar with system tray, start menu popup overlay, and draggable window container frames.

#### 2.4 Dev Tools (`dev-tools` — 4 gaps)
- **`Enterprise|Dev Tools|0` · Split-Pane File & Navigation Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3805`, `t3404`, `t3230`, `t8012`)
  - **Why existing templates miss**: Multi-pane desktop-style layouts combining a directory tree or category sidebar with a central workspace pane, split-diff viewers, and item detail tables.
  - **Required template brief**: Split-pane web app layout featuring a collapsible tree navigation sidebar, central workspace pane with split diff viewing support, and interactive directory detail tables.
- **`Enterprise|Dev Tools|1` · System Diagnostics & Operations Dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3404`, `t3407`, `t3578`, `t3438`)
  - **Why existing templates miss**: Operational control panel interfaces requiring an action audit hero bar, metric KPI cards, integration status matrices, and configuration panels.
  - **Required template brief**: Developer dashboard layout featuring a top search/audit input hero bar, status card grids, integration mapping tables, and parameter configuration panels.
- **`Enterprise|Dev Tools|2` · Interactive Visual Node & Canvas Workbench** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3252`, `t3217`, `t8012`, `t8016`)
  - **Why existing templates miss**: Interactive visual editor environments combining infinite node canvas stages, workflow execution progress rails, draggable card elements, and overlay controls.
  - **Required template brief**: Full-bleed visual workbench layout featuring an infinite pan-and-zoom node canvas stage, draggable card elements, workflow execution progress rails, and floating control overlays.
- **`Enterprise|Dev Tools|3` · Interactive Component & Spec Documentation Portal** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t3404`, `t3407`, `t10169`, `t3230`)
  - **Why existing templates miss**: Technical showcase and documentation portals requiring sticky side navigation, interactive preview cards with code drawers, and structured specification tables.
  - **Required template brief**: Documentation and showcase portal featuring sticky section navigation, interactive preview grid cards with expandable code drawers, and parameter specification tables.

### 3. Consumer Apps (`consumer-apps`)

#### 3.1 Social Site (`social-site` — 3 gaps)
- **`Consumer Apps|Social Site|1` · Conversational chat and messaging workspace** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t8016`, `t8012`, `t8019`, `t8013`)
  - **Why existing templates miss**: A full-screen messaging template providing welcome onboarding screens, thread streams, and model or configuration controls. Existing chat templates lack integrated welcome landing views and customizable top header toolbars for state management or settings.
  - **Required template brief**: Conversational chat layout with conversation sidebar, top configuration/toolbar header, central message thread with initial welcome overlay stage, and bottom prompt input console.
- **`Consumer Apps|Social Site|0` · Multi-column social feed and community dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t10016`, `t8019`, `t10017`, `t3401`)
  - **Why existing templates miss**: A three-column web application layout designed for social streams, microblogging, and community interaction. Existing templates lack structured multi-column layouts integrating persistent navigation, central post streams with composers, and right-hand activity sidebars.
  - **Required template brief**: Three-column social dashboard featuring a left navigation sidebar, central news/post feed with interactive composer and profile hero banner, and right-hand activity and media widget column.
- **`Consumer Apps|Social Site|2` · Mobile vertical feed and discovery app** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t10017`, `t10036`, `t10016`, `t8013`)
  - **Why existing templates miss**: A mobile-first portrait feed template designed for vertical content scrolling, swipeable card stages, and overlay interaction controls. Existing templates lack vertical gesture media stages with right-side floating action bars and slide-up detail drawers.
  - **Required template brief**: Mobile portrait application stage featuring full-height vertical media/card stack, floating right-side action sidebar, slide-up detail drawer sheet, and fixed bottom navigation bar.

#### 3.2 Education (`education` — 9 gaps)
- **`Consumer Apps|Education|6` · Scrollytelling Educational Article Guide** (`sev 1`, `6` prompts, `missing_page_type`, closest: `t10114`, `t3399`, `t10116`, `t10080`)
  - **Why existing templates miss**: Long-form narrative educational article layout missing scroll-synced visual stages, sticky timeline navigators, annotated text blocks, and inline check-in quizzes.
  - **Required template brief**: Narrative visual article layout featuring a sticky graphics visualizer stage, vertical timeline navigator, highlighted content callout cards, and inline mini-quiz widgets.
- **`Consumer Apps|Education|3` · Flashcard Practice and Study App** (`sev 1`, `5` prompts, `missing_domain_widgets`, closest: `t3399`, `t3395`, `t3978`, `t3416`)
  - **Why existing templates miss**: Dedicated study and memory drill layout missing interactive card flip mechanics, audio playback controls, fill-in-the-blank cards, and performance review tables.
  - **Required template brief**: Clean study tool layout featuring a central flippable card stage with audio player controls, self-assessment confidence ratings, fill-in-the-blank drill widgets, and a progress review drawer.
- **`Consumer Apps|Education|4` · Interactive Technical Simulation Workspace** (`sev 1`, `5` prompts, `missing_domain_widgets`, closest: `t3404`, `t3805`, `t8012`, `t3407`)
  - **Why existing templates miss**: Data-dense learning workspace template designed for interactive visual graphics, variable input toolbars, matrix grids, and live code testing consoles.
  - **Required template brief**: Technical simulation layout featuring split-pane exercise instructions, interactive graphic display canvas, variable control toolbar, and live inspection/output console.
- **`Consumer Apps|Education|5` · Academic Research Knowledge Hub** (`sev 1`, `5` prompts, `missing_domain_widgets`, closest: `t3746`, `t3404`, `t3978`, `t10119`)
  - **Why existing templates miss**: Data-dense portal layout for research papers, technical literature surveys, and reference guides, missing structured outline trees, mathematical proof cards, and benchmark data tables.
  - **Required template brief**: Structured knowledge portal layout featuring a table-of-contents navigation sidebar, structured paper reader stage, expandable formula callouts, and evaluation metric data tables.
- **`Consumer Apps|Education|8` · School Administration and Productivity Dashboard** (`sev 1`, `5` prompts, `missing_domain_widgets`, closest: `t3399`, `t3395`, `t3394`, `t3746`)
  - **Why existing templates miss**: Multi-role management and classroom utility platform combining timetables, attendance rosters, study timer widgets, and interactive canvas tools.
  - **Required template brief**: Multi-role educational dashboard layout featuring a role switcher navigation drawer, schedule timetable tracker, classroom task board, digital canvas workspace, and study timer card.
- **`Consumer Apps|Education|2` · Gamified Learning Path Progression Portal** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t3399`, `t10028`, `t3805`, `t3431`)
  - **Why existing templates miss**: Interactive learning app layout with a node-based roadmap progression map, exercise modal stages, and reward analytics widgets.
  - **Required template brief**: Gamified learning web application layout with a vertical node path roadmap, interactive exercise stage cards, streak tracking indicators, and user analytics drawer.
- **`Consumer Apps|Education|0` · Interactive 3D Educational Simulation Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3252`, `t3217`, `t3404`, `t1583`)
  - **Why existing templates miss**: Educational web app layout missing from catalog templates that provides a prominent 3D WebGL viewport canvas combined with interactive parameter controls and animation step controls.
  - **Required template brief**: 3D visual simulation web app layout centered around a large 3D canvas viewport, with a collapsible side hierarchy tree, parameter control sliders, and a bottom timeline animation scrubber.
- **`Consumer Apps|Education|1` · Interactive Slide Presentation Deck Player** (`sev 2`, `3` prompts, `missing_page_type`, closest: `t3746`, `t3252`, `t3397`, `t3911`)
  - **Why existing templates miss**: Presentation-focused layout designed for classroom and online instruction that standard web templates lack, combining slide stage navigation with step-by-step playback controls and notes drawers.
  - **Required template brief**: Interactive presentation deck layout featuring a main slide display canvas, a thumbnail navigation sidebar, step-by-step playback controls, and expandable speaker notes or formula panels.
- **`Consumer Apps|Education|7` · Online LMS and Course Portal** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3399`, `t3395`, `t8119`, `t3978`)
  - **Why existing templates miss**: Comprehensive course management and learning portal layout featuring structured lesson readers, multi-step interactive quizzes, leaderboard displays, and AI study assistant split drawers.
  - **Required template brief**: Learning management application layout featuring a course navigation sidebar, step-by-step quiz stage wizard, points leaderboard widget, and split AI tutor assistant workspace.

#### 3.3 Media Apps (`media-apps` — 5 gaps)
- **`Consumer Apps|Media Apps|1` · Media Streaming & Video Player Platform** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t3495`, `t3252`, `t3230`)
  - **Why existing templates miss**: A video consumption interface designed for browser and mobile platforms with live TV program schedules, channel selectors, and customizable video playback overlays.
  - **Required template brief**: Video streaming web application template featuring a hero video player viewport, category discovery grid, channel selector sidebar, and program schedule time guide.
- **`Consumer Apps|Media Apps|2` · AI Generation Studio & Playground Workspace** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t3217`, `t3252`, `t3230`, `t8012`)
  - **Why existing templates miss**: An AI creation workstation layout combining prompt construction bars, parameter accordions, waveform displays, and real-time generation controls.
  - **Required template brief**: AI creation studio template featuring an expandable prompt input bar, tag category selectors, model setup drawer, waveform audio visualizer, and persistent output action bar.
- **`Consumer Apps|Media Apps|0` · Video Production & Timeline Editing Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3252`, `t3230`, `t3217`)
  - **Why existing templates miss**: A comprehensive media editing layout with video rendering canvas, multi-track timeline, and contextual inspectors that standard catalog media components lack.
  - **Required template brief**: Video studio workspace template featuring a central video preview player, multi-track timeline scrubber, scene sequence breakdown editor, and property inspector sidebar.
- **`Consumer Apps|Media Apps|4` · Interactive Visual Utility & Control Workbench** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3458`, `t3217`, `t3252`, `t1537`)
  - **Why existing templates miss**: A precise utility tool layout with interactive visual canvases, real-time numerical readouts, parameter sliders, and calculator panels.
  - **Required template brief**: Visual utility app template featuring a central interactive canvas stage, top toolbar, numerical metric display bar, and collapsible parameter adjustment panel.
- **`Consumer Apps|Media Apps|3` · Interactive Audio Player & Music Library** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t3252`, `t3230`, `t3217`)
  - **Why existing templates miss**: An interactive desktop and web audio experience hub with library organization, live track queue, and central interactive visualizer stage.
  - **Required template brief**: Desktop audio player template featuring a central media stage with a hero 3D visualizer canvas slot, library navigation sidebar, searchable track queue, and persistent bottom playback bar.

#### 3.4 Health/Lifestyle (`health-lifestyle` — 6 gaps)
- **`Consumer Apps|Health/Lifestyle|0` · Mobile fitness and activity tracking app** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t1252`, `t3394`, `t10031`, `t10016`)
  - **Why existing templates miss**: Existing catalog dashboards lack mobile-native layouts optimized for active session logging, set/exercise tables, rest timers, and bottom navigation controls.
  - **Required template brief**: Mobile-first application template featuring a bottom navigation bar, summary metric cards, interactive set/rep log tables, timer banners, and progress analytics charts.
- **`Consumer Apps|Health/Lifestyle|1` · Habit tracking and routine schedule dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3502`, `t3395`, `t3431`, `t10033`)
  - **Why existing templates miss**: Standard productivity dashboards lack weekly routine schedule grids, habit heatmaps, and lightweight check-off task lists tailored for daily routine management.
  - **Required template brief**: Productivity dashboard template featuring an interactive schedule grid, habit check-off list items with progress bars, streak completion counters, and a visual heatmap chart.
- **`Consumer Apps|Health/Lifestyle|2` · Multi-card status and monitoring dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3397`, `t3428`, `t3436`, `t3404`)
  - **Why existing templates miss**: Existing analytics templates lack multi-card layout grids designed for dynamic status cards, environmental telemetry, and multi-step diagnostic scan workflows.
  - **Required template brief**: Status monitoring dashboard template featuring an interactive status card grid, step-by-step diagnostic workflow panel, live telemetry summary bars, and scan report cards.
- **`Consumer Apps|Health/Lifestyle|3` · Interactive node map and collection gallery** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t5582`, `t5776`, `t10140`, `t3230`)
  - **Why existing templates miss**: General templates lack combined visual progression node maps, unlockable grid tiles, item collection galleries, and detail reveal pop-up modals.
  - **Required template brief**: Interactive web app template featuring a progression node map and calendar grid, tile reveal modal overlays, filterable inventory collection cards, and achievement generators.
- **`Consumer Apps|Health/Lifestyle|5` · Real-time interactive workspace and event dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3434`, `t3413`, `t1566`, `t3398`)
  - **Why existing templates miss**: Existing web app templates lack central dynamic workspace stages combined with live auction leaderboards, history log tables, and split-screen control drawers.
  - **Required template brief**: Dynamic web app template featuring a primary interactive action workspace stage, split-screen map or control panel, live leaderboard table, and persistent history logs.
- **`Consumer Apps|Health/Lifestyle|4` · Categorized content and guide portal** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t10027`, `t3395`, `t3223`, `t3230`)
  - **Why existing templates miss**: Existing content dashboards lack structured step-by-step instructional views, category filters, and interactive detail visualizers within a unified editorial layout.
  - **Required template brief**: Editorial content portal template featuring category selection tabs, summary visualizer widgets, structured step-by-step instruction drawers, and detailed item checklist sidebars.

#### 3.5 Travel (`travel` — 3 gaps)
- **`Consumer Apps|Travel|0` · Interactive map and route timeline planner** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t3561`, `t3511`, `t3578`, `t10035`)
  - **Why existing templates miss**: Split-pane layout combining interactive map viewports with step-by-step route cards and drag-and-drop timeline editing. Existing catalog templates lack unified mapping viewports integrated with route sequence stages and itinerary scrubbers.
  - **Required template brief**: Split-pane web application template featuring a central 2D/3D interactive map viewport canvas, drag-and-drop route timeline editor, and collapsible itinerary detail cards.
- **`Consumer Apps|Travel|1` · Property and hospitality listing marketplace** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t10107`, `t10095`, `t5634`, `t1353`)
  - **Why existing templates miss**: Directory and showcase template featuring multi-filter toolbars, card grids for items or amenities, slide-over detail drawers, and multi-card content carousels. Catalog templates lack the combination of structured filter toolbars and pop-out inspection drawers for listing items.
  - **Required template brief**: Marketplace showcase web application template with a hero banner, filter toolbar, dynamic card grid for properties or menu items, and slide-over preview drawers.
- **`Consumer Apps|Travel|2` · Structured competency matrix and evaluation table** (`sev 3`, `1` prompts, `missing_domain_widgets`, closest: `t3701`, `t3405`)
  - **Why existing templates miss**: Operations and assessment page featuring summary metric cards and a multi-tiered comparison matrix table. Existing catalog templates lack multi-criteria structured evaluation matrix components.
  - **Required template brief**: Internal documentation layout featuring top summary KPI stat cards, category navigation tabs, and a multi-column comparison evaluation matrix table.

#### 3.6 Content and Publishing (`content-and-publishing` — 6 gaps)
- **`Consumer Apps|Content and Publishing|3` · Editorial News and Digital Magazine Publishing Platform** (`sev 1`, `5` prompts, `missing_domain_widgets`, closest: `t10116`, `t10080`, `t10142`, `t8117`)
  - **Why existing templates miss**: Digital publishing catalogs lack multi-channel news portals combining live ticker strips with article grids, long-form reading views, and back-office publishing tools. Standard blog layouts lack integrated breaking news tickers and content generator panels.
  - **Required template brief**: An editorial magazine layout featuring a breaking news ticker strip, hero story spotlight, multi-column article grid with category tabs, side-rail article reader page, and an integrated content editor workspace.
- **`Consumer Apps|Content and Publishing|2` · Technical Documentation and Reference Knowledge Base** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t3404`, `t3805`, `t3746`, `t3407`)
  - **Why existing templates miss**: Knowledge base and documentation catalogs lack interactive architecture canvas visualizers integrated with structured reference article trees. Existing documentation templates only support basic Markdown text without visual node inspector panels or infobox sidebars.
  - **Required template brief**: A technical reference workspace layout featuring a collapsible multi-level sidebar tree, central interactive node diagram or section reader canvas, floating node detail inspector panel, and structured key-value infobox widgets.
- **`Consumer Apps|Content and Publishing|5` · Structured Directory Search and Comparison Portal** (`sev 1`, `4` prompts, `missing_domain_widgets`, closest: `t10159`, `t3230`, `t1297`, `t8119`)
  - **Why existing templates miss**: Directory and discovery applications lack multifaceted search filtering bars combined with dynamic comparison grids and detailed entity modal overlays. Existing directory templates lack structured side-by-side comparison tables and asset submission workflows.
  - **Required template brief**: A multi-faceted directory template featuring a top search header bar, filter sidebar with tag controls, entity grid cards with bookmarking capabilities, a comparison overlay drawer, and structured detail modal overlays.
- **`Consumer Apps|Content and Publishing|1` · Scrollytelling Longread and Visual Data Report** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t10116`, `t10119`, `t10123`, `t10088`)
  - **Why existing templates miss**: Editorial publishing catalogs lack scroll-driven storytelling templates featuring sticky visual media stages synchronized with article reading modules. Standard article layouts lack pinned dynamic chart stages and interactive decision/reveal widgets.
  - **Required template brief**: An editorial scrollytelling page featuring a full-bleed header banner, a pinned interactive media and chart stage that updates on scroll, inline callout spec modules, and dynamic reader modal overlays.
- **`Consumer Apps|Content and Publishing|4` · Digital Library and Interactive Book Reader Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`, closest: `t10114`, `t10149`, `t3746`, `t10080`)
  - **Why existing templates miss**: Content reading platforms lack interactive dual-page document reader canvases with page-turning controls, custom annotation tools, and bookshelf management. Standard card grids lack full-screen immersive reading modes with page manipulation and editing toolbars.
  - **Required template brief**: A digital reader application template featuring a bookshelf card layout, dual-page interactive document canvas, page navigation controls, quick-annotation editing toolbar, and a collapsible table of contents sidebar.
- **`Consumer Apps|Content and Publishing|0` · Interactive Timeline and Milestone Historical Explorer** (`sev 2`, `2` prompts, `missing_domain_widgets`, closest: `t10114`, `t10116`, `t10140`, `t10123`)
  - **Why existing templates miss**: Content catalog platforms lack interactive chronological milestone timelines paired with event filter bars and detail card side panels. Existing templates provide standard card grids without temporal sequence controls or interactive milestone tracks.
  - **Required template brief**: A responsive chronological timeline layout featuring a top filtering bar, interactive vertical or horizontal timeline track, expandable event detail cards, and a quick-jump era navigation ribbon.
