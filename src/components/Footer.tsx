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
      <div class="footer-share">
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
      <nav class="footer-menu" aria-label="Footer navigation">
        <Link href={getPath('/privacy')} class="footer-link">
          {t().common.footer.privacy}
        </Link>
        <Link href={getPath('/terms')} class="footer-link">
          {t().common.footer.terms}
        </Link>
        <Show when={BRAND.githubUrl}>
          <a
            href={BRAND.githubUrl}
            class="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t().common.footer.github}
          </a>
        </Show>
        <Link href={getPath('/sitemap')} class="footer-link">
          {t().common.footer.sitemap}
        </Link>
        <Link href={getPath('/opensource')} class="footer-link">
          {t().common.footer.opensource}
        </Link>
        <Link href={getPath('/tools-used')} class="footer-link">
          {t().common.footer.toolsUsed}
        </Link>
      </nav>

      {/* Copyright */}
      <p class="footer-copyright">© {BRAND.copyrightHolder}. MIT License</p>
    </footer>
  );
};
