/**
 * Pure sorting utility functions - no React dependency
 * Can be used in any TypeScript/JavaScript environment
 */

import type { App, SortOption } from '../types';
import type { Language } from '../i18n/types';

/**
 * Sort apps based on selected option
 * Uses locale-aware string comparison for name sorting
 *
 * @param apps - Array of apps to sort
 * @param sortBy - Sort option
 * @param language - Current language for locale-aware sorting
 * @returns Sorted array (new array, does not mutate input)
 *
 * @example
 * const sorted = sortApps(apps, 'name-asc', 'ko');
 */
export function sortApps(
  apps: readonly App[],
  sortBy: SortOption,
  language: Language
): readonly App[] {
  const sorted = [...apps];
  const locale = language === 'ko' ? 'ko' : 'en';

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) =>
        a.name[language].localeCompare(b.name[language], locale)
      );
    case 'name-desc':
      return sorted.sort((a, b) =>
        b.name[language].localeCompare(a.name[language], locale)
      );
    case 'name-long':
      return sorted.sort(
        (a, b) => b.name[language].length - a.name[language].length
      );
    case 'name-short':
      return sorted.sort(
        (a, b) => a.name[language].length - b.name[language].length
      );
    case 'size-large':
      return sorted.sort((a, b) => b.size - a.size);
    case 'size-small':
      return sorted.sort((a, b) => a.size - b.size);
    default:
      return apps;
  }
}

/**
 * Generic sort function for arrays
 * @param arr - Array to sort
 * @param compareFn - Comparison function
 * @returns New sorted array
 */
export function sortBy<T>(
  arr: readonly T[],
  compareFn: (a: T, b: T) => number
): T[] {
  return [...arr].sort(compareFn);
}

/**
 * Sort by property value (ascending)
 * @param key - Property key to sort by
 * @returns Comparison function
 */
export function byProperty<T>(key: keyof T): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  };
}

/**
 * Reverse a comparison function (descending)
 * @param compareFn - Comparison function to reverse
 * @returns Reversed comparison function
 */
export function descending<T>(
  compareFn: (a: T, b: T) => number
): (a: T, b: T) => number {
  return (a: T, b: T) => -compareFn(a, b);
}
