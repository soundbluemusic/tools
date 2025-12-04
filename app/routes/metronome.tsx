import { memo, useMemo } from 'react';
import type { Route } from './+types/metronome';
import { PageLayout } from '../../src/components/layout';
import { MetronomePlayer } from '../../src/apps/metronome/components/MetronomePlayer';
import { ShareButton } from '../../src/components/ShareButton';
import { EmbedButton } from '../../src/components/EmbedButton';
import { FullscreenButton } from '../../src/components/FullscreenButton';
import { useTranslations } from '../../src/i18n/context';
import { useSEO } from '../../src/hooks';

export const meta: Route.MetaFunction = () => [
  { title: 'Metronome - Online Precision Metronome | Tools' },
  { name: 'description', content: '온라인 정밀 메트로놈. BPM 20-400, 다양한 박자 설정 지원. 무료로 사용하세요.' },
];

const Metronome = memo(function Metronome() {
  const { metronome } = useTranslations();

  useSEO({
    title: metronome.seo.title,
    description: metronome.seo.description,
    keywords: metronome.seo.keywords,
    canonicalPath: '/metronome',
  });

  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/music-tools' },
      { label: { ko: metronome.title, en: metronome.title } },
    ],
    [metronome.title]
  );

  return (
    <PageLayout
      title={metronome.title}
      description={metronome.description}
      breadcrumb={breadcrumb}
      actions={
        <>
          <EmbedButton title={metronome.title} defaultWidth={400} defaultHeight={500} />
          <FullscreenButton />
          <ShareButton title={metronome.title} description={metronome.description} />
        </>
      }
    >
      <MetronomePlayer />
    </PageLayout>
  );
});

Metronome.displayName = 'Metronome';

export default Metronome;
