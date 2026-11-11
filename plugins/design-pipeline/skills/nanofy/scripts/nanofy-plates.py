#!/usr/bin/env python3
"""nanofy — anchored Nano Banana refresh of imported plates (jason-design-agent start-from-folder path).

Anything handed to jason-dev-agent that did NOT come from jason-design-agent gets "nanofied"
before image-to-react: every plate is re-output through Nano Banana so the imagery is fresh,
safe, and most-recently generated — at >= 1k, in the SAME format and SAME pixel size it arrived
in — with a slight, consistent, unique take dialed in from 0.1 to 0.5 (default 0.5).

It also emits one nano-based prompt MD per plate (nano/prompts/<slug>.md): the imported prompt MD
(style direction) folded into the final Nano Banana prompt + the anchor refinement note, so the nanofied
study has new images AND new MDs. This whole pass is jason-design-agent turn 1 for a folder-started study.

Hub-and-spoke:
  1. anchor  = slot 01 (the desktop/web plate). It is reimagined by `--variation` (0.0 = pure mirror,
               0.1 = barely perceptible, 0.5 = noticeable but faithful). Invariants are never touched:
               all titling/copy verbatim, logos & wordmarks, product UI (buttons, nav, cards, prices),
               layout positions, sizes, aspect, format.
  2. note    = after the anchor passes verify-anchor, the agent writes a one-paragraph refinement
               note describing exactly what changed (materials, light, grain, color temperature ...).
  3. spokes  = every other plate is re-output with the SAME refinement applied (note + before/after
               anchor as reference images where the route supports it), keeping its own layout/copy.

Outputs land in <study>/nano/<pillar>/<same filename>; downstream skills peer into nano/.

Sub-commands:
  plan           --variation V   -> nano/nanofy-plan.json + nano/README.md (no model calls)
  run-anchor     --route=...     -> generates/locks the anchor only
  verify-anchor                  -> same size/format, >= 1k, fresh, sharp, drift inside the variation band
  note           --text "..."    -> records the refinement note and finalizes spoke prompts
  run            --route=...     -> generates/locks all spokes (anchor skipped if already locked)
  verify                         -> all plates: size, format, >= 1k, fresh, sharp, drift band; report
  switch                         -> repoints selections.json / manifest.json / index.html to nano/
"""

import argparse
import datetime as dt
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
from typing import Any

GEMPIX = "/google/bin/releases/gempix/gempix-1/gempix"
READINESS = pathlib.Path("/usr/local/google/home/jfesta/skills/nano-banana/scripts/eval-image-readiness.py")
MIN_LONG_EDGE = 1024
MIN_SHORT_EDGE = 1024

INVARIANTS = (
    "HARD INVARIANTS (never change): every piece of text, titling, headline, label, price, and copy stays verbatim "
    "and in place; logos, wordmarks, and brand marks stay pixel-faithful; all product UI (navigation, buttons, pills, "
    "cards, inputs, tabs, icons) keeps its exact position, size, shape, and meaning; the layout grid, spacing, "
    "aspect ratio, framing, and crop stay identical; no borders, no watermarks, no captions, nothing added or removed."
)

MIRROR_PROMPT = (
    "Re-output this exact UI design plate 1:1 as a fresh, clean, high-quality render. Mirror it precisely: identical "
    "layout, grid, typography, copy, colors (same hex values), spacing, imagery, crops, shadows, and corner radii. "
    "Only remove compression artifacts, dithering, and softness so every edge, glyph, and photo is crisp. " + INVARIANTS
)

# variation dial -> (label, latitude sentence, drift band on 8x8 MAE 0..255)
VARIATION_LEVELS = [
    (0.00, "mirror", "Change nothing about the design.", (0.0, 14.0)),
    (0.10, "barely perceptible", "Take a barely perceptible unique stance: refine only light falloff, shadow softness, surface grain, and micro-contrast so the plate feels more considered. Keep every color family and every photo subject exactly as is.", (1.0, 18.0)),
    (0.20, "subtle", "Take a subtle unique stance: refine materials and finish (paper tooth, glass, metal, fabric), light direction and softness, grain, and color temperature by a small, tasteful amount. Photo subjects, poses, and compositions stay the same.", (2.0, 24.0)),
    (0.30, "gentle", "Take a gentle unique stance: a slightly more atmospheric, elevated art direction in materials, lighting, depth, and photographic grade. Keep every photo subject, pose, and composition; keep every color family.", (3.0, 30.0)),
    (0.40, "noticeable", "Take a noticeable but faithful unique stance: richer materiality, more deliberate light and shadow, a refined photographic grade, and tasteful background texture. Photo subjects and compositions stay recognisably the same.", (4.0, 36.0)),
    (0.50, "distinct", "Take a distinct but faithful unique stance: a clearly elevated art direction in materials, lighting, atmosphere, grain, and photographic grade — the same design, executed with more taste. Photo subjects and compositions stay the same.", (6.0, 42.0)),
]


def variation_level(v: float) -> tuple[float, str, str, tuple[float, float]]:
  v = max(0.0, min(0.5, float(v)))
  best = VARIATION_LEVELS[0]
  for lvl in VARIATION_LEVELS:
    if v >= lvl[0] - 1e-9:
      best = lvl
  return best


def anchor_prompt(v: float, source_prompt: str | None = None) -> str:
  _, label, latitude, _ = variation_level(v)
  if label == "mirror":
    return MIRROR_PROMPT + style_context(source_prompt)
  return (
      f"Re-output this UI design plate as a fresh, high-quality render with a slight unique take (variation {v:.1f} of 0.5, {label}). "
      f"{latitude} Remove compression artifacts, dithering, and softness so every edge, glyph, and photo is crisp. " + INVARIANTS
      + style_context(source_prompt)
  )


def spoke_prompt(v: float, note: str | None, source_prompt: str | None = None) -> str:
  _, label, _, _ = variation_level(v)
  if label == "mirror":
    return MIRROR_PROMPT + style_context(source_prompt)
  base = (
      f"Re-output this UI design plate as a fresh, high-quality render and apply EXACTLY the same refinement that was applied "
      f"to the anchor plate of this design system (variation {v:.1f}, {label}) — the same materials, light, grain, color "
      f"temperature, and photographic grade — so all plates read as one consistent set. This plate keeps its OWN layout, "
      f"copy, and imagery; do not import anything from the anchor except the refinement treatment. "
  )
  if note:
    base += f"Refinement applied to the anchor (replicate it here): {note.strip()} "
  base += "Remove compression artifacts, dithering, and softness so every edge, glyph, and photo is crisp. " + INVARIANTS
  return base + style_context(source_prompt)


