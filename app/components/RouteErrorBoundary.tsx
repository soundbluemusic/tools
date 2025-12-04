/**
 * Route Error Boundary
 * Reusable error boundary component for React Router v7 routes
 *
 * Usage in route files:
 * export { RouteErrorBoundary as ErrorBoundary } from '../components/RouteErrorBoundary';
 */
import { isRouteErrorResponse, useRouteError, Link } from 'react-router';

/**
 * Error display component
 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  let title = '오류가 발생했습니다';
  let message = '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  let statusCode: number | null = null;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;

    switch (error.status) {
      case 404:
        title = '페이지를 찾을 수 없습니다';
        message = '요청하신 페이지가 존재하지 않거나 이동되었습니다.';
        break;
      case 403:
        title = '접근 권한이 없습니다';
        message = '이 페이지에 접근할 권한이 없습니다.';
        break;
      case 500:
        title = '서버 오류';
        message = '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        break;
      default:
        message = error.statusText || error.data?.message || message;
    }
  } else if (error instanceof Error) {
    // Development only: show error details
    if (import.meta.env.DEV) {
      message = error.message;
    }
  }

  return (
    <div className="route-error-boundary">
      <div className="route-error-content">
        {statusCode && (
          <span className="route-error-code">{statusCode}</span>
        )}
        <h1 className="route-error-title">{title}</h1>
        <p className="route-error-message">{message}</p>

        {import.meta.env.DEV && error instanceof Error && error.stack && (
          <pre className="route-error-stack">
            <code>{error.stack}</code>
          </pre>
        )}

        <div className="route-error-actions">
          <button
            onClick={() => window.location.reload()}
            className="route-error-button secondary"
          >
            새로고침
          </button>
          <Link to="/" className="route-error-button primary">
            홈으로 돌아가기
          </Link>
        </div>
      </div>

      <style>{`
        .route-error-boundary {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem;
        }

        .route-error-content {
          text-align: center;
          max-width: 28rem;
        }

        .route-error-code {
          display: inline-block;
          font-size: 4rem;
          font-weight: 700;
          color: var(--color-text-tertiary);
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }

        .route-error-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 0.75rem 0;
        }

        .route-error-message {
          color: var(--color-text-secondary);
          margin: 0 0 1.5rem 0;
          line-height: 1.6;
        }

        .route-error-stack {
          text-align: left;
          font-family: var(--font-family-mono, monospace);
          font-size: 0.75rem;
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .route-error-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .route-error-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 150ms ease;
          border: none;
        }

        .route-error-button.primary {
          background-color: var(--color-text-primary);
          color: var(--color-bg-primary);
        }

        .route-error-button.primary:hover {
          opacity: 0.9;
        }

        .route-error-button.secondary {
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        .route-error-button.secondary:hover {
          background-color: var(--color-bg-secondary);
        }
      `}</style>
    </div>
  );
}

/**
 * Export for use in route files
 */
export default RouteErrorBoundary;
