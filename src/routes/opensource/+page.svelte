<script lang="ts">
  import PageLayout from '../../components/layout/PageLayout.svelte';
  import { language } from '../../stores';

  $: title = $language === 'ko' ? '오픈소스 라이브러리' : 'Open Source Libraries';
  $: description = $language === 'ko'
    ? '이 프로젝트에 사용된 오픈소스 라이브러리 목록입니다'
    : 'List of open source libraries used in this project';

  const libraries = [
    { name: 'Svelte', license: 'MIT', url: 'https://svelte.dev/' },
    { name: 'SvelteKit', license: 'MIT', url: 'https://kit.svelte.dev/' },
    { name: 'Vite', license: 'MIT', url: 'https://vitejs.dev/' },
    { name: 'TypeScript', license: 'Apache-2.0', url: 'https://www.typescriptlang.org/' },
    { name: 'QRious', license: 'GPL-3.0', url: 'https://github.com/neocotic/qrious' },
  ];
</script>

<PageLayout {title} {description}>
  <div class="opensource-content">
    <p>
      {$language === 'ko'
        ? '이 프로젝트는 다음 오픈소스 라이브러리를 사용합니다:'
        : 'This project uses the following open source libraries:'}
    </p>
    <ul class="opensource-list">
      {#each libraries as lib}
        <li class="opensource-item">
          <a href={lib.url} target="_blank" rel="noopener noreferrer" class="opensource-link">
            {lib.name}
          </a>
          <span class="opensource-license">({lib.license})</span>
        </li>
      {/each}
    </ul>

    <p style="margin-top: 2rem;">
      {$language === 'ko'
        ? '이 프로젝트 자체도 MIT 라이선스로 공개되어 있습니다.'
        : 'This project itself is also open source under the MIT License.'}
    </p>
    <a
      href="https://github.com/soundbluemusic/tools"
      target="_blank"
      rel="noopener noreferrer"
      class="opensource-github-link"
    >
      GitHub &nearr;
    </a>
  </div>
</PageLayout>

<style>
  .opensource-content {
    max-width: 600px;
  }
  .opensource-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }
  .opensource-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border-primary);
  }
  .opensource-link {
    color: var(--color-text-primary);
    font-weight: 500;
  }
  .opensource-license {
    color: var(--color-text-secondary);
    margin-left: 0.5rem;
    font-size: 0.875rem;
  }
  .opensource-github-link {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--color-bg-tertiary);
    border-radius: 6px;
    color: var(--color-text-primary);
    text-decoration: none;
  }
</style>
