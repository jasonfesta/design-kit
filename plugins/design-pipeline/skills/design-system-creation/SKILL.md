---
name: design-system-creation
description: Design, engineer, document, and verify high-taste multi-component UI design systems, calm living component libraries, focused product screens, and multi-state marketing and imagery component guides sharing one two-layer OKLCH token pipeline, anti-slop and anti-cosplay restraint, OS-free accessible controls, and headless Playwright verification.
user-invokable: true
args:
  - name: brief
    description: Product subject, human audience, tone, or component catalog scope to design and build (optional)
    required: false
---

# Design system creation

Approach every system as the design lead of an independent studio hired because templated kits failed. Deliver a cohesive, tasteful component library proved inside one focused, desirable product screen, running off one shared CSS and JavaScript token architecture without inline overrides.

Route narrower requests to the focused sibling skill when a complete multi-component system is unnecessary:

| Sibling skill | Best fit |
| :--- | :--- |
| `product-design-system` | Compact Tailwind `@theme` token sheet without living components |
| `atelier` | Blank-slate creative divergence before committing to one direction |
| `frontend-design` | Standalone expressive landing page or single marketing view |
| `web-typography` | Responsive font pairing, script coverage, or typographic repair |
| `button-craft` | Deep single-control tactile physics for hero calls to action |
| `website-copy` | Standalone landing headline, subhead, CTA, or microcopy rewrites |
| `enterprise-workspaces-and-dashboards` | Standalone operational workspace without library documentation |

Read the four reference blueprints alongside this six-step workflow:

- [archetypes-and-optical-math.md](references/archetypes-and-optical-math.md) covers studio surface postures, whitespace ratios, primary tonal authority, OKLCH ladders, concentric radii, shadows, human numeric typography, and domain centerpieces.
- [component-catalog-and-states.md](references/component-catalog-and-states.md) gives HTML, CSS, ARIA, and JavaScript blueprints for custom OS-free selects, sliders, switches, validation timing, roving tabs, tables, and modal dialogs.
- [marketing-components.md](references/marketing-components.md) blueprints marketing and imagery component docs covering overviews, plain usage rules, control restraint, inward-gaze photography, background scrims, pricing, and forms.
- [anti-shadcn-traps.md](references/anti-shadcn-traps.md) diagnoses generic SaaS slop, marketing buzzword filler, stuffed hero sliders, precision-theater cosplay, nested border prisons, stretched block buttons, and null-origin crashes.

## Step 1 commit to a human brief and refuse both slop poles

Pin down the human person using the software, their single everyday job, and the materials of their real domain before writing tokens. Choose one committed visual thesis across four explicit dials covering palette restraint, type pairing, corner posture, and spatial rhythm:

| Studio posture | Natural home | Primary visual move |
| :--- | :--- | :--- |
| Obsidian precision tool | Developer, audio, and creative suites | Luminous porcelain primary over tinted dark depth |
| Sunlit industrial chalk | Hardware controls and focused utilities | Ninety percent stone monochrome plus one small accent |
| Daylight porcelain | Everyday finance, clinical, and team apps | Generous white ground with soft ground-tinted shadows |
| Warm archival paper | Publishing, research, and long reading | Optical-size serifs with quiet horizontal ink rules |
| Tactile enamel studio | Consumer studios, music, and craft tools | Crisp solid plinth caps over warm matte canvas |
| Stark civic utility | Public services and outdoor field forms | Two-pixel ink borders with unmistakable focus blocks |

Refuse generic SaaS clichés and unrequested AI taste reflexes before opening a style tag:

