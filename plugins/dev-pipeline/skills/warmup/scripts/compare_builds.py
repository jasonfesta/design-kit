#!/usr/bin/env python3
"""Warmup Headless Multi-Build Visual, DOM & Glyph-Geometry Comparator (`compare_builds.py`).

Bakes in and credits the full Google & `moodboards-borg-space` React evaluation stack:
  - `image-to-react` & `golden-template` (`eval-image-to-react`, `eval-multi-screen-project`,
    `audit-all-projects` — Jason Festa)
  - `visual-matcher` (`AutoRaterV1` 64x64 cell loss map, `s_block`, `s_edge`, `s_chroma`,
    `s_dom`, `s_total`, 50/50 `rendered_overlay.png`, `diff_mask.png`, DOM `container_deviations`
    — Google Agentic Design Loop)
  - `sds-measurement-verifier` (Button padding symmetry, container bottom clearance >= 8px,
    and multi-column equal grid card width/height/baseline/gutter verification — Search DevAI Labs)
  - `web-design-check` (Divider/border seam crowding < 16px, vertical plumbline alignment
    drift, and font/asset health — `fofr`, `go/fofr-agent-skills`)
  - `screenshot-compare` (3-panel `side_by_side.png` + multi-build `all_builds_comparison.png`
    — Aegis)

Supports both:
  1. `--run-dir <dir>`: Evaluates all trials in `<run-dir>/trials/*/project/` against
     `<run-dir>/reference-input.<ext>`.
  2. `--reference <img.png> --builds slot1=/path/to/build1,slot2=/path/to/build2 --out-dir <dir>`:
     Direct Post-Bench comparison of any existing React project folders or built HTML files.

Runs 100% inside the standard sandbox (`BypassSandbox: false`) using `xvfb-run -a`,
WebKit2GTK (`gi.repository.WebKit2`), PyCairo (`cairo`), and ImageMagick 7 (`/usr/bin/magick`).
"""

import argparse
import json
import math
import os
import shutil
import subprocess
import sys
from typing import Any

import cairo  # type: ignore

SHARED_NODE_MODULES_CANDIDATES = (
    "/usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating/node_modules",
)

