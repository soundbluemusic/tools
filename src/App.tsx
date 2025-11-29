import { memo, useCallback, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { LanguageToggle } from './components/LanguageToggle';
import { PWAPrompt } from './components/PWAPrompt';
import { LanguageProvider } from './i18n';
import './App.css';

// Direct imports for instant page loads - no lazy loading for small pages
import Home from './pages/Home';
import Metronome from './pages/Metronome';
import QR from './pages/QR';
import OpenSource from './pages/OpenSource';
import ToolsUsed from './pages/ToolsUsed';
import NotFound from './pages/NotFound';

/**
 * Route configuration for prefetching
 */
const ROUTES = [
  { path: '/', element: <Home /> },
  { path: '/metronome', element: <Metronome /> },
  { path: '/qr', element: <QR /> },
  { path: '/opensource', element: <OpenSource /> },
  { path: '/tools-used', element: <ToolsUsed /> },
  { path: '*', element: <NotFound /> },
] as const;

/**
 * Navigation wrapper with View Transitions API support
 */
function NavigationProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced navigation with View Transitions API
  const handleNavigation = useCallback(
    (to: string) => {
      // Check if View Transitions API is supported
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          navigate(to);
        });
      } else {
        navigate(to);
      }
    },
    [navigate]
  );

  // Expose navigation handler globally for Link components
  useEffect(() => {
    window.__navigate = handleNavigation;
    return () => {
      delete window.__navigate;
    };
  }, [handleNavigation]);

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
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <NavigationProvider>
            <main className="main-content">
              <Routes>
                {ROUTES.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
              </Routes>
            </main>
            <Footer />
            <LanguageToggle />
            <PWAPrompt />
          </NavigationProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;

// Type declaration for global navigation
declare global {
  interface Window {
    __navigate?: (to: string) => void;
    __DEBUG__?: {
      version: string;
      env: string;
    };
  }
}
