# clean-up output contract

## 1. Stripped (never survives)

| Source item | Action |
| :-- | :-- |
| HTML comments, CSS `/* */` comments, JS `//` and `/* */` comments | Removed |
| `<script src>`, `<link>` (except Google Fonts, converted to `@import`), `<meta>`, `<title>` | Removed (title feeds the prompt) |
| `data-slot`, `xmlns:*`, `xml:space`, and library-internal `data-recharts-*`, `data-radix-*`, `data-headlessui-*`, `data-dnd-*`, `data-testid` and similar attributes | Removed |
| `recharts-*` classes and ids | Renamed `chart-*` in markup, CSS and JS |
| Icon sprite `<symbol>` + `<use href="#id">` | Inlined into an `ICONS` map plus an `Icon` component |
| Provenance tokens: 21st, shadcn, radix, lucide, recharts, kokonut, spectrumui, react-bits, fluid registry, MCP, registry, source URLs, local paths, golden-template forbidden names (Jetski, ChatGPT, Argon, REF-NN) | Must be absent. The pre-lint fails if any remain |

## 2. HTML → JSX rules

- `class` → `className`, `for` → `htmlFor`, `tabindex` → `tabIndex`, plus the full map in `HTML_ATTRS`.
- Kebab-case SVG attributes become camelCase (`stroke-width` → `strokeWidth`). Lowercased SVG tags and attributes are restored (`viewbox` → `viewBox`, `lineargradient` → `linearGradient`).
- `style="a: b; --x: y"` → `style={{ a: "b", "--x": "y" }}`. Semicolons inside `url(...)` are respected.
- Boolean attributes → bare props. Input `value` → `defaultValue`, `checked` → `defaultChecked`, `option[selected]` dropped.
- Inline handlers (`onclick="..."`) → `onClick` that calls the original code with `this` bound to the element.
- Text containing `{ } < >` is emitted as a JS string expression. Whitespace collapses like HTML, except in `pre` and `textarea`.

## 3. Behavior

All inline `<script>` code runs once inside `useEffect` behind a `didInitRef` guard. This keeps it safe under StrictMode double-invoke, and it runs after the markup mounts, so `getElementById` and `querySelector` work unchanged. `html` and `body` classes are re-applied there too.

## 3b. Naming (Google style + React / React Native safe)

Implemented in `scripts/clean_up.py` (naming section) and applied consistently to markup, CSS selectors, JS string selectors, ARIA id references, `href="#id"` and `url(#id)`.

| Thing | Convention | Example |
| :-- | :-- | :-- |
| CSS classes, element ids | lowercase kebab-case, starts with a letter, no cryptic abbreviations | `sb-head` → `sidebar-head`, `btn-new` → `button-new`, `xAxis` → `x-axis`, `grad-_r_c_` → `gradient-r-c` |
| data-* attributes, CSS custom properties | lowercase kebab-case (checked) | `data-toggle`, `--muted-foreground` |
| Components | UpperCamelCase | `App`, `Icon` |
| Module constants | CONSTANT_CASE | `STYLES`, `ICONS` |
| Variables, refs | lowerCamelCase | `didInitRef` |
| Icon keys | lowerCamelCase bare identifiers, `i-`/`icon-` prefixes dropped, reserved words get an `Icon` suffix | `i-search` → `search`, `delete` → `deleteIcon` |
| Output folder | lowercase kebab slug, `App.tsx` / `prompt.md` / `preview.html` / `report.md` inside | `clean-up/dashboard-3/App.tsx` |
| React Native project name | alphanumeric UpperCamelCase (reported) | `dashboard-3` → `Dashboard3` |

- `App` is exported both ways, `export function App()` (golden-template `main.tsx`) and `export default App` (artifact runners).
- Collisions get a numeric suffix (`-2`) and are listed as warnings.
- Single-character names that cannot be safely expanded (for example `r`) are listed as warnings, not renamed.
- The expansion dictionary (`ABBREV`) keeps common domain terms such as `kpi`, `nav`, `cta`, `faq` and `api`.

## 4. Pre-lint checks (all must pass)

1. Imports are only `react`.
2. No provenance or tooling tokens in the TSX or the prompt.
3. No external runtime URLs (Google Fonts allowed).
4. No `<script>` or `<link>` in the JSX.
5. No HTML comments.
6. Naming: classes and ids kebab-case; data-* and CSS variables kebab-case; icon keys lowerCamelCase and not reserved; components, constants and variables follow Google TypeScript casing; slug kebab-case with a React Native project name.
7. esbuild compiles and bundles the TSX (skipped with `--no-preview`).

## 5. Prompt shape

```
Build "<title>" as a single responsive page.
TOKENS (CSS custom properties): ...
FONTS: ...
STRUCTURE: landmark outline with headings and repeated groups (×N)
TABLE / CHART lines (data and labels)
BEHAVIOR: detected interactions
RESPONSIVE: breakpoints + 390px rule
ACCEPTANCE: standard craft gates
```
