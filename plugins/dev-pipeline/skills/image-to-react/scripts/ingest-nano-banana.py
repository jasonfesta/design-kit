#!/usr/bin/env python3
"""Nano Banana Multi-Screenshot Ingestion & Spec Builder (`ingest-nano-banana.py`).

Ingests a Nano Banana export directory, markdown file, or JSON manifest containing:
  - 8+ Apps (each with 5 to 10+ screenshots)
  - 8+ Website Landing Pages & Sub-pages (each with 5 to 10+ screenshots)
  - UI Components & Chat UIs

For every discovered project group, this script:
  1. Assigns a canonical Golden Template 2-digit slug:
     - `<NN>-website-<descriptor>` (`Website Landing Page — <Title>`)
     - `<NN>-ui-<descriptor>` (`UI Component — <Title>`)
     - `<NN>-mobile-app-<descriptor>` (`Mobile App UI — <Title>`)
     - `<NN>-chat-ui-<descriptor>` (`Chat UI — <Title>`)
  2. Runs deterministic ImageMagick + PyCairo layout & color extraction across ALL
     5–10 screenshots in the project group (viewport WxH, dominant sRGB hex palette,
     unified 8-token Golden semantic CSS variables, snap rails, visual clusters, and
     optional cropped raster photography/illustrations).
  3. Emits `<out-dir>/<slug>/nano_banana_spec.json` and a master `<out-dir>/batch_manifest.json`
     ready for parallel sub-agent dispatch (`invoke_subagent` / `run_workflow`).

Runs 100% inside the standard sandbox (`BypassSandbox: false`) with zero external pip packages.
"""

import argparse
import json
import math
import os
import re
import shutil
import subprocess
import sys
from typing import Any, Dict, List, Optional, Tuple

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PREPARE_SCRIPT = os.path.join(SCRIPT_DIR, "prepare-and-extract-image.py")

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

CATEGORY_PREFIX_MAP = {
    "website": ("website", "Website Landing Page"),
    "landing": ("website", "Website Landing Page"),
    "landing-page": ("website", "Website Landing Page"),
    "web": ("website", "Website Landing Page"),
    "ui": ("ui", "UI Component"),
    "component": ("ui", "UI Component"),
    "widget": ("ui", "UI Component"),
    "mobile": ("mobile-app", "Mobile App UI"),
    "mobile-app": ("mobile-app", "Mobile App UI"),
    "app": ("mobile-app", "Mobile App UI"),
    "ios": ("mobile-app", "Mobile App UI"),
    "android": ("mobile-app", "Mobile App UI"),
    "chat": ("chat-ui", "Chat UI"),
    "chat-ui": ("chat-ui", "Chat UI"),
    "assistant": ("chat-ui", "Chat UI"),
}


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    # Strip forbidden vendor tokens if any appear in raw input filenames
    for forbidden in ("jetski", "chatgpt", "argon", "gemini-4-argon", "nano-banana"):
        s = re.sub(rf"\b{forbidden}\b", "", s).strip("-")
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "study"


def human_title(slug_part: str) -> str:
    words = [w for w in slug_part.replace("_", "-").split("-") if w]
    return " ".join(w.capitalize() for w in words) or "Interactive Study"


def hex_to_rgb(hex_str: str) -> Tuple[int, int, int]:
    h = hex_str.lstrip("#")
    if len(h) != 6:
        return (245, 242, 235)
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def relative_luminance(rgb: Tuple[int, int, int]) -> float:
    def chan(c: int) -> float:
        v = c / 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)


def saturation(rgb: Tuple[int, int, int]) -> float:
    r, g, b = [c / 255.0 for c in rgb]
    mx, mn = max(r, g, b), min(r, g, b)
    if mx == mn:
        return 0.0
    l = (mx + mn) / 2.0
    d = mx - mn
    return d / (2.0 - mx - mn) if l > 0.5 else d / (mx + mn)


