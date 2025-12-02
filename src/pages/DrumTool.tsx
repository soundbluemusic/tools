import { memo, useMemo } from 'react';
import { PageLayout } from '../components/layout';
import { DrumTool as DrumToolComponent } from '../apps/drum-tool/components';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import { useLanguage } from '../i18n';
import { useSEO } from '../hooks';

const drumToolSEO = {
  ko: {
    title: '드럼 툴 - 드럼 머신 + 사운드 합성기',
    description:
      '드럼 머신과 사운드 합성기가 결합된 올인원 드럼 도구. 16스텝 시퀀서로 비트를 만들고, 세밀한 파라미터로 사운드를 디자인하세요.',
    keywords:
      '드럼 머신, 드럼 합성기, 비트 메이킹, 드럼 사운드, 웹 오디오, 무료 드럼',
  },
  en: {
    title: 'Drum Tool - Drum Machine + Sound Synth',
    description:
      'All-in-one drum tool combining drum machine and sound synthesizer. Create beats with 16-step sequencer and design sounds with detailed parameters.',
    keywords:
      'drum machine, drum synth, beat making, drum sounds, web audio, free drums',
  },
};

/**
 * Drum Tool Page
 * Combined drum machine and synthesizer
 */
const DrumTool = memo(function DrumTool() {
  const { language } = useLanguage();

  // Dynamic SEO for Drum Tool page
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

  // Breadcrumb items
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
