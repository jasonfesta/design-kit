#!/usr/bin/env python3
"""Validates, sanitizes, documents, and wraps Google Skills for deployment."""

import argparse
import html
import json
import pathlib
import re
import zipfile

MAX_SKILL_LINES = 800
WARN_SKILL_LINES = 500
MAX_SKILL_BYTES = 46080

X20_BASE_URL = "https://jfesta.users.x20web.corp.google.com/www/skills"


def safe_write_text(path: pathlib.Path, content: str, encoding: str = "utf-8") -> None:
  """Writes text safely, avoiding writes if identical and ignoring read-only bind mount errors."""
  try:
    if path.exists() and path.read_text(encoding=encoding) == content:
      return
    path.write_text(content, encoding=encoding)
  except OSError as exc:
    print(f"[WARN] read-only or unwritable, skipped: {path} ({exc.strerror})")


# Clean, shareable metadata for each skill and sub-skill
SKILL_CATALOG_META = {
    "jason-design-agent": {
        "display_name": "jason design agent",
        "category": "coordinator skill & agent · taste research, pre-nano 10x critique, 12 2k plates & #0c0c0b moodboard",
        "icon": "🎯",
        "is_subskill": False,
        "parent_skill": None,
        "subskills": [
            "concept-art",
            "research",
            "style-direction",
            "google-font-selection",
            "image-gen",
            "polish",
            "eval",
            "design-critique",
            "nanofy",
            "url-variant",
        ],
        "short_summary": (
            "runs dialed taste research, live google-font-selection, 10-iteration "
            "pre-nano design critique, 4x3 2k concept generation, and the clean "
            "#0c0c0b lowercase moodboard with zero preview adjustments and zero "
            "default approvals."
        ),
        "when_to_use": (
            "use in jetski, cli, or yaqs/yaks when running jason-design-agent end "
            "to end from a prompt or imported folder to produce curated 2k concept "
            "plates and the #0c0c0b moodboard."
        ),
        "quick_cmd": "python3 jason-design-agent/scripts/build_moodboard.py --config=./moodboard.json --study-dir=./study",
    },
    "jason-dev-agent": {
        "display_name": "jason dev agent",
        "category": "coordinator skill & agent · developer coordinator, stage 1a-4 evals, loop a self-eval, loop b talk-backs & final handback",
        "icon": "⚡",
        "is_subskill": False,
        "parent_skill": None,
        "subskills": [
            "image-to-react",
            "replicate-mock",
            "nano-banana",
            "golden-template",
            "font-pairing",
            "accessibility",
            "responsiveness",
            "interaction",
            "feel",
            "design-critique",
            "warmup",
            "taxonomy",
        ],
        "short_summary": (
            "coordinates the lowercase image-to-react agent chain across dev evals, "
            "loop a self-eval against comps, loop b talk-backs with jason-design-agent, "
            "and final handback for design sign-off."
        ),
        "when_to_use": (
            "use in jetski, cli, or yaqs/yaks when running jason-dev-agent as the frontend "
            "developer coordinator on a curated study folder from jason-design-agent."
        ),
        "quick_cmd": "python3 jason-dev-agent/scripts/run_dev_loop.py --project=./projects/01-web",
    },
    "skill-maker": {
        "display_name": "skill maker",
        "category": "core skill · packaging & validation",
        "icon": "🛠️",
        "is_subskill": False,
        "parent_skill": None,
        "subskills": [],
        "short_summary": (
            "audits, validates, documents, and wraps agent skills into shareable "
            "google skills packages with build targets, evalin suites, html docs, "
            "and downloadable .skill / .zip archives."
        ),
        "when_to_use": (
            "use when creating a new skill, cleaning up or consolidating existing "
            "skills across workspaces, validating against google skill_creator "
            "rules, or publishing skills to ~/design-kit/skills and x20."
        ),
        "quick_cmd": "python3 skill-maker/scripts/validate_and_wrap.py --skills-root=. --fix",
    },
    "google-font-selection": {
        "display_name": "font selector",
        "category": "core skill · typography & taste",
        "icon": "🔤",
        "is_subskill": False,
        "parent_skill": None,
        "subskills": [],
        "short_summary": (
            "selects and ranks the top 5 google fonts for any keyword, phrase, or "
            "reference image using live google fonts catalog tag scores, complete "
            "with specimen urls, css2 embed tags, and an interactive specimen viewer."
        ),
        "when_to_use": (
            "use whenever you pass a keyword ('soft', 'warm editorial', "
            "'developer cli') or design brief and want 5 non-copied google font "
            "recommendations."
        ),
        "quick_cmd": 'python3 google-font-selection/scripts/recommend_google_fonts.py "warm editorial"',
    },
    "golden-template": {
        "display_name": "golden template",
        "category": "core skill · architecture & research linker",
        "icon": "🏛️",
        "is_subskill": False,
        "parent_skill": None,
        "subskills": [],
        "short_summary": (
            "standardizes react 19 + vite 7 + tailwind v4 projects using the "
            "bundled dating reference folder (assets/dating/) as the ground-truth "
            "judge for all config files, 3-tier src/ structure, and strict tsc linting."
        ),
        "when_to_use": (
            "use in jason-dev-agent when scaffolding or porting components and landing "
            "pages into golden template folders or linting against the dating blueprint."
        ),
        "quick_cmd": "node golden-template/scripts/lint-golden-template.mjs --dir=./my-workspace --fix",
    },
    "concept-art": {
        "display_name": "concept art",
        "category": "core skill · jason-design-agent upfront plan & 2k plates",
        "icon": "🧭",
        "is_subskill": False,
        "parent_skill": None,
        "subskills": [
            "research",
            "style-direction",
            "image-gen",
            "polish",
            "eval",
            "design-critique",
            "nanofy",
            "url-variant",
        ],
        "short_summary": (
            "transforms a natural-language user prompt into 5 standout benchmark dossiers, "
            "named style range, and prompt-01-anchored 2k "
            "nano banana 2 concept plates within a hard 3-round cap."
        ),
        "when_to_use": (
            "use in jason-design-agent when planning a website, mobile app, component "
            "suite, 3d experience, or game from a prompt before jason-dev-agent builds it."
        ),
        "quick_cmd": "python3 skill-maker/scripts/validate_and_wrap.py --skill-dir=concept-art",
    },
    "research": {
        "display_name": "research",
        "category": "sub-skill of concept-art · 5 standout benchmarks",
        "icon": "🔎",
        "is_subskill": True,
        "parent_skill": "concept-art",
        "subskills": [],
        "short_summary": (
            "researches, screenshots, and documents 5 standout non-beige benchmarks "
            "across full-length desktop and mobile pages using pure inspiration and live web captures, "
            "logging avoid_fonts and avoid_palettes."
        ),
        "when_to_use": (
            "use at stage 1 of jason-design-agent to gather 5 standout benchmark "
            "markdown dossiers, full-page DevTools screengrabs, and named style range."
        ),
        "quick_cmd": "python3 skill-maker/scripts/validate_and_wrap.py --skill-dir=research",
    },
    "style-direction": {
        "display_name": "style direction",
        "category": "sub-skill of concept-art · non-copied fonts, colors & canon",
        "icon": "🎨",
        "is_subskill": True,
        "parent_skill": "concept-art",
        "subskills": [],
        "short_summary": (
            "synthesizes 5 benchmarks into named 5-10 style directions "
            "with web-safe and companion google fonts, 8-token colors, canon.md, "
            "coverage.md, and copy tables."
        ),
        "when_to_use": (
            "use at stage 2 of jason-design-agent after research and before image-gen "
            "authors prompts."
        ),
        "quick_cmd": "python3 skill-maker/scripts/validate_and_wrap.py --skill-dir=style-direction",
    },
    "image-gen": {
        "display_name": "image gen",
        "category": "sub-skill of concept-art · prompt-01 lock & 2k plates",
        "icon": "🖼️",
        "is_subskill": True,
        "parent_skill": "concept-art",
        "subskills": [],
        "short_summary": (
            "locks 01-anchor first, then authors and renders drift-free 2k "
            "nano banana 2 plates (4x3=12 matrix or multi-direction) "
            "within a strict 3-round ceiling."
        ),
        "when_to_use": (
            "use at stage 3 of jason-design-agent to render the 2k concept pack "
            "anchored to prompt 01."
        ),
        "quick_cmd": "python3 skill-maker/scripts/validate_and_wrap.py --skill-dir=image-gen",
    },
    "polish": {
        "display_name": "polish",
        "category": "sub-skill of concept-art · surgical edits (rounds 2-3 max)",
        "icon": "🪄",
        "is_subskill": True,
        "parent_skill": "concept-art",
        "subskills": [],
        "short_summary": (
            "runs surgical nano banana 2 image-to-image edits on failing 2k "
            "plates in rounds 2 and 3 only while freezing passing slots at round 1."
        ),
        "when_to_use": (
            "use at stage 4 of jason-design-agent when eval flags localized defects and "
            "rounds used is under 3."
        ),
        "quick_cmd": "python3 skill-maker/scripts/validate_and_wrap.py --skill-dir=polish",
    },
    "eval": {
        "display_name": "eval",
        "category": "sub-skill of concept-art · 6-gate concept & originality audit",
        "icon": "✅",
        "is_subskill": True,
        "parent_skill": "concept-art",
        "subskills": [],
        "short_summary": (
            "audits 2k plates against 01-anchor coherence, anti-clone "
            "originality vs. 5 standout benchmarks, canon.md agreement, 2k footers, "
            "surface distinctness, and the 3-round cap."
        ),
        "when_to_use": (
            "use at stage 5 of jason-design-agent after image-gen or polish renders "
            "any 2k concept plate."
        ),
        "quick_cmd": "python3 skill-maker/scripts/validate_and_wrap.py --skill-dir=eval",
    },
    "image-to-react": {
        "display_name": "image to react",
        "category": "core skill · jason-dev-agent synthesis & paired eval loop",
        "icon": "⚡",
        "is_subskill": False,
        "parent_skill": None,
        "subskills": [
            "replicate-mock",
            "nano-banana",
            "responsiveness",
            "interaction",
            "feel",
            "font-pairing",
            "accessibility",
            "design-critique",
        ],
        "short_summary": (
            "builds bucket-first golden template react apps in jason-dev-agent with "
            "developer-voiced stage talk-backs, moodboard jason-dev-agent turn tracking, "
            "and a final jason-design-agent sign-off output."
        ),
        "when_to_use": (
            "use in jason-dev-agent when converting any ui screenshot, concept pack, or "
            "4k layout grid into a runnable react application."
        ),
        "quick_cmd": "node image-to-react/scripts/eval-image-to-react.mjs --project=./projects/01-website-app --reference=./ref.png",
    },
    "replicate-mock": {
        "display_name": "replicate mock",
        "category": "sub-skill of image-to-react · pixel, hex & 3-bucket classifier",
        "icon": "🔍",
        "is_subskill": True,
        "parent_skill": "image-to-react",
        "subskills": [],
        "short_summary": (
            "extracts exact hex tokens, pixel measurements, and classifies dom "
            "native-code vs. crisp-media vs. upscale-queue crops (adapted with "
            "credit from manasababu)."
        ),
        "when_to_use": (
            "use in stage 1a of jason-dev-agent to sample exact hex palettes, build "
            "native html/css/svg ui, and isolate true photographic crops."
        ),
        "quick_cmd": "python3 replicate-mock/scripts/prepare-and-extract-image.py --input_image=./mock.png --workspace_dir=./extracted",
    },
    "nano-banana": {
        "display_name": "nano banana",
        "category": "sub-skill of image-to-react · targeted bucket 2x upscaler & readiness eval",
        "icon": "🍌",
        "is_subskill": True,
        "parent_skill": "image-to-react",
        "subskills": [],
        "short_summary": (
            "upgrades only upscale-queue image slots to 2x retina with zero "
            "drift and enforces non-blur readiness via eval-image-readiness.py."
        ),
        "when_to_use": (
            "use in stage 1b of jason-dev-agent only on mounted image buckets flagged "
            "below 2x retina or blurry by eval-image-readiness.py."
        ),
        "quick_cmd": "python3 nano-banana/scripts/eval-image-readiness.py --project=./projects/01-website-app",
    },
    "responsiveness": {
        "display_name": "responsiveness",
        "category": "sub-skill of image-to-react · viewports & reflow loop",
        "icon": "📐",
        "is_subskill": True,
        "parent_skill": "image-to-react",
        "subskills": [],
        "short_summary": (
            "evaluates one shared responsive react dom across desktop, mobile, "
            "and six viewports (320px to 1536px) before designer critique."
        ),
        "when_to_use": (
            "use in jason-dev-agent when building, tuning, or verifying responsive "
            "layouts across desktop, tablet, and mobile viewports."
        ),
        "quick_cmd": "node responsiveness/scripts/eval-responsive-pair.mjs --project-dir=./project --desktop-ref=./desktop.png --mobile-ref=./mobile.png",
    },
    "interaction": {
        "display_name": "interaction",
        "category": "sub-skill of image-to-react · controls, scroll points & animation triggers",
        "icon": "🕹️",
        "is_subskill": True,
        "parent_skill": "image-to-react",
        "subskills": [],
        "short_summary": (
            "wires 100% live controls, sliders, pagination, intersectionobserver "
            "scroll points, and animation triggers while keeping t=0 locked."
        ),
        "when_to_use": (
            "use in stage 3 of jason-dev-agent when wiring buttons, sliders, pagination, "
            "scroll-point waypoints, and animation triggers."
        ),
        "quick_cmd": "python3 interaction/scripts/eval-interaction.py --project=./projects/01-website-app --require-scroll-points",
    },
    "feel": {
        "display_name": "feel",
        "category": "sub-skill of image-to-react · 60fps scroll, tactile physics & gpu curves",
        "icon": "✨",
        "is_subskill": True,
        "parent_skill": "image-to-react",
        "subskills": [],
        "short_summary": (
            "verifies 60fps scrolling (eval-feel-and-scroll.py), tactile press "
            "response, gpu transform/opacity curves, zero layout shift, and "
            "reduced-motion safety."
        ),
        "when_to_use": (
            "use in stage 4 of jason-dev-agent to verify 60fps scroll performance and "
            "physical feel under pointer, touch, keyboard, and scroll."
        ),
        "quick_cmd": "python3 feel/scripts/eval-feel-and-scroll.py --project=./projects/01-website-app",
    },
    "nanofy": {
        "display_name": "nanofy",
        "category": "sub-skill of concept-art · folder intake & anchored nano banana refresh",
        "icon": "🍌",
        "is_subskill": True,
        "parent_skill": "concept-art",
        "subskills": [],
        "short_summary": (
            "intakes a zip or folder of plates plus the prompt mds behind them, re-outputs "
            "every plate through nano banana with the desktop anchor taking a 0.1-0.5 unique "
            "take propagated to all spokes (same size, same format, >= 1k, invariants locked), "
            "and curates the design | development moodboard before handing to jason-dev-agent."
        ),
        "when_to_use": (
            "use inside jason-design-agent whenever the design agent starts from a folder of "
            "plates instead of a prompt."
        ),
        "quick_cmd": "python3 nanofy/scripts/nanofy-plates.py plan --study=./my-study --variation 0.2",
    },
    "url-variant": {
        "display_name": "url variant",
        "category": "sub-skill of concept-art · chrome devtools fullpage + dom text -> nano banana 2.1 unique variant & dual-axis eval",
        "icon": "🧬",
        "is_subskill": True,
        "parent_skill": "concept-art",
        "subskills": [],
        "short_summary": (
            "captures full-length desktop and mobile screenshots plus complete desktop "
            "and mobile dom text from a url via chrome devtools, generates a true unique "
            "nano banana 2.1 variant (new text, new colors, new fonts, same vibe, zero "
            "flutter/artifacts), and scores uniqueness vs. aesthetic quality."
        ),
        "when_to_use": (
            "use whenever taking a live url and producing a true unique variant of both "
            "its desktop and mobile full-length pages with completely new copy, colors, "
            "and fonts while purging flutter or original artifacts."
        ),
        "quick_cmd": "node url-variant/scripts/capture_url_devtools_and_dom.mjs --url=https://example.com --out-dir=./study",
    },
    "font-pairing": {
        "display_name": "font pairing",
        "category": "sub-skill of image-to-react · primary / secondary / tertiary type system",
        "icon": "🔠",
        "is_subskill": True,
        "parent_skill": "image-to-react",
        "subskills": [],
        "short_summary": (
            "locks every build to one role-based type system: primary for headlines "
            "and subheadlines, secondary for body and ui, at most one tertiary accent "
            "(<= 15% of text), a monotonic modular scale, and zero fallback leaks, "
            "verified in the live dom by eval-font-pairing.py."
        ),
        "when_to_use": (
            "use in stage 1a of jason-dev-agent when wiring the fonts chosen by "
            "jason-design-agent or auditing typography consistency."
        ),
        "quick_cmd": "python3 font-pairing/scripts/eval-font-pairing.py --project=./projects/01-website-app --expect-primary=\"<family>\" --expect-secondary=\"<family>\"",
    },
    "accessibility": {
        "display_name": "accessibility",
        "category": "sub-skill of image-to-react · wcag 2.2 type, contrast & target sizing",
        "icon": "♿",
        "is_subskill": True,
        "parent_skill": "image-to-react",
        "subskills": [],
        "short_summary": (
            "enforces accessible standards when sizing type and controls: body >= 16px "
            "at 1.5 line height (12px floor), 4.5:1 / 3:1 contrast, targets >= 24x24 "
            "(44x44 recommended), visible focus, accessible names, alt text, and lang, "
            "verified in the live dom by eval-accessibility.py."
        ),
        "when_to_use": (
            "use in jason-dev-agent whenever sizing fonts, buttons, pills, or inputs, "
            "or picking text and background colors; re-run after every stage."
        ),
        "quick_cmd": "python3 accessibility/scripts/eval-accessibility.py --project=./projects/01-website-app",
    },
    "design-critique": {
        "display_name": "design critique",
        "category": "shared bridge · upfront sign-off, talk-backs & final output",
        "icon": "🎯",
        "is_subskill": True,
        "parent_skill": "concept-art",
        "subskills": [],
        "short_summary": (
            "runs jason-design-agent's originality and craft critiques across upfront "
            "concept sign-off, mid-build jason-dev-agent talk-backs, and the mandatory "
            "final post-build jason-design-agent output."
        ),
        "when_to_use": (
            "use after concept eval passes, after any jason-dev-agent stage eval passes, "
            "or at the end of jason-dev-agent to emit the final jason-design-agent output."
        ),
        "quick_cmd": "python3 skill-maker/scripts/validate_and_wrap.py --skill-dir=design-critique",
    },
    "warmup": {
        "display_name": "warmup",
        "category": "core skill · pre-bench & post-bench model comparator",
        "icon": "🔥",
        "is_subskill": False,
        "parent_skill": None,
        "subskills": [],
        "short_summary": (
            "runs a locked pre-bench image-to-react translation or post-bench "
            "head-to-head build comparison across frontier models and generates "
            "a 100-point tear-apart design evaluation report."
        ),
        "when_to_use": (
            "use when benchmarking how multiple models translate a ui mockup to "
            "react or comparing multiple existing react builds head-to-head."
        ),
        "quick_cmd": "python3 warmup/scripts/run_warmup.py --mode=post-bench --image=./ref.png --output=./warmup-out",
    },
    "taxonomy": {
        "display_name": "taxonomy",
        "category": "core skill · wda silvers prompt ↔ template match classification & gap registry",
        "icon": "🗂️",
        "is_subskill": False,
        "parent_skill": None,
        "subskills": [],
        "short_summary": (
            "classifies prompts, screenshots, briefs, benchmark slices, and react "
            "builds into the locked wda v1.1 prompt ↔ template match taxonomy "
            "(3 categories, 15 subcategories, 557 prompts, 257 templates, 77 gap "
            "archetypes, and auxiliary dimensions), recommends templates and gaps, "
            "audits slice distributions, and extends append-only."
        ),
        "when_to_use": (
            "use when labeling a prompt or build with a category, subcategory, "
            "surface, or 3d role, querying templates or missing-template gaps, "
            "auditing a benchmark dataset slice, or proposing new taxonomy entries."
        ),
        "quick_cmd": 'python3 taxonomy/scripts/classify_taxonomy.py --query "3d supercar landing page with camera preset toolbar"',
    },
}


