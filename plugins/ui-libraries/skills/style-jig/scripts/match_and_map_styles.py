#!/usr/bin/env python3
"""Scan the 10 workspace styles/<slot>/ folders for dropped style screen grabs or fallback to styles/<slot>/default.md.

Usage:
  python3 ~/design-kit/skills/style-jig/scripts/match_and_map_styles.py <project-dir> [--prompt "..."]
"""

import argparse
import json
import math
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
SKILL_ROOT = HERE.parent
DEFAULTS_ROOT = SKILL_ROOT / "templates" / "defaults"
if not DEFAULTS_ROOT.exists():
  _alt = SKILL_ROOT.parent.parent / "plugins" / "ui-libraries" / "skills" / "style-jig" / "templates" / "defaults"
  if _alt.exists():
    DEFAULTS_ROOT = _alt

STYLE_SLOTS = [
    "clone",
    "clean",
    "grid",
    "editorial",
    "cinematic",
    "product",
    "brutal",
    "playful",
    "retro",
]

SLOT_DEFAULTS = {
    "clone": {
        "theme": "light",
        "primaryFont": "Instrument Sans",
        "secondaryFont": "Hanken Grotesk",
        "monoFont": "JetBrains Mono",
        "bg": "#FFFFFF",
        "surface": "#F8FAFC",
        "surface2": "#F1F5F9",
        "text": "#0F172A",
        "textMuted": "#475569",
        "border": "#E2E8F0",
        "brand": "#0D9488",
        "accent": "#0F766E",
        "radiusCard": "12px",
        "radiusControl": "8px",
        "corePrompt": "Base 1:1 structural and visual clone of the reference.",
    },
    "clean": {
        "theme": "light",
        "primaryFont": "Schibsted Grotesk",
        "secondaryFont": "Source Sans 3",
        "monoFont": "Fragment Mono",
        "bg": "#FAFAFA",
        "surface": "#FFFFFF",
        "surface2": "#F4F4F5",
        "text": "#18181B",
        "textMuted": "#52525B",
        "border": "#E4E4E7",
        "brand": "#059669",
        "accent": "#0D9488",
        "radiusCard": "14px",
        "radiusControl": "10px",
        "corePrompt": "Take this layout and apply a clean look and feel with a lot of open white space and very simplistic fonts.",
    },
    "grid": {
        "theme": "light",
        "primaryFont": "Bricolage Grotesque",
        "secondaryFont": "Public Sans",
        "monoFont": "Martian Mono",
        "bg": "#F5F4F0",
        "surface": "#FFFFFF",
        "surface2": "#EAE8E1",
        "text": "#111111",
        "textMuted": "#525252",
        "border": "#D6D3CB",
        "brand": "#15803D",
        "accent": "#B45309",
        "radiusCard": "2px",
        "radiusControl": "2px",
        "corePrompt": "Take this layout and apply an exposed Swiss architectural grid look and feel with visible 1px structural hairlines, crisp cell alignment, technical index coordinates, and disciplined grotesque + monospace typography.",
    },
    "editorial": {
        "theme": "light",
        "primaryFont": "Newsreader",
        "secondaryFont": "Hanken Grotesk",
        "monoFont": "IBM Plex Mono",
        "bg": "#FAF7F2",
        "surface": "#FFFDF9",
        "surface2": "#F2ECE1",
        "text": "#1F1A17",
        "textMuted": "#6B5E53",
        "border": "#E2D9CC",
        "brand": "#B84A27",
        "accent": "#9A3412",
        "radiusCard": "6px",
        "radiusControl": "4px",
        "corePrompt": "Take this layout and apply a refined magazine and archival monograph editorial look and feel with high-contrast literary serif headlines, warm cotton-paper surfaces, humanist sans UI copy, and terracotta ink accents.",
    },
    "cinematic": {
        "theme": "dark",
        "primaryFont": "Instrument Serif",
        "secondaryFont": "Albert Sans",
        "monoFont": "Commit Mono",
        "bg": "#0A0A0B",
        "surface": "#121215",
        "surface2": "#18181C",
        "text": "#F4F4F5",
        "textMuted": "#A1A1AA",
        "border": "#27272A",
        "brand": "#D97706",
        "accent": "#F59E0B",
        "radiusCard": "12px",
        "radiusControl": "8px",
        "corePrompt": "Take this layout and apply a dramatic, theatrical cinematic look and feel on a true-neutral obsidian dark stage with luminous warm amber key-lighting, smoked-glass depth, and high-contrast serif + geometric sans typography.",
    },
    "product": {
        "theme": "light",
        "primaryFont": "Outfit",
        "secondaryFont": "Atkinson Hyperlegible Next",
        "monoFont": "JetBrains Mono",
        "bg": "#F8FAF9",
        "surface": "#FFFFFF",
        "surface2": "#EFF4F2",
        "text": "#09090B",
        "textMuted": "#52525B",
        "border": "#E4E4E7",
        "brand": "#0F766E",
        "accent": "#059669",
        "radiusCard": "12px",
        "radiusControl": "8px",
        "corePrompt": "Take this layout and apply a high-craft functional SaaS product workspace look and feel with concentric border radii, tactile micro-elevation, hyper-legible UI typography, and crisp petrol-teal and emerald operational signals.",
    },
    "brutal": {
        "theme": "light",
        "primaryFont": "Big Shoulders",
        "secondaryFont": "Archivo",
        "monoFont": "Space Mono",
        "bg": "#F4F1EA",
        "surface": "#FFFFFF",
        "surface2": "#EAE5D9",
        "text": "#09090B",
        "textMuted": "#27272A",
        "border": "#09090B",
        "brand": "#DC2626",
        "accent": "#EA580C",
        "radiusCard": "0px",
        "radiusControl": "0px",
        "corePrompt": "Take this layout and apply a raw Swiss Neo-Brutalist architectural poster look and feel with stark 2px solid ink borders, hard 0px corners, solid offset block shadows, condensed industrial display type, and high-voltage vermillion red and safety-orange punch.",
    },
    "playful": {
        "theme": "light",
        "primaryFont": "Syne",
        "secondaryFont": "Figtree",
        "monoFont": "DM Mono",
        "bg": "#FFFDF5",
        "surface": "#FFFFFF",
        "surface2": "#FEF3C7",
        "text": "#18181B",
        "textMuted": "#52525B",
        "border": "#18181B",
        "brand": "#EA580C",
        "accent": "#16A34A",
        "radiusCard": "22px",
        "radiusControl": "9999px",
        "corePrompt": "Take this layout and apply an energetic, tactile, playful look and feel with warm butter-cream surfaces, generously rounded pill geometry, bouncy expressive display typography, crisp ink outlines, and joyful tangerine and meadow-green color blocks.",
    },
    "retro": {
        "theme": "light",
        "primaryFont": "Fraunces",
        "secondaryFont": "Literata",
        "monoFont": "Azeret Mono",
        "bg": "#F6EFE2",
        "surface": "#FDF9F0",
        "surface2": "#EBE0CC",
        "text": "#261E18",
        "textMuted": "#69594C",
        "border": "#C8B9A2",
        "brand": "#C2410C",
        "accent": "#B45309",
        "radiusCard": "4px",
        "radiusControl": "4px",
        "corePrompt": "Take this layout and apply a nostalgic 1970s archival print, risograph, and analog studio manual look and feel with warm sun-aged stock, soft-serif display typography, stamped monospace labels, and burnt-sienna and mustard-ochre inks.",
    },
}

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def _lin(c: float) -> float:
  return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb_to_oklch(r: int, g: int, b: int) -> tuple[float, float, float]:
  rl, gl, bl = (_lin(x / 255.0) for x in (r, g, b))
  l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl
  m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl
  s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl
  l, m, s = (math.copysign(abs(x) ** (1 / 3), x) for x in (l, m, s))
  L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
  A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
  B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  C = math.hypot(A, B)
  H = math.degrees(math.atan2(B, A)) % 360
  return L, C, H


