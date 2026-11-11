---
name: font-pairing
description: >-
  Locks every Golden Template React build to one strong, role-based type
  system inside jason-dev-agent: a primary family for headlines and
  subheadlines, a secondary family for body and UI, and at most one optional
  tertiary accent family (eyebrows, h4-h6 subheads, tabular numerals, mono
  labels) capped at 15 percent of text, with a monotonic modular type scale
  and zero fallback-font leaks. Takes the live Google Fonts chosen by
  jason-design-agent via google-font-selection, maps them to roles and
  Tailwind tokens, and verifies the shipped DOM with eval-font-pairing.py. Use
  whenever wiring fonts, defining the type scale, or auditing typography
  consistency in a build. Don't use for ranking fonts from a mood or keyword
  (use google-font-selection).
metadata:
  icon: 🔠
---

# font pairing

```text
jason-dev-agent / font pairing
────────────────────────────────────────────────────────────────────
roles      primary = headlines + subheadlines · secondary = body + ui · tertiary = one accent (optional)
budget     <= 3 real families; primary >= 90% of headline text; secondary >= 90% of body/ui text
scale      modular: h1 >= h2 >= h3, step ratio 1.1-1.8, h1 >= 1.5x body, body >= 16px (accessibility)
eval       scripts/eval-font-pairing.py  (live dom in headless webkit; --expect-* asserts style-direction)
```

`font-pairing` is how `jason-dev-agent` ships typography as a **system** rather than per-component choices. `jason-design-agent` picks the families (live `google-font-selection`, non-cliché, `avoid_fonts` honoured) in `style-direction/typography-and-color.md`; this skill assigns them to roles, wires them once as tokens, applies one type scale everywhere, and proves it in the built DOM.

---

## 1. the three roles

| role | used for | rules |
| :--- | :--- | :--- |
| **primary** | `h1`–`h3`, hero and section headlines, subheadlines, pull quotes, large numerals `>= 28px` | one family; carries the brand voice; `2`–`3` weights max; tight leading (`1.0`–`1.15`), optical tracking (`-0.01em` to `-0.03em` at display sizes) |
| **secondary** | body copy, lists, captions, forms, buttons, pills, nav, tables | one family built for reading at `14`–`18px` (generous x-height, open apertures, real italics, `tabular-nums`); `1.5` line height for body, `1.0` for one-line controls |
| **tertiary** *(optional)* | one accent job only: eyebrows / overlines, `h4`–`h6` subheads, tabular numerals or prices, mono code/labels | `<= 15%` of all text, never body or `h1`–`h3`; earns its place by contrast of construction (mono, slab, humanist italic) — otherwise drop it |

Lean toward **primary + secondary only**. Add a tertiary when the system genuinely needs a third voice (editorial eyebrows, data-dense numerals), never for variety.

Good pairings contrast in construction and agree on proportion: a high-contrast serif or expressive display primary over a neutral grotesque/humanist secondary; or a geometric sans primary over a readable serif secondary. Match x-heights within `~10%` and align weights so a primary `600` sits next to a secondary `400`/`500` without shouting. A single superfamily (one family for both roles, differentiated by size, weight, and tracking) is allowed — the eval reports `single_family_system: true` so `jason-design-agent` can confirm that is intentional.

---

## 2. wiring (Golden Template)

1. **load once, in `index.html`** via Google Fonts CSS2 (`display=swap`, only the weights used) or Base64 WOFF2 for `4K` studio locks; never load a family you do not assign to a role.
2. **tokens in `src/index.css`** (`@layer base`): `--font-primary`, `--font-secondary`, `--font-tertiary` + helpers `.font-primary` / `.font-secondary` / `.font-tertiary`; body gets `font-family: var(--font-secondary)`.
3. **type scale as utilities**: pick a ratio (`1.2` minor third for product UI, `1.25`–`1.333` for editorial) and derive `h1`–`h3`, body, small; keep `h1 >= 1.5x` body on mobile and `>= 2.5x` on desktop; use `clamp()` for fluid display sizes.
4. **data drives roles**: headings and eyebrows in `src/components/*.tsx` use the role helpers, never ad-hoc `font-["…"]` arbitrary values.
5. **accessibility floors apply** (`accessibility` skill): body `>= 16px` / `1.5`, no text `< 12px`.

---

## 3. evaluating

```bash
python3 /usr/local/google/home/jfesta/skills/font-pairing/scripts/eval-font-pairing.py \
  --project="/path/to/workspace/projects/<project-slug>" \
  --expect-primary="<family from style-direction>" --expect-secondary="<family>" [--expect-tertiary="<family>"]
# gates: family_budget_ok · primary_locked_ok · secondary_locked_ok · tertiary_restrained_ok · scale_ok · no_fallback_leaks_ok · matches_style_direction_ok
```

The report names the shipped `primary` / `secondary` / `tertiary` families with their shares, the heading px per level, step ratios, and `h1_over_body`. `no_fallback_leaks_ok` fails when generic/system families render visible text (a font that did not load). Run at `--viewport-width 390` too: the mobile scale must stay monotonic.

---

## references

- [roles, type scale & pairing rules with tailwind recipes](references/roles-scale-and-pairing-rules.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
