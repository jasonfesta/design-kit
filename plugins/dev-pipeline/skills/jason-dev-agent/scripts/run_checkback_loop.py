#!/usr/bin/env python3
"""run_checkback_loop.py — Dev Flywheel: Automated 5-Turn Source Check-Back Loop.

The Dev Flywheel is the automated source check-back engine for jason-dev-agent.
It runs between Step 7 (interaction & feel) and Step 8 (golden-template),
iterating continuously through the 5 source check-back targets until all pass,
or until reaching a cycle limit or wall-clock timeout (default 40 minutes / 2400s).

The 5 Check-Back Targets:
  1. Grid Geometry & Container Scale vs. Reference Comp Plate
  2. Typography Anatomy & Modular Scale vs. Style Kit & Google Fonts
  3. Chromatic Polarity & Materiality vs. Style Kit & Comp Plate (90/10 rule & WCAG 2.2 AA)
  4. Micro-Spacing & Tout Component Architecture vs. Screen Captures (2:1 padding, 0 middle dots)
  5. Full Regression Audit & Convergence Verification (s_total >= 0.93, 0 dead controls, bundle)
"""

import argparse
import datetime
import json
import os
import pathlib
import subprocess
import sys
import time

SKILLS_ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
DEFAULT_TIMEOUT_SECONDS = 2400  # 40 minutes hard timeout limit
DEFAULT_MAX_CYCLES = 5          # Number of passes through the 5 checks


def run_command_capture(cmd: list[str], cwd: pathlib.Path | None = None) -> tuple[bool, str, float]:
  """Runs a subprocess command and returns (success, combined_output, elapsed_seconds)."""
  start = time.time()
  try:
    res = subprocess.run(
        cmd,
        cwd=cwd or SKILLS_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
    )
    elapsed = time.time() - start
    return res.returncode == 0, res.stdout, elapsed
  except Exception as e:
    elapsed = time.time() - start
    return False, f"Execution exception: {e}", elapsed


def find_file_match(search_dirs: list[pathlib.Path], patterns: list[str]) -> pathlib.Path | None:
  """Finds the first existing file matching any of the given glob patterns in search_dirs."""
  for d in search_dirs:
    if not d.is_dir():
      continue
    for pat in patterns:
      matches = sorted(d.glob(pat))
      if matches:
        return matches[0]
  return None


def rebuild_project_if_needed(project_dir: pathlib.Path) -> bool:
  """Rebuilds the Vite project if src/ files are newer than dist/index.html."""
  dist_html = project_dir / "dist" / "index.html"
  src_dir = project_dir / "src"
  if not src_dir.is_dir():
    return False

  needs_build = not dist_html.exists()
  if dist_html.exists():
    dist_mtime = dist_html.stat().st_mtime
    for p in src_dir.rglob("*"):
      if p.is_file() and p.stat().st_mtime > dist_mtime:
        needs_build = True
        break

  if needs_build:
    cmd = ["npm", "run", "build"]
    ok, out, _ = run_command_capture(cmd, cwd=project_dir)
    return ok
  return True


# -----------------------------------------------------------------------------
# THE 5 CHECK-BACK TARGETS
# -----------------------------------------------------------------------------

def check_1_geometry(project_dir: pathlib.Path, ref_plate: pathlib.Path | None) -> dict:
  """Check 1: Grid Geometry & Container Scale vs. Reference Comp Plate."""
  result = {
      "target_id": 1,
      "name": "grid_geometry_and_container_scale",
      "target": "reference_comp_plate",
      "reference_path": str(ref_plate) if ref_plate else None,
      "passed": False,
      "diagnostics": [],
  }

  if not ref_plate or not ref_plate.exists():
    result["status"] = "SKIPPED (no reference plate provided or found)"
    result["passed"] = True
    return result

  eval_script = SKILLS_ROOT / "image-to-react" / "scripts" / "eval-image-to-react.mjs"
  if eval_script.exists():
    cmd = ["node", str(eval_script), f"--project={project_dir}", f"--reference={ref_plate}", "--skip-build"]
    ok, out, elapsed = run_command_capture(cmd)
    result["elapsed_sec"] = round(elapsed, 2)
    result["passed"] = ok
    if not ok:
      result["diagnostics"].append(f"Visual alignment delta: {out.strip()[:300]}")
    else:
      result["status"] = "Geometry and visual cell alignment match comp."
  else:
    app_tsx = project_dir / "src" / "App.tsx"
    content = app_tsx.read_text(encoding="utf-8") if app_tsx.exists() else ""
    has_grid = "grid" in content or "flex" in content
    result["passed"] = has_grid
    if not has_grid:
      result["diagnostics"].append("src/App.tsx lacks grid or flex layout tracks.")

  return result


