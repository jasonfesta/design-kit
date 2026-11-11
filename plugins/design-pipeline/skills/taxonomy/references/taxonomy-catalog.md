# Taxonomy Catalog: `v1.1` Full WDA Silvers Prompt ↔ Template Match Taxonomy

This is the complete reference specification for the **3 active top-level categories** and **15 active subcategories** in the canonical WDA taxonomy, synchronized with the live **WDA Silvers · Prompt ↔ Template Match** dataset (`https://my-chirpy-chipmunk.corp.google.com/prompt_template_match`).

- **Total classified target prompts**: **557** (`109` curated `v6_report` prompts + `448` LLM-classified prompts out of `1,384` unique prompts across `1,530` battles)
- **Review-ready / golden template pool**: **257** accepted & golden templates across 10 collections and 9 template page types
- **Missing-template gap archetypes**: **77** gap archetypes across the 15 subcategories
- **Full WDA Silvers screenshot gallery**: **7,133** cards across 29 collections (`prod_scrape` + `exp_scrape`)

The machine-readable twin is [`assets/taxonomy.json`](../assets/taxonomy.json) (paired with [`assets/templates_and_gaps.json`](../assets/templates_and_gaps.json) and [`assets/prompts_index.json`](../assets/prompts_index.json)). For the complete 77 gap archetypes and auxiliary taxonomies, see [`prompt-template-match-catalog.md`](prompt-template-match-catalog.md).

## Summary Matrix

| # | Category | Subcategory | ID | Total | V6 Curated | LLM | Usable % | 3D | Gaps |
| :-- | :-- | :-- | :-- | --: | --: | --: | --: | --: | --: |
| 1 | **Landing Page** | | `landing-page` | **202** | 34 | 168 | **48.5%** | 35 | 22 |
| 1.1 | | Advanced 3D Website Landing Page | `advanced-3d-website-landing-page` | 21 | 3 | 18 | 38.1% | 20 | 4 |
| 1.2 | | Portfolio | `portfolio` | 19 | 2 | 17 | 36.8% | 3 | 3 |
| 1.3 | | General Website Landing Page | `general-website-landing-page` | 91 | 7 | 84 | 61.5% | 8 | 8 |
| 1.4 | | Marketing / Brand Sites | `marketing-brand-sites` | 24 | 13 | 11 | 66.7% | 2 | 2 |
| 1.5 | | Ecommerce | `ecommerce` | 47 | 9 | 38 | 23.4% | 2 | 5 |
| 2 | **Enterprise** | | `enterprise` | **154** | 28 | 126 | **50.6%** | 6 | 23 |
| 2.1 | | Data and Analytics Dashboard | `data-and-analytics-dashboard` | 36 | 12 | 24 | 69.4% | 3 | 4 |
| 2.2 | | Finance | `finance` | 24 | 3 | 21 | 50.0% | 0 | 4 |
| 2.3 | | Productivity Apps | `productivity-apps` | 63 | 7 | 56 | 38.1% | 2 | 11 |
| 2.4 | | Dev Tools | `dev-tools` | 31 | 6 | 25 | 54.8% | 1 | 4 |
| 3 | **Consumer Apps** | | `consumer-apps` | **201** | 47 | 154 | **42.3%** | 15 | 32 |
| 3.1 | | Social Site | `social-site` | 18 | 2 | 16 | 33.3% | 0 | 3 |
| 3.2 | | Education | `education` | 61 | 21 | 40 | 36.1% | 6 | 9 |
| 3.3 | | Media Apps | `media-apps` | 42 | 11 | 31 | 54.8% | 5 | 5 |
| 3.4 | | Health/Lifestyle | `health-lifestyle` | 30 | 4 | 26 | 40.0% | 2 | 6 |
| 3.5 | | Travel | `travel` | 11 | 2 | 9 | 45.5% | 2 | 3 |
| 3.6 | | Content and Publishing | `content-and-publishing` | 39 | 7 | 32 | 43.6% | 0 | 6 |

---

## 1. Landing Page (`landing-page`, 202 prompts · 48.5% usable · 22 gaps)

**Definition.** Public-facing marketing, brand, portfolio, storefront, or showcase websites whose primary job is to present and persuade: a visitor arrives, scrolls a narrative of sections, and converts (buy, sign up, contact, explore).

**Category coverage.** `202` target prompts (`34` V6 curated + `168` LLM) across `210` battles · `0` perfect + `98` adaptable (`48.5%` usable) · `88` no match · `16` not templatable · `35` require 3D (`n3d=true`).

### 1.1 Advanced 3D Website Landing Page (`advanced-3d-website-landing-page`, 21 prompts)

- **Definition.** A marketing or showcase website where real-time 3D (WebGL, Three.js, R3F, shaders, scroll-driven camera moves) is the primary content and structure of the page, not a decorative accent.
- **Disambiguation / boundary.** If the 3D scene were removed and the page would collapse, classify here. If the 3D is a hero accent on an otherwise standard section stack, classify as the underlying landing-page subcategory. Playable games and standalone 3D scenes are outside the v1 taxonomy (future candidate slots).
- **Coverage & match stats.** `21` prompts (`3` V6 + `18` LLM, `21` battles) · `8` usable (`0` strong, `8` adaptable = `38.1%`) · `13` no match · `0` not templatable · `20` need 3D (``hero_centerpiece` (6), `scroll_scene` (4), `section_feature` (3), `product_viewer` (3), `whole_page_scene` (3), `background_ambient` (1)`).
- **Dominant surfaces (`surf`).** `marketing_site` (18), `3d_scene` (3)
- **Dominant page types (`br.page_type`).** marketing landing page (10), 3D showcase landing page (1), luxury marketing landing page & investment web app (1), interactive 3D showcase landing page (1)
- **Representative domains (`dom`).** interactive 3D portfolio (2), beverage / 3D product showcase (1), real estate investment (1), surreal visual art / digital experience (1), human biology and nutrition (1), automotive / luxury supercars (1)
- **Characteristic widgets (`w`).** `Brand titles and descriptions`, `3D glass bottle model`, `condensation/frost texture effect`, `animated bubbles visualizer`, `lighting and reflection setup`, `camera orbit controls`, `Cinematic Hero with 3D Preloader`, `Interactive 3D Architectural Showcase`
- **Most-used templates.** `t10070` Dark tech SaaS landing page with UI mockups (LA Landing, 2x), `t10151` Luxury dark showcase landing page (LA Landing, 2x), `t3420` Isometric 3D smart home energy dashboard (Dashboard Apps, 1x), `t10123` High-contrast scientific research landing page (LA Landing, 1x)
- **Missing-template gap archetypes (4):**
  - **`Landing Page|Advanced 3D Website Landing Page|0` — Full-bleed 3D product configurator landing page** (`sev 1`, `4` prompts, `missing_domain_widgets`): Full-bleed 3D hero canvas template featuring camera angle preset toggles, a side-docked color and material swatches customizer, floating detail HUD callouts, and explode/view control toggles.
  - **`Landing Page|Advanced 3D Website Landing Page|1` — 3D interactive canvas and HUD landing page** (`sev 1`, `4` prompts, `missing_domain_widgets`): Full-screen WebGL canvas template featuring a floating telemetry HUD header, interactive 3D viewport markers, auto-hiding overlay navigation, and a slide-out showcase drawer for detailed project node views.
  - **`Landing Page|Advanced 3D Website Landing Page|2` — 3D scroll-driven storytelling landing page** (`sev 2`, `3` prompts, `missing_domain_widgets`): Interactive storytelling template with a full-height central 3D stage, scroll-triggered narrative section cards, a floating material control drawer, and interactive card expansion modals.
  - **`Landing Page|Advanced 3D Website Landing Page|3` — 3D visual catalog and marketplace landing page** (`sev 2`, `2` prompts, `missing_domain_widgets`): Commercial showcase template featuring a 3D viewport hero, a multi-column grid of interactive 3D item cards, a side-docked cart/summary drawer, and an embedded ROI/metrics calculator widget.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=61c2686bcd50]` **3D Coca-Cola Glass Bottle Showcase** (`3d_scene` · `no_match` · 🧊 `hero_centerpiece`): An extremely detailed, realistic 3D showcase of a frosted Coca-Cola glass bottle with condensation and animated internal bubbles.
  - `[id=b835195a0d03]` **Immersive PropTech Real Estate Investment Platform** (`marketing_site` · `no_match` · 🧊 `section_feature`): A cinematic, 3D-driven luxury real estate investment platform featuring WebGL/Three.js interactions, a property marketplace, ROI calculator, and investor dashboard.
  - `[id=b7a61d160a1c]` **Surreal 3D Liquid Chrome Landing Page** (`marketing_site` · `no_match` · 🧊 `hero_centerpiece`): A highly visual, surreal website featuring liquid chrome, translucent glass, iridescent materials, morphing 3D sculptures, fluid physics interactions, and cinematic lighting.
  - `[id=2dc909452484]` **Interactive 3D Human Biochemistry & Biology Experience** (`marketing_site` · `no_match` · 🧊 `scroll_scene`): A conceptual 3D interactive scrolling site titled 'Body in Process' explaining how nutrition, biochemistry, and daily habits continuously transform the human body using WebGL, Three.js, and Swiss design typography.

### 1.2 Portfolio (`portfolio`, 19 prompts)

- **Definition.** A personal or small-studio site whose primary content is a body of work (case studies, projects, photography, writing) presented to attract clients or employers.
- **Disambiguation / boundary.** Individual or studio identity plus a work grid or case-study list wins over Marketing / Brand Sites. If the site sells products rather than showing work, classify as Ecommerce.
- **Coverage & match stats.** `19` prompts (`2` V6 + `17` LLM, `20` battles) · `7` usable (`0` strong, `7` adaptable = `36.8%`) · `9` no match · `3` not templatable · `3` need 3D (``hero_centerpiece` (2), `whole_page_scene` (1)`).
- **Dominant surfaces (`surf`).** `marketing_site` (18), `web_app` (1)
- **Dominant page types (`br.page_type`).** marketing landing page (5), portfolio landing page (1), personal link-in-bio navigation page (1), agency portfolio & marketing website (1)
- **Representative domains (`dom`).** developer portfolio (3), personal portfolio (2), personal navigation (1), web design agency (1), Roblox game developer portfolio (1), photography portfolio (1)
- **Characteristic widgets (`w`).** `hero section`, `contact form`, `footer`, `Hero Section`, `about me`, `projects showcase`, `skills & technologies`, `Profile Header with Circular Avatar`
- **Most-used templates.** `t10163` Bold dark mode design consultancy portfolio (LA Portfolio, 2x), `t10070` Dark tech SaaS landing page with UI mockups (LA Landing, 2x), `t10066` Minimalist art gallery editorial landing page (LA Landing, 1x), `t10178` Nordic editorial agency portfolio with dark grid section (LA Portfolio, 1x)
- **Missing-template gap archetypes (3):**
  - **`Landing Page|Portfolio|0` — Filterable project gallery & case study portfolio** (`sev 1`, `4` prompts, `missing_domain_widgets`): Editorial visual portfolio layout featuring an impactful hero section, filterable project thumbnail grid with modal detail cards, skills/services breakdown, and an interactive budget or project scope estimator widget.
  - **`Landing Page|Portfolio|1` — Interactive technical & developer portfolio** (`sev 1`, `4` prompts, `missing_domain_widgets`): Technical developer portfolio template featuring a full-width 3D hero canvas stage, interactive code console panel, integrated command palette bar, asset pipeline timeline, and interactive sandbox playground drawer.
  - **`Landing Page|Portfolio|2` — Personal bio-link & media portal** (`sev 3`, `1` prompts, `missing_domain_widgets`): Sleek personal bio-link landing page with centered profile card header, sticky audio player bar, and a responsive multi-column link navigation grid for services and social channels.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=c8f5d49cdf45]` **Personal Portfolio Website for WebKiya** (`marketing_site` · `no_match`): Build a personal portfolio website based on the provided GitHub repository link.
  - `[id=894064242088]` **Personal Navigation Bio-Link Page with Music Player** (`marketing_site` · `no_match`): A personal portal navigation page featuring a circular avatar, background image, top-right audio player capsule, and an 8-card link grid for services and tutorials.
  - `[id=e850c758a74b]` **Premium Web Design Agency Website Redesign** (`marketing_site` · `no_match`): Redesign a web development studio/agency website into a high-end, award-winning style in light mode, featuring smooth animations, detailed service breakdowns, portfolio showcases, and multiple pages/sections.
  - `[id=5c0ec8c727c2]` **Interactive Developer Portfolio with Easter Eggs and Mini-Apps** (`web_app` · `no_match`): A dark-themed, coding-focused interactive portfolio website featuring project mini-widgets (chess engine, Collatz calculator, terminal) and a hidden achievement system with easter eggs.

