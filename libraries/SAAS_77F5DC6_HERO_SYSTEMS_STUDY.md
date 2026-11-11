# GitHub `77f5dc6` (`SaaS/`) Hero Design Systems & 48-Screenshot Reference Study

> **Authoritative Provenance & Visual Synthesis (`github-saas-crawler`)** — Forensic verification, visual pixel-level inspection, design-system taxonomy, and 37-prompt execution steering for Jason Festa's `SaaS/` hero screenshot & research collection pulled verbatim from `github.com/jasonfesta/WDA` commit **`77f5dc6`** (`77f5dc62807197dc5c5f835b556d289a39f17f6e`).

---

## 0. Executive Summary & At-a-Glance Totals

- **Git Provenance (Locked to `77f5dc6`)**: Checked out exclusively via `git -C /usr/local/google/home/jfesta/wda checkout 77f5dc6 -- SaaS` from commit `77f5dc62807197dc5c5f835b556d289a39f17f6e` (*"Add 20 SaaS dashboard examples with desktop and mobile captures"*, `Jason Festa <jasonfesta@users.noreply.github.com>`, `2026-11-10 06:48:02 -0500`). **Zero diff bytes** (`git diff 77f5dc6 -- SaaS` = `0`); zero non-`SaaS/` paths touched.
- **Exact File Inventory on Disk (`73` Files Total in [`SaaS/`](file:///usr/local/google/home/jfesta/wda/SaaS))**:
  - **23 Markdown Files**: [`SaaS/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/README.md), [`SaaS/SYSTEMS.md`](file:///usr/local/google/home/jfesta/wda/SaaS/SYSTEMS.md), [`SaaS/AUDIT.md`](file:///usr/local/google/home/jfesta/wda/SaaS/AUDIT.md), and **20** per-example [`SaaS/examples/*/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples) dossiers.
  - **2 JSON Manifests**: [`SaaS/capture-plan.json`](file:///usr/local/google/home/jfesta/wda/SaaS/capture-plan.json) (collection summary & 48-path list) and [`SaaS/captures.json`](file:///usr/local/google/home/jfesta/wda/SaaS/captures.json) (990-line image manifest with live URLs, viewports, `captureMode`, CSS root classes, byte sizes, and SHA-256 hashes).
  - **48 Hero Screenshots (`24` Desktop `.jpg` + `24` Mobile `.jpg`)**: **20** distinct SaaS application views from **11** source projects (`40` base images + `8` alternate light/dark theme images across `liveblocks-ai-reports`, `shadcn-admin`, `vercel-studio-admin`, and `vercel-visactor-dashboard`).
- **Standardized Capture Viewports**:
  - **Desktop (`24` images)**: `1800px` wide (`1800×948` initial viewport across 17 captures; `1800×951` to `1800×2162` full-page captures across 7 captures).
  - **Mobile (`24` images)**: `393px` wide — iPhone 15 Pro CSS width (`393×852` initial viewport across 15 captures; `393×1337` to `393×3200` full-page captures across 9 captures).
- **True Visual Polarity Breakdown (Pixel-Verified Across All 48 JPEGs)**:
  - **16 Dark Hero Pairs** (`32` screenshots) vs **8 Light Hero Pairs** (`16` screenshots).
  - *Critical Visual-Inspection Correction*: Three per-example README tables (`mantine-analytics-dashboard`, `mantine-finance`, and `tabler-crm` desktop) list `"Light"` in their markdown table, whereas visual inspection of the actual `.jpg` files confirms all three are **Dark** (`#242424` charcoal on Mantine; `#151719` obsidian slate on Tabler CRM). Always trust the pixel-verified polarities in Section 2 below.
- **Role in the 37-Prompt WDA Exercise**: Provides real-world, live-captured **Desktop (`1800px`) + Mobile (`393px`) SaaS & Dashboard hero compositions** that pair with our local CSS token systems ([`LOCAL_DESIGN_SYSTEMS_AND_NPM.md`](file:///usr/local/google/home/jfesta/wda/LOCAL_DESIGN_SYSTEMS_AND_NPM.md)), 10 high-usage Google internal design systems ([`GOOGLE_DESIGN_SYSTEMS_CATALOG.md`](file:///usr/local/google/home/jfesta/wda/GOOGLE_DESIGN_SYSTEMS_CATALOG.md)), and motion/charting libraries ([`WDA_COMPONENT_AND_MOTION_LIBRARIES.md`](file:///usr/local/google/home/jfesta/wda/WDA_COMPONENT_AND_MOTION_LIBRARIES.md)) to steer **Desktop Screenshots, Mobile Screenshots, and Golden-Template React 19 + Vite 7 + Tailwind v4 Code Snippets** across [`WDA_37_PROMPTS_MASTER.md`](file:///usr/local/google/home/jfesta/wda/WDA_37_PROMPTS_MASTER.md).

---

## 1. Provenance, Verification & Broader ~40+ Design-System Universe Reconciliation

### 1.1 Exact Commit `77f5dc6` Verification Matrix

| Verification Gate | Expected Target | Verified Disk Result | Status |
| :--- | :--- | :--- | :-: |
| **Git Commit SHA** | `77f5dc6` (`jasonfesta/WDA`) | `77f5dc62807197dc5c5f835b556d289a39f17f6e` | PASS |
| **Checkout Scope** | `SaaS/` pathspec only | `git checkout 77f5dc6 -- SaaS` (`git diff 77f5dc6 -- SaaS` = `0` bytes) | PASS |
| **Markdown Files** | `23` `.md` files | `3` root (`README.md`, `SYSTEMS.md`, `AUDIT.md`) + `20` `examples/*/README.md` = **`23`** | PASS |
| **JSON Manifests** | `2` `.json` files | `capture-plan.json` + `captures.json` (`48` SHA-256 verified entries) = **`2`** | PASS |
| **Desktop Hero `.jpg`s** | `24` desktop screenshots | `20` `desktop.jpg` + `3` `desktop-light.jpg` + `1` `desktop-dark.jpg` = **`24`** | PASS |
| **Mobile Hero `.jpg`s** | `24` mobile screenshots | `20` `mobile.jpg` + `3` `mobile-light.jpg` + `1` `mobile-dark.jpg` = **`24`** | PASS |
| **Total `SaaS/` Blobs** | `73` files (`0` extras, `0` byte-dupes) | **`73` files** (`48` unique SHA-256 JPEG hashes) | PASS |

### 1.2 Reconciling the Broader Discovery Universe (`46` Public Sources + `20` GitHub Star Repos) vs `20` Captured Examples

As documented in [`SaaS/SYSTEMS.md`](file:///usr/local/google/home/jfesta/wda/SaaS/SYSTEMS.md#L56-L178) and [`SaaS/AUDIT.md`](file:///usr/local/google/home/jfesta/wda/SaaS/AUDIT.md#L5-L62), initial discovery explored a **46-entry public SaaS/UI directory** plus a **20-repository GitHub star-ordered research table** (distilled from 129 search results) with an early 40-example target, before Jason Festa locked the capture stopping point at **20 distinct live application views (48 screenshots)** from **11 source projects**.

#### A. The 11 Captured Source Projects (`20` Views · `48` Hero Screenshots)

| # | Source Project | UI / Component Foundation | Views | Images | Dual-Theme Pairs? | Captured Folder Slugs in [`SaaS/examples/`](file:///usr/local/google/home/jfesta/wda/SaaS/examples) |
| :-: | :--- | :--- | :-: | :-: | :-: | :--- |
| 1 | **[Shadcn Admin](https://github.com/satnaing/shadcn-admin)** | `shadcn/ui` + Vite + React + Tailwind v4 OKLCH | 1 | **4** | Yes (Dark + Light) | `shadcn-admin` |
| 2 | **[Shadcnblocks Admin Kit](https://www.shadcnblocks.com/template/admin)** | `shadcn/ui` + Next.js + Tailwind | 3 | **6** | Dark only | `shadcnblocks-ecommerce`, `shadcnblocks-payments`, `shadcnblocks-project-management` |
| 3 | **[Studio Admin](https://github.com/arhamkhnz/next-shadcn-admin-dashboard)** | `shadcn/ui` + Next.js + TanStack Table + Recharts | 1 | **4** | Yes (Light + Dark) | `vercel-studio-admin` |
| 4 | **[VisActor Next.js Template](https://github.com/mengxi-ream/visactor-next-template)** | `shadcn/ui` + `@visactor/react-vchart` + Tailwind | 1 | **4** | Yes (Dark + Light) | `vercel-visactor-dashboard` |
| 5 | **[Vercel Chatbot](https://vercel.com/templates/next.js/chatbot)** | `shadcn/ui` + Next.js + Vercel AI SDK + Geist | 1 | **2** | Dark only | `vercel-chatbot` |
| 6 | **[Liveblocks Examples](https://liveblocks.io/examples)** | **Tremor Raw** (`ai-reports`) + Custom Next.js UI | 3 | **8** | Yes on `ai-reports` | `liveblocks-ai-reports` (4), `liveblocks-issue-tracker` (2), `liveblocks-ai-chat` (2) |
| 7 | **[Dub](https://dub.co/help/article/share-analytics)** | Dub Product UI (`dubinc/dub` Next.js + Tailwind) | 1 | **2** | Light only | `dub-analytics` |
| 8 | **[Mantine Analytics Dashboard](https://github.com/design-sparx/mantine-analytics-dashboard)** | **Mantine 9** + Next.js 16.3 + Recharts 3 + Tabler Icons | 2 | **4** | Dark only | `mantine-analytics-dashboard`, `mantine-finance` |
| 9 | **[MantiDash](https://github.com/nedois/mantine-dashboard)** | **Mantine** + Vite + TypeScript | 1 | **2** | Light only | `mantine-mantidash` |
| 10 | **[Tabler](https://github.com/tabler/tabler)** | **Tabler UI** / Bootstrap 5 + ApexCharts + jsVectorMap | 3 | **6** | Dark only | `tabler-business`, `tabler-crm`, `tabler-crypto` |
| 11 | **[AdminLTE v4](https://github.com/ColorlibHQ/AdminLTE)** | **Bootstrap 5** + ApexCharts + jsVectorMap | 3 | **6** | Dark only | `adminlte-overview`, `adminlte-operations`, `adminlte-store` |
| **Σ** | **11 Source Projects** | **6 Distinct Component Ecosystems** | **20** | **48** | **4 Dual-Theme** | **20 Folders (`24` Desktop + `24` Mobile JPEGs)** |

#### B. Uncaptured Discovery Sources (`SYSTEMS.md` 46-Entry Directory & 20-Repo GitHub Shortlist) — Cross-Referenced to Local `wda/` Assets

Crucially, several flagship open-source SaaS systems that hit authentication walls during unauthenticated public web capture (`Twenty`, `Plane`, `Midday`) **already exist locally inside `/usr/local/google/home/jfesta/wda/design-systems/external-systems/`** with extracted `tokens.css` and `specimen.html`!

| Discovery Tier in [`SaaS/SYSTEMS.md`](file:///usr/local/google/home/jfesta/wda/SaaS/SYSTEMS.md#L71-L169) | Documented Systems & Templates | Capture Status in `SaaS/` (`77f5dc6`) | Local `wda/` Availability Bridge |
| :--- | :--- | :--- | :--- |
| **Open-Source SaaS Products (`9`)** | **Twenty** (CRM), **Midday** (Finance/Invoicing), **Plane** (Issues/Projects), **Dub** (Link Analytics), **Docmost** (Wiki), **Documenso** (E-Sign), **Formbricks** (Surveys), **Chatwoot** (Shared Inbox), **Papermark** (Data Rooms) | **Dub** captured (`dub-analytics`). Twenty, Plane, Docmost hit sign-in gates. | **Twenty (`--t-*`)**, **Midday (`--md-*`)**, and **Plane (`--pl-*`)** are **installed locally** in `design-systems/external-systems/`! |
| **UI Systems & Admin Kits (`12`)** | **shadcn/ui**, **Untitled UI React**, **BoardUI**, **Material UI**, **Shadcnblocks**, **TailAdmin**, **Tremor**, **Tabler**, **Mantine UI**, **Tailwind Plus (Catalyst)**, **Shadcn Admin**, **AdminLTE** | **6 captured** (`Shadcn Admin`, `Shadcnblocks`, `Tremor Raw` via Liveblocks, `Tabler`, `Mantine`, `AdminLTE`). | **Shadcnblocks (`--sb-*`)**, **Vercel Geist (`--ds-*`)**, **Liveblocks (`--lb-*`)**, **shadcn/ui**, and **Fluid Functionalism (`83` items)** are local in `wda/`. |
| **Example Collections (`15`)** | **Refine** (CRM/ERP), **React-admin** (Atomic CRM/Helpdesk), **Liveblocks**, **Convex**, **Vercel Templates**, **Electric** (`Linearlite`), **Supabase**, **Nuxt UI**, **Medusa** (B2B/Merchant), **Payload**, **Sanity**, **tldraw** (Workflow/Agent Canvas), **Stream**, **Filament**, **RealWorld** | **Liveblocks** (3 views) & **Vercel Templates** (3 views) captured. | Architectural patterns inform node canvases (`#01,#03,#26`), commerce (`#14,#17`), and publishing (`#20,#33`). |
| **SaaS Starters (`10`) & GitHub Top-20 Shortlist** | `fastapi/full-stack-fastapi-template` (#1), `AdminLTE` (#2), `Tabler` (#3), `ant-design-pro` (#4), `vue-vben-admin` (#5), `gin-vue-admin` (#6), `gentelella` (#7), `vue-pure-admin` (#8), `vue-admin-better` (#9), `shadcn-admin` (#10), `open-saas` (#11), `nextjs/saas-starter` (#12), `soybean-admin` (#13), `go-admin` (#14), `coreui` (#15), `ixartz/SaaS-Boilerplate` (#16), `Kiranism/next-shadcn-dashboard-starter` (#17), `wave` (#18), `boxyhq/saas-starter-kit` (#19), `apptension` (#20) | **3 of Top 15 captured**: `AdminLTE` (#2), `Tabler` (#3), `shadcn-admin` (#10). Others required login/captcha or lacked hosted demos. | All Golden-Template builds in WDA compile cleanly to **React 19 + Vite 7 + Tailwind v4** (`vite-plugin-singlefile`), avoiding Vue/Laravel/Bootstrap runtime lock-in while borrowing visual hierarchy. |

### 1.3 Forensic Quality & Caveat Ledger (Must-Know Before Steering Builds)

> [!WARNING]
> **Known Demo Rendering Limitations & Metadata Corrections Across the 48 Screenshots:**
> 1. **Blank / Partial Chart Canvases on Specific Demo Captures** (documented in [`SaaS/AUDIT.md`](file:///usr/local/google/home/jfesta/wda/SaaS/AUDIT.md#L40-L53) and confirmed visually):
>    - **`shadcn-admin` Dark Desktop (`desktop.jpg`)**: The `Overview` bar chart card is blank (`#020817` empty box), whereas **`desktop-light.jpg`** and **`mobile.jpg` (Dark)** render all 12 monthly bars cleanly! *Rule*: Pair `shadcn-admin/desktop.jpg` (for dark token colors) with `shadcn-admin/desktop-light.jpg` or `mobile.jpg` (for bar chart geometry).
>    - **`vercel-studio-admin` Light Desktop (`desktop.jpg`)**: The `Customer Activity` spline area chart is blank in Light desktop, whereas **`desktop-dark.jpg`** renders the full 3-month dual-series spline/area chart + full 10-row paginated `18,426 Customers` table! *Rule*: Always inspect `desktop-dark.jpg` alongside `desktop.jpg`.
>    - **`shadcnblocks-payments` (`desktop.jpg` & `mobile.jpg`)**: The central `Payment Volume` card body is blank below its header KPIs (`Cards $142.8K +11%`, `Wallets $41.2K +7%`, `Refunds $11.3K -2%`), while top sparklines, `Dispute Health 86/100` barcode, `Payment Method Mix` bars, and right `My Cards` drawer render crisply.
>    - **`shadcnblocks-ecommerce` (`desktop.jpg` & `mobile.jpg`)**: `Total Revenue` shows white scatter dots without area fill and `Revenue by Channel` bars are unrendered, though the 4-KPI top strip and bottom `Average Order Value` bars / `Average Sales` line peek are visible.
>    - **`vercel-visactor-dashboard` Dark Desktop (`desktop.jpg`)**: Shows 3 stacked rounded bar columns (`2023-12-18` to `2023-12-24`) vs **7 full columns** in **`desktop-light.jpg`**, **`mobile.jpg`**, and **`mobile-light.jpg`**.
>    - **`adminlte-operations/mobile.jpg` & `adminlte-store/mobile.jpg`**: Mobile viewport captures were taken before Chart/ApexCharts series finished animating in on mobile (`gridlines visible, series line unrendered`), whereas `desktop.jpg` shows the full dual-series curves and 3-color grouped bars.
> 2. **Mobile Responsive Anti-Patterns Preserved in Raw Captures (Upgrade Mandatory in WDA Builds)**:
>    - **`liveblocks-ai-chat/mobile.jpg`**: Retains a ~68%-width left sidebar on `393px` mobile, squashing the right chat column to ~120px (`"Ask anyt / hing"` wrapped across 3 lines). *WDA Upgrade*: Collapse chat history sidebar into a slide-over sheet on `<768px`.
>    - **`liveblocks-issue-tracker/mobile.jpg`**: Retains a fixed left sidebar (`Acme Inc`) on `393px` mobile, clipping the issue rows (`562px` underlying page width). *WDA Upgrade*: Collapse workspace rail to top header drawer trigger + full-width grouped issue rows.
>    - **`mantine-mantidash/mobile.jpg`**: Shows single `Todo` column + clipped `In...` edge of column 2 (`horizontal board scroll`). *WDA Upgrade*: Add mobile column switcher pills (`Todo (4) · In Progress (5) · Review (4)`) or crisp snap-scroll indicators.
>    - **`mantine-analytics-dashboard/mobile.jpg`**: Side-by-side 2-col bottom grid squashes `Weekly sales` donut ring off the right viewport edge on `393px`. *WDA Upgrade*: Enforce `grid-cols-1` single-column card stacking below `640px`.
> 3. **Purple Guardrail (`< 9.5%` Purple Rule) Watchouts in `SaaS/` Captures**:
>    - **`tabler-business`, `tabler-crm`, `tabler-crypto`**: All 6 screenshots include a top demo promo banner (`"SPECIAL OFFER Get all Tabler's products..."`) with a cyan-to-violet gradient, and `tabler-crm` has one purple bar (`Proposal: 310`) in `Pipeline funnel` plus a purple `%` icon badge. **Never replicate demo promo banners**, and swap violet funnel bars to cyan/teal/amber (`0% purple`).

---

## 2. Master Catalog of All 20 Captured SaaS Examples & 24 Desktop/Mobile Hero Pairs

### 2.1 Complete 24-Pair Quick-Reference Matrix (`48` Hero Screenshots)

| Pair # | Example Folder Slug | Variant | Desktop Hero Path & Dimensions | Mobile Hero Path & Dimensions | Source System & UI Stack | Visual Polarity | Primary Archetype Strength |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: | :--- |
| **01** | `shadcn-admin` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcn-admin/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcn-admin/mobile.jpg) (`393×1828` fp) | Shadcn Admin (`shadcn/ui` + Vite) | **Dark** (`#020817`) | Canonical SaaS admin shell, 4-KPI row, segmented tabs, avatar ledger |
| **02** | `shadcn-admin` | Alt (Light) | [`desktop-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcn-admin/desktop-light.jpg) (`1800×948` vp) | [`mobile-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcn-admin/mobile-light.jpg) (`393×852` vp) | Shadcn Admin (`shadcn/ui` + Vite) | **Light** (`#FFFFFF`) | Daylight neutral executive overview, monochrome slate bar chart |
| **03** | `shadcnblocks-ecommerce` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-ecommerce/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-ecommerce/mobile.jpg) (`393×852` vp) | Shadcnblocks (`shadcn/ui` + Next.js) | **Dark** (`#0A0A0A`) | Slim 48px icon rail, unified 4-KPI divided banner, 2×2 mobile KPI grid |
| **04** | `shadcnblocks-payments` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-payments/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-payments/mobile.jpg) (`393×852` vp) | Shadcnblocks (`shadcn/ui` + Next.js) | **Dark** (`#0A0A0A`) | FinTech settlement treasury, 3-pane right card/ledger inspector, dispute barcode |
| **05** | `shadcnblocks-project-management` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-project-management/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-project-management/mobile.jpg) (`393×852` vp) | Shadcnblocks (`shadcn/ui` + Next.js) | **Dark** (`#0A0A0A`) | 3-pane ops workbench, 5-stage status counters, live `00:00:00` timer, issue table |
| **06** | `vercel-studio-admin` | Base (Light) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-studio-admin/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-studio-admin/mobile.jpg) (`393×852` vp) | Studio Admin (`shadcn/ui` + TanStack) | **Light** (`#FFFFFF`) | Soft-gradient KPI cards with pill deltas, searchable filterable customer data grid |
| **07** | `vercel-studio-admin` | Alt (Dark) | [`desktop-dark.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-studio-admin/desktop-dark.jpg) (`1800×1562` fp) | [`mobile-dark.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-studio-admin/mobile-dark.jpg) (`393×2208` fp) | Studio Admin (`shadcn/ui` + TanStack) | **Dark** (`#0A0A0A`) | Full-height dark telemetry spline + dense 10-row `18,426 Customers` status/billing table |
| **08** | `vercel-visactor-dashboard` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-visactor-dashboard/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-visactor-dashboard/mobile.jpg) (`393×1917` fp) | VisActor (`shadcn/ui` + VChart) | **Dark** (`#020817`) | Deep-navy analytical charts: stacked bar, packed bubble cluster, 180° arc gauge, SLA bars |
| **09** | `vercel-visactor-dashboard` | Alt (Light) | [`desktop-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-visactor-dashboard/desktop-light.jpg) (`1800×951` fp) | [`mobile-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-visactor-dashboard/mobile-light.jpg) (`393×1917` fp) | VisActor (`shadcn/ui` + VChart) | **Light** (`#FFFFFF`) | High-contrast daylight support/SLA telemetry, 1px hairline grid divisions, 2×2 mobile KPIs |
| **10** | `vercel-chatbot` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-chatbot/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-chatbot/mobile.jpg) (`393×852` vp) | Vercel AI SDK (`shadcn/ui` + Geist) | **Dark** (`#111111`) | Minimalist AI agent/prompt studio, ultra-slim icon rail, model selector + attachment dock |
| **11** | `liveblocks-ai-reports` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-reports/desktop.jpg) (`1800×1132` fp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-reports/mobile.jpg) (`393×1526` fp) | Liveblocks + **Tremor Raw** | **Dark** (`#000000`) | High-precision financial bar histograms (60-day dense bars), ranked horizontal bars, AI FAB |
| **12** | `liveblocks-ai-reports` | Alt (Light) | [`desktop-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-reports/desktop-light.jpg) (`1800×1132` fp) | [`mobile-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-reports/mobile-light.jpg) (`393×1526` fp) | Liveblocks + **Tremor Raw** | **Light** (`#FAFAFA`) | Print-clean fiduciary reporting, 4-control top filter bar, emerald/amber ranked horizontal bars |
| **13** | `liveblocks-issue-tracker` | Base (Light) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-issue-tracker/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-issue-tracker/mobile.jpg) (`393×852` vp) | Liveblocks + Custom Linear UI | **Light** (`#F5F5F5`) | Ultra-dense Linear-style grouped row matrix (`36px` rows), status icons, pill tags, RTL glyph proof |
| **14** | `liveblocks-ai-chat` | Base (Light) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-chat/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-chat/mobile.jpg) (`393×852` vp) | Liveblocks + Custom Chat UI | **Light** (`#E5E5E5`) | Framed floating card shell, persistent conversation list + prompt suggestion chips |
| **15** | `dub-analytics` | Base (Light) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/dub-analytics/desktop.jpg) (`1800×2162` fp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/dub-analytics/mobile.jpg) (`393×3200` fp) | Dub Product UI (`dubinc/dub`) | **Light** (`#F9FAFB`) | Client-shareable telemetry portal, crisp blue area chart, inline proportional bar-fill tables |
| **16** | `mantine-analytics-dashboard` | Base (Dark*) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-analytics-dashboard/desktop.jpg) (`1800×1337` fp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-analytics-dashboard/mobile.jpg) (`393×2012` fp) | Mantine 9 + Recharts 3 | **Dark** (`#242424`) | Multi-industry enterprise shell (12 verticals in rail), dual-line + donut + stacked bar + task table |
| **17** | `mantine-finance` | Base (Dark*) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-finance/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-finance/mobile.jpg) (`393×852` vp) | Mantine 9 + Recharts 3 | **Dark** (`#242424`) | 6-card P&L/AR/AP summary, 12-month 3-series Cashflow area chart, Expense Breakdown ring |
| **18** | `mantine-mantidash` | Base (Light) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-mantidash/desktop.jpg) (`1800×1327` fp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-mantidash/mobile.jpg) (`393×1337` fp) | MantiDash (`Mantine` + Vite) | **Light** (`#FFFFFF`) | 5-lane Kanban workflow pipeline (`Todo` → `Done`), priority outline pills, avatar stacks, `⌘K` bar |
| **19** | `tabler-business` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-business/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-business/mobile.jpg) (`393×852` vp) | Tabler UI + Bootstrap 5 + ApexCharts | **Dark** (`#151719`) | Horizontal 2-tier top mega-nav, sparkline KPI grid, radial gauge, choropleth world map |
| **20** | `tabler-crm` | Base (Dark*) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crm/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crm/mobile.jpg) (`393×852` vp) | Tabler UI + Bootstrap 5 + ApexCharts | **Dark** (`#151719`) | 8-card 2×4 executive CRM strip, MRR YoY line chart, horizontal stage funnel, Top Deals table |
| **21** | `tabler-crypto` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crypto/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crypto/mobile.jpg) (`393×852` vp) | Tabler UI + Bootstrap 5 + ApexCharts | **Dark** (`#151719`) | Quant/market terminal: 5-asset ticker strip, dense 9-row `Markets` watchlist, OHLC candlestick chart |
| **22** | `adminlte-overview` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-overview/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-overview/mobile.jpg) (`393×852` vp) | AdminLTE v4 + Bootstrap 5 + ApexCharts | **Dark** (`#2B3035`) | High-saturation RAG stat tiles (blue/green/amber/red), dual-area spline + vector map + chat box |
| **23** | `adminlte-operations` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-operations/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-operations/mobile.jpg) (`393×852` vp) | AdminLTE v4 + Bootstrap 5 + ApexCharts | **Dark** (`#2B3035`) | Icon-badge KPI strip, wide Monthly Recap chart + 4 horizontal goal-completion bars + 4-col footer KPIs |
| **24** | `adminlte-store` | Base (Dark) | [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-store/desktop.jpg) (`1800×948` vp) | [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-store/mobile.jpg) (`393×852` vp) | AdminLTE v4 + Bootstrap 5 + ApexCharts | **Dark** (`#2B3035`) | 2×2 symmetrical ops grid: YoY line, 3-series grouped bars, `Products` SKU table, conversion KPI rows |

