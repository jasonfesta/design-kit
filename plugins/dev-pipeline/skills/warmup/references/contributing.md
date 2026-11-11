# Contributing to the Warmup Skill

Follow these guidelines when updating the `warmup` skill, its reference documents, or its helper scripts (`scripts/check_models.py`, `scripts/prepare_and_extract.py`, `scripts/run_warmup.py`, `scripts/compare_builds.py`, and `scripts/eval_warmup.py`).

## Core Invariants

1.  **Keep the Pass 1 Prompt Simple and Identical Across Models**:
    -   Never inject model-specific hints, component trees, or complex multi-page instructions into the Pass 1 user prompt in `SKILL.md`, `references/prompt-protocol.md`, or `scripts/run_warmup.py`.
    -   Warmup is a pre-bench designed to test raw image-to-React translation and hidden-instruction discovery under a minimal zero-drift prompt.
2.  **Preserve 3-Tier Model Routing & Assistant Fallback**:
    -   All five default model slots (`grok`, `claude`, `astra`, `gpt`, `argon`) must support direct provider API keys, gateway routing (`PORTKEY_API_KEY` / `OPENROUTER_API_KEY`), and automatic fallback to the active assistant model (`assistant-fallback`).
    -   Never make external API keys mandatory for the skill or scripts to initialize and run.
    -   Always redact API keys (`[REDACTED]`) before writing any file to disk.
3.  **Runnable Golden Template Project Folders**:
    -   Every model trial output in `{output_dir}/trials/{model_slug}/project/` must contain a complete, self-contained React + TypeScript + Vite + Tailwind v4 project folder (`index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/components/`, `src/data/`, `src/utils/cn.ts`).
4.  **Google Skill Readability Compliance**:
    -   Keep `SKILL.md` under 500 lines using progressive disclosure into `references/*.md`.
    -   Do not place executable paths or CLI flags in the YAML frontmatter `description`.
    -   Do not use Unicode em dashes (`U+2014`) or en dashes (`U+2013`) inside fenced code blocks or inline backticks (`SNIPPET_EM_DASH`).
    -   Use relative links (`references/...`, `scripts/...`) with descriptive anchor text.

## Verification Before Submitting Changes

Run the CLI smoke checks and verify a sample Warmup run:

```bash
python3 scripts/check_models.py --help
python3 scripts/prepare_and_extract.py --help
python3 scripts/run_warmup.py --help
python3 scripts/compare_builds.py --help
python3 scripts/eval_warmup.py --help
```
