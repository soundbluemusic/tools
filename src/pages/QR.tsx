import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { QRGenerator } from '../apps/qr/components/QRGenerator';
import { useTranslations } from '../i18n';

/**
 * QR Code Generator Tool Page
 */
const QR = memo(function QR() {
  const { qr } = useTranslations();

  return (
    <PageLayout title={qr.title} description={qr.subtitle}>
      <QRGenerator />
    </PageLayout>
  );
});

QR.displayName = 'QR';

export default QR;
