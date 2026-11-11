# 03. Google Ads & Play Console ACX Design System (`acx2` · `acx/css/gm`)

- **Google3 Depot Provenance**:
  - `//depot/google3/ads/acx2/` & `//depot/google3/ads/acx2/g3doc/` (`index.md`, `components.md`, `dev/sass/styles.md`)
  - `//depot/google3/third_party/dart_src/acx/css/gm/` (`_color.scss`, `_color_dark.scss`, `_density.scss`, `_elevation.scss`, `_typography.scss`)
  - `//depot/google3/ads/acx/components/` (Material Table, Scorecard, DateRangePicker, BulkEditDrawer)
  - `//depot/google3/ux/tokens/design_systems/xgads/` (Next-gen Ads token synchronization)
- **Internal Documentation**: go/acx · go/acx-gallery · go/acx-css · go/acx-gm-gallery · go/why-acx
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**ACX Web (`acx2`)** powers Google's highest-revenue, highest-column-count financial and analytical applications: **Google Ads (AWFE)**, **Google Play Console**, **Google Ad Manager**, **Search Ads 360 (DS3)**, **Dory**, and **Snippets**. Where consumer Material prioritizes whitespace, ACX is engineered for **zero-waste tabular financial precision**:

1. **Color-Keyed Multi-Metric Scorecard Ribbon**: Top horizontal strip of selectable KPI cards where active series cards carry a `3px` top/bottom color bar (`#1A73E8` Blue vs `#007B83` Teal vs `#F29900` Amber) synced directly to a dual-axis comparison chart (`Period A vs Period B`).
2. **4-Step Mathematical Density Ladder (`_density.scss`)**: Uses `$grid` (`4px`) multipliers (`$height-zero: 56px`, `$height-one: 48px`, `$height-two: 36px`, `$height-three: 28px`) with pseudo-element `clickTargetArea` expansion so `28px–36px` table rows maintain ergonomic click/touch precision.
3. **Frozen-Total Material Tables & Inline Bulk Editing**: Right-aligned `tabular-nums` currency/percentage columns, pinned **Total / Portfolio Summary** rows, inline hover-pencil cell editing, and GAR-verified ochre warning callouts (`$warning-icon-filled: #a85d00`).

---

## 2. Verbatim Google3 Token Reference

| CSS Custom Property | Google3 ACX Source | Light Hex | Dark Hex | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--acx-sys-color-canvas` | `color_palette.$grey-50` | `#F8F9FA` | `#17181B` | Outer workspace & report canvas |
| `--acx-sys-color-surface` | `color_palette.$surface` | `#FFFFFF` | `#202124` | Scorecard ribbon, chart stage & Material Table |
| `--acx-sys-color-border` | `color_palette.$grey-300` | `#DADCE0` | `#3C4043` | `1px` crisp cell, scorecard & toolbar borders |
| `--acx-sys-color-primary` | `color_palette.$blue-600 / 300` | `#1A73E8` | `#8AB4F8` | Primary metric series, selected tab & bulk CTA |
| `--acx-sys-color-series-teal` | `color_palette.$cyan-900 / 400` | `#007B83` | `#4ECDE6` | Secondary comparison metric series |
| `--acx-sys-color-positive` | `color_palette.$green-600 / 300` | `#1E8E3E` | `#81C995` | Reconciled ledger, positive ROAS / `Δ%` gain |
| `--acx-sys-color-warning` | `_color.scss $warning-icon-filled` | `#A85D00` | `#FDD663` | GAR-passing ochre policy/variance warning |
| `--acx-sys-color-negative` | `color_palette.$red-600 / 300` | `#D93025` | `#F28B82` | Hard red-line interception, contractual penalty |

---

## 3. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **ACX** whenever a prompt demands spreadsheet-grade `tabular-nums` density, multi-entity accounting, variance (`Δ%` / `Δ PP`) auditing, or financial forecasting:
- **`#04` Photovoltaic Plant Commissioning & PR/PAC Reporting (`PSF Moratalla 1`)**: 12-month PVSyst vs SCADA `tabular-nums` variance tables, red `Δ --PP` deltas, and `€` LDES penalty scorecards.
- **`#07` Cross-Border E-Commerce AI Bookkeeping & Tax SaaS**: Four-flow voucher reconciliation table, double-entry debit/credit columns, and hard red-line (`#D93025`) tax compliance interceptions.
- **`#09` Operational & Financial Business Digital Twin Simulator**: Driver-based P&L / Cash / Payroll matrix with period comparison sparklines and bottleneck flags.
- **`#11` Multi-Entity Reinsurance Broker ERP**, **`#12` ConexTravel Multi-CNPJ T&E Ledger**, & **`#24` Solar CPQ & Job Costing**: Multi-currency/entity ledgers, frozen totals rows, and inline margin editing.
