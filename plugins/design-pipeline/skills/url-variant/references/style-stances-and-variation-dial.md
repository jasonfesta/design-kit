# Design Style Stances & The Variation Stance Dial (`url-variant`)

A true design variant is never a shallow color swap or random re-skin. When a senior designer creates a variant of an existing site or application, they take a **deliberate design style stance**—choosing how far to push the thematic polarity, material physics, typographic voice, and structural grid while preserving the original page's functional architecture, section sequence, and information density.

`url-variant` operationalizes this through two controls selected before generation:
1. **The Variation Stance Dial (`--stance-dial`, `0.10` to `1.00`, default `0.65`)**
2. **The Named Design Style Stance (`--style-stance`, 8 canonical stances or `auto`)**

---

## 1. The Variation Stance Dial (`0.10` to `1.00`)

Whenever `url-variant` runs, ask the user (or accept via flags) where to set the dial:

| Dial Range | Tier Name | Design Latitude & Stance Behavior | Target Palette $\Delta E^*_{ab}$ | Target `16x16` RGB MAE | Vibe Edge Rhythm $r$ |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **`0.15 - 0.30`** | **`subtle-sibling`** *(Same Theme Polarity, Fresh Identity)* | Keeps the original light/dark polarity and general material warmth/coolness, but shifts brand/accent hues, selects a fresh Google Font pairing (`recommend_google_fonts.py`), rewrites 100% of copy/brand/logos, and upgrades any Flutter/canvas/DOM artifacts into crisp vector UI. | `16.0 - 28.0` | `18.0 - 45.0` | `0.55 - 0.90` |
| **`0.40 - 0.60`** | **`editorial-reframe`** *(Distinct Chromatic & Typographic Stance)* | Shifts into a distinctly new non-beige color world within a compatible luminance tier, transforms the typographic voice (e.g., geometric display grotesk or editorial serif + Swiss neo-grotesk companion), sharpens card border/radius grammar, and re-art-directs hero/callout visuals while keeping the exact layout grid. | `25.0 - 45.0` | `32.0 - 75.0` | `0.38 - 0.85` |
| **`0.65 - 0.85`** *(Default)* | **`theme-polarity-inversion`** *(Full Theme & Material Transformation)* | Transforms the theme stance (e.g., Light SaaS $\leftrightarrow$ Nocturnal Obsidian Carbon, or Flat Corporate $\leftrightarrow$ Brushed Aluminum Hardware / Swiss Cobalt Ledger). Re-lights all surfaces, cards, charts, and 3D/bespoke visuals natively for the new polarity with WCAG 2.2 AA contrast. | `38.0 - 75.0` | `48.0 - 115.0` | `0.25 - 0.80` |
| **`0.90 - 1.00`** | **`archetype-transmutation`** *(Complete Style-Stance Re-Architecture)* | Re-imagines the entire visual language into one of the 8 canonical Design Style Stances below—changing border mechanics, surface physics, chromatic blocking, and typographic contrast while preserving 100% of the functional sections, widget types, and information density. | `>= 45.0` | `55.0 - 130.0` | `0.18 - 0.75` |

---

## 2. The 8 Canonical Design Style Stances (`--style-stance`)

Every stance is defined across the **Tri-Voice Specification** (1. Textural & Material Physics, 2. Designer Hierarchy & Typography, 3. Frontend Developer Grid & Component Geometry) so Nano Banana 2.1 receives deep, concrete art direction rather than vague adjectives.

### Stance 1: `swiss-telemetry-grid`
- **Polarity**: High-Craft Light Mineral & Exposed Structural Hairlines
- **8-Token Palette**:
  - `bg_primary`: `#F4F6FA` (Cool Mineral Alabaster)
  - `bg_elevated`: `#FFFFFF` (Pure Optic White Card Plane)
  - `text_primary`: `#0B1220` (Deep Slate Obsidian Ink, `17.4:1` contrast)
  - `text_secondary`: `#3E4C63` (Calibrated Steel Muted Ink, `7.8:1` contrast)
  - `accent_primary`: `#0047FF` (International Klein Cobalt)
  - `accent_on_primary`: `#FFFFFF`
  - `accent_secondary`: `#00A88F` (Precision Oscilloscope Teal)
  - `border_hairline`: `#D5DFEE` (`1px solid` continuous exposed Swiss grid seams)
- **Tri-Voice Art Direction**:
  - *Textural & Material*: Matte architectural paper plane meeting crisp `#FFFFFF` instrument cells, zero drop-shadow haze, anodized cobalt active states, razor-sharp vector schematic lines.
  - *Designer*: Exposed `1px` Swiss grid dividing header, hero, and bento callouts; generous `42%` negative space; coordinate index rails and right-aligned `tabular-nums` telemetry readouts.
  - *Frontend Developer*: `12-column` CSS Grid with `0px` or `6px` tight radii, continuous top-to-bottom vertical column rules, `44px` pill/rectangular CTAs with `24px` L/R optical padding.

