#!/usr/bin/env python3
"""taxonomy CLI: list, validate, classify, query templates/gaps/prompts, audit, and extend the canonical WDA taxonomy.

Standard library only. Reads assets/taxonomy.json (plus assets/templates_and_gaps.json and assets/prompts_index.json) next to this skill.

Usage:
  classify_taxonomy.py --tree
  classify_taxonomy.py --list [--format json|markdown]
  classify_taxonomy.py --validate
  classify_taxonomy.py --query "a kanban board for a design team" [--top 3]
  classify_taxonomy.py --gaps [--cat landing-page] [--sub advanced-3d-website-landing-page]
  classify_taxonomy.py --templates [--cat landing-page] [--sub ecommerce] [--page-type ecommerce_store] [--limit 10]
  classify_taxonomy.py --prompts [--cat landing-page] [--sub advanced-3d-website-landing-page] [--status no_match] [--3d] [--limit 10]
  classify_taxonomy.py --dimensions
  classify_taxonomy.py --check-slice items.jsonl [--key category_id --subkey subcategory_id]
  classify_taxonomy.py --add-category "Media Experiences" [--order N] [--definition "..."]
  classify_taxonomy.py --add-subcategory "SVG" --parent media-experiences [--definition "..."]
"""

from __future__ import annotations

import argparse
import collections
import json
import pathlib
import re
import sys
from typing import Any, Iterable

SKILL_DIR = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_TAXONOMY_PATH = SKILL_DIR / "assets" / "taxonomy.json"
TEMPLATES_GAPS_PATH = SKILL_DIR / "assets" / "templates_and_gaps.json"
PROMPTS_INDEX_PATH = SKILL_DIR / "assets" / "prompts_index.json"
SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

# Score weights for the heuristic classifier.
WEIGHT_SUB_POSITIVE = 3.0
WEIGHT_CAT_POSITIVE = 1.0
WEIGHT_SUB_NEGATIVE = -2.0
WEIGHT_CAT_NEGATIVE = -0.5
WEIGHT_LABEL_HIT = 2.0
WEIGHT_WIDGET_HIT = 1.5
WEIGHT_DOMAIN_HIT = 2.0
CONFIDENT_MARGIN = 2.0
CONFIDENT_MIN_SCORE = 3.0


# --------------------------------------------------------------------------- io


def load_taxonomy(path: pathlib.Path) -> dict[str, Any]:
  """Loads the taxonomy registry JSON."""
  with path.open("r", encoding="utf-8") as fh:
    return json.load(fh)


def save_taxonomy(path: pathlib.Path, data: dict[str, Any]) -> None:
  """Writes the taxonomy registry JSON with stable formatting."""
  path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def slugify(label: str) -> str:
  """Derives a canonical kebab-case slug from a display label."""
  s = label.lower().replace("&", " and ")
  s = re.sub(r"[^a-z0-9]+", "-", s)
  return s.strip("-")


def iter_subcategories(data: dict[str, Any]) -> Iterable[tuple[dict[str, Any], dict[str, Any]]]:
  """Yields (category, subcategory) pairs in canonical order."""
  for cat in sorted(data.get("categories", []), key=lambda c: c.get("order", 0)):
    for sub in sorted(cat.get("subcategories", []), key=lambda s: s.get("order", 0)):
      yield cat, sub


def active_only(data: dict[str, Any]) -> list[dict[str, Any]]:
  """Returns a deep-filtered list of active categories with active subcategories."""
  out = []
  for cat in sorted(data.get("categories", []), key=lambda c: c.get("order", 0)):
    if cat.get("status", "active") != "active":
      continue
    subs = [s for s in cat.get("subcategories", []) if s.get("status", "active") == "active"]
    out.append({**cat, "subcategories": sorted(subs, key=lambda s: s.get("order", 0))})
  return out


def matches_filter(val_id: str, val_label: str, flt: str | None) -> bool:
  """Matches a category or subcategory by ID, label, or slugified filter."""
  if not flt:
    return True
  norm = flt.strip().lower()
  return norm in (val_id.lower(), val_label.lower(), slugify(flt))