*\*Note on Pairs #16, #17, and #20: Per-example README tables labeled these `"Light"`, but pixel inspection of the saved JPEGs confirms they are **Dark**.*

---

### 2.2 Detailed Visual DNA & Architecture Dossiers (All 20 Examples / 24 Pairs)

#### Cohort A — `shadcn/ui` Ecosystem (`7` Examples · `10` Hero Pairs · `20` Screenshots)

##### 1. `shadcn-admin` — Business Overview (`Pairs #01 Dark & #02 Light`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/shadcn-admin/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcn-admin/README.md) · Source Repo: `https://github.com/satnaing/shadcn-admin` · Live Demo: `https://shadcn-admin.netlify.app/`
  - **Pair #01 (Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcn-admin/desktop.jpg) (`1800×948`, `viewport`, `79,863 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcn-admin/mobile.jpg) (`393×1828`, `full-page`, `64,230 B`)
  - **Pair #02 (Light)**: [`desktop-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcn-admin/desktop-light.jpg) (`1800×948`, `viewport`, `96,841 B`) + [`mobile-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcn-admin/mobile-light.jpg) (`393×852`, `viewport`, `28,050 B`)
- **Design System & NPM Stack**: `shadcn/ui` + React + Vite + Tailwind CSS v4 (`oklch()` CSS tokens, `font-inter`), Radix UI primitives, Lucide icons, Recharts (`Overview` 12-month bar chart), TanStack Table (in secondary modules). Directly compatible 1-to-1 with WDA's Golden Template (`package.json`)!
- **Visual DNA (Pixel-Inspected)**:
  - **Dark (`#01`)**: Deep slate-navy `oklch(0.129 0.042 264.695)` (`~#020817`) canvas and card surfaces separated by crisp `1px` `#1E293B` borders, `#F8FAFC` bold `tabular-nums` KPI numerals (`$45,231.89`, `+2350`, `+12,234`, `+573`), `#94A3B8` muted secondary deltas, pill-shaped segmented tab control (`Overview | Analytics | Reports | Notifications`) in `#1E293B`, and high-contrast `#F8FAFC` light `Download` primary CTA button (`0% purple`).
  - **Light (`#02`)**: Pure `#FFFFFF` `oklch(1 0 0)` canvas, `1px` `#E2E8F0` card borders (`rounded-xl`), `#0F172A` charcoal-navy primary bars (`Jan`–`Dec`) and `Download` CTA, `#F1F5F9` active sidebar item & segmented tab track, circular `36px` initial-monogram avatars (`OM`, `JL`, `IN`, `WK`, `SD`) in `Recent Sales` with right-aligned `+$1,999.00` figures.
