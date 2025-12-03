/**
 * Pure DOM utility functions - no React dependency
 * Can be used in any TypeScript/JavaScript environment
 */

/**
 * Check if a click event occurred outside an element
 * @param event - Mouse event
 * @param element - Element to check against
 * @returns true if click was outside the element
 */
export function isClickOutside(
  event: MouseEvent,
  element: HTMLElement | null
): boolean {
  if (!element) return false;
  return !element.contains(event.target as Node);
}

/**
 * Create a click outside listener
 * @param element - Element to monitor
 * @param callback - Called when click occurs outside
 * @returns Cleanup function to remove listener
 *
 * @example
 * const cleanup = onClickOutside(dropdownRef, () => {
 *   closeDropdown();
 * });
 * // Later: cleanup();
 */
export function onClickOutside(
  element: HTMLElement | null,
  callback: () => void
): () => void {
  const handleClick = (event: MouseEvent) => {
    if (isClickOutside(event, element)) {
      callback();
    }
  };

  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown', handleClick);
}

/**
 * Create an escape key listener
 * @param callback - Called when Escape key is pressed
 * @param focusElement - Optional element to focus after escape
 * @returns Cleanup function to remove listener
 *
 * @example
 * const cleanup = onEscapeKey(() => {
 *   closeModal();
 * }, buttonRef);
 */
export function onEscapeKey(
  callback: () => void,
  focusElement?: HTMLElement | null
): () => void {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback();
      focusElement?.focus();
    }
  };

  document.addEventListener('keydown', handleKeydown);
  return () => document.removeEventListener('keydown', handleKeydown);
}

/**
 * Create a throttled scroll listener
 * @param callback - Called when scroll occurs (throttled)
 * @param delay - Throttle delay in ms (default: 50)
 * @returns Cleanup function to remove listener
 *
 * @example
 * const cleanup = onScroll(() => {
 *   closeDropdown();
 * }, 100);
 */
export function onScroll(callback: () => void, delay = 50): () => void {
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;

  const handleScroll = () => {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
      callback();
      throttleTimer = null;
    }, delay);
  };

  window.addEventListener('scroll', handleScroll, true);

  return () => {
    window.removeEventListener('scroll', handleScroll, true);
    if (throttleTimer) {
      clearTimeout(throttleTimer);
    }
  };
}

/**
 * Focus an element safely
 * @param element - Element to focus
 */
export function focusElement(element: HTMLElement | null | undefined): void {
  element?.focus();
}

/**
 * Check if element contains another element/node
 * @param parent - Parent element
 * @param child - Child node to check
 * @returns true if parent contains child
 */
export function containsNode(
  parent: HTMLElement | null,
  child: Node | null
): boolean {
  if (!parent || !child) return false;
  return parent.contains(child);
}