def parse_frontmatter(text: str) -> tuple[dict, str]:
  """Parses YAML frontmatter and markdown body."""
  if not text.startswith("---"):
    return {}, text
  parts = text.split("---", 2)
  if len(parts) < 3:
    return {}, text
  raw_yaml = parts[1]
  body = parts[2].lstrip("\n")
  meta = {}
  try:
    import yaml  # pylint: disable=g-import-not-at-top
    loaded = yaml.safe_load(raw_yaml)
    if isinstance(loaded, dict):
      meta = loaded
  except Exception:  # pylint: disable=broad-exception-caught
    for line in raw_yaml.splitlines():
      if ":" in line and not line.startswith(" "):
        k, v = line.split(":", 1)
        meta[k.strip()] = v.strip()
  return meta, body


def sanitize_description(desc: str) -> str:
  """Ensures description has no angle brackets and is under 1024 chars."""
  cleaned = desc.replace(">=", "at least ").replace("<=", "at most ")
  cleaned = re.sub(r"<([a-zA-Z0-9_-]+)>", r"{\1}", cleaned)
  cleaned = cleaned.replace("<", "").replace(">", "")
  cleaned = " ".join(cleaned.split())
  if len(cleaned) > 1020:
    cleaned = cleaned[:1017].rsplit(" ", 1)[0] + "..."
  return cleaned


