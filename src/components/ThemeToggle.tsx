import { memo } from 'react';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../hooks/useTheme';
import { useLanguage } from '../i18n';
import './ThemeToggle.css';

/** Icon for each theme mode */
const ThemeIcon = memo(function ThemeIcon({
  theme,
  resolved,
}: {
  theme: Theme;
  resolved: 'light' | 'dark';
}) {
  if (theme === 'system') {
    // Monitor icon for system mode
    return (
      <svg
        className="theme-toggle-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="18"
        height="18"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
        <path strokeWidth="2" d="M8 21h8M12 17v4" />
      </svg>
    );
  }

  // Use resolved theme for sun/moon
  if (resolved === 'dark') {
    // Moon icon
    return (
      <svg
        className="theme-toggle-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="18"
        height="18"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        />
      </svg>
    );
  }

  // Sun icon
  return (
    <svg
      className="theme-toggle-icon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="18"
      height="18"
    >
      <circle cx="12" cy="12" r="5" strokeWidth="2" />
      <path
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </svg>
  );
});

ThemeIcon.displayName = 'ThemeIcon';

/** Labels for each theme in both languages */
const themeLabels: Record<Theme, { ko: string; en: string }> = {
  system: { ko: '시스템', en: 'System' },
  light: { ko: '라이트', en: 'Light' },
  dark: { ko: '다크', en: 'Dark' },
};

/**
 * Floating theme toggle button
 * Cycles through: System -> Light -> Dark
 */
export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, resolvedTheme, cycleTheme } = useTheme();
  const { language } = useLanguage();

  const currentLabel = themeLabels[theme][language];
  const nextTheme: Theme =
    theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
  const nextLabel = themeLabels[nextTheme][language];

  const title =
    language === 'ko'
      ? `${nextLabel} 모드로 전환`
      : `Switch to ${nextLabel} mode`;

  return (
    <button
      onClick={cycleTheme}
      className="theme-toggle"
      title={title}
      aria-label={title}
    >
      <ThemeIcon theme={theme} resolved={resolvedTheme} />
      <span className="theme-toggle-text">{currentLabel}</span>
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
