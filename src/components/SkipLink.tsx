import { memo } from 'react';
import { useLanguage } from '../i18n';

/**
 * Skip to main content link for keyboard users
 * Visible only when focused
 */
export const SkipLink = memo(function SkipLink() {
  const { language } = useLanguage();

  const label =
    language === 'ko' ? '본문으로 건너뛰기' : 'Skip to main content';

  return (
    <a
      href="#main-content"
      className="fixed left-1/2 top-4 z-[9999] -translate-x-1/2 -translate-y-[200%] rounded-md bg-accent-primary px-6 py-4 font-semibold text-text-inverse opacity-0 transition-[transform,opacity] duration-200 ease-out will-change-[transform,opacity] focus:translate-y-0 focus:opacity-100 focus:outline-2 focus:outline-offset-2 focus:outline-border-focus"
    >
      {label}
    </a>
  );
});

SkipLink.displayName = 'SkipLink';
