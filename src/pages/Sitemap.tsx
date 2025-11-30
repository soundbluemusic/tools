import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';
import { useSEO } from '../hooks';
import { APPS } from '../constants/apps';
import { BASE_URL, getTodayDate } from '../constants/site';
import './Sitemap.css';

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
  lastModified: string;
}

const pageContent = {
  title: {
    ko: '사이트맵',
    en: 'Sitemap',
  },
  description: {
    ko: 'Productivity Tools의 모든 페이지를 한눈에 확인하세요.',
    en: 'View all pages of Productivity Tools at a glance.',
  },
  seo: {
    ko: {
      description:
        'Productivity Tools 사이트맵 - QR 코드 생성기, 메트로놈 등 모든 무료 온라인 도구와 페이지 목록을 확인하세요.',
      keywords:
        '사이트맵, sitemap, Productivity Tools, 무료 도구, QR코드, 메트로놈, 온라인 도구 목록',
    },
    en: {
      description:
        'Productivity Tools Sitemap - Browse all free online tools including QR code generator, metronome, and more.',
      keywords:
        'sitemap, Productivity Tools, free tools, QR code, metronome, online tools directory',
    },
  },
  sections: {
    main: {
      ko: '메인',
      en: 'Main',
    },
    tools: {
      ko: '도구',
      en: 'Tools',
    },
    information: {
      ko: '정보',
      en: 'Information',
    },
  },
  xmlSitemap: {
    ko: 'XML 사이트맵 보기',
    en: 'View XML Sitemap',
  },
  lastModified: {
    ko: '최종 수정',
    en: 'Last modified',
  },
};

/**
 * Build sitemap sections dynamically from APPS constant
 */
function buildSitemapSections(): SitemapSection[] {
  const today = getTodayDate();

  // Main section
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
          ko: '무료 온라인 생산성 도구 모음 - 모든 도구를 한 곳에서',
          en: 'Free online productivity tools - All tools in one place',
        },
        url: '/',
        lastModified: today,
      },
    ],
  };

  // Tools section - dynamically built from APPS
  const toolsSection: SitemapSection = {
    title: pageContent.sections.tools,
    description: {
      ko: '무료로 사용 가능한 온라인 도구입니다.',
      en: 'Free online tools available for use.',
    },
    items: APPS.map((app) => ({
      name: app.name,
      description: app.desc,
      url: app.url,
      lastModified: today,
    })),
  };

  // Information section
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
        lastModified: today,
      },
      {
        name: { ko: '오픈소스 라이브러리', en: 'Open Source Libraries' },
        description: {
          ko: '프로젝트에 사용된 오픈소스 라이브러리 목록',
          en: 'List of open source libraries used in this project',
        },
        url: '/opensource',
        lastModified: today,
      },
      {
        name: { ko: '사용된 도구', en: 'Tools Used' },
        description: {
          ko: '이 프로젝트 개발에 사용된 도구',
          en: 'Tools used to build this project',
        },
        url: '/tools-used',
        lastModified: today,
      },
    ],
  };

  return [mainSection, toolsSection, infoSection];
}

/**
 * Sitemap Page Component
 * Displays a structured HTML sitemap following major AI site standards
 */
const Sitemap = memo(function Sitemap() {
  const { language } = useLanguage();
  const sections = buildSitemapSections();

  // SEO for Sitemap page
  useSEO({
    title: pageContent.title[language],
    description: pageContent.seo[language].description,
    keywords: pageContent.seo[language].keywords,
    canonicalPath: '/sitemap',
  });

  return (
    <PageLayout
      title={pageContent.title[language]}
      description={pageContent.description[language]}
    >
      <div className="sitemap-container">
        {/* Sitemap Sections */}
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
                    <Link to={item.url} className="sitemap-link">
                      <span className="sitemap-link-name">
                        {item.name[language]}
                      </span>
                    </Link>
                  )}
                  <p className="sitemap-item-desc">
                    {item.description[language]}
                  </p>
                  <span className="sitemap-item-url">{BASE_URL}{item.url}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* XML Sitemap Link */}
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
    </PageLayout>
  );
});

Sitemap.displayName = 'Sitemap';

export default Sitemap;
