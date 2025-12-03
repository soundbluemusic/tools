/**
 * Drum Machine Page - Vanilla TypeScript
 */
import { Component, html } from '../../core';
import { languageStore } from '../../core/Store';
import { DrumMachine } from '../apps/drum';

const translations = {
  ko: {
    title: '드럼 머신',
    description: '드럼 패턴 연습을 위한 16스텝 시퀀서',
    breadcrumb: {
      home: '홈',
      drum: '드럼 머신',
    },
  },
  en: {
    title: 'Drum Machine',
    description: '16-step drum sequencer for pattern practice',
    breadcrumb: {
      home: 'Home',
      drum: 'Drum Machine',
    },
  },
};

export class DrumPage extends Component {
  private drumMachine: DrumMachine | null = null;
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
            <li class="text-text-primary font-medium">${t.breadcrumb.drum}</li>
          </ol>
        </nav>

        <!-- Header -->
        <header class="mb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            ${t.title}
          </h1>
          <p class="text-text-secondary">${t.description}</p>
        </header>

        <!-- Drum Machine -->
        <div id="drum-machine-container"></div>
      </div>
    `;
  }

  protected onMount(): void {
    // Subscribe to language changes
    this.languageUnsubscribe = languageStore.subscribe(() => {
      this.update();
    });

    // Mount Drum Machine
    const container = document.getElementById('drum-machine-container');
    if (container) {
      this.drumMachine = new DrumMachine({});
      this.drumMachine.mount(container);
    }
  }

  protected onDestroy(): void {
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
    }
    if (this.drumMachine) {
      this.drumMachine.unmount();
    }
  }
}
