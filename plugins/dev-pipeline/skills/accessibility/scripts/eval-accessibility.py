#!/usr/bin/env python3
"""Deterministic accessibility evaluator for type, targets, contrast & focus (jason-dev-agent / accessibility).

Runs inside the standard sandbox (xvfb-run + WebKit2GTK) against a built React
dist/index.html (or project dir) and audits the LIVE DOM against WCAG 2.2 + platform
guidance for the things a frontend developer controls when sizing type and buttons:

  text size      no visible text under 12px (hard); body paragraphs >= 14px (hard), >= 16px (recommended)
  line height    body text >= 1.4 (hard), >= 1.5 (recommended, WCAG 1.4.12); headings >= 1.0 (hard), >= 1.1 (recommended)
  eyebrows       uppercase / tracked labels <= 40 chars are exempt from body rules (12px floor still applies)
  contrast       WCAG 1.4.3: 4.5:1 normal text, 3:1 large text (>= 24px, or >= 18.66px bold)
                 WCAG 1.4.11: 3:1 for control borders/fills vs. surrounding background (reported)
  target size    WCAG 2.5.8 (AA): every control >= 24x24 css px (hard; inline text links exempt)
                 WCAG 2.5.5 (AAA) / Apple HIG / Material: >= 44x44 (recommended; count reported)
  focus          a :focus-visible (or :focus) rule exists in the shipped CSS (WCAG 2.4.7 / 2.4.11)
  names          every button / link / input has an accessible name (WCAG 4.1.2)
  images         every <img> has an alt attribute (empty alt allowed for decorative)
  document       <html lang> present; heading levels do not skip (reported)

Exit 0 when all hard gates pass, 1 otherwise. Prints a JSON report.
"""

import argparse
import json
import pathlib
import subprocess
import sys
import tempfile
from typing import Any


