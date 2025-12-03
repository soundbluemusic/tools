import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useViewTransition, useLocalizedPath } from '../hooks';
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
        className="app-item"
        aria-label={`${name} - ${desc}`}
        role="listitem"
        onClick={handleClick}
      >
        <span className="app-item-text">{name}</span>
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
