/**
 * Home Page Component (Astro Version)
 * No React Router dependency
 */
import { memo, useState, useMemo, useCallback, useTransition } from 'react';
import AppList from '../components/AppList';
import type { App, SortOption } from '../types';
import type { Language } from '../i18n/types';
import { commonKo, commonEn } from '../i18n/translations/common';

interface HomeProps {
  language: Language;
  apps: App[];
}

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
      return sorted.sort(
        (a, b) => b.name[language].length - a.name[language].length
      );
    case 'name-short':
      return sorted.sort(
        (a, b) => a.name[language].length - b.name[language].length
      );
    case 'size-large':
      return sorted.sort((a, b) => b.size - a.size);
    case 'size-small':
      return sorted.sort((a, b) => a.size - b.size);
    default:
      return apps;
  }
}

const Home = memo(function Home({ language, apps }: HomeProps) {
  const t = language === 'ko' ? commonKo : commonEn;
  const homeT = t.home;

  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [isPending, startTransition] = useTransition();

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

  const sortedApps = useMemo(() => {
    return sortApps(apps, sortBy, language);
  }, [apps, sortBy, language]);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      startTransition(() => {
        setSortBy(e.target.value as SortOption);
      });
    },
    []
  );

  const appListAriaLabel =
    language === 'ko' ? '사용 가능한 도구' : 'Available tools';

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">
          {language === 'ko' ? '모든 도구' : 'All Tools'}
        </h1>
        <div className="home-controls">
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

      <AppList
        apps={sortedApps}
        isPending={isPending}
        language={language}
        ariaLabel={appListAriaLabel}
      />

      {sortedApps.length === 0 && (
        <p className="no-results">
          {language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
        </p>
      )}
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
