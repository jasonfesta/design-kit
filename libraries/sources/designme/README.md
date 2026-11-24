# designme.dev

**125 free, MIT-licensed UI components for agent-powered products.** That's 75 agent components (status pills, reasoning trails, tool calls, permission gates, plan reviews, run summaries…) and 50 app basics (charts, dates, forms, tables). Each one comes as **plain HTML/CSS/JS**, a **typed React 19 component with no dependencies beyond React**, or an **Astro** component, in two styles (**Soft** and **Blueprint**) with light and dark mode.

- Site: https://designme.dev · Repo: https://github.com/bydesignme/designme-dev · Docs: https://designme.dev/docs
- License: MIT. Exceptions are in [`source/NOTICE.md`](source/NOTICE.md): flag-icons (MIT), Simple Icons (CC0), Devicon (MIT), Google brand marks (trademarks), Pexels photos in `art/` (demo only, never installed).
- Registry namespace **`@designme`** → `https://designme.dev/r/shadcn/{name}.json`, wired into [`../../components.shadcn.json`](../../components.shadcn.json) and the `shadcn` MCP.
- Grabbed 2026-11-11: full repo, ≈87 MB, no `.git`.

## Why it matters for the kit
- **It fits the Golden Template.** The React components need only React 19, so they work inside the locked `package.json` with no exception. That makes it the first choice for agent/chat UI in Golden Template builds.
- It's the most complete agent-UI set in the kit. It fills the gaps between AI Elements, Prompt Kit and assistant-ui (permission gates, plan review, run queue, trace view, context meter, eval results, model compare, human handoff, steering).

## What's here (`source/`)
| Path | Contents |
| :--- | :--- |
| `components/` | 125 × `<name>.html` (live demo) + `<name>.md` (docs) |
| `packages/react/src/` | Typed React components (+ `playground/`) |
| `packages/astro/` | Astro components |
| `packages/designme/` | The `designme` CLI (`npx designme add <name> [--react|--astro] [--theme-bridge] [--examples]`) |
| `r/` | Built registry JSON (+ `r/shadcn/` for the shadcn CLI, `r/shadcn/astro/`) |
| `soft-2/`, `assets/` | Style sheets for Soft and Blueprint, the shared core, the theme bridge (maps shadcn vars → designme tokens) |
| `templates/` | Full-page templates: `sales-crm.html`, `workflow-editor.html` |
| `docs/`, `llms.txt`, `code-data.json` | Docs, an LLM-friendly index, and component metadata |
| `sounds/`, `fonts/`, `art/`, `lab/` | Site extras |

## Component list (125)
**Agent:** agent-builder · agent-harness · agent-inbox · agent-lanes · agent-phases · agent-run-timeline · agent-settings · agent-tree · answer-action-bar · artifact-card · attachment-tray · automation-canvas · browser-session · canvas-toolbar · change-review · citation-hover-card · composer · context-meter · context-switcher · decision-prompt · design-review · design-tuner · draft-review · error-recovery · eval-results · feedback-sheet · field-extraction · human-handoff · image-generation · inline-text-diff · knowledge-sources · live-answer · memory-panel · model-compare · model-picker · permission-gate · plan-review · prompt-library · prompt-starters · proposal-card · reasoning-trail · response-versions · rewrite-toolbar · run-cost · run-drawer · run-queue · run-summary · scheduled-runs · score-breakdown · set-limit · source-stack · status-pill · steering · step-inspector · step-loader · terminal-stream · thinking · thinking-states · thread-panel · tool-call · tool-connections · trace-view · voice-capture · voice-orb · web-search · workspace-rail

**App basics:** account-table · action-log · activity-heatmap · agenda · badge · banner · bar-chart · buttons · carousel · code-viewer · color-picker · command-palette · comments · context-menu · country-select · currency-converter · data-picker · date-picker · date-range-picker · details-panel · donut-chart · event-calendar · file-explorer · filter-menu · form · funnel-chart · health-score · invite-to-collaborate · kanban-board · launch-checklist · line-chart · metric-insight · multi-select · notifications · number-field · onboarding-checklist · otp-field · payment-form · pricing-cards · profile-menu · progress · radar-chart · radial-goals · reactions · rich-text-editor · scatter-chart · search-input · segmented-control · sign-in · slider · social-sign-in · stat-cards · stepper · task-table · ticket-list · toast · toast-stack · tooltip · top-pages

## Use
```bash
npx designme add status-pill thinking composer            # HTML/CSS/JS into ./designme
npx designme add status-pill thinking composer --react    # React 19 .tsx into src/components/designme
npx shadcn@latest add @designme/status-pill               # via the shadcn registry (or the shadcn MCP)
```
Offline: copy from `source/packages/react/src/` or `source/components/<name>.html`.

## Don'ts check
- **Default accent is blue** (`--accent #116ff8`). Good.
- The linter flags ≈1,100 purple values. Almost all of them are in the **demo pages' theme presets and chart palettes**, repeated across all 125 `components/*.html` (`#bc52ee`, `#7c5cff`, `#7a6bff`, `#635bff`, plus a few OKLCH violets). When you install, **don't pick the violet preset**, and remap any chart or series color in the purple band (use `color-enricher`).
- The site's fonts are Inter + a mono. In builds, set `--sans` / `--mono` from `font-enricher` instead.
- Light and dark both ship, so keep light as the default.
