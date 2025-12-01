import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { DrumSynth as DrumSynthComponent } from '../apps/drum-synth/components';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
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

  return (
    <PageLayout
      title={drumSynth.title}
      description={drumSynth.description}
      actions={
        <>
          <EmbedButton title={drumSynth.title} defaultWidth={500} defaultHeight={700} />
          <ShareButton title={drumSynth.title} description={drumSynth.description} />
        </>
      }
    >
      <DrumSynthComponent />
    </PageLayout>
  );
});

DrumSynth.displayName = 'DrumSynth';

export default DrumSynth;
