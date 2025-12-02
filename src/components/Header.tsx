import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../hooks/useTheme';
import { ThemeIcon } from './ui';
import './Header.css';

interface HeaderProps {
  onSearchClick?: () => void;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

/**
 * Fixed Header Component
 * YouTube/Docusaurus style header with logo, search, and controls
 */
export const Header = memo(function Header({
  onSearchClick,
  onSidebarToggle,
  isSidebarOpen = true,
}: HeaderProps) {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleSearchClick = useCallback(() => {
    onSearchClick?.();
  }, [onSearchClick]);

  // Detect OS for keyboard shortcut hint
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

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Sidebar Toggle - Desktop only, on the left */}
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
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M14 9l3 3-3 3"
                  />
                </>
              )}
            </svg>
          </button>
        )}

        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="header-logo-text">tools</span>
          <span className="header-logo-badge">beta</span>
        </Link>

        {/* Search Button */}
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

        {/* Controls */}
        <div className="header-controls">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="header-control-btn"
            title={themeTitle}
            aria-label={themeTitle}
          >
            <ThemeIcon theme={theme} />
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
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
          </button>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
