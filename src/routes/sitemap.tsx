import { type Component, For, createMemo } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';
import { useSEO } from '../hooks';
import { APPS, BRAND } from '../constants';
import '../styles/pages/Sitemap.css';

interface MultilingualUrl {
  name: { ko: string; en: string };
  enUrl: string;
  koUrl: string;
}

interface SitemapSection {
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  items: MultilingualUrl[];
}

const pageContent = {
  title: {
    ko: '사이트맵',
    en: 'Sitemap',
  },
  description: {
    ko: 'Tools의 모든 페이지를 한눈에 확인하세요.',
    en: 'View all pages of Tools at a glance.',
  },
  seo: {
    ko: {
      description:
        'Tools 사이트맵 - QR 코드 생성기, 메트로놈 등 모든 무료 온라인 도구와 페이지 목록을 확인하세요.',
      keywords:
        '사이트맵, sitemap, Tools, 무료 도구, QR코드, 메트로놈, 온라인 도구 목록',
    },
    en: {
      description:
        'Tools Sitemap - Browse all free online tools including QR code generator, metronome, and more.',
      keywords:
        'sitemap, Tools, free tools, QR code, metronome, online tools directory',
    },
  },
  sections: {
    main: { ko: '메인', en: 'Main' },
    categories: { ko: '카테고리', en: 'Categories' },
    tools: { ko: '도구', en: 'Tools' },
    information: { ko: '정보', en: 'Information' },
    legal: { ko: '법적 고지', en: 'Legal' },
  },
  urlCount: {
    ko: (count: number) => `이 사이트맵에는 ${count}개의 URL이 있습니다.`,
    en: (count: number) => `This sitemap contains ${count} URLs.`,
  },
  xmlSitemap: {
    ko: 'XML 사이트맵 보기',
    en: 'View XML Sitemap',
  },
};

