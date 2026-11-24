# `templates/` — React 19 & Vanilla CSS/JS Jig Runtimes

This folder contains the standalone runtime files for the **Design Kit Jig** (`style-jig`). None of these files depend on any specific demo app; they can wrap any component, application, 3D scene, or slide deck.

## Files in `templates/`

| File | Target | Purpose |
| :--- | :--- | :--- |
| [`TopStyleJig.tsx`](TopStyleJig.tsx) | React 19 + TypeScript | Complete React harness exporting `<TopStyleJig />`, `<SafeZoneStage />`, `<ImmersiveRightJig />`, `<BackplateDropdown />`, and `useStyleJig()`. |
| [`style-jig.css`](style-jig.css) | Vanilla HTML / CSS | Core stylesheet defining `--bg`/`--plate` dark & light tokens, `.top-jig-wrap`, `.bottom-motion-wrap`, `.dk-panel`, `.dk-dropdown`, safe-zone padding, and library lock states. |
| [`style-jig-runtime.js`](style-jig-runtime.js) | Vanilla HTML / JS | Global `window.JigAgent` runtime: enforces layering & safe-zones, mounts `.dk-panel` scrubbers/dropdowns, syncs `CustomEvent` + `postMessage`, and runs the unscripted `motion-craft ▶` Auto-Traveler. |
| [`variant-notches.css`](variant-notches.css) | Vanilla HTML / CSS | Stylesheet for the right-side vertically centered `16×16px` donor thumbnail squares (`#jigStyleVariants` / `.right-variant-notches`) and `176×124px` hover preview card. |
| [`variant-notches.js`](variant-notches.js) | Vanilla HTML / JS | Runtime that mounts the right-side `1/N .. N/N` variant notch rail whenever a non-`clone` style has multiple donor variants and broadcasts `SET_STYLE_VARIANT`. |
| [`defaults/`](defaults/README.md) | Markdown + YAML | The 8 canonical `default.md` fallback style definitions (`clean`, `grid`, `editorial`, `cinematic`, `product`, `brutal`, `playful`, `retro`). |

---

## 1. Using the Vanilla HTML / JS Runtime

Include the CSS and JS files in your HTML document `<head>`:

```html
<link rel="stylesheet" href="templates/style-jig.css" />
<link rel="stylesheet" href="templates/variant-notches.css" />
<script src="templates/style-jig-runtime.js" defer></script>
<script src="templates/variant-notches.js" defer></script>
```

### Standard Floating Bars Markup

```html
<!-- Top Style + UI Libraries & Theme Bars -->
<div class="top-jig-wrap" data-style-jig="true">
  <div class="floating-style-plate" role="toolbar" aria-label="Style taxonomy">
    <button class="jig-word active" data-jig-pick="clone">clone</button>
    <button class="jig-word" data-jig-pick="clean">clean</button>
    <button class="jig-word" data-jig-pick="grid">grid</button>
    <button class="jig-word" data-jig-pick="editorial">editorial</button>
    <button class="jig-word" data-jig-pick="cinematic">cinematic</button>
    <button class="jig-word" data-jig-pick="product">product</button>
    <button class="jig-word" data-jig-pick="brutal">brutal</button>
    <button class="jig-word" data-jig-pick="playful">playful</button>
    <button class="jig-word" data-jig-pick="retro">retro</button>
  </div>

  <div class="floating-lib-plate" data-style-jig-plate="ui-libraries" role="toolbar" aria-label="UI libraries and theme">
    <button class="jig-word active" data-lib-pick="shadcn">shadcn</button>
    <button class="jig-word" data-lib-pick="ease">ease</button>
    <button class="jig-word" data-lib-pick="fluid">fluid</button>
    <button class="jig-theme-btn" data-theme-toggle aria-label="Toggle dark/light theme">☾</button>
  </div>
</div>

<!-- Isolated Center Stage -->
<main class="stage jig-safe-stage" data-jig-stage>
  <div class="fit-stage">
    <div class="fit-target">
      <!-- Your component, app, or iframe goes here -->
    </div>
  </div>
</main>

<!-- Bottom Motion-Craft Auto-Traveler Bar -->
<div class="bottom-motion-wrap" data-style-jig-bottom="true">
  <div class="floating-motion-plate" data-style-jig-plate="motion-libraries">
    <button class="jig-word active" data-motion-pick="motion-craft">motion-craft</button>
    <button class="jig-play-btn" data-auto-toggle aria-label="Play auto-traveler">▶</button>
  </div>
</div>
```

---

## 2. Using the React 19 Harness (`TopStyleJig.tsx`)

Copy `TopStyleJig.tsx` into `src/components/TopStyleJig.tsx` (or run `python3 scripts/init_style_jig.py <project-dir>`):

```tsx
import { TopStyleJig, SafeZoneStage } from './components/TopStyleJig';

export function App() {
  return (
    <TopStyleJig initialStyle="clone" initialUiLibrary="shadcn" initialTheme="dark">
      <SafeZoneStage mode="component">
        {/* Your application or component */}
      </SafeZoneStage>
    </TopStyleJig>
  );
}
```

---

## 3. Built-In Right-Hand Inspector Schemas (`window.JigAgent.DEFAULT_SCHEMAS`)

`style-jig-runtime.js` includes 7 ready-to-mount inspector schemas out of the box:
- **`3d`**: `shapeType` (`chain · helix · ring · wave · arch`), `count`, `gap`, `scrollSpeed`, `rotSpeed`, `camZ`, `cuboidColor` swatch.
- **`parallax`**: `headSpeed`, `lineSpread`, `bodySpeed`, `btnSpeed`, `oscAmp`, `hoverLift`, `autoScroll` toggle + Parallax Reset (`scrollTop = 0` + `clone`).
- **`shader`**: Custom Backplate Dropdown (`silk blend · mesh drift · ink ridges · gradient mesh · ascii art`) + `angle`, `wave`, `distortion`, `soften`, `vignette`, `grain`.
- **`menu`**: `dockLayout` (`floating · bar · circle`) + `roundness`, `stroke`, `scale`, `blur`, `frost`, `refraction`, `specular`, `highlight`.
- **`cards`**: Custom Backplate Dropdown (`glass feed · orbit ring · helix`), `faceMode` (`images · gray`), `count`, `size`, `corner`, `speed`, `warp`, `zoom`, `orbit`, `tilt`.
- **`bg`**: Custom Backplate Dropdown (`mesh drift · silk blend · ink ridges · gradient mesh · ascii art`) + `angle`, `wave`, `distortion`, `soften`, `vignette`, `grain`.
- **`immersive`**: Overview inspector with `depth`, `motion`, `wave`, `soften`, `grain`.
