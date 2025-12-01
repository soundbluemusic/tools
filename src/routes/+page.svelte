<script lang="ts">
  import { loadApps } from '$lib/constants/apps';
  import { language, t } from '$lib/stores';
  import AppList from '$lib/components/AppList.svelte';
  import type { App, SortOption } from '$lib/types';
  import { onMount } from 'svelte';

  let apps: App[] = [];
  let isLoading = true;
  let sortBy: SortOption = 'name-asc';
  let isPending = false;

  // Load apps on mount
  onMount(async () => {
    apps = await loadApps();
    isLoading = false;
  });

  // Sort options with translations
  $: homeT = $t.common.home;
  $: sortOptions = [
    { value: 'name-asc' as const, label: homeT.sort.nameAsc },
    { value: 'name-desc' as const, label: homeT.sort.nameDesc },
    { value: 'name-long' as const, label: homeT.sort.nameLong },
    { value: 'name-short' as const, label: homeT.sort.nameShort },
    { value: 'size-large' as const, label: homeT.sort.sizeLarge },
    { value: 'size-small' as const, label: homeT.sort.sizeSmall },
  ];

  // Sort apps
  function sortApps(apps: readonly App[], sortBy: SortOption, lang: 'ko' | 'en'): readonly App[] {
    const sorted = [...apps];
    const locale = lang === 'ko' ? 'ko' : 'en';

    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name[lang].localeCompare(b.name[lang], locale));
      case 'name-desc':
        return sorted.sort((a, b) => b.name[lang].localeCompare(a.name[lang], locale));
      case 'name-long':
        return sorted.sort((a, b) => b.name[lang].length - a.name[lang].length);
      case 'name-short':
        return sorted.sort((a, b) => a.name[lang].length - b.name[lang].length);
      case 'size-large':
        return sorted.sort((a, b) => b.size - a.size);
      case 'size-small':
        return sorted.sort((a, b) => a.size - b.size);
      default:
        return apps;
    }
  }

  $: sortedApps = sortApps(apps, sortBy, $language);

  function handleSortChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    isPending = true;
    sortBy = target.value as SortOption;
    // Simulate transition
    setTimeout(() => isPending = false, 100);
  }

  $: appListAriaLabel = $language === 'ko' ? '사용 가능한 도구' : 'Available tools';
</script>

<svelte:head>
  <title>Productivity Tools - 생산성 도구</title>
  <meta name="description" content="Useful web utilities and productivity tools. 유용한 웹 유틸리티 및 생산성 도구." />
</svelte:head>

<div class="home-page">
  <!-- Page Header with Controls -->
  <div class="home-header">
    <h1 class="home-title">
      {$language === 'ko' ? '모든 도구' : 'All Tools'}
    </h1>
    <div class="home-controls">
      <!-- Sort Dropdown -->
      <select
        class="sort-dropdown"
        bind:value={sortBy}
        on:change={handleSortChange}
        aria-label={homeT.sortAriaLabel}
      >
        {#each sortOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- App Grid -->
  <AppList
    apps={sortedApps}
    isPending={isPending || isLoading}
    language={$language}
    ariaLabel={appListAriaLabel}
  />

  <!-- No Results Message -->
  {#if sortedApps.length === 0 && !isLoading}
    <p class="no-results">
      {$language === 'ko' ? '도구가 없습니다.' : 'No tools found.'}
    </p>
  {/if}
</div>
