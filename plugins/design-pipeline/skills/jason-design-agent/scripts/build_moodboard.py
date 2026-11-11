#!/usr/bin/env python3
"""Deterministic #0c0c0b lowercase moodboard builder for jason-design-agent.

Enforces every non-negotiable jason-design-agent moodboard rule:
1. #0c0c0b canvas, 15px / 14px / 13px lowercase system sans, zero arrows, zero emojis.
2. ZERO preview-adjustment controls (no hue, warmth, depth, recolor, or font-switcher UI).
3. Zero approvals by default (all items start vote="none", selected=False, approved (0)).
4. Compact non-sticky top bar (14px top padding):
   - Top left (always visible): prompt-based moodboard title + exact prompt in quotes ("...").
   - Top right (always visible): "<N> design turn(s)".
5. Clean 5-row aligned rollover drawer (view, filter, system, typefaces, palette) in document flow.
6. Unified 1-website / 1-mobile-app card naming ("web -- home landing page", interior web routes,
   "mobile app -- <tab>", "component -- <name>", "experience -- <name>"), ZERO per-card descriptions,
   and "open" / "approve" / "skip" / "turn <n>" actions.
"""

from __future__ import annotations

import argparse
import base64
import json
import pathlib
import re
import subprocess
from typing import Any


def read_json(path: pathlib.Path, default: Any) -> Any:
  if not path.exists():
    return default
  try:
    return json.loads(path.read_text(encoding="utf-8"))
  except (OSError, json.JSONDecodeError):
    return default


MIN_SHORT_EDGE = 1024


def probe_plate_dims(img_path: pathlib.Path) -> tuple[int, int]:
  identify = pathlib.Path("/usr/bin/identify")
  bin_name = str(identify) if identify.exists() else "identify"
  out = subprocess.check_output(
      [bin_name, "-format", "%w %h", str(img_path) + "[0]"],
      text=True,
      stderr=subprocess.DEVNULL,
  ).strip()
  parts = out.splitlines()[-1].split()
  return int(parts[0]), int(parts[1])


def make_data_uri(
    png_path: pathlib.Path,
    out_img: pathlib.Path,
    max_raw_bytes: int = 380_000,
) -> str:
  magick = pathlib.Path("/usr/bin/magick")
  if magick.exists():
    pw, ph = probe_plate_dims(png_path)
    is_tall_scroll = ph > pw * 1.85
    eff_max_bytes = max(max_raw_bytes, 640_000) if is_tall_scroll else max_raw_bytes
    steps = (
        [("2048x7200>", 88), ("1800x6400>", 84), ("1600x5600>", 78), ("1440x5000>", 72)]
        if is_tall_scroll
        else [("2400x2400>", 88), ("2200x2200>", 82), ("2048x2048>", 76), ("1920x1920>", 70)]
    )
    out_webp = out_img.with_suffix(".webp")
    for idx_step, (resize_spec, qual) in enumerate(steps):
      subprocess.run(
          [
              str(magick),
              str(png_path),
              "-colorspace",
              "sRGB",
              "-strip",
              "-filter",
              "Lanczos",
              "-resize",
              resize_spec,
              "-define",
              "webp:use-sharp-yuv=1",
              "-quality",
              str(qual),
              str(out_webp),
          ],
          check=True,
      )
      raw = out_webp.read_bytes()
      if len(raw) <= eff_max_bytes or idx_step == len(steps) - 1:
        b64 = base64.b64encode(raw).decode("ascii")
        return f"data:image/webp;base64,{b64}"
  b64 = base64.b64encode(png_path.read_bytes()).decode("ascii")
  mime = "image/png" if png_path.suffix.lower() == ".png" else "image/jpeg"
  return f"data:{mime};base64,{b64}"


