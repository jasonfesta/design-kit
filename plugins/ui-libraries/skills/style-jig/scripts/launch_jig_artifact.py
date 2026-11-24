#!/usr/bin/env python3
"""Compile the canonical blank-stage DesignKitJig (`examples/jig-harness`) into a single-file HTML bundle for Jetski's right-hand Artifact Pane.

Works both inside `~/design-kit` and when installed standalone from `style-jig.skill` / `style-jig.zip`.

Usage:
  python3 scripts/launch_jig_artifact.py \
    --artifact=/path/to/brain/<conversation-id>/design-kit-jig-harness.html
"""

from __future__ import annotations

import argparse
import os
import pathlib
import shutil
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
SKILL_ROOT = HERE.parent
_PLUGIN_SKILL_ROOT = (
    SKILL_ROOT.parent.parent / "plugins" / "ui-libraries" / "skills" / "style-jig"
)
CANONICAL_SKILL_ROOT = (
    _PLUGIN_SKILL_ROOT
    if (_PLUGIN_SKILL_ROOT / "examples" / "jig-harness").exists()
    else SKILL_ROOT
)
DESIGN_KIT_ROOT = (
    CANONICAL_SKILL_ROOT.parents[3]
    if CANONICAL_SKILL_ROOT.parent.name == "skills"
    and len(CANONICAL_SKILL_ROOT.parents) >= 4
    and (CANONICAL_SKILL_ROOT.parents[3] / "INDEX.md").exists()
    else None
)

DEFAULT_EXAMPLE_DIR = CANONICAL_SKILL_ROOT / "examples" / "jig-harness"
DEFAULT_WORK_DIR = pathlib.Path("/tmp/design-kit-jig-build")
DEFAULT_NODE_BIN = (
    DESIGN_KIT_ROOT / "tools" / "python" / "site" / "playwright" / "driver" / "node"
    if DESIGN_KIT_ROOT is not None
    else None
)
BUILD_LOCAL_ARTIFACT_MJS = (
    DESIGN_KIT_ROOT
    / "plugins"
    / "dev-pipeline"
    / "skills"
    / "local-build-preview"
    / "scripts"
    / "build-local-artifact.mjs"
    if DESIGN_KIT_ROOT is not None
    else None
)

READY_STAMP = '<meta name="x-local-build-stamp" content="READY_FOR_SNAPSHOT" />'
ACTIVE_STAMP = '<meta name="x-local-build-stamp" content="LOCAL_SINGLEFILE_ACTIVE" />'


def detect_node_modules(explicit: str | None) -> pathlib.Path | None:
  if explicit:
    candidate = pathlib.Path(explicit).expanduser().resolve()
    if candidate.is_dir():
      return candidate
    raise FileNotFoundError(f"--node-modules directory not found: {candidate}")

  candidates = [
      pathlib.Path.home() / "wda" / "node_modules",
      pathlib.Path.cwd() / "node_modules",
      pathlib.Path.home() / "wda" / "warm-landing-page" / "node_modules",
  ]
  for cand in candidates:
    if cand.is_dir():
      return cand.resolve()
  return None


def resolve_node_binary(explicit: str | None = None) -> pathlib.Path:
  if explicit:
    cand = pathlib.Path(explicit).expanduser().resolve()
    if cand.is_file():
      return cand
    raise FileNotFoundError(f"--node-bin not found: {cand}")
  candidates: list[pathlib.Path] = []
  if DEFAULT_NODE_BIN is not None:
    candidates.append(DEFAULT_NODE_BIN)
  which_node = shutil.which("node")
  if which_node:
    candidates.append(pathlib.Path(which_node))
  home = pathlib.Path.home()
  candidates.extend([
      home / "design-kit" / "tools" / "python" / "site" / "playwright" / "driver" / "node",
      pathlib.Path("/usr/local/bin/node"),
      pathlib.Path("/opt/homebrew/bin/node"),
  ])
  nvm_dir = home / ".nvm" / "versions" / "node"
  if nvm_dir.is_dir():
    for ver_dir in sorted(nvm_dir.iterdir(), reverse=True):
      candidates.append(ver_dir / "bin" / "node")
  for cand in candidates:
    if cand.is_file():
      return cand
  raise FileNotFoundError(
      "Node runtime not found on PATH (pass --node-bin=/path/to/node or install Node 20+)."
  )


