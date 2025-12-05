import { type Component } from 'solid-js';
import { useLanguage } from '../i18n';
import { useTheme, type Theme } from '../hooks/useTheme';
import { ThemeIcon } from './ui';

interface ThemeToggleProps {
  readonly class?: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

/**
 * ThemeToggle Component
 * Toggles between light and dark theme
 */
const ThemeToggle: Component<ThemeToggleProps> = (props) => {
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const nextTheme = (): Theme => (theme() === 'light' ? 'dark' : 'light');

  const nextLabel = () =>
    nextTheme() === 'light'
      ? language() === 'ko'
        ? '라이트'
        : 'Light'
      : language() === 'ko'
        ? '다크'
        : 'Dark';

  const title = () =>
    language() === 'ko'
      ? `${nextLabel()} 모드로 전환`
      : `Switch to ${nextLabel()} mode`;

  const sizeClass = () => {
    switch (props.size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10 max-[480px]:w-9 max-[480px]:h-9';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      class={`inline-flex items-center justify-center ${sizeClass()} p-0 bg-transparent border-0 rounded-lg cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] transition-colors duration-150 ${props.class ?? ''}`}
      title={title()}
      aria-label={title()}
    >
      <ThemeIcon theme={theme()} />
    </button>
  );
};

export default ThemeToggle;

export { ThemeToggle };
