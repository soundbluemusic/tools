/**
 * QR Generator Component - Vanilla TypeScript
 * Generates transparent background QR codes
 */
import { Component, html } from '../../../core';
import { escapeAttr } from '../../../core/render';
import { languageStore } from '../../../core/Store';
import {
  QR_SIZE,
  URL_DEBOUNCE_MS,
  COLOR_THRESHOLD,
  TIMEOUTS,
} from './constants';
import QRious from 'qrious';

type ErrorLevel = 'L' | 'M' | 'Q' | 'H';
type ColorMode = 'black' | 'white';

interface QRGeneratorProps {
  [key: string]: unknown;
}

interface QRGeneratorState {
  [key: string]: unknown;
  url: string;
  errorLevel: ErrorLevel;
  colorMode: ColorMode;
  qrBlack: string | null;
  qrWhite: string | null;
  copySuccess: boolean;
}

interface ErrorLevelInfo {
  level: ErrorLevel;
  recovery: string;
  use: string;
  desc: string;
}

const translations = {
  ko: {
    urlInput: 'URL 입력',
    urlLabel: '연결할 URL',
    urlPlaceholder: 'https://example.com',
    urlHelp: 'URL을 입력하면 즉시 QR 코드가 생성됩니다',
    errorCorrectionLevel: '오류 정정 레벨',
    level: '레벨',
    recoveryRate: '복원률',
    recommendedEnvironment: '권장 환경',
    description: '설명',
    onlineOnly: '온라인 전용',
    noDamageRisk: '손상 위험 없음',
    smallPrint: '소형 인쇄물',
    coatedSurface: '코팅된 표면',
    generalPrint: '일반 인쇄물',
    paperLabel: '종이, 라벨',
    outdoorLarge: '옥외/대형',
    highDamageRisk: '손상 가능성 높음',
    errorLevelInfo:
      '복원률이 낮을수록 인식률은 높아집니다. 크기가 작은 곳일수록 낮은 레벨의 복원률을 사용하는 것을 추천하지만, 위 표에 나온 대로 사용환경에 따라 적절한 균형을 찾는 것이 좋습니다.',
    qrCodeColor: 'QR 코드 색상',
    black: '검정',
    white: '흰색',
    generatedQrCode: '생성된 QR 코드',
    blackQrCode: '검정 QR 코드',
    whiteQrCode: '흰색 QR 코드',
    enterUrl: 'URL을 입력하세요',
    transparentBg: '투명 배경, 512x512 PNG',
    footer: 'QR 코드를 즉시 생성 • 데이터 저장 안함 • 무료 사용',
    copyImage: '이미지 복사',
    copied: '복사됨!',
    download: '다운로드',
    imageCopyNotSupported: '이미지 복사를 지원하지 않아 다운로드되었습니다.',
    imageOpenedInNewTab:
      '이미지가 새 탭에서 열렸습니다. 이미지를 길게 눌러 저장하거나 복사하세요.',
    imageDownloaded: '이미지가 다운로드되었습니다.',
    imageCopyConfirm:
      '이미지 복사가 지원되지 않습니다. 대신 다운로드하시겠습니까?',
    popupBlocked:
      '팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.',
    downloadFailed:
      '다운로드에 실패했습니다. 이미지를 우클릭하여 저장해주세요.',
  },
  en: {
    urlInput: 'URL Input',
    urlLabel: 'URL to connect',
    urlPlaceholder: 'https://example.com',
    urlHelp: 'QR code will be generated instantly when you enter URL',
    errorCorrectionLevel: 'Error Correction Level',
    level: 'Level',
    recoveryRate: 'Recovery',
    recommendedEnvironment: 'Recommended',
    description: 'Description',
    onlineOnly: 'Online only',
    noDamageRisk: 'No damage risk',
    smallPrint: 'Small prints',
    coatedSurface: 'Coated surface',
    generalPrint: 'General prints',
    paperLabel: 'Paper, Label',
    outdoorLarge: 'Outdoor/Large',
    highDamageRisk: 'High damage risk',
    errorLevelInfo:
      'Lower recovery rates result in higher recognition rates. Lower levels are recommended for smaller sizes, but find the right balance based on your environment as shown in the table above.',
    qrCodeColor: 'QR Code Color',
    black: 'Black',
    white: 'White',
    generatedQrCode: 'Generated QR Code',
    blackQrCode: 'Black QR Code',
    whiteQrCode: 'White QR Code',
    enterUrl: 'Enter URL',
    transparentBg: 'Transparent background, 512x512 PNG',
    footer: 'Generate QR codes instantly • No data stored • Free to use',
    copyImage: 'Copy Image',
    copied: 'Copied!',
    download: 'Download',
    imageCopyNotSupported: 'Image copy not supported, downloaded instead.',
    imageOpenedInNewTab:
      'Image opened in new tab. Long press the image to save or copy.',
    imageDownloaded: 'Image downloaded.',
    imageCopyConfirm: 'Image copy not supported. Download instead?',
    popupBlocked: 'Popup blocked. Please disable popup blocking and try again.',
    downloadFailed: 'Download failed. Right-click the image to save.',
  },
};

