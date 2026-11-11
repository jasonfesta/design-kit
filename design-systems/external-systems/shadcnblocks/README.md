# Shadcnblocks Design System (`shadcnblocks.com` / `@shadcnblocks`)

- **Primary URLs**: [shadcnblocks.com](https://www.shadcnblocks.com) · Registry: `"@shadcnblocks": "https://www.shadcnblocks.com/r/{style}/{name}"`
- **Archetype**: Modular SaaS Section & Application Shell Block Architecture (Bento Scorecards, Data Toolbars, Comparison Matrices & Interactive Feature Stages)
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html)
- **Primary WDA Prompt Matches**:
  - **Prompt #02 (`IbwVQJJ3hk4FEh35a2XLDM` — Data Center GIS Site Screener & Scoring Platform)** — Weighted scorecard bento blocks, multi-layer comparison matrices, and due-diligence checklist cards.
  - **Prompt #04 (`7GIcIZjV9raU2VB7vBLHZF` — Photovoltaic Plant Commissioning & PR/PAC Reporting Dashboard)** — Structured KPI summary ribbons and technical specification bars.
  - **Prompt #05 (`edd6d26fb45d` — Horizon UI Executive CEO Telemetry Dashboard)** — 12-column asymmetric bento grid layout (`span: 8` globe + `span: 4` alarms + `span: 4` × 3 KPI cards).

---

## 1. Design Philosophy & Structural DNA

**Shadcnblocks** (`shadcnblocks.com`) extends the core `shadcn/ui` primitive layer into **complete, compositional macro-blocks** for enterprise SaaS dashboards, technical workbenches, and editorial product pages:

1. **12-Column Asymmetric Bento Grid**: Standardized macro-containers (`col-span-8`, `col-span-4`, `col-span-6`, `row-span-2`) separated by `1px` structural borders (`--sb-border`) or `16px` grid gaps with subtle dot/line technical canvas backgrounds.
2. **High-Density Data Toolbars & Scorecards**: Pre-composed filter ribbons combining search input, multi-select facet popovers, view-mode segmented controls, and primary export actions in a single `40px` bar.
3. **Zero-Bloat Source Ownership**: Installed via the `shadcn` CLI (`npx shadcn@latest add @shadcnblocks/<block>`) directly into project source trees using semantic CSS variables.

---

## 2. Extracted Token Reference (Hex + OKLCH)

| Token Variable | Semantic Role | Light Mode (Hex) | Light Mode (OKLCH) | Dark Mode (Hex) | Dark Mode (OKLCH) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `--sb-background` | Primary page canvas | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#09090B` | `oklch(0.141 0.005 285.8)` |
| `--sb-surface-muted` | Bento well / secondary surface | `#F8FAFC` | `oklch(0.984 0.003 247.9)` | `#121215` | `oklch(0.184 0.006 285.8)` |
| `--sb-foreground` | Primary heading & metric ink | `#09090B` | `oklch(0.141 0.005 285.8)` | `#FAFAFA` | `oklch(0.985 0.000 0)` |
| `--sb-muted-foreground` | Subtitle / axis label ink | `#52525B` | `oklch(0.442 0.011 285.8)` | `#A1A1AA` | `oklch(0.711 0.006 286)` |
| `--sb-border` | 1px bento & table divider | `#E4E4E7` | `oklch(0.920 0.004 286.3)` | `#27272A` | `oklch(0.274 0.006 286.0)` |
| `--sb-accent-blue` | Engineering / telemetry accent | `#0284C7` | `oklch(0.588 0.148 241.9)` | `#38BDF8` | `oklch(0.752 0.138 232.6)` |
| `--sb-accent-emerald` | Target met / pass threshold | `#059669` | `oklch(0.596 0.145 163.2)` | `#34D399` | `oklch(0.773 0.153 163.2)` |

---

## 3. Core Component Anatomy & Interaction Patterns

1. **Asymmetric Bento Metric Stage**: Combines a primary interactive visual canvas (`8 columns`) with a stacked live exception/alarm feed (`4 columns`) and a 3-up KPI row below.
2. **Weighted Scorecard & Comparison Matrix**: Interactive weight sliders (`0–100%`) dynamically updating composite parcel or tier scores with color-coded progress bars.
3. **Tabbed Feature & Specification Switcher**: Keyboard-accessible pill tabs switching technical schematics, interconnection queues, and compliance checklists.
