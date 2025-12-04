import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  type ParentComponent,
  type Accessor,
} from 'solid-js';
import { isServer } from 'solid-js/web';
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
 * Default theme context value for SSR/prerender fallback
 */
const defaultThemeContext: ThemeContextValue = {
  theme: () => 'dark' as Theme,
  setTheme: () => {},
  toggleTheme: () => {},
};

/**
 * Hook to access theme context
 * Returns default values during SSR prerendering when provider is not available
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  // Return default context during SSR prerendering
  if (!context) {
    return defaultThemeContext;
  }
  return context;
}

/**
 * Theme provider component
 * Manages theme state and applies to document
 *
 * Hydration-safe: Uses consistent initial value, applies theme after mount
 */
export const ThemeProvider: ParentComponent = (props) => {
  // Always use 'dark' as initial value for consistent hydration
  const [theme, setThemeState] = createSignal<Theme>('dark');

  // Client-side: detect and apply actual theme after mount
  onMount(() => {
    const isTheme = createEnumValidator(THEMES);
    const stored = getStorageItem<Theme | null>(THEME_STORAGE_KEY, null, {
      validator: (v): v is Theme => isTheme(v),
    });

    let actualTheme: Theme = 'dark';
    if (stored) {
      actualTheme = stored;
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      actualTheme = 'light';
    }

    setThemeState(actualTheme);
    document.documentElement.dataset.theme = actualTheme;
  });

  // Apply theme to document when it changes (after initial mount)
  createEffect(() => {
    if (!isServer) {
      document.documentElement.dataset.theme = theme();
    }
  });

  // Set theme and persist
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (!isServer) {
      setStorageItem(THEME_STORAGE_KEY, newTheme);
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(theme() === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
};
