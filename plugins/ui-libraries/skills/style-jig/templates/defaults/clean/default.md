---
slot: clean
label: Clean
mode: prompt-fallback
theme: light
primary_font: Schibsted Grotesk
secondary_font: Source Sans 3
mono_font: Fragment Mono
bg: "#FAFAFA"
surface: "#FFFFFF"
surface_2: "#F4F4F5"
text: "#18181B"
text_muted: "#52525B"
border: "#E4E4E7"
brand: "#059669"
accent: "#0D9488"
radius_card: "14px"
radius_control: "10px"
---

# `clean` — Default Style Transformation Prompt

> **Core Mandate**: "Take this layout and apply a clean look and feel with a lot of open white space and very simplistic fonts."

## 1. Overall Aesthetic & Spatial Density
- **Visual Philosophy**: Radical visual calm, generous breathing room, and effortless scannability. Preserve 100% of the base `clone` DOM hierarchy, component slots, and interactive affordances while stripping away heavy borders, decorative chrome, cluttered backgrounds, and visual noise.
- **Whitespace Multiplier**: Expand internal container padding by `1.25x–1.35x` (`p-6` to `p-8` on primary cards/panels, `gap-5` to `gap-6` between grid modules) while keeping the outer viewport geometry and column tracks locked to the `clone`.
- **Hierarchy by Air, Not Lines**: Replace heavy box dividers with quiet `1px` hairlines (`#E4E4E7`) or pure spatial separation (`24px–32px` vertical rhythm).

## 2. Simplistic, High-Legibility Non-Material Typography
- **Primary Display / Headlines**: **`Schibsted Grotesk`** (`font-weight: 500–600`, tracking `-0.02em`, line-height `1.15`). Unadorned neo-grotesk geometry with open apertures that reads with effortless clarity.
- **Secondary Body / UI Controls**: **`Source Sans 3`** (`font-weight: 400–500`, `15px–16px` body at `1.6` line-height, `13.5px` UI labels at `1.4` line-height).
- **Monospace / Numerals & Telemetry**: **`Fragment Mono`** (`font-weight: 400`, `tabular-nums`, `12px–13px`) for timestamps, token counts, metrics, and keyboard shortcuts.
- **Google Fonts Load URL**:
  `https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Schibsted+Grotesk:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap`

## 3. Surface & Color System (Crisp Architectural Daylight — Zero Purple)
- **Canvas Background (`--jig-bg`)**: `#FAFAFA` (`oklch(0.985 0.001 106)`) — soft gallery daylight white that eliminates harsh glare.
- **Elevated Card / Composer Surface (`--jig-surface`)**: `#FFFFFF` (`oklch(1.0 0 0)`) — pure crisp white lifted gently off the canvas.
- **Secondary / Muted Surface (`--jig-surface-2`)**: `#F4F4F5` (`oklch(0.967 0.002 286)`) — whisper-quiet neutral pill and hover well.
- **Primary Ink (`--jig-text`)**: `#18181B` (`oklch(0.21 0.006 285)`) — `16.8:1` WCAG AAA contrast on `#FFFFFF`.
- **Muted / Secondary Ink (`--jig-text-muted`)**: `#52525B` (`oklch(0.44 0.01 285)`) — `7.2:1` WCAG AAA contrast on `#FFFFFF`.
- **Hairline Border (`--jig-border`)**: `#E4E4E7` (`oklch(0.92 0.004 286)`).
- **Primary Brand Action (`--jig-brand`)**: Signal Emerald `#059669` (`oklch(0.60 0.15 163)`) with `#FFFFFF` label text.
- **Supporting Accent (`--jig-accent`)**: Petrol Teal `#0D9488` (`oklch(0.60 0.12 185)`).

## 4. Borders, Corner Radii, and Elevation
- **Card & Panel Radius**: `14px` (`rounded-[14px]`), with concentric `10px` (`rounded-[10px]`) inner buttons, inputs, and segments.
- **Border Treatment**: `1px solid rgba(24, 24, 27, 0.07)` (`#E4E4E7`) — never thick or high-contrast.
- **Shadow Stack**: Whisper-soft neutral ambient elevation `0 1px 2px rgba(24, 24, 27, 0.03), 0 8px 24px -4px rgba(24, 24, 27, 0.04)`.

## 5. Component-Level Transformation Rules (Preserving Clone Layout)
- **Sidebars & Navigation Rails**: Unify the sidebar background with `#FAFAFA`, remove boxy inactive button backgrounds, and indicate the active route with a clean `#FFFFFF` pill (`shadow-2xs`, `border-[#E4E4E7]`, `#18181B` medium weight).
- **Cards, Tables & Lists**: Increase row height by `6px–8px`, remove zebra striping, use `1px solid #F4F4F5` horizontal row hairlines, and align numeric columns with `tabular-nums`.
- **Inputs, Search Bars & Chat Composers**: Render as floating `#FFFFFF` shells with `14px` radius, `1px solid #E4E4E7` border, generous internal padding (`px-4 py-3`), and a crisp `#18181B` or `#059669` primary submit action.

## 6. Enriched Prompt Block
```text
Typography: Schibsted Grotesk (headlines) + Source Sans 3 (body) + Fragment Mono (numerals)
Color (light — airy architectural daylight for open whitespace): brand Signal Emerald #059669, accent Petrol Teal #0D9488, bg #FAFAFA, text #18181B
Avoid: purple/violet; Material fonts; dark default; heavy borders or dense clutter
```
