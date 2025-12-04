import { createMemo, type Accessor } from 'solid-js';
import { useLocation } from '@solidjs/router';
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
  const basePath = createMemo(() => getBasePath(location.pathname));

  const isActive = (path: string): boolean => {
    const currentBasePath = basePath();
    // Compare against base path (without language prefix)
    if (path === '/') {
      return currentBasePath === '/' || location.pathname === KOREAN_PREFIX;
    }
    // Exact match or match with trailing content that starts with /
    // This prevents /drum from matching /drum-synth
    return currentBasePath === path || currentBasePath.startsWith(path + '/');
  };

  return {
    isActive,
    pathname: () => location.pathname,
    basePath,
  };
}
