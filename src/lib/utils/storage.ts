/**
 * Type-safe localStorage wrapper with error handling and runtime validation
 */

type StorageType = 'local' | 'session';

/**
 * Validator function type for runtime type checking
 * Returns true if the value matches the expected type
 */
export type Validator<T> = (value: unknown) => value is T;

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
 * Options for getStorageItem
 */
interface GetStorageOptions<T> {
  /** Storage type (local or session) */
  type?: StorageType;
  /** Optional validator function for runtime type checking */
  validator?: Validator<T>;
}

/**
 * Get a value from storage with type safety and optional runtime validation
 *
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or validation fails
 * @param options - Storage options including type and validator
 * @returns The stored value or default value
 *
 * @example
 * // Without validation (backwards compatible)
 * const value = getStorageItem('key', 'default');
 *
 * @example
 * // With validator function
 * const isLanguage = (v: unknown): v is 'ko' | 'en' =>
 *   v === 'ko' || v === 'en';
 * const lang = getStorageItem('lang', 'ko', { validator: isLanguage });
 */
export function getStorageItem<T>(
  key: string,
  defaultValue: T,
  options: GetStorageOptions<T> | StorageType = 'local'
): T {
  // Handle backwards compatibility: options can be StorageType string
  const opts: GetStorageOptions<T> =
    typeof options === 'string' ? { type: options } : options;
  const { type = 'local', validator } = opts;

  const storage = getStorage(type);
  if (!storage) return defaultValue;

  return safeStorageOperation(() => {
    const item = storage.getItem(key);
    if (item === null) return defaultValue;

    const parsed: unknown = JSON.parse(item);

    // If validator is provided, use it for runtime type checking
    if (validator) {
      return validator(parsed) ? parsed : defaultValue;
    }

    // Without validator, return as T (existing behavior)
    return parsed as T;
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

// ============================================
// Common Validators
// ============================================

/**
 * Creates a validator that checks if a value is one of the allowed values
 *
 * @example
 * const isLanguage = createEnumValidator(['ko', 'en'] as const);
 * getStorageItem('lang', 'ko', { validator: isLanguage });
 */
export function createEnumValidator<T extends readonly unknown[]>(
  allowedValues: T
): Validator<T[number]> {
  return (value: unknown): value is T[number] =>
    allowedValues.includes(value as T[number]);
}

/**
 * Validator for string type
 */
export const isString: Validator<string> = (value: unknown): value is string =>
  typeof value === 'string';

/**
 * Validator for number type
 */
export const isNumber: Validator<number> = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

/**
 * Validator for boolean type
 */
export const isBoolean: Validator<boolean> = (
  value: unknown
): value is boolean => typeof value === 'boolean';

/**
 * Creates a validator for an object with specific shape
 *
 * @example
 * const isSettings = createObjectValidator({
 *   theme: isString,
 *   volume: isNumber,
 * });
 */
export function createObjectValidator<T extends Record<string, unknown>>(
  shape: { [K in keyof T]: Validator<T[K]> }
): Validator<T> {
  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null) return false;
    const obj = value as Record<string, unknown>;
    return Object.entries(shape).every(([key, validator]) =>
      (validator as Validator<unknown>)(obj[key])
    );
  };
}
