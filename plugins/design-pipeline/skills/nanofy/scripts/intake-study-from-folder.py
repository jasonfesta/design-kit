#!/usr/bin/env python3
"""nanofy intake (owned by jason-design-agent): turns a zip or folder of externally rendered
plates PLUS the prompt MDs that describe how the research and those plates were achieved into a
runnable <study-slug>/ with the single Design | Development moodboard — ready for nanofy-plates.py
(anchored Nano Banana refresh), thumbs up/down curation, and handoff to jason-dev-agent.

What the folder is expected to contain:
  - images for everything that will eventually be handed to jason-dev-agent (png/jpg/webp)
  - prompt MDs/TXTs beside them: one per plate (matched by stem / normalized stem / leading slot
    number), optionally one anchor/style-constitution MD, and any process/research notes.

When prompt MDs are present the folder is treated AS the jason-design-agent handoff:
  prompts/<slot>.md (+ prompts/01-anchor.md) = style constitution & per-slot composition,
  research/*.md = unpaired process/research notes, style-direction/direction.md = slot index.
When no MDs are found it falls back to plates-only mode (research: absent).

This script:
  1. Unzips/reads the source into <study-dir>/concepts/<pillar>/NN-<pillar>-NN-<slug>.<ext>
     (pillar from prompt-MD hints or filename tokens first, then aspect ratio).
  2. Measures every plate (natural px, 2k readiness hint) with ImageMagick.
  3. Writes prompt.md, selections.json (all 👍 by default), projects/dev-turns.json (zeroed),
     manifest.json, and a minimal index.html moodboard shell (Design | Development, 👍/👎,
     jason-dev-agent turn pill, prompt ↗ per card) if none exists.
  4. Optionally runs replicate-mock's extractor on the anchor plate (sampled hex tokens).

Runs 100% inside the standard sandbox (no network, no pip packages).
"""

import argparse
import datetime as dt
import json
import pathlib
import re
import shutil
import subprocess
import sys
import zipfile
from typing import Any

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}
# The five surfaces a designer dumps from an external Nano Banana session: desktop web, mobile web,
# application, components, experiences. `web` stays first so slot 01 (the nanofy anchor) is desktop.
PILLARS = ("web", "mobile-web", "app", "component", "experience")
TOKEN_TO_PILLAR = {
    "web": "web", "website": "web", "landing": "web", "desktop": "web", "page": "web", "site": "web",
    "mobileweb": "mobile-web", "mweb": "mobile-web", "mobilesite": "mobile-web", "390": "mobile-web", "responsive": "mobile-web",
    "app": "app", "mobile": "app", "ios": "app", "android": "app", "screen": "app", "tab": "app", "application": "app",
    "component": "component", "ui": "component", "widget": "component", "card": "component", "modal": "component", "components": "component",
    "experience": "experience", "3d": "experience", "game": "experience", "sandbox": "experience", "interactive": "experience", "experiences": "experience",
}
# `mobile` + any web token in the same name means mobile web (390px web), not the native app pillar.
MOBILE_WEB_PAIR = ({"mobile", "m", "phone"}, {"web", "website", "site", "landing", "page", "desktop"})
# The nanofy pass is itself jason-design-agent's first turn: intake + anchored refresh + moodboard = turn 1.
NANOFY_DESIGN_TURN = 1


def normalize_pillar_hint(raw: str) -> str | None:
  """`pillar: Mobile Web` / `mobile_web` / `desktop web` -> canonical pillar id, else None."""
  s = re.sub(r"[^a-z0-9]+", "-", (raw or "").lower()).strip("-")
  if not s:
    return None
  if s in PILLARS:
    return s
  if s in {"mobile-web", "mobileweb", "mobile-site", "m-web", "mweb", "mobile-landing"}:
    return "mobile-web"
  if s in {"desktop-web", "desktop", "website", "web-desktop"}:
    return "web"
  if s in {"application", "mobile-app", "native-app", "native"}:
    return "app"
  if s in {"components", "component-suite"}:
    return "component"
  if s in {"experiences", "interactive-experience", "interactive"}:
    return "experience"
  return TOKEN_TO_PILLAR.get(s.replace("-", ""))
