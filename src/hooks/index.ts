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
export { usePWA } from './usePWA';
export { useSEO } from './useSEO';
export { useTheme, ThemeProvider } from './useTheme';
export type { Theme, ResolvedTheme } from './useTheme';
export {
  useFocusTrap,
  useArrowNavigation,
  useAnnounce,
  usePrefersReducedMotion,
  useId,
} from './useA11y';
