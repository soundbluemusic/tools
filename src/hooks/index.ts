/**
 * Custom hooks barrel export
 */
export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useViewTransition } from './useViewTransition';
export { useSEO } from './useSEO';
export { useTheme, ThemeProvider } from './useTheme';
export type { Theme } from './useTheme';
export { useApps } from './useApps';
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

// Search and sort
export { useSearch, useStringSearch } from './useSearch';
export { useSort } from './useSort';

// Media queries
export {
  useMediaQuery,
  useDarkMode,
  useLightMode,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useReducedMotion,
  useHighContrast,
  useBreakpoint,
} from './useMediaQuery';

// Accessibility
export {
  useFocusTrap,
  useArrowNavigation,
  useAnnounce,
  useRouteAnnouncer,
  useKeyboardNavigation,
} from './useA11y';

// PWA
export { useOnlineStatus, usePWA } from './usePWA';
