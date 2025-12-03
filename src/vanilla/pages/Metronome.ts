/**
 * Metronome Page - Vanilla TypeScript
 */
import { Component, html } from '../../core';
import { languageStore } from '../../core/Store';
import { MetronomePlayer } from '../apps/metronome';

const translations = {
  ko: {
    title: '메트로놈',
    description: '음악가를 위한 정밀 메트로놈',
    breadcrumb: {
      home: '홈',
      metronome: '메트로놈',
    },
  },
  en: {
    title: 'Metronome',
    description: 'Precision metronome for musicians',
    breadcrumb: {
      home: 'Home',
      metronome: 'Metronome',
    },
  },
};

export class MetronomePage extends Component {
  private metronomePlayer: MetronomePlayer | null = null;
  private languageUnsubscribe: (() => void) | null = null;

  private getT() {
    const lang = languageStore.getState().language;
    return translations[lang];
  }

  protected render(): string {
    const t = this.getT();

    return html`
      <div class="max-w-container-xl mx-auto px-4 py-6">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm" aria-label="Breadcrumb">
          <ol class="flex items-center gap-2">
            <li>
              <a
                href="/"
                class="text-text-tertiary hover:text-text-primary"
                data-link
              >
                ${t.breadcrumb.home}
              </a>
            </li>
            <li class="text-text-tertiary">/</li>
            <li class="text-text-primary font-medium">
              ${t.breadcrumb.metronome}
            </li>
          </ol>
        </nav>

        <!-- Header -->
        <header class="mb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            ${t.title}
          </h1>
          <p class="text-text-secondary">${t.description}</p>
        </header>

        <!-- Metronome Player -->
        <div id="metronome-player-container"></div>
      </div>
    `;
  }

  protected onMount(): void {
    // Subscribe to language changes
    this.languageUnsubscribe = languageStore.subscribe(() => {
      this.update();
    });

    // Mount Metronome Player
    const container = document.getElementById('metronome-player-container');
    if (container) {
      this.metronomePlayer = new MetronomePlayer({});
      this.metronomePlayer.mount(container);
    }
  }

  protected onDestroy(): void {
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
    }
    if (this.metronomePlayer) {
      this.metronomePlayer.unmount();
    }
  }
}