### 1.3 General Website Landing Page (`general-website-landing-page`, 91 prompts)

- **Definition.** A conventional informational or conversion landing page (hero, features, testimonials, pricing or FAQ, CTA, footer) for a product, service, tool, event, or organization that is not primarily a brand-storytelling site, store, or portfolio.
- **Disambiguation / boundary.** Default bucket for a landing page. Use it when the page is primarily informational or conversion-driven with a standard section stack and no strong brand-campaign, storefront, portfolio, or 3D emphasis.
- **Coverage & match stats.** `91` prompts (`7` V6 + `84` LLM, `95` battles) · `56` usable (`0` strong, `56` adaptable = `61.5%`) · `28` no match · `7` not templatable · `8` need 3D (``hero_centerpiece` (8)`).
- **Dominant surfaces (`surf`).** `marketing_site` (88), `web_app` (3)
- **Dominant page types (`br.page_type`).** marketing landing page (80), mobile web invitation microsite (1), bilingual legal practice website and administrative management dashboard (1), marketing landing page & platform prototype (1)
- **Representative domains (`dom`).** general landing page (2), general (2), general website (2), romantic invitation (1), luxury home building and remodeling (1), law firm (1)
- **Characteristic widgets (`w`).** `Footer`, `Testimonials`, `Sticky Navbar`, `Hero Section`, `FAQ Accordion`, `footer`, `hero section`, `Product Showcase`
- **Most-used templates.** `t10070` Dark tech SaaS landing page with UI mockups (LA Landing, 31x), `t10115` Swiss-style modern B2B consultancy landing page (LA Landing, 5x), `t10123` High-contrast scientific research landing page (LA Landing, 5x), `t10113` Editorial serif SaaS landing page with pricing (LA Landing, 4x)
- **Missing-template gap archetypes (8):**
  - **`Landing Page|General Website Landing Page|2` — Interactive financial and B2B calculator page** (`sev 1`, `5` prompts, `missing_domain_widgets`): Conversion-focused enterprise landing page featuring an interactive calculation slider widget, parameter control panel, feature comparison matrix grid, and lead capture form.
  - **`Landing Page|General Website Landing Page|1` — Local service business and appointment funnel** (`sev 1`, `4` prompts, `missing_domain_widgets`): Service business landing page featuring a hero appointment booking widget, interactive weekly schedule grid, service pricing menu cards, multi-step booking modal, and customer reviews carousel.
  - **`Landing Page|General Website Landing Page|3` — Filterable content catalog and portfolio portal** (`sev 1`, `4` prompts, `missing_domain_widgets`): Discovery landing page featuring a hero search and filter panel, asymmetrical portfolio gallery with an interactive before-and-after slider, filterable item grid, and detailed action cards.
  - **`Landing Page|General Website Landing Page|6` — SaaS software product and application showcase** (`sev 1`, `4` prompts, `missing_domain_widgets`): High-conversion SaaS landing page template featuring an app showcase hero viewport with live device preview toggle, preloader container, tabbed feature selector, and tiered plan configurator grid.
  - **`Landing Page|General Website Landing Page|7` — Minimalist display hero and bento landing page** (`sev 1`, `4` prompts, `missing_domain_widgets`): Modular landing page template featuring a centered bento tile grid, countdown banner header, large statement display hero, floating navigation bar, and primary action buttons.
  - **`Landing Page|General Website Landing Page|4` — Direct response page with interactive assessment quiz** (`sev 2`, `3` prompts, `missing_domain_widgets`): Direct-response marketing template featuring a media hero stage, interactive multi-step self-assessment quiz widget, value-stack offer cards, dual-action decision buttons, and response overlay modals.
  - **`Landing Page|General Website Landing Page|0` — 3D physical product and hardware showcase** (`sev 2`, `2` prompts, `missing_domain_widgets`): Hardware marketing landing page featuring a central 3D WebGL hero viewport stage, an interactive parameter and sizing configurator panel, hotspot feature callouts, and a technical specification table.
  - **`Landing Page|General Website Landing Page|5` — Service storefront with integrated admin dashboard** (`sev 2`, `2` prompts, `missing_page_type`): Hybrid web application template featuring a public service storefront with slide-out cart drawer, appointment scheduler, and a toggleable admin management dashboard with catalog data tables.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=3d05df84d6b3]` **Romantic Mobile Date Invitation Website** (`marketing_site` · `no_match`): A cute pastel pink mobile date invitation microsite written in Mongolian featuring floating heart animations, a teddy bear illustration, and interactive Yes/No response buttons.
  - `[id=b483e4438cb7]` **High-End Custom Home Builders Landing Page** (`marketing_site` · `no_match`): A premium, minimal, and creative landing page for a luxury custom home building and remodeling company featuring editorial asymmetrical layouts, subtle animations, photo/video showcases, and high-conversion CTAs.
  - `[id=13170f222812]` **Law Firm Website and Admin Dashboard** (`web_app` · `no_match`): A bilingual (French/English) premium website for a French law firm featuring practice areas, blog, appointment booking with WhatsApp redirection, and an administrative management dashboard.
  - `[id=8b92e22d6187]` **PAVIRYAJOLIN Smartphone Technology Platform Website** (`marketing_site` · `no_match`): A multi-page front-end prototype for a smartphone firmware, repair tools, and technical resources platform featuring custom brand animations, local search/filtering, and dark/light themes.

### 1.4 Marketing / Brand Sites (`marketing-brand-sites`, 24 prompts)

- **Definition.** Brand-forward, campaign-driven, or editorial marketing websites where art direction, storytelling, motion, and identity carry the page (agency sites, fashion or lifestyle brands, product campaign microsites, multi-page brand presences).
- **Disambiguation / boundary.** Brand expression and story first, conversion second. If the page is a conventional features-pricing-CTA stack, choose General Website Landing Page. If the primary action is buying products, choose Ecommerce. If a single person's work dominates, choose Portfolio.
- **Coverage & match stats.** `24` prompts (`13` V6 + `11` LLM, `27` battles) · `16` usable (`0` strong, `16` adaptable = `66.7%`) · `6` no match · `2` not templatable · `2` need 3D (``scroll_scene` (1), `hero_centerpiece` (1)`).
- **Dominant surfaces (`surf`).** `marketing_site` (21), `web_app` (2), `animation` (1)
- **Dominant page types (`br.page_type`).** marketing landing page (14), agency marketing landing page (1), enterprise product pricing and tier comparison page (1), e-commerce marketing landing page (1)
- **Representative domains (`dom`).** digital agency (1), e-learning / education sales campaign (1), UI/UX design showcase (1), enterprise cloud software (1), jewellery / fashion retail (1), football club (1)
- **Characteristic widgets (`w`).** `Footer`, `Sticky Navbar`, `Product Showcase`, `Testimonials`, `Hero Section`, `Social Proof`, `sticky navbar`, `FAQ`
- **Most-used templates.** `t10151` Luxury dark showcase landing page (LA Landing, 3x), `t10070` Dark tech SaaS landing page with UI mockups (LA Landing, 3x), `t10081` Vibrant typographic orchestra landing page (LA Landing, 2x), `t10125` Vibrant expressive food brand landing page (LA Landing, 2x)
- **Missing-template gap archetypes (2):**
  - **`Landing Page|Marketing / Brand Sites|0` — Interactive Showcase & Media Gallery Landing Page** (`sev 2`, `3` prompts, `missing_domain_widgets`): Modular showcase landing page featuring a hero header with value badges, category-filterable visual content grid, interactive modal viewer stage, and structured service/spec matrices.
  - **`Landing Page|Marketing / Brand Sites|1` — Promotional Campaign & Feature Matrix Landing Page** (`sev 2`, `3` prompts, `missing_domain_widgets`): Conversion-focused marketing landing page template featuring a sticky navigation bar, promotional countdown banner, multi-tier pricing cards, categorized feature comparison matrix table, and contact inquiry form.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=129af6a36385]` **Award-winning redesign for Epifyt agency homepage** (`marketing_site` · `no_match`): Redesign the Epifyt agency homepage into an immersive, award-winning website while retaining its original logo, color palette, and content.
  - `[id=bbc43a1731da]` **Campaign Sales Page for Eduzuma** (`marketing_site` · `no_match`): The user wants a plan and layout ideas to create a promotional campaign sales page for Eduzuma, an educational platform.
  - `[id=fb9be2cc7f13]` **Showcase of 20 Stunning Interactive UI/UX Animations** (`animation` · `no_match`): A gallery featuring 20 unique, stunning, and dynamic interactive UI/UX component designs.
  - `[id=942210cf7e85]` **Nutanix Cloud Manager Tier and Pricing Comparison Page** (`marketing_site` · `no_match`): An interactive product tier pricing and feature comparison page for Nutanix Cloud Manager (NCM) Starter, Pro, and Ultimate editions, including feature matrices, SKU specs, and cloud support details.

