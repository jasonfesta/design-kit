#!/usr/bin/env python3
"""Web-safe accessible font pairing, WCAG pre-flight, and 4-surface Nano Banana font-scale engine.

Eliminates multi-round Nano Banana font-sizing and legibility churn inside jason-design-agent by:
1. Pairing any live-ranked Primary Headline Google Font with a verified Web-Safe Accessible
   Companion Body Google Font (Latn script, weights 400 + 500/600 or variable wght, high
   Google Fonts /Purpose/Easy Reading + /Quality/* scores, zero banned AI cliches).
2. Translating web-safe accessible CSS type scales (>= 16px body, >= 12px floor) into the
   exact 4 visual-spatial anchors Nano Banana obeys per surface (desktop-web, mobile,
   desktop-app, component): logical 1x viewport, % of 2K canvas height, hard character-per-line
   and max-line copy budgets, and 44px control-height reference rulers.
3. Auditing prompts and hex palettes BEFORE Round 1 (0 image rounds spent) for < 12px font
   violations, WCAG 2.2 AA contrast failures (< 4.5:1 normal / < 3.0:1 large & UI borders),
   bloated headline word counts, and cross-surface reference mismatches.
4. Generating optional 2K surface-calibrated type-scale reference seed PNGs (`scale-seed`)
   when no same-surface Chrome DevTools screenshot exists.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import pathlib
import re
import subprocess
import sys
import tempfile
from typing import Any

AI_CLICHE_FONTS = {
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

WARM_BEIGE_BANNED = {
    "#f4efe6",
    "#f6f2ea",
    "#faf6f0",
    "#efe9df",
    "#f5f0e6",
    "#f3ede2",
}

# Exact mathematically synchronized 4-surface CSS -> 2K canvas scale specifications.
# Every ratio satisfies: CSS_px / logical_h == canvas_px / canvas_h and WCAG 2.2 AA (>=16px body, >=12px floor).
SURFACE_SPECS: dict[str, dict[str, Any]] = {
    "desktop-web": {
        "label": "Desktop Website (Marketing / Brand / Editorial / Commerce)",
        "aspect": "16:9",
        "logical_viewport": "1440x810 CSS px",
        "logical_w": 1440,
        "logical_h": 810,
        "canvas_px": "2752x1536",
        "canvas_w": 2752,
        "canvas_h": 1536,
        "dpr": 1.91,
        "h1_css": "48-60px",
        "h1_pct_h": "6.0%-7.4%",
        "h1_max_words": 9,
        "h1_max_chars": 52,
        "h1_lines": "2-3 lines max (16-24 chars/line)",
        "h2_css": "32-40px (4.0%-4.9% of canvas height, 1-2 lines)",
        "h3_css": "20-24px (2.5%-3.0% of canvas height, 1 line <= 28 chars)",
        "body_css": "16-18px",
        "body_pct_h": "2.0%-2.2%",
        "body_measure": "55-70 chars/line across 2-3 lines max (1.55 line height)",
        "ui_control_css": "14-16px weight 500 inside 42-48px tall pills/buttons (5.2%-5.9% of canvas height, 20-28px L/R padding)",
        "floor_css": "12-13px hard floor (1.5%-1.6% of canvas height) for eyebrows, badges, and multi-column footer links (NEVER < 12px)",
        "nav_bar_rule": "64-72px tall header (8.0%-8.9% of canvas height) with 14-15px nav links spaced 24-32px apart (0 middle dots)",
        "ref_rule": "Condition on @2x 1440px desktop Chrome DevTools ref-base slice or desktop-web scale-seed (never a mobile 9:16 crop).",
    },
    "mobile": {
        "label": "Mobile Web & Native iOS/Mobile App",
        "aspect": "9:16",
        "logical_viewport": "390x844 CSS pt",
        "logical_w": 390,
        "logical_h": 844,
        "canvas_px": "1536x2752",
        "canvas_w": 1536,
        "canvas_h": 2752,
        "dpr": 3.94,
        "h1_css": "28-34pt",
        "h1_pct_h": "3.3%-4.0%",
        "h1_max_words": 7,
        "h1_max_chars": 38,
        "h1_lines": "2 lines max (14-20 chars/line; NEVER > 3 lines or giant 56pt poster type)",
        "h2_css": "20-22pt card/section titles (2.4%-2.6% of canvas height, 1-2 lines <= 26 chars/line)",
        "h3_css": "17-18pt row/item titles (2.0%-2.1% of canvas height, 1 line)",
        "body_css": "16pt minimum",
        "body_pct_h": "1.9%-2.1% of canvas height (4.1% of canvas width)",
        "body_measure": "34-42 chars/line across full mobile card width, 2-3 lines max (1.5 line height; NEVER desktop micro-text)",
        "ui_control_css": "15-16pt weight 500 inside >= 44-52pt tall touch targets (5.2%-6.2% of canvas height, >= 8pt gap between targets)",
        "floor_css": "12-13pt hard floor (1.45%-1.55% of canvas height) for 4-tab iOS bar labels, timestamps, and pills (NEVER < 12pt)",
        "nav_bar_rule": "Edge-to-edge bleed (0 phone bezel); 56pt top header + native 4-tab bottom bar (84-88pt / ~10% of canvas height, 0 Android stadium pills)",
        "ref_rule": "Condition on @3x 390pt mobile DevTools capture or mobile scale-seed (never pass only a 1440px desktop 16:9 screenshot, which shrinks mobile text 3.7x).",
    },
    "desktop-app": {
        "label": "Desktop Application / SaaS Workspace / Operational Dashboard",
        "aspect": "16:9",
        "logical_viewport": "1440x900 CSS px",
        "logical_w": 1440,
        "logical_h": 900,
        "canvas_px": "2752x1536",
        "canvas_w": 2752,
        "canvas_h": 1536,
        "dpr": 1.82,
        "h1_css": "24-30px workspace view title",
        "h1_pct_h": "2.7%-3.3%",
        "h1_max_words": 6,
        "h1_max_chars": 36,
        "h1_lines": "1 single line inside top workspace header (ZERO 56-72px marketing-hero headlines inside SaaS apps)",
        "h2_css": "18-20px panel/card headers (2.0%-2.2% of canvas height) + 28-36px tabular-nums KPI numerals",
        "h3_css": "15-16px sub-panel titles (1.7%-1.8% of canvas height)",
        "body_css": "14-16px (16px prose/drawers; 14-15px dense table cells & 220-240px left sidebar nav)",
        "body_pct_h": "1.6%-1.8%",
        "body_measure": "45-65 chars/line in prose panels; 38-44px tall data rows (4.2%-4.9% of canvas height, 10-14 rows cleanly visible)",
        "ui_control_css": "14px weight 500 inside 36-40px toolbar buttons/inputs (>= 24x24px WCAG target floor, 14-18px L/R padding)",
        "floor_css": "12-13px hard floor (1.35%-1.45% of canvas height) for column headers, status pills, and tabular-nums timestamps (NEVER < 12px)",
        "nav_bar_rule": "220-240px left sidebar (15%-17% of canvas width) with uniform soft-gray (#7E8590) inactive icons + 56px top utility bar",
        "ref_rule": "Condition on dense web-app screenshot or desktop-app scale-seed so table row rhythm stays crisp at 14-16px.",
    },
    "component": {
        "label": "Isolated UI Component / Interactive Card / Widget Specimen",
        "aspect": "4:3",
        "logical_viewport": "720x540 CSS px zoomed specimen stage (component card 380-520px wide, 18%-22% clean outer margin)",
        "logical_w": 720,
        "logical_h": 540,
        "canvas_px": "2400x1792",
        "canvas_w": 2400,
        "canvas_h": 1792,
        "dpr": 3.33,
        "h1_css": "20-24px component card title (H3 role)",
        "h1_pct_h": "3.7%-4.4%",
        "h1_max_words": 6,
        "h1_max_chars": 32,
        "h1_lines": "1 single crisp line (28-36px tabular-nums allowed ONLY for primary live price/metric readout)",
        "h2_css": "16-18px sub-section header (3.0%-3.3% of canvas height)",
        "h3_css": "15-16px field/group label (2.8%-3.0% of canvas height)",
        "body_css": "15-16px",
        "body_pct_h": "2.8%-3.0%",
        "body_measure": "32-46 chars/line inside the card, 1-2 lines max (1.5 line height; zoomed ~2x closer than full 1440px page)",
        "ui_control_css": "14-15px weight 500 inside 40-44px tall buttons, segmented tabs, and inputs (7.4%-8.1% of canvas height, 20-24px L/R padding)",
        "floor_css": "12-13px hard floor (2.2%-2.4% of canvas height) for axis ticks, helper chips, and status pills (NEVER < 12px)",
        "nav_bar_rule": "ZERO full-page navbar or footer; center the single component on clean non-beige system ground with >= 18%-22% studio margin",
        "ref_rule": "Condition on cropped benchmark widget or component scale-seed (never pass an uncropped full-page screenshot, which leaks navbars/footers).",
    },
}
SURFACE_ALIASES = {
    "web": "desktop-web",
    "desktop": "desktop-web",
    "desktop-web": "desktop-web",
    "mobile": "mobile",
    "mobile-web": "mobile",
    "mobile-app": "mobile",
    "app": "mobile",
    "ios": "mobile",
    "application": "desktop-app",
    "desktop-app": "desktop-app",
    "saas": "desktop-app",
    "component": "component",
    "widget": "component",
}


def resolve_surface(raw: str) -> str:
    key = SURFACE_ALIASES.get(raw.strip().lower(), "")
    if not key:
        raise ValueError(f"Unknown surface {raw!r}; choose from desktop-web, mobile, desktop-app, component")
    return key


def load_live_catalog(allow_network: bool = True) -> dict[str, Any] | None:
    cache_path = pathlib.Path(tempfile.gettempdir()) / "google-fonts-live-cache.json"
    if cache_path.exists():
        try:
            return json.loads(cache_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    if not allow_network:
        return None
    gf_script = pathlib.Path(__file__).resolve().parents[2] / "google-font-selection" / "scripts" / "gf_live.py"
    if not gf_script.exists():
        return None
    spec = importlib.util.spec_from_file_location("gf_live_dyn", str(gf_script))
    if not spec or not spec.loader:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.fetch_live()


def family_tags_map(snap: dict[str, Any], fam: dict[str, Any]) -> dict[str, int]:
    tl = snap.get("tag_list") or []
    return {tl[i]: int(s) for i, s in fam.get("t", []) if 0 <= i < len(tl)}


def has_body_weights(fam: dict[str, Any]) -> bool:
    for a in fam.get("axes", []):
        if a.get("tag") == "wght" and float(a.get("min", 400)) <= 400 and float(a.get("max", 400)) >= 600:
            return True
    w = set(fam.get("weights") or [])
    return 400 in w and bool(w.intersection({500, 600, 700}))


def describe_anatomy(name: str, fam: dict[str, Any], tags: dict[str, int], role: str) -> str:
    """Build a Nano Banana-safe physical letterform description (zero literal font family names required on screen)."""
    cat = (fam.get("category") or "Sans Serif").lower()
    traits: list[str] = []
    if tags.get("/Serif/Didone", 0) >= 55 or tags.get("/Serif/Modern", 0) >= 55:
        traits.append("high-contrast vertical-stress editorial serif with crisp hairline serifs and sculpted ball terminals")
    elif tags.get("/Serif/Old Style Garalde", 0) >= 55 or tags.get("/Serif/Humanist Venetian", 0) >= 55:
        traits.append("warm calligraphic old-style serif with bracketed terminals and organic stroke modulation")
    elif tags.get("/Serif/Transitional", 0) >= 55 or tags.get("/Serif/Scotch", 0) >= 55:
        traits.append("sharp transitional editorial serif with sturdy stems, open counters, and crisp bracketed feet")
    elif tags.get("/Slab/Geometric", 0) >= 50 or tags.get("/Slab/Clarendon", 0) >= 50 or tags.get("/Slab/Humanist", 0) >= 50:
        traits.append("architectural slab serif with squared block terminals and confident even stem weight")
    elif tags.get("/Monospace/Monospace", 0) >= 60 or "mono" in cat:
        traits.append("fixed-width technical monospace with open apertures, distinct 0/O and 1/l/I forms, and crisp tabular alignment")
    elif tags.get("/Purpose/Easy Reading", 0) >= 85 and (tags.get("/Sans/Humanist", 0) >= 40 or tags.get("/Sans/Grotesque", 0) >= 40 or tags.get("/Sans/Neo Grotesque", 0) >= 40):
        traits.append("hyper-legible open-aperture workhorse sans-serif with tall x-height, unmistakable 1/l/I and 0/O disambiguation, and generous letter spacing")
    elif tags.get("/Sans/Geometric", 0) >= 60:
        traits.append("clean geometric sans-serif with circular bowls, crisp horizontal terminals, and balanced x-height")
    elif tags.get("/Sans/Humanist", 0) >= 60:
        traits.append("open-aperture humanist sans-serif with generous x-height, clear letter differentiation, and effortless screen legibility")
    elif tags.get("/Sans/Grotesque", 0) >= 55 or tags.get("/Sans/Neo Grotesque", 0) >= 55:
        traits.append("swiss neo-grotesque sans-serif with disciplined neutral proportions, tall x-height, and crisp stroke endings")
    elif "serif" in cat:
        traits.append("sculpted editorial serif with crisp terminals and balanced display proportions")
    elif "display" in cat:
        traits.append("distinctive architectural display letterforms with bold silhouette and tight optical fit")
    else:
        traits.append("clean contemporary sans-serif with tall x-height, open counters, and crisp stroke clarity")

    if role == "primary":
        return f"{traits[0]} (weight 600-700, tight -0.02em display tracking; inspired by {name} anatomy, never printed as a label)"
    return f"{traits[0]} (weight 400 body / 500 UI controls, 1.5 line height, tabular numerals; inspired by {name} anatomy, never printed as a label)"


def css2_family_query(name: str, fam: dict[str, Any]) -> str:
    plus = name.replace(" ", "+")
    for a in fam.get("axes", []):
        if a.get("tag") == "wght":
            lo = int(max(300, float(a.get("min", 400))))
            hi = int(min(800, float(a.get("max", 700))))
            return f"{plus}:wght@{lo}..{hi}" if lo < hi else f"{plus}:wght@{lo}"
    weights = sorted(w for w in (fam.get("weights") or [400]) if 300 <= int(w) <= 800) or [400]
    return f"{plus}:wght@{';'.join(str(w) for w in weights)}"


def rank_companions(
    primary_name: str,
    snap: dict[str, Any],
    avoid: set[str],
    prefer_cat: str = "auto",
) -> list[dict[str, Any]]:
    fams = snap["families"]
    p_fam = fams.get(primary_name, {})
    p_cat = (p_fam.get("category") or "Display").lower()
    if prefer_cat == "auto":
        # Contrast of construction: Display/Serif/Slab/Monospace primary -> Sans body; Sans primary -> Humanist Sans or Text Serif
        target_cats = {"sans serif"} if ("serif" in p_cat or "display" in p_cat or "mono" in p_cat or "hand" in p_cat) else {"sans serif", "serif"}
    elif prefer_cat == "serif":
        target_cats = {"serif"}
    else:
        target_cats = {"sans serif"}

    blocked = set(avoid) | AI_CLICHE_FONTS | {primary_name}
    candidates: list[tuple[float, str, dict[str, Any], dict[str, int]]] = []
    for name, fam in fams.items():
        if name in blocked or not fam.get("latin", True) or fam.get("noto") or fam.get("color"):
            continue
        if fam.get("script") not in ("", "Latn", None):
            continue
        cat_l = (fam.get("category") or "").lower()
        if cat_l not in target_cats:
            continue
        if re.search(r"\b(SC|Condensed|Narrow|Expanded|Display|Inline|Pixel|Stencil|Barcode|Redaction|Guides)\b", name, re.I):
            continue
        if not has_body_weights(fam):
            continue
        tags = family_tags_map(snap, fam)
        if not tags:
            continue
        if any(tags.get(t, 0) >= 35 for t in (
            "/Expressive/Loud", "/Theme/Wacky", "/Theme/Distressed", "/Theme/Pixel",
            "/Theme/Blackletter", "/Theme/Stencil", "/Serif/Fat Face",
        )):
            continue
        easy = tags.get("/Purpose/Easy Reading", 0) / 100.0
        qual = (
            tags.get("/Quality/Drawing", 70)
            + tags.get("/Quality/Spacing", 70)
            + tags.get("/Quality/Wordspace", 70)
        ) / 300.0
        readability_trait = max(
            tags.get("/Sans/Humanist", 0),
            tags.get("/Sans/Neo Grotesque", 0),
            tags.get("/Sans/Grotesque", 0),
            tags.get("/Serif/Old Style Garalde", 0),
            tags.get("/Serif/Transitional", 0),
        ) / 100.0
        if easy < 0.45 and readability_trait < 0.60:
            continue
        ital_bonus = 0.06 if fam.get("italic") else 0.0
        var_bonus = 0.06 if any(a.get("tag") == "wght" for a in fam.get("axes", [])) else 0.0
        pop = fam.get("popularity") or 1500
        pop_bonus = max(0.0, 0.08 * (1.0 - min(pop, 800) / 800.0))
        score = 0.44 * easy + 0.24 * qual + 0.14 * readability_trait + ital_bonus + var_bonus + pop_bonus
        candidates.append((score, name, fam, tags))

    candidates.sort(key=lambda x: (-x[0], x[1]))
    results: list[dict[str, Any]] = []
    for score, name, fam, tags in candidates[:5]:
        results.append({
            "family": name,
            "category": fam.get("category"),
            "companion_score": round(100.0 * min(1.0, score), 1),
            "easy_reading_score": tags.get("/Purpose/Easy Reading", 0),
            "weights": fam.get("weights"),
            "italic": fam.get("italic", False),
            "anatomy_prompt": describe_anatomy(name, fam, tags, role="secondary"),
            "css2_spec": css2_family_query(name, fam),
        })
    return results


# --------------------------------------------------------------------------- WCAG 2.2 AA Contrast Math
def parse_hex_rgb(hex_str: str) -> tuple[int, int, int]:
    h = hex_str.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    if len(h) != 6 or not re.fullmatch(r"[0-9a-fA-F]{6}", h):
        raise ValueError(f"Invalid hex color: {hex_str!r}")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def rel_luminance(rgb: tuple[int, int, int]) -> float:
    def chan(v: int) -> float:
        s = v / 255.0
        return s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)


def contrast_ratio(hex_a: str, hex_b: str) -> float:
    la = rel_luminance(parse_hex_rgb(hex_a))
    lb = rel_luminance(parse_hex_rgb(hex_b))
    hi, lo = (la, lb) if la >= lb else (lb, la)
    return (hi + 0.05) / (lo + 0.05)


def suggest_accessible_hex(fg_hex: str, bg_hex: str, min_ratio: float = 4.5) -> str:
    """Move fg_hex toward pure white or pure black along RGB until contrast_ratio >= min_ratio."""
    if contrast_ratio(fg_hex, bg_hex) >= min_ratio:
        return fg_hex
    bg_lum = rel_luminance(parse_hex_rgb(bg_hex))
    target = (255, 255, 255) if bg_lum < 0.35 else (0, 0, 0)
    r0, g0, b0 = parse_hex_rgb(fg_hex)
    for step in range(1, 101):
        t = step / 100.0
        r = round(r0 + (target[0] - r0) * t)
        g = round(g0 + (target[1] - g0) * t)
        b = round(b0 + (target[2] - b0) * t)
        cand = f"#{r:02X}{g:02X}{b:02X}"
        if contrast_ratio(cand, bg_hex) >= min_ratio:
            return cand
    return "#FFFFFF" if bg_lum < 0.35 else "#000000"


# --------------------------------------------------------------------------- Prompt Block Builder
def build_surface_prompt_block(
    surface: str,
    primary_font: str,
    secondary_font: str,
    primary_anatomy: str,
    secondary_anatomy: str,
) -> str:
    s = SURFACE_SPECS[surface]
    lines = [
        f"TYPOGRAPHY & {surface.upper()} WEB-SAFE ACCESSIBLE SCALE (LOCKED — ZERO FONT-ROUND REDO):",
        f"- Simulated Viewport -> 2K Canvas: {s['logical_viewport']} rendered flat at {s['dpr']:.2f}x DPR ({s['canvas_px']} lossless 2K).",
        f"- Primary Headline Voice (H1-H3 only): {primary_anatomy}.",
        f"- Companion Body & UI Voice (all body, nav, buttons, tables, footers): {secondary_anatomy}.",
        f"- H1 Scale & Hard Copy Lock: {s['h1_css']} ({s['h1_pct_h']} of canvas height), strictly {s['h1_lines']} (<={s['h1_max_words']} words / <={s['h1_max_chars']} chars).",
        f"- Subheads: H2 at {s['h2_css']}; H3 at {s['h3_css']}.",
        f"- Accessible Body Scale & Measure Lock: {s['body_css']} ({s['body_pct_h']}), {s['body_measure']}.",
        f"- Interactive Controls Ruler: {s['ui_control_css']}.",
        f"- WCAG 12px Absolute Floor: {s['floor_css']}.",
        f"- Surface Chrome & Framing: {s['nav_bar_rule']}.",
        "- Anti-Leak Guard: NEVER print font family names, pixel sizes ('16px'), or hex codes as visible text on screen; zero middle dots ('·') between links.",
    ]
    return "\n".join(lines)


# --------------------------------------------------------------------------- Commands
def cmd_pair(args: argparse.Namespace) -> int:
    snap = load_live_catalog(allow_network=not args.offline)
    if not snap:
        print(json.dumps({"passed": False, "error": "Live Google Fonts catalog unavailable; run recommend_google_fonts.py once first."}), file=sys.stderr)
        return 2
    avoid = {x.strip() for x in (args.avoid or "").split(",") if x.strip()}
    primary = args.primary.strip()
    if primary not in snap["families"]:
        # case-insensitive match
        lookup = {k.lower(): k for k in snap["families"]}
        if primary.lower() in lookup:
            primary = lookup[primary.lower()]
        else:
            print(json.dumps({"passed": False, "error": f"Primary family {primary!r} not in live Google Fonts catalog."}))
            return 1

    p_fam = snap["families"][primary]
    p_tags = family_tags_map(snap, p_fam)
    p_warnings: list[str] = []
    if primary in AI_CLICHE_FONTS and not args.allow_cliche:
        p_warnings.append(f"{primary} is in the banned AI-cliche list; pick a distinctive family from recommend_google_fonts.py.")
    if primary in avoid:
        p_warnings.append(f"{primary} is in --avoid competitor list.")
    if not p_fam.get("latin", True):
        p_warnings.append(f"{primary} lacks Latin subset coverage.")

    companions = rank_companions(primary, snap, avoid, prefer_cat=args.prefer_companion)
    best_comp = companions[0] if companions else None
    p_spec = css2_family_query(primary, p_fam)
    combined_css2 = (
        f"https://fonts.googleapis.com/css2?family={p_spec}&family={best_comp['css2_spec']}&display=swap"
        if best_comp
        else f"https://fonts.googleapis.com/css2?family={p_spec}&display=swap"
    )
    surface = resolve_surface(args.surface) if args.surface else "desktop-web"
    p_anat = describe_anatomy(primary, p_fam, p_tags, role="primary")
    s_anat = best_comp["anatomy_prompt"] if best_comp else "clean humanist sans-serif (weight 400 body / 500 UI, 1.5 line height, tabular numerals)"

    payload = {
        "passed": len(p_warnings) == 0 and best_comp is not None,
        "warnings": p_warnings,
        "primary": {
            "family": primary,
            "category": p_fam.get("category"),
            "weights": p_fam.get("weights"),
            "anatomy_prompt": p_anat,
            "css2_spec": p_spec,
        },
        "recommended_secondary": best_comp,
        "alternative_companions": companions[1:4],
        "combined_css2_url": combined_css2,
        "html_link_tag": (
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            f'<link href="{combined_css2}" rel="stylesheet">'
        ),
        "surface": surface,
        "nano_banana_typography_block": build_surface_prompt_block(
            surface,
            primary,
            best_comp["family"] if best_comp else "Work Sans",
            p_anat,
            s_anat,
        ),
    }
    print(json.dumps(payload, indent=2))
    return 0 if payload["passed"] else 1


def cmd_prompt_block(args: argparse.Namespace) -> int:
    surface = resolve_surface(args.surface)
    snap = load_live_catalog(allow_network=False)
    primary = args.primary or "Bricolage Grotesque"
    secondary = args.secondary or "Work Sans"
    if snap and primary in snap["families"]:
        pf = snap["families"][primary]
        p_anat = describe_anatomy(primary, pf, family_tags_map(snap, pf), role="primary")
    else:
        p_anat = args.primary_anatomy or f"expressive display letterforms (weight 600-700, -0.02em tracking; inspired by {primary} anatomy, never printed as a label)"
    if snap and secondary in snap["families"]:
        sf = snap["families"][secondary]
        s_anat = describe_anatomy(secondary, sf, family_tags_map(snap, sf), role="secondary")
    else:
        s_anat = args.secondary_anatomy or f"open-aperture humanist workhorse sans-serif (weight 400 body / 500 UI, 1.5 line height, tabular numerals; inspired by {secondary} anatomy, never printed as a label)"

    block = build_surface_prompt_block(surface, primary, secondary, p_anat, s_anat)
    if args.format == "json":
        print(json.dumps({"surface": surface, "spec": SURFACE_SPECS[surface], "prompt_block": block}, indent=2))
    else:
        print(block)
    return 0


def audit_prompt_text(md_text: str, surface: str, primary: str, secondary: str) -> list[str]:
    issues: list[str] = []
    # 1. Catch sub-12px CSS font instructions (< 12px violates accessibility skill hard gate)
    sub_12 = re.findall(r"\b(?:[6-9]|10|11(?:\.5)?)\s*(?:px|pt)\b", md_text)
    # Allow 8px/10px ONLY when followed by radius, gap, padding, border, grid, margin, ring, offset
    for match in re.finditer(r"\b([6-9]|10|11(?:\.5)?)\s*(px|pt)\b([^\n.,;]{0,28})", md_text, re.I):
        tail = match.group(3).lower()
        prev_start = max(0, match.start() - 24)
        head = md_text[prev_start:match.start()].lower()
        context = head + " " + tail
        if not any(k in context for k in ("gap", "pad", "radius", "radii", "corner", "margin", "border", "grid", "track", "icon", "ring", "offset", "dot", "stroke")):
            issues.append(
                f"Sub-12px font size token '{match.group(0).strip()}' violates WCAG 12px floor (use 12-13px floor and >=16px body)."
            )
            break
    if sub_12 and "shrunk by ~50%" in md_text.lower():
        issues.append("Legacy 'shrunk by ~50%' directive detected; replace with surface-calibrated viewport + % canvas height + char/line budget.")
    # 2. Require viewport / canvas ratio anchor so Nano Banana knows physical scale
    spec = SURFACE_SPECS[surface]
    if str(spec["logical_w"]) not in md_text and "% of canvas height" not in md_text.lower():
        issues.append(
            f"Missing {surface} scale anchor ({spec['logical_viewport']} or '% of canvas height') — bare CSS px numbers drift in Nano Banana."
        )
    if "chars/line" not in md_text.lower() and "characters per line" not in md_text.lower():
        issues.append(
            f"Missing character-per-line measure lock ({spec['body_measure']}) — copy measure mechanically prevents bloated/tiny text."
        )
    if primary in AI_CLICHE_FONTS:
        issues.append(f"Primary font '{primary}' is a banned AI cliché.")
    if secondary in AI_CLICHE_FONTS:
        issues.append(f"Secondary font '{secondary}' is a banned AI cliché; use a live-ranked easy-reading companion.")
    return issues


def cmd_audit(args: argparse.Namespace) -> int:
    surface = resolve_surface(args.surface)
    issues: list[str] = []
    fixes: dict[str, Any] = {}
    avoid = {x.strip() for x in (args.avoid or "").split(",") if x.strip()}

    snap = load_live_catalog(allow_network=not args.offline)
    if snap:
        for role, fname in (("primary", args.primary), ("secondary", args.secondary)):
            if not fname:
                continue
            if fname not in snap["families"]:
                issues.append(f"{role} font {fname!r} is not in the live Google Fonts web-safe catalog.")
                continue
            fam = snap["families"][fname]
            if not fam.get("latin", True):
                issues.append(f"{role} font {fname!r} lacks Latin subset coverage.")
            if fname in AI_CLICHE_FONTS and not args.allow_cliche:
                issues.append(f"{role} font {fname!r} is on the banned AI-cliche list.")
            if fname in avoid:
                issues.append(f"{role} font {fname!r} is in --avoid competitor list.")
            if role == "secondary":
                tags = family_tags_map(snap, fam)
                cat_l = (fam.get("category") or "").lower()
                easy = tags.get("/Purpose/Easy Reading", 0)
                readability_trait = max(
                    tags.get("/Sans/Humanist", 0),
                    tags.get("/Sans/Neo Grotesque", 0),
                    tags.get("/Sans/Grotesque", 0),
                    tags.get("/Serif/Old Style Garalde", 0),
                    tags.get("/Serif/Transitional", 0),
                )
                if not has_body_weights(fam):
                    issues.append(f"secondary body font {fname!r} lacks 400 + 500/600 weights required for web UI & body.")
                if cat_l in ("display", "handwriting"):
                    issues.append(f"secondary body font {fname!r} has category '{fam.get('category')}' — body/UI requires Sans Serif or readable Text Serif.")
                if (
                    tags.get("/Expressive/Loud", 0) >= 35
                    or tags.get("/Serif/Fat Face", 0) >= 40
                    or tags.get("/Serif/Didone", 0) >= 55
                    or (easy < 45 and readability_trait < 60)
                ):
                    issues.append(
                        f"secondary body font {fname!r} fails accessible reading criteria (/Purpose/Easy Reading={easy}); run 'pair' for a body workhorse."
                    )

    # Contrast checks (WCAG 2.2 AA aligned with accessibility/SKILL.md)
    contrast_receipts: dict[str, Any] = {}
    if args.bg_hex:
        if args.bg_hex.strip().lower() in WARM_BEIGE_BANNED and not args.allow_beige:
            issues.append(f"bg-hex {args.bg_hex} is a banned warm-beige default.")
        if args.fg_hex:
            r_fg = round(contrast_ratio(args.fg_hex, args.bg_hex), 2)
            contrast_receipts["fg_on_bg"] = r_fg
            if r_fg < 4.5:
                fix_hex = suggest_accessible_hex(args.fg_hex, args.bg_hex, 4.5)
                issues.append(f"fg-hex {args.fg_hex} on {args.bg_hex} is {r_fg}:1 (< 4.5:1 WCAG AA body).")
                fixes["fg_hex"] = fix_hex
        if args.muted_hex:
            r_mut = round(contrast_ratio(args.muted_hex, args.bg_hex), 2)
            contrast_receipts["muted_on_bg"] = r_mut
            if r_mut < 4.5:
                fix_hex = suggest_accessible_hex(args.muted_hex, args.bg_hex, 4.5)
                issues.append(f"muted-hex {args.muted_hex} on {args.bg_hex} is {r_mut}:1 (< 4.5:1 WCAG AA captions/UI).")
                fixes["muted_hex"] = fix_hex
        if args.accent_hex and args.on_accent_hex:
            r_acc = round(contrast_ratio(args.on_accent_hex, args.accent_hex), 2)
            contrast_receipts["on_accent_on_accent"] = r_acc
            if r_acc < 4.5:
                fix_hex = suggest_accessible_hex(args.on_accent_hex, args.accent_hex, 4.5)
                issues.append(f"on-accent {args.on_accent_hex} on {args.accent_hex} is {r_acc}:1 (< 4.5:1 WCAG AA button label).")
                fixes["on_accent_hex"] = fix_hex

    prompt_reports: list[dict[str, Any]] = []
    if args.prompt_md:
        target = pathlib.Path(args.prompt_md).expanduser().resolve()
        md_files = sorted(target.glob("*.md")) if target.is_dir() else [target]
        for mf in md_files:
            txt = mf.read_text(encoding="utf-8")
            p_issues = audit_prompt_text(txt, surface, args.primary or "", args.secondary or "")
            prompt_reports.append({"file": str(mf), "passed": len(p_issues) == 0, "issues": p_issues})
            issues.extend(f"{mf.name}: {msg}" for msg in p_issues)

    report = {
        "passed": len(issues) == 0,
        "surface": surface,
        "primary": args.primary,
        "secondary": args.secondary,
        "contrast": contrast_receipts,
        "suggested_token_fixes": fixes,
        "prompt_files": prompt_reports,
        "issues": issues,
    }
    print(json.dumps(report, indent=2))
    return 0 if report["passed"] else 1


def magick_bin() -> str:
    return "/usr/bin/magick" if pathlib.Path("/usr/bin/magick").exists() else "magick"


def cmd_scale_seed(args: argparse.Namespace) -> int:
    """Render a non-beige 2K surface-calibrated structural & font-scale seed PNG for Round 1 conditioning."""
    surface = resolve_surface(args.surface)
    spec = SURFACE_SPECS[surface]
    w, h = int(spec["canvas_w"]), int(spec["canvas_h"])
    bg = args.bg_hex.strip()
    if bg.lower() in WARM_BEIGE_BANNED and not args.allow_beige:
        print(f"Refusing warm-beige seed {bg}; choose a crisp non-beige ground.", file=sys.stderr)
        return 2
    surf = args.surface_hex.strip()
    line = args.line_hex.strip()
    accent = args.accent_hex.strip()
    ink_bar = suggest_accessible_hex(line, bg, 3.2)

    out_path = pathlib.Path(args.out).expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    draws: list[str] = []
    if surface == "desktop-web":
        # 1440x810 scaled to 2752x1536: nav=130px, H1=2 bars x 104px, body=3 bars x 31px, CTA=86px tall
        draws += [
            f"fill {surf} stroke {line} stroke-width 2 rectangle 0,0 {w},132",
            f"fill {accent} stroke none roundrectangle {w - 420},28 {w - 120},104 38,38",
            f"fill none stroke {line} stroke-width 2 line 120,220 {w - 120},220",
            # Left column H1 (6.8% height x 2 lines) + 16px body (2.0% height x 3 lines) + 44px CTA (5.6% height)
            f"fill {ink_bar} stroke none rectangle 120,310 1120,414",
            f"fill {ink_bar} stroke none rectangle 120,436 980,540",
            f"fill {line} stroke none rectangle 120,600 1140,631",
            f"fill {line} stroke none rectangle 120,652 1090,683",
            f"fill {line} stroke none rectangle 120,704 860,735",
            f"fill {accent} stroke none roundrectangle 120,805 510,892 42,42",
            f"fill {surf} stroke {line} stroke-width 2 roundrectangle 540,805 860,892 42,42",
            # Right hero stage + 3-col bottom strip + footer
            f"fill {surf} stroke {line} stroke-width 2 roundrectangle 1280,220 {w - 120},1040 16,16",
            f"fill {surf} stroke {line} stroke-width 2 rectangle 120,1100 {w - 120},1380",
            f"fill {surf} stroke {line} stroke-width 2 rectangle 0,1420 {w},{h}",
        ]
    elif surface == "mobile":
        # 390x844 -> 1536x2752: header=210px, H1=2 bars x 104px, body=3 bars x 56px, 44pt CTA=176px, 4-tab=280px
        draws += [
            f"fill {surf} stroke {line} stroke-width 3 rectangle 0,0 {w},220",
            f"fill {ink_bar} stroke none rectangle 84,300 {w - 220},404",
            f"fill {ink_bar} stroke none rectangle 84,428 {w - 380},532",
            f"fill {line} stroke none rectangle 84,592 {w - 120},648",
            f"fill {line} stroke none rectangle 84,676 {w - 180},732",
            f"fill {surf} stroke {line} stroke-width 3 roundrectangle 84,790 {w - 84},1640 36,36",
            f"fill {accent} stroke none roundrectangle 140,1410 {w - 140},1586 84,84",
            f"fill {surf} stroke {line} stroke-width 3 roundrectangle 84,1700 740,2360 32,32",
            f"fill {surf} stroke {line} stroke-width 3 roundrectangle 796,1700 {w - 84},2360 32,32",
            # Native 4-tab bottom bar
            f"fill {surf} stroke {line} stroke-width 3 rectangle 0,{h - 284} {w},{h}",
        ]
        tab_w = w // 4
        for idx in range(4):
            cx = idx * tab_w + tab_w // 2
            col = accent if idx == 0 else line
            draws.append(f"fill {col} stroke none roundrectangle {cx - 42},{h - 230} {cx + 42},{h - 148} 16,16")
            draws.append(f"fill {col} stroke none rectangle {cx - 64},{h - 126} {cx + 64},{h - 90}")
    elif surface == "desktop-app":
        # 1440x900 -> 2752x1536: 232px sidebar (~440px), 56px topbar (~104px), 1-line H1 (~48px), 42px data rows (~74px)
        draws += [
            f"fill {surf} stroke {line} stroke-width 2 rectangle 0,0 440,{h}",
            f"fill {surf} stroke {line} stroke-width 2 rectangle 440,0 {w},104",
            f"fill {ink_bar} stroke none rectangle 504,148 1060,196",
            f"fill {accent} stroke none roundrectangle {w - 380},140 {w - 80},208 14,14",
        ]
        for k in range(3):
            x0 = 504 + k * 736
            draws.append(f"fill {surf} stroke {line} stroke-width 2 roundrectangle {x0},248 {x0 + 704},436 14,14")
        # Built-up multi-column data table with 11 crisp 42px CSS rows
        draws.append(f"fill {surf} stroke {line} stroke-width 2 roundrectangle 504,476 {w - 80},{h - 64} 14,14")
        for row_i in range(1, 12):
            ry = 476 + row_i * 82
            if ry < h - 80:
                draws.append(f"fill none stroke {line} stroke-width 2 line 504,{ry} {w - 80},{ry}")
    else:
        # Isolated Component (2400x1792, >=20% studio margin -> card 480..1920 x 320..1472)
        draws += [
            f"fill {surf} stroke {line} stroke-width 3 roundrectangle 460,300 {w - 460},{h - 300} 32,32",
            f"fill {ink_bar} stroke none rectangle 556,396 1240,468",
            f"fill {line} stroke none rectangle 556,508 1680,558",
            f"fill {line} stroke none rectangle 556,580 1480,630",
            f"fill {bg} stroke {line} stroke-width 3 roundrectangle 556,690 {w - 556},1140 24,24",
            f"fill {accent} stroke none roundrectangle 556,1210 1220,1352 68,68",
            f"fill {bg} stroke {line} stroke-width 3 roundrectangle 1260,1210 {w - 556},1352 68,68",
        ]

    cmd = [
        magick_bin(),
        "-size",
        f"{w}x{h}",
        f"xc:{bg}",
        "-colorspace",
        "sRGB",
    ]
    for d in draws:
        cmd += ["-draw", d]
    cmd += ["-define", "png:color-type=2", f"PNG24:{out_path}"]
    subprocess.run(cmd, check=True)
    print(json.dumps({"passed": True, "surface": surface, "canvas_px": f"{w}x{h}", "out": str(out_path)}, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Web-safe accessible Google Font pairing, WCAG pre-flight, and 4-surface Nano Banana font-scale engine."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_pair = sub.add_parser("pair", help="Pair a Primary Headline Google Font with a live-scored Web-Safe Accessible Companion Body Font.")
    p_pair.add_argument("--primary", required=True, help="Primary Google Font family name (from recommend_google_fonts.py).")
    p_pair.add_argument("--surface", default="desktop-web", help="Target surface: desktop-web, mobile, desktop-app, component.")
    p_pair.add_argument("--prefer-companion", choices=["auto", "sans", "serif"], default="auto")
    p_pair.add_argument("--avoid", default="", help="Comma-separated competitor font families to exclude.")
    p_pair.add_argument("--allow-cliche", action="store_true")
    p_pair.add_argument("--offline", action="store_true")

    p_blk = sub.add_parser("prompt-block", help="Emit the exact Surface-Calibrated Nano Banana Typography & Copy-Budget Block.")
    p_blk.add_argument("--surface", required=True, help="desktop-web | mobile | desktop-app | component")
    p_blk.add_argument("--primary", default="", help="Primary headline Google Font family.")
    p_blk.add_argument("--secondary", default="", help="Secondary companion body/UI Google Font family.")
    p_blk.add_argument("--primary-anatomy", default="", help="Optional custom physical anatomy string for primary font.")
    p_blk.add_argument("--secondary-anatomy", default="", help="Optional custom physical anatomy string for secondary font.")
    p_blk.add_argument("--format", choices=["text", "json"], default="text")

    p_aud = sub.add_parser("audit", help="Pre-Nano typography, WCAG 2.2 AA contrast, and prompt copy-budget audit (0 image calls spent).")
    p_aud.add_argument("--surface", required=True, help="desktop-web | mobile | desktop-app | component")
    p_aud.add_argument("--primary", default="", help="Primary headline Google Font family.")
    p_aud.add_argument("--secondary", default="", help="Secondary companion body/UI Google Font family.")
    p_aud.add_argument("--bg-hex", default="", help="Primary background hex.")
    p_aud.add_argument("--fg-hex", default="", help="Primary text ink hex.")
    p_aud.add_argument("--muted-hex", default="", help="Muted/caption ink hex (>= 4.5:1 required).")
    p_aud.add_argument("--accent-hex", default="", help="Primary CTA/accent fill hex.")
    p_aud.add_argument("--on-accent-hex", default="", help="Button label ink hex on --accent-hex (>= 4.5:1 required).")
    p_aud.add_argument("--prompt-md", default="", help="Prompt .md file or directory to audit before calling Nano Banana.")
    p_aud.add_argument("--avoid", default="", help="Comma-separated competitor fonts.")
    p_aud.add_argument("--allow-cliche", action="store_true")
    p_aud.add_argument("--allow-beige", action="store_true")
    p_aud.add_argument("--offline", action="store_true")

    p_seed = sub.add_parser("scale-seed", help="Generate a 2K surface-calibrated structural & font-scale seed PNG for Round 1 conditioning.")
    p_seed.add_argument("--surface", required=True, help="desktop-web | mobile | desktop-app | component")
    p_seed.add_argument("--out", required=True, help="Output 2K PNG path.")
    p_seed.add_argument("--bg-hex", default="#FFFFFF")
    p_seed.add_argument("--surface-hex", default="#F4F6F9")
    p_seed.add_argument("--line-hex", default="#DCE1E8")
    p_seed.add_argument("--accent-hex", default="#0B3D26")
    p_seed.add_argument("--allow-beige", action="store_true")

    args = parser.parse_args()
    if args.command == "pair":
        return cmd_pair(args)
    if args.command == "prompt-block":
        return cmd_prompt_block(args)
    if args.command == "audit":
        return cmd_audit(args)
    return cmd_scale_seed(args)


if __name__ == "__main__":
    sys.exit(main())
