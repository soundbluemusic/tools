import { memo, useMemo } from 'react';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import { Breadcrumb } from '../components/Breadcrumb';
import AppList from '../components/AppList';
import { MUSIC_APP_PATHS, COMBINED_APP_PATHS } from '../constants/apps';

const otherToolsSEO = {
  ko: {
    title: '기타 도구',
    description:
      '무료 온라인 유틸리티 도구 모음. QR 코드 생성기 등 다양한 유틸리티 도구를 제공합니다.',
    keywords: 'QR코드 생성기, 무료 QR코드, 온라인 도구, 유틸리티 도구',
  },
  en: {
    title: 'Other Tools',
    description:
      'Free online utility tools. QR code generator and various utility tools.',
    keywords: 'QR code generator, free QR code, online tools, utility tools',
  },
};

/**
 * Other Tools Category Page
 * Displays all non-music tools
 */
const OtherTools = memo(function OtherTools() {
  const { language } = useLanguage();
  const { apps, isLoading } = useApps();

  // Dynamic SEO for Other Tools page
  useSEO({
    title: otherToolsSEO[language].title,
    description: otherToolsSEO[language].description,
    keywords: otherToolsSEO[language].keywords,
    basePath: '/other-tools',
  });

  // Filter non-music and non-combined apps
  const otherApps = useMemo(() => {
    return apps.filter(
      (app) =>
        !MUSIC_APP_PATHS.includes(
          app.url as (typeof MUSIC_APP_PATHS)[number]
        ) &&
        !COMBINED_APP_PATHS.includes(
          app.url as (typeof COMBINED_APP_PATHS)[number]
        )
    );
  }, [apps]);

  // Breadcrumb items
  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '기타 도구', en: 'Other Tools' } },
    ],
    []
  );

  // Aria label for app list
  const appListAriaLabel =
    language === 'ko' ? '기타 도구 목록' : 'Other tools list';

  return (
    <div className="p-4 sm:py-5 sm:px-6 md:py-6 md:px-8">
      <Breadcrumb items={breadcrumb} />

      {/* Page Header */}
      <div className="flex flex-col items-start gap-4 mb-4 md:mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-semibold m-0 text-text-primary">
            {language === 'ko' ? '기타 도구' : 'Other Tools'}
          </h1>
          <p className="m-0 text-[0.95rem] text-text-secondary font-normal">
            {language === 'ko'
              ? '다양한 유틸리티 도구들'
              : 'Various utility tools'}
          </p>
        </div>
      </div>

      {/* App Grid */}
      <AppList
        apps={otherApps}
        isPending={isLoading}
        language={language}
        ariaLabel={appListAriaLabel}
      />

      {/* No Results Message */}
      {otherApps.length === 0 && !isLoading && (
        <p className="text-center text-text-secondary p-8 text-[0.95rem]">
          {language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

OtherTools.displayName = 'OtherTools';

export default OtherTools;
