#!/usr/bin/env python3
"""Deterministic interaction evaluator (jason-dev-agent / interaction).

Runs inside the standard sandbox (xvfb-run + WebKit2GTK) against a built React
dist/index.html or project directory and checks:
  1. zero dead controls: every <button>, <a href>, <summary>, [role=button|tab]
     produces a real change when activated (DOM mutation, attribute/ARIA change,
     scroll position change, focus/overlay change, or in-page anchor navigation).
     `href="#"` and missing-href anchors count as dead.
  2. scroll points: at least one `[data-scroll-point]` / `id`-anchored section
     exists below the fold and is reachable by an in-page link or button.
  3. animation triggers: `[data-state]` or `[data-in-view]` attributes exist and
     at least one flips after interaction or scroll.
  4. t=0 lock: no below-the-fold `[data-in-view="true"]` before any scroll.
Exit 0 when all gates pass, 1 otherwise. Prints a JSON report.
"""

import argparse
import json
import pathlib
import subprocess
import sys
import tempfile
from typing import Any


def run_webkit_interaction_probe(html_path: pathlib.Path, vw: int, vh: int) -> dict[str, Any]:
  """Loads html_path in WebKit2GTK and drives every control, recording observable changes."""
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
  window.__interactionAuditResult = null;
  const vh = window.innerHeight;
  const sel = 'button, a[href], summary, [role="button"], [role="tab"], input[type="range"], input[type="checkbox"], input[type="radio"], select';
  function describe(el) {
    const tag = el.tagName.toLowerCase();
    const cls = (typeof el.className === 'string' && el.className.trim()) ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '';
    const label = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 28);
    return tag + (el.id ? '#' + el.id : cls) + (label ? ' ("' + label + '")' : '');
  }
  function visible(el) {
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none' && parseFloat(st.opacity || '1') > 0 && st.pointerEvents !== 'none';
  }
  function inClosedOverlay(el) {
    let p = el.parentElement;
    while (p && p !== document.body) {
      const st = getComputedStyle(p);
      if (st.pointerEvents === 'none' || parseFloat(st.opacity || '1') === 0 || st.visibility === 'hidden' || st.display === 'none') return true;
      p = p.parentElement;
    }
    return false;
  }
  function snapshotAttrs() {
    const out = [];
    document.querySelectorAll('[data-state],[data-in-view],[aria-expanded],[aria-selected],[aria-pressed],[aria-current],[open]').forEach((el) => {
      out.push([el.getAttribute('data-state'), el.getAttribute('data-in-view'), el.getAttribute('aria-expanded'), el.getAttribute('aria-selected'), el.getAttribute('aria-pressed'), el.getAttribute('aria-current'), el.hasAttribute('open')].join('|'));
    });
    return out.join(';');
  }

  // --- t=0 lock: below-the-fold in-view triggers must not be pre-fired
  const scrollPoints = Array.from(document.querySelectorAll('[data-scroll-point]'));
  const inViewEls = Array.from(document.querySelectorAll('[data-in-view]'));
  const stateEls = Array.from(document.querySelectorAll('[data-state]'));
  const prefiredBelowFold = inViewEls.filter((el) => el.getAttribute('data-in-view') === 'true' && el.getBoundingClientRect().top >= vh).map(describe);
  const belowFoldScrollPoints = scrollPoints.filter((el) => el.getBoundingClientRect().top >= vh).length;
  const anchorTargets = new Set(Array.from(document.querySelectorAll('a[href^="#"]')).map((a) => a.getAttribute('href').slice(1)).filter(Boolean));
  const reachableAnchors = Array.from(anchorTargets).filter((id) => document.getElementById(id)).length;

  const controls = Array.from(document.querySelectorAll(sel)).filter((el) => visible(el) && !inClosedOverlay(el));
  const dead = [];
  const live = [];
  let idx = 0;
  const baselineAttrs = snapshotAttrs();
  let anyTriggerFlipped = false;

  function activate(el) {
    return new Promise((resolve) => {
      const tag = el.tagName.toLowerCase();
      const href = tag === 'a' ? (el.getAttribute('href') || '') : null;
      // Radio-like groups: a control that is already the active/selected option legitimately does nothing on re-click.
      const ds = (el.getAttribute('data-state') || '').toLowerCase();
      const alreadyActive = ds === 'selected' || ds === 'active' || ds === 'checked' || el.getAttribute('aria-selected') === 'true' || el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-current') === 'true' || el.getAttribute('aria-current') === 'page' || (tag === 'input' && (el.type === 'radio' || el.type === 'checkbox') && el.checked && el.type === 'radio');
      if (alreadyActive) { resolve({ changed: true, reason: 'already_active_option' }); return; }
      if (tag === 'a' && (href === '' || href === '#')) { resolve({ changed: false, reason: 'dead_href' }); return; }
      if (tag === 'a' && href && !href.startsWith('#') && !href.startsWith('javascript')) { resolve({ changed: true, reason: 'external_link' }); return; }
      if (tag === 'a' && href && href.startsWith('#')) {
        const ok = !!document.getElementById(href.slice(1)) || href === '#top';
        resolve({ changed: ok, reason: ok ? 'anchor_target' : 'missing_anchor_target' });
        return;
      }
      const beforeHtml = document.body.innerHTML.length;
      const beforeAttrs = snapshotAttrs();
      const beforeScroll = window.scrollY;
      const beforeActive = document.activeElement;
      let mutated = false;
      const mo = new MutationObserver(() => { mutated = true; });
      mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
      try {
        if (tag === 'input' && el.type === 'range') {
          const v = Number(el.value) === Number(el.max) ? el.min : el.max;
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          setter.call(el, v);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (tag === 'select') {
          if (el.options.length > 1) { el.selectedIndex = (el.selectedIndex + 1) % el.options.length; el.dispatchEvent(new Event('change', { bubbles: true })); }
        } else {
          el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
          el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          el.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
          el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          el.click();
        }
      } catch (e) {}
      setTimeout(() => {
        mo.disconnect();
        const afterAttrs = snapshotAttrs();
        const changed = mutated || document.body.innerHTML.length !== beforeHtml || afterAttrs !== beforeAttrs || window.scrollY !== beforeScroll || document.activeElement !== beforeActive;
        if (afterAttrs !== baselineAttrs) anyTriggerFlipped = true;
        // try to restore toggled state so later controls stay reachable
        if (changed && tag !== 'a') {
          const closeBtn = Array.from(document.querySelectorAll('button[aria-label*="lose" i], button[aria-label*="dismiss" i]')).find((b) => visible(b) && !inClosedOverlay(b));
          if (closeBtn && closeBtn !== el) { try { closeBtn.click(); } catch (e) {} }
        }
        resolve({ changed, reason: changed ? 'dom_or_state_change' : 'no_observable_change' });
      }, 140);
    });
  }

  (async () => {
    for (const el of controls) {
      const d = describe(el);
      const r = await activate(el);
      (r.changed ? live : dead).push({ control: d, reason: r.reason });
      idx++;
    }
    // scroll sweep to let IntersectionObserver scroll points fire
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
    for (let i = 1; i <= 12; i++) {
      window.scrollTo(0, Math.round(maxScroll * i / 12));
      await new Promise((r) => setTimeout(r, 60));
    }
    const firedAfterScroll = Array.from(document.querySelectorAll('[data-in-view="true"]')).length;
    const activeScrollPointState = Array.from(document.querySelectorAll('[data-state="active"],[aria-current]')).length;
    window.scrollTo(0, 0);
    window.__interactionAuditResult = JSON.stringify({
      controls_total: controls.length,
      controls_live: live.length,
      controls_dead: dead.length,
      dead_controls: dead.slice(0, 12),
      scroll_points_total: scrollPoints.length,
      scroll_points_below_fold: belowFoldScrollPoints,
      anchor_targets_reachable: reachableAnchors,
      anchor_targets_total: anchorTargets.size,
      state_trigger_elements: stateEls.length,
      in_view_trigger_elements: inViewEls.length,
      in_view_fired_after_scroll: firedAfterScroll,
      active_scroll_point_state_after_scroll: activeScrollPointState,
      any_trigger_flipped_on_interaction: anyTriggerFlipped,
      prefired_below_fold_at_t0: prefiredBelowFold.slice(0, 8),
    });
  })();
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
        GLib.timeout_add(150, poll_result)
    wv.run_javascript('window.__interactionAuditResult', None, cb, None)
    return False

def start_probe():
    wv.run_javascript(SETUP_JS, None, None, None)
    GLib.timeout_add(300, poll_result)
    return False

def on_load(_view, event):
    if event == WebKit2.LoadEvent.FINISHED:
        GLib.timeout_add(400, start_probe)

wv.connect('load-changed', on_load)
GLib.timeout_add(40000, lambda: (Gtk.main_quit(), False)[1])
wv.load_uri(html_file.as_uri())
Gtk.main()
"""
  with tempfile.TemporaryDirectory(prefix="interaction_eval_") as tmp:
    tp = pathlib.Path(tmp)
    sp = tp / "probe_interaction.py"
    op = tp / "interaction.json"
    sp.write_text(helper_py, encoding="utf-8")
    subprocess.run(
        ["xvfb-run", "-a", "/usr/bin/python3", str(sp), str(html_path), str(vw), str(vh), str(op)],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if op.exists():
      return json.loads(op.read_text(encoding="utf-8"))
  return {"error": "webkit_interaction_probe_timed_out"}


def main() -> None:
  parser = argparse.ArgumentParser(description="Evaluate zero dead controls, scroll points, animation triggers, and t=0 lock.")
  parser.add_argument("--project", help="Golden Template project directory containing dist/index.html.")
  parser.add_argument("--html", help="Direct path to built HTML file.")
  parser.add_argument("--viewport-width", type=int, default=1440)
  parser.add_argument("--viewport-height", type=int, default=900)
  parser.add_argument("--require-scroll-points", action="store_true", help="Fail when no [data-scroll-point] / anchor sections exist below the fold.")
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

  m = run_webkit_interaction_probe(html_path, args.viewport_width, args.viewport_height)
  if "error" in m:
    print(json.dumps({"passed": False, **m}, indent=2))
    sys.exit(1)

  zero_dead_ok = int(m.get("controls_dead", 99)) == 0 and int(m.get("controls_total", 0)) > 0
  has_scroll_points = int(m.get("scroll_points_below_fold", 0)) > 0 or int(m.get("anchor_targets_reachable", 0)) > 0
  scroll_points_ok = has_scroll_points or not args.require_scroll_points
  triggers_present = int(m.get("state_trigger_elements", 0)) + int(m.get("in_view_trigger_elements", 0)) > 0
  triggers_fire = bool(m.get("any_trigger_flipped_on_interaction")) or int(m.get("in_view_fired_after_scroll", 0)) > 0 or int(m.get("active_scroll_point_state_after_scroll", 0)) > 0
  animation_triggers_ok = triggers_present and triggers_fire
  t0_lock_ok = len(m.get("prefired_below_fold_at_t0", [])) == 0

  reasons: list[str] = []
  if not zero_dead_ok:
    reasons.append(f"dead_controls ({m.get('controls_dead')} of {m.get('controls_total')})")
  if not scroll_points_ok:
    reasons.append("no_scroll_points_below_fold")
  if not animation_triggers_ok:
    reasons.append("animation_triggers_missing_or_never_fire (need [data-state]/[data-in-view] that flip on interaction or scroll)")
  if not t0_lock_ok:
    reasons.append("t0_lock_broken (below-the-fold data-in-view=true before any scroll)")

  report = {
      "passed": not reasons,
      "html": str(html_path),
      "gates": {
          "zero_dead_controls_ok": zero_dead_ok,
          "scroll_points_ok": scroll_points_ok,
          "animation_triggers_ok": animation_triggers_ok,
          "t0_lock_ok": t0_lock_ok,
      },
      "metrics": m,
      "reasons": reasons,
  }
  out = json.dumps(report, indent=2)
  if args.out_json:
    pathlib.Path(args.out_json).write_text(out + "\n", encoding="utf-8")
  print(out)
  sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
  main()
