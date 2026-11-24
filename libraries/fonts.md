# Fonts, foundries & type tooling

Where to get type (free APIs, libre foundries, indie/commercial foundries), how to self-host it, and the tooling for subsetting, variable fonts, metrics and fallbacks. Pairs with the `google-font-selection` and `font-pairing` skills.

- **Golden Template default:** Google Fonts via CSS2 `<link>` in `index.html` (or `@fontsource-variable/*` when self-hosting), roles wired as Tailwind tokens (see `font-pairing`).
- **API / MCP column:** ✅ = documented HTTP API; 🤖 = agent-usable in this kit (skill or MCP). No foundry here ships an official MCP server as of late 2026; the kit's `google-font-selection` skill wraps Google's live catalog.
- Check licenses before shipping: OFL = free for commercial use & embedding; "free for personal" ≠ free for client work.

**Count: 73 entries.**

---

## 1. Free catalogs & delivery APIs

| Name | URL / package | License | What it's for | API / MCP | Maturity | When to pick | Install / embed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Fonts — CSS2 API** | fonts.googleapis.com/css2 | OFL / Apache (per family) | ~1,950 families; variable axes via `wght@100..900`, `ital,opsz`, `display=swap`, `text=` subsetting | ✅ 🤖 (`google-font-selection`) | ★★★ | Default embed for Golden Template | `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">` |
| **Google Fonts Developer API** | googleapis.com/webfonts/v1/webfonts?key= | — | JSON list of families, variants, axes, files; `capability=VF`, `sort=popularity` | ✅ (API key) | ★★★ | Programmatic catalog queries | `curl "https://www.googleapis.com/webfonts/v1/webfonts?key=$KEY&capability=VF"` |
| **google/fonts repo + tags** | github.com/google/fonts (`tags/all/families.csv`, `METADATA.pb`) | OFL | Source files + official Feeling/Appearance tag scores (used by `google-font-selection`) | ✅ (raw GitHub) 🤖 | ★★★ | Ranking by mood | `git clone --depth 1 https://github.com/google/fonts` |
| **Google Fonts Knowledge** | fonts.google.com/knowledge | — | Type education (variable fonts, pairing, legibility) | — | ★★★ | Learning / rationale | web |
| **Material Symbols font** | fonts.google.com/icons | Apache-2.0 | Variable icon font | ✅ CSS2 | ★★★ | See [icons.md](icons.md) | CSS2 link |
| **Fontsource** | fontsource.org · `@fontsource/*` · `@fontsource-variable/*` | per family (mostly OFL) | Self-hosted npm packages for 1,800+ Google + open fonts; CDN + API | ✅ api.fontsource.org | ★★★ ~6k★ | Self-hosting in Vite (privacy, offline, no FOUT from 3rd party) — installed in WDA | `npm i @fontsource-variable/inter` → `import '@fontsource-variable/inter'` |
| **Bunny Fonts** | fonts.bunny.net | per family | GDPR-friendly, drop-in Google Fonts CSS API replacement (no logging) | ✅ (Google-compatible URLs) | ★★ | EU privacy without self-hosting | `<link href="https://fonts.bunny.net/css?family=inter:400,700">` |
| **Fontshare (Indian Type Foundry)** | fontshare.com | ITF Free Font License (free commercial) | 100+ quality families: Satoshi, General Sans, Clash Display, Cabinet Grotesk, Switzer, Supreme, Gambetta, Zodiak, Erode | ✅ api.fontshare.com/v2/css | ★★★ | Premium-feeling free display/grotesk faces | `<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">` |
| **Adobe Fonts (Typekit)** | fonts.adobe.com | Creative Cloud license | 25k+ fonts via kit embed | ✅ (Typekit API) | ★★★ | Teams with CC licenses | kit `<link>` |
| **Font Squirrel** | fontsquirrel.com | free commercial | Curated free fonts + Webfont Generator | — | ★★ (dated) | Converting/subsetting legacy fonts | web |
| **The League of Moveable Type** | theleagueofmoveabletype.com | OFL | Classic open fonts (League Spartan, Ostrich) | — | ★★ | Libre classics | download |
| **Open Foundry** | open-foundry.com | OFL | Curated open-source display/text | — | ★★ | Editorial libre fonts | download |
| **Fonts Arena / Befonts** | fontsarena.com | mixed | Free font aggregators | — | ★ | Discovery (verify licenses) | — |

