---
slot: editorial
label: Editorial
mode: prompt-fallback
theme: light
primary_font: Newsreader
secondary_font: Hanken Grotesk
mono_font: IBM Plex Mono
bg: "#FAF7F2"
surface: "#FFFDF9"
surface_2: "#F2ECE1"
text: "#1F1A17"
text_muted: "#6B5E53"
border: "#E2D9CC"
brand: "#B84A27"
accent: "#9A3412"
radius_card: "6px"
radius_control: "4px"
---

# `editorial` — Default Style Transformation Prompt

> **Core Mandate**: "Take this layout and apply a refined magazine and archival monograph editorial look and feel with high-contrast literary serif headlines, warm cotton-paper surfaces, humanist sans UI copy, and terracotta ink accents."

## 1. Overall Aesthetic & Spatial Density
- **Visual Philosophy**: Printed literary journal, museum exhibition monograph (`Folio Archive` / *Apartamento* / *Monocle* / research chronicle), and authoritative long-form publishing. The clone's exact functional layout is preserved, but every panel reads like a composed editorial page on warm cotton rag paper.
- **Typographic Authority**: Let expressive serif display headings, italic subheads, small-caps section kickers, and fine horizontal rules (`1px solid #E2D9CC` paired with `2px solid #1F1A17` top chapter rules) carry the visual hierarchy.
- **Calm Reading Cadence**: Generous line-height (`1.65` on prose/messages) and warm low-glare parchment contrast.

## 2. Literary Serif & Humanist Grotesque Typography
- **Primary Display / Headlines**: **`Newsreader`** (`font-weight: 400–600`, optical size `16..72`, tracking `-0.015em`, line-height `1.12`, with expressive italic emphasis on key words).
- **Secondary Body / UI Controls**: **`Hanken Grotesk`** (`font-weight: 400–500`, `15px–16px` body at `1.6` line-height, crisp editorial captions and buttons).
- **Monospace / Folio & Citation Numerals**: **`IBM Plex Mono`** (`font-weight: 400`, `12px`, `tabular-nums`) for issue numbers, timestamps, figure labels (`Fig. 01`), and metadata.
- **Google Fonts Load URL**:
  `https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&display=swap`

## 3. Surface & Color System (Warm Cotton Parchment & Terracotta — Zero Purple)
- **Canvas Background (`--jig-bg`)**: `#FAF7F2` (`oklch(0.975 0.01 82)`) — warm archival cotton paper.
- **Elevated Page / Card Surface (`--jig-surface`)**: `#FFFDF9` (`oklch(0.993 0.005 85)`) — sunlit cream folio leaf.
- **Secondary Margin / Well Surface (`--jig-surface-2`)**: `#F2ECE1` (`oklch(0.942 0.016 80)`) — warm stone margin well.
- **Primary Ink (`--jig-text`)**: `#1F1A17` (`oklch(0.225 0.014 52)`) — deep espresso printing ink (`15.6:1` WCAG AAA contrast).
- **Muted / Caption Ink (`--jig-text-muted`)**: `#6B5E53` (`oklch(0.485 0.022 58)`) — warm walnut caption ink (`5.8:1` WCAG AA+ contrast).
- **Editorial Rule Border (`--jig-border`)**: `#E2D9CC` (`oklch(0.887 0.018 78)`).
- **Primary Brand Action (`--jig-brand`)**: Sun-Baked Terracotta `#B84A27` (`oklch(0.546 0.158 38)`) with `#FFFDF9` text.
- **Supporting Accent (`--jig-accent`)**: Deep Rust `#9A3412` (`oklch(0.47 0.145 36)`).

## 4. Borders, Corner Radii, and Elevation
- **Card & Control Radius**: Subtle bookbinders' corners — `6px` (`rounded-[6px]`) on cards and `4px` (`rounded-[4px]`) on buttons and inputs.
- **Border Treatment**: `1px solid #E2D9CC` perimeter borders accented by crisp top editorial rules (`border-t-2 border-t-[#1F1A17]`) on primary workspace headers or featured cards.
- **Shadow Stack**: Warm paper-stack shadow `0 2px 10px rgba(31, 26, 23, 0.05), 0 1px 2px rgba(31, 26, 23, 0.04)`.

## 5. Component-Level Transformation Rules (Preserving Clone Layout)
- **Sidebars & Navigation Rails**: Style as a Table of Contents / Archival Index with roman or tabular numeral prefixes (`I.`, `II.`, `01`, `02`), warm `#F2ECE1` active highlight, and `#B84A27` active indicator.
- **Headers & Titles**: Set primary view titles in `Newsreader` `24px–32px` with subtle italic phrases and uppercase `Hanken Grotesk` kickers (`11px`, tracking `0.1em`, `#B84A27`).
- **Inputs, Search Bars & Chat Composers**: Style as an editorial dispatch desk (`bg-[#FFFDF9] border border-[#D5C8B6] rounded-[6px]`) with `#B84A27` terracotta primary action button.

## 6. Enriched Prompt Block
```text
Typography: Newsreader (headlines) + Hanken Grotesk (body/UI) + IBM Plex Mono (folio numerals)
Color (light — archival cotton paper and espresso ink): brand Terracotta #B84A27, accent Deep Rust #9A3412, bg #FAF7F2, text #1F1A17
Avoid: purple/violet; Material fonts; dark default; cold blue-gray surfaces or bubbly pills
```
