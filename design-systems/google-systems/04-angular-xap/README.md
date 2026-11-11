# 04. Google Angular Material, CDK & XAP Enterprise (`angular_components` · `mat-sys`)

- **Google3 Depot Provenance**:
  - `//depot/google3/javascript/angular2/components/` (`README.md`, `g3doc/theming.md`, `g3doc/angular_cdk.md`, `g3doc/aria.md`, `g3doc/xap_community.md`)
  - `//depot/google3/javascript/angular2/components/enterprise/` (`ace.blueprint`, `extender`, `shortcut_hints`, `code_editor`, `overlay`)
  - `//depot/google3/third_party/javascript/angular_components/` (`_material.scss`, `_cdk.scss`, `LOOKING_FOR_GOOGLE_MATERIAL.md`)
- **Internal Documentation**: go/angular-components · go/angular-components/theming · go/xap-gallery-autopush
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**Google Angular Material, CDK & XAP (`angular_components`)** is the backbone of Google's internal Corp engineering, CRM, finance, compliance, and operations applications. Unlike external open-source Angular Material, Google's internal `@include mat.gm3-theme()` mixin (`theming.md`) ships **extended semantic status tokens** (`--mat-sys-info`, `--mat-sys-success`, `--mat-sys-warning`, `--mat-sys-error`), **compact density scales (`density: -1` to `-4`)**, **Angular CDK** virtual-scroll & overlay primitives, and **ACE / XAP Enterprise** tree-tables, steppers, and form inspectors.

1. **CDK Stepper + Master-Detail Split Workbench**: Pairs a structured horizontal workflow `MatStepper` header with a synchronized left-hand `MatTree` / `CdkTable` hierarchy and a right-hand tabbed `MatFormField` (`appearance="outline"`) property & compliance inspector.
2. **GAR 4 Certified Semantic Status Containers**: Native `info` (`#1157CE` / `#D0E4FF`), `success` (`#006C35` / `#BEEFBB`), `warning` (`#8F4E06` / `#FFE07C`), and `error` (`#B3261E` / `#F9DEDC`) containers pass Google Accessibility Ratings (GAR 4) out of the box (`0% purple`).
3. **Enterprise Density (`-2` / `-3`)**: Compresses standard `56px` inputs and `52px` table rows down to crisp `36px–40px` enterprise controls with inline `shortcut_hints` (`⌘S`, `J/K`).

---

## 2. Verbatim Google3 Token Reference (`g3doc/theming.md`)

| CSS Custom Property | Light Value | Dark Value | Semantic Role |
| :--- | :---: | :---: | :--- |
| `--mat-sys-primary` | `#0B57D0` | `#A8C7FA` | Active stepper node, primary save CTA, focus outline |
| `--mat-sys-secondary-container` | `#C2E7FF` | `#004A77` | Selected tree node, active filter pill |
| `--mat-sys-info-container` | `#D0E4FF` | `#04409F` | Provisional calibration / informational banner |
| `--mat-sys-success-container` | `#BEEFBB` | `#00522C` | Signed contract / approved gate (`#006C35` ink) |
| `--mat-sys-warning-container` | `#FFE07C` | `#6D3A01` | Pending compliance / missing IBAN or SWMS flag |
| `--mat-sys-error-container` | `#F9DEDC` | `#8C1D18` | Validation blocker / hard rejection |
| `--mat-sys-surface` | `#FFFFFF` | `#131314` | Form sheet, tree-table & stepper card surface |
| `--mat-sys-surface-container-low` | `#F8FAFD` | `#1B1B1B` | Outer split-pane workbench background |
| `--mat-sys-outline-variant` | `#C4C7C5` | `#444746` | `1px` outlined form fields, tabs & table dividers |

---

## 3. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **Google Angular Material, CDK & XAP** for structured multi-step workflows, B2B CRMs, BOQ/takeoff hierarchies, and 3-pane scientific/compliance inspectors:
- **`#06` Scientific Facial Resemblance Biometric Evaluation Tool**: 3-pane inspector (`Mode A` vs `Mode B` tabs), `info`/`warning` quality-gate banners, and monospace model-hash badges.
- **`#10` Crystal Capital 11-Stage Deal OS** & **`#23` Swiss Influencer Agency German CRM (`SWISSPI`)**: `MatStepper` deal pipelines, searchable comboboxes, and structured canton/AHV/IBAN compliance forms.
- **`#16` Civil Construction Field Ops & BOQ**, **`#18` Pickleball Venue ERP**, & **`#29` Quanta Quantity Takeoff**: Hierarchical WBS/BOQ tree-tables paired with live parameter drawers.
