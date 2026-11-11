# element-by-element coverage & dev eval audit checklist (`interaction`)

This reference defines how `jason-dev-agent` audits every interactive element in a Golden Template React build so nothing on the page is dead, fake, or inaccessible.

---

## 1. complete element coverage table

Audit every region of `src/App.tsx` and `src/components/*.tsx` from top to bottom:

| ui element family | dead-element failure mode (fail) | required working behavior (pass) |
| :--- | :--- | :--- |
| **header nav links** | `<a href="#">` or static `<span>` labels | Smoothly scrolls to `#section-id`, switches `?screen=<i>` page state, or opens the corresponding view with `aria-current`. |
| **bag / cart / search / menu pills** | Static badge text (`Bag (1)`) with no `onClick` | Opens a slide-over drawer or modal (`role="dialog"`, `aria-modal="true"`) synced to live item/search state. |
| **primary & secondary cta buttons** | `<button>` with no handler or `console.log` stub | Opens the target flow, detail sheet, booking/checkout drawer, or updates primary stage state with clear feedback. |
| **filter pills & segmented tabs** | Visual active pill hardcoded; sibling pills inert | Updates `activeFilter` / `activeTab` via `useState`, filtering or switching items while keeping `t=0` locked to the reference default. |
| **product / editorial cards** | Static card where CTA or image click does nothing | Opens a detail sheet/story modal, switches active preview, or navigates cleanly within the multi-view app. |
| **color / material swatches** | Decorative colored circles inside `<a href>` | Rendered as `<button>` items inside a sibling `<div role="group" aria-label="choose finish">`; swaps card image, finish name, and active ring in place. |
| **sliders, carousels & galleries** | Static arrows (`←` `→`) or dots `• • •` with 1 hardcoded slide | Steps `activeIndex` across `4-6+` real entries in `src/data/*Data.ts`, updates active dot/counter (`tabular-nums`), and supports keyboard arrows. |
| **pagination & steppers** | Static `Page 1 of 3` or `- 1 +` text | Updates `currentPage` or `quantity` state (`>= 1`), recalculating visible items or `tabular-nums` subtotals immediately. |
| **accordions & spec rows** | Static `+` icons next to collapsed rows | Uses native `<details>` + `<summary>` or `aria-expanded` state to reveal authentic domain specifications, dimensions, or FAQs. |
| **inputs & forms** | Uncontrolled `<input>` or `<form>` that reloads page | Controlled React state (`value`, `onChange`), `e.preventDefault()`, empty/format check, and inline confirmation state. |
| **video / audio transport** | Decorative play/pause or timer bar over a still image | Calls `videoRef.current?.play()` / `.pause()` and toggles `.muted` (guarded for JSDOM/headless environments) with live state icons. |

---

## 2. priority order for dev eval fixes (`p0` -> `p1` -> `p2`)

When `jason-dev-agent` stops to judge itself at the end of a turn, fix failures in strict order:

1. **`p0` — dead controls & broken handlers**:
   - Any `<button>` without `onClick` / `type="submit"`, any `<a href="#">` no-op, any bare `<div onClick>` missing `role="button"` + `tabIndex={0}`, or any click that throws an error or breaks layout (`collision_count > 0` or `horizontal_overflow_px > 0`).
2. **`p1` — shallow / single-record state**:
   - Controls wired only to a generic toast (`"Clicked!"`) where the UI clearly represents a filter, tab, gallery thumbnail, swatch, accordion, or bag item that should change real content from `src/data/*Data.ts`.
3. **`p2` — rich exploration & story upgrades**:
   - Adding thoughtful sliders, pagination, chapter steppers, or story drawers inspired by `jason-design-agent`'s original references while keeping `t=0` pixel-identical.

---

## 3. self-audit checklist before calling `jason-design-agent`

Run through all six checks before declaring the interaction dev eval passed:
- [ ] Every `<button>`, `<a href>`, `<input>`, and `<summary>` on the page was triggered and produced a visible, meaningful state change.
- [ ] Zero `href="#"` dead links and zero `onClick={() => {}}` no-op handlers exist anywhere in `src/`.
- [ ] `Escape` and backdrop clicks cleanly close every modal, sheet, and drawer.
- [ ] `src/data/*Data.ts` holds realistic domain items for secondary tabs, pages, slides, swatches, and story chapters (zero `"Lorem ipsum"` or `"Sample Item 2"` filler).
- [ ] Initial `t=0` load (before any user click) still passes `eval-image-to-react.mjs` with zero visual drift from the reference comp.
- [ ] Before/after screenshots or state notes are captured so `jason-design-agent` can inspect every interactive state directly.
