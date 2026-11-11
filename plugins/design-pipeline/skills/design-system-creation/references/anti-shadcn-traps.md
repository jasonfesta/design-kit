# Anti-slop and anti-cosplay taste repairs

Mediocre AI design systems fail at two opposite extremes: soft purple SaaS template soup on one side, and joyless submarine-reactor precision theater on the other. Use this diagnostic guide to catch both failure poles early and restore genuine studio taste, proportion, and technical reliability.

## Contents

1. [Refusing generic SaaS tropes and unrequested AI reflexes](#refusing-generic-saas-tropes-and-unrequested-ai-reflexes)
2. [Cutting cosplay rigor and precision theater](#cutting-cosplay-rigor-and-precision-theater)
3. [Open whitespace over nested border prisons](#open-whitespace-over-nested-border-prisons)
4. [Intrinsic controls and zero raw OS widget leaks](#intrinsic-controls-and-zero-raw-os-widget-leaks)
5. [Calm status cues without pill confetti or left bars](#calm-status-cues-without-pill-confetti-or-left-bars)
6. [Stopping marketing-component slop charts and outward gaze](#stopping-marketing-component-slop-charts-and-outward-gaze)
7. [Cascade layers null-origin safety and clean reflow](#cascade-layers-null-origin-safety-and-clean-reflow)
8. [Studio taste and runtime verification matrix](#studio-taste-and-runtime-verification-matrix)

## Refusing generic SaaS tropes and unrequested AI reflexes

Without clear aesthetic discipline, model outputs slide straight into familiar web templates or fashionable AI defaults regardless of the human brief:

| Template tell | Why it fails | Studio repair |
| :--- | :--- | :--- |
| Unchosen Inter plus indigo glow | Signals unedited corpus median | Pick subject-grounded display and UI faces |
| Row of four boxed KPI cards | Crowds the top with repetitive chrome | Lead with one calm focal balance or chart |
| Unprompted `#F4F1EA` terracotta | Overused editorial AI reflex | Derive fresh brand OKLCH ground from brief |
| Pitch-black plus neon cyan | Harsh garish contrast vibration | Use tinted obsidian plus porcelain primary |
| Zero-radius newspaper cages | Turns warm tools into grim forms | Allow generous spacing and fitting radii |
| Self-describing material tagline | Sounds generated and contradicts dark mode | Open directly on the real user task |
| Marketing hero inside workspace | Pushes working rows below 900px fold | Fit focal graphic plus 4–6 rows visible |
| Raw hex or `dark:` scatter | Breaks systematic token theming | Route every color through semantic tokens |

Honor the user's explicit words whenever a brief genuinely asks for warm cream paper, sharp architectural corners, or high-contrast dark neon. When aesthetics stay open, pick fresh type pairings and brand-tinted palettes from the subject's materials, applying Chanel's test to cut one competing accent. Never greet product users with self-congratulatory copy like "Sunlit porcelain surfaces and editorial balances" or lean repeatedly on filler words like calm and quiet. Strip visible developer triggers such as "Test error" and "Check validation" from every product screen.

## Cutting cosplay rigor and precision theater

Trying too hard to look technical produces an equally telltale failure where ordinary tools masquerade as nuclear submarine consoles. Strip every trace of precision theater out of your copy, layout, and graphics:

| Cosplay symptom | Honest root error | Tasteful alternative |
| :--- | :--- | :--- |
| Fake `ISO` or `IEC` codes | Mimicking engineering authority | Plain words people actually say at work |
| Gratuitous SHA and UTC spam | Invented machine telemetry | Friendly dates like `4m ago` or `Nov 5` |
| Decorative ruler tick marks | Measuring nothing on screen | Clean open margins and aligned figures |
| CSS corner screws and `01 //` | Cartoon industrial ornament | Quiet tonal elevation and plain headings |
| Stick-figure SVG schematics | Clipart pretending to be art | One smooth data curve or color study |
| Walls of `11px` caps monospace | Uniform submarine shout | Readable sentence-case UI sans hierarchy |
| Monospace prices and dosages | Jarring spacing gaps and precision theater | UI sans or serif `tabular-nums` |
| Pompous catalog section names | Theater over usability | Honest names like `Buttons` and `Dialogs` |

Write every label, button, error message, and empty state from the user's side of the screen. People invite a teammate, send a transfer, update a billing email, or check resting heart rate; nobody wakes up wanting to actuate a solenoid bus trigger. Set prices, metrics, weights, dosages, and dates in your UI sans or editorial serif using tabular lining numerals. Reserve monospace strictly for developer commit IDs, code diffs, and raw machine tokens so prose never breaks into awkward fixed-width gaps.

## Open whitespace over nested border prisons

Two layout mistakes ruin otherwise well-proportioned components as soon as a page comes together.

First, wrapping bordered stat tiles inside bordered sub-panels inside bordered section cards inside a bordered page frame builds a four-deep grey prison cage. Leave 35% to 45% of every viewport calm, space major sections 2rem to 5rem apart, and seat specimens on airy 2rem to 3rem pads. Reach for borders or hue-tinted two-layer shadows only when proximity and subtle surface steps are not enough.

Second, baking outer margins onto reusable buttons, inputs, or banners double-counts gaps inside flex and grid containers. Strip external margins off all leaf components so dedicated Stack, Cluster, and Split containers govern spacing cleanly:

```css
.ds-btn, .ds-field, .ds-input, .ds-select, .ds-banner, .surface-card {
  margin: 0;
}

.page-sections {
  display: flex;
  flex-direction: column;
  gap: clamp(2.5rem, 5vw, 4.5rem);
}

.l-stack {
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap, 1.25rem);
}

.l-stack > .ds-btn {
  align-self: flex-start;
}

.l-cluster {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
}
```

## Intrinsic controls and zero raw OS widget leaks

Nothing breaks a bespoke system faster than a 500px stretched Save button beside an unstyled desktop dropdown arrow and a raw blue browser slider.

Check three control-craft failures on every desktop and mobile screen:

- Clumsy stretched desktop buttons happen whenever a short action button sits directly inside a default grid or stretch-aligned flex column and balloons past 380px wide. Size action buttons intrinsically with inline-flex or inline-grid and start alignment on desktop, stretching stacked buttons cleanly to full column width only below 520px mobile breakpoints.
- Raw browser select arrows, range sliders, and checkboxes happen whenever appearance resets only cover text inputs. Reset native appearance across selects, sliders, checkboxes, radios, and switches explicitly, pairing an inline SVG select chevron with custom WebKit and Firefox slider rails. Align multi-line checkbox and radio rows to flex-start so every box or circle stays anchored cleanly to the first text line.
- Garish red block buttons shouting beside neon primary triggers wreck dark and light toolbars alike. Give dark obsidian screens a luminous porcelain primary cap with dark ink. Keep destructive buttons muted ink or calm outline at rest until hovered or confirmed.

## Calm status cues without pill confetti or left bars

Soft generous radii on cards (8px to 14px), inputs, dialogs, and buttons are completely welcome whenever they fit your brand posture. What ruins data tables and dashboards is scattering saturated capsule status tags, tiny colored circles, and heavy left-border callouts across dozens of rows:

- Ban non-interactive status pill lozenges with capsule rounding carrying status words across table rows and cards. Legitimate interactive buttons, links, inputs, selects, switches, slider rails, dialogs, and compact numeric count chips stay completely free to use soft or capsule geometry when appropriate.
- Ban circular 4px to 14px colored status dots on elements or pseudo-elements because they fail color-blind readers and vanish in Windows Contrast Themes. Pair crisp 12px inline SVG shapes (check, triangle, diamond, dash) with plain sentence-case words instead.
- Ban asymmetric thick left borders of 3px or wider on callout banners and cards. Frame inline notices instead with a uniform 1px border, soft surface tint, and leading SVG icon.

## Stopping marketing-component slop charts and outward gaze

Marketing and imagery guides fail whenever a design system pretends to be one standalone promotional brochure or fills components with dashboard clipart. Document reusable marketing components on a dedicated sibling reference page sharing your OKLCH stylesheet, explaining plain usage before rendering live multi-state variants:

| Marketing tell | Why it fails | Studio repair |
| :--- | :--- | :--- |
| Standalone promo brochure | Hides usage limits and failure states | Describe pattern, explain use, show live states |
| Synthetic SVG line or bar charts | Looks like cold invented dashboard clipart | Real photography, studio renders, typographic figures |
| Sliders stuffed in heroes or photos | Turns editorial pages into noisy gimmicks | One headline, short lead, and primary action |
| Stacked doc tabs and inner toggles | Blurs doc chrome into component UI | One unobtrusive state tab row outside frame |
| Portrait gazing off page edge | Pulls viewer eyes away from headline and CTA | Orient gaze inward toward copy or camera |
| Flat full-frame black photo wash | Turns daylight, skin, and metal muddy | Opaque fallback plus localized OKLCH scrim |
| `--token` or ISO spam in prose | Cosplay theater instead of clear guidance | Plain words on fit, measure, and pitfalls |
| Boilerplate buzzwords and `delve` | Signals unedited machine marketing filler | Concrete present-tense mechanism claim |
| `★★★★★` avatars or `Acme` logos | Fabricated social proof breaks credibility | Inward `3:4` portrait plus scoped human quote |
| SaaS seat cards everywhere | Absurd on banking, hardware, museums, care | Tariff table, buy-box kit, or visit ledger |

Apply six strict craft rules across every marketing component chapter:

- Open every chapter with a plain component overview and usage guidance before showing rest, loading, validation error, busy, confirmed, and fallback states behind one outer tab row.
- Refuse control stuffing: keep heroes to one headline, one short paragraph, one primary action, and one optional text link, banning sliders and steppers over photography.
- Keep museum admission ledgers, editorial banking heroes, and single-plan clinic memberships slider-free; add a standalone lookup only when domains genuinely check council permit bands before applying.
- Orient human gaze, head turns, and angled hardware inward toward adjacent headlines, quotes, and actions. Place captions below frames, set opaque fallbacks behind background stages, and never dim photos in dark mode.
- Strip hype verbs including supercharge, seamless, empower, unlock, synergy, elevate, next-gen, revolutionary, world-class, best-in-class, AI-powered, game-changer, turnkey, and delve. Cut negative parallelism like it is not X, it is Y alongside loud discount pills.
- Express cadence savings in concrete currency, hold fee and comparison tables to four columns without fake sort carets, and cap conversion forms at two static-labelled fields.

## Cascade layers null-origin safety and clean reflow

Static preview hosts and sandboxes often enforce strict Content Security Policy headers locking window origin to null and blocking CORS, modules, and browser storage:

- Open your stylesheet with explicit cascade layers ordering reset, tokens, base, components, layout, and utilities. Promote modal dialogs via native showModal calls and dialog scroll locks, avoiding root stable scrollbar gutters whose 15px to 22px right strip clips full-bleed headers.
- Load verified relative WOFF2 files or data URIs without crossorigin attributes on same-site tags. Close font stacks with non-DejaVu fallbacks and activate geometric text precision and normal kerning.
- Emit classic inline or deferred scripts exclusively without ES modules, import maps, or local fetch calls. Wrap storage, history, and clipboard access inside try-catch helpers backed by an in-memory Map.
- Strip UI instruction prose (like Click tabs to switch) and process-commentary headings from published pages. Keep one unwrapped top bar with at most six links, and set zero minimum inline size on grid children for clean 320px reflow.

## Studio taste and runtime verification matrix

Run automated Playwright verification under opaque-origin sandbox CSP headers alongside a direct screenshot review across all eight gates:

| Gate | Deterministic check | Frequent failure |
| :--- | :--- | :--- |
| Runtime and fonts | Null origin, zero errors, zero `DejaVu Sans` | Unguarded `localStorage` or bare `sans-serif` |
| Responsive reflow | `scrollWidth <= innerWidth` down to `320px` | Missing `min-inline-size: 0` in split panes |
| Taste geometry | Zero dots, status pills, or `3px+` left bars | Habitual SaaS badge and callout snippets |
| Anti-cosplay discipline | Zero monospace prose digits, `< 4` nested boxes | Monospace prices, submarine tags, border cages |
| Intrinsic controls | Desktop action buttons `<= 380px`, zero OS chrome | Stretched grid button or raw `<select>` |
| OKLCH and contrast | Semantic tokens pass AA in light and dark | Raw hex leaks or inverted dark text |
| Live state contracts | Tabs, sort, blur error, modal dialogs, status | Static mockup markup or lost Escape focus |
| Marketing docs | Usage notes, photos, zero charts, zero hero sliders | Promo cosplay, SVG graphs, stuffed sliders, buzzwords |
| Forced colors | Controls retain clear system borders | Missing `1px solid transparent` border floor |
