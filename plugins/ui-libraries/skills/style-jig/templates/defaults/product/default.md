---
slot: product
label: Product
mode: prompt-fallback
theme: light
primary_font: Outfit
secondary_font: Atkinson Hyperlegible Next
mono_font: JetBrains Mono
bg: "#F8FAF9"
surface: "#FFFFFF"
surface_2: "#EFF4F2"
text: "#09090B"
text_muted: "#52525B"
border: "#E4E4E7"
brand: "#0F766E"
accent: "#059669"
radius_card: "12px"
radius_control: "8px"
---

# `product` — Default Style Transformation Prompt

> **Core Mandate**: "Take this layout and apply a high-craft functional SaaS product workspace look and feel with concentric border radii, tactile micro-elevation, hyper-legible UI typography, and crisp petrol-teal and emerald operational signals."

## 1. Overall Aesthetic & Spatial Density
- **Visual Philosophy**: Best-in-class modern software craft (`Wardline` / `Ledgermark` / Linear-grade precision in crisp daylight). Every control feels engineered, responsive, and unambiguous, with balanced information density, tabular metrics, and concentric container geometry.
- **Concentric Geometry**: Outer containers use `12px` radius (`rounded-[12px]`) with `4px` padding around `8px` radius (`rounded-[8px]`) inner controls so corners nest mathematically (`r_inner = r_outer - padding`).
- **Tactile Feedback**: Buttons and interactive chips feature subtle `1px` borders, layered neutral elevation, and `:active` `scale-[0.99]` press states.

## 2. Precision Geometric & Hyper-Legible UI Typography
- **Primary Display / Headlines**: **`Outfit`** (`font-weight: 600`, tracking `-0.02em`, line-height `1.18`). Clean geometric proportions tuned for product headers, modal titles, and KPI callouts.
- **Secondary Body / UI Controls**: **`Atkinson Hyperlegible Next`** (`font-weight: 400–500`, `14.5px–15.5px` body at `1.55` line-height, engineered for unmistakable character distinction across dense product workflows).
- **Monospace / Data, Tokens & Shortcuts**: **`JetBrains Mono`** (`font-weight: 500`, `12px`, `tabular-nums`) for keyboard shortcut kbd badges (`⌘K`), API tokens, latency pills, and numeric columns.
- **Google Fonts Load URL**:
  `https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@500;600;700&display=swap`

## 3. Surface & Color System (Daylight Workspace & Petrol Teal — Zero Purple)
- **Canvas Background (`--jig-bg`)**: `#F8FAF9` (`oklch(0.982 0.004 165)`) — cool-neutral daylight workspace shell.
- **Primary Card / Workspace Surface (`--jig-surface`)**: `#FFFFFF` (`oklch(1.0 0 0)`) — crisp elevated product surface.
- **Recessed Well / Segmented Control (`--jig-surface-2`)**: `#EFF4F2` (`oklch(0.958 0.008 165)`).
- **Primary Ink (`--jig-text`)**: `#09090B` (`oklch(0.145 0.004 285)`) — `19.4:1` WCAG AAA contrast.
- **Muted UI Ink (`--jig-text-muted`)**: `#52525B` (`oklch(0.44 0.01 285)`) — `7.2:1` WCAG AAA contrast.
- **Crisp Hairline Border (`--jig-border`)**: `#E4E4E7` (`oklch(0.92 0.004 286)`).
- **Primary Brand Action (`--jig-brand`)**: Deep Petrol Teal `#0F766E` (`oklch(0.51 0.096 186)`) with `#FFFFFF` ink.
- **Supporting Operational Accent (`--jig-accent`)**: Signal Emerald `#059669` (`oklch(0.60 0.15 163)`).

## 4. Borders, Corner Radii, and Elevation
- **Card & Control Radius**: `12px` (`rounded-[12px]`) on panels/cards; `8px` (`rounded-[8px]`) on buttons, inputs, and dropdown items; `6px` (`rounded-[6px]`) on status badges and `<kbd>` chips.
- **Border Treatment**: `1px solid #E4E4E7` on cards; `1px solid #D4D4D8` on interactive buttons and inputs.
- **Shadow Stack**: Multi-layer product shadow `0 1px 3px rgba(9, 9, 11, 0.05), 0 1px 2px rgba(9, 9, 11, 0.03)`.

## 5. Component-Level Transformation Rules (Preserving Clone Layout)
- **Sidebars & Navigation Rails**: App-shell sidebar in `#F8FAF9` with compact `34px`-tall nav rows, `rounded-[8px]` active state (`bg-white shadow-2xs border border-[#E4E4E7] text-[#09090B] font-medium`), and right-aligned `JetBrains Mono` count badges.
- **Cards, Toolbars & Status Pills**: Add semantic status dot indicators (`#059669` operational emerald, `#D97706` amber warning) and crisp segmented controls (`bg-[#EFF4F2] p-1 rounded-[10px]`).
- **Inputs, Search Bars & Chat Composers**: Render as a precision command composer (`bg-white rounded-[12px] border border-[#D4D4D8] shadow-xs`) with `<kbd>` shortcut hints and a `#0F766E` primary action button.

## 6. Enriched Prompt Block
```text
Typography: Outfit (headlines) + Atkinson Hyperlegible Next (body/UI) + JetBrains Mono (shortcuts/metrics)
Color (light — precision daylight SaaS workspace): brand Petrol Teal #0F766E, accent Signal Emerald #059669, bg #F8FAF9, text #09090B
Avoid: purple/violet; Material fonts; dark default; unaligned radii or decorative fluff
```
