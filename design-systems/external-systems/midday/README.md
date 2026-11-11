# Midday Design System (`midday.ai` / `midday-ui`)

- **Primary URLs**: [midday.ai](https://midday.ai) · [github.com/midday-ai/midday](https://github.com/midday-ai/midday)
- **Archetype**: Minimalist Monochromatic Financial OS, Automated Bookkeeping Inbox, Print-Grade Invoice Sheet & Cash-Flow Runway Studio
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html)
- **Primary WDA Prompt Matches**:
  - **Prompt #04 (`7GIcIZjV9raU2VB7vBLHZF` — Photovoltaic Plant Commissioning & PR/PAC Reporting Dashboard / "PSF Moratalla 1")** — Print-paginated A4 Portrait/Landscape engineering & contractual penalty ledger.
  - **Prompt #07 (`579P1hMwcrtGBFdbfiaE7C` — Cross-Border E-Commerce AI Bookkeeping & Tax SaaS)** — AI voucher inbox matching, Four-Flow consistency matrix, and double-entry audit workbench.
  - **Prompt #09 (`g5XwVTXJI1DOkAJ08QbbRD` — Operational & Financial Business Digital Twin Simulator)** — Coupled driver-based payroll, P&L, and cash-flow matrix with formula lineage inspector.

---

## 1. Design Philosophy & Structural DNA

**Midday** (`midday-ai/midday`) is an open-source financial operating system for businesses that replaces bloated accounting software with a **razor-sharp, typographic, architectural 1px-border ledger aesthetic**:

1. **Monochromatic Structural Honesty**: High-contrast carbon/stone surfaces (`#F7F7F5` / `#FFFFFF` in daylight; `#0C0C0C` / `#121212` in dark mode) where color is strictly reserved for financial reconciliation states (`Reconciled / Balanced`, `Pending Match`, `Red-Line Intercept`).
2. **Monospace Financial Precision**: Every currency figure, tax rate, FX adjustment, and runway delta uses `IBM Plex Mono` / `JetBrains Mono` with `font-variant-numeric: tabular-nums` so decimal points align vertically down every column.
3. **Print-Grade Sheet Architecture**: Invoice and commissioning reports render on literal paper-proportioned sheets (`A4 Portrait` / `A4 Landscape`) with crisphairline rules (`1px solid var(--md-border-subtle)`) and zero decorative fluff.
4. **Inbox-to-Voucher Split Workbench**: Left list of incoming bank/platform transactions + AI confidence score (`98% Match`), paired with a right-hand source document & double-entry voucher inspector.

---

## 2. Extracted Token Reference (Hex + OKLCH)

| Token Variable | Semantic Role | Light Mode (Hex) | Light Mode (OKLCH) | Dark Mode (Hex) | Dark Mode (OKLCH) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `--md-bg-canvas` | App background / stone paper | `#F7F7F5` | `oklch(0.974 0.003 95)` | `#0C0C0C` | `oklch(0.154 0.000 0)` |
| `--md-bg-surface` | Ledger sheet / card surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#121212` | `oklch(0.182 0.000 0)` |
| `--md-bg-subtle` | Table header / muted well | `#F1F1EE` | `oklch(0.957 0.004 95)` | `#1A1A1A` | `oklch(0.218 0.000 0)` |
| `--md-ink-primary` | Primary headline & ledger ink | `#111111` | `oklch(0.178 0.000 0)` | `#F5F5F3` | `oklch(0.969 0.002 95)` |
| `--md-ink-secondary` | Account name / body ink | `#525252` | `oklch(0.442 0.000 0)` | `#A1A1AA` | `oklch(0.711 0.006 286)` |
| `--md-ink-muted` | Timestamp / voucher code ink | `#737373` | `oklch(0.556 0.000 0)` | `#71717A` | `oklch(0.552 0.010 286)` |
| `--md-border-subtle` | 1px architectural cell border | `#E6E6E2` | `oklch(0.923 0.004 95)` | `#222222` | `oklch(0.252 0.000 0)` |
| `--md-border-strong` | Active sheet / section divider | `#D4D4CE` | `oklch(0.868 0.006 95)` | `#333333` | `oklch(0.321 0.000 0)` |
| `--md-accent-cobalt` | Formula link / active filter | `#0284C7` | `oklch(0.588 0.148 241.9)` | `#38BDF8` | `oklch(0.752 0.138 232.6)` |
| `--md-status-reconciled` | Balanced / Four-Flow Pass | `#059669` | `oklch(0.596 0.145 163.2)` | `#34D399` | `oklch(0.773 0.153 163.2)` |
| `--md-status-pending` | Review / FX adjustment due | `#D97706` | `oklch(0.666 0.157 58.3)` | `#FBBF24` | `oklch(0.828 0.165 84.4)` |
| `--md-status-intercept` | Hard red-line block / penalty | `#DC2626` | `oklch(0.577 0.215 27.3)` | `#F87171` | `oklch(0.704 0.165 22.2)` |

---

## 3. Core Component Anatomy & Interaction Patterns

1. **Burn Rate & Cash-Flow Bar/Step Chart**: Crisp monospace axis labels, dashed target threshold lines, hover crosshair tooltip with exact delta breakdown.
2. **AI Transaction & Voucher Matcher**: Side-by-side comparison linking raw bank/customs/platform payouts to generated double-entry accounting vouchers (`Debit` / `Credit` balanced to `0.00`).
3. **Print-Paginated Sheet (`A4 Portrait` / `A4 Landscape`)**: Switchable orientation container with contractual metadata strip, tabular sensitivity matrix, and 1-click PDF export.