def stage_work_dir(source_dir: pathlib.Path, work_dir: pathlib.Path) -> None:
  if not source_dir.is_dir():
    raise FileNotFoundError(
        f"Canonical DesignKitJig example not found at: {source_dir}"
    )

  if work_dir.exists():
    nm_link = work_dir / "node_modules"
    if nm_link.is_symlink() or nm_link.is_file():
      nm_link.unlink()
    for child in list(work_dir.iterdir()):
      if child.is_symlink() or child.is_file():
        child.unlink()
      elif child.is_dir():
        shutil.rmtree(child)
  else:
    work_dir.mkdir(parents=True, exist_ok=True)

  shutil.copytree(
      source_dir,
      work_dir,
      dirs_exist_ok=True,
      ignore=shutil.ignore_patterns("node_modules", "dist", ".DS_Store", "__pycache__"),
  )


def ensure_ready_stamp(artifact_path: pathlib.Path) -> None:
  html = artifact_path.read_text(encoding="utf-8")
  if READY_STAMP in html:
    return
  if ACTIVE_STAMP in html:
    html = html.replace(ACTIVE_STAMP, READY_STAMP, 1)
  elif "</head>" in html:
    html = html.replace("</head>", f"  {READY_STAMP}\n</head>", 1)
  else:
    html = f"{READY_STAMP}\n{html}"
  artifact_path.write_text(html, encoding="utf-8")


def link_writable_node_modules(
    work_dir: pathlib.Path,
    node_modules_dir: pathlib.Path,
) -> None:
  """Create a writable work_dir/node_modules populated with per-package symlinks.

  Vite 7 writes temporary compiled configs into node_modules/.vite-temp/, which
  fails with EROFS inside a sandbox if node_modules itself is a symlink to a
  read-only shared directory.
  """
  nm_target = work_dir / "node_modules"
  if nm_target.is_symlink() or nm_target.is_file():
    nm_target.unlink()
  nm_target.mkdir(parents=True, exist_ok=True)
  skip_entries = {".vite", ".vite-temp", ".cache"}
  for entry in node_modules_dir.iterdir():
    if entry.name in skip_entries:
      continue
    dst = nm_target / entry.name
    if not dst.exists() and not dst.is_symlink():
      os.symlink(entry, dst)


