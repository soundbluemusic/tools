<script lang="ts">
  import { cn } from '../../utils';

  /** Button variant */
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  /** Button size */
  export let size: 'sm' | 'md' | 'lg' = 'md';
  /** Disabled state */
  export let disabled: boolean = false;
  /** Button type */
  export let type: 'button' | 'submit' | 'reset' = 'button';
  /** Additional class names */
  let className: string = '';
  export { className as class };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };
</script>

<button
  {type}
  {disabled}
  class={cn('btn', variantClasses[variant], sizeClasses[size], className)}
  on:click
>
  <slot />
</button>
