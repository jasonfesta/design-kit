# designer critique lenses, originality checks & final `jason-design-agent` output (`design-critique`)

Whenever `jason-design-agent` runs a critique—whether signing off on the 2K concept plates, answering a mid-build `jason-dev-agent` talk-back, or producing the **final post-build `jason-design-agent` output**—it opens **both** the Markdown research dossiers (`research/benchmarks.md`, `research/properties/01..05.md`) **and** the raw benchmark screenshots (`research/screenshots/01..05/`) alongside `style-direction/` and `concepts/`.

---

## 0a. upfront & final originality check vs. the 5 standout benchmarks

Before approving either the concept pack or the final `jason-dev-agent` build, `jason-design-agent` explicitly verifies:
1. **freshness & point of view**: is this a fresh, compelling, category-worthy take informed by the 5 standout benchmarks—rather than generic AI SaaS/e-commerce filler or a timid copy of one reference?
2. **zero copied fonts (`avoid_fonts`)**: confirm that the chosen Google Fonts (`style-direction/typography-and-color.md`) do **not** duplicate the signature typefaces of the 5 benchmarked sites/apps while still matching the domain's true functional register.
3. **zero copied palettes (`avoid_palettes`)**: confirm that `--surface`, `--ink`, `--accent`, and `--accent-alt` establish an independent chromatic identity rather than lifting hex codes from benchmark screenshots.

---

## 0b. lens 0 — material & photo honesty (paired with `nano-banana`)

- **authentic surface grain vs. AI plasticity**: do upscaled `2x` Retina plates preserve real tactile texture (pebbled calfskin, linen slub, matte ceramic glaze, natural skin pores, architectural stone) rather than waxy, airbrushed, or oversharpened AI surfaces?
- **faithful lighting & clean-plate integrity**: did shadow warmth, color cast, and silhouette geometry remain 100% faithful to the low-res source and original inspiration, with zero ghosted lettering on cleaned hero banners?

---

## 1. lens 1 — visuals (paired with `image-to-react`)

- **inspiration & mood fidelity**: does the rendered page evoke the same material world, atmosphere, and brand authority as the reference and inspiration sources?
- **typographic voice & hierarchy**: are serif/sans/mono pairings, optical tracking, line breaks, and scale jumps singing in the right register—or does text look default/mechanical?
- **surface & color nuance**: are background steps, hairline borders (`1px`), shadows, and accent fills tonally harmonious rather than muddy, chalky, or overly harsh?
- **composition & negative space**: are quiet margins, asymmetric column pauses, and photographic crops preserved with confidence?

---

## 2. lens 2 — responsiveness (paired with `responsiveness`)

- **handheld composition (`320px - 430px`)**: does the mobile screen look intentionally designed for a phone held in one hand rather than a tall, monotonous column ofshrunk desktop blocks?
- **art-directed framing**: do `<picture>` mobile crops and `object-position` choices keep key silhouettes, gestures, and architectural lines well-framed?
- **pacing & chapter rhythm**: are vertical pauses proportional so sections neither run together nor leave awkward blank voids?
- **tablet poise (`768px - 1024px`)**: do multi-card grids, split editorial rows, and navigation bars feel balanced at intermediate tablet widths?

---

## 3. lens 3 — interaction & story (paired with `interaction`)

- **complete element responsiveness**: does every visible element respond thoughtfully, with zero dead buttons or placeholder feelings?
- **elevation & additions**: looking back at the original inspiration and category benchmarks:
  - *is there a slider?* would a lookbook rail, product angle gallery, or quote strip benefit from smooth stepping?
  - *is there pagination?* should a catalog, archive, or journal support clean filtering or pagination?
  - *can i scroll?* does scrolling feel effortless, oriented, and well-paced?
  - *is it a story?* does moving down and clicking into the page unfold like an intentional story (chapters, material breakdown, editorial drawers) rather than isolated widgets or unrequested UI clutter?

---

## 4. lens 4 — feel (paired with `feel`)

- **temperament alignment**: does the speed, weight, and curve of every press, hover, drawer, and crossfade match the original inspiration (quiet & unhurried vs. crisp & immediate vs. tactile & springy)?
- **restraint (earned motion)**: should any transition be toned down or removed because stillness feels cleaner and more confident?
- **continuity**: do overlays, swatches, and sliders transition with zero jump, flash, or jank?

---

## 5. lens 5 — uniqueness *(mode-aware)*

Because uniqueness means very different things depending on whether the user asked to **reconstruct** a reference image or **adapt / explore** from inspiration, `design-critique` applies uniqueness strictly according to the direction's transformation mode:

| transformation mode | `t=0` initial view rule | `t>0` interactive states & holistic rule |
| :--- | :--- | :--- |
| **`reconstruct`** *(exact image match)* | **Uniqueness invention = OFF at `t=0`**. Never invent new sections, badges, colors, or copy changes that drift from the reference image. | Avoid generic AI clichés inside drawers, modals, and secondary states—keep secondary copy, spacing, and transitions 100% consistent with the reference's bespoke craft. |
| **`adapt` / `explore`** *(new build from inspiration)* | **Signature character = ON**. Critique whether the layout, typographic tension, and focal moment have a distinct, memorable point of view rather than generic SaaS/e-commerce boilerplate. | Ensure interactive patterns (sliders, story progression, custom controls) feel tailored to the concept and original inspiration rather than stock component defaults. |
| **`off`** *(explicitly disabled)* | Skip uniqueness grading entirely; judge strictly on visuals, responsiveness, interaction, and feel. | Judge strictly on visuals, responsiveness, interaction, and feel. |
