# Torph — Real-World Patterns & Tuning

Distilled from the official demos in `libraries/sources/torph/demos/`.

## 1. Status / action button with icon + morphing label

Keep the icon outside `<TextMorph>` and transition it independently (CSS or `motion/react` `AnimatePresence`) while `<TextMorph>` handles the text continuity:

```tsx
<button type="button" className="inline-flex items-center gap-2">
  <StatusIcon state={status} />
  <TextMorph duration={500} ease="cubic-bezier(0.41, 1.03, 0.6, 1.03)">
    {status === "processing" ? "Processing Transaction" : "Transaction Safe"}
  </TextMorph>
</button>
```

Because `"Transaction"` persists across both strings, Torph glides `"Transaction"` into place while morphing `"Processing"` → `"Safe"`.

## 2. Live KPI / ticker with spring easing

For rapidly updating readouts (charts, request counters, prices), sample at 400–850ms intervals rather than every `requestAnimationFrame`. Torph interrupts cleanly mid-flight and redirects from the current position:

```tsx
<TextMorph
  className="font-semibold tabular-nums"
  ease={{ stiffness: 150, damping: 19, mass: 1.2 }}
>
  {`${change > 0 ? "+" : ""}${change.toFixed(1)}%`}
</TextMorph>
```

## 3. Formatted currency / localized numbers

Pass a formatted string when you want full control over currency/suffixes, or pass a raw `number` with `locale` and `decimals`:

```tsx
// Formatted string — currency symbol and commas track place value
<TextMorph className="tabular-nums">{`$${total.toLocaleString("en-US")}`}</TextMorph>

// Raw number — Torph formats using locale + decimals
<TextMorph className="tabular-nums" decimals={2} locale="de-DE">
  {amount}
</TextMorph>
```

## 4. Editable numeric input with caret matching (`cursorIndex`)

Place-value matching is ideal for autonomous readouts, but wrong when a person is typing digits by hand. Pass `cursorIndex` from `selectionStart` so typed characters enter at the caret without scrambling neighboring columns (even when thousand separators insert automatically):

```tsx
const [value, setValue] = useState("$20");
const [caret, setCaret] = useState<number | undefined>(3);

<input
  value={value}
  onChange={(e) => {
    setCaret(e.target.selectionStart ?? undefined);
    setValue(e.target.value);
  }}
/>
<TextMorph cursorIndex={caret}>{value}</TextMorph>
```

## 5. Multi-line tone / rewrite previews

Newlines (`\n`) automatically render as `<br>` and words that survive across rewrites glide smoothly to their new line positions:

```tsx
const rewrites = {
  direct: "Running late, be there\nsoon.",
  friendly: "Running a bit behind,\nI'll be there soon.",
  professional: "I'm running a little behind,\nshould be there soon.",
};

<TextMorph as="p">{rewrites[tone]}</TextMorph>
```

## 6. Easing & spring starting points

| Use case | Recommended config | Feel |
| :--- | :--- | :--- |
| Copy / toggle button | default (`duration={400}`, `ease="cubic-bezier(0.19, 1, 0.22, 1)"`) | Fast, settled, unobtrusive |
| Transaction / confirmation badge | `duration={500–600}`, `ease="cubic-bezier(0.41, 1.03, 0.6, 1.03)"` | Slight confident overshoot |
| Crisp UI counter / stepper | `ease={{ stiffness: 200, damping: 20 }}` | Snappy spring |
| Live ticker / dial | `ease={{ stiffness: 150, damping: 19, mass: 1.2 }}` | Weighted, smooth momentum |
| Playful / elastic hero word | `ease={{ stiffness: 120, damping: 12 }}` | Noticeable bounce |

## 7. Reference demos on disk

Inspect any of the 25+ official demos locally in `~/design-kit/libraries/sources/torph/demos/`:
- Buttons & status: `copy.tsx`, `action.tsx`, `control.tsx`
- Numbers & inputs: `number.tsx`, `numbers.tsx`, `numora.tsx`, `ticker.tsx`, `chart.tsx`, `slider.tsx`
- Layout & reflow: `rewrite.tsx`, `resize.tsx`, `reflow.tsx`, `responsive.tsx`, `lists.tsx`, `stacks.tsx`
- Physics & playful: `elastic.tsx`, `gestures.tsx`, `playful.tsx`, `matter.tsx`, `machines.tsx`