def sanitize_code_blocks_em_dash(body: str) -> str:
  """Replaces Unicode em/en dashes inside fenced code blocks and inline code."""
  def _fix_fenced(match: re.Match) -> str:
    return match.group(0).replace("\u2014", "--").replace("\u2013", "-")

  body = re.sub(r"```[\s\S]*?```", _fix_fenced, body)

  def _fix_inline(match: re.Match) -> str:
    return match.group(0).replace("\u2014", "--").replace("\u2013", "-")

  body = re.sub(r"`[^`\n]+`", _fix_inline, body)
  return body


def sanitize_links(skill_dir: pathlib.Path, body: str) -> str:
  """Replaces forbidden file:/// or /google/src/ links with relative links or code."""
  def _replace_link(match: re.Match) -> str:
    label, target = match.group(1), match.group(2).strip()
    target_url = target.split()[0].strip("<>")
    anchor = ""
    if "#" in target_url:
      target_url, anchor = target_url.split("#", 1)
      anchor = "#" + anchor

    if target_url.startswith(("http://", "https://", "mailto:", "go/")):
      return match.group(0)

    for prefix in (
        f"/usr/local/google/home/jfesta/moodboards/skills/{skill_dir.name}/",
        f"/usr/local/google/home/jfesta/wda/skills/{skill_dir.name}/",
        f"/usr/local/google/home/jfesta/design-kit/skills/{skill_dir.name}/",
        f"file:///usr/local/google/home/jfesta/moodboards/skills/{skill_dir.name}/",
        f"file:///usr/local/google/home/jfesta/wda/skills/{skill_dir.name}/",
        f"file:///usr/local/google/home/jfesta/design-kit/skills/{skill_dir.name}/",
        "./",
    ):
      if target_url.startswith(prefix):
        rel = target_url[len(prefix):]
        if (skill_dir / rel).exists():
          return f"[{label}]({rel}{anchor})"

    if "golden-template/dating" in target_url and (skill_dir / "assets/dating").exists():
      return f"[{label}](assets/dating)"

    if not target_url.startswith(("file://", "/")):
      cand = (skill_dir / target_url).resolve()
      if cand.exists() and str(cand).startswith(str(skill_dir.resolve())):
        rel = cand.relative_to(skill_dir.resolve()).as_posix()
        return f"[{label}]({rel}{anchor})"

    clean_label = label.strip("`")
    return f"`{clean_label}`"

  return re.sub(r"\[([^\]]+)\]\(([^)]+)\)", _replace_link, body)


