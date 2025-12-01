import { memo, type ReactNode } from 'react';
import { cn } from '../../utils';
import { Breadcrumb } from '../Breadcrumb';
import '../../styles/tool-page.css';

interface BreadcrumbItem {
  label: { ko: string; en: string };
  href?: string;
}

interface PageLayoutProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Breadcrumb items */
  breadcrumb?: BreadcrumbItem[];
  /** Children content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
  /** Header actions */
  actions?: ReactNode;
}

/**
 * Reusable page layout component for tool pages
 * - Includes breadcrumb navigation for better UX
 * - GPU accelerated animations via CSS
 */
export const PageLayout = memo<PageLayoutProps>(function PageLayout({
  title,
  description,
  breadcrumb,
  children,
  className,
  actions,
}) {
  return (
    <div className={cn('tool-page', className)}>
      {/* Breadcrumb Navigation */}
      {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}

      <header className="tool-header">
        <div className="tool-header-content">
          <h1 className="tool-title">{title}</h1>
          {description && <p className="tool-desc">{description}</p>}
        </div>
        {actions && <div className="tool-actions">{actions}</div>}
      </header>

      <div className="tool-content">{children}</div>
    </div>
  );
});

PageLayout.displayName = 'PageLayout';
