# Tear-Apart Design Evaluation Rubric & Scorecard Template

In Pass 3 of Warmup, the evaluator acts as a rigorous Design Engineering critic. Rather than checking only whether the code compiles, you must **tear apart** each model's image-to-React translation against the source image across six weighted dimensions (100 points total).

--------------------------------------------------------------------------------

## 1. The 100-Point Design Eval Rubric

### Dimension 1: Image-to-React Visual Fidelity & Zero Drift (25 Points)
Evaluates how faithfully the model translated the source image without drifting or inventing unrequested elements.

-   **23-25 pts (Exceptional)**: Every layout region, card, control, and copy block from the single image or 4K grid is present in exact proportion and alignment. Zero invented sections, nav items, or decorative fluff. Photographs and illustrations are crisp and high-resolution (or faithfully recreated as high-res SVG/Canvas/CSS specimens without altering subject or palette).
-   **18-22 pts (Strong)**: Primary composition and all grid layouts match closely; minor proportion or background shade variance (`< 5%`), zero hallucinated features.
-   **12-17 pts (Moderate Drift)**: Missing 1-2 secondary sub-elements or tiles from a multi-layout grid, noticeable aspect-ratio distortion, or low-res/placeholder imagery.
-   **0-11 pts (Severe Drift / Hallucination)**: Model invented new features, changed the product domain, omitted multiple grid layouts, or replaced the visual design with a generic template.

**Specific Tear-Apart Checks**:
-   Did the model invent any new navigation items, floating action buttons, badges, or copy not in the image? (`-4 pts` per invented element)
-   If the input is a 4K grid image, did it translate *every* layout tile in the grid, or did it lazily collapse/skip tiles? (`-5 pts` per omitted tile)
-   Are images high-resolution and aspect-ratio locked (circles remain true circles, not squashed ovals)? (`-3 pts` for distorted or blurry imagery)

---

### Dimension 2: Hidden Instructions & Self-Analysis Honesty (15 Points)
Evaluates whether the model uncovered implicit/hidden instructions inside the image and how accurately it audited its own differences in Pass 2.

-   **13-15 pts (Moonshot)**: Detected all subtle visual or textual instructions embedded in the image (e.g., active filter states, alignment puzzles, micro-copy rules, implied state transitions, tonal relationships) and implemented them in React. Pass 2 self-analysis candidly and accurately lists every real difference and approximation.
-   **9-12 pts (Solid)**: Detected most implicit cues; Pass 2 self-analysis identifies major differences honestly with minor omissions.
-   **5-8 pts (Superficial)**: Missed embedded cues and treated the image as flat static boxes; Pass 2 self-analysis is generic or misses obvious visual drift.
-   **0-4 pts (Blind / Hallucinatory Audit)**: Missed hidden instructions entirely and claimed "100% pixel-perfect match" in Pass 2 despite clear visual differences.

---

### Dimension 3: Typography & Font Translation Accuracy (15 Points)
Evaluates font family matching, loading, hierarchy, tracking, and numeric discipline.

-   **13-15 pts**: Correct Google Fonts loaded in `index.html` and mapped in `src/index.css` (`.font-serif-display`, `.font-grotesk`, `.font-mono-tech`). Display headlines have proper line-height and baseline clearance so descenders (`g`, `y`, `p`, `j`, `q`) never clip. Uppercase micro-labels use `tracking-widest` / `tracking-[0.12em]+`, large display type uses tight optical tracking, and all numbers/metrics/prices use `tabular-nums`.
-   **9-12 pts**: Fonts loaded and mapped properly, minor weight or tracking discrepancy on secondary labels, `tabular-nums` present on most numeric blocks.
-   **5-8 pts**: Fallback system sans-serif used where distinct editorial serif or technical monospace was clearly shown in the image, or missing `tabular-nums`.
-   **0-4 pts**: Broken font imports, clipped headline descenders, or completely mismatched typographic scale.

---

### Dimension 4: Optical Padding, Button Craft & CSS Integrity (20 Points)
Evaluates the structural integrity of every CSS element and the optical padding of interactive controls.

-   **18-20 pts**: Every CSS container, grid track, flex row, border, backdrop blur, and shadow is intact. All buttons, pills, tabs, and status badges have balanced optical padding (`px-3.5` to `px-5`, `py-1.5` to `py-2.5`), proper icon-to-text gaps (`gap-1.5` to `gap-2`), and consistent border radii. Text never touches container borders or wraps awkwardly inside pills.
-   **14-17 pts**: Layout CSS is intact; 1-2 secondary badges have slightly tight horizontal padding (`px-2`), but primary buttons and cards are well-proportioned.
-   **8-13 pts**: Noticeable cramped buttons (e.g. `px-1` or missing horizontal padding), inconsistent gaps between icons and labels, or minor flex/grid overflow on standard viewports.
-   **0-7 pts**: Broken CSS layout, overlapping text, unstyled raw HTML buttons, or collapsed containers.

