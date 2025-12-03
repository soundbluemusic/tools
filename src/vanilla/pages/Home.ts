/**
 * Home Page - Vanilla TypeScript
 * Main dashboard with dynamic app grid
 */
import { Component, html } from '../../core';
import { router } from '../../core/Router';
import { languageStore } from '../../core/Store';
import { getAppsSorted } from '../config';
import type { AppConfig } from '../config';

export class HomePage extends Component {
  protected render(): string {
    const language = languageStore.getState().language;
    const apps = getAppsSorted();

    const title = 'Tools';
    const description =
      language === 'ko'
        ? '무료 온라인 도구 모음'
        : 'Free Online Productivity Tools';

    return html`
      <div class="max-w-container-xl mx-auto px-4 py-8">
        <header class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-text-primary mb-2">${title}</h1>
          <p class="text-text-secondary text-lg">${description}</p>
        </header>

        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          ${apps.map((app) => this.renderAppCard(app, language)).join('')}
        </div>

        <p class="mt-8 text-center text-sm text-text-tertiary">
          ${language === 'ko'
            ? '바닐라 TypeScript로 구동됩니다.'
            : 'Powered by Vanilla TypeScript.'}
        </p>
      </div>
    `;
  }

  private renderAppCard(app: AppConfig, language: 'ko' | 'en'): string {
    return html`
      <a
        href="${app.url}"
        class="group block p-6 bg-bg-secondary border border-border-secondary rounded-lg hover:bg-bg-tertiary hover:border-accent-primary hover:shadow-lg transition-all duration-200"
        data-link
      >
        <span class="text-3xl mb-3 block">${app.icon}</span>
        <h2
          class="text-lg font-semibold text-text-primary mb-1 group-hover:text-accent-primary transition-colors"
        >
          ${language === 'ko' ? app.name.ko : app.name.en}
        </h2>
        <p class="text-sm text-text-secondary">
          ${language === 'ko' ? app.desc.ko : app.desc.en}
        </p>
      </a>
    `;
  }

  protected bindEvents(): void {
    // SPA navigation for app cards
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
    // Subscribe to language changes
    languageStore.subscribe(() => {
      this.update();
    });
  }
}
