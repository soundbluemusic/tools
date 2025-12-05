import { createMemo, lazy, Suspense, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import { useTranslations } from '../i18n';
import { useSEO } from '../hooks';
import { Loader } from '../components/ui';

// Lazy load the heavy QR generator component
const QRGenerator = lazy(() =>
  import('../apps/qr/components/QRGenerator').then((m) => ({
    default: m.QRGenerator,
  }))
);

/**
 * QR Code Generator Tool Page
 */
const QR: Component = () => {
  const t = useTranslations();
  const qr = () => t().qr;

  useSEO({
    title: qr().seo.title,
    description: qr().seo.description,
    keywords: qr().seo.keywords,
    canonicalPath: '/qr',
  });

  const breadcrumb = createMemo(() => [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '기타 도구', en: 'Other Tools' }, href: '/other-tools' },
    { label: { ko: qr().title, en: qr().title } },
  ]);

  return (
    <>
      <Title>{qr().seo.title} | Tools</Title>
      <Meta name="description" content={qr().seo.description} />

      <PageLayout
        title={qr().title}
        description={qr().subtitle}
        breadcrumb={breadcrumb()}
        actions={
          <>
            <EmbedButton
              title={qr().title}
              defaultWidth={400}
              defaultHeight={600}
            />
            <FullscreenButton />
            <ShareButton title={qr().title} description={qr().subtitle} />
          </>
        }
      >
        <Suspense fallback={<Loader />}>
          <QRGenerator />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default QR;