- Never fall back to unchosen Inter, bare system sans stacks, or headless Linux DejaVu Sans rendering.
- Refuse purple or indigo glows, aurora meshes, gradient-clipped headlines, frosted glass over scrolling text, and three-column icon feature rows.
- Refuse circular 4px to 14px status dots, colorful capsule pill confetti on status tags, and asymmetric 3px-plus left callout borders.
- Follow explicit palette or layout requests in the brief faithfully, but never default unprompted to the three overused AI aesthetics. Those reflexes are F4F1EA cream with serif and terracotta, near-black with neon cyan, acid-green, or vermilion, and zero-radius newspaper cages everywhere.
- Ban marketese buzzwords (supercharge, seamless, empower, unlock, elevate, next-gen, world-class, revolutionary, delve) and negative parallelism like it is not X, it is Y.
- Ban fake 10,000-team logo bars, three-emoji feature rows, glowing purple pricing rings, five-star avatar triplets, and SaaS seat cards pasted onto civic or hardware briefs.
- Refuse control stuffing on marketing components; never cram range sliders, stepper buttons, multi-input calculators, or filter toolbars into heroes or over background photography.
- Never copy placeholder hue angles, font names, radii, or sample copy from this skill verbatim; invent brief-specific choices every time.

Refuse cosplay rigor and precision theater just as firmly:

- Ban invented standards alphabet soup such as ISO-20022, IEC-60751, MIL-STD, or SLSA codes when plain English serves the user better.
- Ban gratuitous SHA hashes and live ticking UTC clocks where people simply want 4m ago, Yesterday, or Nov 5.
- Ban decorative ruler ticks that measure nothing, cartoon CSS screw heads, cybernetic 01 prefixes on unsequenced items, and stick-figure SVG clipart pretending to be artwork.
- Ban walls of 11px uppercase monospace labels and pompous cosplay headings; call buttons Buttons and dialogs Dialogs rather than solenoid bus triggers.
- Never greet users with self-describing material taglines like "Sunlit porcelain surfaces and editorial balances" that sound generated and contradict dark mode. Avoid leaning repeatedly on filler adjectives like calm or quiet.
- Never print UI instruction text, marketing slogan heroes inside workspaces, dead Potemkin controls, or developer buttons like "Test error" and "Check validation".

## Step 2 compose with whitespace tonal restraint and OKLCH math

Leave 35% to 45% of every viewport as open breathing ground so typography and controls read effortlessly. Separate sections with generous 2rem to 5rem vertical cadence, grouping related items by proximity and crisp alignment first, subtle surface shifts second, and hairlines or ambient shadows last. Never trap content inside three or four concentric 1px grey border cages.

Apply Chanel's mirror test and spend visual boldness in one deliberate place per view:

- On dark obsidian tools, make the single primary button crisp luminous alabaster or porcelain near 0.94 lightness with deep dark ink. Never pair garish neon cyan beside bright red blocks.
- On sunlit chalk or neutral utility tools, hold roughly 90% neutral stone, silver, and slate so one small deliberate brand or signal accent sings.
- Keep destructive buttons restrained at rest using muted ink or a neutral hairline border, revealing crimson only on hover, press, or inside an explicit confirmation step.
- Welcome generous card geometry from 8px to 14px and tasteful soft controls whenever they suit the brand, keeping peer controls harmonious in one bar.

Open your stylesheet with CSS cascade layers and a two-layer OKLCH token pipeline where components consume semantic roles exclusively across light, dark, and compact modes:

