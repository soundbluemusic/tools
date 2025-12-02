import { memo, useMemo } from 'react';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import { Breadcrumb } from '../components/Breadcrumb';
import AppList from '../components/AppList';
import { MUSIC_APP_PATHS } from '../constants/apps';

const musicToolsSEO = {
  ko: {
    title: '음악 도구',
    description:
      '무료 온라인 음악 도구 모음. 메트로놈, 드럼 머신, 드럼 신스 등 음악 연습과 작곡에 필요한 도구를 제공합니다.',
    keywords:
      '메트로놈, 드럼 머신, 드럼 신스, 음악 도구, 무료 음악 도구, 온라인 메트로놈',
  },
  en: {
    title: 'Music Tools',
    description:
      'Free online music tools. Metronome, drum machine, drum synth and more tools for music practice and composition.',
    keywords:
      'metronome, drum machine, drum synth, music tools, free music tools, online metronome',
  },
};

/**
 * Music Tools Category Page
 * Displays all music-related tools
 */
const MusicTools = memo(function MusicTools() {
  const { language } = useLanguage();
  const { apps, isLoading } = useApps();

  // Dynamic SEO for Music Tools page
  useSEO({
    title: musicToolsSEO[language].title,
    description: musicToolsSEO[language].description,
    keywords: musicToolsSEO[language].keywords,
    basePath: '/music-tools',
  });

  // Filter music apps
  const musicApps = useMemo(() => {
    return apps.filter((app) =>
      MUSIC_APP_PATHS.includes(app.url as (typeof MUSIC_APP_PATHS)[number])
    );
  }, [apps]);

  // Breadcrumb items
  const breadcrumb = useMemo(
    () => [
      { label: { ko: '홈', en: 'Home' }, href: '/' },
      { label: { ko: '음악 도구', en: 'Music Tools' } },
    ],
    []
  );

  // Aria label for app list
  const appListAriaLabel =
    language === 'ko' ? '음악 도구 목록' : 'Music tools list';

  return (
    <div className="home-page">
      <Breadcrumb items={breadcrumb} />

      {/* Page Header */}
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

      {/* App Grid */}
      <AppList
        apps={musicApps}
        isPending={isLoading}
        language={language}
        ariaLabel={appListAriaLabel}
      />

      {/* No Results Message */}
      {musicApps.length === 0 && !isLoading && (
        <p className="no-results">
          {language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

MusicTools.displayName = 'MusicTools';

export default MusicTools;
