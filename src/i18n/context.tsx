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
import type { Language, Translations } from './types';
import {
  getLanguageFromPath,
  getBasePath,
  buildLocalizedPath,
} from '../utils/localization';
import {
  allTranslations,
  getOppositeLanguage,
  updateHtmlLang,
} from '../utils/i18n';

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
    setLanguage(getOppositeLanguage(currentLang));
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
    updateHtmlLang(currentLang);
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
