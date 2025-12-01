<script lang="ts">
  import { language } from '$lib/stores';

  const toolsUsed = [
    { name: 'Claude Code', url: 'https://docs.anthropic.com/en/docs/claude-code', desc: { ko: 'AI 기반 개발 도구', en: 'AI-powered development tool' } },
    { name: 'Claude Artifacts', url: 'https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them', desc: { ko: 'AI 기반 콘텐츠 생성 도구', en: 'AI-powered content creation tool' } },
  ];

  const title = $derived($language === 'ko' ? '사용된 도구' : 'Tools Used');
  const description = $derived($language === 'ko' ? '이 프로젝트는 Claude Code와 Claude Artifacts를 활용하여 개발되었습니다.' : 'This project was built with Claude Code and Claude Artifacts.');
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content="noindex" />
  <link rel="canonical" href="https://tools.soundblue.net/tools-used" />
</svelte:head>

<div class="page-layout">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item"><a href="/" class="breadcrumb-link">{$language === 'ko' ? '홈' : 'Home'}</a></li>
      <li class="breadcrumb-separator" aria-hidden="true">/</li>
      <li class="breadcrumb-item breadcrumb-current" aria-current="page">{title}</li>
    </ol>
  </nav>

  <header class="page-header">
    <h1 class="page-title">{title}</h1>
    <p class="page-description">{description}</p>
  </header>

  <div class="page-content">
    <ul class="opensource-list">
      {#each toolsUsed as tool}
        <li class="opensource-item">
          <a href={tool.url} target="_blank" rel="noopener noreferrer" class="opensource-name">{tool.name}</a>
          <p class="opensource-desc">{tool.desc[$language]}</p>
        </li>
      {/each}
    </ul>
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
