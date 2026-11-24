import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export const JIG_TOP_Z_INDEX = 2147483640;
export const JIG_SAFE_ZONE_PADDING_PX = 76;

export const STYLE_JIG_SLOTS = [
  'clone',
  'clean',
  'grid',
  'editorial',
  'cinematic',
  'product',
  'brutal',
  'playful',
  'retro',
] as const;

export const STYLE_JIG_UI_LIBRARIES = [
  { id: 'shadcn', label: 'shadcn' },
  { id: 'ease', label: 'ease' },
  { id: 'fluid', label: 'fluid' },
] as const;

export const STYLE_JIG_MOTION_LIBRARIES = [
  { id: 'motion-craft', label: 'motion-craft' },
] as const;

export type StyleSlotId = (typeof STYLE_JIG_SLOTS)[number];
export type StyleJigId = StyleSlotId;
export type UiLibrarySlotId = 'shadcn' | 'ease' | 'fluid' | 'shade' | 'affect' | 'designme';
export type CanonicalUiLibraryId = (typeof STYLE_JIG_UI_LIBRARIES)[number]['id'];
export type MotionLibrarySlotId = 'motion-craft' | 'motion' | 'gsap' | 'lenis' | 'spring';
export type JigThemeMode = 'dark' | 'light';
export type ImmersiveLayerMode = '3d' | 'parallax' | 'shader' | 'immersive';
export type ImmersivePlacement = 'lower-right' | 'right-center';

export interface ImmersiveSliderSpec {
  key: string;
  label: string;
  min: number;
  max: number;
  dec: number;
}

export interface ImmersiveToggleSpec {
  key: string;
  label: string;
}

export interface ImmersiveSwatchSpec {
  key: string;
  label: string;
}

export interface ImmersiveWordStripSpec {
  key: string;
  options: readonly string[];
}

export interface ImmersiveDropdownSpec {
  key: string;
  options: readonly string[];
}

export interface ImmersiveSchemaSpec {
  title: string;
  dropdown?: ImmersiveDropdownSpec;
  words?: ImmersiveWordStripSpec;
  sliders: readonly ImmersiveSliderSpec[];
  toggles?: readonly ImmersiveToggleSpec[];
  swatches?: readonly ImmersiveSwatchSpec[];
  defaults: Record<string, string | number | boolean>;
  formatCopy?: (params: Record<string, string | number | boolean>) => string;
}

export const DEFAULT_IMMERSIVE_SCHEMAS: Record<ImmersiveLayerMode, ImmersiveSchemaSpec> = {
  '3d': {
    title: '3d',
    words: {
      key: 'shapeType',
      options: ['chain', 'helix', 'ring', 'wave', 'arch'],
    },
    sliders: [
      { key: 'count', label: 'count', min: 3, max: 14, dec: 0 },
      { key: 'gap', label: 'gap', min: 0, max: 0.6, dec: 2 },
      { key: 'scrollSpeed', label: 'scroll', min: 0, max: 2.0, dec: 2 },
      { key: 'rotSpeed', label: 'spin', min: 0, max: 2.0, dec: 2 },
      { key: 'camZ', label: 'depth', min: 4.0, max: 10.0, dec: 1 },
    ],
    swatches: [{ key: 'cuboidColor', label: 'surface' }],
    defaults: {
      shapeType: 'chain',
      count: 8,
      gap: 0.01,
      scrollSpeed: 0.6,
      rotSpeed: 0.57,
      camZ: 6.2,
      cuboidColor: '#242424',
    },
    formatCopy: (p) => JSON.stringify(p, null, 2),
  },
  parallax: {
    title: 'parallax',
    sliders: [
      { key: 'headSpeed', label: 'head speed', min: -0.6, max: 0.6, dec: 2 },
      { key: 'lineSpread', label: 'line spread', min: 0, max: 56, dec: 0 },
      { key: 'bodySpeed', label: 'body speed', min: -0.5, max: 0.5, dec: 2 },
      { key: 'btnSpeed', label: 'btn speed', min: -0.5, max: 0.6, dec: 2 },
      { key: 'oscAmp', label: 'scroll wave', min: 0, max: 24, dec: 1 },
      { key: 'hoverLift', label: 'hover lift', min: -18, max: 0, dec: 1 },
    ],
    toggles: [{ key: 'autoScroll', label: 'auto-scroll' }],
    defaults: {
      headSpeed: -0.09,
      lineSpread: 12,
      bodySpeed: -0.04,
      btnSpeed: 0.08,
      oscAmp: 0,
      hoverLift: -4,
      autoScroll: false,
    },
    formatCopy: (p) =>
      `Parallax — headSpeed: ${p.headSpeed}, lineSpread: ${p.lineSpread}px, bodySpeed: ${p.bodySpeed}, btnSpeed: ${p.btnSpeed}, scrollWave: ${p.oscAmp}px, hoverLift: ${p.hoverLift}px`,
  },
  shader: {
    title: 'shader',
    dropdown: {
      key: 'shaderPreset',
      options: ['silk blend', 'mesh drift', 'ink ridges', 'gradient mesh', 'ascii art'],
    },
    sliders: [
      { key: 'angle', label: 'angle', min: 0, max: 360, dec: 0 },
      { key: 'wave', label: 'wave', min: 0, max: 40, dec: 0 },
      { key: 'distortion', label: 'distortion', min: 0, max: 80, dec: 0 },
      { key: 'soften', label: 'soften', min: 0, max: 100, dec: 0 },
      { key: 'vignette', label: 'vignette', min: 0, max: 100, dec: 0 },
      { key: 'grain', label: 'grain', min: 0, max: 150, dec: 0 },
    ],
    defaults: {
      shaderPreset: 'silk blend',
      angle: 170,
      wave: 12,
      distortion: 28,
      soften: 58,
      vignette: 48,
      grain: 100,
      col0: '#16130e',
      col1: '#0c1617',
      col2: '#63959c',
    },
    formatCopy: (p) =>
      `/* shader: ${p.shaderPreset} */ linear-gradient(${p.angle}deg, ${p.col0} 0%, ${p.col1} 69%, ${p.col2} 100%) /* wave:${p.wave} distort:${p.distortion} soften:${p.soften} vignette:${p.vignette} grain:${p.grain} */`,
  },
  immersive: {
    title: 'immersive',
    sliders: [
      { key: 'depth', label: 'depth', min: 4.0, max: 10.0, dec: 1 },
      { key: 'motion', label: 'motion', min: 0, max: 2.0, dec: 2 },
      { key: 'wave', label: 'wave', min: 0, max: 40, dec: 0 },
      { key: 'soften', label: 'soften', min: 0, max: 100, dec: 0 },
      { key: 'grain', label: 'grain', min: 0, max: 150, dec: 0 },
    ],
    defaults: {
      depth: 6.2,
      motion: 0.6,
      wave: 12,
      soften: 58,
      grain: 100,
    },
    formatCopy: (p) => JSON.stringify(p, null, 2),
  },
};

declare global {
  interface Window {
    __JIG_IMMERSIVE_SCHEMA__?: Partial<Record<ImmersiveLayerMode, Partial<ImmersiveSchemaSpec>>>;
    __JIG_3D__?: unknown;
    __JIG_PARALLAX__?: unknown;
    __JIG_SHADER__?: unknown;
  }
}

export interface StyleJigContextValue {
  styleId: StyleSlotId;
  setStyleId: (id: StyleSlotId) => void;
  uiLibrary: CanonicalUiLibraryId;
  setUiLibrary: (id: UiLibrarySlotId) => void;
  motionLibrary: MotionLibrarySlotId;
  setMotionLibrary: (id: MotionLibrarySlotId) => void;
  theme: JigThemeMode;
  setTheme: (theme: JigThemeMode) => void;
  toggleTheme: () => void;
  autoActive: boolean;
  setAutoActive: (active: boolean) => void;
  toggleAuto: () => void;
  immersiveMode: ImmersiveLayerMode | null;
  immersiveParams: Record<ImmersiveLayerMode, Record<string, string | number | boolean>>;
  updateImmersiveParam: (
    mode: ImmersiveLayerMode,
    key: string,
    value: string | number | boolean
  ) => void;
  resetImmersiveMode: (mode: ImmersiveLayerMode) => void;
  isJigHidden: boolean;
}

const StyleJigContext = createContext<StyleJigContextValue | null>(null);

