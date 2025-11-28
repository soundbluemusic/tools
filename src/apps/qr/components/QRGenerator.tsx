import { useState, useEffect, useRef, memo, useCallback } from 'react';
import './QRGenerator.css';

interface Translation {
  title: string;
  subtitle: string;
  urlInput: string;
  urlLabel: string;
  urlPlaceholder: string;
  urlHelp: string;
  errorCorrectionLevel: string;
  level: string;
  recoveryRate: string;
  recommendedEnvironment: string;
  description: string;
  onlineOnly: string;
  noDamageRisk: string;
  smallPrint: string;
  coatedSurface: string;
  generalPrint: string;
  paperLabel: string;
  outdoorLarge: string;
  highDamageRisk: string;
  errorLevelInfo: string;
  qrCodeColor: string;
  black: string;
  white: string;
  generatedQrCode: string;
  blackQrCode: string;
  whiteQrCode: string;
  enterUrl: string;
  copyImage: string;
  copied: string;
  download: string;
  transparentBg: string;
  footer: string;
}

interface Translations {
  ko: Translation;
  en: Translation;
}

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

const translations: Translations = {
  ko: {
    title: 'QR 코드 생성기 for myself',
    subtitle: '투명 배경의 고해상도 QR 코드를 생성합니다',
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
    copyImage: '이미지 복사',
    copied: '복사 완료!',
    download: '다운로드',
    transparentBg: '투명 배경, 2048x2048 PNG',
    footer: 'QR 코드를 즉시 생성 • 데이터 저장 안함 • 무료 사용',
  },
  en: {
    title: 'QR Code Generator for myself',
    subtitle: 'Generate high-resolution QR codes with transparent backgrounds',
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
    copyImage: 'Copy Image',
    copied: 'Copied!',
    download: 'Download',
    transparentBg: 'Transparent background, 2048x2048 PNG',
    footer: 'Generate QR codes instantly • No data stored • Free to use',
  },
};

type ErrorLevel = 'L' | 'M' | 'Q' | 'H';
type ColorMode = 'black' | 'white';
type Language = 'ko' | 'en';

const QRGenerator = memo(function QRGenerator() {
  const [url, setUrl] = useState('');
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('H');
  const [colorMode, setColorMode] = useState<ColorMode>('black');
  const [language, setLanguage] = useState<Language>('ko');
  const [qrBlack, setQrBlack] = useState<string | null>(null);
  const [qrWhite, setQrWhite] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const isLibraryLoaded = useRef(false);

  const t = translations[language];

  const errorLevels = [
    { level: 'L' as const, recovery: '7%', use: t.onlineOnly, desc: t.noDamageRisk },
    { level: 'M' as const, recovery: '15%', use: t.smallPrint, desc: t.coatedSurface },
    { level: 'Q' as const, recovery: '25%', use: t.generalPrint, desc: t.paperLabel },
    { level: 'H' as const, recovery: '30%', use: t.outdoorLarge, desc: t.highDamageRisk },
  ];

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
    if (!url.trim()) {
      setQrBlack(null);
      setQrWhite(null);
      return;
    }

    createQR(url);
  }, [url, errorLevel, createQR]);

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
          alert('팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
        }
      } catch {
        alert('다운로드에 실패했습니다. 이미지를 우클릭하여 저장해주세요.');
      }
    }
  }, []);

  const fallbackDownload = useCallback(
    (dataUrl: string) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qr_${colorMode}.png`;
      link.click();
      alert(
        language === 'ko'
          ? '이미지 복사를 지원하지 않아 다운로드되었습니다.'
          : 'Image copy not supported, downloaded instead.'
      );
    },
    [colorMode, language]
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
                    alert(
                      language === 'ko'
                        ? '이미지가 새 탭에서 열렸습니다. 이미지를 길게 눌러 저장하거나 복사하세요.'
                        : 'Image opened in new tab. Long press the image to save or copy.'
                    );
                  } else {
                    link.click();
                    alert(language === 'ko' ? '이미지가 다운로드되었습니다.' : 'Image downloaded.');
                  }
                } else {
                  if (
                    confirm(
                      language === 'ko'
                        ? '이미지 복사가 지원되지 않습니다. 대신 다운로드하시겠습니까?'
                        : 'Image copy not supported. Download instead?'
                    )
                  ) {
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
    [colorMode, language, fallbackDownload]
  );

  const currentQR = colorMode === 'black' ? qrBlack : qrWhite;
  const currentFilename =
    colorMode === 'black'
      ? 'high_recovery_transparent_qr_black.png'
      : 'high_recovery_transparent_qr_white.png';

  return (
    <div className="qr-generator">
      <div className="qr-header">
        <div className="qr-header-title">
          <h1>{t.title}</h1>
          <button
            onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
            className="qr-lang-btn"
            title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
          >
            <svg
              className="qr-globe-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                strokeWidth="2"
                d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              />
            </svg>
            {language === 'ko' ? 'EN' : 'KO'}
          </button>
        </div>
        <p className="qr-subtitle">{t.subtitle}</p>
      </div>

      <div className="qr-card">
        <div className="qr-grid">
          {/* Input Section */}
          <div className="qr-input-section">
            <h2>{t.urlInput}</h2>

            <div className="qr-input-group">
              <label>{t.urlLabel}</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.urlPlaceholder}
                className="qr-input"
              />
              <p className="qr-help-text">{t.urlHelp}</p>
            </div>

            <div className="qr-error-section">
              <h3>{t.errorCorrectionLevel}</h3>
              <div className="qr-table-wrapper">
                <table className="qr-table">
                  <thead>
                    <tr>
                      <th>{t.level}</th>
                      <th>{t.recoveryRate}</th>
                      <th>{t.recommendedEnvironment}</th>
                      <th>{t.description}</th>
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

              <p className="qr-info-text">{t.errorLevelInfo}</p>
            </div>

            <div className="qr-color-section">
              <h3>{t.qrCodeColor}</h3>
              <div className="qr-color-buttons">
                <button
                  onClick={() => setColorMode('black')}
                  className={`qr-color-btn ${colorMode === 'black' ? 'active' : ''}`}
                >
                  {t.black}
                </button>
                <button
                  onClick={() => setColorMode('white')}
                  className={`qr-color-btn ${colorMode === 'white' ? 'active' : ''}`}
                >
                  {t.white}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Display Section */}
          <div className="qr-display-section">
            <h2>{t.generatedQrCode}</h2>

            <div className="qr-preview-card">
              <h3>{colorMode === 'black' ? t.blackQrCode : t.whiteQrCode}</h3>
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
                    <p>{t.enterUrl}</p>
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
                    {copySuccess ? t.copied : t.copyImage}
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
                    {t.download}
                  </button>
                </div>
              )}
              <p className="qr-spec-text">{t.transparentBg}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="qr-footer">
        <p>{t.footer}</p>
      </div>
    </div>
  );
});

QRGenerator.displayName = 'QRGenerator';

export { QRGenerator };
