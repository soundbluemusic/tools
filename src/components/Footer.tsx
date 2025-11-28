import { memo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component with menu links and copyright
 */
export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Footer Menu */}
      <nav className="footer-menu" aria-label="Footer navigation">
        <Link to="/about" className="footer-link">
          제작배경
        </Link>
        <Link to="/terms" className="footer-link">
          이용약관
        </Link>
        <Link to="/opensource" className="footer-link">
          오픈소스목록
        </Link>
        <Link to="/tools-used" className="footer-link">
          사용된툴
        </Link>
      </nav>

      {/* Copyright */}
      <p className="footer-copyright">
        &copy; {currentYear} SoundBlueMusic. All rights reserved.
      </p>
    </footer>
  );
});

Footer.displayName = 'Footer';