function getEffectiveQueryString(): string {
  if (typeof window === 'undefined' || !window.location) return '';
  const search = window.location.search || '';
  if (search.length > 1) return search;
  const hash = window.location.hash || '';
  if (hash.includes('=')) {
    return hash.replace(/^#\??/, '');
  }
  return '';
}

export function isStyleSlotId(value: string | null | undefined): value is StyleSlotId {
  if (!value) return false;
  return (STYLE_JIG_SLOTS as readonly string[]).includes(value.trim().toLowerCase());
}

export function normalizeUiLibrarySlotId(
  value: string | null | undefined
): CanonicalUiLibraryId | null {
  if (!value) return null;
  const clean = value.trim().toLowerCase();
  if (clean === 'shadcn' || clean === 'shade') return 'shadcn';
  if (clean === 'ease' || clean === 'affect' || clean === 'affectui' || clean === 'easeui') {
    return 'ease';
  }
  if (clean === 'fluid') return 'fluid';
  return null;
}

export function normalizeMotionLibrarySlotId(
  value: string | null | undefined
): MotionLibrarySlotId | null {
  if (!value) return null;
  const clean = value.trim().toLowerCase();
  if (clean === 'motion-craft' || clean === 'motion') return 'motion-craft';
  if (clean === 'gsap') return 'gsap';
  if (clean === 'lenis') return 'lenis';
  if (clean === 'spring' || clean === 'css-spring') return 'spring';
  return null;
}

export function parseInitialStyleFromUrl(fallback: StyleSlotId = 'clone'): StyleSlotId {
  try {
    const params = new URLSearchParams(getEffectiveQueryString());
    const raw = params.get('style') ?? params.get('skin') ?? params.get('slot');
    if (raw && isStyleSlotId(raw)) {
      return raw.trim().toLowerCase() as StyleSlotId;
    }
  } catch {
    // Ignore URL parsing errors
  }
  return fallback;
}

export function parseInitialUiLibraryFromUrl(
  fallback: CanonicalUiLibraryId = 'shadcn'
): CanonicalUiLibraryId {
  try {
    const params = new URLSearchParams(getEffectiveQueryString());
    const raw = params.get('lib') ?? params.get('ui');
    const parsed = normalizeUiLibrarySlotId(raw);
    if (parsed) return parsed;
  } catch {
    // Ignore URL parsing errors
  }
  return fallback;
}

export function parseInitialMotionLibraryFromUrl(
  fallback: MotionLibrarySlotId = 'motion-craft'
): MotionLibrarySlotId {
  try {
    const params = new URLSearchParams(getEffectiveQueryString());
    const raw = params.get('motion');
    const parsed = normalizeMotionLibrarySlotId(raw);
    if (parsed) return parsed;
  } catch {
    // Ignore URL parsing errors
  }
  return fallback;
}

export function parseInitialThemeFromUrl(fallback: JigThemeMode = 'light'): JigThemeMode {
  try {
    const params = new URLSearchParams(getEffectiveQueryString());
    const raw = params.get('theme')?.trim().toLowerCase();
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    // Ignore URL parsing errors
  }
  if (typeof document !== 'undefined') {
    const existing =
      document.body?.getAttribute('data-theme') ??
      document.documentElement?.getAttribute('data-theme');
    if (existing === 'dark' || existing === 'light') return existing;
  }
  return fallback;
}

export function parseInitialAutoFromUrl(fallback = false): boolean {
  try {
    const params = new URLSearchParams(getEffectiveQueryString());
    const raw = params.get('auto')?.trim().toLowerCase();
    if (raw === '1' || raw === 'true' || raw === 'play') return true;
    if (raw === '0' || raw === 'false') return false;
  } catch {
    // Ignore URL parsing errors
  }
  return fallback;
}

export function parseNoJigFromUrl(): boolean {
  try {
    const params = new URLSearchParams(getEffectiveQueryString());
    const nojig = params.get('nojig')?.trim().toLowerCase();
    const imprint = params.get('imprint')?.trim().toLowerCase();
    return nojig === '1' || nojig === 'true' || imprint === '1' || imprint === 'true';
  } catch {
    return false;
  }
}

const JIG_FONT_FAMILY_NAME = 'Instrument Sans';
const JIG_FONT_STACK = `'${JIG_FONT_FAMILY_NAME}', 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, sans-serif`;

function ensureJigFontAndTokensLoaded(): void {
  if (typeof document === 'undefined' || !document.head) return;
  const fontId = 'style-jig-top-font';
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
  }

  const styleId = 'style-jig-core-tokens';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      :root, [data-theme="light"] {
        --jig-bg: #f5f4f0;
        --jig-plate: #e7e5df;
        --jig-g1: #eceae4;
        --jig-g2: #dcd9d0;
        --jig-g3: #d0cdc3;
        --jig-g4: #c2beb3;
        --jig-fg: #18181b;
        --jig-muted: #575652;
        --jig-faint: #87857e;
        --jig-fill: rgba(24, 24, 27, 0.09);
        --jig-fill-drag: rgba(24, 24, 27, 0.16);
        --jig-shadow: 0 12px 30px rgba(24, 24, 27, 0.10);
        --jig-menu-border: rgba(24, 24, 27, 0.08);
        --jig-menu-shadow: 0 14px 32px rgba(24, 24, 27, 0.14);
      }
      [data-theme="dark"] {
        --jig-bg: #0c0c0b;
        --jig-plate: #151514;
        --jig-g1: #141413;
        --jig-g2: #1d1d1b;
        --jig-g3: #252522;
        --jig-g4: #2c2c29;
        --jig-fg: #ededec;
        --jig-muted: #858481;
        --jig-faint: #52524e;
        --jig-fill: rgba(237, 237, 236, 0.08);
        --jig-fill-drag: rgba(237, 237, 236, 0.15);
        --jig-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
        --jig-menu-border: rgba(255, 255, 255, 0.06);
        --jig-menu-shadow: 0 14px 32px rgba(0, 0, 0, 0.38);
      }
      .jig-stage-isolated {
        position: relative;
        z-index: 1 !important;
        isolation: isolate;
      }
      .with-floating-jig {
        padding-right: 296px;
      }
      @media (max-width: 820px) {
        .with-floating-jig {
          padding-right: 24px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function syncDomAttributes(
  styleId: StyleSlotId,
  uiLib: CanonicalUiLibraryId,
  motionLib: MotionLibrarySlotId,
  theme: JigThemeMode
): void {
  if (typeof document === 'undefined') return;
  const legacyLibAlias =
    uiLib === 'shadcn' ? 'shade' : uiLib === 'ease' ? 'affect' : 'fluid';
  const targets = [document.documentElement, document.body].filter(Boolean) as HTMLElement[];
  targets.forEach((el) => {
    el.setAttribute('data-style', styleId);
    el.setAttribute('data-skin', styleId);
    el.setAttribute('data-jig', styleId);
    el.setAttribute('data-style-folder', `styles/${styleId}`);
    el.setAttribute('data-ui-library', uiLib);
    el.setAttribute('data-library-alias', legacyLibAlias);
    el.setAttribute('data-motion-library', motionLib);
    el.setAttribute('data-theme', theme);
  });
}

function syncDomAutoAttribute(active: boolean, currentSlot: StyleSlotId): void {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-style-auto', active ? 'true' : 'false');
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(
      new CustomEvent('style-jig:auto', {
        detail: { active, slot: currentSlot },
      })
    );
  }
}

function resetParallaxContainersAndStyleDom(): void {
  if (typeof document === 'undefined') return;
  document
    .querySelectorAll<HTMLElement>(
      '.kp-scroll-canvas, [data-parallax-stage], #kpSoloScroller, #kpCombScroller'
    )
    .forEach((sc) => {
      sc.scrollTop = 0;
    });
  [document.documentElement, document.body].filter(Boolean).forEach((el) => {
    el!.setAttribute('data-style', 'clone');
    el!.setAttribute('data-skin', 'clone');
    el!.setAttribute('data-jig', 'clone');
    el!.setAttribute('data-style-folder', 'styles/clone');
  });
  document.querySelectorAll<HTMLElement>('[data-jig-pick], [data-style-jig-slot]').forEach((btn) => {
    const pick = btn.getAttribute('data-jig-pick') ?? btn.getAttribute('data-style-jig-slot');
    btn.classList.toggle('active', pick === 'clone');
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('style-jig:reset-style', { detail: { style: 'clone' } })
    );
  }
}

function broadcastImmersiveParams(
  mode: ImmersiveLayerMode,
  params: Record<string, string | number | boolean>,
  changedKey?: string,
  reset = false
): void {
  if (reset && mode === 'parallax') {
    resetParallaxContainersAndStyleDom();
  }
  if (typeof document !== 'undefined' && document.documentElement) {
    const prefix =
      mode === 'parallax'
        ? 'kp'
        : mode === 'shader'
          ? 'shd'
          : mode === 'immersive'
            ? 'imm'
            : '3d';
    Object.entries(params).forEach(([k, v]) => {
      document.documentElement.style.setProperty(`--jig-${prefix}-${toKebabCase(k)}`, String(v));
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('style-jig:immersive-change', {
        detail: {
          mode,
          key: changedKey ?? null,
          value: changedKey ? params[changedKey] : undefined,
          params: { ...params },
          reset,
        },
      })
    );

    if (typeof document !== 'undefined') {
      const iframes = Array.from(document.querySelectorAll('iframe'));
      iframes.forEach((frame) => {
        if (!frame.contentWindow) return;
        if (mode === '3d') {
          frame.contentWindow.postMessage(
            { type: 'CUBOID_PATCH', ...params, reset },
            '*'
          );
        } else if (mode === 'shader') {
          frame.contentWindow.postMessage(
            { type: 'SILK_SYNC', params: { ...params } },
            '*'
          );
        }
        frame.contentWindow.postMessage(
          { type: 'JIG_IMMERSIVE_PATCH', mode, params: { ...params }, reset },
          '*'
        );
      });
    }
  }
}

function isElementVisible(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 4 && rect.height > 4;
}

function isInsideJigChrome(el: Element | null): boolean {
  if (!el) return true;
  return Boolean(
    el.closest(
      '[data-style-jig], [data-style-jig-bottom], [data-immersive-jig], [data-auto-ignore], .top-jig-wrap, .bottom-motion-wrap, .dk-panel, .toc'
    )
  );
}

function resolveActiveStageRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const activeSlide = document.querySelector(
    '.slide.active, [data-jig-stage-active="true"]'
  );
  if (isElementVisible(activeSlide)) return activeSlide;
  const mainStage = document.querySelector(
    '[data-jig-stage], main.stage, main, #root'
  );
  if (isElementVisible(mainStage)) return mainStage;
  return document.body;
}

/**
 * Detects whether the active stage is any immersive view (`3d`, `parallax`, `shader`, `immersive`, or `assembled`)
 * where UI coding libraries (`shadcn`, `ease`, `fluid`) do not apply and should dim to 25% non-tappable gray.
 */
export function isImmersiveViewStage(root?: HTMLElement | null): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (
    document.body?.classList.contains('imm-exp-active') ||
    document.body?.getAttribute('data-imm-libs-disabled') === 'true' ||
    document.documentElement?.getAttribute('data-imm-libs-disabled') === 'true'
  ) {
    return true;
  }
  const stage = root ?? resolveActiveStageRoot();
  if (!stage) return false;
  if (
    stage.classList.contains('imm-exp-slide') ||
    stage.id === 'immAssembledStage' ||
    stage.getAttribute('data-imm-libs-disabled') === 'true'
  ) {
    return true;
  }
  const explicitEl = stage.matches('[data-immersive-layer]')
    ? stage
    : stage.querySelector('[data-immersive-layer]');
  if (explicitEl) {
    const attr = explicitEl.getAttribute('data-immersive-layer')?.trim().toLowerCase();
    if (attr && attr !== 'none' && attr !== 'off') return true;
  }
  return detectImmersiveLayer(stage) !== null;
}

/**
 * Automatic Immersive Layer Detector (`3d` | `parallax` | `shader` | `immersive` | `null`).
 * Checks explicit `data-immersive-layer` first, then runs zero-config WebGL / kinetic DOM heuristics,
 * while returning `null` on assembled/unified presentation stages so the inspector hides cleanly.
 */
export function detectImmersiveLayer(root?: HTMLElement | null): ImmersiveLayerMode | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  const stage = root ?? resolveActiveStageRoot();
  if (!stage) return null;

  if (
    stage.getAttribute('data-hide-immersive-jig') === 'true' ||
    stage.querySelector('[data-hide-immersive-jig="true"]')
  ) {
    return null;
  }

  const explicitEl = stage.matches('[data-immersive-layer]')
    ? stage
    : stage.querySelector('[data-immersive-layer]');
  if (explicitEl) {
    const attr = explicitEl.getAttribute('data-immersive-layer')?.trim().toLowerCase();
    if (attr === 'assembled' || attr === 'none' || attr === 'off') return null;
    if (attr === '3d' || attr === 'parallax' || attr === 'shader' || attr === 'immersive') {
      return attr;
    }
  }

  // Unified / assembled presentation stage (both 3D overlay + transparent kinetic scroller) -> hide jig
  if (
    stage.id === 'immAssembledStage' ||
    (stage.querySelector('iframe[name*="overlay"]') &&
      stage.querySelector('.transparent-over-shader'))
  ) {
    return null;
  }

  // 1. 3D scene heuristics
  const has3d = Array.from(
    stage.querySelectorAll(
      'canvas[data-engine*="three"], [data-r3f-canvas], [data-3d-scene], iframe[name*="cuboid"]:not([name*="overlay"]), iframe[data-immersive="3d"]'
    )
  ).some((el) => isElementVisible(el));
  if (has3d) return '3d';

  // 2. Shader backdrop heuristics
  const hasShader = Array.from(
    stage.querySelectorAll(
      'canvas.imm-shader-canvas, canvas[data-shader], [data-shader-uniforms], #immShaderViewStage'
    )
  ).some((el) => isElementVisible(el));
  if (hasShader) return 'shader';

  // 3. Kinetic parallax scroll heuristics
  const hasParallax = Array.from(
    stage.querySelectorAll(
      '.kp-scroll-canvas:not(.transparent-over-shader), [data-parallax-stage], [data-k-section]'
    )
  ).some((el) => isElementVisible(el));
  if (hasParallax) return 'parallax';

  return null;
}

