# 08. Google Search Design System (`sds` v9.33.4 · Silk)

- **Google3 Depot Provenance**:
  - `//depot/google3/ux/tokens/design_systems/sds/SdsTheme.kt` (`SdsSysColor`, `SdsCompDataViz`, `SdsCompCodeSyntax`, `SdsCompSuggest`, `SdsCompBottomSheet`, `SdsCompReviewStars`)
  - `//depot/google3/ux/tokens/design_systems/sds/versions/v9_33_4/`
  - `//depot/google3/search/design_systems/` & `//depot/google3/ux/tokens/design_systems/aimode/`
- **Internal Documentation**: go/sds · go/search-design-system
- **Local Assets**: [`tokens.css`](./tokens.css) · [`specimen.html`](./specimen.html) · [`desktop.png`](./desktop.png) (`1440×900 @2x`) · [`mobile.png`](./mobile.png) (`390×844 @2x`)

---

## 1. Visual & Structural DNA

**Google Search Design System (`sds` / Silk)** is Google's highest-QPS consumer and enterprise knowledge-retrieval system, engineered for **instant visual scannability, grounded citations, structured Knowledge Panels, and interactive Onebox data cards**:

1. **Pill Omnibox + Zero-Latency Filter Carousel**: Elevated `46px` pill query bar (`--sds-elevation-searchbar`) paired with horizontal facet pills (`All`, `Cited Sources`, `Data Viz`, `Manuscripts`, `Code`) that switch views with zero layout shift.
2. **Tonal Cited Synthesis Container (`brand-surface-container`)**: Distinguishes AI/RAG synthesized answers (`#F0F4F9` light / `#1E2837` dark with `#C2D7F8` outline) from primary source documents, embedding inline clickable citation badges (`[1]`, `[2]`, `p. 42`).
3. **2-Column Result Stream + Knowledge Graph Entity Panel**: Pairs high-legibility left-column evidence cards and `SdsCompDataViz` sparkline/metric oneboxes with a `360px` right-hand structured **Entity / Artifact Dossier Panel** (`16px` card radius, `1px` `#DADCE0` dividers, `0% purple`).

---

## 2. Verbatim Google3 Token Reference (`SdsSysColor.kt` v9.33.4)

| CSS Custom Property | SDS Token | Light Hex | Dark Hex | Semantic Role |
| :--- | :--- | :---: | :---: | :--- |
| `--sds-sys-color-canvas` | `sds.sys.color.canvas` | `#FFFFFF` | `#1F1F1F` | Primary Search / RAG knowledge canvas |
| `--sds-sys-color-surface-container` | `sds.sys.color.surface-container` | `#F1F3F4` | `#303134` | Filter chips, citation pills & neutral wells |
| `--sds-sys-color-brand-surface-container` | `brand.surface-container` | `#F0F4F9` | `#1E2837` | Grounded RAG / AI synthesis card fill |
| `--sds-sys-color-on-surface-emphasis` | `on-surface.emphasis` | `#1F1F1F` | `#F1F3F4` | Entity headlines & key onebox figures |
| `--sds-sys-color-on-surface-de-emphasis` | `on-surface.de-emphasis` | `#4D5156` | `#9AA0A6` | Snippets, breadcrumbs & source timestamps |
| `--sds-sys-color-on-surface-link-default` | `on-surface.link.default` | `#0B57D0` | `#8AB4F8` | Result titles & inline citation anchors |
| `--sds-sys-color-sentiment-positive` | `sentiment.positive` | `#146C2E` | `#81C995` | Verified citation confidence & positive delta |
| `--sds-sys-color-sentiment-negative` | `sentiment.negative` | `#B3261E` | `#F28B82` | Disputed claim / low-OCR confidence alert |

---

## 3. Ideal WDA Prompt Archetypes (`#01`–`#37`)

Select **Google Search SDS** whenever a prompt centers on cited RAG retrieval, archival OCR verification, entity dossiers, or fast multi-facet discovery:
- **`#25` Enterprise Multi-Tenant Knowledge Base & Cited RAG Platform**: Grounded `#F0F4F9` synthesis container, inline chunk citations, retrieval precision evals, and tenant filter pills.
- **`#20` Kuwaiti Historical Archival OCR & Evidence Analysis**: Manuscript snippet cards, dual Hijri/Gregorian metadata badges, and side-by-side entity dossier panels.
- **`#06` 1:N Biometric Retrieval** & **`#35` Off-Market Property Search**: Structured comparison oneboxes and instant filter carousels.