- **Chrome & Desktop → Mobile Reflow**:
  - **Desktop (`1800×948`)**: `240px` grouped left sidebar (`General`: Dashboard, Tasks, Apps, Chats `3`, Users, Clerk; `Pages`; `Other` + bottom user switcher) + top bar with sidebar-collapse toggle, secondary horizontal links (`Overview Customers Products Settings`), `⌘K` search input (`260px`), theme toggle, gear, avatar. Main body uses a 4-column KPI strip above an asymmetrical `7-col` (`Overview` bar chart) + `5-col` (`Recent Sales` list) split.
  - **Mobile (`393px`)**:Exemplary single-DOM reflow! Left sidebar collapses cleanly into two compact square icon buttons (`sidebar` + `menu`) beside a fluid `Search` input; `Dashboard` title + `Download` CTA stay horizontally aligned; 4-tab pill bar fits edge-to-edge without horizontal clipping; 4 KPI cards stack `1-col` vertically (`mobile-light.jpg` shows all 4 cards cleanly in `852px`; `mobile.jpg` full-page `1828px` shows all 12 white bars of `Overview` + all 5 `Recent Sales` rows).

##### 2. `shadcnblocks-ecommerce` — Ecommerce Operations (`Pair #03 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/shadcnblocks-ecommerce/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-ecommerce/README.md) · Source: `https://www.shadcnblocks.com/template/admin` · Live Demo: `https://shadcnblocks-admin.vercel.app/ecommerce/dashboard-1`
  - **Pair #03 (Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-ecommerce/desktop.jpg) (`1800×948`, `viewport`, `82,497 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-ecommerce/mobile.jpg) (`393×852`, `viewport`, `25,639 B`)
  - *Local Bridge*: Pairs directly with `/usr/local/google/home/jfesta/wda/design-systems/external-systems/shadcnblocks/` (`--sb-*` tokens).
- **Design System & NPM Stack**: `shadcn/ui` + Next.js + Tailwind CSS + Inter (`lab(2.75381 0 0)` neutral carbon dark), Recharts (`ChartContainer`), Lucide icons.
- **Visual DNA (Pixel-Inspected)**:
  - Pure neutral obsidian-carbon (`#0A0A0A` background, `#111111` card surfaces, `#222222` `1px` borders — **zero blue/purple cast**), crisp white numerals (`$189,540.75`, `21,847`, `4,975`, `$8,473.00`), emerald `↗ +27.9%` vs coral-red `↘ -13.7%` inline deltas.
  - Signature **unified 4-column KPI ribbon card** (`1px` outer border with internal vertical `1px` hairline dividers rather than 4 separate floating boxes), paired with `8-col` `Total Revenue` + `4-col` `Revenue by Channel` middle row and 3 equal `4-col` bottom cards (`Average Order Value $959.00`, `Average Sales 837`, `Product Categories`).
- **Chrome & Desktop → Mobile Reflow**:
  - **Desktop**: Ultra-compact `48px` icon-only left rail (17 module icons + bottom `CN` avatar) maximizes horizontal data width (`1752px`), paired with a slim `48px` top app bar (`Ecommerce App`, `⌘K` pill, notification badge `2`, theme swatch picker).
  - **Mobile (`393×852`)**: Top bar condenses to `[Sidebar Icon] Ecommerce App [Search] [Bell 2]`. Notably, the 4-KPI banner reflows into a **compact 2×2 grid inside one rounded card** (`Monthly revenue` | `Orders fulfilled` above `New customers` | `Refunds issued`), preserving ~380px of above-the-fold vertical space so the primary `Total Revenue` chart card is immediately visible in the initial `852px` viewport!

##### 3. `shadcnblocks-payments` — Payment Processor Dashboard (`Pair #04 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/shadcnblocks-payments/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-payments/README.md) · Source: `https://www.shadcnblocks.com/template/admin` · Live Demo: `https://shadcnblocks-admin.vercel.app/payment-processor/dashboard-1`
  - **Pair #04 (Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-payments/desktop.jpg) (`1800×948`, `viewport`, `106,770 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-payments/mobile.jpg) (`393×852`, `viewport`, `28,322 B`)
- **Design System & NPM Stack**: `shadcn/ui` + Next.js + Tailwind CSS + Inter + Lucide + SVG sparklines/barcodes.
- **Visual DNA (Pixel-Inspected)**:
  - Neutral `#0A0A0A` carbon shell with `#141414` elevated cards and soft high-legibility **mint-ice pill badges** (`#CCFBF1` / `#D1FAE5` background with `#065F46` text for `+12%`, `+9%`, `+11%`, `+7%`; soft blush `#FEE2E2` / `#991B1B` for `-2%`).
  - **Master-Detail 3-Zone FinTech Layout**: `48px` left icon rail + `~1280px` center treasury workspace (account header with right-aligned `Pending $8,420.16 · Settled $42,180.90`; 2-up sparkline cards `Gross Volume $387,291.84` & `Net Revenue $369,840.22`; `Payment Volume` panel; bottom 2-up `Dispute Health 86/100` with a 36-bar green/amber/red segmented barcode strip + `Payment Method Mix` horizontal bars) + **`420px` full-height right `My Cards` inspector rail** (`Personal | Corporate` segmented switch, dark metallic virtual Mastercard `$14,237.86 · Active`, masked `•••• 1234` / `06/27` / `$12,000.00` key-value rows, 3 equal action pills `Unhide | Adjust Limit | More`, and `RECENT PAYMENTS` ledger).
- **Mobile (`393×852`)**: Collapses left icon rail into header drawer button, places `Robert Austin` avatar header at top, stacks `Gross Volume` and `Net Revenue` full-width with crisp polyline sparklines, and shows `Payment Volume` breakdown KPIs (`Cards`, `Wallets`, `Refunds`) cleanly inside the first screen.

##### 4. `shadcnblocks-project-management` — Personal Work Overview (`Pair #05 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/shadcnblocks-project-management/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-project-management/README.md) · Source: `https://www.shadcnblocks.com/template/admin` · Live Demo: `https://shadcnblocks-admin.vercel.app/project-management/dashboard-1`
  - **Pair #05 (Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-project-management/desktop.jpg) (`1800×948`, `viewport`, `114,430 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/shadcnblocks-project-management/mobile.jpg) (`393×852`, `viewport`, `24,506 B`)
