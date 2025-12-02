import { memo, useMemo } from 'react';
import { PageLayout } from '../components/layout';
import { DrumMachine } from '../apps/drum/components/DrumMachine';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { useTranslations } from '../i18n/context';
import { useSEO } from '../hooks';

/**
 * Drum Machine Tool Page
 */
const Drum = memo(function Drum() {
  const { drum } = useTranslations();

  // Dynamic SEO for Drum page
  useSEO({
    title: drum.seo.title,
    description: drum.seo.description,
    keywords: drum.seo.keywords,
    canonicalPath: '/drum',
  });

  // Breadcrumb items
  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/' },
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
          <EmbedButton
            title={drum.title}
            defaultWidth={500}
            defaultHeight={600}
          />
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
