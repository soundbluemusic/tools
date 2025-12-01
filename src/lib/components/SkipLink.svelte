<script lang="ts">
  import { language } from '../stores';
  import './SkipLink.css';

  $: label = $language === 'ko' ? '본문으로 건너뛰기' : 'Skip to main content';
</script>

<a href="#main-content" class="skip-link">
  {label}
</a>
