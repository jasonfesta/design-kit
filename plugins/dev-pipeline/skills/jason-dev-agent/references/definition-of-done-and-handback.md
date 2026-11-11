# Definition of Done & Designer Checkpoint Specification
## Final Exit Gates for Golden Template React Deliverables

- **Author**: Principal Software Engineer, Google AI & Frontend Systems
- **Target**: `jason-dev-agent`
- **Scope**: Production readiness gate before presenting at Designer Checkpoint

---

## 1. The Definition of Done (DoD)

A Golden Template React deliverable is strictly **Done** and ready for the **Designer Checkpoint** when every condition below evaluates to `TRUE`:

1. **All 8 Developer Steps Pass**:
   Execution of `python3 jason-dev-agent/scripts/run_dev_loop.py --project=<item-slug> --reference=<plate>` exits with status code `0` (`ALL 8 STEPS PASS`).

2. **5-Turn Source Check-Back Converged**:
   Execution of `python3 jason-dev-agent/scripts/run_checkback_loop.py` exits `0`, having completed all 5 progressive verification turns against the Reference Comp Plate, Style Kit, and Screen Captures, producing `<project>/checkback_audit.json` with `"converged": true`.

3. **Comp Matching ($s_{total} \ge 0.93$)**:
   AutoRaterV1 64x64 cell loss scoring (`eval-image-to-react.mjs`) reaches $s_{total} \ge 0.85$ floor and $0.93$ target against the reference plate with zero text/box collisions.

4. **Retina Media Readiness**:
   `eval-image-readiness.py` confirms zero mounted images below $2\times$ CSS Retina dimensions and zero blurry crops in `src/`.

5. **WCAG 2.2 Accessibility Certified**:
   `eval-accessibility.py` confirms contrast $\ge 4.5:1$ (normal text) and $\ge 3:1$ (large display), body text floor $\ge 16\text{px}$ ($\ge 1.5$ line height), minimum touch targets $\ge 24\text{px}$ ($44\text{px}$ touch), visible focus rings, and valid image alt attributes.

6. **Responsive Continuum Continuity**:
   `eval-responsive-pair.mjs` confirms zero horizontal overflow and zero squashed containers across 6 standard viewports (`320px`, `375px`, `768px`, `1024px`, `1440px`, `1536px`).

7. **Zero Dead Buttons & 60fps Frame Budget**:
   `eval-interaction.py` confirms 100% of controls are bound to live React state. `eval-feel-and-scroll.py` confirms effective scroll rate $\ge 55\text{--}60\text{fps}$ and dropped frames $\le 2$.

8. **Strict TypeScript & Headless Mount Verification**:
   `lint-golden-template.mjs --fix` confirms exact configuration parity with canonical `dating` Golden Template and `tsc --noEmit` exits 0. `verify_html_bundle.mjs` validates that `dist/index.html` mounts `#root` with non-empty DOM.

9. **Dev Turns & Moodboard Receipt Recorded**:
   `<study>/projects/dev-turns.json` reflects all developer cycles, and `<study>/index.html` displays the updated turn badge and working `open build` links.

---

## 2. Designer Checkpoint Protocol (Zero Automated Handoff)

Once all Definition of Done gates pass, the agent **MUST PAUSE** at the **Designer Checkpoint**:

- **DO NOT** trigger an automated handoff back to `jason-design-agent`.
- **DO NOT** execute unprompted style revisions or plate regenerations.
- **PRESENT THE DELIVERABLE DIRECTLY IN CHAT**:
  1. **Deliverable Title & Slug**: e.g., `01-website-e2e-test` (Single-page SaaS Landing Page).
  2. **Live Build Path**: Relative path to `dist/index.html`.
  3. **Working Open Link**: Clickable link to preview the compiled bundle in the browser / artifact pane.
  4. **Consolidated Receipt Table**:
     ```text
     [PASS] Step 1: replicate-mock (3 buckets & layout geometry)
     [PASS] Step 2: font-pairing (0 fallback leaks, >=90% role lock)
     [PASS] Step 3: image-to-react (s_total: 0.94, 0 collisions)
     [PASS] Step 4: nano-banana (retina readiness, 0 blurry media)
     [PASS] Step 5: accessibility (WCAG 2.2 AA contrast >= 4.5:1)
     [PASS] Step 6: responsiveness (6 viewports, 0 overflow)
     [PASS] Step 7: interaction & feel (0 dead buttons, 60fps scroll)
     [PASS] Step 7.5: 5-turn source check-back loop (5/5 converged)
     [PASS] Step 8: golden-template lint & headless bundle mount
     ```
  5. **Review Invitation**: Invite the human designer to test the live build, inspect interactions, and request surgical code or styling refinements.
