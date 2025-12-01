<script lang="ts">
  import { goto } from '$app/navigation';
  import type { App } from '$lib/types';
  import { language, t } from '$lib/stores';

  interface Props {
    apps: App[];
    onClose: () => void;
  }

  let { apps, onClose }: Props = $props();

  let query = $state('');
  let selectedIndex = $state(0);
  let inputRef: HTMLInputElement;

  const homeItem = {
    id: 0,
    name: { ko: '홈', en: 'Home' },
    desc: { ko: '메인 페이지로 이동', en: 'Go to main page' },
    icon: '🏠',
    url: '/',
    size: 0
  };

  const allItems = $derived([homeItem, ...apps]);

  const filteredItems = $derived(
    query.trim()
      ? allItems.filter((item) => {
          const name = $language === 'ko' ? item.name.ko : item.name.en;
          const desc = $language === 'ko' ? item.desc.ko : item.desc.en;
          const q = query.toLowerCase();
          return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
        })
      : allItems
  );

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredItems[selectedIndex]) {
        navigateTo(filteredItems[selectedIndex].url);
      }
    }
  }

  function navigateTo(url: string) {
    onClose();
    goto(url);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function getItemName(item: typeof allItems[0]): string {
    return $language === 'ko' ? item.name.ko : item.name.en;
  }

  function getItemDesc(item: typeof allItems[0]): string {
    return $language === 'ko' ? item.desc.ko : item.desc.en;
  }

  $effect(() => {
    selectedIndex = 0;
  });

  $effect(() => {
    inputRef?.focus();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="command-palette-backdrop"
  onclick={handleBackdropClick}
>
  <div class="command-palette" role="dialog" aria-modal="true">
    <div class="command-palette-header">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        bind:this={inputRef}
        bind:value={query}
        onkeydown={handleKeydown}
        class="command-palette-input"
        type="text"
        placeholder={$t.common.home.searchPlaceholder}
        autocomplete="off"
      />
      <span class="command-palette-esc">esc</span>
    </div>

    <div class="command-palette-results">
      {#if filteredItems.length === 0}
        <div class="command-palette-empty">
          {$t.common.home.noResults} "{query}"
        </div>
      {:else}
        <div class="command-palette-section">
          <div class="command-palette-section-label">
            {$language === 'ko' ? '도구' : 'Tools'}
          </div>
          {#each filteredItems as item, index (item.id)}
            <button
              class="command-palette-item"
              class:selected={index === selectedIndex}
              onclick={() => navigateTo(item.url)}
              onmouseenter={() => (selectedIndex = index)}
            >
              <span class="command-palette-item-icon">{item.icon}</span>
              <div class="command-palette-item-content">
                <span class="command-palette-item-title">{getItemName(item)}</span>
                <span class="command-palette-item-desc">{getItemDesc(item)}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="command-palette-footer">
      <div class="command-palette-hint">
        <kbd>↑</kbd>
        <kbd>↓</kbd>
        <span>{$language === 'ko' ? '탐색' : 'navigate'}</span>
      </div>
      <div class="command-palette-hint">
        <kbd>↵</kbd>
        <span>{$language === 'ko' ? '선택' : 'select'}</span>
      </div>
      <div class="command-palette-hint">
        <kbd>esc</kbd>
        <span>{$language === 'ko' ? '닫기' : 'close'}</span>
      </div>
    </div>
  </div>
</div>
