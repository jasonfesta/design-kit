#!/usr/bin/env node
/**
 * Image-to-React Visual Matcher & Micro-Layout Auditor (`eval-image-to-react.mjs`)
 *
 * Sandbox-native implementation powered by WebKit2GTK (`xvfb-run` + `gi.repository.WebKit2`),
 * PyCairo (`cairo`), and ImageMagick 7 (`/usr/bin/magick`) — requires zero external pip packages
 * and runs 100% inside the standard terminal sandbox (`BypassSandbox: false`).
 *
 * Combines:
 *  - Google Agentic Design Loop (`render_screenshot.py` + `AutoRaterV1` in `visual_matcher`)
 *  - Aegis `screenshot-compare` (`side_by_side.png`)
 *  - SDS Measurement Verifier (`button_padding_violations` + `grid_equality_violations`)
 *
 * Usage:
 *   node eval-image-to-react.mjs \
 *     --project=/path/to/moodboard/projects/01-website-brand \
 *     --reference=/path/to/mockup.png \
 *     --workspace=/tmp/img2react_work \
 *     --target-score=0.85
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

function parseArgs(argv) {
  const args = {
    project: "",
    html: "",
    reference: "",
    workspace: "",
    targetScore: 0.85,
    screen: 0,
    screenId: "",
    skipBuild: false,
    failOnNonPass: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--project=")) args.project = a.slice("--project=".length);
    else if (a === "--project" && argv[i + 1]) args.project = argv[++i];
    else if (a.startsWith("--html=")) args.html = a.slice("--html=".length);
    else if (a === "--html" && argv[i + 1]) args.html = argv[++i];
    else if (a.startsWith("--reference=")) args.reference = a.slice("--reference=".length);
    else if (a === "--reference" && argv[i + 1]) args.reference = argv[++i];
    else if (a.startsWith("--workspace=")) args.workspace = a.slice("--workspace=".length);
    else if (a === "--workspace" && argv[i + 1]) args.workspace = argv[++i];
    else if (a.startsWith("--out-dir=")) args.workspace = a.slice("--out-dir=".length);
    else if (a === "--out-dir" && argv[i + 1]) args.workspace = argv[++i];
    else if (a.startsWith("--out_dir=")) args.workspace = a.slice("--out_dir=".length);
    else if (a === "--out_dir" && argv[i + 1]) args.workspace = argv[++i];
    else if (a.startsWith("--target-score=")) args.targetScore = parseFloat(a.slice("--target-score=".length));
    else if (a === "--target-score" && argv[i + 1]) args.targetScore = parseFloat(argv[++i]);
    else if (a.startsWith("--screen=")) args.screen = parseInt(a.slice("--screen=".length), 10);
    else if (a.startsWith("--screen-id=")) args.screenId = a.slice("--screen-id=".length);
    else if (a === "--skip-build") args.skipBuild = true;
    else if (a === "--fail-on-non-pass") args.failOnNonPass = true;
  }
  return args;
}

function ensureProjectBuilt(projectDir, skipBuild) {
  const distHtml = path.join(projectDir, "dist", "index.html");
  if (skipBuild && fs.existsSync(distHtml)) {
    return distHtml;
  }
  const pkgJson = path.join(projectDir, "package.json");
  if (!fs.existsSync(pkgJson)) {
    const rootHtml = path.join(projectDir, "index.html");
    if (fs.existsSync(rootHtml)) return rootHtml;
    throw new Error(`No package.json or index.html found in ${projectDir}`);
  }
  const npmBin = fs.existsSync("/usr/local/google/home/jfesta/.local/bin/npm")
    ? "/usr/local/google/home/jfesta/.local/bin/npm"
    : "npm";
  const env = {
    ...process.env,
    PATH: `/usr/local/google/home/jfesta/.local/bin:${process.env.PATH || ""}`,
  };
  const nodeModules = path.join(projectDir, "node_modules");
  if (!fs.existsSync(nodeModules)) {
    const parentModules = path.resolve(projectDir, "..", "..", "node_modules");
    const goldenModules = "/usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating/node_modules";
    if (fs.existsSync(parentModules)) {
      fs.symlinkSync(parentModules, nodeModules, "dir");
    } else if (fs.existsSync(goldenModules)) {
      fs.symlinkSync(goldenModules, nodeModules, "dir");
    } else {
      execFileSync(npmBin, ["install", "--no-audit", "--no-fund"], {
        cwd: projectDir,
        stdio: "inherit",
        env,
      });
    }
  }
  runViteBuild(projectDir, npmBin, env);
  if (!fs.existsSync(distHtml)) {
    throw new Error(`Build succeeded but ${distHtml} was not created.`);
  }
  return distHtml;
}

/**
 * Builds the project. Prefers invoking Vite directly with `--configLoader runner`
 * (no temp-file write into node_modules/.vite-temp, which fails when node_modules
 * is a read-only symlink), falling back to `npm run build`.
 */
