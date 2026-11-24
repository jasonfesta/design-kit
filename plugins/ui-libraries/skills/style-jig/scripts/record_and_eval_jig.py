#!/usr/bin/env python3
"""Record a crisp 1440x900 H.264 MP4 walkthrough of any DesignKitJig project via the lower-plate strokeless Red Record button (`[data-jig-record-toggle="true"]`), letting the built-in 12s UI showcase + `[data-jig-record-output="true"]` output banner run organically, extract 6 PNG keyframes, and emit a live DOM/motion telemetry audit JSON.

Executable inside standard sandbox with plain python3:
  python3 /usr/local/google/home/jfesta/design-kit/plugins/ui-libraries/skills/style-jig/scripts/record_and_eval_jig.py \
    --html /path/to/dist/index.html \
    --mp4-out /path/to/artifact_dir/walkthrough.mp4 \
    --keyframes-dir /path/to/scratch_dir/keyframes \
    --duration 12
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile
import time
from typing import Any

# Auto-bootstrap vendored ~/design-kit Playwright + Chromium when present; otherwise use system/venv Playwright
_KIT_TOOLS_DIR = pathlib.Path.home() / "design-kit" / "tools"
_KIT_SITE = _KIT_TOOLS_DIR / "python" / "site"
_KIT_BROWSERS = _KIT_TOOLS_DIR / "ms-playwright"
if _KIT_SITE.exists() and str(_KIT_SITE) not in sys.path:
  sys.path.insert(0, str(_KIT_SITE))
if _KIT_BROWSERS.exists():
  os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", str(_KIT_BROWSERS))

from playwright.sync_api import Page, sync_playwright

FFMPEG_BIN = shutil.which("ffmpeg") or "/usr/bin/ffmpeg"
FFPROBE_BIN = shutil.which("ffprobe") or "/usr/bin/ffprobe"

FPS_INJECT_JS = """
(() => {
  window.__jigFpsMeter = {
    frames: 0,
    deltas: [],
    lastTs: performance.now(),
    startTs: performance.now(),
    running: true
  };
  function step(now) {
    const m = window.__jigFpsMeter;
    if (!m || !m.running) return;
    const dt = now - m.lastTs;
    if (m.frames > 0 && dt > 0 && dt < 2000) {
      m.deltas.push(dt);
    }
    m.lastTs = now;
    m.frames += 1;
    window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);
})();
"""

TELEMETRY_BEAT_JS = """
(beatLabel) => {
  const describeEl = (el) => {
    if (!el) return 'null';
    const tag = (el.tagName || 'el').toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const rawCls = typeof el.className === 'string' ? el.className : (el.getAttribute && el.getAttribute('class')) || '';
    const cls = rawCls.trim().split(/\\s+/).filter(Boolean).slice(0, 2).map((c) => `.${c}`).join('');
    return `${tag}${id}${cls}`;
  };

  const parseRgba = (str) => {
    if (!str) return null;
    const m = str.match(/rgba?\\(\\s*([0-9.]+)[,\\s]+([0-9.]+)[,\\s]+([0-9.]+)(?:[,/\\s]+([0-9.]+))?\\s*\\)/i);
    if (!m) return null;
    return {
      r: Number(m[1]),
      g: Number(m[2]),
      b: Number(m[3]),
      a: m[4] !== undefined ? Number(m[4]) : 1
    };
  };

  const compositeOver = (fg, bg) => {
    const a = fg.a + bg.a * (1 - fg.a);
    if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
      g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
      b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
      a
    };
  };

  const resolveEffectiveBg = (el) => {
    const layers = [];
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const cs = window.getComputedStyle(cur);
      const parsed = parseRgba(cs.backgroundColor);
      if (parsed && parsed.a > 0.01) {
        layers.push(parsed);
        if (parsed.a >= 0.99) break;
      }
      cur = cur.parentElement;
    }
    const theme = document.documentElement.getAttribute('data-jig-theme') || document.body.getAttribute('data-theme') || 'dark';
    let base = theme === 'light' ? { r: 250, g: 249, b: 246, a: 1 } : { r: 0, g: 0, b: 0, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) {
      base = compositeOver(layers[i], base);
    }
    return base;
  };

  const relLum = (rgb) => {
    const chan = [rgb.r, rgb.g, rgb.b].map((v) => {
      const s = Math.max(0, Math.min(255, v)) / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2];
  };

  const contrastRatio = (fg, bg) => {
    const effFg = fg.a < 1 ? compositeOver(fg, bg) : fg;
    const l1 = relLum(effFg);
    const l2 = relLum(bg);
    const hi = Math.max(l1, l2);
    const lo = Math.min(l1, l2);
    return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2));
  };

  const isVisible = (el) => {
    if (!el || el.nodeType !== 1) return false;
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };

  const stageMount = document.querySelector('.jig-stage-mount') || document.querySelector('[data-jig-stage-viewport]');
  let stageChild = null;
  if (stageMount && stageMount.children.length > 0) {
    stageChild = stageMount.children[0];
  }
  const perimeterSelectors = [
    '.floating-style-plate',
    '.floating-lib-plate',
    '.floating-motion-plate',
    '.toc-list',
    '.right-variant-notches'
  ];
  const overlaps = [];
  let clearances = null;
  if (stageChild && isVisible(stageChild)) {
    const sr = stageChild.getBoundingClientRect();
    const stylePlate = document.querySelector('.floating-style-plate');
    const motionPlate = document.querySelector('.floating-motion-plate');
    const tocList = document.querySelector('.toc-list');
    const notches = document.querySelector('.right-variant-notches');
    clearances = {
      stageWidthPx: Math.round(sr.width),
      stageHeightPx: Math.round(sr.height),
      topClearancePx: stylePlate && isVisible(stylePlate) ? Math.round(sr.top - stylePlate.getBoundingClientRect().bottom) : null,
      bottomClearancePx: motionPlate && isVisible(motionPlate) ? Math.round(motionPlate.getBoundingClientRect().top - sr.bottom) : null,
      leftClearancePx: tocList && isVisible(tocList) ? Math.round(sr.left - tocList.getBoundingClientRect().right) : null,
      rightClearancePx: notches && isVisible(notches) ? Math.round(notches.getBoundingClientRect().left - sr.right) : Math.round(window.innerWidth - sr.right)
    };
    for (const sel of perimeterSelectors) {
      const pEl = document.querySelector(sel);
      if (!pEl || !isVisible(pEl)) continue;
      const pr = pEl.getBoundingClientRect();
      const ix = Math.max(0, Math.min(sr.right, pr.right) - Math.max(sr.left, pr.left));
      const iy = Math.max(0, Math.min(sr.bottom, pr.bottom) - Math.max(sr.top, pr.top));
      if (ix > 1 && iy > 1) {
        overlaps.push({
          perimeter: sel,
          stageTarget: describeEl(stageChild),
          overlapWidthPx: Math.round(ix),
          overlapHeightPx: Math.round(iy)
        });
      }
    }
  }

  const buttons = Array.from(document.querySelectorAll('button')).filter(isVisible);
  let opticallyCenteredCount = 0;
  let geometricCenteredCount = 0;
  const geometricSamples = [];
  for (const btn of buttons) {
    const cs = window.getComputedStyle(btn);
    const pt = parseFloat(cs.paddingTop) || 0;
    const pb = parseFloat(cs.paddingBottom) || 0;
    const delta = Number((pt - pb).toFixed(2));
    const isIconSquare = btn.getBoundingClientRect().width <= 30 && (btn.textContent || '').trim().length === 0 && !btn.classList.contains('jig-play-btn') && !btn.classList.contains('jig-record-btn') && !btn.classList.contains('jig-theme-btn');
    if (delta >= 1 || isIconSquare) {
      opticallyCenteredCount += 1;
    } else {
      geometricCenteredCount += 1;
      if (geometricSamples.length < 6) {
        geometricSamples.push({
          selector: describeEl(btn),
          label: (btn.textContent || btn.getAttribute('aria-label') || '').trim().slice(0, 28),
          paddingTopPx: pt,
          paddingBottomPx: pb,
          deltaPx: delta
        });
      }
    }
  }

  let minFontPx = 999;
  const sub12Samples = [];
  const allEls = Array.from(document.querySelectorAll('body *'));
  for (const el of allEls) {
    if (!isVisible(el)) continue;
    let hasDirectText = false;
    for (const node of el.childNodes) {
      if (node.nodeType === 3 && node.textContent && node.textContent.trim().length > 0) {
        hasDirectText = true;
        break;
      }
    }
    if (!hasDirectText) continue;
    const fs = parseFloat(window.getComputedStyle(el).fontSize);
    if (!Number.isFinite(fs) || fs <= 0) continue;
    if (fs < minFontPx) minFontPx = fs;
    if (fs < 11.95 && sub12Samples.length < 8) {
      sub12Samples.push({
        selector: describeEl(el),
        text: (el.textContent || '').trim().slice(0, 32),
        fontSizePx: Number(fs.toFixed(2))
      });
    }
  }
  if (minFontPx === 999) minFontPx = 13.5;

  const contrastTargets = [
    { role: 'jig-active-style', el: document.querySelector('.floating-style-plate .jig-word.active') },
    { role: 'jig-inactive-style', el: document.querySelector('.floating-style-plate .jig-word:not(.active)') },
    { role: 'toc-active-domain', el: document.querySelector('.toc-group-btn.active-domain') },
    { role: 'toc-active-sub', el: document.querySelector('.toc-item.active') },
    { role: 'stage-primary-text', el: stageChild ? stageChild.querySelector('h1, h2, h3, [data-ap], button') : null }
  ];
  const contrastSamples = [];
  for (const item of contrastTargets) {
    if (!item.el || !isVisible(item.el)) continue;
    const cs = window.getComputedStyle(item.el);
    const fg = parseRgba(cs.color);
    if (!fg) continue;
    const bg = resolveEffectiveBg(item.el);
    contrastSamples.push({
      role: item.role,
      selector: describeEl(item.el),
      text: (item.el.textContent || '').trim().slice(0, 28),
      ratio: contrastRatio(fg, bg)
    });
  }

  const outputEl = document.querySelector('[data-jig-record-output="true"]');
  return {
    beat: beatLabel,
    slide: document.body.getAttribute('data-slide') || '',
    style: document.body.getAttribute('data-active-style') || '',
    theme: document.documentElement.getAttribute('data-jig-theme') || 'dark',
    recordingActive: document.body.getAttribute('data-jig-recording') === 'true',
    outputBannerText: outputEl ? (outputEl.textContent || '').trim() : null,
    clearances,
    overlaps,
    buttonsTotal: buttons.length,
    buttonsOpticallyCentered: opticallyCenteredCount,
    buttonsGeometricCount: geometricCenteredCount,
    geometricButtonSamples: geometricSamples,
    minFontSizePx: Number(minFontPx.toFixed(2)),
    sub12pxSamples: sub12Samples,
    contrastSamples
  };
}
"""


def click_if_visible(page: Page, selector: str, timeout_ms: int = 1200) -> bool:
  loc = page.locator(selector).first
  try:
    if loc.count() > 0 and loc.is_visible(timeout=timeout_ms):
      loc.click(timeout=timeout_ms)
      return True
  except Exception:
    return False
  return False


def encode_mp4_and_extract_keyframes(
    webm_path: pathlib.Path,
    mp4_out: pathlib.Path,
    keyframes_dir: pathlib.Path,
    sample_timestamps_sec: list[float],
) -> tuple[dict[str, Any], list[str]]:
  mp4_out.parent.mkdir(parents=True, exist_ok=True)
  keyframes_dir.mkdir(parents=True, exist_ok=True)

  ffmpeg_cmd = [
      FFMPEG_BIN,
      "-y",
      "-i",
      str(webm_path),
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      str(mp4_out),
  ]
  subprocess.run(ffmpeg_cmd, check=True, capture_output=True, text=True)

  probe_cmd = [
      FFPROBE_BIN,
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=codec_name,profile,pix_fmt,width,height,r_frame_rate,avg_frame_rate:format=duration,size",
      "-of",
      "json",
      str(mp4_out),
  ]
  probe_res = subprocess.run(probe_cmd, check=True, capture_output=True, text=True)
  probe_json = json.loads(probe_res.stdout)
  stream_info = (probe_json.get("streams") or [{}])[0]
  format_info = probe_json.get("format") or {}

  codec_name = stream_info.get("codec_name")
  pix_fmt = stream_info.get("pix_fmt")
  if codec_name != "h264" or pix_fmt != "yuv420p":
    raise RuntimeError(
        f"Unexpected MP4 encoding parameters: codec={codec_name}, pix_fmt={pix_fmt}"
    )

  duration_sec = float(format_info.get("duration") or 13.5)
  extracted_paths: list[str] = []
  for idx, raw_ts in enumerate(sample_timestamps_sec, start=1):
    ts = max(0.35, min(max(0.4, duration_sec - 0.35), raw_ts))
    out_png = keyframes_dir / f"keyframe-{idx:02d}.png"
    kf_cmd = [
        FFMPEG_BIN,
        "-y",
        "-ss",
        f"{ts:.2f}",
        "-i",
        str(mp4_out),
        "-frames:v",
        "1",
        "-q:v",
        "2",
        str(out_png),
    ]
    subprocess.run(kf_cmd, check=True, capture_output=True, text=True)
    extracted_paths.append(str(out_png))

  video_meta = {
      "mp4Path": str(mp4_out),
      "codec": codec_name,
      "profile": stream_info.get("profile"),
      "pixFmt": pix_fmt,
      "width": int(stream_info.get("width") or 0),
      "height": int(stream_info.get("height") or 0),
      "avgFrameRate": stream_info.get("avg_frame_rate"),
      "durationSec": round(duration_sec, 2),
      "sizeBytes": int(format_info.get("size") or mp4_out.stat().st_size),
  }
  return video_meta, extracted_paths


def main() -> None:
  parser = argparse.ArgumentParser(description=__doc__)
  src_group = parser.add_mutually_exclusive_group(required=True)
  src_group.add_argument("--url", type=str, help="Target HTTP(S) or file:// URL")
  src_group.add_argument(
      "--html", type=pathlib.Path, help="Path to compiled single-file HTML bundle"
  )
  parser.add_argument(
      "--mp4-out",
      required=True,
      type=pathlib.Path,
      help="Output H.264 yuv420p MP4 file path (e.g. <artifact_dir>/walkthrough.mp4)",
  )
  parser.add_argument(
      "--keyframes-dir",
      required=True,
      type=pathlib.Path,
      help="Output directory for 6 extracted PNG keyframes and telemetry-audit.json",
  )
  parser.add_argument(
      "--telemetry-out",
      type=pathlib.Path,
      default=None,
      help="Optional path for JSON telemetry report (defaults to <keyframes-dir>/telemetry-audit.json)",
  )
  parser.add_argument(
      "--duration",
      type=float,
      default=12.0,
      help="Expected built-in recording take duration in seconds (default: 12)",
  )
  parser.add_argument("--width", type=int, default=1440, help="Viewport width (default: 1440)")
  parser.add_argument("--height", type=int, default=900, help="Viewport height (default: 900)")
  args = parser.parse_args()

  if args.html is not None:
    html_path = args.html.resolve()
    if not html_path.exists():
      raise FileNotFoundError(f"HTML file not found: {html_path}")
    target_url = html_path.as_uri()
  else:
    target_url = args.url

  mp4_out = args.mp4_out.resolve()
  keyframes_dir = args.keyframes_dir.resolve()
  telemetry_out = (
      args.telemetry_out.resolve()
      if args.telemetry_out is not None
      else (keyframes_dir / "telemetry-audit.json")
  )

  console_errors: list[str] = []
  page_errors: list[str] = []
  beat_samples: list[dict[str, Any]] = []
  keyframe_timestamps: list[float] = []

  with tempfile.TemporaryDirectory(prefix="jig-recorder-video-") as tmp_video_dir:
    with sync_playwright() as p:
      browser = p.chromium.launch(headless=True)
      context = browser.new_context(
          viewport={"width": args.width, "height": args.height},
          device_scale_factor=1,
          record_video_dir=tmp_video_dir,
          record_video_size={"width": args.width, "height": args.height},
      )
      video_start_mono = time.monotonic()
      page = context.new_page()
      page.on(
          "console",
          lambda msg: console_errors.append(msg.text)
          if msg.type == "error"
          else None,
      )
      page.on("pageerror", lambda exc: page_errors.append(str(exc)))

      page.goto(target_url, wait_until="load", timeout=45000)
      page.evaluate(
          "() => (document.fonts && document.fonts.ready) ? document.fonts.ready.then(() => true) : Promise.resolve(true)"
      )
      page.wait_for_timeout(450)
      page.evaluate(FPS_INJECT_JS)

      clicked_record_btn = click_if_visible(
          page, '[data-jig-record-toggle="true"]', timeout_ms=2500
      )
      if not clicked_record_btn:
        page.evaluate("() => window.JigAgent?.startRecording?.()")
      record_click_mono = time.monotonic()

      page.wait_for_timeout(260)
      record_start_check = page.evaluate(
          """() => {
            const recBtn = document.querySelector('[data-jig-record-toggle="true"]');
            const playBtn = document.querySelector('[data-jig-play-toggle="true"]');
            const dot = document.querySelector('.jig-record-btn.recording .jig-record-dot');
            const dotRect = dot ? dot.getBoundingClientRect() : null;
            const recCs = recBtn ? window.getComputedStyle(recBtn) : null;
            const dotCs = dot ? window.getComputedStyle(dot) : null;
            return {
              hasRecordButton: Boolean(recBtn),
              bodyRecordingAttr: document.body.getAttribute('data-jig-recording') === 'true',
              buttonRecordingClass: Boolean(recBtn && recBtn.classList.contains('recording')),
              blinkingDotOnly: Boolean(dot && !recBtn.querySelector('.jig-record-timer')),
              playButtonLitWithTriangle: Boolean(
                playBtn &&
                playBtn.classList.contains('playing') &&
                playBtn.querySelector('.icon-play') &&
                !playBtn.querySelector('.icon-stop')
              ),
              recordButtonZeroStroke: Boolean(
                recCs &&
                (recCs.boxShadow === 'none' || recCs.boxShadow === '') &&
                (parseFloat(recCs.borderTopWidth || '0') === 0)
              ),
              redDotSizePx: dotRect ? [Math.round(dotRect.width), Math.round(dotRect.height)] : null,
              redDotZeroStroke: Boolean(
                dotCs && (dotCs.boxShadow === 'none' || dotCs.boxShadow === '')
              ),
              isPlayingAutoStarted: Boolean(window.JigAgent?.state?.isPlaying)
            };
          }"""
      )

      sample_offsets_sec = [1.2, 3.3, 5.5, 7.7, 9.8, 11.3]
      for idx, offset_sec in enumerate(sample_offsets_sec, start=1):
        now_rel = time.monotonic() - record_click_mono
        wait_ms = max(60, int((offset_sec - now_rel) * 1000))
        page.wait_for_timeout(wait_ms)
        vid_ts = round(time.monotonic() - video_start_mono, 2)
        sample = page.evaluate(TELEMETRY_BEAT_JS, f"beat-{idx:02d}")
        sample["videoTimestampSec"] = vid_ts
        beat_samples.append(sample)
        if idx <= 5:
          keyframe_timestamps.append(vid_ts)

      deadline = record_click_mono + max(13.5, args.duration + 2.0)
      output_appeared = False
      while time.monotonic() < deadline:
        output_appeared = page.evaluate(
            "() => Boolean(document.querySelector('[data-jig-record-output=\"true\"]'))"
        )
        if output_appeared:
          break
        page.wait_for_timeout(120)

      if not output_appeared:
        if not click_if_visible(page, '[data-jig-record-toggle="true"]', timeout_ms=1000):
          page.evaluate("() => window.JigAgent?.stopRecording?.()")
        page.wait_for_timeout(250)

      page.wait_for_timeout(750)
      output_vid_ts = round(time.monotonic() - video_start_mono, 2)
      keyframe_timestamps.append(output_vid_ts)
      output_banner_check = page.evaluate(
          """() => {
            const banner = document.querySelector('[data-jig-record-output="true"]');
            const summary = document.querySelector('.jig-output-summary');
            const replayBtn = document.querySelector('[data-jig-record-replay="true"]');
            const exportBtn = document.querySelector('[data-jig-record-export="true"]');
            const closeBtn = document.querySelector('[data-jig-record-close="true"]');
            const cs = banner ? window.getComputedStyle(banner) : null;
            return {
              visible: Boolean(banner),
              summaryText: summary ? (summary.textContent || '').trim() : null,
              hasReplayBtn: Boolean(replayBtn),
              hasExportJsonBtn: Boolean(exportBtn),
              hasCloseBtn: Boolean(closeBtn),
              zeroStroke: Boolean(cs && (cs.boxShadow === 'none' || cs.boxShadow === '')),
              recordingStoppedCleanly: document.body.getAttribute('data-jig-recording') !== 'true' && !document.querySelector('.jig-record-btn.recording')
            };
          }"""
      )
      output_beat = page.evaluate(TELEMETRY_BEAT_JS, "beat-07-output-banner")
      output_beat["videoTimestampSec"] = output_vid_ts
      beat_samples.append(output_beat)

      fps_summary = page.evaluate(
          """() => {
            const m = window.__jigFpsMeter;
            if (!m) return { fpsEstimate: null, p95FrameMs: null, droppedFramesOver34ms: 0 };
            m.running = false;
            const elapsedSec = Math.max(0.001, (performance.now() - m.startTs) / 1000);
            const sorted = [...m.deltas].sort((a, b) => a - b);
            const p95 = sorted.length > 0 ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 16.67;
            const dropped = m.deltas.filter((d) => d > 34).length;
            return {
              fpsEstimate: Number((m.frames / elapsedSec).toFixed(1)),
              p95FrameMs: Number(p95.toFixed(2)),
              droppedFramesOver34ms: dropped,
              totalFrames: m.frames
            };
          }"""
      )

      page.wait_for_timeout(650)
      wall_elapsed = round(time.monotonic() - record_click_mono, 2)

      video_obj = page.video
      if video_obj is None:
        raise RuntimeError("Playwright video object was not initialized.")
      page.close()
      context.close()
      webm_path = pathlib.Path(video_obj.path())
      browser.close()

    video_meta, keyframe_paths = encode_mp4_and_extract_keyframes(
        webm_path=webm_path,
        mp4_out=mp4_out,
        keyframes_dir=keyframes_dir,
        sample_timestamps_sec=keyframe_timestamps,
    )

  all_overlaps = []
  for b in beat_samples:
    for ov in b.get("overlaps", []):
      all_overlaps.append({"beat": b["beat"], **ov})

  total_btns = sum(int(b.get("buttonsTotal", 0)) for b in beat_samples)
  total_opt = sum(int(b.get("buttonsOpticallyCentered", 0)) for b in beat_samples)
  total_geom = sum(int(b.get("buttonsGeometricCount", 0)) for b in beat_samples)
  seen_geom: dict[str, dict[str, Any]] = {}
  for b in beat_samples:
    for g in b.get("geometricButtonSamples", []):
      key = f"{g['selector']}|{g['label']}"
      if key not in seen_geom:
        seen_geom[key] = {"beat": b["beat"], **g}

  global_min_font = min(
      (float(b.get("minFontSizePx", 13.5)) for b in beat_samples), default=13.5
  )
  sub12_all = []
  for b in beat_samples:
    for s in b.get("sub12pxSamples", []):
      sub12_all.append({"beat": b["beat"], **s})

  contrast_flat = []
  for b in beat_samples:
    for c in b.get("contrastSamples", []):
      contrast_flat.append({"beat": b["beat"], "theme": b["theme"], **c})

  audit_report = {
      "targetUrl": target_url,
      "recordingUiCheck": {
          **record_start_check,
          "clickedRecordButton": clicked_record_btn,
          "outputBanner": output_banner_check,
          "stoppedCleanly": bool(output_banner_check.get("recordingStoppedCleanly")),
          "wallElapsedSec": wall_elapsed,
      },
      "video": video_meta,
      "keyframes": keyframe_paths,
      "keyframeTimestampsSec": keyframe_timestamps,
      "safeZoneOverlaps": {
          "totalOverlapCount": len(all_overlaps),
          "overlaps": all_overlaps,
          "perBeatClearances": [
              {"beat": b["beat"], "slide": b["slide"], **(b["clearances"] or {})}
              for b in beat_samples
          ],
      },
      "buttonOpticalCentering": {
          "sampledButtonsTotal": total_btns,
          "opticallyCenteredButtons": total_opt,
          "geometricCenteredButtons": total_geom,
          "opticalCompliancePct": round(
              (100.0 * total_opt / total_btns), 1
          )
          if total_btns > 0
          else 100.0,
          "stageButtonsNeedingOpticalOffset": list(seen_geom.values()),
      },
      "minFontSizePx": global_min_font,
      "sub12pxViolations": sub12_all,
      "fpsEstimate": fps_summary.get("fpsEstimate"),
      "motionFrameMetrics": fps_summary,
      "contrastSamples": contrast_flat,
      "consoleErrors": console_errors,
      "pageErrors": page_errors,
      "beats": beat_samples,
  }

  telemetry_out.parent.mkdir(parents=True, exist_ok=True)
  telemetry_out.write_text(json.dumps(audit_report, indent=2) + "\n", encoding="utf-8")
  print(
      json.dumps(
          {
              "status": "ok",
              "mp4Out": str(mp4_out),
              "telemetryOut": str(telemetry_out),
              "keyframes": keyframe_paths,
              "recordingUiCheck": audit_report["recordingUiCheck"],
              "safeZoneOverlapCount": len(all_overlaps),
              "minFontSizePx": global_min_font,
              "fpsEstimate": fps_summary.get("fpsEstimate"),
              "consoleErrorCount": len(console_errors),
              "pageErrorCount": len(page_errors),
          },
          indent=2,
      )
  )


if __name__ == "__main__":
  try:
    main()
  except Exception as exc:
    print(json.dumps({"status": "error", "error": str(exc)}), file=sys.stderr)
    sys.exit(1)
