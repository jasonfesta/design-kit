#!/usr/bin/env python3
"""gf_live.py — LIVE Google Fonts catalog access (no shipped snapshot).

Two Google-maintained sources are fetched at run time:
  1. https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv
     Every family scored 0-100 against Google's official tags (/Theme/Wacky, /Expressive/Playful, /Serif/Didone, ...)
     — the data behind the Feeling/Appearance filters on fonts.google.com.
  2. https://fonts.google.com/metadata/fonts
     Category, variable axes, weights, italics, popularity, subsets, primary script for every family.
Optional: https://www.googleapis.com/webfonts/v1/webfonts?key=... (official Developer API) when GOOGLE_FONTS_API_KEY is set.

A short-lived transparent cache (default 6h, in the OS temp dir) avoids re-downloading ~3 MB on every call;
pass --no-cache / fresh=True to force a live fetch. Nothing is checked into the skill.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import json
import os
import tempfile
import time
from pathlib import Path
from urllib.request import Request, urlopen

TAGS_CSV_URL = "https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv"
METADATA_URL = "https://fonts.google.com/metadata/fonts"
WEBFONTS_API_URL = "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key="
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
CACHE_PATH = Path(os.environ.get("GF_LIVE_CACHE", Path(tempfile.gettempdir()) / "google-fonts-live-cache.json"))
CACHE_TTL_S = int(os.environ.get("GF_LIVE_CACHE_TTL", 6 * 3600))

TAG_DIMENSION = {"Expressive": "Feeling", "Sans": "Appearance", "Serif": "Appearance", "Slab": "Appearance", "Script": "Appearance",
                 "Monospace": "Appearance", "Theme": "Appearance", "Seasonal": "Appearance", "Purpose": "Appearance",
                 "Special use": "Appearance", "Quality": "Quality"}


def fetch(url: str, timeout: int = 30) -> str:
    with urlopen(Request(url, headers={"User-Agent": UA}), timeout=timeout) as resp:
        return resp.read().decode("utf-8")


def parse_tags_csv(text: str) -> dict[str, dict[str, int]]:
    tags: dict[str, dict[str, int]] = {}
    for row in csv.reader(io.StringIO(text)):
        if len(row) < 3:
            continue
        cells = [c for c in row[1:] if c != ""]
        if len(cells) < 2 or not cells[0].startswith("/"):
            continue
        try:
            tags.setdefault(row[0].strip(), {})[cells[0].strip()] = max(0, min(100, int(float(cells[1]))))
        except ValueError:
            continue
    return tags


def parse_metadata(text: str) -> dict[str, dict]:
    data = json.loads(text[text.index("{"):])
    out = {}
    for fam in data["familyMetadataList"]:
        fonts = fam.get("fonts") or {}
        out[fam["family"]] = {
            "category": fam.get("category") or "",
            "axes": [{"tag": a["tag"], "min": a["min"], "max": a["max"]} for a in fam.get("axes", [])],
            "weights": sorted({int(f.get("weight", 400)) for f in fonts.values()}) if isinstance(fonts, dict) and fonts else [400],
            "italic": any(k.endswith("i") for k in fonts) if isinstance(fonts, dict) else False,
            "popularity": fam.get("popularity"),
            "latin": "latin" in (fam.get("subsets") or []),
            "script": fam.get("primaryScript") or "",
            "noto": bool(fam.get("isNoto")),
            "color": bool(fam.get("colorCapabilities")),
        }
    return out


def parse_webfonts_api(text: str) -> dict[str, dict]:
    """Official Developer API → same shape (used when GOOGLE_FONTS_API_KEY is provided)."""
    out = {}
    for i, item in enumerate(json.loads(text).get("items", [])):
        variants = item.get("variants", [])
        axes = [{"tag": a["tag"], "min": a["start"], "max": a["end"]} for a in item.get("axes", [])]
        weights = sorted({int(v.replace("italic", "") or 400) if v not in ("regular", "italic") else 400 for v in variants})
        out[item["family"]] = {
            "category": {"serif": "Serif", "sans-serif": "Sans Serif", "display": "Display", "handwriting": "Handwriting", "monospace": "Monospace"}.get(item.get("category"), ""),
            "axes": axes, "weights": weights or [400], "italic": any("italic" in v for v in variants), "popularity": i + 1,
            "latin": "latin" in item.get("subsets", []), "script": "", "noto": item["family"].startswith("Noto"), "color": False,
        }
    return out


def build_catalog(tags: dict[str, dict[str, int]], meta: dict[str, dict]) -> dict:
    tag_list = sorted({t for fam in tags.values() for t in fam})
    idx = {t: i for i, t in enumerate(tag_list)}
    families = {name: {**m, "t": sorted([[idx[t], s] for t, s in tags.get(name, {}).items() if s > 0])} for name, m in meta.items()}
    return {"generated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "sources": [TAGS_CSV_URL, METADATA_URL],
            "tag_list": tag_list, "tag_dimension": TAG_DIMENSION, "family_count": len(families),
            "tagged_family_count": sum(1 for f in families.values() if f["t"]), "families": families}


def fetch_live(fresh: bool = False, use_cache: bool = True) -> dict:
    """Return the live catalog (tags + metadata). Uses a short TTL temp cache unless fresh=True."""
    if use_cache and not fresh and CACHE_PATH.is_file() and time.time() - CACHE_PATH.stat().st_mtime < CACHE_TTL_S:
        try:
            return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    tags = parse_tags_csv(fetch(TAGS_CSV_URL))
    key = os.environ.get("GOOGLE_FONTS_API_KEY")
    meta = parse_webfonts_api(fetch(WEBFONTS_API_URL + key)) if key else parse_metadata(fetch(METADATA_URL))
    cat = build_catalog(tags, meta)
    if use_cache:
        try:
            CACHE_PATH.write_text(json.dumps(cat, separators=(",", ":")), encoding="utf-8")
        except OSError:
            pass
    return cat


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--no-cache", action="store_true", help="Force a fresh live fetch")
    ap.add_argument("--tag", help="List top families for one official tag, e.g. /Theme/Wacky")
    args = ap.parse_args()
    cat = fetch_live(fresh=args.no_cache)
    print(f"live catalog {cat['generated']}: {cat['family_count']} families, {cat['tagged_family_count']} tagged, {len(cat['tag_list'])} official tags")
    if args.tag:
        i = cat["tag_list"].index(args.tag)
        rows = sorted(((s, n) for n, f in cat["families"].items() for ti, s in f["t"] if ti == i and s >= 70), reverse=True)
        print(args.tag, len(rows), "families ≥70:", ", ".join(n for _, n in rows[:25]))
    else:
        print("\n".join(cat["tag_list"]))


if __name__ == "__main__":
    main()
