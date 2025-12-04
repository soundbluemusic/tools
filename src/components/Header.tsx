import { type Component, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { useLanguage } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import { useLocalizedPath } from '../hooks';
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
export const Header: Component<HeaderProps> = (props) => {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toLocalizedPath } = useLocalizedPath();

  const handleSearchClick = () => {
    props.onSearchClick?.();
  };

  // Detect OS for keyboard shortcut hint
  const isMac = () =>
    typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
  const shortcutKey = () => (isMac() ? '\u2318K' : 'Ctrl+K');

  const nextTheme = (): Theme => (theme() === 'light' ? 'dark' : 'light');
  const nextLabel = () =>
    nextTheme() === 'light'
      ? language() === 'ko'
        ? '라이트'
        : 'Light'
      : language() === 'ko'
        ? '다크'
        : 'Dark';
  const themeTitle = () =>
    language() === 'ko'
      ? `${nextLabel()} 모드로 전환`
      : `Switch to ${nextLabel()} mode`;

  const sidebarLabel = () =>
    language() === 'ko'
      ? props.isSidebarOpen
        ? '사이드바 닫기'
        : '사이드바 열기'
      : props.isSidebarOpen
        ? 'Close sidebar'
        : 'Open sidebar';

  return (
    <header class="site-header">
      {/* Sidebar Toggle - Desktop only, positioned at far left */}
      <Show when={props.onSidebarToggle}>
        <button
          onClick={props.onSidebarToggle}
          class="header-control-btn header-sidebar-toggle"
          title={sidebarLabel()}
          aria-label={sidebarLabel()}
          aria-expanded={props.isSidebarOpen}
        >
          <svg
            class="header-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <Show
              when={props.isSidebarOpen}
              fallback={
                <>
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    stroke-width="2"
                  />
                  <path stroke-width="2" d="M9 3v18" />
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    d="M14 9l3 3-3 3"
                  />
                </>
              }
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke-width="2"
              />
              <path stroke-width="2" d="M9 3v18" />
            </Show>
          </svg>
        </button>
      </Show>

      <div class="header-inner">
        {/* Logo */}
        <A href={toLocalizedPath('/')} class="header-logo">
          <span class="header-logo-text">tools</span>
          <span class="header-logo-badge">beta</span>
        </A>

        {/* Search Button */}
        <button
          class="header-search"
          onClick={handleSearchClick}
          aria-label={language() === 'ko' ? '검색 열기' : 'Open search'}
        >
          <svg
            class="header-search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <circle cx="11" cy="11" r="7" stroke-width="2" />
            <path
              stroke-width="2"
              stroke-linecap="round"
              d="M21 21l-4.35-4.35"
            />
          </svg>
          <span class="header-search-text">
            {language() === 'ko' ? '검색...' : 'Search...'}
          </span>
          <span class="header-search-shortcut">{shortcutKey()}</span>
        </button>

        {/* Controls */}
        <div class="header-controls">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            class="header-control-btn"
            title={themeTitle()}
            aria-label={themeTitle()}
          >
            <ThemeIcon theme={theme()} />
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            class="header-control-btn header-lang-btn"
            title={language() === 'ko' ? 'Switch to English' : '한국어로 전환'}
            aria-label={
              language() === 'ko' ? 'Switch to English' : '한국어로 전환'
            }
          >
            <svg
              class="header-icon header-icon-lang"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <circle cx="12" cy="12" r="10" stroke-width="2" />
              <path
                stroke-width="2"
                d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              />
            </svg>
            <span class="header-lang-text">
              {language() === 'ko' ? 'EN' : 'KO'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