def render_standalone_plate_html(
    study_title: str,
    user_prompt: str,
    item: dict[str, Any],
    img_src: str,
    prev_href: str | None,
    next_href: str | None,
    back_href: str | None,
) -> str:
  is_mobile_portrait = int(item["h"]) > int(item["w"]) and str(item.get("pillar", "")) in ("app", "mobile-web")
  nav_links = []
  if back_href:
    nav_links.append(f'<a href="{back_href}">back to mood board</a>')
  if prev_href:
    nav_links.append(f'<a href="{prev_href}">previous</a>')
  if next_href:
    nav_links.append(f'<a href="{next_href}">next</a>')
  nav_html = "\n      ".join(nav_links)
  max_fit = "640px" if is_mobile_portrait else "1120px"

  return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{item["title"]} - {study_title}</title>
  <style>
    :root {{
      --bg: #0c0c0b;
      --fg: #ededec;
      --muted: #858481;
      --faint: #494946;
      --line: #1e1e1c;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
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
    header {{
      max-width: 1680px;
      margin: 0 auto;
      padding: 20px 28px 18px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }}
    .meta {{
      display: flex;
      align-items: baseline;
      gap: 14px;
      flex-wrap: wrap;
    }}
    .meta h1 {{
      font-size: 15px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: var(--fg);
    }}
    .meta span {{
      font-size: 14px;
      color: var(--muted);
    }}
    .actions {{
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 13px;
      flex-wrap: wrap;
    }}
    .actions a,
    .actions button {{
      font: inherit;
      color: var(--muted);
      background: none;
      border: 0;
      border-bottom: 1px solid var(--line);
      padding-bottom: 1px;
      text-decoration: none;
      text-transform: lowercase;
      cursor: pointer;
      transition: border-color 0.15s ease, color 0.15s ease;
    }}
    .actions a:hover,
    .actions button:hover,
    .actions button.is-active {{
      color: var(--fg);
      border-color: var(--fg);
    }}
    .actions .status {{ color: var(--faint); }}
    main {{
      max-width: 1680px;
      margin: 0 auto;
      padding: 0 28px 96px;
      overflow-x: auto;
    }}
    .stage {{ display: flex; justify-content: center; width: 100%; }}
    .stage img {{
      display: block;
      border-radius: 10px;
      border: 1px solid var(--line);
      height: auto;
    }}
    body.mode-fit .stage img {{ max-width: {max_fit}; width: 100%; }}
    body.mode-width .stage img {{ width: 100%; max-width: 100%; }}
    body.mode-actual .stage {{ justify-content: flex-start; }}
    body.mode-actual .stage img {{ width: auto; max-width: none; }}
  </style>
</head>
<body class="mode-fit">
  <header>
    <div class="meta">
      <h1>{item["title"]}</h1>
      <span>"{user_prompt}"</span>
    </div>
    <div class="actions">
      {nav_html}
      <button type="button" class="is-active" data-scale="fit">comfortable fit</button>
      <button type="button" data-scale="width">full width</button>
      <button type="button" data-scale="actual">actual pixels</button>
      <span class="status">{item["dims"]} · turn {item["turn"]}</span>
    </div>
  </header>
  <main>
    <div class="stage">
      <img src="{img_src}" alt="{item["title"]}" />
    </div>
  </main>
  <script>
    document.querySelectorAll('[data-scale]').forEach((btn) => {{
      btn.addEventListener('click', () => {{
        document.body.className = 'mode-' + btn.dataset.scale;
        document.querySelectorAll('[data-scale]').forEach((b) => b.classList.toggle('is-active', b === btn));
      }});
    }});
  </script>
</body>
</html>
"""


def render_index_html(
    study_slug: str,
    study_title: str,
    user_prompt: str,
    design_turns: int,
    company_name: str,
    architecture_note: str,
    typefaces_note: str,
    tokens: list[dict[str, str]],
    items_payload: list[dict[str, Any]],
    stamp: str,
    embedded: bool,
    storage_version: str = "v1",
    default_round: str = "latest",
    round_notes: dict[str, str] | None = None,
) -> str:
  turns_label = f"{design_turns} design turn" if design_turns == 1 else f"{design_turns} design turns"
  items_json = json.dumps(items_payload)
  tokens_json = json.dumps(tokens)
  round_notes_json = json.dumps(round_notes or {})
  embedded_js = "true" if embedded else "false"
  safe_key = re.sub(r"[^a-z0-9_]+", "_", study_slug.lower()) + f"_selections_{storage_version}"

  distinct_turns = sorted({int(it.get("turn", 1)) for it in items_payload})
  has_multi_rounds = len(distinct_turns) > 1
  present_pillars = {str(it.get("pillar", "")) for it in items_payload}
  pillar_defs = [
      ("web", "web"),
      ("mobile-web", "mobile web"),
      ("app", "application"),
      ("component", "component"),
      ("experience", "experience"),
  ]
  pillar_buttons_html = "\n                ".join(
      f'<button type="button" data-pillar="{p_key}">{p_label}</button>'
      for p_key, p_label in pillar_defs
      if p_key in present_pillars
  )
  init_round = "all"
  round_row_html = ""
  if has_multi_rounds:
    latest_turn = distinct_turns[-1]
    if default_round in ("back_to_back", "all", "h2h", "h2h_latest"):
      init_round = default_round
    elif default_round.isdigit() and int(default_round) in distinct_turns:
      init_round = str(int(default_round))
    else:
      init_round = str(latest_turn)
    b2b_cls = ' class="is-active"' if init_round == "back_to_back" else ""
    all_cls = ' class="is-active"' if init_round == "all" else ""
    all_lbl = "matrix" if len(distinct_turns) >= 3 else "all rounds"
    round_btns = "\n                ".join(
        f'<button type="button"{" class=\"is-active\"" if str(r) == init_round else ""} data-round="{r}">round {r}</button>'
        for r in distinct_turns
    )
    if len(distinct_turns) >= 3:
      r_prev, r_curr = distinct_turns[-2], distinct_turns[-1]
      compare_cls = ' class="is-active"' if init_round == "h2h_latest" else ""
      compare_btn = f'<button type="button"{compare_cls} data-round="h2h_latest">round {r_prev} vs round {r_curr} (2-col)</button>'
    else:
      compare_cls = ' class="is-active"' if init_round == "h2h" else ""
      compare_btn = f'<button type="button"{compare_cls} data-round="h2h">head to head (2-col)</button>'
    round_row_html = f"""
          <div class="meta-row" id="round-ribbon">
            <span class="meta-label">rounds</span>
            <div class="meta-val">
              <div class="actions">
                <button type="button"{b2b_cls} data-round="back_to_back">back to back</button>
                <button type="button"{all_cls} data-round="all">{all_lbl}</button>
                {round_btns}
                {compare_btn}
              </div>
              <span class="actions"><span class="status">{len(distinct_turns)} competing rounds</span></span>
            </div>
          </div>
"""

  return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-local-build-stamp" content="{stamp}" />
  <title>{study_title}</title>
  <style>
    :root {{
      --bg: #0c0c0b;
      --fg: #ededec;
      --muted: #858481;
      --faint: #494946;
      --line: #1e1e1c;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
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
    button {{
      font: inherit;
      text-transform: lowercase;
      color: inherit;
      background: none;
      border: 0;
      cursor: pointer;
    }}
    a {{ color: inherit; text-decoration: none; }}

    .page-header {{
      max-width: 1760px;
      margin: 0 auto;
      padding: 14px 28px 0;
    }}
    .header-bar {{
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);
    }}
    .header-left {{
      display: flex;
      align-items: baseline;
      gap: 4px 16px;
      flex-wrap: wrap;
      min-width: 0;
    }}
    .header-left h1,
    .header-left h1 button {{
      font-size: 15px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: var(--fg);
    }}
    .header-left h1 button {{
      border-bottom: 1px solid transparent;
      padding-bottom: 1px;
      transition: border-color 0.15s ease;
    }}
    .page-header:hover .header-left h1 button,
    .page-header.is-pinned .header-left h1 button {{
      border-color: var(--line);
    }}
    .header-prompt {{
      font-size: 14px;
      color: var(--muted);
    }}
    .header-turns {{
      font-size: 13px;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      flex-shrink: 0;
    }}

    .actions {{
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 13px;
      flex-wrap: wrap;
    }}
    .actions a,
    .actions button {{
      color: var(--muted);
      border-bottom: 1px solid var(--line);
      padding-bottom: 1px;
      transition: border-color 0.15s ease, color 0.15s ease;
      white-space: nowrap;
    }}
    .actions a:hover,
    .actions button:hover,
    .actions a.is-active,
    .actions button.is-active {{
      color: var(--fg);
      border-color: var(--fg);
    }}
    .actions .status {{
      color: var(--faint);
      white-space: nowrap;
    }}

    .drawer-grid {{
      display: grid;
      grid-template-rows: 0fr;
      opacity: 0;
      pointer-events: none;
      transition: grid-template-rows 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.16s ease;
    }}
    .page-header:hover .drawer-grid,
    .page-header.is-pinned .drawer-grid,
    .page-header:has(:focus-visible) .drawer-grid {{
      grid-template-rows: 1fr;
      opacity: 1;
      pointer-events: auto;
    }}
    .drawer-inner {{ overflow: hidden; }}
    .drawer-body {{
      padding: 14px 0 16px;
      border-bottom: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}
    .meta-row {{
      display: grid;
      grid-template-columns: 92px minmax(0, 1fr);
      align-items: baseline;
      column-gap: 16px;
      row-gap: 6px;
    }}
    .meta-label {{
      font-size: 13px;
      color: var(--faint);
      white-space: nowrap;
    }}
    .meta-val {{
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px 24px;
      flex-wrap: wrap;
      font-size: 13px;
      color: var(--muted);
      min-width: 0;
    }}
    .meta-text strong {{
      font-weight: 500;
      color: var(--fg);
    }}
    .swatch-list {{
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }}
    .swatch-btn {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
      transition: color 0.15s ease;
    }}
    .swatch-btn:hover {{ color: var(--fg); }}
    .swatch-dot {{
      width: 9px;
      height: 9px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.18);
      flex-shrink: 0;
    }}

    .workspace {{
      max-width: 1760px;
      margin: 0 auto;
      padding: 16px 28px clamp(96px, 14vh, 148px);
    }}
    .mosaic-grid {{
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 32px;
      align-items: start;
    }}
    .mosaic-grid.is-h2h {{
      grid-template-columns: repeat(2, minmax(0, 1fr));
      row-gap: 40px;
    }}
    .mosaic-grid.is-four-col {{
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 24px;
      row-gap: 44px;
    }}
    .mosaic-grid.is-five-col {{
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 18px;
      row-gap: 44px;
    }}
    .mosaic-grid.is-six-col {{
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 14px;
      row-gap: 44px;
    }}
    .mosaic-grid.is-seven-col {{
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 12px;
      row-gap: 44px;
    }}
    .mosaic-grid.is-row-locked {{
      row-gap: 40px;
    }}
    .mosaic-grid.is-back-to-back {{
      display: flex;
      flex-direction: column;
      gap: 64px;
    }}
    .round-section {{
      display: flex;
      flex-direction: column;
      gap: 24px;
    }}
    .round-section-head {{
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px 24px;
      flex-wrap: wrap;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--line);
    }}
    .round-section-title {{
      font-size: 14px;
      font-weight: 500;
      color: var(--fg);
      font-variant-numeric: tabular-nums;
    }}
    .round-section-note {{
      font-size: 13px;
      color: var(--muted);
    }}
    .round-subgrid {{
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 32px;
      align-items: start;
    }}
    .round-subgrid.cols-2 {{
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }}
    .round-subgrid.cols-1 {{
      grid-template-columns: minmax(0, 1fr);
    }}
    .mosaic-col {{
      display: flex;
      flex-direction: column;
      gap: 40px;
      min-width: 0;
    }}
    .mosaic-item {{
      display: flex;
      flex-direction: column;
      min-width: 0;
      transition: opacity 0.2s ease;
    }}
    .mosaic-item.is-skipped {{ opacity: 0.32; }}
    .plate-button {{
      display: block;
      width: 100%;
      border-radius: 10px;
      overflow: hidden;
      background: #121210;
      border: 1px solid var(--line);
      margin-bottom: 12px;
      padding: 0;
      text-align: left;
      transition: border-color 0.18s ease;
    }}
    .plate-button:hover {{ border-color: var(--muted); }}
    .mosaic-item.is-approved .plate-button {{ border-color: var(--fg); }}
    .plate-img {{ display: block; width: 100%; height: auto; }}
    .mosaic-item h2,
    .mosaic-item h2 button {{
      font-size: 15px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: var(--fg);
      text-align: left;
    }}
    .mosaic-item h2 {{ margin-bottom: 8px; }}

    .full-view {{ display: none; flex-direction: column; gap: 24px; }}
    .full-view.is-open {{ display: flex; }}
    .full-view-header {{
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--line);
    }}
    .full-view-meta {{ display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }}
    .full-view-meta h2 {{ font-size: 15px; font-weight: 500; color: var(--fg); }}
    .full-view-meta span {{ font-size: 13px; color: var(--faint); font-variant-numeric: tabular-nums; }}
    .full-stage {{ width: 100%; overflow-x: auto; display: flex; justify-content: center; }}
    .full-stage img {{ display: block; border-radius: 10px; border: 1px solid var(--line); height: auto; }}
    .full-stage.scale-fit img {{ width: 100%; max-width: 1120px; }}
    .full-stage.scale-fit.is-portrait img {{ max-width: 620px; }}
    .full-stage.scale-width img {{ width: 100%; max-width: 100%; }}
    .full-stage.scale-actual {{ justify-content: flex-start; }}
    .full-stage.scale-actual img {{ width: auto; max-width: none; }}

    .dev-empty {{ max-width: 560px; padding: clamp(28px, 5vh, 56px) 0; }}
    .dev-empty h2 {{ font-size: 15px; font-weight: 500; color: var(--fg); margin-bottom: 5px; }}
    .dev-empty p {{ font-size: 14px; color: var(--muted); margin-bottom: 18px; }}
    .dev-queue {{ font-size: 13px; color: var(--muted); }}

    @media (max-width: 1120px) {{
      .mosaic-grid {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
    }}
    @media (max-width: 720px) {{
      .page-header, .workspace {{ padding-left: 20px; padding-right: 20px; }}
      .meta-row {{ grid-template-columns: minmax(0, 1fr); row-gap: 2px; }}
      .mosaic-grid {{ grid-template-columns: minmax(0, 1fr); }}
    }}
  </style>
</head>
<body>
  <header class="page-header" id="page-header">
    <div class="header-bar">
      <div class="header-left">
        <h1><button type="button" id="study-trigger" title="roll over for views, filters, and system notes (click to pin)">{study_title}</button></h1>
        <p class="header-prompt">"{user_prompt}"</p>
      </div>
      <span class="header-turns" id="design-turn-readout">{turns_label}</span>
    </div>

    <div class="drawer-grid">
      <div class="drawer-inner">
        <div class="drawer-body">
          <div class="meta-row">
            <span class="meta-label">view</span>
            <div class="meta-val">
              <div class="actions" role="tablist" aria-label="design or development">
                <button type="button" role="tab" aria-selected="true" class="is-active" data-mode="design">design</button>
                <button type="button" role="tab" aria-selected="false" data-mode="dev">development</button>
              </div>
              <span class="actions"><span class="status" id="dev-turn-readout">jason-dev-agent 0 turns</span></span>
            </div>
          </div>
          {round_row_html}
          <div class="meta-row" id="design-ribbon">
            <span class="meta-label">filter</span>
            <div class="meta-val">
              <div class="actions">
                <button type="button" class="is-active" data-pillar="all">all</button>
                {pillar_buttons_html}
                <button type="button" data-pillar="approved" id="pill-approved">approved (0)</button>
              </div>
              <div class="actions">
                <button type="button" id="btn-approve-all">approve all</button>
                <button type="button" id="btn-clear-votes">clear</button>
                <button type="button" id="btn-export">export selections</button>
              </div>
            </div>
          </div>

          <div class="meta-row">
            <span class="meta-label">system</span>
            <div class="meta-val">
              <span class="meta-text"><strong>{company_name}</strong> · {architecture_note}</span>
            </div>
          </div>

          <div class="meta-row">
            <span class="meta-label">typefaces</span>
            <div class="meta-val">
              <span class="meta-text">{typefaces_note}</span>
            </div>
          </div>

          <div class="meta-row">
            <span class="meta-label">palette</span>
            <div class="meta-val">
              <div class="swatch-list" id="token-actions"></div>
              <div class="actions" id="palette-copy-wrap"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main class="workspace">
    <section id="view-design" aria-label="design mosaic">
      <div class="mosaic-grid" id="mosaic-grid">
        <div class="mosaic-col" id="col-0"></div>
        <div class="mosaic-col" id="col-1"></div>
        <div class="mosaic-col" id="col-2"></div>
      </div>

      <div class="full-view" id="full-view">
        <div class="full-view-header">
          <div class="full-view-meta">
            <h2 id="fv-title"></h2>
            <span id="fv-sub"></span>
          </div>
          <div class="actions">
            <button type="button" class="is-active" id="fv-back">back to mood board</button>
            <button type="button" id="fv-prev">previous</button>
            <button type="button" id="fv-next">next</button>
            <button type="button" class="is-active" data-fvscale="fit">comfortable fit</button>
            <button type="button" data-fvscale="width">full width</button>
            <button type="button" data-fvscale="actual">actual pixels</button>
            <button type="button" id="fv-approve">approve</button>
            <button type="button" id="fv-skip">skip</button>
            <a id="fv-open-tab" href="#" target="_blank">open</a>
          </div>
        </div>
        <div class="full-stage scale-fit" id="fv-stage">
          <img id="fv-img" src="" alt="" />
        </div>
      </div>
    </section>

    <section id="view-dev" style="display:none;" aria-label="development builds">
      <div class="dev-empty">
        <h2>development has not run yet</h2>
        <p>zero react builds have been started and jason-dev-agent is at zero turns. review the {len(items_payload)} plates in design first and mark approve on any concepts that should advance later.</p>
        <div class="dev-queue" id="queue-list"></div>
      </div>
    </section>
  </main>

  <script>
    const ITEMS = {items_json};
    const TOKENS = {tokens_json};
    const IS_EMBEDDED = {embedded_js};
    const BASE_TURNS_LABEL = {json.dumps(turns_label)};
    const USER_PROMPT = {json.dumps(user_prompt)};
    const STUDY_TITLE = {json.dumps(study_title)};
    const STUDY_SLUG = {json.dumps(study_slug)};
    const DESIGN_TURNS = {design_turns};
    const STORAGE_KEY = {json.dumps(safe_key)};

    function makeSelfContainedPlateBlob(item) {{
      const isPortrait = item.h > item.w && item.pillar === 'app';
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${{item.title}} - ${{STUDY_TITLE}}</title>
  <style>
    :root {{ --bg:#0c0c0b; --fg:#ededec; --muted:#858481; --faint:#494946; --line:#1e1e1c; }}
    * {{ box-sizing:border-box; margin:0; padding:0; }}
    html, body {{ background:var(--bg); color:var(--fg); font:15px/1.6 -apple-system,BlinkMacSystemFont,"Inter","Google Sans",system-ui,sans-serif; text-transform:lowercase; -webkit-font-smoothing:antialiased; }}
    header {{ max-width:1680px; margin:0 auto; padding:20px 28px 18px; display:flex; align-items:baseline; justify-content:space-between; gap:24px; flex-wrap:wrap; }}
    .meta {{ display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; }}
    h1 {{ font-size:15px; font-weight:500; color:var(--fg); }}
    .prompt {{ font-size:14px; color:var(--muted); }}
    .actions {{ display:flex; align-items:center; gap:18px; font-size:13px; flex-wrap:wrap; }}
    button {{ font:inherit; color:var(--muted); background:none; border:0; border-bottom:1px solid var(--line); padding-bottom:1px; text-transform:lowercase; cursor:pointer; }}
    button:hover, button.is-active {{ color:var(--fg); border-color:var(--fg); }}
    .status {{ color:var(--faint); }}
    main {{ max-width:1680px; margin:0 auto; padding:0 28px 96px; overflow-x:auto; }}
    .stage {{ display:flex; justify-content:center; width:100%; }}
    .stage img {{ display:block; border-radius:10px; border:1px solid var(--line); height:auto; }}
    body.mode-fit .stage img {{ max-width:${{isPortrait ? '640px' : '100%'}}; width:100%; }}
    body.mode-width .stage img {{ width:100%; max-width:100%; }}
    body.mode-actual .stage {{ justify-content:flex-start; }}
    body.mode-actual .stage img {{ width:auto; max-width:none; }}
  </style>
</head>
<body class="mode-fit">
  <header>
    <div class="meta">
      <h1>${{item.title}}</h1>
      <span class="prompt">"${{USER_PROMPT}}"</span>
    </div>
    <div class="actions">
      <button type="button" class="is-active" data-s="fit">comfortable fit</button>
      <button type="button" data-s="width">full width</button>
      <button type="button" data-s="actual">actual pixels</button>
      <span class="status">${{item.dims}} · turn ${{item.turn}}</span>
    </div>
  </header>
  <main><div class="stage"><img src="${{item.src}}" alt="${{item.title}}" /></div></main>
  <script>
    document.querySelectorAll('[data-s]').forEach((btn) => {{
      btn.addEventListener('click', () => {{
        document.body.className = 'mode-' + btn.dataset.s;
        document.querySelectorAll('[data-s]').forEach((b) => b.classList.toggle('is-active', b === btn));
      }});
    }});
  <` + `/script>
</body>
</html>`;
      return URL.createObjectURL(new Blob([html], {{ type: 'text/html' }}));
    }}

    for (const it of ITEMS) {{
      it.openHref = IS_EMBEDDED ? makeSelfContainedPlateBlob(it) : './plates/' + it.id + '.html';
    }}

    let votes = {{}};
    try {{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object') votes = saved;
    }} catch (_e) {{}}
    for (const item of ITEMS) {{
      if (!votes[item.id]) votes[item.id] = 'none';
    }}

    const HAS_MULTI_ROUNDS = {"true" if has_multi_rounds else "false"};
    const LATEST_ROUND = {json.dumps(str(distinct_turns[-1]) if distinct_turns else "all")};
    const INIT_ROUND = {json.dumps(init_round)};
    const ROUND_NOTES = {round_notes_json};
    let activeMode = 'design';
    let activePillar = 'all';
    let activeRound = HAS_MULTI_ROUNDS ? INIT_ROUND : 'all';
    let activePlateIdx = -1;

    const pageHeader = document.getElementById('page-header');
    const designTurnReadout = document.getElementById('design-turn-readout');
    document.getElementById('study-trigger').addEventListener('click', () => {{
      const pinned = pageHeader.classList.toggle('is-pinned');
      designTurnReadout.textContent = pinned ? BASE_TURNS_LABEL + ' · pinned' : BASE_TURNS_LABEL;
    }});

    function saveVotes() {{
      try {{ localStorage.setItem(STORAGE_KEY, JSON.stringify(votes)); }} catch (_e) {{}}
    }}

    const tokenActions = document.getElementById('token-actions');
    TOKENS.forEach((t) => {{
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch-btn';
      btn.title = t.token + ' · ' + (t.role || '') + ' (click to copy)';
      btn.innerHTML = '<span class="swatch-dot" style="background:' + t.hex + '"></span><span class="tok-txt">' + t.hex + '</span>';
      btn.addEventListener('click', () => {{
        try {{ navigator.clipboard.writeText(t.token + ': ' + t.hex + ';'); }} catch (_e) {{}}
        const span = btn.querySelector('.tok-txt');
        span.textContent = 'copied';
        setTimeout(() => {{ span.textContent = t.hex; }}, 900);
      }});
      tokenActions.appendChild(btn);
    }});

    const copyWrap = document.getElementById('palette-copy-wrap');
    if (TOKENS.length > 0) {{
      const copyAllBtn = document.createElement('button');
      copyAllBtn.type = 'button';
      copyAllBtn.textContent = 'copy css';
      copyAllBtn.addEventListener('click', () => {{
        const css = ':root {{\\n' + TOKENS.map((t) => '  ' + t.token + ': ' + t.hex + ';').join('\\n') + '\\n}}';
        try {{ navigator.clipboard.writeText(css); }} catch (_e) {{}}
        copyAllBtn.textContent = 'copied';
        setTimeout(() => {{ copyAllBtn.textContent = 'copy css'; }}, 900);
      }});
      copyWrap.appendChild(copyAllBtn);
    }}

    const DISTINCT_TURNS = {json.dumps(distinct_turns)};
    function getFilteredItems() {{
      return ITEMS.filter((it) => {{
        let roundOk = false;
        if (activeRound === 'all' || activeRound === 'back_to_back' || activeRound === 'h2h') {{
          roundOk = true;
        }} else if (activeRound === 'h2h_latest' && DISTINCT_TURNS.length >= 2) {{
          const tPrev = DISTINCT_TURNS[DISTINCT_TURNS.length - 2];
          const tCurr = DISTINCT_TURNS[DISTINCT_TURNS.length - 1];
          roundOk = Number(it.turn) === tPrev || Number(it.turn) === tCurr;
        }} else {{
          roundOk = String(it.turn) === String(activeRound);
        }}
        if (!roundOk) return false;
        if (activePillar === 'all') return true;
        if (activePillar === 'approved') return votes[it.id] === 'up';
        return it.pillar === activePillar;
      }});
    }}

    function updateCounts() {{
      const upItems = ITEMS.filter((it) => votes[it.id] === 'up');
      document.getElementById('pill-approved').textContent = 'approved (' + upItems.length + ')';
      document.getElementById('queue-list').textContent = upItems.length === 0
        ? 'approved for development (0): none selected yet.'
        : 'approved for development (' + upItems.length + '): ' + upItems.map((i) => i.title).join(' · ');
    }}

    function getColCount() {{
      if (window.innerWidth <= 720) return 1;
      if (activeRound === 'h2h' || activeRound === 'h2h_latest' || window.innerWidth <= 1120) return 2;
      return 3;
    }}

    function buildCardElement(item) {{
      const vote = votes[item.id] || 'none';
      const article = document.createElement('article');
      article.className = 'mosaic-item' + (vote === 'up' ? ' is-approved' : vote === 'down' ? ' is-skipped' : '');

      const plateBtn = document.createElement('button');
      plateBtn.type = 'button';
      plateBtn.className = 'plate-button';
      plateBtn.style.aspectRatio = item.w + ' / ' + item.h;
      plateBtn.addEventListener('click', () => openFullView(ITEMS.indexOf(item)));

      const img = document.createElement('img');
      img.className = 'plate-img';
      img.src = item.src;
      img.alt = item.title;
      img.loading = 'lazy';
      plateBtn.appendChild(img);

      const h2 = document.createElement('h2');
      const titleBtn = document.createElement('button');
      titleBtn.type = 'button';
      titleBtn.textContent = item.title;
      titleBtn.addEventListener('click', () => openFullView(ITEMS.indexOf(item)));
      h2.appendChild(titleBtn);

      const acts = document.createElement('div');
      acts.className = 'actions';

      const openLink = document.createElement('a');
      openLink.href = item.openHref;
      openLink.target = '_blank';
      openLink.textContent = 'open';

      const approveBtn = document.createElement('button');
      approveBtn.type = 'button';
      if (vote === 'up') approveBtn.className = 'is-active';
      approveBtn.textContent = vote === 'up' ? 'approved' : 'approve';
      approveBtn.addEventListener('click', () => {{
        votes[item.id] = votes[item.id] === 'up' ? 'none' : 'up';
        saveVotes();
        updateCounts();
        renderMosaic();
      }});

      const skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      if (vote === 'down') skipBtn.className = 'is-active';
      skipBtn.textContent = vote === 'down' ? 'skipped' : 'skip';
      skipBtn.addEventListener('click', () => {{
        votes[item.id] = votes[item.id] === 'down' ? 'none' : 'down';
        saveVotes();
        updateCounts();
        renderMosaic();
      }});

      const turnSpan = document.createElement('span');
      turnSpan.className = 'status';
      turnSpan.textContent = (HAS_MULTI_ROUNDS ? 'round ' : 'turn ') + item.turn;

      acts.appendChild(openLink);
      acts.appendChild(approveBtn);
      acts.appendChild(skipBtn);
      acts.appendChild(turnSpan);

      article.appendChild(plateBtn);
      article.appendChild(h2);
      article.appendChild(acts);
      return article;
    }}

    function renderMosaic() {{
      const gridEl = document.getElementById('mosaic-grid');
      const isBackToBack = activeRound === 'back_to_back' && HAS_MULTI_ROUNDS;
      const isTwoColCompare = activeRound === 'h2h' || activeRound === 'h2h_latest';
      const colCount = getColCount();
      const isThreeRoundProgression = DISTINCT_TURNS.length === 3 && activeRound === 'all' && colCount === 3;
      const isFourRoundProgression = DISTINCT_TURNS.length === 4 && activeRound === 'all' && window.innerWidth > 1120;
      const isFiveRoundProgression = DISTINCT_TURNS.length === 5 && activeRound === 'all' && window.innerWidth > 1120;
      const isSixRoundProgression = DISTINCT_TURNS.length === 6 && activeRound === 'all' && window.innerWidth > 1120;
      const isSevenRoundProgression = DISTINCT_TURNS.length === 7 && activeRound === 'all' && window.innerWidth > 1120;
      const useDirectGridRows = (!isBackToBack && (isThreeRoundProgression || isFourRoundProgression || isFiveRoundProgression || isSixRoundProgression || isSevenRoundProgression || (isTwoColCompare && colCount === 2)));

      gridEl.classList.toggle('is-back-to-back', isBackToBack);
      gridEl.classList.toggle('is-h2h', isTwoColCompare);
      gridEl.classList.toggle('is-four-col', isFourRoundProgression);
      gridEl.classList.toggle('is-five-col', isFiveRoundProgression);
      gridEl.classList.toggle('is-six-col', isSixRoundProgression);
      gridEl.classList.toggle('is-seven-col', isSevenRoundProgression);
      gridEl.classList.toggle('is-row-locked', useDirectGridRows);

      // Remove any previously rendered direct grid items or round sections
      Array.from(gridEl.querySelectorAll(':scope > .mosaic-item, :scope > .round-section')).forEach((el) => el.remove());

      const cols = [document.getElementById('col-0'), document.getElementById('col-1'), document.getElementById('col-2')];
      cols.forEach((c) => {{ c.innerHTML = ''; c.style.display = (useDirectGridRows || isBackToBack) ? 'none' : ''; }});
      if (!useDirectGridRows && !isBackToBack) {{
        if (colCount === 2) cols[2].style.display = 'none';
        if (colCount === 1) {{ cols[1].style.display = 'none'; cols[2].style.display = 'none'; }}
      }}

      const filtered = getFilteredItems();

      if (isBackToBack) {{
        DISTINCT_TURNS.forEach((turnNum) => {{
          const roundItems = filtered.filter((it) => Number(it.turn) === Number(turnNum));
          if (!roundItems.length) return;
          const sec = document.createElement('section');
          sec.className = 'round-section';
          const head = document.createElement('div');
          head.className = 'round-section-head';
          const titleEl = document.createElement('span');
          titleEl.className = 'round-section-title';
          const noteText = ROUND_NOTES[String(turnNum)] || '';
          titleEl.textContent = noteText ? ('round ' + turnNum + ' — ' + noteText) : ('round ' + turnNum);
          const countEl = document.createElement('span');
          countEl.className = 'round-section-note';
          countEl.textContent = roundItems.length + (roundItems.length === 1 ? ' plate' : ' plates');
          head.appendChild(titleEl);
          head.appendChild(countEl);
          const sub = document.createElement('div');
          sub.className = 'round-subgrid cols-' + colCount;
          roundItems.forEach((it) => sub.appendChild(buildCardElement(it)));
          sec.appendChild(head);
          sec.appendChild(sub);
          gridEl.appendChild(sec);
        }});
        return;
      }}

      const useNaturalCols = activePillar === 'all' && activeRound === 'all' && colCount === 3;

      filtered.forEach((item, idx) => {{
        const article = buildCardElement(item);
        if (useDirectGridRows) {{
          gridEl.appendChild(article);
        }} else {{
          let targetCol = idx % colCount;
          if (useNaturalCols && typeof item.col === 'number') {{
            targetCol = item.col;
          }}
          cols[targetCol].appendChild(article);
        }}
      }});
    }}

    function openFullView(idx) {{
      if (idx < 0 || idx >= ITEMS.length) return;
      activePlateIdx = idx;
      const it = ITEMS[idx];
      document.getElementById('mosaic-grid').style.display = 'none';
      document.getElementById('design-ribbon').style.display = 'none';
      const rr = document.getElementById('round-ribbon');
      if (rr) rr.style.display = 'none';
      document.getElementById('full-view').classList.add('is-open');
      document.getElementById('fv-title').textContent = it.title;
      document.getElementById('fv-sub').textContent = it.dims + ' · ' + (HAS_MULTI_ROUNDS ? 'round ' : 'turn ') + it.turn;
      document.getElementById('fv-img').src = it.src;
      document.getElementById('fv-img').alt = it.title;
      document.getElementById('fv-open-tab').href = it.openHref;
      document.getElementById('fv-stage').className = 'full-stage scale-fit' + (it.h > it.w && (it.pillar === 'app' || it.pillar === 'mobile-web') ? ' is-portrait' : '');
      document.querySelectorAll('[data-fvscale]').forEach((b) => b.classList.toggle('is-active', b.dataset.fvscale === 'fit'));
      syncFullViewVotes();
      window.scrollTo({{ top: 0, behavior: 'instant' }});
    }}

    function closeFullView() {{
      activePlateIdx = -1;
      document.getElementById('full-view').classList.remove('is-open');
      if (activeMode === 'design') {{
        document.getElementById('mosaic-grid').style.display = '';
        document.getElementById('design-ribbon').style.display = '';
        const rr = document.getElementById('round-ribbon');
        if (rr) rr.style.display = '';
      }}
    }}

    function syncFullViewVotes() {{
      if (activePlateIdx < 0) return;
      const v = votes[ITEMS[activePlateIdx].id] || 'none';
      const upB = document.getElementById('fv-approve');
      const dnB = document.getElementById('fv-skip');
      upB.classList.toggle('is-active', v === 'up');
      upB.textContent = v === 'up' ? 'approved' : 'approve';
      dnB.classList.toggle('is-active', v === 'down');
      dnB.textContent = v === 'down' ? 'skipped' : 'skip';
    }}

    document.getElementById('fv-back').addEventListener('click', closeFullView);
    document.getElementById('fv-prev').addEventListener('click', () => {{
      if (activePlateIdx >= 0) openFullView((activePlateIdx - 1 + ITEMS.length) % ITEMS.length);
    }});
    document.getElementById('fv-next').addEventListener('click', () => {{
      if (activePlateIdx >= 0) openFullView((activePlateIdx + 1) % ITEMS.length);
    }});
    document.querySelectorAll('[data-fvscale]').forEach((btn) => {{
      btn.addEventListener('click', () => {{
        if (activePlateIdx < 0) return;
        const isP = ITEMS[activePlateIdx].h > ITEMS[activePlateIdx].w;
        document.getElementById('fv-stage').className = 'full-stage scale-' + btn.dataset.fvscale + (isP ? ' is-portrait' : '');
        document.querySelectorAll('[data-fvscale]').forEach((b) => b.classList.toggle('is-active', b === btn));
      }});
    }});
    document.getElementById('fv-approve').addEventListener('click', () => {{
      if (activePlateIdx < 0) return;
      const id = ITEMS[activePlateIdx].id;
      votes[id] = votes[id] === 'up' ? 'none' : 'up';
      saveVotes(); syncFullViewVotes(); updateCounts(); renderMosaic();
    }});
    document.getElementById('fv-skip').addEventListener('click', () => {{
      if (activePlateIdx < 0) return;
      const id = ITEMS[activePlateIdx].id;
      votes[id] = votes[id] === 'down' ? 'none' : 'down';
      saveVotes(); syncFullViewVotes(); updateCounts(); renderMosaic();
    }});
    window.addEventListener('keydown', (e) => {{
      if (activePlateIdx < 0) return;
      if (e.key === 'Escape') closeFullView();
      if (e.key === 'ArrowLeft') openFullView((activePlateIdx - 1 + ITEMS.length) % ITEMS.length);
      if (e.key === 'ArrowRight') openFullView((activePlateIdx + 1) % ITEMS.length);
    }});

    document.querySelectorAll('[data-mode]').forEach((btn) => {{
      btn.addEventListener('click', () => {{
        activeMode = btn.dataset.mode;
        closeFullView();
        document.querySelectorAll('[data-mode]').forEach((b) => {{
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        }});
        document.getElementById('view-design').style.display = activeMode === 'design' ? '' : 'none';
        document.getElementById('design-ribbon').style.display = activeMode === 'design' ? '' : 'none';
        const rr = document.getElementById('round-ribbon');
        if (rr) rr.style.display = activeMode === 'design' ? '' : 'none';
        document.getElementById('view-dev').style.display = activeMode === 'dev' ? '' : 'none';
      }});
    }});

    document.querySelectorAll('[data-round]').forEach((rBtn) => {{
      rBtn.addEventListener('click', () => {{
        activeRound = rBtn.dataset.round;
        document.querySelectorAll('[data-round]').forEach((b) => b.classList.toggle('is-active', b === rBtn));
        renderMosaic();
      }});
    }});

    document.querySelectorAll('[data-pillar]').forEach((pill) => {{
      pill.addEventListener('click', () => {{
        activePillar = pill.dataset.pillar;
        document.querySelectorAll('[data-pillar]').forEach((p) => p.classList.toggle('is-active', p === pill));
        renderMosaic();
      }});
    }});

    document.getElementById('btn-approve-all').addEventListener('click', () => {{
      ITEMS.forEach((it) => {{ votes[it.id] = 'up'; }});
      saveVotes(); updateCounts(); renderMosaic();
    }});
    document.getElementById('btn-clear-votes').addEventListener('click', () => {{
      ITEMS.forEach((it) => {{ votes[it.id] = 'none'; }});
      saveVotes(); updateCounts(); renderMosaic();
    }});
    document.getElementById('btn-export').addEventListener('click', () => {{
      const payload = {{
        source: 'jason-design-agent',
        study: STUDY_SLUG,
        prompt: USER_PROMPT,
        design_agent_turns: DESIGN_TURNS,
        updated_at: new Date().toISOString(),
        items: ITEMS.map((it) => ({{
          slug: it.id,
          title: it.title,
          pillar: it.pillar,
          plate: it.relPng,
          prompt: it.promptMd,
          selected: votes[it.id] === 'up',
          vote: votes[it.id] || 'none',
        }})),
      }};
      const blob = new Blob([JSON.stringify(payload, null, 2)], {{ type: 'application/json' }});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'selections.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    }});

    fetch('projects/dev-turns.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {{
        if (!d) return;
        const turns = d.total_dev_turns || 0;
        document.getElementById('dev-turn-readout').textContent =
          'jason-dev-agent ' + turns + (turns === 1 ? ' turn' : ' turns');
      }})
      .catch(() => {{}});

    window.addEventListener('resize', () => {{ if (activePlateIdx < 0) renderMosaic(); }});
    updateCounts();
    renderMosaic();
  </script>
</body>
</html>
"""


def main() -> int:
  parser = argparse.ArgumentParser(description="Build #0c0c0b lowercase moodboard for jason-design-agent.")
  parser.add_argument("--config", required=True, help="Path to moodboard config JSON.")
  parser.add_argument("--study-dir", required=True, help="Output study directory.")
  parser.add_argument("--artifact-html", help="Optional singlefile embedded HTML output path.")
  parser.add_argument("--thumbs-dir", help="Optional scratch directory for embedded image compression.")
  parser.add_argument(
      "--max-artifact-mb",
      type=float,
      default=18.0,
      help="Hard size ceiling in MB for --artifact-html so right-pane previews stay <20MB (default: 18.0).",
  )
  parser.add_argument(
      "--allow-legacy",
      action="store_true",
      help="Bypass the >=1K short-edge (1024px) verification gate for historical studies only.",
  )
  parser.add_argument(
      "--latest-only",
      action="store_true",
      help="Display only the latest round (max turn) in the rendered moodboard and artifact HTML.",
  )
  args = parser.parse_args()

  cfg_path = pathlib.Path(args.config).expanduser().resolve()
  study_dir = pathlib.Path(args.study_dir).expanduser().resolve()
  cfg = read_json(cfg_path, {})

  study_slug = str(cfg.get("study_slug") or study_dir.name)
  study_title = str(cfg.get("study_title") or study_slug.replace("-", " "))
  user_prompt = str(cfg.get("user_prompt") or "")
  design_turns = int(cfg.get("design_turns") or 1)
  company_name = str(cfg.get("company_name") or study_title)
  architecture_note = str(
      cfg.get("architecture_note")
      or "one website (home landing page + 2 interior pages) · one mobile app (3 tabs) · 3 components · 3 experiences"
  )
  typefaces_note = str(cfg.get("typefaces_note") or "")
  tokens = list(cfg.get("tokens") or [])
  items = list(cfg.get("items") or [])
  if args.latest_only and items:
    max_turn = max(int(it.get("turn", 1)) for it in items)
    items = [it for it in items if int(it.get("turn", 1)) == max_turn]
  storage_version = str(cfg.get("storage_version") or "v1")

  plates_dir = study_dir / "plates"
  plates_dir.mkdir(parents=True, exist_ok=True)
  thumbs_dir = pathlib.Path(args.thumbs_dir).expanduser().resolve() if args.thumbs_dir else None
  if thumbs_dir:
    thumbs_dir.mkdir(parents=True, exist_ok=True)

  study_items: list[dict[str, Any]] = []
  artifact_items: list[dict[str, Any]] = []

  for idx, raw_it in enumerate(items):
    it = dict(raw_it)
    it["defaultVote"] = "none"
    rel_png = str(it["relPng"])
    png_disk = study_dir / rel_png.lstrip("./")
    if not png_disk.exists():
      raise SystemExit(
          json.dumps({"passed": False, "error": f"Missing plate file: {png_disk}"})
      )
    nat_w, nat_h = probe_plate_dims(png_disk)
    if min(nat_w, nat_h) < MIN_SHORT_EDGE and not args.allow_legacy:
      raise SystemExit(
          json.dumps({
              "passed": False,
              "error": (
                  f"Plate {it.get('id')} ({png_disk.name}) is {nat_w}x{nat_h} "
                  f"(short edge {min(nat_w, nat_h)}px < {MIN_SHORT_EDGE}px 1K floor). "
                  "Run lock_and_verify_plates.py first so every plate is >=1K/2K crystal clear."
              ),
          })
      )
    it["w"] = nat_w
    it["h"] = nat_h
    it["dims"] = f"{nat_w} × {nat_h}"
    plate_rel_png = str(it.get("plateRelPng") or ("../" + rel_png.lstrip("./")))
    prev_it = items[(idx - 1) % len(items)]
    next_it = items[(idx + 1) % len(items)]

    plate_html = render_standalone_plate_html(
        study_title=study_title,
        user_prompt=user_prompt,
        item=it,
        img_src=plate_rel_png,
        prev_href=f"./{prev_it['id']}.html",
        next_href=f"./{next_it['id']}.html",
        back_href="../index.html",
    )
    (plates_dir / f"{it['id']}.html").write_text(plate_html, encoding="utf-8")

    s_entry = dict(it)
    s_entry["src"] = rel_png
    study_items.append(s_entry)

    if args.artifact_html:
      png_file = study_dir / rel_png.lstrip("./")
      out_jpg = (thumbs_dir or plates_dir) / f"{it['id']}.webp"
      max_total_bytes = max(1_000_000, int(args.max_artifact_mb * 1024 * 1024) - 220_000)
      per_plate_budget = max(120_000, int((max_total_bytes / 1.35) / max(1, len(items))))
      a_entry = dict(it)
      a_entry["src"] = make_data_uri(png_file, out_jpg, max_raw_bytes=per_plate_budget)
      artifact_items.append(a_entry)

  default_round = str(cfg.get("default_round") or "latest")
  raw_rnotes = cfg.get("round_notes") or {}
  round_notes = {str(k): str(v) for k, v in raw_rnotes.items()} if isinstance(raw_rnotes, dict) else {}

  study_html = render_index_html(
      study_slug=study_slug,
      study_title=study_title,
      user_prompt=user_prompt,
      design_turns=design_turns,
      company_name=company_name,
      architecture_note=architecture_note,
      typefaces_note=typefaces_note,
      tokens=tokens,
      items_payload=study_items,
      stamp="STUDY_INDEX_ACTIVE",
      embedded=False,
      storage_version=storage_version,
      default_round=default_round,
      round_notes=round_notes,
  )
  (study_dir / "index.html").write_text(study_html, encoding="utf-8")

  selections_payload = {
      "source": "jason-design-agent",
      "study": study_slug,
      "prompt": user_prompt,
      "design_agent_turns": design_turns,
      "items": [
          {
              "slug": it["id"],
              "title": it["title"],
              "pillar": it["pillar"],
              "plate": it["relPng"],
              "prompt": it.get("promptMd", ""),
              "selected": False,
              "vote": "none",
          }
          for it in items
      ],
  }
  (study_dir / "selections.json").write_text(
      json.dumps(selections_payload, indent=2) + "\n", encoding="utf-8"
  )

  if args.artifact_html:
    art_out = pathlib.Path(args.artifact_html).expanduser().resolve()
    art_html = render_index_html(
        study_slug=study_slug,
        study_title=study_title,
        user_prompt=user_prompt,
        design_turns=design_turns,
        company_name=company_name,
        architecture_note=architecture_note,
        typefaces_note=typefaces_note,
        tokens=tokens,
        items_payload=artifact_items,
        stamp="READY_FOR_SNAPSHOT",
        embedded=True,
        storage_version=storage_version,
        default_round=default_round,
        round_notes=round_notes,
    )
    art_out.write_text(art_html, encoding="utf-8")

  print(json.dumps({"passed": True, "study_dir": str(study_dir), "plates": len(items)}))
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
