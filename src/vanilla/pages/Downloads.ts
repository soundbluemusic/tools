/**
 * Downloads Page - Vanilla TypeScript
 * Provides standalone HTML downloads for individual tools
 */

import { Component, html } from '../../core/Component';

interface DownloadItem {
  id: string;
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  fileName: string;
  fileSize: string;
  icon: string;
  features: { ko: string[]; en: string[] };
}

const DOWNLOADS: DownloadItem[] = [
  {
    id: 'metronome',
    name: { ko: '메트로놈', en: 'Metronome' },
    description: {
      ko: '음악가를 위한 정밀 메트로놈. 오프라인에서도 작동하는 독립 실행형 앱입니다.',
      en: 'Precision metronome for musicians. Standalone app that works offline.',
    },
    fileName: 'metronome.html',
    fileSize: '~230KB',
    icon: '🎵',
    features: {
      ko: [
        '다운로드 후 더블클릭으로 바로 실행',
        '인터넷 연결 불필요 (오프라인 작동)',
        '창 크기 자유롭게 조절 가능',
        '다크/라이트 모드 지원',
        '한국어/영어 지원',
      ],
      en: [
        'Double-click to run after download',
        'No internet required (works offline)',
        'Resizable window',
        'Dark/Light mode support',
        'Korean/English support',
      ],
    },
  },
  {
    id: 'drum',
    name: { ko: '드럼머신', en: 'Drum Machine' },
    description: {
      ko: '16스텝 드럼 시퀀서. 테크노, 하우스, 트랩 등 다양한 프리셋과 멀티 루프 지원.',
      en: '16-step drum sequencer with techno, house, trap presets and multi-loop support.',
    },
    fileName: 'drum.html',
    fileSize: '~200KB',
    icon: '🥁',
    features: {
      ko: [
        '16스텝 시퀀서',
        '5가지 드럼 사운드 (킥, 스네어, 하이햇, 오픈햇, 클랩)',
        '최대 4개 루프 체인',
        '5가지 프리셋 패턴',
        '웹 오디오 실시간 합성',
      ],
      en: [
        '16-step sequencer',
        '5 drum sounds (kick, snare, hihat, open hat, clap)',
        'Up to 4 loop chains',
        '5 preset patterns',
        'Real-time Web Audio synthesis',
      ],
    },
  },
  {
    id: 'drum-synth',
    name: { ko: '드럼 사운드 신스', en: 'Drum Sound Synth' },
    description: {
      ko: '세부 파라미터 조절이 가능한 드럼 사운드 신디사이저.',
      en: 'Drum sound synthesizer with detailed parameter control.',
    },
    fileName: 'drum-synth.html',
    fileSize: '~220KB',
    icon: '🎛️',
    features: {
      ko: [
        '6가지 드럼 타입 (킥, 스네어, 하이햇, 클랩, 탐, 림)',
        '각 드럼별 세부 파라미터 조절',
        '5가지 프리셋 (808, 하드 테크노, 로파이 등)',
        '마스터 볼륨 컨트롤',
        '실시간 사운드 미리듣기',
      ],
      en: [
        '6 drum types (kick, snare, hihat, clap, tom, rim)',
        'Detailed parameter control per drum',
        '5 presets (808, Hard Techno, Lo-Fi, etc.)',
        'Master volume control',
        'Real-time sound preview',
      ],
    },
  },
  {
    id: 'qr',
    name: { ko: 'QR 코드 생성기', en: 'QR Code Generator' },
    description: {
      ko: '고복구율 투명 배경 QR 코드 생성기. 검정/흰색 QR 코드를 PNG로 다운로드.',
      en: 'High-recovery transparent QR code generator. Download black/white QR as PNG.',
    },
    fileName: 'qr.html',
    fileSize: '~250KB',
    icon: '📱',
    features: {
      ko: [
        '4가지 오류 복구 레벨 (L/M/Q/H)',
        '검정 & 흰색 QR 코드',
        '투명 배경 PNG (1024x1024)',
        '클립보드 복사 지원',
        '즉시 다운로드',
      ],
      en: [
        '4 error correction levels (L/M/Q/H)',
        'Black & white QR codes',
        'Transparent PNG (1024x1024)',
        'Clipboard copy support',
        'Instant download',
      ],
    },
  },
];

