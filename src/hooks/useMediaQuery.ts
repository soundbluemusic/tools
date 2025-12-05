import {
  createSignal,
  createEffect,
  onCleanup,
  onMount,
  type Accessor,
} from 'solid-js';
import { isServer } from 'solid-js/web';

/**
 * Custom hook for media query matching
 * @param query - CSS media query string
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): Accessor<boolean> {
  const [matches, setMatches] = createSignal(false);

  onMount(() => {
    if (isServer) return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    onCleanup(() => mediaQuery.removeEventListener('change', handleChange));
  });

  return matches;
}

/**
 * Hook to detect dark mode preference
 * @returns Whether dark mode is preferred
 */
export function useDarkMode(): Accessor<boolean> {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Hook to detect light mode preference
 * @returns Whether light mode is preferred
 */
export function useLightMode(): Accessor<boolean> {
  return useMediaQuery('(prefers-color-scheme: light)');
}

/**
 * Hook to detect mobile viewport
 * @param breakpoint - Max width in pixels (default: 768)
 * @returns Whether viewport is mobile-sized
 */
export function useIsMobile(breakpoint = 768): Accessor<boolean> {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

/**
 * Hook to detect tablet viewport
 * @returns Whether viewport is tablet-sized (768px - 1024px)
 */
export function useIsTablet(): Accessor<boolean> {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook to detect desktop viewport
 * @param breakpoint - Min width in pixels (default: 1024)
 * @returns Whether viewport is desktop-sized
 */
export function useIsDesktop(breakpoint = 1024): Accessor<boolean> {
  return useMediaQuery(`(min-width: ${breakpoint}px)`);
}

/**
 * Hook to detect reduced motion preference
 * @returns Whether user prefers reduced motion
 */
export function useReducedMotion(): Accessor<boolean> {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook to detect high contrast preference
 * @returns Whether user prefers more contrast
 */
export function useHighContrast(): Accessor<boolean> {
  return useMediaQuery('(prefers-contrast: more)');
}

/**
 * Hook to get current breakpoint
 * @returns Current breakpoint name
 */
export function useBreakpoint(): Accessor<
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
> {
  const isXs = useMediaQuery('(max-width: 479px)');
  const isSm = useMediaQuery('(min-width: 480px) and (max-width: 767px)');
  const isMd = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isLg = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isXl = useMediaQuery('(min-width: 1280px) and (max-width: 1535px)');

  return () => {
    if (isXs()) return 'xs';
    if (isSm()) return 'sm';
    if (isMd()) return 'md';
    if (isLg()) return 'lg';
    if (isXl()) return 'xl';
    return '2xl';
  };
}
