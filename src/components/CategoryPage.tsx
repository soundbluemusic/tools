import { createMemo, type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { useLanguage } from '../i18n';
import { useSEO, useApps } from '../hooks';
import { AppList } from './AppList';
import { Breadcrumb } from './Breadcrumb';
import type { App } from '../types';

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
      </div>
    </>
  );
};