const TRANSLATIONS = {
  ko: {
    title: '도구 다운로드',
    description:
      '각 도구를 독립 실행형 파일로 다운로드하세요. 브라우저만 있으면 오프라인에서도 사용할 수 있습니다.',
    breadcrumbHome: '홈',
    howToUseTitle: '사용 방법',
    howToUseSteps: [
      '아래에서 원하는 도구의 "다운로드" 버튼을 클릭',
      '다운로드된 .html 파일을 원하는 위치에 저장',
      '파일을 더블클릭하면 브라우저에서 바로 실행',
    ],
    downloading: '다운로드 중...',
    success: '완료!',
    error: '실패 - 다시 시도',
    download: '다운로드',
    note: '※ 모든 도구는 단일 HTML 파일로, 브라우저만 있으면 어디서든 작동합니다.',
  },
  en: {
    title: 'Download Tools',
    description:
      'Download each tool as a standalone file. Works offline with just a browser.',
    breadcrumbHome: 'Home',
    howToUseTitle: 'How to Use',
    howToUseSteps: [
      'Click the "Download" button for the tool you want',
      'Save the downloaded .html file to your preferred location',
      'Double-click the file to run it in your browser',
    ],
    downloading: 'Downloading...',
    success: 'Done!',
    error: 'Failed - Retry',
    download: 'Download',
    note: '※ All tools are single HTML files that work anywhere with a browser.',
  },
};

type Language = 'ko' | 'en';

interface DownloadsPageState {
  language: Language;
  downloadStatus: Record<string, string>;
  [key: string]: unknown;
}

interface DownloadsPageProps {
  [key: string]: unknown;
}

export class DownloadsPage extends Component<
  DownloadsPageProps,
  DownloadsPageState
