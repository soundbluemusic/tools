import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { MetronomePlayer } from '../apps/metronome/components/MetronomePlayer';
import { useTranslations } from '../i18n/context';
import { useSEO } from '../hooks';

/**
 * Metronome Tool Page
 */
const Metronome = memo(function Metronome() {
  const { metronome } = useTranslations();

  // Dynamic SEO for Metronome page
  useSEO({
    title: metronome.seo.title,
    description: metronome.seo.description,
    keywords: metronome.seo.keywords,
    canonicalPath: '/metronome',
  });

  return (
    <PageLayout title={metronome.title} description={metronome.description}>
      <MetronomePlayer />
    </PageLayout>
  );
});

Metronome.displayName = 'Metronome';

export default Metronome;