STYLE_CONTEXT_MAX_CHARS = 1400


def style_context(source_prompt: str | None) -> str:
  """Folds the imported prompt MD (the style direction that produced the plate) into the nano prompt so the
  re-output honours the original art direction — fonts, palette, materials, canon — while the variation dial
  only moves materials/light/grain/grade. Frontmatter-style hint lines are dropped; long MDs are truncated."""
  if not source_prompt:
    return ""
  lines = []
  for ln in source_prompt.splitlines():
    s = ln.strip()
    if not s or s == "---" or re.match(r"^(pillar|slot|title|category)\s*[:=]", s, re.I):
      continue
    lines.append(s)
  text = " ".join(lines)
  if len(text) > STYLE_CONTEXT_MAX_CHARS:
    text = text[:STYLE_CONTEXT_MAX_CHARS].rsplit(" ", 1)[0] + " …"
  return (" STYLE DIRECTION OF THIS PLATE (from the imported prompt MD; honour it, do not re-interpret it): " + text)


def read_source_prompt(study: pathlib.Path, item: dict[str, Any]) -> str | None:
  rel = item.get("prompt")
  if not rel:
    return None
  p = study / rel
  try:
    return p.read_text(encoding="utf-8", errors="ignore") if p.exists() else None
  except OSError:
    return None


def nano_prompt_md_path(study: pathlib.Path, job: dict[str, Any]) -> pathlib.Path:
  return study / "nano" / "prompts" / f"{job['slug']}.md"


# ── gap fill: make sure every surface has enough plates ───────────────────────────────────────────
PILLARS = ("web", "mobile-web", "app", "component", "experience")
PILLAR_LABEL = {"web": "desktop web", "mobile-web": "mobile web (390px)", "app": "native application", "component": "component", "experience": "interactive experience"}
PILLAR_DEFAULT_PX = {"web": (2752, 1536), "mobile-web": (1536, 2752), "app": (1536, 2752), "component": (2400, 1792), "experience": (2752, 1536)}
# what the three canonical slots of each surface usually cover — used to brief missing plates sensibly
PILLAR_SLOT_ROLES = {
    "web": ["landing hero page", "secondary page (pricing, catalog, or detail)", "deep page (dashboard, docs, or account)"],
    "mobile-web": ["mobile landing hero", "mobile secondary page", "mobile deep page"],
    "app": ["home / first-run screen", "core task screen", "detail or settings screen"],
    "component": ["primary interactive card or module", "navigation, filter, or control cluster", "data, pricing, or status module"],
    "experience": ["signature interactive hero experience", "explorable 3d or spatial scene", "playful tactile or motion experience"],
}


def fill_prompt(pillar: str, role: str, v: float, note: str | None, constitution: str | None,
                siblings: list[str], brief: str | None) -> str:
  """Prompt for a plate that did NOT exist in the folder: same design system as the anchor (and its refinement),
  briefed by the agent from the breadth of everything else that came in (other surfaces' plates + MDs)."""
  _, label, _, _ = variation_level(v)
  ew, eh = PILLAR_DEFAULT_PX[pillar]
  p = (
      f"Create a NEW {PILLAR_LABEL[pillar]} design plate for this product — the {role} — that belongs to exactly the same design system "
      f"as the attached anchor plate: same brand, same logo and wordmark, same typography (same families, weights, and letterform anatomy), "
      f"same color tokens, same materials, light, grain, and photographic grade (the anchor refinement at variation {v:.1f}, {label}), "
      f"same grid rhythm, corner radii, button and pill geometry, and optical padding. It must read as a sibling made by the same designer on the same day. "
  )
  if note:
    p += f"Refinement already applied to the anchor (replicate it here): {note.strip()} "
  if brief:
    p += f"CONCEPT OF THIS PLATE (authored by jason-design-agent from the rest of the set): {brief.strip()} "
  if siblings:
    p += "Plates that already exist in this set (do not duplicate them; complement them): " + "; ".join(siblings[:12]) + ". "
  p += (
      f"Complete, buildable, production-grade UI with real copy in the product's voice (no lorem ipsum), a complete footer or end state where the surface has one, "
      f"no borders, no watermarks, no captions, no device mockups or hands. Output {ew}x{eh} px, crisp edges and glyphs."
  )
  return p + style_context(constitution)


def read_constitution(study: pathlib.Path) -> str | None:
  for rel in ("prompts/01-anchor.md", "style-direction/direction.md"):
    p = study / rel
    if p.exists():
      try:
        return p.read_text(encoding="utf-8", errors="ignore")
      except OSError:
        pass
  return None


def pillar_typical_px(jobs: list[dict[str, Any]], pillar: str) -> tuple[int, int]:
  sizes = [j["expected_px"] for j in jobs if j["pillar"] == pillar and j["role"] in ("anchor", "spoke")]
  if sizes:
    best = max(set(sizes), key=sizes.count)
    w, h = best.split("x")
    return int(w), int(h)
  return PILLAR_DEFAULT_PX[pillar]


def write_nano_prompt_md(study: pathlib.Path, plan: dict[str, Any], job: dict[str, Any]) -> str:
  """One nano-based MD per plate beside the new image set: how this plate was re-output (role, variation,
  refinement note, final Nano Banana prompt, source plate + source prompt MD, output, status). These are
  the prompt MDs of the nanofied study — downstream reads nano/prompts/ the way it would read prompts/."""
  p = nano_prompt_md_path(study, job)
  p.parent.mkdir(parents=True, exist_ok=True)
  v = plan["variation"]
  note = plan.get("refinement_note")
  is_fill = job["role"] == "fill"
  body = [
      f"# {job['slug']} — nano {job['role']} (variation {v:.1f} {plan['variation_label']})\n",
      f"- pillar: {job['pillar']}",
      f"- role: {job['role']}" + ("" if job["role"] == "anchor" else f" (inherits anchor `{plan['anchor_slug']}`)"),
      (f"- generated: yes — this plate did not exist in the folder; briefed from the rest of the set to complete the {PILLAR_LABEL[job['pillar']]} surface ({job.get('fill_role')})"
       if is_fill else f"- source plate: `{job['source']}` ({job['source_px']} {job['source_format']})"),
      f"- source prompt md: {('`' + job['source_prompt_md'] + '`') if job.get('source_prompt_md') else ('constitution `prompts/01-anchor.md` + sibling MDs' if is_fill else 'none (plate arrived without a prompt MD)')}",
      f"- nano output: `{job['output']}` ({job['expected_px']} {job['expected_format']}" + (", lifted to 1k" if job.get("lifted_to_1k") else "") + ")",
      f"- reference images: {', '.join('`' + r + '`' for r in job.get('reference_images', [])) or 'none'}",
      f"- status: {job.get('status', 'planned')}",
  ]
  origin = job.get("origin")
  if origin:
    body.append(f"- trace: dump `{origin.get('source')}` → plate `{origin.get('plate')}`" + (f" + md `{origin.get('prompt')}`" if origin.get("prompt") else "") + f" → `{job['source']}` → `{job['output']}`")
  elif is_fill:
    body.append(f"- trace: generated from anchor `{plan['anchor_slug']}` + the imported set (see `inspiration/manifest.json`)")
  body += ["", "## refinement note (applied to the anchor first, then to every spoke)\n",
           (note or "_not recorded yet — written after `verify-anchor` via `note --text`_"), ""]
  if is_fill:
    body += ["## concept brief (jason-design-agent)\n", (job.get("brief") or "_not written yet — `brief --slug " + job["slug"] + " --text \"…\"`_"), ""]
  body += ["## nano banana prompt (final, as sent)\n", "```text", job["prompt"], "```", "",
           "## invariants\n",
           ("same design system as the anchor · brand, type, tokens, materials · complete buildable UI · same px/format discipline as its surface" if is_fill else
            "titling/copy verbatim · logos & wordmarks · product UI · layout grid, spacing, aspect, framing · same pixel size · same format · >= 1k"), ""]
  p.write_text("\n".join(body) + "\n", encoding="utf-8")
  return str(p.relative_to(study))


