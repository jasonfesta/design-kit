---
name: accessibility
description: >-
  Enforces accessible type and control sizing in Golden Template React builds
  inside jason-dev-agent: WCAG 2.2 text contrast (4.5:1 normal, 3:1 large),
  body text at least 16px with 1.5 line height (12px absolute floor), control
  targets at least 24x24 css px with 44x44 recommended, visible keyboard
  focus, accessible names, image alt text, and document language. Runs
  eval-accessibility.py against the live built DOM at Stage 1a, re-runs after
  responsiveness, interaction, and feel, and talks back to jason-design-agent
  as a developer whenever a design value must move to meet a standard. Use
  whenever sizing fonts, buttons, pills, inputs, or choosing text/background
  colors in a build. Don't use for benchmark research or concept plates (use
  jason-design-agent).
metadata:
  icon: ♿
---

# accessibility

```text
jason-dev-agent / accessibility
────────────────────────────────────────────────────────────────────
scope      type sizes, line height, contrast, target sizes, focus, names, alt, lang
standard   wcag 2.2 aa (hard) · aaa / apple hig / material (recommended, reported)
eval       scripts/eval-accessibility.py  (live dom in headless webkit, exit 0/1)
when       stage 1a gate, re-run after stage 2 / 3 / 4, before every design talk-back
```

`accessibility` is the standards gate `jason-dev-agent` applies whenever it turns a plate into type and controls. Design plates set the look; this skill guarantees the shipped **font sizes, line heights, contrast, and button/target sizes** meet accessible standards — and when a plate's value cannot meet them, `jason-dev-agent` raises it to `jason-design-agent` as a developer with the number that must move (never silently restyles).

---

## 1. the standards jason-dev-agent builds to

| area | hard gate (fails the build) | recommended (reported, raise in talk-back) | source |
| :--- | :--- | :--- | :--- |
| text size | no visible text `< 12px`; body paragraphs `>= 14px` | body `>= 16px`; captions/eyebrows `>= 12px` with `>= 0.02em` tracking | WCAG 1.4.4 (200% zoom), platform guidance |
| line height | body `>= 1.4`; headings `>= 1.0` | body `>= 1.5`, headings `>= 1.1`, paragraph spacing `>= 2x` font size, letter-spacing `>= 0.12em` possible without clipping | WCAG 1.4.12 |
| contrast | text `>= 4.5:1`; large text (`>= 24px`, or `>= 18.66px` bold) `>= 3:1` | `>= 7:1` body for AAA; control borders/fills `>= 3:1` vs. surround | WCAG 1.4.3, 1.4.6, 1.4.11 |
| target size | every control `>= 24x24` css px (inline text links exempt) | `>= 44x44` (mobile / AAA); `>= 8px` gap between adjacent targets | WCAG 2.5.8, 2.5.5, Apple HIG, Material |
| focus | a `:focus-visible` (or `:focus`) style ships; `outline: none` only with a replacement ring `>= 2px`, `>= 3:1` | ring offset `2px`, never clipped by `overflow: hidden` parents | WCAG 2.4.7, 2.4.11, 2.4.13 |
| names | every `button` / `a[href]` / input has an accessible name | icon-only buttons use `aria-label` matching the visible tooltip | WCAG 4.1.2, 2.5.3 |
| images | every `<img>` has `alt` (empty for decorative) | meaningful alt describes the subject, not "image of" | WCAG 1.1.1 |
| document | `<html lang>` set | heading levels never skip; one `h1` | WCAG 3.1.1, 1.3.1 |

Button craft stays as the Golden Template rule (`px-3.5`–`px-5`, `gap-1.5`–`gap-2`, `tabular-nums`): the accessible minimums above are floors, not a style.

---

## 2. how jason-dev-agent applies it

1. **translate plate sizes to accessible css at Stage 1a**: when a `2k` plate's measured body text is under `16px` at the mounted CSS width, ship `16px` (or `15px` with `1.6` line height as a floor of `14px`) and keep the plate's *ratios* via the type scale; when a pill or icon button measures under `24px` tall, grow the hit area with padding or a pseudo-element, not the glyph; keep the visible footprint when the designer wants it tight by adding `min-h-11 min-w-11` tap area via `::after` on mobile.
2. **fix contrast at the token, not the element**: adjust `--muted` / `--on-accent` tokens until `eval-accessibility.py` reports `0` contrast failures; report the before/after hex pair to `jason-design-agent`.
3. **keep focus visible**: Tailwind resets outlines — ship `focus-visible:ring-2 focus-visible:ring-offset-2` (or a `:focus-visible` rule in `index.css`) on every control.
4. **run the eval, then talk back**: every stage talk-back includes the accessibility receipt (`contrast_fail_count: 0`, `targets_under_24px: 0`, `body_under_16px_count`, `targets_under_44px_count`). If a design value had to move, say exactly which (`"muted ink #858481 on #0c0c0b was 4.1:1 -> #9a9994 = 4.6:1"`).

```bash
python3 /usr/local/google/home/jfesta/skills/accessibility/scripts/eval-accessibility.py \
  --project="/path/to/workspace/projects/<project-slug>" [--require-44] [--min-body-px 16]
# gates: text_size_ok · line_height_ok · contrast_ok · target_size_ok · focus_visible_ok · accessible_names_ok · img_alt_ok · lang_ok
```

`--require-44` makes the 44x44 target size a hard gate (use for mobile-app and touch-first builds). Re-run at `--viewport-width 390` for the mobile pass — sizes and targets are judged at the width they ship.

---

## references

- [WCAG 2.2 type, contrast & target rules with css recipes](references/wcag-type-contrast-and-targets.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