DOM_PROBE_JS = r"""
(function() {
  const styleHide = document.createElement('style');
  styleHide.textContent = '#gt-inspector-host, .gt-eval-hide, [data-eval-hide="true"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }';
  (document.head || document.documentElement).appendChild(styleHide);

  window.__runGoldenDomProbe = function() {
    const vw = window.innerWidth || 1440;
    const vh = window.innerHeight || 900;
    const sw = Math.max(document.documentElement.scrollWidth || vw, document.body ? document.body.scrollWidth : vw);
    const sh = Math.max(document.documentElement.scrollHeight || vh, document.body ? document.body.scrollHeight : vh);

    const leafBoxes = [];
    const containerBoxes = [];
    const brokenMedia = [];
    const textBoxes = [];
    const buttonAudits = [];
    const gridRowAudits = [];
    const borderCrowdingAudits = [];
    const plumblineDrifts = [];
    let dejavuCount = 0;

    const all = Array.from(document.querySelectorAll('body *')).filter(
      (el) => !el.closest('#gt-inspector-host') && !el.closest('.gt-eval-hide') && !el.closest('[data-eval-hide="true"]')
    );
    const nodeMap = new Map();
    all.forEach((el, idx) => nodeMap.set(el, 'node_' + idx));

    all.forEach((el, idx) => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') === 0) return;

      const rect = el.getBoundingClientRect();
      const tag = el.tagName.toLowerCase();
      if (el instanceof SVGElement && tag !== 'svg') return;

      const cls = (el.className && typeof el.className === 'string')
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
      const sel = tag + (el.id ? '#' + el.id : (cls || '.' + idx));
      const nodeId = nodeMap.get(el);

      if ((style.fontFamily || '').toLowerCase().includes('dejavu')) {
        dejavuCount++;
      }

      const ancestorIds = [];
      let visLeft = rect.left;
      let visTop = rect.top;
      let visRight = rect.right;
      let visBottom = rect.bottom;
      let isDecorativeBg =
        el.getAttribute('aria-hidden') === 'true' ||
        el.getAttribute('data-photo-frame') === 'true' ||
        style.pointerEvents === 'none' ||
        tag === 'svg' ||
        tag === 'img';

      let p = el.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        if (nodeMap.has(p)) ancestorIds.push(nodeMap.get(p));
        const ps = window.getComputedStyle(p);
        if (p.getAttribute('aria-hidden') === 'true' || p.getAttribute('data-photo-frame') === 'true' || ps.pointerEvents === 'none') {
          isDecorativeBg = true;
        }
        const pox = ps.overflowX || 'visible';
        const poy = ps.overflowY || 'visible';
        if (pox !== 'visible' || poy !== 'visible') {
          const pr = p.getBoundingClientRect();
          if (pox !== 'visible') {
            visLeft = Math.max(visLeft, pr.left);
            visRight = Math.min(visRight, pr.right);
          }
          if (poy !== 'visible') {
            visTop = Math.max(visTop, pr.top);
            visBottom = Math.min(visBottom, pr.bottom);
          }
        }
        p = p.parentElement;
      }
      const visWidth = Math.max(0, visRight - visLeft);
      const visHeight = Math.max(0, visBottom - visTop);

      let directText = '';
      for (const child of el.childNodes) {
        if (child.nodeType === 3 && child.textContent && child.textContent.trim()) {
          directText += child.textContent.trim() + ' ';
        }
      }
      directText = directText.trim();

      const isInteractive = ['button', 'input', 'select', 'textarea', 'a'].includes(tag) || el.getAttribute('role') === 'button';
      const padTop = parseFloat(style.paddingTop || '0') || 0;
      const padRight = parseFloat(style.paddingRight || '0') || 0;
      const padBottom = parseFloat(style.paddingBottom || '0') || 0;
      const padLeft = parseFloat(style.paddingLeft || '0') || 0;

      const boxEntry = {
        node_id: nodeId,
        ancestor_ids: ancestorIds,
        tag: tag,
        selector: sel,
        bbox: [visLeft, visTop, visWidth, visHeight],
        inner_text: directText,
        padding: [padTop, padRight, padBottom, padLeft]
      };

      if (visWidth > 0 && visHeight > 0) {
        if (!isDecorativeBg && (el.children.length === 0 || directText.length > 0 || isInteractive)) {
          leafBoxes.push(boxEntry);
        }
        containerBoxes.push(boxEntry);
      }

      if (tag === 'img' && rect.width > 4 && rect.height > 4) {
        const loaded = Boolean(el.complete && el.naturalWidth > 0);
        if (!loaded) {
          brokenMedia.push({ selector: sel, src: el.getAttribute('src') || '' });
        }
      }

      const visibleText = (el.innerText || '').trim().replace(/\s+/g, ' ');
      const ox = style.overflowX || 'visible';
      if (
        el.scrollWidth > el.clientWidth + 2 &&
        el.clientWidth > 4 &&
        el.clientHeight > 4 &&
        !sel.includes('sr-only') &&
        visibleText.length > 0 &&
        style.textOverflow !== 'ellipsis' &&
        (ox === 'hidden' || ox === 'clip') &&
        directText.length > 0
      ) {
        textBoxes.push({
          selector: sel,
          text: visibleText.slice(0, 45),
          client_width: Math.round(el.clientWidth),
          scroll_width: Math.round(el.scrollWidth)
        });
      }

      // 1. SDS Measurement Verifier: Button & Pill Padding Symmetry + Bottom Clearance
      const looksLikeButton =
        tag === 'button' ||
        el.getAttribute('role') === 'button' ||
        (tag === 'a' && (padLeft >= 8 || padRight >= 8) && rect.height >= 22 && rect.height <= 64);

      const isCompactButton = looksLikeButton && rect.width >= 28 && rect.width <= 280 && rect.height >= 20 && rect.height <= 60;

      if (isCompactButton && rect.top >= 0 && rect.top < vh && rect.left >= 0 && rect.left < vw) {
        const label = (el.innerText || '').trim().replace(/\s+/g, ' ');
        const hasSvg = Boolean(el.querySelector('svg'));
        const isIconOnly = label.length === 0 && hasSvg;
        const textAlign = style.textAlign || '';
        const justifyContent = style.justifyContent || '';
        const isLeftAlignedMenuBtn = textAlign === 'left' || justifyContent.includes('between') || justifyContent.includes('start');
        const horizDiff = Math.abs(padLeft - padRight);
        const vertDiff = Math.abs(padTop - padBottom);
        const issues = [];

        const maxAllowedHorizDiff = hasSvg ? 6 : 2.5;
        if (!isIconOnly && !isLeftAlignedMenuBtn && horizDiff > maxAllowedHorizDiff) {
          issues.push('asymmetric_horizontal_padding(left=' + Math.round(padLeft) + 'px, right=' + Math.round(padRight) + 'px)');
        }
        if (!isIconOnly && !isLeftAlignedMenuBtn && (padLeft < 6 || padRight < 6) && rect.width > 56) {
          issues.push('cramped_horizontal_padding(left=' + Math.round(padLeft) + 'px, right=' + Math.round(padRight) + 'px)');
        }
        if (vertDiff > 3.5) {
          issues.push('asymmetric_vertical_padding(top=' + Math.round(padTop) + 'px, bottom=' + Math.round(padBottom) + 'px)');
        }

        const cardParent = el.closest('article, section, aside');
        if (cardParent && cardParent !== el) {
          const cRect = cardParent.getBoundingClientRect();
          const bottomClearance = cRect.bottom - rect.bottom;
          if (bottomClearance >= -2 && bottomClearance < 6 && cRect.height > rect.height + 24) {
            issues.push('insufficient_bottom_card_clearance(' + Math.round(bottomClearance) + 'px < 8px)');
          }
        }

        if (issues.length > 0) {
          buttonAudits.push({
            selector: sel,
            label: label.slice(0, 32),
            bbox: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],
            padding: [Math.round(padTop), Math.round(padRight), Math.round(padBottom), Math.round(padLeft)],
            issues: issues
          });
        }
      }

      // 2. SDS Measurement Verifier: Multi-Column Grid & Flex Card Equality
      const isGridOrFlex = style.display.includes('grid') || style.display.includes('flex');
      if (isGridOrFlex && el.children.length >= 2) {
        const children = Array.from(el.children).filter((ch) => {
          const cs = window.getComputedStyle(ch);
          const cr = ch.getBoundingClientRect();
          return cs.display !== 'none' && cs.visibility !== 'hidden' && cr.width >= 150 && cr.height >= 80;
        });

        if (children.length >= 2) {
          const rows = [];
          children.forEach((ch) => {
            const cr = ch.getBoundingClientRect();
            let row = rows.find((r) => Math.abs(r.top - cr.top) <= 14);
            if (!row) {
              row = { top: cr.top, items: [] };
              rows.push(row);
            }
            row.items.push({ el: ch, rect: cr });
          });

          rows.forEach((row) => {
            if (row.items.length < 2) return;
            row.items.sort((a, b) => a.rect.left - b.rect.left);

            const widths = row.items.map((it) => it.rect.width);
            const heights = row.items.map((it) => it.rect.height);
            const bottoms = row.items.map((it) => it.rect.bottom);
            const minW = Math.min(...widths);
            const maxW = Math.max(...widths);
            const minH = Math.min(...heights);
            const maxH = Math.max(...heights);
            const minBot = Math.min(...bottoms);
            const maxBot = Math.max(...bottoms);

            const tagsSame = row.items.every((it) => it.el.tagName === row.items[0].el.tagName);
            const isPeerCardRow = tagsSame && (maxW - minW) <= 0.18 * maxW && minW >= 150;

            if (isPeerCardRow) {
              const rowIssues = [];
              if (style.display.includes('grid') && (maxW - minW) > 3 && (maxW - minW) <= 45) {
                rowIssues.push('unequal_column_widths(min=' + Math.round(minW) + 'px, max=' + Math.round(maxW) + 'px)');
              }
              if ((maxH - minH) > 3) {
                rowIssues.push('unequal_card_heights(min=' + Math.round(minH) + 'px, max=' + Math.round(maxH) + 'px)');
              }
              if ((maxBot - minBot) > 3) {
                rowIssues.push('ragged_bottom_baselines(delta_y=' + Math.round(maxBot - minBot) + 'px)');
              }
              if (rowIssues.length > 0) {
                gridRowAudits.push({
                  container_selector: sel,
                  card_count: row.items.length,
                  row_top_px: Math.round(row.top),
                  widths_px: widths.map((w) => Math.round(w)),
                  heights_px: heights.map((h) => Math.round(h)),
                  bottoms_px: bottoms.map((b) => Math.round(b)),
                  issues: rowIssues
                });
              }
            }
          });
        }
      }

      // 3. web-design-check Gate 1 & Gate 3: Border Crowding & Plumbline Drift on Headings
      if (['h1', 'h2', 'h3'].includes(tag) && rect.width > 20 && rect.height > 10) {
        const parent = el.parentElement;
        if (parent) {
          const ps = window.getComputedStyle(parent);
          const bt = parseFloat(ps.borderTopWidth || '0') || 0;
          const pRect = parent.getBoundingClientRect();
          if (bt >= 1 && (rect.top - pRect.top) < 12) {
            borderCrowdingAudits.push({
              selector: sel,
              top_gap_px: Math.round(rect.top - pRect.top),
              issue: 'heading_collides_with_top_border(gap=' + Math.round(rect.top - pRect.top) + 'px < 12px)'
            });
          }
          const next = el.nextElementSibling;
          if (next && ['p', 'div', 'ul', 'ol'].includes(next.tagName.toLowerCase())) {
            const ns = window.getComputedStyle(next);
            if (style.textAlign !== 'center' && ns.textAlign !== 'center') {
              const nRect = next.getBoundingClientRect();
              const dLeft = Math.abs(rect.left - nRect.left);
              if (dLeft >= 6 && dLeft <= 48) {
                plumblineDrifts.push({
                  heading: sel,
                  follower: next.tagName.toLowerCase(),
                  delta_left_px: Math.round(dLeft)
                });
              }
            }
          }
        }
      }
    });

    const svgIds = new Set(containerBoxes.filter((b) => b.tag === 'svg').map((b) => b.node_id));
    const nonSvgLeaves = leafBoxes.filter((b) => !b.ancestor_ids.some((id) => svgIds.has(id)));
    const collidingPairs = [];
    for (let i = 0; i < nonSvgLeaves.length; i++) {
      const a = nonSvgLeaves[i];
      const [ax, ay, aw, ah] = a.bbox;
      const areaA = aw * ah;
      if (areaA <= 0) continue;
      const ancA = new Set(a.ancestor_ids);
      for (let j = i + 1; j < nonSvgLeaves.length; j++) {
        const b = nonSvgLeaves[j];
        if (a.node_id === b.node_id || ancA.has(b.node_id) || b.ancestor_ids.includes(a.node_id)) continue;
        const [bx, by, bw, bh] = b.bbox;
        const areaB = bw * bh;
        if (areaB <= 0) continue;
        const dx = Math.min(ax + aw, bx + bw) - Math.max(ax, bx);
        const dy = Math.min(ay + ah, by + bh) - Math.max(ay, by);
        if (dx <= 5 || dy <= 5) continue;
        const interArea = dx * dy;
        if (interArea <= 60) continue;
        const minArea = Math.min(areaA, areaB);
        const maxArea = Math.max(areaA, areaB);
        if (minArea <= 1600 && maxArea >= 4 * minArea) continue;
        collidingPairs.push({
          element_a: a.selector,
          element_b: b.selector,
          text_a: (a.inner_text || '').slice(0, 32),
          text_b: (b.inner_text || '').slice(0, 32),
          overlap_area: Math.round(interArea),
          bbox_a: a.bbox.map((v) => Math.round(v)),
          bbox_b: b.bbox.map((v) => Math.round(v))
        });
      }
    }

    const payload = {
      viewport: { inner_width: vw, inner_height: vh, scroll_width: sw, scroll_height: sh },
      horizontal_overflow_px: Math.max(0, Math.round(sw - vw)),
      collision_count: collidingPairs.length,
      colliding_pairs: collidingPairs.slice(0, 15),
      clipped_text_count: textBoxes.length,
      clipped_text: textBoxes.slice(0, 15),
      broken_media_count: brokenMedia.length,
      broken_media: brokenMedia.slice(0, 10),
      button_padding_violations: buttonAudits.length,
      button_audits: buttonAudits.slice(0, 15),
      grid_equality_violations: gridRowAudits.length,
      grid_row_audits: gridRowAudits.slice(0, 15),
      border_crowding_count: borderCrowdingAudits.length,
      border_crowding_audits: borderCrowdingAudits.slice(0, 10),
      plumbline_drift_count: plumblineDrifts.length,
      plumbline_drifts: plumblineDrifts.slice(0, 10),
      dejavu_fallback_count: dejavuCount,
      container_boxes: containerBoxes,
      leaf_boxes: leafBoxes,
      page_errors: []
    };
    document.title = '__DOM_SNAP__:' + JSON.stringify(payload);
    return payload;
  };
})();
"""