def magick_identify(path: pathlib.Path) -> tuple[int, int, str]:
  try:
    out = subprocess.run(["identify", "-format", "%w %h %m", str(path) + "[0]"], capture_output=True, text=True, check=True).stdout.split()
    return int(out[0]), int(out[1]), out[2].upper()
  except Exception:
    return 0, 0, "?"


def fmt_from_suffix(suffix: str) -> str:
  return {"png": "PNG", "jpg": "JPEG", "jpeg": "JPEG", "webp": "WEBP"}.get(suffix.lower().lstrip("."), "PNG")


def expected_size(w: int, h: int) -> tuple[int, int, bool]:
  """Same size as input; if either edge is below 1k (1024px), lift proportionally so min(w, h) >= 1024 (flagged)."""
  short_edge = min(w, h)
  if short_edge >= MIN_SHORT_EDGE or short_edge == 0:
    return w, h, False
  scale = MIN_SHORT_EDGE / short_edge
  return round(w * scale), round(h * scale), True


def load_items(study: pathlib.Path) -> list[dict[str, Any]]:
  mf = study / "manifest.json"
  if mf.exists():
    items = json.loads(mf.read_text(encoding="utf-8")).get("items") or []
    if items:
      return items
  items = []
  for p in sorted((study / "concepts").rglob("*")):
    if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"} and p.parent.name != "_imported":
      items.append({"slug": p.stem, "pillar": p.parent.name, "plate": str(p.relative_to(study))})
  return items


def plan_path(study: pathlib.Path) -> pathlib.Path:
  return study / "nano" / "nanofy-plan.json"


def load_plan(study: pathlib.Path) -> dict[str, Any] | None:
  p = plan_path(study)
  return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None


def save_plan(study: pathlib.Path, plan: dict[str, Any]) -> None:
  plan_path(study).write_text(json.dumps(plan, indent=2) + "\n", encoding="utf-8")


def gempix_cmd(src: pathlib.Path, raw: pathlib.Path, size_flag: str, prompt: str) -> str:
  return f'{GEMPIX} --input_image="{src}" --output_image="{raw}" --image_size={size_flag} --prompt="{prompt}"'


