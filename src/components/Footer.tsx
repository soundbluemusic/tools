import { memo, lazy, Suspense, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
export const Footer = memo(function Footer() {
  const t = useTranslations();
  const { language } = useLanguage();
  const { toLocalizedPath } = useLocalizedPath();

  // Memoize localized path function
  const getPath = useCallback(
    (path: string) => toLocalizedPath(path),
    [toLocalizedPath]
  );

  return (
    <footer className="footer">
      {/* Share Button - lazy loaded (always shares homepage) */}
      <div className="footer-share">
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
      <nav className="footer-menu" aria-label="Footer navigation">
        <Link to={getPath('/privacy')} className="footer-link">
          {t.common.footer.privacy}
        </Link>
        <Link to={getPath('/terms')} className="footer-link">
          {t.common.footer.terms}
        </Link>
        {BRAND.githubUrl && (
          <a
            href={BRAND.githubUrl}
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.common.footer.github}
          </a>
        )}
        <Link to={getPath('/sitemap')} className="footer-link">
          {t.common.footer.sitemap}
        </Link>
        <Link to={getPath('/opensource')} className="footer-link">
          {t.common.footer.opensource}
        </Link>
        <Link to={getPath('/tools-used')} className="footer-link">
          {t.common.footer.toolsUsed}
        </Link>
      </nav>

      {/* Copyright */}
      <p className="footer-copyright">© {BRAND.copyrightHolder}. MIT License</p>
    </footer>
  );
});

Footer.displayName = 'Footer';
