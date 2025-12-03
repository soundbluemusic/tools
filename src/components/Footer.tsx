import { memo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslations, useLanguage } from '../i18n';
import { BRAND } from '../constants';

// Lazy load ShareButton to reduce initial bundle size
const ShareButton = lazy(() =>
  import('./ShareButton').then((m) => ({ default: m.ShareButton }))
);

/**
 * Footer component with menu links and copyright
 */
export const Footer = memo(function Footer() {
  const t = useTranslations();
  const { language, localizedPath } = useLanguage();

  return (
    <footer className="mt-auto py-6 px-0 sm:py-8 sm:px-6 text-center border-t border-border-primary bg-bg-primary">
      {/* Share Button - lazy loaded (always shares homepage) */}
      <div className="mb-4 sm:mb-6">
        <Suspense fallback={null}>
          <ShareButton
            variant="footer"
            url={BRAND.siteUrl}
            title={BRAND.shareTitle[language]}
            description={BRAND.description[language]}
          />
        </Suspense>
      </div>

      {/* Footer Menu */}
      <nav
        className="flex justify-center flex-wrap gap-4 sm:gap-6 mb-4"
        aria-label="Footer navigation"
      >
        <Link
          to={localizedPath('/privacy')}
          className="text-text-primary text-xs sm:text-sm opacity-70 hover:opacity-100 transition-opacity duration-fast"
        >
          {t.common.footer.privacy}
        </Link>
        <Link
          to={localizedPath('/terms')}
          className="text-text-primary text-xs sm:text-sm opacity-70 hover:opacity-100 transition-opacity duration-fast"
        >
          {t.common.footer.terms}
        </Link>
        {BRAND.githubUrl && (
          <a
            href={BRAND.githubUrl}
            className="text-text-primary text-xs sm:text-sm opacity-70 hover:opacity-100 transition-opacity duration-fast"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.common.footer.github}
          </a>
        )}
        <Link
          to={localizedPath('/sitemap')}
          className="text-text-primary text-xs sm:text-sm opacity-70 hover:opacity-100 transition-opacity duration-fast"
        >
          {t.common.footer.sitemap}
        </Link>
        <Link
          to={localizedPath('/opensource')}
          className="text-text-primary text-xs sm:text-sm opacity-70 hover:opacity-100 transition-opacity duration-fast"
        >
          {t.common.footer.opensource}
        </Link>
        <Link
          to={localizedPath('/tools-used')}
          className="text-text-primary text-xs sm:text-sm opacity-70 hover:opacity-100 transition-opacity duration-fast"
        >
          {t.common.footer.toolsUsed}
        </Link>
      </nav>

      {/* Copyright */}
      <p className="m-0 text-xs text-text-primary opacity-50">
        © {BRAND.copyrightHolder}. MIT License
      </p>
    </footer>
  );
});

Footer.displayName = 'Footer';
