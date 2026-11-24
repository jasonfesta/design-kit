# design-kit changelog

## 2026-11-24
- **Dream Loop (`achimala/dream-loop`) in `3d-photoreal`:**
  - Installed `dream-loop` agent skill into `plugins/3d-photoreal/skills/dream-loop/` (`SKILL.md`, `README.md`, `LICENSE`, `references/fal.md`, `references/plus-mode/`, `references/pro-mode/`, `scripts/fal-batch.mjs`, `scripts/fal-batch.test.mjs`, `scripts/preview-server.py`, `assets/vesper-preview.gif`) with flat symlink `skills/dream-loop` and indexed in `INDEX.md` and `skills/CREDITS.md`.
- **Torph (`torph.dev` / `lochie/torph` v0.1.4) in `motion-craft`:**
  - Installed `torph` agent skill into `plugins/motion-craft/skills/torph/` (`SKILL.md`, `references/frameworks-and-api.md`, `references/patterns-and-tuning.md`, `LICENSE`) with flat symlink `skills/torph`.
  - Saved full offline snapshot in `libraries/sources/torph/` (`package/` unpacked `torph@0.1.4` MIT tarball with React/Vue/Svelte/vanilla builds + types, `CHANGELOG.md`, 25+ `demos/` from `torph.dev/examples`, 5 framework `examples/`, and `README.md`) and indexed in `libraries/motion.md`, `libraries/README.md`, `INDEX.md`, and `skills/CREDITS.md`.
- **glimm (`glimm.dev` / `nomanjack/glimm-skill`) + Motion AI Kit (`npx motion-ai` v14.2.0) in `motion-craft`:**
  - Installed `glimm` agent skill into `plugins/motion-craft/skills/glimm/` (`SKILL.md`, `references/react-and-vanilla.md`, `references/tuning.md`, `LICENSE`) with flat symlink `skills/glimm`.
  - Saved full offline snapshot in `libraries/sources/glimm/` (`package/` unpacked `glimm@0.4.1` MIT tarball + `llms.txt` + `llms-full.txt` + `README.md`) and indexed in `libraries/motion.md` (72 entries), `libraries/README.md`, and `INDEX.md`.
  - Verified `npx motion-ai` (`motiondivision/ai-kit` v14.2.0) is already fully installed and byte-identical in `plugins/motion-craft/` (`skills/motion/`, `agents/motion-reviewer.md`, live `https://mcp.motion.dev` MCP), and added `plugins/motion-craft/mcp_config.optional.json` for `motion-plus` (`https://mcp.motion.dev/plus`).
- **UI component libraries & registries installed:**
  - Wired `@coss` (`coss.com/ui`, 608 items), `@kibo-ui` (`kibo-ui.com`, 41 items), and `@tactile` (`tactileui.dev`, 98 items) into `libraries/components.shadcn.json` and `mcp/shadcn/components.json`, and synced `@magicui` (260 items) and `@aceternity` into `libraries/components.shadcn.json` (12 live registries total alongside `@react-bits`, etc.).
  - Added local offline sources in `libraries/sources/`: `bencho/` (47 MIT blocks + Web Audio UI sounds + `llms.txt`), `preline/` (200+ Tailwind v4 blocks + 29 framework-agnostic JS plugins), and `tactile-ui/` (98-item index + all 6 free MIT registry JSONs).
  - Parked auth-gated `tactile` MCP (`https://tactileui.dev/mcp`) in `plugins/ui-libraries/mcp_config.optional.json`. Confirmed `radix-ui` 1.8.1 already installed in `libraries/stacks/apps/`.

## 2026-11-23
- **Papercraft (`xikhar/papercraft`)** adopted into `design-craft`: new skill `plugins/design-craft/skills/papercraft/` (`SKILL.md`, `references/`, `assets/lib/`, `assets/templates/`, `assets/examples/`, `assets/gallery/`, `scripts/`, flat link in `skills/papercraft`), for handcrafted pop-up book papercraft 3D/2D scenes, games, web pages, animations, and videos.
- **InfiniSplat (`zju3dv/InfiniSplat`)** adopted into `3d-photoreal`: new skill `plugins/3d-photoreal/skills/infinisplat-3dgs/` (`SKILL.md` + `scripts/infinisplat_bake.py`, flat link in `skills/infinisplat-3dgs`), covering InfiniSplat v1 surface-aligned sparse supports, v2 multi-view/24-view panorama RDNorm fusion, v3 SplatAnything Gaussian Spacing Normalization (GSNorm), and a browser-native 3-layer WebGL2 EWA portrait/scene splat baker + spatial website navigation pattern. Cross-linked from `3d-gaussian-splatting-webgl`, `libraries/3d.md`, and `INDEX.md`.

