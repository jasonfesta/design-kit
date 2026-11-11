# WCAG 2.2 type, contrast & target rules with css recipes (`accessibility`)

## text size & line height

| token | hard floor | recommended | recipe |
| :-- | :-- | :-- | :-- |
| body (`p`, `li`, `td`, `label`) | `14px` | `16px` / `1.5` | `text-base leading-relaxed` (16/1.625) or `text-[15px] leading-[1.6]` |
| small / caption / eyebrow | `12px` | `12px` + `tracking-[0.02em]`+ | `text-xs tracking-[0.14em] uppercase` only for `<= 3` words |
| ui labels in buttons / pills | `13px` | `14px` | `text-sm`; never `text-[11px]` |
| headings | — | `line-height >= 1.1`; `h1 >= 1.5x` body | `text-5xl leading-[1.05]`, `text-3xl leading-tight` |
| measure | — | `45–75ch` body, `<= 90ch` max | `max-w-prose` / `max-w-[65ch]` |

- Text must survive 200% zoom (WCAG 1.4.4) and the user overrides in 1.4.12 (line height `1.5`, paragraph spacing `2x`, letter spacing `0.12em`, word spacing `0.16em`) **without clipping** — avoid fixed heights on text containers with `overflow: hidden`; prefer `min-h-*`.
- Use `rem`-based sizes (Tailwind defaults) so browser font-size preferences scale the page.

## contrast

- Normal text `>= 4.5:1`, large text (`>= 24px`, or `>= 18.66px` at weight `>= 700`) `>= 3:1` (WCAG 1.4.3). AAA: `7:1` / `4.5:1` (1.4.6).
- Non-text: control borders, focus rings, icon strokes, and state indicators `>= 3:1` against the adjacent background (1.4.11).
- Fix at the token layer. Typical moves on a dark `#0c0c0b` canvas: muted ink `#858481` (4.1:1) → `#9a9994` (4.6:1); placeholder `#494946` is decorative only, never for required copy. On bone `#e7e4de`: muted `#787774` (3.6:1) → `#5e5a52` (5.4:1).
- Text over photography: add a scrim (`bg-black/40` or a gradient) or move text onto a solid panel; the eval reports `bg: image` nodes separately because contrast cannot be computed reliably — verify by eye and keep a scrim.

## target size

- WCAG 2.5.8 (AA): every pointer target `>= 24x24` css px **or** has `>= 24px` spacing to the next target; inline links inside sentences are exempt.
- WCAG 2.5.5 (AAA), Apple HIG `44x44pt`, Material `48x48dp`: use `44x44` as the mobile floor (`--require-44`).
- Recipes: `min-h-11 min-w-11` on icon buttons; for a visually small `28px` chip keep the chip and extend the hit area:

```css
.chip { position: relative; }
.chip::after { content: ""; position: absolute; inset: -8px; }   /* 28px chip -> 44px target */
```

- Keep `>= 8px` between adjacent targets (`gap-2`) so mis-taps do not trigger neighbours.

## focus

- Ship a visible focus style for keyboard users (2.4.7) that is not obscured (2.4.11) and meets the 2.4.13 minimum (`>= 2px` perimeter, `>= 3:1` change).
- Tailwind: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)]` on every `button`, `a`, `input`, `summary`.
- Never leave `outline: none` without a replacement; never clip rings with `overflow-hidden` on the control's parent (use `ring-inset` or padding).

## names, alt, language, structure

- Icon-only controls: `aria-label` (matches any visible tooltip — 2.5.3 label in name).
- `<img alt="">` for decorative; descriptive alt for meaningful images (1.1.1). Photos restored by `nano-banana` keep their original alt.
- `<html lang="en">` (3.1.1). One `h1`, no skipped heading levels (1.3.1); the eval reports `heading_level_skips`.

## evaluating

```bash
python3 scripts/eval-accessibility.py --project=<project> [--require-44] [--min-body-px 16] [--viewport-width 390]
```

Gates (hard): `text_size_ok`, `line_height_ok`, `contrast_ok`, `target_size_ok`, `focus_visible_ok`, `accessible_names_ok`, `img_alt_ok`, `lang_ok`. Recommended counters (reported, discussed in talk-backs): `body_under_16px_count`, `body_line_height_under_1_5_count`, `targets_under_44px_count`, `heading_level_skips`.