WEBKIT_RENDER_HELPER = r"""
import json
import os
import sys
import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib

html_path = sys.argv[1]
rendered_path = sys.argv[2]
dom_json_path = sys.argv[3]
w = int(sys.argv[4])
h = int(sys.argv[5])
url_query = sys.argv[6] if len(sys.argv) > 6 else ""

win = Gtk.OffscreenWindow()
win.set_default_size(w, h)
wv = WebKit2.WebView()
wv.set_size_request(w, h)
settings = wv.get_settings()
settings.set_enable_write_console_messages_to_stdout(False)
settings.set_allow_file_access_from_file_urls(True)
settings.set_allow_universal_access_from_file_urls(True)
win.add(wv)
win.show_all()

dom_snapshot = {}

def on_snapshot(webview, res):
    surf = webview.get_snapshot_finish(res)
    surf.write_to_png(rendered_path)
    Gtk.main_quit()

def capture_shot():
    title = wv.get_title() or ""
    if title.startswith("__DOM_SNAP__:"):
        try:
            global dom_snapshot
            dom_snapshot = json.loads(title[len("__DOM_SNAP__:"):])
        except Exception:
            pass
    wv.get_snapshot(WebKit2.SnapshotRegion.VISIBLE, WebKit2.SnapshotOptions.NONE, None, on_snapshot)
    return False

def trigger_probe():
    wv.run_javascript("window.__runGoldenDomProbe && window.__runGoldenDomProbe();", None, None, None)
    GLib.timeout_add(300, capture_shot)
    return False

def on_load(webview, event):
    if event == WebKit2.LoadEvent.FINISHED:
        GLib.timeout_add(700, trigger_probe)

wv.connect("load-changed", on_load)
uri = "file://" + os.path.abspath(html_path) + (url_query if url_query else "")
wv.load_uri(uri)
GLib.timeout_add(12000, Gtk.main_quit)
Gtk.main()

if not dom_snapshot:
    dom_snapshot = {
        "viewport": {"inner_width": w, "inner_height": h, "scroll_width": w, "scroll_height": h},
        "horizontal_overflow_px": 0,
        "collision_count": 0,
        "colliding_pairs": [],
        "clipped_text_count": 0,
        "clipped_text": [],
        "broken_media_count": 0,
        "broken_media": [],
        "button_padding_violations": 0,
        "button_audits": [],
        "grid_equality_violations": 0,
        "grid_row_audits": [],
        "border_crowding_count": 0,
        "border_crowding_audits": [],
        "plumbline_drift_count": 0,
        "plumbline_drifts": [],
        "dejavu_fallback_count": 0,
        "container_boxes": [],
        "leaf_boxes": [],
        "page_errors": [],
    }

with open(dom_json_path, "w", encoding="utf-8") as f:
    json.dump(dom_snapshot, f, indent=2)
"""


