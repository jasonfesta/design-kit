# Canonical `dating` Blueprint Checklist (`react-extractor`)

Use this checklist to verify that any extracted project in `<moodboard>/projects/<project-slug>/` matches [`./golden-template/dating`](./golden-template/dating) 100%:

- [ ] **Slug & Category Prefix**: Directory name matches `^(0[1-9]|[1-9][0-9])-(website|ui|mobile-app|chat-ui)-[a-z0-9-]+$`.
- [ ] **`package.json`**: Matches `golden-template/dating/package.json` verbatim, with `"name": "<project-slug>"`.
- [ ] **`tsconfig.json`**: Matches `golden-template/dating/tsconfig.json` verbatim (`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `@/*` path alias).
- [ ] **`vite.config.ts`**: Matches `golden-template/dating/vite.config.ts` verbatim (`base: './'`, `plugins: [react(), tailwindcss(), viteSingleFile()]`).
- [ ] **`index.html`**:
  - Starts with lowercase `<!doctype html>`
  - Contains `<meta name="description" content="..." />`
  - Contains Google Fonts `<link>` tags (`Instrument Serif`, `Plus Jakarta Sans`, `JetBrains Mono`)
  - `<title>` starts with `Website Landing Page — `, `UI Component — `, `Mobile App UI — `, or `Chat UI — `
  - Mounts `<div id="root"></div>` and `<script type="module" src="/src/main.tsx"></script>`
- [ ] **`src/main.tsx`**: Matches `golden-template/dating/src/main.tsx` verbatim (`StrictMode` + `createRoot` + `import {App} from './App'`).
- [ ] **`src/utils/cn.ts`**: Matches `golden-template/dating/src/utils/cn.ts` verbatim (`clsx` + `twMerge`).
- [ ] **`src/index.css`**: Starts with `@import "tailwindcss";`, defines `@layer base` tokens, and includes `.font-serif-display`, `.font-grotesk`, `.font-mono-tech`.
- [ ] **`src/data/<domain>Data.ts`**: Contains exported TypeScript interfaces/types, `/** ... */` JSDoc comments, and `UPPER_SNAKE_CASE` seed arrays.
- [ ] **`src/components/<Brand>BrandLogo.tsx`**: Custom SVG brand mark component (`React.FC<*BrandLogoProps>`) with `aria-hidden="true"` and JSDoc comment.
- [ ] **`src/components/*.tsx`**: 3 to 6 modular subcomponents (`React.FC<*Props>`) with explicit `*Props` interfaces.
- [ ] **`src/App.tsx`**: Exports `export function App()`, imports from `./data/*` and `./components/*`, and provides rich interactive state.
- [ ] **Zero Forbidden Strings**: Zero occurrences of `Jetski`, `ChatGPT`, `Argon`, `gemini-4-argon`, or `REF-0xx`.
- [ ] **Linter & Typecheck**: Passes `lint-golden-template.mjs` (`0` structural errors, `0` nomenclature errors, `0` `tsc --noEmit` errors).
- [ ] **Compiled Single-File Deliverable**: `dist/index.html` builds cleanly and passes `verify-html-bundle.mjs` (`0` syntax/leak/CORS errors, mounted `#root`).