---

### Dimension 5: Interactive Completeness & Stateful Behavior (15 Points)
Evaluates whether the translated React screen behaves like a real application rather than a dead static poster.

-   **13-15 pts**: All visible controls (tabs, segmented switches, filters, modals/drawers, selection rows, sliders, toggles) are wired to live React state (`useState`, `useMemo`) with smooth visual feedback, tactile `:hover` and `:active` states (`active:scale-[0.98]`), and keyboard accessibility.
-   **9-12 pts**: Primary tabs/controls switch state; 1-2 secondary buttons trigger a clean toast/drawer or local state update.
-   **5-8 pts**: Mostly static JSX with only hover styles and no working state transitions.
-   **0-4 pts**: Dead buttons (`onClick` missing), broken event handlers, or runtime exceptions on click.

---

### Dimension 6: Code Quality & Runnable Folder Integrity (10 Points)
Evaluates the standalone project folder (`trials/{model_slug}/project/`).

-   **9-10 pts**: Complete Golden Template folder structure (`index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/components/*`, `src/data/*`, `src/utils/cn.ts`). Passes strict TypeScript check (`tsc --noEmit`), compiles cleanly into a runnable HTML bundle, and mounts `#root` with zero runtime errors.
-   **6-8 pts**: Runnable folder with all required files and working mount, minor TypeScript unused-variable warning or monolithic component file.
-   **3-5 pts**: Missing modular `src/components/` or `src/data/` separation, or requires manual fix to compile.
-   **0-2 pts**: Incomplete folder that fails to compile or renders a blank white page.

--------------------------------------------------------------------------------

## 2. Grade Scale

Total Score | Letter Grade | Verdict Tier
:--- | :--- | :---
**95 - 100** | `A+` | **Moonshot Reference** (Zero drift, hidden instructions nailed, impeccable craft)
**90 - 94** | `A` | **Production Ready** (Faithful translation, crisp CSS/padding, minor nuance gap)
**85 - 89** | `A-` | **High Craft** (Strong layout & interactivity, minor padding or font tuning needed)
**80 - 84** | `B+` | **Solid Pre-Bench** (Core layout intact, missed subtle cues or minor CSS tightness)
**75 - 79** | `B` | **Functional Translation** (Recognizable UI, noticeable typography or spacing drift)
**70 - 74** | `B-` | **Partial Translation** (Several layout approximations or weak interactivity)
**60 - 69** | `C` | **Significant Drift** (Omitted grid elements, cramped buttons, or hallucinated items)
**50 - 59** | `D` | **Poor Fidelity** (Major layout or build failures)
**0 - 49** | `F` | **Failed Trial** (Does not render or diverges completely from source image)

--------------------------------------------------------------------------------

## 3. Canonical Report Structure (`WARMUP-REPORT.md`)

Every Warmup run generates `{output_dir}/WARMUP-REPORT.md` containing:

1.  **Run Metadata & Provenance Header**: Run ID, timestamp, input image path & dimensions, single vs. 4K grid classification, and locked Pass 1 prompt SHA-256 hash.
2.  **Executive Leaderboard Table**: All 5 models (**Grok**, **Claude**, **Astra**, **GPT**, **Argon**) ranked by Total Score (`/100`) and Letter Grade, showing Execution Route (`direct-api`, `gateway-api`, or `assistant-fallback`), all 6 dimension scores, build/mount status, and runnable folder path.
3.  **Hidden Instructions & Grid Comprehension Matrix**: Table listing each implicit/hidden instruction in the source image and whether each model **Detected & Implemented**, **Detected Only**, or **Missed** it.
4.  **Per-Model Tear-Apart Critique**:
    -   Scorecard & provenance summary
    -   **Visual Fidelity & Drift Audit** (exact matches vs. drift/hallucinations)
    -   **CSS, Button Padding & Typography Tear-Down** (specific classes, padding ratios, font stacks, and `tabular-nums` findings)
    -   **Interactivity & Code Architecture Audit** (state hooks, component modularity, runnable build status)
    -   **Pass 2 Self-Analysis Audit** (excerpt of the model's self-reported differences vs. evaluator's ground-truth verification)
5.  **Winner & Pre-Bench Recommendation**: Which model moonshotted the image-to-React translation and should be selected (or combined) for the full build phase.
