# Uniqueness, Aesthetic Quality & Anti-Regression Metrics (`url-variant`)

`url-variant` solves the core tension of image-to-image design variation: **a variant that is too close to the original is a clone, while a variant pushed without structural and complexity guardrails degrades into simplified, regressed AI junk.**

To guarantee that every Nano Banana 2.1 output is **genuinely unique**, **equally as good as the original**, and **free of structural regression**, [eval_url_variant.py](../scripts/eval_url_variant.py) scores every Desktop and Mobile full-length variant across three deterministic gates:
1. **Axis A — `uniqueness_score` (`0-100`, Pass Floor `>= 75.0`, calibrated to `--stance-dial`)**
2. **Axis B — `quality_score` (`0-100`, Pass Floor `>= 80.0`, including Anti-Regression Complexity Parity)**
3. **Axis C — Cross-Surface Desktop $\leftrightarrow$ Mobile Transfer Coherence (`cross_surface_palette_delta_e <= 22.0`)**

---

## 1. Axis A: Dial-Calibrated `uniqueness_score` (`0-100`, Pass Floor `>= 75.0`)

[eval_url_variant.py](../scripts/eval_url_variant.py) calibrates its color and spatial divergence expectations to the active `--stance-dial` (`0.15` to `1.00`):

| Component | Weight | Metric & Formula | Pass Threshold | What It Prevents |
| :--- | :---: | :--- | :--- | :--- |
| **1. Perceptual Palette Shift** | `30 pts` | Top-6 quantized sRGB clusters converted to CIE $L^*a^*b^*$; area-weighted minimum $\Delta E^*_{ab}$ against all original dominant clusters. | Dial `< 0.35`: $\Delta E \ge 15.0$<br>Dial `0.35 - 0.62`: $\Delta E \ge 22.0$<br>Dial `> 0.62`: $\Delta E \ge 26.0$ | Rejects variants that keep the original site's background, card, or brand accent colors. |
| **2. Spatial RGB Sweet-Spot (`16x16` MAE)** | `25 pts` | Mean absolute RGB delta (`0..255`) across a `16x16` box-downsampled grid comparing Original vs. Variant. | Dial `< 0.35`: `MAE >= 16.0`<br>Dial `>= 0.35`: `22.0 <= MAE <= 130.0` | Rejects near-clones below the floor while catching chaotic noise above the ceiling. |
| **3. Thumbnail Structural Divergence** | `25 pts` | Both images reduced to `64x64` grayscale **edge maps** (color-independent); `structural_divergence = 1 - max(0, pearson(edges_orig, edges_var))`. | Dial `< 0.35`: `>= 0.20`<br>Dial `0.35 - 0.84`: `>= 0.35`<br>Dial `>= 0.85` (`total-reinvention`): `>= 0.55` | Directly measures *"immediately distinguishable from the reference at thumbnail size."* A pure re-color or style filter keeps the edge map nearly identical and scores ~`0.05-0.15`, flagging `structure_too_close_at_thumbnail`. |
| **4. Copy & Brand Zero-Overlap** | `20 pts` | OCR (`tesseract`) + VLM text transcription compared against `dom/desktop-dom.txt` and `dom/mobile-dom.txt` (`forbidden_copy_phrases`). | `trigram_overlap_ratio <= 0.05` (`<= 5%`) and `0` shared brand tokens | Ensures 100% of headlines, nav links, CTAs, metrics, and body copy are newly authored at **every** dial level. |

> [!NOTE]
> Thumbnail divergence (Axis A) and complexity parity (Axis B) are deliberately paired: the variant must be **structurally different at thumbnail size** while matching the original's **sophistication and detail density up close**. Scores are diagnostic readouts for the Designer Review Checkpoint — they never trigger blind auto-retries.

---

## 2. Axis B: `quality_score` & Anti-Regression Gate (`0-100`, Pass Floor `>= 80.0`)

| Component | Weight | Metric & Formula | Pass Threshold | What It Prevents |
| :--- | :---: | :--- | :--- | :--- |
| **1. Multi-Scale Acutance & Sharpness** | `30 pts` | High-frequency (`sigma=1.2`) vs. mid-frequency (`sigma=4.0`) Difference-of-Gaussians standard deviation (`sharpness_ratio = hf_std / mf_std`). | `sharpness_ratio >= 0.28` and `hf_detail_std >= 0.80` | Catches blurry, soft, dithered, or melted glyphs and muddy card borders. |
| **2. Anti-Regression Complexity Parity** | `25 pts` | Ratio of variant mid+high-frequency structural detail density to the original screenshot's detail density (`complexity_retention_ratio = (var_hf + var_mf) / (orig_hf + orig_mf)`). | `complexity_retention_ratio >= 0.82` (hard floor `>= 0.75`) | **Prevents regression into junk**: catches when a model replaces rich charts, tables, code blocks, or 3D graphics with flat, empty placeholder boxes. |
| **3. Orthogonal UI Grid Alignment** | `20 pts` | Ratio of horizontal (`Sobel:0`) + vertical (`Sobel:90`) edge energy on a `512x512` luminance map (`hv_edge_ratio`). | `hv_edge_ratio >= 0.56` | Prevents crooked cards, warped screenshots, perspective tilt, or melted layout containers. |
| **4. Luminance Dynamic Range** | `15 pts` | Global luminance standard deviation (`luminance_std` on `0..255` Grayscale). | `luminance_std >= 18.0` (ideal `>= 28.0`) | Prevents low-contrast gray/beige washouts and unreadable low-contrast text. |
| **5. Vibe Rhythm & Resolution Lock** | `10 pts` | Pearson correlation of `24`-band vertical edge density profile (`0.15 <= r <= 0.90`) + every edge `>= 1024px`. | `min(w, h) >= 1024` and `vibe_edge_rhythm_correlation` in `[0.15, 0.90]` | Proves the variant preserves the original's section cadence, negative-space pacing, and look-and-feel at full Retina density. |

---

## 3. Axis C: Cross-Surface Desktop $\leftrightarrow$ Mobile Transfer Coherence

Because Pass 2 (Mobile) is conditioned on **both** the Mobile screenshot AND the rendered Pass 1 Desktop Variant, [eval_url_variant.py](../scripts/eval_url_variant.py) verifies that the two outputs belong to the exact same design system:

- **`cross_surface_palette_delta_e <= 22.0`**: Dominant color clusters of `variants/desktop-variant-fullpage.png` and `variants/mobile-variant-fullpage.png` must align within $\Delta E^*_{ab} \le 22.0$.
- **Brand & Typography Lock**: Both Desktop and Mobile variants display the exact same new brand wordmark, primary headline font anatomy, and surface material physics.
