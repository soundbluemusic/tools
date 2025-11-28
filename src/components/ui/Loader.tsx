import { memo } from 'react';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

interface LoaderProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
  /** Accessible label */
  label?: string;
}

/**
 * Spinner Loader Component
 */
export const Loader = memo<LoaderProps>(function Loader({
  size = 'md',
  className,
  label = 'Loading...',
}) {
  return (
    <div
      className={cn('loader-spinner', SIZE_CLASSES.loader[size], className)}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
});

Loader.displayName = 'Loader';

interface PageLoaderProps {
  /** Minimum height */
  minHeight?: string;
}

/**
 * Full page loader component
 */
export const PageLoader = memo<PageLoaderProps>(function PageLoader({
  minHeight = '200px',
}) {
  return (
    <div
      className="page-loader"
      aria-busy="true"
      style={{ minHeight }}
    >
      <Loader size="lg" label="페이지 로딩 중..." />
    </div>
  );
});

PageLoader.displayName = 'PageLoader';
