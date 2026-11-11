# url-list intake, desktop-first inspiration capture & multi-agent analysis (`research`)

When the user hands `jason-design-agent` **a list of URLs** (pasted in chat, a `.txt`, or a `sites.json`) instead of (or in addition to) a prompt, `research` does **not** go browsing for benchmarks. It runs this deterministic, multi-agent protocol:

```text
urls ──> pass 1 · entire long desktop page of EVERY url (CDP / Playwright, @2x)  ──> inspiration/manifest.json
     ──> pass 2 · mobile full page (@3x)                                         ──> (same manifest, merged)
     ──> N analyzer agents in parallel (1 per url) ──> research/properties/<slug>.md + research/prompts/<slug>-inspiration-prompt.md
     ──> 1 synthesizer agent ──> research/benchmarks.md + research/style-range.md (5-10 named non-beige directions)
     ──> 1 adversarial verifier (1 fix round max) ──> research/analysis-report.json
     ──> style-direction / image-gen consume the prompt seeds + 2K ref-base slices (image-to-image only)
```

---

## 1. intake — one command, desktop first

```bash
node /usr/local/google/home/jfesta/design-kit/skills/research/scripts/capture_fullpage_devtools.mjs \
  --study-dir=<study-slug> \
  --urls="https://a.com, https://b.com/pricing https://c.io"      # comma / space / newline separated; pasted chat text is fine
  # or --urls-file=<urls.txt>  (one per line, `#` comments allowed)
  # [--phase=all|desktop|mobile] [--concurrency=3] [--site=<slug>] [--max-viewports=N]
```

What it does, in order:

1. **normalize + dedupe + slug** every URL (`NN-<host>[-<path>]`, e.g. `03-linear-app-pricing`) and write/merge `research/sources.json`. Re-runs with extra URLs **append** — slugs are never renumbered.
2. **pass 1 — the entire long desktop page, for every URL, before anything else**: headless Chrome via raw CDP (`--headless=new`, `1440 x 900` CSS `@2x` → `2880px` wide), auto-scroll hydration of lazy images / canvas / reveals, cookie-wall + chat-widget cleanup, corp-interstitial bypass, sticky-top-bar hiding after tile 1, animation freeze, then tiled `Page.captureScreenshot` stitched with ImageMagick. Per URL it writes under `research/screenshots/<slug>/`:
   - `desktop-fullpage.png` — the whole page top to bottom (as many viewports as fit under the `31,500px` ImageMagick ceiling ≈ `17` desktop viewports; `desktopTruncated: true` is recorded if the document is longer).
   - `desktop-fullpage-contact.jpg` — 4-column side-by-side overview of the whole page (the first thing an analyst reads).
   - `desktop-base-hero-2k.png`, `-mid-2k.png`, `-lower-2k.png`, `-footer-2k.png` — `2752 x 1536` image-to-image `ref-base` slices (mid/lower chosen from the richest sections).
   - `fullpage-callouts.json` — every section band (y, height, bg, headings with font/size/weight, eyebrows, paragraphs, CTAs with bg/radius/padding, code samples, interactive signals) + header/nav inventory + `fontsObserved` + `colorsObserved`.
3. **`inspiration/manifest.json` + `inspiration/README.md` are written as soon as pass 1 lands** (before the mobile pass), with a browsable copy `inspiration/<slug>-desktop-fullpage.png` of each entire page. This is the inspiration folder that ships with the study — the same contract `nanofy` uses — so every plate, prompt, and `jason-dev-agent` build traces back to a URL row.
4. **pass 2 — mobile** (`390 x 844` `@3x` → `mobile-fullpage.png` + `mobile-base-2k.png`), merged into the manifest. Skip with `--phase=desktop` when speed matters; add later with `--phase=mobile`.

Playwright is an acceptable substitute when installed (`page.screenshot({ fullPage: true })` at `deviceScaleFactor: 2` after the same hydration scroll), but the raw-CDP script needs zero npm dependencies and is the default. Chrome lives at `/opt/google/chrome/google-chrome`; the script must run **outside** the terminal sandbox (network + Chrome).

### `inspiration/manifest.json` row

```json
{
  "index": 1, "slug": "01-linear-app", "url": "https://linear.app", "final_url": "...", "title": "...",
  "status": "captured | failed | pending", "error": null,
  "desktop_px": "2880x21600", "desktop_truncated": false, "mobile_px": "1170x9800",
  "sections_extracted": 14, "body_bg": "rgb(8, 9, 10)", "fonts_observed": ["Inter Variable, ..."],
  "captured_at": "ISO-8601", "inspiration_copy": "01-linear-app-desktop-fullpage.png",
  "files": { "desktop_fullpage": "../research/screenshots/01-linear-app/desktop-fullpage.png",
             "desktop_contact": "...", "desktop_base_2k": ["...hero...", "...mid...", "...lower...", "...footer..."],
             "callouts_json": "...", "mobile_fullpage": "...", "mobile_base_2k": "..." },
  "analysis": { "property_md": "../research/properties/01-linear-app.md",
                "prompt_md": "../research/prompts/01-linear-app-inspiration-prompt.md",
                "status": "pending | done | recapture", "style_codename": "...", "capture_quality": "clean | partial | unusable" }
}
```

---

## 2. analysis — one agent per url, then synthesize, then verify

```python
run_workflow(
    ScriptPath="/usr/local/google/home/jfesta/design-kit/skills/research/scripts/analyze_inspiration_workflow.py",
    Description="analyze inspiration captures -> dossiers + prompt seeds + style range",
    Args={"study_dir": "/abs/<study-slug>", "user_prompt": "<brief>", "max_concurrency": 4, "analyzer_model": "inherit"},
)
```

| stage | agents | reads | writes | gate |
| :-- | :-- | :-- | :-- | :-- |
| **analyze** | `N` analyzers in parallel (bounded `max_concurrency`, default `4`; one failure never cancels the rest) | contact sheet, 4 × `2K` slices, `fullpage-callouts.json`, mobile base if present | `research/properties/<slug>.md` (5-part anatomy template, section 2 of [benchmark-capture-and-evidence-rules.md](benchmark-capture-and-evidence-rules.md)) + `research/prompts/<slug>-inspiration-prompt.md` | reports `capture_quality` (`clean` / `partial` / `unusable`), `is_beige_default`, `design_score` |
| **qa** | script | analyzer verdicts | log of `--site=<slug>` recapture commands | `unusable` rows are excluded from synthesis |
| **synthesize** | 1 synthesizer (context kept for the fix round) | every dossier + seed | `research/benchmarks.md`, `research/style-range.md`, `research/prompts/README.md` | `5-10` named directions, each a different polarity / grid / material; `avoid_fonts` + `avoid_palettes` |
| **verify** | 1 adversarial verifier (+ deterministic hex-leak scan) | all of the above | `passed` + `issues[]` → one synthesizer fix round → re-verify | zero beige defaults, zero hex/font leakage in prompt bodies, every usable slug covered |
| **report** | script | — | `research/analysis-report.json`; `inspiration/manifest.json` `analysis.*` fields | — |

### prompt-seed contract (`research/prompts/<slug>-inspiration-prompt.md`)

```markdown
# <slug> · <style codename>
## ref-base            # absolute paths to the 2K slices -> ImagePaths / --input_image (never blind text-to-image)
## material            # substrate, light temperature, shadow falloff, zero plastic sheen — in words, no hex codes
## designer            # grid, scale jumps, >= 38-45% negative space, eye path, 2:1 pill optical padding
## developer           # column splits, radii, 1px seams, tabular-nums, complete footer closure
## do-not-copy         # ONLY place hex codes / proprietary font names / wordmarks / slogans may appear
```

Hard rules inherited from `jason-design-agent`: zero middle dots between nav/footer links, zero `FIG 0.1` labels, zero unprompted crypto motifs, zero warm-beige/cream/oat defaults, and prompt bodies describe colour temperature and letterform anatomy in words — hexes and font names live only under `## do-not-copy` so they are never leaked into Nano Banana as literal text.