REPLICATE_MOCK_EXTRACT = pathlib.Path("/usr/local/google/home/jfesta/skills/replicate-mock/scripts/prepare-and-extract-image.py")


def slugify(text: str) -> str:
  s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
  s = re.sub(r"-+", "-", s)
  return s or "plate"


def identify(path: pathlib.Path) -> tuple[int, int]:
  try:
    out = subprocess.run(["identify", "-format", "%w %h", str(path) + "[0]"], capture_output=True, text=True, check=True).stdout.split()
    return int(out[0]), int(out[1])
  except Exception:
    return 0, 0


def infer_pillar(name: str, w: int, h: int) -> tuple[str, str]:
  tokens = re.split(r"[^a-z0-9]+", name.lower())
  tset = set(tokens)
  # folder-style names: "mobile-web-01", "m-web", "mobile web hero" -> mobile-web before the generic app match
  if (tset & MOBILE_WEB_PAIR[0]) and (tset & MOBILE_WEB_PAIR[1]):
    return "mobile-web", "filename"
  for t in tokens:
    if t in TOKEN_TO_PILLAR:
      return TOKEN_TO_PILLAR[t], "filename"
  if w and h:
    ratio = h / w
    if ratio >= 1.6:
      return "app", "aspect(tall)"
    if ratio <= 0.8:
      return "web", "aspect(wide)"
    return "component", "aspect(square)"
  return "web", "default"


PROMPT_EXTS = {".md", ".txt"}
# Files that are study scaffolding, never Nano Banana prompts.
NON_PROMPT_NAMES = {"prompt.md", "readme.md", "manifest.md", "credits.md", "agents.md", "contributing.md"}


def collect_sources(source: pathlib.Path, staging: pathlib.Path) -> tuple[list[pathlib.Path], list[pathlib.Path], pathlib.Path]:
  """Returns (images, prompt_mds, root) found in a zip or folder. Prompt MDs/TXTs sit beside the images.
  Sub-folder structure (e.g. desktop-web/, mobile-web/, app/, components/, experiences/) is preserved so it can drive pillar inference."""
  if source.is_file() and source.suffix.lower() == ".zip":
    staging.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(source) as zf:
      for member in zf.infolist():
        name = member.filename
        if member.is_dir() or name.startswith("__MACOSX") or pathlib.Path(name).name.startswith("."):
          continue
        if pathlib.Path(name).suffix.lower() in IMAGE_EXTS | PROMPT_EXTS:
          rel = pathlib.Path(*[p for p in pathlib.Path(name).parts if p not in ("..", "")])
          target = staging / rel
          target.parent.mkdir(parents=True, exist_ok=True)
          with zf.open(member) as src, open(target, "wb") as dst:
            shutil.copyfileobj(src, dst)
    root = staging
  elif source.is_dir():
    root = source
  else:
    raise SystemExit(f"--source must be a .zip file or a folder: {source}")
  skip_parts = {"projects", "prompts", "style-direction", "critique", "research", "node_modules", "dist", "nano"}
  all_files = [p for p in sorted(root.rglob("*")) if p.is_file() and not p.name.startswith(".") and not (skip_parts & set(p.relative_to(root).parts[:-1]))]
  images = [p for p in all_files if p.suffix.lower() in IMAGE_EXTS]
  prompts = [p for p in all_files if p.suffix.lower() in PROMPT_EXTS and p.name.lower() not in NON_PROMPT_NAMES]
  return images, prompts, root


def infer_pillar_from_dirs(path: pathlib.Path, root: pathlib.Path) -> str | None:
  """Designer dumps usually arrive as desktop-web/ mobile-web/ app/ components/ experiences/ sub-folders:
  the nearest ancestor folder name that names a surface wins (ignores the `_imported` staging dir)."""
  try:
    parts = path.relative_to(root).parts[:-1]
  except ValueError:
    return None
  for part in reversed(parts):
    if part in ("_imported", "concepts"):
      continue
    hit = normalize_pillar_hint(part)
    if hit:
      return hit
    pillar, how = infer_pillar(part, 0, 0)
    if how == "filename":
      return pillar
  return None


def leading_number(stem: str) -> str | None:
  m = re.match(r"^\s*0*(\d{1,3})\b", stem)
  return m.group(1) if m else None


