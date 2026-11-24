import { DONOR_VARIANTS_BY_STYLE, type DonorVariantItem } from './donorThumbnails';
import {
  JIG_PROJECT_CONFIG,
  type ChromeMode,
  type CloneSourceConfig,
  type JigProjectConfig,
} from './jigConfig';

export type { ChromeMode, CloneSourceConfig, JigProjectConfig };

export const JIG_CONFIG: JigProjectConfig = JIG_PROJECT_CONFIG;
export const CLONE_SOURCE_CONFIG: CloneSourceConfig = JIG_PROJECT_CONFIG.cloneSource ?? {
  enabled: true,
  provider: 'manual',
};

export const RECORD_TAKE_SECONDS = 12;

export type StyleSlot = string;

export type LibSlot = string;

export type JigTheme = 'dark' | 'light';

export type InspectorSchemaKey = '3d' | 'parallax' | 'shader' | 'menu' | 'cards' | 'bg';

export type StageMode = 'component' | 'view';

export type HarnessSlideId = string;

export const DEFAULT_STYLE_SLOTS: readonly StyleSlot[] = [
  'clone',
  'clean',
  'grid',
  'editorial',
  'cinematic',
  'product',
  'brutal',
  'playful',
  'retro',
];

export const STYLE_SLOTS: readonly StyleSlot[] =
  JIG_PROJECT_CONFIG.styles && JIG_PROJECT_CONFIG.styles.length > 0
    ? JIG_PROJECT_CONFIG.styles
    : DEFAULT_STYLE_SLOTS;

export const DEFAULT_STYLE: StyleSlot = STYLE_SLOTS[0] ?? 'clone';

export const LIB_SLOTS: readonly { id: LibSlot; label: string }[] = Array.isArray(
  JIG_PROJECT_CONFIG.libraries,
)
  ? JIG_PROJECT_CONFIG.libraries
  : [
      { id: 'shadcn', label: 'shadcn' },
      { id: 'ease', label: 'ease' },
      { id: 'fluid', label: 'fluid' },
    ];

export const DEFAULT_LIB: LibSlot = LIB_SLOTS[0]?.id ?? 'none';

export type HarnessDomain = string;

export interface TocEntry {
  id: HarnessSlideId;
  label: string;
  groupHeader?: string;
  isSub: boolean;
  stageMode: StageMode;
  domain: HarnessDomain;
  chromeMode: ChromeMode;
  inspectorSchema?: InspectorSchemaKey;
}

export interface TocDomainGroup {
  domain: HarnessDomain;
  label: string;
  defaultSlide: HarnessSlideId;
  chromeMode: ChromeMode;
  items: readonly TocEntry[];
}

function inferChromeMode(domain: string, explicit?: ChromeMode): ChromeMode {
  if (explicit === 'immersive' || explicit === 'app' || explicit === 'standard') {
    return explicit;
  }
  const lower = domain.toLowerCase();
  if (lower === 'immersive' || lower === '3d' || lower === 'shader') return 'immersive';
  if (lower === 'app' || lower === 'mobile') return 'app';
  return 'standard';
}

export const TOC_DOMAIN_GROUPS: readonly TocDomainGroup[] = (
  JIG_PROJECT_CONFIG.domains && JIG_PROJECT_CONFIG.domains.length > 0
    ? JIG_PROJECT_CONFIG.domains
    : [
        {
          domain: 'fullstack',
          label: 'full stack',
          defaultSlide: 'component',
          chromeMode: 'standard' as ChromeMode,
          items: [
            { id: 'component', label: 'component', stageMode: 'component' as StageMode },
            { id: 'full-view', label: 'full view', stageMode: 'view' as StageMode },
          ],
        },
      ]
).map((group) => {
  const chromeMode = inferChromeMode(group.domain, group.chromeMode);
  const items: TocEntry[] = group.items.map((item, idx) => ({
    id: item.id,
    label: item.label,
    groupHeader: idx === 0 ? group.label : undefined,
    isSub: true,
    stageMode: item.stageMode,
    domain: group.domain,
    chromeMode,
    inspectorSchema: item.inspectorSchema,
  }));
  return {
    domain: group.domain,
    label: group.label,
    defaultSlide: group.defaultSlide || items[0]?.id || 'component',
    chromeMode,
    items,
  };
});

