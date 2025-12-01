import { useState, useCallback, useEffect } from 'react';
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
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from storage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getStorageItem(key, initialValue);
  });

  // Wrapper for setValue that persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        setStorageItem(key, valueToStore);
        return valueToStore;
      });
    },
    [key]
  );

  // Remove value from storage
  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          // Invalid JSON, ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
