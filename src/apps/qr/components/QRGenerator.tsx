import { useState, useEffect, memo, useCallback, useMemo } from 'react';
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

const QRGenerator = memo<QRGeneratorProps>(function QRGenerator({
  translations,
}) {
  const [url, setUrl] = useState('');
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('H');
  const [colorMode, setColorMode] = useState<ColorMode>('black');
  const [qrBlack, setQrBlack] = useState<string | null>(null);
  const [qrWhite, setQrWhite] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Debounce URL for QR generation (input stays responsive)
  const debouncedUrl = useDebounce(url, URL_DEBOUNCE_MS);

  // Use provided translations (standalone) or i18n context (main site)
  const contextTranslations = useTranslations();
  const qrT = translations?.qr ?? contextTranslations.qr;
  const commonT = translations?.common ?? contextTranslations.common;

  // Memoize errorLevels to prevent recreation on every render
  const errorLevels = useMemo(
    () => [
      {
        level: 'L' as const,
        recovery: '7%',
        use: qrT.onlineOnly,
        desc: qrT.noDamageRisk,
      },
      {
        level: 'M' as const,
        recovery: '15%',
        use: qrT.smallPrint,
        desc: qrT.coatedSurface,
      },
      {
        level: 'Q' as const,
        recovery: '25%',
        use: qrT.generalPrint,
        desc: qrT.paperLabel,
      },
      {
        level: 'H' as const,
        recovery: '30%',
        use: qrT.outdoorLarge,
        desc: qrT.highDamageRisk,
      },
    ],
    [qrT]
  );

  const makeTransparent = useCallback(
    (canvas: HTMLCanvasElement, isWhite: boolean): string => {
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
    },
    []
  );

  const createQR = useCallback(
    (text: string, level: ErrorLevel) => {
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
    },
    [makeTransparent]
  );

  useEffect(() => {
    if (!debouncedUrl.trim()) {
      setQrBlack(null);
      setQrWhite(null);
      return;
    }

    createQR(debouncedUrl, errorLevel);
  }, [debouncedUrl, errorLevel, createQR]);

  const downloadQR = useCallback(
    (dataUrl: string, filename: string) => {
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
            alert(qrT.popupBlocked);
          }
        } catch {
          alert(qrT.downloadFailed);
        }
      }
    },
    [qrT]
  );

  const fallbackDownload = useCallback(
    (dataUrl: string) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qr_${colorMode}.png`;
      link.click();
      alert(qrT.imageCopyNotSupported);
    },
    [colorMode, qrT]
  );

  const copyImage = useCallback(
    async (dataUrl: string) => {
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

                if (
                  navigator.clipboard &&
                  typeof ClipboardItem !== 'undefined'
                ) {
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
                link.download = `qr_${colorMode}.png`;

                if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                  const newWindow = window.open(blobUrl, '_blank');
                  if (newWindow) {
                    alert(qrT.imageOpenedInNewTab);
                  } else {
                    link.click();
                    alert(qrT.imageDownloaded);
                  }
                } else {
                  if (confirm(qrT.imageCopyConfirm)) {
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
    },
    [colorMode, qrT, fallbackDownload]
  );

  const currentQR = colorMode === 'black' ? qrBlack : qrWhite;
  const currentFilename =
    colorMode === 'black'
      ? 'high_recovery_transparent_qr_black.png'
      : 'high_recovery_transparent_qr_white.png';

  return (
    <div className="w-full">
      <div className="bg-bg-tertiary border border-border-secondary rounded-lg shadow-md overflow-hidden p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Input Section */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary m-0 mb-3 sm:mb-4">
              {qrT.urlInput}
            </h2>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {qrT.urlLabel}
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={qrT.urlPlaceholder}
                className="w-full px-3 sm:px-4 py-3 border border-border-secondary rounded-md text-base bg-bg-primary text-text-primary outline-none transition-[border-color,box-shadow] duration-fast ease-default box-border focus:border-border-focus focus:shadow-focus placeholder:text-text-tertiary min-h-12 sm:min-h-0"
              />
              <p className="text-xs text-text-tertiary mt-1">{qrT.urlHelp}</p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-text-primary m-0 mb-4">
                {qrT.errorCorrectionLevel}
              </h3>
              {/* Desktop: Table view */}
              <div className="overflow-x-auto mb-4 hidden sm:block">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-text-secondary border-b border-border-secondary">
                        {qrT.level}
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-text-secondary border-b border-border-secondary">
                        {qrT.recoveryRate}
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-text-secondary border-b border-border-secondary">
                        {qrT.recommendedEnvironment}
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-text-secondary border-b border-border-secondary">
                        {qrT.description}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorLevels.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-text-primary border-b border-border-secondary last:border-b-0 font-semibold">
                          {item.level}
                        </td>
                        <td className="px-3 py-2 text-text-primary border-b border-border-secondary last:border-b-0">
                          {item.recovery}
                        </td>
                        <td className="px-3 py-2 text-text-primary border-b border-border-secondary last:border-b-0">
                          {item.use}
                        </td>
                        <td className="px-3 py-2 text-text-primary border-b border-border-secondary last:border-b-0 text-text-secondary">
                          {item.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card view */}
              <div className="flex flex-col gap-3 sm:hidden">
                {errorLevels.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-bg-primary border border-border-secondary rounded-md p-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg text-info">
                        {item.level}
                      </span>
                      <span className="text-sm text-text-secondary bg-bg-tertiary px-2 py-1 rounded-sm">
                        {item.recovery}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-text-primary mb-1">
                      {item.use}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {errorLevels.map((item) => (
                  <button
                    key={item.level}
                    onClick={() => setErrorLevel(item.level)}
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md font-semibold cursor-pointer transition-all duration-fast ease-default border text-sm sm:text-base min-h-11 sm:min-h-0 ${
                      errorLevel === item.level
                        ? 'bg-info border-info text-white shadow-md'
                        : 'border-border-secondary bg-bg-primary text-text-primary hover:bg-interactive-hover'
                    }`}
                  >
                    {item.level}
                  </button>
                ))}
              </div>

              <p className="text-sm text-text-secondary mt-4 leading-relaxed">
                {qrT.errorLevelInfo}
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-text-primary m-0 mb-4">
                {qrT.qrCodeColor}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setColorMode('black')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md font-semibold cursor-pointer transition-all duration-fast ease-default border text-sm sm:text-base min-h-11 sm:min-h-0 ${
                    colorMode === 'black'
                      ? 'bg-text-primary border-text-primary text-text-inverse shadow-md'
                      : 'border-border-secondary bg-bg-primary text-text-primary hover:bg-interactive-hover'
                  }`}
                >
                  {qrT.black}
                </button>
                <button
                  onClick={() => setColorMode('white')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md font-semibold cursor-pointer transition-all duration-fast ease-default border text-sm sm:text-base min-h-11 sm:min-h-0 ${
                    colorMode === 'white'
                      ? 'bg-text-primary border-text-primary text-text-inverse shadow-md'
                      : 'border-border-secondary bg-bg-primary text-text-primary hover:bg-interactive-hover'
                  }`}
                >
                  {qrT.white}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Display Section */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary m-0 mb-3 sm:mb-4">
              {qrT.generatedQrCode}
            </h2>

            <div className="bg-bg-secondary rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-text-primary m-0 mb-4 text-center">
                {colorMode === 'black' ? qrT.blackQrCode : qrT.whiteQrCode}
              </h3>
              <div
                className={`rounded-md p-4 sm:p-6 mb-4 flex justify-center items-center min-h-[200px] sm:min-h-[300px] ${
                  colorMode === 'black' ? 'bg-bg-tertiary' : 'bg-bg-primary'
                }`}
              >
                {currentQR ? (
                  <img
                    src={currentQR}
                    alt={`${colorMode === 'black' ? 'Black' : 'White'} QR Code`}
                    className="w-full max-w-[300px] h-auto"
                  />
                ) : (
                  <div className="text-center text-text-tertiary">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <p className="text-sm m-0">{qrT.enterUrl}</p>
                  </div>
                )}
              </div>
              {currentQR && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => copyImage(currentQR)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-md font-medium cursor-pointer transition-all duration-fast ease-default border bg-bg-primary border-border-secondary text-text-primary hover:bg-interactive-hover text-sm sm:text-base min-h-12 sm:min-h-0"
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
                        strokeWidth="2"
                      />
                      <path
                        strokeWidth="2"
                        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                      />
                    </svg>
                    {copySuccess
                      ? commonT.common.copied
                      : commonT.common.copyImage}
                  </button>
                  <button
                    onClick={() => downloadQR(currentQR, currentFilename)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-md font-medium cursor-pointer transition-all duration-fast ease-default border border-transparent bg-text-primary text-text-inverse hover:opacity-90 text-sm sm:text-base min-h-12 sm:min-h-0"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                      />
                    </svg>
                    {commonT.common.download}
                  </button>
                </div>
              )}
              <p className="text-xs text-text-tertiary mt-3 text-center">
                {qrT.transparentBg}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-6 text-text-tertiary text-sm">
        <p className="m-0">{qrT.footer}</p>
      </div>
    </div>
  );
});

QRGenerator.displayName = 'QRGenerator';

export { QRGenerator };