function runViteBuild(projectDir, npmBin, env) {
  const viteBin = path.join(projectDir, "node_modules", "vite", "bin", "vite.js");
  if (fs.existsSync(viteBin)) {
    try {
      execFileSync(process.execPath, [viteBin, "build", "--configLoader", "runner"], { cwd: projectDir, stdio: "inherit", env });
      return;
    } catch (err) {
      console.warn(`[eval-image-to-react] direct vite build failed (${err.message.split("\n")[0]}); falling back to npm run build`);
    }
  }
  execFileSync(npmBin, ["run", "build"], { cwd: projectDir, stdio: "inherit", env });
}

const DOM_PROBE_JS = `
(function() {
  const styleHide = document.createElement('style');
  styleHide.textContent = '#gt-inspector-host { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }';
  (document.head || document.documentElement).appendChild(styleHide);

  window.__runGoldenDomProbe = function() {
    const vw = window.innerWidth || 1280;
    const vh = window.innerHeight || 800;
    const sw = Math.max(document.documentElement.scrollWidth || vw, document.body ? document.body.scrollWidth : vw);
    const sh = Math.max(document.documentElement.scrollHeight || vh, document.body ? document.body.scrollHeight : vh);

    const leafBoxes = [];
    const containerBoxes = [];
    const mediaBoxes = [];
    const textBoxes = [];
    const buttonAudits = [];
    const gridRowAudits = [];

    const all = Array.from(document.querySelectorAll('body *')).filter(
      (el) => !el.closest('#gt-inspector-host') && el.id !== '__autorater_dom_snapshot__'
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
        ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.')
        : '';
      const sel = tag + (el.id ? '#' + el.id : (cls || '.' + idx));
      const nodeId = nodeMap.get(el);

      const ancestorIds = [];
      let visLeft = rect.left;
      let visTop = rect.top;
      let visRight = rect.right;
      let visBottom = rect.bottom;
      let isDecorativeBg = el.getAttribute('aria-hidden') === 'true' || el.getAttribute('data-photo-frame') === 'true' || style.pointerEvents === 'none' || tag === 'svg' || tag === 'img';

      let p = el.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        if (nodeMap.has(p)) ancestorIds.push(nodeMap.get(p));
        const ps = window.getComputedStyle(p);
        if (p.getAttribute('aria-hidden') === 'true' || ps.pointerEvents === 'none') {
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
        color: style.color || '',
        background_color: style.backgroundColor || '',
        font_size: parseFloat(style.fontSize || '16') || 16,
        font_weight: style.fontWeight || '400',
        padding: [padTop, padRight, padBottom, padLeft]
      };

      if (visWidth > 0 && visHeight > 0) {
        if (!isDecorativeBg && (el.children.length === 0 || directText.length > 0 || isInteractive)) {
          leafBoxes.push(boxEntry);
        }
        containerBoxes.push(boxEntry);
      }

      if (['img', 'svg', 'canvas', 'video'].includes(tag)) {
        mediaBoxes.push({
          selector: sel,
          tag: tag,
          client_width: rect.width,
          client_height: rect.height,
          complete: tag === 'img' ? Boolean(el.complete && el.naturalWidth > 0) : rect.width > 0
        });
      }

      const visibleText = (el.innerText || '').trim().replace(/\\s+/g, ' ');
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

      // 1. Audit Button & Pill Padding Symmetry + Container Clearance
      const looksLikeButton =
        tag === 'button' ||
        el.getAttribute('role') === 'button' ||
        (tag === 'a' && (padLeft >= 8 || padRight >= 8) && rect.height >= 22 && rect.height <= 64);

      if (looksLikeButton && rect.width >= 24 && rect.height >= 20 && rect.top < vh && rect.left < vw) {
        const label = (el.innerText || '').trim().replace(/\\s+/g, ' ');
        const hasSvg = Boolean(el.querySelector('svg'));
        const isIconOnly = label.length === 0 && hasSvg;
        const horizDiff = Math.abs(padLeft - padRight);
        const vertDiff = Math.abs(padTop - padBottom);
        const issues = [];

        const maxAllowedHorizDiff = hasSvg ? 6 : 2.5;
        if (!isIconOnly && horizDiff > maxAllowedHorizDiff) {
          issues.push('asymmetric_horizontal_padding(left=' + Math.round(padLeft) + 'px, right=' + Math.round(padRight) + 'px)');
        }
        if (!isIconOnly && (padLeft < 6 || padRight < 6) && rect.width > 56) {
          const firstChild = el.firstElementChild;
          const innerRect = firstChild ? firstChild.getBoundingClientRect() : null;
          const effLeft = innerRect ? (innerRect.left - rect.left) : padLeft;
          const effRight = innerRect ? (rect.right - innerRect.right) : padRight;
          if (effLeft < 6 || effRight < 6) {
            issues.push('cramped_horizontal_padding(left=' + Math.round(effLeft) + 'px, right=' + Math.round(effRight) + 'px)');
          }
        }
        if (vertDiff > 3) {
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

      // 2. Audit Multi-Column Grid & Flex Card Equality (Widths, Heights, Bottom Baselines, Gutters)
      const isGridOrFlex = style.display.includes('grid') || style.display.includes('flex');
      if (isGridOrFlex && el.children.length >= 2) {
        const children = Array.from(el.children).filter((ch) => {
          const cs = window.getComputedStyle(ch);
          const cr = ch.getBoundingClientRect();
          return cs.display !== 'none' && cs.visibility !== 'hidden' && cr.width >= 140 && cr.height >= 80;
        });

        if (children.length >= 2) {
          const rows = [];
          children.forEach((ch) => {
            const cr = ch.getBoundingClientRect();
            let row = rows.find((r) => Math.abs(r.top - cr.top) <= 16);
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
            const isPeerCardRow = tagsSame && (maxW - minW) <= 0.20 * maxW && minW >= 160;

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
              if (row.items.length >= 3) {
                const gaps = [];
                for (let k = 0; k < row.items.length - 1; k++) {
                  gaps.push(row.items[k + 1].rect.left - row.items[k].rect.right);
                }
                const minGap = Math.min(...gaps);
                const maxGap = Math.max(...gaps);
                if (maxGap - minGap > 3) {
                  rowIssues.push('uneven_sibling_gutters(min=' + Math.round(minGap) + 'px, max=' + Math.round(maxGap) + 'px)');
                }
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
    });

    const svgIds = new Set(
      containerBoxes.filter((b) => b.tag === 'svg').map((b) => b.node_id)
    );
    const nonSvgLeaves = leafBoxes.filter(
      (b) => !b.ancestor_ids.some((id) => svgIds.has(id))
    );
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
      button_padding_violations: buttonAudits.length,
      button_audits: buttonAudits.slice(0, 15),
      grid_equality_violations: gridRowAudits.length,
      grid_row_audits: gridRowAudits.slice(0, 15),
      container_boxes: containerBoxes,
      leaf_boxes: leafBoxes,
      media_boxes: mediaBoxes,
      page_errors: []
    };
    document.title = '__DOM_SNAP__:' + JSON.stringify(payload);
    return payload;
  };
})();
`;