- **Visual DNA & Workbench Structure (Pixel-Inspected)**:
  - **Locked 3-Pane Operational Shell**: `48px` left icon rail + `~1320px` main workspace + `400px` right contextual profile & `Meetings | Events | Focus` schedule rail (with cover banner, avatar, UTC timezone metadata, avatar-stack meeting cards `Timeline planning review`, `Design handoff sync`, and semantic category pills `Roadmap` amber, `Design` blue, `Launch` violet — *swap `Launch` pill to emerald/cyan in WDA builds for `0% purple`*).
  - Center workspace stacks: (1) Underline tab bar (`Overview | Assigned to me | Reported by me | Watching | Updates`), (2) 3-up count cards (`Issues created 8`, `Issues assigned 4`, `Issues subscribed 6`), (3) **5-up `Issue status` pipeline counters** (`Backlog 2`, `Todo 2` cyan square, `In Progress 1` amber square, `Review 2`, `Done 1` emerald square), (4) `7-col` `Work Hour Analysis` (`38 hours · 12 mins` with `5D | 2W | 1M | 6M | 1Y` segmented bar + step-line chart) beside `5-col` **live `Time Tracker` (`00:00:00` tabular display + task selector `RFC-101` + `Start / Reset`)**, and (5) bottom `My issues` table (`Issues, Status, Priority, Assignee, Labels, Due date`).
  - **Mobile (`393×852`)**: Adds a dedicated top-right `[Inspector Drawer]` icon button (`My workspace` row) for the right-hand Meetings rail! Stacks `Overview` cards and `Issue status` cards cleanly in 1 column.

##### 5. `vercel-studio-admin` — Customer & Subscription Operations (`Pairs #06 Light & #07 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/vercel-studio-admin/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-studio-admin/README.md) · Source Repo: `https://github.com/arhamkhnz/next-shadcn-admin-dashboard` · Live Demo: `https://studio-admin.arhamkhnz.com/dashboard/default`
  - **Pair #06 (Light)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-studio-admin/desktop.jpg) (`1800×948`, `viewport`, `116,628 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-studio-admin/mobile.jpg) (`393×852`, `viewport`, `32,146 B`)
  - **Pair #07 (Dark)**: [`desktop-dark.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-studio-admin/desktop-dark.jpg) (`1800×1562`, `full-page`, `205,277 B`) + [`mobile-dark.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-studio-admin/mobile-dark.jpg) (`393×2208`, `full-page`, `79,261 B`)
- **Design System & NPM Stack**: Next.js App Router + `shadcn/ui` + Tailwind CSS + `@tanstack/react-table` (checkbox selection, multi-facet status/date/billing filters, column sort, rows-per-page pagination) + Recharts.
- **Visual DNA (Pixel-Inspected)**:
  - **Light (`#06`)**: Crisp `#FFFFFF` workspace with subtle vertical-gradient `#F8FAFC → #FFFFFF` KPI cards (`1px` `#E5E7EB` borders), high-contrast solid black pill badges (`↗ +12.5%`, `↗ +4.5%`) paired with rose-tinted alert pills (`↘ -20%`), and descriptive footers (`"Acquisition needs attention"`, `"Engagement exceeds targets"`).
  - **Dark (`#07`)**: Deep `#0A0A0A` / `#121212` charcoal-obsidian with a dramatic **high-frequency white/silver dual-spline `Customer Activity` telemetry chart** (`Aug 16` – `Nov 10`, with `3 months ▾ | All segments ▾ | View report` header controls) above the **`18,426 Customers` TanStack data table** (`Search customers...`, `Status`, `Joined date`, `Billing`, `Sort`, `Export`; semantic status pills `Subscribed`, `Inactive`, `Unsubscribed` and dot-prefixed billing pills `● Paid` emerald, `☼ Pending` slate, `① Overdue` amber, `◷ Trial` blue).
- **Mobile (`393px`)**: Stacks all 4 KPI cards cleanly in `mobile.jpg` (`852px`), while `mobile-dark.jpg` (`2208px`) demonstrates how the customer table adapts on narrow screens (retaining `Customer`, `Status`, and `Billing` columns with bottom `Page 1 of 6` chevrons — though note customer names truncate to `S... #18...`, so WDA mobile tables should stack name + ID in a wider primary cell!).

##### 6. `vercel-visactor-dashboard` — Customer-Support Analytics (`Pairs #08 Dark & #09 Light`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/vercel-visactor-dashboard/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-visactor-dashboard/README.md) · Source Repo: `https://github.com/mengxi-ream/visactor-next-template` · Live Demo: `https://visactor-next-template.vercel.app/`
  - **Pair #08 (Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-visactor-dashboard/desktop.jpg) (`1800×948`, `viewport`, `85,772 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-visactor-dashboard/mobile.jpg) (`393×1917`, `full-page`, `71,981 B`)
  - **Pair #09 (Light)**: [`desktop-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-visactor-dashboard/desktop-light.jpg) (`1800×951`, `full-page`, `91,505 B`) + [`mobile-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-visactor-dashboard/mobile-light.jpg) (`393×1917`, `full-page`, `70,639 B`)
- **Design System & NPM Stack**: Next.js + `shadcn/ui` + Tailwind CSS + **VisActor (`@visactor/react-vchart`)** canvas/SVG visualization library.
- **Visual DNA (Pixel-Inspected)**:
  - **Border-Grid Bento Layout (Zero Floating Card Gaps!)**: Instead of separate rounded boxes with outer margins, the entire workspace is partitioned by **continuous `1px` full-bleed hairline grid dividers** (`#1E293B` on `#020817` midnight navy in Dark; `#E2E8F0` on `#FFFFFF` with `#F8FAFC` `180px` left sidebar in Light).
  - **Rich Multi-Geometry Data Viz Showcase (`0%` purple except a tiny 6px `WhatsApp` legend dot)**:
    1. Top 4-metric borderless strip (`Created Tickets 24,208 -5%`, `Unsolved Tickets 4,564 +2%`, `Resolved Tickets 18,208 +8%`, `Average First Time Reply 12:01 min +8%`).
    2. `8-col` **Stacked Rounded-Cap Bar Chart** (`Average Tickets Created` `3,817` sky cyan `#38BDF8` over `Avg. Tickets Resolved` `2,176` royal cobalt `#2563EB`, with date-range picker pill).
    3. `4-col` **Packed Proportional Circle Cluster** (`Conversions 17,220 Sales`: `12,320` cobalt, `3,260` sky cyan, `1,320` amber-orange `#F97316`, `320` emerald `#22C55E`).
    4. Bottom-left `6-col` **180° Segmented Semi-Donut Arc Gauge** (`Ticket By Channels — Total Active Tickets 14,832`).
    5. Bottom-right `6-col` **Sentiment Progress Bars** (`Customer Satisfaction — 156 Customers`: `Positive 80%` emerald, `Neutral 15%` amber, `Negative 5%` coral).
- **Mobile (`393×1917`)**: Outstanding mobile adaptation! Collapses sidebar to a subtle left-edge drawer tab `[→|]`, arranges the 4 headline metrics into a **clean 2×2 grid**, and stacks all 4 VisActor charts vertically at full `393px` width with zero clipping or overflow.

##### 7. `vercel-chatbot` — Conversational AI Assistant (`Pair #10 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/vercel-chatbot/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-chatbot/README.md) · Source: `https://vercel.com/templates/next.js/chatbot` · Live Demo: `https://chatbot.ai-sdk.dev/demo`
  - **Pair #10 (Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-chatbot/desktop.jpg) (`1800×948`, `viewport`, `31,093 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/vercel-chatbot/mobile.jpg) (`393×852`, `viewport`, `12,889 B`)
  - *Local Bridge*: Pairs directly with `/usr/local/google/home/jfesta/wda/design-systems/external-systems/vercel-geist/` (`--ds-*` Geist tokens).
- **Design System & NPM Stack**: Next.js + Vercel AI SDK + `shadcn/ui` + **Geist Sans & Geist Mono** (`geist` / `geist_mono` root CSS variables).
- **Visual DNA (Pixel-Inspected)**:
  - Pure matte `#111111` (`lab(6.69783 0 0)`) canvas with a `44px` ultra-minimal left rail (sidebar toggle, new chat, trash icon, bottom blue status orb), centered `760px` conversational column, crisp `What can I help with?` Geist display heading, `2×2` bordered starter-prompt pills (`#1A1A1A` fill, `1px` `#2A2A2A` border), and an elevated multi-row composer dock featuring paperclip attachment icon, inline model selector (`Kimi K2.5`), and circular send button.
  - **Mobile (`393×852`)**: Adds a clean top bar (`[Sidebar] [▲ Vercel] [🔒 Private ▾]`), centers the greeting vertically, converts starter prompts into a horizontal snap-carousel row above the docked bottom composer.

---

#### Cohort B — Liveblocks + Tremor Raw + Dub Product UI (`4` Examples · `5` Hero Pairs · `10` Screenshots)

##### 8. `liveblocks-ai-reports` — Financial Reporting + AI Copilot (`Pairs #11 Dark & #12 Light`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/liveblocks-ai-reports/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-reports/README.md) · Source: `https://liveblocks.io/examples/ai-dashboard-reports/nextjs-ai-dashboard-reports`
  - **Pair #11 (Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-reports/desktop.jpg) (`1800×1132`, `full-page`, `101,702 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-reports/mobile.jpg) (`393×1526`, `full-page`, `49,155 B`)
  - **Pair #12 (Light)**: [`desktop-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-reports/desktop-light.jpg) (`1800×1132`, `full-page`, `106,081 B`) + [`mobile-light.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-reports/mobile-light.jpg) (`393×1526`, `full-page`, `51,090 B`)
  - *Local Bridge*: Pairs directly with `/usr/local/google/home/jfesta/wda/design-systems/external-systems/liveblocks/` (`--lb-*` tokens).
- **Design System & NPM Stack**: Next.js + Liveblocks + **Tremor Raw** (`shadcn/ui`/Radix-based open source analytics primitives) + Tailwind CSS.
- **Visual DNA (Pixel-Inspected — One of the Highest-Craft Pairs in the Entire `SaaS/` Set!)**:
  - **Inset Framed Sheet Architecture**: `220px` borderless outer navigation rail (`#000000` pure black in Dark; `#FAFAFA` `lab(98.26 0 0)` warm off-white in Light) framing an **inset rounded main report sheet** (`#0A0A0A` with `1px` `#1F1F1F` border in Dark; `#FFFFFF` with `1px` `#E5E7EB` border in Light).
  - **Precision Fiduciary Data Visualization**:
    1. **Top 4-Facet Filter Bar**: Labeled select/range inputs (`Date range: Last 60 days`, `Locations: Selected Locations 0`, `Expense status: All`, `Transaction amount: $10 - $11,990` + `Reset` button).
    2. **High-Density 60-Bar Time-Series Histograms**: `Total transaction amount $1,563,449` and `Transaction count 269` rendered as 60 crisp daily vertical bars with **bright 2px top-cap accent ticks** (`#3B82F6` cobalt cap over translucent `#1E3A8A/40` / `#DBEAFE` column body — an iconic Tremor Raw signature!).
    3. **Bottom 2-Col Ranked Horizontal Bar Lists**: `Top 5 categories by transaction amount $590,944` (translucent emerald `#10B981/20` fill + crisp `2px` `#10B981` right-edge terminal cap) and `Top 5 merchants by transaction amount $483,153` (translucent amber `#F59E0B/20` fill + `2px` `#F59E0B` right-edge cap), plus a floating bottom-right AI sparkle FAB.
  - **Mobile (`393×1526`)**: Textbook mobile excellence! Collapses the 4-control filter bar into a single full-width `Filters ▾` accordion dropdown, keeps all 60 histogram bars crisp and legible at `393px`, and stacks Categories above Merchants cleanly.

##### 9. `liveblocks-issue-tracker` — Linear-Style Collaborative Issue Tracker (`Pair #13 Light`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/liveblocks-issue-tracker/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-issue-tracker/README.md) · Source: `https://liveblocks.io/examples/linear-like-issue-tracker/nextjs-linear-like-issue-tracker`
  - **Pair #13 (Light)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-issue-tracker/desktop.jpg) (`1800×948`, `viewport`, `51,276 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-issue-tracker/mobile.jpg) (`393×852`, `viewport`, `19,742 B`)
