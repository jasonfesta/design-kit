# 60fps scroll, rapid-click interruption & reduced-motion rules (`feel`)

This reference covers runtime stability and frame-budget discipline so rich visual pages feel effortless during continuous scroll and rapid interaction.

---

## 1. zero-flash media & swatch switching

- **pre-stacked variant frames**: when clicking color swatches or gallery thumbnails swaps high-resolution images or looping videos, mount sibling layers stacked in the same aspect-locked container and crossfade `opacity` (`200ms`) rather than unmounting and remounting `<img src={...}>`, which causes height collapse or blank flashes.
- **aspect-ratio locks**: give every media container an explicit `aspect-[w/h]` or pixel box so switching items or filters never shifts surrounding text baselines.
- **off-main-thread video blobs**: if a single-file bundle embeds MP4 data URIs, convert them once into `Blob` object URLs (`URL.createObjectURL`) cached at module scope and pause `<video>` playback when scrolled `> 240px` offscreen via `IntersectionObserver`.

---

## 2. interruption & rapid-input resilience

Test every interactive control under rapid input before passing the feel dev eval:
- **rapid tab / filter clicking**: clicking `All -> Tote -> Bucket -> Crossbody` in under one second must reflect the latest selection immediately with zero stale timer overwrites. Clear pending `setTimeout` handles inside `useEffect` cleanups or `useRef` timers (for example, toast auto-dismiss timers).
- **rapid slider stepping**: clicking `Next` four times quickly must advance cleanly through `0 -> 1 -> 2 -> 3 -> 4` (using functional state updates `setIndex((i) => (i + 1) % total)`) rather than reading stale closure values.
- **overlay dismissal**: opening and closing drawers/modals repeatedly must restore `document.body.style.overflow` cleanly every time so page scroll never gets stuck locked.

---

## 3. gpu layer hygiene after scroll settle

- Applying permanent `will-change: transform` or persistent `translate3d(...)` across dozens of cards wastes GPU memory and can blur fine serif stems.
- If below-the-fold chapters use a subtle settle transition, mark settled chapters with `data-landed="true"` once the transition ends and reset `transform: none; will-change: auto;`.

---

## 4. deterministic headless eval compatibility (`?gt_eval=1`)

- Whenever `?gt_eval=1` is present in the URL (used by automated screenshot evaluators), settle initial animations immediately so `t=0` screenshots capture crisp, deterministic frames without mid-fade opacity drift.