# ------------------------------------------------------------------- rendering


def render_tree(data: dict[str, Any]) -> str:
  """Renders the taxonomy as an indented text tree with reference counts and coverage."""
  rc = data.get("reference_counts", {})
  lines = [
      f"taxonomy {data.get('taxonomy_version', '?')} ({data.get('status', '?')}) "
      f"| total target prompts {rc.get('total', '?')} "
      f"(v6_report: {rc.get('v6_report_total', '?')}, llm: {rc.get('llm_total', '?')}) "
      f"| templates: {rc.get('n_templates', '?')} | gaps: {rc.get('n_gaps', '?')}"
  ]
  for cat in active_only(data):
    cs = cat.get("coverage_stats", {})
    cov_str = f" · {cs.get('usable_pct', 0)}% usable · {cs.get('missing_template_gaps', 0)} gaps" if cs else ""
    lines.append(
        f"{cat['order']}. {cat['label']}  [{cat['id']}]  {cat.get('reference_count', 0)}"
        f" (v6:{cat.get('v6_report_count', 0)} + llm:{cat.get('llm_count', 0)}{cov_str})"
    )
    subs = cat["subcategories"]
    for i, sub in enumerate(subs):
      branch = "└─" if i == len(subs) - 1 else "├─"
      scs = sub.get("coverage_stats", {})
      sub_cov = (
          f" | usable {scs.get('usable_pct', 0)}% ({scs.get('usable_matches', 0)}/{scs.get('total_prompts', 0)})"
          f" | 3d:{scs.get('needs_3d', 0)} | gaps:{scs.get('missing_template_gaps', 0)}"
          if scs
          else ""
      )
      lines.append(
          f"   {branch} {sub['label']}  [{sub['id']}]  {sub.get('reference_count', 0)}"
          f" (v6:{sub.get('v6_report_count', 0)}, llm:{sub.get('llm_count', 0)}){sub_cov}"
      )
  return "\n".join(lines)


def render_markdown(data: dict[str, Any]) -> str:
  """Renders a Markdown summary table of the taxonomy."""
  lines = [
      "| # | Category | Subcategory | ID | Total | V6 Curated | LLM | Usable % | 3D | Gaps |",
      "| :-- | :-- | :-- | :-- | --: | --: | --: | --: | --: | --: |",
  ]
  for cat in active_only(data):
    cs = cat.get("coverage_stats", {})
    lines.append(
        f"| {cat['order']} | **{cat['label']}** | | `{cat['id']}` | **{cat.get('reference_count', 0)}** "
        f"| {cat.get('v6_report_count', 0)} | {cat.get('llm_count', 0)} "
        f"| **{cs.get('usable_pct', 0)}%** | {cs.get('needs_3d', 0)} | {cs.get('missing_template_gaps', 0)} |"
    )
    for sub in cat["subcategories"]:
      scs = sub.get("coverage_stats", {})
      lines.append(
          f"| {cat['order']}.{sub['order']} | | {sub['label']} | `{sub['id']}` | {sub.get('reference_count', 0)} "
          f"| {sub.get('v6_report_count', 0)} | {sub.get('llm_count', 0)} "
          f"| {scs.get('usable_pct', 0)}% | {scs.get('needs_3d', 0)} | {scs.get('missing_template_gaps', 0)} |"
      )
  return "\n".join(lines)


def render_list_json(data: dict[str, Any]) -> str:
  """Renders a compact JSON summary of IDs, labels, counts, and coverage stats."""
  payload = []
  for cat in active_only(data):
    payload.append({
        "id": cat["id"],
        "label": cat["label"],
        "order": cat["order"],
        "reference_count": cat.get("reference_count", 0),
        "v6_report_count": cat.get("v6_report_count", 0),
        "llm_count": cat.get("llm_count", 0),
        "coverage_stats": cat.get("coverage_stats", {}),
        "subcategories": [
            {
                "id": s["id"],
                "label": s["label"],
                "order": s["order"],
                "reference_count": s.get("reference_count", 0),
                "v6_report_count": s.get("v6_report_count", 0),
                "llm_count": s.get("llm_count", 0),
                "coverage_stats": s.get("coverage_stats", {}),
            }
            for s in cat["subcategories"]
        ],
    })
  return json.dumps(payload, indent=2, ensure_ascii=False)


