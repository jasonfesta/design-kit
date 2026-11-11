# Canonical `dating` Blueprint & Cross-Folder Research Linking Architecture

This reference documents how `golden-template` uses its bundled [`assets/dating/`](../assets/dating/package.json) directory as the ground-truth judge for every standalone React project and how it links research folders, prompts, source trees, screenshots, and skills together.

---

## 1. The 5 Verbatim Files Judged Against `assets/dating/`

`scripts/lint-golden-template.mjs` loads these 5 files directly from `assets/dating/` and compares every project in `projects/<slug>/` against them byte-for-byte (with `--fix` automatically restoring any drifted file):

1.  **`package.json`** (`assets/dating/package.json`):
    -   Only `"name"` changes to match the folder slug (`"<NN>-<category>-<descriptor>"`).
    -   Locks `react: "19.2.3"`, `react-dom: "19.2.3"`, `lucide-react: "^1.43.0"`, `clsx: "2.1.1"`, `tailwind-merge: "3.4.0"`, `@tailwindcss/vite: "4.1.17"`, `tailwindcss: "4.1.17"`, `typescript: "5.9.3"`, `vite: "7.2.4"`, and `vite-plugin-singlefile: "2.3.0"`.
2.  **`tsconfig.json`** (`assets/dating/tsconfig.json`):
    -   Enforces `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noFallthroughCasesInSwitch": true`, and `"paths": { "@/*": ["./src/*"] }`.
3.  **`vite.config.ts`** (`assets/dating/vite.config.ts`):
    -   Enforces `base: './'`, `plugins: [react(), tailwindcss(), viteSingleFile()]`, and `@` alias resolution to `./src`.
4.  **`src/main.tsx`** (`assets/dating/src/main.tsx`):
    -   Enforces `StrictMode`, `createRoot(document.getElementById("root")!)`, `./index.css`, and named `import { App } from "./App"`.
5.  **`src/utils/cn.ts`** (`assets/dating/src/utils/cn.ts`):
    -   Enforces the canonical `twMerge(clsx(inputs))` helper.

---

## 2. Research Folder Linking Contract (`references/research/`, `briefs/`, `projects/`, `dist/`)

Across `wda/`, `moodboards/`, and `research/`, every brand or moodboard study links its research artifacts to its runnable Golden Template React deliverables through a deterministic folder graph:

```text
<workspace-or-brand-root>/
├── references/
│   ├── desktop.png                          # Desktop design reference authority
│   ├── mobile.png                           # Mobile design reference authority
│   ├── manifest.json                        # Reference dimensions, breakpoint CSS widths & asset map
│   └── research/                            # Extracted research & spec authority
│       ├── GITHUB_RESEARCH_INDEX.md         # Master index of research specs & clean plates
│       ├── homepage-study-desktop-spec.md   # Canonical desktop copy, dimensions & section taxonomy
│       ├── homepage-study-mobile-spec.md    # Canonical mobile reflow & touch target contract
│       └── assets/                          # Pre-cleaned 2x Retina plates (*-clean-hero-plate.png)
├── briefs/                                  # Component reconstruction briefs & palette/typography direction
├── screenshots/                             # 1:1 WebKit2GTK rendered screenshots synced per project slug
├── src/
│   ├── golden-projects.json                 # Auto-generated registry linking index -> projects/<slug>
│   └── golden-skills.json                   # Auto-generated registry linking index -> skills/<id>
├── projects/
│   └── <NN>-<category>-<descriptor>/        # Standalone Golden Template React app judged by assets/dating/
└── dist/
    └── projects/<NN>-<category>-<descriptor>/
        ├── index.html                       # Self-contained single-file bundle + #gt-inspector-host bar
        ├── source/manifest.json             # Linked full source tree for offline code inspection
        └── prompts/                         # Linked research briefs & multi-screen prompts
```

### Verification Checklist for Linked Research & Project Folders

1.  **Pre-Build Research Link**: Every product name, price, dimension, and clean photographic plate inside `projects/<slug>/src/data/*Data.ts` traces directly to `references/research/` or `briefs/`.
2.  **Post-Build Inspector Link**: Running `scripts/build-all-projects.mjs` populates `dist/projects/<slug>/source/manifest.json`, `dist/projects/<slug>/prompts/`, `src/golden-projects.json`, and `src/golden-skills.json` with zero broken relative paths.
3.  **Screenshot & DOM Sync Link**: Running `scripts/audit-all-projects.mjs --sync-screenshots` verifies `0` collisions/overflow across all projects and keeps `screenshots/<slug>.png` 1:1 synchronized with the live build.
