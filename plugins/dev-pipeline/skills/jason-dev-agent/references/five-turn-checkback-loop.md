# The Dev Flywheel: Automated 5-Turn Source Check-Back Loop Specification
## Continuous In-Loop Refinement Against Reference Comp, Style Kit & Inspiration (40-Minute Timeout)

- **Author**: Principal Software Engineer, Google AI & Frontend Systems
- **Target**: `jason-dev-agent`
- **Location**: Executed immediately after Step 7 (`interaction & feel`) and before Step 8 (`golden-template`)
- **CLI Runner**: `python3 /usr/local/google/home/jfesta/design-kit/skills/jason-dev-agent/scripts/run_checkback_loop.py` (aliased as `run_dev_flywheel.py`)
- **Safety Limits**: Maximum cycles: 5 (`--max-cycles=5`) · Hard wall-clock timeout: **40 minutes / 2400 seconds** (`--timeout-seconds=2400`)

---

## 1. Motivation & Architecture

The **Dev Flywheel** is the developer equivalent of the design flywheel. Where the design flywheel prompt-steers concept plates, the dev flywheel is an **automated code-refinement engine** that continuously tests, diagnoses, and patches the live React DOM until all 5 source check-back gates pass.

It cross-references the live built DOM against **three canonical sources of truth**:
1. **The Reference Comp Plate**: `concepts/<slug>.png` or `nano/<slug>.png` (spatial layout, visual weight, element boundaries).
2. **The Style Kit & Domain State**: `style-direction/*.md`, `typography-and-color.md`, and `canon.md` (Google Font pairings, semantic color tokens, modular type scale, domain copy).
3. **Screen Captures & Inspiration**: `research/captures/` and `inspiration/` (fullpage DevTools captures, tout card patterns, micro-spacing, avatar stacks, button optical padding).

---

## 2. Dev Flywheel Execution Lifecycle

