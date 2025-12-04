import { memo, useMemo } from 'react';
import type { Route } from './+types/drum-tool';
import { PageLayout } from '../../src/components/layout';
import { DrumTool as DrumToolComponent } from '../../src/apps/drum-tool/components';
import { ShareButton } from '../../src/components/ShareButton';
import { EmbedButton } from '../../src/components/EmbedButton';
import { FullscreenButton } from '../../src/components/FullscreenButton';
import { useLanguage } from '../../src/i18n';
import { useSEO } from '../../src/hooks';

const drumToolSEO = {
  ko: {
    title: '드럼 툴 - 드럼 머신 + 사운드 합성기',
    description: '드럼 머신과 사운드 합성기가 결합된 올인원 드럼 도구.',
    keywords: '드럼 머신, 드럼 합성기, 비트 메이킹, 드럼 사운드, 웹 오디오, 무료 드럼',
  },
  en: {
    title: 'Drum Tool - Drum Machine + Sound Synth',
    description: 'All-in-one drum tool combining drum machine and sound synthesizer.',
    keywords: 'drum machine, drum synth, beat making, drum sounds, web audio, free drums',
  },
};

export const meta: Route.MetaFunction = () => [
  { title: 'Drum Tool - Drum Machine + Sound Synth | Tools' },
  { name: 'description', content: drumToolSEO.ko.description },
];

const DrumTool = memo(function DrumTool() {
  const { language } = useLanguage();

  useSEO({
    title: drumToolSEO[language].title,
    description: drumToolSEO[language].description,
    keywords: drumToolSEO[language].keywords,
    canonicalPath: '/drum-tool',
  });

  const title = language === 'ko' ? '드럼 툴' : 'Drum Tool';
  const description =
    language === 'ko'
      ? '드럼 머신과 사운드 합성기가 결합된 올인원 드럼 도구'
      : 'All-in-one drum tool combining drum machine and sound synthesizer';

  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '결합 도구', en: 'Combined Tools' }, href: '/combined-tools' },
      { label: { ko: title, en: title } },
    ],
    [title]
  );

  return (
    <PageLayout
      title={title}
      description={description}
      breadcrumb={breadcrumb}
      actions={
        <>
          <EmbedButton title={title} defaultWidth={600} defaultHeight={700} />
          <FullscreenButton />
          <ShareButton title={title} description={description} />
        </>
      }
    >
      <DrumToolComponent />
    </PageLayout>
  );
});

DrumTool.displayName = 'DrumTool';

export default DrumTool;
