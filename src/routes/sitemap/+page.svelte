<script lang="ts">
  import { language } from '$lib/stores';
  import { apps } from '$lib/stores/apps';

  const BASE_URL = 'https://tools.soundblue.net';

  interface SitemapItem {
    name: { ko: string; en: string };
    description: { ko: string; en: string };
    url: string;
    isExternal?: boolean;
    lastModified: string;
  }

  interface SitemapSection {
    title: { ko: string; en: string };
    description: { ko: string; en: string };
    items: SitemapItem[];
  }

  const pageContent = {
    title: { ko: '사이트맵', en: 'Sitemap' },
    description: {
      ko: 'Productivity Tools의 모든 페이지를 한눈에 확인하세요.',
      en: 'View all pages of Productivity Tools at a glance.',
    },
    seo: {
      ko: {
        description: 'Productivity Tools 사이트맵 - QR 코드 생성기, 메트로놈 등 모든 무료 온라인 도구와 페이지 목록을 확인하세요.',
        keywords: '사이트맵, sitemap, Productivity Tools, 무료 도구, QR코드, 메트로놈, 온라인 도구 목록',
      },
      en: {
        description: 'Productivity Tools Sitemap - Browse all free online tools including QR code generator, metronome, and more.',
        keywords: 'sitemap, Productivity Tools, free tools, QR code, metronome, online tools directory',
      },
    },
    sections: { main: { ko: '메인', en: 'Main' }, tools: { ko: '도구', en: 'Tools' }, information: { ko: '정보', en: 'Information' } },
    xmlSitemap: { ko: 'XML 사이트맵 보기', en: 'View XML Sitemap' },
  };

  const today = new Date().toISOString().split('T')[0];

  let sections = $derived<SitemapSection[]>([
    {
      title: pageContent.sections.main,
      description: { ko: '사이트의 메인 페이지입니다.', en: 'Main pages of the site.' },
      items: [
        {
          name: { ko: '홈', en: 'Home' },
          description: { ko: '무료 온라인 생산성 도구 모음 - 모든 도구를 한 곳에서', en: 'Free online productivity tools - All tools in one place' },
          url: '/',
          lastModified: today,
        },
      ],
    },
    {
      title: pageContent.sections.tools,
      description: { ko: '무료로 사용 가능한 온라인 도구입니다.', en: 'Free online tools available for use.' },
      items: $apps.map((app) => ({
        name: app.name,
        description: app.desc,
        url: app.url,
        lastModified: today,
      })),
    },
    {
      title: pageContent.sections.information,
      description: { ko: '사이트 관련 정보 페이지입니다.', en: 'Information pages about the site.' },
      items: [
        { name: { ko: '사이트맵', en: 'Sitemap' }, description: { ko: '사이트의 모든 페이지 목록', en: 'Complete list of all site pages' }, url: '/sitemap', lastModified: today },
        { name: { ko: '오픈소스 라이브러리', en: 'Open Source Libraries' }, description: { ko: '프로젝트에 사용된 오픈소스 라이브러리 목록', en: 'List of open source libraries used in this project' }, url: '/opensource', lastModified: today },
        { name: { ko: '사용된 도구', en: 'Tools Used' }, description: { ko: '이 프로젝트 개발에 사용된 도구', en: 'Tools used to build this project' }, url: '/tools-used', lastModified: today },
      ],
    },
  ]);
</script>

<svelte:head>
  <title>{pageContent.title[$language]}</title>
  <meta name="description" content={pageContent.seo[$language].description} />
  <meta name="keywords" content={pageContent.seo[$language].keywords} />
  <link rel="canonical" href="{BASE_URL}/sitemap" />
</svelte:head>

<div class="page-layout">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item"><a href="/" class="breadcrumb-link">{$language === 'ko' ? '홈' : 'Home'}</a></li>
      <li class="breadcrumb-separator" aria-hidden="true">/</li>
      <li class="breadcrumb-item breadcrumb-current" aria-current="page">{pageContent.title[$language]}</li>
    </ol>
  </nav>

  <header class="page-header">
    <h1 class="page-title">{pageContent.title[$language]}</h1>
    <p class="page-description">{pageContent.description[$language]}</p>
  </header>

  <div class="page-content">
    <div class="sitemap-container">
      {#each sections as section}
        <section class="sitemap-section">
          <h2 class="sitemap-section-title">{section.title[$language]}</h2>
          <p class="sitemap-section-desc">{section.description[$language]}</p>
          <ul class="sitemap-list">
            {#each section.items as item}
              <li class="sitemap-item">
                {#if item.isExternal}
                  <a href={item.url} target="_blank" rel="noopener noreferrer" class="sitemap-link sitemap-link-external">
                    <span class="sitemap-link-name">{item.name[$language]}</span>
                    <span class="sitemap-link-external-icon">↗</span>
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
        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" class="sitemap-xml-link">
          {pageContent.xmlSitemap[$language]}
          <span class="sitemap-xml-icon">↗</span>
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  .page-layout { display: flex; flex-direction: column; gap: var(--spacing-6); }
  .breadcrumb { font-size: var(--font-size-sm); }
  .breadcrumb-list { display: flex; align-items: center; gap: var(--spacing-2); list-style: none; margin: 0; padding: 0; flex-wrap: wrap; }
  .breadcrumb-link { color: var(--color-text-secondary); text-decoration: none; transition: color var(--transition-fast) var(--ease-default); }
  .breadcrumb-link:hover { color: var(--color-text-primary); }
  .breadcrumb-separator { color: var(--color-text-tertiary); }
  .breadcrumb-current { color: var(--color-text-primary); font-weight: var(--font-weight-medium); }
  .page-header { margin-bottom: var(--spacing-4); }
  .page-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: 0 0 var(--spacing-2) 0; }
  .page-description { font-size: var(--font-size-base); color: var(--color-text-secondary); margin: 0; }
  .page-content { background: var(--color-bg-secondary); border-radius: var(--radius-xl); padding: var(--spacing-6); }
  @media (max-width: 480px) { .page-content { padding: var(--spacing-4); } .page-title { font-size: var(--font-size-xl); } }
</style>
