# benchmark capture, evidence honesty & originality blocklist rules (`research`)

This reference defines how `research` captures, validates, and documents the **5 standout benchmarked properties** so downstream `style-direction`, `eval`, and `design-critique` stages have verifiable visual and textual evidence.

---

## 1. multi-surface capture protocol per benchmark (`01..05`)

Store all captures under `<study-slug>/research/screenshots/<NN>-<property-slug>/`:

1. **desktop & mobile-web full-webpage pixel-perfect captures (`scripts/capture_fullpage_devtools.mjs`)**:
   - Render public URLs using Chrome DevTools Protocol (`scripts/capture_fullpage_devtools.mjs`) or Playwright across the **entire full-length webpage** after auto-scrolling to hydrate all lazy-loaded assets, WebGL/canvas scenes, and scroll reveals:
     - **desktop (`@2x`, `1440px` CSS -> `2880px` physical width)**: `desktop-fullpage.png` (seamless top-to-bottom full webpage), `desktop-fullpage-contact.jpg` (4-column side-by-side overview sheet), `desktop-base-hero-2k.png`, `desktop-base-mid-2k.png`, `desktop-base-lower-2k.png`, `desktop-base-footer-2k.png`, and `fullpage-callouts.json` (structured section-by-section inventory of every callout, card, badge, code snippet, CTA, and footer column across the entire webpage).
     - **mobile web (`@3x`, `390 x 844` -> `1170px` physical width)**: `mobile-fullpage.png` + `mobile-base-2k.png`.
   - **page 2 & page 3 selection**: inspect the property's primary header navigation and user journey; pick the **#2 and #3 highest-priority product destinations** (such as `Collection` + `Product Detail`, `Product` + `Pricing`, `Workflow` + `Security`, or `Gameplay` + `World / Roster`—never low-signal `/privacy` or `/terms` pages).
2. **native app & game captures**:
   - Pull official high-resolution publisher screenshots (e.g., Apple App Store `1200 x 2607` iPhone previews, Google Play previews, official press kits, or public documentation screenshots) into `app-preview-01.png`..`app-preview-N.png`.
   - Record the exact publisher source URL, version string (if listed), and which preview illustrates **Tab 1**, **Tab 2**, and **Tab 3**.
3. **visual inspection gate (`browser-validation`)**:
   - Open and inspect **every saved capture** via `read_file` at readable resolution.
   - Reject blank screens, bot-challenge interstitials, giant unclosed cookie walls covering >30% of the viewport, or broken lazy-loaded gray boxes. If a live route blocks headless rendering, fall back to official public documentation/press captures and state the capture method honestly in `evidence`.

---

## 2. per-property markdown template (`research/properties/<NN>-<slug>.md`)

```markdown
# <NN> · <property name> (<category / area>)

- **inspected**: YYYY-MM-DD
- **domain & surfaces**: `<website / mobile-web / mobile-app / 3d / game · category & aesthetic notes>`
- **urls inspected**:
  - page 1 (entry): <https://...>
  - page 2 (nav #2): <https://...>
  - page 3 (nav #3): <https://...>
  - app / docs source: <https://...>
- **saved captures**:
  - desktop: `../screenshots/<NN>-<slug>/desktop-page-1.png`, `desktop-page-2.png`, `desktop-page-3.png`
  - mobile web: `../screenshots/<NN>-<slug>/mobile-web-page-1.png`
  - app previews: `../screenshots/<NN>-<slug>/app-preview-01.png` .. `app-preview-05.png`
  - component excerpt: `../screenshots/<NN>-<slug>/component-01.png` (crop `[x, y, w, h]` from `<parent>`)

## observed 5-part site anatomy & ux evidence (`>= 5` desktop + mobile captures verified)
- **header**: <sticky vs static, height in px, background/border treatment, logo lockup, right-rail auth & primary CTA pills>
- **navigation**: <exact top-level IA order, dropdown/mega-menu/tab triggers, docs/changelog links, 390px mobile drawer/sheet reflow>
- **touts (hero + section-by-section breakdown)**: <hero tout headline/subhead/proof framing + each mid-page tout module, grid split, bento vs 1px Swiss ledger vs split-screen, telemetry/code ratio>
- **interactions**: <every live interactive mechanic: code/API tab switchers, live crawl/eval sandboxes, approval gate steppers, diff sliders, workflow node graphs, hover/scroll choreography>
- **footer**: <colophon architecture, column count & headings, live system status indicator, newsletter/CTA closure band, oversized wordmark or dark/light polarity shift>
- **typography & surface tokens**: <display vs section heading vs 13-15px UI label sizing, tabular numerals, surface/ink/accent hexes>
- **evidence limits**: <e.g., public marketing + docs + 390px mobile-web captures; note any bot-wall fallback honestly>

## originality blocklist entries (do not copy)
- **benchmark fonts to avoid**: `<exact typeface names observed in CSS or specimen>`
- **benchmark brand hexes to avoid**: `<primary brand accent & signature surface hexes>`
- **trademarks / signature motifs to avoid**: `<brand wordmark, proprietary icons, certification badges, slogans>`

## takeaway & adaptation for our concept
- **core ux takeaway**: <1-2 sentences on why this property is a category bar>
- **adaptation into our design plan**: <how we adapt the functional structure into our original world without duplicating layout, copy, fonts, or colors>
```

---

## 3. master `research/benchmarks.md` & `research/style-range.md` synthesis requirements

`research/benchmarks.md` aggregates the 5 standout property files into four actionable tables for `style-direction` and `design-critique`:
1. **the 5-benchmark comparison matrix** (`#01..#05`, URLs, surface & aesthetic range notes, primary strength).
2. **page and navigation consensus architecture** (what visitors/players must accomplish at each step and why).
3. **candidate component and experience taxonomy** (high-leverage component and interactive patterns observed across the 5 benchmarks from which `style-direction` will define distinct system components and experiences).
4. **consolidated `avoid_fonts` & `avoid_palettes` blocklists** (every typeface and brand color combination used by the 5 benchmarks that downstream stages are forbidden from copying verbatim).
5. **named style range (`research/style-range.md`)**: 5-10 named non-beige directions with direct inspiration links, ensuring diversity without regression to beige.
