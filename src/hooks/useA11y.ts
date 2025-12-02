import { useCallback, useEffect, useRef, useId as useReactId } from 'react';

/**
 * Accessibility utilities and hooks
 */

/**
 * Hook for managing focus trap within a container
 * Useful for modals and dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element on activation
    firstElement.focus();

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for keyboard navigation in lists/grids
 */
export function useArrowNavigation<T extends HTMLElement>(
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
  } = {}
) {
  const { orientation = 'both', loop = true } = options;
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const items = Array.from(
        container.querySelectorAll<HTMLElement>(
          '[role="menuitem"], [role="option"], [role="gridcell"], a, button'
        )
      ).filter((el) => !el.hasAttribute('disabled'));

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      const canNavigateVertical =
        orientation === 'vertical' || orientation === 'both';
      const canNavigateHorizontal =
        orientation === 'horizontal' || orientation === 'both';

      switch (e.key) {
        case 'ArrowUp':
          if (canNavigateVertical) {
            e.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        case 'ArrowDown':
          if (canNavigateVertical) {
            e.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case 'ArrowLeft':
          if (canNavigateHorizontal) {
            e.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (canNavigateHorizontal) {
            e.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      if (loop) {
        if (nextIndex < 0) nextIndex = items.length - 1;
        if (nextIndex >= items.length) nextIndex = 0;
      } else {
        nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
      }

      items[nextIndex]?.focus();
    },
    [orientation, loop]
  );

  return { containerRef, handleKeyDown };
}

/**
 * Hook for announcing messages to screen readers
 */
export function useAnnounce() {
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },
    []
  );

  return announce;
}

/**
 * Hook for reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  const mediaQuery = '(prefers-reduced-motion: reduce)';

  if (typeof window === 'undefined') return false;

  return window.matchMedia(mediaQuery).matches;
}

/**
 * Generate unique ID for accessibility
 * Wrapper around React 18's useId with optional prefix
 */
export function useId(prefix = 'a11y'): string {
  const reactId = useReactId();
  return `${prefix}${reactId}`;
}
