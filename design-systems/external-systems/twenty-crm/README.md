# Twenty CRM Design System (`twenty-ui`)

- **Primary URLs**: [twenty.com](https://twenty.com) · [github.com/twentyhq/twenty](https://github.com/twentyhq/twenty) (`packages/twenty-ui`)
- **Archetype**: High-Density Relational Record Grid, Deal Pipeline Board & Command-First CRM OS
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html)
- **Primary WDA Prompt Match**: **Prompt #10 (`fFqMaonroihCmGZ8w0fAu0` — Institutional Capital Advisory Deal OS & Mandate Matcher / "Crystal Capital Consulting")**, paired with **Folio Archive** (Warm Editorial Paper) & **Ledgermark** (Fiduciary Gates).

---

## 1. Design Philosophy & Structural DNA

**Twenty CRM** (`twentyhq/twenty`) is the leading open-source CRM alternative to Salesforce and HubSpot, engineered with an ultra-clean, Notion-meets-Linear relational record aesthetic (`twenty-ui`). Its visual grammar prioritizes:

1. **Zero-Clutter Record Density**: Spreadsheet-grade inline-editable record grids with `32px–36px` row height, `1px` crisp structural borders (`--t-border-color-light`), and zero unnecessary card chrome.
2. **Typed Relational Cells**: Every table cell or Kanban attribute is a strongly typed primitive: `EntityChip` (avatar + company/deal name), `RelationPill` (linked organization or contact), `StageBadge` (colored dot + semantic pill), `CurrencyCell` (`tabular-nums` right-aligned), and `GateStatusBadge`.
3. **Command-First Navigation (`⌘K`)**: Instant keyboard command bar and right-hand slide-over record inspector drawer (`420px–480px`) that keeps the primary deal matrix or investor rolodex in view.
4. **Cascade Layer Architecture**: Uses `@layer twenty-ui` and `--t-*` CSS custom properties for instant light/dark polarity switching without runtime CSS-in-JS overhead.

---

## 2. Extracted Token Reference (Hex + OKLCH)

### 2.1 Surface, Ink, Border & Accent Tokens

| Token Variable | Semantic Role | Light Mode (Hex) | Light Mode (OKLCH) | Dark Mode (Hex) | Dark Mode (OKLCH) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `--t-background-primary` | Primary table / card surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#141414` | `oklch(0.191 0.000 0)` |
| `--t-background-secondary` | App shell / sidebar canvas | `#FCFCFC` | `oklch(0.991 0.000 0)` | `#1C1C1C` | `oklch(0.226 0.000 0)` |
| `--t-background-tertiary` | Hover row / subtle well | `#F5F5F5` | `oklch(0.970 0.000 0)` | `#242424` | `oklch(0.260 0.000 0)` |
| `--t-background-quaternary` | Active / pressed control | `#EBEBEB` | `oklch(0.940 0.000 0)` | `#2E2E2E` | `oklch(0.301 0.000 0)` |
| `--t-font-color-primary` | Primary record ink | `#171717` | `oklch(0.205 0.000 0)` | `#F5F5F5` | `oklch(0.970 0.000 0)` |
| `--t-font-color-secondary` | Column label / metadata ink | `#474747` | `oklch(0.398 0.000 0)` | `#B3B3B3` | `oklch(0.767 0.000 0)` |
| `--t-font-color-tertiary` | Muted hint / empty cell ink | `#666666` | `oklch(0.510 0.000 0)` | `#808080` | `oklch(0.600 0.000 0)` |
| `--t-border-color-light` | Table cell / row hairline | `#EDEDED` | `oklch(0.946 0.000 0)` | `#262626` | `oklch(0.269 0.000 0)` |
| `--t-border-color-medium` | Control / card outer rim | `#E0E0E0` | `oklch(0.906 0.000 0)` | `#333333` | `oklch(0.321 0.000 0)` |
| `--t-accent-primary` | Focused cell / Tier-1 match | `#1961ED` | `oklch(0.546 0.215 262.8)` | `#3B82F6` | `oklch(0.623 0.188 259.8)` |
| `--t-accent-forest` | Advisory deal / mandate pass | `#0D7A5F` | `oklch(0.528 0.112 168.4)` | `#10B981` | `oklch(0.696 0.149 162.5)` |
| `--t-color-warning` | Compliance gate pending | `#B45309` | `oklch(0.555 0.146 66.4)` | `#FBBF24` | `oklch(0.828 0.165 84.4)` |
| `--t-color-danger` | Gate block / superseded doc | `#DC2626` | `oklch(0.577 0.215 27.3)` | `#F87171` | `oklch(0.704 0.165 22.2)` |

### 2.2 Typography, Spacing & Elevation Scale

- **Font Stack**:
  - Sans (`--t-font-family-sans`): `'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
  - Mono (`--t-font-family-mono`): `'JetBrains Mono', 'IBM Plex Mono', monospace` (`font-variant-numeric: tabular-nums`)
- **Modular Type Scale**:
  - `2xs`: `11px` (`0.6875rem`) — Column type badges, keyboard shortcut caps (`⌘K`)
  - `xs`: `12px` (`0.75rem`) — Table column headers, status pills, timestamps
  - `sm`: `13px` (`0.8125rem`) — Default record cell copy, kanban card attributes, sidebar nav items
  - `md`: `14px` (`0.875rem`) — Drawer field values, primary buttons
  - `lg`–`2xl`: `16px–24px` — View titles, deal dossier headings
- **Spacing & Radii**:
  - Grid unit: `4px` (`2px`, `4px`, `6px`, `8px`, `12px`, `16px`, `24px`, `32px`)
  - Border radii: `4px` (`--t-border-radius-sm` for buttons, chips, inputs), `8px` (`--t-border-radius-md` for cards, kanban columns, modals), `999px` (status pills)
- **Shadow Elevation**:
  - `--t-shadow-super-light`: `0 1px 2px 0 rgba(0, 0, 0, 0.04)` (Kanban cards at rest)
  - `--t-shadow-light`: `0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 0 1px 0 rgba(0, 0, 0, 0.08)` (Buttons, dropdown triggers)
  - `--t-shadow-heavy`: `0 16px 40px -8px rgba(0, 0, 0, 0.16)` (`⌘K` Command Palette & Firm Cloning Wizard Modal)

---

## 3. Core Component Anatomy & Interaction Patterns

1. **Relational Record Data Grid**:
   - Sticky left checkbox + primary entity column (`220px`), typed column headers with icon + label + sort indicator, inline active cell ring (`2px solid var(--t-accent-primary)`), bottom summary aggregation row (`SUM`, `AVG`, `COUNT` in `tabular-nums`).
2. **Multi-Stage Deal Pipeline Board (Kanban)**:
   - Stage header with colored status dot, stage name, deal count badge, and total stage EV in `tabular-nums`. Cards show entity emblem, EV/retainer metrics, relational contact chips, and compliance gate indicator.
3. **Slide-Over Record Inspector & Mandate Matcher**:
   - Tabbed header (`Overview`, `Mandate Matches`, `Fee Gates`, `Data Room Lineage`), property key-value list (`120px` muted label + inline editable value), and 1-click outreach generator.
