import { memo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslations, useLanguage } from '../i18n';

// Site URL for footer share button (always shares homepage)
const SITE_URL = 'https://tools.soundbluemusic.com';

// Lazy load ShareButton to reduce initial bundle size
const ShareButton = lazy(() =>
  import('./ShareButton').then((m) => ({ default: m.ShareButton }))
);

// Site share info by language
const SITE_SHARE = {
  ko: {
    title: 'Productivity Tools - 무료 온라인 도구 모음',
    description: 'QR 코드 생성기, 메트로놈, 드럼머신 등 무료 온라인 도구',
  },
  en: {
    title: 'Productivity Tools - Free Online Tools',
    description:
      'QR Code Generator, Metronome, Drum Machine and more free tools',
  },
} as const;

/**
 * Footer component with menu links and copyright
 */
export const Footer = memo(function Footer() {
  const t = useTranslations();
  const { language } = useLanguage();
  const siteShare = SITE_SHARE[language];

  return (
    <footer className="footer">
      {/* Share Button - lazy loaded (always shares homepage) */}
      <div className="footer-share">
        <Suspense fallback={null}>
          <ShareButton
            variant="footer"
            url={SITE_URL}
            title={siteShare.title}
            description={siteShare.description}
          />
        </Suspense>
      </div>

      {/* Footer Menu */}
      <nav className="footer-menu" aria-label="Footer navigation">
        <Link to="/privacy" className="footer-link">
          {t.common.footer.privacy}
        </Link>
        <Link to="/terms" className="footer-link">
          {t.common.footer.terms}
        </Link>
        <a
          href="https://github.com/soundbluemusic/tools"
          className="footer-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.common.footer.github}
        </a>
        <Link to="/sitemap" className="footer-link">
          {t.common.footer.sitemap}
        </Link>
        <Link to="/opensource" className="footer-link">
          {t.common.footer.opensource}
        </Link>
        <Link to="/tools-used" className="footer-link">
          {t.common.footer.toolsUsed}
        </Link>
      </nav>

      {/* Copyright */}
      <p className="footer-copyright">© SoundBlueMusic. MIT License</p>
    </footer>
  );
});

Footer.displayName = 'Footer';
