#!/usr/bin/env python3
"""Deterministic font-pairing evaluator (jason-dev-agent / font-pairing).

Runs inside the standard sandbox (xvfb-run + WebKit2GTK) against a built React
dist/index.html (or project dir) and checks that the LIVE DOM uses one strong, role-locked
type system:

  primary    headlines + subheadlines (h1-h3 and any text >= 28px) -> ONE family, >= 90% share
  secondary  body + UI (p, li, td, label, button, input, nav links)   -> ONE family, >= 90% share
  tertiary   optional accent (eyebrows, h4-h6 subheads, tabular numerals, mono labels)
             -> at most ONE extra family, <= 15% of text nodes, never used as body or h1-h3
  budget     <= 3 real families in total (generic/system fallbacks and icon fonts ignored)
  scale      heading sizes form a monotonic modular scale (h1 >= h2 >= h3, step ratio 1.1-1.8),
             body size >= 16px recommended, and at least 1.5x between h1 and body

Optional: --expect-primary / --expect-secondary / --expect-tertiary assert the families chosen in
style-direction/typography-and-color.md are the ones actually shipped.
Exit 0 when all hard gates pass, 1 otherwise. Prints a JSON report.
"""

import argparse
import json
import pathlib
import subprocess
import sys
import tempfile
from typing import Any

GENERIC = {"serif", "sans-serif", "monospace", "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace", "-apple-system",
           "blinkmacsystemfont", "segoe ui", "roboto", "helvetica neue", "arial", "noto sans", "apple color emoji",
           "segoe ui emoji", "segoe ui symbol", "noto color emoji", "cursive", "fantasy", "emoji", "math", "fangsong"}
ICON_HINTS = ("icon", "material symbols", "material icons", "fontawesome", "font awesome", "lucide")


