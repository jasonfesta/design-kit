#!/usr/bin/env python3
"""Builds the minimal, airy, left-aligned lowercase skills catalog (README.md, catalog.json, index.html, _agents/skills.json)."""

import argparse
import html
import json
import pathlib

X20_BASE_URL = "https://jfesta.users.x20web.corp.google.com/www/skills"


def safe_write_text(path: pathlib.Path, content: str) -> None:
  """Writes text safely, avoiding writes if identical and ignoring read-only bind mount errors."""
  try:
    if path.exists() and path.read_text(encoding="utf-8") == content:
      return
    path.write_text(content, encoding="utf-8")
  except OSError as exc:
    print(f"[WARN] read-only or unwritable, skipped: {path} ({exc.strerror})")


SKILL_ORDER = [
    "jason-design-agent",
    "jason-dev-agent",
    "skill-maker",
    "google-font-selection",
    "golden-template",
    "concept-art",
    "research",
    "style-direction",
    "image-gen",
    "polish",
    "eval",
    "nanofy",
    "url-variant",
    "image-to-react",
    "replicate-mock",
    "nano-banana",
    "responsiveness",
    "interaction",
    "feel",
    "font-pairing",
    "accessibility",
    "design-critique",
    "warmup",
    "taxonomy",
]

DISPLAY_NAMES = {
    "jason-design-agent": "jason design agent",
    "jason-dev-agent": "jason dev agent",
    "skill-maker": "skill maker",
    "google-font-selection": "font selector",
    "golden-template": "golden template",
    "concept-art": "concept art",
    "research": "research",
    "style-direction": "style direction",
    "image-gen": "image gen",
    "polish": "polish",
    "eval": "eval",
    "image-to-react": "image to react",
    "replicate-mock": "replicate mock",
    "nano-banana": "nano banana",
    "responsiveness": "responsiveness",
    "interaction": "interaction",
    "feel": "feel",
    "font-pairing": "font pairing",
    "accessibility": "accessibility",
    "design-critique": "design critique",
    "nanofy": "nanofy",
    "url-variant": "url variant",
    "warmup": "warmup",
    "taxonomy": "taxonomy",
}

SHORT_DESCRIPTIONS = {
    "jason-design-agent": "runs dialed taste research, live google-font-selection, 10x pre-nano critique, 4x3 2k plates, and the #0c0c0b moodboard.",
    "jason-dev-agent": "coordinates the lowercase image-to-react agent chain across dev evals, loop a self-eval against comps, loop b talk-backs, and final handback.",
    "skill-maker": "audits, validates, and packages agent skills for deployment.",
    "google-font-selection": "ranks the top five google fonts for any keyword, brief, or image.",
    "golden-template": "standardizes react projects and links folders to the dating template.",
    "concept-art": "turns a prompt into 5 standout benchmarks, named style range, and 2K concept plates.",
    "research": "screenshots and documents 5 standout non-beige benchmarks across full-length desktop and mobile pages.",
    "style-direction": "synthesizes web-safe and companion google fonts, 8-token palettes, canon.md, and copy tables.",
    "image-gen": "locks prompt 01 first and renders drift-free 2K nano banana 2 plates within 3 rounds.",
    "polish": "runs surgical nano banana 2 edits on failing 2k plates in rounds 2 and 3 only.",
    "eval": "audits 2K plates across 6 style, originality, canon, framing, and round gates.",
    "image-to-react": "builds bucket-first react apps in jason-dev-agent with turn tracking and jason-design-agent talk-backs.",
    "replicate-mock": "extracts hex tokens, pixel measurements, and 3-bucket dom vs. image crops (credited to manasababu).",
    "nano-banana": "upgrades only upscale-queue image buckets to 2x retina and verifies non-blur readiness.",
    "responsiveness": "evaluates desktop, mobile, and six fluid viewports in one shared dom.",
    "interaction": "wires every control plus sliders, pagination, scroll points, and animation triggers.",
    "feel": "verifies 60fps scrolling, tactile press response, gpu motion curves, and zero layout shift.",
    "font-pairing": "locks primary (headlines), secondary (body + ui), and one optional tertiary accent family with a modular scale.",
    "accessibility": "enforces wcag 2.2 type sizes, line height, contrast, 24/44px targets, focus, names, alt, and lang in the built dom.",
    "design-critique": "runs jason-design-agent critiques upfront, during jason-dev-agent talk-backs, and as the final output.",
    "nanofy": "intakes a folder of plates + prompt MDs, nanofies them (anchored 0.1-0.5 take), and curates the moodboard for jason-dev-agent.",
    "url-variant": "captures full-length desktop and mobile screenshots + dom text via chrome devtools, generates a unique nano banana 2.1 variant (new text, colors, fonts, zero flutter/artifacts), and scores uniqueness vs. quality.",
    "warmup": "benchmarks image-to-react builds across models on a 100-point rubric.",
    "taxonomy": "classifies prompts, screens, and builds into the locked 3-category, 15-subcategory wda taxonomy.",
}


