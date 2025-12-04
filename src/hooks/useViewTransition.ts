import { isServer } from 'solid-js/web';
import { useNavigate } from '@solidjs/router';

/**
 * Custom hook for navigation with View Transitions API support
 * Consolidates duplicate View Transitions logic across components
 * SSR-safe: returns no-op functions during prerendering
 *
 * @returns Object containing navigation handler and click handler factory
 */
export function useViewTransition() {
  // SSR fallback
  if (isServer) {
    return {
      navigateWithTransition: () => {},
      createClickHandler: () => () => {},
    };
  }

  const navigate = useNavigate();

  /**
   * Navigate to a URL with View Transitions API support
   */
  const navigateWithTransition = (to: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(to);
      });
    } else {
      navigate(to);
    }
  };

  /**
   * Create a click handler for Link components that uses View Transitions
   * @param to - Target URL
   * @returns Click event handler
   */
  const createClickHandler = (to: string) => (e: MouseEvent) => {
    if (document.startViewTransition) {
      e.preventDefault();
      document.startViewTransition(() => {
        navigate(to);
      });
    }
    // If View Transitions not supported, let Link handle navigation normally
  };

  return {
    navigateWithTransition,
    createClickHandler,
  };
}