def pair_prompts(images: list[pathlib.Path], prompts: list[pathlib.Path]) -> tuple[dict[pathlib.Path, pathlib.Path], list[pathlib.Path], pathlib.Path | None]:
  """Pairs each image with its prompt MD: exact stem -> normalized stem -> leading slot number.
  MDs in the same sub-folder as the image are tried first (desktop-web/01-hero.md must not pair with mobile-web/01-hero.png).
  A single prompt shared by all images (or one tagged anchor/constitution/style) becomes the shared constitution."""
  by_image: dict[pathlib.Path, pathlib.Path] = {}
  used: set[pathlib.Path] = set()
  norm = lambda s: re.sub(r"[^a-z0-9]+", "", s.lower())
  for img in images:
    cand = None
    # same-folder prompts first, then the rest (only those not already claimed by another image)
    ordered = [p for p in prompts if p.parent == img.parent and p not in used] + [p for p in prompts if p.parent != img.parent and p not in used]
    same_dir = [p for p in ordered if p.parent == img.parent]
    for pool in (same_dir, ordered):
      for p in pool:
        if p.stem == img.stem:
          cand = p
          break
      if cand is None:
        for p in pool:
          if norm(p.stem) == norm(img.stem) or norm(p.stem).startswith(norm(img.stem)) or norm(img.stem).startswith(norm(p.stem)):
            cand = p
            break
      if cand is None:
        n = leading_number(img.stem)
        if n:
          for p in pool:
            if leading_number(p.stem) == n:
              cand = p
              break
      if cand is not None:
        break
    if cand is not None:
      by_image[img] = cand
      used.add(cand)
  leftovers = [p for p in prompts if p not in used]
  constitution = None
  for p in leftovers:
    if re.search(r"anchor|constitution|style|direction|system|master", p.stem, re.I):
      constitution = p
      break
  if constitution is None and len(prompts) == 1 and not by_image:
    constitution = prompts[0]
  leftovers = [p for p in leftovers if p != constitution]
  return by_image, leftovers, constitution


def read_prompt_hints(md: pathlib.Path) -> dict[str, str]:
  """Pulls optional `pillar:`/`slot:`/`title:` hints from frontmatter or the first lines of a prompt MD."""
  hints: dict[str, str] = {}
  try:
    head = md.read_text(encoding="utf-8", errors="ignore")[:4000]
  except OSError:
    return hints
  for key in ("pillar", "slot", "title", "category"):
    m = re.search(rf"^\s*(?:[-*]\s*)?{key}\s*[:=]\s*[`\"']?([^`\"'\n]+)", head, re.I | re.M)
    if m:
      hints[key] = m.group(1).strip()
  return hints


def write_index_html(study: pathlib.Path, items: list[dict[str, Any]], title: str) -> None:
  cards = []
  for it in items:
    prompt_link = f'<a href="{it["prompt"]}" target="_blank">prompt</a>' if it.get("prompt") else ""
    open_link = f'<a href="{it["plate"]}" target="_blank">open</a>'
    cards.append(
        f'<figure class="card" data-slug="{it["slug"]}" data-pillar="{it["pillar"]}">'
        f'<img src="{it["plate"]}" alt="{it["title"]}" loading="lazy" />'
        f'<figcaption><h2>{it["pillar"]} — {it["title"]}</h2>'
        f'<div class="actions">{open_link}{prompt_link}<button type="button" data-vote="up">approve</button>'
        f'<button type="button" data-vote="down">skip</button></div></figcaption></figure>'
    )
  filter_btns = "".join(
      f'<button type="button" data-filter="{p}" class="{"is-active" if p=="all" else ""}">{p}</button>'
      for p in ("all",) + PILLARS + ("approved",)
  )
  html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<style>
