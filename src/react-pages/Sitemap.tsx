/**
 * Sitemap Page Component (Astro Version)
 */
import { memo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import type { Language } from '../i18n/types';
import type { App } from '../types';
import { BRAND } from '../constants/brand';
import '../pages/_Sitemap.css';

interface SitemapPageProps {
  language: Language;
  apps: App[];
}

interface SitemapSection {
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  items: SitemapItem[];
}

interface SitemapItem {
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  url: string;
  isExternal?: boolean;
}

const pageContent = {
  title: { ko: '사이트맵', en: 'Sitemap' },
  description: {
    ko: 'Tools의 모든 페이지를 한눈에 확인하세요.',
    en: 'View all pages of Tools at a glance.',
  },
  sections: {
    main: { ko: '메인', en: 'Main' },
    tools: { ko: '도구', en: 'Tools' },
    information: { ko: '정보', en: 'Information' },
  },
  xmlSitemap: { ko: 'XML 사이트맵 보기', en: 'View XML Sitemap' },
};

function buildSitemapSections(apps: App[]): SitemapSection[] {
  const mainSection: SitemapSection = {
    title: pageContent.sections.main,
    description: {
      ko: '사이트의 메인 페이지입니다.',
      en: 'Main pages of the site.',
    },
    items: [
      {
        name: { ko: '홈', en: 'Home' },
        description: {
          ko: '무료 온라인 도구 모음 - 모든 도구를 한 곳에서',
          en: 'Free online tools - All tools in one place',
        },
        url: '/',
      },
    ],
  };

  const toolsSection: SitemapSection = {
    title: pageContent.sections.tools,
    description: {
      ko: '무료로 사용 가능한 온라인 도구입니다.',
      en: 'Free online tools available for use.',
    },
    items: apps.map((app) => ({
      name: app.name,
      description: app.desc,
      url: app.url,
    })),
  };

  const infoSection: SitemapSection = {
    title: pageContent.sections.information,
    description: {
      ko: '사이트 관련 정보 페이지입니다.',
      en: 'Information pages about the site.',
    },
    items: [
      {
        name: { ko: '사이트맵', en: 'Sitemap' },
        description: {
          ko: '사이트의 모든 페이지 목록',
          en: 'Complete list of all site pages',
        },
        url: '/sitemap',
      },
      {
        name: { ko: '오픈소스 라이브러리', en: 'Open Source Libraries' },
        description: {
          ko: '프로젝트에 사용된 오픈소스 라이브러리 목록',
          en: 'List of open source libraries used in this project',
        },
        url: '/opensource',
      },
      {
        name: { ko: '사용된 도구', en: 'Tools Used' },
        description: {
          ko: '이 프로젝트 개발에 사용된 도구',
          en: 'Tools used to build this project',
        },
        url: '/tools-used',
      },
    ],
  };

  return [mainSection, toolsSection, infoSection];
}

const SitemapPage = memo(function SitemapPage({
  language,
  apps,
}: SitemapPageProps) {
  const sections = buildSitemapSections(apps);

  const getPath = (path: string) => {
    if (language === 'ko') {
      return path === '/' ? '/ko' : `/ko${path}`;
    }
    return path;
  };

  return (
    <PageLayoutAstro
      title={pageContent.title[language]}
      description={pageContent.description[language]}
      language={language}
    >
      <div className="sitemap-container">
        {sections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="sitemap-section">
            <h2 className="sitemap-section-title">{section.title[language]}</h2>
            <p className="sitemap-section-desc">
              {section.description[language]}
            </p>
            <ul className="sitemap-list">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="sitemap-item">
                  {item.isExternal ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sitemap-link sitemap-link-external"
                    >
                      <span className="sitemap-link-name">
                        {item.name[language]}
                      </span>
                      <span className="sitemap-link-external-icon">↗</span>
                    </a>
                  ) : (
                    <a href={getPath(item.url)} className="sitemap-link">
                      <span className="sitemap-link-name">
                        {item.name[language]}
                      </span>
                    </a>
                  )}
                  <p className="sitemap-item-desc">
                    {item.description[language]}
                  </p>
                  <span className="sitemap-item-url">
                    {BRAND.siteUrl}
                    {item.url}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="sitemap-xml-section">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="sitemap-xml-link"
          >
            {pageContent.xmlSitemap[language]}
            <span className="sitemap-xml-icon">↗</span>
          </a>
        </div>
      </div>
    </PageLayoutAstro>
  );
});

SitemapPage.displayName = 'SitemapPage';

export default SitemapPage;
