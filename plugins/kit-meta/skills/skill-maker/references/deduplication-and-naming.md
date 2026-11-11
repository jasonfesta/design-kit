# skill deduplication, independence tests & lowercase naming (`skill-maker`)

When organizing skills inside `/usr/local/google/home/jfesta/design-kit/skills/`, keep every identifier extremely simple, lowercase, and non-redundant.

## 1. the 4 independence tests

1.  **outcome & eval separation**: each skill owns a distinct deliverable or evaluation stage rather than duplicating another skill's job.
2.  **trigger disambiguation**: each skill's YAML `description` states `Use when...` and `Don't use for...` without angle brackets (`<` or `>`).
3.  **single script ownership**: deterministic scripts in `scripts/` live in one canonical owner skill; text-first evaluation and critique skills remain clean, portable Markdown files (`SKILL.md` + `references/*.md`).
4.  **simple lowercase nomenclature**: folder names use short lowercase `kebab-case` (`nano-banana`, `responsiveness`, `interaction`, `feel`, `design-critique`) and display names stay lowercase (`image to react`, `replicate mock`, `nano banana`, `responsiveness`, `interaction`, `feel`, `design critique`).

## 2. canonical skill map (5 core + 6 `image-to-react` sub-skills)

| clean identifier | display name | role | single canonical responsibility |
| :--- | :--- | :--- | :--- |
| **`skill-maker`** | `skill maker` | core 1 | validates, documents, and packages skills into `.skill` / `.zip` bundles and catalog manifests. |
| **`google-font-selection`** | `font selector` | core 2 | live Google Fonts catalog + tag scoring recommender (`specimen.html`). |
| **`golden-template`** | `golden template` | core 3 | `assets/dating/` React 19 + Vite 7 + Tailwind v4 judge, `tsc` linter, and folder linker. |
| **`image-to-react`** | `image to react` | core 4 | master image-to-React pipeline + Stage 1 visual/DOM dev eval (`eval-image-to-react.mjs`). |
| **`replicate-mock`** | `replicate mock` | sub 4a | 8 pixel-perfection directives, sampled hex tokens, pixel ruler, and bit-for-bit crops. |
| **`nano-banana`** | `nano banana` | sub 4b | low-res to `2x` Retina / `4k` high-res image restoration with zero semantic drift + clean-plate text removal. |
| **`responsiveness`** | `responsiveness` | sub 4c | Stage 2 desktop + mobile + 6-viewport continuum dev eval (`eval-responsive-pair.mjs`) + single-DOM check. |
| **`interaction`** | `interaction` | sub 4d | Stage 3 all-element coverage (`0` dead controls) + sliders, pagination, scroll, and story progression. |
| **`feel`** | `feel` | sub 4e | Stage 4 tactile press/hover physics, GPU `transform`/`opacity` curves, timing, and `0` layout shift. |
| **`design-critique`** | `design critique` | sub 4f | paired designer critique sending every passed dev eval back into `jason-design-agent` against original inspiration. |
| **`warmup`** | `warmup` | core 5 | multi-model pre-bench & post-bench comparator and 100-point tear-apart evaluator. |