## 2. Libre / experimental foundries (free, design-forward)

| Name | URL | License | What it's for | API / MCP | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Velvetyne (VTF)** | velvetyne.fr | OFL | Radical libre display faces (Ouroboros, Basteleur, Sligoil, Mess, Compagnon, Lack) | — | ★★★ | Experimental, brutalist, art-school display | download / GitLab |
| **Collletttivo** | collletttivo.it | OFL | Italian libre collective (Mazius, Ductus, Raleigh-esque display, Necto Mono, Ronzino, Apoc) | — | ★★ | Characterful editorial display | download |
| **uncut.wtf** | uncut.wtf | mixed (each typeface links to its license) | Curated catalog of free/libre contemporary typefaces (sans, serif, mono, display) | — | ★★ | Discovering free non-Google display faces | per typeface |
| **Atipo Foundry** | atipofoundry.com | Pay-what-you-want (incl. €0) commercial | Spanish foundry: Bluu Next, Calendas Plus, Brasika, Geomanist (partly) | — | ★★ | Elegant serifs on a budget | download |
| **Use & Modify** | usemodify.com | OFL / libre | Curated libre fonts (by Raphaël Bastide) | — | ★★ | Libre experimental | download |
| **Badass Libre Fonts by Womxn** | design-research.be/by-womxn | OFL | Libre fonts by women designers | — | ★ | Libre display variety | download |
| **Tunera Type Foundry** | tunera.xyz | OFL | Libre display/text | — | ★ | Unusual libre faces | download |
| **Fontain / Republi.sh libre** | republi.sh | OFL | Libre fonts | — | ★ | Variety | download |
| **Departure Mono / Commit Mono / Monaspace / JetBrains Mono / Iosevka / Berkeley (paid)** | departuremono.com · commitmono.com · monaspace.githubnext.com · jetbrains.com/lp/mono | OFL (Berkeley paid) | Modern monospace families (Monaspace has texture healing, 5 superfamilies) | — | ★★★ | Code, data, terminal aesthetics | download / `@fontsource` |
| **Vercel Geist / Geist Mono / Geist Pixel** | vercel.com/font · `geist` | OFL | Swiss-inspired sans + mono (+ pixel variants) | ✅ via Google Fonts & npm | ★★★ ~4k★ | Developer-tool / Vercel aesthetic | `npm i geist` or Google Fonts `Geist` |
| **Inter / Inter Display (v4)** | rsms.me/inter · `@fontsource-variable/inter` | OFL | Workhorse UI sans with `opsz`, tabular nums, ss/cv features | ✅ Google Fonts | ★★★ ~19k★ | Default UI text (use Inter Display ≥ 24px) | Google Fonts CSS2 `Inter:opsz,wght@14..32,100..900` |
| **IBM Plex** | `@ibm/plex` | OFL | Sans, Serif, Mono, Condensed, Sans Arabic/Devanagari/JP/KR… | ✅ Google Fonts | ★★★ | Systematic multi-script families | `npm i @ibm/plex` |
| **Mona Sans / Hubot Sans** | github.com/github/mona-sans | OFL | GitHub's variable sans with width axis | ✅ Google Fonts | ★★ | Expressive width animations | Google Fonts |
| **Instrument Sans / Serif** | Google Fonts | OFL | Contemporary editorial pairing | ✅ | ★★ | Editorial landing pages | Google Fonts |
| **Bricolage Grotesque / Fraunces / Newsreader / Onest** | Google Fonts | OFL | Characterful variable families (already in WDA `@fontsource`) | ✅ | ★★ | Warm editorial / brand | `@fontsource-variable/*` |
| **Recursive / Roboto Flex / Anybody** | Google Fonts | OFL | Many-axis variable showcases (CASL, MONO, GRAD, wdth) | ✅ | ★★ | Animating type axes | Google Fonts |
| **Uncut Sans / General Sans alternatives via Fontshare** | fontshare.com | ITF FFL | Free grotesks | ✅ | ★★ | Satoshi-like crispness | Fontshare API |

## 3. Indie & commercial foundries (license required; most offer free trial fonts)

