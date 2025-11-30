import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslations } from '../i18n';

/**
 * Footer component with menu links and copyright
 */
export const Footer = memo(function Footer() {
  const t = useTranslations();

  return (
    <footer className="footer">
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
      <p className="footer-copyright">
        © SoundBlueMusic. MIT License
      </p>
    </footer>
  );
});

Footer.displayName = 'Footer';
