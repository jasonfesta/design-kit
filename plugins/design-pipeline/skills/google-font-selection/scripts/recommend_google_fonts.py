#!/usr/bin/env python3
"""recommend_google_fonts.py — rank the LIVE Google Fonts catalog (≈1,950 families, fetched from Google at run time)
against Google's official tag taxonomy, using an LLM for the word/image → tag association. No snapshot, no keyword dictionary.

Pipeline
  Layer 1  translate_brief.py   LLM: any word / phrase / brief / image  ->  brief.json (official tags + weights)
  Layer 2  this file            score every family on those tags (+ category gate, variable axes, popularity)
  Layer 3  this file            confidence from REAL tag evidence; LOW CONFIDENCE instead of a fake PASS

Usage
  python3 recommend_google_fonts.py --artifact "wacky"                         # model via GEMINI_API_KEY / ANTHROPIC_API_KEY, else prints the prompt for the agent
  python3 recommend_google_fonts.py --artifact "wacky" --backend gemini         # LLM translation (GEMINI_API_KEY)
  python3 recommend_google_fonts.py --artifact poster.png --backend anthropic   # vision translation (ANTHROPIC_API_KEY)
  python3 recommend_google_fonts.py --brief brief.json                          # agent-authored brief (full catalog)
  python3 recommend_google_fonts.py --artifact "..." --format markdown --out-md r.md --out-json r.json --specimen-html s.html
  python3 recommend_google_fonts.py --run-eval-suite                            # 33-case golden set (needs a model key)
  python3 recommend_google_fonts.py --fresh                                     # bypass the 6h temp cache of the live catalog
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from gf_live import fetch_live  # noqa: E402
from translate_brief import IMAGE_EXT, NeedsModel, translate, validate_brief  # noqa: E402

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
CATEGORY_LABEL = {"Serif": "serif", "Sans Serif": "sans-serif", "Display": "display", "Handwriting": "handwriting", "Monospace": "monospace"}
AI_CLICHE_FAMILIES = {
    "Inter",
    "Roboto",
    "Plus Jakarta Sans",
    "DM Sans",
    "Instrument Serif",
    "Playfair Display",
    "Cormorant Garamond",
    "DM Serif Display",
    "Cinzel",
}
FALLBACK_PAIRINGS = {
    "serif": {"sans": "Work Sans", "mono": "IBM Plex Mono"},
    "sans-serif": {"serif": "Source Serif 4", "mono": "IBM Plex Mono"},
    "display": {"sans": "Work Sans", "serif": "Source Serif 4", "mono": "IBM Plex Mono"},
    "handwriting": {"sans": "Nunito Sans", "serif": "Lora"},
    "monospace": {"sans": "IBM Plex Sans", "serif": "Source Serif 4"},
}


def has_web_safe_body_weights(fam: dict) -> bool:
    """True when a family ships regular + medium/semibold weights or a variable wght axis spanning 400..600."""
    for a in fam.get("axes", []):
        if a.get("tag") == "wght" and float(a.get("min", 400)) <= 400 and float(a.get("max", 400)) >= 600:
            return True
    weights = set(fam.get("weights") or [])
    return 400 in weights and bool(weights.intersection({500, 600, 700}))


def build_companion_pools(snap: dict, exclude: set[str] | None = None) -> dict[str, list[str]]:
    """Rank live web-safe, accessible body/UI workhorse families by Google's /Purpose/Easy Reading + /Quality/* tags."""
    blocked = set(exclude or set()) | AI_CLICHE_FAMILIES
    pools: dict[str, list[tuple[float, str]]] = {"sans": [], "serif": [], "mono": []}
    names = set(snap["families"].keys())
    for name, fam in snap["families"].items():
        if name in blocked or not fam.get("latin", True) or fam.get("noto") or fam.get("color"):
            continue
        if fam.get("script") not in ("", "Latn", None):
            continue
        if base_family(name) != name and base_family(name) in names:
            continue
        if re.search(r"\b(SC|Condensed|Narrow|Expanded|Display|Inline|Pixel|Stencil|Slab|Barcode|Redaction)\b", name, re.I):
            continue
        if not has_web_safe_body_weights(fam):
            continue
        cat = CATEGORY_LABEL.get(fam.get("category", ""), "display")
        tags = family_tags(snap, fam)
        if not tags:
            continue
        # Reject novelty, script, distressed, or loud display faces from body/UI companion pools
        if any(tags.get(bad_t, 0) >= 35 for bad_t in (
            "/Expressive/Loud", "/Theme/Wacky", "/Theme/Distressed", "/Theme/Pixel",
            "/Theme/Blackletter", "/Theme/Stencil", "/Special use/Barcode", "/Special use/Redaction",
        )):
            continue
        easy = tags.get("/Purpose/Easy Reading", 0) / 100.0
        qual = (
            tags.get("/Quality/Drawing", 70)
            + tags.get("/Quality/Spacing", 70)
            + tags.get("/Quality/Wordspace", 70)
        ) / 300.0
        comp = tags.get("/Expressive/Competent", 0) / 100.0
        calm = tags.get("/Expressive/Calm", 0) / 100.0
        ital_bonus = 0.06 if fam.get("italic") else 0.0
        var_bonus = 0.06 if any(a.get("tag") == "wght" for a in fam.get("axes", [])) else 0.0
        pop = fam.get("popularity") or 1500
        pop_bonus = max(0.0, 0.08 * (1 - min(pop, 800) / 800.0))
        score = 0.42 * easy + 0.24 * qual + 0.12 * comp + 0.08 * calm + ital_bonus + var_bonus + pop_bonus
        if cat == "sans-serif":
            humanist = max(tags.get("/Sans/Humanist", 0), tags.get("/Sans/Neo Grotesque", 0), tags.get("/Sans/Grotesque", 0)) / 100.0
            if easy >= 0.45 or humanist >= 0.60:
                pools["sans"].append((score + 0.12 * humanist, name))
        elif cat == "serif":
            text_serif = max(tags.get("/Serif/Old Style Garalde", 0), tags.get("/Serif/Transitional", 0), tags.get("/Serif/Scotch", 0)) / 100.0
            if (easy >= 0.40 or text_serif >= 0.60) and tags.get("/Serif/Fat Face", 0) < 40:
                pools["serif"].append((score + 0.12 * text_serif, name))
        elif cat == "monospace":
            if tags.get("/Monospace/Monospace", 0) >= 60:
                pools["mono"].append((score, name))
    return {
        k: [n for _, n in sorted(v, key=lambda x: (-x[0], x[1]))[:12]]
        for k, v in pools.items()
    }


