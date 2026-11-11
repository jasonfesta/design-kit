# Contributing to `skill-maker`

## Core Invariants

1.  **Preserve 100% Parity with Google's `validate_skill.py`**:
    -   `scripts/validate_and_wrap.py` must enforce YAML frontmatter keys, `kebab-case` `name`, `description <= 1024` chars with zero `<` or `>` angle brackets, line/byte ceilings (`<= 500` soft / `<= 800` hard lines, `<= 46,080` bytes), relative link existence, and `## Contributions` link validation.
2.  **Zero Redundant Script Proliferation**:
    -   Never copy helper scripts across unrelated skill folders. Keep each script in its single canonical owner skill.
3.  **`x20` Opaque-Origin HTML Safety**:
    -   All generated `index.html` pages must pre-render their content statically and wrap `localStorage` access in `try / catch` blocks.

## Verification Before Submitting Changes

```bash
python3 scripts/validate_and_wrap.py --help
python3 scripts/build_catalog.py --help
```