# ------------------------------------------------------------------ validation


def validate(data: dict[str, Any]) -> list[str]:
  """Returns a list of integrity errors (empty list means valid)."""
  errors: list[str] = []
  seen: set[str] = set()
  required_sub = ("id", "label", "order", "definition", "positive_signals", "disambiguation")
  required_cat = ("id", "label", "order", "definition", "subcategories")

  cats = data.get("categories", [])
  if not cats:
    errors.append("no categories defined")

  grand_total = 0
  for cat in cats:
    for key in required_cat:
      if key not in cat or cat[key] in ("", [], None):
        errors.append(f"category {cat.get('id', '?')}: missing or empty '{key}'")
    cid = cat.get("id", "")
    if not SLUG_RE.match(cid):
      errors.append(f"category id '{cid}' is not kebab-case")
    if cid in seen:
      errors.append(f"duplicate id '{cid}'")
    seen.add(cid)
    if cid != slugify(cat.get("label", "")) and "slug_override" not in cat:
      errors.append(f"category id '{cid}' does not match slugify(label)='{slugify(cat.get('label', ''))}'")

    sub_total = 0
    orders: list[int] = []
    for sub in cat.get("subcategories", []):
      for key in required_sub:
        if key not in sub or sub[key] in ("", [], None):
          errors.append(f"subcategory {sub.get('id', '?')}: missing or empty '{key}'")
      sid = sub.get("id", "")
      if not SLUG_RE.match(sid):
        errors.append(f"subcategory id '{sid}' is not kebab-case")
      if sid in seen:
        errors.append(f"duplicate id '{sid}'")
      seen.add(sid)
      if sid != slugify(sub.get("label", "")) and "slug_override" not in sub:
        errors.append(f"subcategory id '{sid}' does not match slugify(label)='{slugify(sub.get('label', ''))}'")
      orders.append(int(sub.get("order", 0)))
      if sub.get("status", "active") == "active":
        sub_total += int(sub.get("reference_count", 0))
    if orders and sorted(orders) != list(range(1, len(orders) + 1)):
      errors.append(f"category {cid}: subcategory orders are not 1..n ({orders})")
    if cat.get("status", "active") == "active":
      declared = int(cat.get("reference_count", 0))
      if declared != sub_total:
        errors.append(f"category {cid}: reference_count {declared} != sum of subcategories {sub_total}")
      grand_total += declared

  cat_orders = [int(c.get("order", 0)) for c in cats]
  if sorted(cat_orders) != list(range(1, len(cat_orders) + 1)):
    errors.append(f"category orders are not 1..n ({cat_orders})")
  declared_total = int(data.get("reference_counts", {}).get("total", -1))
  if declared_total != grand_total:
    errors.append(f"reference_counts.total {declared_total} != sum of active categories {grand_total}")
  return errors


# -------------------------------------------------------------- classification


def _tokenize(text: str) -> str:
  """Normalizes text for phrase matching."""
  t = text.lower()
  t = re.sub(r"[^a-z0-9/.+ -]+", " ", t)
  return " " + re.sub(r"\s+", " ", t).strip() + " "


def _phrase_hits(haystack: str, phrases: Iterable[str]) -> list[str]:
  """Returns phrases found as whole tokens in the normalized haystack."""
  hits = []
  for p in phrases:
    needle = _tokenize(p).strip()
    if not needle:
      continue
    if re.search(r"(?<![a-z0-9])" + re.escape(needle) + r"(?![a-z0-9])", haystack):
      hits.append(p)
  return hits


