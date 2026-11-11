# web-safe accessible font pairing & 4-surface nano banana scale (`jason-design-agent`)

## 1. why nano banana drifts on font sizes (and how to lock round 1)

Image models do **not** run a browser CSS layout engine. Passing bare pixel numbers (`"16px"` or `"10-12px"`) without anchoring the logical viewport and copy length causes two chronic failures that burn design turns:

1. **Cross-surface DPR mismatch**: on a `1440x810` desktop page (`2752x1536` `2K`, `1.91x` DPR), `16px` body text occupies `1.1%` of canvas width (`55-70` chars/line). On a `390x844` mobile screen (`1536x2752` `2K`, `3.94x` DPR), `16pt` body text occupies **`4.1%` of canvas width** (`34-42` chars/line)—nearly **4x wider relative to image width**. Blanket `"shrink fonts by 50% to 10-12px"` rules turn mobile and component copy into illegible `< 12px` ants and fail `accessibility` (`eval-accessibility.py`).
2. **Poster-scale inflation on unbudgeted copy**: if a prompt gives 4 words of body text inside a wide column, Nano Banana inflates the font to `30px+` to fill the box; if a prompt gives a 15-word H1 on mobile, Nano Banana either shrinks the H1 or wraps it across 6 lines.

### the 4 visual-spatial anchors nano banana actually obeys

Every `jason-design-agent` prompt (`image-gen`, `polish`, `nanofy`) locks typography on **Round 1** using four synchronized anchors emitted by `scripts/font_scale_and_pairing.py`:

1. **Simulated `1x` Logical Viewport -> Locked `2K` Canvas DPR** (`1440x810` `@1.91x`, `390x844` `@3.94x`, `1440x900` `@1.82x`, or `720x540` `@3.33x` component stage).
2. **Dual CSS + `% of Canvas Height` Scale (`>= 16px` Body, `>= 12px` Floor)** aligned 1:1 with `accessibility` and `font-pairing` so `jason-dev-agent` never has to reject a plate at Stage 1a.
3. **Hard Character-Per-Line & Line-Count Copy Budgets** (fitting `110-160` verbatim chars across `2-3` lines mechanically locks `16px` body scale in raster space).
4. **Control-Height Ruler + Surface-Matched `ImagePaths`**: anchor body cap-height to `42-48px` (`desktop`) or `44-52pt` (`mobile`) buttons, and **always match reference surface aspect/scale** (`desktop-fullpage` `@2x` crop for desktop web; `mobile-fullpage` `@3x` crop or `scale-seed --surface=mobile` for mobile; cropped widget or `scale-seed --surface=component` for isolated components).

---

## 2. the 4-surface web-safe & accessible scale matrix

All ratios satisfy `CSS_px / Logical_Height == Canvas_px / 2K_Canvas_Height` and pass WCAG 2.2 AA (`0` text `< 12px`, `>= 16px` prose body, `>= 24x24px` desktop targets, `>= 44x44pt` mobile touch targets):

| surface | `1x` logical viewport -> `2K` canvas (`DPR`) | `h1` title (`% canvas H` · copy lock) | `h2` / `h3` subheads | accessible body (`% canvas H` · measure lock) | interactive controls & targets | hard `>= 12px` floor (`0` `< 12px` text) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`desktop-web`** *(marketing, brand, commerce)* | `1440 x 810` CSS -> `2752 x 1536` (`1.91x`) | `48-60px` (`6.0%-7.4%` H) · `<= 9` words, `2-3` lines (`16-24` chars/line) | `H2` `32-40px` (`4.0%-4.9%` H) · `H3` `20-24px` (`2.5%-3.0%` H) | **`16-18px`** (`2.0%-2.2%` H) · **`55-70` chars/line**, `2-3` lines (`1.55` lh) | `14-16px` (`500`) inside **`42-48px`** pills/buttons (`5.2%-5.9%` H, `20-28px` L/R pad); `64-72px` navbar | **`12-13px`** (`1.5%-1.6%` H) eyebrows, badges, multi-col footer links |
| **`mobile`** *(mobile web & native iOS/Android)* | `390 x 844` pt -> `1536 x 2752` (`3.94x`) | `28-34pt` (`3.3%-4.0%` H) · `<= 7` words, **`2` lines max** (`14-20` chars/line) | `H2` `20-22pt` (`2.4%-2.6%` H) · `H3` `17-18pt` (`2.0%-2.1%` H) | **`16pt` min** (`1.9%-2.1%` H, **`4.1%` canvas W**) · **`34-42` chars/line**, `2-3` lines (`1.5` lh) | `15-16pt` (`500`) inside **`>= 44-52pt`** touch targets (`5.2%-6.2%` H, `>= 8pt` gap) | **`12-13pt`** (`1.45%-1.55%` H) `4`-tab iOS bar (`84-88pt` tall), pills, timestamps |
| **`desktop-app`** *(SaaS workspace, tool, dashboard)* | `1440 x 900` CSS -> `2752 x 1536` (`1.82x`) | **`24-30px`** view title (`2.7%-3.3%` H) · **`1` line `<= 36` chars** (`0` `64px` hero bloat!) | `H2` `18-20px` panel title + `28-36px` `tabular-nums` KPI numerals | **`16px`** prose/drawers (`1.8%` H); **`14-15px`** (`1.6%` H) in `38-44px` table rows (`10-14` visible rows) & `220-240px` sidebar | `14px` (`500`) inside **`36-40px`** toolbar controls (`>= 24x24px` target floor) | **`12-13px`** (`1.35%-1.45%` H) table headers, status chips, UTC timestamps |
| **`component`** *(isolated UI card / widget specimen)* | `720 x 540` CSS stage -> `2400 x 1792` (`3.33x`, card `380-520px` w/ `18%-22%` margin) | `20-24px` card title (`3.7%-4.4%` H) · `1` line `<= 32` chars (`28-36px` live metric readout) | `H2` `16-18px` (`3.0%-3.3%` H) · `H3` `15-16px` (`2.8%-3.0%` H) | **`15-16px`** (`2.8%-3.0%` H) · **`32-46` chars/line** inside card, `1-2` lines (`1.5` lh) | `14-15px` (`500`) inside **`40-44px`** buttons/tabs/inputs (`7.4%-8.1%` H, `20-24px` L/R pad) | **`12-13px`** (`2.2%-2.4%` H) axis ticks, helper chips (`0` full-page nav/footer) |