/**
 * Unscripted View-Detecting Auto-Traveler (`motion-craft` ▶ Play Button).
 * Zero per-page scripts required: introspects the active view DOM underneath the jig,
 * smoothly travels down and up scrollable stages, sweeps synthetic pointer/3D raycast hover,
 * and exercises safe interactive stage controls.
 */
export function startUnscriptedAutoTraveler(options?: {
  actionIntervalMs?: number;
  scrollSpeedPx?: number;
  onStop?: () => void;
}): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined;
  }

  const actionIntervalMs = options?.actionIntervalMs ?? 1550;
  const scrollSpeedPx = options?.scrollSpeedPx ?? 2.1;

  let rafId = 0;
  let actionTimer = 0;
  let scrollDir = 1;
  let dwellUntil = 0;
  let actionCursor = 0;
  let lastHoveredEl: HTMLElement | null = null;

  const sampleInputs = [
    'Summarize weekly launch milestones & open approval gate',
    'Compare Q3 conversion telemetry across mobile and desktop',
    'Generate kinetic typography & shader tokens for review',
  ];

  const findScrollableStage = (stage: HTMLElement): HTMLElement | null => {
    const candidates = [
      stage,
      ...Array.from(stage.querySelectorAll<HTMLElement>('*')),
    ].filter((el) => {
      if (isInsideJigChrome(el) || !isElementVisible(el)) return false;
      if (el.scrollHeight <= el.clientHeight + 20) return false;
      const oy = window.getComputedStyle(el).overflowY;
      return oy === 'auto' || oy === 'scroll' || oy === 'overlay';
    });

    if (candidates.length > 0) {
      candidates.sort(
        (a, b) =>
          b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight
      );
      return candidates[0];
    }

    const docScroller = document.scrollingElement as HTMLElement | null;
    if (
      docScroller &&
      docScroller.scrollHeight > docScroller.clientHeight + 20
    ) {
      return docScroller;
    }
    return null;
  };

  const stepFrame = (now: number) => {
    const stage = resolveActiveStageRoot();
    if (stage) {
      const scroller = findScrollableStage(stage);
      if (scroller && now >= dwellUntil) {
        const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
        let nextTop = scroller.scrollTop + scrollDir * scrollSpeedPx;
        if (nextTop >= maxScroll) {
          nextTop = maxScroll;
          scrollDir = -1;
          dwellUntil = now + 520;
        } else if (nextTop <= 0) {
          nextTop = 0;
          scrollDir = 1;
          dwellUntil = now + 520;
        }
        scroller.scrollTop = nextTop;
      }

      // Sweep gentle synthetic pointer over 3D iframes / canvases so raycasts stay alive
      const t = now * 0.001;
      const nx = Math.sin(t * 0.85) * 0.55;
      const ny = Math.cos(t * 0.62) * 0.38;
      stage.querySelectorAll('iframe').forEach((frame) => {
        if (frame.contentWindow && isElementVisible(frame)) {
          frame.contentWindow.postMessage(
            { type: 'IMMERSIVE_POINTER', nx, ny },
            '*'
          );
        }
      });
    }
    rafId = window.requestAnimationFrame(stepFrame);
  };

  const runActionTick = () => {
    const stage = resolveActiveStageRoot();
    if (!stage) return;

    // 1. Hover kinetic/interactive target
    const hoverTargets = Array.from(
      stage.querySelectorAll<HTMLElement>(
        '[data-k-role], .wheel-card, .fl-item, button:not([disabled]), [role="tab"]'
      )
    ).filter((el) => !isInsideJigChrome(el) && isElementVisible(el));

    if (hoverTargets.length > 0) {
      if (lastHoveredEl && lastHoveredEl !== hoverTargets[actionCursor % hoverTargets.length]) {
        lastHoveredEl.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
      }
      const hTarget = hoverTargets[actionCursor % hoverTargets.length];
      const r = hTarget.getBoundingClientRect();
      hTarget.dispatchEvent(
        new PointerEvent('pointerenter', {
          bubbles: true,
          clientX: r.left + r.width * 0.5,
          clientY: r.top + r.height * 0.5,
        })
      );
      hTarget.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          clientX: r.left + r.width * 0.56,
          clientY: r.top + r.height * 0.44,
        })
      );
      lastHoveredEl = hTarget;
    }

    // 2. Discover safe clickable controls or prompt inputs inside the active stage
    const textInputs = Array.from(
      stage.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(
        'textarea:not([disabled]):not([readonly]), input[type="text"]:not([disabled]):not([readonly])'
      )
    ).filter((el) => !isInsideJigChrome(el) && isElementVisible(el));

    if (textInputs.length > 0 && actionCursor % 3 === 0) {
      const inp = textInputs[actionCursor % textInputs.length];
      const nextPrompt = sampleInputs[actionCursor % sampleInputs.length];
      const proto =
        inp instanceof HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(inp, nextPrompt);
      else inp.value = nextPrompt;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const safeButtons = Array.from(
      stage.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [role="tab"], [role="switch"], [data-c3d-shape], [data-fill-target], [data-tag-box], [data-cycle-values], [data-pop-toggle]'
      )
    ).filter((el) => {
      if (isInsideJigChrome(el) || !isElementVisible(el)) return false;
      if (el.getAttribute('type') === 'submit') return false;
      const label = (el.textContent || el.getAttribute('aria-label') || '').toLowerCase();
      if (/delete|remove|logout|sign out|destroy|reset/.test(label)) return false;
      return true;
    });

    if (safeButtons.length > 0) {
      const targetBtn = safeButtons[actionCursor % safeButtons.length];
      targetBtn.click();
    }

    actionCursor += 1;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && options?.onStop) {
      options.onStop();
    }
  };

  window.addEventListener('keydown', onKeyDown);
  rafId = window.requestAnimationFrame(stepFrame);
  actionTimer = window.setInterval(runActionTick, actionIntervalMs);

  return () => {
    window.cancelAnimationFrame(rafId);
    window.clearInterval(actionTimer);
    window.removeEventListener('keydown', onKeyDown);
    if (lastHoveredEl) {
      lastHoveredEl.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
      lastHoveredEl = null;
    }
    const stage = resolveActiveStageRoot();
    if (stage) {
      stage.querySelectorAll('iframe').forEach((frame) => {
        if (frame.contentWindow) {
          frame.contentWindow.postMessage({ type: 'IMMERSIVE_POINTER', leave: true }, '*');
        }
      });
    }
  };
}

