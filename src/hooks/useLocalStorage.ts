import { createSignal, createEffect, onCleanup, type Accessor } from 'solid-js';
import { getStorageItem, setStorageItem } from '../utils/storage';

/**
 * Custom hook for managing state persisted in localStorage
 * @param key - Storage key
 * @param initialValue - Initial value if nothing is stored
 * @returns [value, setValue, removeValue] tuple
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [Accessor<T>, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from storage or use provided initial value
  const [storedValue, setStoredValue] = createSignal<T>(
    getStorageItem(key, initialValue)
  );

  // Wrapper for setValue that persists to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue()) : value;
    setStoredValue(() => valueToStore);
    setStorageItem(key, valueToStore);
  };

  // Remove value from storage
  const removeValue = () => {
    localStorage.removeItem(key);
    setStoredValue(() => initialValue);
  };

  // Listen for storage changes from other tabs
  createEffect(() => {
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