def synthesize_semantic_tokens(all_dominant_colors: List[Dict[str, Any]]) -> Dict[str, str]:
    """Derives the 8 canonical Golden Template CSS custom properties from screen palettes."""
    seen = {}
    for item in all_dominant_colors:
        hx = item.get("hex", "#F5F2EB").upper()
        seen[hx] = seen.get(hx, 0.0) + float(item.get("ratio", 0.05))

    ranked = sorted(seen.items(), key=lambda kv: -kv[1])
    hexes = [kv[0] for kv in ranked] if ranked else ["#F5F2EB", "#1E1B18", "#9B4D30"]

    # Primary surface is highest-share color
    surface = hexes[0]
    surf_lum = relative_luminance(hex_to_rgb(surface))
    is_dark_theme = surf_lum < 0.25

    # Pick ink with highest contrast against surface
    best_ink = "#181615" if not is_dark_theme else "#F7F4EF"
    best_contrast = 0.0
    for hx in hexes:
        lum = relative_luminance(hex_to_rgb(hx))
        c = (max(surf_lum, lum) + 0.05) / (min(surf_lum, lum) + 0.05)
        if c > best_contrast and c >= 3.5:
            best_contrast = c
            best_ink = hx

    # Pick accent with highest saturation distinct from surface and ink
    best_accent = "#9B4D30" if not is_dark_theme else "#E07A5F"
    best_sat = -1.0
    for hx in hexes:
        if hx in (surface, best_ink):
            continue
        rgb = hex_to_rgb(hx)
        sat = saturation(rgb)
        if sat > best_sat:
            best_sat = sat
            best_accent = hx

    accent_lum = relative_luminance(hex_to_rgb(best_accent))
    on_accent = "#FFFDF9" if accent_lum < 0.42 else "#181615"

    return {
        "--surface": surface,
        "--surface-raised": "#FFFDF9" if not is_dark_theme else "#242228",
        "--ink": best_ink,
        "--muted": "#6E655F" if not is_dark_theme else "#A8A29E",
        "--accent": best_accent,
        "--accent-alt": hexes[min(2, len(hexes) - 1)],
        "--on-accent": on_accent,
        "--border": "#E2DCD3" if not is_dark_theme else "#34323A",
    }


def infer_category(group_name: str, first_w: int, first_h: int, metadata: Dict[str, Any]) -> Tuple[str, str]:
    raw_cat = str(metadata.get("category") or metadata.get("kind") or "").lower().strip()
    if raw_cat in CATEGORY_PREFIX_MAP:
        return CATEGORY_PREFIX_MAP[raw_cat]

    lower = group_name.lower()
    if any(k in lower for k in ("chat", "assistant", "composer", "reasoning", "prompt")):
        return CATEGORY_PREFIX_MAP["chat-ui"]
    if any(k in lower for k in ("mobile", "ios", "android", "phone", "onboarding", "pocket")):
        return CATEGORY_PREFIX_MAP["mobile-app"]
    if any(k in lower for k in ("website", "landing", "hero", "studio", "brand", "site", "page")):
        return CATEGORY_PREFIX_MAP["website"]
    if any(k in lower for k in ("app", "tracker", "dashboard", "flow", "booking", "order")):
        # Portrait aspect ratio -> mobile-app, landscape -> ui or website
        if first_h > first_w * 1.15:
            return CATEGORY_PREFIX_MAP["mobile-app"]
        return CATEGORY_PREFIX_MAP["ui"]
    if first_h > first_w * 1.2:
        return CATEGORY_PREFIX_MAP["mobile-app"]
    if first_w >= 1200:
        return CATEGORY_PREFIX_MAP["website"]
    return CATEGORY_PREFIX_MAP["ui"]


