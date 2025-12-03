import { memo } from 'react';
import { useLanguage } from '../i18n';
import './SkipLink.css';

/**
 * Skip to main content link for keyboard users
 * Visible only when focused
 */
export const SkipLink = memo(function SkipLink() {
  const { language } = useLanguage();

  const label =
    language === 'ko' ? '본문으로 건너뛰기' : 'Skip to main content';

  return (
    <a href="#main-content" className="skip-link">
      {label}
    </a>
  );
});

SkipLink.displayName = 'SkipLink';