def _infer_auxiliary_dimensions(haystack: str, best_sub: dict[str, Any]) -> dict[str, Any]:
  """Infers surface, complexity, and 3D role from query tokens and subcategory priors."""
  n3d_signals = ("3d", "webgl", "three.js", "threejs", "r3f", "shader", "glsl", "turntable", "spline")
  needs_3d = bool(_phrase_hits(haystack, n3d_signals)) or best_sub.get("subcategory_id") == "advanced-3d-website-landing-page"
  r3d_role = ""
  if needs_3d:
    if _phrase_hits(haystack, ("configurator", "customizer", "swatches", "product viewer", "turntable")):
      r3d_role = "product_viewer"
    elif _phrase_hits(haystack, ("scroll", "scrollytelling", "camera flies", "explodes")):
      r3d_role = "scroll_scene"
    elif _phrase_hits(haystack, ("full-screen", "whole-page", "spatial hud", "world")):
      r3d_role = "whole_page_scene"
    elif _phrase_hits(haystack, ("background", "ambient", "particles")):
      r3d_role = "background_ambient"
    else:
      r3d_role = "hero_centerpiece"

  # Infer surface
  if _phrase_hits(haystack, ("mobile app", "ios", "android", "bottom tab")):
    surface = "mobile_app"
  elif _phrase_hits(haystack, ("dashboard", "kpi", "telemetry", "analytics", "monitoring")):
    surface = "dashboard"
  elif _phrase_hits(haystack, ("editor", "studio", "playground", "ide", "canvas", "calculator")):
    surface = "editor_tool"
  elif best_sub.get("category_id") == "landing-page":
    surface = "3d_scene" if best_sub.get("subcategory_id") == "advanced-3d-website-landing-page" and "showcase" in haystack else "marketing_site"
  else:
    surface = "web_app"

  # Infer complexity
  if best_sub.get("category_id") == "landing-page":
    complexity = "single_page" if needs_3d and "showcase" in haystack else "multi_section"
  elif _phrase_hits(haystack, ("calculator", "timer", "converter", "single page")):
    complexity = "single_page"
  else:
    complexity = "multi_view_app"

  return {
      "surface": surface,
      "complexity": complexity,
      "needs_3d": needs_3d,
      "r3d_role": r3d_role,
  }


def classify(data: dict[str, Any], query: str, top: int = 3) -> dict[str, Any]:
  """Scores every active subcategory against the query using keyword, widget, and domain heuristics."""
  hay = _tokenize(query)
  candidates = []
  for cat in active_only(data):
    cat_pos = _phrase_hits(hay, cat.get("positive_signals", []))
    cat_neg = _phrase_hits(hay, cat.get("negative_signals", []))
    for sub in cat["subcategories"]:
      sub_pos = _phrase_hits(hay, sub.get("positive_signals", []))
      sub_neg = _phrase_hits(hay, sub.get("negative_signals", []))
      wid_hits = _phrase_hits(hay, sub.get("characteristic_widgets", []))
      dom_phrases = [d["domain"] for d in sub.get("dominant_domains", []) if isinstance(d, dict) and d.get("domain")]
      dom_hits = _phrase_hits(hay, dom_phrases)
      label_hit = _phrase_hits(hay, [sub["label"], sub["label"].replace("/", " ")])
      score = (
          WEIGHT_SUB_POSITIVE * len(sub_pos)
          + WEIGHT_CAT_POSITIVE * len(cat_pos)
          + WEIGHT_WIDGET_HIT * len(wid_hits)
          + WEIGHT_DOMAIN_HIT * len(dom_hits)
          + WEIGHT_SUB_NEGATIVE * len(sub_neg)
          + WEIGHT_CAT_NEGATIVE * len(cat_neg)
          + (WEIGHT_LABEL_HIT if label_hit else 0.0)
      )
      candidates.append({
          "category_id": cat["id"],
          "category_label": cat["label"],
          "subcategory_id": sub["id"],
          "subcategory_label": sub["label"],
          "score": round(score, 2),
          "positive_hits": sorted(set(sub_pos + cat_pos + wid_hits + dom_hits)),
          "negative_hits": sorted(set(sub_neg + cat_neg)),
          "disambiguation": sub.get("disambiguation", ""),
          "top_templates": sub.get("top_templates", [])[:3],
          "gap_archetypes": [
              {"id": g["id"], "name": g["name"], "severity": g["severity"], "brief": g["brief"]}
              for g in sub.get("gap_archetypes", [])[:3]
          ],
      })

  candidates.sort(key=lambda c: (-c["score"], c["category_id"], c["subcategory_id"]))
  best = candidates[0]
  runner = candidates[1] if len(candidates) > 1 else None
  margin = best["score"] - (runner["score"] if runner else 0.0)
  confident = best["score"] >= CONFIDENT_MIN_SCORE and margin >= CONFIDENT_MARGIN
  status = "confident" if confident else ("ambiguous" if best["score"] > 0 else "unclassified")

  result: dict[str, Any] = {
      "query": query,
      "taxonomy_version": data.get("taxonomy_version"),
      "status": status,
      "primary": None if status == "unclassified" else {
          "category_id": best["category_id"],
          "subcategory_id": best["subcategory_id"],
          "label": f"{best['category_label']} / {best['subcategory_label']}",
          "score": best["score"],
          "margin": round(margin, 2),
          "inferred_dimensions": _infer_auxiliary_dimensions(hay, best),
          "recommended_templates": best.get("top_templates", []),
          "nearest_gap_archetypes": best.get("gap_archetypes", []),
      },
      "candidates": candidates[:top],
  }
  if status != "confident":
    result["model_prompt"] = build_model_prompt(data, query, candidates[:top])
  return result


