/**
 * Sidebar Component - Vanilla TypeScript
 * Desktop left navigation with app links
 */
import { Component, html } from '../../core';
import { router } from '../../core/Router';
import { languageStore } from '../../core/Store';

export interface SidebarApp {
  url: string;
  name: { ko: string; en: string };
  icon: string;
}

export interface SidebarProps {
  [key: string]: unknown;
  apps?: SidebarApp[];
  isOpen?: boolean;
}

// App categories
const MUSIC_APP_PATHS = ['/metronome', '/drum', '/drum-synth'];
const COMBINED_APP_PATHS = ['/drum-tool'];

export class Sidebar extends Component<SidebarProps> {
  protected render(): string {
    const language = languageStore.getState().language;
    const { apps = [], isOpen = true } = this.props;
    const currentPath = window.location.pathname;

    // Filter apps by category
    const musicApps = apps.filter((app) => MUSIC_APP_PATHS.includes(app.url));
    const combinedApps = apps.filter((app) =>
      COMBINED_APP_PATHS.includes(app.url)
    );
    const otherApps = apps.filter(
      (app) =>
        !MUSIC_APP_PATHS.includes(app.url) &&
        !COMBINED_APP_PATHS.includes(app.url)
    );

    // Compare paths without language prefix for active state
    const cleanCurrentPath = router.stripLangPrefix(currentPath);
    const isActive = (path: string) => cleanCurrentPath === path;

    const renderNavLink = (
      url: string,
      icon: string,
      label: string,
      isIconSvg = false
    ) => {
      const active = isActive(url);
      const localizedUrl = router.localizeUrl(url);
      return html`
        <a
          href="${localizedUrl}"
          class="flex items-center gap-3 h-10 px-3 rounded-lg text-sm no-underline ${active
            ? 'bg-interactive-active text-text-primary font-medium'
            : 'text-text-secondary font-normal hover:bg-interactive-hover hover:text-text-primary'}"
          data-link
        >
          ${isIconSvg
            ? icon
            : html`<span
                class="w-6 h-6 flex-shrink-0 flex items-center justify-center text-lg"
                >${icon}</span
              >`}
          <span class="truncate">${label}</span>
        </a>
      `;
    };

    const homeIcon = isActive('/')
      ? html`<svg
          class="w-6 h-6 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
        </svg>`
      : html`<svg
          class="w-6 h-6 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm2-2h2v-6h8v6h2V11l-6-5.25L6 11v8z"
          />
        </svg>`;

    const menuIcon = html`<svg
      class="w-6 h-6 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>`;

    return html`
      <aside
        class="hidden lg:flex lg:fixed lg:top-14 lg:left-0 lg:bottom-0 lg:flex-col bg-bg-primary overflow-y-auto overflow-x-hidden z-50 transition-all duration-200 ${isOpen
          ? 'lg:w-sidebar lg:border-r lg:border-border-primary'
          : 'lg:w-0 lg:border-r-0 lg:overflow-hidden'}"
      >
        <nav class="flex flex-col py-3 px-2">
          <!-- Home -->
          ${renderNavLink(
            '/',
            homeIcon,
            language === 'ko' ? '홈' : 'Home',
            true
          )}

          <div class="h-px mx-3 my-2 bg-border-primary"></div>

          <!-- Music Section -->
          ${musicApps.length > 0
            ? html`
                <div
                  class="pt-4 pb-2 px-3 text-text-tertiary text-[11px] font-semibold uppercase tracking-wide"
                >
                  ${language === 'ko' ? '음악 도구' : 'Music Tools'}
                </div>
                ${musicApps
                  .map((app) =>
                    renderNavLink(
                      app.url,
                      app.icon,
                      language === 'ko' ? app.name.ko : app.name.en
                    )
                  )
                  .join('')}
                <div class="h-px mx-3 my-2 bg-border-primary"></div>
              `
            : ''}

          <!-- Combined Tools -->
          ${combinedApps.length > 0
            ? html`
                <div
                  class="pt-4 pb-2 px-3 text-text-tertiary text-[11px] font-semibold uppercase tracking-wide"
                >
                  ${language === 'ko' ? '결합 도구' : 'Combined Tools'}
                </div>
                ${combinedApps
                  .map((app) =>
                    renderNavLink(
                      app.url,
                      app.icon,
                      language === 'ko' ? app.name.ko : app.name.en
                    )
                  )
                  .join('')}
                <div class="h-px mx-3 my-2 bg-border-primary"></div>
              `
            : ''}

          <!-- Other Tools -->
          ${otherApps.length > 0
            ? html`
                <div
                  class="pt-4 pb-2 px-3 text-text-tertiary text-[11px] font-semibold uppercase tracking-wide"
                >
                  ${language === 'ko' ? '기타 도구' : 'Other Tools'}
                </div>
                ${otherApps
                  .map((app) =>
                    renderNavLink(
                      app.url,
                      app.icon,
                      language === 'ko' ? app.name.ko : app.name.en
                    )
                  )
                  .join('')}
                <div class="h-px mx-3 my-2 bg-border-primary"></div>
              `
            : ''}

          <!-- Menu / Sitemap -->
          ${renderNavLink(
            '/sitemap',
            menuIcon,
            language === 'ko' ? '메뉴' : 'Menu',
            true
          )}
        </nav>
      </aside>
    `;
  }

  protected bindEvents(): void {
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

    // Subscribe to language changes
    languageStore.subscribe(() => {
      this.update();
    });
  }
}