### 1.5 Ecommerce (`ecommerce`, 47 prompts)

- **Definition.** Online stores and shopping surfaces: product listing grids, product detail pages, carts, checkout flows, collections, and marketplace storefronts.
- **Disambiguation / boundary.** Any surface where the primary user goal is browsing and purchasing products. A brand site with a single 'buy now' CTA stays Marketing / Brand Sites; a catalog with cart and checkout is Ecommerce.
- **Coverage & match stats.** `47` prompts (`9` V6 + `38` LLM, `47` battles) · `11` usable (`0` strong, `11` adaptable = `23.4%`) · `32` no match · `4` not templatable · `2` need 3D (``hero_centerpiece` (1), `section_feature` (1)`).
- **Dominant surfaces (`surf`).** `marketing_site` (23), `web_app` (22), `mobile_app` (2)
- **Dominant page types (`br.page_type`).** e-commerce storefront (27), marketing landing page (6), luxury e-commerce landing page (1), e-commerce storefront & online ordering application (1)
- **Representative domains (`dom`).** e-commerce / retail (3), restaurant (2), e-commerce (2), e-commerce retail (2), eco cosmetics e-commerce (1), luxury fragrance / perfume (1)
- **Characteristic widgets (`w`).** `Product grid with filters and sorting`, `Slide-out cart drawer`, `Checkout flow`, `Hero Section`, `Footer`, `Hero section`, `Featured collections`, `Sticky Navbar`
- **Most-used templates.** `t10016` Mobile social feed with stories carousel (Android V0 (Screenshot Only), 1x), `t10226` Warm retro-editorial coffee roaster storefront (LA Store, 1x), `t10194` Playful DTC brand storefront with pill navigation and high-fashion imagery (LA Store, 1x), `t10210` Warm Japanese artisanal food store & story landing page (LA Store, 1x)
- **Missing-template gap archetypes (5):**
  - **`Landing Page|Ecommerce|0` — Modular E-Commerce Storefront with Cart Drawer** (`sev 1`, `18` prompts, `missing_domain_widgets`): Fully responsive e-commerce storefront layout featuring a filterable product catalog grid, quick-view detail modal, slide-out shopping cart drawer, and integrated multi-step checkout workflow.
  - **`Landing Page|Ecommerce|3` — Editorial Product Showcase and Brand Landing Page** (`sev 1`, `4` prompts, `missing_domain_widgets`): High-end editorial storefront landing page featuring hero product storytelling sections, interactive hover popover cards, variant selection modules, and age-gate modal overlays.
  - **`Landing Page|Ecommerce|4` — Interactive Product Configurator and Custom Ordering Storefront** (`sev 1`, `4` prompts, `missing_domain_widgets`): Interactive commerce template featuring a visual product layout canvas, item customization pop-up modals, sticky media player bars, and dynamic live style switcher bars.
  - **`Landing Page|Ecommerce|1` — E-Commerce Storefront with Integrated Admin Management Portal** (`sev 2`, `3` prompts, `missing_page_type`): Dual-mode e-commerce web application template featuring a storefront view and a togglable admin management dashboard with inventory data tables, variant swatches, and booking controls.
  - **`Landing Page|Ecommerce|2` — Multi-Seller Marketplace and Discovery Platform** (`sev 2`, `3` prompts, `missing_page_type`): Multi-seller marketplace layout featuring a prominent 3D visual hero canvas slot, interactive location map container, vendor profile storefront views, and item publication modal interfaces.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=fc726bc84236]` **Eco-Cosmetics Online Store** (`marketing_site` · `no_match`): Detailed technical specification for a multi-page eco-friendly cosmetics e-commerce store including catalog filters, product pages, skincare quiz, cart, checkout, user accounts, and brand storytelling.
  - `[id=35ebb81633c5]` **Luxury Niche Perfume Landing Page for Alami** (`marketing_site` · `no_match`): A premium, opulent landing page for a luxury perfume brand featuring fragrance notes, paper grain textures, rich brand story, interactive product showcase, and refined aesthetics inspired by luxury houses like Creed and Parfums de Marly.
  - `[id=de341e14f934]` **Restaurant One-Page Website in 5 Styles** (`marketing_site` · `no_match`): Create a single-page restaurant website showcasing menu, location, opening hours, and general info across five distinct design styles.
  - `[id=b67cc1b78838]` **Destak E-commerce Storefront** (`web_app` · `no_match`): A complete e-commerce website featuring home collections, product filtering/sorting, product detail views with galleries and reviews, a slide-out cart, and a checkout flow.

## 2. Enterprise (`enterprise`, 154 prompts · 50.6% usable · 23 gaps)

**Definition.** Logged-in business software used to operate, analyze, build, or manage work: dashboards, finance tooling, productivity apps, and developer tooling. Dense data, sidebars, tables, forms, and multi-pane layouts.

**Category coverage.** `154` target prompts (`28` V6 curated + `126` LLM) across `167` battles · `0` perfect + `78` adaptable (`50.6%` usable) · `71` no match · `5` not templatable · `6` require 3D (`n3d=true`).

### 2.1 Data and Analytics Dashboard (`data-and-analytics-dashboard`, 36 prompts)

- **Definition.** Interfaces whose primary purpose is monitoring and exploring data: KPI cards, charts, time series, filters, drill-down tables, reporting, observability, and business intelligence views.
- **Disambiguation / boundary.** If the user is primarily reading and exploring numbers, choose this. If the user is primarily doing tasks (planning, writing, scheduling), choose Productivity Apps. If the data is money being moved, billed, or invested, choose Finance. If the data is CI, logs, or API traffic for developers, choose Dev Tools.
- **Coverage & match stats.** `36` prompts (`12` V6 + `24` LLM, `43` battles) · `25` usable (`0` strong, `25` adaptable = `69.4%`) · `11` no match · `0` not templatable · `3` need 3D (``section_feature` (1), `product_viewer` (1), `hero_centerpiece` (1)`).
- **Dominant surfaces (`surf`).** `dashboard` (31), `web_app` (5)
- **Dominant page types (`br.page_type`).** analytics dashboard (29), web tool/editor (2), executive analytics dashboard (1), scientific web tool / biometric evaluation dashboard (1)
- **Representative domains (`dom`).** startup ecosystem and recruitment intelligence (1), enterprise platform monitoring & IT telemetry (1), computer vision / facial biometrics (1), personal digital privacy and security management (1), AI hardware telemetry and digital twin (1), drone tracking and telemetry (1)
- **Characteristic widgets (`w`).** `KPI summary cards with trend indicators`, `Dark mode toggle`, `Sortable and filterable data table`, `Date-range and segment filter controls`, `Analytics Charts`, `Interactive line, bar, and donut charts`, `Interactive Map (MapLibre GL)`, `Startup Search & Filter Panel`
- **Most-used templates.** `t3450` Clean light CRM and sales analytics dashboard (Dashboard Apps, 5x), `t3413` Clean light-mode SaaS analytics dashboard with rounded cards (Dashboard Apps, 5x), `t3403` Technical server monitoring telemetry dashboard (Dashboard Apps, 3x), `t8012` AI coding agent workspace with three-panel layout (Chatbot & Messaging, 2x)
- **Missing-template gap archetypes (4):**
  - **`Enterprise|Data and Analytics Dashboard|0` — 3D Spatial Telemetry and Digital Twin Dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`): Dark telemetry dashboard layout featuring a central interactive 3D viewport canvas slot, floating instrument readout gauges, real-time KPI scorecards, and a collapsible node graph sidebar.
  - **`Enterprise|Data and Analytics Dashboard|1` — Three-Pane Media and Asset Inspector Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`): Three-panel workspace template featuring a left search and filter panel, a large central interactive display canvas, and a right detail inspector panel with similarity score breakdowns and dynamic lists.
  - **`Enterprise|Data and Analytics Dashboard|2` — High-Density Operations and Live Status Dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`): High-density monitoring dashboard template featuring a prominent top hero status indicator banner, dynamic multi-column board, live event ticker, and modular status card grid.
  - **`Enterprise|Data and Analytics Dashboard|3` — Multi-Tab Performance and Audit Analytics Dashboard** (`sev 2`, `2` prompts, `missing_domain_widgets`): Multi-tab analytics dashboard layout with top metric summary cards, circular performance score gauges, expandable data tables with status badges, and visual utilization heatmaps.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=a864451b27d3]` **Kovai Startup Atlas - Discovery and Hiring Intelligence Platform** (`dashboard` · `no_match`): A real-time geospatial discovery platform and hiring intelligence dashboard for startups in Coimbatore, featuring interactive MapLibre maps, dynamic metrics, searchable directories, and job listings.
  - `[id=edd6d26fb45d]` **Stunning Horizon UI Executive CEO Telemetry Dashboard** (`dashboard` · `no_match` · 🧊 `section_feature`): Build a board-ready CEO executive dashboard UI following a Horizon UI JSON schema, featuring an interactive global estate globe map, active alarms, platform KPIs, and scorecards.
  - `[id=10a3e7a5d0c0]` **Scientific Facial Resemblance Biometric Evaluation Tool** (`web_app` · `no_match`): An interactive computer-vision analysis tool for 1:N photographic facial resemblance comparison, featuring quality assessment checks, landmark geometric visualization, embedding cosine similarity computation, and calibrated candidate ranking.
  - `[id=98e0d0ea9c5c]` **OwnTrace Adaptive Privacy and Security Workspace** (`dashboard` · `no_match`): An adaptive digital footprint and privacy management platform featuring a context-aware UI that dynamically updates based on user intent, security breaches, and connected account data.

### 2.2 Finance (`finance`, 24 prompts)

- **Definition.** Financial operations and fintech interfaces: banking, payments, invoicing, expense management, accounting, treasury, trading, portfolio and wealth management, budgeting tools.
- **Disambiguation / boundary.** Money as the domain wins over visual treatment: a transactions table with charts is Finance, not Data and Analytics Dashboard. A personal budgeting app is Finance in v1 (the Enterprise category houses the finance domain regardless of B2B or consumer audience).
- **Coverage & match stats.** `24` prompts (`3` V6 + `21` LLM, `25` battles) · `12` usable (`0` strong, `12` adaptable = `50.0%`) · `12` no match · `0` not templatable · `0` need 3D (`none`).
- **Dominant surfaces (`surf`).** `web_app` (17), `dashboard` (6), `mobile_app` (1)
- **Dominant page types (`br.page_type`).** web tool/editor (8), analytics dashboard (7), mobile app screen (2), finance web app workspace (1)
- **Representative domains (`dom`).** crypto trading (3), personal finance and budgeting (2), financial trading (2), small business finance & profit sharing (1), woodworking / CNC invoicing (1), trading & financial markets (1)
- **Characteristic widgets (`w`).** `Home dashboard with savings goal progress`, `Quick transaction input with custom numpad`, `Accounts & total balance summary`, `Budget progress tracker & alerts`, `Expense breakdown analytics & category charts`, `Multi-profile switcher`, `Dashboard overview cards & settlement history table`, `New settlement modal & revenue input`
- **Most-used templates.** `t5591` Dark mode financial trading terminal and signals dashboard (Finance Apps, 5x), `t3415` Modern rounded financial dashboard with green accents (Dashboard Apps, 1x), `t1308` Dark sidebar admin dashboard with metric charts and merchant table (Dashboard Apps, 1x), `t6515` Dark high-density financial trading terminal (Finance Apps, 1x)
- **Missing-template gap archetypes (4):**
  - **`Enterprise|Finance|0` — Financial trading terminal and analytics workstation** (`sev 1`, `4` prompts, `missing_domain_widgets`): High-density financial workstation template featuring a central interactive charting canvas, top toolbar with overlay toggles, order book side panel, filter control dock, and data matrix table.
  - **`Enterprise|Finance|1` — Split-pane quote calculator and document generator** (`sev 1`, `4` prompts, `missing_domain_widgets`): Split-pane application template with file upload/parameter input sidebar, interactive itemized pricing ledger, real-time formula summary cards, and printable document preview pane.
  - **`Enterprise|Finance|2` — Mobile financial account and budget tracker** (`sev 2`, `2` prompts, `missing_domain_widgets`): Mobile-first financial application template with a fixed bottom navigation dock, progress card summary carousel, animated balance indicator widgets, and expandable transaction drawers.
  - **`Enterprise|Finance|3` — Retail POS and multi-view commerce portal** (`sev 2`, `2` prompts, `missing_domain_widgets`): Multi-view enterprise portal template featuring a point-of-sale checkout interface, catalog grid viewport, detail inventory ledger table, and milestone progress timeline widget.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=e481569f7b35]` **Personal Budgeting and Savings Tracking Mobile App** (`mobile_app` · `no_match`): A smooth, highly-animated mobile personal finance UI designed for tracking income/expenses, savings goals, accounts, budgets, and analytics.
  - `[id=954e265428dd]` **Settle - Business Expense & Profit Split Calculator App** (`web_app` · `no_match`): A minimal, eco-inspired fintech web app for small businesses to record order revenue, subtract itemized expenses, calculate net profit, and auto-split profits equally between partners.
  - `[id=39bdc2717c1d]` **Woodworking CNC Invoice Generator with File Import** (`web_app` · `no_match`): A business invoicing web app for a woodworking shop that imports layout software output files, automatically calculates area in square meters and pricing per part, and exports a printable customer invoice.
  - `[id=c8c531242d01]` **HTF Candle Profile Trading Dashboard** (`web_app` · `no_match`): An interactive financial trading chart tool that visualizes higher timeframe (HTF) candle profiles, supply and demand zones, volume profiles, and multi-timeframe statistics.

