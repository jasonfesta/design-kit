# Studio surface postures and optical math

Derive calm spatial proportion, perceptual OKLCH color ladders, restrained primary authority, harmonious corner geometry, domain typography, and subtle motion from the real brief in front of you. Never copy illustrative hue angles, font names, radii, or sample numbers from this reference verbatim; choose every dial specifically for your user and subject.

## Contents

1. [Six studio surface postures and default calibration](#six-studio-surface-postures-and-default-calibration)
2. [Whitespace proximity and ambient shadow discipline](#whitespace-proximity-and-ambient-shadow-discipline)
3. [Primary tonal authority and OKLCH dark physics](#primary-tonal-authority-and-oklch-dark-physics)
4. [Harmonious corner posture and concentric clusters](#harmonious-corner-posture-and-concentric-clusters)
5. [Tactile bevel conservation and quiet depth](#tactile-bevel-conservation-and-quiet-depth)
6. [Optical stem rendering and icon alignment](#optical-stem-rendering-and-icon-alignment)
7. [Intentional typography and human numeric craft](#intentional-typography-and-human-numeric-craft)
8. [Asymmetric motion timing and reduced motion](#asymmetric-motion-timing-and-reduced-motion)
9. [Calm domain centerpieces without cosplay props](#calm-domain-centerpieces-without-cosplay-props)

## Six studio surface postures and default calibration

Generic mid-grey borders and muddy black shadows flatten every product into the same dashboard template. Studio-crafted systems commit to one cohesive physical surface posture suited to the person's task and room light.

| Studio posture | Base canvas | Primary edge | Resting shadow |
| :--- | :--- | :--- | :--- |
| Obsidian precision tool | `L ~ 0.14–0.16` tinted | `1px` faint light ring | Top catchlight plus deep contact |
| Sunlit industrial chalk | `L ~ 0.94–0.96` matte | Subtle well or `1px` seam | Tight contact under raised caps |
| Daylight porcelain | `L ~ 0.98` clean ground | Hairline or open air | Soft hue-tinted two-layer shadow |
| Warm archival paper | `L ~ 0.96–0.97` cotton | Quiet horizontal ink rules | Floating overlays only |
| Tactile enamel studio | `L ~ 0.95` warm stone | Solid plinth skirt | Warm ground-tinted cast shadow |
| Stark civic utility | Crisp high-contrast sheet | `2px` solid ink frame | Zero shadow and zero gradient |

Calibrate your aesthetic choices carefully before committing:

- Current AI output leans on three reflexes: F4F1EA cream with serifs and terracotta, pitch-black with neon cyan or vermilion, and zero-radius newspaper cages everywhere. Follow the brief whenever it explicitly requests one, otherwise spend freedom on fresh, subject-grounded combinations.
- Obsidian precision tools draw from calm studio software by pairing subtle tinted dark layers with semi-transparent white hairlines and crisp top catchlights. Never paint frosted glass blur behind scrolling text because underlying hues break contrast unpredictably.
- Sunlit industrial chalk draws from classic industrial design restraint. Roughly 90% of the canvas stays quiet chalk, aluminum, and charcoal so one small functional accent sings.
- Daylight porcelain serves team software, modern banking, and calm clinical tools. Pair airy white grounds and spacious padding with soft ground-tinted shadows reserved for raised cards and menus.
- Warm archival paper and monograph surfaces let optical-size serifs, generous margins, and real color studies or photography lead without locking paragraphs inside grey boxes.

## Whitespace proximity and ambient shadow discipline

Great design systems organize comprehension through space before drawing lines. Keep 35% to 45% of every desktop and mobile viewport as calm open background so the eye lands effortlessly on the primary task.

Apply four strict spatial ordering rules before adding any border:

- Separate top-level sections with generous 2rem to 5rem vertical cadence and group related controls with 1.25rem to 2rem internal rhythm so proximity establishes hierarchy naturally.
- Order grouping cues strictly: start with calm whitespace and shared left alignment. Try a subtle 0.02 OKLCH surface shift second, and add hairlines or ambient shadows last.
- Never cage controls inside three or four concentric 1px rectangular border boxes. Russian-doll border prisons waste 40px of horizontal space and make software feel like a cramped spreadsheet.
- Tint ambient card and popover shadows with your neutral canvas hue across two gentle octaves rather than smearing pure black alpha smoke across light surfaces:

```css
/* Schematic studio elevation: replace --hue-neutral per brief */
.surface-card {
  background: var(--surface-raised);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-card);
  padding: 1.75rem;
  box-shadow:
    0 1px 2px oklch(0.20 0.015 var(--hue-neutral) / 0.04),
    0 10px 28px -8px oklch(0.20 0.02 var(--hue-neutral) / 0.08);
}

.catalog-specimen-pad {
  background: var(--surface-sunken);
  border-radius: var(--radius-card);
  padding: clamp(1.75rem, 3vw, 2.75rem);
}
```

## Primary tonal authority and OKLCH dark physics

Legacy HSL twists perceived brightness unevenly between yellow, cyan, and blue hues. Define every primitive and semantic surface in OKLCH so lightness steps read evenly across light and dark modes.

Follow Chanel's rule by removing one competing color accent before shipping:

- Spend visual boldness in one unmistakable spot per screen. When a primary button, three status badges, a chart fill, and a bright red delete button all shout at full chroma simultaneously, hierarchy collapses into noise.
- On dark obsidian workspaces below 0.22 lightness, make the single primary button crisp luminous alabaster or porcelain near 0.93 to 0.96 lightness with deep 0.14 dark ink. That quiet tonal contrast reads far sharper and higher taste than garish neon cyan clashing beside bright red buttons.
- Keep destructive buttons calm at rest using muted secondary ink or a subtle neutral border. Introduce crimson text and a tinted crimson fill only on fine-pointer hover, active press, or inside the final confirmation modal dialog.
- Taper brand chroma along a gentle bell curve peaking near mid-lightness. Drop chroma toward 0.004 to 0.02 at light and dark ends so sRGB clipping never muddies hues.

| Surface role | Light lightness | Dark lightness | Visual purpose |
| :--- | :--- | :--- | :--- |
| Sunken well or pad | `0.945–0.96` | `0.115–0.13` | Calm specimen pads and switch tracks |
| Page canvas | `0.975–0.988` | `0.145–0.17` | Open breathing workspace ground |
| Raised card or sheet | `0.995–1.00` | `0.185–0.215` | Primary focus panel or clean table |
| Floating overlay | `1.00` plus shadow | `0.23–0.27` | Menus, popovers, and modal dialogs |
| Primary action cap | `0.18–0.46` rich | `0.92–0.96` crisp | Single unmistakable main trigger |

Step dark surfaces progressively lighter as elevation rises toward an overhead lamp rather than inverting a light palette upside down. Blend dark hairlines with subtle translucent white so gentle boundaries survive across every surface tier without chalky harshness.

## Harmonious corner posture and concentric clusters

Generous calm radii feel warm and human when proportioned consistently. Surface cards at 8px to 14px with 6px to 10px controls suit modern apps, while 2px to 4px fits editorial tools and capsules fit friendly consumer triggers.

Prevent awkward corner bulges inside tight clusters like segmented switches, input addons, and compact bars. Subtract outer border width and cluster padding cleanly from the outer radius:

```css
.segmented-group {
  --r-outer: var(--radius-control);
  --b-w: 1px;
  --pad: 3px;
  display: inline-flex;
  padding: var(--pad);
  border: var(--b-w) solid var(--border-hairline);
  border-radius: var(--r-outer);
  background: var(--surface-sunken);
}

.segmented-btn {
  white-space: nowrap;
  border-radius: max(0px, calc(var(--r-outer) - var(--b-w) - var(--pad)));
}
```

When a spacious card carries 24px to 32px of open padding around inner controls, decouple the card radius around 10px to 14px. Wide padding absorbs the curve naturally without creating cartoon 36px outer bubbles. Keep peer inputs, selects, and buttons inside the same toolbar within one coherent corner family.

## Tactile bevel conservation and quiet depth

Physical buttons look convincing only when active press travel respects a stationary outer hit target and conserves vertical thickness. Translating a cap downward by 2px subtracts that exact 2px from its bottom lip and tightens its shadow into a crisp contact seam with zero sibling shift:

```css
.btn-plinth {
  --lip: 2px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  border: 1px solid color-mix(in oklch, var(--primary-fill) 82%, black);
  border-radius: var(--radius-control);
  background: linear-gradient(
    180deg,
    color-mix(in oklch, var(--primary-fill) 94%, white),
    var(--primary-fill)
  );
  color: var(--primary-ink);
  box-shadow:
    inset 0 1px 0 oklch(1 0 0 / 0.20),
    0 var(--lip) 0 color-mix(in oklch, var(--primary-fill) 78%, black),
    0 4px 10px -2px oklch(0.18 0.02 var(--hue-neutral) / 0.18);
  transition:
    transform 140ms cubic-bezier(0.18, 0.89, 0.32, 1.08),
    box-shadow 140ms ease;
}

.btn-plinth:active:not(:disabled):not([aria-disabled="true"]) {
  transform: translateY(var(--lip));
  transition-duration: 45ms;
  box-shadow:
    inset 0 1px 2px oklch(0 0 0 / 0.22),
    0 0 0 transparent,
    0 1px 2px oklch(0.18 0.02 var(--hue-neutral) / 0.16);
}
```

Seat tactile action groups directly onto calm open ground rather than locking button rows inside bordered sub-trays or faux CSS screw plates.

## Optical stem rendering and icon alignment

Geometric bounding boxes fool the human eye wherever curved corners, diagonal icons, and unhinted font stems meet inside UI controls:

- Tighten inline-start padding slightly beside leading SVG icons (such as 0.85rem start and 1.1rem end) so curved corners never push icons visually inward.
- Match 16px toolbar and table SVG icon strokes around 1.5px to 1.75px inheriting currentColor so icons harmonize with adjacent text stems without relying on missing Unicode dingbats.
- Keep Blink geometric text precision, normal kerning, antialiased smoothing, and normal letter spacing on body prose and controls. FreeType stems then stay even on Linux browsers.
- Reserve horizontal tab label width or keep consistent font weight across rest and active states so selecting a tab never nudges sibling tabs sideways.

## Intentional typography and human numeric craft

Typography carries the unmistakable voice of a design system. Pair an expressive display or optical-size serif face with a clean, legible UI sans that separates digit one, lowercase L, capital I, and zero effortlessly. Close every font stack with installed non-DejaVu fallbacks ahead of generic family keywords.

Keep monospace strictly in its natural lane:

- Reserve monospace strictly for developer commit IDs, code diffs, and raw machine tokens, never setting prose numbers, prices, weights, dosages, or dates in monospace. Fixed-width digits inside normal sentences create jarring spacing gaps and fake technical theater.
- Painting 11px uppercase monospace labels across card headers, buttons, and captions turns warm human products into submarine cosplay.
- Decay line height smoothly from 1.5 to 1.6 on comfortable body copy down to 1.06 to 1.18 on display titles. Apply balanced wrapping so headlines never orphan a single word, and let prose subheadings span full prose measure.
- Equalize paired lowercase heights with CSS font-size-adjust when mixing serif prose with sans controls.

Format numbers, money, and dates the way thoughtful consumer and professional products actually speak to people:

- Write friendly relative or calendar times such as 4m ago, Today at 14:20, or Nov 5 in everyday lists. Never dump raw ISO strings, ticking UTC clocks, or 40-character SHA digests onto non-developer screens.
- Set prices, metrics, weights, dosages, and dates in your UI sans or editorial serif with lining tabular numerals and right-aligned cells so decimals align cleanly.
- Format currency with consistent ISO 4217 minor units and render genuine negative variances with true Unicode minus U+2212 matching the visual width of a plus sign:

```js
function formatDelta(minorUnits, decimals = 2, locale = "en-US") {
  const major = minorUnits / Math.pow(10, decimals);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: "exceptZero"
  }).format(major).replace(/-/g, "\u2212");
}
```

## Asymmetric motion timing and reduced motion

Sluggish 300ms uniform transitions make controls feel sleepy, while scattered scroll animations make pages feel template-generated. Spend motion deliberately with crisp asymmetric timing:

| Interaction | Press or open | Release or close | Spatial rule |
| :--- | :--- | :--- | :--- |
| Tactile button press | `40ms–60ms` down | `140ms–175ms` up | Conserved lip or scale `0.98` |
| Fine-pointer hover | `110ms–140ms` | `100ms–120ms` | Subtle brightness or `1px` lift |
| Popover or menu | `150ms–190ms` | `100ms–130ms` | Scale `0.97` from trigger edge |
| Drawer or modal dialog | `180ms–220ms` | `120ms–150ms` | Calm fade and smooth ease-out |

Anchor menu transform origins to the trigger edge rather than ballooning up from zero scale. Under reduced-motion preferences, cancel transforms and spatial travel cleanly while preserving calm 100ms opacity crossfades and active loading spinners so state transitions still register clearly without vestibular strain.

## Calm domain centerpieces without cosplay props

Great assembled screens orient the user around one purposeful focal element. Never print either a sterile wall of grey table boxes or a fake cockpit of decorative oscilloscopes and ruler ticks. Choose one honest focal graphic grounded in the real product job. Keep top orientation compact without a slogan hero so four to six working rows share a 900px desktop viewport:

| Product family | Honest centerpiece | Craft focus |
| :--- | :--- | :--- |
| Treasury and billing | Cash balance plus smooth trend curve | Generous figure, subtle fill, clean rows |
| Health and lab care | Calm range band with soft plot line | Warm human dates, gentle safe zone |
| Studio audio and media | Clean fader lanes or frame preview | Tactile sliders, quiet dark surround |
| Editorial and archives | Genuine color-field or plate study | Balanced serif title, quiet caption |
| Team workflows | Humane step intake and clean queue | Intrinsic buttons, calm air around form |

Build every SVG curve, soft gradient fill, axis label, and interactive marker exclusively from your semantic CSS variables. Toggling light, dark, and compact modes then updates the centerpiece seamlessly alongside the entire page:

```css
.centerpiece-pad {
  background: var(--surface-raised);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-card);
  padding: clamp(1.5rem, 2.5vw, 2.25rem);
  box-shadow: var(--shadow-card);
}

.trend-line {
  fill: none;
  stroke: var(--accent-signal);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trend-area {
  fill: color-mix(in oklch, var(--accent-signal) 12%, transparent);
}
```
