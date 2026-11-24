#!/usr/bin/env python3
"""Initialize the DesignKitJig (`style-jig` / `jig-agent` / `jig-recorder`) workspace folders, customizable `jig.config.json`, fresh Golden Template harness, or save Jig shell upgrades back into the skill.

Usage:
  # Default full scaffold (fullstack/immersive/app, clone..retro, shadcn/ease/fluid):
  python3 scripts/init_style_jig.py <project-dir> [--fresh] [--overwrite]

  # Custom self-setup (no assumption of fullstack/immersive, clean..retro, or shadcn/ease/fluid):
  python3 scripts/init_style_jig.py <project-dir> \
    --domains=landing,checkout \
    --styles=warm-paper,swiss-grid,dark-studio \
    --no-clone \
    --libs=mui,gsap \
    --theme=light

  # External clone service hook + declarative config file:
  python3 scripts/init_style_jig.py <project-dir> \
    --config=./jig.config.json \
    --clone-provider=external-service \
    --clone-service-name="my-clone-service" \
    --clone-endpoint="https://..."

  # Vanilla HTML / CSS / JS runtime into <project>/jig/:
  python3 scripts/init_style_jig.py <project-dir> --vanilla --overwrite

  # Bidirectional Jig Write-Back ("Save Back as the Jig") from a master project:
  python3 scripts/init_style_jig.py --save-back-from <source-project-dir>
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import shutil
from typing import Any

HERE = pathlib.Path(__file__).resolve().parent
SKILL_ROOT = HERE.parent
_PLUGIN_ROOT = SKILL_ROOT.parent.parent / "plugins" / "ui-libraries" / "skills" / "style-jig"
CANONICAL_ROOT = _PLUGIN_ROOT if (_PLUGIN_ROOT / "templates" / "style-jig.css").exists() else SKILL_ROOT
HARNESS_EXAMPLE_DIR = CANONICAL_ROOT / "examples" / "jig-harness"
TEMPLATE_TSX = CANONICAL_ROOT / "templates" / "TopStyleJig.tsx"
TEMPLATE_CSS = CANONICAL_ROOT / "templates" / "style-jig.css"
TEMPLATE_JS = CANONICAL_ROOT / "templates" / "style-jig-runtime.js"
TEMPLATE_VN_CSS = CANONICAL_ROOT / "templates" / "variant-notches.css"
TEMPLATE_VN_JS = CANONICAL_ROOT / "templates" / "variant-notches.js"
DEFAULTS_ROOT = CANONICAL_ROOT / "templates" / "defaults"

CORE_JIG_SHELL_COMPONENTS = (
    "DesignKitJigBars.tsx",
    "VariantNotchesRail.tsx",
    "EmptyStageBay.tsx",
    "ParameterInspectorDrawer.tsx",
)

DOMAIN_IMPORT_DENYLIST = (
    "AnalyticsAppStage",
    "AiChat",
    "ChatUiStageHost",
    "assistantData",
)

STYLE_SLOTS = [
    ("clone", "Base 1:1 structural & visual clone of the golden reference"),
    ("clean", "Take this layout and apply a clean look and feel with a lot of open white space and very simplistic fonts."),
    ("grid", "Take this layout and apply an exposed Swiss architectural grid look and feel with visible 1px structural hairlines, crisp cell alignment, technical index coordinates, and disciplined grotesque + monospace typography."),
    ("editorial", "Take this layout and apply a refined magazine and archival monograph editorial look and feel with high-contrast literary serif headlines, warm cotton-paper surfaces, humanist sans UI copy, and terracotta ink accents."),
    ("cinematic", "Take this layout and apply a dramatic, theatrical cinematic look and feel on a true-neutral obsidian dark stage with luminous warm amber key-lighting, smoked-glass depth, and high-contrast serif + geometric sans typography."),
    ("product", "Take this layout and apply a high-craft functional SaaS product workspace look and feel with concentric border radii, tactile micro-elevation, hyper-legible UI typography, and crisp petrol-teal and emerald operational signals."),
    ("brutal", "Take this layout and apply a raw Swiss Neo-Brutalist architectural poster look and feel with stark 2px solid ink borders, hard 0px corners, solid offset block shadows, condensed industrial display type, and high-voltage vermillion red and safety-orange punch."),
    ("playful", "Take this layout and apply an energetic, tactile, playful look and feel with warm butter-cream surfaces, generously rounded pill geometry, bouncy expressive display typography, crisp ink outlines, and joyful tangerine and meadow-green color blocks."),
    ("retro", "Take this layout and apply a nostalgic 1970s archival print, risograph, and analog studio manual look and feel with warm sun-aged stock, soft-serif display typography, stamped monospace labels, and burnt-sienna and mustard-ochre inks."),
]
BUILTIN_STYLE_PROMPTS = dict(STYLE_SLOTS)

DEFAULT_LIBS = [
    {"id": "shadcn", "label": "shadcn"},
    {"id": "ease", "label": "ease"},
    {"id": "fluid", "label": "fluid"},
]

DOMAIN_PRESETS: dict[str, dict[str, Any]] = {
    "fullstack": {
        "domain": "fullstack",
        "label": "full stack",
        "defaultSlide": "component",
        "chromeMode": "standard",
        "items": [
            {"id": "component", "label": "component", "stageMode": "component"},
            {"id": "full-view", "label": "full view", "stageMode": "view"},
        ],
    },
    "immersive": {
        "domain": "immersive",
        "label": "immersive",
        "defaultSlide": "3d",
        "chromeMode": "immersive",
        "items": [
            {"id": "3d", "label": "3d", "stageMode": "view", "inspectorSchema": "3d"},
            {"id": "parallax", "label": "parallax", "stageMode": "view", "inspectorSchema": "parallax"},
            {"id": "shader", "label": "shader", "stageMode": "view", "inspectorSchema": "shader"},
        ],
    },
    "app": {
        "domain": "app",
        "label": "app",
        "defaultSlide": "menu",
        "chromeMode": "app",
        "items": [
            {"id": "menu", "label": "menu", "stageMode": "component", "inspectorSchema": "menu"},
            {"id": "cards", "label": "cards", "stageMode": "component", "inspectorSchema": "cards"},
            {"id": "bg", "label": "bg", "stageMode": "component", "inspectorSchema": "bg"},
        ],
    },
    "mobile": {
        "domain": "mobile",
        "label": "mobile",
        "defaultSlide": "menu",
        "chromeMode": "app",
        "items": [
            {"id": "menu", "label": "menu", "stageMode": "component", "inspectorSchema": "menu"},
            {"id": "cards", "label": "cards", "stageMode": "component", "inspectorSchema": "cards"},
            {"id": "bg", "label": "bg", "stageMode": "component", "inspectorSchema": "bg"},
        ],
    },
    "landing": {
        "domain": "landing",
        "label": "landing",
        "defaultSlide": "hero",
        "chromeMode": "standard",
        "items": [
            {"id": "hero", "label": "hero", "stageMode": "component"},
            {"id": "landing-page", "label": "full page", "stageMode": "view"},
        ],
    },
    "dashboard": {
        "domain": "dashboard",
        "label": "dashboard",
        "defaultSlide": "widget",
        "chromeMode": "standard",
        "items": [
            {"id": "widget", "label": "widget", "stageMode": "component"},
            {"id": "dashboard-view", "label": "full view", "stageMode": "view"},
        ],
    },
    "component": {
        "domain": "component",
        "label": "components",
        "defaultSlide": "component",
        "chromeMode": "standard",
        "items": [
            {"id": "component", "label": "component", "stageMode": "component"},
        ],
    },
    "3d": {
        "domain": "3d",
        "label": "3d",
        "defaultSlide": "3d",
        "chromeMode": "immersive",
        "items": [
            {"id": "3d", "label": "3d", "stageMode": "view", "inspectorSchema": "3d"},
        ],
    },
}

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}
SKIP_DIR_NAMES = {"node_modules", "dist", ".git", "__pycache__"}


def slugify_package_name(raw_name: str) -> str:
  slug = re.sub(r"[^a-z0-9._-]+", "-", raw_name.strip().lower()).strip("-._")
  return slug or "design-kit-jig-app"


def slugify_id(raw_name: str) -> str:
  slug = re.sub(r"[^a-z0-9-]+", "-", raw_name.strip().lower()).strip("-")
  return slug or "custom"


def label_from_slug(slug: str) -> str:
  return re.sub(r"[-_]+", " ", slug.strip().lower()).strip() or slug


def title_from_slug(raw_name: str) -> str:
  words = [w for w in re.split(r"[-_.\s]+", raw_name.strip()) if w]
  return " ".join(w.capitalize() for w in words) if words else "Design Kit Jig"


def scan_folder_images(folder: pathlib.Path) -> list[str]:
  if not folder.exists():
    return []
  return sorted(
      f.name
      for f in folder.iterdir()
      if f.is_file() and f.suffix.lower() in IMAGE_EXTS
  )


def parse_default_md_frontmatter(md_path: pathlib.Path) -> dict:
  if not md_path.exists():
    return {}
  text = md_path.read_text(encoding="utf-8", errors="ignore")
  m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
  if not m:
    return {}
  meta = {}
  for line in m.group(1).splitlines():
    if ":" not in line:
      continue
    k, v = line.split(":", 1)
    meta[k.strip()] = v.strip().strip('"').strip("'")
  return meta


def parse_csv_tokens(raw: str | None) -> list[str]:
  if not raw:
    return []
  return [tok.strip() for tok in raw.split(",") if tok.strip()]


def build_domains_from_list(raw_domains: list[str]) -> list[dict[str, Any]]:
  domains: list[dict[str, Any]] = []
  used_slide_ids: set[str] = set()
  for raw in raw_domains:
    slug = slugify_id(raw)
    if slug in DOMAIN_PRESETS:
      preset = json.loads(json.dumps(DOMAIN_PRESETS[slug]))
      for item in preset["items"]:
        if item["id"] in used_slide_ids:
          item["id"] = f"{slug}-{item['id']}"
        used_slide_ids.add(item["id"])
      preset["defaultSlide"] = preset["items"][0]["id"]
      domains.append(preset)
    else:
      comp_id = f"{slug}-component"
      view_id = f"{slug}-view"
      used_slide_ids.update({comp_id, view_id})
      domains.append({
          "domain": slug,
          "label": label_from_slug(slug),
          "defaultSlide": comp_id,
          "chromeMode": "standard",
          "items": [
              {"id": comp_id, "label": "component", "stageMode": "component"},
              {"id": view_id, "label": "full view", "stageMode": "view"},
          ],
      })
  return domains


def build_jig_config(
    project_name: str,
    config_path: pathlib.Path | None = None,
    domains_csv: str | None = None,
    styles_csv: str | None = None,
    libs_csv: str | None = None,
    ui_lib: str | None = None,
    motion_lib: str | None = None,
    default_theme: str | None = None,
    no_clone: bool = False,
    clone_provider: str | None = None,
    clone_service_name: str | None = None,
    clone_endpoint: str | None = None,
    clone_command: str | None = None,
) -> dict[str, Any]:
  """Build a complete jig.config.json dictionary from file + CLI overrides."""
  cfg: dict[str, Any] = {
      "projectName": project_name,
      "defaultTheme": "dark",
      "styles": [s[0] for s in STYLE_SLOTS],
      "libraries": [dict(item) for item in DEFAULT_LIBS],
      "cloneSource": {
          "enabled": True,
          "provider": "manual",
          "serviceName": "",
          "endpoint": "",
          "command": "",
          "notes": (
              "Baseline 1:1 clone slot. Swap provider to 'external-service' "
              "(or set enabled: false / pass --no-clone) when connecting an "
              "external clone service or starting greenfield."
          ),
      },
      "domains": [
          json.loads(json.dumps(DOMAIN_PRESETS["fullstack"])),
          json.loads(json.dumps(DOMAIN_PRESETS["immersive"])),
          json.loads(json.dumps(DOMAIN_PRESETS["app"])),
      ],
  }

  if config_path is not None:
    loaded = json.loads(config_path.read_text(encoding="utf-8"))
    if isinstance(loaded, dict):
      cfg.update(loaded)
      if not cfg.get("projectName"):
        cfg["projectName"] = project_name

  if default_theme in ("dark", "light"):
    cfg["defaultTheme"] = default_theme

  if domains_csv:
    parsed_domains = parse_csv_tokens(domains_csv)
    if parsed_domains:
      cfg["domains"] = build_domains_from_list(parsed_domains)

  if styles_csv:
    parsed_styles = [slugify_id(s) for s in parse_csv_tokens(styles_csv)]
    if parsed_styles:
      cfg["styles"] = parsed_styles

  if no_clone:
    cfg["styles"] = [s for s in cfg["styles"] if s != "clone"]
    if not cfg["styles"]:
      cfg["styles"] = ["clean"]
    cfg["cloneSource"] = {
        **cfg.get("cloneSource", {}),
        "enabled": False,
        "provider": "none",
    }

  if libs_csv is not None or ui_lib is not None or motion_lib is not None:
    tokens: list[str] = []
    if libs_csv is not None:
      raw_tokens = parse_csv_tokens(libs_csv)
      if len(raw_tokens) == 1 and raw_tokens[0].lower() in ("none", "off", "empty"):
        tokens = []
      else:
        tokens.extend(raw_tokens)
    if ui_lib and ui_lib.lower() not in ("none", "vanilla"):
      tokens.extend(parse_csv_tokens(ui_lib))
    if motion_lib and motion_lib.lower() not in ("none", "off"):
      tokens.extend(parse_csv_tokens(motion_lib))
    seen: set[str] = set()
    lib_items: list[dict[str, str]] = []
    for tok in tokens:
      lid = slugify_id(tok)
      if lid not in seen:
        seen.add(lid)
        lib_items.append({"id": lid, "label": label_from_slug(tok)})
    cfg["libraries"] = lib_items

  cs = dict(cfg.get("cloneSource", {}))
  if clone_provider:
    cs["provider"] = clone_provider
    cs["enabled"] = clone_provider != "none"
    if cs["enabled"] and not no_clone and "clone" not in cfg["styles"]:
      cfg["styles"] = ["clone", *cfg["styles"]]
  if clone_service_name is not None:
    cs["serviceName"] = clone_service_name
  if clone_endpoint is not None:
    cs["endpoint"] = clone_endpoint
  if clone_command is not None:
    cs["command"] = clone_command
  cfg["cloneSource"] = cs

  return cfg


def write_custom_style_default_md(slot_id: str, dst_path: pathlib.Path) -> None:
  label = title_from_slug(slot_id)
  content = f"""---
