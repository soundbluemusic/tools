/**
 * 404 Not Found Page - Vanilla TypeScript
 */
import { Component, html } from '../../core';
import { router } from '../../core/Router';
import { languageStore } from '../../core/Store';

export class NotFoundPage extends Component {
  protected render(): string {
    const language = languageStore.getState().language;
    return html`
      <main
        class="max-w-container-md mx-auto animate-[fadeIn_0.2s_ease-out]"
        role="main"
      >
        <div class="text-center py-16 px-4 sm:py-8 sm:px-3">
          <h1
            class="text-[6rem] sm:text-[4rem] font-bold text-text-tertiary leading-none mb-4"
          >
            404
          </h1>
          <h2 class="text-2xl sm:text-xl font-semibold mb-3 text-text-primary">
            ${language === 'ko'
              ? '페이지를 찾을 수 없습니다'
              : 'Page Not Found'}
          </h2>
          <p class="text-text-secondary mb-8">
            ${language === 'ko'
              ? '요청하신 페이지가 존재하지 않거나 이동되었습니다.'
              : 'The page you requested does not exist or has been moved.'}
          </p>
          <a
            href="${router.localizeUrl('/')}"
            class="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-md font-medium transition-colors duration-fast hover:bg-accent-hover"
            data-link
          >
            ${language === 'ko' ? '← 홈으로 돌아가기' : '← Back to Home'}
          </a>
        </div>
      </main>
    `;
  }

  protected bindEvents(): void {
    // Handle SPA navigation
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
