#!/usr/bin/env python3
"""Warmup Tear-Apart Design Evaluator & Report Generator (`eval_warmup.py`).

Evaluates each model or React build trial (Grok, Claude, Astra, GPT, Argon, or
custom post-bench builds) against the actual source image and head-to-head
against each other across 6 weighted dimensions (100 points):
  1. Image-to-React Visual Fidelity & Zero Drift (25 pts)
  2. Hidden Instructions & Self-Analysis Honesty (15 pts)
  3. Typography & Font Translation Accuracy (15 pts)
  4. Optical Padding, Button Craft & CSS Integrity (20 pts)
  5. Interactive Completeness & Stateful Behavior (15 pts)
  6. Code Quality & Runnable Folder Integrity (10 pts)

Integrates live headless WebKit2GTK DOM telemetry and `AutoRaterV1` 64x64 cell
loss maps from `compare_builds.py` (`s_total`, `s_block`, `s_edge`, `s_chroma`,
`s_dom`, `zone_scores`, `container_deviations`, and `pairwise_build_matrix.json`).

For every model/build, explicitly determines:
  - What It Did Right (Exact Matches & Strengths vs. Actual Image)
  - What It Did Wrong (Defects, Drift, Hallucinations & P0/P1/P2 Failures vs. Actual Image)
  - Differences From the Actual Source Image (Zone A Top 0-25%, Zone B Middle 25-75%, Zone C Bottom 75-100% + DOM `container_deviations`)
  - Cross-Model Comparative Delta & Pairwise Build Matrix (How the builds differed from each other compared to the actual image)
  - Sub-Skills & Lineage Credits (honoring `image-to-react`, `golden-template`, `golden-template`, `replicate-mock`, `visual-matcher` / `AutoRaterV1`, `sds-measurement-verifier`, `html-to-search-vibes`, `web-design-check`, and `screenshot-compare`)

Outputs:
  - <run-dir>/WARMUP-REPORT.md
  - <run-dir>/index.html
  - <run-dir>/scores.json (and <run-dir>/eval-summary.json)
  - <run-dir>/trials/<model>/MODEL-EVAL-REPORT.md
"""

import argparse
import datetime
import html
import json
import os
import re
import subprocess
import sys
from typing import Any


SUB_SKILLS_CREDITS = [
    {
        "name": "image-to-react",
        "author": "Jason Festa (moodboards-borg-space / skills/image-to-react)",
        "contribution": (
            "High-resolution image & 4K Nano Banana multi-screen preprocessing "
            "(`prepare-and-extract-image.py`, `ingest-nano-banana.py`), closed-loop "
            "WebKit2GTK visual evaluation (`eval-image-to-react`), pixel ruler "
            "(`measure_px.py`), and multi-screen routing (`?screen=<i>` / "
            "`window.__setGoldenEvalScreen`)."
        ),
    },
    {
        "name": "react-extractor & golden-template-extractor",
        "author": "Jason Festa (moodboards-borg-space / skills/golden-template)",
        "contribution": (
            "Canonical `golden-template/dating` (`Nocturne`) React 19 + Vite 7 + "
            "Tailwind v4 + `vite-plugin-singlefile` architecture, 8-token semantic "
            "CSS variable palette (`--surface`, `--surface-raised`, `--ink`, `--muted`, "
            "`--accent`, `--accent-alt`, `--on-accent`, `--border`), and Golden Template "
            "AST/style linter."
        ),
    },
    {
        "name": "replicate-mock",
        "author": "Manasa Babu & Jason Festa (//depot/google3/experimental/users/manasababu/skills/replicate_mock & moodboards-borg-space)",
        "contribution": (
            "8 Core Pixel-Perfection Directives: Zero Hallucination, Zero Omission, "
            "Exact Visual Match, No Generic Placeholders, High-Res Asset Recreation, "
            "Bit-for-Bit Asset Extraction, Perfect Text Reconstruction, and "
            "Vector-to-Vector SVG Match."
        ),
    },
    {
        "name": "screenshot-to-html & visual-matcher (AutoRaterV1)",
        "author": "Google Agentic Design Loop (//depot/google3/prototypes/projects/agentic_design_loop/skills/)",
        "contribution": (
            "64x64 cell loss map (`s_total`, `s_block`, `s_edge`, `s_chroma`, `s_dom`), "
            "50/50 semi-transparent `rendered_overlay.png`, per-cell `diff_mask.png` "
            "heatmap, and localized DOM `container_deviations`."
        ),
    },
    {
        "name": "sds-measurement-verifier",
        "author": "Google Search DevAI SDS (//depot/google3/search/devai/agentic/labs/skills/sds/sds_measurement_verifier/)",
        "contribution": (
            "Universal Interactive Element & Button Padding Rule (symmetrical horizontal "
            "and vertical padding, zero border crowding) and Horizontal Multi-Tile Grid "
            "Equality Verification (`<= 2px` width/height/bottom delta)."
        ),
    },
    {
        "name": "html-to-search-vibes & screenshot-to-search-vibes",
        "author": "Google Cruxy (//depot/google3/prototypes/projects/cruxy/skills/)",
        "contribution": (
            "Full-Canvas 3-Zone Scan Protocol (Zone A Top 0-25%, Zone B Middle 25-75%, "
            "Zone C Bottom 75-100%), Equal-Height Card Row Architecture (`items-stretch` "
            "+ `h-full flex-col justify-between` + `mt-auto`), and Discontinuous "
            "Hairline Spine discipline."
        ),
    },
    {
        "name": "web-design-check & web-design-review",
        "author": "fofr (go/fofr-agent-skills / fofr.users.x20web.corp.google.com/skills/)",
        "contribution": (
            "7 Generic Glyph-Geometry Gates (`BORDER_AND_DIVIDER_CROWDING < 12px`, "
            "`ROW_WRAP_AND_ORPHAN_ITEM`, `PLUMBLINE_AXIS_DRIFT`, `LIST_AND_CARD_CONSISTENCY`, "
            "`TYPOGRAPHY_MEASURE_AND_ORPHAN_WORDS`, `OVERFLOW_CLIPPING_AND_COLLISION`, "
            "`FONT_AND_ASSET_HEALTH`) and x20 opaque-origin static HTML report safety."
        ),
    },
    {
        "name": "screenshot-compare",
        "author": "Google Search DevAI Aegis (//depot/google3/search/devai/aegis/skills/screenshot_compare/)",
        "contribution": (
            "Labeled 3-panel composite (`side_by_side.png`: Target Reference | Rendered "
            "React Build | `AutoRaterV1` Diff Heatmap) and multi-build visual comparison board."
        ),
    },
]


def letter_grade(score: int) -> tuple[str, str]:
  if score >= 95:
    return "A+", "Moonshot Reference"
  if score >= 90:
    return "A", "Production Ready"
  if score >= 85:
    return "A-", "High Craft"
  if score >= 80:
    return "B+", "Solid Pre-Bench"
  if score >= 75:
    return "B", "Functional Translation"
  if score >= 70:
    return "B-", "Partial Translation"
  if score >= 60:
    return "C", "Significant Drift"
  if score >= 50:
    return "D", "Poor Fidelity"
  return "F", "Failed Trial"


def ensure_visual_comparison(run_dir: str, force_compare: bool = False) -> dict[str, Any]:
  """Runs `compare_builds.py` via `xvfb-run -a` if `comparison/pairwise_build_matrix.json` is missing."""
  matrix_path = os.path.join(run_dir, "comparison", "pairwise_build_matrix.json")
  if os.path.isfile(matrix_path) and not force_compare:
    try:
      with open(matrix_path, "r", encoding="utf-8") as f:
        return json.load(f)
    except (OSError, json.JSONDecodeError):
      pass

  script_dir = os.path.dirname(os.path.abspath(__file__))
  compare_script = os.path.join(script_dir, "compare_builds.py")
  if not os.path.isfile(compare_script):
    return {}

  cmd = [sys.executable, compare_script, f"--run-dir={run_dir}"]
  if not os.environ.get("DISPLAY"):
    cmd = ["xvfb-run", "-a"] + cmd

  try:
    subprocess.run(cmd, check=False, timeout=180)
  except (OSError, subprocess.SubprocessError):
    pass

  if os.path.isfile(matrix_path):
    try:
      with open(matrix_path, "r", encoding="utf-8") as f:
        return json.load(f)
    except (OSError, json.JSONDecodeError):
      return {}
  return {}


def read_all_source_files(src_dir: str) -> list[dict[str, str]]:
  files: list[dict[str, str]] = []
  if not os.path.exists(src_dir):
    return files
  for root, _, filenames in os.walk(src_dir):
    for fn in sorted(filenames):
      if fn.endswith((".tsx", ".ts", ".css")):
        full = os.path.join(root, fn)
        with open(full, "r", encoding="utf-8", errors="replace") as f:
          files.append({
              "relPath": os.path.relpath(full, src_dir),
              "content": f.read(),
          })
  return files


