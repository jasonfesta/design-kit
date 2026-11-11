# variation dial, invariants, prompts & drift bands (`nanofy`)

## the dial

`--variation` runs from `0.0` (pure mirror) to `0.5` (distinct but faithful); **the default is `0.5`**. The **anchor** (slot `01`, the desktop web plate — always the very first image) is the only plate that is *reimagined*; every **spoke** (mobile web, app, components, experiences) receives the anchor's refinement, not its own, so the whole set moves together.

Every prompt — anchor and spoke — also carries that plate's **imported style-direction MD** verbatim-ish (`STYLE DIRECTION OF THIS PLATE (from the imported prompt MD; honour it, do not re-interpret it): …`, trimmed to ~1,400 chars) so fonts, palette, materials, and canon are preserved while the dial only moves materials, light, grain, and grade. The resulting final prompts are written out as the **new nano-based MDs** in `nano/prompts/<slug>.md`.

| dial | label | latitude the anchor prompt grants | drift band (`8x8` MAE, 0–255) |
| :-- | :-- | :-- | :-- |
| `0.0` | mirror | change nothing | `0 – 14` |
| `0.1` | barely perceptible | light falloff, shadow softness, surface grain, micro-contrast | `1 – 18` |
| `0.2` | subtle | materials & finish, light direction/softness, grain, color temperature | `2 – 24` |
| `0.3` | gentle | slightly more atmospheric art direction in materials, light, depth, photo grade | `3 – 30` |
| `0.4` | noticeable | richer materiality, deliberate light/shadow, refined grade, tasteful background texture | `4 – 36` |
| `0.5` *(default)* | distinct | clearly elevated art direction; same design executed with more taste | `6 – 42` |

Below the band on the anchor = the model returned a plain mirror (re-run or raise the dial). Above the band on any plate = redesign risk (re-run with the **same** prompt; never escalate to a different prompt).

## hard invariants (in every prompt, every level)

- every piece of text, titling, headline, label, price, and copy stays **verbatim and in place**
- logos, wordmarks, and brand marks stay pixel-faithful
- all product UI (navigation, buttons, pills, cards, inputs, tabs, icons) keeps exact position, size, shape, and meaning
- layout grid, spacing, aspect ratio, framing, and crop stay identical
- no borders, no watermarks, no captions; nothing added or removed
- output: **same pixel size, same format**, long edge `>= 1k`

The drift gate catches gross violations; the agent still **eyeballs** titling, logos, and product UI on the anchor before writing the refinement note.

## prompts

**anchor (variation > 0)**

```text
Re-output this UI design plate as a fresh, high-quality render with a slight unique take (variation 0.5 of 0.5, distinct).
Take a distinct but faithful unique stance: a clearly elevated art direction in materials, lighting, atmosphere, grain, and
photographic grade — the same design, executed with more taste. Photo subjects and compositions stay the same.
Remove compression artifacts, dithering, and softness so every edge, glyph, and photo is crisp.
HARD INVARIANTS (never change): every piece of text, titling, headline, label, price, and copy stays verbatim and in place;
logos, wordmarks, and brand marks stay pixel-faithful; all product UI keeps its exact position, size, shape, and meaning;
the layout grid, spacing, aspect ratio, framing, and crop stay identical; no borders, no watermarks, no captions, nothing added or removed.
STYLE DIRECTION OF THIS PLATE (from the imported prompt MD; honour it, do not re-interpret it): <contents of prompts/<slot>.md>
```

**spoke (after the refinement note)**

```text
Re-output this UI design plate as a fresh, high-quality render and apply EXACTLY the same refinement that was applied to the
anchor plate of this design system (variation 0.5, distinct) — the same materials, light, grain, color temperature, and photographic
grade — so all plates read as one consistent set. This plate keeps its OWN layout, copy, and imagery; do not import anything from
the anchor except the refinement treatment. Refinement applied to the anchor (replicate it here): <refinement note>.
Remove compression artifacts, dithering, and softness so every edge, glyph, and photo is crisp. HARD INVARIANTS (…same block…).
STYLE DIRECTION OF THIS PLATE (from the imported prompt MD; honour it, do not re-interpret it): <contents of this spoke's own prompts/<slot>.md>
```

Where the route supports multiple input images (`image-generator`, Gemini API), attach the anchor **before** and **after** plates as references to the spoke call; `nanofy-plan.json` lists them under `reference_images`.

**mirror (variation 0.0)** — the plain 1:1 re-output prompt; used for every plate when the dial is `0.0`.

## the refinement note

Written by the agent after `verify-anchor` passes, one paragraph, concrete and visual, e.g.:

> Warmed the paper ground from flat `#e7e4de` to a softly lit bone with faint tooth; shadows under cards are lower and softer (longer falloff, no hard edge); hero photography gained a touch of film grain and a cooler highlight roll-off; metal and glass surfaces read with a subtle satin finish. No change to type, copy, logos, buttons, or layout.

It is stored in `nano/refinement-note.md`, injected verbatim into every spoke prompt (`note --text "…"`), and recorded in every `nano/prompts/<slug>.md`.

## order of operations

`intake-study-from-folder.py --design-agent-turns=N` → `plan --variation 0.5` (drafts `nano/prompts/*.md`) → confirm calls → `run-anchor` (desktop web 01 only) → `verify-anchor` → `note` → `brief --slug … --text …` (one per generated gap-fill slot) → `run` (all spokes + generated) → `verify` → `switch` (closes design turn 1) → curate `index.html` (`👍/👎`) → hand to `jason-dev-agent`.
