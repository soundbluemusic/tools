<script lang="ts">
  import { cn } from '../../utils';

  /** Input type */
  export let type: string = 'text';
  /** Placeholder */
  export let placeholder: string = '';
  /** Value */
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

<input
  {type}
  {id}
  {placeholder}
  {disabled}
  bind:value
  class={cn('input', className)}
  aria-label={ariaLabel || undefined}
  on:input
  on:change
  on:focus
  on:blur
  on:keydown
/>
