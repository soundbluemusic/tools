import { useCallback } from 'react';

/**
 * Custom hook for navigation with View Transitions API support
 * Consolidates duplicate View Transitions logic across components
 * Updated for Astro compatibility - uses window.location instead of react-router-dom
 *
 * @returns Object containing navigation handler and click handler factory
 */
export function useViewTransition() {
  /**
   * Navigate to a URL with View Transitions API support
   */
  const navigateWithTransition = useCallback((to: string) => {
    if (typeof window === 'undefined') return;

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        window.location.href = to;
      });
    } else {
      window.location.href = to;
    }
  }, []);

  /**
   * Create a click handler for Link components that uses View Transitions
   * @param to - Target URL
   * @returns Click event handler
   */
  const createClickHandler = useCallback(
    (to: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (typeof window === 'undefined') return;

      if (document.startViewTransition) {
        e.preventDefault();
        document.startViewTransition(() => {
          window.location.href = to;
        });
      }
      // If View Transitions not supported, let Link handle navigation normally
    },
    []
  );

  return {
    navigateWithTransition,
    createClickHandler,
  };
}
