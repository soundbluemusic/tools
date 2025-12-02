import { memo, useMemo } from 'react';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import { Breadcrumb } from '../components/Breadcrumb';
import AppList from '../components/AppList';
import { COMBINED_APP_PATHS } from '../constants/apps';

const combinedToolsSEO = {
  ko: {
    title: '결합 도구',
    description:
      '여러 기능을 하나로 결합한 올인원 도구 모음. 복합 기능 도구로 더 효율적으로 작업하세요.',
    keywords: '결합 도구, 올인원 도구, 복합 도구, 통합 도구',
  },
  en: {
    title: 'Combined Tools',
    description:
      'All-in-one tools combining multiple features. Work more efficiently with integrated tools.',
    keywords:
      'combined tools, all-in-one tools, integrated tools, multi-feature tools',
  },
};

/**
 * Combined Tools Category Page
 * Displays all combined/integrated tools
 */
const CombinedTools = memo(function CombinedTools() {
  const { language } = useLanguage();
  const { apps, isLoading } = useApps();

  // Dynamic SEO for Combined Tools page
  useSEO({
    title: combinedToolsSEO[language].title,
    description: combinedToolsSEO[language].description,
    keywords: combinedToolsSEO[language].keywords,
    basePath: '/combined-tools',
  });

  // Filter combined apps
  const combinedApps = useMemo(() => {
    return apps.filter((app) =>
      COMBINED_APP_PATHS.includes(
        app.url as (typeof COMBINED_APP_PATHS)[number]
      )
    );
  }, [apps]);

  // Breadcrumb items
  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '결합 도구', en: 'Combined Tools' } },
    ],
    []
  );

  // Aria label for app list
  const appListAriaLabel =
    language === 'ko' ? '결합 도구 목록' : 'Combined tools list';

  return (
    <div className="home-page">
      <Breadcrumb items={breadcrumb} />

      {/* Page Header */}
      <div className="home-header category-header">
        <div className="category-header-text">
          <h1 className="home-title">
            {language === 'ko' ? '결합 도구' : 'Combined Tools'}
          </h1>
          <p className="category-description">
            {language === 'ko'
              ? '여러 기능을 하나로 결합한 올인원 도구들'
              : 'All-in-one tools combining multiple features'}
          </p>
        </div>
      </div>

      {/* App Grid */}
      <AppList
        apps={combinedApps}
        isPending={isLoading}
        language={language}
        ariaLabel={appListAriaLabel}
      />

      {/* No Results Message */}
      {combinedApps.length === 0 && !isLoading && (
        <p className="no-results">
          {language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

CombinedTools.displayName = 'CombinedTools';

export default CombinedTools;
