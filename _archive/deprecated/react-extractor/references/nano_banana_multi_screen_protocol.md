# Nano Banana Multi-Screenshot Image-to-React Protocol & Strict Pixel-Perfection Guidelines

This reference manual defines the **strict multi-screenshot synthesis, layout extraction, and pixel-perfection evaluation rules** for converting **Nano Banana** deliverables—comprising **8+ Apps**, **8+ Website Landing Pages (with sub-pages and scroll sections)**, and **UI Components**, each accompanied by **5 to 10 high-resolution screenshots**, markdown briefs, and metadata—into canonical Google Golden Template React 19 + Vite 7 + Tailwind v4 packages (`<moodboard>/projects/<NN>-<category>-<descriptor>/`).

---

## 1. End-to-End Multi-Screenshot Architecture

Every Nano Banana entity (an App, a Website Landing Page with sub-pages, or a UI Component suite) arrives with:
- **Metadata & Markdown**: Aesthetic direction, typography, palette notes, component hierarchy, and screen descriptions.
- **5 to 10 Reference Screenshots** (`screen_0` .. `screen_N`):
  - For **Website Landing Pages (`01-website-<descriptor>`)**:
    - May represent **distinct sub-pages / routes** (e.g., `Home`, `Product Detail`, `Collection / Editorial`, `About / Atelier`, `Checkout / Journal`) **OR** **sequential viewport scroll sections** (`Hero`, `Features Bento`, `Interactive Showcase`, `Testimonials`, `Footer CTA`).
  - For **Mobile Apps (`13-mobile-app-<descriptor>`)**, **UI Components (`07-ui-<descriptor>`)**, & **Chat UIs (`19-chat-ui-<descriptor>`)**:
    - Represent **distinct application screens, tabs, drawers, modals, or active workflow states** (e.g., `Dashboard`, `Detail Sheet`, `Analytics View`, `Filter Modal`, `Settings / Profile`).

### Single Golden Template Package per Entity
Each App, Website Landing Page, or Component is synthesized into **one cohesive, multi-screen Golden Template React application** at:
```text
<moodboard>/projects/<NN>-<category>-<descriptor>/
├── index.html                  # Root HTML5 document with Google Fonts, #root mount & standalone Code Inspector
├── package.json                # Exact canonical React 19 + Vite 7 + Tailwind v4 + SingleFile config
├── tsconfig.json               # Strict TypeScript bundler config with @/* alias
├── vite.config.ts              # Canonical Vite config (base: './', singlefile)
└── src/
    ├── main.tsx                # StrictMode entry mounting <App />
    ├── index.css               # @import "tailwindcss"; unified 8 Golden semantic tokens (--surface, --ink, --accent, etc.)
    ├── App.tsx                 # Multi-screen state router supporting ?screen=<i> & window.__setGoldenEvalScreen
    ├── components/
    │   ├── <Brand>Logo.tsx     # Bespoke vector SVG brand emblem
    │   ├── Screen01<Name>.tsx  # Dedicated, pixel-accurate view for Screenshot 0 (or shared layout + sub-page views)
    │   ├── Screen02<Name>.tsx  # Dedicated, pixel-accurate view for Screenshot 1
    │   └── ...                 # Up to 10 modular screen/section components
    ├── data/
    │   └── <domain>Data.ts     # All typed interfaces, exact verbatim text/metrics from all 5-10 screenshots, and helpers
    └── utils/
        └── cn.ts               # Canonical clsx + tailwind-merge helper
```

---

## 2. Mandatory Multi-Screen Evaluation Contract (`?screen=<i>` & `window.__setGoldenEvalScreen`)

To enable [`scripts/eval-multi-screen-project.mjs`](../scripts/eval-multi-screen-project.mjs) to render and score **all 5–10 screenshots** in a single headless WebKit2GTK pass with **zero human intervention**, every synthesized [`src/App.tsx`](../../../golden-template/dating/src/App.tsx) **MUST** implement the Golden Multi-Screen Evaluation Contract:

### 2.1 Initial URL Query Parameter Support
On initial mount, `App.tsx` must inspect `window.location.search` for `?screen=<index>` (0-based integer `0..9`) and `?screenId=<screen_id>`:

