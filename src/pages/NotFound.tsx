import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useViewTransition } from '../hooks/useViewTransition';

/**
 * 404 Not Found Page
 * - View Transitions API for smooth navigation back to home
 */
const NotFound = memo(function NotFound() {
  const { createClickHandler } = useViewTransition();

  // Memoized home click handler using shared View Transition hook
  const handleHomeClick = useMemo(
    () => createClickHandler('/'),
    [createClickHandler]
  );

  return (
    <main className="container tool-page" role="main">
      <div className="not-found">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">페이지를 찾을 수 없습니다</h2>
        <p className="not-found-message">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link to="/" className="not-found-link" onClick={handleHomeClick}>
          ← 홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
