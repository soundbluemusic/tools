import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { DrumMachine } from '../apps/drum/components/DrumMachine';
import { ShareButton } from '../components/ShareButton';
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

  return (
    <PageLayout
      title={drum.title}
      description={drum.description}
      actions={<ShareButton title={drum.title} description={drum.description} />}
    >
      <DrumMachine />
    </PageLayout>
  );
});

Drum.displayName = 'Drum';

export default Drum;