def discover_groups_from_directory(input_dir: str) -> List[Dict[str, Any]]:
    """Discovers project groups from subdirectories or filename prefixes."""
    groups: List[Dict[str, Any]] = []
    entries = sorted(os.listdir(input_dir))
    subdirs = [
        os.path.join(input_dir, d)
        for d in entries
        if os.path.isdir(os.path.join(input_dir, d)) and not d.startswith(".")
    ]

    if subdirs:
        for sd in subdirs:
            name = os.path.basename(sd)
            imgs = sorted(
                os.path.join(sd, f)
                for f in os.listdir(sd)
                if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS
            )
            if not imgs:
                continue
            md_files = sorted(
                os.path.join(sd, f)
                for f in os.listdir(sd)
                if f.lower().endswith((".md", ".txt"))
            )
            json_files = sorted(
                os.path.join(sd, f)
                for f in os.listdir(sd)
                if f.lower().endswith(".json")
            )
            meta: Dict[str, Any] = {}
            if json_files:
                try:
                    with open(json_files[0], "r", encoding="utf-8") as jf:
                        meta = json.load(jf)
                except Exception:
                    pass
            md_text = ""
            if md_files:
                try:
                    with open(md_files[0], "r", encoding="utf-8") as mf:
                        md_text = mf.read()
                except Exception:
                    pass
            groups.append({
                "raw_name": name,
                "images": imgs,
                "metadata": meta,
                "markdown": md_text,
            })
        return groups

    # Otherwise group flat images by prefix before `_screen`, `-screen`, `-01`, `_01`, etc.
    by_prefix: Dict[str, List[str]] = {}
    for f in entries:
        ext = os.path.splitext(f)[1].lower()
        if ext not in IMAGE_EXTENSIONS:
            continue
        stem = os.path.splitext(f)[0]
        m = re.match(r"^(.+?)(?:[-_](?:screen|page|view|step|shot|s)?[-_]?\d+)$", stem, re.IGNORECASE)
        prefix = m.group(1) if m else stem
        by_prefix.setdefault(prefix, []).append(os.path.join(input_dir, f))

    for prefix, imgs in sorted(by_prefix.items()):
        groups.append({
            "raw_name": prefix,
            "images": sorted(imgs),
            "metadata": {},
            "markdown": "",
        })
    return groups


