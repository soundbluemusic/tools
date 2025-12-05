import { createMemo, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { DrumSynth } from '../apps/drum-synth/components/DrumSynth';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import { useTranslations } from '../i18n/context';
import { useSEO } from '../hooks';

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
        <DrumSynth />
      </PageLayout>
    </>
  );
};

export default DrumSynthPage;
