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
}

/**
 * QR Generator specific translations
 */
export interface QRTranslation {
  title: string;
  subtitle: string;
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
  placeholder: string;
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
