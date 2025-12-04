import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  createMemo,
  type ParentComponent,
  type Accessor,
} from 'solid-js';
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
  theme: Accessor<Theme>;
  /** Set theme preference */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>();

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

/**
 * Get initial theme from storage or system preference
 */
function getInitialTheme(): Theme {
  const isTheme = createEnumValidator(THEMES);
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
}

/**
 * Theme provider component
 * Manages theme state and applies to document
 */
export const ThemeProvider: ParentComponent = (props) => {
  const [theme, setThemeState] = createSignal<Theme>(getInitialTheme());

  // Apply theme to document
  createEffect(() => {
    document.documentElement.dataset.theme = theme();
  });

  // Set theme and persist
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStorageItem(THEME_STORAGE_KEY, newTheme);
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(theme() === 'light' ? 'dark' : 'light');
  };

  const value = createMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
  }));

  return (
    <ThemeContext.Provider value={value()}>
      {props.children}
    </ThemeContext.Provider>
  );
};
