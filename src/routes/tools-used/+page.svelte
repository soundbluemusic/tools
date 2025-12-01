<script lang="ts">
  import PageLayout from '../../components/layout/PageLayout.svelte';
  import { language } from '../../stores';

  $: title = $language === 'ko' ? '사용된 도구' : 'Tools Used';
  $: description = $language === 'ko'
    ? '이 프로젝트를 개발하는 데 사용된 도구들입니다'
    : 'Tools used to develop this project';

  const tools = [
    { name: 'VS Code', category: 'Editor', url: 'https://code.visualstudio.com/' },
    { name: 'Svelte', category: 'Framework', url: 'https://svelte.dev/' },
    { name: 'SvelteKit', category: 'Framework', url: 'https://kit.svelte.dev/' },
    { name: 'Vite', category: 'Build Tool', url: 'https://vitejs.dev/' },
    { name: 'TypeScript', category: 'Language', url: 'https://www.typescriptlang.org/' },
    { name: 'Cloudflare Pages', category: 'Hosting', url: 'https://pages.cloudflare.com/' },
    { name: 'GitHub', category: 'Version Control', url: 'https://github.com/' },
    { name: 'Prettier', category: 'Formatter', url: 'https://prettier.io/' },
    { name: 'ESLint', category: 'Linter', url: 'https://eslint.org/' },
    { name: 'Vitest', category: 'Testing', url: 'https://vitest.dev/' },
    { name: 'Playwright', category: 'E2E Testing', url: 'https://playwright.dev/' },
  ];

  const categoryLabels: Record<string, { ko: string; en: string }> = {
    'Editor': { ko: '에디터', en: 'Editor' },
    'Framework': { ko: '프레임워크', en: 'Framework' },
    'Build Tool': { ko: '빌드 도구', en: 'Build Tool' },
    'Language': { ko: '언어', en: 'Language' },
    'Hosting': { ko: '호스팅', en: 'Hosting' },
    'Version Control': { ko: '버전 관리', en: 'Version Control' },
    'Formatter': { ko: '포매터', en: 'Formatter' },
    'Linter': { ko: '린터', en: 'Linter' },
    'Testing': { ko: '테스팅', en: 'Testing' },
    'E2E Testing': { ko: 'E2E 테스팅', en: 'E2E Testing' },
  };
</script>

<PageLayout {title} {description}>
  <div class="tools-used-content">
    <ul class="tools-used-list">
      {#each tools as tool}
        <li class="tools-used-item">
          <a href={tool.url} target="_blank" rel="noopener noreferrer" class="tools-used-link">
            {tool.name}
          </a>
          <span class="tools-used-category">
            {categoryLabels[tool.category]?.[$language] || tool.category}
          </span>
        </li>
      {/each}
    </ul>
  </div>
</PageLayout>

<style>
  .tools-used-content {
    max-width: 600px;
  }
  .tools-used-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .tools-used-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border-primary);
  }
  .tools-used-link {
    color: var(--color-text-primary);
    font-weight: 500;
    text-decoration: none;
  }
  .tools-used-link:hover {
    text-decoration: underline;
  }
  .tools-used-category {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    background: var(--color-bg-tertiary);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
</style>
