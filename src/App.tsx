import { memo, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { SkipLink } from './components/SkipLink';
import { NavigationLayout } from './components/navigation';
import { Loader } from './components/ui';
import { LanguageProvider } from './i18n';
import { ThemeProvider, AppsProvider, useApps } from './hooks';

// Critical pages - direct imports for instant loading
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Tool pages - lazy loaded for code splitting
const Metronome = lazy(() => import('./pages/Metronome'));
const Drum = lazy(() => import('./pages/Drum'));
const DrumSynth = lazy(() => import('./pages/DrumSynth'));
const QR = lazy(() => import('./pages/QR'));

// Category pages - lazy loaded
const MusicTools = lazy(() => import('./pages/MusicTools'));
const OtherTools = lazy(() => import('./pages/OtherTools'));
const CombinedTools = lazy(() => import('./pages/CombinedTools'));

// Combined tool pages - lazy loaded
const DrumTool = lazy(() => import('./pages/DrumTool'));

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
    <div className="flex items-center justify-center min-h-[200px] [contain:layout_style]">
      <Loader size="lg" />
    </div>
  );
}

/**
 * Base route configuration (English - default language)
 */
const BASE_ROUTES = [
  { path: '/', element: <Home /> },
  { path: '/music-tools', element: <MusicTools /> },
  { path: '/other-tools', element: <OtherTools /> },
  { path: '/combined-tools', element: <CombinedTools /> },
  { path: '/metronome', element: <Metronome /> },
  { path: '/drum', element: <Drum /> },
  { path: '/drum-synth', element: <DrumSynth /> },
  { path: '/drum-tool', element: <DrumTool /> },
  { path: '/qr', element: <QR /> },
  { path: '/sitemap', element: <Sitemap /> },
  { path: '/opensource', element: <OpenSource /> },
  { path: '/tools-used', element: <ToolsUsed /> },
  { path: '/downloads', element: <Downloads /> },
  { path: '/privacy', element: <Privacy /> },
  { path: '/terms', element: <Terms /> },
] as const;

/**
 * Korean language prefix
 */
const KO_PREFIX = '/ko';

/**
 * Generate routes for both English (default) and Korean (/ko prefix)
 */
const ROUTES = [
  // English routes (default)
  ...BASE_ROUTES,
  // Korean routes (/ko prefix)
  ...BASE_ROUTES.map((route) => ({
    ...route,
    path: route.path === '/' ? KO_PREFIX : KO_PREFIX + route.path,
  })),
  // 404 - must be last
  { path: '*', element: <NotFound /> },
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
      <main
        id="main-content"
        role="main"
        style={{ viewTransitionName: 'main-content' }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
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
