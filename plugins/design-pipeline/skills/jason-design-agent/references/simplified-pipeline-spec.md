# Simplified `jason-design-agent` Pipeline Specification

This document defines the simplified, streamlined 5-step workflow for `jason-design-agent`:

## 1. Stage 0 & Stage 1: Intake & Research/Nanofy
- **Stage 0 Intake Prompt**: At session initialization, `jason-design-agent` explicitly asks the user for either a **natural-language prompt** (to trigger the `research` path) or an **intake of a style kit / folder of plates** (to trigger the `nanofy` path).
- **Turn Budget Prompt**: Simultaneously asks: *"How many turns do you want out of the design agent?"* to lock `design_agent_turns` and the Nano Banana round ceiling (`max_rounds = min(turns, 3)`).

## 2. Stage 2: Style Direction & Font Selection
- Synthesizes research into a named style range, semantic color tokens, and `canon.md` world state.
- Selects typography using `google-font-selection`: locking a **Primary headline font**, a **Secondary body/UI font**, and an optional **Tertiary font** (or clean weight variation of the secondary).

## 3. Stage 3: Image Generation (1K Desktop & Mobile)
- Generates **1K concept plates** initially (one desktop view and one mobile view) to save quota and test core visual direction quickly.
- Pauses for direct designer approval before proceeding further.

## 4. Stage 4: Polish & Prompt Steering (Tout-by-Tout Improvement)
- Iteratively prompt-steers the design using Nano Banana.
- Breaks down every section / **tout** (hero, cards, features, footer) and improves it by pulling visual references and competitor solutions for particular content areas from research.
- Re-renders at 1K until approved. Once approved, scales up to **2K desktop and mobile concept plates**.

## 5. Stage 5: Full Suite Expansion & Moodboard Delivery
- Upon final approval of the core pages, generates the remaining application screens, components, and unique interactive experiences across the chosen direction.
- Publishes the clean `#0c0c0b` lowercase moodboard (`index.html`) with 👍/👎 curation ready for `jason-dev-agent`.
