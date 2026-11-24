import rawConfig from '../../jig.config.json';

export type ChromeMode = 'standard' | 'immersive' | 'app';

export type CloneProviderKind =
  | 'none'
  | 'manual'
  | 'screenshot'
  | 'html-file'
  | 'external-service';

export interface CloneSourceConfig {
  enabled: boolean;
  provider: CloneProviderKind;
  serviceName?: string;
  endpoint?: string;
  command?: string;
  notes?: string;
}

export interface JigConfigLibraryItem {
  id: string;
  label: string;
}

export interface JigConfigSlideItem {
  id: string;
  label: string;
  stageMode: 'component' | 'view';
  inspectorSchema?: '3d' | 'parallax' | 'shader' | 'menu' | 'cards' | 'bg';
}

export interface JigConfigDomainGroup {
  domain: string;
  label: string;
  defaultSlide: string;
  chromeMode?: ChromeMode;
  items: JigConfigSlideItem[];
}

export interface JigProjectConfig {
  projectName: string;
  defaultTheme: 'dark' | 'light';
  styles: string[];
  libraries: JigConfigLibraryItem[];
  cloneSource: CloneSourceConfig;
  domains: JigConfigDomainGroup[];
}

export const JIG_PROJECT_CONFIG: JigProjectConfig = rawConfig as JigProjectConfig;
