/**
 * Core Application Type Definitions
 */

// ============================================
// Language Types
// ============================================

export type Language = 'ko' | 'en';

// ============================================
// Theme Types
// ============================================

export type Theme = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

// ============================================
// App Types
// ============================================

/** Configuration for a single app/tool (bilingual) */
export interface AppConfig {
  readonly name: {
    readonly ko: string;
    readonly en: string;
  };
  readonly desc: {
    readonly ko: string;
    readonly en: string;
  };
  readonly icon: string;
  readonly size: number;
  readonly order?: number;
}

/** Full app object with computed properties */
export interface App extends AppConfig {
  readonly id: number;
  readonly url: string;
}

/** Immutable list of apps */
export type AppList = readonly App[];

// ============================================
// Sort Types
// ============================================

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'name-long'
  | 'name-short'
  | 'size-large'
  | 'size-small';

export interface SortOptionItem {
  readonly value: SortOption;
  readonly label: string;
}

// ============================================
// Translation Types
// ============================================

export interface CommonTranslation {
  footer: {
    privacy: string;
    terms: string;
    github: string;
    sitemap: string;
    opensource: string;
    toolsUsed: string;
  };
  home: {
    searchPlaceholder: string;
    searchAriaLabel: string;
    clearSearchAriaLabel: string;
    sortAriaLabel: string;
    noResults: string;
    sort: {
      nameAsc: string;
      nameDesc: string;
      nameLong: string;
      nameShort: string;
      sizeLarge: string;
      sizeSmall: string;
    };
  };
  common: {
    copyImage: string;
    copied: string;
    download: string;
    cancel: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    backButton: string;
  };
  share: {
    button: string;
    copyLink: string;
    copied: string;
    more: string;
    twitter: string;
    facebook: string;
    linkedin: string;
    whatsapp: string;
    telegram: string;
  };
  embed: {
    button: string;
    title: string;
    width: string;
    height: string;
    copyCode: string;
    copied: string;
  };
  errorBoundary: {
    title: string;
    message: string;
    retry: string;
  };
  pwa: {
    installTitle: string;
    installMessage: string;
    installButton: string;
    dismissButton: string;
    updateTitle: string;
    updateMessage: string;
    updateButton: string;
    offlineTitle: string;
    offlineMessage: string;
  };
}

export interface SEOTranslation {
  title: string;
  description: string;
  keywords: string;
}

export interface QRTranslation {
  title: string;
  subtitle: string;
  seo: SEOTranslation;
  urlInput: string;
  urlLabel: string;
  urlPlaceholder: string;
  urlHelp: string;
  errorCorrectionLevel: string;
  level: string;
  recoveryRate: string;
  recommendedEnvironment: string;
  description: string;
  onlineOnly: string;
  noDamageRisk: string;
  smallPrint: string;
  coatedSurface: string;
  generalPrint: string;
  paperLabel: string;
  outdoorLarge: string;
  highDamageRisk: string;
  errorLevelInfo: string;
  qrCodeColor: string;
  black: string;
  white: string;
  generatedQrCode: string;
  blackQrCode: string;
  whiteQrCode: string;
  enterUrl: string;
  transparentBg: string;
  footer: string;
  imageCopyNotSupported: string;
  imageOpenedInNewTab: string;
  imageDownloaded: string;
  imageCopyConfirm: string;
  popupBlocked: string;
  downloadFailed: string;
}

export interface MetronomeTranslation {
  title: string;
  description: string;
  seo: SEOTranslation;
  bpm: string;
  volume: string;
  timeSignature: string;
  timer: string;
  measure: string;
  elapsed: string;
  countdown: string;
  slow: string;
  fast: string;
  quiet: string;
  loud: string;
  minutes: string;
  seconds: string;
  start: string;
  stop: string;
  reset: string;
  perfectSync: string;
  syncDescription: string;
  precision: string;
}

export interface DrumTranslation {
  title: string;
  description: string;
  seo: SEOTranslation;
  play: string;
  pause: string;
  stop: string;
  clear: string;
  tempo: string;
  kick: string;
  snare: string;
  hihat: string;
  openhat: string;
  clap: string;
  step: string;
  volume: string;
  presets: string;
  presetTechno: string;
  presetHouse: string;
  presetTrap: string;
  presetBreakbeat: string;
  presetMinimal: string;
  exportMidi: string;
  exportSuccess: string;
  importMidi: string;
  importSuccess: string;
  importError: string;
  loop: string;
  loopOf: string;
  addLoop: string;
  removeLoop: string;
  copyLoop: string;
  moveLoopLeft: string;
  moveLoopRight: string;
  maxLoopsReached: string;
  clearAllLoops: string;
  loadedPreset: string;
  synthesisInfo: string;
}

export interface DrumSynthTranslation {
  title: string;
  description: string;
  seo: SEOTranslation;
  kick: string;
  snare: string;
  hihat: string;
  clap: string;
  tom: string;
  rim: string;
  play: string;
  reset: string;
  parameters: string;
  master: string;
  volume: string;
  pitchStart: string;
  pitchEnd: string;
  pitchDecay: string;
  ampDecay: string;
  click: string;
  drive: string;
  tone: string;
  toneFreq: string;
  toneDecay: string;
  noiseDecay: string;
  noiseFilter: string;
  toneMix: string;
  snappy: string;
  filterFreq: string;
  filterQ: string;
  decay: string;
  openness: string;
  pitch: string;
  ring: string;
  spread: string;
  reverb: string;
  body: string;
  attack: string;
  metallic: string;
  presets: string;
  presetClassic808: string;
  presetHardTechno: string;
  presetLofi: string;
  presetMinimal: string;
  presetAcoustic: string;
  quickPlay: string;
  export: string;
  exportWav: string;
  exportCompressed: string;
  exportAll: string;
  exporting: string;
  exportSuccess: string;
  exportError: string;
}

export interface Translations {
  common: CommonTranslation;
  qr: QRTranslation;
  metronome: MetronomeTranslation;
  drum: DrumTranslation;
  drumSynth: DrumSynthTranslation;
}

export interface AllTranslations {
  ko: Translations;
  en: Translations;
}

// ============================================
// Utility Types
// ============================================

export type Callback<T = void> = () => T;
export type AsyncCallback<T = void> = () => Promise<T>;
