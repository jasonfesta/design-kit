# The Self-Improving Design Flywheel (`jason-design-agent`)

This document defines the iterative **Self-Improving Design Flywheel** that runs during the concept generation and polish stages before reaching the Designer Image Checkpoint.

---

## 1. The 5-Iteration Self-Improvement Loop
Before presenting concept plates to the designer at the checkpoint, the agent executes an automated iterative loop (configured up to 5 runs):
1. **Full-Page Scope**: Evaluates the entire desktop and mobile canvas from top header/sticky navigation down to the complete footer.
2. **Flywheel Phases (X Runs per Loop)**:
   - **Run N (Critique & Self-Audit)**: Audits typography, color harmony, negative space, and individual tout structure (hero, cards, features, data tables, footers).
   - **Run N+1 (Targeted Micro-Research)**: If an element or tout lacks conviction or fails to improve, the agent immediately searches and pulls fresh visual references, competitor screenshots, and interaction patterns for *that exact tout*.
   - **Run N+2 (Prompt Steering & Nano Re-Render)**: Injects the new visual references and steering instructions into the Nano Banana prompt and re-renders at 1K.
3. **Progressive Convergence**: The loop repeats until the design achieves noticeable category-bar distinction across all 10 steering dimensions, or hits the loop ceiling.

---

## 2. Convergence & Designer Checkpoint
- Once the automated flywheel completes its iterative refinement cycles, the polished 1K desktop and mobile concept plates (across all active style ranges) are presented to the designer at the **Pre-Moodboard Designer Image Checkpoint**.
- After designer approval of the winning direction, generation scales to 2K and expands into the full application screens, components, and experiences before handing off to `jason-dev-agent`.
