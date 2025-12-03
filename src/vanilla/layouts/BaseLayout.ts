/**
 * Base Layout - Vanilla TypeScript
 * Provides header, footer, and main content area
 */
import { Component, html } from '../../core';
import { router } from '../../core/Router';
import { themeStore, languageStore } from '../../core/Store';

export interface BaseLayoutProps {
  [key: string]: unknown;
  title?: string;
  description?: string;
}

export class BaseLayout extends Component<BaseLayoutProps> {
  private contentComponent: Component | null = null;

  protected render(): string {
    const theme = themeStore.getState().theme;
    const language = languageStore.getState().language;

    return html`
      <div class="min-h-screen bg-bg-primary text-text-primary">
        <!-- Header -->
        <header
          class="fixed top-0 left-0 right-0 z-fixed h-14 bg-bg-primary border-b border-border-primary"
        >
          <div
            class="max-w-container-xl mx-auto h-full px-4 flex items-center justify-between"
          >
            <a
              href="/"
              class="text-xl font-bold text-text-primary hover:text-accent-primary transition-colors"
              data-link
            >
              Tools
            </a>
            <div class="flex items-center gap-2">
              <!-- Theme Toggle -->
              <button
                id="theme-toggle"
                class="p-2 rounded-md hover:bg-bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                ${theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <!-- Language Toggle -->
              <button
                id="lang-toggle"
                class="px-3 py-1 text-sm font-medium rounded-md hover:bg-bg-secondary transition-colors"
              >
                ${language === 'ko' ? 'EN' : '한국어'}
              </button>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main id="app-content" class="pt-14 pb-16 min-h-screen">
          <!-- Content will be rendered here -->
        </main>

        <!-- Footer -->
        <footer class="border-t border-border-primary py-8 px-4">
          <div
            class="max-w-container-xl mx-auto text-center text-sm text-text-tertiary"
          >
            <p>© ${new Date().getFullYear()} Tools. Open Source.</p>
            <div class="mt-2 flex justify-center gap-4">
              <a href="/privacy" class="hover:text-text-primary" data-link
                >Privacy</a
              >
              <a href="/terms" class="hover:text-text-primary" data-link
                >Terms</a
              >
              <a href="/opensource" class="hover:text-text-primary" data-link
                >Open Source</a
              >
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  protected bindEvents(): void {
    // Theme toggle
    this.addEventListenerById('theme-toggle', 'click', () => {
      const current = themeStore.getState().theme;
      const newTheme = current === 'dark' ? 'light' : 'dark';
      themeStore.setState({ theme: newTheme });
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
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

    // Handle SPA navigation for all links with data-link
    this.addEventListener(document.body, 'click', (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-link]') as HTMLAnchorElement;
      if (link) {
        e.preventDefault();
        router.navigate(link.pathname);
      }
    });
  }

  /**
   * Set the content component to render in the main area
   */
  setContent(component: Component): void {
    this.contentComponent = component;
    const contentEl = document.getElementById('app-content');
    if (contentEl && this.contentComponent) {
      this.contentComponent.mount(contentEl);
    }
  }
}
