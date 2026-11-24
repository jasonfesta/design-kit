import React, { useEffect, useState } from 'react';
import {
  getStyleVariantSpec,
  resolveVariantPolarityTokens,
  type DonorPolarity,
  type DonorStyleId,
  type VariantPolarityTokens,
} from './variantTokens';

/* ========================================================================= */
/* PORTABLE 45-STYLE (`clone` + `8 × 5` NOTCHES) JIG DONOR ENGINE            */
/* Self-contained physical donor chrome + dual-polarity token resolver +     */
/* deep subsection `data-donor-role` CSS contract.                           */
/* Zero purple/violet (OKLCH 270°-330°), zero Material fonts, >= 12px floor, */
/* -2px optical vertical button centering (`pt-[2px]`).                      */
/* ========================================================================= */

export interface JigDonorFonts {
  fontHeading: string;
  fontBody: string;
  fontMono: string;
}

export function resolveJigDonorFonts(
  styleId: DonorStyleId,
  variantIdx: number
): JigDonorFonts {
  const idx = Math.max(0, Math.min(4, Math.floor(variantIdx || 0)));
  const monoJet = '"JetBrains Mono Variable", "JetBrains Mono", monospace';
  const monoSpace = '"Space Mono", "JetBrains Mono Variable", monospace';
  const monoIbm = '"IBM Plex Mono", "JetBrains Mono Variable", monospace';

  if (styleId === 'clean') {
    const heads = [
      '"Schibsted Grotesk Variable", "Schibsted Grotesk", sans-serif',
      '"Onest Variable", "Onest", sans-serif',
      '"Outfit Variable", "Outfit", sans-serif',
      '"Inter Tight", "Instrument Sans Variable", sans-serif',
      '"Syne Variable", "Schibsted Grotesk Variable", sans-serif',
    ];
    const bodies = [
      '"Onest Variable", "Onest", sans-serif',
      '"Instrument Sans Variable", "Instrument Sans", sans-serif',
      '"Instrument Sans Variable", "Instrument Sans", sans-serif',
      '"Inter Tight", "Instrument Sans Variable", sans-serif',
      '"Onest Variable", "Instrument Sans Variable", sans-serif',
    ];
    return {
      fontHeading: heads[idx] ?? heads[0]!,
      fontBody: bodies[idx] ?? bodies[0]!,
      fontMono: idx === 3 ? monoIbm : monoJet,
    };
  }

  if (styleId === 'grid') {
    const heads = [
      '"Archivo Variable", "Bricolage Grotesque Variable", sans-serif',
      '"Bricolage Grotesque Variable", "Schibsted Grotesk Variable", sans-serif',
      '"Schibsted Grotesk Variable", "Archivo Variable", sans-serif',
      '"Newsreader Variable", Georgia, serif',
      '"Bricolage Grotesque Variable", "Space Mono", sans-serif',
    ];
    return {
      fontHeading: heads[idx] ?? heads[0]!,
      fontBody: '"Instrument Sans Variable", "Instrument Sans", sans-serif',
      fontMono: idx === 4 ? monoIbm : monoSpace,
    };
  }

  if (styleId === 'editorial') {
    const heads = [
      '"Fraunces Variable", "Fraunces", Georgia, serif',
      '"Newsreader Variable", "Newsreader", Georgia, serif',
      '"Fraunces Variable", "Fraunces", Georgia, serif',
      '"Newsreader Variable", Georgia, serif',
      '"Fraunces Variable", "Newsreader Variable", Georgia, serif',
    ];
    const bodies = [
      '"Schibsted Grotesk Variable", "Instrument Sans Variable", sans-serif',
      '"Instrument Sans Variable", "Onest Variable", sans-serif',
      '"Schibsted Grotesk Variable", "Instrument Sans Variable", sans-serif',
      '"Newsreader Variable", Georgia, serif',
      '"Instrument Sans Variable", "Schibsted Grotesk Variable", sans-serif',
    ];
    return {
      fontHeading: heads[idx] ?? heads[0]!,
      fontBody: bodies[idx] ?? bodies[0]!,
      fontMono: monoIbm,
    };
  }

  if (styleId === 'cinematic') {
    const heads = [
      '"Archivo Variable", "Bricolage Grotesque Variable", sans-serif',
      '"Syne Variable", "Bricolage Grotesque Variable", sans-serif',
      '"Archivo Variable", "Inter Tight", sans-serif',
      '"Outfit Variable", "Schibsted Grotesk Variable", sans-serif',
      '"Bricolage Grotesque Variable", "Archivo Variable", sans-serif',
    ];
    return {
      fontHeading: heads[idx] ?? heads[0]!,
      fontBody: '"Onest Variable", "Instrument Sans Variable", sans-serif',
      fontMono: idx === 0 || idx === 2 ? monoIbm : monoJet,
    };
  }

  if (styleId === 'product') {
    const heads = [
      '"Outfit Variable", "Onest Variable", sans-serif',
      '"Onest Variable", "Schibsted Grotesk Variable", sans-serif',
      '"Bricolage Grotesque Variable", "Onest Variable", sans-serif',
      '"Schibsted Grotesk Variable", "Archivo Variable", sans-serif',
      '"Inter Tight", "Instrument Sans Variable", sans-serif',
    ];
    return {
      fontHeading: heads[idx] ?? heads[0]!,
      fontBody: '"Instrument Sans Variable", "Onest Variable", sans-serif',
      fontMono: idx === 3 ? monoSpace : monoJet,
    };
  }

  if (styleId === 'brutal') {
    const heads = [
      '"Archivo Variable", "Bricolage Grotesque Variable", sans-serif',
      '"Bricolage Grotesque Variable", "Archivo Variable", sans-serif',
      '"Syne Variable", "Bricolage Grotesque Variable", sans-serif',
      '"Archivo Variable", "Syne Variable", sans-serif',
      '"Bricolage Grotesque Variable", "Space Mono", sans-serif',
    ];
    return {
      fontHeading: heads[idx] ?? heads[0]!,
      fontBody: idx === 2 ? '"Instrument Sans Variable", sans-serif' : monoIbm,
      fontMono: monoIbm,
    };
  }

  if (styleId === 'playful') {
    const heads = [
      '"Bricolage Grotesque Variable", "Onest Variable", sans-serif',
      '"Outfit Variable", "Bricolage Grotesque Variable", sans-serif',
      '"Syne Variable", "Outfit Variable", sans-serif',
      '"Archivo Variable", "Bricolage Grotesque Variable", sans-serif',
      '"Syne Variable", "Bricolage Grotesque Variable", sans-serif',
    ];
    return {
      fontHeading: heads[idx] ?? heads[0]!,
      fontBody: '"Onest Variable", "Instrument Sans Variable", sans-serif',
      fontMono: monoJet,
    };
  }

  const retroHeads = [
    '"Instrument Sans Variable", "Archivo Variable", sans-serif',
    monoIbm,
    '"Space Mono", "Archivo Variable", monospace',
    '"Instrument Sans Variable", "Onest Variable", sans-serif',
    monoIbm,
  ];
  const retroBodies = [
    '"Instrument Sans Variable", "Onest Variable", sans-serif',
    monoIbm,
    '"Instrument Sans Variable", "Space Mono", sans-serif',
    '"Onest Variable", "Instrument Sans Variable", sans-serif',
    monoIbm,
  ];
  return {
    fontHeading: retroHeads[idx] ?? retroHeads[0]!,
    fontBody: retroBodies[idx] ?? retroBodies[0]!,
    fontMono: monoIbm,
  };
}

export function resolveJigNotchTokens(
  styleId: DonorStyleId,
  variantIdx: number,
  polarity: DonorPolarity
): VariantPolarityTokens | null {
  return resolveVariantPolarityTokens(styleId, variantIdx, polarity);
}

const WIN98_SAFE_SWATCHES = [
  '#000000', '#404040', '#800000', '#808000', '#008000', '#008080', '#0A246A', '#1E3A8A',
  '#808040', '#004040', '#0284C7', '#0F4C81', '#B45309', '#7C2D12',
  '#FFFFFF', '#C0C0C0', '#DC2626', '#FACC15', '#22C55E', '#06B6D4', '#2563EB', '#38BDF8',
  '#D9F94D', '#34D399', '#7DD3FC', '#93C5FD', '#FB7185', '#F97316',
] as const;

const BRICK_BG_STYLE: React.CSSProperties = {
  backgroundColor: '#D86018',
  backgroundImage: [
    'linear-gradient(to bottom, #F7B27A 0px, #F7B27A 2px, transparent 2px)',
    'linear-gradient(to right, #F7B27A 0px, #F7B27A 2px, transparent 2px)',
    'linear-gradient(to top, #6B2804 0px, #6B2804 2px, transparent 2px)',
    'linear-gradient(to left, #6B2804 0px, #6B2804 2px, transparent 2px)',
  ].join(', '),
  backgroundSize: '12px 12px',
};

