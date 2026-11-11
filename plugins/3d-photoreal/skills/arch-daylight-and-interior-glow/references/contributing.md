# Contributing to Architectural Daylight, Sky Radiance & Interior Glow (`arch-daylight-and-interior-glow`)

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
python3 ../skill-maker/scripts/validate_and_wrap.py --skill-dir=.
```
