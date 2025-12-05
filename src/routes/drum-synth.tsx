import { createMemo, lazy, Suspense, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import { useTranslations } from '../i18n/context';
import { useSEO } from '../hooks';
import { Loader } from '../components/ui';

// Lazy load the drum synth component
const DrumSynth = lazy(() =>
  import('../apps/drum-synth/components/DrumSynth').then((m) => ({
    default: m.DrumSynth,
  }))
);

/**
 * Drum Sound Synthesizer Tool Page
 */
const DrumSynthPage: Component = () => {
  const t = useTranslations();
  const drumSynth = () => t().drumSynth;

  useSEO({
    title: drumSynth().seo.title,
    description: drumSynth().seo.description,
    keywords: drumSynth().seo.keywords,
    canonicalPath: '/drum-synth',
    softwareApp: {
      name: drumSynth().seo.title,
      description: drumSynth().seo.description,
      applicationCategory: 'MusicApplication',
    },
  });

  const breadcrumb = createMemo(() => [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/music-tools' },
    { label: { ko: drumSynth().title, en: drumSynth().title } },
  ]);

  return (
    <>
      <Title>{drumSynth().seo.title} | Tools</Title>
      <Meta name="description" content={drumSynth().seo.description} />

      <PageLayout
        title={drumSynth().title}
        description={drumSynth().description}
        breadcrumb={breadcrumb()}
        actions={
          <>
            <EmbedButton
              title={drumSynth().title}
              defaultWidth={600}
              defaultHeight={800}
            />
            <FullscreenButton />
            <ShareButton
              title={drumSynth().title}
              description={drumSynth().description}
            />
          </>
        }
      >
        <Suspense fallback={<Loader />}>
          <DrumSynth />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default DrumSynthPage;