def is_banned_purple(r: int, g: int, b: int) -> bool:
  L, C, H = rgb_to_oklch(r, g, b)
  return C >= 0.04 and 270.0 <= H <= 330.0 and 0.08 < L < 0.98


def parse_default_md(md_path: pathlib.Path, fallback: dict) -> dict:
  """Read frontmatter and core mandate from styles/<slot>/default.md."""
  result = dict(fallback)
  if not md_path.exists():
    return result
  text = md_path.read_text(encoding="utf-8", errors="ignore")
  m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
  if m:
    key_map = {
        "theme": "theme",
        "primary_font": "primaryFont",
        "secondary_font": "secondaryFont",
        "mono_font": "monoFont",
        "bg": "bg",
        "surface": "surface",
        "surface_2": "surface2",
        "text": "text",
        "text_muted": "textMuted",
        "border": "border",
        "brand": "brand",
        "accent": "accent",
        "radius_card": "radiusCard",
        "radius_control": "radiusControl",
    }
    for line in m.group(1).splitlines():
      if ":" not in line:
        continue
      k, v = line.split(":", 1)
      k_clean = k.strip()
      v_clean = v.strip().strip('"').strip("'")
      if k_clean in key_map and v_clean:
        result[key_map[k_clean]] = v_clean

  mandate = re.search(r">\s*\*\*Core (?:Mandate|Prompt)\*\*:\s*\"?([^\n\"]+)\"?", text)
  if mandate:
    result["corePrompt"] = mandate.group(1).strip()
  return result


