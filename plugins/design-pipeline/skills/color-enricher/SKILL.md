---
name: color-enricher
description: Turns a brief, prompt, mood, or reference into a specific, non-purple, theme-appropriate color system (named hues with hex + OKLCH, semantic roles, light/dark decision, contrast-checked) and writes it into the prompt or build. Enforces the design-kit don'ts (no purple, no default dark mode, varied themes across a batch). Use when constructing any design or image prompt, setting tokens for a build, adapting a design system's palette, or when a batch of variants needs different palettes. Uses color-expert, oklch-skill, better-colors and the color/palette MCPs.
---

# color-enricher

Goal: no prompt or build leaves color to chance or to the AI-default purple-on-black.

## Steps
1. **Read the don'ts.** Load `~/design-kit/skills/design-donts/donts.json`. Banned: purple/violet/lavender/fuchsia (OKLCH hue 270°–330° with chroma ≥ 0.04), Tailwind `violet-*`/`purple-*`/`fuchsia-*`/`indigo-500+`. Theme: light by default; dark only when the brief calls for it; no more than ~1 in 3 dark in a batch.
2. **Decide the theme first,** and write down why: light (default), warm paper/off-white, tinted neutral, mid-tone color field, or dark (only for media, immersive/3D, pro creative tools, night use, or when the brief or reference is dark).
3. **Pick the hue story** from the brief (domain, mood, culture, any brand colors given). Choose 1 brand hue + 1 supporting hue + neutrals tinted toward one of them. Good non-purple families: cobalt/ultramarine blue (230–262°), teal/petrol (190–215°), green/emerald/moss (130–165°), ochre/amber/saffron (60–90°), terracotta/rust/vermillion (25–50°), oxblood/crimson (10–25°), warm and cool greys.
4. **Starting points:** a design system in `~/design-kit/design-systems/` (WDA six, Google twenty, external eighteen) or a palette from the `palette` MCP. If the source defines purple roles (Material baseline, Gemini, NotebookLM, Home, Radix indigo), **remap them** to the brand hue at the same lightness and chroma.
5. **Build the roles in OKLCH** (`oklch-skill`, `color-expert`): `bg`, `surface`, `surface-2`, `text`, `text-muted`, `border`, `brand`, `brand-contrast`, `accent`, `success`, `warning`, `danger`, `focus`. Keep chroma restrained on large areas; save saturated color for actions and data.
6. **Check contrast** (`color` MCP `contrast_check`, or `better-colors`): body text ≥ 4.5:1, large text and UI ≥ 3:1, focus ring ≥ 3:1 against both neighbors.
7. **Batch rule:** in N variants, vary the theme (≤ 1/3 dark) and the brand hue family.

## Output spec (paste into the prompt or build)
```
Color (light theme — <why>)
- Brand: <name> #RRGGBB / oklch(L C H) · Accent: <name> #… · Neutrals tinted <hue>
- bg #… · surface #… · text #… (x:1 on bg) · muted #… · border #…
- success #… · warning #… · danger #… · focus #…
- Avoid: purple/violet/lavender; no dark default
```
- **Image prompts (Nano Banana):** name colors in words plus hex, e.g. "warm paper background (#F4EFE6), deep petrol teal (#0E5A63) for actions, ochre (#C98A1B) highlights; no purple or violet anywhere". Repeating the hex values steers better than adjectives.
- **Builds:** write the roles as CSS variables in `src/index.css` `@layer base` / Tailwind v4 `@theme`, with a `[data-theme="dark"]` block only if a theme switch exists.

## Verify
Run `python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py <project or variants…>`; the purple and dark rules must pass.
