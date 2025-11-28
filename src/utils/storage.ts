/**
 * Type-safe localStorage wrapper with error handling
 */

type StorageType = 'local' | 'session';

function getStorage(type: StorageType): Storage | null {
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    // Test if storage is available
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

/**
 * Generic wrapper for safe storage operations
 * Consolidates duplicate try-catch error handling
 *
 * @param operation - Storage operation to execute
 * @param fallback - Fallback value if operation fails
 * @returns Operation result or fallback
 */
function safeStorageOperation<T>(operation: () => T, fallback: T): T {
  try {
    return operation();
  } catch {
    return fallback;
  }
}

/**
 * Get a value from storage with type safety
 */
export function getStorageItem<T>(
  key: string,
  defaultValue: T,
  type: StorageType = 'local'
): T {
  const storage = getStorage(type);
  if (!storage) return defaultValue;

  return safeStorageOperation(() => {
    const item = storage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  }, defaultValue);
}

/**
 * Set a value in storage with type safety
 */
export function setStorageItem<T>(
  key: string,
  value: T,
  type: StorageType = 'local'
): boolean {
  const storage = getStorage(type);
  if (!storage) return false;

  return safeStorageOperation(() => {
    storage.setItem(key, JSON.stringify(value));
    return true;
  }, false);
}

/**
 * Remove a value from storage
 */
export function removeStorageItem(
  key: string,
  type: StorageType = 'local'
): boolean {
  const storage = getStorage(type);
  if (!storage) return false;

  return safeStorageOperation(() => {
    storage.removeItem(key);
    return true;
  }, false);
}

/**
 * Clear all items from storage
 */
export function clearStorage(type: StorageType = 'local'): boolean {
  const storage = getStorage(type);
  if (!storage) return false;

  return safeStorageOperation(() => {
    storage.clear();
    return true;
  }, false);
}
