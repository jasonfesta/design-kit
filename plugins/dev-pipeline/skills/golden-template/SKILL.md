---
name: golden-template
description: >-
  Extracts, polishes, lints, links, and packages standalone React 19, Vite 7,
  and Tailwind v4 deliverables using the bundled canonical dating reference
  folder as the ground-truth judge for all root configuration files, 3-tier
  source folder arrangement, vendor-neutral nomenclature, strict TypeScript
  compilation, and cross-folder research, prompt, source, screenshot, and
  skill linking. Consolidates golden-template-extractor and react-extractor
  into one canonical skill. Use when scaffolding or porting components,
  landing pages, mobile screens, or chat UIs into Golden Template folders,
  linting against the dating blueprint, or linking research briefs, source
  trees, and project manifests together. Don't use for multi-model benchmark
  grading (use warmup) or font catalog ranking (use google-font-selection).
metadata:
  icon: 🏛️
---

# Golden Template: `dating`-Judged Architecture, 3-Tier Extractor & Research Folder Linker

Golden Template (`golden-template`) is the single canonical architecture, extraction, and folder-linking skill for React 19 + Vite 7 + Tailwind v4 deliverables. It consolidates `golden-template`, `golden-template`, and `golden-template-porter` into one zero-redundancy package and bundles the reference [`assets/dating/`](assets/dating/package.json) project directly inside the skill as its ground-truth judge.

## Workflow Checklist

Copy this checklist when extracting, linting, or linking Golden Template projects and research folders:

- [ ] **Step 1**: Verify every project folder matches the bundled [`assets/dating/`](assets/dating/package.json) file & config blueprint ([dating blueprint and research linking guide](references/dating-blueprint-and-research-linking.md))
- [ ] **Step 2**: Decompose UI into the 3-tier `src/` architecture (`src/data/*Data.ts`, `src/components/<Brand>BrandLogo.tsx`, `src/components/*.tsx`, `src/App.tsx`) using the [image-to-react pipeline](references/image-to-react-pipeline.md) or [website-to-react pipeline](references/website-to-react-pipeline.md)
- [ ] **Step 3**: Run [lint-golden-template.mjs](scripts/lint-golden-template.mjs) (`--fix`) to enforce byte-for-byte config parity with `assets/dating/`, vendor-neutral nomenclature, and strict `tsc --noEmit` ([nomenclature and polish rules](references/nomenclature-and-polish-rules.md))
- [ ] **Step 4**: Run [build-all-projects.mjs](scripts/build-all-projects.mjs), [audit-all-projects.mjs](scripts/audit-all-projects.mjs), and [verify-html-bundle.mjs](scripts/verify-html-bundle.mjs) to link `projects/`, `references/research/` (or `briefs/`), `screenshots/`, `skills/`, `dist/projects/<slug>/{source,prompts}`, and `src/golden-projects.json` together

--------------------------------------------------------------------------------

## 1. How the Bundled `assets/dating/` Folder Judges Every Project

Every standalone project inside `projects/<NN>-<category>-<descriptor>/` is judged directly against the bundled [`assets/dating/`](assets/dating/package.json) blueprint by [lint-golden-template.mjs](scripts/lint-golden-template.mjs):

```text
<NN>-<category>-<descriptor>/
├── index.html                  # Judged against assets/dating/index.html (<!doctype html>, category <title>, Google Fonts, #root)
├── package.json                # Byte-for-byte identical to assets/dating/package.json (only "name" changes to slug)
├── tsconfig.json               # Byte-for-byte identical to assets/dating/tsconfig.json (strict: true, noUnusedLocals, @/* alias)
├── vite.config.ts              # Byte-for-byte identical to assets/dating/vite.config.ts (base: './', react(), tailwindcss(), viteSingleFile())
└── src/
    ├── main.tsx                # Byte-for-byte identical to assets/dating/src/main.tsx (StrictMode + named { App } import)
    ├── utils/
    │   └── cn.ts               # Byte-for-byte identical to assets/dating/src/utils/cn.ts (clsx + tailwind-merge)
    ├── index.css               # @import "tailwindcss"; @layer base tokens, .font-serif-display, .font-grotesk, .font-mono-tech
    ├── App.tsx                 # Named `export function App()` root orchestrator (modeled after assets/dating/src/App.tsx)
    ├── components/
    │   ├── <Brand>BrandLogo.tsx # Custom vector SVG brand emblem (`aria-hidden="true"`, JSDoc header)
    │   └── <Feature>.tsx       # 3 to 6 modular `React.FC<*Props>` interactive components
    └── data/
        └── <domain>Data.ts     # Exported TypeScript interfaces, JSDoc headers, and UPPER_SNAKE_CASE seed constants
```

