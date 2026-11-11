#!/usr/bin/env node
/**
 * Strict Multi-Screenshot (5–10+ Screens) Image-to-React Visual & DOM Evaluator
 * (`eval-multi-screen-project.mjs`)
 *
 * Evaluates a single Golden Template React application (`projects/<slug>/`) against
 * an entire suite of 5 to 10+ Nano Banana reference screenshots (representing multiple
 * app screens/tabs/modals OR multiple website landing page views/sub-pages/scroll sections).
 *
 * How Multi-Screen Targeting Works in Headless WebKit2GTK:
 *   For each screen `i` (`0 .. K-1`):
 *   1. Resizes the headless viewport to match `screen[i]`'s exact `(width, height)`.
 *   2. Navigates to `file://.../dist/index.html?screen=<i>&screenId=<screen_id>`.
 *   3. Calls `window.__setGoldenEvalScreen(i, screen_id)` if defined on `window`,
 *      OR scrolls to `screen[i].scroll_y` if `screen[i].mode === "scroll"`.
 *   4. Hides `#gt-inspector-host` and `.gt-eval-hide` chrome so floating dev switchers
 *      never pollute pixel comparison.
 *   5. Runs `__runGoldenDomProbe()` on Screen `i`, auditing:
 *      - `collision_count == 0` (clipped to scroll containers)
 *      - `horizontal_overflow_px == 0`
 *      - `clipped_text_count == 0`
 *      - `button_padding_violations == 0` (symmetrical left/right & top/bottom padding + clearance)
 *      - `grid_equality_violations == 0` (equal peer card widths, heights, baselines & gutters)
 *      - `broken_media_count == 0` (all visible `<img>` and `<svg>` loaded with non-zero dimensions)
 *   6. Captures `rendered_<screen_id>.png`, `overlay_<screen_id>.png` (50/50 blend),
 *      `diff_mask_<screen_id>.png` (64x64 cell loss heatmap), and `side_by_side_<screen_id>.png`.
 *   7. Computes per-screen `s_total` and aggregate project `mean_s_total` / `min_s_total`.
 *
 * Usage:
 *   node eval-multi-screen-project.mjs \
 *     --project=/path/to/moodboard/projects/01-website-brand \
 *     --spec=/path/to/nano_banana_spec.json \
 *     [--references=screen1.png,screen2.png,...] \
 *     [--workspace=/tmp/multi_eval_01] \
 *     [--target-score=0.85]
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

function parseArgs(argv) {
  const args = {
    project: "",
    spec: "",
    references: [],
    screenshotsDir: "",
    workspace: "",
    targetScore: 0.85,
    minScreenScore: 0.82,
    skipBuild: false,
    failOnNonPass: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--project=")) args.project = a.slice("--project=".length);
    else if (a === "--project" && argv[i + 1]) args.project = argv[++i];
    else if (a.startsWith("--spec=")) args.spec = a.slice("--spec=".length);
    else if (a === "--spec" && argv[i + 1]) args.spec = argv[++i];
    else if (a.startsWith("--references=")) {
      args.references = a
        .slice("--references=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a.startsWith("--screenshots-dir=")) {
      args.screenshotsDir = a.slice("--screenshots-dir=".length);
    } else if (a.startsWith("--workspace=") || a.startsWith("--out-dir=")) {
      args.workspace = a.slice(a.indexOf("=") + 1);
    } else if (a.startsWith("--target-score=")) {
      args.targetScore = parseFloat(a.slice("--target-score=".length));
    } else if (a.startsWith("--min-screen-score=")) {
      args.minScreenScore = parseFloat(a.slice("--min-screen-score=".length));
    } else if (a === "--skip-build" || a === "--no-build") args.skipBuild = true;
    else if (a === "--fail-on-non-pass") args.failOnNonPass = true;
  }
  return args;
}

function findSharedNodeModules(projectDir) {
  const candidates = [
    path.resolve(projectDir, "..", "..", "node_modules"),
    "/usr/local/google/home/jfesta/moodboards/warm-landing-page/node_modules",
    "/usr/local/google/home/jfesta/design-kit/skills/golden-template/assets/dating/node_modules",
    "/usr/local/google/home/jfesta/moodboards/modern-tech-brand/node_modules",
  ];
  for (const cand of candidates) {
    if (fs.existsSync(cand)) return cand;
  }
  return null;
}

function ensureProjectBuilt(projectDir, skipBuild) {
  const distHtml = path.join(projectDir, "dist", "index.html");
  const slug = path.basename(projectDir);
  const moodboardDistHtml = path.resolve(projectDir, "..", "..", "dist", "projects", slug, "index.html");
  if (skipBuild) {
    if (fs.existsSync(distHtml)) return distHtml;
    if (fs.existsSync(moodboardDistHtml)) return moodboardDistHtml;
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
    const sharedNm = findSharedNodeModules(projectDir);
    if (sharedNm) {
      try {
        fs.symlinkSync(sharedNm, nodeModules, "dir");
      } catch {
        // Fallback if symlink already exists
      }
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
      console.warn(`[eval-multi-screen-project] direct vite build failed (${err.message.split("\n")[0]}); falling back to npm run build`);
    }
  }
  execFileSync(npmBin, ["run", "build"], { cwd: projectDir, stdio: "inherit", env });
}

const DOM_PROBE_JS = `
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
        ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.')
        : '';
      const sel = tag + (el.id ? '#' + el.id : (cls || '.' + idx));
      const nodeId = nodeMap.get(el);

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
        if (
          p.getAttribute('aria-hidden') === 'true' ||
          p.getAttribute('data-photo-frame') === 'true' ||
          ps.pointerEvents === 'none'
        ) {
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

      // 1. Strict Button & Pill Padding Symmetry + Optical Clearance Audit
      const looksLikeButton =
        tag === 'button' ||
        el.getAttribute('role') === 'button' ||
        (tag === 'a' && (padLeft >= 8 || padRight >= 8) && rect.height >= 22 && rect.height <= 64);

      const isCompactButton = looksLikeButton && rect.width >= 28 && rect.width <= 280 && rect.height >= 20 && rect.height <= 60;

      if (isCompactButton && rect.top >= 0 && rect.top < vh && rect.left >= 0 && rect.left < vw) {
        const label = (el.innerText || '').trim().replace(/\\s+/g, ' ');
        const hasSvg = Boolean(el.querySelector('svg'));
        const isIconOnly = label.length === 0 && hasSvg;
        const textAlign = style.textAlign || '';
        const justifyContent = style.justifyContent || '';
        const isLeftAlignedMenuBtn = textAlign === 'left' || justifyContent.includes('between') || justifyContent.includes('start');
        const horizDiff = Math.abs(padLeft - padRight);
        const vertDiff = Math.abs(padTop - padBottom);
        const issues = [];

        const maxAllowedHorizDiff = hasSvg ? 8 : 3;
        if (!isIconOnly && !isLeftAlignedMenuBtn && horizDiff > maxAllowedHorizDiff) {
          issues.push('asymmetric_horizontal_padding(left=' + Math.round(padLeft) + 'px, right=' + Math.round(padRight) + 'px)');
        }
        if (vertDiff > 4) {
          issues.push('asymmetric_vertical_padding(top=' + Math.round(padTop) + 'px, bottom=' + Math.round(padBottom) + 'px)');
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

      // 2. Strict Multi-Column Grid & Flex Card Equality Audit
      const isGridOrFlex = style.display.includes('grid') || style.display.includes('flex');
      if (isGridOrFlex && el.children.length >= 2) {
        const children = Array.from(el.children).filter((ch) => {
          const cs = window.getComputedStyle(ch);
          const cr = ch.getBoundingClientRect();
          return cs.display !== 'none' && cs.visibility !== 'hidden' && cr.width >= 160 && cr.height >= 100;
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
            if (row.items.length < 3) return;
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
            const isPeerCardRow = tagsSame && (maxW - minW) <= 0.08 * maxW && minW >= 180;

            if (isPeerCardRow) {
              const rowIssues = [];
              if ((maxW - minW) > 4) {
                rowIssues.push('unequal_column_widths(min=' + Math.round(minW) + 'px, max=' + Math.round(maxW) + 'px)');
              }
              if ((maxH - minH) > 4) {
                rowIssues.push('unequal_card_heights(min=' + Math.round(minH) + 'px, max=' + Math.round(maxH) + 'px)');
              }
              if ((maxBot - minBot) > 4) {
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
        if (dx <= 6 || dy <= 6) continue;
        const interArea = dx * dy;
        if (interArea <= 80) continue;
        const minArea = Math.min(areaA, areaB);
        const maxArea = Math.max(areaA, areaB);
        if (minArea <= 2000 && maxArea >= 3.5 * minArea) continue;
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
      colliding_pairs: collidingPairs.slice(0, 10),
      clipped_text_count: textBoxes.length,
      clipped_text: textBoxes.slice(0, 10),
      broken_media_count: brokenMedia.length,
      broken_media: brokenMedia.slice(0, 10),
      button_padding_violations: buttonAudits.length,
      button_audits: buttonAudits.slice(0, 10),
      grid_equality_violations: gridRowAudits.length,
      grid_row_audits: gridRowAudits.slice(0, 10),
      container_boxes: containerBoxes,
      leaf_boxes: leafBoxes
    };
    document.title = '__DOM_SNAP__:' + JSON.stringify(payload);
    return payload;
  };
})();
`;

const PYTHON_MULTI_SCREEN_EVAL = `
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

jobs_json_path = sys.argv[1]
with open(jobs_json_path, "r", encoding="utf-8") as f:
    config = json.load(f)

screens = config["screens"]
html_path = config["html_path"]
workspace_dir = config["workspace_dir"]
target_score = float(config["target_score"])
min_screen_score = float(config["min_screen_score"])

init_w = screens[0]["width"] if screens else 1440
init_h = screens[0]["height"] if screens else 900
win = Gtk.OffscreenWindow()
win.set_default_size(init_w, init_h)
wv = WebKit2.WebView()
wv.set_size_request(init_w, init_h)
settings = wv.get_settings()
settings.set_enable_write_console_messages_to_stdout(False)
settings.set_allow_file_access_from_file_urls(True)
settings.set_allow_universal_access_from_file_urls(True)
win.add(wv)
win.show_all()

idx = 0
raw_captures = {}
job_timer_id = None

def start_screen():
    global idx, job_timer_id
    if job_timer_id is not None:
        GLib.source_remove(job_timer_id)
        job_timer_id = None
    if idx >= len(screens):
        Gtk.main_quit()
        return False
    sc = screens[idx]
    w, h = sc["width"], sc["height"]
    win.resize(w, h)
    wv.set_size_request(w, h)
    job_timer_id = GLib.timeout_add(3000, switch_and_probe)
    uri = f"file://{os.path.abspath(html_path)}?screen={sc['index']}&screenId={sc['screen_id']}"
    wv.load_uri(uri)
    return False

def on_snapshot(webview, res):
    global idx
    sc = screens[idx]
    try:
        surf = webview.get_snapshot_finish(res)
        surf.write_to_png(sc["rendered_png"])
    except Exception:
        pass
    idx += 1
    GLib.timeout_add(50, start_screen)

def capture_screen():
    global idx
    if idx >= len(screens):
        Gtk.main_quit()
        return False
    sc = screens[idx]
    title = wv.get_title() or ""
    snap = {}
    if title.startswith("__DOM_SNAP__:"):
        try:
            snap = json.loads(title[len("__DOM_SNAP__:"):])
        except Exception:
            pass
    raw_captures[sc["screen_id"]] = snap
    wv.get_snapshot(WebKit2.SnapshotRegion.VISIBLE, WebKit2.SnapshotOptions.NONE, None, on_snapshot)
    return False

def run_probe_js():
    wv.run_javascript("window.__runGoldenDomProbe && window.__runGoldenDomProbe();", None, None, None)
    GLib.timeout_add(250, capture_screen)
    return False

def switch_and_probe():
    global idx, job_timer_id
    if job_timer_id is not None:
        GLib.source_remove(job_timer_id)
        job_timer_id = None
    if idx >= len(screens):
        Gtk.main_quit()
        return False
    sc = screens[idx]
    scroll_y = int(sc.get("scroll_y") or 0)
    js_switch = (
        f"if (window.__setGoldenEvalScreen) {{ window.__setGoldenEvalScreen({sc['index']}, {json.dumps(sc['screen_id'])}); }} "
        f"if ({scroll_y} > 0) {{ window.scrollTo(0, {scroll_y}); }}"
    )
    wv.run_javascript(js_switch, None, None, None)
    GLib.timeout_add(350, run_probe_js)
    return False

def on_load(webview, event):
    global job_timer_id
    if event == WebKit2.LoadEvent.FINISHED:
        if job_timer_id is not None:
            GLib.source_remove(job_timer_id)
            job_timer_id = None
        GLib.timeout_add(550, switch_and_probe)

wv.connect("load-changed", on_load)
GLib.timeout_add(50, start_screen)
GLib.timeout_add(90000, Gtk.main_quit)
Gtk.main()

# Score each screen against its reference screenshot
screen_audits = []
all_remediations = []

for sc in screens:
    sid = sc["screen_id"]
    ref_path = sc["reference_png"]
    rendered_path = sc["rendered_png"]
    overlay_path = sc["overlay_png"]
    diff_mask_path = sc["diff_mask_png"]
    side_by_side_path = sc["side_by_side_png"]
    w, h = sc["width"], sc["height"]
    dom_snapshot = raw_captures.get(sid) or {}

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

    ref_raw = subprocess.check_output(
        ["/usr/bin/magick", ref_path, "-resize", f"{w}x{h}!", "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
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
    block_sims, edge_sims, color_sims, error_cells = [], [], [], []

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
                    idx_px = row_off + x * 3
                    nx_idx = row_off + min(w - 1, x + 1) * 3
                    ny_idx = next_row_off + x * 3

                    rr, rg, rb = ref_raw[idx_px], ref_raw[idx_px + 1], ref_raw[idx_px + 2]
                    cr_v, cg_v, cb_v = cand_raw[idx_px], cand_raw[idx_px + 1], cand_raw[idx_px + 2]

                    sum_r_ref += rr; sum_g_ref += rg; sum_b_ref += rb
                    sum_r_cand += cr_v; sum_g_cand += cg_v; sum_b_cand += cb_v
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

    dom_boxes = (dom_snapshot.get("container_boxes") or []) + (dom_snapshot.get("leaf_boxes") or [])
    container_deviations = []
    seen_selectors = set()
    for cell_item in error_cells:
        if len(container_deviations) >= 5:
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
    diff_surf.write_to_png(diff_mask_path)

    # 3-panel side_by_side_<screen_id>.png
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

    sctx.set_source_rgb(0.18, 0.18, 0.20)
    sctx.rectangle(0, 0, w, header_h)
    sctx.fill()
    sctx.set_source_rgb(0.98, 0.98, 0.98)
    sctx.move_to(12, 22)
    sctx.show_text(f"1. [{sid}] REFERENCE ({w}x{h})")
    sctx.set_source_surface(ref_surf, 0, header_h)
    sctx.paint()

    sctx.set_source_rgb(0.09, 0.40, 0.20)
    sctx.rectangle(w + gap, 0, w, header_h)
    sctx.fill()
    sctx.set_source_rgb(0.98, 0.98, 0.98)
    sctx.move_to(w + gap + 12, 22)
    sctx.show_text(f"2. [{sid}] OUTPUT REACT SCREENSHOT")
    sctx.set_source_surface(cand_surf, w + gap, header_h)
    sctx.paint()

    sctx.set_source_rgb(0.60, 0.11, 0.11)
    sctx.rectangle((w + gap) * 2, 0, w, header_h)
    sctx.fill()
    sctx.set_source_rgb(0.98, 0.98, 0.98)
    sctx.move_to((w + gap) * 2 + 12, 22)
    sctx.show_text(f"3. [{sid}] VISUAL DIFF HEATMAP")
    sctx.set_source_surface(diff_surf, (w + gap) * 2, header_h)
    sctx.paint()
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

    s_dom = 1.0
    s_dom -= min(0.45, 0.15 * collisions)
    if overflow_px > 0:
        s_dom -= 0.25
    s_dom -= min(0.20, 0.05 * clipped_cnt)
    s_dom -= min(0.25, 0.10 * broken_cnt)
    s_dom -= min(0.20, 0.04 * btn_violations)
    s_dom -= min(0.25, 0.08 * grid_violations)
    s_dom = max(0.0, s_dom)

    s_total = round(0.35 * s_block + 0.25 * s_edge + 0.20 * s_chroma + 0.20 * s_dom, 4)
    screen_passed = (
        s_total >= min_screen_score
        and collisions == 0
        and overflow_px == 0
        and broken_cnt == 0
        and btn_violations == 0
        and grid_violations == 0
    )

    for pair in (dom_snapshot.get("colliding_pairs") or []):
        all_remediations.append(f"[{sid} · P0-FIX] Resolve DOM overlap ({pair['overlap_area']}px^2) between {pair['element_a']} and {pair['element_b']}.")
    if overflow_px > 0:
        all_remediations.append(f"[{sid} · P0-FIX] Eliminate {overflow_px}px horizontal overflow.")
    for bm in (dom_snapshot.get("broken_media") or []):
        all_remediations.append(f"[{sid} · P0-FIX] Fix broken image {bm['selector']} (src={bm['src']}).")
    for b_aud in (dom_snapshot.get("button_audits") or []):
        all_remediations.append(f"[{sid} · P1-FIX] Button '{b_aud['label']}' ({b_aud['selector']}): {', '.join(b_aud['issues'])}.")
    for g_aud in (dom_snapshot.get("grid_row_audits") or []):
        all_remediations.append(f"[{sid} · P1-FIX] Grid row in {g_aud['container_selector']} (top={g_aud['row_top_px']}px): {', '.join(g_aud['issues'])}.")
    for dev in container_deviations[:3]:
        all_remediations.append(f"[{sid} · P2-FIX] Container {dev['selector']} at bbox={dev['bbox']} has visual loss={dev['loss_score']} ({dev['dominant_failure_mode']}).")

    screen_audits.append({
        "index": sc["index"],
        "screen_id": sid,
        "passed": screen_passed,
        "s_total": s_total,
        "sub_scores": {
            "s_block_structure": round(s_block, 4),
            "s_edge_alignment": round(s_edge, 4),
            "s_chromatic_fidelity": round(s_chroma, 4),
            "s_dom_craft_health": round(s_dom, 4),
        },
        "dom_integrity": {
            "collision_count": collisions,
            "horizontal_overflow_px": overflow_px,
            "clipped_text_count": clipped_cnt,
            "broken_media_count": broken_cnt,
        },
        "craft_and_micro_layout": {
            "button_padding_violations": btn_violations,
            "grid_equality_violations": grid_violations,
        },
        "artifacts": {
            "reference_png": ref_path,
            "rendered_png": rendered_path,
            "overlay_png": overlay_path,
            "diff_mask_png": diff_mask_path,
            "side_by_side_png": side_by_side_path,
        },
    })

scores = [sa["s_total"] for sa in screen_audits]
mean_score = round(sum(scores) / max(1, len(scores)), 4)
min_score = round(min(scores) if scores else 0.0, 4)
all_screens_passed = all(sa["passed"] for sa in screen_audits) and mean_score >= target_score

summary = {
    "status": "PASSED" if all_screens_passed else "NEEDS_REFINEMENT",
    "passed": all_screens_passed,
    "screen_count": len(screen_audits),
    "target_mean_score": target_score,
    "min_screen_score_threshold": min_screen_score,
    "mean_s_total": mean_score,
    "min_s_total": min_score,
    "total_collisions": sum(sa["dom_integrity"]["collision_count"] for sa in screen_audits),
    "total_overflow_px": sum(sa["dom_integrity"]["horizontal_overflow_px"] for sa in screen_audits),
    "total_clipped_text": sum(sa["dom_integrity"]["clipped_text_count"] for sa in screen_audits),
    "total_broken_media": sum(sa["dom_integrity"]["broken_media_count"] for sa in screen_audits),
    "total_button_padding_violations": sum(sa["craft_and_micro_layout"]["button_padding_violations"] for sa in screen_audits),
    "total_grid_equality_violations": sum(sa["craft_and_micro_layout"]["grid_equality_violations"] for sa in screen_audits),
    "screens": screen_audits,
    "remediation_directives": all_remediations[:30],
}

out_audit = os.path.join(workspace_dir, "multi_screen_audit.json")
with open(out_audit, "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)

print(json.dumps(summary, indent=2))
`;

function getDimensions(pngPath) {
  const out = execFileSync("/usr/bin/magick", ["identify", "-format", "%w %h", pngPath], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .trim()
    .split(/\s+/);
  return [parseInt(out[0], 10) || 1440, parseInt(out[1], 10) || 900];
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.project) {
    console.error("Usage: node eval-multi-screen-project.mjs --project=<dir> [--spec=<nano_banana_spec.json> | --references=a.png,b.png]");
    process.exit(1);
  }

  const projectDir = path.resolve(args.project);
  const workspaceDir = path.resolve(
    args.workspace || path.join(projectDir, ".multi_eval_work")
  );
  fs.mkdirSync(workspaceDir, { recursive: true });

  let rawScreens = [];
  if (args.spec && fs.existsSync(args.spec)) {
    const specData = JSON.parse(fs.readFileSync(args.spec, "utf-8"));
    rawScreens = (specData.screens || []).map((s, idx) => ({
      index: idx,
      screen_id: s.screen_id || `screen-${String(idx + 1).padStart(2, "0")}`,
      reference_png: s.normalized_mockup || s.source_image,
      width: s.width,
      height: s.height,
      scroll_y: s.scroll_y || 0,
    }));
  } else if (args.references.length > 0) {
    rawScreens = args.references.map((ref, idx) => {
      const absRef = path.resolve(ref);
      const [w, h] = getDimensions(absRef);
      return {
        index: idx,
        screen_id: `screen-${String(idx + 1).padStart(2, "0")}`,
        reference_png: absRef,
        width: w,
        height: h,
        scroll_y: 0,
      };
    });
  } else if (args.screenshotsDir && fs.existsSync(args.screenshotsDir)) {
    const files = fs
      .readdirSync(args.screenshotsDir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort();
    rawScreens = files.map((f, idx) => {
      const absRef = path.resolve(args.screenshotsDir, f);
      const [w, h] = getDimensions(absRef);
      return {
        index: idx,
        screen_id: `screen-${String(idx + 1).padStart(2, "0")}`,
        reference_png: absRef,
        width: w,
        height: h,
        scroll_y: 0,
      };
    });
  } else {
    throw new Error("Provide --spec, --references, or --screenshots-dir.");
  }

  const htmlPath = ensureProjectBuilt(projectDir, args.skipBuild);
  const origHtml = fs.readFileSync(htmlPath, "utf-8");
  const injectedHtml = origHtml.includes("</head>")
    ? origHtml.replace("</head>", `<script>${DOM_PROBE_JS}</script></head>`)
    : `<script>${DOM_PROBE_JS}</script>${origHtml}`;

  const tmpHtmlPath = path.join(path.dirname(htmlPath), `.multi_eval_probe_${process.pid}.html`);
  fs.writeFileSync(tmpHtmlPath, injectedHtml, "utf-8");

  const screens = rawScreens.map((sc) => {
    const sid = sc.screen_id;
    return {
      ...sc,
      rendered_png: path.join(workspaceDir, `rendered_${sid}.png`),
      overlay_png: path.join(workspaceDir, `overlay_${sid}.png`),
      diff_mask_png: path.join(workspaceDir, `diff_mask_${sid}.png`),
      side_by_side_png: path.join(workspaceDir, `side_by_side_${sid}.png`),
    };
  });

  const jobsConfigPath = path.join(workspaceDir, `.jobs_config_${process.pid}.json`);
  fs.writeFileSync(
    jobsConfigPath,
    JSON.stringify(
      {
        html_path: tmpHtmlPath,
        workspace_dir: workspaceDir,
        target_score: args.targetScore,
        min_screen_score: args.minScreenScore,
        screens,
      },
      null,
      2
    ),
    "utf-8"
  );

  try {
    const auditRaw = execFileSync(
      "xvfb-run",
      ["-a", "python3", "-c", PYTHON_MULTI_SCREEN_EVAL, jobsConfigPath],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 20 * 1024 * 1024 }
    );
    console.log(auditRaw);
    const audit = JSON.parse(auditRaw);
    if (args.failOnNonPass && !audit.passed) {
      process.exit(1);
    }
  } finally {
    try {
      fs.unlinkSync(tmpHtmlPath);
      fs.unlinkSync(jobsConfigPath);
    } catch {}
  }
}

main();