def load_skill_manifests(root: pathlib.Path) -> list[dict]:
  """Loads skill.json from all skill directories in canonical order."""
  manifests = {}
  for entry in sorted(root.iterdir()):
    if entry.is_dir() and not entry.is_symlink() and entry.name in SKILL_ORDER:
      sj = entry / "skill.json"
      if sj.exists():
        manifests[entry.name] = json.loads(sj.read_text(encoding="utf-8"))
  return [manifests[slug] for slug in SKILL_ORDER if slug in manifests]


def discover_all_skill_dirs(root: pathlib.Path) -> list[str]:
  """Discovers all workspace directories containing SKILL.md (ordered with SKILL_ORDER first)."""
  found = [
      entry.name
      for entry in sorted(root.iterdir())
      if entry.is_dir()
      and not entry.is_symlink()
      and not entry.name.startswith((".", "_"))
      and (entry / "SKILL.md").exists()
  ]
  ordered = [s for s in SKILL_ORDER if s in found]
  extras = [s for s in found if s not in ordered]
  return ordered + extras


def write_workspace_manifests(root: pathlib.Path, skills: list[dict]) -> None:
  """Writes catalog.json, _agents/{skills,agents}.json, and .agents/{skills,agents}.json."""
  coord_agents = []
  agents_dir = root / "_agents" / "agents"
  if agents_dir.exists():
    coord_agents = [p.stem for p in sorted(agents_dir.glob("*.md"))]
  stage_agents = [
      s["id"] for s in skills if (root / s["id"] / "agent.md").exists()
  ]

  catalog = {
      "workspace": "/usr/local/google/home/jfesta/design-kit/skills",
      "x20_url": f"{X20_BASE_URL}/index.html",
      "total_skills": len(skills),
      "coordinator_agents": coord_agents,
      "stage_agents": stage_agents,
      "core_skills": [s["id"] for s in skills if not s.get("is_subskill")],
      "sub_skills": {
          "concept-art": [
              "research",
              "style-direction",
              "image-gen",
              "polish",
              "eval",
              "design-critique",
          ],
          "image-to-react": [
              "replicate-mock",
              "nano-banana",
              "responsiveness",
              "interaction",
              "feel",
              "design-critique",
          ],
      },
      "skills": skills,
  }
  safe_write_text(root / "catalog.json", json.dumps(catalog, indent=2) + "\n")

  all_skill_dirs = discover_all_skill_dirs(root)
  skills_json = {
      "entries": [{"path": "."}] + [{"path": sid} for sid in all_skill_dirs]
  }
  agents_json = {
      "entries": [
          {
              "path": str(root),
              "exclude": [
                  "_agents",
                  "\\.agents",
                  "jason-design-agent",
                  "jason-dev-agent",
              ],
          },
          {
              "path": str(root / "_agents" / "agents"),
          },
      ]
  }
  for folder in ("_agents", ".agents"):
    d = root / folder
    d.mkdir(exist_ok=True)
    safe_write_text(d / "skills.json", json.dumps(skills_json, indent=2) + "\n")
    safe_write_text(d / "agents.json", json.dumps(agents_json, indent=2) + "\n")


