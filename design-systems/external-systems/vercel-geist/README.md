# Vercel Templates & Geist Design System (`vercel.com/design` · `vercel.com/templates`)

- **Primary URLs**: [vercel.com/design](https://vercel.com/design) · [vercel.com/templates](https://vercel.com/templates)
- **Archetype**: Swiss Precision Developer & Telemetry Studio, 10-Step P3/OKLCH Color Scale, Shadow-as-Border Cards & Real-Time Observability Grids
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html)
- **Primary WDA Prompt Matches**:
  - **Prompt #01 (`30UuyID6vHMX7LAb4wxiqn` — Jordan Water Sector Operational Risk & GIS Platform / "Water VVARD")** — Dark telemetry command center, glowing status cards (Green normal vs. Red incident outage), and live incident ticker.
  - **Prompt #05 (`edd6d26fb45d` — Horizon UI Executive CEO Telemetry Dashboard)** — Global command center with cyan 3D Earth globe (`mapPalette: "cyan"`), active alarms triage, Apdex/Availability headline cards, and tier scorecards.
  - **Prompt #06 (`10a3e7a5d0c0` — Scientific Facial Resemblance Biometric Evaluation Tool)** — Versioned artifact hash badges, precision calibration curve diagnostics, and monospace metric inspectors.
  - **Prompt #08 (`5VaQZLBWPnG4vNHTsvFfXz` — Binance Futures Quant Trading & Research Dashboard)** — Dark execution terminal, WebSocket TTL countdown badges, H1–H7 trial ledger, and live Algo order state-transition logs.

---

## 1. Design Philosophy & Structural DNA

**Vercel Geist** (`vercel.com/design`) is the gold standard for technical infrastructure, observability, and quantitative terminals:

1. **10-Step Functional Color Scale (`--ds-gray-100` to `1000`)**:
   - Steps `100–300`: Component backgrounds (rest, hover, active).
   - Steps `400–600`: Hairline borders, structural grid intersections (`+` crosshairs), and focus rings.
   - Steps `700–800`: High-contrast solid fills.
   - Steps `900–1000`: Secondary and primary typographic ink.
2. **Shadow-as-Border (`0 0 0 1px`)**: Uses subpixel alpha box-shadows (`--ds-shadow-border`) instead of coarse CSS borders so curved corners blend seamlessly with dark obsidian (`#0A0A0A`) or crisp porcelain (`#FFFFFF`) canvases.
3. **Swiss Typographic Compression + Tabular Monospace**: Tight negative tracking (`-0.03em`) on headings paired with `Geist Mono` / `JetBrains Mono` (`tabular-nums`) for every latency readout (`rpm`, `ms`, `bps`, `s_cos`).

---

## 2. Extracted Token Reference (Hex + OKLCH)

| Token Variable | Semantic Role | Dark Mode (Hex) | Dark Mode (OKLCH) | Light Mode (Hex) | Light Mode (OKLCH) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `--ds-background-100` | Primary page canvas | `#0A0A0A` | `oklch(0.145 0.000 0)` | `#FFFFFF` | `oklch(1.000 0.000 0)` |
| `--ds-background-200` | Sunken telemetry well | `#111111` | `oklch(0.178 0.000 0)` | `#FAFAFA` | `oklch(0.985 0.000 0)` |
| `--ds-gray-100` | Card / control rest fill | `#171717` | `oklch(0.205 0.000 0)` | `#F2F2F2` | `oklch(0.958 0.000 0)` |
| `--ds-gray-400` | Default border step | `#2E2E2E` | `oklch(0.301 0.000 0)` | `#EAEAEA` | `oklch(0.937 0.000 0)` |
| `--ds-gray-900` | Secondary telemetry ink | `#A1A1A1` | `oklch(0.712 0.000 0)` | `#666666` | `oklch(0.510 0.000 0)` |
| `--ds-gray-1000` | Primary display & data ink | `#EDEDED` | `oklch(0.946 0.000 0)` | `#171717` | `oklch(0.205 0.000 0)` |
| `--ds-cyan-500` | Globe / GIS / regime cyan | `#06B6D4` | `oklch(0.715 0.143 215.2)` | `#0891B2` | `oklch(0.609 0.126 221.7)` |
| `--ds-blue-500` | Primary interactive blue | `#0070F3` | `oklch(0.580 0.220 258.5)` | `#0070F3` | `oklch(0.580 0.220 258.5)` |
| `--ds-green-500` | Operational / normal glow | `#10B981` | `oklch(0.696 0.149 162.5)` | `#059669` | `oklch(0.596 0.145 163.2)` |
| `--ds-amber-500` | Degraded / maintenance warn | `#F59E0B` | `oklch(0.769 0.165 70.1)` | `#D97706` | `oklch(0.666 0.157 58.3)` |
| `--ds-red-500` | Critical outage / kill-switch | `#EF4444` | `oklch(0.637 0.208 25.3)` | `#DC2626` | `oklch(0.577 0.215 27.3)` |

---

## 3. Core Component Anatomy & Interaction Patterns

1. **Grid-Crosshair Bento Stage**: Cards framed by `1px` hairlines with `8px × 8px` `+` SVG crosshairs at structural intersections.
2. **Real-Time Telemetry Sparkline & Status Pill**: Live pulsing status dot (`6px`), monospace throughput counter (`42,810 rpm`), P95 latency bar, and hover scrubbers.
3. **Artifact Hash & Stream TTL Pill**: Compact monospace pill (`RetinaFace-R50 · sha256:8f4a` or `WS 23h 58m · listenKey 54m`) with 1-click copy and live countdown.
