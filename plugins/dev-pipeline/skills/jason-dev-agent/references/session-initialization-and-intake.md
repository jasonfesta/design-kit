# Session Initialization & Interactive Intake Protocol (`jason-dev-agent`)

This document defines the exact interactive initialization protocol executed immediately upon launching `jason-dev-agent`.

---

## Interactive Launch Sequence

Upon activation (`"Activate jason-dev-agent"`), the agent immediately executes an interactive questionnaire via `ask_question` (or direct prompt) containing the following sequence:

1. **Question 1 (Curated Study Folder)**:
   - *Prompt*: `"Where is the curated design study folder or project directory? (Provide path to <study-slug> containing selections.json, plates, and style-direction)"`

2. **Question 2 (Build Scope Selection)**:
   - *Question*: `"Which approved components or screens would you like to build?"`
   - *Options*:
     - `(Recommended) All approved plates (selections.json with selected: true)`
     - `Specific plate or component (provide item slug)`

3. **Question 3 (Dev Flywheel & Frame Budget Settings)**:
   - *Question*: `"Would you like to configure the Dev Flywheel (source check-back loop) settings?"`
   - *Options*:
     - `(Recommended) Default (5 cycles, 40-minute timeout ceiling / 2400s, 60fps frame budget)`
     - `Fast Audit (1 cycle, skip auto-remediation)`
     - `Strict Production (Require 44px touch targets & explicit [data-scroll-point] hooks)`

4. **Question 4 (Preview Deployment Target)**:
   - *Question*: `"Where should the live compiled React bundle be previewed?"`
   - *Options*:
     - `(Recommended) Local Right-Hand Artifact Pane & localhost (Default)`
     - `Deploy to x20 web hosting (explicit request only)`

Once answered, the agent locks the build configuration, reads `selections.json`, locates the 2K concept plates and style kit, and automatically begins execution at **Step 1 (`replicate-mock`)**.
