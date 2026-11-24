---
slot: playful
label: Playful
mode: prompt-fallback
theme: light
primary_font: Syne
secondary_font: Figtree
mono_font: DM Mono
bg: "#FFFDF5"
surface: "#FFFFFF"
surface_2: "#FEF3C7"
text: "#18181B"
text_muted: "#52525B"
border: "#18181B"
brand: "#EA580C"
accent: "#16A34A"
radius_card: "22px"
radius_control: "9999px"
---

# `playful` — Default Style Transformation Prompt

> **Core Mandate**: "Take this layout and apply an energetic, tactile, playful look and feel with warm butter-cream surfaces, generously rounded pill geometry, bouncy expressive display typography, crisp ink outlines, and joyful tangerine and meadow-green color blocks."

## 1. Overall Aesthetic & Spatial Density
- **Visual Philosophy**: Tactile tabletop toys, friendly Storybook/Lingo interfaces, and kinetic creative tools. The clone's exact spatial layout is preserved, but every surface feels touchable, buoyant, and full of personality.
- **Generous Pill & Cushion Geometry**: Cards use `20px–24px` corners (`rounded-[22px]`), while buttons, chips, and badges use full pill radii (`rounded-full`).
- **Tactile Keycap Borders**: Combine `1.5px` or `2px solid #18181B` ink outlines with a warm `0 3px 0 #18181B` bottom lip on interactive buttons and cards so every element feels like a physical button you want to press.

## 2. Expressive Display & Friendly Rounded Sans Typography
- **Primary Display / Headlines**: **`Syne`** (`font-weight: 700–800`, tracking `-0.02em`, line-height `1.08`). Expressive, charismatic display geometry that brings instant warmth and creative energy.
- **Secondary Body / UI Controls**: **`Figtree`** (`font-weight: 500–600`, `15.5px` body at `1.55` line-height, warm and approachable geometric humanist sans).
- **Monospace / Badges & Counters**: **`DM Mono`** (`font-weight: 500`, `12px`, `tabular-nums`) for score pills, counters, and playful status tags.
- **Google Fonts Load URL**:
  `https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Figtree:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap`

## 3. Surface & Color System (Warm Butter-Cream & Tangerine — Zero Purple)
- **Canvas Background (`--jig-bg`)**: `#FFFDF5` (`oklch(0.992 0.014 95)`) — sunlit butter-cream canvas.
- **Primary Card Surface (`--jig-surface`)**: `#FFFFFF` (`oklch(1.0 0 0)`) — crisp white card shell.
- **Secondary Highlight Well (`--jig-surface-2`)**: `#FEF3C7` (`oklch(0.962 0.058 95)`) — warm saffron-cream badge and active-tab fill.
- **Primary Ink (`--jig-text`)**: `#18181B` (`oklch(0.21 0.006 285)`) — `16.8:1` WCAG AAA contrast.
- **Secondary Ink (`--jig-text-muted`)**: `#52525B` (`oklch(0.44 0.01 285)`) — `7.2:1` WCAG AAA contrast.
- **Tactile Outline Border (`--jig-border`)**: `#18181B` (`1.5px solid #18181B` on interactive elements; `#E5E0D0` on subtle dividers).
- **Primary Brand Action (`--jig-brand`)**: Vibrant Tangerine `#EA580C` (`oklch(0.646 0.194 41)`) with `#FFFFFF` ink.
- **Supporting Joyful Accent (`--jig-accent`)**: Meadow Green `#16A34A` (`oklch(0.627 0.17 149)`).

## 4. Borders, Corner Radii, and Elevation
- **Card & Control Radius**: `22px` (`rounded-[22px]`) on cards and panels; `9999px` (`rounded-full`) on buttons, filter chips, and search/chat bars.
- **Border Treatment**: `1.5px solid #18181B` on cards and active controls.
- **Shadow Stack**: Tactile offset cushion `0 3px 0 #18181B` on buttons/chips and `0 4px 0 #18181B` on primary cards.

## 5. Component-Level Transformation Rules (Preserving Clone Layout)
- **Sidebars & Navigation Rails**: Render nav items as `rounded-full` pills; the active item pops with `bg-[#FEF3C7] border-[1.5px] border-[#18181B] shadow-[0_2px_0_#18181B] text-[#18181B] font-bold`.
- **Cards, Messages & Panels**: Frame in `rounded-[22px] bg-white border-[1.5px] border-[#18181B] shadow-[0_4px_0_#18181B]` with `Syne` headings and colorful `#FEF3C7` / `#DCFCE7` status pills.
- **Inputs, Search Bars & Chat Composers**: Style as a friendly pill-shaped or `22px` cushioned dock (`bg-white border-2 border-[#18181B] shadow-[0_4px_0_#18181B]`) with a tactile `#EA580C` pill submit button.

## 6. Enriched Prompt Block
```text
Typography: Syne (headlines) + Figtree (body/UI) + DM Mono (badges/numerals)
Color (light — warm butter-cream canvas with tactile ink outlines): brand Tangerine #EA580C, accent Meadow Green #16A34A, bg #FFFDF5, text #18181B
Avoid: purple/violet; Material fonts; dark default; sterile corporate gray
```
