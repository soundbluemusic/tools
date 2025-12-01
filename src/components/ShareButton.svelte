<script lang="ts">
  import { t } from '../stores';
  import { cn, copyToClipboard } from '../utils';

  /** URL to share (defaults to current page) */
  export let url: string = '';
  /** Title for sharing */
  export let title: string = '';
  /** Description for sharing */
  export let description: string = '';
  /** Additional class names */
  let className: string = '';
  export { className as class };
  /** Compact mode - show only icon */
  export let compact: boolean = false;

  let isOpen = false;
  let copied = false;
  let containerRef: HTMLDivElement;
  let buttonRef: HTMLButtonElement;

  $: shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  $: shareTitle = title || (typeof document !== 'undefined' ? document.title : '');
  $: shareText = description || shareTitle;

  function handleToggle() {
    isOpen = !isOpen;
    if (!isOpen) copied = false;
  }

  async function handleCopyLink() {
    await copyToClipboard(shareUrl);
    copied = true;
    setTimeout(() => {
      copied = false;
      isOpen = false;
    }, 1500);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        isOpen = false;
      } catch {
        // User cancelled or error
      }
    }
  }

  function handleShareClick(shareLink: string) {
    window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=400');
    isOpen = false;
  }

  function handleClickOutside(e: MouseEvent) {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      isOpen = false;
    }
  }

  $: if (typeof document !== 'undefined') {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  }

  // Social share URLs
  $: shareLinks = [
    {
      name: 'X',
      label: $t.common.share.twitter,
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: 'Facebook',
      label: $t.common.share.facebook,
      icon: 'f',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      label: $t.common.share.linkedin,
      icon: 'in',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      label: $t.common.share.whatsapp,
      icon: '💬',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
    },
    {
      name: 'Telegram',
      label: $t.common.share.telegram,
      icon: '✈',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
  ];

  $: hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
</script>

<div bind:this={containerRef} class={cn('share-button-container', className)}>
  <button
    bind:this={buttonRef}
    type="button"
    class={cn('share-button', compact && 'share-button--compact')}
    on:click={handleToggle}
    aria-expanded={isOpen}
    aria-haspopup="true"
    aria-label={$t.common.share.button}
  >
    <span class="share-button-icon" aria-hidden="true">↗</span>
    {#if !compact}
      <span class="share-button-text">{$t.common.share.button}</span>
    {/if}
  </button>

  {#if isOpen}
    <div class="share-dropdown" role="menu" aria-label={$t.common.share.button}>
      <!-- Copy Link -->
      <button
        type="button"
        class={cn('share-dropdown-item', copied && 'share-dropdown-item--success')}
        on:click={handleCopyLink}
        role="menuitem"
      >
        <span class="share-item-icon" aria-hidden="true">
          {copied ? '✓' : '🔗'}
        </span>
        <span class="share-item-label">
          {copied ? $t.common.share.copied : $t.common.share.copyLink}
        </span>
      </button>

      <!-- Native Share (mobile) -->
      {#if hasNativeShare}
        <button
          type="button"
          class="share-dropdown-item"
          on:click={handleNativeShare}
          role="menuitem"
        >
          <span class="share-item-icon" aria-hidden="true">📤</span>
          <span class="share-item-label">{$t.common.share.more}</span>
        </button>
      {/if}

      <div class="share-dropdown-divider" role="separator"></div>

      <!-- Social Share Links -->
      {#each shareLinks as shareLink}
        <button
          type="button"
          class="share-dropdown-item"
          on:click={() => handleShareClick(shareLink.url)}
          role="menuitem"
        >
          <span class="share-item-icon" aria-hidden="true">{shareLink.icon}</span>
          <span class="share-item-label">{shareLink.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
