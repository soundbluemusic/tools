/**
 * Drum Machine Page Component (Astro Version)
 */
import { memo, useMemo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import { DrumMachine } from '../apps/drum/components/DrumMachine';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import type { Language } from '../i18n/types';
import { drumKo, drumEn } from '../i18n/translations/drum';

interface DrumPageProps {
  language: Language;
}

const DrumPage = memo(function DrumPage({ language }: DrumPageProps) {
  const t = language === 'ko' ? drumKo : drumEn;

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
          <EmbedButton title={t.title} defaultWidth={500} defaultHeight={600} />
          <FullscreenButton />
          <ShareButton title={t.title} description={t.description} />
        </>
      }
    >
      <DrumMachine translations={t} />
    </PageLayoutAstro>
  );
});

DrumPage.displayName = 'DrumPage';

export default DrumPage;
