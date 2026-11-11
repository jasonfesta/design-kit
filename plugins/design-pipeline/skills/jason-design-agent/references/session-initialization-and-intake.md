# Session Initialization & Interactive Intake Protocol (`jason-design-agent`)

This document defines the exact interactive initialization protocol executed immediately upon launching `jason-design-agent`.

---

## Interactive Launch Sequence

Upon activation (`"Activate jason-design-agent"`), the agent immediately executes an interactive questionnaire via `ask_question` (or direct prompt) containing the following sequence:

1. **Question 1 (Core Concept / Prompt)**:
   - *Prompt*: `"What would you like to design today? (Provide a natural-language brief or domain description)"`
2. **Question 2 (Turn Budget)**:
   - *Prompt*: `"How many turns do you want out of the design agent? (e.g. 3, 5, or until approved)"`
3. **Question 3 (Intake Method Selection)**:
   - *Question*: `"How would you like to seed the design research and style range?"`
   - *Options*:
     - `(Recommended) Intake URLs (Research Path)` — Provide live competitor or inspiration URLs.
     - `Style Kit / Folder (Nanofy Path)` — Provide a local folder path containing rendered plates and prompt MDs.
4. **Question 4 (Conditional Follow-up)**:
   - *If Intake URLs selected*: `"Please paste the target URLs (comma-separated or list)."`
   - *If Style Kit selected*: `"Please provide the local folder path to your style kit / plates."`

Once answered, the agent locks the configuration and automatically routes execution into either the **Research + Style Range** pipeline or the **Nanofy** intake pipeline.