function useLiveSecondsClock(enabled: boolean, initialSec = 27): string {
  const [sec, setSec] = useState(initialSec);
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setSec((s) => (s + 1) % 3600), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function useUtcStamp(enabled: boolean): string {
  const [stamp, setStamp] = useState('23:47:12 UTC');
  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      const ss = String(d.getUTCSeconds()).padStart(2, '0');
      setStamp(`${hh}:${mm}:${ss} UTC`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return stamp;
}

function PaintPaletteIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4 shrink-0">
      <rect x="1" y="1.5" width="14" height="11" fill="#FFFFFF" stroke="#000000" strokeWidth="1.2" />
      <rect x="2.2" y="2.7" width="11.6" height="8.6" fill="#38BDF8" />
      <path d="M2.2 9.5C5 7.4 8.6 10.2 13.8 7.8V11.3H2.2V9.5Z" fill="#22C55E" />
      <circle cx="5.4" cy="5.2" r="1.4" fill="#FACC15" />
      <circle cx="10.8" cy="5.4" r="1.2" fill="#DC2626" />
    </svg>
  );
}

function AimRunningManIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4 shrink-0">
      <circle cx="9.5" cy="2.6" r="2" fill="#FFD21F" stroke="#000000" strokeWidth="0.9" />
      <path
        d="M8.6 5.2L6.2 9L3.4 9.4M8.6 5.2L10.4 9.2L13.2 10.6M8.6 5.2L11.6 6.6M7.6 7L5.2 5.6M10.4 9.2L8.2 13.6"
        stroke="#000000"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.6 5.2L6.2 9L3.4 9.4M8.6 5.2L10.4 9.2L13.2 10.6M8.6 5.2L11.6 6.6M7.6 7L5.2 5.6M10.4 9.2L8.2 13.6"
        stroke="#FFD21F"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MarioQuestionCoinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4 shrink-0">
      <rect x="1" y="1" width="14" height="14" fill="#F8D870" stroke="#000000" strokeWidth="1.4" />
      <rect x="2.4" y="2.4" width="1.5" height="1.5" fill="#000000" />
      <rect x="12.1" y="2.4" width="1.5" height="1.5" fill="#000000" />
      <rect x="2.4" y="12.1" width="1.5" height="1.5" fill="#000000" />
      <rect x="12.1" y="12.1" width="1.5" height="1.5" fill="#000000" />
      <path d="M6 6C6 4.8 6.9 4.2 8.1 4.2C9.3 4.2 10.1 4.8 10.1 5.9C10.1 6.8 9.4 7.3 8.3 7.8V9.2M8.2 10.8V12" stroke="#9A3412" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

function MarioCloudSvg() {
  return (
    <svg viewBox="0 0 42 20" fill="none" aria-hidden="true" className="w-8 h-4 shrink-0">
      <rect x="10" y="2" width="16" height="5" fill="#FFFFFF" />
      <rect x="5" y="6" width="28" height="6" fill="#FFFFFF" />
      <rect x="2" y="10" width="36" height="6" fill="#FFFFFF" />
      <rect x="4" y="16" width="32" height="2" fill="#BFDBFE" />
    </svg>
  );
}

function WinampSpectrumStrip({ count = 18 }: { count?: number }) {
  const heights = [42, 74, 92, 65, 86, 52, 96, 78, 44, 68, 88, 60, 94, 72, 48, 82, 58, 38];
  return (
    <span aria-hidden="true" className="inline-flex items-end gap-[1.5px] h-[15px] px-1.5 py-[2px] bg-[#040806] border border-[#000000] shrink-0">
      {Array.from({ length: count }).map((_, i) => {
        const pct = heights[i % heights.length]!;
        return (
          <span
            key={i}
            className="jig-wamp-spec-bar block w-[2.5px]"
            style={{
              height: `${pct}%`,
              animationDelay: `${-(i * 0.11)}s`,
              backgroundImage: 'linear-gradient(to top, #39FF14 0%, #A3E635 55%, #FACC15 80%, #EF4444 100%)',
            }}
          />
        );
      })}
    </span>
  );
}