### fallback without `run_workflow`

If the host has no `run_workflow` tool, fan out with `invoke_subagent` (`self`) — **at most 4 analyzers at a time**, one URL each, with the same two output paths and the same JSON summary — then run one synthesizer and one verifier subagent. Never let a single agent analyse all URLs serially; never let analyzers share an output file.

---

## 3. how the rest of the pipeline consumes it

- **`style-direction`** starts from `research/style-range.md` (already `5-10` named, separated directions) and the `avoid_fonts` block in `research/benchmarks.md`; it still runs live `google-font-selection`.
- **`image-gen`** conditions Round 1 on the `## ref-base` slices named in each prompt seed (`lock_and_verify_plates.py ref-base` can further cut `desktop-fullpage.png` at any `y`), never on empty wireframe seeds.
- **`design-critique`** judges every round back to `inspiration/<slug>-desktop-fullpage.png` + `desktop-fullpage-contact.jpg` (the whole page, not only the hero).
- **`jason-dev-agent`** links `inspiration/manifest.json` from every `projects/<slug>/` build, exactly as with a `nanofy` study.

## 4. turn accounting & limits

- The URL intake + analysis pass is part of **design turn 1** (it replaces open-web benchmark discovery; the rest of turn 1 is unchanged).
- Capture concurrency is `<= 4` tabs per pass; analyzer concurrency defaults to `4` (raise only for `> 12` URLs).
- A page longer than the ImageMagick ceiling is still captured top-down to the ceiling and flagged `desktop_truncated: true`; analysts must say so under *evidence limits*.
- Bot walls, blank scroll containers, or `> 30%` cookie walls are reported `unusable` and recaptured (`--site=<slug>`) or honestly replaced by public press/doc captures.
