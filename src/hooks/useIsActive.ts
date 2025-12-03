import { useCallback, useMemo, useState, useEffect } from 'react';
import { getBasePath } from './useLocalizedPath';

/**
 * Korean language prefix for URL
 */
const KOREAN_PREFIX = '/ko';

/**
 * Hook for checking if a path is active in navigation
 * Handles both base paths and Korean prefixed paths (/ko/*)
 * Consolidates duplicate isActive logic from Sidebar and BottomNav
 * Updated for Astro compatibility - uses window.location instead of react-router-dom
 */
export function useIsActive() {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Sync pathname with window.location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  // Get base path without language prefix
  const basePath = useMemo(() => getBasePath(pathname), [pathname]);

  const isActive = useCallback(
    (path: string) => {
      // Compare against base path (without language prefix)
      if (path === '/') return basePath === '/' || pathname === KOREAN_PREFIX;
      // Exact match or match with trailing content that starts with /
      // This prevents /drum from matching /drum-synth
      return basePath === path || basePath.startsWith(path + '/');
    },
    [basePath, pathname]
  );

  return { isActive, pathname, basePath };
}
