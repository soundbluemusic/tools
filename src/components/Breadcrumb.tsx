import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import './Breadcrumb.css';

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
  const { language } = useLanguage();

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const label = item.label[language];

          return (
            <li key={index} className="breadcrumb-item">
              {!isLast && item.href ? (
                <>
                  <Link to={item.href} className="breadcrumb-link">
                    {index === 0 && (
                      <svg
                        className="breadcrumb-home-icon"
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
                    className="breadcrumb-separator"
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
                <span className="breadcrumb-current" aria-current="page">
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
