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
    about: string;
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
  // 404 Not Found
  notFound: {
    title: string;
    message: string;
    backToHome: string;
  };
  // Language Toggle
  languageToggle: {
    switchToEnglish: string;
    switchToKorean: string;
  };
  // Accessibility
  a11y: {
    availableTools: string;
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
 * All translations combined
 */
export interface Translations {
  common: CommonTranslation;
  qr: QRTranslation;
  metronome: MetronomeTranslation;
}

/**
 * Translation object for each language
 */
export interface AllTranslations {
  ko: Translations;
  en: Translations;
}
