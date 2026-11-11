---
name: research
description: >-
  Conducts dual-track taste research—yielding 5 standout real-world benchmark
  examples specifically chosen because they produce 5 visibly different,
  non-beige structural, chromatic, and material results (supported by inner
  design research and 19 specialist directories) from a natural-language user
  prompt before style direction or image generation. Extracts direct layout
  grids, color polarities, surface physics, and hero UI mechanisms while
  logging avoid_fonts. Use at Stage 1 of jason-design-agent or when gathering
  benchmark evidence for designer critiques. Don't use for writing Nano Banana
  prompts (use image-gen) or building React code (use jason-dev-agent).
metadata:
  icon: 🔎
---

# research

```text
jason-design-agent / research (stage 1 · 5 distinct non-beige examples + craft sweep)
────────────────────────────────────────────────────────────────────
input         user_prompt + curated design inspiration mds + live web
              OR a list of urls (pasted / .txt / sites.json) -> url-list intake
core yield    5 standout real-world examples chosen because each produces a
              VISIBLY DIFFERENT structural, chromatic & material result
url intake    entire long desktop page of EVERY url captured FIRST (cdp/playwright @2x)
              -> inspiration/manifest.json -> 1 analyzer agent per url in parallel
              -> 1 synthesizer -> 1 verifier (analyze_inspiration_workflow.py)
anti-beige    explicitly reject warm-beige monoculture; require 5 contrasting
              color/material polarities (optic white/steel, deep color-block,
              nocturnal obsidian, brutalist concrete, stark monochrome, etc.)
support       inner design craft references + cursory 19-directory sweep
guardrails    preserve direct structural/chromatic DNA · log avoid_fonts
```

`research` is Stage 1 of **`jason-design-agent`**. Weak concept runs fail because they gather interchangeable warm-beige sites and average them into mush. `research` solves this at the root by yielding **5 standout real-world benchmark examples** specifically selected so they **produce 5 unmistakably different results** when translated into Nano Banana concepts—backed by inner-design craft touchstones and a cursory sweep across [19 specialist design directories](references/design-directory-sources.md).

---

## workflow checklist

- [ ] **step 0 — url-list intake (when the user supplies urls)**: skip open-web discovery. Run `node scripts/capture_fullpage_devtools.mjs --study-dir=<study> --urls="<pasted list>"` (or `--urls-file=`) **outside the sandbox**. It slugs every url into `research/sources.json`, captures the **entire long desktop page of every url first** (`@2x`, tiled CDP, up to the ImageMagick ceiling), writes `inspiration/manifest.json` + `inspiration/README.md` + `inspiration/<slug>-desktop-fullpage.png` immediately, then runs the mobile pass. Then fan out the analysis across agents with `run_workflow(ScriptPath="scripts/analyze_inspiration_workflow.py", Args={"study_dir": ..., "user_prompt": ...})` — **one analyzer agent per url in parallel** (`research/properties/<slug>.md` + `research/prompts/<slug>-inspiration-prompt.md`), one synthesizer (`research/benchmarks.md` + `research/style-range.md`), one adversarial verifier. Protocol: [url-intake-and-multi-agent-analysis.md](references/url-intake-and-multi-agent-analysis.md). Continue at step 4 with the synthesized style range.
- [ ] **step 1 — enforce chromatic & structural separation across `5-10` named style-range directions**: research all provided/category-leading properties and ensure the resulting **Style Range (`5-10` distinct named styles)** spans contrasting non-beige visual worlds (zero warm-beige/oat/cream monoculture)—for example, optic `#FFFFFF` & brushed steel, crisp mineral alabaster & `1px` Swiss telemetry ledger, nocturnal `#0A0B0E` chiaroscuro, cool raw `#E3E6EA` concrete & architectural grid, stark `#0C0C0E` / `#F7F8FA` split monochrome, technical blueprint cobalt, and chromatic editorial studio.
- [ ] **step 2 — capture pixel-perfect full-webpage screenshots (`capture_fullpage_devtools.mjs` via Chrome DevTools / Playwright) + cursory 19-directory sweep**: run [scripts/capture_fullpage_devtools.mjs](scripts/capture_fullpage_devtools.mjs) to capture the **entire full-length webpage** at `@2x` Desktop (`desktop-fullpage.png` `2880px` wide + 4-column `desktop-fullpage-contact.jpg` + `2K` hero/mid/lower/footer base slices) and `@3x` Mobile (`mobile-fullpage.png` `1170px` wide + `mobile-base-2k.png`), plus `fullpage-callouts.json` mapping **every section and callout from top to bottom**. Visually inspect every capture via `read_file` (falling back to viewport-scrolled slices on sticky-scroll or bot-gated pages), and run a fast scan across `godly.website`, `landdding.com`, `footer.design`, `mobbin.com`, `60fps.design`, `beui.dev`, `backgrounds.supply`, and `fontinlogo.com`.
- [ ] **step 3 — document the full-webpage 5-part anatomical & section-callout breakdown per site (`research/properties/<NN>-<slug>.md`)**: for every researched site, explicitly break down **(1) header**, **(2) navigation**, **(3) every tout & callout across the entire full webpage** (hero + every mid/lower callout card, bento cell, code/diff block, metric strip, and proof rail), **(4) each interaction** (live sandboxes, tabs, code toggles, diff sliders, workflow graphs), and **(5) footer** (colophon, columns, status pill, closure), alongside **textural/material**, **designer**, and **frontend-developer** art-direction specs and `2K` base transfer plates for `image-gen`.
- [ ] **step 4 — compile `research/benchmarks.md` + named `5-10` Style Range + `avoid_fonts` blocklist**: synthesize and **name the `5-10` distinct style directions** that break down the first moodboard, verify squint-test separation (zero default beige), and log proprietary/brand typefaces in `avoid_fonts` so `google-font-selection` pairs fresh live Google Fonts with each style's authentic visual energy.

---

## 1. three layers of direct-inspiration evidence per example

| lens | what `research` locks for direct downstream generation |
| :--- | :--- |
| **textural & material** | Exact physical substrate (brushed 304 steel, matte obsidian, raw cool concrete, color-blocked enamel), light temperature, shadow falloff, zero plastic AI sheen, zero warm-beige default. |
| **designer eye** | Display-to-body scale jumps, asymmetric vs. Swiss-grid tension, negative-space cadence, color-blocking ratios, and focal eye-path taken directly from the benchmark. |
| **frontend developer eye** | Exact column splits (`50/50`, `280px + 1fr`, exposed `1px` grid seams), corner radii (`0px`, `8px`, pill), `2:1` button optical padding, `tabular-nums` alignment, and complete footer closure. |

---

## references

- [url-list intake, desktop-first inspiration capture & multi-agent analysis](references/url-intake-and-multi-agent-analysis.md)
- [headless screenshot capture, dossier template & originality blocklists](references/benchmark-capture-and-evidence-rules.md)
- [19 curated design directories & cursory sweep protocol](references/design-directory-sources.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