def pick_companion_for(primary_name: str, cat: str, rank_idx: int, pools: dict[str, list[str]]) -> dict[str, str]:
    """Select distinct, live-ranked web-safe companion body/UI/mono families rotated cleanly across Top-5 ranks."""
    p_base = base_family(primary_name)

    def pick(pool_key: str, fallback: str) -> str:
        candidates = [c for c in pools.get(pool_key, []) if base_family(c) != p_base and c != primary_name]
        if not candidates:
            return fallback
        return candidates[rank_idx % min(len(candidates), 6)]

    fb = FALLBACK_PAIRINGS.get(cat, FALLBACK_PAIRINGS["display"])
    if cat == "serif":
        return {"sans": pick("sans", fb["sans"]), "mono": pick("mono", fb["mono"])}
    if cat == "sans-serif":
        return {"sans": pick("sans", "Work Sans"), "serif": pick("serif", fb["serif"]), "mono": pick("mono", fb["mono"])}
    if cat == "display":
        return {"sans": pick("sans", fb["sans"]), "serif": pick("serif", fb["serif"]), "mono": pick("mono", fb["mono"])}
    if cat == "handwriting":
        return {"sans": pick("sans", fb["sans"]), "serif": pick("serif", fb["serif"])}
    return {"sans": pick("sans", fb["sans"]), "serif": pick("serif", fb["serif"])}


# ----------------------------------------------------------------------------- catalog access
def family_tags(snap: dict, fam: dict) -> dict[str, int]:
    tl = snap["tag_list"]
    return {tl[i]: s for i, s in fam["t"]}


