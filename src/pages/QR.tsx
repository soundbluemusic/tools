import { memo } from 'react';
import { PageLayout } from '../components/layout';

/**
 * QR Code Generator Tool Page
 */
const QR = memo(function QR() {
  return (
    <PageLayout
      title="QR 코드 생성기"
      description="QR Code Generator"
    >
      <p>QR 코드 생성기가 여기에 들어갑니다.</p>
    </PageLayout>
  );
});

QR.displayName = 'QR';

export default QR;