const PYTHON_WEBKIT_AND_SCORER = `
import json
import math
import os
import subprocess
import sys

import cairo
import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib

ref_path = sys.argv[1]
html_path = sys.argv[2]
workspace_dir = sys.argv[3]
target_score = float(sys.argv[4])
screen_idx = int(sys.argv[5]) if len(sys.argv) > 5 else 0
screen_id = sys.argv[6] if len(sys.argv) > 6 else ""

# 1. Inspect reference dimensions via ImageMagick
dim_out = subprocess.check_output(
    ["/usr/bin/magick", "identify", "-format", "%w %h", ref_path],
    text=True,
    stderr=subprocess.DEVNULL,
).strip().split()
w, h = int(dim_out[0]), int(dim_out[1])

rendered_path = os.path.join(workspace_dir, "rendered.png")
dom_json_path = os.path.join(workspace_dir, "dom_snapshot.json")

# 2. Render HTML at exact (w x h) in WebKit2 + extract DOM snapshot via title channel
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

def apply_screen_then_probe():
    if screen_idx != 0 or screen_id:
        wv.run_javascript(
            f"if (window.__setGoldenEvalScreen) window.__setGoldenEvalScreen({screen_idx}, {json.dumps(screen_id)}); window.scrollTo(0, 0);",
            None, None, None
        )
        GLib.timeout_add(300, trigger_probe)
    else:
        trigger_probe()
    return False

def on_load(webview, event):
    if event == WebKit2.LoadEvent.FINISHED:
        GLib.timeout_add(750, apply_screen_then_probe)

wv.connect("load-changed", on_load)
uri = "file://" + os.path.abspath(html_path)
if screen_idx != 0 or screen_id:
    uri += f"?screen={screen_idx}&screenId={screen_id}"
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
        "button_padding_violations": 0,
        "button_audits": [],
        "grid_equality_violations": 0,
        "grid_row_audits": [],
        "container_boxes": [],
        "leaf_boxes": [],
        "media_boxes": [],
        "page_errors": [],
    }

with open(dom_json_path, "w", encoding="utf-8") as f:
    json.dump(dom_snapshot, f, indent=2)

# 3. Generate rendered_overlay.png (50/50 blend) via ImageMagick
overlay_path = os.path.join(workspace_dir, "rendered_overlay.png")
subprocess.check_call([
    "/usr/bin/magick",
    ref_path,
    "(",
    rendered_path,
    "-resize",
    f"{w}x{h}!",
    ")",
    "-compose",
    "blend",
    "-define",
    "compose:args=50,50",
    "-composite",
    overlay_path,
])

# 4. Load raw RGB bytes for ref and rendered to compute 64x64 cell loss map
ref_raw = subprocess.check_output(
    ["/usr/bin/magick", ref_path, "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
    stderr=subprocess.DEVNULL,
)
cand_raw = subprocess.check_output(
    ["/usr/bin/magick", rendered_path, "-resize", f"{w}x{h}!", "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
    stderr=subprocess.DEVNULL,
)

cell = 64
rows = (h + cell - 1) // cell
cols = (w + cell - 1) // cell
cell_loss_map = [[0.0] * cols for _ in range(rows)]

block_sims = []
edge_sims = []
color_sims = []
error_cells = []

# Sample on 2px stride inside each 64x64 cell for fast C-speed block/edge/chroma scoring
for r in range(rows):
    y0, y1 = r * cell, min(h, (r + 1) * cell)
    for c in range(cols):
        x0, x1 = c * cell, min(w, (c + 1) * cell)
        n_px = 0
        sum_r_ref = sum_g_ref = sum_b_ref = 0.0
        sum_r_cand = sum_g_cand = sum_b_cand = 0.0
        sum_l1 = 0.0
        sum_edge_ref = 0.0
        sum_edge_cand = 0.0

        for y in range(y0, y1, 2):
            row_off = y * w * 3
            next_y = min(h - 1, y + 1)
            next_row_off = next_y * w * 3
            for x in range(x0, x1, 2):
                idx = row_off + x * 3
                nx_idx = row_off + min(w - 1, x + 1) * 3
                ny_idx = next_row_off + x * 3

                rr, rg, rb = ref_raw[idx], ref_raw[idx + 1], ref_raw[idx + 2]
                cr_v, cg_v, cb_v = cand_raw[idx], cand_raw[idx + 1], cand_raw[idx + 2]

                sum_r_ref += rr; sum_g_ref += rg; sum_b_ref += rb
                sum_r_cand += cr_v; sum_g_cand += cg_v; sum_b_cand += cb_v
                sum_l1 += (abs(rr - cr_v) + abs(rg - cg_v) + abs(rb - cb_v)) / 3.0

                # Approximate gradient magnitude
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

        loss = 1.0 - (0.45 * block_sim + 0.30 * edge_sim + 0.25 * color_sim)
        cell_loss_map[r][c] = loss
        if loss > 0.16:
            mode = "color_or_polarity_drift" if color_sim < block_sim else "structural_or_spacing_shift"
            error_cells.append({
                "bbox": [x0, y0, x1 - x0, y1 - y0],
                "loss_score": round(float(loss), 4),
                "dominant_failure_mode": mode,
            })

error_cells.sort(key=lambda item: -item["loss_score"])

# 5. Localize top failing cells to React DOM selectors
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
        if b_area <= 0 or b_area > 0.90 * w * h:
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
            "loss_score": cell_item["loss_score"],
            "dominant_failure_mode": cell_item["dominant_failure_mode"],
        })

# 6. Render diff_mask.png and side_by_side.png via PyCairo
diff_surf = cairo.ImageSurface.create_from_png(rendered_path)
ctx = cairo.Context(diff_surf)
for r in range(rows):
    for c in range(cols):
        loss = cell_loss_map[r][c]
        if loss <= 0.15:
            continue
        y0, y1 = r * cell, min(h, (r + 1) * cell)
        x0, x1 = c * cell, min(w, (c + 1) * cell)
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

diff_mask_path = os.path.join(workspace_dir, "diff_mask.png")
diff_surf.write_to_png(diff_mask_path)

# Render 3-panel side_by_side.png
header_h = 34
gap = 12
sbs_w = w * 3 + gap * 2
sbs_h = h + header_h
sbs_surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, sbs_w, sbs_h)
sctx = cairo.Context(sbs_surf)
sctx.set_source_rgb(0.09, 0.09, 0.11)
sctx.paint()

ref_surf = cairo.ImageSurface.create_from_png(ref_path)
cand_surf = cairo.ImageSurface.create_from_png(rendered_path)

sctx.select_font_face("sans-serif", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
sctx.set_font_size(13)

# Panel 1 header
sctx.set_source_rgb(0.18, 0.18, 0.20)
sctx.rectangle(0, 0, w, header_h)
sctx.fill()
sctx.set_source_rgb(0.98, 0.98, 0.98)
sctx.move_to(12, 22)
sctx.show_text(f"1. REFERENCE COMP ({w}x{h})")
sctx.set_source_surface(ref_surf, 0, header_h)
sctx.paint()

# Panel 2 header
sctx.set_source_rgb(0.09, 0.40, 0.20)
sctx.rectangle(w + gap, 0, w, header_h)
sctx.fill()
sctx.set_source_rgb(0.98, 0.98, 0.98)
sctx.move_to(w + gap + 12, 22)
sctx.show_text("2. OUTPUT REACT SCREENSHOT (rendered.png)")
sctx.set_source_surface(cand_surf, w + gap, header_h)
sctx.paint()

# Panel 3 header
sctx.set_source_rgb(0.60, 0.11, 0.11)
sctx.rectangle((w + gap) * 2, 0, w, header_h)
sctx.fill()
sctx.set_source_rgb(0.98, 0.98, 0.98)
sctx.move_to((w + gap) * 2 + 12, 22)
sctx.show_text("3. VISUAL DIFF HEATMAP (diff_mask.png)")
sctx.set_source_surface(diff_surf, (w + gap) * 2, header_h)
sctx.paint()

side_by_side_path = os.path.join(workspace_dir, "side_by_side.png")
sbs_surf.write_to_png(side_by_side_path)

# 7. Compute composite score s_total & DOM integrity health
s_block = sum(block_sims) / max(1, len(block_sims))
s_edge = sum(edge_sims) / max(1, len(edge_sims))
s_chroma = sum(color_sims) / max(1, len(color_sims))

collisions = int(dom_snapshot.get("collision_count") or 0)
overflow_px = int(dom_snapshot.get("horizontal_overflow_px") or 0)
clipped_cnt = int(dom_snapshot.get("clipped_text_count") or 0)
btn_violations = int(dom_snapshot.get("button_padding_violations") or 0)
grid_violations = int(dom_snapshot.get("grid_equality_violations") or 0)

s_dom = 1.0
s_dom -= min(0.45, 0.15 * collisions)
if overflow_px > 0:
    s_dom -= 0.25
s_dom -= min(0.20, 0.05 * clipped_cnt)
s_dom -= min(0.20, 0.04 * btn_violations)
s_dom -= min(0.25, 0.08 * grid_violations)
s_dom = max(0.0, s_dom)

s_total = round(0.35 * s_block + 0.25 * s_edge + 0.20 * s_chroma + 0.20 * s_dom, 4)

passed = (
    s_total >= target_score
    and collisions == 0
    and overflow_px == 0
    and btn_violations == 0
    and grid_violations == 0
)
status = "PASSED" if passed else ("NEEDS_REFINEMENT" if s_total >= 0.65 else "FAILED")

remediation_directives = []
for pair in (dom_snapshot.get("colliding_pairs") or []):
    remediation_directives.append(
        f"[P0-FIX] Resolve DOM overlap ({pair['overlap_area']}px^2) between {pair['element_a']} and {pair['element_b']}."
    )
if overflow_px > 0:
    remediation_directives.append(
        f"[P0-FIX] Eliminate {overflow_px}px horizontal overflow (ensure min-w-0 on flex/grid children and max-w-full)."
    )
for b_aud in (dom_snapshot.get("button_audits") or []):
    remediation_directives.append(
        f"[P1-FIX] Button '{b_aud['label']}' ({b_aud['selector']}): {', '.join(b_aud['issues'])}."
    )
for g_aud in (dom_snapshot.get("grid_row_audits") or []):
    remediation_directives.append(
        f"[P1-FIX] Grid row in {g_aud['container_selector']} (top={g_aud['row_top_px']}px): {', '.join(g_aud['issues'])}."
    )
for dev in container_deviations:
    remediation_directives.append(
        f"[P2-FIX] Container {dev['selector']} at bbox={dev['bbox']} has visual loss={dev['loss_score']} ({dev['dominant_failure_mode']})."
    )

audit = {
    "status": status,
    "passed": passed,
    "target_score": target_score,
    "s_total": s_total,
    "sub_scores": {
        "s_block_structure": round(s_block, 4),
        "s_edge_alignment": round(s_edge, 4),
        "s_chromatic_fidelity": round(s_chroma, 4),
        "s_dom_craft_health": round(s_dom, 4),
    },
    "dom_integrity": {
        "collision_count": collisions,
        "colliding_pairs": dom_snapshot.get("colliding_pairs") or [],
        "horizontal_overflow_px": overflow_px,
        "clipped_text_count": clipped_cnt,
        "clipped_text": dom_snapshot.get("clipped_text") or [],
        "page_errors": dom_snapshot.get("page_errors") or [],
    },
    "craft_and_micro_layout": {
        "button_padding_violations": btn_violations,
        "button_audits": dom_snapshot.get("button_audits") or [],
        "grid_equality_violations": grid_violations,
        "grid_row_audits": dom_snapshot.get("grid_row_audits") or [],
    },
    "container_deviations": container_deviations,
    "remediation_directives": remediation_directives,
    "artifacts": {
        "mockup_png": ref_path,
        "rendered_png": rendered_path,
        "rendered_overlay_png": overlay_path,
        "diff_mask_png": diff_mask_path,
        "side_by_side_png": side_by_side_path,
        "dom_snapshot_json": dom_json_path,
    },
}

audit_path = os.path.join(workspace_dir, "visual_match_audit.json")
with open(audit_path, "w", encoding="utf-8") as f:
    json.dump(audit, f, indent=2)

print(json.dumps(audit, indent=2))
`;

