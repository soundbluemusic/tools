import { type JSX, type Component, Show, splitProps } from 'solid-js';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

export interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width input */
  fullWidth?: boolean;
  /** Error state */
  error?: boolean;
  /** Start adornment */
  startAdornment?: JSX.Element;
  /** End adornment */
  endAdornment?: JSX.Element;
  /** Container class name */
  containerClass?: string;
  /** Reference to input element */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
}

/**
 * Input component with variants and adornments
 */
export const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'size',
    'fullWidth',
    'error',
    'startAdornment',
    'endAdornment',
    'class',
    'containerClass',
    'disabled',
    'ref',
  ]);

  const size = () => local.size ?? 'md';
  const fullWidth = () => local.fullWidth ?? false;
  const error = () => local.error ?? false;
  const sizeClass = () => SIZE_CLASSES.input[size()];

  return (
    <div
      class={cn(
        'input-container',
        fullWidth() && 'input-container--full-width',
        local.containerClass
      )}
    >
      <Show when={local.startAdornment}>
        <span class="input-adornment input-adornment--start">
          {local.startAdornment}
        </span>
      </Show>
      <input
        ref={local.ref}
        class={cn(
          'input',
          sizeClass(),
          error() && 'input--error',
          local.disabled && 'input--disabled',
          !!local.startAdornment && 'input--with-start-adornment',
          !!local.endAdornment && 'input--with-end-adornment',
          local.class
        )}
        disabled={local.disabled}
        {...others}
      />
      <Show when={local.endAdornment}>
        <span class="input-adornment input-adornment--end">
          {local.endAdornment}
        </span>
      </Show>
    </div>
  );
};
