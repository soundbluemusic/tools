import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Language, Translations, AllTranslations } from './types';
import { commonKo, commonEn } from './translations/common';
import { qrKo, qrEn } from './translations/qr';
import { metronomeKo, metronomeEn } from './translations/metronome';
import { drumKo, drumEn } from './translations/drum';
import { drumSynthKo, drumSynthEn } from './translations/drum-synth';
import {
  getStorageItem,
  setStorageItem,
  createEnumValidator,
} from '../utils/storage';

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
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

/**
 * Language context with default values
 */
const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

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
 * Get initial language from URL, localStorage or detect from browser
 */
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ko';

  // First priority: URL path
  const urlLanguage = getLanguageFromPath(window.location.pathname);

  // If URL has /ko prefix, it's Korean
  if (window.location.pathname.startsWith(KOREAN_PREFIX)) {
    return 'ko';
  }

  // Try to get from storage with validation
  const stored = getStorageItem<Language>(
    LANGUAGE_STORAGE_KEY,
    null as unknown as Language,
    {
      validator: isLanguage,
    }
  );

  if (stored) {
    return stored;
  }

  // Detect browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) {
    return 'en';
  }

  // Default to URL-based language (en for root paths)
  return urlLanguage;
};

/**
 * Language Provider Props for Astro compatibility
 */
interface LanguageProviderProps {
  children: ReactNode;
  /** Initial language from Astro route - required for Astro */
  initialLanguage?: Language;
  /** Current path from Astro - required for Astro */
  currentPath?: string;
}

/**
 * Language Provider Component
 * Wraps the app to provide language context to all components
 * Works with both React Router (legacy) and Astro (native navigation)
 */
export function LanguageProvider({
  children,
  initialLanguage,
  currentPath,
}: LanguageProviderProps) {
  // Use initialLanguage from Astro or detect from browser
  const [language, setLanguageState] = useState<Language>(
    initialLanguage ?? getInitialLanguage
  );

  // Track current pathname - use Astro's currentPath or detect from window
  const [pathname, setPathname] = useState<string>(
    currentPath ??
      (typeof window !== 'undefined' ? window.location.pathname : '/')
  );

  // Sync pathname with browser URL (for client-side hydration)
  useEffect(() => {
    if (typeof window !== 'undefined' && !currentPath) {
      setPathname(window.location.pathname);
    }
  }, [currentPath]);

  // Sync language state with URL on navigation
  useEffect(() => {
    const urlLanguage = getLanguageFromPath(pathname);
    if (urlLanguage !== language) {
      setLanguageState(urlLanguage);
      setStorageItem(LANGUAGE_STORAGE_KEY, urlLanguage);
    }
  }, [pathname, language]);

  // Save language preference to localStorage and navigate to new URL
  const setLanguage = useCallback(
    (lang: Language) => {
      if (lang === language) return;

      setLanguageState(lang);
      setStorageItem(LANGUAGE_STORAGE_KEY, lang);

      // Navigate using native browser navigation (works in both React Router and Astro)
      const basePath = getBasePath(pathname);
      const newPath =
        lang === 'ko'
          ? `${KOREAN_PREFIX}${basePath === '/' ? '' : basePath}` ||
            KOREAN_PREFIX
          : basePath;

      // Use native navigation for Astro compatibility
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line react-compiler/react-compiler
        window.location.href = newPath;
      }
    },
    [language, pathname]
  );

  // Toggle between languages with URL update
  const toggleLanguage = useCallback(() => {
    const newLang = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
  }, [language, setLanguage]);

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
 * Default translations for SSR fallback when LanguageProvider is not available
 * This allows components to be rendered during Astro's static generation
 */
const defaultContextValue: LanguageContextValue = {
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: allTranslations.en,
};

/**
 * Hook to use language context
 * Returns default values when used outside LanguageProvider (for SSR compatibility)
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  // Return default context for SSR when provider is not available
  // This happens during Astro's static generation
  if (!context) {
    return defaultContextValue;
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