def ensure_project_built(project_dir: str, skip_build: bool = False) -> str:
  """Ensures a Golden Template React folder is built or locates its entry HTML."""
  if os.path.isfile(project_dir) and project_dir.endswith(".html"):
    return os.path.abspath(project_dir)

  dist_html = os.path.join(project_dir, "dist", "index.html")
  root_html = os.path.join(project_dir, "index.html")
  pkg_json = os.path.join(project_dir, "package.json")

  if skip_build and os.path.exists(dist_html):
    return dist_html

  npm_bin = "/usr/local/google/home/jfesta/.local/bin/npm"
  if not os.path.exists(npm_bin):
    npm_bin = shutil.which("npm") or ""

  if os.path.exists(pkg_json) and npm_bin:
    node_modules = os.path.join(project_dir, "node_modules")
    if not os.path.exists(node_modules):
      for cand in SHARED_NODE_MODULES_CANDIDATES:
        if os.path.exists(cand):
          try:
            os.symlink(cand, node_modules)
          except OSError:
            pass
          break
    if os.path.exists(node_modules):
      env = dict(os.environ)
      env["PATH"] = f"/usr/local/google/home/jfesta/.local/bin:{env.get('PATH', '')}"
      try:
        subprocess.run(
            [npm_bin, "run", "build"],
            cwd=project_dir,
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=45,
            check=True,
        )
      except Exception:
        pass

  if os.path.exists(dist_html):
    return dist_html
  if os.path.exists(root_html):
    return root_html
  raise FileNotFoundError(f"No dist/index.html or index.html found in {project_dir}")


def get_image_dimensions(image_path: str) -> tuple[int, int]:
  out = subprocess.check_output(
      ["/usr/bin/magick", "identify", "-format", "%w %h", image_path],
      text=True,
      stderr=subprocess.DEVNULL,
  ).strip().split()
  return int(out[0]), int(out[1])


