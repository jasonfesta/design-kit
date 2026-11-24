import { useCallback, useEffect, useRef, useState } from 'react';
import { DesignKitJigBars } from './components/DesignKitJigBars';
import { ParameterInspectorDrawer } from './components/ParameterInspectorDrawer';
import { StageEnvironment } from './components/StageEnvironment';
import { VariantNotchesRail } from './components/VariantNotchesRail';
import {
  DEFAULT_LIB,
  DEFAULT_STYLE,
  INSPECTOR_SCHEMA_DEFINITIONS,
  JIG_CONFIG,
  LIB_SLOTS,
  RECORD_TAKE_SECONDS,
  STYLE_SLOTS,
  TOC_DOMAIN_GROUPS,
  TOC_ENTRIES,
  createInitialInspectorValues,
  getDonorVariantsForStyle,
  getStyleTokenSpec,
  type HarnessSlideId,
  type InspectorSchemaKey,
  type JigAgentAPI,
  type JigAgentState,
  type JigTheme,
  type LibSlot,
  type RecordingOutputSummary,
  type StageMode,
  type StyleSlot,
} from './data/jigHarnessData';
import { buildStandaloneHref } from './data/jigTraceAndPrompt';
import { startStageAutopilot } from './utils/autopilot';

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(1, Math.floor(totalSeconds));
  const mins = String(Math.floor(safe / 60)).padStart(2, '0');
  const secs = String(safe % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function countLiveSafeZoneOverlaps(): number {
  const stageMount =
    document.querySelector('.jig-stage-mount') ??
    document.querySelector('[data-jig-stage-viewport]');
  const stageChild = stageMount?.firstElementChild as HTMLElement | null;
  if (!stageChild) return 0;
  const sr = stageChild.getBoundingClientRect();
  if (sr.width <= 1 || sr.height <= 1) return 0;

  const perimeters = [
    '.floating-style-plate',
    '.floating-lib-plate',
    '.floating-motion-plate',
    '.toc-list',
    '.right-variant-notches',
  ];
  let overlaps = 0;
  for (const sel of perimeters) {
    const pEl = document.querySelector<HTMLElement>(sel);
    if (!pEl) continue;
    const cs = window.getComputedStyle(pEl);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) {
      continue;
    }
    const pr = pEl.getBoundingClientRect();
    const ix = Math.max(0, Math.min(sr.right, pr.right) - Math.max(sr.left, pr.left));
    const iy = Math.max(0, Math.min(sr.bottom, pr.bottom) - Math.max(sr.top, pr.top));
    if (ix > 1 && iy > 1) {
      overlaps += 1;
    }
  }
  return overlaps;
}

