# example: multi-turn low-res to `2x` retina loop (`nano-banana` + `jason-design-agent`)

This walkthrough shows how `jason-dev-agent` converts low-resolution crops from a warm editorial leather goods mockup into crisp `2x` Retina plates using `nano-banana`, stops to pass its dev eval, and iterates with `jason-design-agent` for the user's chosen turn budget.

---

## step 0 — upfront testing prompt (`design_agent_turns`)

- `jason-dev-agent` prompts user: *"how many turns do you want out of the design agent?"*
- User selects: **`2 turns per stage`** (`design_agent_turns = 2`).

---

## loop a — `jason-dev-agent` self-eval (`nano-banana`)

### turn 1 (initial upscale & dev eval catch)
1. **resolution audit**:
   - `replicate-mock` slices two photographic regions from a `1000 x 3000` reference column:
     - `hero_courtyard.png`: `1000 x 620` crop containing baked-in white headline *"A gesture, carried forward"* -> needs `2000 x 1240` (`2x`) clean plate.
     - `card_gesture_bag.png`: `300 x 380` crop (`1x` soft diffusion grain on `#FBF6EE` ground) -> needs `600 x 760` (`2x`) unboxed silhouette plate.
     - `promo_strip.png`: `940 x 210` crop (`W / H = 4.48 > 3.8`) -> needs `1880 x 420` (`2x`).
2. **initial execution**:
   - `jason-dev-agent` pads `promo_strip.png` vertically with `#F5F0E8` to `940 x 314` (`3:1`), runs `nano-banana` (`gempix-1 --image_size=2k`) across all three plates, and resizes to `2000 x 1240`, `600 x 760`, and `1880 x 420`.
3. **dev eval check (`turn 1`)**:
   - `hero_courtyard_2x.png`: `2000x1240`, `ar_drift = 0.0%`, `mae_8x8 = 9.4`, `sharpness_gain = 1.62` — **pass** (`0` ghost letters).
   - `promo_strip_2x.png`: `1880x420`, `ar_drift = 0.0%`, `mae_8x8 = 7.1`, `sharpness_gain = 1.48` — **pass**.
   - `card_gesture_bag_2x.png`: `600x760`, corner pixel sampled as `#F7F1E7` against CSS `--surface: #FBF6EE` (`4` RGB step rectangular seam!) — **fail on gate 5**.

### turn 2 (fix ground seam -> dev eval pass)
1. `jason-dev-agent` re-runs `card_gesture_bag.png` with Template C locking solid `#FBF6EE` out to all four borders and verifies corner pixels (`#FBF6EE` on all 4 corners).
2. **dev eval check (`turn 2`)**: all 3 plates pass Gates 1–5 (`>= 2x` density, `0.0%` aspect drift, `mae_8x8 <= 9.4`, `sharpness_gain >= 1.48`, `0` edge seams).

---

## loop b — paired designer critique in `jason-design-agent` (`design_agent_turns = 2`)

### critique turn 1 of 2 (`jason-dev-agent` -> `jason-design-agent`)
- `jason-dev-agent` sends side-by-side contact sheets (`low_res` vs. `high_res_2x`) + original inspiration (`Polène` / `Loewe` tactile pebbled wine calfskin & warm limestone courtyard) to `jason-design-agent`.
- **`jason-design-agent` verdict (`turn 1 of 2` — `changes_requested`)**:
  1. `[visuals / material]` `card_gesture_bag_2x.png` — silhouette and `#FBF6EE` ground are seamless, but the wine calfskin surface smoothed slightly toward satin leather during upscaling; original inspiration calls for tactile full-grain pebbled calfskin and crisp brushed-bronze clasp bevels.
  2. `[visuals / lighting]` `hero_courtyard_2x.png` — clean text removal behind the headline looks natural, though shadow contrast in the limestone archway cooled slightly; keep the warm late-afternoon travertine cast from the source crop.

### refinement & critique turn 2 of 2 (`jason-dev-agent` -> `jason-design-agent`)
1. `jason-dev-agent` re-runs `card_gesture_bag_2x.png` and `hero_courtyard_2x.png` through `nano-banana` with explicit pebbled calfskin grain + warm travertine shadow lock, **re-runs the `nano-banana` dev eval** (`mae_8x8` improves from `9.4 -> 6.2`, `sharpness_gain = 1.71`, all 5 gates green), and sends **turn 2 of 2** back to `jason-design-agent`.
2. **`jason-design-agent` verdict (`turn 2 of 2` — `approved`)**:
   - Pebbled calfskin grain, brushed bronze hardware, clean-plate archway behind live serif type, and warm courtyard cast all match the original inspiration cleanly. `jason-dev-agent` advances to Stage 1 (`image-to-react`).
