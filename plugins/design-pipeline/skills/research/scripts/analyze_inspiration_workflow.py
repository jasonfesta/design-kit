"""analyze_inspiration_workflow.py — multi-agent analysis of URL-list inspiration captures (research · jason-design-agent).

Run with the `run_workflow` tool (NOT python3 directly):

    run_workflow(
        ScriptPath="/usr/local/google/home/jfesta/skills/research/scripts/analyze_inspiration_workflow.py",
        Description="analyze inspiration captures -> property dossiers + prompt seeds + style range",
        Args={"study_dir": "/abs/path/<study-slug>", "user_prompt": "<the user's design brief>",
              "max_concurrency": 4, "analyzer_model": "inherit"},
    )

Prerequisite: `capture_fullpage_devtools.mjs --study-dir=<study> --urls=...` has run, so
`<study>/inspiration/manifest.json` lists one row per URL with the entire long desktop page captured.

Stages (each agent only sees its own prompt; outputs are files inside the study folder):
  1. load       read inspiration/manifest.json, keep rows with status == "captured"
  2. analyze    ONE analyzer agent PER URL in parallel (bounded by max_concurrency):
                reads the 4-column contact sheet + hero/mid/lower/footer 2K slices + fullpage-callouts.json,
                writes research/properties/<slug>.md (5-part anatomy, tokens, blocklists, takeaway) and
                research/prompts/<slug>-inspiration-prompt.md (tri-voice Nano Banana prompt seed + ImagePaths)
  3. qa         flag captures the analyzers judged unusable (bot wall, blank, truncated) -> recapture commands
  4. synthesize ONE synthesizer agent writes research/benchmarks.md + research/style-range.md (5-10 named
                non-beige directions) + research/prompts/README.md from every dossier
  5. verify     ONE adversarial verifier checks completeness/anti-beige/no-leakage; one fix round if it fails
  6. report     research/analysis-report.json + inspiration/manifest.json analysis status updated
"""

import json
import os
import re
import time

from advanced import parallel as bounded_parallel

STUDY_DIR = os.path.abspath(args.get("study_dir") or "")
USER_PROMPT = (args.get("user_prompt") or "").strip()
MAX_CONCURRENCY = int(args.get("max_concurrency") or 4)
ANALYZER_MODEL = args.get("analyzer_model") or "inherit"
SYNTH_MODEL = args.get("synth_model") or "inherit"

if not STUDY_DIR or not os.path.isdir(STUDY_DIR):
    raise SystemExit(f"study_dir does not exist: {STUDY_DIR!r}")

INSPIRATION_DIR = os.path.join(STUDY_DIR, "inspiration")
MANIFEST_PATH = os.path.join(INSPIRATION_DIR, "manifest.json")
RESEARCH_DIR = os.path.join(STUDY_DIR, "research")
PROPERTIES_DIR = os.path.join(RESEARCH_DIR, "properties")
PROMPTS_DIR = os.path.join(RESEARCH_DIR, "prompts")
TEMPLATE_REF = "/usr/local/google/home/jfesta/skills/research/references/benchmark-capture-and-evidence-rules.md"
PROTOCOL_REF = "/usr/local/google/home/jfesta/skills/research/references/url-intake-and-multi-agent-analysis.md"

if not os.path.exists(MANIFEST_PATH):
    raise SystemExit(f"missing {MANIFEST_PATH} — run capture_fullpage_devtools.mjs --study-dir=... --urls=... first")

os.makedirs(PROPERTIES_DIR, exist_ok=True)
os.makedirs(PROMPTS_DIR, exist_ok=True)


def abs_from_inspiration(rel):
    return os.path.normpath(os.path.join(INSPIRATION_DIR, rel)) if rel else None


# ------------------------------------------------------------------------------------------------
phase("1 · load inspiration manifest")
with open(MANIFEST_PATH, "r", encoding="utf-8") as fh:
    manifest = json.load(fh)

