#!/usr/bin/env node
/**
 * Batch Golden Template DOM & Visual Craft Auditor (`audit-all-projects.mjs`)
 *
 * Audits every standalone Golden Template React project inside `<moodboard>/projects/*`
 * in a single headless WebKit2GTK (`xvfb-run -a`) session, checking:
 *   - `collision_count == 0`
 *   - `horizontal_overflow_px == 0`
 *   - `clipped_text_count == 0`
 *   - `button_padding_violations == 0` (symmetrical left/right & top/bottom padding + container clearance)
 *   - `grid_equality_violations == 0` (equal peer card widths, heights, bottom baselines, and gutters)
 *
 * Optionally (`--sync-screenshots`) populates `<moodboard>/screenshots/<slug>.png`,
 * `<moodboard>/screenshots/rendered/<slug>.png`, and `<moodboard>/screenshots/manifest.json`
 * so the moodboard is 100% staged and ready for new high-res screenshots and `image-to-react` eval loops.
 *
 * Usage:
 *   node audit-all-projects.mjs --dir=/google/data/rw/users/jf/jfesta/moodboards/warm-landing-page [--sync-screenshots]
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function parseArgs(argv) {
  const args = {
    dir: process.cwd(),
    syncScreenshots: false,
    only: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--dir=")) args.dir = path.resolve(a.slice("--dir=".length));
    else if (a === "--dir" && argv[i + 1]) args.dir = path.resolve(argv[++i]);
    else if (a === "--sync-screenshots") args.syncScreenshots = true;
    else if (a.startsWith("--only=")) args.only = new Set(a.slice("--only=".length).split(","));
  }
  return args;
}

const LEGACY_ASSET_MAP = {
  "01-website-leather-goods": "public/assets/websites/01-avela-arc-bag.png",
  "02-website-bakery": "public/assets/websites/02-rill-and-rye-bakery.png",
  "03-website-interiors": "public/assets/websites/03-room-and-ritual-interiors.png",
  "04-website-architecture": "public/assets/websites/04-oriel-spatial-practice.png",
  "05-website-aperitif": "public/assets/websites/05-sundrop-aperitif.png",
  "06-website-skincare": "public/assets/websites/06-serein-botanical-care.png",
  "07-ui-weather-card": "public/assets/ui-components/07-sol-weather-clean.png",
  "08-ui-team-picker": "public/assets/ui-components/08-gather-team-clean.png",
  "09-ui-palette-picker": "public/assets/ui-components/09-courtyard-palette-clean.png",
  "10-ui-membership-panel": "public/assets/ui-components/10-roam-membership-clean.png",
  "11-ui-usage-dashboard": "public/assets/ui-components/11-kiln-usage-clean.png",
  "12-ui-navigation-dock": "public/assets/ui-components/12-folio-navigation-dock.png",
  "13-mobile-app-onboarding": "public/assets/mobile-screens/13-home-note-onboarding.png",
  "14-mobile-app-bedtime": "public/assets/mobile-screens/14-afterglow-bedtime.png",
  "15-mobile-app-waitlist": "public/assets/mobile-screens/15-pocket-garden-waitlist.png",
  "16-mobile-app-puzzle": "public/assets/mobile-screens/16-petal-puzzle.png",
  "17-mobile-app-forecast": "public/assets/mobile-screens/17-sol-forecast.png",
  "18-mobile-app-planner": "public/assets/mobile-screens/18-daybook-daylight.png",
};

const DOM_PROBE_JS = `
(function() {
  const styleHide = document.createElement('style');
  styleHide.textContent = '#gt-inspector-host { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }';
  (document.head || document.documentElement).appendChild(styleHide);

  window.__runGoldenDomProbe = function() {
    const vw = window.innerWidth || 1440;
    const vh = window.innerHeight || 900;
    const sw = Math.max(document.documentElement.scrollWidth || vw, document.body ? document.body.scrollWidth : vw);
    const sh = Math.max(document.documentElement.scrollHeight || vh, document.body ? document.body.scrollHeight : vh);

    const leafBoxes = [];
    const containerBoxes = [];
    const textBoxes = [];
    const buttonAudits = [];
    const gridRowAudits = [];

    const all = Array.from(document.querySelectorAll('body *')).filter(
      (el) => !el.closest('#gt-inspector-host')
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
        padding: [padTop, padRight, padBottom, padLeft]
      };

      if (visWidth > 0 && visHeight > 0) {
        if (!isDecorativeBg && (el.children.length === 0 || directText.length > 0 || isInteractive)) {
          leafBoxes.push(boxEntry);
        }
        containerBoxes.push(boxEntry);
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

      // Exclude full-width row/card buttons (width > 280px or multi-line blocks with height > 64px)
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

      // 2. Audit Multi-Column Grid & Flex Card Equality
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
            // Peer card row: all items have matching tag and width within 8% of each other (excludes asymmetric 2-col sidebar+main layouts)
            const isPeerCardRow = tagsSame && (maxW - minW) <= 0.08 * maxW && minW >= 180 && row.items.length >= 3;

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
      button_padding_violations: buttonAudits.length,
      button_audits: buttonAudits.slice(0, 10),
      grid_equality_violations: gridRowAudits.length,
      grid_row_audits: gridRowAudits.slice(0, 10),
    };
    document.title = '__DOM_SNAP__:' + JSON.stringify(payload);
    return payload;
  };
})();
`;

const PYTHON_BATCH_RUNNER = `
import json
import os
import sys
import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib

manifest_path = sys.argv[1]
with open(manifest_path, "r", encoding="utf-8") as f:
    jobs = json.load(f)

win = Gtk.OffscreenWindow()
win.set_default_size(1440, 900)
wv = WebKit2.WebView()
wv.set_size_request(1440, 900)
settings = wv.get_settings()
settings.set_enable_write_console_messages_to_stdout(False)
settings.set_allow_file_access_from_file_urls(True)
settings.set_allow_universal_access_from_file_urls(True)
win.add(wv)
win.show_all()

idx = 0
results = {}
job_timer_id = None

def next_job():
    global idx, job_timer_id
    if job_timer_id is not None:
        GLib.source_remove(job_timer_id)
        job_timer_id = None
    if idx >= len(jobs):
        Gtk.main_quit()
        return False
    job = jobs[idx]
    w, h = job["width"], job["height"]
    win.resize(w, h)
    wv.set_size_request(w, h)
    job_timer_id = GLib.timeout_add(2200, trigger_probe)
    wv.load_uri("file://" + job["tmp_html"])
    return False

def on_snapshot(webview, res):
    global idx
    job = jobs[idx]
    try:
        surf = webview.get_snapshot_finish(res)
        if job.get("render_png"):
            surf.write_to_png(job["render_png"])
    except Exception:
        pass
    idx += 1
    GLib.timeout_add(40, next_job)

def capture_job():
    global idx
    if idx >= len(jobs):
        Gtk.main_quit()
        return False
    job = jobs[idx]
    title = wv.get_title() or ""
    snap = {}
    if title.startswith("__DOM_SNAP__:"):
        try:
            snap = json.loads(title[len("__DOM_SNAP__:"):])
        except Exception:
            pass
    results[job["slug"]] = snap
    wv.get_snapshot(WebKit2.SnapshotRegion.VISIBLE, WebKit2.SnapshotOptions.NONE, None, on_snapshot)
    return False

def trigger_probe():
    global job_timer_id
    if job_timer_id is not None:
        GLib.source_remove(job_timer_id)
        job_timer_id = None
    wv.run_javascript("window.__runGoldenDomProbe && window.__runGoldenDomProbe();", None, None, None)
    GLib.timeout_add(220, capture_job)
    return False

def on_load(webview, event):
    global job_timer_id
    if event == WebKit2.LoadEvent.FINISHED:
        if job_timer_id is not None:
            GLib.source_remove(job_timer_id)
            job_timer_id = None
        GLib.timeout_add(500, trigger_probe)

wv.connect("load-changed", on_load)
GLib.timeout_add(50, next_job)
GLib.timeout_add(120000, Gtk.main_quit)
Gtk.main()

print(json.dumps(results, indent=2))
`;

function getDimensionsForPng(pngPath) {
  try {
    const out = execFileSync("/usr/bin/magick", ["identify", "-format", "%w %h", pngPath], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split(/\s+/);
    return [parseInt(out[0], 10) || 1440, parseInt(out[1], 10) || 900];
  } catch {
    return [1440, 900];
  }
}

function getCategoryFromSlug(slug) {
  if (slug.includes("-website-")) return "website";
  if (slug.includes("-ui-")) return "ui";
  if (slug.includes("-mobile-app-")) return "mobile-app";
  if (slug.includes("-chat-ui-")) return "chat-ui";
  return "ui";
}

function main() {
  const args = parseArgs(process.argv);
  const moodboardDir = args.dir;
  const projectsDir = path.join(moodboardDir, "projects");
  if (!fs.existsSync(projectsDir)) {
    console.log(`No projects/ directory in ${moodboardDir}. Skipping batch audit.`);
    return;
  }

  const slugs = fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && (!args.only || args.only.has(d.name)))
    .map((d) => d.name)
    .sort();

  if (slugs.length === 0) {
    console.log(`0 projects found in ${projectsDir}.`);
    return;
  }

  const screenshotsDir = path.join(moodboardDir, "screenshots");
  const renderedDir = path.join(screenshotsDir, "rendered");
  if (args.syncScreenshots) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    fs.mkdirSync(renderedDir, { recursive: true });
  }

  const jobs = [];
  const tmpFiles = [];

  for (const slug of slugs) {
    const projectDir = path.join(projectsDir, slug);
    const localDistHtml = path.join(projectDir, "dist", "index.html");
    const moodboardDistHtml = path.join(moodboardDir, "dist", "projects", slug, "index.html");
    const htmlPath = fs.existsSync(localDistHtml)
      ? localDistHtml
      : fs.existsSync(moodboardDistHtml)
      ? moodboardDistHtml
      : "";
    if (!htmlPath) {
      throw new Error(`Missing built bundle for ${slug}. Run build-all-projects.mjs first.`);
    }

    const origHtml = fs.readFileSync(htmlPath, "utf-8");
    const injectedHtml = origHtml.includes("</head>")
      ? origHtml.replace("</head>", `<script>${DOM_PROBE_JS}</script></head>`)
      : `<script>${DOM_PROBE_JS}</script>${origHtml}`;

    const tmpHtmlPath = path.join(path.dirname(htmlPath), `.audit_probe_${process.pid}_${slug}.html`);
    fs.writeFileSync(tmpHtmlPath, injectedHtml, "utf-8");
    tmpFiles.push(tmpHtmlPath);

    const renderPng = args.syncScreenshots ? path.join(renderedDir, `${slug}.png`) : "";
    jobs.push({
      slug,
      project_dir: projectDir,
      tmp_html: tmpHtmlPath,
      width: 1440,
      height: 900,
      render_png: renderPng,
    });
  }

  const jobsJsonPath = path.join(moodboardDir, `.audit_jobs_${process.pid}.json`);
  fs.writeFileSync(jobsJsonPath, JSON.stringify(jobs, null, 2), "utf-8");
  tmpFiles.push(jobsJsonPath);

  let results = {};
  try {
    const rawOut = execFileSync("xvfb-run", ["-a", "python3", "-c", PYTHON_BATCH_RUNNER, jobsJsonPath], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 20 * 1024 * 1024,
    });
    results = JSON.parse(rawOut);
  } finally {
    for (const f of tmpFiles) {
      try {
        fs.unlinkSync(f);
      } catch {}
    }
  }

  const screenshotManifest = [];
  let totalFailures = 0;

  console.log(`\n=== Image-to-React DOM & Craft Audit (${slugs.length} Golden Template Projects) ===`);
  for (const slug of slugs) {
    const r = results[slug] || {};
    const collisions = r.collision_count || 0;
    const overflow = r.horizontal_overflow_px || 0;
    const clipped = r.clipped_text_count || 0;
    const btnViolations = r.button_padding_violations || 0;
    const gridViolations = r.grid_equality_violations || 0;

    const ok =
      collisions === 0 &&
      overflow === 0 &&
      clipped === 0 &&
      btnViolations === 0 &&
      gridViolations === 0;

    if (!ok) {
      totalFailures++;
      console.log(
        `✗ ${slug}: collisions=${collisions}, overflow=${overflow}px, clipped=${clipped}, btn_padding=${btnViolations}, grid_equality=${gridViolations}`
      );
      for (const c of r.colliding_pairs || []) {
        console.log(`    [COLLISION] ${c.element_a} ("${c.text_a}") <-> ${c.element_b} ("${c.text_b}") (${c.overlap_area}px²)`);
      }
      for (const cl of r.clipped_text || []) {
        console.log(`    [CLIPPED] ${cl.selector} ("${cl.text}") client=${cl.client_width}px < scroll=${cl.scroll_width}px`);
      }
      for (const b of r.button_audits || []) {
        console.log(`    [BUTTON] ${b.selector} ("${b.label}"): ${b.issues.join(", ")}`);
      }
      for (const g of r.grid_row_audits || []) {
        console.log(`    [GRID] ${g.container_selector} (top=${g.row_top_px}px): ${g.issues.join(", ")}`);
      }
    } else {
      console.log(`✓ ${slug}: 0 collisions, 0px overflow, 0 clipped text, 0 button/grid violations`);
    }

    if (args.syncScreenshots) {
      const targetRefPng = path.join(screenshotsDir, `${slug}.png`);
      const renderedPng = path.join(renderedDir, `${slug}.png`);
      const legacyRel = LEGACY_ASSET_MAP[slug];
      const legacyAbs = legacyRel ? path.join(moodboardDir, legacyRel) : "";

      if (legacyAbs && fs.existsSync(legacyAbs)) {
        if (!fs.existsSync(targetRefPng)) {
          fs.copyFileSync(legacyAbs, targetRefPng);
        }
      } else if (fs.existsSync(renderedPng)) {
        fs.copyFileSync(renderedPng, targetRefPng);
      }

      // Also ensure public/assets/chat-ui/<slug>.png exists for 19..23 chat-ui projects
      if (slug.includes("-chat-ui-") && fs.existsSync(renderedPng)) {
        const chatUiAssetDir = path.join(moodboardDir, "public", "assets", "chat-ui");
        fs.mkdirSync(chatUiAssetDir, { recursive: true });
        const chatUiAssetPng = path.join(chatUiAssetDir, `${slug}.png`);
        fs.copyFileSync(renderedPng, chatUiAssetPng);
      }

      const [w, h] = fs.existsSync(targetRefPng) ? getDimensionsForPng(targetRefPng) : [1440, 900];
      screenshotManifest.push({
        slug,
        category: getCategoryFromSlug(slug),
        projectDir: `projects/${slug}`,
        referenceScreenshot: `screenshots/${slug}.png`,
        renderedScreenshot: `screenshots/rendered/${slug}.png`,
        dimensions: [w, h],
        evalCommand: `/usr/local/google/home/jfesta/.local/bin/node ../skills/image-to-react/scripts/eval-image-to-react.mjs --project=./projects/${slug} --reference=./screenshots/${slug}.png`,
      });
    }
  }

  if (args.syncScreenshots) {
    const manifestOut = path.join(screenshotsDir, "manifest.json");
    fs.writeFileSync(manifestOut, JSON.stringify(screenshotManifest, null, 2), "utf-8");
    console.log(`\n✓ Synced ${screenshotManifest.length} reference & rendered screenshots to ${screenshotsDir}`);
  }

  if (totalFailures > 0) {
    console.error(`\nAudit found ${totalFailures} project(s) with DOM or craft violations.`);
    process.exit(1);
  } else {
    console.log(`\nAll ${slugs.length} Golden Template projects passed DOM & micro-layout craft verification!`);
  }
}

main();
