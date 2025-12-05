import { createMemo, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import { AppList } from '../components/AppList';
import { Breadcrumb } from '../components/Breadcrumb';
import { COMBINED_APP_PATHS } from '../constants/apps';

const categorySEO = {
  ko: {
    title: '결합 도구',
    description:
      '여러 기능을 하나로 결합한 올인원 도구. 드럼 툴 등. 회원가입 없이, 광고 없이, 완전히 무료!',
    keywords: '무료 도구, 올인원 도구, 드럼 툴, 결합 도구',
  },
  en: {
    title: 'Combined Tools',
    description:
      'All-in-one tools combining multiple features. Drum Tool and more. No signup, no ads, completely free!',
    keywords: 'free tools, all-in-one tools, drum tool, combined tools',
  },
};

const breadcrumbItems = [
  { label: { ko: '홈', en: 'Home' }, href: '/' },
  { label: { ko: '결합 도구', en: 'Combined Tools' }, href: '/combined-tools' },
];

/**
 * Combined Tools Category Page
 */
const CombinedTools: Component = () => {
  const { language } = useLanguage();

  useSEO({
    description: categorySEO[language()].description,
    keywords: categorySEO[language()].keywords,
    canonicalPath: '/combined-tools',
  });

  const { apps, isLoading } = useApps();

  const combinedApps = createMemo(() =>
    apps.filter((app) =>
      COMBINED_APP_PATHS.includes(app.url as (typeof COMBINED_APP_PATHS)[number])
    )
  );

  const appListAriaLabel = () =>
    language() === 'ko' ? '결합 도구' : 'Combined Tools';

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
              ? '여러 기능을 하나로 결합한 도구'
              : 'All-in-one tools combining multiple features'}
          </p>
        </div>

        <AppList
          apps={combinedApps()}
          isPending={isLoading}
          language={language()}
          ariaLabel={appListAriaLabel()}
        />
      </div>
    </>
  );
};

export default CombinedTools;