def build_model_prompt(data: dict[str, Any], query: str, shortlist: list[dict[str, Any]]) -> str:
  """Builds a rubric payload for an LLM (or the agent itself) to resolve an ambiguous query."""
  lines = [
      "You are classifying one item into the canonical two-level taxonomy "
      f"({data.get('taxonomy_version')}). Return exactly one primary (category_id, subcategory_id) "
      "plus a confidence in [0,1] and one sentence of reasoning.",
      "",
      "Rules:",
  ]
  for rule in data.get("cross_category_rules", []):
    lines.append(f"- {rule['rule']}")
  lines.append("")
  lines.append("Shortlisted candidates (heuristic order, not authoritative):")
  for c in shortlist:
    lines.append(
        f"- {c['category_id']} / {c['subcategory_id']} (score {c['score']}): {c['disambiguation']}"
    )
  lines.append("")
  lines.append("If none fit, answer unclassified and name the nearest active candidate.")
  lines.append("")
  lines.append(f"Item: {query}")
  lines.append("")
  lines.append('Answer as JSON: {"category_id": ..., "subcategory_id": ..., "confidence": ..., "reasoning": ...}')
  return "\n".join(lines)


# ------------------------------------------------ gaps, templates & prompts CLI


def list_gaps(data: dict[str, Any], cat_flt: str | None, sub_flt: str | None) -> list[dict[str, Any]]:
  """Lists missing-template gap archetypes matching optional category/subcategory filters."""
  out = []
  for cat, sub in iter_subcategories(data):
    if not matches_filter(cat["id"], cat["label"], cat_flt):
      continue
    if not matches_filter(sub["id"], sub["label"], sub_flt):
      continue
    for g in sub.get("gap_archetypes", []):
      out.append({
          "category_id": cat["id"],
          "subcategory_id": sub["id"],
          **g,
      })
  return out


