# 02. Google Cloud Console / Pantheon & Cloud Matter (`cm4` · `cfc`)

- **Carbon Specification**: `https://carbon.googleplex.com/cloud-platform/` (`Cloud Matter 3.1 / CM4`)
- **Google3 Depot Provenance**:
  - `//depot/google3/cloud/console/web/common/cloud_matter/themes/cm4/` (`_color.scss`, `_palette.scss`, `_typography.scss`, `_components.scss`)
  - `//depot/google3/cloud/console/web/common/cloud_matter/themes/cm3_1/_color.scss` (`--cm-sys-color-*` `light-dark()` custom properties)
  - `//depot/google3/cloud/console/web/common/styles/` (`_colors.scss`, `shell.scss`, `awesomecharts_cm3.scss`)
  - `//depot/google3/cloud/console/web/common/resource_table/` & `//depot/google3/cloud/console/web/common/components/` (Pantheon Common Components — PCC)
  - Scuba Goldens: `//depot/google3/cloud/console/web/common/cloud_matter/themes/scuba_goldens/table_with_filter__cm4_chrome-linux.png`
- **Internal Documentation**: go/pantheon-new-application · go/pan-use-tokens · go/pcc-scorecard
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**Pantheon / Cloud Matter (`cm4` / `cfc`)** powers 200+ Google Cloud Platform consoles (Compute Engine, GKE, BigQuery, Spanner, Vertex AI, Cloud Networking, IAM). It is Google's gold-standard **high-density technical & enterprise infrastructure workbench**:

1. **4-Tier Enterprise Chrome**:
   - `48px` **Universal Console Bar** with Project Selector pill (`project=us-grid-04`), omnibox search, Cloud Shell trigger, and polarity toggle.
   - `44px` **Universal Breadcrumbs & Action Bar** (`+ CREATE`, `REFRESH`, `EXPORT`, destructive actions) pinned directly above the workspace.
   - `232px` **Section Navigation Rail** (`--cm-sys-color-backdrop` `#FAF9F9` / `#0F0F0F` with `#DCF1FF` / `#192967` active item pill).
   - **3-Pane Split Workspace**: Filter-chip **Pantheon Resource Table** (`34px` compact rows) paired with a non-blocking right-hand **Resource Details / YAML Inspector Drawer**.
2. **1px Subpixel Hairlines & Compact `13px` Type**: Replaces plush padding with `1px` `rgba(0,0,0,0.09)` (`rgba(255,255,255,0.12)` dark) hairlines, `4px–8px` crisp corner radii, and `13px` body / `12px` `Roboto Mono` resource IDs & `tabular-nums` capacity metrics.

---

## 2. Verbatim Google3 Token Reference (`cm3_1/_color.scss`)

| CSS Custom Property | Light Value | Dark Value | Semantic Role |
| :--- | :---: | :---: | :--- |
| `--cm-sys-color-backdrop` | `#FAF9F9` | `#0F0F0F` | Outer console shell & section navigation rail |
| `--cm-sys-color-surface` | `#FFFFFF` | `#1C1C1C` | Primary resource table, card & inspector surface |
| `--cm-sys-color-container` | `#F2F0F0` | `#171717` | Table header band & inset filter container |
| `--cm-sys-color-container-primary` | `#DCF1FF` | `#192967` | Filter chips, active nav row, selected table row |
| `--cm-sys-color-primary-on-container` | `#2051DA` | `#BBE2FF` | Resource hyperlinks, active tab & focus indicator |
| `--cm-sys-color-hairline` | `rgba(0,0,0,0.09)` | `rgba(255,255,255,0.12)` | `1px` table row, toolbar & drawer dividers |
| `--cm-sys-color-status-success` | `#2A9C00` | `#64C800` | Healthy instance, passing SLA & provisioned state |
| `--cm-sys-color-status-warning` | `#9E3D02` | `#FDD663` | Interconnection queue warning, throttling notice |
| `--cm-sys-color-status-error` | `#DE2D29` | `#FF4C45` | Quota breach, unhealthy node, failed deployment |

---

## 3. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **Pantheon / Cloud Matter** for multi-resource infrastructure consoles, capacity/interconnection queues, ERP matrices, GRC control planes, and PaaS containers:
- **`#02` Data Center GIS Site Screener & RTO/ISO Queue**: 3-pane split workbench, filterable PJM/ERCOT queue table, capacity progress bars, and right-side underwriting inspector.
- **`#03` Quartz Industrial VSM & Manufacturing Workflow**: Crisp `1px` bordered industrial node cards, `Lines 1–7` section rail, KPI action bar, and non-blocking right-hand parameter drawer.
- **`#13` Garment Production APS (`13` cluster unlocks)** & **`#14` Multi-Store Inventory Sync**: High-density SKU/line allocation tables, traffic-light status badges, and emergency sync overrides.
- **`#21` BidReady GovCon FAR/DFARS GRC Cockpit** & **`#27` PyHost Cloud PaaS Control Plane**: Multi-tenant compliance matrices, container deployment logs, and IAM/quota drawers.
