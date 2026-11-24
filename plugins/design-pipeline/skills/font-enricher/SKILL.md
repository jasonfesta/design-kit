---
name: font-enricher
description: Turns a brief, prompt, mood, or reference into a specific, non-default font pairing (primary display + secondary text + optional mono/accent) with exact families, weights, sizes and load snippets, and writes it into the prompt or build. Enforces the design-kit don'ts (no Material fonts, no over-used defaults, a distinct primary per variant in a batch). Use when constructing any design or image prompt, setting up typography for a build, or when a batch of variants needs different type. Calls google-font-selection and font-pairing for ranking and verification.
---

# font-enricher

Goal: no prompt or build leaves typography to chance. Every output names its fonts.

## Steps
1. **Read the don'ts.** Load `~/design-kit/skills/design-donts/donts.json`. Banned: Material fonts (Roboto, Google Sans, Product Sans, Noto). Over-used (max one use per batch, never the default): Inter, Geist, Manrope, Space Grotesk, Plus Jakarta Sans, DM Sans, Poppins, Montserrat, Open Sans, Lato.
2. **Read the brief for type signals:** domain (finance, health, culture, dev tools, kids), tone (calm, editorial, technical, playful, luxurious), density (dashboard vs landing), surface (desktop web, mobile, plate), language/script needs, and any font the prompt explicitly asks for. An explicit request wins over everything else.
3. **Shortlist 3 pairings** from the font pool in `~/design-kit/rules/design-kit-taste.md` §4 and `~/design-kit/libraries/fonts.md`. Mix categories (a serif-led, a grotesk-led, an expressive-display-led) so the options are genuinely different.
4. **Rank and check** with `google-font-selection` (`recommend_google_fonts.py` for Google Fonts mood/tag fit) and `font-pairing` (role lock, scale, fallbacks). Check: the families exist, have the weights you need, are variable where possible, cover the script, and have a license that works (Fontshare/indie: check the terms).
5. **Batch rule:** in a set of N variants, give each a different primary family, and spread categories across the set.
6. **Pick one per output** and write the spec below.

## Output spec (paste into the prompt or build)
```
Typography
- Primary (headlines): <Family> <weights>, tracking <x>, e.g. 56/60 desktop, 36/40 mobile
- Secondary (body/UI): <Family> <weights>, 16/24 body, 14/20 UI
- Mono/accent (optional): <Family> for data, labels, numerals (tabular-nums)
- Why: <one line tying it to the brief>
- Load: <Google Fonts CSS2 URL | npm i @fontsource-variable/<family> | Fontshare link>
```
- **Image prompts (Nano Banana):** write the families in plain words with a visual description, e.g. "headlines in Fraunces, a soft high-contrast serif; body in Instrument Sans, a crisp neutral grotesk". Never just say "modern sans-serif".
- **Golden Template builds:** fonts load from the `<link>` in `index.html` (Google Fonts) or a local `@font-face` in `src/index.css`. `@fontsource` packages aren't in the locked dependency list, so they need an exception.

## Verify
After building, run `python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py <project or variants…>`; the font rules must pass.
