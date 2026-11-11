#!/usr/bin/env node
import os from "node:os";
/**
 * Responsiveness Dual-Breakpoint & 6-Viewport Continuum Evaluator (`eval-responsive-pair.mjs`)
 *
 * Canonical evaluator for `skills/responsiveness/`.
 * Evaluates ONE unified responsive Golden Template React website (`projects/<slug>`)
 * simultaneously against:
 *   1. Desktop reference (`desktop.png`) at native CSS width (`1440px` or `1536px`)
 *   2. Mobile reference (`mobile.png`) at `@2x`-adjusted CSS width (`390px`..`432px`)
 *   3. 6-Viewport Fluid Responsive Continuum (`320px`, `375px`, `mobile`, `768px`, `1024px`, `desktop`)
 *   4. Single Unified Responsive DOM Anti-Bifurcation Gate (blocks duplicate desktop/mobile page trees)
 *
 * Runs 100% offline inside the standard sandbox (`BypassSandbox: false`).
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SKILLS_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const HOME_ROOT = path.resolve(SKILLS_ROOT, "..");
const WDA_WORK_ROOT = path.join(HOME_ROOT, "moodboards", "wda");
const LINTER_SCRIPT = path.join(SKILLS_ROOT, "golden-template", "scripts", "lint-golden-template.mjs");
const DEFAULT_OUT_ROOT =
  path.join(os.tmpdir(), "responsiveness-eval");

function parseArgs(argv) {
  const args = {
    brand: "",
    projectDir: "",
    desktopRef: "",
    mobileRef: "",
    desktopCssWidth: 0,
    mobileCssWidth: 0,
    outDir: "",
    targetScore: 0.85,
    maxHeightDeltaPct: 8.0,
    screen: 0,
    screenId: "",
    skipBuild: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--brand=")) args.brand = a.slice("--brand=".length);
    else if (a === "--brand" && argv[i + 1]) args.brand = argv[++i];
    else if (a.startsWith("--project-dir=")) args.projectDir = a.slice("--project-dir=".length);
    else if (a.startsWith("--desktop-ref=")) args.desktopRef = a.slice("--desktop-ref=".length);
    else if (a.startsWith("--mobile-ref=")) args.mobileRef = a.slice("--mobile-ref=".length);
    else if (a.startsWith("--desktop-css-width=")) args.desktopCssWidth = parseInt(a.slice("--desktop-css-width=".length), 10);
    else if (a.startsWith("--mobile-css-width=")) args.mobileCssWidth = parseInt(a.slice("--mobile-css-width=".length), 10);
    else if (a.startsWith("--out-dir=")) args.outDir = a.slice("--out-dir=".length);
    else if (a === "--out-dir" && argv[i + 1]) args.outDir = argv[++i];
    else if (a.startsWith("--target-score=")) args.targetScore = parseFloat(a.slice("--target-score=".length));
    else if (a.startsWith("--max-height-delta=")) args.maxHeightDeltaPct = parseFloat(a.slice("--max-height-delta=".length));
    else if (a.startsWith("--screen=")) args.screen = parseInt(a.slice("--screen=".length), 10);
    else if (a.startsWith("--screen-id=")) args.screenId = a.slice("--screen-id=".length);
    else if (a === "--skip-build") args.skipBuild = true;
  }
  return args;
}

function identifyPngDimensions(imgPath) {
  const out = execFileSync("/usr/bin/magick", ["identify", "-format", "%w %h", imgPath], {
    encoding: "utf8",
  })
    .trim()
    .split(/\s+/);
  return { width: parseInt(out[0], 10), height: parseInt(out[1], 10) };
}

const DOM_PROBE_JS = `
(function() {
  const styleHide = document.createElement('style');
  styleHide.textContent = '#gt-inspector-host, .gt-eval-hide { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; } *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
  (document.head || document.documentElement).appendChild(styleHide);

  function isElementVisible(el) {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const st = window.getComputedStyle(cur);
      if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity || '1') === 0) {
        return false;
      }
      cur = cur.parentElement;
    }
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  }

  function describeElement(el) {
    const tag = el.tagName.toLowerCase();
    const cls = (el.className && typeof el.className === 'string')
      ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.')
      : '';
    return tag + (el.id ? '#' + el.id : cls);
  }

  window.__runGoldenDomProbe = function() {
    const vw = window.innerWidth || 1280;
    const vh = window.innerHeight || 800;
    const sw = Math.max(document.documentElement.scrollWidth || vw, document.body ? document.body.scrollWidth : vw);
    const sh = Math.max(document.documentElement.scrollHeight || vh, document.body ? document.body.scrollHeight : vh);

    // Name the elements whose boxes extend past the viewport's right edge so the developer gets a selector, not just a px count.
    const overflowOffenders = [];
    if (sw - vw >= 1) {
      for (const el of Array.from(document.querySelectorAll('body *'))) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 0.5 && getComputedStyle(el).position !== 'fixed') {
          const txt = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 24);
          overflowOffenders.push({
            selector: describeElement(el),
            right_px: Math.round(r.right),
            over_by_px: Math.round(r.right - vw),
            text: txt,
          });
        }
      }
      overflowOffenders.sort((a, b) => b.over_by_px - a.over_by_px);
    }

    const leafBoxes = [];
    const buttonAudits = [];
    const gridRowAudits = [];

    // Anti-bifurcation audit: check primary h1/h2 headings outside closed dialogs/disclosures
    const structuralHeadings = Array.from(document.querySelectorAll('#root h1, #root h2')).filter((h) => {
      if (h.closest('#gt-inspector-host') || h.closest('.gt-eval-hide')) return false;
      if (h.closest('[role="dialog"]') || h.closest('dialog')) return false;
      const closedDetails = h.closest('details:not([open])');
      if (closedDetails) return false;
      if (h.getAttribute('aria-hidden') === 'true') return false;
      return true;
    });
    const visibleHeadings = structuralHeadings.filter((h) => isElementVisible(h));
    const headingVisibilityRatio = structuralHeadings.length > 0
      ? Number((visibleHeadings.length / structuralHeadings.length).toFixed(3))
      : 1;

    const all = Array.from(document.querySelectorAll('body *')).filter(
      (el) => !el.closest('#gt-inspector-host') && !el.closest('.gt-eval-hide')
    );
    const nodeMap = new Map();
    all.forEach((el, idx) => nodeMap.set(el, 'node_' + idx));

    all.forEach((el, idx) => {
      if (!isElementVisible(el)) return;
      const style = window.getComputedStyle(el);

      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || 0;
      const scrollX = window.scrollX || 0;
      const docLeft = rect.left + scrollX;
      const docTop = rect.top + scrollY;
      const docRight = rect.right + scrollX;
      const docBottom = rect.bottom + scrollY;

      const tag = el.tagName.toLowerCase();
      if (el instanceof SVGElement && tag !== 'svg') return;

      const cls = (el.className && typeof el.className === 'string')
        ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.')
        : '';
      const sel = tag + (el.id ? '#' + el.id : (cls || '.' + idx));
      const nodeId = nodeMap.get(el);

      const ancestorIds = [];
      let isDecorativeBg =
        el.getAttribute('aria-hidden') === 'true' ||
        el.getAttribute('data-photo-frame') === 'true' ||
        style.pointerEvents === 'none' ||
        tag === 'svg' ||
        tag === 'img' ||
        tag === 'picture' ||
        tag === 'video';

      let p = el.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        if (nodeMap.has(p)) ancestorIds.push(nodeMap.get(p));
        const ps = window.getComputedStyle(p);
        if (p.getAttribute('aria-hidden') === 'true' || ps.pointerEvents === 'none') {
          isDecorativeBg = true;
        }
        p = p.parentElement;
      }

      let directText = '';
      for (const child of el.childNodes) {
        if (child.nodeType === 3 && child.textContent && child.textContent.trim()) {
          directText += child.textContent.trim() + ' ';
        }
      }
      directText = directText.trim();

      const w = Math.max(0, docRight - docLeft);
      const h = Math.max(0, docBottom - docTop);

      const isTextClipped = directText.length > 0 &&
        (style.overflowX === 'hidden' || style.textOverflow === 'ellipsis') &&
        el.scrollWidth > el.clientWidth + 4;

      if (directText.length > 0 || tag === 'button' || tag === 'input') {
        leafBoxes.push({
          id: nodeId,
          selector: sel,
          tag,
          text: directText.slice(0, 50),
          bbox: [docLeft, docTop, w, h],
          ancestorIds,
          isDecorativeBg,
          position: style.position,
          isClipped: isTextClipped,
        });
      }

      // Check Button Padding Symmetry on real text CTA buttons/pills
      const labelText = (directText || (el.children.length <= 3 ? (el.textContent || '').trim() : '')).trim();
      const alphaCount = labelText.replace(/[^a-zA-Z]/g, '').length;
      const hasVisibleBox =
        (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') ||
        (parseFloat(style.borderTopWidth || '0') > 0 && parseFloat(style.borderLeftWidth || '0') > 0);
      if ((tag === 'button' || (tag === 'a' && hasVisibleBox)) && hasVisibleBox && alphaCount >= 3 && w >= 64 && w <= 340 && h >= 28 && h <= 72) {
        const pl = parseFloat(style.paddingLeft || '0');
        const pr = parseFloat(style.paddingRight || '0');
        const pt = parseFloat(style.paddingTop || '0');
        const pb = parseFloat(style.paddingBottom || '0');
        const issues = [];
        if (pl < 10 || pr < 10) issues.push('tight horizontal padding (' + Math.round(pl) + 'px/' + Math.round(pr) + 'px)');
        if (Math.abs(pl - pr) > 12) issues.push('asymmetric horizontal padding (' + Math.round(pl) + 'px vs ' + Math.round(pr) + 'px)');
        if (Math.abs(pt - pb) > 6) issues.push('asymmetric vertical padding (' + Math.round(pt) + 'px vs ' + Math.round(pb) + 'px)');
        if (issues.length > 0) {
          buttonAudits.push({ selector: sel, label: labelText.slice(0, 30), issues });
        }
      }

      // Check CSS Grid Equal-Column Row Alignment (for symmetric 1fr grids)
      if (style.display === 'grid') {
        const children = Array.from(el.children).filter((c) => {
          const cs = window.getComputedStyle(c);
          return cs.display !== 'none' && cs.position !== 'absolute';
        });
        if (children.length >= 2) {
          const rows = new Map();
          children.forEach((c) => {
            const cr = c.getBoundingClientRect();
            const rTop = Math.round((cr.top + scrollY) / 8) * 8;
            if (!rows.has(rTop)) rows.set(rTop, []);
            rows.get(rTop).push(cr);
          });
          rows.forEach((rects, rowTop) => {
            if (rects.length >= 2) {
              const widths = rects.map((r) => r.width);
              const maxW = Math.max(...widths);
              const minW = Math.min(...widths);
              if (maxW - minW > 4 && (maxW - minW) / Math.max(1, maxW) < 0.16) {
                gridRowAudits.push({
                  container_selector: sel,
                  row_top_px: rowTop,
                  issues: ['nearly-equal grid columns drift by ' + Math.round(maxW - minW) + 'px'],
                });
              }
            }
          });
        }
      }
    });

    // Check Non-Ancestor Leaf Collisions
    const collidingPairs = [];
    for (let i = 0; i < leafBoxes.length; i++) {
      const a = leafBoxes[i];
      if (a.isDecorativeBg || a.bbox[2] <= 2 || a.bbox[3] <= 2) continue;
      for (let j = i + 1; j < leafBoxes.length; j++) {
        const b = leafBoxes[j];
        if (b.isDecorativeBg || b.bbox[2] <= 2 || b.bbox[3] <= 2) continue;
        if (a.ancestorIds.includes(b.id) || b.ancestorIds.includes(a.id)) continue;
        if (a.position === 'fixed' || b.position === 'fixed') continue;
        const ix = Math.max(0, Math.min(a.bbox[0] + a.bbox[2], b.bbox[0] + b.bbox[2]) - Math.max(a.bbox[0], b.bbox[0]));
        const iy = Math.max(0, Math.min(a.bbox[1] + a.bbox[3], b.bbox[1] + b.bbox[3]) - Math.max(a.bbox[1], b.bbox[1]));
        const area = ix * iy;
        if (area > 24) {
          collidingPairs.push({
            element_a: a.selector + (a.text ? ' ("' + a.text.slice(0, 20) + '")' : ''),
            element_b: b.selector + (b.text ? ' ("' + b.text.slice(0, 20) + '")' : ''),
            overlap_area: Math.round(area),
          });
        }
      }
    }

    const clippedText = leafBoxes.filter((b) => b.isClipped).map((b) => b.selector + ': ' + b.text);
    const payload = {
      viewport: { inner_width: vw, inner_height: vh, scroll_width: sw, scroll_height: sh },
      horizontal_overflow_px: Math.max(0, Math.round(sw - vw)),
      overflow_offenders: overflowOffenders.slice(0, 6),
      collision_count: collidingPairs.length,
      colliding_pairs: collidingPairs.slice(0, 8),
      clipped_text_count: clippedText.length,
      clipped_text: clippedText.slice(0, 8),
      button_padding_violations: buttonAudits.length,
      button_audits: buttonAudits.slice(0, 8),
      grid_equality_violations: gridRowAudits.length,
      grid_row_audits: gridRowAudits.slice(0, 8),
      headings_audit: {
        total_structural_h1_h2: structuralHeadings.length,
        visible_h1_h2: visibleHeadings.length,
        visibility_ratio: headingVisibilityRatio,
      },
    };
    document.title = '__DOM_SNAP__:' + JSON.stringify(payload);
    return payload;
  };
})();
`;

const PYTHON_RESPONSIVE_EVAL = `
import json, math, os, subprocess, sys
import cairo
import gi
gi.require_version("Gtk", "3.0")
gi.require_version("WebKit2", "4.1")
from gi.repository import Gtk, WebKit2, GLib

html_path = sys.argv[1]
cfg_path = sys.argv[2]
out_root = sys.argv[3]

with open(cfg_path, "r", encoding="utf-8") as f:
    job = json.load(f)

target_score = float(job["target_score"])
max_height_delta_pct = float(job["max_height_delta_pct"])

def render_and_probe(css_w, fold_h, out_png_path):
    win = Gtk.OffscreenWindow()
    win.set_default_size(css_w, fold_h)
    wv = WebKit2.WebView()
    wv.set_size_request(css_w, fold_h)
    settings = wv.get_settings()
    settings.set_enable_write_console_messages_to_stdout(False)
    settings.set_allow_file_access_from_file_urls(True)
    settings.set_allow_universal_access_from_file_urls(True)
    win.add(wv)
    win.show_all()

    state = {"dom": {}, "poll_count": 0}

    def on_snap(webview, res):
        surf = webview.get_snapshot_finish(res)
        if out_png_path:
            surf.write_to_png(out_png_path)
        state["snap_w"] = surf.get_width()
        state["snap_h"] = surf.get_height()
        Gtk.main_quit()

    def take_final_snap():
        if out_png_path:
            wv.get_snapshot(WebKit2.SnapshotRegion.FULL_DOCUMENT, WebKit2.SnapshotOptions.NONE, None, on_snap)
        else:
            Gtk.main_quit()
        return False

    def finish_without_snap():
        title = wv.get_title() or ""
        if title.startswith("__DOM_SNAP__:"):
            try:
                state["dom"] = json.loads(title[len("__DOM_SNAP__:"):])
            except Exception:
                pass
            GLib.timeout_add(220, take_final_snap)
            return False
        state["poll_count"] += 1
        if state["poll_count"] < 45:
            return True
        GLib.timeout_add(220, take_final_snap)
        return False

    def probe():
        scr_idx = int(job.get("screen", 0) or 0)
        scr_id = str(job.get("screen_id", "") or "")
        scr_js = ""
        if scr_idx != 0 or scr_id:
            scr_js = f"if (window.__setGoldenEvalScreen) window.__setGoldenEvalScreen({scr_idx}, {json.dumps(scr_id)}); window.scrollTo(0, 0); "
        wv.run_javascript(
            scr_js + "setTimeout(() => { Array.from(document.querySelectorAll('img[loading=\\"lazy\\"]')).forEach(i => { i.loading = 'eager'; i.removeAttribute('loading'); }); Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), ...Array.from(document.images).map(i => i.decode ? i.decode().catch(()=>{}) : Promise.resolve())]).finally(() => { requestAnimationFrame(() => requestAnimationFrame(() => { if (window.__runGoldenDomProbe) window.__runGoldenDomProbe(); })); }); }, " + ("220" if scr_js else "0") + ");",
            None, None, None
        )
        GLib.timeout_add(340 if scr_js else 120, finish_without_snap)
        return False

    def on_load(webview, ev):
        if ev == WebKit2.LoadEvent.FINISHED:
            GLib.timeout_add(750, probe)

    wv.connect("load-changed", on_load)
    q_extra = ""
    if int(job.get("screen", 0) or 0) != 0 or str(job.get("screen_id", "") or ""):
        q_extra = f"&screen={int(job.get('screen', 0) or 0)}&screenId={job.get('screen_id', '')}&page={job.get('screen_id', '')}"
    wv.load_uri("file://" + os.path.abspath(html_path) + "?gt_eval=1" + q_extra)
    tid = GLib.timeout_add(14000, lambda: (Gtk.main_quit(), False)[1])
    Gtk.main()
    try:
        GLib.source_remove(tid)
    except Exception:
        pass
    win.destroy()
    return state

def evaluate_breakpoint(name, cfg):
    bp_dir = os.path.join(out_root, name)
    os.makedirs(bp_dir, exist_ok=True)

    ref_src = cfg["reference_png"]
    ref_png = os.path.join(bp_dir, "mockup.png")
    subprocess.check_call(["/usr/bin/magick", ref_src, "-strip", ref_png])

    ref_w = int(cfg["ref_width"])
    ref_h = int(cfg["ref_height"])
    css_w = int(cfg["css_width"])
    fold_h = int(cfg["window_fold_height"])

    raw_render = os.path.join(bp_dir, "rendered_css.png")
    st = render_and_probe(css_w, fold_h, raw_render)
    dom = st.get("dom") or {}

    # Uniformly scale width to ref_w WITHOUT squashing Y!
    rendered_scaled = os.path.join(bp_dir, "rendered.png")
    subprocess.check_call([
        "/usr/bin/magick", raw_render,
        "-resize", f"{ref_w}x",
        "-strip", rendered_scaled
    ])
    dim_out = subprocess.check_output(
        ["/usr/bin/magick", "identify", "-format", "%w %h", rendered_scaled],
        text=True
    ).strip().split()
    cand_w, cand_h = int(dim_out[0]), int(dim_out[1])

    scale_factor = ref_w / float(css_w)
    height_delta_px = cand_h - ref_h
    height_delta_pct = round(abs(height_delta_px) / float(max(1, ref_h)) * 100.0, 2)

    max_h = max(ref_h, cand_h)
    ref_padded = os.path.join(bp_dir, "_ref_pad.png")
    cand_padded = os.path.join(bp_dir, "_cand_pad.png")
    subprocess.check_call([
        "/usr/bin/magick", ref_png,
        "-background", "#18181b", "-gravity", "NorthWest", "-extent", f"{ref_w}x{max_h}",
        ref_padded
    ])
    subprocess.check_call([
        "/usr/bin/magick", rendered_scaled,
        "-background", "#18181b", "-gravity", "NorthWest", "-extent", f"{ref_w}x{max_h}",
        cand_padded
    ])

    overlay_path = os.path.join(bp_dir, "rendered_overlay.png")
    subprocess.check_call([
        "/usr/bin/magick", ref_padded, cand_padded,
        "-compose", "blend", "-define", "compose:args=50,50", "-composite",
        overlay_path
    ])

    ref_raw = subprocess.check_output(
        ["/usr/bin/magick", ref_padded, "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
        stderr=subprocess.DEVNULL
    )
    cand_raw = subprocess.check_output(
        ["/usr/bin/magick", cand_padded, "-colorspace", "sRGB", "-depth", "8", "rgb:-"],
        stderr=subprocess.DEVNULL
    )

    cell = 64
    rows = (max_h + cell - 1) // cell
    cols = (ref_w + cell - 1) // cell
    cell_loss_map = [[0.0] * cols for _ in range(rows)]
    block_sims, edge_sims, color_sims, error_cells = [], [], [], []

    for r in range(rows):
        y0, y1 = r * cell, min(max_h, (r + 1) * cell)
        for c in range(cols):
            x0, x1 = c * cell, min(ref_w, (c + 1) * cell)
            n_px = 0
            sr_r = sg_r = sb_r = sr_c = sg_c = sb_c = sum_l1 = se_r = se_c = 0.0
            for y in range(y0, y1, 2):
                ro = y * ref_w * 3
                nro = min(max_h - 1, y + 1) * ref_w * 3
                for x in range(x0, x1, 2):
                    idx = ro + x * 3
                    nx = ro + min(ref_w - 1, x + 1) * 3
                    ny = nro + x * 3
                    rr, rg, rb = ref_raw[idx], ref_raw[idx+1], ref_raw[idx+2]
                    cr_v, cg_v, cb_v = cand_raw[idx], cand_raw[idx+1], cand_raw[idx+2]
                    sr_r += rr; sg_r += rg; sb_r += rb
                    sr_c += cr_v; sg_c += cg_v; sb_c += cb_v
                    sum_l1 += (abs(rr - cr_v) + abs(rg - cg_v) + abs(rb - cb_v)) / 3.0
                    se_r += (abs(rr - ref_raw[nx]) + abs(rg - ref_raw[nx+1]) + abs(rr - ref_raw[ny]) + abs(rg - ref_raw[ny+1])) * 0.25
                    se_c += (abs(cr_v - cand_raw[nx]) + abs(cg_v - cand_raw[nx+1]) + abs(cr_v - cand_raw[ny]) + abs(cg_v - cand_raw[ny+1])) * 0.25
                    n_px += 1
            n_px = max(1, n_px)
            md = math.sqrt((sr_r/n_px - sr_c/n_px)**2 + (sg_r/n_px - sg_c/n_px)**2 + (sb_r/n_px - sb_c/n_px)**2) / 441.67
            csim = max(0.0, 1.0 - md * 1.6)
            bsim = max(0.0, 1.0 - ((sum_l1 / n_px) / 255.0) * 1.8)
            re_m, ce_m = se_r / n_px, se_c / n_px
            esim = max(0.0, 1.0 - abs(re_m - ce_m) / max(18.0, re_m + ce_m + 1e-5))
            color_sims.append(csim); block_sims.append(bsim); edge_sims.append(esim)
            loss = 1.0 - (0.45 * bsim + 0.30 * esim + 0.25 * csim)
            cell_loss_map[r][c] = loss
            if loss > 0.16:
                error_cells.append({
                    "bbox_ref_px": [x0, y0, x1 - x0, y1 - y0],
                    "bbox_css_px": [int(round(x0 / scale_factor)), int(round(y0 / scale_factor)), int(round((x1 - x0) / scale_factor)), int(round((y1 - y0) / scale_factor))],
                    "loss_score": round(float(loss), 4),
                    "mode": "color_drift" if csim < bsim else "spacing_or_layout_shift",
                })
    error_cells.sort(key=lambda item: -item["loss_score"])

    diff_surf = cairo.ImageSurface.create_from_png(cand_padded)
    ctx = cairo.Context(diff_surf)
    for r in range(rows):
        for c in range(cols):
            loss = cell_loss_map[r][c]
            if loss <= 0.15: continue
            y0, y1 = r * cell, min(max_h, (r + 1) * cell)
            x0, x1 = c * cell, min(ref_w, (c + 1) * cell)
            alpha = min(0.55, 0.70 * loss)
            if loss > 0.30: ctx.set_source_rgba(0.94, 0.27, 0.27, alpha)
            else: ctx.set_source_rgba(0.96, 0.62, 0.04, alpha)
            ctx.rectangle(x0, y0, x1 - x0, y1 - y0)
            ctx.fill()

    diff_mask_path = os.path.join(bp_dir, "diff_mask.png")
    diff_surf.write_to_png(diff_mask_path)

    # Render 3-panel side_by_side.png + readable vertical slices (<= 1800px high)
    header_h = 34
    gap = 12
    sbs_w = ref_w * 3 + gap * 2
    sbs_h = max_h + header_h
    sbs_surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, sbs_w, sbs_h)
    sctx = cairo.Context(sbs_surf)
    sctx.set_source_rgb(0.09, 0.09, 0.11)
    sctx.paint()

    ref_s = cairo.ImageSurface.create_from_png(ref_padded)
    cand_s = cairo.ImageSurface.create_from_png(cand_padded)
    sctx.select_font_face("sans-serif", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
    sctx.set_font_size(13)

    for idx_p, (title_txt, rgb_hdr, surf_p) in enumerate([
        (f"1. {name.upper()} REF ({ref_w}x{ref_h})", (0.18, 0.18, 0.20), ref_s),
        (f"2. RENDERED ({cand_w}x{cand_h}, css={css_w}px)", (0.09, 0.40, 0.20), cand_s),
        ("3. SPACING & PIXEL DIFF HEATMAP", (0.60, 0.11, 0.11), diff_surf),
    ]):
        ox = idx_p * (ref_w + gap)
        sctx.set_source_rgb(*rgb_hdr)
        sctx.rectangle(ox, 0, ref_w, header_h)
        sctx.fill()
        sctx.set_source_rgb(0.98, 0.98, 0.98)
        sctx.move_to(ox + 12, 22)
        sctx.show_text(title_txt)
        sctx.set_source_surface(surf_p, ox, header_h)
        sctx.paint()

    side_by_side_path = os.path.join(bp_dir, "side_by_side.png")
    sbs_surf.write_to_png(side_by_side_path)

    slice_paths = []
    slice_h_max = 1800
    if sbs_h > slice_h_max:
        n_slices = (sbs_h + slice_h_max - 1) // slice_h_max
        for si in range(n_slices):
            sy0 = si * slice_h_max
            sh = min(slice_h_max, sbs_h - sy0)
            sl_surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, sbs_w, sh)
            sl_ctx = cairo.Context(sl_surf)
            sl_ctx.set_source_surface(sbs_surf, 0, -sy0)
            sl_ctx.paint()
            sp = os.path.join(bp_dir, f"side_by_side_slice_{si+1}.png")
            sl_surf.write_to_png(sp)
            slice_paths.append(sp)
    else:
        slice_paths.append(side_by_side_path)

    for tmp_f in (ref_padded, cand_padded):
        try: os.unlink(tmp_f)
        except OSError: pass

    s_block = sum(block_sims) / max(1, len(block_sims))
    s_edge = sum(edge_sims) / max(1, len(edge_sims))
    s_chroma = sum(color_sims) / max(1, len(color_sims))

    collisions = int(dom.get("collision_count") or 0)
    overflow_px = int(dom.get("horizontal_overflow_px") or 0)
    clipped_cnt = int(dom.get("clipped_text_count") or 0)
    btn_v = int(dom.get("button_padding_violations") or 0)
    grid_v = int(dom.get("grid_equality_violations") or 0)

    s_dom = 1.0
    s_dom -= min(0.45, 0.15 * collisions)
    if overflow_px > 0: s_dom -= 0.25
    s_dom -= min(0.20, 0.05 * clipped_cnt)
    s_dom -= min(0.20, 0.04 * btn_v)
    s_dom -= min(0.25, 0.08 * grid_v)
    if height_delta_pct > max_height_delta_pct:
        s_dom -= min(0.20, (height_delta_pct - max_height_delta_pct) * 0.015)
    s_dom = max(0.0, s_dom)

    s_total = round(0.35 * s_block + 0.25 * s_edge + 0.20 * s_chroma + 0.20 * s_dom, 4)
    passed = (
        s_total >= target_score
        and height_delta_pct <= max_height_delta_pct
        and collisions == 0
        and overflow_px == 0
        and clipped_cnt == 0
        and btn_v == 0
        and grid_v == 0
    )

    return {
        "breakpoint": name,
        "passed": passed,
        "s_total": s_total,
        "sub_scores": {
            "s_block": round(s_block, 4),
            "s_edge": round(s_edge, 4),
            "s_chroma": round(s_chroma, 4),
            "s_dom": round(s_dom, 4),
        },
        "dimensions": {
            "css_viewport_width": css_w,
            "css_scroll_height": dom.get("viewport", {}).get("scroll_height"),
            "css_expected_height": cfg["css_expected_height"],
            "ref_size": [ref_w, ref_h],
            "rendered_scaled_size": [cand_w, cand_h],
            "height_delta_px": height_delta_px,
            "height_delta_pct": height_delta_pct,
        },
        "dom_and_craft": {
            "collision_count": collisions,
            "colliding_pairs": dom.get("colliding_pairs") or [],
            "horizontal_overflow_px": overflow_px,
            "overflow_offenders": dom.get("overflow_offenders") or [],
            "clipped_text_count": clipped_cnt,
            "clipped_text": dom.get("clipped_text") or [],
            "button_padding_violations": btn_v,
            "button_audits": dom.get("button_audits") or [],
            "grid_equality_violations": grid_v,
            "grid_row_audits": dom.get("grid_row_audits") or [],
            "headings_audit": dom.get("headings_audit") or {},
        },
        "top_error_cells": error_cells[:8],
        "artifacts": {
            "rendered_png": rendered_scaled,
            "rendered_overlay_png": overlay_path,
            "diff_mask_png": diff_mask_path,
            "side_by_side_png": side_by_side_path,
            "side_by_side_slices": slice_paths,
        },
    }

desktop_res = evaluate_breakpoint("desktop", job["desktop"])
mobile_res = evaluate_breakpoint("mobile", job["mobile"])

# Probe intermediate & edge fluid continuum widths (320px, 375px, 768px, 1024px)
extra_widths = [320, 375, 768, 1024]
continuum = {}
continuum_passed = True

for w in extra_widths:
    fold = 740 if w < 700 else 900
    st = render_and_probe(w, fold, None)
    d = st.get("dom") or {}
    ov = int(d.get("horizontal_overflow_px") or 0)
    col = int(d.get("collision_count") or 0)
    clip = int(d.get("clipped_text_count") or 0)
    btn = int(d.get("button_padding_violations") or 0)
    grd = int(d.get("grid_equality_violations") or 0)
    ok = (ov == 0 and col == 0 and clip == 0 and btn == 0 and grd == 0)
    if not ok:
        continuum_passed = False
    continuum[f"{w}px"] = {
        "passed": ok,
        "horizontal_overflow_px": ov,
        "overflow_offenders": d.get("overflow_offenders") or [],
        "collision_count": col,
        "colliding_pairs": d.get("colliding_pairs") or [],
        "clipped_text_count": clip,
        "clipped_text": d.get("clipped_text") or [],
        "button_padding_violations": btn,
        "grid_equality_violations": grd,
    }

# Single Unified Responsive DOM Anti-Bifurcation check
dh = desktop_res["dom_and_craft"].get("headings_audit") or {}
mh = mobile_res["dom_and_craft"].get("headings_audit") or {}
d_ratio = float(dh.get("visibility_ratio", 1.0))
m_ratio = float(mh.get("visibility_ratio", 1.0))
total_h = max(int(dh.get("total_structural_h1_h2", 0)), int(mh.get("total_structural_h1_h2", 0)))
anti_bifurcation_passed = True
anti_bifurcation_reason = "Single unified responsive DOM tree verified."
if total_h >= 2 and (d_ratio < 0.65 or m_ratio < 0.65):
    anti_bifurcation_passed = False
    anti_bifurcation_reason = (
        f"Bifurcated desktop/mobile DOM detected (desktop visible h1/h2 ratio={d_ratio}, "
        f"mobile visible h1/h2 ratio={m_ratio}). Merge into ONE shared responsive semantic DOM tree!"
    )

overall_passed = bool(
    desktop_res["passed"]
    and mobile_res["passed"]
    and continuum_passed
    and anti_bifurcation_passed
)

report = {
    "brand": job["brand"],
    "name": job["name"],
    "project_slug": job["project_slug"],
    "target_score": target_score,
    "max_height_delta_pct": max_height_delta_pct,
    "overall_passed": overall_passed,
    "anti_bifurcation": {
        "passed": anti_bifurcation_passed,
        "desktop_heading_visibility_ratio": d_ratio,
        "mobile_heading_visibility_ratio": m_ratio,
        "message": anti_bifurcation_reason,
    },
    "continuum_320_to_desktop": {
        "all_intermediate_widths_passed": continuum_passed,
        "widths": continuum,
    },
    "desktop": desktop_res,
    "mobile": mobile_res,
}

report_path = os.path.join(out_root, "dual_eval_report.json")
with open(report_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)

print(json.dumps(report, indent=2))
`;

function main() {
  const args = parseArgs(process.argv);
  let jobConfig = null;
  let projectDir = "";
  let parentMoodboardDir = "";
  let brandIndexHtml = "";

  if (args.brand && !(args.projectDir && args.desktopRef && args.mobileRef)) {
    const brandDir = path.join(WDA_WORK_ROOT, args.brand);
    const metaPath = path.join(brandDir, "references", "manifest.json");
    if (!fs.existsSync(metaPath)) {
      throw new Error(`Brand manifest not found: ${metaPath}`);
    }
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    parentMoodboardDir = WDA_WORK_ROOT;
    projectDir = path.join(WDA_WORK_ROOT, "projects", meta.project_slug);
    brandIndexHtml = path.join(brandDir, "index.html");
    jobConfig = {
      brand: meta.id,
      name: meta.name,
      project_slug: meta.project_slug,
      target_score: args.targetScore,
      max_height_delta_pct: args.maxHeightDeltaPct,
      screen: args.screen || 0,
      screen_id: args.screenId || "",
      desktop: meta.eval_viewports.desktop,
      mobile: meta.eval_viewports.mobile,
    };
  } else if (args.projectDir && args.desktopRef && args.mobileRef) {
    projectDir = path.resolve(args.projectDir);
    const slug = path.basename(projectDir);
    parentMoodboardDir = path.resolve(projectDir, "..", "..");
    const dDim = identifyPngDimensions(args.desktopRef);
    const mDim = identifyPngDimensions(args.mobileRef);
    const dCssW = args.desktopCssWidth || (dDim.width >= 1200 ? dDim.width : 1440);
    const mCssW = args.mobileCssWidth || Math.round(mDim.width / 2);
    jobConfig = {
      brand: args.brand || slug,
      name: slug,
      project_slug: slug,
      target_score: args.targetScore,
      max_height_delta_pct: args.maxHeightDeltaPct,
      screen: args.screen || 0,
      screen_id: args.screenId || "",
      desktop: {
        reference_png: path.resolve(args.desktopRef),
        ref_width: dDim.width,
        ref_height: dDim.height,
        css_width: dCssW,
        css_expected_height: Math.round(dDim.height * (dCssW / dDim.width)),
        window_fold_height: 900,
      },
      mobile: {
        reference_png: path.resolve(args.mobileRef),
        ref_width: mDim.width,
        ref_height: mDim.height,
        css_width: mCssW,
        css_expected_height: Math.round(mDim.height * (mCssW / mDim.width)),
        window_fold_height: 844,
      },
    };
  } else {
    console.error(
      "Usage:\n  node eval-responsive-pair.mjs --brand=<brand-id> [--target-score=0.85]\n  OR --project-dir=... --desktop-ref=... --mobile-ref=..."
    );
    process.exit(1);
  }

  const outRoot = path.resolve(args.outDir || path.join(DEFAULT_OUT_ROOT, jobConfig.brand));
  fs.mkdirSync(outRoot, { recursive: true });

  const nodeBin = process.execPath;
  const npmBin = fs.existsSync(path.join(os.homedir(), ".local", "bin", "npm"))
    ? path.join(os.homedir(), ".local", "bin", "npm")
    : "npm";
  const env = {
    ...process.env,
    GSETTINGS_BACKEND: "memory",
    PATH: `${path.join(os.homedir(), ".local", "bin")}:${process.env.PATH || ""}`,
  };

  const distHtml = path.join(projectDir, "dist", "index.html");
  let builtHtml = "";
  if (args.skipBuild) {
    builtHtml = fs.readFileSync(distHtml, "utf8");
  } else {
    // 1. Lint Golden Template structure, nomenclature & strict tsc --noEmit
    execFileSync(nodeBin, [LINTER_SCRIPT, `--dir=${parentMoodboardDir}`, `--project=${jobConfig.project_slug}`, "--fix"], {
      stdio: "inherit",
      env,
    });

    // 2. Build single-file bundle (`dist/index.html`), inline any emitted .woff2 font assets, & sync `<brand>/index.html`
    //    Prefer direct Vite with `--configLoader runner` (no node_modules/.vite-temp write), fall back to npm run build.
    const viteBin = path.join(projectDir, "node_modules", "vite", "bin", "vite.js");
    let builtViaVite = false;
    if (fs.existsSync(viteBin)) {
      try {
        execFileSync(nodeBin, [viteBin, "build", "--configLoader", "runner"], { cwd: projectDir, stdio: "inherit", env });
        builtViaVite = true;
      } catch (err) {
        console.warn(`[eval-responsive-pair] direct vite build failed (${String(err.message).split("\n")[0]}); falling back to npm run build`);
      }
    }
    if (!builtViaVite) {
      execFileSync(npmBin, ["run", "build"], { cwd: projectDir, stdio: "inherit", env });
    }
    builtHtml = fs.readFileSync(distHtml, "utf8");
    builtHtml = builtHtml.replace(/url\((['"]?)(?:\.?\/assets\/|\.?\/)([^'")/]+\.(?:woff2|woff|ttf|otf|png|jpe?g|webp|svg))\1\)/gi, (full, _q, relAsset) => {
      const candidates = [
        path.join(projectDir, "dist", "assets", relAsset),
        path.join(projectDir, "dist", relAsset),
      ];
      const assetPath = candidates.find((p) => fs.existsSync(p));
      if (!assetPath) return full;
      const ext = path.extname(assetPath).toLowerCase();
      const mime =
        ext === ".woff2"
          ? "font/woff2"
          : ext === ".woff"
            ? "font/woff"
            : ext === ".ttf"
              ? "font/ttf"
              : ext === ".otf"
                ? "font/otf"
                : ext === ".svg"
                  ? "image/svg+xml"
                  : ext === ".webp"
                    ? "image/webp"
                    : ext === ".png"
                      ? "image/png"
                      : ext === ".jpg" || ext === ".jpeg"
                        ? "image/jpeg"
                        : "application/octet-stream";
      const b64 = fs.readFileSync(assetPath).toString("base64");
      return `url("data:${mime};base64,${b64}")`;
    });
    fs.writeFileSync(distHtml, builtHtml, "utf8");
    if (brandIndexHtml) {
      fs.copyFileSync(distHtml, brandIndexHtml);
    }
  }

  // 3. Inject DOM probe into temp HTML & run WebKit2GTK dual-breakpoint + continuum evaluation
  const origHtml = builtHtml;
  const injectedHtml = origHtml.includes("</head>")
    ? origHtml.replace("</head>", `<script>${DOM_PROBE_JS}</script></head>`)
    : `<script>${DOM_PROBE_JS}</script>${origHtml}`;
  // Write the probe HTML next to dist/index.html so relative `./assets/*` <img>/<video>/<source> URLs resolve
  // (matches eval-image-to-react.mjs / eval-multi-screen-project.mjs). Falls back to outRoot if dist is read-only.
  let tmpHtmlPath = path.join(path.dirname(distHtml), `.eval_probe_${process.pid}.html`);
  const tmpCfgPath = path.join(outRoot, `.eval_job_${process.pid}.json`);
  try {
    fs.writeFileSync(tmpHtmlPath, injectedHtml, "utf8");
  } catch {
    tmpHtmlPath = path.join(outRoot, `.eval_probe_${process.pid}.html`);
    fs.writeFileSync(tmpHtmlPath, injectedHtml, "utf8");
  }
  fs.writeFileSync(tmpCfgPath, JSON.stringify(jobConfig, null, 2), "utf8");

  try {
    const rawReport = execFileSync(
      "xvfb-run",
      ["-a", "python3", "-c", PYTHON_RESPONSIVE_EVAL, tmpHtmlPath, tmpCfgPath, outRoot],
      { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], env }
    );
    console.log(rawReport);
  } finally {
    try { fs.unlinkSync(tmpHtmlPath); } catch {}
    try { fs.unlinkSync(tmpCfgPath); } catch {}
  }
}

main();