def css2_spec(name: str, fam: dict) -> str:
    """Build a correct CSS2 family spec with alphabetical axis ordering (lowercase before uppercase)."""
    family_plus = name.replace(" ", "+")
    axes = {a["tag"]: a for a in fam.get("axes", [])}
    weights = fam.get("weights") or [400]
    ital = fam.get("italic", False)
    axis_tags = sorted([t for t in axes if t.islower() and t != "ital"]) + sorted([t for t in axes if t.isupper()])
    if not axes and not ital and weights == [400]:
        return family_plus
    cols = (["ital"] if ital else []) + [t for t in axis_tags if t in ("opsz", "slnt", "wdth", "wght")] + [t for t in axis_tags if t.isupper()]
    if "wght" not in axes and "wght" not in cols:
        # static family: enumerate weights
        if ital:
            vals = ";".join([f"0,{w}" for w in weights] + [f"1,{w}" for w in weights])
            return f"{family_plus}:ital,wght@{vals}"
        return f"{family_plus}:wght@{';'.join(str(w) for w in weights)}"

    def rng(tag: str) -> str:
        a = axes.get(tag)
        if not a:
            return "400"
        lo, hi = a["min"], a["max"]
        f = lambda v: str(int(v)) if float(v).is_integer() else str(v)
        return f"{f(lo)}..{f(hi)}" if lo != hi else f(lo)

    if "wght" not in cols:
        cols.insert(1 if ital else 0, "wght")
    axis_cols = [c for c in cols if c != "ital"]
    tuple_vals = ",".join(rng(c) for c in axis_cols)
    if ital:
        return f"{family_plus}:{','.join(cols)}@0,{tuple_vals};1,{tuple_vals}"
    return f"{family_plus}:{','.join(cols)}@{tuple_vals}"


def font_links(name: str, fam: dict) -> dict:
    spec = css2_spec(name, fam)
    css2_url = f"https://fonts.googleapis.com/css2?family={spec}&display=swap"
    slug = name.lower().replace(" ", "-")
    compact = name.lower().replace(" ", "")
    return {
        "specimen_url": f"https://fonts.google.com/specimen/{quote_plus(name)}",
        "css2_url": css2_url,
        "html_link_tag": (
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            f'<link href="{css2_url}" rel="stylesheet">'
        ),
        "css_import": f"@import url('{css2_url}');",
        "download_methods": {
            "npm_fontsource": f"npm install @fontsource{'-variable' if fam.get('axes') else ''}/{slug}",
            "curl_woff2": f'curl -sA "{UA}" "{css2_url}" | grep -oE "https://fonts.gstatic.com/[^)]+\\.woff2" | head -n 1 | xargs curl -L -o "{slug}.woff2"',
            "github_source_ttf": f"https://github.com/google/fonts/tree/main/ofl/{compact}",
            "webfonts_helper_zip": f"https://gwfh.mranftl.com/api/fonts/{slug}?download=zip&subsets=latin&formats=woff2",
        },
    }


VARIANT_SUFFIX = re.compile(r"\s+(SC|Condensed|Semi Condensed|Extra Condensed|Expanded|Narrow|Mono|Arabic|Hebrew|Thai|Devanagari|Bengali|Tamil|Telugu|Kannada|Malayalam|Gujarati|Gurmukhi|Sinhala|Khmer|Lao|Myanmar|Ethiopic|Armenian|Georgian|Korean|KR|JP|SC|TC|HK|Cyrillic|Greek|Vietnamese|Display|Text|Caption|Headline|Micro|Variable)$", re.I)


def base_family(name: str) -> str:
    prev = None
    while prev != name:
        prev, name = name, VARIANT_SUFFIX.sub("", name)
    return name