- **Visual DNA (Pixel-Inspected)**:
  - Whisper-quiet `#F5F5F5` outer chrome (`230px` `Acme Inc` sidebar with compose icon button, `Inbox`, `Issues`) framing a full-height `#FFFFFF` `1px`-bordered inset worklist (`0% purple` except a single `14px` `Done` checkmark badge).
  - Ultra-high-density `38px` single-line issue rows grouped under subtle `#FAFAFA` status section bands (`◐ In Progress` amber half-circle, `— None`, `✓ Done`), with left priority glyphs (`⚠`), issue title (even demonstrating inline Arabic script `ثبلصئق` rendering cleanly alongside Inter!), right-aligned outline pill tags (`● Bug`, `● Engineering`, `● Design`), `tabular-nums` short dates (`Oct 24`), and `20px` circular assignee avatars.
  - *Mobile Caveat*: As noted in Section 1.3, raw `mobile.jpg` leaves the sidebar open on `393px`; always collapse the rail into a sheet in WDA builds.

##### 10. `liveblocks-ai-chat` — Persistent Collaborative AI Chats (`Pair #14 Light`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/liveblocks-ai-chat/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-chat/README.md) · Source: `https://liveblocks.io/examples/ai-chats/nextjs-ai-chats`
  - **Pair #14 (Light)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-chat/desktop.jpg) (`1800×948`, `viewport`, `29,708 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/liveblocks-ai-chat/mobile.jpg) (`393×852`, `viewport`, `17,898 B`)
- **Visual DNA (Pixel-Inspected)**:
  - Warm `#E5E5E5` outer backdrop centering a floating `1000×720` `#FFFFFF` application window (`rounded-xl`, soft ambient drop shadow) split into a `260px` `#FAFAFA` conversation history column (`New chat` rose accent, `Chats`, `Recents → Untitled`) and a clean white conversation stage (`How can I help you?`, rounded pill suggestion chips, `Ask anything...` textarea). *Mobile Caveat*: Fix the uncollapsed sidebar on `<768px`.

##### 11. `dub-analytics` — Public Link & Campaign Attribution Portal (`Pair #15 Light`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/dub-analytics/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/dub-analytics/README.md) · Source: `https://dub.co/help/article/share-analytics` (`dubinc/dub`) · Live Demo: `https://app.dub.co/share/dash_6NSA6vNm017MZwfzt8SubNSZ`
  - **Pair #15 (Light)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/dub-analytics/desktop.jpg) (`1800×2162`, `full-page`, `126,222 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/dub-analytics/mobile.jpg) (`393×3200`, `full-page`, `83,223 B`)
- **Design System & NPM Stack**: Dub Product UI (`Next.js` + `Tailwind CSS` + `Satoshi`/`Inter` + custom SVG/Recharts time-series + `@dub/ui` primitives).
- **Visual DNA (Pixel-Inspected — Gold-Standard Light SaaS Polish)**:
  - Ultra-clean `#F9FAFB` / `#FAFAFA` page background with centered `1120px` max-width container, `#FFFFFF` cards, `1px` `#E5E7EB` crisp hairline borders (`rounded-xl`), `#111827` primary ink, `#6B7280` secondary labels, and `#2563EB` / `#3B82F6` cobalt time-series stroke over a soft vertical `#DBEAFE → transparent` gradient area fill (`0% purple` in all product analytics cards).
  - **Signature Dub Component Patterns**:
    1. **Top Filter Toolbar**: Brand/link badge (`d.to/try`) left-aligned opposite `Filter ▾` and `Last 24 hours ▾` pill dropdowns.
    2. **Tabbed Metric Hero Card**: Top metric tab (`■ Clicks · 172` with `2px` solid `#111827` bottom active indicator) attached directly above a clean 24-hour polyline/area chart with top-right chart-type toggle pills (`[📈 | 🚩]`).
    3. **2-Column Attribution Breakdown Cards with Inline Bar-Fill Rows**: `Referrers | UTM Parameters` (sub-pill `Domain | URL`, rose-tinted proportional bar fill `#FEE2E2` behind `(direct) 153`, `dub.co 17`, `facebook.com 2`), `Countries | Cities | Regions | Continents` (sky-blue proportional bar fill `#DBEAFE` with country flag icons `🇺🇸 United States 80`, `🇨🇦 Canada 15`, `🇩🇪 Germany 11` + floating bottom `View All` pill), and `Devices | Browsers | OS | Triggers` (mint-green bar fill `#DCFCE7` behind `Desktop 143`, `Mobile 29`).
  - **Mobile (`393×3200`)**: Flawless! Filter & date pills expand to full-width stacked triggers, and every breakdown card (`Referrers`, `Countries`, `Devices`) stacks in a crisp 1-column rhythm with generous horizontal padding and zero text truncation.

---

#### Cohort C — Mantine UI Ecosystem (`3` Examples · `3` Hero Pairs · `6` Screenshots)

##### 12. `mantine-analytics-dashboard` — Multi-Vertical Business Operations (`Pair #16 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/mantine-analytics-dashboard/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-analytics-dashboard/README.md) · Source Repo: `https://github.com/design-sparx/mantine-analytics-dashboard` · Live Demo: `https://mantine-analytics-dashboard.netlify.app/dashboard/default`
  - **Pair #16 (Dark — *README table mislabeled "Light"*)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-analytics-dashboard/desktop.jpg) (`1800×1337`, `full-page`, `156,367 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-analytics-dashboard/mobile.jpg) (`393×2012`, `full-page`, `68,590 B`)
- **Design System & NPM Stack**: **Mantine v9** + Next.js 16.3 + Tiptap 3 + `@tabler/icons-react` 3.47 + **Recharts 3** + Inter.
- **Visual DNA (Pixel-Inspected)**:
  - Warm neutral dark-gray Mantine palette (`#1F1F1F` / `#242424` canvas, `#2B2B2B` elevated cards, `#373A40` `1px` borders — softer contrast than `#000` OLED dark), Mantine Blue `#228BE6` active sidebar fill & badge pills (`TODAY`, `ANNUAL`, `MONTHLY`), `#40C057` emerald positive deltas (`34% ↗`), `#FA5252` coral negative deltas (`-13% ↘`), `0% purple`.
  - `250px` scrollable multi-industry left navigation (`Default`, `Analytics`, `SaaS`, `E-commerce`, `CRM`, `Finance`, `Marketing`, `Healthcare`, `Education`, `Logistics`, `HR`, `Real Estate`, `LLM/AI` + `APPS` section) + 4 KPI cards + `8-col` dual-series smooth spline `Total revenue` + `4-col` `Weekly sales` donut ring & compact source table + `4-col` `Mobile/Desktop` stacked bar chart + `8-col` `Tasks` status/assignee table.
  - *Mobile Caveat*: Top 4 KPI cards stack cleanly on `393px`, but the middle/bottom 2-column grids fail to collapse to `1-col`, clipping the `Weekly sales` donut and `Tasks` table. Always collapse `12-col` grids to `grid-cols-1` on `<768px` in WDA builds.

##### 13. `mantine-finance` — P&L, Cashflow, AR/AP & Expense Breakdown (`Pair #17 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/mantine-finance/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-finance/README.md) · Source Repo: `https://github.com/design-sparx/mantine-analytics-dashboard` (`/dashboard/finance`)
  - **Pair #17 (Dark — *README table mislabeled "Light"*)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-finance/desktop.jpg) (`1800×948`, `viewport`, `125,842 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-finance/mobile.jpg) (`393×852`, `viewport`, `32,946 B`)
- **Visual DNA (Pixel-Inspected)**:
  - Shares Mantine `#242424` dark shell with **6 executive financial KPI cards** (`TOTAL REVENUE $1.24M +15.3%`, `NET PROFIT $456K +8.7%`, `EXPENSES $784K -3.2%`, `PROFIT MARGIN 36.8% +2.1%`, `ACCOUNTS RECEIVABLE $234K -12.4%`, `ACCOUNTS PAYABLE $156K -8.9%`), each stamped with a `VS LAST MONTH` cobalt pill.
  - Anchored by an `8-col` **12-month 3-series `Cashflow Overview` shaded spline chart** (`Income` emerald `#40C057` top curve, `Expenses` coral `#FA5252` middle curve, `Net Cashflow $1,062,000` blue `#228BE6` lower curve) beside a `4-col` **`Expense Breakdown` (`Total: $784,000`) multi-segment ring chart** with a 2-column category/percentage/amount legend (`Salaries & Wages $425,000 54.2%`, `Office & Facilities $125,000 15.9%`).
  - **Mobile (`393×852` viewport)**: Cleanly stacks `Finance dashboard` header + the first 4 KPI cards (`Total Revenue`, `Net Profit`, `Expenses`, `Profit Margin`) with zero horizontal overflow in the initial viewport!

##### 14. `mantine-mantidash` — 5-Lane Workflow Kanban Board (`Pair #18 Light`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/mantine-mantidash/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-mantidash/README.md) · Source Repo: `https://github.com/nedois/mantine-dashboard` · Live Demo: `https://v1.mantidash.nedois.com/dashboard/apps/kanban`
  - **Pair #18 (Light)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-mantidash/desktop.jpg) (`1800×1327`, `full-page`, `199,572 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/mantine-mantidash/mobile.jpg) (`393×1337`, `full-page`, `29,634 B`)
- **Visual DNA (Pixel-Inspected)**:
  - Crisp `#FFFFFF` daylight workspace (`240px` left sidebar with soft `#E7F5FF` / `#228BE6` active `Kanban` pill, top `Search for feature` input with solid blue `⌘K` badge), `0% purple`.
  - **5-Column Kanban Pipeline** (`Todo`, `In progress`, `Read to test`, `Review`, `Done` — column 5 peeking cleanly at right edge): Each lane uses a `#F8F9FA` `1px`-bordered container housing crisp `#FFFFFF` task cards with bold title, 2-line muted summary, comment/attachment counts (`💬 28 📎 1`), overlapping 3-avatar cluster, outline pill tags (`HIGH` coral, `NORMAL` blue, `LOW` gray + `FRONTEND`, `BACKEND`, `MOBILE`), and bottom `+ Add card` action.

---

#### Cohort D — Tabler UI & AdminLTE v4 Bootstrap Dashboards (`6` Examples · `6` Hero Pairs · `12` Screenshots)

##### 15. `tabler-business` — SaaS & Subscription Executive Overview (`Pair #19 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/tabler-business/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-business/README.md) · Source Repo: `https://github.com/tabler/tabler` · Live Demo: `https://preview.tabler.io/index.html`
  - **Pair #19 (Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-business/desktop.jpg) (`1800×948`, `viewport`, `115,122 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-business/mobile.jpg) (`393×852`, `viewport`, `34,886 B`)
- **Design System & NPM Stack**: Tabler UI (Bootstrap 5 CSS architecture) + ApexCharts + jsVectorMap + Tabler Icons (translate to Tailwind v4 + `lucide-react` + Recharts/SVG in WDA Golden Templates).
- **Visual DNA (Pixel-Inspected)**:
  - **Horizontal Top Mega-Nav Shell (No Left Sidebar!)**: Ideal reference when a prompt benefits from full-width `12-col` horizontal real estate without a left rail! Dark `#151719` (`oklch(0.2046 0 0)`) canvas with `#1D2125` 2-tier top bar (`tabler` logo + user profile above `Dashboards | Interface | Forms | Extra | Layout | Plugins` tab strip) and `#206BC4` primary `+ Create new report` button. *(Strip the top demo promo banner in WDA builds.)*
  - Dense 4-row modular bento: (Row 1) `6-col` welcome banner + `3-col` `TOTAL USERS 75,782` dual-line sparkline card + `3-col` `ACTIVE USERS 25,782` `58%` 270° radial arc gauge; (Row 2) 4 equal `3-col` metric cards (`SALES 75%` progress bar, `REVENUE $4,300` area sparkline, `NEW CLIENTS 6,782` dual polyline, `ACTIVE SUBSCRIPTIONS 2,986` 24-bar mini histogram); (Row 3) 4 compact icon-stat pills (`132 Sales`, `78 Orders`, `623 Shares`, `132 Likes`); (Row 4) `6-col` `Traffic summary` stacked bar + `6-col` `Locations` blue choropleth world map.
  - **Mobile (`393×852`)**: Top nav collapses into `[☰] [>_ tabler] [Avatar]`, `[+]` blue icon CTA aligns opposite `Dashboard`, and hero/sparkline cards stack `1-col` cleanly.