| Name | URL | License | Known for | API / MCP | When to pick |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pangram Pangram Foundry** | pangrampangram.com | Free personal (trial) / paid commercial | Neue Montreal, PP Editorial New, PP Mori, Neue Machina, Formula, Object Sans, Fragment, Right Grotesk | — | Awwwards-style editorial/grotesk; download free for comps, license for ship |
| **Displaay Type Foundry** | displaay.net | Free trials / paid | Martina Plantijn, Glyphe, Reckless-like serifs, Brut Grotesque, Saans-adjacent styles | — | Refined Czech serif/sans for premium brands |
| **Dinamo** | abcdinamo.com | trials / paid | ABC Diatype, ABC Favorit, ABC Monument Grotesk, ABC Whyte, ABC Arizona, Oracle; Gradient variable tools | — | Contemporary tech/culture brands |
| **Klim Type Foundry** | klim.co.nz | paid | Söhne (OpenAI), Untitled Sans/Serif, Tiempos, Domaine, National 2, Founders Grotesk | — | Premium corporate/editorial |
| **Grilli Type** | grillitype.com | trials / paid | GT America, GT Walsheim, GT Super, GT Sectra, GT Maru, GT Flexa | — | Swiss contemporary brands |
| **Commercial Type** | commercialtype.com | paid | Graphik, Atlas, Lyon, Canela, Druk, Publico | — | Editorial / news |
| **Colophon Foundry** | colophon-foundry.org | paid / trials | Aperçu, Basis Grotesque, Raisonné, Monosten | — | Design studio aesthetic |
| **Production Type** | productiontype.com | paid / trials | Spectral (OFL on Google), Saol, Cosmica, Vtg Stencil | — | French elegance |
| **Swiss Typefaces** | swisstypefaces.com | paid | Euclid, Suisse Int'l, SangBleu | — | Swiss rationalist |
| **Lineto** | lineto.com | paid | Circular, Akkurat, Brown, Replica | — | Classic tech brand sans |
| **OH no Type Co** | ohnotype.co | paid | Obviously, Vulf Mono, Covik Sans, Degular | — | Playful expressive |
| **Future Fonts** | futurefonts.xyz | paid (early access discounts) | In-progress fonts from indie designers | — | Unique, affordable, evolving faces |
| **Tightype / Typelab / Monotype / Fontstand** | tightype.com · fontstand.com | paid / rental | Fontstand = monthly font rental incl. web | ✅ (Fontstand app) | Trying commercial fonts cheaply |
| **Fontwerk / Kilotype / Sharp Type / Blaze / Newlyn / Order** | various | paid | Contemporary display & text | — | Brand-specific searching |
| **Apple SF Pro / New York** | developer.apple.com/fonts | Apple license (Apple platforms only) | System UI | — | Mockups only; use `-apple-system`/`system-ui` stack on web |

## 4. Variable-font, subsetting & performance tooling

