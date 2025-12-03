/**
 * Pure i18n utility functions - no React dependency
 * Can be used in any TypeScript/JavaScript environment
 */

import type { Language, Translations, AllTranslations } from '../i18n/types';
import { commonKo, commonEn } from '../i18n/translations/common';
import { qrKo, qrEn } from '../i18n/translations/qr';
import { metronomeKo, metronomeEn } from '../i18n/translations/metronome';
import { drumKo, drumEn } from '../i18n/translations/drum';
import { drumSynthKo, drumSynthEn } from '../i18n/translations/drum-synth';

/** All available languages */
export const LANGUAGES: readonly Language[] = ['ko', 'en'] as const;

/** Default language */
export const DEFAULT_LANGUAGE: Language = 'en';

/**
 * All translations organized by language
 */
export const allTranslations: AllTranslations = {
  ko: {
    common: commonKo,
    qr: qrKo,
    metronome: metronomeKo,
    drum: drumKo,
    drumSynth: drumSynthKo,
  },
  en: {
    common: commonEn,
    qr: qrEn,
    metronome: metronomeEn,
    drum: drumEn,
    drumSynth: drumSynthEn,
  },
};

/**
 * Get translations for a specific language
 * @param language - Target language
 * @returns Translations object
 */
export function getTranslations(language: Language): Translations {
  return allTranslations[language];
}

/**
 * Get the opposite language (for toggle)
 * @param language - Current language
 * @returns Opposite language
 */
export function getOppositeLanguage(language: Language): Language {
  return language === 'ko' ? 'en' : 'ko';
}

/**
 * Update HTML lang attribute
 * @param language - Language to set
 */
export function updateHtmlLang(language: Language): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
}

/**
 * Detect browser's preferred language
 * @returns Detected language or default
 */
export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const browserLang = navigator.language.toLowerCase();

  if (browserLang.startsWith('ko')) {
    return 'ko';
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Check if a language is valid
 * @param lang - Language to check
 * @returns true if valid language
 */
export function isValidLanguage(lang: unknown): lang is Language {
  return lang === 'ko' || lang === 'en';
}
