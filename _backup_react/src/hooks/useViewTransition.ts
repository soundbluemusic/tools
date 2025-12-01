import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for navigation with View Transitions API support
 * Consolidates duplicate View Transitions logic across components
 *
 * @returns Object containing navigation handler and click handler factory
 */
export function useViewTransition() {
  const navigate = useNavigate();

  /**
   * Navigate to a URL with View Transitions API support
   */
  const navigateWithTransition = useCallback(
    (to: string) => {
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          navigate(to);
        });
      } else {
        navigate(to);
      }
    },
    [navigate]
  );

  /**
   * Create a click handler for Link components that uses View Transitions
   * @param to - Target URL
   * @returns Click event handler
   */
  const createClickHandler = useCallback(
    (to: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (document.startViewTransition) {
        e.preventDefault();
        document.startViewTransition(() => {
          navigate(to);
        });
      }
      // If View Transitions not supported, let Link handle navigation normally
    },
    [navigate]
  );

  return {
    navigateWithTransition,
    createClickHandler,
  };
}