def run_webkit_font_probe(html_path: pathlib.Path, vw: int, vh: int) -> dict[str, Any]:
  helper_py = r"""
import json, pathlib, sys
import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib

html_file = pathlib.Path(sys.argv[1]).resolve()
vw, vh = int(sys.argv[2]), int(sys.argv[3])
out_json = pathlib.Path(sys.argv[4])

win = Gtk.OffscreenWindow(); win.set_default_size(vw, vh)
wv = WebKit2.WebView(); win.add(wv); win.show_all()

PROBE_JS = '''
(() => {
  function visible(el) { const r = el.getBoundingClientRect(); const st = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none' && parseFloat(st.opacity||'1') > 0.05; }
  function inClosedOverlay(el) { let p = el; while (p && p !== document.body) { const st = getComputedStyle(p); if (st.pointerEvents === 'none' || parseFloat(st.opacity||'1') === 0 || st.visibility === 'hidden') return true; p = p.parentElement; } return false; }
  function directText(el) { let t = ''; for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent; return t.replace(/\\s+/g,' ').trim(); }
  function firstFamily(ff) { const f = (ff || '').split(',')[0].trim().replace(/^["']|["']$/g, ''); return f; }
  const HEAD = new Set(['h1','h2','h3']); const SUB = new Set(['h4','h5','h6']);
  const UI = new Set(['button','a','label','input','select','textarea','summary','nav']);
  const BODY = new Set(['p','li','td','th','dd','dt','blockquote','figcaption']);
  const rows = [];
  for (const el of Array.from(document.querySelectorAll('body *'))) {
    if (!visible(el) || inClosedOverlay(el)) continue;
    const text = directText(el); if (!text) continue;
    const st = getComputedStyle(el); const tag = el.tagName.toLowerCase();
    const fs = parseFloat(st.fontSize); const fw = parseInt(st.fontWeight, 10) || 400;
    const fam = firstFamily(st.fontFamily); const stack = st.fontFamily;
    const parentTag = el.parentElement ? el.parentElement.tagName.toLowerCase() : '';
    let role = 'other';
    if (HEAD.has(tag) || fs >= 28) role = 'headline';
    else if (SUB.has(tag)) role = 'subhead';
    else if (BODY.has(tag) || (tag === 'span' && BODY.has(parentTag))) role = 'body';
    else if (UI.has(tag) || UI.has(parentTag) || el.closest('nav,button,a,label')) role = 'ui';
    else if (fs <= 13 && (st.letterSpacing !== 'normal' || st.textTransform === 'uppercase')) role = 'eyebrow';
    else if (st.fontVariantNumeric && st.fontVariantNumeric.includes('tabular')) role = 'numeric';
    rows.push({ tag, role, family: fam, stack, font_px: +fs.toFixed(1), weight: fw, chars: text.length,
                level: HEAD.has(tag) || SUB.has(tag) ? parseInt(tag[1], 10) : null,
                mono: /mono|code|courier/i.test(stack) });
  }
  window.__fontResult = JSON.stringify({ rows });
  return 'done';
})()
'''
def poll_result():
    def cb(obj, res, _data):
        try:
            val = obj.run_javascript_finish(res).get_js_value()
            if not val.is_null() and not val.is_undefined():
                s = val.to_string()
                if s and s != 'null': out_json.write_text(s, encoding='utf-8'); Gtk.main_quit(); return
        except Exception: pass
        GLib.timeout_add(150, poll_result)
    wv.run_javascript('window.__fontResult', None, cb, None); return False
def start_probe():
    wv.run_javascript(PROBE_JS, None, None, None); GLib.timeout_add(250, poll_result); return False
def on_load(_view, event):
    if event == WebKit2.LoadEvent.FINISHED: GLib.timeout_add(600, start_probe)
wv.connect('load-changed', on_load)
GLib.timeout_add(20000, lambda: (Gtk.main_quit(), False)[1])
wv.load_uri(html_file.as_uri()); Gtk.main()
"""
  with tempfile.TemporaryDirectory(prefix="font_pair_eval_") as tmp:
    tp = pathlib.Path(tmp)
    sp, op = tp / "probe_fonts.py", tp / "fonts.json"
    sp.write_text(helper_py, encoding="utf-8")
    subprocess.run(["xvfb-run", "-a", "/usr/bin/python3", str(sp), str(html_path), str(vw), str(vh), str(op)],
                   check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if op.exists():
      return json.loads(op.read_text(encoding="utf-8"))
  return {"error": "webkit_font_probe_timed_out"}


def norm(f: str) -> str:
  return (f or "").strip().strip("'\"").lower()


def is_real_family(f: str) -> bool:
  n = norm(f)
  return bool(n) and n not in GENERIC and not any(h in n for h in ICON_HINTS)


def share_map(rows: list[dict[str, Any]], key: str = "chars") -> dict[str, float]:
  tot = sum(r[key] for r in rows) or 1
  out: dict[str, float] = {}
  for r in rows:
    out[r["family"]] = out.get(r["family"], 0) + r[key]
  return {k: round(v / tot, 3) for k, v in sorted(out.items(), key=lambda kv: -kv[1])}


def main() -> None:
  ap = argparse.ArgumentParser(description="Evaluate primary / secondary / tertiary font roles, family budget, and type scale in a built page.")
  ap.add_argument("--project", help="Golden Template project directory containing dist/index.html.")
  ap.add_argument("--html", help="Direct path to built HTML file.")
  ap.add_argument("--viewport-width", type=int, default=1440)
  ap.add_argument("--viewport-height", type=int, default=900)
  ap.add_argument("--expect-primary", help="Family expected for headlines (from style-direction).")
  ap.add_argument("--expect-secondary", help="Family expected for body/UI (from style-direction).")
  ap.add_argument("--expect-tertiary", help="Family expected for the accent role, if any.")
  ap.add_argument("--max-families", type=int, default=3)
  ap.add_argument("--out-json")
  args = ap.parse_args()

  html_path = pathlib.Path(args.html).resolve() if args.html else (pathlib.Path(args.project).resolve() / "dist" / "index.html" if args.project else None)
  if not html_path or not html_path.exists():
    print(json.dumps({"passed": False, "error": f"HTML bundle not found: {html_path}"}, indent=2)); sys.exit(1)
  data = run_webkit_font_probe(html_path, args.viewport_width, args.viewport_height)
  if "error" in data:
    print(json.dumps({"passed": False, **data}, indent=2)); sys.exit(1)

  rows = [r for r in data["rows"] if is_real_family(r["family"])]
  fallback_rows = [r for r in data["rows"] if not is_real_family(r["family"])]
  families = share_map(rows)
  heads = [r for r in rows if r["role"] == "headline"]
  body = [r for r in rows if r["role"] == "body"]
  ui = [r for r in rows if r["role"] == "ui"]
  accents = [r for r in rows if r["role"] in ("subhead", "eyebrow", "numeric")]

  head_share = share_map(heads)
  body_share = share_map(body + ui)
  primary = next(iter(head_share), None)
  secondary = next(iter(body_share), None)
  primary_share = head_share.get(primary, 0.0) if primary else 0.0
  secondary_share = body_share.get(secondary, 0.0) if secondary else 0.0
  core = {f for f in (primary, secondary) if f}
  extras = [f for f in families if f not in core]
  tertiary = extras[0] if extras else None
  tertiary_share = families.get(tertiary, 0.0) if tertiary else 0.0
  tertiary_roles = sorted({r["role"] for r in rows if r["family"] == tertiary}) if tertiary else []

  # type scale from headings (max size per level)
  level_size: dict[int, float] = {}
  for r in heads + [x for x in rows if x["role"] == "subhead"]:
    if r["level"]:
      level_size[r["level"]] = max(level_size.get(r["level"], 0), r["font_px"])
  ordered = [level_size[k] for k in sorted(level_size)]
  monotonic = all(ordered[i] >= ordered[i + 1] for i in range(len(ordered) - 1))
  ratios = [round(ordered[i] / ordered[i + 1], 2) for i in range(len(ordered) - 1) if ordered[i + 1] > 0 and ordered[i] != ordered[i + 1]]
  ratios_ok = all(1.1 <= x <= 1.8 for x in ratios) if ratios else True
  body_px = sorted(r["font_px"] for r in body)
  body_median = body_px[len(body_px) // 2] if body_px else None
  h1 = level_size.get(1) or (ordered[0] if ordered else None)
  hierarchy_ok = (h1 / body_median >= 1.5) if (h1 and body_median) else True

  gates = {
      "family_budget_ok": len(families) <= args.max_families,
      "primary_locked_ok": bool(primary) and primary_share >= 0.9,
      "secondary_locked_ok": bool(secondary) and secondary_share >= 0.9,
      "tertiary_restrained_ok": (tertiary is None) or (len(extras) == 1 and tertiary_share <= 0.15 and "body" not in tertiary_roles and "headline" not in tertiary_roles),
      "scale_ok": monotonic and ratios_ok and hierarchy_ok,
      "no_fallback_leaks_ok": not fallback_rows or (sum(r["chars"] for r in fallback_rows) / max(1, sum(r["chars"] for r in data["rows"]))) < 0.02,
  }
  expect_fail = []
  for label, want, got in (("primary", args.expect_primary, primary), ("secondary", args.expect_secondary, secondary), ("tertiary", args.expect_tertiary, tertiary)):
    if want and norm(want) != norm(got or ""):
      expect_fail.append(f"{label}: expected '{want}', shipped '{got}'")
  gates["matches_style_direction_ok"] = not expect_fail

  reasons = []
  if not gates["family_budget_ok"]:
    reasons.append(f"too_many_families ({len(families)} > {args.max_families}): {list(families)}")
  if not gates["primary_locked_ok"]:
    reasons.append(f"headlines_not_locked_to_one_family ({primary} at {primary_share:.0%}; need >= 90%)")
  if not gates["secondary_locked_ok"]:
    reasons.append(f"body_ui_not_locked_to_one_family ({secondary} at {secondary_share:.0%}; need >= 90%)")
  if not gates["tertiary_restrained_ok"]:
    reasons.append(f"tertiary_overused_or_misroled ({tertiary} at {tertiary_share:.0%} in roles {tertiary_roles}; extras={extras})")
  if not gates["scale_ok"]:
    reasons.append(f"type_scale_off (monotonic={monotonic}, step_ratios={ratios}, h1/body={round(h1 / body_median, 2) if (h1 and body_median) else None})")
  if not gates["no_fallback_leaks_ok"]:
    reasons.append(f"fallback_font_leaks ({len(fallback_rows)} nodes rendering generic/system families)")
  reasons += expect_fail

  report = {
      "passed": not reasons,
      "html": str(html_path),
      "single_family_system": bool(primary and secondary and norm(primary) == norm(secondary)),
      "roles": {
          "primary": {"family": primary, "share_of_headlines": primary_share, "used_for": "headlines + subheadlines (h1-h3, >= 28px)"},
          "secondary": {"family": secondary, "share_of_body_ui": secondary_share, "used_for": "body + ui (p, li, labels, buttons, nav)"},
          "tertiary": {"family": tertiary, "share_of_all_text": tertiary_share, "roles": tertiary_roles, "used_for": "accent only (eyebrow / h4-h6 / numerals / mono)"},
      },
      "families_by_char_share": families,
      "type_scale": {"heading_px_by_level": {str(k): v for k, v in sorted(level_size.items())}, "step_ratios": ratios, "body_median_px": body_median,
                     "h1_over_body": round(h1 / body_median, 2) if (h1 and body_median) else None},
      "gates": gates,
      "metrics": {"text_nodes": len(data["rows"]), "real_family_nodes": len(rows), "fallback_nodes": len(fallback_rows),
                  "headline_nodes": len(heads), "body_nodes": len(body), "ui_nodes": len(ui), "accent_nodes": len(accents)},
      "reasons": reasons,
  }
  out = json.dumps(report, indent=2)
  if args.out_json:
    pathlib.Path(args.out_json).write_text(out + "\n", encoding="utf-8")
  print(out)
  sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
  main()
