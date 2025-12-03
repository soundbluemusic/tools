/**
 * Drum Synth Page - Vanilla TypeScript
 */

import { Component, html } from '../../core/Component';
import { DrumSynth } from '../apps/drum-synth';

const TRANSLATIONS = {
  ko: {
    title: '드럼 사운드 신스',
    description: '세부 파라미터 조절이 가능한 드럼 사운드 신디사이저',
    breadcrumbHome: '홈',
    breadcrumbMusicTools: '음악 도구',
  },
  en: {
    title: 'Drum Sound Synth',
    description: 'Drum sound synthesizer with detailed parameter control',
    breadcrumbHome: 'Home',
    breadcrumbMusicTools: 'Music Tools',
  },
};

type Language = 'ko' | 'en';

interface DrumSynthPageState {
  language: Language;
  [key: string]: unknown;
}

interface DrumSynthPageProps {
  [key: string]: unknown;
}

export class DrumSynthPage extends Component<
  DrumSynthPageProps,
  DrumSynthPageState
> {
  private drumSynth: DrumSynth | null = null;

  protected getInitialState(): DrumSynthPageState {
    const lang = (localStorage.getItem('tools-language') || 'en') as Language;
    return { language: lang };
  }

  private get t() {
    return TRANSLATIONS[this.state.language];
  }

  protected render(): string {
    return html`
      <div class="min-h-screen bg-bg-primary">
        <!-- Breadcrumb -->
        <nav
          class="px-4 py-3 text-sm text-text-secondary sm:px-6"
          aria-label="Breadcrumb"
        >
          <ol class="flex items-center gap-2">
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
        <header class="px-4 pb-4 sm:px-6">
          <h1 class="text-xl font-semibold text-text-primary md:text-2xl">
            ${this.t.title}
          </h1>
          <p class="mt-1 text-sm text-text-secondary">${this.t.description}</p>
        </header>

        <!-- Main Content -->
        <main id="drum-synth-container"></main>
      </div>
    `;
  }

  protected onMount(): void {
    const container = this.query('#drum-synth-container');
    if (container) {
      this.drumSynth = new DrumSynth();
      this.drumSynth.mount(container);
    }

    // Language change listener
    window.addEventListener('storage', this.handleStorageChange);
  }

  private handleStorageChange = (e: StorageEvent): void => {
    if (e.key === 'tools-language') {
      const lang = (e.newValue || 'en') as Language;
      this.setState({ language: lang });
    }
  };

  protected onDestroy(): void {
    if (this.drumSynth) {
      this.drumSynth.unmount();
      this.drumSynth = null;
    }
    window.removeEventListener('storage', this.handleStorageChange);
  }
}
