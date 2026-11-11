---
name: product-design-system
description: Mint a tokens-first design system for a new product — OKLCH color scales with chroma bell curves, a strict primitive→semantic token pipeline in Tailwind v4, type/spacing/elevation scales, dark mode by variable reassignment, WCAG 2.2 AA contrast gates, and hard budgets that stop token sprawl. Run once per product; the output is that product's own system.
---

# product-design-system

## What it is

The process for deriving a complete, coherent design system for a new product and shipping it as
Tailwind v4 `@theme` tokens plus CSS custom properties — color, type, spacing, radius, elevation,
states, dark mode — with the guardrails that keep it from rotting. This skill mints the system;
`impeccable` audits and polishes what you build with it, and `frontend-design` /
`frontend-ui-engineering` cover visual intent and production UI. Use this first, once, per product.

## When to use it

Starting a product with a real commercial surface (marketing pages + app + billing) where visual
coherence and rebrandability matter. Do NOT run the full process for an internal tool or a
prototype — for those, take the flat tier below verbatim with Tailwind defaults and stop.

## Step 0 — size the system first

The single biggest failure mode is building a bigger system than the team. Small teams that mint
hundreds of tokens end up managing 300–500 unique values and routing around their own system.
Pick a tier before deriving anything:

- Flat tier (default for a small product): 6–10 semantic colors (`background`, `foreground`,
  `muted`, `muted-foreground`, `border`, `accent`/`primary`, `destructive` + a couple more),
  2–3 radii, 2–3 shadows, Tailwind's default spacing, 2–3 font families (one is fine). A budget on the
  order of 18–26 base tokens — the whole system fits on one screen of CSS. Need a lighter or
  darker variant? Use opacity modifiers (`bg-muted/70`) or `color-mix()`, not a new token.
- Ramped tier: add full 11-step scales (50–950) — but only for hues that need them, usually
  just brand + neutral. Mint a ramp when the flat tier demonstrably runs out: the third time a
  component needs an intermediate step that opacity tricks can't produce.

The research disagrees here on purpose (the practitioner and first-principles reports assume full
ramps; the contrarian report caps everything at a flat set) — the resolution is that ramps are
*earned*, not default. Everything below that only applies to the ramped tier is marked.

Rule of three, applied to everything: solve inline the first time, copy-paste the second, abstract
into the system only on the third exact occurrence. That goes for tokens, components, and
patterns. Map any new visual need onto an existing token before minting a new one.

## Step 1 — derive the dials from positioning

Positioning sets a handful of numeric dials; everything else is computed from them. Direction, not
data — pick values inside these ranges by feel, don't treat them as a lookup table:

- Chroma (how saturated the brand reads): calm/premium/editorial 0.02–0.08; balanced product
  0.10–0.18; loud/energetic 0.20–0.30. sRGB tops out around C 0.37 — stay well under.
- Type scale ratio: data-dense 1.067–1.125; expressive marketing/editorial 1.333 up to
  1.618; a general product sits between those endpoints (1.2–1.333 is our default band).
- Radius: sharp/technical 0–4px; general 6–8px; soft consumer 12–24px.
- Contrast posture: pure `#FFFFFF`/`#111111` reads brutalist/utility; warm off-white +
  off-black (e.g. L 0.97 vs L 0.15 with a whisper of brand hue) reads editorial/premium.

Write the choices and the *negative* constraints ("this brand is never neon, never pure black")
into a short positioning file next to the tokens — agents and future sessions styling the product
need the "what it is NOT" list more than the mood board.

## Step 2 — color in OKLCH

All color work happens in OKLCH (perceptually uniform: equal L steps look equal). Tailwind v4's
pipeline (LightningCSS) auto-generates sRGB fallbacks, so write OKLCH only — no manual hex
fallbacks.

Flat tier: pick the 6–10 semantic colors directly as OKLCH values, obeying the dials above and
the neutral rule below. Ramped tier, per ramp:

- Lightness ladder (tunable default, 50→950):
  0.97, 0.93, 0.88, 0.82, 0.74, 0.62, 0.52, 0.42, 0.32, 0.22, 0.15 — brand anchor at 500.
- Chroma is a bell curve, not a constant: peak at 500 (0.15–0.25 for brand hues), tapering to
  0.01–0.03 at 50 and 950. Constant chroma gamut-clips at the extremes and the browser's forced
  clip shifts hue ("muddy" tints/shades). If a value is out of gamut, reduce chroma to fit —
  never let channels clip.