| Name | Package / URL | License | What it's for | Maturity | When to pick | Install |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **fontTools** (`pyftsubset`, `varLib.instancer`, `ttx`) | `pip install fonttools brotli` | MIT | Subset, convert to WOFF2, pin/limit variable axes, inspect tables | ★★★ ~4.5k★ | Shipping smallest self-hosted files | `pip install fonttools brotli` → `pyftsubset Font.ttf --unicodes="U+0000-00FF" --flavor=woff2 --layout-features='*'` |
| **glyphhanger** | `glyphhanger` | MIT | Crawl a site to find used glyphs, then subset (Zach Leatherman) | ★★ ~3k★ | Subsetting to exactly what's rendered | `npm i -g glyphhanger` |
| **subfont** | `subfont` | MIT | Post-build: auto-subset, inline `@font-face`, preload | ★★ ~1.5k★ | Static site font optimization | `npx subfont dist/index.html -i` |
| **Capsize** | `@capsizecss/core` `@capsizecss/metrics` | MIT | Trim leading so text boxes match cap height/baseline; fallback metric generation | ★★★ ~1.5k★ | Pixel-precise optical padding (pairs with optical-padding gates) | `npm i @capsizecss/core @capsizecss/metrics` |
| **Fontaine** | `fontaine` (unjs) | MIT | Auto-generate metric-matched fallback `@font-face` (`size-adjust`, `ascent-override`) to kill CLS | ★★ ~1.8k★ | Zero layout shift on font swap in Vite | `npm i -D fontaine` |
| **next/font** | `next/font/google` · `next/font/local` | MIT | Self-hosts Google fonts at build time + auto fallback metrics | ★★★ | Next.js projects | built into Next |
| **unplugin-fonts / vite-plugin-webfont-dl** | `unplugin-fonts` · `vite-plugin-webfont-dl` | MIT | Download/inline Google Fonts at build | ★★ | Vite self-hosting without manual work (good for singlefile builds) | `npm i -D vite-plugin-webfont-dl` |
| **Font Style Matcher** | meowni.ca/font-style-matcher | MIT | Visually tune fallback to match webfont | ★★ | Manual CLS tuning | web |
| **Wakamai Fondue** | wakamaifondue.com | — | "What can my font do?" – inspect features, axes, glyphs, generates CSS | ★★★ | Discover OpenType features (`ss01`, `tnum`, `cv11`) | web |
| **Axis-Praxis / v-fonts.com** | axis-praxis.org · v-fonts.com | — | Variable font playground & catalog | ★★ | Exploring variable fonts | web |
| **FontDrop! / fontgauntlet / Glyphs Mini** | fontdrop.info | — | Inspect font metadata/metrics | ★★ | QA on licensed fonts | web |
| **opentype.js** | `opentype.js` | MIT | Parse fonts in JS, get glyph paths (text → SVG) | ★★★ ~5k★ | Generative type, text-to-path for 3D | `npm i opentype.js` |
| **fontkit / harfbuzzjs** | `fontkit` · `harfbuzzjs` | MIT | Advanced shaping/metrics in JS/WASM | ★★ | Precise layout, canvas text | `npm i harfbuzzjs` |
| **Utopia** | utopia.fyi | — | Fluid type & space scales with `clamp()` | ★★★ | Responsive type scales | web |
| **Typescale / Type Scale** | typescale.com · typescale.net | — | Modular scale calculators | ★★ | Picking scale ratio | web |
| **Glyphs / FontLab / Fontra** | glyphsapp.com · fontra.xyz | paid / GPL | Font editors (Fontra = open-source browser editor) | ★★★ | Custom wordmarks / lettering | — |

## 5. Pairing, discovery & "in-use" references

| Name | URL | What it's for | When to pick |
| :--- | :--- | :--- | :--- |
| **google-font-selection (kit skill)** 🤖 | `plugins/design-pipeline/skills/google-font-selection` | Ranks live Google catalog by official mood tags; returns Top 5 + CSS2 | First stop for any mood → font |
| **Fonts In Use** | fontsinuse.com | Real-world typography archive searchable by typeface/industry | Seeing a face in context |
| **Typewolf** | typewolf.com | Site of the day, pairings, "best Google Fonts" lists | Contemporary web pairings |
| **Fontpair** | fontpair.co | Google Fonts pairings | Quick free pairs |
| **Fontjoy** | fontjoy.com | ML-generated pairings | Exploration |
| **Typ.io** | typ.io | Pairings scraped from live sites | Real usage pairs |
| **Pairings by Pimp my Type / Butterick's Practical Typography** | pimpmytype.com · practicaltypography.com | Pairing theory & rules | Rationale for critiques |
| **Typography for Lawyers → Practical Typography / Elements of Typographic Style Applied to the Web** | webtypography.net | Classic rules | Body text rhythm |
| **Font Review Journal / I Love Typography** | fontreviewjournal.com · ilovetypography.com | Deep reviews | Choosing premium faces |
| **Typeface Directory / Typecache** | typecache.com | Index of foundries & typefaces | Finding a foundry |
| **Fontcrafter / Fontbase / RightFont** | fontba.se · rightfontapp.com | Desktop font managers (Fontbase can activate Google Fonts) | Managing local fonts for comps |
| **Glyphs/Google "Variable fonts" guide** | web.dev/articles/variable-fonts | Implementation details | Engineering variable fonts |

---

## Quick recipes
```html
<!-- Google Fonts, variable, two roles (headline + body), preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:opsz,wght@14..32,100..900&display=swap" rel="stylesheet">
```
```css
/* Tailwind v4 tokens (src/index.css) */
@theme {
  --font-display: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```
```bash
# Self-host + subset a licensed font to Latin, WOFF2
pyftsubset PPNeueMontreal-Medium.otf --unicodes="U+0000-00FF,U+2000-206F,U+20AC" \
  --layout-features='kern,liga,tnum,ss01' --flavor=woff2 --output-file=neue-montreal-500.woff2
```
