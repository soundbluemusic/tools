import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useViewTransition } from '../hooks/useViewTransition';
import type { App } from '../types';
import type { Language } from '../i18n/types';

interface AppItemProps {
  readonly app: App;
  readonly language: Language;
}

/**
 * AppItem Component - Single app list item
 * - GPU accelerated hover via CSS
 * - View Transitions API support for smooth navigation
 */
const AppItem = memo<AppItemProps>(
  function AppItem({ app, language }) {
    const { createClickHandler } = useViewTransition();

    // Get localized name and description
    const name = app.name[language];
    const desc = app.desc[language];

    // Memoized click handler using shared View Transition hook
    const handleClick = useMemo(
      () => createClickHandler(app.url),
      [createClickHandler, app.url]
    );

    return (
      <Link
        to={app.url}
        className="block p-5 no-underline text-text-primary bg-bg-secondary border border-border-secondary rounded-lg hover:bg-bg-tertiary hover:border-border-primary active:bg-interactive-active transition-colors duration-fast"
        aria-label={`${name} - ${desc}`}
        role="listitem"
        onClick={handleClick}
      >
        <span className="text-base font-normal leading-base">{name}</span>
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
