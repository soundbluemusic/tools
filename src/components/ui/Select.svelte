<script lang="ts">
  import { cn } from '../../utils';

  /** Selected value */
  export let value: string = '';
  /** Disabled state */
  export let disabled: boolean = false;
  /** Additional class names */
  let className: string = '';
  export { className as class };
  /** Aria label */
  export let ariaLabel: string = '';
  /** ID */
  export let id: string = '';
</script>

<select
  {id}
  {disabled}
  bind:value
  class={cn('select', className)}
  aria-label={ariaLabel || undefined}
  on:change
>
  <slot />
</select>
