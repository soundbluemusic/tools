import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Language, Translations, AllTranslations } from './types';
import { commonKo, commonEn } from './translations/common';
import { qrKo, qrEn } from './translations/qr';
import { metronomeKo, metronomeEn } from './translations/metronome';
import { getStorageItem, setStorageItem, createEnumValidator } from '../utils/storage';

/**
 * All translations organized by language
 */
const allTranslations: AllTranslations = {
  ko: {
    common: commonKo,
    qr: qrKo,
    metronome: metronomeKo,
  },
  en: {
    common: commonEn,
    qr: qrEn,
    metronome: metronomeEn,
  },
};

/**
 * Language context value type
 */
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

/**
 * Language context with default values
 */
const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/**
 * Local storage key for language preference
 */
const LANGUAGE_STORAGE_KEY = 'preferred-language';

/**
 * Supported languages for validation
 */
const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;

/**
 * Type-safe validator for language values
 */
const isLanguage = createEnumValidator(SUPPORTED_LANGUAGES);

/**
 * Get initial language from localStorage or detect from browser
 */
const getInitialLanguage = (): Language => {
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
};

/**
 * Language Provider Component
 * Wraps the app to provide language context to all components
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Save language preference to localStorage with type safety
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setStorageItem(LANGUAGE_STORAGE_KEY, lang);
  }, []);

  // Toggle between languages - use state updater to avoid language dependency
  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      setStorageItem(LANGUAGE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  // Sync with localStorage on mount (with validation)
  useEffect(() => {
    const stored = getStorageItem<Language>(LANGUAGE_STORAGE_KEY, null as unknown as Language, {
      validator: isLanguage,
    });
    if (stored) {
      setLanguageState(stored);
    }
  }, []);

  // Current translations based on language
  const t = allTranslations[language];

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context
 * @throws Error if used outside LanguageProvider
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Hook to get translations directly
 * Shorthand for useLanguage().t
 */
export function useTranslations(): Translations {
  return useLanguage().t;
}
