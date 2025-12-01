<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const classes = $derived(
    [
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      fullWidth && 'btn--full-width',
      loading && 'btn--loading',
      className
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<button class={classes} disabled={loading || restProps.disabled} {...restProps}>
  {#if loading}
    <span class="btn-spinner"></span>
  {/if}
  {@render children()}
</button>