##### 16. `tabler-crm` — Revenue Pipeline, Funnel & Deal Desk (`Pair #20 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/tabler-crm/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crm/README.md) · Source Repo: `https://github.com/tabler/tabler` (`dashboard-crm.html`)
  - **Pair #20 (Dark — *README table mislabeled desktop "Light"*)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crm/desktop.jpg) (`1800×948`, `viewport`, `108,991 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crm/mobile.jpg) (`393×852`, `viewport`, `33,630 B`)
- **Visual DNA (Pixel-Inspected)**:
  - High-density dark CRM cockpit (`#151719` canvas, `#1F2429` cards, `1px` `#2C3239` borders):
    1. **2×4 Compact Executive Metric Grid (8 Cards)**: `MRR $92.4K +9.5%`, `PIPELINE $2.4M +14%`, `DEALS WON 74 +8%`, `CONVERSION 5.97% +0.4%`, `ACTIVITIES 318 +22%`, `TASKS DUE 12 -3 urgent`, `LEADS ADDED 148 +31%`, `CHURN RATE 1.8% -0.3%` — each with a tinted `36×36` left icon tile and right-aligned delta.
    2. **6-Col `MONTHLY RECURRING REVENUE` (`$92,400 +9.5%`)**: Solid blue `This year` curve vs dashed gray `Last year` baseline.
    3. **6-Col `Pipeline funnel` (`This quarter`)**: 5 horizontal stage progress tracks with inline count labels inside the bars and right-aligned `$` totals (`Leads 1240 $2.4M`, `Qualified 680 $1.6M`, `Proposal 310 $940K` *[swap purple bar to cyan]*, `Negotiation 148 $580K` amber, `Closed won 74 $312K` emerald).
    4. **Bottom Split**: `Top deals` table (`COMPANY | STAGE | VALUE | PROBABILITY bar | OWNER`) + `Recent activity` timeline feed.
  - **Mobile (`393×852`)**: Stacks all 8 KPI cards cleanly into a tight vertical scannable feed (`64px` card height each — fitting almost all 8 KPIs in one mobile screen!).

##### 17. `tabler-crypto` — Market Watchlist & OHLC Candlestick Terminal (`Pair #21 Dark`)
- **Files & Provenance**:
  - Dossier: [`SaaS/examples/tabler-crypto/README.md`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crypto/README.md) · Source Repo: `https://github.com/tabler/tabler` (`dashboard-crypto.html`)
  - **Pair #21 (Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crypto/desktop.jpg) (`1800×948`, `viewport`, `111,582 B`) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/tabler-crypto/mobile.jpg) (`393×852`, `viewport`, `34,318 B`)
- **Visual DNA (Pixel-Inspected — Prime Quant/Trading Reference)**:
  - **5-Up Ticker Strip**: `Total balance $253,545 (2.3 BTC)` + `USD/BTC 0.00000907`, `LTC/BTC 0.00089444`, `ETH/BTC 0.03528906`, `XMR/BTC 0.00310313` with 8-decimal precision `tabular-nums` pricing and `Volume` sublines.
  - **Asymmetrical Trading Split (`4.5-col` Watchlist + `7.5-col` Candlestick Canvas)**:
    - Left `Markets` table: 9 dense asset rows (`★ | COIN | PRICE | VOLUME | CHANGE`), emerald `+4.42% ↑` vs coral `-3.20% ↓`.
    - Right `LTC/BTC` OHLC Candlestick panel: Top-right timeframe pills (`1m | 5m | 30m | 1h | 1d`), zoom/pan chart toolbar, dashed horizontal price gridlines (`70000.00`–`110000.00`), crisp emerald `#2FB344` bullish & coral `#EF4444` bearish candlesticks with thin wicks.

##### 18–20. `adminlte-overview` (`#22`), `adminlte-operations` (`#23`), `adminlte-store` (`#24`) — Classic Multi-Module Operations Consoles
- **Files & Provenance**:
  - Source Repo: `https://github.com/ColorlibHQ/AdminLTE` (v4 Bootstrap 5) · Live Demos: `/themes/v4/` (`#22`), `/themes/v4/index2.html` (`#23`), `/themes/v4/index3.html` (`#24`)
  - **Pair #22 (`adminlte-overview`, Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-overview/desktop.jpg) (`1800×948` vp) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-overview/mobile.jpg) (`393×852` vp) — [README](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-overview/README.md)
  - **Pair #23 (`adminlte-operations`, Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-operations/desktop.jpg) (`1800×948` vp) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-operations/mobile.jpg) (`393×852` vp) — [README](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-operations/README.md)
  - **Pair #24 (`adminlte-store`, Dark)**: [`desktop.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-store/desktop.jpg) (`1800×948` vp) + [`mobile.jpg`](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-store/mobile.jpg) (`393×852` vp) — [README](file:///usr/local/google/home/jfesta/wda/SaaS/examples/adminlte-store/README.md)
- **Visual DNA Across All 3 AdminLTE v4 Views (`0% purple`)**:
  - Slate-charcoal `#212529` / `#2B3035` Bootstrap dark shell with `250px` hierarchical tree sidebar (`Filter menu...` input, nested `Dashboard v1/v2/v3`, `Widgets`, `Layout Options 12`, `Tables`, `Charts`).
  - **Distinct Compositional Archetypes**:
    - **`#22 Overview`**: High-visibility **full-fill semantic status tiles** (`#2563EB` blue `150 New Orders`, `#2F855A` green `53% Bounce Rate`, `#ECC94B` amber `44 User Registrations`, `#C53030` red `65 Unique Visitors` — refactoring nicely on mobile into a `2×2` grid!) + dual-spline `Sales Value` area chart + royal-blue world map card with 3 bottom white sparklines (`Visitors`, `Online`, `Sales`).
    - **`#23 Operations` (Dashboard v2)**: Refined dark cards with `48×48` colored left icon squares + **full-width `Monthly Recap Report` composite card** pairing an `8-col` spline chart with `4-col` `Goal Completion` horizontal fraction bars (`160/200`, `310/400`, `480/800`, `250/500`) above a 4-column divided footer (`TOTAL REVENUE $35,210.43`, `TOTAL COST $10,390.90`, `TOTAL PROFIT $24,813.53`, `GOAL COMPLETIONS 1200`).
    - **`#24 Store` (Dashboard v3)**: Clean **2×2 balanced quad layout**: top-left dual-line `Online Store Visitors (820 ↑ 12.5%)`, top-right 3-bar grouped `Sales ($18,230.00 ↑ 33.1%)`, bottom-left `Products` table (`Product, Price, Sales, More`), bottom-right `Online Store Overview` 3-row conversion ledger (`12% CONVERSION RATE`, `0.8% SALES RATE`, `1% REGISTRATION RATE`).

---

## 3. Prompt-to-Hero-Reference Preliminary Fit Notes (`#01`–`#37`)

### 3.1 Deep Spotlight — Block 1 (`Prompts #01–#05` · Slots `slot-1` to `slot-5`)

#### Prompt `#01` (`slot-1`) — `30UuyID6vHMX7LAb4wxiqn` · *Jordan Water Sector Operational Risk & GIS Platform (`Water VVARD`)*
- **Resolved Polarity & Palette (`0% purple`)**: **Dark Precision Graphite + Cyan** (`#0B0F14` surface, `#111827` cards, `#E2E8F0` ink, `#06B6D4` Disi-to-Amman conveyor cyan, `#10B981` nominal value-chain glow, `#EF4444` incident glow, `#F59E0B` turbidity/pressure warning).
- **Primary `SaaS/` Hero References**:
  1. **Pair `#08` (`vercel-visactor-dashboard/desktop.jpg` + `mobile.jpg`)**: Steers the midnight-slate (`#020817` → `#0B0F14`) continuous `1px` hairline border-grid layout, 180° arc/risk gauges, and crisp mobile `2×2` top status reflow!
  2. **Pair `#05` (`shadcnblocks-project-management/desktop.jpg` + `mobile.jpg`)**: Steers the `48px` collapsible left icon rail (unlocking instant **TV Kiosk Mode** & full-screen GIS expansion), underline module tabs (`Overview | Disi GIS | SCADA Incidents | 5×5 Bowtie | 6-Artifact Explorer`), and right contextual telemetry inspector!
- **Local + Google + Motion Stack Synergy**: Pair with local **Vercel Geist (`--ds-*`)** / **Fieldrig** tokens + **Google Cloud Console (Pantheon dark)** density + `motion/react` (`pathLength` pipeline flow pulse, subtle green/red box-shadow state transitions on the 4 Value-Chain hero boxes, GPU `translateX` bottom incident ticker).
- **Desktop, Mobile & Code Snippet Execution Rules**:
  - *Desktop*: Collapsible rail + top Kiosk/Scenario simulation bar (`Trigger Incident`, `National Power Outage`) + 4 Value-Chain cards + split Disi-to-Amman topographic GIS canvas & tabbed SCADA/5×5 Bowtie panel + sticky bottom chime ticker.
  - *Mobile (`393px`)*: Use Pair `#03`/`#08` `2×2` grid for the 4 Value-Chain glow tiles above an upper-half interactive GIS map and lower tabbed operational sheet.

#### Prompt `#02` (`slot-2`) — `IbwVQJJ3hk4FEh35a2XLDM` · *Data Center GIS Site Screener & Scoring Platform (PJM, ERCOT & Canary Islands)*
- **Resolved Polarity & Palette (`0% purple`)**: **Light Crisp Slate** (`#F8FAFC` surface, `#FFFFFF` panels, `#0F172A` ink, `1px` `#E2E8F0` borders, `#0284C7` cobalt accent, `#059669` headroom pass, `#D97706` queue warning, `#DC2626` flood/wetland setback breach, `tabular-nums`).
- **Primary `SaaS/` Hero References**:
  1. **Pair `#09` (`vercel-visactor-dashboard/desktop-light.jpg` + `mobile-light.jpg`)**: Steers the crisp daylight `#FFFFFF`/`#F8FAFC` `1px` hairline split-grid geometry, clean multi-metric top strip, and zero-clutter analytical framing.
  2. **Pair `#15` (`dub-analytics/desktop.jpg` + `mobile.jpg`)**: Steers the proportional inline bar-fill rows for the **100-Point Weighted Scorecard** breakdown (Power Deliverability, Environmental Risk, Community Setback) and territory filter pills (`PJM · ERCOT · Canary Islands`).
  3. **Pair `#06` (`vercel-studio-admin/desktop.jpg`)**: Steers the searchable, filterable **RTO/ISO Interconnection Queue** capacity table.
- **Local + Google + Motion Stack Synergy**: Pair with local **Plane (`--pl-*`)** / **Switchyard** tokens + **Google Cloud Console / Earth Engine** geospatial split conventions + **EaseUI `range-slider`** & `motion/react` spring-coupled radar/waterfall score recalculations.

#### Prompt `#03` (`slot-3`) — `38YUfUDWNCA6mWqpyARqx2` · *Value Stream Mapping (VSM) & Manufacturing Workflow App (`Quartz` / Schneider Electric CI)*
- **Resolved Polarity & Palette (`0% purple`)**: **Daylight Quartz Industrial Zinc + Emerald/Teal** (`#F4F4F5` canvas, `#FFFFFF` schematic cards, `#18181B` ink, `#3DCD58` explicit **Schneider Electric Quartz** emerald primary + `#0D9488` flow teal, `#D97706` queue amber, `#DC2626` WIP breach alert).
- **Primary `SaaS/` Hero References**:
  1. **Pair `#18` (`mantine-mantidash/desktop.jpg` + `mobile.jpg`)**: Direct structural cousin for horizontal multi-stage flow lanes (`Lines 1–7` left navigator + horizontal stage-by-stage process cards with C/T, C/O, Uptime, WIP badge pills, and `+` stage actions — upgraded with connected Lean VSM arrows, WIP inventory triangles, and bottom VA/NVA sawtooth timeline!).
  2. **Pair `#02` (`shadcn-admin/desktop-light.jpg` + `mobile-light.jpg`)**: Steers the top 4-card `tabular-nums` KPI summary strip (`Total Lead Time`, `VA Ratio %`, `Takt Time`, `Active WIP Breaches`) + top-right `Export PDF / PNG` CTA button.
