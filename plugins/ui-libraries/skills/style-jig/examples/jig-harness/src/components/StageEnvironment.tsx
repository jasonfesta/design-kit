import React, { useEffect, useState } from 'react';
import {
  TOC_DOMAIN_GROUPS,
  TOC_ENTRIES,
  type HarnessDomain,
  type HarnessSlideId,
  type JigAgentState,
} from '../data/jigHarnessData';
import { cn } from '../utils/cn';
import { EmptyStageBay } from './EmptyStageBay';

interface StageEnvironmentProps {
  state: JigAgentState;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  onSelectSlide: (slide: HarnessSlideId) => void;
  standalone?: boolean;
}

export const StageEnvironment: React.FC<StageEnvironmentProps> = ({
  state,
  viewportRef,
  onSelectSlide,
  standalone = false,
}) => {
  const activeEntry =
    TOC_ENTRIES.find((entry) => entry.id === state.activeSlide) ?? TOC_ENTRIES[0];

  const [expandedDomain, setExpandedDomain] = useState<HarnessDomain | null>(
    activeEntry.domain,
  );

  useEffect(() => {
    setExpandedDomain(activeEntry.domain);
  }, [activeEntry.domain, state.activeSlide]);

  const handleToggleDomainGroup = (
    domain: HarnessDomain,
    defaultSlide: HarnessSlideId,
  ) => {
    if (expandedDomain === domain) {
      setExpandedDomain(null);
      return;
    }
    setExpandedDomain(domain);
    if (activeEntry.domain !== domain) {
      onSelectSlide(defaultSlide);
    }
  };

  const isAppMobile = activeEntry.chromeMode === 'app';
  const isImmersive = activeEntry.chromeMode === 'immersive';
  const shiftMobileForRightJig = !standalone && isAppMobile && !state.inspectorCollapsed;
  const waveY = state.isPlaying
    ? Math.sin(state.travelProgress * Math.PI * 2) * 8
    : 0;

  if (standalone) {
    return (
      <div
        data-standalone="true"
        data-standalone-domain={activeEntry.domain}
        data-active-slide={state.activeSlide}
        data-active-style={state.activeStyle}
        data-active-variant={state.activeVariant}
        data-active-lib={state.activeLib}
        data-jig-theme={state.jigTheme}
        className="standalone-100-root fixed inset-0 h-[100dvh] w-screen overflow-auto flex items-center justify-center"
        style={{ backgroundColor: state.jigTheme === 'light' ? '#FAF9F6' : '#000000' }}
      >
        {state.stageMode === 'component' ? (
          <div className="jig-stage-mount component-host w-full h-full flex items-center justify-center p-6">
            {isAppMobile ? (
              <div
                data-ap="stage-bay"
                className="blank-stage-surface mapp-blank-frame"
                style={{
                  height: 'min(720px, calc(100dvh - 48px))',
                  transform: `translate3d(0, ${waveY.toFixed(1)}px, 0)`,
                }}
              />
            ) : (
              <EmptyStageBay
                mode="component"
                isPlaying={state.isPlaying}
                travelProgress={state.travelProgress}
              />
            )}
          </div>
        ) : (
          <div className="jig-stage-mount w-full h-full min-w-0 min-h-0 flex items-stretch justify-stretch">
            <div
              data-ap="stage-bay"
              className="blank-stage-surface w-full h-full rounded-none border-0"
              style={{ borderRadius: 0, borderWidth: 0 }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="layout">
      {/* Expandable / Collapsible Accordion Left TOC (tap active header again to collapse entire list) */}
      <aside className="toc" aria-label="table of contents">
        <ul className="toc-list">
          {TOC_DOMAIN_GROUPS.map((group) => {
            const isActiveDomain = activeEntry.domain === group.domain;
            const isExpanded = expandedDomain === group.domain;
            return (
              <li
                key={group.domain}
                className={cn('toc-domain-item', isExpanded && 'expanded')}
              >
                <button
                  type="button"
                  data-toc-group={group.domain}
                  aria-expanded={isExpanded}
                  className={cn('toc-group-btn', isActiveDomain && 'active-domain')}
                  onClick={() => handleToggleDomainGroup(group.domain, group.defaultSlide)}
                >
                  {group.label}
                </button>
                {isExpanded && (
                  <ul className="toc-sub-list">
                    {group.items.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          data-toc-slide={entry.id}
                          className={cn(
                            'toc-item sub',
                            state.activeSlide === entry.id && 'active',
                          )}
                          onClick={() => onSelectSlide(entry.id)}
                        >
                          {entry.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Isolated Right Stage (`z-index: 1`, zero background halo) */}
      <main className="stage" data-jig-stage="">
        <div
          ref={viewportRef}
          data-jig-stage-viewport=""
          data-stage-mode={state.stageMode}
          className={cn(
            'slides-viewport no-scrollbar',
            isImmersive && 'imm-stage-viewport',
          )}
        >
          {state.stageMode === 'component' ? (
            /* CENTERED COMPONENT MODE (Desktop Empty Bay or 9:16 Mobile Frame) */
            <div
              className={cn(
                'jig-stage-mount component-host w-full h-full flex items-center justify-center',
                shiftMobileForRightJig && 'mapp-shifted-left',
              )}
            >
              {isAppMobile ? (
                <div
                  data-ap="stage-bay"
                  className="blank-stage-surface mapp-blank-frame"
                  style={{
                    height: 'min(648px, calc(100vh - 156px))',
                    transform: `translate3d(0, ${waveY.toFixed(1)}px, 0)`,
                  }}
                />
              ) : (
                <EmptyStageBay
                  mode="component"
                  isPlaying={state.isPlaying}
                  travelProgress={state.travelProgress}
                />
              )}
            </div>
          ) : isImmersive ? (
            /* IMMERSIVE FULL-VIEW STAGE (spans TOC edge to right edge, `.dk-panel` floats on right) */
            <div className="jig-stage-mount imm-view-frame">
              <div
                data-ap="stage-bay"
                className="blank-stage-surface w-full h-full"
                style={{
                  transform: `translate3d(0, ${(waveY * 0.4).toFixed(1)}px, 0)`,
                }}
              />
            </div>
          ) : (
            /* CENTERED FULL VIEW MODE (Scrollable Full-Bleed View Shell) */
            <>
              <div className="jig-stage-mount jig-view-shell">
                <div
                  data-ap="stage-bay"
                  className="blank-stage-surface w-full flex-1 min-h-[calc(100vh-152px)]"
                  style={{
                    transform: `translate3d(0, ${(waveY * 0.6).toFixed(1)}px, 0)`,
                  }}
                />
              </div>

              {/* Second quiet blank scroll fold so Full View & `motion-craft ▶` Auto-Travel glide smoothly */}
              <div className="jig-view-shell pt-0">
                <div className="blank-stage-surface w-full min-h-[54vh]" />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
