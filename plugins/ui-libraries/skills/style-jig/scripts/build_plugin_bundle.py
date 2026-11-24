#!/usr/bin/env python3
"""Assemble a standalone, Jetski-compliant `design-kit-jig` Plugin bundle (ready for `~/.gemini/config/plugins/` or future Agent Marketplace use, without publishing to google3).

Produces:
  <out-dir>/design-kit-jig/
    ├── plugin.json
    ├── README.md
    ├── INSTALL.md
    ├── agents/
    │   ├── jig-agent.md
    │   └── jig-recorder.md
    └── skills/
        └── style-jig/   (complete validated skill)
  <out-dir>/design-kit-jig-plugin.zip

Usage:
  python3 scripts/build_plugin_bundle.py --out-dir=/path/to/dist
"""

from __future__ import annotations

import argparse
import json
import pathlib
import shutil
import zipfile

HERE = pathlib.Path(__file__).resolve().parent
SKILL_DIR = HERE.parent
PLUGIN_ROOT_CANDIDATE = SKILL_DIR.parent.parent
SKIP_DIRS = {"node_modules", "dist", "__pycache__", ".vite", ".eval_work", ".git"}


def build_plugin_json() -> dict:
  return {
      "name": "design-kit-jig",
      "displayName": "Design Kit Jig",
      "version": "2.0.0",
      "category": "design",
      "keywords": [
          "design-kit",
          "style-jig",
          "prototype",
          "ui-harness",
          "playback",
          "prompt-copy",
          "mp4-walkthrough",
          "design-systems",
      ],
      "description": (
          "Install-once Design Kit Jig control harness with customizable slide domains, "
          "style taxonomy slots, UI/motion library toggles, optional clone source hook, "
          "interactive Playback autopilot cursor, strokeless Red Record MP4 walkthroughs, "
          "Trace markdown viewer, live rendered Prompt HTML+CSS copy, and 100% standalone Open."
      ),
      "author": "Jason Festa",
      "suggestedPrompts": [
          "Set up style-jig for my project and ask me for my slide types, libraries, and styles",
          "Launch the Design Kit Jig harness in the right-hand Artifact Pane",
          "Wrap this screen in style-jig, run Playback, and record a 12-second MP4 walkthrough",
      ],
  }


def copy_clean_tree(src: pathlib.Path, dst: pathlib.Path) -> int:
  count = 0
  for item in sorted(src.rglob("*")):
    rel = item.relative_to(src)
    if any(part in SKIP_DIRS for part in rel.parts):
      continue
    if item.name == ".DS_Store" or item.name.endswith(".pyc"):
      continue
    target = dst / rel
    if item.is_dir():
      target.mkdir(parents=True, exist_ok=True)
    elif item.is_file():
      target.parent.mkdir(parents=True, exist_ok=True)
      shutil.copyfile(item, target)
      count += 1
  return count


def build_plugin(out_dir: pathlib.Path) -> dict:
  out_dir = out_dir.resolve()
  out_dir.mkdir(parents=True, exist_ok=True)
  plugin_dir = out_dir / "design-kit-jig"
  if plugin_dir.exists():
    shutil.rmtree(plugin_dir)
  plugin_dir.mkdir(parents=True, exist_ok=True)

  # 1. plugin.json
  (plugin_dir / "plugin.json").write_text(
      json.dumps(build_plugin_json(), indent=2) + "\n", encoding="utf-8"
  )

  # 2. README.md and INSTALL.md at plugin root
  for doc_name in ("README.md", "INSTALL.md"):
    src_doc = SKILL_DIR / doc_name
    if src_doc.is_file():
      shutil.copyfile(src_doc, plugin_dir / doc_name)

  # 3. skills/style-jig/
  dst_skill = plugin_dir / "skills" / "style-jig"
  skill_files = copy_clean_tree(SKILL_DIR, dst_skill)

  # 4. agents/ (jig-agent.md & jig-recorder.md when available, plus fallback to skill agent.md)
  dst_agents = plugin_dir / "agents"
  dst_agents.mkdir(parents=True, exist_ok=True)
  agents_copied: list[str] = []
  src_agents_dir = PLUGIN_ROOT_CANDIDATE / "agents"
  for agent_file in ("jig-agent.md", "jig-recorder.md"):
    cand = src_agents_dir / agent_file
    if cand.is_file():
      shutil.copyfile(cand, dst_agents / agent_file)
      agents_copied.append(agent_file)
  if not agents_copied and (SKILL_DIR / "agent.md").is_file():
    shutil.copyfile(SKILL_DIR / "agent.md", dst_agents / "style-jig.md")
    agents_copied.append("style-jig.md")

  # 5. Zip archive (<out-dir>/design-kit-jig-plugin.zip) with top-level `design-kit-jig/` folder
  zip_path = out_dir / "design-kit-jig-plugin.zip"
  total_zipped = 0
  with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(plugin_dir.rglob("*")):
      if f.is_file():
        arcname = f"design-kit-jig/{f.relative_to(plugin_dir).as_posix()}"
        zf.write(f, arcname)
        total_zipped += 1

  return {
      "plugin_dir": str(plugin_dir),
      "plugin_zip": str(zip_path),
      "plugin_zip_bytes": zip_path.stat().st_size,
      "skill_files": skill_files,
      "agents": agents_copied,
      "total_zipped_files": total_zipped,
  }


def main() -> None:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument(
      "--out-dir",
      type=pathlib.Path,
      default=SKILL_DIR.parents[3] / "dist"
      if len(SKILL_DIR.parents) >= 4
      else SKILL_DIR.parent / "dist",
      help="Output directory for design-kit-jig/ and design-kit-jig-plugin.zip",
  )
  args = parser.parse_args()
  report = build_plugin(args.out_dir)
  print(json.dumps(report, indent=2))


if __name__ == "__main__":
  main()
