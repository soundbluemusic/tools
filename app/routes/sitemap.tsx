import { memo, useCallback } from 'react';
import { Link } from 'react-router';
import type { Route } from './+types/sitemap';
import { PageLayout } from '../../src/components/layout';
import { useLanguage } from '../../src/i18n/context';
import { useSEO, useLocalizedPath } from '../../src/hooks';
import { APPS, BRAND } from '../../src/constants';

// Route-level Error Boundary
export { RouteErrorBoundary as ErrorBoundary } from '../components/RouteErrorBoundary';

interface SitemapItem {
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  url: string;
  isExternal?: boolean;
}

interface SitemapSection {
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  items: SitemapItem[];
}

export const meta: Route.MetaFunction = () => [
  { title: 'Sitemap - Tools' },
  { name: 'description', content: 'Tools 사이트맵 - 모든 도구와 페이지 목록' },
];

function buildSitemapSections(): SitemapSection[] {
  const mainSection: SitemapSection = {
    title: { ko: '메인', en: 'Main' },
    description: { ko: '사이트의 메인 페이지입니다.', en: 'Main pages of the site.' },
    items: [
      {
        name: { ko: '홈', en: 'Home' },
        description: { ko: '무료 온라인 도구 모음', en: 'Free online tools' },
        url: '/',
      },
    ],
  };

  const toolsSection: SitemapSection = {
    title: { ko: '도구', en: 'Tools' },
    description: { ko: '무료로 사용 가능한 온라인 도구입니다.', en: 'Free online tools available for use.' },
    items: APPS.map((app) => ({
      name: app.name,
      description: app.desc,
      url: app.url,
    })),
  };

  const infoSection: SitemapSection = {
    title: { ko: '정보', en: 'Information' },
    description: { ko: '사이트 관련 정보 페이지입니다.', en: 'Information pages about the site.' },
    items: [
      { name: { ko: '사이트맵', en: 'Sitemap' }, description: { ko: '사이트의 모든 페이지 목록', en: 'Complete list of all site pages' }, url: '/sitemap' },
      { name: { ko: '오픈소스 라이브러리', en: 'Open Source Libraries' }, description: { ko: '프로젝트에 사용된 오픈소스', en: 'Open source libraries used' }, url: '/opensource' },
      { name: { ko: '사용된 도구', en: 'Tools Used' }, description: { ko: '개발에 사용된 도구', en: 'Tools used in development' }, url: '/tools-used' },
    ],
  };

  return [mainSection, toolsSection, infoSection];
}

const Sitemap = memo(function Sitemap() {
  const { language } = useLanguage();
  const { toLocalizedPath } = useLocalizedPath();
  const sections = buildSitemapSections();

  const getPath = useCallback((path: string) => toLocalizedPath(path), [toLocalizedPath]);

  useSEO({
    title: language === 'ko' ? '사이트맵' : 'Sitemap',
    description: language === 'ko' ? 'Tools 사이트맵' : 'Tools Sitemap',
    canonicalPath: '/sitemap',
  });

  return (
    <PageLayout
      title={language === 'ko' ? '사이트맵' : 'Sitemap'}
      description={language === 'ko' ? 'Tools의 모든 페이지를 한눈에 확인하세요.' : 'View all pages of Tools at a glance.'}
    >
      <div className="sitemap-container">
        {sections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="sitemap-section">
            <h2 className="sitemap-section-title">{section.title[language]}</h2>
            <p className="sitemap-section-desc">{section.description[language]}</p>
            <ul className="sitemap-list">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="sitemap-item">
                  {item.isExternal ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="sitemap-link sitemap-link-external">
                      <span className="sitemap-link-name">{item.name[language]}</span>
                      <span className="sitemap-link-external-icon">↗</span>
                    </a>
                  ) : (
                    <Link to={getPath(item.url)} className="sitemap-link">
                      <span className="sitemap-link-name">{item.name[language]}</span>
                    </Link>
                  )}
                  <p className="sitemap-item-desc">{item.description[language]}</p>
                  <span className="sitemap-item-url">{BRAND.siteUrl}{item.url}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <div className="sitemap-xml-section">
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="sitemap-xml-link">
            {language === 'ko' ? 'XML 사이트맵 보기' : 'View XML Sitemap'}
            <span className="sitemap-xml-icon">↗</span>
          </a>
        </div>
      </div>
    </PageLayout>
  );
});

Sitemap.displayName = 'Sitemap';

export default Sitemap;
