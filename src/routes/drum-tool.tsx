import { createMemo, lazy, Suspense, type Component } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { ShareButton } from '../components/ShareButton';
import { EmbedButton } from '../components/EmbedButton';
import { FullscreenButton } from '../components/FullscreenButton';
import { useLanguage } from '../i18n/context';
import { useSEO } from '../hooks';
import { Loader } from '../components/ui';
// Route-level CSS for code splitting
import '../styles/tool-page.css';

// Lazy load the drum tool component
const DrumTool = lazy(() =>
  import('../apps/drum-tool/components/DrumTool').then((m) => ({
    default: m.DrumTool,
  }))
);

/**
 * Route preload function - prefetches component on hover intent
 */
export const route: RouteDefinition = {
  preload: () => {
    import('../apps/drum-tool/components/DrumTool');
  },
};

/**
 * Drum Tool Page - Combined Drum Machine + Synth
 */
const DrumToolPage: Component = () => {
  const { language } = useLanguage();

  const title = () => (language() === 'ko' ? '드럼 툴' : 'Drum Tool');
  const description = () =>
    language() === 'ko'
      ? '드럼 머신과 사운드 합성기를 결합한 올인원 드럼 도구'
      : 'All-in-one drum tool combining drum machine and sound synthesizer';
  const seoTitle = () =>
    language() === 'ko'
      ? '드럼 툴 - 드럼 머신 + 사운드 합성기'
      : 'Drum Tool - Drum Machine + Sound Synthesizer';
  const seoDescription = () =>
    language() === 'ko'
      ? '드럼 머신과 Web Audio 사운드 합성기를 하나로 결합한 올인원 드럼 도구. 패턴을 만들고 사운드를 커스터마이징하세요.'
      : 'All-in-one drum tool combining drum machine and Web Audio sound synthesizer. Create patterns and customize your sounds.';

  useSEO({
    title: seoTitle(),
    description: seoDescription(),
    keywords:
      'drum tool, drum machine, drum synth, 808, beat maker, 드럼 툴, 드럼 머신',
    canonicalPath: '/drum-tool',
    softwareApp: {
      name: seoTitle(),
      description: seoDescription(),
      applicationCategory: 'MusicApplication',
    },
  });

  const breadcrumb = createMemo(() => [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    {
      label: { ko: '결합 도구', en: 'Combined Tools' },
      href: '/combined-tools',
    },
    { label: { ko: title(), en: title() } },
  ]);

  return (
    <>
      <Title>{seoTitle()} | Tools</Title>
      <Meta name="description" content={seoDescription()} />

      <PageLayout
        title={title()}
        description={description()}
        breadcrumb={breadcrumb()}
        actions={
          <>
            <EmbedButton
              title={title()}
              defaultWidth={600}
              defaultHeight={800}
            />
            <FullscreenButton />
            <ShareButton title={title()} description={description()} />
          </>
        }
      >
        <Suspense fallback={<Loader />}>
          <DrumTool />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default DrumToolPage;
