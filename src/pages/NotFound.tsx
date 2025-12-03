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
    <main
      className="max-w-container-md mx-auto animate-[fadeIn_0.2s_ease-out]"
      role="main"
    >
      <div className="text-center py-16 px-4 sm:py-8 sm:px-3">
        <h1 className="text-[6rem] sm:text-[4rem] font-bold text-text-tertiary leading-none mb-4">
          404
        </h1>
        <h2 className="text-2xl sm:text-xl font-semibold mb-3 text-text-primary">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-text-secondary mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-md font-medium transition-colors duration-fast hover:bg-accent-hover"
          onClick={handleHomeClick}
        >
          ← 홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
