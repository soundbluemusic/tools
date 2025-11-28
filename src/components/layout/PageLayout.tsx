import { memo, useCallback, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
 * - Optimized with View Transitions API for smooth navigation
 * - GPU accelerated animations via CSS
 */
export const PageLayout = memo<PageLayoutProps>(function PageLayout({
  title,
  description,
  showBackLink = true,
  backUrl = '/',
  backText = '← 돌아가기',
  children,
  className,
  actions,
}) {
  const navigate = useNavigate();

  // Handle back navigation with View Transitions API
  const handleBackClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (document.startViewTransition) {
        e.preventDefault();
        document.startViewTransition(() => {
          navigate(backUrl);
        });
      }
    },
    [navigate, backUrl]
  );

  return (
    <main className={cn('container', 'tool-page', className)} role="main">
      {showBackLink && (
        <Link to={backUrl} className="back-link" onClick={handleBackClick}>
          {backText}
        </Link>
      )}

      <header className="tool-header">
        <div className="tool-header-content">
          <h1 className="tool-title">{title}</h1>
          {description && <p className="tool-desc">{description}</p>}
        </div>
        {actions && <div className="tool-actions">{actions}</div>}
      </header>

      <div className="tool-content">{children}</div>
    </main>
  );
});

PageLayout.displayName = 'PageLayout';
