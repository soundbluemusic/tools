import { memo, useState, useCallback, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { App } from '../../types';
import './Sidebar.css';

// SVG Icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ChevronIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: direction === 'left' ? 'rotate(180deg)' : undefined }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="15.5" r="2.5" />
    <path d="M8 17V5l12-2v12" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// Music tool paths for grouping
const MUSIC_TOOLS = ['/metronome', '/drum', '/drum-synth'];

interface SidebarProps {
  apps: App[];
  onSearchClick?: () => void;
}

/**
 * Desktop Sidebar Navigation
 * - 240px width, collapses to 72px on tablets
 * - Hierarchical tool organization
 * - Cmd+K search integration
 */
export const Sidebar = memo(function Sidebar({ apps, onSearchClick }: SidebarProps) {
  const { language } = useLanguage();
  const location = useLocation();
  const isTablet = useMediaQuery('(max-width: 1279px) and (min-width: 1024px)');
  const [isCollapsed, setIsCollapsed] = useState(isTablet);
  const [isMusicExpanded, setIsMusicExpanded] = useState(() =>
    MUSIC_TOOLS.includes(location.pathname)
  );

  // Sync collapse state with tablet breakpoint
  useEffect(() => {
    setIsCollapsed(isTablet);
  }, [isTablet]);

  // Expand music section when navigating to a music tool
  useEffect(() => {
    if (MUSIC_TOOLS.includes(location.pathname)) {
      setIsMusicExpanded(true);
    }
  }, [location.pathname]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleMusic = useCallback(() => {
    setIsMusicExpanded((prev) => !prev);
  }, []);

  // Separate music and other apps
  const musicApps = apps.filter((app) => MUSIC_TOOLS.includes(app.url));
  const otherApps = apps.filter((app) => !MUSIC_TOOLS.includes(app.url));

  const t = {
    home: language === 'ko' ? '홈' : 'Home',
    search: language === 'ko' ? '검색' : 'Search',
    searchShortcut: language === 'ko' ? '⌘K' : '⌘K',
    music: language === 'ko' ? '음악 도구' : 'Music Tools',
    tools: language === 'ko' ? '도구' : 'Tools',
    settings: language === 'ko' ? '설정' : 'Settings',
    collapse: language === 'ko' ? '사이드바 접기' : 'Collapse sidebar',
    expand: language === 'ko' ? '사이드바 펼치기' : 'Expand sidebar',
  };

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      aria-label={language === 'ko' ? '사이드바 네비게이션' : 'Sidebar navigation'}
    >
      {/* Logo/Brand */}
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo">
          <span className="sidebar-logo-icon" aria-hidden="true">⚡</span>
          {!isCollapsed && <span className="sidebar-logo-text">Tools</span>}
        </NavLink>
        <button
          className="sidebar-toggle"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? t.expand : t.collapse}
          title={isCollapsed ? t.expand : t.collapse}
        >
          <ChevronIcon direction={isCollapsed ? 'right' : 'left'} />
        </button>
      </div>

      {/* Search */}
      <button
        className="sidebar-search"
        onClick={onSearchClick}
        aria-label={`${t.search} (${t.searchShortcut})`}
      >
        <SearchIcon />
        {!isCollapsed && (
          <>
            <span className="sidebar-search-text">{t.search}</span>
            <kbd className="sidebar-search-kbd">{t.searchShortcut}</kbd>
          </>
        )}
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          end
        >
          <HomeIcon />
          {!isCollapsed && <span>{t.home}</span>}
        </NavLink>

        {/* Music Tools Section */}
        {musicApps.length > 0 && (
          <div className="sidebar-section">
            <button
              className={`sidebar-section-header ${isMusicExpanded ? 'expanded' : ''}`}
              onClick={toggleMusic}
              aria-expanded={isMusicExpanded}
            >
              <MusicIcon />
              {!isCollapsed && (
                <>
                  <span className="sidebar-section-title">{t.music}</span>
                  <ChevronIcon direction={isMusicExpanded ? 'left' : 'right'} />
                </>
              )}
            </button>
            {(isMusicExpanded || isCollapsed) && (
              <div className="sidebar-section-items">
                {musicApps.map((app) => (
                  <NavLink
                    key={app.id}
                    to={app.url}
                    className={({ isActive }) =>
                      `sidebar-item sidebar-item-nested ${isActive ? 'active' : ''}`
                    }
                    title={isCollapsed ? (language === 'ko' ? app.name.ko : app.name.en) : undefined}
                  >
                    <span className="sidebar-item-icon" aria-hidden="true">{app.icon}</span>
                    {!isCollapsed && (
                      <span className="sidebar-item-text">
                        {language === 'ko' ? app.name.ko : app.name.en}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other Tools */}
        {otherApps.length > 0 && (
          <div className="sidebar-section">
            {!isCollapsed && (
              <div className="sidebar-section-label">{t.tools}</div>
            )}
            <div className="sidebar-section-items">
              {otherApps.map((app) => (
                <NavLink
                  key={app.id}
                  to={app.url}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                  title={isCollapsed ? (language === 'ko' ? app.name.ko : app.name.en) : undefined}
                >
                  <span className="sidebar-item-icon" aria-hidden="true">{app.icon}</span>
                  {!isCollapsed && (
                    <span className="sidebar-item-text">
                      {language === 'ko' ? app.name.ko : app.name.en}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <NavLink
          to="/sitemap"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          title={isCollapsed ? t.settings : undefined}
        >
          <SettingsIcon />
          {!isCollapsed && <span>{t.settings}</span>}
        </NavLink>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
