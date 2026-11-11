# Activating and Using `jason-design-agent` in Chat

Once installed and enabled in your workspace, `jason-design-agent` is ready to orchestrate taste-first research, style ranging, multi-range 1K generation, the self-improving design flywheel, and engineering handoff to `jason-dev-agent`.

---

## 1. Activation Command
Simply type in chat:
> **"Activate jason-design-agent"**

---

## 2. Interactive Intake Protocol
Immediately upon activation, the agent engages you with an interactive questionnaire to lock in your project parameters:
1. **Natural Language Brief**: *"What would you like to design today? (Provide a brief or domain description)"*
2. **Turn Budget**: *"How many turns do you want out of the design agent? (e.g. 3, 5, or until approved)"*
3. **Intake Method Selection**:
   - **Intake URLs (Research Path)** $\rightarrow$ prompts you to paste your target competitor or inspiration URLs.
   - **Style Kit / Folder (Nanofy Path)** $\rightarrow$ prompts you to provide the local folder path containing your rendered plates and prompt MDs.

---

## 3. What Happens Next (The Pipeline)
- **Style Ranges & Fonts**: The agent establishes style ranges from your URLs or plates, writes comprehensive master prompts, and locks typography (`google-font-selection`).
- **Multi-Range 1K Generation**: Generates 1K desktop and mobile concept plates for each range.
- **The Self-Improving Design Flywheel (`design-flywheel`)**: Runs an automated multi-turn loop (up to 5 iterations per plate), inspecting the full page from sticky header to footer, injecting targeted competitor micro-research for weak touts, and re-rendering via image-to-image conditioning.
- **Designer Image Checkpoint**: Presents the refined plates for your review and curation (`👍 / 👎`), scales to 2K, builds the `#0c0c0b` lowercase moodboard, and hands off to `jason-dev-agent`.
