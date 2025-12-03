/**
 * BottomNav Component - Vanilla TypeScript
 * Mobile bottom navigation bar
 */
import { Component, html } from '../../core';
import { router } from '../../core/Router';
import { languageStore } from '../../core/Store';

export interface BottomNavProps {
  [key: string]: unknown;
  isOpen?: boolean;
  onToggle?: () => void;
}

const MUSIC_APP_PATHS = ['/metronome', '/drum', '/drum-synth', '/drum-tool'];

export class BottomNav extends Component<BottomNavProps> {
  protected render(): string {
    const language = languageStore.getState().language;
    const { isOpen = true } = this.props;
    const currentPath = window.location.pathname;

    const isActive = (path: string) => currentPath === path;
    const isMusicActive = MUSIC_APP_PATHS.some((p) =>
      currentPath.startsWith(p)
    );

    const homeIcon = isActive('/')
      ? html`<path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />`
      : html`<path
          d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm2-2h2v-6h8v6h2V11l-6-5.25L6 11v8z"
        />`;

    const musicIcon = isMusicActive
      ? html`<path
          d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
        />`
      : html`<path
          d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm0 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
        />`;

    const toggleTitle =
      language === 'ko'
        ? isOpen
          ? '메뉴 닫기'
          : '메뉴 열기'
        : isOpen
          ? 'Close menu'
          : 'Open menu';

    if (!isOpen) {
      return html`
        <nav class="lg:hidden">
          <button
            id="bottom-nav-toggle"
            class="fixed right-3 flex items-center justify-center w-11 h-11 bg-bg-primary border border-border-primary rounded-full shadow-md cursor-pointer text-text-secondary active:bg-bg-secondary z-[1000]"
            style="bottom: calc(12px + env(safe-area-inset-bottom, 0px));"
            title="${toggleTitle}"
            aria-label="${toggleTitle}"
            aria-expanded="false"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path stroke-width="2" stroke-linecap="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </nav>
      `;
    }

    return html`
      <nav
        class="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around bg-bg-primary border-t border-border-primary z-[1000]"
        style="height: calc(56px + env(safe-area-inset-bottom, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px);"
      >
        <!-- Toggle Button -->
        <button
          id="bottom-nav-toggle"
          class="absolute top-[-28px] right-3 flex items-center justify-center w-8 h-5 bg-bg-primary border border-border-primary border-b-0 rounded-t-lg cursor-pointer text-text-secondary active:bg-bg-secondary"
          title="${toggleTitle}"
          aria-label="${toggleTitle}"
          aria-expanded="true"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <path stroke-width="2" stroke-linecap="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Home -->
        <a
          href="/"
          class="flex flex-col items-center justify-center flex-1 h-14 no-underline ${isActive(
            '/'
          )
            ? 'text-text-primary'
            : 'text-text-secondary'}"
          data-link
        >
          <svg class="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
            ${homeIcon}
          </svg>
          <span class="text-[10px] font-medium">
            ${language === 'ko' ? '홈' : 'Home'}
          </span>
        </a>

        <!-- Music -->
        <a
          href="/metronome"
          class="flex flex-col items-center justify-center flex-1 h-14 no-underline ${isMusicActive
            ? 'text-text-primary'
            : 'text-text-secondary'}"
          data-link
        >
          <svg class="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
            ${musicIcon}
          </svg>
          <span class="text-[10px] font-medium">
            ${language === 'ko' ? '음악' : 'Music'}
          </span>
        </a>

        <!-- QR -->
        <a
          href="/qr"
          class="flex flex-col items-center justify-center flex-1 h-14 no-underline ${isActive(
            '/qr'
          )
            ? 'text-text-primary'
            : 'text-text-secondary'}"
          data-link
        >
          <svg class="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 2h-2v2h2v2h-4v-4h2v-2h-2v-2h4v4zm0 4h2v-2h-2v2zm-4-4h2v-2h-2v2z"
            />
          </svg>
          <span class="text-[10px] font-medium">QR</span>
        </a>

        <!-- Menu -->
        <a
          href="/sitemap"
          class="flex flex-col items-center justify-center flex-1 h-14 no-underline ${isActive(
            '/sitemap'
          )
            ? 'text-text-primary'
            : 'text-text-secondary'}"
          data-link
        >
          <svg class="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
          <span class="text-[10px] font-medium">
            ${language === 'ko' ? '메뉴' : 'Menu'}
          </span>
        </a>
      </nav>
    `;
  }

  protected bindEvents(): void {
    // Toggle button
    if (this.props.onToggle) {
      this.addEventListenerById('bottom-nav-toggle', 'click', () => {
        (this.props.onToggle as () => void)();
      });
    }

    // SPA navigation for all links
    this.addEventListener(this.element!, 'click', (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-link]') as HTMLAnchorElement;
      if (link) {
        e.preventDefault();
        router.navigate(link.pathname);
      }
    });
  }

  protected onMount(): void {
    // Subscribe to route changes to update active state
    router.subscribe(() => {
      this.update();
    });
  }
}