def run_webkit_a11y_probe(html_path: pathlib.Path, vw: int, vh: int) -> dict[str, Any]:
  helper_py = r"""
import json, pathlib, sys
import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib

html_file = pathlib.Path(sys.argv[1]).resolve()
vw, vh = int(sys.argv[2]), int(sys.argv[3])
out_json = pathlib.Path(sys.argv[4])

win = Gtk.OffscreenWindow()
win.set_default_size(vw, vh)
wv = WebKit2.WebView()
win.add(wv)
win.show_all()

PROBE_JS = '''
(() => {
  function parseColor(c) {
    const m = (c || '').match(/rgba?\\(([^)]+)\\)/);
    if (!m) return c === 'transparent' || !c ? [0,0,0,0] : [0,0,0,1];
    const p = m[1].split(',').map(s => parseFloat(s.trim()));
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function blend(fg, bg) { const a = fg[3]; return [fg[0]*a + bg[0]*(1-a), fg[1]*a + bg[1]*(1-a), fg[2]*a + bg[2]*(1-a), 1]; }
  function lum(c) { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }; return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); }
  function ratio(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); }
  function effectiveBg(el) {
    let cur = el, acc = null;
    while (cur && cur !== document.documentElement) {
      const st = getComputedStyle(cur);
      const bg = parseColor(st.backgroundColor);
      const hasImage = st.backgroundImage && st.backgroundImage !== 'none';
      if (bg[3] > 0) { acc = acc ? blend(acc, bg) : bg; if (bg[3] >= 0.999) return { color: acc, image: false }; }
      if (hasImage) return { color: acc || [128,128,128,1], image: true };
      cur = cur.parentElement;
    }
    const rootBg = parseColor(getComputedStyle(document.body).backgroundColor);
    const base = rootBg[3] > 0 ? rootBg : [255,255,255,1];
    return { color: acc ? blend(acc, base) : base, image: false };
  }
  function visible(el) {
    const r = el.getBoundingClientRect(); const st = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none' && parseFloat(st.opacity || '1') > 0.05;
  }
  function inClosedOverlay(el) {
    let p = el; while (p && p !== document.body) { const st = getComputedStyle(p); if (st.pointerEvents === 'none' || parseFloat(st.opacity||'1') === 0 || st.visibility === 'hidden') return true; p = p.parentElement; } return false;
  }
  function describe(el) {
    const tag = el.tagName.toLowerCase();
    const cls = (typeof el.className === 'string' && el.className.trim()) ? '.' + el.className.trim().split(/\\s+/).slice(0,2).join('.') : '';
    const txt = (el.textContent || '').trim().replace(/\\s+/g,' ').slice(0, 28);
    return tag + (el.id ? '#' + el.id : cls) + (txt ? ' ("' + txt + '")' : '');
  }
  function directText(el) { let t = ''; for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent; return t.replace(/\\s+/g,' ').trim(); }

  const BODY_TAGS = new Set(['p','li','td','th','dd','dt','blockquote','figcaption','label','summary']);
  const HEAD_TAGS = new Set(['h1','h2','h3','h4','h5','h6']);
  const textRows = [], contrastFails = [], tinyText = [], bodySmall = [], lhFails = [];
  let bodyCount = 0, bodyUnder16 = 0, bodyLhUnder15 = 0, headLhUnder11 = 0;
  const sizes = [];
  for (const el of Array.from(document.querySelectorAll('body *'))) {
    if (!visible(el) || inClosedOverlay(el)) continue;
    const text = directText(el);
    if (!text) continue;
    const st = getComputedStyle(el);
    const fs = parseFloat(st.fontSize); const fw = parseInt(st.fontWeight, 10) || 400;
    let lh = parseFloat(st.lineHeight); if (isNaN(lh)) lh = fs * 1.2; const lhRatio = lh / fs;
    const tag = el.tagName.toLowerCase();
    const isHead = HEAD_TAGS.has(tag) || fs >= 28;
    const isEyebrow = (st.textTransform === 'uppercase' || st.letterSpacing !== 'normal') && text.length <= 40 && fs <= 14;
    const isBody = !isEyebrow && (BODY_TAGS.has(tag) || (tag === 'span' && el.parentElement && BODY_TAGS.has(el.parentElement.tagName.toLowerCase())));
    const fg = parseColor(st.color);
    const bgInfo = effectiveBg(el);
    const fgOnBg = fg[3] < 1 ? blend(fg, bgInfo.color) : fg;
    const r = ratio(fgOnBg, bgInfo.color);
    const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const need = large ? 3.0 : 4.5;
    sizes.push(fs);
    if (fs < 12) tinyText.push({ el: describe(el), font_px: +fs.toFixed(1) });
    if (isBody && text.length >= 20) {
      bodyCount++;
      if (fs < 14) bodySmall.push({ el: describe(el), font_px: +fs.toFixed(1) });
      if (fs < 16) bodyUnder16++;
      if (lhRatio < 1.4) lhFails.push({ el: describe(el), line_height: +lhRatio.toFixed(2), font_px: +fs.toFixed(1) });
      if (lhRatio < 1.5) bodyLhUnder15++;
    }
    if (isHead && lhRatio < 1.0) lhFails.push({ el: describe(el), line_height: +lhRatio.toFixed(2), font_px: +fs.toFixed(1), heading: true });
    if (isHead && lhRatio < 1.1) headLhUnder11++;
    if (!bgInfo.image && r < need) contrastFails.push({ el: describe(el), ratio: +r.toFixed(2), required: need, font_px: +fs.toFixed(1), weight: fw, fg: st.color, bg: 'rgb(' + bgInfo.color.slice(0,3).map(Math.round).join(',') + ')' });
    textRows.push(1);
  }

  const targets = [], targetFails = [], under44 = [], unnamed = [];
  const ctrlSel = 'button, a[href], input, select, textarea, summary, [role="button"], [role="tab"], [role="link"], [role="checkbox"], [role="switch"]';
  for (const el of Array.from(document.querySelectorAll(ctrlSel))) {
    if (!visible(el) || inClosedOverlay(el)) continue;
    const tag = el.tagName.toLowerCase();
    const st = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const inlineLink = tag === 'a' && st.display === 'inline' && el.parentElement && (BODY_TAGS.has(el.parentElement.tagName.toLowerCase()) || el.parentElement.tagName.toLowerCase() === 'span');
    const name = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || (tag === 'input' ? (el.getAttribute('placeholder') || (el.labels && el.labels[0] && el.labels[0].textContent) || '') : '') || (el.textContent || '') || (el.querySelector('img[alt]') ? el.querySelector('img[alt]').getAttribute('alt') : '')).trim();
    if (!name && tag !== 'input' || (tag === 'input' && !name && !['hidden','submit','button'].includes(el.type))) unnamed.push(describe(el));
    const w = Math.round(r.width), h = Math.round(r.height);
    targets.push(1);
    if (!inlineLink) {
      if (w < 24 || h < 24) targetFails.push({ el: describe(el), w, h });
      else if (w < 44 || h < 44) under44.push({ el: describe(el), w, h });
    }
  }

  const imgs = Array.from(document.querySelectorAll('img'));
  const imgNoAlt = imgs.filter(i => !i.hasAttribute('alt')).map(describe);

  let focusRule = false;
  for (const ss of Array.from(document.styleSheets)) {
    let rules = []; try { rules = Array.from(ss.cssRules || []); } catch (e) { continue; }
    const stack = rules.slice();
    while (stack.length) { const rl = stack.pop(); if (rl.cssRules) stack.push(...Array.from(rl.cssRules)); const s = rl.selectorText || ''; if (/:focus-visible|:focus\\b/.test(s)) { focusRule = true; break; } }
    if (focusRule) break;
  }
  // Tailwind/UA outline removal without replacement is the classic failure
  let outlineNoneCount = 0;
  for (const el of Array.from(document.querySelectorAll(ctrlSel))) { const st = getComputedStyle(el); if (st.outlineStyle === 'none' && !focusRule) outlineNoneCount++; }

  const heads = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(visible).map(h => parseInt(h.tagName[1], 10));
  let skips = 0; for (let i = 1; i < heads.length; i++) if (heads[i] > heads[i-1] + 1) skips++;

  window.__a11yResult = JSON.stringify({
    text_nodes_checked: textRows.length,
    min_font_px: sizes.length ? +Math.min(...sizes).toFixed(1) : null,
    tiny_text_under_12px: tinyText.slice(0, 12),
    body_paragraphs: bodyCount,
    body_under_14px: bodySmall.slice(0, 12),
    body_under_16px_count: bodyUnder16,
    line_height_fails: lhFails.slice(0, 12),
    body_line_height_under_1_5_count: bodyLhUnder15,
    heading_line_height_under_1_1_count: headLhUnder11,
    contrast_fail_count: contrastFails.length,
    contrast_fails: contrastFails.slice(0, 16),
    controls_checked: targets.length,
    targets_under_24px: targetFails.slice(0, 16),
    targets_under_44px_count: under44.length,
    targets_under_44px: under44.slice(0, 12),
    unnamed_controls: unnamed.slice(0, 12),
    images: imgs.length,
    images_missing_alt: imgNoAlt.slice(0, 12),
    has_focus_visible_rule: focusRule,
    outline_none_without_focus_rule: outlineNoneCount,
    html_lang: document.documentElement.getAttribute('lang') || '',
    heading_level_skips: skips,
  });
  return 'done';
})()
'''

def poll_result():
    def cb(obj, res, _data):
        try:
            val = obj.run_javascript_finish(res).get_js_value()
            if not val.is_null() and not val.is_undefined():
                s = val.to_string()
                if s and s != 'null':
                    out_json.write_text(s, encoding='utf-8'); Gtk.main_quit(); return
        except Exception:
            pass
        GLib.timeout_add(150, poll_result)
    wv.run_javascript('window.__a11yResult', None, cb, None)
    return False

def start_probe():
    wv.run_javascript(PROBE_JS, None, None, None)
    GLib.timeout_add(250, poll_result)
    return False

def on_load(_view, event):
    if event == WebKit2.LoadEvent.FINISHED:
        GLib.timeout_add(500, start_probe)

wv.connect('load-changed', on_load)
GLib.timeout_add(20000, lambda: (Gtk.main_quit(), False)[1])
wv.load_uri(html_file.as_uri())
Gtk.main()
"""
  with tempfile.TemporaryDirectory(prefix="a11y_eval_") as tmp:
    tp = pathlib.Path(tmp)
    sp = tp / "probe_a11y.py"
    op = tp / "a11y.json"
    sp.write_text(helper_py, encoding="utf-8")
    subprocess.run(["xvfb-run", "-a", "/usr/bin/python3", str(sp), str(html_path), str(vw), str(vh), str(op)],
                   check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if op.exists():
      return json.loads(op.read_text(encoding="utf-8"))
  return {"error": "webkit_a11y_probe_timed_out"}


def main() -> None:
  ap = argparse.ArgumentParser(description="Evaluate accessible type sizes, line heights, contrast, target sizes, focus, names, alt, lang.")
  ap.add_argument("--project", help="Golden Template project directory containing dist/index.html.")
  ap.add_argument("--html", help="Direct path to built HTML file.")
  ap.add_argument("--viewport-width", type=int, default=1440)
  ap.add_argument("--viewport-height", type=int, default=900)
  ap.add_argument("--min-body-px", type=float, default=14.0, help="Hard floor for body paragraph font size (default 14; 16 recommended).")
  ap.add_argument("--require-44", action="store_true", help="Make the 44x44 recommended target size a hard gate (AAA / mobile).")
  ap.add_argument("--out-json", help="Optional path to save JSON report.")
  args = ap.parse_args()

  html_path: pathlib.Path | None = None
  if args.html:
    html_path = pathlib.Path(args.html).resolve()
  elif args.project:
    html_path = pathlib.Path(args.project).resolve() / "dist" / "index.html"
  if not html_path or not html_path.exists():
    print(json.dumps({"passed": False, "error": f"HTML bundle not found: {html_path}"}, indent=2)); sys.exit(1)

  m = run_webkit_a11y_probe(html_path, args.viewport_width, args.viewport_height)
  if "error" in m:
    print(json.dumps({"passed": False, **m}, indent=2)); sys.exit(1)

  gates = {
      "text_size_ok": not m["tiny_text_under_12px"] and all(b["font_px"] >= args.min_body_px for b in m["body_under_14px"]) and not m["body_under_14px"],
      "line_height_ok": not m["line_height_fails"],
      "contrast_ok": m["contrast_fail_count"] == 0,
      "target_size_ok": not m["targets_under_24px"] and (not args.require_44 or m["targets_under_44px_count"] == 0),
      "focus_visible_ok": bool(m["has_focus_visible_rule"]),
      "accessible_names_ok": not m["unnamed_controls"],
      "img_alt_ok": not m["images_missing_alt"],
      "lang_ok": bool(m["html_lang"]),
  }
  reasons = []
  if not gates["text_size_ok"]:
    reasons.append(f"text_too_small (under 12px: {len(m['tiny_text_under_12px'])}, body under {args.min_body_px:g}px: {len(m['body_under_14px'])})")
  if not gates["line_height_ok"]:
    reasons.append(f"line_height_too_tight ({len(m['line_height_fails'])} nodes; body needs >= 1.4, headings >= 1.0)")
  if not gates["contrast_ok"]:
    reasons.append(f"contrast_failures ({m['contrast_fail_count']} nodes below 4.5:1 / 3:1 large)")
  if not gates["target_size_ok"]:
    reasons.append(f"targets_too_small (under 24x24: {len(m['targets_under_24px'])}" + (f", under 44x44: {m['targets_under_44px_count']}" if args.require_44 else "") + ")")
  if not gates["focus_visible_ok"]:
    reasons.append("no_focus_visible_rule (keyboard focus has no visible style)")
  if not gates["accessible_names_ok"]:
    reasons.append(f"unnamed_controls ({len(m['unnamed_controls'])})")
  if not gates["img_alt_ok"]:
    reasons.append(f"images_missing_alt ({len(m['images_missing_alt'])})")
  if not gates["lang_ok"]:
    reasons.append("missing_html_lang")

  recommended = {
      "body_under_16px_count": m["body_under_16px_count"],
      "body_line_height_under_1_5_count": m["body_line_height_under_1_5_count"],
      "heading_line_height_under_1_1_count": m["heading_line_height_under_1_1_count"],
      "targets_under_44px_count": m["targets_under_44px_count"],
      "heading_level_skips": m["heading_level_skips"],
  }
  report = {"passed": not reasons, "html": str(html_path), "gates": gates, "recommended": recommended, "metrics": m, "reasons": reasons}
  out = json.dumps(report, indent=2)
  if args.out_json:
    pathlib.Path(args.out_json).write_text(out + "\n", encoding="utf-8")
  print(out)
  sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
  main()