items = [it for it in manifest.get("items", []) if it.get("status") == "captured"]
skipped = [it for it in manifest.get("items", []) if it.get("status") != "captured"]
log(f"{len(items)} captured url(s) ready for analysis; {len(skipped)} skipped (pending/failed)")
for it in skipped:
    log(f"  skipped {it.get('slug')}: {it.get('status')} {it.get('error') or ''}")
if not items:
    raise SystemExit("no captured items in inspiration/manifest.json")

# ------------------------------------------------------------------------------------------------
phase("2 · analyze every url in parallel (1 agent per url)")

ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "slug": {"type": "string"},
        "property_md": {"type": "string"},
        "prompt_md": {"type": "string"},
        "style_codename": {"type": "string"},
        "chromatic_polarity": {"type": "string"},
        "layout_grid": {"type": "string"},
        "hero_mechanic": {"type": "string"},
        "fonts_observed": {"type": "array", "items": {"type": "string"}},
        "avoid_hexes": {"type": "array", "items": {"type": "string"}},
        "is_beige_default": {"type": "boolean"},
        "capture_quality": {"type": "string", "enum": ["clean", "partial", "unusable"]},
        "capture_issue": {"type": "string"},
        "design_score": {"type": "number"},
        "one_line_takeaway": {"type": "string"},
    },
    "required": [
        "slug", "property_md", "prompt_md", "style_codename", "chromatic_polarity", "layout_grid",
        "hero_mechanic", "fonts_observed", "avoid_hexes", "is_beige_default", "capture_quality",
        "design_score", "one_line_takeaway",
    ],
}


def analyzer_prompt(it):
    files = it.get("files", {})
    contact = abs_from_inspiration(files.get("desktop_contact"))
    slices = [abs_from_inspiration(p) for p in files.get("desktop_base_2k", [])]
    callouts = abs_from_inspiration(files.get("callouts_json"))
    mobile = abs_from_inspiration(files.get("mobile_base_2k"))
    fullpage = abs_from_inspiration(files.get("desktop_fullpage"))
    property_md = os.path.join(PROPERTIES_DIR, f"{it['slug']}.md")
    prompt_md = os.path.join(PROMPTS_DIR, f"{it['slug']}-inspiration-prompt.md")
    reads = [p for p in [contact, *slices, mobile] if p]
    return f"""Analyze inspiration capture {it['slug']} ({it['url']}) for jason-design-agent research.

You are one analyst in a parallel swarm; each analyst owns exactly one URL. Do NOT touch any file other than the two outputs below.
User design brief (context for the takeaway/adaptation only): {USER_PROMPT or '(none given)'}

Read the protocol first: {PROTOCOL_REF}
Dossier template (section 2): {TEMPLATE_REF}

Evidence to inspect with read_file (look at EVERY image — this is the entire long desktop page, not just the hero):
- 4-column full-page contact sheet (whole page top to bottom): {contact}
- 2K base slices (hero / mid / lower / footer): {json.dumps(slices)}
- structured callouts (sections, headings, CTAs, fonts/colors observed): {callouts}
- mobile 2K base (if present): {mobile or 'not captured yet'}
- raw entire-page png (only if you need to zoom a region): {fullpage}
Manifest metadata: title={it.get('title')!r}, desktop_px={it.get('desktop_px')}, truncated={it.get('desktop_truncated')}, sections={it.get('sections_extracted')}, body_bg={it.get('body_bg')}, fonts_observed={it.get('fonts_observed')}

Write TWO files:
1. {property_md} — follow the per-property markdown template exactly (header, navigation, EVERY tout & callout across the full page from hero to footer, each interaction, footer, typography & surface tokens, evidence limits, originality blocklist: fonts/hexes/motifs to avoid, takeaway & adaptation). Reference captures with relative paths like `../screenshots/{it['slug']}/desktop-fullpage-contact.jpg`. Cite real px/hex values from the callouts json where available. State honestly if the capture is a bot wall, blank, cookie-wall-covered, or truncated.
2. {prompt_md} — a Nano Banana-ready INSPIRATION PROMPT SEED derived strictly from this page: a `## ref-base` list of the 2K slice paths to pass as ImagePaths (image-to-image only, never blind text-to-image), then three voices — `## material` (substrate, light, shadow, zero plastic sheen), `## designer` (grid, scale jumps, negative space >= 38-45%, eye path, 2:1 pill optical padding), `## developer` (column splits, radii, 1px seams, tabular-nums, footer closure) — and a `## do-not-copy` block (this site's fonts, brand hexes, wordmark, slogans). The prompt body must contain ZERO literal hex codes and ZERO proprietary font names (describe letterform anatomy and color temperature in words instead); hexes/fonts live only under `## do-not-copy`. Keep nav/footer link lists free of middle dots and never invent crypto motifs.

Then call finish with the JSON result: slug, both absolute output paths, a 2-4 word style_codename, chromatic_polarity (e.g. "optic white + brushed steel", "nocturnal obsidian + amber"), layout_grid, hero_mechanic, fonts_observed (family names), avoid_hexes, is_beige_default (true if the page defaults to warm beige/cream/oat), capture_quality (clean|partial|unusable), capture_issue (empty string if none), design_score 1-10 (honest taste verdict), one_line_takeaway."""


