import { memo, useState, useMemo, useCallback, useTransition } from 'react';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import AppList from '../components/AppList';
import { sortApps } from '../utils/sort';
import type { SortOption } from '../types';

const homeSEO = {
  ko: {
    description:
      '무료 온라인 도구 모음. QR 코드 생성기로 고해상도 QR코드를 만들고, 정밀 메트로놈으로 음악 연습을 하세요. 모든 도구 100% 무료, 회원가입 불필요!',
    keywords:
      'QR코드 생성기, 무료 QR코드, 메트로놈 온라인, 무료 메트로놈, 온라인 도구, 무료 도구, free tools',
  },
  en: {
    description:
      'Free online tools. Create high-resolution QR codes and practice music with precision metronome. All tools 100% free, no signup required!',
    keywords:
      'QR code generator, free QR code, online metronome, free metronome, online tools, free tools',
  },
};

/**
 * Home Page Component
 * Displays a searchable and sortable list of tools
 * Optimized for instant interactions
 */
const Home = memo(function Home() {
  const { language, t } = useLanguage();
  const homeT = t.common.home;

  // Dynamic SEO for Home page
  useSEO({
    description: homeSEO[language].description,
    keywords: homeSEO[language].keywords,
    basePath: '/',
    isHomePage: true,
  });

  // Use shared apps from context (loaded once by AppsProvider)
  const { apps, isLoading } = useApps();

  // Sort state with transition for non-blocking updates
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [isPending, startTransition] = useTransition();

  // Sort options with translations
  const sortOptions = useMemo(
    () => [
      { value: 'name-asc' as const, label: homeT.sort.nameAsc },
      { value: 'name-desc' as const, label: homeT.sort.nameDesc },
      { value: 'name-long' as const, label: homeT.sort.nameLong },
      { value: 'name-short' as const, label: homeT.sort.nameShort },
      { value: 'size-large' as const, label: homeT.sort.sizeLarge },
      { value: 'size-small' as const, label: homeT.sort.sizeSmall },
    ],
    [homeT.sort]
  );

  // Sort apps - only recompute when inputs change
  const sortedApps = useMemo(() => {
    return sortApps(apps, sortBy, language);
  }, [apps, sortBy, language]);

  // Sort change with transition for smooth UI
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      startTransition(() => {
        setSortBy(e.target.value as SortOption);
      });
    },
    []
  );

  // Aria label for app list
  const appListAriaLabel =
    language === 'ko' ? '사용 가능한 도구' : 'Available tools';

  return (
    <div>
      {/* Page Header with Controls */}
      <div className="flex justify-between items-center gap-4 flex-wrap mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-text-primary tracking-tight">
          {language === 'ko' ? '모든 도구' : 'All Tools'}
        </h1>
        <div className="flex gap-3 items-center flex-wrap">
          {/* Sort Dropdown */}
          <select
            className="px-4 py-3 text-sm font-inherit border border-border-secondary rounded-md bg-bg-tertiary text-text-primary cursor-pointer outline-none transition-all duration-fast focus:border-border-focus focus:shadow-focus hover:border-border-primary min-w-[150px]"
            value={sortBy}
            onChange={handleSortChange}
            aria-label={homeT.sortAriaLabel}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* App Grid */}
      <AppList
        apps={sortedApps}
        isPending={isPending || isLoading}
        language={language}
        ariaLabel={appListAriaLabel}
      />

      {/* No Results Message */}
      {sortedApps.length === 0 && !isLoading && (
        <p className="text-center text-text-secondary py-8 text-sm">
          {language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