def analyze_donor_image(img_path: pathlib.Path, fallback: dict) -> dict:
  """Extract dominant background polarity and safe non-purple accent from a donor image."""
  try:
    from PIL import Image  # type: ignore

    with Image.open(img_path) as im:
      im = im.convert("RGB").resize((64, 64))
      pixels = list(im.getdata())
    avg_r = sum(p[0] for p in pixels) // len(pixels)
    avg_g = sum(p[1] for p in pixels) // len(pixels)
    avg_b = sum(p[2] for p in pixels) // len(pixels)
    L, _, _ = rgb_to_oklch(avg_r, avg_g, avg_b)
    is_dark = L < 0.38

    best_accent = fallback["brand"]
    best_c = 0.0
    for r, g, b in pixels[::4]:
      if is_banned_purple(r, g, b):
        continue
      pl, pc, ph = rgb_to_oklch(r, g, b)
      if 240.0 <= ph <= 335.0:
        continue
      if 0.35 <= pl <= 0.82 and pc > best_c and pc >= 0.08:
        best_c = pc
        best_accent = f"#{r:02X}{g:02X}{b:02X}"

    result = dict(fallback)
    result["donorImage"] = img_path.name
    result["theme"] = "dark" if is_dark else "light"
    if is_dark:
      result["bg"] = "#0A0A0B"
      result["surface"] = "#121215"
      result["surface2"] = "#18181C"
      result["text"] = "#FAFAFA"
      result["textMuted"] = "#A1A1AA"
      result["border"] = "#27272A"
    result["brand"] = best_accent
    return result
  except Exception:
    res = dict(fallback)
    res["donorImage"] = img_path.name
    return res


def map_project_styles(project_dir: pathlib.Path, prompt: str = "") -> dict:
  project_dir = project_dir.resolve()
  styles_root = project_dir / "styles"
  styles_root.mkdir(parents=True, exist_ok=True)

  mapped_slots = {}
  for slot_id in STYLE_SLOTS:
    slot_dir = styles_root / slot_id
    slot_dir.mkdir(parents=True, exist_ok=True)

    # Ensure default.md exists for clean..immersive
    default_md_path = slot_dir / "default.md"
    if slot_id != "clone" and not default_md_path.exists():
      tpl_md = DEFAULTS_ROOT / slot_id / "default.md"
      if tpl_md.exists():
        default_md_path.write_text(tpl_md.read_text(encoding="utf-8"), encoding="utf-8")

    base_cfg = parse_default_md(default_md_path, SLOT_DEFAULTS[slot_id])
    images = sorted(
        f for f in slot_dir.iterdir() if f.is_file() and f.suffix.lower() in IMAGE_EXTS
    )
    if images:
      selected = images[0]
      slot_cfg = analyze_donor_image(selected, base_cfg)
      slot_cfg["mode"] = "image-donor"
      slot_cfg["donorSource"] = f"styles/{slot_id}/{selected.name}"
      slot_cfg["defaultMd"] = (
          f"styles/{slot_id}/default.md" if slot_id != "clone" else None
      )
      slot_cfg["availableDonors"] = [f.name for f in images]
    else:
      slot_cfg = base_cfg
      slot_cfg["donorImage"] = None
      slot_cfg["mode"] = "clone-baseline" if slot_id == "clone" else "default-md-prompt"
      slot_cfg["donorSource"] = (
          "clone-baseline" if slot_id == "clone" else f"styles/{slot_id}/default.md"
      )
      slot_cfg["defaultMd"] = (
          f"styles/{slot_id}/default.md" if slot_id != "clone" else None
      )
      slot_cfg["availableDonors"] = []
    mapped_slots[slot_id] = slot_cfg

  manifest = {
      "agent": "jig-agent",
      "skill": "style-jig",
      "prompt": prompt,
      "zIndex": 2147483640,
      "safeZonePaddingPx": 76,
      "uiLibraries": ["shadcn", "ease", "fluid"],
      "motionLibraries": ["motion-craft"],
      "immersiveAutoDetect": ["3d", "parallax", "shader"],
      "autoTraveler": "unscripted-dom-introspection",
      "slots": mapped_slots,
  }

  manifest_path = styles_root / "styles-manifest.json"
  manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
  return manifest


def main() -> None:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument("project_dir", type=pathlib.Path, help="Target project directory")
  parser.add_argument("--prompt", default="", help="Optional prompt context")
  args = parser.parse_args()

  manifest = map_project_styles(args.project_dir, prompt=args.prompt)
  print(
      json.dumps(
          {
              "project_dir": str(args.project_dir.resolve()),
              "manifest": str((args.project_dir.resolve() / "styles" / "styles-manifest.json")),
              "slots": list(manifest["slots"].keys()),
          },
          indent=2,
      )
  )


if __name__ == "__main__":
  main()
