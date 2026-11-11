# tactile physics, gpu properties, curves & timing table (`feel`)

This reference translates craft-engineering principles (Emil Kowalski's UI craft & animation guidance and Apple physical continuity) into concrete Tailwind v4 / CSS rules for `jason-dev-agent`.

---

## 1. reference timing & curve matrix

| interaction surface | duration | easing curve | recommended properties |
| :--- | :--- | :--- | :--- |
| **button / pill press (`:active`)** | `100ms - 160ms` | `cubic-bezier(0.2, 0, 0, 1)` | `transform: scale(0.98)`, subtle `background-color` |
| **hover state (`@media (hover: hover)`)** | `150ms - 220ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | `background-color`, `border-color`, `color`, subtle `transform` |
| **tab / filter / swatch crossfade** | `160ms - 240ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | `opacity` on pre-stacked layers; `transform` on active indicator |
| **drawer / sheet / modal enter** | `260ms - 380ms` | `cubic-bezier(0.32, 0.72, 0, 1)` | `transform: translateX/Y(...)`, backdrop `opacity` |
| **drawer / sheet / modal exit** | `180ms - 250ms` | `cubic-bezier(0.32, 0, 0.67, 0)` or crisp ease-out | `transform: translateX/Y(...)`, backdrop `opacity` |
| **slider / carousel step** | `260ms - 400ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | `transform: translate3d(...)`, `opacity` |
| **editorial scroll settle** | `400ms - 550ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | `opacity`, `transform: translateY(10px -> 0)` once, then clear |

---

## 2. base css baseline for `src/index.css`

Every Golden Template `src/index.css` should establish clean tactile defaults inside `@layer base` without altering `t=0` visual geometry:

```css
@layer base {
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  summary {
    cursor: pointer;
  }

  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  summary:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 3. common anti-patterns to eliminate in the dev eval

1. **`transition-all` on cards or sections**: causes widths, heights, and paddings to rubber-band during viewport resize and triggers layout recalculation on every frame. Always scope transitions explicitly (`transition-colors`, `transition-opacity`, `transition-transform`, or `transition-[transform,opacity,background-color,border-color]`).
2. **oversized entrance distances (`translate-y-12` / `48px+`)**: makes calm interfaces feel floaty and theatrical. Keep subtle reveals under `8px - 14px`—or omit entrance motion entirely on high-frequency tools.
3. **hover zoom without `overflow-hidden` or hover media query**: scaling a card photo (`scale-[1.02]`) must stay clipped cleanly inside an `overflow-hidden` frame and only trigger when `@media (hover: hover) and (pointer: fine)` matches.
4. **delayed keyboard or tab switches**: never put `300ms+` delays or heavy stagger cascades on tabs, filters, or pagination that users click repeatedly.
