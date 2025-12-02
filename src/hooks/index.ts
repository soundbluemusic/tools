/**
 * Custom hooks barrel export
 */
export { useLocalStorage } from './useLocalStorage';
export {
  useMediaQuery,
  useDarkMode,
  useIsMobile,
  useReducedMotion,
  breakpoints,
} from './useMediaQuery';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useSearch } from './useSearch';
export { useSort } from './useSort';
export { useViewTransition } from './useViewTransition';
export { useSEO } from './useSEO';
export { useTheme, ThemeProvider } from './useTheme';
export type { Theme } from './useTheme';
export {
  useFocusTrap,
  useArrowNavigation,
  useAnnounce,
  usePrefersReducedMotion,
  useId,
} from './useA11y';
export { useApps, AppsProvider } from './useApps';
export { useDropdown, useDropdownToggle } from './useDropdown';
export { useIsActive } from './useIsActive';
