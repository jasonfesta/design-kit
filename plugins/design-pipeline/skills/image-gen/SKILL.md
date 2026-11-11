---
name: image-gen
description: >-
  Authors deeply dialed tri-voice prompts directly inspired by 5+ distinct
  researched non-beige examples and generates crystal-clear minimum 1K and 2K
  lossless PNG Nano Banana 2 concept plates strictly via image-to-image
  conditioning (ImagePaths or --input_image, quota-safe max-2 concurrency,
  capped at 3 rounds). Combines textural materiality, designer
  typography/composition, and frontend-developer optical padding while
  preventing meta-prompt text leakage. Use after style-direction and the
  10-iteration pre-Nano critique pass. Don't use for upscaling cropped assets
  during React builds (use jason-dev-agent).
metadata:
  icon: 🖼️
---

# image gen

```text
jason-design-agent / image gen (stage 3 · direct benchmark prompts & head-to-head 2k rounds)
────────────────────────────────────────────────────────────────────
input         5 distinct researched examples + style-direction + iter-10 critique
anti-beige    ZERO warm-beige defaults · preserve each benchmark's chromatic world
prompt craft  1. textural/material  2. designer (live Google Font anatomy)
              3. frontend developer (optical padding, grid, complete footer)
modes         a) unified single-brand 4x3 = 12 pack (01-anchor hub-and-spoke)
              b) 5-example direct-inspiration & head-to-head round 1 vs round 2
leak guard    NEVER print hex strings or font family names as literal UI text
```

`image-gen` is Stage 3 of **`jason-design-agent`**. Every prompt channels **direct structural, chromatic, and material inspiration from the 5 standout researched examples** (never defaulting to safe warm beige) and unites **tactile art-director**, **brand/product designer**, and **frontend design-engineer** detail.

---

## workflow checklist

- [ ] **step 0 — pass `design-critique` Moment 0 (`critique/pre-nano-10-iterations.md`)**: complete all 10 pre-Nano critique iterations (`0` image calls spent) verifying zero-beige contrast, direct benchmark layout DNA, live `google-font-selection` letterform anatomy, `>= 38%-45%` negative space, and `2:1` pill optical padding (`>= 9.5/10`).
- [ ] **step 1 — enforce base-screenshot-first image-to-image (`ImagePaths`), art-direction callout transfer, quota-safe `<= 2` concurrency & anti-leakage framing**:
  - **Start from Pixel-Perfect Full-Webpage Reference Screenshots (`ref-base`), Not Empty Wireframe Seeds**: NEVER invoke Nano Banana without a reference image, and whenever researched benchmark screenshots exist, **NEVER start from a blank 3-box wireframe `seed` canvas** (which strips real-world micro-detail and produces junior layouts). Slice `2K` base transfer plates (`../jason-design-agent/scripts/lock_and_verify_plates.py ref-base` or `desktop-base-hero-2k.png` + `desktop-base-mid-2k.png` from Chrome DevTools / Playwright full-webpage captures) and pass them in `ImagePaths` so the initial generation transfers the reference's real architectural density, section callouts, lighting physics, and interactive micro-chrome into our `canon.md` brand.
  - **Art-Direction-Driven Prompts Carrying Full-Webpage Callouts**: tighten every prompt around senior art direction—explicitly carrying over observed callout modules, coordinate rails, multi-tab sandboxes, volumetric/isometric/editorial artifacts, and typographic contrast discovered across the **entire full webpage** (`fullpage-callouts.json`).
  - **Quota-safe pacing (`<= 2` workers max)**: reuse `1-2` persistent `image-generator` subagents sequentially via `send_message` (never spawn `> 2` concurrent image subagents, preventing `429 RESOURCE_EXHAUSTED` quota burn).
  - **Zero meta-leakage**: render **ONLY the live full-bleed viewport UI** (or centered component on clean system ground)—**zero split-screen brand boards, zero color-swatch strips, and never print hex codes (`#0B3D26`) or font names as literal UI badges**.
- [ ] **step 2 — generate & lock crystal-clear `>= 1K` / `2K` lossless PNG plates (`min(w, h) >= 1024`)**:
  - Immediately lock every generated plate via `python3 ../jason-design-agent/scripts/lock_and_verify_plates.py lock --raw=<raw> --out=<concepts/.../*.png> --ref-image=<ref>` (`2752x1536` `16:9`, `1536x2752` `9:16`, `2400x1792` `4:3`, `1536x3072` `1:2`; `min(w, h) >= 1024`, `sharpness_ratio >= 0.28`, `hf_detail_std >= 0.8`, zero aspect-squash ghosting).
  - In **multi-example direct-inspiration mode**, each concept channels its researched benchmark's exact color polarity, material physics, and grid architecture (`web -- home landing page · <direction>`, plus companion `mobile app` / `component` / `experience` slots).
  - In **single-brand `4 x 3` mode**, lock `01-anchor` (`web -- home landing page`) first, then expand interior routes (`02..03`), unified mobile app tabs (`04..06`), components (`07..09`), and experiences (`10..12`).
- [ ] **step 3 — progressive base-to-original multi-round evolution (`round 1` -> `round 2` -> `round 3`), dramatic improvement gate & pre-moodboard checkpoint (`<= 3` cap)**:
  - **Dramatic Improvement Mandatory Between Every Round**: consecutive rounds MUST NEVER look virtually identical (`2%` copy/border tweaks are banned). After each round, inspect every plate via `read_file` alongside **both** the prior round **and** the full-webpage Chrome DevTools reference (`desktop-fullpage-contact.jpg`), identify what works, extract richer callouts/materiality/composition cues from the full-webpage reference, and rewrite the prompt to drive a **dramatic visual and originality leap** (`Base Screenshot -> Improvement Pass 1 -> Improvement Pass 2 -> Original Category-Leading Plate`).
  - Run `python3 ../jason-design-agent/scripts/lock_and_verify_plates.py verify --study-dir=<study-dir>` and **show all verified images to the designer at the Pre-Moodboard Designer Image Checkpoint BEFORE `build_moodboard.py` runs** (with `round 1`, `round 2`, and `round 3` placed side-by-side in the 3-column grid when 3 rounds are present).