```tsx
import React, { useEffect, useState } from 'react';
import { SCREENS } from './data/projectData';

declare global {
  interface Window {
    __setGoldenEvalScreen?: (index: number, screenId?: string) => boolean;
  }
}

function getInitialScreenIndex(): number {
  if (typeof window === 'undefined') return 0;
  const params = new URLSearchParams(window.location.search);
  const screenIdParam = params.get('screenId');
  if (screenIdParam) {
    const byId = SCREENS.findIndex((s) => s.id === screenIdParam);
    if (byId >= 0) return byId;
  }
  const screenParam = params.get('screen');
  if (screenParam !== null) {
    const parsed = Number.parseInt(screenParam, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed < SCREENS.length) {
      return parsed;
    }
  }
  return 0;
}
```

### 2.2 Global `window.__setGoldenEvalScreen` Hook
Inside `App()`, register `window.__setGoldenEvalScreen` inside a `useEffect` so the headless evaluator can switch between screens `0..N` instantaneously without reloading the bundle:

```tsx
export function App() {
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(getInitialScreenIndex);

  useEffect(() => {
    window.__setGoldenEvalScreen = (index: number, screenId?: string) => {
      if (screenId) {
        const foundIdx = SCREENS.findIndex((s) => s.id === screenId);
        if (foundIdx >= 0) {
          setActiveScreenIndex(foundIdx);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          return true;
        }
      }
      if (typeof index === 'number' && index >= 0 && index < SCREENS.length) {
        setActiveScreenIndex(index);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        return true;
      }
      return false;
    };
    return () => {
      delete window.__setGoldenEvalScreen;
    };
  }, []);
```

### 2.3 Hiding Floating Screen Switchers During Pixel Evaluation (`gt-eval-hide`)
- Whenever you include a floating screen/sub-page switcher pill bar (for human reviewers to click through all 5–10 screens when viewing the app interactively) that is **not** part of the reference screenshot itself, you **MUST** add `className="gt-eval-hide"` or `data-eval-hide="true"` to that floating bar.
- `eval-multi-screen-project.mjs` automatically injects CSS (`#gt-inspector-host, .gt-eval-hide, [data-eval-hide="true"] { display: none !important; }`) during headless screenshot capture so that only the pure 1:1 UI from the reference screenshot is rendered and scored.
- Any in-design navigation bar, tab bar, sidebar, or header that **is** visible in the reference screenshot must remain normal (do **not** mark in-design navigation with `gt-eval-hide`) and should also be wired to call `setActiveScreenIndex(idx)` when clicked!

---

## 3. The 12 Strict Pixel-Perfection & Layout Extraction Invariants

Every screen (`0..N`) inside a Nano Banana project is audited against its corresponding reference screenshot (`ref_screen_<i>.png`) by `eval-multi-screen-project.mjs`. To pass, your synthesis **MUST** obey these 12 strict invariants:

### Invariant 1: Exact Viewport Aspect Ratio & Outer Shell Geometry
- Inspect `nano_banana_spec.json` (`screens[i].viewport.width` × `screens[i].viewport.height`) generated by [`scripts/ingest-nano-banana.py`](../scripts/ingest-nano-banana.py).
- **Desktop Website Landing Pages / Sub-Pages (`1440×900` or `1280×800`)**:
  - Match the exact top nav height (`64px`–`88px`), container max-width (`max-w-[1360px]` or full-bleed grid with exact padding), and section vertical rhythm found in `screens[i]`.
  - If a screenshot shows a single viewport-locked stage (`1440×900`), the corresponding screen view must fill `min-h-screen` with the exact top/bottom/left/right margins measured in the 12×8 color-cell grid.
- **Mobile App Screens (`13-mobile-app-*`)**:
  - If the reference screenshot is a portrait mobile frame (e.g., `390×844` or `430×932`), render the screen at exact 1:1 full-bleed mobile viewport dimensions when evaluated at that viewport, or if the reference screenshot displays a centered phone device frame on a studio canvas (`1440×900`), match the exact device frame width, border radius (`rounded-[44px]`), bezel thickness, and background studio surface color at the exact bounding box coordinates from `nano_banana_spec.json`.

### Invariant 2: Sub-Pixel Color Sampling & 8-Token Semantic CSS Variables
- Never guess hex colors. Use the k-means dominant palette and 12×8 cell grid hex samples extracted in `nano_banana_spec.json` (`unified_palette` and `screens[i].spec`).
- Declare all 8 Golden semantic tokens in `src/index.css` (`:root`):
  - `--surface`, `--surface-raised`, `--ink`, `--muted`, `--accent`, `--accent-alt`, `--on-accent`, `--border`