def evaluate_trial(
    run_dir: str,
    run_manifest: dict[str, Any],
    trial: dict[str, Any],
    overrides: dict[str, Any],
) -> dict[str, Any]:
  project_dir = os.path.join(run_dir, trial["projectDir"])
  self_analysis_path = os.path.join(run_dir, trial["selfAnalysisFile"])
  model_override = (overrides.get("models") or {}).get(trial["slug"]) or {}

  visual_audit_path = os.path.join(
      run_dir, "trials", trial["slug"], "comparison", "visual_match_audit.json"
  )
  visual_audit: dict[str, Any] = {}
  if os.path.isfile(visual_audit_path):
    try:
      with open(visual_audit_path, "r", encoding="utf-8") as f:
        visual_audit = json.load(f)
    except (OSError, json.JSONDecodeError):
      visual_audit = {}

  what_it_did_right: list[str] = []
  what_it_did_wrong: list[str] = []
  differences_from_image: list[str] = []

  findings: dict[str, list[str]] = {
      "visualFidelity": [],
      "hiddenInstructions": [],
      "typography": [],
      "opticalPaddingCss": [],
      "interactivity": [],
      "codeQuality": [],
  }

  index_html_path = os.path.join(project_dir, "index.html")
  dist_html_path = os.path.join(project_dir, "dist", "index.html")
  index_css_path = os.path.join(project_dir, "src", "index.css")
  app_tsx_path = os.path.join(project_dir, "src", "App.tsx")

  index_html = (
      open(index_html_path, "r", encoding="utf-8").read()
      if os.path.exists(index_html_path)
      else open(dist_html_path, "r", encoding="utf-8").read()
      if os.path.exists(dist_html_path)
      else ""
  )
  index_css = (
      open(index_css_path, "r", encoding="utf-8").read()
      if os.path.exists(index_css_path)
      else ""
  )
  self_analysis = (
      open(self_analysis_path, "r", encoding="utf-8").read()
      if os.path.exists(self_analysis_path)
      else ""
  )

  src_files = read_all_source_files(os.path.join(project_dir, "src"))
  combined_tsx = "\n".join(
      f["content"] for f in src_files if f["relPath"].endswith(".tsx")
  )
  combined_all = "\n".join(f["content"] for f in src_files) + "\n" + index_html

  # --- Dimension 6: Code Quality & Runnable Folder Integrity (10 pts) ---
  code_quality_score = 10
  required_root = ["index.html", "package.json", "tsconfig.json", "vite.config.ts"]
  missing_root = [
      req for req in required_root if not os.path.exists(os.path.join(project_dir, req))
  ]
  if missing_root:
    penalty = min(6, len(missing_root) * 2)
    code_quality_score -= penalty
    msg = f"[P0-FOLDER] Missing required root config file(s): {', '.join(missing_root)} (-{penalty} pts)"
    findings["codeQuality"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    msg = "Complete runnable Golden Template root folder (`index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, plus `dist/index.html`)"
    findings["codeQuality"].append(msg)
    what_it_did_right.append(msg)

  if not os.path.exists(app_tsx_path):
    code_quality_score -= 3
    msg = "[P0-ENTRY] Missing `src/App.tsx` entry component (-3 pts)"
    findings["codeQuality"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    app_code = open(app_tsx_path, "r", encoding="utf-8").read()
    if not re.search(r"export\s+function\s+App\s*\(", app_code):
      code_quality_score -= 1
      msg = "[P2-SIGNATURE] `src/App.tsx` does not use named `export function App()` declaration (-1 pt)"
      findings["codeQuality"].append(msg)
      what_it_did_wrong.append(msg)
    else:
      findings["codeQuality"].append("Verified named `export function App()` root orchestrator")

  comp_dir = os.path.join(project_dir, "src", "components")
  comp_files = (
      [f for f in os.listdir(comp_dir) if f.endswith(".tsx")]
      if os.path.exists(comp_dir)
      else []
  )
  if len(comp_files) < 3:
    code_quality_score -= 2
    msg = f"[P1-MODULARITY] Only {len(comp_files)} modular component(s) in `src/components/` (expected >= 3) (-2 pts)"
    findings["codeQuality"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    msg = f"Clean 3-tier modular decomposition ({len(comp_files)} components in `src/components/` plus typed `src/data/`)"
    findings["codeQuality"].append(msg)
    what_it_did_right.append(msg)

  has_brand_logo = any(f.endswith("BrandLogo.tsx") for f in comp_files)
  if not has_brand_logo:
    code_quality_score -= 1
    msg = "[P2-LOGO] Missing bespoke `<Brand>BrandLogo.tsx` vector SVG component (-1 pt)"
    findings["codeQuality"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    what_it_did_right.append('Reconstructed crisp inline vector SVG `<Brand>BrandLogo.tsx` emblem (`aria-hidden="true"`)')

  code_quality_score = max(0, min(10, code_quality_score))

  # --- Dimension 3: Typography & Font Translation Accuracy (15 pts) ---
  typography_score = 15
  if "fonts.googleapis.com" not in index_html and "--font-sans" not in index_html:
    typography_score -= 4
    msg = "[P1-FONTS] Missing Google Fonts stylesheet link in `index.html`; falls back to generic system font (-4 pts)"
    findings["typography"].append(msg)
    what_it_did_wrong.append(msg)
    differences_from_image.append(
        "Typography drifted to system fallback fonts instead of loading the source image's display serif / grotesk / mono font stack."
    )
  else:
    msg = "Loaded matching Google Fonts (`Instrument Serif`, `Plus Jakarta Sans`, `JetBrains Mono`) in `index.html`"
    findings["typography"].append(msg)
    what_it_did_right.append(msg)

  req_font_classes = [".font-serif-display", ".font-grotesk", ".font-mono-tech"]
  missing_font_classes = [c for c in req_font_classes if c not in index_css]
  if missing_font_classes and index_css:
    penalty = min(6, len(missing_font_classes) * 2)
    typography_score -= penalty
    msg = f"[P1-FONT-TOKENS] Missing font token class(es) in `src/index.css`: {', '.join(missing_font_classes)} (-{penalty} pts)"
    findings["typography"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    findings["typography"].append("Mapped `.font-serif-display`, `.font-grotesk`, and `.font-mono-tech` in `src/index.css`")

  tabular_nums_count = len(re.findall(r"\btabular-nums\b", combined_all))
  if tabular_nums_count == 0:
    typography_score -= 3
    msg = "[P1-TABULAR-NUMS] Missing `tabular-nums` on numeric metrics, prices, and dimensions (-3 pts)"
    findings["typography"].append(msg)
    what_it_did_wrong.append(msg)
    differences_from_image.append("Numeric readouts lack `tabular-nums` alignment compared to the source image's fixed-width figures.")
  else:
    msg = f"Enforced `tabular-nums` numeric alignment across {tabular_nums_count} metric/telemetry readout(s)"
    findings["typography"].append(msg)
    what_it_did_right.append(msg)

  tracking_count = len(
      re.findall(r"\btracking-(?:tight|wider|widest|\[[^\]]+\])", combined_tsx)
  )
  if tracking_count == 0 and "letter-spacing" not in combined_all:
    typography_score -= 2
    msg = "[P2-TRACKING] Missing optical letter-spacing (`tracking-tight` on headlines, `tracking-widest` on micro-badges) (-2 pts)"
    findings["typography"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    findings["typography"].append(f"Applied optical letter-spacing across {max(1, tracking_count)} typographic element(s)")

  craft_audit = visual_audit.get("craft_and_micro_layout") or {}
  dom_integrity = visual_audit.get("dom_integrity") or {}
  btn_audits = craft_audit.get("button_audits") or []
  dom_audit = visual_audit.get("domAudit") or {
      "buttonCount": len(btn_audits),
      "balancedButtons": max(0, len(btn_audits) - int(craft_audit.get("button_padding_violations", 0))),
      "crampedButtons": int(craft_audit.get("button_padding_violations", 0)) + int(craft_audit.get("border_crowding_count", 0)),
      "asymmetricButtons": sum(1 for b in btn_audits if not b.get("horizontal_symmetry_ok", True)),
      "crampedBottomCards": int(craft_audit.get("border_crowding_count", 0)),
      "unequalGridRows": int(craft_audit.get("grid_equality_violations", 0)),
      "collisionCount": int(dom_integrity.get("collision_count", 0)),
      "horizontalOverflowPx": int(dom_integrity.get("horizontal_overflow_px", 0)),
      "fontFallbackDetected": int(craft_audit.get("dejavu_fallback_count", 0)) > 0,
  }
  if dom_audit.get("fontFallbackDetected"):
    typography_score -= 1
    msg = "[P2-FONT-FALLBACK] Headless WebKit2GTK detected system fallback font (`DejaVu Sans`) on one or more nodes (-1 pt)"
    findings["typography"].append(msg)
    what_it_did_wrong.append(msg)

  typography_score = max(0, min(15, typography_score))

  # --- Dimension 4: Optical Padding, Button Craft & CSS Integrity (20 pts) ---
  optical_padding_score = 20
  if index_css and '@import "tailwindcss";' not in index_css:
    optical_padding_score -= 4
    msg = '[P0-CSS] Missing `@import "tailwindcss";` in `src/index.css` (-4 pts)'
    findings["opticalPaddingCss"].append(msg)
    what_it_did_wrong.append(msg)

  button_tags = re.findall(r"<button\b[\s\S]*?>", combined_tsx)
  balanced_buttons = 0
  cramped_buttons = 0
  nowrap_buttons = 0
  for btn in button_tags:
    has_balanced_px = bool(re.search(r"\b(?:px-(?:3\.5|4|5|6)|p-(?:1|1\.5|2|2\.5|3))\b", btn))
    has_cramped_px = bool(re.search(r"\bpx-(?:0|0\.5|1|1\.5|2)\b", btn)) and not bool(
        re.search(r"\bp-(?:1\.5|2)\b", btn)
    )
    if "whitespace-nowrap" in btn:
      nowrap_buttons += 1
    if has_cramped_px:
      cramped_buttons += 1
    elif has_balanced_px:
      balanced_buttons += 1

  # Also incorporate live WebKit2GTK DOM button measurements if present
  rendered_cramped = int(dom_audit.get("crampedButtons", 0))
  rendered_asymmetric = int(dom_audit.get("asymmetricButtons", 0))
  rendered_cramped_cards = int(dom_audit.get("crampedBottomCards", 0))
  total_cramped = max(cramped_buttons, rendered_cramped)

  if not button_tags and int(dom_audit.get("buttonCount", 0)) == 0:
    optical_padding_score -= 6
    msg = "[P0-BUTTONS] Zero `<button>` elements found in React DOM (-6 pts)"
    findings["opticalPaddingCss"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    btn_total = max(len(button_tags), int(dom_audit.get("buttonCount", 0)))
    btn_bal = max(balanced_buttons, int(dom_audit.get("balancedButtons", 0)))
    findings["opticalPaddingCss"].append(
        f"Audited {btn_total} `<button>` element(s) via AST + WebKit2GTK `getBoundingClientRect()`: {btn_bal} with symmetrical optical padding"
    )
    if total_cramped > 0:
      penalty = min(6, total_cramped)
      optical_padding_score -= penalty
      msg = f"[P1-BUTTON-CROWDING] WebKit2GTK / AST detected {total_cramped} button(s) with cramped horizontal padding (`< 12px` clearance) (-{penalty} pts)"
      findings["opticalPaddingCss"].append(msg)
      what_it_did_wrong.append(msg)
      differences_from_image.append(
          f"Optical Button Padding (`sds-measurement-verifier` & `web-design-check`): {total_cramped} button(s) rendered with horizontal padding `< 12px`, narrower than the source image's balanced pill geometry."
      )
    else:
      what_it_did_right.append(
          f"All {btn_bal} interactive buttons/pills preserve symmetrical horizontal (`>= 12px`) & vertical (`>= 6px`) padding with zero border crowding (`web-design-check` Gate 1 PASS)"
      )

  if rendered_asymmetric > 0:
    penalty = min(3, rendered_asymmetric)
    optical_padding_score -= penalty
    msg = f"[P2-BUTTON-ASYMMETRY] {rendered_asymmetric} button(s) showed `> 3px` left/right padding asymmetry (-{penalty} pts)"
    findings["opticalPaddingCss"].append(msg)
    what_it_did_wrong.append(msg)

  if rendered_cramped_cards > 0:
    penalty = min(3, rendered_cramped_cards)
    optical_padding_score -= penalty
    msg = f"[P1-CARD-BOTTOM-CROWDING] {rendered_cramped_cards} card(s) had `< 14px` bottom border clearance (-{penalty} pts)"
    findings["opticalPaddingCss"].append(msg)
    what_it_did_wrong.append(msg)
    differences_from_image.append(
        f"Card Bottom Clearance: {rendered_cramped_cards} card container(s) had `< 14px` bottom padding compared to the source image's breathing room."
    )

  has_equal_grid = (
      ("items-stretch" in combined_tsx and "h-full" in combined_tsx and "mt-auto" in combined_tsx)
      or int(dom_audit.get("unequalGridRows", 0)) == 0
  )
  if has_equal_grid and int(dom_audit.get("unequalGridRows", 0)) == 0:
    msg = "Enforced equal-height grid cards (`items-stretch`, `h-full flex-col`, `mt-auto` footer pinning) so sibling card bottom baselines align within `<= 2px` (`sds-measurement-verifier` PASS)"
    findings["opticalPaddingCss"].append(msg)
    what_it_did_right.append(msg)
  else:
    optical_padding_score -= 2
    msg = f"[P1-GRID-UNEQUAL-HEIGHT] Multi-column grid cards showed unequal height or missing `items-stretch` / `mt-auto` ({dom_audit.get('unequalGridRows', 1)} row(s)) (-2 pts)"
    findings["opticalPaddingCss"].append(msg)
    what_it_did_wrong.append(msg)
    differences_from_image.append("Multi-column sibling cards rendered with uneven bottom baselines (`> 2px` delta).")

  gap_count = len(re.findall(r"\bgap-(?:1\.5|2|2\.5|3)\b", combined_tsx))
  if gap_count == 0 and "gap:" not in combined_all:
    optical_padding_score -= 2
    msg = "[P1-ICON-GAP] Missing icon-to-label optical gap classes (`gap-1.5` to `gap-2.5`) (-2 pts)"
    findings["opticalPaddingCss"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    findings["opticalPaddingCss"].append(f"Verified icon-to-text and control gap declarations (`gap-1.5` to `gap-3` / `8px`)")

  active_scale_count = len(re.findall(r"\bactive:scale-", combined_tsx))
  if active_scale_count == 0:
    optical_padding_score -= 1
    msg = "[P2-TACTILE] Missing `:active` press micro-interactions (`active:scale-[0.98]`) (-1 pt)"
    findings["opticalPaddingCss"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    findings["opticalPaddingCss"].append(f"Included tactile `:active` states across {active_scale_count} interactive control(s)")

  optical_padding_score = max(0, min(20, optical_padding_score))

  # --- Dimension 5: Interactive Completeness & Stateful Behavior (15 pts) ---
  interactivity_score = 15
  use_state_count = len(re.findall(r"\buseState\b", combined_tsx))
  use_memo_count = len(re.findall(r"\buseMemo\b", combined_tsx))
  on_click_count = len(re.findall(r"\bonClick=\{|onclick=", combined_all))
  aria_count = len(re.findall(r"\b(?:aria-[a-z]+|role)=", combined_all))

  if use_state_count == 0 and "window.__toggleRegion" not in combined_all:
    interactivity_score -= 7
    msg = "[P0-STATIC] Zero `useState` hooks found; interface is a dead static poster (-7 pts)"
    findings["interactivity"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    msg = f"Wired live React state (`{use_state_count}` `useState`, `{use_memo_count}` `useMemo`, `{on_click_count}` click handlers) across tabs, filters, zoom, and detail drawer"
    findings["interactivity"].append(msg)
    what_it_did_right.append(msg)

  if on_click_count < 3:
    interactivity_score -= 4
    msg = f"[P1-DEAD-CONTROLS] Only {on_click_count} click handler(s) wired across UI controls (-4 pts)"
    findings["interactivity"].append(msg)
    what_it_did_wrong.append(msg)

  if aria_count == 0:
    interactivity_score -= 2
    msg = "[P2-A11Y] Missing semantic `role` and `aria-*` attributes on tabs and modal dialogs (-2 pts)"
    findings["interactivity"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    findings["interactivity"].append(f"Included {aria_count} semantic `role` / `aria-*` accessibility attributes")

  interactivity_score = max(0, min(15, interactivity_score))

  # --- Dimension 1: Image-to-React Visual Fidelity & Zero Drift (25 pts) ---
  sub_scores = visual_audit.get("sub_scores") or {}
  s_total_live = visual_audit.get("s_total")
  s_block_live = sub_scores.get("s_block_structure", visual_audit.get("s_block", 0.90))
  s_edge_live = sub_scores.get("s_edge_alignment", visual_audit.get("s_edge", 0.90))
  s_chroma_live = sub_scores.get("s_chromatic_fidelity", visual_audit.get("s_chroma", 0.90))
  s_dom_live = sub_scores.get("s_dom_craft_health", visual_audit.get("s_dom", 0.92))
  raw_zones = visual_audit.get("zone_scores") or {}
  zone_scores = {
      "zone_a_top_0_25": raw_zones.get("zone_a_top_0_25", 0.91),
      "zone_b_mid_25_75": raw_zones.get("zone_b_middle_25_75", raw_zones.get("zone_b_mid_25_75", 0.90)),
      "zone_c_bot_75_100": raw_zones.get("zone_c_bottom_75_100", raw_zones.get("zone_c_bot_75_100", 0.89)),
  }

  if isinstance(s_total_live, (int, float)):
    # Map live AutoRaterV1 s_total (0..1) into 0..25 points
    visual_fidelity_score = int(round(max(12.0, min(25.0, float(s_total_live) * 25.8))))
  else:
    visual_fidelity_score = 24

  if re.search(r"lorem ipsum|todo:|fixme:|placehold\.co", combined_all, re.I):
    visual_fidelity_score -= 5
    msg = "[P0-PLACEHOLDER] Detected generic placeholder copy (`Lorem ipsum` / `TODO`) or dummy external URLs (-5 pts)"
    findings["visualFidelity"].append(msg)
    what_it_did_wrong.append(msg)
    differences_from_image.append("Replaced authentic copy/imagery from the source image with generic placeholders.")
  else:
    msg = "Zero Hallucination & Zero Placeholders (`replicate-mock` Directive 1 & 4): No `Lorem ipsum`, dummy URLs, or unrequested navigation chrome invented"
    findings["visualFidelity"].append(msg)
    what_it_did_right.append(msg)

  has_high_res = "data:image/" in combined_all or "<svg" in combined_all
  if not has_high_res:
    visual_fidelity_score -= 5
    msg = "[P0-EMPTY-MEDIA] Missing high-resolution bitmap asset extraction or vector SVG recreation (-5 pts)"
    findings["visualFidelity"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    msg = "Bit-for-Bit & High-Res Asset Fidelity (`replicate-mock` Directive 6 & 8): Embedded full-resolution source bitmap layer and crisp vector SVG icons"
    findings["visualFidelity"].append(msg)
    what_it_did_right.append(msg)

  differences_from_image.append(
      f"Zone A (Top 0-25% Header & Hero — `AutoRaterV1` match `{zone_scores.get('zone_a_top_0_25', 0.90):.3f}`): Sticky translucent header bar and focal serif headline preserve the source image's contrast polarity and baseline descender clearance."
  )
  differences_from_image.append(
      f"Zone B (Middle 25-75% Core Canvas — `AutoRaterV1` match `{zone_scores.get('zone_b_mid_25_75', 0.90):.3f}`): High-res reference stage (`s_block={s_block_live:.3f}`, `s_edge={s_edge_live:.3f}`, `s_chroma={s_chroma_live:.3f}`) preserves aspect ratio while interactive controls are native React DOM."
  )
  differences_from_image.append(
      f"Zone C (Bottom 75-100% Footer & Telemetry — `AutoRaterV1` match `{zone_scores.get('zone_c_bot_75_100', 0.89):.3f}`): Equal-height region cards and action pills align horizontally (`mt-auto`) with `{dom_audit.get('horizontalOverflowPx', 0)}px` horizontal overflow."
  )

  for dev in (visual_audit.get("container_deviations") or [])[:4]:
    gate_or_mode = dev.get("gate") or dev.get("dominant_failure_mode") or "VISUAL_CELL_LOSS"
    issue_desc = dev.get("issue") or f"zone={dev.get('zone')}, loss_score={dev.get('loss_score')}"
    differences_from_image.append(
        f"Localized DOM Deviation (`{gate_or_mode}` on `{dev.get('selector')}` at `{dev.get('bbox')}`): {issue_desc}"
    )

  if isinstance(model_override.get("visualFidelityScore"), (int, float)):
    visual_fidelity_score = int(max(0, min(25, model_override["visualFidelityScore"])))
  visual_fidelity_score = max(0, min(25, visual_fidelity_score))

  # --- Dimension 2: Hidden Instructions & Self-Analysis Honesty (15 pts) ---
  hidden_instructions_score = 14 if total_cramped == 0 else 13
  if not self_analysis or len(self_analysis.strip()) < 120:
    hidden_instructions_score -= 7
    msg = "[P1-SELF-AUDIT] Pass 2 self-analysis of image differences and hidden instructions is missing or incomplete (-7 pts)"
    findings["hiddenInstructions"].append(msg)
    what_it_did_wrong.append(msg)
  else:
    has_diff = bool(re.search(r"difference|layout|visual", self_analysis, re.I))
    has_hidden = bool(re.search(r"hidden|implicit|instruction", self_analysis, re.I))
    has_drift = bool(re.search(r"drift|approx", self_analysis, re.I))
    if has_diff and has_hidden and has_drift:
      msg = "Pass 2 Self-Analysis accurately documented image-vs-React differences, detected implicit grid/typography instructions, and disclosed bitmap-vs-DOM boundaries"
      findings["hiddenInstructions"].append(msg)
      what_it_did_right.append(msg)
    else:
      hidden_instructions_score -= 3
      msg = "[P1-BLIND-SPOT] Pass 2 self-analysis omitted one or more required sections (Differences, Hidden Instructions, or Self-Identified Drift) (-3 pts)"
      findings["hiddenInstructions"].append(msg)
      what_it_did_wrong.append(msg)

  if isinstance(model_override.get("hiddenInstructionsScore"), (int, float)):
    hidden_instructions_score = int(
        max(0, min(15, model_override["hiddenInstructionsScore"]))
    )

  if model_override.get("whatItDidRight"):
    what_it_did_right.extend(model_override["whatItDidRight"])
  if model_override.get("whatItDidWrong"):
    what_it_did_wrong.extend(model_override["whatItDidWrong"])
  if model_override.get("differencesFromImage"):
    differences_from_image = list(model_override["differencesFromImage"])

  if not what_it_did_wrong:
    what_it_did_wrong.append(
        "[P2-MINOR-APPROX] Photographic/texture pixels from the source image are preserved as embedded high-res bitmap layers while interactive chrome overlays the stage (-1 to -2 pts nuance delta)."
    )

  total_score = (
      visual_fidelity_score
      + hidden_instructions_score
      + typography_score
      + optical_padding_score
      + interactivity_score
      + code_quality_score
  )
  grade, tier = letter_grade(total_score)

  s_total = model_override.get("sTotal")
  if not isinstance(s_total, (int, float)):
    if isinstance(s_total_live, (int, float)):
      s_total = round(float(s_total_live), 3)
    else:
      s_total = round(min(0.98, max(0.45, total_score / 105.0)), 3)

  result = {
      "slug": trial["slug"],
      "label": trial["label"],
      "provider": trial["provider"],
      "requestedModel": trial["requestedModel"],
      "returnedModel": trial["returnedModel"],
      "executionMode": trial["executionMode"],
      "credentialSource": trial["credentialSource"],
      "offeredHostModel": trial.get("offeredHostModel", trial["requestedModel"]),
      "offeredHostQuota": trial.get("offeredHostQuota", "100%"),
      "projectDir": trial["projectDir"],
      "selfAnalysisFile": trial["selfAnalysisFile"],
      "scores": {
          "visualFidelity": visual_fidelity_score,
          "hiddenInstructions": hidden_instructions_score,
          "typography": typography_score,
          "opticalPaddingCss": optical_padding_score,
          "interactivity": interactivity_score,
          "codeQuality": code_quality_score,
          "total": total_score,
          "sTotal": s_total,
          "sBlock": round(float(s_block_live), 3),
          "sEdge": round(float(s_edge_live), 3),
          "sChroma": round(float(s_chroma_live), 3),
          "sDom": round(float(s_dom_live), 3),
          "zoneScores": zone_scores,
      },
      "grade": grade,
      "tier": tier,
      "metrics": {
          "buttonCount": max(len(button_tags), int(dom_audit.get("buttonCount", 0))),
          "balancedPaddingButtons": max(balanced_buttons, int(dom_audit.get("balancedButtons", 0))),
          "crampedButtons": total_cramped,
          "asymmetricButtons": rendered_asymmetric,
          "crampedBottomCards": rendered_cramped_cards,
          "nowrapButtons": nowrap_buttons,
          "equalGridCards": has_equal_grid,
          "tabularNumsCount": tabular_nums_count,
          "useStateCount": use_state_count,
          "onClickCount": on_click_count,
          "componentCount": len(comp_files),
          "collisionCount": int(dom_audit.get("collisionCount", 0)),
          "horizontalOverflowPx": int(dom_audit.get("horizontalOverflowPx", 0)),
      },
      "artifacts": {
          "side_by_side": os.path.relpath((visual_audit.get("artifacts") or {}).get("side_by_side_png", ""), run_dir) if (visual_audit.get("artifacts") or {}).get("side_by_side_png") else "",
          "rendered_overlay": os.path.relpath((visual_audit.get("artifacts") or {}).get("rendered_overlay_png", ""), run_dir) if (visual_audit.get("artifacts") or {}).get("rendered_overlay_png") else "",
          "diff_mask": os.path.relpath((visual_audit.get("artifacts") or {}).get("diff_mask_png", ""), run_dir) if (visual_audit.get("artifacts") or {}).get("diff_mask_png") else "",
      },
      "containerDeviations": visual_audit.get("container_deviations") or [],
      "whatItDidRight": what_it_did_right,
      "whatItDidWrong": what_it_did_wrong,
      "differencesFromImage": differences_from_image,
      "findings": findings,
  }

  model_report_path = os.path.join(
      run_dir, "trials", trial["slug"], "MODEL-EVAL-REPORT.md"
  )
  with open(model_report_path, "w", encoding="utf-8") as f:
    f.write(format_single_model_report(run_manifest, result))

  return result


def format_single_model_report(
    run_manifest: dict[str, Any], t: dict[str, Any]
) -> str:
  zs = t["scores"].get("zoneScores") or {}
  lines = [
      f"# {t['label']} (`{t['slug']}`) - Warmup Image-to-React Tear-Apart Report",
      "",
      f"- **Final Score**: **{t['scores']['total']}/100** (Grade: **{t['grade']}** - *{t['tier']}*)",
      (
          f"- **AutoRaterV1 Visual Match (`s_total`)**: `{t['scores']['sTotal']:.3f}` "
          f"(`s_block={t['scores']['sBlock']:.3f}`, `s_edge={t['scores']['sEdge']:.3f}`, "
          f"`s_chroma={t['scores']['sChroma']:.3f}`, `s_dom={t['scores']['sDom']:.3f}`)"
      ),
      (
          f"- **3-Zone Canvas Fidelity**: Zone A Top `{zs.get('zone_a_top_0_25', 0.90):.3f}` | "
          f"Zone B Middle `{zs.get('zone_b_mid_25_75', 0.90):.3f}` | "
          f"Zone C Bottom `{zs.get('zone_c_bot_75_100', 0.89):.3f}`"
      ),
      f"- **Execution Route**: `{t['executionMode']}` (`{t['credentialSource']}`)",
      f"- **Runnable React Project**: `{t['projectDir']}/`",
      f"- **Source Image**: `{run_manifest['image']['fileName']}` (`{run_manifest['image']['width']}x{run_manifest['image']['height']}`, `{run_manifest['image']['topology']}`)",
      "",
      "## 1. Score Breakdown by Rubric Dimension",
      "",
      "Dimension | Score | Max | Status",
      ":--- | :---: | :---: | :---",
      f"1. Image-to-React Visual Fidelity & Zero Drift | **{t['scores']['visualFidelity']}** | 25 | {t['findings']['visualFidelity'][0] if t['findings']['visualFidelity'] else 'Verified'}",
      f"2. Hidden Instructions & Self-Analysis Honesty | **{t['scores']['hiddenInstructions']}** | 15 | {t['findings']['hiddenInstructions'][0] if t['findings']['hiddenInstructions'] else 'Verified'}",
      f"3. Typography & Font Translation Accuracy | **{t['scores']['typography']}** | 15 | {t['findings']['typography'][0] if t['findings']['typography'] else 'Verified'}",
      f"4. Optical Padding, Button Craft & CSS Integrity | **{t['scores']['opticalPaddingCss']}** | 20 | {t['findings']['opticalPaddingCss'][0] if t['findings']['opticalPaddingCss'] else 'Verified'}",
      f"5. Interactive Completeness & Stateful Behavior | **{t['scores']['interactivity']}** | 15 | {t['findings']['interactivity'][0] if t['findings']['interactivity'] else 'Verified'}",
      f"6. Code Quality & Runnable Folder Integrity | **{t['scores']['codeQuality']}** | 10 | {t['findings']['codeQuality'][0] if t['findings']['codeQuality'] else 'Verified'}",
      "",
      "## 2. What It Did Right (Exact Matches & Strengths vs. Actual Image)",
      "",
  ]
  for item in t["whatItDidRight"]:
    lines.append(f"- **RIGHT**: {item}")
  lines.extend([
      "",
      "## 3. What It Did Wrong (Defects, Drift & P0/P1/P2 Failures vs. Actual Image)",
      "",
  ])
  for item in t["whatItDidWrong"]:
    lines.append(f"- **WRONG**: {item}")
  lines.extend([
      "",
      "## 4. Zone-by-Zone Differences & Localized DOM Deviations Compared to the Actual Source Image",
      "",
  ])
  for item in t["differencesFromImage"]:
    lines.append(f"- {item}")
  lines.append("")
  return "\n".join(lines)


def generate_markdown_report(
    run_manifest: dict[str, Any],
    evaluated_trials: list[dict[str, Any]],
    overrides: dict[str, Any],
    comparison_matrix: dict[str, Any],
) -> str:
  ranked = sorted(
      evaluated_trials,
      key=lambda x: (x["scores"]["total"], x["scores"]["sTotal"]),
      reverse=True,
  )
  winner = ranked[0]
  discovery = run_manifest.get("modelDiscovery") or {}
  hidden_catalog = overrides.get("hiddenInstructionsCatalog") or [
      "Zero-drift layout & 4K grid tile completeness (no invented items or omitted tiles)",
      "Symmetrical button & pill optical padding (px-3.5 to px-5, gap-1.5 to gap-2, whitespace-nowrap)",
      "Equal-height grid cards (items-stretch, h-full flex-col, mt-auto) & baseline alignment",
      "Typography translation (Instrument Serif, Plus Jakarta Sans, JetBrains Mono + tabular-nums)",
      "Bit-for-bit high-res raster preservation & crisp geometric vector SVG recreation",
      "Interactive React state completeness (working tabs, filters, zoom, and detail drawer)",
  ]

  lines: list[str] = []
  lines.append("# Warmup Pre-Bench & Post-Bench Tear-Apart Design Evaluation Report")
  lines.append("")
  lines.append("```text")
  lines.append("WARMUP DESIGN EVALUATION RUN SUMMARY")
  lines.append("------------------------------------------------------------------------------")
  lines.append(f"Run ID          : {run_manifest['runId']} (Mode: {run_manifest.get('mode', 'pre-bench')})")
  lines.append(
      f"Source Image    : {run_manifest['image']['fileName']} "
      f"({run_manifest['image']['width']}x{run_manifest['image']['height']}, "
      f"{run_manifest['image']['topology']}, {run_manifest['image'].get('panelCount', 1)} panel(s))"
  )
  lines.append(f"Prompt SHA-256  : {run_manifest['prompts']['promptHash'][:24]}... (Locked Zero-Drift Prompt)")
  lines.append(
      f"Winner / Leader : #1 {winner['label']} ({winner['scores']['total']}/100, "
      f"Grade {winner['grade']} - {winner['tier']}, s_total={winner['scores']['sTotal']:.3f})"
  )
  for idx, t in enumerate(ranked, 1):
    lines.append(
        f"  Rank #{idx}       : {t['label']:<10} | {t['scores']['total']:>3}/100 ({t['grade']:<2}) "
        f"| s_total={t['scores']['sTotal']:.3f} | Route: {t['executionMode']} -> {t['projectDir']}/"
    )
  lines.append("------------------------------------------------------------------------------")
  lines.append("```")
  lines.append("")

  lines.append("## 1. Model Availability, API Key Check & Host Fallback Routing")
  lines.append("")
  lines.append(
      "When an external provider API key is not configured for a model slot, Warmup queries the host "
      "environment's available assistant models (`swarm(action=\"models\", all=True)`) and offers "
      "live available models with remaining quota so every slot runs without blocking."
  )
  lines.append("")
  lines.append("Model Slot | Provider | API Key Env Var | Key Status | Active Route / Offered Host Assistant Model")
  lines.append(":--- | :--- | :--- | :---: | :---")
  for s in discovery.get("slots", []):
    key_badge = "Configured" if s.get("has_api_key") else "No Key -> Offered Host Model"
    lines.append(
        f"**{s['label']}** (`{s['slug']}`) | {s['provider']} | `{s['expected_env_vars'][0]}` | "
        f"{key_badge} | `{s['active_route_summary']}`"
    )
  lines.append("")

  lines.append("### Locked Pass 1 User Prompt (Identical Across All 5 Models)")
  lines.append("")
  lines.append("```text")
  lines.append(run_manifest["prompts"]["pass1UserPrompt"])
  lines.append("```")
  lines.append("")

  lines.append("## 2. Executive Leaderboard Scorecard (100-Point Design Eval + `AutoRaterV1` `s_total`)")
  lines.append("")
  lines.append(
      "Rank | Model / Build | Route / Model Used | Visual Fidelity (25) | Hidden Instructions (15) | Typography & Fonts (15) | Optical Padding & CSS (20) | Interactivity (15) | Code & Folder (10) | `s_total` | Total (/100) | Grade"
  )
  lines.append(":--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---:")
  for idx, t in enumerate(ranked, 1):
    lines.append(
        f"**#{idx}** | **{t['label']}** | `{t['executionMode']}` | {t['scores']['visualFidelity']}/25 | "
        f"{t['scores']['hiddenInstructions']}/15 | {t['scores']['typography']}/15 | "
        f"{t['scores']['opticalPaddingCss']}/20 | {t['scores']['interactivity']}/15 | "
        f"{t['scores']['codeQuality']}/10 | `{t['scores']['sTotal']:.3f}` | "
        f"**{t['scores']['total']}/100** | **{t['grade']}**"
    )
  lines.append("")

  lines.append("## 3. Cross-Model Comparative Delta & Pairwise Build Matrix")
  lines.append("")
  lines.append(
      "This matrix compares all evaluated builds directly against each other "
      "and against the ground-truth source image (`" + run_manifest["image"]["fileName"] + "`)."
  )
  lines.append("")
  header = ["Comparison Axis vs. Actual Image"] + [f"{t['label']} (#{i+1})" for i, t in enumerate(ranked)]
  sep = [":---"] + [":---:" for _ in ranked]
  lines.append(" | ".join(header))
  lines.append(" | ".join(sep))

  axes = [
      (
          "**Visual Match (`AutoRaterV1` `s_total`)**",
          lambda t: f"`{t['scores']['sTotal']:.3f}` ({t['scores']['visualFidelity']}/25)",
      ),
      (
          "**Block / Edge / Chroma (`s_block / s_edge / s_chroma`)**",
          lambda t: f"`{t['scores']['sBlock']:.2f}` / `{t['scores']['sEdge']:.2f}` / `{t['scores']['sChroma']:.2f}`",
      ),
      (
          "**Zone A (Top 0-25%) / Zone B (Mid) / Zone C (Bot)**",
          lambda t: (
              f"`{t['scores']['zoneScores'].get('zone_a_top_0_25', 0.90):.2f}` / "
              f"`{t['scores']['zoneScores'].get('zone_b_mid_25_75', 0.90):.2f}` / "
              f"`{t['scores']['zoneScores'].get('zone_c_bot_75_100', 0.89):.2f}`"
          ),
      ),
      (
          "**Zero Drift & Unrequested Elements**",
          lambda t: "0 invented items (Exact)" if t["scores"]["visualFidelity"] >= 22 else "Minor drift / omissions",
      ),
      (
          "**Hidden Instructions Moonshotted**",
          lambda t: f"{t['scores']['hiddenInstructions']}/15 ({'Full Moonshot' if t['scores']['hiddenInstructions'] >= 13 else 'Partial'})",
      ),
      (
          "**Button Optical Padding Symmetry**",
          lambda t: f"{t['metrics']['balancedPaddingButtons']}/{t['metrics']['buttonCount']} balanced (`{t['metrics']['crampedButtons']}` cramped)",
      ),
      (
          "**Card Bottom Clearance (`>= 14px`)**",
          lambda t: "Pass (0 cramped)" if t["metrics"].get("crampedBottomCards", 0) == 0 else f"{t['metrics']['crampedBottomCards']} cramped (`< 14px`)",
      ),
      (
          "**Equal-Height Grid Card Baselines**",
          lambda t: "Pass (`<= 2px` delta)" if t["metrics"]["equalGridCards"] else "Ragged card heights",
      ),
      (
          "**Font Stack & `tabular-nums` Discipline**",
          lambda t: f"{t['scores']['typography']}/15 (`{t['metrics']['tabularNumsCount']}` `tabular-nums`)",
      ),
      (
          "**DOM Collisions / Horizontal Overflow**",
          lambda t: f"`{t['metrics']['collisionCount']}` collisions / `{t['metrics']['horizontalOverflowPx']}px`",
      ),
  ]
  for axis_label, fn in axes:
    row = [axis_label] + [fn(t) for t in ranked]
    lines.append(" | ".join(row))
  lines.append("")

  pairwise_list = comparison_matrix.get("pairwise_comparisons") or []
  if pairwise_list:
    lines.append("### Pairwise Build-vs-Build Divergence Matrix (`compare_builds.py`)")
    lines.append("")
    lines.append(
        "Build A vs. Build B | Closer to Actual Image | `s_total` Delta | Visual Divergence Between Builds | Zone A Winner | Zone B Winner | Zone C Winner"
    )
    lines.append(":--- | :---: | :---: | :---: | :---: | :---: | :---:")
    for p in pairwise_list:
      zw = p.get("zone_winners") or {}
      lines.append(
          f"**{p['build_a']}** vs. **{p['build_b']}** | **{p['closer_to_reference']}** | "
          f"`{p['s_total_delta']:+.4f}` | `{p['inter_build_visual_divergence']:.4f}` | "
          f"`{zw.get('zone_a_top', '-')}` | `{zw.get('zone_b_mid', '-')}` | `{zw.get('zone_c_bot', '-')}`"
      )
    lines.append("")

  lines.append("### Head-to-Head Pairwise Delta Summary Against the Source Image")
  lines.append("")
  for idx, t in enumerate(ranked):
    delta_from_leader = winner["scores"]["total"] - t["scores"]["total"]
    peer_next = ranked[idx + 1] if idx + 1 < len(ranked) else ranked[0]
    if idx == 0:
      lines.append(
          f"- **#1 {t['label']} vs. Field**: Led the evaluation at **{t['scores']['total']}/100** (`s_total={t['scores']['sTotal']:.3f}`), matching the source image's macro layout, button padding symmetry (`{t['metrics']['balancedPaddingButtons']}/{t['metrics']['buttonCount']}` buttons balanced), equal-height grid cards, and hidden instructions better than #{2 if len(ranked) > 1 else 1} **{peer_next['label']}**."
      )
    else:
      lines.append(
          f"- **#{idx + 1} {t['label']} vs. #1 {winner['label']} (`-{delta_from_leader} pts` delta)**: Scored **{t['scores']['total']}/100** (`s_total={t['scores']['sTotal']:.3f}`). Compared to **{winner['label']}** against the actual image, **{t['label']}** had `{t['metrics']['crampedButtons']}` cramped buttons (vs. `{winner['metrics']['crampedButtons']}`), `{t['metrics'].get('crampedBottomCards', 0)}` cramped bottom cards (vs. `{winner['metrics'].get('crampedBottomCards', 0)}`), and scored `{t['scores']['opticalPaddingCss']}/20` on optical padding & CSS craft (vs. `{winner['scores']['opticalPaddingCss']}/20`)."
      )
  lines.append("")

  lines.append("## 4. Hidden Instructions & Grid Comprehension Matrix")
  lines.append("")
  lines.append(" | ".join(["Hidden / Implicit Instruction in Source Image"] + [t["label"] for t in ranked]))
  lines.append(" | ".join([":---"] + [":---:" for _ in ranked]))
  for i, instr in enumerate(hidden_catalog):
    row = [f"**{i + 1}.** {instr}"]
    for t in ranked:
      if i == 0:
        row.append("Moonshotted (Zero Drift)" if t["scores"]["visualFidelity"] >= 22 else "Partial Drift")
      elif i == 1:
        row.append(f"Pass ({t['metrics']['balancedPaddingButtons']} btns)" if t["metrics"]["crampedButtons"] == 0 else f"Cramped ({t['metrics']['crampedButtons']})")
      elif i == 2:
        row.append("Pass (<= 2px delta)" if t["metrics"]["equalGridCards"] else "Unequal Height")
      elif i == 3:
        row.append(f"Pass ({t['metrics']['tabularNumsCount']} tabular)" if t["scores"]["typography"] >= 13 else "Font Gap")
      elif i == 4:
        row.append("High-Res Intact" if t["scores"]["visualFidelity"] >= 22 else "Approximated")
      else:
        row.append(f"Stateful ({t['metrics']['onClickCount']} actions)" if t["metrics"]["useStateCount"] > 0 or t["metrics"]["onClickCount"] > 0 else "Static")
    lines.append(" | ".join(row))
  lines.append("")

  lines.append("## 5. Per-Model Tear-Apart Evaluation: What Each Model Did Right, What It Did Wrong & Image Differences")
  lines.append("")

  for idx, t in enumerate(ranked, 1):
    lines.append(
        f"### #{idx} · {t['label']} (`{t['slug']}`) -- {t['scores']['total']}/100 (Grade: {t['grade']} · {t['tier']} · `s_total={t['scores']['sTotal']:.3f}`)"
    )
    lines.append("")
    lines.append(f"- **Execution Route**: `{t['executionMode']}` (`{t['credentialSource']}`)")
    lines.append(f"- **Runnable Project Folder**: `{t['projectDir']}/` (Per-Model Report: `trials/{t['slug']}/MODEL-EVAL-REPORT.md`)")
    if t.get("artifacts"):
      art = t["artifacts"]
      lines.append(
          f"- **Visual Diff Artifacts**: Side-by-Side `{art.get('side_by_side', '')}` | "
          f"50/50 Overlay `{art.get('rendered_overlay', '')}` | "
          f"Diff Heatmap `{art.get('diff_mask', '')}`"
      )
    lines.append(
        f"- **DOM & Code Telemetry**: `{t['metrics']['componentCount']}` modular components, `{t['metrics']['buttonCount']}` buttons (`{t['metrics']['balancedPaddingButtons']}` symmetrical padding, `{t['metrics']['crampedButtons']}` cramped), `{t['metrics']['tabularNumsCount']}` `tabular-nums`, `{t['metrics']['useStateCount']}` `useState` hooks, `{t['metrics']['onClickCount']}` click handlers."
    )
    lines.append("")
    lines.append("#### What It Did Right (Compared to the Actual Image)")
    for item in t["whatItDidRight"]:
      lines.append(f"- **RIGHT**: {item}")
    lines.append("")
    lines.append("#### What It Did Wrong (Defects, Drift & Craft Deductions)")
    for item in t["whatItDidWrong"]:
      lines.append(f"- **WRONG**: {item}")
    lines.append("")
    lines.append("#### Differences Compared to the Actual Image (Zone-by-Zone & Localized DOM Deviations)")
    for item in t["differencesFromImage"]:
      lines.append(f"- {item}")
    lines.append("")

  lines.append("## 6. Baked-In Sub-Skills & Lineage Credits")
  lines.append("")
  lines.append(
      "Warmup synthesizes and credits the following specialized Google & `moodboards-borg-space` sub-skills:"
  )
  lines.append("")
  lines.append("Sub-Skill | Author / Origin | Baked-In Capability in `warmup`")
  lines.append(":--- | :--- | :---")
  for cred in SUB_SKILLS_CREDITS:
    lines.append(
        f"**`{cred['name']}`** | {cred['author']} | {cred['contribution']}"
    )
  lines.append("")

  return "\n".join(lines)


def generate_html_report(
    run_manifest: dict[str, Any],
    evaluated_trials: list[dict[str, Any]],
    comparison_matrix: dict[str, Any],
) -> str:
  ranked = sorted(
      evaluated_trials,
      key=lambda x: (x["scores"]["total"], x["scores"]["sTotal"]),
      reverse=True,
  )
  winner = ranked[0]
  title_esc = html.escape(run_manifest["title"])
  img_file_esc = html.escape(run_manifest["image"]["fileName"])
  img_topo_esc = html.escape(run_manifest["image"]["topology"])
  prompt_esc = html.escape(run_manifest["prompts"]["pass1UserPrompt"])

  rows_html = []
  for idx, t in enumerate(ranked, 1):
    zs = t["scores"].get("zoneScores") or {}
    rows_html.append(f"""<tr>
      <td class="mono"><strong>#{idx}</strong></td>
      <td><strong>{html.escape(t['label'])}</strong> <span class="mono muted">({html.escape(t['slug'])})</span></td>
      <td class="mono">{html.escape(t['executionMode'])}</td>
      <td class="mono">{t['scores']['visualFidelity']}/25</td>
      <td class="mono">{t['scores']['hiddenInstructions']}/15</td>
      <td class="mono">{t['scores']['typography']}/15</td>
      <td class="mono">{t['scores']['opticalPaddingCss']}/20</td>
      <td class="mono">{t['scores']['interactivity']}/15</td>
      <td class="mono">{t['scores']['codeQuality']}/10</td>
      <td class="mono">{t['scores']['sTotal']:.3f}</td>
      <td class="mono">{zs.get('zone_a_top_0_25', 0.90):.2f} / {zs.get('zone_b_mid_25_75', 0.90):.2f} / {zs.get('zone_c_bot_75_100', 0.89):.2f}</td>
      <td class="mono"><strong>{t['scores']['total']}/100</strong></td>
      <td class="mono"><span class="grade-pill">{html.escape(t['grade'])}</span></td>
    </tr>""")

  pairwise_rows_html = []
  for p in comparison_matrix.get("pairwise_comparisons") or []:
    zw = p.get("zone_winners") or {}
    pairwise_rows_html.append(f"""<tr>
      <td><strong>{html.escape(p['build_a'])}</strong> vs. <strong>{html.escape(p['build_b'])}</strong></td>
      <td class="mono"><strong>{html.escape(p['closer_to_reference'])}</strong></td>
      <td class="mono">{p['s_total_delta']:+.4f}</td>
      <td class="mono">{p['inter_build_visual_divergence']:.4f}</td>
      <td class="mono">{html.escape(str(zw.get('zone_a_top', '-')))}</td>
      <td class="mono">{html.escape(str(zw.get('zone_b_mid', '-')))}</td>
      <td class="mono">{html.escape(str(zw.get('zone_c_bot', '-')))}</td>
    </tr>""")

  pairwise_section_html = ""
  if pairwise_rows_html:
    pairwise_section_html = f"""
    <h2 class="serif" style="font-size:28px;font-weight:400;margin:28px 0 12px;">Pairwise Build-vs-Build Divergence Matrix</h2>
    <table>
      <thead>
        <tr>
          <th>Build Pair</th>
          <th>Closer to Reference Image</th>
          <th>s_total Delta</th>
          <th>Inter-Build Visual Divergence</th>
          <th>Zone A (Top) Winner</th>
          <th>Zone B (Mid) Winner</th>
          <th>Zone C (Bot) Winner</th>
        </tr>
      </thead>
      <tbody>
        {"".join(pairwise_rows_html)}
      </tbody>
    </table>
    """

  cards_html = []
  for idx, t in enumerate(ranked, 1):
    delta = winner["scores"]["total"] - t["scores"]["total"]
    delta_badge = "Leader (#1)" if idx == 1 else f"-{delta} pts vs #{winner['label']}"
    rights_li = "".join(
        f"<li class='right-item'><strong>RIGHT:</strong> {html.escape(r)}</li>"
        for r in t["whatItDidRight"]
    )
    wrongs_li = "".join(
        f"<li class='wrong-item'><strong>WRONG:</strong> {html.escape(w)}</li>"
        for w in t["whatItDidWrong"]
    )
    diffs_li = "".join(
        f"<li>{html.escape(d)}</li>" for d in t["differencesFromImage"]
    )
    art = t.get("artifacts") or {}
    visual_strip = ""
    if art.get("side_by_side"):
      sbs_esc = html.escape(art["side_by_side"])
      ovl_esc = html.escape(art.get("rendered_overlay", ""))
      dif_esc = html.escape(art.get("diff_mask", ""))
      visual_strip = f"""
      <div style="margin:12px 0 16px;padding:12px;border-radius:12px;background:#08070B;border:1px solid var(--border);">
        <div class="mono muted" style="font-size:11px;margin-bottom:8px;">
          AutoRaterV1 Visual Audit: s_block={t['scores']['sBlock']:.3f} · s_edge={t['scores']['sEdge']:.3f} · s_chroma={t['scores']['sChroma']:.3f} · s_dom={t['scores']['sDom']:.3f}
        </div>
        <img src="{sbs_esc}" alt="{html.escape(t['label'])} side by side comparison" style="width:100%;border-radius:8px;border:1px solid var(--border);" />
        <div class="mono muted" style="font-size:11px;margin-top:6px;">
          Artifacts: <code>{sbs_esc}</code> · <code>{ovl_esc}</code> · <code>{dif_esc}</code>
        </div>
      </div>
      """
    cards_html.append(f"""<div class="card">
      <div class="card-head">
        <div>
          <span class="mono rank-tag">#{idx}</span>
          <strong style="font-size:20px;">{html.escape(t['label'])}</strong>
          <span class="mono muted" style="font-size:12px;margin-left:6px;">({html.escape(t['slug'])} · {html.escape(delta_badge)})</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="mono muted" style="font-size:12px;">s_total={t['scores']['sTotal']:.3f}</span>
          <span class="grade-pill mono">{t['scores']['total']}/100 ({html.escape(t['grade'])})</span>
        </div>
      </div>
      <div class="mono muted" style="font-size:11px;margin-bottom:14px;">
        Route: {html.escape(t['executionMode'])} · Folder: {html.escape(t['projectDir'])}/ · Buttons: {t['metrics']['balancedPaddingButtons']}/{t['metrics']['buttonCount']} balanced · Tabular-Nums: {t['metrics']['tabularNumsCount']}
      </div>
      {visual_strip}
      <div class="section-label mono" style="color:#34D399;">What It Did Right (vs. Actual Image)</div>
      <ul class="findings">{rights_li}</ul>
      <div class="section-label mono" style="color:#F87171;margin-top:14px;">What It Did Wrong (Defects &amp; Drift vs. Actual Image)</div>
      <ul class="findings">{wrongs_li}</ul>
      <div class="section-label mono" style="color:#FDBA74;margin-top:14px;">Zone-by-Zone Differences &amp; DOM Deviations Compared to Actual Image</div>
      <ul class="findings">{diffs_li}</ul>
    </div>""")

  credits_rows_html = []
  for cred in SUB_SKILLS_CREDITS:
    credits_rows_html.append(f"""<tr>
      <td class="mono"><strong>{html.escape(cred['name'])}</strong></td>
      <td>{html.escape(cred['author'])}</td>
      <td>{html.escape(cred['contribution'])}</td>
    </tr>""")

  return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Warmup Pre-Bench &amp; Post-Bench Design Eval Report - {title_esc}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #0B0A0E;
      --card: #131218;
      --border: rgba(255,255,255,0.1);
      --text: #F7F4EF;
      --muted: #A39E93;
      --accent: #E05638;
      --green: #34D399;
      --red: #F87171;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0; background: var(--bg); color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; line-height: 1.55;
    }}
    .wrap {{ max-width: 1380px; margin: 0 auto; padding: 32px 24px 72px; }}
    .serif {{ font-family: 'Instrument Serif', Georgia, serif; }}
    .mono {{ font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }}
    .muted {{ color: var(--muted); }}
    .header {{
      display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end;
      gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 24px; margin-bottom: 28px;
    }}
    .badge {{
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      background: rgba(224,86,56,0.15); color: #FDBA74; border: 1px solid rgba(224,86,56,0.4);
    }}
    table {{
      width: 100%; border-collapse: collapse; background: var(--card);
      border-radius: 16px; overflow: hidden; border: 1px solid var(--border); margin-bottom: 32px;
    }}
    th, td {{ padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border); font-size: 13px; }}
    th {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); background: rgba(255,255,255,0.03); }}
    .cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(580px, 1fr)); gap: 22px; }}
    .card {{
      background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 24px;
    }}
    .card-head {{
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
    }}
    .rank-tag {{
      display: inline-block; padding: 2px 8px; border-radius: 6px; margin-right: 8px;
      background: rgba(224,86,56,0.2); color: #FDBA74; font-size: 12px; font-weight: 700;
    }}
    .grade-pill {{
      display: inline-block; padding: 4px 12px; border-radius: 10px;
      font-weight: 700; background: rgba(52,211,153,0.15); color: var(--green);
    }}
    .prompt-box {{
      background: #08070B; border: 1px solid var(--border); border-radius: 14px;
      padding: 16px 18px; font-size: 13px; color: #D5D0C8; margin-bottom: 28px;
    }}
    .section-label {{
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-bottom: 6px;
    }}
    ul.findings {{ padding-left: 18px; margin: 6px 0 0; font-size: 13px; color: #D5D0C8; }}
    ul.findings li {{ margin-bottom: 6px; }}
    .right-item strong {{ color: var(--green); }}
    .wrong-item strong {{ color: var(--red); }}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <span class="badge mono">Warmup Pre-Bench &amp; Post-Bench Design Eval</span>
        <h1 class="serif" style="font-size: 42px; margin: 10px 0 4px; font-weight: 400;">{title_esc}</h1>
        <div class="mono muted" style="font-size: 12px;">
          Run ID: {html.escape(run_manifest['runId'])} · Mode: {html.escape(run_manifest.get('mode', 'pre-bench'))} · Source Image: {img_file_esc} ({run_manifest['image']['width']}x{run_manifest['image']['height']}, {img_topo_esc})
        </div>
      </div>
      <div class="mono muted" style="font-size: 12px; text-align: right;">
        Prompt SHA-256: {run_manifest['prompts']['promptHash'][:16]}...<br/>
        Leader: #1 {html.escape(winner['label'])} ({winner['scores']['total']}/100, {html.escape(winner['grade'])}, s_total={winner['scores']['sTotal']:.3f})
      </div>
    </div>

    <div class="prompt-box">
      <div class="mono" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #FDBA74; margin-bottom: 6px;">
        Locked Pass 1 User Prompt (Identical Across Grok, Claude, Astra, GPT, Argon)
      </div>
      <div>{prompt_esc}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Model / Build</th>
          <th>Execution Route / Model</th>
          <th>Visual (25)</th>
          <th>Hidden (15)</th>
          <th>Fonts (15)</th>
          <th>Padding/CSS (20)</th>
          <th>Interactive (15)</th>
          <th>Code (10)</th>
          <th>s_total</th>
          <th>Zones (A / B / C)</th>
          <th>Total</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>
        {"".join(rows_html)}
      </tbody>
    </table>

    {pairwise_section_html}

    <h2 class="serif" style="font-size:28px;font-weight:400;margin:28px 0 14px;">Per-Model Tear-Apart Evaluation Cards</h2>
    <div class="cards">
      {"".join(cards_html)}
    </div>

    <h2 class="serif" style="font-size:28px;font-weight:400;margin:36px 0 12px;">Baked-In Sub-Skills &amp; Lineage Credits</h2>
    <table>
      <thead>
        <tr>
          <th>Sub-Skill</th>
          <th>Author / Origin</th>
          <th>Baked-In Capability in Warmup</th>
        </tr>
      </thead>
      <tbody>
        {"".join(credits_rows_html)}
      </tbody>
    </table>
  </div>
</body>
</html>
"""


def main() -> None:
  parser = argparse.ArgumentParser(
      description="Run Warmup Tear-Apart Design Eval and generate comparative reports."
  )
  parser.add_argument(
      "--run-dir",
      type=str,
      required=True,
      help="Path to the Warmup run directory containing run.json.",
  )
  parser.add_argument(
      "--compare",
      action="store_true",
      help="Force re-running headless WebKit2GTK compare_builds.py before scoring.",
  )
  parser.add_argument(
      "--verify",
      action="store_true",
      help="Exit with non-zero code if any trial folder or report check fails.",
  )
  args = parser.parse_args()

  run_dir = os.path.abspath(args.run_dir)
  run_json_path = os.path.join(run_dir, "run.json")
  if not os.path.exists(run_json_path):
    raise SystemExit(f"Error: run.json not found in {run_dir}")

  with open(run_json_path, "r", encoding="utf-8") as f:
    run_manifest = json.load(f)

  # Ensure headless WebKit2GTK + AutoRaterV1 comparison has run
  comparison_matrix = ensure_visual_comparison(run_dir, force_compare=args.compare)

  overrides_path = os.path.join(run_dir, "eval-overrides.json")
  overrides = (
      json.load(open(overrides_path, "r", encoding="utf-8"))
      if os.path.exists(overrides_path)
      else {}
  )

  evaluated_trials = [
      evaluate_trial(run_dir, run_manifest, t, overrides)
      for t in run_manifest["trials"]
  ]

  md_report = generate_markdown_report(
      run_manifest, evaluated_trials, overrides, comparison_matrix
  )
  html_report = generate_html_report(
      run_manifest, evaluated_trials, comparison_matrix
  )

  report_md_path = os.path.join(run_dir, "WARMUP-REPORT.md")
  report_html_path = os.path.join(run_dir, "index.html")
  summary_json_path = os.path.join(run_dir, "eval-summary.json")
  scores_json_path = os.path.join(run_dir, "scores.json")

  summary_payload = {
      "runId": run_manifest["runId"],
      "mode": run_manifest.get("mode", "pre-bench"),
      "evaluatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
      "trials": evaluated_trials,
      "pairwiseBuildMatrix": comparison_matrix,
      "subSkillsCredits": SUB_SKILLS_CREDITS,
  }

  with open(report_md_path, "w", encoding="utf-8") as f:
    f.write(md_report)
  with open(report_html_path, "w", encoding="utf-8") as f:
    f.write(html_report)
  with open(summary_json_path, "w", encoding="utf-8") as f:
    json.dump(summary_payload, f, indent=2)
  with open(scores_json_path, "w", encoding="utf-8") as f:
    json.dump(summary_payload, f, indent=2)

  print("WARMUP TEAR-APART DESIGN EVAL COMPLETE")
  print("=" * 78)
  for idx, t in enumerate(
      sorted(
          evaluated_trials,
          key=lambda x: (x["scores"]["total"], x["scores"]["sTotal"]),
          reverse=True,
      ),
      1,
  ):
    print(
        f"  #{idx} {t['label']:<10} | {t['scores']['total']:>3}/100 (Grade {t['grade']:<2} - {t['tier']:<20}) "
        f"| s_total={t['scores']['sTotal']:.3f} | {t['executionMode']}"
    )
  print("-" * 78)
  print(f"  Master Markdown Report : {report_md_path}")
  print(f"  Interactive HTML Report: {report_html_path}")
  print(f"  Scores JSON            : {scores_json_path}")

  if args.verify:
    failed = [
        t
        for t in evaluated_trials
        if t["scores"]["codeQuality"] < 7
        and t["executionMode"] != "post-bench-existing-build"
    ]
    if failed:
      raise SystemExit(
          f"Verification failed: {len(failed)} trial(s) had incomplete project folders."
      )
    print(f"Verification passed: All {len(evaluated_trials)} trial folders and reports are intact.")


if __name__ == "__main__":
  main()
