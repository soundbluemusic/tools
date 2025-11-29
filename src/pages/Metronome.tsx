import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { MetronomePlayer } from '../apps/metronome/components/MetronomePlayer';
import { useTranslations } from '../i18n/context';

/**
 * Metronome Tool Page
 */
const Metronome = memo(function Metronome() {
  const { metronome } = useTranslations();

  return (
    <PageLayout title={metronome.title} description={metronome.description}>
      <MetronomePlayer />
    </PageLayout>
  );
});

Metronome.displayName = 'Metronome';

export default Metronome;
