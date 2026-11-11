# Nomenclature, Vendor-Neutrality & Optical Polish Rules (`golden-template`)

Every project extracted or maintained by `golden-template` is checked against these mandatory nomenclature and craft rules by [`lint-golden-template.mjs`](file:///usr/local/google/home/jfesta/skills/golden-template/scripts/lint-golden-template.mjs).

---

## 1. Mandatory Folder Slug & Title Nomenclature

1. **Four Allowed Category Prefixes Only**:
   - `<NN>-website-<descriptor>` → Title: `Website Landing Page — <Descriptor Title>`
   - `<NN>-ui-<descriptor>` → Title: `UI Component — <Descriptor Title>`
   - `<NN>-mobile-app-<descriptor>` → Title: `Mobile App UI — <Descriptor Title>`
   - `<NN>-chat-ui-<descriptor>` → Title: `Chat UI — <Descriptor Title>`
2. **No Standalone 3D Objects or Static Textures in `projects/`**:
   - Do not create `projects/` packages for standalone 3D WebGL objects or static painting/texture studies. Only interactive Website Landing Pages, UI Components, Mobile App UIs, and Chat UIs belong in `projects/`.
3. **Unversioned HTML Entry Points Only**:
   - Source HTML is always `index.html`.
   - Compiled project deliverable is always `dist/index.html`.
   - Compiled moodboard root entry is always `main.html` (and `dist/main.html` / `dist/index.html`).
   - Never create versioned files such as `index-7.html`.

---

## 2. Vendor-Neutral Naming Policy

Never leak internal Google tool names, model codenames, or third-party AI brand names into standalone Golden Template deliverables:

| Forbidden Term | Required Neutral Replacement |
| :--- | :--- |
| `Jetski` (e.g., `Jetski Composer`, `JetskiBrandLogo.tsx`) | `Chat UI` (`Chat UI — Prompt Composer`, `ChatUIBrandLogo.tsx`) |
| `ChatGPT` (e.g., `ChatGPT 4o`, `src/areas/chatgpt`) | `Chat UI` (`Assistant Default` / `Assistant Pro` / `Assistant Fast`, `src/areas/chat-ui`) |
| `Argon` / `gemini-4-argon` | Omit or use neutral `Golden Template` / theme slug metadata |
| `REF-001` .. `REF-099` (inside `projects/<slug>/`) | Omit internal board IDs from standalone project titles, descriptions, and UI badges |

---

## 3. Optical Padding, Typography & WCAG 2.1 Craft Gate

1. **Optical Button & Pill Padding**:
   - Pill badges and filter tabs: minimum horizontal padding `0.95rem–1.15rem` (`px-4`), vertical padding `0.45rem–0.55rem` (`py-2`), icon-text gap `0.45rem–0.5rem` (`gap-2`).
   - Primary CTA buttons: minimum horizontal padding `1.25rem–1.5rem` (`px-5` to `px-6`), vertical padding `0.65rem–0.8rem` (`py-2.5` to `py-3`).
   - Never leave text touching container borders or pill edges.
2. **Tabular Numerals (`tabular-nums`)**:
   - Apply `font-variant-numeric: tabular-nums` (`.tabular-nums`) to every price, percentage, timer, coordinate, badge count, and table cell so numbers never jitter when state updates.
3. **WCAG 2.1 Contrast Compliance**:
   - Body copy (`--ink` on `--surface` and `--surface-raised`) must achieve `>= 4.5:1` contrast ratio.
   - Primary CTA text (`--on-accent` on `--accent`) must achieve `>= 4.5:1` contrast ratio.
   - Secondary metadata (`--muted` on `--surface`) must achieve `>= 3.2:1` contrast ratio.
