import type { Component } from 'solid-js';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

interface LoaderProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  class?: string;
  /** Accessible label */
  label?: string;
}

/**
 * Spinner Loader Component
 */
export const Loader: Component<LoaderProps> = (props) => {
  const size = () => props.size ?? 'md';
  const label = () => props.label ?? 'Loading...';

  return (
    <div
      class={cn('loader-spinner', SIZE_CLASSES.loader[size()], props.class)}
      role="status"
      aria-label={label()}
    >
      <span class="sr-only">{label()}</span>
    </div>
  );
};

interface PageLoaderProps {
  /** Minimum height */
  minHeight?: string;
}

/**
 * Full page loader component
 */
export const PageLoader: Component<PageLoaderProps> = (props) => {
  const minHeight = () => props.minHeight ?? '200px';

  return (
    <div class="page-loader" aria-busy="true" style={{ "min-height": minHeight() }}>
      <Loader size="lg" label="페이지 로딩 중..." />
    </div>
  );
};
