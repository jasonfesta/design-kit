---
name: url-variant
description: >-
  Captures full-length desktop and mobile screenshots plus complete desktop
  and mobile DOM text from any URL using Google Chrome DevTools Protocol,
  builds and locks the complete 10-section variation prompt architecture ahead
  of time (Stance Dial 0.10 to 1.00, 8 canonical Design Style Stances, live
  Google Fonts with 4-surface CSS-to-2K scale locks, and per-band widget/copy
  blueprints), executes a two-pass screenshot-conditioned Nano Banana 2.1
  transfer (Pass 1 Desktop; Pass 2 Mobile conditioned on BOTH Mobile Capture
  and Desktop Variant), computes diagnostic Uniqueness, Quality, and
  Non-Regression scores, and presents the output at a Designer Review
  Checkpoint. Use when creating a unique design variation from a live URL.
  Don't use for 1-to-1 faithful plate refreshes that keep copy verbatim (use
  nanofy).
metadata:
  icon: 🧬
---

# url-variant

```text
url-variant (devtools capture -> upfront prompt architecture -> 2-pass nano banana 2.1 -> score & designer review)
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
input         live url + stance dial (0.10..1.00, default 0.65) + style stance (8 stances or auto)
step 1        chrome devtools capture (scripts/capture_url_devtools_and_dom.mjs)
              - captures/desktop-fullpage.png (@2x 1440px -> 2880px wide, long-form + 2K bands)
              - captures/mobile-fullpage.png  (@3x 390pt  -> 1170px wide, long-form + 2K bands)
              - dom/desktop-dom.txt + dom/mobile-dom.txt (full dom + shadow/flutter semantics text)
              - dom/dom-audit.json (forbidden copy, avoid_fonts, avoid_colors, widget counts, flutter)
step 2        UPFRONT PROMPT ARCHITECTURE & PRE-FLIGHT LOCK (scripts/plan_and_run_variant.py plan)
              (done 100% AHEAD OF TIME because variation happens while passing in the screenshot)
              - visually inspect desktop & mobile captures via read_file + dom-audit.json
              - lock Stance Dial, Style Stance, WCAG 2.2 AA 8-token palette & live Google Fonts
              - write variants/variation-blueprint.md + 10-section prompts (variants/prompts/*.md)
              - run pre-flight prompt audit (audit-prompts: WCAG contrast, 0 font/copy collisions)
step 3        2-pass screenshot-conditioned nano banana 2.1 transfer (scripts/plan_and_run_variant.py run)
              - pass 1 (desktop): passes desktop screenshot bands + pre-architected prompt
                                  -> variants/desktop-variant-fullpage.png + 2K
              - pass 2 (mobile):  passes BOTH mobile screenshot band AND rendered desktop variant
                                  -> variants/mobile-variant-fullpage.png + 2K
step 4        diagnostic regression/uniqueness score & DESIGNER REVIEW CHECKPOINT (scripts/eval_url_variant.py)
              - computes 3 diagnostic scores (0-100): uniqueness_score, quality_score, regression_score
              - emits variants/designer-review-checkpoint.md + <study-dir>/index.html
              - pauses and presents images + scores directly to the designer for review & calibration
```

`url-variant` takes any live URL, captures **full-length long-form screenshots** of both **Desktop** and **Mobile** alongside the **DOM of both Desktop and Mobile as text** via Google Chrome DevTools Protocol (CDP), and architects the entire variation **ahead of time** (`variants/variation-blueprint.md`) before passing the screenshots into **Nano Banana 2.1**. Once the Desktop and Mobile variants are rendered, it computes a clean **Uniqueness | Quality | Non-Regression** scorecard and presents the results directly to the **Designer for review**.

---

## Workflow Checklist

- [ ] **Step 1 — Capture Full-Length Desktop & Mobile Screenshots + DOM Text via Chrome DevTools (`scripts/capture_url_devtools_and_dom.mjs`)**:
  Run [capture_url_devtools_and_dom.mjs](scripts/capture_url_devtools_and_dom.mjs) outside the sandbox (`BypassSandbox: true`):
  ```bash
  node /usr/local/google/home/jfesta/design-kit/skills/url-variant/scripts/capture_url_devtools_and_dom.mjs \
    --url="https://example.com" \
    --out-dir="/path/to/study" \
    --max-viewports=6
  ```
  Verify that all 5 capture deliverables exist:
  1. `captures/desktop-fullpage.png` (`@2x` `1440px` $\rightarrow$ `2880px` wide) + `captures/tiles/desktop-band-01..NN.png`
  2. `captures/mobile-fullpage.png` (`@3x` `390pt` $\rightarrow$ `1170px` wide) + `captures/tiles/mobile-band-01..NN.png`
  3. `dom/desktop-dom.txt` and `dom/desktop-dom.html` (including open Shadow DOM and Flutter `flt-semantics`)
  4. `dom/mobile-dom.txt` and `dom/mobile-dom.html`
  5. `dom/dom-audit.json` (cataloguing `avoid_fonts`, `avoid_bg_colors`, `avoid_text_colors`, `forbidden_copy_phrases`, per-section `interactiveSignals`, and `artifacts_detected`).

