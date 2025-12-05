import { isServer } from 'solid-js/web';
import { useNavigate } from '@solidjs/router';

/**
 * Check if View Transitions API is supported
 */
function supportsViewTransitions(): boolean {
  return (
    !isServer &&
    typeof document !== 'undefined' &&
    'startViewTransition' in document
  );
}

/**
 * Custom hook for navigation with View Transitions API support
 * Consolidates duplicate View Transitions logic across components
 *
 * Hydration-safe: Uses same code path for SSR and client
 *
 * Features:
 * - Smooth cross-fade transitions between pages
 * - Graceful fallback for unsupported browsers
 * - Respects prefers-reduced-motion
 *
 * @returns Object containing navigation handler and click handler factory
 */
export function useViewTransition() {
  // Get navigate function only on client (for use in callbacks)
  const navigate = isServer ? null : useNavigate();

  /**
   * Check if user prefers reduced motion
   */
  const prefersReducedMotion = (): boolean => {
    if (isServer || typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Navigate to a URL with View Transitions API support
   */
  const navigateWithTransition = (to: string) => {
    if (!navigate) return;

    // Skip transition animation if user prefers reduced motion
    if (prefersReducedMotion()) {
      navigate(to);
      return;
    }

    if (supportsViewTransitions()) {
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
    if (!navigate) return;

    // Skip transition animation if user prefers reduced motion
    if (prefersReducedMotion()) {
      // Let Link handle navigation normally
      return;
    }

    if (supportsViewTransitions()) {
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
    supportsViewTransitions: supportsViewTransitions(),
  };
}