- **Local + Google + Motion Stack Synergy**: Pair with local **Switchyard** / **Plane (`--pl-*`)** crisp `1px` industrial borders + **EaseUI `flowchart`** / custom SVG VSM connectors + `motion/react` layout transitions and pulsing red WIP-breach triangle badges. On mobile (`393px`), upgrade `#18`'s horizontal overflow into a clean **vertical stage-by-stage VSM timeline** with sticky bottom VA/NVA summary bar!

#### Prompt `#04` (`slot-4`) — `7GIcIZjV9raU2VB7vBLHZF` · *Photovoltaic Plant Commissioning & PR/PAC Reporting Dashboard (`PSF Moratalla 1` & `2`)*
- **Resolved Polarity & Palette (`0% purple`)**: **Daylight Architectural Stone + Sabit Navy & Solar Orange** (`#F7F7F5` desk backdrop framing crisp `#FFFFFF` A4 Portrait & Landscape sheets, `#0F172A` ink, `#1D4ED8` Sabit corporate navy, `#EA580C` / `#D97706` Sabit solar orange, `#059669` IEC pass, `#DC2626` `Δ --PP` & `€ LDES Penalty` highlight).
- **Primary `SaaS/` Hero References**:
  1. **Pair `#12` (`liveblocks-ai-reports/desktop-light.jpg` + `mobile-light.jpg`)**: **Exact architectural match** — warm off-white outer canvas framing a crisp `1px`-bordered `#FFFFFF` executive report sheet with top project/filter controls, precision Tremor-style bar/trend charts, and strict `tabular-nums` financial/technical tables!
  2. **Pair `#15` (`dub-analytics/desktop.jpg` + `mobile.jpg`)**: Steers clean print-grade card spacing, section headers, and mobile vertical report stacking.
- **Local + Google + Motion Stack Synergy**: Pair with local **Midday (`--md-*`)** / **Ledgermark** fiduciary sheet tokens + **Google Ads/ACX** dense 12-month (`Jan–Dec + Total`) PVSyst & 14-column Landscape Daily PR PAC matrix rules + crisp unboxed dashed-line SVG `PS1–PS7 → PPC → SCADA` schematic.

#### Prompt `#05` (`slot-5`) — `edd6d26fb45d` · *Stunning Horizon UI Executive CEO Telemetry Dashboard*
- **Resolved Polarity & Palette (`0% purple` — Overriding Legacy Horizon Purple)**: **Dark Precision Graphite + Cyan** (`#0B0F14` canvas with `dim: 0.45` cyan ambient radial token glow, `#111822` cards, `#E2E8F0` ink, `"mapPalette": "cyan"` `#06B6D4` 3D globe & arcs across `LON-01`, `IAD-02`, degraded `BOM-01` `#F59E0B`, `SIN-01`, maintenance `TYO-03`, `SYD-01`, `#EF4444` SLA breach).
- **Primary `SaaS/` Hero References**:
  1. **Pair `#04` (`shadcnblocks-payments/desktop.jpg` + `mobile.jpg`)** & **Pair `#03` (`shadcnblocks-ecommerce/desktop.jpg`)**: Steers the ultra-sleek dark bento framing (`48px` collapsible 6-layer topology rail `MESH..BROWSER`, `span-8` hero viewport beside `span-4` `Active alarms` ownership list, 3×`span-4` KPI cards `Availability`, `Satisfaction`, `Throughput`, and segmented `PLATFORM SCORECARDS · EVERY TIER` progress bars).
  2. **Pair `#08` (`vercel-visactor-dashboard/desktop.jpg`)** & **Pair `#23` (`adminlte-operations/desktop.jpg`)**: Steers multi-tier progress/SLA bars (`Success rate %` progress-bar + `—` vs `0` strict telemetry semantics).
- **Local + Google + Motion Stack Synergy**: Pair with local **Vercel Geist (`--ds-*`)** + local zero-dep **`wireframe-globe.tsx` / `three@0.185.1`** interactive auto-rotating 3D Cyan Estate Globe + `motion/react` (`motion@14.9.0`) `NumberTicker` / `SPRING_GLIDE` KPI counters and live arc pulses.

---

### 3.2 Master 37-Prompt (`#01`–`#37`) Hero-Reference Fit Matrix (All 8 Execution Blocks)

