/**
 * Standalone Apps - Vanilla TypeScript Settings
 * Theme and language management without React
 */

export type Theme = 'light' | 'dark';
export type Language = 'ko' | 'en';

export interface StandaloneSettings {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  subscribe: (callback: () => void) => () => void;
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
 * Create standalone settings store for vanilla TypeScript apps
 * @param appName - App identifier for localStorage keys (e.g., 'metronome', 'drum')
 */
export function createStandaloneSettings(appName: string): StandaloneSettings {
  const themeKey = `${appName}-theme`;
  const langKey = `${appName}-lang`;

  let theme: Theme = detectTheme(themeKey);
  let language: Language = detectLanguage(langKey);
  const listeners: Set<() => void> = new Set();

  // Apply initial theme
  document.documentElement.setAttribute('data-theme', theme);

  const notifyListeners = () => {
    listeners.forEach((callback) => callback());
  };

  return {
    get theme() {
      return theme;
    },
    get language() {
      return language;
    },
    setTheme(newTheme: Theme) {
      theme = newTheme;
      localStorage.setItem(themeKey, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      notifyListeners();
    },
    setLanguage(newLanguage: Language) {
      language = newLanguage;
      localStorage.setItem(langKey, newLanguage);
      notifyListeners();
    },
    toggleTheme() {
      this.setTheme(theme === 'light' ? 'dark' : 'light');
    },
    toggleLanguage() {
      this.setLanguage(language === 'ko' ? 'en' : 'ko');
    },
    subscribe(callback: () => void) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

/**
 * Initialize theme before app hydration (for main.ts)
 */
export function initTheme(appName: string): void {
  const stored = localStorage.getItem(`${appName}-theme`);
  if (stored === 'dark' || stored === 'light') {
    document.documentElement.setAttribute('data-theme', stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}
