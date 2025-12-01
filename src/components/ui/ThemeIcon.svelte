<script lang="ts">
  import type { Theme, ResolvedTheme } from '../../stores';

  /** Current theme setting */
  export let theme: Theme;
  /** Resolved theme (actual applied theme) */
  export let resolved: ResolvedTheme;
  /** CSS class name for the icon */
  let className: string = 'theme-icon';
  export { className as class };
  /** Icon size (default: 18) */
  export let size: number = 18;
</script>

{#if theme === 'system'}
  <!-- Monitor icon for system mode -->
  <svg
    class={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <rect x="2" y="3" width="20" height="14" rx="2" stroke-width="2" />
    <path stroke-width="2" d="M8 21h8M12 17v4" />
  </svg>
{:else if resolved === 'dark'}
  <!-- Moon icon -->
  <svg
    class={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <path
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
    />
  </svg>
{:else}
  <!-- Sun icon -->
  <svg
    class={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <circle cx="12" cy="12" r="5" stroke-width="2" />
    <path
      stroke-width="2"
      stroke-linecap="round"
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
    />
  </svg>
{/if}
