<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { language } from '../../stores';
  import type { App } from '../../types';
  import './CommandPalette.css';

  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let apps: App[] = [];

  let query = '';
  let selectedIndex = 0;
  let inputRef: HTMLInputElement;
  let listRef: HTMLDivElement;

  interface QuickAction {
    id: string;
    labelKo: string;
    labelEn: string;
    icon: string;
    action: () => void;
    keywords: string[];
  }

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'home',
      labelKo: '홈으로 이동',
      labelEn: 'Go to Home',
      icon: 'home',
      action: () => goto('/'),
      keywords: ['home', 'main', '홈', '메인'],
    },
    {
      id: 'sitemap',
      labelKo: '사이트맵 보기',
      labelEn: 'View Sitemap',
      icon: 'grid',
      action: () => goto('/sitemap'),
      keywords: ['sitemap', 'all', '사이트맵', '전체'],
    },
  ];

  // Filter results based on query
  $: normalizedQuery = query.toLowerCase().trim();

  $: filteredApps = normalizedQuery
    ? apps.filter((app) => {
        const nameKo = app.name.ko.toLowerCase();
        const nameEn = app.name.en.toLowerCase();
        const descKo = app.desc.ko.toLowerCase();
        const descEn = app.desc.en.toLowerCase();
        return (
          nameKo.includes(normalizedQuery) ||
          nameEn.includes(normalizedQuery) ||
          descKo.includes(normalizedQuery) ||
          descEn.includes(normalizedQuery)
        );
      })
    : apps;

  $: filteredActions = normalizedQuery
    ? quickActions.filter((action) => {
        const labelKo = action.labelKo.toLowerCase();
        const labelEn = action.labelEn.toLowerCase();
        const keywords = action.keywords.join(' ').toLowerCase();
        return (
          labelKo.includes(normalizedQuery) ||
          labelEn.includes(normalizedQuery) ||
          keywords.includes(normalizedQuery)
        );
      })
    : quickActions;

  $: totalResults = filteredApps.length + filteredActions.length;

  // Reset selected index when results change
  $: if (query !== undefined) selectedIndex = 0;

  // Focus input when opened
  $: if (isOpen && inputRef) {
    query = '';
    selectedIndex = 0;
    requestAnimationFrame(() => {
      inputRef?.focus();
    });
  }

  // Scroll selected item into view
  $: if (listRef && selectedIndex >= 0) {
    const items = listRef.querySelectorAll('[data-command-item]');
    const selectedItem = items[selectedIndex] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, totalResults - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex < filteredApps.length) {
          goto(filteredApps[selectedIndex].url);
          onClose();
        } else {
          const actionIndex = selectedIndex - filteredApps.length;
          filteredActions[actionIndex]?.action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }

  function handleItemClick(index: number) {
    if (index < filteredApps.length) {
      goto(filteredApps[index].url);
    } else {
      const actionIndex = index - filteredApps.length;
      filteredActions[actionIndex]?.action();
    }
    onClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  $: t = {
    placeholder: $language === 'ko' ? '검색 또는 명령어...' : 'Search or type a command...',
    tools: $language === 'ko' ? '도구' : 'Tools',
    actions: $language === 'ko' ? '빠른 실행' : 'Quick Actions',
    noResults: $language === 'ko' ? '검색 결과가 없습니다' : 'No results found',
    hint: $language === 'ko' ? '이동하려면 Enter' : 'to navigate',
  };
</script>

{#if isOpen}
  <div
    class="command-palette-backdrop"
    on:click={handleBackdropClick}
    on:keydown={handleKeyDown}
    role="presentation"
  >
    <div
      class="command-palette"
      role="dialog"
      aria-modal="true"
      aria-label={$language === 'ko' ? '명령 팔레트' : 'Command Palette'}
    >
      <!-- Search Input -->
      <div class="command-palette-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          bind:this={inputRef}
          type="text"
          class="command-palette-input"
          placeholder={t.placeholder}
          bind:value={query}
          on:keydown={handleKeyDown}
          aria-label={t.placeholder}
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <kbd class="command-palette-esc">ESC</kbd>
      </div>

      <!-- Results -->
      <div class="command-palette-results" bind:this={listRef}>
        {#if totalResults === 0}
          <div class="command-palette-empty">
            <p>{t.noResults}</p>
          </div>
        {:else}
          <!-- Apps -->
          {#if filteredApps.length > 0}
            <div class="command-palette-section">
              <div class="command-palette-section-label">{t.tools}</div>
              {#each filteredApps as app, index}
                <button
                  data-command-item
                  class="command-palette-item"
                  class:selected={selectedIndex === index}
                  on:click={() => handleItemClick(index)}
                  on:mouseenter={() => selectedIndex = index}
                >
                  <span class="command-palette-item-icon" aria-hidden="true">
                    {app.icon}
                  </span>
                  <div class="command-palette-item-content">
                    <span class="command-palette-item-title">
                      {$language === 'ko' ? app.name.ko : app.name.en}
                    </span>
                    <span class="command-palette-item-desc">
                      {$language === 'ko' ? app.desc.ko : app.desc.en}
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              {/each}
            </div>
          {/if}

          <!-- Quick Actions -->
          {#if filteredActions.length > 0}
            <div class="command-palette-section">
              <div class="command-palette-section-label">{t.actions}</div>
              {#each filteredActions as action, index}
                {@const itemIndex = filteredApps.length + index}
                <button
                  data-command-item
                  class="command-palette-item"
                  class:selected={selectedIndex === itemIndex}
                  on:click={() => handleItemClick(itemIndex)}
                  on:mouseenter={() => selectedIndex = itemIndex}
                >
                  <span class="command-palette-item-icon" aria-hidden="true">
                    {#if action.icon === 'home'}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    {:else if action.icon === 'grid'}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    {/if}
                  </span>
                  <div class="command-palette-item-content">
                    <span class="command-palette-item-title">
                      {$language === 'ko' ? action.labelKo : action.labelEn}
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </div>

      <!-- Footer -->
      <div class="command-palette-footer">
        <div class="command-palette-hint">
          <kbd>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 10 4 15 9 20" />
              <path d="M20 4v7a4 4 0 0 1-4 4H4" />
            </svg>
          </kbd>
          <span>{t.hint}</span>
        </div>
        <div class="command-palette-hint">
          <kbd>↑</kbd>
          <kbd>↓</kbd>
          <span>{$language === 'ko' ? '탐색' : 'navigate'}</span>
        </div>
      </div>
    </div>
  </div>
{/if}
