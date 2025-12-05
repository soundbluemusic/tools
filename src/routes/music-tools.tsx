import { createMemo, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import { AppList } from '../components/AppList';
import { Breadcrumb } from '../components/Breadcrumb';
import { MUSIC_APP_PATHS } from '../constants/apps';

const categorySEO = {
  ko: {
    title: '음악 도구',
    description:
      '음악가와 작곡가를 위한 무료 온라인 도구. 메트로놈, 드럼머신, 드럼 신스 등. 회원가입 없이, 광고 없이, 완전히 무료!',
    keywords: '무료 음악 도구, 메트로놈, 드럼머신, 드럼 신스, 음악가 도구',
  },
  en: {
    title: 'Music Tools',
    description:
      'Free online tools for musicians and composers. Metronome, drum machine, drum synth and more. No signup, no ads, completely free!',
    keywords:
      'free music tools, metronome, drum machine, drum synth, musician tools',
  },
};

const breadcrumbItems = [
  { label: { ko: '홈', en: 'Home' }, href: '/' },
  { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/music-tools' },
];

/**
 * Music Tools Category Page
 */
const MusicTools: Component = () => {
  const { language } = useLanguage();

  useSEO({
    description: categorySEO[language()].description,
    keywords: categorySEO[language()].keywords,
    canonicalPath: '/music-tools',
  });

  const { apps, isLoading } = useApps();

  const musicApps = createMemo(() =>
    apps.filter((app) =>
      MUSIC_APP_PATHS.includes(app.url as (typeof MUSIC_APP_PATHS)[number])
    )
  );

  const appListAriaLabel = () =>
    language() === 'ko' ? '음악 도구' : 'Music Tools';

  return (
    <>
      <Title>
        {categorySEO[language()].title} - Tools
      </Title>
      <Meta name="description" content={categorySEO[language()].description} />
      <Meta name="keywords" content={categorySEO[language()].keywords} />

      <div class="w-full p-6 md:p-8 lg:p-10">
        <Breadcrumb items={breadcrumbItems} />

        <div class="mb-6 md:mb-8 lg:mb-10">
          <h1 class="text-2xl font-semibold text-[var(--color-text-primary)] m-0 mb-2 max-[480px]:text-xl">
            {categorySEO[language()].title}
          </h1>
          <p class="text-[var(--color-text-secondary)] m-0">
            {language() === 'ko'
              ? '음악가와 작곡가를 위한 도구'
              : 'Tools for musicians and composers'}
          </p>
        </div>

        <AppList
          apps={musicApps()}
          isPending={isLoading}
          language={language()}
          ariaLabel={appListAriaLabel()}
        />
      </div>
    </>
  );
};

export default MusicTools;