- Optional hue rotation: drift hue ~15° across the ladder (tints cooler, shades warmer) —
  the difference between a generated-looking palette and a designed one.

Both tiers:

- Neutrals are never C=0. Carry the brand hue at tiny chroma — e.g. `oklch(0.97 0.005 264)`
  for a purple brand — and keep neutrals under C 0.10.
- 60-30-10: roughly 60% neutral surfaces, 30% structural (borders, muted fills), 10% accent.
  The higher your chroma dial, the more strictly this matters.
- Multi-theme trick: to offer theme variants, lock L and C and rotate only H — perceptually
  identical weight across themes with zero per-hue recalibration.

## Step 3 — token architecture (two layers)

1. Primitives live in Tailwind v4 `@theme`: raw scale values (`--color-brand-500`,
   `--radius-md`). `@theme` auto-generates the utilities.
2. Semantic aliases live OUTSIDE `@theme`, on `:root` (and reassigned under the dark
   selector): role-based names — `--color-background`, `--color-primary`,
   `--color-border` — pointing at primitives.

Markup uses **only semantic utilities** (`bg-primary`, `text-muted-foreground`) — never
`bg-blue-500`, never `text-[#4A90D9]`, never `style="..."`. Skipping the semantic layer is the
root mechanism of design-system rot: primitives leak into components, a rebrand means editing
dozens of files, developers route around the system, drift compounds.

Naming: role-based, category→role→state (`color-background-primary-hover`). Never encode the
value in the name (`color-primary-blue` breaks the first rebrand) and never name tokens after
components until a component has earned tokens (rule of three; component tokens should end up
carrying ≤10% of styling even in a mature system).

Interactive states: derive, don't mint. `color-mix()` (or relative color syntax) mixing the base
color toward the surface gives hover/active that auto-darken in light mode and auto-lighten in
dark. Pair every active state with `transform: scale(0.98)` or similar — never a color-only state
change.

## Step 4 — dark mode

Dark mode is a **variable reassignment**, never markup. Concretely:

- Define `@custom-variant dark (&:where(.dark, .dark *));` and re-declare the semantic variables
  under `.dark`. Forbid `dark:` prefixes in markup entirely — if you're writing `dark:bg-...`,
  the token layer has failed.
- Avoid CSS `light-dark()` with Tailwind v4 — LightningCSS can strip or misapply it when
  `color-scheme` is toggled from JS on non-root elements. Variable reassignment does the same job
  reliably.
- Dark mode is not inversion. Three specific failures of naive inversion: saturated brand colors
  vibrate on near-black; pastel text fails contrast on dark; drop shadows don't read as depth on
  dark. So: desaturate brand colors in dark mode (lower C, slightly higher L than the light-mode
  primary), and signal elevation with *lighter surface colors*, not bigger shadows.

## Step 5 — type

- Modular scale as the starting point: `size_n = base × ratio^n` with the ratio dial from step 1.
  But reading constraints beat ratio purity — if a heading doesn't visually balance, change it
  and let the scale be approximate.
- Measure: 45–75 characters per line, ideal ~65 (`max-w-[65ch]` / `max-w-prose`). This is
  the least-negotiable rule in typography; enforce it on every text block.
- Line height decays as size grows: from a 16px/1.5 body baseline, `LH = 1 + 8/size` — a
  48px display line lands near 1.17. Round line heights to the spacing grid to keep vertical
  rhythm.
- Weights: flat tier ships 400 + 500 only and makes hierarchy with size and color. Tension to
  respect: within a single family, heading-vs-body contrast needs a real jump — if headings and
  body share a family and size contrast is modest, jump 400 → 800+; 400 → 500 reads as a
  rendering glitch, not hierarchy.
- Pair contrasting families (serif display + sans body) or use one family — never two similar
  sans faces.
- `clamp()`-fluid sizing for display/headings only; body text stays static (fluid body breaks
  vertical rhythm).

## Step 6 — spacing, radius, elevation

- Spacing: geometric, on a 4/8px grid: 4, 8, 16, 24, 32, 48, 64, 96(, 128). Perception is
  logarithmic — linear ladders read as "no step" at the top. Flat tier: Tailwind's default scale
  already satisfies this; add nothing. Ban magic numbers (13px, 7px) — every gap resolves to a
  scale step.
- Radius: 2–3 tokens (sm/md/lg) around the radius dial, plus `full`. Focus rings 2–4px,
  offset from the curve.
