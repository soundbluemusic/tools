import { memo, useMemo } from 'react';
import type { Route } from './+types/drum';
import { PageLayout } from '../../src/components/layout';
import { DrumMachine } from '../../src/apps/drum/components/DrumMachine';
import { ShareButton } from '../../src/components/ShareButton';
import { EmbedButton } from '../../src/components/EmbedButton';
import { FullscreenButton } from '../../src/components/FullscreenButton';
import { useTranslations } from '../../src/i18n/context';
import { useSEO } from '../../src/hooks';

export const meta: Route.MetaFunction = () => [
  { title: 'Drum Machine - Online Drum Pattern Sequencer | Tools' },
  { name: 'description', content: '온라인 드럼 머신. 드럼 패턴을 만들고 연습하세요. MIDI 가져오기/내보내기 지원.' },
];

const Drum = memo(function Drum() {
  const { drum } = useTranslations();

  useSEO({
    title: drum.seo.title,
    description: drum.seo.description,
    keywords: drum.seo.keywords,
    canonicalPath: '/drum',
  });

  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/music-tools' },
      { label: { ko: drum.title, en: drum.title } },
    ],
    [drum.title]
  );

  return (
    <PageLayout
      title={drum.title}
      description={drum.description}
      breadcrumb={breadcrumb}
      actions={
        <>
          <EmbedButton title={drum.title} defaultWidth={500} defaultHeight={600} />
          <FullscreenButton />
          <ShareButton title={drum.title} description={drum.description} />
        </>
      }
    >
      <DrumMachine />
    </PageLayout>
  );
});

Drum.displayName = 'Drum';

export default Drum;
