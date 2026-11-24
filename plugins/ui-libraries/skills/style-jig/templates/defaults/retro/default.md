---
slot: retro
label: Retro
mode: prompt-fallback
theme: light
primary_font: Fraunces
secondary_font: Literata
mono_font: Azeret Mono
bg: "#F6EFE2"
surface: "#FDF9F0"
surface_2: "#EBE0CC"
text: "#261E18"
text_muted: "#69594C"
border: "#C8B9A2"
brand: "#C2410C"
accent: "#B45309"
radius_card: "4px"
radius_control: "4px"
---

# `retro` — Default Style Transformation Prompt

> **Core Mandate**: "Take this layout and apply a nostalgic 1970s archival print, risograph, and analog studio manual look and feel with warm sun-aged stock, soft-serif display typography, stamped monospace labels, and burnt-sienna and mustard-ochre inks."

## 1. Overall Aesthetic & Spatial Density
- **Visual Philosophy**: Vintage Braun/Dieter Rams technical manuals, 1970s Penguin paperbacks, and two-color risograph studio catalogues. The clone's exact layout structure is preserved, reimagined as an authentic analog print artifact on sun-warmed paper stock.
- **Double-Rule & Stamp Framing**: Primary panels use `1px solid #C8B9A2` outer borders paired with warm recessed `#EBE0CC` header bands and stamped `Azeret Mono` catalog numbers (`CAT. NO. 74-B`).
- **Tactile Print Warmth**: Every surface is tinted toward warm ochre/sepia (`#F6EFE2` / `#FDF9F0`); pure `#FFFFFF` and `#000000` are replaced with aged cream and deep walnut-charcoal ink (`#261E18`).

## 2. Vintage Soft-Serif & Typewriter Monospace Typography
- **Primary Display / Headlines**: **`Fraunces`** (`font-weight: 600–700`, `SOFT 60`, `WONK 1`, tracking `-0.02em`, line-height `1.1`). Warm, expressive 1970s Cooper/Windsor-inspired old-style soft serif.
- **Secondary Body / UI Controls**: **`Literata`** (`font-weight: 400–500`, `15px` body at `1.6` line-height, tactile book-print legibility) paired with **`Azeret Mono`** for all buttons and control labels.
- **Monospace / Catalog Stamps & Dials**: **`Azeret Mono`** (`font-weight: 500–600`, `11.5px–12.5px`, uppercase tracking `0.05em`, `tabular-nums`).
- **Google Fonts Load URL**:
  `https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,500..700;1,9..144,500..700&family=Literata:opsz,wght@7..72,400..600&display=swap`

## 3. Surface & Color System (Sun-Aged Risograph Stock & Burnt Sienna — Zero Purple)
- **Canvas Background (`--jig-bg`)**: `#F6EFE2` (`oklch(0.952 0.02 82)`) — sun-aged archival vellum stock.
- **Primary Card Surface (`--jig-surface`)**: `#FDF9F0` (`oklch(0.982 0.012 84)`) — warm cream catalog card.
- **Recessed Stamp Well (`--jig-surface-2`)**: `#EBE0CC` (`oklch(0.908 0.026 80)`).
- **Primary Ink (`--jig-text`)**: `#261E18` (`oklch(0.238 0.02 55)`) — deep walnut-charcoal letterpress ink (`13.8:1` WCAG AAA contrast).
- **Muted Ink (`--jig-text-muted`)**: `#69594C` (`oklch(0.472 0.028 60)`) — aged sepia ink (`5.6:1` WCAG AA+ contrast).
- **Archival Rule Border (`--jig-border`)**: `#C8B9A2` (`oklch(0.795 0.03 78)`).
- **Primary Brand Action (`--jig-brand`)**: Burnt Sienna / Risograph Orange `#C2410C` (`oklch(0.553 0.174 38)`) with `#FDF9F0` cream ink.
- **Supporting Accent (`--jig-accent`)**: Mustard Ochre `#B45309` (`oklch(0.555 0.146 66)`).

## 4. Borders, Corner Radii, and Elevation
- **Card & Control Radius**: Tight mechanical corners — `4px` (`rounded-[4px]`) across cards, buttons, and inputs.
- **Border Treatment**: `1px solid #C8B9A2` on cards; `1.5px solid #261E18` on active buttons and input wells.
- **Shadow Stack**: Subtle inset paper crease and `2px 2px 0 rgba(38, 30, 24, 0.14)` tactile print registration shadow.

## 5. Component-Level Transformation Rules (Preserving Clone Layout)
- **Sidebars & Navigation Rails**: Style as an index file cabinet with tabbed `Azeret Mono` labels, `#EBE0CC` active row fill, and a `#C2410C` left registration mark.
- **Cards, Messages & Panels**: Frame in `#FDF9F0` with a top `#EBE0CC` index header bar, `Fraunces` titles, and warm dotted horizontal leader lines (`border-dotted border-[#C8B9A2]`).
- **Inputs, Search Bars & Chat Composers**: Style as an analog typewriter/teleprinter dispatch well (`bg-[#FDF9F0] border-[1.5px] border-[#261E18] rounded-[4px]`) with an uppercase `Azeret Mono` `#C2410C` action key.

## 6. Enriched Prompt Block
```text
Typography: Fraunces (headlines) + Literata (body) + Azeret Mono (stamps/controls)
Color (light — 1970s archival vellum stock and risograph sienna ink): brand Burnt Sienna #C2410C, accent Mustard Ochre #B45309, bg #F6EFE2, text #261E18
Avoid: purple/violet; Material fonts; dark default; cold pure-white backgrounds or modern glass blur
```
