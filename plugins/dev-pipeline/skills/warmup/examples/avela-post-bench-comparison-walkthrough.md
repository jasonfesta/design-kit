# Example: Post-Bench Comparison Across AVELA Builds (`warmup`)

This walkthrough shows how to run `warmup` in **Post-Bench Mode (`--mode=post-bench`)** to compare the canonical Golden Template AVELA build (`01-website-avela`) head-to-head against frontier model translations (`AVELA-GPT6-Astra` and `Avela - Grok 4.7`).

## 1. Stage Existing AVELA Builds Against the Reference Image

```bash
python3 /usr/local/google/home/jfesta/skills/warmup/scripts/run_warmup.py \
  --mode=post-bench \
  --image=/usr/local/google/home/jfesta/moodboards/homepage-study/images/desktop/01-avela.png \
  --output=/tmp/warmup_avela_postbench \
  --builds=golden=/usr/local/google/home/jfesta/wda/prototypes/01-website-avela,astra=/usr/local/google/home/jfesta/wda/prototypes/AVELA-GPT6-Astra,grok="/usr/local/google/home/jfesta/wda/prototypes/Avela - Grok 4.7"
```

## 2. Run Headless WebKit2GTK DOM & `AutoRaterV1` Visual Diffing

```bash
xvfb-run -a python3 /usr/local/google/home/jfesta/skills/warmup/scripts/compare_builds.py \
  --run-dir=/tmp/warmup_avela_postbench
```

Produces per-build `rendered.png`, `rendered_overlay.png` (50/50 blend), `diff_mask.png` (64×64 loss heatmap), `side_by_side.png`, live DOM optical button-padding & glyph-geometry audits (`BORDER_AND_DIVIDER_CROWDING`, `PLUMBLINE_AXIS_DRIFT`, `LIST_AND_CARD_CONSISTENCY`), and `comparison/all_builds_comparison.png`.

## 3. Generate the 100-Point Tear-Apart Scorecard

```bash
python3 /usr/local/google/home/jfesta/skills/warmup/scripts/eval_warmup.py \
  --run-dir=/tmp/warmup_avela_postbench --verify
```

Emits `/tmp/warmup_avela_postbench/WARMUP-REPORT.md`, `index.html`, and `scores.json` detailing what each build got right, `[P0]/[P1]/[P2]` defects, 3-zone vertical fidelity (`Zone A Top 0-25%`, `Zone B Middle 25-75%`, `Zone C Bottom 75-100%`), and pairwise build deltas.
