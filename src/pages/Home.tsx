import {
  Suspense,
  lazy,
  memo,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
} from 'react';
import { APPS } from '../constants/apps';
import { SORT_OPTIONS } from '../constants/sortOptions';
import { SkeletonList } from '../components/ui/Skeleton';
import type { App, SortOption } from '../types';

// Lazy load AppList for code splitting
const AppList = lazy(() => import('../components/AppList'));

/**
 * Sort apps based on selected option
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
 */
const Home = memo(function Home() {
  // Search state with deferred value for performance
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isPending = searchQuery !== deferredSearchQuery;

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  // Filter and sort apps
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

  // Event handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortBy(e.target.value as SortOption);
    },
    []
  );

  return (
    <main className="container" role="main">
      {/* Header */}
      <header className="header">
        <h1 className="title">tools</h1>

        {/* Search and Sort Controls */}
        <div className="controls">
          {/* Search Input */}
          <div className="search-container">
            <input
              type="search"
              className="search-input"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search tools"
              autoComplete="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search"
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
            aria-label="Sort apps"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* App List */}
      <Suspense fallback={<SkeletonList count={5} />}>
        <AppList apps={filteredApps} isPending={isPending} />
      </Suspense>

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