- If a specific sub-page or dark-mode modal screenshot uses an inverted or secondary surface (e.g., a dark editorial lookbook page or checkout drawer), scope screen-specific surface overrides cleanly while preserving `--surface` and `--ink` in `:root`.

### Invariant 3: Verbatim Copy, Numerals, Badges & Micro-Labels
- Every headline, subheadline, nav link, pill label, price tag, timestamp, metric numeral, axis tick, and button label visible in Screenshot `i` must be transcribed **verbatim** into `src/data/<domain>Data.ts`.
- Never replace visible text with generic `"Lorem ipsum"` or placeholder strings.
- Apply `tabular-nums` (`font-variant-numeric: tabular-nums`) to every counter, price, metric, timer, coordinate, and table cell.

### Invariant 4: Typography Scale, Font Pairing & Optical Tracking
- Match the exact font category from the reference screenshot (`--font-display` serif/display, `--font-sans` geometric/humanist sans, `--font-mono` technical mono) and load the corresponding Google Fonts in `index.html`.
- Match display headline line-height (`leading-[0.95]` to `leading-[1.08]`), letter-spacing (`tracking-[-0.03em]` for large display, `tracking-[0.14em] uppercase` for micro-kickers), and font weight (`font-normal`, `font-medium`, `font-semibold`).

### Invariant 5: 12×8 Cell Spatial Alignment (`s_color` & `s_ssim`)
- `eval-multi-screen-project.mjs` partitions both the reference screenshot and your rendered React output into a 12×8 grid (and 64×64 SSIM blocks).
- Before building, inspect the top/bottom/left/right bounding coordinates of:
  1. Top navigation bar / status bar
  2. Hero headline block & CTA cluster
  3. Primary media frame / 3D or illustration stage / chart canvas
  4. Multi-column card grid / bento cells / sidebar / bottom dock
- Use exact Tailwind grid template columns (`grid-cols-12`, `grid-cols-[280px_1fr_320px]`, etc.) and explicit aspect ratios (`aspect-[16/10]`, `aspect-[4/5]`) so major visual masses land in the exact same grid cells as the reference image.

### Invariant 6: Zero DOM Text/Control Collisions (`collision_count === 0`)
- Sibling interactive controls (`<button>`, `<a>`, `<input>`) and text leaves must **never** overlap (`intersectionArea > 4px²`).
- Never use fragile absolute positioning for text blocks over other text blocks without bounded flex/grid containers.
- When placing floating badges or overlays over media frames, mark purely decorative background art layers with `aria-hidden="true"` or `data-photo-frame="true"` and place overlay pills inside a padded flex header/footer container (`flex items-center justify-between gap-2 p-4`).

### Invariant 7: Symmetrical Button & Pill Padding (`button_padding_violations === 0`)
- Every visible `<button>` and `[role="button"]` across all 5–10 screens must have:
  - `paddingLeft >= 8px` and `paddingRight >= 8px` (`px-3.5` to `px-6`) unless it is a square/circular icon-only button (`aspectRatio` between `0.78` and `1.28`).
  - Horizontal symmetry: `|paddingLeft - paddingRight| <= 6px`.
  - Vertical symmetry: `|paddingTop - paddingBottom| <= 4px`.
  - Proper icon-to-label gap (`inline-flex items-center justify-center gap-2`).

### Invariant 8: Equal Grid Card Geometry (`grid_equality_violations === 0`)
- In every multi-column CSS Grid (`gridTemplateColumns` with 2+ columns), sibling cards on the same row (`|top_A - top_B| <= 8px`) must have identical heights (`|height_A - height_B| <= 2px`) and consistent column widths (`|width_A - width_B| <= 3px` for equal-width tracks).
- Always use `h-full flex flex-col justify-between` on grid cards so footer actions align on the exact same baseline.

### Invariant 9: Zero Clipped Text & Zero Horizontal Overflow (`clipped_count === 0`, `horizontal_overflow_px <= 2`)
- Never set fixed pixel heights on text containers without `truncate` / `line-clamp-*`.
- Ensure the root container fits the reference viewport width with `0px` unintended horizontal scroll (`overflow-x-hidden` on outer stage shells only after verifying all child columns fit within `100%` width).