```css
@layer reset, tokens, base, components, layout, utilities;

@layer tokens {
  :root {
    color-scheme: light;
    /* SCHEMATIC ONLY: invent fresh hues, radii, and type stacks for your brief! */
    --hue-neutral: 245;
    --hue-accent: 252;
    --radius-card: 10px;
    --radius-control: 7px;
    --row-min-h: 2.875rem;
    --section-gap: 3.5rem;
    --stack-gap: 1.25rem;

    --surface-sunken: oklch(0.952 0.005 var(--hue-neutral));
    --surface-canvas: oklch(0.982 0.004 var(--hue-neutral));
    --surface-raised: oklch(0.998 0.002 var(--hue-neutral));
    --surface-overlay: oklch(1 0 0);
    --ink-primary: oklch(0.18 0.012 var(--hue-neutral));
    --ink-secondary: oklch(0.41 0.012 var(--hue-neutral));
    --border-hairline: oklch(0.20 0.01 var(--hue-neutral) / 0.10);
    --border-control: oklch(0.45 0.014 var(--hue-neutral));
    --primary-fill: oklch(0.22 0.018 var(--hue-neutral));
    --primary-ink: oklch(0.985 0.003 var(--hue-neutral));
    --accent-signal: oklch(0.50 0.15 var(--hue-accent));
    --focus-ring: oklch(0.48 0.16 var(--hue-accent));
    --signal-critical: oklch(0.48 0.18 25);
    --signal-warning: oklch(0.50 0.13 70);
    --signal-positive: oklch(0.47 0.12 155);
    --shadow-card:
      0 1px 2px oklch(0.20 0.015 var(--hue-neutral) / 0.05),
      0 10px 28px -8px oklch(0.20 0.02 var(--hue-neutral) / 0.08);
  }

  [data-theme="dark"] {
    color-scheme: dark;
    /* Higher dark surfaces step lighter; primary button turns luminous porcelain */
    --surface-sunken: oklch(0.125 0.008 var(--hue-neutral));
    --surface-canvas: oklch(0.155 0.009 var(--hue-neutral));
    --surface-raised: oklch(0.195 0.010 var(--hue-neutral));
    --surface-overlay: oklch(0.24 0.012 var(--hue-neutral));
    --ink-primary: oklch(0.945 0.005 var(--hue-neutral));
    --ink-secondary: oklch(0.74 0.009 var(--hue-neutral));
    --border-hairline: oklch(1 0 0 / 0.08);
    --border-control: oklch(0.60 0.012 var(--hue-neutral));
    --primary-fill: oklch(0.94 0.006 var(--hue-neutral));
    --primary-ink: oklch(0.15 0.012 var(--hue-neutral));
    --accent-signal: oklch(0.70 0.12 var(--hue-accent));
    --focus-ring: oklch(0.76 0.12 var(--hue-accent));
    --signal-critical: oklch(0.72 0.15 25);
    --signal-warning: oklch(0.76 0.12 74);
    --signal-positive: oklch(0.74 0.11 155);
    --shadow-card:
      0 1px 2px oklch(0.02 0.01 var(--hue-neutral) / 0.55),
      0 12px 30px -8px oklch(0.02 0.01 var(--hue-neutral) / 0.65);
  }

  [data-density="compact"] {
    --row-min-h: 2.125rem;
    --stack-gap: 0.75rem;
  }
}

.cluster-inset {
  border-radius: max(0px, calc(var(--radius-control) - 3px));
}
```

Set purposeful multi-role typography and enforce deterministic contrast floors across both themes:

- Pair a characterful display or editorial face with a crisp UI sans that distinguishes digit one, lowercase L, capital I, and zero cleanly. Keep monospace strictly for commit IDs, code diffs, and raw machine tokens, since monospace digits in sentences create jarring gaps and fake technical theater.
- Apply balanced wrapping to headings so no headline leaves a single orphaned trailing word, and hold prose columns to 60 to 72 characters without artificially narrowing prose subheadings.
- Activate Blink geometric text precision, normal kerning, antialiased smoothing, and inline SVG icons inheriting currentColor. Set prices, metrics, weights, dosages, and dates in the UI sans or editorial serif using tabular lining numerals and U+2212 minus signs:

```css
:root {
  --font-display: "Brief Display", Georgia, serif;
  --font-ui: "Brief Sans", "Liberation Sans", "Noto Sans", system-ui, sans-serif;
  --font-mono: "Brief Mono", "Liberation Mono", "Noto Sans Mono", ui-monospace, monospace;
}

html, body, button, input, select, textarea, output {
  text-rendering: geometricPrecision;
  font-kerning: normal;
  -webkit-font-smoothing: antialiased;
  letter-spacing: normal;
}

h1, h2, h3, h4 { text-wrap: balance; }
.num, th[data-numeric="true"], td[data-numeric="true"], time {
  font-family: var(--font-ui); /* Or editorial serif; never monospace on prose figures */
  font-variant-numeric: tabular-nums lining-nums;
}
th[data-numeric="true"], td[data-numeric="true"] { text-align: right; }
```

