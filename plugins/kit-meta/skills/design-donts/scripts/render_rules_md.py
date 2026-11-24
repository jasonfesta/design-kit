#!/usr/bin/env python3
"""Render donts.json into the always-on markdown rule (design-donts.md).

The rule file is loaded into every agent conversation (all WDA / design-kit
projects), so the don'ts apply even when nobody invokes the skill.

Usage:
  render_rules_md.py            # writes ~/.gemini/config/rules/design-donts.md
  render_rules_md.py --check    # exit 1 if the md is stale vs donts.json
"""

import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parent / "donts.json"
OUT = pathlib.Path.home() / ".gemini/config/rules/design-donts.md"

MANUAL = {None, "judgment", "manual"}


def render(data):
  rules = data["rules"]
  errors = [r for r in rules if r["severity"] == "error"]
  warns = [r for r in rules if r["severity"] != "error"]
  out = [
      "---",
      "trigger: always_on",
      "description: Design don'ts for every WDA / design-kit build — WebDev Arena loss patterns, no eyebrow descriptor labels, no fictitious or self-referential UI, plus the taste bans. Generated from design-donts/donts.json.",
      "---",
      "",
      "# Design Don'ts — Always-On Rule for Every WDA / Design-Kit Project",
      "",
      "<!-- GENERATED from ~/design-kit/plugins/kit-meta/skills/design-donts/donts.json"
      " by scripts/render_rules_md.py. Edit donts.json, then re-run. -->",
      "",
      "Applies to **every** WebDev Arena (WDA) build, landing page, app, game, 3D scene, SVG,"
      " concept plate, prompt, and design-system output. Treat each item as a hard constraint"
      " while designing, not only at review time.",
      "",
      "**Before presenting any build:**",
      "1. Run `python3 ~/design-kit/skills/design-donts/scripts/lint_donts.py <project>` and fix every error.",
      "2. Render headless screenshots (1280px desktop + 390px mobile, plus a 3D frame if any) and look at them.",
      "3. Walk the judgment items below against the screenshots.",
      "",
      f"Updated {data.get('updated', '')} · {len(rules)} rules ({len(errors)} hard bans, {len(warns)} taste rules).",
      "",
  ]

  def block(title, rs):
    out.append(f"## {title}")
    out.append("")
    for r in rs:
      how = "judgment" if r["check"].get("type") in MANUAL else f"lint: `{r['check']['type']}`"
      out.append(f"### {r['title']}")
      out.append(f"`{r['id']}` · {how}" + (f" · {r['source']}" if r.get("source") else ""))
      out.append("")
      out.append(f"- **Why:** {r['why']}")
      out.append(f"- **Do instead:** {r['fix']}")
      hint = r["check"].get("hint")
      if hint:
        out.append(f"- **Check:** {hint}")
      out.append("")

  block("Hard bans (error — never ship)", errors)
  block("Taste rules (warn — fix or justify in the rationale)", warns)
  for s in data.get("sources", []):
    out.append(f"Source: [{s['note']}]({s['url']})")
  return "\n".join(out).rstrip() + "\n"


def main():
  md = render(json.loads(SRC.read_text()))
  if "--check" in sys.argv:
    stale = not OUT.exists() or OUT.read_text() != md
    print("STALE" if stale else "OK", OUT)
    sys.exit(1 if stale else 0)
  OUT.parent.mkdir(parents=True, exist_ok=True)
  OUT.write_text(md)
  print("wrote", OUT, len(md.splitlines()), "lines")


if __name__ == "__main__":
  main()
