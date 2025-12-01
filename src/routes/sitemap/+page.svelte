<script lang="ts">
  import PageLayout from '$lib/components/layout/PageLayout.svelte';
  import { language } from '$lib/stores';
  import { APPS } from '$lib/constants/apps';
  import '$lib/styles/sitemap.css';

  const BASE_URL = 'https://tools.soundbluemusic.com';

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
    title: { ko: '사이트맵', en: 'Sitemap' },
    description: {
      ko: 'Productivity Tools의 모든 페이지를 한눈에 확인하세요.',
      en: 'View all pages of Productivity Tools at a glance.',
    },
    sections: {
      main: { ko: '메인', en: 'Main' },
      tools: { ko: '도구', en: 'Tools' },
      information: { ko: '정보', en: 'Information' },
    },
    xmlSitemap: { ko: 'XML 사이트맵 보기', en: 'View XML Sitemap' },
  };

  function buildSitemapSections(): SitemapSection[] {
    const today = '2025-11-30';

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
          description: { ko: '사이트의 모든 페이지 목록', en: 'Complete list of all site pages' },
          url: '/sitemap',
          lastModified: today,
        },
        {
          name: { ko: '오픈소스 라이브러리', en: 'Open Source Libraries' },
          description: { ko: '프로젝트에 사용된 오픈소스 라이브러리 목록', en: 'List of open source libraries used in this project' },
          url: '/opensource',
          lastModified: today,
        },
        {
          name: { ko: '사용된 도구', en: 'Tools Used' },
          description: { ko: '이 프로젝트 개발에 사용된 도구', en: 'Tools used to build this project' },
          url: '/tools-used',
          lastModified: today,
        },
      ],
    };

    return [mainSection, toolsSection, infoSection];
  }

  $: sections = buildSitemapSections();
</script>

<svelte:head>
  <title>{pageContent.title[$language]} - Productivity Tools</title>
  <meta name="description" content={pageContent.description[$language]} />
</svelte:head>

<PageLayout
  title={pageContent.title[$language]}
  description={pageContent.description[$language]}
>
  <div class="sitemap-container">
    {#each sections as section}
      <section class="sitemap-section">
        <h2 class="sitemap-section-title">{section.title[$language]}</h2>
        <p class="sitemap-section-desc">{section.description[$language]}</p>
        <ul class="sitemap-list">
          {#each section.items as item}
            <li class="sitemap-item">
              {#if item.isExternal}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="sitemap-link sitemap-link-external"
                >
                  <span class="sitemap-link-name">{item.name[$language]}</span>
                  <span class="sitemap-link-external-icon">&nearr;</span>
                </a>
              {:else}
                <a href={item.url} class="sitemap-link">
                  <span class="sitemap-link-name">{item.name[$language]}</span>
                </a>
              {/if}
              <p class="sitemap-item-desc">{item.description[$language]}</p>
              <span class="sitemap-item-url">{BASE_URL}{item.url}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/each}

    <div class="sitemap-xml-section">
      <a
        href="/sitemap.xml"
        target="_blank"
        rel="noopener noreferrer"
        class="sitemap-xml-link"
      >
        {pageContent.xmlSitemap[$language]}
        <span class="sitemap-xml-icon">&nearr;</span>
      </a>
    </div>
  </div>
</PageLayout>
