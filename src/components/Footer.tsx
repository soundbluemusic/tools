import { type Component, lazy, Suspense, Show } from 'solid-js';
import { A } from '@solidjs/router';
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
        <A href={getPath('/privacy')} class="footer-link">
          {t().common.footer.privacy}
        </A>
        <A href={getPath('/terms')} class="footer-link">
          {t().common.footer.terms}
        </A>
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
        <A href={getPath('/sitemap')} class="footer-link">
          {t().common.footer.sitemap}
        </A>
        <A href={getPath('/opensource')} class="footer-link">
          {t().common.footer.opensource}
        </A>
        <A href={getPath('/tools-used')} class="footer-link">
          {t().common.footer.toolsUsed}
        </A>
      </nav>

      {/* Copyright */}
      <p class="footer-copyright">© {BRAND.copyrightHolder}. MIT License</p>
    </footer>
  );
};
