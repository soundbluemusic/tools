import { memo, useState, useCallback } from 'react';
import type { Route } from './+types/downloads';
import { PageLayout } from '../../src/components/layout';
import { useLanguage } from '../../src/i18n';
import { useSEO } from '../../src/hooks';

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
  { id: 'metronome', name: { ko: '메트로놈', en: 'Metronome' }, description: { ko: '음악가를 위한 정밀 메트로놈', en: 'Precision metronome for musicians' }, fileName: 'metronome.html', fileSize: '~230KB', icon: '🎵', features: { ko: ['오프라인 작동', '다크/라이트 모드'], en: ['Works offline', 'Dark/Light mode'] } },
  { id: 'drum', name: { ko: '드럼머신', en: 'Drum Machine' }, description: { ko: '16스텝 드럼 시퀀서', en: '16-step drum sequencer' }, fileName: 'drum.html', fileSize: '~200KB', icon: '🥁', features: { ko: ['16스텝 시퀀서', '5가지 프리셋'], en: ['16-step sequencer', '5 presets'] } },
  { id: 'qr', name: { ko: 'QR 코드 생성기', en: 'QR Code Generator' }, description: { ko: '고복구율 투명 배경 QR 코드 생성기', en: 'High-recovery transparent QR code generator' }, fileName: 'qr.html', fileSize: '~250KB', icon: '📱', features: { ko: ['투명 배경 PNG', '클립보드 복사'], en: ['Transparent PNG', 'Clipboard copy'] } },
];

export const meta: Route.MetaFunction = () => [
  { title: 'Download Tools - Tools' },
  { name: 'description', content: '메트로놈, 드럼머신 등 도구를 독립 실행형 파일로 다운로드' },
];

const Downloads = memo(function Downloads() {
  const { language } = useLanguage();
  const [downloadStatus, setDownloadStatus] = useState<Record<string, string>>({});

  const title = language === 'ko' ? '도구 다운로드' : 'Download Tools';
  const description = language === 'ko' ? '각 도구를 독립 실행형 파일로 다운로드하세요.' : 'Download each tool as a standalone file.';

  useSEO({ title, description, canonicalPath: '/downloads' });

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
      setTimeout(() => setDownloadStatus((prev) => ({ ...prev, [item.id]: '' })), 2000);
    } catch {
      setDownloadStatus((prev) => ({ ...prev, [item.id]: 'error' }));
      setTimeout(() => setDownloadStatus((prev) => ({ ...prev, [item.id]: '' })), 3000);
    }
  }, []);

  const buttonText = {
    downloading: language === 'ko' ? '다운로드 중...' : 'Downloading...',
    success: language === 'ko' ? '완료!' : 'Done!',
    error: language === 'ko' ? '실패' : 'Failed',
    default: language === 'ko' ? '다운로드' : 'Download',
  };

  return (
    <PageLayout title={title} description={description}>
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
                  {status ? buttonText[status as keyof typeof buttonText] : buttonText.default}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </PageLayout>
  );
});

Downloads.displayName = 'Downloads';

export default Downloads;
