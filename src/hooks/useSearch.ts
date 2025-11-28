import { useState, useMemo, useCallback, useDeferredValue } from 'react';

interface UseSearchOptions<T> {
  /** Fields to search in */
  searchFields: (keyof T)[];
  /** Initial search query */
  initialQuery?: string;
  /** Minimum characters before searching */
  minChars?: number;
  /** Case-sensitive search */
  caseSensitive?: boolean;
}

interface UseSearchResult<T> {
  /** Current search query */
  query: string;
  /** Deferred query for performance */
  deferredQuery: string;
  /** Whether search is pending */
  isPending: boolean;
  /** Filtered results */
  results: readonly T[];
  /** Set search query */
  setQuery: (query: string) => void;
  /** Clear search */
  clearSearch: () => void;
  /** Total result count */
  resultCount: number;
}

/**
 * Custom hook for searchable lists with performance optimization
 */
export function useSearch<T extends Record<string, unknown>>(
  items: readonly T[],
  options: UseSearchOptions<T>
): UseSearchResult<T> {
  const {
    searchFields,
    initialQuery = '',
    minChars = 1,
    caseSensitive = false,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);
  const isPending = query !== deferredQuery;

  const results = useMemo(() => {
    const trimmedQuery = deferredQuery.trim();

    if (trimmedQuery.length < minChars) {
      return items;
    }

    const searchTerm = caseSensitive
      ? trimmedQuery
      : trimmedQuery.toLowerCase();

    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value !== 'string') return false;
        const fieldValue = caseSensitive ? value : value.toLowerCase();
        return fieldValue.includes(searchTerm);
      })
    );
  }, [items, deferredQuery, searchFields, minChars, caseSensitive]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    deferredQuery,
    isPending,
    results,
    setQuery,
    clearSearch,
    resultCount: results.length,
  };
}