def cmd_plan(study: pathlib.Path, image_size: str, variation: float, target_per_pillar: int = 3) -> int:
  items = load_items(study)
  if not items:
    print(json.dumps({"passed": False, "error": f"no plates found under {study / 'concepts'}"}, indent=2))
    return 1
  v, label, latitude, band = variation_level(variation)
  nano = study / "nano"
  nano.mkdir(exist_ok=True)
  # anchor = slot 01 if present (web/desktop), else the first web plate, else the first item
  anchor_idx = 0
  for i, it in enumerate(items):
    if str(it.get("slug", "")).startswith("01-") or it.get("index") == 1:
      anchor_idx = i
      break
  else:
    for i, it in enumerate(items):
      if it.get("pillar") == "web":
        anchor_idx = i
        break
  jobs = []
  for i, it in enumerate(items):
    src = study / it["plate"]
    w, h, fmt = magick_identify(src)
    ew, eh, lifted = expected_size(w, h)
    rel_out = pathlib.Path("nano") / pathlib.Path(it["plate"]).relative_to("concepts")
    (study / rel_out).parent.mkdir(parents=True, exist_ok=True)
    raw = (study / rel_out).with_name((study / rel_out).stem + ".raw.png")
    size_flag = image_size
    role = "anchor" if i == anchor_idx else "spoke"
    source_prompt = read_source_prompt(study, it)
    prompt = anchor_prompt(v, source_prompt) if role == "anchor" else spoke_prompt(v, None, source_prompt)
    jobs.append({
        "slug": it.get("slug", src.stem),
        "role": role,
        "pillar": it.get("pillar", pathlib.Path(it["plate"]).parent.name),
        "source": it["plate"],
        "source_prompt_md": it.get("prompt"),
        "origin": it.get("origin"),
        "title": it.get("title", src.stem),
        "output": str(rel_out),
        "nano_prompt_md": str(pathlib.Path("nano") / "prompts" / f"{it.get('slug', src.stem)}.md"),
        "raw_output": str(raw.relative_to(study)),
        "source_px": f"{w}x{h}",
        "source_format": fmt,
        "expected_px": f"{ew}x{eh}",
        "expected_format": fmt_from_suffix(src.suffix),
        "lifted_to_1k": lifted,
        "image_size": size_flag,
        "prompt": prompt,
        "reference_images": [] if role == "anchor" else ["<anchor source>", "<anchor output>"],
        "gempix_cmd": gempix_cmd(src, raw, size_flag, prompt),
        "lock_cmd": f'magick "{raw}" -colorspace sRGB -strip -filter Lanczos -resize "{ew}x{eh}!" "{study / rel_out}"',
        "status": "planned",
    })
  anchor_job = jobs[anchor_idx]
  for j in jobs:
    if j["role"] == "spoke":
      j["reference_images"] = [anchor_job["source"], anchor_job["output"]]
  # ── gap fill: every surface needs at least `target_per_pillar` plates (default 3). Anything the folder is
  # missing is generated as a NEW plate in the same design system, briefed by the agent from the rest of the set.
  # Surfaces with MORE than the target are simply all nanofied — nothing is dropped.
  constitution = read_constitution(study)
  sibling_titles = [f"{j['pillar']} · {j.get('title', j['slug'])}" for j in jobs]
  coverage: dict[str, dict[str, int]] = {}
  fills: list[dict[str, Any]] = []
  next_index = len(jobs)
  for pillar in PILLARS:
    have = sum(1 for j in jobs if j["pillar"] == pillar)
    need = max(target_per_pillar - have, 0)
    coverage[pillar] = {"have": have, "target": target_per_pillar, "fill": need}
    for k in range(need):
      next_index += 1
      n = have + k + 1
      role = PILLAR_SLOT_ROLES[pillar][min(n - 1, len(PILLAR_SLOT_ROLES[pillar]) - 1)]
      slug = f"{next_index:02d}-{pillar}-{n:02d}-generated-{re.sub(r'[^a-z0-9]+', '-', role.lower()).strip('-')[:32]}"
      ew, eh = pillar_typical_px(jobs, pillar)
      rel_out = pathlib.Path("nano") / pillar / f"{slug}.png"
      (study / rel_out).parent.mkdir(parents=True, exist_ok=True)
      raw = (study / rel_out).with_name(slug + ".raw.png")
      size_flag = image_size
      prompt = fill_prompt(pillar, role, v, None, constitution, sibling_titles, None)
      fills.append({
          "slug": slug, "role": "fill", "fill_role": role, "pillar": pillar, "title": f"{PILLAR_LABEL[pillar]} {n:02d} — {role} (generated)",
          "source": anchor_job["source"], "source_prompt_md": None, "origin": None,
          "output": str(rel_out), "nano_prompt_md": str(pathlib.Path("nano") / "prompts" / f"{slug}.md"),
          "raw_output": str(raw.relative_to(study)), "source_px": "n/a", "source_format": "n/a",
          "expected_px": f"{ew}x{eh}", "expected_format": "PNG", "lifted_to_1k": False, "image_size": size_flag,
          "brief": None, "prompt": prompt,
          "reference_images": [anchor_job["output"]] + [j["output"] for j in jobs if j["pillar"] == pillar],
          "gempix_cmd": gempix_cmd(study / anchor_job["source"], raw, size_flag, prompt),
          "lock_cmd": f'magick "{raw}" -colorspace sRGB -strip -filter Lanczos -resize "{ew}x{eh}!" "{study / rel_out}"',
          "status": "needs-brief",
      })
  jobs.extend(fills)
  plan = {
      "study_dir": str(study),
      "created_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
      "variation": v,
      "variation_label": label,
      "variation_latitude": latitude,
      "drift_band_mae_8x8": {"min": band[0], "max": band[1]},
      "anchor_slug": anchor_job["slug"],
      "refinement_note": None,
      "target_per_pillar": target_per_pillar,
      "coverage": coverage,
      "policy": {
          "why": "imported plates did not come from jason-design-agent; nanofy before image-to-react",
          "same_format": True, "same_size": True, "min_long_edge_px": MIN_LONG_EDGE,
          "invariants": "titling/copy verbatim, logos/wordmarks, product UI, layout, aspect, format",
          "hub_and_spoke": "anchor reimagined by --variation first; refinement note propagated to every spoke",
          "gap_fill": f"every surface reaches >= {target_per_pillar} plates; missing ones are generated in the anchor's design system after a jason-design-agent brief; surplus plates are all nanofied",
      },
      "calls": len(jobs),
      "calls_refresh": len(jobs) - len(fills),
      "calls_fill": len(fills),
      "jobs": jobs,
  }
  save_plan(study, plan)
  for j in jobs:
    write_nano_prompt_md(study, plan, j)
  (nano / "README.md").write_text(
      "# nano/ — nanofied plates (anchored Nano Banana refresh)\n\n"
      "These plates did not come from `jason-design-agent`. Before `image-to-react`, every plate in `concepts/` was re-output "
      f"through Nano Banana at variation **{v:.1f}** ({label}): the anchor (`{anchor_job['slug']}`, the desktop web plate) took a slight unique stance first, "
      "then the same refinement was applied to every other plate. Titling, logos, product UI, layout, size, and format never change.\n\n"
      f"- calls: {len(jobs)} (1 anchor + {len(jobs) - len(fills) - 1} spokes + {len(fills)} generated gap-fill plates)\n- rule: same format, same pixel size (plates under 1k are lifted to 1k), >= 1k, drift inside the variation band\n"
      f"- coverage (target {target_per_pillar} per surface): " + ", ".join(f"{p} {c['have']}+{c['fill']}" for p, c in coverage.items()) + "\n"
      "- prompts: one nano-based MD per plate in `nano/prompts/<slug>.md` (source prompt MD folded in + refinement note + final Nano Banana prompt)\n"
      "- trace: `inspiration/manifest.json` (written at `switch`) links every nano plate back to the designer's original file and MD\n"
      "- downstream: `selections.json`, `manifest.json`, and `index.html` point here after `switch`; originals stay in `concepts/` + `prompts/`\n\n"
      "| slot | role | source | output | nano prompt md | size | format |\n| :-- | :-- | :-- | :-- | :-- | :-- | :-- |\n"
      + "".join(f"| {j['slug']} | {j['role']} | `{j['source'] if j['role'] != 'fill' else 'generated'}` | `{j['output']}` | `{j['nano_prompt_md']}` | {j['expected_px']} | {j['expected_format']} |\n" for j in jobs),
      encoding="utf-8",
  )
  print(json.dumps({
      "passed": True, "plan": str(plan_path(study)), "calls": len(jobs), "calls_refresh": len(jobs) - len(fills), "calls_fill": len(fills),
      "variation": v, "variation_label": label, "anchor": anchor_job["slug"], "drift_band_mae_8x8": plan["drift_band_mae_8x8"],
      "coverage": coverage,
      "needs_brief": [{"slug": f["slug"], "pillar": f["pillar"], "fill_role": f["fill_role"]} for f in fills],
      "confirm_prompt": (f"Confirm & run nanofy ({len(jobs)} Nano Banana calls: 1 anchor at variation {v:.1f} + {len(jobs) - len(fills) - 1} spokes, same size/format, >= 1k"
                         + (f", + {len(fills)} new plates generated to reach {target_per_pillar} per surface" if fills else "") + ")?"),
      "next": ["run-anchor", "verify-anchor", "note --text \"...\""] + (["brief --slug <slug> --text \"...\" (one per needs_brief)"] if fills else []) + ["run", "verify", "switch"],
      "jobs": [{k: j[k] for k in ("slug", "role", "source", "output", "expected_px", "expected_format", "image_size")} for j in jobs],
  }, indent=2))
  return 0


