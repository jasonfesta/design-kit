# Torph — Frameworks & Complete API (`torph@0.1.4`)

Verified directly from `libraries/sources/torph/package/dist/*.d.ts`.

## Framework adapters

### React (`torph/react`)

Exports: `TextMorph`, `useTextMorph`, `type TextMorphProps`.

```tsx
import { TextMorph, useTextMorph } from "torph/react";

// Declarative component
<TextMorph
  as="h2"
  className="text-2xl font-medium tabular-nums"
  duration={400}
  ease="cubic-bezier(0.19, 1, 0.22, 1)"
  locale="en"
  numbers={true}
  decimals={2}
  scale={true}
  onAnimationStart={() => {}}
  onAnimationComplete={() => {}}
  onAnimationCancel={() => {}}
>
  {value}
</TextMorph>

// Imperative hook
function CustomMorph({ label }: { label: string }) {
  const { ref, update } = useTextMorph({
    duration: 350,
    ease: { stiffness: 200, damping: 20 },
  });

  useEffect(() => {
    update(label);
  }, [label, update]);

  return <span ref={ref} />;
}
```

### Vue 3 (`torph/vue`)

Exports: `TextMorph`, `type TextMorphProps`. Uses `text` prop (not default slot) and `class` (not `className`).

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TextMorph } from "torph/vue";

const label = ref("Copy");
</script>

<template>
  <TextMorph
    :text="label"
    as="span"
    class="font-medium"
    :duration="400"
    ease="cubic-bezier(0.19, 1, 0.22, 1)"
    locale="en"
  />
</template>
```

### Svelte 5 (`torph/svelte`)

Exports: `TextMorph`, `type TextMorphProps`. Uses `text` prop and `class` / `style` (string).

```svelte
<script lang="ts">
  import { TextMorph } from "torph/svelte";
  let text = $state("Copy");
</script>

<TextMorph
  {text}
  as="span"
  class="font-medium"
  duration={400}
  ease="cubic-bezier(0.19, 1, 0.22, 1)"
  locale="en"
/>
```

### Vanilla JS / TypeScript (`torph`)

```ts
import { TextMorph } from "torph";

const el = document.getElementById("status")!;
const morph = new TextMorph({
  element: el,
  duration: 400,
  ease: "cubic-bezier(0.19, 1, 0.22, 1)",
  locale: "en",
  onAnimationStart: () => {},
  onAnimationComplete: () => {},
  onAnimationCancel: () => {},
});

morph.update("Processing Transaction");
// Later, with optional caret index for editable single-number inputs:
morph.update("$120", 2);
// Cleanup:
morph.destroy();
```

## Full Options Reference (`TextMorphOptions`)

| Option | Type | Default | Notes |
| :--- | :--- | :--- | :--- |
| `element` | `HTMLElement` | required (vanilla only) | Host DOM element |
| `duration` | `number` | `400` | Milliseconds; ignored when `ease` is a `SpringParams` object |
| `ease` | `string \| SpringParams` | `"cubic-bezier(0.19, 1, 0.22, 1)"` | CSS timing function or `{ stiffness?, damping?, mass?, precision? }` |
| `scale` | `boolean` | `true` | Scale exiting segments as they fade |
| `numbers` | `boolean` | `true` | Place-value rolling for numeric words; `false` uses character LCS |
| `decimals` | `number` | `undefined` | Fraction digits when value is a `number`; ignored for strings |
| `locale` | `Intl.LocalesArgument` | `"en"` | Used for `Intl.Segmenter` and number formatting |
| `disabled` | `boolean` | `false` | Disables morph animations (swaps immediately) |
| `respectReducedMotion` | `boolean` | `true` | Tracks `prefers-reduced-motion` live |
| `debug` | `boolean` | `false` | Shows visual debug bounding indicators |
| `onAnimationStart` | `() => void` | `undefined` | Fires when a morph begins |
| `onAnimationComplete` | `() => void` | `undefined` | Fires when a morph finishes uninterrupted |
| `onAnimationCancel` | `() => void` | `undefined` | Fires when superseded mid-flight; mutually exclusive with `onAnimationComplete` |

### `SpringParams`

| Field | Type | Default | Meaning |
| :--- | :--- | :--- | :--- |
| `stiffness` | `number` | `100` | Spring tension |
| `damping` | `number` | `10` | Friction / settle rate |
| `mass` | `number` | `1` | Inertia |
| `precision` | `number` | `0.001` | Settled threshold |

## Low-level exports (`torph`)

For custom renderers or tooling built on Torph's diff/segmentation engine:

- `DEFAULT_AS` (`"span"`) and `DEFAULT_TEXT_MORPH_OPTIONS`
- `MorphController` — lifecycle wrapper managing `attach`, `update(text, cursorIndex?)`, `needsRecreate`, `destroy`, `MorphController.serializeConfig`
- `segmentText(value: string, locale: Intl.LocalesArgument, numbers?: boolean): Segment[]`
- `diffSegments(oldSegments: Segment[], newText: string, locale: Intl.LocalesArgument, options?: DiffOptions): DiffResult`
- `isNumericWord(word: string): boolean` — strict quantity detector (excludes dates, versions, IDs like `"COVID-19"`)
- `decimalSeparator(locale: Intl.LocalesArgument): string` — returns locale decimal pivot
- `segmentNumber(value: string, prevSegments?: NumberSegment[], cursorIndex?: number, decimalChar?: string): NumberSegment[]`
