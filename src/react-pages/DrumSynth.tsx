/**
 * Drum Synth Page Component (Astro Version)
 */
import { memo, useMemo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import { DrumSynth as DrumSynthComponent } from '../apps/drum-synth/components';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import type { Language } from '../i18n/types';
import { drumSynthKo, drumSynthEn } from '../i18n/translations/drum-synth';

interface DrumSynthPageProps {
  language: Language;
}

const DrumSynthPage = memo(function DrumSynthPage({
  language,
}: DrumSynthPageProps) {
  const t = language === 'ko' ? drumSynthKo : drumSynthEn;

  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/music-tools' },
      { label: { ko: t.title, en: t.title } },
    ],
    [t.title]
  );

  return (
    <PageLayoutAstro
      title={t.title}
      description={t.description}
      breadcrumb={breadcrumb}
      language={language}
      actions={
        <>
          <EmbedButton title={t.title} defaultWidth={500} defaultHeight={700} />
          <FullscreenButton />
          <ShareButton title={t.title} description={t.description} />
        </>
      }
    >
      <DrumSynthComponent translations={t} />
    </PageLayoutAstro>
  );
});

DrumSynthPage.displayName = 'DrumSynthPage';

export default DrumSynthPage;
