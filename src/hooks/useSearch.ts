import { createSignal, createMemo, type Accessor } from 'solid-js';
import { useDebounce } from './useDebounce';

interface UseSearchOptions<T> {
  /** Keys to search in (for object arrays) */
  keys?: (keyof T)[];
  /** Debounce delay in ms (default: 300) */
  debounceDelay?: number;
  /** Case sensitive search (default: false) */
  caseSensitive?: boolean;
}

interface UseSearchReturn<T> {
  /** Current search query */
  query: Accessor<string>;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Debounced search query */
  debouncedQuery: Accessor<string>;
  /** Filtered results */
  results: Accessor<T[]>;
  /** Whether search is active (query is not empty) */
  isSearching: Accessor<boolean>;
  /** Clear search query */
  clearSearch: () => void;
}

/**
 * Custom hook for searchable lists with debounced filtering
 * @param items - Array of items to search
 * @param options - Search options
 * @returns Search state and filtered results
 */
export function useSearch<T>(
  items: Accessor<T[]>,
  options: UseSearchOptions<T> = {}
): UseSearchReturn<T> {
  const { keys, debounceDelay = 300, caseSensitive = false } = options;

  const [query, setQuery] = createSignal('');
  const debouncedQuery = useDebounce(query, debounceDelay);

  const isSearching = createMemo(() => debouncedQuery().trim().length > 0);

  const results = createMemo(() => {
    const searchQuery = debouncedQuery().trim();

    if (!searchQuery) {
      return items();
    }

    const normalizedQuery = caseSensitive
      ? searchQuery
      : searchQuery.toLowerCase();

    return items().filter((item) => {
      if (typeof item === 'string') {
        const value = caseSensitive ? item : item.toLowerCase();
        return value.includes(normalizedQuery);
      }

      if (typeof item === 'object' && item !== null) {
        const searchKeys = keys ?? (Object.keys(item) as (keyof T)[]);
        return searchKeys.some((key) => {
          const value = item[key];
          if (typeof value === 'string') {
            const normalizedValue = caseSensitive
              ? value
              : value.toLowerCase();
            return normalizedValue.includes(normalizedQuery);
          }
          return false;
        });
      }

      return false;
    });
  });

  const clearSearch = () => setQuery('');

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    isSearching,
    clearSearch,
  };
}

/**
 * Simplified search hook for string arrays
 */
export function useStringSearch(
  items: Accessor<string[]>,
  debounceDelay = 300
): UseSearchReturn<string> {
  return useSearch(items, { debounceDelay });
}
