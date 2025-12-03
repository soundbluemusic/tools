/**
 * ReactApp - Astro용 React 앱 래퍼
 *
 * 각 Astro 페이지에서 이 컴포넌트를 client:only="react"로 로드합니다.
 * 이전의 React Router 기반 App.tsx를 대체합니다.
 *
 * IMPORTANT: children은 Astro에서 client:only로 전달 시 hydration 문제가 있어
 * page prop으로 페이지 식별자를 받아서 내부에서 렌더링합니다.
 */
import { memo, useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { SkipLink } from './SkipLink';
import { ThemeProvider } from '../hooks/useTheme';
import { LanguageProvider } from '../i18n/context';
import type { App } from '../types';
import { commonKo, commonEn } from '../i18n/translations/common';
import '../App.css';

// Lazy load all page components for code splitting
const HomePage = lazy(() => import('../react-pages/Home'));
const MetronomePage = lazy(() => import('../react-pages/Metronome'));
const DrumPage = lazy(() => import('../react-pages/Drum'));
const DrumSynthPage = lazy(() => import('../react-pages/DrumSynth'));
const QRPage = lazy(() => import('../react-pages/QR'));
const SitemapPage = lazy(() => import('../react-pages/Sitemap'));
const OpenSourcePage = lazy(() => import('../react-pages/OpenSource'));
const ToolsUsedPage = lazy(() => import('../react-pages/ToolsUsed'));
const DownloadsPage = lazy(() => import('../react-pages/Downloads'));
const PrivacyPage = lazy(() => import('../react-pages/Privacy'));
const TermsPage = lazy(() => import('../react-pages/Terms'));
const MusicToolsPage = lazy(() => import('../react-pages/MusicTools'));
const CombinedToolsPage = lazy(() => import('../react-pages/CombinedTools'));
const OtherToolsPage = lazy(() => import('../react-pages/OtherTools'));
const DrumToolPage = lazy(() => import('../react-pages/DrumTool'));

// Page type union
type PageType =
  | 'home'
  | 'metronome'
  | 'drum'
  | 'drum-synth'
  | 'drum-tool'
  | 'qr'
  | 'sitemap'
  | 'opensource'
  | 'tools-used'
  | 'downloads'
  | 'privacy'
  | 'terms'
  | 'music-tools'
  | 'combined-tools'
  | 'other-tools';

interface ReactAppProps {
  /** Current path for active state */
  currentPath: string;
  /** Current language */
  language: 'ko' | 'en';
  /** Apps list */
  apps: App[];
  /** Page identifier to render */
  page: PageType;
}

/**
 * Render the appropriate page component based on page prop
 */
const PageRenderer = memo(function PageRenderer({
  page,
  language,
  apps,
}: {
  page: PageType;
  language: 'ko' | 'en';
  apps: App[];
}) {
  const fallback = (
    <div
      className="page-loading"
      style={{ padding: '2rem', textAlign: 'center' }}
    >
      <div className="loader" />
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      {page === 'home' && <HomePage language={language} apps={apps} />}
      {page === 'metronome' && <MetronomePage language={language} />}
      {page === 'drum' && <DrumPage language={language} />}
      {page === 'drum-synth' && <DrumSynthPage language={language} />}
      {page === 'qr' && <QRPage language={language} />}
      {page === 'sitemap' && <SitemapPage language={language} apps={apps} />}
      {page === 'opensource' && <OpenSourcePage language={language} />}
      {page === 'tools-used' && <ToolsUsedPage language={language} />}
      {page === 'downloads' && <DownloadsPage language={language} />}
      {page === 'privacy' && <PrivacyPage language={language} />}
      {page === 'terms' && <TermsPage language={language} />}
      {page === 'music-tools' && (
        <MusicToolsPage language={language} apps={apps} />
      )}
      {page === 'combined-tools' && (
        <CombinedToolsPage language={language} apps={apps} />
      )}
      {page === 'other-tools' && (
        <OtherToolsPage language={language} apps={apps} />
      )}
      {page === 'drum-tool' && <DrumToolPage language={language} />}
    </Suspense>
  );
});

/**
 * Navigation wrapper component for Astro
 */
const ReactApp = memo(function ReactApp({
  currentPath,
  language,
  apps,
  page,
}: ReactAppProps) {
  return (
    <LanguageProvider initialLanguage={language} currentPath={currentPath}>
      <ThemeProvider>
        <ErrorBoundary>
          <NavigationLayoutAstro
            apps={apps}
            currentPath={currentPath}
            language={language}
          >
            <SkipLink />
            <main id="main-content" className="main-content" role="main">
              <PageRenderer page={page} language={language} apps={apps} />
            </main>
            <FooterAstro language={language} />
          </NavigationLayoutAstro>
        </ErrorBoundary>
      </ThemeProvider>
    </LanguageProvider>
  );
});

ReactApp.displayName = 'ReactApp';

export { ReactApp };

/**
 * Astro-compatible Navigation Layout
 * Uses regular anchor tags instead of React Router
 */
import './navigation/NavigationLayout.css';

interface NavigationLayoutAstroProps {
  apps: App[];
  currentPath: string;
  language: 'ko' | 'en';
  children: React.ReactNode;
}

const NavigationLayoutAstro = memo(function NavigationLayoutAstro({
  apps,
  currentPath,
  language,
  children,
}: NavigationLayoutAstroProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBottomNavOpen, setIsBottomNavOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const toggleBottomNav = useCallback(() => {
    setIsBottomNavOpen((prev) => !prev);
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  // Global keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`navigation-layout${isSidebarOpen ? '' : ' sidebar-collapsed'}`}
    >
      <HeaderAstro
        onSearchClick={openCommandPalette}
        onSidebarToggle={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        language={language}
        currentPath={currentPath}
      />
      <SidebarAstro
        apps={apps}
        isOpen={isSidebarOpen}
        language={language}
        currentPath={currentPath}
      />
      <div className="navigation-content">
        <div className="content-wrapper">{children}</div>
      </div>
      <BottomNavAstro
        onToggle={toggleBottomNav}
        isOpen={isBottomNavOpen}
        language={language}
        currentPath={currentPath}
      />
      <CommandPaletteAstro
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        apps={apps}
        language={language}
      />
    </div>
  );
});

/**
 * Astro-compatible Header (no React Router)
 */
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../hooks/useTheme';
import { ThemeIcon } from './ui';
import './Header.css';

interface HeaderAstroProps {
  onSearchClick?: () => void;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
  language: 'ko' | 'en';
  currentPath: string;
}

const HeaderAstro = memo(function HeaderAstro({
  onSearchClick,
  onSidebarToggle,
  isSidebarOpen = true,
  language,
  currentPath,
}: HeaderAstroProps) {
  const { theme, toggleTheme } = useTheme();

  const handleSearchClick = useCallback(() => {
    onSearchClick?.();
  }, [onSearchClick]);

  const isMac =
    typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
  const shortcutKey = isMac ? '\u2318K' : 'Ctrl+K';

  const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
  const nextLabel =
    nextTheme === 'light'
      ? language === 'ko'
        ? '라이트'
        : 'Light'
      : language === 'ko'
        ? '다크'
        : 'Dark';
  const themeTitle =
    language === 'ko'
      ? `${nextLabel} 모드로 전환`
      : `Switch to ${nextLabel} mode`;

  const homePath = language === 'ko' ? '/ko' : '/';
  const toggleLangPath =
    language === 'ko'
      ? currentPath.replace(/^\/ko/, '') || '/'
      : `/ko${currentPath === '/' ? '' : currentPath}`;

  return (
    <header className="site-header">
      {onSidebarToggle && (
        <button
          onClick={onSidebarToggle}
          className="header-control-btn header-sidebar-toggle"
          title={
            language === 'ko'
              ? isSidebarOpen
                ? '사이드바 닫기'
                : '사이드바 열기'
              : isSidebarOpen
                ? 'Close sidebar'
                : 'Open sidebar'
          }
          aria-label={
            language === 'ko'
              ? isSidebarOpen
                ? '사이드바 닫기'
                : '사이드바 열기'
              : isSidebarOpen
                ? 'Close sidebar'
                : 'Open sidebar'
          }
          aria-expanded={isSidebarOpen}
        >
          <svg
            className="header-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            {isSidebarOpen ? (
              <>
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  strokeWidth="2"
                />
                <path strokeWidth="2" d="M9 3v18" />
              </>
            ) : (
              <>
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  strokeWidth="2"
                />
                <path strokeWidth="2" d="M9 3v18" />
                <path strokeWidth="2" strokeLinecap="round" d="M14 9l3 3-3 3" />
              </>
            )}
          </svg>
        </button>
      )}

      <div className="header-inner">
        <a href={homePath} className="header-logo">
          <span className="header-logo-text">tools</span>
          <span className="header-logo-badge">beta</span>
        </a>

        <button
          className="header-search"
          onClick={handleSearchClick}
          aria-label={language === 'ko' ? '검색 열기' : 'Open search'}
        >
          <svg
            className="header-search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <span className="header-search-text">
            {language === 'ko' ? '검색...' : 'Search...'}
          </span>
          <span className="header-search-shortcut">{shortcutKey}</span>
        </button>

        <div className="header-controls">
          <button
            onClick={toggleTheme}
            className="header-control-btn"
            title={themeTitle}
            aria-label={themeTitle}
          >
            <ThemeIcon theme={theme} />
          </button>

          <a
            href={toggleLangPath}
            className="header-control-btn header-lang-btn"
            title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
            aria-label={
              language === 'ko' ? 'Switch to English' : '한국어로 전환'
            }
          >
            <svg
              className="header-icon header-icon-lang"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                strokeWidth="2"
                d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              />
            </svg>
            <span className="header-lang-text">
              {language === 'ko' ? 'EN' : 'KO'}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
});

/**
 * Astro-compatible Sidebar (no React Router)
 */
import { MUSIC_APP_PATHS, COMBINED_APP_PATHS } from '../constants/apps';
import './navigation/Sidebar.css';

interface SidebarAstroProps {
  apps: App[];
  isOpen?: boolean;
  language: 'ko' | 'en';
  currentPath: string;
}

const SidebarAstro = memo(function SidebarAstro({
  apps,
  isOpen = true,
  language,
  currentPath,
}: SidebarAstroProps) {
  const getPath = (path: string) => {
    if (language === 'ko') {
      return path === '/' ? '/ko' : `/ko${path}`;
    }
    return path;
  };

  const basePath = currentPath.startsWith('/ko')
    ? currentPath.slice(3) || '/'
    : currentPath;

  const isActive = (path: string) => {
    if (path === '/') return basePath === '/';
    return basePath === path || basePath.startsWith(path + '/');
  };

  const musicApps = apps.filter((app) =>
    (MUSIC_APP_PATHS as readonly string[]).includes(app.url)
  );
  const combinedApps = apps.filter((app) =>
    (COMBINED_APP_PATHS as readonly string[]).includes(app.url)
  );
  const otherApps = apps.filter(
    (app) =>
      !(MUSIC_APP_PATHS as readonly string[]).includes(app.url) &&
      !(COMBINED_APP_PATHS as readonly string[]).includes(app.url)
  );

  return (
    <aside className={`sidebar${isOpen ? '' : ' collapsed'}`}>
      <nav className="sidebar-nav">
        <a
          href={getPath('/')}
          className={`sidebar-item ${isActive('/') ? 'active' : ''}`}
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            {isActive('/') ? (
              <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
            ) : (
              <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm2-2h2v-6h8v6h2V11l-6-5.25L6 11v8z" />
            )}
          </svg>
          <span className="sidebar-label">
            {language === 'ko' ? '홈' : 'Home'}
          </span>
        </a>

        <div className="sidebar-divider" />

        <div className="sidebar-section-title">
          {language === 'ko' ? '음악 도구' : 'Music Tools'}
        </div>

        {musicApps.map((app) => (
          <a
            key={app.url}
            href={getPath(app.url)}
            className={`sidebar-item ${isActive(app.url) ? 'active' : ''}`}
          >
            <span className="sidebar-icon sidebar-emoji">{app.icon}</span>
            <span className="sidebar-label">
              {language === 'ko' ? app.name.ko : app.name.en}
            </span>
          </a>
        ))}

        <div className="sidebar-divider" />

        <div className="sidebar-section-title">
          {language === 'ko' ? '결합 도구' : 'Combined Tools'}
        </div>

        {combinedApps.map((app) => (
          <a
            key={app.url}
            href={getPath(app.url)}
            className={`sidebar-item ${isActive(app.url) ? 'active' : ''}`}
          >
            <span className="sidebar-icon sidebar-emoji">{app.icon}</span>
            <span className="sidebar-label">
              {language === 'ko' ? app.name.ko : app.name.en}
            </span>
          </a>
        ))}

        <div className="sidebar-divider" />

        <div className="sidebar-section-title">
          {language === 'ko' ? '기타 도구' : 'Other Tools'}
        </div>

        {otherApps.map((app) => (
          <a
            key={app.url}
            href={getPath(app.url)}
            className={`sidebar-item ${isActive(app.url) ? 'active' : ''}`}
          >
            <span className="sidebar-icon sidebar-emoji">{app.icon}</span>
            <span className="sidebar-label">
              {language === 'ko' ? app.name.ko : app.name.en}
            </span>
          </a>
        ))}

        <div className="sidebar-divider" />

        <a
          href={getPath('/downloads')}
          className={`sidebar-item ${isActive('/downloads') ? 'active' : ''}`}
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 20h14v-2H5v2zm7-18v12.17l3.59-3.58L17 12l-5 5-5-5 1.41-1.41L12 14.17V2z" />
          </svg>
          <span className="sidebar-label">
            {language === 'ko' ? '다운로드' : 'Downloads'}
          </span>
        </a>

        <a
          href={getPath('/sitemap')}
          className={`sidebar-item ${isActive('/sitemap') ? 'active' : ''}`}
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
          <span className="sidebar-label">
            {language === 'ko' ? '메뉴' : 'Menu'}
          </span>
        </a>
      </nav>
    </aside>
  );
});

/**
 * Astro-compatible Bottom Navigation (no React Router)
 */
import './navigation/BottomNav.css';

interface BottomNavAstroProps {
  onToggle?: () => void;
  isOpen?: boolean;
  language: 'ko' | 'en';
  currentPath: string;
}

const BottomNavAstro = memo(function BottomNavAstro({
  onToggle,
  isOpen = true,
  language,
  currentPath,
}: BottomNavAstroProps) {
  const getPath = (path: string) => {
    if (language === 'ko') {
      return path === '/' ? '/ko' : `/ko${path}`;
    }
    return path;
  };

  const basePath = currentPath.startsWith('/ko')
    ? currentPath.slice(3) || '/'
    : currentPath;

  const isActive = (path: string) => {
    if (path === '/') return basePath === '/';
    return basePath === path || basePath.startsWith(path + '/');
  };

  const isMusicActive = MUSIC_APP_PATHS.some((p) => basePath.startsWith(p));

  return (
    <nav className={`bottom-nav${isOpen ? '' : ' collapsed'}`}>
      {onToggle && (
        <button
          onClick={onToggle}
          className="bottom-nav-toggle"
          title={
            language === 'ko'
              ? isOpen
                ? '메뉴 닫기'
                : '메뉴 열기'
              : isOpen
                ? 'Close menu'
                : 'Open menu'
          }
          aria-label={
            language === 'ko'
              ? isOpen
                ? '메뉴 닫기'
                : '메뉴 열기'
              : isOpen
                ? 'Close menu'
                : 'Open menu'
          }
          aria-expanded={isOpen}
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            {isOpen ? (
              <path strokeWidth="2" strokeLinecap="round" d="M19 9l-7 7-7-7" />
            ) : (
              <path strokeWidth="2" strokeLinecap="round" d="M5 15l7-7 7 7" />
            )}
          </svg>
        </button>
      )}

      <a
        href={getPath('/')}
        className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
      >
        <svg
          className="bottom-nav-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {isActive('/') ? (
            <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
          ) : (
            <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm2-2h2v-6h8v6h2V11l-6-5.25L6 11v8z" />
          )}
        </svg>
        <span className="bottom-nav-label">
          {language === 'ko' ? '홈' : 'Home'}
        </span>
      </a>

      <a
        href={getPath('/metronome')}
        className={`bottom-nav-item ${isMusicActive ? 'active' : ''}`}
      >
        <svg
          className="bottom-nav-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {isMusicActive ? (
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          ) : (
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm0 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          )}
        </svg>
        <span className="bottom-nav-label">
          {language === 'ko' ? '음악' : 'Music'}
        </span>
      </a>

      <a
        href={getPath('/qr')}
        className={`bottom-nav-item ${isActive('/qr') ? 'active' : ''}`}
      >
        <svg
          className="bottom-nav-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 2h-2v2h2v2h-4v-4h2v-2h-2v-2h4v4zm0 4h2v-2h-2v2zm-4-4h2v-2h-2v2z" />
        </svg>
        <span className="bottom-nav-label">QR</span>
      </a>

      <a
        href={getPath('/sitemap')}
        className={`bottom-nav-item ${isActive('/sitemap') ? 'active' : ''}`}
      >
        <svg
          className="bottom-nav-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
        <span className="bottom-nav-label">
          {language === 'ko' ? '메뉴' : 'Menu'}
        </span>
      </a>
    </nav>
  );
});

