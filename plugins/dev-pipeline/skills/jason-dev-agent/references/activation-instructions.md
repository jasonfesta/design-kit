# Activating and Using `jason-dev-agent` in Chat

Once installed and enabled in your workspace, `jason-dev-agent` is ready to take curated study folders from `jason-design-agent` and build production-grade, standalone **React 19 + Vite 7 + Tailwind v4** applications adhering to the Golden Template standard.

---

## 1. Activation Command

To activate the developer agent, simply type in chat:

> **"Activate jason-dev-agent"**

*(Alternative triggers: `"Run jason-dev-agent"`, `"Build with dev agent"`, `"Start jason-dev-agent"`)*

---

## 2. Interactive Intake Protocol

Immediately upon activation, `jason-dev-agent` engages you with an interactive questionnaire (via `ask_question` or direct prompt) to lock in build parameters:

1. **Study / Project Directory**:
   - *"Where is the curated design study folder or project directory?"*
   - Example: `/path/to/<study-slug>/` (containing `selections.json`, `concepts/` or `nano/`, `style-direction/`, and `canon.md`).

2. **Build Scope Selection**:
   - *"Which components or screens would you like to build?"*
   - Options:
     - `(Recommended) All approved plates (selections.json with selected: true)`
     - `Specific plate or component (provide slug)`

3. **Dev Flywheel & Frame Budget Settings**:
   - *"Would you like to customize the Dev Flywheel settings?"*
   - Default: 5 check-back cycles, **40-minute timeout ceiling (2400s)**, strict `[data-scroll-point]` hooks, and 60fps frame budget.

4. **Preview & Deployment Target**:
   - *"Where should the live build preview be rendered?"*
   - Options:
     - `(Recommended) Local Right-Hand Artifact Pane & localhost`
     - `Deploy to x20` *(only when explicitly requested)*

---

## 3. What Happens Next (The 8 Steps + Dev Flywheel)

Once parameters are locked, `jason-dev-agent` executes the deterministic pipeline in strict developer voice:

1. **Step 1: `replicate-mock`** $\rightarrow$ Extracts sRGB hex tokens and partitions regions into `native-code`, `crisp-media`, and `upscale-queue`.
2. **Step 2: `font-pairing`** $\rightarrow$ Binds Google Fonts to Primary (H1–H3), Secondary (body/UI), and Tertiary ($\le 15\%$) CSS tokens.
3. **Step 3: `image-to-react`** $\rightarrow$ Synthesizes modular React 19 architecture (`src/data/`, `src/components/`, `src/App.tsx`) and verifies visual match ($s_{total} \ge 0.85/0.93$).
4. **Step 4: `nano-banana`** $\rightarrow$ Upgrades only `upscale-queue` slots to exact $2\times$ CSS Retina assets (`eval-image-readiness.py`).
5. **Step 5: `accessibility`** $\rightarrow$ Enforces WCAG 2.2 AA contrast ($\ge 4.5:1$), $16\text{px}$ body floor, and $24/44\text{px}$ targets.
6. **Step 6: `responsiveness`** $\rightarrow$ Reflows a single semantic DOM across 6 viewports (`320px` to `1536px`) with zero overflow.
7. **Step 7: `interaction & feel`** $\rightarrow$ Wires 100% of controls to React state hooks ($0$ dead buttons), adds `[data-scroll-point]` anchors, and audits 60fps frame budgets.
8. **Step 7.5: `dev flywheel`** $\rightarrow$ Continuously checks the 5 sources (Comp Plate, Style Kit, Captures) and auto-patches code until all pass or hitting the **40-minute timeout (2400s)**.
9. **Step 8: `golden-template`** $\rightarrow$ Runs strict TypeScript compilation (`tsc exit 0`) and headless VM bundle verification (`verify_html_bundle.mjs`).
10. **Finish: `Designer Checkpoint`** $\rightarrow$ Pauses directly in chat, presenting the live build path, consolidated receipt table, and working `[Open Build]` link for human review.
