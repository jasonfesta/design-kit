# Liveblocks Design System (`liveblocks.io` / `@liveblocks/react-ui`)

- **Primary URLs**: [liveblocks.io](https://liveblocks.io) · [liveblocks.io/docs/api-reference/liveblocks-react-ui](https://liveblocks.io/docs/api-reference/liveblocks-react-ui)
- **Archetype**: Real-Time Multiparty Collaboration, Anchored Canvas Pins & Floating Threads, Blinded Rater Agreement HUD & AI Copilot Tool-Approval Primitives
- **Local Files**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html)
- **Primary WDA Prompt Matches**:
  - **Prompt #06 (`10a3e7a5d0c0` — Scientific Facial Resemblance Biometric Evaluation Tool)** — Dual-canvas landmark pin overlays, blinded human rater agreement (`κ`) annotation threads, and scientific protocol boundary notices.
  - **Prompt #01 (`30UuyID6vHMX7LAb4wxiqn` — Jordan Water Sector Operational Risk & GIS Platform)** — Spatial GIS incident pins, multi-operator presence stack, and anchored facility inspection popovers.
  - **Prompt #07 (`579P1hMwcrtGBFdbfiaE7C` — Cross-Border E-Commerce AI Bookkeeping & Tax SaaS)** — Maker-Checker (`Accountant != Reviewer Supervisor`) approval threads and 5-stage AI agent pipeline cards.
  - **Prompt #09 (`g5XwVTXJI1DOkAJ08QbbRD` — Operational & Financial Business Digital Twin Simulator)** — Collaborative scenario annotations (`Plan` vs. `Forecast` vs. `Actual`) and AI team-builder copilot drawer.

---

## 1. Design Philosophy & Structural DNA

**Liveblocks** (`@liveblocks/react-ui`) provides the canonical UI primitives for real-time collaborative workspaces, spatial canvas annotation, and human-in-the-loop AI copilot workflows:

1. **Scoped `--lb-*` Token Architecture**: Every component inside `.lb-root` inherits `--lb-accent`, `--lb-background`, `--lb-foreground`, `--lb-radius`, and `--lb-spacing`, adapting cleanly to both clinical daylight (`#F8FAFC`) and dark command centers (`#0B0F17`).
2. **Spatial Canvas Pin & Floating Thread (`<FloatingThreads />`)**: Numbered circular/teardrop pins (`24px × 24px`) anchored to exact `(x, y)` coordinates on a map, biometric crop canvas, or financial formula cell, expanding into a floating `.lb-thread` card with `0 8px 30px -4px` elevation.
3. **Multiparty Presence & Maker-Checker Verification**: Live avatar stack with colored ring indicators (`--lb-user-1`..`4`) showing who is inspecting a probe candidate, reviewing a voucher draft, or signing off on a protocol threshold.

---

## 2. Extracted Token Reference (Hex + OKLCH)

| Token Variable | Semantic Role | Light Mode (Hex) | Light Mode (OKLCH) | Dark Mode (Hex) | Dark Mode (OKLCH) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `--lb-surface-canvas` | Workbench background | `#F8FAFC` | `oklch(0.984 0.003 247.9)` | `#0B0F17` | `oklch(0.162 0.015 264.4)` |
| `--lb-background` | Floating thread / card surface | `#FFFFFF` | `oklch(1.000 0.000 0)` | `#14171F` | `oklch(0.204 0.014 264.4)` |
| `--lb-foreground` | Primary comment & metric ink | `#0F172A` | `oklch(0.208 0.040 265.8)` | `#F1F5F9` | `oklch(0.968 0.007 247.9)` |
| `--lb-foreground-secondary` | Rater role / metadata ink | `#475569` | `oklch(0.446 0.038 256.8)` | `#94A3B8` | `oklch(0.704 0.035 256.8)` |
| `--lb-border` | Thread / composer border | `#E2E8F0` | `oklch(0.929 0.013 255.5)` | `#262C3A` | `oklch(0.286 0.017 264.4)` |
| `--lb-accent` | Active pin / cobalt action | `#0284C7` | `oklch(0.588 0.148 241.9)` | `#38BDF8` | `oklch(0.752 0.138 232.6)` |
| `--lb-biometric-teal` | Landmark vector / validated κ | `#0F766E` | `oklch(0.511 0.096 186.4)` | `#2DD4BF` | `oklch(0.785 0.133 181.9)` |

---

## 3. Core Component Anatomy & Interaction Patterns

1. **Anchored Canvas Pin & `.lb-thread` Popover**: Clickable coordinate markers on 2D canvases (68-point facial landmarks, GIS pipelines, VSM nodes) that highlight the linked annotation thread.
2. **Presence Avatar Stack & Rater Agreement Pill**: Overlapping `28px` avatars with active cursor/mode badges (`Mode A: Uncalibrated` vs. `Mode B: Validated κ = 0.84`).
3. **AI Copilot Tool-Approval & Formula Lineage Card**: Structured diff/formula card with explicit `Approve Voucher / Apply Scenario` and `Reject / Flag Discrepancy` human-in-the-loop actions.