async def run_analyzer(it):
    return await agent(
        analyzer_prompt(it),
        schema=ANALYSIS_SCHEMA,
        role=f"analyze {it['slug']}",
        model=ANALYZER_MODEL,
    )


t0 = time.time()
raw_results = await bounded_parallel(items, run_analyzer, max_concurrency=MAX_CONCURRENCY, return_exceptions=True)
analyses = []
analysis_errors = []
for it, res in zip(items, raw_results):
    if isinstance(res, BaseException):
        analysis_errors.append({"slug": it["slug"], "error": str(res)})
        log(f"  [ERR] {it['slug']}: {res}")
    else:
        if not res.get("slug"):
            res["slug"] = it["slug"]
        res["url"] = it["url"]
        analyses.append(res)
        log(f"  [{res['capture_quality']}] {it['slug']} · {res['style_codename']} · {res['chromatic_polarity']} · {res['design_score']}/10"
            + (" · BEIGE" if res.get("is_beige_default") else ""))
log(f"analysis pass: {len(analyses)} ok, {len(analysis_errors)} failed in {time.time() - t0:.0f}s")

# ------------------------------------------------------------------------------------------------
phase("3 · capture qa")
recapture = [a for a in analyses if a.get("capture_quality") == "unusable"]
partial = [a for a in analyses if a.get("capture_quality") == "partial"]
for a in recapture:
    log(f"  UNUSABLE {a['slug']}: {a.get('capture_issue')} -> node capture_fullpage_devtools.mjs --study-dir={STUDY_DIR} --phase=desktop --site={a['slug']}")
for a in partial:
    log(f"  partial {a['slug']}: {a.get('capture_issue')}")
usable = [a for a in analyses if a.get("capture_quality") != "unusable"]
if not usable:
    raise SystemExit("every capture was judged unusable — recapture before synthesis")

# ------------------------------------------------------------------------------------------------
phase("4 · synthesize benchmarks + named style range")

BENCHMARKS_MD = os.path.join(RESEARCH_DIR, "benchmarks.md")
STYLE_RANGE_MD = os.path.join(RESEARCH_DIR, "style-range.md")
PROMPTS_INDEX_MD = os.path.join(PROMPTS_DIR, "README.md")