---

## 1. the tri-voice prompt architecture

1. **textural & material description**: exact non-beige substrate micro-texture (brushed 304 steel, deep forest/mint enamel, matte `#0A0B0E` obsidian, cool `#E3E6EA` concrete, `#0C0C0E` pitch black), studio lighting, and photographic honesty.
2. **designer description**: benchmark-inspired layout tension, `>= 38%-45%` negative space, **live `google-font-selection` physical letterform anatomy** (describing stroke contrast, terminals, x-height, and aperture without printing font names as UI text), and `90/10` chromatic discipline.
3. **frontend developer description**: CSS Grid tracks, `1px` crisp borders, exact radii, `40px-48px` buttons/pills with `20px-28px` L/R optical padding (`8px-10px` icon gap), `tabular-nums` prices/telemetry, and complete footers.
4. **4-surface web-safe accessible CSS-to-`2K` font scale (`font_scale_and_pairing.py`) & de-AI product realism**:
   - **Never Pass Bare `"16px"` or Sub-`12px` (`"10-12px"`) Tokens Without Viewport + `% Canvas Height` + Copy Measure**: AI image models lack a CSS layout engine—bare pixel numbers drift wildly between a `1440px` desktop page (`16px` = `1.1%` width) and a `390pt` mobile screen (`16pt` = `4.1%` width). Always generate the surface's exact typography block via `python3 ../jason-design-agent/scripts/font_scale_and_pairing.py prompt-block --surface=<desktop-web|mobile|desktop-app|component> --primary="<Primary>" --secondary="<Secondary>"` and run `font_scale_and_pairing.py audit --prompt-md=<prompts/>` before Round 1 (`0` image rounds wasted fixing fonts):
     - **`desktop-web` (`1440x810` CSS `@1.91x` -> `2752x1536`)**: `H1` `48-60px` (`6.0%-7.4%` canvas H, `<= 9` words, `2-3` lines max); `Body` `16-18px` (`2.0%-2.2%` H, `55-70` chars/line, `2-3` lines); `Buttons/Nav` `14-16px` inside `42-48px` controls; `Floor` `12-13px` (`1.5%-1.6%` H, NEVER `< 12px`).
     - **`mobile` (`390x844` pt `@3.94x` -> `1536x2752`)**: `H1` `28-34pt` (`3.3%-4.0%` H, `<= 7` words, `2` lines max); `Body` `16pt` min (`1.9%-2.1%` H, **`4.1%` canvas W**, `34-42` chars/line across full card width); `Touch Controls` `15-16pt` inside **`>= 44-52pt`** targets (`5.2%-6.2%` H); `4-Tab iOS Bar & Pills` `12-13pt` floor. Never pass only a `1440px` `16:9` desktop plate into a `9:16` mobile render—use a `@3x` mobile capture or `font_scale_and_pairing.py scale-seed --surface=mobile`.
     - **`desktop-app` (`1440x900` CSS `@1.82x` -> `2752x1536`)**: **ban `56-72px` marketing-hero headlines**; `1`-line `24-30px` view title (`2.7%-3.3%` H), `28-36px` `tabular-nums` KPI numerals, `16px` prose drawers, `14-15px` (`1.6%` H) inside `38-44px` data rows (`10-14` visible rows) and `220-240px` sidebar, `12-13px` floor headers/badges.
     - **`component` (`720x540` CSS stage `@3.33x` -> `2400x1792`, card `380-520px` w/ `18%-22%` margin)**: `20-24px` card title (`3.7%-4.4%` H, `1` line), `15-16px` body/inputs (`2.8%-3.0%` H, `32-46` chars/line), `14-15px` inside `40-44px` controls (`7.4%-8.1%` H), `12-13px` floor chips (`0` full-page nav/footer; use cropped widget ref or `scale-seed --surface=component`).
   - **Zero Middle Dots (`·` / `•`) Between Links or Fonts**: NEVER separate navigation items, breadcrumbs, metrics, or footer links with middle dots (`Fleet · Playground · Docs`); use clean open CSS spacing (`24px-32px` gap).
   - **Zero `FIG 0.1` / `Figure 1, Figure 2, Figure 3` Labels**: Ban artificial `FIG 0.1`, `Figure 1-3`, and `01 / ...` ALL-CAPS numbered eyebrows across all layouts.
   - **Pure `#FFFFFF` White (Never Fading into Off-White Beige) & Continuous Top-to-Bottom Grids**: Never let white backgrounds warm/yellow into off-white beige down the scroll, and keep structural `1px` grids continuous and consistent from top hero to bottom footer.
   - **Real Web-Based SaaS UI Components & True `2K` Acutance**: Render genuine web UI tables, inputs, status pills, and charts inside touts (never oversized plain text blocks), and generate full-scroll pages from high-density `16:9` (`1376px+` -> `2048px+` `2K`) viewport slices so every tout down the page is crystal clear at `2K`.

---

## references

- [complete `4 x 3 = 12` `2k` matrix, hub-and-spoke graph & tri-voice prompt template](references/anchor-prompt-and-12-slot-matrix.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