def build_portable_singlefile(
    work_dir: pathlib.Path,
    artifact_path: pathlib.Path,
    node_bin: pathlib.Path,
    node_modules_dir: pathlib.Path | None,
) -> int:
  """Portable fallback builder when design-kit's build-local-artifact.mjs is not present."""
  nm_target = work_dir / "node_modules"
  if node_modules_dir is not None and not nm_target.exists():
    link_writable_node_modules(work_dir, node_modules_dir)
  elif not nm_target.exists():
    npm_bin = shutil.which("npm")
    if not npm_bin:
      print("[launch_jig_artifact] ERROR: npm not found on PATH and --node-modules not provided.", file=sys.stderr)
      return 1
    print(f"[launch_jig_artifact] Installing dependencies in {work_dir}...")
    inst = subprocess.run([npm_bin, "install", "--no-audit", "--no-fund"], cwd=work_dir, check=False)
    if inst.returncode != 0:
      return inst.returncode

  vite_cli = work_dir / "node_modules" / "vite" / "bin" / "vite.js"
  if vite_cli.is_file():
    cmd = [str(node_bin), str(vite_cli), "build"]
  else:
    npx_bin = shutil.which("npx")
    if not npx_bin:
      print("[launch_jig_artifact] ERROR: vite CLI not found in node_modules and npx not on PATH.", file=sys.stderr)
      return 1
    cmd = [npx_bin, "vite", "build"]

  proc = subprocess.run(cmd, cwd=work_dir, check=False)
  if proc.returncode != 0:
    return proc.returncode

  built_html = work_dir / "dist" / "index.html"
  if not built_html.is_file():
    print(f"[launch_jig_artifact] ERROR: expected {built_html} after vite build.", file=sys.stderr)
    return 1

  shutil.copyfile(built_html, artifact_path)
  return 0


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
  parser = argparse.ArgumentParser(
      description=(
          "Copy the canonical DesignKitJig example (examples/jig-harness) into a writable "
          "build directory, compile a single-file bundle onto --artifact, and print the exact "
          "edit_file step to surface it in Jetski's right-hand Artifact Pane."
      )
  )
  parser.add_argument(
      "--artifact",
      required=True,
      help=(
          "Absolute path to the target HTML artifact file "
          "(e.g. <appDataDir>/brain/<conversation-id>/design-kit-jig-harness.html)."
      ),
  )
  parser.add_argument(
      "--project",
      default=None,
      help=(
          "Optional source project directory to compile instead of the bundled "
          "examples/jig-harness/ template (e.g. a project initialized via init_style_jig.py)."
      ),
  )
  parser.add_argument(
      "--work-dir",
      default=str(DEFAULT_WORK_DIR),
      help=f"Writable temporary build directory (default: {DEFAULT_WORK_DIR}).",
  )
  parser.add_argument(
      "--node-modules",
      default=None,
      help="Optional path to shared offline node_modules (auto-detects ~/wda/node_modules or runs npm install).",
  )
  parser.add_argument(
      "--node-bin",
      default=None,
      help="Optional path to a specific node binary (auto-detects PATH, nvm, Homebrew, or ~/design-kit).",
  )
  return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
  args = parse_args(argv)

  artifact_path = pathlib.Path(args.artifact).expanduser().resolve()
  work_dir = pathlib.Path(args.work_dir).expanduser().resolve()
  source_dir = (
      pathlib.Path(args.project).expanduser().resolve()
      if args.project
      else DEFAULT_EXAMPLE_DIR
  )

  try:
    node_bin = resolve_node_binary(args.node_bin)
    node_modules_dir = detect_node_modules(args.node_modules)
    stage_work_dir(source_dir, work_dir)
  except Exception as exc:  # pylint: disable=broad-except
    print(f"[launch_jig_artifact] ERROR: {exc}", file=sys.stderr)
    return 1

  artifact_path.parent.mkdir(parents=True, exist_ok=True)
  print(f"[launch_jig_artifact] Staged {source_dir} -> {work_dir}")
  print(f"[launch_jig_artifact] Compiling single-file DesignKitJig -> {artifact_path}")

  if node_modules_dir is not None:
    link_writable_node_modules(work_dir, node_modules_dir)

  if BUILD_LOCAL_ARTIFACT_MJS is not None and BUILD_LOCAL_ARTIFACT_MJS.is_file():
    cmd = [
        str(node_bin),
        str(BUILD_LOCAL_ARTIFACT_MJS),
        f"--project={work_dir}",
        f"--artifact={artifact_path}",
    ]
    if node_modules_dir is not None:
      cmd.append(f"--node-modules={node_modules_dir}")
    proc = subprocess.run(cmd, check=False)
    rc = proc.returncode
  else:
    rc = build_portable_singlefile(work_dir, artifact_path, node_bin, node_modules_dir)

  if rc != 0:
    print(f"[launch_jig_artifact] ERROR: build exited with code {rc}", file=sys.stderr)
    return rc

  if not artifact_path.is_file():
    print(
        f"[launch_jig_artifact] ERROR: expected compiled artifact not found at {artifact_path}",
        file=sys.stderr,
    )
    return 1

  ensure_ready_stamp(artifact_path)
  size_kb = artifact_path.stat().st_size / 1024.0

  print("")
  print(f"[launch_jig_artifact] SUCCESS: {artifact_path} ({size_kb:.1f} KB)")
  print(f"[launch_jig_artifact] Editable work copy: {work_dir}")
  print("")
  print("=== NEXT STEP: OPEN IN JETSKI RIGHT-HAND ARTIFACT PANE ===")
  print(
      "1. If the artifact file was not previously registered via write_file with ArtifactMetadata, "
      "stub-register it first (or call edit_file directly below)."
  )
  print(f"2. Call `edit_file` on `{artifact_path}` with:")
  print(f"   - Target:      {READY_STAMP}")
  print(f"   - Replacement: {ACTIVE_STAMP}")
  print(
      '   - ArtifactMetadata: { "UserFacing": true, "RequestFeedback": false, '
      '"Summary": "Interactive DesignKitJig single-file harness in the right-hand Artifact Pane." }'
  )
  return 0


if __name__ == "__main__":
  sys.exit(main())
