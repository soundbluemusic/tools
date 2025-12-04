import {
  type Component,
  createSignal,
  createEffect,
  createMemo,
  onMount,
  Show,
  For,
} from 'solid-js';
import QRious from 'qrious';
import { useTranslations } from '../../../i18n';
import type { QRTranslation, CommonTranslation } from '../../../i18n/types';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  QR_SIZE,
  URL_DEBOUNCE_MS,
  COLOR_THRESHOLD,
  TIMEOUTS,
} from '../constants';
import {
  loadWasmProcessor,
  isWasmLoaded,
  makeTransparentWasm,
} from '../../../wasm';
import './QRGenerator.css';

type ErrorLevel = 'L' | 'M' | 'Q' | 'H';
type ColorMode = 'black' | 'white';

/**
 * Props for QRGenerator component
 * When translations are provided, they are used directly (standalone mode)
 * When not provided, useTranslations hook is used (main site mode)
 */
export interface QRGeneratorProps {
  /** Optional translations for standalone mode */
  translations?: {
    qr: QRTranslation;
    common: {
      common: Pick<
        CommonTranslation['common'],
        'copyImage' | 'copied' | 'download'
      >;
    };
  };
}

const QRGenerator: Component<QRGeneratorProps> = (props) => {
  const [url, setUrl] = createSignal('');
  const [errorLevel, setErrorLevel] = createSignal<ErrorLevel>('H');
  const [colorMode, setColorMode] = createSignal<ColorMode>('black');
  const [qrBlack, setQrBlack] = createSignal<string | null>(null);
  const [qrWhite, setQrWhite] = createSignal<string | null>(null);
  const [copySuccess, setCopySuccess] = createSignal(false);
  let wasmLoaded = false;

  // Load WASM on mount
  onMount(() => {
    loadWasmProcessor()
      .then(() => {
        wasmLoaded = true;
      })
      .catch((err) => {
        console.warn('WASM load failed, using JS fallback:', err);
      });
  });

  // Debounce URL for QR generation (input stays responsive)
  const debouncedUrl = useDebounce(url, URL_DEBOUNCE_MS);

  // Use provided translations (standalone) or i18n context (main site)
  const t = useTranslations();
  const qrT = () => props.translations?.qr ?? t().qr;
  const commonT = () => props.translations?.common ?? t().common;

  // Memoize errorLevels
  const errorLevels = createMemo(() => [
    {
      level: 'L' as const,
      recovery: '7%',
      use: qrT().onlineOnly,
      desc: qrT().noDamageRisk,
    },
    {
      level: 'M' as const,
      recovery: '15%',
      use: qrT().smallPrint,
      desc: qrT().coatedSurface,
    },
    {
      level: 'Q' as const,
      recovery: '25%',
      use: qrT().generalPrint,
      desc: qrT().paperLabel,
    },
    {
      level: 'H' as const,
      recovery: '30%',
      use: qrT().outdoorLarge,
      desc: qrT().highDamageRisk,
    },
  ]);

  const makeTransparent = (
    canvas: HTMLCanvasElement,
    isWhite: boolean
  ): string => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Use WASM if loaded, otherwise fallback to JS
    if (wasmLoaded && isWasmLoaded()) {
      // WASM path: ~10-25x faster
      makeTransparentWasm(imageData, isWhite);
    } else {
      // JS fallback
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
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  };

  const createQR = (text: string, level: ErrorLevel) => {
    if (!text.trim()) return;

    const canvas1 = document.createElement('canvas');
    new QRious({
      element: canvas1,
      value: text,
      size: QR_SIZE,
      level: level,
      background: 'white',
      foreground: 'black',
    });

    const blackQR = makeTransparent(canvas1, false);
    setQrBlack(blackQR);

    const canvas2 = document.createElement('canvas');
    new QRious({
      element: canvas2,
      value: text,
      size: QR_SIZE,
      level: level,
      background: 'black',
      foreground: 'white',
    });

    const whiteQR = makeTransparent(canvas2, true);
    setQrWhite(whiteQR);
  };

  createEffect(() => {
    const urlValue = debouncedUrl();
    if (!urlValue.trim()) {
      setQrBlack(null);
      setQrWhite(null);
      return;
    }

    createQR(urlValue, errorLevel());
  });

  const downloadQR = (dataUrl: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
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
        const newWindow = window.open(dataUrl, '_blank');
        if (!newWindow) {
          alert(qrT().popupBlocked);
        }
      } catch {
        alert(qrT().downloadFailed);
      }
    }
  };

  const fallbackDownload = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr_${colorMode()}.png`;
    link.click();
    alert(qrT().imageCopyNotSupported);
  };

  const copyImage = async (dataUrl: string) => {
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
                throw new Error('Blob 생성 실패');
              }

              if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                  const item = new ClipboardItem({ 'image/png': blob });
                  await navigator.clipboard.write([item]);
                  setCopySuccess(true);
                  setTimeout(() => {
                    setCopySuccess(false);
                  }, TIMEOUTS.COPY_SUCCESS);
                  return;
                } catch (clipErr) {
                  console.log('Clipboard API 실패, 대체 방법 시도:', clipErr);
                }
              }

              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = `qr_${colorMode()}.png`;

              if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                const newWindow = window.open(blobUrl, '_blank');
                if (newWindow) {
                  alert(qrT().imageOpenedInNewTab);
                } else {
                  link.click();
                  alert(qrT().imageDownloaded);
                }
              } else {
                if (confirm(qrT().imageCopyConfirm)) {
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
          console.error('Canvas 처리 오류:', err);
          fallbackDownload(dataUrl);
        }
      };

      img.onerror = () => {
        console.error('이미지 로드 실패');
        fallbackDownload(dataUrl);
      };

      img.src = dataUrl;
    } catch (error) {
      console.error('복사 오류:', error);
      fallbackDownload(dataUrl);
    }
  };

  const currentQR = () => (colorMode() === 'black' ? qrBlack() : qrWhite());
  const currentFilename = () =>
    colorMode() === 'black'
      ? 'high_recovery_transparent_qr_black.png'
      : 'high_recovery_transparent_qr_white.png';

  return (
    <div class="qr-generator">
      <div class="qr-card">
        <div class="qr-grid">
          {/* Input Section */}
          <div class="qr-input-section">
            <h2>{qrT().urlInput}</h2>

            <div class="qr-input-group">
              <label>{qrT().urlLabel}</label>
              <input
                type="text"
                value={url()}
                onInput={(e) => setUrl(e.currentTarget.value)}
                placeholder={qrT().urlPlaceholder}
                class="qr-input"
              />
              <p class="qr-help-text">{qrT().urlHelp}</p>
            </div>

            <div class="qr-error-section">
              <h3>{qrT().errorCorrectionLevel}</h3>
              {/* Desktop: Table view */}
              <div class="qr-table-wrapper">
                <table class="qr-table">
                  <thead>
                    <tr>
                      <th>{qrT().level}</th>
                      <th>{qrT().recoveryRate}</th>
                      <th>{qrT().recommendedEnvironment}</th>
                      <th>{qrT().description}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={errorLevels()}>
                      {(item) => (
                        <tr>
                          <td class="qr-level-cell">{item.level}</td>
                          <td>{item.recovery}</td>
                          <td>{item.use}</td>
                          <td class="qr-desc-cell">{item.desc}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card view */}
              <div class="qr-table-mobile">
                <For each={errorLevels()}>
                  {(item) => (
                    <div class="qr-table-mobile-card">
                      <div class="qr-table-mobile-card-header">
                        <span class="qr-table-mobile-level">{item.level}</span>
                        <span class="qr-table-mobile-recovery">
                          {item.recovery}
                        </span>
                      </div>
                      <div class="qr-table-mobile-use">{item.use}</div>
                      <div class="qr-table-mobile-desc">{item.desc}</div>
                    </div>
                  )}
                </For>
              </div>

              <div class="qr-level-buttons">
                <For each={errorLevels()}>
                  {(item) => (
                    <button
                      onClick={() => setErrorLevel(item.level)}
                      class={`qr-level-btn ${errorLevel() === item.level ? 'active' : ''}`}
                    >
                      {item.level}
                    </button>
                  )}
                </For>
              </div>

              <p class="qr-info-text">{qrT().errorLevelInfo}</p>
            </div>

            <div class="qr-color-section">
              <h3>{qrT().qrCodeColor}</h3>
              <div class="qr-color-buttons">
                <button
                  onClick={() => setColorMode('black')}
                  class={`qr-color-btn ${colorMode() === 'black' ? 'active' : ''}`}
                >
                  {qrT().black}
                </button>
                <button
                  onClick={() => setColorMode('white')}
                  class={`qr-color-btn ${colorMode() === 'white' ? 'active' : ''}`}
                >
                  {qrT().white}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Display Section */}
          <div class="qr-display-section">
            <h2>{qrT().generatedQrCode}</h2>

            <div class="qr-preview-card">
              <h3>
                {colorMode() === 'black'
                  ? qrT().blackQrCode
                  : qrT().whiteQrCode}
              </h3>
              <div
                class={`qr-preview ${colorMode() === 'black' ? 'light-bg' : 'dark-bg'}`}
              >
                <Show
                  when={currentQR()}
                  fallback={
                    <div
                      class={`qr-placeholder ${colorMode() === 'black' ? 'light' : 'dark'}`}
                    >
                      <svg
                        class="qr-placeholder-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width={2}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                      <p>{qrT().enterUrl}</p>
                    </div>
                  }
                >
                  <img
                    src={currentQR()!}
                    alt={`${colorMode() === 'black' ? 'Black' : 'White'} QR Code`}
                    class="qr-image"
                  />
                </Show>
              </div>
              <Show when={currentQR()}>
                <div class="qr-actions">
                  <button
                    onClick={() => copyImage(currentQR()!)}
                    class="qr-action-btn secondary"
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
                    {copySuccess()
                      ? commonT().common.copied
                      : commonT().common.copyImage}
                  </button>
                  <button
                    onClick={() => downloadQR(currentQR()!, currentFilename())}
                    class="qr-action-btn primary"
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
                    {commonT().common.download}
                  </button>
                </div>
              </Show>
              <p class="qr-spec-text">{qrT().transparentBg}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="qr-footer">
        <p>{qrT().footer}</p>
      </div>
    </div>
  );
};

export { QRGenerator };