| Token pair | AA floor | Advisory APCA | Scope |
| :--- | :--- | :--- | :--- |
| Body and control text | `4.5:1` (SC 1.4.3) | `Lc >= 75` | Canvas, raised, and overlay surfaces |
| Large display headings | `3.0:1` (SC 1.4.3) | `Lc >= 60` | Light and dark themes alike |
| Active input boundaries | `3.0:1` (SC 1.4.11) | `Lc >= 45` | Disabled controls exempt |
| Keyboard focus ring | `2px` solid `3.0:1` | Clear offset | SC 2.4.13 across interactive items |

## Step 3 craft intrinsic controls with zero raw OS leaks

Keep zero external margins on reusable leaf components so parent Stack, Cluster, and Split primitives govern rhythm cleanly. Align vertical stacks to flex-start or start so inline action buttons hold intrinsic content width and never stretch clumsily across 400px desktop containers.

Style every form element explicitly so raw browser chrome never pokes through a bespoke design system:

- Size buttons intrinsically with comfortable padding and subtle tactile crowns or solid plinths. Overlap the label and hidden-at-rest spinner inside one grid cell for zero width jump.
- Reset native appearance on select elements and pair generous inline-end padding with a clean inline SVG chevron painted in semantic ink.
- Style range slider rails and thumbs explicitly across WebKit and Firefox pseudo-elements, pairing every drag slider with click step buttons to satisfy WCAG SC 2.5.7.
- Style checkboxes including indeterminate bars, radios, and switches cleanly without OS-blue ticks, aligning multi-line checkbox and radio rows to flex-start so controls anchor to line one.

Build complete orthogonal interactive states across six clearly named catalog families from [component-catalog-and-states.md](references/component-catalog-and-states.md):

| Catalog family | Core controls | Required state craft |
| :--- | :--- | :--- |
| Buttons | Primary, secondary, ghost, quiet danger, segmented | Intrinsic width, fine-pointer hover, cell spinner |
| Text fields | Static-label text, amount, select, readonly | Custom select chevron, blur-late validation |
| Selection | Checkbox, radio, switch, combobox, range | Custom track and thumb, mixed check, step buttons |
| Navigation | Top bar, roving tabs, breadcrumbs | Arrow-key roving tabindex, hidden tabpanel sync |
| Tables | Airy sortable table, summary list, status | Separate borders, button sort, SVG shape plus word |
| Dialogs | Modal dialog, side drawer, polite status | Native top layer, inert page, Escape focus return |
| Marketing | Image slots, hero stages, showcases, pricing, forms | Inward gaze, localized scrims, zero SVG charts, live states |

Wire the eight accessibility and interaction details static mockups routinely break:

- Gate hover lifts inside fine-pointer media queries and settle active presses quickly in 45ms to 110ms.
- Separate native disabled controls skipped by Tab, focusable ARIA-disabled buttons needing prerequisite hints, and copyable readonly inputs.
- Validate fresh inputs on blur or submit, switch invalid fields to live input clearing, and list the error ID ahead of the hint ID in ARIA descriptions.
- Keep one primary action per view and open the main modal dialog over a dimmed dark backdrop. Cap polite status notices at one item with zero boot toasts, and hold 1px transparent borders for forced-colors mode:

```html
<div class="l-cluster">
  <button type="button" class="ds-btn" data-theme-toggle aria-pressed="false">Dark</button>
  <button type="button" class="ds-btn" data-density-toggle aria-pressed="false">Compact view</button>
  <button type="button" class="ds-btn ds-btn-primary" data-open-modal="#invite-dialog">Invite teammate</button>
  <button type="button" class="ds-btn" data-open-drawer="#detail-drawer">View transfer</button>
  <button type="button" class="ds-btn ds-btn-danger">Remove access</button>
  <button type="button" class="ds-btn" data-trigger-toast="Changes saved">Save changes</button>
</div>
<div role="status" aria-live="polite" class="ds-polite-bar" hidden></div>
```

