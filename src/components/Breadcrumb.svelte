<script lang="ts">
  import { link } from 'svelte-routing';
  import { language } from '../stores';
  import './Breadcrumb.css';

  interface BreadcrumbItem {
    label: { ko: string; en: string };
    href?: string;
  }

  export let items: BreadcrumbItem[] = [];
</script>

<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol class="breadcrumb-list">
    {#each items as item, index}
      {@const isLast = index === items.length - 1}
      {@const label = item.label[$language]}
      <li class="breadcrumb-item">
        {#if !isLast && item.href}
          <a href={item.href} use:link class="breadcrumb-link">
            {#if index === 0}
              <svg
                class="breadcrumb-home-icon"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="14"
                height="14"
              >
                <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
              </svg>
            {/if}
            <span>{label}</span>
          </a>
          <svg
            class="breadcrumb-separator"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="14"
            height="14"
          >
            <path stroke-width="2" stroke-linecap="round" d="M9 5l7 7-7 7" />
          </svg>
        {:else}
          <span class="breadcrumb-current" aria-current="page">
            {label}
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