> {
  private handleStorageChange: ((e: StorageEvent) => void) | null = null;
  private statusTimeouts: Map<string, ReturnType<typeof setTimeout>> =
    new Map();

  protected getInitialState(): DownloadsPageState {
    const lang = (localStorage.getItem('tools-language') || 'en') as Language;
    return {
      language: lang,
      downloadStatus: {},
    };
  }

  private get t() {
    return TRANSLATIONS[this.state.language];
  }

  private async handleDownload(item: DownloadItem): Promise<void> {
    this.setState({
      downloadStatus: {
        ...this.state.downloadStatus,
        [item.id]: 'downloading',
      },
    });

    try {
      const response = await fetch(`/standalone/${item.fileName}`);
      if (!response.ok) throw new Error('Download failed');

      let htmlContent = await response.text();

      // MIT License attribution
      const licenseComment = `<!--
  MIT License
  Copyright (c) SoundBlueMusic
  Source Code: https://github.com/soundbluemusic/tools
  Website: https://tools.soundbluemusic.com/
-->
`;

      const attributionFooter = `
<footer style="margin-top:auto;padding:16px;text-align:center;font-size:12px;color:#737373;border-top:1px solid var(--color-border-secondary,#e7e5e4);">
  <p style="margin:0;">
    MIT License © <a href="https://tools.soundbluemusic.com/" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">SoundBlueMusic</a>
    · <a href="https://github.com/soundbluemusic/tools" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">GitHub</a>
  </p>
</footer>
`;

      htmlContent = htmlContent.replace(/<head>/i, `<head>\n${licenseComment}`);
      htmlContent = htmlContent.replace(
        /<\/body>/i,
        `${attributionFooter}</body>`
      );

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.setState({
        downloadStatus: { ...this.state.downloadStatus, [item.id]: 'success' },
      });
      // Clear any existing timeout for this item
      const existingTimeout = this.statusTimeouts.get(item.id);
      if (existingTimeout) clearTimeout(existingTimeout);
      const timeout = setTimeout(() => {
        this.statusTimeouts.delete(item.id);
        this.setState({
          downloadStatus: { ...this.state.downloadStatus, [item.id]: '' },
        });
      }, 2000);
      this.statusTimeouts.set(item.id, timeout);
    } catch {
      this.setState({
        downloadStatus: { ...this.state.downloadStatus, [item.id]: 'error' },
      });
      // Clear any existing timeout for this item
      const existingTimeout = this.statusTimeouts.get(item.id);
      if (existingTimeout) clearTimeout(existingTimeout);
      const timeout = setTimeout(() => {
        this.statusTimeouts.delete(item.id);
        this.setState({
          downloadStatus: { ...this.state.downloadStatus, [item.id]: '' },
        });
      }, 3000);
      this.statusTimeouts.set(item.id, timeout);
    }
  }

  private getButtonText(status: string): string {
    if (status === 'downloading') return this.t.downloading;
    if (status === 'success') return this.t.success;
    if (status === 'error') return this.t.error;
    return this.t.download;
  }

  protected render(): string {
    const { language, downloadStatus } = this.state;

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

        <!-- Content -->
        <main class="px-4 pb-8 sm:px-6">
          <!-- How to use -->
          <section class="mb-8 rounded-lg bg-bg-tertiary p-6 sm:p-4">
            <h2 class="mb-4 text-lg font-semibold text-text-primary">
              ${this.t.howToUseTitle}
            </h2>
            <ol
              class="list-decimal pl-6 leading-relaxed text-text-secondary [&>li]:mb-2"
            >
              ${this.t.howToUseSteps
                .map((step) => html`<li class="text-sm">${step}</li>`)
                .join('')}
            </ol>
          </section>

          <!-- Download items -->
          <section class="flex flex-col gap-6">
            ${DOWNLOADS.map((item) => {
              const status = downloadStatus[item.id] || '';
              return html`
                <article
                  class="rounded-lg border border-border-primary bg-bg-secondary p-6 transition-shadow duration-150 hover:shadow-md sm:p-4"
                >
                  <div class="mb-4 flex gap-4 sm:flex-col sm:gap-3">
                    <span
                      class="shrink-0 text-[2.5rem] leading-none sm:text-[2rem]"
                    >
                      ${item.icon}
                    </span>
                    <div class="flex-1">
                      <h3 class="mb-1 text-xl font-semibold text-text-primary">
                        ${item.name[language]}
                      </h3>
                      <p class="text-sm text-text-secondary">
                        ${item.description[language]}
                      </p>
                    </div>
                  </div>

                  <div class="mb-4 rounded-md bg-bg-tertiary p-4">
                    <ul class="m-0 grid list-none gap-2 p-0">
                      ${item.features[language]
                        .map(
                          (feature) => html`
                            <li
                              class="relative pl-5 text-sm text-text-secondary before:absolute before:left-0 before:font-bold before:text-success before:content-['✓']"
                            >
                              ${feature}
                            </li>
                          `
                        )
                        .join('')}
                    </ul>
                  </div>

                  <div
                    class="flex items-center justify-between gap-4 border-t border-border-secondary pt-4 sm:flex-col sm:items-stretch"
                  >
                    <div
                      class="flex gap-3 text-xs text-text-tertiary sm:mb-2 sm:justify-center"
                    >
                      <span class="font-mono">${item.fileName}</span>
                      <span class="opacity-80">${item.fileSize}</span>
                    </div>
                    <button
                      class="flex cursor-pointer items-center gap-2 rounded-md border-none px-5 py-3 text-sm font-medium transition-colors duration-150 sm:justify-center ${status ===
                      'success'
                        ? 'bg-success text-white'
                        : status === 'error'
                          ? 'bg-error text-white'
                          : 'bg-accent-primary text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70'}"
                      data-download="${item.id}"
                      ${status === 'downloading' ? 'disabled' : ''}
                    >
                      ${status === 'downloading'
                        ? html`
                            <svg
                              class="animate-spin"
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-dasharray="31.4"
                                stroke-dashoffset="10"
                              />
                            </svg>
                          `
                        : status === 'success'
                          ? html`
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            `
                          : html`
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <path
                                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            `}
                      <span>${this.getButtonText(status)}</span>
                    </button>
                  </div>
                </article>
              `;
            }).join('')}
          </section>

          <!-- Note -->
          <p class="mt-8 text-center text-sm text-text-tertiary">
            ${this.t.note}
          </p>
        </main>
      </div>
    `;
  }

  protected bindEvents(): void {
    // Download buttons
    this.queryAll('[data-download]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-download');
        const item = DOWNLOADS.find((d) => d.id === id);
        if (item) {
          this.handleDownload(item);
        }
      });
    });

    // Language change listener - store reference for cleanup
    this.handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tools-language') {
        const lang = (e.newValue || 'en') as Language;
        this.setState({ language: lang });
      }
    };
    window.addEventListener('storage', this.handleStorageChange);
  }

  protected onDestroy(): void {
    // Clean up storage listener
    if (this.handleStorageChange) {
      window.removeEventListener('storage', this.handleStorageChange);
      this.handleStorageChange = null;
    }

    // Clean up all pending timeouts
    this.statusTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.statusTimeouts.clear();
  }
}
