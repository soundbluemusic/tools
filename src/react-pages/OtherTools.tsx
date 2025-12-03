/**
 * Other Tools Category Page Component (Astro Version)
 */
import { memo, useMemo } from 'react';
import { BreadcrumbAstro } from './BreadcrumbAstro';
import AppList from '../components/AppList';
import { MUSIC_APP_PATHS, COMBINED_APP_PATHS } from '../constants/apps';
import type { Language } from '../i18n/types';
import type { App } from '../types';

interface OtherToolsPageProps {
  language: Language;
  apps: App[];
}

const OtherToolsPage = memo(function OtherToolsPage({
  language,
  apps,
}: OtherToolsPageProps) {
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

  const breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '기타 도구', en: 'Other Tools' } },
  ];

  const appListAriaLabel =
    language === 'ko' ? '기타 도구 목록' : 'Other tools list';

  return (
    <div className="home-page">
      <BreadcrumbAstro items={breadcrumb} language={language} />

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

      <AppList
        apps={otherApps}
        isPending={false}
        language={language}
        ariaLabel={appListAriaLabel}
      />

      {otherApps.length === 0 && (
        <p className="no-results">
          {language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

OtherToolsPage.displayName = 'OtherToolsPage';

export default OtherToolsPage;
