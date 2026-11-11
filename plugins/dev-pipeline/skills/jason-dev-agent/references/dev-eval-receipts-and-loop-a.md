# 8-Step Developer Receipts & Source Check-Back Specification
## Deterministic Test Execution & In-Loop Quality Receipts

- **Author**: Principal Software Engineer, Google AI & Frontend Systems
- **Target**: `jason-dev-agent`
- **Scope**: Step 1 through Step 8 + Step 7.5 Check-Back Loop -> Designer Checkpoint

---

## 1. The 8 Sequential Developer Steps

Every pass through `jason-dev-agent` executes the 8 steps in strict, deterministic order:

```bash
S=/usr/local/google/home/jfesta/skills
P=<study>/projects/<item-slug>
REF=<study>/concepts/<item-slug>.png

# Step 1: replicate-mock (Inspect tokens, px measurements & 3 buckets)
# Verifies 3-tier component architecture: src/App.tsx, src/data/, src/components/

# Step 2: font-pairing (Type system, primary/secondary/tertiary roles & modular scale)
python3 $S/font-pairing/scripts/eval-font-pairing.py --project=$P [--expect-primary="…"] [--expect-secondary="…"]

# Step 3: image-to-react (React DOM shell & AutoRaterV1 visual match, s_total >= 0.85/0.93)
node    $S/image-to-react/scripts/eval-image-to-react.mjs --project=$P --reference=$REF --skip-build

# Step 4: nano-banana (Target upscale-queue slots only -> 2x Retina & readiness)
python3 $S/nano-banana/scripts/eval-image-readiness.py --project=$P

# Step 5: accessibility (WCAG 2.2 AA contrast >= 4.5:1, 16px body, 24/44px targets, focus rings)
python3 $S/accessibility/scripts/eval-accessibility.py --project=$P [--require-44]

# Step 6: responsiveness (Single unified DOM across 6 viewports: 320px to 1536px)
node    $S/responsiveness/scripts/eval-responsive-pair.mjs --project-dir=$P --desktop-ref=… --mobile-ref=… --skip-build

# Step 7: interaction & feel (0 dead controls, scroll points, animation triggers, 60fps & press)
python3 $S/interaction/scripts/eval-interaction.py --project=$P --require-scroll-points
python3 $S/feel/scripts/eval-feel-and-scroll.py --project=$P

# Step 7.5: 5-turn automated source check-back loop (comp plate + style kit + captures)
python3 $S/jason-dev-agent/scripts/run_checkback_loop.py --project=$P --reference=$REF --iterations=5

# Step 8: golden-template linting & bundle verification
node    $S/golden-template/scripts/lint-golden-template.mjs --dir=<study> --project=<item-slug> --fix
node    $S/jason-dev-agent/scripts/verify_html_bundle.mjs $P/dist/index.html
```

Or execute the consolidated master runner:
```bash
python3 $S/jason-dev-agent/scripts/run_dev_loop.py \
  --project=$P \
  --reference=$REF \
  --require-scroll-points
```

---

## 2. Receipt Schema & Tolerances

| Step | Script | Metric / Target | Failure Threshold | Action on Failure |
| :--- | :--- | :--- | :--- | :--- |
| **Step 1** | Internal check | 3-tier file layout (`src/data/`, `src/components/`, `src/App.tsx`) | Missing folder or file | Scaffold missing structures |
| **Step 2** | `eval-font-pairing.py` | Role lock $\ge 90\%$, Tertiary $\le 15\%$, $0$ fallback leaks | Role lock $< 90\%$ or leaks $> 0$ | Fix CSS tokens in `src/index.css` |
| **Step 3** | `eval-image-to-react.mjs` | $s_{total} \ge 0.85$ floor ($0.93$ target), $0$ collisions | $s_{total} < 0.85$ or collisions $> 0$ | Refine layout tracks in `src/App.tsx` |
| **Step 4** | `eval-image-readiness.py` | $0$ blurry images, $0$ dithered crops | Any mounted image $< 2\times$ CSS size | Trigger targeted Nano Banana upscale |
| **Step 5** | `eval-accessibility.py` | Contrast $\ge 4.5:1$ text ($\ge 3:1$ large), body $\ge 16\text{px}$, targets $\ge 24\text{px}$ | Any contrast or size violation | Tune text color or padding in Tailwind |
| **Step 6** | `eval-responsive-pair.mjs` | $0$ horizontal overflow, $0$ collisions across 6 viewports | Overflow detected or container squashed | Refactor responsive grid classes |
| **Step 7** | `eval-interaction.py` | $100\%$ controls wired to state, valid `[data-scroll-point]` | Dead buttons $> 0$ or missing hooks | Wire React state handlers & scroll anchors |
| **Step 7** | `eval-feel-and-scroll.py` | Scroll $\ge 55\text{fps}$, jank frames $\le 2$, GPU curves | Frame rate $< 55\text{fps}$ or `transition-all` | Replace `transition-all` with GPU properties |
| **Step 7.5** | `run_checkback_loop.py` | 5/5 progressive source checks pass, $s_{total} \ge 0.93$ | Discrepancy diagnosed | Apply surgical code patches & re-evaluate |
| **Step 8** | `lint-golden-template.mjs` | 4 root configs match dating template, `tsc` exits 0 | Type errors or config drift | Run `--fix` and resolve strict TS errors |
| **Step 8** | `verify_html_bundle.mjs` | $0$ script leaks, $0$ JS syntax errors, `#root` mounted | Runtime error or empty `#root` | Fix bundle syntax or React render call |

---

## 3. Dev Turns Tracking

All iterations and receipts are recorded in `<study>/projects/dev-turns.json`:
- `total_dev_turns`: Aggregate count of developer refinement cycles.
- `per_item_turns`: Per-component breakdown of turns spent.
- `per_stage_turns`: Count of defects encountered and resolved per step.
- `last_updated`: ISO 8601 timestamp.
