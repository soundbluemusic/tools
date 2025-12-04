import {
  type ParentComponent,
  type JSX,
  ErrorBoundary as SolidErrorBoundary,
} from 'solid-js';
import { useLanguage } from '../i18n/context';

interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error;
  /** Handler to reset the error boundary */
  reset: () => void;
}

/**
 * Default Error Fallback Component
 * Uses i18n for internationalized error messages
 */
function DefaultErrorFallback(props: ErrorFallbackProps) {
  const { t } = useLanguage();

  return (
    <div class="error-boundary" role="alert">
      <div class="error-boundary-content">
        <h2 class="error-boundary-title">{t().common.errorBoundary.title}</h2>
        <p class="error-boundary-message">{t().common.errorBoundary.message}</p>
        {import.meta.env.DEV && props.error && (
          <pre class="error-boundary-details">{props.error.message}</pre>
        )}
        <button
          class="error-boundary-button"
          onClick={props.reset}
          type="button"
        >
          {t().common.errorBoundary.retry}
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  /** Custom fallback UI */
  fallback?: JSX.Element | ((err: Error, reset: () => void) => JSX.Element);
  /** Callback when error is caught */
  onError?: (error: Error) => void;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree
 */
export const ErrorBoundary: ParentComponent<ErrorBoundaryProps> = (props) => {
  return (
    <SolidErrorBoundary
      fallback={(err, reset) => {
        // Call onError callback if provided
        if (props.onError) {
          props.onError(err);
        }

        // Log error to console in development
        if (import.meta.env.DEV) {
          console.error('ErrorBoundary caught an error:', err);
        }

        // Render custom fallback if provided
        if (props.fallback) {
          if (typeof props.fallback === 'function') {
            return props.fallback(err, reset);
          }
          return props.fallback;
        }

        // Default error UI with i18n support
        return <DefaultErrorFallback error={err} reset={reset} />;
      }}
    >
      {props.children}
    </SolidErrorBoundary>
  );
};

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: (props: P) => JSX.Element,
  fallback?: JSX.Element
): (props: P) => JSX.Element {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
}
