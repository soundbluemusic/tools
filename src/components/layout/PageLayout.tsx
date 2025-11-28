import { memo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils';

interface PageLayoutProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Show back link */
  showBackLink?: boolean;
  /** Back link URL */
  backUrl?: string;
  /** Back link text */
  backText?: string;
  /** Children content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
  /** Header actions */
  actions?: ReactNode;
}

/**
 * Reusable page layout component for tool pages
 */
export const PageLayout = memo<PageLayoutProps>(function PageLayout({
  title,
  description,
  showBackLink = true,
  backUrl = '/',
  backText = '돌아가기',
  children,
  className,
  actions,
}) {
  return (
    <main className={cn('container', 'tool-page', className)} role="main">
      {showBackLink && (
        <Link to={backUrl} className="back-link">
          &larr; {backText}
        </Link>
      )}

      <header className="tool-header">
        <div className="tool-header-content">
          <h1 className="tool-title">{title}</h1>
          {description && (
            <p className="tool-desc">{description}</p>
          )}
        </div>
        {actions && (
          <div className="tool-actions">{actions}</div>
        )}
      </header>

      <div className="tool-content">
        {children}
      </div>
    </main>
  );
});

PageLayout.displayName = 'PageLayout';
