# Google Engineering Architecture & Technical Design Document (TDD)
## `jason-design-agent` & `jason-dev-agent` Autonomous Design-to-Code Harness

- **Author**: Principal Software Engineer, Google AI & Frontend Systems
- **Status**: Production-Ready / Export-Grade
- **Scope**: Canonical lowercase skills workspace (`/usr/local/google/home/jfesta/design-kit/skills/`)

---

## 1. Executive Summary

The `jason-design-agent` $\leftrightarrow$ `jason-dev-agent` harness is an end-to-end autonomous design-to-code pipeline engineered to eliminate warm-beige AI tropes, blurred low-resolution mockups, and single-tweak design inching. 

By enforcing strict separation of concerns between visual taste generation (`jason-design-agent`) and deterministic React DOM/Tailwind implementation (`jason-dev-agent`), the system guarantees production-grade fidelity, WCAG 2.2 accessibility compliance, 60fps interaction budgets, and rigorous self-improving quality loops.

---

## 2. System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INPUT / INTAKE                            │
│   (Natural-Language Prompt | URL List with DevTools | Nanofy Zip Folder) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
 [RESEARCH PATH]                                         [NANOFY PATH]
 • 1 Desktop Fullpage + 1 Mobile Fullpage                • External plates intake
 • Captures typography, colors & grids                   • 90% invariant / 10% mutation
         │                                                       │
         └───────────────────────────┬───────────────────────────┘
                                     ▼
                      [STYLE DIRECTION & FONT SELECTION]
                • Named Style Ranges (research- or plate-derived)
                • Comprehensive Master Style Prompts (lighting, grain, surface)
                • Live Google Fonts Pairing (Primary, Secondary, Tertiary)
                                     │
                                     ▼
                     [MULTI-RANGE 1K CONCEPT GENERATION]
                • 1K Desktop & Mobile plates rendered per range
                                     │
                                     ▼
                     [THE SELF-IMPROVING DESIGN FLYWHEEL]
                • Up to 5 automated inspection & refinement turns at 1K
                • Tout-by-tout micro-research injection & prompt steering
                                     │
                                     ▼
                 [PRE-MOODBOARD DESIGNER IMAGE CHECKPOINT]
                • Acutance validation (lock_and_verify_plates.py verify)
                • Designer curation (👍 / 👎 selections.json)
                                     │
                                     ▼
                        [#0C0C0B LOWERCASE MOODBOARD]
                                     │
                                     ▼
                 [JASON-DEV-AGENT — STAGES 1A THROUGH 4]
                • Replicate-Mock (3-bucket DOM classification)
                • Nano-Banana (targeted 2x Retina upscaling)
                • Font-Pairing & Accessibility (WCAG 2.2 contrast/sizing)
                • Responsiveness, Interaction & Feel (60fps scroll budget)
                                     │
                                     ▼
                 [FINAL JASON-DESIGN-AGENT DESIGN SIGN-OFF]
                • critique/final-design-signoff.md emission
```

---

## 3. Core Subsystem Specifications

### 3.1 Research & Intake Subsystem (`research` & `nanofy`)
- **Deterministic Capture**: Leverages headless Chrome DevTools Protocol (`capture_fullpage_devtools.mjs`) to render full-length web pages at `@2x` desktop and `@3x` mobile, hydrating lazy-loaded WebGL/canvas assets.
- **Active Evidence Harvesting**: Unlike legacy pipelines that blocked asset reuse, research actively catalogs observed typography, surface chromaticity, and layout grids.

### 3.2 Typography & Style Subsystem (`style-direction` & `google-font-selection`)
- **Live Catalog Binding**: Queries live Google Fonts metadata (~1,951 families) via official Feeling/Appearance tag scores (`recommend_google_fonts.py`).
- **Role-Based Hierarchy**: Enforces strict separation between Primary display/headline voices and high-legibility Easy-Reading Body/UI companions (`font_scale_and_pairing.py pair`).

### 3.3 The Self-Improving Design Flywheel (`design-flywheel`)
- **Automated Refinement Iterations**: Executes up to 5 self-guided inspection turns on 1K desktop and mobile concept plates prior to human review.
- **Granular Tout Steering**: Deconstructs every layout section—from the sticky header down to individual tout cards and footers—injecting targeted competitor visual references when a section lacks category-bar distinction.

### 3.4 Engineering Execution & Verification (`jason-dev-agent`)
- **3-Bucket DOM Partitioning**: Separates UI into `native-code` (HTML/CSS/SVG), `crisp-media` ($\ge 2x$), and `upscale-queue` ($< 2x$).
- **Deterministic Test Suites**: Evaluated via automated Python and Node harnesses (`eval-accessibility.py`, `eval-font-pairing.py`, `eval-image-readiness.py`, `eval-responsive-pair.mjs`, `eval-feel-and-scroll.py`).

---

## 4. Verification & Compliance Summary

Every skill in the workspace adheres to rigorous build and validation standards:
- **`validate_and_wrap.py --fix`**: Verifies schema compliance, frontmatter formatting, and structural integrity across all 23 skill packages (`[PASS]` status).
- **`test_google_font_skill.py`**: Validates live Google Fonts catalog synchronization and CSS2 specification generation (`ALL TESTS PASSED`).
- **Zero Stale-Term Audit**: Confirmed zero references to legacy v1 terminology across all markdown references and agent manifests.