| # | Block · Slot | Prompt ID & Title | Polarity & Non-Purple Palette (`<9.5%`) | Primary `SaaS/` Pair (`#01`–`#24`) | Secondary `SaaS/` Pair | Local / Google Token Synergy | Key Execution & Mobile Adaptation Steering |
| :-: | :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | B1 · `slot-1` | `30UuyID6...` Jordan Water GIS & Risk (`Water VVARD`) | **Dark** `#0B0F14` + `#06B6D4` Cyan + RAG glows | **`#08` VisActor Dark** | `#05` Shadcnblocks PM | `Vercel Geist` + `Fieldrig` + Cloud Dark | `48px` Kiosk-collapsible rail, 4 glow boxes (`2×2` mobile), Disi GIS + 5×5 Bowtie tabs, bottom ticker |
| **02** | B1 · `slot-2` | `IbwVQJJ3...` Data Center GIS Site Screener | **Light** `#F8FAFC` + `#0284C7` Cobalt | **`#09` VisActor Light** | `#15` Dub + `#06` Studio | `Plane` + `Switchyard` + Cloud Geo | 3-pane 100vh GIS split, Dub bar-fill 100-pt scorecard, Studio Admin ISO queue table, 55/45 mobile map+sheet |
| **03** | B1 · `slot-3` | `38YUfUDW...` VSM & Manufacturing (`Quartz`) | **Light** `#F4F4F5` + `#3DCD58` Quartz Emerald | **`#18` MantiDash Light** | `#02` Shadcn Light | `Switchyard` + `Plane` + Cloud Console | `Lines 1–7` rail, 4-KPI strip, horizontal VSM lanes + sawtooth ladder (vertical stage stack on `393px` mobile) |
| **04** | B1 · `slot-4` | `7GIcIZjV...` PV Plant PR/PAC Report (`Moratalla 1`) | **Light** `#F7F7F5` + `#1D4ED8` Sabit Navy + `#EA580C` Orange | **`#12` Liveblocks Reports Light** | `#15` Dub Light | `Midday` + `Ledgermark` + Ads ACX | Inset A4 Portrait/Landscape sheets, 12-sensor + 12-mo PVSyst grids, unboxed dashed `PS1–PS7` SVG topology |
| **05** | B1 · `slot-5` | `edd6d26f...` Horizon UI CEO Global Telemetry | **Dark** `#0B0F14` + `#06B6D4` Cyan (`dim:0.45` glow) | **`#04` Shadcnblocks Pay** | `#08` VisActor Dark | `Vercel Geist` + `Shadcnblocks` + `three` | `span-8` 3D Cyan Globe (`6` sites, `5` arcs) + `span-4` Active Alarms + 3 KPIs + Tier Scorecards (`—` vs `0`) |
| **06** | B2 · `slot-1` | `10a3e7a5...` Scientific Facial Resemblance CV Tool | **Light** `#F8FAFC` + `#0284C7` Cobalt | **`#09` VisActor Light** | `#12` Liveblocks Light | `Switchyard` + `Vercel Geist` + Cider | 3-pane scientific Mode A/B inspector: gallery rail, 1:N probe/landmark canvas, quality & cosine audit drawer |
| **07** | B2 · `slot-2` | `579P1hMw...` Cross-Border AI Bookkeeping & Tax | **Light** `#F8FAFC` + `#0284C7` Cobalt + Red-Line Banner | **`#12` Liveblocks Reports Light** | `#06` Studio Light | `Midday` + `Ledgermark` + Ads ACX | Multi-tenant switcher, red-line compliance bar, 5-Agent strip, 4-flow variance matrix, Maker-Checker voucher split |
| **08** | B2 · `slot-3` | `5VaQZLBW...` Binance Futures Quant & Backtest | **Dark** `#090D16` + `#10B981` Emerald + `#EF4444` Ask | **`#21` Tabler Crypto Dark** | `#11` Liveblocks Dark | `Vercel Geist` + `Switchyard` + Fin Console | Top listenKey/MDD kill-switch bar, H1–H7 boolean Trial Ledger, 4-fold OOS PnL waterfall, 4-strategy monitor |
| **09** | B2 · `slot-4` | `g5XwVTXJ...` FP&A & Operational Digital Twin | **Light** `#F7F7F5` + `#1D4ED8` Navy + `#059669` Pass | **`#12` Liveblocks Reports Light** | `#17` Mantine Fin (invert) | `Ledgermark` + `Midday` + Workspace Sheets | `Plan | Forecast | Actual` bar, primary/secondary bottleneck pipeline, multi-period driver P&L + lineage drawer |
| **10** | B2 · `slot-5` | `fFqMaonr...` Crystal Capital Deal OS & Matcher | **Light** `#FAF9F6` Paper + `#0D7A5F` Forest | **`#06` Studio Admin Light** | `#20` Tabler CRM (invert) | `Folio Archive` + `Twenty CRM` | Firm switcher, pinned 11-stage deal matrix, Tier 1–3 mandate-match scorecard + batch outreach drawer |
| **11** | B3 · `slot-1` | `Y82i63B5...` DIFC/KSA Reinsurance Broker ERP | **Light** `#F8FAFC` + `#0284C7` Cobalt | **`#06` Studio Admin Light** | `#12` Liveblocks Light | `Ledgermark` + `Midday` + Ads ACX | DIFC/KSA entity badge, stacked XoL Layer Tower + Lead/Follower signing-down matrix + 3-way fiduciary ledger |
| **12** | B3 · `slot-2` | `w1QEFX9L...` ConexTravel Brazil Corporate T&E | **Light** `#F4F4F5` + `#0D9488` Teal + `#D97706` Amber | **`#12` Liveblocks Reports Light** | `#04` Shadcnblocks Pay (invert) | `Midday` + `Twenty CRM` + GM3 | CNPJ switcher, Receipt OCR split-pane + cost-split sliders, PNR itinerary timeline, OFX card reconciliation |
| **13** | B3 · `slot-3` | `JSOXEwbX...` Garment APS Scheduling & Kitting (`13` u.) | **Light** `#F8FAFC` + `#0284C7` Cobalt + RYG Kitting | **`#09` VisActor Light** | `#12` Liveblocks Light | `Plane` + `Switchyard` + Ads ACX | Highest-unlock prompt (`13`): Line-capacity deficit bridge, weekly load heatmap + IE curve, RYG kitting + AI copilot |
| **14** | B3 · `slot-4` | `TGATY5Ip...` Multi-Store 3PL Inventory Sync | **Light** `#F4F4F5` + `#0D9488` Teal + Safety Switches | **`#06` Studio Admin Light** | `#02` Shadcn Light | `Switchyard` + `Shadcnblocks` + Cloud | Top Emergency Pause / Zero-Out gated switches, regional 3PL aggregation grid, 4-strategy quota simulator |
| **15** | B3 · `slot-5` | `3aurbNCL...` `Rota do Kunta` Fleet & Courier POD | **Light** `#F7F9FC` + `#146EF5` Blue + `#B8F23A` Lime | **`#15` Dub Light** | `#09` VisActor Light | `Fieldrig` + `Civicgate` + GM3 Maps | Strict `1 color = 1 meaning` (`#146EF5`/`#B8F23A`), neutral map + locker radius, mobile full-screen Turn-by-Turn POD |
| **16** | B4 · `slot-1` | `31MvMevs...` Civil Construction Field Ops & CRM | **Light** `#F7F7F5` + `#1D4ED8` Navy + `#059669` Pass | **`#05` Shadcnblocks PM (invert)** | `#18` MantiDash Light | `Fieldrig` + `Twenty CRM` + Workspace | Back-office CRM + Dual-Lane Crew/Asset Gantt paired with mobile Depot Timer + SWMS Pump Checklist + `.doc` export |
| **17** | B4 · `slot-2` | `Dqe5mc1F...` `MARCONDES` Restaurant POS & KDS | **Light** `#FFFFFF` + `#DC2626` Vermilion + `#111827` Ink | **`#03` Shadcnblocks Ecom (invert)** | `#18` MantiDash Light | `Civicgate` + `Shadcnblocks` + GM3 | 6-KPI R$ strip, touch POS modifier grid, 5-lane KDS bump-board (`#18`), composite Açaí BOM + 58mm/80mm thermal ticket |
| **18** | B4 · `slot-3` | `1tOPb7vA...` `Paddle ROX` Venue Floor-Plan & ERP | **Light** `#F8FAFC` + `#0284C7` Cobalt | **`#06` Studio Admin Light** | `#15` Dub Light | `Plane` + `Civicgate` + GM3 | Separated public 2D court map + non-contiguous slot picker vs Admin 2D CAD drag/rotate builder + GCash QR queue |
| **19** | B4 · `slot-4` | `9kgj02pO...` `SolaXs` Offline Mobile Solar Field App | **Light** `#F4F4F5` + `#0D9488` Teal (`390px` primary!) | **`#02` Shadcn `mobile-light.jpg`** | `#06` Studio `mobile.jpg` | `Fieldrig` + `GM3 Mobile` | Mobile-first `390px` notch-safe shell, offline sync pill, pinned Next Visit + 4 comms buttons, 6-tab Job Card + 11-digit NMI |
| **20** | B4 · `slot-5` | `bC1PSolr...` Kuwaiti Arabic Archival OCR Studio | **Light** `#FAF9F6` Paper + `#0D7A5F` Forest (RTL/Arabic) | **`#13` Liveblocks Tracker** | `#12` Liveblocks Light | `Folio Archive` + `Workspace Docs` | RTL/Arabic typography, explicit PDF-vs-printed page #s, dual OCR-vs-inference pills, manuscript + commentary split |
| **21** | B5 · `slot-1` | `3IXx67vT...` `BidReady` GovCon FAR/DFARS & TPRM | **Light** `#F8FAFC` + `#0284C7` Cobalt | **`#06` Studio Admin Light** | `#13` Liveblocks Tracker | `Civicgate` + `Ledgermark` + Cloud GRC | FTC/legal disclaimer banner, Excel RFP AI clause mapper, FAR/DFARS matrix, FAR 52.219-14 50% calculator + TPRM |
| **22** | B5 · `slot-2` | `8Br8hhwL...` Spanish Encrypted Clinical CRF PWA | **Light** `#F6FAF9` Clinical Mint + `#0F766E` Teal (ES) | **`#02` Shadcn Light** | `#09` VisActor Light | `Wardline` + `GM3 Clinical` | 100% Spanish UI, Multi-Study switcher + E2EE/Offline badge, dynamic CRF builder, draggable non-blocking modals |
| **23** | B5 · `slot-3` | `WcdbNYqL...` `SWISSPI` German Creator CRM | **Light** `#F8FAFC` + `#0284C7` Cobalt (DE `Work/Wow`) | **`#06` Studio Admin Light** | `#18` MantiDash Light | `Twenty CRM` + `Fluid Functionalism` | German UI, `Work Mode` dense AHV/audit table (`#06`) ↔ `Wow Mode` 9:16 reel cards & Client Casting Approval portal |
| **24** | B5 · `slot-4` | `YUpjkiei...` `Switch Solar` `SolarPOWER` CPQ & CRM | **Light** `#F7F7F5` + `#1D4ED8` Navy + `#059669` Pass | **`#18` MantiDash Light** | `#12` Liveblocks Light | `Twenty CRM` + `Midday` | 4-step `SolarPOWER` rep CPQ (discreet Adviser margin drawer), Kanban/List pipeline (`#18`), invoice OCR → trade actuals |
| **25** | B5 · `slot-5` | `0dDhByZ8...` Enterprise Multi-Tenant RAG Console | **Light** `#F8FAFC` + `#0284C7` Cobalt | **`#14` Liveblocks Chat** | `#09` VisActor Light | `Vercel Geist` + `Liveblocks` + Cider | Tenant/RBAC bar, chunk-vectorization pipeline ledger, cited RAG split-reader, top-k retrieval hit-testing sandbox |
| **26** | B6 · `slot-1` | `wtnMQd1j...` Credit Bureau Browser-Agent HITL | **Dark** `#0B0F14` + `#06B6D4` Cyan + `#F59E0B` HITL | **`#05` Shadcnblocks PM Dark** | `#10` Vercel Chatbot | `Vercel Geist` + `Liveblocks` + Cider | 3-pane 100vh RPA console: `240px` bureau case queue, live browser stream + step trace, `360px` OTP/HITL & doc stager |
| **27** | B6 · `slot-2` | `eqMJBR64...` `PyHost` Cloud Python PaaS & IDE | **Dark** `#090D16` + `#0EA5E9` Electric Blue + `#10B981` (`<4%` violet) | **`#07` Studio Admin Dark** | `#10` Vercel Chatbot | `Vercel Geist` + `Cider / DevTools` | Fleet dashboard (`#07` sparklines) + 3-pane Python IDE (`requirements.txt`, syntax editor, live terminal) + SSL table |
| **28** | B6 · `slot-3` | `2edTHaoW...` `Al-Hinnawi` Arabic 2D/3D Kitchen CAD | **Light** `#F7F7F5` + `#1D4ED8` Navy + Warm Oak/Marble (RTL) | **`#02` Shadcn Light** | `#18` MantiDash Light | `Civicgate` + `Three.js` + GM3 | RTL Arabic + JOD currency, 2D wall/plumbing plan ↔ 3D kitchen viewport (mobile fullscreen touch + cm keypad) + cut-list |
| **29** | B6 · `slot-4` | `cFIAnbeV...` `Quanta` Architectural Takeoff & BOQ | **Light** `#F4F4F5` + `#0D9488` Teal | **`#13` Liveblocks Tracker** | `#12` Liveblocks Light | `Switchyard` + `Ledgermark` | Minimal `Load Plan` daylight CAD canvas (scale calibration + polygon snap) + right single-col real texture swatch rail + BOQ |
| **30** | B6 · `slot-5` | `6O6nchA6...` `CodeKids` Step-Simulator Coding LMS | **Dual/Light-Dark** `#0B0F14` IDE + Playful Cyan/Amber | **`#10` Vercel Chatbot** | `#09` VisActor Light | `Fluid Functionalism` + `GM3 Edu` | 50/50 100vh split: active-line kid code editor + 2D robot tile grid (`Slow/Normal/Fast` + `Step`), remix badges, parent KPIs |
| **31** | B7 · `slot-1` | `OazFzvOP...` Synchronized Audio SAT & ANOVA Lab | **Light** `#FAF9F6` Paper + `#0D7A5F` Forest | **`#15` Dub Light** | `#12` Liveblocks Light | `Folio Archive` + `Glue` + Classroom | 3 surfaces: school study homepage, Web Audio white-noise/music exam runner (tab-lock), admin proctor + ANOVA charts |
| **32** | B7 · `slot-2` | `04YMLOQJ...` `Certivela Health` HIPAA Telehealth | **Light** `#F6FAF9` Mint + `#0F766E` Clinical Teal | **`#15` Dub Light** | `#02` Shadcn Light | `Wardline` + `Glue` + GM3 | Zero cannabis leaf clichés; geolocation 8-state gate, unbundled OH/PA/NY/MO/MI fee table, HIPAA ID/doc & e-sign portal |
| **33** | B7 · `slot-3` | `SAeQYv87...` `Four Rivers` Multi-Imprint AI Studio | **Dark** `#090D12` Oceanic Black + `#0891B2` Water/Teal | **`#10` Vercel Chatbot** | `#07` Studio Admin Dark | `Folio Archive (Dark)` + `Vercel Geist` | AVAIL & Unorthodox channels, author voice ingestion, 3-pane Reader Study Room + Future-Chapter Retention + magic-link log |
| **34** | B7 · `slot-4` | `sq1ucVE1...` `PULSE` AI Video NLE & Repurposer (`10/10`) | **Dark** `#090D16` Obsidian + `#10B981` Emerald | **`#05` Shadcnblocks PM Dark** | `#18` MantiDash (dark) | `Vercel Geist` + `YouTube Studio` | Highest difficulty (`10/10`): 4-pane multi-track NLE (`9:16`/`16:9` kinetic captions) ↔ 3-stage Repurpose pipeline & calendar |
| **35** | B7 · `slot-5` | `3nmCwYtk...` `Flagit` EN/ES PropTech + Investor Lab | **Light** `#F7F7F5` + `#1D4ED8` Navy + `#059669` Pass | **`#15` Dub Light** | `#12` Liveblocks Light | `Folio Archive` + `Ledgermark` + Glue | EN/ES UK/Spain toggle, parcel/street/500m flag map (`10€–100€` fan-out), Catastro/HM lookup, interactive CAC:LTV Tier Lab |
| **36** | B8 · `slot-1` | `t61frvun...` `SycaPost` African Social + WAF Terminal | **Dual**: `#FFFFFF` + Dark Green/Blush Feed ↔ **Dark** WAF | **`#21` Tabler Crypto Dark** (WAF) | `#01` Shadcn Dark | `Civicgate` + `Switchyard` + Cloud Armor | 3-col 400-char feed (African LLM translate + waveform voice DMs) ↔ Bloomberg-grade WAF anomaly, CIDR/ASN & dry-run sim |
| **37** | B8 · `slot-2` | `281mHFcJ...` Crowdsourced Live RF Radar Telemetry | **Dark** `#0B0F14` + `#06B6D4` Cyan + `#F59E0B` dBm | **`#08` VisActor Dark** | `#21` Tabler Crypto Dark | `Fieldrig` + `Vercel Geist` + Maps Dark | Full-bleed 100vh dark vector radar map, confidence-radius triangulation, RF band decay feed, bottom-right dBm hardware sim |

---

### 3.3 Cross-Cutting Execution Takeaways for All 5 Slot Agents (`slot-1`–`slot-5`)

1. **Always Separate Visual Layout Inspiration from Runtime Code Stack**:
   - Even when steering visual hierarchy from **Tabler (`#19`–`#21`)**, **AdminLTE (`#22`–`#24`)**, **Mantine (`#16`–`#18`)**, **Tremor Raw (`#11`–`#12`)**, or **VisActor (`#08`–`#09`)**, **every standalone React build must strictly obey the canonical offline-ready Golden Template (`React 19.2.3` + `Vite 7.2.4` + `Tailwind v4.1.17` + `lucide-react` + `vite-plugin-singlefile`)** paired with WDA's local `motion/react` (`motion@14.9.0`), `@fluid` (`83` items), `@easeui` (`54` items), and zero-dep SVG chart engines (`mui-x-charts.tsx`) — zero Bootstrap CSS, zero uncached `recharts`/`cobe` imports, zero external CDN leaks.
2. **Adopt the Best Desktop → Mobile (`1800px` → `393px`) Patterns from `SaaS/` and Fix the Documented Anti-Patterns**:
   - **Adopt**: `shadcnblocks-ecommerce/mobile.jpg` (`#03`) & `vercel-visactor-dashboard/mobile.jpg` (`#08`/`#09`) **2×2 compact headline KPI grids** (saves ~350px of mobile vertical scroll over 4 tall stacked cards!); `liveblocks-ai-reports/mobile.jpg` (`#11`/`#12`) **collapsible `Filters ▾` bar**; `shadcnblocks-project-management/mobile.jpg` (`#05`) **top-right contextual inspector drawer button**.
   - **Never Repeat**: Uncollapsed left sidebars on `393px` (`#13`, `#14`), uncollapsed 2-col bottom chart grids (`#16`), or severely truncated `S... #18...` mobile table cells (`#07`).
3. **Never Render Blank Chart Cards**:
   - Where live demos left blank chart boxes due to SSR/hydration glitches (`#01` dark desktop, `#04` payment volume, `#06` light desktop), every WDA execution must render crisp, data-backed SVG/Canvas geometry accentuated by GPU-safe `motion/react` or CSS `linear()` spring transitions.
4. **Enforce `< 9.5%` Purple Pixel Coverage (`0%` Default)**:
   - Strip third-party demo banners (`#19`–`#21`) and remap any stray violet series/badges (`#05`, `#08`, `#20`) onto each prompt's locked cyan, cobalt, emerald, teal, navy, forest, or amber semantic tokens.
