#!/usr/bin/env python3
"""Scaffold the 3d-ui-jig (universal 3D rig + schema-driven jig + scene module)
into a Golden Template React 19 + Vite 7 + Tailwind v4 project.

Usage:
  python3 ~/design-kit/skills/3d-ui-jig/scripts/init_3d_ui_jig.py <project-dir>
      [--scene cuboid-chain|blank] [--overwrite] [--no-package-edit]
      [--no-html-edit] [--dry-run]

What it writes (relative to <project-dir>/src):
  three/rig/            rigTypes, rigSchema, createRig, cameraRig, envMaps, shaderHooks
  three/scenes/types.ts SceneModule contract
  three/scenes/<scene>/ the chosen scene module
  components/ThreeStage.tsx
  components/jig/       schema, JigControls, RightJig, BottomBar, promptExport, useJigState, jig.css
  data/jigData.ts       picks the active scene
  utils/cn.ts           only if missing
  App.tsx               replaced (old one saved as App.tsx.bak)

It also adds `three` + `@types/three` to package.json (the Golden Template's
one explicit 3D dependency exception) and, if no Instrument Sans / JetBrains
Mono loading is found, adds a Google Fonts <link> to index.html.
"""

import argparse
import json
import pathlib
import shutil
import sys

HERE = pathlib.Path(__file__).resolve().parent
SKILL_ROOT = HERE.parent
TPL = SKILL_ROOT / "templates"
SCENES = ("cuboid-chain", "blank")

THREE_VERSION = "^0.185.0"
FONT_LINK = (
    '    <!-- 3d-ui-jig fonts: jig chrome + CanvasTexture card text -->\n'
    '    <link rel="preconnect" href="https://fonts.googleapis.com" />\n'
    '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
    '    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700'
    '&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />\n'
)
CN_TS = '''import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
'''


def plan(scene: str) -> list[tuple[pathlib.Path, str]]:
  """(source, destination relative to src/) pairs."""
  pairs: list[tuple[pathlib.Path, str]] = []
  for f in sorted((TPL / "rig").glob("*.ts")):
    pairs.append((f, f"three/rig/{f.name}"))
  pairs.append((TPL / "scenes" / "types.ts", "three/scenes/types.ts"))
  for f in sorted((TPL / "scenes" / scene).iterdir()):
    if f.is_file():
      pairs.append((f, f"three/scenes/{scene}/{f.name}"))
  pairs.append((TPL / "components" / "ThreeStage.tsx", "components/ThreeStage.tsx"))
  for f in sorted((TPL / "jig").iterdir()):
    if f.is_file():
      pairs.append((f, f"components/jig/{f.name}"))
  pairs.append((TPL / "data" / f"jigData.{scene}.ts", "data/jigData.ts"))
  return pairs


def edit_package(pkg_path: pathlib.Path, dry: bool) -> list[str]:
  notes = []
  if not pkg_path.exists():
    return ["package.json not found: add three + @types/three yourself"]
  data = json.loads(pkg_path.read_text())
  deps = data.setdefault("dependencies", {})
  dev = data.setdefault("devDependencies", {})
  if "three" not in deps:
    deps["three"] = THREE_VERSION
    notes.append(f"package.json: + dependencies.three {THREE_VERSION}")
  if "@types/three" not in dev:
    dev["@types/three"] = THREE_VERSION
    notes.append(f"package.json: + devDependencies.@types/three {THREE_VERSION}")
  if notes and not dry:
    data["dependencies"] = dict(sorted(deps.items()))
    data["devDependencies"] = dict(sorted(dev.items()))
    pkg_path.write_text(json.dumps(data, indent=2) + "\n")
  return notes


def edit_html(project: pathlib.Path, dry: bool) -> list[str]:
  html = project / "index.html"
  main = project / "src" / "main.tsx"
  if not html.exists():
    return ["index.html not found: load Instrument Sans + JetBrains Mono yourself"]
  text = html.read_text()
  main_text = main.read_text() if main.exists() else ""
  has_sans = "Instrument+Sans" in text or "instrument-sans" in main_text
  has_mono = "JetBrains+Mono" in text or "jetbrains-mono" in main_text
  if has_sans and has_mono:
    return []
  if "</head>" not in text:
    return ["index.html has no </head>: add the Google Fonts link yourself"]
  if not dry:
    html.write_text(text.replace("</head>", FONT_LINK + "  </head>", 1))
  return ["index.html: + Google Fonts link (Instrument Sans + JetBrains Mono)"]


def main() -> int:
  ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
  ap.add_argument("project", help="Golden Template project directory (has package.json + src/)")
  ap.add_argument("--scene", choices=SCENES, default="cuboid-chain")
  ap.add_argument("--overwrite", action="store_true", help="overwrite existing jig/rig/scene files")
  ap.add_argument("--no-package-edit", action="store_true")
  ap.add_argument("--no-html-edit", action="store_true")
  ap.add_argument("--dry-run", action="store_true")
  args = ap.parse_args()

  project = pathlib.Path(args.project).expanduser().resolve()
  src = project / "src"
  if not (project / "package.json").exists() or not src.is_dir():
    print(f"error: {project} doesn't look like a Golden Template project (needs package.json and src/)", file=sys.stderr)
    return 2

  written, skipped = [], []
  for source, rel in plan(args.scene):
    dest = src / rel
    if dest.exists() and not args.overwrite:
      skipped.append(rel)
      continue
    written.append(rel)
    if not args.dry_run:
      dest.parent.mkdir(parents=True, exist_ok=True)
      shutil.copy2(source, dest)

  # App.tsx is always replaced; the previous one is kept as App.tsx.bak.
  app = src / "App.tsx"
  if app.exists() and app.read_text() != (TPL / "App.tsx").read_text():
    if not args.dry_run:
      shutil.copy2(app, src / "App.tsx.bak")
    written.append("App.tsx (previous saved as App.tsx.bak)")
  else:
    written.append("App.tsx")
  if not args.dry_run:
    shutil.copy2(TPL / "App.tsx", app)

  cn = src / "utils" / "cn.ts"
  if not cn.exists():
    written.append("utils/cn.ts")
    if not args.dry_run:
      cn.parent.mkdir(parents=True, exist_ok=True)
      cn.write_text(CN_TS)

  notes = []
  if not args.no_package_edit:
    notes += edit_package(project / "package.json", args.dry_run)
  if not args.no_html_edit:
    notes += edit_html(project, args.dry_run)

  tag = "[dry-run] " if args.dry_run else ""
  print(f"{tag}3d-ui-jig → {project} (scene: {args.scene})")
  for rel in written:
    print(f"  + src/{rel}")
  for rel in skipped:
    print(f"  = src/{rel} (exists; pass --overwrite to replace)")
  for n in notes:
    print(f"  * {n}")

  print(
      f"""
Next steps:
  1. cd {project} && npm install        # pulls three + @types/three if they were added
  2. npx tsc --noEmit && npx vite build # singlefile dist/index.html
  3. npm run dev, then open /?nojig=1 for a clean capture
  4. Tune in the right-hand jig → Copy JSON to save values; paste them into a
     preset in src/three/scenes/{args.scene}/{'presets.ts' if args.scene == 'cuboid-chain' else 'index.ts'}
  5. Copy Prompt (bottom dock) exports 3D Elements / Shader / Right-Hand Jig / 3D + Jig prompts
  6. New scene: copy src/three/scenes/blank (or the skill's templates/scenes/blank),
     follow references/new-scene-module.md, then point src/data/jigData.ts at it
  7. Lint: python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py {project}
"""
  )
  return 0


if __name__ == "__main__":
  sys.exit(main())
