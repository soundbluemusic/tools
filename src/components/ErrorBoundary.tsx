import { Component, type ReactNode, type ErrorInfo } from 'react';
import { useLanguage } from '../i18n';

interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error | null;
  /** Handler to reset the error boundary */
  onReset: () => void;
}

/**
 * Default Error Fallback Component
 * Uses i18n for internationalized error messages
 */
function DefaultErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const { t } = useLanguage();

  return (
    <div className="error-boundary" role="alert">
      <div className="error-boundary-content">
        <h2 className="error-boundary-title">{t.common.errorBoundary.title}</h2>
        <p className="error-boundary-message">{t.common.errorBoundary.message}</p>
        {import.meta.env.DEV && error && (
          <pre className="error-boundary-details">{error.message}</pre>
        )}
        <button
          className="error-boundary-button"
          onClick={onReset}
          type="button"
        >
          {t.common.errorBoundary.retry}
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  /** Children to render */
  children: ReactNode;
  /** Custom fallback UI */
  fallback?: ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Reset error boundary when this key changes */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static displayName = 'ErrorBoundary';

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when resetKey changes
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with i18n support
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundary;
}
