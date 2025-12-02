import { memo, type ReactNode } from 'react';
import { cn } from '../../utils';
import { ErrorBoundary } from '../ErrorBoundary';

interface LayoutProps {
  /** Children content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Main application layout wrapper
 */
export const Layout = memo<LayoutProps>(function Layout({
  children,
  className,
}) {
  return (
    <ErrorBoundary>
      <div className={cn('layout', className)}>{children}</div>
    </ErrorBoundary>
  );
});

Layout.displayName = 'Layout';