def write_root_readme(root: pathlib.Path, skills: list[dict]) -> None:
  """Generates a minimal left-aligned lowercase README.md with download, agent.md, and skill.md links."""
  blocks = []
  if (root / "_agents" / "agents" / "jason-design-agent.md").exists():
    blocks.append(
        "### jason design agent\n"
        "runs dialed taste research, live google-font-selection, 10x pre-nano critique, 4x3 2k plates, and the #0c0c0b moodboard.\n"
        "[download](./jason-design-agent.skill) · [skill.md](./jason-design-agent/SKILL.md) · [agent.md](./_agents/agents/jason-design-agent.md) · [agents.md](./AGENTS.md)"
    )
  if (root / "_agents" / "agents" / "jason-dev-agent.md").exists():
    blocks.append(
        "### jason dev agent\n"
        "coordinates the lowercase image-to-react agent chain across dev evals, loop a self-eval against comps, and paired jason-design-agent critiques.\n"
        "[download](./jason-dev-agent.skill) · [skill.md](./jason-dev-agent/SKILL.md) · [agent.md](./_agents/agents/jason-dev-agent.md) · [agents.md](./AGENTS.md)"
    )
  for s in skills:
    sid = s["id"]
    if sid in ("jason-design-agent", "jason-dev-agent"):
      continue
    name = DISPLAY_NAMES.get(sid, sid)
    desc = SHORT_DESCRIPTIONS.get(sid, s.get("short_summary", "")).lower()
    agent_part = f" · [agent.md](./{sid}/agent.md)" if (root / sid / "agent.md").exists() else ""
    blocks.append(
        f"### {name}\n"
        f"{desc}\n"
        f"[download](./{sid}.skill){agent_part} · [skill.md](./{sid}/SKILL.md)"
    )

  readme = "# skills & agents\n\n" + "\n\n".join(blocks) + "\n"
  safe_write_text(root / "README.md", readme)


def render_skill_block(sid: str, is_sub: bool = False, root: pathlib.Path | None = None) -> str:
  """Renders a single left-aligned skill/agent block. Every link points OUT: absolute x20 URL, new tab."""
  name = DISPLAY_NAMES.get(sid, sid)
  desc = SHORT_DESCRIPTIONS.get(sid, "")
  cls = "skill sub-skill" if is_sub else "skill"
  s = html.escape(sid)
  ext = 'target="_blank" rel="noopener noreferrer"'
  agent_link = ""
  if root and (root / sid / "agent.md").exists():
    agent_link = f'\n            <a href="{X20_BASE_URL}/{s}/agent.md" {ext}>agent.md</a>'
  specimen_link = ""
  if root and (root / sid / "specimen.html").exists():
    specimen_link = f'\n            <a href="{X20_BASE_URL}/{s}/specimen.html" {ext}>specimen</a>'
  return f"""        <div class="{cls}" id="{s}">
          <h2><a href="{X20_BASE_URL}/{s}/index.html" {ext}>{html.escape(name)}</a></h2>
          <p>{html.escape(desc)}</p>
          <div class="actions">
            <a href="{X20_BASE_URL}/{s}.skill" {ext} download>download</a>{agent_link}
            <a href="{X20_BASE_URL}/{s}/SKILL.md" {ext}>skill.md</a>{specimen_link}
          </div>
        </div>"""


def write_root_index_html(root: pathlib.Path, skills: list[dict], base_href: str = "") -> str:
  """Generates an airy, designer-grade, left-aligned, lowercase, responsive page."""
  base_tag = f'\n  <base href="{base_href}" target="_blank" />' if base_href else ""

  index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />{base_tag}
  <title>skills</title>
  <style>
    :root {{
      --bg: #fcfcfa;
      --fg: #141413;
      --muted: #787774;
      --faint: #b8b7b2;
      --line: #eae9e4;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --bg: #0c0c0b;
        --fg: #ededec;
        --muted: #858481;
        --faint: #494946;
        --line: #1e1e1c;
      }}
    }}
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}
    html, body {{
      background: var(--bg);
      color: var(--fg);
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Google Sans", system-ui, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      text-align: left;
      text-transform: lowercase;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }}
    main {{
      width: 100%;
      max-width: 560px;
      margin: 0 auto;
      padding: clamp(72px, 14vh, 148px) 28px clamp(96px, 16vh, 168px);
    }}
    h1 {{
      font-size: 14px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: var(--muted);
      margin-bottom: clamp(48px, 8vh, 72px);
    }}
    .stack {{
      display: flex;
      flex-direction: column;
      gap: clamp(40px, 6vh, 52px);
    }}
    .skill h2 {{
      font-size: 15px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: var(--fg);
      margin-bottom: 5px;
    }}
    .skill h2 a {{
      color: inherit;
      text-decoration: none;
    }}
    .skill p {{
      font-size: 14px;
      line-height: 1.6;
      color: var(--muted);
      margin-bottom: 12px;
      max-width: 56ch;
      text-wrap: pretty;
    }}
    .actions {{
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 13px;
    }}
    .actions a {{
      color: var(--fg);
      text-decoration: none;
      border-bottom: 1px solid var(--line);
      padding-bottom: 1px;
      transition: border-color 0.15s ease, color 0.15s ease;
    }}
    .actions a:hover {{
      border-color: var(--fg);
    }}
    .sub-stack {{
      margin-top: 28px;
      padding-left: 20px;
      border-left: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      gap: 28px;
    }}
  </style>
