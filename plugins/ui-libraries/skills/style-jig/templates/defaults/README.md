# `templates/defaults/` — 9 Style Taxonomy Folders & Multi-Donor Mapping

The Top Style Bar in `style-jig` is locked to **9 canonical folder-backed slots**:

1. **`clone`** — Base 1:1 structural and visual baseline (`styles/clone/`)
2. **`clean`** — High-whitespace architectural light/dark minimalism ([`clean/default.md`](clean/default.md))
3. **`grid`** — Exposed 1px Swiss structural hairlines & technical index coordinates ([`grid/default.md`](grid/default.md))
4. **`editorial`** — Literary serif headlines, warm archival paper, and monograph hierarchy ([`editorial/default.md`](editorial/default.md))
5. **`cinematic`** — True-neutral obsidian stage with warm amber key lighting & smoked glass ([`cinematic/default.md`](cinematic/default.md))
6. **`product`** — Concentric bento radii, micro-elevation, and operational telemetry signals ([`product/default.md`](product/default.md))
7. **`brutal`** — Stark 2px solid borders, 0px corners, hard offset shadows, and industrial display type ([`brutal/default.md`](brutal/default.md))
8. **`playful`** — Tactile pill geometry, bold ink outlines, and expressive display typography ([`playful/default.md`](playful/default.md))
9. **`retro`** — Classic desktop/CRT/8-bit/messenger/rack & analog print aesthetics ([`retro/default.md`](retro/default.md))

---

## How `styles/<slot>/` Resolution Works

When `init_style_jig.py` scaffolds a workspace, it creates `styles/<slot>/` for all 9 slots and copies the `default.md` files from this directory into `styles/clean/default.md` through `styles/retro/default.md`.

### 1. Fallback Mode (No Donor Images in `styles/<slot>/`)
If a `styles/<slot>/` folder contains no `.jpg`, `.jpeg`, `.png`, or `.webp` images, the Jig reads `styles/<slot>/default.md` (YAML frontmatter + prompt mandate) to style the interface.

### 2. Single or Multi-Donor Image Mode (`01-*.jpg` .. `05-*.jpg`)
If you drop one or more reference images into `styles/<slot>/`:
- `match_and_map_styles.py` and `init_style_jig.py` catalog all donor images in `styles/styles-manifest.json`.
- When a slot has multiple donor images (for example, `5` donor images in `styles/retro/` or `4` in `styles/product/`), `variant-notches.js` automatically displays the right-side vertically centered `16×16px` thumbnail squares (`1/5 .. 5/5`) with a `176×124px` hover preview card.
- Clicking any notch sets `data-style-variant="0..4"` on `<body>`, dispatches `CustomEvent('jig-style-variant')`, and posts `{ type: 'SET_STYLE_VARIANT', style, variant, label, file }` to all stage `<iframe>`s.

---

## `default.md` Frontmatter Schema

Every `default.md` file begins with machine-readable YAML frontmatter:

```yaml
---
slot: clean
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
radius_card: 14px
radius_control: 10px
---
```

> **Taste Guardrails**: Never use Material fonts (`Roboto`, `Google Sans`, `Product Sans`, `Noto Sans`) as application display/body fonts inside style slots, and never use purple/violet (`OKLCH 270°–330°`) tokens.