# ----------------------------------------------------------------------------- Layer 2: ranking
def rank_catalog(brief: dict, snap: dict, top_n: int = 5, exclude_noto: bool = True) -> list[dict]:
    want = brief.get("tags") or {}
    avoid = brief.get("avoid_tags") or {}
    cats = set(brief.get("category") or [])
    total_w = sum(want.values()) or 1.0
    total_avoid = sum(avoid.values()) or 1.0
    names = set(snap["families"].keys())
    scored = []
    for name, fam in snap["families"].items():
        if not fam.get("latin", True) or (exclude_noto and fam.get("noto")) or fam.get("color"):
            continue
        if fam.get("script") not in ("", "Latn", None):
            continue  # regional / non-Latin primary script families (Arabic, Telugu, JP ...)
        cat = CATEGORY_LABEL.get(fam.get("category", ""), "display")
        if cats and cat not in cats:
            continue
        tags = family_tags(snap, fam)
        if not tags:
            continue
        # evidence: weighted mean of official tag scores for wanted tags (0..1)
        fit = sum(w * tags.get(t, 0) / 100.0 for t, w in want.items()) / total_w
        # emphasise the primary tag(s) so "/Theme/Wacky":1.0 dominates over secondary feelings.
        # Ties / near-ties at the top weight are all considered primary (best one counts).
        max_w = max(want.values()) if want else 0.0
        primary_tags = [t for t, w in want.items() if w >= max_w - 0.05]
        primary = max((tags.get(t, 0) / 100.0 for t in primary_tags), default=0.0)
        clash = sum(w * tags.get(t, 0) / 100.0 for t, w in avoid.items()) / total_avoid if avoid else 0.0
        quality = (tags.get("/Quality/Concept", 70) + tags.get("/Quality/Drawing", 70) + tags.get("/Quality/Spacing", 70)) / 300.0
        axes = fam.get("axes", [])
        axis_bonus = 0.03 * min(len(axes), 2) + (0.02 if fam.get("italic") else 0.0)
        pop = fam.get("popularity") or 1500
        pop_bonus = max(0.0, 0.04 * (1 - min(pop, 1500) / 1500.0))
        variant_penalty = 0.15 if (base_family(name) != name and base_family(name) in names) else 0.0
        if re.search(r"\b(SC|Guides|Grid|Prop)\b", name):
            variant_penalty += 0.15  # small-caps / handwriting-guide / grid sub-variants should never outrank the parent
        score = (0.50 * fit + 0.30 * primary) - 0.25 * clash + 0.08 * quality + axis_bonus + pop_bonus - variant_penalty
        matched = {t: tags.get(t, 0) for t in want if tags.get(t, 0) >= 50}
        # tiering: families that strongly exhibit the PRIMARY requested tag (>= 70) always rank above those that don't
        tier = 1 if primary >= 0.7 else 0
        scored.append((tier, score, fit, primary, clash, matched, name, fam, tags))
    scored.sort(key=lambda x: (-x[0], -x[1], x[6]))
    companion_pools = build_companion_pools(snap, exclude=set(brief.get("avoid_families") or []))
    out, seen_bases = [], set()
    for tier, score, fit, primary, clash, matched, name, fam, tags in scored:
        if len(out) >= top_n:
            break
        b = base_family(name)
        if b in seen_bases:
            continue  # one entry per family root (no "X" + "X SC" + "X Condensed")
        seen_bases.add(b)
        rank = len(out) + 1
        cat = CATEGORY_LABEL.get(fam.get("category", ""), "display")
        top_tags = sorted(((t, s) for t, s in tags.items() if not t.startswith("/Quality/")), key=lambda kv: -kv[1])[:6]
        out.append({
            "rank": rank,
            "family": name,
            "category": cat.upper().replace("-", ""),
            "match_score": round(min(99.5, 40 + 60 * max(0.0, min(1.0, score))), 1),
            "web_safe_body_ready": has_web_safe_body_weights(fam) and tags.get("/Purpose/Easy Reading", 0) >= 45,
            "eval_Breakdown": {
                "eval_verdict": "PASS" if (primary >= 0.7 or (fit >= 0.55 and primary >= 0.6)) else ("REVIEW" if (fit >= 0.35 or primary >= 0.5) else "WEAK"),
                "composite_eval_score": round(100 * max(0.0, min(1.0, score)), 1),
                "tag_fit": round(100 * fit, 1),
                "primary_tag_score": round(100 * primary, 1),
                "clash": round(100 * clash, 1),
                "matched_official_tags": matched,
            },
            "official_tags": [f"{t} {s}" for t, s in top_tags],
            "variable_axes": [f"{a['tag']} ({a['min']:g}..{a['max']:g})" for a in fam.get("axes", [])] or [f"wght ({';'.join(map(str, fam.get('weights') or [400]))})"],
            "weights": fam.get("weights"),
            "italic": fam.get("italic", False),
            "popularity_rank": fam.get("popularity"),
            "recommended_pairing": pick_companion_for(name, cat, rank - 1, companion_pools),
            "rationale": f"Official Google Fonts tags: " + ", ".join(f"{t.split('/')[-1]} {s}" for t, s in top_tags[:4]),
            **font_links(name, fam),
        })
    return out


def assess_confidence(brief: dict, top: list[dict]) -> tuple[str, str | None]:
    if not brief.get("tags"):
        return "low", "No official Google Fonts tag could be inferred from this input. Ask the agent to interpret it (or try other words)."
    if not top:
        return "low", "Tags were inferred but no family matched the category gate."
    best = top[0]["eval_Breakdown"]
    strong = max(best["matched_official_tags"].values(), default=0)
    if brief.get("confidence", 0) >= 0.6 and strong >= 70 and (best["primary_tag_score"] >= 60 or best["tag_fit"] >= 55):
        return "high", None
    if best["primary_tag_score"] >= 40 or strong >= 60:
        return "medium", "Partial tag evidence — review the Top 5 and the fonts.google.com filter link before committing."
    return "low", "Weak tag evidence for this request; results are the nearest available families, not a strong match."