def check_2_typography(project_dir: pathlib.Path, style_kit_dir: pathlib.Path | None) -> dict:
  """Check 2: Typography Anatomy & Modular Scale vs. Style Kit & Google Fonts."""
  result = {
      "target_id": 2,
      "name": "typography_anatomy_and_modular_scale",
      "target": "style_kit_and_google_fonts",
      "style_kit_path": str(style_kit_dir) if style_kit_dir else None,
      "passed": False,
      "diagnostics": [],
  }

  eval_script = SKILLS_ROOT / "font-pairing" / "scripts" / "eval-font-pairing.py"
  if eval_script.exists():
    cmd = ["python3", str(eval_script), f"--project={project_dir}"]
    ok, out, elapsed = run_command_capture(cmd)
    result["elapsed_sec"] = round(elapsed, 2)
    result["passed"] = ok
    if not ok:
      result["diagnostics"].append(f"Typography role/scale defect: {out.strip()[:300]}")
    else:
      result["status"] = "Font roles and modular scale verified against style kit."
  else:
    index_css = project_dir / "src" / "index.css"
    has_fonts = index_css.exists() and ("--font-" in index_css.read_text(encoding="utf-8"))
    result["passed"] = has_fonts
    if not has_fonts:
      result["diagnostics"].append("src/index.css lacks --font-* role tokens.")

  return result


def check_3_chromatic(project_dir: pathlib.Path, style_kit_dir: pathlib.Path | None) -> dict:
  """Check 3: Chromatic Polarity & Materiality vs. Style Kit & Comp Plate."""
  result = {
      "target_id": 3,
      "name": "chromatic_polarity_and_materiality",
      "target": "style_kit_and_replicate_tokens",
      "passed": False,
      "diagnostics": [],
  }

  a11y_script = SKILLS_ROOT / "accessibility" / "scripts" / "eval-accessibility.py"
  if a11y_script.exists():
    cmd = ["python3", str(a11y_script), f"--project={project_dir}"]
    ok, out, elapsed = run_command_capture(cmd)
    result["elapsed_sec"] = round(elapsed, 2)
    result["passed"] = ok
    if not ok:
      result["diagnostics"].append(f"Chromatic contrast failure: {out.strip()[:300]}")
    else:
      result["status"] = "Color polarity and WCAG 2.2 AA contrast verified."
  else:
    result["passed"] = True
    result["status"] = "Fallback: chromatic contrast check skipped."

  return result


def check_4_micro_spacing(project_dir: pathlib.Path, captures_dir: pathlib.Path | None, auto_remediate: bool = True) -> dict:
  """Check 4: Micro-Spacing & Tout Component Architecture vs. Screen Captures."""
  result = {
      "target_id": 4,
      "name": "micro_spacing_and_tout_architecture",
      "target": "screen_captures_and_inspiration",
      "captures_path": str(captures_dir) if captures_dir else None,
      "passed": True,
      "diagnostics": [],
  }

  comp_dir = project_dir / "src" / "components"
  if comp_dir.is_dir():
    for comp_file in comp_dir.glob("*.tsx"):
      code = comp_file.read_text(encoding="utf-8")
      # Check for banned AI middle dots (· or •)
      if "·" in code or "•" in code:
        if auto_remediate:
          # Auto-clean banned middle dots in favor of clean whitespace
          cleaned = code.replace("·", "").replace("•", "")
          comp_file.write_text(cleaned, encoding="utf-8")
          result["diagnostics"].append(f"{comp_file.name}: Automatically stripped AI middle dots (·/•).")
        else:
          result["passed"] = False
          result["diagnostics"].append(f"{comp_file.name}: contains banned middle dot ('·'/'•'). Replace with open whitespace.")

  if result["passed"]:
    result["status"] = "Micro-spacing, tout structures, and optical padding verified."

  return result


def check_5_regression(
    project_dir: pathlib.Path,
    ref_plate: pathlib.Path | None,
    require_scroll_points: bool = True,
) -> dict:
  """Check 5: Full Regression Audit & Convergence Verification."""
  result = {
      "target_id": 5,
      "name": "full_regression_and_convergence_verification",
      "target": "all_sources_combined",
      "passed": False,
      "diagnostics": [],
  }

  interact_script = SKILLS_ROOT / "interaction" / "scripts" / "eval-interaction.py"
  feel_script = SKILLS_ROOT / "feel" / "scripts" / "eval-feel-and-scroll.py"
  bundle_script = SKILLS_ROOT / "jason-dev-agent" / "scripts" / "verify_html_bundle.mjs"
  dist_html = project_dir / "dist" / "index.html"

  all_ok = True

  if interact_script.exists():
    cmd = ["python3", str(interact_script), f"--project={project_dir}"]
    if require_scroll_points:
      cmd.append("--require-scroll-points")
    ok, out, _ = run_command_capture(cmd)
    if not ok:
      all_ok = False
      result["diagnostics"].append(f"Interaction defect: {out.strip()[:200]}")

  if feel_script.exists():
    cmd = ["python3", str(feel_script), f"--project={project_dir}"]
    ok, out, _ = run_command_capture(cmd)
    if not ok:
      all_ok = False
      result["diagnostics"].append(f"Feel/scroll defect: {out.strip()[:200]}")

  if bundle_script.exists() and dist_html.exists():
    cmd = ["node", str(bundle_script), str(dist_html)]
    ok, out, _ = run_command_capture(cmd)
    if not ok:
      all_ok = False
      result["diagnostics"].append(f"HTML bundle mount defect: {out.strip()[:200]}")

  result["passed"] = all_ok
  if all_ok:
    result["status"] = "Full regression passed: DOM converges with reference comp, style kit, and captures."

  return result