def list_templates(
    data: dict[str, Any],
    cat_flt: str | None,
    sub_flt: str | None,
    col_flt: str | None,
    pt_flt: str | None,
    limit: int,
) -> list[dict[str, Any]]:
  """Lists review-ready/golden templates from templates_and_gaps.json or subcategory top_templates."""
  if not TEMPLATES_GAPS_PATH.exists():
    out = []
    for cat, sub in iter_subcategories(data):
      if matches_filter(cat["id"], cat["label"], cat_flt) and matches_filter(sub["id"], sub["label"], sub_flt):
        out.extend(sub.get("top_templates", []))
    return out[:limit]

  payload = json.loads(TEMPLATES_GAPS_PATH.read_text(encoding="utf-8"))
  tpls = list(payload.get("templates", {}).values())
  if cat_flt or sub_flt:
    allowed_tids: set[str] = set()
    for cat, sub in iter_subcategories(data):
      if matches_filter(cat["id"], cat["label"], cat_flt) and matches_filter(sub["id"], sub["label"], sub_flt):
        for t in sub.get("top_templates", []):
          allowed_tids.add(t["tid"])
    if PROMPTS_INDEX_PATH.exists():
      prompts = json.loads(PROMPTS_INDEX_PATH.read_text(encoding="utf-8"))
      for p in prompts:
        if matches_filter(p["category_id"], p["cat"], cat_flt) and matches_filter(p["subcategory_id"], p["sub"], sub_flt):
          for c in p.get("top_cands", []):
            if c.get("v") in ("strong", "adaptable") or (c.get("sc") or 0) >= 7:
              allowed_tids.add(c["tid"])
    tpls = [t for t in tpls if t["tid"] in allowed_tids]
  if col_flt:
    tpls = [t for t in tpls if col_flt.lower() in t.get("collection", "").lower()]
  if pt_flt:
    tpls = [t for t in tpls if pt_flt.lower() == t.get("page_type", "").lower()]
  return tpls[:limit]


def list_prompts(
    cat_flt: str | None,
    sub_flt: str | None,
    status_flt: str | None,
    only_3d: bool,
    limit: int,
) -> list[dict[str, Any]]:
  """Lists classified target prompts from prompts_index.json."""
  if not PROMPTS_INDEX_PATH.exists():
    return []
  prompts = json.loads(PROMPTS_INDEX_PATH.read_text(encoding="utf-8"))
  out = []
  for p in prompts:
    if not matches_filter(p["category_id"], p["cat"], cat_flt):
      continue
    if not matches_filter(p["subcategory_id"], p["sub"], sub_flt):
      continue
    if status_flt and p.get("st") != status_flt:
      continue
    if only_3d and not p.get("n3d"):
      continue
    out.append(p)
    if len(out) >= limit:
      break
  return out


# ------------------------------------------------------------------ slice audit


def check_slice(
    data: dict[str, Any], path: pathlib.Path, key: str, subkey: str
) -> dict[str, Any]:
  """Audits a JSONL slice: unknown ids, pair mismatches, and the observed distribution."""
  valid_pairs = {(c["id"], s["id"]) for c, s in iter_subcategories(data)}
  cat_of: dict[str, str] = {s["id"]: c["id"] for c, s in iter_subcategories(data)}
  counts: collections.Counter[tuple[str, str]] = collections.Counter()
  problems: list[dict[str, Any]] = []
  total = 0
  with path.open("r", encoding="utf-8") as fh:
    for n, raw in enumerate(fh, start=1):
      raw = raw.strip()
      if not raw:
        continue
      total += 1
      try:
        row = json.loads(raw)
      except json.JSONDecodeError as exc:
        problems.append({"line": n, "error": f"invalid json: {exc}"})
        continue
      cid = slugify(str(row.get(key, "") or ""))
      sid = slugify(str(row.get(subkey, "") or ""))
      if not cid and sid in cat_of:
        cid = cat_of[sid]
      if (cid, sid) in valid_pairs:
        counts[(cid, sid)] += 1
      elif sid in cat_of:
        problems.append({"line": n, "error": f"subcategory '{sid}' belongs to '{cat_of[sid]}', not '{cid}'"})
      else:
        problems.append({"line": n, "error": f"unknown pair ('{cid}', '{sid}')"})

  distribution = []
  for cat, sub in iter_subcategories(data):
    observed = counts[(cat["id"], sub["id"])]
    distribution.append({
        "category_id": cat["id"],
        "subcategory_id": sub["id"],
        "observed": observed,
        "reference": sub.get("reference_count", 0),
        "v6_report_reference": sub.get("v6_report_count", 0),
        "share": round(observed / total, 4) if total else 0.0,
    })
  return {
      "file": str(path),
      "rows": total,
      "valid_rows": sum(counts.values()),
      "problem_rows": len(problems),
      "problems": problems[:50],
      "distribution": distribution,
  }


