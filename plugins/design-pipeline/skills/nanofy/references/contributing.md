# Contributing to nanofy (`nanofy`)

## Core Invariants

1.  **Preserve Google Skill Readability & `validate_skill` Compliance**:
    -   Keep `SKILL.md` under `500` lines (`800` lines hard limit) using progressive disclosure into `references/*.md`.
    -   Never use `<` or `>` angle brackets in the YAML frontmatter `description`.
    -   Never use `file:///` or `/google/src/` links in `SKILL.md`; use relative paths (`references/...`, `scripts/...`).
    -   Never place Unicode em dashes (`U+2014`) or en dashes (`U+2013`) inside fenced code blocks or inline code spans.
2.  **Ownership**:
    -   `nanofy` belongs to `jason-design-agent` (intake path). `jason-dev-agent` never runs it and never bootstraps folders itself.
3.  **Plate Invariants Are Non-Negotiable**:
    -   Any prompt change must keep the `HARD INVARIANTS` block (titling/copy, logos, product UI, layout, size, format) and the drift bands in `scripts/nanofy-plates.py` and `references/variation-dial-and-invariants.md` in sync.
4.  **Single Canonical Script Ownership**:
    -   `scripts/intake-study-from-folder.py` and `scripts/nanofy-plates.py` live only here; sibling skills link to them instead of copying.

## Verification Before Submitting Changes

```bash
python3 ../skill-maker/scripts/validate_and_wrap.py --skill-dir=.
python3 -m py_compile scripts/intake-study-from-folder.py scripts/nanofy-plates.py
```
