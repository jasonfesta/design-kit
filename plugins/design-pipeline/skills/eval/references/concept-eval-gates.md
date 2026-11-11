# deterministic checks & `eval/concept-eval.md` scorecard template (`eval`)

---

## 1. quick sandboxed image geometry & color sanity check

Before visual inspection with `read_file` and BEFORE `build_moodboard.py`, run `lock_and_verify_plates.py verify` inside the standard sandbox (`BypassSandbox: false`) to verify that all generated PNGs exist, meet `min(w, h) >= 1024` (`>= 1K` on every edge, `2K` lossless sRGB `.png`), pass crystal-clear acutance (`sharpness_ratio >= 0.28`, `hf_detail_std >= 0.8`), and emit `critique/pre-moodboard-image-checkpoint.md`:

```bash
python3 /usr/local/google/home/jfesta/design-kit/skills/jason-design-agent/scripts/lock_and_verify_plates.py verify --study-dir=.
```

- **aspect-ratio check**:
  - Desktop web plates (`web/`): landscape / wide (`aspect >= 1.5`, typically `2752x1536` or widescreen `2K`).
  - Mobile app plates (`app/`): consistent mobile portrait (`~9:19.5` / `1:2`, e.g. `1536x2752` portrait `2K`).
  - Component plates (`component/`): natural component bounds (`~1792x1344` or `2400x1792`) with clean outer studio margin and zero clipped borders.
  - Interactive experience plates (`experience/`): bespoke immersive canvas/sandbox bounds (`2752x1536` or `2400x1792`).

---

## 2. `eval/concept-eval.md` scorecard template

```markdown
# concept evaluation scorecard (`eval/concept-eval.md`)

- **study**: `<study-slug>`
- **user turn budget (`design_agent_turns`)**: `<N>`
- **nano banana round ceiling**: `<min(N, 3)>` (hard max = `3`)
- **golden anchor (`01-web-01-*.png`)**: `<PASSED | NEEDS_POLISH>` (rounds used: `<1..3>`)
- **anti-clone originality audit (vs. 5 standout benchmarks)**:
  - `avoid_fonts` collision check: `0 copied benchmark fonts`
  - `avoid_palettes` collision check: `0 copied benchmark brand palettes`
  - layout & trademark check: `0 copied benchmark compositions or marks`
- **surface distinctness check**: `<distinct functional jobs verified across all slots>`

## per-slot gate table (`01..12` or multi-direction plates)

| slot | file | dims | rounds (`<=3`) | g1 anchor | g2 original | g3 canon | g4 frame/footer | g5 distinct | status | surgical `polish` / `jason-dev-agent` note |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| `01` | `web/01-web-01-<slug>.png` | `2752x1536` | `1/3` | pass | pass | pass | pass | pass | `FROZEN` | locked golden anchor |
| `02` | `web/02-web-02-<slug>.png` | `2752x1536` | `2/3` | pass | pass | pass | pass | pass | `FROZEN` | round 2 completed full legal footer |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
```

---

## 3. tri-perspective brutal audit & 10-dimension auto-correction matrix

When any slot fails any gate or enters a new turn / Round 2, `eval` invokes the tri-perspective audit and enforces that auto-correction addresses **all 10 steering dimensions simultaneously** (anti-inching rule: no turn may ever inch only 1 or 2 small tweaks).

Run the automated audit CLI:

```bash
python3 /usr/local/google/home/jfesta/design-kit/skills/design-critique/scripts/run_critique_swarm.py audit \
  --plate=concepts/web/01-web-01.png \
  --benchmarks=research/benchmarks.md \
  --prompt="modern coffee shop"
```

### the 3 brutal perspectives
1. **Perspective A — Pure Designer Taste**: typography anatomy, letter-spacing, optical padding (>= 38-45% negative space), color polarity, and surface materiality.
2. **Perspective B — Benchmark Research Cross-Reference**: direct structural/chromatic fidelity to the 5 standout benchmarks while strictly purging `avoid_fonts`, `avoid_palettes`, and cloned layouts.
3. **Perspective C — Ruthless Self-Audit**: interrogates prior agent shortcuts, compromises, timid font choices, and beige defaults.

### the 10 auto-correction dimensions (anti-inching rule)
1. **Grid & Layout Architecture**: CSS Grid tracks, asymmetric focal points, margin pauses, complete footer.
2. **Google Fonts & Letterform Anatomy**: <= 2 Google Fonts, authentic pairing, tabular-nums.
3. **Chromatic Polarity & 90/10 Balance**: Decisive non-beige world, 90% dominant tone, 10% high-energy spark.
4. **Negative Space & Optical Padding**: >= 38-45% open breathing room, 2:1 pill button padding ratio.
5. **Hero Visual & Signature Focal Mechanic**: Cinema 4D 3D glass/metal or quantized 2D vector, bespoke interactive hook.
6. **Domain Canon Copy & Telemetry**: Insider domain vocabulary, realistic metrics, zero generic lorem ipsum.
7. **Tactile Materiality & Surface Physics**: Brushed 304 steel, micro-grain paper, zero plastic AI haze.
8. **Multi-Surface & Viewport Parity**: Seamless continuity from desktop widescreen to 390px mobile ergonomics.
9. **Component Modularity & Systemic Grammar**: Distinct functional jobs across all widgets with shared token grammar.
10. **Benchmark Differentiation & Cliché Purge**: Purges generic modern web tropes while retaining benchmark excellence.
