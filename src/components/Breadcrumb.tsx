import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';

interface BreadcrumbItem {
  label: { ko: string; en: string };
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb Navigation Component
 * Shows hierarchical navigation path (e.g., Home > Music Tools > Metronome)
 */
export const Breadcrumb = memo(function Breadcrumb({ items }: BreadcrumbProps) {
  const { language, localizedPath } = useLanguage();

  return (
    <nav className="mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-0 m-0 p-0 list-none text-xs sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const label = item.label[language];

          return (
            <li key={index} className="flex items-center">
              {!isLast && item.href ? (
                <>
                  <Link
                    to={localizedPath(item.href)}
                    className="inline-flex items-center gap-1 text-text-secondary no-underline py-1 transition-colors duration-fast hover:text-text-primary"
                  >
                    {index === 0 && (
                      <svg
                        className="shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                      >
                        <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
                      </svg>
                    )}
                    <span>{label}</span>
                  </Link>
                  <svg
                    className="mx-1 sm:mx-1.5 text-text-tertiary shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              ) : (
                <span
                  className="text-text-primary font-medium"
                  aria-current="page"
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';