```css
.l-stack { display: flex; flex-direction: column; align-items: stretch; gap: var(--stack-gap); }
.l-stack > .ds-btn { align-self: flex-start; }
.l-cluster { display: flex; flex-wrap: wrap; align-items: center; gap: 0.625rem; }

.ds-btn {
  appearance: none; display: inline-grid; align-items: center; justify-items: center;
  min-block-size: 2.5rem; padding-inline: 1.05rem; border: 1px solid transparent;
  border-radius: var(--radius-control); font: 550 0.875rem/1.15 var(--font-ui); cursor: pointer;
}
.ds-btn > * { grid-area: 1 / 1; }
.ds-btn:not([data-loading="true"]) .ds-btn-spinner { display: none; }
.ds-btn-primary {
  background: var(--primary-fill); color: var(--primary-ink);
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.16), 0 1px 2px oklch(0 0 0 / 0.12);
}
.ds-btn:not(.ds-btn-primary):not(.ds-btn-danger) { background: var(--surface-raised); color: var(--ink-primary); border-color: var(--border-control); }
/* Quiet destructive rest posture; crimson enters only on hover, active, or confirm */
.ds-btn-danger {
  background: transparent; color: var(--ink-secondary); border-color: var(--border-hairline);
}
@media (hover: hover) and (pointer: fine) {
  .ds-btn-danger:hover:not(:disabled) {
    color: var(--signal-critical);
    border-color: color-mix(in oklch, var(--signal-critical) 45%, transparent);
    background: color-mix(in oklch, var(--signal-critical) 8%, var(--surface-raised));
  }
}

.ds-select, input[type="checkbox"], input[type="radio"], [role="switch"], .ds-range {
  appearance: none; -webkit-appearance: none;
}
.ds-select-wrap { position: relative; display: inline-grid; align-items: center; }
.ds-select {
  min-block-size: 2.5rem; padding: 0.5rem 2.25rem 0.5rem 0.8rem;
  background: var(--surface-raised); color: var(--ink-primary);
  border: 1px solid var(--border-control); border-radius: var(--radius-control);
}
.ds-select-chevron { position: absolute; inset-inline-end: 0.75rem; pointer-events: none; }
.ds-range { block-size: 1.5rem; background: transparent; cursor: pointer; }
.ds-range::-webkit-slider-runnable-track {
  block-size: 0.375rem; border-radius: 999px; background: var(--surface-sunken);
  border: 1px solid var(--border-control);
}
.ds-range::-webkit-slider-thumb {
  appearance: none; inline-size: 1.125rem; block-size: 1.125rem; margin-block-start: -0.42rem;
  border-radius: 50%; background: var(--primary-fill); border: 2px solid var(--surface-raised);
}

@media (forced-colors: active) {
  .ds-btn-primary, input:checked, [role="switch"][aria-checked="true"], [role="tab"][aria-selected="true"] {
    background: Highlight; color: HighlightText; border: 1px solid Highlight;
  }
  .ds-btn, .ds-input, .ds-select, input[type="checkbox"], input[type="radio"], [role="switch"], dialog {
    border: 1px solid ButtonText;
  }
}
```

## Step 4 stage specimens workspaces and marketing component docs

Write every label from the person's side of the screen in plain active verbs and sentence case without repeating filler adjectives like calm or quiet. Favor everyday words like Invite teammate, Send transfer, Billing email, and Save changes, keeping trigger and confirmation verbs matched. Never ship self-congratulatory material taglines, marketing slogan heroes on workspaces, or developer buttons like "Test error" and "Check validation".

Separate marketing component reference guides and live app workspaces into distinct pages sharing one stylesheet instead of stacking endless single-page scrolls. Give every surface room to prove authentic craft:

