/**
 * Language Store
 * Manages i18n state with localStorage persistence
 */
import { writable, derived } from 'svelte/store';
import type { Language, Translations, AllTranslations } from '../i18n/types';
import { commonKo, commonEn } from '../i18n/translations/common';
import { qrKo, qrEn } from '../i18n/translations/qr';
import { metronomeKo, metronomeEn } from '../i18n/translations/metronome';
import { drumKo, drumEn } from '../i18n/translations/drum';
import { drumSynthKo, drumSynthEn } from '../i18n/translations/drum-synth';
import { getStorageItem, setStorageItem, createEnumValidator } from '../utils/storage';

/**
 * All translations organized by language
 */
const allTranslations: AllTranslations = {
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

const LANGUAGE_STORAGE_KEY = 'preferred-language';
const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
const isLanguage = createEnumValidator(SUPPORTED_LANGUAGES);

/**
 * Get initial language from localStorage or detect from browser
 */
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ko';

  // Try to get from storage with validation
  const stored = getStorageItem<Language>(LANGUAGE_STORAGE_KEY, null as unknown as Language, {
    validator: isLanguage,
  });

  if (stored) {
    return stored;
  }

  // Detect browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) {
    return 'en';
  }

  return 'ko';
}

// Create language store
export const language = writable<Language>(getInitialLanguage());

// Derived store for translations
export const t = derived(language, ($language) => allTranslations[$language]);

// Set language and persist
export function setLanguage(lang: Language): void {
  language.set(lang);
  setStorageItem(LANGUAGE_STORAGE_KEY, lang);
}

// Toggle between languages
export function toggleLanguage(): void {
  language.update((prev) => {
    const next = prev === 'ko' ? 'en' : 'ko';
    setStorageItem(LANGUAGE_STORAGE_KEY, next);
    return next;
  });
}

// Re-export types
export type { Language, Translations };
