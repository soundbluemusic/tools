import { type Component } from 'solid-js';
import { useLanguage } from '../i18n';

interface LanguageToggleProps {
  readonly class?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly showIcon?: boolean;
}

/**
 * LanguageToggle Component
 * Toggles between Korean and English
 */
const LanguageToggle: Component<LanguageToggleProps> = (props) => {
  const { language, toggleLanguage } = useLanguage();

  const showIcon = () => props.showIcon ?? true;

  const title = () =>
    language() === 'ko' ? 'Switch to English' : '한국어로 전환';

  const sizeClass = () => {
    switch (props.size) {
      case 'sm':
        return 'h-8 px-2';
      case 'lg':
        return 'h-12 px-4';
      default:
        return 'h-10 max-[480px]:h-9 px-3 max-[480px]:px-2';
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      class={`inline-flex items-center justify-center gap-1 w-auto ${sizeClass()} p-0 bg-transparent border-0 rounded-lg cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] transition-colors duration-150 ${props.class ?? ''}`}
      title={title()}
      aria-label={title()}
    >
      {showIcon() && (
        <svg
          class="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="18"
          height="18"
        >
          <circle cx="12" cy="12" r="10" stroke-width="2" />
          <path
            stroke-width="2"
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          />
        </svg>
      )}
      <span class="text-[0.8rem] font-semibold tracking-[0.02em]">
        {language() === 'ko' ? 'KO' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;

export { LanguageToggle };
