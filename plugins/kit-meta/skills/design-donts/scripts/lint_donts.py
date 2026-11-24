#!/usr/bin/env python3
"""Lint design outputs against the design-kit don'ts (donts.json).

Usage:
  lint_donts.py PATH [PATH ...] [--json] [--rules donts.json] [--include-dist]

Each PATH is a file or a project folder. Passing several project folders
turns on batch checks (dark-mode ratio, unique primary font per variant).
Exit code: 1 if any error-severity finding, else 0.
"""

import argparse
import colorsys
import json
import math
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
DEFAULT_RULES = HERE.parent / "donts.json"
EXTS = {".css", ".scss", ".sass", ".less", ".html", ".htm", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".vue", ".svelte", ".json", ".svg"}
SKIP_DIRS = {"node_modules", ".git", ".next", ".vite", "coverage", ".turbo"}
SKIP_FILES = {"package-lock.json", "pnpm-lock.yaml", "yarn.lock", "donts.json"}

# ---------------------------------------------------------------- color math


def _lin(c):
  return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb_to_oklch(r, g, b):
  r, g, b = (_lin(x / 255.0) for x in (r, g, b))
  l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  l, m, s = (math.copysign(abs(x) ** (1 / 3), x) for x in (l, m, s))
  L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
  A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
  B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  C = math.hypot(A, B)
  H = math.degrees(math.atan2(B, A)) % 360
  return L, C, H


def rel_luminance(r, g, b):
  r, g, b = (_lin(x / 255.0) for x in (r, g, b))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b


HEX_RE = re.compile(r"(?<![\w&/-])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b")
RGB_RE = re.compile(r"rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)", re.I)
HSL_RE = re.compile(r"hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%", re.I)
OKLCH_RE = re.compile(r"oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)", re.I)


def parse_hex(h):
  if len(h) in (3, 4):
    h = "".join(c * 2 for c in h[:3])
  return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def iter_colors(text):
  """Yields (match_text, offset, (L, C, H), rgb_or_None)."""
  for m in HEX_RE.finditer(text):
    rgb = parse_hex(m.group(1))
    yield m.group(0), m.start(), rgb_to_oklch(*rgb), rgb
  for m in RGB_RE.finditer(text):
    rgb = tuple(min(255.0, float(x)) for x in m.groups())
    yield m.group(0), m.start(), rgb_to_oklch(*rgb), rgb
  for m in HSL_RE.finditer(text):
    h, s, l = float(m.group(1)) / 360, float(m.group(2)) / 100, float(m.group(3)) / 100
    rgb = tuple(x * 255 for x in colorsys.hls_to_rgb(h % 1, l, s))
    yield m.group(0), m.start(), rgb_to_oklch(*rgb), rgb
  for m in OKLCH_RE.finditer(text):
    L = float(m.group(1)) / (100 if m.group(2) else 1)
    yield m.group(0), m.start(), (L, float(m.group(3)), float(m.group(4))), None


# ---------------------------------------------------------------- fonts

FONT_FAMILY_RE = re.compile(r"font-family\s*:\s*([^;}{\n]+)", re.I)
GF_RE = re.compile(r"fonts\.googleapis\.com/css2?\?[^\"')\s>]+", re.I)
FONTSOURCE_RE = re.compile(r"@fontsource(?:-variable)?/([a-z0-9-]+)", re.I)
FONT_VAR_RE = re.compile(r"--font[\w-]*\s*:\s*([^;}{\n]+)", re.I)
TW_FONT_RE = re.compile(r"fontFamily\s*:\s*\{([^}]*)\}", re.I | re.S)
GENERIC = {"sans-serif", "serif", "monospace", "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace", "cursive", "fantasy", "inherit", "initial", "unset", "-apple-system", "blinkmacsystemfont", "segoe ui", "helvetica", "helvetica neue", "arial", "emoji", "apple color emoji", "segoe ui emoji", "segoe ui symbol", "noto color emoji", "math"}


def norm_font(name):
  return re.sub(r"\s+", " ", name.strip().strip("'\"").replace("+", " ")).strip()


def font_mentions(text):
  """Yields (family, offset, is_primary_slot)."""
  for rx in (FONT_FAMILY_RE, FONT_VAR_RE):
    for m in rx.finditer(text):
      val = m.group(1)
      if "var(" in val and "," not in val:
        continue
      fams = [norm_font(x) for x in val.split(",")]
      fams = [f for f in fams if f and f.lower() not in GENERIC and not f.lower().startswith("var(")]
      for i, f in enumerate(fams):
        yield f, m.start(), i == 0
  for m in GF_RE.finditer(text):
    for fam in re.findall(r"family=([^&:\"')\s]+)", m.group(0)):
      yield norm_font(fam), m.start(), True
  for m in FONTSOURCE_RE.finditer(text):
    yield norm_font(m.group(1).replace("-", " ")), m.start(), True
  for m in TW_FONT_RE.finditer(text):
    for fam in re.findall(r"['\"]([^'\"]+)['\"]", m.group(1)):
      if fam.lower() not in GENERIC:
        yield norm_font(fam), m.start(), True


