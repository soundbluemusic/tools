<script lang="ts">
  import { t } from '../stores';
  import ShareButton from './ShareButton.svelte';
</script>

<footer class="footer">
  <!-- Share Button -->
  <div class="footer-share">
    <ShareButton />
  </div>

  <!-- Footer Menu -->
  <nav class="footer-menu" aria-label="Footer navigation">
    <a href="/privacy" class="footer-link">
      {$t.common.footer.privacy}
    </a>
    <a href="/terms" class="footer-link">
      {$t.common.footer.terms}
    </a>
    <a
      href="https://github.com/soundbluemusic/tools"
      class="footer-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {$t.common.footer.github}
    </a>
    <a href="/sitemap" class="footer-link">
      {$t.common.footer.sitemap}
    </a>
    <a href="/opensource" class="footer-link">
      {$t.common.footer.opensource}
    </a>
    <a href="/tools-used" class="footer-link">
      {$t.common.footer.toolsUsed}
    </a>
  </nav>

  <!-- Copyright -->
  <p class="footer-copyright">
    &copy; SoundBlueMusic. MIT License
  </p>
</footer>