### Stance 2: `nocturnal-obsidian-precision`
- **Polarity**: Dark Technical Obsidian & Specular Rim Lighting
- **8-Token Palette**:
  - `bg_primary`: `#090D12` (Deep Carbon Void)
  - `bg_elevated`: `#111821` (Machined Graphite Container)
  - `text_primary`: `#F3F7FA` (Crisp Titanium White, `17.8:1` contrast)
  - `text_secondary`: `#8A99AD` (Anodized Silver Muted Ink, `6.4:1` contrast)
  - `accent_primary`: `#10E88A` (Phosphor Signal Emerald)
  - `accent_on_primary`: `#062014`
  - `accent_secondary`: `#38BDF8` (Cryogenic Cyan)
  - `border_hairline`: `#1E2938` (`1px` subtle border with top-edge `rgba(255,255,255,0.09)` specular highlight)
- **Tri-Voice Art Direction**:
  - *Textural & Material*: Matte PVD-coated black aluminum and smoked optical glass (`backdrop-filter: blur(16px)`), lit by a cool top-left rim light with zero muddy gray wash.
  - *Designer*: High-contrast nocturnal instrumentation; glowing emerald/cyan data traces against deep `#090D12` space; tight `-0.03em` display headlines paired with crisp monospace badges.
  - *Frontend Developer*: `12px` card radii, `1px solid #1E2938` borders, dark code/terminal sandboxes with syntax-highlighted tokens, `44px` high-contrast emerald primary buttons (`#10E88A` fill with `#062014` bold label).

### Stance 3: `anodized-industrial-atelier`
- **Polarity**: Tactile Brushed Aluminum, Basalt & Industrial Vermilion
- **8-Token Palette**:
  - `bg_primary`: `#E6E9EF` (Brushed 6061 Aluminum Chassis)
  - `bg_elevated`: `#F7F9FC` (Bead-Blasted Machined Keycap Surface)
  - `text_primary`: `#12151A` (Engraved Carbon Ink, `14.6:1` contrast)
  - `text_secondary`: `#47505E` (Etched Gunmetal Ink, `6.1:1` contrast)
  - `accent_primary`: `#E63926` (Industrial Signal Vermilion)
  - `accent_on_primary`: `#FFFFFF`
  - `accent_secondary`: `#1D3557` (Deep Naval Steel)
  - `border_hairline`: `#C5CCD8` (`1px` machined shutline seams)
- **Tri-Voice Art Direction**:
  - *Textural & Material*: Physical hardware tactility inspired by Braun / Teenage Engineering / Leica—fine metallic grain, recessed module wells, crisp cast contact shadows, tactile toggle switches and rotary/segmented readouts.
  - *Designer*: Modular hardware faceplate proportioning; bold technical grotesk headlines; high-visibility vermilion `#E63926` primary action triggers against neutral metallic grounds.
  - *Frontend Developer*: `8px` outer module radius with `4px` inner well radius, `1px solid #C5CCD8` recessed borders, `tabular-nums` LED/LCD-inspired metric counters, symmetrical pill/keycap buttons.

### Stance 4: `editorial-monumental-serif`
- **Polarity**: Stark Gallery Alabaster, Deep Espresso Ink & Sculpted Serif Authority
- **8-Token Palette**:
  - `bg_primary`: `#FAF9FD` (Cool Gallery Vellum — strictly non-beige)
  - `bg_elevated`: `#FFFFFF` (Pure Exhibition Card)
  - `text_primary`: `#110F18` (Deep Obsidian Aubergine Ink, `17.9:1` contrast)
  - `text_secondary`: `#4E4A5E` (Editorial Slate Ink, `7.2:1` contrast)
  - `accent_primary`: `#4F26E8` (Ultramarine Editorial Ink)
  - `accent_on_primary`: `#FFFFFF`
  - `accent_secondary`: `#D9385E` (Crimson Rubric Accent)
  - `border_hairline`: `#DFDCEB` (`1px` fine editorial column rule)
- **Tri-Voice Art Direction**:
  - *Textural & Material*: Uncoated museum monograph stock with studio daylight photography, deep ink density, and crisp `1px` hairline rules dividing asymmetric editorial columns.
  - *Designer*: High-contrast display serif headlines (`Fraunces` / `Newsreader` / `Libre Caslon` via live `google-font-selection`) paired with a razor-sharp neo-grotesk UI body font; `>= 44%` open breathing room.
  - *Frontend Developer*: Asymmetric `5-col + 7-col` hero split, exposed `1px` horizontal and vertical editorial rules, `0px` or `4px` sharp corners on cards, pill CTAs with `2:1` optical padding.

### Stance 5: `kinetic-chromatic-colorblock`
- **Polarity**: High-Energy Architectural Color-Blocking & Stark Ink Framing
- **8-Token Palette**:
  - `bg_primary`: `#F5F7FF` (Crisp Ice White)
  - `bg_elevated`: `#FFFFFF` (Pure White Module)
  - `text_primary`: `#0B0C10` (Pitch Carbon Ink, `18.5:1` contrast)
  - `text_secondary`: `#383E4C` (Deep Charcoal Ink, `9.4:1` contrast)
  - `accent_primary`: `#2B3BFF` (Electric Ultramarine Block)
  - `accent_on_primary`: `#FFFFFF`
  - `accent_secondary`: `#B8FF29` (Kinetic Acid Chartreuse Accent Block)
  - `border_hairline`: `#0B0C10` (`1.5px solid` crisp architectural framing)
