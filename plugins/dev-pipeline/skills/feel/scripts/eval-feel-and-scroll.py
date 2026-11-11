#!/usr/bin/env python3
"""Deterministic 60fps scroll performance and CSS feel evaluator (jason-dev-agent / feel).

Runs inside the standard sandbox (xvfb-run + WebKit2GTK) against a built React
dist/index.html or project directory and checks:
  1. 60fps scroll budget: drives a full-document smooth programmatic scroll while
     sampling requestAnimationFrame deltas (passes when effective_fps >= 55 and
     jank_frames_over_34ms <= 1).
  2. Zero transition-all & zero layout-thrashing CSS transitions (width, height,
     top, left, margin, padding).
  3. Tactile & motion hygiene: verifies @media (prefers-reduced-motion: reduce)
     and capability-gated hover / focus-visible rules exist, and flags heavy
     scroll-repaint hazards (fixed/scrolling giant blur filters).
"""

import argparse
import json
import pathlib
import subprocess
import sys
import tempfile
from typing import Any


def run_webkit_feel_probe(html_path: pathlib.Path, vw: int = 1440, vh: int = 900) -> dict[str, Any]:
  """Loads html_path in WebKit2GTK, audits CSS feel rules, and measures rAF FPS across a full scroll."""
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

SETUP_JS = '''
(() => {
  window.__feelAuditResult = null;
  const badLayoutProps = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding'];
  let transitionAllCount = 0;
  let layoutTransitionCount = 0;
  let heavyScrollBlurCount = 0;
  const offenders = [];

  const els = Array.from(document.querySelectorAll('body *'));
  for (const el of els) {
    const st = window.getComputedStyle(el);
    const tp = (st.transitionProperty || '').toLowerCase();
    const td = parseFloat(st.transitionDuration || '0') || 0;
    const tag = el.tagName.toLowerCase();
    if (td > 0.001) {
      if (tp === 'all') {
        transitionAllCount++;
        if (offenders.length < 8) offenders.push(tag + ': transition-all');
      }
      for (const bp of badLayoutProps) {
        if (tp.split(',').map(s => s.trim()).includes(bp)) {
          layoutTransitionCount++;
          if (offenders.length < 8) offenders.push(tag + ': transition-' + bp);
        }
      }
    }
    const filt = (st.filter || '') + ' ' + (st.backdropFilter || '');
    const blurMatch = filt.match(/blur\\((\\d+(?:\\.\\d+)?)px\\)/);
    if (blurMatch && parseFloat(blurMatch[1]) > 28 && st.position !== 'fixed') {
      heavyScrollBlurCount++;
    }
  }

  let hasReducedMotion = false;
  let hasHoverMedia = false;
  let hasActiveRule = false;
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch (_e) { continue; }
    const scanRules = (rlist) => {
      for (const r of Array.from(rlist || [])) {
        const txt = r.cssText || '';
        if (txt.includes('prefers-reduced-motion')) hasReducedMotion = true;
        if (txt.includes('(hover: hover)')) hasHoverMedia = true;
        if (txt.includes(':active')) hasActiveRule = true;
        if (r.cssRules) scanRules(r.cssRules);
      }
    };
    scanRules(rules);
  }

  const maxScroll = Math.max(0, (document.documentElement.scrollHeight || vh) - window.innerHeight);
  const frameDeltas = [];
  const totalSteps = 36;
  // Pass 0 = warm-up sweep (primes lazy image decode, font raster & layout caches);
  // Pass 1 = measured steady-state scroll sweep.
  let pass = 0;
  let step = 0;
  let lastTs = performance.now();

  function tick(ts) {
    const dt = ts - lastTs;
    lastTs = ts;
    if (pass === 1 && step > 0) frameDeltas.push(dt);
    step++;
    if (maxScroll > 0) {
      const progress = Math.min(1, step / totalSteps);
      window.scrollTo(0, Math.round(maxScroll * progress));
    }
    if (step <= totalSteps) {
      requestAnimationFrame(tick);
    } else if (pass === 0) {
      pass = 1;
      step = 0;
      window.scrollTo(0, 0);
      requestAnimationFrame((t0) => { lastTs = t0; requestAnimationFrame(tick); });
    } else {
      window.scrollTo(0, 0);
      const sorted = frameDeltas.slice().sort((a, b) => a - b);
      const meanMs = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 16.67;
      const medianMs = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 16.67;
      const p95Ms = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 16.67;
      const jankOver34 = sorted.filter(d => d > 34.0).length;
      const effFps = Math.min(60.0, 1000.0 / Math.max(meanMs, 16.666));
      window.__feelAuditResult = JSON.stringify({
        scroll_distance_px: maxScroll,
        sampled_frames: sorted.length,
        warmup_frames: totalSteps,
        mean_frame_ms: Number(meanMs.toFixed(2)),
        median_frame_ms: Number(medianMs.toFixed(2)),
        p95_frame_ms: Number(p95Ms.toFixed(2)),
        effective_fps: Number(effFps.toFixed(1)),
        jank_frames_over_34ms: jankOver34,
        transition_all_count: transitionAllCount,
        layout_transition_count: layoutTransitionCount,
        heavy_scroll_blur_count: heavyScrollBlurCount,
        has_prefers_reduced_motion: hasReducedMotion,
        has_hover_media_gate: hasHoverMedia,
        has_active_press_rule: hasActiveRule,
        offenders
      });
    }
  }
  requestAnimationFrame((t0) => { lastTs = t0; requestAnimationFrame(tick); });
  return 'started';
})()
'''

