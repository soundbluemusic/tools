import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from 'react';
import type { ReactNode } from 'react';
import {
  getStorageItem,
  setStorageItem,
  createEnumValidator,
} from '../utils/storage';

/** Available theme options */
export type Theme = 'light' | 'dark';

const THEMES = ['light', 'dark'] as const;
const THEME_STORAGE_KEY = 'theme-preference';

interface ThemeContextValue {
  /** Current theme setting */
  theme: Theme;
  /** Set theme preference */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
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
export const ThemeProvider = memo(function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const isTheme = createEnumValidator(THEMES);

  // Get initial theme from storage or detect system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = getStorageItem<Theme | null>(THEME_STORAGE_KEY, null, {
      validator: (v): v is Theme => isTheme(v),
    });
    if (stored) return stored;
    // Default to system preference on first visit
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Set theme and persist
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setStorageItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
});

ThemeProvider.displayName = 'ThemeProvider';
