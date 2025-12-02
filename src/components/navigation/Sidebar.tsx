import { memo, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import { useIsActive } from '../../hooks';
import { MUSIC_APP_PATHS } from '../../constants/apps';
import type { App } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  apps: App[];
}

/**
 * Desktop Sidebar Navigation (YouTube Style)
 * - Fixed on left
 * - Icon + label for each item
 * - Active state highlight
 */
export const Sidebar = memo(function Sidebar({ apps }: SidebarProps) {
  const { language } = useLanguage();
  const { isActive } = useIsActive();

  // Memoize filtered apps
  const { musicApps, otherApps } = useMemo(
    () => ({
      musicApps: apps.filter((app) =>
        (MUSIC_APP_PATHS as readonly string[]).includes(app.url)
      ),
      otherApps: apps.filter(
        (app) => !(MUSIC_APP_PATHS as readonly string[]).includes(app.url)
      ),
    }),
    [apps]
  );

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {/* Home */}
        <NavLink
          to="/"
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
        </NavLink>

        <div className="sidebar-divider" />

        {/* Music Section */}
        <div className="sidebar-section-title">
          {language === 'ko' ? '음악 도구' : 'Music Tools'}
        </div>

        {musicApps.map((app) => (
          <NavLink
            key={app.url}
            to={app.url}
            className={`sidebar-item ${isActive(app.url) ? 'active' : ''}`}
          >
            <span className="sidebar-icon sidebar-emoji">{app.icon}</span>
            <span className="sidebar-label">
              {language === 'ko' ? app.name.ko : app.name.en}
            </span>
          </NavLink>
        ))}

        <div className="sidebar-divider" />

        {/* Other Tools */}
        <div className="sidebar-section-title">
          {language === 'ko' ? '기타 도구' : 'Other Tools'}
        </div>

        {otherApps.map((app) => (
          <NavLink
            key={app.url}
            to={app.url}
            className={`sidebar-item ${isActive(app.url) ? 'active' : ''}`}
          >
            <span className="sidebar-icon sidebar-emoji">{app.icon}</span>
            <span className="sidebar-label">
              {language === 'ko' ? app.name.ko : app.name.en}
            </span>
          </NavLink>
        ))}

        <div className="sidebar-divider" />

        {/* Downloads */}
        <NavLink
          to="/downloads"
          className={`sidebar-item ${isActive('/downloads') ? 'active' : ''}`}
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 20h14v-2H5v2zm7-18v12.17l3.59-3.58L17 12l-5 5-5-5 1.41-1.41L12 14.17V2z" />
          </svg>
          <span className="sidebar-label">
            {language === 'ko' ? '다운로드' : 'Downloads'}
          </span>
        </NavLink>

        {/* Menu / Settings */}
        <NavLink
          to="/sitemap"
          className={`sidebar-item ${isActive('/sitemap') ? 'active' : ''}`}
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
          <span className="sidebar-label">
            {language === 'ko' ? '메뉴' : 'Menu'}
          </span>
        </NavLink>
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
