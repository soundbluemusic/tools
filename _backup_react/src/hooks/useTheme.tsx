import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import { getStorageItem, setStorageItem, createEnumValidator } from '../utils/storage';

/** Available theme options */
export type Theme = 'system' | 'light' | 'dark';

/** Resolved theme (what's actually applied) */
export type ResolvedTheme = 'light' | 'dark';

const THEMES = ['system', 'light', 'dark'] as const;
const THEME_STORAGE_KEY = 'theme-preference';

interface ThemeContextValue {
  /** Current theme setting */
  theme: Theme;
  /** Resolved theme (system preference applied) */
  resolvedTheme: ResolvedTheme;
  /** Set theme preference */
  setTheme: (theme: Theme) => void;
  /** Cycle through themes: system -> light -> dark -> system */
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component
 * Manages theme state and applies to document
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const isTheme = createEnumValidator(THEMES);

  // Get initial theme from storage or default to 'system'
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = getStorageItem<Theme>(THEME_STORAGE_KEY, 'system', {
      validator: isTheme,
    });
    return stored;
  });

  // Track system preference
  const [systemPreference, setSystemPreference] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Resolve actual theme
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === 'system') return systemPreference;
    return theme;
  }, [theme, systemPreference]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  // Set theme and persist
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setStorageItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  // Cycle through themes
  const cycleTheme = useCallback(() => {
    setTheme(
      theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    );
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, cycleTheme }),
    [theme, resolvedTheme, setTheme, cycleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
