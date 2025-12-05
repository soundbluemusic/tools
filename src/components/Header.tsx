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
      <div class="flex items-center justify-between w-full h-full px-4 max-[480px]:px-3">
        {/* Left: Sidebar Toggle */}
        <div class="flex items-center w-20">
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
        </div>

        {/* Center: Logo */}
        <Link
          href={toLocalizedPath('/')}
          class="flex items-center no-underline absolute left-1/2 -translate-x-1/2"
        >
          <span class="text-xl max-[480px]:text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
            {BRAND.name}
          </span>
        </Link>

        {/* Right: Controls */}
        <div class="flex items-center gap-1">
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