def format_frontmatter(name: str, desc: str, icon: str) -> str:
  """Formats clean YAML frontmatter with >- block scalar."""
  words = desc.split()
  lines = []
  curr = []
  for w in words:
    if sum(len(x) + 1 for x in curr) + len(w) > 76:
      lines.append("  " + " ".join(curr))
      curr = [w]
    else:
      curr.append(w)
  if curr:
    lines.append("  " + " ".join(curr))
  desc_block = "\n".join(lines)
  return (
      f"---\nname: {name}\ndescription: >-\n{desc_block}\n"
      f"metadata:\n  icon: {icon}\n---\n\n"
  )


def ensure_contributing(skill_dir: pathlib.Path, name: str, title: str) -> None:
  """Ensures references/contributing.md exists."""
  refs_dir = skill_dir / "references"
  refs_dir.mkdir(exist_ok=True)
  contrib_path = refs_dir / "contributing.md"
  if contrib_path.exists():
    return
  scripts_dir = skill_dir / "scripts"
  script_cmds = []
  if scripts_dir.exists():
    for s in sorted(scripts_dir.iterdir()):
      if s.suffix == ".py":
        script_cmds.append(f"python3 scripts/{s.name} --help")
      elif s.suffix == ".mjs":
        script_cmds.append(f"node scripts/{s.name} --help")
  cmds_block = "\n".join(script_cmds) if script_cmds else "python3 ../skill-maker/scripts/validate_and_wrap.py --skill-dir=."
  safe_write_text(
      contrib_path,
      f"""# Contributing to {title} (`{name}`)

## Core Invariants

1.  **Preserve Google Skill Readability & `validate_skill` Compliance**:
    -   Keep `SKILL.md` under `500` lines (`800` lines hard limit) using progressive disclosure into `references/*.md`.
    -   Never use `<` or `>` angle brackets in the YAML frontmatter `description`.
    -   Never use `file:///` or `/google/src/` links in `SKILL.md`; use relative paths (`references/...`, `scripts/...`, `assets/...`).
    -   Never place Unicode em dashes (`U+2014`) or en dashes (`U+2013`) inside fenced code blocks or inline code spans.
2.  **Single Canonical Script Ownership**:
    -   Keep deterministic helper scripts scoped to this skill's `scripts/` directory without duplicating scripts across sibling skills.

## Verification Before Submitting Changes

```bash
{cmds_block}
```
""",
      encoding="utf-8",
  )


