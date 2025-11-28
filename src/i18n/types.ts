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
    terms: string;
    opensource: string;
    toolsUsed: string;
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
 * All translations combined
 */
export interface Translations {
  common: CommonTranslation;
  qr: QRTranslation;
}

/**
 * Translation object for each language
 */
export interface AllTranslations {
  ko: Translations;
  en: Translations;
}
