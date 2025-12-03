/**
 * Drum Tool Page Component (Astro Version)
 */
import { memo, useMemo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import { DrumTool as DrumToolComponent } from '../apps/drum-tool/components';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import type { Language } from '../i18n/types';

interface DrumToolPageProps {
  language: Language;
}

const DrumToolPage = memo(function DrumToolPage({
  language,
}: DrumToolPageProps) {
  const title = language === 'ko' ? '드럼 툴' : 'Drum Tool';
  const description =
    language === 'ko'
      ? '드럼 머신과 사운드 합성기가 결합된 올인원 드럼 도구'
      : 'All-in-one drum tool combining drum machine and sound synthesizer';

  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      {
        label: { ko: '결합 도구', en: 'Combined Tools' },
        href: '/combined-tools',
      },
      { label: { ko: title, en: title } },
    ],
    [title]
  );

  return (
    <PageLayoutAstro
      title={title}
      description={description}
      breadcrumb={breadcrumb}
      language={language}
      actions={
        <>
          <EmbedButton title={title} defaultWidth={600} defaultHeight={700} />
          <FullscreenButton />
          <ShareButton title={title} description={description} />
        </>
      }
    >
      <DrumToolComponent />
    </PageLayoutAstro>
  );
});

DrumToolPage.displayName = 'DrumToolPage';

export default DrumToolPage;
