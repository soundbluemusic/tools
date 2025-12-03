/**
 * PageLayout for Astro (no React Router)
 */
import { memo, type ReactNode } from 'react';
import { cn } from '../utils';
import { BreadcrumbAstro } from './BreadcrumbAstro';
import type { Language } from '../i18n/types';
import '../styles/tool-page.css';

interface BreadcrumbItem {
  label: { ko: string; en: string };
  href?: string;
}

interface PageLayoutAstroProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  language: Language;
}

export const PageLayoutAstro = memo<PageLayoutAstroProps>(
  function PageLayoutAstro({
    title,
    description,
    breadcrumb,
    children,
    className,
    actions,
    language,
  }) {
    return (
      <div className={cn('tool-page', className)}>
        {breadcrumb && breadcrumb.length > 0 && (
          <BreadcrumbAstro items={breadcrumb} language={language} />
        )}

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
  }
);

PageLayoutAstro.displayName = 'PageLayoutAstro';
