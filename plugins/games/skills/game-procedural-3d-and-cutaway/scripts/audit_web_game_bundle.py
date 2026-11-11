#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Audit static web game bundles for opaque-origin sandbox compatibility, rendering medium, and touch readiness."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys
from typing import Any

RELATIVE_FETCH_RE = re.compile(
    r"""\bfetch\s*\(\s*["'](?!(?:https?:|data:|blob:))[^"']+["']""",
    re.I,
)
LOCAL_CROSSORIGIN_RE = re.compile(
    r"""<(?:script|link)\b(?![^>]*\b(?:src|href)\s*=\s*["']https?:)[^>]*\bcrossorigin\b""",
    re.I,
)
STORAGE_RE = re.compile(r"\b(?:localStorage|sessionStorage)\b")
IMPORT_META_RE = re.compile(r"\bimport\.meta\b")
WEBGL_OR_3D_RE = re.compile(
    r"\b(?:WebGLRenderer|WebGPURenderer|PerspectiveCamera|OrthographicCamera|InstancedMesh|ShaderMaterial)\b"
    r"""|getContext\s*\(\s*["'](?:webgl2?|webgpu)["']"""
    r"|\bnavigator\.gpu\b",
)
CANVAS_2D_RE = re.compile(r"""getContext\s*\(\s*["']2d["']""")
CANVAS_TAG_RE = re.compile(r"<canvas\b|\bcreateElement\s*\(\s*[\"']canvas[\"']\s*\)", re.I)
SVG_STAGE_RE = re.compile(r"<svg\b|\bcreateElementNS\s*\(\s*[\"']http://www\.w3\.org/2000/svg[\"']", re.I)


def _strip_js_comments(source: str) -> str:
    no_block = re.sub(r"/\*[\s\S]*?\*/", "", source)
    return re.sub(r"//.*$", "", no_block, flags=re.M)


def _extract_inline_classic_scripts(html_text: str) -> str:
    chunks: list[str] = []
    for match in re.finditer(r"<script\b([^>]*)>([\s\S]*?)</script>", html_text, flags=re.I):
        attrs, body = match.group(1), match.group(2)
        if re.search(r'type\s*=\s*["\'](?:module|importmap|application/json|text/plain)["\']', attrs, re.I):
            continue
        chunks.append(_strip_js_comments(body))
    return "\n".join(chunks)


def detect_render_surfaces(html_corpus: str, js_corpus: str) -> list[str]:
    """Classify rendering surfaces present in the bundle."""
    combined = f"{html_corpus}\n{js_corpus}"
    surfaces: list[str] = []
    if WEBGL_OR_3D_RE.search(combined):
        surfaces.append("webgl_or_3d")
    if CANVAS_2D_RE.search(combined) or (CANVAS_TAG_RE.search(combined) and "webgl_or_3d" not in surfaces):
        surfaces.append("canvas2d")
    if SVG_STAGE_RE.search(combined):
        surfaces.append("svg")
    if not surfaces:
        surfaces.append("dom_only")
    return surfaces