export const TOC_ENTRIES: readonly TocEntry[] = TOC_DOMAIN_GROUPS.flatMap(
  (group) => group.items,
);

export interface StyleTokenSpec {
  id: StyleSlot;
  radiusPx: number;
  borderWidthPx: number;
  borderStyle: 'solid' | 'dashed';
  accentDark: string;
  accentLight: string;
  bgDark: string;
  bgLight: string;
  typography: string;
}

export const STYLE_TOKEN_MAP: Record<StyleSlot, StyleTokenSpec> = {
  clone: {
    id: 'clone',
    radiusPx: 16,
    borderWidthPx: 1,
    borderStyle: 'solid',
    accentDark: '#ededec',
    accentLight: '#18181b',
    bgDark: '#000000',
    bgLight: '#faf9f6',
    typography: 'Instrument Sans + Hanken Grotesk + JetBrains Mono',
  },
  clean: {
    id: 'clean',
    radiusPx: 22,
    borderWidthPx: 1,
    borderStyle: 'solid',
    accentDark: '#10b981',
    accentLight: '#059669',
    bgDark: '#09090b',
    bgLight: '#faf9f6',
    typography: 'Schibsted Grotesk + Instrument Sans + JetBrains Mono',
  },
  grid: {
    id: 'grid',
    radiusPx: 8,
    borderWidthPx: 1,
    borderStyle: 'dashed',
    accentDark: '#14b8a6',
    accentLight: '#0f766e',
    bgDark: '#0c0d0e',
    bgLight: '#f4f3ef',
    typography: 'Schibsted Grotesk + IBM Plex Mono',
  },
  editorial: {
    id: 'editorial',
    radiusPx: 10,
    borderWidthPx: 1,
    borderStyle: 'solid',
    accentDark: '#d97706',
    accentLight: '#b45309',
    bgDark: '#12100e',
    bgLight: '#fbf9f5',
    typography: 'Newsreader + Fraunces + Hanken Grotesk',
  },
  cinematic: {
    id: 'cinematic',
    radiusPx: 20,
    borderWidthPx: 1,
    borderStyle: 'solid',
    accentDark: '#f59e0b',
    accentLight: '#d97706',
    bgDark: '#000000',
    bgLight: '#f5f3ee',
    typography: 'Syne + Instrument Sans + JetBrains Mono',
  },
  product: {
    id: 'product',
    radiusPx: 16,
    borderWidthPx: 1,
    borderStyle: 'solid',
    accentDark: '#10b981',
    accentLight: '#047857',
    bgDark: '#0b0c0c',
    bgLight: '#ffffff',
    typography: 'Bricolage Grotesque + Figtree + JetBrains Mono',
  },
  brutal: {
    id: 'brutal',
    radiusPx: 0,
    borderWidthPx: 2,
    borderStyle: 'solid',
    accentDark: '#84cc16',
    accentLight: '#4d7c0f',
    bgDark: '#10120e',
    bgLight: '#f3f5ec',
    typography: 'Archivo + Space Mono',
  },
  playful: {
    id: 'playful',
    radiusPx: 26,
    borderWidthPx: 1.5,
    borderStyle: 'solid',
    accentDark: '#f97316',
    accentLight: '#ea580c',
    bgDark: '#13110e',
    bgLight: '#fffdf9',
    typography: 'Outfit + Onest + JetBrains Mono',
  },
  retro: {
    id: 'retro',
    radiusPx: 0,
    borderWidthPx: 1.5,
    borderStyle: 'solid',
    accentDark: '#f59e0b',
    accentLight: '#b45309',
    bgDark: '#090d0a',
    bgLight: '#efe9dc',
    typography: 'IBM Plex Mono + Space Mono',
  },
};

