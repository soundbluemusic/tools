import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  createMemo,
  type ParentComponent,
  type Accessor,
} from 'solid-js';
import { useLocation, useNavigate } from '@solidjs/router';
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
 * Language Provider Component
 * Wraps the app to provide language context to all components
 * Syncs language with URL path for SEO
 */
export const LanguageProvider: ParentComponent = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguageState] = createSignal<Language>(getInitialLanguage());

  // Sync language state with URL on navigation
  createEffect(() => {
    const urlLanguage = getLanguageFromPath(location.pathname);
    if (urlLanguage !== language()) {
      setLanguageState(urlLanguage);
      setStorageItem(LANGUAGE_STORAGE_KEY, urlLanguage);
    }
  });

  // Save language preference to localStorage and navigate to new URL
  const setLanguage = (lang: Language) => {
    if (lang === language()) return;

    setLanguageState(lang);
    setStorageItem(LANGUAGE_STORAGE_KEY, lang);

    // Navigate to the same page with new language prefix
    const basePath = getBasePath(location.pathname);
    const newPath =
      lang === 'ko'
        ? `${KOREAN_PREFIX}${basePath === '/' ? '' : basePath}` || KOREAN_PREFIX
        : basePath;
    navigate(newPath, { replace: true });
  };

  // Toggle between languages with URL update
  const toggleLanguage = () => {
    const newLang = language() === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
  };

  // Current translations based on language
  const t = createMemo(() => allTranslations[language()]);

  const value = createMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t,
  }));

  return (
    <LanguageContext.Provider value={value()}>
      {props.children}
    </LanguageContext.Provider>
  );
};

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
export function useTranslations(): Accessor<Translations> {
  return useLanguage().t;
}
