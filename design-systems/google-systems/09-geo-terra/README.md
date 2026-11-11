# 09. Google Maps & Geo Terra Design System (`geo` v27.7.1 · Terra)

- **Carbon Design System ID**: `designSystems/78d941903d3ad98a` (`Version 27.7.1` — `Geo Terra`, includes `tokens`, `tokens-dark`, and `tokens-aqua`)
- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/geo/versions/v27_7_1/sass_css_vars/` (`_geo-ref-palette.scss`, `_geo-sys-color.scss`, `_geo-sys-navigation-color.scss`, `_geo-comp-search-box.scss`, `_geo-comp-filter-chip.scss`, `_geo-comp-bottom-sheet.scss`, `_geo-comp-info-callout.scss`)
  - `//depot/google3/maps/`
- **Internal Documentation**: go/geo-design-system · go/maps-ux
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**Geo Terra (`ux/tokens/design_systems/geo`)** is Google Maps' specialized cartographic overlay and spatial-intelligence design system. Unlike rectangular SaaS shells that trap maps inside small boxes, Geo Terra treats the **100vw × 100vh geospatial canvas as the primary surface** and floats high-contrast, tactile UI controls over it:

1. **Full-Bleed Cartographic Stage + Floating Omnibox & Layer Chips**: Top-left floating `_geo-comp-search-box` pill (`48px` height, `--geo-elevation-floating`) followed by horizontal scrollable `_geo-comp-filter-chip` map layer toggles (`Substations`, `Flood Zones`, `Fiber`, `Elevation`).
2. **Desktop Floating Dossier → Mobile Snap-Point Bottom Sheet (`_geo-comp-bottom-sheet`)**: On Desktop (`1440×900`), a `396px` floating left dossier card inspects parcel/corridor telemetry without obscuring the right 70% of the map; on Mobile (`390×844`), the exact same DOM node docks cleanly as a `20px`-top-rounded **Bottom Sheet** with a drag handle below an unobstructed upper map stage!
3. **Built-In Default + Aqua (`color-theme--aqua`) + Night-Nav Palettes**: Ships Google Blue `#0B57D0`, Viable Parcel Green `#146C2E`, Caution Traffic/Buffer Ochre `#B26C00`, Exclusion Red `#DC362E`, and an official **Aqua theme** (`#006876` / `#75D4E6`) (`0% purple`).

---

## 2. Verbatim Google3 Token Reference (`v27_7_1/sass_css_vars`)

| CSS Custom Property | Geo Terra Source Token | Light Hex | Dark Night-Nav | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--geo-sys-color--surface` | `neutral100 / tint12` | `#FFFFFF` | `#1E1F20` | Floating search box, parcel card & bottom sheet |
| `--geo-sys-color--surface-container` | `neutral-tint96 / surface2` | `#F0F4F9` | `#2D2F33` | Stat tiles & segmented tabs inside sheet |
| `--geo-sys-color--surface-container-bold` | `surface-container-bold` | `#D7E4EF` | `#1C2B42` | Selected parcel / route highlight card |
| `--geo-sys-color--primary` | `primary40 / primary70` | `#0B57D0` | `#7CACF8` | Active route polyline, selected pin & CTA |
| `--geo-sys-color--aqua-accent` | `tokens-aqua primary40 / 80` | `#006876` | `#75D4E6` | Hydrological conveyor & microgrid boundary |
| `--geo-sys-color--positive` | `tertiary40 / tertiary80` | `#146C2E` | `#6DD58C` | Viable parcel (`Pass`), nominal flow |
| `--geo-sys-color--caution` | `yellow50 / yellow80` | `#B26C00` | `#FFBB29` | Wetland buffer / ISO queue caution |
| `--geo-sys-color--negative` | `red50 / red80` | `#DC362E` | `#F2B8B5` | Flood zone exclusion / outage pin |

---

## 3. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **Geo Terra** whenever a prompt's hero state is map-centric, parcel-screening, fleet-routing, or radar-triangulating:
- **`#02` Data Center GIS Site Screener & 100-Pt Scoring Platform (`Block 1 · slot-2`)**: Floating PJM/ERCOT/Canary territory selector, vector substation/flood/setback layers, and Desktop left dossier → Mobile snap-point bottom sheet.
- **`#01` Jordan Water Sector Operational Risk & GIS (`Block 1 · slot-1`)**: Night-Nav + Aqua (`#75D4E6`) Disi-to-Amman conveyor map with watershed hazard contours and elevation profile drawer.
- **`#15` Rota do Kunta Multi-Modal Fleet Dispatch & POD**, **`#35` Flagit Property Map**, & **`#37` Crowdsourced Live RF Radar Triangulation Map**.
