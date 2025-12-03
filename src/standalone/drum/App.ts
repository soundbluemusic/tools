/**
 * Standalone Drum Machine App - Vanilla TypeScript
 * Self-contained app with header controls
 */
import { Component, html } from '../../core';
import { DrumMachine } from '../../vanilla/apps/drum/DrumMachine';
import {
  createStandaloneSettings,
  type StandaloneSettings,
} from '../common/standaloneSettings';
import { getTranslations } from './i18n';

interface StandaloneAppState {
  [key: string]: unknown;
}

export class StandaloneDrumApp extends Component<
  Record<string, unknown>,
  StandaloneAppState
> {
  private settings: StandaloneSettings;
  private drumMachine: DrumMachine | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super();
    this.settings = createStandaloneSettings('drum');
  }

  protected getInitialState(): StandaloneAppState {
    return {};
  }

  protected render(): string {
    const t = getTranslations(this.settings.language);
    const { theme, language } = this.settings;

    return html`
      <div class="standalone-app standalone-app--wide">
        <!-- Header with controls -->
        <header class="standalone-header">
          <h1 class="standalone-title">${t.title}</h1>
          <div class="standalone-controls">
            <!-- Language Toggle -->
            <button
              id="lang-toggle"
              class="standalone-btn"
              title="${t.language}"
              aria-label="${t.language}"
            >
              ${language === 'ko' ? 'EN' : '한국어'}
            </button>

            <!-- Theme Toggle -->
            <button
              id="theme-toggle"
              class="standalone-btn"
              title="${theme === 'light' ? t.darkMode : t.lightMode}"
              aria-label="${theme === 'light' ? t.darkMode : t.lightMode}"
            >
              ${theme === 'light'
                ? html`
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                      />
                    </svg>
                  `
                : html`
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  `}
            </button>
          </div>
        </header>

        <!-- Drum Machine -->
        <main class="standalone-main">
          <div id="drum-container"></div>
        </main>
      </div>
    `;
  }

  protected onMount(): void {
    // Subscribe to settings changes
    this.unsubscribe = this.settings.subscribe(() => {
      this.update();
      this.mountDrumMachine();
    });

    // Setup event listeners
    this.setupEventListeners();

    // Mount drum machine
    this.mountDrumMachine();
  }

  protected onDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.drumMachine) {
      this.drumMachine.unmount();
      this.drumMachine = null;
    }
  }

  private setupEventListeners(): void {
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        this.settings.toggleLanguage();
      });
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.settings.toggleTheme();
      });
    }
  }

  private mountDrumMachine(): void {
    // Unmount existing player
    if (this.drumMachine) {
      this.drumMachine.unmount();
    }

    // Mount new player
    const container = document.getElementById('drum-container');
    if (container) {
      this.drumMachine = new DrumMachine();
      this.drumMachine.mount(container);
    }
  }
}
