---
name: reference-mining
description: Mine matching reference screenshots (landing pages, consumer apps, enterprise apps) for a WDA prompt from GemPix's Iris image database, instead of hand-picking goldens. Turns a prompt into Iris queries, runs the abunner Iris mining pipeline with a category recipe and auto-rater, then GCC/Guardian-filters the results. Use when a prompt or slot needs better-matched reference images, when building a reference set for a category, or when checking that mined screenshots are GCC-compliant before use.
---

# reference-mining

Source note (WDA, Nov 2026): GemPix has a database of mostly trainable images that includes many app and website screenshots. The flow below mines it per prompt.

## Sources
| What | Where | Access |
| :--- | :--- | :--- |
| 2,600 auto-rated screenshots (landing, consumer, enterprise), imgrid + bagz links | [WDA Aesthetics References – Consumer, Enterprise, Landing – Oct 26](https://docs.google.com/document/d/1qQXyqtDtB86BV-kyfsTzjZSeh9kIH4WPQrgcBqcIGPw/edit?resourcekey=0-uVGbP_j8zueoAWbpAGsGpA&tab=t.0) (e.g. http://shortn/_3dUMTrE1s9) | Doc share |
| Example mining config: Iris queries + per-category auto-raters (`recipes/wda_{landing_pages,consumer_apps,enterprise_apps}_mining_v*.yaml`, `wda_web_reference_autorater_v3.yaml`, `strict_gates_lib.py`) | `//depot/google3/prototypes/gdm/users/abunner/wda_oct26_2026_losses/` | **Restricted** (needs abunner's ACL) |
| The pipeline (`mining_pipeline.py`, `query_lib.py`, `autorater_lib.py`, `diversity_lib.py`, `compliance_lib.py`, `dashboard_server.py`, `query_guide.md`) + `AGENTS.md` usage guide | `//depot/google3/prototypes/gdm/users/abunner/iris/` | **Restricted** (needs abunner's ACL) |
| GCC / Guardian filtering skill | `//depot/google3/prototypes/gdm/wda_contributor_skills/gcc_filtering/SKILL.md` (read at `/google/src/head/depot/google3/prototypes/gdm/wda_contributor_skills/gcc_filtering/SKILL.md`) | Readable |

> [!IMPORTANT]
> As of 2026-11-11, the `iris/` and `wda_oct26_2026_losses/` files return *Permission denied* for jfesta. Ask abunner (who offered to help) for read access, then **read `iris/AGENTS.md` and `iris/query_guide.md` first** and follow them over anything below. Don't try to get around the ACL.

## Workflow
1. **Classify the prompt:** landing page, consumer app, or enterprise app. This picks the recipe and auto-rater (latest version in `wda_oct26_2026_losses/recipes/`).
2. **Prompt → queries** (the suggested next step: it matches better than browsing the 2,600 set). Pull out:
   - **Domain and subject:** "boutique hotel booking", "fleet telematics dashboard"
   - **Surface and layout:** hero + bento, sidebar app shell, mobile tab bar, data table, map split view
   - **Key modules:** pricing table, calendar, chat, chart grid, product grid, onboarding
   - **Aesthetic:** after enrichment by `color-enricher` and `font-enricher` (e.g. "warm paper editorial serif", "light technical grotesk"). Never query toward purple or dark-default looks (see `design-donts`).
   - **Device:** desktop or mobile.

   Write 4–8 short queries: 2 literal (domain + surface), 2 layout-led, 2 aesthetic-led, and 1–2 near-neighbour domains. Use the syntax in `query_guide.md`.
3. **Run the mining job:** copy the category recipe, replace its queries with yours, keep its auto-rater and strict gates, and run it as `iris/AGENTS.md` describes (start from `iris/recipes/sample_mining_job.yaml`). Use the diversity and downsampling stages so you get variety, not near-duplicates.
4. **GCC-filter the output** with the `gcc-filtering` skill:
   - Small lists: `GuardianService.CheckComplianceStatus` (no ACL), using `image_data.media_url` + referrer URLs for screenshots.
   - Large lists: `GccPolicyCheckService.CheckGccPolicyInBatch` (self-serve ACL at go/google-common-corpus-policy-api-access).
   - Keep only `FULL_COMPLIANT`. Treat unknown, invalid or missing-referrer results as fails. F1 `CheckGoogleExtended` is a pre-filter only, never the final sign-off.
5. **Pick and log:** pick one desktop + mobile pair per slot (the WDA ≥85% mirror rule). Record the queries, recipe version, auto-rater scores, GCC verdicts and the chosen image IDs in the folder's `STEERING.md`.

## Output
```
Category: <landing|consumer|enterprise>   Recipe: <file@version>
Queries: 1) … 2) … …
Top refs (GCC FULL_COMPLIANT): <id/url> score <x> — <why it matches>
Chosen pair: desktop <id>, mobile <id>
```
