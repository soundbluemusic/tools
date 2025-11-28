import { Suspense, lazy, memo, useEffect } from 'react';
import { APPS } from './constants/apps';
import './App.css';

// Lazy load the grid for code splitting
const AppGrid = lazy(() => import('./components/AppGrid'));

// Loading fallback - minimal for fast initial paint
const GridSkeleton = memo(function GridSkeleton() {
  return (
    <div className="grid skeleton-grid" aria-busy="true" aria-label="Loading applications">
      {[1, 2, 3].map((i) => (
        <div key={i} className="app-card skeleton" aria-hidden="true">
          <span className="icon skeleton-icon" />
          <div className="app-info">
            <div className="name skeleton-text" />
            <div className="desc skeleton-text" />
          </div>
        </div>
      ))}
    </div>
  );
});

/**
 * App Component - Optimized root component
 * - Code splitting with React.lazy
 * - Suspense for loading states
 * - Memoized for render optimization
 */
const App = memo(function App() {
  // Performance monitoring in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Log performance metrics
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`[Perf] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }
      });
      observer.observe({ entryTypes: ['measure', 'longtask'] });

      // Mark initial render
      performance.mark('app-rendered');

      return () => observer.disconnect();
    }
  }, []);

  return (
    <main className="container" role="main">
      <h1 className="title">SoundBlue Apps</h1>
      <Suspense fallback={<GridSkeleton />}>
        <AppGrid apps={APPS} />
      </Suspense>
    </main>
  );
});

App.displayName = 'App';

export default App;