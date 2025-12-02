import { memo, useState, useCallback } from 'react';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n';
import { useSEO } from '../hooks';
import './Downloads.css';

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
];

/**
 * Downloads Page
 * Provides standalone HTML downloads for individual tools
 */
const Downloads = memo(function Downloads() {
  const { language } = useLanguage();
  const [downloadStatus, setDownloadStatus] = useState<Record<string, string>>({});

  const title = language === 'ko' ? '도구 다운로드' : 'Download Tools';
  const description =
    language === 'ko'
      ? '각 도구를 독립 실행형 파일로 다운로드하세요. 브라우저만 있으면 오프라인에서도 사용할 수 있습니다.'
      : 'Download each tool as a standalone file. Works offline with just a browser.';

  useSEO({
    title: language === 'ko' ? '도구 다운로드' : 'Download Tools',
    description:
      language === 'ko'
        ? '메트로놈, 드럼머신 등 도구를 독립 실행형 파일로 다운로드'
        : 'Download metronome, drum machine and other tools as standalone files',
    canonicalPath: '/downloads',
  });

  const handleDownload = useCallback(async (item: DownloadItem) => {
    setDownloadStatus((prev) => ({ ...prev, [item.id]: 'downloading' }));

    try {
      const response = await fetch(`/standalone/${item.fileName}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadStatus((prev) => ({ ...prev, [item.id]: 'success' }));
      setTimeout(() => {
        setDownloadStatus((prev) => ({ ...prev, [item.id]: '' }));
      }, 2000);
    } catch {
      setDownloadStatus((prev) => ({ ...prev, [item.id]: 'error' }));
      setTimeout(() => {
        setDownloadStatus((prev) => ({ ...prev, [item.id]: '' }));
      }, 3000);
    }
  }, []);

  const howToUse = {
    ko: {
      title: '사용 방법',
      steps: [
        '아래에서 원하는 도구의 "다운로드" 버튼을 클릭',
        '다운로드된 .html 파일을 원하는 위치에 저장',
        '파일을 더블클릭하면 브라우저에서 바로 실행',
      ],
    },
    en: {
      title: 'How to Use',
      steps: [
        'Click the "Download" button for the tool you want',
        'Save the downloaded .html file to your preferred location',
        'Double-click the file to run it in your browser',
      ],
    },
  };

  const buttonText = {
    downloading: language === 'ko' ? '다운로드 중...' : 'Downloading...',
    success: language === 'ko' ? '완료!' : 'Done!',
    error: language === 'ko' ? '실패 - 다시 시도' : 'Failed - Retry',
    default: language === 'ko' ? '다운로드' : 'Download',
  };

  return (
    <PageLayout title={title} description={description}>
      {/* How to use section */}
      <section className="downloads-howto">
        <h2 className="downloads-howto-title">{howToUse[language].title}</h2>
        <ol className="downloads-howto-steps">
          {howToUse[language].steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Download items */}
      <section className="downloads-list">
        {DOWNLOADS.map((item) => {
          const status = downloadStatus[item.id] || '';
          return (
            <article key={item.id} className="download-card">
              <div className="download-card-header">
                <span className="download-card-icon">{item.icon}</span>
                <div className="download-card-info">
                  <h3 className="download-card-name">{item.name[language]}</h3>
                  <p className="download-card-desc">{item.description[language]}</p>
                </div>
              </div>

              <div className="download-card-features">
                <ul>
                  {item.features[language].map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="download-card-footer">
                <div className="download-card-meta">
                  <span className="download-card-filename">{item.fileName}</span>
                  <span className="download-card-size">{item.fileSize}</span>
                </div>
                <button
                  className={`download-btn ${status ? `download-btn--${status}` : ''}`}
                  onClick={() => handleDownload(item)}
                  disabled={status === 'downloading'}
                >
                  {status === 'downloading' && (
                    <svg className="download-btn-spinner" viewBox="0 0 24 24" width="18" height="18">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                  )}
                  {status === 'success' && (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {!status && (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  <span>
                    {status ? buttonText[status as keyof typeof buttonText] : buttonText.default}
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Coming soon note */}
      <p className="downloads-note">
        {language === 'ko'
          ? '※ 더 많은 도구가 곧 추가될 예정입니다.'
          : '※ More tools will be added soon.'}
      </p>
    </PageLayout>
  );
});

Downloads.displayName = 'Downloads';

export default Downloads;
