/**
 * QR Code Generator Page Component (Astro Version)
 */
import { memo, useMemo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import { QRGenerator } from '../apps/qr/components/QRGenerator';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import type { Language } from '../i18n/types';
import { qrKo, qrEn } from '../i18n/translations/qr';
import { commonKo, commonEn } from '../i18n/translations/common';

interface QRPageProps {
  language: Language;
}

const QRPage = memo(function QRPage({ language }: QRPageProps) {
  const t = language === 'ko' ? qrKo : qrEn;
  const common = language === 'ko' ? commonKo : commonEn;

  const translations = useMemo(
    () => ({
      qr: t,
      common: { common: common.common },
    }),
    [t, common]
  );

  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '기타 도구', en: 'Other Tools' }, href: '/other-tools' },
      { label: { ko: t.title, en: t.title } },
    ],
    [t.title]
  );

  return (
    <PageLayoutAstro
      title={t.title}
      description={t.subtitle}
      breadcrumb={breadcrumb}
      language={language}
      actions={
        <>
          <EmbedButton title={t.title} defaultWidth={400} defaultHeight={600} />
          <FullscreenButton />
          <ShareButton title={t.title} description={t.subtitle} />
        </>
      }
    >
      <QRGenerator translations={translations} />
    </PageLayoutAstro>
  );
});

QRPage.displayName = 'QRPage';

export default QRPage;