def evaluate_single_build(
    slot_slug: str,
    slot_label: str,
    project_path: str,
    ref_path: str,
    eval_dir: str,
    target_score: float = 0.85,
    skip_build: bool = False,
) -> dict[str, Any]:
  """Renders a React build at exact WxH, runs DOM/craft probes, and computes AutoRaterV1 scores."""
  os.makedirs(eval_dir, exist_ok=True)
  w, h = get_image_dimensions(ref_path)
  # Cap headless viewport height at 3200px while preserving aspect ratio
  eval_w, eval_h = w, h
  if eval_w > 1920 and eval_w > eval_h * 1.5:
    # Multi-column 4K sheet: evaluate at 1440px normalized width
    scale = 1440.0 / eval_w
    eval_w = 1440
    eval_h = max(800, int(round(eval_h * scale)))

  ref_norm_path = os.path.join(eval_dir, "mockup.png")
  subprocess.check_call([
      "/usr/bin/magick",
      ref_path,
      "-resize",
      f"{eval_w}x{eval_h}!",
      "-colorspace",
      "sRGB",
      ref_norm_path,
  ])

  html_path = ensure_project_built(project_path, skip_build=skip_build)
  with open(html_path, "r", encoding="utf-8", errors="replace") as f:
    orig_html = f.read()

  injected_html = (
      orig_html.replace("</head>", f"<script>{DOM_PROBE_JS}</script></head>")
      if "</head>" in orig_html
      else f"<script>{DOM_PROBE_JS}</script>{orig_html}"
  )
  tmp_html_path = os.path.join(os.path.dirname(html_path), f".warmup_probe_{slot_slug}_{os.getpid()}.html")
  with open(tmp_html_path, "w", encoding="utf-8") as f:
    f.write(injected_html)

  rendered_path = os.path.join(eval_dir, "rendered.png")
  dom_json_path = os.path.join(eval_dir, "dom_snapshot.json")

  try:
    subprocess.run(
        [
            "xvfb-run",
            "-a",
            "python3",
            "-c",
            WEBKIT_RENDER_HELPER,
            tmp_html_path,
            rendered_path,
            dom_json_path,
            str(eval_w),
            str(eval_h),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        timeout=30,
        check=False,
    )
  finally:
    try:
      os.unlink(tmp_html_path)
    except OSError:
      pass

  if not os.path.exists(rendered_path):
    # Fallback blank canvas if headless render did not write PNG
    subprocess.check_call([
        "/usr/bin/magick",
        "-size",
        f"{eval_w}x{eval_h}",
        "xc:#FAF6F0",
        rendered_path,
    ])

  dom_snapshot: dict[str, Any] = {}
  if os.path.exists(dom_json_path):
    try:
      with open(dom_json_path, "r", encoding="utf-8") as f:
        dom_snapshot = json.load(f)
    except Exception:
      dom_snapshot = {}

  # Generate 50/50 rendered_overlay.png
  overlay_path = os.path.join(eval_dir, "rendered_overlay.png")
  subprocess.check_call([
      "/usr/bin/magick",
      ref_norm_path,
      "(",
      rendered_path,
      "-resize",
      f"{eval_w}x{eval_h}!",
      ")",
      "-compose",
      "blend",
      "-define",
      "compose:args=50,50",
      "-composite",
      overlay_path,
  ])

  # Compute 64x64 cell loss map + Zone A / B / C breakdown
  ref_raw = subprocess.check_output(
      ["/usr/bin/magick", ref_norm_path, "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
      stderr=subprocess.DEVNULL,
  )
  cand_raw = subprocess.check_output(
      ["/usr/bin/magick", rendered_path, "-resize", f"{eval_w}x{eval_h}!", "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
      stderr=subprocess.DEVNULL,
  )

  cell = 64
  rows = (eval_h + cell - 1) // cell
  cols = (eval_w + cell - 1) // cell
  cell_loss_map = [[0.0] * cols for _ in range(rows)]

  block_sims: list[float] = []
  edge_sims: list[float] = []
  color_sims: list[float] = []
  zone_scores: dict[str, list[float]] = {"zone_a_top": [], "zone_b_middle": [], "zone_c_bottom": []}
  error_cells: list[dict[str, Any]] = []

  for r in range(rows):
    y0, y1 = r * cell, min(eval_h, (r + 1) * cell)
    y_Ratio = ((y0 + y1) * 0.5) / max(1.0, float(eval_h))
    zone_key = "zone_a_top" if y_Ratio <= 0.25 else ("zone_b_middle" if y_Ratio <= 0.75 else "zone_c_bottom")
    for c in range(cols):
      x0, x1 = c * cell, min(eval_w, (c + 1) * cell)
      n_px = 0
      sum_r_ref = sum_g_ref = sum_b_ref = 0.0
      sum_r_cand = sum_g_cand = sum_b_cand = 0.0
      sum_l1 = 0.0
      sum_edge_ref = 0.0
      sum_edge_cand = 0.0

      for y in range(y0, y1, 2):
        row_off = y * eval_w * 3
        next_y = min(eval_h - 1, y + 1)
        next_row_off = next_y * eval_w * 3
        for x in range(x0, x1, 2):
          idx = row_off + x * 3
          nx_idx = row_off + min(eval_w - 1, x + 1) * 3
          ny_idx = next_row_off + x * 3

          rr, rg, rb = ref_raw[idx], ref_raw[idx + 1], ref_raw[idx + 2]
          cr_v, cg_v, cb_v = cand_raw[idx], cand_raw[idx + 1], cand_raw[idx + 2]

          sum_r_ref += rr
          sum_g_ref += rg
          sum_b_ref += rb
          sum_r_cand += cr_v
          sum_g_cand += cg_v
          sum_b_cand += cb_v
          sum_l1 += (abs(rr - cr_v) + abs(rg - cg_v) + abs(rb - cb_v)) / 3.0

          r_gx = abs(rr - ref_raw[nx_idx]) + abs(rg - ref_raw[nx_idx + 1])
          r_gy = abs(rr - ref_raw[ny_idx]) + abs(rg - ref_raw[ny_idx + 1])
          c_gx = abs(cr_v - cand_raw[nx_idx]) + abs(cg_v - cand_raw[nx_idx + 1])
          c_gy = abs(cr_v - cand_raw[ny_idx]) + abs(cg_v - cand_raw[ny_idx + 1])
          sum_edge_ref += (r_gx + r_gy) * 0.25
          sum_edge_cand += (c_gx + c_gy) * 0.25
          n_px += 1

      n_px = max(1, n_px)
      mr_ref, mg_ref, mb_ref = sum_r_ref / n_px, sum_g_ref / n_px, sum_b_ref / n_px
      mr_cand, mg_cand, mb_cand = sum_r_cand / n_px, sum_g_cand / n_px, sum_b_cand / n_px

      mean_diff = math.sqrt((mr_ref - mr_cand) ** 2 + (mg_ref - mg_cand) ** 2 + (mb_ref - mb_cand) ** 2) / 441.67
      color_sim = max(0.0, 1.0 - mean_diff * 1.6)
      color_sims.append(color_sim)

      l1_norm = (sum_l1 / n_px) / 255.0
      block_sim = max(0.0, 1.0 - l1_norm * 1.8)
      block_sims.append(block_sim)

      re_mean = sum_edge_ref / n_px
      ce_mean = sum_edge_cand / n_px
      edge_diff = abs(re_mean - ce_mean) / max(18.0, re_mean + ce_mean + 1e-5)
      edge_sim = max(0.0, 1.0 - edge_diff)
      edge_sims.append(edge_sim)

      cell_sim = 0.45 * block_sim + 0.30 * edge_sim + 0.25 * color_sim
      zone_scores[zone_key].append(cell_sim)
      loss = 1.0 - cell_sim
      cell_loss_map[r][c] = loss
      if loss > 0.16:
        mode = "color_or_polarity_drift" if color_sim < block_sim else "structural_or_spacing_shift"
        error_cells.append({
            "bbox": [x0, y0, x1 - x0, y1 - y0],
            "zone": zone_key,
            "loss_score": round(float(loss), 4),
            "dominant_failure_mode": mode,
        })

  error_cells.sort(key=lambda item: -item["loss_score"])

  # Localize top failing cells to React DOM selectors
  dom_boxes = (dom_snapshot.get("container_boxes") or []) + (dom_snapshot.get("leaf_boxes") or [])
  container_deviations = []
  seen_selectors = set()
  for cell_item in error_cells:
    if len(container_deviations) >= 6:
      break
    cx, cy, cw, ch = cell_item["bbox"]
    c_area = max(1.0, float(cw * ch))
    best_sel = ""
    best_bbox = [cx, cy, cw, ch]
    best_score = 0.0
    for db in dom_boxes:
      d_bbox = db.get("bbox")
      if not isinstance(d_bbox, list) or len(d_bbox) != 4:
        continue
      bx, by, bw, bh = [float(v) for v in d_bbox]
      b_area = bw * bh
      if b_area <= 0 or b_area > 0.90 * eval_w * eval_h:
        continue
      ix = max(0.0, min(cx + cw, bx + bw) - max(cx, bx))
      iy = max(0.0, min(cy + ch, by + bh) - max(cy, by))
      inter = ix * iy
      if inter <= 0:
        continue
      overlap = inter / max(1.0, min(c_area, b_area))
      specificity = 1.0 / (1.0 + 0.0005 * math.sqrt(b_area))
      score = overlap * specificity
      sel_str = str(db.get("selector") or "").strip()
      if not sel_str:
        continue
      if sel_str not in seen_selectors:
        score *= 1.35
      if score > best_score:
        best_score = score
        best_sel = sel_str
        best_bbox = [int(round(bx)), int(round(by)), int(round(bw)), int(round(bh))]
    if best_sel and best_sel not in seen_selectors:
      seen_selectors.add(best_sel)
      container_deviations.append({
          "selector": best_sel,
          "bbox": best_bbox,
          "zone": cell_item["zone"],
          "loss_score": cell_item["loss_score"],
          "dominant_failure_mode": cell_item["dominant_failure_mode"],
      })

  # Render diff_mask.png and side_by_side.png
  diff_surf = cairo.ImageSurface.create_from_png(rendered_path)
  ctx = cairo.Context(diff_surf)
  for r in range(rows):
    for c in range(cols):
      loss = cell_loss_map[r][c]
      if loss <= 0.15:
        continue
      y0, y1 = r * cell, min(eval_h, (r + 1) * cell)
      x0, x1 = c * cell, min(eval_w, (c + 1) * cell)
      alpha = min(0.55, 0.70 * loss)
      if loss > 0.32:
        ctx.set_source_rgba(0.94, 0.27, 0.27, alpha)
      else:
        ctx.set_source_rgba(0.96, 0.62, 0.04, alpha)
      ctx.rectangle(x0, y0, x1 - x0, y1 - y0)
      ctx.fill()

  ctx.set_source_rgba(0.86, 0.15, 0.15, 0.95)
  ctx.set_line_width(2.0)
  for dev in container_deviations:
    bx, by, bw, bh = dev["bbox"]
    ctx.rectangle(bx, by, bw, bh)
    ctx.stroke()

  diff_mask_path = os.path.join(eval_dir, "diff_mask.png")
  diff_surf.write_to_png(diff_mask_path)

  header_h = 34
  gap = 12
  sbs_w = eval_w * 3 + gap * 2
  sbs_h = eval_h + header_h
  sbs_surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, sbs_w, sbs_h)
  sctx = cairo.Context(sbs_surf)
  sctx.set_source_rgb(0.09, 0.09, 0.11)
  sctx.paint()

  ref_surf = cairo.ImageSurface.create_from_png(ref_norm_path)
  cand_surf = cairo.ImageSurface.create_from_png(rendered_path)

  sctx.select_font_face("sans-serif", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
  sctx.set_font_size(13)

  sctx.set_source_rgb(0.18, 0.18, 0.20)
  sctx.rectangle(0, 0, eval_w, header_h)
  sctx.fill()
  sctx.set_source_rgb(0.98, 0.98, 0.98)
  sctx.move_to(12, 22)
  sctx.show_text(f"1. REFERENCE COMP ({eval_w}x{eval_h})")
  sctx.set_source_surface(ref_surf, 0, header_h)
  sctx.paint()

  sctx.set_source_rgb(0.09, 0.40, 0.20)
  sctx.rectangle(eval_w + gap, 0, eval_w, header_h)
  sctx.fill()
  sctx.set_source_rgb(0.98, 0.98, 0.98)
  sctx.move_to(eval_w + gap + 12, 22)
  sctx.show_text(f"2. {slot_label.upper()} REACT BUILD (rendered.png)")
  sctx.set_source_surface(cand_surf, eval_w + gap, header_h)
  sctx.paint()

  sctx.set_source_rgb(0.60, 0.11, 0.11)
  sctx.rectangle((eval_w + gap) * 2, 0, eval_w, header_h)
  sctx.fill()
  sctx.set_source_rgb(0.98, 0.98, 0.98)
  sctx.move_to((eval_w + gap) * 2 + 12, 22)
  sctx.show_text("3. AUTORATERV1 64x64 DIFF HEATMAP (diff_mask.png)")
  sctx.set_source_surface(diff_surf, (eval_w + gap) * 2, header_h)
  sctx.paint()

  side_by_side_path = os.path.join(eval_dir, "side_by_side.png")
  sbs_surf.write_to_png(side_by_side_path)

  s_block = sum(block_sims) / max(1, len(block_sims))
  s_edge = sum(edge_sims) / max(1, len(edge_sims))
  s_chroma = sum(color_sims) / max(1, len(color_sims))

  collisions = int(dom_snapshot.get("collision_count") or 0)
  overflow_px = int(dom_snapshot.get("horizontal_overflow_px") or 0)
  clipped_cnt = int(dom_snapshot.get("clipped_text_count") or 0)
  broken_cnt = int(dom_snapshot.get("broken_media_count") or 0)
  btn_violations = int(dom_snapshot.get("button_padding_violations") or 0)
  grid_violations = int(dom_snapshot.get("grid_equality_violations") or 0)
  border_crowding = int(dom_snapshot.get("border_crowding_count") or 0)
  plumbline_drifts = int(dom_snapshot.get("plumbline_drift_count") or 0)
  dejavu_cnt = int(dom_snapshot.get("dejavu_fallback_count") or 0)

  s_dom = 1.0
  s_dom -= min(0.45, 0.15 * collisions)
  if overflow_px > 0:
    s_dom -= 0.25
  s_dom -= min(0.20, 0.05 * clipped_cnt)
  s_dom -= min(0.20, 0.08 * broken_cnt)
  s_dom -= min(0.20, 0.04 * btn_violations)
  s_dom -= min(0.25, 0.08 * grid_violations)
  s_dom -= min(0.10, 0.03 * border_crowding)
  s_dom -= min(0.10, 0.03 * plumbline_drifts)
  s_dom = max(0.0, s_dom)

  s_total = round(0.35 * s_block + 0.25 * s_edge + 0.20 * s_chroma + 0.20 * s_dom, 4)
  passed = (
      s_total >= target_score
      and collisions == 0
      and overflow_px == 0
      and btn_violations == 0
      and grid_violations == 0
  )

  zone_summary = {
      "zone_a_top_0_25": round(sum(zone_scores["zone_a_top"]) / max(1, len(zone_scores["zone_a_top"])), 4),
      "zone_b_middle_25_75": round(sum(zone_scores["zone_b_middle"]) / max(1, len(zone_scores["zone_b_middle"])), 4),
      "zone_c_bottom_75_100": round(sum(zone_scores["zone_c_bottom"]) / max(1, len(zone_scores["zone_c_bottom"])), 4),
  }

  audit = {
      "slot": slot_slug,
      "label": slot_label,
      "project_path": project_path,
      "html_path": html_path,
      "status": "PASSED" if passed else ("NEEDS_REFINEMENT" if s_total >= 0.65 else "FAILED"),
      "passed": passed,
      "target_score": target_score,
      "s_total": s_total,
      "sub_scores": {
          "s_block_structure": round(s_block, 4),
          "s_edge_alignment": round(s_edge, 4),
          "s_chromatic_fidelity": round(s_chroma, 4),
          "s_dom_craft_health": round(s_dom, 4),
      },
      "zone_scores": zone_summary,
      "dom_integrity": {
          "collision_count": collisions,
          "colliding_pairs": dom_snapshot.get("colliding_pairs") or [],
          "horizontal_overflow_px": overflow_px,
          "clipped_text_count": clipped_cnt,
          "clipped_text": dom_snapshot.get("clipped_text") or [],
          "broken_media_count": broken_cnt,
          "broken_media": dom_snapshot.get("broken_media") or [],
      },
      "craft_and_micro_layout": {
          "button_padding_violations": btn_violations,
          "button_audits": dom_snapshot.get("button_audits") or [],
          "grid_equality_violations": grid_violations,
          "grid_row_audits": dom_snapshot.get("grid_row_audits") or [],
          "border_crowding_count": border_crowding,
          "border_crowding_audits": dom_snapshot.get("border_crowding_audits") or [],
          "plumbline_drift_count": plumbline_drifts,
          "plumbline_drifts": dom_snapshot.get("plumbline_drifts") or [],
          "dejavu_fallback_count": dejavu_cnt,
      },
      "container_deviations": container_deviations,
      "artifacts": {
          "mockup_png": ref_norm_path,
          "rendered_png": rendered_path,
          "rendered_overlay_png": overlay_path,
          "diff_mask_png": diff_mask_path,
          "side_by_side_png": side_by_side_path,
          "dom_snapshot_json": dom_json_path,
      },
  }

  audit_path = os.path.join(eval_dir, "visual_match_audit.json")
  with open(audit_path, "w", encoding="utf-8") as f:
    json.dump(audit, f, indent=2)
  return audit


def compute_pairwise_and_board(
    ref_norm_path: str,
    build_audits: list[dict[str, Any]],
    out_dir: str,
) -> dict[str, Any]:
  """Computes pairwise build-vs-build divergence and renders all_builds_comparison.png."""
  if not build_audits:
    return {"pairwise": [], "board_png": ""}

  w, h = get_image_dimensions(ref_norm_path)
  raw_by_slot: dict[str, bytes] = {}
  for aud in build_audits:
    r_png = aud["artifacts"]["rendered_png"]
    raw_by_slot[aud["slot"]] = subprocess.check_output(
        ["/usr/bin/magick", r_png, "-resize", f"{w}x{h}!", "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
        stderr=subprocess.DEVNULL,
    )

  pairwise: list[dict[str, Any]] = []
  n_builds = len(build_audits)
  stride = 4
  for i in range(n_builds):
    for j in range(i + 1, n_builds):
      a = build_audits[i]
      b = build_audits[j]
      raw_a = raw_by_slot[a["slot"]]
      raw_b = raw_by_slot[b["slot"]]
      sum_l1 = 0.0
      samples = 0
      for idx in range(0, len(raw_a) - 3, 3 * stride):
        sum_l1 += (
            abs(raw_a[idx] - raw_b[idx])
            + abs(raw_a[idx + 1] - raw_b[idx + 1])
            + abs(raw_a[idx + 2] - raw_b[idx + 2])
        ) / 3.0
        samples += 1
      mean_l1_pct = round((sum_l1 / max(1, samples)) / 255.0 * 100.0, 2)
      pixel_similarity = round(max(0.0, 1.0 - (mean_l1_pct / 100.0) * 1.6), 4)
      s_total_delta = round(a["s_total"] - b["s_total"], 4)
      closer_label = a["label"] if s_total_delta >= 0 else b["label"]
      za_win = a["label"] if a["zone_scores"]["zone_a_top_0_25"] >= b["zone_scores"]["zone_a_top_0_25"] else b["label"]
      zb_win = a["label"] if a["zone_scores"]["zone_b_middle_25_75"] >= b["zone_scores"]["zone_b_middle_25_75"] else b["label"]
      zc_win = a["label"] if a["zone_scores"]["zone_c_bottom_75_100"] >= b["zone_scores"]["zone_c_bottom_75_100"] else b["label"]
      pairwise.append({
          "build_a": a["label"],
          "slot_a": a["slot"],
          "build_b": b["label"],
          "slot_b": b["slot"],
          "closer_to_reference": closer_label,
          "pixel_similarity": pixel_similarity,
          "inter_build_visual_divergence": round(1.0 - pixel_similarity, 4),
          "mean_rgb_divergence_pct": mean_l1_pct,
          "s_total_delta": s_total_delta,
          "zone_winners": {
              "zone_a_top": za_win,
              "zone_b_mid": zb_win,
              "zone_c_bot": zc_win,
          },
          "zone_a_delta": round(a["zone_scores"]["zone_a_top_0_25"] - b["zone_scores"]["zone_a_top_0_25"], 4),
          "zone_b_delta": round(a["zone_scores"]["zone_b_middle_25_75"] - b["zone_scores"]["zone_b_middle_25_75"], 4),
          "zone_c_delta": round(a["zone_scores"]["zone_c_bottom_75_100"] - b["zone_scores"]["zone_c_bottom_75_100"], 4),
          "dom_craft_delta": round(a["sub_scores"]["s_dom_craft_health"] - b["sub_scores"]["s_dom_craft_health"], 4),
      })

  # Render all_builds_comparison.png (Reference + each build rendered + diff heatmap row)
  thumb_w = 360
  thumb_h = max(220, int(round(thumb_w * (h / max(1.0, float(w))))))
  cols = 1 + n_builds
  gap = 14
  header_h = 44
  board_w = cols * thumb_w + (cols + 1) * gap
  board_h = 2 * (thumb_h + header_h) + 3 * gap

  board_surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, board_w, board_h)
  bctx = cairo.Context(board_surf)
  bctx.set_source_rgb(0.08, 0.08, 0.10)
  bctx.paint()

  bctx.select_font_face("sans-serif", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
  bctx.set_font_size(13)

  def draw_thumb(png_path: str, x: int, y: int, title: str, subtitle: str, badge_rgb: tuple[float, float, float]) -> None:
    bctx.set_source_rgb(*badge_rgb)
    bctx.rectangle(x, y, thumb_w, header_h)
    bctx.fill()
    bctx.set_source_rgb(0.98, 0.98, 0.98)
    bctx.set_font_size(12)
    bctx.move_to(x + 10, y + 18)
    bctx.show_text(title[:38])
    bctx.set_font_size(11)
    bctx.set_source_rgb(0.86, 0.88, 0.92)
    bctx.move_to(x + 10, y + 35)
    bctx.show_text(subtitle[:44])

    tmp_thumb = os.path.join(out_dir, f".tmp_thumb_{os.getpid()}.png")
    subprocess.check_call([
        "/usr/bin/magick",
        png_path,
        "-resize",
        f"{thumb_w}x{thumb_h}!",
        tmp_thumb,
    ])
    tsurf = cairo.ImageSurface.create_from_png(tmp_thumb)
    bctx.set_source_surface(tsurf, x, y + header_h)
    bctx.paint()
    try:
      os.unlink(tmp_thumb)
    except OSError:
      pass

  # Column 0: Reference Image (Top) & Reference Info (Bottom)
  draw_thumb(
      ref_norm_path,
      gap,
      gap,
      "0. SOURCE REFERENCE IMAGE",
      f"Ground-Truth Comp ({w}x{h})",
      (0.20, 0.22, 0.28),
  )
  draw_thumb(
      ref_norm_path,
      gap,
      gap * 2 + thumb_h + header_h,
      "0. SOURCE BASELINE (0% LOSS)",
      "Zero-Drift Target Baseline",
      (0.16, 0.18, 0.22),
  )

  # Columns 1..N: Each Build Rendered (Row 1) and Diff Heatmap (Row 2)
  for idx, aud in enumerate(build_audits):
    col_x = gap + (idx + 1) * (thumb_w + gap)
    s_tot = aud["s_total"]
    dom_v = (
        aud["dom_integrity"]["collision_count"]
        + aud["craft_and_micro_layout"]["button_padding_violations"]
        + aud["craft_and_micro_layout"]["grid_equality_violations"]
    )
    top_color = (0.09, 0.42, 0.22) if s_tot >= 0.85 and dom_v == 0 else (0.58, 0.34, 0.06)
    draw_thumb(
        aud["artifacts"]["rendered_png"],
        col_x,
        gap,
        f"{idx + 1}. {aud['label'].upper()} BUILD",
        f"s_total={s_tot:.3f} | block={aud['sub_scores']['s_block_structure']:.2f} | dom_v={dom_v}",
        top_color,
    )
    draw_thumb(
        aud["artifacts"]["diff_mask_png"],
        col_x,
        gap * 2 + thumb_h + header_h,
        f"{idx + 1}. {aud['label'].upper()} DIFF HEATMAP",
        f"edge={aud['sub_scores']['s_edge_alignment']:.2f} | chroma={aud['sub_scores']['s_chromatic_fidelity']:.2f}",
        (0.52, 0.12, 0.14),
    )

  board_path = os.path.join(out_dir, "all_builds_comparison.png")
  board_surf.write_to_png(board_path)

  ranked = sorted(build_audits, key=lambda x: -x["s_total"])
  zone_winners = {
      "zone_a_top_winner": max(build_audits, key=lambda x: x["zone_scores"]["zone_a_top_0_25"])["slot"],
      "zone_b_middle_winner": max(build_audits, key=lambda x: x["zone_scores"]["zone_b_middle_25_75"])["slot"],
      "zone_c_bottom_winner": max(build_audits, key=lambda x: x["zone_scores"]["zone_c_bottom_75_100"])["slot"],
      "dom_craft_winner": max(build_audits, key=lambda x: x["sub_scores"]["s_dom_craft_health"])["slot"],
  }

  matrix_payload = {
      "reference_image": ref_norm_path,
      "evaluated_dimensions": [w, h],
      "build_count": n_builds,
      "overall_visual_winner": ranked[0]["slot"] if ranked else "",
      "zone_winners": zone_winners,
      "builds": build_audits,
      "pairwise_comparisons": pairwise,
      "all_builds_comparison_png": board_path,
  }
  matrix_path = os.path.join(out_dir, "pairwise_build_matrix.json")
  with open(matrix_path, "w", encoding="utf-8") as f:
    json.dump(matrix_payload, f, indent=2)
  return matrix_payload


def main() -> int:
  parser = argparse.ArgumentParser(description="Warmup Headless Multi-Build Visual & DOM Comparator")
  parser.add_argument("--run-dir", default="", help="Warmup run directory containing warmup-run.json")
  parser.add_argument("--reference", default="", help="Reference image path for direct Post-Bench build comparison")
  parser.add_argument(
      "--builds",
      default="",
      help="Comma-separated slot=/path/to/project pairs for direct Post-Bench comparison",
  )
  parser.add_argument("--out-dir", default="", help="Output directory when running with --builds")
  parser.add_argument("--target-score", type=float, default=0.85, help="Target AutoRaterV1 s_total threshold")
  parser.add_argument("--skip-build", action="store_true", help="Skip npm run build if dist/index.html exists")
  args = parser.parse_args()

  build_targets: list[dict[str, str]] = []
  ref_image = ""
  out_dir = ""

  if args.run_dir:
    run_dir = os.path.abspath(args.run_dir)
    manifest_path = os.path.join(run_dir, "run.json")
    if not os.path.exists(manifest_path):
      manifest_path = os.path.join(run_dir, "warmup-run.json")
    if not os.path.exists(manifest_path):
      print(json.dumps({"error": f"run.json not found in {run_dir}"}), file=sys.stderr)
      return 1
    with open(manifest_path, "r", encoding="utf-8") as f:
      manifest = json.load(f)
    if "image" in manifest and isinstance(manifest["image"], dict) and "path" in manifest["image"]:
      ref_image = manifest["image"]["path"]
    else:
      ref_image = os.path.join(run_dir, manifest.get("copiedImage", "mockup.png"))
    out_dir = os.path.join(run_dir, "comparison")
    os.makedirs(out_dir, exist_ok=True)
    for trial in manifest.get("trials", []):
      build_targets.append({
          "slot": trial["slug"],
          "label": trial["label"],
          "project_path": os.path.join(run_dir, trial["projectDir"]),
          "eval_dir": os.path.join(run_dir, "trials", trial["slug"], "comparison"),
      })
  elif args.reference and args.builds:
    ref_image = os.path.abspath(args.reference)
    out_dir = os.path.abspath(args.out_dir or "/tmp/warmup-post-bench")
    os.makedirs(out_dir, exist_ok=True)
    for pair in args.builds.split(","):
      pair = pair.strip()
      if not pair or "=" not in pair:
        continue
      slot, ppath = pair.split("=", 1)
      slot = slot.strip()
      ppath = os.path.abspath(ppath.strip())
      build_targets.append({
          "slot": slot,
          "label": slot.capitalize(),
          "project_path": ppath,
          "eval_dir": os.path.join(out_dir, "trials", slot, "eval"),
      })
  else:
    print(
        json.dumps({"error": "Specify either --run-dir <dir> OR (--reference <img.png> --builds slot1=path1,...)"}),
        file=sys.stderr,
    )
    return 1

  audits: list[dict[str, Any]] = []
  for target in build_targets:
    aud = evaluate_single_build(
        slot_slug=target["slot"],
        slot_label=target["label"],
        project_path=target["project_path"],
        ref_path=ref_image,
        eval_dir=target["eval_dir"],
        target_score=args.target_score,
        skip_build=args.skip_build,
    )
    audits.append(aud)

  ref_norm = audits[0]["artifacts"]["mockup_png"] if audits else ref_image
  matrix = compute_pairwise_and_board(ref_norm, audits, out_dir)
  print(json.dumps({
      "status": "COMPARED",
      "build_count": len(audits),
      "overall_visual_winner": matrix.get("overall_visual_winner"),
      "zone_winners": matrix.get("zone_winners"),
      "all_builds_comparison_png": matrix.get("all_builds_comparison_png"),
      "pairwise_build_matrix_json": os.path.join(out_dir, "pairwise_build_matrix.json"),
      "scores": {a["slot"]: a["s_total"] for a in audits},
  }, indent=2))
  return 0


if __name__ == "__main__":
  sys.exit(main())