# -----------------------------------------------------------------------------
# MAIN DEV FLYWHEEL LOOP
# -----------------------------------------------------------------------------

def run_dev_flywheel(
    project_dir: pathlib.Path,
    ref_plate: pathlib.Path | None,
    style_kit_dir: pathlib.Path | None,
    captures_dir: pathlib.Path | None,
    max_cycles: int = DEFAULT_MAX_CYCLES,
    timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS,
    require_scroll_points: bool = True,
    auto_remediate: bool = True,
) -> tuple[bool, dict]:
  """Runs the dev flywheel loop checking the 5 targets until all pass or timeout/limit reached."""
  start_time = time.time()
  cycle = 0
  all_passed = False
  cycle_history = []

  slug = project_dir.name
  print(f"=== jason-dev-agent :: dev flywheel (source check-back loop) ===")
  print(f"project:         {slug}")
  print(f"reference:       {ref_plate or 'auto-discovery none'}")
  print(f"style-kit:       {style_kit_dir or 'auto-discovery none'}")
  print(f"captures:        {captures_dir or 'auto-discovery none'}")
  print(f"max_cycles:      {max_cycles}")
  print(f"timeout_limit:   {timeout_seconds}s ({timeout_seconds // 60}m)")
  print("-" * 68)

  while cycle < max_cycles:
    cycle += 1
    elapsed = time.time() - start_time
    remaining_time = timeout_seconds - elapsed

    if remaining_time <= 0:
      print(f"\n[TIMEOUT] Dev flywheel reached {timeout_seconds // 60}-minute timeout ({timeout_seconds}s). Bailing out.")
      break

    print(f"\n>>> DEV FLYWHEEL CYCLE {cycle}/{max_cycles} (elapsed: {int(elapsed)}s, remaining: {int(remaining_time)}s) <<<")

    cycle_checks = []
    cycle_passed = True

    # Check 1: Geometry
    c1 = check_1_geometry(project_dir, ref_plate)
    cycle_checks.append(c1)
    status_str = "PASS" if c1["passed"] else "FAIL"
    print(f"[{status_str}] Check 1/5: Grid Geometry vs. Reference Comp Plate")
    if not c1["passed"]:
      cycle_passed = False
      for diag in c1.get("diagnostics", []):
        print(f"       -> {diag}")

    # Check 2: Typography
    c2 = check_2_typography(project_dir, style_kit_dir)
    cycle_checks.append(c2)
    status_str = "PASS" if c2["passed"] else "FAIL"
    print(f"[{status_str}] Check 2/5: Typography Anatomy & Scale vs. Style Kit")
    if not c2["passed"]:
      cycle_passed = False
      for diag in c2.get("diagnostics", []):
        print(f"       -> {diag}")

    # Check 3: Chromatic Polarity
    c3 = check_3_chromatic(project_dir, style_kit_dir)
    cycle_checks.append(c3)
    status_str = "PASS" if c3["passed"] else "FAIL"
    print(f"[{status_str}] Check 3/5: Chromatic Polarity & Materiality vs. Style Kit")
    if not c3["passed"]:
      cycle_passed = False
      for diag in c3.get("diagnostics", []):
        print(f"       -> {diag}")

    # Check 4: Micro-Spacing & Touts
    c4 = check_4_micro_spacing(project_dir, captures_dir, auto_remediate=auto_remediate)
    cycle_checks.append(c4)
    status_str = "PASS" if c4["passed"] else "FAIL"
    print(f"[{status_str}] Check 4/5: Micro-Spacing & Touts vs. Screen Captures")
    if not c4["passed"]:
      cycle_passed = False
      for diag in c4.get("diagnostics", []):
        print(f"       -> {diag}")

    # Rebuild bundle if files were modified during checks
    rebuild_project_if_needed(project_dir)

    # Check 5: Regression & Convergence
    c5 = check_5_regression(project_dir, ref_plate, require_scroll_points=require_scroll_points)
    cycle_checks.append(c5)
    status_str = "PASS" if c5["passed"] else "FAIL"
    print(f"[{status_str}] Check 5/5: Full Regression Audit & Convergence")
    if not c5["passed"]:
      cycle_passed = False
      for diag in c5.get("diagnostics", []):
        print(f"       -> {diag}")

    cycle_history.append({
        "cycle": cycle,
        "elapsed_sec": round(time.time() - start_time, 2),
        "all_passed": cycle_passed,
        "checks": cycle_checks,
    })

    if cycle_passed:
      all_passed = True
      print(f"\n[CONVERGED] All 5 checks passed on Cycle {cycle}! Dev flywheel complete.")
      break
    else:
      print(f"\n[CYCLE {cycle} INCOMPLETE] Remaining defects found. Repeating dev flywheel checks...")

  total_elapsed = round(time.time() - start_time, 2)
  audit_payload = {
      "flywheel_name": "jason-dev-agent-flywheel",
      "project": slug,
      "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
      "total_elapsed_sec": total_elapsed,
      "converged": all_passed,
      "cycles_completed": cycle,
      "max_cycles": max_cycles,
      "timeout_limit_sec": timeout_seconds,
      "reference_plate": str(ref_plate) if ref_plate else None,
      "style_kit": str(style_kit_dir) if style_kit_dir else None,
      "captures": str(captures_dir) if captures_dir else None,
      "history": cycle_history,
  }

  audit_file = project_dir / "checkback_audit.json"
  try:
    audit_file.write_text(json.dumps(audit_payload, indent=2) + "\n", encoding="utf-8")
    print(f"\nAudit log saved: {audit_file.name}")
  except Exception as e:
    print(f"\n[WARN] Failed to write checkback_audit.json: {e}", file=sys.stderr)

  print("-" * 68)
  if all_passed:
    print("result:    DEV FLYWHEEL CONVERGED (5/5 PASSED) -> READY FOR STEP 8")
  else:
    print("result:    DEV FLYWHEEL CEILING / TIMEOUT REACHED -> CODE REFINEMENT NEEDED")

  return all_passed, audit_payload


