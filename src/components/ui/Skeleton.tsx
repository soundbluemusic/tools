import type { Component } from 'solid-js';
import { For } from 'solid-js';
import { cn } from '../../utils';

interface SkeletonProps {
  /** Width (CSS value) */
  width?: string;
  /** Height (CSS value) */
  height?: string;
  /** Border radius variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional class names */
  class?: string;
}

const VARIANT_CLASSES = {
  text: 'skeleton--text',
  circular: 'skeleton--circular',
  rectangular: 'skeleton--rectangular',
  rounded: 'skeleton--rounded',
} as const;

const ANIMATION_CLASSES = {
  pulse: 'skeleton--pulse',
  wave: 'skeleton--wave',
  none: '',
} as const;

/**
 * Skeleton loading placeholder component
 */
export const Skeleton: Component<SkeletonProps> = (props) => {
  const variant = () => props.variant ?? 'text';
  const animation = () => props.animation ?? 'pulse';
  const variantClass = () => VARIANT_CLASSES[variant()];
  const animationClass = () => ANIMATION_CLASSES[animation()];

  return (
    <div
      class={cn('skeleton', variantClass(), animationClass(), props.class)}
      style={{ width: props.width, height: props.height }}
      aria-hidden="true"
    />
  );
};

interface SkeletonListProps {
  /** Number of skeleton items */
  count?: number;
  /** Item height */
  itemHeight?: string;
}

/**
 * Skeleton list for loading states
 */
export const SkeletonList: Component<SkeletonListProps> = (props) => {
  const count = () => props.count ?? 5;
  const itemHeight = () => props.itemHeight ?? '3.5rem';

  return (
    <div
      class="skeleton-list"
      role="status"
      aria-busy="true"
      aria-label="Loading applications"
    >
      <For each={Array.from({ length: count() })}>
        {(_, i) => (
          <div class="skeleton-item" style={{ height: itemHeight() }}>
            <Skeleton width="60%" height="1.2rem" />
          </div>
        )}
      </For>
    </div>
  );
};
