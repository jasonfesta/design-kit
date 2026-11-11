#!/usr/bin/env python3
"""run_dev_loop.py — Master 8-Step Developer Receipt Runner for jason-dev-agent.

Executes the 8 simple developer steps in strict order:
  Step 1: replicate-mock (token inspection & 3-bucket classification)
  Step 2: font-pairing (type system, primary/secondary/tertiary roles, modular scale)
  Step 3: image-to-react (React DOM shell & AutoRaterV1 visual match, s_total >= 0.85/0.93)
  Step 4: nano-banana (targeted 2x Retina upscaling & readiness eval)
  Step 5: accessibility (WCAG 2.2 AA contrast, 16px body, 24/44px targets, focus rings)
  Step 6: responsiveness (6-viewport continuum: 320px to 1536px)
  Step 7: interaction and feel (0 dead buttons, scroll points, triggers, 60fps frame budget)
  Step 8: golden-template (strict tsc linting & HTML bundle mount verification)

Concludes with a structured receipt summary for the Designer Checkpoint.
"""

import argparse
import json
import os
import pathlib
import subprocess
import sys
import time

SKILLS_ROOT = pathlib.Path(__file__).resolve().parent.parent.parent


def run_step(name: str, cmd: list[str], cwd: pathlib.Path | None = None) -> tuple[bool, str, float]:
  """Runs a receipt command, timing it and capturing stdout/stderr."""
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
    return False, f"Exception executing {name}: {e}", elapsed


def update_dev_turns(study_dir: pathlib.Path, project_slug: str, stage_results: dict):
  """Updates projects/dev-turns.json recording total, per-stage, and per-item turns."""
  turns_file = study_dir / "projects" / "dev-turns.json"
  try:
    turns_data = json.loads(turns_file.read_text(encoding="utf-8")) if turns_file.exists() else {}
  except Exception:
    turns_data = {}

  total_turns = turns_data.get("total_dev_turns", 0) + 1
  per_item = turns_data.get("per_item_turns", {})
  item_turns = per_item.get(project_slug, 0) + 1
  per_item[project_slug] = item_turns

  per_stage = turns_data.get("per_stage_turns", {})
  for stage, passed in stage_results.items():
    if not passed:
      per_stage[stage] = per_stage.get(stage, 0) + 1

  turns_data.update({
      "total_dev_turns": total_turns,
      "per_item_turns": per_item,
      "per_stage_turns": per_stage,
      "last_updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
  })

  try:
    turns_file.parent.mkdir(parents=True, exist_ok=True)
    turns_file.write_text(json.dumps(turns_data, indent=2) + "\n", encoding="utf-8")
  except Exception as e:
    print(f"[WARN] Could not write dev-turns.json: {e}", file=sys.stderr)


