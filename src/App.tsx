import { memo, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { SkipLink } from './components/SkipLink';
import { NavigationLayout } from './components/navigation';
import { Loader } from './components/ui';
import { LanguageProvider } from './i18n';
import { ThemeProvider, AppsProvider, useApps } from './hooks';
import './App.css';

// Critical pages - direct imports for instant loading
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Tool pages - lazy loaded for code splitting
const Metronome = lazy(() => import('./pages/Metronome'));
const Drum = lazy(() => import('./pages/Drum'));
const DrumSynth = lazy(() => import('./pages/DrumSynth'));
const QR = lazy(() => import('./pages/QR'));

// Info pages - lazy loaded (rarely visited)
const Sitemap = lazy(() => import('./pages/Sitemap'));
const OpenSource = lazy(() => import('./pages/OpenSource'));
const ToolsUsed = lazy(() => import('./pages/ToolsUsed'));
const Downloads = lazy(() => import('./pages/Downloads'));

// Legal pages - lazy loaded
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

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
  { path: '/drum-synth', element: <DrumSynth />, lazy: true },
  { path: '/qr', element: <QR />, lazy: true },
  { path: '/sitemap', element: <Sitemap />, lazy: true },
  { path: '/opensource', element: <OpenSource />, lazy: true },
  { path: '/tools-used', element: <ToolsUsed />, lazy: true },
  { path: '/downloads', element: <Downloads />, lazy: true },
  { path: '/privacy', element: <Privacy />, lazy: true },
  { path: '/terms', element: <Terms />, lazy: true },
  { path: '*', element: <NotFound />, lazy: false },
] as const;

/**
 * Navigation wrapper handling scroll restoration on route changes
 * View Transitions are handled by useViewTransition hook in components
 */
function ScrollToTop({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <>{children}</>;
}

/**
 * App content with navigation layout
 * Uses apps context for navigation sidebar and command palette
 */
function AppContent() {
  const { apps } = useApps();

  return (
    <NavigationLayout apps={apps}>
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
    </NavigationLayout>
  );
}

/**
 * Main Application Component
 * Optimized for instant page transitions with responsive navigation
 */
const App = memo(function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AppsProvider>
            <ErrorBoundary>
              <ScrollToTop>
                <AppContent />
              </ScrollToTop>
            </ErrorBoundary>
          </AppsProvider>
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
