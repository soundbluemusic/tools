import { Suspense, lazy, memo, useEffect, useState, useMemo, useCallback, useTransition } from 'react';
import { APPS } from './constants/apps';
import './App.css';

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

  // Memoized filtered apps based on search query
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return APPS;
    const query = searchQuery.toLowerCase().trim();
    return APPS.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.desc.toLowerCase().includes(query)
    );
  }, [searchQuery]);

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

  return (
    <main className="container" role="main">
      <header className="header">
        <h1 className="title">tools</h1>
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