### 2.3 Productivity Apps (`productivity-apps`, 63 prompts)

- **Definition.** Tools for getting work done: task and project management, kanban boards, notes and docs, calendars and scheduling, email and inbox clients, CRM pipelines, team chat and collaboration workspaces, form builders.
- **Disambiguation / boundary.** If the primary verb is organize, write, plan, or communicate, choose this. If it is monitor or analyze, choose Data and Analytics Dashboard. If the user is a developer working with code, APIs, builds, or infrastructure, choose Dev Tools.
- **Coverage & match stats.** `63` prompts (`7` V6 + `56` LLM, `66` battles) · `24` usable (`0` strong, `24` adaptable = `38.1%`) · `37` no match · `2` not templatable · `2` need 3D (``hero_centerpiece` (2)`).
- **Dominant surfaces (`surf`).** `web_app` (50), `dashboard` (5), `editor_tool` (4), `mobile_app` (3), `animation` (1)
- **Dominant page types (`br.page_type`).** web tool/editor (22), analytics dashboard (7), mobile app screen (4), web app (3)
- **Representative domains (`dom`).** corporate mobility (2), municipal government publishing (1), personal productivity and time management (1), operating system simulation (1), review management and email outreach (1), E-commerce SaaS platform (1)
- **Characteristic widgets (`w`).** `Sidebar Navigation`, `User Authentication`, `Admin Dashboard`, `Edition Builder & Metadata`, `WYSIWYG Article Editor`, `PDF Generator & Preview`, `Public Search Portal`, `User & Profile Settings`
- **Most-used templates.** `t3978` Clean ticket detail view with inspector pane (Productivity Apps, 2x), `t3578` Project task list with custom fields side drawer (Productivity Apps, 2x), `t3577` Multi-resource booking calendar grid web app (Productivity Apps, 2x), `t3252` Dark professional media editing suite UI (Productivity Apps, 2x)
- **Missing-template gap archetypes (11):**
  - **`Enterprise|Productivity Apps|4` — Interactive node canvas and layout builder** (`sev 1`, `6` prompts, `missing_domain_widgets`): Visual editor template featuring a main interactive node/layout canvas, drag-and-drop step toolbar, inspector side panel, and live preview stage.
  - **`Enterprise|Productivity Apps|0` — Interactive focus timer and task suite** (`sev 1`, `5` prompts, `missing_domain_widgets`): Minimalist productivity web app featuring a central circular countdown gauge, segmented mode switcher for work and break intervals, playback controls, and an adjacent task management feed.
  - **`Enterprise|Productivity Apps|5` — Enterprise operations and logistics dashboard** (`sev 1`, `5` prompts, `missing_domain_widgets`): Enterprise operations template featuring top KPI metric cards, filterable management data tables, multi-section data entry forms, and operational status mapping containers.
  - **`Enterprise|Productivity Apps|6` — Media curation and presentation workspace** (`sev 1`, `5` prompts, `missing_domain_widgets`): Interactive content curation template featuring a sticky search header, thumbnail card grid, slide presentation reader viewport, and slide-over inspector drawer.
  - **`Enterprise|Productivity Apps|3` — Document authoring and publishing platform** (`sev 1`, `4` prompts, `missing_domain_widgets`): Document publishing web application featuring a rich-text content editor, split-pane live document previewer, metadata configuration panel, and public search portal.
  - **`Enterprise|Productivity Apps|7` — 3D canvas visualizer and conversational AI interface** (`sev 2`, `3` prompts, `missing_domain_widgets`): Interactive web application template featuring a central 3D hero canvas viewport stage for agent-generated 3D models or avatars, dynamic control floating drawer, and thread chat history sidebar.
  - **`Enterprise|Productivity Apps|1` — Grid keypad utility calculator interface** (`sev 2`, `2` prompts, `missing_domain_widgets`): Compact utility tool layout featuring a digital display screen for expressions and results, standard and expanded function keypad button grids, and a calculation history panel.
  - **`Enterprise|Productivity Apps|8` — Visual inspection and analytical canvas dashboard** (`sev 2`, `2` prompts, `missing_domain_widgets`): Analytical inspection template featuring an interactive visual canvas viewport with annotation tools, upload sidebar, diagnostic metric cards, and ranked proximity list drawer.
  - **`Enterprise|Productivity Apps|9` — Split-screen enterprise authentication portal** (`sev 2`, `2` prompts, `missing_domain_widgets`): Split-screen authentication portal layout featuring an informational visual media panel on one side and a multi-flow auth form container supporting sign-in, multi-factor verification, and recovery on the other.
  - **`Enterprise|Productivity Apps|10` — Mobile daily task and activity tracker** (`sev 2`, `2` prompts, `missing_domain_widgets`): Mobile-first utility app template featuring top filter pill badges, activity progress cards, quick item input bar, note detail card drawer, and bottom navigation bar.
  - **`Enterprise|Productivity Apps|2` — Desktop operating system environment simulator** (`sev 3`, `1` prompts, `missing_page_type`): Desktop operating system workspace template featuring a desktop icon canvas grid, dynamic taskbar with system tray, start menu popup overlay, and draggable window container frames.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=88974b19c535]` **Municipal Official Gazette Publishing System** (`web_app` · `no_match`): A municipal web application to manage, edit, format, export to PDF, and publicize official municipal gazettes with administrative management and public search functionality.
  - `[id=863a5bc7471f]` **Interactive Pomodoro Timer Web App** (`web_app` · `no_match`): A single-file interactive Pomodoro timer featuring a circular progress bar animation, 25/5/15-minute mode switching, start/pause/reset controls, spacebar shortcuts, and end-of-timer visual alerts.
  - `[id=1c874577abb8]` **Windows 11 Desktop Simulator** (`web_app` · `no_match`): A web-based Windows 11 operating system simulator featuring an identical UI layout, start menu, taskbar, desktop window manager, and interactive demo apps including a working browser.
  - `[id=d3c2e940bbdc]` **Google Review Automation Tool with CSV Email Import** (`web_app` · `no_match`): A functional web application based on the GoogleReviewBot repository that automates Google review requests and includes a CSV file import feature for recipient email lists.

### 2.4 Dev Tools (`dev-tools`, 31 prompts)

- **Definition.** Developer-facing tooling: code editors and IDEs, API consoles and docs, CI/CD and deployment dashboards, log viewers, terminal UIs, database clients, package registries, cloud infrastructure consoles, AI coding assistants.
- **Disambiguation / boundary.** Audience is the tiebreaker: if the primary user writes or ships code, choose Dev Tools even when the screen is a chart-heavy dashboard or a kanban of issues. Non-developer kanban is Productivity Apps; non-developer monitoring is Data and Analytics Dashboard.
- **Coverage & match stats.** `31` prompts (`6` V6 + `25` LLM, `33` battles) · `17` usable (`0` strong, `17` adaptable = `54.8%`) · `11` no match · `3` not templatable · `1` need 3D (``section_feature` (1)`).
- **Dominant surfaces (`surf`).** `web_app` (16), `editor_tool` (10), `dashboard` (3), `game` (1), `other` (1)
- **Dominant page types (`br.page_type`).** web tool/editor (19), analytics dashboard (2), web app workspace (1), web tool / analytics dashboard (1)
- **Representative domains (`dom`).** AI agent management (2), AI developer tools (2), software development (2), developer utilities (1), retro gaming (1), AI research tools (1)
- **Characteristic widgets (`w`).** `Search and filter bar`, `Category navigation tabs`, `Tool card grid`, `Interactive tool drawer/modal`, `Header navigation`, `Theme toggle`, `Game Canvas (3:2 Aspect Ratio)`, `ROM File Drop / Selector`
- **Most-used templates.** `t3252` Dark professional media editing suite UI (Productivity Apps, 3x), `t8012` AI coding agent workspace with three-panel layout (Chatbot & Messaging, 3x), `t3217` Dark pro studio workspace and media editor (Productivity Apps, 3x), `t3805` IDE style markdown editor with knowledge graph split view (Productivity Apps, 3x)
- **Missing-template gap archetypes (4):**
  - **`Enterprise|Dev Tools|0` — Split-Pane File & Navigation Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`): Split-pane web app layout featuring a collapsible tree navigation sidebar, central workspace pane with split diff viewing support, and interactive directory detail tables.
  - **`Enterprise|Dev Tools|1` — System Diagnostics & Operations Dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`): Developer dashboard layout featuring a top search/audit input hero bar, status card grids, integration mapping tables, and parameter configuration panels.
  - **`Enterprise|Dev Tools|2` — Interactive Visual Node & Canvas Workbench** (`sev 2`, `3` prompts, `missing_domain_widgets`): Full-bleed visual workbench layout featuring an infinite pan-and-zoom node canvas stage, draggable card elements, workflow execution progress rails, and floating control overlays.
  - **`Enterprise|Dev Tools|3` — Interactive Component & Spec Documentation Portal** (`sev 2`, `2` prompts, `missing_domain_widgets`): Documentation and showcase portal featuring sticky section navigation, interactive preview grid cards with expandable code drawers, and parameter specification tables.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=a93297d93b6e]` **Developer Utility Tools Collection** (`web_app` · `no_match`): Recreate a collection of online developer and utility tools based on the referenced repository layout, excluding image assets.
  - `[id=1f0dbf481d06]` **Web GBA Emulator for Pokémon FireRed** (`game` · `no_match`): A client-side web GBA emulator designed to run Pokémon FireRed with canvas rendering, IndexedDB save file persistence, import/export, and touch/keyboard controls.
  - `[id=f8d0d36a8b1a]` **AI Search and Research Pipeline Web App** (`web_app` · `no_match`): A visual interface and web application simulating or demonstrating an end-to-end AI research workflow, from query decomposition to retrieval, evidence processing, and final synthesis.
  - `[id=5041f03fdc70]` **Dasht SEO Core Web Vitals Audit Tool** (`web_app` · `no_match`): An RTL-native SEO and Core Web Vitals analysis web app featuring a custom simulated Lighthouse audit engine adhering strictly to the provided Dasht SEO editorial design system.

