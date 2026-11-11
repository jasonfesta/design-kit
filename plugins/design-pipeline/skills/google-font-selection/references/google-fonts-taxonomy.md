# Google Fonts Official Tag Taxonomy & URL Grammar

This reference documents the data that `google-font-selection` v2 ranks against. **None of it is invented by this skill** — it is Google's own, maintained in the `google/fonts` repository and surfaced as the *Feeling* / *Appearance* filters on fonts.google.com.

## 1. Sources (both public, no API key)

| Source | What it gives | Refresh |
| :--- | :--- | :--- |
| `https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv` | `Family,Tag,Score` rows — every family scored 0–100 against 74 tags (≈34,000 rows) | fetched live by `scripts/gf_live.py` |
| `https://fonts.google.com/metadata/fonts` | category, variable axes (`tag/min/max`), weights, italics, popularity, subsets, primary script | fetched live |
| `https://www.googleapis.com/webfonts/v1/webfonts?key=…` | official Developer API alternative for metadata (set `GOOGLE_FONTS_API_KEY`) | optional |

Nothing is checked in: the catalog is fetched at run time (6-hour temp cache; `--fresh` bypasses it). Families without Latin, Noto families, color fonts, and non-Latin primary-script regional variants are excluded from ranking.

## 2. The 74 official tags

| Namespace | fonts.google.com dimension | Tags |
| :--- | :--- | :--- |
| `/Expressive/…` (20) | **Feeling** | Active, Artistic, Awkward, Business, Calm, Childlike, Competent, Cute, Excited, Fancy, Futuristic, Happy, Innovative, Loud, Playful, Rugged, Sincere, Sophisticated, Stiff, Vintage |
| `/Sans/…` | Appearance | Geometric, Glyphic, Grotesque, Humanist, Neo Grotesque, Rounded, Superellipse |
| `/Serif/…` | Appearance | Didone, Fat Face, Humanist Venetian, Modern, Old Style Garalde, Scotch, Transitional |
| `/Slab/…` | Appearance | Clarendon, Geometric, Humanist |
| `/Script/…` | Appearance | Formal, Handwritten, Informal, Upright Script |
| `/Monospace/Monospace` | Appearance | — |
| `/Theme/…` | Appearance | Art Deco, Art Nouveau, Blackletter, Blobby, Brush, Distressed, Inline, Medieval, Pixel, Shaded, Stencil, Techno, Tuscan, **Wacky**, Woodtype |
| `/Seasonal/…` | Appearance | Christmas, Diwali, Halloween, Hanukkah, Holi, Kwanzaa, Lunar New Year, Valentine's Day |
| `/Purpose/…` | Appearance | Easy Reading, Learn To Write |
| `/Special use/…` | Appearance | Barcode, Redaction, Symbols |
| `/Quality/…` | (internal) | Concept, Drawing, Spacing, Wordspace — used only as a small quality nudge |

Useful facts when translating:
- `/Expressive/Sophisticated` is dominated by **formal scripts** (Pinyon Script, Ballet…). For "luxury serif" lean on `/Serif/Didone` or `/Serif/Old Style Garalde` with a `serif` category gate.
- `/Expressive/Cute` is small (~17 families ≥ 70): Chewy, Sniglet, Crafty Girls, Chango…
- `/Theme/Wacky` ≥ 70 ≈ 40 families: Kablammo, Kranky, Mystery Quest, Nosifer, Jolly Lodger, Original Surfer, Eater, Danfo…
- `/Theme/Techno` ≈ "y2k / cyber / sci-fi": Audiowide, Quantico, Zen Dots, Orbitron, Turret Road.
- `/Theme/Pixel` ≈ "8-bit / arcade": Press Start 2P, Bitcount, Silkscreen, VT323, Handjet.

## 3. fonts.google.com URL grammar (what `google_fonts_url` emits)

```
https://fonts.google.com/?categoryFilters=<Dimension>:<url-encoded tag>[;<Dimension>:<tag>...]
  Feeling:%2FExpressive%2FPlayful
  Appearance:%2FTheme%2FWacky
  Appearance:%2FSerif%2FDidone
https://fonts.google.com/?query=<text>          # plain search fallback
https://fonts.google.com/specimen/<Family+Name>  # specimen page
```

## 4. Brief schema (LLM association output → ranker input)

```json
{
  "query": "spooky carnival",
  "modality": "text | image",
  "tags":       {"/Seasonal/Halloween": 1.0, "/Theme/Tuscan": 0.7, "/Expressive/Loud": 0.4},
  "avoid_tags": {"/Expressive/Cute": 0.8, "/Expressive/Business": 0.6},
  "category":   [],
  "rationale":  "…",
  "confidence": 0.9
}
```
`validate_brief` drops any tag not in the 74 (reported under `dropped_tags`), clamps weights to 0–1, and sets `confidence` to 0 when no tags survive.

## 5. Ranking formula (Layer 2, deterministic)

```
fit      = Σ w_t · score_t / 100  ÷ Σ w_t          (weighted mean over requested tags)
primary  = max score among tags within 0.05 of the top weight ÷ 100
clash    = Σ a_t · score_t / 100  ÷ Σ a_t          (avoid tags)
score    = 0.50·fit + 0.30·primary − 0.25·clash + 0.08·quality + axes(≤0.06) + popularity(≤0.04) − variant penalty
tier     = 1 if primary ≥ 0.70 else 0              (strong primary evidence always ranks first)
dedupe   = one result per family root (X, X SC, X Condensed, X Guides collapse)
```

Confidence: `high` when translation confidence ≥ 0.6 and the #1 family scores ≥ 70 on a requested tag with primary ≥ 60 (or fit ≥ 55); `medium` on partial evidence; `low` when no tag could be inferred — reported as `status: low_confidence`, never as a PASS.

## 6. Download & self-host methods emitted per font

1. `npm install @fontsource[-variable]/<slug>`
2. `curl` the CSS2 URL → first `.woff2` from `fonts.gstatic.com`
3. `https://github.com/google/fonts/tree/main/ofl/<familycompact>` (`.ttf` sources)
4. `https://gwfh.mranftl.com/api/fonts/<slug>?download=zip&subsets=latin&formats=woff2`
