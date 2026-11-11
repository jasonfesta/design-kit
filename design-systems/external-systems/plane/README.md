# Plane Design System (`plane.so` / `@makeplane/propel` / `@plane/ui`)

- **Primary URLs**: [plane.so](https://plane.so) · [github.com/makeplane/plane](https://github.com/makeplane/plane) (`packages/propel`, `packages/ui`)
- **Archetype**: High-Density Project & Operations Workbench, Split-Pane Inspector, Cycle Burndown & Process Bottleneck Canvas
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html)
- **Primary WDA Prompt Matches**:
  - **Prompt #02 (`IbwVQJJ3hk4FEh35a2XLDM` — Data Center GIS Site Screener & Scoring Platform)** — Locked-100vh split-pane engineering workbench with collapsible left scorecard tuner, central vector stage, and right-hand underwriting dossier.
  - **Prompt #03 (`38YUfUDWNCA6mWqpyARqx2` — Value Stream Mapping Dashboard & Manufacturing Workflow App)** — Multi-line process navigator, VSM schematic node cards, WIP limit breach badges, and slide-over process input form.
  - **Prompt #09 (`g5XwVTXJI1DOkAJ08QbbRD` — Operational & Financial Business Digital Twin Simulator)** — Stage-to-stage operational capacity flow and dual-bottleneck highlighting.

---

## 1. Design Philosophy & Structural DNA

**Plane** (`makeplane/plane`) is an open-source operational and project management platform built around the **Propel (`@makeplane/propel`)** design system. Its architecture excels at dense multi-view operational workflows:

1. **Locked-100vh Split-Pane Topology**: Slim collapsible left navigation rail (`220px–260px`), top view-switcher & filter ribbon (`48px`), primary interactive workspace canvas (List, Kanban, Gantt/VSM Flow, or GIS Split), and a non-blocking right-hand slide-over inspector (`380px–440px`).
2. **State-Ring & Priority Micro-Glyphs**: Every work item, substation parcel, or manufacturing stage carries a 14px SVG state ring (Backlog dotted, Started half-filled amber, Completed emerald check, Breach pulsing red) and a 3-bar signal priority icon.
3. **Instant View Switching**: Seamless state preservation when switching the same dataset between **Spreadsheet List**, **Kanban Board**, **Process Flow Canvas**, and **Analytics Burndown**.

---

## 2. Extracted Token Reference (Hex + OKLCH)

| Token Variable | Semantic Role | Light Mode (Hex) | Light Mode (OKLCH) | Dark Mode (Hex) | Dark Mode (OKLCH) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `--pl-bg-surface-1` | Primary card / inspector surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#111318` | `oklch(0.186 0.011 264.4)` |
| `--pl-bg-surface-2` | App canvas / board background | `#F8FAFC` | `oklch(0.984 0.003 247.9)` | `#161920` | `oklch(0.212 0.013 264.4)` |
| `--pl-bg-surface-3` | Well / filter chip background | `#F1F5F9` | `oklch(0.968 0.007 247.9)` | `#1E222B` | `oklch(0.251 0.015 264.4)` |
| `--pl-text-primary` | Primary item title & metric ink | `#0F172A` | `oklch(0.208 0.040 265.8)` | `#F1F5F9` | `oklch(0.968 0.007 247.9)` |
| `--pl-text-secondary` | Property value / body ink | `#334155` | `oklch(0.372 0.039 257.3)` | `#CBD5E1` | `oklch(0.869 0.020 252.9)` |
| `--pl-text-tertiary` | Issue ID (`VSM-104`) / muted ink | `#64748B` | `oklch(0.554 0.041 257.4)` | `#94A3B8` | `oklch(0.704 0.035 256.8)` |
| `--pl-border-subtle` | Row / card structural border | `#E2E8F0` | `oklch(0.929 0.013 255.5)` | `#262B36` | `oklch(0.286 0.017 264.4)` |
| `--pl-accent-primary` | Active tab / cobalt selection | `#0284C7` | `oklch(0.588 0.148 241.9)` | `#38BDF8` | `oklch(0.752 0.138 232.6)` |
| `--pl-accent-teal` | Process / Takt flow accent | `#0D9488` | `oklch(0.600 0.118 184.7)` | `#2DD4BF` | `oklch(0.785 0.133 181.9)` |
| `--pl-state-completed` | Pass / OEE target met | `#059669` | `oklch(0.596 0.145 163.2)` | `#34D399` | `oklch(0.773 0.153 163.2)` |
| `--pl-state-started` | WIP warning / queue wait | `#D97706` | `oklch(0.666 0.157 58.3)` | `#FBBF24` | `oklch(0.828 0.165 84.4)` |
| `--pl-state-urgent` | WIP breach / primary bottleneck | `#DC2626` | `oklch(0.577 0.215 27.3)` | `#F87171` | `oklch(0.704 0.165 22.2)` |

---

## 3. Core Component Anatomy & Interaction Patterns

1. **Multi-Facet Filter & Display Bar**: Pill chips for `State`, `Priority`, `Line / Territory`, and `Threshold Breach`, with instant live count badges.
2. **Process Node & Cycle Cards**: Compact `6px`-radius cards with top monospace ID (`LINE-03 · STG-2`), title, cycle metrics (`C/T`, `C/O`, `Uptime %`, `WIP`), and bottom status pills.
3. **Slide-Over Detail & Parameter Inspector**: Live sliders and numeric inputs that immediately recompute downstream lead time, composite site score, or bottleneck capacity.