## 3. Consumer Apps (`consumer-apps`, 201 prompts · 42.3% usable · 32 gaps)

**Definition.** Applications used by individuals in daily life for connection, learning, entertainment, wellbeing, travel, and reading. Typically feed, card, player, or lesson-driven, often mobile-first, and centered on personal content and progress.

**Category coverage.** `201` target prompts (`47` V6 curated + `154` LLM) across `207` battles · `3` perfect + `82` adaptable (`42.3%` usable) · `109` no match · `7` not templatable · `15` require 3D (`n3d=true`).

### 3.1 Social Site (`social-site`, 18 prompts)

- **Definition.** Social networking and community products: feeds of user-generated posts, profiles, follows, likes and comments, messaging, groups, forums, dating, and creator communities.
- **Disambiguation / boundary.** User-generated content and person-to-person interaction define this bucket. A media app with comments stays Media Apps; a community where the posts are the product is Social Site.
- **Coverage & match stats.** `18` prompts (`2` V6 + `16` LLM, `18` battles) · `6` usable (`0` strong, `6` adaptable = `33.3%`) · `10` no match · `2` not templatable · `0` need 3D (`none`).
- **Dominant surfaces (`surf`).** `web_app` (16), `mobile_app` (2)
- **Dominant page types (`br.page_type`).** web tool/editor (7), mobile app screen (3), web app (2), mobile-first web app (1)
- **Representative domains (`dom`).** chat and messaging (2), social media (2), AI chatbot (2), AI chat / messaging (1), short video social network (1), social network (1)
- **Characteristic widgets (`w`).** `Welcome Screen`, `Chat Interface`, `Message History`, `Prompt Input Area`, `Aesthetic Blueprint / Graphic Widgets`, `vertical video feed`, `like and share action buttons`, `watermark-free video downloader`
- **Most-used templates.** `t8012` AI coding agent workspace with three-panel layout (Chatbot & Messaging, 4x), `t8019` Three-column team messaging and community chat web application (Chatbot & Messaging, 3x), `t10030` Dark theme IoT device control mobile screen (Android V1 (Screenshot Only), 1x), `t8029` Clean conversational AI chat workspace interface (Chatbot & Messaging, 1x)
- **Missing-template gap archetypes (3):**
  - **`Consumer Apps|Social Site|1` — Conversational chat and messaging workspace** (`sev 1`, `4` prompts, `missing_domain_widgets`): Conversational chat layout with conversation sidebar, top configuration/toolbar header, central message thread with initial welcome overlay stage, and bottom prompt input console.
  - **`Consumer Apps|Social Site|0` — Multi-column social feed and community dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`): Three-column social dashboard featuring a left navigation sidebar, central news/post feed with interactive composer and profile hero banner, and right-hand activity and media widget column.
  - **`Consumer Apps|Social Site|2` — Mobile vertical feed and discovery app** (`sev 2`, `3` prompts, `missing_domain_widgets`): Mobile portrait application stage featuring full-height vertical media/card stack, floating right-side action sidebar, slide-up detail drawer sheet, and fixed bottom navigation bar.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=ddad535582f8]` **Cybercore Acid Brutalist Chat App** (`web_app` · `no_match`): A cybercore digital brutalist chat app featuring a stylized welcome page transitioning into an interactive chat interface.
  - `[id=85c625f6d860]` **TikTok-Style Short Video Social App** (`mobile_app` · `no_match`): A short-video social platform inspired by TikTok featuring video feed playback, liking, saving, sharing, watermark-free video downloads, and offline support with iOS styling.
  - `[id=57e0474c26b2]` **Cybercore Brutalist Welcome Page and Chat Interface** (`web_app` · `no_match`): Design a mobile-first web app with a cybercore and digital brutalist graphic aesthetic, featuring a stylized welcome view that leads directly into a chat interface.
  - `[id=dd2af751502b]` **Microblogging Social Network App Like Twitter** (`web_app` · `no_match`): A full-featured microblogging platform inspired by Twitter (X) with user authentication, feed timeline, post creation, sidebar navigation, and seeded demo data.

