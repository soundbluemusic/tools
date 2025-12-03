/**
 * Music Tools Category Page Component (Astro Version)
 */
import { memo, useMemo } from 'react';
import { BreadcrumbAstro } from './BreadcrumbAstro';
import AppList from '../components/AppList';
import { MUSIC_APP_PATHS } from '../constants/apps';
import type { Language } from '../i18n/types';
import type { App } from '../types';

interface MusicToolsPageProps {
  language: Language;
  apps: App[];
}

const MusicToolsPage = memo(function MusicToolsPage({
  language,
  apps,
}: MusicToolsPageProps) {
  const musicApps = useMemo(() => {
    return apps.filter((app) =>
      MUSIC_APP_PATHS.includes(app.url as (typeof MUSIC_APP_PATHS)[number])
    );
  }, [apps]);

  const breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' } },
  ];

  const appListAriaLabel =
    language === 'ko' ? '음악 도구 목록' : 'Music tools list';

  return (
    <div className="home-page">
      <BreadcrumbAstro items={breadcrumb} language={language} />

      <div className="home-header category-header">
        <div className="category-header-text">
          <h1 className="home-title">
            {language === 'ko' ? '음악 도구' : 'Music Tools'}
          </h1>
          <p className="category-description">
            {language === 'ko'
              ? '음악 연습과 작곡에 필요한 도구들'
              : 'Tools for music practice and composition'}
          </p>
        </div>
      </div>

      <AppList
        apps={musicApps}
        isPending={false}
        language={language}
        ariaLabel={appListAriaLabel}
      />

      {musicApps.length === 0 && (
        <p className="no-results">
          {language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

MusicToolsPage.displayName = 'MusicToolsPage';

export default MusicToolsPage;
