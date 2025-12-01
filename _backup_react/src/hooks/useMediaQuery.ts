import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for responsive design with media queries
 * @param query - Media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((): boolean => {
    // SSR-safe check
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Update state on change
    const handleChange = () => setMatches(mediaQuery.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Add listener (with backwards compatibility)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Deprecated but needed for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

// Pre-defined breakpoints
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  mobile: '(max-width: 480px)',
  tablet: '(max-width: 768px)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

/**
 * Hook for checking if the user prefers dark mode
 */
export function useDarkMode(): boolean {
  return useMediaQuery(breakpoints.dark);
}

/**
 * Hook for checking if the device is mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery(breakpoints.mobile);
}

/**
 * Hook for checking if the user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  return useMediaQuery(breakpoints.reducedMotion);
}
