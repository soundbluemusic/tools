import { memo, type ReactNode } from 'react';
import { cn } from '../../utils';
import { Breadcrumb } from '../Breadcrumb';

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
    <div
      className={cn(
        'p-4 sm:p-5 md:p-6 lg:px-8 lg:py-6 transform-gpu animate-[toolPageEnter_0.15s_ease-out] motion-reduce:animate-none',
        className
      )}
    >
      {/* Breadcrumb Navigation */}
      {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}

      <header className="flex justify-between items-start gap-4 mb-6 max-md:flex-col max-md:gap-3 max-sm:gap-2 max-sm:mb-4 [contain:layout_style]">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold m-0 mb-2 text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="text-text-secondary m-0 text-sm sm:text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 max-md:w-full max-md:justify-start">
            {actions}
          </div>
        )}
      </header>

      <div className="bg-bg-secondary rounded-lg sm:rounded-xl border border-border-secondary p-4 sm:p-6 md:p-8 [contain:layout_style] transform-gpu">
        {children}
      </div>
    </div>
  );
});

PageLayout.displayName = 'PageLayout';
