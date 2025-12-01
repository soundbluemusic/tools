/**
 * Theme Store
 * Manages theme state and applies to document
 */
import { writable, derived } from 'svelte/store';
import { getStorageItem, setStorageItem, createEnumValidator } from '../utils/storage';

/** Available theme options */
export type Theme = 'system' | 'light' | 'dark';

/** Resolved theme (what's actually applied) */
export type ResolvedTheme = 'light' | 'dark';

const THEMES = ['system', 'light', 'dark'] as const;
const THEME_STORAGE_KEY = 'theme-preference';
const isTheme = createEnumValidator(THEMES);

// Get initial theme from storage
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return getStorageItem<Theme>(THEME_STORAGE_KEY, 'system', { validator: isTheme });
}

// Get system preference
function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Create stores
export const theme = writable<Theme>(getInitialTheme());
export const systemPreference = writable<ResolvedTheme>(getSystemPreference());

// Derived store for resolved theme
export const resolvedTheme = derived(
  [theme, systemPreference],
  ([$theme, $systemPreference]) => {
    if ($theme === 'system') return $systemPreference;
    return $theme;
  }
);

// Set theme and persist
export function setTheme(newTheme: Theme): void {
  theme.set(newTheme);
  setStorageItem(THEME_STORAGE_KEY, newTheme);
}

// Cycle through themes
export function cycleTheme(): void {
  theme.update((current) => {
    const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    setStorageItem(THEME_STORAGE_KEY, next);
    return next;
  });
}

// Initialize theme system (call this in App.svelte onMount)
export function initTheme(): () => void {
  // Listen to system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent) => {
    systemPreference.set(e.matches ? 'dark' : 'light');
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else {
    mediaQuery.addListener(handleChange);
  }

  // Apply theme to document
  const unsubscribe = resolvedTheme.subscribe((value) => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = value;
    }
  });

  // Return cleanup function
  return () => {
    unsubscribe();
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.removeListener(handleChange);
    }
  };
}