style: {slot_id}
label: {label}
primary_font: Instrument Sans
secondary_font: Hanken Grotesk
mono_font: JetBrains Mono
accent_dark: "#10b981"
accent_light: "#0f766e"
---

# {label} Style Direction (`styles/{slot_id}/default.md`)

Describe the color palette, typography, border radius, elevation, and motion character for the **{slot_id}** slot here — or drop 1 to 5 reference screenshots directly into `styles/{slot_id}/` to populate the right-edge donor notches automatically.
"""
  dst_path.write_text(content, encoding="utf-8")


def scaffold_fresh_harness(
    project_dir: pathlib.Path,
    overwrite: bool = False,
) -> dict:
  """Scaffold a complete fresh Golden Template Jig project from examples/jig-harness/."""
  if not HARNESS_EXAMPLE_DIR.exists():
    raise FileNotFoundError(
        f"Canonical blank-stage Jig harness not found at {HARNESS_EXAMPLE_DIR}"
    )

  copied_files: list[str] = []
  pkg_slug = slugify_package_name(project_dir.name)
  human_title = title_from_slug(project_dir.name)

  src_pkg = HARNESS_EXAMPLE_DIR / "package.json"
  dst_pkg = project_dir / "package.json"
  if src_pkg.exists() and (overwrite or not dst_pkg.exists()):
    pkg_data = json.loads(src_pkg.read_text(encoding="utf-8"))
    pkg_data["name"] = pkg_slug
    dst_pkg.write_text(json.dumps(pkg_data, indent=2) + "\n", encoding="utf-8")
    copied_files.append("package.json")

  src_html = HARNESS_EXAMPLE_DIR / "index.html"
  dst_html = project_dir / "index.html"
  if src_html.exists() and (overwrite or not dst_html.exists()):
    html_text = src_html.read_text(encoding="utf-8")
    html_text = re.sub(
        r"<title>.*?</title>",
        f"<title>{human_title} — Design Kit Jig</title>",
        html_text,
        count=1,
        flags=re.S,
    )
    dst_html.write_text(html_text, encoding="utf-8")
    copied_files.append("index.html")

  for cfg_name in ("tsconfig.json", "vite.config.ts", "jig.config.json"):
    src_cfg = HARNESS_EXAMPLE_DIR / cfg_name
    dst_cfg = project_dir / cfg_name
    if src_cfg.exists() and (overwrite or not dst_cfg.exists()):
      shutil.copyfile(src_cfg, dst_cfg)
      copied_files.append(cfg_name)

  src_tree = HARNESS_EXAMPLE_DIR / "src"
  if src_tree.exists():
    for item in sorted(src_tree.rglob("*")):
      rel_parts = item.relative_to(HARNESS_EXAMPLE_DIR).parts
      if any(part in SKIP_DIR_NAMES or part.startswith(".") for part in rel_parts):
        continue
      dst_item = project_dir / item.relative_to(HARNESS_EXAMPLE_DIR)
      if item.is_dir():
        dst_item.mkdir(parents=True, exist_ok=True)
      elif item.is_file() and (overwrite or not dst_item.exists()):
        dst_item.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(item, dst_item)
        copied_files.append(str(dst_item.relative_to(project_dir)))

  return {
      "fresh_scaffolded": True,
      "package_name": pkg_slug,
      "harness_source": str(HARNESS_EXAMPLE_DIR),
      "copied_fresh_files": copied_files,
  }


def save_back_jig_shell(source_project_dir: pathlib.Path) -> dict:
  """Copy core Jig shell components from a master project back into examples/jig-harness/src/components/."""
  source_project_dir = source_project_dir.resolve()
  src_components_dir = source_project_dir / "src" / "components"
  if not src_components_dir.exists():
    raise FileNotFoundError(
        f"Source components directory not found: {src_components_dir}"
    )

  dst_components_dir = HARNESS_EXAMPLE_DIR / "src" / "components"
  dst_components_dir.mkdir(parents=True, exist_ok=True)

  saved_back: list[str] = []
  skipped_missing: list[str] = []
  domain_import_warnings: list[str] = []

  for comp_name in CORE_JIG_SHELL_COMPONENTS:
    src_comp = src_components_dir / comp_name
    if not src_comp.exists():
      skipped_missing.append(comp_name)
      continue

    text = src_comp.read_text(encoding="utf-8", errors="ignore")
    flagged = [tok for tok in DOMAIN_IMPORT_DENYLIST if tok in text]
    if flagged:
      domain_import_warnings.append(
          f"{comp_name}: skipped write-back due to domain-specific references {flagged}"
      )
      continue

    dst_comp = dst_components_dir / comp_name
    shutil.copyfile(src_comp, dst_comp)
    saved_back.append(str(dst_comp.relative_to(CANONICAL_ROOT)))

  return {
      "save_back_from": str(source_project_dir),
      "target_harness": str(HARNESS_EXAMPLE_DIR),
      "saved_back_components": saved_back,
      "skipped_missing_source_components": skipped_missing,
      "domain_import_warnings": domain_import_warnings,
  }


def init_style_jig(
    project_dir: pathlib.Path,
    copy_component: bool = True,
    copy_vanilla: bool = False,
    overwrite: bool = False,
    fresh: bool = False,
    jig_config: dict[str, Any] | None = None,
    has_custom_config: bool = False,
) -> dict:
  project_dir = project_dir.resolve()
  project_dir.mkdir(parents=True, exist_ok=True)

  pkg_slug = slugify_package_name(project_dir.name)
  cfg = jig_config or build_jig_config(project_name=pkg_slug)

  # Auto-activate --fresh when package.json is absent and --vanilla is not requested
  auto_fresh = not (project_dir / "package.json").exists() and not copy_vanilla
  use_fresh = fresh or auto_fresh
  fresh_report = None
  if use_fresh:
    fresh_report = scaffold_fresh_harness(project_dir, overwrite=overwrite)

  # Always persist jig.config.json (overwrite when custom CLI/config flags are supplied or --overwrite)
  jig_config_path = project_dir / "jig.config.json"
  if has_custom_config or overwrite or not jig_config_path.exists():
    jig_config_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")

  active_styles: list[str] = list(cfg.get("styles") or [s[0] for s in STYLE_SLOTS])
  active_libs: list[dict[str, str]] = list(cfg.get("libraries", DEFAULT_LIBS))
  active_domains: list[dict[str, Any]] = list(cfg.get("domains") or [])
  clone_source: dict[str, Any] = dict(cfg.get("cloneSource") or {"enabled": True, "provider": "manual"})

  styles_root = project_dir / "styles"
  styles_root.mkdir(parents=True, exist_ok=True)

  stale_imm = styles_root / "immersive"
  if overwrite and stale_imm.exists() and not scan_folder_images(stale_imm):
    shutil.rmtree(stale_imm, ignore_errors=True)

  created_folders = []
  created_default_mds = []
  manifest_slots = {}

  for slot_id in active_styles:
    core_prompt = BUILTIN_STYLE_PROMPTS.get(
        slot_id,
        f"Custom style direction '{slot_id}' defined in styles/{slot_id}/default.md or donor screenshots.",
    )
    slot_dir = styles_root / slot_id
    slot_dir.mkdir(parents=True, exist_ok=True)
    gitkeep = slot_dir / ".gitkeep"
    if not gitkeep.exists():
      gitkeep.write_text("", encoding="utf-8")

    default_md_rel = None
    default_meta = {}
    if slot_id != "clone":
      src_default_md = DEFAULTS_ROOT / slot_id / "default.md"
      dst_default_md = slot_dir / "default.md"
      if src_default_md.exists() and (overwrite or not dst_default_md.exists()):
        shutil.copyfile(src_default_md, dst_default_md)
      elif not src_default_md.exists() and (overwrite or not dst_default_md.exists()):
        write_custom_style_default_md(slot_id, dst_default_md)
      if dst_default_md.exists():
        default_md_rel = f"styles/{slot_id}/default.md"
        created_default_mds.append(default_md_rel)
        default_meta = parse_default_md_frontmatter(dst_default_md)

    images = scan_folder_images(slot_dir)
    created_folders.append(str(slot_dir.relative_to(project_dir)))
    manifest_slots[slot_id] = {
        "id": slot_id,
        "core_prompt": core_prompt,
        "folder": f"styles/{slot_id}",
        "default_md": default_md_rel,
        "donor_images": images,
        "active_source": (
            f"styles/{slot_id}/{images[0]}"
            if images
            else (default_md_rel if default_md_rel else "clone-baseline")
        ),
        "tokens": default_meta,
    }

  for sub in ("reference/desktop", "reference/mobile", "imprint/desktop", "imprint/mobile"):
    d = project_dir / sub
    d.mkdir(parents=True, exist_ok=True)
    gk = d / ".gitkeep"
    if not gk.exists():
      gk.write_text("", encoding="utf-8")
    created_folders.append(sub)

  readme_path = styles_root / "README.md"
  if has_custom_config or overwrite or not readme_path.exists():
    readme_lines = [
        f"# Workspace Style Donor Folders (`style-jig` — {len(active_styles)} Configured Slots)",
        "",
        "Your configured styles are driven by `jig.config.json`. Add, rename, or remove style slots at any time:",
        "- **Drop image screen grabs (`.png`, `.jpg`, `.jpeg`, `.webp`) into `styles/<slot>/`**: extracts visual DNA into up to 5 right-edge donor notches.",
        "- **No images yet**: reads **`styles/<slot>/default.md`** automatically.",
        "",
        "| Order | Folder | Fallback Prompt File | Core Prompt Mandate |",
        "| :---: | :--- | :--- | :--- |",
    ]
    for idx, slot_id in enumerate(active_styles, start=1):
      core_prompt = manifest_slots[slot_id]["core_prompt"]
      fallback_col = (
          "`— (1:1 clone baseline)`"
          if slot_id == "clone"
          else f"[`styles/{slot_id}/default.md`]({slot_id}/default.md)"
      )
      readme_lines.append(
          f"| {idx} | `styles/{slot_id}/` | {fallback_col} | {core_prompt} |"
      )
    readme_lines.append("")
    readme_path.write_text("\n".join(readme_lines), encoding="utf-8")

  manifest_path = styles_root / "styles-manifest.json"
  if has_custom_config or overwrite or not manifest_path.exists():
    manifest_data = {
        "agent": "jig-agent",
        "recorderSubagent": "jig-recorder",
        "skill": "style-jig",
        "configFile": "jig.config.json",
        "zIndex": 2147483640,
        "safeZonePaddingPx": 66,
        "defaultTheme": cfg.get("defaultTheme", "dark"),
        "uiLibraries": [item["id"] for item in active_libs],
        "motionLibraries": ["motion-craft"],
        "bottomControls": ["motion-craft", "playback", "record", "trace", "prompt", "open"],
        "autopilotCursor": ".ap-cursor",
        "recordControl": "[data-jig-record-toggle='true']",
        "traceControl": "[data-jig-action='trace']",
        "promptControl": "[data-jig-action='prompt']",
        "openControl": "[data-jig-action='open']",
        "standaloneParams": ["app", "slide", "style", "variant", "theme", "lib", "nojig"],
        "recordScript": "scripts/record_and_eval_jig.py",
        "cloneSource": clone_source,
        "domains": [d["domain"] for d in active_domains],
        "themes": {
            "dark": {"bg": "#000000", "plate": "#151514", "fg": "#ededec"},
            "light": {"bg": "#faf9f6", "plate": "#e7e5df", "fg": "#18181b"},
        },
        "immersiveAutoDetect": [
            d["domain"] for d in active_domains if d.get("chromeMode") == "immersive"
        ],
        "autoTraveler": "autopilot-cursor-and-dom-introspection",
        "slotsOrder": active_styles,
        "slots": manifest_slots,
    }
    manifest_path.write_text(
        json.dumps(manifest_data, indent=2) + "\n", encoding="utf-8"
    )

  copied_component_path = None
  src_dir = project_dir / "src"
  comp_dir = src_dir / "components"
  if (
      not use_fresh
      and copy_component
      and src_dir.exists()
      and not (comp_dir / "DesignKitJigBars.tsx").exists()
  ):
    comp_dir.mkdir(parents=True, exist_ok=True)
    target_tsx = comp_dir / "TopStyleJig.tsx"
    if TEMPLATE_TSX.exists() and (overwrite or not target_tsx.exists()):
      shutil.copyfile(TEMPLATE_TSX, target_tsx)
      copied_component_path = str(target_tsx.relative_to(project_dir))

  copied_vanilla_files = []
  if copy_vanilla:
    jig_dir = project_dir / "jig"
    jig_dir.mkdir(parents=True, exist_ok=True)
    for src_f in (TEMPLATE_CSS, TEMPLATE_JS, TEMPLATE_VN_CSS, TEMPLATE_VN_JS):
      if src_f.exists():
        dst_f = jig_dir / src_f.name
        if overwrite or not dst_f.exists():
          shutil.copyfile(src_f, dst_f)
          copied_vanilla_files.append(str(dst_f.relative_to(project_dir)))

  result = {
      "project_dir": str(project_dir),
      "fresh_mode": use_fresh,
      "auto_fresh_triggered": auto_fresh,
      "jig_config_path": str(jig_config_path.relative_to(project_dir)),
      "configured_domains": [d["domain"] for d in active_domains],
      "configured_styles": active_styles,
      "configured_libraries": [item["id"] for item in active_libs],
      "clone_source": clone_source,
      "created_folders": created_folders,
      "created_default_mds": created_default_mds,
      "manifest_path": str(manifest_path.relative_to(project_dir)),
      "copied_component": copied_component_path,
      "copied_vanilla_files": copied_vanilla_files,
  }
  if fresh_report:
    result["fresh_scaffold"] = fresh_report
  return result


def main() -> None:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument(
      "project_dir",
      nargs="?",
      type=pathlib.Path,
      help="Target project workspace directory (optional when using --save-back-from alone)",
  )
  parser.add_argument(
      "--fresh",
      action="store_true",
      help="Scaffold a complete fresh Golden Template Jig project from examples/jig-harness/ (auto-activates when <project-dir>/package.json is absent and --vanilla is not set)",
  )
  parser.add_argument(
      "--config",
      type=pathlib.Path,
      default=None,
      help="Path to a custom jig.config.json specifying your own domains, slides, styles, libraries, and cloneSource",
  )
  parser.add_argument(
      "--domains",
      default=None,
      help="Comma-separated slide domains/types (e.g. 'landing,checkout' or presets: fullstack,immersive,app,landing,dashboard,component,mobile,3d)",
  )
  parser.add_argument(
      "--styles",
      default=None,
      help="Comma-separated style slots (defaults to clone..retro; pass custom names like 'warm-paper,swiss-grid,dark-studio')",
  )
  parser.add_argument(
      "--no-clone",
      action="store_true",
      help="Omit the 'clone' baseline slot for greenfield builds and set cloneSource.enabled=false",
  )
  parser.add_argument(
      "--libs",
      default=None,
      help="Comma-separated library buttons for the top plate (e.g. 'mui,gsap', 'radix,motion', 'konsta', or 'none' to show only the theme toggle)",
  )
  parser.add_argument(
      "--ui",
      default=None,
      help="Optional UI library shorthand appended to libraries (e.g. shadcn, mui, radix, konsta, tailwind, vanilla)",
  )
  parser.add_argument(
      "--motion",
      default=None,
      help="Optional motion library shorthand appended to libraries (e.g. ease, fluid, motion, gsap, none)",
  )
  parser.add_argument(
      "--theme",
      choices=("dark", "light"),
      default=None,
      help="Default stage polarity (dark #000000 or light #FAF9F6)",
  )
  parser.add_argument(
      "--clone-provider",
      choices=("none", "manual", "screenshot", "html-file", "external-service"),
      default=None,
      help="Configure how the baseline 'clone' slot is populated (ready for external clone services)",
  )
  parser.add_argument(
      "--clone-service-name",
      default=None,
      help="Optional name of an external clone service written into jig.config.json",
  )
  parser.add_argument(
      "--clone-endpoint",
      default=None,
      help="Optional URL or endpoint for an external clone service",
  )
  parser.add_argument(
      "--clone-command",
      default=None,
      help="Optional CLI command template for an external clone service",
  )
  parser.add_argument(
      "--save-back-from",
      type=pathlib.Path,
      default=None,
      help="Copy core Jig shell components (DesignKitJigBars.tsx, VariantNotchesRail.tsx, EmptyStageBay.tsx, ParameterInspectorDrawer.tsx) from <source-project-dir> back into examples/jig-harness/src/components/",
  )
  parser.add_argument(
      "--no-component",
      action="store_true",
      help="Skip copying TopStyleJig.tsx into src/components/TopStyleJig.tsx on existing React apps",
  )
  parser.add_argument(
      "--vanilla",
      action="store_true",
      help="Copy standalone style-jig.css and style-jig-runtime.js into <project>/jig/ instead of fresh React scaffolding",
  )
  parser.add_argument(
      "--overwrite",
      action="store_true",
      help="Overwrite existing default.md, jig.config.json, styles-manifest.json, and scaffolded harness files",
  )
  args = parser.parse_args()

  if args.project_dir is None and args.save_back_from is None:
    parser.error("Provide <project_dir> and/or --save-back-from <source-project-dir>.")

  output: dict = {}
  if args.save_back_from is not None:
    output["save_back"] = save_back_jig_shell(args.save_back_from)

  if args.project_dir is not None:
    has_custom = any([
        args.config is not None,
        args.domains is not None,
        args.styles is not None,
        args.libs is not None,
        args.ui is not None,
        args.motion is not None,
        args.theme is not None,
        args.no_clone,
        args.clone_provider is not None,
        args.clone_service_name is not None,
        args.clone_endpoint is not None,
        args.clone_command is not None,
    ])
    cfg = build_jig_config(
        project_name=slugify_package_name(args.project_dir.name),
        config_path=args.config,
        domains_csv=args.domains,
        styles_csv=args.styles,
        libs_csv=args.libs,
        ui_lib=args.ui,
        motion_lib=args.motion,
        default_theme=args.theme,
        no_clone=args.no_clone,
        clone_provider=args.clone_provider,
        clone_service_name=args.clone_service_name,
        clone_endpoint=args.clone_endpoint,
        clone_command=args.clone_command,
    )
    init_res = init_style_jig(
        args.project_dir,
        copy_component=not args.no_component,
        copy_vanilla=args.vanilla,
        overwrite=args.overwrite,
        fresh=args.fresh,
        jig_config=cfg,
        has_custom_config=has_custom,
    )
    if args.save_back_from is None:
      output = init_res
    else:
      output["init"] = init_res

  print(json.dumps(output, indent=2))


if __name__ == "__main__":
  main()