# ----------------------------------------------------------------------------- Layer 3: reports
def format_markdown_report(brief: dict, top: list[dict], confidence: str, note: str | None, total: int) -> str:
    lines = ["# Google Font Recommendation Report", ""]
    if confidence != "high":
        lines += [f"> [!WARNING] **{confidence.upper()} CONFIDENCE** — {note}", ""]
    lines += [
        f"- **Input**: `{brief.get('query', '')}` (`{brief.get('modality', 'text')}`, translated by `{brief.get('source')}`)",
        f"- **Official tags requested**: " + ", ".join(f"`{t}` ×{w}" for t, w in brief.get("tags", {}).items()),
    ]
    if brief.get("avoid_tags"):
        lines.append("- **Avoid**: " + ", ".join(f"`{t}`" for t in brief["avoid_tags"]))
    lines += [
        f"- **Catalog**: all `{total:,}` Google Fonts families scored on Google's official tag taxonomy",
        f"- **Live filtered catalog**: {brief.get('google_fonts_url')}",
        "",
        "## Top 5 Recommended Google Fonts",
        "",
        "| Rank | Google Font Family | Category | Match Score | Official Tags | Variable Axes | Google Fonts Specimen URL | Companion Pairing |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
    ]
    for f in top:
        pair = ", ".join(f"{k}: `{v}`" for k, v in f["recommended_pairing"].items())
        lines.append(
            f"| **#{f['rank']}** | **{f['family']}** | `{f['category']}` | `{f['match_score']}%` ({f['eval_Breakdown']['eval_verdict']}) | "
            f"{', '.join('`' + t + '`' for t in f['official_tags'][:3])} | {', '.join('`' + a + '`' for a in f['variable_axes'])} | {f['specimen_url']} | {pair} |"
        )
    lines += ["", "## Embed & Download", ""]
    for f in top:
        dm = f["download_methods"]
        lines += [
            f"### #{f['rank']} {f['family']}",
            "```html", f["html_link_tag"], "```",
            f"- npm: `{dm['npm_fontsource']}`",
            f"- GitHub TTF source: {dm['github_source_ttf']}",
            f"- Multi-weight .zip: {dm['webfonts_helper_zip']}",
            "",
        ]
    return "\n".join(lines) + "\n"


def fetch_embedded_fonts(top: list[dict]) -> dict[str, dict]:
    """Download one latin .woff2 per family (variable file when available) and return {family: {mime, b64, descriptor}}.
    Used for self-contained specimens that must render where outbound requests are blocked (e.g. Jetski's artifact pane)."""
    import base64
    out = {}
    for f in top:
        try:
            with urlopen(Request(f["css2_url"], headers={"User-Agent": UA}), timeout=20) as resp:
                css = resp.read().decode("utf-8")
            blocks = [b for b in css.split("@font-face") if "url(" in b]
            # prefer: latin subset, normal style, widest weight range
            def rank_block(b: str) -> tuple:
                return ("U+0000-00FF" in b, "font-style: normal" in b, ".." in (re.search(r"font-weight:\s*([^;]+);", b) or [None, ""])[1])
            best = max(blocks, key=rank_block)
            url = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)", best).group(1)
            weight = (re.search(r"font-weight:\s*([^;]+);", best) or [None, "400"])[1].strip()
            with urlopen(Request(url, headers={"User-Agent": UA}), timeout=20) as r2:
                b64 = base64.b64encode(r2.read()).decode("ascii")
            out[f["family"]] = {"mime": "font/woff2", "b64": b64, "weight": weight}
        except Exception as exc:  # keep going; the card will fall back to the generic family
            out[f["family"]] = {"error": str(exc)}
    return out