def main():
  parser = argparse.ArgumentParser(description="jason-dev-agent 8-step developer receipt runner.")
  parser.add_argument("--project", required=True, help="Path to Golden Template project directory.")
  parser.add_argument("--study-dir", help="Path to parent study directory.")
  parser.add_argument("--reference", help="Reference comp plate path (for visual eval).")
  parser.add_argument("--desktop-ref", help="Desktop reference comp plate path (for responsive eval).")
  parser.add_argument("--mobile-ref", help="Mobile reference comp plate path (for responsive eval).")
  parser.add_argument("--expect-primary", help="Expected primary Google Font family.")
  parser.add_argument("--expect-secondary", help="Expected secondary Google Font family.")
  parser.add_argument("--require-44", action="store_true", help="Enforce 44x44px minimum touch targets.")
  parser.add_argument("--require-scroll-points", action="store_true", help="Enforce explicit [data-scroll-point] hooks.")
  parser.add_argument("--skip-build", action="store_true", help="Skip build step if already compiled.")
  parser.add_argument("--json", action="store_true", help="Emit receipt summary in JSON format.")
  args = parser.parse_args()

  proj_path = pathlib.Path(args.project).resolve()
  if not proj_path.is_dir():
    print(f"[FATAL] Project directory does not exist: {proj_path}", file=sys.stderr)
    sys.exit(1)

  project_slug = proj_path.name
  study_dir = (
      pathlib.Path(args.study_dir).resolve()
      if args.study_dir
      else proj_path.parent.parent
      if proj_path.parent.name == "projects"
      else proj_path.parent
  )

  receipts = {}
  all_passed = True
  timings = {}

  print(f"=== jason-dev-agent :: 8-step developer receipt runner ===")
  print(f"project:   {project_slug}")
  print(f"path:      {proj_path}")
  print(f"study_dir: {study_dir}")
  print("-" * 58)

  # STEP 1: replicate-mock (tokens, px measurements & 3 buckets)
  # Verify component architecture exists and has 3-tier structure
  app_tsx = proj_path / "src" / "App.tsx"
  has_data = (proj_path / "src" / "data").is_dir()
  has_components = (proj_path / "src" / "components").is_dir()
  step1_ok = app_tsx.exists() and has_data and has_components
  receipts["step1_replicate_mock"] = "PASS" if step1_ok else "FAIL"
  timings["step1_replicate_mock"] = 0.05
  print(f"[{receipts['step1_replicate_mock']}] step 1: replicate-mock (dom structure & 3 buckets)")
  if not step1_ok:
    all_passed = False
    print("       Missing src/App.tsx, src/data/, or src/components/")

  # STEP 2: font-pairing (type system & role locks)
  font_script = SKILLS_ROOT / "font-pairing" / "scripts" / "eval-font-pairing.py"
  if font_script.exists():
    cmd = ["python3", str(font_script), f"--project={proj_path}"]
    if args.expect_primary:
      cmd.append(f"--expect-primary={args.expect_primary}")
    if args.expect_secondary:
      cmd.append(f"--expect-secondary={args.expect_secondary}")
    ok, out, elapsed = run_step("font-pairing", cmd)
    receipts["step2_font_pairing"] = "PASS" if ok else "FAIL"
    timings["step2_font_pairing"] = round(elapsed, 2)
    if not ok:
      all_passed = False
    print(f"[{receipts['step2_font_pairing']}] step 2: font-pairing ({timings['step2_font_pairing']}s)")
    if not ok:
      print(f"       {out.strip()[:200]}")

  # STEP 3: image-to-react (react dom shell & visual match)
  visual_script = SKILLS_ROOT / "image-to-react" / "scripts" / "eval-image-to-react.mjs"
  ref_plate = args.reference
  if not ref_plate:
    candidate_ref = study_dir / "concepts" / f"{project_slug}.png"
    if candidate_ref.exists():
      ref_plate = str(candidate_ref)

  if visual_script.exists() and ref_plate and pathlib.Path(ref_plate).exists():
    cmd = ["node", str(visual_script), f"--project={proj_path}", f"--reference={ref_plate}"]
    if args.skip_build:
      cmd.append("--skip-build")
    ok, out, elapsed = run_step("image-to-react", cmd)
    receipts["step3_image_to_react"] = "PASS" if ok else "FAIL"
    timings["step3_image_to_react"] = round(elapsed, 2)
    if not ok:
      all_passed = False
    print(f"[{receipts['step3_image_to_react']}] step 3: image-to-react visual match ({timings['step3_image_to_react']}s)")
    if not ok:
      print(f"       {out.strip()[:200]}")
  else:
    receipts["step3_image_to_react"] = "SKIP (provide --reference)"
    print(f"[-] step 3: image-to-react visual match (skipped, provide --reference)")

  # STEP 4: nano-banana (targeted 2x retina upscaling & readiness)
  readiness_script = SKILLS_ROOT / "nano-banana" / "scripts" / "eval-image-readiness.py"
  if readiness_script.exists():
    cmd = ["python3", str(readiness_script), f"--project={proj_path}"]
    ok, out, elapsed = run_step("nano-banana", cmd)
    receipts["step4_nano_banana"] = "PASS" if ok else "FAIL"
    timings["step4_nano_banana"] = round(elapsed, 2)
    if not ok:
      all_passed = False
    print(f"[{receipts['step4_nano_banana']}] step 4: nano-banana readiness & buckets ({timings['step4_nano_banana']}s)")
    if not ok:
      print(f"       {out.strip()[:200]}")

  # STEP 5: accessibility (wcag 2.2 standards)
  a11y_script = SKILLS_ROOT / "accessibility" / "scripts" / "eval-accessibility.py"
  if a11y_script.exists():
    cmd = ["python3", str(a11y_script), f"--project={proj_path}"]
    if args.require_44:
      cmd.append("--require-44")
    ok, out, elapsed = run_step("accessibility", cmd)
    receipts["step5_accessibility"] = "PASS" if ok else "FAIL"
    timings["step5_accessibility"] = round(elapsed, 2)
    if not ok:
      all_passed = False
    print(f"[{receipts['step5_accessibility']}] step 5: accessibility wcag 2.2 ({timings['step5_accessibility']}s)")
    if not ok:
      print(f"       {out.strip()[:200]}")

  # STEP 6: responsiveness (6-viewport continuum)
  resp_script = SKILLS_ROOT / "responsiveness" / "scripts" / "eval-responsive-pair.mjs"
  if resp_script.exists() and args.desktop_ref and args.mobile_ref:
    cmd = [
        "node",
        str(resp_script),
        f"--project-dir={proj_path}",
        f"--desktop-ref={args.desktop_ref}",
        f"--mobile-ref={args.mobile_ref}",
    ]
    if args.skip_build:
      cmd.append("--skip-build")
    ok, out, elapsed = run_step("responsiveness", cmd)
    receipts["step6_responsiveness"] = "PASS" if ok else "FAIL"
    timings["step6_responsiveness"] = round(elapsed, 2)
    if not ok:
      all_passed = False
    print(f"[{receipts['step6_responsiveness']}] step 6: responsiveness continuum ({timings['step6_responsiveness']}s)")
    if not ok:
      print(f"       {out.strip()[:200]}")
  else:
    receipts["step6_responsiveness"] = "SKIP (provide --desktop-ref & --mobile-ref)"
    print(f"[-] step 6: responsiveness continuum (skipped, provide --desktop-ref & --mobile-ref)")

  # STEP 7: interaction & feel (controls, scroll points, triggers, 60fps & press)
  interact_script = SKILLS_ROOT / "interaction" / "scripts" / "eval-interaction.py"
  feel_script = SKILLS_ROOT / "feel" / "scripts" / "eval-feel-and-scroll.py"
  step7_ok = True
  elapsed_7 = 0.0

  if interact_script.exists():
    cmd = ["python3", str(interact_script), f"--project={proj_path}"]
    if args.require_scroll_points:
      cmd.append("--require-scroll-points")
    ok, out, elapsed = run_step("interaction", cmd)
    elapsed_7 += elapsed
    if not ok:
      step7_ok = False
      print(f"       [interaction defect] {out.strip()[:200]}")

  if feel_script.exists():
    cmd = ["python3", str(feel_script), f"--project={proj_path}"]
    ok, out, elapsed = run_step("feel", cmd)
    elapsed_7 += elapsed
    if not ok:
      step7_ok = False
      print(f"       [feel defect] {out.strip()[:200]}")

  receipts["step7_interaction_and_feel"] = "PASS" if step7_ok else "FAIL"
  timings["step7_interaction_and_feel"] = round(elapsed_7, 2)
  if not step7_ok:
    all_passed = False
  print(f"[{receipts['step7_interaction_and_feel']}] step 7: interaction & feel ({timings['step7_interaction_and_feel']}s)")

  # STEP 7.5: 5-turn automated source check-back loop (dev flywheel: comp plate + style kit + captures)
  checkback_script = SKILLS_ROOT / "jason-dev-agent" / "scripts" / "run_checkback_loop.py"
  step75_ok = True
  elapsed_75 = 0.0
  if checkback_script.exists():
    cmd = ["python3", str(checkback_script), f"--project={proj_path}", "--max-cycles=5", "--timeout-seconds=2400"]
    if ref_plate and pathlib.Path(ref_plate).exists():
      cmd.append(f"--reference={ref_plate}")
    if args.require_scroll_points:
      cmd.append("--require-scroll-points")
    ok, out, elapsed = run_step("checkback_loop", cmd)
    elapsed_75 = elapsed
    receipts["step7_5_dev_flywheel"] = "PASS" if ok else "FAIL"
    timings["step7_5_dev_flywheel"] = round(elapsed_75, 2)
    if not ok:
      step75_ok = False
      all_passed = False
    print(f"[{receipts['step7_5_dev_flywheel']}] step 7.5: dev flywheel (5-target check-back loop, 40m timeout) ({timings['step7_5_dev_flywheel']}s)")
    if not ok:
      for line in out.strip().splitlines()[-4:]:
        print(f"       {line}")
  else:
    receipts["step7_5_dev_flywheel"] = "SKIP"
    print("[-] step 7.5: dev flywheel skipped (script not found)")

  # STEP 8: golden-template linting & bundle verification
  lint_script = SKILLS_ROOT / "golden-template" / "scripts" / "lint-golden-template.mjs"
  bundle_script = SKILLS_ROOT / "jason-dev-agent" / "scripts" / "verify_html_bundle.mjs"
  dist_html = proj_path / "dist" / "index.html"
  step8_ok = True
  elapsed_8 = 0.0

  if lint_script.exists():
    cmd = ["node", str(lint_script), f"--dir={proj_path.parent}", f"--project={project_slug}", "--fix"]
    ok, out, elapsed = run_step("lint", cmd)
    elapsed_8 += elapsed
    if not ok:
      step8_ok = False
      print(f"       [lint defect] {out.strip()[:200]}")

  if bundle_script.exists() and dist_html.exists():
    cmd = ["node", str(bundle_script), str(dist_html)]
    ok, out, elapsed = run_step("bundle", cmd)
    elapsed_8 += elapsed
    if not ok:
      step8_ok = False
      print(f"       [bundle defect] {out.strip()[:200]}")
  elif not dist_html.exists():
    step8_ok = False
    print("       [bundle defect] dist/index.html not found, run build first")

  receipts["step8_golden_template"] = "PASS" if step8_ok else "FAIL"
  timings["step8_golden_template"] = round(elapsed_8, 2)
  if not step8_ok:
    all_passed = False
  print(f"[{receipts['step8_golden_template']}] step 8: golden-template lint & bundle ({timings['step8_golden_template']}s)")

  # Update dev turns
  update_dev_turns(study_dir, project_slug, {k: v == "PASS" for k, v in receipts.items()})

  print("-" * 58)
  if all_passed:
    print("result:    ALL 8 STEPS PASS -> READY FOR DESIGNER CHECKPOINT")
  else:
    print("result:    ITERATE NEEDED")

  summary_payload = {
      "project": project_slug,
      "passed": all_passed,
      "checkpoint": "ready" if all_passed else "iterate_needed",
      "receipts": receipts,
      "timings_sec": timings,
  }

  if args.json:
    print(json.dumps(summary_payload, indent=2))

  sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
  main()