- [ ] **Step 2 — Architect & Lock the Complete Variation Blueprint Ahead of Time (`scripts/plan_and_run_variant.py plan` + `audit-prompts`)**:
  Because Nano Banana 2.1 executes the variation *while* receiving the captured screenshot as its image-to-image reference, **all prompt architecture must be completed and audited ahead of time**:
  1. **Deep Visual + DOM Inspection**: Call `read_file` on `captures/desktop-fullpage.png`, `captures/mobile-fullpage.png`, and `dom/dom-audit.json`. Catalog every hero visual mechanic, interactive widget (`tabs`, `tables`, `codeSamples`, `canvases`, `svgs`, `cards`), and layout split so the prompt explicitly transforms each one without regression.
  2. **Select Stance Dial & Style Stance**: Choose `--stance-dial` (`0.15-0.30` `subtle-sibling`, `0.40-0.60` `editorial-reframe`, `0.65-0.85` `theme-polarity-inversion` [default], or `0.90-1.00` `archetype-transmutation`) and `--style-stance` ([style stances and variation dial guide](references/style-stances-and-variation-dial.md)).
  3. **Generate & Pre-Audit the 10-Section Prompts**:
     ```bash
     python3 /usr/local/google/home/jfesta/design-kit/skills/url-variant/scripts/plan_and_run_variant.py plan \
       --study-dir="/path/to/study" \
       --stance-dial=0.65 \
       --style-stance=auto \
       --brand-name="KINETIX LABS" \
       --visual-notes="Hero features a split 50/50 stage with an interactive 3D node mesh on the right; Band 2 has a 3-card bento grid with live latency sparklines and a tabbed CLI terminal."
     ```
     This writes `variants/variation-blueprint.md` and `variants/prompts/*.md`, and runs the **Pre-Flight Prompt Audit** (`audit-prompts`) verifying WCAG 2.2 AA token contrast (`>= 4.5:1`), `0` font collisions with `avoid_fonts`, `4`-surface CSS-to-`2K` scale locks (`font_scale_and_pairing.py`), and all 10 prompt sections ([deep transfer prompt architecture](references/deep-transfer-prompt-architecture.md)).

- [ ] **Step 3 — Execute the Two-Pass Screenshot-Conditioned Nano Banana 2.1 Transfer (`scripts/plan_and_run_variant.py run`)**:
  - **Pass 1 (Desktop Variant — Passing in the Desktop Screenshot + Pre-Architected Prompt)**:
    ```bash
    python3 /usr/local/google/home/jfesta/design-kit/skills/url-variant/scripts/plan_and_run_variant.py run \
      --study-dir="/path/to/study" \
      --pass=desktop \
      --route=gempix
    ```
  - **Pass 2 (Mobile Variant — Passing in BOTH the Mobile Screenshot AND the Rendered Desktop Variant)**:
    ```bash
    python3 /usr/local/google/home/jfesta/design-kit/skills/url-variant/scripts/plan_and_run_variant.py run \
      --study-dir="/path/to/study" \
      --pass=mobile \
      --route=gempix
    ```
  *(If generating via the `image-generator` subagent, pass `ImagePaths` from `reference_images` in `variants/variant-plan.json`, then run `plan_and_run_variant.py stitch --study-dir="/path/to/study"` inside the sandbox.)*

- [ ] **Step 4 — Score Uniqueness, Quality & Non-Regression and Present at the Designer Review Checkpoint (`scripts/eval_url_variant.py`)**:
  Run [eval_url_variant.py](scripts/eval_url_variant.py) to compute the diagnostic scores without triggering automated re-generation loops:
  ```bash
  python3 /usr/local/google/home/jfesta/design-kit/skills/url-variant/scripts/eval_url_variant.py \
    --study-dir="/path/to/study"
  ```
  Present the generated images (`variants/desktop-variant-fullpage.png`, `variants/mobile-variant-fullpage.png`, `variants/comparison-contact-sheet.jpg`), the `variants/designer-review-checkpoint.md` scorecard, and `<study-dir>/index.html` **directly to the Designer for review** so the designer can evaluate the call and dial in any adjustments.

---