def generate_specimen_html(brief: dict, top: list[dict], confidence: str, out_path: Path, embedded_fonts: dict | None = None) -> None:
    link = "&".join("family=" + f["css2_url"].split("family=")[1].split("&display")[0] for f in top)
    face_css = ""
    if embedded_fonts:
        for fam, ef in embedded_fonts.items():
            if "b64" in ef:
                face_css += f"@font-face{{font-family:'{html.escape(fam)}';font-weight:{ef['weight']};font-style:normal;src:url(data:{ef['mime']};base64,{ef['b64']}) format('woff2');}}\n"
    cards = []
    for f in top:
        fb = {"MONOSPACE": "monospace", "SERIF": "serif", "HANDWRITING": "cursive"}.get(f["category"], "sans-serif")
        stack = f"'{html.escape(f['family'])}', {fb}"
        cards.append(f"""
      <section class="font-block">
        <div class="font-header">
          <div><span class="rank">0{f['rank']}</span> <span class="font-name">{html.escape(f['family'])}</span>
          <span class="font-meta">{f['category']} · {f['match_score']}% · {html.escape(' · '.join(f['official_tags'][:3]))}</span></div>
          <div class="links"><a href="{f['specimen_url']}" target="_blank" rel="noopener">Google Fonts ↗</a>
          <a class="dl" href="{f['download_methods']['webfonts_helper_zip']}" target="_blank" rel="noopener">Download .zip</a></div>
        </div>
        <div class="fox" style="font-family:{stack}">The quick brown fox jumps over the lazy dog.</div>
        <div class="weights" style="font-family:{stack}">
          <div><span class="w-lbl">300</span><span style="font-weight:300">The quick brown fox jumps over the lazy dog</span></div>
          <div><span class="w-lbl">400</span><span style="font-weight:400">The quick brown fox jumps over the lazy dog</span></div>
          <div><span class="w-lbl">400 i</span><span style="font-style:italic">The quick brown fox jumps over the lazy dog</span></div>
          <div><span class="w-lbl">700</span><span style="font-weight:700">The quick brown fox jumps over the lazy dog</span></div>
        </div>
      </section>""")
    head_links = "" if embedded_fonts else f"""<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?{link}&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@8..144,400..700&display=swap" rel="stylesheet">"""
    pane_note = ' · <strong>fonts embedded</strong> — to search again, ask the agent in chat (e.g. “fonts for a 1970s surf shop”)' if embedded_fonts else ""
    page = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Font specimen — {html.escape(brief.get('query', ''))}</title>
{head_links}
<style>
{face_css}
:root,[data-theme="light"]{{--bg:#FFFFFF;--ink:#18181B;--ink-strong:#000000;--muted:#686873;--border:#E6E6EB;--surface:#F7F7F9}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#000000;--ink:#F4F4F6;--ink-strong:#FFFFFF;--muted:#8A8A95;--border:#1A1A22;--surface:#0A0A0D}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font-family:"Google Sans Flex",-apple-system,sans-serif;font-size:14px;line-height:1.55}}
.sheet{{max-width:980px;margin:0 auto;padding:36px 32px 64px}} .meta{{color:var(--muted);font-size:12px;margin-bottom:28px}}
.font-block{{margin-bottom:34px}} .font-header{{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px}}
.rank{{color:var(--muted);font-size:12px}} .font-name{{font-weight:600;font-size:16px;color:var(--ink-strong)}} .font-meta{{color:var(--muted);font-size:12px;margin-left:8px}}
.links a{{color:var(--muted);text-decoration:none;font-size:12px;margin-left:10px}} .links a.dl{{padding:4px 11px;border:1px solid var(--border);border-radius:999px;color:var(--ink-strong)}}
.fox{{font-size:26px;line-height:1.24;color:var(--ink-strong);margin-bottom:10px}} .weights div{{display:flex;gap:10px;font-size:13.5px}} .w-lbl{{width:50px;color:var(--muted);font-size:12px;flex-shrink:0}}
</style></head><body><div class="sheet">
<h1 style="font-size:18px;font-weight:600;color:var(--ink-strong);margin:0 0 6px">google-font-selection · {html.escape(brief.get('query', ''))}</h1>
<p class="meta">Confidence: {confidence} · tags: {html.escape(', '.join(brief.get('tags', {}).keys()))} · <a href="{brief.get('google_fonts_url')}" target="_blank" rel="noopener" style="color:inherit">open filtered catalog on fonts.google.com ↗</a>{pane_note}</p>
{''.join(cards)}
</div></body></html>
"""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(page, encoding="utf-8")


def download_top_fonts(top: list[dict], download_dir: Path) -> list[str]:
    download_dir.mkdir(parents=True, exist_ok=True)
    done = []
    for f in top:
        req = Request(f["css2_url"], headers={"User-Agent": UA})
        with urlopen(req, timeout=20) as resp:
            css = resp.read().decode("utf-8")
        urls = re.findall(r"https://fonts\.gstatic\.com/[^)]+\.woff2", css)
        if urls:
            with urlopen(Request(urls[0], headers={"User-Agent": UA}), timeout=20) as r2:
                dest = download_dir / (f["family"].lower().replace(" ", "-") + ".woff2")
                dest.write_bytes(r2.read())
                done.append(str(dest))
    return done


# ----------------------------------------------------------------------------- orchestration
def recommend(artifact: str | None, brief_path: str | None, backend: str, model: str | None, snap: dict) -> dict:
    if brief_path:
        raw = json.loads(Path(brief_path).read_text(encoding="utf-8"))
        raw.setdefault("source", "agent")
        brief = validate_brief(raw, snap["tag_list"])
    else:
        art = artifact or ""
        p = Path(art)
        is_image = p.is_file() and p.suffix.lower() in IMAGE_EXT
        query = art if not is_image else p.stem.replace("-", " ").replace("_", " ")
        if p.is_file() and not is_image:
            try:
                query = (p.stem.replace("-", " ") + " " + p.read_text(encoding="utf-8", errors="ignore")[:4000])
            except OSError:
                pass
        try:
            brief = translate(query, snap["tag_list"], backend=backend, image=str(p) if is_image else None, model=model)
        except NeedsModel as nm:
            return {"status": "needs_model", "confidence": "low", "catalog_families_indexed": snap["family_count"], "catalog_generated": snap["generated"],
                    "artifact_analysis": {"artifact": art, "modality": "image" if is_image else "text"},
                    "interpretation_hint": "No model key set. Answer the prompt below (you are the model), save it as brief.json, and re-run with --brief brief.json.",
                    "model_prompt": nm.prompt, "top_5_recommendations": [], "_brief": {"query": art, "tags": {}, "source": "none"}}
        brief["query"] = art
    top = rank_catalog(brief, snap)
    confidence, note = assess_confidence(brief, top)
    return {
        "status": "pass" if confidence == "high" else ("review" if confidence == "medium" else "low_confidence"),
        "confidence": confidence,
        "catalog_families_indexed": snap["family_count"],
        "catalog_generated": snap["generated"],
        "artifact_analysis": {
            "artifact": brief.get("query"),
            "modality": brief.get("modality"),
            "translated_by": brief.get("source"),
            "official_tags": brief.get("tags"),
            "avoid_tags": brief.get("avoid_tags"),
            "category_gate": brief.get("category"),
            "google_fonts_url": brief.get("google_fonts_url"),
            "rationale": brief.get("rationale"),
            "translation_confidence": brief.get("confidence"),
            "unresolved_terms": brief.get("unresolved_terms", []),
            "dropped_tags": brief.get("dropped_tags", []),
        },
        "interpretation_hint": note,
        "top_5_recommendations": top,
        "_brief": brief,
    }


# ----------------------------------------------------------------------------- 30-case golden eval
EVAL_SUITE = [
    # (input, expected tag that the #1 family must score >= 70 on, at least one of these families in top 5 OR None)
    ("wacky", "/Theme/Wacky", None),
    ("goofy cartoon", "/Theme/Wacky", None),
    ("silly kids party", "/Expressive/Childlike", None),
    ("cute kawaii", "/Expressive/Cute", None),
    ("spooky halloween", "/Seasonal/Halloween", None),
    ("haunted house", "/Seasonal/Halloween", None),
    ("gothic blackletter", "/Theme/Blackletter", None),
    ("medieval fantasy", "/Theme/Medieval", None),
    ("y2k", "/Theme/Techno", None),
    ("cyberpunk futuristic", "/Theme/Techno", None),
    ("8-bit arcade", "/Theme/Pixel", None),
    ("western saloon", "/Theme/Woodtype", None),
    ("circus poster", "/Theme/Tuscan", None),
    ("art deco gatsby", "/Theme/Art Deco", None),
    ("grunge distressed", "/Theme/Distressed", None),
    ("military stencil", "/Theme/Stencil", None),
    ("brush paint", "/Theme/Brush", None),
    ("handwritten note", "/Script/Handwritten", None),
    ("wedding invitation calligraphy", "/Script/Formal", None),
    ("fashion magazine didone", "/Serif/Didone", None),
    ("luxury elegant", "/Serif/Didone", None),
    ("warm leather atelier", "/Serif/Old Style Garalde", None),
    ("classic book garamond", "/Serif/Old Style Garalde", None),
    ("newspaper editorial", "/Serif/Transitional", None),
    ("developer cli terminal", "/Monospace/Monospace", None),
    ("minimal swiss ui", "/Sans/Neo Grotesque", None),
    ("geometric modern app", "/Sans/Geometric", None),
    ("soft rounded friendly", "/Sans/Rounded", None),
    ("corporate bank", "/Expressive/Business", None),
    ("calm wellness spa", "/Expressive/Calm", None),
]
NONSENSE = ["asdfgh", "qwzx plmk", "12345"]


def run_eval_suite(snap: dict) -> dict:
    cases, passed = [], 0
    for text, tag, families in EVAL_SUITE:
        res = recommend(text, None, "auto", None, snap)
        top = res["top_5_recommendations"]
        want = res["_brief"]["tags"]
        primary_tags = {t for t, w in want.items() if w >= 0.7} | {tag}
        m = top[0]["eval_Breakdown"]["matched_official_tags"] if top else {}
        # #1 pick must strongly exhibit the expected tag OR another primary requested quality (>= 70 official score)
        ok = bool(top) and res["confidence"] == "high" and any(m.get(t, 0) >= 70 for t in primary_tags) and m.get(tag, 0) >= 50
        if families:
            ok = ok and any(f["family"] in families for f in top)
        passed += ok
        cases.append({"input": text, "expect_tag": tag, "status": "PASS" if ok else "FAIL", "confidence": res["confidence"],
                      "top_5": [f["family"] for f in top], "top1_tag_score": top[0]["eval_Breakdown"]["matched_official_tags"].get(tag) if top else None})
    for text in NONSENSE:
        res = recommend(text, None, "auto", None, snap)
        ok = res["confidence"] == "low" and res["status"] == "low_confidence"
        passed += ok
        cases.append({"input": text, "expect": "low_confidence", "status": "PASS" if ok else "FAIL", "confidence": res["confidence"]})
    total = len(EVAL_SUITE) + len(NONSENSE)
    return {"suite": "google-font-selection-v2-golden", "status": "pass" if passed == total else "fail", "passed_cases": passed, "total_cases": total, "cases": cases}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--artifact", help="Keyword / phrase / brief, or a path to an image or text file")
    ap.add_argument("--brief", help="brief.json authored by the agent / LLM (see translate_brief.py)")
    ap.add_argument("--backend", choices=["auto", "agent", "gemini", "anthropic"], default="auto", help="LLM association backend (auto = gemini/anthropic key if set, else agent)")
    ap.add_argument("--model", help="Model override for gemini/anthropic")
    ap.add_argument("--format", choices=["json", "markdown"], default="json")
    ap.add_argument("--out-md"); ap.add_argument("--out-json"); ap.add_argument("--specimen-html"); ap.add_argument("--download-dir")
    ap.add_argument("--embed-fonts", action="store_true", help="Make --specimen-html self-contained (base64 .woff2 for the Top 5) for sandboxed viewers like Jetski's artifact pane")
    ap.add_argument("--fresh", action="store_true", help="Bypass the short-lived temp cache and fetch the live catalog now")
    ap.add_argument("--run-eval-suite", action="store_true")
    args = ap.parse_args()

    snap = fetch_live(fresh=args.fresh)

    if args.run_eval_suite:
        rep = run_eval_suite(snap)
        print(json.dumps(rep, indent=2, ensure_ascii=False))
        raise SystemExit(0 if rep["status"] == "pass" else 1)

    if not args.artifact and not args.brief:
        ap.error("--artifact or --brief is required")
    res = recommend(args.artifact, args.brief, args.backend, args.model, snap)
    brief = res.pop("_brief")
    if res["status"] == "needs_model":
        print(json.dumps(res, indent=2, ensure_ascii=False) if args.format == "json" else f"# needs_model\n\n{res['interpretation_hint']}\n\n{res['model_prompt']}")
        raise SystemExit(2)
    top = res["top_5_recommendations"]
    md = format_markdown_report(brief, top, res["confidence"], res["interpretation_hint"], snap["family_count"])
    if args.download_dir:
        res["downloaded_files"] = download_top_fonts(top, Path(args.download_dir))
    if args.out_json:
        Path(args.out_json).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out_json).write_text(json.dumps(res, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.out_md:
        Path(args.out_md).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out_md).write_text(md, encoding="utf-8")
    if args.specimen_html:
        generate_specimen_html(brief, top, res["confidence"], Path(args.specimen_html), fetch_embedded_fonts(top) if args.embed_fonts else None)
    print(md if args.format == "markdown" else json.dumps(res, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
