import { memo, useMemo } from 'react';
import { PageLayout } from '../components/layout';
import { MetronomePlayer } from '../apps/metronome/components/MetronomePlayer';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import { useTranslations } from '../i18n/context';
import { useSEO } from '../hooks';

/**
 * Metronome Tool Page
 */
const Metronome = memo(function Metronome() {
  const { metronome } = useTranslations();

  // Dynamic SEO for Metronome page
  useSEO({
    title: metronome.seo.title,
    description: metronome.seo.description,
    keywords: metronome.seo.keywords,
    canonicalPath: '/metronome',
  });

  // Breadcrumb items
  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/' },
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
          <EmbedButton
            title={metronome.title}
            defaultWidth={400}
            defaultHeight={500}
          />
          <FullscreenButton />
          <ShareButton
            title={metronome.title}
            description={metronome.description}
          />
        </>
      }
    >
      <MetronomePlayer />
    </PageLayout>
  );
});

Metronome.displayName = 'Metronome';

export default Metronome;
