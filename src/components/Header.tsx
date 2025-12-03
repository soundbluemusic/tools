import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../hooks/useTheme';
import { ThemeIcon } from './ui';

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
  const { language, toggleLanguage, localizedPath } = useLanguage();
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
    <header className="fixed top-0 left-0 right-0 z-fixed h-[56px] bg-bg-primary border-b border-border-primary max-sm:h-[52px] supports-[top:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)] supports-[top:env(safe-area-inset-top)]:h-[calc(56px+env(safe-area-inset-top))] supports-[top:env(safe-area-inset-top)]:max-sm:h-[calc(52px+env(safe-area-inset-top))]">
      {/* Sidebar Toggle - Desktop only, positioned at far left */}
      {onSidebarToggle && (
        <button
          onClick={onSidebarToggle}
          className="hidden lg:inline-flex items-center justify-center w-10 h-10 p-0 bg-transparent border-none rounded-lg cursor-pointer text-text-secondary hover:bg-interactive-hover hover:text-text-primary flex-shrink-0 absolute left-4 top-1/2 -translate-y-1/2"
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
            className="w-[18px] h-[18px] flex-shrink-0"
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

      <div className="flex items-center gap-4 w-full h-full px-4 max-sm:px-3 max-sm:gap-2 lg:pl-64">
        {/* Logo */}
        <Link
          to={localizedPath('/')}
          className="flex items-center gap-[6px] no-underline flex-shrink-0"
        >
          <span className="text-xl font-semibold text-text-primary tracking-tight max-sm:text-lg">
            tools
          </span>
          <span className="inline-block text-[0.625rem] font-semibold uppercase tracking-wide py-[2px] px-[6px] bg-accent-primary text-white rounded align-middle">
            beta
          </span>
        </Link>

        {/* Search Button */}
        <button
          className="flex items-center gap-2 flex-1 max-w-[480px] h-10 px-3 bg-bg-tertiary border border-border-secondary rounded-lg cursor-pointer transition-[border-color,box-shadow] duration-fast focus:outline-none focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] hover:border-border-primary max-md:max-w-[160px] max-md:flex-none max-sm:max-w-[120px] max-sm:h-9 max-sm:px-[10px]"
          onClick={handleSearchClick}
          aria-label={language === 'ko' ? '검색 열기' : 'Open search'}
        >
          <svg
            className="flex-shrink-0 text-text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <span className="flex-1 text-left text-sm text-text-tertiary max-md:hidden">
            {language === 'ko' ? '검색...' : 'Search...'}
          </span>
          <span className="inline-flex items-center justify-center py-[2px] px-[6px] text-xs font-medium font-[system-ui,-apple-system,sans-serif] text-text-tertiary bg-bg-secondary border border-border-primary rounded max-sm:hidden">
            {shortcutKey}
          </span>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-10 h-10 p-0 bg-transparent border-none rounded-lg cursor-pointer text-text-secondary hover:bg-interactive-hover hover:text-text-primary max-sm:w-9 max-sm:h-9"
            title={themeTitle}
            aria-label={themeTitle}
          >
            <ThemeIcon theme={theme} />
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center justify-center gap-1 w-auto px-3 h-10 p-0 bg-transparent border-none rounded-lg cursor-pointer text-text-secondary hover:bg-interactive-hover hover:text-text-primary max-sm:px-2 max-sm:h-9"
            title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
            aria-label={
              language === 'ko' ? 'Switch to English' : '한국어로 전환'
            }
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
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
            <span className="text-[0.8rem] font-semibold tracking-[0.02em]">
              {language === 'ko' ? 'EN' : 'KO'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