## 2026-11-12
- **palletism.art** taste packs: `references/inspiration/palletism.md` (6 packs, how packs work); `palletism` MCP parked in `plugins/design-mcp/mcp_config.optional.json` (needs a free `plt_` key).
- **Palermo (Profound)**, reference-only design system: `design-systems/external-systems/palermo-profound/` (72 color + 70 type + 11 radius tokens, 46 docs pages, 28 screenshots, transcribed from the public docs).
- **Installed stack** `libraries/stacks/palermo/`: radix-ui, cmdk, @number-flow/react, @videojs/react 10, hls.js, cva/clsx/tailwind-merge, Geist Mono, Tailwind v4, Vite 8 + playground (build verified).

## 2026-11-11: consolidation + expansion
**Kit is self-contained.** Repointed every path that still used `~/.gemini/config/skills`, `~/wda/skills` or `~/wda/.agents/skills` to `~/design-kit`. The global symlink sync is now opt-in (`--legacy-global-symlinks`). Old skill folders are retired.

**Skills: 74 → 501, plugins 7 → 14**
- Imported 420 skills into 6 new plugins: `design-craft` (130), `platform-design` (41), `design-tooling` (89), `ux-content` (16), `web-effects` (102), `threejs-games` (42). Sources: mengto/skills, jakubkrehel/skills, meodai/skill.color-expert, ~/design-agents/.agents/skills (+ their upstream repos). Credits in `skills/CREDITS.md`.
- New own skills:
  - `library-finder` (ui-libraries)
  - `design-donts` + linter (kit-meta)
  - `font-enricher`, `color-enricher`, `reference-mining` (design-pipeline)
  - `design-mcp-guide` (design-mcp)
- Imported: `bento-ui-motion-grid` (motion-craft), runnable via `tools/bin/bento-grid`.

**MCP: 2 working → 16 live.** Fixed `shadcn` / `spectrumui` (absolute npx path; shadcn now starts in `mcp/shadcn/` so it sees all 9 registries). Added `magicui`, and the new `design-mcp` plugin (context7, deepwiki, tailwind-docs, threejs-docs, google-fonts-docs, iconify, color, palette, excalidraw, chrome-devtools, playwright). `originkit`, Figma, Refero, LottieFiles and Framer are parked in `mcp_config.optional.json` (they need keys). See `mcp/README.md`.

**Design systems: 22 → 44**
- Google 10 → 20 (Gemini, Home, Travel, Merchant, GPay, NotebookLM, Earth, Help, ChromeOS, Plexi)
- External 6 → 18 (Carbon, Polaris, Primer, Atlassian, Fluent 2, Radix, Spectrum 2, SLDS, Ant, Mantine, Base Web, Apple HIG)

**Libraries**
- New catalogs: `ui-primitives.md` (114+), `motion.md` (71), `3d.md` (81, incl. asset encoding), `icons.md` (45), `fonts.md` (73).
- Local kits in `libraries/sources/`:
  - `plush-ui` (23 soft components, `@plush`)
  - `designme` (125 agent-UI components, React-only, `@designme`)

**References.** `references/inspiration/` has 30 sources (whitespace experiments, Emil Kowalski, affectUI's 178 items, Rauno, Paco, Benji, Jhey, Codrops, Godly, Mobbin, Refero…).

**Rules**
- `rules/design-kit-taste.md`, always on: no Material fonts, no purple, no default dark, wide font pool, weekly feedback log.
- `~/wda/.agents/rules/wda-prompt-construction.md`, always on in WDA: donts → color-enricher → font-enricher → reference-mining → library-finder → lint.

**Tools.** `tools/python/site` (Playwright, Pillow, numpy) and `tools/ms-playwright` (headless Chromium), because this host has no pip and system Chrome hangs headless. Both git-ignored.

**Housekeeping**
- Fixed about 230 stale relative links in the WDA-era docs (`libraries/*.md`, `design-systems/*/README.md`).
- Skill `demo/` folders are git-ignored (≈100 MB, kept on disk).
- Nothing committed; the kit is local only.
