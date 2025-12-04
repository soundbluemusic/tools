import { type JSX, type Component, Show, For, splitProps } from 'solid-js';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string>
  extends Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select options */
  options: readonly SelectOption<T>[];
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width select */
  fullWidth?: boolean;
  /** Error state */
  error?: boolean;
  /** Reference to select element */
  ref?: HTMLSelectElement | ((el: HTMLSelectElement) => void);
}

/**
 * Select component with variants
 */
export const Select: Component<SelectProps> = (props) => {
  const [local, others] = splitProps(props, [
    'options',
    'placeholder',
    'size',
    'fullWidth',
    'error',
    'class',
    'disabled',
    'ref',
  ]);

  const size = () => local.size ?? 'md';
  const fullWidth = () => local.fullWidth ?? false;
  const error = () => local.error ?? false;
  const sizeClass = () => SIZE_CLASSES.select[size()];

  return (
    <select
      ref={local.ref}
      class={cn(
        'select',
        sizeClass(),
        fullWidth() && 'select--full-width',
        error() && 'select--error',
        local.disabled && 'select--disabled',
        local.class
      )}
      disabled={local.disabled}
      {...others}
    >
      <Show when={local.placeholder}>
        <option value="" disabled>
          {local.placeholder}
        </option>
      </Show>
      <For each={local.options}>
        {(option) => (
          <option value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        )}
      </For>
    </select>
  );
};
