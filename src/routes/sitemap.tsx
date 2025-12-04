import { type Component, For, Show } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';
import { useSEO, useLocalizedPath } from '../hooks';
import { APPS, BRAND } from '../constants';
import '../styles/pages/Sitemap.css';

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
    tools: { ko: '도구', en: 'Tools' },
    information: { ko: '정보', en: 'Information' },
  },
  xmlSitemap: {
    ko: 'XML 사이트맵 보기',
    en: 'View XML Sitemap',
  },
};

function buildSitemapSections(): SitemapSection[] {
  const today = '2025-12-04';

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
        lastModified: today,
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
      description: app.desc,
      url: app.url,
      lastModified: today,
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
 */
const Sitemap: Component = () => {
  const { language } = useLanguage();
  const { toLocalizedPath } = useLocalizedPath();
  const sections = buildSitemapSections();

  const getPath = (path: string) => toLocalizedPath(path);

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
                        <Show
                          when={!item.isExternal}
                          fallback={
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="sitemap-link sitemap-link-external"
                            >
                              <span class="sitemap-link-name">
                                {item.name[language()]}
                              </span>
                              <span class="sitemap-link-external-icon">↗</span>
                            </a>
                          }
                        >
                          <A href={getPath(item.url)} class="sitemap-link">
                            <span class="sitemap-link-name">
                              {item.name[language()]}
                            </span>
                          </A>
                        </Show>
                        <p class="sitemap-item-desc">
                          {item.description[language()]}
                        </p>
                        <span class="sitemap-item-url">
                          {BRAND.siteUrl}
                          {item.url}
                        </span>
                      </li>
                    )}
                  </For>
                </ul>
              </section>
            )}
          </For>

          <div class="sitemap-xml-section">
            <a
              href="/sitemap.xml"
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
