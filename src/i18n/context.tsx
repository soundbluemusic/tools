import {
  createContext,
  useContext,
  createMemo,
  type ParentComponent,
  type Accessor,
} from 'solid-js';
import { isServer } from 'solid-js/web';
import { useNavigate, useLocation } from '@solidjs/router';
import type { Language, Translations, AllTranslations } from './types';
import { commonKo, commonEn } from './translations/common';
import { qrKo, qrEn } from './translations/qr';
import { metronomeKo, metronomeEn } from './translations/metronome';
import { drumKo, drumEn } from './translations/drum';
import { drumSynthKo, drumSynthEn } from './translations/drum-synth';
import { setStorageItem } from '../utils/storage';

/**
 * Korean language URL prefix for SEO
 */
const KOREAN_PREFIX = '/ko';

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

/**
 * Language context value type
 */
interface LanguageContextValue {
  language: Accessor<Language>;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Accessor<Translations>;
}

/**
 * Language context with default values
 */
const LanguageContext = createContext<LanguageContextValue>();

/**
 * Local storage key for language preference
 */
const LANGUAGE_STORAGE_KEY = 'preferred-language';

/**
 * Get language from URL path
 */
const getLanguageFromPath = (pathname: string): Language => {
  return pathname.startsWith(KOREAN_PREFIX) ? 'ko' : 'en';
};

/**
 * Get base path without language prefix
 */
const getBasePath = (pathname: string): string => {
  if (pathname.startsWith(KOREAN_PREFIX)) {
    const basePath = pathname.slice(KOREAN_PREFIX.length);
    return basePath || '/';
  }
  return pathname;
};

/**
 * Language Provider Component
 * Wraps the app to provide language context to all components
 * Syncs language with URL path for SEO
 *
 * Hydration-safe: Uses useLocation() which works for both SSR and client
 */
export const LanguageProvider: ParentComponent = (props) => {
  // Use router's location to get pathname (works for both SSR and client)
  const location = useLocation();

  // Derive language from URL pathname - reactive to route changes
  const language = createMemo(() => getLanguageFromPath(location.pathname));

  // Get navigate function (client-only)
  let navigate: ReturnType<typeof useNavigate> | null = null;
  if (!isServer) {
    try {
      navigate = useNavigate();
    } catch {
      // Router context not available yet
    }
  }

  // Set language and navigate to new URL (client-only)
  const setLanguage = (lang: Language) => {
    if (lang === language()) return;

    if (!isServer) {
      setStorageItem(LANGUAGE_STORAGE_KEY, lang);

      // Navigate to the same page with new language prefix
      const basePath = getBasePath(location.pathname);
      const newPath =
        lang === 'ko'
          ? `${KOREAN_PREFIX}${basePath === '/' ? '' : basePath}` ||
            KOREAN_PREFIX
          : basePath;

      // Use pre-acquired navigate function for SPA navigation
      if (navigate) {
        navigate(newPath, { replace: true });
      } else {
        // Fallback only if navigate wasn't available at mount
        window.location.href = newPath;
      }
    }
  };

  // Toggle between languages
  const toggleLanguage = () => {
    const newLang = language() === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
  };

  // Current translations based on language
  const t = createMemo(() => allTranslations[language()]);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    toggleLanguage,
    t,
  };

  // Single render path for both SSR and client
  return (
    <LanguageContext.Provider value={value}>
      {props.children}
    </LanguageContext.Provider>
  );
};

/**
 * Default translations for SSR/prerender fallback
 */
const defaultTranslations = allTranslations.en;

/**
 * Default language context value for SSR/prerender fallback
 */
const defaultLanguageContext: LanguageContextValue = {
  language: () => 'en' as Language,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: () => defaultTranslations,
};

/**
 * Hook to use language context
 * Returns default values during SSR prerendering when provider is not available
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  // Return default context during SSR prerendering
  if (!context) {
    return defaultLanguageContext;
  }
  return context;
}

/**
 * Hook to get translations directly
 * Shorthand for useLanguage().t
 */
export function useTranslations(): Accessor<Translations> {
  return useLanguage().t;
}
