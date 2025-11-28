import { Suspense, lazy, memo, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageLoader } from './components/ui/Loader';
import './App.css';

// Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Contract = lazy(() => import('./pages/Contract'));
const Metronome = lazy(() => import('./pages/Metronome'));
const QR = lazy(() => import('./pages/QR'));

// 404 Not Found page
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * Performance monitoring hook for development
 */
function usePerformanceMonitoring(): void {
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
}

/**
 * Main Application Component
 * Handles routing and global error boundaries
 */
const App = memo(function App() {
  usePerformanceMonitoring();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contract" element={<Contract />} />
            <Route path="/metronome" element={<Metronome />} />
            <Route path="/qr" element={<QR />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;
