import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Language, Translations, AllTranslations } from './types';
import { commonKo, commonEn } from './translations/common';
import { qrKo, qrEn } from './translations/qr';

/**
 * All translations organized by language
 */
const allTranslations: AllTranslations = {
  ko: {
    common: commonKo,
    qr: qrKo,
  },
  en: {
    common: commonEn,
    qr: qrEn,
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
 * Get initial language from localStorage or default to Korean
 */
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ko';

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'ko' || stored === 'en') {
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

  // Save language preference to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, []);

  // Toggle between languages - use state updater to avoid language dependency
  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'ko' || stored === 'en') {
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
