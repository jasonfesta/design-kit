# Contributing to Daily Studio Chair Reconstruction & Memory Synthesis (`chair-studio-threejs`)

## Core Invariants

1. **Preserve Google Skill Readability & `validate_skill` Compliance**:
   - Keep `SKILL.md` under `500` lines (`800` lines hard limit) using progressive disclosure into `references/*.md`.
   - Never use `<` or `>` angle brackets in the YAML frontmatter `description`.
   - Never use `file:///` or `/google/src/` links in `SKILL.md`; use relative paths (`references/...`, `scripts/...`).
   - Never place Unicode em dashes (`U+2014`) or en dashes (`U+2013`) inside fenced code blocks or inline code spans.
2. **Enforce Hard Network Budget & Single Script Ownership**:
   - `scripts/harvest_rss_chair.py` must never exceed `5` RSS site requests across `5` distinct websites.
   - Delegate base optical probing to `arch-camera-matching-and-perspective/scripts/probe_reference_plate.py` and parity metrics to `arch-turing-test-loop/scripts/compare_arch_core.mjs` rather than duplicating sibling scripts.

## Verification Before Submitting Changes

```bash
python3 scripts/probe_white_studio_chair.py --help
python3 scripts/harvest_rss_chair.py --help
node scripts/render_and_compare_chair.mjs --help
```
