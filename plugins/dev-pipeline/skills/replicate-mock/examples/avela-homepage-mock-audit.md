# Example: AVELA / Soft Form (`01-website-avela`) Mock-to-React Audit

## Source Authorities Audited
- **Desktop Authority**: `/google/data/rw/users/jf/jfesta/moodboards/homepage-study/images/desktop/01-avela.png` (`725 × 2170`)
- **Mobile Authority**: `/google/data/rw/users/jf/jfesta/moodboards/homepage-study/images/mobile/01-avela.jpg` (`390 × 3210`)
- **Target Golden Template Package**: `/google/data/rw/users/jf/jfesta/moodboards/index-7-moodboard/projects/01-website-avela/`

## 8-Directive Verification Summary

1. **Zero Hallucination (`PASS`)**: Zero card borders around `The Arc`, `The Fold`, and `The Day`; zero floating section HUDs; zero invented trust badges or stock counters.
2. **Zero Omission (`PASS`)**: All 10 touts (`A00` Campaign Hero through `A09` Oxblood Footer) accounted for on both Desktop and Mobile, including the mobile-specific `Notes from the workshop →` strip (`A07`) and 2-line `SOFT / FORM` hero masthead.
3. **Exact Visual Match (`PASS`)**: Exact `#FBF6EE` cream, `#A9C2D1` coastal blue, `#5B2221` oxblood footer, `#541D1D` burgundy serif, and `#47462A` olive button fill verified via `measure_px.py`.
4. **No Generic Placeholders (`PASS`)**: Authentic copy, prices (`$420`, `$360`, `$480`), and leather swatch hexes (`#641D1E`, `#B86F3B`, `#484729`, `#83817E`).
5. **Asset Recreation (`PASS`)**: Multi-swatch `2x` Retina hero and freestanding bag plates (`avelaAssets.ts`) with zero broken `<img>` references.
6. **Bit-for-Bit Asset Extraction (`PASS`)**: Cropped via `crop_regions.py` / `prepare-and-extract-image.py` and restored cleanly with zero semantic cartoon replacements.
7. **Perfect Text Reconstruction (`PASS`)**: Character-for-character copy parity across headings, captions, accordions (`What fits`, `Leather care`, `Repairs`), and footer columns.
8. **Vector-to-Vector Match (`PASS`)**: Crisp inline `<svg>` `AvelaBrandLogo.tsx`, `+` disclosure icons (`rotate(90deg)`), and directional arrows.