:root{{--bg:#0c0c0b;--fg:#ededec;--muted:#858481;--line:#1e1e1c;--faint:#494946}}
*{{box-sizing:border-box;margin:0;padding:0}}body{{background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Inter","Google Sans",system-ui,sans-serif;text-transform:lowercase;-webkit-font-smoothing:antialiased}}
button,a{{font:inherit;color:inherit;text-transform:lowercase;background:none;border:0;text-decoration:none;cursor:pointer}}
.page-header{{max-width:1760px;margin:0 auto;padding:14px 28px 0}}
.header-bar{{display:flex;align-items:baseline;justify-content:space-between;gap:24px;padding-bottom:12px;border-bottom:1px solid var(--line)}}
.header-left{{display:flex;align-items:baseline;gap:4px 16px;flex-wrap:wrap}}
.header-left h1{{font-size:15px;font-weight:500;letter-spacing:-0.01em}}.header-prompt{{font-size:14px;color:var(--muted)}}.header-turns{{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}}
.drawer-grid{{display:grid;grid-template-rows:0fr;opacity:0;pointer-events:none;transition:grid-template-rows .22s cubic-bezier(.22,1,.36,1),opacity .16s ease}}
.page-header:hover .drawer-grid,.page-header.is-pinned .drawer-grid,.page-header:has(:focus-visible) .drawer-grid{{grid-template-rows:1fr;opacity:1;pointer-events:auto}}
.drawer-inner{{overflow:hidden}}.drawer-body{{padding:14px 0 16px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;gap:10px}}
.meta-row{{display:grid;grid-template-columns:92px minmax(0,1fr);align-items:baseline;column-gap:16px}}
.meta-label{{font-size:13px;color:var(--faint)}}.meta-val{{display:flex;align-items:baseline;justify-content:space-between;gap:8px 24px;flex-wrap:wrap;font-size:13px;color:var(--muted)}}
.actions{{display:flex;align-items:center;gap:18px;font-size:13px;flex-wrap:wrap}}
.actions a,.actions button{{color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:1px;transition:color .15s ease,border-color .15s ease}}
.actions a:hover,.actions button:hover,.actions .is-active{{color:var(--fg);border-color:var(--fg)}}
.actions .status{{color:var(--faint)}}
main{{max-width:1760px;margin:0 auto;padding:16px 28px 96px;columns:3 340px;column-gap:32px}}
.card{{break-inside:avoid;margin:0 0 40px}}.card img{{display:block;width:100%;height:auto;border-radius:10px;border:1px solid var(--line);margin-bottom:12px}}
.card[data-vote="up"] img{{border-color:var(--fg)}}.card[data-vote="down"]{{opacity:.32}}
.card h2{{font-size:15px;font-weight:500;margin-bottom:8px}}
#dev .empty{{color:var(--muted);font-size:14px;padding:28px 0;column-span:all}}
</style></head><body>
<header class="page-header" id="hdr">
  <div class="header-bar">
    <div class="header-left">
      <h1><button type="button" id="pin-btn">{title}</button></h1>
      <span class="header-prompt">"imported folder study"</span>
    </div>
    <span class="header-turns" id="design-turns">1 design turn</span>
  </div>
  <div class="drawer-grid"><div class="drawer-inner"><div class="drawer-body">
    <div class="meta-row"><span class="meta-label">view</span><div class="meta-val">
      <div class="actions" role="tablist">
        <button type="button" class="is-active" data-view="design">design</button>
        <button type="button" data-view="dev">development</button>
      </div>
      <span class="actions"><span class="status" id="dev-turns">jason-dev-agent 0 turns</span></span>
    </div></div>
    <div class="meta-row"><span class="meta-label">filter</span><div class="meta-val">
      <nav class="actions filters">{filter_btns}</nav>
    </div></div>
    <div class="meta-row"><span class="meta-label">system</span><div class="meta-val">
      <span>one website · one mobile app · components · experiences (zero preview adjustments)</span>
    </div></div>
  </div></div></div>
</header>
<main id="design">{"".join(cards)}</main>
<main id="dev" hidden><p class="empty">development has not run yet. approve plates in design, then hand this folder to jason-dev-agent.</p></main>
<script>
const KEY='selections:v3:'+location.pathname;
const sel=JSON.parse(localStorage.getItem(KEY)||'null')||{{}};
const cards=[...document.querySelectorAll('#design .card')];
document.getElementById('pin-btn').addEventListener('click',()=>document.getElementById('hdr').classList.toggle('is-pinned'));
function paint(){{let n=0;cards.forEach(c=>{{const v=sel[c.dataset.slug]??'none';if(v==='up')n++;c.dataset.vote=v;c.querySelectorAll('[data-vote]').forEach(b=>{{const on=b.dataset.vote===v;b.classList.toggle('is-active',on);b.textContent=b.dataset.vote==='up'?(on?'approved':'approve'):(on?'skipped':'skip')}})}});const ap=document.querySelector('[data-filter="approved"]');if(ap)ap.textContent='approved ('+n+')'}}
cards.forEach(c=>c.querySelectorAll('[data-vote]').forEach(b=>b.addEventListener('click',()=>{{const cur=sel[c.dataset.slug]??'none';sel[c.dataset.slug]=cur===b.dataset.vote?'none':b.dataset.vote;localStorage.setItem(KEY,JSON.stringify(sel));paint()}})));
document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{{document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');const f=b.dataset.filter;cards.forEach(c=>{{const ok=f==='all'||(f==='approved'?(sel[c.dataset.slug]??'none')==='up':c.dataset.pillar===f);c.hidden=!ok}})}}));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{{document.querySelectorAll('[data-view]').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');document.getElementById('design').hidden=b.dataset.view!=='design';document.getElementById('dev').hidden=b.dataset.view!=='dev'}}));
fetch('projects/design-turns.json').then(r=>r.ok?r.json():null).then(d=>{{if(!d)return;const t=d.total_design_turns||1;document.getElementById('design-turns').textContent=t+(t===1?' design turn':' design turns')}}).catch(()=>{{}});
fetch('projects/dev-turns.json').then(r=>r.ok?r.json():null).then(d=>{{if(!d)return;const t=d.total_dev_turns||0;document.getElementById('dev-turns').textContent='jason-dev-agent '+t+(t===1?' turn':' turns');const items=d.items||[];if(!items.length)return;const dev=document.getElementById('dev');dev.innerHTML='';items.forEach(it=>{{const f=document.createElement('figure');f.className='card';f.innerHTML='<figcaption><h2>'+it.slug+'</h2>'+(it.dist?'<div class="actions"><a href="'+it.dist+'" target="_blank">open</a></div>':'')+'</figcaption>';dev.appendChild(f)}})}}).catch(()=>{{}});
paint();
</script></body></html>
"""
  (study / "index.html").write_text(html, encoding="utf-8")


def main() -> int:
  ap = argparse.ArgumentParser(description="nanofy intake: bootstrap a Design | Development study folder from a zip or folder of rendered plates + prompt MDs.")
  ap.add_argument("--source", required=True, help="Path to a .zip of images OR a folder containing images.")
  ap.add_argument("--study-dir", help="Target <study-slug>/ (default: the source folder itself, or <zip-stem>/ beside the zip).")
  ap.add_argument("--title", help="Study title (default: derived from folder/zip name).")
  ap.add_argument("--select", choices=["all", "none"], default="none", help="Initial approval state for selections.json (default: none).")
  ap.add_argument("--copy", action="store_true", help="Copy plates into concepts/<pillar>/ (default: move when source is the study dir, copy otherwise).")
  ap.add_argument("--extract-tokens", action="store_true", help="Run replicate-mock extractor on the anchor plate to sample hex tokens.")
  ap.add_argument("--force-index", action="store_true", help="Overwrite an existing index.html moodboard shell.")
  ap.add_argument("--design-agent-turns", type=int, default=None,
                  help="design_agent_turns budget the user gave jason-design-agent for this run (the nanofy pass consumes turn 1 of it).")
  args = ap.parse_args()

  source = pathlib.Path(args.source).expanduser().resolve()
  if args.study_dir:
    study = pathlib.Path(args.study_dir).expanduser().resolve()
  elif source.is_dir():
    study = source
  else:
    study = source.with_suffix("")
  study.mkdir(parents=True, exist_ok=True)
  # Guard: never re-bootstrap a jason-design-agent study (the harness path). Mode B is a fallback only.
  if (study / "selections.json").exists() and (study / "concepts").exists() and ((study / "research").exists() or (study / "style-direction").exists()) and not args.force_index:
    src_tag = "jason-design-agent" if not (study / "manifest.json").exists() else json.loads((study / "manifest.json").read_text()).get("mode", "imported")
    print(json.dumps({"passed": True, "skipped": True, "study_dir": str(study), "mode": src_tag,
                      "reason": "study already bootstrapped (selections.json + concepts/ + research|style-direction present) — nanofy / curate / hand to jason-dev-agent directly"}, indent=2))
    return 0
  title = args.title or study.name.replace("-", " ").replace("_", " ").strip() or "imported study"

  staging = study / "concepts" / "_imported"
  files, prompt_files, root = collect_sources(source, staging)
  if not files:
    print(json.dumps({"passed": False, "error": f"no images found in {source}"}, indent=2))
    return 1
  paired, unpaired_prompts, constitution = pair_prompts(files, prompt_files)

  measured = []
  for f in files:
    w, h = identify(f)
    hints = read_prompt_hints(paired[f]) if f in paired else {}
    hinted = normalize_pillar_hint(hints.get("pillar") or hints.get("category") or "")
    from_dirs = infer_pillar_from_dirs(f, root)
    # The designer's folder structure (desktop-web/ mobile-web/ application/ components/ experiences/) is the
    # authoritative surface map; an explicit `pillar:` line in the prompt MD is next, then filename, then aspect.
    if from_dirs:
      pillar, how = from_dirs, "folder"
    elif hinted:
      pillar, how = hinted, "prompt-md"
    else:
      pillar, how = infer_pillar(f.stem, w, h)
      if how not in ("filename",) and f in paired:
        p2, how2 = infer_pillar(paired[f].stem, 0, 0)
        if how2 == "filename":
          pillar, how = p2, "prompt-filename"
    measured.append({"src": f, "w": w, "h": h, "pillar": pillar, "pillar_source": how, "prompt": paired.get(f), "title_hint": hints.get("title")})
  # Web first so slot 01 is the anchor; within a pillar, 2k/largest plates lead so the anchor is the strongest plate.
  order = {p: i for i, p in enumerate(PILLARS)}
  measured.sort(key=lambda m: (order[m["pillar"]], -(max(m["w"], m["h"]) >= 1920), -(m["w"] * m["h"]), m["src"].name.lower()))

  items: list[dict[str, Any]] = []
  per_pillar: dict[str, int] = {p: 0 for p in PILLARS}
  zip_mode = source.is_file()
  move_mode = zip_mode or ((source == study) and not args.copy)
  prompts_dir = study / "prompts"
  for idx, m in enumerate(measured, start=1):
    per_pillar[m["pillar"]] += 1
    n = per_pillar[m["pillar"]]
    slug_part = slugify(m["src"].stem)[:40]
    slug = f"{idx:02d}-{m['pillar']}-{n:02d}-{slug_part}"
    dest_dir = study / "concepts" / m["pillar"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{slug}{m['src'].suffix.lower()}"
    if m["src"].resolve() != dest.resolve():
      if move_mode:
        shutil.move(str(m["src"]), str(dest))
      else:
        shutil.copy2(m["src"], dest)
    prompt_rel = None
    if m["prompt"] is not None:
      prompts_dir.mkdir(exist_ok=True)
      pdest = prompts_dir / f"{slug}.md"
      if m["prompt"].resolve() != pdest.resolve():
        (shutil.move if move_mode else shutil.copy2)(str(m["prompt"]), str(pdest))
      prompt_rel = str(pdest.relative_to(study))
    long_edge = max(m["w"], m["h"])
    # provenance: where this plate / MD physically came from in the designer's dump (the inspiration trace)
    try:
      origin_rel = str(m["src"].relative_to(root))
    except ValueError:
      origin_rel = m["src"].name
    items.append({
        "slug": slug,
        "index": idx,
        "pillar": m["pillar"],
        "pillar_source": m["pillar_source"],
        "title": m["title_hint"] or m["src"].stem.replace("-", " ").replace("_", " "),
        "plate": str(dest.relative_to(study)),
        "prompt": prompt_rel,
        "origin": {"source": str(source), "plate": origin_rel,
                   "prompt": (str(m["prompt"].relative_to(root)) if m["prompt"] is not None and m["prompt"].is_relative_to(root) else (m["prompt"].name if m["prompt"] is not None else None))},
        "generated": False,
        "natural_px": f"{m['w']}x{m['h']}",
        "is_2k": long_edge >= 1920,
        "readiness_hint": "ok" if long_edge >= 1920 else f"below_2k (long edge {long_edge}px) — expect upscale-queue slots",
        "selected": args.select == "all",
    })

  # Promote the folder's MDs to the jason-design-agent handoff equivalent.
  sd = study / "style-direction"
  research_dir = study / "research"
  constitution_rel = None
  if constitution is not None:
    prompts_dir.mkdir(exist_ok=True)
    cdest = prompts_dir / "01-anchor.md"
    if constitution.resolve() != cdest.resolve():
      (shutil.move if move_mode else shutil.copy2)(str(constitution), str(cdest))
    constitution_rel = str(cdest.relative_to(study))
  elif items and items[0]["prompt"]:
    constitution_rel = items[0]["prompt"]  # slot 01's own prompt is the anchor constitution
  research_rel: list[str] = []
  for p in unpaired_prompts:
    research_dir.mkdir(exist_ok=True)
    rdest = research_dir / p.name
    if p.resolve() != rdest.resolve():
      (shutil.move if move_mode else shutil.copy2)(str(p), str(rdest))
    research_rel.append(str(rdest.relative_to(study)))
  paired_count = sum(1 for it in items if it["prompt"])
  has_prompts = paired_count > 0 or constitution_rel is not None or bool(research_rel)
  if has_prompts:
    sd.mkdir(exist_ok=True)
    lines = [f"# direction (from imported prompt MDs)\n", f"- anchor / style constitution: `{constitution_rel or 'n/a'}`\n", f"- paired slot prompts: {paired_count}/{len(items)}\n"]
    if research_rel:
      lines.append("- research / process notes (unpaired MDs): " + ", ".join(f"`{r}`" for r in research_rel) + "\n")
    lines.append("\n| slot | pillar | plate | prompt |\n| :-- | :-- | :-- | :-- |\n")
    for it in items:
      lines.append(f"| {it['index']:02d} | {it['pillar']} | `{it['plate']}` | {('`' + it['prompt'] + '`') if it['prompt'] else '—'} |\n")
    (sd / "direction.md").write_text("".join(lines), encoding="utf-8")
  if staging.exists():
    shutil.rmtree(staging, ignore_errors=True)

  now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
  (study / "projects").mkdir(exist_ok=True)
  (study / "critique").mkdir(exist_ok=True)

  (study / "selections.json").write_text(json.dumps({
      "source": "imported+prompts" if has_prompts else "imported",
      "updated_at": now,
      "items": [{"slug": it["slug"], "pillar": it["pillar"], "plate": it["plate"], "prompt": it["prompt"], "selected": it["selected"]} for it in items],
  }, indent=2) + "\n", encoding="utf-8")

  dev_turns = study / "projects" / "dev-turns.json"
  if not dev_turns.exists():
    dev_turns.write_text(json.dumps({"total_dev_turns": 0, "per_stage_turns": {}, "per_item_turns": {}, "items": [], "updated_at": now}, indent=2) + "\n", encoding="utf-8")

  # The nanofy pass IS jason-design-agent's first turn for a folder-started study: intake + anchored
  # Nano Banana refresh + moodboard = design turn 1. Remaining turns (if any) go to design-critique talk-backs.
  budget = args.design_agent_turns
  design_turns = study / "projects" / "design-turns.json"
  if not design_turns.exists():
    design_turns.write_text(json.dumps({
        "total_design_turns": NANOFY_DESIGN_TURN,
        "design_agent_turns_budget": budget,
        "remaining_design_turns": (max(budget - NANOFY_DESIGN_TURN, 0) if budget is not None else None),
        "turns": [{"turn": NANOFY_DESIGN_TURN, "stage": "nanofy", "status": "intake", "source": str(source),
                   "note": "folder intake + anchored nano banana refresh + moodboard; counts as one design turn (equivalent to research -> style-direction -> image-gen -> moodboard)"}],
        "updated_at": now,
    }, indent=2) + "\n", encoding="utf-8")

  prompt_md = study / "prompt.md"
  if not prompt_md.exists():
    if has_prompts:
      research_line = (
          f"- research & prompts: **provided by the imported MDs** ({paired_count}/{len(items)} plates paired, "
          f"anchor `{constitution_rel or 'n/a'}`, {len(research_rel)} process/research notes in `research/`) — treat as the jason-design-agent handoff\n"
      )
      rules = (
          "## imported study rules (plates + prompt MDs) — jason-design-agent intake via nanofy\n\n"
          "1. Treat `prompts/*.md` as the locked style constitution + per-slot composition (what jason-design-agent's `style-direction/` and `prompts/` would have been); `style-direction/direction.md` indexes them.\n"
          "2. `research/*.md` (unpaired MDs) describe how the research and plates were achieved — use them as the inspiration record in every `design-critique` talk-back.\n"
          "3. No benchmark screenshots exist; do not invent benchmarks. `critique/final-design-signoff.md` states `research: imported prompt MDs (no benchmark captures)`.\n"
      )
    else:
      research_line = "- research: absent — no prompt MDs were found beside the plates (no `research/*.md`, `style-direction/`, or `canon.md`)\n"
      rules = (
          "## imported study rules (plates only) — jason-design-agent intake via nanofy\n\n"
          "1. Treat the plates as the only visual authority; sample tokens from them (`style-direction/tokens-from-plates.json`).\n"
          "2. `design-critique` talk-backs judge against the plates (and any inspiration the user attaches), not benchmark dossiers.\n"
          "3. `critique/final-design-signoff.md` must state `research: not available (imported plates)`.\n"
      )
    prompt_md.write_text(
        f"# {title}\n\n"
        f"- source: imported ({'zip' if zip_mode else 'folder'}: `{source}`)\n"
        f"- design_agent_turns: {NANOFY_DESIGN_TURN}" + (f" of {budget}" if budget is not None else "") +
        " (turn 1 = nanofy: folder intake + anchored Nano Banana refresh + moodboard — stands in for research -> style-direction -> image-gen; counted exactly like a generated design turn)\n"
        + research_line +
        f"- plates: {len(items)} ({', '.join(f'{p}={per_pillar[p]}' for p in PILLARS if per_pillar[p])})\n"
        f"- anchor: `{items[0]['plate']}`\n\n" + rules,
        encoding="utf-8",
    )

  tokens_path = None
  if args.extract_tokens and REPLICATE_MOCK_EXTRACT.exists():
    sd.mkdir(exist_ok=True)
    ws = sd / "anchor-extract"
    subprocess.run([sys.executable, str(REPLICATE_MOCK_EXTRACT), f"--input_image={study / items[0]['plate']}", f"--workspace_dir={ws}"],
                   capture_output=True, text=True, check=False)
    lm = ws / "layout_metrics.json"
    if lm.exists():
      tokens_path = sd / "tokens-from-plates.json"
      shutil.copy2(lm, tokens_path)

  if args.force_index or not (study / "index.html").exists():
    write_index_html(study, items, title)

  manifest = {
      "passed": True,
      "study_dir": str(study),
      "source": str(source),
      "mode": "imported+prompts" if has_prompts else "imported",
      "has_prompts": has_prompts,
      "prompts_paired": paired_count,
      "anchor_prompt": constitution_rel,
      "research_notes": research_rel,
      "has_research": bool(research_rel),
      "has_style_direction": has_prompts or tokens_path is not None,
      "tokens_from_plates": str(tokens_path) if tokens_path else None,
      "counts": per_pillar,
      "pillars": list(PILLARS),
      "design_agent_turns": NANOFY_DESIGN_TURN,
      "design_agent_turns_budget": budget,
      "design_turn_stage": "nanofy",
      "below_2k_count": sum(1 for it in items if not it["is_2k"]),
      "items": items,
      "next": [
          f"open {study / 'index.html'} and approve/skip plates (0 approved by default)",
          f"nanofy: python3 nanofy-plates.py plan --study={study} --variation 0.5 -> run-anchor -> verify-anchor -> note -> run -> verify -> switch; then approve/skip in index.html and hand to jason-dev-agent",
      ],
  }
  (study / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
  print(json.dumps(manifest, indent=2))
  return 0


if __name__ == "__main__":
  sys.exit(main())
