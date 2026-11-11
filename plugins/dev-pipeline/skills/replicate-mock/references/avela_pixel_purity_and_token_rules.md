# Pixel Purity, Unboxed Silhouette Grounding & Exact Token Audit (AVELA Reference)

This reference codifies how `replicate-mock`'s **8 Core Pixel-Perfection Directives** apply to warm editorial luxury homepages such as **AVELA / Soft Form (`01-website-avela`)**.

---

## 1. Exact Color & Surface Token Extraction Rules

Always sample hex tokens directly from the approved desktop and mobile masters (`desktop-01-avela.png` & `mobile-01-avela.jpg`) rather than guessing warm-beige approximations:

| Token | Sampled Hex | Visual Purity Invariant |
| :--- | :--- | :--- |
| `--surface-cream` | `#FBF6EE` | Primary warm ivory page ground. Freestanding bag silhouettes (`The Arc`, `The Fold`, `The Day`) must blend seamlessly onto `#FBF6EE` with **zero card borders, drop shadows, or grey boxes**. |
| `--surface-blue` | `#A9C2D1` | Pale coastal blue field for `A08` Newsletter (`"A longer story, in your inbox."`); never flatten to beige. |
| `--surface-oxblood` | `#5B2221` | Full-bleed dark oxblood footer (`A09`). |
| `--ink-burgundy` | `#541D1D` | Editorial serif display headings (`Forms for every day.`, `Shaped by hand.`, etc.). |
| `--ink-dark` | `#231B18` | Product names, disclosure summaries (`What fits`, `Leather care`, `Repairs`), and inline directional links. |
| `--accent-olive` | `#47462A` | Newsletter CTA fill (`Join the atelier`) with `#FAF3E8` label. |
| `--border-hairline` | `#DFD5C7` | `1px` hairline dividers on care disclosures and form inputs. |

---

## 2. Anti-Hallucination & Mock Purity Checklist (Check `C8`)

When auditing a rendered React build against the source mock:
- **Zero Debug / Scroll HUDs**: Never add floating section counters (`SEC 01/09 · 0%`), progress pills, or viewport badges unless tagged `gt-eval-hide` or explicitly present in the mock.
- **Zero Unrequested Media Chrome**: Never add video timestamp pills (`16:02`), below-frame audio scrubbers (`0:03`), or hover-hint badges (`Inspect 1/6`) that do not exist in the reference image.
- **Directional Arrow Fidelity (`↗` vs. `→`)**: Preserve exact directional glyphs per authority (`Meet the Arc ↗` on desktop vs. `Meet the Arc →` on mobile; `Notes from the workshop →` on mobile).
- **Bit-for-Bit Photographic Plates vs. Pure Vector Typography**: Extract/restore photographic regions at `2x` Retina with zero baked-in raster headlines so live HTML/CSS vector typography never double-renders over ghosted pixels.
