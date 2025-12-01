import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook for checking if a path is active in navigation
 * Consolidates duplicate isActive logic from Sidebar and BottomNav
 */
export function useIsActive() {
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  return { isActive, pathname: location.pathname };
}