### Invariant 10: High-Craft Visual Media, Custom SVGs & Procedural Canvases
- Never leave empty gray boxes or broken `<img>` tags (`broken_image_count === 0`).
- Where a reference screenshot features photography, bespoke 3D renders, architectural diagrams, data charts, or tactile illustrations:
  - Crop and embed the exact high-resolution photographic/illustration region from the Nano Banana source image (as a local asset or data URL / SVG composition) **OR** render a high-craft multi-stop SVG / HTML5 Canvas visual that matches the exact luminance, color distribution, and subject geometry of that region so both `s_color` and `s_ssim` achieve `>= 0.85`.

### Invariant 11: Real Multi-Screen & In-Screen Interactivity
- Every project must be a **genuinely functional React application**:
  - Clicking navigation links, sub-page tabs, sidebar items, or workflow step buttons transitions smoothly between the 5–10 screens (`setActiveScreenIndex(i)`).
  - Within each screen, interactive elements (filters, search inputs, quantity steppers, accordions, chart toggles, drawers, modals) must work with real React state (`useState`, `useMemo`).

### Invariant 12: Strict Quantitative Pass Gate Across All Screens
- When running [`scripts/eval-multi-screen-project.mjs`](../scripts/eval-multi-screen-project.mjs):
  - **Mean Composite Visual Score (`mean_s_total`)**: `>= 0.85` across all screens (`0.45 * s_ssim + 0.30 * s_color + 0.25 * s_dom`)
  - **Minimum Single-Screen Score (`min_s_total`)**: `>= 0.82` (no weak or neglected sub-screen allowed)
  - **Total Collisions across all screens**: `0`
  - **Total Clipped Text across all screens**: `0`
  - **Total Broken Images across all screens**: `0`
  - **Total Button Padding Violations across all screens**: `0`
  - **Total Grid Equality Violations across all screens**: `0`
  - **Max Horizontal Overflow across all screens**: `<= 2px`

---

## 4. Step-by-Step Execution Loop for Each Nano Banana Project

1. **Ingest & Extract Spec**:
   ```bash
   python3 ./skills/image-to-react/scripts/ingest-nano-banana.py \
     --input-dir "<path-to-nano-banana-drop>" \
     --out-dir "<scratch-dir>/nano-banana-specs"
   ```
2. **Scaffold Canonical Golden Template Package**:
   ```bash
   node ./skills/image-to-react/scripts/scaffold-golden-from-image.mjs \
     --moodboard="<moodboard-path>" \
     --slug="<NN>-<category>-<descriptor>" \
     --title="<Category Label> — <Project Title>" \
     --spec="<scratch-dir>/nano-banana-specs/<slug>/nano_banana_spec.json"
   ```
3. **Synthesize All 5–10 Screens & Wire `window.__setGoldenEvalScreen`**:
   - Read every reference screenshot (`screens[0]` .. `screens[N-1]`) directly using `read_file` alongside the markdown/metadata brief and `nano_banana_spec.json`.
   - Build modular screen components in `src/components/`, populate `src/data/<domain>Data.ts`, and wire `?screen=<i>` + `window.__setGoldenEvalScreen` in `src/App.tsx`.
4. **Build Single-File Bundle**:
   ```bash
   npm --prefix "<moodboard-path>/projects/<slug>" run build
   ```
5. **Run Strict Multi-Screen Visual & DOM Evaluator**:
   ```bash
   node ./skills/image-to-react/scripts/eval-multi-screen-project.mjs \
     --project="<moodboard-path>/projects/<slug>" \
     --spec="<scratch-dir>/nano-banana-specs/<slug>/nano_banana_spec.json" \
     --out-dir="<scratch-dir>/eval/<slug>" \
     --target-score=0.85 \
     --min-screen-score=0.82
   ```
6. **Inspect Diffs & Iterate Until `overall_passed: true`**:
   - For any screen with `s_total < 0.85` or any DOM violation, inspect `<scratch-dir>/eval/<slug>/screen_0i_<id>/side_by_side_<id>.png` and `diff_mask_<id>.png`, fix the exact component geometry/colors/padding, rebuild, and re-run `eval-multi-screen-project.mjs`.
7. **Run Universal Golden Template Linter & Bundle Verifier**:
   ```bash
   node ./golden-template/scripts/lint-golden-template.mjs \
     --dir="<moodboard-path>" --fix
   ```
