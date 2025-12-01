import { memo, useMemo } from 'react';
import { PageLayout } from '../components/layout';
import { QRGenerator } from '../apps/qr/components/QRGenerator';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { useTranslations } from '../i18n';
import { useSEO } from '../hooks';

/**
 * QR Code Generator Tool Page
 */
const QR = memo(function QR() {
  const { qr } = useTranslations();

  // Dynamic SEO for QR page
  useSEO({
    title: qr.seo.title,
    description: qr.seo.description,
    keywords: qr.seo.keywords,
    canonicalPath: '/qr',
  });

  // Breadcrumb items
  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '기타 도구', en: 'Other Tools' }, href: '/' },
      { label: { ko: qr.title, en: qr.title } },
    ],
    [qr.title]
  );

  return (
    <PageLayout
      title={qr.title}
      description={qr.subtitle}
      breadcrumb={breadcrumb}
      actions={
        <>
          <EmbedButton title={qr.title} defaultWidth={400} defaultHeight={600} />
          <ShareButton title={qr.title} description={qr.subtitle} />
        </>
      }
    >
      <QRGenerator />
    </PageLayout>
  );
});

QR.displayName = 'QR';

export default QR;
