---
slot: grid
label: Grid
mode: prompt-fallback
theme: light
primary_font: Bricolage Grotesque
secondary_font: Public Sans
mono_font: Martian Mono
bg: "#F5F4F0"
surface: "#FFFFFF"
surface_2: "#EAE8E1"
text: "#111111"
text_muted: "#525252"
border: "#D6D3CB"
brand: "#15803D"
accent: "#B45309"
radius_card: "2px"
radius_control: "2px"
---

# `grid` — Default Style Transformation Prompt

> **Core Mandate**: "Take this layout and apply an exposed Swiss architectural grid look and feel with visible 1px structural hairlines, crisp cell alignment, technical index coordinates, and disciplined grotesque + monospace typography."

## 1. Overall Aesthetic & Spatial Density
- **Visual Philosophy**: Swiss International Typographic Style meets modern technical specification sheets (`Switchyard` / architectural blueprint discipline). Every section, header, sidebar, card, and toolbar locks visibly into a continuous exposed `1px` hairline grid.
- **Structural Cell Framing**: Instead of floating cards with drop shadows in empty space, cells share continuous `1px solid #D6D3CB` boundary lines (`border-collapse` / `gap-px bg-[#D6D3CB]` grid seams) with optional subtle corner crosshair ticks (`+`) or `01` / `02` monospace cell index markers.
- **Zero Shadow Clutter**: Elevation is communicated strictly through surface luminance steps (`#F5F4F0` stone canvas → `#FFFFFF` active cell → `#EAE8E1` utility header cell) rather than blurred drop shadows.

## 2. Precision Grotesque & Technical Monospace Typography
- **Primary Display / Headlines**: **`Bricolage Grotesque`** (`font-weight: 600–700`, tracking `-0.025em`, line-height `1.1`). Crisp, architectural grotesque with unmistakable structural character.
- **Secondary Body / UI Controls**: **`Public Sans`** (`font-weight: 400–500`, `14.5px–15.5px` body at `1.5` line-height, neutral and authoritative civic/technical legibility).
- **Monospace / Coordinates & Telemetry**: **`Martian Mono`** (`font-weight: 400–500`, `11.5px–12.5px`, uppercase tracking `0.06em` for column headers, `tabular-nums` for all metrics, timestamps, and grid coordinates).
- **Google Fonts Load URL**:
  `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Martian+Mono:wght@400;500&family=Public+Sans:wght@400;500;600&display=swap`

## 3. Surface & Color System (Warm Architectural Stone & Pine Signal — Zero Purple)
- **Canvas Background (`--jig-bg`)**: `#F5F4F0` (`oklch(0.968 0.006 95)`) — warm drafting-paper stone.
- **Primary Cell Surface (`--jig-surface`)**: `#FFFFFF` (`oklch(1.0 0 0)`) — crisp specification cell surface.
- **Secondary Header / Rail Cell (`--jig-surface-2`)**: `#EAE8E1` (`oklch(0.932 0.009 95)`) — recessed technical index cell.
- **Primary Ink (`--jig-text`)**: `#111111` (`oklch(0.178 0 0)`) — `18.9:1` WCAG AAA contrast.
- **Muted / Coordinate Ink (`--jig-text-muted`)**: `#525252` (`oklch(0.439 0 0)`) — `7.5:1` WCAG AAA contrast.
- **Exposed Grid Hairline (`--jig-border`)**: `#D6D3CB` (`oklch(0.865 0.011 95)`) — crisp `1px` architectural rule line.
- **Primary Brand Action (`--jig-brand`)**: Pine Green `#15803D` (`oklch(0.527 0.154 150)`) with `#FFFFFF` ink.
- **Supporting Signal Accent (`--jig-accent`)**: Warm Ochre `#B45309` (`oklch(0.555 0.146 66)`).

## 4. Borders, Corner Radii, and Elevation
- **Card & Control Radius**: `0px` to `2px` (`rounded-[2px]`) — razor-sharp architectural corners.
- **Border Treatment**: Continuous `1px solid #D6D3CB` across all layout seams; active or focused cells use a `1.5px solid #111111` or `#15803D` inset border.
- **Shadow Stack**: `none` (`shadow-none`) — 100% flat planar draftsmanship.

## 5. Component-Level Transformation Rules (Preserving Clone Layout)
- **Sidebars & Navigation Rails**: Partition into explicit `1px` bordered rows with uppercase `Martian Mono` section headers (`11px`, tracking `0.08em`) and a left `3px solid #15803D` indicator bar on the active item.
- **Cards, Tables & Lists**: Convert card grids into flush `1px` hairline-divided matrices (`border border-[#D6D3CB]`) with visible header strips (`bg-[#F5F4F0] border-b border-[#D6D3CB] px-3 py-1.5 font-mono text-[11px]`).
- **Inputs, Search Bars & Chat Composers**: Frame as precision rectangular command boxes (`rounded-[2px] border border-[#111111] bg-white`) with monospace status tags (`[READY // UTF-8]`) and square-edged action buttons.

## 6. Enriched Prompt Block
```text
Typography: Bricolage Grotesque (headlines) + Public Sans (body) + Martian Mono (coordinates/numerals)
Color (light — Swiss drafting-paper grid with exposed 1px hairlines): brand Pine Green #15803D, accent Warm Ochre #B45309, bg #F5F4F0, text #111111
Avoid: purple/violet; Material fonts; dark default; soft pill corners or blurry drop shadows
```
