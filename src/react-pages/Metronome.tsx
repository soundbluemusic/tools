/**
 * Metronome Page Component (Astro Version)
 */
import { memo, useMemo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import { MetronomePlayer } from '../apps/metronome/components/MetronomePlayer';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import type { Language } from '../i18n/types';
import { metronomeKo, metronomeEn } from '../i18n/translations/metronome';

interface MetronomePageProps {
  language: Language;
}

const MetronomePage = memo(function MetronomePage({
  language,
}: MetronomePageProps) {
  const t = language === 'ko' ? metronomeKo : metronomeEn;

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
          <EmbedButton title={t.title} defaultWidth={400} defaultHeight={500} />
          <FullscreenButton />
          <ShareButton title={t.title} description={t.description} />
        </>
      }
    >
      <MetronomePlayer translations={t} />
    </PageLayoutAstro>
  );
});

MetronomePage.displayName = 'MetronomePage';

export default MetronomePage;