### 3.2 Education (`education`, 61 prompts)

- **Definition.** Learning products and educational experiences: courses and lessons, quizzes and flashcards, language learning, tutoring, school and classroom tools, interactive simulators or explainers whose purpose is to teach, kids learning apps, study planners.
- **Disambiguation / boundary.** Teaching intent wins over surface form: an interactive chemistry simulator, a course landing page with lessons inside, and a flashcard app are all Education. A pure marketing page for a school with no learning content leans General Website Landing Page.
- **Coverage & match stats.** `61` prompts (`21` V6 + `40` LLM, `62` battles) · `22` usable (`1` strong, `21` adaptable = `36.1%`) · `39` no match · `0` not templatable · `6` need 3D (``section_feature` (3), `product_viewer` (1), `whole_page_scene` (1), `hero_centerpiece` (1)`).
- **Dominant surfaces (`surf`).** `web_app` (46), `marketing_site` (7), `animation` (3), `other` (2), `dashboard` (1), `3d_scene` (1), `mobile_app` (1)
- **Dominant page types (`br.page_type`).** web tool/editor (13), marketing landing page (4), interactive educational web app (3), interactive educational app (3)
- **Representative domains (`dom`).** statistics education (2), Network engineering exam preparation (2), education (2), study productivity (1), Panoramic Depth Estimation Research (1), primary education (1)
- **Characteristic widgets (`w`).** `Research Gaps Analysis`, `hero section`, `timer countdown/stopwatch display`, `start/pause/reset controls`, `study session duration log`, `subject/task selector`, `sound/notification settings`, `Navigation Sidebar`
- **Most-used templates.** `t3404` Dark high-density machine learning evaluation dashboard (Dashboard Apps, 4x), `t8119` Three-column creative studio and IDE workspace (Content & Publishing, 4x), `t3252` Dark professional media editing suite UI (Productivity Apps, 3x), `t3805` IDE style markdown editor with knowledge graph split view (Productivity Apps, 3x)
- **Missing-template gap archetypes (9):**
  - **`Consumer Apps|Education|6` — Scrollytelling Educational Article Guide** (`sev 1`, `6` prompts, `missing_page_type`): Narrative visual article layout featuring a sticky graphics visualizer stage, vertical timeline navigator, highlighted content callout cards, and inline mini-quiz widgets.
  - **`Consumer Apps|Education|3` — Flashcard Practice and Study App** (`sev 1`, `5` prompts, `missing_domain_widgets`): Clean study tool layout featuring a central flippable card stage with audio player controls, self-assessment confidence ratings, fill-in-the-blank drill widgets, and a progress review drawer.
  - **`Consumer Apps|Education|4` — Interactive Technical Simulation Workspace** (`sev 1`, `5` prompts, `missing_domain_widgets`): Technical simulation layout featuring split-pane exercise instructions, interactive graphic display canvas, variable control toolbar, and live inspection/output console.
  - **`Consumer Apps|Education|5` — Academic Research Knowledge Hub** (`sev 1`, `5` prompts, `missing_domain_widgets`): Structured knowledge portal layout featuring a table-of-contents navigation sidebar, structured paper reader stage, expandable formula callouts, and evaluation metric data tables.
  - **`Consumer Apps|Education|8` — School Administration and Productivity Dashboard** (`sev 1`, `5` prompts, `missing_domain_widgets`): Multi-role educational dashboard layout featuring a role switcher navigation drawer, schedule timetable tracker, classroom task board, digital canvas workspace, and study timer card.
  - **`Consumer Apps|Education|2` — Gamified Learning Path Progression Portal** (`sev 1`, `4` prompts, `missing_domain_widgets`): Gamified learning web application layout with a vertical node path roadmap, interactive exercise stage cards, streak tracking indicators, and user analytics drawer.
  - **`Consumer Apps|Education|0` — Interactive 3D Educational Simulation Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`): 3D visual simulation web app layout centered around a large 3D canvas viewport, with a collapsible side hierarchy tree, parameter control sliders, and a bottom timeline animation scrubber.
  - **`Consumer Apps|Education|1` — Interactive Slide Presentation Deck Player** (`sev 2`, `3` prompts, `missing_page_type`): Interactive presentation deck layout featuring a main slide display canvas, a thumbnail navigation sidebar, step-by-step playback controls, and expandable speaker notes or formula panels.
  - **`Consumer Apps|Education|7` — Online LMS and Course Portal** (`sev 2`, `3` prompts, `missing_domain_widgets`): Learning management application layout featuring a course navigation sidebar, step-by-step quiz stage wizard, points leaderboard widget, and split AI tutor assistant workspace.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=5daa937662f9]` **Study Timer Web App** (`web_app` · `no_match`): The user wants to design a study timer website where visitors can track their reading/study time without registering or logging in.
  - `[id=1e8c6943f479]` **Panoramic Depth Estimation Survey Website** (`web_app` · `no_match`): A navigable HTML website presenting a literature survey on panoramic depth estimation, including paper reviews, code repos, performance comparisons, research gaps, and proposed innovations.
  - `[id=38f868885322]` **Normal Distribution Interactive Animated Lesson** (`animation` · `no_match`): A scene-by-scene interactive animated explainer video teaching normal distribution and how to read standard normal tables with play controls, visual step-by-step math, and practice questions.
  - `[id=92db01453088]` **Primary School Classroom Task and Reward Board** (`dashboard` · `no_match`): An interactive classroom task progress and reward display board for primary school teachers to manage and present student engagement during lessons.