export function getStyleTokenSpec(style: StyleSlot): StyleTokenSpec {
  const existing = STYLE_TOKEN_MAP[style];
  if (existing) return existing;
  return {
    id: style,
    radiusPx: 14,
    borderWidthPx: 1,
    borderStyle: 'solid',
    accentDark: '#10b981',
    accentLight: '#0f766e',
    bgDark: '#0b0c0c',
    bgLight: '#faf9f6',
    typography: 'Instrument Sans + Hanken Grotesk + JetBrains Mono',
  };
}

export function getDonorVariantsForStyle(style: StyleSlot): DonorVariantItem[] {
  return DONOR_VARIANTS_BY_STYLE[style] ?? [];
}

export interface ScrubSliderSpec {
  key: string;
  label: string;
  min: number;
  max: number;
  decimals: number;
}

export interface TabMenuSpec {
  key: string;
  primary?: boolean;
  options: string[];
}

export interface InspectorSchemaDef {
  key: InspectorSchemaKey;
  title: string;
  dropdown?: {
    key: string;
    options: string[];
  };
  wordStrip?: {
    key: string;
    options: string[];
  };
  tabMenus?: TabMenuSpec[];
  sliders: ScrubSliderSpec[];
  toggle?: {
    key: string;
    label: string;
  };
  swatch?: {
    key: string;
    label: string;
  };
  defaults: Record<string, string | number | boolean>;
}

