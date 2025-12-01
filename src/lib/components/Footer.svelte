<script lang="ts">
  import { t } from '$lib/stores';
</script>

<footer class="footer">
  <nav class="footer-menu">
    <a href="/privacy" class="footer-link">{$t.common.footer.privacy}</a>
    <a href="/terms" class="footer-link">{$t.common.footer.terms}</a>
    <a href="/sitemap" class="footer-link">{$t.common.footer.sitemap}</a>
    <a href="/opensource" class="footer-link">{$t.common.footer.opensource}</a>
    <a href="/tools-used" class="footer-link">{$t.common.footer.toolsUsed}</a>
    <a href="https://github.com/soundbluemusic/tools" target="_blank" rel="noopener noreferrer" class="footer-link">{$t.common.footer.github}</a>
  </nav>
  <p class="footer-copyright">© {new Date().getFullYear()} Productivity Tools</p>
</footer>
