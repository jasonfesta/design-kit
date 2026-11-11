# Contributing to Image-to-React — Comp-Accurate Golden Template Synthesis & Visual Eval Loop (`image-to-react`)

## Core Invariants

1.  **Preserve Google Skill Readability & `validate_skill` Compliance**:
    -   Keep `SKILL.md` under `500` lines (`800` lines hard limit) using progressive disclosure into `references/*.md`.
    -   Never use `<` or `>` angle brackets in the YAML frontmatter `description`.
    -   Never use `file:///` or `/google/src/` links in `SKILL.md`; use relative paths (`references/...`, `scripts/...`, `assets/...`).
    -   Never place Unicode em dashes (`U+2014`) or en dashes (`U+2013`) inside fenced code blocks or inline code spans.
2.  **Single Canonical Script Ownership**:
    -   Keep deterministic helper scripts scoped to this skill's `scripts/` directory without duplicating scripts across sibling skills.

## Verification Before Submitting Changes

```bash
node scripts/audit-all-projects.mjs --help
node scripts/build-all-projects.mjs --help
python3 scripts/crop_regions.py --help
node scripts/eval-image-to-react.mjs --help
node scripts/eval-multi-screen-project.mjs --help
python3 scripts/ingest-nano-banana.py --help
node scripts/lint-golden-template.mjs --help
python3 scripts/measure_px.py --help
python3 scripts/prepare-and-extract-image.py --help
node scripts/scaffold-golden-from-image.mjs --help
node scripts/verify-html-bundle.mjs --help
```