def fam_match(found, banned):
  f = found.lower()
  return any(f == b.lower() for b in banned)


# ---------------------------------------------------------------- scanning


def line_of(text, off):
  return text.count("\n", 0, off) + 1


def collect_files(path, include_dist):
  p = pathlib.Path(path)
  if p.is_file():
    return [p]
  out = []
  for f in p.rglob("*"):
    if not f.is_file() or f.suffix.lower() not in EXTS or f.name in SKIP_FILES:
      continue
    parts = set(f.relative_to(p).parts)
    if parts & SKIP_DIRS or (not include_dist and "dist" in parts):
      continue
    if f.stat().st_size > 3_000_000:
      continue
    out.append(f)
  return out


def is_vendor(text):
  return text.count("\n") < 3 and len(text) > 50_000  # minified bundle


BG_DECL_RE = re.compile(r"(?:^|[;{\s])(?:background(?:-color)?|--(?:color-)?(?:background|bg|surface|canvas|page)(?:-[\w]+)?)\s*:\s*([^;}{\n]+)", re.I)
ROOT_BLOCK_RE = re.compile(r"(?::root|html|body)\s*(?:,[^{]*)?\{([^}]*)\}", re.I)


def project_is_dark(texts):
  """Heuristic: returns (is_dark, reason)."""
  joined = "\n".join(texts)
  if re.search(r"<html[^>]*class=[\"'][^\"']*\bdark\b", joined, re.I):
    return True, '<html class="dark"> forced'
  cs = re.findall(r"color-scheme\s*:\s*([a-z ]+)", joined, re.I)
  if cs and all("light" not in c.lower() for c in cs) and any("dark" in c.lower() for c in cs):
    return True, "color-scheme: dark only"
  lums = []
  for blk in ROOT_BLOCK_RE.finditer(joined):
    for d in BG_DECL_RE.finditer(blk.group(1)):
      for _, _, _, rgb in iter_colors(d.group(1)):
        if rgb:
          lums.append(rel_luminance(*rgb))
      for ok in OKLCH_RE.finditer(d.group(1)):
        L = float(ok.group(1)) / (100 if ok.group(2) else 1)
        lums.append(L ** 3)
  body_tw = re.search(r"<body[^>]*class=[\"']([^\"']*)", joined, re.I)
  if body_tw and re.search(r"\bbg-(?:black|neutral-9\d\d|zinc-9\d\d|slate-9\d\d|gray-9\d\d|stone-9\d\d)\b", body_tw.group(1)):
    return True, "body uses a near-black Tailwind background"
  if lums:
    return (lums[0] < 0.12), f"root/body background luminance {lums[0]:.3f}"
  return False, "no dark signal"