1. Hold top navigation to one unwrapped row of at most five or six links, tucking meta portfolio links into the footer. Give the theme toggle a visible border in both themes and flip its label cleanly between Dark and Light.
2. Organize honest catalog sections (Buttons, Text fields, Selection, Navigation, Tables, Dialogs) in a layout rhythm native to the brand rather than repeating identical left-rail blurbs. Fit a compact spec grid, clinical cards, numbered figure plates, a hardware bench, or stacked service patterns inside spacious 2rem to 3rem pads.
3. Open the assembled workspace straight on the real product task built 100% from your tokens, avoiding marketing heroes, four boxed KPI cards, or cramped control bars. Keep top orientation compact enough that both the focal domain graphic and the first four to six working rows share the initial 900px desktop viewport.
4. Anchor that screen around one crafted domain graphic suited to the job, such as a cash-balance curve, clinical range band, channel mixer, color study, or transfer form.
5. Hold tables to four to six airy columns with right-aligned tabular figures, friendly dates (4m ago, Nov 5), two-line titles, and SVG-shape status text.
6. Drive search, filters, sorting, an empty Reset filters state, a detail drawer, and one modal dialog workflow from one live offline state store.
7. Document marketing components on a sibling reference page following [marketing-components.md](references/marketing-components.md), opening every chapter with plain usage notes and zero SVG charts. Marketing pages persuade through typography, whitespace, and photography; keep one unobtrusive state-tab row outside each frame without stacking toggle bars underneath.
8. Keep heroes to one headline, one short supporting paragraph, one primary action, and at most one secondary text link. Never embed sliders, stepper buttons, multi-input calculators, or filter toolbars inside a hero or over a background-image photograph.
9. Frame photographs in standard 16:9, 4:3, and 3:4 slots with explicit width and height, external captions, loading skeletons, and missing-image fallbacks. Orient portrait gazes and hero subjects inward toward headlines and calls to action, never looking outward off the viewport edge.
10. Declare an opaque fallback color and localized OKLCH scrim behind background-image text so at least 60% of each photo keeps natural luminance. Keep museum ledgers, editorial financial heroes, and single-plan memberships slider-free, adding a standalone lookup only for genuine permit or band checks.

## Step 5 harden offline fonts null origins shortcuts and reflow

Ensure every interactive control and font renders flawlessly offline and inside strict sandboxed frames where window origin equals null:

- Declare font-face rules strictly for verified relative WOFF2 assets or embedded data URIs, omitting crossorigin attributes on all same-site stylesheet, script, and media tags.
- Ship JavaScript exclusively via inline scripts or classic deferred script tags without module scripts, import maps, or local fetch calls that fail under null origins.
- Guard localStorage, sessionStorage, history, and clipboard calls inside safe try-catch helpers backed by an in-memory Map so sandboxed security errors never break toggles:

```js
const memPrefs = new Map();
function savePref(k, v) {
  memPrefs.set(k, v);
  try { window.localStorage.setItem(k, v); } catch (_e) {}
}

window.addEventListener("keydown", (e) => {
  if (!state.shortcutsOn || e.metaKey || e.ctrlKey || e.altKey || e.isComposing || e.repeat) return;
  if (e.target.closest('input, textarea, select, button, a[href], [contenteditable="true"], [role="combobox"], [role="listbox"], [role="menu"], [role="slider"], [role="tab"]')) return;
  if (document.querySelector('dialog[open], [aria-modal="true"]')) return;
  // Run optional toggleable single-key workspace shortcuts here (WCAG SC 2.1.4)
});
```

- Lock document scroll cleanly while modal dialogs stay open; never set root stable scrollbar gutters that leave a 15px to 22px dead strip clipping full-bleed headers. Clip horizontal bleed, set a 4.5rem section scroll margin, match table scroll padding to sticky headers, and align multi-line checkbox and radio rows to flex-start.
- Reflow cleanly across 1440px, 1024px, 768px, 390px, and 320px widths plus 200% text zoom using zero minimum inline size on grid children. Stretch stacked mobile buttons below 520px, give coarse pointers 44px hit boxes, and settle spatial motion into 100ms fades under reduced motion:

