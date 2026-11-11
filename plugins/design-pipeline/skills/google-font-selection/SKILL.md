---
name: google-font-selection
description: >-
  Find the right Google Fonts for ANY word, phrase, brief, or image ("wacky",
  "mobster", "y2k", "warm leather atelier", a UI screenshot, a poster). Pulls
  Google's LIVE catalog data at run time (official tag scores from
  google/fonts + fonts.google.com metadata, ~1,950 families), uses an LLM to
  associate the request with Google's official Feeling/Appearance tags, and
  ranks the whole catalog on Google's own 0-100 scores. Returns an honest Top
  5 with specimen URLs, CSS2 embeds, variable axes, download methods, and the
  equivalent fonts.google.com filter URL. No snapshot, no keyword dictionary.
  Use whenever a user wants font recommendations from a keyword, mood, brand
  brief, or image.
metadata:
  icon: 🔤
---

# Google Font Selection — Live Catalog + LLM Association

```text
skill / google-font-selection
────────────────────────────────────────────────────────────────────
input    any word, phrase, brief, or image   ("mobster", "wacky", "luxury editorial", poster.png)
data     LIVE from Google at run time: tags/all/families.csv (official 0-100 tag scores) + fonts.google.com/metadata
assoc    an LLM (you, Gemini, or Claude) maps the request → Google's official tags   ← the only "knowledge" step
rank     every family in the live catalog scored on those tags → honest Top 5 + fonts.google.com filter URL
```

> [!IMPORTANT]
> Nothing is memorised in this skill: no font snapshot, no synonym list. The catalog comes from Google live ([`gf_live.py`](scripts/gf_live.py), 6-hour temp cache only), and the association from a model. If there is no model key, **you are the model** — answer the prompt the CLI prints and feed it back as `--brief`.

## Inputs

- **Text**: keyword (`mobster`), mood (`calm wellness spa`), brand brief (`sunlit leather atelier homepage`).
- **Image** (`.png`, `.jpg`, `.webp`): UI, poster, moodboard, photo, type sample — read it yourself or let Gemini/Claude read it.
- **Code / doc file**: the voice, density, and domain of its content.

## Work

### Pass 0 — Associate the request with Google's official tags (LLM)

```bash
python3 {skill_dir}/scripts/recommend_google_fonts.py --artifact "mobster"
```
- With `GEMINI_API_KEY`/`GOOGLE_API_KEY` or `ANTHROPIC_API_KEY` set, the model is called automatically (images too) and you get results directly.
- Without a key the command exits `2` with `"status": "needs_model"` and `model_prompt` — the full prompt containing the live 74-tag vocabulary. **Answer it yourself**: write `brief.json` with 2–6 `tags` (defining quality = 1.0), 0–4 `avoid_tags`, optional `category` gate, and `confidence` (0.0 only for meaningless input). Hallucinated tags are dropped and reported in `dropped_tags`.

```json
{"query": "mobster", "tags": {"/Expressive/Vintage": 1.0, "/Theme/Art Deco": 0.9, "/Serif/Fat Face": 0.7, "/Expressive/Loud": 0.5},
 "avoid_tags": {"/Expressive/Cute": 0.9}, "category": [], "rationale": "prohibition-era gangster lettering", "confidence": 0.85}
```

### Pass 1 — Rank the live catalog

```bash
python3 {skill_dir}/scripts/recommend_google_fonts.py --brief brief.json --format markdown \
  --out-md font-recommendations.md --out-json font-recommendations.json \
  --specimen-html <artifactDir>/<slug>-fonts.html --embed-fonts
```
`--embed-fonts` inlines the five real `.woff2` files so the specimen renders inside Jetski's sandboxed right-hand Artifact Pane (which blocks all outbound requests). **Every run produces two artifacts**: the HTML specimen (`<slug>-fonts.html`) and the markdown report (`<slug>-font-report.md`, from `--out-md`) — register each with `write_file` (stub + `ArtifactMetadata`), copy the generated file over it, then make a 1-line `edit_file` so the pane snapshots it. Present the Top 5 table in chat as well — chat, specimen, and report all come from the same run.

