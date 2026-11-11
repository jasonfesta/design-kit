# 06. Google SecOps (Chronicle) UNO Design System (`uno` v0.5.27 · Malachite)

- **Carbon Design System ID**: `designSystems/61ce7d9a26ad5429` (`Version v0.5.27` — `https://carbon.googleplex.com/uno/`)
- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/uno/versions/v0_5/sass_css_vars/` (`_uno-ref-palette.scss`, `_uno-sys-color.scss`, `_uno-comp-ide-diff.scss`, `_uno-comp-json-viewer.scss`, `_uno-comp-timeline.scss`, `_uno-comp-table.scss`)
  - `//depot/google3/googlex/security/malachite/g3doc/uno/tokens.md`
  - `//depot/google3/googlex/security/malachite/ui/components/`
- **Internal Documentation**: go/secops-ui-design-tokens · https://carbon.googleplex.com/uno/
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**UNO (`ux/tokens/design_systems/uno`)** is the dark-mode-native design system behind **Google Cloud Security Operations (Chronicle / Malachite SIEM & SOAR)**. Among all Google design systems, UNO is uniquely built for **24/7 dark mission-control, real-time telemetry hunting, WAF/SOC rule execution, and raw structured event inspection**:

1. **Deep Cool-Grey / Chambray Obsidian Hierarchy**: Uses cool blue-graphite dark surfaces (`cool-grey1000` `#12171F` base → `cool-grey950` `#171D26` → `cool-grey900` `#1C242E` cards → `cool-grey850` `#262E3B` elevated headers) with crisp `1px` `cool-grey750` (`#3B4757`) structural dividers (`0% purple`).
2. **4-Tier Threat & Telemetry Severity Scale**: Native semantic severity tokens across `critical` (`#FD7570`), `high` (`#FA903E` Honey), `medium` (`#FCC934`), `low` (`#5DCEDE` Ocean Cyan), and `malachite500` (`#01D667` nominal/live rule pass).
3. **First-Class Technical & Diff Components**: UNO ships dedicated component token sets for `_uno-comp-ide`, `_uno-comp-ide-diff`, `_uno-comp-json-viewer`, `_uno-comp-execute-button`, and `_uno-comp-timeline`.

---

## 2. Verbatim Google3 Token Reference (`v0_5/sass_css_vars`)

| CSS Custom Property | UNO Ref Token | Dark Hex (Default) | Light Hex | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--uno-sys-color--surface` | `cool-grey1000` | `#12171F` | `#F5F8FC` | Primary mission-control & SIEM canvas |
| `--uno-sys-color--surface-container` | `cool-grey900` | `#1C242E` | `#FFFFFF` | Telemetry card, detection table & modal surface |
| `--uno-sys-color--table-row-divider` | `cool-grey750` | `#3B4757` | `#DFE7F2` | `1px` crisp table & split-pane hairlines |
| `--uno-sys-color--primary` | `sky300` | `#8AB4F8` | `#1A73E8` | Execute query CTA, active tab & selected row |
| `--uno-sys-color--success` | `malachite500` | `#01D667` | `#09914B` | Nominal pipeline glow, active detection rule |
| `--uno-sys-color--severity-low` | `ocean400` | `#5DCEDE` | `#098591` | Telemetry stream cyan, informational event |
| `--uno-sys-color--severity-high` | `honey500` | `#FA903E` | `#D15F00` | Degraded node, HITL auth checkpoint warning |
| `--uno-sys-color--severity-critical` | `red400` | `#FD7570` | `#C6221C` | Critical outage, WAF block, kill-switch alert |

---

## 3. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **Google SecOps UNO** for dark mission-control command centers, SCADA/RF telemetry, quant execution terminals, HITL agent consoles, and Edge WAF terminals:
- **`#01` Jordan Water Sector Operational Risk & GIS (`Water VVARD`)**: Dark graphite/cool-grey command shell, `#01D667` Malachite nominal value-chain glow vs `#FD7570` critical outage alert, and SCADA incident timeline.
- **`#05` Stunning Horizon UI Executive CEO Telemetry**: Dark global telemetry bento, `#5DCEDE` ocean-cyan estate arcs, and active alarm triage.
- **`#08` Binance Futures Quant Trading Terminal**: High-density dark order/trial ledger, kill-switch alerts, and live monospace execution logs.
- **`#26` Credit Bureau Browser-Agent HITL Console**, **`#36` SycaPost Edge WAF Terminal**, & **`#37` Crowdsourced Live RF Radar Telemetry**.
