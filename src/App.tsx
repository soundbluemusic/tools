import { Suspense, lazy, memo, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Contract = lazy(() => import('./pages/Contract'));
const Metronome = lazy(() => import('./pages/Metronome'));
const QR = lazy(() => import('./pages/QR'));

// Loading fallback
const PageLoader = memo(function PageLoader() {
  return (
    <div className="page-loader" aria-busy="true">
      <div className="loader-spinner" />
    </div>
  );
});

const App = memo(function App() {
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

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contract" element={<Contract />} />
          <Route path="/metronome" element={<Metronome />} />
          <Route path="/qr" element={<QR />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
});

App.displayName = 'App';

export default App;
