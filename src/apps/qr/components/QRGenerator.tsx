import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { useTranslations } from '../../../i18n';
import { useDebounce } from '../../../hooks/useDebounce';
import './QRGenerator.css';

declare global {
  interface Window {
    QRious: new (options: {
      element: HTMLCanvasElement;
      value: string;
      size: number;
      level: string;
      background: string;
      foreground: string;
    }) => void;
  }
}

type ErrorLevel = 'L' | 'M' | 'Q' | 'H';
type ColorMode = 'black' | 'white';

const QRGenerator = memo(function QRGenerator() {
  const [url, setUrl] = useState('');
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('H');
  const [colorMode, setColorMode] = useState<ColorMode>('black');
  const [qrBlack, setQrBlack] = useState<string | null>(null);
  const [qrWhite, setQrWhite] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const isLibraryLoaded = useRef(false);

  // Debounce URL for QR generation (input stays responsive)
  const debouncedUrl = useDebounce(url, 300);

  const t = useTranslations();
  const qrT = t.qr;
  const commonT = t.common;

  // Memoize errorLevels to prevent recreation on every render
  const errorLevels = useMemo(
    () => [
      { level: 'L' as const, recovery: '7%', use: qrT.onlineOnly, desc: qrT.noDamageRisk },
      { level: 'M' as const, recovery: '15%', use: qrT.smallPrint, desc: qrT.coatedSurface },
      { level: 'Q' as const, recovery: '25%', use: qrT.generalPrint, desc: qrT.paperLabel },
      { level: 'H' as const, recovery: '30%', use: qrT.outdoorLarge, desc: qrT.highDamageRisk },
    ],
    [qrT]
  );

  const makeTransparent = useCallback((canvas: HTMLCanvasElement, isWhite: boolean): string => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (isWhite) {
        if (r <= 5 && g <= 5 && b <= 5) {
          data[i + 3] = 0;
        } else {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        }
      } else {
        if (r >= 250 && g >= 250 && b >= 250) {
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
  }, []);

  const loadQRLibrary = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (window.QRious) {
        isLibraryLoaded.current = true;
        resolve();
        return;
      }
      if (isLibraryLoaded.current) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
      script.onload = () => {
        isLibraryLoaded.current = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  }, []);

  const createQR = useCallback(
    (text: string) => {
      if (!window.QRious || !text.trim()) return;

      const canvas1 = document.createElement('canvas');
      new window.QRious({
        element: canvas1,
        value: text,
        size: 2048,
        level: errorLevel,
        background: 'white',
        foreground: 'black',
      });

      const blackQR = makeTransparent(canvas1, false);
      setQrBlack(blackQR);

      const canvas2 = document.createElement('canvas');
      new window.QRious({
        element: canvas2,
        value: text,
        size: 2048,
        level: errorLevel,
        background: 'black',
        foreground: 'white',
      });

      const whiteQR = makeTransparent(canvas2, true);
      setQrWhite(whiteQR);
    },
    [errorLevel, makeTransparent]
  );

  useEffect(() => {
    loadQRLibrary();
  }, [loadQRLibrary]);

  useEffect(() => {
    if (!debouncedUrl.trim()) {
      setQrBlack(null);
      setQrWhite(null);
      return;
    }

    createQR(debouncedUrl);
  }, [debouncedUrl, errorLevel, createQR]);

  const downloadQR = useCallback((dataUrl: string, filename: string) => {
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
      }, 100);
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
  }, [qrT]);

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

                if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                  try {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    setCopySuccess(true);
                    setTimeout(() => {
                      setCopySuccess(false);
                    }, 2000);
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

                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
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
    <div className="qr-generator">
      <div className="qr-card">
        <div className="qr-grid">
          {/* Input Section */}
          <div className="qr-input-section">
            <h2>{qrT.urlInput}</h2>

            <div className="qr-input-group">
              <label>{qrT.urlLabel}</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={qrT.urlPlaceholder}
                className="qr-input"
              />
              <p className="qr-help-text">{qrT.urlHelp}</p>
            </div>

            <div className="qr-error-section">
              <h3>{qrT.errorCorrectionLevel}</h3>
              {/* Desktop: Table view */}
              <div className="qr-table-wrapper">
                <table className="qr-table">
                  <thead>
                    <tr>
                      <th>{qrT.level}</th>
                      <th>{qrT.recoveryRate}</th>
                      <th>{qrT.recommendedEnvironment}</th>
                      <th>{qrT.description}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorLevels.map((item, idx) => (
                      <tr key={idx}>
                        <td className="qr-level-cell">{item.level}</td>
                        <td>{item.recovery}</td>
                        <td>{item.use}</td>
                        <td className="qr-desc-cell">{item.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card view */}
              <div className="qr-table-mobile">
                {errorLevels.map((item, idx) => (
                  <div key={idx} className="qr-table-mobile-card">
                    <div className="qr-table-mobile-card-header">
                      <span className="qr-table-mobile-level">{item.level}</span>
                      <span className="qr-table-mobile-recovery">{item.recovery}</span>
                    </div>
                    <div className="qr-table-mobile-use">{item.use}</div>
                    <div className="qr-table-mobile-desc">{item.desc}</div>
                  </div>
                ))}
              </div>

              <div className="qr-level-buttons">
                {errorLevels.map((item) => (
                  <button
                    key={item.level}
                    onClick={() => setErrorLevel(item.level)}
                    className={`qr-level-btn ${errorLevel === item.level ? 'active' : ''}`}
                  >
                    {item.level}
                  </button>
                ))}
              </div>

              <p className="qr-info-text">{qrT.errorLevelInfo}</p>
            </div>

            <div className="qr-color-section">
              <h3>{qrT.qrCodeColor}</h3>
              <div className="qr-color-buttons">
                <button
                  onClick={() => setColorMode('black')}
                  className={`qr-color-btn ${colorMode === 'black' ? 'active' : ''}`}
                >
                  {qrT.black}
                </button>
                <button
                  onClick={() => setColorMode('white')}
                  className={`qr-color-btn ${colorMode === 'white' ? 'active' : ''}`}
                >
                  {qrT.white}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Display Section */}
          <div className="qr-display-section">
            <h2>{qrT.generatedQrCode}</h2>

            <div className="qr-preview-card">
              <h3>{colorMode === 'black' ? qrT.blackQrCode : qrT.whiteQrCode}</h3>
              <div className={`qr-preview ${colorMode === 'black' ? 'light-bg' : 'dark-bg'}`}>
                {currentQR ? (
                  <img
                    src={currentQR}
                    alt={`${colorMode === 'black' ? 'Black' : 'White'} QR Code`}
                    className="qr-image"
                  />
                ) : (
                  <div className={`qr-placeholder ${colorMode === 'black' ? 'light' : 'dark'}`}>
                    <svg
                      className="qr-placeholder-icon"
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
                    <p>{qrT.enterUrl}</p>
                  </div>
                )}
              </div>
              {currentQR && (
                <div className="qr-actions">
                  <button onClick={() => copyImage(currentQR)} className="qr-action-btn secondary">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                      <path
                        strokeWidth="2"
                        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                      />
                    </svg>
                    {copySuccess ? commonT.common.copied : commonT.common.copyImage}
                  </button>
                  <button
                    onClick={() => downloadQR(currentQR, currentFilename)}
                    className="qr-action-btn primary"
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
              <p className="qr-spec-text">{qrT.transparentBg}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="qr-footer">
        <p>{qrT.footer}</p>
      </div>
    </div>
  );
});

QRGenerator.displayName = 'QRGenerator';

export { QRGenerator };
