import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'ko' | 'en';

interface StandaloneSettings {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

/**
 * Detect initial language from localStorage or browser settings
 */
function detectLanguage(storageKey: string): Language {
  const stored = localStorage.getItem(storageKey);
  if (stored === 'ko' || stored === 'en') return stored;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ko') ? 'ko' : 'en';
}

/**
 * Detect initial theme from localStorage or system preference
 */
function detectTheme(storageKey: string): Theme {
  const stored = localStorage.getItem(storageKey);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Shared hook for standalone app theme and language settings
 * @param appName - App identifier for localStorage keys (e.g., 'metronome', 'drum')
 */
export function useStandaloneSettings(appName: string): StandaloneSettings {
  const themeKey = `${appName}-theme`;
  const langKey = `${appName}-lang`;

  const [theme, setTheme] = useState<Theme>(() => detectTheme(themeKey));
  const [language, setLanguage] = useState<Language>(() =>
    detectLanguage(langKey)
  );

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(themeKey, next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, [themeKey]);

  // Language toggle
  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      localStorage.setItem(langKey, next);
      return next;
    });
  }, [langKey]);

  // Set initial theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, language, toggleTheme, toggleLanguage };
}

/**
 * Initialize theme before React hydration (for main.tsx)
 */
export function initTheme(appName: string): void {
  const stored = localStorage.getItem(`${appName}-theme`);
  if (stored === 'dark' || stored === 'light') {
    document.documentElement.setAttribute('data-theme', stored);
  }
}