function PlayfulScallopSvg({ fill = '#F4FF52' }: { fill?: string }) {
  const pts: string[] = [];
  for (let i = 0; i < 20; i++) {
    const r = i % 2 === 0 ? 9.5 : 6.8;
    const a = (i * Math.PI) / 10;
    pts.push(`${(10 + Math.cos(a) * r).toFixed(1)},${(10 + Math.sin(a) * r).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="w-5 h-5 shrink-0">
      <polygon points={pts.join(' ')} fill="#111111" />
      <circle cx="10" cy="10" r="4.2" fill={fill} />
    </svg>
  );
}

function Wellness120SpokeDialSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="w-5 h-5 shrink-0">
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 24;
        const x1 = 12 + Math.cos(a) * 7.2;
        const y1 = 12 + Math.sin(a) * 7.2;
        const x2 = 12 + Math.cos(a) * 10.6;
        const y2 = 12 + Math.sin(a) * 10.6;
        return (
          <line
            key={i}
            x1={x1.toFixed(1)}
            y1={y1.toFixed(1)}
            x2={x2.toFixed(1)}
            y2={y2.toFixed(1)}
            stroke={i < 17 ? '#D9F94D' : '#2DD4BF'}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="12" cy="12" r="4.2" fill="#0F1412" stroke="#D9F94D" strokeWidth="1.2" />
    </svg>
  );
}

export interface JigDonorChromeProps {
  activeStyle: DonorStyleId;
  variantIdx: number;
  isDark: boolean;
  isFull: boolean;
  title?: React.ReactNode;
  fontHeading: string;
  fontBody: string;
  fontMono: string;
}

export const JigDonorChromeHeader: React.FC<JigDonorChromeProps> = ({
  activeStyle,
  variantIdx,
  isDark,
  isFull,
  title,
  fontHeading,
  fontBody,
  fontMono,
}) => {
  const notch = Math.max(0, Math.min(4, Math.floor(variantIdx || 0)));
  const spec = getStyleVariantSpec(activeStyle, notch);
  const wampClock = useLiveSecondsClock(activeStyle === 'retro' && notch === 4, 27);
  const utcClock = useUtcStamp(activeStyle === 'brutal' && notch === 0);

  if (activeStyle === 'clone') return null;

  const displayTitle =
    typeof title === 'string' && title.trim().length > 0
      ? title
      : spec?.label ?? `${activeStyle} - 0${notch + 1}`;

  if (activeStyle === 'clean') {
    if (notch === 0) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#0F1520] border-[#253248] text-[#F8FAFC]' : 'bg-[#F7F9FD] border-[#DDE5F2] text-[#0F172A]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-5 h-5 rounded-[7px] bg-[#1D5BEF] text-[#FFFFFF] flex items-center justify-center text-xs font-bold shrink-0">
              V
            </span>
            <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
              {displayTitle}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-1">
              <span className="w-2 h-2 rounded-full bg-[#F5B82E]" />
              <span className="w-2 h-2 rounded-full bg-[#FF4757]" />
              <span className="w-2 h-2 rounded-full bg-[#1D5BEF]" />
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tabular-nums border ${
                isDark
                  ? 'bg-[#1D5BEF]/25 text-[#93C5FD] border-[#3B82F6]/50'
                  : 'bg-[#FFFFFF] text-[#1D5BEF] border-[#BFDBFE] shadow-2xs'
              }`}
            >
              <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 -rotate-90 shrink-0" aria-hidden="true">
                <circle cx="9" cy="9" r="6.5" fill="none" stroke={isDark ? '#1E293B' : '#DBEAFE'} strokeWidth="2.4" />
                <circle cx="9" cy="9" r="6.5" fill="none" stroke={isDark ? '#60A5FA' : '#1D5BEF'} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="34 41" />
              </svg>
              <span>84% SYNCED</span>
            </span>
          </div>
        </div>
      );
    }

    if (notch === 1) {
      const days = ['Mon 8', 'Tue 9', 'Wed 10', 'Thu 11', 'Fri 12'];
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#0E1511] border-[#28382E] text-[#F3F7F4]' : 'bg-[#EEF4E8] border-[#D5E1CC] text-[#0F1410]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E2FA52] text-[#0F1410] text-xs font-bold shrink-0 border border-[#B8D422]">
              Oxelia - 34%
            </span>
            <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
              {displayTitle}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="hidden sm:flex items-center gap-1">
              {days.slice(isFull ? 0 : 2).map((d) => {
                const active = d === 'Thu 11';
                return (
                  <span
                    key={d}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium tabular-nums ${
                      active
                        ? 'bg-[#E2FA52] text-[#0F1410] font-bold'
                        : isDark
                        ? 'bg-[#18231C] text-[#9EB0A3]'
                        : 'bg-[#FFFFFF] text-[#465248]'
                    }`}
                  >
                    {d}
                  </span>
                );
              })}
            </div>
            <span className="w-5 h-5 rounded-full bg-[#0F1410] text-[#E2FA52] text-xs font-bold flex items-center justify-center shrink-0">
              ↗
            </span>
          </div>
        </div>
      );
    }

    if (notch === 2) {
      const bars = [48, 76, 38, 92, 64];
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#10161E] border-[#283747] text-[#F1F5F9]' : 'bg-[#E8EFF6] border-[#CEDBE8] text-[#1E293B]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                isDark
                  ? 'bg-[#17202A] text-[#38BDF8] shadow-[inset_1px_1px_2px_#243242,2px_2px_5px_#070A0E]'
                  : 'bg-[#F4F8FC] text-[#0284C7] shadow-[2px_2px_5px_#C5D1DF,-2px_-2px_5px_#FFFFFF]'
              }`}
            >
              Aa
            </span>
            <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
              {displayTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              aria-hidden="true"
              className={`inline-flex items-end gap-1 px-2 py-1 rounded-full ${
                isDark
                  ? 'bg-[#0B1015] shadow-[inset_2px_2px_4px_#05080B]'
                  : 'bg-[#DCE6F0] shadow-[inset_2px_2px_4px_#BDCCDB,inset_-1px_-1px_3px_#FFFFFF]'
              }`}
            >
              {bars.map((h, i) => (
                <span key={i} className="w-1.5 h-3.5 rounded-full bg-black/10 flex items-end overflow-hidden">
                  <span
                    style={{
                      height: `${h}%`,
                      backgroundImage: 'linear-gradient(180deg, #06B6D4 0%, #0284C7 100%)',
                    }}
                    className="w-full rounded-full block"
                  />
                </span>
              ))}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#0369A1] text-[#FFFFFF] text-xs font-semibold tabular-nums">
              50%
            </span>
          </div>
        </div>
      );
    }

    if (notch === 3) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#15171E] border-[#2F3442] text-[#F3F4F6]' : 'bg-[#ECECEF] border-[#D8D8DF] text-[#111827]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`inline-flex items-center p-0.5 rounded-[8px] border text-xs ${
                isDark ? 'bg-[#101115] border-[#2F3442]' : 'bg-[#DFDFE5] border-[#CFCFD8]'
              }`}
            >
              <span className="px-2 py-0.5 rounded-[6px] bg-[#2563EB] text-[#FFFFFF] font-semibold">
                ⊕ Insert
              </span>
              <span className="hidden sm:inline px-2 py-0.5 font-medium opacity-85">T Format</span>
              {isFull && <span className="hidden md:inline px-2 py-0.5 font-medium opacity-75">Actions</span>}
            </div>
            <span className="text-xs font-medium truncate opacity-85">{displayTitle}</span>
          </div>
          <span
            style={{ fontFamily: fontMono }}
            className={`px-2 py-0.5 rounded-[6px] border text-xs font-semibold shrink-0 ${
              isDark ? 'bg-[#1E222C] border-[#383E4E] text-[#93C5FD]' : 'bg-[#FFFFFF] border-[#D0D0D8] text-[#1D4ED8] shadow-2xs'
            }`}
          >
            ⌘⇧T
          </span>
        </div>
      );
    }

    return (
      <div
        data-donor-chrome="header"
        style={{ fontFamily: fontBody }}
        className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
          isDark ? 'bg-[#101614] border-[#283831] text-[#F4F7F6]' : 'bg-[#ECF2E2] border-[#D2DEC0] text-[#0F1412]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Wellness120SpokeDialSvg />
          <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
            {displayTitle}
          </span>
          {isFull && (
            <span style={{ fontFamily: fontMono }} className="hidden md:inline text-xs opacity-70 tabular-nums">
              120-SPOKE - RADIAL
            </span>
          )}
        </div>
        <span
          style={{ fontFamily: fontMono }}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D9F94D] text-[#0F1412] border border-[#A3C922] text-xs font-bold tabular-nums shrink-0"
        >
          <span>▷</span>
          <span aria-hidden="true" className="tracking-[-1px]">||||||</span>
          <span>0:44</span>
        </span>
      </div>
    );
  }

  if (activeStyle === 'grid') {
    if (notch === 0) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} border-b flex items-center justify-between gap-2 text-xs select-none ${
            isDark ? 'bg-[#0A0E17] border-[#3B82F6] text-[#F8FAFC]' : 'bg-[#EAE0D5] border-[#1546E0] text-[#0D1520]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className={isDark ? 'text-[#60A5FA] font-bold' : 'text-[#1546E0] font-bold'}>+</span>
            <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="w-4 h-4 shrink-0">
              <rect x="1.5" y="1.5" width="15" height="15" stroke={isDark ? '#60A5FA' : '#1546E0'} strokeWidth="1.3" />
              <path d="M9 9 L15 9 A6 6 0 0 0 9 3 Z" fill="#FF7A29" />
              <circle cx="9" cy="9" r="6" stroke={isDark ? '#60A5FA' : '#1546E0'} strokeWidth="1.2" />
            </svg>
            <span className="px-1.5 py-0.5 bg-[#1546E0] text-[#FFFFFF] font-bold shrink-0">exp. / 002</span>
            <span className="truncate font-semibold">{displayTitle}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline opacity-75">AXIS // 45°</span>
            <span className={isDark ? 'text-[#FF7A29] font-bold' : 'text-[#1546E0] font-bold'}>+</span>
          </div>
        </div>
      );
    }

    if (notch === 1) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} border-b border-dashed flex items-center justify-between gap-2 text-xs select-none ${
            isDark ? 'bg-[#12100E] border-[#FF7A29] text-[#FAF7F2]' : 'bg-[#ECE4DC] border-[#141923] text-[#0D1520]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-1.5 py-0.5 bg-[#FF7A29] text-[#09090B] border border-[#09090B] font-bold shrink-0">
              CELL 02
            </span>
            <span className="truncate font-semibold">{displayTitle}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-bold tabular-nums">
            <span className={isDark ? 'text-[#FF7A29]' : 'text-[#1546E0]'}>A———B</span>
            <span className="hidden sm:inline px-1.5 py-0.5 border border-dashed border-current">HALFTONE</span>
          </div>
        </div>
      );
    }

    if (notch === 2) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} border-b-[1.5px] flex items-center justify-between gap-2 text-xs select-none ${
            isDark ? 'bg-[#16181B] border-[#52525B] text-[#F4F4F5]' : 'bg-[#E3E3DF] border-[#18181B] text-[#111318]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center w-7 h-4 p-0.5 bg-[#18181B] border border-[#09090B] shrink-0">
              <span className="w-3 h-2.5 bg-[#FF7A29] ml-auto block" />
            </span>
            <svg viewBox="0 0 32 12" className="w-7 h-3 shrink-0" aria-hidden="true">
              {[0, 1, 2].map((r) =>
                [0, 1, 2, 3, 4, 5, 6].map((c) => (
                  <circle
                    key={`${r}-${c}`}
                    cx={3 + c * 4.2}
                    cy={2.5 + r * 3.5}
                    r="1"
                    fill={isDark ? '#A1A1AA' : '#27272A'}
                  />
                ))
              )}
            </svg>
            <span className="truncate font-bold">{displayTitle}</span>
          </div>
          <span className="px-1.5 py-0.5 bg-[#18181B] text-[#FAFAFA] font-bold shrink-0">SK 4 - 3x</span>
        </div>
      );
    }

    if (notch === 3) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} border-b-[3px] border-double flex items-center justify-between gap-2 text-xs select-none ${
            isDark ? 'bg-[#101219] border-[#D97706] text-[#F5F5F4]' : 'bg-[#EAE2D3] border-[#1C1917] text-[#141210]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <svg viewBox="0 0 28 14" fill="none" aria-hidden="true" className="w-7 h-3.5 shrink-0">
              <circle cx="5.5" cy="7" r="4.5" fill={isDark ? '#F59E0B' : '#141210'} />
              <circle cx="22.5" cy="7" r="3" fill={isDark ? '#60A5FA' : '#1D5BEF'} />
              <line x1="5.5" y1="2.5" x2="22.5" y2="4" stroke="currentColor" strokeWidth="1.1" />
              <line x1="5.5" y1="11.5" x2="22.5" y2="10" stroke="currentColor" strokeWidth="1.1" />
            </svg>
            <span className="truncate font-semibold">{displayTitle}</span>
          </div>
          <span className="font-bold tabular-nums shrink-0">P1 - 36 - 1970—1972</span>
        </div>
      );
    }

    return (
      <div
        data-donor-chrome="header"
        style={{ fontFamily: fontMono }}
        className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} border-b flex items-center justify-between gap-2 text-xs select-none ${
          isDark ? 'bg-[#060608] border-[#F59E0B]/60 text-[#F8FAFC]' : 'bg-[#EDE5D6] border-[#B45309] text-[#14120E]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden="true" className="inline-flex items-center gap-[2px] shrink-0">
            {[6, 11, 14, 9, 13, 15, 10, 7].map((h, i) => (
              <span
                key={i}
                style={{ height: h }}
                className={`w-[2.5px] block ${i % 2 === 0 ? 'bg-[#F59E0B]' : 'bg-[#EA580C]'}`}
              />
            ))}
          </span>
          <span className="truncate font-bold">{displayTitle}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 tabular-nums font-bold">
          <span className={isDark ? 'text-[#F59E0B]' : 'text-[#B45309]'}>02:06:19</span>
          <span className={`hidden sm:inline ${isDark ? 'text-[#38BDF8]' : 'text-[#0369A1]'}`}>+28934</span>
          <span className="px-1.5 py-0.5 bg-[#F59E0B] text-[#060608]">▽ MAX</span>
        </div>
      </div>
    );
  }

  if (activeStyle === 'editorial') {
    if (notch === 0) {
      return (
        <div
          data-donor-chrome="header"
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-t-2 border-b flex items-center justify-between gap-2 select-none ${
            isDark
              ? 'bg-[#191613] border-t-[#E07038] border-b-[#3E352D] text-[#F5F2EB]'
              : 'bg-[#F3EFE6] border-t-[#0F1110] border-b-[#C6BBA8] text-[#0F1110]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3.5 h-3.5 rounded-full bg-[#D96528] shrink-0" />
            <span style={{ fontFamily: fontHeading }} className="text-[13.5px] font-bold tracking-[-0.025em] truncate">
              {displayTitle}
            </span>
          </div>
          <span
            style={{ fontFamily: fontMono }}
            className="px-2 py-0.5 bg-[#B8501A] text-[#FFFDF9] text-xs font-semibold tracking-wider uppercase shrink-0"
          >
            FOLIO - 84
          </span>
        </div>
      );
    }

    if (notch === 1) {
      return (
        <div
          data-donor-chrome="header"
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#141822] border-[#3B82F6]/50 text-[#F5F2EB]' : 'bg-[#EFEAD9] border-[#1652C8]/50 text-[#0F1110]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <svg viewBox="0 0 24 16" className="w-6 h-4 shrink-0" aria-hidden="true">
              <circle cx="9" cy="8" r="6" fill="#D96528" fillOpacity="0.9" />
              <circle cx="15" cy="8" r="6" fill="#1652C8" fillOpacity="0.85" />
            </svg>
            <span style={{ fontFamily: fontHeading }} className="text-[13.5px] font-bold truncate">
              {displayTitle}
            </span>
          </div>
          <div style={{ fontFamily: fontMono }} className="flex items-center gap-2 text-xs font-bold shrink-0">
            <span>⊕</span>
            <span className="px-2 py-0.5 bg-[#1652C8] text-[#FFFFFF]">RISO 300DPI</span>
            <span>⊕</span>
          </div>
        </div>
      );
    }

    if (notch === 2) {
      return (
        <div
          data-donor-chrome="header"
          className={`shrink-0 px-3.5 ${isFull ? 'h-9' : 'h-8'} bg-[#F5E614] text-[#0F1110] border-t-[2.5px] border-t-[#0F1110] border-b border-b-[#0F1110] flex items-center justify-between gap-2 select-none`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span style={{ fontFamily: fontMono }} className="text-xs font-bold uppercase tracking-wider shrink-0">
              ■ MARGINALIA
            </span>
            <span style={{ fontFamily: fontHeading }} className="text-[13px] font-bold truncate">
              {displayTitle}
            </span>
          </div>
          <span style={{ fontFamily: fontMono }} className="px-1.5 py-0.5 bg-[#0F1110] text-[#F5E614] text-xs font-bold shrink-0">
            NOTE 03
          </span>
        </div>
      );
    }

    if (notch === 3) {
      return (
        <div
          data-donor-chrome="header"
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-t-[3px] border-b flex items-center justify-between gap-2 select-none ${
            isDark
              ? 'bg-[#171513] border-t-[#F5F2EB] border-b-[#443E38] text-[#F5F2EB]'
              : 'bg-[#E7E0D3] border-t-[#1C1917] border-b-[#B5AA99] text-[#1C1917]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              style={{ fontFamily: fontHeading }}
              className="px-1.5 py-0.5 bg-[#B8501A] text-[#FFFDF9] text-xs font-bold leading-none shrink-0"
            >
              EP
            </span>
            <span style={{ fontFamily: fontHeading }} className="text-[13.5px] font-bold tracking-[-0.02em] truncate">
              {displayTitle}
            </span>
          </div>
          <span style={{ fontFamily: fontMono }} className="text-xs font-bold tracking-wider uppercase shrink-0">
            EDICIÓN 04 - FOLIO
          </span>
        </div>
      );
    }

    return (
      <div
        data-donor-chrome="header"
        className={`shrink-0 px-3.5 ${isFull ? 'h-9' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
          isDark ? 'bg-[#101820] border-[#38BDF8]/60 text-[#F1F5F9]' : 'bg-[#E0F2FE] border-[#0284C7] text-[#0F172A]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#DF4A3A] font-bold text-sm leading-none shrink-0">*</span>
          <span className="px-2 py-0.5 bg-[#7DD3FC] text-[#09090B] text-xs font-bold truncate">
            {displayTitle}
          </span>
        </div>
        <span
          style={{ fontFamily: fontMono }}
          className="px-1.5 py-0.5 bg-[#38BDF8] text-[#09090B] border border-[#09090B] text-xs font-bold shrink-0"
        >
          [□] SELECT
        </span>
      </div>
    );
  }

  if (activeStyle === 'cinematic') {
    if (notch === 0) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-9' : 'h-8'} border-b flex items-center justify-between gap-2 text-xs select-none ${
            isDark ? 'bg-[#0A0D12] border-white/20 text-[#F5F6F8]' : 'bg-[#16171A] border-[#090A0C] text-[#F5F6F8]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-1.5 py-0.5 rounded-[3px] bg-[#F08249] text-[#090A0C] font-bold shrink-0">ACT</span>
            <span className="font-bold tracking-wider shrink-0">TAXI - ID 091</span>
            <span className="truncate opacity-75 hidden sm:inline">// {displayTitle}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 tabular-nums">
            <span className="opacity-65">-10</span>
            <span className="w-3 h-px bg-white/35" />
            <span className="opacity-80">-05</span>
            <span className="w-3 h-px bg-white/35" />
            <span className="text-[#D96B27] font-bold">00</span>
          </div>
        </div>
      );
    }

    if (notch === 1) {
      return (
        <div
          data-donor-chrome="header"
          style={{
            fontFamily: fontBody,
            backgroundImage: isDark
              ? 'radial-gradient(90% 180% at 85% 0%, rgba(217,107,39,0.34) 0%, rgba(16,20,27,0.96) 72%)'
              : 'radial-gradient(90% 180% at 85% 0%, rgba(217,107,39,0.22) 0%, rgba(243,236,229,0.96) 72%)',
          }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ${
            isDark ? 'border-white/18 text-[#F5F6F8]' : 'border-[#CEBCAE] text-[#181411]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-5 h-5 rounded-full border border-[#D96B27] bg-[#D96B27]/20 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#D96B27]" />
            </span>
            <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
              {displayTitle}
            </span>
          </div>
          <span
            style={{ fontFamily: fontMono }}
            className="px-2.5 py-0.5 rounded-full bg-[#B8501A] text-[#FFFFFF] text-xs font-semibold tabular-nums shrink-0"
          >
            BOKEH - 100%
          </span>
        </div>
      );
    }

    if (notch === 2) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-9' : 'h-8'} bg-[#16171A] text-[#F5F6F8] border-b border-[#090A0C] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] flex items-center justify-between gap-2 text-xs select-none`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span aria-hidden="true" className="inline-flex items-center gap-1 shrink-0">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#090A0C] border border-white/30 block" />
              ))}
            </span>
            <span className="font-bold tracking-wider uppercase truncate">MULE DIGIPLATE // {displayTitle}</span>
          </div>
          <span className="px-2 py-0.5 rounded-[3px] bg-[#27292E] border border-white/25 text-[#E4E4E7] font-semibold shrink-0">
            CNC 1/4-20
          </span>
        </div>
      );
    }

    if (notch === 3) {
      return (
        <div
          data-donor-chrome="header"
          style={{
            fontFamily: fontBody,
            backgroundImage: isDark
              ? 'linear-gradient(180deg, #2D333F 0%, #171B22 55%, #0F1217 100%)'
              : 'linear-gradient(180deg, #FFFFFF 0%, #E2E6EE 52%, #C4CBD6 100%)',
          }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-9' : 'h-8'} border-b flex items-center justify-between gap-2 select-none shadow-[inset_0_1px_0_#FFFFFF] ${
            isDark ? 'border-[#384152] text-[#F8FAFC]' : 'border-[#94A3B8] text-[#090A0C]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              style={{ backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 50%, #64748B 100%)' }}
              className="w-3.5 h-3.5 rounded-full border border-white shrink-0"
            />
            <span style={{ fontFamily: fontHeading }} className="text-xs font-bold truncate">
              {displayTitle}
            </span>
          </div>
          <span
            style={{
              fontFamily: fontMono,
              backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 55%, #94A3B8 100%)',
            }}
            className="px-2.5 py-0.5 rounded-full text-[#090A0C] border border-white text-xs font-bold shrink-0"
          >
            CHROME - SPECULAR
          </span>
        </div>
      );
    }

    return (
      <div
        data-donor-chrome="header"
        style={{ fontFamily: fontMono }}
        className={`shrink-0 px-3.5 ${isFull ? 'h-9' : 'h-8'} bg-[#170B0E] text-[#FEF2F2] border-b border-[#DC2626]/55 flex items-center justify-between gap-2 text-xs select-none`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] shadow-[0_0_8px_#DC2626] shrink-0" />
          <span className="truncate font-semibold">{displayTitle}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 tabular-nums">
          <svg viewBox="0 0 32 14" className="w-7 h-3.5 shrink-0" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => {
              const a = -Math.PI * 0.88 + (i / 8) * Math.PI * 0.76;
              const x1 = 16 + Math.cos(a) * 8;
              const y1 = 13 + Math.sin(a) * 8;
              const x2 = 16 + Math.cos(a) * 12;
              const y2 = 13 + Math.sin(a) * 12;
              return (
                <line
                  key={i}
                  x1={x1.toFixed(1)}
                  y1={y1.toFixed(1)}
                  x2={x2.toFixed(1)}
                  y2={y2.toFixed(1)}
                  stroke={i >= 6 ? '#DC2626' : '#FCA5A5'}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#DC2626] text-[#FFFFFF] font-bold">-1:21 - 320KBPS</span>
        </div>
      </div>
    );
  }

  if (activeStyle === 'product') {
    if (notch === 0) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#13161C] border-[#2B313D] text-[#FAFAFA]' : 'bg-[#EFEFEB] border-[#DCDCD6] text-[#111214]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span aria-hidden="true" className="inline-flex items-center gap-0.5 shrink-0">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-[3px] ${
                    i < 3 ? 'bg-[#2563EB]' : isDark ? 'bg-[#272A32]' : 'bg-[#D8D8D2]'
                  }`}
                />
              ))}
            </span>
            <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
              {displayTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-[#2563EB] text-[#FFFFFF] text-xs font-semibold tabular-nums">
              +2.4%
            </span>
            <span
              style={{ fontFamily: fontMono }}
              className={`px-2 py-0.5 rounded-[7px] border text-xs font-semibold ${
                isDark ? 'bg-[#1C2029] border-[#323948] text-[#E4E4E7]' : 'bg-[#FFFFFF] border-[#D4D4CE] text-[#18181B]'
              }`}
            >
              ⌘K
            </span>
          </div>
        </div>
      );
    }

    if (notch === 1) {
      const segs = ['Day', 'Week', 'Month', 'Year'];
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#121915] border-[#2B3D34] text-[#F4F7F5]' : 'bg-[#ECF2EE] border-[#D2E0D6] text-[#111214]'
          }`}
        >
          <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
            {displayTitle}
          </span>
          <div
            className={`inline-flex items-center p-0.5 rounded-[9px] border text-xs shrink-0 ${
              isDark ? 'bg-[#0D1310] border-[#2B3D34]' : 'bg-[#FFFFFF] border-[#D2E0D6]'
            }`}
          >
            {segs.slice(0, isFull ? 4 : 3).map((s) => (
              <span
                key={s}
                className={`px-2 py-0.5 rounded-[6px] font-semibold ${
                  s === 'Week' ? 'bg-[#15803D] text-[#FFFFFF]' : 'opacity-70'
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (notch === 2) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#16191E] border-[#2E333D] text-[#F8FAFC]' : 'bg-[#E4E4DE] border-[#C8C8BE] text-[#111317]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D9F94D] text-[#111317] text-xs font-bold shrink-0">
              Overview
            </span>
            <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
              {displayTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              aria-hidden="true"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, rgba(217,249,77,0.65) 0 2px, rgba(59,130,246,0.35) 2px 5px)',
              }}
              className="hidden sm:block w-10 h-4 rounded-[4px] border border-[#2E333D]"
            />
            <span style={{ fontFamily: fontMono }} className="text-xs font-bold tabular-nums">
              +42.8%
            </span>
          </div>
        </div>
      );
    }

    if (notch === 3) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#181B20] border-[#353A46] text-[#F8FAFC]' : 'bg-[#EFE9E2] border-[#D8CCC0] text-[#181512]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <svg viewBox="0 0 20 20" className="w-5 h-5 shrink-0" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="8" stroke="#EA580C" strokeWidth="2" strokeDasharray="34 52" transform="rotate(-90 10 10)" />
              <circle cx="10" cy="10" r="5" stroke="#10B981" strokeWidth="2" strokeDasharray="22 32" transform="rotate(-90 10 10)" />
            </svg>
            <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
              {displayTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-0.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`w-1.5 h-3.5 rounded-[2px] ${i === 4 ? 'bg-[#EA580C]' : 'bg-[#10B981]'}`}
                />
              ))}
            </span>
            <span style={{ fontFamily: fontMono }} className="px-2 py-0.5 rounded-full bg-[#C2410C] text-[#FFFFFF] text-xs font-bold tabular-nums">
              CTR 64%
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        data-donor-chrome="header"
        style={{ fontFamily: fontBody }}
        className={`shrink-0 px-3.5 ${isFull ? 'h-9' : 'h-8'} border-b flex items-center justify-between gap-2 select-none ${
          isDark ? 'bg-[#0F1114] border-[#262B33] text-[#F4F4F5]' : 'bg-[#F0F0EC] border-[#DCDCD7] text-[#111210]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#0D9488] shadow-[0_0_6px_rgba(13,148,136,0.65)] shrink-0" />
          <span style={{ fontFamily: fontHeading }} className="text-xs font-semibold truncate">
            {displayTitle}
          </span>
        </div>
        <span style={{ fontFamily: fontMono }} className="text-xs font-medium opacity-80 tabular-nums shrink-0">
          SYNC - 14ms
        </span>
      </div>
    );
  }

  if (activeStyle === 'brutal') {
    if (notch === 0) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} border-b-2 flex items-center justify-between gap-2 text-xs uppercase select-none ${
            isDark ? 'bg-[#0B0E0A] border-[#C8FF2E] text-[#F5F7F2]' : 'bg-[#EAEFE0] border-[#09090B] text-[#09090B]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 bg-[#C8FF2E] text-[#080908] border border-[#080908] font-bold shrink-0">
              CYBR_ //01
            </span>
            <span className="font-bold truncate">{displayTitle}</span>
          </div>
          <span className="font-bold tabular-nums shrink-0">{utcClock}</span>
        </div>
      );
    }

    if (notch === 1) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} border-b-2 flex items-center justify-between gap-2 text-xs uppercase select-none ${
            isDark ? 'bg-[#16120F] border-[#FF5A1F] text-[#FAF7F2]' : 'bg-[#EFE7DB] border-[#09090B] text-[#09090B]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 bg-[#FF5A1F] text-[#09090B] border border-[#09090B] font-bold shrink-0">
              TERRAIN 86
            </span>
            <span className="font-bold truncate">{displayTitle}</span>
          </div>
          <span
            aria-hidden="true"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-45deg, #FF5A1F 0 5px, #09090B 5px 10px)',
            }}
            className="w-16 h-4 border border-[#09090B] shrink-0"
          />
        </div>
      );
    }

    if (notch === 2) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} border-t-[3px] border-b-2 flex items-center justify-between gap-2 text-xs uppercase select-none ${
            isDark
              ? 'bg-[#191111] border-t-[#EF4444] border-b-[#EF4444] text-[#FAF7F5]'
              : 'bg-[#EFE9DC] border-t-[#09090B] border-b-[#09090B] text-[#09090B]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 bg-[#B91C1C] text-[#FFFFFF] border border-[#09090B] font-bold shrink-0">
              HOTEL 1974
            </span>
            <span className="font-bold truncate">{displayTitle}</span>
          </div>
          <span className="font-bold shrink-0">[ /01 - SWISS ]</span>
        </div>
      );
    }

    if (notch === 3) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontMono }}
          className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} bg-[#FACC15] text-[#09090B] border-b-2 border-[#09090B] flex items-center justify-between gap-2 text-xs uppercase select-none`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              aria-hidden="true"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, #09090B 0 4px, #FACC15 4px 8px)',
              }}
              className="w-8 h-4 border border-[#09090B] shrink-0"
            />
            <span className="font-bold truncate">CAUTION // {displayTitle}</span>
          </div>
          <span className="px-1.5 py-0.5 bg-[#09090B] text-[#FACC15] font-bold shrink-0">5PX_HARD</span>
        </div>
      );
    }

    return (
      <div
        data-donor-chrome="header"
        style={{ fontFamily: fontMono }}
        className={`shrink-0 px-3 ${isFull ? 'h-9' : 'h-8'} border-b-2 flex items-center justify-between gap-2 text-xs uppercase select-none ${
          isDark ? 'bg-[#09120E] border-[#10B981] text-[#ECFDF5]' : 'bg-[#E0ECE4] border-[#064E3B] text-[#06281E]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 bg-[#10B981] text-[#041E15] font-bold shrink-0">RAW_35°</span>
          <span className="font-bold truncate">{displayTitle}</span>
        </div>
        <span className="font-bold tabular-nums shrink-0">[======]</span>
      </div>
    );
  }

  if (activeStyle === 'playful') {
    if (notch === 0) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b-[1.5px] border-[#111111] flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#171A12] text-[#F8FAFC]' : 'bg-[#FFFFFF] text-[#111111]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <PlayfulScallopSvg fill="#F4FF52" />
            <span style={{ fontFamily: fontHeading }} className="text-xs font-bold truncate">
              {displayTitle}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-2 py-0.5 rounded-full bg-[#FF9452] text-[#111111] border border-[#111111] text-xs font-bold">
              Labs
            </span>
            <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-[#6EA8FE] text-[#111111] border border-[#111111] text-xs font-bold">
              Pop
            </span>
          </div>
        </div>
      );
    }

    if (notch === 1) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b-[3px] border-[#FF6B2C] flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#1F1612] text-[#FFF7ED]' : 'bg-[#FBECE0] text-[#111111]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-4 h-4 rounded-[6px] bg-[#FF6B2C] border border-[#111111] shrink-0" />
            <span style={{ fontFamily: fontHeading }} className="text-xs font-bold truncate">
              {displayTitle}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFD21F] text-[#111111] border border-[#111111] text-xs font-bold shrink-0">
            CLAY 3D
          </span>
        </div>
      );
    }

    if (notch === 2) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b-[1.5px] border-[#111111] flex items-center justify-between gap-2 select-none ${
            isDark ? 'bg-[#121D14] text-[#F0FDF4]' : 'bg-[#E7F2D5] text-[#111111]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-4 h-4 rounded-full bg-[#FFD21F] border border-[#111111] shrink-0" />
            <span style={{ fontFamily: fontHeading }} className="text-xs font-bold truncate">
              {displayTitle}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#34D399] text-[#051B11] border border-[#111111] text-xs font-bold shrink-0">
            MEADOW
          </span>
        </div>
      );
    }

    if (notch === 3) {
      return (
        <div
          data-donor-chrome="header"
          style={{ fontFamily: fontBody }}
          className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} bg-[#FFD21F] text-[#111111] border-b-[2px] border-[#111111] flex items-center justify-between gap-2 select-none`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span style={{ fontFamily: fontHeading }} className="text-xs font-extrabold uppercase tracking-tight truncate">
              ★ {displayTitle}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#1D5BEF] text-[#FFFFFF] border border-[#111111] border-b-[3px] text-xs font-bold shrink-0">
            1UP - $500
          </span>
        </div>
      );
    }

    return (
      <div
        data-donor-chrome="header"
        style={{ fontFamily: fontBody }}
        className={`shrink-0 px-3.5 ${isFull ? 'h-10' : 'h-8'} border-b-[1.5px] border-[#111111] flex items-center justify-between gap-2 select-none ${
          isDark ? 'bg-[#161C0F] text-[#F7FEE7]' : 'bg-[#F1F9E0] text-[#111111]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 rounded-[6px] bg-[#D6F865] text-[#111111] border border-[#111111] text-xs font-extrabold shrink-0">
            69
          </span>
          <span style={{ fontFamily: fontHeading }} className="text-xs font-bold truncate">
            {displayTitle}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-3.5 h-3.5 rounded-full bg-[#FFA8D8] border border-[#111111]" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#6EA8FE] border border-[#111111]" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#F4FF52] border border-[#111111]" />
        </div>
      </div>
    );
  }

  if (notch === 0) {
    return (
      <div data-donor-chrome="header" className="shrink-0 select-none">
        <div className="h-[26px] px-2 bg-gradient-to-r from-[#0A246A] to-[#3A6EA5] text-[#FFFFFF] flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 min-w-0 text-xs font-bold">
            <PaintPaletteIcon />
            <span className="truncate">untitled - Paint - {displayTitle}</span>
          </span>
          <span className="inline-flex items-center gap-[2px] shrink-0">
            {['_', '□', '×'].map((g) => (
              <span
                key={g}
                aria-hidden="true"
                className={`w-4 h-4 text-xs font-bold leading-none flex items-center justify-center border border-[#000000] shadow-[inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] ${
                  g === '×' ? 'bg-[#CC0000] text-[#FFFFFF]' : 'bg-[#D4D0C8] text-[#000000]'
                }`}
              >
                {g}
              </span>
            ))}
          </span>
        </div>
        {isFull && (
          <div
            className={`h-[22px] px-2.5 flex items-center gap-3 text-xs border-b ${
              isDark ? 'bg-[#252930] text-[#F4F4F5] border-[#525866]' : 'bg-[#D4D0C8] text-[#000000] border-[#808080]'
            }`}
          >
            {['File', 'Edit', 'View', 'Image', 'Options', 'Help'].map((m) => (
              <span key={m}>
                <span className="underline">{m[0]}</span>
                {m.slice(1)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (notch === 1) {
    return (
      <div
        data-donor-chrome="header"
        style={{ fontFamily: fontMono }}
        className="shrink-0 bg-[#041008] text-[#39FF14] border-b border-[#39FF14]/50 select-none"
      >
        <div className="h-[28px] px-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-1.5 py-0.5 border border-[#F59E0B] text-[#F59E0B] font-bold shrink-0">
              SYS.HUD
            </span>
            <span
              style={{ textShadow: '0 0 6px rgba(57,255,20,0.55)' }}
              className="font-bold tracking-wider truncate"
            >
              [ VECTOR_CRT // {displayTitle} ]
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-[#06B6D4] font-semibold tabular-nums">GRID 37.80</span>
            <span className="px-1.5 py-0.5 bg-[#EA580C]/20 border border-[#EA580C] text-[#F59E0B] font-bold">
              COLLISION ALERT // C7
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (notch === 2) {
    return (
      <div data-donor-chrome="header" style={{ fontFamily: fontMono }} className="shrink-0 select-none border-b-2 border-[#000000]">
        <div className="h-[28px] px-2.5 bg-[#5C94FC] text-[#09090B] flex items-center justify-between gap-2 text-xs font-bold">
          <div className="flex items-center gap-2 min-w-0">
            <MarioQuestionCoinIcon />
            <span className="px-1.5 py-0.5 bg-[#09090B] text-[#FFFFFF] truncate uppercase">
              WORLD 1-1 - {displayTitle}
            </span>
            <span className="hidden sm:inline-flex">
              <MarioCloudSvg />
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 tabular-nums">
            <span className="px-1.5 py-0.5 bg-[#09090B] text-[#F8D870] border border-[#000000]">×24</span>
            <span className="hidden sm:inline px-1.5 py-0.5 bg-[#15803D] text-[#FFFFFF] border border-[#000000]">
              PIPE 1UP
            </span>
          </div>
        </div>
        {isFull && <div style={BRICK_BG_STYLE} className="h-[6px] w-full border-t border-[#000000]" />}
      </div>
    );
  }

  if (notch === 3) {
    return (
      <div data-donor-chrome="header" className="shrink-0 select-none">
        <div className="h-[26px] px-2.5 bg-gradient-to-r from-[#0A47A9] to-[#2563EB] text-[#FFFFFF] flex items-center justify-between gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <AimRunningManIcon />
            <span className="truncate">Buddy List - {displayTitle}</span>
          </span>
          <span className="inline-flex items-center gap-[2px] shrink-0">
            {['_', '□', '×'].map((g) => (
              <span
                key={g}
                aria-hidden="true"
                className={`w-4 h-4 text-xs font-bold leading-none flex items-center justify-center border border-[#000000] ${
                  g === '×' ? 'bg-[#CC0000] text-[#FFFFFF]' : 'bg-[#ECE9D8] text-[#000000]'
                }`}
              >
                {g}
              </span>
            ))}
          </span>
        </div>
        <div
          className={`h-[24px] px-2.5 border-b flex items-center justify-between gap-2 text-xs ${
            isDark ? 'bg-[#161E2E] text-[#F1F5F9] border-[#3B5984]' : 'bg-[#ECE9D8] text-[#0F172A] border-[#7F9DB9]'
          }`}
        >
          <div className="flex items-center gap-3 font-medium">
            <span>My AIM</span>
            <span>People</span>
            <span>Help</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Online</span>
            </span>
            <span aria-hidden="true" className="inline-flex items-center gap-[1px] p-[2px] bg-[#000000] border border-[#808080]">
              {['#22C55E', '#22C55E', '#22C55E', '#22C55E', '#FACC15', '#DC2626'].map((c, i) => (
                <span key={i} style={{ backgroundColor: i < 5 ? c : '#1F2937' }} className="w-[3px] h-[8px] block" />
              ))}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-donor-chrome="header" style={{ fontFamily: fontMono }} className="shrink-0 select-none bg-[#1E2229] text-[#E9D9A6] border-b border-[#000000]">
      <div className="h-[24px] px-2.5 bg-gradient-to-b from-[#2C323D] to-[#171A20] border-b border-[#000000] flex items-center gap-2">
        <span aria-hidden="true" className="w-2.5 h-2.5 bg-[#39FF14] border border-[#000000] shadow-[0_0_5px_#39FF14] shrink-0" />
        <span aria-hidden="true" className="flex-1 min-w-[12px] h-[5px] border-y border-[#B48A3E]/85" />
        <span className="text-xs font-bold tracking-[0.16em] uppercase text-[#E9D9A6] truncate">
          WINAMP 2.91 // {displayTitle}
        </span>
        <span aria-hidden="true" className="flex-1 min-w-[12px] h-[5px] border-y border-[#B48A3E]/85" />
        <span className="inline-flex items-center gap-[2px] shrink-0">
          {['_', '□', '×'].map((g) => (
            <span
              key={g}
              aria-hidden="true"
              className="w-4 h-4 text-xs leading-none flex items-center justify-center bg-[#323946] text-[#E9D9A6] border border-[#000000]"
            >
              {g}
            </span>
          ))}
        </span>
      </div>

      <div className="h-[26px] px-2.5 bg-[#181C22] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span
            style={{ textShadow: '0 0 6px rgba(57,255,20,0.65)' }}
            className="px-2 py-0.5 bg-[#040806] text-[#39FF14] border border-[#000000] shadow-[inset_1px_1px_0_#000000,inset_-1px_-1px_0_#3A4150] font-bold tabular-nums shrink-0"
          >
            {wampClock}
          </span>
          <WinampSpectrumStrip count={isFull ? 18 : 10} />
          <span className="hidden md:inline px-1.5 py-0.5 bg-[#040806] text-[#39FF14] border border-[#000000] text-xs tabular-nums truncate">
            256 kbps - 44 kHz - STEREO
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1 shrink-0">
          {['ADD', 'REM', 'SEL', 'MISC'].map((cmd) => (
            <span
              key={cmd}
              className="px-1.5 py-[1px] bg-gradient-to-b from-[#4C5464] to-[#252A33] text-[#E9D9A6] border border-[#000000] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] text-xs font-bold leading-tight"
            >
              {cmd}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const JigDonorChromeFooter: React.FC<{
  activeStyle: DonorStyleId;
  variantIdx: number;
  isDark: boolean;
  isFull: boolean;
  fontMono: string;
}> = ({ activeStyle, variantIdx, isDark, isFull, fontMono }) => {
  if (!isFull || activeStyle === 'clone') return null;
  const notch = Math.max(0, Math.min(4, Math.floor(variantIdx || 0)));

  if (activeStyle === 'retro' && notch === 0) {
    return (
      <div
        data-donor-chrome="footer"
        className={`shrink-0 px-2.5 py-1 border-t flex items-center justify-between gap-3 select-none ${
          isDark ? 'bg-[#20242B] border-[#525866] text-[#F4F4F5]' : 'bg-[#D4D0C8] border-[#808080] text-[#000000]'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 bg-[#FFFFFF] border border-[#808080] shadow-[inset_1px_1px_0_#000000] relative shrink-0">
            <span className="absolute top-0.5 left-0.5 w-3 h-3 bg-[#0A246A] border border-[#000000]" />
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#FACC15] border border-[#000000]" />
          </div>
          <div className="grid grid-cols-14 gap-[2px]">
            {WIN98_SAFE_SWATCHES.map((hex, idx) => (
              <span
                key={idx}
                style={{ backgroundColor: hex }}
                className="w-3 h-3 border border-[#000000] block"
              />
            ))}
          </div>
        </div>
        <span className="hidden md:inline text-xs truncate opacity-80">
          For Help, click Help Topics on the Help Menu.
        </span>
      </div>
    );
  }

  if (activeStyle === 'grid') {
    return (
      <div
        data-donor-chrome="footer"
        style={{ fontFamily: fontMono }}
        className={`shrink-0 h-6 px-3 border-t flex items-center justify-between text-xs select-none ${
          isDark ? 'bg-[#080A0F] border-white/15 text-[#94A3B8]' : 'bg-[#EAE2D6] border-black/20 text-[#18181B]'
        }`}
      >
        <span>{notch === 4 ? '+ TELEMETRY_LOCK' : 'P1 - 36 - 1970—1972'}</span>
        <span className="tabular-nums">{notch === 4 ? '02:06:19 // +28934' : 'A———B - exp. 002'}</span>
      </div>
    );
  }

  return null;
};

export const JigDonorStageBackdrop: React.FC<{
  activeStyle: DonorStyleId;
  variantIdx: number;
  isDark: boolean;
}> = ({ activeStyle, variantIdx, isDark }) => {
  if (activeStyle === 'clone') return null;
  const notch = Math.max(0, Math.min(4, Math.floor(variantIdx || 0)));

  if (activeStyle === 'cinematic' && notch === 0) {
    const stroke = isDark ? 'rgba(245,246,248,0.12)' : 'rgba(20,21,24,0.11)';
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
        <svg viewBox="0 0 800 500" fill="none" className="w-full h-full">
          <line x1="260" y1="250" x2="365" y2="250" stroke={stroke} strokeWidth="1.2" />
          <line x1="435" y1="250" x2="540" y2="250" stroke={stroke} strokeWidth="1.2" />
          <circle cx="400" cy="250" r="18" stroke="rgba(217,107,39,0.22)" strokeWidth="1.2" />
          <line x1="320" y1="180" x2="360" y2="180" stroke={stroke} strokeWidth="1" />
          <line x1="440" y1="180" x2="480" y2="180" stroke={stroke} strokeWidth="1" />
          <line x1="320" y1="320" x2="360" y2="320" stroke={stroke} strokeWidth="1" />
          <line x1="440" y1="320" x2="480" y2="320" stroke={stroke} strokeWidth="1" />
        </svg>
      </div>
    );
  }

  if (activeStyle === 'editorial' && (notch === 0 || notch === 1)) {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
        <div
          style={{
            background: isDark
              ? 'radial-gradient(circle at 86% 82%, rgba(22,82,200,0.12), transparent 45%), radial-gradient(circle at 14% 78%, rgba(217,101,40,0.10), transparent 42%)'
              : 'radial-gradient(circle at 86% 82%, rgba(22,82,200,0.07), transparent 45%), radial-gradient(circle at 14% 78%, rgba(217,101,40,0.07), transparent 42%)',
          }}
          className="absolute inset-0"
        />
      </div>
    );
  }

  if (activeStyle === 'grid') {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
        <div
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(rgba(245,158,11,0.26) 1px, transparent 1px)'
              : 'linear-gradient(to right, rgba(21,70,224,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(21,70,224,0.09) 1px, transparent 1px)',
            backgroundSize: isDark ? '28px 28px' : '32px 32px',
          }}
          className="absolute inset-0"
        />
      </div>
    );
  }

  return null;
};