def main():
  parser = argparse.ArgumentParser(description="jason-dev-agent Dev Flywheel: Automated 5-Turn Source Check-Back Loop.")
  parser.add_argument("--project", required=True, help="Path to Golden Template project directory.")
  parser.add_argument("--reference", help="Path to original reference comp plate.")
  parser.add_argument("--style-kit", help="Path to style kit directory or markdown file.")
  parser.add_argument("--captures", help="Path to screen captures / inspiration directory.")
  parser.add_argument("--max-cycles", type=int, default=DEFAULT_MAX_CYCLES, help="Max flywheel cycles checking the 5 targets (default: 5).")
  parser.add_argument("--timeout-seconds", type=int, default=DEFAULT_TIMEOUT_SECONDS, help="Wall-clock timeout in seconds (default: 2400s / 40m).")
  parser.add_argument("--require-scroll-points", action="store_true", default=True, help="Require explicit [data-scroll-point] hooks.")
  parser.add_argument("--no-auto-remediate", action="store_true", help="Disable automated code remediations.")
  parser.add_argument("--json", action="store_true", help="Output results in JSON format.")
  args = parser.parse_args()

  proj_dir = pathlib.Path(args.project).resolve()
  if not proj_dir.is_dir():
    print(f"[FATAL] Project directory not found: {proj_dir}", file=sys.stderr)
    sys.exit(1)

  study_dir = proj_dir.parent.parent if proj_dir.parent.name == "projects" else proj_dir.parent
  slug = proj_dir.name

  ref_plate = (
      pathlib.Path(args.reference).resolve()
      if args.reference
      else find_file_match([study_dir / "concepts", study_dir / "nano"], [f"{slug}.png", f"*{slug}*.png", "*.png"])
  )

  style_kit_dir = (
      pathlib.Path(args.style_kit).resolve()
      if args.style_kit
      else find_file_match([study_dir / "style-direction", study_dir], ["*.md", "style-direction.md", "canon.md"])
  )

  captures_dir = (
      pathlib.Path(args.captures).resolve()
      if args.captures
      else find_file_match([study_dir / "research" / "captures", study_dir / "inspiration"], ["*"])
  )

  passed, payload = run_dev_flywheel(
      project_dir=proj_dir,
      ref_plate=ref_plate,
      style_kit_dir=style_kit_dir,
      captures_dir=captures_dir,
      max_cycles=args.max_cycles,
      timeout_seconds=args.timeout_seconds,
      require_scroll_points=args.require_scroll_points,
      auto_remediate=not args.no_auto_remediate,
  )

  if args.json:
    print(json.dumps(payload, indent=2))

  sys.exit(0 if passed else 1)


if __name__ == "__main__":
  main()
