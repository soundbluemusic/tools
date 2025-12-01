<script lang="ts">
  import { t, language } from '$lib/stores';
  import { MetronomePlayer } from '$lib/apps/metronome';
</script>

<svelte:head>
  <title>{$t.metronome.seo.title}</title>
  <meta name="description" content={$t.metronome.seo.description} />
  <meta name="keywords" content={$t.metronome.seo.keywords} />
  <link rel="canonical" href="https://tools.soundblue.net/metronome" />
</svelte:head>

<div class="page-layout">
  <!-- Breadcrumb -->
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <a href="/" class="breadcrumb-link">{$language === 'ko' ? '홈' : 'Home'}</a>
      </li>
      <li class="breadcrumb-separator" aria-hidden="true">/</li>
      <li class="breadcrumb-item">
        <a href="/" class="breadcrumb-link">{$language === 'ko' ? '음악 도구' : 'Music Tools'}</a>
      </li>
      <li class="breadcrumb-separator" aria-hidden="true">/</li>
      <li class="breadcrumb-item breadcrumb-current" aria-current="page">
        {$t.metronome.title}
      </li>
    </ol>
  </nav>

  <!-- Page header -->
  <header class="page-header">
    <h1 class="page-title">{$t.metronome.title}</h1>
    <p class="page-description">{$t.metronome.description}</p>
  </header>

  <!-- Main content -->
  <div class="page-content">
    <MetronomePlayer />
  </div>
</div>

<style>
  .page-layout {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-6);
  }

  .breadcrumb {
    font-size: var(--font-size-sm);
  }

  .breadcrumb-list {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    list-style: none;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
  }

  .breadcrumb-link {
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast) var(--ease-default);
  }

  .breadcrumb-link:hover {
    color: var(--color-text-primary);
  }

  .breadcrumb-separator {
    color: var(--color-text-tertiary);
  }

  .breadcrumb-current {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  .page-header {
    margin-bottom: var(--spacing-4);
  }

  .page-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-2) 0;
  }

  .page-description {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .page-content {
    background: var(--color-bg-secondary);
    border-radius: var(--radius-xl);
    padding: var(--spacing-6);
  }

  @media (max-width: 480px) {
    .page-content {
      padding: var(--spacing-4);
    }

    .page-title {
      font-size: var(--font-size-xl);
    }
  }
</style>
