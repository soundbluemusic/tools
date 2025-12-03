/**
 * Combined Tools Category Page - Vanilla TypeScript
 */

import { Component, html } from '../../core/Component';
import { APPS, type AppConfig } from '../config';

const TRANSLATIONS = {
  ko: {
    title: '모든 도구',
    description: '모든 도구를 한 곳에서 확인하세요',
    breadcrumbHome: '홈',
    noTools: '도구가 없습니다.',
  },
  en: {
    title: 'All Tools',
    description: 'View all tools in one place',
    breadcrumbHome: 'Home',
    noTools: 'No tools found.',
  },
};

type Language = 'ko' | 'en';

interface CombinedToolsPageState {
  language: Language;
  [key: string]: unknown;
}

interface CombinedToolsPageProps {
  [key: string]: unknown;
}

export class CombinedToolsPage extends Component<
  CombinedToolsPageProps,
  CombinedToolsPageState
> {
  protected getInitialState(): CombinedToolsPageState {
    const lang = (localStorage.getItem('tools-language') || 'en') as Language;
    return { language: lang };
  }

  private get t() {
    return TRANSLATIONS[this.state.language];
  }

  private get allApps(): AppConfig[] {
    return [...APPS].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }

  protected render(): string {
    const { language } = this.state;
    const apps = this.allApps;

    return html`
      <div
        class="min-h-screen bg-bg-primary p-4 sm:py-5 sm:px-6 md:py-6 md:px-8"
      >
        <!-- Breadcrumb -->
        <nav class="mb-4" aria-label="Breadcrumb">
          <ol class="flex items-center gap-2 text-sm text-text-secondary">
            <li>
              <a
                href="/"
                class="hover:text-text-primary transition-colors"
                data-link
              >
                ${this.t.breadcrumbHome}
              </a>
            </li>
            <li class="text-text-tertiary">/</li>
            <li class="text-text-primary font-medium">${this.t.title}</li>
          </ol>
        </nav>

        <!-- Header -->
        <div class="flex flex-col items-start gap-4 mb-4 md:mb-6">
          <div class="flex flex-col gap-1">
            <h1 class="text-xl md:text-2xl font-semibold m-0 text-text-primary">
              ${this.t.title}
            </h1>
            <p class="m-0 text-[0.95rem] text-text-secondary font-normal">
              ${this.t.description}
            </p>
          </div>
        </div>

        <!-- App Grid -->
        ${apps.length > 0
          ? html`
              <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                ${apps
                  .map(
                    (app) => html`
                      <a
                        href="${app.url}"
                        class="block p-4 bg-bg-secondary rounded-lg border border-border-primary hover:border-text-secondary hover:shadow-md transition-all"
                        data-link
                      >
                        <div class="flex items-start gap-3">
                          <span class="text-2xl">${app.icon}</span>
                          <div>
                            <h3
                              class="text-base font-semibold text-text-primary mb-1"
                            >
                              ${app.name[language]}
                            </h3>
                            <p class="text-sm text-text-secondary m-0">
                              ${app.desc[language]}
                            </p>
                          </div>
                        </div>
                      </a>
                    `
                  )
                  .join('')}
              </div>
            `
          : html`
              <p class="text-center text-text-secondary p-8 text-[0.95rem]">
                ${this.t.noTools}
              </p>
            `}
      </div>
    `;
  }

  protected onMount(): void {
    window.addEventListener('storage', this.handleStorageChange);
  }

  private handleStorageChange = (e: StorageEvent): void => {
    if (e.key === 'tools-language') {
      const lang = (e.newValue || 'en') as Language;
      this.setState({ language: lang });
    }
  };

  protected onDestroy(): void {
    window.removeEventListener('storage', this.handleStorageChange);
  }
}