def lock_output(study: pathlib.Path, job: dict[str, Any]) -> bool:
  raw = study / job["raw_output"]
  out = study / job["output"]
  if not raw.exists():
    return False
  ew, eh = job["expected_px"].split("x")
  r = subprocess.run(
      ["magick", str(raw), "-colorspace", "sRGB", "-strip", "-filter", "Lanczos", "-resize", f"{ew}x{eh}!", "-unsharp", "0x0.55+0.45+0.008", str(out)],
      capture_output=True,
      text=True,
  )
  if r.returncode == 0:
    raw.unlink(missing_ok=True)
  return r.returncode == 0


def run_jobs(study: pathlib.Path, plan: dict[str, Any], jobs: list[dict[str, Any]], route: str) -> list[dict[str, Any]]:
  results = []
  for job in jobs:
    entry = {"slug": job["slug"], "role": job["role"], "output": job["output"]}
    raw = study / job["raw_output"]
    out = study / job["output"]
    if route == "gempix":
      if not pathlib.Path(GEMPIX).exists():
        entry["error"] = f"{GEMPIX} not available here — produce nano/<pillar>/<file> via image-generator / API, then --route=manual"
        results.append(entry)
        continue
      r = subprocess.run([GEMPIX, f"--input_image={study / job['source']}", f"--output_image={raw}",
                          f"--image_size={job['image_size']}", f"--prompt={job['prompt']}"], capture_output=True, text=True)
      if r.returncode != 0:
        entry["error"] = (r.stderr or r.stdout)[-400:]
        results.append(entry)
        continue
      entry["locked"] = lock_output(study, job)
    else:
      if raw.exists():
        entry["locked"] = lock_output(study, job)
      elif out.exists():
        w, h, _ = magick_identify(out)
        if f"{w}x{h}" != job["expected_px"]:
          shutil.copy2(out, raw)
          entry["locked"] = lock_output(study, job)
        else:
          entry["locked"] = True
      else:
        entry["error"] = "missing output (write nano/<pillar>/<file> or <file>.raw.png first)"
    job["status"] = "locked" if entry.get("locked") else "failed"
    write_nano_prompt_md(study, plan, job)
    results.append(entry)
  save_plan(study, plan)
  return results


def cmd_run_anchor(study: pathlib.Path, route: str) -> int:
  plan = load_plan(study)
  if not plan:
    print(json.dumps({"passed": False, "error": "run `plan` first"}, indent=2)); return 1
  anchor = [j for j in plan["jobs"] if j["role"] == "anchor"]
  results = run_jobs(study, plan, anchor, route)
  ok = all(r.get("locked") for r in results)
  print(json.dumps({"passed": ok, "route": route, "results": results, "next": "verify-anchor"}, indent=2))
  return 0 if ok else 1


def cmd_note(study: pathlib.Path, text: str) -> int:
  plan = load_plan(study)
  if not plan:
    print(json.dumps({"passed": False, "error": "run `plan` first"}, indent=2)); return 1
  anchor = next(j for j in plan["jobs"] if j["role"] == "anchor")
  if anchor.get("status") != "verified":
    print(json.dumps({"passed": False, "error": "verify-anchor must pass before recording the refinement note"}, indent=2)); return 1
  plan["refinement_note"] = text.strip()
  constitution = read_constitution(study)
  siblings = [f"{j['pillar']} · {j.get('title', j['slug'])}" for j in plan["jobs"] if j["role"] != "fill"]
  for j in plan["jobs"]:
    if j["role"] == "spoke":
      src_prompt = read_source_prompt(study, {"prompt": j.get("source_prompt_md")})
      j["prompt"] = spoke_prompt(plan["variation"], plan["refinement_note"], src_prompt)
      j["gempix_cmd"] = gempix_cmd(study / j["source"], study / j["raw_output"], j["image_size"], j["prompt"])
    elif j["role"] == "fill":
      j["prompt"] = fill_prompt(j["pillar"], j["fill_role"], plan["variation"], plan["refinement_note"], constitution, siblings, j.get("brief"))
      j["gempix_cmd"] = gempix_cmd(study / j["source"], study / j["raw_output"], j["image_size"], j["prompt"])
  save_plan(study, plan)
  for j in plan["jobs"]:
    write_nano_prompt_md(study, plan, j)
  (study / "nano" / "refinement-note.md").write_text(
      f"# refinement note (anchor `{anchor['slug']}`, variation {plan['variation']:.1f} {plan['variation_label']})\n\n{plan['refinement_note']}\n\n"
      "Applied verbatim to every spoke prompt. Invariants untouched: titling/copy, logos/wordmarks, product UI, layout, size, format.\n",
      encoding="utf-8")
  print(json.dumps({"passed": True, "refinement_note": plan["refinement_note"], "spokes_updated": sum(1 for j in plan["jobs"] if j["role"] == "spoke"), "next": "run"}, indent=2))
  return 0


def cmd_brief(study: pathlib.Path, slug: str, text: str) -> int:
  """jason-design-agent authors the concept for a generated (gap-fill) plate from the breadth of the imported set:
  what would complete this surface given everything else that came in. Required before `run` touches the fill."""
  plan = load_plan(study)
  if not plan:
    print(json.dumps({"passed": False, "error": "run `plan` first"}, indent=2)); return 1
  job = next((j for j in plan["jobs"] if j["slug"] == slug), None)
  if job is None or job["role"] != "fill":
    print(json.dumps({"passed": False, "error": f"no generated (fill) job named {slug!r}", "fills": [j["slug"] for j in plan["jobs"] if j["role"] == "fill"]}, indent=2)); return 1
  if not text.strip():
    print(json.dumps({"passed": False, "error": "brief text is empty"}, indent=2)); return 1
  job["brief"] = text.strip()
  constitution = read_constitution(study)
  siblings = [f"{j['pillar']} · {j.get('title', j['slug'])}" for j in plan["jobs"] if j["role"] != "fill"]
  job["prompt"] = fill_prompt(job["pillar"], job["fill_role"], plan["variation"], plan.get("refinement_note"), constitution, siblings, job["brief"])
  job["gempix_cmd"] = gempix_cmd(study / job["source"], study / job["raw_output"], job["image_size"], job["prompt"])
  if job.get("status") == "needs-brief":
    job["status"] = "planned"
  save_plan(study, plan)
  write_nano_prompt_md(study, plan, job)
  remaining = [j["slug"] for j in plan["jobs"] if j["role"] == "fill" and not j.get("brief")]
  print(json.dumps({"passed": True, "slug": slug, "pillar": job["pillar"], "fill_role": job["fill_role"], "briefs_remaining": remaining, "next": "run" if not remaining else "brief (next slug)"}, indent=2))
  return 0