- Shadows: 2–3 elevations for the flat tier, hard cap 5–6 ever. A believable shadow is
  layered (tight dark contact + soft ambient), blur grows faster than offset, opacity *decreases*
  with elevation. Never pure black — tint with the dark, desaturated brand hue, e.g.
  `oklch(0.2 0.05 H / 0.1)`. In dark mode, elevation switches to surface lightness (step 4).

## Step 7 — accessibility gates

- WCAG 2.2 AA is the compliance floor (the spec's AA thresholds: 4.5:1 body text, 3:1 large
  text and UI components). Check it at build time, not by eye.
- WCAG's formula has known false passes/fails — it passes some illegible dark-gray-on-dark-blue
  pairs and fails legible white-on-vibrant-orange. Use **APCA** as the advisory check — roughly
  Lc ≥ 75 for body text, Lc ≥ 45 for headings/large elements — via an APCA-capable tool (Atmos,
  colorjs); don't hand-roll the math.
- Define foreground/background as **token pairs** (`--color-primary` +
  `--color-primary-foreground`) so contrast is verified once per pair, not once per usage.
- Contrast checks belong in CI: a script over the token file that recomputes every declared pair
  fails the build on regression. Deterministic gates, not review-time vigilance.

## Step 8 — ship shape

- One `tokens.css`/`global.css` carries the whole pipeline: `@theme` primitives → `:root`
  semantics → `.dark` reassignment. Small enough to read in one screen (flat tier) is a feature.
- Next.js load-order trap: `@import`-ing a token file from inside the Tailwind entry CSS can fail
  silently — import `tokens.css` from the framework layer (`layout.tsx`) before the Tailwind
  entry, or keep everything in one file (preferred at flat tier).
- Interactive primitives (dialog, dropdown, combobox, table) are **never built from scratch**:
  copy in a headless/shadcn-style component and restyle it with semantic tokens only. Copied-in
  source in the repo is also what coding agents read and modify accurately, unlike a compiled
  npm component. Components dir carries zero business logic.
- Style Dictionary / DTCG JSON: a deliberate simplification against the tooling research, which
  recommends the Style Dictionary v5 pipeline even for small products — skip it for a single
  web app (the CSS file above IS the source of truth) and adopt it only when tokens must feed a
  second platform (native app, email templates, Figma sync).

## Guardrails against rot

Automate these as greps/lint in CI from day one — correct must be the path of least resistance:

- `text-[#`, `bg-[#`, any arbitrary color value in markup → fail.
- `style="` with color/spacing values → fail.
- `dark:` variant in markup → fail.
- Raw px values that don't resolve to the spacing scale → warn.
- Token count over budget (flat tier: ~26 base) → a PR conversation, not a silent merge.
- Watch the *shadow component* signal: N ad-hoc button implementations where one exists means
  people are routing around the system — fix the system's ergonomics, don't police harder.
- When a system failure ships (hardcoded color, broken dark mode), the postmortem question is
  "what automated check was missing", not "who did it".

## Run order (condensed)

1. Pick tier (flat unless proven otherwise) and set the four dials from positioning; write the
   positioning + negative-constraints file.
2. Mint colors in OKLCH (flat set, or brand+neutral ramps with the lightness ladder + chroma
   bell curve); tinted neutrals; verify gamut.
3. Lay down `@theme` primitives + `:root` semantics + `.dark` reassignment; define fg/bg pairs.
4. Type: scale ratio, measure cap, line-height decay, weight plan.
5. Spacing/radius/shadows per step 6.
6. Wire the CI greps and the contrast-pair check.
7. shadcn-style copy-in for interactive primitives, restyled with semantic tokens.
8. Build the first three screens with it, then revisit: what did you have to work around? Fix
   the system, not the screens.

## Self-check

Before calling the system done:

- Could you rebrand (new hue, new radius feel) by editing only the token file? If any markup
  would change, the semantic layer has holes.
- Is every fg/bg pair ≥ 4.5:1 (or 3:1 for large/UI), verified by a script?
- Does dark mode desaturate the brand and use surface lightness for elevation — or did you just
  flip the ladder?
- Do the CI greps actually fail on `text-[#fff]`, `style=`, and `dark:`?
- Is the token count inside budget, and can you say which tokens the last three features reused
  versus minted?
- Does a text block anywhere exceed ~75ch?
- Do neutrals carry brand hue (C > 0), and do shadows?
