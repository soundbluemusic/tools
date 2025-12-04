import { memo, useMemo } from 'react';
import { Link } from 'react-router';
import { useViewTransition, useLocalizedPath } from '../hooks';
import type { App } from '../types';
import type { Language } from '../i18n/types';
import { cn } from '../utils';

interface AppItemProps {
  readonly app: App;
  readonly language: Language;
}

/**
 * AppItem Component - Responsive Card Design
 *
 * Card Features:
 * - Responsive padding: 16px mobile, 24px desktop
 * - Equal height cards within grid row
 * - Hover: scale up slightly + shadow
 * - Icon, title, description layout
 *
 * Typography:
 * - Title: 18px mobile, 20px desktop
 * - Description: 14px mobile, 16px desktop
 */
const AppItem = memo<AppItemProps>(
  function AppItem({ app, language }) {
    const { createClickHandler } = useViewTransition();
    const { toLocalizedPath } = useLocalizedPath();

    // Get localized name and description
    const name = app.name[language];
    const desc = app.desc[language];

    // Get localized URL
    const localizedUrl = useMemo(
      () => toLocalizedPath(app.url),
      [toLocalizedPath, app.url]
    );

    // Memoized click handler using shared View Transition hook
    const handleClick = useMemo(
      () => createClickHandler(localizedUrl),
      [createClickHandler, localizedUrl]
    );

    return (
      <Link
        to={localizedUrl}
        className={cn(
          // Base card styles
          'group flex flex-col h-full',
          // Background & border
          'bg-[var(--color-bg-secondary)]',
          'border border-[var(--color-border-secondary)]',
          'rounded-xl',
          // Padding: 16px mobile, 24px desktop
          'p-4 xl:p-6',
          // Text decoration
          'no-underline',
          // Hover effects (desktop only)
          'transition-all duration-200 ease-out',
          'hover:border-[var(--color-border-primary)]',
          'hover:shadow-lg hover:shadow-black/5',
          'hover:-translate-y-1',
          // Active state
          'active:translate-y-0 active:shadow-md',
          // Focus state for accessibility
          'focus-visible:outline-2 focus-visible:outline-offset-2',
          'focus-visible:outline-[var(--color-border-focus)]'
        )}
        aria-label={`${name} - ${desc}`}
        role="listitem"
        onClick={handleClick}
      >
        {/* Icon - Large emoji display */}
        <div
          className={cn(
            'flex items-center justify-center',
            'w-14 h-14 xl:w-16 xl:h-16',
            'mb-4',
            'text-4xl xl:text-5xl',
            'bg-[var(--color-bg-tertiary)]',
            'rounded-xl',
            'transition-transform duration-200',
            'group-hover:scale-110'
          )}
        >
          {app.icon}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1">
          {/* Title */}
          <h3
            className={cn(
              'text-lg xl:text-xl',
              'font-semibold',
              'text-[var(--color-text-primary)]',
              'mb-2',
              'line-clamp-2'
            )}
          >
            {name}
          </h3>

          {/* Description */}
          <p
            className={cn(
              'text-sm xl:text-base',
              'text-[var(--color-text-secondary)]',
              'line-clamp-2',
              'leading-relaxed'
            )}
          >
            {desc}
          </p>
        </div>

        {/* Hover indicator arrow */}
        <div
          className={cn(
            'mt-4 pt-4',
            'border-t border-[var(--color-border-secondary)]',
            'flex items-center justify-between',
            'text-sm text-[var(--color-text-tertiary)]',
            'transition-colors duration-200',
            'group-hover:text-[var(--color-text-primary)]'
          )}
        >
          <span>{language === 'ko' ? '열기' : 'Open'}</span>
          <span
            className={cn(
              'transition-transform duration-200',
              'group-hover:translate-x-1'
            )}
          >
            →
          </span>
        </div>
      </Link>
    );
  },
  // Re-render if app.id or language changes
  (prevProps, nextProps) =>
    prevProps.app.id === nextProps.app.id &&
    prevProps.language === nextProps.language
);

AppItem.displayName = 'AppItem';

export default AppItem;