```text
┌────────────────────────────────────────────────────────────────────────┐
│             STEP 7: INTERACTION & FEEL COMPLETED (PASS)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             DEV FLYWHEEL INITIALIZATION & TIMEOUT MONITOR              │
│  • Start wall-clock timer (t=0)                                        │
│  • Enforce hard 40-minute ceiling (timeout <= 2400s)                   │
│  • Loop until ALL 5 checks pass or timeout/cycle ceiling reached       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               │
┌─────────────────────────────────────────────────────────────────┐ │
│ THE 5 CONTINUOUS CHECK-BACK TARGETS                             │ │
│ --------------------------------------------------------------- │ │
│ 1. Grid Geometry & Container Scale vs. Reference Comp Plate     │ │
│    • Container max-widths, flex/grid tracks, section heights    │ │
│ 2. Typography Anatomy & Modular Scale vs. Style Kit & Fonts     │ │
│    • Primary H1-H3, Secondary body, Tertiary <=15%, line-height │ │
│ 3. Chromatic Polarity & Materiality vs. Style Kit & Comp        │ │
│    • 90/10 polarity, border opacities, WCAG 2.2 AA contrast     │ │
│ 4. Micro-Spacing & Tout Architecture vs. Screen Captures        │ │
│    • 2:1 button optical padding, badge pills, 0 middle dots (·) │ │
│ 5. Full Regression Audit & Convergence Verification             │ │
│    • s_total >= 0.93, 0 collisions, 0 dead controls, bundle     │ │
└───────────────────────────────┬─────────────────────────────────┘ │
                                │                                   │
              ┌─────────────────┴─────────────────┐                 │
              ▼                                   ▼                 │
     [ANY CHECK FAILED]                  [ALL 5 CHECKS PASS]        │
              │                                   │                 │
              ▼                                   ▼                 │
    • Apply automated patches            • Emit checkback_audit     │
    • Recompile bundle (npm run build)   • DEV FLYWHEEL CONVERGED   │
    • Check elapsed time (< 2400s)                │                 │
    • REPEAT FLYWHEEL CYCLE                       │                 │
              │                                   │                 │
              └───────────────────────────────────┘                 │
                                                                    │
                                ┌───────────────────────────────────┘
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│       PROCEED TO STEP 8: GOLDEN-TEMPLATE LINT & VERIFY_HTML_BUNDLE     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The 5 Check-Back Targets & Tolerances

### Target 1: Grid Geometry & Container Scale
- **Source of Truth**: Original Reference Comp Plate (`concepts/<item-slug>.png`).
- **Inspection**: Container max-widths (`max-w-7xl`, `max-w-6xl`), outer margins (`px-4 sm:px-6 lg:px-8`), flex/grid tracks, and section heights.
- **Pass Criteria**: AutoRaterV1 cell alignment score $s_{total} \ge 0.85$ floor ($0.93$ target), zero content clipping.

### Target 2: Typography Anatomy & Modular Scale
- **Source of Truth**: Style Kit (`style-direction/*.md`, `typography-and-color.md`, Google Fonts catalog).
- **Inspection**: Primary font restricted to H1–H3; Secondary font on body copy, table cells, form inputs, and nav items; Tertiary font capped at $\le 15\%$; line heights $\ge 1.5$ on body copy; `tabular-nums` on KPI and metrics counters.
- **Pass Criteria**: `eval-font-pairing.py` passes with zero fallback font leaks and role lock $\ge 90\%$.

### Target 3: Chromatic Polarity & Surface Materiality
- **Source of Truth**: Style Kit (`style-direction/*.md`) & Reference Comp.
- **Inspection**: 90/10 Rule (90% dominant neutral foundation, 10% high-intent chromatic accent), translucent border opacities (`border-white/10` or `border-zinc-200/80`), backdrop blurs (`backdrop-blur-md`), and WCAG AA contrast ($\ge 4.5:1$ body, $\ge 3:1$ large text).
- **Pass Criteria**: `eval-accessibility.py` reports zero contrast violations across all surfaces.

### Target 4: Micro-Spacing & Tout Component Architecture
- **Source of Truth**: Researched Screen Captures (`research/captures/`, `inspiration/`).
- **Inspection**: Button optical padding ($2:1$ horizontal-to-vertical padding ratio, e.g. `px-4 py-2` or `px-5 py-2.5`), badge pill rounding, avatar stacks (`-space-x-2`), icon gaps (`gap-1.5` to `gap-2`), and **hard ban on AI middle dots (`·` / `•`)**.
- **Auto-Remediation**: The flywheel automatically cleans stray middle dots in component files in favor of clean CSS spacing.
- **Pass Criteria**: Component source files verify zero banned middle dots and symmetric padding.

### Target 5: Full Regression Audit & Convergence Verification
- **Source of Truth**: All Three Sources Combined.
- **Inspection**: Composite execution of interaction hooks, feel curves, and bundle mount readiness. Zero dead buttons, effective scroll rate $\ge 55\text{--}60\text{fps}$, dropped frames $\le 2$, and clean `#root` DOM mounting.
- **Pass Criteria**: All composite receipt gates return `PASS` and `checkback_audit.json` records `converged: true`.

---

## 4. Timeout & Guardrails (40-Minute Ceiling)

- **Hard Timeout**: If the total runtime exceeds **40 minutes (2400 seconds)**, the loop gracefully bails:
  `[TIMEOUT] Dev flywheel reached 40-minute timeout (2400s). Bailing out.`
- **Cycle Ceiling**: Stops after at most 5 cycles (`--max-cycles=5`) unless configured otherwise.
- **Audit Persistence**: Every cycle and check result is recorded in `<project>/checkback_audit.json`:

```json
{
  "flywheel_name": "jason-dev-agent-flywheel",
  "project": "01-website-e2e-test",
  "timestamp": "2026-10-28T03:37:00Z",
  "total_elapsed_sec": 42.15,
  "converged": true,
  "cycles_completed": 1,
  "max_cycles": 5,
  "timeout_limit_sec": 2400,
  "history": [ ... ]
}
```
