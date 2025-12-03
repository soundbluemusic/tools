/**
 * i18n module - Vanilla TypeScript
 * Types and translations for internationalization
 */

// Types
export type {
  Language,
  Translations,
  CommonTranslation,
  QRTranslation,
  DrumTranslation,
  DrumSynthTranslation,
  MetronomeTranslation,
  AllTranslations,
} from './types';

// Translations
export * from './translations/common';
export * from './translations/metronome';
export * from './translations/drum';
export * from './translations/drum-synth';
export * from './translations/qr';