function main() {
  const args = parseArgs(process.argv);
  if (!args.reference || !fs.existsSync(args.reference)) {
    console.error("Usage: node eval-image-to-react.mjs --project=<dir> --reference=<mockup.png> [--workspace=<dir>]");
    process.exit(1);
  }

  const workspaceDir = path.resolve(
    args.workspace || (args.project ? path.join(args.project, ".eval_work") : fs.mkdtempSync(path.join(os.tmpdir(), "img2react-eval-")))
  );
  fs.mkdirSync(workspaceDir, { recursive: true });

  const htmlPath = args.html
    ? path.resolve(args.html)
    : ensureProjectBuilt(path.resolve(args.project), args.skipBuild);

  const mockupPath = path.join(workspaceDir, "mockup.png");
  if (path.resolve(args.reference) !== mockupPath) {
    fs.copyFileSync(args.reference, mockupPath);
  }

  // Inject DOM_PROBE_JS into a temporary HTML file next to htmlPath so relative assets resolve
  const origHtml = fs.readFileSync(htmlPath, "utf-8");
  const injectedHtml = origHtml.includes("</head>")
    ? origHtml.replace("</head>", `<script>${DOM_PROBE_JS}</script></head>`)
    : `<script>${DOM_PROBE_JS}</script>${origHtml}`;

  const tmpHtmlPath = path.join(path.dirname(htmlPath), `.eval_probe_${process.pid}.html`);
  fs.writeFileSync(tmpHtmlPath, injectedHtml, "utf-8");

  try {
    const auditRaw = execFileSync(
      "xvfb-run",
      ["-a", "python3", "-c", PYTHON_WEBKIT_AND_SCORER, mockupPath, tmpHtmlPath, workspaceDir, String(args.targetScore), String(args.screen || 0), String(args.screenId || "")],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }
    );
    console.log(auditRaw);
    const audit = JSON.parse(auditRaw);
    if (args.failOnNonPass && !audit.passed) {
      process.exit(1);
    }
  } finally {
    try { fs.unlinkSync(tmpHtmlPath); } catch {}
  }
}

main();
