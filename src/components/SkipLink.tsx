import { type Component } from 'solid-js';
import { useLanguage } from '../i18n';
import './SkipLink.css';

/**
 * Skip to main content link for keyboard users
 * Visible only when focused
 */
export const SkipLink: Component = () => {
  const { language } = useLanguage();

  const label = () =>
    language() === 'ko' ? '본문으로 건너뛰기' : 'Skip to main content';

  return (
    <a href="#main-content" class="skip-link">
      {label()}
    </a>
  );
};