> [!TIP]
> **No permission prompts.** The scripts need network (Google's live data + `.woff2` downloads), so they run unsandboxed. [`scripts/jetski_hook_allow.py`](scripts/jetski_hook_allow.py) is a `PreToolUse` hook that auto-allows *only* these skill scripts (any chained command still prompts). It is registered in this workspace's `_agents/hooks.json`; to apply it everywhere, add the same block to `~/.gemini/config/hooks.json`. Alternatives: click **Always allow** once on the `python3 …/recommend_google_fonts.py` prompt (prefix-matched), or in Agent Settings allow `read_url(raw.githubusercontent.com)`, `read_url(fonts.google.com)`, `read_url(fonts.gstatic.com)`, `read_url(fonts.googleapis.com)` so the scripts can run inside the sandbox.
Scoring per family: `0.50·tag fit + 0.30·primary-tag score − 0.25·avoid clash + quality/axes/popularity nudges`, hard tier for families ≥ 70 on the primary tag, category gate, non-Latin/Noto/color families excluded, one entry per family root (no `X SC` / `X Condensed` duplicates). `--fresh` bypasses the 6 h cache.

### Pass 2 — Verify, pair web-safe companion body, and present

Report `confidence` (`high`/`medium`/`low`) and `interpretation_hint` verbatim; never present a `low_confidence` list as a recommendation — re-translate or say the input has no typographic meaning. For each Top-5 family give: official tag evidence (`/Theme/Art Deco 100`), category, variable axes, `web_safe_body_ready` status, live-scored `recommended_pairing` (web-safe `/Purpose/Easy Reading` + multi-weight `400/500/600` companion body/UI/mono families with AI clichés excluded), specimen URL, CSS2 `<link>`, and the 4 download methods. Always include `google_fonts_url` (the same filter, live on fonts.google.com). *(When handing a Headline + Companion pair to Nano Banana inside `jason-design-agent`, run `../jason-design-agent/scripts/font_scale_and_pairing.py pair` & `prompt-block` to emit physical letterform anatomy and 4-surface CSS-to-`2K` scale locks.)*

## Input → Output Example

**Sample Input**: `Artifact: "mobster"` (brief above)

**Expected Output** (`font-recommendations.md` excerpt):
```markdown
- **Official tags requested**: `/Expressive/Vintage` ×1.0, `/Theme/Art Deco` ×0.9, `/Serif/Fat Face` ×0.7
- **Catalog**: all `1,950` Google Fonts families (live) scored on Google's official tag taxonomy
- **Live filtered catalog**: https://fonts.google.com/?categoryFilters=Feeling:%2FExpressive%2FVintage;Appearance:%2FTheme%2FArt%20Deco;Appearance:%2FSerif%2FFat%20Face

| Rank | Google Font Family | Category | Match Score | Official Tags | Google Fonts Specimen URL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#1** | **Limelight** | `DISPLAY` | `92.4%` (PASS) | `/Theme/Art Deco 100`, `/Expressive/Vintage 90` | https://fonts.google.com/specimen/Limelight |
| **#2** | **Notable** | `SANSSERIF` | `90.1%` (PASS) | `/Theme/Art Deco 100`, `/Theme/Woodtype 90` | https://fonts.google.com/specimen/Notable |
| **#3** | **Gravitas One** | `DISPLAY` | `88.7%` (PASS) | `/Serif/Fat Face 100`, `/Expressive/Vintage 84` | https://fonts.google.com/specimen/Gravitas+One |
```

## Result

`font-recommendations.md`, `font-recommendations.json` (`status`, `confidence`, `catalog_families_indexed`, `catalog_generated`, `artifact_analysis.official_tags`, `google_fonts_url`, `top_5_recommendations`), `font-specimen.html`. The standalone [`specimen.html`](specimen.html) (x20) does the same in the browser: fetches Google's live tag file, asks Gemini (key stored only in the user's browser) for the association, ranks client-side; also accepts a pasted agent brief.

### Verification

- [ ] `python3 {skill_dir}/scripts/test_google_font_skill.py` → `ALL TESTS PASSED` (live catalog integrity, brief validation, 10 agent-brief archetypes incl. `mobster`/`wacky`/`y2k`, CSS2 axis order across the live catalog, `needs_model` CLI contract, specimen embeds no data). With a model key it also runs the 33-case golden suite (`--run-eval-suite`).
- [ ] Every Top-5 entry carries `specimen_url`, `css2_url`, `html_link_tag`, 4 `download_methods`; `#1` scores ≥ 70 on the primary requested tag whenever `confidence` is `high`.

References: [`google-fonts-taxonomy.md`](references/google-fonts-taxonomy.md) (the 74 official tags, URL grammar, brief schema, ranking formula), [`contributing.md`](references/contributing.md).

--------------------------------------------------------------------------------

## Credits & Lineage

Built by Jason Festa (`jfesta`) on top of the live official tag-score taxonomy and metadata maintained by the **Google Fonts Team** (`github.com/google/fonts` `tags/all/families.csv` and `fonts.google.com/metadata/fonts`).

## Contributions

To contribute or modify this skill or its references, follow the
[contribution guidelines](references/contributing.md) before making changes.
