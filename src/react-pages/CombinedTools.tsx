/**
 * Combined Tools Category Page Component (Astro Version)
 */
import { memo, useMemo } from 'react';
import { BreadcrumbAstro } from './BreadcrumbAstro';
import AppList from '../components/AppList';
import { COMBINED_APP_PATHS } from '../constants/apps';
import type { Language } from '../i18n/types';
import type { App } from '../types';

interface CombinedToolsPageProps {
  language: Language;
  apps: App[];
}

const CombinedToolsPage = memo(function CombinedToolsPage({
  language,
  apps,
}: CombinedToolsPageProps) {
  const combinedApps = useMemo(() => {
    return apps.filter((app) =>
      COMBINED_APP_PATHS.includes(
        app.url as (typeof COMBINED_APP_PATHS)[number]
      )
    );
  }, [apps]);

  const breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '결합 도구', en: 'Combined Tools' } },
  ];

  const appListAriaLabel =
    language === 'ko' ? '결합 도구 목록' : 'Combined tools list';

  return (
    <div className="home-page">
      <BreadcrumbAstro items={breadcrumb} language={language} />

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

      <AppList
        apps={combinedApps}
        isPending={false}
        language={language}
        ariaLabel={appListAriaLabel}
      />

      {combinedApps.length === 0 && (
        <p className="no-results">
          {language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

CombinedToolsPage.displayName = 'CombinedToolsPage';

export default CombinedToolsPage;