# ------------------------------------------------------------------- extension


def add_category(data: dict[str, Any], label: str, order: int | None, definition: str) -> dict[str, Any]:
  """Appends a new draft category (status=draft) without disturbing existing ids."""
  cid = slugify(label)
  existing = {c["id"] for c in data["categories"]} | {s["id"] for _, s in iter_subcategories(data)}
  if cid in existing:
    raise ValueError(f"id '{cid}' already exists; ids are immutable and never reused")
  new_order = order or (max((c.get("order", 0) for c in data["categories"]), default=0) + 1)
  if any(c.get("order") == new_order for c in data["categories"]):
    raise ValueError(f"order {new_order} is already taken; append at the end instead")
  entry = {
      "id": cid,
      "label": label,
      "order": new_order,
      "status": "draft",
      "reference_count": 0,
      "definition": definition or "TODO: one-sentence definition of the primary user intent.",
      "positive_signals": [],
      "negative_signals": [],
      "subcategories": [],
  }
  data["categories"].append(entry)
  return entry


def add_subcategory(
    data: dict[str, Any], label: str, parent: str, definition: str
) -> dict[str, Any]:
  """Appends a new draft subcategory under parent without disturbing existing ids."""
  sid = slugify(label)
  existing = {c["id"] for c in data["categories"]} | {s["id"] for _, s in iter_subcategories(data)}
  if sid in existing:
    raise ValueError(f"id '{sid}' already exists; ids are immutable and never reused")
  for cat in data["categories"]:
    if cat["id"] == parent:
      entry = {
          "id": sid,
          "label": label,
          "order": len(cat["subcategories"]) + 1,
          "status": "draft",
          "reference_count": 0,
          "definition": definition or "TODO: one-sentence definition of the primary user intent.",
          "positive_signals": [],
          "negative_signals": [],
          "disambiguation": "TODO: name the nearest sibling and the tiebreak rule.",
      }
      cat["subcategories"].append(entry)
      return entry
  raise ValueError(f"parent category '{parent}' not found")


# ------------------------------------------------------------------------ main


