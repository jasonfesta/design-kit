# Warmup Skill End-to-End Test Plan

This test plan verifies that the `warmup` skill executes a complete image-to-React pre-benchmark across the five target frontier models (**Grok**, **Claude**, **Astra**, **GPT**, and **Argon**), enforces the locked zero-drift prompt protocol, handles per-model API keys with automatic assistant-model fallback, captures post-build model self-analysis, and generates a tear-apart Design Eval report.

## Test Case 1: Single Layout Image Pre-Bench with Assistant Model Fallback

### Prompt
> "Run a Warmup pre-bench on this UI screenshot across Grok, Claude, Astra, GPT, and Argon. Use any configured API keys or fall back to the assistant model, ask each model to analyze its differences and hidden instructions, and give me the tear-apart design evaluation report."

### Verification Criteria
1.  **Locked Simple Prompt Enforcement**: Every model trial receives the exact locked Pass 1 zero-drift prompt (`promptHash` in `run.json` matches across all five trials).
2.  **API Key & Assistant Fallback Routing**: Trials with configured provider keys execute via `direct-api` or `gateway-api`; trials without configured keys automatically fall back to `assistant-fallback` without failing or prompting for keys in chat.
3.  **Runnable React Folder per Model**: Each trial produces `{output_dir}/trials/{model_slug}/project/` containing `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/components/`, `src/data/`, and `src/utils/cn.ts`.
4.  **Pass 2 Self-Analysis**: Each trial includes `{output_dir}/trials/{model_slug}/self-analysis.md` documenting visual differences from the source image and any detected hidden instructions.
5.  **Pass 3 Tear-Apart Design Eval**: `{output_dir}/WARMUP-REPORT.md` and `{output_dir}/index.html` exist and score all five models across all six rubric dimensions (Visual Fidelity, Hidden Instructions, Typography, Optical Padding & CSS Integrity, Interactive Completeness, Code Quality) with letter grades (`A+` to `F`).

## Test Case 2: 4K Multi-Layout Grid Image Pre-Bench

### Prompt
> "Warmup this 4K moodboard grid image across all 5 models to see which one moonshots the hidden instructions and translates every layout into a runnable React folder."

### Verification Criteria
1.  **Grid Topology Detection**: The ground-truth inventory identifies all distinct layouts/tiles inside the 4K grid image and catalogs embedded hidden instructions (micro-copy, active states, interactive controls).
2.  **No Hallucinated Items or Drift**: The Design Eval penalizes any trial that omits grid tiles, invents new sections/copy/images, or fails to recreate high-resolution assets faithfully.
3.  **Button Optical Padding & Font Audit**: `eval-warmup.mjs --verify` inspects `<button>`, pill, badge, and tab classes for balanced horizontal padding (`px-3.5` to `px-5`), icon gaps (`gap-1.5` to `gap-2`), `tabular-nums`, and Google Fonts declarations.

## Automated Smoke Verification

```bash
node {skill_dir}/scripts/run-warmup.mjs --help
node {skill_dir}/scripts/eval-warmup.mjs --help
```