export const JigDonorAmbientOverlay: React.FC<{
  activeStyle: DonorStyleId;
  variantIdx: number;
  isDark: boolean;
}> = ({ activeStyle, variantIdx, isDark }) => {
  if (activeStyle === 'clone') return null;
  const notch = Math.max(0, Math.min(4, Math.floor(variantIdx || 0)));

  if (activeStyle === 'editorial' && notch === 4) {
    const stroke = isDark ? '#38BDF8' : '#0284C7';
    const fill = isDark ? '#0F1317' : '#FFFFFF';
    const sq: React.CSSProperties = { borderColor: stroke, backgroundColor: fill };
    return (
      <div aria-hidden="true" className="pointer-events-none absolute -inset-[4px] z-30">
        <span style={sq} className="absolute top-0 left-0 w-2.5 h-2.5 border-[1.5px]" />
        <span style={sq} className="absolute top-0 right-0 w-2.5 h-2.5 border-[1.5px]" />
        <span style={sq} className="absolute bottom-0 left-0 w-2.5 h-2.5 border-[1.5px]" />
        <span style={sq} className="absolute bottom-0 right-0 w-2.5 h-2.5 border-[1.5px]" />
      </div>
    );
  }

  if (activeStyle === 'cinematic' && notch === 2) {
    const hole = isDark
      ? 'bg-white/25 border border-white/40'
      : 'bg-[#C7C7C2] border border-[#16171A]/65';
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-1.5 z-30">
        <span className={`absolute top-0 left-0 w-2 h-2 rounded-full ${hole}`} />
        <span className={`absolute top-0 right-0 w-2 h-2 rounded-full ${hole}`} />
        <span className={`absolute bottom-0 left-0 w-2 h-2 rounded-full ${hole}`} />
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${hole}`} />
      </div>
    );
  }

  if (activeStyle === 'retro' && notch === 1) {
    return (
      <span
        aria-hidden="true"
        style={{
          backgroundImage: isDark
            ? 'repeating-linear-gradient(0deg, rgba(57,255,20,0.035) 0px, rgba(57,255,20,0.035) 1px, transparent 1px, transparent 3px)'
            : 'repeating-linear-gradient(0deg, rgba(21,128,61,0.035) 0px, rgba(21,128,61,0.035) 1px, transparent 1px, transparent 3px)',
        }}
        className="pointer-events-none absolute inset-0 z-20"
      />
    );
  }

  return null;
};

export const JIG_DONOR_ROLE_CSS = `
@keyframes jigWampSpecPulse {
  0%, 100% { transform: scaleY(0.38); }
  50% { transform: scaleY(1); }
}
.jig-wamp-spec-bar {
  transform-origin: bottom;
  animation: jigWampSpecPulse 0.85s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .jig-wamp-spec-bar {
    animation: none !important;
  }
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content :is(img, video, canvas, [data-no-skin], [data-no-skin] *) {
  border-radius: revert;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="sidebar"]:not([data-no-skin]) {
  background-color: var(--sb-sidebar-bg) !important;
  color: var(--sb-sidebar-ink) !important;
  border-color: var(--sb-border) !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="sidebar"] :is([data-active="true"], [aria-selected="true"], [aria-current="page"], [aria-current="true"]):not(svg):not(svg *):not([data-no-skin]) {
  background-color: var(--sb-sidebar-active-bg) !important;
  color: var(--sb-sidebar-active-ink) !important;
  border-color: var(--sb-sidebar-active-bg) !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="sidebar"] :is([data-active="true"], [aria-selected="true"], [aria-current="page"], [aria-current="true"]):not(svg):not(svg *):not([data-no-skin]) * {
  color: var(--sb-sidebar-active-ink) !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is([data-donor-role="sidebar"], aside):not([data-no-skin]) {
  --sb-ink: #39FF14 !important;
  --sb-ink-muted: #86EFAC !important;
  --sb-surface: #040806 !important;
  --sb-card: #08110C !important;
  background-color: #040806 !important;
  color: #39FF14 !important;
  border-color: #B48A3E !important;
  box-shadow: inset 2px 2px 0 #000000, inset -1px -1px 0 #4A5262 !important;
  font-family: var(--sb-font-mono) !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is([data-donor-role="sidebar"], aside):not([data-no-skin]) :is(div, span, p, a, li, button):not([data-active="true"]):not([aria-selected="true"]):not([aria-current="page"]):not([aria-pressed="true"]):not([data-no-skin]) {
  color: #39FF14 !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is([data-donor-role="sidebar"], aside) button:not([data-active="true"]):not([aria-selected="true"]):not([aria-current="page"]):not([aria-pressed="true"]):not([data-no-skin]) {
  background-color: #08110C !important;
  border-color: #1B3B28 !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is([data-donor-role="sidebar"], aside) :is([data-active="true"], [aria-selected="true"], [aria-current="page"], [aria-pressed="true"]):not(svg):not(svg *):not([data-no-skin]) {
  background-color: #0D3B7A !important;
  color: #FFFFFF !important;
  border-color: #60A5FA !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is([data-donor-role="sidebar"], aside) :is([data-active="true"], [aria-selected="true"], [aria-current="page"], [aria-pressed="true"]):not(svg):not(svg *):not([data-no-skin]) * {
  color: #FFFFFF !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="toolbar"]:not([data-no-skin]) {
  background-color: var(--sb-toolbar-bg) !important;
  border-color: var(--sb-border) !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content [data-donor-role="toolbar"]:not([data-no-skin]) {
  background: linear-gradient(180deg, #2A303B 0%, #191D24 100%) !important;
  border-bottom: 1px solid #B48A3E !important;
  color: #E9D9A6 !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="hero-card"]:not([data-no-skin]) {
  --sb-ink: var(--sb-hero-ink) !important;
  --sb-ink-muted: var(--sb-hero-muted) !important;
  --sb-card: var(--sb-hero-bg) !important;
  --sb-surface: var(--sb-hero-bg) !important;
  --sb-border: var(--sb-hero-border) !important;
  position: relative;
  background-color: var(--sb-hero-bg) !important;
  background-image: none !important;
  color: var(--sb-hero-ink) !important;
  border: var(--sb-border-w) solid var(--sb-hero-border) !important;
  border-radius: var(--sb-radius-card) !important;
  box-shadow: var(--sb-hero-shadow) !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="hero-card"]:not([data-no-skin]) :is(h1, h2, h3, h4, h5, h6, p, span, div, strong, b, label, td, th, li):not(button):not(button *):not(input):not(select):not(textarea):not(svg):not(svg *):not([data-no-skin]):not([data-no-skin] *) {
  color: var(--sb-hero-ink) !important;
}

.skin-bridge-host[data-skin-bridge="editorial"][data-skin-variant="2"] .skin-bridge-content [data-donor-role="hero-card"]:not([data-no-skin]) {
  border-top: 3px solid #0F1110 !important;
}

.skin-bridge-host[data-skin-bridge="editorial"][data-skin-variant="4"] .skin-bridge-content [data-donor-role="hero-card"]:not([data-no-skin]) {
  outline: 1.5px solid #38BDF8 !important;
  outline-offset: 2px;
}

.skin-bridge-host[data-skin-bridge="playful"] .skin-bridge-content [data-donor-role="hero-card"]:not([data-no-skin]) {
  border-width: 1.5px !important;
}

.skin-bridge-host[data-skin-bridge="brutal"] .skin-bridge-content [data-donor-role="hero-card"]:not([data-no-skin]) {
  border-width: 2px !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="card"]:not([data-no-skin]) {
  background-color: var(--sb-card) !important;
  color: var(--sb-ink) !important;
  border-color: var(--sb-border) !important;
  border-radius: var(--sb-radius-card) !important;
  box-shadow: var(--sb-card-shadow) !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="inspector"]:not([data-no-skin]) {
  background-color: var(--sb-inspector-bg) !important;
  color: var(--sb-ink) !important;
  border-color: var(--sb-border) !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="well"]:not([data-no-skin]) {
  background-color: var(--sb-well-bg) !important;
  color: var(--sb-well-ink) !important;
  border-color: var(--sb-border) !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="segmented"]:not([data-no-skin]) {
  background-color: var(--sb-muted) !important;
  border: 1px solid var(--sb-border) !important;
  border-radius: var(--sb-radius-control) !important;
}

.skin-bridge-host[data-skin-bridge]:not([data-skin-bridge="clone"]) .skin-bridge-content [data-donor-role="timeline"]:not([data-no-skin]) {
  background-color: var(--sb-well-bg) !important;
  color: var(--sb-well-ink) !important;
  border-top: var(--sb-border-w) solid var(--sb-border) !important;
  border-color: var(--sb-border) !important;
}

.skin-bridge-host[data-skin-bridge="clean"][data-skin-variant="2"][data-theme="light"] .skin-bridge-content :is([data-donor-role="well"], [data-donor-role="segmented"], [data-donor-role="timeline"]):not([data-no-skin]) {
  box-shadow: inset 3px 3px 7px rgba(148, 163, 184, 0.35), inset -3px -3px 7px #FFFFFF !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="0"][data-theme="light"] .skin-bridge-content :is([data-donor-role="well"], [data-donor-role="timeline"]):not([data-no-skin]) {
  background-color: #FFFFFF !important;
  box-shadow: inset 1px 1px 0 #808080, inset 2px 2px 0 #000000, inset -1px -1px 0 #DFDFDF !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="2"] .skin-bridge-content :is([data-donor-role="card"], [data-donor-role="well"], [data-donor-role="inspector"]):not([data-no-skin]) {
  border-width: 2px !important;
  border-radius: 0px !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is([data-donor-role="well"], [data-donor-role="timeline"], pre):not([data-no-skin]) {
  --sb-ink: #39FF14 !important;
  --sb-ink-muted: #E9D9A6 !important;
  background-color: #040806 !important;
  color: #39FF14 !important;
  border: 1px solid #4A5262 !important;
  box-shadow: inset 2px 2px 0 #000000, inset -1px -1px 0 #3A4150 !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content [data-donor-role="timeline"] :is(span, div):not(button):not([data-no-skin]) {
  border-color: #274734 !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content button:not([data-no-skin]) {
  background: linear-gradient(180deg, #4C5464 0%, #252A33 100%) !important;
  color: #E9D9A6 !important;
  border: 1px solid #000000 !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
  border-radius: 2px !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is(
  button:is([aria-pressed="true"], [aria-selected="true"], [data-active="true"], [type="submit"], [data-primary-cta="true"]),
  [data-primary-cta="true"]
):not([data-no-skin]),
.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is([data-active="true"], [aria-selected="true"], [aria-current="page"], [aria-pressed="true"]):not(aside *):not([data-donor-role="sidebar"] *):not(svg):not(svg *):not([data-no-skin]) {
  background: #040806 !important;
  background-color: #040806 !important;
  color: #39FF14 !important;
  border: 1px solid #C9A94E !important;
  box-shadow: inset 1px 1px 0 #000000, 0 0 8px rgba(57, 255, 20, 0.25) !important;
}

.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is(
  button:is([aria-pressed="true"], [aria-selected="true"], [data-active="true"], [type="submit"], [data-primary-cta="true"]),
  [data-primary-cta="true"]
):not([data-no-skin]) *,
.skin-bridge-host[data-skin-bridge="retro"][data-skin-variant="4"] .skin-bridge-content :is([data-active="true"], [aria-selected="true"], [aria-current="page"], [aria-pressed="true"]):not(aside *):not([data-donor-role="sidebar"] *):not(svg):not(svg *):not([data-no-skin]) * {
  color: #39FF14 !important;
}
`;
