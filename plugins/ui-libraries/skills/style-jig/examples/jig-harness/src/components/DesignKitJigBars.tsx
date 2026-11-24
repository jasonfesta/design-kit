import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  LIB_SLOTS,
  STYLE_SLOTS,
  TOC_ENTRIES,
  type HarnessDomain,
  type HarnessSlideId,
  type JigTheme,
  type LibSlot,
  type RecordingOutputSummary,
  type StageMode,
  type StyleSlot,
} from '../data/jigHarnessData';
import {
  buildPromptClipboardPayload,
  buildStandaloneHref,
  openTraceMarkdownWindow,
  type JigPromptClipboardPayload,
  type TraceOpenResult,
} from '../data/jigTraceAndPrompt';
import { cn } from '../utils/cn';

function fallbackCopyText(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  ta.style.left = '-9999px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  document.body.removeChild(ta);
  return copied;
}

async function copyPromptPayloadToClipboard(payload: JigPromptClipboardPayload): Promise<boolean> {
  const record = (richHtmlCopied: boolean) => {
    if (typeof window === 'undefined') return;
    window.__LAST_COPIED_JIG_PROMPT__ = payload.promptText;
    window.__LAST_COPIED_JIG_PROMPT_BUNDLE__ = {
      promptText: payload.promptText,
      standaloneHtml: payload.standaloneHtml,
      capturedFromLiveDom: payload.capturedFromLiveDom,
      capturedElementCount: payload.capturedElementCount,
      matchedRuleCount: payload.matchedRuleCount,
      styleImageDataUri: payload.styleImageDataUri,
      styleImagePath: payload.styleImagePath,
      styleImageLabel: payload.styleImageLabel,
      key: payload.key,
      richHtmlCopied,
    };
  };

  const writePlain = async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(payload.promptText);
        return true;
      } catch {
        return fallbackCopyText(payload.promptText);
      }
    }
    return fallbackCopyText(payload.promptText);
  };

  record(false);

  const canWriteRich =
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function' &&
    typeof ClipboardItem !== 'undefined';

  if (!canWriteRich) {
    return writePlain();
  }

  try {
    const item = new ClipboardItem({
      'text/plain': new Blob([payload.promptText], { type: 'text/plain' }),
      'text/html': new Blob([payload.html], { type: 'text/html' }),
    });
    await navigator.clipboard.write([item]);
    record(true);
    return true;
  } catch {
    return writePlain();
  }
}

export interface DesignKitJigBarsProps {
  activeDomain?: HarnessDomain;
  activeSlide?: HarnessSlideId;
  activeStyle: StyleSlot;
  activeVariant?: number;
  activeLib: LibSlot;
  jigTheme: JigTheme;
  stageMode?: StageMode;
  appLibsDisabled: boolean;
  immLibsDisabled: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  recordingElapsedSec: number;
  recordingOutput?: RecordingOutputSummary | null;
  inspectorSchema?: string | null;
  collapsedInspectorTitle?: string | null;
  inspectorCollapsed?: boolean;
  onSelectStyle: (style: StyleSlot) => void;
  onSelectLib: (lib: LibSlot) => void;
  onToggleTheme: () => void;
  onExpandInspector?: () => void;
  onTogglePlay: () => void;
  onToggleRecording: () => void;
  onReplayRecording?: () => void;
  onExportRecordingJson?: () => void;
  onDismissRecordingOutput?: () => void;
}

