# 13. Google Travel Design System (Flights, Hotels & Trips — travel)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/travel/versions/v6_1/sass/`
  - `//depot/google3/ux/tokens/design_systems/travel/versions/v6_1/mss_vars/`
  - `//depot/google3/ux/tokens/design_systems/travel/sass_vars_config.textproto`
- **Carbon Design System**: `designSystems/3cc7d1c3ea79f855` · version `6.1.7`
- **Internal Documentation**: go/carbon-service-docs · go/carbon-service-code-gen-mwtc
- **Frameworks**: Wiz / Closure (google.com/travel), Material Sass (MSS vars)
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!NOTE]
> Values in `tokens.css` are copied from the generated token files above. Any value not present in the google3 output (usually some dark-mode roles or shape tokens) is marked `/* inferred */`.

---

## 1. Visual & Structural DNA

**Google Travel / Flights (`travel` v6.1.7)** — Dual (Light #FFFFFF + Legacy-Desktop Dark #202124 with 5 surface levels); Comparison-Dense Results (56-72px itinerary rows, sticky search form).

1. **Classic GM2 Blue on Pure White**: Travel stays on the Google Material 2 palette: `primary` `#1A73E8`, `on-surface-emphasis` `#202124`, `on-surface-de-emphasis` `#70757A`, `divider-secondary` `#DADCE0`, with a `#F1F3F4` `tertiary` fill for inputs and toggle groups.
2. **Price-Semantic Highlights**: `surface-highlight-positive` `#E6F4EA` + `on-surface-positive` `#188038` mark low prices; `surface-highlight-warning` `#FEF7E0` + `on-surface-neutral` `#E37400` mark typical/high; `surface-highlight-negative` `#FCE8E6` flags disruptions.
3. **Five-Level Dark Elevation**: The legacy-desktop dark mode expresses depth with `surface-level1` `#2A2B2E` → `surface-level5` `#3C3D40` over `#202124`, rather than shadows.

**Core palette**: `surface_light` `#FFFFFF` · `tertiary_fill` `#F1F3F4` · `surface_dark` `#202124` · `primary` `#1A73E8` · `link` `#1558D6` · `positive_low_price` `#188038` · `neutral_amber` `#E37400` · `negative` `#D93025`

**Type**: `Google Sans`, `Google Sans Display`, `Roboto / Helvetica Neue (plain)` · **Token prefix**: `--travel-sys-color-*`

---

## 2. Token Reference (`6.1.7`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--travel-sys-color-surface` | `travel.sys.color.surface` | `#FFFFFF` | `#202124 (grey-950, inferred hex)` | Results canvas |
| `--travel-sys-color-tertiary` | `travel.sys.color.tertiary` | `#F1F3F4` | `#303134 (inferred)` | Input & segmented fills |
| `--travel-sys-color-primary` | `travel.sys.color.primary` | `#1A73E8` | `#8AB4F8` | Search button & selected |
| `--travel-sys-color-on-surface-emphasis` | `travel.sys.color.on-surface-emphasis` | `#202124` | `#E8EAED` | Prices & times |
| `--travel-sys-color-on-surface-de-emphasis` | `travel.sys.color.on-surface-de-emphasis` | `#70757A` | `#9AA0A6` | Airline, stops, CO2e |
| `--travel-sys-color-on-surface-positive` | `travel.sys.color.on-surface-positive` | `#188038` | `#81C995` | Low price / deal |
| `--travel-sys-color-on-surface-neutral` | `travel.sys.color.on-surface-neutral` | `#E37400` | `#FDD663` | Typical price / caution |
| `--travel-sys-color-surface-highlight-positive` | `travel.sys.color.surface-highlight-positive` | `#E6F4EA` | `green-300 @ 24%` | Cheapest-date cell |

---

## 3. Signature Components

- Sticky Round-Trip Search Form (origin ⇄ destination, dates, travellers)
- Price-Insight Banner with Low/Typical/High Price Graph
- Best Flights Itinerary Rows (airline, duration, stops, CO2e, price)
- Date-Grid Price Calendar with Positive-Highlight Cheapest Cells

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#35` property / marketplace search** and **`#33` booking flows**: sticky multi-field search form + comparison result rows.
- **`#15` logistics / routing** and **`#37` itinerary timelines**: duration bars, stops and price-insight graphs.
- Prefer `09-geo-terra` when the map is the primary surface; Travel is list-first.

Recommended archetypes: `#15`, `#33`, `#35`, `#37`