def main() -> int:
    parser = argparse.ArgumentParser(description="Ingest Nano Banana multi-screenshot export into Golden Template specs.")
    parser.add_argument("--input", "--input-dir", dest="input", required=True, help="Path to Nano Banana directory or manifest.json")
    parser.add_argument("--out-dir", required=True, help="Output workspace directory for per-project specs and extracted assets")
    parser.add_argument("--moodboard-dir", default="/google/data/rw/users/jf/jfesta/moodboards/warm-landing-page", help="Target moodboard directory")
    parser.add_argument("--start-index", type=int, default=1, help="Starting 2-digit project index (default: 1)")
    parser.add_argument("--extract-crops", action="store_true", help="Extract cropped photo/illustration assets per screen")
    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    out_dir = os.path.abspath(args.out_dir)
    moodboard_dir = os.path.abspath(args.moodboard_dir)
    os.makedirs(out_dir, exist_ok=True)

    if os.path.isfile(input_path) and input_path.endswith(".json"):
        with open(input_path, "r", encoding="utf-8") as f:
            raw_manifest = json.load(f)
        groups = raw_manifest if isinstance(raw_manifest, list) else raw_manifest.get("projects", [])
    elif os.path.isdir(input_path):
        groups = discover_groups_from_directory(input_path)
    else:
        raise SystemExit(f"Unsupported --input path: {input_path}")

    batch_projects: List[Dict[str, Any]] = []

    for idx, grp in enumerate(groups):
        num = args.start_index + idx
        raw_name = grp.get("raw_name") or grp.get("name") or grp.get("slug") or f"project-{num:02d}"
        images = [os.path.abspath(p) for p in grp.get("images", []) if os.path.exists(p)]
        if not images:
            continue

        # Inspect first image dimensions
        dim_out = subprocess.check_output(
            ["/usr/bin/magick", "identify", "-format", "%w %h", images[0]],
            text=True,
        ).strip().split()
        first_w, first_h = int(dim_out[0]), int(dim_out[1])

        meta = grp.get("metadata") or {}
        cat_slug, cat_title_prefix = infer_category(raw_name, first_w, first_h, meta)

        # Clean descriptor slug
        clean_desc = slugify(re.sub(r"^\d{2}-(website|ui|mobile-app|chat-ui)-", "", raw_name))
        project_slug = f"{num:02d}-{cat_slug}-{clean_desc}"
        title_str = meta.get("title") or f"{cat_title_prefix} — {human_title(clean_desc)}"
        if not title_str.startswith(cat_title_prefix):
            title_str = f"{cat_title_prefix} — {title_str}"

        proj_work_dir = os.path.join(out_dir, project_slug)
        os.makedirs(proj_work_dir, exist_ok=True)

        screens_spec: List[Dict[str, Any]] = []
        all_dom_colors: List[Dict[str, Any]] = []

        for s_idx, img_path in enumerate(images):
            screen_id = f"screen-{s_idx + 1:02d}"
            screen_work_dir = os.path.join(proj_work_dir, screen_id)
            os.makedirs(screen_work_dir, exist_ok=True)

            cmd = [
                sys.executable,
                PREPARE_SCRIPT,
                f"--input_image={img_path}",
                f"--workspace_dir={screen_work_dir}",
            ]

            raw_prep = subprocess.check_output(cmd, text=True)
            prep_data = json.loads(raw_prep)
            dom_cols = prep_data.get("dominant_palette") or prep_data.get("dominant_colors") or []
            all_dom_colors.extend(dom_cols)

            artifacts = prep_data.get("artifacts") or {}
            viewport = prep_data.get("viewport") or {}
            prep_info = prep_data.get("preparation") or {}
            norm_mockup = (
                prep_data.get("normalized_mockup")
                or artifacts.get("mockup_png")
                or os.path.join(screen_work_dir, "mockup.png")
            )
            norm_w = viewport.get("width_px") or (prep_data.get("normalized_size") or {}).get("width") or first_w
            norm_h = viewport.get("height_px") or (prep_data.get("normalized_size") or {}).get("height") or first_h
            scale_factor = prep_data.get("scale_factor") or prep_info.get("scale") or 1.0
            cand_overlay = (
                prep_data.get("candidates_overlay")
                or artifacts.get("candidates_overlay_png")
                or os.path.join(screen_work_dir, "mockup_candidates_overlay.png")
            )
            cand_json = (
                artifacts.get("candidates_json")
                or os.path.join(screen_work_dir, "mockup_candidates.json")
            )

            stem_label = human_title(os.path.splitext(os.path.basename(img_path))[0])
            screens_spec.append({
                "index": s_idx,
                "screen_id": screen_id,
                "label": stem_label,
                "source_image": img_path,
                "reference_png": norm_mockup,
                "normalized_mockup": norm_mockup,
                "width": int(norm_w),
                "height": int(norm_h),
                "scale_factor": float(scale_factor),
                "dominant_colors": dom_cols,
                "layout_metrics_path": artifacts.get("layout_metrics_json") or os.path.join(screen_work_dir, "layout_metrics.json"),
                "candidates_path": cand_json,
                "candidates_overlay": cand_overlay,
                "candidates_count": prep_data.get("candidates_count", 0),
                "assets_json_path": os.path.join(screen_work_dir, "assets.json"),
            })

        semantic_tokens = synthesize_semantic_tokens(all_dom_colors)
        target_project_dir = os.path.join(moodboard_dir, "projects", project_slug)

        project_spec = {
            "project_slug": project_slug,
            "category_slug": cat_slug,
            "category_title_prefix": cat_title_prefix,
            "html_title": title_str,
            "target_project_dir": target_project_dir,
            "moodboard_dir": moodboard_dir,
            "screen_count": len(screens_spec),
            "semantic_tokens": semantic_tokens,
            "metadata": meta,
            "markdown_notes": grp.get("markdown") or "",
            "screens": screens_spec,
            "eval_command": (
                f"/usr/local/google/home/jfesta/.local/bin/node "
                f"{os.path.join(SCRIPT_DIR, 'eval-multi-screen-project.mjs')} "
                f"--project={target_project_dir} "
                f"--spec={os.path.join(proj_work_dir, 'nano_banana_spec.json')} "
                f"--target-score=0.85"
            ),
        }

        spec_path = os.path.join(proj_work_dir, "nano_banana_spec.json")
        with open(spec_path, "w", encoding="utf-8") as sf:
            json.dump(project_spec, sf, indent=2)

        batch_projects.append({
            "project_slug": project_slug,
            "html_title": title_str,
            "screen_count": len(screens_spec),
            "spec_path": spec_path,
            "target_project_dir": target_project_dir,
            "eval_command": project_spec["eval_command"],
        })

    batch_manifest = {
        "total_projects": len(batch_projects),
        "total_screens": sum(p["screen_count"] for p in batch_projects),
        "moodboard_dir": moodboard_dir,
        "workspace_dir": out_dir,
        "projects": batch_projects,
    }
    manifest_path = os.path.join(out_dir, "batch_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(batch_manifest, mf, indent=2)

    print(json.dumps(batch_manifest, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
