import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Language, Translations, AllTranslations } from './types';
import { commonKo, commonEn } from './translations/common';
import { qrKo, qrEn } from './translations/qr';
import { metronomeKo, metronomeEn } from './translations/metronome';
import { drumKo, drumEn } from './translations/drum';
import { drumSynthKo, drumSynthEn } from './translations/drum-synth';

/**
 * Korean language prefix for URLs
 * English is the default language and has no prefix
 */
const KO_PREFIX = '/ko';

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
  /** Get localized path for current language */
  localizedPath: (path: string) => string;
  /** Get base path without language prefix */
  basePath: string;
}

/**
 * Language context with default values
 */
const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

/**
 * Extract language from URL path
 * - /ko/* -> 'ko'
 * - /* -> 'en' (default)
 */
function getLanguageFromPath(pathname: string): Language {
  return pathname.startsWith(KO_PREFIX + '/') || pathname === KO_PREFIX
    ? 'ko'
    : 'en';
}

/**
 * Get the base path without language prefix
 * - /ko/metronome -> /metronome
 * - /metronome -> /metronome
 */
function getBasePath(pathname: string): string {
  if (pathname.startsWith(KO_PREFIX + '/')) {
    return pathname.slice(KO_PREFIX.length);
  }
  if (pathname === KO_PREFIX) {
    return '/';
  }
  return pathname;
}

/**
 * Build localized path for given language
 * - ('/', 'ko') -> '/ko'
 * - ('/metronome', 'ko') -> '/ko/metronome'
 * - ('/', 'en') -> '/'
 * - ('/metronome', 'en') -> '/metronome'
 */
function buildLocalizedPath(basePath: string, language: Language): string {
  if (language === 'en') {
    return basePath;
  }
  // Korean: add /ko prefix
  if (basePath === '/') {
    return KO_PREFIX;
  }
  return KO_PREFIX + basePath;
}

/**
 * Language Provider Component
 * Derives language from URL path:
 * - /ko/* -> Korean
 * - /* -> English (default)
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive language from URL
  const language = useMemo(
    () => getLanguageFromPath(location.pathname),
    [location.pathname]
  );

  // Get base path without language prefix
  const basePath = useMemo(
    () => getBasePath(location.pathname),
    [location.pathname]
  );

  // For standalone pages that don't use router
  const [standaloneLanguage, setStandaloneLanguage] = useState<Language>('en');
  const isStandalone = typeof window !== 'undefined' && !location.pathname;

  // Set language by navigating to new URL
  const setLanguage = useCallback(
    (lang: Language) => {
      if (isStandalone) {
        setStandaloneLanguage(lang);
        return;
      }
      const newPath = buildLocalizedPath(basePath, lang);
      navigate(newPath + location.search + location.hash, { replace: true });
    },
    [basePath, location.search, location.hash, navigate, isStandalone]
  );

  // Toggle between languages
  const toggleLanguage = useCallback(() => {
    const currentLang = isStandalone ? standaloneLanguage : language;
    const newLang = currentLang === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
  }, [language, standaloneLanguage, isStandalone, setLanguage]);

  // Build path for current language
  const localizedPath = useCallback(
    (path: string): string => {
      const currentLang = isStandalone ? standaloneLanguage : language;
      return buildLocalizedPath(path, currentLang);
    },
    [language, standaloneLanguage, isStandalone]
  );

  // Update HTML lang attribute when language changes
  useEffect(() => {
    const currentLang = isStandalone ? standaloneLanguage : language;
    document.documentElement.lang = currentLang;
  }, [language, standaloneLanguage, isStandalone]);

  // Current translations based on language
  const currentLang = isStandalone ? standaloneLanguage : language;
  const t = allTranslations[currentLang];

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      language: currentLang,
      setLanguage,
      toggleLanguage,
      t,
      localizedPath,
      basePath,
    }),
    [currentLang, setLanguage, toggleLanguage, t, localizedPath, basePath]
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