### 3.3 Media Apps (`media-apps`, 42 prompts)

- **Definition.** Audio and video consumption products: music and podcast players, video streaming, playlists, radio, live streams, watch and listen libraries, photo and video galleries, and media discovery surfaces.
- **Disambiguation / boundary.** Playback is the core loop: if the user presses play on audio or video, choose Media Apps. If the user reads articles, issues, or posts, choose Content and Publishing.
- **Coverage & match stats.** `42` prompts (`11` V6 + `31` LLM, `43` battles) · `23` usable (`1` strong, `22` adaptable = `54.8%`) · `16` no match · `3` not templatable · `5` need 3D (``product_viewer` (3), `hero_centerpiece` (2)`).
- **Dominant surfaces (`surf`).** `editor_tool` (22), `web_app` (19), `other` (1)
- **Dominant page types (`br.page_type`).** web tool/editor (29), web app (3), web application (2), mobile app screen (1)
- **Representative domains (`dom`).** medical imaging (3), photo editing (2), music player (2), Anime Streaming & Media Player (1), AI video production and editing (1), AI prompt engineering and character creation (1)
- **Characteristic widgets (`w`).** `Video Preview Player`, `Image Upload Canvas`, `Filter Presets`, `Adjustment Sliders (Brightness, Contrast, Saturation)`, `Crop and Rotate Tools`, `Export / Download Action`, `Audio Player Controls`, `Song Library / Playlist`
- **Most-used templates.** `t3217` Dark pro studio workspace and media editor (Productivity Apps, 11x), `t3252` Dark professional media editing suite UI (Productivity Apps, 10x), `t1537` Minimalist radial scatter plot analytics dashboard (Dashboard Apps, 1x), `t3495` SaaS meeting recording and AI copilot workspace (Productivity Apps, 1x)
- **Missing-template gap archetypes (5):**
  - **`Consumer Apps|Media Apps|1` — Media Streaming & Video Player Platform** (`sev 1`, `4` prompts, `missing_domain_widgets`): Video streaming web application template featuring a hero video player viewport, category discovery grid, channel selector sidebar, and program schedule time guide.
  - **`Consumer Apps|Media Apps|2` — AI Generation Studio & Playground Workspace** (`sev 1`, `4` prompts, `missing_domain_widgets`): AI creation studio template featuring an expandable prompt input bar, tag category selectors, model setup drawer, waveform audio visualizer, and persistent output action bar.
  - **`Consumer Apps|Media Apps|0` — Video Production & Timeline Editing Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`): Video studio workspace template featuring a central video preview player, multi-track timeline scrubber, scene sequence breakdown editor, and property inspector sidebar.
  - **`Consumer Apps|Media Apps|4` — Interactive Visual Utility & Control Workbench** (`sev 2`, `3` prompts, `missing_domain_widgets`): Visual utility app template featuring a central interactive canvas stage, top toolbar, numerical metric display bar, and collapsible parameter adjustment panel.
  - **`Consumer Apps|Media Apps|3` — Interactive Audio Player & Music Library** (`sev 2`, `2` prompts, `missing_domain_widgets`): Desktop audio player template featuring a central media stage with a hero 3D visualizer canvas slot, library navigation sidebar, searchable track queue, and persistent bottom playback bar.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=13d15fc07fc3]` **Android Image Editing App** (`editor_tool` · `no_match`): An interactive image editing application tailored for a mobile layout with tools for editing and enhancing photos.
  - `[id=bc303d79236d]` **Liquid Glass iTunes Music Player** (`web_app` · `no_match`): A web-based music player with iOS/iTunes liquid glass styling that allows users to upload and play local audio files.
  - `[id=ae13fa6bd808]` **Mobile Anime Streaming Platform with Custom Video Player** (`web_app` · `no_match`): An anime streaming web application tailored for mobile and tablet views using the Jikan API, featuring a custom video player with sub/dub options, quality controls, and anime search functionality.
  - `[id=ab4cd420d57d]` **Framewise AI Video Studio** (`editor_tool` · `no_match`): An AI-assisted YouTube video creation studio with scriptwriting, realistic voice narration synthesis, interactive scene editing, automated Auto-Pilot workflow, and MP4 video rendering.

### 3.4 Health/Lifestyle (`health-lifestyle`, 30 prompts)

- **Definition.** Personal wellbeing and lifestyle products: fitness and workout trackers, nutrition and recipes, meditation and sleep, habit tracking, medical and telehealth, period and pregnancy tracking, home and family life.
- **Disambiguation / boundary.** Personal body, mind, and daily-life wellbeing. A clinical analytics dashboard for hospital operators is Data and Analytics Dashboard; a patient-facing symptom tracker is Health/Lifestyle.
- **Coverage & match stats.** `30` prompts (`4` V6 + `26` LLM, `32` battles) · `12` usable (`0` strong, `12` adaptable = `40.0%`) · `17` no match · `1` not templatable · `2` need 3D (``hero_centerpiece` (2)`).
- **Dominant surfaces (`surf`).** `web_app` (22), `mobile_app` (4), `marketing_site` (3), `dashboard` (1)
- **Dominant page types (`br.page_type`).** mobile app screen (4), web app (3), web tool/editor (3), analytics dashboard (3)
- **Representative domains (`dom`).** weather (2), fitness & workout tracking (2), habit tracking & personal productivity (1), astrology (1), pet care / daily routine (1), personal decision tools (1)
- **Characteristic widgets (`w`).** `Sunny weather card`, `Windy weather card`, `Heavy rain weather card`, `Heavy snow weather card`, `Sidebar navigation`, `Finance & Budgeting Module`, `hero section`, `footer`
- **Most-used templates.** `t1583` Light medical dashboard with 3D anatomical viewer and vital metrics (Dashboard Apps, 2x), `t3395` Serif light academic analytics dashboard (Dashboard Apps, 1x), `t3434` Clean light modern sales analytics dashboard with card widgets (Dashboard Apps, 1x), `t3223` Minimalist multi-column desktop recipe reader and organizer (Productivity Apps, 1x)
- **Missing-template gap archetypes (6):**
  - **`Consumer Apps|Health/Lifestyle|0` — Mobile fitness and activity tracking app** (`sev 2`, `3` prompts, `missing_domain_widgets`): Mobile-first application template featuring a bottom navigation bar, summary metric cards, interactive set/rep log tables, timer banners, and progress analytics charts.
  - **`Consumer Apps|Health/Lifestyle|1` — Habit tracking and routine schedule dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`): Productivity dashboard template featuring an interactive schedule grid, habit check-off list items with progress bars, streak completion counters, and a visual heatmap chart.
  - **`Consumer Apps|Health/Lifestyle|2` — Multi-card status and monitoring dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`): Status monitoring dashboard template featuring an interactive status card grid, step-by-step diagnostic workflow panel, live telemetry summary bars, and scan report cards.
  - **`Consumer Apps|Health/Lifestyle|3` — Interactive node map and collection gallery** (`sev 2`, `3` prompts, `missing_domain_widgets`): Interactive web app template featuring a progression node map and calendar grid, tile reveal modal overlays, filterable inventory collection cards, and achievement generators.
  - **`Consumer Apps|Health/Lifestyle|5` — Real-time interactive workspace and event dashboard** (`sev 2`, `3` prompts, `missing_domain_widgets`): Dynamic web app template featuring a primary interactive action workspace stage, split-screen map or control panel, live leaderboard table, and persistent history logs.
  - **`Consumer Apps|Health/Lifestyle|4` — Categorized content and guide portal** (`sev 2`, `2` prompts, `missing_domain_widgets`): Editorial content portal template featuring category selection tabs, summary visualizer widgets, structured step-by-step instruction drawers, and detailed item checklist sidebars.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=d883911c46f8]` **iOS 18 Animated Weather Cards** (`web_app` · `no_match`): A landscape weather page showcasing four interactive animated weather cards (Sunny, Windy, Heavy Rain, and Heavy Snow) using iOS 18 design aesthetics.
  - `[id=1e8c77c8780a]` **Self-Contained Habit Tracker App** (`web_app` · `no_match`): A single-file habit tracker web application featuring habit management, weekly canvas chart/heatmap, progress rings, streak counts, and localStorage persistence.
  - `[id=35d5cf7c46fa]` **Premium Light Mode Astrology Web App** (`web_app` · `no_match`): A clean, premium light-mode frontend web app focused on astrology, featuring daily horoscopes, zodiac insights, and natal chart details.
  - `[id=99c23ce3931c]` **Dog Walking Schedule Planner** (`web_app` · `no_match`): The user wants an interactive tool to create and manage a dog walking schedule.

### 3.5 Travel (`travel`, 11 prompts)

- **Definition.** Trip planning and travel products: flight, hotel, and rental search and booking, itineraries, maps and navigation for travelers, destination guides, travel journals, and transit apps.
- **Disambiguation / boundary.** Moving a person to a place is the domain. A hotel brand's marketing homepage with no search or booking flow is Marketing / Brand Sites; a booking flow or itinerary planner is Travel.
- **Coverage & match stats.** `11` prompts (`2` V6 + `9` LLM, `12` battles) · `5` usable (`0` strong, `5` adaptable = `45.5%`) · `6` no match · `0` not templatable · `2` need 3D (``hero_centerpiece` (1), `section_feature` (1)`).
- **Dominant surfaces (`surf`).** `web_app` (10), `marketing_site` (1)
- **Dominant page types (`br.page_type`).** web application (4), web tool/editor (3), marketing landing page (1), mobile web app (1)
- **Representative domains (`dom`).** travel planning (1), Australian pub and hotel hospitality (1), Cyprus public transit and tourism (1), road trip planning (1), travel & HR management (1), shortlet property rentals (1)
- **Characteristic widgets (`w`).** `Itinerary Builder & Drag-and-Drop Timeline`, `Map View & Route Visualization`, `Luggage Checklist Manager`, `Expense Tracker & Analytics Reports`, `Shared Photo Album & Location Check-ins`, `User Profile & Teammate Invites`, `Hero`, `Dining Experience`
- **Most-used templates.** `t3561` Interactive floor plan workspace booking app (Productivity Apps, 3x), `t10035` Food rescue marketplace feed mobile screen (Android V1 (Screenshot Only), 1x), `t3252` Dark professional media editing suite UI (Productivity Apps, 1x), `t3230` Dark desktop asset library grid with sidebar navigation (Productivity Apps, 1x)
- **Missing-template gap archetypes (3):**
  - **`Consumer Apps|Travel|0` — Interactive map and route timeline planner** (`sev 2`, `3` prompts, `missing_domain_widgets`): Split-pane web application template featuring a central 2D/3D interactive map viewport canvas, drag-and-drop route timeline editor, and collapsible itinerary detail cards.
  - **`Consumer Apps|Travel|1` — Property and hospitality listing marketplace** (`sev 2`, `2` prompts, `missing_domain_widgets`): Marketplace showcase web application template with a hero banner, filter toolbar, dynamic card grid for properties or menu items, and slide-over preview drawers.
  - **`Consumer Apps|Travel|2` — Structured competency matrix and evaluation table** (`sev 3`, `1` prompts, `missing_domain_widgets`): Internal documentation layout featuring top summary KPI stat cards, category navigation tabs, and a multi-column comparison evaluation matrix table.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=c315b56bd376]` **Collaborative Travel Itinerary and Expense App** (`web_app` · `no_match`): A multi-user collaborative travel planning web app featuring day-by-day drag-and-drop itinerary editing, map routing, shared luggage checklists, travel expense tracking, and photo albums.
  - `[id=eb71d9e00e49]` **Hotel Queanbeyan Website Redesign** (`marketing_site` · `no_match`): A complete multi-page website redesign for Hotel Queanbeyan (The Top Pub), showcasing dining, accommodation, functions, events, and heritage history.
  - `[id=5e855df90bf9]` **Cyprus Go Public Transit and Tourist App** (`web_app` · `no_match`): A web application for tourists in Cyprus to plan public transit bus routes and explore major attractions across the island.
  - `[id=a6d96432a3cf]` **Interactive USA Coast-to-Coast 89-Day Road Trip Planner** (`web_app` · `no_match` · 🧊 `hero_centerpiece`): An interactive travel application featuring a 3D WebGL Earth globe, 2D route map, and an editable 89-day itinerary for planning a USA road trip from Los Angeles to Boston.

