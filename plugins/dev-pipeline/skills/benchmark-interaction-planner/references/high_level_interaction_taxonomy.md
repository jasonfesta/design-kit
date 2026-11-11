# High-Level Interaction Taxonomy & `t=0` Visual-Lock Contract

When authoring `INTERACTION_PLAN.md` after grabbing the 5 page layouts from a 4K grid, every section must be assigned one or more of the **10 Canonical High-Level Interaction Patterns** below, explicitly citing the corresponding **Competitor Benchmark URL(s)**.

---

## 1. The 10 Canonical High-Level Interaction Patterns

| Pattern ID | High-Level Interaction Pattern | Benchmark Archetype URLs | Required Interactive State & Behavior |
| :--- | :--- | :--- | :--- |
| **`INT-01`** | **Ambient Video-Poster Stage & Live Transport Bar** | • **Bottega Veneta** (`https://www.bottegaveneta.com/`)<br>• **Polène Paris** (`https://eng.polene-paris.com/`) | • Renders a seamless looping Veo (`omni_1p2`) MP4 over a `2x` Retina text-free poster frame.<br>• Wires live **Play/Pause**, **Scrubbing Progress Bar (`tabular-nums` timestamp)**, and **Mute/Unmute** controls directly to `videoRef.current` (guarded by `typeof videoRef.current?.play === 'function'` for JSDOM).<br>• Floating product spotlight cards on hero stages deep-link directly to the flagship PDP. |
| **`INT-02`** | **Sculptural Silhouette Filter & Multi-Finish Swatch Choreography** | • **Wandler** (`https://wandler.com/`)<br>• **Polène Paris** (`https://eng.polene-paris.com/`) | • Clicking filter pills (`All`, `Gesture`, `Cove`, `Trace`) updates the active pill state and highlights/filters matching catalog cards and comparison columns.<br>• Clicking circular color swatches (`Wine Pebbled`, `Cognac Smooth`, `Espresso Grain`, `Warm Sand`) updates the active swatch ring, finish subtitle, and `"Add to bag →"` payload. |
| **`INT-03`** | **3-Part Macro Material & Hardware Lightbox Study** | • **Polène Paris** (`https://eng.polene-paris.com/`)<br>• **Loewe** (`https://www.loewe.com/`) | • 3-column or 4-column macro triads (*The form / detail / inside*, *Follow the cut*, *Refine the contact points*) scale subtly (`scale(1.02)`) on hover and open a high-resolution **Macro Inspection Drawer / Lightbox** with full craft and material specifications on click. |
| **`INT-04`** | **Side-by-Side Specification Comparison Matrix** | • **Manu Atelier** (`https://www.manuatelier.com/`)<br>• **Celine** (`https://www.celine.com/`) | • 3-column comparison table (`Opening`, `Strap`, `Best for`, `Dimensions`) highlights the hovered or selected silhouette column and routes `"View details →"` directly to the corresponding PDP or silhouette specification drawer. |
| **`INT-05`** | **6-Angle Vertical PDP Gallery & Live Buy Box** | • **Jacquemus** (`https://www.jacquemus.com/`)<br>• **Polène Paris** (`https://eng.polene-paris.com/`) | • Clicking any of the 6 vertical thumbnails (or up/down gallery chevrons) swaps the main PDP stage across 6 distinct `2x` Retina views.<br>• Color swatches, quantity stepper (`- 1 +`), and dynamic price CTA (`"Add to bag → $480"`) stay synchronized with the global Shopping Bag. |
| **`INT-06`** | **Architectural Dimension Diagram & `cm / in` Unit Toggle** | • **Celine** (`https://www.celine.com/`)<br>• **Polène Paris** (`https://eng.polene-paris.com/`) | • Displays exact dimension lines (`30 cm × 22 cm × 10 cm`) over the studio product photograph alongside a structured specification table, with an interactive `cm / in` (`g / oz`) unit toggle. |
| **`INT-07`** | **Synchronized Dual-Mode Shopping Bag (`Inline Card + Slide-Over Drawer`)** | • **Jacquemus** (`https://www.jacquemus.com/`) | • Maintains a single source of truth for cart items (`INITIAL_CART_ITEMS` starting with `1 × Flagship Item` at `t=0`).<br>• Any quantity change (`- 1 +`), removal, or `"Add to bag →"` action updates both the inline *Your bag (1)* card on Collection/PDP pages AND the slide-over Bag Drawer opened from the top navigation bar. |
| **`INT-08`** | **Editorial Lookbook Carry-Mode Switcher & Journal Reader** | • **Khaite** (`https://khaite.com/`)<br>• **Aesop** (`https://www.aesop.com/`) | • Clicking lookbook portraits (*Ways of wearing the same thought*) switches active carry-mode notes (*Short Shoulder*, *Relaxed Courtyard*, *Under-Arm / Cross-Body*).<br>• Clicking journal cards (*Studies in leather and light*) opens a full long-form **Editorial Essay Reader Modal**. |
| **`INT-09`** | **Zero-Jitter Specification & FAQ Accordions** | • **Aesop** (`https://www.aesop.com/`) | • Expandable specification rows (*Delivery & returns*, *Product details*, *Materials & care*, *Need help?*) and 5-row FAQ accordions (*A few useful answers*) expand/collapse smoothly on click while remaining collapsed at `t=0` to preserve exact 4K reference heights. |
| **`INT-10`** | **Smooth-Scroll Chapter Index (`01`–`07`) & 3-Step Atelier Repair Concierge** | • **Aesop** (`https://www.aesop.com/`)<br>• **Loewe** (`https://www.loewe.com/`)<br>• **Hereu Studio** (`https://hereustudio.com/`) | • Clicking any numbered chapter in the Care *On this page* index (`01 Daily care` .. `07 Delivery & returns`) smoothly scrolls to and highlights that care section.<br>• Clicking *Ask about a repair (`1. Get in touch → 2. Our advice → 3. Send your piece`)* or *Find the right next step* opens the interactive **Atelier Repair & Client Care Concierge Drawer**. |

---

## 2. The `t=0` Visual-Lock Contract (`s_total >= 0.93+`)

Every interaction planned in `INTERACTION_PLAN.md` must obey the **`t=0` Visual-Lock Contract**:
1. **Default State Matches the 4K Slice 1:1**:
   - At initial render (`t=0`, before any click or hover), active filter pills default to `All`, active swatches default to the primary 4K colorway (`Wine`), inline shopping bag cards default to the exact 4K item count (`1 × Gesture = $480`), and accordions/modals/drawers default to their 4K initial state.
2. **No Double-Rendered Raster Text**:
   - Any photographic plate that carries live HTML overlay text (`Hero`, `Courtyard Video`, `Studio Craft Banner`) must have its baked-in raster text stripped via `gempix-1` at `2x` Retina resolution so live typography never collides with ghosted raster text.
3. **Zero Layout Jitter on Hover**:
   - Hover states use `transform: scale(1.02)` inside `overflow-hidden` frames, `border-color` transitions, or underline offsets — never changing box dimensions or pushing sibling rows down at `t=0`.