---

## 3. live web-safe headline + accessible companion body pairing

Never hardcode a single cliché font (`Inter`, `Roboto`, `Plus Jakarta Sans`, `DM Sans`, `Playfair Display`, `Instrument Serif`, `Cormorant Garamond`, `DM Serif Display`, `Cinzel`) and never pair two loud display faces:

1. **Rank Primary (`Headline` — `H1-H3`) via `recommend_google_fonts.py`**:
   - Must exist in Google's live catalog (`Latn` script, `600/700` or variable `wght`), exclude competitor `avoid_fonts` and AI clichés, and carry unmistakable brand voice.
2. **Pair Secondary (`Companion Body & UI` — `14-18px` Workhorse) via `font_scale_and_pairing.py pair`**:
   - Scored live from Google's official `/Purpose/Easy Reading` + `/Quality/Drawing` + `/Quality/Spacing` + `/Quality/Wordspace` tags.
   - **Hard web-safety gates**: `Latn` subset, multi-weight (`400` + `500/600` or variable `wght` spanning `400..600`), tall x-height, open counters, clear `1 / l / I` and `0 / O` distinction, `tabular-nums`, and zero novelty/condensed/fat-face distortion.
   - **Constructional contrast**: Display / Serif / Slab / Monospace primary pairs with a crisp Humanist or Neo-Grotesque Sans secondary (e.g., `Work Sans`, `Source Sans 3`, `IBM Plex Sans`, `Public Sans`, `Figtree`, `Instrument Sans`, `Atkinson Hyperlegible Next`); Geometric / Grotesque Sans primary pairs with either an Easy-Reading Text Serif (`Source Serif 4`, `Newsreader`, `Literata`, `Lora`) or a neutral Humanist Sans.
3. **Describe Physical Letterform Anatomy in Prompts (Zero Font-Name Badges)**:
   - Nano Banana renders letterforms accurately from **physical stroke/aperture/terminal descriptions**, whereas raw CSS font names risk being printed as literal text pills on screen. `font_scale_and_pairing.py` automatically emits safe anatomy strings for both Primary and Secondary roles.

---

## 4. pre-nano deterministic CLI workflow (`0` image rounds spent on font fixes)

Run these commands in Step 2 (`style-direction`) and Step 3 (`Pre-Nano 10-Iteration Critique`) **before** invoking `image-generator`:

```bash
# 1. Pair a live-ranked Primary Headline font with a Web-Safe Accessible Companion Body font
python3 /usr/local/google/home/jfesta/design-kit/skills/jason-design-agent/scripts/font_scale_and_pairing.py pair \
  --primary="Bricolage Grotesque" --surface=desktop-web --avoid="Helvetica,Futura"

# 2. Emit exact Nano Banana typography + copy-budget blocks per surface
python3 /usr/local/google/home/jfesta/design-kit/skills/jason-design-agent/scripts/font_scale_and_pairing.py prompt-block \
  --surface=mobile --primary="Bricolage Grotesque" --secondary="Work Sans"

# 3. Audit font web-safety, WCAG 2.2 AA hex contrast (>=4.5:1), and prompt .md files BEFORE Round 1
python3 /usr/local/google/home/jfesta/design-kit/skills/jason-design-agent/scripts/font_scale_and_pairing.py audit \
  --surface=desktop-web --primary="Bricolage Grotesque" --secondary="Work Sans" \
  --bg-hex="#0B3D26" --fg-hex="#F4FBF7" --muted-hex="#A8D5BA" \
  --accent-hex="#C9F2DA" --on-accent-hex="#0B3D26" --prompt-md=./study/prompts

# 4. (When no same-surface DevTools screenshot exists) generate a 2K surface scale-seed PNG
python3 /usr/local/google/home/jfesta/design-kit/skills/jason-design-agent/scripts/font_scale_and_pairing.py scale-seed \
  --surface=component --out=./study/seeds/component-scale-2k.png \
  --bg-hex="#F5F7FA" --surface-hex="#FFFFFF" --line-hex="#DCE1E8" --accent-hex="#0B3D26"
```
