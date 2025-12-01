<script lang="ts">
  import { cn } from '../../utils';

  /** Width */
  export let width: string = '100%';
  /** Height */
  export let height: string = '1rem';
  /** Border radius */
  export let radius: string = '4px';
  /** Additional class names */
  let className: string = '';
  export { className as class };
</script>

<div
  class={cn('skeleton', className)}
  style="width: {width}; height: {height}; border-radius: {radius};"
  aria-hidden="true"
/>
