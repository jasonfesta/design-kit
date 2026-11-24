# Benji Taylor — benji.org

> **URL:** https://benji.org · **Captured:** 2026-11-11 · ![benji.org](screens/og/benji.jpg)

## Who
London-born, LA-based. **Head of Design for X and SpaceXSI** (at SpaceX); previously led design at **Base** (Coinbase); founded Los Feliz Engineering (Honk real-time messaging, Family self-custody wallet; acquired by Aave Labs, CPO). Maintains open-source "tools for interface excellence".

## Open-source & writing
| Item | Date | What | Install |
| :--- | :--- | :--- | :--- |
| **Stageshow** | 2026-10 | Agent **skill for faux product UI** (hero demos, cursor walkthroughs) — "a hundred small decisions written down"; agent builds, films itself, fixes. *Installed in this kit as `stageshow` skill.* | `npx skills add benjitaylor/skills --skill stageshow` |
| **Drawesome** | 2026-07 | Drawing/annotation component (npm `drawesome`) | `npm i drawesome` |
| **Liveline** | 2026-02 | Real-time animated line chart: **one `<canvas>`, zero deps beyond React**, 60fps interpolation, momentum arrows, "degen mode" (shake + particles). Two props: `data`, `value`. *Used in WDA.* | `npm i liveline` |
| **Agentation** | 2026-01 | **Visual feedback for agents** — click any element, annotate, copy structured markdown (selector + note) for Claude Code / Codex / Gemini; MCP, API, webhooks, schema "AFS 1.1" | `npm i -D agentation` |
| Annotating for agents | 2026-01 | Essay behind Agentation | — |
| Morphing icons with Claude | 2026-01 | Using an agent to build icon-to-icon morphs | — |
| cmdk (co-maintainer) | — | ⌘K menu | `npm i cmdk` |
| Honkish · Family Values | 2024–25 | Design write-ups for Honk and Family (wallet) | — |

## What to borrow
- **Agentation** as a review loop for our Golden Template builds: designer clicks elements → structured notes → `jason-dev-agent`.
- **Liveline** for any live metric (KPI hero, monitoring) instead of heavy chart libs.
- **Family wallet** interactions are a canonical reference for playful-but-precise fintech motion (drawer morphs, tray transitions).

## Related
`stageshow` skill · [../../libraries/ui-primitives.md](../../libraries/ui-primitives.md)
