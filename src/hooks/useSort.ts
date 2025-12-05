import { createSignal, createMemo, type Accessor } from 'solid-js';

type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
  key: keyof T | ((item: T) => string | number);
  direction: SortDirection;
}

interface UseSortOptions<T> {
  /** Initial sort key */
  initialKey?: keyof T | ((item: T) => string | number);
  /** Initial sort direction (default: 'asc') */
  initialDirection?: SortDirection;
  /** Locale for string comparison (default: 'en') */
  locale?: string;
}

interface UseSortReturn<T> {
  /** Current sort configuration */
  sortConfig: Accessor<SortConfig<T> | null>;
  /** Sorted items */
  sortedItems: Accessor<T[]>;
  /** Set sort by key */
  sortBy: (key: keyof T | ((item: T) => string | number)) => void;
  /** Toggle sort direction */
  toggleDirection: () => void;
  /** Set sort direction */
  setDirection: (direction: SortDirection) => void;
  /** Reset sort to initial state */
  resetSort: () => void;
  /** Check if currently sorted by key */
  isSortedBy: (key: keyof T | ((item: T) => string | number)) => boolean;
}

/**
 * Custom hook for sorting arrays
 * @param items - Array of items to sort
 * @param options - Sort options
 * @returns Sort state and sorted items
 */
export function useSort<T>(
  items: Accessor<T[]>,
  options: UseSortOptions<T> = {}
): UseSortReturn<T> {
  const { initialKey, initialDirection = 'asc', locale = 'en' } = options;

  const [sortConfig, setSortConfig] = createSignal<SortConfig<T> | null>(
    initialKey ? { key: initialKey, direction: initialDirection } : null
  );

  const sortedItems = createMemo(() => {
    const config = sortConfig();
    if (!config) {
      return items();
    }

    const sorted = [...items()];
    const { key, direction } = config;

    sorted.sort((a, b) => {
      const aValue = typeof key === 'function' ? key(a) : a[key];
      const bValue = typeof key === 'function' ? key(b) : b[key];

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, locale);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), locale);
      }

      return direction === 'desc' ? -comparison : comparison;
    });

    return sorted;
  });

  const sortBy = (key: keyof T | ((item: T) => string | number)) => {
    const current = sortConfig();

    if (current && current.key === key) {
      // Toggle direction if same key
      setSortConfig({
        key,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // New key, start with ascending
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const toggleDirection = () => {
    const current = sortConfig();
    if (current) {
      setSortConfig({
        ...current,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
    }
  };

  const setDirection = (direction: SortDirection) => {
    const current = sortConfig();
    if (current) {
      setSortConfig({ ...current, direction });
    }
  };

  const resetSort = () => {
    setSortConfig(
      initialKey ? { key: initialKey, direction: initialDirection } : null
    );
  };

  const isSortedBy = (key: keyof T | ((item: T) => string | number)) => {
    const current = sortConfig();
    return current?.key === key;
  };

  return {
    sortConfig,
    sortedItems,
    sortBy,
    toggleDirection,
    setDirection,
    resetSort,
    isSortedBy,
  };
}
