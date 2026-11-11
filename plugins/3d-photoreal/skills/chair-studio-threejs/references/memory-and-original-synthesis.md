# Cumulative Memory Ledger & Original Daily Chair Synthesis (`Chair B`)

The Daily Chair Agent does not merely copy one chair per day -- it builds an **evolving industrial-design memory** across days and translates that accumulated structural intelligence into **Today's Original Chair (`Chair B`)**, displayed side-by-side with `Chair A`.

---

## 1. Persistent Memory Architecture (`/usr/local/google/home/jfesta/chairs/memory/`)

On every run, read all four files before designing `Chair B`, and update them after verifying both renders:

1. **`seen_items.json`**:
   - Tracks seen RSS `guid`s, article URLs, image URLs, and SHA-256 hashes so no reference chair is ever repeated across days.
2. **`chair_ledger.json`**:
   - Structured chronological array of completed daily entries (`dayNumber`, `date`, `slug`, `sourceTitle`, `sourceSite`, `sourceUrl`, `designer`, `chairASpec`, `chairBSpec`, `parityMetrics`, `tectonicLessons`).
3. **`MEMORY.md`**:
   - Distilled design-intelligence journal recording:
     - **Structural Archetypes Seen**: cantilever sled, 4-leg mortise-and-tenon, tripod shell, trestle lounge, monolithic molded polymer, slung tension leather, stacked laminate, etc.
     - **Joinery & Ergonomic Ratios**: seat pan height (`390 - 460 mm`), lounge rake (`8 - 18 deg`), backrest lumbar inflection, arm rail height (`640 - 690 mm`), leg splay angles.
     - **Material & Shader Breakthroughs**: new procedural wood grains, boucle weaves, perforated metal patterns, translucent resins, or stitched saddle joints discovered on prior days.
4. **`user_notes.md`**:
   - Jason's direct creative inbox. Any note, designer name, material prompt, ergonomic constraint, or sketch reference added to `user_notes.md` takes **first-priority creative steering** in synthesizing `Chair B`.

---

## 2. Rules for Synthesizing `Chair B` (Today's Original Chair)

1. **Genuine Structural Invention (Never a Recolor or Parameter Tweak)**:
   - `Chair B` must **never** simply recolor `Chair A` or scale `Chair A`'s leg height by `10%`.
   - Instead, explicitly combine:
     - **1 primary structural or material lesson from today's `Chair A`** (e.g., steam-bent continuous arm-back loop, cantilevered tension sling, carved saddle seat, laminated shell rib),
     - **1 - 2 contrasting tectonic motifs from prior days in `chair_ledger.json` / `MEMORY.md`** (or historical industrial-design canons recorded in `user_notes.md` on Day 01 before multi-day history accumulates), and
     - **1 fresh formal hypothesis** (a new leg-to-seat bridge, cantilevered backrest suspension, material contrast such as brushed raw aluminum + oiled smoked oak + bouclé bolster, or sculptural negative-space cutout).
2. **Explicit Lineage Attribution**:
   - Record `Chair B`'s exact `lineage` array (`["Day 01: <motif>", "Day 03: <material>", "User Note: <seed>"]`), its named ergonomic dimensions (`seatHeightMm`, `widthMm`, `depthMm`, `overallHeightMm`, `seatRakeDeg`), and its structural rationale so the Side-by-Side Studio UI surfaces *why* today's original chair exists.
3. **Identical Studio Stage & Camera Rig for Side-by-Side Cohesion**:
   - Render `Chair B` on the **exact same white cyclorama (`border_mean_srgb`), focal length (`vFOV`), camera elevation, 3-softbox `PMREM`, and dual-scale soft floor shadow rig** as `Chair A` so the side-by-side comparison reads like two physical prototypes photographed in the same industrial-design studio on the same morning.
4. **Anti-Repetition Guard Across Days**:
   - Check the last `7` entries of `chair_ledger.json` before locking `Chair B`: avoid repeating the exact same primary material + base topology two days in a row (e.g., if yesterday's `Chair B` was a tubular-chrome cantilever with black leather, push today's `Chair B` toward sculpted timber trestle, cast-aluminum architectural swivel, interlocking bent plywood, or monolithic perforated anodized sheet).
