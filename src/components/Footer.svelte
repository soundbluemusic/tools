<script lang="ts">
  import { link } from 'svelte-routing';
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
    <a href="/privacy" use:link class="footer-link">
      {$t.common.footer.privacy}
    </a>
    <a href="/terms" use:link class="footer-link">
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
    <a href="/sitemap" use:link class="footer-link">
      {$t.common.footer.sitemap}
    </a>
    <a href="/opensource" use:link class="footer-link">
      {$t.common.footer.opensource}
    </a>
    <a href="/tools-used" use:link class="footer-link">
      {$t.common.footer.toolsUsed}
    </a>
  </nav>

  <!-- Copyright -->
  <p class="footer-copyright">
    &copy; SoundBlueMusic. MIT License
  </p>
</footer>