See the line-by-line verification checklist in [dating-blueprint-checklist.md](examples/dating-blueprint-checklist.md).

## 2. How Research, Prompt, Source, Screenshot & Skill Folders Link Together

To make sure every project folder is properly linked to its research briefs, prompts, inspectable source code, screenshots, and workspace skills, [build-all-projects.mjs](scripts/build-all-projects.mjs) and [audit-all-projects.mjs](scripts/audit-all-projects.mjs) wire six folder trees together automatically:

| Folder / Manifest | Linked Source Authority | How `golden-template` Links & Verifies It |
| :--- | :--- | :--- |
| `projects/<NN>-<category>-<slug>/` | Bundled [`assets/dating/`](assets/dating/package.json) | `lint-golden-template.mjs --fix` enforces exact config parity, 2-digit sequential category prefix (`01-website-*`, `07-ui-*`, `13-mobile-app-*`, `19-chat-ui-*`), and strict `tsc --noEmit`. |
| `<brand>/references/research/` & `briefs/` | Research specs (`GITHUB_RESEARCH_INDEX.md`, `*-desktop-spec.md`, `*-mobile-spec.md`, `prompt.md`) | `build-all-projects.mjs` links each project slug to its reconstruction brief and multi-screen prompt, publishing them to `dist/projects/<slug>/prompts/` and the `#gt-inspector-host` `Prompts` tab. |
| `dist/projects/<slug>/source/` & `public/projects/<slug>/source/` | `projects/<slug>/src/**/*` + root configs | `build-all-projects.mjs` copies every source file and writes `source/manifest.json` so the floating `Files` inspector tab can browse the live Golden Template tree offline. |
| `screenshots/<slug>.png` & `dist/screenshots/` | Live WebKit2GTK render of `projects/<slug>/` | `audit-all-projects.mjs --sync-screenshots` renders every project, verifies `0` collisions/overflow/clipping, and syncs 1:1 screenshots to `screenshots/`, `public/screenshots/`, and `dist/screenshots/`. |
| `dist/skills/` & `src/golden-skills.json` | Workspace `skills/<skill-id>/SKILL.md` | `build-all-projects.mjs` mirrors workspace skills into `public/skills/` and `dist/skills/` and writes `src/golden-skills.json` for the `Skills` inspector tab. |
| `src/golden-projects.json` | All `projects/<slug>/` + `screenshots/` + `source/` | Generated registry linking the parent research/moodboard index page to every compiled `dist/projects/<slug>/index.html` deliverable. |

## 3. Running the Linter, Folder Linker & Auditor

```bash
# 1. Judge all projects against bundled assets/dating/ and auto-fix config or nomenclature drift:
node {skill_dir}/scripts/lint-golden-template.mjs --dir={workspace_or_moodboard_dir} --fix

# 2. Audit DOM micro-physics (0 collisions, 0 overflow, symmetrical button padding, equal grids) & sync screenshots:
node {skill_dir}/scripts/audit-all-projects.mjs --dir={workspace_or_moodboard_dir} --sync-screenshots

# 3. Compile single-file bundles and link research prompts, source manifests, skills, and golden-projects.json:
node {skill_dir}/scripts/build-all-projects.mjs --dir={workspace_or_moodboard_dir}

# 4. Verify compiled HTML bundles for 0 syntax/leak errors and mounted #root:
node {skill_dir}/scripts/verify-html-bundle.mjs --dir={workspace_or_moodboard_dir}
```

--------------------------------------------------------------------------------

## References

-   [Canonical dating blueprint and cross-folder research linking architecture](references/dating-blueprint-and-research-linking.md)
-   [Image-to-React 3-tier extraction pipeline](references/image-to-react-pipeline.md)
-   [Website-to-React extraction and modularization pipeline](references/website-to-react-pipeline.md)
-   [Nomenclature, vendor-neutrality, and optical button polish rules](references/nomenclature-and-polish-rules.md)
-   [Multi-screen Nano Banana protocol](references/nano_banana_multi_screen_protocol.md)
-   [Parallel sub-agent execution runbook](references/subagent_parallel_execution_runbook.md)
-   [Line-by-line dating blueprint verification checklist](examples/dating-blueprint-checklist.md)

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
