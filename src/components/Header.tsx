import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../hooks/useTheme';
import './Header.css';

interface HeaderProps {
  onSearchClick?: () => void;
}

/** Icon for each theme mode */
const ThemeIcon = memo(function ThemeIcon({
  theme,
  resolved,
}: {
  theme: Theme;
  resolved: 'light' | 'dark';
}) {
  if (theme === 'system') {
    return (
      <svg
        className="header-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="18"
        height="18"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
        <path strokeWidth="2" d="M8 21h8M12 17v4" />
      </svg>
    );
  }

  if (resolved === 'dark') {
    return (
      <svg
        className="header-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="18"
        height="18"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        />
      </svg>
    );
  }

  return (
    <svg
      className="header-icon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="18"
      height="18"
    >
      <circle cx="12" cy="12" r="5" strokeWidth="2" />
      <path
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </svg>
  );
});

ThemeIcon.displayName = 'ThemeIcon';

/**
 * Fixed Header Component
 * YouTube/Docusaurus style header with logo, search, and controls
 */
export const Header = memo(function Header({ onSearchClick }: HeaderProps) {
  const { language, toggleLanguage } = useLanguage();
  const { theme, resolvedTheme, cycleTheme } = useTheme();

  const handleSearchClick = useCallback(() => {
    onSearchClick?.();
  }, [onSearchClick]);

  // Detect OS for keyboard shortcut hint
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
  const shortcutKey = isMac ? '\u2318K' : 'Ctrl+K';

  const themeLabels: Record<Theme, { ko: string; en: string }> = {
    system: { ko: '시스템', en: 'System' },
    light: { ko: '라이트', en: 'Light' },
    dark: { ko: '다크', en: 'Dark' },
  };

  const nextTheme: Theme =
    theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
  const nextLabel = themeLabels[nextTheme][language];
  const themeTitle =
    language === 'ko'
      ? `${nextLabel} 모드로 전환`
      : `Switch to ${nextLabel} mode`;

  return (
    <header className="site-header">
      <div className="header-inner">
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
            onClick={cycleTheme}
            className="header-control-btn"
            title={themeTitle}
            aria-label={themeTitle}
          >
            <ThemeIcon theme={theme} resolved={resolvedTheme} />
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="header-control-btn header-lang-btn"
            title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
            aria-label={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
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
            <span className="header-lang-text">{language === 'ko' ? 'EN' : 'KO'}</span>
          </button>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