export const DesignKitJigBars: React.FC<DesignKitJigBarsProps> = ({
  activeDomain,
  activeSlide = 'component',
  activeStyle,
  activeVariant = 1,
  activeLib,
  jigTheme,
  stageMode = 'component',
  appLibsDisabled,
  immLibsDisabled,
  isPlaying,
  isRecording,
  recordingElapsedSec: _recordingElapsedSec,
  recordingOutput = null,
  inspectorSchema = null,
  collapsedInspectorTitle = null,
  inspectorCollapsed = false,
  onSelectStyle,
  onSelectLib,
  onToggleTheme,
  onExpandInspector,
  onTogglePlay,
  onToggleRecording,
  onReplayRecording,
  onExportRecordingJson,
  onDismissRecordingOutput,
}) => {
  const topWrapRef = useRef<HTMLDivElement | null>(null);
  const stylePlateRef = useRef<HTMLElement | null>(null);
  const libPlateRef = useRef<HTMLElement | null>(null);
  const promptCopyTimerRef = useRef<number | null>(null);
  const traceCopyTimerRef = useRef<number | null>(null);

  const [promptCopied, setPromptCopied] = useState(false);
  const [traceModal, setTraceModal] = useState<TraceOpenResult | null>(null);
  const [traceMdCopied, setTraceMdCopied] = useState(false);

  const [stylePill, setStylePill] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [libPill, setLibPill] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const resolvedDomain: HarnessDomain =
    activeDomain ??
    TOC_ENTRIES.find((entry) => entry.id === activeSlide)?.domain ??
    'fullstack';

  const syncJigGeometry = useCallback(() => {
    const wrapEl = topWrapRef.current;
    if (wrapEl) {
      const rect = wrapEl.getBoundingClientRect();
      const topSafe = Math.max(66, Math.ceil(rect.bottom + 14));
      document.documentElement.style.setProperty('--jig-top-safe', `${topSafe}px`);
    }

    const styleEl = stylePlateRef.current;
    if (styleEl) {
      const btn = styleEl.querySelector<HTMLButtonElement>(`[data-jig-pick="${activeStyle}"]`);
      if (btn && btn.offsetWidth > 0) {
        setStylePill({ left: btn.offsetLeft, width: btn.offsetWidth, opacity: 1 });
        if (styleEl.scrollWidth > styleEl.clientWidth + 2) {
          const targetLeft = Math.max(
            0,
            btn.offsetLeft - Math.round((styleEl.clientWidth - btn.offsetWidth) / 2),
          );
          styleEl.scrollLeft = targetLeft;
        }
      } else {
        setStylePill((prev) => ({ ...prev, opacity: 0 }));
      }
    }

    const libEl = libPlateRef.current;
    if (libEl) {
      const dimmed = appLibsDisabled || immLibsDisabled;
      const btn = libEl.querySelector<HTMLButtonElement>(`[data-lib-pick="${activeLib}"]`);
      if (!dimmed && btn && btn.offsetWidth > 0) {
        setLibPill({ left: btn.offsetLeft, width: btn.offsetWidth, opacity: 1 });
      } else {
        setLibPill((prev) => ({ ...prev, opacity: 0 }));
      }
    }
  }, [activeStyle, activeLib, appLibsDisabled, immLibsDisabled]);

  useLayoutEffect(() => {
    syncJigGeometry();
  }, [syncJigGeometry, inspectorSchema, inspectorCollapsed]);

  useEffect(() => {
    const onResize = () => window.requestAnimationFrame(syncJigGeometry);
    window.addEventListener('resize', onResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && topWrapRef.current) {
      observer = new ResizeObserver(() => {
        syncJigGeometry();
      });
      observer.observe(topWrapRef.current);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => syncJigGeometry()).catch(() => {});
    }

    return () => {
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, [syncJigGeometry]);

  useEffect(() => {
    return () => {
      if (promptCopyTimerRef.current !== null) {
        window.clearTimeout(promptCopyTimerRef.current);
      }
      if (traceCopyTimerRef.current !== null) {
        window.clearTimeout(traceCopyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!traceModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTraceModal(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [traceModal]);

  const standaloneHref = useMemo(
    () =>
      buildStandaloneHref({
        domain: resolvedDomain,
        slideId: activeSlide,
        activeStyle,
        activeVariant,
        activeLib,
        jigTheme,
      }),
    [resolvedDomain, activeSlide, activeStyle, activeVariant, activeLib, jigTheme],
  );

  const handleOpenTrace = useCallback(() => {
    const result = openTraceMarkdownWindow({
      domain: resolvedDomain,
      slideId: activeSlide,
      activeStyle,
      activeVariant,
      activeLib,
      jigTheme,
      stageMode,
    });
    if (!result.openedInWindow) {
      setTraceMdCopied(false);
      setTraceModal(result);
    }
  }, [resolvedDomain, activeSlide, activeStyle, activeVariant, activeLib, jigTheme, stageMode]);

  const handleCopyPrompt = useCallback(() => {
    const payload = buildPromptClipboardPayload({
      domain: resolvedDomain,
      slideId: activeSlide,
      activeStyle,
      activeVariant,
      activeLib,
      jigTheme,
      stageMode,
    });
    void copyPromptPayloadToClipboard(payload).catch(() => {
      fallbackCopyText(payload.promptText);
    });
    setPromptCopied(true);
    if (promptCopyTimerRef.current !== null) {
      window.clearTimeout(promptCopyTimerRef.current);
    }
    promptCopyTimerRef.current = window.setTimeout(() => {
      setPromptCopied(false);
      promptCopyTimerRef.current = null;
    }, 1800);
  }, [resolvedDomain, activeSlide, activeStyle, activeVariant, activeLib, jigTheme, stageMode]);

  const handleCopyTraceMd = useCallback(() => {
    if (!traceModal) return;
    const text = traceModal.bundle.traceMarkdown;
    if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
      navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
    } else {
      fallbackCopyText(text);
    }
    setTraceMdCopied(true);
    if (traceCopyTimerRef.current !== null) {
      window.clearTimeout(traceCopyTimerRef.current);
    }
    traceCopyTimerRef.current = window.setTimeout(() => {
      setTraceMdCopied(false);
      traceCopyTimerRef.current = null;
    }, 1800);
  }, [traceModal]);

  const handleDownloadTraceMd = useCallback(() => {
    if (!traceModal) return;
    const blob = new Blob([traceModal.bundle.traceMarkdown], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = traceModal.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, [traceModal]);

  const resolvedInspectorTitle =
    collapsedInspectorTitle ??
    (inspectorSchema === 'bg' ? 'background' : inspectorSchema);

  const playLit = isPlaying || isRecording;
  const showStopSquare = isPlaying && !isRecording;

  return (
    <>
      {/* TOP CENTERED FLOATING JIG BACKPLATES: Style Plate + UI Libraries/Theme Plate (+ Optional Collapsed Inspector) */}
      <div ref={topWrapRef} className="top-jig-wrap" data-style-jig="true">
        <nav
          ref={stylePlateRef}
          className="floating-style-plate"
          aria-label="Style Taxonomy"
        >
          <span
            className="jig-active-pill"
            aria-hidden="true"
            style={{
              transform: `translate3d(${stylePill.left}px, 0, 0)`,
              width: `${stylePill.width}px`,
              opacity: stylePill.opacity,
            }}
          />
          {STYLE_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              data-jig-pick={slot}
              className={cn('jig-word', activeStyle === slot && 'active')}
              aria-pressed={activeStyle === slot}
              onClick={() => onSelectStyle(slot)}
            >
              {slot}
            </button>
          ))}
        </nav>

        <nav
          ref={libPlateRef}
          className="floating-lib-plate"
          aria-label="Design Libraries"
        >
          {LIB_SLOTS.length > 0 && (
            <span
              className="jig-active-pill"
              aria-hidden="true"
              style={{
                transform: `translate3d(${libPill.left}px, 0, 0)`,
                width: `${libPill.width}px`,
                opacity: libPill.opacity,
              }}
            />
          )}
          {LIB_SLOTS.map((lib) => (
            <button
              key={lib.id}
              type="button"
              data-lib-pick={lib.id}
              className={cn('jig-word', activeLib === lib.id && 'active')}
              aria-pressed={activeLib === lib.id}
              disabled={appLibsDisabled || immLibsDisabled}
              onClick={() => onSelectLib(lib.id)}
            >
              {lib.label}
            </button>
          ))}

          <button
            type="button"
            className="jig-theme-btn"
            data-theme-toggle=""
            disabled={appLibsDisabled}
            aria-label="Toggle dark or light mode"
            title="Toggle dark / light mode"
            onClick={onToggleTheme}
          >
            {jigTheme === 'dark' ? (
              <svg
                className="icon-moon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                className="icon-sun"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.55 1.55M17.52 17.52l1.55 1.55M2 12h2.2M19.8 12H22M4.93 19.07l1.55-1.55M17.52 6.48l1.55-1.55" />
              </svg>
            )}
          </button>
        </nav>

        {resolvedInspectorTitle && inspectorCollapsed && onExpandInspector && (
          <div className="dk-collapsed-pill">
            <span className="dk-root-title">{resolvedInspectorTitle}</span>
            <button
              type="button"
              className="dk-collapse-word"
              onClick={onExpandInspector}
            >
              show
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM CENTERED FLOATING STACK: Recording Output Banner + Motion-Craft Playback, Record, Trace, Prompt, Open */}
      <div className="bottom-motion-wrap" data-style-jig-bottom="true">
        {!isRecording && recordingOutput && (
          <div
            className="jig-record-output-plate"
            data-jig-record-output="true"
            role="status"
            aria-live="polite"
          >
            <span className="jig-output-dot" aria-hidden="true" />
            <span className="jig-output-summary">
              {`recorded ${recordingOutput.formattedDuration}, ${recordingOutput.viewsVisited} views, ${recordingOutput.safeZoneOverlaps} overlaps, mp4 & eval ready`}
            </span>
            {onReplayRecording && (
              <button
                type="button"
                className="jig-output-action-btn"
                data-jig-record-replay="true"
                onClick={onReplayRecording}
              >
                replay
              </button>
            )}
            {onExportRecordingJson && (
              <button
                type="button"
                className="jig-output-action-btn"
                data-jig-record-export="true"
                onClick={onExportRecordingJson}
              >
                export json
              </button>
            )}
            {onDismissRecordingOutput && (
              <button
                type="button"
                className="jig-output-close-btn"
                data-jig-record-close="true"
                aria-label="Close recording summary"
                onClick={onDismissRecordingOutput}
              >
                close
              </button>
            )}
          </div>
        )}

        <div className="jig-bottom-controls-row">
          <nav className="floating-motion-plate" aria-label="Motion Playback and Recording">
            <button
              type="button"
              className="jig-word active"
              data-motion-pick="motion-craft"
            >
              motion-craft
            </button>
            <button
              type="button"
              data-jig-play-toggle="true"
              data-auto-toggle=""
              className={cn('jig-play-btn', playLit && 'playing')}
              aria-pressed={playLit}
              aria-label={
                isRecording
                  ? 'Active autoplay during recording (click to finish)'
                  : 'Play or stop auto walkthrough'
              }
              title={
                isRecording
                  ? 'Autoplay Active During Recording (Click to Finish)'
                  : 'Play / Stop Interactive Autopilot Playback'
              }
              onClick={isRecording ? onToggleRecording : onTogglePlay}
            >
              {showStopSquare ? (
                <svg
                  className="icon-stop"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="3" y="3" width="10" height="10" rx="1.8" />
                </svg>
              ) : (
                <svg
                  className="icon-play"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M3.6 2.4L13.2 8L3.6 13.6V2.4Z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              data-jig-record-toggle="true"
              className={cn('jig-record-btn', isRecording && 'recording')}
              aria-pressed={isRecording}
              aria-label={
                isRecording ? 'Recording active -- tap to finish' : 'Record autoplay walkthrough'
              }
              title={
                isRecording
                  ? 'Recording... (Tap to Finish)'
                  : 'Record Autoplay Walkthrough (MP4 + Design Eval)'
              }
              onClick={onToggleRecording}
            >
              <span className="jig-record-dot" aria-hidden="true" />
            </button>
          </nav>

          <button
            type="button"
            className="floating-motion-plate jig-action-plate"
            data-jig-action="trace"
            title="Open unified section trace (.md) covering full view and all components"
            onClick={handleOpenTrace}
          >
            <span className="jig-action-label">trace</span>
          </button>

          <div className="jig-prompt-anchor">
            <span className="jig-prompt-sizer" aria-hidden="true">
              <span className="jig-action-label">prompt</span>
            </span>
            <button
              type="button"
              className={cn(
                'floating-motion-plate jig-action-plate jig-prompt-plate',
                promptCopied && 'copied',
              )}
              data-jig-action="prompt"
              aria-live="polite"
              title="Copy recreation prompt with exact live rendered HTML + CSS for the active view & style"
              onClick={handleCopyPrompt}
            >
              <span className="jig-action-label">
                {promptCopied ? 'copied to clipboard' : 'prompt'}
              </span>
            </button>
          </div>

          <a
            href={standaloneHref}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-motion-plate jig-action-plate"
            data-jig-action="open"
            title="Open 100% x 100% standalone chromeless window for the active view, style, and variant"
          >
            <span className="jig-action-label">open</span>
          </a>
        </div>
      </div>

      {traceModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Trace Markdown - ${traceModal.fileName}`}
          data-jig-trace-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setTraceModal(null);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor:
              jigTheme === 'dark' ? 'rgba(9, 9, 11, 0.78)' : 'rgba(24, 24, 27, 0.45)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '920px',
              maxHeight: '86vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '14px',
              overflow: 'hidden',
              backgroundColor: jigTheme === 'dark' ? '#111114' : '#ffffff',
              color: jigTheme === 'dark' ? '#fafafa' : '#09090b',
              border: `1px solid ${jigTheme === 'dark' ? '#27272a' : '#e4e4e7'}`,
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 18px',
                borderBottom: `1px solid ${jigTheme === 'dark' ? '#27272a' : '#e4e4e7'}`,
                backgroundColor: jigTheme === 'dark' ? '#17171c' : '#faf9f6',
              }}
            >
              <code
                style={{
                  fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {traceModal.fileName}
              </code>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleCopyTraceMd}
                  style={{
                    border: `1px solid ${jigTheme === 'dark' ? '#27272a' : '#e4e4e7'}`,
                    borderRadius: '8px',
                    backgroundColor: jigTheme === 'dark' ? '#1c1c21' : '#f4f4f5',
                    color: jigTheme === 'dark' ? '#fafafa' : '#09090b',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    lineHeight: 1.2,
                    padding: '8px 12px 6px 12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {traceMdCopied ? 'Copied .md' : 'Copy .md'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTraceMd}
                  style={{
                    border: `1px solid ${jigTheme === 'dark' ? '#27272a' : '#e4e4e7'}`,
                    borderRadius: '8px',
                    backgroundColor: jigTheme === 'dark' ? '#1c1c21' : '#f4f4f5',
                    color: jigTheme === 'dark' ? '#fafafa' : '#09090b',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    lineHeight: 1.2,
                    padding: '8px 12px 6px 12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Download .md
                </button>
                <button
                  type="button"
                  onClick={() => setTraceModal(null)}
                  aria-label="Close trace modal"
                  style={{
                    border: `1px solid ${jigTheme === 'dark' ? '#27272a' : '#e4e4e7'}`,
                    borderRadius: '8px',
                    backgroundColor: jigTheme === 'dark' ? '#1c1c21' : '#f4f4f5',
                    color: jigTheme === 'dark' ? '#fafafa' : '#09090b',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    lineHeight: 1.2,
                    padding: '8px 12px 6px 12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '18px',
                overflow: 'auto',
                flex: 1,
                fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
                fontSize: '12.5px',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: jigTheme === 'dark' ? '#09090b' : '#ffffff',
                color: jigTheme === 'dark' ? '#e4e4e7' : '#18181b',
              }}
            >
              {traceModal.bundle.traceMarkdown}
            </pre>
          </div>
        </div>
      )}
    </>
  );
};
