# originality rules, 2-font discipline, `canon.md` schema & `4 x 3` tables (`style-direction`)

---

## 0. the `primary + secondary` Google Font rule (`<= 2` families max)

To keep typography intentional and cohesive across every screen, component, and interactive experience, `style-direction/typography-and-color.md` locks **at most 2 Google Font families** (selected live via `google-font-selection` minus `avoid_fonts`):

| token | role | rule |
| :--- | :--- | :--- |
| **`--font-primary`** | **Expressive / Headline Font** | Used for hero display lines, page/screen titles, editorial pull-quotes, and focal feature headings (`weights`, `optical tracking`, and `line-height` explicitly locked). |
| **`--font-secondary`** | **Theme-Matched Generic / UI Font** *(or `== --font-primary`)* | Clean, calm, high-legibility Google Font harmonized to the design theme for navigation, body copy, pills/buttons, table labels, and `font-variant-numeric: tabular-nums` metrics/prices/timers. **Using a single family (`--font-secondary == --font-primary`) is completely valid** when weight/scale contrast carries the hierarchy cleanly. **Never add a 3rd or 4th font family.** |

---

## 1. the 8 semantic color tokens (`style-direction/typography-and-color.md`)

Every master style direction locks all 8 Golden semantic tokens in hex + OKLCH alongside explicit contrast ratios and `avoid_palettes` distance notes:

| token | role across web, mobile & 9 components | mandatory craft guardrail |
| :--- | :--- | :--- |
| `--surface` | primary page / app / HUD canvas ground | luminous mineral/alabaster (`L* >= 94`) or intentional deep carbon (`L* <= 12`); never muddy `L* 70–84` beige or `#0F172A` slate-blue. |
| `--surface-raised` | elevated card, modal, sheet, or active panel | clean tonal step from `--surface`, separated by `1px` `--border` hairlines rather than heavy drop-shadow soup. |
| `--ink` | primary headlines, values & body copy | `>= 7:1` contrast against `--surface` and `--surface-raised`. |
| `--muted` | secondary captions, metadata & axis ticks | `>= 4.5:1` contrast where carrying essential task labels. |
| `--accent` | primary CTA, active tab/row, or key focal block | distinct from all 10 `avoid_palettes` brand accents. |
| `--accent-alt` | secondary status, positive check, or chart/HUD tone | harmonious companion hue; never random rainbow status dots. |
| `--on-accent` | label/icon ink sitting directly on `--accent` | `>= 4.5:1` contrast on `--accent`. |
| `--border` | `1px` architectural rules, table dividers & outlines | crisp, subtle structural seam (`4–8px` or intentional pill radii locked in `direction.md`). |

---

## 2. `style-direction/canon.md` template

```markdown
# canonical world & state ledger (`canon.md`)

- **fictional name & wordmark**: <name> (<exact wordmark casing & mark rule; zero borrowed logos>)
- **domain & core user task**: <1-sentence functional purpose>
- **navigation hierarchy (web)**:
  - page 1 (entry): `<Home>`
  - page 2 (nav #2): `<Destination 2>`
  - page 3 (nav #3): `<Destination 3>`
  - supporting nav/CTA: `<Destination 4>`, `<Sign in / Primary CTA>`
- **mobile tab bar (exact order & icons)**:
  1. `<Tab 1>` (<icon shape>)
  2. `<Tab 2>` (<icon shape>)
  3. `<Tab 3>` (<icon shape>)
  4. `<Tab 4>` (<icon shape, documented for nav bar realism>)
- **canonical entities, people & numbers (must never contradict across concept plates)**:
  - primary entity / item / level: `<exact ID, name, price/score/version, dimensions>`
  - secondary entities (2-3): `<exact IDs, names, prices/metrics, statuses>`
  - people / players / owners: `<exact names, initials/avatar rules, roles>`
  - pinned clock / date / progress state: `<e.g., Thu 05 Nov 2026 · 13:46 UTC · 6 of 6 passed>`
```

---

## 3. required pre-prompt tables in `style-direction/content-tables.md`

Write explicit tables with **final visible copy** (never `"add relevant sections"` or `"lorem ipsum"`) before invoking `image-gen`:

1. **ranked website section table (`01..03`)**:
   - Lists every section in priority order for **Page 1 (Home)**, **Page 2 (Nav #2)**, and **Page 3 (Nav #3)**: `slot`, `section #`, `visitor/player need`, `exact headline & key copy`, `layout geometry (e.g., 45/55 split, 3-col ruled ledger)`, `CTA -> coverage target`, and **complete footer specification** on `02` and `03`.
2. **mobile tab & flow table (`04..06`)**:
   - Specifies persistent mobile header, safe areas, bottom tab bar, and exact content for **Tab 1 (`04`)**, **Tab 2 (`05`)**, and **Tab 3 (`06`)**.
3. **3 distinct system components table (`07..09`)**:
   - Defines **3 completely different components** (`07`, `08`, `09`)—recording for each: `component name`, `functional job in the product/system`, `visible controls & canon.md data rendered in the 2k plate`, and interactive states documented for `jason-dev-agent`.
4. **3 unique interactive experiences table (`10..12`)**:
   - Defines **3 bespoke interactive surfaces** (`10`, `11`, `12`—e.g., spatial/3D canvas, tactile sandbox, configurator) with distinct mechanics unified by `01-anchor` and `canon.md`.
*(When running in Mode B multi-direction mode, replace with direction-specific hero & tout tables for each candidate direction).*
