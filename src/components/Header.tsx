import { type Component, Show } from 'solid-js';
import { useLanguage } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import { useLocalizedPath } from '../hooks';
import type { Theme } from '../hooks/useTheme';
import { Link, ThemeIcon } from './ui';

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
    <header class="fixed top-0 left-0 right-0 z-[100] h-14 max-[480px]:h-[52px] bg-[var(--color-bg-primary)] border-b border-[var(--color-border-primary)] supports-[top:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)] supports-[top:env(safe-area-inset-top)]:h-[calc(56px+env(safe-area-inset-top))] supports-[top:env(safe-area-inset-top)]:max-[480px]:h-[calc(52px+env(safe-area-inset-top))]">
      {/* Sidebar Toggle - Desktop only, positioned at far left */}
      <Show when={props.onSidebarToggle}>
        <button
          onClick={props.onSidebarToggle}
          class="hidden lg:inline-flex items-center justify-center w-10 h-10 p-0 bg-transparent border-0 rounded-lg cursor-pointer text-[var(--color-text-secondary)] flex-shrink-0 absolute left-4 top-1/2 -translate-y-1/2 hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] max-[480px]:w-9 max-[480px]:h-9"
          title={sidebarLabel()}
          aria-label={sidebarLabel()}
          aria-expanded={props.isSidebarOpen}
        >
          <svg
            class="w-[18px] h-[18px] flex-shrink-0"
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

      <div class="flex items-center gap-4 max-[480px]:gap-2 w-full h-full px-4 max-[480px]:px-3 lg:pl-64 [.sidebar-collapsed_&]:lg:pl-[72px]">
        {/* Logo */}
        <Link
          href={toLocalizedPath('/')}
          class="flex items-center gap-1.5 no-underline flex-shrink-0"
        >
          <span class="text-xl max-[480px]:text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
            tools
          </span>
          <span class="inline-block text-[0.625rem] font-semibold uppercase tracking-wider py-0.5 px-1.5 bg-[var(--color-accent-primary)] text-white rounded align-middle">
            beta
          </span>
        </Link>

        {/* Search Button */}
        <button
          class="flex items-center gap-2 flex-1 max-w-[480px] max-[768px]:max-w-[160px] max-[768px]:flex-none max-[480px]:max-w-[120px] h-10 max-[480px]:h-9 px-3 max-[480px]:px-2.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)] rounded-lg cursor-pointer transition-[border-color,box-shadow] duration-150 ease-out hover:border-[var(--color-border-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          onClick={handleSearchClick}
          aria-label={language() === 'ko' ? '검색 열기' : 'Open search'}
        >
          <svg
            class="flex-shrink-0 text-[var(--color-text-tertiary)]"
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
          <span class="flex-1 text-left text-sm text-[var(--color-text-tertiary)] max-[768px]:hidden">
            {language() === 'ko' ? '검색...' : 'Search...'}
          </span>
          <span class="inline-flex items-center justify-center py-0.5 px-1.5 text-xs font-medium text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded max-[480px]:hidden font-[system-ui,-apple-system,sans-serif]">
            {shortcutKey()}
          </span>
        </button>

        {/* Controls */}
        <div class="flex items-center gap-1 flex-shrink-0 ml-auto">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            class="inline-flex items-center justify-center w-10 h-10 max-[480px]:w-9 max-[480px]:h-9 p-0 bg-transparent border-0 rounded-lg cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]"
            title={themeTitle()}
            aria-label={themeTitle()}
          >
            <ThemeIcon theme={theme()} />
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            class="inline-flex items-center justify-center gap-1 w-auto h-10 max-[480px]:h-9 px-3 max-[480px]:px-2 p-0 bg-transparent border-0 rounded-lg cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]"
            title={language() === 'ko' ? 'Switch to English' : '한국어로 전환'}
            aria-label={
              language() === 'ko' ? 'Switch to English' : '한국어로 전환'
            }
          >
            <svg
              class="w-4 h-4 flex-shrink-0"
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
            <span class="text-[0.8rem] font-semibold tracking-[0.02em]">
              {language() === 'ko' ? 'EN' : 'KO'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
