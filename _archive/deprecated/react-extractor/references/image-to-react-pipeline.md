# Image-to-React Extraction Pipeline (`react-extractor`)

This reference guide details **Mode A** of the `react-extractor` skill: extracting a complete, interactive **Google Golden Template** React 19 + Vite 7 + Tailwind v4 application from a static image (screenshot, UI mockup, Figma frame export, or photographic design reference).

---

## 1. Visual Inspection & Grid Decomposition

1. **Inspect the Source Image**:
   - Always call `read_file` on the target image path first.
   - Identify the **functional category** of the image to assign its normalized folder slug:
     - `01-website-<descriptor>` (`Website Landing Page — <Title>`)
     - `07-ui-<descriptor>` (`UI Component — <Title>`)
     - `13-mobile-app-<descriptor>` (`Mobile App UI — <Title>`)
     - `19-chat-ui-<descriptor>` (`Chat UI — <Title>`)
2. **Measure Proportions & Spatial Hierarchy**:
   - **Container Geometry**: Note the aspect ratio (e.g., `16:10` desktop landing page, `420×840` mobile app frame, or compact floating card), outer padding, border radius, and grid columns.
   - **focal Point & Negative Space**: Preserve at least 25–35% open breathing room (`--surface`) so cards and typography do not collapse into a cramped box wall.

---

## 2. Perceptual Color & Semantic Token Extraction

Extract 8 semantic CSS custom properties from the image and declare them in `src/index.css` under `:root`:

| Token | Role | Extraction Rule |
| :--- | :--- | :--- |
| `--surface` | Primary page/canvas background | Dominant background tone of the image |
| `--surface-raised` | Elevated card, sheet, or modal surface | 4–8% lighter (in light themes) or 5–8% higher luminance (in dark themes) than `--surface` |
| `--ink` | Primary headline and body text | High-contrast ink tone (`>= 4.5:1` WCAG AA contrast against `--surface`) |
| `--muted` | Secondary labels, captions, metadata | Mid-tone ink (`>= 3.2:1` contrast against `--surface`) |
| `--accent` | Primary interactive CTA, active pill, key highlight | Signature chromatic accent from the image |
| `--accent-alt` | Secondary accent, badge tint, gradient stop | Complementary warm/cool secondary tone |
| `--on-accent` | Text/icons placed on top of `--accent` | Crisp cream or deep ink (`>= 4.5:1` against `--accent`) |
| `--border` | Hairline dividers and card outlines | Subtle `1px` tonal border (`color-mix(in srgb, var(--ink) 14%, var(--surface))`) |

---

## 3. Typography Pairing & Scale

Map the typography seen in the image to three semantic font helpers in `src/index.css`:
- **Display / Editorial Headlines (`.font-serif-display`)**: `'Instrument Serif'`, `'Fraunces'`, `'Playfair Display'`, or `'Newsreader'` with tight tracking (`-0.02em` to `-0.035em`) and crisp line-height (`0.98` to `1.12`).
- **UI & Body Copy (`.font-grotesk`)**: `'Plus Jakarta Sans'` or `'Inter'` with comfortable reading line-height (`1.45` to `1.65`).
- **Technical Metadata, Kickers & Numerals (`.font-mono-tech` + `.tabular-nums`)**: `'JetBrains Mono'` with uppercase tracking (`0.08em` to `0.14em`) and `font-variant-numeric: tabular-nums`.

---

## 4. Turning Static Image Affordances into Live React State

Every visual element in the reference image must work interactively in the extracted React app:
1. **Navigation Bars & Header Links**: Clicking any nav item opens a contextual dropdown drawer, switches the active sub-view, or smooth-scrolls to the corresponding below-the-fold section.
2. **Segmented Tabs, Pills & Swatches**: Clicking any pill or color swatch updates active state in `src/App.tsx`, dynamically filtering cards, updating hero imagery/grading, or switching metrics.
3. **Cards & List Rows**: Clicking any card opens a rich detail modal/drawer or expands inline details.
4. **Forms, Sliders & Composers**: All inputs, range sliders, toggles, and prompt composers must be controlled React inputs with live calculation readouts and confirmation toasts.

---

## 5. Below-the-Fold Synthesis for Website Landing Pages (`01-website-*`)

When extracting a Website Landing Page from an above-the-fold screenshot or hero image, synthesize **4 cohesive below-the-fold sections** in `src/components/<Brand>BelowFoldSections.tsx` with **zero style drift**:
1. **Section 01 — Interactive Collection / Product / Feature Grid**: Filterable 3-card or 4-card grid with live configuration pills and detail modal triggers.
2. **Section 02 — Editorial Split / Architecture / Process Deep-Dive**: Asymmetric 2-column visual + chapter-tabbed specification breakdown.
3. **Section 03 — Interactive Comparison / Timeline / Metric Simulator**: Stepper or interactive gauge panel demonstrating measurable domain outcomes.
4. **Section 04 — Editorial Footer & Location/Action Directory**: Brand wordmark, interactive studio/region cards, newsletter or booking drawer trigger, and quick-jump links.
