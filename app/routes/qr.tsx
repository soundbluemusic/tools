import { memo, useMemo } from 'react';
import type { Route } from './+types/qr';
import { PageLayout } from '../../src/components/layout';
import { QRGenerator } from '../../src/apps/qr/components/QRGenerator';
import { ShareButton } from '../../src/components/ShareButton';
import { EmbedButton } from '../../src/components/EmbedButton';
import { FullscreenButton } from '../../src/components/FullscreenButton';
import { useTranslations } from '../../src/i18n';
import { useSEO } from '../../src/hooks';

export const meta: Route.MetaFunction = () => [
  { title: 'QR Code Generator - Free High-Resolution QR Codes | Tools' },
  { name: 'description', content: '무료 QR 코드 생성기. 고해상도, 투명 배경 QR코드를 만들어보세요.' },
];

const QR = memo(function QR() {
  const { qr } = useTranslations();

  useSEO({
    title: qr.seo.title,
    description: qr.seo.description,
    keywords: qr.seo.keywords,
    canonicalPath: '/qr',
  });

  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '기타 도구', en: 'Other Tools' }, href: '/other-tools' },
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
          <FullscreenButton />
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
