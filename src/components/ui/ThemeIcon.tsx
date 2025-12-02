import { memo } from 'react';
import type { Theme } from '../../hooks/useTheme';

interface ThemeIconProps {
  /** Current theme setting */
  theme: Theme;
  /** CSS class name for the icon */
  className?: string;
  /** Icon size (default: 18) */
  size?: number;
}

/**
 * Theme icon component - shows sun or moon based on theme
 */
export const ThemeIcon = memo<ThemeIconProps>(function ThemeIcon({
  theme,
  className = 'theme-icon',
  size = 18,
}) {
  if (theme === 'dark') {
    // Moon icon
    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width={size}
        height={size}
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
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width={size}
      height={size}
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
