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
        <Link to="/about" className="footer-link">
          {t.common.footer.about}
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
        Licensed under the MIT License
      </p>
    </footer>
  );
});

Footer.displayName = 'Footer';