def cmd_run(study: pathlib.Path, route: str) -> int:
  plan = load_plan(study)
  if not plan:
    print(json.dumps({"passed": False, "error": "run `plan` first"}, indent=2)); return 1
  if plan["variation"] > 0 and not plan.get("refinement_note"):
    anchor = next(j for j in plan["jobs"] if j["role"] == "anchor")
    if anchor.get("status") not in ("locked", "verified"):
      print(json.dumps({"passed": False, "error": "variation > 0: run-anchor -> verify-anchor -> note first so spokes inherit the anchor's refinement"}, indent=2)); return 1
    print(json.dumps({"passed": False, "error": "variation > 0: record the refinement note (`note --text ...`) before running spokes"}, indent=2)); return 1
  unbriefed = [j["slug"] for j in plan["jobs"] if j["role"] == "fill" and not j.get("brief")]
  if unbriefed:
    print(json.dumps({"passed": False, "error": "generated (gap-fill) plates need a concept brief before they run", "brief_these": unbriefed,
                      "how": "brief --slug <slug> --text \"<what this plate is, built from the rest of the set>\""}, indent=2)); return 1
  pending = [j for j in plan["jobs"] if j.get("status") not in ("locked", "verified")]
  results = run_jobs(study, plan, pending, route)
  ok = all(r.get("locked") for r in results)
  print(json.dumps({"passed": ok, "route": route, "ran": len(results), "skipped_already_locked": len(plan["jobs"]) - len(results), "results": results, "next": "verify"}, indent=2))
  return 0 if ok else 1


def sharpness_map(outputs: list[pathlib.Path]) -> dict[str, dict[str, Any]]:
  res: dict[str, dict[str, Any]] = {}
  if not READINESS.exists():
    return res
  for d in sorted({p.parent for p in outputs}):
    r = subprocess.run([sys.executable, str(READINESS), f"--assets-dir={d}", "--min-dpr=0"], capture_output=True, text=True)
    try:
      payload = json.loads(r.stdout)
    except Exception:
      continue
    for img in payload.get("images", []):
      res[str(pathlib.Path(img["file"]).resolve())] = img
  return res


def drift_mae(a: pathlib.Path, b: pathlib.Path) -> float | None:
  """Mean abs RGB delta (0..255) between 8x8 box-downsampled versions of two images."""
  try:
    with tempfile.TemporaryDirectory(prefix="nanofy_drift_") as tmp:
      pa, pb = pathlib.Path(tmp) / "a.png", pathlib.Path(tmp) / "b.png"
      for src, dst in ((a, pa), (b, pb)):
        subprocess.run(["magick", str(src) + "[0]", "-colorspace", "sRGB", "-alpha", "remove", "-background", "white",
                        "-filter", "box", "-resize", "8x8!", "-depth", "8", str(dst)], check=True, capture_output=True)
      out = subprocess.run(["magick", "compare", "-metric", "MAE", str(pa), str(pb), "null:"], capture_output=True, text=True)
      txt = (out.stderr or out.stdout).strip()
      if "(" in txt:
        return round(float(txt.split("(")[1].rstrip(")").split()[0]) * 255.0, 2)
      val = float(txt.split()[0])
      return round(val / 65535.0 * 255.0, 2) if val > 1.0 else round(val * 255.0, 2)
  except Exception:
    return None


def verify_jobs(study: pathlib.Path, plan: dict[str, Any], jobs: list[dict[str, Any]]) -> list[dict[str, Any]]:
  band = plan["drift_band_mae_8x8"]
  outputs = [study / j["output"] for j in jobs if (study / j["output"]).exists()]
  sharp = sharpness_map(outputs)
  rows = []
  for job in jobs:
    src, out = study / job["source"], study / job["output"]
    row: dict[str, Any] = {"slug": job["slug"], "role": job["role"], "output": job["output"], "reasons": []}
    if not out.exists():
      row["reasons"].append("missing_output"); rows.append(row); job["status"] = "failed"; continue
    w, h, fmt = magick_identify(out)
    row.update({"px": f"{w}x{h}", "format": fmt})
    if f"{w}x{h}" != job["expected_px"]:
      row["reasons"].append(f"size_mismatch (expected {job['expected_px']})")
    if fmt != job["expected_format"]:
      row["reasons"].append(f"format_mismatch (expected {job['expected_format']})")
    if min(w, h) < MIN_SHORT_EDGE:
      row["reasons"].append(f"below_1k (short edge {min(w, h)}px < {MIN_SHORT_EDGE}px)")
    if job["role"] == "fill":
      row["fresh"] = True  # generated plate: no source file to be newer than
    else:
      row["fresh"] = out.stat().st_mtime > src.stat().st_mtime
      if not row["fresh"]:
        row["reasons"].append("stale (output older than source)")
    s = sharp.get(str(out.resolve()))
    if s is not None:
      row["sharpness_ratio"] = s.get("sharpness_ratio")
      if not s.get("sharp_ok", True) or not s.get("ready_ok", True):
        row["reasons"].append("blurry_or_unreadable")
    if job["role"] == "fill":
      row["drift_mae_8x8"] = None
      row["invariants_check"] = "agent must eyeball: same brand/type/tokens/materials as the anchor; complete buildable UI; no duplicate of an existing plate"
      job["status"] = "verified" if not row["reasons"] else "failed"
      rows.append(row)
      continue
    d = drift_mae(src, out)
    row["drift_mae_8x8"] = d
    if d is None:
      row["reasons"].append("drift_unmeasurable")
    elif d > band["max"]:
      row["reasons"].append(f"too_much_change (mae {d} > {band['max']}) — redesign risk; re-run with the same prompt")
    elif plan["variation"] > 0 and job["role"] == "anchor" and d < band["min"]:
      row["reasons"].append(f"no_visible_take (mae {d} < {band['min']}) — anchor came back as a pure mirror; re-run or raise --variation")
    row["invariants_check"] = "agent must eyeball: titling/copy verbatim, logos, product UI unchanged"
    job["status"] = "verified" if not row["reasons"] else "failed"
    rows.append(row)
  save_plan(study, plan)
  return rows


