# Button Padding, Micro-Spacing & Equal Grid Layout Rules

This reference codifies the non-negotiable micro-layout, button padding, and equal grid geometry rules lifted from:
- [`//search/devai/agentic/labs/skills/sds/sds_measurement_verifier`](file:///google/src/files/head/depot/google3/search/devai/agentic/labs/skills/sds/sds_measurement_verifier/SKILL.md) (Universal Interactive Element & Button Rule, Horizontal Multi-Tile Verification)
- [`//prototypes/projects/agentic_design_loop/skills/screenshot_to_html`](file:///google/src/files/head/depot/google3/prototypes/projects/agentic_design_loop/skills/screenshot_to_html/SKILL.md) (`references/css_synthesis_invariants.md`, `references/spatial_budgeting.md`)
- [`//prototypes/projects/cruxy/skills/html_to_search_vibes`](file:///google/src/files/head/depot/google3/prototypes/projects/cruxy/skills/html_to_search_vibes/SKILL.md) (`references/component_synthesis_rules.md`)
- [`/usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating`](file:///usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating/src/App.tsx) (`Kismet` canonical Golden Template)

---

## 1. Universal Button, Pill & Chip Padding Invariants

One of the most common failure modes in Image-to-React synthesis is cramped, off-center, or asymmetrically padded buttons and pills. Every interactive control (`<button>`, `<a>` pill, filter tab, action chip, or segmented control) MUST obey these five rules:

### Rule 1.1 — Symmetrical Horizontal & Vertical Padding
- **Pure Text Buttons / Pills**: Left and right padding must be strictly equal (`paddingLeft === paddingRight`, e.g. `px-4` = `16px` left & right, or `px-5` = `20px` left & right). Top and bottom padding must be strictly equal (`paddingTop === paddingBottom`, e.g. `py-2` = `8px` top & bottom, or `py-2.5` = `10px`).
- **Buttons with a Leading Icon (`[Icon + Label]`)**: Either use equal horizontal padding (`px-4`) with `inline-flex items-center justify-center gap-2`, or apply a deliberate optical tuck on the icon side (`pl-3.5 pr-4` — never more than `2px–4px` difference, and never narrower on the text side).
- **Buttons with a Trailing Icon (`[Label + Arrow]`)**: Use `pl-4 pr-3.5` or symmetric `px-4` with `inline-flex items-center justify-center gap-2`.
- **Square / Circular Icon-Only Buttons**: Must have explicit equal width and height (`w-9 h-9` or `w-10 h-10`), `p-0`, `inline-flex items-center justify-center shrink-0`, and an SVG icon with explicit `w-4 h-4` or `w-5 h-5`.

### Rule 1.2 — Standard Golden Template Button Size Tiers
Always snap button geometry to the tier that matches the comp's measured bounding box height:

| Tier | Target Height | Tailwind Classes | Min Horizontal Pad | Icon-Text Gap | Font Spec |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **XS Badge / Status Pill** | `24px–26px` | `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full` | `10px` (`px-2.5`) | `6px` (`gap-1.5`) | `text-[11px] font-medium leading-none whitespace-nowrap` |
| **SM Action Chip / Filter Tab** | `32px–36px` | `inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full` | `14px` (`px-3.5`) | `8px` (`gap-2`) | `text-xs font-medium leading-none whitespace-nowrap` |
| **MD Primary / Secondary Button** | `40px–44px` | `inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl` | `20px` (`px-5`) | `8px` (`gap-2`) | `text-sm font-medium leading-none whitespace-nowrap` |
| **LG Hero CTA Button** | `48px–52px` | `inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl` | `24px` (`px-6`) | `10px` (`gap-2.5`) | `text-sm font-semibold leading-none whitespace-nowrap` |

### Rule 1.3 — Single-Line Label Lock (`whitespace-nowrap`)
- Button, pill, and tab labels must **never** wrap onto two lines unless the reference image explicitly depicts a multi-line tile button. Always include `whitespace-nowrap` and `leading-none` (or `leading-tight`) so font-metric ascenders/descenders do not skew vertical centering.

### Rule 1.4 — Top & Down/Bottom Container Clearance (Lifted from `sds-measurement-verifier`)
- Every interactive button or action bar inside a card must maintain **both**:
  - **Top clearance**: $\ge 12\text{px}$ (`mt-3` or `pt-3`) below the preceding body text or metadata row.
  - **Down/Bottom clearance**: $\ge 12\text{px}$–$24\text{px}$ (matching the card's bottom padding `pb-5` or `p-6`) between the button's bottom border and the parent card's bottom border. A button must never touch or clip against the bottom border of its card.

### Rule 1.5 — Sibling Button Row Alignment
- When two or more buttons sit side-by-side (e.g., `Pass` + `Send Spark` in `dating`, or `Cancel` + `Confirm`), wrap them in `flex items-center gap-2.5` (or `grid grid-cols-2 gap-3`) and ensure both buttons share the exact same rendered height ($\Delta h = 0\text{px}$) and vertical center ($\Delta y = 0\text{px}$).

---

## 2. Equal Grid Layout & Multi-Tile Geometry Invariants

When a comp displays a row or matrix of cards, tiles, metrics, or pricing tiers, visual reviewers immediately notice if one column is 12px wider than its neighbor or if card bottoms form a jagged staircase.

### Rule 2.1 — Equal-Width Grid Columns (`minmax(0, 1fr)`)
- Always define equal-width multi-column layouts using CSS Grid with `repeat(N, minmax(0, 1fr))` (Tailwind `grid grid-cols-2`, `grid-cols-3`, `grid-cols-4`):
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
    {items.map((item) => (
      <article
        key={item.id}
        className="h-full min-w-0 flex flex-col justify-between rounded-2xl p-6 border border-[#E6DFD5] bg-[#FAF6F0]"
      >
        <div>
          {/* Top header + badge + body copy */}
        </div>
        <div className="mt-auto pt-5">
          {/* Bottom-pinned footer / button row */}
        </div>
      </article>
    ))}
  </div>
  ```
- **Why `min-w-0` is mandatory**: Without `min-w-0` on grid/flex children, long unbroken strings, code snippets, or wide flex rows expand the track beyond `1fr`, breaking equal column widths.
- **Width Equality Tolerance**: Rendered widths of sibling cards in an equal-column row must match within $\Delta w \le 1\text{px}$.

### Rule 2.2 — Equal-Height Cards & Bottom Baseline Alignment (`items-stretch` + `mt-auto`)
- Sibling cards in a horizontal row almost always have slightly different body copy lengths (e.g., a 2-line description vs. a 3-line description).
- **Never** leave card heights determined solely by their text length when they sit in a grid row.
- Apply `items-stretch` on the grid container and `h-full flex flex-col justify-between` on each card `<article>`, with `mt-auto pt-4` on the card's footer/action zone.
- ** Result**:
  1. Every card in the row has the **exact same total height** ($\Delta h \le 1\text{px}$).
  2. Every card's bottom border sits on the **exact same horizontal baseline** ($\Delta y \le 1\text{px}$).
  3. Every card's bottom CTA button or metadata footer aligns horizontally across the entire row.

### Rule 2.3 — Uniform Inter-Card Gutters (`gap-*`)
- Horizontal and vertical gutters between sibling cards in a grid must be controlled by a single grid `gap-*` token (`gap-4` = `16px`, `gap-5` = `20px`, `gap-6` = `24px`), never by ad-hoc margins on individual cards.
- **Gutter Equality Tolerance**: Measured horizontal gaps between adjacent cards $(i, i+1)$ in a row and vertical gaps between rows $(r, r+1)$ must match within $\pm 1\text{px}$.

### Rule 2.4 — Internal Card Padding Symmetry
- All sibling cards in the same tier must share the exact same internal padding (`p-5` = `20px` or `p-6` = `24px` on all four sides).
- Do not mix `p-4` on one card and `p-6` on its neighbor in the same grid row.

### Rule 2.5 — Discontinuous Hairline Grid Spines (`DISCONTINUOUS_GUTTER_SPLIT`)
- When a reference comp uses `1px` hairline dividers between columns or bento cells (editorial newspaper/dossier layouts or border-grid dashboards):
  - Either use a `1px` gap backdrop (`bg-border p-px gap-px grid grid-cols-3` where each cell has `bg-surface p-6`), **or**
  - Place an explicit `<div className="hidden lg:block w-px bg-[#E6DFD5] self-stretch shrink-0" />` between two `flex-1 min-w-0` column stacks inside a section container so the vertical hairline stops cleanly above full-width section banners.

---

## 3. Spatial Budgeting & Anti-Truncation Rules

1. **No Fixed Heights on Text Containers**:
   - Never apply fixed pixel heights (`h-[180px]`) combined with `overflow-hidden` on cards containing text and buttons. Let the tallest card in the grid row dictate the row height via CSS Grid `items-stretch`, and give media slots an aspect ratio (`aspect-[16/10]`, `aspect-[4/5]`, `aspect-square`) or `min-h-[...]`.
2. **Tabular Numerals (`tabular-nums`)**:
   - Every price, percentage, counter, timer, coordinate, or metric table cell must include `tabular-nums` so columns of numbers align vertically to the pixel.
3. **Aspect-Locked Media Crops**:
   - Wrap every card image in an `overflow-hidden rounded-xl aspect-[...]` container with `w-full h-full object-cover` on the `<img>` so differing source image dimensions never skew card heights.