export const INSPECTOR_SCHEMA_DEFINITIONS: Record<InspectorSchemaKey, InspectorSchemaDef> = {
  '3d': {
    key: '3d',
    title: '3d',
    wordStrip: {
      key: 'shapeType',
      options: ['chain', 'helix', 'ring', 'wave', 'arch'],
    },
    sliders: [
      { key: 'count', label: 'count', min: 3, max: 14, decimals: 0 },
      { key: 'gap', label: 'gap', min: 0, max: 0.6, decimals: 2 },
      { key: 'scrollSpeed', label: 'scroll', min: 0, max: 2.0, decimals: 2 },
      { key: 'rotSpeed', label: 'spin', min: 0, max: 2.0, decimals: 2 },
      { key: 'camZ', label: 'depth', min: 4.0, max: 10.0, decimals: 1 },
    ],
    swatch: { key: 'cuboidColor', label: 'surface' },
    defaults: {
      shapeType: 'wave',
      count: 8,
      gap: 0.01,
      scrollSpeed: 0.6,
      rotSpeed: 0.57,
      camZ: 6.2,
      cuboidColor: '#242424',
    },
  },
  parallax: {
    key: 'parallax',
    title: 'parallax',
    sliders: [
      { key: 'headSpeed', label: 'head speed', min: -0.6, max: 0.6, decimals: 2 },
      { key: 'lineSpread', label: 'line spread', min: 0, max: 56, decimals: 0 },
      { key: 'bodySpeed', label: 'body speed', min: -0.5, max: 0.5, decimals: 2 },
      { key: 'btnSpeed', label: 'btn speed', min: -0.5, max: 0.6, decimals: 2 },
      { key: 'oscAmp', label: 'scroll wave', min: 0, max: 24, decimals: 1 },
      { key: 'hoverLift', label: 'hover lift', min: -18, max: 0, decimals: 1 },
    ],
    toggle: { key: 'autoScroll', label: 'auto-scroll' },
    defaults: {
      headSpeed: -0.09,
      lineSpread: 12,
      bodySpeed: -0.04,
      btnSpeed: 0.08,
      oscAmp: 0,
      hoverLift: -4,
      autoScroll: false,
    },
  },
  shader: {
    key: 'shader',
    title: 'shader',
    dropdown: {
      key: 'shaderPreset',
      options: ['silk blend', 'mesh drift', 'ink ridges', 'gradient mesh', 'ascii art'],
    },
    sliders: [
      { key: 'angle', label: 'angle', min: 0, max: 360, decimals: 0 },
      { key: 'wave', label: 'wave', min: 0, max: 40, decimals: 0 },
      { key: 'distortion', label: 'distortion', min: 0, max: 80, decimals: 0 },
      { key: 'soften', label: 'soften', min: 0, max: 100, decimals: 0 },
      { key: 'vignette', label: 'vignette', min: 0, max: 100, decimals: 0 },
      { key: 'grain', label: 'grain', min: 0, max: 150, decimals: 0 },
    ],
    defaults: {
      shaderPreset: 'silk blend',
      angle: 170,
      wave: 12,
      distortion: 28,
      soften: 58,
      vignette: 48,
      grain: 100,
    },
  },
  menu: {
    key: 'menu',
    title: 'menu',
    tabMenus: [
      { key: 'dockLayout', primary: true, options: ['floating', 'bar', 'circle'] },
      { key: 'glassStyle', options: ['liquid', 'sheen'] },
      { key: 'glassMode', options: ['regular', 'clear', 'tinted'] },
    ],
    sliders: [
      { key: 'roundness', label: 'roundness', min: 0, max: 36, decimals: 0 },
      { key: 'blur', label: 'blur', min: 0, max: 40, decimals: 0 },
      { key: 'frost', label: 'frost', min: 0, max: 100, decimals: 0 },
      { key: 'refraction', label: 'refraction', min: 0, max: 100, decimals: 0 },
      { key: 'specular', label: 'specular', min: 0, max: 100, decimals: 0 },
    ],
    defaults: {
      dockLayout: 'floating',
      glassStyle: 'liquid',
      glassMode: 'regular',
      roundness: 24,
      blur: 20,
      frost: 38,
      refraction: 52,
      specular: 64,
    },
  },
  cards: {
    key: 'cards',
    title: 'cards',
    dropdown: {
      key: 'cardTemplate',
      options: [
        'glass feed',
        'vinyl crate',
        "rubik's cube",
        'glass carousel',
        'arc wheel',
        'spiral portal',
      ],
    },
    tabMenus: [{ key: 'faceMode', options: ['images', 'gray'] }],
    sliders: [
      { key: 'count', label: 'count', min: 3, max: 12, decimals: 0 },
      { key: 'size', label: 'size', min: 0.6, max: 1.4, decimals: 2 },
      { key: 'corner', label: 'corner', min: 0, max: 32, decimals: 0 },
      { key: 'speed', label: 'speed', min: 0, max: 2.0, decimals: 2 },
      { key: 'warp', label: 'warp', min: 0, max: 100, decimals: 0 },
    ],
    defaults: {
      cardTemplate: 'glass feed',
      faceMode: 'images',
      count: 6,
      size: 1.0,
      corner: 18,
      speed: 0.65,
      warp: 24,
    },
  },
  bg: {
    key: 'bg',
    title: 'background',
    dropdown: {
      key: 'bgPreset',
      options: ['mesh drift', 'silk blend', 'ink ridges', 'gradient mesh', 'ascii art'],
    },
    sliders: [
      { key: 'angle', label: 'angle', min: 0, max: 360, decimals: 0 },
      { key: 'wave', label: 'wave', min: 0, max: 40, decimals: 0 },
      { key: 'distortion', label: 'distortion', min: 0, max: 80, decimals: 0 },
      { key: 'soften', label: 'soften', min: 0, max: 100, decimals: 0 },
      { key: 'vignette', label: 'vignette', min: 0, max: 100, decimals: 0 },
      { key: 'grain', label: 'grain', min: 0, max: 150, decimals: 0 },
    ],
    defaults: {
      bgPreset: 'mesh drift',
      angle: 145,
      wave: 16,
      distortion: 32,
      soften: 62,
      vignette: 40,
      grain: 85,
    },
  },
};

export type AllInspectorValues = Record<
  InspectorSchemaKey,
  Record<string, string | number | boolean>