## 1. Upfront 10-Section Prompt Architecture (Locked Before Generation)

Every prompt in `variants/prompts/<surface>-variant-band-<NN>.md` is built **ahead of time** with 10 explicit locks ([deep transfer prompt architecture](references/deep-transfer-prompt-architecture.md)):

1. **Use Case, Stance Dial & Orthographic Framing**: Locks `ui-mockup`, `--stance-dial` (`0.10..1.00`), `--style-stance`, and flat full-bleed orthographic framing (`0` bezels or angled desks).
2. **Pass-Specific Screenshot Conditioning Roles**: Pass 1 conditions on the Desktop capture; Pass 2 conditions on **both** the Mobile capture (`390pt` vertical reflow) and the rendered Desktop Variant (style/palette/brand transfer).
3. **Voice 1 — Textural & Material World**: Physical substrate micro-texture, studio lighting, and zero plastic AI sheen.
4. **Voice 2 — Live Google Fonts & 4-Surface CSS-to-2K Scale Lock**: Live-ranked Primary + Companion Google Fonts (`font_scale_and_pairing.py`) with physical letterform anatomy and exact `desktop-web` vs. `mobile` `% canvas height` and character-per-line budgets.
5. **8-Token WCAG-Verified Chromatic System**: All 8 hex tokens pre-audited ahead of time for WCAG 2.2 AA contrast (`>= 4.5:1`) and CIE $L^*a^*b^*$ $\Delta E^*_{ab}$ separation from `avoid_bg_colors` and `avoid_text_colors`.
6. **Voice 3 — Frontend Developer Grid & Optical Padding**: Exact column splits, `1px` continuous seams, corner radii, `42-48px` buttons with `2:1` L/R optical padding, `tabular-nums`, and `0` middle dots (`·`).
7. **Anti-Regression Complexity & Interactive Widget Lock**: Inventories every `tab`, `table`, `code` block, `canvas`, `svg`, and `card` in that band from `dom-audit.json` + visual inspection so rich UI never simplifies into empty boxes.
8. **Ordered Region-by-Region Verbatim New Copy**: Exact replacement copy for Region A (Header/Section Title), Region B (Hero/Bento/Interactive Stage), and Region C (Telemetry/Footer Closure).
9. **Flutter & DOM Artifact Remediation**: Strips `flt-glass-pane` canvas blur, `DEBUG` ribbons, builder watermarks, cookie modals, and repeated sticky navbars ([flutter and artifact remediation](references/flutter-and-artifact-remediation.md)).
10. **Hard Anti-Clone & Anti-Leakage Exclusions**: Bans all `forbidden_copy_phrases`, `avoid_fonts`, raw hex strings printed on screen, font names printed as text, and `FIG 0.1` labels.

---

## 2. Diagnostic Scorecard Readout for Designer Review (`eval_url_variant.py`)

Full mathematical details live in [uniqueness, quality, and non-regression metrics](references/uniqueness-and-quality-metrics.md). After generation, `eval_url_variant.py` outputs three `0-100` scores per surface in `variants/designer-review-checkpoint.md`:

| Diagnostic Score | Scale | What It Measures for the Designer |
| :--- | :---: | :--- |
| **`uniqueness_score`** | `0 - 100` | Dial-calibrated CIE $L^*a^*b^*$ palette shift ($\Delta E^*_{ab}$), `16x16` RGB MAE in the variant sweet-spot, and `0%` brand/copy overlap with `desktop-dom.txt` / `mobile-dom.txt`. |
| **`quality_score`** | `0 - 100` | Standalone visual craft: multi-scale `2K` acutance (`sharpness_ratio`, `hf_detail_std`), orthogonal UI grid alignment (`hv_edge_ratio`), luminance contrast, and `>= 1K` resolution. |
| **`regression_score`** | `0 - 100` (`100` = Zero Regression) | Direct parity against the original screenshot: **Complexity & Detail Retention (`complexity_retention_ratio`)**, **Sharpness Parity (`sharpness_parity_ratio`)**, **Grid Orthogonality Parity (`grid_parity_ratio`)**, and **Vertical Section Rhythm Correlation**. |

---

## References

- [Design style stances (8 canonical stances) and the variation stance dial (0.10 to 1.00)](references/style-stances-and-variation-dial.md)
- [Upfront prompt architecture and two-pass screenshot-conditioned image-to-image transfer](references/deep-transfer-prompt-architecture.md)
- [Diagnostic uniqueness, quality, and non-regression score formulas](references/uniqueness-and-quality-metrics.md)
- [Flutter Web semantics, shadow DOM extraction, and artifact remediation rules](references/flutter-and-artifact-remediation.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
