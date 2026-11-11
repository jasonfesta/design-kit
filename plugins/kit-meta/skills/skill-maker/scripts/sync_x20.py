#!/usr/bin/env python3
"""Syncs /usr/local/google/home/jfesta/design-kit/skills to ~/.gemini/config/skills and /google/data/rw/users/jf/jfesta/www/skills (x20)."""

import argparse
import os
import pathlib
import shutil

SKILLS_WS = pathlib.Path("/usr/local/google/home/jfesta/design-kit/skills")
X20_SKILLS = pathlib.Path("/google/data/rw/users/jf/jfesta/www/skills")
GLOBAL_SKILLS = pathlib.Path("/usr/local/google/home/jfesta/.gemini/config/skills")
GLOBAL_AGENTS = pathlib.Path("/usr/local/google/home/jfesta/.gemini/config/agents")

REMOVED_PREFIXES = (
    "benchmark-interaction-planner",
    "local-build-preview",
    "benchmark_interaction_planner",
    "local_build_preview",
    "react-extractor",
    "golden-template-extractor",
    "react_extractor",
    "golden_template_extractor",
    "typography",
    "responsive-dual-eval",
    "responsive_dual_eval",
    "interaction-eval",
    "interaction_eval",
)


def prune_x20_obsolete(dst_dir: pathlib.Path) -> None:
  """Removes deprecated or consolidated skill directories/files on x20."""
  if not dst_dir.exists():
    return
  for item in list(dst_dir.iterdir()):
    if any(item.name == p or item.name.startswith(p + ".") for p in REMOVED_PREFIXES):
      if item.is_dir():
        shutil.rmtree(item, ignore_errors=True)
      else:
        try:
          item.unlink()
        except OSError:
          pass
  g3_pkg = dst_dir / "_google3_packages"
  if g3_pkg.exists():
    shutil.rmtree(g3_pkg, ignore_errors=True)


def copy_to_x20(src_dir: pathlib.Path, dst_dir: pathlib.Path) -> int:
  """Copies changed files from ~/design-kit/skills to x20 using copyfile (safe on x20 FUSE mounts)."""
  dst_dir.mkdir(parents=True, exist_ok=True)
  prune_x20_obsolete(dst_dir)
  count = 0
  for root, dirs, files in os.walk(src_dir):
    dirs[:] = [d for d in sorted(dirs) if not d.startswith(".") and d not in ("__pycache__", "node_modules", "dist", ".eval_work")]
    rel_root = pathlib.Path(root).relative_to(src_dir)
    target_root = dst_dir / rel_root
    target_root.mkdir(parents=True, exist_ok=True)
    for fname in sorted(files):
      if fname.startswith(".") or fname.endswith(".pyc"):
        continue
      src_file = pathlib.Path(root) / fname
      dst_file = target_root / fname
      if dst_file.exists():
        try:
          if dst_file.stat().st_size == src_file.stat().st_size and dst_file.read_bytes() == src_file.read_bytes():
            continue
        except OSError:
          pass
      shutil.copyfile(src_file, dst_file)
      count += 1
  return count


def sync_global_symlinks(skills_root: pathlib.Path) -> tuple[int, int]:
  """Updates ~/.gemini/config/skills and ~/.gemini/config/agents symlinks to point to ~/design-kit/skills."""
  linked_skills = 0
  linked_agents = 0
  try:
    GLOBAL_SKILLS.mkdir(parents=True, exist_ok=True)
    for item in list(GLOBAL_SKILLS.iterdir()):
      if item.is_symlink() or item.is_file():
        item.unlink()
      elif item.is_dir():
        shutil.rmtree(item)
    for entry in sorted(skills_root.iterdir()):
      if entry.is_dir() and not entry.name.startswith((".", "_")) and (entry / "SKILL.md").exists():
        os.symlink(str(entry), str(GLOBAL_SKILLS / entry.name))
        linked_skills += 1
  except OSError as exc:
    print(f"[WARN] could not refresh {GLOBAL_SKILLS}: {exc} (run outside the sandbox to update global symlinks)")

  try:
    GLOBAL_AGENTS.mkdir(parents=True, exist_ok=True)
    # Preserve standalone user agent .md files; only refresh symlinks pointing into skills_root
    for item in list(GLOBAL_AGENTS.iterdir()):
      if item.is_symlink():
        try:
          target = str(item.resolve())
        except OSError:
          target = ""
        if str(skills_root) in target or not item.exists():
          item.unlink()
    coord_dir = skills_root / "_agents" / "agents"
    if coord_dir.exists():
      for md in sorted(coord_dir.glob("*.md")):
        dst = GLOBAL_AGENTS / md.name
        if not dst.exists():
          os.symlink(str(md), str(dst))
          linked_agents += 1
    for entry in sorted(skills_root.iterdir()):
      if entry.is_dir() and not entry.name.startswith((".", "_")) and (entry / "agent.md").exists():
        dst = GLOBAL_AGENTS / entry.name
        if not dst.exists():
          os.symlink(str(entry), str(dst))
          linked_agents += 1
  except OSError as exc:
    print(f"[WARN] could not refresh {GLOBAL_AGENTS}: {exc} (run outside the sandbox to update global symlinks)")
  return linked_skills, linked_agents


def main() -> None:
  parser = argparse.ArgumentParser(description="Sync ~/design-kit/skills to ~/.gemini/config/{skills,agents} and x20.")
  parser.add_argument("--skills-root", default=str(SKILLS_WS), help="Canonical skills workspace directory")
  parser.add_argument("--x20-dir", default=str(X20_SKILLS), help="Target x20 directory")
  parser.add_argument("--skip-x20", action="store_true", help="Skip the x20 copy")
  parser.add_argument(
      "--legacy-global-symlinks",
      action="store_true",
      help=(
          "Also symlink skills into ~/.gemini/config/{skills,agents}. Off by"
          " default: Jetski loads the kit via ~/.gemini/config/plugins.json ->"
          " ~/design-kit/plugins, so these links would load every skill twice."
      ),
  )
  args = parser.parse_args()

  skills_root = pathlib.Path(args.skills_root).resolve()
  if args.legacy_global_symlinks:
    linked_skills, linked_agents = sync_global_symlinks(skills_root)
    print(f"Updated {linked_skills} skill symlinks in {GLOBAL_SKILLS} and {linked_agents} agent symlinks in {GLOBAL_AGENTS}")
  else:
    print("Global discovery is via ~/.gemini/config/plugins.json -> ~/design-kit/plugins (no symlinks written).")

  if not args.skip_x20:
    x20_dir = pathlib.Path(args.x20_dir)
    n = copy_to_x20(skills_root, x20_dir)
    print(f"Synced {n} updated files from {skills_root} -> {x20_dir}")


if __name__ == "__main__":
  main()
