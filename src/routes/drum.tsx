import { createMemo, lazy, Suspense, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import { useTranslations } from '../i18n/context';
import { useSEO } from '../hooks';
import { Loader } from '../components/ui';

// Lazy load the drum machine component
const DrumMachine = lazy(() =>
  import('../apps/drum/components/DrumMachine').then((m) => ({
    default: m.DrumMachine,
  }))
);

/**
 * Drum Machine Tool Page
 */
const Drum: Component = () => {
  const t = useTranslations();
  const drum = () => t().drum;

  useSEO({
    title: drum().seo.title,
    description: drum().seo.description,
    keywords: drum().seo.keywords,
    canonicalPath: '/drum',
    softwareApp: {
      name: drum().seo.title,
      description: drum().seo.description,
      applicationCategory: 'MusicApplication',
    },
  });

  const breadcrumb = createMemo(() => [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/music-tools' },
    { label: { ko: drum().title, en: drum().title } },
  ]);

  return (
    <>
      <Title>{drum().seo.title} | Tools</Title>
      <Meta name="description" content={drum().seo.description} />

      <PageLayout
        title={drum().title}
        description={drum().description}
        breadcrumb={breadcrumb()}
        actions={
          <>
            <EmbedButton
              title={drum().title}
              defaultWidth={500}
              defaultHeight={600}
            />
            <FullscreenButton />
            <ShareButton
              title={drum().title}
              description={drum().description}
            />
          </>
        }
      >
        <Suspense fallback={<Loader />}>
          <DrumMachine />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default Drum;
