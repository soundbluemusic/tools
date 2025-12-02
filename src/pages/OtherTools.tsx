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
    <div className="home-page">
      <Breadcrumb items={breadcrumb} />

      {/* Page Header */}
      <div className="home-header category-header">
        <div className="category-header-text">
          <h1 className="home-title">
            {language === 'ko' ? '기타 도구' : 'Other Tools'}
          </h1>
          <p className="category-description">
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
        <p className="no-results">
          {language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

OtherTools.displayName = 'OtherTools';

export default OtherTools;
