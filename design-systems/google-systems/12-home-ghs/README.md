# 12. Google Home System (ghs / Home UI GHST)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/ghs/versions/latest/android_compose/color/GhsSysColorLightTokens.kt`
  - `//depot/google3/ux/tokens/design_systems/ghs/versions/latest/swiftui/Color/src/Color+GHS.swift`
  - `//depot/google3/ux/tokens/design_systems/ghs/versions/v3_962/android_compose/`
  - `//depot/google3/java/com/google/android/libraries/home/ui/implementation/ghst/`
- **Carbon Design System**: `designSystems/6bd78148a84cf216` · version `3.977`
- **Internal Documentation**: go/carbon · go/carbon-codegen-automation
- **Frameworks**: Jetpack Compose (Home UI ThemeTest), SwiftUI (Color+GHS)
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

> [!NOTE]
> Values in `tokens.css` are copied from the generated token files above. Any value not present in the google3 output (usually some dark-mode roles or shape tokens) is marked `/* inferred */`.

---

## 1. Visual & Structural DNA

**Google Home System (`ghs` v3.977)** — Dual (Light #FFFFFF / #F0F4F9 + Dark #131314 device-control); Touch-First Device Tiles (16px-28px corners, 48dp targets).

1. **Semantic Device-State Color Families**: Every device class owns a full tonal family — `heating` `#A83900` / `heating-container` `#FFDBCF`, `cooling` `#1157CE` / `#D0E4FF`, `lighting` `#745C00` / `#FFE089`, `valid` `#006C35`, `caution` `#9A4600` — each with `*-container`, `*-container-variant`, `*-dim`, `*-outline` and `*-surface` roles.
2. **Staged HVAC Rings**: Thermostat UIs ramp through `heating-stage-1` `#C74D1B` → `stage-2` `#812800` → `stage-3` `#380C00` and `cooling-stage-1` `#217CBB` → `#004A77` → `#001D33`, plus `aux-heating` and `emergency-heating`.
3. **Tile Grid on Tonal Containers**: Rooms render as a `2`→`4` column grid of `16dp`/`28dp` (`cornerLarge` / `cornerExtraLarge`) tiles on `surface-container` `#F0F4F9`; an active tile flips to its device `*-container` fill.

**Core palette**: `surface_light` `#FFFFFF` · `surface_container_light` `#F0F4F9` · `surface_dark` `#131314` · `primary` `#0B57D0` · `heating` `#A83900` · `cooling` `#1157CE` · `lighting` `#745C00` · `eco` `#1E8E3E` · `live_camera` `#8C1D18`

**Type**: `Google Sans`, `Google Sans Text`, `Roboto (FontFamily.Default fallback)` · **Token prefix**: `--ghs-sys-color-*`

---

## 2. Token Reference (`3.977`)

| CSS Custom Property | Source Token | Light | Dark | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--ghs-sys-color-surface-container` | `ghs.sys.color.surface-container` | `#F0F4F9` | `#1E1F20` | Inactive device tile |
| `--ghs-sys-color-heating` | `ghs.sys.color.heating` | `#A83900` | `#FFB59A` | Heat mode setpoint & ring |
| `--ghs-sys-color-heating-container` | `ghs.sys.color.heating-container` | `#FFDBCF` | `#802A00` | Active heating tile |
| `--ghs-sys-color-cooling` | `ghs.sys.color.cooling` | `#1157CE` | `#A1C9FF` | Cool mode setpoint & ring |
| `--ghs-sys-color-lighting-container` | `ghs.sys.color.lighting-container` | `#FFE089` | `#584400` | Light-on tile |
| `--ghs-sys-color-eco` | `ghs.sys.color.eco` | `#1E8E3E` | `#B1F2B4` | Eco leaf / savings |
| `--ghs-sys-color-live` | `ghs.sys.color.live` | `#8C1D18` | `#F2B8B5` | LIVE camera badge |
| `--ghs-sys-color-semantic-inactive-container` | `ghs.sys.color.semantic-inactive-container` | `#E3E3E3` | `#303030` | Offline / off device |

---

## 3. Signature Components

- Thermostat Dial with Heating/Cooling Stage Rings (heating-stage-1..3, cooling-stage-1..3)
- Device Control Tiles with Semantic Active Containers (lighting / cooling / default-active)
- Live Camera Event Card (live / on-live) & Activity Timeline
- Energy Eco Leaf & Energy-Programs Chips (eco, energy-green, energy-programs)

---

## 4. When to Use (WDA `#01`–`#37`)

- **`#17` / `#19` touch-first field & POS apps** and any IoT/device control panel: semantic device-state tiles with large targets.
- **`#01` / `#05` / `#37` telemetry & monitoring**: heating/cooling staged rings and live camera events map cleanly onto alarms and setpoints.
- **`#15` logistics**: the energy/eco and caution families double as status systems for fleets and sites.

Recommended archetypes: `#01`, `#05`, `#15`, `#17`, `#19`, `#37`
