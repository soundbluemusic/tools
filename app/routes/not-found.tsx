import { memo, useMemo } from 'react';
import { Link } from 'react-router';
import type { Route } from './+types/not-found';
import { useViewTransition, useLocalizedPath } from '../../src/hooks';
import { useLanguage } from '../../src/i18n';

export const meta: Route.MetaFunction = () => [
  { title: '404 - Page Not Found | Tools' },
];

const NotFound = memo(function NotFound() {
  const { createClickHandler } = useViewTransition();
  const { toLocalizedPath } = useLocalizedPath();
  const { language } = useLanguage();

  const homePath = useMemo(() => toLocalizedPath('/'), [toLocalizedPath]);
  const handleHomeClick = useMemo(() => createClickHandler(homePath), [createClickHandler, homePath]);

  return (
    <main className="container tool-page" role="main">
      <div className="not-found">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">
          {language === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page Not Found'}
        </h2>
        <p className="not-found-message">
          {language === 'ko' ? '요청하신 페이지가 존재하지 않거나 이동되었습니다.' : 'The page you requested does not exist or has been moved.'}
        </p>
        <Link to={homePath} className="not-found-link" onClick={handleHomeClick}>
          {language === 'ko' ? '← 홈으로 돌아가기' : '← Back to Home'}
        </Link>
      </div>
    </main>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