function resolveStandaloneLaunchParams() {
  const defaultTheme: JigTheme =
    JIG_CONFIG.defaultTheme === 'light' ? 'light' : 'dark';
  if (typeof window === 'undefined') {
    return {
      isStandalone: false,
      group: null,
      style: DEFAULT_STYLE,
      lib: DEFAULT_LIB,
      variant: 1,
      theme: defaultTheme,
      slide: null as HarnessSlideId | null,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const rawDomain = window.__STANDALONE_DOMAIN__ || params.get('app');
  const noJig = params.get('nojig');
  const group = rawDomain
    ? TOC_DOMAIN_GROUPS.find((g) => {
        const norm = rawDomain.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const d = g.domain.toLowerCase().replace(/[^a-z0-9]/g, '');
        const l = g.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        return d === norm || l === norm;
      }) ?? null
    : null;
  const rawStyle = params.get('style') as StyleSlot | null;
  const style: StyleSlot =
    rawStyle && STYLE_SLOTS.includes(rawStyle) ? rawStyle : DEFAULT_STYLE;
  const rawLib = params.get('lib') as LibSlot | null;
  const lib: LibSlot =
    rawLib && LIB_SLOTS.some((item) => item.id === rawLib) ? rawLib : DEFAULT_LIB;
  const rawVariant = Number(params.get('variant') || '1');
  const variant =
    Number.isFinite(rawVariant) && rawVariant >= 1 && rawVariant <= 5
      ? Math.round(rawVariant)
      : 1;
  const rawTheme = params.get('theme');
  const theme: JigTheme =
    rawTheme === 'light' || rawTheme === 'dark' ? rawTheme : defaultTheme;
  const rawSlide = params.get('slide') as HarnessSlideId | null;
  const slide =
    rawSlide && TOC_ENTRIES.some((e) => e.id === rawSlide) ? rawSlide : null;
  const isStandalone = Boolean(group) || noJig === '1' || noJig === 'true';

  return { isStandalone, group, style, lib, variant, theme, slide };
}

const GENERIC_RECORD_BEAT_AT_MS = [2200, 4400, 6600, 8800, 10600] as const;
const PREFERRED_RECORD_STYLES = ['editorial', 'editorial', 'clean', 'clean', 'product'] as const;
function pickRecordBeatStyle(beatIdx: number): StyleSlot {
  const preferred = PREFERRED_RECORD_STYLES[beatIdx];
  if (preferred && STYLE_SLOTS.includes(preferred)) {
    return preferred;
  }
  if (STYLE_SLOTS.length === 0) return DEFAULT_STYLE;
  return STYLE_SLOTS[(beatIdx + 1) % STYLE_SLOTS.length] ?? DEFAULT_STYLE;
}
const GENERIC_RECORD_THEMES: readonly JigTheme[] = [
  'dark',
  'dark',
  'light',
  'dark',
  'dark',
];

export function App() {
  const launch = resolveStandaloneLaunchParams();
  const initialSlideId: HarnessSlideId =
    launch.slide ??
    (launch.group ? launch.group.defaultSlide : TOC_ENTRIES[0]?.id ?? 'component');
  const initialEntry =
    TOC_ENTRIES.find((item) => item.id === initialSlideId) ?? TOC_ENTRIES[0];

  const [state, setState] = useState<JigAgentState>(() => ({
    activeSlide: initialEntry.id,
    activeStyle: launch.style,
    activeLib: launch.lib,
    jigTheme: launch.theme,
    appLibsDisabled: initialEntry.chromeMode === 'app',
    immLibsDisabled: initialEntry.chromeMode === 'immersive',
    inspectorCollapsed: false,
    inspectorSchema: initialEntry.inspectorSchema ?? null,
    inspectorValues: createInitialInspectorValues(),
    activeVariant: launch.variant,
    isPlaying: false,
    isRecording: false,
    recordingElapsedSec: 0,
    recordingOutput: null,
    travelProgress: 0,
    stageMode: launch.slide
      ? initialEntry.stageMode
      : launch.group
        ? 'view'
        : initialEntry.stageMode,
  }));

  const stateRef = useRef(state);
  stateRef.current = state;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const recordStartTsRef = useRef<number | null>(null);
  const recordBeatIdxRef = useRef<number>(-1);
  const recordTelemetryRef = useRef<{
    slides: Set<string>;
    styles: Set<StyleSlot>;
    themes: Set<JigTheme>;
    overlaps: number;
  }>({
    slides: new Set<string>(),
    styles: new Set<StyleSlot>(),
    themes: new Set<JigTheme>(),
    overlaps: 0,
  });

  const callbacksRef = useRef<{
    onStyleChange?: JigAgentAPI['onStyleChange'];
    onLibChange?: JigAgentAPI['onLibChange'];
    onInspectorChange?: JigAgentAPI['onInspectorChange'];
    onVariantChange?: JigAgentAPI['onVariantChange'];
  }>({});

  const applyDomSync = useCallback((next: JigAgentState) => {
    const html = document.documentElement;
    const body = document.body;

    html.dataset.jigTheme = next.jigTheme;
    html.dataset.theme = next.jigTheme;
    body.dataset.theme = next.jigTheme;
    body.dataset.activeStyle = next.activeStyle;
    body.dataset.jig = next.activeStyle;
    body.dataset.activeLib = next.activeLib;
    body.dataset.activeVariant = String(next.activeVariant);
    body.dataset.slide = next.activeSlide;
    body.dataset.appLibsDisabled = next.appLibsDisabled ? 'true' : 'false';
    body.dataset.immLibsDisabled = next.immLibsDisabled ? 'true' : 'false';

    if (next.isRecording) {
      body.dataset.jigRecording = 'true';
    } else {
      delete body.dataset.jigRecording;
    }

    if (next.recordingOutput) {
      body.dataset.jigRecordComplete = 'true';
    } else {
      delete body.dataset.jigRecordComplete;
    }

    const stageEl = document.querySelector('[data-jig-stage-viewport]');
    if (stageEl) {
      stageEl.setAttribute('data-stage-mode', next.stageMode);
    }

    const styleSpec = getStyleTokenSpec(next.activeStyle);
    const accent =
      next.jigTheme === 'dark' ? styleSpec.accentDark : styleSpec.accentLight;

    html.style.setProperty('--style-radius', `${styleSpec.radiusPx}px`);
    html.style.setProperty('--style-border-w', `${styleSpec.borderWidthPx}px`);
    html.style.setProperty('--style-border-style', styleSpec.borderStyle);
    html.style.setProperty('--style-accent', accent);
  }, []);

  const commitState = useCallback(
    (updater: (prev: JigAgentState) => JigAgentState) => {
      const next = updater(stateRef.current);
      stateRef.current = next;
      if (next.isRecording) {
        recordTelemetryRef.current.slides.add(next.activeSlide);
        recordTelemetryRef.current.styles.add(next.activeStyle);
        recordTelemetryRef.current.themes.add(next.jigTheme);
      }
      applyDomSync(next);
      setState(next);
      return next;
    },
    [applyDomSync],
  );

  useEffect(() => {
    applyDomSync(state);
  }, [state, applyDomSync]);

  const setSlide = useCallback(
    (slideId: HarnessSlideId) => {
      const entry = TOC_ENTRIES.find((item) => item.id === slideId) ?? TOC_ENTRIES[0];
      commitState((prev) => ({
        ...prev,
        activeSlide: entry.id,
        stageMode: entry.stageMode,
        inspectorSchema: entry.inspectorSchema ?? null,
        inspectorCollapsed: false,
        immLibsDisabled: entry.chromeMode === 'immersive',
        appLibsDisabled: entry.chromeMode === 'app',
      }));
      if (viewportRef.current) {
        viewportRef.current.scrollTop = 0;
      }
    },
    [commitState],
  );

  const setStyle = useCallback(
    (nextStyle: StyleSlot) => {
      const prevStyle = stateRef.current.activeStyle;
      if (prevStyle === nextStyle) return;
      commitState((prev) => ({
        ...prev,
        activeStyle: nextStyle,
        activeVariant: 1,
      }));
      callbacksRef.current.onStyleChange?.(nextStyle, prevStyle);
      window.dispatchEvent(
        new CustomEvent('jig:style-change', { detail: { style: nextStyle, prevStyle } }),
      );
    },
    [commitState],
  );

  const setLib = useCallback(
    (nextLib: LibSlot) => {
      if (stateRef.current.appLibsDisabled || stateRef.current.immLibsDisabled) return;
      const prevLib = stateRef.current.activeLib;
      if (prevLib === nextLib) return;
      commitState((prev) => ({
        ...prev,
        activeLib: nextLib,
      }));
      callbacksRef.current.onLibChange?.(nextLib, prevLib);
      window.dispatchEvent(
        new CustomEvent('jig:lib-change', { detail: { lib: nextLib, prevLib } }),
      );
    },
    [commitState],
  );

  const setTheme = useCallback(
    (nextTheme: JigTheme) => {
      commitState((prev) => ({
        ...prev,
        jigTheme: nextTheme,
      }));
    },
    [commitState],
  );

  const toggleTheme = useCallback(() => {
    if (stateRef.current.appLibsDisabled) return;
    const nextTheme: JigTheme = stateRef.current.jigTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [setTheme]);

  const syncAppLibraryLockState = useCallback(
    (locked: boolean) => {
      commitState((prev) => ({
        ...prev,
        appLibsDisabled: locked,
      }));
    },
    [commitState],
  );

  const setInspectorCollapsed = useCallback(
    (collapsed: boolean) => {
      commitState((prev) => ({
        ...prev,
        inspectorCollapsed: collapsed,
      }));
    },
    [commitState],
  );

  const setInspectorValue = useCallback(
    (
      key: string,
      value: string | number | boolean,
      targetSchema?: InspectorSchemaKey,
    ) => {
      const schema = targetSchema ?? stateRef.current.inspectorSchema;
      if (!schema) return;
      const nextSchemaValues = {
        ...stateRef.current.inspectorValues[schema],
        [key]: value,
      };
      document.documentElement.style.setProperty(`--jig-param-${key}`, String(value));
      commitState((prev) => ({
        ...prev,
        inspectorValues: {
          ...prev.inspectorValues,
          [schema]: nextSchemaValues,
        },
      }));
      callbacksRef.current.onInspectorChange?.(key, value, schema, nextSchemaValues);
      window.dispatchEvent(
        new CustomEvent('style-jig:immersive-change', {
          detail: { key, value, schema, allValues: nextSchemaValues },
        }),
      );
    },
    [commitState],
  );

  const resetInspectorSchema = useCallback(
    (targetSchema?: InspectorSchemaKey) => {
      const schema = targetSchema ?? stateRef.current.inspectorSchema;
      if (!schema) return;
      const defaults = { ...INSPECTOR_SCHEMA_DEFINITIONS[schema].defaults };
      commitState((prev) => ({
        ...prev,
        activeStyle: schema === 'parallax' ? 'clone' : prev.activeStyle,
        inspectorValues: {
          ...prev.inspectorValues,
          [schema]: defaults,
        },
      }));
      if (schema === 'parallax' && viewportRef.current) {
        viewportRef.current.scrollTop = 0;
      }
    },
    [commitState],
  );

  const setVariant = useCallback(
    (nextVariant: number) => {
      const variants = getDonorVariantsForStyle(stateRef.current.activeStyle);
      const maxCount = Math.max(1, variants.length);
      const clamped = Math.max(1, Math.min(maxCount, nextVariant));
      const prevVariant = stateRef.current.activeVariant;
      if (prevVariant === clamped) return;
      const activeStyle = stateRef.current.activeStyle;
      commitState((prev) => ({
        ...prev,
        activeVariant: clamped,
      }));
      callbacksRef.current.onVariantChange?.(clamped, prevVariant, activeStyle);
      window.dispatchEvent(
        new CustomEvent('jig-style-variant', {
          detail: { style: activeStyle, variant: clamped },
        }),
      );
    },
    [commitState],
  );

  const pause = useCallback(() => {
    if (!stateRef.current.isPlaying) return;
    commitState((prev) => ({
      ...prev,
      isPlaying: false,
      travelProgress: 0,
    }));
  }, [commitState]);

  const play = useCallback(() => {
    commitState((prev) => ({
      ...prev,
      isPlaying: true,
    }));
  }, [commitState]);

  const togglePlay = useCallback(() => {
    if (stateRef.current.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const clearRecordingOutput = useCallback(() => {
    commitState((prev) => ({
      ...prev,
      recordingOutput: null,
    }));
  }, [commitState]);

  const finishRecording = useCallback(
    (forcedSeconds?: number) => {
      if (!stateRef.current.isRecording) return;
      const measuredSec =
        recordStartTsRef.current !== null
          ? Math.max(
              1,
              stateRef.current.recordingElapsedSec,
              Math.round((performance.now() - recordStartTsRef.current) / 1000),
            )
          : Math.max(1, stateRef.current.recordingElapsedSec);
      const finalSec = forcedSeconds ?? measuredSec;

      const latestOverlaps = Math.max(
        recordTelemetryRef.current.overlaps,
        countLiveSafeZoneOverlaps(),
      );
      const visitedSlides = Array.from(recordTelemetryRef.current.slides);
      const stylesVisited = Array.from(recordTelemetryRef.current.styles);
      const themesVisited = Array.from(recordTelemetryRef.current.themes);

      const output: RecordingOutputSummary = {
        durationSec: finalSec,
        formattedDuration: formatDuration(finalSec),
        viewsVisited: Math.max(1, visitedSlides.length),
        visitedSlides,
        stylesVisited,
        themesVisited,
        safeZoneOverlaps: latestOverlaps,
        completedAtIso: new Date().toISOString(),
      };

      recordStartTsRef.current = null;
      recordBeatIdxRef.current = -1;

      commitState((prev) => ({
        ...prev,
        isRecording: false,
        isPlaying: false,
        recordingElapsedSec: 0,
        recordingOutput: output,
        travelProgress: 0,
      }));

      window.dispatchEvent(
        new CustomEvent('jig:record-stop', {
          detail: { elapsedSec: finalSec, output },
        }),
      );
    },
    [commitState],
  );

  const startRecording = useCallback(() => {
    if (stateRef.current.isRecording) return;
    const now = performance.now();
    recordStartTsRef.current = now;
    recordBeatIdxRef.current = -1;

    const startEntry = TOC_ENTRIES[0];
    const startStyle = DEFAULT_STYLE;
    recordTelemetryRef.current = {
      slides: new Set<string>([startEntry.id]),
      styles: new Set<StyleSlot>([startStyle]),
      themes: new Set<JigTheme>(['dark']),
      overlaps: 0,
    };

    commitState((prev) => ({
      ...prev,
      activeSlide: startEntry.id,
      stageMode: startEntry.stageMode,
      inspectorSchema: startEntry.inspectorSchema ?? null,
      immLibsDisabled: startEntry.chromeMode === 'immersive',
      appLibsDisabled: startEntry.chromeMode === 'app',
      activeStyle: startStyle,
      jigTheme: 'dark',
      activeVariant: 1,
      isRecording: true,
      recordingElapsedSec: 0,
      recordingOutput: null,
      isPlaying: true,
    }));

    window.dispatchEvent(
      new CustomEvent('jig:record-start', {
        detail: { slide: startEntry.id, style: startStyle, durationSec: RECORD_TAKE_SECONDS },
      }),
    );
  }, [commitState]);

  const stopRecording = useCallback(() => {
    finishRecording();
  }, [finishRecording]);

  const toggleRecording = useCallback(() => {
    if (stateRef.current.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [startRecording, stopRecording]);

  const replayRecording = useCallback(() => {
    const first = TOC_ENTRIES[0];
    commitState((prev) => ({
      ...prev,
      activeSlide: first.id,
      stageMode: first.stageMode,
      inspectorSchema: first.inspectorSchema ?? null,
      immLibsDisabled: first.chromeMode === 'immersive',
      appLibsDisabled: first.chromeMode === 'app',
      activeStyle: DEFAULT_STYLE,
      jigTheme: 'dark',
      activeVariant: 1,
      recordingOutput: null,
    }));
    window.requestAnimationFrame(() => {
      startRecording();
    });
  }, [commitState, startRecording]);

  const exportRecordingJson = useCallback(() => {
    const out = stateRef.current.recordingOutput;
    if (!out) return;
    const blob = new Blob([JSON.stringify(out, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jig-recording-output.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const setStageMode = useCallback(
    (mode: StageMode) => {
      commitState((prev) => {
        const currentEntry =
          TOC_ENTRIES.find((item) => item.id === prev.activeSlide) ?? TOC_ENTRIES[0];
        if (currentEntry.stageMode === mode) {
          return prev;
        }
        const group =
          TOC_DOMAIN_GROUPS.find((g) => g.domain === currentEntry.domain) ??
          TOC_DOMAIN_GROUPS[0];
        const targetEntry =
          mode === 'view'
            ? group.items.find((item) => item.stageMode === 'view') ?? group.items[0]
            : TOC_ENTRIES.find((item) => item.id === group.defaultSlide) ?? group.items[0];
        return {
          ...prev,
          activeSlide: targetEntry.id,
          stageMode: mode,
          inspectorSchema: targetEntry.inspectorSchema ?? null,
          immLibsDisabled: targetEntry.chromeMode === 'immersive',
          appLibsDisabled: targetEntry.chromeMode === 'app',
        };
      });
    },
    [commitState],
  );

  const getStandaloneUrl = useCallback(() => {
    const cur = stateRef.current;
    const entry = TOC_ENTRIES.find((item) => item.id === cur.activeSlide) ?? TOC_ENTRIES[0];
    return buildStandaloneHref({
      domain: entry.domain,
      slideId: cur.activeSlide,
      activeStyle: cur.activeStyle,
      activeVariant: cur.activeVariant,
      activeLib: cur.activeLib,
      jigTheme: cur.jigTheme,
    });
  }, []);

  // Built-in 12-second UI showcase choreography + auto-finish output banner
  useEffect(() => {
    if (!state.isRecording) return;
    if (recordStartTsRef.current === null) {
      recordStartTsRef.current = performance.now();
    }

    const timerId = window.setInterval(() => {
      if (!stateRef.current.isRecording) return;
      const now = performance.now();
      const startTs = recordStartTsRef.current ?? now;
      const elapsedMs = Math.max(0, now - startTs);
      const nextSec = Math.min(RECORD_TAKE_SECONDS, Math.floor(elapsedMs / 1000));

      recordTelemetryRef.current.overlaps = Math.max(
        recordTelemetryRef.current.overlaps,
        countLiveSafeZoneOverlaps(),
      );

      if (nextSec !== stateRef.current.recordingElapsedSec) {
        commitState((prev) => ({
          ...prev,
          recordingElapsedSec: nextSec,
        }));
      }

      let targetIdx = -1;
      for (let i = 0; i < GENERIC_RECORD_BEAT_AT_MS.length; i += 1) {
        if (elapsedMs >= GENERIC_RECORD_BEAT_AT_MS[i]) {
          targetIdx = i;
        }
      }
      if (targetIdx > recordBeatIdxRef.current) {
        recordBeatIdxRef.current = targetIdx;
        const entry = TOC_ENTRIES[(targetIdx + 1) % TOC_ENTRIES.length] ?? TOC_ENTRIES[0];
        const nextStyle = pickRecordBeatStyle(targetIdx);
        const nextTheme =
          entry.chromeMode === 'app'
            ? stateRef.current.jigTheme
            : GENERIC_RECORD_THEMES[targetIdx] ?? 'dark';
        const prevStyle = stateRef.current.activeStyle;

        commitState((prev) => ({
          ...prev,
          activeSlide: entry.id,
          stageMode: entry.stageMode,
          inspectorSchema: entry.inspectorSchema ?? null,
          immLibsDisabled: entry.chromeMode === 'immersive',
          appLibsDisabled: entry.chromeMode === 'app',
          activeStyle: nextStyle,
          jigTheme: nextTheme,
          activeVariant: 1,
        }));
        if (prevStyle !== nextStyle) {
          callbacksRef.current.onStyleChange?.(nextStyle, prevStyle);
          window.dispatchEvent(
            new CustomEvent('jig:style-change', {
              detail: { style: nextStyle, prevStyle },
            }),
          );
        }
      }

      if (elapsedMs >= RECORD_TAKE_SECONDS * 1000) {
        finishRecording(RECORD_TAKE_SECONDS);
      }
    }, 120);

    return () => window.clearInterval(timerId);
  }, [state.isRecording, commitState, finishRecording]);

  // Alt+1..5 variant shortcuts & Escape to stop recording / auto-travel
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.isTrusted) return;
      if (e.key === 'Escape') {
        if (stateRef.current.isRecording) {
          stopRecording();
          return;
        }
        if (stateRef.current.isPlaying) {
          pause();
          return;
        }
      }
      if (e.altKey) {
        const match = /^Digit([1-5])$/.exec(e.code);
        if (match) {
          e.preventDefault();
          setVariant(Number(match[1]));
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pause, setVariant, stopRecording]);

  // Interactive Playback Autopilot (.ap-cursor) + smooth scroll glide + yield on manual user input
  useEffect(() => {
    if (!state.isPlaying) return;

    const stopAutopilot = startStageAutopilot();

    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      setState((prev) => {
        if (!prev.isPlaying) return prev;
        const nextProgress = (prev.travelProgress + dt * 0.22) % 1;
        const el = viewportRef.current;
        if (el && prev.stageMode === 'view') {
          const maxScroll = el.scrollHeight - el.clientHeight;
          if (maxScroll > 4) {
            const wave = 0.5 - 0.5 * Math.cos(nextProgress * Math.PI * 2);
            el.scrollTop = wave * maxScroll;
          }
        }
        const nextState = { ...prev, travelProgress: nextProgress };
        stateRef.current = nextState;
        return nextState;
      });

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    const yieldOnManualInput = (event: Event) => {
      if (!event.isTrusted) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.closest('[data-jig-play-toggle]') ||
          target.closest('[data-jig-record-toggle]') ||
          target.closest('[data-jig-record-output]') ||
          target.closest('[data-jig-action]'))
      ) {
        return;
      }
      if (stateRef.current.isRecording) {
        return;
      }
      pause();
    };

    window.addEventListener('wheel', yieldOnManualInput, { passive: true });
    window.addEventListener('pointerdown', yieldOnManualInput, { passive: true });
    window.addEventListener('touchstart', yieldOnManualInput, { passive: true });
    window.addEventListener('keydown', yieldOnManualInput);

    return () => {
      stopAutopilot();
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', yieldOnManualInput);
      window.removeEventListener('pointerdown', yieldOnManualInput);
      window.removeEventListener('touchstart', yieldOnManualInput);
      window.removeEventListener('keydown', yieldOnManualInput);
    };
  }, [state.isPlaying, pause]);

  // Expose imperative window.JigAgent and window.VariantNotches globals
  useEffect(() => {
    const jigAgent: JigAgentAPI = {
      state: stateRef.current,
      config: JIG_CONFIG,
      setSlide,
      setStyle,
      setLib,
      setTheme,
      toggleTheme,
      syncAppLibraryLockState,
      setInspectorCollapsed,
      setInspectorValue,
      resetInspectorSchema,
      play,
      pause,
      togglePlay,
      isRecording: () => stateRef.current.isRecording,
      startRecording,
      stopRecording,
      toggleRecording,
      clearRecordingOutput,
      setStageMode,
      getStandaloneUrl,
      get onStyleChange() {
        return callbacksRef.current.onStyleChange;
      },
      set onStyleChange(fn) {
        callbacksRef.current.onStyleChange = fn;
      },
      get onLibChange() {
        return callbacksRef.current.onLibChange;
      },
      set onLibChange(fn) {
        callbacksRef.current.onLibChange = fn;
      },
      get onInspectorChange() {
        return callbacksRef.current.onInspectorChange;
      },
      set onInspectorChange(fn) {
        callbacksRef.current.onInspectorChange = fn;
      },
      get onVariantChange() {
        return callbacksRef.current.onVariantChange;
      },
      set onVariantChange(fn) {
        callbacksRef.current.onVariantChange = fn;
      },
    };

    Object.defineProperty(jigAgent, 'state', {
      get: () => stateRef.current,
      enumerable: true,
    });

    window.JigAgent = jigAgent;
    window.VariantNotches = {
      get state() {
        const list = getDonorVariantsForStyle(stateRef.current.activeStyle);
        return {
          activeVariant: stateRef.current.activeVariant,
          count: list.length,
          activeStyle: stateRef.current.activeStyle,
        };
      },
      setVariant,
      next: () => {
        const count = Math.max(1, getDonorVariantsForStyle(stateRef.current.activeStyle).length);
        setVariant((stateRef.current.activeVariant % count) + 1);
      },
      prev: () => {
        const count = Math.max(1, getDonorVariantsForStyle(stateRef.current.activeStyle).length);
        setVariant(((stateRef.current.activeVariant + count - 2) % count) + 1);
      },
    };
  }, [
    clearRecordingOutput,
    getStandaloneUrl,
    pause,
    play,
    resetInspectorSchema,
    setInspectorCollapsed,
    setInspectorValue,
    setLib,
    setSlide,
    setStageMode,
    setStyle,
    setTheme,
    setVariant,
    startRecording,
    stopRecording,
    syncAppLibraryLockState,
    togglePlay,
    toggleRecording,
    toggleTheme,
  ]);

  const activeTocEntry =
    TOC_ENTRIES.find((item) => item.id === state.activeSlide) ?? TOC_ENTRIES[0];
  const showVariantNotches =
    state.activeStyle !== 'clone' && activeTocEntry.chromeMode !== 'immersive';
  const collapsedInspectorTitle = state.inspectorSchema
    ? INSPECTOR_SCHEMA_DEFINITIONS[state.inspectorSchema].title
    : null;

  if (launch.isStandalone) {
    return (
      <StageEnvironment
        standalone
        state={state}
        viewportRef={viewportRef}
        onSelectSlide={setSlide}
      />
    );
  }

  return (
    <>
      <DesignKitJigBars
        activeDomain={activeTocEntry.domain}
        activeSlide={state.activeSlide}
        activeStyle={state.activeStyle}
        activeVariant={state.activeVariant}
        activeLib={state.activeLib}
        jigTheme={state.jigTheme}
        stageMode={state.stageMode}
        appLibsDisabled={state.appLibsDisabled}
        immLibsDisabled={state.immLibsDisabled}
        inspectorSchema={state.inspectorSchema}
        collapsedInspectorTitle={collapsedInspectorTitle}
        inspectorCollapsed={state.inspectorCollapsed}
        isPlaying={state.isPlaying}
        isRecording={state.isRecording}
        recordingElapsedSec={state.recordingElapsedSec}
        recordingOutput={state.recordingOutput}
        onSelectStyle={setStyle}
        onSelectLib={setLib}
        onToggleTheme={toggleTheme}
        onExpandInspector={() => setInspectorCollapsed(false)}
        onTogglePlay={togglePlay}
        onToggleRecording={toggleRecording}
        onReplayRecording={replayRecording}
        onExportRecordingJson={exportRecordingJson}
        onDismissRecordingOutput={clearRecordingOutput}
      />

      <ParameterInspectorDrawer
        schemaKey={state.inspectorSchema}
        collapsed={state.inspectorCollapsed}
        pairedWithMobile={activeTocEntry.domain === 'app'}
        values={
          state.inspectorSchema ? state.inspectorValues[state.inspectorSchema] : null
        }
        onChangeValue={(key, val) => setInspectorValue(key, val)}
        onReset={() => resetInspectorSchema()}
        onCollapse={() => setInspectorCollapsed(true)}
        onInteractStart={() => {
          if (!stateRef.current.isRecording) {
            pause();
          }
        }}
      />

      <VariantNotchesRail
        activeStyle={state.activeStyle}
        activeVariant={state.activeVariant}
        visible={showVariantNotches}
        onSelectVariant={setVariant}
      />

      <StageEnvironment
        state={state}
        viewportRef={viewportRef}
        onSelectSlide={setSlide}
      />
    </>
  );
}