- **Tri-Voice Art Direction**:
  - *Textural & Material*: Bold flat-coat architectural enamel color blocks (ultramarine, chartreuse, crisp white, pitch black) with zero muddy gradients and razor-sharp vector geometry.
  - *Designer*: Decisive color-blocked sections and bento cards with bold expressive grotesk typography (`Bricolage Grotesque` / `Syne`), high-impact metric callouts, and tactile offset card framing.
  - *Frontend Developer*: `1.5px solid #0B0C10` structural borders, `12px` card radii, high-contrast pill buttons (`46px` height, `26px` L/R padding), and zero clutter.

### Stance 6: `indigo-ultraviolet-studio`
- **Polarity**: Deep Midnight Indigo & Electric Ultraviolet Studio Chroma
- **8-Token Palette**:
  - `bg_primary`: `#0B0917` (Midnight Indigo Void)
  - `bg_elevated`: `#151229` (Elevated Violet-Slate Card)
  - `text_primary`: `#F6F5FF` (Starlight White, `17.6:1` contrast)
  - `text_secondary`: `#9E99C4` (Lavender Steel Muted Ink, `6.7:1` contrast)
  - `accent_primary`: `#7C4DFF` (Electric Ultraviolet)
  - `accent_on_primary`: `#FFFFFF`
  - `accent_secondary`: `#FF4D8D` (Laser Rose)
  - `border_hairline`: `#28234A` (`1px` indigo structural seam)
- **Tri-Voice Art Direction**:
  - *Textural & Material*: Deep studio obsidian-indigo with subtle optical glass refraction, precision 3D geometric glass/metal hero artifacts, and crisp rim-lit cards.
  - *Designer*: Balanced `90/10` nocturnal chroma—90% deep midnight indigo surfaces with 10% concentrated ultraviolet/rose focal highlights on CTAs and active data traces.
  - *Frontend Developer*: `14px` card radius, `1px solid #28234A` borders, `44px` pill controls, and crisp `tabular-nums` KPI readouts.

### Stance 7: `forest-titanium-precision`
- **Polarity**: Deep Alpine Pine, Brushed Titanium & Acid Lime Telemetry
- **8-Token Palette**:
  - `bg_primary`: `#081612` (Deep Alpine Nocturnal Pine)
  - `bg_elevated`: `#10261F` (Elevated Botanical Slate)
  - `text_primary`: `#ECFDF5` (Crisp Mint-White Ink, `17.2:1` contrast)
  - `text_secondary`: `#86B3A0` (Sage Titanium Muted Ink, `6.8:1` contrast)
  - `accent_primary`: `#B8FF3B` (High-Visibility Acid Lime)
  - `accent_on_primary`: `#081612`
  - `accent_secondary`: `#2DD4BF` (Biometric Teal)
  - `border_hairline`: `#1E4035` (`1px` precision border)
- **Tri-Voice Art Direction**:
  - *Textural & Material*: Deep matte botanical carbon paired with satin titanium data modules and high-visibility lime `#B8FF3B` active indicators.
  - *Designer*: Architectural climate/fintech/biotech precision; generous card padding (`32px`), crisp geometric headlines, and high-contrast data visualization widgets.
  - *Frontend Developer*: `12px` card radius, `1px solid #1E4035` borders, `#B8FF3B` primary buttons with `#081612` dark bold text (`13.8:1` contrast).

### Stance 8: `high-craft-light-laboratory`
- **Polarity**: Pure Optic `#FFFFFF` Gallery & Cool `#EEF2F7` Brushed Steel
- **8-Token Palette**:
  - `bg_primary`: `#FFFFFF` (Pure Optic White — zero warm-beige drift)
  - `bg_elevated`: `#F1F5F9` (Cool Laboratory Steel Container)
  - `text_primary`: `#0F172A` (Deep Slate Ink, `17.8:1` contrast)
  - `text_secondary`: `#475569` (Cool Graphite Muted Ink, `7.5:1` contrast)
  - `accent_primary`: `#0284C7` (Optical Cerulean Blue)
  - `accent_on_primary`: `#FFFFFF`
  - `accent_secondary`: `#6366F1` (Precision Indigo)
  - `border_hairline`: `#E2E8F0` (`1px solid` crisp laboratory seam)
- **Tri-Voice Art Direction**:
  - *Textural & Material*: Pure `#FFFFFF` gallery wall plane meeting `#F1F5F9` brushed stainless steel cards, crisp overhead studio daylight, zero yellow/beige warmth.
  - *Designer*: Maximum typographic clarity, `>= 42%` pure white negative space, scientific/engineering diagram precision in every tout.
  - *Frontend Developer*: `10px` card radius, `1px solid #E2E8F0` borders, `44px` cerulean pill CTAs (`#0284C7` with `#FFFFFF` label), and clean multi-column footer closure.
