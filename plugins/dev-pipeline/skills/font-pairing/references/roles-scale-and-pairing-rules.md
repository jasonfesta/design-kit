# roles, type scale & pairing rules with tailwind recipes (`font-pairing`)

## role map

| element | role | size (desktop / mobile) | weight | leading | tracking |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `h1` hero | primary | `clamp(40px, 5vw, 72px)` / `36–40px` | 600–700 | `1.0–1.05` | `-0.02em` |
| `h2` section | primary | `32–40px` / `28px` | 600 | `1.1` | `-0.015em` |
| `h3` card title | primary | `20–24px` / `18–20px` | 600 | `1.2` | `-0.01em` |
| subheadline / lede | primary (or secondary at `18–20px` 400) | `18–22px` | 400–500 | `1.4` | `0` |
| body | secondary | `16–18px` | 400 | `1.5–1.65` | `0` |
| ui label / button | secondary | `14–15px` | 500 | `1.0` | `0` to `0.01em` |
| caption / small | secondary | `13–14px` | 400 | `1.4` | `0.01em` |
| eyebrow / overline | tertiary (or secondary) | `12–13px` | 500–600 | `1.2` | `0.12–0.18em`, uppercase, `<= 3` words |
| numerals / prices / tables | secondary `tabular-nums` (or tertiary mono) | inherits | 500–600 | — | — |

## modular scale

Pick one ratio and derive everything from body (`16px`):

| ratio | name | body → small / h3 / h2 / h1 | use |
| :-- | :-- | :-- | :-- |
| `1.2` | minor third | `16 → 13 / 23 / 28 / 33` (+ fluid hero) | product UI, dashboards, apps |
| `1.25` | major third | `16 → 13 / 25 / 31 / 39` | landing pages, marketing |
| `1.333` | perfect fourth | `16 → 12 / 28 / 38 / 51` | editorial, long-form |

Rules the eval enforces: `h1 >= h2 >= h3`, consecutive step ratios between `1.1` and `1.8`, `h1 >= 1.5x` body. Fluid hero sizes via `clamp()` keep the ratio on mobile.

## tailwind recipe (`src/index.css`)

```css
@import "tailwindcss";

@layer base {
  :root {
    --font-primary: "<Primary Family>", Georgia, serif;
    --font-secondary: "<Secondary Family>", system-ui, sans-serif;
    --font-tertiary: "<Tertiary Family>", ui-monospace, monospace; /* omit if unused */
  }
  body { font-family: var(--font-secondary); font-size: 1rem; line-height: 1.6; }
  h1, h2, h3 { font-family: var(--font-primary); letter-spacing: -0.015em; }
  h1 { font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.02; }
  h2 { font-size: clamp(1.75rem, 3vw, 2.5rem); line-height: 1.1; }
  h3 { font-size: 1.375rem; line-height: 1.2; }
}
.font-primary { font-family: var(--font-primary); }
.font-secondary { font-family: var(--font-secondary); }
.font-tertiary { font-family: var(--font-tertiary); }
.eyebrow { font-family: var(--font-tertiary, var(--font-secondary)); font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; }
```

Load fonts once in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=<Primary>:wght@600;700&family=<Secondary>:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
```

## pairing heuristics (when `jason-design-agent` hands two or three families)

1. **contrast of construction, agreement of proportion** — serif vs. sans, display vs. text, mono vs. humanist; x-heights within `~10%`, similar stroke rhythm.
2. **one voice leads** — the primary carries personality; the secondary disappears into readability. If both are expressive, demote one.
3. **weights as a ladder** — primary `600/700` headlines, secondary `400` body / `500` UI; avoid using four weights of the same family as a substitute for hierarchy.
4. **tertiary must do a job** — eyebrows, data, code. If it only adds variety, remove it (`tertiary_restrained_ok` caps it at `15%` of text and bans body/h1-h3 use).
5. **superfamily is fine** — one family across roles differentiated by size/weight/tracking; confirm intent (`single_family_system: true`).
6. **no fallbacks on screen** — if the eval reports `no_fallback_leaks_ok: false`, the family did not load (check the CSS2 URL, weights, or Base64 payload).