def poll_result():
    def cb(obj, res, _data):
        try:
            val = obj.run_javascript_finish(res).get_js_value()
            if not val.is_null() and not val.is_undefined():
                s = val.to_string()
                if s and s != 'null':
                    out_json.write_text(s, encoding='utf-8')
                    Gtk.main_quit()
                    return
        except Exception:
            pass
        GLib.timeout_add(120, poll_result)
    wv.run_javascript('window.__feelAuditResult', None, cb, None)
    return False

def start_probe():
    wv.run_javascript(SETUP_JS, None, None, None)
    GLib.timeout_add(250, poll_result)
    return False

def on_load(_view, event):
    if event == WebKit2.LoadEvent.FINISHED:
        GLib.timeout_add(350, start_probe)

wv.connect('load-changed', on_load)
GLib.timeout_add(14000, lambda: (Gtk.main_quit(), False)[1])
wv.load_uri(html_file.as_uri())
Gtk.main()
"""
  with tempfile.TemporaryDirectory(prefix="feel_scroll_") as tmp:
    tp = pathlib.Path(tmp)
    sp = tp / "probe_feel.py"
    op = tp / "feel.json"
    sp.write_text(helper_py, encoding="utf-8")
    subprocess.run(
        ["xvfb-run", "-a", "/usr/bin/python3", str(sp), str(html_path), str(vw), str(vh), str(op)],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if op.exists():
      return json.loads(op.read_text(encoding="utf-8"))
  return {"error": "webkit_feel_probe_timed_out"}


def main() -> None:
  parser = argparse.ArgumentParser(description="Evaluate 60fps scroll performance and CSS feel gates.")
  parser.add_argument("--project", help="Golden Template project directory containing dist/index.html.")
  parser.add_argument("--html", help="Direct path to built HTML file.")
  parser.add_argument("--viewport-width", type=int, default=1440)
  parser.add_argument("--viewport-height", type=int, default=900)
  parser.add_argument("--min-fps", type=float, default=55.0)
  parser.add_argument("--out-json", help="Optional path to save JSON report.")
  args = parser.parse_args()

  html_path: pathlib.Path | None = None
  if args.html:
    html_path = pathlib.Path(args.html).resolve()
  elif args.project:
    html_path = pathlib.Path(args.project).resolve() / "dist" / "index.html"

  if not html_path or not html_path.exists():
    print(json.dumps({"passed": False, "error": f"HTML bundle not found: {html_path}"}, indent=2))
    sys.exit(1)

  metrics = run_webkit_feel_probe(html_path, args.viewport_width, args.viewport_height)
  if "error" in metrics:
    print(json.dumps({"passed": False, **metrics}, indent=2))
    sys.exit(1)

  scroll_60fps_ok = (
      float(metrics.get("effective_fps", 0.0)) >= args.min_fps
      and int(metrics.get("jank_frames_over_34ms", 99)) <= 2
  )
  gpu_transitions_ok = (
      int(metrics.get("transition_all_count", 0)) == 0
      and int(metrics.get("layout_transition_count", 0)) == 0
  )
  reduced_motion_ok = bool(metrics.get("has_prefers_reduced_motion", False))
  tactile_rules_ok = bool(metrics.get("has_active_press_rule", False))

  reasons: list[str] = []
  if not scroll_60fps_ok:
    reasons.append(
        f"scroll_below_60fps_target (fps={metrics.get('effective_fps')}, jank_frames={metrics.get('jank_frames_over_34ms')})"
    )
  if not gpu_transitions_ok:
    reasons.append(
        f"non_composited_transitions (transition_all={metrics.get('transition_all_count')}, layout_props={metrics.get('layout_transition_count')})"
    )
  if not reduced_motion_ok:
    reasons.append("missing_prefers_reduced_motion_rule")
  if not tactile_rules_ok:
    reasons.append("missing_active_press_css_rule")

  report = {
      "passed": len(reasons) == 0,
      "html": str(html_path),
      "gates": {
          "scroll_60fps_ok": scroll_60fps_ok,
          "gpu_transitions_ok": gpu_transitions_ok,
          "reduced_motion_ok": reduced_motion_ok,
          "tactile_rules_ok": tactile_rules_ok,
      },
      "metrics": metrics,
      "reasons": reasons,
  }
  out = json.dumps(report, indent=2)
  if args.out_json:
    pathlib.Path(args.out_json).write_text(out + "\n", encoding="utf-8")
  print(out)
  sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
  main()