/**
 * Astro-compatible Command Palette (no React Router)
 */
import './navigation/CommandPalette.css';

interface CommandPaletteAstroProps {
  isOpen: boolean;
  onClose: () => void;
  apps: App[];
  language: 'ko' | 'en';
}

const CommandPaletteAstro = memo(function CommandPaletteAstro({
  isOpen,
  onClose,
  apps,
  language,
}: CommandPaletteAstroProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const getPath = (path: string) => {
    if (language === 'ko') {
      return path === '/' ? '/ko' : `/ko${path}`;
    }
    return path;
  };

  const quickActions = [
    {
      id: 'home',
      labelKo: '홈으로 이동',
      labelEn: 'Go to Home',
      url: '/',
      keywords: ['home', 'main', '홈', '메인'],
    },
    {
      id: 'sitemap',
      labelKo: '사이트맵 보기',
      labelEn: 'View Sitemap',
      url: '/sitemap',
      keywords: ['sitemap', 'all', '사이트맵', '전체'],
    },
  ];

  const normalizedQuery = query.toLowerCase().trim();

  const filteredApps = normalizedQuery
    ? apps.filter((app) => {
        const nameKo = app.name.ko.toLowerCase();
        const nameEn = app.name.en.toLowerCase();
        const descKo = app.desc.ko.toLowerCase();
        const descEn = app.desc.en.toLowerCase();
        return (
          nameKo.includes(normalizedQuery) ||
          nameEn.includes(normalizedQuery) ||
          descKo.includes(normalizedQuery) ||
          descEn.includes(normalizedQuery)
        );
      })
    : apps;

  const filteredActions = normalizedQuery
    ? quickActions.filter((action) => {
        const labelKo = action.labelKo.toLowerCase();
        const labelEn = action.labelEn.toLowerCase();
        const keywords = action.keywords.join(' ').toLowerCase();
        return (
          labelKo.includes(normalizedQuery) ||
          labelEn.includes(normalizedQuery) ||
          keywords.includes(normalizedQuery)
        );
      })
    : quickActions;

  const totalResults = filteredApps.length + filteredActions.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-command-item]');
    const selectedItem = items[selectedIndex] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, totalResults - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex < filteredApps.length) {
            window.location.href = getPath(filteredApps[selectedIndex].url);
          } else {
            const actionIndex = selectedIndex - filteredApps.length;
            window.location.href = getPath(
              filteredActions[actionIndex]?.url || '/'
            );
          }
          onClose();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [
      selectedIndex,
      totalResults,
      filteredApps,
      filteredActions,
      getPath,
      onClose,
    ]
  );

  const t = {
    placeholder:
      language === 'ko' ? '검색 또는 명령어...' : 'Search or type a command...',
    tools: language === 'ko' ? '도구' : 'Tools',
    actions: language === 'ko' ? '빠른 실행' : 'Quick Actions',
    noResults: language === 'ko' ? '검색 결과가 없습니다' : 'No results found',
    hint: language === 'ko' ? '이동하려면 Enter' : 'to navigate',
  };

  if (!isOpen) return null;

  return (
    <div
      className="command-palette-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-hidden={!isOpen}
    >
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'ko' ? '명령 팔레트' : 'Command Palette'}
      >
        <div className="command-palette-header">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder={t.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <kbd className="command-palette-esc">ESC</kbd>
        </div>

        <div className="command-palette-results" ref={listRef}>
          {totalResults === 0 ? (
            <div className="command-palette-empty">
              <p>{t.noResults}</p>
            </div>
          ) : (
            <>
              {filteredApps.length > 0 && (
                <div className="command-palette-section">
                  <div className="command-palette-section-label">{t.tools}</div>
                  {filteredApps.map((app, index) => (
                    <a
                      key={app.id}
                      href={getPath(app.url)}
                      data-command-item
                      className={`command-palette-item ${selectedIndex === index ? 'selected' : ''}`}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={onClose}
                    >
                      <span className="command-palette-item-icon">
                        {app.icon}
                      </span>
                      <div className="command-palette-item-content">
                        <span className="command-palette-item-title">
                          {language === 'ko' ? app.name.ko : app.name.en}
                        </span>
                        <span className="command-palette-item-desc">
                          {language === 'ko' ? app.desc.ko : app.desc.en}
                        </span>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}

              {filteredActions.length > 0 && (
                <div className="command-palette-section">
                  <div className="command-palette-section-label">
                    {t.actions}
                  </div>
                  {filteredActions.map((action, index) => {
                    const itemIndex = filteredApps.length + index;
                    return (
                      <a
                        key={action.id}
                        href={getPath(action.url)}
                        data-command-item
                        className={`command-palette-item ${selectedIndex === itemIndex ? 'selected' : ''}`}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        onClick={onClose}
                      >
                        <span className="command-palette-item-icon">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            {action.id === 'home' ? (
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
                            ) : (
                              <>
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect
                                  x="14"
                                  y="3"
                                  width="7"
                                  height="7"
                                  rx="1"
                                />
                                <rect
                                  x="3"
                                  y="14"
                                  width="7"
                                  height="7"
                                  rx="1"
                                />
                                <rect
                                  x="14"
                                  y="14"
                                  width="7"
                                  height="7"
                                  rx="1"
                                />
                              </>
                            )}
                          </svg>
                        </span>
                        <div className="command-palette-item-content">
                          <span className="command-palette-item-title">
                            {language === 'ko'
                              ? action.labelKo
                              : action.labelEn}
                          </span>
                        </div>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="command-palette-footer">
          <div className="command-palette-hint">
            <kbd>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 10 4 15 9 20" />
                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
              </svg>
            </kbd>
            <span>{t.hint}</span>
          </div>
          <div className="command-palette-hint">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <span>{language === 'ko' ? '탐색' : 'navigate'}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Astro-compatible Footer (no React Router)
 */
import { BRAND } from '../constants/brand';

interface FooterAstroProps {
  language: 'ko' | 'en';
}

const FooterAstro = memo(function FooterAstro({ language }: FooterAstroProps) {
  const t = language === 'ko' ? commonKo : commonEn;

  const getPath = (path: string) => {
    if (language === 'ko') {
      return path === '/' ? '/ko' : `/ko${path}`;
    }
    return path;
  };

  return (
    <footer className="footer">
      <nav className="footer-menu" aria-label="Footer navigation">
        <a href={getPath('/privacy')} className="footer-link">
          {t.footer.privacy}
        </a>
        <a href={getPath('/terms')} className="footer-link">
          {t.footer.terms}
        </a>
        {BRAND.githubUrl && (
          <a
            href={BRAND.githubUrl}
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.footer.github}
          </a>
        )}
        <a href={getPath('/sitemap')} className="footer-link">
          {t.footer.sitemap}
        </a>
        <a href={getPath('/opensource')} className="footer-link">
          {t.footer.opensource}
        </a>
        <a href={getPath('/tools-used')} className="footer-link">
          {t.footer.toolsUsed}
        </a>
      </nav>
      <p className="footer-copyright">© {BRAND.copyrightHolder}. MIT License</p>
    </footer>
  );
});

// Need to import React for useRef
import * as React from 'react';

export default ReactApp;
