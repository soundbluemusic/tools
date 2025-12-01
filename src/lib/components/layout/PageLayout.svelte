<script lang="ts">
  import { cn } from '../../utils';
  import Breadcrumb from '../Breadcrumb.svelte';
  import '../../styles/tool-page.css';

  interface BreadcrumbItem {
    label: { ko: string; en: string };
    href?: string;
  }

  /** Page title */
  export let title: string;
  /** Page description */
  export let description: string = '';
  /** Breadcrumb items */
  export let breadcrumb: BreadcrumbItem[] = [];
  /** Additional class names */
  let className: string = '';
  export { className as class };
</script>

<div class={cn('tool-page', className)}>
  <!-- Breadcrumb Navigation -->
  {#if breadcrumb.length > 0}
    <Breadcrumb items={breadcrumb} />
  {/if}

  <header class="tool-header">
    <div class="tool-header-content">
      <h1 class="tool-title">{title}</h1>
      {#if description}
        <p class="tool-desc">{description}</p>
      {/if}
    </div>
    {#if $$slots.actions}
      <div class="tool-actions">
        <slot name="actions" />
      </div>
    {/if}
  </header>

  <div class="tool-content">
    <slot />
  </div>
</div>
