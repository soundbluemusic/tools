import { createMemo, For, Show, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { useLanguage } from '../i18n';
import { useSEO, useApps, useLocalizedPath } from '../hooks';
import { AppList } from './AppList';
import { Breadcrumb } from './Breadcrumb';
import { Link } from './ui';
import type { App } from '../types';

/**
 * Related category links for internal SEO
 */
const categoryLinks = [
  {
    path: '/music-tools',
    label: { ko: '음악 도구', en: 'Music Tools' },
    icon: '🎵',
  },
  {
    path: '/other-tools',
    label: { ko: '기타 도구', en: 'Other Tools' },
    icon: '🔧',
  },
  {
    path: '/combined-tools',
    label: { ko: '결합 도구', en: 'Combined Tools' },
    icon: '⚡',
  },
];

interface CategorySEO {
  ko: {
    title: string;
    description: string;
    keywords: string;
  };
  en: {
    title: string;
    description: string;
    keywords: string;
  };
}

interface CategoryPageProps {
  /** SEO content for the category */
  seo: CategorySEO;
  /** Canonical URL path (e.g., '/music-tools') */
  canonicalPath: string;
  /** Short description shown below title */
  subtitle: { ko: string; en: string };
  /** Function to filter apps for this category */
  filterApps: (apps: App[]) => App[];
}

/**
 * Reusable Category Page Component
 * Shared layout for music-tools, other-tools, combined-tools pages
 */
export const CategoryPage: Component<CategoryPageProps> = (props) => {
  const { language } = useLanguage();
  const { apps, isLoading } = useApps();
  const { toLocalizedPath } = useLocalizedPath();

  // Get other categories for internal linking (exclude current)
  const relatedCategories = createMemo(() =>
    categoryLinks.filter((cat) => cat.path !== props.canonicalPath)
  );

  useSEO({
    description: props.seo[language()].description,
    keywords: props.seo[language()].keywords,
    canonicalPath: props.canonicalPath,
  });

  const filteredApps = createMemo(() => props.filterApps(apps));

  const breadcrumbItems = createMemo(() => [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    {
      label: { ko: props.seo.ko.title, en: props.seo.en.title },
      href: props.canonicalPath,
    },
  ]);

  const appListAriaLabel = () => props.seo[language()].title;

  return (
    <>
      <Title>{props.seo[language()].title} - Tools</Title>
      <Meta name="description" content={props.seo[language()].description} />
      <Meta name="keywords" content={props.seo[language()].keywords} />

      <div class="w-full p-6 md:p-8 lg:p-10">
        <Breadcrumb items={breadcrumbItems()} />

        <div class="mb-6 md:mb-8 lg:mb-10">
          <h1 class="text-2xl font-semibold text-[var(--color-text-primary)] m-0 mb-2 max-[480px]:text-xl">
            {props.seo[language()].title}
          </h1>
          <p class="text-[var(--color-text-secondary)] m-0">
            {props.subtitle[language()]}
          </p>
        </div>

        <AppList
          apps={filteredApps()}
          isPending={isLoading}
          language={language()}
          ariaLabel={appListAriaLabel()}
        />

        {/* Related Categories - Internal Linking for SEO */}
        <Show when={relatedCategories().length > 0}>
          <section class="mt-12 pt-8 border-t border-[var(--color-border-secondary)]">
            <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {language() === 'ko' ? '다른 카테고리 둘러보기' : 'Explore Other Categories'}
            </h2>
            <div class="flex flex-wrap gap-3">
              <For each={relatedCategories()}>
                {(category) => (
                  <Link
                    href={toLocalizedPath(category.path)}
                    class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)] rounded-lg text-[var(--color-text-secondary)] no-underline text-sm font-medium transition-all duration-150 hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-primary)]"
                  >
                    <span>{category.icon}</span>
                    <span>{category.label[language()]}</span>
                  </Link>
                )}
              </For>
            </div>
          </section>
        </Show>
      </div>
    </>
  );
};