>;

export function createInitialInspectorValues(): AllInspectorValues {
  return {
    '3d': { ...INSPECTOR_SCHEMA_DEFINITIONS['3d'].defaults },
    parallax: { ...INSPECTOR_SCHEMA_DEFINITIONS.parallax.defaults },
    shader: { ...INSPECTOR_SCHEMA_DEFINITIONS.shader.defaults },
    menu: { ...INSPECTOR_SCHEMA_DEFINITIONS.menu.defaults },
    cards: { ...INSPECTOR_SCHEMA_DEFINITIONS.cards.defaults },
    bg: { ...INSPECTOR_SCHEMA_DEFINITIONS.bg.defaults },
  };
}

export interface RecordingOutputSummary {
  durationSec: number;
  formattedDuration: string;
  viewsVisited: number;
  visitedSlides: string[];
  stylesVisited: StyleSlot[];
  themesVisited: JigTheme[];
  safeZoneOverlaps: number;
  completedAtIso: string;
}

export interface JigAgentState {
  activeSlide: HarnessSlideId;
  activeStyle: StyleSlot;
  activeLib: LibSlot;
  jigTheme: JigTheme;
  appLibsDisabled: boolean;
  immLibsDisabled: boolean;
  inspectorCollapsed: boolean;
  inspectorSchema: InspectorSchemaKey | null;
  inspectorValues: AllInspectorValues;
  activeVariant: number;
  isPlaying: boolean;
  isRecording: boolean;
  recordingElapsedSec: number;
  recordingOutput: RecordingOutputSummary | null;
  travelProgress: number;
  stageMode: StageMode;
}

export interface JigAgentAPI {
  state: JigAgentState;
  config: JigProjectConfig;
  setSlide: (slide: HarnessSlideId) => void;
  setStyle: (style: StyleSlot) => void;
  setLib: (lib: LibSlot) => void;
  setTheme: (theme: JigTheme) => void;
  toggleTheme: () => void;
  syncAppLibraryLockState: (locked: boolean) => void;
  setInspectorCollapsed: (collapsed: boolean) => void;
  setInspectorValue: (
    key: string,
    value: string | number | boolean,
    schema?: InspectorSchemaKey,
  ) => void;
  resetInspectorSchema: (schema?: InspectorSchemaKey) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  isRecording: () => boolean;
  startRecording: () => void;
  stopRecording: () => void;
  toggleRecording: () => void;
  clearRecordingOutput: () => void;
  setStageMode: (mode: StageMode) => void;
  getStandaloneUrl: () => string;
  onStyleChange?: (style: StyleSlot, prevStyle: StyleSlot) => void;
  onLibChange?: (lib: LibSlot, prevLib: LibSlot) => void;
  onInspectorChange?: (
    key: string,
    value: string | number | boolean,
    schema: InspectorSchemaKey,
    allValues: Record<string, string | number | boolean>,
  ) => void;
  onVariantChange?: (variant: number, prevVariant: number, style: StyleSlot) => void;
}

export interface VariantNotchesAPI {
  state: {
    activeVariant: number;
    count: number;
    activeStyle: StyleSlot;
  };
  setVariant: (variant: number) => void;
  next: () => void;
  prev: () => void;
}

export interface CopiedJigPromptBundle {
  promptText: string;
  standaloneHtml: string;
  capturedFromLiveDom: boolean;
  capturedElementCount: number;
  matchedRuleCount: number;
  styleImageDataUri: string;
  styleImagePath: string;
  styleImageLabel: string;
  key: string;
  richHtmlCopied: boolean;
}

declare global {
  interface Window {
    JigAgent: JigAgentAPI;
    VariantNotches: VariantNotchesAPI;
    __STANDALONE_DOMAIN__?: string;
    __LAST_COPIED_JIG_PROMPT__?: string;
    __LAST_COPIED_JIG_PROMPT_BUNDLE__?: CopiedJigPromptBundle;
  }
}
