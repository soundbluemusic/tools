import { memo, useMemo } from 'react';
import { PageLayout } from '../components/layout';
import { DrumSynth as DrumSynthComponent } from '../apps/drum-synth/components';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import { useTranslations } from '../i18n/context';
import { useSEO } from '../hooks';

/**
 * Drum Synth Tool Page
 * Detailed drum sound synthesis with parameter control
 */
const DrumSynth = memo(function DrumSynth() {
  const { drumSynth } = useTranslations();

  // Dynamic SEO for Drum Synth page
  useSEO({
    title: drumSynth.seo.title,
    description: drumSynth.seo.description,
    keywords: drumSynth.seo.keywords,
    canonicalPath: '/drum-synth',
  });

  // Breadcrumb items
  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/music-tools' },
      { label: { ko: drumSynth.title, en: drumSynth.title } },
    ],
    [drumSynth.title]
  );

  return (
    <PageLayout
      title={drumSynth.title}
      description={drumSynth.description}
      breadcrumb={breadcrumb}
      actions={
        <>
          <EmbedButton
            title={drumSynth.title}
            defaultWidth={500}
            defaultHeight={700}
          />
          <FullscreenButton />
          <ShareButton
            title={drumSynth.title}
            description={drumSynth.description}
          />
        </>
      }
    >
      <DrumSynthComponent />
    </PageLayout>
  );
});

DrumSynth.displayName = 'DrumSynth';

export default DrumSynth;