function getMergedSchema(mode: ImmersiveLayerMode): ImmersiveSchemaSpec {
  const base = DEFAULT_IMMERSIVE_SCHEMAS[mode];
  const custom =
    typeof window !== 'undefined' && window.__JIG_IMMERSIVE_SCHEMA__
      ? window.__JIG_IMMERSIVE_SCHEMA__[mode]
      : undefined;
  if (!custom) return base;
  return {
    ...base,
    ...custom,
    defaults: { ...base.defaults, ...(custom.defaults ?? {}) },
  };
}

function buildInitialImmersiveState(): Record<
  ImmersiveLayerMode,
  Record<string, string | number | boolean>
> {
  return {
    '3d': { ...getMergedSchema('3d').defaults },
    parallax: { ...getMergedSchema('parallax').defaults },
    shader: { ...getMergedSchema('shader').defaults },
    immersive: { ...getMergedSchema('immersive').defaults },
  };
}

export interface StyleJigProviderProps {
  children: React.ReactNode;
  defaultStyle?: StyleSlotId;
  defaultUiLibrary?: UiLibrarySlotId;
  defaultMotionLibrary?: MotionLibrarySlotId;
  defaultTheme?: JigThemeMode;
  defaultAuto?: boolean;
  cycleStylesOnAuto?: boolean;
  autoStepMs?: number;
  onStyleChange?: (id: StyleSlotId) => void;
  onUiLibraryChange?: (id: CanonicalUiLibraryId) => void;
  onMotionLibraryChange?: (id: MotionLibrarySlotId) => void;
  onThemeChange?: (theme: JigThemeMode) => void;
  onAutoChange?: (active: boolean) => void;
}