### 3.6 Content and Publishing (`content-and-publishing`, 39 prompts)

- **Definition.** Reading-centric content products: news sites, magazines, blogs, newsletters, long-form editorial readers, documentation and knowledge bases for readers, recipe or wiki sites, and CMS-backed publications.
- **Disambiguation / boundary.** Text and image reading is the core loop. If the main action is playing audio or video, choose Media Apps. If the content exists to sell one brand or product, choose Marketing / Brand Sites. If the reader is learning through structured lessons or quizzes, choose Education.
- **Coverage & match stats.** `39` prompts (`7` V6 + `32` LLM, `40` battles) · `17` usable (`1` strong, `16` adaptable = `43.6%`) · `21` no match · `1` not templatable · `0` need 3D (`none`).
- **Dominant surfaces (`surf`).** `web_app` (26), `marketing_site` (9), `other` (2), `editor_tool` (1), `mobile_app` (1)
- **Dominant page types (`br.page_type`).** web tool/editor (8), marketing landing page (4), educational landing page (2), web application (2)
- **Representative domains (`dom`).** Chinese history (2), Urdu literature and poetry digital library (1), poetry / e-reader (1), space and astronomy content (1), Star Wars RPG character lore (1), poetry publishing (1)
- **Characteristic widgets (`w`).** `Footer`, `Table of Contents`, `Breaking News Ticker`, `Hero section with introduction to Chinese civilization`, `Interactive dynasty timeline`, `Key historical figures showcase`, `Cultural heritage and achievements gallery`, `Major historical events highlight section`
- **Most-used templates.** `t8119` Three-column creative studio and IDE workspace (Content & Publishing, 4x), `t10114` Classical literary editorial landing page with bookshelf hero and timeline (LA Landing, 2x), `t3404` Dark high-density machine learning evaluation dashboard (Dashboard Apps, 2x), `t3746` Collaborative document editor with page tree and formatting inspector (Productivity Apps, 2x)
- **Missing-template gap archetypes (6):**
  - **`Consumer Apps|Content and Publishing|3` — Editorial News and Digital Magazine Publishing Platform** (`sev 1`, `5` prompts, `missing_domain_widgets`): An editorial magazine layout featuring a breaking news ticker strip, hero story spotlight, multi-column article grid with category tabs, side-rail article reader page, and an integrated content editor workspace.
  - **`Consumer Apps|Content and Publishing|2` — Technical Documentation and Reference Knowledge Base** (`sev 1`, `4` prompts, `missing_domain_widgets`): A technical reference workspace layout featuring a collapsible multi-level sidebar tree, central interactive node diagram or section reader canvas, floating node detail inspector panel, and structured key-value infobox widgets.
  - **`Consumer Apps|Content and Publishing|5` — Structured Directory Search and Comparison Portal** (`sev 1`, `4` prompts, `missing_domain_widgets`): A multi-faceted directory template featuring a top search header bar, filter sidebar with tag controls, entity grid cards with bookmarking capabilities, a comparison overlay drawer, and structured detail modal overlays.
  - **`Consumer Apps|Content and Publishing|1` — Scrollytelling Longread and Visual Data Report** (`sev 2`, `3` prompts, `missing_domain_widgets`): An editorial scrollytelling page featuring a full-bleed header banner, a pinned interactive media and chart stage that updates on scroll, inline callout spec modules, and dynamic reader modal overlays.
  - **`Consumer Apps|Content and Publishing|4` — Digital Library and Interactive Book Reader Workspace** (`sev 2`, `3` prompts, `missing_domain_widgets`): A digital reader application template featuring a bookshelf card layout, dual-page interactive document canvas, page navigation controls, quick-annotation editing toolbar, and a collapsible table of contents sidebar.
  - **`Consumer Apps|Content and Publishing|0` — Interactive Timeline and Milestone Historical Explorer** (`sev 2`, `2` prompts, `missing_domain_widgets`): A responsive chronological timeline layout featuring a top filtering bar, interactive vertical or horizontal timeline track, expandable event detail cards, and a quick-jump era navigation ribbon.
- **Real benchmark prompts (`prompt_template_match`):**
  - `[id=b2d623276d19]` **Chinese History Overview Webpage** (`marketing_site` · `no_match`): A webpage introducing Chinese history, covering major dynasties, key historical figures, cultural achievements, and significant historical events.
  - `[id=405a01102950]` **Urdu Literature & Poetry Digital Platform** (`web_app` · `no_match`): A comprehensive literary platform and digital library for Urdu poetry, poets, books, articles, and videos, featuring user reader tools and a full admin CMS panel.
  - `[id=21ca235a0c0d]` **Interactive Poetry Book Reader and Editor** (`web_app` · `no_match`): An interactive page-flipping poetry book reader and editor app with drag-to-turn pages, custom designs, author card, bookshelf sidebar, and editable poems/illustrations.
  - `[id=e99f7799395a]` **Cosmos-Sentinel Universe Content Portal** (`web_app` · `no_match`): A space and universe content platform featuring user and admin authentication, CRUD content management for admins, interactive content exploring, and user profile management with saved items.

---

## Output contract

Every classified item carries exactly one primary pair plus optional ranked secondaries and inferred Prompt ↔ Template Match dimensions:

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
