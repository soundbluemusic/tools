/**
 * Header Component - Vanilla TypeScript
 * Fixed top navigation bar with logo, search, and controls
 */
import { Component, html } from '../../core';
import { router } from '../../core/Router';
import { themeStore, languageStore } from '../../core/Store';

export interface HeaderProps {
  [key: string]: unknown;
  onSearchClick?: () => void;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export class Header extends Component<HeaderProps> {
  protected render(): string {
    const theme = themeStore.getState().theme;
    const language = languageStore.getState().language;
    const { isSidebarOpen = true } = this.props;

    const isMac =
      typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
    const shortcutKey = isMac ? '⌘K' : 'Ctrl+K';

    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const themeTitle =
      language === 'ko'
        ? `${nextTheme === 'light' ? '라이트' : '다크'} 모드로 전환`
        : `Switch to ${nextTheme} mode`;

    const sidebarTitle =
      language === 'ko'
        ? isSidebarOpen
          ? '사이드바 닫기'
          : '사이드바 열기'
        : isSidebarOpen
          ? 'Close sidebar'
          : 'Open sidebar';

    return html`
      <header
        class="fixed top-0 left-0 right-0 z-fixed h-14 bg-bg-primary border-b border-border-primary"
      >
        <!-- Sidebar Toggle - Desktop only -->
        <button
          id="sidebar-toggle"
          class="hidden lg:inline-flex items-center justify-center w-10 h-10 bg-transparent border-none rounded-lg cursor-pointer text-text-secondary hover:bg-interactive-hover hover:text-text-primary absolute left-4 top-1/2 -translate-y-1/2"
          title="${sidebarTitle}"
          aria-label="${sidebarTitle}"
          aria-expanded="${isSidebarOpen}"
        >
          <svg
            class="w-[18px] h-[18px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" />
            <path stroke-width="2" d="M9 3v18" />
            ${!isSidebarOpen
              ? html`<path
                  stroke-width="2"
                  stroke-linecap="round"
                  d="M14 9l3 3-3 3"
                />`
              : ''}
          </svg>
        </button>

        <div class="flex items-center gap-4 w-full h-full px-4 lg:pl-64">
          <!-- Logo -->
          <a
            href="/"
            class="flex items-center gap-[6px] no-underline flex-shrink-0"
            data-link
          >
            <span
              class="text-xl font-semibold text-text-primary tracking-tight"
            >
              tools
            </span>
            <span
              class="inline-block text-[0.625rem] font-semibold uppercase tracking-wide py-[2px] px-[6px] bg-accent-primary text-white rounded"
            >
              beta
            </span>
          </a>

          <!-- Search Button -->
          <button
            id="search-btn"
            class="flex items-center gap-2 flex-1 max-w-[480px] h-10 px-3 bg-bg-tertiary border border-border-secondary rounded-lg cursor-pointer transition-colors hover:border-border-primary focus:outline-none focus:border-accent-primary"
            aria-label="${language === 'ko' ? '검색 열기' : 'Open search'}"
          >
            <svg
              class="flex-shrink-0 text-text-tertiary"
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
            <span
              class="flex-1 text-left text-sm text-text-tertiary hidden md:inline"
            >
              ${language === 'ko' ? '검색...' : 'Search...'}
            </span>
            <span
              class="hidden sm:inline-flex items-center py-[2px] px-[6px] text-xs font-medium text-text-tertiary bg-bg-secondary border border-border-primary rounded"
            >
              ${shortcutKey}
            </span>
          </button>

          <!-- Controls -->
          <div class="flex items-center gap-1 flex-shrink-0 ml-auto">
            <!-- Theme Toggle -->
            <button
              id="theme-toggle"
              class="inline-flex items-center justify-center w-10 h-10 bg-transparent border-none rounded-lg cursor-pointer text-text-secondary hover:bg-interactive-hover hover:text-text-primary"
              title="${themeTitle}"
              aria-label="${themeTitle}"
            >
              ${theme === 'dark'
                ? html`<svg
                    class="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
                    />
                  </svg>`
                : html`<svg
                    class="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"
                    />
                  </svg>`}
            </button>

            <!-- Language Toggle -->
            <button
              id="lang-toggle"
              class="inline-flex items-center justify-center gap-1 px-3 h-10 bg-transparent border-none rounded-lg cursor-pointer text-text-secondary hover:bg-interactive-hover hover:text-text-primary"
              title="${language === 'ko'
                ? 'Switch to English'
                : '한국어로 전환'}"
              aria-label="${language === 'ko'
                ? 'Switch to English'
                : '한국어로 전환'}"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke-width="2" />
                <path
                  stroke-width="2"
                  d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                />
              </svg>
              <span class="text-[0.8rem] font-semibold tracking-[0.02em]">
                ${language === 'ko' ? 'EN' : 'KO'}
              </span>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  protected bindEvents(): void {
    // Theme toggle
    this.addEventListenerById('theme-toggle', 'click', () => {
      const current = themeStore.getState().theme;
      const newTheme = current === 'dark' ? 'light' : 'dark';
      themeStore.setState({ theme: newTheme });
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      this.update();
    });

    // Language toggle
    this.addEventListenerById('lang-toggle', 'click', () => {
      const current = languageStore.getState().language;
      const newLang = current === 'ko' ? 'en' : 'ko';
      languageStore.setState({ language: newLang });
      localStorage.setItem('language', newLang);
      this.update();
    });

    // Search button
    if (this.props.onSearchClick) {
      this.addEventListenerById('search-btn', 'click', () => {
        (this.props.onSearchClick as () => void)();
      });
    }

    // Sidebar toggle
    if (this.props.onSidebarToggle) {
      this.addEventListenerById('sidebar-toggle', 'click', () => {
        (this.props.onSidebarToggle as () => void)();
      });
    }

    // SPA navigation for logo link
    this.addEventListener(this.element!, 'click', (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-link]') as HTMLAnchorElement;
      if (link) {
        e.preventDefault();
        router.navigate(link.pathname);
      }
    });
  }
}