export function StyleJigProvider({
  children,
  defaultStyle = 'clone',
  defaultUiLibrary = 'shadcn',
  defaultMotionLibrary = 'motion-craft',
  defaultTheme = 'light',
  defaultAuto = false,
  cycleStylesOnAuto = false,
  autoStepMs = 2600,
  onStyleChange,
  onUiLibraryChange,
  onMotionLibraryChange,
  onThemeChange,
  onAutoChange,
}: StyleJigProviderProps) {
  const [styleId, setStyleIdState] = useState<StyleSlotId>(() =>
    parseInitialStyleFromUrl(defaultStyle)
  );
  const [uiLibrary, setUiLibraryState] = useState<CanonicalUiLibraryId>(() =>
    parseInitialUiLibraryFromUrl(normalizeUiLibrarySlotId(defaultUiLibrary) ?? 'shadcn')
  );
  const [motionLibrary, setMotionLibraryState] = useState<MotionLibrarySlotId>(() =>
    parseInitialMotionLibraryFromUrl(defaultMotionLibrary)
  );
  const [theme, setThemeState] = useState<JigThemeMode>(() =>
    parseInitialThemeFromUrl(defaultTheme)
  );
  const [autoActive, setAutoActiveState] = useState<boolean>(() =>
    parseInitialAutoFromUrl(defaultAuto)
  );
  const [immersiveMode, setImmersiveMode] = useState<ImmersiveLayerMode | null>(null);
  const [immersiveParams, setImmersiveParams] = useState<
    Record<ImmersiveLayerMode, Record<string, string | number | boolean>>
  >(() => buildInitialImmersiveState());
  const [isJigHidden] = useState<boolean>(() => parseNoJigFromUrl());

  const setStyleId = useCallback(
    (next: StyleSlotId) => {
      setStyleIdState(next);
      syncDomAttributes(next, uiLibrary, motionLibrary, theme);
      if (onStyleChange) onStyleChange(next);
    },
    [uiLibrary, motionLibrary, theme, onStyleChange]
  );

  const setUiLibrary = useCallback(
    (nextRaw: UiLibrarySlotId) => {
      const next = normalizeUiLibrarySlotId(nextRaw) ?? 'shadcn';
      setUiLibraryState(next);
      syncDomAttributes(styleId, next, motionLibrary, theme);
      if (onUiLibraryChange) onUiLibraryChange(next);
    },
    [styleId, motionLibrary, theme, onUiLibraryChange]
  );

  const setMotionLibrary = useCallback(
    (next: MotionLibrarySlotId) => {
      setMotionLibraryState(next);
      syncDomAttributes(styleId, uiLibrary, next, theme);
      if (onMotionLibraryChange) onMotionLibraryChange(next);
    },
    [styleId, uiLibrary, theme, onMotionLibraryChange]
  );

  const setTheme = useCallback(
    (next: JigThemeMode) => {
      setThemeState(next);
      syncDomAttributes(styleId, uiLibrary, motionLibrary, next);
      if (onThemeChange) onThemeChange(next);
    },
    [styleId, uiLibrary, motionLibrary, onThemeChange]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const setAutoActive = useCallback(
    (next: boolean) => {
      setAutoActiveState(next);
      syncDomAutoAttribute(next, styleId);
      if (onAutoChange) onAutoChange(next);
    },
    [onAutoChange, styleId]
  );

  const toggleAuto = useCallback(() => {
    setAutoActive(!autoActive);
  }, [autoActive, setAutoActive]);

  const updateImmersiveParam = useCallback(
    (mode: ImmersiveLayerMode, key: string, value: string | number | boolean) => {
      setImmersiveParams((prev) => {
        const nextModeParams = { ...prev[mode], [key]: value };
        broadcastImmersiveParams(mode, nextModeParams, key, false);
        return { ...prev, [mode]: nextModeParams };
      });
    },
    []
  );

  const resetImmersiveMode = useCallback(
    (mode: ImmersiveLayerMode) => {
      const defaults = { ...getMergedSchema(mode).defaults };
      setImmersiveParams((prev) => ({ ...prev, [mode]: defaults }));
      if (mode === 'parallax') {
        setStyleId('clone');
      }
      broadcastImmersiveParams(mode, defaults, undefined, true);
    },
    [setStyleId]
  );

  useEffect(() => {
    ensureJigFontAndTokensLoaded();
    syncDomAttributes(styleId, uiLibrary, motionLibrary, theme);
  }, [styleId, uiLibrary, motionLibrary, theme]);

  // Automatic DOM observer for active immersive layer (`3d`, `parallax`, `shader`)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined' || isJigHidden) {
      return undefined;
    }
    const refreshLayer = () => {
      setImmersiveMode(detectImmersiveLayer());
    };
    refreshLayer();
    const observer = new MutationObserver(refreshLayer);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'data-immersive-layer', 'data-hide-immersive-jig', 'style'],
    });
    window.addEventListener('resize', refreshLayer);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', refreshLayer);
    };
  }, [isJigHidden]);

  // Unscripted view-detecting auto-traveler when `autoActive` is true
  useEffect(() => {
    if (!autoActive || typeof window === 'undefined') return undefined;
    const stopTraveler = startUnscriptedAutoTraveler({
      onStop: () => setAutoActive(false),
    });

    let timer: number | undefined;
    if (cycleStylesOnAuto) {
      let stepIndex = 0;
      timer = window.setInterval(() => {
        stepIndex += 1;
        setStyleIdState((prev) => {
          const idx = STYLE_JIG_SLOTS.indexOf(prev);
          const nextSlot = STYLE_JIG_SLOTS[(idx + 1) % STYLE_JIG_SLOTS.length];
          syncDomAttributes(nextSlot, uiLibrary, motionLibrary, theme);
          if (onStyleChange) onStyleChange(nextSlot);
          window.dispatchEvent(
            new CustomEvent('style-jig:auto-step', {
              detail: { step: stepIndex, slot: nextSlot },
            })
          );
          return nextSlot;
        });
      }, autoStepMs);
    }

    return () => {
      stopTraveler();
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [
    autoActive,
    cycleStylesOnAuto,
    autoStepMs,
    uiLibrary,
    motionLibrary,
    theme,
    onStyleChange,
    setAutoActive,
  ]);

  const value = useMemo<StyleJigContextValue>(
    () => ({
      styleId,
      setStyleId,
      uiLibrary,
      setUiLibrary,
      motionLibrary,
      setMotionLibrary,
      theme,
      setTheme,
      toggleTheme,
      autoActive,
      setAutoActive,
      toggleAuto,
      immersiveMode,
      immersiveParams,
      updateImmersiveParam,
      resetImmersiveMode,
      isJigHidden,
    }),
    [
      styleId,
      setStyleId,
      uiLibrary,
      setUiLibrary,
      motionLibrary,
      setMotionLibrary,
      theme,
      setTheme,
      toggleTheme,
      autoActive,
      setAutoActive,
      toggleAuto,
      immersiveMode,
      immersiveParams,
      updateImmersiveParam,
      resetImmersiveMode,
      isJigHidden,
    ]
  );

  return <StyleJigContext.Provider value={value}>{children}</StyleJigContext.Provider>;
}

export function useStyleJig(): StyleJigContextValue {
  const ctx = useContext(StyleJigContext);
  if (!ctx) {
    throw new Error('useStyleJig must be used within a <StyleJigProvider>.');
  }
  return ctx;
}

interface ScrubSliderRowProps {
  spec: ImmersiveSliderSpec;
  value: number;
  onChange: (key: string, next: number) => void;
}

function ScrubSliderRow({ spec, value, onChange }: ScrubSliderRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const pct = Math.max(0, Math.min(1, (value - spec.min) / (spec.max - spec.min))) * 100;

  const scrubFromClientX = (clientX: number) => {
    const el = rowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    const norm = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = spec.min + norm * (spec.max - spec.min);
    const rounded = spec.dec === 0 ? Math.round(raw) : parseFloat(raw.toFixed(spec.dec));
    onChange(spec.key, rounded);
  };

  return (
    <div
      ref={rowRef}
      role="slider"
      aria-label={spec.label}
      aria-valuemin={spec.min}
      aria-valuemax={spec.max}
      aria-valuenow={value}
      tabIndex={0}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        scrubFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        scrubFromClientX(e.clientX);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(e) => {
        const step = spec.dec === 0 ? 1 : Math.pow(10, -spec.dec);
        const mult = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          onChange(
            spec.key,
            Math.min(spec.max, parseFloat((value + step * mult).toFixed(spec.dec)))
          );
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          onChange(
            spec.key,
            Math.max(spec.min, parseFloat((value - step * mult).toFixed(spec.dec)))
          );
        }
      }}
      style={{
        position: 'relative',
        height: 34,
        borderRadius: 10,
        background: 'var(--jig-g2, #1d1d1b)',
        overflow: 'hidden',
        cursor: 'ew-resize',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: `${pct.toFixed(2)}%`,
          background: dragging
            ? 'var(--jig-fill-drag, rgba(237,237,236,0.15))'
            : 'var(--jig-fill, rgba(237,237,236,0.08))',
          pointerEvents: 'none',
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 12.5,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          color: 'var(--jig-muted, #858481)',
          textTransform: 'lowercase',
          pointerEvents: 'none',
        }}
      >
        {spec.label}
      </span>
      <span
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 12.5,
          fontWeight: 500,
          color: 'var(--jig-fg, #ededec)',
          fontVariantNumeric: 'tabular-nums',
          pointerEvents: 'none',
        }}
      >
        {Number(value).toFixed(spec.dec)}
      </span>
    </div>
  );
}

interface BackplateDropdownProps {
  title: string;
  spec: ImmersiveDropdownSpec;
  value: string;
  onChange: (key: string, next: string) => void;
}

/**
 * Custom Stylized Jig Backplate Dropdown (zero native `<select>`, zero dot indicators).
 * Pure floating popover (`position: absolute; top: calc(100% + 5px)`) over `.dk-panel { overflow: visible }`
 * so opening it never shifts sliders or panel height.
 */