def cmd_verify_anchor(study: pathlib.Path) -> int:
  plan = load_plan(study)
  if not plan:
    print(json.dumps({"passed": False, "error": "run `plan` first"}, indent=2)); return 1
  rows = verify_jobs(study, plan, [j for j in plan["jobs"] if j["role"] == "anchor"])
  ok = all(not r["reasons"] for r in rows)
  print(json.dumps({"passed": ok, "rows": rows, "next": "note --text \"<what the anchor refinement changed>\"" if ok and plan["variation"] > 0 else ("run" if ok else "run-anchor (again)")}, indent=2))
  return 0 if ok else 1


def cmd_verify(study: pathlib.Path) -> int:
  plan = load_plan(study)
  if not plan:
    print(json.dumps({"passed": False, "error": "run `plan` first"}, indent=2)); return 1
  rows = verify_jobs(study, plan, plan["jobs"])
  passed = all(not r["reasons"] for r in rows)
  report = {"passed": passed, "study_dir": str(study), "variation": plan["variation"], "refinement_note": plan.get("refinement_note"),
            "checked": len(rows), "failed": sum(1 for r in rows if r["reasons"]),
            "verified_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"), "rows": rows}
  (study / "nano" / "nanofy-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
  print(json.dumps(report, indent=2))
  return 0 if passed else 1


def write_inspiration_trace(study: pathlib.Path, plan: dict[str, Any]) -> None:
  """inspiration/ — the inspiration image folder that ships with the project: one row per nano plate tracing all the
  way back to the designer's original dump (file + MD), through concepts/ + prompts/, to nano/ + nano/prompts/.
  jason-dev-agent and design-critique read this so every build, screenshot, and sign-off has provenance."""
  insp = study / "inspiration"
  insp.mkdir(exist_ok=True)
  mf = study / "manifest.json"
  manifest = json.loads(mf.read_text(encoding="utf-8")) if mf.exists() else {}
  rows = []
  for j in plan["jobs"]:
    origin = j.get("origin") or {}
    rows.append({
        "slug": j["slug"], "pillar": j["pillar"], "role": j["role"], "title": j.get("title"),
        "generated": j["role"] == "fill",
        "trace": {
            "dump_source": origin.get("source") or manifest.get("source"),
            "dump_plate": origin.get("plate"),
            "dump_prompt_md": origin.get("prompt"),
            "concepts_plate": None if j["role"] == "fill" else j["source"],
            "prompts_md": j.get("source_prompt_md"),
            "nano_plate": j["output"],
            "nano_prompt_md": j.get("nano_prompt_md"),
            "anchor": plan.get("anchor_slug"),
            "reference_images": j.get("reference_images", []),
        },
        "brief": j.get("brief"),
        "fill_role": j.get("fill_role"),
        "status": j.get("status"),
    })
  (insp / "manifest.json").write_text(json.dumps({
      "study_dir": str(study),
      "dump_source": manifest.get("source"),
      "mode": manifest.get("mode"),
      "design_turn": {"turn": 1, "stage": "nanofy", "variation": plan["variation"], "refinement_note": plan.get("refinement_note")},
      "coverage": plan.get("coverage"),
      "written_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
      "plates": rows,
  }, indent=2) + "\n", encoding="utf-8")
  lines = [
      "# inspiration — provenance of every plate in this study\n",
      f"- designer dump: `{manifest.get('source')}`",
      f"- nanofy: variation {plan['variation']:.1f} ({plan.get('variation_label')}), anchor `{plan.get('anchor_slug')}` (desktop web 01) → every spoke; design turn 1",
      "- refinement note: " + (plan.get("refinement_note") or "n/a"),
      "- coverage: " + ", ".join(f"{p} {c['have']}+{c['fill']} generated" for p, c in (plan.get("coverage") or {}).items()),
      "",
      "| slot | pillar | role | dump file | dump md | concepts/ | prompts/ | nano/ | nano/prompts/ |",
      "| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |",
  ]
  for r in rows:
    t = r["trace"]
    cell = lambda v: f"`{v}`" if v else "—"
    lines.append(f"| {r['slug']} | {r['pillar']} | {r['role']} | {cell(t['dump_plate'])} | {cell(t['dump_prompt_md'])} | {cell(t['concepts_plate'])} | {cell(t['prompts_md'])} | {cell(t['nano_plate'])} | {cell(t['nano_prompt_md'])} |")
  lines += ["", "Generated plates (`role: fill`) have no dump file: they were briefed by `jason-design-agent` from the rest of the set and rendered in the anchor's design system; their brief lives in their `nano/prompts/<slug>.md`.", ""]
  (insp / "README.md").write_text("\n".join(lines), encoding="utf-8")


def cmd_switch(study: pathlib.Path) -> int:
  report_p = study / "nano" / "nanofy-report.json"
  if not report_p.exists() or not json.loads(report_p.read_text(encoding="utf-8")).get("passed"):
    print(json.dumps({"passed": False, "error": "verify must pass before switching downstream to nano/"}, indent=2)); return 1
  plan = load_plan(study)
  refresh_jobs = [j for j in plan["jobs"] if j["role"] != "fill"]
  fill_jobs = [j for j in plan["jobs"] if j["role"] == "fill"]
  mapping = {j["source"]: j["output"] for j in refresh_jobs}
  prompt_mapping = {j["source_prompt_md"]: j["nano_prompt_md"] for j in refresh_jobs if j.get("source_prompt_md") and j.get("nano_prompt_md")}
  nano_md_by_source = {j["source"]: j.get("nano_prompt_md") for j in refresh_jobs}
  changed: dict[str, int] = {}
  for name in ("selections.json", "manifest.json"):
    p = study / name
    if not p.exists():
      continue
    data = json.loads(p.read_text(encoding="utf-8"))
    n = 0
    for it in data.get("items", []):
      if it.get("plate") in mapping:
        nano_md = nano_md_by_source.get(it["plate"])
        it.setdefault("plate_original", it["plate"]); it["plate"] = mapping[it["plate"]]; n += 1
        if nano_md:
          it.setdefault("prompt_original", it.get("prompt")); it["prompt"] = nano_md
    # generated gap-fill plates join the set as first-class items (selected by default, flagged generated)
    existing = {it.get("slug") for it in data.get("items", [])}
    for k, f in enumerate(fill_jobs, start=len(data.get("items", [])) + 1):
      if f["slug"] in existing:
        continue
      data.setdefault("items", []).append({
          "slug": f["slug"], "index": k, "pillar": f["pillar"], "pillar_source": "generated", "title": f["title"],
          "plate": f["output"], "prompt": f["nano_prompt_md"], "natural_px": f["expected_px"], "is_2k": max(int(x) for x in f["expected_px"].split("x")) >= 1920,
          "generated": True, "fill_role": f["fill_role"], "brief": f.get("brief"), "origin": None,
          "selected": True,
      })
    data["plates_root"] = "nano"
    data["prompts_root"] = "nano/prompts"
    data["inspiration"] = "inspiration/manifest.json"
    data["nanofy"] = {"variation": plan["variation"], "refinement_note": plan.get("refinement_note"), "report": "nano/nanofy-report.json",
                      "generated_count": len(fill_jobs), "coverage": plan.get("coverage"),
                      "switched_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")}
    p.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    changed[name] = n
  idx = study / "index.html"
  if idx.exists():
    html = idx.read_text(encoding="utf-8")
    n = 0
    for src, out in mapping.items():
      if f'src="{src}"' in html:
        html = html.replace(f'src="{src}"', f'src="{out}"'); n += 1
    for src_md, nano_md in prompt_mapping.items():
      html = html.replace(f'href="{src_md}"', f'href="{nano_md}"')
    # append cards for generated plates (once), matching the intake moodboard markup
    cards = "".join(
        f'<figure class="card" data-slug="{f["slug"]}" data-pillar="{f["pillar"]}" data-generated="true">'
        f'<img src="{f["output"]}" alt="{f["title"]}" loading="lazy" />'
        f'<figcaption><h2>{f["title"]}</h2><p>{f["pillar"]} · {f["expected_px"]} · generated</p>'
        f'<div class="actions"><a href="{f["nano_prompt_md"]}" target="_blank">open prompt</a>'
        f'<button type="button" data-vote="up">approve</button><button type="button" data-vote="down">skip</button></div></figcaption></figure>'
        for f in fill_jobs if f'data-slug="{f["slug"]}"' not in html)
    if cards and '<main id="design">' in html:
      html = html.replace('</main>\n<main id="dev"', cards + '</main>\n<main id="dev"', 1)
    # legacy static pills (current template reads projects/design-turns.json itself)
    html = html.replace("design: imported plates · 0 turns", f"design: nanofy {plan['variation']:.1f} · turn 1")
    html = html.replace("design: nanofy · turn 1", f"design: nanofy {plan['variation']:.1f} · turn 1")
    idx.write_text(html, encoding="utf-8")
    changed["index.html"] = n
  write_inspiration_trace(study, plan)
  changed["inspiration/manifest.json"] = len(plan["jobs"])
  # Close out design turn 1: the nanofy pass (intake + anchored refresh + moodboard) is jason-design-agent's first turn.
  dt_path = study / "projects" / "design-turns.json"
  dt_path.parent.mkdir(exist_ok=True)
  dturns = json.loads(dt_path.read_text(encoding="utf-8")) if dt_path.exists() else {"total_design_turns": 1, "design_agent_turns_budget": None, "turns": []}
  turns = dturns.setdefault("turns", [])
  entry = next((t for t in turns if t.get("stage") == "nanofy"), None)
  if entry is None:
    entry = {"turn": 1, "stage": "nanofy"}; turns.append(entry)
  entry.update({"status": "complete", "variation": plan["variation"], "anchor": plan.get("anchor_slug"),
                "refinement_note": plan.get("refinement_note"), "report": "nano/nanofy-report.json",
                "completed_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")})
  dturns["total_design_turns"] = max(int(dturns.get("total_design_turns") or 0), 1)
  budget = dturns.get("design_agent_turns_budget")
  dturns["remaining_design_turns"] = (max(int(budget) - dturns["total_design_turns"], 0) if budget is not None else None)
  dturns["updated_at"] = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
  dt_path.write_text(json.dumps(dturns, indent=2) + "\n", encoding="utf-8")
  changed["projects/design-turns.json"] = 1
  pm = study / "prompt.md"
  if pm.exists() and "nanofy" not in pm.read_text(encoding="utf-8"):
    with pm.open("a", encoding="utf-8") as f:
      f.write(f"\n- nanofy: all plates re-output through Nano Banana before image-to-react at variation {plan['variation']:.1f} "
              f"(anchor `{plan['anchor_slug']}` first, refinement propagated to all spokes; `nano/nanofy-report.json`); downstream stages read `nano/`. "
              f"This completes jason-design-agent turn 1 (`projects/design-turns.json`).\n")
  print(json.dumps({"passed": True, "plates_root": "nano", "design_turn_completed": 1, "repointed": changed}, indent=2))
  return 0


