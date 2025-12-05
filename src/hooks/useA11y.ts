import {
  createSignal,
  createEffect,
  onCleanup,
  onMount,
  type Accessor,
} from 'solid-js';
import { isServer } from 'solid-js/web';

/**
 * Focus trap hook - traps focus within a container element
 * @param containerRef - Accessor to the container element
 * @param isActive - Whether focus trap is active
 */
export function useFocusTrap(
  containerRef: Accessor<HTMLElement | null>,
  isActive: Accessor<boolean>
): void {
  createEffect(() => {
    if (isServer || !isActive()) return;

    const container = containerRef();
    if (!container) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusableElements = () =>
      container.querySelectorAll<HTMLElement>(focusableSelectors);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element when trap activates
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });
}

/**
 * Arrow key navigation hook for lists
 * @param containerRef - Accessor to the container element
 * @param itemSelector - CSS selector for navigable items
 * @param options - Navigation options
 */
export function useArrowNavigation(
  containerRef: Accessor<HTMLElement | null>,
  itemSelector: string,
  options: {
    horizontal?: boolean;
    vertical?: boolean;
    wrap?: boolean;
    onSelect?: (element: HTMLElement, index: number) => void;
  } = {}
): void {
  const { horizontal = false, vertical = true, wrap = true, onSelect } = options;

  createEffect(() => {
    if (isServer) return;

    const container = containerRef();
    if (!container) return;

    const getItems = () =>
      Array.from(container.querySelectorAll<HTMLElement>(itemSelector));

    const handleKeyDown = (event: KeyboardEvent) => {
      const items = getItems();
      if (items.length === 0) return;

      const currentIndex = items.findIndex(
        (item) => item === document.activeElement
      );

      let nextIndex = currentIndex;

      if (vertical) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          nextIndex = wrap
            ? (currentIndex + 1) % items.length
            : Math.min(currentIndex + 1, items.length - 1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          nextIndex = wrap
            ? (currentIndex - 1 + items.length) % items.length
            : Math.max(currentIndex - 1, 0);
        }
      }

      if (horizontal) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          nextIndex = wrap
            ? (currentIndex + 1) % items.length
            : Math.min(currentIndex + 1, items.length - 1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          nextIndex = wrap
            ? (currentIndex - 1 + items.length) % items.length
            : Math.max(currentIndex - 1, 0);
        }
      }

      if (event.key === 'Home') {
        event.preventDefault();
        nextIndex = 0;
      } else if (event.key === 'End') {
        event.preventDefault();
        nextIndex = items.length - 1;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        if (currentIndex >= 0 && onSelect) {
          event.preventDefault();
          onSelect(items[currentIndex], currentIndex);
        }
      }

      if (nextIndex !== currentIndex && nextIndex >= 0) {
        items[nextIndex].focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    onCleanup(() => container.removeEventListener('keydown', handleKeyDown));
  });
}

/**
 * Live region announcer for screen readers
 * @returns announce function
 */
export function useAnnounce(): (
  message: string,
  priority?: 'polite' | 'assertive'
) => void {
  let announcer: HTMLElement | null = null;

  onMount(() => {
    if (isServer) return;

    // Create or find announcer element
    announcer = document.getElementById('a11y-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'a11y-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(announcer);
    }
  });

  onCleanup(() => {
    if (announcer && announcer.parentNode) {
      announcer.parentNode.removeChild(announcer);
    }
  });

  return (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcer) return;

    announcer.setAttribute('aria-live', priority);
    announcer.textContent = '';

    // Force reflow
    void announcer.offsetHeight;

    announcer.textContent = message;
  };
}

/**
 * Hook to manage focus on route change
 * @param mainContentId - ID of main content element to focus
 */
export function useRouteAnnouncer(mainContentId = 'main-content'): void {
  onMount(() => {
    if (isServer) return;

    // Focus main content on initial load
    const mainContent = document.getElementById(mainContentId);
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus({ preventScroll: true });
    }
  });
}

/**
 * Hook to detect if user is navigating with keyboard
 * @returns Whether user is using keyboard navigation
 */
export function useKeyboardNavigation(): Accessor<boolean> {
  const [isKeyboardNav, setIsKeyboardNav] = createSignal(false);

  onMount(() => {
    if (isServer) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardNav(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNav(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    });
  });

  return isKeyboardNav;
}
