/**
 * Home Page - Vanilla TypeScript
 * Placeholder for main dashboard
 */
import { Component, html } from '../../core';
import { languageStore } from '../../core/Store';

export class HomePage extends Component {
  protected render(): string {
    const language = languageStore.getState().language;

    const title = language === 'ko' ? 'Tools' : 'Tools';
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

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Metronome -->
          <a
            href="/metronome"
            class="block p-6 bg-bg-secondary border border-border-secondary rounded-lg hover:bg-bg-tertiary hover:border-border-primary transition-colors"
            data-link
          >
            <span class="text-3xl mb-2 block">🎵</span>
            <h2 class="text-lg font-semibold text-text-primary mb-1">
              ${language === 'ko' ? '메트로놈' : 'Metronome'}
            </h2>
            <p class="text-sm text-text-secondary">
              ${language === 'ko'
                ? '정밀한 박자 연습 도구'
                : 'Precision tempo practice tool'}
            </p>
          </a>

          <!-- Drum Machine -->
          <a
            href="/drum"
            class="block p-6 bg-bg-secondary border border-border-secondary rounded-lg hover:bg-bg-tertiary hover:border-border-primary transition-colors"
            data-link
          >
            <span class="text-3xl mb-2 block">🥁</span>
            <h2 class="text-lg font-semibold text-text-primary mb-1">
              ${language === 'ko' ? '드럼머신' : 'Drum Machine'}
            </h2>
            <p class="text-sm text-text-secondary">
              ${language === 'ko'
                ? '16스텝 드럼 시퀀서'
                : '16-step drum sequencer'}
            </p>
          </a>

          <!-- Drum Synth -->
          <a
            href="/drum-synth"
            class="block p-6 bg-bg-secondary border border-border-secondary rounded-lg hover:bg-bg-tertiary hover:border-border-primary transition-colors"
            data-link
          >
            <span class="text-3xl mb-2 block">🎛️</span>
            <h2 class="text-lg font-semibold text-text-primary mb-1">
              ${language === 'ko' ? '드럼 신스' : 'Drum Synth'}
            </h2>
            <p class="text-sm text-text-secondary">
              ${language === 'ko'
                ? '드럼 사운드 신디사이저'
                : 'Drum sound synthesizer'}
            </p>
          </a>

          <!-- QR Code -->
          <a
            href="/qr"
            class="block p-6 bg-bg-secondary border border-border-secondary rounded-lg hover:bg-bg-tertiary hover:border-border-primary transition-colors"
            data-link
          >
            <span class="text-3xl mb-2 block">📱</span>
            <h2 class="text-lg font-semibold text-text-primary mb-1">
              ${language === 'ko' ? 'QR 코드' : 'QR Code'}
            </h2>
            <p class="text-sm text-text-secondary">
              ${language === 'ko' ? 'QR 코드 생성기' : 'QR code generator'}
            </p>
          </a>
        </div>

        <p class="mt-8 text-center text-sm text-text-tertiary">
          ${language === 'ko'
            ? '바닐라 TypeScript로 구동됩니다.'
            : 'Powered by Vanilla TypeScript.'}
        </p>
      </div>
    `;
  }
}
