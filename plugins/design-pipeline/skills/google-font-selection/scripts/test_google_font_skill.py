#!/usr/bin/env python3
"""Verification suite for google-font-selection (live Google Fonts data + LLM association).

Network: fetches Google's live tag CSV + metadata (cached 6h in the temp dir).
Model:   the golden suite runs only when GEMINI_API_KEY / GOOGLE_API_KEY / ANTHROPIC_API_KEY is set; otherwise the
         association step is exercised through agent-authored briefs (the default path inside Jetski).
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from gf_live import fetch_live  # noqa: E402
from recommend_google_fonts import css2_spec, format_markdown_report, generate_specimen_html, recommend, run_eval_suite  # noqa: E402
from translate_brief import NeedsModel, build_prompt, translate, validate_brief  # noqa: E402

HAS_KEY = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or os.environ.get("ANTHROPIC_API_KEY"))

# Agent-authored briefs (what the host agent produces in Pass 0) and the official tag the #1 pick must score >= 70 on.
AGENT_BRIEFS = [
    ("mobster", {"/Expressive/Vintage": 1.0, "/Theme/Art Deco": 0.9, "/Serif/Fat Face": 0.7}, {"/Expressive/Cute": 0.9}, [], "/Theme/Art Deco"),
    ("wacky", {"/Theme/Wacky": 1.0, "/Expressive/Playful": 0.7}, {"/Expressive/Business": 0.8}, [], "/Theme/Wacky"),
    ("spooky halloween", {"/Seasonal/Halloween": 1.0, "/Theme/Distressed": 0.6}, {"/Expressive/Cute": 0.8}, [], "/Seasonal/Halloween"),
    ("y2k", {"/Theme/Techno": 1.0, "/Expressive/Futuristic": 0.7}, {}, [], "/Theme/Techno"),
    ("8-bit arcade", {"/Theme/Pixel": 1.0}, {}, [], "/Theme/Pixel"),
    ("wedding calligraphy", {"/Script/Formal": 1.0, "/Expressive/Fancy": 0.6}, {}, ["handwriting"], "/Script/Formal"),
    ("luxury fashion magazine", {"/Serif/Didone": 1.0, "/Expressive/Sophisticated": 0.6}, {}, ["serif"], "/Serif/Didone"),
    ("developer cli", {"/Monospace/Monospace": 1.0}, {"/Script/Handwritten": 0.8}, ["monospace"], "/Monospace/Monospace"),
    ("soft rounded friendly", {"/Sans/Rounded": 1.0, "/Expressive/Happy": 0.5}, {}, [], "/Sans/Rounded"),
    ("corporate bank", {"/Expressive/Business": 1.0, "/Sans/Neo Grotesque": 0.6}, {"/Theme/Wacky": 1.0}, ["sans-serif", "serif"], "/Expressive/Business"),
]


def check_css2_axes(url: str) -> list[str]:
    m = re.search(r"family=[^:&]+:([a-zA-Z,]+)@", url)
    if not m:
        return []
    axes = m.group(1).split(",")
    lower, upper = [a for a in axes if a.islower()], [a for a in axes if a.isupper()]
    return [] if (lower == sorted(lower) and upper == sorted(upper) and axes == lower + upper) else [f"axis order invalid: {url}"]


def main() -> None:
    print("═══════════════════════════════════════════════════════════════════════════════")
    print("  GOOGLE FONT SELECTION — LIVE CATALOG + MODEL ASSOCIATION VERIFICATION SUITE   ")
    print("═══════════════════════════════════════════════════════════════════════════════\n")
    errors: list[str] = []
    cat = fetch_live()

    ok = cat["family_count"] >= 1800 and len(cat["tag_list"]) >= 70 and all(t in cat["tag_list"] for t in ("/Theme/Wacky", "/Expressive/Playful", "/Seasonal/Halloween", "/Serif/Didone", "/Monospace/Monospace"))
    if not ok:
        errors.append("live catalog incomplete")
    print(f"[{'PASS' if ok else 'FAIL'}] Live catalog from Google: {cat['family_count']} families, {cat['tagged_family_count']} tagged, {len(cat['tag_list'])} official tags ({cat['generated']})")

    bad = validate_brief({"query": "x", "tags": {"/Theme/Wacky": 2.0, "/Made/Up": 1.0, "/Quality/Spacing": 1.0}, "avoid_tags": {"/Expressive/Business": "0.5"}}, cat["tag_list"])
    ok = bad["tags"] == {"/Theme/Wacky": 1.0} and set(bad["dropped_tags"]) == {"/Made/Up", "/Quality/Spacing"} and bad["avoid_tags"] == {"/Expressive/Business": 0.5}
    if not ok:
        errors.append(f"validate_brief failed: {bad}")
    print(f"[{'PASS' if ok else 'FAIL'}] validate_brief drops hallucinated/quality tags and clamps weights")

    prompt = build_prompt("mobster", cat["tag_list"], False)
    ok = "  /Theme/Wacky" in prompt and "  /Quality/" not in prompt and '"mobster"' in prompt
    if not ok:
        errors.append("prompt missing vocabulary")
    print(f"[{'PASS' if ok else 'FAIL'}] Model prompt embeds the live tag vocabulary ({len(prompt):,} chars)")

    try:
        translate("mobster", cat["tag_list"], backend="agent")
        errors.append("agent backend should raise NeedsModel")
        ok = False
    except NeedsModel:
        ok = True
    print(f"[{'PASS' if ok else 'FAIL'}] No key → NeedsModel (host agent answers the prompt)")

    passed = 0
    with tempfile.TemporaryDirectory() as tmp:
        for q, tags, avoid, cats, must in AGENT_BRIEFS:
            bp = Path(tmp) / "b.json"
            bp.write_text(json.dumps({"query": q, "tags": tags, "avoid_tags": avoid, "category": cats, "confidence": 0.85}))
            res = recommend(None, str(bp), "agent", None, cat)
            top = res["top_5_recommendations"]
            good = len(top) == 5 and res["confidence"] == "high" and top[0]["eval_Breakdown"]["matched_official_tags"].get(must, 0) >= 70
            for f in top:
                if not f["specimen_url"].startswith("https://fonts.google.com/specimen/") or not f["css2_url"].startswith("https://fonts.googleapis.com/css2?family="):
                    good = False
                errors.extend(check_css2_axes(f["css2_url"]))
                if not all(k in f["download_methods"] for k in ("npm_fontsource", "curl_woff2", "github_source_ttf", "webfonts_helper_zip")):
                    good = False
                if re.search(r"\bSC\b", f["family"]):
                    good = False
            passed += good
            if not good:
                errors.append(f"brief case failed: {q} → {res['confidence']} {[f['family'] for f in top]}")
            print(f"  [{'PASS' if good else 'FAIL'}] {q:26s} → {', '.join(f['family'] for f in top)}")
        print(f"[{'PASS' if passed == len(AGENT_BRIEFS) else 'FAIL'}] Agent-brief ranking over the live catalog {passed}/{len(AGENT_BRIEFS)} (URLs, downloads, axis order, variant dedupe)")

        b = {"query": "mobster", "modality": "text", "tags": AGENT_BRIEFS[0][1], "avoid_tags": AGENT_BRIEFS[0][2], "category": [], "google_fonts_url": "https://fonts.google.com/", "source": "agent", "confidence": 0.85}
        res = recommend(None, None, "agent", None, cat) if False else None  # noqa
        from recommend_google_fonts import rank_catalog, assess_confidence
        top = rank_catalog(b, cat)
        conf, note = assess_confidence(b, top)
        md = format_markdown_report(b, top, conf, note, cat["family_count"])
        sp = Path(tmp) / "s.html"
        generate_specimen_html(b, top, conf, sp)
        ok = "## Top 5 Recommended Google Fonts" in md and "The quick brown fox" in sp.read_text()
        if not ok:
            errors.append("report generation failed")
        print(f"[{'PASS' if ok else 'FAIL'}] Markdown report + HTML specimen generation")

    axis_errs = []
    for name, fam in cat["families"].items():
        axis_errs.extend(check_css2_axes(f"https://fonts.googleapis.com/css2?family={css2_spec(name, fam)}&display=swap"))
    errors.extend(axis_errs)
    print(f"[{'PASS' if not axis_errs else 'FAIL'}] CSS2 spec builder across the live catalog: {len(axis_errs)} axis-order errors")

    out = subprocess.run([sys.executable, str(HERE / "recommend_google_fonts.py"), "--artifact", "mobster", "--backend", "agent"], capture_output=True, text=True)
    payload = json.loads(out.stdout) if out.stdout.strip().startswith("{") else {}
    ok = out.returncode == 2 and payload.get("status") == "needs_model" and "model_prompt" in payload
    if not ok:
        errors.append(f"CLI needs_model contract failed rc={out.returncode}")
    print(f"[{'PASS' if ok else 'FAIL'}] CLI without a key → status needs_model + prompt (never a fake PASS)")

    spec = (HERE.parent / "specimen.html").read_text(encoding="utf-8")
    ok = "families.csv" in spec and "generativelanguage.googleapis.com" in spec and 'id="catalog-data"' not in spec
    if not ok:
        errors.append("specimen.html must fetch live data and call the model; no embedded catalog")
    print(f"[{'PASS' if ok else 'FAIL'}] specimen.html: live Google data + model, nothing embedded ({len(spec):,} bytes)")

    if HAS_KEY:
        rep = run_eval_suite(cat)
        for c in rep["cases"]:
            if c["status"] != "PASS":
                errors.append(f"golden case failed: {c}")
        print(f"[{'PASS' if rep['status'] == 'pass' else 'FAIL'}] Golden suite via model {rep['passed_cases']}/{rep['total_cases']}")
    else:
        print("[SKIP] Golden suite via model (set GEMINI_API_KEY / ANTHROPIC_API_KEY to run)")

    print("───────────────────────────────────────────────────────────────────────────────")
    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        raise SystemExit(1)
    print("ALL TESTS PASSED")


if __name__ == "__main__":
    main()
