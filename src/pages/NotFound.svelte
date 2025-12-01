<script lang="ts">
  import { link } from 'svelte-routing';
  import '../styles/not-found.css';
  import '../styles/tool-page.css';
</script>

<main class="container tool-page">
  <div class="not-found">
    <h1 class="not-found-code">404</h1>
    <h2 class="not-found-title">페이지를 찾을 수 없습니다</h2>
    <p class="not-found-message">
      요청하신 페이지가 존재하지 않거나 이동되었습니다.
    </p>
    <a href="/" use:link class="not-found-link">
      &larr; 홈으로 돌아가기
    </a>
  </div>
</main>