def ensure_build_files(skill_dir: pathlib.Path, name: str) -> None:
  """Generates BUILD and scripts/BUILD files for Google3 deployment."""
  snake = name.replace("-", "_")
  refs_dir = skill_dir / "references"
  ref_files = []
  if refs_dir.exists():
    ref_files = sorted(
        f"references/{p.name}"
        for p in refs_dir.iterdir()
        if p.is_file() and p.suffix == ".md"
    )
  all_srcs = ["SKILL.md"] + ref_files
  assets_dir = skill_dir / "assets"
  if assets_dir.exists():
    # Top-level machine-readable registries (e.g. taxonomy/assets/taxonomy.json)
    # ship with the agent_skill so scripts and agents can resolve them in Google3.
    all_srcs += sorted(
        f"assets/{p.name}"
        for p in assets_dir.iterdir()
        if p.is_file() and p.suffix == ".json"
    )
  srcs_str = ",\n        ".join(f'"{s}"' for s in all_srcs)
  has_agent_md = (skill_dir / "agent.md").exists()
  exports_srcs = (["agent.md"] if has_agent_md else []) + all_srcs
  exports_srcs_str = ",\n        ".join(f'"{s}"' for s in exports_srcs)

  scripts_dir = skill_dir / "scripts"
  py_scripts = []
  mjs_scripts = []
  if scripts_dir.exists():
    py_scripts = sorted(
        p.stem for p in scripts_dir.iterdir() if p.is_file() and p.suffix == ".py"
    )
    mjs_scripts = sorted(
        p.name for p in scripts_dir.iterdir() if p.is_file() and p.suffix == ".mjs"
    )

  if scripts_dir.exists() and (py_scripts or mjs_scripts):
    s_lines = [
        'package(default_visibility = [',
        f'    "//experimental/users/jfesta/skills/{snake}:__subpackages__",',
        '])',
        '',
    ]
    if py_scripts:
      s_lines.insert(
          0,
          'load("//devtools/python/blaze:pytype.bzl", "pytype_strict_binary")\n',
      )
    if mjs_scripts:
      exports_list = ",\n    ".join(f'"{m}"' for m in mjs_scripts)
      s_lines.append(f"exports_files([\n    {exports_list},\n])\n")
    for py_s in py_scripts:
      s_lines.append(
          f'pytype_strict_binary(\n    name = "{py_s}",\n    srcs = ["{py_s}.py"],\n)\n'
      )
    safe_write_text(scripts_dir / "BUILD", "\n".join(s_lines))

  script_targets = [
      f'"//experimental/users/jfesta/skills/{snake}/scripts:{py_s}"'
      for py_s in py_scripts
  ]
  scripts_attr = ""
  if script_targets:
    joined_targets = ",\n        ".join(script_targets)
    scripts_attr = f"\n    scripts = [\n        {joined_targets},\n    ],"

  agent_rule_block = ""
  cust_load_block = 'load("//learning/gemini/agents/customization_rules:defs.bzl", "agent_skill")'
  if has_agent_md:
    cust_load_block = """load(
    "//learning/gemini/agents/customization_rules:defs.bzl",
    "agent_config",
    "agent_skill",
)"""
    agent_rule_block = f"""
agent_config(
    name = "{snake}_agent",
    agent_md = "agent.md",
)
"""

  build_content = f"""{cust_load_block}
load("//learning/gemini/agents/evaluation/evalin/build_defs:evalin.bzl", "eval_suite")
load("//learning/gemini/agents/skills/skill_creator/scripts:skill_defs.bzl", "validate_skill_test")

package(default_visibility = ["//visibility:public"])

exports_files([
        {exports_srcs_str},
])

eval_suite(
    name = "{snake}_eval",
    src = "EVAL.txtpb",
    enable_bbcp = False,
)

validate_skill_test(
    name = "validate_{snake}_skill_test",
    check_locked_links = True,
)
{agent_rule_block}
agent_skill(
    name = "{snake}",
    srcs = [
        {srcs_str},
    ],{scripts_attr}
)
"""
  safe_write_text(skill_dir / "BUILD", build_content)


