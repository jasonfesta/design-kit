---
slot: brutal
label: Brutal
mode: prompt-fallback
theme: light
primary_font: Big Shoulders
secondary_font: Archivo
mono_font: Space Mono
bg: "#F4F1EA"
surface: "#FFFFFF"
surface_2: "#EAE5D9"
text: "#09090B"
text_muted: "#27272A"
border: "#09090B"
brand: "#DC2626"
accent: "#EA580C"
radius_card: "0px"
radius_control: "0px"
---

# `brutal` — Default Style Transformation Prompt

> **Core Mandate**: "Take this layout and apply a raw Swiss Neo-Brutalist architectural poster look and feel with stark 2px solid ink borders, hard 0px corners, solid offset block shadows, condensed industrial display type, and high-voltage vermillion red and safety-orange punch."

## 1. Overall Aesthetic & Spatial Density
- **Visual Philosophy**: Raw concrete monoliths, industrial shipping manifests (`Fieldrig`), and punk/Swiss exhibition posters. Every UI container is framed as an honest, unapologetic physical block with `2px solid #09090B` borders and hard `4px 4px 0px #09090B` offset shadows.
- **Zero Blur / Zero Gradients**: No soft drop shadows, no backdrop blur, and no rounded corners (`0px` everywhere).
- **Physical Press Mechanics**: Interactive buttons sit raised at `shadow-[3px_3px_0_#09090B]` and physically translate down-right (`active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#09090B]`) on click.

## 2. Heavy Condensed Display & Monospace Typography
- **Primary Display / Headlines**: **`Big Shoulders`** (`font-weight: 700–800`, uppercase, tracking `0.01em`, line-height `0.98`). Commanding industrial condensed display face.
- **Secondary Body / UI Controls**: **`Archivo`** (`font-weight: 500–700`, `15px` body at `1.5` line-height, muscular grotesque legibility).
- **Monospace / Raw Specs & Index Codes**: **`Space Mono`** (`font-weight: 700`, `12px`, uppercase tags `// SYS.01`, `tabular-nums`).
- **Google Fonts Load URL**:
  `https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Big+Shoulders:opsz,wght@10..72,700;10..72,800&family=Space+Mono:wght@400;700&display=swap`

## 3. Surface & Color System (Raw Concrete Paper & Vermillion Red — Zero Purple)
- **Canvas Background (`--jig-bg`)**: `#F4F1EA` (`oklch(0.958 0.012 85)`) — unbleached concrete-kraft stock.
- **Primary Block Surface (`--jig-surface`)**: `#FFFFFF` (`oklch(1.0 0 0)`) — stark poster white block.
- **Secondary Stamp Surface (`--jig-surface-2`)**: `#EAE5D9` (`oklch(0.922 0.016 85)`).
- **Primary Ink (`--jig-text`)**: `#09090B` (`oklch(0.145 0.004 285)`) — `18.6:1` WCAG AAA contrast.
- **Secondary Ink (`--jig-text-muted`)**: `#27272A` (`oklch(0.274 0.006 286)`) — `12.4:1` WCAG AAA contrast.
- **Structural Rule Border (`--jig-border`)**: `#09090B` (`2px solid #09090B`).
- **Primary Brand Action (`--jig-brand`)**: Signal Vermillion `#DC2626` (`oklch(0.577 0.215 27)`) with `#FFFFFF` ink and `2px solid #09090B` border.
- **Supporting Accent (`--jig-accent`)**: Safety Orange `#EA580C` (`oklch(0.646 0.194 41)`).

## 4. Borders, Corner Radii, and Elevation
- **Card & Control Radius**: Strictly `0px` (`rounded-none`) across all cards, avatars, buttons, badges, and inputs.
- **Border Treatment**: `2px solid #09090B` on all primary containers, buttons, and inputs.
- **Shadow Stack**: Hard offset print block shadow `4px 4px 0px #09090B` on cards and `2px 2px 0px #09090B` on buttons/chips.

## 5. Component-Level Transformation Rules (Preserving Clone Layout)
- **Sidebars & Navigation Rails**: Frame with a `2px solid #09090B` right border; active nav item renders as a `#DC2626` text-white block with `border-2 border-[#09090B] shadow-[2px_2px_0_#09090B]`.
- **Cards, Messages & Panels**: Wrap in `bg-white border-2 border-[#09090B] shadow-[4px_4px_0_#09090B]` with uppercase `Space Mono` index headers (`[BLOCK // 01]`).
- **Inputs, Search Bars & Chat Composers**: Frame as a heavy-duty terminal dispatch box (`bg-white border-2 border-[#09090B] shadow-[4px_4px_0_#09090B] rounded-none`) with a `#DC2626` uppercase `EXECUTE` / `SEND` button.

## 6. Enriched Prompt Block
```text
Typography: Big Shoulders (headlines) + Archivo (body/UI) + Space Mono (specs/numerals)
Color (light — unbleached concrete paper with 2px black ink blocks): brand Vermillion #DC2626, accent Safety Orange #EA580C, bg #F4F1EA, text #09090B
Avoid: purple/violet; Material fonts; dark default; rounded corners or soft blurred shadows
```
