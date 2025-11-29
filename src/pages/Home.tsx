import {
  memo,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  useTransition,
} from 'react';
import { Link } from 'react-router-dom';
import { APPS } from '../constants/apps';
import { useLanguage } from '../i18n';
import AppList from '../components/AppList';
import type { App, SortOption } from '../types';
import type { Language } from '../i18n/types';

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

  // Search state with deferred value for smooth typing
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

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

  // Filter and sort apps - only recompute when inputs change
  const filteredApps = useMemo(() => {
    let apps = APPS;

    // Apply search filter (search in both languages for better UX)
    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase().trim();
      apps = APPS.filter(
        (app) =>
          app.name.ko.toLowerCase().includes(query) ||
          app.name.en.toLowerCase().includes(query) ||
          app.desc.ko.toLowerCase().includes(query) ||
          app.desc.en.toLowerCase().includes(query)
      );
    }

    // Apply sorting with current language
    return sortApps(apps, sortBy, language);
  }, [deferredSearchQuery, sortBy, language]);

  // Optimized search handler - immediate state update
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Sort change with transition for smooth UI
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      startTransition(() => {
        setSortBy(e.target.value as SortOption);
      });
    },
    []
  );

  // Check if search is pending
  const isSearchPending = searchQuery !== deferredSearchQuery;

  // Aria label for app list
  const appListAriaLabel = language === 'ko' ? '사용 가능한 도구' : 'Available tools';

  return (
    <main className="container home-page" role="main">
      {/* Header */}
      <header className="header">
        <Link to="/" className="title-link">
          <h1 className="title">tools <span className="beta-badge">beta</span></h1>
        </Link>

        {/* Search and Sort Controls */}
        <div className="controls">
          {/* Search Input */}
          <div className="search-container">
            <input
              type="search"
              className="search-input"
              placeholder={homeT.searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label={homeT.searchAriaLabel}
              autoComplete="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={handleClearSearch}
                aria-label={homeT.clearSearchAriaLabel}
                type="button"
              >
                ×
              </button>
            )}
          </div>

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
      </header>

      {/* App List - Direct render without Suspense */}
      <AppList
        apps={filteredApps}
        isPending={isSearchPending || isPending}
        language={language}
        ariaLabel={appListAriaLabel}
      />

      {/* No Results Message */}
      {filteredApps.length === 0 && searchQuery && (
        <p className="no-results">
          {language === 'ko'
            ? `"${searchQuery}"${homeT.noResults}`
            : `${homeT.noResults} "${searchQuery}"`}
        </p>
      )}
    </main>
  );
});

Home.displayName = 'Home';

export default Home;