function buildSitemapSections(): SitemapSection[] {
  const mainSection: SitemapSection = {
    title: pageContent.sections.main,
    description: {
      ko: '사이트의 메인 페이지입니다.',
      en: 'Main pages of the site.',
    },
    items: [
      {
        name: { ko: '홈', en: 'Home' },
        enUrl: `${BRAND.siteUrl}/`,
        koUrl: `${BRAND.siteUrl}/ko/`,
      },
    ],
  };

  const categoriesSection: SitemapSection = {
    title: pageContent.sections.categories,
    description: {
      ko: '도구 카테고리 페이지입니다.',
      en: 'Tool category pages.',
    },
    items: [
      {
        name: { ko: '음악 도구', en: 'Music Tools' },
        enUrl: `${BRAND.siteUrl}/music-tools`,
        koUrl: `${BRAND.siteUrl}/ko/music-tools`,
      },
      {
        name: { ko: '기타 도구', en: 'Other Tools' },
        enUrl: `${BRAND.siteUrl}/other-tools`,
        koUrl: `${BRAND.siteUrl}/ko/other-tools`,
      },
      {
        name: { ko: '통합 도구', en: 'Combined Tools' },
        enUrl: `${BRAND.siteUrl}/combined-tools`,
        koUrl: `${BRAND.siteUrl}/ko/combined-tools`,
      },
    ],
  };

  const toolsSection: SitemapSection = {
    title: pageContent.sections.tools,
    description: {
      ko: '무료로 사용 가능한 온라인 도구입니다.',
      en: 'Free online tools available for use.',
    },
    items: APPS.map((app) => ({
      name: app.name,
      enUrl: `${BRAND.siteUrl}${app.url}`,
      koUrl: `${BRAND.siteUrl}/ko${app.url}`,
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
        enUrl: `${BRAND.siteUrl}/sitemap`,
        koUrl: `${BRAND.siteUrl}/ko/sitemap`,
      },
      {
        name: { ko: '오픈소스', en: 'Open Source' },
        enUrl: `${BRAND.siteUrl}/opensource`,
        koUrl: `${BRAND.siteUrl}/ko/opensource`,
      },
      {
        name: { ko: '사용된 도구', en: 'Tools Used' },
        enUrl: `${BRAND.siteUrl}/tools-used`,
        koUrl: `${BRAND.siteUrl}/ko/tools-used`,
      },
      {
        name: { ko: '다운로드', en: 'Downloads' },
        enUrl: `${BRAND.siteUrl}/downloads`,
        koUrl: `${BRAND.siteUrl}/ko/downloads`,
      },
    ],
  };

  const legalSection: SitemapSection = {
    title: pageContent.sections.legal,
    description: {
      ko: '법적 고지 페이지입니다.',
      en: 'Legal notice pages.',
    },
    items: [
      {
        name: { ko: '개인정보처리방침', en: 'Privacy Policy' },
        enUrl: `${BRAND.siteUrl}/privacy`,
        koUrl: `${BRAND.siteUrl}/ko/privacy`,
      },
      {
        name: { ko: '이용약관', en: 'Terms of Service' },
        enUrl: `${BRAND.siteUrl}/terms`,
        koUrl: `${BRAND.siteUrl}/ko/terms`,
      },
    ],
  };

  return [
    mainSection,
    categoriesSection,
    toolsSection,
    infoSection,
    legalSection,
  ];
}

/**
 * Sitemap Page Component
 * Displays all site URLs with multilingual support (EN/KO grouped together)
 */
const Sitemap: Component = () => {
  const { language } = useLanguage();
  const sections = buildSitemapSections();

  // Calculate total URL count (EN + KO for each item)
  const totalUrlCount = createMemo(() => {
    return sections.reduce((acc, section) => acc + section.items.length * 2, 0);
  });

  useSEO({
    title: pageContent.title[language()],
    description: pageContent.seo[language()].description,
    keywords: pageContent.seo[language()].keywords,
    canonicalPath: '/sitemap',
  });

  return (
    <>
      <Title>{pageContent.title[language()]} | Tools</Title>
      <Meta
        name="description"
        content={pageContent.seo[language()].description}
      />

      <PageLayout
        title={pageContent.title[language()]}
        description={pageContent.description[language()]}
      >
        <div class="sitemap-container">
          {/* URL Count Banner */}
          <div class="sitemap-count-banner">
            {pageContent.urlCount[language()](totalUrlCount())}
          </div>

          <For each={sections}>
            {(section) => (
              <section class="sitemap-section">
                <h2 class="sitemap-section-title">
                  {section.title[language()]}
                </h2>
                <p class="sitemap-section-desc">
                  {section.description[language()]}
                </p>
                <ul class="sitemap-list">
                  <For each={section.items}>
                    {(item) => (
                      <li class="sitemap-item">
                        <span class="sitemap-item-name">
                          {item.name[language()]}
                        </span>
                        <div class="sitemap-urls">
                          <div class="sitemap-url-row">
                            <a
                              href={item.enUrl}
                              class="sitemap-url-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.enUrl}
                            </a>
                            <span class="sitemap-url-arrow">→</span>
                            <span class="sitemap-lang-badge sitemap-lang-en">
                              en
                            </span>
                          </div>
                          <div class="sitemap-url-row">
                            <a
                              href={item.koUrl}
                              class="sitemap-url-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.koUrl}
                            </a>
                            <span class="sitemap-url-arrow">→</span>
                            <span class="sitemap-lang-badge sitemap-lang-ko">
                              ko
                            </span>
                          </div>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              </section>
            )}
          </For>

          <div class="sitemap-xml-section">
            <a
              href="/sitemap_index.xml"
              target="_blank"
              rel="noopener noreferrer"
              class="sitemap-xml-link"
            >
              {pageContent.xmlSitemap[language()]}
              <span class="sitemap-xml-icon">↗</span>
            </a>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default Sitemap;
