# palletism: taste packs for AI images

- Site: https://palletism.art · Packs: https://palletism.art/collections · Gallery: /gallery · Examples: /examples · MCP: /connect · Pricing: /pricing
- By Aditya Kumar Puri ([github.com/puri-adityakumar](https://github.com/puri-adityakumar), [x.com/adityawaslost](https://x.com/adityawaslost)). Images and packs are the site's property; read its terms before reusing any.
- Captured 2026-11-12.

## What it is
"Images that belong together." A **taste pack** is one illustration look, written down so you can repeat it:
- 12 images, tested across **three image models** in four aspect ratios
- the **exact full prompt** behind every image, plus a prompt kit to paste into any chat
- the **palette in hex**
- **font pairs** that suit the look
- **whole example sites** drawn in the style (one per color scheme)
- **rules your agent can read**: technique, dos and don'ts, served over MCP

Their pitch: one good image is easy; making the 100th look like it belongs with the first is the hard part. A pack keeps the palette, art direction and recipe in one place.

## Public packs (6)
| Pack | Fits |
| :--- | :--- |
| **graphite sketch** | Calm productivity apps, writing tools, blogs, research and learning products that want a hand-drawn, human feel |
| **halftone press** | Independent editorial magazines, interview podcasts, record labels, culture festivals, arts portfolios with a composed print voice |
| **pastel playground** | Preschool learning, family routines, parent communities, gentle wellbeing products with warm toy-like imagery |
| **pixel arcade** | Indie games, game jams, devlogs, player communities, playful dev tools and consumer apps |
| **pop grain** | Music communities, culture brands, streetwear drops, artist memberships, local gigs, creator portfolios |
| **sunprint** | Boutique hotel booking, slow-travel planners, neighborhood cafés, seasonal food, sustainable DTC with sun-warmed printed illustration |

The examples page shows "loupe", a made-up app for shoot crews, built plain by an agent and then restyled with **halftone press** in about 5 minutes (before/after slider).

## MCP server
- URL `https://palletism.art/mcp`, streamable HTTP, header `Authorization: Bearer plt_…`
- Read-only: 8 tools + 1 prompt. Suggested first call: `match_taste` with the project's theme colors + a one-line product description.
- **Free:** every public pack, guide and prompt; 200 counted MCP calls/day (`tools/call` and `prompts/get` count; listing and pings don't); images up to 1200 px. "Hobby" (3,000 calls/day, full-res, exclusive packs) isn't open yet.
- **In the kit:** parked in `plugins/design-mcp/mcp_config.optional.json` until there's a key. To turn it on: sign in at https://palletism.art/profile/mcp → create a key (shown once) → put it in `plugins/design-mcp/mcp_config.json` (git-ignored) under `palletism` → toggle the design-mcp plugin.

## How it fits the kit
- **Image generation (Nano Banana Pro plates, `image-gen`, `concept-art`):** borrow a pack's art direction, prompt structure and "dos and don'ts" pattern for spot illustrations, empty states, onboarding art and marketing imagery, so a set stays consistent.
- **color-enricher / font-enricher:** a pack's hex palette and font pair are a quick starting point. Still run them through the don'ts (no purple, no Material fonts, light by default).
- **Idea worth copying:** package our own WDA looks as "taste packs" (palette + fonts + prompt recipe + rules + 12 reference plates), so agents can reuse a look across a batch.