def audit_bundle_dir(
    dist_dir: Path,
    *,
    forbid_svg_only: bool = False,
    require_3d: bool = False,
) -> dict[str, Any]:
    """Inspect .html, .css, and .js files under dist_dir for sandbox, rendering, and mobile pitfalls."""
    errors: list[str] = []
    warnings: list[str] = []
    if not dist_dir.exists() or not dist_dir.is_dir():
        return {
            "ok": False,
            "html_files": 0,
            "js_files": 0,
            "css_files": 0,
            "render_surfaces": [],
            "warnings": [],
            "errors": [f"Bundle directory does not exist: {dist_dir}"],
        }

    html_files = sorted(dist_dir.rglob("*.html"))
    js_files = sorted(dist_dir.rglob("*.js"))
    css_files = sorted(dist_dir.rglob("*.css"))

    if not html_files:
        return {
            "ok": False,
            "html_files": 0,
            "js_files": len(js_files),
            "css_files": len(css_files),
            "render_surfaces": [],
            "warnings": [],
            "errors": [f"No HTML entry files found in {dist_dir}"],
        }

    css_corpus = "\n".join(p.read_text(encoding="utf-8", errors="replace") for p in css_files)
    js_clean_by_file = {
        p: _strip_js_comments(p.read_text(encoding="utf-8", errors="replace")) for p in js_files
    }
    html_texts: list[str] = []
    inline_scripts: list[str] = []

    for hp in html_files:
        rel = hp.relative_to(dist_dir)
        txt = hp.read_text(encoding="utf-8", errors="replace")
        html_texts.append(txt)
        inline_clean = _extract_inline_classic_scripts(txt)
        inline_scripts.append(inline_clean)

        if re.search(r'<script[^>]+type\s*=\s*["\']module["\']', txt, re.I):
            errors.append(
                f"{rel}: <script type='module'> fails under opaque origins (origin === 'null'); bundle as a classic script."
            )
        if re.search(r'<script[^>]+type\s*=\s*["\']importmap["\']', txt, re.I):
            errors.append(f"{rel}: <script type='importmap'> fails under opaque origins.")
        if IMPORT_META_RE.search(inline_clean):
            errors.append(
                f"{rel}: 'import.meta' inside a classic <script> throws SyntaxError; rewrite or define it during bundling."
            )
        if LOCAL_CROSSORIGIN_RE.search(txt):
            errors.append(f"{rel}: 'crossorigin' attribute on a local asset triggers CORS rejection on opaque origins.")
        if not re.search(r'<meta[^>]+name\s*=\s*["\']viewport["\']', txt, re.I):
            errors.append(f"{rel}: missing <meta name='viewport'> tag for mobile scaling.")

        has_touch_action = (
            "touch-action" in txt
            or "touch-action" in css_corpus
            or any("touchAction" in js_txt or "touch-action" in js_txt for js_txt in js_clean_by_file.values())
        )
        if not has_touch_action:
            errors.append(
                f"{rel}: no 'touch-action' rule found in HTML, CSS, or JS; mobile drags may scroll the page."
            )

        if RELATIVE_FETCH_RE.search(inline_clean):
            errors.append(f"{rel}: relative fetch() fails on opaque origins; inline data or load via classic script.")
        if STORAGE_RE.search(inline_clean) and "catch" not in inline_clean:
            errors.append(f"{rel}: unguarded localStorage/sessionStorage access throws SecurityError on sandboxed hosts.")

    for jp, clean_js in js_clean_by_file.items():
        rel_j = jp.relative_to(dist_dir)
        if IMPORT_META_RE.search(clean_js):
            errors.append(
                f"{rel_j}: 'import.meta' inside a classic script bundle throws SyntaxError outside ES modules."
            )
        if RELATIVE_FETCH_RE.search(clean_js):
            errors.append(f"{rel_j}: relative fetch() fails on opaque origins; embed assets or load via script tags.")
        if STORAGE_RE.search(clean_js) and "catch" not in clean_js:
            errors.append(f"{rel_j}: unguarded localStorage/sessionStorage access throws SecurityError on sandboxed hosts.")

    surfaces = detect_render_surfaces(
        "\n".join(html_texts),
        "\n".join([*inline_scripts, *js_clean_by_file.values()]),
    )
    svg_or_dom_only = "webgl_or_3d" not in surfaces and "canvas2d" not in surfaces
    if svg_or_dom_only:
        msg = f"Bundle uses {surfaces} with no <canvas> or WebGL/3D rendering surface."
        if forbid_svg_only:
            errors.append(msg)
        else:
            warnings.append(msg)

    if require_3d and "webgl_or_3d" not in surfaces:
        errors.append(
            f"Bundle requires 3D/WebGL/WebGPU rendering (--require-3d), but detected surfaces: {surfaces}."
        )

    return {
        "ok": len(errors) == 0,
        "html_files": len(html_files),
        "js_files": len(js_files),
        "css_files": len(css_files),
        "render_surfaces": surfaces,
        "warnings": warnings,
        "errors": errors,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Audit built web game HTML/CSS/JS files for static sandbox, rendering medium, and mobile touch readiness."
    )
    parser.add_argument("--dist-dir", type=Path, required=True, help="Directory containing built static web files")
    parser.add_argument(
        "--forbid-svg-only",
        action="store_true",
        help="Fail if the bundle relies only on SVG/DOM elements with no <canvas> or WebGL/3D stage",
    )
    parser.add_argument(
        "--require-3d",
        action="store_true",
        help="Fail unless WebGL, WebGPU, or Three.js 3D rendering is detected in the bundle",
    )
    parser.add_argument("--json", action="store_true", help="Print structured JSON output")
    args = parser.parse_args()

    report = audit_bundle_dir(
        args.dist_dir,
        forbid_svg_only=args.forbid_svg_only,
        require_3d=args.require_3d,
    )
    if args.json:
        print(json.dumps(report, indent=2))
    elif report["ok"]:
        print(
            f"[PASS] {args.dist_dir} ({report['html_files']} HTML, {report['js_files']} JS, surfaces={report['render_surfaces']}) passed static bundle checks."
        )
    else:
        for err in report["errors"]:
            print(f"[FAIL] {err}", file=sys.stderr)

    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
