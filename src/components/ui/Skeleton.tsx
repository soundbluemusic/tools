import { memo } from 'react';
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
  className?: string;
}

/**
 * Skeleton loading placeholder component
 */
export const Skeleton = memo<SkeletonProps>(function Skeleton({
  width,
  height,
  variant = 'text',
  animation = 'pulse',
  className,
}) {
  const variantClass = {
    text: 'skeleton--text',
    circular: 'skeleton--circular',
    rectangular: 'skeleton--rectangular',
    rounded: 'skeleton--rounded',
  }[variant];

  const animationClass = {
    pulse: 'skeleton--pulse',
    wave: 'skeleton--wave',
    none: '',
  }[animation];

  return (
    <div
      className={cn('skeleton', variantClass, animationClass, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
});

Skeleton.displayName = 'Skeleton';

interface SkeletonListProps {
  /** Number of skeleton items */
  count?: number;
  /** Item height */
  itemHeight?: string;
}

/**
 * Skeleton list for loading states
 */
export const SkeletonList = memo<SkeletonListProps>(function SkeletonList({
  count = 5,
  itemHeight = '3.5rem',
}) {
  return (
    <div
      className="skeleton-list"
      role="status"
      aria-busy="true"
      aria-label="Loading applications"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="skeleton-item"
          style={{ height: itemHeight }}
        >
          <Skeleton width="60%" height="1.2rem" />
        </div>
      ))}
    </div>
  );
});

SkeletonList.displayName = 'SkeletonList';
