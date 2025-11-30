import { memo } from 'react';
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

  return (
    <PageLayout
      title={qr.title}
      description={qr.subtitle}
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
