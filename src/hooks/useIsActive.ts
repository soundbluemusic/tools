import { createMemo, createSignal, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';
import { getBasePath } from './useLocalizedPath';

/**
 * Korean language prefix for URL
 */
const KOREAN_PREFIX = '/ko';

/**
 * Hook for checking if a path is active in navigation
 * Handles both base paths and Korean prefixed paths (/ko/*)
 * Consolidates duplicate isActive logic from Sidebar and BottomNav
 *
 * Hydration-safe: returns consistent default values, updates after mount
 */
export function useIsActive() {
  // Use consistent default values for SSR and initial client render
  const [pathname, setPathname] = createSignal('/');

  // Update pathname after mount (client-only)
  onMount(() => {
    setPathname(window.location.pathname);
  });

  // Get base path without language prefix
  const basePath = createMemo(() => getBasePath(pathname()));

  const isActive = (path: string): boolean => {
    // On server, always return false for consistent hydration
    if (isServer) return false;

    const currentBasePath = basePath();
    const currentPathname = pathname();

    // Compare against base path (without language prefix)
    if (path === '/') {
      return currentBasePath === '/' || currentPathname === KOREAN_PREFIX;
    }
    // Exact match or match with trailing content that starts with /
    // This prevents /drum from matching /drum-synth
    return currentBasePath === path || currentBasePath.startsWith(path + '/');
  };

  return {
    isActive,
    pathname,
    basePath,
  };
}
