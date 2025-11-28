import {
  memo,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  useTransition,
} from 'react';
import { Link } from 'react-router-dom';
import { APPS } from '../constants/apps';
import { SORT_OPTIONS } from '../constants/sortOptions';
import AppList from '../components/AppList';
import type { App, SortOption } from '../types';

/**
 * Sort apps based on selected option
 * Uses stable sort for consistent ordering
 */
function sortApps(apps: readonly App[], sortBy: SortOption): readonly App[] {
  const sorted = [...apps];

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'ko'));
    case 'name-long':
      return sorted.sort((a, b) => b.name.length - a.name.length);
    case 'name-short':
      return sorted.sort((a, b) => a.name.length - b.name.length);
    case 'size-large':
      return sorted.sort((a, b) => b.size - a.size);
    case 'size-small':
      return sorted.sort((a, b) => a.size - b.size);
    default:
      return apps;
  }
}

/**
 * Home Page Component
 * Displays a searchable and sortable list of tools
 * Optimized for instant interactions
 */
const Home = memo(function Home() {
  // Search state with deferred value for smooth typing
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Sort state with transition for non-blocking updates
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [isPending, startTransition] = useTransition();

  // Filter and sort apps - only recompute when inputs change
  const filteredApps = useMemo(() => {
    let apps = APPS;

    // Apply search filter
    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase().trim();
      apps = APPS.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.desc.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    return sortApps(apps, sortBy);
  }, [deferredSearchQuery, sortBy]);

  // Optimized search handler - immediate state update
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Sort change with transition for smooth UI
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      startTransition(() => {
        setSortBy(e.target.value as SortOption);
      });
    },
    []
  );

  // Check if search is pending
  const isSearchPending = searchQuery !== deferredSearchQuery;

  return (
    <main className="container home-page" role="main">
      {/* Header */}
      <header className="header">
        <Link to="/" className="title-link">
          <h1 className="title">tools</h1>
        </Link>

        {/* Search and Sort Controls */}
        <div className="controls">
          {/* Search Input */}
          <div className="search-container">
            <input
              type="search"
              className="search-input"
              placeholder="검색..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="도구 검색"
              autoComplete="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={handleClearSearch}
                aria-label="검색어 지우기"
                type="button"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            className="sort-dropdown"
            value={sortBy}
            onChange={handleSortChange}
            aria-label="정렬 방식"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* App List - Direct render without Suspense */}
      <AppList apps={filteredApps} isPending={isSearchPending || isPending} />

      {/* No Results Message */}
      {filteredApps.length === 0 && searchQuery && (
        <p className="no-results">
          "{searchQuery}"에 대한 검색 결과가 없습니다
        </p>
      )}
    </main>
  );
});

Home.displayName = 'Home';

export default Home;
