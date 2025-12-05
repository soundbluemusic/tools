import { createSignal, createMemo, For, Show, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import { AppList } from '../components/AppList';
import type { App, SortOption } from '../types';
import type { Language } from '../i18n/types';

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
 * Sort apps based on selected option
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

/**
 * Home Page Component
 */
const Home: Component = () => {
  const { language, t } = useLanguage();

  useSEO({
    description: homeSEO[language()].description,
    keywords: homeSEO[language()].keywords,
    canonicalPath: '/',
    isHomePage: true,
  });

  const { apps, isLoading } = useApps();
  const [sortBy, setSortBy] = createSignal<SortOption>('name-asc');

  const homeT = () => t().common.home;

  const sortOptions = createMemo(() => [
    { value: 'name-asc' as const, label: homeT().sort.nameAsc },
    { value: 'name-desc' as const, label: homeT().sort.nameDesc },
    { value: 'name-long' as const, label: homeT().sort.nameLong },
    { value: 'name-short' as const, label: homeT().sort.nameShort },
    { value: 'size-large' as const, label: homeT().sort.sizeLarge },
    { value: 'size-small' as const, label: homeT().sort.sizeSmall },
  ]);

  const sortedApps = createMemo(() => {
    return sortApps(apps, sortBy(), language());
  });

  const handleSortChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setSortBy(target.value as SortOption);
  };

  const appListAriaLabel = () =>
    language() === 'ko' ? '사용 가능한 도구' : 'Available tools';

  return (
    <>
      <Title>Tools - Open Source Productivity Tools</Title>
      <Meta name="description" content={homeSEO[language()].description} />
      <Meta name="keywords" content={homeSEO[language()].keywords} />

      <div class="w-full p-4 md:p-6 lg:p-8">
        <div class="flex items-center justify-between gap-4 mb-4 md:mb-6 lg:mb-8 flex-wrap max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3">
          <h1 class="text-2xl font-semibold text-[var(--color-text-primary)] m-0 max-[480px]:text-xl">
            {language() === 'ko' ? '모든 도구' : 'All Tools'}
          </h1>
          <div class="flex items-center gap-3">
            <select
              class="px-4 py-3 text-sm font-inherit border border-[var(--color-border-secondary)] rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] cursor-pointer outline-none transition-[border-color,box-shadow] duration-150 ease-[var(--ease-default)] min-w-[150px] hover:border-[var(--color-border-primary)] focus:border-[var(--color-border-focus)] focus:shadow-[var(--shadow-focus)]"
              value={sortBy()}
              onChange={handleSortChange}
              aria-label={homeT().sortAriaLabel}
            >
              <For each={sortOptions()}>
                {(option) => (
                  <option value={option.value}>{option.label}</option>
                )}
              </For>
            </select>
          </div>
        </div>

        <AppList
          apps={sortedApps()}
          isPending={isLoading}
          language={language()}
          ariaLabel={appListAriaLabel()}
        />

        <Show when={sortedApps().length === 0 && !isLoading}>
          <p class="text-center text-[var(--color-text-secondary)] py-8 text-sm">
            {language() === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
          </p>
        </Show>
      </div>
    </>
  );
};

export default Home;
