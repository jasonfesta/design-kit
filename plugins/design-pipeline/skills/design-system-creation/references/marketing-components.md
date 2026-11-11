# Marketing and imagery component documentation

A design system documents reusable components for building websites rather than pretending to be one finished promotional landing page. Publish marketing and imagery component guidance on a dedicated reference page sharing your exact OKLCH tokens, fonts, and control physics. Follow the three-part documentation rhythm established by GOV.UK, Shopify Polaris, GitHub Primer, and Apple Human Interface Guidelines across every chapter:

| Chapter part | Reader job | Failure to avoid |
| :--- | :--- | :--- |
| Component overview | Name the pattern and state what human job it solves | Pretending the page is a single promo brochure |
| Usage guidance | Explain layout fit, copy measure, imagery, contrast, and pitfalls | Dumping CSS variable names or fake standards codes |
| Live state specimens | Render variants, loading, error, fallback, and interactive states | Showing one static happy path without edge cases |

## Contents

1. [Core component documentation structure and state switching](#core-component-documentation-structure-and-state-switching)
2. [Image containers portrait gaze and fallback states](#image-containers-portrait-gaze-and-fallback-states)
3. [Hero banners and background-image text protection](#hero-banners-and-background-image-text-protection)
4. [Feature and hardware media showcases without charts](#feature-and-hardware-media-showcases-without-charts)
5. [Editorial proof and inward-gazing portraits](#editorial-proof-and-inward-gazing-portraits)
6. [Pricing tariff and configurator component states](#pricing-tariff-and-configurator-component-states)
7. [Conversion form states and restraint against control stuffing](#conversion-form-states-and-restraint-against-control-stuffing)
8. [Copy discipline navigation and verification hooks](#copy-discipline-navigation-and-verification-hooks)

## Core component documentation structure and state switching

Teams open a marketing component guide to choose the right pattern, check copy and photography limits, and inspect edge states before shipping pages. Open the reference page with a crisp single-row header of at most five links plus a bordered theme toggle flipping between Dark and Light. Place a single-column ordered Contents list near the top linking straight to every documented component chapter without manual number prefixes or multi-column grids.

Structure every component chapter as a semantic section carrying one direct heading without colons, periods, or stacked eyebrow kickers above it. Follow that heading immediately with a concise overview sentence and plain-English usage guidance before placing the live rendered component canvas:

- Describe what the component is in plain words without naming internal CSS tokens, contrast ratios, or invented engineering standard codes inside prose.
- Explain when to pick the component, ideal headline and body character counts, required image proportions, localized scrim rules, keyboard access, and when to pick something simpler.
- Separate documentation chrome visually from the rendered specimen so engineers never mistake a state switcher bar for part of the public component itself.
- Never stack multiple rows of documentation tabs and internal segmented toggles atop one another; hold specimen state switchers to one clean row outside the component frame.
- Document wide architectural components (heroes, background-image stages, showcases, and pricing layouts) behind a keyboard-roving variant tablist switching live canvas states cleanly.
- Document compact components (image frames, portrait proofs, and conversion forms) across side-by-side or toggleable state cards showing rest, focus, loading, validation error, busy, confirmed, and fallback states:

```html
<nav aria-label="Contents" class="doc-toc">
  <h2>Contents</h2>
  <ol class="doc-toc-list">
    <li><a href="#doc-images">Image and photography containers</a></li>
    <li><a href="#doc-heroes">Hero banner and background-image stage</a></li>
    <li><a href="#doc-showcase">Feature and hardware media showcase</a></li>
    <li><a href="#doc-proof">Editorial proof and customer portrait</a></li>
    <li><a href="#doc-pricing">Pricing and tariff patterns</a></li>
    <li><a href="#doc-conversion">Enquiry and conversion band</a></li>
  </ol>
</nav>

<section id="doc-heroes" class="doc-chapter l-stack" data-component-doc aria-labelledby="h-heroes">
  <h2 id="h-heroes">Hero banner and background-image stage</h2>
  <p class="doc-lead">Introduces a public service, product, or exhibition with one clear headline, supporting photography, and a single primary call to action.</p>
  <div class="doc-usage l-stack" data-usage-notes>
    <p>Use once at the top of a public start or product page. Hold headlines between six and 12 words, pair one inward-facing photograph or localized dark scrim, and drop down to the text-only variant for statutory notices or urgent announcements.</p>
  </div>

  <div class="doc-specimen-bar" role="tablist" aria-label="Hero banner states" data-state-tabs>
    <button type="button" class="ds-seg" role="tab" id="tab-hero-bg" aria-selected="true" aria-controls="pan-hero-bg" tabindex="0">Full-bleed background</button>
    <button type="button" class="ds-seg" role="tab" id="tab-hero-split" aria-selected="false" aria-controls="pan-hero-split" tabindex="-1">Editorial photo split</button>
    <button type="button" class="ds-seg" role="tab" id="tab-hero-text" aria-selected="false" aria-controls="pan-hero-text" tabindex="-1">Text-only fallback</button>
    <button type="button" class="ds-seg" role="tab" id="tab-hero-load" aria-selected="false" aria-controls="pan-hero-load" tabindex="-1">Loading skeleton</button>
  </div>
  <div role="tabpanel" id="pan-hero-bg" aria-labelledby="tab-hero-bg" data-specimen-state="background"><!-- Live stage --></div>
  <div role="tabpanel" id="pan-hero-split" aria-labelledby="tab-hero-split" data-specimen-state="split" hidden><!-- Split --></div>
  <div role="tabpanel" id="pan-hero-text" aria-labelledby="tab-hero-text" data-specimen-state="text-only" hidden><!-- Text --></div>
  <div role="tabpanel" id="pan-hero-load" aria-labelledby="tab-hero-load" data-specimen-state="loading" hidden><!-- Skeleton --></div>
</section>
```

```css
.doc-toc-list {
  columns: 1; display: flex; flex-direction: column; gap: 0.45rem;
  margin: 0; padding-inline-start: 1.35rem;
}
.doc-chapter { padding-block: clamp(2.5rem, 5vw, 4rem); border-block-start: 1px solid var(--border-hairline); }
.doc-lead, .doc-usage { max-inline-size: 66ch; }
.doc-usage { color: var(--ink-secondary); font-size: 0.9375rem; line-height: 1.6; }
.doc-specimen-bar {
  display: inline-flex; flex-wrap: wrap; gap: 0.375rem; align-self: flex-start;
  padding: 0.25rem; border-radius: var(--radius-control);
  background: var(--surface-sunken); border: 1px solid var(--border-hairline);
}
```

```js
document.querySelectorAll('[role="tablist"][data-state-tabs]').forEach((bar) => {
  const tabs = Array.from(bar.querySelectorAll('[role="tab"]'));
  function activate(nextIdx, moveFocus) {
    tabs.forEach((tab, idx) => {
      const on = idx === nextIdx;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    if (moveFocus) tabs[nextIdx].focus();
  }
  tabs.forEach((tab, idx) => {
    tab.addEventListener("click", () => activate(idx, false));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); activate((idx + 1) % tabs.length, true); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); activate((idx - 1 + tabs.length) % tabs.length, true); }
      else if (e.key === "Home") { e.preventDefault(); activate(0, true); }
      else if (e.key === "End") { e.preventDefault(); activate(tabs.length - 1, true); }
    });
  });
});
```

## Image containers portrait gaze and fallback states

Real photography, studio hardware renders, architectural rooms, and documentary portraits give public pages warmth and credibility that synthetic graphics never achieve. Standardize a compact family of aspect-ratio containers so editors drop real photography into layouts without ragged edges, layout jumps, or broken icons:

| Aspect slot | Primary subject | Composition rule |
| :--- | :--- | :--- |
| `16:9` wide | Architectural rooms and landscapes | Keep horizontal sightlines level with calm open space |
| `4:3` standard | Studio hardware and editorial still life | Light from one clean angle with crisp edge hairline |
| `3:4` or `4:5` | Documentary human portraits | Orient gaze inward toward adjacent headline or quote |
| Fallback surface | Loading or unavailable asset | Hold exact aspect box with calm neutral tone |

Enforce the inward gaze and directional composition law across every portrait, lifestyle shot, and angled product photograph in the system:

- Human gaze lines, head turns, walking paths, and angled hardware naturally pull the reader's eye wherever they point.
- Never place a portrait or hero subject looking outward off the edge of the viewport or turning their shoulder away from adjacent text.
- Seat left-column portraits facing right toward the quote or headline, or looking directly into the camera lens.
- Seat right-column hero subjects facing left toward the opening headline and primary call to action, or straight toward the viewer.
- Compose multi-person studio, clinic, or street scenes so people face one another or turn toward the center of the frame.
- Crop and select original inward-facing photographs rather than mirroring images horizontally whenever garments, signage, controls, or asymmetric details would read backward.

Engineer every image container across loaded, skeleton-loading, and missing-image fallback states with five strict optical rules:

- Declare explicit numeric width and height attributes alongside block display, 100% inline-size, explicit aspect-ratio, and object-fit cover so frames never jump during decode.
- Place captions cleanly below the image frame in calm secondary ink rather than trapping captions inside muddy overlaid bars.
- Ring every frame with a subtle 1px inner hairline using 7% black in light mode and 8% white in dark mode. Pale studio paper and night scenes then hold crisp edges.
- Never dim, tint, or invert photographs globally in dark mode with CSS brightness or invert filters; shift only the surrounding paper and ink tokens.
- Render side-by-side states for a captioned photo, a loading skeleton frozen under reduced motion, and a calm missing-image placeholder without broken browser chrome:

```html
<section id="doc-images" class="doc-chapter l-stack" data-component-doc aria-labelledby="h-images">
  <h2 id="h-images">Image and photography containers</h2>
  <p class="doc-lead">Frames architectural views, studio objects, and inward-facing portraits at fixed proportions without layout shift.</p>
  <div class="doc-usage" data-usage-notes>
    <p>Choose 16:9 for interiors, 4:3 for hardware objects, and 3:4 or 4:5 for portraits. Seat portraits so the person looks toward adjacent copy or straight into the lens, never off the viewport edge, and keep captions below the frame.</p>
  </div>
  <div class="mkt-state-grid">
    <figure class="mkt-figure l-stack" data-specimen-state="default">
      <div class="mkt-photo-frame" data-ratio="4:3">
        <img src="../images/studio-preamp.webp" alt="Four-channel brushed aluminum preamp angled left toward the controls"
             width="1200" height="900" loading="lazy" decoding="async">
      </div>
      <figcaption class="mkt-caption">Default 4:3 frame with external caption and 1px edge hairline.</figcaption>
    </figure>

    <div class="mkt-figure l-stack" data-specimen-state="loading">
      <div class="mkt-photo-frame mkt-skeleton" data-ratio="4:3" role="status" aria-label="Loading photograph"></div>
      <p class="mkt-caption">Loading state reserves exact 4:3 geometry before decode completes.</p>
    </div>

    <div class="mkt-figure l-stack" data-specimen-state="fallback">
      <div class="mkt-photo-frame mkt-img-fallback" data-ratio="4:3">
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-4.5L9 18"/>
        </svg>
        <span>Photograph unavailable</span>
      </div>
      <p class="mkt-caption">Missing-image state falls back to neutral sunken surface without broken chrome.</p>
    </div>
  </div>
</section>
```

```css
.mkt-state-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: 1.5rem; }
.mkt-figure { margin: 0; }
.mkt-photo-frame {
  position: relative; overflow: hidden; border-radius: var(--radius-card);
  background-color: var(--surface-sunken); box-shadow: inset 0 0 0 1px oklch(0 0 0 / 0.07);
}
[data-theme="dark"] .mkt-photo-frame { box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.08); }
.mkt-photo-frame[data-ratio="16:9"] { aspect-ratio: 16 / 9; }
.mkt-photo-frame[data-ratio="4:3"] { aspect-ratio: 4 / 3; }
.mkt-photo-frame[data-ratio="3:4"] { aspect-ratio: 3 / 4; }
.mkt-photo-frame > img { display: block; inline-size: 100%; block-size: 100%; object-fit: cover; filter: none; }
.mkt-caption { margin: 0; font: 400 0.8125rem/1.45 var(--font-ui); color: var(--ink-secondary); }
.mkt-img-fallback {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; color: var(--ink-secondary); font: 500 0.8125rem/1.3 var(--font-ui);
  border: 1px solid var(--border-hairline);
}
.mkt-skeleton {
  background: linear-gradient(90deg, var(--surface-sunken) 20%, var(--surface-raised) 50%, var(--surface-sunken) 80%);
  background-size: 200% 100%; animation: mkt-shimmer 1.8s ease-in-out infinite;
}
@keyframes mkt-shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
@media (prefers-reduced-motion: reduce) { .mkt-skeleton { animation: none; background: var(--surface-sunken); } }
```

## Hero banners and background-image text protection

Marketing components persuade through clear typography, generous whitespace, and photography rather than cramming dashboard controls into public pages. Keep every hero to one headline, one short supporting paragraph, one primary action, and at most one secondary text link. Place variants behind one clean specimen tablist row outside the component frame to compare background photos, splits, and text fallbacks together:

| Hero variant | Natural fit | Key structural rule |
| :--- | :--- | :--- |
| Full-bleed background stage | Architecture, hardware, studios, clinics | Opaque fallback color plus localized OKLCH scrim |
| Asymmetric editorial split | Publishing, banking, consumer tools | Right subject gazes inward toward left primary CTA |
| Centered architectural poster | Exhibitions, monographs, developer releases | Balanced display title over full-span room photo |
| Text-only announcement | Civic notices, urgent updates, docs | Clean typographic lead without decorative stock filler |

Protect overlaid text and enforce strict control restraint on every hero and full-bleed background-image stage:

- Never embed range sliders, stepper buttons, multi-input calculators, or filter toolbars inside a hero or over a background-image photograph.
- Cap any invitation card sitting over a background photograph at three total controls, such as one or two inputs plus one submit button.
- Always declare an explicit opaque fallback background-color on every background-image stage so overlaid text passes WCAG AA immediately before decode or if an image fails.
- Ban flat uniform black or grey washes across the entire frame, which crush skin tones, daylight, and metal highlights into mud.
- Place a localized multi-stop OKLCH gradient strictly behind the copy column or bottom title band so at least 60% of the photograph keeps full natural luminance.
- Set explicit focal-point coordinates on background-position and object-position so faces and key subjects remain visible and inward-facing on 390px mobile screens.
- Style calls to action over photography as crisp solid high-contrast caps rather than ghostly transparent outlines, placing one short doubt-remover line underneath.
- Provide an active forced-colors fallback collapsing the background image to solid Canvas with CanvasText ink and ButtonText or Highlight button borders:

```css
.mkt-bg-stage {
  position: relative; overflow: hidden; border-radius: var(--radius-card);
  /* Required opaque fallback guarantees AA contrast before image decode and during audits */
  background-color: oklch(0.15 0.012 250);
  background-image:
    linear-gradient(96deg, oklch(0.12 0.012 250 / 0.90) 0%, oklch(0.12 0.012 250 / 0.56) 32%, oklch(0.12 0.012 250 / 0) 56%),
    var(--stage-photo);
  background-size: cover;
  background-position: center, var(--focal-x, 70%) var(--focal-y, 36%);
  padding: clamp(2.75rem, 6vw, 5rem) clamp(1.5rem, 5vw, 3.75rem);
  box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.10);
}
@media (max-width: 720px) {
  .mkt-bg-stage {
    background-image:
      linear-gradient(0deg, oklch(0.12 0.012 250 / 0.92) 0%, oklch(0.12 0.012 250 / 0.58) 42%, oklch(0.12 0.012 250 / 0) 68%),
      var(--stage-photo);
    background-position: center, var(--focal-mobile-x, 62%) var(--focal-y, 32%);
  }
}
.mkt-bg-copy { max-inline-size: 36ch; color: oklch(0.98 0.004 90); }
.mkt-bg-copy p { color: oklch(0.90 0.006 90); }
.mkt-btn-over-photo {
  background-color: oklch(0.98 0.004 90); color: oklch(0.15 0.012 250);
  border: 1px solid transparent; font-weight: 600;
}
@media (forced-colors: active) {
  .mkt-bg-stage { background: Canvas !important; border: 1px solid ButtonText; }
  .mkt-bg-copy, .mkt-bg-copy p { color: CanvasText; }
  .mkt-btn-over-photo { background: Highlight; color: HighlightText; border: 1px solid Highlight; }
}
```

## Feature and hardware media showcases without charts

Synthetic SVG line, area, and bar charts make marketing components look like cold fabricated dashboard clipart. Visitors immediately distrust invented upward revenue curves on public pages, and two-dimensional vector wireframes cheapen physical hardware. Keep charts exclusively inside authenticated product workspaces, and document photography-led media showcases across live interactive states instead:

- Document a multi-finish studio switcher for hardware where tabs swap locked 4:3 photos (brushed silver, anodized black, rear connectors) and captions.
- Document an exhibition room or architectural plate switcher for cultural and clinical brands where roving tabs swap full-luminance interior views without cropping edge details.
- Document an asymmetric photo bento for software and finance pairing studio photography with roving CLI install tabs (npm, pnpm, curl) and zero-jump Copy feedback.
- Isolate physical finish swatches and artwork plates onto fixed OKLCH values so switching into dark mode never flips anodized black aluminum to white:

```html
<section id="doc-showcase" class="doc-chapter l-stack" data-component-doc aria-labelledby="h-showcase">
  <h2 id="h-showcase">Feature and hardware media showcase</h2>
  <p class="doc-lead">Pairs multi-angle studio or room photography with tactile finish and view controls instead of synthetic graphs.</p>
  <div class="doc-usage" data-usage-notes>
    <p>Lock all variants inside one shared aspect ratio so switching finishes never shifts surrounding copy. Never replace real product photography or interior views with SVG line charts, bar graphs, or flat vector wireframes.</p>
  </div>
  <div class="mkt-showcase-card surface-card l-stack">
    <div class="l-cluster" role="tablist" aria-label="Finish showcase states" data-state-tabs>
      <button type="button" class="ds-seg" role="tab" id="f-sil" aria-selected="true" aria-controls="p-sil" tabindex="0">Natural silver</button>
      <button type="button" class="ds-seg" role="tab" id="f-blk" aria-selected="false" aria-controls="p-blk" tabindex="-1">Anodized black</button>
      <button type="button" class="ds-seg" role="tab" id="f-rear" aria-selected="false" aria-controls="p-rear" tabindex="-1">Rear patchbay</button>
    </div>
    <figure class="mkt-figure l-stack" role="tabpanel" id="p-sil" aria-labelledby="f-sil" data-specimen-state="silver">
      <div class="mkt-photo-frame" data-ratio="16:9">
        <img src="../images/desk-silver.webp" alt="Bead-blasted silver console angled inward toward the meter bridge" width="1600" height="900" loading="lazy" decoding="async">
      </div>
      <figcaption class="mkt-caption">4mm bead-blasted aluminum faceplate with stepped rotary attenuators.</figcaption>
    </figure>
    <figure class="mkt-figure l-stack" role="tabpanel" id="p-blk" aria-labelledby="f-blk" data-specimen-state="black" hidden>
      <div class="mkt-photo-frame" data-ratio="16:9">
        <img src="../images/desk-black.webp" alt="Matte black console under warm studio bench task lighting" width="1600" height="900" loading="lazy" decoding="async">
      </div>
      <figcaption class="mkt-caption">Hard-anodized matte black chassis tuned for dim mixing rooms.</figcaption>
    </figure>
    <figure class="mkt-figure l-stack" role="tabpanel" id="p-rear" aria-labelledby="f-rear" data-specimen-state="rear" hidden>
      <div class="mkt-photo-frame" data-ratio="16:9">
        <img src="../images/desk-rear.webp" alt="Balanced XLR inputs and Neutrik locking power bay on rear panel" width="1600" height="900" loading="lazy" decoding="async">
      </div>
      <figcaption class="mkt-caption">Neutrik gold-pin connectors and recessed linear supply input.</figcaption>
    </figure>
  </div>
</section>
```

## Editorial proof and inward-gazing portraits

Invented enterprise logo strips, rows of five-star glyphs, and three-column avatar quote grids read immediately as fabricated filler. Document a quiet editorial proof component built around authentic human photography, factual specifics, and a clean text-only fallback:

- Seat a 3:4 or 4:5 portrait on the left with the person facing right toward the quote or into the camera lens. That inward posture pulls the eye straight into the proof text.
- Quote one specific workflow outcome from a named role and organization scope. Pair a secondary modal dialog trigger whenever audit methodology or trial scope needs extra context.
- Never place unattributed aggregate percentages or clinical cohort medians inside quotation marks; set factual hours, review excerpts, or cohort counts as plain unquoted facts.
- Document side-by-side or tabbed states covering Portrait with named quote, Press or statutory notice with opening hours, and Compact text-only fallback when portrait rights are unavailable:

```html
<section id="doc-proof" class="doc-chapter l-stack" data-component-doc aria-labelledby="h-proof">
  <h2 id="h-proof">Editorial proof and customer portrait</h2>
  <p class="doc-lead">Pairs an inward-gazing documentary portrait with one verifiable outcome quote or factual institution notice.</p>
  <div class="doc-usage" data-usage-notes>
    <p>Place a 3:4 left-hand portrait looking toward the right-hand quote or straight at the lens, never glancing outward off the page edge. Use the compact text-only state when verified photography is unavailable rather than dropping in stock avatars or star rows.</p>
  </div>
  <div class="mkt-proof-states l-stack">
    <figure class="surface-card mkt-proof-split" data-specimen-state="portrait-quote">
      <div class="mkt-photo-frame" data-ratio="3:4">
        <img src="../images/controller-portrait.webp" alt="Regional rail controller facing right toward the audit summary"
             width="900" height="1200" loading="lazy" decoding="async">
      </div>
      <div class="l-stack">
        <blockquote>
          <p>"Month-end settlement checks across nine subsidiaries dropped from three days to 40 minutes without adding headcount."</p>
        </blockquote>
        <figcaption class="l-cluster">
          <span>Controller, Nordic regional rail operator (nine entities)</span>
          <button type="button" class="ds-btn ds-btn-secondary" data-open-modal="#audit-dialog">Read audit scope</button>
        </figcaption>
      </div>
    </figure>

    <blockquote class="surface-card mkt-proof-compact l-stack" data-specimen-state="text-fallback">
      <p>"Weekday clinic wait times averaged 11 minutes across 1,400 autumn appointments, with same-day bloodwork posted before evening."</p>
      <footer class="mkt-caption">Text-only fallback — Medical director, Eastbrook Family Practice</footer>
    </blockquote>
  </div>
</section>
```

## Pricing tariff and configurator component states

Pasting three SaaS seat cards with a glowing Most popular badge onto banking, hardware, cultural, medical, or municipal design systems breaks credibility instantly. Document the pricing, tariff, admission, or configurator pattern native to your system's domain, showing billing cadence, selected, and disabled or custom-allocation states cleanly:

| Domain | Documented component | Documented states |
| :--- | :--- | :--- |
| B2B and team software | Audience tier cards (`Starter`, `Team`, `Enterprise`) | Monthly, annual cash saved, highlighted, custom cap |
| Banking and civic services | Four-column fee schedule or statutory tariff table | Standard band, concession band, exempt threshold |
| Physical hardware | Modular buy-box configurator beside studio photo | In-stock finish, voltage option, backorder disabled |
| Cultural institutions | Admission ledger plus patron or publication add-on | Adult, student, member free, sold-out timed slot |
| Health and clinics | Single flagship membership plus single-visit path | Annual plan, monthly plan, partner add-on |

Hold documented pricing and comparison specimens to five strict rules:

- Name software plans after buyers rather than Bronze, Silver, and Gold. Express cadence savings in concrete currency like Save $144 a year instead of percentage pills.
- Include a billing cadence switch only when a software or membership product genuinely sells two billing intervals; keep museum admission ledgers, fixed tariff tables, and single-plan memberships slider-free.
- Mark a highlighted tier with a crisp 1px control border on raised paper. Ban purple glow rings, flame icons, and 1.05x transforms that break baseline alignment.
- Document disabled, sold-out, or custom enterprise states explicitly so engineers inherit accessible contrast and clear prerequisite copy rather than improvised greyed-out hacks.
- List only the three to five capabilities that differ between tiers. Hold fee or comparison tables to four columns with right-aligned tabular numerals and zero fake sort carets:

```html
<section id="doc-pricing" class="doc-chapter l-stack" data-component-doc aria-labelledby="h-pricing">
  <h2 id="h-pricing">Pricing and tariff patterns</h2>
  <p class="doc-lead">Presents clear costs, cadence savings, highlighted choices, and unavailable allocations without casino urgency cues.</p>
  <div class="doc-usage" data-usage-notes>
    <p>State savings in plain currency rather than percentage badges, keep peer cards aligned to one top baseline, and surface clear lead-time or prerequisite notes on disabled tiers.</p>
  </div>
  <div class="l-cluster">
    <button type="button" class="ds-btn ds-btn-secondary" data-billing-toggle aria-pressed="false">Annual billing (Save $144 a year)</button>
  </div>
  <div class="mkt-tier-grid">
    <article class="surface-card l-stack" data-specimen-state="default-tier">
      <h3>Starter</h3>
      <p class="num mkt-price" data-price-monthly="$39 / mo" data-price-annual="$27 / mo">$39 / mo</p>
      <p class="mkt-caption" data-billing-note>Up to two legal entities with daily bank matching.</p>
      <button type="button" class="ds-btn ds-btn-secondary">Start Starter trial</button>
    </article>
    <article class="surface-card mkt-tier-selected l-stack" data-specimen-state="highlighted-tier">
      <h3>Team</h3>
      <p class="num mkt-price" data-price-monthly="$99 / mo" data-price-annual="$87 / mo">$99 / mo</p>
      <p class="mkt-caption" data-billing-note>Up to 10 entities, multi-currency rules, and dual sign-off.</p>
      <button type="button" class="ds-btn ds-btn-primary">Start Team trial</button>
    </article>
    <article class="surface-card l-stack" data-specimen-state="disabled-tier">
      <h3>Regulated group</h3>
      <p class="num mkt-price">Custom schedule</p>
      <p class="mkt-caption" id="reg-prereq">Requires completed regional clearing questionnaire before activation.</p>
      <button type="button" class="ds-btn ds-btn-secondary" aria-disabled="true" aria-describedby="reg-prereq">Allocation paused</button>
    </article>
  </div>
</section>
```

## Conversion form states and restraint against control stuffing

Close your component guide by documenting clean one- or two-field conversion forms across rest, error, submitting, and confirmed states without forcing gimmick calculators onto the page. Practice firm restraint against control stuffing across every domain:

- Never bolt ROI sliders, yield sliders, visit-payback sliders, or minus-and-plus steppers onto editorial banking heroes, museum admission ledgers, hardware photo banners, or single-plan clinic memberships.
- Include a standalone lookup estimator only when people genuinely check an eligibility or permit band before applying, such as selecting a council parking zone.
- Cap lead, booking, dispatch, or reservation forms at one or two static-labelled fields plus one submit action with a plain hesitation-reducer hint beneath the label.
- Render rest, validation error via aria-describedby, busy submitting, and confirmed states inline, adding an optional modal dialog only when full terms need top-layer focus:

```html
<section id="doc-conversion" class="doc-chapter l-stack" data-component-doc aria-labelledby="h-conversion">
  <h2 id="h-conversion">Enquiry and conversion band</h2>
  <p class="doc-lead">Pairs a calm background-image invitation or paper card with single-ask conversion form states.</p>
  <div class="doc-usage" data-usage-notes>
    <p>Cap public conversion forms at one or two static-labelled fields with a single submit action, never sliders or filter bars. Validate on blur or submit rather than mid-keystroke, and protect background photography with an opaque fallback color plus localized scrim.</p>
  </div>

  <div class="mkt-bg-stage" style="--stage-photo: url('../images/arch-colonnade.webp');" data-specimen-state="live-photo-cta">
    <form class="mkt-bg-copy l-stack" data-lead-form novalidate>
      <h3>Request a sandbox ledger</h3>
      <div class="ds-field">
        <label class="ds-label" for="lead-email">Work email</label>
        <p class="ds-hint" id="lead-hint">Replies in one business day. No promotional lists.</p>
        <p class="ds-error-msg" id="lead-err" hidden></p>
        <input class="ds-input" id="lead-email" name="email" type="email" autocomplete="email" required aria-describedby="lead-hint">
      </div>
      <div class="l-cluster">
        <button type="submit" class="ds-btn mkt-btn-over-photo" data-test-validate>Send sandbox link</button>
      </div>
    </form>
  </div>

  <div class="mkt-state-grid">
    <div class="surface-card l-stack" data-specimen-state="error-example">
      <label class="ds-label" for="demo-err-in">Work email (error state)</label>
      <p class="ds-error-msg" id="demo-err-msg">Enter a work email address carrying an @ domain, like alex@northline.co.</p>
      <input class="ds-input" id="demo-err-in" type="email" value="alex-at-northline" readonly aria-invalid="true" aria-describedby="demo-err-msg">
    </div>
    <div class="surface-card l-stack" data-specimen-state="submitting-confirmed">
      <p class="mkt-caption">Submitting and confirmed states</p>
      <div class="l-cluster">
        <button type="button" class="ds-btn ds-btn-primary" data-loading="true" disabled>
          <span style="visibility:hidden">Send sandbox link</span>
          <span class="ds-btn-spinner" aria-hidden="true">Sending...</span>
        </button>
      </div>
      <p role="status">Sandbox invitation sent to alex@northline.co. Check your inbox within two minutes.</p>
    </div>
  </div>
</section>
```

## Copy discipline navigation and verification hooks

Edit every component description, usage note, and rendered specimen phrase with crisp editorial restraint before running browser verification:

- Delete marketese hype words including supercharge, empower, seamless, unlock, synergy, elevate, next-gen, revolutionary, world-class, best-in-class, industry-leading, AI-powered, game-changer, turnkey, and delve. Cut negative parallelism like it is not X, it is Y.
- Strip cosplay rigor from usage notes and specimens alike. Never dump CSS variable strings in prose, brag about contrast scores, or invent fake standards codes.
- Hold top navigation to one unwrapped desktop row of at most five links plus a bordered Dark and Light toggle. Follow with a single-column ordered Contents list linking cleanly to every chapter ID.
- Reconcile every specimen amount from one shared source so fee rows, tariff bands, portrait quotes, and any supplemental disclosures agree without drift.

Wire the required documentation hooks below, adding the optional cadence, lookup, form, or modal dialog hooks only when a component genuinely calls for them:

| Verification target | Markup hook | Checked contract |
| :--- | :--- | :--- |
| Documented chapters | `section[data-component-doc]` | Five-plus chapters with clean `h2`, lead `p`, and usage notes |
| Usage guidance | `[data-usage-notes]` plus TOC `ol` | Plain guidance plus single-column Contents links |
| Multi-state coverage | `[data-state-tabs]` or `[data-specimen-state]` | Single-row roving `ArrowRight` tabs or two-plus state cards |
| Real media no charts | `img[width][height]` and CSS `url()` | Loaded photos, opaque bg fallback, zero synthetic chart SVGs |
| Control restraint | Heroes and CSS `url()` stages | Zero range sliders and under four controls per panel |
| Theme toggle | `[data-theme-toggle]` | Single-row header toggle flipping `Dark` and `Light` cleanly |
| Optional cadence | `[data-billing-toggle]` | Tested when present; skipped cleanly on fixed-price ledgers |
| Optional lookup | `[data-calc-input]` and `[data-calc-output]` | Tested on permit lookups; skipped on calm editorial pages |
| Optional dialog form | `[data-lead-form]` and `[data-open-modal]` | Verified inline `aria-invalid` and `Escape` close when present |
