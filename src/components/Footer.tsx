import { type Component, lazy, Suspense, Show } from 'solid-js';
import { Link } from './ui';
import { useTranslations, useLanguage } from '../i18n';
import { useLocalizedPath } from '../hooks';
import { BRAND } from '../constants';

// Lazy load ShareButton to reduce initial bundle size
const ShareButton = lazy(() =>
  import('./ShareButton').then((m) => ({ default: m.ShareButton }))
);

/**
 * Footer component with menu links and copyright
 */
export const Footer: Component = () => {
  const t = useTranslations();
  const { language } = useLanguage();
  const { toLocalizedPath } = useLocalizedPath();

  const getPath = (path: string) => toLocalizedPath(path);

  return (
    <footer class="footer">
      {/* Share Button - lazy loaded (always shares homepage) */}
      <div class="flex justify-center mb-6">
        <Suspense fallback={null}>
          <ShareButton
            variant="footer"
            url={BRAND.siteUrl}
            title={BRAND.shareTitle[language()]}
            description={BRAND.description[language()]}
          />
        </Suspense>
      </div>

      {/* Footer Menu */}
      <nav
        class="flex flex-wrap justify-center gap-y-2 gap-x-6 mb-6"
        aria-label="Footer navigation"
      >
        <Link
          href={getPath('/privacy')}
          class="text-[var(--color-text-secondary)] no-underline text-sm font-medium px-2 py-1 rounded transition-[color,background-color] duration-150 ease-[var(--ease-default)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          {t().common.footer.privacy}
        </Link>
        <Link
          href={getPath('/terms')}
          class="text-[var(--color-text-secondary)] no-underline text-sm font-medium px-2 py-1 rounded transition-[color,background-color] duration-150 ease-[var(--ease-default)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          {t().common.footer.terms}
        </Link>
        <Show when={BRAND.githubUrl}>
          <a
            href={BRAND.githubUrl}
            class="text-[var(--color-text-secondary)] no-underline text-sm font-medium px-2 py-1 rounded transition-[color,background-color] duration-150 ease-[var(--ease-default)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t().common.footer.github}
          </a>
        </Show>
        <Link
          href={getPath('/sitemap')}
          class="text-[var(--color-text-secondary)] no-underline text-sm font-medium px-2 py-1 rounded transition-[color,background-color] duration-150 ease-[var(--ease-default)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          {t().common.footer.sitemap}
        </Link>
        <Link
          href={getPath('/opensource')}
          class="text-[var(--color-text-secondary)] no-underline text-sm font-medium px-2 py-1 rounded transition-[color,background-color] duration-150 ease-[var(--ease-default)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          {t().common.footer.opensource}
        </Link>
        <Link
          href={getPath('/tools-used')}
          class="text-[var(--color-text-secondary)] no-underline text-sm font-medium px-2 py-1 rounded transition-[color,background-color] duration-150 ease-[var(--ease-default)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          {t().common.footer.toolsUsed}
        </Link>
      </nav>

      {/* Copyright */}
      <p class="text-center text-[var(--color-text-tertiary)] text-xs m-0">
        © {BRAND.copyrightHolder}. MIT License
      </p>
    </footer>
  );
};