</head>
<body>
  <main>
    <h1>skills &amp; agents</h1>

    <div class="stack">
        <div class="skill" id="jason-design-agent">
          <h2><a href="{X20_BASE_URL}/jason-design-agent/index.html" target="_blank" rel="noopener noreferrer">jason design agent</a></h2>
          <p>runs dialed taste research, live google-font-selection, 10x pre-nano critique, 4x3 2k plates, and the #0c0c0b moodboard.</p>
          <div class="actions">
            <a href="{X20_BASE_URL}/jason-design-agent.skill" target="_blank" rel="noopener noreferrer" download>download</a>
            <a href="{X20_BASE_URL}/jason-design-agent/SKILL.md" target="_blank" rel="noopener noreferrer">skill.md</a>
            <a href="{X20_BASE_URL}/_agents/agents/jason-design-agent.md" target="_blank" rel="noopener noreferrer">agent.md</a>
            <a href="{X20_BASE_URL}/AGENTS.md" target="_blank" rel="noopener noreferrer">agents.md</a>
          </div>
        </div>

        <div class="skill" id="jason-dev-agent">
          <h2><a href="{X20_BASE_URL}/jason-dev-agent/index.html" target="_blank" rel="noopener noreferrer">jason dev agent</a></h2>
          <p>coordinates the lowercase image-to-react agent chain across dev evals, loop a self-eval against comps, and paired jason-design-agent critiques.</p>
          <div class="actions">
            <a href="{X20_BASE_URL}/jason-dev-agent.skill" target="_blank" rel="noopener noreferrer" download>download</a>
            <a href="{X20_BASE_URL}/jason-dev-agent/SKILL.md" target="_blank" rel="noopener noreferrer">skill.md</a>
            <a href="{X20_BASE_URL}/_agents/agents/jason-dev-agent.md" target="_blank" rel="noopener noreferrer">agent.md</a>
            <a href="{X20_BASE_URL}/AGENTS.md" target="_blank" rel="noopener noreferrer">agents.md</a>
          </div>
        </div>

{render_skill_block("skill-maker", root=root)}

{render_skill_block("google-font-selection", root=root)}

{render_skill_block("golden-template", root=root)}

      <div class="skill-group">
{render_skill_block("concept-art", root=root)}
        <div class="sub-stack">
{render_skill_block("research", is_sub=True, root=root)}
{render_skill_block("style-direction", is_sub=True, root=root)}
{render_skill_block("image-gen", is_sub=True, root=root)}
{render_skill_block("polish", is_sub=True, root=root)}
{render_skill_block("eval", is_sub=True, root=root)}
{render_skill_block("design-critique", is_sub=True, root=root)}
{render_skill_block("nanofy", is_sub=True, root=root)}
        </div>
      </div>

      <div class="skill-group">
{render_skill_block("image-to-react", root=root)}
        <div class="sub-stack">
{render_skill_block("replicate-mock", is_sub=True, root=root)}
{render_skill_block("nano-banana", is_sub=True, root=root)}
{render_skill_block("responsiveness", is_sub=True, root=root)}
{render_skill_block("interaction", is_sub=True, root=root)}
{render_skill_block("feel", is_sub=True, root=root)}
{render_skill_block("font-pairing", is_sub=True, root=root)}
{render_skill_block("accessibility", is_sub=True, root=root)}
{render_skill_block("design-critique", is_sub=True, root=root)}
        </div>
      </div>

{render_skill_block("warmup", root=root)}

{render_skill_block("taxonomy", root=root)}
    </div>
  </main>
</body>
</html>
"""
  if not base_href:
    safe_write_text(root / "index.html", index_html)
  return index_html


def main():
  parser = argparse.ArgumentParser(description="Build unified Google Skills catalog.")
  parser.add_argument("--skills-root", required=True, help="Path to skills workspace root.")
  args = parser.parse_args()

  root = pathlib.Path(args.skills_root).resolve()
  skills = load_skill_manifests(root)
  write_workspace_manifests(root, skills)
  write_root_readme(root, skills)
  write_root_index_html(root, skills)
  print(f"Built minimal left-aligned catalog for {len(skills)} skills at {root}")


if __name__ == "__main__":
  main()
