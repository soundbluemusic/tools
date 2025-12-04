import { memo, useMemo } from 'react';
import type { Route } from './+types/drum-synth';
import { PageLayout } from '../../src/components/layout';
import { DrumSynth as DrumSynthComponent } from '../../src/apps/drum-synth/components';
import { ShareButton } from '../../src/components/ShareButton';
import { EmbedButton } from '../../src/components/EmbedButton';
import { FullscreenButton } from '../../src/components/FullscreenButton';
import { useTranslations } from '../../src/i18n/context';
import { useSEO } from '../../src/hooks';

export const meta: Route.MetaFunction = () => [
  { title: 'Drum Sound Synth - Web Audio Drum Synthesizer | Tools' },
  { name: 'description', content: 'Web Audio 드럼 사운드 신디사이저. 상세한 파라미터 컨트롤로 드럼 사운드를 만들어보세요.' },
];

const DrumSynth = memo(function DrumSynth() {
  const { drumSynth } = useTranslations();

  useSEO({
    title: drumSynth.seo.title,
    description: drumSynth.seo.description,
    keywords: drumSynth.seo.keywords,
    canonicalPath: '/drum-synth',
  });

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
          <EmbedButton title={drumSynth.title} defaultWidth={500} defaultHeight={700} />
          <FullscreenButton />
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
