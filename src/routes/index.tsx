import {
  createSignal,
  createMemo,
  For,
  Show,
  onMount,
  type Component,
} from 'solid-js';
import { isServer } from 'solid-js/web';
import { Title, Meta } from '@solidjs/meta';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import { AppList } from '../components/AppList';
import { preloadAllTools } from '../utils/preload';
import type { App, SortOption } from '../types';
import type { Language } from '../i18n/types';

const homeSEO = {
  ko: {
    description:
      '음악가, 작가, 디자이너, 영상 제작자 — 모든 창작자를 위한 무료 온라인 도구. 메트로놈, 드럼머신, QR 코드 생성기 등. 회원가입 없이, 광고 없이, 완전히 무료!',
    keywords:
      '무료 창작 도구, 음악가 도구, 메트로놈, 드럼머신, QR코드 생성기, 창작자 도구, free creative tools',
  },
  en: {
    description:
      'Free online tools for musicians, writers, designers, filmmakers — every creator. Metronome, drum machine, QR code generator and more. No signup, no ads, completely free!',
    keywords:
      'free creative tools, musician tools, metronome, drum machine, QR code generator, creator tools, free online tools',
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

  // Preload all tool components in background when home page loads
  onMount(() => {
    if (!isServer) {
      preloadAllTools();
    }
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
      <Title>
        Tools -{' '}
        {language() === 'ko'
          ? '모든 창작자를 위한 무료 도구'
          : 'Free Tools for Every Creator'}
      </Title>
      <Meta name="description" content={homeSEO[language()].description} />
      <Meta name="keywords" content={homeSEO[language()].keywords} />

      <div class="w-full p-6 md:p-8 lg:p-10">
        <div class="flex items-center justify-between gap-4 mb-6 md:mb-8 lg:mb-10 flex-wrap max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-4">
          <h1 class="text-2xl font-semibold text-[var(--color-text-primary)] m-0 max-[480px]:text-xl">
            {language() === 'ko' ? '창작을 시작하세요' : 'Start Creating'}
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