def lint(paths, rules, include_dist):
  findings = []
  projects = []
  for path in paths:
    files = collect_files(path, include_dist)
    texts, primaries, fonts_seen, counts = [], [], set(), {}
    for f in files:
      try:
        text = f.read_text(errors="ignore")
      except OSError:
        continue
      if is_vendor(text):
        continue
      texts.append(text)
      for rule in rules:
        chk = rule["check"]
        t = chk["type"]
        def add(off, msg):
          findings.append({"rule": rule["id"], "severity": rule["severity"], "file": str(f), "line": line_of(text, off), "msg": msg, "fix": rule.get("fix", "")})
        if t == "font_banned":
          for fam, off, _ in font_mentions(text):
            if fam_match(fam, chk["families"]):
              add(off, f"banned font '{fam}'")
        elif t == "font_overused":
          for fam, off, primary in font_mentions(text):
            fonts_seen.add(fam)
            if primary:
              primaries.append(fam)
            if primary and fam_match(fam, chk["families"]):
              add(off, f"over-used font '{fam}' as primary; pick something less common")
        elif t == "pattern":
          for pat in chk["patterns"]:
            for m in re.finditer(pat, text, re.I):
              add(m.start(), f"matched '{m.group(0)}'")
        elif t == "pattern_count":
          n = sum(len(re.findall(p, text, re.I)) for p in chk["patterns"])
          counts[rule["id"]] = counts.get(rule["id"], 0) + n
        elif t == "cooccur":
          hits = []
          for group in chk["groups"]:
            m = next((m for p in group for m in [re.search(p, text, re.I)] if m), None)
            if not m:
              break
            hits.append(m)
          else:
            add(hits[0].start(), "found together: " + " + ".join(repr(h.group(0)) for h in hits))
        elif t == "nav_overflow":
          for m in re.finditer(r"<nav\b[^>]*>(.*?)</nav>", text, re.I | re.S):
            n = len(re.findall(r"<(?:a|Link|NavLink|button)\b", m.group(1)))
            if n > chk.get("max_items", 7):
              add(m.start(), f"<nav> has {n} links/buttons (max {chk.get('max_items', 7)}); it will wrap at 1280px")
        elif t == "hue_banned":
          lo, hi, minc = chk["oklch_hue_min"], chk["oklch_hue_max"], chk.get("min_chroma", 0.04)
          for raw, off, (L, C, H), _ in iter_colors(text):
            if C >= minc and lo <= H <= hi and 0.08 < L < 0.98:
              add(off, f"purple-range color {raw} (oklch hue {H:.0f}°, chroma {C:.2f})")
          names = "|".join(chk.get("tailwind_classes", []))
          if names:
            for m in re.finditer(rf"\b[a-z:-]*-(?:{names})-\d{{2,3}}\b", text):
              add(m.start(), f"Tailwind purple class '{m.group(0)}'")
          imin = chk.get("tailwind_indigo_min_shade")
          if imin:
            for m in re.finditer(r"\b[a-z:-]*-indigo-(\d{3})\b", text):
              if int(m.group(1)) >= imin:
                add(m.start(), f"Tailwind indigo-violet class '{m.group(0)}'")
    for rule in rules:
      chk = rule["check"]
      if chk["type"] == "pattern_count" and counts.get(rule["id"], 0) > chk["max"]:
        findings.append({"rule": rule["id"], "severity": rule["severity"], "file": str(path), "line": 0, "msg": f"{counts[rule['id']]} matches (max {chk['max']})", "fix": rule.get("fix", "")})
    dark, why = project_is_dark(texts)
    primary = next((p for p in primaries if p), None)
    projects.append({"path": str(path), "dark": dark, "dark_reason": why, "primary_font": primary, "files": len(files)})

  for rule in rules:
    chk = rule["check"]
    if chk["type"] == "dark_default":
      for pr in projects:
        if pr["dark"]:
          findings.append({"rule": rule["id"], "severity": rule["severity"], "file": pr["path"], "line": 0, "msg": f"dark theme by default ({pr['dark_reason']}); confirm the brief calls for it", "fix": rule.get("fix", "")})
      if len(projects) > 1:
        ratio = sum(p["dark"] for p in projects) / len(projects)
        if ratio > chk.get("batch_max_dark_ratio", 0.34):
          findings.append({"rule": rule["id"], "severity": "error", "file": "(batch)", "line": 0, "msg": f"{ratio:.0%} of variants are dark (max {chk['batch_max_dark_ratio']:.0%})", "fix": rule.get("fix", "")})
    if chk["type"] == "font_overused" and chk.get("batch_unique_primary") and len(projects) > 1:
      seen = {}
      for pr in projects:
        if pr["primary_font"]:
          seen.setdefault(pr["primary_font"].lower(), []).append(pr["path"])
      for fam, ps in seen.items():
        if len(ps) > 1:
          findings.append({"rule": rule["id"], "severity": "error", "file": "(batch)", "line": 0, "msg": f"primary font '{fam}' repeated across {len(ps)} variants: {', '.join(ps)}", "fix": rule.get("fix", "")})
  return findings, projects


def main():
  ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
  ap.add_argument("paths", nargs="+")
  ap.add_argument("--rules", default=str(DEFAULT_RULES))
  ap.add_argument("--json", action="store_true")
  ap.add_argument("--include-dist", action="store_true")
  a = ap.parse_args()
  data = json.loads(pathlib.Path(a.rules).read_text())
  manual_types = (None, "judgment", "manual")
  rules = [r for r in data["rules"] if r.get("check", {}).get("type") not in manual_types]
  manual = [r for r in data["rules"] if r.get("check", {}).get("type") in manual_types]
  findings, projects = lint(a.paths, rules, a.include_dist)
  errors = sum(f["severity"] == "error" for f in findings)
  if a.json:
    print(json.dumps({"findings": findings, "projects": projects, "manual_checks": [{"id": r["id"], "title": r["title"]} for r in manual], "errors": errors}, indent=1))
  else:
    for pr in projects:
      print(f"# {pr['path']}  files={pr['files']}  primary_font={pr['primary_font']}  dark={pr['dark']} ({pr['dark_reason']})")
    if not findings:
      print("PASS: no don'ts violated.")
    by = {}
    for f in findings:
      by.setdefault(f["rule"], []).append(f)
    for rid, fs in by.items():
      print(f"\n[{fs[0]['severity'].upper()}] {rid}  ({len(fs)})  fix: {fs[0]['fix']}")
      for f in fs[:25]:
        loc = f"{f['file']}:{f['line']}" if f["line"] else f["file"]
        print(f"  - {loc}  {f['msg']}")
      if len(fs) > 25:
        print(f"  ... {len(fs) - 25} more")
    if manual:
      print("\nManual checks (not machine-lintable):")
      for r in manual:
        print(f"  [ ] {r['id']}: {r['title']}")
    print(f"\n{errors} error(s), {len(findings) - errors} warning(s)")
  sys.exit(1 if errors else 0)


if __name__ == "__main__":
  main()
