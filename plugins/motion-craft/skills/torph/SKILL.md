---
name: torph
description: Install, wire, and tune Torph (`torph`, torph.dev) — dependency-free animated text and number morphing for React, Vue, Svelte, and vanilla TypeScript/JS. Use whenever the user wants smooth text transitions, morphing button labels ("Copy" -> "Copied", "Processing Transaction" -> "Transaction Safe"), rolling place-value numbers or KPI counters, editable numeric inputs with caret tracking (`cursorIndex`), multi-line text rewrites, or mentions `torph` or `<TextMorph />`.
---

# Torph — dependency-free text & number morphing

Torph (`torph`, https://torph.dev) smoothly diffs and morphs changing strings and numbers across React (`torph/react`), Vue 3 (`torph/vue`), Svelte 5 (`torph/svelte`), and vanilla JS/TS (`torph`). Zero runtime dependencies, MIT license.

Before writing code, check the installed version (`node_modules/torph/package.json`) and confirm exports against its `.d.ts` files. An offline unpacked snapshot of `torph@0.1.4`, plus all official demos and framework starters, lives in `~/design-kit/libraries/sources/torph/`.

## Step 1 — Fit check

Torph creates continuity when a piece of text changes in place: surviving characters/words travel to their new position instead of flashing, and digits in numbers roll by place value.

**Great fits:**
- Action button state transitions (`Copy` → `Copied`, `Save` → `Saving…` → `Saved`, `Processing Transaction` → `Transaction Safe`)
- Live numbers, KPIs, prices, percentages, and tickers (`$1,204` → `$1,318`, `+12.4%` → `-3.1%`)
- Status badges, filter counts, tone/mode labels (`Direct` → `Friendly` → `Professional`)
- Editable numeric/currency displays with `cursorIndex` caret tracking
- Short multi-line copy rewrites (AI rewrite previews, captions, status messages)

**Poor fits:**
- Static headings or copy that never changes
- Large streaming paragraphs or prose documents where dozens of lines change every frame (keep morphing to concise readouts or titles)
- High-frequency unthrottled 60fps debug readouts (sample every ~400–850ms so the user can actually read the digits)

Accessibility and reduced motion are built in: Torph keeps a plain-text screen-reader node while hiding the split animation spans with `aria-hidden`, and respects `prefers-reduced-motion` live by default (`respectReducedMotion: true`). Never wrap `<TextMorph>` in a redundant manual reduced-motion swap. Add `aria-live="polite"` on the surrounding container when screen readers should announce live updates.

## Step 2 — Install

```bash
npm install torph@latest
```

Offline / local MIT fallback inside `~/design-kit`:

```json
"torph": "file:/usr/local/google/home/jfesta/design-kit/libraries/sources/torph/package"
```

`react`, `react-dom`, `vue`, and `svelte` are optional peer dependencies.

## Step 3 — Wire up

### React (`torph/react`)

```tsx
import { useState } from "react";
import { TextMorph } from "torph/react";

export function CopyButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button type="button" onClick={() => setCopied((c) => !c)}>
      <TextMorph>{copied ? "Copied" : "Copy"}</TextMorph>
    </button>
  );
}
```

**Important React rules:**
- **Text or number children only.** `<TextMorph>` throws if given a React element child (`<span>`, icons, etc.). Keep icons outside `<TextMorph>` as siblings.
- **Pass a raw `number` to use `locale` + `decimals`.** `<TextMorph decimals={2} locale="de-DE">{1234.5}</TextMorph>` formats automatically; passing a string skips `decimals`.
- **Imperative control:** Use `const { ref, update } = useTextMorph(options)` when driving updates outside React state.
- **SSR & multi-line:** Newlines (`\n`) render as `<br>` automatically, including in React SSR markup.
- **Client boundary:** `torph/react` ships `"use client"` at the top of its entry, so it works cleanly in Next.js App Router.

### Numbers & editable fields

Numeric morphing (`numbers={true}`) is **on by default**:
- Digits slide vertically by place value; currency symbols, commas, signs, and units move with their places.
- Non-quantity strings containing digits (like `"COVID-19"` or `"2024-01-01"`) automatically stay in text mode via `isNumericWord`.
- Opt out with `numbers={false}` for plain character-level morphing.
- **Editable inputs:** When a user is typing, pass `cursorIndex` (React prop or 2nd argument to `morph.update(value, caret)`) so Torph switches from place-value matching to caret-anchored matching — inserting `1` before `20` inserts a digit instead of renumbering the column.

```tsx
<input
  value={value}
  onChange={(e) => {
    setCaret(e.target.selectionStart ?? undefined);
    setValue(e.target.value);
  }}
/>
<TextMorph cursorIndex={caret}>{value}</TextMorph>
```

### Vue, Svelte, and Vanilla JS

Read [references/frameworks-and-api.md](references/frameworks-and-api.md) for Vue 3 (`torph/vue`), Svelte 5 (`torph/svelte`), vanilla `new TextMorph({ element, ... })`, `MorphController`, and the exported segmentation/diff utilities (`segmentText`, `diffSegments`, `segmentNumber`, `isNumericWord`, `decimalSeparator`).

## Step 4 — Tune motion & layout

Default motion is `duration={400}` with `ease="cubic-bezier(0.19, 1, 0.22, 1)"` and `scale={true}`.

- **Spring physics:** Pass a `SpringParams` object to `ease` (`{ stiffness, damping, mass, precision }`). When `ease` is a spring, `duration` is ignored and computed from the spring physics (falls back cleanly on browsers without CSS `linear()`).
  - Crisp UI control / ticker: `ease={{ stiffness: 200, damping: 20 }}` or `{ stiffness: 150, damping: 19, mass: 1.2 }`
  - Snappy status pill: `duration={600} ease="cubic-bezier(0.41, 1.03, 0.6, 1.03)"`
- **No horizontal jitter on tables/KPIs:** Add `tabular-nums` (`font-variant-numeric: tabular-nums`) on numeric `<TextMorph>` wrappers when surrounding layout should stay anchored.
- **Buttons:** Keep button height stable and maintain `-2px` optical vertical centering; animate container width gently or use `min-w` if rapid width changes shift neighbors.
- **Interruptions:** Rapid updates redirect mid-flight from current interpolated positions. If awaiting completion, handle both `onAnimationComplete` and `onAnimationCancel` (exactly one fires per morph).

More recipes (action buttons with icon transitions, live sparkline tickers, editable currency overlays, spring presets) are in [references/patterns-and-tuning.md](references/patterns-and-tuning.md).

## Troubleshooting

| Symptom | Cause → fix |
| :--- | :--- |
| Error: `TextMorph only accepts text content` | A JSX element was nested inside `<TextMorph>`. Move icons/tags outside and pass only strings or numbers as children. |
| `decimals` prop has no effect | You passed a formatted string instead of a `number`. Pass `{1234.5}` as a number or format the string yourself. |
| Typing in a number field scrambles digits | Place-value matching is active instead of caret matching. Pass `cursorIndex={selectionStart}` on React or `update(val, caret)` in vanilla JS. |
| `duration` prop is ignored | `ease` is set to a `SpringParams` object; spring duration is derived from physics. Use a CSS easing string if you want an explicit `duration`. |
| Numbers don't roll on a string like `"v1.2.3"` or `"2026-11-24"` | Intentional: `isNumericWord` treats versions, dates, and IDs as text rather than quantities. |
| Promise waiting on `onAnimationComplete` hangs | A newer update interrupted the morph. Resolve/clean up in `onAnimationCancel` as well — exactly one of the two runs per morph. |
| Width jumps inside a flex button or badge | Ensure the parent container doesn't clip the morphing span prematurely (`overflow: visible` or padded container) and avoid hard `width` constraints that fight container sizing. |
