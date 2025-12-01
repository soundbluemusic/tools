<script lang="ts">
  import { cn } from '../../utils';
  import { SIZE_CLASSES } from '../../utils/sizeClass';

  /** Size variant */
  export let size: 'sm' | 'md' | 'lg' = 'md';
  /** Additional class names */
  let className: string = '';
  export { className as class };
  /** Accessible label */
  export let label: string = 'Loading...';
</script>

<div
  class={cn('loader-spinner', SIZE_CLASSES.loader[size], className)}
  role="status"
  aria-label={label}
>
  <span class="sr-only">{label}</span>
</div>
