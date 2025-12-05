import { type Component, Show } from 'solid-js';
import { useLanguage } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import { useLocalizedPath } from '../hooks';
import type { Theme } from '../hooks/useTheme';
import { Link, ThemeIcon } from './ui';
import { BRAND } from '../constants';

interface HeaderProps {
  onSearchClick?: () => void;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

/**
 * Fixed Header Component
 * Reference: soundbluemusic.com style - toggle | center logo | controls
 */
export const Header: Component<HeaderProps> = (props) => {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toLocalizedPath } = useLocalizedPath();

  // Detect OS for keyboard shortcut hint
  const isMac = () =>
    typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
  const shortcutKey = () => (isMac() ? '⌘K' : 'Ctrl+K');

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
      <div class="flex items-center w-full h-full px-4 max-[480px]:px-3 gap-4">
        {/* Left: Sidebar Toggle + Logo */}
        <div class="flex items-center gap-3 flex-shrink-0">
          <Show when={props.onSidebarToggle}>
            <button
              onClick={props.onSidebarToggle}
              class="inline-flex items-center justify-center w-10 h-10 p-0 bg-transparent border-0 rounded-lg cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] max-[480px]:w-9 max-[480px]:h-9"
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
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  stroke-width="2"
                />
                <path stroke-width="2" d="M9 3v18" />
              </svg>
            </button>
          </Show>

          {/* Logo - Left aligned */}
          <Link
            href={toLocalizedPath('/')}
            class="flex items-center no-underline"
          >
            <span class="text-xl max-[480px]:text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
              {BRAND.name}
            </span>
          </Link>
        </div>

        {/* Center: Search Button */}
        <div class="flex-1 flex justify-center max-[480px]:hidden">
          <button
            onClick={() => props.onSearchClick?.()}
            class="inline-flex items-center gap-4 w-full max-w-md h-11 pl-5 pr-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-full cursor-pointer text-[var(--color-text-tertiary)] hover:border-[var(--color-border-hover)] hover:shadow-sm transition-all duration-150"
            aria-label={language() === 'ko' ? '검색' : 'Search'}
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" stroke-width="2" />
              <path
                stroke-width="2"
                stroke-linecap="round"
                d="M21 21l-4.35-4.35"
              />
            </svg>
            <span class="flex-1 text-left text-sm">
              {language() === 'ko' ? '검색...' : 'Search...'}
            </span>
            <kbd class="text-[11px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-primary)] px-2.5 py-1.5 rounded-md border border-[var(--color-border-primary)] shadow-[inset_0_-2px_0_var(--color-border-secondary)]">
              {shortcutKey()}
            </kbd>
          </button>
        </div>

        {/* Right: Controls */}
        <div class="flex items-center gap-1 flex-shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={() => props.onSearchClick?.()}
            class="hidden max-[480px]:inline-flex items-center justify-center w-9 h-9 p-0 bg-transparent border-0 rounded-lg cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]"
            aria-label={language() === 'ko' ? '검색' : 'Search'}
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" stroke-width="2" />
              <path
                stroke-width="2"
                stroke-linecap="round"
                d="M21 21l-4.35-4.35"
              />
            </svg>
          </button>
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
              {language() === 'ko' ? 'KO' : 'EN'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
