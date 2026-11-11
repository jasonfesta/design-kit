# Website-to-React Extraction Pipeline (`golden-template`)

This reference guide details **Mode B** of the `golden-template` skill: extracting a standalone **Google Golden Template** React 19 + Vite 7 + Tailwind v4 deliverable from an existing website, HTML/CSS bundle, or multi-component moodboard study (`src/areas/*.tsx`).

---

## 1. Source Inspection & Dependency Mapping

1. **Locate All Source Pieces**:
   - Inspect the target component or webpage DOM, CSS stylesheets (`src/areas/*.css`, `src/styles.css`), shared helpers (`src/shared.ts`), and static assets (`public/assets/*`).
   - Identify every state key (`state.tab`, `state.modal`, `state.selectedId`), prop callback, and CSS custom property used by the specimen.
2. **Eliminate Parent Moodboard Coupling**:
   - Standalone Golden Template deliverables in `projects/<slug>/` must have **zero imports** from parent moodboard files (`../../shared`, `../../theme`, etc.).
   - Convert `ExampleState` dictionary bags (`state.foo`) into strongly typed `useState<...>(...)` hooks inside `src/App.tsx`.

---

## 2. Modular Decomposition into the `dating` Architecture

Refactor monolithic website or moodboard code into the 4 canonical `src/` layers:

1. **`src/data/<domain>Data.ts`**:
   - Move all TypeScript interfaces, union types, and static datasets out of component files and into `src/data/<domain>Data.ts`.
   - Add `/** ... */` JSDoc comments above every exported interface and `UPPER_SNAKE_CASE` constant array.
   - Add pure lookup/filter helper functions (`get<Domain>ById`, `filter<Domain>Items`).
2. **`src/components/<Brand>BrandLogo.tsx`**:
   - Extract or craft the bespoke SVG emblem into `src/components/<Brand>BrandLogo.tsx` (or `ChatUIBrandLogo.tsx` for Chat UI deliverables).
   - Must declare `interface <Brand>BrandLogoProps { size?: number; className?: string; }` and `export const <Brand>BrandLogo: React.FC<<Brand>BrandLogoProps>` with `aria-hidden="true"` on the `<svg>`.
3. **`src/components/<Feature>.tsx` (2 to 5 files)**:
   - Split distinct visual regions (Header/Dropdowns, Primary Card/Stage, Detail Drawer/Modal, Filter Sheet, Below-the-Fold Sections) into dedicated `.tsx` files in `src/components/`.
   - Every component file must declare `interface <Name>Props` and `export const <Name>: React.FC<<Name>Props> = ...`.
4. **`src/App.tsx`**:
   - Export `export function App()` (named export).
   - Hold top-level interactive state, coordinate subcomponents, and render the complete layout shell.

---

## 3. CSS & Asset Self-Containment

1. **Scoped Styles & Tokens in `src/index.css`**:
   - Start `src/index.css` with `@import "tailwindcss";`.
   - Declare the project's `:root` CSS custom properties (`--surface`, `--surface-raised`, `--ink`, `--muted`, `--accent`, `--accent-alt`, `--on-accent`, `--border`, `--font-grotesk`, `--font-mono-tech`) inside `@layer base`.
   - Copy only the CSS rules required by this specific component/website into `src/index.css` so there is zero dead CSS and zero missing classes.
2. **Relative Asset Resolution**:
   - Reference shared moodboard photography/videos via relative paths (`../../assets/...`) or self-contained data/SVG assets so both `dist/projects/<slug>/index.html` and `projects/<slug>/dist/index.html` resolve every image and video cleanly without CORS or 404 errors.