SYNTH_SCHEMA = {
    "type": "object",
    "properties": {
        "benchmarks_md": {"type": "string"},
        "style_range_md": {"type": "string"},
        "style_names": {"type": "array", "items": {"type": "string"}},
        "avoid_fonts": {"type": "array", "items": {"type": "string"}},
        "beige_sources_rejected": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["benchmarks_md", "style_range_md", "style_names", "avoid_fonts"],
}

digest = [
    {k: a.get(k) for k in ("slug", "url", "property_md", "prompt_md", "style_codename", "chromatic_polarity",
                            "layout_grid", "hero_mechanic", "fonts_observed", "avoid_hexes", "is_beige_default",
                            "capture_quality", "design_score", "one_line_takeaway")}
    for a in usable
]

synthesizer = agent(
    f"""You are the research synthesizer for jason-design-agent (study: {STUDY_DIR}).
User design brief: {USER_PROMPT or '(none given)'}
Protocol: {PROTOCOL_REF} · benchmarks.md requirements: section 3 of {TEMPLATE_REF}
Hard rules: never average sources into one warm-beige compromise (#F4EFE6/#F6F2EA/#FAF6F0/#EFE9DF class surfaces are banned as defaults); every named style must occupy a radically different chromatic polarity, layout grid, and material world; log every observed proprietary font in avoid_fonts.""",
    role="synthesize style range",
    model=SYNTH_MODEL,
)

synth = await synthesizer(
    f"""Read every property dossier and prompt seed listed below (read_file each), then write three files:
1. {BENCHMARKS_MD} — comparison matrix (#01..#N, url, surface, aesthetic range, primary strength, design_score), consensus page architecture (header / nav / touts / interactions / footer), candidate component taxonomy (12-15 patterns), consolidated `avoid_fonts` + `avoid_palettes` blocklists, and a `## capture ledger` table (slug, desktop px, truncated?, quality).
2. {STYLE_RANGE_MD} — name 5 to 10 DISTINCT non-beige style directions that break down the first moodboard. For each: codename, inspiration lineage (which slugs/sections, with relative capture paths), chromatic polarity, layout grid, material world, hero mechanic, header/nav/tout/interaction/footer grammar, and which `research/prompts/<slug>-inspiration-prompt.md` seeds it should be conditioned on. Include a squint-test separation matrix proving no two directions collapse into each other.
3. {PROMPTS_INDEX_MD} — an index table of every prompt seed (slug, codename, polarity, ref-base slices) so image-gen can pick ImagePaths per direction.

Analyst digest (one row per url):
{json.dumps(digest, indent=2)}

Call finish with: benchmarks_md, style_range_md (absolute paths), style_names (5-10), avoid_fonts, beige_sources_rejected (slugs you refused to let seed a direction because they default to beige).""",
    SYNTH_SCHEMA,
)
log(f"style range: {', '.join(synth.get('style_names', []))}")

# ------------------------------------------------------------------------------------------------
phase("5 · adversarial verification (1 fix round max)")

VERIFY_SCHEMA = {
    "type": "object",
    "properties": {
        "passed": {"type": "boolean"},
        "issues": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["passed", "issues"],
}

expected_files = [a["property_md"] for a in usable] + [a["prompt_md"] for a in usable] + [BENCHMARKS_MD, STYLE_RANGE_MD, PROMPTS_INDEX_MD]


def leakage_scan():
    """Deterministic pre-check: hex codes / font names leaking into prompt bodies outside `## do-not-copy`."""
    issues = []
    hex_re = re.compile(r"#[0-9a-fA-F]{6}\b")
    for a in usable:
        p = a["prompt_md"]
        if not os.path.exists(p):
            issues.append(f"missing prompt seed: {p}")
            continue
        body = open(p, "r", encoding="utf-8").read()
        head, _, _tail = body.partition("## do-not-copy")
        if hex_re.search(head):
            issues.append(f"hex code leaked into prompt body (outside do-not-copy): {p}")
        if "ref-base" not in body:
            issues.append(f"prompt seed has no `## ref-base` ImagePaths block: {p}")
    for p in expected_files:
        if not os.path.exists(p):
            issues.append(f"missing expected file: {p}")
    return issues


pre_issues = leakage_scan()
for i in pre_issues:
    log(f"  pre-check: {i}")

verdict = await agent(
    f"""Verify the research package for study {STUDY_DIR} as a brutal designer-researcher.
Protocol: {PROTOCOL_REF}
Deterministic pre-check already found: {json.dumps(pre_issues)}
Check (read_file each):
- {STYLE_RANGE_MD}: 5-10 named directions, each with a DIFFERENT chromatic polarity + grid + material; zero warm-beige/cream/oat defaults; every direction cites real inspiration slugs and prompt seeds.
- {BENCHMARKS_MD}: matrix covers every usable slug {json.dumps([a['slug'] for a in usable])}; avoid_fonts and avoid_palettes present; capture ledger present.
- Every property dossier covers header, navigation, touts across the WHOLE page (not only the hero), interactions, footer, tokens, blocklist, takeaway: {json.dumps([a['property_md'] for a in usable])}
- Every prompt seed has `## ref-base`, the three voices, `## do-not-copy`, no hex codes or proprietary font names in the body, no middle dots in nav/footer lists, no unprompted crypto motifs.
Call finish with passed (true only if there are zero blocking issues) and a concise issues list (file + what to fix).""",
    schema=VERIFY_SCHEMA,
    role="verify research package",
)

if not verdict.get("passed"):
    log(f"verification failed with {len(verdict.get('issues', []))} issue(s); running one fix round")
    for i in verdict.get("issues", []):
        log(f"  - {i}")
    fix = await synthesizer(
        f"""The verifier rejected the package. Fix EVERY issue below by editing the named files in place (you may also patch property dossiers / prompt seeds), then call finish with the same schema as before.
Issues:
{json.dumps(verdict.get('issues', []), indent=2)}""",
        SYNTH_SCHEMA,
    )
    synth = fix
    verdict = await agent(
        f"""Re-verify after fixes for study {STUDY_DIR}. Previous issues: {json.dumps(verdict.get('issues', []))}. Same checklist and protocol ({PROTOCOL_REF}). Call finish with passed + remaining issues.""",
        schema=VERIFY_SCHEMA,
        role="re-verify research package",
    )
del synthesizer
log(f"verification: {'PASS' if verdict.get('passed') else 'FAIL'}")

# ------------------------------------------------------------------------------------------------
phase("6 · report")
for it in manifest.get("items", []):
    match = next((a for a in analyses if a["slug"] == it["slug"]), None)
    if match:
        it["analysis"] = {
            "property_md": os.path.relpath(match["property_md"], INSPIRATION_DIR),
            "prompt_md": os.path.relpath(match["prompt_md"], INSPIRATION_DIR),
            "status": "done" if match.get("capture_quality") != "unusable" else "recapture",
            "style_codename": match.get("style_codename"),
            "chromatic_polarity": match.get("chromatic_polarity"),
            "capture_quality": match.get("capture_quality"),
            "design_score": match.get("design_score"),
            "is_beige_default": match.get("is_beige_default"),
        }
manifest["analysis_generated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
manifest["style_names"] = synth.get("style_names", [])
with open(MANIFEST_PATH, "w", encoding="utf-8") as fh:
    json.dump(manifest, fh, indent=2)

report = {
    "study_dir": STUDY_DIR,
    "user_prompt": USER_PROMPT,
    "generated_at": manifest["analysis_generated_at"],
    "analyzed": len(analyses),
    "failed_analyzers": analysis_errors,
    "recapture_needed": [a["slug"] for a in recapture],
    "partial_captures": [a["slug"] for a in partial],
    "style_names": synth.get("style_names", []),
    "avoid_fonts": synth.get("avoid_fonts", []),
    "beige_sources_rejected": synth.get("beige_sources_rejected", []),
    "verification": verdict,
    "files": {
        "benchmarks_md": BENCHMARKS_MD,
        "style_range_md": STYLE_RANGE_MD,
        "prompts_index_md": PROMPTS_INDEX_MD,
        "properties": [a["property_md"] for a in analyses],
        "prompt_seeds": [a["prompt_md"] for a in analyses],
    },
    "analyses": analyses,
}
report_path = os.path.join(RESEARCH_DIR, "analysis-report.json")
with open(report_path, "w", encoding="utf-8") as fh:
    json.dump(report, fh, indent=2)
log(f"report -> {report_path}")
print(json.dumps({
    "passed": verdict.get("passed"),
    "analyzed": len(analyses),
    "recapture_needed": report["recapture_needed"],
    "style_names": report["style_names"],
    "report": report_path,
}, indent=2))