function BackplateDropdown({ title, spec, value, onChange }: BackplateDropdownProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [trigHover, setTrigHover] = useState(false);
  const [hoveredOpt, setHoveredOpt] = useState<string | null>(null);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      data-jig-dropdown="true"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        flex: '1 1 auto',
        minWidth: 0,
      }}
    >
      <button
        type="button"
        aria-label={`${title} preset`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onPointerEnter={() => setTrigHover(true)}
        onPointerLeave={() => setTrigHover(false)}
        style={{
          width: '100%',
          height: 32,
          padding: '0 11px',
          borderRadius: 10,
          border: 'none',
          background:
            open || trigHover
              ? 'var(--jig-g3, #252522)'
              : 'var(--jig-g2, #1d1d1b)',
          color: 'var(--jig-fg, #ededec)',
          fontFamily: 'inherit',
          fontSize: 12.5,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          textTransform: 'lowercase',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            color: 'var(--jig-muted, #858481)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={`${title} options`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            zIndex: 60,
            background: 'var(--jig-plate, #151514)',
            border: '1px solid var(--jig-menu-border, rgba(255,255,255,0.06))',
            borderRadius: 12,
            padding: 5,
            boxShadow: 'var(--jig-menu-shadow, 0 14px 32px rgba(0,0,0,0.38))',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {spec.options.map((opt) => {
            const active = opt === value;
            const hovered = hoveredOpt === opt;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={active}
                onPointerEnter={() => setHoveredOpt(opt)}
                onPointerLeave={() => setHoveredOpt(null)}
                onClick={() => {
                  onChange(spec.key, opt);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  height: 29,
                  padding: '0 10px',
                  borderRadius: 8,
                  border: 'none',
                  background:
                    active || hovered
                      ? 'var(--jig-g2, #1d1d1b)'
                      : 'transparent',
                  color:
                    active || hovered
                      ? 'var(--jig-fg, #ededec)'
                      : 'var(--jig-muted, #858481)',
                  fontFamily: 'inherit',
                  fontSize: 12.5,
                  fontWeight: active ? 500 : 400,
                  letterSpacing: '-0.01em',
                  textTransform: 'lowercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease, color 0.12s ease',
                }}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface ImmersiveRightJigProps {
  mode?: ImmersiveLayerMode | null;
  placement?: ImmersivePlacement;
  schemaOverride?: ImmersiveSchemaSpec;
  hidden?: boolean;
}

/**
 * Floating Right / Lower-Right Touch-and-Feel Inspector Jig (`3d`, `parallax`, `shader`).
 * Always sits at `z-index: 2147483640` with matte `var(--jig-plate)` styling matching the Top/Bottom bars.
 */
export function ImmersiveRightJig({
  mode: controlledMode,
  placement = 'lower-right',
  schemaOverride,
  hidden = false,
}: ImmersiveRightJigProps) {
  const ctx = useContext(StyleJigContext);
  const [fallbackMode, setFallbackMode] = useState<ImmersiveLayerMode | null>(null);
  const [localParams, setLocalParams] = useState<
    Record<ImmersiveLayerMode, Record<string, string | number | boolean>>
  >(() => buildInitialImmersiveState());
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ctx || controlledMode !== undefined || typeof document === 'undefined') {
      return undefined;
    }
    ensureJigFontAndTokensLoaded();
    const refresh = () => setFallbackMode(detectImmersiveLayer());
    refresh();
    const obs = new MutationObserver(refresh);
    obs.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'data-immersive-layer', 'data-hide-immersive-jig'],
    });
    return () => obs.disconnect();
  }, [ctx, controlledMode]);

  const activeMode =
    controlledMode !== undefined ? controlledMode : ctx ? ctx.immersiveMode : fallbackMode;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.kp-scroll-canvas:not(.transparent-over-shader)').forEach((sc) => {
      sc.classList.toggle('with-floating-jig', Boolean(activeMode) && !collapsed);
    });
  }, [activeMode, collapsed]);

  if (hidden || !activeMode) return null;

  const schema = schemaOverride ?? getMergedSchema(activeMode);
  const params = ctx ? ctx.immersiveParams[activeMode] : localParams[activeMode];

  const handleParam = (key: string, val: string | number | boolean) => {
    if (ctx) {
      ctx.updateImmersiveParam(activeMode, key, val);
    } else {
      setLocalParams((prev) => {
        const next = { ...prev[activeMode], [key]: val };
        broadcastImmersiveParams(activeMode, next, key, false);
        return { ...prev, [activeMode]: next };
      });
    }
  };

  const handleReset = () => {
    if (ctx) {
      ctx.resetImmersiveMode(activeMode);
    } else {
      const defs = { ...schema.defaults };
      setLocalParams((prev) => ({ ...prev, [activeMode]: defs }));
      broadcastImmersiveParams(activeMode, defs, undefined, true);
    }
  };

  const handleCopy = () => {
    const out = schema.formatCopy ? schema.formatCopy(params) : JSON.stringify(params, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(out).catch(() => undefined);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const positionStyle: React.CSSProperties =
    placement === 'right-center'
      ? {
          position: 'fixed',
          right: 20,
          top: collapsed ? 68 : '50%',
          transform: collapsed ? 'none' : 'translateY(-50%)',
        }
      : {
          position: 'fixed',
          right: 20,
          bottom: 68,
        };

  return (
    <aside
      aria-label={`${schema.title} jig`}
      data-immersive-jig="true"
      data-immersive-mode={activeMode}
      style={{
        ...positionStyle,
        zIndex: JIG_TOP_Z_INDEX,
        width: collapsed ? 'auto' : 256,
        maxHeight: 'calc(100vh - 148px)',
        background: 'var(--jig-plate, #151514)',
        color: 'var(--jig-fg, #ededec)',
        borderRadius: collapsed ? 13 : 14,
        padding: collapsed ? '9px 16px' : '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: collapsed ? 0 : 14,
        overflow: 'visible',
        boxShadow: 'var(--jig-shadow, 0 14px 36px rgba(0,0,0,0.28))',
        fontFamily: JIG_FONT_STACK,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        {schema.dropdown && !collapsed ? (
          <BackplateDropdown
            title={schema.title}
            spec={schema.dropdown}
            value={String(params[schema.dropdown.key] ?? schema.dropdown.options[0])}
            onChange={(k, v) => handleParam(k, v)}
          />
        ) : (
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              textTransform: 'lowercase',
            }}
          >
            {schema.title}
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'inherit',
            fontSize: 12.5,
            color: 'var(--jig-faint, #52524e)',
            textTransform: 'lowercase',
            cursor: 'pointer',
            padding: '2px 0',
            flexShrink: 0,
          }}
        >
          {collapsed ? 'show' : 'hide'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {schema.words && (
              <div
                role="tablist"
                aria-label={`${schema.title} mode`}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '6px 13px',
                }}
              >
                {schema.words.options.map((opt) => {
                  const active = params[schema.words!.key] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleParam(schema.words!.key, opt)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontFamily: 'inherit',
                        fontSize: 13,
                        fontWeight: active ? 500 : 400,
                        letterSpacing: '-0.01em',
                        color: active
                          ? 'var(--jig-fg, #ededec)'
                          : 'var(--jig-faint, #52524e)',
                        textTransform: 'lowercase',
                        cursor: 'pointer',
                        padding: '2px 0',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {schema.sliders.map((sl) => (
                <ScrubSliderRow
                  key={sl.key}
                  spec={sl}
                  value={Number(params[sl.key] ?? schema.defaults[sl.key] ?? sl.min)}
                  onChange={handleParam}
                />
              ))}
            </div>

            {schema.toggles && schema.toggles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {schema.toggles.map((tg) => {
                  const checked = Boolean(params[tg.key]);
                  return (
                    <button
                      key={tg.key}
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      onClick={() => handleParam(tg.key, !checked)}
                      style={{
                        height: 34,
                        borderRadius: 10,
                        background: 'var(--jig-g2, #1d1d1b)',
                        border: 'none',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'inherit',
                        fontSize: 12.5,
                        color: 'var(--jig-muted, #858481)',
                        textTransform: 'lowercase',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{tg.label}</span>
                      <span
                        style={{
                          fontWeight: 500,
                          color: checked
                            ? 'var(--jig-fg, #ededec)'
                            : 'var(--jig-faint, #52524e)',
                        }}
                      >
                        {checked ? 'on' : 'off'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {schema.swatches && schema.swatches.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {schema.swatches.map((sw) => (
                  <label
                    key={sw.key}
                    style={{
                      height: 34,
                      borderRadius: 10,
                      background: 'var(--jig-g2, #1d1d1b)',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12.5,
                      color: 'var(--jig-muted, #858481)',
                      textTransform: 'lowercase',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{sw.label}</span>
                    <input
                      type="color"
                      value={String(params[sw.key] ?? '#242424')}
                      onChange={(e) => handleParam(sw.key, e.target.value)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        border: 'none',
                        padding: 0,
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 2,
            }}
          >
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'inherit',
                fontSize: 13,
                color: copied ? 'var(--jig-fg, #ededec)' : 'var(--jig-faint, #52524e)',
                textTransform: 'lowercase',
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              {copied ? 'copied' : 'copy'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'inherit',
                fontSize: 13,
                color: 'var(--jig-faint, #52524e)',
                textTransform: 'lowercase',
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              reset
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

export interface SafeZoneStageProps {
  children: React.ReactNode;
  mode?: 'component' | 'immersive';
  immersiveLayer?: ImmersiveLayerMode | 'assembled' | 'none';
  safePaddingPx?: number;
  fitToStage?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Isolated Stage Container (`z-index: 1; isolation: isolate`) + `>= 76px` Safe-Zone Centering
 * and proportional Fit-to-Stage scaling so tall components NEVER ride into the top or bottom jig.
 */
export function SafeZoneStage({
  children,
  mode = 'component',
  immersiveLayer,
  safePaddingPx = JIG_SAFE_ZONE_PADDING_PX,
  fitToStage = true,
  className = '',
  style,
}: SafeZoneStageProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (mode !== 'component' || !fitToStage) {
      setScale(1);
      return undefined;
    }
    const outer = outerRef.current;
    const target = targetRef.current;
    if (!outer || !target || typeof ResizeObserver === 'undefined') return undefined;

    const recompute = () => {
      const cs = window.getComputedStyle(outer);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const availW = Math.max(120, outer.clientWidth - padX);
      const availH = Math.max(120, outer.clientHeight - padY);
      const natW = target.offsetWidth || 1;
      const natH = target.offsetHeight || 1;
      const nextScale = Math.min(1, availW / natW, availH / natH);
      setScale(Number(nextScale.toFixed(4)));
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(outer);
    ro.observe(target);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [mode, fitToStage]);

  const effectivePad = Math.max(JIG_SAFE_ZONE_PADDING_PX, safePaddingPx);

  return (
    <div
      ref={outerRef}
      data-jig-stage="true"
      data-immersive-layer={immersiveLayer}
      className={`jig-stage-isolated ${className}`}
      style={{
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate',
        width: '100%',
        height: '100%',
        minHeight: mode === 'component' ? '100vh' : undefined,
        paddingTop: mode === 'component' ? effectivePad : 0,
        paddingBottom: mode === 'component' ? effectivePad : 0,
        paddingLeft: mode === 'component' ? 24 : 0,
        paddingRight: mode === 'component' ? 24 : 0,
        display: 'flex',
        alignItems: mode === 'component' ? 'center' : 'stretch',
        justifyContent: mode === 'component' ? 'center' : 'stretch',
        overflow: 'hidden',
        background: 'var(--jig-bg, transparent)',
        ...style,
      }}
    >
      {mode === 'component' && fitToStage ? (
        <div
          ref={targetRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            flexShrink: 0,
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export interface BottomMotionJigProps {
  activeMotionLibrary?: MotionLibrarySlotId;
  onMotionLibrarySelect?: (id: MotionLibrarySlotId) => void;
  motionLibraries?: ReadonlyArray<{ id: MotionLibrarySlotId; label: string }>;
  disableMotionLabel?: boolean;
  autoActive?: boolean;
  onAutoChange?: (active: boolean) => void;
  hidden?: boolean;
}

/**
 * Bottom-Centered `motion-craft` + Play/Stop (`▶` / `■`) Auto-Travel Plate (`z-index: 2147483640`).
 * On immersive views, `motion-craft` dims to `0.25` non-tappable gray while `▶` stays 100% active.
 */
export function BottomMotionJig({
  activeMotionLibrary: controlledMotion,
  onMotionLibrarySelect,
  motionLibraries = STYLE_JIG_MOTION_LIBRARIES,
  disableMotionLabel,
  autoActive: controlledAuto,
  onAutoChange,
  hidden = false,
}: BottomMotionJigProps) {
  const ctx = useContext(StyleJigContext);
  const [localMotion, setLocalMotion] = useState<MotionLibrarySlotId>(() =>
    parseInitialMotionLibraryFromUrl('motion-craft')
  );
  const [localAuto, setLocalAuto] = useState<boolean>(() => parseInitialAutoFromUrl(false));
  const [autoDetectedImmDisabled, setAutoDetectedImmDisabled] = useState<boolean>(false);

  const activeMotion = controlledMotion ?? ctx?.motionLibrary ?? localMotion;
  const isAuto = controlledAuto ?? ctx?.autoActive ?? localAuto;
  const motionDisabled =
    disableMotionLabel !== undefined
      ? disableMotionLabel
      : Boolean(ctx?.immersiveMode) || autoDetectedImmDisabled;

  useEffect(() => {
    if (disableMotionLabel !== undefined || typeof document === 'undefined') return undefined;
    const checkImm = () => setAutoDetectedImmDisabled(isImmersiveViewStage());
    checkImm();
    const obs = new MutationObserver(checkImm);
    obs.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'data-immersive-layer', 'data-imm-libs-disabled'],
    });
    return () => obs.disconnect();
  }, [disableMotionLabel]);

  // Standalone auto-traveler support when rendered outside StyleJigProvider
  useEffect(() => {
    if (ctx || !isAuto || typeof window === 'undefined') return undefined;
    return startUnscriptedAutoTraveler({
      onStop: () => {
        setLocalAuto(false);
        if (onAutoChange) onAutoChange(false);
      },
    });
  }, [ctx, isAuto, onAutoChange]);

  if (hidden) return null;

  const handleMotion = (id: MotionLibrarySlotId) => {
    if (ctx) ctx.setMotionLibrary(id);
    else setLocalMotion(id);
    if (onMotionLibrarySelect) onMotionLibrarySelect(id);
  };

  const handleToggleAuto = () => {
    const next = !isAuto;
    if (ctx) ctx.setAutoActive(next);
    else {
      setLocalAuto(next);
      syncDomAutoAttribute(next, 'clone');
    }
    if (onAutoChange) onAutoChange(next);
  };

  return (
    <div
      role="region"
      aria-label="Motion Library and Auto Traveler"
      data-style-jig-bottom="true"
      style={{
        position: 'fixed',
        bottom: 14,
        left: 0,
        right: 0,
        width: '100vw',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: JIG_TOP_Z_INDEX,
        pointerEvents: 'none',
        fontFamily: JIG_FONT_STACK,
        userSelect: 'none',
      }}
    >
      <div
        role="tablist"
        aria-label="Motion Library Bar"
        data-style-jig-plate="motion-libraries"
        data-libs-disabled={motionDisabled ? 'true' : 'false'}
        style={{
          pointerEvents: 'auto',
          background: 'var(--jig-plate, #151514)',
          borderRadius: 13,
          padding: '7px 10px 7px 14px',
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: 'var(--jig-shadow, 0 14px 36px rgba(0,0,0,0.28))',
        }}
      >
        {motionLibraries.map((m) => {
          const active = activeMotion === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={!motionDisabled && active}
              aria-disabled={motionDisabled}
              tabIndex={motionDisabled ? -1 : 0}
              data-motion-pick={m.id}
              data-style-jig-motion-lib={m.id}
              onClick={() => {
                if (!motionDisabled) handleMotion(m.id);
              }}
              style={
                motionDisabled
                  ? {
                      background: 'none',
                      border: 'none',
                      fontFamily: 'inherit',
                      fontSize: 12.5,
                      fontWeight: 400,
                      letterSpacing: '-0.01em',
                      color: 'var(--jig-muted, #858481)',
                      opacity: 0.25,
                      pointerEvents: 'none',
                      textTransform: 'lowercase',
                      cursor: 'default',
                      padding: '2px 0',
                    }
                  : {
                      background: 'none',
                      border: 'none',
                      fontFamily: 'inherit',
                      fontSize: 12.5,
                      fontWeight: active ? 500 : 400,
                      letterSpacing: '-0.01em',
                      color: active
                        ? 'var(--jig-fg, #ededec)'
                        : 'var(--jig-faint, #52524e)',
                      textTransform: 'lowercase',
                      cursor: 'pointer',
                      padding: '2px 0',
                    }
              }
            >
              {m.label}
            </button>
          );
        })}

        <button
          type="button"
          aria-label={isAuto ? 'Stop auto view travel' : 'Play auto view travel'}
          aria-pressed={isAuto}
          data-auto-toggle="true"
          data-style-jig-auto="true"
          onClick={handleToggleAuto}
          style={{
            width: 18,
            height: 18,
            padding: 0,
            margin: 0,
            borderRadius: 5,
            border: 'none',
            background: isAuto ? 'var(--jig-fg, #ededec)' : 'transparent',
            color: isAuto ? 'var(--jig-bg, #0c0c0b)' : 'var(--jig-muted, #858481)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isAuto ? (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <rect width="8" height="8" rx="1" />
            </svg>
          ) : (
            <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
              <path d="M1 1.2L8 5L1 8.8V1.2Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export interface TopStyleJigProps {
  activeStyle?: StyleSlotId;
  onStyleSelect?: (id: StyleSlotId) => void;
  activeUiLibrary?: UiLibrarySlotId;
  onUiLibrarySelect?: (id: CanonicalUiLibraryId) => void;
  activeMotionLibrary?: MotionLibrarySlotId;
  onMotionLibrarySelect?: (id: MotionLibrarySlotId) => void;
  theme?: JigThemeMode;
  onThemeChange?: (theme: JigThemeMode) => void;
  showLibraries?: boolean;
  disableLibraries?: boolean;
  showThemeToggle?: boolean;
  showMotionLibraries?: boolean;
  autoMountImmersiveJig?: boolean;
  immersivePlacement?: ImmersivePlacement;
  autoActive?: boolean;
  onAutoChange?: (active: boolean) => void;
  slots?: readonly StyleSlotId[];
  hidden?: boolean;
  className?: string;
}

/**
 * Always-On-Top Floating Style + `shadcn · ease · fluid` + `☾`/`☀` Theme Toggle Jig (`z-index: 2147483640`),
 * paired with the Bottom `motion-craft` + `▶` Auto-Traveler and Auto-Mounted Right Immersive Inspector.
 */
export function TopStyleJig({
  activeStyle: controlledStyle,
  onStyleSelect,
  activeUiLibrary: controlledUiLib,
  onUiLibrarySelect,
  activeMotionLibrary: controlledMotionLib,
  onMotionLibrarySelect,
  theme: controlledTheme,
  onThemeChange,
  showLibraries = true,
  disableLibraries,
  showThemeToggle = true,
  showMotionLibraries = true,
  autoMountImmersiveJig = true,
  immersivePlacement = 'lower-right',
  autoActive: controlledAuto,
  onAutoChange,
  slots = STYLE_JIG_SLOTS,
  hidden = false,
  className = '',
}: TopStyleJigProps) {
  const ctx = useContext(StyleJigContext);
  const [uncontrolledStyle, setUncontrolledStyle] = useState<StyleSlotId>(() =>
    parseInitialStyleFromUrl('clone')
  );
  const [uncontrolledUiLib, setUncontrolledUiLib] = useState<CanonicalUiLibraryId>(() =>
    parseInitialUiLibraryFromUrl('shadcn')
  );
  const [uncontrolledMotionLib, setUncontrolledMotionLib] = useState<MotionLibrarySlotId>(() =>
    parseInitialMotionLibraryFromUrl('motion-craft')
  );
  const [uncontrolledTheme, setUncontrolledTheme] = useState<JigThemeMode>(() =>
    parseInitialThemeFromUrl('light')
  );
  const [uncontrolledAuto, setUncontrolledAuto] = useState<boolean>(() =>
    parseInitialAutoFromUrl(false)
  );
  const [urlNoJig] = useState<boolean>(() => parseNoJigFromUrl());
  const [autoDetectedImmLibsDisabled, setAutoDetectedImmLibsDisabled] = useState<boolean>(false);

  const activeStyle = controlledStyle ?? ctx?.styleId ?? uncontrolledStyle;
  const activeUiLib =
    (controlledUiLib ? normalizeUiLibrarySlotId(controlledUiLib) : null) ??
    ctx?.uiLibrary ??
    uncontrolledUiLib;
  const activeMotionLib =
    controlledMotionLib ?? ctx?.motionLibrary ?? uncontrolledMotionLib;
  const activeTheme = controlledTheme ?? ctx?.theme ?? uncontrolledTheme;
  const isAuto = controlledAuto ?? ctx?.autoActive ?? uncontrolledAuto;
  const shouldHide = hidden || (ctx ? ctx.isJigHidden : urlNoJig);
  const libsDisabled =
    disableLibraries !== undefined
      ? disableLibraries
      : Boolean(ctx?.immersiveMode) || autoDetectedImmLibsDisabled;

  useEffect(() => {
    if (disableLibraries !== undefined || typeof document === 'undefined') return undefined;
    const checkImm = () => setAutoDetectedImmLibsDisabled(isImmersiveViewStage());
    checkImm();
    const obs = new MutationObserver(checkImm);
    obs.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'data-immersive-layer', 'data-imm-libs-disabled'],
    });
    return () => obs.disconnect();
  }, [disableLibraries]);

  useEffect(() => {
    ensureJigFontAndTokensLoaded();
    syncDomAttributes(activeStyle, activeUiLib, activeMotionLib, activeTheme);
  }, [activeStyle, activeUiLib, activeMotionLib, activeTheme]);

  useEffect(() => {
    if (ctx || typeof window === 'undefined') return undefined;
    const onResetStyle = () => {
      setUncontrolledStyle('clone');
      if (onStyleSelect) onStyleSelect('clone');
    };
    window.addEventListener('style-jig:reset-style', onResetStyle);
    return () => window.removeEventListener('style-jig:reset-style', onResetStyle);
  }, [ctx, onStyleSelect]);

  if (shouldHide) return null;

  const handleStyle = (slot: StyleSlotId) => {
    if (ctx) ctx.setStyleId(slot);
    else setUncontrolledStyle(slot);
    if (onStyleSelect) onStyleSelect(slot);
  };

  const handleUiLib = (id: CanonicalUiLibraryId) => {
    if (ctx) ctx.setUiLibrary(id);
    else setUncontrolledUiLib(id);
    if (onUiLibrarySelect) onUiLibrarySelect(id);
  };

  const handleToggleTheme = () => {
    const next: JigThemeMode = activeTheme === 'dark' ? 'light' : 'dark';
    if (ctx) ctx.setTheme(next);
    else setUncontrolledTheme(next);
    if (onThemeChange) onThemeChange(next);
  };

  const handleMotionLib = (id: MotionLibrarySlotId) => {
    if (!ctx) setUncontrolledMotionLib(id);
    if (onMotionLibrarySelect) onMotionLibrarySelect(id);
  };

  const handleAutoChange = (next: boolean) => {
    if (!ctx) setUncontrolledAuto(next);
    if (onAutoChange) onAutoChange(next);
  };

  const wordStyle = (active: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: 12.5,
    fontWeight: active ? 500 : 400,
    letterSpacing: '-0.01em',
    color: active ? 'var(--jig-fg, #ededec)' : 'var(--jig-faint, #52524e)',
    textTransform: 'lowercase',
    cursor: 'pointer',
    padding: '2px 0',
    whiteSpace: 'nowrap',
  });

  return (
    <>
      <header
        role="region"
        aria-label="style and library jig"
        data-style-jig="true"
        className={className}
        style={{
          position: 'fixed',
          top: 12,
          left: 0,
          right: 0,
          width: '100vw',
          padding: '0 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px 12px',
          zIndex: JIG_TOP_Z_INDEX,
          pointerEvents: 'none',
          fontFamily: JIG_FONT_STACK,
          userSelect: 'none',
        }}
      >
        {/* 1. Floating Style Plate (9 folder-backed slots: `clone` .. `retro`) */}
        <nav
          role="tablist"
          aria-label="style"
          data-style-jig-plate="style"
          style={{
            pointerEvents: 'auto',
            background: 'var(--jig-plate, #151514)',
            borderRadius: 13,
            padding: '9px 18px',
            display: 'inline-flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px 14px',
            boxShadow: 'var(--jig-shadow, 0 14px 36px rgba(0,0,0,0.28))',
          }}
        >
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              role="tab"
              aria-selected={activeStyle === slot}
              data-style-jig-slot={slot}
              data-style-folder={`styles/${slot}`}
              onClick={() => handleStyle(slot)}
              style={wordStyle(activeStyle === slot)}
            >
              {slot}
            </button>
          ))}
        </nav>

        {/* 2. Floating UI Libraries (`shadcn · ease · fluid`) + Dark/Light Toggle */}
        {showLibraries && (
          <nav
            role="tablist"
            aria-label="libraries"
            data-style-jig-plate="ui-libraries"
            data-libs-disabled={libsDisabled ? 'true' : 'false'}
            style={{
              pointerEvents: 'auto',
              background: 'var(--jig-plate, #151514)',
              borderRadius: 13,
              padding: '9px 18px',
              display: 'inline-flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px 14px',
              boxShadow: 'var(--jig-shadow, 0 14px 36px rgba(0,0,0,0.28))',
            }}
          >
            {STYLE_JIG_UI_LIBRARIES.map((lib) => (
              <button
                key={lib.id}
                type="button"
                role="tab"
                aria-selected={!libsDisabled && activeUiLib === lib.id}
                aria-disabled={libsDisabled}
                tabIndex={libsDisabled ? -1 : 0}
                data-style-jig-ui-lib={lib.id}
                onClick={() => {
                  if (!libsDisabled) handleUiLib(lib.id);
                }}
                style={
                  libsDisabled
                    ? {
                        ...wordStyle(false),
                        color: 'var(--jig-muted, #858481)',
                        fontWeight: 400,
                        opacity: 0.25,
                        pointerEvents: 'none',
                        cursor: 'default',
                      }
                    : wordStyle(activeUiLib === lib.id)
                }
              >
                {lib.label}
              </button>
            ))}

            {showThemeToggle && (
              <button
                type="button"
                aria-label={`Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} mode`}
                title="Toggle dark / light mode"
                data-style-jig-theme-toggle="true"
                onClick={handleToggleTheme}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--jig-muted, #858481)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginLeft: 2,
                }}
              >
                {activeTheme === 'dark' ? (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.55 1.55M17.52 17.52l1.55 1.55M2 12h2.2M19.8 12H22M4.93 19.07l1.55-1.55M17.52 6.48l1.55-1.55" />
                  </svg>
                )}
              </button>
            )}
          </nav>
        )}
      </header>

      {showMotionLibraries && (
        <BottomMotionJig
          activeMotionLibrary={activeMotionLib}
          onMotionLibrarySelect={handleMotionLib}
          disableMotionLabel={libsDisabled}
          autoActive={isAuto}
          onAutoChange={handleAutoChange}
        />
      )}

      {autoMountImmersiveJig && <ImmersiveRightJig placement={immersivePlacement} />}
    </>
  );
}

export default TopStyleJig;
