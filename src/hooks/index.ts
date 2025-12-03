/**
 * Custom hooks barrel export
 */
export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useViewTransition } from './useViewTransition';
export { useSEO } from './useSEO';
export { useTheme, ThemeProvider } from './useTheme';
export type { Theme } from './useTheme';
export { useApps, AppsProvider } from './useApps';
export { useDropdown, useDropdownToggle } from './useDropdown';
export { useIsActive } from './useIsActive';
export {
  useLocalizedPath,
  useLocalizedNavigate,
  localizedPath,
  getBasePath,
  getLanguageFromPath,
  getLanguagePrefix,
} from './useLocalizedPath';
