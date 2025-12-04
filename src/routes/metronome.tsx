import { createMemo, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
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
const Metronome: Component = () => {
  const t = useTranslations();
  const metronome = () => t().metronome;

  useSEO({
    title: metronome().seo.title,
    description: metronome().seo.description,
    keywords: metronome().seo.keywords,
    canonicalPath: '/metronome',
  });

  const breadcrumb = createMemo(() => [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/music-tools' },
    { label: { ko: metronome().title, en: metronome().title } },
  ]);

  return (
    <>
      <Title>{metronome().seo.title} | Tools</Title>
      <Meta name="description" content={metronome().seo.description} />

      <PageLayout
        title={metronome().title}
        description={metronome().description}
        breadcrumb={breadcrumb()}
        actions={
          <>
            <EmbedButton title={metronome().title} defaultWidth={400} defaultHeight={500} />
            <FullscreenButton />
            <ShareButton title={metronome().title} description={metronome().description} />
          </>
        }
      >
        <MetronomePlayer />
      </PageLayout>
    </>
  );
};

export default Metronome;