def main(argv: list[str] | None = None) -> int:
  """CLI entry point."""
  parser = argparse.ArgumentParser(
      description="Canonical WDA taxonomy CLI (list, validate, classify, query gaps/templates/prompts, audit, extend)."
  )
  parser.add_argument("--taxonomy", default=str(DEFAULT_TAXONOMY_PATH), help="Path to taxonomy.json.")
  parser.add_argument("--tree", action="store_true", help="Print the taxonomy tree with coverage & gap stats.")
  parser.add_argument("--list", action="store_true", help="Print a summary (see --format).")
  parser.add_argument("--format", choices=("json", "markdown"), default="json", help="Format for --list.")
  parser.add_argument("--validate", action="store_true", help="Check registry integrity.")
  parser.add_argument("--query", metavar="TEXT", help="Classify a prompt, brief, or description.")
  parser.add_argument("--top", type=int, default=3, help="Candidates to return for --query.")
  parser.add_argument("--gaps", action="store_true", help="List missing-template gap archetypes (filter with --cat / --sub).")
  parser.add_argument("--templates", action="store_true", help="List accepted/golden templates (filter with --cat / --sub / --collection / --page-type).")
  parser.add_argument("--prompts", action="store_true", help="List classified target prompts (filter with --cat / --sub / --status / --3d).")
  parser.add_argument("--dimensions", action="store_true", help="Print all auxiliary taxonomies (surfaces, 3D roles, page types, loss tags, V5 mapping).")
  parser.add_argument("--cat", help="Filter by category id or label.")
  parser.add_argument("--sub", help="Filter by subcategory id or label.")
  parser.add_argument("--collection", help="Filter templates by collection name.")
  parser.add_argument("--page-type", help="Filter templates by page_type id.")
  parser.add_argument("--status", help="Filter prompts by match status (strong, adaptable, no_match, not_templatable).")
  parser.add_argument("--3d", dest="only_3d", action="store_true", help="Filter prompts requiring 3D elements.")
  parser.add_argument("--limit", type=int, default=20, help="Max items to return for --templates or --prompts.")
  parser.add_argument("--check-slice", metavar="JSONL", help="Audit a JSONL slice of labeled items.")
  parser.add_argument("--key", default="category_id", help="JSONL field holding the category id.")
  parser.add_argument("--subkey", default="subcategory_id", help="JSONL field holding the subcategory id.")
  parser.add_argument("--add-category", metavar="LABEL", help="Append a draft category.")
  parser.add_argument("--add-subcategory", metavar="LABEL", help="Append a draft subcategory (needs --parent).")
  parser.add_argument("--parent", help="Parent category id for --add-subcategory.")
  parser.add_argument("--order", type=int, help="Explicit order for --add-category.")
  parser.add_argument("--definition", default="", help="Definition text for --add-*.")
  parser.add_argument("--dry-run", action="store_true", help="Print the new entry without writing.")
  args = parser.parse_args(argv)

  path = pathlib.Path(args.taxonomy)
  if not path.exists():
    print(f"taxonomy file not found: {path}", file=sys.stderr)
    return 2
  data = load_taxonomy(path)
  did_something = False

  if args.tree:
    print(render_tree(data))
    did_something = True
  if args.list:
    print(render_markdown(data) if args.format == "markdown" else render_list_json(data))
    did_something = True
  if args.validate:
    errors = validate(data)
    did_something = True
    if errors:
      print("INVALID taxonomy:")
      for e in errors:
        print(f"  - {e}")
      return 1
    subs = sum(len(c.get("subcategories", [])) for c in data["categories"])
    rc = data.get("reference_counts", {})
    print(
        f"OK: {len(data['categories'])} categories, {subs} subcategories, "
        f"total reference count {rc.get('total')} "
        f"(v6_report: {rc.get('v6_report_total')}, llm: {rc.get('llm_total')}, "
        f"templates: {rc.get('n_templates')}, gaps: {rc.get('n_gaps')})"
    )
  if args.query:
    print(json.dumps(classify(data, args.query, top=args.top), indent=2, ensure_ascii=False))
    did_something = True
  if args.gaps:
    res = list_gaps(data, args.cat, args.sub)
    print(json.dumps({"count": len(res), "gaps": res}, indent=2, ensure_ascii=False))
    did_something = True
  if args.templates:
    res = list_templates(data, args.cat, args.sub, args.collection, args.page_type, args.limit)
    print(json.dumps({"count": len(res), "templates": res}, indent=2, ensure_ascii=False))
    did_something = True
  if args.prompts:
    res = list_prompts(args.cat, args.sub, args.status, args.only_3d, args.limit)
    print(json.dumps({"count": len(res), "prompts": res}, indent=2, ensure_ascii=False))
    did_something = True
  if args.dimensions:
    print(json.dumps(data.get("auxiliary_taxonomies", {}), indent=2, ensure_ascii=False))
    did_something = True
  if args.check_slice:
    print(json.dumps(check_slice(data, pathlib.Path(args.check_slice), args.key, args.subkey), indent=2))
    did_something = True
  if args.add_category or args.add_subcategory:
    did_something = True
    try:
      if args.add_category:
        entry = add_category(data, args.add_category, args.order, args.definition)
      else:
        if not args.parent:
          print("--add-subcategory requires --parent <category-id>", file=sys.stderr)
          return 2
        entry = add_subcategory(data, args.add_subcategory, args.parent, args.definition)
    except ValueError as exc:
      print(f"refused: {exc}", file=sys.stderr)
      return 1
    print(json.dumps(entry, indent=2, ensure_ascii=False))
    if args.dry_run:
      print("(dry run: taxonomy.json not written)")
    else:
      save_taxonomy(path, data)
      print(f"appended draft entry '{entry['id']}' to {path}; fill signals, set status=active, re-run --validate")

  if not did_something:
    parser.print_help()
    return 2
  return 0


if __name__ == "__main__":
  sys.exit(main())
