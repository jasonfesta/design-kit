# Palermo (Profound): reference design system

> [!IMPORTANT]
> **Reference only.** Palermo is Profound's in-house design system. It's not published as a package or licensed for reuse: "The only way to install Palermo is to work at Profound." Everything here was transcribed from the **public docs site** (robots: allow) on 2026-11-11, to study structure, values and craft. Don't ship its tokens, names or icons as-is. Rebuild with the open libraries in [`libraries/stacks/palermo/`](../../../libraries/stacks/palermo/README.md) and your own tokens.

- Site: https://palermo.tryprofound.com/docs/get-started
- Product: Profound, an AI-search / answer-engine visibility platform ("Learn and control how AI is talking about your brand")
- Archetype: **calm, near-monochrome analytics workbench for AI-visibility data**. White and neutral surfaces, black primary actions, small semantic color tints, dense 13–15 px UI type, a dot-grid canvas, and agent-era components (Composer, Question Tool, Commandbar, Filter Builder, Audio/Video Player).

## Files
| File | Contents |
| :--- | :--- |
| `tokens.css` | 72 color tokens (light + dark), 70 typography tokens, 11 radii, fonts. All prefixed `--pal-`, named after the docs' Tailwind utilities |
| `docs/` | 46 pages as Markdown: get-started, colors, typography, icons, and 42 component pages (props, usage, do/don't) |
| `desktop.png`, `mobile.png` | Get-started page at 1440×900 / 390×844 @2x |
| `screens/` | 14 pages × desktop + mobile: colors, typography, icons, button, composer, question-tool, commandbar, filter-builder, table, statistic, card, dialog, toast |

## Foundations
- **Color:** surfaces `#ffffff` → `#fafafa` → `#f5f5f5` → `#e8e8e8` (dark `#1e1e1e` → `#414141`). Primary fill is `#18181a` (black buttons). Semantic fills: blue `#376cff`, green `#15b462`, red `#ff5f57`, orange `#f4a462`, yellow `#f9ff57`. Each has a 10% tint background and a hover step. Sections: Background, Fill, Control, Stroke, Text, Shadow, Destructive Shadows, Workflow.
- **Type:** "Profound Inter" (proprietary Inter cut) + Geist Mono. Named scale: `title` / `title-small` / `title-mini` (18 px, −0.25 tracking), `body-regular` 15/20, `body-small` 13/18, `body-mini` 12/16, `body-micro` 10/14, plus `-spaced` variants for reading (14/24, 13/20) and `heading-xl` 56 px.
- **Radius:** a full pixel scale, `radius-1` … `radius-18` (1, 2, 4, 6, 8, 10, 12, 14, 16, 18 px).
- **Icons:** a custom outline + filled SVG set (AI-product glyphs like agents, agent-analytics, answer-engine-insights, assistant, brain) and a tree-shakeable brand-icon registry.

## Components (42)
Active Bar · Alert · Audio Player · Avatar · Badge · Brand icons · Button · Card · Checkbox · Collapsible · **Commandbar** · **Composer** · **Question Tool** · Dialog · Drawer · Dropdown Menu · Empty & Error States · Highlights · **Filter Builder** · Input · **Multi-step Form** · Pagination · Pill / Tag · Popover · Progress Bar · Radio Group · Scroll Area · Section Header · Segmented Tabs · Separator · Skeleton · Spinner · **Statistic** · Switch · Table · Tabs · Textarea · Toast · Toggle Group · Tooltip · **Video Player**

Worth studying: Composer (agent prompt input), Question Tool (agent asks the user structured questions), Filter Builder, Statistic (NumberFlow digits), the Video/Audio Player (a styled layer on Video.js 10 + hls.js, with `TimedSlot` overlays and UpNext).

## Stack (detected from the docs and site bundle)
Next.js · React 19 · Tailwind CSS v4 · **Radix primitives** (`data-radix-*`, `data-state`) · **cmdk** (Commandbar) · **@number-flow/react** (Statistic) · **Video.js 10 + hls.js** (players) · Geist Mono · custom icon and brand-icon packages · `@repo/*` monorepo packages. All the open ones are installed in [`libraries/stacks/palermo/`](../../../libraries/stacks/palermo/README.md).

## Don'ts check
- Mostly clean: monochrome + blue/green/red/orange. **Purple:** `bg-bg-purple` (`#5d33f3` tint) and possibly the workflow colors. Remap them to a non-purple hue if you borrow the palette.
- **Font:** Inter-based. Swap in a font from `font-enricher` (the stack playground uses Instrument Sans).
- Ships light and dark; keep light as the default.

## When to use
Data-dense AI analytics, agent consoles, and brand-monitoring dashboards that need a quiet, precise, Linear/Vercel-like workbench with first-class agent components. Avoid it for expressive consumer or marketing surfaces.
