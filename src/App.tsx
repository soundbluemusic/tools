import { Suspense, lazy, memo, useEffect, useState, useMemo, useCallback, useTransition } from 'react';
import { APPS } from './constants/apps';
import type { App } from './types';
import './App.css';

type SortOption = 'name-asc' | 'name-desc' | 'name-long' | 'name-short' | 'size-large' | 'size-small';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: '이름순 (A-Z)' },
  { value: 'name-desc', label: '이름역순 (Z-A)' },
  { value: 'name-long', label: '이름 긴 순' },
  { value: 'name-short', label: '이름 짧은 순' },
  { value: 'size-large', label: '용량 큰 순' },
  { value: 'size-small', label: '용량 작은 순' },
];

const sortApps = (apps: readonly App[], sortBy: SortOption): readonly App[] => {
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
};

// Lazy load the grid for code splitting
const AppList = lazy(() => import('./components/AppList'));

// Loading fallback - minimal for fast initial paint
const ListSkeleton = memo(function ListSkeleton() {
  return (
    <div className="app-list skeleton-list" aria-busy="true" aria-label="Loading applications">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="app-item skeleton" aria-hidden="true">
          <div className="skeleton-text" />
        </div>
      ))}
    </div>
  );
});

/**
 * App Component - Optimized root component
 * - Search functionality with useTransition for smooth UX
 * - Code splitting with React.lazy
 * - Suspense for loading states
 * - Memoized for render optimization
 */
const App = memo(function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [isPending, startTransition] = useTransition();

  // Performance monitoring in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`[Perf] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }
      });
      observer.observe({ entryTypes: ['measure', 'longtask'] });
      performance.mark('app-rendered');
      return () => observer.disconnect();
    }
  }, []);

  // Memoized filtered and sorted apps
  const filteredApps = useMemo(() => {
    let apps = APPS;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      apps = APPS.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.desc.toLowerCase().includes(query)
      );
    }
    return sortApps(apps, sortBy);
  }, [searchQuery, sortBy]);

  // Handle search input with transition for smooth UI
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setSearchQuery(e.target.value);
    });
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      setSortBy(e.target.value as SortOption);
    });
  }, []);

  return (
    <main className="container" role="main">
      <header className="header">
        <h1 className="title">tools</h1>
        <div className="controls">
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

      <Suspense fallback={<ListSkeleton />}>
        <AppList apps={filteredApps} isPending={isPending} />
      </Suspense>

      {filteredApps.length === 0 && searchQuery && (
        <p className="no-results">No tools found for "{searchQuery}"</p>
      )}
    </main>
  );
});

App.displayName = 'App';

export default App;