```css
/* Avoid root scrollbar-gutter: stable — its 15px–22px dead strip clips full-bleed headers */
html:has(dialog[open]) { overflow: hidden; }
dialog[open] { overscroll-behavior: contain; }
.page-shell { overflow-x: clip; }
section[id] { scroll-margin-top: 4.5rem; }
.ds-check-row { display: flex; align-items: flex-start; gap: 0.625rem; }
.ds-check-row > input { flex-shrink: 0; margin-block-start: 0.18em; }
@media (any-pointer: coarse) {
  .ds-btn, .ds-icon-btn, .ds-input, .ds-select { min-block-size: 44px; min-inline-size: 44px; }
}
@media (max-width: 520px) {
  .l-cluster[data-mobile-stack="true"] { flex-direction: column; align-items: stretch; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-btn, .popover-panel, dialog { transform: none !important; transition: opacity 100ms linear; }
}
```

## Step 6 verify mechanics and critique screenshots with taste

Serve the built page under strict opaque-origin sandbox CSP headers and run deterministic headless Playwright checks followed by an honest art-director screenshot critique:

```text
Content-Security-Policy: sandbox allow-scripts allow-forms allow-popups
Viewports: 1440x900, 1024x768, 768x1024, 390x844, 320x640 (plus 200% text zoom)
```

1. Runtime and fonts: confirm null window origin, zero console or page errors, inline SVG icons, and zero DejaVu Sans fallbacks.
2. Reflow sweep: confirm zero horizontal overflow or clipped labels from 1440px down to 320px and 200% zoom.
3. Anti-slop and anti-cosplay scan: confirm one unwrapped top bar, zero thick left borders, and zero status dots or status pills. Verify zero stretched 380px-plus desktop buttons, zero prose figures in monospace, monospace below 38% of leaf text, and zero four-deep border prisons.
4. Token and contrast check: confirm calibrated OKLCH tokens across light and dark scopes, WCAG 2.2 AA contrast in both themes, and visible outlines under active forced colors.
5. Live state run: flip Dark and Light with aria-pressed plus density, arrow across tabs, blur an invalid field then clear it live, and sort table columns. Fire one polite notice and verify Escape closes modal dialogs cleanly to the opener without root scrollbar cliffs. On marketing guides verify chapters, single-column contents, photos, zero chart SVGs, zero stuffed hero or banner sliders, and clean optional controls.
6. Studio taste review: inspect 2x lossless PNG captures across default, toggled theme, catalog or showcase, workspace or pricing, open modal dialog, and 390px mobile views. Remove one extra border or accent, check inward portrait gaze, confirm focal graphics fit 900px height, and verify 35% to 45% open ground.

## Self check before finishing

- Would a discerning studio client remember one tasteful visual idea rather than generic SaaS cards, unrequested beige-terracotta defaults, or submarine reactor cosplay?
- Does 35% to 45% of every viewport stay open ground, grouped by proximity and brand-native specimen rhythm rather than nested 1px grey border prisons?
- Does one primary action hold clear authority (such as luminous porcelain on obsidian or crisp dark ink on chalk) while destructive buttons stay subdued at rest?
- Are selects, range sliders, switches, and first-line-aligned checkboxes and radios 100% custom-styled with zero raw OS chrome and zero clumsy stretched desktop buttons?
- Is all copy plain, human, and free of marketese buzzwords, fake star grids, monospace prose numbers, fake ISO codes, SHA hashes, test buttons, and UI instructions?
- Do marketing guides persuade through typography, whitespace, and inward-gazing photos while keeping heroes, photo banners, and ledgers free of sliders, steppers, and stacked toggle bars?
- Do both light and dark themes, forced colors, roving tabs, blur-late validation, workspace tables, and any present dialogs or billing switches pass cleanly under null origin?
