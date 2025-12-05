import { createMemo, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import { AppList } from '../components/AppList';
import { Breadcrumb } from '../components/Breadcrumb';
import { MUSIC_APP_PATHS, COMBINED_APP_PATHS } from '../constants/apps';

const categorySEO = {
  ko: {
    title: '기타 도구',
    description:
      '디자이너와 마케터를 위한 무료 온라인 도구. QR 코드 생성기 등. 회원가입 없이, 광고 없이, 완전히 무료!',
    keywords: '무료 도구, QR 코드 생성기, 디자이너 도구, 마케터 도구',
  },
  en: {
    title: 'Other Tools',
    description:
      'Free online tools for designers and marketers. QR code generator and more. No signup, no ads, completely free!',
    keywords: 'free tools, QR code generator, designer tools, marketer tools',
  },
};

const breadcrumbItems = [
  { label: { ko: '홈', en: 'Home' }, href: '/' },
  { label: { ko: '기타 도구', en: 'Other Tools' }, href: '/other-tools' },
];

/**
 * Other Tools Category Page
 */
const OtherTools: Component = () => {
  const { language } = useLanguage();

  useSEO({
    description: categorySEO[language()].description,
    keywords: categorySEO[language()].keywords,
    canonicalPath: '/other-tools',
  });

  const { apps, isLoading } = useApps();

  const otherApps = createMemo(() =>
    apps.filter(
      (app) =>
        !MUSIC_APP_PATHS.includes(
          app.url as (typeof MUSIC_APP_PATHS)[number]
        ) &&
        !COMBINED_APP_PATHS.includes(
          app.url as (typeof COMBINED_APP_PATHS)[number]
        )
    )
  );

  const appListAriaLabel = () =>
    language() === 'ko' ? '기타 도구' : 'Other Tools';

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
              ? '디자이너와 마케터를 위한 도구'
              : 'Tools for designers and marketers'}
          </p>
        </div>

        <AppList
          apps={otherApps()}
          isPending={isLoading}
          language={language()}
          ariaLabel={appListAriaLabel()}
        />
      </div>
    </>
  );
};

export default OtherTools;