export class QRGenerator extends Component<QRGeneratorProps, QRGeneratorState> {
  private debounceTimer: number | null = null;
  private copySuccessTimeout: number | null = null;
  private languageUnsubscribe: (() => void) | null = null;

  protected getInitialState(): QRGeneratorState {
    return {
      url: '',
      errorLevel: 'H',
      colorMode: 'black',
      qrBlack: null,
      qrWhite: null,
      copySuccess: false,
    };
  }

  private getT() {
    const lang = languageStore.getState().language;
    return translations[lang];
  }

  private getErrorLevels(): ErrorLevelInfo[] {
    const t = this.getT();
    return [
      { level: 'L', recovery: '7%', use: t.onlineOnly, desc: t.noDamageRisk },
      { level: 'M', recovery: '15%', use: t.smallPrint, desc: t.coatedSurface },
      { level: 'Q', recovery: '25%', use: t.generalPrint, desc: t.paperLabel },
      {
        level: 'H',
        recovery: '30%',
        use: t.outdoorLarge,
        desc: t.highDamageRisk,
      },
    ];
  }

  protected render(): string {
    const t = this.getT();
    const { errorLevel, colorMode, qrBlack, qrWhite, copySuccess, url } =
      this.state;
    const errorLevels = this.getErrorLevels();
    const currentQR = colorMode === 'black' ? qrBlack : qrWhite;

    return html`
      <div class="w-full">
        <div
          class="bg-bg-tertiary border border-border-secondary rounded-lg shadow-md overflow-hidden p-4 sm:p-6"
        >
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <!-- Input Section -->
            <div class="flex flex-col gap-4 sm:gap-6">
              <h2
                class="text-base sm:text-lg md:text-xl font-semibold text-text-primary m-0 mb-3 sm:mb-4"
              >
                ${t.urlInput}
              </h2>

              <div class="flex flex-col">
                <label
                  class="block text-sm font-medium text-text-secondary mb-2"
                >
                  ${t.urlLabel}
                </label>
                <input
                  type="text"
                  id="qr-url-input"
                  value="${escapeAttr(url)}"
                  placeholder="${t.urlPlaceholder}"
                  class="w-full px-3 sm:px-4 py-3 border border-border-secondary rounded-md text-base bg-bg-primary text-text-primary outline-none transition-[border-color,box-shadow] duration-fast ease-default box-border focus:border-border-focus focus:shadow-focus placeholder:text-text-tertiary min-h-12 sm:min-h-0"
                />
                <p class="text-xs text-text-tertiary mt-1">${t.urlHelp}</p>
              </div>

              <div>
                <h3
                  class="text-base md:text-lg font-semibold text-text-primary m-0 mb-4"
                >
                  ${t.errorCorrectionLevel}
                </h3>
                <!-- Desktop: Table view -->
                <div class="overflow-x-auto mb-4 hidden sm:block">
                  <table class="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        <th
                          class="text-left px-3 py-2 font-medium text-text-secondary border-b border-border-secondary"
                        >
                          ${t.level}
                        </th>
                        <th
                          class="text-left px-3 py-2 font-medium text-text-secondary border-b border-border-secondary"
                        >
                          ${t.recoveryRate}
                        </th>
                        <th
                          class="text-left px-3 py-2 font-medium text-text-secondary border-b border-border-secondary"
                        >
                          ${t.recommendedEnvironment}
                        </th>
                        <th
                          class="text-left px-3 py-2 font-medium text-text-secondary border-b border-border-secondary"
                        >
                          ${t.description}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      ${errorLevels
                        .map(
                          (item) => html`
                            <tr>
                              <td
                                class="px-3 py-2 text-text-primary border-b border-border-secondary last:border-b-0 font-semibold"
                              >
                                ${item.level}
                              </td>
                              <td
                                class="px-3 py-2 text-text-primary border-b border-border-secondary last:border-b-0"
                              >
                                ${item.recovery}
                              </td>
                              <td
                                class="px-3 py-2 text-text-primary border-b border-border-secondary last:border-b-0"
                              >
                                ${item.use}
                              </td>
                              <td
                                class="px-3 py-2 text-text-primary border-b border-border-secondary last:border-b-0 text-text-secondary"
                              >
                                ${item.desc}
                              </td>
                            </tr>
                          `
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>

                <!-- Mobile: Card view -->
                <div class="flex flex-col gap-3 sm:hidden">
                  ${errorLevels
                    .map(
                      (item) => html`
                        <div
                          class="bg-bg-primary border border-border-secondary rounded-md p-3"
                        >
                          <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-lg text-info"
                              >${item.level}</span
                            >
                            <span
                              class="text-sm text-text-secondary bg-bg-tertiary px-2 py-1 rounded-sm"
                            >
                              ${item.recovery}
                            </span>
                          </div>
                          <div
                            class="text-sm font-medium text-text-primary mb-1"
                          >
                            ${item.use}
                          </div>
                          <div class="text-xs text-text-tertiary">
                            ${item.desc}
                          </div>
                        </div>
                      `
                    )
                    .join('')}
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  ${errorLevels
                    .map(
                      (item) => html`
                        <button
                          data-error-level="${item.level}"
                          class="px-3 sm:px-4 py-2 sm:py-3 rounded-md font-semibold cursor-pointer transition-all duration-fast ease-default border text-sm sm:text-base min-h-11 sm:min-h-0 ${errorLevel ===
                          item.level
                            ? 'bg-info border-info text-white shadow-md'
                            : 'border-border-secondary bg-bg-primary text-text-primary hover:bg-interactive-hover'}"
                        >
                          ${item.level}
                        </button>
                      `
                    )
                    .join('')}
                </div>

                <p class="text-sm text-text-secondary mt-4 leading-relaxed">
                  ${t.errorLevelInfo}
                </p>
              </div>

              <div>
                <h3
                  class="text-base md:text-lg font-semibold text-text-primary m-0 mb-4"
                >
                  ${t.qrCodeColor}
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    data-color-mode="black"
                    class="px-3 sm:px-4 py-2 sm:py-3 rounded-md font-semibold cursor-pointer transition-all duration-fast ease-default border text-sm sm:text-base min-h-11 sm:min-h-0 ${colorMode ===
                    'black'
                      ? 'bg-text-primary border-text-primary text-text-inverse shadow-md'
                      : 'border-border-secondary bg-bg-primary text-text-primary hover:bg-interactive-hover'}"
                  >
                    ${t.black}
                  </button>
                  <button
                    data-color-mode="white"
                    class="px-3 sm:px-4 py-2 sm:py-3 rounded-md font-semibold cursor-pointer transition-all duration-fast ease-default border text-sm sm:text-base min-h-11 sm:min-h-0 ${colorMode ===
                    'white'
                      ? 'bg-text-primary border-text-primary text-text-inverse shadow-md'
                      : 'border-border-secondary bg-bg-primary text-text-primary hover:bg-interactive-hover'}"
                  >
                    ${t.white}
                  </button>
                </div>
              </div>
            </div>

            <!-- QR Code Display Section -->
            <div class="flex flex-col gap-4 sm:gap-6">
              <h2
                class="text-base sm:text-lg md:text-xl font-semibold text-text-primary m-0 mb-3 sm:mb-4"
              >
                ${t.generatedQrCode}
              </h2>

              <div class="bg-bg-secondary rounded-lg p-4 sm:p-6">
                <h3
                  class="text-lg font-semibold text-text-primary m-0 mb-4 text-center"
                >
                  ${colorMode === 'black' ? t.blackQrCode : t.whiteQrCode}
                </h3>
                <div
                  class="rounded-md p-4 sm:p-6 mb-4 flex justify-center items-center min-h-[200px] sm:min-h-[300px] ${colorMode ===
                  'black'
                    ? 'bg-bg-tertiary'
                    : 'bg-bg-primary'}"
                >
                  ${currentQR
                    ? html`
                        <img
                          src="${currentQR}"
                          alt="${colorMode === 'black'
                            ? 'Black'
                            : 'White'} QR Code"
                          class="w-full max-w-[300px] h-auto"
                        />
                      `
                    : html`
                        <div class="text-center text-text-tertiary">
                          <svg
                            class="w-12 h-12 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            />
                          </svg>
                          <p class="text-sm m-0">${t.enterUrl}</p>
                        </div>
                      `}
                </div>
                ${currentQR
                  ? html`
                      <div class="flex flex-col sm:flex-row gap-3">
                        <button
                          id="copy-btn"
                          class="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-md font-medium cursor-pointer transition-all duration-fast ease-default border bg-bg-primary border-border-secondary text-text-primary hover:bg-interactive-hover text-sm sm:text-base min-h-12 sm:min-h-0"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              stroke-width="2"
                            />
                            <path
                              stroke-width="2"
                              d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                            />
                          </svg>
                          ${copySuccess ? t.copied : t.copyImage}
                        </button>
                        <button
                          id="download-btn"
                          class="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-md font-medium cursor-pointer transition-all duration-fast ease-default border border-transparent bg-text-primary text-text-inverse hover:opacity-90 text-sm sm:text-base min-h-12 sm:min-h-0"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                            />
                          </svg>
                          ${t.download}
                        </button>
                      </div>
                    `
                  : ''}
                <p class="text-xs text-text-tertiary mt-3 text-center">
                  ${t.transparentBg}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-6 text-text-tertiary text-sm">
          <p class="m-0">${t.footer}</p>
        </div>
      </div>
    `;
  }

  protected bindEvents(): void {
    // URL input handler with debounce
    const urlInput = document.getElementById(
      'qr-url-input'
    ) as HTMLInputElement;
    if (urlInput) {
      this.addEventListener(urlInput, 'input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.setState({ url: target.value });

        // Debounce QR generation
        if (this.debounceTimer) {
          window.clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = window.setTimeout(() => {
          this.generateQR();
        }, URL_DEBOUNCE_MS);
      });
    }

    // Error level buttons
    this.addEventListener(this.element!, 'click', (e: Event) => {
      const target = e.target as HTMLElement;

      // Error level button
      const errorLevelBtn = target.closest('[data-error-level]') as HTMLElement;
      if (errorLevelBtn) {
        const level = errorLevelBtn.dataset.errorLevel as ErrorLevel;
        this.setState({ errorLevel: level });
        this.generateQR();
        return;
      }

      // Color mode button
      const colorModeBtn = target.closest('[data-color-mode]') as HTMLElement;
      if (colorModeBtn) {
        const mode = colorModeBtn.dataset.colorMode as ColorMode;
        this.setState({ colorMode: mode });
        return;
      }

      // Copy button
      if (target.closest('#copy-btn')) {
        this.copyImage();
        return;
      }

      // Download button
      if (target.closest('#download-btn')) {
        this.downloadQR();
        return;
      }
    });
  }

  protected onMount(): void {
    // Subscribe to language changes
    this.languageUnsubscribe = languageStore.subscribe(() => {
      this.update();
    });
  }

  protected onDestroy(): void {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }
    if (this.copySuccessTimeout) {
      window.clearTimeout(this.copySuccessTimeout);
    }
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
    }
  }

  private makeTransparent(canvas: HTMLCanvasElement, isWhite: boolean): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (isWhite) {
        if (
          r <= COLOR_THRESHOLD.BLACK &&
          g <= COLOR_THRESHOLD.BLACK &&
          b <= COLOR_THRESHOLD.BLACK
        ) {
          data[i + 3] = 0;
        } else {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        }
      } else {
        if (
          r >= COLOR_THRESHOLD.WHITE &&
          g >= COLOR_THRESHOLD.WHITE &&
          b >= COLOR_THRESHOLD.WHITE
        ) {
          data[i + 3] = 0;
        } else {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  private generateQR(): void {
    const { url, errorLevel } = this.state;
    const text = url.trim();

    if (!text) {
      this.setState({ qrBlack: null, qrWhite: null });
      return;
    }

    // Generate black QR
    const canvas1 = document.createElement('canvas');
    new QRious({
      element: canvas1,
      value: text,
      size: QR_SIZE,
      level: errorLevel,
      background: 'white',
      foreground: 'black',
    });
    const blackQR = this.makeTransparent(canvas1, false);

    // Generate white QR
    const canvas2 = document.createElement('canvas');
    new QRious({
      element: canvas2,
      value: text,
      size: QR_SIZE,
      level: errorLevel,
      background: 'black',
      foreground: 'white',
    });
    const whiteQR = this.makeTransparent(canvas2, true);

    this.setState({ qrBlack: blackQR, qrWhite: whiteQR });
  }

  private downloadQR(): void {
    const { colorMode, qrBlack, qrWhite } = this.state;
    const t = this.getT();
    const currentQR = colorMode === 'black' ? qrBlack : qrWhite;
    const filename =
      colorMode === 'black'
        ? 'high_recovery_transparent_qr_black.png'
        : 'high_recovery_transparent_qr_white.png';

    if (!currentQR) return;

    try {
      const link = document.createElement('a');
      link.href = currentQR;
      link.download = filename;

      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
      }, TIMEOUTS.DOWNLOAD_CLEANUP);
    } catch (error) {
      console.error('Download error:', error);
      try {
        const newWindow = window.open(currentQR, '_blank');
        if (!newWindow) {
          alert(t.popupBlocked);
        }
      } catch {
        alert(t.downloadFailed);
      }
    }
  }

  private async copyImage(): Promise<void> {
    const { colorMode, qrBlack, qrWhite } = this.state;
    const t = this.getT();
    const currentQR = colorMode === 'black' ? qrBlack : qrWhite;

    if (!currentQR) return;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                throw new Error('Blob creation failed');
              }

              if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                  const item = new ClipboardItem({ 'image/png': blob });
                  await navigator.clipboard.write([item]);
                  this.setState({ copySuccess: true });
                  // Clear any existing timeout before setting new one
                  if (this.copySuccessTimeout) {
                    window.clearTimeout(this.copySuccessTimeout);
                  }
                  this.copySuccessTimeout = window.setTimeout(() => {
                    this.setState({ copySuccess: false });
                  }, TIMEOUTS.COPY_SUCCESS);
                  return;
                } catch (clipErr) {
                  console.log(
                    'Clipboard API failed, trying fallback:',
                    clipErr
                  );
                }
              }

              // Fallback
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = `qr_${colorMode}.png`;

              if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                const newWindow = window.open(blobUrl, '_blank');
                if (newWindow) {
                  alert(t.imageOpenedInNewTab);
                } else {
                  link.click();
                  alert(t.imageDownloaded);
                }
              } else {
                if (confirm(t.imageCopyConfirm)) {
                  link.click();
                }
              }

              setTimeout(
                () => URL.revokeObjectURL(blobUrl),
                TIMEOUTS.BLOB_REVOKE
              );
            },
            'image/png',
            1.0
          );
        } catch (err) {
          console.error('Canvas processing error:', err);
          this.fallbackDownload(currentQR);
        }
      };

      img.onerror = () => {
        console.error('Image load failed');
        this.fallbackDownload(currentQR);
      };

      img.src = currentQR;
    } catch (error) {
      console.error('Copy error:', error);
      this.fallbackDownload(currentQR);
    }
  }

  private fallbackDownload(dataUrl: string): void {
    const { colorMode } = this.state;
    const t = this.getT();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr_${colorMode}.png`;
    link.click();
    alert(t.imageCopyNotSupported);
  }
}
