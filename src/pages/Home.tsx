import {
  memo,
  useState,
  useMemo,
  useCallback,
  useTransition,
  useEffect,
} from 'react';
import { loadApps } from '../constants/apps';
import { useLanguage } from '../i18n';
import { useSEO } from '../hooks';
import AppList from '../components/AppList';
import type { App, SortOption } from '../types';
import type { Language } from '../i18n/types';

const homeSEO = {
  ko: {
    description:
      '무료 온라인 생산성 도구 모음. QR 코드 생성기로 고해상도 QR코드를 만들고, 정밀 메트로놈으로 음악 연습을 하세요. 모든 도구 100% 무료, 회원가입 불필요!',
    keywords:
      'QR코드 생성기, 무료 QR코드, 메트로놈 온라인, 무료 메트로놈, 온라인 도구, 생산성 도구, 무료 도구, productivity tools',
  },
  en: {
    description:
      'Free online productivity tools. Create high-resolution QR codes and practice music with precision metronome. All tools 100% free, no signup required!',
    keywords:
      'QR code generator, free QR code, online metronome, free metronome, online tools, productivity tools, free tools',
  },
};

/**
 * Sort apps based on selected option
 * Uses stable sort for consistent ordering
 */
function sortApps(
  apps: readonly App[],
  sortBy: SortOption,
  language: Language
): readonly App[] {
  const sorted = [...apps];
  const locale = language === 'ko' ? 'ko' : 'en';

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) =>
        a.name[language].localeCompare(b.name[language], locale)
      );
    case 'name-desc':
      return sorted.sort((a, b) =>
        b.name[language].localeCompare(a.name[language], locale)
      );
    case 'name-long':
      return sorted.sort((a, b) => b.name[language].length - a.name[language].length);
    case 'name-short':
      return sorted.sort((a, b) => a.name[language].length - b.name[language].length);
    case 'size-large':
      return sorted.sort((a, b) => b.size - a.size);
    case 'size-small':
      return sorted.sort((a, b) => a.size - b.size);
    default:
      return apps;
  }
}

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
    canonicalPath: '/',
    isHomePage: true,
  });

  // Apps state - loaded asynchronously for code splitting
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load apps on mount
  useEffect(() => {
    loadApps().then((loadedApps) => {
      setApps(loadedApps);
      setIsLoading(false);
    });
  }, []);

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
  const appListAriaLabel = language === 'ko' ? '사용 가능한 도구' : 'Available tools';

  return (
    <div className="home-page">
      {/* Page Header with Controls */}
      <div className="home-header">
        <h1 className="home-title">
          {language === 'ko' ? '모든 도구' : 'All Tools'}
        </h1>
        <div className="home-controls">
          {/* Sort Dropdown */}
          <select
            className="sort-dropdown"
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
        <p className="no-results">
          {language === 'ko'
            ? '도구가 없습니다.'
            : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
