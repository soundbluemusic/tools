import { memo, useMemo } from 'react';
import { Link } from 'react-router';
import { useViewTransition, useLocalizedPath } from '../hooks';
import type { App } from '../types';
import type { Language } from '../i18n/types';

interface AppItemProps {
  readonly app: App;
  readonly language: Language;
}

/**
 * AppItem Component - Single app card item
 * - Shows icon, name, and description
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
        className="app-card"
        aria-label={`${name} - ${desc}`}
        role="listitem"
        onClick={handleClick}
      >
        <span className="icon">{app.icon}</span>
        <div className="app-info">
          <span className="name">{name}</span>
          <span className="desc">{desc}</span>
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
