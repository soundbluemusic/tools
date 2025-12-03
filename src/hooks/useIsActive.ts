import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getBasePath } from '../utils/localization';

/**
 * Hook for checking if a path is active in navigation
 * Handles both English (default) and Korean (/ko prefix) routes
 */
export function useIsActive() {
  const location = useLocation();

  // Get base path without language prefix for comparison
  const basePath = useMemo(
    () => getBasePath(location.pathname),
    [location.pathname]
  );

  const isActive = useCallback(
    (path: string) => {
      // Compare against base path (without language prefix)
      if (path === '/') return basePath === '/';
      // Exact match or match with trailing content that starts with /
      // This prevents /drum from matching /drum-synth
      return basePath === path || basePath.startsWith(path + '/');
    },
    [basePath]
  );

  return { isActive, pathname: location.pathname, basePath };
}
