---
slot: immersive
label: Immersive
mode: prompt-fallback
theme: dark
primary_font: Unbounded
secondary_font: Onest
mono_font: Red Hat Mono
bg: "#090D0B"
surface: "#111714"
surface_2: "#17201C"
text: "#ECFDF5"
text_muted: "#9CA3AF"
border: "#1F2D27"
brand: "#10B981"
accent: "#D97706"
radius_card: "16px"
radius_control: "10px"
---

# `immersive` — Default Style Transformation Prompt

> **Core Mandate**: "Take this layout and apply a spatial, exhibit-grade immersive world look and feel on a deep forest-obsidian continuous canvas with translucent glass-slate HUD layers, bioluminescent emerald and amber telemetry signals, and wide futuristic display typography."

## 1. Overall Aesthetic & Spatial Density
- **Visual Philosophy**: Interactive museum installation, spatial computing HUD, and deep-field telemetry observatory. Because `immersive` is an explicitly spatial/exhibit environment, it uses a deep nocturnal forest-obsidian canvas (`#090D0B` — zero purple or blue-slate cast) where UI panels float like precision optical glass plates over a living continuous stage.
- **Layered Spatial Depth**: Primary containers use `#111714` with subtle translucent rim lighting (`1px solid #1F2D27`), inner ambient vignette glow, and crisp spatial telemetry markers.
- **Preserved Clone Geometry**: Keeps 100% of the base `clone` layout regions, navigation items, and interactive controls in place.

## 2. Wide Spatial Display & Clean Technical Typography
- **Primary Display / Headlines**: **`Unbounded`** (`font-weight: 500–700`, tracking `-0.02em`, line-height `1.12`). Expansive, architectural wide-stance display typography that establishes an immediate spatial/exhibit presence.
- **Secondary Body / UI Controls**: **`Onest`** (`font-weight: 400–500`, `15px` body at `1.55` line-height, engineered for high-contrast screen legibility in spatial HUD interfaces).
- **Monospace / Telemetry & Spatial Coordinates**: **`Red Hat Mono`** (`font-weight: 400–500`, `12px`, `tabular-nums`) for live coordinates, status readouts, and system metrics.
- **Google Fonts Load URL**:
  `https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Red+Hat+Mono:wght@400;500&family=Unbounded:wght@500;600;700&display=swap`

## 3. Surface & Color System (Deep Forest-Obsidian & Signal Emerald — Zero Purple/Blue)
- **Canvas Background (`--jig-bg`)**: `#090D0B` (`oklch(0.155 0.012 155)`) — deep botanical obsidian canvas.
- **Elevated HUD Plate (`--jig-surface`)**: `#111714` (`oklch(0.198 0.015 155)`) — translucent dark mineral slate.
- **Secondary Control Well (`--jig-surface-2`)**: `#17201C` (`oklch(0.235 0.018 155)`).
- **Primary Luminous Ink (`--jig-text`)**: `#ECFDF5` (`oklch(0.979 0.021 166)`) — `17.5:1` WCAG AAA contrast on `#090D0B`.
- **Muted Telemetry Ink (`--jig-text-muted`)**: `#9CA3AF` (`oklch(0.714 0.01 260)`) — `7.4:1` WCAG AAA contrast.
- **Optical Rim Border (`--jig-border`)**: `#1F2D27` (`oklch(0.285 0.022 155)`).
- **Primary Brand Action (`--jig-brand`)**: Signal Emerald `#10B981` (`oklch(0.696 0.15 162)`) with `#090D0B` dark ink for crisp contrast.
- **Supporting Telemetry Accent (`--jig-accent`)**: Warm Amber `#D97706` (`oklch(0.666 0.157 58)`).

## 4. Borders, Corner Radii, and Elevation
- **Card & Control Radius**: `16px` (`rounded-[16px]`) on floating spatial panels; `10px` (`rounded-[10px]`) on inner controls and chips.
- **Border Treatment**: `1px solid #1F2D27` with subtle emerald rim highlight `inset 0 1px 0 rgba(16, 185, 129, 0.12)`.
- **Shadow Stack**: Deep spatial elevation `0 20px 50px -12px rgba(0, 0, 0, 0.7), 0 0 24px -4px rgba(16, 185, 129, 0.08)`.

## 5. Component-Level Transformation Rules (Preserving Clone Layout)
- **Sidebars & Navigation Rails**: Floating spatial rail in `#111714` with `#10B981` active telemetry indicator dot and `bg-[#17201C] border border-[#10B981]/40 text-[#ECFDF5]` active state.
- **Cards, Messages & Panels**: Render as optical HUD plates (`bg-[#111714]/95 border border-[#1F2D27] rounded-[16px]`) with `Unbounded` section titles and `Red Hat Mono` telemetry badges.
- **Inputs, Search Bars & Chat Composers**: Render as a floating spatial command deck (`bg-[#111714] border border-[#1F2D27] focus-within:border-[#10B981] rounded-[16px]`) with a glowing `#10B981` text-dark submit trigger.

## 6. Enriched Prompt Block
```text
Typography: Unbounded (headlines) + Onest (body/UI) + Red Hat Mono (telemetry)
Color (dark — spatial exhibit HUD on deep forest-obsidian canvas): brand Signal Emerald #10B981, accent Warm Amber #D97706, bg #090D0B, text #ECFDF5
Avoid: purple/violet; blue-slate dark backgrounds; Material fonts; flat unlayered surfaces
```
