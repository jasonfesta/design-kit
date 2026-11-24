---
name: design-donts
description: Jason's weekly "don't do this" list turned into rules and a linter. Use when the user pastes design feedback or don'ts ("don't use purple", "stop using dark mode", "no Roboto") to add them as rules, and before shipping or presenting any design output (prompt, concept plate brief, design system, tokens, React build, batch of variants) to lint it against every don't. Also use when constructing a design or image prompt, to fold the don'ts in as constraints.
---

# design-donts

One source of truth, three outputs:

| File | Role |
| :--- | :--- |
| [`donts.json`](donts.json) | **Source of truth.** Every don't, with id, date, severity, why, fix, and a machine check. |
| [`scripts/lint_donts.py`](scripts/lint_donts.py) | Linter. Reads `donts.json`, scans files or project folders, and runs batch checks across variants. |
| `~/.gemini/config/rules/design-kit-taste.md` (also `~/design-kit/rules/design-kit-taste.md`) | Always-on rule. The human-readable version every agent sees. Its §5 is the feedback log. |

## A. Weekly intake: the user pastes don'ts

1. Split the paste into separate don'ts. Rewrite each as a short imperative ("Don't use purple").
2. For each one, check `donts.json` for an existing rule. If it's already there, tighten it (add families, hues, patterns) instead of adding a duplicate.
3. Add a rule object:
   - `id` kebab-case, `added` today's date, `severity` = `error` for hard bans, `warn` for taste guidance.
   - `why` in one sentence, `fix` that says what to do instead.
   - `check`, using the most specific type available:

| `check.type` | Use for | Fields |
| :--- | :--- | :--- |
| `font_banned` | a typeface must never appear | `families` |
| `font_overused` | allowed but over-used faces; batch must vary | `families`, `batch_unique_primary` |
| `hue_banned` | a color family is banned | `oklch_hue_min`, `oklch_hue_max`, `min_chroma`, `tailwind_classes` |
| `dark_default` | theme defaults | `max_bg_luminance`, `batch_max_dark_ratio` |
| `pattern` | anything matchable with a regex: libraries, class names, copy phrases, effects (`backdrop-blur`, `bg-gradient-to-r from-`, "Unlock the power") | `patterns` |
| `judgment` | can't be linted (composition, tone, "too generic") | none; it's listed as a manual check |

   If a don't needs a new check type, add it to `lint_donts.py` (keep it heuristic and fast), then test it.
4. Update the always-on rule: append a dated bullet to §5 of `design-kit-taste.md`, and fold lasting rules into §1–§4 (or a new section).
5. Run the linter on a known-good and a known-bad sample to make sure the new rule fires correctly and doesn't flood false positives.
6. Reply with a table: don't → rule id → severity → how it's checked.

## B. Linting an output

```bash
# one project or file
python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py path/to/project
# a batch of variants: also checks dark ratio and unique primary fonts across them
python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py variants/a variants/b variants/c
# machine-readable
python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py path --json
```

- It exits 1 on any `error`. Fix every error before presenting. Fix warnings, or state why the brief overrides them.
- `dist/`, `node_modules/` and minified bundles are skipped (`--include-dist` to lint the built file).
- Then walk the "Manual checks" list it prints, and judge those yourself.
- Run it in the Golden Template flow right after `golden-template` lint and before `local-build-preview`.

## C. Constructing a prompt (image, concept, or build)

Before writing any design prompt, read `donts.json` and add a short **Constraints** block built from it, phrased positively where possible:

- Font: name the chosen pairing explicitly (never leave the model to default to Roboto or Inter).
- Color: name the palette hues explicitly, and add "no purple, violet, or lavender".
- Theme: state light, paper or tinted-neutral unless the brief needs dark, and if so say why.
- Add any `pattern` or `judgment` don'ts that apply to the subject.

Keep it to 3–6 lines; a long list of negatives makes image models drift toward them.
