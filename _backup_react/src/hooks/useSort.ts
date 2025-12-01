import { useState, useMemo, useCallback } from 'react';

type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

interface UseSortOptions<T> {
  /** Initial sort configuration */
  initialSort?: SortConfig<T>;
  /** Locale for string comparison (default: 'ko') */
  locale?: string;
}

interface UseSortResult<T> {
  /** Current sort configuration */
  sortConfig: SortConfig<T> | null;
  /** Sorted items */
  sortedItems: readonly T[];
  /** Set sort configuration */
  setSortConfig: (config: SortConfig<T> | null) => void;
  /** Sort by a specific key (toggles direction) */
  sortBy: (key: keyof T) => void;
  /** Clear sorting */
  clearSort: () => void;
  /** Check if a key is currently sorted */
  isSortedBy: (key: keyof T) => boolean;
  /** Get sort direction for a key */
  getSortDirection: (key: keyof T) => SortDirection | null;
}

/**
 * Custom hook for sortable lists
 */
export function useSort<T extends Record<string, unknown>>(
  items: readonly T[],
  options: UseSortOptions<T> = {}
): UseSortResult<T> {
  const { initialSort = null, locale = 'ko' } = options;

  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    initialSort
  );

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;

    const { key, direction } = sortConfig;
    const modifier = direction === 'asc' ? 1 : -1;

    return [...items].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // String comparison with locale
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue, locale) * modifier;
      }

      // Number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * modifier;
      }

      // Fallback to string conversion
      return String(aValue).localeCompare(String(bValue), locale) * modifier;
    });
  }, [items, sortConfig, locale]);

  const sortBy = useCallback((key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        // Toggle direction
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      // New sort key, default to ascending
      return { key, direction: 'asc' };
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  const isSortedBy = useCallback(
    (key: keyof T) => sortConfig?.key === key,
    [sortConfig]
  );

  const getSortDirection = useCallback(
    (key: keyof T): SortDirection | null => {
      if (sortConfig?.key === key) {
        return sortConfig.direction;
      }
      return null;
    },
    [sortConfig]
  );

  return {
    sortConfig,
    sortedItems,
    setSortConfig,
    sortBy,
    clearSort,
    isSortedBy,
    getSortDirection,
  };
}