def main() -> int:
  ap = argparse.ArgumentParser(description="nanofy: anchored Nano Banana refresh of imported plates into <study>/nano/.")
  ap.add_argument("command", choices=["plan", "run-anchor", "verify-anchor", "note", "brief", "run", "verify", "switch"])
  ap.add_argument("--study", required=True, help="Bootstrapped imported study folder (manifest.json / concepts/).")
  ap.add_argument("--variation", type=float, default=0.5, help="Unique-take dial 0.0 (pure mirror) .. 0.5 (distinct but faithful). Default 0.5: the desktop web anchor (slot 01) takes the distinct take first, every spoke inherits it.")
  ap.add_argument("--image-size", default="2k", help="Nano Banana size flag for plates over 1200px (default 2k).")
  ap.add_argument("--route", choices=["gempix", "manual"], default="gempix", help="gempix CLI (outside sandbox) or manual (outputs already produced).")
  ap.add_argument("--text", default="", help="note: the refinement note describing exactly what changed on the anchor; brief: the concept for a generated plate.")
  ap.add_argument("--slug", default="", help="brief: the generated (fill) job slug to brief.")
  ap.add_argument("--target-per-pillar", type=int, default=3, help="plan: minimum plates per surface (web, mobile-web, app, component, experience); missing ones are generated. Default 3. Surplus plates are all nanofied.")
  args = ap.parse_args()
  study = pathlib.Path(args.study).expanduser().resolve()
  if args.command == "plan":
    return cmd_plan(study, args.image_size, args.variation, args.target_per_pillar)
  if args.command == "run-anchor":
    return cmd_run_anchor(study, args.route)
  if args.command == "verify-anchor":
    return cmd_verify_anchor(study)
  if args.command == "note":
    if not args.text.strip():
      print(json.dumps({"passed": False, "error": "--text is required"}, indent=2)); return 1
    return cmd_note(study, args.text)
  if args.command == "brief":
    return cmd_brief(study, args.slug, args.text)
  if args.command == "run":
    return cmd_run(study, args.route)
  if args.command == "verify":
    return cmd_verify(study)
  return cmd_switch(study)


if __name__ == "__main__":
  sys.exit(main())
