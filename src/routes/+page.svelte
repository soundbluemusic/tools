<script lang="ts">
  import { apps, language, t } from '$lib/stores';
  import type { App, SortOption } from '$lib/types';

  let searchQuery = $state('');
  let sortOption = $state<SortOption>('name-asc');

  const sortOptions = $derived([
    { value: 'name-asc', label: $t.common.home.sort.nameAsc },
    { value: 'name-desc', label: $t.common.home.sort.nameDesc },
    { value: 'name-long', label: $t.common.home.sort.nameLong },
    { value: 'name-short', label: $t.common.home.sort.nameShort },
    { value: 'size-large', label: $t.common.home.sort.sizeLarge },
    { value: 'size-small', label: $t.common.home.sort.sizeSmall }
  ] as const);

  function getAppName(app: App): string {
    return $language === 'ko' ? app.name.ko : app.name.en;
  }

  function getAppDesc(app: App): string {
    return $language === 'ko' ? app.desc.ko : app.desc.en;
  }

  const filteredApps = $derived.by(() => {
    let result = [...$apps];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((app) => {
        const name = getAppName(app).toLowerCase();
        const desc = getAppDesc(app).toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    // Sort
    result.sort((a, b) => {
      const nameA = getAppName(a);
      const nameB = getAppName(b);

      switch (sortOption) {
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'name-long':
          return nameB.length - nameA.length;
        case 'name-short':
          return nameA.length - nameB.length;
        case 'size-large':
          return b.size - a.size;
        case 'size-small':
          return a.size - b.size;
        default:
          return 0;
      }
    });

    return result;
  });

  function clearSearch() {
    searchQuery = '';
  }
</script>

<svelte:head>
  <title>Productivity Tools</title>
  <meta name="description" content="A collection of useful productivity tools" />
</svelte:head>

<div class="home-page">
  <div class="home-header">
    <h1 class="home-title">
      {$language === 'ko' ? '생산성 도구' : 'Productivity Tools'}
    </h1>
    <div class="home-controls">
      <div class="search-container">
        <input
          type="search"
          class="search-input"
          placeholder={$t.common.home.searchPlaceholder}
          aria-label={$t.common.home.searchAriaLabel}
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <button
            class="search-clear"
            onclick={clearSearch}
            aria-label={$t.common.home.clearSearchAriaLabel}
          >
            ×
          </button>
        {/if}
      </div>
      <select
        class="sort-dropdown"
        aria-label={$t.common.home.sortAriaLabel}
        bind:value={sortOption}
      >
        {#each sortOptions as option (option.value)}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if filteredApps.length === 0}
    <div class="no-results">
      {$t.common.home.noResults} "{searchQuery}"
    </div>
  {:else}
    <div class="app-list">
      {#each filteredApps as app (app.id)}
        <a href={app.url} class="app-item" data-sveltekit-preload-data="hover">
          <span class="app-item-text">
            {app.icon} {getAppName(app)}
          </span>
        </a>
      {/each}
    </div>
  {/if}
</div>
