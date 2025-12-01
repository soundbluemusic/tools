<script lang="ts">
  import { page } from '$app/stores';
  import { language } from '$lib/stores';

  let status = $derived($page.status);
  let message = $derived($page.error?.message || 'Page not found');
</script>

<svelte:head>
  <title>{status === 404 ? ($language === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page Not Found') : ($language === 'ko' ? '오류' : 'Error')}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="error-page">
  <div class="error-content">
    <h1 class="error-code">{status}</h1>
    <h2 class="error-title">
      {#if status === 404}
        {$language === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page Not Found'}
      {:else}
        {$language === 'ko' ? '오류가 발생했습니다' : 'An Error Occurred'}
      {/if}
    </h2>
    <p class="error-message">
      {#if status === 404}
        {$language === 'ko' ? '요청하신 페이지가 존재하지 않거나 이동되었습니다.' : 'The page you requested does not exist or has been moved.'}
      {:else}
        {message}
      {/if}
    </p>
    <a href="/" class="error-link">
      {$language === 'ko' ? '← 홈으로 돌아가기' : '← Back to Home'}
    </a>
  </div>
</div>

<style>
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: var(--spacing-6);
  }

  .error-content {
    max-width: 480px;
  }

  .error-code {
    font-size: 6rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-tertiary);
    margin: 0 0 var(--spacing-2) 0;
    line-height: 1;
  }

  .error-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-4) 0;
  }

  .error-message {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0 0 var(--spacing-6) 0;
    line-height: var(--line-height-relaxed);
  }

  .error-link {
    display: inline-flex;
    align-items: center;
    padding: var(--spacing-3) var(--spacing-6);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-inverse);
    background: var(--color-text-primary);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: opacity var(--transition-fast) var(--ease-default);
  }

  .error-link:hover {
    opacity: 0.9;
  }

  @media (max-width: 480px) {
    .error-code {
      font-size: 4rem;
    }

    .error-title {
      font-size: var(--font-size-xl);
    }
  }
</style>
