---
slot: cinematic
label: Cinematic
mode: prompt-fallback
theme: dark
primary_font: Instrument Serif
secondary_font: Albert Sans
mono_font: Commit Mono
bg: "#0A0A0B"
surface: "#121215"
surface_2: "#18181C"
text: "#F4F4F5"
text_muted: "#A1A1AA"
border: "#27272A"
brand: "#D97706"
accent: "#F59E0B"
radius_card: "12px"
radius_control: "8px"
---

# `cinematic` — Default Style Transformation Prompt

> **Core Mandate**: "Take this layout and apply a dramatic, theatrical cinematic look and feel on a true-neutral obsidian dark stage with luminous warm amber key-lighting, smoked-glass depth, and high-contrast serif + geometric sans typography."

## 1. Overall Aesthetic & Spatial Density
- **Visual Philosophy**: A24 / Criterion Collection screening room meets high-craft nocturnal studio suite. Because `cinematic` is an explicitly theatrical screening/stage mode, it intentionally uses a **True Neutral Obsidian Dark** canvas (`#0A0A0B` — zero purple or blue-slate cast) lit by warm tungsten/amber rim highlights (`#D97706` / `#F59E0B`).
- **Stage Lighting & Vignette Depth**: Primary workspace panels sit on `#121215` smoked-glass cards with subtle top-edge specular hairlines (`1px solid rgba(255, 255, 255, 0.08)`) and warm ambient tungsten glow (`radial-gradient` at `< 6%` opacity) behind focal content.
- **Preserved Clone Geometry**: All sidebar widths, header bars, message threads, and action toolbars remain in their exact `clone` positions.

## 2. High-Drama Serif & Clean Sans Typography
- **Primary Display / Headlines**: **`Instrument Serif`** (`font-weight: 400`, tracking `-0.01em`, line-height `1.08`). Tall, sculptural cinema-title serif that commands immediate presence against dark obsidian surfaces.
- **Secondary Body / UI Controls**: **`Albert Sans`** (`font-weight: 400–500`, `15px` body at `1.55` line-height, crisp modern geometric legibility in light-on-dark polarity).
- **Monospace / Timecode & Telemetry**: **`Commit Mono`** (`font-weight: 400`, `12px`, `tabular-nums`) formatted like SMPTE timecodes and lens/scene telemetry.
- **Google Fonts Load URL**:
  `https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap`

## 3. Surface & Color System (True Neutral Obsidian & Tungsten Amber — Zero Purple/Blue)
- **Canvas Background (`--jig-bg`)**: `#0A0A0B` (`oklch(0.145 0.002 285)`) — pure carbon black screening room.
- **Elevated Stage Surface (`--jig-surface`)**: `#121215` (`oklch(0.182 0.004 285)`) — smoked matte cinema slate.
- **Secondary Control Surface (`--jig-surface-2`)**: `#18181C` (`oklch(0.212 0.005 285)`).
- **Primary Chalk Ink (`--jig-text`)**: `#F4F4F5` (`oklch(0.967 0.002 286)`) — `17.2:1` WCAG AAA contrast on `#0A0A0B`.
- **Muted Silver Ink (`--jig-text-muted`)**: `#A1A1AA` (`oklch(0.71 0.006 286)`) — `7.6:1` WCAG AAA contrast on `#0A0A0B`.
- **Specular Hairline Border (`--jig-border`)**: `#27272A` (`oklch(0.274 0.006 286)`).
- **Primary Brand Action (`--jig-brand`)**: Tungsten Amber `#D97706` (`oklch(0.666 0.157 58)`) with `#0A0A0B` dark ink for crisp contrast.
- **Supporting Rim Accent (`--jig-accent`)**: Warm Gold `#F59E0B` (`oklch(0.769 0.165 70)`).

## 4. Borders, Corner Radii, and Elevation
- **Card & Control Radius**: `12px` (`rounded-[12px]`) on primary stage containers; `8px` (`rounded-[8px]`) on inner buttons and chips.
- **Border Treatment**: `1px solid #27272A` with a subtle top rim highlight `inset 0 1px 0 rgba(255, 255, 255, 0.07)`.
- **Shadow Stack**: Deep theatrical shadow `0 16px 40px -8px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(217, 119, 6, 0.10)`.

## 5. Component-Level Transformation Rules (Preserving Clone Layout)
- **Sidebars & Navigation Rails**: Render in `#0A0A0B` with `#A1A1AA` idle links and a warm amber-lit `#18181C` active pill (`border border-[#D97706]/40 text-[#F4F4F5]`).
- **Primary Stage / Cards**: Frame cards in `#121215` with `Instrument Serif` titles (`22px–28px`) and subtle timecode/scene metadata badges in `#F59E0B`.
- **Inputs, Search Bars & Chat Composers**: Render as a low-glare director's console (`bg-[#121215] border border-[#27272A] focus-within:border-[#D97706]/70`) with a high-contrast `#D97706` text-dark submit CTA.

## 6. Enriched Prompt Block
```text
Typography: Instrument Serif (headlines) + Albert Sans (body/UI) + Commit Mono (timecodes)
Color (dark — theatrical cinema screening room requires true carbon obsidian): brand Tungsten Amber #D97706, accent Warm Gold #F59E0B, bg #0A0A0B, text #F4F4F5
Avoid: purple/violet; blue-slate dark backgrounds; Material fonts; neon cyberpunk clutter
```
