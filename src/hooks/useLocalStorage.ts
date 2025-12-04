import { createSignal, createEffect, onCleanup, type Accessor } from 'solid-js';
import { isServer } from 'solid-js/web';
import { getStorageItem, setStorageItem } from '../utils/storage';

/**
 * Custom hook for managing state persisted in localStorage
 * @param key - Storage key
 * @param initialValue - Initial value if nothing is stored
 * @returns [value, setValue, removeValue] tuple
 *
 * Hydration-safe: Uses consistent initial value, updates after mount
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [Accessor<T>, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from storage or use provided initial value
  // Use initialValue directly on server for consistent hydration
  const [storedValue, setStoredValue] = createSignal<T>(
    isServer ? initialValue : getStorageItem(key, initialValue)
  );

  // Wrapper for setValue that persists to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    const valueToStore =
      value instanceof Function ? value(storedValue()) : value;
    setStoredValue(() => valueToStore);
    if (!isServer) {
      setStorageItem(key, valueToStore);
    }
  };

  // Remove value from storage
  const removeValue = () => {
    if (!isServer && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
    setStoredValue(() => initialValue);
  };

  // Listen for storage changes from other tabs
  createEffect(() => {
    if (isServer) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(() => JSON.parse(e.newValue!) as T);
        } catch {
          // Invalid JSON, ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    onCleanup(() => window.removeEventListener('storage', handleStorageChange));
  });

  return [storedValue, setValue, removeValue];
}
