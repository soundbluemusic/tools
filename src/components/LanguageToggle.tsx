import { memo } from 'react';
import { useLanguage } from '../i18n';
import './LanguageToggle.css';

/**
 * Floating language toggle button
 * Displayed on all pages at the bottom-right corner
 */
export const LanguageToggle = memo(function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();
  const toggleLabel =
    language === 'ko'
      ? t.common.languageToggle.switchToEnglish
      : t.common.languageToggle.switchToKorean;

  return (
    <button
      onClick={toggleLanguage}
      className="language-toggle"
      title={toggleLabel}
      aria-label={toggleLabel}
    >
      <svg
        className="language-toggle-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="20"
        height="20"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path
          strokeWidth="2"
          d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        />
      </svg>
      <span className="language-toggle-text">{language === 'ko' ? 'EN' : 'KO'}</span>
    </button>
  );
});

LanguageToggle.displayName = 'LanguageToggle';
