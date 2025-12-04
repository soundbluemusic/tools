import { createSignal, createEffect, onCleanup, type Accessor } from 'solid-js';

/**
 * Custom hook that debounces a value
 * @param value - Value accessor to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns Debounced value accessor
 */
export function useDebounce<T>(value: Accessor<T>, delay = 300): Accessor<T> {
  const [debouncedValue, setDebouncedValue] = createSignal<T>(value());

  createEffect(() => {
    const currentValue = value();
    const timer = setTimeout(() => {
      setDebouncedValue(() => currentValue);
    }, delay);

    onCleanup(() => clearTimeout(timer));
  });

  return debouncedValue;
}

/**
 * Custom hook that returns a debounced callback function
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns Debounced callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Cleanup on unmount
  onCleanup(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
