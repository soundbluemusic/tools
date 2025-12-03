import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import {
  type Theme,
  getInitialTheme,
  saveTheme,
  applyTheme,
  getOppositeTheme,
} from '../utils/theme';

// Re-export Theme type for consumers
export type { Theme } from '../utils/theme';

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
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get initial theme from storage or detect system preference
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme to document
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Set theme and persist
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(getOppositeTheme(theme));
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