def ensure_eval_and_test(skill_dir: pathlib.Path, name: str, title: str, desc: str) -> None:
  """Ensures EVAL.txtpb, TEST.md, skill.json, and evals/smoke.json exist."""
  snake = name.replace("-", "_")
  eval_path = skill_dir / "EVAL.txtpb"
  if not eval_path.exists():
    safe_write_text(
        eval_path,
        f"""# proto-file: learning/gemini/agents/evaluation/evalin/proto/eval_suite.proto
# proto-message: EvalSuite
# txtpbfmt: wrap_strings_after_newlines

suite_name: "{snake}"
timeout_seconds: 300

cases {{
  name: "{snake}_triggers_and_executes_primary_workflow"
  prompt: "Use the {name} skill to execute its primary workflow and verify all required outputs and quality gates.\\n"
  expectations:
    "The agent must:\\n"
    "- Load and follow {name}/SKILL.md\\n"
    "- Execute the deterministic workflow or bundled scripts in {name}\\n"
    "- Verify all output invariants before completing the turn"
  expectations: "Agent output references {name} or its primary deliverables"
}}

cases {{
  name: "{snake}_enforces_quality_gates_and_references"
  prompt: "Run a full verification audit with {name} and check all reference invariants.\\n"
  expectations:
    "The agent must:\\n"
    "- Consult the bundled references/ guides when verifying edge cases\\n"
    "- Report pass/fail status against the skill's verification checklist"
  expectations: "Agent output includes concrete verification results"
}}
""",
        encoding="utf-8",
    )

  test_path = skill_dir / "TEST.md"
  if not test_path.exists():
    safe_write_text(
        test_path,
        f"""# {title} (`{name}`) — End-to-End Test Plan

This test plan verifies that the `{name}` skill loads cleanly, executes its deterministic workflow and helper scripts, and passes all `validate_skill` invariants.

## Test Case 1: Primary Workflow Execution

### Prompt
> "Run `{name}` on a sample artifact and verify all quality gates."

### Verification Criteria
1.  **Skill Discovery & Load**: The agent loads `{name}/SKILL.md` and follows its numbered workflow checklist.
2.  **Reference & Script Execution**: Any bundled scripts in `scripts/` and reference guides in `references/` resolve via relative paths with zero broken links.
3.  **Deliverable Verification**: All outputs meet the verification criteria documented in `SKILL.md`.

## Automated Validation Check

```bash
python3 ../skill-maker/scripts/validate_and_wrap.py --skill-dir=.
```
""",
        encoding="utf-8",
    )

  evals_dir = skill_dir / "evals"
  evals_dir.mkdir(exist_ok=True)
  smoke_path = evals_dir / "smoke.json"
  if not smoke_path.exists():
    safe_write_text(
        smoke_path,
        json.dumps(
            {
                "skill": name,
                "suite": f"{snake}_smoke",
                "status": "ready",
                "checks": [
                    "SKILL.md frontmatter and line limits valid",
                    "All relative links in SKILL.md resolve on disk",
                    "BUILD, EVAL.txtpb, TEST.md, and references/contributing.md present",
                ],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

  cmeta = SKILL_CATALOG_META.get(name, {})
  refs_list = sorted(
      f"./references/{p.name}"
      for p in (skill_dir / "references").glob("*.md")
  ) if (skill_dir / "references").exists() else []
  scripts_list = sorted(
      f"./scripts/{p.name}"
      for p in (skill_dir / "scripts").iterdir()
      if p.is_file() and p.name != "BUILD"
  ) if (skill_dir / "scripts").exists() else []

  skill_json_path = skill_dir / "skill.json"
  skill_json_data = {
      "id": name,
      "display_name": cmeta.get("display_name", title),
      "google3_package": snake,
      "title": title,
      "icon": cmeta.get("icon", "✨"),
      "category": cmeta.get("category", "Core Skill"),
      "is_subskill": cmeta.get("is_subskill", False),
      "parent_skill": cmeta.get("parent_skill"),
      "subskills": cmeta.get("subskills", []),
      "path": name,
      "agent_md": f"{name}/agent.md",
      "skill_md": f"{name}/SKILL.md",
      "html_page": f"{name}/index.html",
      "x20_url": f"{X20_BASE_URL}/{name}/index.html",
      "x20_agent_md_url": f"{X20_BASE_URL}/{name}/agent.md",
      "x20_skill_md_url": f"{X20_BASE_URL}/{name}/SKILL.md",
      "x20_bundle_url": f"{X20_BASE_URL}/{name}.skill",
      "local_path": f"/usr/local/google/home/jfesta/design-kit/skills/{name}",
      "bundle_skill": f"{name}.skill",
      "bundle_zip": f"{name}.zip",
      "short_summary": cmeta.get("short_summary", desc),
      "when_to_use": cmeta.get("when_to_use", ""),
      "quick_cmd": cmeta.get("quick_cmd", ""),
      "summary": desc,
      "references": refs_list + scripts_list,
      "commands": {
          "validate": f"python3 skill-maker/scripts/validate_and_wrap.py --skill-dir={name}",
      },
  }
  if (skill_dir / "specimen.html").exists():
    skill_json_data["specimen_page"] = f"{name}/specimen.html"
    skill_json_data["x20_specimen_url"] = f"{X20_BASE_URL}/{name}/specimen.html"
  safe_write_text(
      skill_json_path,
      json.dumps(skill_json_data, indent=2) + "\n",
  )


def render_markdown_to_html(md_text: str) -> str:
  """Lightweight deterministic Markdown-to-HTML renderer for standalone x20 pages."""
  lines = md_text.splitlines()
  out = []
  in_code = False
  code_lang = ""
  code_buf = []
  in_ul = False
  in_ol = False
  in_table = False
  table_rows = []

  def _close_lists():
    nonlocal in_ul, in_ol
    if in_ul:
      out.append("</ul>")
      in_ul = False
    if in_ol:
      out.append("</ol>")
      in_ol = False

  def _flush_table():
    nonlocal in_table, table_rows
    if not in_table:
      return
    in_table = False
    if not table_rows:
      return
    out.append('<div class="table-wrap"><table>')
    header = table_rows[0]
    out.append("<thead><tr>" + "".join(f"<th>{_inline(c)}</th>" for c in header) + "</tr></thead>")
    if len(table_rows) > 2:
      out.append("<tbody>")
      for r in table_rows[2:]:
        out.append("<tr>" + "".join(f"<td>{_inline(c)}</td>" for c in r) + "</tr>")
      out.append("</tbody>")
    out.append("</table></div>")
    table_rows = []

  def _inline(s: str) -> str:
    s = html.escape(s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", s)
    s = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda m: f'<a href="{html.unescape(m.group(2))}">{m.group(1)}</a>',
        s,
    )
    return s

  for line in lines:
    if line.strip().startswith("```"):
      _close_lists()
      _flush_table()
      if not in_code:
        in_code = True
        code_lang = line.strip()[3:].strip() or "text"
        code_buf = []
      else:
        in_code = False
        escaped = html.escape("\n".join(code_buf))
        out.append(f'<pre data-lang="{html.escape(code_lang)}"><code>{escaped}</code></pre>')
      continue
    if in_code:
      code_buf.append(line)
      continue

    stripped = line.strip()
    if stripped.startswith("|") and stripped.endswith("|"):
      _close_lists()
      in_table = True
      cells = [c.strip() for c in stripped.strip("|").split("|")]
      table_rows.append(cells)
      continue
    else:
      _flush_table()

    if not stripped or stripped.startswith("---"):
      _close_lists()
      continue

    if stripped.startswith("# "):
      _close_lists()
      out.append(f"<h1>{_inline(stripped[2:])}</h1>")
    elif stripped.startswith("## "):
      _close_lists()
      out.append(f"<h2>{_inline(stripped[3:])}</h2>")
    elif stripped.startswith("### "):
      _close_lists()
      out.append(f"<h3>{_inline(stripped[4:])}</h3>")
    elif stripped.startswith("- [ ] ") or stripped.startswith("- [x] "):
      if not in_ul:
        _close_lists()
        out.append('<ul class="checklist">')
        in_ul = True
      out.append(f'<li><span class="check-box"></span><span>{_inline(stripped[6:])}</span></li>')
    elif stripped.startswith("- ") or stripped.startswith("* "):
      if not in_ul:
        _close_lists()
        out.append("<ul>")
        in_ul = True
      out.append(f"<li>{_inline(stripped[2:])}</li>")
    elif re.match(r"^\d+\.\s+", stripped):
      if not in_ol:
        _close_lists()
        out.append("<ol>")
        in_ol = True
      content_part = re.sub(r"^\d+\.\s+", "", stripped)
      out.append(f"<li>{_inline(content_part)}</li>")
    else:
      _close_lists()
      out.append(f"<p>{_inline(stripped)}</p>")

  _close_lists()
  _flush_table()
  return "\n".join(out)


def generate_skill_html(skill_dir: pathlib.Path, name: str, title: str, desc: str, body: str) -> None:
  """Generates an airy, left-aligned, lowercase standalone index.html for the skill."""
  cmeta = SKILL_CATALOG_META.get(name, {})
  display_name = cmeta.get("display_name", title).lower()
  short_summary = cmeta.get("short_summary", desc).lower()
  rendered_body = render_markdown_to_html(body)

  page_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{html.escape(display_name)}</title>
  <style>
    :root {{
      --bg: #fcfcfa;
      --fg: #141413;
      --muted: #787774;
      --line: #eae9e4;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --bg: #0c0c0b;
        --fg: #ededec;
        --muted: #858481;
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
      line-height: 1.65;
      text-align: left;
      text-transform: lowercase;
      -webkit-font-smoothing: antialiased;
    }}
    main {{
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
      padding: clamp(72px, 14vh, 148px) 28px clamp(96px, 16vh, 168px);
    }}
    .back {{
      display: inline-block;
      font-size: 13px;
      color: var(--muted);
      text-decoration: none;
      margin-bottom: 40px;
    }}
    .back:hover {{
      color: var(--fg);
    }}
    header {{
      margin-bottom: 56px;
    }}
    h1 {{
      font-size: 16px;
      font-weight: 500;
      letter-spacing: -0.01em;
      margin-bottom: 8px;
    }}
    header p {{
      color: var(--muted);
      font-size: 14px;
      max-width: 46ch;
      margin-bottom: 14px;
    }}
    .actions {{
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 13px;
    }}
    .actions a, article a {{
      color: var(--fg);
      text-decoration: none;
      border-bottom: 1px solid var(--line);
      padding-bottom: 1px;
    }}
    .actions a:hover, article a:hover {{
      border-color: var(--fg);
    }}
    article {{
      color: var(--muted);
      font-size: 14px;
      border-top: 1px solid var(--line);
      padding-top: 40px;
    }}
    article h1 {{
      display: none;
    }}
    article h2 {{
      color: var(--fg);
      font-size: 14.5px;
      font-weight: 500;
      margin: 36px 0 10px;
    }}
    article h3 {{
      color: var(--fg);
      font-size: 14px;
      font-weight: 500;
      margin: 24px 0 8px;
    }}
    article p {{
      margin-bottom: 14px;
    }}
    article ul, article ol {{
      padding-left: 18px;
      margin-bottom: 16px;
    }}
    article li {{
      margin-bottom: 6px;
    }}
    pre, code {{
      font-family: "JetBrains Mono", monospace;
      font-size: 12.5px;
    }}
    pre {{
      margin: 14px 0 20px;
      padding: 14px;
      border: 1px solid var(--line);
      overflow-x: auto;
      color: var(--fg);
      white-space: pre-wrap;
      word-break: break-word;
    }}
    .table-wrap {{
      overflow-x: auto;
      margin: 16px 0;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }}
    th, td {{
      padding: 8px 10px;
      border-bottom: 1px solid var(--line);
      text-align: left;
    }}
    th {{
      color: var(--fg);
      font-weight: 500;
    }}
  </style>
</head>
<body>
  <main>
    <a class="back" href="../index.html">← skills</a>
    <header>
      <h1>{html.escape(display_name)}</h1>
      <p>{html.escape(short_summary)}</p>
      <div class="actions">
        <a href="../{html.escape(name)}.skill" download>download</a>{"" if not (skill_dir / "agent.md").exists() else chr(10) + '        <a href="agent.md">agent.md</a>'}
        <a href="SKILL.md">skill.md</a>
      </div>
    </header>
    <article>
      {rendered_body}
    </article>
  </main>
</body>
</html>
"""
  safe_write_text(skill_dir / "index.html", page_html)


def validate_skill_strict(skill_dir: pathlib.Path) -> tuple[bool, list[str]]:
  """Runs Google's validate_skill.py checks on the skill folder."""
  errors = []
  skill_md = skill_dir / "SKILL.md"
  if not skill_md.exists():
    return False, ["Missing SKILL.md"]

  content = skill_md.read_text(encoding="utf-8")
  meta, body = parse_frontmatter(content)
  name = str(meta.get("name", "")).strip()
  desc = str(meta.get("description", "")).strip()

  if not name or not re.fullmatch(r"[a-z0-9-]+", name):
    errors.append(f"Invalid kebab-case name: '{name}'")
  if not desc:
    errors.append("Missing description in frontmatter")
  if "<" in desc or ">" in desc:
    errors.append("Description contains forbidden '<' or '>' angle brackets")
  if len(desc) > 1024:
    errors.append(f"Description exceeds 1024 chars ({len(desc)})")

  lines = content.splitlines()
  if len(lines) > MAX_SKILL_LINES:
    errors.append(f"SKILL.md exceeds {MAX_SKILL_LINES} lines ({len(lines)})")
  if len(content.encode("utf-8")) > MAX_SKILL_BYTES:
    errors.append(f"SKILL.md exceeds {MAX_SKILL_BYTES} bytes")

  cleaned_body = re.sub(r"```[\s\S]*?```", "", body)
  cleaned_body = re.sub(r"`[^`\n]+`", "", cleaned_body)
  for _, target in re.findall(r"\[([^\]]+)\]\(([^)]+)\)", cleaned_body):
    t = target.strip().split()[0].strip("<>").split("#")[0]
    if not t or t.startswith(("http://", "https://", "mailto:", "go/")):
      continue
    for bad in ("file:///", "/google3/", "/google/src/"):
      if t.startswith(bad):
        errors.append(f"Forbidden link prefix in SKILL.md: {t}")
    resolved = (skill_dir / t).resolve()
    if not resolved.exists():
      errors.append(f"Broken relative link in SKILL.md: {t}")

  if "## Contributions" not in body or "](references/contributing.md)" not in body:
    errors.append("Missing '## Contributions' section linking to references/contributing.md")

  req_files = ["BUILD", "EVAL.txtpb", "TEST.md", "skill.json", "references/contributing.md"]
  if skill_dir.name in SKILL_CATALOG_META:
    req_files.append("agent.md")
  for req in req_files:
    if not (skill_dir / req).exists():
      errors.append(f"Missing required Google Skill/Agent wrapper file: {req}")

  agent_md = skill_dir / "agent.md"
  if agent_md.exists():
    ok_a, errs_a = validate_agent_md(agent_md, expected_name=name)
    if not ok_a:
      errors.extend(errs_a)

  return len(errors) == 0, errors


def validate_agent_md(agent_md: pathlib.Path, expected_name: str | None = None) -> tuple[bool, list[str]]:
  """Runs Google's validate_agent.go checks on a Markdown agent file."""
  errs = []
  if not agent_md.exists():
    return False, [f"Missing agent file: {agent_md}"]
  raw = agent_md.read_text(encoding="utf-8")
  if not raw.startswith("---"):
    return False, [f"{agent_md.name} must start with YAML frontmatter ('---')"]
  ameta, abody = parse_frontmatter(raw)
  aname = str(ameta.get("name", "")).strip()
  adesc = str(ameta.get("description", "")).strip()
  if not aname or not re.fullmatch(r"[a-z0-9-]+", aname):
    errs.append(f"{agent_md.name}: invalid or empty agent name '{aname}'")
  if expected_name and aname != expected_name:
    errs.append(f"{agent_md.name}: name '{aname}' does not match expected '{expected_name}'")
  if not adesc:
    errs.append(f"{agent_md.name}: missing non-empty description in frontmatter")
  model_val = str(ameta.get("model", "")).strip().lower()
  if model_val and model_val not in ("inherit", "flash_lite", "flash", "pro"):
    errs.append(f"{agent_md.name}: invalid model '{model_val}'")
  cep = str(ameta.get("commandExecutionPolicy", "")).strip().lower()
  if cep and cep not in ("off", "auto", "eager", "sandbox"):
    errs.append(f"{agent_md.name}: invalid commandExecutionPolicy '{cep}'")
  if not abody.strip():
    errs.append(f"{agent_md.name}: markdown body after frontmatter must be non-empty")
  if not re.search(r"^#\s+.+$", abody, re.MULTILINE):
    errs.append(f"{agent_md.name}: body should include at least one H1 ('# ') prompt section")
  return len(errs) == 0, errs


ARCHIVE_SKIP_DIRS = {"node_modules", "dist", "__pycache__", ".vite", ".eval_work"}


def pack_skill_archives(skill_dir: pathlib.Path, out_root: pathlib.Path) -> None:
  """Packages <skill>.skill and <skill>.zip at out_root (skipping node_modules, dist, and caches)."""
  name = skill_dir.name
  for ext in (".skill", ".zip"):
    archive_path = out_root / f"{name}{ext}"
    try:
      with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(skill_dir.rglob("*")):
          rel_parts = f.relative_to(skill_dir).parts
          if any(part in ARCHIVE_SKIP_DIRS for part in rel_parts[:-1]):
            continue
          if f.is_file() and not f.name.endswith(".pyc") and f.name != ".DS_Store":
            arcname = f"{name}/{f.relative_to(skill_dir).as_posix()}"
            zf.write(f, arcname)
    except OSError:
      pass


def process_skill(skill_dir: pathlib.Path, out_root: pathlib.Path, fix: bool = True) -> tuple[bool, list[str]]:
  """Processes, sanitizes, wraps, and validates a single skill directory."""
  skill_md = skill_dir / "SKILL.md"
  if not skill_md.exists():
    return False, [f"No SKILL.md in {skill_dir}"]

  raw_text = skill_md.read_text(encoding="utf-8")
  meta, body = parse_frontmatter(raw_text)
  name = skill_dir.name
  desc = sanitize_description(str(meta.get("description", "")))

  h1_match = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
  title = h1_match.group(1).strip() if h1_match else name.replace("-", " ").title()
  title = re.sub(r"\s*\(`[^`]+`\)\s*$", "", title)

  cmeta = SKILL_CATALOG_META.get(name, {})
  icon = cmeta.get("icon", "✨")

  if fix:
    ensure_contributing(skill_dir, name, title)
    body = sanitize_code_blocks_em_dash(body)
    body = sanitize_links(skill_dir, body)
    if "## Contributions" not in body:
      body = (
          body.rstrip()
          + "\n\n--------------------------------------------------------------------------------\n\n"
          + "## Contributions\n\nTo contribute or modify this skill or its references, follow the\n"
          + "[contribution guidelines](references/contributing.md) before making changes.\n"
      )
    new_md = format_frontmatter(name, desc, icon) + body.lstrip()
    try:
      if skill_md.read_text(encoding="utf-8") != new_md:
        skill_md.write_text(new_md, encoding="utf-8")
    except OSError:
      pass
    ensure_build_files(skill_dir, name)
    ensure_eval_and_test(skill_dir, name, title, desc)
    generate_skill_html(skill_dir, name, title, desc, body)
    pack_skill_archives(skill_dir, out_root)

  return validate_skill_strict(skill_dir)


def main():
  parser = argparse.ArgumentParser(description="Validate and wrap Google Skills.")
  parser.add_argument("--skill-dir", help="Single skill directory to process.")
  parser.add_argument("--skills-root", help="Root directory containing multiple skill folders.")
  parser.add_argument("--fix", action="store_true", default=True, help="Auto-fix and generate wrapper files.")
  args = parser.parse_args()

  if args.skill_dir:
    sdir = pathlib.Path(args.skill_dir).resolve()
    ok, errs = process_skill(sdir, sdir.parent, fix=args.fix)
    print(f"[{'PASS' if ok else 'FAIL'}] {sdir.name}")
    for e in errs:
      print(f"  - {e}")
    raise SystemExit(0 if ok else 1)

  if args.skills_root:
    root = pathlib.Path(args.skills_root).resolve()
    all_ok = True
    agents_root = root / "_agents" / "agents"
    if agents_root.exists():
      for agent_file in sorted(agents_root.glob("*.md")):
        ok_da, errs_da = validate_agent_md(agent_file, expected_name=agent_file.stem)
        print(f"[{'PASS' if ok_da else 'FAIL'}] {agent_file.stem} (coordinator agent)")
        for e in errs_da:
          print(f"  - {e}")
        if not ok_da:
          all_ok = False
    for entry in sorted(root.iterdir()):
      if (
          entry.is_dir()
          and not entry.is_symlink()
          and entry.name in SKILL_CATALOG_META
          and (entry / "SKILL.md").exists()
      ):
        ok, errs = process_skill(entry, root, fix=args.fix)
        print(f"[{'PASS' if ok else 'FAIL'}] {entry.name}")
        for e in errs:
          print(f"  - {e}")
        if not ok:
          all_ok = False
    raise SystemExit(0 if all_ok else 1)

  parser.print_help()


if __name__ == "__main__":
  main()
