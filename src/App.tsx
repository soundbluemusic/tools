import { memo, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { LanguageToggle } from './components/LanguageToggle';
import { ThemeToggle } from './components/ThemeToggle';
import { SkipLink } from './components/SkipLink';
import { Loader } from './components/ui';
import { LanguageProvider } from './i18n';
import { ThemeProvider } from './hooks';
import './App.css';

// Critical pages - direct imports for instant loading
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Tool pages - lazy loaded for code splitting
const Metronome = lazy(() => import('./pages/Metronome'));
const Drum = lazy(() => import('./pages/Drum'));
const QR = lazy(() => import('./pages/QR'));

// Info pages - lazy loaded (rarely visited)
const Sitemap = lazy(() => import('./pages/Sitemap'));
const OpenSource = lazy(() => import('./pages/OpenSource'));
const ToolsUsed = lazy(() => import('./pages/ToolsUsed'));

/**
 * Loading fallback for lazy-loaded pages
 */
function PageLoader() {
  return (
    <div className="page-loader">
      <Loader size="lg" />
    </div>
  );
}

/**
 * Route configuration with lazy loading support
 */
const ROUTES = [
  { path: '/', element: <Home />, lazy: false },
  { path: '/metronome', element: <Metronome />, lazy: true },
  { path: '/drum', element: <Drum />, lazy: true },
  { path: '/qr', element: <QR />, lazy: true },
  { path: '/sitemap', element: <Sitemap />, lazy: true },
  { path: '/opensource', element: <OpenSource />, lazy: true },
  { path: '/tools-used', element: <ToolsUsed />, lazy: true },
  { path: '*', element: <NotFound />, lazy: false },
] as const;

/**
 * Navigation wrapper handling scroll restoration on route changes
 * View Transitions are handled by useViewTransition hook in components
 */
function NavigationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <>{children}</>;
}

/**
 * Main Application Component
 * Optimized for instant page transitions
 */
const App = memo(function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <ErrorBoundary>
            <NavigationProvider>
              <SkipLink />
              <main id="main-content" className="main-content" role="main">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {ROUTES.map((route) => (
                      <Route key={route.path} path={route.path} element={route.element} />
                    ))}
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <ThemeToggle />
              <LanguageToggle />
            </NavigationProvider>
          </ErrorBoundary>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
});

App.displayName = 'App';

export default App;

// Type declaration for debug utilities
declare global {
  interface Window {
    __DEBUG__?: {
      version: string;
      env: string;
    };
  }
}
