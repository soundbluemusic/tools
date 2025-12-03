/**
 * QR Code Generator Page - Vanilla TypeScript
 */
import { Component, html } from '../../core';
import { languageStore } from '../../core/Store';
import { QRGenerator } from '../apps/qr';

const translations = {
  ko: {
    title: 'QR 코드 생성기',
    description: '투명 배경의 고해상도 QR 코드를 생성합니다',
    breadcrumb: {
      home: '홈',
      qr: 'QR 코드 생성기',
    },
  },
  en: {
    title: 'QR Code Generator',
    description:
      'Generate high-resolution QR codes with transparent backgrounds',
    breadcrumb: {
      home: 'Home',
      qr: 'QR Code Generator',
    },
  },
};

export class QRPage extends Component {
  private qrGenerator: QRGenerator | null = null;
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
            <li class="text-text-primary font-medium">${t.breadcrumb.qr}</li>
          </ol>
        </nav>

        <!-- Header -->
        <header class="mb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            ${t.title}
          </h1>
          <p class="text-text-secondary">${t.description}</p>
        </header>

        <!-- QR Generator -->
        <div id="qr-generator-container"></div>
      </div>
    `;
  }

  protected onMount(): void {
    // Subscribe to language changes
    this.languageUnsubscribe = languageStore.subscribe(() => {
      this.update();
    });

    // Mount QR Generator
    const container = document.getElementById('qr-generator-container');
    if (container) {
      this.qrGenerator = new QRGenerator({});
      this.qrGenerator.mount(container);
    }
  }

  protected onDestroy(): void {
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
    }
    if (this.qrGenerator) {
      this.qrGenerator.unmount();
    }
  }
}
