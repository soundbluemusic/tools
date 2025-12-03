/**
 * Breadcrumb for Astro (no React Router)
 */
import { memo } from 'react';
import type { Language } from '../i18n/types';
import '../components/Breadcrumb.css';

interface BreadcrumbItem {
  label: { ko: string; en: string };
  href?: string;
}

interface BreadcrumbAstroProps {
  items: BreadcrumbItem[];
  language: Language;
}

export const BreadcrumbAstro = memo<BreadcrumbAstroProps>(
  function BreadcrumbAstro({ items, language }) {
    const getPath = (path: string) => {
      if (language === 'ko') {
        return path === '/' ? '/ko' : `/ko${path}`;
      }
      return path;
    };

    return (
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol
          className="breadcrumb-list"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, index) => (
            <li
              key={index}
              className="breadcrumb-item"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.href ? (
                <a
                  href={getPath(item.href)}
                  className="breadcrumb-link"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label[language]}</span>
                </a>
              ) : (
                <span
                  className="breadcrumb-current"
                  itemProp="name"
                  aria-current="page"
                >
                  {item.label[language]}
                </span>
              )}
              <meta itemProp="position" content={String(index + 1)} />
              {index < items.length - 1 && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
);

BreadcrumbAstro.displayName = 'BreadcrumbAstro';
