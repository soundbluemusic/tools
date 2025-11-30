import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useViewTransition } from '../hooks/useViewTransition';
import { useLanguage } from '../i18n';

/**
 * 404 Not Found Page
 * - View Transitions API for smooth navigation back to home
 */
const NotFound = memo(function NotFound() {
  const { createClickHandler } = useViewTransition();
  const { t } = useLanguage();

  // Memoized home click handler using shared View Transition hook
  const handleHomeClick = useMemo(
    () => createClickHandler('/'),
    [createClickHandler]
  );

  return (
    <main className="container tool-page" role="main">
      <div className="not-found">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">{t.common.notFound.title}</h2>
        <p className="not-found-message">{t.common.notFound.message}</p>
        <Link to="/" className="not-found-link" onClick={handleHomeClick}>
          {t.common.notFound.backToHome}
        </Link>
      </div>
    </main>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
