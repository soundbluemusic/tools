/**
 * Pure theme utility functions - no React dependency
 * Can be used in any TypeScript/JavaScript environment
 */

import { getStorageItem, setStorageItem, createEnumValidator } from './storage';

/** Available theme options */
export type Theme = 'light' | 'dark';

/** Valid theme values */
export const THEMES = ['light', 'dark'] as const;

/** LocalStorage key for theme preference */
export const THEME_STORAGE_KEY = 'theme-preference';

/** Theme validator for runtime type checking */
export const isTheme = createEnumValidator(THEMES);

/**
 * Detects the system's preferred color scheme
 * @returns 'dark' if system prefers dark mode, 'light' otherwise
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Gets the stored theme from localStorage
 * @returns The stored theme or null if not set
 */
export function getStoredTheme(): Theme | null {
  return getStorageItem<Theme | null>(THEME_STORAGE_KEY, null, {
    validator: (v): v is Theme => isTheme(v),
  });
}

/**
 * Gets the initial theme (stored preference or system default)
 * @returns The theme to use on initial load
 */
export function getInitialTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;
  return getSystemTheme();
}

/**
 * Persists theme preference to localStorage
 * @param theme - Theme to save
 */
export function saveTheme(theme: Theme): void {
  setStorageItem(THEME_STORAGE_KEY, theme);
}

/**
 * Applies theme to the document element
 * @param theme - Theme to apply
 */
export function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
}

/**
 * Gets the opposite theme
 * @param theme - Current theme
 * @returns The opposite theme
 */
export function getOppositeTheme(theme: Theme): Theme {
  return theme === 'light' ? 'dark' : 'light';
}
