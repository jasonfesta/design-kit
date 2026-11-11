---
name: style-direction
description: >-
  Translates the 5 distinct researched examples directly into dialed,
  non-beige art directions and tri-voice specifications (textural materiality,
  designer hierarchy/typography, and frontend-developer structural geometry)
  using live google-font-selection rankings, canon.md, and explicit
  website/app architecture notes in coverage.md. Bans warm-beige defaults and
  watered-down averaging. Use after research completes and before image-gen
  writes prompts. Don't use for capturing screenshots (use research) or
  rendering images directly (use image-gen).
metadata:
  icon: 🎨
---

# style direction

```text
jason-design-agent / style direction (stage 2 · direct research inspiration & zero beige)
────────────────────────────────────────────────────────────────────
input         user_prompt + 5 distinct researched examples (research/)
core rule     TAKE DIRECT INSPIRATION from the 5 researched examples--NEVER
              average 5 vivid benchmarks into one safe warm-beige compromise
anti-beige    HARD BAN on warm beige/cream/oat defaults (#F4EFE6, #F6F2EA...)
fonts         live google-font-selection ONLY (~1,950 families, 0 AI cliches)
tri-voice     1. textural/material · 2. designer · 3. frontend developer
```

`style-direction` is Stage 2 of **`jason-design-agent`**. Rather than averaging researched benchmarks into one safe, warm-beige middle ground, `style-direction` **preserves the direct structural, chromatic, and material inspiration of the 5 standout researched examples** so Nano Banana produces genuinely distinct, category-worthy results—paired with live-ranked Google Fonts (`recommend_google_fonts.py`) and original `canon.md` brand copy.

---

## workflow checklist

- [ ] **step 1 — define & name the `5-10` Style Range (`direction.md`) & enforce the zero-beige ban**: synthesize all researched sites and their 5-part anatomical breakdowns (`header`, `navigation`, `touts`, `interactions`, `footer`) into **`5-10` explicitly named non-beige style directions** that break down the first moodboard—carrying forward each style's authentic chromatic polarity, material physics, layout grid, and interactive mechanics directly (banning `#F4EFE6` / `#F6F2EA` / `#FAF6F0` warm-beige defaults unless explicitly requested by the user).
- [ ] **step 2 — execute live `google-font-selection` + web-safe accessible companion body pairing (`<= 2` fonts per direction, WCAG 2.2 AA pre-flight)**:
  - Run `../google-font-selection/scripts/recommend_google_fonts.py` against the live ~1,950-family catalog for the **Primary (`H1-H3` Headline)** voice, strictly excluding `avoid_fonts` **AND** overused AI defaults (`Instrument Serif`, `Playfair Display`, `Cormorant Garamond`, `DM Serif Display`, `Cinzel`, `Inter`, `Roboto`, `Plus Jakarta Sans`, `DM Sans`).
  - Run `python3 ../jason-design-agent/scripts/font_scale_and_pairing.py pair --primary="<Primary>" --surface=desktop-web --avoid="<csv>"` to lock a **live-scored, web-safe accessible Companion Body & UI Google Font** (`Latn` script, `400` + `500/600` or variable `wght`, high Google `/Purpose/Easy Reading` + `/Quality/*` scores, `tabular-nums`, open apertures) and verify WCAG 2.2 AA token contrast (`>= 4.5:1` body/muted/button labels, `>= 3.0:1` large headings & borders) via `font_scale_and_pairing.py audit` before `image-gen` writes a single prompt.
  - Document physical letterform anatomy + per-surface (`desktop-web`, `mobile`, `desktop-app`, `component`) CSS-to-`2K` canvas ratios and character/line-count copy budgets in `typography-and-color.md` (`>= 16px` body, `>= 12px` floor; NEVER `< 12px`).
- [ ] **step 3 — lock optical padding & negative-space geometry (`typography-and-color.md`)**: enforce `>= 38%-45%` calm negative space, `64px-96px` outer desktop margins, `80px-128px` vertical pauses, `28px-36px` internal card padding, `40px-48px` pills/buttons with `2:1` L/R optical padding (`20px-28px`), `>= 18%-22%` margin around isolated components, and `75%` open stage on experiences.
- [ ] **step 4 — author `canon.md` & `coverage.md` with explicit website/app architecture notes & `<surface> -- <role>` naming**:
  - **Single-brand product mode**: all `web` plates form **one cohesive website** (only slot `01` is `web -- home landing page`; interior routes share identical header/footer) and all `mobile app` plates form **one app** across 3 tabs.
  - **5-example multi-direction mode**: each separate benchmark-inspired website uses `web -- home landing page · <direction>`, documented explicitly in `coverage.md` and the moodboard `system` row.
- [ ] **step 5 — hand off tri-voice blueprints to Pre-Nano 10-Iteration Critique (`critique/pre-nano-10-iterations.md`)**: verify every prompt unites **textural**, **designer**, and **frontend-developer** precision before firing Nano Banana.

---

## 1. the tri-voice specification rule (non-beige example)

| voice | what `style-direction` locks in detail | concrete example (*brushed stainless & optic white espresso lab*) |
| :--- | :--- | :--- |
| **1. textural & material** | Physical substrate, metal/stone/glass grain, studio light direction, shadow falloff, zero plastic AI sheen, zero beige tint. | *Pure `#FFFFFF` gallery wall plane meeting `#D4D8DD` linearly brushed 304 stainless steel counter surfaces, `#0A0A0A` anodized carbon hardware, crisp overhead daylight diffused through frosted glass.* |
| **2. designer** | Optical hierarchy, benchmark-faithful column tension, negative-space cadence, live Google Font pairing & tracking. | *Architectural Kyoto laboratory restraint (`Afacad Flux` `-0.03em` geometric headlines + `Google Sans Code` `+0.06em` brewing coordinates), `44%` pure white breathing room, single focal espresso bar vista.* |
| **3. frontend developer** | CSS Grid track geometry, `1px` seams, exact `px` radii, `2:1` pill padding, `tabular-nums`, complete footer. | *`12-column` grid (`24px` gap, `1px solid #E5E7EB` crisp rules, `8px` radius); `42px` pill CTA (`24px` L/R padding, `8px` gap); right-aligned `tabular-nums` extraction specs (`93.5°C · 1:2.1 · 28s`).* |

---

## references

- [palette polarity rules, `canon.md` schema & tri-voice planning tables](references/originality-and-canon-tables.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
