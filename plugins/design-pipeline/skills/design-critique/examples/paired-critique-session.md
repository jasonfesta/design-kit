# walkthrough: full paired `jason-dev-agent` <-> `jason-design-agent` critique session

This trace shows how a single project moves cleanly through all four stages—passing each **dev eval** on `jason-dev-agent` first and then passing its mirrored **`design-critique`** in `jason-design-agent`.

---

## stage 1: `image-to-react` -> `visuals` design critique
1. **`jason-dev-agent`**: extracts exact hex tokens & `2x` crops (`replicate-mock`), builds the Golden Template React app, iterates `eval-image-to-react.mjs` for 2 turns until `s_total = 0.93`, `0` collisions, `0` button/grid violations (**dev eval passed**).
2. **`jason-design-agent` critique**: inspects `side_by_side.png` against the original ceramic studio inspiration (East Fork / Heath Ceramics). Requests slightly warmer hairline border opacity (`#231f1d/12` instead of harsh `#000/20`) and tighter optical tracking (`-0.02em`) on the serif display title.
3. **`jason-dev-agent`**: applies both tweaks, re-runs `eval-image-to-react.mjs` (`s_total = 0.94`, **passed**), re-sends -> `jason-design-agent` marks **visuals approved**.

---

## stage 2: `responsiveness` -> `responsiveness` design critique
1. **`jason-dev-agent`**: tunes fluid breakpoints and `<picture>` crops across one shared DOM, iterates `eval-responsive-pair.mjs` until desktop `0.94`, mobile `0.90`, `height_delta = 2.8%`, and all 6 continuum widths (`320px -> 1440px`) report `0` violations (**dev eval passed**).
2. **`jason-design-agent` critique**: reviews phone and `768px` slices against inspiration; asks to recenter the wheel-throwing hands crop at `375px` (`object-[50%_35%]`) and give the mobile kiln-notes quote an extra `16px` vertical pause.
3. **`jason-dev-agent`**: updates classes, re-runs `eval-responsive-pair.mjs` (**passed**), re-sends -> `jason-design-agent` marks **responsiveness approved**.

---

## stage 3: `interaction` -> `interaction` design critique
1. **`jason-dev-agent`**: wires glaze swatches, filter pills, bag drawer, kiln-process accordion, and lookbook gallery (`0` dead elements, `t=0` locked -> **dev eval passed**).
2. **`jason-design-agent` critique**: checks against ceramic studio inspiration—asks to turn the 4-stage firing timeline (*throw -> trim -> bisque -> reduction glaze*) into an interactive story stepper with macro glaze tiles and add page stepping (`1 / 2`) to the tableware archive grid.
3. **`jason-dev-agent`**: adds both interactions in `src/data/` + `src/components/` with index `0` locked to `t=0`, re-verifies dev gates -> `jason-design-agent` marks **interaction approved**.

---

## stage 4: `feel` -> `feel` & holistic design critique
1. **`jason-dev-agent`**: audits GPU `transform`/`opacity` curves, `180ms` tactile press states, `200ms` pre-stacked glaze crossfades, and `prefers-reduced-motion` (**dev eval passed**).
2. **`jason-design-agent` critique**: confirms glaze crossfades and kiln-story drawer feel calm, weighted, and tactile with zero generic bounce, and confirms holistic visual + responsive + interactive cohesion -> **holistic build approved**.
