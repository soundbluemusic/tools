/**
 * Supported languages
 */
export type Language = 'ko' | 'en';

/**
 * Common translations used across the site
 */
export interface CommonTranslation {
  // Footer
  footer: {
    privacy: string;
    terms: string;
    github: string;
    sitemap: string;
    opensource: string;
    toolsUsed: string;
  };
  // Home page
  home: {
    searchPlaceholder: string;
    searchAriaLabel: string;
    clearSearchAriaLabel: string;
    sortAriaLabel: string;
    noResults: string;
    // Sort options
    sort: {
      nameAsc: string;
      nameDesc: string;
      nameLong: string;
      nameShort: string;
      sizeLarge: string;
      sizeSmall: string;
    };
  };
  // Common UI elements
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
  // Share functionality
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
  // Embed functionality
  embed: {
    button: string;
    title: string;
    width: string;
    height: string;
    copyCode: string;
    copied: string;
  };
  // Error boundary
  errorBoundary: {
    title: string;
    message: string;
    retry: string;
  };
  // PWA
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

/**
 * SEO specific translations for each page
 */
export interface SEOTranslation {
  title: string;
  description: string;
  keywords: string;
}

/**
 * QR Generator specific translations
 */
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
  // Alert messages
  imageCopyNotSupported: string;
  imageOpenedInNewTab: string;
  imageDownloaded: string;
  imageCopyConfirm: string;
  popupBlocked: string;
  downloadFailed: string;
}

/**
 * Metronome specific translations
 */
export interface MetronomeTranslation {
  title: string;
  description: string;
  seo: SEOTranslation;
  // Controls
  bpm: string;
  volume: string;
  timeSignature: string;
  timer: string;
  // Info
  measure: string;
  elapsed: string;
  countdown: string;
  // Slider labels
  slow: string;
  fast: string;
  quiet: string;
  loud: string;
  // Time units
  minutes: string;
  seconds: string;
  // Actions
  start: string;
  stop: string;
  reset: string;
  // Status
  perfectSync: string;
  syncDescription: string;
  precision: string;
}

/**
 * Drum Machine specific translations
 */
export interface DrumTranslation {
  title: string;
  description: string;
  seo: SEOTranslation;
  // Transport
  play: string;
  pause: string;
  stop: string;
  clear: string;
  tempo: string;
  // Instruments
  kick: string;
  snare: string;
  hihat: string;
  openhat: string;
  clap: string;
  // UI
  step: string;
  volume: string;
  presets: string;
  presetTechno: string;
  presetHouse: string;
  presetTrap: string;
  presetBreakbeat: string;
  presetMinimal: string;
  // Export/Import
  exportMidi: string;
  exportSuccess: string;
  importMidi: string;
  importSuccess: string;
  importError: string;
  // Loop controls
  loop: string;
  loopOf: string;
  addLoop: string;
  removeLoop: string;
  copyLoop: string;
  moveLoopLeft: string;
  moveLoopRight: string;
  maxLoopsReached: string;
  clearAllLoops: string;
  // Status
  loadedPreset: string;
  // Synthesis info
  synthesisInfo: string;
}

/**
 * Drum Synth specific translations
 */
export interface DrumSynthTranslation {
  title: string;
  description: string;
  seo: SEOTranslation;
  // Drum types
  kick: string;
  snare: string;
  hihat: string;
  clap: string;
  tom: string;
  rim: string;
  // Actions
  play: string;
  reset: string;
  // Parameters
  parameters: string;
  master: string;
  volume: string;
  // Kick parameters
  pitchStart: string;
  pitchEnd: string;
  pitchDecay: string;
  ampDecay: string;
  click: string;
  drive: string;
  tone: string;
  // Snare parameters
  toneFreq: string;
  toneDecay: string;
  noiseDecay: string;
  noiseFilter: string;
  toneMix: string;
  snappy: string;
  // Hihat parameters
  filterFreq: string;
  filterQ: string;
  decay: string;
  openness: string;
  pitch: string;
  ring: string;
  // Clap parameters
  spread: string;
  reverb: string;
  // Tom parameters
  body: string;
  attack: string;
  // Rim parameters
  metallic: string;
  // Presets
  presets: string;
  presetClassic808: string;
  presetHardTechno: string;
  presetLofi: string;
  presetMinimal: string;
  presetAcoustic: string;
  // Quick play
  quickPlay: string;
}

/**
 * All translations combined
 */
export interface Translations {
  common: CommonTranslation;
  qr: QRTranslation;
  metronome: MetronomeTranslation;
  drum: DrumTranslation;
  drumSynth: DrumSynthTranslation;
}

/**
 * Translation object for each language
 */
export interface AllTranslations {
  ko: Translations;
  en: Translations;
}
