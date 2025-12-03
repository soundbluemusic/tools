import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useViewTransition, useLocalizedPath } from '../hooks';
import { useLanguage } from '../i18n';
import '../styles/not-found.css';
import '../styles/tool-page.css';

/**
 * 404 Not Found Page
 * - View Transitions API for smooth navigation back to home
 */
const NotFound = memo(function NotFound() {
  const { createClickHandler } = useViewTransition();
  const { toLocalizedPath } = useLocalizedPath();
  const { language } = useLanguage();

  // Get localized home path
  const homePath = useMemo(() => toLocalizedPath('/'), [toLocalizedPath]);

  // Memoized home click handler using shared View Transition hook
  const handleHomeClick = useMemo(
    () => createClickHandler(homePath),
    [createClickHandler, homePath]
  );

  return (
    <main className="container tool-page" role="main">
      <div className="not-found">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">
          {language === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page Not Found'}
        </h2>
        <p className="not-found-message">
          {language === 'ko'
            ? '요청하신 페이지가 존재하지 않거나 이동되었습니다.'
            : 'The page you requested does not exist or has been moved.'}
        </p>
        <Link
          to={homePath}
          className="not-found-link"
          onClick={handleHomeClick}
        >
          {language === 'ko' ? '← 홈으로 돌아가기' : '← Back to Home'}
        </Link>
      </div>
    </main>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
