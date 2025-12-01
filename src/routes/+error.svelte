<script lang="ts">
  import { page } from '$app/stores';
  import { language } from '../stores';
  import '../styles/not-found.css';
  import '../styles/tool-page.css';
</script>

<main class="container tool-page">
  <div class="not-found">
    <h1 class="not-found-code">{$page.status}</h1>
    <h2 class="not-found-title">
      {$language === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page not found'}
    </h2>
    <p class="not-found-message">
      {$language === 'ko'
        ? '요청하신 페이지가 존재하지 않거나 이동되었습니다.'
        : 'The requested page does not exist or has been moved.'}
    </p>
    <a href="/" class="not-found-link">
      &larr; {$language === 'ko' ? '홈으로 돌아가기' : 'Return to Home'}
    </a>
  </div>
</main>
