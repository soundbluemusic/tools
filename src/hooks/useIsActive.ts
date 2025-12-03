import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getBasePath } from './useLocalizedPath';

/**
 * Korean language prefix for URL
 */
const KOREAN_PREFIX = '/ko';

/**
 * Hook for checking if a path is active in navigation
 * Handles both base paths and Korean prefixed paths (/ko/*)
 * Consolidates duplicate isActive logic from Sidebar and BottomNav
 */
export function useIsActive() {
  const location = useLocation();

  // Get base path without language prefix
  const basePath = useMemo(
    () => getBasePath(location.pathname),
    [location.pathname]
  );

  const isActive = useCallback(
    (path: string) => {
      // Compare against base path (without language prefix)
      if (path === '/')
        return basePath === '/' || location.pathname === KOREAN_PREFIX;
      // Exact match or match with trailing content that starts with /
      // This prevents /drum from matching /drum-synth
      return basePath === path || basePath.startsWith(path + '/');
    },
    [basePath, location.pathname]
  );

  return { isActive, pathname: location.pathname, basePath };
}
