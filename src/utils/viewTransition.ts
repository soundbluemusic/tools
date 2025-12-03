/**
 * Pure View Transitions API utilities - no React dependency
 * Can be used in any TypeScript/JavaScript environment
 */

/**
 * Check if View Transitions API is supported
 * @returns true if browser supports View Transitions
 */
export function isViewTransitionSupported(): boolean {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof document.startViewTransition === 'function'
  );
}

/**
 * Execute a callback with View Transitions if supported
 * Falls back to direct execution if not supported
 *
 * @param callback - Function to execute (typically a navigation)
 * @returns ViewTransition object if supported, undefined otherwise
 *
 * @example
 * // With navigation function
 * startViewTransition(() => {
 *   window.location.href = '/new-page';
 * });
 *
 * // With state update
 * startViewTransition(() => {
 *   updateState(newValue);
 * });
 */
export function startViewTransition(
  callback: () => void | Promise<void>
): ViewTransition | undefined {
  if (isViewTransitionSupported()) {
    return document.startViewTransition(callback);
  }
  // Fallback: execute callback directly
  callback();
  return undefined;
}

/**
 * Create a navigation function that uses View Transitions
 * @param navigateFn - The actual navigation function to wrap
 * @returns Wrapped navigation function with View Transitions support
 *
 * @example
 * const navigate = createTransitionNavigate((path) => {
 *   router.push(path);
 * });
 * navigate('/about');
 */
export function createTransitionNavigate<
  T extends (...args: unknown[]) => void,
>(navigateFn: T): T {
  return ((...args: Parameters<T>) => {
    startViewTransition(() => {
      navigateFn(...args);
    });
  }) as T;
}
