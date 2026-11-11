# blueprints for sliders, pagination, scroll, and story (`interaction`)

When every visible button works, `jason-dev-agent` asks the second half of the `interaction` prompt: **how can we improve exploration—is there a slider, pagination, scroll rhythm, or story—while keeping `t=0` faithful to the reference?**

---

## 1. sliders, carousels & galleries

### when to use
- Product detail galleries with multiple angles or macro material shots.
- Editorial lookbooks, architectural monographs, onboarding cards, or quote/testimonial strips.
- Horizontal collection rails (`3+` cards) where stepping reveals curated companion pieces.

### `t=0` safe implementation pattern
- Seed `activeIndex = 0` so the initial viewport renders the exact image(s), headlines, and crops from the reference mockup.
- Store `4-6` complete slide objects in `src/data/*Data.ts`.
- Wire:
  - Previous / next buttons (`aria-label="Previous slide"`, `aria-label="Next slide"`) with wrap-around or clear disabled boundary state.
  - Direct slide indicators or `tabular-nums` counter (`01 / 04`).
  - Keyboard `ArrowLeft` / `ArrowRight` support on the carousel region.
  - Preloaded or stacked `<img>` frames so stepping slides never flashes an empty box.

---

## 2. pagination, live filtering & variant swatches

### when to use
- Multi-card catalogs, menus, directories, data tables, search results, or archive indexes.
- Multi-variant products (leather finishes, ceramic glazes, stone/wood species, sizes).

### `t=0` safe implementation pattern
- **filters & tabs**: set initial state to the comp's active tab (`'all'` or the highlighted pill). Clicking another filter narrows or re-ranks the shared array without breaking equal grid column geometry (`minmax(0, 1fr)`).
- **pagination**: when a catalog or table has `page 1 / 2 / 3` or `"view more"`, slice `ITEMS.slice(page * pageSize, (page + 1) * pageSize)` from a richer dataset in `src/data/*Data.ts`, keeping `page = 0` locked to the exact reference items.
- **swatches**: place color/finish dots in a sibling `<div role="group">` outside `<a href>` links so tapping a swatch updates the card's active finish photo and metadata cleanly.

---

## 3. scroll navigation & landmark choreography

### when to use
- Any multi-section landing page, editorial monograph, or split-pane workspace with scrollable feeds/rails.

### `t=0` safe implementation pattern
- Give each major semantic `<section>` a clean `id` (`#collection`, `#craft`, `#specifications`, `#story`, `#care`) matching header and footer links.
- Use `scroll-margin-top` (`scroll-mt-20`) on anchored sections so sticky headers never cover section titles after an anchor click.
- Use a `1px` `IntersectionObserver` sentinel at the bottom of the hero rather than `scroll` event listeners to toggle compact/solid header chrome cleanly.
- Never set `overflow: hidden` on `html` or `body` unless a modal/drawer is currently open (and restore scroll immediately on close).

---

## 4. scroll points & animation triggers (replacing vague "story")

### when to use
- Multi-section pages, sticky split-scroll chapters, step-by-step product breakdowns, drawers, and interactive tabs/galleries where scroll thresholds or user events trigger visual transitions.

### `t=0` safe developer implementation pattern
- **explicit scroll points (`[data-scroll-point]`)**: attach an `IntersectionObserver` (`threshold: [0.15, 0.5]`, `rootMargin: "-10% 0px"`) to numbered sections or chapter waypoints to update active nav indicators, sticky step counters (`01 -> 02 -> 03`), or contextual side panels as the user crosses each scroll point.
- **deterministic animation triggers (`data-state` & `data-in-view`)**:
  - Keep above-the-fold elements in their final settled state at `t=0` so screenshot matching stays pixel-locked.
  - Trigger below-the-fold entrances once via `data-in-view="true"` (`observer.unobserve(el)` after entry) and wire click/hover/tab triggers through explicit `data-state="open|closed"` attributes rather than ad-hoc JS timers or scroll-event listeners.
- **detail drawers & native disclosures**: wire *"Read more"* / card triggers to slide-over sheets (`Escape` + backdrop close) and `<details>`/`<summary>` rows for inline progressive disclosure.
